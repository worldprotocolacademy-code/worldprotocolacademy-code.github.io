#!/usr/bin/env python3
"""Run v3 planning/staging with stable pagination and direct fail-closed S3 I/O for staging keys."""
import hashlib
import os
import sys
import tempfile
from pathlib import Path

from botocore.exceptions import BotoCoreError, ClientError

import ai_search_zero_state_v3 as stage
import ai_search_zero_state_v3_runner as runner

S3_PUT_ATTEMPTS = int(os.getenv('R2_S3_PUT_ATTEMPTS', '4'))
S3_PUT_BACKOFF = int(os.getenv('R2_S3_PUT_BACKOFF', '10'))
ORIGINAL_SOURCE_GET = stage.CF.get
ORIGINAL_S3_CLIENT = runner.s3_client
S3_CLIENT_CACHE = {}


def is_staging_key(key):
    return key.startswith(stage.ROOT + '/')


def validate_staging_target(key):
    if not is_staging_key(key):
        raise RuntimeError(f'refusing S3 PUT outside isolated v3 staging prefix: {key}')


def cached_s3_client(cf, token):
    cache_key = (cf.a, hashlib.sha256(token.encode('utf-8')).hexdigest())
    client = S3_CLIENT_CACHE.get(cache_key)
    if client is None:
        client = ORIGINAL_S3_CLIENT(cf, token)
        S3_CLIENT_CACHE[cache_key] = client
        print('ROUTE: initialized cached R2 S3 client for v3 staging I/O', flush=True)
    return client


def direct_staging_get(self, key, destination, allow_missing=False):
    if not is_staging_key(key):
        return ORIGINAL_SOURCE_GET(self, key, destination, allow_missing=allow_missing)
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    print(f'ROUTE: direct R2 S3 GET for isolated v3 staging key {key}', flush=True)
    found = runner.s3_get(self, key, destination)
    if not found and allow_missing:
        return False
    if not found:
        raise RuntimeError(f'R2 staging object missing during direct S3 GET: {key}')
    return True


def s3_put(cf, key, source, content_type):
    validate_staging_target(key)
    token = os.environ.get('CLOUDFLARE_API_TOKEN', '')
    if not token:
        raise RuntimeError('CLOUDFLARE_API_TOKEN is required for R2 S3 PUT')
    source = Path(source)
    expected = source.stat().st_size
    if expected <= 0:
        raise RuntimeError(f'refusing empty R2 S3 PUT for {key}')
    client = runner.s3_client(cf, token)
    last_error = None
    for attempt in range(1, S3_PUT_ATTEMPTS + 1):
        try:
            print(f'FALLBACK: R2 S3 PUT attempt {attempt}/{S3_PUT_ATTEMPTS} for {key}', flush=True)
            with source.open('rb') as body:
                response = client.put_object(
                    Bucket=cf.b,
                    Key=key,
                    Body=body,
                    ContentType=content_type,
                    ContentLength=expected,
                )
            head = client.head_object(Bucket=cf.b, Key=key)
            actual = int(head.get('ContentLength', -1))
            if actual != expected:
                raise RuntimeError(f'R2 S3 PUT length mismatch: expected={expected} actual={actual}')
            etag = str(head.get('ETag') or response.get('ETag') or '').strip('"')
            if not etag:
                raise RuntimeError('R2 S3 PUT returned no ETag')
            print(f'FALLBACK: R2 S3 PUT complete bytes={actual} etag={etag} key={key}', flush=True)
            return True
        except ClientError as exc:
            code = str(exc.response.get('Error', {}).get('Code', ''))
            status = exc.response.get('ResponseMetadata', {}).get('HTTPStatusCode')
            if status in (401, 403) or code in {'AccessDenied', 'InvalidAccessKeyId', 'SignatureDoesNotMatch'}:
                raise RuntimeError(f'permanent R2 S3 PUT authentication/authorization failure for {key}: {code or status}') from exc
            last_error = exc
        except (BotoCoreError, OSError, ValueError, RuntimeError) as exc:
            last_error = exc
        if attempt < S3_PUT_ATTEMPTS:
            delay = min(60, S3_PUT_BACKOFF * attempt)
            print(f'WARNING: R2 S3 PUT attempt {attempt}/{S3_PUT_ATTEMPTS} failed; retrying in {delay}s; reason={last_error}', flush=True)
            stage.time.sleep(delay)
    raise RuntimeError(f'R2 S3 PUT failed after {S3_PUT_ATTEMPTS} attempts for {key}: {last_error}')


def direct_staging_put(self, key, source, content_type):
    validate_staging_target(key)
    print(f'ROUTE: direct R2 S3 PUT for isolated v3 staging key {key}', flush=True)
    return s3_put(self, key, source, content_type)


def io_self_test():
    class FakeClient:
        def __init__(self, corrupt=False):
            self.data = {}
            self.corrupt = corrupt
        def put_object(self, **kwargs):
            data = kwargs['Body'].read()
            if len(data) != kwargs['ContentLength']:
                raise AssertionError('ContentLength mismatch in fake upload')
            self.data[(kwargs['Bucket'], kwargs['Key'])] = data
            return {'ETag': 'abc123'}
        def head_object(self, **kwargs):
            size = len(self.data[(kwargs['Bucket'], kwargs['Key'])])
            return {'ContentLength': size + (1 if self.corrupt else 0), 'ETag': 'abc123'}

    with tempfile.TemporaryDirectory() as td:
        source = Path(td) / 'part.pdf'
        source.write_bytes(b'%PDF-1.5\nWPA')
        staging_key = stage.ROOT + '/test/part.pdf'
        if not is_staging_key(staging_key) or is_staging_key('world-protocol-academy/original.pdf'):
            raise AssertionError('staging key routing self-test failed')
        validate_staging_target(staging_key)
        try:
            validate_staging_target('world-protocol-academy/original.pdf')
        except RuntimeError as exc:
            if 'outside isolated' not in str(exc):
                raise
        else:
            raise AssertionError('non-staging S3 PUT target was accepted')

        client = FakeClient()
        expected = source.stat().st_size
        with source.open('rb') as body:
            response = client.put_object(Bucket='bucket', Key=staging_key, Body=body, ContentType='application/pdf', ContentLength=expected)
        head = client.head_object(Bucket='bucket', Key=staging_key)
        if int(head['ContentLength']) != expected or not response.get('ETag'):
            raise AssertionError('S3 PUT verification self-test failed')

        corrupt = FakeClient(corrupt=True)
        with source.open('rb') as body:
            corrupt.put_object(Bucket='bucket', Key=staging_key, Body=body, ContentType='application/pdf', ContentLength=expected)
        if int(corrupt.head_object(Bucket='bucket', Key=staging_key)['ContentLength']) == expected:
            raise AssertionError('S3 PUT length mismatch self-test failed')
    print('I/O runner self-test: OK')


runner.s3_client = cached_s3_client
stage.CF.get = direct_staging_get
stage.CF.put = direct_staging_put

if __name__ == '__main__':
    if '--io-self-test' in sys.argv:
        io_self_test()
    else:
        stage.main()

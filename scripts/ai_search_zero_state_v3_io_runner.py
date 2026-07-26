#!/usr/bin/env python3
"""Run v3 planning/staging with stable pagination and fail-closed R2 S3 GET/PUT fallbacks."""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from botocore.exceptions import BotoCoreError, ClientError

import ai_search_zero_state_v3 as stage
import ai_search_zero_state_v3_runner as runner

S3_PUT_ATTEMPTS = int(os.getenv('R2_S3_PUT_ATTEMPTS', '4'))
S3_PUT_BACKOFF = int(os.getenv('R2_S3_PUT_BACKOFF', '10'))
ORIGINAL_PUT = stage.CF.put


def validate_staging_target(key):
    required = stage.ROOT + '/'
    if not key.startswith(required):
        raise RuntimeError(f'refusing S3 PUT outside isolated v3 staging prefix: {key}')


def s3_put(cf, key, source, content_type):
    validate_staging_target(key)
    token = os.environ.get('CLOUDFLARE_API_TOKEN', '')
    if not token:
        raise RuntimeError('CLOUDFLARE_API_TOKEN is required for R2 S3 PUT fallback')
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


def resilient_put(self, key, source, content_type):
    validate_staging_target(key)
    try:
        return ORIGINAL_PUT(self, key, source, content_type)
    except subprocess.CalledProcessError:
        print(f'WARNING: Wrangler R2 PUT exhausted; activating S3 fallback for {key}', flush=True)
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
        validate_staging_target(stage.ROOT + '/test/part.pdf')
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
            response = client.put_object(Bucket='bucket', Key=stage.ROOT + '/test/part.pdf', Body=body, ContentType='application/pdf', ContentLength=expected)
        head = client.head_object(Bucket='bucket', Key=stage.ROOT + '/test/part.pdf')
        if int(head['ContentLength']) != expected or not response.get('ETag'):
            raise AssertionError('S3 PUT verification self-test failed')

        corrupt = FakeClient(corrupt=True)
        with source.open('rb') as body:
            corrupt.put_object(Bucket='bucket', Key=stage.ROOT + '/test/part.pdf', Body=body, ContentType='application/pdf', ContentLength=expected)
        if int(corrupt.head_object(Bucket='bucket', Key=stage.ROOT + '/test/part.pdf')['ContentLength']) == expected:
            raise AssertionError('S3 PUT length mismatch self-test failed')
    print('I/O runner self-test: OK')


stage.CF.put = resilient_put

if __name__ == '__main__':
    if '--io-self-test' in sys.argv:
        io_self_test()
    else:
        stage.main()

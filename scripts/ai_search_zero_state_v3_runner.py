#!/usr/bin/env python3
"""Run v3 planning/staging with stable AI Search pagination and fail-closed R2 S3 fallback."""
import hashlib
import os
import subprocess
import sys
from pathlib import Path

import boto3
import requests
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

import ai_search_zero_state_v3 as stage

S3_ATTEMPTS = int(os.getenv('R2_S3_GET_ATTEMPTS', '4'))
S3_BACKOFF = int(os.getenv('R2_S3_GET_BACKOFF', '10'))
ITEM_PAGE_SIZE = int(os.getenv('AI_SEARCH_ITEM_PAGE_SIZE', '50'))
ITEM_SNAPSHOT_ATTEMPTS = int(os.getenv('AI_SEARCH_ITEM_SNAPSHOT_ATTEMPTS', '6'))
ITEM_SNAPSHOT_BACKOFF = int(os.getenv('AI_SEARCH_ITEM_SNAPSHOT_BACKOFF', '2'))
ITEM_STABLE_REQUIRED = int(os.getenv('AI_SEARCH_ITEM_STABLE_REQUIRED', '2'))
ORIGINAL_GET = stage.CF.get


class PaginationSnapshotError(RuntimeError):
    pass


def item_semantic(item):
    return {
        'key': stage.key(item),
        'status': stage.status(item),
        'reason': stage.reason(item),
        'action': stage.classify(item),
    }


def normalize_snapshot(raw_items, total_count):
    by_key = {}
    semantics = {}
    duplicate_extras = 0
    for item in raw_items:
        item_key = stage.key(item)
        if not item_key:
            raise PaginationSnapshotError('AI Search item snapshot contains an empty key')
        semantic = item_semantic(item)
        if item_key in by_key:
            duplicate_extras += 1
            if semantics[item_key] != semantic:
                raise PaginationSnapshotError(f'conflicting duplicate AI Search item key: {item_key}')
            continue
        by_key[item_key] = item
        semantics[item_key] = semantic
    if total_count is None:
        total_count = len(raw_items)
    total_count = int(total_count)
    if len(by_key) != total_count:
        raise PaginationSnapshotError(
            f'incomplete AI Search pagination snapshot: total_count={total_count} '
            f'raw={len(raw_items)} unique={len(by_key)} duplicate_extras={duplicate_extras}'
        )
    ordered_items = [by_key[k] for k in sorted(by_key)]
    ordered_semantics = [semantics[k] for k in sorted(semantics)]
    fingerprint = stage.hbytes(stage.canon(ordered_semantics))
    return ordered_items, fingerprint, duplicate_extras


def fetch_item_snapshot(cf):
    url = f'{stage.API}/accounts/{cf.a}/ai-search/instances/{cf.i}/items'
    headers = {'Authorization': f'Bearer {cf.ai}'}
    raw_items = []
    page = 1
    total_count = None
    while True:
        response = requests.get(
            url,
            headers=headers,
            params={'page': page, 'per_page': ITEM_PAGE_SIZE},
            timeout=120,
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get('success') is False:
            raise PaginationSnapshotError(f'AI Search items API failure: {payload}')
        batch = payload.get('result') or []
        info = payload.get('result_info') or {}
        reported_total = info.get('total_count')
        if reported_total is not None:
            reported_total = int(reported_total)
            if total_count is None:
                total_count = reported_total
            elif total_count != reported_total:
                raise PaginationSnapshotError(
                    f'AI Search total_count changed during pagination: {total_count} -> {reported_total}'
                )
        raw_items.extend(batch)
        reported_page = int(info.get('page') or page)
        reported_per_page = int(info.get('per_page') or ITEM_PAGE_SIZE)
        if total_count is not None:
            if reported_page * reported_per_page >= total_count:
                break
        elif len(batch) < ITEM_PAGE_SIZE:
            break
        page += 1
        if page > 200:
            raise PaginationSnapshotError('AI Search pagination safety limit exceeded')
    return normalize_snapshot(raw_items, total_count)


def stable_items(self):
    if ITEM_STABLE_REQUIRED < 2:
        raise RuntimeError('AI_SEARCH_ITEM_STABLE_REQUIRED must be at least 2')
    previous_fingerprint = None
    consecutive = 0
    last_error = None
    for attempt in range(1, ITEM_SNAPSHOT_ATTEMPTS + 1):
        try:
            items, fingerprint, duplicate_extras = fetch_item_snapshot(self)
            if fingerprint == previous_fingerprint:
                consecutive += 1
            else:
                previous_fingerprint = fingerprint
                consecutive = 1
            print(
                f'PAGINATION: valid AI Search snapshot attempt {attempt}/{ITEM_SNAPSHOT_ATTEMPTS}; '
                f'unique={len(items)} duplicate_extras={duplicate_extras} '
                f'fingerprint={fingerprint} stable={consecutive}/{ITEM_STABLE_REQUIRED}',
                flush=True,
            )
            if consecutive >= ITEM_STABLE_REQUIRED:
                print(
                    f'PAGINATION: accepted stable AI Search snapshot unique={len(items)} '
                    f'fingerprint={fingerprint}',
                    flush=True,
                )
                return items
        except (requests.RequestException, ValueError, PaginationSnapshotError) as exc:
            last_error = exc
            previous_fingerprint = None
            consecutive = 0
            print(
                f'WARNING: invalid AI Search pagination snapshot attempt '
                f'{attempt}/{ITEM_SNAPSHOT_ATTEMPTS}; reason={exc}',
                flush=True,
            )
        if attempt < ITEM_SNAPSHOT_ATTEMPTS:
            stage.time.sleep(min(30, ITEM_SNAPSHOT_BACKOFF * attempt))
    raise RuntimeError(
        f'AI Search pagination did not produce {ITEM_STABLE_REQUIRED} consecutive stable complete snapshots '
        f'after {ITEM_SNAPSHOT_ATTEMPTS} attempts: {last_error or "snapshots kept changing"}'
    )


def verify_token_id(account_id, token):
    """Return the token id used as the R2 S3 Access Key ID."""
    headers = {'Authorization': f'Bearer {token}'}
    endpoints = (
        f'{stage.API}/accounts/{account_id}/tokens/verify',
        f'{stage.API}/user/tokens/verify',
    )
    errors = []
    for url in endpoints:
        try:
            response = requests.get(url, headers=headers, timeout=60)
            if response.status_code in (401, 403, 404):
                errors.append(f'{response.status_code} from {url}')
                continue
            response.raise_for_status()
            payload = response.json()
            result = payload.get('result') or {}
            token_id = result.get('id')
            status = result.get('status')
            if payload.get('success') is True and token_id and status == 'active':
                return token_id
            errors.append(f'invalid verify response from {url}: success={payload.get("success")} status={status}')
        except (requests.RequestException, ValueError) as exc:
            errors.append(f'{url}: {exc}')
    raise RuntimeError('unable to verify R2 API token and obtain Access Key ID: ' + '; '.join(errors))


def s3_client(cf, token):
    access_key_id = verify_token_id(cf.a, token)
    secret_access_key = hashlib.sha256(token.encode('utf-8')).hexdigest()
    return boto3.client(
        service_name='s3',
        endpoint_url=f'https://{cf.a}.r2.cloudflarestorage.com',
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name='auto',
        config=Config(
            signature_version='s3v4',
            retries={'max_attempts': 4, 'mode': 'standard'},
            connect_timeout=30,
            read_timeout=300,
        ),
    )


def s3_get(cf, key, destination):
    token = os.environ.get('CLOUDFLARE_API_TOKEN', '')
    if not token:
        raise RuntimeError('CLOUDFLARE_API_TOKEN is required for R2 S3 fallback')
    destination = Path(destination)
    part = destination.with_name(destination.name + '.part')
    client = s3_client(cf, token)
    last_error = None
    for attempt in range(1, S3_ATTEMPTS + 1):
        part.unlink(missing_ok=True)
        body = None
        try:
            print(f'FALLBACK: R2 S3 streaming GET attempt {attempt}/{S3_ATTEMPTS} for {key}', flush=True)
            response = client.get_object(Bucket=cf.b, Key=key)
            body = response['Body']
            expected = response.get('ContentLength')
            content_type = (response.get('ContentType') or '').lower()
            written = 0
            prefix = b''
            with part.open('wb') as handle:
                while True:
                    chunk = body.read(1024 * 1024)
                    if not chunk:
                        break
                    if len(prefix) < 512:
                        prefix += chunk[:512 - len(prefix)]
                    handle.write(chunk)
                    written += len(chunk)
            if written <= 0:
                raise RuntimeError('R2 S3 fallback returned an empty body')
            if expected is not None and written != int(expected):
                raise RuntimeError(f'R2 S3 fallback length mismatch: expected={expected} actual={written}')
            low_prefix = prefix.lstrip().lower()
            if 'text/html' in content_type or low_prefix.startswith(b'<!doctype html') or low_prefix.startswith(b'<html'):
                raise RuntimeError('R2 S3 fallback returned HTML instead of object bytes')
            if key.lower().endswith('.pdf') and not prefix.lstrip().startswith(b'%PDF-'):
                raise RuntimeError('R2 S3 fallback returned non-PDF bytes for a PDF source')
            part.replace(destination)
            print(f'FALLBACK: R2 S3 streaming GET complete bytes={written} key={key}', flush=True)
            return True
        except ClientError as exc:
            code = str(exc.response.get('Error', {}).get('Code', ''))
            status = exc.response.get('ResponseMetadata', {}).get('HTTPStatusCode')
            if status == 404 or code in {'NoSuchKey', 'NotFound'}:
                return False
            if status in (401, 403) or code in {'AccessDenied', 'InvalidAccessKeyId', 'SignatureDoesNotMatch'}:
                raise RuntimeError(f'permanent R2 S3 authentication/authorization failure for {key}: {code or status}') from exc
            last_error = exc
        except (BotoCoreError, OSError, ValueError, RuntimeError) as exc:
            last_error = exc
        finally:
            if body is not None:
                body.close()
        part.unlink(missing_ok=True)
        if attempt < S3_ATTEMPTS:
            delay = min(60, S3_BACKOFF * attempt)
            print(f'WARNING: R2 S3 fallback attempt {attempt}/{S3_ATTEMPTS} failed; retrying in {delay}s; reason={last_error}', flush=True)
            stage.time.sleep(delay)
    raise RuntimeError(f'R2 S3 fallback failed after {S3_ATTEMPTS} attempts for {key}: {last_error}')


def resilient_get(self, key, destination, allow_missing=False):
    try:
        return ORIGINAL_GET(self, key, destination, allow_missing=allow_missing)
    except subprocess.CalledProcessError:
        print(f'WARNING: Wrangler R2 GET exhausted; activating S3 fallback for {key}', flush=True)
        found = s3_get(self, key, destination)
        if not found and allow_missing:
            return False
        if not found:
            raise RuntimeError(f'R2 object missing during S3 fallback: {key}')
        return True


def runner_self_test():
    clean = [
        {'key': 'a.pdf', 'status': 'completed'},
        {'key': 'b.jsonl', 'status': 'skipped'},
        {'key': 'c.mp3', 'status': 'error'},
    ]
    items, fingerprint, duplicate_extras = normalize_snapshot(clean, 3)
    if len(items) != 3 or not fingerprint or duplicate_extras != 0:
        raise AssertionError('stable pagination normalization self-test failed')
    try:
        normalize_snapshot([clean[0], clean[0], clean[1]], 3)
    except PaginationSnapshotError as exc:
        if 'incomplete AI Search pagination snapshot' not in str(exc):
            raise
    else:
        raise AssertionError('duplicate pagination snapshot was not rejected')
    conflicting = [clean[0], {'key': 'a.pdf', 'status': 'error'}, clean[1]]
    try:
        normalize_snapshot(conflicting, 2)
    except PaginationSnapshotError as exc:
        if 'conflicting duplicate' not in str(exc):
            raise
    else:
        raise AssertionError('conflicting duplicate pagination snapshot was not rejected')
    print('runner self-test: OK')


stage.CF.items = stable_items
stage.CF.get = resilient_get

if __name__ == '__main__':
    if '--runner-self-test' in sys.argv:
        runner_self_test()
    else:
        stage.main()

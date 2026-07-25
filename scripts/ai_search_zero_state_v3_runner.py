#!/usr/bin/env python3
"""Run v3 staging with a fail-closed R2 S3 fallback for exhausted Wrangler GETs."""
import hashlib
import os
import subprocess
from pathlib import Path

import boto3
import requests
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

import ai_search_zero_state_v3 as stage

S3_ATTEMPTS = int(os.getenv('R2_S3_GET_ATTEMPTS', '4'))
S3_BACKOFF = int(os.getenv('R2_S3_GET_BACKOFF', '10'))
ORIGINAL_GET = stage.CF.get


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
            code=str(exc.response.get('Error', {}).get('Code', ''))
            status=exc.response.get('ResponseMetadata', {}).get('HTTPStatusCode')
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


stage.CF.get = resilient_get

if __name__ == '__main__':
    stage.main()

#!/usr/bin/env python3
"""Run v3 staging with a fail-closed Cloudflare REST fallback for R2 GETs."""
import os
import subprocess
from pathlib import Path
from urllib.parse import quote

import requests

import ai_search_zero_state_v3 as stage

REST_ATTEMPTS = int(os.getenv('R2_REST_GET_ATTEMPTS', '4'))
REST_BACKOFF = int(os.getenv('R2_REST_GET_BACKOFF', '10'))
ORIGINAL_GET = stage.CF.get


def object_url(cf, key):
    bucket = quote(cf.b, safe='')
    object_key = quote(key, safe='/')
    return f'{stage.API}/accounts/{cf.a}/r2/buckets/{bucket}/objects/{object_key}'


def rest_get(cf, key, destination):
    token = os.environ.get('CLOUDFLARE_API_TOKEN', '')
    if not token:
        raise RuntimeError('CLOUDFLARE_API_TOKEN is required for REST R2 fallback')
    destination = Path(destination)
    part = destination.with_name(destination.name + '.part')
    headers = {'Authorization': f'Bearer {token}'}
    url = object_url(cf, key)
    last_error = None
    for attempt in range(1, REST_ATTEMPTS + 1):
        part.unlink(missing_ok=True)
        try:
            print(f'FALLBACK: Cloudflare REST streaming GET attempt {attempt}/{REST_ATTEMPTS} for {key}', flush=True)
            with requests.get(url, headers=headers, stream=True, timeout=(30, 300)) as response:
                if response.status_code == 404:
                    return False
                response.raise_for_status()
                expected = response.headers.get('Content-Length')
                content_type = (response.headers.get('Content-Type') or '').lower()
                written = 0
                prefix = b''
                with part.open('wb') as handle:
                    for chunk in response.iter_content(chunk_size=1024 * 1024):
                        if not chunk:
                            continue
                        if len(prefix) < 512:
                            prefix += chunk[:512 - len(prefix)]
                        handle.write(chunk)
                        written += len(chunk)
                if written <= 0:
                    raise RuntimeError('REST R2 fallback returned an empty body')
                if expected is not None and written != int(expected):
                    raise RuntimeError(f'REST R2 fallback length mismatch: expected={expected} actual={written}')
                low_prefix = prefix.lstrip().lower()
                if 'text/html' in content_type or low_prefix.startswith(b'<!doctype html') or low_prefix.startswith(b'<html'):
                    raise RuntimeError('REST R2 fallback returned HTML instead of object bytes')
                part.replace(destination)
                print(f'FALLBACK: Cloudflare REST streaming GET complete bytes={written} key={key}', flush=True)
                return True
        except (requests.RequestException, OSError, ValueError, RuntimeError) as exc:
            last_error = exc
            part.unlink(missing_ok=True)
            if attempt < REST_ATTEMPTS:
                delay = min(60, REST_BACKOFF * attempt)
                print(f'WARNING: REST R2 fallback attempt {attempt}/{REST_ATTEMPTS} failed; retrying in {delay}s; reason={exc}', flush=True)
                stage.time.sleep(delay)
    raise RuntimeError(f'REST R2 fallback failed after {REST_ATTEMPTS} attempts for {key}: {last_error}')


def resilient_get(self, key, destination, allow_missing=False):
    try:
        return ORIGINAL_GET(self, key, destination, allow_missing=allow_missing)
    except subprocess.CalledProcessError:
        print(f'WARNING: Wrangler R2 GET exhausted; activating REST fallback for {key}', flush=True)
        found = rest_get(self, key, destination)
        if not found and allow_missing:
            return False
        if not found:
            raise RuntimeError(f'R2 object missing during REST fallback: {key}')
        return True


stage.CF.get = resilient_get

if __name__ == '__main__':
    stage.main()

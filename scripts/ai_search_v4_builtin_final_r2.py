#!/usr/bin/env python3
"""Run the built-in AI Search migration with read-only R2 source downloads.

Cloudflare does not allow downloading content for AI Search items backed by an
external source. This wrapper preserves the guarded v4 controller and replaces
only source-content reads: protocol-ai source keys are fetched from the
protocol-kb R2 bucket through the repository's proven S3-compatible R2 client.
Built-in target item downloads continue to use the AI Search Items API for
resume hash checks. Existing target items in error state are hash-verified and
reindexed in place before the guarded upload resume continues.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any

import requests
from botocore.exceptions import BotoCoreError, ClientError

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v4_builtin_final as migration
from scripts.ai_search_v3_cutover import r2_client

_original_download_item = migration.download_item
_original_upload_missing = migration.upload_missing
_SOURCE_BY_ID: dict[str, str] | None = None
_R2_CLIENT = None
_CACHE_DIR = Path("/tmp/ai-search-v4-r2-source-cache")


def _r2_token() -> str:
    token = os.environ.get("CLOUDFLARE_R2_API_TOKEN", "")
    if not token:
        raise migration.controller.GuardError(
            "CLOUDFLARE_R2_API_TOKEN is required for read-only R2 source access"
        )
    return token


def _client(account: str):
    global _R2_CLIENT
    if _R2_CLIENT is None:
        _R2_CLIENT = r2_client(account, _r2_token())
    return _R2_CLIENT


def _source_map(account: str, ai_token: str) -> dict[str, str]:
    global _SOURCE_BY_ID
    if _SOURCE_BY_ID is None:
        values = migration.controller.all_items(
            account,
            ai_token,
            migration.controller.SOURCE,
        )
        mapping: dict[str, str] = {}
        for item in values:
            item_id = str(item.get("id") or "")
            key = migration.controller.key(item)
            if not item_id or item_id in mapping:
                raise migration.controller.GuardError(
                    "source items contain empty or duplicate ids"
                )
            mapping[item_id] = key
        _SOURCE_BY_ID = mapping
    return _SOURCE_BY_ID


def _cache_path(key: str) -> Path:
    digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
    return _CACHE_DIR / digest


def _download_from_r2(account: str, key: str) -> bytes:
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = _cache_path(key)
    if cached.is_file() and cached.stat().st_size > 0:
        return cached.read_bytes()

    try:
        response = _client(account).get_object(
            Bucket=migration.controller.BUCKET,
            Key=key,
        )
        content = response["Body"].read()
    except (BotoCoreError, ClientError, KeyError) as exc:
        raise migration.controller.GuardError(
            f"R2 S3 GET failed for key={key}: {exc}"
        ) from exc

    if not content:
        raise migration.controller.GuardError(
            f"R2 S3 GET returned an empty object for key={key}"
        )
    cached.write_bytes(content)
    return content


def _source_aware_download_item(
    account: str,
    token: str,
    instance_id: str,
    item_id: str,
) -> bytes:
    if instance_id != migration.controller.SOURCE:
        return _original_download_item(account, token, instance_id, item_id)

    mapping = _source_map(account, token)
    key = mapping.get(item_id, "")
    if not key:
        raise migration.controller.GuardError(
            f"source item id was not found: {item_id}"
        )
    if not key.startswith(migration.controller.PREFIX):
        raise migration.controller.GuardError(
            f"refusing R2 read outside locked prefix: {key}"
        )
    if key in migration.controller.EXCLUDES:
        raise migration.controller.GuardError(
            f"refusing R2 read for excluded source key: {key}"
        )
    return _download_from_r2(account, key)


def _sync_item_once(
    account: str,
    token: str,
    target_item: dict[str, Any],
) -> dict[str, Any]:
    target_item_id = migration.item_id(target_item)
    endpoint = migration.target_url(account, f"/items/{target_item_id}")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.patch(
            endpoint,
            headers=headers,
            json={"next_action": "INDEX", "wait_for_completion": False},
            timeout=(30, 180),
        )
    except requests.exceptions.RequestException as exc:
        raise migration.PostOutcomeUnknown(
            f"item sync outcome unknown for item_id={target_item_id}: {exc}"
        ) from exc
    try:
        payload = response.json()
    except ValueError as exc:
        raise migration.controller.GuardError(
            f"non-JSON item sync response HTTP {response.status_code}: "
            f"{response.text[:500]}"
        ) from exc
    if not response.ok or payload.get("success") is False:
        raise migration.controller.GuardError(
            f"Cloudflare item sync failure item_id={target_item_id} "
            f"HTTP {response.status_code}: {payload}"
        )
    result = dict(payload.get("result") or {})
    if str(result.get("id") or "") != target_item_id:
        raise migration.controller.GuardError(
            f"item sync returned unexpected id expected={target_item_id} result={result}"
        )
    if str(result.get("key") or "") != str(target_item.get("key") or ""):
        raise migration.controller.GuardError(
            f"item sync returned unexpected key result={result}"
        )
    return result


def _resync_errored_existing(
    account: str,
    token: str,
    items: list[dict[str, Any]],
    out: Path,
) -> int:
    source_by_target_key = {
        migration.target_key(migration.controller.key(source_item)): source_item
        for source_item in items
    }
    current = migration.list_items(account, token, migration.TARGET)
    errored = [
        item
        for item in current
        if str(item.get("status") or "").lower() == "error"
    ]
    if not errored:
        return 0

    ledger = out / "resync-ledger.jsonl"
    for target_item in errored:
        target_key = str(target_item.get("key") or "")
        source_item = source_by_target_key.get(target_key)
        if source_item is None:
            raise migration.controller.GuardError(
                f"refusing to resync foreign errored target key={target_key}"
            )
        if str(target_item.get("source_id") or "") not in {"builtin", ""}:
            raise migration.controller.GuardError(
                f"refusing to resync non-builtin target item={target_item}"
            )

        source_content = migration.download_item(
            account,
            token,
            migration.controller.SOURCE,
            migration.item_id(source_item),
        )
        target_content = _original_download_item(
            account,
            token,
            migration.TARGET,
            migration.item_id(target_item),
        )
        source_sha = hashlib.sha256(source_content).hexdigest()
        target_sha = hashlib.sha256(target_content).hexdigest()
        if target_sha != source_sha:
            raise migration.controller.GuardError(
                f"errored item hash mismatch for target key={target_key}"
            )

        synced = _sync_item_once(account, token, target_item)
        record = {
            "action": "hash_verified_resync",
            "target_item_id": migration.item_id(target_item),
            "target_key": target_key,
            "previous_status": target_item.get("status"),
            "previous_error": target_item.get("error"),
            "returned_status": synced.get("status"),
            "sha256": source_sha,
            "bytes": len(source_content),
        }
        with ledger.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
    return len(errored)


def _resume_aware_upload_missing(
    account: str,
    token: str,
    items: list[dict[str, Any]],
    out: Path,
) -> dict[str, Any]:
    resynced = _resync_errored_existing(account, token, items, out)
    progress = _original_upload_missing(account, token, items, out)
    progress["resynced_errors"] = resynced
    return progress


migration.download_item = _source_aware_download_item
migration.upload_missing = _resume_aware_upload_missing


def self_test() -> None:
    assert migration.controller.BUCKET == "protocol-kb"
    assert migration.controller.SOURCE == "protocol-ai"
    assert migration.controller.EXPECTED_ACTIVE == 790
    assert _cache_path("a/b c.txt").name == hashlib.sha256(
        b"a/b c.txt"
    ).hexdigest()
    assert migration.upload_missing is _resume_aware_upload_missing
    migration.self_test()
    print("S3-compatible R2 source and errored-item resume wrapper self-test: OK")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        migration.main()

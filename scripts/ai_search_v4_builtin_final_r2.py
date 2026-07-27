#!/usr/bin/env python3
"""Run the built-in AI Search migration with read-only R2 source downloads.

Cloudflare does not allow downloading content for AI Search items backed by an
external source. This wrapper preserves the guarded v4 controller and replaces
only source-content reads: protocol-ai source keys are fetched from the
protocol-kb R2 bucket using the read-only object endpoint. Built-in target item
downloads continue to use the AI Search Items API for resume hash verification.
"""
from __future__ import annotations

import sys
from pathlib import Path
from urllib.parse import quote

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v4_builtin_final as migration

_original_download_item = migration.download_item


def _download_from_r2(account: str, token: str, key: str) -> bytes:
    encoded_key = quote(key, safe="")
    endpoint = (
        f"{migration.controller.API}/accounts/{account}/r2/buckets/"
        f"{migration.controller.BUCKET}/objects/{encoded_key}"
    )
    response = migration.resilient_get(endpoint, token, stream=True)
    content = response.content
    if not content:
        raise migration.controller.GuardError(
            f"empty R2 object download key={key}"
        )
    return content


def _source_aware_download_item(
    account: str,
    token: str,
    instance_id: str,
    item_id: str,
) -> bytes:
    if instance_id != migration.controller.SOURCE:
        return _original_download_item(account, token, instance_id, item_id)

    source_items = migration.controller.all_items(
        account,
        token,
        migration.controller.SOURCE,
    )
    matches = [
        item
        for item in source_items
        if str(item.get("id") or "") == item_id
    ]
    if len(matches) != 1:
        raise migration.controller.GuardError(
            f"source item id lookup expected one match, got {len(matches)}: {item_id}"
        )
    key = migration.controller.key(matches[0])
    if not key.startswith(migration.controller.PREFIX):
        raise migration.controller.GuardError(
            f"refusing R2 read outside locked prefix: {key}"
        )
    if key in migration.controller.EXCLUDES:
        raise migration.controller.GuardError(
            f"refusing R2 read for excluded source key: {key}"
        )
    return _download_from_r2(account, token, key)


migration.download_item = _source_aware_download_item


def self_test() -> None:
    assert migration.controller.BUCKET == "protocol-kb"
    assert migration.controller.SOURCE == "protocol-ai"
    assert migration.controller.EXPECTED_ACTIVE == 790
    assert quote("a/b c.txt", safe="") == "a%2Fb%20c.txt"
    migration.self_test()
    print("read-only R2 source wrapper self-test: OK")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        migration.main()

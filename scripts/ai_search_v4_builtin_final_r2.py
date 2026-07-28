#!/usr/bin/env python3
"""Run the built-in AI Search migration with read-only R2 source downloads.

Cloudflare does not allow downloading content for AI Search items backed by an
external source. This wrapper preserves the guarded v4 controller and replaces
only source-content reads: protocol-ai source keys are fetched from the
protocol-kb R2 bucket with `wrangler r2 object get --remote`. Built-in target
item downloads continue to use the AI Search Items API for resume hash checks.
"""
from __future__ import annotations

import hashlib
import os
import subprocess
import sys
import tempfile
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v4_builtin_final as migration

_original_download_item = migration.download_item
_SOURCE_BY_ID: dict[str, str] | None = None
_CACHE_DIR = Path("/tmp/ai-search-v4-r2-source-cache")


def _r2_read_token() -> str:
    token = os.environ.get("CLOUDFLARE_R2_READ_TOKEN", "")
    if not token:
        raise migration.controller.GuardError(
            "CLOUDFLARE_R2_READ_TOKEN is required for read-only R2 source access"
        )
    return token


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


def _download_from_r2(key: str) -> bytes:
    _r2_read_token()
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cached = _cache_path(key)
    if cached.is_file() and cached.stat().st_size > 0:
        return cached.read_bytes()

    with tempfile.NamedTemporaryFile(
        prefix="wpa-r2-",
        dir=str(_CACHE_DIR),
        delete=False,
    ) as handle:
        temporary = Path(handle.name)
    temporary.unlink(missing_ok=True)

    env = os.environ.copy()
    env["CLOUDFLARE_API_TOKEN"] = _r2_read_token()
    command = [
        "wrangler",
        "r2",
        "object",
        "get",
        f"{migration.controller.BUCKET}/{key}",
        "--file",
        str(temporary),
        "--remote",
    ]
    completed = subprocess.run(
        command,
        cwd=str(REPOSITORY_ROOT),
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=300,
        check=False,
    )
    if completed.returncode != 0:
        temporary.unlink(missing_ok=True)
        output = completed.stdout[-3000:]
        raise migration.controller.GuardError(
            f"Wrangler R2 GET failed for key={key}: {output}"
        )
    if not temporary.is_file() or temporary.stat().st_size < 1:
        temporary.unlink(missing_ok=True)
        raise migration.controller.GuardError(
            f"Wrangler returned an empty R2 object for key={key}"
        )
    temporary.replace(cached)
    return cached.read_bytes()


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
    return _download_from_r2(key)


migration.download_item = _source_aware_download_item


def self_test() -> None:
    assert migration.controller.BUCKET == "protocol-kb"
    assert migration.controller.SOURCE == "protocol-ai"
    assert migration.controller.EXPECTED_ACTIVE == 790
    assert _cache_path("a/b c.txt").name == hashlib.sha256(
        b"a/b c.txt"
    ).hexdigest()
    migration.self_test()
    print("Wrangler read-only R2 source wrapper self-test: OK")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        migration.main()

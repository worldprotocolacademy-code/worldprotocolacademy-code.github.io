#!/usr/bin/env python3
"""Read-only verification for the locked protocol-ai-v4-final target."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Any

API = "https://api.cloudflare.com/client/v4"
TARGET = "protocol-ai-v4-final"
EXPECTED_ITEM_COUNT = 790
EXPECTED_TARGET_KEY_SHA256 = "82c81d2c778630b907f42dd5579d1a15ab882101af59b901af790180200d0b4a"
EXPECTED_STATS = {
    "completed": 790,
    "skipped": 0,
    "error": 0,
    "queued": 0,
    "running": 0,
    "outdated": 0,
}


class VerificationError(RuntimeError):
    pass


def get_json(url: str, token: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "WPA-AI-Search-v4-verifier/1.0",
        },
    )
    last_error: Exception | None = None
    for attempt in range(1, 5):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                payload = json.load(response)
            if payload.get("success") is False:
                raise VerificationError(f"Cloudflare API failure: {payload}")
            return payload
        except Exception as exc:  # network/API reads only; safe to retry
            last_error = exc
            if attempt == 4:
                break
            time.sleep(5 * attempt)
    raise VerificationError(f"Cloudflare GET failed after retries: {last_error}")


def instance_url(account: str, suffix: str = "") -> str:
    return f"{API}/accounts/{account}/ai-search/instances/{TARGET}{suffix}"


def list_items(account: str, token: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    page = 1
    total: int | None = None
    while True:
        query = urllib.parse.urlencode({"page": page, "per_page": 50})
        payload = get_json(f"{instance_url(account, '/items')}?{query}", token)
        batch = list(payload.get("result") or [])
        reported = (payload.get("result_info") or {}).get("total_count")
        if reported is not None:
            reported = int(reported)
            if total is None:
                total = reported
            elif total != reported:
                raise VerificationError("Target total_count changed during pagination")
        items.extend(batch)
        if (total is not None and len(items) >= total) or (total is None and len(batch) < 50):
            break
        page += 1
        if page > 30:
            raise VerificationError("Target pagination safety limit exceeded")
    if total is not None and len(items) != total:
        raise VerificationError(f"Incomplete target snapshot expected={total} got={len(items)}")
    return items


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="/tmp/ai-search-v4-source-metadata-preflight/target-preflight.json")
    args = parser.parse_args()

    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "").strip()
    if not account or not token:
        raise VerificationError("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_AI_SEARCH_TOKEN")

    instance = dict(get_json(instance_url(account), token).get("result") or {})
    if instance.get("id") != TARGET:
        raise VerificationError(f"Unexpected target instance: {instance}")
    if instance.get("type") not in (None, "", "builtin"):
        raise VerificationError(f"Target is not built-in: {instance}")
    if instance.get("enable") is False or instance.get("paused") is True:
        raise VerificationError("Target is disabled or paused")

    items = list_items(account, token)
    keys = sorted(str(item.get("key") or "") for item in items)
    if any(not key for key in keys) or len(keys) != len(set(keys)):
        raise VerificationError("Target contains empty or duplicate keys")
    digest = hashlib.sha256(
        json.dumps(keys, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    if len(keys) != EXPECTED_ITEM_COUNT:
        raise VerificationError(f"Expected {EXPECTED_ITEM_COUNT} target items, got {len(keys)}")
    if digest != EXPECTED_TARGET_KEY_SHA256:
        raise VerificationError(f"Target key digest mismatch: {digest}")

    counts = Counter(str(item.get("status") or "").lower() for item in items)
    non_completed = [
        item for item in items
        if str(item.get("status") or "").lower() not in {"completed", "complete", "indexed", "ok"}
    ]
    if non_completed:
        sample = [(item.get("key"), item.get("status"), item.get("error")) for item in non_completed[:5]]
        raise VerificationError(f"Target has non-completed items: {sample}")
    source_ids = {str(item.get("source_id") or "") for item in items}
    if source_ids - {"builtin", ""}:
        raise VerificationError(f"Target contains non-builtin source IDs: {sorted(source_ids)}")

    stats = dict(get_json(instance_url(account, "/stats"), token).get("result") or {})
    actual_stats = {
        "completed": int(stats.get("completed") or 0),
        "skipped": int(stats.get("skipped") or 0),
        "error": int(stats.get("error") or stats.get("errors") or 0),
        "queued": int(stats.get("queued") or 0),
        "running": int(stats.get("running") or 0),
        "outdated": int(stats.get("outdated") or 0),
    }
    if actual_stats != EXPECTED_STATS:
        raise VerificationError(f"Target stats mismatch: {actual_stats}")
    vectors = int((((stats.get("engine") or {}).get("vectorize") or {}).get("vectorsCount") or 0))
    if vectors < 1:
        raise VerificationError("Target has zero vectors")

    evidence = {
        "schema": "wpa-ai-search-v4-final-target-verification/1",
        "read_only": True,
        "target": TARGET,
        "item_count": len(keys),
        "target_key_sha256": digest,
        "status_counts": dict(counts),
        "stats": stats,
        "vectors_count": vectors,
        "r2_objects_mutated": False,
        "ai_search_instances_deleted": False,
        "production_cutover_performed": False,
    }
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

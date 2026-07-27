#!/usr/bin/env python3
"""Read-only final verification of the active 790-key filtered AI Search set."""
from __future__ import annotations

import hashlib
import json
import os
from collections import Counter
from pathlib import Path
from typing import Any

import requests

API = "https://api.cloudflare.com/client/v4"
SOURCE = "protocol-ai"
TARGET = "protocol-ai-v3-filtered"
PREFIX = "__ai_search_ready_v3__/80cd2f51cf9ddb429562/"
INCLUDE = [PREFIX + "**"]
EXCLUDES = sorted([
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch2-B2-Q251-Q500-CLEAN.csv",
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch3-B3-Q501-Q750-CLEAN.csv",
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch7-B7-Q1881-Q1950-CLEAN.csv",
])
EXPECTED_SOURCE = 793
EXPECTED_ACTIVE = 790
EXPECTED_SOURCE_SHA = "92e6a15bd0abbcdd0124c2ff9b43332c5d5e9d2ec8e81f51dc6041e03478f546"
EXPECTED_ACTIVE_SHA = "dc085d582d1ee1e6b53c73d5142f33364cb2c5648781f36b8bae17005fe7130b"
COMPLETED = {"completed", "complete", "indexed", "ok"}
TERMINAL = {"completed", "complete", "success", "succeeded", "failed", "error", "cancelled", "canceled"}


class VerifyError(RuntimeError):
    pass


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def req(method: str, endpoint: str, token: str, **kwargs: Any) -> dict[str, Any]:
    if method not in {"GET", "POST"}:
        raise VerifyError(f"disallowed HTTP method: {method}")
    headers = {"Authorization": f"Bearer {token}"}
    if "json" in kwargs:
        headers["Content-Type"] = "application/json"
    response = requests.request(method, endpoint, headers=headers, timeout=120, **kwargs)
    try:
        payload = response.json()
    except ValueError as exc:
        raise VerifyError(f"non-JSON response HTTP {response.status_code}: {response.text[:500]}") from exc
    if not response.ok or payload.get("success") is False:
        raise VerifyError(f"Cloudflare API failure {method} {endpoint} HTTP {response.status_code}: {payload}")
    return payload


def url(account: str, name: str, suffix: str = "") -> str:
    return f"{API}/accounts/{account}/ai-search/instances/{name}{suffix}"


def all_items(account: str, token: str, name: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    page = 1
    total: int | None = None
    while True:
        payload = req("GET", url(account, name, "/items"), token, params={"page": page, "per_page": 50})
        batch = list(payload.get("result") or [])
        info = payload.get("result_info") or {}
        reported = info.get("total_count")
        if reported is not None:
            reported = int(reported)
            if total is None:
                total = reported
            elif total != reported:
                raise VerifyError(f"{name} total_count changed during pagination: {total}->{reported}")
        found.extend(batch)
        if (total is not None and len(found) >= total) or (total is None and len(batch) < 50):
            break
        page += 1
        if page > 200:
            raise VerifyError("pagination safety limit exceeded")
    if total is not None and len(found) != total:
        raise VerifyError(f"incomplete {name} snapshot: expected={total} received={len(found)}")
    return found


def key(item: dict[str, Any]) -> str:
    return str(next((item.get(k) for k in ("key", "name", "filename", "path", "source_key") if item.get(k)), ""))


def status(item: dict[str, Any]) -> str:
    return str(item.get("status") or item.get("indexing_status") or item.get("state") or "unknown").lower()


def digest(keys: list[str]) -> str:
    data = json.dumps(sorted(keys), ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def unique_keys(items: list[dict[str, Any]], label: str) -> list[str]:
    keys = [key(item) for item in items]
    if any(not value for value in keys):
        raise VerifyError(f"{label} contains an empty key")
    if len(set(keys)) != len(keys):
        raise VerifyError(f"{label} contains duplicate keys")
    return sorted(keys)


def active_jobs(values: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [j for j in values if not j.get("ended_at") and str(j.get("status") or j.get("state") or "").lower() not in TERMINAL]


def hit_count(value: Any) -> int:
    if isinstance(value, list):
        return len(value)
    if isinstance(value, dict):
        for field in ("chunks", "data", "results", "search_results", "matches"):
            if isinstance(value.get(field), list):
                return len(value[field])
        return max((hit_count(v) for v in value.values()), default=0)
    return 0


def main() -> None:
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    out = Path(os.environ.get("OUT", "/tmp/ai-search-v3-filtered-active-verifier"))
    out.mkdir(parents=True, exist_ok=True)
    if not account or not token:
        raise VerifyError("Cloudflare credentials are missing")

    source_instance = dict(req("GET", url(account, SOURCE), token).get("result") or {})
    target_instance = dict(req("GET", url(account, TARGET), token).get("result") or {})
    source_params = dict(target_instance.get("source_params") or {})
    if sorted(source_params.get("include_items") or []) != INCLUDE:
        raise VerifyError(f"include_items mismatch: {source_params}")
    if sorted(source_params.get("exclude_items") or []) != EXCLUDES:
        raise VerifyError(f"exclude_items mismatch: {source_params}")
    if target_instance.get("source") != source_instance.get("source") or target_instance.get("token_id") != source_instance.get("token_id"):
        raise VerifyError("target source or service token differs from protocol-ai")

    source_items = all_items(account, token, SOURCE)
    source_desired = [item for item in source_items if key(item).startswith(PREFIX)]
    source_keys = unique_keys(source_desired, "source desired set")
    if len(source_keys) != EXPECTED_SOURCE or digest(source_keys) != EXPECTED_SOURCE_SHA:
        raise VerifyError(f"source manifest mismatch: count={len(source_keys)} sha={digest(source_keys)}")
    allowed_keys = sorted(set(source_keys) - set(EXCLUDES))
    if len(allowed_keys) != EXPECTED_ACTIVE or digest(allowed_keys) != EXPECTED_ACTIVE_SHA:
        raise VerifyError(f"allowed manifest mismatch: count={len(allowed_keys)} sha={digest(allowed_keys)}")

    target_items = all_items(account, token, TARGET)
    completed_items = [item for item in target_items if status(item) in COMPLETED]
    completed_keys = unique_keys(completed_items, "target completed set")
    completed_inside = sorted(k for k in completed_keys if k.startswith(PREFIX))
    completed_outside = sorted(k for k in completed_keys if not k.startswith(PREFIX))
    missing = sorted(set(allowed_keys) - set(completed_inside))
    unexpected = sorted(set(completed_inside) - set(allowed_keys))
    if completed_outside or missing or unexpected or digest(completed_inside) != EXPECTED_ACTIVE_SHA:
        raise VerifyError(
            f"active completed key-set mismatch: outside={len(completed_outside)} missing={len(missing)} "
            f"unexpected={len(unexpected)} sha={digest(completed_inside)}"
        )

    allowed_noncompleted = sorted(
        {key(item) for item in target_items if key(item) in set(allowed_keys) and status(item) not in COMPLETED}
    )
    if allowed_noncompleted:
        raise VerifyError(f"allowed manifest has non-completed historical rows: {allowed_noncompleted[:10]}")

    target_stats = dict(req("GET", url(account, TARGET, "/stats"), token).get("result") or {})
    stats_tuple = (
        int(target_stats.get("completed") or 0), int(target_stats.get("queued") or 0),
        int(target_stats.get("running") or 0), int(target_stats.get("outdated") or 0),
    )
    if stats_tuple != (EXPECTED_ACTIVE, 0, 0, 0):
        raise VerifyError(f"active stats mismatch: expected=790/0/0/0 actual={'/'.join(map(str, stats_tuple))}")
    object_count = int((((target_stats.get("engine") or {}).get("r2") or {}).get("objectCount") or 0))
    if object_count != EXPECTED_ACTIVE:
        raise VerifyError(f"engine objectCount mismatch: expected={EXPECTED_ACTIVE} actual={object_count}")

    job_values = list(req("GET", url(account, TARGET, "/jobs"), token, params={"page": 1, "per_page": 50}).get("result") or [])
    active = active_jobs(job_values)
    if active:
        raise VerifyError(f"active indexing jobs remain: {len(active)}")

    queries = (
        "U-shaped conference room seating configuration",
        "diplomatic protocol and safety",
        "ethical teachings and professional ethics",
    )
    smoke = []
    for query in queries:
        result = req("POST", url(account, TARGET, "/search"), token, json={"messages": [{"role": "user", "content": query}]}).get("result")
        count = hit_count(result)
        smoke.append({"query": query, "result_count": count})
        if count < 1:
            raise VerifyError(f"smoke query returned no chunks: {query}")

    status_counts = dict(Counter(status(item) for item in target_items))
    historical_noncompleted = [item for item in target_items if status(item) not in COMPLETED]
    result = {
        "schema": "wpa-ai-search-v3-filtered-active-verifier/1",
        "status": "active_790_verified",
        "target": TARGET,
        "read_only_configuration": True,
        "source_count": len(source_keys),
        "source_manifest_sha256": digest(source_keys),
        "active_count": len(completed_inside),
        "active_manifest_sha256": digest(completed_inside),
        "active_exact_match": True,
        "missing_active_keys": 0,
        "unexpected_active_keys": 0,
        "completed_outside_prefix": 0,
        "engine_object_count": object_count,
        "active_jobs": 0,
        "stats": target_stats,
        "historical_item_count": len(target_items),
        "historical_status_counts": status_counts,
        "historical_noncompleted_count": len(historical_noncompleted),
        "smoke_tests": smoke,
        "r2_objects_mutated": False,
        "production_cutover_performed": False,
    }
    dump(out / "source-instance.json", source_instance)
    dump(out / "target-instance.json", target_instance)
    dump(out / "target-stats.json", target_stats)
    dump(out / "target-items.json", target_items)
    dump(out / "active-completed-keys.json", completed_inside)
    dump(out / "allowed-manifest-keys.json", allowed_keys)
    dump(out / "verification-result.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

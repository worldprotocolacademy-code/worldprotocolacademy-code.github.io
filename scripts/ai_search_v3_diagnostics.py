#!/usr/bin/env python3
"""Read-only diagnostics for the isolated WPA v3 AI Search instance."""
from __future__ import annotations

import hashlib
import json
import os
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import requests

API = "https://api.cloudflare.com/client/v4"
SOURCE = "protocol-ai"
TARGET = "protocol-ai-v3-clean"
PREFIX = "__ai_search_ready_v3__/80cd2f51cf9ddb429562/"
EXPECTED = 793


class DiagnosticError(RuntimeError):
    pass


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def request(method: str, url: str, token: str, **kwargs: Any) -> dict[str, Any]:
    headers = dict(kwargs.pop("headers", {}) or {})
    headers["Authorization"] = f"Bearer {token}"
    response = requests.request(method, url, headers=headers, timeout=120, **kwargs)
    try:
        payload = response.json()
    except ValueError as exc:
        raise DiagnosticError(f"non-JSON response HTTP {response.status_code}: {response.text[:500]}") from exc
    if not response.ok or payload.get("success") is False:
        raise DiagnosticError(f"Cloudflare API failure {method} {url} HTTP {response.status_code}: {payload}")
    return payload


def url(account: str, name: str, suffix: str = "") -> str:
    return f"{API}/accounts/{account}/ai-search/instances/{name}{suffix}"


def instance(account: str, token: str, name: str) -> dict[str, Any]:
    return dict(request("GET", url(account, name), token).get("result") or {})


def stats(account: str, token: str, name: str) -> dict[str, Any]:
    return dict(request("GET", url(account, name, "/stats"), token).get("result") or {})


def jobs(account: str, token: str, name: str) -> list[dict[str, Any]]:
    return list(request("GET", url(account, name, "/jobs"), token, params={"page": 1, "per_page": 50}).get("result") or [])


def all_items(account: str, token: str, name: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    page = 1
    total: int | None = None
    while True:
        payload = request("GET", url(account, name, "/items"), token, params={"page": page, "per_page": 50})
        batch = list(payload.get("result") or [])
        info = payload.get("result_info") or {}
        reported = info.get("total_count")
        if reported is not None:
            reported = int(reported)
            if total is None:
                total = reported
            elif total != reported:
                raise DiagnosticError(f"total_count changed during pagination: {total}->{reported}")
        items.extend(batch)
        if (total is not None and len(items) >= total) or (total is None and len(batch) < 50):
            break
        page += 1
        if page > 200:
            raise DiagnosticError("pagination safety limit exceeded")
    if total is not None and len(items) != total:
        raise DiagnosticError(f"incomplete item snapshot: expected={total} received={len(items)}")
    return items


def first(item: dict[str, Any], names: tuple[str, ...]) -> str:
    for name in names:
        value = item.get(name)
        if value not in (None, ""):
            return str(value)
    return ""


def item_key(item: dict[str, Any]) -> str:
    return first(item, ("key", "name", "filename", "path", "source_key"))


def item_status(item: dict[str, Any]) -> str:
    return first(item, ("status", "indexing_status", "state")).lower() or "unknown"


def item_error(item: dict[str, Any]) -> str:
    return first(item, ("error", "error_code", "error_type", "reason", "message", "last_error")) or "unspecified"


def digest(keys: list[str]) -> str:
    return hashlib.sha256(json.dumps(sorted(keys), ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()


def main() -> None:
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    out = Path(os.environ.get("OUT", "/tmp/ai-search-v3-diagnostics"))
    out.mkdir(parents=True, exist_ok=True)
    if not account or not token:
        raise DiagnosticError("required Cloudflare read credentials are missing")

    source = instance(account, token, SOURCE)
    target = instance(account, token, TARGET)
    target_stats = stats(account, token, TARGET)
    target_jobs = jobs(account, token, TARGET)
    source_items = [item for item in all_items(account, token, SOURCE) if item_key(item).startswith(PREFIX)]
    target_items = all_items(account, token, TARGET)

    status_counts = Counter(item_status(item) for item in target_items)
    error_counts = Counter()
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in target_items:
        status = item_status(item)
        error = item_error(item) if status in {"error", "failed", "failure"} else ""
        if error:
            error_counts[error] += 1
        grouped[status].append({"key": item_key(item), "status": status, "error": error, "raw": item})

    source_keys = sorted(item_key(item) for item in source_items)
    target_keys = sorted(item_key(item) for item in target_items if item_key(item))
    missing = sorted(set(source_keys) - set(target_keys))
    unexpected = sorted(set(target_keys) - set(source_keys))
    active_jobs = [job for job in target_jobs if not job.get("ended_at")]

    summary = {
        "schema": "wpa-ai-search-v3-diagnostics/1",
        "read_only": True,
        "expected_source_count": EXPECTED,
        "source_count": len(source_keys),
        "source_sha256": digest(source_keys),
        "target_item_count": len(target_keys),
        "target_sha256": digest(target_keys),
        "status_counts_from_items": dict(sorted(status_counts.items())),
        "error_counts_from_items": dict(sorted(error_counts.items())),
        "stats": target_stats,
        "jobs_total": len(target_jobs),
        "active_jobs": len(active_jobs),
        "missing_keys": len(missing),
        "unexpected_keys": len(unexpected),
        "exact_key_set": not missing and not unexpected and len(source_keys) == EXPECTED,
        "target_instance_status": target.get("status"),
        "target_last_activity": target.get("last_activity"),
    }

    dump(out / "source-instance.json", source)
    dump(out / "target-instance.json", target)
    dump(out / "target-stats.json", target_stats)
    dump(out / "target-jobs.json", target_jobs)
    dump(out / "target-active-jobs.json", active_jobs)
    dump(out / "source-keys.json", source_keys)
    dump(out / "target-items.json", target_items)
    dump(out / "items-by-status.json", dict(grouped))
    dump(out / "missing-keys.json", missing)
    dump(out / "unexpected-keys.json", unexpected)
    dump(out / "diagnostic-summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

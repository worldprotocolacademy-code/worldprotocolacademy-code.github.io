#!/usr/bin/env python3
"""Read-only item diagnostics for protocol-ai-v3-filtered."""
from __future__ import annotations
import json, os
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
import requests

API = "https://api.cloudflare.com/client/v4"
TARGET = "protocol-ai-v3-filtered"
EXPECTED = 793

class DiagnosticError(RuntimeError):
    pass

def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

def req(url: str, token: str, **kwargs: Any) -> dict[str, Any]:
    r = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=120, **kwargs)
    try:
        payload = r.json()
    except ValueError as exc:
        raise DiagnosticError(f"non-JSON response HTTP {r.status_code}: {r.text[:500]}") from exc
    if not r.ok or payload.get("success") is False:
        raise DiagnosticError(f"Cloudflare API failure GET {url} HTTP {r.status_code}: {payload}")
    return payload

def url(account: str, suffix: str = "") -> str:
    return f"{API}/accounts/{account}/ai-search/instances/{TARGET}{suffix}"

def all_items(account: str, token: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    page = 1
    while True:
        payload = req(url(account, "/items"), token, params={"page": page, "per_page": 50})
        batch = list(payload.get("result") or [])
        out.extend(batch)
        info = payload.get("result_info") or {}
        total = int(info.get("total_count") or len(out))
        if len(out) >= total or len(batch) < 50:
            break
        page += 1
        if page > 200:
            raise DiagnosticError("pagination safety limit exceeded")
    return out

def first(item: dict[str, Any], names: tuple[str, ...]) -> str:
    for name in names:
        value = item.get(name)
        if value not in (None, ""):
            return str(value)
    return ""

def key(item: dict[str, Any]) -> str:
    return first(item, ("key", "name", "filename", "path", "source_key"))

def status(item: dict[str, Any]) -> str:
    return first(item, ("status", "indexing_status", "state")).lower() or "unknown"

def error_reason(item: dict[str, Any]) -> str:
    return first(item, ("error", "error_code", "error_type", "reason", "message", "last_error")) or "unspecified"

def main() -> None:
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    out = Path(os.environ.get("OUT", "/tmp/ai-search-v3-filtered-diagnostics"))
    out.mkdir(parents=True, exist_ok=True)
    if not account or not token:
        raise DiagnosticError("Cloudflare credentials are missing")

    instance = dict(req(url(account), token).get("result") or {})
    stats = dict(req(url(account, "/stats"), token).get("result") or {})
    items = all_items(account, token)
    errors = [i for i in items if status(i) in {"error", "failed", "failure"}]
    completed = [i for i in items if status(i) in {"completed", "complete", "indexed", "ok"}]
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in errors:
        grouped[error_reason(item)].append({"key": key(item), "status": status(item), "reason": error_reason(item), "raw": item})

    summary = {
        "schema": "wpa-ai-search-v3-filtered-diagnostics/1",
        "read_only": True,
        "target": TARGET,
        "expected": EXPECTED,
        "item_count": len(items),
        "completed_items": len(completed),
        "error_items": len(errors),
        "status_counts": dict(Counter(status(i) for i in items)),
        "error_counts": dict(Counter(error_reason(i) for i in errors)),
        "stats": stats,
    }
    dump(out / "target-instance.json", instance)
    dump(out / "target-stats.json", stats)
    dump(out / "target-items.json", items)
    dump(out / "error-items.json", errors)
    dump(out / "error-items-by-reason.json", dict(grouped))
    dump(out / "error-keys.json", sorted(key(i) for i in errors))
    dump(out / "diagnostic-summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()

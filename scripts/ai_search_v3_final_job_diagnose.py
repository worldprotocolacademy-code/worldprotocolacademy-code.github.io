#!/usr/bin/env python3
"""Read-only diagnostics for the final WPA AI Search indexing job."""
from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

import requests

API = "https://api.cloudflare.com/client/v4"
TARGET = "protocol-ai-v3-final"
OUT = Path(os.getenv("OUT", "/tmp/ai-search-v3-final-job-diagnose"))


def dump(name: str, value: Any) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def get(endpoint: str, token: str, **kwargs: Any) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {token}"}
    last: Exception | None = None
    for attempt in range(1, 5):
        try:
            response = requests.get(endpoint, headers=headers, timeout=120, **kwargs)
            payload = response.json()
            if not response.ok or payload.get("success") is False:
                raise RuntimeError(f"Cloudflare GET HTTP {response.status_code}: {payload}")
            return payload
        except (requests.Timeout, requests.ConnectionError) as exc:
            last = exc
            if attempt == 4:
                raise
            time.sleep(attempt * 10)
    raise RuntimeError(str(last))


def main() -> None:
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    if not account or not token:
        raise RuntimeError("Cloudflare credentials are required")

    base = f"{API}/accounts/{account}/ai-search/instances/{TARGET}"
    instance = get(base, token).get("result") or {}
    stats = get(base + "/stats", token).get("result") or {}
    jobs = get(base + "/jobs", token, params={"page": 1, "per_page": 50}).get("result") or []

    evidence: list[dict[str, Any]] = []
    for job in jobs:
        job_id = str(job.get("id") or "")
        if not job_id:
            continue
        details = get(base + f"/jobs/{job_id}", token).get("result") or {}
        logs = get(base + f"/jobs/{job_id}/logs", token, params={"page": 1, "per_page": 50}).get("result") or []
        evidence.append({"summary": job, "details": details, "logs": logs})

    result = {
        "schema": "wpa-ai-search-v3-final-job-diagnose/1",
        "read_only": True,
        "target": TARGET,
        "instance": instance,
        "stats": stats,
        "jobs_count": len(jobs),
        "jobs": evidence,
        "r2_objects_mutated": False,
        "production_cutover_performed": False,
        "old_instances_deleted": False,
    }
    dump("diagnosis.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

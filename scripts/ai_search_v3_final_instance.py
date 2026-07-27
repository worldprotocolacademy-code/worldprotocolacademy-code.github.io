#!/usr/bin/env python3
"""Create and verify a visually clean final WPA AI Search instance."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import time
from collections import Counter
from pathlib import Path
from typing import Any

import requests

API = "https://api.cloudflare.com/client/v4"
SOURCE = "protocol-ai"
VERIFIED = "protocol-ai-v3-filtered"
TARGET = "protocol-ai-v3-final"
BUCKET = "protocol-kb"
PREFIX = "__ai_search_ready_v3__/80cd2f51cf9ddb429562/"
INCLUDE = [PREFIX + "**"]
EXCLUDES = sorted([
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch2-B2-Q251-Q500-CLEAN.csv",
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch3-B3-Q501-Q750-CLEAN.csv",
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch7-B7-Q1881-Q1950-CLEAN.csv",
])
SOURCE_SHA = "92e6a15bd0abbcdd0124c2ff9b43332c5d5e9d2ec8e81f51dc6041e03478f546"
ACTIVE_SHA = "dc085d582d1ee1e6b53c73d5142f33364cb2c5648781f36b8bae17005fe7130b"
APPROVAL = "APPROVE_CREATE_FINAL_CLEAN_V3"
EXPECTED_SOURCE = 793
EXPECTED_ACTIVE = 790
INDEXED = {"completed", "complete", "indexed", "ok"}
TERMINAL = {"completed", "complete", "success", "succeeded", "failed", "error", "cancelled", "canceled"}
POLL = int(os.getenv("AI_SEARCH_FINAL_POLL_SECONDS", "15"))
TIMEOUT = int(os.getenv("AI_SEARCH_FINAL_TIMEOUT_SECONDS", "7200"))
QUERIES = (
    "U-shaped conference room seating configuration",
    "diplomatic protocol and safety",
    "ethical teachings and professional ethics",
)


class GuardError(RuntimeError):
    pass


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def digest(keys: list[str]) -> str:
    raw = json.dumps(sorted(keys), ensure_ascii=False, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def req(method: str, endpoint: str, token: str, missing_ok: bool = False, **kwargs: Any) -> dict[str, Any] | None:
    if method not in {"GET", "POST"}:
        raise GuardError(f"disallowed HTTP method: {method}")
    headers = {"Authorization": f"Bearer {token}"}
    if "json" in kwargs:
        headers["Content-Type"] = "application/json"
    response = requests.request(method, endpoint, headers=headers, timeout=120, **kwargs)
    if missing_ok and response.status_code == 404:
        return None
    try:
        payload = response.json()
    except ValueError as exc:
        raise GuardError(f"non-JSON Cloudflare response HTTP {response.status_code}: {response.text[:500]}") from exc
    if not response.ok or payload.get("success") is False:
        raise GuardError(f"Cloudflare API failure {method} {endpoint} HTTP {response.status_code}: {payload}")
    return payload


def url(account: str, name: str, suffix: str = "") -> str:
    return f"{API}/accounts/{account}/ai-search/instances/{name}{suffix}"


def instance(account: str, token: str, name: str) -> dict[str, Any] | None:
    payload = req("GET", url(account, name), token, missing_ok=True)
    return None if payload is None else dict(payload.get("result") or {})


def stats(account: str, token: str, name: str) -> dict[str, Any]:
    return dict((req("GET", url(account, name, "/stats"), token) or {}).get("result") or {})


def jobs(account: str, token: str, name: str) -> list[dict[str, Any]]:
    return list((req("GET", url(account, name, "/jobs"), token, params={"page": 1, "per_page": 50}) or {}).get("result") or [])


def active_jobs(values: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [j for j in values if not j.get("ended_at") and str(j.get("status") or j.get("state") or "").lower() not in TERMINAL]


def all_items(account: str, token: str, name: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    page = 1
    total: int | None = None
    while True:
        payload = req("GET", url(account, name, "/items"), token, params={"page": page, "per_page": 50}) or {}
        batch = list(payload.get("result") or [])
        reported = (payload.get("result_info") or {}).get("total_count")
        if reported is not None:
            reported = int(reported)
            if total is None:
                total = reported
            elif total != reported:
                raise GuardError(f"{name} total_count changed during pagination")
        found.extend(batch)
        if (total is not None and len(found) >= total) or (total is None and len(batch) < 50):
            break
        page += 1
        if page > 200:
            raise GuardError(f"{name} pagination safety limit exceeded")
    if total is not None and len(found) != total:
        raise GuardError(f"incomplete {name} snapshot: expected={total} received={len(found)}")
    return found


def key(item: dict[str, Any]) -> str:
    return str(next((item.get(k) for k in ("key", "name", "filename", "path", "source_key") if item.get(k)), ""))


def status(item: dict[str, Any]) -> str:
    return str(item.get("status") or item.get("indexing_status") or item.get("state") or "").lower()


def unique_keys(items: list[dict[str, Any]]) -> list[str]:
    keys = [key(i) for i in items]
    if any(not k for k in keys) or len(set(keys)) != len(keys):
        raise GuardError("snapshot contains empty or duplicate keys")
    return sorted(keys)


def source_manifest(account: str, token: str) -> dict[str, Any]:
    items = [i for i in all_items(account, token, SOURCE) if key(i).startswith(PREFIX)]
    keys = unique_keys(items)
    if len(keys) != EXPECTED_SOURCE or digest(keys) != SOURCE_SHA:
        raise GuardError(f"source manifest mismatch: count={len(keys)} sha={digest(keys)}")
    if any(status(i) not in INDEXED for i in items):
        raise GuardError("source desired manifest contains non-indexed items")
    return {"count": len(keys), "keys": keys, "sha256": digest(keys)}


def allowed_manifest(source: dict[str, Any]) -> dict[str, Any]:
    keys = sorted(set(source["keys"]) - set(EXCLUDES))
    if len(keys) != EXPECTED_ACTIVE or digest(keys) != ACTIVE_SHA:
        raise GuardError(f"allowed manifest mismatch: count={len(keys)} sha={digest(keys)}")
    return {"count": len(keys), "keys": keys, "sha256": digest(keys)}


def verify_filters(value: dict[str, Any], target: str) -> None:
    if value.get("id") != target or value.get("type") != "r2" or value.get("source") != BUCKET:
        raise GuardError(f"unexpected {target} shape")
    params = value.get("source_params") or {}
    if sorted(params.get("include_items") or []) != INCLUDE or sorted(params.get("exclude_items") or []) != EXCLUDES:
        raise GuardError(f"{target} path filters mismatch")


def verify_verified_candidate(account: str, token: str, allowed: dict[str, Any]) -> None:
    value = instance(account, token, VERIFIED)
    if value is None:
        raise GuardError(f"{VERIFIED} is absent")
    verify_filters(value, VERIFIED)
    completed = [i for i in all_items(account, token, VERIFIED) if status(i) in INDEXED]
    completed_keys = unique_keys(completed)
    if completed_keys != allowed["keys"] or digest(completed_keys) != ACTIVE_SHA:
        raise GuardError("verified candidate active key set drifted")
    value_stats = stats(account, token, VERIFIED)
    engine_count = int((((value_stats.get("engine") or {}).get("r2") or {}).get("objectCount") or 0))
    if int(value_stats.get("completed") or 0) != EXPECTED_ACTIVE or engine_count != EXPECTED_ACTIVE:
        raise GuardError("verified candidate active stats drifted")
    if active_jobs(jobs(account, token, VERIFIED)):
        raise GuardError("verified candidate has active jobs")


def clean_state(account: str, token: str, allowed: dict[str, Any]) -> dict[str, Any]:
    value = instance(account, token, TARGET)
    if value is None:
        raise GuardError("final target is absent")
    verify_filters(value, TARGET)
    item_values = all_items(account, token, TARGET)
    keys = unique_keys(item_values)
    if keys != allowed["keys"] or digest(keys) != ACTIVE_SHA:
        raise GuardError(f"final key set mismatch: count={len(keys)} sha={digest(keys)}")
    non_completed = [key(i) for i in item_values if status(i) not in INDEXED]
    if non_completed:
        raise GuardError(f"final target has non-completed items: {non_completed[:5]}")
    value_stats = stats(account, token, TARGET)
    actual = (
        int(value_stats.get("completed") or 0), int(value_stats.get("skipped") or 0),
        int(value_stats.get("error") or value_stats.get("errors") or 0), int(value_stats.get("queued") or 0),
        int(value_stats.get("running") or 0), int(value_stats.get("outdated") or 0),
    )
    if actual != (790, 0, 0, 0, 0, 0):
        raise GuardError(f"final stats mismatch: {'/'.join(map(str, actual))}")
    engine_count = int((((value_stats.get("engine") or {}).get("r2") or {}).get("objectCount") or 0))
    if engine_count != EXPECTED_ACTIVE:
        raise GuardError(f"final engine objectCount mismatch: {engine_count}")
    active = active_jobs(jobs(account, token, TARGET))
    if active:
        raise GuardError(f"final target has {len(active)} active jobs")
    return {
        "item_count": len(item_values), "status_counts": dict(Counter(status(i) for i in item_values)),
        "stats": value_stats, "engine_object_count": engine_count, "active_jobs": 0,
    }


def hit_count(value: Any) -> int:
    if isinstance(value, list):
        return len(value)
    if isinstance(value, dict):
        for field in ("chunks", "data", "results", "search_results", "matches"):
            if isinstance(value.get(field), list):
                return len(value[field])
        return max((hit_count(v) for v in value.values()), default=0)
    return 0


def smoke(account: str, token: str) -> list[dict[str, Any]]:
    evidence = []
    for query in QUERIES:
        result = (req("POST", url(account, TARGET, "/search"), token, json={"messages": [{"role": "user", "content": query}]}) or {}).get("result")
        count = hit_count(result)
        if count < 1:
            raise GuardError(f"smoke query returned no chunks: {query}")
        evidence.append({"query": query, "result_count": count})
    return evidence


def build_plan(account: str, token: str) -> dict[str, Any]:
    source_value = instance(account, token, SOURCE)
    if source_value is None or source_value.get("type") != "r2" or source_value.get("source") != BUCKET:
        raise GuardError("protocol-ai is not the expected R2 instance")
    source = source_manifest(account, token)
    allowed = allowed_manifest(source)
    verify_verified_candidate(account, token, allowed)
    if instance(account, token, TARGET) is not None:
        raise GuardError(f"PLAN requires {TARGET} to be absent")
    payload = {
        "id": TARGET, "type": "r2", "source": BUCKET, "token_id": source_value.get("token_id"),
        "source_params": {"include_items": INCLUDE, "exclude_items": EXCLUDES, "r2_jurisdiction": "default"},
    }
    body = {
        "schema": "wpa-ai-search-v3-final-instance-plan/1", "status": "planned", "target": TARGET,
        "target_state": "absent", "source_count": source["count"], "source_manifest_sha256": source["sha256"],
        "allowed_count": allowed["count"], "allowed_manifest_sha256": allowed["sha256"],
        "verified_candidate": VERIFIED, "create_payload": payload, "expected_final_stats": [790, 0, 0, 0, 0, 0],
        "production_cutover_performed": False, "old_instances_deleted": False,
    }
    body["plan_sha256"] = hashlib.sha256(json.dumps(body, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    return body


def plan(account: str, token: str, out: Path) -> None:
    result = build_plan(account, token)
    dump(out / "plan.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def observe(account: str, token: str, out: Path) -> None:
    source = source_manifest(account, token)
    allowed = allowed_manifest(source)
    if instance(account, token, TARGET) is None:
        result = {"schema": "wpa-ai-search-v3-final-instance-status/1", "read_only": True, "status": "absent", "target": TARGET}
    else:
        try:
            result = {"schema": "wpa-ai-search-v3-final-instance-status/1", "read_only": True, "status": "final_clean_790_verified", "target": TARGET, **clean_state(account, token, allowed)}
        except Exception as exc:
            values = all_items(account, token, TARGET)
            result = {
                "schema": "wpa-ai-search-v3-final-instance-status/1", "read_only": True, "status": "present_not_clean",
                "target": TARGET, "verification_error": str(exc), "item_count": len(values),
                "status_counts": dict(Counter(status(i) for i in values)), "stats": stats(account, token, TARGET),
                "active_jobs": len(active_jobs(jobs(account, token, TARGET))),
            }
    dump(out / "status.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def apply(account: str, token: str, approval: str, out: Path) -> None:
    if approval != APPROVAL:
        raise GuardError(f"APPLY requires approval={APPROVAL}")
    approved = build_plan(account, token)
    dump(out / "approved-plan.json", approved)
    created = dict((req("POST", f"{API}/accounts/{account}/ai-search/instances", token, json=approved["create_payload"]) or {}).get("result") or {})
    verify_filters(created, TARGET)
    dump(out / "create-response.json", created)
    deadline = time.monotonic() + TIMEOUT
    snapshots: list[dict[str, Any]] = []
    triggered: dict[str, Any] | None = None
    clean_streak = 0
    time.sleep(15)
    while True:
        values = all_items(account, token, TARGET)
        value_stats = stats(account, token, TARGET)
        job_values = jobs(account, token, TARGET)
        current_active = active_jobs(job_values)
        snap = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "item_count": len(values),
            "status_counts": dict(Counter(status(i) for i in values)), "stats": value_stats,
            "active_jobs": len(current_active), "jobs_total": len(job_values),
        }
        snapshots.append(snap)
        print(json.dumps(snap), flush=True)
        try:
            source = source_manifest(account, token)
            allowed = allowed_manifest(source)
            clean = clean_state(account, token, allowed)
            clean_streak += 1
            if clean_streak >= 2:
                result = {
                    "schema": "wpa-ai-search-v3-final-instance-result/1", "status": "final_clean_790_verified",
                    "target": TARGET, "source_manifest_sha256": source["sha256"],
                    "active_manifest_sha256": allowed["sha256"], **clean, "smoke_tests": smoke(account, token),
                    "triggered_job": triggered, "production_cutover_performed": False,
                    "r2_objects_mutated": False, "old_instances_deleted": False,
                }
                dump(out / "poll-snapshots.json", snapshots)
                dump(out / "result.json", result)
                print(json.dumps(result, ensure_ascii=False, indent=2))
                return
        except GuardError:
            clean_streak = 0
        if not current_active and triggered is None:
            triggered = dict((req("POST", url(account, TARGET, "/jobs"), token, json={"description": "WPA final clean v3 initial sync"}) or {}).get("result") or {})
            dump(out / "triggered-job.json", triggered)
        if time.monotonic() >= deadline:
            dump(out / "poll-snapshots.json", snapshots)
            raise GuardError(f"final instance timeout after {TIMEOUT} seconds; last={snap}")
        time.sleep(POLL)


def self_test() -> None:
    assert len(EXCLUDES) == 3 and all(k.startswith(PREFIX) and k.endswith(".csv") for k in EXCLUDES)
    synthetic = [PREFIX + f"x/{i}.json" for i in range(EXPECTED_ACTIVE)] + EXCLUDES
    assert len(synthetic) == EXPECTED_SOURCE
    assert len(set(synthetic) - set(EXCLUDES)) == EXPECTED_ACTIVE
    print("guarded final clean instance self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("PLAN", "STATUS", "APPLY"))
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument("--out", default="/tmp/ai-search-v3-final-instance")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if not args.mode:
        parser.error("--mode is required")
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    if not account or not token:
        raise GuardError("Cloudflare credentials are required")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    try:
        if args.mode == "PLAN":
            plan(account, token, out)
        elif args.mode == "STATUS":
            observe(account, token, out)
        else:
            apply(account, token, args.approval, out)
    except Exception as exc:
        dump(out / "failure.json", {"status": "failed", "mode": args.mode, "error": str(exc)})
        raise


if __name__ == "__main__":
    main()

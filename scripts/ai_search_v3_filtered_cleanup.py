#!/usr/bin/env python3
"""Fail-closed cleanup of three redundant CSV errors in protocol-ai-v3-filtered."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import time
from collections import Counter
from pathlib import Path
from typing import Any

import requests

API = "https://api.cloudflare.com/client/v4"
SOURCE = "protocol-ai"
TARGET = "protocol-ai-v3-filtered"
BUCKET = "protocol-kb"
PREFIX = "__ai_search_ready_v3__/80cd2f51cf9ddb429562/"
INCLUDE = [PREFIX + "**"]
EXCLUDES = sorted([
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch2-B2-Q251-Q500-CLEAN.csv",
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch3-B3-Q501-Q750-CLEAN.csv",
    PREFIX + "world-protocol-academy/08_smiljanov_questions_clean/WPA-Question-Bank-Batch7-B7-Q1881-Q1950-CLEAN.csv",
])
EXPECTED_SOURCE = 793
EXPECTED_ALLOWED = 790
EXPECTED_SOURCE_SHA = "92e6a15bd0abbcdd0124c2ff9b43332c5d5e9d2ec8e81f51dc6041e03478f546"
APPROVAL = "APPROVE_EXCLUDE_THREE_EMPTY_CSV_V3"
INDEXED = {"indexed", "completed", "complete", "ok"}
ERROR_STATES = {"error", "failed", "failure"}
SHA_RE = re.compile(r"^[0-9a-f]{64}$")
POLL = int(os.getenv("AI_SEARCH_FILTERED_CLEANUP_POLL_SECONDS", "15"))
TIMEOUT = int(os.getenv("AI_SEARCH_FILTERED_CLEANUP_TIMEOUT_SECONDS", "7200"))
QUERIES = (
    "U-shaped conference room seating configuration",
    "diplomatic protocol and safety",
    "ethical teachings and professional ethics",
)
STABLE_FIELDS = (
    "ai_gateway_id", "ai_search_model", "cache", "cache_threshold", "chunk",
    "chunk_overlap", "chunk_size", "custom_metadata", "embedding_model", "enable",
    "engine_version", "fusion_method", "hybrid_search_enabled", "index_method",
    "indexing_options", "max_num_results", "metadata", "namespace", "paused",
    "public_endpoint_id", "public_endpoint_params", "reranking", "reranking_model",
    "retrieval_options", "rewrite_model", "rewrite_query", "score_threshold", "source",
    "summarization", "summarization_model", "sync_interval", "system_prompt_ai_search",
    "system_prompt_index_summarization", "system_prompt_rewrite_query", "token_id", "type",
)


class GuardError(RuntimeError):
    pass


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(value: Any) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def req(method: str, endpoint: str, token: str, **kwargs: Any) -> dict[str, Any]:
    if method not in {"GET", "PUT", "POST"}:
        raise GuardError(f"disallowed HTTP method: {method}")
    headers = dict(kwargs.pop("headers", {}) or {})
    headers["Authorization"] = f"Bearer {token}"
    if "json" in kwargs:
        headers.setdefault("Content-Type", "application/json")
    response = requests.request(method, endpoint, headers=headers, timeout=120, **kwargs)
    try:
        payload = response.json()
    except ValueError as exc:
        raise GuardError(f"non-JSON Cloudflare response HTTP {response.status_code}: {response.text[:500]}") from exc
    if not response.ok or payload.get("success") is False:
        raise GuardError(f"Cloudflare API failure {method} {endpoint} HTTP {response.status_code}: {payload}")
    return payload


def url(account: str, name: str, suffix: str = "") -> str:
    return f"{API}/accounts/{account}/ai-search/instances/{name}{suffix}"


def instance(account: str, token: str, name: str) -> dict[str, Any]:
    return dict(req("GET", url(account, name), token).get("result") or {})


def stats(account: str, token: str, name: str) -> dict[str, Any]:
    return dict(req("GET", url(account, name, "/stats"), token).get("result") or {})


def jobs(account: str, token: str, name: str) -> list[dict[str, Any]]:
    return list(req("GET", url(account, name, "/jobs"), token, params={"page": 1, "per_page": 50}).get("result") or [])


def active_jobs(values: list[dict[str, Any]]) -> list[dict[str, Any]]:
    terminal = {"completed", "complete", "success", "succeeded", "failed", "error", "cancelled", "canceled"}
    return [j for j in values if not j.get("ended_at") and str(j.get("status") or j.get("state") or "").lower() not in terminal]


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
                raise GuardError(f"{name} total_count changed during pagination: {total}->{reported}")
        found.extend(batch)
        if (total is not None and len(found) >= total) or (total is None and len(batch) < 50):
            break
        page += 1
        if page > 200:
            raise GuardError(f"{name} pagination safety limit exceeded")
    if total is not None and len(found) != total:
        raise GuardError(f"incomplete {name} snapshot: expected={total} received={len(found)}")
    return found


def item_key(item: dict[str, Any]) -> str:
    return str(next((item.get(k) for k in ("key", "name", "filename", "path", "source_key") if item.get(k)), ""))


def item_status(item: dict[str, Any]) -> str:
    return str(item.get("status") or item.get("indexing_status") or item.get("state") or "").lower()


def error_reason(item: dict[str, Any]) -> str:
    return str(next((item.get(k) for k in ("error", "error_code", "error_type", "reason", "message", "last_error") if item.get(k)), ""))


def keys_digest(keys: list[str]) -> str:
    return sha(sorted(keys))


def item_snapshot(items: list[dict[str, Any]]) -> dict[str, Any]:
    keys = [item_key(i) for i in items]
    if any(not k for k in keys):
        raise GuardError("item snapshot contains an empty key")
    if len(set(keys)) != len(keys):
        raise GuardError("item snapshot contains duplicate keys")
    outside = sorted(k for k in keys if not k.startswith(PREFIX))
    if outside:
        raise GuardError(f"item snapshot has {len(outside)} keys outside locked prefix")
    rows = sorted(
        ({"key": item_key(i), "status": item_status(i), "error": error_reason(i)} for i in items),
        key=lambda row: row["key"],
    )
    return {
        "count": len(keys),
        "keys": sorted(keys),
        "keys_sha256": keys_digest(keys),
        "rows_sha256": sha(rows),
        "status_counts": dict(Counter(row["status"] for row in rows)),
        "error_counts": dict(Counter(row["error"] for row in rows if row["error"])),
        "rows": rows,
    }


def source_reference(account: str, token: str) -> dict[str, Any]:
    items = [i for i in all_items(account, token, SOURCE) if item_key(i).startswith(PREFIX)]
    snap = item_snapshot(items)
    if snap["count"] != EXPECTED_SOURCE:
        raise GuardError(f"source count mismatch: expected={EXPECTED_SOURCE} actual={snap['count']}")
    if snap["keys_sha256"] != EXPECTED_SOURCE_SHA:
        raise GuardError(f"source SHA mismatch: expected={EXPECTED_SOURCE_SHA} actual={snap['keys_sha256']}")
    non_indexed = [row for row in snap["rows"] if row["status"] not in INDEXED]
    if non_indexed:
        raise GuardError(f"source has {len(non_indexed)} non-indexed desired keys; first={non_indexed[:5]}")
    return snap


def allowed_reference(source: dict[str, Any]) -> dict[str, Any]:
    source_keys = set(source["keys"])
    if not set(EXCLUDES).issubset(source_keys):
        missing = sorted(set(EXCLUDES) - source_keys)
        raise GuardError(f"planned exclusions are absent from source manifest: {missing}")
    keys = sorted(source_keys - set(EXCLUDES))
    if len(keys) != EXPECTED_ALLOWED:
        raise GuardError(f"allowed count mismatch: expected={EXPECTED_ALLOWED} actual={len(keys)}")
    return {"count": len(keys), "keys": keys, "keys_sha256": keys_digest(keys)}


def stable_config(value: dict[str, Any]) -> dict[str, Any]:
    return {field: value.get(field) for field in STABLE_FIELDS}


def source_params_material(value: dict[str, Any]) -> dict[str, Any]:
    current = dict(value.get("source_params") or {})
    return {
        "include_items": sorted(current.get("include_items") or []),
        "exclude_items": sorted(current.get("exclude_items") or []),
        "prefix": current.get("prefix"),
        "r2_jurisdiction": current.get("r2_jurisdiction"),
    }


def planned_source_params(value: dict[str, Any]) -> dict[str, Any]:
    material = source_params_material(value)
    if material["include_items"] != INCLUDE:
        raise GuardError(f"target include_items mismatch: {value.get('source_params') or {}}")
    existing = material["exclude_items"]
    if existing not in ([], EXCLUDES):
        raise GuardError(f"target has unexpected exclude_items: {existing}")
    result: dict[str, Any] = {"include_items": INCLUDE, "exclude_items": EXCLUDES}
    if material["prefix"] not in (None, ""):
        result["prefix"] = material["prefix"]
    if material["r2_jurisdiction"] not in (None, ""):
        result["r2_jurisdiction"] = material["r2_jurisdiction"]
    return result


def verify_target_shape(value: dict[str, Any], source: dict[str, Any]) -> None:
    if value.get("id") != TARGET or value.get("type") != "r2" or value.get("source") != BUCKET:
        raise GuardError(f"unexpected target shape: id={value.get('id')} type={value.get('type')} source={value.get('source')}")
    if str(value.get("token_id") or "") != str(source.get("token_id") or ""):
        raise GuardError("target service token_id does not match protocol-ai")
    planned_source_params(value)


def stat_tuple(value: dict[str, Any]) -> tuple[int, int, int, int, int, int]:
    return (
        int(value.get("completed") or 0), int(value.get("skipped") or 0),
        int(value.get("error") or value.get("errors") or 0), int(value.get("queued") or 0),
        int(value.get("running") or 0), int(value.get("outdated") or 0),
    )


def validate_pre_state(snap: dict[str, Any], source: dict[str, Any], value_stats: dict[str, Any]) -> dict[str, Any]:
    if snap["count"] != EXPECTED_SOURCE or snap["keys"] != source["keys"]:
        raise GuardError("pre-clean target key set is not the exact 793-key source manifest")
    errors = [row for row in snap["rows"] if row["status"] in ERROR_STATES]
    completed = [row for row in snap["rows"] if row["status"] in INDEXED]
    other = [row for row in snap["rows"] if row["status"] not in INDEXED | ERROR_STATES]
    if sorted(row["key"] for row in errors) != EXCLUDES:
        raise GuardError(f"pre-clean error keys mismatch: {[row['key'] for row in errors]}")
    if any(row["error"] != "file_content_empty" for row in errors):
        raise GuardError(f"pre-clean error reasons changed: {errors}")
    if len(completed) != EXPECTED_ALLOWED or other:
        raise GuardError(f"pre-clean statuses mismatch: completed={len(completed)} other={other[:5]}")
    actual = stat_tuple(value_stats)
    if actual != (EXPECTED_ALLOWED, 0, len(EXCLUDES), 0, 0, 0):
        raise GuardError(f"pre-clean stats mismatch: expected=790/0/3/0/0/0 actual={'/'.join(map(str, actual))}")
    return {"state": "pre_clean_exact", "error_keys": EXCLUDES, "stats": actual}


def validate_clean_state(snap: dict[str, Any], allowed: dict[str, Any], value_stats: dict[str, Any]) -> dict[str, Any]:
    if snap["count"] != EXPECTED_ALLOWED or snap["keys"] != allowed["keys"]:
        missing = sorted(set(allowed["keys"]) - set(snap["keys"]))
        unexpected = sorted(set(snap["keys"]) - set(allowed["keys"]))
        raise GuardError(f"clean key-set mismatch: missing={len(missing)} unexpected={len(unexpected)}")
    non_indexed = [row for row in snap["rows"] if row["status"] not in INDEXED]
    if non_indexed:
        raise GuardError(f"clean target has {len(non_indexed)} non-indexed keys; first={non_indexed[:5]}")
    actual = stat_tuple(value_stats)
    if actual != (EXPECTED_ALLOWED, 0, 0, 0, 0, 0):
        raise GuardError(f"clean stats mismatch: expected=790/0/0/0/0/0 actual={'/'.join(map(str, actual))}")
    return {"state": "clean_exact", "stats": actual}


def classify(snap: dict[str, Any], source: dict[str, Any], allowed: dict[str, Any], value_stats: dict[str, Any]) -> dict[str, Any]:
    errors: list[str] = []
    try:
        return validate_clean_state(snap, allowed, value_stats)
    except GuardError as exc:
        errors.append(str(exc))
    try:
        return validate_pre_state(snap, source, value_stats)
    except GuardError as exc:
        errors.append(str(exc))
    return {"state": "transitional_or_invalid", "verification_errors": errors}


def build_plan(account: str, token: str) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any]]:
    source_instance = instance(account, token, SOURCE)
    target_instance = instance(account, token, TARGET)
    verify_target_shape(target_instance, source_instance)
    source = source_reference(account, token)
    allowed = allowed_reference(source)
    target_items = item_snapshot(all_items(account, token, TARGET))
    target_stats = stats(account, token, TARGET)
    job_values = jobs(account, token, TARGET)
    active = active_jobs(job_values)
    if active:
        raise GuardError(f"PLAN requires no active target jobs; active={len(active)}")
    classification = classify(target_items, source, allowed, target_stats)
    existing_excludes = sorted((target_instance.get("source_params") or {}).get("exclude_items") or [])
    if existing_excludes == [] and classification["state"] != "pre_clean_exact":
        raise GuardError(f"unfiltered target is not in the exact pre-clean state: {classification}")
    if existing_excludes == EXCLUDES and classification["state"] not in {"pre_clean_exact", "clean_exact"}:
        raise GuardError(f"filtered target is neither exact pre-clean nor exact clean: {classification}")
    before_params = source_params_material(target_instance)
    after_params = planned_source_params(target_instance)
    body = {
        "schema": "wpa-ai-search-v3-filtered-cleanup-plan/1", "target": TARGET,
        "source_manifest_sha256": source["keys_sha256"], "allowed_manifest_sha256": allowed["keys_sha256"],
        "source_count": source["count"], "allowed_count": allowed["count"], "exclude_items": EXCLUDES,
        "target_items_sha256": target_items["keys_sha256"], "target_rows_sha256": target_items["rows_sha256"],
        "target_stats": list(stat_tuple(target_stats)), "target_state": classification["state"],
        "stable_config_sha256": sha(stable_config(target_instance)), "source_params_before": before_params,
        "source_params_after": after_params, "jobs_total": len(job_values), "active_jobs": 0,
    }
    body["plan_sha256"] = sha(body)
    return body, source_instance, target_instance, source, allowed


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
        result = req("POST", url(account, TARGET, "/search"), token, json={"messages": [{"role": "user", "content": query}]}).get("result")
        count = hit_count(result)
        evidence.append({"query": query, "result_count": count, "result_type": type(result).__name__})
        if count < 1:
            raise GuardError(f"smoke query returned no chunks: {query}")
    return evidence


def plan(account: str, token: str, out: Path) -> None:
    body, source_instance, target_instance, source, allowed = build_plan(account, token)
    dump(out / "source-instance.json", source_instance)
    dump(out / "target-instance-before.json", target_instance)
    dump(out / "source-manifest.json", source)
    dump(out / "allowed-manifest.json", allowed)
    dump(out / "plan.json", body)
    print(json.dumps(body, ensure_ascii=False, indent=2))


def observe(account: str, token: str, out: Path) -> None:
    source_instance = instance(account, token, SOURCE)
    target_instance = instance(account, token, TARGET)
    verify_target_shape(target_instance, source_instance)
    source = source_reference(account, token)
    allowed = allowed_reference(source)
    target_items = item_snapshot(all_items(account, token, TARGET))
    target_stats = stats(account, token, TARGET)
    job_values = jobs(account, token, TARGET)
    result = {
        "schema": "wpa-ai-search-v3-filtered-cleanup-status/1", "read_only": True, "target": TARGET,
        "exclude_items": sorted((target_instance.get("source_params") or {}).get("exclude_items") or []),
        "source_manifest_sha256": source["keys_sha256"], "allowed_manifest_sha256": allowed["keys_sha256"],
        "item_count": target_items["count"], "status_counts": target_items["status_counts"],
        "error_counts": target_items["error_counts"], "stats": target_stats,
        "active_jobs": len(active_jobs(job_values)), "jobs_total": len(job_values),
        "classification": classify(target_items, source, allowed, target_stats),
    }
    dump(out / "status.json", result)
    dump(out / "target-instance.json", target_instance)
    dump(out / "target-items.json", target_items)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def apply(account: str, token: str, approval: str, approved_plan_sha: str, out: Path) -> None:
    if approval != APPROVAL or not SHA_RE.fullmatch(approved_plan_sha):
        raise GuardError(f"APPLY requires {APPROVAL} and the exact PLAN SHA-256")
    plan_body, source_instance, target_before, source, allowed = build_plan(account, token)
    if plan_body["plan_sha256"] != approved_plan_sha:
        raise GuardError(f"approved PLAN mismatch: approved={approved_plan_sha} current={plan_body['plan_sha256']}")
    dump(out / "approved-plan.json", plan_body)
    dump(out / "target-instance-before.json", target_before)
    before_stable = stable_config(target_before)
    existing_excludes = sorted((target_before.get("source_params") or {}).get("exclude_items") or [])
    pre_update_jobs = jobs(account, token, TARGET)
    pre_update_job_ids = {str(j.get("id") or j.get("job_id") or "") for j in pre_update_jobs}
    update_result: dict[str, Any] | None = None
    if existing_excludes == []:
        update_result = dict(req("PUT", url(account, TARGET), token, json={"source_params": plan_body["source_params_after"]}).get("result") or {})
        dump(out / "update-response.json", update_result)
    elif existing_excludes != EXCLUDES:
        raise GuardError(f"unexpected exclusions before APPLY: {existing_excludes}")

    target_after = instance(account, token, TARGET)
    verify_target_shape(target_after, source_instance)
    expected_params = source_params_material({"source_params": plan_body["source_params_after"]})
    if source_params_material(target_after) != expected_params:
        dump(out / "source-params-expected.json", expected_params)
        dump(out / "source-params-actual.json", source_params_material(target_after))
        raise GuardError("target did not retain the exact planned path-filter configuration")
    if stable_config(target_after) != before_stable:
        dump(out / "stable-config-before.json", before_stable)
        dump(out / "stable-config-after.json", stable_config(target_after))
        raise GuardError("non-filter target configuration changed during cleanup update")
    dump(out / "target-instance-after-update.json", target_after)

    initial_jobs = jobs(account, token, TARGET)
    initial_job_ids = {str(j.get("id") or j.get("job_id") or "") for j in initial_jobs}
    triggered: dict[str, Any] | None = None
    sync_seen = bool(active_jobs(initial_jobs)) or bool(initial_job_ids - pre_update_job_ids)
    clean_streak = 0
    deadline = time.monotonic() + TIMEOUT
    snapshots: list[dict[str, Any]] = []
    time.sleep(15)

    while True:
        current_instance = instance(account, token, TARGET)
        verify_target_shape(current_instance, source_instance)
        if source_params_material(current_instance) != expected_params:
            raise GuardError("planned path-filter configuration drifted during cleanup")
        if stable_config(current_instance) != before_stable:
            raise GuardError("non-filter target configuration drifted during cleanup")
        current_stats = stats(account, token, TARGET)
        current_jobs = jobs(account, token, TARGET)
        current_active = active_jobs(current_jobs)
        current_ids = {str(j.get("id") or j.get("job_id") or "") for j in current_jobs}
        if current_active or (current_ids - initial_job_ids):
            sync_seen = True
        current_items = item_snapshot(all_items(account, token, TARGET))
        classification = classify(current_items, source, allowed, current_stats)
        snap = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "item_count": current_items["count"],
            "status_counts": current_items["status_counts"], "stats": list(stat_tuple(current_stats)),
            "active_jobs": len(current_active), "jobs_total": len(current_jobs), "classification": classification["state"],
        }
        snapshots.append(snap)
        print(json.dumps(snap), flush=True)
        if classification["state"] == "clean_exact" and not current_active:
            clean_streak += 1
            if clean_streak >= 2:
                final_items = current_items
                final_stats = current_stats
                break
        else:
            clean_streak = 0
        if not current_active and classification["state"] != "clean_exact" and not sync_seen and triggered is None:
            triggered = dict(req("POST", url(account, TARGET, "/jobs"), token, json={"description": "WPA filtered v3 exclude three empty CSVs"}).get("result") or {})
            dump(out / "triggered-job.json", triggered)
            sync_seen = True
        if time.monotonic() >= deadline:
            dump(out / "poll-snapshots.json", snapshots)
            raise GuardError(f"cleanup verification timeout after {TIMEOUT} seconds; last={snap}")
        time.sleep(POLL)

    dump(out / "poll-snapshots.json", snapshots)
    dump(out / "final-stats.json", final_stats)
    dump(out / "final-items.json", final_items)
    source_after = source_reference(account, token)
    if source_after["keys_sha256"] != EXPECTED_SOURCE_SHA:
        raise GuardError("source manifest changed during cleanup")
    tests = smoke(account, token)
    result = {
        "schema": "wpa-ai-search-v3-filtered-cleanup-result/1", "status": "clean_790_verified", "target": TARGET,
        "updated": update_result is not None, "triggered_job": triggered,
        "source_manifest_sha256": source_after["keys_sha256"], "allowed_manifest_sha256": allowed["keys_sha256"],
        "exclude_items": EXCLUDES, "stats": final_stats, "item_count": final_items["count"],
        "item_keys_sha256": final_items["keys_sha256"], "smoke_tests": tests,
        "r2_objects_untouched": True, "production_cutover_performed": False,
        "quarantined_instance_untouched": "protocol-ai-v3-clean",
    }
    dump(out / "result.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def self_test() -> None:
    source_keys = [PREFIX + f"x/{i}.json" for i in range(EXPECTED_ALLOWED)] + EXCLUDES
    source = {"keys": sorted(source_keys), "count": EXPECTED_SOURCE, "keys_sha256": keys_digest(source_keys)}
    allowed = allowed_reference(source)
    assert allowed["count"] == EXPECTED_ALLOWED
    assert not set(EXCLUDES) & set(allowed["keys"])
    rows = [{"key": k, "status": "completed", "error": ""} for k in allowed["keys"]]
    rows += [{"key": k, "status": "error", "error": "file_content_empty"} for k in EXCLUDES]
    snap = {
        "count": len(rows), "keys": sorted(r["key"] for r in rows),
        "keys_sha256": keys_digest([r["key"] for r in rows]), "rows_sha256": sha(sorted(rows, key=lambda r: r["key"])),
        "status_counts": dict(Counter(r["status"] for r in rows)), "error_counts": {"file_content_empty": 3},
        "rows": sorted(rows, key=lambda r: r["key"]),
    }
    assert validate_pre_state(snap, source, {"completed": 790, "error": 3})["state"] == "pre_clean_exact"
    clean_rows = [r for r in rows if r["key"] not in EXCLUDES]
    clean_snap = dict(snap)
    clean_snap.update({"count": 790, "keys": sorted(r["key"] for r in clean_rows), "keys_sha256": keys_digest([r["key"] for r in clean_rows]), "rows": clean_rows})
    assert validate_clean_state(clean_snap, allowed, {"completed": 790})["state"] == "clean_exact"
    print("guarded filtered cleanup self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("PLAN", "STATUS", "APPLY"))
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument("--approved-plan-sha256", default="")
    parser.add_argument("--out", default="/tmp/ai-search-v3-filtered-cleanup")
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
        raise GuardError("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_SEARCH_TOKEN are required")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    try:
        if args.mode == "PLAN":
            plan(account, token, out)
        elif args.mode == "STATUS":
            observe(account, token, out)
        else:
            apply(account, token, args.approval, args.approved_plan_sha256.strip().lower(), out)
    except Exception as exc:
        dump(out / "failure.json", {"status": "failed", "mode": args.mode, "error": str(exc)})
        raise


if __name__ == "__main__":
    main()

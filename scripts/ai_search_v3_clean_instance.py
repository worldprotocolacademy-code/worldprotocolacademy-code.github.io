#!/usr/bin/env python3
"""Create and verify a clean AI Search v3 instance backed by one locked R2 prefix."""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import requests

API = "https://api.cloudflare.com/client/v4"
SOURCE_INSTANCE = "protocol-ai"
CLEAN_INSTANCE = "protocol-ai-v3-clean"
BUCKET = "protocol-kb"
PREFIX = "__ai_search_ready_v3__/80cd2f51cf9ddb429562/"
EXPECTED_OBJECTS = 793
JOB_DESCRIPTION = "WPA clean v3 prefix verification 80cd2f51"
POLL_SECONDS = int(os.getenv("AI_SEARCH_CLEAN_POLL_SECONDS", "10"))
TIMEOUT_SECONDS = int(os.getenv("AI_SEARCH_CLEAN_TIMEOUT_SECONDS", "3600"))
SMOKE_QUERIES = (
    "U-shaped conference room seating configuration",
    "diplomatic protocol and safety",
    "ethical teachings and professional ethics",
)


class CleanInstanceError(RuntimeError):
    pass


def write_json(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def api_request(
    method: str,
    url: str,
    token: str,
    *,
    allow_404: bool = False,
    **kwargs: Any,
) -> dict[str, Any] | None:
    headers = dict(kwargs.pop("headers", {}) or {})
    headers["Authorization"] = f"Bearer {token}"
    if "json" in kwargs:
        headers.setdefault("Content-Type", "application/json")
    response = requests.request(method, url, headers=headers, timeout=120, **kwargs)
    if allow_404 and response.status_code == 404:
        return None
    try:
        payload = response.json()
    except ValueError as exc:
        raise CleanInstanceError(
            f"Cloudflare API returned non-JSON HTTP {response.status_code}: {response.text[:500]}"
        ) from exc
    if not response.ok or payload.get("success") is False:
        raise CleanInstanceError(
            f"Cloudflare API {method} {url} failed HTTP {response.status_code}: {payload}"
        )
    return payload


def instance_url(account_id: str, instance_id: str = CLEAN_INSTANCE) -> str:
    return f"{API}/accounts/{account_id}/ai-search/instances/{instance_id}"


def get_instance(account_id: str, token: str, instance_id: str = CLEAN_INSTANCE) -> dict[str, Any] | None:
    payload = api_request("GET", instance_url(account_id, instance_id), token, allow_404=True)
    return None if payload is None else dict(payload.get("result") or {})


def get_stats(account_id: str, token: str) -> dict[str, Any]:
    payload = api_request("GET", instance_url(account_id) + "/stats", token)
    return dict((payload or {}).get("result") or {})


def list_jobs(account_id: str, token: str) -> list[dict[str, Any]]:
    payload = api_request(
        "GET",
        instance_url(account_id) + "/jobs",
        token,
        params={"page": 1, "per_page": 50},
    )
    return list((payload or {}).get("result") or [])


def trigger_job(account_id: str, token: str) -> dict[str, Any]:
    payload = api_request(
        "POST",
        instance_url(account_id) + "/jobs",
        token,
        json={"description": JOB_DESCRIPTION},
    )
    return dict((payload or {}).get("result") or {})


def verify_service_token_id(account_id: str, token: str) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    errors: list[str] = []
    for url in (
        f"{API}/accounts/{account_id}/tokens/verify",
        f"{API}/user/tokens/verify",
    ):
        try:
            response = requests.get(url, headers=headers, timeout=60)
            if response.status_code in (401, 403, 404):
                errors.append(f"{response.status_code} from {url}")
                continue
            response.raise_for_status()
            payload = response.json()
            result = payload.get("result") or {}
            if payload.get("success") is True and result.get("id") and result.get("status") == "active":
                return str(result["id"])
            errors.append(f"invalid verification response from {url}")
        except (requests.RequestException, ValueError) as exc:
            errors.append(f"{url}: {exc}")
    raise CleanInstanceError("unable to verify R2 service token: " + "; ".join(errors))


def expected_source_params() -> dict[str, Any]:
    return {"prefix": PREFIX, "r2_jurisdiction": "default"}


def normalized_source_params(value: dict[str, Any] | None) -> dict[str, Any]:
    value = value or {}
    return {
        "prefix": value.get("prefix") or "",
        "r2_jurisdiction": value.get("r2_jurisdiction") or "default",
        "include_items": sorted(value.get("include_items") or []),
        "exclude_items": sorted(value.get("exclude_items") or []),
    }


def verify_instance_shape(instance: dict[str, Any]) -> None:
    if instance.get("id") not in (None, CLEAN_INSTANCE):
        raise CleanInstanceError(f"unexpected instance id: {instance.get('id')}")
    if instance.get("type") != "r2":
        raise CleanInstanceError(f"clean instance type must be r2, got {instance.get('type')}")
    if instance.get("source") != BUCKET:
        raise CleanInstanceError(f"clean instance source must be {BUCKET}, got {instance.get('source')}")
    actual = normalized_source_params(instance.get("source_params"))
    wanted = normalized_source_params(expected_source_params())
    if actual != wanted:
        raise CleanInstanceError(f"clean instance source_params mismatch: expected={wanted} actual={actual}")


def create_instance(account_id: str, ai_token: str, r2_token: str) -> dict[str, Any]:
    token_id = verify_service_token_id(account_id, r2_token)
    body = {
        "id": CLEAN_INSTANCE,
        "type": "r2",
        "source": BUCKET,
        "token_id": token_id,
        "source_params": expected_source_params(),
    }
    payload = api_request(
        "POST",
        f"{API}/accounts/{account_id}/ai-search/instances",
        ai_token,
        json=body,
    )
    result = dict((payload or {}).get("result") or {})
    verify_instance_shape(result)
    return result


def list_all_items(account_id: str, token: str) -> list[dict[str, Any]]:
    url = instance_url(account_id) + "/items"
    items: list[dict[str, Any]] = []
    page = 1
    total_count: int | None = None
    while True:
        payload = api_request(
            "GET",
            url,
            token,
            params={"page": page, "per_page": 50},
        ) or {}
        batch = list(payload.get("result") or [])
        info = payload.get("result_info") or {}
        if info.get("total_count") is not None:
            total_count = int(info["total_count"])
        items.extend(batch)
        if total_count is not None:
            if len(items) >= total_count:
                break
        elif len(batch) < 50:
            break
        page += 1
        if page > 200:
            raise CleanInstanceError("item pagination safety limit exceeded")
    if total_count is not None and len(items) != total_count:
        raise CleanInstanceError(
            f"incomplete item snapshot: expected total_count={total_count}, received={len(items)}"
        )
    return items


def item_key(item: dict[str, Any]) -> str:
    for field in ("key", "name", "filename", "path", "source_key"):
        value = item.get(field)
        if value:
            return str(value)
    return ""


def item_status(item: dict[str, Any]) -> str:
    return str(item.get("status") or item.get("indexing_status") or item.get("state") or "").lower()


def verify_items(items: list[dict[str, Any]]) -> dict[str, Any]:
    keys = [item_key(item) for item in items]
    if any(not key for key in keys):
        raise CleanInstanceError("clean instance contains an item with an empty key")
    if len(set(keys)) != len(keys):
        raise CleanInstanceError("clean instance contains duplicate item keys")
    outside = sorted(key for key in keys if not key.startswith(PREFIX))
    statuses: dict[str, int] = {}
    for item in items:
        status = item_status(item)
        statuses[status] = statuses.get(status, 0) + 1
    indexed = sum(
        count
        for status, count in statuses.items()
        if status in {"indexed", "completed", "complete", "ok"}
    )
    result = {
        "total": len(items),
        "unique_keys": len(set(keys)),
        "indexed": indexed,
        "statuses": statuses,
        "outside_prefix": outside,
        "first_key": min(keys) if keys else None,
        "last_key": max(keys) if keys else None,
    }
    if len(items) != EXPECTED_OBJECTS:
        raise CleanInstanceError(
            f"clean instance item count mismatch: expected={EXPECTED_OBJECTS} actual={len(items)}"
        )
    if outside:
        raise CleanInstanceError(f"clean instance contains {len(outside)} keys outside locked prefix")
    if indexed != EXPECTED_OBJECTS:
        raise CleanInstanceError(
            f"clean instance indexed count mismatch: expected={EXPECTED_OBJECTS} actual={indexed}; statuses={statuses}"
        )
    return result


def search_query(account_id: str, token: str, query: str) -> dict[str, Any]:
    payload = api_request(
        "POST",
        instance_url(account_id) + "/search",
        token,
        json={"messages": [{"role": "user", "content": query}]},
    )
    return dict((payload or {}).get("result") or {})


def result_count(result: dict[str, Any]) -> int:
    for field in ("chunks", "data", "results"):
        value = result.get(field)
        if isinstance(value, list):
            return len(value)
    response = result.get("response")
    if isinstance(response, dict):
        for field in ("chunks", "data", "results"):
            value = response.get(field)
            if isinstance(value, list):
                return len(value)
    return 0


def run_smoke_tests(account_id: str, token: str) -> list[dict[str, Any]]:
    evidence: list[dict[str, Any]] = []
    for query in SMOKE_QUERIES:
        result = search_query(account_id, token, query)
        count = result_count(result)
        evidence.append({"query": query, "result_count": count})
        if count < 1:
            raise CleanInstanceError(f"smoke query returned no searchable chunks: {query}")
    return evidence


def terminal_stats(stats: dict[str, Any]) -> bool:
    return int(stats.get("queued") or 0) == 0 and int(stats.get("running") or 0) == 0


def verify_zero_state_stats(stats: dict[str, Any]) -> None:
    completed = int(stats.get("completed") or 0)
    skipped = int(stats.get("skipped") or 0)
    errors = int(stats.get("error") or stats.get("errors") or 0)
    queued = int(stats.get("queued") or 0)
    running = int(stats.get("running") or 0)
    if (completed, skipped, errors, queued, running) != (EXPECTED_OBJECTS, 0, 0, 0, 0):
        raise CleanInstanceError(
            "clean stats mismatch: "
            f"expected completed/skipped/errors/queued/running={EXPECTED_OBJECTS}/0/0/0/0 "
            f"actual={completed}/{skipped}/{errors}/{queued}/{running}"
        )


def observe(account_id: str, token: str) -> dict[str, Any]:
    instance = get_instance(account_id, token)
    if instance is None:
        return {"status": "absent", "instance_id": CLEAN_INSTANCE}
    verify_instance_shape(instance)
    jobs = sorted(
        list_jobs(account_id, token),
        key=lambda job: (str(job.get("started_at") or ""), str(job.get("id") or "")),
        reverse=True,
    )
    stats = get_stats(account_id, token)
    active = [job for job in jobs if not job.get("ended_at")]
    return {
        "status": "observed",
        "instance": instance,
        "stats": stats,
        "active_jobs": active,
        "latest_job": jobs[0] if jobs else None,
    }


def plan(account_id: str, ai_token: str, out: Path) -> None:
    source = get_instance(account_id, ai_token, SOURCE_INSTANCE)
    if source is None:
        raise CleanInstanceError(f"source instance {SOURCE_INSTANCE} does not exist")
    state = observe(account_id, ai_token)
    result = {
        "status": "planned",
        "source_instance": SOURCE_INSTANCE,
        "clean_instance": CLEAN_INSTANCE,
        "bucket": BUCKET,
        "prefix": PREFIX,
        "expected_objects": EXPECTED_OBJECTS,
        "current_clean_state": state,
        "mutations_on_apply": [
            "create protocol-ai-v3-clean only if absent",
            "trigger or continue indexing only on protocol-ai-v3-clean",
        ],
        "never_mutated": [
            "protocol-ai",
            "protocol-kb objects",
            "production Worker configuration",
        ],
    }
    write_json(out / "plan.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def status(account_id: str, ai_token: str, out: Path) -> None:
    result = observe(account_id, ai_token)
    if result.get("status") == "observed" and terminal_stats(result.get("stats") or {}):
        try:
            items = list_all_items(account_id, ai_token)
            result["item_verification"] = verify_items(items)
            verify_zero_state_stats(result.get("stats") or {})
            result["clean_zero_state"] = True
        except Exception as exc:
            result["clean_zero_state"] = False
            result["verification_error"] = str(exc)
    write_json(out / "status.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def apply(account_id: str, ai_token: str, r2_token: str, approval: str, out: Path) -> None:
    if approval != "APPROVE_CREATE_CLEAN_V3":
        raise CleanInstanceError("APPLY requires approval=APPROVE_CREATE_CLEAN_V3")
    source = get_instance(account_id, ai_token, SOURCE_INSTANCE)
    if source is None:
        raise CleanInstanceError(f"source instance {SOURCE_INSTANCE} does not exist")
    write_json(out / "source-instance.json", source)

    clean = get_instance(account_id, ai_token)
    created = False
    if clean is None:
        clean = create_instance(account_id, ai_token, r2_token)
        created = True
    else:
        verify_instance_shape(clean)
    write_json(out / "clean-instance.json", clean)

    stats = get_stats(account_id, ai_token)
    jobs = list_jobs(account_id, ai_token)
    active = [job for job in jobs if not job.get("ended_at")]
    started_job: dict[str, Any] | None = None
    if not active and not (
        terminal_stats(stats)
        and int(stats.get("completed") or 0) == EXPECTED_OBJECTS
        and int(stats.get("skipped") or 0) == 0
        and int(stats.get("error") or stats.get("errors") or 0) == 0
    ):
        started_job = trigger_job(account_id, ai_token)
        write_json(out / "triggered-job.json", started_job)

    deadline = time.monotonic() + TIMEOUT_SECONDS
    snapshots: list[dict[str, Any]] = []
    while True:
        instance = get_instance(account_id, ai_token)
        if instance is None:
            raise CleanInstanceError("clean instance disappeared during verification")
        verify_instance_shape(instance)
        stats = get_stats(account_id, ai_token)
        jobs = list_jobs(account_id, ai_token)
        active = [job for job in jobs if not job.get("ended_at")]
        snapshot = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "instance_status": instance.get("status"),
            "completed": int(stats.get("completed") or 0),
            "skipped": int(stats.get("skipped") or 0),
            "errors": int(stats.get("error") or stats.get("errors") or 0),
            "queued": int(stats.get("queued") or 0),
            "running": int(stats.get("running") or 0),
            "active_jobs": len(active),
        }
        snapshots.append(snapshot)
        print(json.dumps(snapshot), flush=True)
        if not active and terminal_stats(stats):
            break
        if time.monotonic() >= deadline:
            raise CleanInstanceError(f"clean instance indexing timeout after {TIMEOUT_SECONDS} seconds")
        time.sleep(POLL_SECONDS)

    write_json(out / "poll-snapshots.json", snapshots)
    write_json(out / "final-stats.json", stats)
    verify_zero_state_stats(stats)
    items = list_all_items(account_id, ai_token)
    item_verification = verify_items(items)
    write_json(out / "item-verification.json", item_verification)
    smoke = run_smoke_tests(account_id, ai_token)
    write_json(out / "smoke-tests.json", smoke)
    result = {
        "status": "clean_v3_verified",
        "created": created,
        "triggered_job": started_job,
        "instance_id": CLEAN_INSTANCE,
        "source_instance_untouched": SOURCE_INSTANCE,
        "r2_objects_untouched": True,
        "stats": stats,
        "item_verification": item_verification,
        "smoke_tests": smoke,
    }
    write_json(out / "result.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def self_test() -> None:
    assert normalized_source_params(expected_source_params()) == {
        "prefix": PREFIX,
        "r2_jurisdiction": "default",
        "include_items": [],
        "exclude_items": [],
    }
    fake = [
        {"key": f"{PREFIX}a.pdf", "status": "indexed"},
        {"key": f"{PREFIX}b.json", "status": "completed"},
    ]
    global EXPECTED_OBJECTS
    original = EXPECTED_OBJECTS
    try:
        EXPECTED_OBJECTS = 2
        result = verify_items(fake)
        assert result["indexed"] == 2
    finally:
        EXPECTED_OBJECTS = original
    assert terminal_stats({"queued": 0, "running": 0})
    assert not terminal_stats({"queued": 1, "running": 0})
    print("clean instance self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("PLAN", "APPLY", "STATUS"))
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument("--out", default="/tmp/ai-search-v3-clean-instance")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if not args.mode:
        parser.error("--mode is required unless --self-test is used")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    ai_token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    r2_token = os.environ.get("CLOUDFLARE_R2_API_TOKEN", "")
    if not account_id or not ai_token:
        raise CleanInstanceError("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_SEARCH_TOKEN are required")
    if args.mode == "APPLY" and not r2_token:
        raise CleanInstanceError("CLOUDFLARE_R2_API_TOKEN is required for APPLY")
    try:
        if args.mode == "PLAN":
            plan(account_id, ai_token, out)
        elif args.mode == "STATUS":
            status(account_id, ai_token, out)
        elif args.mode == "APPLY":
            apply(account_id, ai_token, r2_token, args.approval, out)
    except Exception as exc:
        write_json(out / "failure.json", {"status": "failed", "mode": args.mode, "error": str(exc)})
        raise


if __name__ == "__main__":
    main()

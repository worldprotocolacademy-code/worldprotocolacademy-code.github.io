#!/usr/bin/env python3
"""Recover the existing final AI Search instance after an initial job_start_failed.

This controller never creates or deletes an instance and never mutates R2. It may
create exactly one indexing job on protocol-ai-v3-final after strict preflight.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from collections import Counter
from pathlib import Path
from typing import Any

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v3_final_instance_source_locked as locked

controller = locked.controller
APPROVAL = "APPROVE_RECOVER_FINAL_V3_SYNC"
DESCRIPTION = "WPA final v3 recovery sync after job_start_failed"
POLL = int(os.getenv("AI_SEARCH_FINAL_RECOVERY_POLL_SECONDS", "20"))
TIMEOUT = int(os.getenv("AI_SEARCH_FINAL_RECOVERY_TIMEOUT_SECONDS", "10800"))
ZERO_STATS = (0, 0, 0, 0, 0, 0)


def dump(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def stat_tuple(value: dict[str, Any]) -> tuple[int, int, int, int, int, int]:
    return (
        int(value.get("completed") or 0),
        int(value.get("skipped") or 0),
        int(value.get("error") or value.get("errors") or 0),
        int(value.get("queued") or 0),
        int(value.get("running") or 0),
        int(value.get("outdated") or 0),
    )


def preflight(account: str, token: str) -> dict[str, Any]:
    source = controller.source_manifest(account, token)
    allowed = controller.allowed_manifest(source)

    target = controller.instance(account, token, controller.TARGET)
    if target is None:
        raise controller.GuardError("final target is absent")
    controller.verify_filters(target, controller.TARGET)
    if target.get("engine_version") != 3:
        raise controller.GuardError("final target engine_version is not 3")
    if target.get("enable") is not True or target.get("paused") is True:
        raise controller.GuardError("final target is disabled or paused")

    items = controller.all_items(account, token, controller.TARGET)
    if items:
        raise controller.GuardError(
            f"recovery requires zero existing items, found {len(items)}"
        )

    value_stats = controller.stats(account, token, controller.TARGET)
    actual_stats = stat_tuple(value_stats)
    engine = value_stats.get("engine") or {}
    object_count = int(((engine.get("r2") or {}).get("objectCount") or 0))
    vectors_count = int(((engine.get("vectorize") or {}).get("vectorsCount") or 0))
    if actual_stats != ZERO_STATS or object_count != 0 or vectors_count != 0:
        raise controller.GuardError(
            "recovery requires empty target state: "
            f"stats={actual_stats} objectCount={object_count} vectorsCount={vectors_count}"
        )

    job_values = controller.jobs(account, token, controller.TARGET)
    if not job_values:
        raise controller.GuardError("recovery requires at least one failed initial job")
    unexpected = [
        job
        for job in job_values
        if str(job.get("end_reason") or "").lower() != "job_start_failed"
    ]
    if unexpected:
        raise controller.GuardError(
            f"recovery blocked by non-job_start_failed jobs: {unexpected[:3]}"
        )
    if controller.active_jobs(job_values):
        raise controller.GuardError("recovery blocked because an indexing job is active")

    return {
        "schema": "wpa-ai-search-v3-final-recovery-preflight/1",
        "target": controller.TARGET,
        "target_status": target.get("status"),
        "source_manifest_count": source["count"],
        "source_manifest_sha256": source["sha256"],
        "allowed_manifest_count": allowed["count"],
        "allowed_manifest_sha256": allowed["sha256"],
        "item_count": 0,
        "stats": value_stats,
        "engine_object_count": object_count,
        "vectors_count": vectors_count,
        "failed_jobs": [
            {
                "id": job.get("id"),
                "source": job.get("source"),
                "end_reason": job.get("end_reason"),
                "started_at": job.get("started_at"),
                "last_seen_at": job.get("last_seen_at"),
            }
            for job in job_values
        ],
        "active_jobs": 0,
        "will_create_exactly_one_job": True,
        "r2_objects_mutated": False,
        "instance_created_or_deleted": False,
        "production_cutover_performed": False,
    }


def job_details(account: str, token: str, job_id: str) -> dict[str, Any]:
    payload = controller.req(
        "GET",
        controller.url(account, controller.TARGET, f"/jobs/{job_id}"),
        token,
    ) or {}
    return dict(payload.get("result") or {})


def job_logs(account: str, token: str, job_id: str) -> list[dict[str, Any]]:
    payload = controller.req(
        "GET",
        controller.url(account, controller.TARGET, f"/jobs/{job_id}/logs"),
        token,
        params={"page": 1, "per_page": 50},
    ) or {}
    return list(payload.get("result") or [])


def recover(account: str, token: str, approval: str, out: Path) -> None:
    if approval != APPROVAL:
        raise controller.GuardError(f"RECOVER requires approval={APPROVAL}")

    checked = preflight(account, token)
    dump(out / "preflight.json", checked)

    created_payload = controller.req(
        "POST",
        controller.url(account, controller.TARGET, "/jobs"),
        token,
        json={"description": DESCRIPTION},
    ) or {}
    created = dict(created_payload.get("result") or {})
    job_id = str(created.get("id") or "")
    if not job_id:
        raise controller.GuardError("Cloudflare did not return a recovery job id")
    if str(created.get("source") or "").lower() not in {"user", ""}:
        raise controller.GuardError(f"unexpected recovery job source: {created}")
    dump(out / "created-job.json", created)

    deadline = time.monotonic() + TIMEOUT
    snapshots: list[dict[str, Any]] = []
    clean_streak = 0
    time.sleep(15)

    while True:
        details = job_details(account, token, job_id)
        values = controller.all_items(account, token, controller.TARGET)
        value_stats = controller.stats(account, token, controller.TARGET)
        all_jobs = controller.jobs(account, token, controller.TARGET)
        snap = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "job_id": job_id,
            "job": details,
            "item_count": len(values),
            "status_counts": dict(Counter(controller.status(item) for item in values)),
            "stats": value_stats,
            "active_jobs": len(controller.active_jobs(all_jobs)),
            "jobs_total": len(all_jobs),
        }
        snapshots.append(snap)
        print(json.dumps(snap, ensure_ascii=False), flush=True)

        end_reason = str(details.get("end_reason") or "").lower()
        if end_reason in {"job_start_failed", "failed", "error", "cancelled", "canceled"}:
            logs = job_logs(account, token, job_id)
            dump(out / "recovery-job-logs.json", logs)
            dump(out / "poll-snapshots.json", snapshots)
            raise controller.GuardError(
                f"recovery job ended unsuccessfully: {end_reason}; logs={logs[-5:]}"
            )

        try:
            source = controller.source_manifest(account, token)
            allowed = controller.allowed_manifest(source)
            clean = controller.clean_state(account, token, allowed)
            clean_streak += 1
            if clean_streak >= 2:
                result = {
                    "schema": "wpa-ai-search-v3-final-recovery-result/1",
                    "status": "final_clean_790_verified",
                    "target": controller.TARGET,
                    "source_manifest_sha256": source["sha256"],
                    "active_manifest_sha256": allowed["sha256"],
                    **clean,
                    "recovery_job": created,
                    "recovery_job_details": details,
                    "smoke_tests": controller.smoke(account, token),
                    "production_cutover_performed": False,
                    "r2_objects_mutated": False,
                    "old_instances_deleted": False,
                }
                dump(out / "poll-snapshots.json", snapshots)
                dump(out / "result.json", result)
                print(json.dumps(result, ensure_ascii=False, indent=2))
                return
        except controller.GuardError:
            clean_streak = 0

        if time.monotonic() >= deadline:
            logs = job_logs(account, token, job_id)
            dump(out / "recovery-job-logs.json", logs)
            dump(out / "poll-snapshots.json", snapshots)
            raise controller.GuardError(
                f"recovery timeout after {TIMEOUT} seconds; last={snap}; logs={logs[-5:]}"
            )
        time.sleep(POLL)


def self_test() -> None:
    assert APPROVAL == "APPROVE_RECOVER_FINAL_V3_SYNC"
    assert DESCRIPTION
    assert ZERO_STATS == (0, 0, 0, 0, 0, 0)
    assert controller.TARGET == "protocol-ai-v3-final"
    assert controller.EXPECTED_SOURCE == 793
    assert controller.EXPECTED_ACTIVE == 790
    print("guarded final AI Search recovery self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument("--out", default="/tmp/ai-search-v3-final-recovery")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return

    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
    token = os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN", "")
    if not account or not token:
        raise controller.GuardError("Cloudflare credentials are required")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    try:
        recover(account, token, args.approval, out)
    except Exception as exc:
        dump(
            out / "failure.json",
            {
                "schema": "wpa-ai-search-v3-final-recovery-failure/1",
                "status": "failed",
                "target": controller.TARGET,
                "error": str(exc),
                "post_may_have_been_accepted": isinstance(
                    exc, controller.requests.exceptions.RequestException
                ),
                "instruction": "Do not rerun RECOVER; run STATUS and DIAGNOSE only.",
            },
        )
        raise


if __name__ == "__main__":
    main()

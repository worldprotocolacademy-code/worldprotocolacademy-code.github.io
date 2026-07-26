#!/usr/bin/env python3
"""Run the locked v3 cutover controller with enhanced read-only job visibility."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import ai_search_v3_cutover as cutover


def job_sort_key(job: dict) -> tuple[str, str]:
    return (str(job.get("started_at") or ""), str(job.get("id") or ""))


def enhanced_status(account_id: str, ai_token: str, out: Path) -> None:
    instance = cutover.get_instance(account_id, ai_token)
    jobs = cutover.list_jobs(account_id, ai_token)
    stats = cutover.get_stats(account_id, ai_token)
    ordered_jobs = sorted(jobs, key=job_sort_key, reverse=True)

    config_state = "v3_cutover" if cutover.same_source_params(
        instance.get("source_params"), cutover.CUTOVER_SOURCE_PARAMS
    ) else (
        "baseline" if cutover.same_source_params(
            instance.get("source_params"), cutover.BASELINE_SOURCE_PARAMS
        ) else "unexpected"
    )

    latest_job = ordered_jobs[0] if ordered_jobs else None
    active_jobs = [job for job in ordered_jobs if not job.get("ended_at")]
    latest_active_job = active_jobs[0] if active_jobs else None
    latest_cutover = cutover.find_job(jobs, cutover.JOB_DESCRIPTION)
    latest_rollback = cutover.find_job(jobs, cutover.ROLLBACK_JOB_DESCRIPTION)

    superseding_job = None
    if latest_cutover and latest_cutover.get("end_reason") == "new_job_has_started":
        cutover_end = str(latest_cutover.get("ended_at") or "")
        later = [
            job for job in ordered_jobs
            if str(job.get("started_at") or "") >= cutover_end
            and job.get("id") != latest_cutover.get("id")
        ]
        superseding_job = later[0] if later else latest_active_job

    workset = {
        "expected_objects": cutover.EXPECTED_OBJECTS,
        "completed": int(stats.get("completed") or 0),
        "queued": int(stats.get("queued") or 0),
        "running": int(stats.get("running") or 0),
    }
    workset["active_total"] = workset["completed"] + workset["queued"] + workset["running"]
    workset["matches_expected"] = workset["active_total"] == cutover.EXPECTED_OBJECTS

    result = {
        "status": "observed",
        "config_state": config_state,
        "instance_status": instance.get("status"),
        "paused": instance.get("paused"),
        "latest_job": latest_job,
        "latest_active_job": latest_active_job,
        "active_jobs": active_jobs,
        "latest_cutover_job": latest_cutover,
        "superseding_job": superseding_job,
        "latest_rollback_job": latest_rollback,
        "current_workset": workset,
        "stats": stats,
    }
    cutover.write_json(out / "instance.json", instance)
    cutover.write_json(out / "jobs.json", ordered_jobs)
    cutover.write_json(out / "active-jobs.json", active_jobs)
    cutover.write_json(out / "stats.json", stats)
    cutover.write_json(out / "result.json", result)
    print(json.dumps(result, indent=2))


def self_test() -> None:
    jobs = [
        {"id": "old", "started_at": "2026-07-26 17:10:45", "ended_at": "2026-07-26 17:20:38"},
        {"id": "new", "started_at": "2026-07-26 17:20:38", "ended_at": None},
    ]
    ordered = sorted(jobs, key=job_sort_key, reverse=True)
    assert ordered[0]["id"] == "new"
    assert [job["id"] for job in ordered if not job.get("ended_at")] == ["new"]
    print("cutover runner self-test: OK")


cutover.status = enhanced_status

if __name__ == "__main__":
    if "--runner-self-test" in sys.argv:
        self_test()
    else:
        cutover.main()

#!/usr/bin/env python3
"""Recover hash-verified non-completed items in protocol-ai-v4-final.

This controller never uploads, deletes, or replaces files. It requires the exact
locked 790-key target, verifies source and target bytes by SHA-256, and issues a
single non-retried Cloudflare Sync Item PATCH for error items and stale running
items. It never changes R2, the production Worker, or old AI Search instances.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v4_builtin_final_r2 as wrapper

migration = wrapper.migration
TARGET = migration.TARGET
APPROVAL = "APPROVE_RECOVER_BUILTIN_FINAL_790"
STALE_SECONDS = int(os.getenv("AI_SEARCH_RECOVERY_STALE_SECONDS", "1800"))
POLL_SECONDS = int(os.getenv("AI_SEARCH_RECOVERY_POLL_SECONDS", "30"))
TIMEOUT_SECONDS = int(os.getenv("AI_SEARCH_RECOVERY_TIMEOUT_SECONDS", "7200"))


def dump(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def parse_cloudflare_time(value: str) -> datetime:
    if not value:
        raise migration.controller.GuardError("target stats have no last_activity")
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)


def snapshot(account: str, token: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    source, allowed, source_items = migration.source_items(account, token)
    expected = migration.expected_keys(source_items)
    current = migration.list_items(account, token, TARGET)
    keys = sorted(str(item.get("key") or "") for item in current)
    if keys != expected:
        raise migration.controller.GuardError(
            f"target key set mismatch count={len(keys)} sha={migration.controller.digest(keys)}"
        )
    if len(current) != 790:
        raise migration.controller.GuardError(f"target must contain exactly 790 items, got {len(current)}")
    source_ids = {str(item.get("source_id") or "") for item in current}
    if source_ids - {"builtin", ""}:
        raise migration.controller.GuardError(f"target contains non-builtin sources: {source_ids}")
    stats = migration.target_stats(account, token)
    return source_items, {
        "source_manifest_sha256": source["sha256"],
        "allowed_manifest_sha256": allowed["sha256"],
        "target_key_sha256": migration.controller.digest(expected),
        "items": current,
        "stats": stats,
    }


def classify_non_completed(value: dict[str, Any]) -> tuple[list[dict[str, Any]], float]:
    current = value["items"]
    stats = value["stats"]
    status_counts = Counter(str(item.get("status") or "").lower() for item in current)
    last_activity = parse_cloudflare_time(str(stats.get("last_activity") or ""))
    age_seconds = (datetime.now(timezone.utc) - last_activity).total_seconds()
    errors = [item for item in current if str(item.get("status") or "").lower() == "error"]
    running = [item for item in current if str(item.get("status") or "").lower() == "running"]
    unsupported = [
        item for item in current
        if str(item.get("status") or "").lower() not in migration.INDEXED | {"error", "running"}
    ]
    if unsupported:
        raise migration.controller.GuardError(
            f"target contains unsupported non-completed statuses: {[(i.get('key'), i.get('status')) for i in unsupported[:5]]}"
        )
    if running and age_seconds < STALE_SECONDS:
        raise migration.controller.GuardError(
            f"running items are not stale enough: count={len(running)} age_seconds={int(age_seconds)}"
        )
    eligible = errors + running
    if len(eligible) > 30:
        raise migration.controller.GuardError(f"refusing to recover more than 30 items: {len(eligible)}")
    value["status_counts"] = dict(status_counts)
    value["last_activity_age_seconds"] = int(age_seconds)
    return eligible, age_seconds


def verify_hashes(
    account: str,
    token: str,
    source_items: list[dict[str, Any]],
    eligible: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    source_by_target_key = {
        migration.target_key(migration.controller.key(item)): item for item in source_items
    }
    evidence = []
    for target_item in eligible:
        key = str(target_item.get("key") or "")
        source_item = source_by_target_key.get(key)
        if source_item is None:
            raise migration.controller.GuardError(f"eligible target key is foreign: {key}")
        source_content = migration.download_item(
            account, token, migration.controller.SOURCE, migration.item_id(source_item)
        )
        target_content = wrapper._original_download_item(
            account, token, TARGET, migration.item_id(target_item)
        )
        source_sha = hashlib.sha256(source_content).hexdigest()
        target_sha = hashlib.sha256(target_content).hexdigest()
        if source_sha != target_sha:
            raise migration.controller.GuardError(f"content hash mismatch for target key={key}")
        evidence.append({
            "target_item_id": migration.item_id(target_item),
            "target_key": key,
            "previous_status": target_item.get("status"),
            "previous_error": target_item.get("error"),
            "sha256": source_sha,
            "bytes": len(source_content),
        })
    return evidence


def build_plan(account: str, token: str) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    source_items, value = snapshot(account, token)
    eligible, _ = classify_non_completed(value)
    verified = verify_hashes(account, token, source_items, eligible)
    result = {
        "schema": "wpa-ai-search-v4-builtin-recovery-plan/1",
        "status": "planned",
        "target": TARGET,
        "item_count": 790,
        "eligible_count": len(verified),
        "eligible_status_counts": dict(Counter(str(v["previous_status"]).lower() for v in verified)),
        "last_activity_age_seconds": value["last_activity_age_seconds"],
        "status_counts": value["status_counts"],
        "stats": value["stats"],
        "source_manifest_sha256": value["source_manifest_sha256"],
        "allowed_manifest_sha256": value["allowed_manifest_sha256"],
        "target_key_sha256": value["target_key_sha256"],
        "verified_items": verified,
        "r2_objects_mutated": False,
        "uploads_performed": False,
        "production_cutover_performed": False,
        "old_instances_deleted": False,
    }
    return result, eligible, verified


def run_status(account: str, token: str, out: Path) -> None:
    source_items, value = snapshot(account, token)
    del source_items
    counts = dict(Counter(str(item.get("status") or "").lower() for item in value["items"]))
    result = {
        "schema": "wpa-ai-search-v4-builtin-recovery-status/1",
        "status": "present",
        "read_only": True,
        "target": TARGET,
        "item_count": len(value["items"]),
        "status_counts": counts,
        "stats": value["stats"],
        "source_manifest_sha256": value["source_manifest_sha256"],
        "allowed_manifest_sha256": value["allowed_manifest_sha256"],
        "target_key_sha256": value["target_key_sha256"],
    }
    dump(out / "status.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def run_plan(account: str, token: str, out: Path) -> None:
    result, _, _ = build_plan(account, token)
    dump(out / "plan.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def run_apply(account: str, token: str, approval: str, out: Path) -> None:
    if approval != APPROVAL:
        raise migration.controller.GuardError(f"APPLY requires approval={APPROVAL}")
    plan, eligible, verified = build_plan(account, token)
    if not eligible:
        clean = migration.verify_clean(account, token, migration.expected_keys(migration.source_items(account, token)[2]))
        result = {"schema": "wpa-ai-search-v4-builtin-recovery-result/1", "status": "already_clean", **clean}
        dump(out / "result.json", result)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    dump(out / "approved-plan.json", plan)
    ledger = out / "recovery-ledger.jsonl"
    for target_item, evidence in zip(eligible, verified):
        synced = wrapper._sync_item_once(account, token, target_item)
        record = {**evidence, "action": "hash_verified_patch_index", "returned_status": synced.get("status")}
        with ledger.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")

    source_items = migration.source_items(account, token)[2]
    expected = migration.expected_keys(source_items)
    deadline = time.monotonic() + TIMEOUT_SECONDS
    snapshots = []
    while True:
        current = migration.list_items(account, token, TARGET)
        stats = migration.target_stats(account, token)
        snap = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "item_count": len(current),
            "status_counts": dict(Counter(str(i.get("status") or "").lower() for i in current)),
            "stats": stats,
        }
        snapshots.append(snap)
        print(json.dumps(snap, ensure_ascii=False), flush=True)
        try:
            clean = migration.verify_clean(account, token, expected)
            result = {
                "schema": "wpa-ai-search-v4-builtin-recovery-result/1",
                "status": "builtin_final_790_recovered_and_verified",
                "target": TARGET,
                "reindexed_count": len(eligible),
                **clean,
                "r2_objects_mutated": False,
                "uploads_performed": False,
                "production_cutover_performed": False,
                "old_instances_deleted": False,
            }
            dump(out / "poll-snapshots.json", snapshots)
            dump(out / "result.json", result)
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return
        except migration.controller.GuardError:
            pass
        if time.monotonic() >= deadline:
            dump(out / "poll-snapshots.json", snapshots)
            raise migration.controller.GuardError(f"recovery indexing timeout; last={snap}")
        time.sleep(POLL_SECONDS)


def self_test() -> None:
    assert TARGET == "protocol-ai-v4-final"
    assert APPROVAL == "APPROVE_RECOVER_BUILTIN_FINAL_790"
    assert STALE_SECONDS >= 1800
    assert migration.controller.EXPECTED_ACTIVE == 790
    print("guarded built-in recovery self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("PLAN", "STATUS", "APPLY"))
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument("--out", default="/tmp/ai-search-v4-builtin-recovery")
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
        raise migration.controller.GuardError("Cloudflare credentials are required")
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    try:
        if args.mode == "PLAN":
            run_plan(account, token, out)
        elif args.mode == "STATUS":
            run_status(account, token, out)
        else:
            run_apply(account, token, args.approval, out)
    except Exception as exc:
        dump(out / "failure.json", {
            "schema": "wpa-ai-search-v4-builtin-recovery-failure/1",
            "status": "failed",
            "mode": args.mode,
            "target": TARGET,
            "error": str(exc),
            "patch_may_have_been_accepted": isinstance(exc, migration.PostOutcomeUnknown),
            "r2_objects_mutated": False,
            "uploads_performed": False,
            "production_cutover_performed": False,
            "old_instances_deleted": False,
        })
        raise


if __name__ == "__main__":
    main()

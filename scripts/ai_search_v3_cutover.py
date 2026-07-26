#!/usr/bin/env python3
"""Fail-closed, reversible cutover of protocol-ai to the locked v3 R2 corpus."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

import boto3
import requests
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

API = "https://api.cloudflare.com/client/v4"
INSTANCE = "protocol-ai"
BUCKET = "protocol-kb"
APPROVED_PLAN_SHA256 = "80cd2f51cf9ddb42956260707d3fa064799ffe3d75c21a65bda018c0ea2caecc"
TARGET_PREFIX = "__ai_search_ready_v3__/80cd2f51cf9ddb429562/"
TARGET_GLOB = "**/__ai_search_ready_v3__/80cd2f51cf9ddb429562/**"
EXPECTED_OBJECTS = 793
EXPECTED_BYTES = 712_538_574
EXPECTED_KEY_SIZE_SHA256 = "693a946101f031af8b00c49f86a2aec3243d6d0cd2bb385a297374bbad5d3229"
JOB_DESCRIPTION = "WPA v3 cutover 80cd2f51"
ROLLBACK_JOB_DESCRIPTION = "WPA rollback to original filters after v3 cutover"

BASELINE_SOURCE_PARAMS = {
    "r2_jurisdiction": "default",
    "web_crawler": {"parse_type": "sitemap"},
    "include_items": [
        "**/world-protocol-academy/**",
        "**/11_vienna_conventions/**",
    ],
    "exclude_items": [
        "**/",
        "**/*.mp3",
        "**/*.jsonl",
        "**/*.zip",
        "**/Diplomacy*Books/COURT*DIPLOMACY*AUSTRIA*GERMANY*.pdf",
        "**/Diplomacy*Books/DICTIONARY*DIPLOMATIC*COMMERCIAL*TERMS*.pdf",
        "**/Diplomacy*Books/HOW*DIPLOMATS*MAKE*WAR*.pdf",
        "**/__ai_search_ready_v2__/**",
        "**/__ai_search_ready_v3__/**",
    ],
}

CUTOVER_SOURCE_PARAMS = {
    "r2_jurisdiction": "default",
    "web_crawler": {"parse_type": "sitemap"},
    "include_items": [TARGET_GLOB],
    "exclude_items": [
        "**/",
        "**/__ai_search_ready_v2__/**",
    ],
}


class CutoverError(RuntimeError):
    pass


def canon(value) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def write_json(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def normalize_source_params(value: dict) -> dict:
    value = value or {}
    return {
        "r2_jurisdiction": value.get("r2_jurisdiction"),
        "web_crawler": value.get("web_crawler") or {},
        "include_items": sorted(value.get("include_items") or []),
        "exclude_items": sorted(value.get("exclude_items") or []),
    }


def same_source_params(a: dict, b: dict) -> bool:
    return normalize_source_params(a) == normalize_source_params(b)


def api_request(method: str, url: str, token: str, **kwargs) -> dict:
    headers = dict(kwargs.pop("headers", {}) or {})
    headers["Authorization"] = f"Bearer {token}"
    if "json" in kwargs:
        headers.setdefault("Content-Type", "application/json")
    response = requests.request(method, url, headers=headers, timeout=120, **kwargs)
    try:
        payload = response.json()
    except ValueError as exc:
        raise CutoverError(f"Cloudflare API returned non-JSON HTTP {response.status_code}: {response.text[:500]}") from exc
    if not response.ok or payload.get("success") is False:
        raise CutoverError(f"Cloudflare API {method} {url} failed HTTP {response.status_code}: {payload}")
    return payload


def instance_url(account_id: str) -> str:
    return f"{API}/accounts/{account_id}/ai-search/instances/{INSTANCE}"


def get_instance(account_id: str, token: str) -> dict:
    return api_request("GET", instance_url(account_id), token)["result"]


def update_source_params(account_id: str, token: str, source_params: dict) -> dict:
    payload = api_request("PUT", instance_url(account_id), token, json={"source_params": source_params})
    return payload["result"]


def jobs_url(account_id: str) -> str:
    return instance_url(account_id) + "/jobs"


def list_jobs(account_id: str, token: str) -> list[dict]:
    payload = api_request("GET", jobs_url(account_id), token, params={"page": 1, "per_page": 50})
    return payload.get("result") or []


def trigger_job(account_id: str, token: str, description: str) -> dict:
    payload = api_request("POST", jobs_url(account_id), token, json={"description": description})
    return payload["result"]


def get_stats(account_id: str, token: str) -> dict:
    payload = api_request("GET", instance_url(account_id) + "/stats", token)
    return payload.get("result") or {}


def verify_token_id(account_id: str, token: str) -> str:
    headers = {"Authorization": f"Bearer {token}"}
    errors = []
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
                return result["id"]
            errors.append(f"invalid token verification response from {url}")
        except (requests.RequestException, ValueError) as exc:
            errors.append(f"{url}: {exc}")
    raise CutoverError("unable to verify R2 token: " + "; ".join(errors))


def r2_client(account_id: str, token: str):
    access_key_id = verify_token_id(account_id, token)
    secret_access_key = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key_id,
        aws_secret_access_key=secret_access_key,
        region_name="auto",
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 4, "mode": "standard"},
            connect_timeout=30,
            read_timeout=300,
        ),
    )


def inventory_from_objects(objects: list[dict]) -> dict:
    rows = sorted((str(x["Key"]), int(x["Size"])) for x in objects)
    raw = "".join(f"{key}\t{size}\n" for key, size in rows).encode("utf-8")
    return {
        "prefix": TARGET_PREFIX,
        "objects": len(rows),
        "bytes": sum(size for _, size in rows),
        "key_size_sha256": hashlib.sha256(raw).hexdigest(),
        "first_key": rows[0][0] if rows else None,
        "last_key": rows[-1][0] if rows else None,
    }


def verify_inventory(account_id: str, r2_token: str) -> dict:
    client = r2_client(account_id, r2_token)
    objects = []
    continuation = None
    while True:
        kwargs = {"Bucket": BUCKET, "Prefix": TARGET_PREFIX, "MaxKeys": 1000}
        if continuation:
            kwargs["ContinuationToken"] = continuation
        try:
            response = client.list_objects_v2(**kwargs)
        except (BotoCoreError, ClientError) as exc:
            raise CutoverError(f"unable to list locked v3 R2 prefix: {exc}") from exc
        objects.extend(response.get("Contents") or [])
        if not response.get("IsTruncated"):
            break
        continuation = response.get("NextContinuationToken")
        if not continuation:
            raise CutoverError("R2 listing reported truncation without a continuation token")
    inventory = inventory_from_objects(objects)
    expected = {
        "objects": EXPECTED_OBJECTS,
        "bytes": EXPECTED_BYTES,
        "key_size_sha256": EXPECTED_KEY_SIZE_SHA256,
    }
    for field, wanted in expected.items():
        if inventory[field] != wanted:
            raise CutoverError(f"locked v3 inventory mismatch for {field}: expected={wanted} actual={inventory[field]}")
    return inventory


def deterministic_plan(inventory: dict) -> dict:
    plan = {
        "schema": 1,
        "instance": INSTANCE,
        "bucket": BUCKET,
        "approved_plan_sha256": APPROVED_PLAN_SHA256,
        "target_prefix": TARGET_PREFIX,
        "inventory": {
            "objects": inventory["objects"],
            "bytes": inventory["bytes"],
            "key_size_sha256": inventory["key_size_sha256"],
        },
        "before_source_params": BASELINE_SOURCE_PARAMS,
        "after_source_params": CUTOVER_SOURCE_PARAMS,
        "rollback_source_params": BASELINE_SOURCE_PARAMS,
    }
    plan["cutover_plan_sha256"] = hashlib.sha256(canon(plan).encode("utf-8")).hexdigest()
    return plan


def find_job(jobs: list[dict], description: str) -> dict | None:
    matching = [j for j in jobs if j.get("description") == description]
    matching.sort(key=lambda j: (j.get("started_at") or "", j.get("id") or ""), reverse=True)
    return matching[0] if matching else None


def prepare(account_id: str, ai_token: str, r2_token: str, out: Path) -> None:
    instance = get_instance(account_id, ai_token)
    write_json(out / "instance-before.json", instance)
    if not same_source_params(instance.get("source_params"), BASELINE_SOURCE_PARAMS):
        raise CutoverError("PREPARE requires the exact locked original-path baseline filters")
    inventory = verify_inventory(account_id, r2_token)
    plan = deterministic_plan(inventory)
    write_json(out / "v3-inventory.json", inventory)
    write_json(out / "cutover-plan.json", plan)
    write_json(out / "proposed-source-params.json", CUTOVER_SOURCE_PARAMS)
    write_json(out / "rollback-source-params.json", BASELINE_SOURCE_PARAMS)
    (out / "cutover-plan.sha256").write_text(plan["cutover_plan_sha256"] + "\n", encoding="utf-8")
    write_json(out / "result.json", {"status": "prepared", **plan})
    print(json.dumps({"status": "prepared", "cutover_plan_sha256": plan["cutover_plan_sha256"], "inventory": inventory}, indent=2))


def apply(account_id: str, ai_token: str, r2_token: str, approval: str, out: Path) -> None:
    if approval != "APPROVE_V3_CUTOVER":
        raise CutoverError("APPLY requires approval=APPROVE_V3_CUTOVER")
    before = get_instance(account_id, ai_token)
    write_json(out / "instance-before.json", before)
    current = before.get("source_params") or {}
    if same_source_params(current, CUTOVER_SOURCE_PARAMS):
        jobs = list_jobs(account_id, ai_token)
        existing = find_job(jobs, JOB_DESCRIPTION)
        if existing:
            write_json(out / "sync-job.json", existing)
            write_json(out / "result.json", {"status": "already_applied", "job": existing})
            print(json.dumps({"status": "already_applied", "job": existing}, indent=2))
            return
    elif not same_source_params(current, BASELINE_SOURCE_PARAMS):
        raise CutoverError("APPLY refused because current filters are neither locked baseline nor locked v3 cutover")

    inventory = verify_inventory(account_id, r2_token)
    plan = deterministic_plan(inventory)
    write_json(out / "v3-inventory.json", inventory)
    write_json(out / "cutover-plan.json", plan)
    write_json(out / "rollback-source-params.json", BASELINE_SOURCE_PARAMS)

    changed = False
    try:
        if not same_source_params(current, CUTOVER_SOURCE_PARAMS):
            update_source_params(account_id, ai_token, CUTOVER_SOURCE_PARAMS)
            changed = True
        after = get_instance(account_id, ai_token)
        write_json(out / "instance-after-update.json", after)
        if not same_source_params(after.get("source_params"), CUTOVER_SOURCE_PARAMS):
            raise CutoverError("Cloudflare read-back did not match locked v3 source filters")
        job = trigger_job(account_id, ai_token, JOB_DESCRIPTION)
        write_json(out / "sync-job.json", job)
        write_json(out / "result.json", {
            "status": "cutover_filters_applied_sync_started",
            "cutover_plan_sha256": plan["cutover_plan_sha256"],
            "job": job,
        })
        print(json.dumps({"status": "cutover_filters_applied_sync_started", "job": job}, indent=2))
    except Exception:
        if changed:
            try:
                restored = update_source_params(account_id, ai_token, BASELINE_SOURCE_PARAMS)
                write_json(out / "automatic-rollback-response.json", restored)
                readback = get_instance(account_id, ai_token)
                write_json(out / "automatic-rollback-readback.json", readback)
                if not same_source_params(readback.get("source_params"), BASELINE_SOURCE_PARAMS):
                    raise CutoverError("automatic rollback read-back did not restore baseline filters")
            except Exception as rollback_exc:
                write_json(out / "automatic-rollback-failure.json", {"error": str(rollback_exc)})
                raise CutoverError(f"cutover failed and automatic rollback also failed: {rollback_exc}")
        raise


def status(account_id: str, ai_token: str, out: Path) -> None:
    instance = get_instance(account_id, ai_token)
    jobs = list_jobs(account_id, ai_token)
    stats = get_stats(account_id, ai_token)
    config_state = "v3_cutover" if same_source_params(instance.get("source_params"), CUTOVER_SOURCE_PARAMS) else (
        "baseline" if same_source_params(instance.get("source_params"), BASELINE_SOURCE_PARAMS) else "unexpected"
    )
    latest_cutover = find_job(jobs, JOB_DESCRIPTION)
    latest_rollback = find_job(jobs, ROLLBACK_JOB_DESCRIPTION)
    result = {
        "status": "observed",
        "config_state": config_state,
        "instance_status": instance.get("status"),
        "paused": instance.get("paused"),
        "latest_cutover_job": latest_cutover,
        "latest_rollback_job": latest_rollback,
        "stats": stats,
    }
    write_json(out / "instance.json", instance)
    write_json(out / "jobs.json", jobs)
    write_json(out / "stats.json", stats)
    write_json(out / "result.json", result)
    print(json.dumps(result, indent=2))


def rollback(account_id: str, ai_token: str, approval: str, out: Path) -> None:
    if approval != "APPROVE_ROLLBACK":
        raise CutoverError("ROLLBACK requires approval=APPROVE_ROLLBACK")
    before = get_instance(account_id, ai_token)
    write_json(out / "instance-before.json", before)
    current = before.get("source_params") or {}
    if same_source_params(current, BASELINE_SOURCE_PARAMS):
        write_json(out / "result.json", {"status": "already_rolled_back"})
        print(json.dumps({"status": "already_rolled_back"}, indent=2))
        return
    if not same_source_params(current, CUTOVER_SOURCE_PARAMS):
        raise CutoverError("ROLLBACK refused because current filters do not match the locked v3 cutover")
    update_source_params(account_id, ai_token, BASELINE_SOURCE_PARAMS)
    after = get_instance(account_id, ai_token)
    write_json(out / "instance-after.json", after)
    if not same_source_params(after.get("source_params"), BASELINE_SOURCE_PARAMS):
        raise CutoverError("rollback read-back did not restore baseline filters")
    job = trigger_job(account_id, ai_token, ROLLBACK_JOB_DESCRIPTION)
    write_json(out / "sync-job.json", job)
    write_json(out / "result.json", {"status": "rollback_filters_applied_sync_started", "job": job})
    print(json.dumps({"status": "rollback_filters_applied_sync_started", "job": job}, indent=2))


def self_test() -> None:
    assert same_source_params(BASELINE_SOURCE_PARAMS, json.loads(json.dumps(BASELINE_SOURCE_PARAMS)))
    assert not same_source_params(BASELINE_SOURCE_PARAMS, CUTOVER_SOURCE_PARAMS)
    fake = [
        {"Key": TARGET_PREFIX + "b.pdf", "Size": 2},
        {"Key": TARGET_PREFIX + "a.json", "Size": 1},
    ]
    inv = inventory_from_objects(fake)
    expected = hashlib.sha256(
        (f"{TARGET_PREFIX}a.json\t1\n{TARGET_PREFIX}b.pdf\t2\n").encode("utf-8")
    ).hexdigest()
    assert inv["objects"] == 2 and inv["bytes"] == 3 and inv["key_size_sha256"] == expected
    plan = deterministic_plan({
        "objects": EXPECTED_OBJECTS,
        "bytes": EXPECTED_BYTES,
        "key_size_sha256": EXPECTED_KEY_SIZE_SHA256,
    })
    assert len(plan["cutover_plan_sha256"]) == 64
    print("cutover self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("PREPARE", "APPLY", "STATUS", "ROLLBACK"))
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument("--out", default="/tmp/ai-search-v3-cutover")
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
        raise CutoverError("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_SEARCH_TOKEN are required")
    if args.mode in {"PREPARE", "APPLY"} and not r2_token:
        raise CutoverError("CLOUDFLARE_R2_API_TOKEN is required for locked inventory verification")
    try:
        if args.mode == "PREPARE":
            prepare(account_id, ai_token, r2_token, out)
        elif args.mode == "APPLY":
            apply(account_id, ai_token, r2_token, args.approval, out)
        elif args.mode == "STATUS":
            status(account_id, ai_token, out)
        elif args.mode == "ROLLBACK":
            rollback(account_id, ai_token, args.approval, out)
    except Exception as exc:
        write_json(out / "failure.json", {"status": "failed", "mode": args.mode, "error": str(exc)})
        raise


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Create a clean built-in-storage AI Search instance from the locked 790-item WPA manifest.

Safety properties:
- reads source content through the AI Search Items download API;
- never writes, deletes, or renames R2 objects;
- never deletes or mutates existing AI Search instances;
- creates only protocol-ai-v4-final when absent;
- uploads only deterministic filenames derived from the locked 790 source keys;
- resume-safe: existing target items are downloaded and content-hash verified before skipping;
- never retries POST operations automatically;
- never changes the production Worker or deletes old instances.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import sys
import time
from collections import Counter
from pathlib import Path, PurePosixPath
from typing import Any

import requests

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v3_final_instance_source_locked as locked

controller = locked.controller
TARGET = "protocol-ai-v4-final"
APPROVAL = "APPROVE_CREATE_BUILTIN_FINAL_790"
POLL = int(os.getenv("AI_SEARCH_BUILTIN_POLL_SECONDS", "20"))
TIMEOUT = int(os.getenv("AI_SEARCH_BUILTIN_TIMEOUT_SECONDS", "14400"))
UPLOAD_PAUSE = float(os.getenv("AI_SEARCH_BUILTIN_UPLOAD_PAUSE_SECONDS", "0.15"))
EXPECTED_STATS = (790, 0, 0, 0, 0, 0)
INDEXED = controller.INDEXED


class PostOutcomeUnknown(controller.GuardError):
    """A POST may have been accepted even though no response was received."""


def dump(path: Path, value: Any) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def target_url(account: str, suffix: str = "") -> str:
    return f"{controller.API}/accounts/{account}/ai-search/instances/{TARGET}{suffix}"


def resilient_get(
    endpoint: str,
    token: str,
    *,
    missing_ok: bool = False,
    stream: bool = False,
    **kwargs: Any,
) -> requests.Response:
    headers = {"Authorization": f"Bearer {token}"}
    attempts = 4
    for attempt in range(1, attempts + 1):
        try:
            response = requests.get(
                endpoint,
                headers=headers,
                timeout=(30, 180),
                stream=stream,
                **kwargs,
            )
            if missing_ok and response.status_code == 404:
                return response
            if not response.ok:
                raise controller.GuardError(
                    f"Cloudflare GET failure {endpoint} HTTP {response.status_code}: "
                    f"{response.text[:1000]}"
                )
            return response
        except requests.exceptions.RequestException:
            if attempt >= attempts:
                raise
            delay = 10 * (2 ** (attempt - 1))
            print(f"transient Cloudflare GET failure; retry in {delay}s", flush=True)
            time.sleep(delay)
    raise AssertionError("unreachable")


def get_json(
    endpoint: str,
    token: str,
    *,
    missing_ok: bool = False,
    **kwargs: Any,
) -> dict[str, Any] | None:
    response = resilient_get(endpoint, token, missing_ok=missing_ok, **kwargs)
    if missing_ok and response.status_code == 404:
        return None
    try:
        payload = response.json()
    except ValueError as exc:
        raise controller.GuardError(
            f"non-JSON Cloudflare GET response from {endpoint}: {response.text[:500]}"
        ) from exc
    if payload.get("success") is False:
        raise controller.GuardError(f"Cloudflare GET API failure {endpoint}: {payload}")
    return payload


def post_json(endpoint: str, token: str, body: dict[str, Any]) -> dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(
            endpoint,
            headers=headers,
            json=body,
            timeout=(30, 180),
        )
    except requests.exceptions.RequestException as exc:
        raise PostOutcomeUnknown(f"POST outcome unknown for {endpoint}: {exc}") from exc
    try:
        payload = response.json()
    except ValueError as exc:
        raise controller.GuardError(
            f"non-JSON Cloudflare POST response HTTP {response.status_code}: "
            f"{response.text[:500]}"
        ) from exc
    if not response.ok or payload.get("success") is False:
        raise controller.GuardError(
            f"Cloudflare POST failure {endpoint} HTTP {response.status_code}: {payload}"
        )
    return payload


def post_file(
    endpoint: str,
    token: str,
    *,
    filename: str,
    content: bytes,
    metadata: dict[str, Any],
) -> dict[str, Any]:
    headers = {"Authorization": f"Bearer {token}"}
    mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    files = {"file": (filename, content, mime)}
    data = {
        "metadata": json.dumps(
            metadata,
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        "wait_for_completion": "false",
    }
    try:
        response = requests.post(
            endpoint,
            headers=headers,
            files=files,
            data=data,
            timeout=(30, 240),
        )
    except requests.exceptions.RequestException as exc:
        raise PostOutcomeUnknown(
            f"upload outcome unknown for filename={filename}: {exc}"
        ) from exc
    try:
        payload = response.json()
    except ValueError as exc:
        raise controller.GuardError(
            f"non-JSON upload response HTTP {response.status_code}: "
            f"{response.text[:500]}"
        ) from exc
    if not response.ok or payload.get("success") is False:
        raise controller.GuardError(
            f"Cloudflare upload failure filename={filename} "
            f"HTTP {response.status_code}: {payload}"
        )
    return payload


def target_instance(account: str, token: str) -> dict[str, Any] | None:
    payload = get_json(target_url(account), token, missing_ok=True)
    return None if payload is None else dict(payload.get("result") or {})


def target_stats(account: str, token: str) -> dict[str, Any]:
    payload = get_json(target_url(account, "/stats"), token) or {}
    return dict(payload.get("result") or {})


def list_items(account: str, token: str, instance_id: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    page = 1
    total: int | None = None
    base = (
        f"{controller.API}/accounts/{account}/ai-search/instances/"
        f"{instance_id}/items"
    )
    while True:
        payload = get_json(
            base,
            token,
            params={"page": page, "per_page": 50},
        ) or {}
        batch = list(payload.get("result") or [])
        reported = (payload.get("result_info") or {}).get("total_count")
        if reported is not None:
            reported = int(reported)
            if total is None:
                total = reported
            elif total != reported:
                raise controller.GuardError(
                    "item total_count changed during pagination"
                )
        found.extend(batch)
        if (
            (total is not None and len(found) >= total)
            or (total is None and len(batch) < 50)
        ):
            break
        page += 1
        if page > 200:
            raise controller.GuardError("item pagination safety limit exceeded")
    if total is not None and len(found) != total:
        raise controller.GuardError(
            f"incomplete item snapshot expected={total} got={len(found)}"
        )
    return found


def download_item(
    account: str,
    token: str,
    instance_id: str,
    item_id: str,
) -> bytes:
    endpoint = (
        f"{controller.API}/accounts/{account}/ai-search/instances/"
        f"{instance_id}/items/{item_id}/download"
    )
    response = resilient_get(endpoint, token, stream=True)
    content = response.content
    if not content:
        raise controller.GuardError(
            f"empty item download instance={instance_id} item_id={item_id}"
        )
    return content


def item_id(item: dict[str, Any]) -> str:
    value = str(item.get("id") or "")
    if not value:
        raise controller.GuardError(f"item has no id: {item}")
    return value


def target_key(source_key: str) -> str:
    suffix = PurePosixPath(source_key).suffix.lower()
    if (
        not suffix
        or len(suffix) > 12
        or not suffix.replace(".", "").isalnum()
    ):
        suffix = ".bin"
    name = (
        f"wpa-{hashlib.sha256(source_key.encode('utf-8')).hexdigest()[:48]}"
        f"{suffix}"
    )
    if len(name) > 128:
        raise controller.GuardError(
            f"generated filename exceeds 128 characters: {name}"
        )
    return name


def source_items(
    account: str,
    token: str,
) -> tuple[dict[str, Any], dict[str, Any], list[dict[str, Any]]]:
    source = controller.source_manifest(account, token)
    allowed = controller.allowed_manifest(source)
    allowed_set = set(allowed["keys"])
    values = [
        item
        for item in controller.all_items(account, token, controller.SOURCE)
        if controller.key(item) in allowed_set
    ]
    by_key = {controller.key(item): item for item in values}
    if (
        len(by_key) != controller.EXPECTED_ACTIVE
        or sorted(by_key) != allowed["keys"]
    ):
        raise controller.GuardError(
            "source item objects do not match locked allowed manifest"
        )
    ordered = [by_key[key] for key in allowed["keys"]]
    return source, allowed, ordered


def verify_builtin_shape(value: dict[str, Any]) -> None:
    if value.get("id") != TARGET:
        raise controller.GuardError("unexpected built-in target id")
    if value.get("type") not in (None, "", "builtin"):
        raise controller.GuardError(
            f"target unexpectedly has external type={value.get('type')}"
        )
    if value.get("source") not in (None, "", "builtin"):
        raise controller.GuardError(
            f"target unexpectedly has external source={value.get('source')}"
        )
    if value.get("enable") is False or value.get("paused") is True:
        raise controller.GuardError("built-in target is disabled or paused")


def create_payload() -> dict[str, Any]:
    return {
        "id": TARGET,
        "embedding_model": "@cf/qwen/qwen3-embedding-0.6b",
        "chunk": True,
        "chunk_size": 1024,
        "chunk_overlap": 10,
        "index_method": {"keyword": False, "vector": True},
        "fusion_method": "rrf",
        "cache": True,
        "cache_threshold": "close_enough",
        "cache_ttl": 172800,
        "enable": True,
        "max_num_results": 10,
        "score_threshold": 0.4,
    }


def expected_keys(items: list[dict[str, Any]]) -> list[str]:
    values = [target_key(controller.key(item)) for item in items]
    if (
        len(values) != len(set(values))
        or len(values) != controller.EXPECTED_ACTIVE
    ):
        raise controller.GuardError(
            "deterministic target keys are not unique and complete"
        )
    return sorted(values)


def status_tuple(
    value: dict[str, Any],
) -> tuple[int, int, int, int, int, int]:
    return (
        int(value.get("completed") or 0),
        int(value.get("skipped") or 0),
        int(value.get("error") or value.get("errors") or 0),
        int(value.get("queued") or 0),
        int(value.get("running") or 0),
        int(value.get("outdated") or 0),
    )


def inspect_target(
    account: str,
    token: str,
    expected: list[str],
) -> dict[str, Any]:
    value = target_instance(account, token)
    if value is None:
        return {
            "status": "absent",
            "target": TARGET,
            "item_count": 0,
            "expected_item_count": len(expected),
        }
    verify_builtin_shape(value)
    items = list_items(account, token, TARGET)
    keys = [str(item.get("key") or "") for item in items]
    if any(not key for key in keys) or len(keys) != len(set(keys)):
        raise controller.GuardError(
            "target contains empty or duplicate keys"
        )
    foreign = sorted(set(keys) - set(expected))
    if foreign:
        raise controller.GuardError(
            f"target contains foreign keys: {foreign[:5]}"
        )
    source_ids = {str(item.get("source_id") or "") for item in items}
    if source_ids - {"builtin", ""}:
        raise controller.GuardError(
            f"target contains non-builtin sources: {sorted(source_ids)}"
        )
    counts = dict(
        Counter(str(item.get("status") or "").lower() for item in items)
    )
    return {
        "status": "present",
        "target": TARGET,
        "item_count": len(items),
        "expected_item_count": len(expected),
        "missing_count": len(set(expected) - set(keys)),
        "status_counts": counts,
        "stats": target_stats(account, token),
    }


def build_plan(account: str, token: str) -> dict[str, Any]:
    source, allowed, items = source_items(account, token)
    keys = expected_keys(items)
    target = inspect_target(account, token, keys)
    samples = []
    for index in (0, len(items) // 2, len(items) - 1):
        item = items[index]
        content = download_item(
            account,
            token,
            controller.SOURCE,
            item_id(item),
        )
        samples.append(
            {
                "source_key": controller.key(item),
                "source_item_id": item_id(item),
                "target_key": target_key(controller.key(item)),
                "bytes": len(content),
                "sha256": hashlib.sha256(content).hexdigest(),
            }
        )
    body = {
        "schema": "wpa-ai-search-v4-builtin-plan/1",
        "status": "planned",
        "source_instance": controller.SOURCE,
        "target": TARGET,
        "target_state": target,
        "source_count": source["count"],
        "source_manifest_sha256": source["sha256"],
        "allowed_count": allowed["count"],
        "allowed_manifest_sha256": allowed["sha256"],
        "expected_target_key_sha256": controller.digest(keys),
        "sample_downloads": samples,
        "create_payload": create_payload(),
        "r2_objects_mutated": False,
        "production_cutover_performed": False,
        "old_instances_deleted": False,
    }
    body["plan_sha256"] = hashlib.sha256(
        json.dumps(
            body,
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
    ).hexdigest()
    return body


def run_plan(account: str, token: str, out: Path) -> None:
    result = build_plan(account, token)
    dump(out / "plan.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def run_status(account: str, token: str, out: Path) -> None:
    source, allowed, items = source_items(account, token)
    keys = expected_keys(items)
    result = {
        "schema": "wpa-ai-search-v4-builtin-status/1",
        "read_only": True,
        "source_manifest_sha256": source["sha256"],
        "allowed_manifest_sha256": allowed["sha256"],
        **inspect_target(account, token, keys),
    }
    dump(out / "status.json", result)
    print(json.dumps(result, ensure_ascii=False, indent=2))


def ensure_target(account: str, token: str) -> dict[str, Any]:
    value = target_instance(account, token)
    if value is not None:
        verify_builtin_shape(value)
        return value
    endpoint = f"{controller.API}/accounts/{account}/ai-search/instances"
    payload = post_json(endpoint, token, create_payload())
    created = dict(payload.get("result") or {})
    verify_builtin_shape(created)
    return created


def upload_missing(
    account: str,
    token: str,
    items: list[dict[str, Any]],
    out: Path,
) -> dict[str, Any]:
    expected = expected_keys(items)
    current = list_items(account, token, TARGET)
    by_key = {str(item.get("key") or ""): item for item in current}
    foreign = sorted(set(by_key) - set(expected))
    if foreign:
        raise controller.GuardError(
            f"target contains foreign keys: {foreign[:5]}"
        )

    ledger_path = out / "upload-ledger.jsonl"
    uploaded = 0
    verified_existing = 0
    for position, source_item in enumerate(items, start=1):
        source_key = controller.key(source_item)
        filename = target_key(source_key)
        source_content = download_item(
            account,
            token,
            controller.SOURCE,
            item_id(source_item),
        )
        source_sha = hashlib.sha256(source_content).hexdigest()
        existing = by_key.get(filename)
        if existing is not None:
            existing_content = download_item(
                account,
                token,
                TARGET,
                item_id(existing),
            )
            existing_sha = hashlib.sha256(existing_content).hexdigest()
            if existing_sha != source_sha:
                raise controller.GuardError(
                    f"resume verification hash mismatch for target key={filename}"
                )
            verified_existing += 1
            record = {
                "position": position,
                "action": "verified_existing",
                "source_key": source_key,
                "target_key": filename,
                "sha256": source_sha,
                "bytes": len(source_content),
            }
        else:
            metadata = {
                "source_key": source_key[:500],
                "source_key_sha256": hashlib.sha256(
                    source_key.encode("utf-8")
                ).hexdigest(),
                "content_sha256": source_sha,
            }
            payload = post_file(
                target_url(account, "/items"),
                token,
                filename=filename,
                content=source_content,
                metadata=metadata,
            )
            created = dict(payload.get("result") or {})
            if str(created.get("key") or "") != filename:
                raise controller.GuardError(
                    f"upload returned unexpected key expected={filename} "
                    f"result={created}"
                )
            if str(created.get("source_id") or "") not in {"builtin", ""}:
                raise controller.GuardError(
                    f"upload returned non-builtin source: {created}"
                )
            by_key[filename] = created
            uploaded += 1
            record = {
                "position": position,
                "action": "uploaded",
                "source_key": source_key,
                "target_key": filename,
                "target_item_id": created.get("id"),
                "status": created.get("status"),
                "sha256": source_sha,
                "bytes": len(source_content),
            }
            if UPLOAD_PAUSE:
                time.sleep(UPLOAD_PAUSE)
        with ledger_path.open("a", encoding="utf-8") as handle:
            handle.write(
                json.dumps(
                    record,
                    ensure_ascii=False,
                    sort_keys=True,
                ) + "\n"
            )
        if position % 25 == 0 or position == len(items):
            print(
                json.dumps(
                    {
                        "progress": position,
                        "total": len(items),
                        "uploaded": uploaded,
                        "verified_existing": verified_existing,
                    }
                ),
                flush=True,
            )
    return {
        "uploaded": uploaded,
        "verified_existing": verified_existing,
    }


def verify_clean(
    account: str,
    token: str,
    expected: list[str],
) -> dict[str, Any]:
    items = list_items(account, token, TARGET)
    keys = sorted(str(item.get("key") or "") for item in items)
    if keys != expected:
        raise controller.GuardError(
            f"target key set mismatch count={len(keys)} "
            f"sha={controller.digest(keys)}"
        )
    counts = dict(
        Counter(str(item.get("status") or "").lower() for item in items)
    )
    non_completed = [
        item
        for item in items
        if str(item.get("status") or "").lower() not in INDEXED
    ]
    if non_completed:
        evidence = [
            (item.get("key"), item.get("status"), item.get("error"))
            for item in non_completed[:5]
        ]
        raise controller.GuardError(
            f"target has non-completed items: {evidence}"
        )
    value_stats = target_stats(account, token)
    actual = status_tuple(value_stats)
    if actual != EXPECTED_STATS:
        raise controller.GuardError(f"target stats mismatch: {actual}")
    source_ids = {str(item.get("source_id") or "") for item in items}
    if source_ids - {"builtin", ""}:
        raise controller.GuardError(
            f"target has non-builtin source ids: {source_ids}"
        )
    vectors = int(
        (((value_stats.get("engine") or {}).get("vectorize") or {}).get(
            "vectorsCount"
        ) or 0)
    )
    if vectors < 1:
        raise controller.GuardError("target has zero vectors")
    return {
        "item_count": len(items),
        "status_counts": counts,
        "stats": value_stats,
        "vectors_count": vectors,
    }


def smoke(account: str, token: str) -> list[dict[str, Any]]:
    evidence = []
    for query in controller.QUERIES:
        payload = post_json(
            target_url(account, "/search"),
            token,
            {"messages": [{"role": "user", "content": query}]},
        )
        result = payload.get("result")
        count = controller.hit_count(result)
        if count < 1:
            raise controller.GuardError(
                f"smoke query returned no chunks: {query}"
            )
        evidence.append({"query": query, "result_count": count})
    return evidence


def run_apply(
    account: str,
    token: str,
    approval: str,
    out: Path,
) -> None:
    if approval != APPROVAL:
        raise controller.GuardError(f"APPLY requires approval={APPROVAL}")
    plan = build_plan(account, token)
    dump(out / "approved-plan.json", plan)
    target = ensure_target(account, token)
    dump(out / "target-instance.json", target)

    source, allowed, items = source_items(account, token)
    expected = expected_keys(items)
    progress = upload_missing(account, token, items, out)
    dump(out / "upload-progress.json", progress)

    deadline = time.monotonic() + TIMEOUT
    snapshots: list[dict[str, Any]] = []
    clean_streak = 0
    while True:
        current_items = list_items(account, token, TARGET)
        value_stats = target_stats(account, token)
        snap = {
            "at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "item_count": len(current_items),
            "status_counts": dict(
                Counter(
                    str(item.get("status") or "").lower()
                    for item in current_items
                )
            ),
            "stats": value_stats,
        }
        snapshots.append(snap)
        print(json.dumps(snap, ensure_ascii=False), flush=True)
        try:
            clean = verify_clean(account, token, expected)
            clean_streak += 1
            if clean_streak >= 2:
                result = {
                    "schema": "wpa-ai-search-v4-builtin-result/1",
                    "status": "builtin_final_790_verified",
                    "target": TARGET,
                    "source_manifest_sha256": source["sha256"],
                    "active_manifest_sha256": allowed["sha256"],
                    "target_key_sha256": controller.digest(expected),
                    **progress,
                    **clean,
                    "smoke_tests": smoke(account, token),
                    "r2_objects_mutated": False,
                    "production_cutover_performed": False,
                    "old_instances_deleted": False,
                }
                dump(out / "poll-snapshots.json", snapshots)
                dump(out / "result.json", result)
                print(json.dumps(result, ensure_ascii=False, indent=2))
                return
        except controller.GuardError:
            clean_streak = 0
        if time.monotonic() >= deadline:
            dump(out / "poll-snapshots.json", snapshots)
            raise controller.GuardError(
                f"built-in indexing timeout after {TIMEOUT} seconds; last={snap}"
            )
        time.sleep(POLL)


def self_test() -> None:
    assert TARGET == "protocol-ai-v4-final"
    assert APPROVAL == "APPROVE_CREATE_BUILTIN_FINAL_790"
    assert EXPECTED_STATS == (790, 0, 0, 0, 0, 0)
    assert controller.EXPECTED_SOURCE == 793
    assert controller.EXPECTED_ACTIVE == 790
    samples = [
        "x/a.pdf",
        "x/a.md",
        "x/no-extension",
        "x/UPPER.TXT",
    ]
    generated = [target_key(value) for value in samples]
    assert len(generated) == len(set(generated))
    assert all(len(value) <= 128 for value in generated)
    assert generated[0].endswith(".pdf")
    assert generated[2].endswith(".bin")
    print("guarded built-in final 790 self-test: OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("PLAN", "STATUS", "APPLY"))
    parser.add_argument("--approval", default="DO_NOT_APPROVE")
    parser.add_argument(
        "--out",
        default="/tmp/ai-search-v4-builtin-final",
    )
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
        raise controller.GuardError("Cloudflare credentials are required")

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
        dump(
            out / "failure.json",
            {
                "schema": "wpa-ai-search-v4-builtin-failure/1",
                "status": "failed",
                "mode": args.mode,
                "target": TARGET,
                "error": str(exc),
                "post_may_have_been_accepted": isinstance(
                    exc,
                    PostOutcomeUnknown,
                ),
                "resume_policy": (
                    "Run STATUS, then rerun APPLY only after inspecting target state. "
                    "Existing target content hashes are verified before skipping."
                ),
                "r2_objects_mutated": False,
                "production_cutover_performed": False,
                "old_instances_deleted": False,
            },
        )
        raise


if __name__ == "__main__":
    main()

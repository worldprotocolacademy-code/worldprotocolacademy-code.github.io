#!/usr/bin/env python3
"""Run built-in recovery with stable read-only source snapshot retries.

Only mutable protocol-ai GET snapshots are retried when Cloudflare changes its
reported total_count during pagination. PATCH operations remain single-shot and
are never retried. All recovery guards remain in the underlying controller.
"""
from __future__ import annotations

import sys
import time
from pathlib import Path
from typing import Any, Callable, TypeVar

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v4_builtin_recover as recovery

T = TypeVar("T")
_original_source_items = recovery.migration.source_items
_original_source_map = recovery.wrapper._source_map


def _retry_mutable_snapshot(label: str, operation: Callable[[], T]) -> T:
    attempts = 6
    for attempt in range(1, attempts + 1):
        try:
            return operation()
        except recovery.migration.controller.GuardError as exc:
            if "total_count changed during pagination" not in str(exc):
                raise
            if attempt >= attempts:
                raise
            delay = 10 * attempt
            print(
                f"mutable {label} snapshot changed; retry read-only snapshot "
                f"{attempt}/{attempts - 1} in {delay}s",
                flush=True,
            )
            time.sleep(delay)
    raise AssertionError("unreachable")


def stable_source_items(account: str, token: str):
    return _retry_mutable_snapshot(
        "source-items",
        lambda: _original_source_items(account, token),
    )


def stable_source_map(account: str, token: str) -> dict[str, str]:
    def load() -> dict[str, str]:
        recovery.wrapper._SOURCE_BY_ID = None
        return _original_source_map(account, token)

    return _retry_mutable_snapshot("source-map", load)


recovery.migration.source_items = stable_source_items
recovery.wrapper._source_map = stable_source_map


def self_test() -> None:
    assert recovery.migration.source_items is stable_source_items
    assert recovery.wrapper._source_map is stable_source_map
    recovery.self_test()
    print("stable read-only source snapshots recovery wrapper self-test: OK")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        recovery.main()

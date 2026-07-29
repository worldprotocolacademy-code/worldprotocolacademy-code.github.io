#!/usr/bin/env python3
"""Run built-in recovery with stable read-only source snapshot retries.

Only the mutable protocol-ai source snapshot is retried when Cloudflare changes
its reported total_count during pagination. PATCH operations remain single-shot
and are never retried. All recovery guards remain in the underlying controller.
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v4_builtin_recover as recovery

_original_source_items = recovery.migration.source_items


def stable_source_items(account: str, token: str):
    attempts = 6
    for attempt in range(1, attempts + 1):
        try:
            return _original_source_items(account, token)
        except recovery.migration.controller.GuardError as exc:
            message = str(exc)
            if "total_count changed during pagination" not in message:
                raise
            if attempt >= attempts:
                raise
            delay = 10 * attempt
            print(
                f"mutable source snapshot changed; retry read-only snapshot "
                f"{attempt}/{attempts - 1} in {delay}s",
                flush=True,
            )
            time.sleep(delay)
    raise AssertionError("unreachable")


recovery.migration.source_items = stable_source_items


def self_test() -> None:
    assert recovery.migration.source_items is stable_source_items
    recovery.self_test()
    print("stable read-only source snapshot recovery wrapper self-test: OK")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        self_test()
    else:
        recovery.main()

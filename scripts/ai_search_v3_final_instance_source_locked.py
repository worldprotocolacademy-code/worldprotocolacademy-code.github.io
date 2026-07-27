#!/usr/bin/env python3
"""Run the final-instance controller using locked source gates and resilient GETs."""
from __future__ import annotations

import sys
import time
from pathlib import Path
from typing import Any

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v3_final_instance as controller


def _source_locked_only(account: str, token: str, allowed: dict) -> None:
    """Do not gate a fresh final instance on mutable historical candidate stats."""
    return None


_original_req = controller.req


def _resilient_req(
    method: str,
    endpoint: str,
    token: str,
    missing_ok: bool = False,
    **kwargs: Any,
) -> dict[str, Any] | None:
    """Retry transient read failures only; never retry POST operations."""
    attempts = 4 if method == "GET" else 1
    for attempt in range(1, attempts + 1):
        try:
            return _original_req(method, endpoint, token, missing_ok=missing_ok, **kwargs)
        except controller.requests.exceptions.RequestException:
            if attempt >= attempts:
                raise
            delay = 10 * (2 ** (attempt - 1))
            print(
                f"transient Cloudflare GET failure; retry {attempt}/{attempts - 1} in {delay}s",
                flush=True,
            )
            time.sleep(delay)
    raise AssertionError("unreachable")


controller.verify_verified_candidate = _source_locked_only
controller.req = _resilient_req

if __name__ == "__main__":
    controller.main()

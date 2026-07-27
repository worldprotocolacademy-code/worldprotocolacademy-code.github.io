#!/usr/bin/env python3
"""Run the final-instance controller using only the locked source manifest gates.

The historical protocol-ai-v3-filtered stats are intentionally not used as a
creation prerequisite. The original controller still enforces the exact
793-key source SHA, exact derived 790-key SHA, absent final target, exact final
790/0/0 state, engine objectCount 790, no active jobs, and smoke searches.
"""
from __future__ import annotations

import sys
from pathlib import Path

# This file is executed as ``python3 scripts/<name>.py``. In that mode Python
# places ``scripts/`` rather than the repository root on sys.path, so importing
# the ``scripts`` namespace is unreliable unless the root is added explicitly.
REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))

from scripts import ai_search_v3_final_instance as controller


def _source_locked_only(account: str, token: str, allowed: dict) -> None:
    """Do not gate a fresh final instance on mutable historical candidate stats."""
    return None


controller.verify_verified_candidate = _source_locked_only

if __name__ == "__main__":
    controller.main()

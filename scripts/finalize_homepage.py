#!/usr/bin/env python3
"""Conservative, idempotent finalizer for the WPA homepage."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"


def replace_once(text: str, pattern: str, replacement: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"Homepage finalizer could not safely apply: {label} (matches={count})")
    return updated


def main() -> int:
    text = INDEX.read_text(encoding="utf-8", errors="strict")
    original
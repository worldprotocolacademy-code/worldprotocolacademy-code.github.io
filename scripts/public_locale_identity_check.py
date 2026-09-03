#!/usr/bin/env python3
"""Fail-closed identity gate for WPA public compatibility locales."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXPECTED = {
    "mk": {
        "name": "Македонски",
        "sentinels": {
            "institute.nav.home": "Почетна",
            "institute.nav.analytics": "Аналитика",
            "institute.footer.link_privacy": "Приватност",
        },
    },
    "en": {
        "name": "English",
        "sentinels": {
            "institute.nav.home": "Home",
            "institute.nav.analytics": "Analytics",
            "institute.footer.link_privacy": "Privacy",
        },
    },
    "fr": {
        "name": "Français",
        "sentinels": {
            "institute.nav.home": "Accueil",
            "institute.nav.analytics": "Analytique",
            "institute.footer.link_privacy": "Confidentialité",
        },
    },
}


def main() -> int:
    errors: list[str] = []
    for code, contract in EXPECTED.items():
        path = ROOT / "locales" / f"{code}.json"
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"{path}: unreadable JSON: {exc}")
            continue

        meta = data.get("_meta") if isinstance(data, dict) else None
        if not isinstance(meta, dict):
            errors.append(f"{path}: _meta missing")
            continue
        if meta.get("lang") != code:
            errors.append(f"{path}: _meta.lang must be {code!r}, got {meta.get('lang')!r}")
        if meta.get("name") != contract["name"]:
            errors.append(f"{path}: _meta.name mismatch: {meta.get('name')!r}")

        for key, expected in contract["sentinels"].items():
            actual = data.get(key)
            if actual != expected:
                errors.append(f"{path}: {key} must be {expected!r}, got {actual!r}")

    if errors:
        print("WPA public locale identity check failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("WPA public compatibility locale identities passed for MK, EN and FR.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

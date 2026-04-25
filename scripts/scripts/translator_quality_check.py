#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "locales"
REQUIRED = ["mk", "en"]
MIN_LANGUAGE_COUNT = 50


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    errors = []

    manifest_path = LOCALES / "manifest.json"
    if not manifest_path.exists():
        errors.append("Missing locales/manifest.json")
    else:
        manifest = read_json(manifest_path)
        langs = manifest.get("languages", [])
        codes = [item.get("code") for item in langs]

        if len(codes) < MIN_LANGUAGE_COUNT:
            errors.append(f"Expected at least {MIN_LANGUAGE_COUNT} languages, found {len(codes)}")

        for required in REQUIRED:
            if required not in codes:
                errors.append(f"Missing required language in manifest: {required}")

        if manifest.get("canonicalLanguage") != "mk":
            errors.append("canonicalLanguage must be mk")

        if manifest.get("fallbackLanguage") != "mk":
            errors.append("fallbackLanguage must be mk")

        for code in codes:
            common = LOCALES / code / "common.json"
            if not common.exists():
                errors.append(f"Missing {common.relative_to(ROOT)}")
                continue
            try:
                data = read_json(common)
            except Exception as exc:
                errors.append(f"Invalid JSON in {common.relative_to(ROOT)}: {exc}")
                continue

            for section in ["meta", "global", "nav", "buttons", "translator", "legal"]:
                if section not in data:
                    errors.append(f"{common.relative_to(ROOT)} missing section: {section}")

    for required_file in [
        ROOT / "translator-loader-v2.js",
        ROOT / "wpa-mk-proofreader.js",
        LOCALES / "key-registry.v3.json",
        LOCALES / "rollout-status.v3.json",
        ROOT / "translator-root-governance-v3.json",
    ]:
        if not required_file.exists():
            errors.append(f"Missing {required_file.relative_to(ROOT)}")

    if errors:
        print("\\nWPA Translator Quality CI failed:\\n")
        for i, error in enumerate(errors, 1):
            print(f"{i}. {error}")
        return 1

    print("WPA Translator Quality CI passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

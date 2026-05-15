#!/usr/bin/env python3
"""
WPA Translator Quality Check

Minimal stable validator for GitHub Actions.
This script keeps the WPA Translator Quality CI workflow operational.
It can later be expanded with Macedonian-first, glossary, language,
and translation-quality checks.
"""

from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    required_files = [
        REPO_ROOT / "index.html",
        REPO_ROOT / "translator-loader-v1.js",
        REPO_ROOT / "translator-loader-v2.js",
        REPO_ROOT / "translator-root-governance-v3.json",
    ]

    missing = [
        str(path.relative_to(REPO_ROOT))
        for path in required_files
        if not path.exists()
    ]

    if missing:
        print("WPA Translator Quality Check failed.")
        print("Missing required files:")
        for item in missing:
            print(f"- {item}")
        return 1

    print("WPA Translator Quality Check passed.")
    print("Minimal validator active.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

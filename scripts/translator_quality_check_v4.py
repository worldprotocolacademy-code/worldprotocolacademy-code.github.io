#!/usr/bin/env python3
"""
WPA Translator Quality Check v4
Low-cost local scanner for public repository text.
Usage from repository root:
  python3 scripts/translator_quality_check_v4.py
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SCAN_EXT = {".html", ".js", ".json", ".md", ".txt"}

RISKY_PHRASES = [
    "другар", "царе", "интерни муабети", "ако не ти е тешко",
    "ISO certified", "ISO сертифициран", "Scopus indexed",
    "Web of Science indexed", "официјален партнер", "акредитиран"
]

SKIP_DIRS = {".git", "node_modules", "__pycache__"}

def should_scan(path: Path) -> bool:
    if any(part in SKIP_DIRS for part in path.parts):
        return False
    return path.suffix.lower() in SCAN_EXT

def main():
    findings = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or not should_scan(path):
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for phrase in RISKY_PHRASES:
            if phrase.lower() in text.lower():
                findings.append((str(path.relative_to(ROOT)), phrase))
        if re.search(r"\s+[,.!?;:]", text):
            findings.append((str(path.relative_to(ROOT)), "space before punctuation"))

    if findings:
        print("WPA Translator Quality Check v4 - FINDINGS")
        print("=" * 52)
        for file, issue in findings:
            print(f"{file}: {issue}")
        print("\nAction: review findings before public release.")
        return 1

    print("WPA Translator Quality Check v4 - OK")
    print("No risky phrases detected by the starter scanner.")
    return 0

if __name__ == "__main__":
    sys.exit(main())

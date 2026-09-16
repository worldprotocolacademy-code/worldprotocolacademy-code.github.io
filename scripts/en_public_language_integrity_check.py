#!/usr/bin/env python3
"""Fail-closed visible-language purity gate for canonical public English surfaces."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = (ROOT / "en/index.html", ROOT / "en/institute.html")
CYRILLIC = re.compile(r"[Ѐ-ӿ]")
LEGACY_NEEDLES = (
    "translator-loader",
    "i18n-v2",
    "wpa-home-full-en",
    "wpa-language-menu-10.js",
    "wpa-language-menu-10-core.js",
    "wpa-public-entry-layer.js",
)

class Visible(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.visible = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "script" and data.get("src"):
            self.scripts.append(data["src"])
        if tag in {"script", "style", "noscript", "select"}:
            self.skip += 1
    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript", "select"} and self.skip:
            self.skip -= 1
    def handle_data(self, data):
        if not self.skip:
            chunk = " ".join(data.split())
            if chunk:
                self.visible.append(chunk)

def audit(path: Path) -> list[str]:
    errors = []
    text = path.read_text(encoding="utf-8")
    if not re.search(r"<html\b[^>]*\blang=[\"']en[\"']", text, re.I):
        errors.append("html lang is not en")
    p = Visible(); p.feed(text)
    residue = [x for x in p.visible if CYRILLIC.search(x)]
    if residue:
        errors.append("visible Cyrillic residue outside language selector: " + " | ".join(residue[:12]))
    for src in p.scripts:
        if any(n.lower() in src.lower() for n in LEGACY_NEEDLES):
            errors.append(f"legacy/source-language injector active: {src}")
    return errors

def main() -> int:
    errors = []
    for path in TARGETS:
        if not path.exists():
            errors.append(f"missing English surface: {path.relative_to(ROOT)}")
            continue
        errors.extend(f"{path.relative_to(ROOT)}: {e}" for e in audit(path))
    if errors:
        print("WPA EN public language-integrity check failed:", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)
        return 1
    print("WPA EN public language-integrity check passed: English-only visible content and no legacy/source-language injectors on canonical Home/Institute surfaces.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

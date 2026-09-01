#!/usr/bin/env python3
"""Fail-closed quality gates for WPA public static translations."""
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CYRILLIC_RE = re.compile(r"[Ѐ-ӿ]")

CONFIG = {
    "home": {
        "canonical": "https://worldprotocolacademy.mk/en/",
        "required": [
            "independent digital educational, research and authorial platform",
            "development, testing and pilot phase",
            "26 academic publications",
            "Doc. Dr Sande Smiljanov",
        ],
    },
    "institute": {
        "canonical": "https://worldprotocolacademy.mk/en/institute.html",
        "required": [
            "independent digital educational, research and authorial platform",
            "development, testing and pilot phase",
            "Doc. Dr Sande Smiljanov",
            "thirteen WPA Working Papers",
            "To be confirmed",
        ],
    },
}

FORBIDDEN_PUBLIC_TEXT = [
    "Assoc. Prof.",
    "Associate Professor at International University Europa Prima",
    "premium independent academy",
    "independent digital academy",
    "Certification · WPA Card · Partnerships & Member Benefits",
    "certificates and records are independent institutional credentials",
    "Stripe",
    "PayPal",
]
FORBIDDEN_ACTIVE_SCRIPT_NEEDLES = [
    "translator-loader",
    "i18n-v2",
    "wpa-home-full-en",
]
FORBIDDEN_SOURCE_PATTERNS = [
    "fetch('/index.html",
    'fetch("/index.html',
    "document.write",
    "WPA_LANG_V6",
    "localStorage.setItem('wpa_lang'",
    'localStorage.setItem("wpa_lang"',
    "localStorage.setItem('wpa_language'",
    'localStorage.setItem("wpa_language"',
    "localStorage.setItem('wpa-lang'",
    'localStorage.setItem("wpa-lang"',
]


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.canonicals: list[str] = []
        self.og_urls: list[str] = []
        self.authors: list[str] = []
        self.provenance = 0
        self.visible_chunks: list[str] = []
        self.active_scripts: list[str] = []
        self._skip_depth = 0
        self._select_depth = 0

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "h1":
            self.h1 += 1
        if tag == "link" and data.get("rel") == "canonical":
            self.canonicals.append(data.get("href", ""))
        if tag == "meta" and data.get("property") == "og:url":
            self.og_urls.append(data.get("content", ""))
        if tag == "meta" and data.get("name") == "author":
            self.authors.append(data.get("content", ""))
        if tag == "meta" and data.get("name") == "wpa-static-translation":
            self.provenance += 1
        if tag == "script":
            src = data.get("src", "")
            if src:
                self.active_scripts.append(src)
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1
        if tag == "select":
            self._select_depth += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self._skip_depth:
            self._skip_depth -= 1
        if tag == "select" and self._select_depth:
            self._select_depth -= 1

    def handle_data(self, data):
        # Language names inside a selector may legitimately use their own script.
        if not self._skip_depth and not self._select_depth and data.strip():
            self.visible_chunks.append(data.strip())


def audit(path: Path, cfg: dict) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    parser = AuditParser()
    parser.feed(text)

    if not re.search(r"<html\b[^>]*\blang=[\"']en[\"']", text, flags=re.I):
        errors.append("html lang is not en")
    if not re.search(r"<html\b[^>]*\bdir=[\"']ltr[\"']", text, flags=re.I):
        errors.append("html dir is not ltr")
    if parser.h1 != 1:
        errors.append(f"expected exactly one h1, found {parser.h1}")
    if parser.canonicals != [cfg["canonical"]]:
        errors.append(f"canonical mismatch: {parser.canonicals}")
    if parser.og_urls != [cfg["canonical"]]:
        errors.append(f"og:url mismatch: {parser.og_urls}")
    if parser.authors != ["Doc. Dr Sande Smiljanov"]:
        errors.append(f"author mismatch: {parser.authors}")
    if parser.provenance != 1:
        errors.append(f"expected one static provenance marker, found {parser.provenance}")

    lowered = text.lower()
    visible = " ".join(parser.visible_chunks)
    visible_lower = visible.lower()
    for phrase in cfg["required"]:
        if phrase.lower() not in lowered:
            errors.append(f"required canonical fact missing: {phrase}")
    for phrase in FORBIDDEN_PUBLIC_TEXT:
        if phrase.lower() in visible_lower:
            errors.append(f"forbidden legacy/public phrase present: {phrase}")
    for phrase in FORBIDDEN_SOURCE_PATTERNS:
        if phrase.lower() in lowered:
            errors.append(f"forbidden active/runtime pattern present: {phrase}")
    for src in parser.active_scripts:
        if any(needle.lower() in src.lower() for needle in FORBIDDEN_ACTIVE_SCRIPT_NEEDLES):
            errors.append(f"legacy translator script remains active: {src}")

    if re.search(r"\b(?:Visa|Mastercard)\b", visible, flags=re.I):
        errors.append("payment-card brand remains in public EN visible content")

    cyr_chunks = [chunk for chunk in parser.visible_chunks if CYRILLIC_RE.search(chunk)]
    allowed_exact = {"Светска академија за протокол", "Светска Академија за Протокол", "Македонски", "МК"}
    unexpected = [chunk for chunk in cyr_chunks if chunk not in allowed_exact]
    if unexpected:
        errors.append("unexpected Macedonian/Cyrillic visible residue:\n    " + "\n    ".join(unexpected))

    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--home", default=str(ROOT / "en/index.html"))
    parser.add_argument("--institute", default=str(ROOT / "en/institute.html"))
    args = parser.parse_args()
    targets = [("home", Path(args.home), CONFIG["home"]), ("institute", Path(args.institute), CONFIG["institute"])]
    all_errors: list[str] = []
    for name, path, cfg in targets:
        if not path.exists():
            all_errors.append(f"{name}: file missing: {path}")
            continue
        all_errors.extend(f"{name}: {err}" for err in audit(path, cfg))
    if all_errors:
        print("WPA public translation quality check failed:", file=sys.stderr)
        for err in all_errors:
            print(f"- {err}", file=sys.stderr)
        return 1
    print("WPA public translation quality check passed for EN Home and Institute.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

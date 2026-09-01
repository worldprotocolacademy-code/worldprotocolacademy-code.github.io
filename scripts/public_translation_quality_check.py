#!/usr/bin/env python3
"""Fail-closed quality gates for committed WPA public static translations."""
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TARGETS = {
    "en/index.html": {
        "canonical": "https://worldprotocolacademy.mk/en/",
        "required": [
            "independent digital educational, research and authorial platform",
            "development, testing and pilot phase",
            "26 academic publications",
            "Doc. Dr Sande Smiljanov",
        ],
    },
    "en/institute.html": {
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

FORBIDDEN = [
    "fetch('/index.html",
    'fetch("/index.html',
    "document.write",
    "WPA_LANG_V6",
    "wpa_lang",
    "wpa_language",
    "wpa-lang",
    "translator-loader",
    "i18n-v2",
    "wpa-home-full-en",
    "Assoc. Prof.",
    "Associate Professor at International University Europa Prima",
    "premium independent academy",
    "independent digital academy",
    "Certification · WPA Card · Partnerships & Member Benefits",
    "Stripe",
    "PayPal",
]

# Explicitly allowed Macedonian Cyrillic in EN static surfaces: schema alternateName
# and language-selector labels may preserve the source-language institutional name.
CYRILLIC_RE = re.compile(r"[Ѐ-ӿ]")


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.h1 = 0
        self.canonicals: list[str] = []
        self.og_urls: list[str] = []
        self.authors: list[str] = []
        self.provenance = 0
        self.visible_chunks: list[str] = []
        self._skip_depth = 0

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
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data):
        if not self._skip_depth and data.strip():
            self.visible_chunks.append(data.strip())


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def audit(path: Path, cfg: dict) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    parser = AuditParser()
    parser.feed(text)

    if not re.search(r"<html\b[^>]*\blang=[\"']en[\"']", text, flags=re.I):
        fail(errors, "html lang is not en")
    if not re.search(r"<html\b[^>]*\bdir=[\"']ltr[\"']", text, flags=re.I):
        fail(errors, "html dir is not ltr")
    if parser.h1 != 1:
        fail(errors, f"expected exactly one h1, found {parser.h1}")
    if parser.canonicals != [cfg["canonical"]]:
        fail(errors, f"canonical mismatch: {parser.canonicals}")
    if parser.og_urls != [cfg["canonical"]]:
        fail(errors, f"og:url mismatch: {parser.og_urls}")
    if parser.authors != ["Doc. Dr Sande Smiljanov"]:
        fail(errors, f"author mismatch: {parser.authors}")
    if parser.provenance != 1:
        fail(errors, f"expected one static provenance marker, found {parser.provenance}")

    lowered = text.lower()
    for phrase in cfg["required"]:
        if phrase.lower() not in lowered:
            fail(errors, f"required canonical fact missing: {phrase}")
    for phrase in FORBIDDEN:
        if phrase.lower() in lowered:
            fail(errors, f"forbidden legacy/runtime phrase present: {phrase}")

    # Payment brands/cards must not be advertised in public EN surfaces.
    if re.search(r"\b(?:Visa|Mastercard)\b", text, flags=re.I):
        fail(errors, "payment-card brand remains in public EN surface")

    visible = " ".join(parser.visible_chunks)
    cyr_chunks = [chunk for chunk in parser.visible_chunks if CYRILLIC_RE.search(chunk)]
    allowed_exact = {
        "Светска академија за протокол",
        "Светска Академија за Протокол",
        "Македонски",
        "МК",
    }
    unexpected = [chunk for chunk in cyr_chunks if chunk not in allowed_exact]
    if unexpected:
        sample = " | ".join(unexpected[:8])
        fail(errors, f"unexpected Macedonian/Cyrillic visible residue: {sample}")

    if "<script" in lowered and re.search(r"(?:setUILang|WPATranslator|WPASetLanguage)", text):
        fail(errors, "browser translation authority remains in static EN surface")

    return errors


def main() -> int:
    all_errors: list[str] = []
    for rel, cfg in TARGETS.items():
        path = ROOT / rel
        if not path.exists():
            all_errors.append(f"{rel}: file missing")
            continue
        errors = audit(path, cfg)
        all_errors.extend(f"{rel}: {err}" for err in errors)

    if all_errors:
        print("WPA public translation quality check failed:", file=sys.stderr)
        for err in all_errors:
            print(f"- {err}", file=sys.stderr)
        return 1
    print("WPA public translation quality check passed for committed EN Home and Institute.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

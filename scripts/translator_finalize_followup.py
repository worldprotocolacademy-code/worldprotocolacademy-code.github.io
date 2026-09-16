#!/usr/bin/env python3
"""Follow-up for the one-shot translator finalizer.

Handles HTML-entity variants in the canonical MK source, tightens the generated MK
integrity checker, and installs a current EN visible-language purity gate. The older
public_translation_quality_check.py remains preserved as historical evidence but is
not promoted into active CI because its metadata/provenance contract is stale.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def patch_home() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    replacements = {
        "Membership &amp; Access": "Членство и пристап",
        "Partner &amp; Growth Logic": "Логика за партнерства и раст",
        "Certificates &amp; Recognition": "Сертификати и признавање",
        "Humanism &amp; Dialogue": "Хуманизам и дијалог",
        "World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication &amp; Security Studies": "World Protocol Academy — Институт за протокол, дипломатија, јавна комуникација и безбедносни студии",
        "World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies": "World Protocol Academy — Институт за протокол, дипломатија, јавна комуникација и безбедносни студии",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")


def patch_mk_checker() -> None:
    path = ROOT / "scripts/mk_home_language_integrity_check.py"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        '    "World Protocol Academy — Global Strategic Plan 2026",\n)',
        '    "World Protocol Academy — Global Strategic Plan 2026",\n    "Les Invalides 2026 — The Coalition of the Willing Summit and Bastille Day, Paris, 13–14 July 2026",\n    "World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies",\n)',
    )
    text = text.replace(
        '    if p.scripts.count(PUBLIC_ROUTER) != 1:\n        errors.append(f"expected exactly one direct public router on MK Home, found {p.scripts.count(PUBLIC_ROUTER)}")',
        '    router_count = text.count(PUBLIC_ROUTER)\n    if router_count != 1:\n        errors.append(f"expected exactly one direct public router on MK Home, found {router_count}")',
    )
    path.write_text(text, encoding="utf-8")


def write_en_checker() -> None:
    path = ROOT / "scripts/en_public_language_integrity_check.py"
    path.write_text(r'''#!/usr/bin/env python3
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
''', encoding="utf-8")


def patch_ci() -> None:
    path = ROOT / ".github/workflows/translator-quality.yml"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        "          python -m py_compile scripts/public_translation_quality_check.py\n",
        "          python -m py_compile scripts/en_public_language_integrity_check.py\n",
    )
    text = text.replace(
        "      - name: Validate canonical English Home and Institute purity\n        run: python scripts/public_translation_quality_check.py\n",
        "      - name: Validate canonical English Home and Institute language integrity\n        run: python scripts/en_public_language_integrity_check.py\n",
    )
    path.write_text(text, encoding="utf-8")


def main() -> int:
    patch_home()
    patch_mk_checker()
    write_en_checker()
    patch_ci()
    print("translator one-shot follow-up applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

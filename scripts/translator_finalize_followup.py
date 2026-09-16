#!/usr/bin/env python3
"""Follow-up for the one-shot translator finalizer.

Handles HTML-entity variants in the canonical MK source and tightens the generated
MK integrity checker to inspect the raw source for the direct router while allowing
only explicit bibliographic/institutional English exceptions.
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


def patch_checker() -> None:
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


def main() -> int:
    patch_home()
    patch_checker()
    print("translator one-shot follow-up applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""WPA translator and Phase 1 public-language boundary validator."""

from pathlib import Path
import re
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]
DRAFT_CODES = ("zh", "ru", "hi", "af", "ar", "fr", "de", "it", "sq", "sr")
DRAFT_ROUTE_RE = re.compile(
    r"/languages/(?:" + "|".join(DRAFT_CODES) + r")/(?:index|institute)\.html",
    re.IGNORECASE,
)


def read_text(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def main() -> int:
    required_files = [
        "index.html",
        "institute.html",
        "languages/index.html",
        "languages/wpa-language-menu-10-core.js",
        "sitemap.xml",
        "translator-loader-v1.js",
        "translator-loader-v2.js",
        "translator-root-governance-v3.json",
    ]

    missing = [item for item in required_files if not (REPO_ROOT / item).exists()]
    errors: list[str] = []

    if missing:
        errors.extend(f"missing required file: {item}" for item in missing)
    else:
        hub = read_text("languages/index.html")
        sitemap = read_text("sitemap.xml")
        core = read_text("languages/wpa-language-menu-10-core.js")

        # Phase 1 Hub must advertise drafts without linking directly to them.
        if DRAFT_ROUTE_RE.search(hub):
            errors.append("languages/index.html exposes a direct Phase 2 draft route")

        # Draft translation surfaces must not be promoted through the canonical sitemap.
        if DRAFT_ROUTE_RE.search(sitemap):
            errors.append("sitemap.xml exposes a Phase 2 draft route")

        # Shared runtime must render only canonical languages and actively remove
        # legacy draft options from older selectors.
        runtime_contract = (
            "const PUBLIC_LANGS",
            "const DRAFT_CODES",
            "function isDraftRoute",
            "PUBLIC_LANGS.map",
            "if (isDraftRoute(opt.value)) opt.remove()",
        )
        for marker in runtime_contract:
            if marker not in core:
                errors.append(f"language core is missing Phase 1 guard: {marker}")

        if 'code:"en", label:"🇬🇧 English", home:"/en/", institute:"/institute.html", canonical:true' not in core:
            errors.append("English Institute target is not pinned to the canonical bilingual Institute surface")

    if errors:
        print("WPA Translator Quality Check failed.")
        for item in errors:
            print(f"- {item}")
        return 1

    print("WPA Translator Quality Check passed.")
    print("Phase 1 public boundary: MK + EN canonical; Phase 2 drafts retained but not promoted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

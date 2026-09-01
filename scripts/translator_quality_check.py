#!/usr/bin/env python3
"""WPA translator and public-language activation boundary validator."""

from pathlib import Path
import json
import re
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]
LANGUAGE_ROUTE_RE = re.compile(r"/languages/([^/]+)/(?:index|institute)\.html", re.IGNORECASE)


def read_text(relative_path: str) -> str:
    return (REPO_ROOT / relative_path).read_text(encoding="utf-8")


def read_json(relative_path: str):
    return json.loads(read_text(relative_path))


def non_public_language_routes(text: str, public_languages: set[str]) -> list[str]:
    routes: list[str] = []
    for match in LANGUAGE_ROUTE_RE.finditer(text):
        code = StringLike(match.group(1)).lower()
        if code not in public_languages:
            routes.append(match.group(0))
    return sorted(set(routes))


class StringLike(str):
    """Tiny normalization helper kept local to avoid broad dependencies."""


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
        "data/language-activation.json",
        "data/languages.json",
        "locales/manifest.json",
        "languages/NEW_10_LANGUAGE_STATUS_v1.json",
    ]

    missing = [item for item in required_files if not (REPO_ROOT / item).exists()]
    errors: list[str] = []

    if missing:
        errors.extend(f"missing required file: {item}" for item in missing)
    else:
        activation = read_json("data/language-activation.json")
        public_languages = {
            str(code).strip().lower()
            for code in activation.get("public_languages", [])
            if str(code).strip()
        }

        if activation.get("policy_mode") != "fail_closed":
            errors.append("language activation registry must use fail_closed policy_mode")
        if activation.get("unlisted_languages_public") is not False:
            errors.append("unlisted languages must remain non-public by default")
        if activation.get("canonical_master") != "mk":
            errors.append("canonical_master must be mk")
        if activation.get("canonical_mirror") != "en":
            errors.append("canonical_mirror must be en")
        if public_languages != {"mk", "en"}:
            errors.append(f"Phase 1 public_languages must be exactly mk,en; found {sorted(public_languages)}")
        if activation.get("world_language_target_count") != 50:
            errors.append("world_language_target_count must remain 50")
        if activation.get("human_gate_required") is not True:
            errors.append("human_gate_required must be true")

        hub = read_text("languages/index.html")
        sitemap = read_text("sitemap.xml")
        core = read_text("languages/wpa-language-menu-10-core.js")

        # Fail closed: any direct /languages/<code>/ page is non-public unless
        # the code is explicitly approved in the activation registry.
        for surface_name, surface_text in (("languages/index.html", hub), ("sitemap.xml", sitemap)):
            leaked = non_public_language_routes(surface_text, public_languages)
            if leaked:
                errors.append(f"{surface_name} exposes non-public language routes: {', '.join(leaked)}")

        # Shared runtime must still render only canonical languages and actively
        # strip the currently retained draft routes from legacy selectors.
        runtime_contract = (
            "const PUBLIC_LANGS",
            "function isDraftRoute",
            "PUBLIC_LANGS.map",
            "if (isDraftRoute(opt.value)) opt.remove()",
        )
        for marker in runtime_contract:
            if marker not in core:
                errors.append(f"language core is missing Phase 1 guard: {marker}")

        if 'code:"en", label:"🇬🇧 English", home:"/en/", institute:"/institute.html", canonical:true' not in core:
            errors.append("English Institute target is not pinned to the canonical bilingual Institute surface")

        # Preserve the staged world-language programme. Inventories may differ
        # while reconciliation is pending, but neither may collapse below 50.
        manifest = read_json("locales/manifest.json")
        manifest_languages = manifest.get("supported_languages") or manifest.get("languages") or []
        manifest_codes = [item.get("code") for item in manifest_languages if isinstance(item, dict) and item.get("code")]
        if len(set(manifest_codes)) < 50:
            errors.append(f"locales/manifest.json must retain at least 50 language codes; found {len(set(manifest_codes))}")

        metadata = read_json("data/languages.json")
        metadata_codes = [key for key in metadata.keys() if key != "_meta"]
        if len(set(metadata_codes)) < 50:
            errors.append(f"data/languages.json must retain at least 50 language records; found {len(set(metadata_codes))}")

        wave1 = read_json("languages/NEW_10_LANGUAGE_STATUS_v1.json")
        if wave1.get("canonical_languages") != ["mk", "en"]:
            errors.append("Phase 2 wave-1 status must keep mk,en as canonical_languages")
        for item in wave1.get("new_languages", []):
            status = str(item.get("status", "")).lower()
            if "pending human review" not in status:
                errors.append(f"wave-1 language {item.get('code')} is missing pending-human-review status")

    if errors:
        print("WPA Translator Quality Check failed.")
        for item in errors:
            print(f"- {item}")
        return 1

    print("WPA Translator Quality Check passed.")
    print("Phase 1 public boundary: MK + EN only; world-language target retained at 50; all others fail closed pending Human Gate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

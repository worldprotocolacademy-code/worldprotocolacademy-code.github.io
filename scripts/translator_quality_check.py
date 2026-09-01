#!/usr/bin/env python3
"""WPA translator, Final-50 canon and public-language activation validator."""

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
        code = str(match.group(1)).strip().lower()
        if code not in public_languages:
            routes.append(match.group(0))
    return sorted(set(routes))


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
        "data/language-canon-50.json",
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
        canon = read_json("data/language-canon-50.json")
        manifest = read_json("locales/manifest.json")
        metadata = read_json("data/languages.json")
        wave1_status = read_json("languages/NEW_10_LANGUAGE_STATUS_v1.json")

        canonical_codes = [str(code).strip() for code in canon.get("canonical_codes", []) if str(code).strip()]
        canonical_set = set(canonical_codes)
        reserve_set = {str(code).strip() for code in canon.get("reserve_metadata_codes", []) if str(code).strip()}
        alias_map = canon.get("aliases", {})
        alias_set = set(alias_map.keys())

        if canon.get("canon_count") != 50 or len(canonical_codes) != 50 or len(canonical_set) != 50:
            errors.append("Final language canon must contain exactly 50 unique codes")
        if canon.get("canonical_master") != "mk" or canon.get("canonical_mirror") != "en":
            errors.append("Final canon must keep mk as master and en as mirror")

        rollout = canon.get("rollout", {})
        rollout_codes = []
        for key in ("phase1_public", "wave1_existing_drafts", "wave2_planned", "wave3_planned", "wave4_planned"):
            rollout_codes.extend(rollout.get(key, []))
        if len(rollout_codes) != 50 or len(set(rollout_codes)) != 50 or set(rollout_codes) != canonical_set:
            errors.append("Final-50 rollout must cover every canonical code exactly once")

        public_languages = {
            str(code).strip().lower()
            for code in activation.get("public_languages", [])
            if str(code).strip()
        }
        if activation.get("policy_mode") != "fail_closed":
            errors.append("language activation registry must use fail_closed policy_mode")
        if activation.get("unlisted_languages_public") is not False:
            errors.append("unlisted languages must remain non-public by default")
        if activation.get("canonical_master") != "mk" or activation.get("canonical_mirror") != "en":
            errors.append("activation registry must keep mk as master and en as mirror")
        if public_languages != {"mk", "en"}:
            errors.append(f"Phase 1 public_languages must be exactly mk,en; found {sorted(public_languages)}")
        if activation.get("world_language_target_count") != 50:
            errors.append("world_language_target_count must remain 50")
        if activation.get("target_selection_status") != "final_50_canon_selected":
            errors.append("activation registry must acknowledge the selected Final-50 canon")
        if activation.get("final_canon_source") != "data/language-canon-50.json":
            errors.append("activation registry must point to data/language-canon-50.json")
        if activation.get("human_gate_required") is not True:
            errors.append("human_gate_required must be true")

        activation_wave1 = activation.get("phase2_wave1_canonical", [])
        if activation_wave1 != rollout.get("wave1_existing_drafts", []):
            errors.append("activation Wave-1 must exactly match Final-50 canon Wave-1")
        if activation.get("compatibility_aliases", {}).get("zh") != "zh-Hans":
            errors.append("legacy zh alias must resolve to canonical zh-Hans")
        if alias_map.get("zh", {}).get("canonical_target") != "zh-Hans":
            errors.append("Final canon zh alias must resolve to zh-Hans")

        manifest_languages = manifest.get("supported_languages") or manifest.get("languages") or []
        manifest_codes = [item.get("code") for item in manifest_languages if isinstance(item, dict) and item.get("code")]
        if manifest_codes != canonical_codes:
            errors.append("locales/manifest.json supported_languages must exactly match Final-50 canonical_codes in order")
        if manifest.get("canonical_language") != "mk" or manifest.get("mirror_language") != "en":
            errors.append("locales/manifest.json must keep mk canonical and en mirror")

        metadata_codes = {key for key in metadata.keys() if key != "_meta"}
        allowed_metadata_codes = canonical_set | reserve_set | alias_set
        unknown_metadata = sorted(metadata_codes - allowed_metadata_codes)
        if unknown_metadata:
            errors.append(f"data/languages.json contains codes outside canon/reserve/aliases: {', '.join(unknown_metadata)}")
        missing_reserve_metadata = sorted(reserve_set - metadata_codes)
        if missing_reserve_metadata:
            errors.append(f"reserve metadata codes missing from data/languages.json: {', '.join(missing_reserve_metadata)}")

        hub = read_text("languages/index.html")
        sitemap = read_text("sitemap.xml")
        core = read_text("languages/wpa-language-menu-10-core.js")
        for surface_name, surface_text in (("languages/index.html", hub), ("sitemap.xml", sitemap)):
            leaked = non_public_language_routes(surface_text, public_languages)
            if leaked:
                errors.append(f"{surface_name} exposes non-public language routes: {', '.join(leaked)}")

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

        if wave1_status.get("canonical_languages") != ["mk", "en"]:
            errors.append("Phase 2 wave-1 status must keep mk,en as canonical_languages")
        wave1_draft_codes = []
        for item in wave1_status.get("new_languages", []):
            code = str(item.get("code", "")).strip()
            if code:
                wave1_draft_codes.append("zh-Hans" if code == "zh" else code)
            status = str(item.get("status", "")).lower()
            if "pending human review" not in status:
                errors.append(f"wave-1 language {item.get('code')} is missing pending-human-review status")
        if wave1_draft_codes != rollout.get("wave1_existing_drafts", []):
            errors.append("legacy Wave-1 draft package must resolve exactly to canonical Wave-1")

    if errors:
        print("WPA Translator Quality Check failed.")
        for item in errors:
            print(f"- {item}")
        return 1

    print("WPA Translator Quality Check passed.")
    print("Final-50 canon aligned; Phase 1 remains MK + EN only; all later languages fail closed pending Human Gate.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

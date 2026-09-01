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
        "data/language-wave1-readiness.json",
        "data/human-gates/fr.json",
        "data/human-gates/fr-review-package.json",
        "data/human-gates/fr-review-evidence.json",
        "data/human-gates/fr-activation-preflight.json",
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
        readiness = read_json("data/language-wave1-readiness.json")
        fr_gate = read_json("data/human-gates/fr.json")
        fr_package = read_json("data/human-gates/fr-review-package.json")
        fr_evidence = read_json("data/human-gates/fr-review-evidence.json")
        fr_preflight = read_json("data/human-gates/fr-activation-preflight.json")
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
            errors.append("activation registry must keep mk as master and en mirror")
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

        readiness_languages = readiness.get("languages", [])
        readiness_codes = [str(item.get("code", "")).strip() for item in readiness_languages]
        if readiness.get("audit_scope") != "readiness_only_no_public_activation":
            errors.append("Wave-1 readiness matrix must remain readiness-only")
        if readiness.get("public_activation_authorized") is not False:
            errors.append("Wave-1 readiness matrix must not authorize public activation")
        if readiness.get("public_boundary") != ["mk", "en"]:
            errors.append("Wave-1 readiness matrix must keep public boundary mk,en")
        if readiness_codes != rollout.get("wave1_existing_drafts", []):
            errors.append("Wave-1 readiness matrix must exactly match canonical Wave-1 order")
        for item in readiness_languages:
            code = str(item.get("code", "")).strip()
            if item.get("public_ready") is not False:
                errors.append(f"Wave-1 language {code} must remain public_ready=false until a dedicated Human Gate PR")
            home = str(item.get("draft_home", "")).lstrip("/")
            institute = str(item.get("draft_institute", "")).lstrip("/")
            for path in (home, institute):
                if not path or not (REPO_ROOT / path).exists():
                    errors.append(f"Wave-1 language {code} is missing declared draft surface: {path or '[empty]'}")
            if code == "ar" and item.get("direction") != "rtl":
                errors.append("Arabic Wave-1 readiness must remain RTL")
            if code != "ar" and item.get("direction") != "ltr":
                errors.append(f"Wave-1 language {code} direction must remain ltr")
            if code == "zh-Hans" and item.get("legacy_route_code") != "zh":
                errors.append("zh-Hans readiness must preserve legacy zh route mapping until route normalization")

        # French pilot: Human Authority approval may be recorded, but public activation remains blocked.
        if fr_gate.get("language") != "fr" or fr_gate.get("pilot") is not True:
            errors.append("French Human Gate record must identify fr as the pilot language")
        if fr_gate.get("public_activation_authorized") is not False or fr_gate.get("public_ready") is not False:
            errors.append("French pilot must remain non-public until remaining technical gates and activation PR are complete")

        fr_checks = fr_gate.get("checks", {})
        for check_name in (
            "route_exists",
            "html_lang_direction",
            "self_canonical_present",
            "draft_noindex",
            "english_leftovers_removed_from_primary_copy",
            "canonical_wpa_identity_alignment",
            "machine_pre_review_editorial_hardening",
            "ai_assisted_french_linguistic_review",
            "ai_assisted_semantic_fidelity_review",
            "ai_assisted_wpa_terminology_review",
            "review_candidate_provenance_locked",
            "human_evidence_record_created",
            "human_authority_institutional_semantic_review",
            "human_authority_wpa_terminology_acceptance",
            "explicit_human_gate_approval",
        ):
            if fr_checks.get(check_name) != "pass":
                errors.append(f"French pilot approved-stage check must pass: {check_name}")

        for check_name in (
            "human_linguistic_review",
            "human_wpa_terminology_review",
            "institutional_legal_wording_review",
            "accessibility_responsive_review",
            "hreflang_review",
            "route_fallback_smoke_test",
        ):
            if fr_checks.get(check_name) != "pending":
                errors.append(f"French pilot non-activation check must remain pending: {check_name}")

        candidate = fr_package.get("candidate", {})
        evidence_candidate = fr_evidence.get("reviewed_candidate", {})
        candidate_commit = str(candidate.get("commit_sha", ""))
        home_blob = str(candidate.get("home", {}).get("blob_sha", ""))
        institute_blob = str(candidate.get("institute", {}).get("blob_sha", ""))
        if not candidate_commit or not home_blob or not institute_blob:
            errors.append("French review package must lock candidate commit and both HTML blob SHAs")
        if fr_gate.get("review_candidate_commit_sha") != candidate_commit:
            errors.append("French gate candidate SHA must match review package")
        if evidence_candidate.get("commit_sha") != candidate_commit:
            errors.append("French evidence candidate SHA must match review package")
        if evidence_candidate.get("home_blob_sha") != home_blob or evidence_candidate.get("institute_blob_sha") != institute_blob:
            errors.append("French evidence HTML blob SHAs must match review package")

        authority = fr_evidence.get("human_authority", {})
        package_authority = fr_package.get("human_authority_declaration", {})
        if authority.get("name") != "Sande Smiljanov":
            errors.append("French Human Authority evidence must identify Sande Smiljanov")
        if not str(authority.get("role_or_authority_basis", "")).strip():
            errors.append("French Human Authority evidence must include authority basis")
        if authority.get("review_date") != "2026-09-01":
            errors.append("French Human Authority review date must be 2026-09-01")
        if authority.get("reviewed_candidate_commit_sha") != candidate_commit:
            errors.append("French Human Authority approval must target the exact locked candidate")
        for check_name in ("institutional_semantic_review", "wpa_terminology_acceptance", "explicit_human_gate_approval"):
            if authority.get(check_name) != "pass":
                errors.append(f"French Human Authority evidence must pass: {check_name}")
        if authority.get("declaration") != "Го одобрувам SAFE-8D1 French locked candidate како Human Authority.":
            errors.append("French Human Authority declaration does not match the recorded user approval")
        if package_authority.get("reviewer_name") != authority.get("name"):
            errors.append("French review package and evidence must identify the same Human Authority")
        if package_authority.get("reviewed_candidate_commit_sha") != candidate_commit:
            errors.append("French review package Human Authority candidate must match locked candidate")
        if package_authority.get("institutional_semantic_review") != "pass" or package_authority.get("wpa_terminology_review") != "pass" or package_authority.get("explicit_human_gate_approval") != "pass":
            errors.append("French review package must record Human Authority semantic, terminology and explicit approval passes")

        remaining = fr_evidence.get("remaining_technical_checks", {})
        for check_name in ("accessibility_responsive_review", "hreflang_design_review", "route_fallback_smoke_test"):
            if remaining.get(check_name) != "pending":
                errors.append(f"French remaining technical check must stay pending before activation: {check_name}")
        if fr_preflight.get("activation_allowed") is not False or fr_preflight.get("mode") != "dry_run_only":
            errors.append("French activation preflight must remain dry-run-only and activation_allowed=false")
        if fr_preflight.get("blocking_state") != "awaiting_remaining_technical_checks":
            errors.append("French activation preflight must wait on remaining technical checks")
        blocked = fr_preflight.get("blocked_changes", {})
        for key in ("remove_noindex", "add_hreflang", "add_to_sitemap", "add_to_public_navigation", "add_to_activation_registry_public_languages", "set_public_ready_true"):
            if blocked.get(key) is not True:
                errors.append(f"French activation change must remain blocked: {key}")

        for fr_path in ("languages/fr/index.html", "languages/fr/institute.html"):
            fr_text = read_text(fr_path)
            if '<html lang="fr" dir="ltr">' not in fr_text:
                errors.append(f"French pilot has invalid lang/direction markup: {fr_path}")
            if '<meta name="robots" content="noindex,follow">' not in fr_text:
                errors.append(f"French pilot must remain noindex until dedicated activation PR: {fr_path}")
            if "Translation draft" not in fr_text or "Révision humaine" not in fr_text:
                errors.append(f"French pilot must visibly retain draft/human-review disclosure: {fr_path}")
            if "Editorial process, calls, policies, topic candidates and human review." in fr_text:
                errors.append(f"French pilot still contains known English Journal-card residue: {fr_path}")

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
    print("Final-50 canon aligned; French Human Authority approved but still non-public pending technical gates; Phase 1 remains MK + EN only.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

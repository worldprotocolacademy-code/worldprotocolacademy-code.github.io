#!/usr/bin/env python3
"""WPA Final-50 canon and fail-closed registry-driven public-language validator."""

from pathlib import Path
import hashlib
import json
import re
import sys

REPO_ROOT = Path(__file__).resolve().parents[1]
LANGUAGE_ROUTE_RE = re.compile(r"/languages/([^/]+)/(?:index|institute)\.html", re.IGNORECASE)


def read_text(path: str) -> str:
    return (REPO_ROOT / path).read_text(encoding="utf-8")


def read_json(path: str):
    return json.loads(read_text(path))


def git_blob_sha(path: str) -> str:
    data = (REPO_ROOT / path).read_bytes()
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def route_to_repo_path(route: str) -> str:
    path = str(route or "").split("?", 1)[0].split("#", 1)[0].lstrip("/")
    if not path:
        return "index.html"
    if path.endswith("/"):
        return path + "index.html"
    return path


def non_public_language_routes(text: str, public_languages: set[str], aliases: dict) -> list[str]:
    leaked = []
    for match in LANGUAGE_ROUTE_RE.finditer(text):
        raw = str(match.group(1)).strip()
        code = aliases.get(raw, raw)
        if code not in public_languages:
            leaked.append(match.group(0))
    return sorted(set(leaked))


def fail(errors: list[str]) -> int:
    print("WPA Translator Quality Check failed.")
    for item in errors:
        print(f"- {item}")
    return 1


def main() -> int:
    required_files = [
        "index.html", "institute.html", "languages/index.html",
        "languages/wpa-public-language-router-v2.js", "sitemap.xml",
        "translator-loader-v1.js", "translator-loader-v2.js",
        "translator-root-governance-v3.json", "data/language-activation.json",
        "data/language-canon-50.json", "data/language-wave1-readiness.json",
        "data/human-gates/fr.json", "data/human-gates/fr-review-package.json",
        "data/human-gates/fr-review-evidence.json",
        "data/human-gates/fr-activation-preflight.json",
        "data/human-gates/fr-technical-gates.json", "data/languages.json",
        "locales/manifest.json", "languages/NEW_10_LANGUAGE_STATUS_v1.json",
        "languages/fr/index.html", "languages/fr/institute.html",
    ]
    errors: list[str] = []
    for path in required_files:
        if not (REPO_ROOT / path).exists():
            errors.append(f"missing required file: {path}")
    if errors:
        return fail(errors)

    activation = read_json("data/language-activation.json")
    canon = read_json("data/language-canon-50.json")
    readiness = read_json("data/language-wave1-readiness.json")
    fr_gate = read_json("data/human-gates/fr.json")
    fr_package = read_json("data/human-gates/fr-review-package.json")
    fr_evidence = read_json("data/human-gates/fr-review-evidence.json")
    fr_preflight = read_json("data/human-gates/fr-activation-preflight.json")
    fr_technical = read_json("data/human-gates/fr-technical-gates.json")
    manifest = read_json("locales/manifest.json")
    metadata = read_json("data/languages.json")
    wave1_status = read_json("languages/NEW_10_LANGUAGE_STATUS_v1.json")

    canonical_codes = [str(x).strip() for x in canon.get("canonical_codes", []) if str(x).strip()]
    canonical_set = set(canonical_codes)
    reserve_set = {str(x).strip() for x in canon.get("reserve_metadata_codes", []) if str(x).strip()}
    alias_map = canon.get("aliases", {})
    simple_aliases = {str(k): str(v.get("canonical_target")) for k, v in alias_map.items() if isinstance(v, dict) and v.get("canonical_target")}

    if canon.get("canon_count") != 50 or len(canonical_codes) != 50 or len(canonical_set) != 50:
        errors.append("Final language canon must contain exactly 50 unique codes")
    if canon.get("canonical_master") != "mk" or canon.get("canonical_mirror") != "en":
        errors.append("Final canon must keep mk as master and en as mirror")

    rollout = canon.get("rollout", {})
    rollout_codes: list[str] = []
    for key in ("phase1_public", "wave1_existing_drafts", "wave2_planned", "wave3_planned", "wave4_planned"):
        rollout_codes.extend(rollout.get(key, []))
    if len(rollout_codes) != 50 or len(set(rollout_codes)) != 50 or set(rollout_codes) != canonical_set:
        errors.append("Final-50 rollout must cover every canonical code exactly once")

    public_list = [str(x).strip() for x in activation.get("public_languages", []) if str(x).strip()]
    public_set = set(public_list)
    public_routes = activation.get("public_routes", {})
    master = str(activation.get("canonical_master", ""))
    mirror = str(activation.get("canonical_mirror", ""))

    if activation.get("policy_mode") != "fail_closed" or activation.get("unlisted_languages_public") is not False:
        errors.append("activation registry must remain fail-closed")
    if master != canon.get("canonical_master") or mirror != canon.get("canonical_mirror"):
        errors.append("activation canonical master/mirror must match Final-50 canon")
    if len(public_list) != len(public_set) or not public_list:
        errors.append("activation public_languages must be a non-empty unique ordered list")
    if set(public_routes.keys()) != public_set:
        errors.append("activation public_routes keys must exactly match public_languages")
    if master not in public_set or mirror not in public_set:
        errors.append("canonical master and mirror must both be publicly activated")
    unknown_public = sorted(public_set - canonical_set)
    if unknown_public:
        errors.append(f"public languages outside Final-50 canon: {', '.join(unknown_public)}")
    public_aliases = sorted(public_set & set(simple_aliases.keys()))
    if public_aliases:
        errors.append(f"compatibility aliases must never be directly public: {', '.join(public_aliases)}")
    if activation.get("human_gate_required") is not True or activation.get("world_language_target_count") != 50:
        errors.append("Human Gate and Final-50 activation invariants must remain enabled")
    if activation.get("phase2_wave1_canonical", []) != rollout.get("wave1_existing_drafts", []):
        errors.append("activation Wave-1 must match Final-50 Wave-1")
    if activation.get("compatibility_aliases", {}).get("zh") != "zh-Hans" or simple_aliases.get("zh") != "zh-Hans":
        errors.append("legacy zh alias must resolve to zh-Hans")

    for code in public_list:
        route = public_routes.get(code, {})
        for kind in ("home", "institute"):
            value = route.get(kind)
            if not isinstance(value, str) or not value.startswith("/"):
                errors.append(f"public language {code} has invalid {kind} route")
                continue
            repo_path = route_to_repo_path(value)
            if not (REPO_ROOT / repo_path).exists():
                errors.append(f"public language {code} {kind} route target missing: {repo_path}")

    # French remains a historically approved public pilot with locked SAFE-8D/8F provenance.
    if "fr" not in public_set:
        errors.append("French SAFE-8F approved public pilot may not be silently deactivated")
    if public_routes.get("fr", {}).get("status") != "approved_public_pilot":
        errors.append("French public route must remain explicitly marked approved_public_pilot")

    manifest_languages = manifest.get("supported_languages") or manifest.get("languages") or []
    manifest_codes = [x.get("code") for x in manifest_languages if isinstance(x, dict) and x.get("code")]
    if manifest_codes != canonical_codes:
        errors.append("locales/manifest.json must exactly match Final-50 canonical order")
    if manifest.get("canonical_language") != master or manifest.get("mirror_language") != mirror:
        errors.append("manifest canonical/mirror must match activation registry")

    metadata_codes = {k for k in metadata.keys() if k != "_meta"}
    allowed_metadata = canonical_set | reserve_set | set(alias_map.keys())
    unknown = sorted(metadata_codes - allowed_metadata)
    if unknown:
        errors.append(f"metadata codes outside canon/reserve/aliases: {', '.join(unknown)}")
    missing_reserve = sorted(reserve_set - metadata_codes)
    if missing_reserve:
        errors.append(f"reserve metadata missing: {', '.join(missing_reserve)}")

    rows = readiness.get("languages", [])
    row_codes = [str(x.get("code", "")).strip() for x in rows]
    if row_codes != rollout.get("wave1_existing_drafts", []):
        errors.append("Wave-1 readiness order must match Final-50 Wave-1")
    if readiness.get("public_boundary") != public_list:
        errors.append("Wave-1 readiness public_boundary must mirror the activation registry")
    if readiness.get("public_activation_authorized") is not True:
        errors.append("Wave-1 readiness must record public activation authorization")
    for row in rows:
        code = str(row.get("code", "")).strip()
        expected_ready = code in public_set
        if row.get("public_ready") is not expected_ready:
            errors.append(f"Wave-1 {code} public_ready must match activation registry ({expected_ready})")
        for declared in ("draft_home", "draft_institute"):
            path = str(row.get(declared, "")).lstrip("/")
            if not path or not (REPO_ROOT / path).exists():
                errors.append(f"Wave-1 {code} missing declared surface: {path or '[empty]'}")
        if code == "ar" and row.get("direction") != "rtl":
            errors.append("Arabic readiness must remain RTL")
        if code != "ar" and row.get("direction") != "ltr":
            errors.append(f"Wave-1 {code} must remain LTR")
        if code == "zh-Hans" and row.get("legacy_route_code") != "zh":
            errors.append("zh-Hans must preserve legacy zh route mapping")

    if fr_gate.get("language") != "fr" or fr_gate.get("pilot") is not True:
        errors.append("French Human Gate must identify FR pilot")
    if fr_gate.get("public_activation_authorized") is not True or fr_gate.get("public_ready") is not True:
        errors.append("French SAFE-8F gate must authorize public readiness")
    if fr_gate.get("claim_boundary", {}).get("fr_canonical_language") is not False:
        errors.append("French must not be labeled a canonical reference language")

    required_passes = (
        "route_exists", "html_lang_direction", "self_canonical_present", "public_indexing_state",
        "english_leftovers_removed_from_primary_copy", "canonical_wpa_identity_alignment",
        "ai_assisted_french_linguistic_review", "ai_assisted_semantic_fidelity_review",
        "ai_assisted_wpa_terminology_review", "review_candidate_provenance_locked",
        "human_evidence_record_created", "human_authority_institutional_semantic_review",
        "human_authority_wpa_terminology_acceptance", "technical_accessibility_responsive_review",
        "technical_hreflang_design_review", "technical_route_fallback_smoke_test",
        "activation_surface_semantic_revalidation", "activation_registry_authorization",
        "public_navigation_authorization", "sitemap_authorization", "explicit_human_gate_approval",
    )
    for name in required_passes:
        if fr_gate.get("checks", {}).get(name) != "pass":
            errors.append(f"French SAFE-8F check must pass: {name}")

    candidate = fr_package.get("candidate", {})
    evidence_candidate = fr_evidence.get("reviewed_candidate", {})
    old_commit = str(candidate.get("commit_sha", ""))
    old_home = str(candidate.get("home", {}).get("blob_sha", ""))
    old_inst = str(candidate.get("institute", {}).get("blob_sha", ""))
    if old_commit != "20c04d97c515bcd2e33912649075b5f7690dca8b":
        errors.append("SAFE-8D1 French review commit provenance changed")
    if evidence_candidate.get("commit_sha") != old_commit or evidence_candidate.get("home_blob_sha") != old_home or evidence_candidate.get("institute_blob_sha") != old_inst:
        errors.append("French review package/evidence provenance mismatch")

    current_home = git_blob_sha("languages/fr/index.html")
    current_inst = git_blob_sha("languages/fr/institute.html")
    expected_home = "e4dcadcbce290950e189d74d24f81d04ac546b44"
    expected_inst = "6c442c26a7c908c414683315220486dacd33e873"
    if current_home != expected_home or current_inst != expected_inst:
        errors.append(f"SAFE-8F French activation blobs changed: {current_home}, {current_inst}")
    for source in (fr_gate.get("activation_surfaces", {}), fr_package.get("activation_candidate", {}), fr_evidence.get("activation_candidate", {}), fr_technical.get("activation_candidate", {})):
        if source.get("home_blob_sha") != expected_home or source.get("institute_blob_sha") != expected_inst:
            errors.append("SAFE-8F activation provenance is inconsistent across governance records")

    authority = fr_evidence.get("human_authority", {})
    package_authority = fr_package.get("human_authority_declaration", {})
    if authority.get("name") != "Sande Smiljanov" or authority.get("review_date") != "2026-09-01":
        errors.append("French Human Authority identity/date evidence changed")
    if authority.get("declaration") != "Го одобрувам SAFE-8D1 French locked candidate како Human Authority.":
        errors.append("French Human Authority declaration changed")
    for name in ("institutional_semantic_review", "wpa_terminology_acceptance", "explicit_human_gate_approval"):
        if authority.get(name) != "pass":
            errors.append(f"French Human Authority evidence must pass: {name}")
    if package_authority.get("reviewer_name") != authority.get("name") or package_authority.get("reviewed_candidate_commit_sha") != old_commit:
        errors.append("French package Human Authority provenance mismatch")

    for name in ("accessibility_responsive_review", "hreflang_design_review", "route_fallback_smoke_test"):
        if fr_evidence.get("remaining_technical_checks", {}).get(name) != "pass":
            errors.append(f"French activation technical alias must pass: {name}")
    if fr_technical.get("all_three_technical_gates_evidenced") is not True or fr_technical.get("public_ready") is not True:
        errors.append("French technical evidence must be complete and public-ready")
    if fr_preflight.get("activation_allowed") is not True or fr_preflight.get("mode") != "activation_candidate":
        errors.append("French preflight must explicitly allow SAFE-8F activation candidate")
    if any(value is not False for value in fr_preflight.get("blocked_changes", {}).values()):
        errors.append("SAFE-8F public changes must be unblocked only for French activation candidate")

    for path in ("languages/fr/index.html", "languages/fr/institute.html"):
        text = read_text(path)
        if '<html lang="fr" dir="ltr">' not in text:
            errors.append(f"French public surface lang/dir invalid: {path}")
        if '<meta name="robots" content="index,follow">' not in text:
            errors.append(f"French public surface must be index,follow: {path}")
        if "Public pilot" not in text or "pilote public approuvé" not in text:
            errors.append(f"French public-pilot disclosure missing: {path}")
        if "Translation draft" in text or "Révision humaine requise" in text:
            errors.append(f"obsolete French draft disclosure remains: {path}")
        if "Editorial process, calls, policies, topic candidates and human review." in text:
            errors.append(f"known English residue remains: {path}")

    hub = read_text("languages/index.html")
    sitemap = read_text("sitemap.xml")
    leaked_hub = non_public_language_routes(hub, public_set, simple_aliases)
    leaked_sitemap = non_public_language_routes(sitemap, public_set, simple_aliases)
    if leaked_hub:
        errors.append(f"languages/index.html exposes non-public language routes: {', '.join(leaked_hub)}")
    if leaked_sitemap:
        errors.append(f"sitemap.xml exposes non-public language routes: {', '.join(leaked_sitemap)}")

    # Every activated non-canonical language must be explicitly discoverable in the Languages Hub.
    for code in public_list:
        if code in {master, mirror}:
            continue
        route = public_routes.get(code, {})
        for kind in ("home", "institute"):
            href = route.get(kind)
            if href and f'href="{href}"' not in hub:
                errors.append(f"Languages Hub missing activated {code} {kind} route: {href}")

    router = read_text("languages/wpa-public-language-router-v2.js")
    for marker in ("/data/language-activation.json", 'CANONICAL_UI_KEY = "wpa.language"', "validateRegistry"):
        if marker not in router:
            errors.append(f"registry-driven public router lost required marker: {marker}")

    if 'xmlns:xhtml="http://www.w3.org/1999/xhtml"' not in sitemap:
        errors.append("sitemap must enable xhtml hreflang alternates")
    for lang in public_list + ["x-default"]:
        if f'hreflang="{lang}"' not in sitemap:
            errors.append(f"sitemap missing activated Home hreflang: {lang}")

    expected_wave1_public = [code for code in rollout.get("wave1_existing_drafts", []) if code in public_set]
    if wave1_status.get("canonical_languages") != [master, mirror]:
        errors.append("Wave-1 status canonical languages must match activation registry")
    if wave1_status.get("public_pilot_languages") != expected_wave1_public:
        errors.append("Wave-1 status public pilots must match activated Wave-1 languages")

    resolved_codes = []
    for item in wave1_status.get("new_languages", []):
        raw_code = str(item.get("code", "")).strip()
        code = simple_aliases.get(raw_code, raw_code)
        if code:
            resolved_codes.append(code)
        status = str(item.get("status", "")).lower()
        if code in public_set:
            if "approved public pilot" not in status:
                errors.append(f"activated Wave-1 {code} status must say approved public pilot")
        elif "pending human review" not in status:
            errors.append(f"non-public Wave-1 {code} must remain pending human review")
    if resolved_codes != rollout.get("wave1_existing_drafts", []):
        errors.append("legacy Wave-1 status must resolve exactly to Final-50 Wave-1")

    if errors:
        return fail(errors)

    print("WPA Translator Quality Check passed.")
    print(f"Final-50 canon preserved; registry-backed public languages: {','.join(public_list)}; all unlisted languages remain fail-closed.")
    print("French SAFE-8D/SAFE-8F Human Gate and activation provenance remain locked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

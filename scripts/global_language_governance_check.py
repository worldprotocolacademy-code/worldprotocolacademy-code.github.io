#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def fail(message):
    raise SystemExit(f"SAFE-8V FAIL: {message}")


activation = load("data/language-activation.json")
canon = load("data/language-canon-50.json")
manifest = load("locales/manifest.json")
readiness = load("data/language-readiness-50.json")

canon_codes = canon.get("canonical_codes", [])
manifest_codes = [item.get("code") for item in manifest.get("supported_languages", [])]
public = activation.get("public_languages", [])
surfaces = activation.get("public_surface_routes", {})

if activation.get("policy_mode") != "fail_closed":
    fail("activation registry must remain fail_closed")
if activation.get("unlisted_languages_public") is not False:
    fail("unlisted languages must remain nonpublic")
if activation.get("human_gate_required") is not True:
    fail("Human Gate must remain mandatory")

if canon.get("canon_count") != 50 or len(canon_codes) != 50 or len(set(canon_codes)) != 50:
    fail("canonical language set must contain exactly 50 unique codes")
if len(manifest_codes) != 50 or len(set(manifest_codes)) != 50:
    fail("translator manifest must contain exactly 50 unique language codes")
if set(manifest_codes) != set(canon_codes):
    fail("translator manifest and final canon differ")

if public != ["mk", "en", "fr"]:
    fail(f"public language order/set changed unexpectedly: {public}")
if activation.get("canonical_master") != "mk":
    fail("canonical master must be mk")
if activation.get("canonical_mirror") != "en":
    fail("canonical mirror must be en")
if len(surfaces) != 57:
    fail(f"expected 57 registered public surfaces, found {len(surfaces)}")

for surface_id, routes in surfaces.items():
    if set(routes) != set(public):
        fail(f"surface {surface_id} must expose exactly mk/en/fr routes")
    for code, route in routes.items():
        if not isinstance(route, str) or not route.startswith("/"):
            fail(f"surface {surface_id}/{code} has invalid route")

public_now = readiness.get("public_now", {})
if list(public_now) != public:
    fail("readiness public_now must match activation public_languages")
if public_now["mk"].get("role") != "canonical_master":
    fail("MK readiness role mismatch")
if public_now["en"].get("role") != "canonical_mirror":
    fail("EN readiness role mismatch")
if public_now["fr"].get("role") != "approved_public_pilot":
    fail("FR readiness role mismatch")
if public_now["fr"].get("native_human_lector_verified") is not False:
    fail("FR must not overclaim native human lector verification")
if public_now["fr"].get("publication_grade_line_by_line_verified") is not False:
    fail("FR must not overclaim publication-grade line-by-line verification")

nonpublic = (
    readiness.get("nonpublic_existing_drafts", [])
    + readiness.get("nonpublic_planned_wave2", [])
    + readiness.get("nonpublic_planned_wave3", [])
    + readiness.get("nonpublic_planned_wave4", [])
)
if len(nonpublic) != 47 or len(set(nonpublic)) != 47:
    fail("readiness ledger must enumerate exactly 47 unique nonpublic languages")
if set(nonpublic) != set(canon_codes) - set(public):
    fail("readiness ledger nonpublic set does not equal canon minus public set")

phase1 = canon.get("rollout", {}).get("phase1_public", [])
if phase1 != ["mk", "en"]:
    fail("canon phase1_public must remain historical MK/EN phase-1 record")
if "fr" not in canon.get("rollout", {}).get("wave1_existing_drafts", []):
    fail("FR historical wave-1 provenance missing")

for code in nonpublic:
    if code in activation.get("public_routes", {}):
        fail(f"nonpublic language unexpectedly has top-level public route: {code}")
    for surface_id, routes in surfaces.items():
        if code in routes:
            fail(f"nonpublic language unexpectedly routable at {surface_id}: {code}")

contract = readiness.get("activation_contract", {})
required = set(contract.get("required_before_public", []))
required_invariants = {
    "static_route_equivalents_for_every_registered_public_surface",
    "correct_html_lang_and_direction",
    "language_specific_navigation_that_never_escapes_namespace",
    "no_silent_macedonian_or_english_content_fallback",
    "language_purity_gate",
    "semantic_and_institutional_review",
    "exact_head_ci_success",
    "explicit_human_authority_for_that_exact_head",
}
if required != required_invariants:
    fail("activation contract is incomplete or has drifted")
if contract.get("after_approval") != "no_commits_before_merge":
    fail("post-approval freeze contract missing")
if "independent_public_route_verification" not in contract.get("production_claim", ""):
    fail("production LIVE claim must require independent route verification")

print(
    "SAFE-8V global language governance OK: "
    "50 canon/manifest languages; 3 public (MK/EN/FR); "
    "47 fail-closed; 57 public surfaces with exact MK/EN/FR parity."
)

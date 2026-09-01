#!/usr/bin/env python3
"""Fail-closed architectural validator for WPA translation/runtime governance."""

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def load_json(path: str):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def fail(errors):
    print("WPA Translator Architecture Check failed.")
    for err in errors:
        print(f"- {err}")
    return 1


def main() -> int:
    errors = []
    registry_path = "data/translator-runtime-registry.json"
    activation_path = "data/language-activation.json"
    human_gate_path = "data/human-gates/en-safe8k.json"
    required = [registry_path, activation_path, human_gate_path, "docs/WPA_TRANSLATOR_ROOT_ARCHITECTURE_v1.md"]
    for path in required:
        if not (ROOT / path).exists():
            errors.append(f"missing required architecture file: {path}")
    if errors:
        return fail(errors)

    reg = load_json(registry_path)
    activation = load_json(activation_path)
    en_gate = load_json(human_gate_path)

    if reg.get("policy_mode") != "fail_closed":
        errors.append("translator runtime registry must remain fail_closed")
    if reg.get("canonical_ui_language_key") != "wpa.language":
        errors.append("canonical UI language key must be wpa.language")
    if reg.get("public_activation_source") != activation_path:
        errors.append("public activation authority must be data/language-activation.json")
    if reg.get("public_output_strategy") != "static_pretranslated_html":
        errors.append("public output strategy must be static_pretranslated_html")
    if reg.get("browser_runtime_role") != "routing_and_dynamic_ui_only":
        errors.append("browser runtime must be routing_and_dynamic_ui_only")

    engines = reg.get("engines", [])
    paths = [x.get("path") for x in engines if isinstance(x, dict)]
    if len(paths) != len(set(paths)):
        errors.append("translator runtime registry contains duplicate engine paths")

    for item in engines:
        path = item.get("path")
        if not path:
            errors.append("translator engine entry missing path")
            continue
        if not (ROOT / path).exists():
            errors.append(f"registered translator/runtime file does not exist: {path}")
        if item.get("public_activation_authority") is not False:
            errors.append(f"runtime file must not hold public activation authority: {path}")

    active_routers = [x for x in engines if x.get("classification") == "active_public_language_router"]
    if len(active_routers) != 1:
        errors.append(f"exactly one active public language router required; found {len(active_routers)}")
    elif active_routers[0].get("path") != "languages/wpa-public-language-router-v2.js":
        errors.append("registry public router must be languages/wpa-public-language-router-v2.js")

    translation_authorities = [x for x in engines if x.get("translation_authority") is True]
    if translation_authorities:
        errors.append("no browser engine may be public translation authority in static-public architecture")

    public_languages = activation.get("public_languages", [])
    public_routes = activation.get("public_routes", {})
    if set(public_languages) != set(public_routes.keys()):
        errors.append("public_languages and public_routes keys must match exactly")
    if public_routes.get("en", {}).get("institute") != "/en/institute.html":
        errors.append("English Institute must use the Human-Approved static mirror route /en/institute.html")

    gate_authority = en_gate.get("authority", {})
    gate_candidate = en_gate.get("approved_candidate", {})
    if en_gate.get("status") != "approved" or gate_authority.get("name") != "Sande Smiljanov":
        errors.append("SAFE-8K English Human Authority gate is missing or invalid")
    if gate_candidate.get("commit_sha") != "b77fd36fd6cc2786e00e0f4eca6fd29188d3b7d7":
        errors.append("SAFE-8K approved architecture candidate provenance changed")
    if gate_candidate.get("english_institute") != "/en/institute.html":
        errors.append("SAFE-8K Human Gate does not authorize /en/institute.html")

    # Every non-master public Home/Institute route must resolve to a static file
    # and must never use the old fetch-overlay reconstruction architecture.
    overlay_patterns = reg.get("forbidden_public_patterns", {}).get("translated_home_fetch_overlay", [])
    for code in public_languages:
        if code == activation.get("canonical_master"):
            continue
        routes = public_routes.get(code, {})
        for route_name in ("home", "institute"):
            route = routes.get(route_name)
            if not route:
                errors.append(f"public language {code} missing registered {route_name} route")
                continue
            candidate = route.lstrip("/")
            if candidate.endswith("/"):
                candidate += "index.html"
            target = ROOT / candidate
            if not target.exists():
                errors.append(f"registered public route source missing: {route}")
                continue
            text = target.read_text(encoding="utf-8")
            for pattern in overlay_patterns:
                if pattern in text:
                    errors.append(f"public translated surface uses forbidden fetch-overlay pattern: {route}")

    # Prevent new canonical UI state writes to legacy keys in explicitly active/migration-target files.
    legacy_keys = reg.get("forbidden_public_patterns", {}).get("legacy_ui_language_write_keys", [])
    inspect_paths = [
        "languages/wpa-language-menu-10-core.js",
        "languages/wpa-language-menu-10.js",
        "wpa-translator.js",
        "scripts/wpa-home-full-en.js",
    ]
    write_re = re.compile(r"(?:localStorage\.setItem|sessionStorage\.setItem)\s*\(\s*['\"]([^'\"]+)['\"]")
    for path in inspect_paths:
        target = ROOT / path
        if not target.exists():
            continue
        text = target.read_text(encoding="utf-8")
        for key in write_re.findall(text):
            if key in legacy_keys:
                errors.append(f"legacy UI language key write remains in migration-target file {path}: {key}")

    shared = read("wpa-translator.js")
    if "window.WPA_TRANSLATOR_LOADED=true" not in shared:
        errors.append("wpa-translator.js shared-runtime identity marker missing")
    if "function applyLanguage" in shared or "window.WPATranslator" in shared:
        errors.append("wpa-translator.js unexpectedly contains a second translation engine")

    legacy_core = read("languages/wpa-language-menu-10-core.js")
    for marker in ("PUBLIC_LANGS", "const LANGS", "function buildMenu", "function augmentSelects", "function placeMenu"):
        if marker in legacy_core:
            errors.append(f"legacy language core regained routing authority marker: {marker}")

    if errors:
        return fail(errors)

    print("WPA Translator Architecture Check passed.")
    print(f"Public languages: {','.join(public_languages)}")
    print("Public activation authority: data/language-activation.json")
    print("English Institute route: /en/institute.html (Human Authority approved)")
    print("Public translation strategy: static pretranslated HTML")
    print("Canonical UI language key: wpa.language")
    return 0


if __name__ == "__main__":
    sys.exit(main())

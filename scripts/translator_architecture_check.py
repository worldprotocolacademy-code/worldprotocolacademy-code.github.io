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
    required = [registry_path, activation_path, "docs/WPA_TRANSLATOR_ROOT_ARCHITECTURE_v1.md"]
    for path in required:
        if not (ROOT / path).exists():
            errors.append(f"missing required architecture file: {path}")
    if errors:
        return fail(errors)

    reg = load_json(registry_path)
    activation = load_json(activation_path)

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

    translation_authorities = [x for x in engines if x.get("translation_authority") is True]
    if translation_authorities:
        errors.append("no browser engine may be public translation authority in static-public architecture")

    public_languages = activation.get("public_languages", [])
    public_routes = activation.get("public_routes", {})
    if set(public_languages) != set(public_routes.keys()):
        errors.append("public_languages and public_routes keys must match exactly")

    # Public translated Home/Institute surfaces must never be fetch-overlay reconstructions.
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
            # Shared canonical Institute route may intentionally remain MK/EN bilingual during migration.
            if code == "en" and route_name == "institute" and route == "/institute.html":
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

    # wpa-translator.js must not be falsely promoted as the translation authority.
    shared = read("wpa-translator.js")
    if "window.WPA_TRANSLATOR_LOADED=true" not in shared:
        errors.append("wpa-translator.js shared-runtime identity marker missing")
    if "function applyLanguage" in shared or "window.WPATranslator" in shared:
        errors.append("wpa-translator.js unexpectedly contains a second translation engine")

    if errors:
        return fail(errors)

    print("WPA Translator Architecture Check passed.")
    print(f"Public languages: {','.join(public_languages)}")
    print("Public activation authority: data/language-activation.json")
    print("Public translation strategy: static pretranslated HTML")
    print("Canonical UI language key: wpa.language")
    return 0


if __name__ == "__main__":
    sys.exit(main())

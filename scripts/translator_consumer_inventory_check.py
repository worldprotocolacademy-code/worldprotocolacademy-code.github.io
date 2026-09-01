#!/usr/bin/env python3
"""Fail-closed runtime-consumer validator for WPA translator migration."""

from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
INVENTORY_PATH = ROOT / "data/translator-consumer-inventory.json"
SKIP_DIRS = {".git", "node_modules", ".venv", "venv"}


def strip_non_runtime_text(path: Path, text: str) -> str:
    suffix = path.suffix.lower()
    if suffix in {".html", ".htm"}:
        return re.sub(r"<!--.*?-->", "", text, flags=re.S)
    if suffix in {".js", ".mjs", ".cjs"}:
        # This intentionally removes comments only. String literals remain because
        # dynamic script loaders legitimately declare consumers as strings.
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        text = re.sub(r"(^|\s)//[^\n]*", r"\1", text)
    return text


def runtime_files(extensions: set[str]):
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in extensions:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path


def fail(errors: list[str]) -> int:
    print("WPA Translator Consumer Inventory Check failed.")
    for error in errors:
        print(f"- {error}")
    return 1


def main() -> int:
    if not INVENTORY_PATH.exists():
        return fail(["missing data/translator-consumer-inventory.json"])

    inventory = json.loads(INVENTORY_PATH.read_text(encoding="utf-8"))
    policy = inventory.get("scan_policy", {})
    extensions = {str(x).lower() for x in policy.get("runtime_extensions", [])}
    errors: list[str] = []

    if inventory.get("schema") != "wpa-translator-consumer-inventory/1.0":
        errors.append("unexpected consumer inventory schema")
    if policy.get("new_legacy_consumers_fail_ci") is not True:
        errors.append("consumer inventory must fail CI for new legacy consumers")
    if policy.get("zero_consumer_status_does_not_authorize_deletion") is not True:
        errors.append("zero-consumer evidence must not authorize deletion by itself")
    if not extensions:
        errors.append("runtime extension set is empty")

    authorities = inventory.get("active_authorities", {})
    if authorities.get("public_activation") != "data/language-activation.json":
        errors.append("consumer inventory public activation authority is invalid")
    if authorities.get("public_language_router") != "languages/wpa-public-language-router-v2.js":
        errors.append("consumer inventory must designate router v2 as public language router")
    if authorities.get("canonical_ui_language_key") != "wpa.language":
        errors.append("consumer inventory canonical UI key must be wpa.language")

    files = list(runtime_files(extensions)) if extensions else []
    seen_tokens: set[str] = set()
    for entry in inventory.get("entries", []):
        token = str(entry.get("token", "")).strip()
        if not token:
            errors.append("inventory entry missing token")
            continue
        if token in seen_tokens:
            errors.append(f"duplicate inventory token: {token}")
            continue
        seen_tokens.add(token)

        if entry.get("new_consumers_allowed") is not False:
            errors.append(f"legacy token must forbid new consumers: {token}")
        if entry.get("deletion_allowed") is not False:
            errors.append(f"inventory must not authorize deletion in SAFE-8K: {token}")

        own_path = Path(token).as_posix()
        actual: set[str] = set()
        for path in files:
            rel = path.relative_to(ROOT).as_posix()
            if rel == own_path:
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            if token in strip_non_runtime_text(path, text):
                actual.add(rel)

        declared = {str(x) for x in entry.get("allowed_runtime_consumers", [])}
        unexpected = sorted(actual - declared)
        missing = sorted(declared - actual)
        if unexpected:
            errors.append(f"new/unapproved runtime consumers for {token}: {', '.join(unexpected)}")
        if missing:
            errors.append(f"declared runtime consumers no longer present for {token}: {', '.join(missing)}")

    cleanup = inventory.get("cleanup_policy", {})
    if cleanup.get("mass_delete_allowed") is not False:
        errors.append("mass deletion must remain disabled")
    if cleanup.get("zero_consumer_evidence_required") is not True:
        errors.append("zero-consumer evidence must remain required")
    if cleanup.get("separate_reviewed_pull_request_required") is not True:
        errors.append("legacy cleanup must require a separate reviewed pull request")

    if errors:
        return fail(errors)

    print("WPA Translator Consumer Inventory Check passed.")
    print("No unapproved legacy runtime consumers detected; zero-consumer findings do not authorize deletion.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

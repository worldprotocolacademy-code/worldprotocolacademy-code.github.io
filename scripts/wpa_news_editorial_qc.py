#!/usr/bin/env python3
"""Fail-closed editorial preflight. Passing is not source verification or publication approval."""
import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

SUMMARY_MARKER = "Во достапниот краток опис се наведува:"
REPORT_SCHEMA = "wpa-news-editorial-qc/1.0"


def check(pack, today=None):
    today = today or datetime.now(ZoneInfo("Europe/Skopje")).date().isoformat()
    errors, warnings = [], []
    if pack.get("schema") != "wpa-news-daily-production-pack/1.0":
        errors.append("BAD_SCHEMA")
    if pack.get("product_date") != today:
        errors.append("WRONG_LOCAL_DATE")
    if (pack.get("boundaries") or {}).get("automatic_external_publication") is not False:
        errors.append("AUTOPUBLICATION_BOUNDARY")
    if (pack.get("boundaries") or {}).get("human_gate_required") is not True:
        errors.append("MISSING_HUMAN_GATE")
    lines = pack.get("script_lines") or []
    if not isinstance(lines, list) or not lines:
        errors.append("NO_SCRIPT")
        lines = []
    sources, domains = set(), set()
    for i, line in enumerate(lines, 1):
        if not isinstance(line, dict):
            errors.append(f"LINE_{i}_INVALID")
            continue
        speaker = line.get("speaker")
        if speaker not in ("Дипломат", "Дипломатка"):
            errors.append(f"LINE_{i}_PRESENTER_UNKNOWN")
        text = str(line.get("text") or "").strip()
        if not text:
            errors.append(f"LINE_{i}_EMPTY")
        if line.get("kind") != "source_report":
            continue
        url = str(line.get("source_url") or "")
        parsed = urlparse(url)
        if parsed.scheme != "https" or not parsed.hostname:
            errors.append(f"LINE_{i}_SOURCE_URL")
        else:
            sources.add(url)
        domain = str(line.get("domain") or "").strip()
        if domain:
            domains.add(domain)
        else:
            errors.append(f"LINE_{i}_MISSING_DOMAIN")
        if not line.get("source"):
            errors.append(f"LINE_{i}_SOURCE_UNNAMED")
        if "…" in text or "..." in text:
            errors.append(f"LINE_{i}_TRUNCATED_SOURCE")
        if SUMMARY_MARKER in text:
            raw = text.split(SUMMARY_MARKER, 1)[-1]
            latin = re.findall(r"[A-Za-z]{3,}", raw)
            macedonian = re.findall(r"[А-Ша-шЃѓЌќЅѕЉљЊњЏџ]{3,}", raw)
            if len(latin) >= 4 and len(latin) > len(macedonian):
                errors.append(f"LINE_{i}_UNTRANSLATED_ENGLISH")
    if len(sources) < 3:
        errors.append("INSUFFICIENT_SOURCE_URLS")
    if len(domains) < 2:
        errors.append("INSUFFICIENT_WPA_DOMAINS")
    runtime = float(pack.get("runtime_estimate_minutes") or 0)
    if runtime <= 0 or runtime > 15:
        errors.append("IMPLAUSIBLE_RUNTIME")
    if 0 < runtime < 8:
        warnings.append(f"SHORT_EDITION_{runtime:g}_MINUTES")  # Allowed; never pad news.
    if not (pack.get("canonical_input") or {}).get("original_sources_authoritative"):
        errors.append("SOURCE_PROVENANCE_BOUNDARY")
    return {"schema": REPORT_SCHEMA, "product_date": pack.get("product_date"),
            "target_date": today, "status": "BLOCKED" if errors else "AUTOMATED_PREFLIGHT_PASSED",
            "sources": len(sources), "domains": len(domains),
            "errors": errors, "warnings": warnings,
            "disclaimer": "Passing does not verify original claims, rights, translation or permit external publication."}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--pack", required=True)
    p.add_argument("--report", required=True)
    p.add_argument("--today", default=None, help="Test-only YYYY-MM-DD override")
    a = p.parse_args()
    pack = json.loads(Path(a.pack).read_text(encoding="utf-8"))
    report = check(pack, today=a.today)
    path = Path(a.report)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("WPA NEWS editorial quality:", report["status"])
    for warning in report["warnings"]:
        print("::warning title=WPA NEWS quality::" + warning)
    for error in report["errors"]:
        print("::error title=WPA NEWS publication blocked::" + error)
    if report["status"] == "BLOCKED":
        print("Generated scripts are kept as a draft artifact. No PR/public release is allowed.")
        return 1
    print("Automated preflight passed; Human Gate for public release remains required.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

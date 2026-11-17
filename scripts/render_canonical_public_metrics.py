#!/usr/bin/env python3
"""WPA canonical publication metrics — deterministic BUILD-TIME renderer.

Single source of truth is data/wpa-canonical-metrics-status.json, cross-checked against
data/wpa-canonical-public-facts.json. No browser patches or external network calls.
Use --write to render annotated HTML/locale values, --check to enforce committed output.
Change the canonical sources only with actual evidence; do not silently force old figures.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_TARGETS = (
    "index.html",
    "en/index.html",
    "papers.html",
    "bibliography/index.html",
    "institute.html",
    "wpa-services.html",
)
LOCALE_TARGETS = ("index/mk.json", "index/en.json", "mk.json", "en.json")
MARKED = re.compile(
    r'(?P<open><(?P<tag>div|span|strong|b)\\b[^>]*?\\sdata-wpa-metric="(?P<key>[^"]+)"[^>]*>)'
    r'(?P<value>[^<]*)'
    r'(?P<close></(?P=tag)>)',
    re.MULTILINE
)
errors: list[str] = []
change_count = 0


def fail(message: str) -> None:
    errors.append(message)


def read(path: str) -> str:
    file = ROOT / path
    if not file.is_file():
        fail("missing required asset: " + path)
        return ""
    return file.read_text(encoding="utf-8")


def load(path: str) -> dict:
    try:
        return json.loads(read(path))
    except (TypeError, ValueError) as exc:
        fail(f"{path}: JSON parse failed: {exc}")
        return {}


def write_or_check(path: str, original: str, desired: str, write: bool) -> None:
    global change_count
    if original == desired:
        return
    change_count += 1
    if write:
        (ROOT / path).write_text(desired, encoding="utf-8")
    else:
        fail(f"{path}: stale built metric content; run python scripts/render_canonical_public_metrics.py --write and commit the result")


def build_values(metrics: dict, facts: dict) -> tuple[dict[str, str], dict[str, dict[str, str]]]:
    academic = metrics.get("academic_publications") or {}
    zenodo = metrics.get("zenodo_doi_corpus") or {}
    a = facts.get("academic_corpus") or {}
    z = facts.get("zenodo_corpus") or {}
    keys = {
        "academic.total": (academic.get("total"), a.get("total_publications")),
        "academic.monographs": (academic.get("monographs_and_handbooks"), a.get("monographs_and_manuals")),
        "academic.dissertations": (academic.get("doctoral_dissertations"), a.get("dissertation")),
        "academic.papers": (academic.get("scientific_papers_and_contributions"), a.get("papers_and_contributions")),
        "zenodo.total": (zenodo.get("total_records"), z.get("total_records")),
        "zenodo.working_papers": (zenodo.get("working_papers"), z.get("working_papers")),
        "zenodo.protocol_notes": (zenodo.get("protocol_notes"), z.get("protocol_notes")),
        "zenodo.global_strategic_plans": (zenodo.get("global_strategic_plans"), z.get("global_strategic_plans")),
    }
    for key, (x, y) in keys.items():
        if type(x) is not int or type(y) is not int or x < 0 or x != y:
            fail(f"Mismatch between canonical JSON sources for {key}: {x!r} vs {y!r}")
    m = {k: str(v[0]) for k, v in keys.items() if isinstance(v[0], int)}
    if len(m) != 8:
        return m, {}
    p, mono, diss, paper = (m[k] for k in ("academic.total", "academic.monographs", "academic.dissertations", "academic.papers"))
    total, wp, pn, plan = (m[k] for k in ("zenodo.total", "zenodo.working_papers", "zenodo.protocol_notes", "zenodo.global_strategic_plans"))
    if int(mono) + int(diss) + int(paper) != int(p):
        fail("Academic count violates sum of publication categories")
    if int(wp) + int(pn) + int(plan) != int(total):
        fail("Zenodo count violates category sum")
    m.update({
        "academic.summary.en": f"{p} publications = {mono} monographs/manuals + {diss} doctoral dissertation + {paper} papers/contributions",
        "zenodo.summary.en": f"◆ {total} WPA Zenodo Records · {wp} Working Papers + {pn} Protocol Notes + {plan} Global Strategic Plan",
    })
    mk = {
      "a_top.12": f"{mono} монографии и прирачници · {diss} дисертација · {paper} трудови и прилози · {p} вкупно",
      "a_platform.19": f"{mono} монографии и прирачници, {diss} докторска дисертација и {paper} научни трудови и прилози ({p} вкупно). Интелектуалното јадро и академскиот авторитет на World Protocol Academy.",
    }
    en = {
      "a_top.12": f"{mono} monographs · {diss} dissertation · {paper} papers · {p} total",
      "a_platform.19": f"{mono} monographs and handbooks, {diss} doctoral dissertation and {paper} scientific papers and contributions ({p} in total). The intellectual core and academic authority of World Protocol Academy.",
    }
    return m, {"mk": mk, "en": en}


def main() -> int:
    parser = argparse.ArgumentParser()
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--write", action="store_true", help="Build annotated static HTML and locale values")
    action.add_argument("--check", action="store_true", help="Reject stale generated values")
    opts = parser.parse_args()
    metrics = load("data/wpa-canonical-metrics-status.json")
    facts = load("data/wpa-canonical-public-facts.json")
    values, locale_values = build_values(metrics, facts)
    count = 0
    for path in HTML_TARGETS:
        source = read(path)
        if not source:
            continue

        def render(match: re.Match[str]) -> str:
            nonlocal count
            key = match.group("key")
            if key not in values:
                fail(f"{path}: unknown build-time metric key {key}")
                return match.group(0)
            count += 1
            return match.group("open") + html.escape(values[key], quote=False) + match.group("close")

        rendered = MARKED.sub(render, source)
        write_or_check(path, source, rendered, opts.write)

    if count < 11:
        fail(f"Expected at least 11 build-time metric markers, found {count}")

    for path in LOCALE_TARGETS:
        source = read(path)
        if not source:
            continue
        code = "mk" if path.endswith("mk.json") else "en"
        expected = locale_values.get(code) or {}
        target = source
        for key, value in expected.items():
            pattern = re.compile(r'("' + re.escape(key) + r'"\\s*:\\s*)("(?:\\\\.|[^"\\\\])*")')
            match = pattern.search(target)
            if not match:
                fail(f"{path}: missing canonical locale key {key}")
                continue
            target = target[:match.start(2)] + json.dumps(value, ensure_ascii=False) + target[match.end(2):]
        write_or_check(path, source, target, opts.write)

    # The existing homepage and bibliography must never acquire legacy current totals.
    pages = {p:read(p) for p in ("index.html", "bibliography/index.html", "papers.html")}
    if '<strong>25</strong><span>Total publications' in pages["papers.html"]:
        fail("papers.html still displays legacy 25 academic publications")
    if "<strong>12</strong><span>WPA Working Papers" in pages["papers.html"]:
        fail("papers.html still displays legacy 12 WP records")
    if "<strong>2</strong><span>WPA Protocol Notes" in pages["papers.html"]:
        fail("papers.html still displays legacy 2 PN records")

    core = read("scripts/wpa-performance-core.js")
    if "addScript('wpa-home-metrics-sync-20260817'" in core:
        fail("Legacy homepage 26/19 DOM metrics sync is still loaded")
    recon = read("scripts/wpa-final-reconciliation-20260826.js")
    if "previousElementSibling.textContent='26'" in recon:
        fail("Legacy reconciliation still overwrites current total with 26")
    public = read("scripts/wpa-publications-sync-20260817.js")
    if any(t in public for t in ("'26 Academic Publications'", "setText(num, '26')", "setText(strong, '26')")):
        fail("Legacy publication runtime still overwrites headline total with 26")
    lang = read("languages/wpa-language-menu-10.js")
    if '["25 публикации", "26 публикации"]' in lang:
        fail("Language router still rewrites 25 to stale 26")

    if errors:
        print("WPA Canonical Metrics Build: FAIL")
        for i, message in enumerate(errors, 1):
            print(f"{i}. {message}")
        return 1
    print(f"WPA Canonical Metrics Build: PASS; {count} marked HTML fields; {len(LOCALE_TARGETS)} MK/EN locale sources; {change_count} file updates; action={'write' if opts.write else 'check'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

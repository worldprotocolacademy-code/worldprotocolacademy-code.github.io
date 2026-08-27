#!/usr/bin/env python3
"""WPA public-site quality and canonical-drift check."""
from __future__ import annotations
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlparse
ROOT=Path(__file__).resolve().parents[1];BASE_URL="https://worldprotocolacademy.mk"
ALLOWED_SITEMAP_PATHS={"/","/institute.html","/aab-governance.html","/institute-ethics-integrity.html","/bibliography/","/working-papers/","/journal/","/journal/editorial-governance-status.html","/journal/vol-1-issue-1-2026.html","/papers.html","/scholar/wpa-wp-009.html","/programmes.html","/certification.html","/professional-english.html","/institutional-diplomatic-track.html","/protocol-professional-track.html","/communication-presence-track.html","/wpa-card.html","/forms/","/partnerships/","/student-desk/","/institutional-enquiry.html","/strategy/master-strategy-2026-2030.html","/wpa-institutional-maturity-roadmap.html","/languages/","/wpa-research-framework.html","/wpa-global-institutions-master-list.html","/master-list-verification.html","/wpa-index-appeals-and-corrections.html","/wpa-institute-index-lab.html","/wpa-global-institutional-evidence-programme.html","/wpa-global-protocol-diplomacy-benchmark.html","/wpa-global-ranking-roadmap.html","/virtual-sande-ai.html","/protocolometry-center.html","/wpa-trust-layer.html","/wpa-scenario-film-lab.html","/wpa-metrics-status.html","/wpa-protocol-stress-test.html","/wpa-protocol-knowledge-check.html","/wpa-state-visit-readiness-checklist.html","/wpa-briefings.html","/wpa-services.html","/wpa-one-page-service-profile.html","/audio-media-engine.html","/diplomatic-analysis-lab/","/opc2026/","/book1-protocol.html","/book2-conference.html","/book3-diplomacy.html","/book4-digital-era.html","/privacy.html","/rights-takedown.html","/public-disclaimer.html","/correction-request.html","/security.html"}
FORBIDDEN_IN_SITEMAP=("/ai/student-desk.html","/wpaws/","/test-modals.html","/thanks.html","/analytics-guide.html","/monetization-checklist.html","/promotion-playbook.html","/forms/thanks.html")
PUBLIC_SEARCH_USER_AGENTS={"*","googlebot","bingbot","duckduckbot","applebot","slurp","yandexbot","baiduspider"}
def read_text(p):return p.read_text(encoding="utf-8",errors="replace")
def add_error(e,m):e.append(m)
def url_to_path(u):return unquote(urlparse(u).path or "/")
def local_target_exists(path):
    if path=="/":return (ROOT/"index.html").exists()
    c=ROOT/path.lstrip("/")
    return (c/"index.html").exists() if path.endswith("/") else c.exists()
def check_sitemap(errors):
    s=ROOT/"sitemap.xml"
    if not s.exists():add_error(errors,"Missing sitemap.xml");return
    try:t=ET.parse(s)
    except ET.ParseError as exc:add_error(errors,f"sitemap.xml is not valid XML: {exc}");return
    ns={"sm":"http://www.sitemaps.org/schemas/sitemap/0.9"};locs=[n.text.strip() for n in t.findall(".//sm:loc",ns) if n.text and n.text.strip()]
    if not locs:add_error(errors,"sitemap.xml has no <loc> entries");return
    seen=set()
    for loc in locs:
        if loc in seen:add_error(errors,f"Duplicate sitemap URL: {loc}")
        seen.add(loc)
        if not loc.startswith(BASE_URL):add_error(errors,f"Sitemap URL is outside expected domain: {loc}");continue
        path=url_to_path(loc)
        if path not in ALLOWED_SITEMAP_PATHS:add_error(errors,f"Sitemap contains non-public or non-allowlisted path: {path}")
        if any(x in path for x in FORBIDDEN_IN_SITEMAP):add_error(errors,f"Sitemap contains forbidden internal/private path: {path}")
        if not local_target_exists(path):add_error(errors,f"Sitemap URL does not map to an existing local file/index: {loc}")
def parse_robots_groups(text):
    groups=[];current=None
    for raw in text.splitlines():
        line=raw.split("#",1)[0].strip()
        if not line or ":" not in line:continue
        key,value=[x.strip() for x in line.split(":",1)];key=key.lower()
        if key=="user-agent":
            if current is None or current.get("rules"):current={"agents":[],"rules":[]};groups.append(current)
            current["agents"].append(value.lower())
        elif key in {"allow","disallow"}:
            if current is None:current={"agents":["*"],"rules":[]};groups.append(current)
            current["rules"].append(f"{key}:{value}")
    return groups
def check_robots(errors):
    r=ROOT/"robots.txt"
    if not r.exists():add_error(errors,"Missing robots.txt");return
    text=read_text(r);expected="Sitemap: https://worldprotocolacademy.mk/sitemap.xml"
    if expected not in text:add_error(errors,"robots.txt does not point to the canonical sitemap.xml")
    for g in parse_robots_groups(text):
        agents=set(g.get("agents",[]));rules={x.lower().replace(" ","") for x in g.get("rules",[])}
        if "disallow:/" in rules and ("*" in agents or agents&(PUBLIC_SEARCH_USER_AGENTS-{"*"})):add_error(errors,"robots.txt blocks a public search crawler with Disallow: /")
def check_privacy_hotfixes(errors):
    h=ROOT/"index.html"
    if h.exists() and ("ai/student-desk.html" in read_text(h).lower() or "student-desk.html" in read_text(h).lower()):add_error(errors,"index.html still contains a public Student Desk link")
    s=ROOT/"ai"/"student-desk.html"
    if s.exists() and "noindex" not in read_text(s).lower():add_error(errors,"ai/student-desk.html exists but does not contain noindex")
    w=ROOT/"wpaws"/"index.html"
    if w.exists():
        tx=read_text(w).lower()
        if "noindex" not in tx:add_error(errors,"wpaws/index.html exists but does not contain noindex")
        if "data-nosnippet" not in tx:add_error(errors,"wpaws/index.html does not contain data-nosnippet")
def check_basic_public_html(errors):
    for path in sorted(ALLOWED_SITEMAP_PATHS):
        f=ROOT/"index.html" if path=="/" else (ROOT/path.lstrip("/")/"index.html" if path.endswith("/") else ROOT/path.lstrip("/"))
        if not f.exists():add_error(errors,f"Public sitemap page is missing locally: {path}");continue
        text=read_text(f).lower()
        if "<title" not in text:add_error(errors,f"{path}: missing <title>")
        if 'name="viewport"' not in text and "name='viewport'" not in text:add_error(errors,f"{path}: missing viewport meta tag")
        if 'name="description"' not in text and "name='description'" not in text:add_error(errors,f"{path}: missing meta description")
        if 'rel="canonical"' not in text and "rel='canonical'" not in text:add_error(errors,f"{path}: missing canonical link")
def check_governance_invariants(errors):
    metrics=ROOT/"data"/"wpa-canonical-metrics-status.json"
    if metrics.exists():
        text=read_text(metrics)
        for token in ['"total_records": 23','"working_papers": 13','"protocol_notes": 9','"global_strategic_plans": 1']:
            if token not in text:add_error(errors,f"Canonical metrics missing publication invariant: {token}")
        if '"status": "FORMATION_PHASE"' not in text:add_error(errors,"Canonical metrics missing AAB formation boundary")
    else:add_error(errors,"Missing canonical metrics JSON")
    corr=ROOT/"forms"/"wpa-index-correction-request-form.md"
    if corr.exists():
        text=read_text(corr)
        if "A–D, G–I, R" not in text:add_error(errors,"Index correction form missing current REV2 taxonomy")
        if "AAB decision is final" in text:add_error(errors,"Index correction form prematurely claims a final AAB decision")
    dash=ROOT/"wpa-metrics-status.html"
    if dash.exists():
        text=read_text(dash)
        if 'data-canonical-metrics="true"' not in text:add_error(errors,"Public metrics dashboard is not marked canonical-driven")
        if "/data/wpa-canonical-metrics-status.json" not in text:add_error(errors,"Public metrics dashboard does not load canonical metrics JSON")
        for stale in ("15 записи = 12 WPA Working Papers + 3 WPA Protocol Notes","12 WPA Working Papers + 3 WPA Protocol Notes"):
            if stale in text:add_error(errors,f"Public metrics dashboard contains stale publication claim: {stale}")
        if "/aab-governance.html" not in text:add_error(errors,"Public metrics dashboard does not link dedicated AAB governance")
    else:add_error(errors,"Missing public metrics dashboard")
    profile=ROOT/"wpa-one-page-service-profile.html"
    if profile.exists():
        text=read_text(profile)
        if 'data-canonical-metrics="true"' not in text:add_error(errors,"One-page service profile is not marked canonical-driven")
        if "/data/wpa-canonical-metrics-status.json" not in text:add_error(errors,"One-page service profile does not load canonical metrics JSON")
        for stale in ("25 Academic Publications","9 WPA Working Papers"):
            if stale in text:add_error(errors,f"One-page service profile contains stale publication claim: {stale}")
    else:add_error(errors,"Missing one-page service profile")
def check_final_reconciliation_layer(errors):
    core=ROOT/"scripts"/"wpa-performance-core.js";layer=ROOT/"scripts"/"wpa-final-reconciliation-20260826.js";note=ROOT/"docs"/"WPA_CANONICAL_REFERENCE_STATE_2026-08-26.md"
    if not core.exists() or "/scripts/wpa-final-reconciliation-20260826.js" not in read_text(core):add_error(errors,"Performance core does not load final reconciliation layer")
    if not layer.exists():add_error(errors,"Missing final public reconciliation layer");return
    tx=read_text(layer)
    for token in ("Doc. Dr Sande Smiljanov","WP-001–WP-013","Video AI Workflow","Research AI Workflow","To be confirmed","10.5281/zenodo.20641840","data-wpa-wp013-category"):
        if token not in tx:add_error(errors,f"Final reconciliation layer missing invariant: {token}")
    if not note.exists():add_error(errors,"Missing canonical reference-state note")
def main():
    errors=[];check_sitemap(errors);check_robots(errors);check_privacy_hotfixes(errors);check_basic_public_html(errors);check_governance_invariants(errors);check_final_reconciliation_layer(errors)
    if errors:
        print("\nWPA Site Quality CI failed:\n");[print(f"{i}. {e}") for i,e in enumerate(errors,1)];return 1
    print("WPA Site Quality CI passed.");return 0
if __name__=="__main__":raise SystemExit(main())
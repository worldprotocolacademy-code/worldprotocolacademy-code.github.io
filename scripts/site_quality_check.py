#!/usr/bin/env python3
"""WPA public-site quality and canonical-drift check."""
from __future__ import annotations
import json
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlparse
ROOT=Path(__file__).resolve().parents[1];BASE_URL="https://worldprotocolacademy.mk"
BASE_ALLOWED_SITEMAP_PATHS={"/","/institute.html","/aab-governance.html","/institute-ethics-integrity.html","/bibliography/","/working-papers/","/journal/","/journal/editorial-governance-status.html","/journal/vol-1-issue-1-2026.html","/papers.html","/scholar/wpa-wp-009.html","/programmes.html","/certification.html","/professional-english.html","/institutional-diplomatic-track.html","/protocol-professional-track.html","/communication-presence-track.html","/wpa-card.html","/forms/","/partnerships/","/institutional-enquiry.html","/strategy/master-strategy-2026-2030.html","/wpa-institutional-maturity-roadmap.html","/languages/","/wpa-research-framework.html","/wpa-global-institutions-master-list.html","/master-list-verification.html","/wpa-index-appeals-and-corrections.html","/wpa-institute-index-lab.html","/wpa-global-institutional-evidence-programme.html","/wpa-institute-measurement-ranking-strategy.html","/wpa-protocolometric-signature.html","/wpa-global-protocol-diplomacy-benchmark.html","/wpa-global-ranking-roadmap.html","/virtual-sande-ai.html","/protocolometry-center.html","/wpa-trust-layer.html","/wpa-scenario-film-lab.html","/wpa-metrics-status.html","/wpa-protocol-stress-test.html","/wpa-protocol-knowledge-check.html","/wpa-state-visit-readiness-checklist.html","/wpa-briefings.html","/wpa-services.html","/wpa-one-page-service-profile.html","/audio-media-engine.html","/diplomatic-analysis-lab/","/opc2027/","/book1-protocol.html","/book2-conference.html","/book3-diplomacy.html","/book4-digital-era.html","/privacy.html","/rights-takedown.html","/public-disclaimer.html","/correction-request.html","/security.html"}
FORBIDDEN_IN_SITEMAP=("/ai/student-desk.html","/student-desk/","/wpaws/","/test-modals.html","/thanks.html","/analytics-guide.html","/monetization-checklist.html","/promotion-playbook.html","/forms/thanks.html")
PUBLIC_SEARCH_USER_AGENTS={"*","googlebot","bingbot","duckduckbot","applebot","slurp","yandexbot","baiduspider"}
def read_text(p):return p.read_text(encoding="utf-8",errors="replace")
def add_error(e,m):e.append(m)
def url_to_path(u):return unquote(urlparse(u).path or "/")
def local_target_exists(path):
    if path=="/":return (ROOT/"index.html").exists()
    c=ROOT/path.lstrip("/")
    return (c/"index.html").exists() if path.endswith("/") else c.exists()
def activation_public_paths(errors):
    p=ROOT/"data"/"language-activation.json"
    if not p.exists():add_error(errors,"Missing language activation registry");return set()
    try:data=json.loads(read_text(p))
    except (json.JSONDecodeError,OSError) as exc:add_error(errors,f"Invalid language activation registry: {exc}");return set()
    if data.get("policy_mode")!="fail_closed":add_error(errors,"Language activation registry is not fail_closed")
    if data.get("unlisted_languages_public") is not False:add_error(errors,"Language activation registry must keep unlisted languages non-public")
    public=[str(x).strip() for x in data.get("public_languages",[]) if str(x).strip()]
    routes=data.get("public_routes",{})
    out=set()
    for code in public:
        route=routes.get(code)
        if not isinstance(route,dict):add_error(errors,f"Public language {code} has no public_routes entry");continue
        for key in ("home","institute"):
            value=route.get(key)
            if value:
                path=url_to_path(str(value))
                if not path.startswith("/"):add_error(errors,f"Public language {code} has invalid {key} route: {value}")
                else:out.add(path)
    unlisted=set(routes)-set(public)
    if unlisted:add_error(errors,f"Activation registry contains public_routes for unlisted languages: {', '.join(sorted(unlisted))}")
    return out
def scholar_public_paths():
    d=ROOT/"scholar"
    out=set()
    if (d/"index.html").exists(): out.add("/scholar/")
    if d.exists():
        for p in d.glob("*.html"):
            if p.name!="index.html": out.add("/scholar/"+p.name)
    return out
def allowed_sitemap_paths(errors):return BASE_ALLOWED_SITEMAP_PATHS|activation_public_paths(errors)|scholar_public_paths()
def check_sitemap(errors,allowed):
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
        if path not in allowed:add_error(errors,f"Sitemap contains non-public or non-allowlisted path: {path}")
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
    sd=ROOT/"student-desk"/"index.html"
    if sd.exists() and "noindex" not in read_text(sd).lower():add_error(errors,"student-desk/index.html exists but does not contain noindex")
    w=ROOT/"wpaws"/"index.html"
    if w.exists():
        tx=read_text(w).lower()
        if "noindex" not in tx:add_error(errors,"wpaws/index.html exists but does not contain noindex")
        if "data-nosnippet" not in tx:add_error(errors,"wpaws/index.html does not contain data-nosnippet")
def check_basic_public_html(errors,allowed):
    for path in sorted(allowed):
        if path.startswith("/scholar/"):
            continue
        f=ROOT/"index.html" if path=="/" else (ROOT/path.lstrip("/")/"index.html" if path.endswith("/") else ROOT/path.lstrip("/"))
        if not f.exists():add_error(errors,f"Public sitemap page is missing locally: {path}");continue
        text=read_text(f).lower()
        if "<title" not in text:add_error(errors,f"{path}: missing <title>")
        if 'name="viewport"' not in text and "name='viewport'" not in text:add_error(errors,f"{path}: missing viewport meta tag")
        if 'name="description"' not in text and "name='description'" not in text:add_error(errors,f"{path}: missing meta description")
        if 'rel="canonical"' not in text and "rel='canonical'" not in text:add_error(errors,f"{path}: missing canonical link")

def check_publication_route_contract(errors):
    """Prevent publication-route drift, broken legacy aliases and canonical duplication."""
    sitemap = read_text(ROOT/"sitemap.xml") if (ROOT/"sitemap.xml").exists() else ""
    pn_index = read_text(ROOT/"protocol-notes"/"index.html") if (ROOT/"protocol-notes"/"index.html").exists() else ""
    bibliography = read_text(ROOT/"bibliography"/"index.html") if (ROOT/"bibliography"/"index.html").exists() else ""
    sync = read_text(ROOT/"scripts"/"wpa-publications-sync-20260817.js") if (ROOT/"scripts"/"wpa-publications-sync-20260817.js").exists() else ""
    for i in range(1,10):
        n=f"{i:03d}"
        canonical=f"https://worldprotocolacademy.mk/scholar/wpa-pn-{n}.html"
        scholar=ROOT/"scholar"/f"wpa-pn-{n}.html"
        legacy=ROOT/"protocol-notes"/f"wpa-pn-{n}.html"
        if not scholar.exists():
            add_error(errors,f"Missing canonical Scholar Protocol Note: {scholar.relative_to(ROOT)}")
        else:
            tx=read_text(scholar).lower()
            if f'rel="canonical" href="{canonical}"'.lower() not in tx:
                add_error(errors,f"Scholar Protocol Note {n} does not self-canonicalize")
            if "noindex" in tx:
                add_error(errors,f"Scholar Protocol Note {n} must remain indexable")
        if not legacy.exists():
            add_error(errors,f"Missing legacy compatibility route: {legacy.relative_to(ROOT)}")
        else:
            tx=read_text(legacy).lower()
            if canonical.lower() not in tx:
                add_error(errors,f"Legacy Protocol Note {n} does not point to canonical Scholar record")
            if "noindex" not in tx or "follow" not in tx:
                add_error(errors,f"Legacy Protocol Note {n} must be noindex,follow")
        if canonical not in sitemap:
            add_error(errors,f"Canonical Protocol Note {n} missing from sitemap.xml")
        legacy_url=f"https://worldprotocolacademy.mk/protocol-notes/wpa-pn-{n}.html"
        if legacy_url in sitemap:
            add_error(errors,f"Legacy Protocol Note {n} must not appear in sitemap.xml")
        if f'href="wpa-pn-{n}.html"' in pn_index:
            add_error(errors,f"Protocol Notes index still links legacy route for PN-{n}")
        if f'/protocol-notes/wpa-pn-{n}.html' in bibliography:
            add_error(errors,f"Bibliography still links legacy route for PN-{n}")
    if "recordUrl: '/protocol-notes/wpa-pn-" in sync:
        add_error(errors,"Publication sync still emits a legacy Protocol Note recordUrl")


def check_scholar_metadata_integrity(errors):
    """Fail closed on broken Scholar PDF metadata and non-production manifest canonicals."""
    scholar=ROOT/"scholar"
    for page in scholar.glob("*.html") if scholar.exists() else []:
        tx=read_text(page)
        if "upload the PDF copy into this same /scholar/ folder" in tx:
            add_error(errors,f"{page.relative_to(ROOT)} still contains a Scholar PDF placeholder")
        marker='name="citation_pdf_url" content="'
        pos=tx.find(marker)
        if pos>=0:
            start=pos+len(marker); end=tx.find('"',start)
            if end>start:
                url=tx[start:end]
                if url.startswith(BASE_URL):
                    path=url_to_path(url)
                    if not local_target_exists(path):
                        add_error(errors,f"{page.relative_to(ROOT)} declares missing citation_pdf_url target: {path}")
    manifest=ROOT/"wpa-scholar-records-2026.json"
    if manifest.exists():
        try: records=json.loads(read_text(manifest))
        except (json.JSONDecodeError,OSError) as exc:
            add_error(errors,f"Invalid Scholar manifest: {exc}"); records=[]
        for rec in records:
            rid=str(rec.get("id","?"))
            canonical=str(rec.get("canonical_url",""))
            if canonical and not canonical.startswith(BASE_URL+"/"):
                add_error(errors,f"Scholar manifest {rid} uses non-production canonical URL: {canonical}")
            pdf=rec.get("pdf_same_directory_name")
            if pdf and not (scholar/str(pdf)).exists():
                add_error(errors,f"Scholar manifest {rid} references missing same-directory PDF: {pdf}")

def check_governance_invariants(errors):
    metrics=ROOT/"data"/"wpa-canonical-metrics-status.json"
    if metrics.exists():
        text=read_text(metrics)
        for token in ['"total_records": 26','"working_papers": 16','"protocol_notes": 9','"global_strategic_plans": 1']:
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
def check_latest_publication_20261118(errors):
    """Guard the 18 Nov 2026 publication update and prevent active runtime count rollback."""
    status=ROOT/"data"/"wpa-canonical-metrics-status.json"
    bibliography=ROOT/"bibliography"/"index.html"
    scholar=ROOT/"scholar"/"p21.html"
    records=ROOT/"wpa-scholar-records-2026.json"
    if not status.exists():
        add_error(errors,"Missing canonical metrics JSON for latest publication update")
    else:
        try:
            d=json.loads(read_text(status))
            a=d.get("academic_publications") or {}
            if a.get("total") != 28 or a.get("scientific_papers_and_contributions") != 21:
                add_error(errors,"Canonical academic metrics must be 28 total / 21 papers after P21")
            latest=a.get("latest_addition") or {}
            if latest.get("scholar_record") != "/scholar/p21.html":
                add_error(errors,"Canonical metrics latest_addition does not point to Scholar P21")
        except Exception as exc:
            add_error(errors,f"Cannot validate canonical metrics JSON: {exc}")
    if not bibliography.exists() or 'id="pub-28"' not in read_text(bibliography):
        add_error(errors,"Official bibliography is missing pub-28")
    if not scholar.exists():
        add_error(errors,"Scholar P21 record is missing")
    else:
        st=read_text(scholar)
        official="Институционалниот протокол и дипломатската симболика: од СФРЈ до постмодерната македонска дипломатска практика"
        if f'name="citation_title" content="{official}"' not in st:
            add_error(errors,"Scholar P21 must preserve the official Macedonian published title")
        if 'name="citation_pdf_url"' in st:
            add_error(errors,"Scholar P21 must not expose a local PDF before publisher permission is verified")
        if "WPA bibliographic summary" not in st or "not a reproduction of the journal abstract" not in st:
            add_error(errors,"Scholar P21 rights-safe paraphrase boundary is missing")
    if records.exists():
        try:
            rs=json.loads(read_text(records))
            p21=next((x for x in rs if x.get("id")=="P21"),None)
            if not p21:
                add_error(errors,"Structured Scholar records JSON is missing P21")
            elif p21.get("pdf_url") is not None:
                add_error(errors,"Structured P21 must keep pdf_url null until republication permission exists")
        except Exception as exc:
            add_error(errors,f"Cannot validate structured Scholar records: {exc}")
    runtime_expectations={
        "scripts/wpa-home-metrics-sync-20260817.js":("setTxt(num, '28')","21 труд и прилог · 28 вкупно"),
        "scripts/wpa-corpus-20260729-v2.js":("• 28 Academic Publications / Академски публикации","• 25 Total WPA Zenodo Records"),
        "scripts/wpa-pn007-pn008-sync-20260803.js":("• 28 Academic Publications / Академски публикации","• 25 Total WPA Zenodo Records"),
        "scripts/wpa-publications-sync-20260817.js":("• 28 Academic Publications / Академски публикации","• 25 Total WPA Zenodo Records"),
        "scripts/wpa-wp014-runtime-sync-20260914.js":("if(z)z.textContent='25';","if(w)w.textContent='15';"),
    }
    for rel,tokens in runtime_expectations.items():
        p=ROOT/rel
        if not p.exists():
            add_error(errors,f"Missing active runtime metrics layer: {rel}")
            continue
        tx=read_text(p)
        for token in tokens:
            if token not in tx:
                add_error(errors,f"{rel}: canonical runtime metric token missing: {token}")
    locale_expectations={
        "en.json":{
            "about1P":"21 scientific papers and contributions",
            "a_platform.19":"21 scientific papers and contributions (28 in total)",
            "a_publications.2":"21 scientific papers and contributions — 28 publications in total",
            "a_publications.5":"21 scientific papers and contributions",
            "a_publications.9":"21 papers",
            "a_founder.5":"28 publications",
        },
        "mk.json":{
            "about1P":"21 научен труд и прилог",
            "a_platform.19":"21 научен труд и прилог (28 вкупно)",
            "a_publications.2":"21 научен труд и прилог — 28 публикации вкупно",
            "a_publications.5":"21 научен труд и прилог",
            "a_publications.9":"21 труд",
            "a_founder.5":"28 публикации",
        },
    }
    for rel,expected in locale_expectations.items():
        p=ROOT/rel
        if not p.exists():
            add_error(errors,f"Missing active locale corpus: {rel}")
            continue
        try:
            loc=json.loads(read_text(p))
            for key,token in expected.items():
                if token not in str(loc.get(key,"")):
                    add_error(errors,f"{rel}: {key} not reconciled to P21 canonical metrics")
            if "open pdf access" in str(loc.get("a_publications.8","")).lower():
                add_error(errors,f"{rel}: a_publications.8 must not imply full-PDF access for all 21 papers")
        except Exception as exc:
            add_error(errors,f"Cannot validate active locale corpus {rel}: {exc}")

def check_final_reconciliation_layer(errors):
    core=ROOT/"scripts"/"wpa-performance-core.js";layer=ROOT/"scripts"/"wpa-final-reconciliation-20260826.js";note=ROOT/"docs"/"WPA_CANONICAL_REFERENCE_STATE_2026-08-26.md"
    if not core.exists() or "/scripts/wpa-final-reconciliation-20260826.js" not in read_text(core):add_error(errors,"Performance core does not load final reconciliation layer")
    if not layer.exists():add_error(errors,"Missing final public reconciliation layer");return
    tx=read_text(layer)
    for token in ("Sande Smiljanov, Ph.D.","WP-001–WP-015","Video AI Workflow","Research AI Workflow","To be confirmed","10.5281/zenodo.20641840","data-wpa-wp013-category"):
        if token not in tx:add_error(errors,f"Final reconciliation layer missing invariant: {token}")
    if not note.exists():add_error(errors,"Missing canonical reference-state note")
def check_commerce_fail_closed(errors):
    """Commerce PRELAUNCH guards: no static checkout, no live bank route, no secrets/bank data, buyer rights and independence remain explicit."""
    import re
    commerce=ROOT/"commerce.html";cfg=ROOT/"scripts"/"wpa-commerce-config.js";pricing=ROOT/"scripts"/"pricing-loader.js"
    refunds=ROOT/"refunds-cancellations.html"
    if not commerce.exists() or not cfg.exists(): return
    ct=read_text(commerce);cf=read_text(cfg);pt=read_text(pricing) if pricing.exists() else ""
    if re.search(r'href=["\']https?://[^"\']*gumroad\.com',ct,re.I):
        add_error(errors,"commerce.html: static Gumroad href found; provider checkout must be config-gated")
    if "wpa-analytics.js" in ct:
        add_error(errors,"commerce.html: analytics must not load on the commerce interest/payment page")
    if "state: 'PRELAUNCH_REVIEW'" in cf:
        for forbidden in ("enabledForOneTimeProducts: true","enabledForMembership: true","enabledForRequests: true","bankRequestLive: true","bankTransferRequests: true","gumroadLive: true"):
            if forbidden in cf:add_error(errors,f"wpa-commerce-config.js: PRELAUNCH_REVIEW contains live commerce flag {forbidden}")
    for gate in ("traderIdentityApproved: false","geographicAddressApproved: false","consumerConsentFlowApproved: false","publicSectorInstitutionalApproved: false","dataControllerDisclosureApproved: false"):
        if gate not in cf:add_error(errors,f"wpa-commerce-config.js: unresolved Human Gate marker missing: {gate}")
    if "outboundEmailAuthenticated: true" not in cf:
        add_error(errors,"wpa-commerce-config.js: verified outbound-email authentication gate must remain true after 2026-10-02 receiver-side SPF/DKIM/DMARC evidence")
    clause="Payment buys only the stated product, access or service"
    for name in ("commerce.html","membership-terms.html","terms.html"):
        p=ROOT/name
        if p.exists() and clause not in read_text(p):add_error(errors,f"{name}: commercial-independence clause missing")
    if refunds.exists():
        rt=read_text(refunds)
        if "14 дена" not in rt or "претходна изрична согласност" not in rt:
            add_error(errors,"refunds-cancellations.html: 14-day withdrawal / digital-content consent wording missing")
    if "Бесплатно достапно:" not in ct or "Zenodo" not in ct:
        add_error(errors,"commerce.html: explicit free-Zenodo disclosure missing for the premium compilation")
    if "data-wpa-commerce-entry" not in pt:
        add_error(errors,"pricing-loader.js: active homepage commerce entry loader missing")
    if "wpa-commerce-entry.js?v=20261002-1" in read_text(ROOT/"index.html"):
        add_error(errors,"index.html: dead direct commerce-entry tag remains in the commented block")
    iban=re.compile(r"\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}\b")
    secret=re.compile(r"(?i)(gumroad[_-]?(?:access|api)?[_-]?token|application_secret|sk_live_|turnstile_secret)\s*[:=]\s*['\"][^'\"]{8,}")
    for p in (commerce,cfg,ROOT/"membership-terms.html",refunds,ROOT/"scripts"/"wpa-commerce-entry.js",pricing):
        if not p.exists():continue
        t=read_text(p)
        if iban.search(t):add_error(errors,f"{p.relative_to(ROOT)}: IBAN-like bank-account string found in public file")
        if secret.search(t):add_error(errors,f"{p.relative_to(ROOT)}: possible provider secret found in public file")

def check_p21_wp016_export_contract(errors):
    """Protect APA 7 and user-visible formats without breaching publisher PDF rights."""
    for rel in ("scholar/p21.html","scholar/p21.bib","scholar/p21.ris","scholar/p21.txt","scholar/wpa-wp-016.html","scholar/wpa-wp-016.txt","scholar/wpa-wp-016.bib","scholar/wpa-wp-016.ris"):
        if not (ROOT/rel).is_file(): add_error(errors,f"Publication export missing: {rel}")
    bib=read_text(ROOT/"bibliography"/"index.html")
    p21=read_text(ROOT/"scholar"/"p21.html")
    wp16=read_text(ROOT/"scholar"/"wpa-wp-016.html")
    idx=read_text(ROOT/"working-papers"/"index.html")
    for token in ('id="pub-28"','id="wp-016"','data-apa="Smiljanov, S. (2026).','📄 PDF · Zenodo','🔒 PDF · дозвола','📚 BibTeX','🗂 RIS','📋 Copy APA 7'):
        if token not in bib:add_error(errors,f"Missing bibliography action: {token}")
    if "https://zenodo.org/records/24446404/files/" not in bib or "https://zenodo.org/records/24446404/files/" not in wp16:
        add_error(errors,"WP-016 PDF must refer to its published Zenodo deposit.")
    for label,html in (("P21",p21),("WP016",wp16)):
        for token in ('data-copy-apa=','📚 BibTeX','🗂 RIS','📝 TXT'):
            if token not in html:add_error(errors,f"{label} Scholar missing {token}")
    for token in ("wpa-wp-016.bib","wpa-wp-016.ris","wpa-wp-016.txt"):
        if token not in idx:add_error(errors,f"WP-016 Working Papers entry missing {token}")
    # Scope this guard to the P21 entry; the P20 bibliography entry legitimately links to a differently numbered historical PDF filename.
    p21card=bib.split('id="pub-28"',1)[-1].split('<h2 class="part-heading"',1)[0]
    if "citation_pdf_url" in p21 or 'href="/papers/p21-the-flag' in p21 or 'href="/papers/p21-the-flag' in p21card:
        add_error(errors,"P21 must not point to another article's PDF.")
    try:
        records=json.loads(read_text(ROOT/"wpa-scholar-records-2026.json"))
        p21r=next(x for x in records if x.get("id")=="P21")
        w16=next(x for x in records if x.get("id")=="WP-016")
        if p21r.get("pdf_url") is not None:add_error(errors,"P21 publisher permission gate remains closed.")
        if w16.get("doi")!="10.5281/zenodo.24446404":add_error(errors,"WP-016 DOI drift.")
    except (StopIteration,json.JSONDecodeError,OSError) as exc:
        add_error(errors,f"Cannot verify academic export records: {exc}")

def check_papers_archive_discovery(errors):
    """Ensure the paper PDF folder and current bibliography do not conflate P20, P21 or WP-016."""
    page=ROOT/"papers.html"
    archive=ROOT/"papers"/"README.md"
    if not page.exists() or not archive.exists():
        add_error(errors,"Papers archive page or explanatory PDF-folder README missing")
        return
    html=read_text(page)
    readme=read_text(archive)
    for token in ('28 academic publications','16 WPA Working Papers','9 Protocol Notes','26 separate Zenodo records','id="academic-p21"','id="wpa-wp-016"','/scholar/p21.txt','/scholar/wpa-wp-016.bib','/scholar/wpa-wp-016.ris','https://zenodo.org/records/24446404/files/'):
        if token not in html:add_error(errors,f"Papers portal missing current record/route: {token}")
    for token in ('P20','P21','publisher and author written permission','28 academic publications','26 WPA Zenodo records','WPA Working Papers'):
        if token not in readme:add_error(errors,f"GitHub PDF-folder documentation missing: {token}")
    if not (ROOT/"papers/p21-institucionalniot-protokol-diplomatskata-simbolika-bezbednost-2026.md").is_file():
        add_error(errors,"Academic publication No. 28 requires a dedicated P21 catalogue entry in /papers/")
    else:
        entry=read_text(ROOT/"papers/p21-institucionalniot-protokol-diplomatskata-simbolika-bezbednost-2026.md")
        for token in ('LXVII','170–178','2671-3764','APA 7','NOT HOSTED','Scientific journal article'):
            if token not in entry:add_error(errors,f"P21 academic catalogue entry incomplete: {token}")
    if '| **WPA Working Paper No. 016:**' in readme:
        add_error(errors,"Do not mix the distinct WPA Zenodo WP-016 as an academic publication in /papers/ table")
    cards=html.split('id="papers-list"',1)[-1].split('id="wpa-working-papers"',1)[0]
    if cards.count('class="small-kicker">P21')!=1:
        add_error(errors,"P21 academic record must appear once, inside the academic papers collection")
    p21=cards.split('id="academic-p21"',1)[-1].split("</article>",1)[0]
    if 'href="/papers/p21-the-flag' in p21:
        add_error(errors,"P21 must not link to the P20 historical PDF filename")
    if 'papers/p21-institucionalniot-protokol-diplomatskata-simbolika-bezbednost-2026.md' not in p21:
        add_error(errors,"P21 academic card must link to its dedicated GitHub /papers/ catalogue record")
    if 'PDF is hosted at the published Zenodo record' not in html:
        add_error(errors,"WP016 PDF provenance statement missing")

def main():
    errors=[];allowed=allowed_sitemap_paths(errors);check_sitemap(errors,allowed);check_robots(errors);check_privacy_hotfixes(errors);check_basic_public_html(errors,allowed);check_publication_route_contract(errors);check_scholar_metadata_integrity(errors);check_governance_invariants(errors);check_latest_publication_20261118(errors);check_p21_wp016_export_contract(errors);check_papers_archive_discovery(errors);check_final_reconciliation_layer(errors);check_commerce_fail_closed(errors)
    if errors:
        print("\nWPA Site Quality CI failed:\n");[print(f"{i}. {e}") for i,e in enumerate(errors,1)];return 1
    print("WPA Site Quality CI passed.");return 0
if __name__=="__main__":raise SystemExit(main())
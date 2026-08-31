#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT=Path(__file__).resolve().parents[1]; errors=[]
def fail(m): errors.append(m)
def text(r): return (ROOT/r).read_text(encoding="utf-8",errors="replace")
metrics=json.loads(text("data/wpa-canonical-metrics-status.json")); ap=metrics.get("academic_publications",{}); zen=metrics.get("zenodo_doi_corpus",{})
if (ap.get("total"),ap.get("monographs_and_handbooks"),ap.get("doctoral_dissertations"),ap.get("scientific_papers_and_contributions")) != (26,6,1,19): fail("Academic metrics must remain 26 = 6 + 1 + 19 unless canonically updated.")
if (zen.get("total_records"),zen.get("working_papers"),zen.get("protocol_notes"),zen.get("global_strategic_plans")) != (23,13,9,1): fail("Zenodo metrics must remain 23 = 13 + 9 + 1 unless canonically updated.")
active=["index.html","institute.html","mk.json","index/mk.json","locales/index/mk.json","locales/locales/index/mk.json"]
for rel in active:
    if not (ROOT/rel).exists(): continue
    tx=text(rel)
    for token in ["25 публикации (5 монографии","5 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 25 публикации","25 publications"]:
        if token in tx: fail(f"{rel}: stale publication claim: {token}")
    if "со 25+ години институционално искуство со 25+ години институционално искуство" in tx: fail(f"{rel}: duplicate experience phrase")
security=text("security.html")
for token in ["every certificate must be verifiable by QR, SHA-256 hash and digital signature","SHA-256, QR verification, PKI digital signatures and WPA Trust Layer for suspicious attempts."]:
    if token in security: fail(f"security.html overclaim: {token}")
for token in ["Official issuance, public registry, QR verification and PKI signing remain inactive","Human Gate governance is active"]:
    if token not in security: fail(f"security.html missing truth: {token}")
if "https://worldprotocolacademy.mk/student-desk/" in text("sitemap.xml"): fail("Student Desk must not be in sitemap")
if "noindex" not in text("student-desk/index.html").lower(): fail("Student Desk must remain noindex")
pricing=text("scripts/pricing-loader.js")
if "installVirtualSandeFetchResilience" in pricing or "window.fetch =" in pricing: fail("Pricing loader must not own Virtual Sande transport")
if "hasScriptPath" not in pricing: fail("Pricing loader path dedupe missing")
vs=text("scripts/virtual-sande-public-widget.js")
if "}, 15000);" not in vs: fail("Virtual Sande 15-second timeout missing")
if "protocol-bot-workerjs.worldprotocolacademy.workers.dev" in vs: fail("Known-403 legacy endpoint remains in public failover")
wpaws=text("wpaws/index.html")
for token in ["localStorage.setItem('wpaws_claude_key'","localStorage.setItem('wpaws_gpt_key'","slice(0, 690)"]:
    if token in wpaws: fail(f"WPAWS fail-open legacy behavior: {token}")
if "WPAWS_BROWSER_KEYS_DISABLED = true" not in wpaws: fail("WPAWS canonical key guard missing")
state=json.loads(text("data/wpa-runtime-current-state.json"))
if state.get("virtual_sande",{}).get("legacy_worker_public_failover_active") is not False: fail("Runtime state legacy failover must be false")
if state.get("credentials",{}).get("official_issuance_active") is not False: fail("Runtime state issuance must be false")
if errors:
    print("WPA canonical truth validation FAILED:\n"); [print(f"{i}. {e}") for i,e in enumerate(errors,1)]; sys.exit(1)
print("WPA canonical truth validation passed.")

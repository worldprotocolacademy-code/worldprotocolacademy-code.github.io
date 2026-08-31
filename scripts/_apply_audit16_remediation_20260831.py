#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import json, re, shutil

ROOT = Path(__file__).resolve().parents[1]
CHANGED = []

def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")

def write(rel, text):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    old = p.read_text(encoding="utf-8") if p.exists() else None
    if old != text:
        p.write_text(text, encoding="utf-8")
        CHANGED.append(rel)

def required(text, old, new, label):
    if old not in text:
        raise SystemExit(f"{label}: expected pattern not found")
    return text.replace(old, new)

# 2. WPAWS canonical source: fail closed without relying on a runtime overlay.
text = read("wpaws/index.html")
text = required(text, "if (ck) localStorage.setItem('wpaws_claude_key', ck);", "if (ck) { console.warn('[WPAWS] Browser Claude keys are disabled; use approved server-side adapters.'); }", "WPAWS Claude browser-key storage")
text = required(text, "if (gk) localStorage.setItem('wpaws_gpt_key', gk);", "if (gk) { console.warn('[WPAWS] Browser GPT keys are disabled; use approved server-side adapters.'); }", "WPAWS GPT browser-key storage")
text = required(text, "function openModal() { const m = $('keyModal'); if (m) m.classList.add('open'); }", """function openModal() {
    try { localStorage.removeItem('wpaws_claude_key'); localStorage.removeItem('wpaws_gpt_key'); } catch (_) {}
    const m = $('keyModal');
    if (m) { m.setAttribute('aria-hidden', 'true'); m.classList.remove('open'); }
    toast('🔒', 'Browser API keys are disabled. WPAWS uses only approved server-side adapters.');
}""", "WPAWS key-modal fail-closed")
text = required(text, """  if(payload.message && payload.message.length > 690){
    payload.message = payload.message.slice(0, 690);
    console.warn('[WPAWS] prompt truncated to 690 chars for Worker limit');
  }""", """  if(payload.message && payload.message.length > 680){
    throw new Error('WPAWS_INPUT_TOO_LONG: public /ask is limited to 680 characters; use the governed long-document workflow instead.');
  }""", "WPAWS primary silent truncation")
text = required(text, "if (payload.message && payload.message.length > 690) payload.message = payload.message.slice(0, 690);", "if (payload.message && payload.message.length > 680) throw new Error('WPAWS_INPUT_TOO_LONG: public /ask is limited to 680 characters; use the governed long-document workflow instead.');", "WPAWS secondary silent truncation")
if "WPAWS_CANONICAL_FAIL_CLOSED_20260831" not in text:
    guard = """<script data-wpa-canonical-fail-closed="true">
try { localStorage.removeItem('wpaws_claude_key'); localStorage.removeItem('wpaws_gpt_key'); } catch (_) {}
window.WPAWS_BROWSER_KEYS_DISABLED = true;
</script>
<!-- WPAWS_CANONICAL_FAIL_CLOSED_20260831 -->
"""
    text = required(text, "</head>", guard + "</head>", "WPAWS head guard")
write("wpaws/index.html", text)

# 3. Security page follows the credential-security master current-production truth.
text = read("security.html")
for old, new in [
    ("WPA Security & Trust Center – ISO/IEC 27001:2022 groundwork, GDPR readiness, AI Trust, certificate verification and institutional security governance.", "WPA Security & Trust Center – ISO/IEC 27001:2022 groundwork, GDPR readiness, AI Trust, credential-security design and institutional security governance."),
    ("Official security governance centre for WPA: certificate anti-fake protection,", "Official security governance centre for WPA: governed credential-security design,"),
    ("SHA-256, QR verification, PKI digital signatures and WPA Trust Layer for suspicious attempts.", "Design-ready controls for registry records, serials, QR verification and content digests. Public QR verification and PKI signing are not active."),
    ("<li><strong>No fake certificates:</strong> every certificate must be verifiable by QR, SHA-256 hash and digital signature.</li>", "<li><strong>Credential status integrity:</strong> a visual certificate, QR, serial, seal or hash never creates status. Official issuance, public registry, QR verification and PKI signing remain inactive until their production gates are independently verified.</li>"),
]:
    text = required(text, old, new, "Security truth reconciliation")
if "Current production status:" not in text:
    note = '        <div class="notice"><strong>Current production status:</strong> Human Gate governance is active. Official credential issuance, public registry, QR verification and PKI signing are not active. The WPA Credential Security Master governs if any legacy design document appears broader.</div>\n'
    text = required(text, '        <div class="actions">', note + '        <div class="actions">', "Security status note")
write("security.html", text)

# 6/7. Virtual Sande: one real endpoint; native 15-second timeout; no false fallback.
text = read("scripts/virtual-sande-public-widget.js")
old = """  var ENDPOINTS = [
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask',
    'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask'
  ];"""
new = """  // Canonical production endpoint. The retired legacy Worker is intentionally not
  // presented as failover because it does not accept the canonical production origin.
  var ENDPOINTS = [
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask'
  ];"""
text = required(text, old, new, "Virtual Sande false fallback")
text = required(text, "    }, 6500);", "    }, 15000);", "Virtual Sande timeout")
write("scripts/virtual-sande-public-widget.js", text)

# 7/11. Pricing loader no longer owns AI transport; dedupe scripts by URL path.
text = read("scripts/pricing-loader.js")
start = text.find("  function installVirtualSandeFetchResilience() {")
end = text.find("\n  function loadScript", start)
if start < 0 or end < 0:
    raise SystemExit("pricing-loader: resilience block not found")
text = text[:start] + text[end+1:]
text = required(text, "  installVirtualSandeFetchResilience();\n\n", "", "pricing-loader resilience call")
old_loader = """  function loadScript(src, marker) {
    if (document.querySelector('script[' + marker + '],script[src="' + src + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(marker, 'true');
    document.head.appendChild(script);
  }"""
new_loader = """  function scriptPath(value) {
    try { return new URL(value, window.location.href).pathname; }
    catch (_) { return String(value || '').split('?')[0]; }
  }

  function hasScriptPath(src) {
    var wanted = scriptPath(src);
    var scripts = document.scripts || [];
    for (var i = 0; i < scripts.length; i += 1) {
      var current = scripts[i].getAttribute('src') || scripts[i].src || '';
      if (current && scriptPath(current) === wanted) return true;
    }
    return false;
  }

  function loadScript(src, marker) {
    if (document.querySelector('script[' + marker + ']') || hasScriptPath(src)) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(marker, 'true');
    document.head.appendChild(script);
  }"""
text = required(text, old_loader, new_loader, "pricing-loader path dedupe")
write("scripts/pricing-loader.js", text)

# 10. Student Desk is noindex: remove it from sitemap and forbid reintroduction.
text = read("sitemap.xml")
text = required(text, "  <url><loc>https://worldprotocolacademy.mk/student-desk/</loc></url>\n", "", "Student Desk sitemap")
write("sitemap.xml", text)
text = read("scripts/site_quality_check.py")
text = text.replace(',"/student-desk/"', '')
text = required(text, 'FORBIDDEN_IN_SITEMAP=("/ai/student-desk.html","/wpaws/"', 'FORBIDDEN_IN_SITEMAP=("/ai/student-desk.html","/student-desk/","/wpaws/"', "Student Desk CI forbid")
needle = '    s=ROOT/"ai"/"student-desk.html"\n    if s.exists() and "noindex" not in read_text(s).lower():add_error(errors,"ai/student-desk.html exists but does not contain noindex")\n'
text = required(text, needle, needle + '    sd=ROOT/"student-desk"/"index.html"\n    if sd.exists() and "noindex" not in read_text(sd).lower():add_error(errors,"student-desk/index.html exists but does not contain noindex")\n', "Student Desk noindex CI")
write("scripts/site_quality_check.py", text)

# 4/14. Correct protected active-public facts without flattening legitimate stylistic variants.
active = ["index.html", "institute.html", "mk.json", "index/mk.json", "locales/index/mk.json", "locales/locales/index/mk.json"]
replacements = [
    ("25 публикации (5 монографии, 1 дисертација, 19 трудови)", "26 публикации (6 монографии и прирачници, 1 дисертација, 19 трудови и прилози)"),
    ("5 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 25 публикации вкупно.", "6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 публикации вкупно."),
    ("Автор на 5 монографии и прирачници, 1 докторска дисертација и 19 научни трудови и прилози (25 вкупно публикации).", "Автор на 6 монографии и прирачници, 1 докторска дисертација и 19 научни трудови и прилози (26 вкупно публикации)."),
    ("5 monographs and manuals", "6 monographs and manuals"),
    ("5 monographs", "6 monographs"),
    ("25 publications", "26 publications"),
]
for rel in active:
    p = ROOT / rel
    if not p.exists():
        continue
    t = p.read_text(encoding="utf-8")
    for old, new in replacements:
        t = t.replace(old, new)
    t = re.sub(r"(со 25\+ години институционално искуство)(?:\s+со 25\+ години институционално искуство)+", r"\1", t)
    write(rel, t)

locale_registry = {
    "schema_version": "1.0", "updated": "2026-08-31", "context": "index", "language": "mk",
    "canonical_protected_fact_source": "/locales/index/mk.json",
    "compatibility_mirrors": ["/mk.json", "/index/mk.json", "/locales/locales/index/mk.json"],
    "policy": "Mirrors may retain deliberate wording variants, but publication counts, institutional-status facts and protected governance language must not diverge.",
    "protected_invariants": {"academic_publications": 26, "monographs_and_handbooks": 6, "doctoral_dissertations": 1, "scientific_papers_and_contributions": 19}
}
write("data/wpa-locale-source-registry.json", json.dumps(locale_registry, ensure_ascii=False, indent=2) + "\n")
write("scripts/sync_index_locale_protected_keys.py", '''#!/usr/bin/env python3\n"""Synchronise only protected WPA index-locale facts; do not flatten stylistic variants."""\nfrom pathlib import Path\nimport re\nROOT=Path(__file__).resolve().parents[1]\nFILES=["locales/index/mk.json","mk.json","index/mk.json","locales/locales/index/mk.json"]\nREPLACEMENTS=[("25 публикации (5 монографии, 1 дисертација, 19 трудови)","26 публикации (6 монографии и прирачници, 1 дисертација, 19 трудови и прилози)"),("5 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 25 публикации вкупно.","6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 публикации вкупно."),("5 monographs and manuals","6 monographs and manuals"),("25 publications","26 publications")]\nfor rel in FILES:\n    p=ROOT/rel\n    if not p.exists(): continue\n    text=p.read_text(encoding="utf-8")\n    for old,new in REPLACEMENTS: text=text.replace(old,new)\n    text=re.sub(r"(со 25\\+ години институционално искуство)(?:\\s+со 25\\+ години институционално искуство)+",r"\\1",text)\n    p.write_text(text,encoding="utf-8")\nprint("Protected WPA locale facts synchronized.")\n''')

# 8. Single current runtime-state registry; historical cutover records remain evidence only.
runtime_state = {
    "schema_version": "1.0", "updated": "2026-08-31", "status": "CURRENT_OPERATIONAL_REFERENCE",
    "canonical_public_domain": "https://worldprotocolacademy.mk",
    "virtual_sande": {"version": "v35.1.1", "production_worker": "wpa-virtual-sande-v35-1-production", "public_ask_endpoint": "https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask", "client_timeout_ms": 15000, "fallback_mode": "CURATED_LOCAL_CORE_ONLY", "legacy_worker_public_failover_active": False, "human_authority": "REQUIRED"},
    "ai_search": {"binding_variable": "AI_SEARCH_NAME", "canonical_target_instance": "protocol-ai-v4-final", "indexed_item_count": "RUNTIME_METRIC_NOT_HARDCODED", "rule": "Index counts are observed operational metrics and must be re-verified from the provider; historical cutover expected counts are not current-state truth."},
    "wpaws": {"canonical_public_version": "11.1.7", "governed_runtime": "11.2", "browser_api_keys_allowed": False, "silent_prompt_truncation_allowed": False, "human_gate_required": True},
    "credentials": {"official_issuance_active": False, "public_registry_active": False, "qr_verification_active": False, "pki_signing_active": False},
    "commercial": {"pricing_active": False, "payments_active": False, "paid_delivery_active": False}
}
write("data/wpa-runtime-current-state.json", json.dumps(runtime_state, ensure_ascii=False, indent=2) + "\n")
cutover = ROOT / "config/virtual-sande-ai-search-v4-cutover.json"
if cutover.exists():
    data = json.loads(cutover.read_text(encoding="utf-8"))
    data["record_role"] = "HISTORICAL_CUTOVER_EVIDENCE"
    data["current_state_source"] = "/data/wpa-runtime-current-state.json"
    data["current_state_note"] = "Do not use the historical expected item count as a live operational metric."
    write("config/virtual-sande-ai-search-v4-cutover.json", json.dumps(data, ensure_ascii=False, indent=2) + "\n")

# 9. Conservative rendering containment for the two measured heavy long pages.
write("styles/wpa-longpage-performance.css", '''/* WPA long-page performance containment · progressive enhancement */\n@supports (content-visibility:auto) {\n  html[data-wpa-page="index"] main > section:not(.hero),\n  html[data-wpa-page="institute"] main > section:not(.hero) { content-visibility:auto; contain-intrinsic-size:auto 760px; }\n}\n@media (prefers-reduced-motion: reduce) { html { scroll-behavior:auto !important; } }\n''')
for rel in ["index.html", "institute.html"]:
    t = read(rel)
    link = '<link rel="stylesheet" href="/styles/wpa-longpage-performance.css?v=20260831-1">'
    if link not in t:
        t = required(t, "</head>", link + "\n</head>", rel + " performance link")
    write(rel, t)

# 15. Repository hygiene and non-breaking security-marker migration.
write(".gitignore", '''# Python\n__pycache__/\n*.py[cod]\n*.pyo\n\n# Node / local builds\nnode_modules/\ndist/\nbuild/\n.cache/\n\n# OS / editors\n.DS_Store\nThumbs.db\n.vscode/\n.idea/\n\n# Local secrets and credentials\n.env\n.env.*\n!.env.example\n*.pem\n*.key\n*.p12\n*.pfx\ncredentials.json\nsecrets.json\n\n# Temporary\n*.tmp\n*.temp\n*.bak\n''')
for p in list(ROOT.rglob("__pycache__")):
    if ".git" not in p.parts and p.is_dir():
        shutil.rmtree(p); CHANGED.append(str(p.relative_to(ROOT)) + "/")
for p in list(ROOT.rglob("*.pyc")) + list(ROOT.rglob("*.pyo")):
    if ".git" not in p.parts and p.exists():
        p.unlink(); CHANGED.append(str(p.relative_to(ROOT)))
legacy_security = ROOT / "security"
if legacy_security.exists() and legacy_security.is_file():
    old = legacy_security.read_text(encoding="utf-8", errors="replace")
    legacy_security.unlink()
    write("security/README.md", "# WPA Security documentation structure\n\nThis directory replaces the historical root marker file named `security`.\n\nThe public security documents `01_...` through `08_...` intentionally remain at repository root for URL stability. Future moves require a separate redirect/link-migration review.\n\n## Historical marker content\n\n" + old)
    CHANGED.append("security (legacy marker removed)")

# 5. Static canonicalization becomes read-only validation.
write(".github/workflows/wpa-static-canonicalization.yml", '''name: WPA Static Canonical Truth\n\non:\n  pull_request:\n    paths: ['index.html','institute.html','security.html','sitemap.xml','wpaws/**','scripts/**','locales/**','data/**','.github/workflows/wpa-static-canonicalization.yml']\n  push:\n    branches: [main]\n    paths: ['index.html','institute.html','security.html','sitemap.xml','wpaws/**','scripts/**','locales/**','data/**']\n  workflow_dispatch:\n\npermissions:\n  contents: read\n\njobs:\n  validate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.x'\n      - name: Validate canonical public truth\n        run: python scripts/validate_canonical_public_truth.py\n''')

write("scripts/validate_canonical_public_truth.py", '''#!/usr/bin/env python3\nfrom pathlib import Path\nimport json, sys\nROOT=Path(__file__).resolve().parents[1]; errors=[]\ndef fail(m): errors.append(m)\ndef text(r): return (ROOT/r).read_text(encoding="utf-8",errors="replace")\nmetrics=json.loads(text("data/wpa-canonical-metrics-status.json")); ap=metrics.get("academic_publications",{}); zen=metrics.get("zenodo_doi_corpus",{})\nif (ap.get("total"),ap.get("monographs_and_handbooks"),ap.get("doctoral_dissertations"),ap.get("scientific_papers_and_contributions")) != (26,6,1,19): fail("Academic metrics must remain 26 = 6 + 1 + 19 unless canonically updated.")\nif (zen.get("total_records"),zen.get("working_papers"),zen.get("protocol_notes"),zen.get("global_strategic_plans")) != (23,13,9,1): fail("Zenodo metrics must remain 23 = 13 + 9 + 1 unless canonically updated.")\nactive=["index.html","institute.html","mk.json","index/mk.json","locales/index/mk.json","locales/locales/index/mk.json"]\nfor rel in active:\n    if not (ROOT/rel).exists(): continue\n    tx=text(rel)\n    for token in ["25 публикации (5 монографии","5 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 25 публикации","25 publications"]:\n        if token in tx: fail(f"{rel}: stale publication claim: {token}")\n    if "со 25+ години институционално искуство со 25+ години институционално искуство" in tx: fail(f"{rel}: duplicate experience phrase")\nsecurity=text("security.html")\nfor token in ["every certificate must be verifiable by QR, SHA-256 hash and digital signature","SHA-256, QR verification, PKI digital signatures and WPA Trust Layer for suspicious attempts."]:\n    if token in security: fail(f"security.html overclaim: {token}")\nfor token in ["Official issuance, public registry, QR verification and PKI signing remain inactive","Human Gate governance is active"]:\n    if token not in security: fail(f"security.html missing truth: {token}")\nif "https://worldprotocolacademy.mk/student-desk/" in text("sitemap.xml"): fail("Student Desk must not be in sitemap")\nif "noindex" not in text("student-desk/index.html").lower(): fail("Student Desk must remain noindex")\npricing=text("scripts/pricing-loader.js")\nif "installVirtualSandeFetchResilience" in pricing or "window.fetch =" in pricing: fail("Pricing loader must not own Virtual Sande transport")\nif "hasScriptPath" not in pricing: fail("Pricing loader path dedupe missing")\nvs=text("scripts/virtual-sande-public-widget.js")\nif "}, 15000);" not in vs: fail("Virtual Sande 15-second timeout missing")\nif "protocol-bot-workerjs.worldprotocolacademy.workers.dev" in vs: fail("Known-403 legacy endpoint remains in public failover")\nwpaws=text("wpaws/index.html")\nfor token in ["localStorage.setItem('wpaws_claude_key'","localStorage.setItem('wpaws_gpt_key'","slice(0, 690)"]:\n    if token in wpaws: fail(f"WPAWS fail-open legacy behavior: {token}")\nif "WPAWS_BROWSER_KEYS_DISABLED = true" not in wpaws: fail("WPAWS canonical key guard missing")\nstate=json.loads(text("data/wpa-runtime-current-state.json"))\nif state.get("virtual_sande",{}).get("legacy_worker_public_failover_active") is not False: fail("Runtime state legacy failover must be false")\nif state.get("credentials",{}).get("official_issuance_active") is not False: fail("Runtime state issuance must be false")\nif errors:\n    print("WPA canonical truth validation FAILED:\\n"); [print(f"{i}. {e}") for i,e in enumerate(errors,1)]; sys.exit(1)\nprint("WPA canonical truth validation passed.")\n''')

# 1. Repository governance lock: content controls now; server-side ruleset requires admin confirmation.
write("docs/WPA_REPOSITORY_GOVERNANCE_LOCK.md", '''# WPA Repository Governance Lock\n\nStatus: repository-side controls implemented; GitHub server-side PR/status-check enforcement must also be enabled in the repository ruleset.\n\n## Canonical mutation rule\n\n`feature branch -> pull request -> required CI -> reviewed merge -> production verification`\n\nNo normal workflow may commit or push generated source directly to `main`.\n\n## Required GitHub ruleset target for `main`\n\n- Require a pull request before merging.\n- Require status checks to pass before merging.\n- Require the branch to be up to date before merging.\n- Block force pushes and branch deletion.\n- Do not permit routine bypass actors.\n- Keep administrators under the normal rule except for a documented emergency-recovery procedure.\n\nRequired checks should include current canonical CI and WPA Production Functional Smoke. Path-scoped Virtual Sande smoke is required when its protected paths change.\n\n## Tooling limitation recorded 2026-08-31\n\nThe connected GitHub tool used for this remediation can read the active ruleset but does not expose a ruleset/branch-protection write action. Server-side require-PR/status-check enforcement therefore remains an administrative repository setting that must be confirmed separately after this PR.\n''')

# Known direct-push performance automation becomes report/artifact-only.
write(".github/workflows/performance-optimization.yml", '''name: WPA Performance Optimization\n\non:\n  workflow_dispatch:\n    inputs:\n      approval:\n        description: Type APPROVE_WPA_PERFORMANCE_OPTIMIZATION\n        required: true\n        default: DO_NOT_APPROVE\n        type: string\n\npermissions:\n  contents: read\n\nconcurrency:\n  group: wpa-performance-optimization\n  cancel-in-progress: false\n\njobs:\n  optimize:\n    if: ${{ inputs.approval == 'APPROVE_WPA_PERFORMANCE_OPTIMIZATION' }}\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n        with:\n          fetch-depth: 0\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.12'\n      - name: Generate optimization candidate\n        run: |\n          pip install pillow\n          python scripts/run_media_optimizer.py\n          git diff --binary > wpa-performance-optimization.patch\n          git status --short > wpa-performance-optimization-status.txt\n      - name: Upload candidate for reviewed PR\n        uses: actions/upload-artifact@v7\n        with:\n          name: wpa-performance-optimization-candidate\n          path: |\n            wpa-performance-optimization.patch\n            wpa-performance-optimization-status.txt\n          retention-days: 30\n''')

# 12. Workflow registry; preserve history but remove ambiguity about authority.
workflows = sorted(p.name for p in (ROOT / ".github/workflows").glob("*.yml"))
active_required = {"site-quality.yml", "translator-quality.yml", "i18n-audit.yml", "virtual-sande-public-endpoint-smoke.yml", "wpa-production-functional-smoke.yml"}
active_manual = {"performance-optimization.yml"}
items=[]
for name in workflows:
    low=name.lower()
    if name in active_required: status="ACTIVE_REQUIRED_CI"
    elif name in active_manual: status="ACTIVE_MANUAL_REVIEWED"
    elif "ai-search-v3" in low or any(x in low for x in ["perplexity-six","kimi-delta","claude-audit-delta"]): status="SUPERSEDED_HISTORICAL"
    elif any(x in low for x in ["deploy","cutover","protected-apply","production"]): status="MANUAL_PROTECTED_REVIEW_REQUIRED"
    else: status="REVIEW_REQUIRED"
    items.append({"workflow":name,"status":status})
write("data/wpa-workflow-registry.json", json.dumps({"schema_version":"1.0","updated":"2026-08-31","policy":"Only ACTIVE_* workflows are part of normal operations. SUPERSEDED_HISTORICAL workflows are retained only as evidence; MANUAL_PROTECTED_REVIEW_REQUIRED workflows require current runbook verification before dispatch.","workflows":items}, ensure_ascii=False, indent=2) + "\n")
write("docs/WPA_WORKFLOW_GOVERNANCE.md", '''# WPA Workflow Governance\n\nMachine-readable source: `/data/wpa-workflow-registry.json`.\n\n- `ACTIVE_REQUIRED_CI`: normal protection/quality workflow.\n- `ACTIVE_MANUAL_REVIEWED`: intentional manual, non-direct-push workflow.\n- `MANUAL_PROTECTED_REVIEW_REQUIRED`: deployment/cutover workflow; verify current runbook, environment and rollback before dispatch.\n- `SUPERSEDED_HISTORICAL`: evidence only; do not dispatch.\n- `REVIEW_REQUIRED`: not part of the protected normal path until reviewed.\n\nHistorical workflow files are not automatically deleted because several preserve forensic/deployment evidence. Their presence does not grant operational authority.\n''')

# 16. Functional smoke tests both branch-local rendered DOM and public edge baseline.
write(".github/workflows/wpa-production-functional-smoke.yml", '''name: WPA Production Functional Smoke\n\non:\n  pull_request:\n    paths: ['index.html','professional-english.html','scripts/**','styles/**','wpaws/**','security.html','sitemap.xml','.github/workflows/wpa-production-functional-smoke.yml']\n  workflow_dispatch:\n\npermissions:\n  contents: read\n\njobs:\n  functional-smoke:\n    runs-on: ubuntu-latest\n    timeout-minutes: 10\n    steps:\n      - uses: actions/checkout@v7\n      - uses: actions/setup-python@v5\n        with:\n          python-version: '3.x'\n      - name: Start branch-local static server\n        run: |\n          python -m http.server 8000 --bind 127.0.0.1 >/tmp/wpa-http.log 2>&1 &\n          for i in {1..20}; do curl --fail --silent http://127.0.0.1:8000/ >/dev/null && exit 0; sleep 0.5; done\n          cat /tmp/wpa-http.log; exit 1\n      - name: Branch-local browser DOM smoke\n        shell: bash\n        run: |\n          set -euo pipefail\n          chrome="$(command -v google-chrome || command -v chromium || command -v chromium-browser || true)"\n          test -n "$chrome"\n          "$chrome" --headless --no-sandbox --disable-dev-shm-usage --virtual-time-budget=6500 --dump-dom http://127.0.0.1:8000/ > /tmp/home-dom.html\n          grep -q 'wpa-home-pe-icon' /tmp/home-dom.html\n          grep -q 'wpaHomeAudioVideoCard' /tmp/home-dom.html\n          grep -q 'wpa-public-vs-fab' /tmp/home-dom.html\n          curl --fail --silent http://127.0.0.1:8000/professional-english.html | grep -q 'module-icon pe-module-icon'\n          curl --fail --silent http://127.0.0.1:8000/student-desk/ | grep -qi 'noindex'\n      - name: Canonical truth validation\n        run: |\n          python scripts/site_quality_check.py\n          python scripts/validate_canonical_public_truth.py\n      - name: Public edge baseline health\n        shell: bash\n        run: |\n          set -euo pipefail\n          for url in https://worldprotocolacademy.mk/ https://worldprotocolacademy.mk/institute.html https://worldprotocolacademy.mk/virtual-sande-ai.html https://worldprotocolacademy.mk/security.html; do curl --fail --silent --show-error --location --max-time 30 --output /dev/null "$url"; done\n''')

# Primary Virtual Sande must pass; legacy 403 can no longer satisfy the gate.
write(".github/workflows/virtual-sande-public-endpoint-smoke.yml", '''name: Virtual Sande Public Endpoint Smoke\n\non:\n  pull_request:\n    paths: ['.github/workflows/virtual-sande-public-endpoint-smoke.yml','scripts/virtual-sande-public-widget.js','workers/virtual-sande-v35.1-production/**','workers/virtual-sande-v35.1-staging/**']\n  workflow_dispatch:\n\npermissions:\n  contents: read\n\njobs:\n  smoke:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - name: Require canonical public Virtual Sande endpoint\n        shell: bash\n        run: |\n          set -euo pipefail\n          primary='https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask'\n          payload='{"message":"ШТО ПРЕТСТАВУВА итинерар?","question":"ШТО ПРЕТСТАВУВА итинерар?","query":"ШТО ПРЕТСТАВУВА итинерар?","lang":"mk","language":"mk","history":[],"quality":"3layer_academic","context":"World Protocol Academy public page: /"}'\n          headers=/tmp/primary-headers.txt; body=/tmp/primary-body.txt\n          code="$(curl --silent --show-error --location --max-time 20 --output "$body" --dump-header "$headers" --write-out '%{http_code}' --request POST "$primary" --header 'Origin: https://worldprotocolacademy.mk' --header 'Content-Type: application/json' --header 'Accept: application/json' --data "$payload")"\n          echo "HTTP $code"\n          test "$code" -ge 200 -a "$code" -lt 300\n          grep -Eiq '^access-control-allow-origin:.*(worldprotocolacademy\\.mk|\\*)' "$headers"\n          grep -Eiq 'answer|response|text|message' "$body"\n          head -c 3000 "$body"\n''')

# Active quality workflow uses current Node-24-compatible checkout major.
text = read(".github/workflows/site-quality.yml").replace("actions/checkout@v4", "actions/checkout@v7")
write(".github/workflows/site-quality.yml", text)

# 1-16 machine-readable remediation ledger.
audit = {
  "schema_version":"1.0", "updated":"2026-08-31", "source_audit":"WPA comprehensive 16-finding audit",
  "items":[
    {"id":1,"status":"REPO_HARDENED_ADMIN_RULESET_CONFIRMATION_REQUIRED","control":"Direct-push remediation + governance lock; GitHub require-PR/status-check rule requires admin setting."},
    {"id":2,"status":"REMEDIATED","control":"WPAWS canonical base fail-closed for browser keys and long prompts."},
    {"id":3,"status":"REMEDIATED","control":"Security page aligned to credential master truth."},
    {"id":4,"status":"REMEDIATED","control":"Protected active public publication facts reconciled."},
    {"id":5,"status":"REMEDIATED","control":"Static canonicalization converted to read-only validator."},
    {"id":6,"status":"REMEDIATED","control":"False legacy Virtual Sande public failover removed."},
    {"id":7,"status":"REMEDIATED","control":"Virtual Sande timeout owned by Virtual Sande widget."},
    {"id":8,"status":"REMEDIATED","control":"Current runtime-state registry added."},
    {"id":9,"status":"REMEDIATED_WITH_BUDGET_MONITORING","control":"Long-page containment + duplicate-runtime reduction; Lighthouse remains monitored."},
    {"id":10,"status":"REMEDIATED","control":"Noindex Student Desk removed and forbidden from sitemap."},
    {"id":11,"status":"REMEDIATED","control":"Script loader deduplicates by URL pathname."},
    {"id":12,"status":"REMEDIATED_GOVERNANCE","control":"Workflow authority registry added; history retained."},
    {"id":13,"status":"POST_MERGE_OPERATION","control":"Obvious stale PRs close as superseded after remediation merge."},
    {"id":14,"status":"REMEDIATED","control":"Protected locale source registry + invariant sync script."},
    {"id":15,"status":"REMEDIATED","control":".gitignore, Python artifact cleanup and security marker migration."},
    {"id":16,"status":"REMEDIATED","control":"Branch-local browser DOM + public-edge functional smoke added."}
  ]
}
write("data/wpa-audit-16-remediation-status.json", json.dumps(audit, ensure_ascii=False, indent=2) + "\n")

for rel in ["data/wpa-locale-source-registry.json","data/wpa-runtime-current-state.json","data/wpa-workflow-registry.json","data/wpa-audit-16-remediation-status.json"]:
    json.loads(read(rel))
print("Audit-16 remediation applied.")
for rel in CHANGED:
    print(" -", rel)

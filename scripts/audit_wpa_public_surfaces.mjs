#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const AUDIT_VERSION = "1.1.0";
let failures = 0;
let checks = 0;

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const json = (p) => JSON.parse(read(p));
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const pass = (m) => { checks += 1; console.log("PASS", m); };
const fail = (m) => { checks += 1; failures += 1; console.error("FAIL", m); };
const check = (cond, m) => cond ? pass(m) : fail(m);

function htmlIds(html) {
  return [...html.matchAll(/<[^>]*\bid\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
}
function hrefs(html) {
  return [...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
}
function normalizeLocalTarget(href, source) {
  if (!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
  if (/^https?:\/\//i.test(href)) {
    try {
      const u = new URL(href);
      if (!["worldprotocolacademy.mk", "www.worldprotocolacademy.mk"].includes(u.hostname)) return null;
      href = u.pathname;
    } catch {
      return null;
    }
  }
  href = href.split("#")[0].split("?")[0];
  if (!href) return null;
  let p = href.startsWith("/")
    ? href.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(source), href));
  if (!p || p === ".") p = "index.html";
  if (p.endsWith("/")) p += "index.html";
  if (exists(p)) return p;
  if (!path.posix.extname(p) && exists(p + ".html")) return p + ".html";
  if (!path.posix.extname(p) && exists(path.posix.join(p, "index.html"))) return path.posix.join(p, "index.html");
  return p;
}
function auditHtml(file) {
  const html = read(file);
  const ids = htmlIds(html);
  const seen = new Set();
  const duplicates = [];
  for (const id of ids) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
  check(duplicates.length === 0, file + " has unique HTML ids");

  const missingAnchors = [...new Set(
    hrefs(html)
      .filter((h) => h.startsWith("#") && h.length > 1)
      .map((h) => h.slice(1))
      .filter((id) => !seen.has(id))
  )];
  check(missingAnchors.length === 0, file + " same-page anchors resolve");

  const broken = [];
  for (const href of [...new Set(hrefs(html))]) {
    const target = normalizeLocalTarget(href, file);
    if (target && !exists(target)) broken.push(href + " -> " + target);
  }
  if (broken.length) console.error(broken.join("\n"));
  check(broken.length === 0, file + " internal href targets exist");
}

const auditedPages = [
  "index.html",
  "institute.html",
  "en/index.html",
  "en/institute.html",
  "languages/fr/index.html",
  "languages/fr/institute.html",
  "languages/de/index.html",
  "languages/de/institute.html",
  "opc2027/index.html",
  "en/opc2027/index.html",
  "languages/fr/opc2027/index.html",
  "languages/de/opc2027/index.html"
];
for (const page of auditedPages) {
  check(exists(page), page + " exists");
  if (exists(page)) auditHtml(page);
}

const facts = json("data/wpa-canonical-public-facts.json");
check(facts.academic_corpus?.total_publications === 27, "canonical publications = 27");
check(facts.academic_corpus?.papers_and_contributions === 20, "canonical papers/contributions = 20");
check(facts.master_list?.canonical_version === "v1.0-CORRECTED-4F-REV7", "canonical Master List = REV7");
check(
  facts.master_list?.total_records === 250 &&
  facts.master_list?.external_records === 249 &&
  facts.master_list?.distinct_external_institutions === 241,
  "REV7 counts = 250 / 249 / 241"
);

const metrics = json("data/wpa-canonical-metrics-status.json");
check(metrics.academic_publications?.total === 27, "metrics status publications = 27");
check(metrics.academic_publications?.scientific_papers_and_contributions === 20, "metrics status papers = 20");
check(metrics.master_list_current?.canonical_version === "v1.0-CORRECTED-4F-REV7", "metrics current pointer = REV7");
check(metrics.master_list_current?.total_records === 250, "metrics current records = 250");

const home = read("index.html");
const institute = read("institute.html");
const layer = read("wpa-translator.js");
check(home.includes('<div class="stat-num">27</div>'), "home hero shows 27 publications");
check(home.includes('<div class="stat-num">20</div>'), "home hero shows 20 papers");
check(home.includes("OPC 2027 · Ohrid") && !home.includes("OPC 2026 · Ohrid"), "home current conference gateway = OPC 2027");
check(home.includes("sande@worldprotocolacademy.mk"), "home contains canonical author contact");
check(!home.includes("26 публикации = 6 монографии/прирачници + 1 докторска дисертација + 19 трудови/прилози"), "home has no stale 26/19 evidence equation");
check(institute.includes("OPC 2027") && institute.includes('href="/opc2027/"'), "Institute routes current conference to OPC 2027");
check(institute.includes('id="wpa-proactive-agent-fabric"'), "Institute surfaces Proactive Agent Fabric section");
check(institute.includes("11 ноември 2026"), "Institute audit date is current");
check(!institute.includes("26 publications = 6 monographs/manuals + 1 doctoral dissertation + 19 papers/contributions"), "Institute has no stale 26/19 evidence equation");
check(layer.includes("REV7 Dataset") && layer.includes("250 records · 249 external · 241 distinct"), "Institute Command Layer uses REV7");
check(!layer.includes("REV2 Dataset"), "Institute Command Layer has no live REV2 card");
check(layer.includes("OPC 2027 expression of interest") && !layer.includes("OPC 2026 expression of interest"), "Institute brief builder uses OPC 2027");
check(layer.includes("Proactive Agent Fabric"), "Institute Command Layer exposes proactive-agent boundary");

const de = json("locales/de.json");
check(de._meta?.lang === "de" && de._meta?.name === "Deutsch", "German compatibility locale identity is correct");

const mkCore = json("locales/mk/core.json");
const enCore = json("locales/en/core.json");
check(String(mkCore["institute.tools_hub.master_list.text"] || "").includes("250"), "MK core locale uses REV7 250 count");
check(String(enCore["institute.tools_hub.master_list.text"] || "").includes("250"), "EN core locale uses REV7 250 count");
check(String(mkCore["institute.tools_hub.dois.text"] || "").includes("15 Working Papers"), "MK core DOI corpus uses 15 Working Papers");
check(String(enCore["institute.tools_hub.dois.text"] || "").includes("9 Protocol Notes"), "EN core DOI corpus uses 9 Protocol Notes");

const lang = json("data/language-activation.json");
check(Object.keys(lang.public_surface_routes || {}).length === 57, "active public-language surface count remains 57");
check(!lang.public_surface_routes?.opc2026, "archived OPC 2026 is not an active language surface");
for (const code of ["mk", "en", "fr", "de"]) {
  const route = lang.public_surface_routes?.opc2027?.[code];
  check(Boolean(route), "OPC 2027 route registered for " + code);
  if (route) {
    const target = normalizeLocalTarget(route, "index.html");
    check(Boolean(target && exists(target)), "OPC 2027 " + code + " route resolves");
  }
}

const agents = json("data/wpa-proactive-agent-fabric.json");
check(Array.isArray(agents.agents) && agents.agents.length === 5, "Proactive Agent Fabric has five provider seats");
check(agents.execution_policy?.provider_calls === "SERVER_SIDE_ONLY", "provider calls are server-side only");
check(agents.execution_policy?.browser_api_keys === false, "browser API keys are prohibited");
check(agents.execution_policy?.automatic_external_publication === false, "automatic external publication is disabled");
check(String(agents.human_gate?.HG4 || "").toLowerCase().includes("human"), "HG4 final authority remains human");

for (const critical of [
  "data/wpa-human-gate-policy.json",
  "data/wpa-connected-vessels-system.json",
  "data/wpa-institute-functional-registry.json",
  "data/wpa-canonical-version-manifest.json",
  "institute/daily/index.html",
  "tools/institute-function-console/index.html",
  "tools/research-output-builder/index.html",
  "tools/academic-search-hub/index.html",
  "tools/institutional-knowledge-harvester/index.html",
  "media/index.html",
  "practitioner-lectures/index.html",
  "aab-governance.html",
  "wpa-metrics-status.html"
]) check(exists(critical), "critical route/source exists: " + critical);

console.log("\nWPA PUBLIC SURFACE AUDIT " + AUDIT_VERSION + ": " + (failures ? "FAIL" : "PASS") + " · " + checks + " checks · " + failures + " failures");
process.exit(failures ? 1 : 0);

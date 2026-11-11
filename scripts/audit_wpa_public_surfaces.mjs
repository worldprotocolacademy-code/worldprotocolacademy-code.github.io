#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT=process.cwd();
let failures=0, checks=0;
const pass=m=>{checks++; console.log("PASS",m)};
const fail=m=>{checks++; failures++; console.error("FAIL",m)};
const assert=(cond,m)=>cond?pass(m):fail(m);
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const json=p=>JSON.parse(read(p));
const exists=p=>fs.existsSync(path.join(ROOT,p));

function ids(html){
  return [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(x=>x[1]);
}
function hrefs(html){
  return [...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map(x=>x[1]);
}
function checkAnchors(file){
  const html=read(file), set=new Set(ids(html)), seen=new Set(), dup=[];
  for(const id of ids(html)){ if(seen.has(id)) dup.push(id); seen.add(id); }
  assert(dup.length===0, file+" has no duplicate ids"+(dup.length?": "+dup.join(", "):""));
  const missing=[...new Set(hrefs(html).filter(h=>h.startsWith("#")&&h.length>1).map(h=>h.slice(1)).filter(id=>!set.has(id)))];
  assert(missing.length===0, file+" same-page anchors resolve"+(missing.length?": "+missing.join(", "):""));
}
function localTarget(href, source){
  if(!href || /^(mailto:|tel:|javascript:|data:|#)/i.test(href)) return null;
  try{
    if(/^https?:\/\//i.test(href)){
      const u=new URL(href);
      if(!["worldprotocolacademy.mk","www.worldprotocolacademy.mk"].includes(u.hostname)) return null;
      href=u.pathname;
    }
  }catch{return null}
  href=href.split("#")[0].split("?")[0];
  if(!href) return null;
  let p;
  if(href.startsWith("/")) p=href.slice(1);
  else p=path.posix.normalize(path.posix.join(path.posix.dirname(source),href));
  if(!p || p===".") p="index.html";
  if(p.endsWith("/")) p+="index.html";
  if(exists(p)) return p;
  if(!path.posix.extname(p) && exists(p+".html")) return p+".html";
  if(!path.posix.extname(p) && exists(path.posix.join(p,"index.html"))) return path.posix.join(p,"index.html");
  return p;
}
function checkLinks(file){
  const html=read(file), broken=[];
  for(const h of [...new Set(hrefs(html))]){
    const t=localTarget(h,file); if(!t) continue;
    if(!exists(t)) broken.push(h+" -> "+t);
  }
  assert(broken.length===0,file+" internal href targets exist"+(broken.length?"\n  "+broken.join("\n  "):""));
}

const home=read("index.html"), inst=read("institute.html"), layer=read("wpa-translator.js");
checkAnchors("index.html"); checkAnchors("institute.html");
checkLinks("index.html"); checkLinks("institute.html");
for(const p of ["opc2027/index.html","en/opc2027/index.html","languages/fr/opc2027/index.html","languages/de/opc2027/index.html"]){
  assert(exists(p),p+" exists");
  if(exists(p)){checkAnchors(p);checkLinks(p);}
}

const facts=json("data/wpa-canonical-public-facts.json");
assert(facts.academic_corpus.total_publications===27 && facts.academic_corpus.papers_and_contributions===20,"canonical academic corpus = 27 / papers = 20");
assert(facts.master_list.canonical_version==="v1.0-CORRECTED-4F-REV7","canonical facts point to Master List REV7");
assert(facts.master_list.total_records===250 && facts.master_list.external_records===249 && facts.master_list.distinct_external_institutions===241,"canonical REV7 counts = 250 / 249 / 241");

const metrics=json("data/wpa-canonical-metrics-status.json");
assert(metrics.academic_publications.total===27 && metrics.academic_publications.scientific_papers_and_contributions===20,"metrics status academic corpus = 27 / 20");
assert(metrics.master_list_current?.canonical_version==="v1.0-CORRECTED-4F-REV7","metrics current pointer = REV7");
assert(metrics.master_list_current?.total_records===250 && metrics.master_list_current?.external_records===249 && metrics.master_list_current?.distinct_external_institutions===241,"metrics current REV7 counts = 250 / 249 / 241");

assert(home.includes('<div class="stat-num">27</div>'),"home hero shows 27 publications");
assert(home.includes('<div class="stat-num">20</div>'),"home hero shows 20 papers");
assert(!/26 публикации = 6 монографии\/прирачници \+ 1 докторска дисертација \+ 19 трудови\/прилози/.test(home),"home does not contain stale 26/19 evidence equation");
assert(!home.includes("OPC 2026 · Ohrid"),"home current gateway no longer advertises OPC 2026");
assert(home.includes("OPC 2027 · Ohrid"),"home current gateway advertises OPC 2027");
assert(home.includes("sande@worldprotocolacademy.mk"),"home exposes canonical author contact");

assert(!inst.includes("26 publications = 6 monographs/manuals + 1 doctoral dissertation + 19 papers/contributions"),"Institute no longer contains stale 26/19 evidence equation");
assert(inst.includes("OPC 2027"),"Institute advertises OPC 2027");
assert(inst.includes('href="/opc2027/"'),"Institute OPC CTA routes to /opc2027/");
assert(inst.includes("11 ноември 2026"),"Institute footer update date is current audit date");
assert(layer.includes("REV7 Dataset") && layer.includes("250 records · 249 external · 241 distinct"),"Institute Command Layer uses REV7 counts");
assert(!layer.includes("REV2 Dataset"),"Institute Command Layer contains no live REV2 card");
assert(layer.includes("Proactive Agent Fabric"),"Institute Command Layer surfaces proactive agent fabric boundary");

const de=json("locales/de.json");
assert(de._meta?.lang==="de" && de._meta?.name==="Deutsch","German compatibility locale identifies as de / Deutsch");
assert(!JSON.stringify(de).includes('"lang": "bs"'),"German compatibility locale is not Bosnian metadata");

const mkCore=json("locales/mk/core.json"), enCore=json("locales/en/core.json");
assert(String(mkCore["institute.tools_hub.master_list.text"]||"").includes("250") && String(enCore["institute.tools_hub.master_list.text"]||"").includes("250"),"MK/EN Institute core locales use REV7 250 count");
assert(String(mkCore["institute.tools_hub.dois.text"]||"").includes("15 Working Papers") && String(enCore["institute.tools_hub.dois.text"]||"").includes("15 Working Papers"),"MK/EN Institute core locales use 15 Working Papers");
assert(String(mkCore["institute.tools_hub.dois.text"]||"").includes("9 Protocol Notes") && String(enCore["institute.tools_hub.dois.text"]||"").includes("9 Protocol Notes"),"MK/EN Institute core locales use 9 Protocol Notes");

const lang=json("data/language-activation.json");
for(const code of ["mk","en","fr","de"]){
  const route=lang.public_surface_routes?.opc2027?.[code];
  assert(!!route,"language registry has OPC2027 route for "+code);
  if(route){ const t=localTarget(route,"index.html"); assert(exists(t),"OPC2027 registered "+code+" route resolves to "+t); }
}

const agents=json("data/wpa-proactive-agent-fabric.json");
assert(Array.isArray(agents.agents) && agents.agents.length===5,"Proactive Agent Fabric has exactly five governed provider seats");
assert(agents.execution_policy?.provider_calls==="SERVER_SIDE_ONLY","Proactive Agent Fabric provider calls are server-side only");
assert(agents.execution_policy?.automatic_external_publication===false,"Proactive Agent Fabric cannot auto-publish externally");
assert(agents.human_gate?.HG4?.toLowerCase().includes("human"),"HG4 remains human-only");

for(const p of [
 "data/wpa-human-gate-policy.json","data/wpa-connected-vessels-system.json",
 "data/wpa-institute-functional-registry.json","data/wpa-canonical-version-manifest.json",
 "institute/daily/index.html","tools/institute-function-console/index.html",
 "tools/research-output-builder/index.html","tools/academic-search-hub/index.html",
 "tools/institutional-knowledge-harvester/index.html","media/index.html",
 "practitioner-lectures/index.html","aab-governance.html","wpa-metrics-status.html"
]) assert(exists(p),"critical WPA route/source exists: "+p);

console.log("\nWPA PUBLIC SURFACE AUDIT:",failures?"FAIL":"PASS","·",checks,"checks ·",failures,"failures");
process.exit(failures?1:0);

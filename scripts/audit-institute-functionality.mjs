#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const registry=JSON.parse(fs.readFileSync(path.join(root,"data/wpa-institute-functional-registry.json"),"utf8"));
const institute=fs.readFileSync(path.join(root,"institute.html"),"utf8");

function localTarget(route){
  if(!route || /^(https?:|mailto:|tel:)/i.test(route)) return null;
  let p=String(route).split("#")[0].split("?")[0].replace(/^\/+/, "");
  if(!p) p="index.html";
  if(p.endsWith("/")) p += "index.html";
  return p;
}

const errors=[];
const checked=new Set();

for(const section of registry.operational_sections||[]){
  if(!section.id) errors.push("registry entry missing id");
  if(!section.status) errors.push(`${section.id}: missing status`);
  if(!section.primary_action) errors.push(`${section.id}: missing primary_action`);
  if(!institute.includes(`id="${section.id}"`)) errors.push(`${section.id}: section not found in institute.html`);

  for(const route of [section.primary_action,...(section.secondary_actions||[])]){
    const p=localTarget(route);
    if(!p || checked.has(p)) continue;
    checked.add(p);
    const abs=path.join(root,p);
    if(!fs.existsSync(abs)) errors.push(`${section.id}: missing local route ${route} -> ${p}`);
  }
}

const requiredStrings=[
  '/tools/institute-function-console/',
  '/practitioner-lectures/',
  '/wpa-global-protocol-diplomacy-benchmark.html',
  '/aab-governance.html',
  '/protocolometry-center.html',
  '/tools/research-output-builder/',
  '/protocol-notes/',
  '/wpa-metrics-status.html'
];
for(const s of requiredStrings){
  if(!institute.includes(s)) errors.push(`Institute missing functional route: ${s}`);
}

if(institute.includes('href="#wpa-protocol-notes"')) errors.push("stale #wpa-protocol-notes anchor remains");

const allowedStatuses=new Set(["LIVE","LIMITED_PRODUCTION","GOVERNED_PREVIEW","BETA","FORMATION","FROZEN"]);
for(const section of registry.operational_sections||[]){
  if(!allowedStatuses.has(section.status)) errors.push(`${section.id}: unsupported status ${section.status}`);
}

const frozen=registry.frozen_capabilities||[];
for(const required of [
  "automatic payment collection",
  "official credential issuance without approved backend and Human Gate",
  "automatic journal acceptance or peer-review status",
  "automatic ordinal institutional ranking"
]){
  if(!frozen.includes(required)) errors.push(`missing frozen capability boundary: ${required}`);
}

if(errors.length){
  console.error("WPA Institute functional audit: FAIL");
  for(const e of errors) console.error("- "+e);
  process.exit(1);
}

console.log(`WPA Institute functional audit: PASS (${registry.operational_sections.length} operational sections; ${checked.size} local routes checked)`);

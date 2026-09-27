(function(){
"use strict";
const PUBLIC_BOUNDARY = [
  "WPA uses public or explicitly authorised sources only.",
  "No intelligence, surveillance, investigative or operational function.",
  "No login, paywall, CAPTCHA or access-control bypass.",
  "Do not claim that a source was read, fetched or verified unless the current workflow actually supplied or retrieved it.",
  "Institutional inclusion does not equal blanket permission to ingest or reproduce full text.",
  "For third-party protected material, prefer source-bounded facts, concise summaries, attributed short quotations and provenance-preserving knowledge atoms.",
  "Full-text processing is allowed only when access basis is OPEN_ACCESS, PUBLIC_DOMAIN, OPEN_LICENSE, AGREEMENT_ON_FILE or MANUALLY_AUTHORISED.",
  "No automatic publication, commercial activation, partnership, endorsement, accreditation or doctrine mutation.",
  "Human Gate remains authoritative for consequential use."
].join(" ");

const ESSENCE_CONTRACT = [
  "When working with an institution, PDF, paper, handbook, curriculum, report or policy, use this output contract:",
  "1) SOURCE IDENTITY — institution/author/title/year/URL or DOI/ISBN/ISSN if known.",
  "2) ACCESS BASIS — OPEN_ACCESS / OPEN_LICENSE / PUBLIC_DOMAIN / AGREEMENT_ON_FILE / MANUALLY_AUTHORISED / PUBLIC_ABSTRACT / OPEN_METADATA_ONLY / EXTERNAL_DISCOVERY_ONLY.",
  "3) CORE ESSENCE — concise WPA wording; do not copy substantial protected expression.",
  "4) EVIDENCE POINTS — each with page/section/locator when available.",
  "5) INSTITUTIONAL PRACTICE or SCHOLARLY FINDINGS — distinguish observed practice from research evidence.",
  "6) LIMITATIONS / CONTRADICTIONS / UNCERTAINTY.",
  "7) WPA REUSE CANDIDATES — Practice Atom or Scholarly Knowledge Atom, with provenance intact.",
  "8) HUMAN REVIEW STATE — PENDING unless an authorised human approves it.",
  "If a locator is unavailable, say so instead of inventing one."
].join("\n");

function appendGovernance(sys){
  return String(sys||"")+"\n\n[WPAWS INSTITUTIONAL KNOWLEDGE MANDATE]\n"+PUBLIC_BOUNDARY+"\n"+ESSENCE_CONTRACT;
}

function patchPrompts(){
  if(typeof window.buildSys==="function"){
    const old=window.buildSys;
    window.buildSys=function(agent){
      return appendGovernance(old.apply(this,arguments));
    };
  } else if(typeof buildSys==="function"){
    const old=buildSys;
    buildSys=function(agent){ return appendGovernance(old.apply(this,arguments)); };
    window.buildSys=buildSys;
  }

  if(typeof window.buildP==="function"){
    const old=window.buildP;
    window.buildP=function(agent,action){
      if(agent==="citations"){
        const t=(document.getElementById("ctTopic")||{}).value||"protocol and diplomacy";
        return "Build a VERIFIED bibliography candidate list for: "+t+
          "\nNever invent a finished citation. For each item require at least one checkable identifier or URL (DOI/ISBN/ISSN/publisher/repository URL). If you cannot verify metadata, label it CANDIDATE — VERIFICATION REQUIRED and do not fabricate missing fields. Prefer Crossref, OpenAlex, Semantic Scholar, Zenodo, DOAJ, OpenAIRE, CORE, PubMed, BASE, ERIC and official repositories.";
      }
      return old.apply(this,arguments);
    };
  } else if(typeof buildP==="function"){
    const old=buildP;
    buildP=function(agent,action){
      if(agent==="citations"){
        const t=(document.getElementById("ctTopic")||{}).value||"protocol and diplomacy";
        return "Build a VERIFIED bibliography candidate list for: "+t+
          "\nNever invent a finished citation. Require DOI/ISBN/ISSN or source URL. Unverified items must be labelled CANDIDATE — VERIFICATION REQUIRED.";
      }
      return old.apply(this,arguments);
    };
    window.buildP=buildP;
  }
}

function addKnowledgeCard(){
  if(document.getElementById("wpawsInstitutionalKnowledgeCard")) return;
  const target=document.querySelector(".main-col")||document.querySelector(".workspace")||document.body;
  const card=document.createElement("section");
  card.id="wpawsInstitutionalKnowledgeCard";
  card.className="card";
  card.style.cssText="border:1px solid var(--line);background:linear-gradient(135deg,rgba(200,168,75,.08),var(--surf));border-radius:12px;padding:16px;margin:0 0 14px";
  card.innerHTML='<div style="display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap">'+
    '<div><div style="font-size:11px;color:var(--gold);font-weight:800;letter-spacing:.08em">INSTITUTIONAL KNOWLEDGE WORKFLOW</div>'+
    '<h3 style="margin:5px 0 7px">🏛️ Академија/PDF/труд → Срцевина → WPA знаење</h3>'+
    '<p style="color:var(--muted);max-width:820px">WPAWS оркестрира анализа, семантика, цитати, рецензија и Mentor review над материјал кој прво минал rights/provenance gate. Непроверени извори остануваат candidates; Human Gate е задолжителен.</p></div>'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
    '<a class="tb-btn" style="color:var(--gold);border-color:var(--gold)" href="/tools/institutional-knowledge-harvester/">Open Harvester</a>'+
    '<a class="tb-btn" href="/tools/academic-search-hub/">Academic Search</a>'+
    '<a class="tb-btn" href="/data/wpa-global-institutional-knowledge-harvester.json">Directive</a>'+
    '</div></div>'+
    '<div style="margin-top:10px;font-size:11px;color:var(--dim)">Public-source / authorised-source only · No paywall bypass · No autonomous publication · No third-party full-text mirroring in public GitHub.</div>';
  target.insertBefore(card,target.firstChild);
}

function exposeContract(){
  window.WPAWS_INSTITUTIONAL_KNOWLEDGE={
    version:"11.1.7-IKH1",
    harvester:"/tools/institutional-knowledge-harvester/",
    directive:"/data/wpa-global-institutional-knowledge-harvester.json",
    evidence_protocol:"/data/institute-index/public-evidence-agent-protocol.md",
    scholarly_layer:"/data/wpa-global-scholarly-knowledge-layer.json",
    public_boundary:PUBLIC_BOUNDARY,
    output_contract:ESSENCE_CONTRACT,
    human_gate_required:true
  };
}

document.addEventListener("DOMContentLoaded",function(){
  patchPrompts();
  addKnowledgeCard();
  exposeContract();
});
})();
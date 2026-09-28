(()=>{"use strict";const LIVE="https://wpa-live-production-bridge.worldprotocolacademy.workers.dev";const SCOPE={protocol:["protocol","ceremon","precedence","flag","anthem","state visit","official visit","etiquette"],diplomacy:["diplom","embassy","ambassador","foreign ministry","mfa","summit","bilateral","multilateral"],public_relations:["public relations"," pr ","press release","spokesperson","reputation","crisis communication","media relations"],security:["security","defence","defense","interpol","europol","frontex","cyber","intelligence","police","military","nato"],communicology:["communication","media literacy","disinformation","strategic communication","public communication","journalism"]};const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));function safeHttpUrl(value){try{const u=new URL(String(value||""));return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return""}}function validateVisualForApproval(v){const missing=[];const mode=String(v?.mode||"");const strip=String(v?.source_strip||"").trim();const stripLower=strip.toLowerCase();const parts=strip.split("·").map(x=>x.trim()).filter(Boolean);const placeholder=!strip||stripLower.includes("verify publisher")||stripLower.includes("publisher/author")||stripLower.includes("{publisher")||stripLower.includes("replace source");const publisherOk=parts.length>1&&parts[1].length>=2&&!/^(publisher|author|source|video|archive|архива|wpa news)$/i.test(parts[1]);const hasOriginal=/original source/i.test(strip);const hasOfficial=/official embed/i.test(strip);const thirdPartyModes=new Set(["OFFICIAL_EMBED","LICENSED_OR_PERMISSION","ARCHIVE_RIGHTS_CONFIRMED"]);const ownOrSyntheticModes=new Set(["WPA_OWNED","AI_GENERATED_ILLUSTRATION"]);if(thirdPartyModes.has(mode)){if(!safeHttpUrl(v.source_url))missing.push("third-party visual source URL");if(placeholder)missing.push("verified visual source strip")}if(mode==="OFFICIAL_EMBED"){if(parts[0]?.toUpperCase()!=="VIDEO"||!publisherOk||!(hasOfficial||hasOriginal))missing.push("complete VIDEO attribution")}if(mode==="LICENSED_OR_PERMISSION"){if(parts[0]?.toUpperCase()!=="SOURCE"||!publisherOk||!hasOriginal)missing.push("complete SOURCE attribution")}if(mode==="ARCHIVE_RIGHTS_CONFIRMED"){if(!/(ARCHIVE|АРХИВА)/i.test(parts[0]||"")||!publisherOk||!hasOriginal)missing.push("complete ARCHIVE attribution")}if(mode==="AI_GENERATED_ILLUSTRATION"){const labelOk=/(AI[- ]GENERATED|ГЕНЕРИРАНА СО AI)/i.test(parts[0]||"");const ownerOk=parts.slice(1).some(x=>/^(WPA NEWS|WORLD PROTOCOL ACADEMY)$/i.test(x));if(!labelOk||!ownerOk)missing.push("complete AI visual attribution")}if(mode==="WPA_OWNED"){if(parts[0]?.toUpperCase()!=="WPA NEWS"||!parts.slice(1).some(x=>/WORLD PROTOCOL ACADEMY/i.test(x)))missing.push("complete WPA-owned attribution")}if(ownOrSyntheticModes.has(mode)&&placeholder)missing.push("visual label/source strip");if(mode==="NO_THIRD_PARTY_VISUAL"&&v.source_url)missing.push("visual mode/source mismatch");if(v.source_url&&!safeHttpUrl(v.source_url))missing.push("safe visual source URL");if(!v.rights_verified)missing.push("visual rights/source-strip check");return missing}let catalog=[],items=[];function classify(t){t=(" "+String(t||"").toLowerCase()+" ");return Object.entries(SCOPE).filter(([k,ws])=>ws.some(w=>t.includes(w))).map(x=>x[0])}function roleFor(url){try{let host=new URL(url).hostname.replace(/^www\./,"");let s=catalog.find(x=>{try{return new URL(x.official_url).hostname.replace(/^www\./,"")===host}catch{return false}});return s?s.family:"PUBLIC_SOURCE"}catch{return"PUBLIC_SOURCE"}}function statusFor(url){try{let host=new URL(url).hostname.replace(/^www\./,"");let s=catalog.find(x=>{try{return new URL(x.official_url).hostname.replace(/^www\./,"")===host}catch{return false}});return s?s.status:"UNREGISTERED_SOURCE"}catch{return"UNREGISTERED_SOURCE"}}function normalize(x){let title=x.title||x.headline||x.name||"Untitled";let summary=x.summary||x.description||x.excerpt||"";let url=safeHttpUrl(x.url||x.link||x.source_url||"");let source=x.source||x.publisher||x.source_name||"";let domains=classify(title+" "+summary+" "+source);return{title,summary,url,source,date:x.published_at||x.pubDate||x.date||"",domains,role:roleFor(url),status:statusFor(url)}}async function load(){try{catalog=(await fetch("/media/data/source-catalog.json",{cache:"no-store"}).then(r=>r.json())).sources||[]}catch{};let raw=[];try{let r=await fetch(LIVE+"/api/v1/lab-cache?limit=150",{cache:"no-store"});let j=await r.json();raw=Array.isArray(j)?j:(j.items||j.results||j.data||[])}catch(e){}items=raw.map(normalize).filter(x=>x.domains.length);render();$("#liveStatus").textContent=raw.length?"LIVE INTAKE":"LIVE API UNAVAILABLE";$("#liveCount").textContent=raw.length;$("#scopeCount").textContent=items.length;$("#sourceCount").textContent=catalog.length}function render(){let q=$("#q").value.toLowerCase(),dom=$("#domain").value,role=$("#role").value;let out=items.filter(x=>(!q||(x.title+" "+x.summary+" "+x.source).toLowerCase().includes(q))&&(!dom||x.domains.includes(dom))&&(!role||x.role===role));$("#shownCount").textContent=out.length;$("#feed").innerHTML=out.slice(0,60).map((x,i)=>`<article class="item"><div class="meta"><span class="badge ok">${esc(x.domains.join(" · "))}</span><span class="badge">${esc(x.role)}</span><span class="badge ${x.status==="VERIFIED_OFFICIAL"?"ok":"warn"}">${esc(x.status)}</span><span>${esc(x.source)}</span></div><h3>${esc(x.title)}</h3><div class="muted">${esc((x.summary||"").slice(0,360))}</div><div class="actions"><button class="btn" data-prepare="${i}">Подготви Brief</button>${x.url?`<a class="btn" target="_blank" rel="noopener" href="${esc(x.url)}">Original source</a>`:""}</div></article>`).join("")||'<div class="panel muted">Нема кандидати за избраниот филтер.</div>';$("#feed").querySelectorAll("[data-prepare]").forEach((b,idx)=>b.onclick=()=>prepare(out[idx]))}function prepare(x){let attributed=`${x.source?"Според "+x.source+", ":""}${x.title}.`;let strip="";let draft={created_at:new Date().toISOString(),scope:x.domains,source:{name:x.source,url:x.url,role:x.role,verification:x.status,human_verified:false},source_reported:attributed,wpa_observation:"[Внеси само видлив/проверлив протоколарен, дипломатски, PR, безбедносен или комуниколошки факт.]",wpa_analysis:"[WPA анализа — јасно одделена од изворното известување.]",presenter_script:`П: ${attributed}\nД: WPA ја разгледува темата само во рамките на ${x.domains.join(", ")}.\nП: [WPA observation]\nД: [WPA analysis]`,visual:{source_url:"",mode:"NO_THIRD_PARTY_VISUAL",source_strip:strip,rights_verified:false},editorial_checks:{facts_analysis_separated:false,sensitive_context:false},human_gate:"DRAFT_NOT_APPROVED"};localStorage.setItem("wpa.media.v15.daily.draft",JSON.stringify(draft));$("#sourceText").value=draft.source_reported;$("#obs").value=draft.wpa_observation;$("#analysis").value=draft.wpa_analysis;$("#script").value=draft.presenter_script;$("#visualSource").value="";$("#visualMode").value="NO_THIRD_PARTY_VISUAL";$("#sourceStrip").value=strip;$("#sourceVerified").checked=false;$("#rightsVerified").checked=false;$("#separationVerified").checked=false;$("#sensitiveContext").checked=false;window.dispatchEvent(new CustomEvent("wpa:media-brief-prepared"));$("#gateState").textContent="DRAFT · NOT APPROVED";location.hash="gate"}function decision(v){let d;try{d=JSON.parse(localStorage.getItem("wpa.media.v15.daily.draft")||"{}")}catch{d={}};d.source_reported=$("#sourceText").value;d.wpa_observation=$("#obs").value;d.wpa_analysis=$("#analysis").value;d.presenter_script=$("#script").value;d.source=d.source||{};d.source.human_verified=!!$("#sourceVerified").checked;d.visual={source_url:$("#visualSource").value.trim(),mode:$("#visualMode").value,source_strip:$("#sourceStrip").value.trim(),rights_verified:!!$("#rightsVerified").checked};d.editorial_checks={facts_analysis_separated:!!$("#separationVerified").checked,sensitive_context:!!$("#sensitiveContext").checked};if(v==="APPROVED"){const missing=[];if(!safeHttpUrl(d.source?.url))missing.push("safe original source URL");if(!d.source.human_verified)missing.push("source verification");missing.push(...validateVisualForApproval(d.visual));if(!d.editorial_checks.facts_analysis_separated)missing.push("source/WPA separation");if(!d.presenter_script.trim())missing.push("presenter script");if(missing.length){$("#gateState").textContent="HOLD · "+missing.join(" · ");$("#gateState").className="badge bad";return}}d.human_gate=v;d.decided_at=new Date().toISOString();localStorage.setItem(v==="APPROVED"?"wpa.media.v15.daily.approved":"wpa.media.v15.daily.draft",JSON.stringify(d));$("#gateState").textContent=v;$("#gateState").className="badge "+(v==="APPROVED"?"ok":v==="REJECTED"?"bad":"warn")}function exportManifest(){let s=localStorage.getItem("wpa.media.v15.daily.approved")||localStorage.getItem("wpa.media.v15.daily.draft")||"{}";let b=new Blob([s],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="wpa-daily-brief-manifest.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}["q","domain","role"].forEach(id=>$("#"+id).addEventListener(id==="q"?"input":"change",render));$("#approve").onclick=()=>decision("APPROVED");$("#revise").onclick=()=>decision("REVISION_REQUIRED");$("#reject").onclick=()=>decision("REJECTED");$("#export").onclick=exportManifest;if("serviceWorker"in navigator)navigator.serviceWorker.register("/media/sw.js",{scope:"/media/"}).catch(()=>{});load()})();
;(()=>{"use strict";
const $=s=>document.querySelector(s);
let languagePolicy=null,supportPolicy=null,visualPolicy=null,launchPolicy=null,supportTimer=null,activeSensitiveContext=false;const DEFAULT_SUPPORT_NOTICE="Лајкови, platform-native gifts и доброволна поддршка се прикажуваат дискретно и не ја прекинуваат емисијата.";function setSensitiveContext(value){activeSensitiveContext=!!value;return activeSensitiveContext}function getSensitiveContext(){return activeSensitiveContext}function resetSupportNotice(){const el=$("#supportNotice");if(!el)return;clearTimeout(supportTimer);supportTimer=null;el.textContent=DEFAULT_SUPPORT_NOTICE;el.className="support-notice"}
async function json(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw new Error(String(r.status));return r.json()}
function languageStatus(code){
  const state=$("#languageState"),cfg=languagePolicy?.languages?.[code];
  if(!state||!cfg)return;
  const voiceReady=String(cfg.voice_status||"").includes("READY")||String(cfg.voice_status||"").includes("LOCKED");
  const qa=cfg.translation_status||"UNKNOWN";
  state.textContent=voiceReady
    ? cfg.label+" · говор + титлови + transcript · "+qa
    : cfg.label+" · voice track не е активиран · "+qa+" · нема автоматски fallback";
  state.className="statusline "+(voiceReady?"":"muted");
}
function selectLanguage(code){
  const cfg=languagePolicy?.languages?.[code];if(!cfg)return;
  localStorage.setItem("wpa.media.broadcast.language",code);
  languageStatus(code);
  window.dispatchEvent(new CustomEvent("wpa:media-language-change",{detail:{
    language:code,locale:cfg.locale,script_version:"HUMAN_APPROVED_CURRENT",
    speech_required:!!cfg.speech_required,captions_required:!!cfg.captions_required
  }}));
}
function supportMessage(d){
  if(d?.sensitive_context)return null;
  if(d?.consent_to_public_acknowledgement){
    const bits=[d.public_name,d.public_country].filter(Boolean);
    if(bits.length)return "Благодариме за поддршката · "+bits.join(" · ");
  }
  return supportPolicy?.display?.default_text_mk||"Благодариме за поддршката.";
}
function showSupport(d={}){
  const el=$("#supportNotice");if(!el)return;
  clearTimeout(supportTimer);
  const msg=supportMessage({...d,sensitive_context:!!d.sensitive_context||getSensitiveContext()});
  if(!msg){el.textContent="Поддршката е тивко исклучена за чувствителна содржина.";el.className="support-notice is-muted";return}
  el.textContent=msg;el.className="support-notice is-live";
  const ms=Math.max(1000,Math.min(4000,(supportPolicy?.display?.max_visible_seconds||4)*1000));
  supportTimer=setTimeout(()=>{el.textContent="Поддршка од заедницата · дискретен режим";el.className="support-notice"},ms);
}
async function init(){
  const sensitive=$("#sensitiveContext");
  if(sensitive){
    const syncSensitive=()=>{const active=setSensitiveContext(sensitive.checked);if(active)showSupport({sensitive_context:true});else resetSupportNotice()};
    sensitive.addEventListener("change",syncSensitive);
    syncSensitive();
  }
  window.addEventListener("wpa:media-brief-prepared",()=>{setSensitiveContext(false);if(sensitive)sensitive.checked=false;resetSupportNotice()});
  window.addEventListener("wpa:community-support-event",e=>showSupport(e.detail||{}));
  try{languagePolicy=await json("/media/data/language-audio-policy.json")}catch{}
  try{supportPolicy=await json("/media/data/community-support-policy.json")}catch{}
  try{visualPolicy=await json("/media/data/visual-rights-policy.json")}catch{}
  try{launchPolicy=await json("/media/data/morning-launch.json")}catch{}
  const launch=$("#launchState");
  if(launch&&launchPolicy){
    launch.textContent=launchPolicy.status+" · "+launchPolicy.launch_local_time+" · "+launchPolicy.edition_label;
    launch.className="badge ok";
  }
  const visual=$("#visualPolicyState");
  if(visual){
    visual.textContent=visualPolicy?"VISUAL RIGHTS POLICY READY":"VISUAL POLICY UNAVAILABLE";
    visual.className="badge "+(visualPolicy?"ok":"warn");
  }
  const sel=$("#broadcastLanguage");
  if(sel&&languagePolicy){
    const saved=localStorage.getItem("wpa.media.broadcast.language");
    if(saved&&languagePolicy.languages?.[saved])sel.value=saved;
    selectLanguage(sel.value);
    sel.addEventListener("change",()=>selectLanguage(sel.value));
  }
  const badge=$("#supportPolicyState");
  if(badge){
    badge.textContent=supportPolicy?"DISCREET MODE":"POLICY UNAVAILABLE";
    badge.className="badge "+(supportPolicy?"ok":"warn");
  }
}
init();
})();
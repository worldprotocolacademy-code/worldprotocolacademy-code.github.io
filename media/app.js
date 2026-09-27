(()=>{"use strict";const LIVE="https://wpa-live-production-bridge.worldprotocolacademy.workers.dev";const SCOPE={protocol:["protocol","ceremon","precedence","flag","anthem","state visit","official visit","etiquette"],diplomacy:["diplom","embassy","ambassador","foreign ministry","mfa","summit","bilateral","multilateral"],public_relations:["public relations"," pr ","press release","spokesperson","reputation","crisis communication","media relations"],security:["security","defence","defense","interpol","europol","frontex","cyber","intelligence","police","military","nato"],communicology:["communication","media literacy","disinformation","strategic communication","public communication","journalism"]};const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));let catalog=[],items=[];function classify(t){t=(" "+String(t||"").toLowerCase()+" ");return Object.entries(SCOPE).filter(([k,ws])=>ws.some(w=>t.includes(w))).map(x=>x[0])}function roleFor(url){try{let host=new URL(url).hostname.replace(/^www\./,"");let s=catalog.find(x=>{try{return new URL(x.official_url).hostname.replace(/^www\./,"")===host}catch{return false}});return s?s.family:"PUBLIC_SOURCE"}catch{return"PUBLIC_SOURCE"}}function statusFor(url){try{let host=new URL(url).hostname.replace(/^www\./,"");let s=catalog.find(x=>{try{return new URL(x.official_url).hostname.replace(/^www\./,"")===host}catch{return false}});return s?s.status:"UNREGISTERED_SOURCE"}catch{return"UNREGISTERED_SOURCE"}}function normalize(x){let title=x.title||x.headline||x.name||"Untitled";let summary=x.summary||x.description||x.excerpt||"";let url=x.url||x.link||x.source_url||"";let source=x.source||x.publisher||x.source_name||"";let domains=classify(title+" "+summary+" "+source);return{title,summary,url,source,date:x.published_at||x.pubDate||x.date||"",domains,role:roleFor(url),status:statusFor(url)}}async function load(){try{catalog=(await fetch("/media/data/source-catalog.json",{cache:"no-store"}).then(r=>r.json())).sources||[]}catch{};let raw=[];try{let r=await fetch(LIVE+"/api/v1/lab-cache?limit=150",{cache:"no-store"});let j=await r.json();raw=Array.isArray(j)?j:(j.items||j.results||j.data||[])}catch(e){}items=raw.map(normalize).filter(x=>x.domains.length);render();$("#liveStatus").textContent=raw.length?"LIVE INTAKE":"LIVE API UNAVAILABLE";$("#liveCount").textContent=raw.length;$("#scopeCount").textContent=items.length;$("#sourceCount").textContent=catalog.length}function render(){let q=$("#q").value.toLowerCase(),dom=$("#domain").value,role=$("#role").value;let out=items.filter(x=>(!q||(x.title+" "+x.summary+" "+x.source).toLowerCase().includes(q))&&(!dom||x.domains.includes(dom))&&(!role||x.role===role));$("#shownCount").textContent=out.length;$("#feed").innerHTML=out.slice(0,60).map((x,i)=>`<article class="item"><div class="meta"><span class="badge ok">${esc(x.domains.join(" · "))}</span><span class="badge">${esc(x.role)}</span><span class="badge ${x.status==="VERIFIED_OFFICIAL"?"ok":"warn"}">${esc(x.status)}</span><span>${esc(x.source)}</span></div><h3>${esc(x.title)}</h3><div class="muted">${esc((x.summary||"").slice(0,360))}</div><div class="actions"><button class="btn" data-prepare="${i}">Подготви Brief</button>${x.url?`<a class="btn" target="_blank" rel="noopener" href="${esc(x.url)}">Original source</a>`:""}</div></article>`).join("")||'<div class="panel muted">Нема кандидати за избраниот филтер.</div>';$("#feed").querySelectorAll("[data-prepare]").forEach((b,idx)=>b.onclick=()=>prepare(out[idx]))}function prepare(x){let attributed=`${x.source?"Според "+x.source+", ":""}${x.title}.`;let draft={created_at:new Date().toISOString(),scope:x.domains,source:{name:x.source,url:x.url,role:x.role,verification:x.status},source_reported:attributed,wpa_observation:"[Внеси само видлив/проверлив протоколарен, дипломатски, PR, безбедносен или комуниколошки факт.]",wpa_analysis:"[WPA анализа — јасно одделена од изворното известување.]",presenter_script:`П: ${attributed}\nД: WPA ја разгледува темата само во рамките на ${x.domains.join(", ")}.\nП: [WPA observation]\nД: [WPA analysis]`,human_gate:"DRAFT_NOT_APPROVED"};localStorage.setItem("wpa.media.v15.daily.draft",JSON.stringify(draft));$("#sourceText").value=draft.source_reported;$("#obs").value=draft.wpa_observation;$("#analysis").value=draft.wpa_analysis;$("#script").value=draft.presenter_script;$("#gateState").textContent="DRAFT · NOT APPROVED";location.hash="gate"}function decision(v){let d;try{d=JSON.parse(localStorage.getItem("wpa.media.v15.daily.draft")||"{}")}catch{d={}};d.source_reported=$("#sourceText").value;d.wpa_observation=$("#obs").value;d.wpa_analysis=$("#analysis").value;d.presenter_script=$("#script").value;d.human_gate=v;d.decided_at=new Date().toISOString();localStorage.setItem(v==="APPROVED"?"wpa.media.v15.daily.approved":"wpa.media.v15.daily.draft",JSON.stringify(d));$("#gateState").textContent=v;$("#gateState").className="badge "+(v==="APPROVED"?"ok":v==="REJECTED"?"bad":"warn")}function exportManifest(){let s=localStorage.getItem("wpa.media.v15.daily.approved")||localStorage.getItem("wpa.media.v15.daily.draft")||"{}";let b=new Blob([s],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="wpa-daily-brief-manifest.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}["q","domain","role"].forEach(id=>$("#"+id).addEventListener(id==="q"?"input":"change",render));$("#approve").onclick=()=>decision("APPROVED");$("#revise").onclick=()=>decision("REVISION_REQUIRED");$("#reject").onclick=()=>decision("REJECTED");$("#export").onclick=exportManifest;if("serviceWorker"in navigator)navigator.serviceWorker.register("/media/sw.js",{scope:"/media/"}).catch(()=>{});load()})();
;(()=>{"use strict";
const $=s=>document.querySelector(s);
let languagePolicy=null,supportPolicy=null,visualPolicy=null,launchPolicy=null,supportTimer=null;
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
  const msg=supportMessage(d);
  if(!msg){el.textContent="Поддршката е тивко исклучена за чувствителна содржина.";el.className="support-notice is-muted";return}
  el.textContent=msg;el.className="support-notice is-live";
  const ms=Math.max(1000,Math.min(4000,(supportPolicy?.display?.max_visible_seconds||4)*1000));
  supportTimer=setTimeout(()=>{el.textContent="Поддршка од заедницата · дискретен режим";el.className="support-notice"},ms);
}
async function init(){
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
  window.addEventListener("wpa:community-support-event",e=>showSupport(e.detail||{}));
}
init();
})();
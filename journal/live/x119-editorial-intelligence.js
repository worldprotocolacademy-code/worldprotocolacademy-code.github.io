/* WPA Journal Live X11.9.1 — isolated editorial runtime hardening. */
(() => {
  "use strict";
  if (window.WPA_X119_LOADED) return;
  window.WPA_X119_LOADED = true;

  const VERSION = "X11.9.1";
  const API_RE = /\/api\/v1\/(live|ticker)$/;
  const EVENT_WINDOW = 48 * 60 * 60 * 1000;
  const nativeFetch = window.fetch.bind(window);
  const state = {
    live: [], ticker: [], review: [], hold: [],
    stats: { input: 0, published: 0, sports: 0, culture: 0, clusters: 0, multiSource: 0, held: 0, adjusted: 0 }
  };

  const STOP = new Set("the and for from with into over under after before says said new latest live update report reports reported about amid their this that these those will would could should have has had were was are its his her they them who what when where why how video photos interview statement announces announced media today yesterday monday tuesday wednesday thursday friday saturday sunday или но за од со во на кај по пред после вели изјави нова ново нови најново извештај ова тоа".split(" "));
  const GENERIC_ENTITIES = new Set(["united states","european union","united nations","middle east","foreign ministry","security council","prime minister","foreign minister","world cup","news agency","press conference","government of","domestic bulgaria","bulgaria update","local institutions"]);

  function norm(value) {
    return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[\u2018\u2019\u201c\u201d]/g, "'").replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/gi, " ")
      .trim().replace(/\s+/g, " ");
  }
  function clamp(value) { return Math.max(0, Math.min(100, Number(value) || 0)); }
  function text(item) {
    return norm([item?.title,item?.summary,item?.description,item?.body,item?.source,item?.source_type,item?.country,item?.region,item?.primary_category,...(item?.signals||[])].filter(Boolean).join(" "));
  }
  function source(item) { return String(item?.source || "Unknown source").trim() || "Unknown source"; }
  function sourceKey(item) {
    return norm(source(item)).replace(/\b(the|news|agency|press|service|network|international|including|incl|government|ministry|mfa)\b/g," ").replace(/\s+/g," ").trim() || norm(source(item));
  }
  function time(value) { const n = new Date(value || "").getTime(); return Number.isFinite(n) ? n : 0; }
  function officialActor(t) {
    return /\b(government|ministry|minister|president|prime minister|parliament|embassy|foreign ministry|state department|united nations|european union|nato|osce|council of europe|влада|министерство|министер|претседател|премиер|парламент|амбасада|обединети нации|европска унија|нато|обсе)\b/i.test(t);
  }
  function policyAction(t) {
    return /\b(boycott|sanction|visa policy|diplomatic protest|official protest|bilateral agreement|cultural agreement|memorandum|state policy|government statement|ministerial statement|peace initiative|ceasefire|human rights|accession talks|intergovernmental conference|official exchange programme|бојкот|санкци|визна политика|дипломатски протест|официјален протест|билатерален договор|културен договор|меморандум|државна политика|владина изјава|министерска изјава|мировна иницијатива|примирје|човекови права|пристапни преговори)\b/i.test(t);
  }

  function isSportsNoise(item) {
    if (item?.sports_diplomacy === true || item?.live_include === true) return false;
    const t = text(item);
    if (officialActor(t) && policyAction(t)) return false;
    const domain = /\b(athletics|track and field|swimming|marathon|football|soccer|basketball|baseball|tennis|rugby|cricket|hockey|boxing|mma|ufc|wrestling|formula 1|grand prix|olympic|world cup|championship|tournament|league|playoff|match|fixture|race|athlete|swimmer|competitor|атлетика|пливање|маратон|фудбал|кошарка|тенис|рагби|бокс|олимписки|светско првенство|шампионат|турнир|лига|натпревар|трка|спортист)\b/i.test(t);
    const result = /\b(medal|medals|gold|silver|bronze|winner|victory|champion|score|results|standings|qualification|competitors|races|amateur|u20|u21|u23|500 m|1000 m|медал|медали|злато|сребро|бронза|победник|победа|шампион|резултат|табела|квалификаци|натпреварувачи)\b/i.test(t);
    return domain && result;
  }

  function isCultureNoise(item) {
    if (item?.cultural_diplomacy === true || item?.live_include === true) return false;
    const t = text(item);
    const official = /\b(government|ministry of culture|foreign ministry|embassy|consulate|cultural institute|unesco|european union|bilateral commission|влада|министерство за култура|министерство за надворешни|амбасада|конзулат|културен институт|унеско|европска унија|билатерална комисија)\b/i.test(t);
    const action = /\b(cultural agreement|cultural cooperation|cultural exchange|official cultural programme|state visit|bilateral year of culture|heritage protection agreement|intergovernmental programme|културен договор|културна соработка|културна размена|официјална културна програма|државна посета|заштита на наследство|меѓувладина програма)\b/i.test(t);
    if (official && action) return false;
    return /\b(theatre|theater|play|concert|festival|tour|premiere|singer|celebrity|actor|actress|film|cinema|music|opera|ballet|dance|exhibition|painting|gallery|museum|art retreat|fashion|standing ovation|performance|drama|literary|book fair|showbiz|entertainment|театар|претстава|концерт|фестивал|турнеја|премиера|пејач|актер|актерка|филм|кино|музика|опера|балет|танц|изложба|сликарство|галерија|музеј|мода|аплауз|изведба|драма|литератур|саем на книга|забава|естрада)\b/i.test(t);
  }

  function isInternational(item) {
    return /\b(united nations|security council|nato|european union|osce|council of europe|bilateral|multilateral|foreign minister|foreign ministry|embassy|accession|sanction|cross border|international|global|обединети нации|совет за безбедност|нато|европска унија|обсе|билатерал|мултилатерал|министер за надворешни|амбасада|пристапување|санкци|меѓународ)\b/i.test(text(item));
  }
  function calibrate(raw, count) {
    const item = {...(raw || {})};
    const t = text(item), original = clamp(item.relevance_score), s = norm(source(item));
    const bta = /\bbta\b|bulgarian telegraph agency/.test(s);
    const domestic = bta && /\bbulgaria|bulgarian|софија|бугарија|бугарски\b/.test(t) && !isInternational(item);
    let adjusted = original, reason = "";
    if (/\bmedia review|observances|daily roundup|morning headlines|morning update|медиумски преглед\b/i.test(t)) { adjusted = Math.min(adjusted, 62); reason = "routine roundup"; }
    else if (domestic && /\bparty leader|presidential candidate|opposition|education minister|local protest|municipality|party assembly|minister interview|road safety|пензи|образование|парти|кандидат|опозици|општина\b/i.test(t)) { adjusted = Math.min(adjusted, 72); reason = "single-country domestic wire"; }
    else if (/\bopinion|commentary|analysis|column|editorial|submitted by\b/i.test(t) && !/official|government|mfa|international_organization|justice|court/i.test(String(item.source_type || ""))) { adjusted = Math.min(adjusted, 78); reason = "commentary / analysis"; }
    else if (domestic) { adjusted = Math.min(adjusted, 82); reason = "domestic wire calibration"; }
    if (adjusted < original) {
      item.wpa_original_relevance_score = original;
      item.relevance_score = adjusted;
      item.wpa_relevance_adjustment = {version:VERSION, reason, original, adjusted, note:"Source confidence is unchanged."};
      if (count) state.stats.adjusted++;
    }
    return item;
  }

  function tokens(value, max = 60) {
    const out = new Set();
    for (const token of norm(value).split(" ")) {
      if (token.length < 4 || STOP.has(token) || /^\d+$/.test(token)) continue;
      out.add(token.replace(/(ation|ition|ments|ment|ingly|edly|ing|ers|ies|ied|ed|es|s)$/i, ""));
      if (out.size >= max) break;
    }
    return out;
  }
  function intersection(a,b) { let n=0; for (const value of a) if (b.has(value)) n++; return n; }
  function overlap(a,b) { return a.size && b.size ? intersection(a,b) / Math.min(a.size,b.size) : 0; }
  function entities(item) {
    const result = new Set();
    const matches = [item?.title,item?.summary].filter(Boolean).join(". ").match(/\b(?:[A-Z][a-zA-Z'’-]{2,}|[A-Z]{2,})(?:\s+(?:[A-Z][a-zA-Z'’-]{2,}|[A-Z]{2,})){1,3}\b/g) || [];
    for (const match of matches) { const value=norm(match); if(value && !GENERIC_ENTITIES.has(value)) result.add(value); }
    return result;
  }
  function related(a,b) {
    const ta=time(a?.published_at), tb=time(b?.published_at);
    if (!ta || !tb || Math.abs(ta-tb) > EVENT_WINDOW) return false;
    if (a?.original_url && b?.original_url && norm(a.original_url) === norm(b.original_url)) return true;
    const A=tokens(a?.title,30), B=tokens(b?.title,30), shared=intersection(A,B), ratio=overlap(A,B);
    let entity=false; const EA=entities(a), EB=entities(b); for (const value of EA) if (EB.has(value)) { entity=true; break; }
    if (entity && shared >= 2) return true;
    if (sourceKey(a) === sourceKey(b) && shared >= 3 && ratio >= .34) return true;
    if (sourceKey(a) !== sourceKey(b) && shared >= 4 && ratio >= .42) return true;
    const X=tokens(`${a?.title||""} ${a?.summary||""}`), Y=tokens(`${b?.title||""} ${b?.summary||""}`);
    return entity && intersection(X,Y) >= 4 && overlap(X,Y) >= .28;
  }
  function cluster(items, count) {
    const list = (items || []).slice(), parent=list.map((_,i)=>i);
    const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
    const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
    for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++) if(related(list[i],list[j])) join(i,j);
    const groups=new Map(); list.forEach((item,i)=>{const root=find(i);(groups.get(root)||groups.set(root,[]).get(root)).push(item);});
    const output=[];
    for(const group of groups.values()) {
      group.sort((a,b)=>(clamp(b.source_confidence)+clamp(b.relevance_score))-(clamp(a.source_confidence)+clamp(a.relevance_score))||time(b.published_at)-time(a.published_at));
      const representative={...group[0]}, sources=[...new Set(group.map(source))];
      if(group.length>1) {
        representative.wpa_event_cluster={version:VERSION,window_hours:48,article_count:group.length,source_count:sources.length,sources,articles:group.map(x=>({id:x.id||"",title:x.title||"Без наслов",source:source(x),original_url:x.original_url||"",published_at:x.published_at||""})),boundary:"Related coverage candidate; not automatic factual confirmation."};
        representative.wpa_story_cluster={id:`event-${norm(representative.title).slice(0,48).replace(/ /g,"-")}`,size:group.length,sources,method:"event-level title/body/entity clustering",authoritative:false};
        if(count){state.stats.clusters++;if(sources.length>1)state.stats.multiSource++;}
      }
      output.push(representative);
    }
    return output;
  }
  function priority(item) { return .62*clamp(item.relevance_score)+.28*clamp(item.source_confidence)+Math.max(0,10-Math.max(0,(Date.now()-time(item.published_at))/3600000)/16); }
  function diversity(items) {
    const cap=Math.max(5,Math.min(14,Math.ceil(items.length*.18))), counts=new Map(), keep=[], hold=[];
    for(const item of items.slice().sort((a,b)=>priority(b)-priority(a))) {
      const key=sourceKey(item), n=counts.get(key)||0;
      if(n>=cap) hold.push({...item,wpa_diversity_hold_reason:`Source package cap ${cap}`});
      else {counts.set(key,n+1);keep.push(item);}
    }
    state.hold=hold; state.stats.held=hold.length; return keep;
  }
  function processItems(items, kind) {
    if(kind === "live") {
      state.review=[]; state.hold=[];
      state.stats={input:(items||[]).length,published:0,sports:0,culture:0,clusters:0,multiSource:0,held:0,adjusted:0};
    }
    const kept=[];
    for(const raw of items || []) {
      if(isSportsNoise(raw)){if(kind==="live")state.stats.sports++;continue;}
      if(isCultureNoise(raw)){if(kind==="live"){state.review.push({...raw,wpa_review_reason:"culture / entertainment"});state.stats.culture++;}continue;}
      kept.push(calibrate(raw,kind==="live"));
    }
    let output=cluster(kept,kind==="live");
    if(kind==="live")output=diversity(output);
    output.sort((a,b)=>priority(b)-priority(a));
    if(kind==="live"){state.live=output;state.stats.published=output.length;}else state.ticker=output.slice(0,40);
    return output;
  }
  function jsonResponse(response,payload){const headers=new Headers(response.headers);headers.set("content-type","application/json; charset=utf-8");headers.delete("content-length");headers.delete("content-encoding");return new Response(JSON.stringify(payload),{status:response.status,statusText:response.statusText,headers});}

  window.fetch=async(input,init)=>{
    const response=await nativeFetch(input,init); if(!response.ok)return response;
    let kind=""; try{kind=new URL(typeof input==="string"?input:input?.url,location.href).pathname.match(API_RE)?.[1]||"";}catch{return response;}
    if(!kind)return response;
    try{
      const payload=await response.clone().json(); if(!Array.isArray(payload?.items))return response;
      payload.items=processItems(payload.items,kind);
      payload.wpa_x119_editorial_intelligence={version:VERSION,event_window_hours:48,source_cap_share:.18,stats:{...state.stats},boundary:"Editorial prioritisation and clustering do not verify facts; original sources remain authoritative."};
      scheduleUi(); return jsonResponse(response,payload);
    }catch(error){console.warn("WPA X11.9.1 returned the unmodified payload",error);return response;}
  };

  function ensureStyle(){if(document.getElementById("wpaX119Style"))return;const style=document.createElement("style");style.id="wpaX119Style";style.textContent='.x119-summary{margin:7px 0;color:var(--gold);font-size:.74rem}.x119-panels{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0}.x119-panel{border:1px solid rgba(212,166,74,.22);border-radius:10px;background:rgba(255,255,255,.025)}.x119-panel summary{cursor:pointer;padding:8px 10px;color:var(--gold);font-size:.76rem;font-weight:900}.x119-list{max-height:240px;overflow:auto;padding:0 10px 9px}.x119-row{padding:6px 0;border-top:1px solid rgba(255,255,255,.07);font-size:.74rem}.x119-row b{display:block;color:var(--paper)}.x119-row small{color:var(--muted)}.tag.x119-event{color:#f0ca64;background:rgba(212,166,74,.12)}.tag.x119-lang{color:#bcd7ff;background:rgba(96,165,250,.1)}.tag.x119-r{color:#ffd4a8;background:rgba(251,146,60,.11)}@media(max-width:760px){.x119-panels{grid-template-columns:1fr}}';document.head.append(style);}
  function panel(title,items,note){const d=document.createElement("details"),s=document.createElement("summary"),list=document.createElement("div");d.className="x119-panel";s.textContent=`${title} · ${items.length}`;list.className="x119-list";const intro=document.createElement("p");intro.textContent=note;intro.style.color="var(--muted)";list.append(intro);for(const item of items.slice(0,40)){const row=document.createElement("div"),b=document.createElement("b"),small=document.createElement("small");row.className="x119-row";b.textContent=item.title||"Без наслов";small.textContent=`${source(item)} · ${item.wpa_review_reason||item.wpa_diversity_hold_reason||"review"}`;row.append(b,small);list.append(row);}d.append(s,list);return d;}
  function decorate(){
    ensureStyle(); const summary=document.getElementById("feedSummary"); if(!summary)return;
    let line=document.getElementById("wpaX119Summary");if(!line){line=document.createElement("div");line.id="wpaX119Summary";line.className="x119-summary";summary.insertAdjacentElement("afterend",line);}
    line.textContent=`${VERSION} Editorial Guard · ${state.stats.sports} sports · ${state.stats.culture} culture review · ${state.stats.clusters} event clusters · ${state.stats.multiSource} multi-source · ${state.stats.held} diversity hold · ${state.stats.adjusted} R-калибрации`;
    let panels=document.getElementById("wpaX119Panels");if(!panels){panels=document.createElement("div");panels.id="wpaX119Panels";panels.className="x119-panels";line.insertAdjacentElement("afterend",panels);}panels.replaceChildren(panel("Classification Review",state.review,"Култура/забава е издвоена за човечка класификација."),panel("Diversity Hold",state.hold,"Вишокот од доминантен извор не е избришан."));
    const byTitle=new Map();for(const item of state.live){const key=norm(item.title);(byTitle.get(key)||byTitle.set(key,[]).get(key)).push(item);}const used=new Map();
    document.querySelectorAll("#newsGrid > .card").forEach(card=>{const key=norm(card.querySelector("h3")?.textContent),i=used.get(key)||0,item=byTitle.get(key)?.[i];used.set(key,i+1);if(!item)return;const tags=card.querySelector(".tags");if(tags&&item.wpa_event_cluster&&!tags.querySelector(".x119-event")){const badge=document.createElement("span");badge.className="tag x119-event";badge.textContent=`${item.wpa_event_cluster.article_count} записи · ${item.wpa_event_cluster.source_count} извори`;badge.title="48-часовен event cluster; не е автоматска потврда.";tags.append(badge);}const language=norm(item.language);if(tags&&language&&!/^(en|eng|mk|mkd)$/.test(language)&&!tags.querySelector(".x119-lang")){const badge=document.createElement("span");badge.className="tag x119-lang";badge.textContent=language.slice(0,5).toUpperCase();tags.append(badge);}if(tags&&item.wpa_relevance_adjustment&&!tags.querySelector(".x119-r")){const badge=document.createElement("span");badge.className="tag x119-r";badge.textContent=`R ${item.wpa_relevance_adjustment.original}→${item.wpa_relevance_adjustment.adjusted}`;badge.title=item.wpa_relevance_adjustment.reason;tags.append(badge);}const srcNode=card.querySelector(".card-body > .meta span:first-child");if(srcNode&&/^dw\b/i.test(srcNode.textContent||""))srcNode.title="DW — Deutsche Welle";});
    window.WPA_X119_STATE={version:VERSION,...state.stats,classificationReview:state.review.length,diversityHold:state.hold.length};
  }
  let uiTimer=0;function scheduleUi(){clearTimeout(uiTimer);uiTimer=setTimeout(decorate,80);setTimeout(decorate,500);setTimeout(decorate,1200);}
  function start(){document.addEventListener("wpa:x118:data",scheduleUi);scheduleUi();}

  if(Array.isArray(window.WPA_LIVE_DEMO_DATA?.items)){window.WPA_LIVE_DEMO_DATA.items=processItems(window.WPA_LIVE_DEMO_DATA.items,"live");window.WPA_LIVE_DEMO_DATA.total=window.WPA_LIVE_DEMO_DATA.items.length;}
  window.WPA_X119={version:VERSION,state,processItems,isSportsNoise,isCultureEntertainment:isCultureNoise,relatedEvent:related,clusterEvents:cluster,applySourceDiversity:diversity};
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();

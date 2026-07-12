(() => {
  const api = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  const $ = (id) => document.getElementById(id);
  let offset = 0; const limit = 200; let total = 0;
  const safe = (value) => { try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch { return ""; } };
  const node = (tag, cls, value) => { const n = document.createElement(tag); if (cls) n.className = cls; if (value != null) n.textContent = String(value); return n; };
  const fmt = (value) => { const d = new Date(value || ""); return Number.isFinite(d.getTime()) ? d.toLocaleString("mk-MK", {dateStyle:"medium",timeStyle:"short"}) : "—"; };
  const healthLabel = (value) => ({ok:"Healthy",empty:"Empty feed",unknown:"Unverified",pending:"Pending",error:"Error",degraded:"Degraded",quarantine:"Quarantine",duplicate:"Duplicate"})[String(value || "unknown")] || String(value || "unknown");
  function query() { const p = new URLSearchParams({limit:String(limit), offset:String(offset)}); for (const id of ["q","status","category","region"]) { const value=$(id).value; if (value && value!=="all") p.set(id,value); } return p.toString(); }
  function stats(rows) {
    const host=$("stats"); host.replaceChildren();
    const counts={enabled:0,ok:0,empty:0,unknown:0,pending:0,error:0,degraded:0,quarantine:0,duplicate:0};
    rows.forEach((source)=>{ if(source.active) counts.enabled++; const key=String(source.health_status||"unknown"); counts[key]=(counts[key]||0)+1; });
    for (const key of ["enabled","ok","empty","unknown","pending","error","degraded","quarantine","duplicate"]) {
      const d=node("div",`stat ${key}`); d.append(node("b","",counts[key]||0),document.createTextNode(` ${key}`)); host.append(d);
    }
    const t=node("div","stat"); t.append(node("b","",total),document.createTextNode(" total matches")); host.append(t);
  }
  function render(data) {
    total=Number(data.total||0); const rows=Array.isArray(data.sources)?data.sources:[]; stats(rows);
    const grid=$("grid"); grid.replaceChildren();
    if(!rows.length){grid.append(node("div","message","Нема извори за тековните филтри."));return;}
    const regions=[...new Set(rows.map((x)=>x.region).filter(Boolean))]; const sel=$("region"),current=sel.value;
    for(const region of regions.sort()){if(![...sel.options].some((o)=>o.value===region))sel.add(new Option(region,region));} sel.value=[...sel.options].some((o)=>o.value===current)?current:"all";
    for(const source of rows){
      const card=node("article","card"); card.append(node("h2","",source.name));
      const chips=node("div","chips");
      chips.append(node("span",`chip ${source.active?"active":"disabled"}`,source.active?"collector enabled":"collector disabled"));
      chips.append(node("span",`chip ${source.health_status||"unknown"}`,healthLabel(source.health_status)));
      chips.append(node("span","chip",source.category),node("span","chip",source.region||"unknown"),node("span","chip",`P${source.priority_tier}`));
      card.append(chips,node("div","url",source.url));
      card.append(node("div","url",`${source.country||""}${source.source_type_desc?` · ${source.source_type_desc}`:""}`));
      card.append(node("div","health-meta",`Последна проверка: ${fmt(source.last_checked_at)} · Последен успех: ${fmt(source.last_success_at)} · HTTP: ${source.last_http_status ?? "—"} · Грешки: ${source.failure_count ?? 0}`));
      if(source.health_status==="quarantine") card.append(node("div","quarantine-note",`Quarantine: ${source.quarantine_reason||"manual review required"}`));
      const actions=node("div","actions"),open=node("a","","Open"); open.href=safe(source.url)||"#"; open.target="_blank"; open.rel="noopener noreferrer";
      const copy=node("button","","Copy URL"); copy.onclick=()=>navigator.clipboard?.writeText(source.url); actions.append(open,copy); card.append(actions); grid.append(card);
    }
    $("page").textContent=`${offset+1}–${Math.min(offset+limit,total)} / ${total}`; $("prev").disabled=offset===0; $("next").disabled=offset+limit>=total;
  }
  async function load(){if(!api||api.includes("REPLACE_WITH_")){ $("grid").replaceChildren(node("div","message","Live API URL не е конфигуриран.")); return; } try{const r=await fetch(`${api}/api/v1/sources?${query()}`,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);render(await r.json());}catch(error){$("grid").replaceChildren(node("div","message",`API error: ${error.message}`));}}
  ["q","status","category","region"].forEach((id)=>$(id).addEventListener("change",()=>{offset=0;load();}));
  $("q").addEventListener("input",()=>{clearTimeout(window.__wpaDirTimer);window.__wpaDirTimer=setTimeout(()=>{offset=0;load();},350);});
  $("reload").onclick=load; $("prev").onclick=()=>{offset=Math.max(0,offset-limit);load();}; $("next").onclick=()=>{if(offset+limit<total){offset+=limit;load();}}; load();
})();

"use strict";
/* WPA Protocol Living Lab v0.1 — read-only, deterministic educational simulation.
   No accounts, analytics, server submissions, cookies, local storage or AI API calls. */
(() => {
  const $ = (id) => document.getElementById(id);
  const dimensions = ["norms", "evidence", "coordination", "human_gate"];
  const names = {
    mk: {norms:"Применливи правила",evidence:"Докази",coordination:"Координација",human_gate:"Human Gate"},
    en: {norms:"Applicable norms",evidence:"Evidence",coordination:"Coordination",human_gate:"Human Gate"}
  };
  const statusCopy = {
    mk: {event:"Документиран настан",practice:"Документирана практика",source:"Официјален извор",question:"Наставно прашање",noCases:"Нема случаи за избраниот филтер.",select:"Одбери еден одговор.",confirm:"Потврди одговор",next:"Следна одлука",finish:"Прикажи резултат",restart:"Започни повторно",export:"Преземи резултат (.txt)",score:"Педагошка повратна информација",unit:"од 100 наставни поени",fiction:"ИЗМИСЛЕНО СЦЕНАРИО",noSim:"Избери сценарио за почеток.",based:"Референтни извори",report:"Не е професионална квалификација, научно валидирано мерење или институционална одлука.",caseCount:"прикажани случаи",evidence:"Изворно-доказна врска",cases:"поврзани записи"},
    en: {event:"Documented event",practice:"Documented practice",source:"Official source",question:"Teaching question",noCases:"No cases match the filters.",select:"Select one answer.",confirm:"Confirm answer",next:"Next decision",finish:"Show result",restart:"Restart",export:"Download result (.txt)",score:"Pedagogical feedback",unit:"out of 100 teaching points",fiction:"FICTIONAL EXERCISE",noSim:"Choose a scenario to begin.",based:"Reference sources",report:"Not a professional qualification, scientifically validated measurement or institutional decision.",caseCount:"cases shown",evidence:"Source-evidence connection",cases:"linked entries"}
  };
  const state = {lang:"mk",catalogue:null,scenarios:null,scenario:null,step:0,locked:false,total:[0,0,0,0],responses:[]};

  function tx(mk,en){return state.lang === "mk" ? mk : en;}
  function t(key){return statusCopy[state.lang][key];}
  function textNode(tag,txt,cls){
    const el=document.createElement(tag);
    if(cls)el.className=cls;
    el.textContent=String(txt);
    return el;
  }
  function link(url,label){
    const a=textNode("a",label);
    try {
      const u=new URL(url);
      if(u.protocol!=="https:" || !["www.royal.uk","www.un.org","legal.un.org","www.olympics.com"].includes(u.hostname)) {
        a.textContent="Source unavailable / Извор недостапен"; return a;
      }
      a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";
    } catch {
      a.textContent="Source unavailable / Извор недостапен";
    }
    return a;
  }
  function clear(id){$(id).replaceChildren();}
  async function loadJSON(name) {
    const res=await fetch("./"+name,{cache:"no-cache",credentials:"omit"});
    if(!res.ok)throw new Error(name+": HTTP "+res.status);
    return res.json();
  }
  function renderAtlas(){
    if(!state.catalogue)return;
    const term=$("case-search").value.trim().toLocaleLowerCase();
    const kind=$("case-kind").value;
    const cat=$("case-category").value;
    const filtered=state.catalogue.cases.filter(c=>{
      if(kind!=="all"&&c.kind!==kind)return false;
      if(cat!=="all"&&c.category!==cat)return false;
      const hay=[c.id,c.title_mk,c.title_en,c.fact_mk,c.fact_en,c.category].join(" ").toLocaleLowerCase();
      return !term||hay.includes(term);
    });
    $("case-count").textContent=filtered.length+" "+t("caseCount");
    const fragment=document.createDocumentFragment();
    if(filtered.length===0)fragment.append(textNode("p",t("noCases")));
    for(const c of filtered){
      const card=document.createElement("article");card.className="card";
      card.append(textNode("div",c.id+" · "+(c.kind==="DOCUMENTED_EVENT"?t("event"):t("practice")),"meta"));
      card.append(textNode("h3",tx(c.title_mk,c.title_en)));
      if(c.date)card.append(textNode("div",c.date,"meta"));
      card.append(textNode("p",tx(c.fact_mk,c.fact_en)));
      card.append(textNode("p",t("question")+": "+tx(c.question_mk,c.question_en),"prompt"));
      const sources=document.createElement("div");sources.className="sources";
      for(const id of c.source_ids){
        const source=state.catalogue.sources.find(s=>s.id===id);
        if(source)sources.append(link(source.url,t("source")+": "+source.issuer));
      }
      card.append(sources);fragment.append(card);
    }
    $("case-grid").replaceChildren(fragment);
  }
  function applyLanguage(){
    document.documentElement.lang=state.lang;
    for(const el of document.querySelectorAll("[data-mk][data-en]")){
      if(el.id==="sim-question")continue;
      el.textContent=el.getAttribute("data-"+state.lang);
    }
    $("language-toggle").textContent=state.lang==="mk"?"EN":"МК";
    $("language-toggle").setAttribute("aria-label",state.lang==="mk"?"Switch to English":"Промени на македонски");
    renderAtlas();renderScenarioButtons();renderEvidence();
    if(state.scenario){
      if(state.step>=state.scenario.steps.length)renderResult();
      else if(state.locked)renderLockedStep();
      else renderStep();
    }else{
      $("sim-question").textContent=t("noSim");
    }
  }
  function renderScenarioButtons(){
    if(!state.scenarios)return;
    clear("scenario-buttons");
    for(const scenario of state.scenarios.scenarios){
      const btn=textNode("button",tx(scenario.title_mk,scenario.title_en));
      btn.type="button";
      btn.setAttribute("aria-pressed",String(state.scenario?.id===scenario.id));
      btn.addEventListener("click",()=>startScenario(scenario.id));
      $("scenario-buttons").append(btn);
    }
  }
  function startScenario(id){
    const s=state.scenarios.scenarios.find(row=>row.id===id);
    if(!s)return;
    state.scenario=s;state.step=0;state.total=[0,0,0,0];state.responses=[];state.locked=false;
    $("sim-error").textContent="";
    renderScenarioButtons();renderStep();
  }
  function renderStep(){
    if(!state.scenario)return;
    const s=state.scenario;
    if(state.step>=s.steps.length){renderResult();return;}
    const step=s.steps[state.step];
    $("sim-result").classList.add("hidden");
    $("sim-result").replaceChildren();
    $("sim-feedback").classList.add("hidden");
    $("sim-feedback").replaceChildren();
    $("sim-error").textContent="";
    $("sim-progress").textContent=t("fiction")+" · "+(state.step+1)+" / "+s.steps.length;
    $("sim-question").textContent=tx(step.prompt_mk,step.prompt_en);
    const field=document.createElement("fieldset");
    field.append(textNode("legend",t("select")));
    for(const opt of step.choices){
      const label=document.createElement("label");label.className="option";
      const input=document.createElement("input");
      input.type="radio";input.name="decision";input.value=opt.id;input.required=true;
      label.append(input,textNode("span",tx(opt.mk,opt.en)));field.append(label);
    }
    $("sim-choices").replaceChildren(field);
    clear("sim-actions");
    const confirm=textNode("button",t("confirm"));confirm.type="button";
    confirm.addEventListener("click",confirmDecision);
    $("sim-actions").append(confirm);
  }
  function confirmDecision(){
    if(!state.scenario||state.locked)return;
    const selected=document.querySelector('input[name="decision"]:checked');
    if(!selected){$("sim-error").textContent=t("select");return;}
    const step=state.scenario.steps[state.step];
    const opt=step.choices.find(x=>x.id===selected.value);
    if(!opt)return;
    for(let i=0;i<dimensions.length;i++)state.total[i]+=opt.score[i];
    state.responses.push({step:step.id,choice:opt.id,score:[...opt.score],feedback_mk:opt.feedback_mk,feedback_en:opt.feedback_en,prompt_mk:step.prompt_mk,prompt_en:step.prompt_en,choice_mk:opt.mk,choice_en:opt.en});
    state.locked=true;
    renderLockedStep();
  }
  function renderLockedStep(){
    if(!state.scenario||!state.locked)return;
    const step=state.scenario.steps[state.step];
    const prev=state.responses[state.responses.length-1];
    $("sim-progress").textContent=t("fiction")+" · "+(state.step+1)+" / "+state.scenario.steps.length;
    $("sim-question").textContent=tx(step.prompt_mk,step.prompt_en);
    const field=document.createElement("fieldset");
    field.append(textNode("legend",t("select")));
    for(const opt of step.choices){
      const label=document.createElement("label");label.className="option";
      const input=document.createElement("input");input.type="radio";input.name="decision";input.value=opt.id;input.disabled=true;input.checked=opt.id===prev.choice;
      label.append(input,textNode("span",tx(opt.mk,opt.en)));field.append(label);
    }
    $("sim-choices").replaceChildren(field);
    $("sim-error").textContent="";
    $("sim-feedback").classList.remove("hidden");
    $("sim-feedback").replaceChildren(textNode("strong",tx(prev.feedback_mk,prev.feedback_en)));
    clear("sim-actions");
    const btn=textNode("button",state.step+1===state.scenario.steps.length?t("finish"):t("next"));
    btn.type="button";
    btn.addEventListener("click",()=>{state.step++;state.locked=false;renderStep();});
    $("sim-actions").append(btn);
  }
  function renderResult(){
    const s=state.scenario;if(!s)return;
    $("sim-progress").textContent=t("score");
    $("sim-question").textContent=tx(s.title_mk,s.title_en);
    clear("sim-choices");clear("sim-feedback");$("sim-feedback").classList.add("hidden");
    $("sim-result").classList.remove("hidden");clear("sim-result");clear("sim-actions");
    const max=4*s.steps.length;
    const sum=state.total.reduce((a,b)=>a+b,0);
    const totalPct=Math.round(100*sum/(4*max));
    $("sim-result").append(textNode("h3",t("score")+": "+totalPct+" / 100"));
    $("sim-result").append(textNode("p",t("report")));
    const grid=document.createElement("div");grid.className="metrics";
    for(let i=0;i<dimensions.length;i++){
      const block=document.createElement("div");block.className="metric";
      block.append(textNode("b",Math.round(100*state.total[i]/max)+"%"));
      block.append(textNode("span",names[state.lang][dimensions[i]]));
      grid.append(block);
    }
    $("sim-result").append(grid);
    $("sim-result").append(textNode("h4",t("based")));
    for(const sourceId of s.source_ids){
      const src=state.catalogue.sources.find(x=>x.id===sourceId);
      if(src){
        const p=document.createElement("p");p.append(link(src.url,src.name));$("sim-result").append(p);
      }
    }
    const restart=textNode("button",t("restart"));restart.type="button";restart.className="ghost";
    restart.addEventListener("click",()=>startScenario(s.id));
    const download=textNode("button",t("export"));download.type="button";
    download.addEventListener("click",downloadResult);
    $("sim-actions").append(restart,download);
  }
  function downloadResult(){
    const s=state.scenario;if(!s||state.responses.length!==s.steps.length)return;
    const max=4*s.steps.length;
    const overall=Math.round(100*state.total.reduce((a,b)=>a+b,0)/(4*max));
    const lines=[
      "WPA Protocol Living Lab v0.1 | SYNTHETIC PEDAGOGICAL EXERCISE",
      "Scenario: "+s.title_en+" / "+s.title_mk,
      "Generated locally: "+new Date().toISOString(),
      "Pedagogical feedback: "+overall+"/100 (not a credential or validated psychometric score)",
      ...dimensions.map((d,i)=>d+": "+Math.round(100*state.total[i]/max)+"%"),
      "",
      ...state.responses.flatMap((x,i)=>[String(i+1)+". "+x.prompt_en,"Choice: "+x.choice_en,"Feedback: "+x.feedback_en,""]),
      "Sources:",
      ...s.source_ids.flatMap(id=>state.catalogue.sources.filter(x=>x.id===id).map(x=>x.url)),
      "",
      "No data has been sent to WPA or a third-party service.",
      "Human Gate remains controlling."
    ];
    const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="WPA_Living_Lab_"+s.id+"_pilot.txt";
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function renderEvidence(){
    if(!state.catalogue)return;
    const selected=$("graph-source").value;
    const sources=state.catalogue.sources.filter(s=>selected==="all"||s.id===selected);
    const frag=document.createDocumentFragment();
    for(const src of sources){
      const cases=state.catalogue.cases.filter(c=>c.source_ids.includes(src.id));
      const box=document.createElement("article");box.className="evidence-row";
      box.append(textNode("strong",src.name));
      box.append(textNode("small",src.class+" · "+cases.length+" "+t("cases")));
      const linkRow=document.createElement("p");linkRow.append(link(src.url,src.url));box.append(linkRow);
      for(const c of cases){
        const p=textNode("p",c.id+" → "+tx(c.title_mk,c.title_en));p.className="fine";box.append(p);
      }
      frag.append(box);
    }
    $("evidence-list").replaceChildren(frag);
  }
  function initGraphSourceSelect(){
    const select=$("graph-source");
    for(const s of state.catalogue.sources){
      const o=document.createElement("option");o.value=s.id;o.textContent=s.issuer;select.append(o);
    }
    select.addEventListener("change",renderEvidence);
  }
  async function init(){
    $("language-toggle").addEventListener("click",()=>{state.lang=state.lang==="mk"?"en":"mk";applyLanguage();});
    for(const id of ["case-search","case-kind","case-category"]){
      $(id).addEventListener(id==="case-search"?"input":"change",renderAtlas);
    }
    try{
      const [catalogue,scenarios]=await Promise.all([loadJSON("cases.json"),loadJSON("scenarios.json")]);
      if(!Array.isArray(catalogue.cases)||!Array.isArray(catalogue.sources)||!Array.isArray(scenarios.scenarios))throw new Error("Invalid input data");
      state.catalogue=catalogue;state.scenarios=scenarios;
      initGraphSourceSelect();applyLanguage();renderScenarioButtons();
      $("status").textContent=tx("Наставниот пилот е подготвен за локална употреба без регистрација.","Educational pilot ready for local use without registration.");
    }catch(err){
      $("status").textContent=tx("Не може да се вчитаат податоците: ", "Could not load data: ")+String(err?.message||err);
      $("case-grid").replaceChildren(textNode("p",tx("Податоците привремено не се достапни.","Data is temporarily unavailable.")));
      $("evidence-list").replaceChildren(textNode("p",tx("Доказните врски не се достапни.","Evidence links unavailable.")));
      $("sim-question").textContent=tx("Симулациите не се достапни.","Simulations unavailable.");
    }
  }
  document.addEventListener("DOMContentLoaded",init);
})();

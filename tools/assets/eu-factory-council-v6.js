/* EU Application Factory Multi-AI Council v6 · read-only public manifest.
 * NEVER imply paid external providers were invoked; credential state is not exposed to browsers.
 */
(function(){
  'use strict';
  var base='/data/eu-application-factory/';
  function add(el,tag,text,cls){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;el.appendChild(n);return n;}
  function link(el,url,text){if(!/^https:\/\//i.test(url||''))return;var a=add(el,'a',text,'eu-council-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
  function renderRegistry(obj){
    var root=document.getElementById('euCouncilProviders');if(!root)return;
    root.textContent='';
    var data=(obj&&obj.providers)||[];
    data.forEach(function(p){
      var card=add(root,'div',undefined,'eu-council-card');
      add(card,'strong',p.label||p.id);
      add(card,'p',p.role||'','eu-council-note');
      var label=p.integrationStatus==='LICENSE_REQUIRED'?'Лиценциран пристап — неповрзан':p.integrationStatus==='SOURCE_ONLY'?'Официјален извор — не е ВИ-модел':'API-адаптер · врската не е потврдена';
      add(card,'small',label,'eu-council-state');
    });
    var summary=document.getElementById('euCouncilSummary');
    if(summary){summary.textContent='13 предвидени улоги · 0 јавно потврдени live API-врски · '+(obj.updated||'непознат датум')+'. Овој регистар не е health-check на приватниот сервер.';}
  }
  function renderEvidence(obj){
    var root=document.getElementById('euCouncilEvidence');if(!root)return;
    root.textContent='';
    add(root,'p','Рачно проверен јавен изворен пакет од '+String(obj.verifiedAsOf||'?')+'. Ова не е повик проверен во реално време.','eu-council-note');
    (obj.sources||[]).forEach(function(s){
      var card=add(root,'div',undefined,'eu-evidence-card');
      add(card,'strong',s.title||s.id);
      add(card,'p',s.assessment||'Непроверен','eu-council-note');
      var small=add(card,'small','Подобност: '+(s.eligibility||'НЕПОТВРДЕНО')+(s.deadline?' · Рок: '+s.deadline:''),'eu-council-state');
      small.style.display='block';
      link(card,s.officialUrl,'Официјален извор ↗');
    });
    add(root,'p','Финално поднесување, правен апликант, партнерски и финансиски обврски: Human Gate.','eu-council-note');
  }
  async function boot(){
    if(!document.getElementById('euCouncilProviders'))return;
    try{
      var results=await Promise.all([
        fetch(base+'provider-council-v1.json',{cache:'no-store'}),
        fetch(base+'priority0-evidence-2026-11-15.json',{cache:'no-store'})
      ]);
      if(results.some(function(r){return !r.ok;}))throw new Error('source_unavailable');
      var contents=await Promise.all(results.map(function(r){return r.json();}));
      renderRegistry(contents[0]);renderEvidence(contents[1]);
    }catch(e){
      var summary=document.getElementById('euCouncilSummary');
      if(summary)summary.textContent='Регистарот е привремено недостапен. Не се тврди активна AI API-врска.';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
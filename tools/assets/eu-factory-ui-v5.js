/* EU Application Factory v5 public UI. No Virtual Sande handoff.
 * Browser-side deterministic grants workbench backed by a dated official-source index. */
(function(){
  'use strict';
  var Core=window.WPAEUFactoryCore;
  var registry=null,analysis=null,dossier=null,projectSourceText='',projectSourceFile='';
  var PATH='/data/eu-application-factory/opportunities-v1.json';
  var STORAGE='wpa-eu-factory-v5-draft';
  var STEP_NAMES=[['RADAR','Регистар'],['ELIGIBILITY','Правни услови'],['TIMELINE','Рокови'],['MATCH','Соодветност'],['DESIGN','Структура'],['WRITE','Досие'],['RED TEAM','Блокатори'],['HUMAN','Човечка порта']];
  var $=function(id){return document.getElementById(id);};
  var esc=function(v){return String(v===null||v===undefined?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
  var show=function(id){$(id).classList.remove('hidden');};
  var message=function(id,s,error){$(id).textContent=s;$(id).classList.toggle('error',!!error);};
  function sourceLink(url,label){if(!/^https:\/\//i.test(url||''))return '<span class="caption">Официјален линк: непотврден</span>';return '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label||'Официјален извор')+' ↗</a>';}
  function download(name,contents,mime){
    var objectUrl=URL.createObjectURL(new Blob([contents],{type:mime+';charset=utf-8'}));
    var anchor=document.createElement('a');anchor.href=objectUrl;anchor.download=name;document.body.appendChild(anchor);anchor.click();
    window.setTimeout(function(){URL.revokeObjectURL(objectUrl);anchor.remove();},1000);
  }
  function statusUI(code){var map={
    'NO_GO_TIMING':['НЕПОДОБНО ПО РОК','block'],'NO_GO':['NO-GO','block'],'BLOCKED':['БЛОКИРАНО','block'],
    'WATCH':['СЛЕДИ / ВЕРИФИЦИРАЈ','warn'],'CONDITIONAL':['УСЛОВНО / НЕПОТВРДЕНО','warn']
  };return map[code]||['НЕПОТВРДЕНО','warn'];}
  function renderSteps(active){
    $('agentFlow').innerHTML=STEP_NAMES.map(function(s,i){var cl=!analysis?'':i<7?'done':'warning';if(active==='missing'&&i>0)cl='';
      return '<span class="step '+cl+'">'+esc(s[0])+' · '+esc(s[1])+'</span>';}).join('');
  }
  function snapshotNote(){
    if(!registry)return 'Нема локален регистар. Анализа не е извршена.';
    var verified=registry.verifiedAsOf||'НЕПОТВРДЕНО';
    var age=Math.floor((new Date().getTime()-new Date(verified+'T00:00:00Z').getTime())/86400000);
    var stale=Number.isFinite(age)&&age>14?' ИЗВОРОТ Е ПОСТАР ОД 14 ДЕНА — не користете статус „отворен“ без повторна проверка.':'';
    return 'Официјален изворен snapshot: '+verified+'. Нема live EU API проверка за време на оваа сесија.'+stale;
  }
  function readForm(){
    return {idea:$('idea').value.trim(),sourceText:projectSourceText,sourceFileName:projectSourceFile,
      country:'North Macedonia',legalApplicant:$('legalApplicant').value.trim(),legalType:$('legalType').value,
      startDate:$('startDate').value,endDate:$('endDate').value,consortiumCountries:$('consortiumCountries').value.trim(),
      customCall:$('customCall').value.trim(),customCallUrl:$('customCallUrl').value.trim()};
  }
  function renderMatch(candidate,index){
    var opp=candidate.opportunity,gate=candidate.gate,st=statusUI(gate.status),fit=candidate.fit;
    var flags=gate.blockers.slice(0,3).map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    var limit=gate.conditions.slice(0,2).map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    var notes=flags||limit?'<ul>'+flags+limit+'</ul>':'<p class="caption">Треба проверка на оригиналниот повик.</p>';
    var canBuild=opp.status==='DISCOVERY_ONLY'?false:true;
    return '<article class="match" data-recommended="'+(index===0?'true':'false')+'">'+
      '<div class="match-top"><span class="pill '+st[1]+'">'+esc(st[0])+'</span><div class="fit"><span>'+fit.score+'</span><div class="fit-label">ориентациски fit /100</div></div></div>'+
      '<h3>'+esc(opp.programme)+' — '+esc(opp.title)+'</h3>'+
      '<small>'+esc(opp.callId)+' · '+esc(opp.status)+' · извор '+esc(opp.verifiedAsOf||'непроверен')+'</small>'+
      '<p class="caption">'+esc(opp.eligibilityRule||'')+'</p>'+notes+
      '<div class="links">'+sourceLink(opp.officialUrl,'Официјален извор')+(opp.rulesUrl?' · '+sourceLink(opp.rulesUrl,'Програмски правила'):'')+'</div>'+
      '<button type="button" class="btn '+(index===0?'primary':'light')+' small" data-build="'+esc(opp.id)+'" '+(canBuild?'':'disabled')+'>Изгради работно досие</button>'+
      '</article>';
  }
  function renderResults(){
    if(!analysis)return;
    var data=analysis,project=data.project;
    var featured=data.candidates.slice(0,6);
    $('resultsTitle').textContent='Резултати за: '+project.title;
    $('runLead').textContent='Извлечени теми: '+(project.tags.length?project.tags.join(' · '):'потребна е поточна содржина')+' · '+snapshotNote();
    renderSteps();
    var timing=project.startDate?'<div class="call-alert"><strong>Календар:</strong> '+esc(project.startDate)+' до '+esc(project.endDate||'непотврдено')+'. Рокот за повикот и датумот на почеток на грантот не се исто. Сите несоодветни патеки се означени.</div>':'';
    var legal=project.legalApplicant?'<div class="call-alert"><strong>Проверка на апликант:</strong> '+esc(project.legalApplicant)+' е внесен како кандидат. Правната подобност останува НЕПОТВРДЕНА додека нема документи.</div>':'<div class="call-alert"><strong>Клучна пречка:</strong> не е потврдено правно лице-апликант. Рангирањето не ја надминува оваа пречка.</div>';
    var conclusion=project.id==='conference'?'<div class="call-alert"><strong>Ohrid 2027:</strong> рангирањето не значи дека објавените ЕУ повици можат да ја финансираат конференцијата во пролет 2027. За таа временска рамка посебно разгледај спонзорства и договорни извори; TAIEX само за одвоена јавна институционална задача.</div>':'';
    $('results').innerHTML='<div class="status-summary"><span class="pill block">ELIGIBILITY — НЕПОТВРДЕНО</span><span class="pill warn">Снимка на извори '+esc(data.sourceVerifiedAsOf)+'</span></div>'+timing+legal+conclusion+
      '<div class="results-grid">'+featured.map(renderMatch).join('')+'</div>'+ 
      '<div class="human-gate"><strong>Human Gate:</strong> финално поднесување, правни изјави, финансиски обврски и договори со партнери не се автоматизираат. Сите генерирани документи имаат статус DRAFT.</div>';
    $('results').querySelectorAll('[data-build]').forEach(function(b){b.addEventListener('click',function(){build(b.getAttribute('data-build'),true);});});
    var trace={version:Core.VERSION,sourcePolicy:registry.sourcePolicy,sourceVerifiedAsOf:registry.verifiedAsOf,project:{title:project.title,tags:project.tags,legalApplicant:project.legalApplicant,startDate:project.startDate,endDate:project.endDate,kind:project.id},
      matches:data.candidates.map(function(c){return {id:c.opportunity.id,callId:c.opportunity.callId,source:c.opportunity.officialUrl,sourceDate:c.opportunity.verifiedAsOf,status:c.gate.status,score:c.fit.score,blockers:c.gate.blockers,conditions:c.gate.conditions};})};
    $('trace').textContent=JSON.stringify(trace,null,2);
  }
  function build(id,scroll){
    if(!analysis)return;
    dossier=Core.createDossier(analysis,id);
    $('dossierText').textContent=dossier.markdown;
    show('dossierPanel');
    message('exportStatus','Досието е изработено како работен нацрт. Може веднаш да се преземе.',false);
    if(scroll)$('dossierPanel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function analyzeNow(){
    message('formMessage','');
    if(!Core){message('formMessage','Не е вчитано аналитичкото јадро. Освежете ја страницата.',true);return;}
    if(!registry){try{await loadRegistry();}catch(e){message('formMessage','Не можам да го вчитам датираниот регистар на повици: '+e.message,true);return;}}
    var input=readForm();
    if(!input.idea&&!input.sourceText){message('formMessage','Опиши го проектот со барем една реченица или прикачи документ.',true);$('idea').focus();return;}
    if(input.customCallUrl&&!/^https:\/\//i.test(input.customCallUrl)){message('formMessage','Линкот кон повикот треба да започнува со https://',true);return;}
    var project=Core.parseProject(input);
    analysis=Core.analyze(project,registry,new Date().toISOString().slice(0,10));
    if(analysis.error){message('formMessage',analysis.error,true);return;}
    message('formMessage','Анализата е завршена — резултатите и досието се подготвени подолу.');
    renderResults();
    // Real, immediate deliverable: produce a draft dossier automatically, no handoff to a bot.
    build(analysis.candidates[0].opportunity.id,false);
    $('resultsPanel').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function loadRegistry(){
    var res=await fetch(PATH,{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    var json=await res.json();
    if(json.schema!=='wpa-eu-application-factory-opportunity-index-v1'||!Array.isArray(json.opportunities)||json.opportunities.length<2)throw new Error('Несоодветен регистар');
    registry=json;
    return json;
  }
  async function ingestFile(file){
    if(!file)return;
    projectSourceText='';projectSourceFile='';
    if(file.size>1_500_000){message('fileStatus','Датотеката е преголема (макс. 1.5 MB).',true);return;}
    if(/\.pdf$/i.test(file.name)){message('fileStatus','PDF не се чита автоматски во оваа верзија; експортирај TXT/HTML или залепи текст.',true);return;}
    if(!/\.(txt|md|html?|json|csv)$/i.test(file.name)){message('fileStatus','Поддржани се само TXT, MD, HTML, JSON или CSV.',true);return;}
    try{
      var raw=await file.text();
      if(/\.html?$/i.test(file.name)){
        var doc=new DOMParser().parseFromString(raw,'text/html');
        doc.querySelectorAll('script,style,nav,footer').forEach(function(n){n.remove();});
        raw=(doc.body?doc.body.textContent:raw);
      }
      if(/\.json$/i.test(file.name)){try{raw=JSON.stringify(JSON.parse(raw),null,2);}catch(e){/* plain JSON text is retained with no fabricated parse */}}
      projectSourceText=raw.replace(/\s+/g,' ').trim().slice(0,125000);
      projectSourceFile=file.name;
      message('fileStatus','Прочитано локално: '+file.name+' ('+projectSourceText.length+' знаци). Ништо не е испратено.');
      if(!$('idea').value.trim())$('idea').value='Проект од документ: '+file.name;
    }catch(e){message('fileStatus','Грешка при читањето: '+e.message,true);}
  }
  function reset(){
    ['idea','legalApplicant','startDate','endDate','consortiumCountries','customCall','customCallUrl'].forEach(function(id){$(id).value='';});
    $('legalType').value='unknown';$('projectFile').value='';projectSourceText='';projectSourceFile='';
    message('fileStatus','TXT, MD, HTML, JSON · локално читање');message('formMessage','');
    message('exportStatus','');analysis=null;dossier=null;
    $('resultsTitle').textContent='Резултат од анализата';
    $('runLead').textContent='Внеси проект и притисни „Најди ми грант“ — анализата започнува веднаш.';
    $('results').innerHTML='<div class="placeholder">Нема започнато анализа.</div>';renderSteps('missing');
    $('dossierPanel').classList.add('hidden');$('trace').textContent='Нема започнато анализа.';
    $('entry').scrollIntoView({behavior:'smooth',block:'center'});
  }
  function sample(which){
    reset();
    if(which==='ohrid'){
      $('idea').value='Ohrid Protocol Conference 2027: меѓународна конференција за протокол, дипломатија, јавна комуникација и одговорна ВИ во Охрид, март–мај 2027. Работен модел 150 учесници, venue Inex Olgica, професионални работилници и можни peer-reviewed proceedings преку WPA Journal. Дај ми соодветни извори и изгради апликациско досие. Организатор WPA е независна платформа; правниот апликант не е утврден.';
      $('startDate').value='2027-03-01';$('endDate').value='2027-05-31';
    }else{
      $('idea').value='WPA Journal: европска соработка за научна дисеминација, отворен пристап, peer review, мултијазично академско објавување, обуки за уредници и пристапни истражувачки материјали. Потребни се соодветна правна организација и потврдени европски партнери.';
    }
    analyzeNow();
  }
  function currentDraft(){return Object.assign(readForm(),{savedAt:new Date().toISOString()});}
  function restoreDraft(data){
    if(!data||typeof data!=='object')throw new Error('Неважечки запис');
    ['idea','legalApplicant','startDate','endDate','consortiumCountries','customCall','customCallUrl'].forEach(function(id){$(id).value=String(data[id]||'');});
    $('legalType').value=data.legalType||'unknown';projectSourceText=String(data.sourceText||'').slice(0,125000);projectSourceFile=String(data.sourceFileName||'');
    message('fileStatus',projectSourceFile?'Вратена локална содржина: '+projectSourceFile:'TXT, MD, HTML, JSON · локално читање');
  }
  function boot(){
    if(!Core){message('formMessage','Недостасува eu-factory-core-v5.js — анализата не може да се изврши.',true);return;}
    renderSteps('missing');
    loadRegistry().then(function(){message('formMessage','Датиран регистар на официјални извори е вчитан · '+registry.verifiedAsOf);})
      .catch(function(e){message('formMessage','Регистарот не се вчита: '+e.message,true);});
    $('findGrant').addEventListener('click',analyzeNow);
    $('haveCall').addEventListener('click',function(){
      $('moreOptions').open=true;
      $('customCall').focus();
      message('formMessage','Внеси го ID/описот и официјалниот линк на повикот. Потоа притисни „Најди ми грант“ за eligibility-first анализа.');
    });
    $('clear').addEventListener('click',reset);
    document.querySelectorAll('[data-demo]').forEach(function(b){b.addEventListener('click',function(){sample(b.dataset.demo);});});
    $('projectFile').addEventListener('change',function(){ingestFile(this.files[0]);});
    $('downloadMd').addEventListener('click',function(){if(!dossier)return;download('wpa-eu-'+Core.safeName(analysis.project.title)+'-dossier.md',dossier.markdown,'text/markdown');message('exportStatus','MD досието е преземено.');});
    $('downloadJson').addEventListener('click',function(){if(!dossier)return;download('wpa-eu-'+Core.safeName(analysis.project.title)+'-manifest.json',JSON.stringify({manifest:dossier.manifest,project:analysis.project,opportunity:dossier.opportunity,workPackages:dossier.workPackages,blockers:dossier.gaps},null,2),'application/json');message('exportStatus','JSON manifest е преземен.');});
    $('copyDossier').addEventListener('click',async function(){if(!dossier)return;try{await navigator.clipboard.writeText(dossier.markdown);message('exportStatus','Досието е копирано.');}catch(e){message('exportStatus','Прелистувачот го блокира копирањето — користи Преземи .MD.',true);}});
    $('saveLocal').addEventListener('click',function(){try{localStorage.setItem(STORAGE,JSON.stringify(currentDraft()));message('localStatus','Локална копија е зачувана во овој прелистувач.');}catch(e){message('localStatus','Не е дозволено локално чување: '+e.message,true);}});
    $('restoreLocal').addEventListener('click',function(){try{var item=localStorage.getItem(STORAGE);if(!item)throw new Error('нема зачуван нацрт');restoreDraft(JSON.parse(item));message('localStatus','Локалниот нацрт е вчитан.');}catch(e){message('localStatus','Неуспешно вчитување: '+e.message,true);}});
    $('forgetLocal').addEventListener('click',function(){try{localStorage.removeItem(STORAGE);message('localStatus','Локалниот запис е избришан.');}catch(e){message('localStatus','Неуспешно: '+e.message,true);}});
    $('idea').addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();analyzeNow();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
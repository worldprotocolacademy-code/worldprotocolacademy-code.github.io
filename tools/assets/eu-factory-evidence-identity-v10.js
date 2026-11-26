/* EU Factory v10 RC1: local PAF candidate routing and expert participation.
 * No external APIs, private profile storage, or verified numerical claims. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WPAEUFactoryV10=api;
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',api.mount,{once:true});
    else api.mount();
  }
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const CATALOGUE='/data/eu-application-factory/paf-catalogue-v1.json';
  const EXPERT='https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/work-as-an-expert';
  const COST='https://www.cost.eu/cost-actions/participate-in-an-ongoing-action/';
  const ERASMUS='https://erasmus-plus.ec.europa.eu/programme-guide/part-b/key-action-2';
  const roles={
    unregistered:{status:'NO_GO_AS_LEGAL_APPLICANT',message:'Нерегистрираната иницијатива не е правен субјект. За повик што бара правно лице: NO-GO за директно аплицирање. Лична експертска или вистинска партнерска патека е можна само според правилата.'},
    individual:{status:'PERSONAL_ROUTE_UNVERIFIED',message:'Лична патека: EU Expert и COST. Регистрација/учество не гарантира избор или исплата; провери конкретна мрежа, судир на интереси и службени дозволи.'},
    partner:{status:'PARTNER_NOT_CONFIRMED',message:'Побарај подобен партнер/координатор, со реална улога и писмена потврда. Нема позајмување правен идентитет; нема потврден партнер.'},
    registered:{status:'LEGAL_ENTITY_NOT_VERIFIED',message:'Потребни се документи за правниот субјект, држава, овластување и точните правила на повикот. Самопријавен статус не е доказ.'}
  };
  const str=(v,max=2000)=>typeof v==='string'?v.trim().slice(0,max):'';
  const isDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
  function secureUrl(v){try{const u=new URL(v);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}}
  function validateCatalogue(c){
    if(!c||!isDate(c.catalogue_date)||!Array.isArray(c.sectors)||!Array.isArray(c.projects)||!Array.isArray(c.candidate_indicators))throw Error('Invalid PAF catalogue');
    const sectors=new Set(c.sectors.map(s=>s.id));
    if(c.sectors.length!==13||sectors.size!==13||c.sectors.some(s=>!str(s.label)||!Number.isInteger(s.count)||s.count<0)||c.sectors.reduce((n,s)=>n+s.count,0)!==c.displayed_total)throw Error('Invalid catalogue sectors/counts');
    if(new Set(c.projects.map(p=>p.id)).size!==c.projects.length||c.projects.some(p=>!str(p.id)||!str(p.name)||!Array.isArray(p.sectors)||!p.sectors.length||p.sectors.some(s=>!sectors.has(s))))throw Error('Invalid portfolio mapping');
    if(c.candidate_indicators.some(i=>i.status!=='CANDIDATE'||!sectors.has(i.sector)||!secureUrl(i.url)||Object.prototype.hasOwnProperty.call(i,'observation')))throw Error('Invalid evidence leads');
    return c;
  }
  function makePlan(c,id,role){
    validateCatalogue(c);
    const project=c.projects.find(p=>p.id===id);
    if(!project||!Object.prototype.hasOwnProperty.call(roles,role))throw Error('Unknown project or participation route');
    return {schema:'wpa-eu-evidence-identity/1',release:'v10-rc1',status:'DRAFT_NOT_ELIGIBILITY_VERIFIED',project:{id:project.id,name:project.name,priority:project.priority},catalogueDate:c.catalogue_date,displayedTotal:c.displayed_total,brochureClaim:c.brochure_indicator_claim,role,participation:roles[role],sectors:c.sectors.filter(s=>project.sectors.includes(s.id)),candidateIndicators:c.candidate_indicators.filter(i=>project.sectors.includes(i.sector)),proposedProjectKpis:project.project_kpi_proposals,caution:project.caution,nationalObservationStatus:'UNVERIFIED',officialRoutes:[EXPERT,COST,ERASMUS,c.catalogue_url],humanGate:'HOLD',submissionAuthorised:false,scoreAdjustment:0};
  }
  function makeEvidence(plan,raw,sha,name,today){
    if(!plan||plan.status!=='DRAFT_NOT_ELIGIBILITY_VERIFIED'||!plan.sectors.some(s=>s.id===raw.sector))throw Error('Избери сектор од мапираниот проект.');
    const keys=['indicator','series','geography_population','reference_period','unit','original_publisher','source_url','access_date','snapshot_locator','methodology'];
    const row={};for(const k of keys){row[k]=str(raw[k]);if(!row[k])throw Error('Недостига: '+k);}
    const v=str(raw.observation,100);
    if(!v||!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(v)||!Number.isFinite(Number(v)))throw Error('Внеси валиден нумерички податок (не празна вредност).');
    if(!secureUrl(row.source_url))throw Error('Потребен е HTTPS извор без корисничко име или лозинка.');
    if(!isDate(row.access_date)||!isDate(today)||row.access_date>today)throw Error('Невалиден или иден датум на пристап.');
    if(!/^[a-f0-9]{64}$/.test(sha)||!str(name,240)||/[\\/]/.test(name)||name==='.'||name==='..')throw Error('Потребен е локален извор со валиден SHA-256.');
    return Object.assign(row,{evidence_id:'PAF-DRAFT-'+sha.slice(0,16),sector:raw.sector,observation:Number(v),snapshot_file:name,snapshot_sha256:sha,national_target:null,status:'UNVERIFIED',role:'NATIONAL_CONTEXT',source_reviewed:false,reviewer:'',review_date:'',relevance:'Human review required; see methodology note.',limitations:'Unverified user entry; no automated proof of accuracy, licence, provenance or attribution.'});
  }
  function mount(){
    const d=document,el=id=>d.getElementById(id),panel=el('euEvidenceIdentityV10');
    if(!panel||panel.dataset.bound==='true')return;
    panel.dataset.bound='true';
    const status=el('v10State'),message=el('v10ExportStatus'),project=el('v10Project'),role=el('v10Role'),sector=el('v10Sector');
    let catalogue=null,busy=false;
    const option=(v,t)=>{const o=d.createElement('option');o.value=v;o.textContent=t;return o;};
    const plan=()=>makePlan(catalogue,project.value,role.value);
    function render(){
      try{
        const p=plan(),prior=sector.value;
        sector.replaceChildren(...p.sectors.map(s=>option(s.id,s.label)));
        if(p.sectors.some(s=>s.id===prior))sector.value=prior;
        el('v10Mapping').textContent=[p.project.priority+' · '+p.project.name,p.participation.status+' — '+p.participation.message,'PAF: '+p.catalogueDate+' · '+p.displayedTotal+' прикажани индикатори; бројките од каталогот не се вредности на индикаторите.','Сектори: '+p.sectors.map(s=>s.label+' ('+s.count+')').join('; '),'Кандидатски индикатори: '+(p.candidateIndicators.map(i=>i.label+' — '+i.limitation+' — '+i.url).join('\n')||'Нема конкретен кандидат; провери официјални алтернативи.'),'Предложени проектни KPI (одделно): '+(p.proposedProjectKpis||[]).join('; '),p.caution||'','Нема автоматско зголемување на fit score. HUMAN GATE HOLD.'].join('\n\n');
        status.textContent='Локално мапирање завршено. Сите индикатори се кандидатски, не потврдени вредности.';
        sector.disabled=false;el('v10ExportPlan').disabled=false;el('v10ExportEvidence').disabled=busy;
      }catch(e){status.textContent='Модулот е блокиран: '+e.message;el('v10Mapping').textContent='';el('v10ExportPlan').disabled=true;el('v10ExportEvidence').disabled=true;}
    }
    function download(name,value){
      const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));
      const a=d.createElement('a');a.href=url;a.download=name;d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    project.addEventListener('change',render);role.addEventListener('change',render);
    el('v10ExportPlan').addEventListener('click',()=>{try{download('wpa-v10-participation-draft.json',plan());message.textContent='Преземен работен нацрт; нема поднесување.';}catch(e){message.textContent=e.message;}});
    el('v10ExportEvidence').addEventListener('click',async()=>{
      if(busy)return;busy=true;el('v10ExportEvidence').disabled=true;
      try{
        const p=plan(),file=el('v10Snapshot').files[0];
        if(!file||!file.size||file.size>20*1024*1024)throw Error('Избери јавна изворна датотека до 20 MiB.');
        if(!window.crypto?.subtle)throw Error('SHA-256 не е достапен; потребен е безбеден прелистувач.');
        const raw={sector:sector.value,indicator:el('v10Indicator').value,series:el('v10Series').value,geography_population:el('v10Geography').value,reference_period:el('v10Period').value,observation:el('v10Value').value,unit:el('v10Unit').value,original_publisher:el('v10Publisher').value,source_url:el('v10Url').value,access_date:el('v10Access').value,snapshot_locator:el('v10Locator').value,methodology:el('v10Method').value};
        const bytes=new Uint8Array(await window.crypto.subtle.digest('SHA-256',await file.arrayBuffer()));
        const sha=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
        const row=makeEvidence(p,raw,sha,file.name,window.WPAEUFactoryCore.localToday());
        download('paf-evidence-unverified.json',[row]);
        message.textContent='Преземен UNVERIFIED доказен нацрт. Чувај ја оригиналната датотека и побарај човечка верификација.';
      }catch(e){message.textContent='Извозот е блокиран: '+e.message;}
      finally{busy=false;render();}
    });
    fetch(CATALOGUE,{credentials:'same-origin',cache:'no-store'}).then(r=>{if(!r.ok)throw Error('PAF catalogue unavailable');return r.json();}).then(c=>{
      catalogue=validateCatalogue(c);
      project.replaceChildren(...catalogue.projects.map(p=>option(p.id,p.priority+' · '+p.name)));
      project.disabled=false;render();
    }).catch(e=>{status.textContent='Каталогот не е достапен: '+e.message+'; нема анализа.';});
  }
  return {validateCatalogue,makePlan,makeEvidence,secureUrl,mount};
});

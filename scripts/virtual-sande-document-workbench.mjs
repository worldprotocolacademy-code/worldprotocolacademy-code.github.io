/**
 * Document Intelligence & Authoring Lab: opt-in subtool inside Virtual Sande.
 * No raw document or full corpus is transmitted; only a bounded evidence packet
 * leaves the browser after explicit user consent + anti-abuse verification.
 */
import {DOCUMENT_LIMITS,SUPPORTED_DOCUMENT_EXTENSIONS,DOCUMENT_DOMAINS,
 DOCUMENT_MODES,DOCUMENT_MODE_LABELS,makeDocumentCorpus,createEvidencePacket,
 makeDraftMarkdown} from './virtual-sande-document-intelligence.mjs';
import {readLocalDocument} from './virtual-sande-document-parser.mjs';
import {candidateToDocument} from './virtual-sande-open-research.mjs';
import {createOpenResearchUI} from './virtual-sande-open-research-ui.mjs';
import {createInstitutionalResearchUI} from './virtual-sande-institutional-research-ui.mjs';
import {WPA_CITATION_POLICY_VERSION,WPA_INSTITUTION,WPA_NOTICES,SOURCE_TYPES} from './virtual-sande-citation-policy.mjs';

const I18N={
 mk:{
  title:'Документна и авторска лабораторија',
  desc:'За амбасадори, протоколисти, ПР, безбедност, комуникологија и ВИ. Прикачете повеќе документи, побарајте анализа или авторски нацрт. Само избрани извадоци се испраќаат по согласност.',
  attach:'Избери до 6 документи: PDF · DOCX · TXT · MD · CSV · HTML',
  area:'Област',product:'Побаран производ',audience:'За кого е материјалот',
   audiences:['Професионален корисник','WPA-Институт · изворно поткрепена суштина'],
  clear:'Отстрани документи',md:'Преземи Markdown-нацрт',json:'Преземи изворен регистар',
  revise:'Продолжи од претходниот нацрт (се испраќа краток дел од AI-текстот како непроверен контекст)',
  catalogue:'Официјална WPA библиографија',
  sourceMeta:'Библиографски податоци (внесени од корисникот; независно непроверени)',
  sourceFields:['Автор(и)','Точен наслов','Година','Издавач','Вид извор','Списание','Годиште','Број','Страници','Издание','DOI','Официјална врска'],
  attestRights:'Потврдувам дека имам права и правна основа за обработка на документите и избраните извадоци.',
  attestSecurity:'Не доставувам класифицирани ниту недозволено доверливи/лични податоци.',
  policyRequired:'Потребна е потврда за правата и заштитата на документите.',
  empty:'Нема избрани документи. Прикачи ги и потоа прашај во разговорот.',
  progress:'Локално читам',indexed:'Локално индексирани',
  tooBig:'Датотеката/корпусот ги надминува ограничувањата на пилотот.',
  bad:'Не е извлечен употреблив текст; документот може да биде скениран, шифриран, неподдржан или оштетен.',
  off:'AI-генерирањето не е активирано. Документите остануваат локално.',
  nomatch:'Не најдов релевантни текстуални извадоци. Прецизирај го прашањето.',
  conflict:'Избери само еден изворен режим: документи, PDF-книга или фотографија.',
  failure:'Анализата не заврши. Не е создаден потврден труд.',
  info:'Резултатот е работен нацрт. За научна публикација се потребни проверки на извори, метаподатоци, авторство и Human Gate.',
  domains:['Автоматски','Протокол','Дипломатија','Односи со јавност','Безбедност','Комуникологија','ВИ']
 },en:{
  title:'Document Intelligence & Authoring Lab',
  desc:'For diplomats, protocol, PR, security, communications and AI specialists. Attach several documents and request analysis or an authored draft. Only selected excerpts are transmitted with consent.',
  attach:'Choose up to 6 documents: PDF · DOCX · TXT · MD · CSV · HTML',
  area:'Discipline',product:'Requested deliverable',audience:'Intended audience',
   audiences:['Professional client','WPA Institute · source-grounded core essence'],
  clear:'Remove documents',md:'Download Markdown draft',json:'Download source register',
  revise:'Continue from previous draft (a short AI text excerpt will be sent as unverified editing context)',
  catalogue:'Official WPA bibliography',
  sourceMeta:'Bibliographic metadata (visitor supplied; independently unverified)',
  sourceFields:['Author(s)','Exact title','Year','Publisher','Source type','Journal','Volume','Issue','Pages','Edition','DOI','Official URL'],
  attestRights:'I have rights and a lawful basis to process the documents and send selected excerpts.',
  attestSecurity:'No classified or improperly disclosed confidential/personal material is submitted.',
  policyRequired:'Confirm source rights and data-security conditions.',
  empty:'No documents selected. Attach documents, then ask in the chat.',
  progress:'Reading locally',indexed:'Indexed locally',
  tooBig:'File/corpus exceeds pilot limits.',
  bad:'No usable text extracted: document may be scanned, encrypted, unsupported or damaged.',
  off:'AI generation is not enabled. Documents stay local.',
  nomatch:'No matching textual evidence found. Please specify your question.',
  conflict:'Choose one source mode: documents, PDF book or photo.',
  failure:'Analysis failed. No verified paper was created.',
  info:'Output is a working draft. Scientific publication needs source checks, author metadata, rights and a Human Gate.',
  domains:['Auto','Protocol','Diplomacy','Public relations','Security','Communicology','AI']
 }};
const CSS=[
 '.wpa-vs-doclab{padding:7px 10px;background:#f7f3e9;color:#1e3250;border-top:1px solid #ccb879;font:12px/1.45 system-ui}',
 '.wpa-vs-doclab summary{font-weight:750;cursor:pointer;color:#193657}',
 '.wpa-vs-doclab p{margin:6px 0}',
 '.wpa-vs-doclab label{display:inline-flex;align-items:center;gap:5px;margin:4px 10px 4px 0}',
 '.wpa-vs-doclab input[type=file]{width:100%;font-size:11px;display:block}',
 '.wpa-vs-doclab select{max-width:190px;border:1px solid #b8a36c;border-radius:5px;background:white;color:#17304d;padding:4px}',
 '.wpa-vs-doclab button{margin:3px;border:1px solid #b8a36c;border-radius:6px;background:white;color:#17304d;padding:5px 7px;cursor:pointer}',
 '.wpa-vs-doclab button:disabled{opacity:.5;cursor:not-allowed}',
 '.wpa-vs-doclab .status{overflow-wrap:anywhere;white-space:pre-wrap;font-weight:600}',
 '.wpa-vs-doclab progress{width:100%}',
 '.wpa-vs-doclab .wpa-doclab-sources{max-height:200px;overflow:auto}',
 '.wpa-vs-doclab .wpa-doclab-source{margin:4px 0;border:1px solid #dbcba6;padding:5px}',
 '.wpa-vs-doclab .wpa-doclab-metadata{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}',
 '.wpa-vs-doclab .wpa-doclab-metadata label{display:flex;flex-direction:column;align-items:start;font-size:10px}',
 '.wpa-vs-doclab .wpa-doclab-metadata input,.wpa-vs-doclab .wpa-doclab-metadata select{box-sizing:border-box;width:100%;max-width:100%;font-size:11px}',
 '.wpa-vs-doclab .wpa-doclab-disclaimer{max-height:160px;overflow:auto;white-space:pre-wrap;background:#fff;padding:6px;border:1px solid #d9c69a}',
 '.wpa-vs-doclab .wpa-doclab-ack label{display:flex;margin:6px 0;gap:8px}',
 '@media(max-width:390px){.wpa-vs-doclab .wpa-doclab-metadata{grid-template-columns:1fr}}'
].join('\n');
function en(){return document.documentElement.lang?.startsWith('en');}
function node(tag,className,txt){
 const n=document.createElement(tag);
 if(className)n.className=className;
 if(txt!==undefined)n.textContent=txt;
 return n;
}
function download(filename,content,type){
 const url=URL.createObjectURL(new Blob([content],{type}));
 const a=node('a');a.href=url;a.download=filename;document.body.appendChild(a);
 a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
export function createDocumentWorkbench(panel,config={}){
 if(!panel||typeof document==='undefined')throw new Error('DOC_LAB_BROWSER_ONLY');
 const lang=en()?'en':'mk',t=I18N[lang];
 if(!document.getElementById('wpa-doclab-css')){
   const style=node('style');style.id='wpa-doclab-css';style.textContent=CSS;
   document.head.appendChild(style);
 }
 const form=panel.querySelector('.wpa-public-vs-form');
 if(!form?.parentNode)throw new Error('DOC_LAB_CHAT_MISSING');
 const wrap=node('details','wpa-vs-doclab');
 wrap.append(node('summary',null,'📚 '+t.title));
 const desc=node('p',null,t.desc);
 const openResearchHost=node('div');
 const institutionHost=node('div');
 const input=node('input');input.type='file';input.multiple=true;
 input.accept=SUPPORTED_DOCUMENT_EXTENSIONS.map(ext=>'.'+ext).join(',');
 input.setAttribute('aria-label',t.attach);
 const label=node('label',null,t.attach);label.append(input);
 const mode=node('select'),domain=node('select'),audience=node('select');
 ['professional_user','wpa_institute'].forEach((value,i)=>{
   const o=node('option',null,t.audiences[i]);o.value=value;audience.append(o);
 });
 for(const value of DOCUMENT_MODES){
   const opt=node('option',null,DOCUMENT_MODE_LABELS[value][lang==='en'?1:0]);
   opt.value=value;mode.append(opt);
 }
 DOCUMENT_DOMAINS.forEach((value,i)=>{
   const opt=node('option',null,t.domains[i]);opt.value=value;domain.append(opt);
 });
 const modeLabel=node('label',null,t.product+': ');modeLabel.append(mode);
 const areaLabel=node('label',null,t.area+': ');areaLabel.append(domain);
 const audienceLabel=node('label',null,t.audience+': ');audienceLabel.append(audience);
 const status=node('p','status',t.empty);status.setAttribute('aria-live','polite');
 const progress=node('progress');progress.value=0;progress.max=1;progress.hidden=true;
 const revise=node('input');revise.type='checkbox';revise.checked=false;revise.disabled=true;
 const reviseLabel=node('label',null,t.revise);reviseLabel.prepend(revise);
 const metadataHost=node('div','wpa-doclab-sources');
 const metaInfo=node('p',null,t.sourceMeta);
 const bibliographyLink=node('a',null,t.catalogue);
 bibliographyLink.href=WPA_INSTITUTION.bibliography_url;
 bibliographyLink.target='_blank';bibliographyLink.rel='noopener noreferrer';
 const legalDetails=node('details');
 const legalSummary=node('summary',null,WPA_NOTICES[lang].heading);
 legalDetails.append(legalSummary,node('p','wpa-doclab-disclaimer',
   Object.values(WPA_NOTICES[lang]).join('\n\n')));
 const policyAcknowledgements=node('div','wpa-doclab-ack');
 const attestationRights=node('input');attestationRights.type='checkbox';
 const attestationSecurity=node('input');attestationSecurity.type='checkbox';
 const rightsLabel=node('label',null,t.attestRights);
 const securityLabel=node('label',null,t.attestSecurity);
 rightsLabel.prepend(attestationRights);securityLabel.prepend(attestationSecurity);
 policyAcknowledgements.append(rightsLabel,securityLabel);
 const clear=node('button',null,t.clear);clear.type='button';
 const md=node('button',null,t.md);md.type='button';md.disabled=true;
 const json=node('button',null,t.json);json.type='button';json.disabled=true;
 wrap.append(desc,openResearchHost,institutionHost,label,modeLabel,areaLabel,audienceLabel,status,progress,metaInfo,bibliographyLink,metadataHost,reviseLabel,legalDetails,policyAcknowledgements,node('p',null,t.info),clear,md,json);
 form.parentNode.insertBefore(wrap,form);
 let index=null,working=false,last=null,generation=0;
 function importResearchCandidates(items){
   if(working)return;
   try{
     const records=items.slice(0,DOCUMENT_LIMITS.maxFiles).map(candidateToDocument);
     const corpus=makeDocumentCorpus(records);
     generation++;index=corpus;last=null;
     input.value='';revise.disabled=true;revise.checked=false;
     md.disabled=true;json.disabled=true;
     attestationRights.checked=false;attestationSecurity.checked=false;
     metadataHost.replaceChildren();
     for(const d of corpus.documents){
       const entry=node('p','wpa-doclab-source',d.id+' · '+d.name+
         ' | '+(d.metadata?.doi||'DOI UNVERIFIED')+' | '+(d.metadata?.url||'SOURCE UNVERIFIED'));
       metadataHost.append(entry);
     }
     status.textContent=(lang==='en'?'Imported abstract excerpts only, NOT full text: ':
       'Внесени само апстракти, НЕ целосни трудови: ')+corpus.documents.length+
       '. Bibliographic and institutional verification required.';
     notify();
   }catch(err){
     status.textContent=(lang==='en'?'Research import failed: ':'Не успеа увозот: ')+
       String(err?.message||'unknown error').slice(0,100);
   }
 }
 const researchTool=createOpenResearchUI(openResearchHost,{
   isAvailable:()=>config.isResearchAvailable?.()===true,
   endpoint:config.researchEndpoint||'',
   onImport:importResearchCandidates
 });
 const institutionalTool=createInstitutionalResearchUI(institutionHost,{
   isAvailable:()=>config.isInstitutionAvailable?.()===true,
   lookupEndpoint:config.institutionLookupEndpoint||'',
   worksEndpoint:config.institutionWorksEndpoint||'',
   onImport:importResearchCandidates
 });
 function notify(){if(typeof config.onChange==='function')config.onChange();}
 function reset(){
   generation++;index=null;last=null;working=false;
   input.value='';status.textContent=t.empty;progress.hidden=true;
   md.disabled=true;json.disabled=true;revise.checked=false;revise.disabled=true;
   metadataHost.replaceChildren();attestationRights.checked=false;attestationSecurity.checked=false;
   researchTool.reset();institutionalTool.reset();notify();
 }
 clear.addEventListener('click',reset);
 input.addEventListener('change',async()=>{
   const files=[...(input.files||[])],run=++generation;
   index=null;last=null;md.disabled=true;json.disabled=true;revise.checked=false;revise.disabled=true;
   metadataHost.replaceChildren();attestationRights.checked=false;attestationSecurity.checked=false;notify();
   if(!files.length)return;
   if(files.length>DOCUMENT_LIMITS.maxFiles ||
     files.some(file=>file.size>DOCUMENT_LIMITS.maxFileBytes)){
     status.textContent=t.tooBig;input.value='';return;
   }
   working=true;progress.hidden=false;progress.max=files.length;
   progress.value=0;notify();
   try{
     const docs=[];
     for(let i=0;i<files.length;i++){
       if(run!==generation)return;
       status.textContent=t.progress+': '+(i+1)+'/'+files.length+' '+files[i].name;
       const extracted=await readLocalDocument(files[i],(p,total)=>{
         if(run===generation)status.textContent=t.progress+' '+p+'/'+total;
       });
       if(run!==generation)return;
       docs.push(extracted);progress.value=i+1;
     }
     index=makeDocumentCorpus(docs);
     const fields=['author','title','year','publisher','type','journal','volume','issue','pages','edition','doi','url'];
     index.documents.forEach(doc=>{
       const entry=node('details','wpa-doclab-source');
       const head=node('summary',null,doc.id+' — '+doc.name);
       const body=node('div','wpa-doclab-metadata');
       fields.forEach((key,i)=>{
         const label=node('label',null,t.sourceFields[i]);
         const control=key==='type'?node('select'):node('input');
         if(key==='type'){
           const unknown=node('option',null,lang==='en'?'Unspecified':'Неодредено');
           unknown.value='';control.append(unknown);
           SOURCE_TYPES.forEach(v=>{const opt=node('option',null,v);opt.value=v;control.append(opt);});
         }else{
           control.type='text';control.maxLength=key==='url'?380:key==='doi'?120:key==='title'?250:180;
           control.autocomplete='off';control.spellcheck=false;
         }
         control.value=doc.metadata[key]||'';
         control.addEventListener('input',()=>{doc.metadata[key]=control.value.trim();});
         control.addEventListener('change',()=>{doc.metadata[key]=control.value.trim();});
         label.append(control);body.append(label);
       });
       entry.append(head,body);metadataHost.append(entry);
     });
     status.textContent=t.indexed+': '+index.documents.map(d=>d.name).join(' · ')+
       '\n'+index.chunks.length+' segments · '+index.documents.length+' sources';
   }catch(err){
     index=null;input.value='';metadataHost.replaceChildren();
     status.textContent=/LIMIT|COUNT|BOMB/.test(String(err?.message))?t.tooBig:t.bad;
   }finally{
     if(run===generation){working=false;progress.hidden=true;notify();}
   }
 });
 md.addEventListener('click',()=>{
   if(!last)return;
   download('virtual-sande-'+last.packet.deliverable+'-draft.md',
     makeDraftMarkdown(last.answer,last.packet,{cited_locators:last.citations,lang}),'text/markdown;charset=utf-8');
 });
 json.addEventListener('click',()=>{
   if(!last)return;
   download('virtual-sande-evidence-register.json',JSON.stringify({
     status:'DRAFT_NOT_PUBLISHED',target_audience:last.packet.target_audience,
     documents:last.packet.documents,
     selected_evidence:last.packet.evidence,coverage:last.packet.coverage,
     algorithm:last.packet.algorithm,citations:last.citations,
     institutional_attribution:WPA_NOTICES[lang].identity,disclaimer:WPA_NOTICES[lang],
     citation_policy_version:WPA_CITATION_POLICY_VERSION,
     analysis_exhaustive:false,rights_and_metadata_verified:false
   },null,2),'application/json;charset=utf-8');
 });
 async function ask(question,{endpoint,token,consent}={}){
   if(working)throw new Error('DOCUMENT_PROCESSING');
   if(!index)throw new Error('DOCUMENT_NOT_READY');
   if(!config.isEnabled?.())throw new Error('DOCUMENT_MODEL_DISABLED');
   if(consent!==true||!token)throw new Error('DOCUMENT_CONSENT_REQUIRED');
   if(!attestationRights.checked||!attestationSecurity.checked)
     throw new Error('DOCUMENT_POLICY_ACK_REQUIRED');
   const packet=createEvidencePacket(index,question,{mode:mode.value,domain:domain.value});
   packet.target_audience=audience.value;
   const revisionContext=revise.checked&&last?last.answer.slice(0,2200):undefined;
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),38000);
   let response,data;
   try{
     response=await fetch(endpoint,{method:'POST',credentials:'omit',mode:'cors',
       cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},
       body:JSON.stringify({...packet,revision_context:revisionContext,
         rights_attestation:attestationRights.checked,
         sensitive_data_attestation:attestationSecurity.checked,
         notice_version:WPA_CITATION_POLICY_VERSION,
         consent:true,turnstile_token:token,lang}),
       signal:controller.signal});
     if(!response.ok)throw new Error('DOCUMENT_HTTP_'+response.status);
     data=await response.json();
   }finally{clearTimeout(timer);}
   const allowed=new Set(packet.evidence.map(x=>x.document_id+' '+x.locator));
   if(data?.ok!==true||data.mode!=='document_lab_pilot'||!data.answer ||
      !Array.isArray(data.cited_locators)||data.cited_locators.length===0 ||
      data.cited_locators.some(x=>!allowed.has(x)))throw new Error('DOCUMENT_BAD_RESPONSE');
   last={answer:data.answer,packet,citations:data.cited_locators};
   md.disabled=false;json.disabled=false;revise.disabled=false;revise.checked=false;
   status.textContent=t.indexed+': '+packet.coverage.documents_represented+'/'+
     packet.coverage.documents_indexed+' sources; '+packet.coverage.excerpts_selected+
     ' selected extracts. '+t.info;
   return {answer:data.answer,data,agent:true,local:false};
 }
 return {isActive:()=>!!index,isBusy:()=>working,reset,ask,
   getSummary:()=>index?{names:index.documents.map(x=>x.name),chunks:index.chunks.length}:null,
   messageFor:code=>code==='DOCUMENT_NO_MATCH'?t.nomatch:
     code==='DOCUMENT_CONFLICT'?t.conflict:
     code==='DOCUMENT_MODEL_DISABLED'?t.off:
     code==='DOCUMENT_POLICY_ACK_REQUIRED'?t.policyRequired:t.failure};
}

/**
 * Document Intelligence & Authoring Lab: opt-in subtool inside Virtual Sande.
 * No raw document or full corpus is transmitted; only a bounded evidence packet
 * leaves the browser after explicit user consent + anti-abuse verification.
 */
import {DOCUMENT_LIMITS,SUPPORTED_DOCUMENT_EXTENSIONS,DOCUMENT_DOMAINS,
 DOCUMENT_MODES,DOCUMENT_MODE_LABELS,makeDocumentCorpus,createEvidencePacket,
 makeDraftMarkdown} from './virtual-sande-document-intelligence.mjs';
import {readLocalDocument} from './virtual-sande-document-parser.mjs';

const I18N={
 mk:{
  title:'Документна и авторска лабораторија',
  desc:'За амбасадори, протоколисти, ПР, безбедност, комуникологија и ВИ. Прикачете повеќе документи, побарајте анализа или авторски нацрт. Само избрани извадоци се испраќаат по согласност.',
  attach:'Избери до 6 документи: PDF · DOCX · TXT · MD · CSV · HTML',
  area:'Област',product:'Побаран производ',
  clear:'Отстрани документи',md:'Преземи Markdown-нацрт',json:'Преземи изворен регистар',
  revise:'Продолжи од претходниот нацрт (се испраќа краток дел од AI-текстот како непроверен контекст)',
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
  area:'Discipline',product:'Requested deliverable',
  clear:'Remove documents',md:'Download Markdown draft',json:'Download source register',
  revise:'Continue from previous draft (a short AI text excerpt will be sent as unverified editing context)',
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
 '.wpa-vs-doclab progress{width:100%}'
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
 const input=node('input');input.type='file';input.multiple=true;
 input.accept=SUPPORTED_DOCUMENT_EXTENSIONS.map(ext=>'.'+ext).join(',');
 input.setAttribute('aria-label',t.attach);
 const label=node('label',null,t.attach);label.append(input);
 const mode=node('select'),domain=node('select');
 for(const value of DOCUMENT_MODES){
   const opt=node('option',null,DOCUMENT_MODE_LABELS[value][lang==='en'?1:0]);
   opt.value=value;mode.append(opt);
 }
 DOCUMENT_DOMAINS.forEach((value,i)=>{
   const opt=node('option',null,t.domains[i]);opt.value=value;domain.append(opt);
 });
 const modeLabel=node('label',null,t.product+': ');modeLabel.append(mode);
 const areaLabel=node('label',null,t.area+': ');areaLabel.append(domain);
 const status=node('p','status',t.empty);status.setAttribute('aria-live','polite');
 const progress=node('progress');progress.value=0;progress.max=1;progress.hidden=true;
 const revise=node('input');revise.type='checkbox';revise.checked=false;revise.disabled=true;
 const reviseLabel=node('label',null,t.revise);reviseLabel.prepend(revise);
 const clear=node('button',null,t.clear);clear.type='button';
 const md=node('button',null,t.md);md.type='button';md.disabled=true;
 const json=node('button',null,t.json);json.type='button';json.disabled=true;
 wrap.append(desc,label,modeLabel,areaLabel,status,progress,reviseLabel,node('p',null,t.info),clear,md,json);
 form.parentNode.insertBefore(wrap,form);
 let index=null,working=false,last=null,generation=0;
 function notify(){if(typeof config.onChange==='function')config.onChange();}
 function reset(){
   generation++;index=null;last=null;working=false;
   input.value='';status.textContent=t.empty;progress.hidden=true;
   md.disabled=true;json.disabled=true;revise.checked=false;revise.disabled=true;notify();
 }
 clear.addEventListener('click',reset);
 input.addEventListener('change',async()=>{
   const files=[...(input.files||[])],run=++generation;
   index=null;last=null;md.disabled=true;json.disabled=true;revise.checked=false;revise.disabled=true;notify();
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
     status.textContent=t.indexed+': '+index.documents.map(d=>d.name).join(' · ')+
       '\n'+index.chunks.length+' segments · '+index.documents.length+' sources';
   }catch(err){
     index=null;input.value='';
     status.textContent=/LIMIT|COUNT|BOMB/.test(String(err?.message))?t.tooBig:t.bad;
   }finally{
     if(run===generation){working=false;progress.hidden=true;notify();}
   }
 });
 md.addEventListener('click',()=>{
   if(!last)return;
   download('virtual-sande-'+last.packet.deliverable+'-draft.md',
     makeDraftMarkdown(last.answer,last.packet),'text/markdown;charset=utf-8');
 });
 json.addEventListener('click',()=>{
   if(!last)return;
   download('virtual-sande-evidence-register.json',JSON.stringify({
     status:'DRAFT_NOT_PUBLISHED',documents:last.packet.documents,
     selected_evidence:last.packet.evidence,coverage:last.packet.coverage,
     algorithm:last.packet.algorithm,citations:last.citations,
     analysis_exhaustive:false,rights_and_metadata_verified:false
   },null,2),'application/json;charset=utf-8');
 });
 async function ask(question,{endpoint,token,consent}={}){
   if(working)throw new Error('DOCUMENT_PROCESSING');
   if(!index)throw new Error('DOCUMENT_NOT_READY');
   if(!config.isEnabled?.())throw new Error('DOCUMENT_MODEL_DISABLED');
   if(consent!==true||!token)throw new Error('DOCUMENT_CONSENT_REQUIRED');
   const packet=createEvidencePacket(index,question,{mode:mode.value,domain:domain.value});
   const revisionContext=revise.checked&&last?last.answer.slice(0,2200):undefined;
   const controller=new AbortController();
   const timer=setTimeout(()=>controller.abort(),38000);
   let response,data;
   try{
     response=await fetch(endpoint,{method:'POST',credentials:'omit',mode:'cors',
       cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},
       body:JSON.stringify({...packet,revision_context:revisionContext,consent:true,turnstile_token:token,lang}),
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
   return {answer:data.answer,data,agent:true,local:false};
 }
 return {isActive:()=>!!index,isBusy:()=>working,reset,ask,
   getSummary:()=>index?{names:index.documents.map(x=>x.name),chunks:index.chunks.length}:null,
   messageFor:code=>code==='DOCUMENT_NO_MATCH'?t.nomatch:
     code==='DOCUMENT_CONFLICT'?t.conflict:
     code==='DOCUMENT_MODEL_DISABLED'?t.off:t.failure};
}

/**
 * Book-within-bot PDF tool. Only local PDF text extraction occurs on file selection.
 * AI analysis is separate, requires user consent and the already guarded pilot Worker.
 * File bytes are NEVER uploaded; only selected excerpts are sent after consent.
 */
import {BOOK_LIMITS,makeBookIndex,selectBookEvidence,DOMAIN_OPTIONS,MODES} from './virtual-sande-book-synthesis.mjs';

const PDFJS_VERSION='6.5.438';
const PDFJS_ROOT='https://cdn.jsdelivr.net/npm/pdfjs-dist@'+PDFJS_VERSION+'/build/';
const LABELS={
  mk:{
    title:'📚 Анализа на PDF-книга',sub:'Алатка во алатка · синтетичка анализа со докази од конкретни PDF-страници',
    select:'Избери PDF-книга',remove:'Отстрани книга',
    domain:'Област',mode:'Начин на анализа',
    domains:['Автоматски','Протокол','Дипломатија','Односи со јавност','Безбедност','Комуникологија','Вештачка интелигенција'],
    modes:['Прашање со извори','Интердисциплинарна синтеза','Преглед на книга (избор на извадоци)'],
    init:'Изберете PDF и потоа поставете прашање во полето за разговор.',
    reading:'Локално читам страници',ready:'Индексирана книга',
    uncovered:'Страници без достапен текст',pdfTooLarge:'PDF е преголем или има премногу страници за овој пилот.',
    invalid:'Дозволен е само валиден PDF до 24 MB.',empty:'Нема извлечен текст. За скенирана книга е потребен OCR, кој не е активиран.',
    failed:'Не успеа локалното читање на PDF. Проверете дали документот е заштитен или оштетен.',
    engineOff:'AI анализата уште не е активирана во продукција; книгата засега се обработува само локално.',
    evidence:'Избрани PDF-страници',sample:'Ова е анализа на избрани пасуси, НЕ потврда дека AI ја прочитал секоја страница.',
    noMatch:'Не најдов доволно релевантни пасуси. Прецизирајте го прашањето или изберете „Преглед на книга“.',
    combined:'Испратете или PDF-книга или фотографија, не двете истовремено.',
    requestError:'Анализата на извадоците не успеа. Ниту еден одговор не е претставен како проверен.'
  },
  en:{
    title:'📚 Analyse a PDF book',sub:'A tool within the assistant · evidence-first page-based synthesis',
    select:'Choose PDF book',remove:'Remove book',
    domain:'Discipline',mode:'Analysis mode',
    domains:['Automatic','Protocol','Diplomacy','Public relations','Security','Communicology','Artificial intelligence'],
    modes:['Question with sources','Cross-disciplinary synthesis','Book overview (sampled excerpts)'],
    init:'Choose a PDF, then ask a question in the chat field.',
    reading:'Reading pages locally',ready:'Indexed book',uncovered:'Pages without extractable text',
    pdfTooLarge:'This PDF is too large or has too many pages for this pilot.',
    invalid:'Only a valid PDF up to 24 MB is supported.',empty:'No extractable text. Scanned books need OCR, which is not enabled.',
    failed:'The PDF could not be read locally. It may be password protected or damaged.',
    engineOff:'AI analysis is not yet enabled publicly; the book is currently processed locally only.',
    evidence:'Selected PDF pages',sample:'The AI receives selected extracts, NOT every page of the book.',
    noMatch:'No relevant extracts found. Specify the topic or select the book overview mode.',
    combined:'Send either a PDF book or an image, not both at once.',
    requestError:'The analysis request failed. No unverified output was presented as a verified result.'
  }
};
let pdfjsModulePromise=null;
async function loadPdfJs(){
  if(!pdfjsModulePromise){
    pdfjsModulePromise=import(PDFJS_ROOT+'pdf.mjs').then(mod=>{
      mod.GlobalWorkerOptions.workerSrc=PDFJS_ROOT+'pdf.worker.mjs';
      return mod;
    }).catch(e=>{pdfjsModulePromise=null;throw e;});
  }
  return pdfjsModulePromise;
}
function detectLang(){return document.documentElement.lang?.startsWith('en')?'en':'mk';}
function safeStatus(target,message){if(target)target.textContent=String(message||'');}
const bookStyle=`
.wpa-vs-pdf-tool{padding:7px 10px;background:#f5f0e0;color:#19304b;border-top:1px solid #d8d2bc;font:12px/1.45 system-ui}
.wpa-vs-pdf-toggle{font:700 12px system-ui;padding:7px 9px;background:#fff;border:1px solid #b9a264;color:#102c51;border-radius:8px;cursor:pointer}
.wpa-vs-pdf-body{padding:8px 0 2px}
.wpa-vs-pdf-body[hidden]{display:none!important}
.wpa-vs-pdf-body label{display:inline-flex;align-items:center;gap:5px;margin:5px 8px 5px 0}
.wpa-vs-pdf-body select{border:1px solid #b9a264;border-radius:6px;padding:5px;max-width:180px;background:#fff;color:#19304b}
.wpa-vs-pdf-file{font-size:12px;max-width:100%;display:block}
.wpa-vs-pdf-details,.wpa-vs-pdf-alert{margin:5px 0;white-space:normal;line-height:1.5}
.wpa-vs-pdf-details{font-weight:600}
.wpa-vs-pdf-alert{color:#634c16}
.wpa-vs-pdf-progress{width:100%;height:10px}
.wpa-vs-pdf-remove{background:#fff;border:1px solid #b9a264;border-radius:6px;color:#19304b;padding:5px 8px;cursor:pointer}
`;
export function createBookTool(panel,options={}){
  if(!panel || typeof document==='undefined')throw new Error('PDF_TOOL_BROWSER_REQUIRED');
  const tr=LABELS[detectLang()];
  if(!document.getElementById('wpa-vs-pdf-tool-style')){
    const style=document.createElement('style');
    style.id='wpa-vs-pdf-tool-style';style.textContent=bookStyle;
    document.head.appendChild(style);
  }
  const host=document.createElement('section');
  host.className='wpa-vs-pdf-tool';
  host.setAttribute('aria-label',tr.title);
  const toggle=document.createElement('button');
  toggle.type='button';toggle.className='wpa-vs-pdf-toggle';
  toggle.textContent=tr.title;toggle.setAttribute('aria-expanded','false');
  const body=document.createElement('div');
  body.className='wpa-vs-pdf-body';body.hidden=true;
  const desc=document.createElement('p');desc.textContent=tr.sub;
  const file=document.createElement('input');
  file.type='file';file.accept='.pdf,application/pdf';file.className='wpa-vs-pdf-file';
  file.setAttribute('aria-label',tr.select);
  const domain=document.createElement('select');
  DOMAIN_OPTIONS.forEach((value,i)=>{
    const o=document.createElement('option');o.value=value;o.textContent=tr.domains[i];domain.appendChild(o);
  });
  const mode=document.createElement('select');
  MODES.forEach((value,i)=>{
    const o=document.createElement('option');o.value=value;o.textContent=tr.modes[i];mode.appendChild(o);
  });
  const domainLabel=document.createElement('label');
  domainLabel.append(tr.domain+': ',domain);
  const modeLabel=document.createElement('label');
  modeLabel.append(tr.mode+': ',mode);
  const progress=document.createElement('progress');
  progress.className='wpa-vs-pdf-progress';progress.max=1;progress.value=0;progress.hidden=true;
  const details=document.createElement('p');details.className='wpa-vs-pdf-details';
  details.setAttribute('aria-live','polite');details.textContent=tr.init;
  const alert=document.createElement('p');
  alert.className='wpa-vs-pdf-alert';alert.textContent=tr.sample;
  const remove=document.createElement('button');remove.type='button';
  remove.className='wpa-vs-pdf-remove';remove.textContent=tr.remove;remove.hidden=true;
  body.append(desc,file,domainLabel,modeLabel,progress,details,alert,remove);
  host.append(toggle,body);
  // Keep the PDF controls inside the existing chat window, before user text input.
  const form=panel.querySelector('.wpa-public-vs-form');
  if(!form || !form.parentNode)throw new Error('PDF_TOOL_CHAT_FORM_MISSING');
  form.parentNode.insertBefore(host,form);
  let index=null;
  let processing=false;
  let run=0;
  const notify=()=>{if(typeof options.onChange==='function')options.onChange();};
  const status=(value)=>{safeStatus(details,value);if(typeof options.onStatus==='function')options.onStatus(value);};
  const reset=()=>{
    run++;index=null;processing=false;file.value='';progress.hidden=true;
    progress.value=0;remove.hidden=true;status(tr.init);notify();
  };
  toggle.addEventListener('click',()=>{
    body.hidden=!body.hidden;
    toggle.setAttribute('aria-expanded',String(!body.hidden));
  });
  remove.addEventListener('click',reset);
  file.addEventListener('change',async()=>{
    const selected=file.files?.[0];
    if(!selected)return;
    index=null;remove.hidden=true;
    const thisRun=++run;processing=true;notify();
    let pdf=null,loadingTask=null;
    try{
      if(selected.size<128||selected.size>BOOK_LIMITS.maxPdfBytes ||
         (!selected.name?.toLowerCase().endsWith('.pdf')&&selected.type!=='application/pdf')){
        throw new Error('PDF_INVALID');
      }
      const signature=new Uint8Array(await selected.slice(0,5).arrayBuffer());
      if(String.fromCharCode(...signature)!=='%PDF-')throw new Error('PDF_INVALID');
      const pdfjs=await loadPdfJs();
      if(thisRun!==run)return;
      const bytes=new Uint8Array(await selected.arrayBuffer());
      loadingTask=pdfjs.getDocument({data:bytes,isEvalSupported:false});
      pdf=await loadingTask.promise;
      if(pdf.numPages<1||pdf.numPages>BOOK_LIMITS.maxPages)throw new Error('PDF_PAGE_LIMIT');
      progress.max=pdf.numPages;progress.value=0;progress.hidden=false;
      const pages=[];
      for(let p=1;p<=pdf.numPages;p++){
        if(thisRun!==run)return;
        const page=await pdf.getPage(p);
        const text=await page.getTextContent();
        pages.push(text.items.map(item=>typeof item.str==='string'?item.str:'').join(' '));
        if(typeof page.cleanup==='function')page.cleanup();
        progress.value=p;
        if(p%10===0 || p===pdf.numPages)status(tr.reading+': '+p+'/'+pdf.numPages);
      }
      if(thisRun!==run)return;
      const fresh=makeBookIndex(pages,{name:selected.name});
      index=fresh;remove.hidden=false;
      const missing=fresh.unreadablePages.length;
      status(tr.ready+': '+fresh.name+' · '+fresh.readablePages+'/'+fresh.totalPages+
        ' · '+fresh.chunks.length+' excerpts'+(missing?' · '+tr.uncovered+': '+missing:''));
      if(!options.isEnabled?.()) alert.textContent=tr.engineOff+' '+tr.sample;
      else alert.textContent=tr.sample;
    }catch(e){
      if(thisRun!==run)return;
      const code=e?.message||'';
      status(code==='PDF_INVALID'?tr.invalid:
        code==='PDF_PAGE_LIMIT'?tr.pdfTooLarge:
        code==='PDF_NO_EXTRACTABLE_TEXT'?tr.empty:tr.failed);
      file.value='';
    }finally{
      try{if(loadingTask)await loadingTask.destroy();}catch{}
      if(thisRun===run){processing=false;progress.hidden=true;notify();}
    }
  });
  async function ask(question,{endpoint,token,consent,history=[]}={}){
    if(processing)throw new Error('PDF_INDEXING');
    if(!index)throw new Error('PDF_NOT_LOADED');
    const selection=selectBookEvidence(index,question,{domain:domain.value,mode:mode.value});
    if(!selection.canAskModel)throw new Error('PDF_NO_MATCH');
    if(!options.isEnabled?.())throw new Error('PDF_AGENT_DISABLED');
    if(consent!==true||!token)throw new Error('PDF_CONSENT_OR_BOT_CHECK');
    const payload={
      message:question,lang:detectLang(),consent:true,turnstile_token:token,
      domain:selection.domain,analysis_mode:selection.mode,
      document:{name:index.name,total_pdf_pages:index.totalPages,readable_pages:index.readablePages},
      evidence:selection.evidence.map(({id,page,text})=>({id,page,text}))
    };
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),34000);
    let data;
    try{
      const response=await fetch(endpoint,{
        method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        signal:controller.signal,body:JSON.stringify(payload)
      });
      if(!response.ok)throw new Error('PDF_HTTP_'+response.status);
      data=await response.json();
    }finally{clearTimeout(timer);}
    if(!data || data.ok!==true || data.mode!=='pdf_synthesis_pilot' || !data.answer){
      throw new Error('PDF_BAD_RESPONSE');
    }
    const served=data.document?.selected_pages||[];
    if(!Array.isArray(served)||served.some(page=>!selection.coverage.selectedPages.includes(page))){
      throw new Error('PDF_PROVENANCE_MISMATCH');
    }
    const pages=selection.coverage.selectedPages.join(', ');
    alert.textContent=tr.evidence+': '+pages+'. '+tr.sample;
    // No private book content or file bytes are persisted across page reloads.
    return {
      answer:data.answer,
      data, local:false,agent:true,
      evidenceSummary:selection.coverage
    };
  }
  return {
    isActive:()=>!!index,isBusy:()=>processing,ask,reset,
    getSummary:()=>index?{
      name:index.name,totalPdfPages:index.totalPages,readablePages:index.readablePages,
      indexedChunks:index.chunks.length,unreadablePages:index.unreadablePages.length
    }:null,
    messageFor:(code)=>code==='PDF_NO_MATCH'?tr.noMatch:
      code==='PDF_IMAGE_CONFLICT'?tr.combined:
      code==='PDF_AGENT_DISABLED'?tr.engineOff:tr.requestError
  };
}

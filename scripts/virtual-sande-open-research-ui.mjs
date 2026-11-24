/* Embedded Open Research discovery UI; reads official metadata through a bounded
 * Worker route. Search is on-demand and explicit; no hidden tracking or model call.
 * Users may import up to six abstract excerpts as UNVERIFIED source candidates.
 */
import {legalHttpsUrl} from './virtual-sande-open-research.mjs';
const L={
 mk:{
  title:'Отворени книги и научни трудови · истражување',
  placeholder:'Пример: дипломатски протокол и државни церемонии',
  search:'Пребарај отворени извори',type:'Вид',
  kinds:['Книги и трудови','Научни трудови','Книги'],
  unavailable:'Живото пребарување не е вклучено. Нема потврдено преземање на книги.',
  searching:'Пребарувам преку OpenAlex (само метаподатоци и апстракти)...',
  noResults:'Нема проверливи кандидати во овој одговор.',
  import:'Внеси избрани апстракти во анализата',
  empty:'Одбери до шест резултати со извлечен апстракт.',
  replacement:'Избраните апстракти ќе го заменат тековниот локален корпус.',
  error:'Пребарувањето не е достапно. Провери ја врската/изворот.',
  licence:'Лиценца',abstract:'Само апстракт · не целосна книга/труд',
  noAbstract:'Нема апстракт за автоматска изворна анализа.',
  original:'Отвори оригинален запис',
  rights:'Проверете ја оригиналната лиценца пред повторна употреба.'
 },en:{
  title:'Open research · books and papers',
  placeholder:'Example: diplomatic protocol and state ceremonies',
  search:'Find open-access sources',type:'Type',
  kinds:['Books and articles','Research articles','Books'],
  unavailable:'Live discovery is not enabled. No full-book download is verified.',
  searching:'Searching OpenAlex (metadata and abstracts only)...',
  noResults:'No verifiable candidate records returned.',
  import:'Import selected abstracts for analysis',
  empty:'Choose up to six entries with available abstracts.',
  replacement:'Selected abstracts replace the current local source corpus.',
  error:'Search is unavailable. Check connection/provider status.',
  licence:'Licence',abstract:'Abstract only · NOT full book/paper',
  noAbstract:'No extractable abstract for model analysis.',
  original:'Open original metadata',
  rights:'Check original licence before reuse.'
 }};
function el(tag,txt){
 const x=document.createElement(tag);
 if(txt!==undefined)x.textContent=txt;
 return x;
}
export function createOpenResearchUI(host,{isAvailable=()=>false,endpoint,onImport=()=>{}}={}){
 if(typeof document==='undefined'||!host)throw new Error('OA_UI_REQUIRES_BROWSER');
 const lang=document.documentElement.lang?.startsWith('en')?'en':'mk',t=L[lang];
 const root=el('details');
 root.className='wpa-open-research';
 root.style.cssText='margin:8px 0;padding:7px;border:1px solid #ccbb87;border-radius:7px;background:#fff';
 const summary=el('summary','🔎 '+t.title);
 const field=el('input');field.type='search';field.maxLength=160;field.placeholder=t.placeholder;
 field.style.cssText='width:100%;padding:7px;margin:6px 0;box-sizing:border-box';
 field.setAttribute('aria-label',t.title);
 const type=el('select');['all','article','book'].forEach((value,i)=>{
  const x=el('option',t.kinds[i]);x.value=value;type.append(x);
 });
 const button=el('button',t.search);button.type='button';
 const status=el('p',t.unavailable);status.setAttribute('aria-live','polite');
 const results=el('div');results.style.cssText='max-height:230px;overflow:auto';
 const importBtn=el('button',t.import);importBtn.type='button';importBtn.disabled=true;
 const warning=el('p',t.abstract+' · '+t.rights);
 const list=el('div');list.append(field,type,button,status,results,importBtn,warning);
 root.append(summary,list);
 host.append(root);
 let records=[],selected=new Set(),requestId=0;
 function render(){
  results.replaceChildren();selected.clear();importBtn.disabled=true;
  records.forEach((item,i)=>{
   const card=el('div');card.style.cssText='margin:6px 0;padding:7px;border:1px solid #e0d4b4;border-radius:6px';
   const title=el('strong',item.title),details=el('p',
     [item.authors?.join(', '),item.year,item.type,item.provider].filter(Boolean).join(' · '));
   const ref=el('a',t.original);ref.href=legalHttpsUrl(item.source_url)||item.openalex_url;
   ref.target='_blank';ref.rel='noopener noreferrer';
   const license=el('p',t.licence+': '+(item.licence||'UNVERIFIED')+' · '+t.abstract);
   card.append(title,details,ref,license);
   if(item.abstract_excerpt&&item.abstract_excerpt.length>=25){
    const lab=el('label');
    const chk=el('input');chk.type='checkbox';chk.setAttribute('aria-label',item.title);
    chk.addEventListener('change',()=>{
     if(chk.checked){if(selected.size>=6){chk.checked=false;return;}selected.add(i);}
     else selected.delete(i);
     importBtn.disabled=selected.size<1;
    });
    lab.append(chk,document.createTextNode(' '+t.import));card.prepend(lab);
   }else card.append(el('p',t.noAbstract));
   results.append(card);
  });
 }
 button.addEventListener('click',async()=>{
  if(!isAvailable()){status.textContent=t.unavailable;return;}
  const query=field.value.trim();
  if(query.length<4){status.textContent=t.empty;return;}
  const request=++requestId;
  button.disabled=true;status.textContent=t.searching;
  records=[];render();
  try{
   const url=new URL(endpoint);url.searchParams.set('q',query);url.searchParams.set('type',type.value);
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
   let response;
   try{response=await fetch(url.href,{method:'GET',cache:'no-store',
     credentials:'omit',headers:{Accept:'application/json'},signal:controller.signal});}
   finally{clearTimeout(timer);}
   if(request!==requestId)return;
   if(!response.ok)throw new Error('OA_HTTP_'+response.status);
   const body=await response.json();
   if(body?.ok!==true||body.status!=='METADATA_DISCOVERY_NOT_FULLTEXT'||!Array.isArray(body.works))
    throw new Error('OA_BAD_RESPONSE');
   records=body.works.slice(0,15);render();
   status.textContent=records.length+' '+(lang==='en'?'open candidates':'отворени кандидати')+
     '. '+t.abstract;
   if(!records.length)status.textContent=t.noResults;
  }catch{
   if(request===requestId)status.textContent=t.error;
  }finally{if(request===requestId)button.disabled=false;}
 });
 importBtn.addEventListener('click',()=>{
  const chosen=[...selected].map(i=>records[i]).filter(Boolean).slice(0,6);
  if(!chosen.length){status.textContent=t.empty;return;}
  // This does NOT transfer PDFs. User must explicitly click this import.
  onImport(chosen);
  status.textContent=t.replacement+' '+t.abstract;
 });
 return {reset:()=>{requestId++;records=[];selected.clear();results.replaceChildren();
  field.value='';status.textContent=t.unavailable;importBtn.disabled=true;}};
}

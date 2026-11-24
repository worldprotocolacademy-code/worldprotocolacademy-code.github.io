/* Institutional Open Research subtool: source catalogue -> provisional OpenAlex
 * entity match -> indexed OA works -> explicit abstract import to Document Lab.
 * NEVER crawls all 243 institutional websites or asserts verified affiliation.
 */
import {WPA_INSTITUTIONS,filterWpaInstitutions,institutionResearchGate}
 from './virtual-sande-institutional-directory.mjs';
import {legalHttpsUrl} from './virtual-sande-open-research.mjs';
const MSG={
 mk:{
  title:'Институционално истражување · WPA REV7',
  count:'250 институционални записи · предобјавувачки регистар',
  institution:'Најди институција по име, држава или ID',
  topic:'Истражувачко прашање или тема (на пр. дипломатска церемонија)',
  source:'Избери институција',check:'Провери академска идентификација',
  browse:'Пребарај отворени трудови од избраниот кандидат',import:'Внеси избрани апстракти во анализата',
  status:'Врската со OpenAlex не е активна. Нема автоматски преземени книги.',
  blocked:'Овој запис е историски, зависен, непотврден модел или нема разрешен извор. Не е автоматски академски извор.',
  loading:'Се проверуваат метаподатоци преку OpenAlex…',
  noMatches:'Нема доволно сигурна институционална идентификација за автоматско поврзување.',
  caution:'Можни поврзувања — НЕ се потврдени од WPA. Споредете ги името, државата и институционалната страница.',
  sourceScope:'Отворени апстракти и метаподатоци, не прочитани цели книги/трудови.',
  noWorks:'Нема проверливи отворени записи во одговорот за избраната тема.',
  error:'Институционалното пребарување не успеа. Проверете го изворот и обидете се повторно.',
  link:'Оригинален запис',none:'Избери извор со достапен апстракт.',choose:'Избери до шест резултати',
  list:['Книги и трудови','Научни статии','Книги'],
  warning:'Институциите и трудовите се кандидати; библиографските податоци, авторските поврзувања и лиценците бараат редакциска проверка.'
 },en:{
  title:'Institutional Research · WPA REV7',
  count:'250 institutional records · pre-publication source registry',
  institution:'Find institution by name, country or ID',
  topic:'Research question or topic (e.g. diplomatic ceremonial practice)',
  source:'Select an institution',check:'Check academic identity',
  browse:'Search the selected candidate’s open papers',import:'Import selected abstracts into analysis',
  status:'OpenAlex institutional lookup is not activated. No books have been downloaded.',
  blocked:'This record is historical, dependent, an unverified observation or lacks an authoritative source. It is not an automatic academic source.',
  loading:'Checking OpenAlex provider metadata…',noMatches:'No institution identity is reliable enough for automatic matching.',
  caution:'PROVISIONAL matches — NOT verified by WPA. Compare name, country and website.',
  sourceScope:'Open abstracts and metadata, NOT full books or papers.',
  noWorks:'No verifiable OA records returned for this topic.',
  error:'Institutional search failed. Check the original provider.',
  link:'Original record',none:'Choose a record with an available abstract.',
  choose:'Choose up to six results',
  list:['Books and papers','Research articles','Books'],
  warning:'Institutional identities and papers are candidates. Authorship affiliations, bibliography and licence require editorial checks.'
 }};
function element(tag,label,css){
 const e=document.createElement(tag);
 if(label!==undefined)e.textContent=label;
 if(css)e.style.cssText=css;
 return e;
}
async function getJSON(endpoint,params){
 const url=new URL(endpoint);
 for(const [k,v] of Object.entries(params))url.searchParams.set(k,String(v));
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),16000);
 try{
  const r=await fetch(url.href,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',
   headers:{Accept:'application/json'},signal:controller.signal});
  const data=await r.json();
  if(!r.ok||data?.ok!==true)throw new Error(data?.error||'OA_PROVIDER_ERROR');
  return data;
 }finally{clearTimeout(timer);}
}
export function createInstitutionalResearchUI(host,{isAvailable=()=>false,lookupEndpoint='',worksEndpoint='',onImport=()=>{}}={}){
 if(typeof document==='undefined'||!host)throw new Error('INSTITUTION_UI_BROWSER_ONLY');
 const lang=document.documentElement.lang?.startsWith('en')?'en':'mk',t=MSG[lang];
 const root=element('details');
 root.className='wpa-vs-institutional';
 root.style.cssText='padding:7px;margin:7px 0;border:1px solid #bfa66a;border-radius:7px;background:#fff';
 root.append(element('summary','🏛 '+t.title));
 const small=element('p',t.count);
 const search=element('input');search.type='search';search.maxLength=100;
 search.placeholder=t.institution;search.setAttribute('aria-label',t.institution);
 search.style.cssText='box-sizing:border-box;width:100%;padding:6px';
 const source=element('select');source.setAttribute('aria-label',t.source);
 source.style.cssText='box-sizing:border-box;width:100%;margin:4px 0;padding:6px';
 const sourceDetail=element('p',t.warning);
 const question=element('input');question.type='search';question.maxLength=160;
 question.placeholder=t.topic;question.setAttribute('aria-label',t.topic);
 question.style.cssText='box-sizing:border-box;width:100%;margin:4px 0;padding:6px';
 const type=element('select');['all','article','book'].forEach((v,i)=>{
  const o=element('option',t.list[i]);o.value=v;type.append(o);
 });
 const check=element('button',t.check);check.type='button';
 const matchHost=element('div');
 const works=element('div',undefined,'max-height:240px;overflow:auto');
 const browse=element('button',t.browse);browse.type='button';browse.disabled=true;
 const importBtn=element('button',t.import);importBtn.type='button';importBtn.disabled=true;
 const status=element('p',t.status);status.setAttribute('aria-live','polite');
 root.append(small,search,source,sourceDetail,question,type,check,matchHost,browse,works,importBtn,status);
 host.append(root);
 let current=null,matches=[],chosen=null,found=[],selected=new Set(),requestVersion=0;
 function resetResults(){
  chosen=null;matches=[];found=[];selected.clear();matchHost.replaceChildren();
  works.replaceChildren();browse.disabled=true;importBtn.disabled=true;
 }
 function populate(){
  const list=filterWpaInstitutions(search.value,250);
  const saved=source.value;
  source.replaceChildren();
  const none=element('option',t.source);none.value='';source.append(none);
  for(const rec of list){
   const o=element('option',rec.id+' · '+rec.name+' · '+rec.country);
   o.value=rec.id;source.append(o);
  }
  source.value=list.some(x=>x.id===saved)?saved:'';
  current=null;resetResults();
 }
 populate();
 search.addEventListener('input',populate);
 source.addEventListener('change',()=>{
  requestVersion++;
  current=WPA_INSTITUTIONS.find(x=>x.id===source.value)||null;
  resetResults();
  if(!current)return;
  sourceDetail.textContent=current.id+' · '+current.name+' — '+
   current.institution_status+'. '+t.warning;
  if(institutionResearchGate(current)!=='OPENALEX_AFFILIATION_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW'){
   status.textContent=t.blocked;
   check.disabled=true;
  }else {
   check.disabled=false;
   status.textContent=t.caution;
  }
 });
 check.addEventListener('click',async()=>{
  if(!isAvailable()){status.textContent=t.status;return;}
  if(!current){status.textContent=t.source;return;}
  const ver=++requestVersion;
  check.disabled=true;status.textContent=t.loading;resetResults();
  try{
   const data=await getJSON(lookupEndpoint,{institution_id:current.id});
   if(ver!==requestVersion)return;
   matches=data.matches||[];
   const hint=element('p',t.caution);
   matchHost.append(hint);
   matches.forEach(match=>{
    const line=element('label');line.style.cssText='display:block;padding:5px;border-bottom:1px solid #e2d5b7';
    const radio=element('input');radio.type='radio';radio.name='wpa-institution-match-'+current.id;
    radio.value=match.openalex_id;
    radio.disabled=match.selectable_for_provisional_research!==true;
    radio.addEventListener('change',()=>{chosen=match.openalex_id;browse.disabled=false;});
    line.append(radio,document.createTextNode(' '+match.name+' · '+(match.country_code||'?')+
      ' · '+(match.ror||'ROR unknown')));
    if(match.homepage_url){
     const a=element('a',' '+t.link);a.href=legalHttpsUrl(match.homepage_url);
     a.target='_blank';a.rel='noopener noreferrer';line.append(a);
    }
    matchHost.append(line);
   });
   status.textContent=matches.some(x=>x.selectable_for_provisional_research)?
    t.caution:t.noMatches;
  }catch(e){if(ver===requestVersion)status.textContent=t.error+' '+String(e?.message||'').slice(0,65);}
  finally{if(ver===requestVersion)check.disabled=false;}
 });
 browse.addEventListener('click',async()=>{
  if(!isAvailable()){status.textContent=t.status;return;}
  if(!current||!chosen||question.value.trim().length<4){status.textContent=t.none;return;}
  const ver=++requestVersion;found=[];selected.clear();works.replaceChildren();importBtn.disabled=true;
  browse.disabled=true;status.textContent=t.loading;
  try{
   const data=await getJSON(worksEndpoint,{institution_id:current.id,openalex_id:chosen,
     q:question.value.trim(),type:type.value});
   if(ver!==requestVersion)return;
   found=(data.works||[]).slice(0,10);
   for(let i=0;i<found.length;i++){
    const item=found[i];
    const line=element('div',undefined,'padding:6px;border-bottom:1px solid #e2d5b7');
    if(item.abstract_excerpt?.length>=25){
     const c=element('input');c.type='checkbox';
     c.setAttribute('aria-label',item.title);
     c.addEventListener('change',()=>{
      if(c.checked){if(selected.size>=6){c.checked=false;return;}selected.add(i);}
      else selected.delete(i);
      importBtn.disabled=selected.size===0;
     });
     line.append(c);
    }
    const title=element('strong',' '+item.title);
    line.append(title,element('p',(item.authors||[]).join(', ')+' · '+(item.year||'n.d.')+
      ' · '+(item.licence||'licence unverified')));
    if(legalHttpsUrl(item.source_url)){
     const link=element('a',t.link);link.href=legalHttpsUrl(item.source_url);
     link.target='_blank';link.rel='noopener noreferrer';line.append(link);
    }
    works.append(line);
   }
   status.textContent=found.length?t.sourceScope+' '+t.warning:t.noWorks;
  }catch(e){if(ver===requestVersion)status.textContent=t.error+' '+String(e?.message||'').slice(0,65);}
  finally{if(ver===requestVersion)browse.disabled=false;}
 });
 importBtn.addEventListener('click',()=>{
  const picks=[...selected].map(i=>found[i]).filter(x=>x?.abstract_excerpt?.length>=25).slice(0,6);
  if(!picks.length){status.textContent=t.none;return;}
  onImport(picks);
  status.textContent=t.sourceScope+' '+t.warning;
 });
 return {reset(){
  requestVersion++;search.value='';question.value='';populate();
  current=null;check.disabled=false;status.textContent=t.status;
 }};
}

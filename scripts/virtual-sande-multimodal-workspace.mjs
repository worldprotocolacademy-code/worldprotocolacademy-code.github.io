import {createPrivateWorkspaceClient} from './virtual-sande-private-workspace-client.mjs';
const abortError=()=>new DOMException('Aborted','AbortError');
export function mountMultimodalWorkspace(panel,preview){
 if(document.querySelector('meta[name="wpa-private-workspace-only"]')?.content!=='true'||!preview?.getFiles)return null;
 const client=createPrivateWorkspaceClient({configuredPath:document.querySelector('meta[name="wpa-private-workspace-api"]')?.content||''});
 const en=document.documentElement.lang.toLowerCase().startsWith('en');
 const t=en?{
 title:'Protected multimodal pilot',consent:'I consent to sending the question, selected synthetic files and recent conversation to the configured processing providers. No confidential data.',
 corpus:'Optional public WPA search topic (no private data)',corpusConsent:'Search the public WPA corpus using this separate query only.',note:'Images up to 5 MiB; other files up to 15 MiB. Each question processes the selected files again. Stop cancels browser requests, not necessarily already running provider work.',
 progress:'Processing',synthesis:'Preparing evidence synthesis',coverage:'Evidence coverage',sources:'Retrieved WPA excerpts (not independently verified)',noSources:'No WPA verification performed: no matching excerpts or no search requested.',limit:'Visual reports and extracted text are not certified OCR or full page-level verification. Human review required.',complete:'Selected file processing completed.',error:'Processing stopped or failed. No public fallback.',method:{vision_observation_not_verified_ocr:'Model visual observations, unverified',provider_extraction_not_page_verified:'Extracted text, page coverage unverified',utf8_text:'UTF-8 text'}
 }:{
 title:'Заштитен мултимодален пилот',consent:'Се согласувам прашањето, избраните синтетички датотеки и последниот контекст да се испратат до конфигурираните сервиси за обработка. Без доверливи податоци.',
 corpus:'Изборна јавна тема за пребарување во WPA (без приватни податоци)',corpusConsent:'Пребарај го јавниот корпус на WPA само со ова одделно прашање.',note:'Слики до 5 MiB; други датотеки до 15 MiB. Секое прашање повторно ги обработува избраните датотеки. Стоп ги прекинува барањата од прелистувачот, но не нужно започнатата серверска обработка.',
 progress:'Се обработува',synthesis:'Се подготвува синтеза на доказите',coverage:'Опфат на доказите',sources:'Пронајдени исечоци од WPA (без независна проверка)',noSources:'Нема WPA верификација: нема соодветни исечоци или не е побарано пребарување.',limit:'Визуелните извештаи и извлечениот текст не се сертифициран OCR ниту целосна проверка по страници. Потребна е човечка проверка.',complete:'Завршена обработка на избраните датотеки.',error:'Обработката е запрена или неуспешна. Нема пренасочување кон јавниот сервис.',method:{vision_observation_not_verified_ocr:'Моделски визуелни опсервации, непроверени',provider_extraction_not_page_verified:'Извлечен текст, непроверен опфат по страници',utf8_text:'UTF-8 текст'}
 };
 const el=(tag,value)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=value;return e;};
 const root=el('section');root.dataset.wpaMultimodal='rc3';root.style.cssText='padding:8px 10px;background:#f5f0e0;color:#132844;border-top:1px solid #bcae87;font:12px/1.5 system-ui,sans-serif;max-height:180px;overflow:auto;flex-shrink:0';
 const check=label=>{const box=el('input');box.type='checkbox';const wrap=el('label');wrap.style.display='block';wrap.append(box,document.createTextNode(' '+label));return [box,wrap];};
 const [consent,consentLabel]=check(t.consent),[corpusConsent,corpusLabel]=check(t.corpusConsent);
 const query=el('input');query.type='text';query.maxLength=250;query.placeholder=t.corpus;query.setAttribute('aria-label',t.corpus);query.style.cssText='width:100%;box-sizing:border-box;margin:5px 0;padding:5px';
 const status=el('div');status.setAttribute('role','status');
 root.append(el('strong',t.title),consentLabel,el('div',t.note),query,corpusLabel,status);
 panel.querySelector('#wpaPublicVsForm').before(root);
 const changed=()=>{panel.dispatchEvent(new Event('wpa-private-input-changed'));};
 consent.onchange=corpusConsent.onchange=changed;query.oninput=()=>{corpusConsent.checked=false;changed();};
 const ready=()=>client.configured&&consent.checked&&(!query.value.trim()||corpusConsent.checked);
 let generation=0;
 function reset(){generation++;consent.checked=false;corpusConsent.checked=false;query.value='';status.textContent='';}
 panel.querySelector('#wpaPublicVsClear')?.addEventListener('click',reset);
 panel.addEventListener('wpa-private-input-changed',()=>{generation++;status.textContent='';});
 async function analyze({question,history,signal}){
  if(!ready())throw Error('CONSENT_REQUIRED');
  const files=preview.getFiles(),corpus=query.value.trim(),approved=corpusConsent.checked,run=++generation;
  const controller=new AbortController(),cancel=()=>controller.abort();
  if(signal?.aborted)cancel();else signal?.addEventListener('abort',cancel,{once:true});
  const timer=setTimeout(cancel,300000);
  function verify(){if(controller.signal.aborted||run!==generation||!ready())throw abortError();}
  const docs=[];
  try{
   for(let i=0;i<files.length;i++){
    verify();status.textContent=t.progress+' '+(i+1)+'/'+files.length+' — '+files[i].name;
    docs.push(await client.convert(files[i],{question,signal:controller.signal}));
   }
   verify();status.textContent=t.synthesis;
   const data=await client.analyze({question,documents:docs,history,lang:en?'en':'mk',signal:controller.signal,publicCorpusQuery:corpus,corpusConsent:approved});
   verify();
   if(data.coverage.length!==docs.length||docs.some(d=>!data.coverage.some(c=>c.id===d.id&&c.sha256===d.sha256)))throw Error('COVERAGE_MISMATCH');
   const lines=[data.answer,'',t.coverage+': '+docs.length+'/'+files.length];
   for(const c of data.coverage)lines.push('• ['+c.id+'] '+c.name+' — '+(t.method[c.method]||c.method)+'; '+c.selected_chars+'/'+c.chars+' '+(en?'extracted characters':'извлечени знаци')+'; SHA-256: '+c.sha256);
   if(Array.isArray(data.corpus)&&data.corpus.length){lines.push('',t.sources+':');for(const c of data.corpus)lines.push('• ['+c.id+'] '+c.source+' — '+c.excerpt);}
   else lines.push('',t.noSources);
   lines.push('',t.limit);status.textContent=t.complete;
   return {answer:lines.join('\n'),local:false,data};
  }catch(e){if(run===generation)status.textContent=t.error;throw e;}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
 }
 return {ready,analyze,reset};
}

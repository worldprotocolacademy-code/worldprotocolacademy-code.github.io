/*
 * Local Practical Protocol Studio inside the existing Virtual Sande chat.
 * Works without a model, network, visitor file upload or AR permissions.
 */
import {PRACTICAL_CASES,EVENT_TYPES,JURISDICTIONS,
 buildProtocolBrief,protocolBriefMarkdown,protocolQuestionForChat,inferPracticalCase}
 from './virtual-sande-protocol-practice.mjs';
const copy={
 mk:{
 title:'Практичен протоколарен планер',
 intro:'Знамиња · химни · пресеанс · свечени маси · кортежи · конференции · ПР · безбедност · комуникологија · ВИ и AR. Подготовка, а не службена одлука.',
 scenario:'Што сакате да организирате?',event:'Вид на настан',jurisdiction:'Држава / надлежен протокол',
 country:'Друга држава или организација',host:'Домаќин / институција',guest:'Гостин или делегација',
 venue:'Место и гледна точка',participants:'Земји, функции и вклучени симболи',
 question:'Што точно треба да се реши?',people:'Број на учесници (по избор)',
 fromChat:'Од моето прашање',emptyChat:'Прво напишете прашање во разговорот.',
 plan:'Изработи подготвителен план',send:'Постави прашање во разговорот',download:'Преземи план (.md)',
 status:'Оваа алатка не утврдува правни правила ниту реален безбедносен распоред.',
 current:'Подготвителен план: проверете ги важечките правила и надлежното одобрување.',
 prompt:'Прашањето е подготвено во полето за разговор. Проверете го, потоа притиснете Испрати.',
 missing:'Недостасуваат податоци',steps:'Проверки и чекори',sources:'Изворни насоки',illustration:'Илустративна 2D скица — не е конечен пресеанс',
 table:'МАСА',stage:'СЦЕНА',audience:'ПУБЛИКА',sourceNotVerified:'Тековната важност на изворите не е потврдена.'
 },en:{
 title:'Practical Protocol Planner',
 intro:'Flags · anthems · precedence · formal dining · motorcades · conferences · PR · safety · communications · AI and AR. Preparation, not an official decision.',
 scenario:'What do you need to organise?',event:'Type of event',jurisdiction:'Country / governing protocol',
 country:'Other country or organisation',host:'Host / institution',guest:'Guest or delegation',
 venue:'Venue and viewing perspective',participants:'Countries, roles and symbols',
 question:'What exactly do you want to resolve?',people:'Participants (optional)',
 fromChat:'Use my chat question',emptyChat:'Write a question in the chat first.',
 plan:'Prepare a provisional plan',send:'Ask Virtual Sande in the chat',download:'Download plan (.md)',
 status:'This tool cannot certify legal protocol or generate operational security arrangements.',
 current:'Preparatory plan: verify current rules and competent approval.',
 prompt:'The question is in the chat input. Check it and press Send.',
 missing:'Missing information',steps:'Checks and steps',sources:'Source leads',illustration:'Illustrative 2D sketch — not approved precedence',
 table:'TABLE',stage:'STAGE',audience:'AUDIENCE',sourceNotVerified:'Current applicability of referenced sources is not verified.'
 }};
const CSS=[
 '.wpa-practice{padding:8px 10px;background:#f9f6ed;color:#132844;border-top:1px solid #baa875;font:12px/1.5 system-ui,Arial,sans-serif}',
 '.wpa-practice summary{font-weight:800;cursor:pointer;color:#0d2a50}',
 '.wpa-practice p{margin:5px 0 8px}',
 '.wpa-practice label{display:block;font-weight:600;margin:7px 0 3px}',
 '.wpa-practice input,.wpa-practice select,.wpa-practice textarea{box-sizing:border-box;width:100%;max-width:100%;border:1px solid #bdad85;border-radius:6px;padding:6px;background:white;color:#15253d;font:12px system-ui,Arial,sans-serif}',
 '.wpa-practice textarea{min-height:50px;resize:vertical}',
 '.wpa-practice .wpa-practice-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 9px}',
 '.wpa-practice .wpa-practice-buttons{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0}',
 '.wpa-practice button{border:1px solid #a78a47;border-radius:7px;background:#0d2d51;color:#fff;padding:6px 10px;font-size:12px;cursor:pointer}',
 '.wpa-practice button:disabled{opacity:.55;cursor:default}',
 '.wpa-practice .wpa-practice-out{padding:8px;border:1px solid #bba977;border-radius:8px;max-height:330px;overflow:auto;background:#fff}',
 '.wpa-practice .wpa-practice-out ol{padding-left:21px;margin:5px 0}',
 '.wpa-practice .wpa-practice-out a{overflow-wrap:anywhere}',
 '.wpa-practice .wpa-practice-diagram{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0;text-align:center}',
 '.wpa-practice .wpa-practice-slot{padding:7px 3px;border:1px dashed #8d9bac;background:#f0f5fb;border-radius:6px}',
 '.wpa-practice .wpa-practice-diagram[data-kind=conference]{grid-template-columns:repeat(4,1fr)}',
 '.wpa-practice .wpa-practice-diagram[data-kind=conference] .wpa-practice-stage{grid-column:1/-1}',
 '.wpa-practice .wpa-practice-stage{padding:5px;border-radius:4px;background:#1e3657;color:#fff}',
 '.wpa-practice .wpa-practice-small{font-size:11px;color:#555}',
 '@media(max-width:460px){.wpa-practice .wpa-practice-grid{grid-template-columns:1fr}}'
].join('\n');
function el(tag,txt,cls){
 const n=document.createElement(tag);
 if(txt!==undefined)n.textContent=txt;
 if(cls)n.className=cls;
 return n;
}
function createField(label,tag='input',placeholder='',max=130){
 const wrap=el('label');wrap.append(document.createTextNode(label));
 const control=el(tag);control.setAttribute('aria-label',label);
 if(tag==='input'||tag==='textarea'){control.maxLength=max;control.placeholder=placeholder;}
 wrap.append(control);return {wrap,control};
}
function appendList(parent,items,ordered=false){
 const list=el(ordered?'ol':'ul');
 for(const t of items)list.append(el('li',t));
 parent.append(list);
}
function diagram(parent,brief,t){
 if(!brief.visual)return;
 parent.append(el('strong',t.illustration));
 const d=el('div',undefined,'wpa-practice-diagram');d.dataset.kind=brief.visual.kind;
 if(brief.visual.kind==='flags'){
  brief.visual.slots.forEach(slot=>d.append(el('div',slot,'wpa-practice-slot')));
  const direction=el('div',t.audience+' → '+t.stage,'wpa-practice-stage');
  direction.style.gridColumn='1/-1';d.append(direction);
 }else if(brief.visual.kind==='conference'){
  d.append(el('div',t.stage,'wpa-practice-stage'));
  brief.visual.slots.forEach(slot=>d.append(el('div',slot,'wpa-practice-slot')));
  const direction=el('div',t.audience,'wpa-practice-small');
  direction.style.gridColumn='1/-1';d.append(direction);
 }else{
  for(const slot of ['1','2','3','4',t.table,'5','6','7','8']){
   d.append(el('div',slot,slot===t.table?'wpa-practice-stage':'wpa-practice-slot'));
  }
 }
 parent.append(d,el('p',brief.visual.note,'wpa-practice-small'));
}
function saveFile(text,filename){
 const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));
 const a=el('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
export function createProtocolPracticeStudio(panel,{onCompose=()=>{},maxQuestionChars=680}={}){
 if(!panel||typeof document==='undefined')throw new Error('PROTOCOL_PRACTICE_BROWSER_ONLY');
 const lang=document.documentElement.lang?.startsWith('en')?'en':'mk',t=copy[lang];
 if(!document.getElementById('wpa-practice-css')){
  const style=el('style');style.id='wpa-practice-css';style.textContent=CSS;document.head.append(style);
 }
 const form=panel.querySelector('.wpa-public-vs-form');
 if(!form?.parentNode)throw new Error('PROTOCOL_PRACTICE_CHAT_NOT_FOUND');
 const root=el('details',undefined,'wpa-practice');
 root.append(el('summary','🧭 '+t.title),el('p',t.intro));
 const grid=el('div',undefined,'wpa-practice-grid');
 const scenario=createField(t.scenario,'select');
 for(const c of PRACTICAL_CASES){const o=el('option',c[lang]);o.value=c.id;scenario.control.append(o);}
 const event=createField(t.event,'select');
 for(const c of EVENT_TYPES){const o=el('option',c[lang]);o.value=c.id;event.control.append(o);}
 const jurisdiction=createField(t.jurisdiction,'select');
 for(const c of JURISDICTIONS){const o=el('option',c[lang]);o.value=c.id;jurisdiction.control.append(o);}
 const country=createField(t.country,'input','',90);
 const host=createField(t.host,'input','',100),guest=createField(t.guest,'input','',100);
 const venue=createField(t.venue,'input','',100),people=createField(t.people,'input','',5);
 people.control.inputMode='numeric';people.control.type='number';people.control.min='1';people.control.max='50000';
 const participants=createField(t.participants,'input','',170);
 const question=createField(t.question,'textarea','',300);
 grid.append(scenario.wrap,event.wrap,jurisdiction.wrap,country.wrap,host.wrap,guest.wrap,venue.wrap,people.wrap);
 root.append(grid,participants.wrap,question.wrap);
 const controls=el('div',undefined,'wpa-practice-buttons');
 const planButton=el('button',t.plan),fromChat=el('button',t.fromChat),chatButton=el('button',t.send),download=el('button',t.download);
 for(const b of [fromChat,planButton,chatButton,download])b.type='button';
 chatButton.disabled=true;download.disabled=true;
 controls.append(fromChat,planButton,chatButton,download);
 const status=el('p',t.status);status.setAttribute('aria-live','polite');
 const out=el('div',undefined,'wpa-practice-out');out.hidden=true;
 root.append(controls,status,out);
 form.parentNode.insertBefore(root,form);
 let current=null;
 function invalidate(){current=null;chatButton.disabled=true;download.disabled=true;out.hidden=true;status.textContent=t.status;}
 for(const x of [scenario.control,event.control,jurisdiction.control,country.control,host.control,guest.control,venue.control,people.control,participants.control,question.control]){
  x.addEventListener('input',invalidate);x.addEventListener('change',invalidate);
 }
 function payload(){
  return {scenario:scenario.control.value,event_type:event.control.value,jurisdiction:jurisdiction.control.value,
   country_or_body:country.control.value,host:host.control.value,guest:guest.control.value,
   venue:venue.control.value,people_count:people.control.value,
   participants:participants.control.value,question:question.control.value};
 }
 planButton.addEventListener('click',()=>{
  try{
   current=buildProtocolBrief(payload(),{lang});
   out.replaceChildren();
   out.append(el('strong',current.scenario_label+' · '+t.current),el('p',t.sourceNotVerified,'wpa-practice-small'));
   out.append(el('strong',t.steps));
   appendList(out,[...current.checks,...current.steps],true);
   if(current.needed.length){out.append(el('strong',t.missing));appendList(out,current.needed);}
   diagram(out,current,t);
   out.append(el('strong',t.sources));
   for(const source of current.references){
    const p=el('p');
    const a=el('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';
    p.append(a,el('span',' · '+source.status,'wpa-practice-small'));out.append(p);
   }
   out.hidden=false;status.textContent=t.current;
   chatButton.disabled=false;download.disabled=false;
  }catch(e){invalidate();status.textContent=String(e?.message||'PROTOCOL_PRACTICE_ERROR');}
 });
 fromChat.addEventListener('click',()=>{
  const q=(panel.querySelector('#wpaPublicVsInput')?.value||document.getElementById('q')?.value||'').trim();
  if(!q){status.textContent=t.emptyChat;return;}
  scenario.control.value=inferPracticalCase(q);
  question.control.value=q.slice(0,300);
  invalidate();
  root.open=true;
  planButton.click();
 });
 chatButton.addEventListener('click',()=>{
  if(!current)return;
  onCompose(protocolQuestionForChat(current,maxQuestionChars));
  status.textContent=t.prompt;
 });
 download.addEventListener('click',()=>{
  if(!current)return;
  saveFile(protocolBriefMarkdown(current),'wpa-protocol-preparatory-brief-'+current.context.scenario+'.md');
 });
 return {reset(){
  scenario.control.value='flags';event.control.value='institutional';jurisdiction.control.value='unknown';
  for(const x of [country,host,guest,venue,people,participants,question])x.control.value='';
  invalidate();
 },getBrief(){return current;}};
}

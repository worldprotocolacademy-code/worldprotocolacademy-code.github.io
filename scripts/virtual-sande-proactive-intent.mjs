/* WPA proactive intent and synthesis candidate.
 * Deterministic, session-local topic/intent rules; no mind-reading, no telemetry,
 * no automatic requests, no fabricated model confidence or document access.
 */
export const VERSION='1.0.0-rc1';
const TOPICS=[
 {id:'protocol',rx:/протокол|пресеанс|знамињ|знаме|химн|акредитив|свечен|седењ|protocol|precedence|flag|anthem|seating|agr[eé]ment|protokol|preseans|znam|himn|gaf|гаф/iu},
 {id:'diplomacy',rx:/дипломат|амбасад|конзул|билатерал|diploma|ambassador|embassy|consular|bilateral|diplomat|ambasad/iu},
 {id:'research',rx:/извор|цитат|литератур|библиограф|академ|истраж|труд|article|citation|bibliograph|research|source|academic|izvor|citat|trud|istraz|literatur/iu},
 {id:'document',rx:/документ|датотек|прилог|скениран|пдф|document|attachment|pdf|docx|ocr|докс|dokument|fajl/iu},
 {id:'event',rx:/конференц|самит|посета|делегац|настан|conference|summit|visit|delegation|event|konferenc|poseta|nastan|delegac/iu},
 {id:'communication',rx:/комуникац|медиум|соопштени|говор|обраќањ|комуниколог|communication|media|speech|press release|komunikac|medium|govor/iu},
 {id:'ai',rx:/вештачк|вештачка интелигенција|вештачка|в[иі]\b|chatgpt|artificial intelligence|\bai\b|агент|agent|semantik|синтез|семантик|veshtack|vestack/iu}
];
const INTENTS=[
 {id:'compare',rx:/според|разлик|наспроти|compare|difference|versus|spored|razlik/iu},
 {id:'verify',rx:/провер|вериф|точн|извор|цитат|evidence|verify|fact.check|source|citation|prover|tocn|tochn|citat/iu},
 {id:'translate',rx:/превед|превод|англиск|македонск|translate|translation|preved|prevod|anglisk|makedonsk/iu},
 {id:'draft',rx:/напиш|пишува|изработ|нацрт|подготв|draft|write|compose|prepare|napis|napish|podgotv/iu},
 {id:'plan',rx:/план|организ|распоред|чекор|plan|organis|organiz|schedule|checklist|raspored|cekor/iu},
 {id:'analyse',rx:/анализ|синтез|извлеч|резим|analyse|analyz|synthes|summari|extract|analiz|sintez|izvlec/iu},
 {id:'explain',rx:/објасн|што е|како|explain|what is|how|objasn|sto e|shto e|kako/iu}
];
const FOLLOW=/^(?:а\b|а\s|а,|а$|и\s|и$|тоа|ова|потоа|уште|продолж|истото|а\s+потоа|and\b|then\b|also\b|what about|it\b|this\b|that\b|continue\b|more\b|a\s|i\s|toa\b|ova\b|potoa\b|uste\b|ushte\b|prodolz)/iu;
function clean(x){return String(x??'').normalize('NFKC').trim().slice(0,700);}
function classify(entries,current,context){
  return entries.map((entry,index)=>({id:entry.id,score:(entry.rx.test(current)?4:0)+(context&&entry.rx.test(context)?1:0),index}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index)[0]||null;
}
const CONTENT={
 protocol:[
  ['Правила и извори','Кои важечки правила и официјални извори треба да се проверат за ова?','Rules and sources','Which applicable rules and official sources should be checked for this?'],
  ['Практичен пример','Покажи конкретен илустративен пример, со гледна точка и ограничувања.','Practical example','Show a concrete illustrative example, with perspective and limitations.'],
  ['Проверка на грешки','Кои типични протоколарни грешки треба да се избегнат?','Common mistakes','Which typical protocol mistakes should be avoided?']
 ],
 diplomacy:[
  ['Дипломатски контекст','Објасни го дипломатскиот контекст и разликата меѓу пракса и задолжителни правила.','Diplomatic context','Explain the diplomatic context and distinguish practice from binding rules.'],
  ['Официјални извори','Кои официјални извори го поткрепуваат одговорот?','Official sources','Which official sources support the answer?'],
  ['Подготовка за средба','Изработи подготвителна листа за проверка, без службено одобрување.','Meeting preparation','Prepare a provisional checklist, without official approval.']
 ],
 research:[
  ['Провери докази','Оддели ги проверените факти, толкувањата и ограничувањата.','Verify evidence','Separate verified facts, interpretations and limitations.'],
  ['APA 7 и цитати','Предложи проверливи извори и APA 7 референци; означи што не е потврдено.','APA 7 and citations','Suggest verifiable sources and APA 7 references; flag anything unverified.'],
  ['Синтеза и следен чекор','Направи кратка синтеза и предложи следен истражувачки чекор.','Synthesis and next step','Provide a concise synthesis and suggest the next research step.']
 ],
 document:[
  ['План за анализа','Предложи план за анализа на документите и кои податоци се потребни. Не тврди дека си прочитал недостапни прилози.','Analysis plan','Suggest a document analysis plan and required inputs. Do not claim to have read unavailable attachments.'],
  ['Споредба на верзии','Објасни како да се споредат верзиите со наведување на конкретни страници кога материјалот е достапен.','Compare versions','Explain how to compare versions with specific page references when materials are available.'],
  ['Проверка на извори','Предложи критериуми за проверка на извори, цитати и недоследности.','Source verification','Suggest criteria for checking sources, citations and inconsistencies.']
 ],
 event:[
  ['Распоред и улоги','Подготви илустративна агенда и листа на улоги; означи ги податоците што недостигаат.','Agenda and roles','Prepare an illustrative agenda and list of roles; identify missing inputs.'],
  ['Пресеанс','Кои информации се потребни за да се предложи пресеанс и распоред на седење?','Precedence','What information is needed to propose precedence and seating?'],
  ['Проверки пред настан','Подготви листа за проверка пред настанот, со човечко одобрување.','Event checklist','Prepare a pre-event checklist, subject to human approval.']
 ],
 communication:[
  ['Работен нацрт','Предложи јасен работен нацрт со соодветна публика и тон.','Draft','Suggest a clear working draft with appropriate audience and tone.'],
  ['Ризици од погрешно толкување','Посочи можни двосмислености и како да се избегнат.','Misinterpretation risks','Identify possible ambiguities and how to avoid them.'],
  ['Провери порака','Провери ја јасноста, фактите и институционалниот тон.','Review message','Check clarity, facts and institutional tone.']
 ],
 ai:[
  ['Граници и човечка порта','Оддели што може да подготви ВИ од она што бара човечко одобрување.','Boundaries and Human Gate','Distinguish what AI may prepare from what requires human approval.'],
  ['Функционален тест','Предложи проверливи тестови за функцијата и нејзините ограничувања.','Functional test','Suggest verifiable tests for the feature and its limitations.'],
  ['Синтеза на ризици','Направи синтеза на придобивките, ризиците и следните чекори.','Risk synthesis','Summarise benefits, risks and next steps.']
 ],
 general:[
  ['Појасни','Објасни го ова со практичен пример.','Clarify','Explain this with a practical example.'],
  ['Докази','Оддели ги фактите од претпоставките и наведи ограничувања.','Evidence','Separate facts from assumptions and state limitations.'],
  ['Следен чекор','Предложи го следниот логичен чекор.','Next step','Suggest the next logical step.']
 ]
};
const INTENT_LEADS={
 compare:['Критериуми за споредба','Спореди според исти критериуми и наведи ги ограничувањата.','Comparison criteria','Compare using consistent criteria and state limitations.'],
 verify:['Потврди ја основата','Наведи што е потврдено, што не е, и како може да се провери.','Check evidence','State what is verified, what is not, and how it can be checked.'],
 translate:['Зачувај го значењето','Зачувај ја смислата и терминологијата; означи нејасни изрази.','Preserve meaning','Preserve meaning and terminology; flag ambiguous expressions.'],
 draft:['Прилагоди го нацртот','Предложи работен нацрт и означи каде се потребни дополнителни податоци.','Tailor draft','Suggest a working draft and mark where additional inputs are needed.'],
 plan:['Чекори и проверки','Раздели го планот на чекори, предуслови и проверки.','Steps and checks','Separate the plan into steps, prerequisites and checks.'],
 analyse:['Синтеза','Издвои главни наоди, докази, ограничувања и следни чекори.','Synthesis','Extract key findings, evidence, limitations and next steps.']
};
export function anticipate({draft='',history=[],lang='mk'}={}){
 const q=clean(draft), recent=(Array.isArray(history)?history:[]).filter(x=>x&&x.role==='user').map(x=>clean(x.content)).filter(Boolean).slice(-3);
 const current=q||recent.at(-1)||'';
 if(!current || (q && q.length<3))return {version:VERSION,stage:'idle',topic:null,intent:null,contextUsed:false,suggestions:[]};
 const previous=q?recent:recent.slice(0,-1);
 const useContext=previous.length>0&&(FOLLOW.test(current)||current.length<=30)&&!classify(TOPICS,current,'');
 const context=useContext?previous.join(' '):'';
 const topic=classify(TOPICS,current,context)?.id||'general';
 const intent=classify(INTENTS,current,context)?.id||null;
 const stage=q?'draft':'followup',en=lang.startsWith('en');
 const items=[...CONTENT[topic]];
 if(intent&&INTENT_LEADS[intent])items.unshift(INTENT_LEADS[intent]);
 return {version:VERSION,stage,topic,intent,contextUsed:!!context,suggestions:items.slice(0,3).map(x=>({label:x[en?2:0],prompt:x[en?3:1]})),inference:'heuristic_not_confirmed'};
}
export function mountProactiveIntent(panel,{getHistory=()=>[]}={}){
 if(!panel||panel.querySelector('[data-wpa-proactive]'))return null;
 const input=panel.querySelector('#wpaPublicVsInput'),form=panel.querySelector('#wpaPublicVsForm');
 if(!input||!form)return null;
 const lang=document.documentElement.lang?.startsWith('en')?'en':'mk';
 const en=lang==='en';
 const box=document.createElement('details');
 box.dataset.wpaProactive=VERSION;
 box.open=true;
 box.style.cssText='font:12px/1.4 system-ui,sans-serif;padding:5px 10px;background:#f9f5e8;color:#17304d;flex-shrink:0;border-top:1px solid #d4c49a';
 const title=document.createElement('summary');title.style.cssText='cursor:pointer;font-weight:700';
 title.textContent=en?'Suggested next steps':'Предложени следни чекори';
 const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap;padding:4px 0';
 const note=document.createElement('div');note.setAttribute('role','status');note.style.cssText='font-size:11px;color:#665b43';
 const defaultNote=en?'Local suggestions; you choose what to send.':'Локални предлози; вие одлучувате што да испратите.';
 box.append(title,actions,note);form.parentNode.insertBefore(box,form);
 function refresh(){
  const state=anticipate({draft:input.value,history:getHistory(),lang});
  box.hidden=state.suggestions.length===0;
  actions.replaceChildren();
  note.textContent=defaultNote;
  title.textContent=state.stage==='draft'?(en?'Complete your question':'Дополни го прашањето'):(en?'Suggested next steps':'Предложени следни чекори');
  for(const item of state.suggestions){
   const b=document.createElement('button');b.type='button';b.textContent=item.label;b.title=item.prompt;
   b.style.cssText='font:11px system-ui,sans-serif;border:1px solid #bdad85;background:white;color:#17304d;border-radius:12px;padding:4px 8px;cursor:pointer';
   b.onclick=()=>{
    const draft=input.value.trim();
    if(draft.includes(item.prompt)){input.focus();return;}
    const proposed=draft?draft+'\n\n'+item.prompt:item.prompt;
    const max=input.maxLength>0?input.maxLength:700;
    if(proposed.length>max){note.textContent=en?'Shorten the draft before adding this suggestion.':'Скратете го текстот пред да го додадете предлогот.';return;}
    input.value=proposed;input.focus();input.dispatchEvent(new Event('input',{bubbles:true}));
   };
   actions.append(b);
  }
 }
 input.addEventListener('input',refresh);
 input.addEventListener('focus',refresh);
 refresh();
 return {refresh};
}

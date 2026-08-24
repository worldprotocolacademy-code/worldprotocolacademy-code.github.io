export const VERSION='wpa-strategic-prompt-router-1.0.1';
export const FRAMEWORK_PATH='/data/wpa-strategic-prompt-framework.json';
export const PROMPT_DESK_PATH='/tools/wpa-prompt-desk/';
export const DEFAULT_MODEL='@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export const COMMON_OUTPUT_CONTRACT={
  mk:['Цел','Факти и претпоставки','Најголем leverage / полуга','Најдобра стратегија','Ризици и ограничувања','Што да не се прави','Следни три конкретни чекори','Мерлив критериум за успех'],
  en:['Objective','Facts and assumptions','Highest-leverage point','Best strategy','Risks and constraints','What not to do','Next three concrete actions','Measurable success criterion']
};

export const PROMPTS={
  SP01:{slug:'strategic-leverage-thinking',title_mk:'Стратегиско размислување со висок leverage',title_en:'High-Leverage Strategic Thinking',agents:[2,9,10,14,17],directive_mk:'Анализирај системски и долгорочно: второредни последици, leverage, opportunity cost, асиметрични можности и долгорочна вредност. Наведи што да се елиминира, автоматизира, кој е главниот ризик и следниот чекор.',directive_en:'Analyse systemically and long-term: second-order effects, leverage, opportunity cost, asymmetric opportunities and long-term value. Identify what to eliminate or automate, the principal risk and the next action.'},
  SP02:{slug:'accelerated-deep-learning',title_mk:'Забрзано учење и длабоко совладување',title_en:'Accelerated Learning and Deep Mastery',agents:[2,3,9,17],directive_mk:'Изгради реалистична патека за длабоко учење со active recall, spaced repetition, interleaving, Feynman technique, deliberate practice, практични задачи и мерливи критериуми. Не ветувај 10× резултат.',directive_en:'Build a realistic deep-learning path using active recall, spaced repetition, interleaving, the Feynman technique, deliberate practice, practical tasks and measurable criteria. Do not promise 10x outcomes.'},
  SP03:{slug:'expert-mastery-path',title_mk:'Мајсторско совладување на експертска област',title_en:'Expert Mastery Path',agents:[2,3,5,9,10,17],directive_mk:'Организирај патека од фундаментални принципи преку практична примена и сложени случаи до експертска проценка. Вклучи задачи, симулации, клучни извори, common failure modes и критериуми за напредок.',directive_en:'Organise a path from fundamentals through practical application and complex cases to expert judgement. Include tasks, simulations, key sources, common failure modes and progression criteria.'},
  SP04:{slug:'cognitive-workflow-upgrade',title_mk:'Надградба на начинот на размислување и работа',title_en:'Cognitive and Workflow Upgrade',agents:[2,3,9,10,17],directive_mk:'Фокусирај се на набљудливи работни навики, процеси и техники за јасност, одлучување, фокус, организација, паметење и креативност. Не поставувај психолошки дијагнози и не користи концепт на психолошко репрограмирање.',directive_en:'Focus on observable work habits, processes and techniques for clarity, decision-making, focus, organisation, memory and creativity. Do not diagnose or frame the task as psychological reprogramming.'},
  SP05:{slug:'sustainable-high-performance-life',title_mk:'Дизајн на одржлив живот со висок учинок',title_en:'Sustainable High-Performance Life Design',agents:[2,9,17],directive_mk:'Оптимизирај за одржлив баланс на време, општа благосостојба, финансиска стабилност, односи, професионална работа и смисла. Разликувај што да се елиминира, делегира, автоматизира и лично задржи. Не поставувај здравствени дијагнози.',directive_en:'Optimise for a sustainable balance of time, general wellbeing, financial stability, relationships, professional work and meaning. Distinguish what to eliminate, delegate, automate and retain personally. Do not diagnose health conditions.'},
  SP06:{slug:'time-compression-through-leverage',title_mk:'Компресија на времето преку leverage',title_en:'Time Compression Through Leverage',agents:[2,8,9,10,14,17],directive_mk:'Барај побрз пат без жртвување на квалитет, законитост, точност или репутација. Идентификувај 80/20 активности, automation, AI-поддршка, делегирање, reusable assets, паралелизација, bottlenecks и мерливи milestones.',directive_en:'Find a faster path without sacrificing quality, legality, accuracy or reputation. Identify 80/20 activities, automation, AI support, delegation, reusable assets, parallelisation, bottlenecks and measurable milestones.'},
  SP07:{slug:'best-professional-self',title_mk:'Изградба на мојата најдобра професионална верзија',title_en:'Building My Best Professional Self',agents:[2,3,9,17],directive_mk:'Спореди сегашна и посакувана професионална состојба и идентификувај gaps во знаење, навики, однесување, дисциплина и системи. Наведи што да се задржи, прекине и започне, со мерливи показатели. Без „уништување на идентитет“.',directive_en:'Compare the current and desired professional state and identify gaps in knowledge, habits, behaviour, discipline and systems. Specify what to keep, stop and start, with measurable indicators. No identity-destruction framing.'},
  SP08:{slug:'wpa-master-strategy-research-execution',title_mk:'WPA Master Prompt — Strategy + Research + Evidence + Leverage + Agents + Human Gate + Execution + Audit',title_en:'WPA Master Prompt — Strategy + Research + Evidence + Leverage + Agents + Human Gate + Execution + Audit',agents:[1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17],directive_mk:'Класифицирај ја мисијата; оддели проверени факти, претпоставки, отворени прашања, ризици и потребни докази; изгради evidence map; избери релевантни agents/tools/sources; најди leverage и bottleneck; паралелизирај без жртвување точност; означи capability status; блокирај consequential action до Human Gate; заврши со execution sequence, KPI и final audit checklist. Accuracy > Deadline.',directive_en:'Classify the mission; separate verified facts, assumptions, open questions, risks and required evidence; build an evidence map; select relevant agents/tools/sources; identify leverage and bottlenecks; parallelise without sacrificing accuracy; label capability status; block consequential action pending the Human Gate; finish with execution sequence, KPIs and a final audit checklist. Accuracy > Deadline.'}
};

const clean=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const has=(q,terms)=>terms.some(term=>q.includes(clean(term)));
const language=(message,lang='')=>lang==='en'?'en':lang==='mk'?'mk':/[а-шѓќѕџјљњ]/i.test(message)?'mk':'en';
const normalizePromptId=id=>{const match=String(id||'').toUpperCase().match(/^SP0?([1-8])$/);return match?`SP0${match[1]}`:String(id||'').toUpperCase();};
const validId=id=>Object.prototype.hasOwnProperty.call(PROMPTS,String(id||'').toUpperCase());

const SIGNALS={
  SP01:['стратег','strategy','leverage','полуга','приоритет','priorit','позиционира','positioning','opportunity cost','асиметр','asymmetr','партнер','partner','ресурс','resource allocation'],
  SP02:['научи ме','сакам да науч','учење','learning plan','learn ','study ','90 ден','90 day','spaced repetition','active recall','feynman','тема','topic'],
  SP03:['експерт','expert','мајстор','mastery','вештина','skill','ментор','mentor','од почетник','from beginner','напредно ниво','advanced level'],
  SP04:['начин на работа','workflow','одлучува','decision making','фокус','focus','организац','organisation','organization','памте','memory','креатив','creative','работни навики','work habits'],
  SP05:['живот','life design','баланс','balance','wellbeing','благосостој','односи','relationships','финансиска стабил','financial stability','време здравје','time health'],
  SP06:['побрзо','забрза','accelerat','рок','deadline','автоматизац','automation','делегира','delegat','80 20','time compression','компресија на врем','паралел','parallel','bottleneck','reusable'],
  SP07:['најдобра верзија','best version','професионален развој','professional development','лидер','leadership','дисциплин','discipline','навики','habits','посакувана верзија','desired version'],
  SP08:['opn','partner network','сеопфатен аудит','comprehensive audit','institutional architecture','институционална архитектура','evidence package','пакет докази','external pilot','надворешен пилот','publication master','издавачки master','major wpa','голем wpa проект','wpa institute','wpa институт','world protocol academy']
};

const MAJOR_TERMS=['сеопфат','comprehensive','master','целосен','full','architecture','архитектура','package','пакет','publication','публикац','book','книга','opn','partner network','pilot','пилот','audit','аудит','deployment','deploy','production','институцион'];
const WPA_TERMS=['wpa','world protocol academy','virtual sande','wpaws','protocolometry','протоколометрија','opn'];

function scoreRoute(q,id){let score=0;for(const term of SIGNALS[id])if(q.includes(clean(term)))score+=term.length>12?3:2;return score;}

export function routeStrategicPrompt(message='',options={}){
  const raw=String(message||'').trim(),q=clean(raw),lang=language(raw,options.lang||'');
  const override=normalizePromptId(options.promptId||options.prompt_id||'');
  const explicit=normalizePromptId((raw.match(/\bSP0?[1-8]\b/i)||[])[0]||'');
  const requested=validId(override)?override:validId(explicit)?explicit:null;
  if(requested){const p=PROMPTS[requested];return {selected:true,automatic:false,id:requested,slug:p.slug,title:p[`title_${lang}`],language:lang,confidence:'explicit',score:100,reason:'explicit_prompt_selection',recommended_agent_ids:p.agents,framework_path:FRAMEWORK_PATH,prompt_desk_path:PROMPT_DESK_PATH,directive:p[`directive_${lang}`],common_output_contract:COMMON_OUTPUT_CONTRACT[lang]};}
  if(!q)return {selected:false,automatic:true,id:null,language:lang,confidence:'none',score:0,reason:'empty_message',framework_path:FRAMEWORK_PATH};
  const scores=Object.keys(PROMPTS).map(id=>({id,score:scoreRoute(q,id)}));
  const isWpa=has(q,WPA_TERMS),isMajor=has(q,MAJOR_TERMS)||options.majorWpa===true;
  if(isWpa&&isMajor)scores.find(x=>x.id==='SP08').score+=7;
  if(options.majorWpa===true)scores.find(x=>x.id==='SP08').score+=5;
  scores.sort((a,b)=>b.score-a.score||Number(a.id.slice(2))-Number(b.id.slice(2)));
  const best=scores[0],second=scores[1];
  if(best.score<2)return {selected:false,automatic:true,id:null,language:lang,confidence:'none',score:best.score,reason:'no_strategic_intent_above_threshold',framework_path:FRAMEWORK_PATH};
  const p=PROMPTS[best.id],margin=best.score-(second?.score||0),confidence=best.score>=8||margin>=5?'high':best.score>=4||margin>=2?'medium':'low';
  if(confidence==='low'&&best.score<4)return {selected:false,automatic:true,id:null,language:lang,confidence:'low',score:best.score,reason:'ambiguous_routing_signal',candidate:best.id,framework_path:FRAMEWORK_PATH};
  return {selected:true,automatic:true,id:best.id,slug:p.slug,title:p[`title_${lang}`],language:lang,confidence,score:best.score,reason:isWpa&&isMajor&&best.id==='SP08'?'major_wpa_mission':'intent_signal_match',recommended_agent_ids:p.agents,framework_path:FRAMEWORK_PATH,prompt_desk_path:PROMPT_DESK_PATH,directive:p[`directive_${lang}`],common_output_contract:COMMON_OUTPUT_CONTRACT[lang]};
}

export function buildRefinementSystemPrompt(route){
  if(!route?.selected)return'';
  const mk=route.language==='mk',contract=(route.common_output_contract||[]).map((x,i)=>`${i+1}) ${x}`).join('\n');
  return mk?`WPA STRATEGIC PROMPT ROUTER · ${route.id}\nТи си refinement layer, не нов извор на факти и не институционален носител на власт.\n${route.directive}\n\nПравила:\n- Одговори на македонски освен ако корисникот експлицитно бара друг јазик.\n- Не додавај факти, цитати, партнерства, deployment-и или правен статус што не се во BASE ANSWER или USER TASK.\n- Јасно разликувај проверени факти од претпоставки и препораки.\n- Не ветувај 10× резултати и не поставувај психолошки или медицински дијагнози.\n- Consequential institutional actions остануваат предмет на Human Gate.\n- Ако BASE ANSWER нема доволно фактичка основа, кажи што треба дополнително да се провери.\n- Не спомнувај SP routing освен ако корисникот не праша.\n\nСтруктура кога е корисна:\n${contract}`:`WPA STRATEGIC PROMPT ROUTER · ${route.id}\nYou are a refinement layer, not a new source of facts and not an institutional authority.\n${route.directive}\n\nRules:\n- Reply in English unless the user explicitly requests another language.\n- Do not add facts, citations, partnerships, deployments or legal status not present in the BASE ANSWER or USER TASK.\n- Clearly distinguish verified facts from assumptions and recommendations.\n- Do not promise 10x outcomes and do not diagnose psychological or medical conditions.\n- Consequential institutional actions remain subject to the Human Gate.\n- If the BASE ANSWER lacks sufficient factual support, state what still requires verification.\n- Do not mention SP routing unless the user asks.\n\nStructure when useful:\n${contract}`;
}

function parseAiText(result){if(typeof result==='string')return result.trim();if(typeof result?.response==='string')return result.response.trim();if(typeof result?.result?.response==='string')return result.result.response.trim();return'';}
function canRefine(payload){if(!payload||payload.ok===false||!String(payload.answer||'').trim())return false;return !['greeting','request_error','health','journal_live_strict_search','journal_live_unavailable','tool_capability_route','multisystem_overview','global_institutions_search'].includes(String(payload.mode||''));}
async function requestInput(request,url){let message=url.searchParams.get('message')||url.searchParams.get('q')||'',lang=url.searchParams.get('lang')||'';if(request.method==='POST')try{const body=await request.clone().json();message=message||body.message||body.q||body.prompt||'';lang=lang||body.lang||body.rawLang||body.aiLang||body.language||'';}catch{}return{message:String(message).trim(),lang:String(lang).toLowerCase().trim()};}
function diagnosticHeaders(request,env){const origin=request.headers.get('Origin')||'',allowed=[...String(env?.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean),'https://worldprotocolacademy.mk','https://www.worldprotocolacademy.mk','https://worldprotocolacademy-code.github.io'];return{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':origin&&allowed.includes(origin)?origin:(allowed[0]||'*'),'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','x-wpa-prompt-router':VERSION,'vary':'Origin'};}

export function withStrategicPromptRouting(worker){
  return {async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/prompt-router/health')return new Response(JSON.stringify({ok:true,version:VERSION,framework:FRAMEWORK_PATH,prompts:8,mode:String(env?.WPA_PROMPT_ROUTING_MODE||'enhance'),human_gate_required:true},null,2),{status:200,headers:diagnosticHeaders(request,env)});
    if(url.pathname==='/prompt-router/route'){
      const input=await requestInput(request,url),route=routeStrategicPrompt(input.message,{lang:input.lang,promptId:url.searchParams.get('prompt')||undefined});
      return new Response(JSON.stringify({ok:true,version:VERSION,message:input.message,route},null,2),{status:200,headers:diagnosticHeaders(request,env)});
    }
    if(url.pathname!=='/ask')return worker.fetch(request,env,ctx);
    const input=await requestInput(request,url),route=routeStrategicPrompt(input.message,{lang:input.lang});
    const baseResponse=await worker.fetch(request,env,ctx);
    if(!route.selected||!(baseResponse instanceof Response))return baseResponse;
    const contentType=baseResponse.headers.get('content-type')||'';
    if(!contentType.includes('application/json'))return baseResponse;
    let payload;try{payload=await baseResponse.clone().json();}catch{return baseResponse;}
    payload.strategic_prompt={router_version:VERSION,selected:true,automatic:route.automatic,id:route.id,slug:route.slug,title:route.title,confidence:route.confidence,reason:route.reason,framework_path:route.framework_path,human_gate_required:true};
    const routingMode=String(env?.WPA_PROMPT_ROUTING_MODE||'enhance').toLowerCase();
    let refinementStatus='routing_only';
    if(routingMode==='enhance'&&canRefine(payload)&&env?.AI?.run){
      try{
        const system=buildRefinementSystemPrompt(route),base=String(payload.answer||'').slice(0,9000),task=input.message.slice(0,1200);
        const result=await env.AI.run(String(env?.WPA_PROMPT_ROUTER_MODEL||DEFAULT_MODEL),{messages:[{role:'system',content:system},{role:'user',content:`USER TASK:\n${task}\n\nBASE ANSWER:\n${base}\n\nRefine the answer according to the selected WPA strategic prompt. Preserve factual boundaries and source discipline.`}],max_tokens:1200});
        const refined=parseAiText(result);if(refined){payload.answer=refined;refinementStatus='enhanced';}else refinementStatus='empty_refinement_fallback';
      }catch{refinementStatus='refinement_error_fallback';}
    }
    payload.strategic_prompt.refinement_status=refinementStatus;
    const headers=new Headers(baseResponse.headers);headers.set('content-type','application/json; charset=utf-8');headers.set('x-wpa-prompt-router',VERSION);headers.set('x-wpa-prompt-id',route.id);
    return new Response(JSON.stringify(payload,null,2),{status:baseResponse.status,statusText:baseResponse.statusText,headers});
  }};
}

export const __test={clean,language,scoreRoute,canRefine,parseAiText};
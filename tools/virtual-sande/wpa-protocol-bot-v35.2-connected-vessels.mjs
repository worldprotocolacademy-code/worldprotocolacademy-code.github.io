import v351 from './wpa-protocol-bot-v35.1-safe-entrypoint.mjs';
import { buildOrchestrationPlan } from './wpa-central-orchestrator.mjs';

const VERSION = 'v35.2-connected-vessels-phase3';
const PUBLIC_ROOT = 'https://worldprotocolacademy-code.github.io';

const EXTRA_SYSTEMS = {
  premium_briefings:{name:'WPA Premium Briefings',url:'/wpa-briefings.html',status:'curated_human_approved_output',capabilities:['executive briefing','research synthesis'],boundaries:['human approval required','no automatic publication']},
  services:{name:'WPA Services',url:'/wpa-services.html',status:'live_request_builder',capabilities:['institutional proposal builder','service routing','email-ready brief'],boundaries:['human scoping required','no automatic contract or accreditation']},
  institutional_profile:{name:'WPA Institutional Profile',url:'/wpa-one-page-service-profile.html',status:'institutional_public_profile',capabilities:['institutional presentation','verified public profile'],boundaries:['no invented recognition, accreditation or partnerships']},
  digital_pavilion:{name:'WPA Digital Pavilion',url:'/tools/wpa-digital-pavilion/',status:'public_experience_hub',capabilities:['public engagement','interactive protocol experience'],boundaries:['human-reviewed public content']},
  protocolometry:{name:'WPA Protocolometry Center',url:'/protocolometry-center.html',status:'operational',capabilities:['measurement','comparative analysis','traceability'],boundaries:['public-source only','human review required']},
  intelligence_center:{name:'WPA Intelligence Center — legacy alias',url:'/intelligence-center.html',status:'protocolometry_legacy_alias',capabilities:['redirect-compatible public-source analysis'],boundaries:['preferred public term is Protocolometry Center','not an intelligence service']},
  live_feed:{name:'WPA Live Feed',url:'/wpa-live-intelligence-feed.html',status:'live_public_source',capabilities:['public-source monitoring','filtering','source traceability'],boundaries:['candidate signals only','original source remains authoritative']},
  academic_search:{name:'WPA Academic Search Hub',url:'/tools/academic-search-hub/',status:'staging_external_discovery',capabilities:['bibliographic discovery','source traceability','authority and RAG gate'],boundaries:['no scraping or paywall bypass','manual academic verification required']},
  wpaws:{name:'WPAWS 17 Agents',url:'/wpaws/',status:'orchestrated_agent_layer',capabilities:['research workflow','review','editing','doctrinal synthesis'],boundaries:['agent output is advisory until mandatory gates pass']},
  protocol_symbols:{name:'WPA Protocol Symbols Lab',url:'/wpaws/protocol-symbols-verified/',status:'verified_dataset_ui',capabilities:['flags','anthems','state symbols','national days'],boundaries:['verified dataset only','no LLM guessing']},
  multi_ai:{name:'WPA Multi-AI Command Center',url:'/multi-ai-command-center.html',status:'simulation_prototype',capabilities:['prompt comparison','role-based simulated advisors'],boundaries:['simulation mode is not real provider output']},
  journal_issue_1:{name:'WPA Journal — Volume I · Issue I',url:'/journal/vol-1-issue-1-2026.html',status:'public_flipbook_forthcoming_identifiers',capabilities:['journal presentation'],boundaries:['do not invent ISSN or DOI']},
  diplomatic_analysis:{name:'WPA Diplomatic Analysis Lab',url:'/wpaws/diplomatic-analysis-lab/',status:'phase1_public_source_analysis',capabilities:['diplomatic monitoring','analysis queue'],boundaries:['public-source layer only']}
};

const ROUTES = [
  {id:'protocolometry',terms:['protocolometry','протоколометрија','мерење','index','индекс'],url:'/protocolometry-center.html'},
  {id:'intelligence_center',terms:['intelligence center','legacy intelligence'],url:'/intelligence-center.html'},
  {id:'premium_briefings',terms:['premium briefings','briefing','брифинг','бриф'],url:'/wpa-briefings.html'},
  {id:'services',terms:['services','услуги','proposal','понуда','обука','audit'],url:'/wpa-services.html'},
  {id:'institutional_profile',terms:['institutional profile','институционален профил','one page profile'],url:'/wpa-one-page-service-profile.html'},
  {id:'digital_pavilion',terms:['digital pavilion','дигитален павилјон','павилјон'],url:'/tools/wpa-digital-pavilion/'},
  {id:'wpa_watch',terms:['wpa watch','rss','atom','monitoring','мониторинг'],url:'/tools/wpa-watch/'},
  {id:'journal_watch',terms:['journal watch','editorial queue','уредничка'],url:'/journal/watch/'},
  {id:'journal_live',terms:['journal live','live monitor','глобален монитор'],url:'/journal/live/'},
  {id:'live_feed',terms:['live feed','живо следење','јавни извори'],url:'/wpa-live-intelligence-feed.html'},
  {id:'wpaws',terms:['wpaws','17 agents','17 агенти','агенти'],url:'/wpaws/'},
  {id:'academic_search',terms:['academic search hub','academic search','академско пребарување','bibliographic discovery','библиографско пребарување','сите книги','all books'],url:'/tools/academic-search-hub/'},
  {id:'protocol_symbols',terms:['protocol symbols','state symbols','знамиња','химни'],url:'/wpaws/protocol-symbols-verified/'},
  {id:'multi_ai',terms:['multi-ai','ai consensus','80 council','council 80'],url:'/multi-ai-command-center.html'},
  {id:'journal_issue_1',terms:['volume i issue i','wpa journal issue'],url:'/journal/vol-1-issue-1-2026.html'},
  {id:'diplomatic_analysis',terms:['diplomatic analysis','дипломатска анализа'],url:'/wpaws/diplomatic-analysis-lab/'}
];

const clean=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const absolute=(path,env)=>String(env?.WPA_PUBLIC_ROOT||PUBLIC_ROOT).replace(/\/+$/,'')+path;
const routeMessage=message=>{const q=clean(message);return ROUTES.filter(route=>route.terms.some(term=>q.includes(clean(term))));};

function responseHeaders(request,env){const origin=request.headers.get('Origin')||'';const allowed=['https://worldprotocolacademy-code.github.io','https://worldprotocolacademy.com','https://www.worldprotocolacademy.com',...String(env?.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)];return {'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':allowed.includes(origin)?origin:allowed[0],'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','x-wpa-runtime':VERSION,'vary':'Origin'};}
const json=(body,request,env,status=200)=>new Response(JSON.stringify(body,null,2),{status,headers:responseHeaders(request,env)});
async function readMessage(request,url){let message=url.searchParams.get('message')||url.searchParams.get('q')||'';let context={};if(request.method==='POST'){try{const body=await request.clone().json();message=message||body.message||body.q||body.prompt||'';context=body.context||{};}catch{}}return {message:String(message).trim(),context};}

export const __test={routeMessage,EXTRA_SYSTEMS,ROUTES,buildOrchestrationPlan};

export default {
  async fetch(request,env){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:responseHeaders(request,env)});
    const url=new URL(request.url);
    if(url.pathname==='/connected-vessels/health')return json({ok:true,version:VERSION,base:'v35.1-safe-entrypoint',routes:ROUTES.length,extraSystems:Object.keys(EXTRA_SYSTEMS).length,centralOrchestrator:true},request,env);
    if(url.pathname==='/connected-vessels/routes')return json({ok:true,version:VERSION,routes:ROUTES.map(r=>({...r,url:absolute(r.url,env)})),extraSystems:Object.fromEntries(Object.entries(EXTRA_SYSTEMS).map(([id,x])=>[id,{id,...x,url:absolute(x.url,env)}]))},request,env);
    if(url.pathname==='/connected-vessels/route'){const {message,context}=await readMessage(request,url);const matches=routeMessage(message);return json({ok:true,version:VERSION,message,context,matches:matches.map(r=>({...r,url:absolute(r.url,env)})),orchestration:buildOrchestrationPlan(message),human_review_required:true},request,env);}
    if(url.pathname==='/orchestrator/plan'||url.pathname==='/academic-research/plan'){const {message,context}=await readMessage(request,url);return json({ok:true,version:VERSION,message,context,plan:buildOrchestrationPlan(message,{mode:url.searchParams.get('mode')||undefined}),human_review_required:true},request,env);}
    if(url.pathname==='/orchestrator/manifest')return json({ok:true,version:VERSION,identity:'Virtual Sande — heart, eyes and brain of WPA Institute',systems:EXTRA_SYSTEMS,pipeline:buildOrchestrationPlan('WPA Institute').pipeline},request,env);
    if(url.pathname==='/ask'){
      const {message,context}=await readMessage(request,url);const matches=routeMessage(message);const plan=buildOrchestrationPlan(message);
      const routed=matches.map(r=>`${r.id}: ${absolute(r.url,env)}`).join('\n');
      const prefix=`WPA CENTRAL ORCHESTRATOR CONTEXT\nVirtual Sande is the governed heart, eyes and brain of WPA Institute.\nMode: ${plan.mode}\nActive WPAWS agents: ${plan.wpaws_agents.map(a=>`${a.id}-${a.name}`).join(', ')}\nCouncil pillars: ${plan.council.selected_pillars.map(p=>p.name).join(', ')}\nRelevant systems:\n${routed||'General WPA Institute'}\nMandatory gates: Diplomatic Protocol Core, Evidence, Safety, Sande Human Approval.\nUser context: ${JSON.stringify(context)}\n\n`;
      const target=new URL(request.url);target.searchParams.set('message',prefix+message);return v351.fetch(new Request(target.toString(),request),env);
    }
    return v351.fetch(request,env);
  }
};

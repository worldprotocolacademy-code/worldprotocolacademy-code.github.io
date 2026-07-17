import v351 from './wpa-protocol-bot-v35.1-safe-entrypoint.mjs';

const VERSION = 'v35.2-connected-vessels-phase2';
const PUBLIC_ROOT = 'https://worldprotocolacademy-code.github.io';

const EXTRA_SYSTEMS = {
  services: { name: 'WPA Services', url: '/wpa-services.html', status: 'live_request_builder', capabilities: ['institutional proposal builder','service routing','email-ready brief'], boundaries: ['human scoping required','no automatic contract or accreditation'] },
  intelligence_center: { name: 'WPA Intelligence Center', url: '/intelligence-center.html', status: 'public_source_analysis', capabilities: ['source hierarchy','briefing workflow','public-source analysis'], boundaries: ['not an intelligence service','no private surveillance or secret sources'] },
  live_feed: { name: 'WPA Live Feed', url: '/wpa-live-intelligence-feed.html', status: 'live_public_source', capabilities: ['public-source monitoring','filtering','source traceability'], boundaries: ['candidate signals only','original source remains authoritative'] },
  audio_media: { name: 'WPA Audio Media Engine', url: '/audio-media-engine.html', status: 'functional_static_phase1', capabilities: ['audiobook workflow','content drafts','protocol scenarios','delivery planning'], boundaries: ['voice cloning, WebRTC and biometric controls require consent, backend security and legal review'] },
  academic_search: { name: 'WPA Academic Search Hub', url: '/tools/academic-search-hub/', status: 'staging_external_discovery', capabilities: ['bibliographic discovery','source traceability','authority and RAG gate'], boundaries: ['no scraping or paywall bypass','manual academic verification required'] },
  protocol_symbols: { name: 'WPA Protocol Symbols Lab', url: '/wpaws/protocol-symbols-verified/', status: 'verified_dataset_ui', capabilities: ['flags','anthems','state symbols','national days','country and organization profiles'], boundaries: ['verified dataset only','no LLM guessing for country or symbol claims'] },
  multi_ai: { name: 'WPA Multi-AI Command Center', url: '/multi-ai-command-center.html', status: 'simulation_prototype', capabilities: ['prompt comparison','role-based simulated advisors','consensus workspace'], boundaries: ['simulation mode is not real provider output','no invented live citations or costs'] },
  journal_issue_1: { name: 'WPA Journal — Volume I · Issue I', url: '/journal/vol-1-issue-1-2026.html', status: 'public_flipbook_forthcoming_identifiers', capabilities: ['inaugural flipbook','journal policies','editorial presentation'], boundaries: ['do not invent ISSN or DOI','forthcoming assets remain clearly marked'] },
  diplomatic_analysis: { name: 'WPA Diplomatic Analysis Lab', url: '/wpaws/diplomatic-analysis-lab/', status: 'phase1_public_source_analysis', capabilities: ['diplomatic monitoring','article analysis drawer','student analysis queue'], boundaries: ['public-source layer only','no classified or private operational data'] }
};

const ROUTES = [
  { id:'protocolometry', terms:['protocolometry','протоколометрија','мерење','index','индекс'], url:'/protocolometry-center.html' },
  { id:'five_engines', terms:['five engines','пет мотори','protocol score','risk meter','precedence'], url:'/tools/wpa-five-engines.html' },
  { id:'wpa_watch', terms:['wpa watch','rss','atom','monitoring','мониторинг'], url:'/tools/wpa-watch/' },
  { id:'journal_watch', terms:['journal watch','editorial queue','уредничка'], url:'/journal/watch/' },
  { id:'student_desk', terms:['student desk','студентско биро','модул','quiz','тест'], url:'/student-desk/' },
  { id:'intelligence_center', terms:['intelligence center','intelligence','разузнавач','аналитички центар'], url:'/intelligence-center.html' },
  { id:'services', terms:['services','услуги','proposal','понуда','обука','audit'], url:'/wpa-services.html' },
  { id:'journal_live', terms:['journal live','live monitor','глобален монитор'], url:'/journal/live/' },
  { id:'live_feed', terms:['live feed','живо следење','јавни извори'], url:'/wpa-live-intelligence-feed.html' },
  { id:'sublimate', terms:['sublimate','сублимат','document generator','документ'], url:'/wpa-sublimate-engine.html' },
  { id:'audio_media', terms:['audio media engine','audio-media engine','аудио медиумски мотор','аудио-медиумски мотор','audiobook','аудио книга'], url:'/audio-media-engine.html' },
  { id:'wpaws', terms:['wpaws','17 agents','агенти','ppp local'], url:'/wpaws/' },
  { id:'academic_search', terms:['academic search hub','academic search','академско пребарување','bibliographic discovery','библиографско пребарување'], url:'/tools/academic-search-hub/' },
  { id:'protocol_symbols', terms:['protocol symbols lab','protocol symbols','state symbols','знамиња','химни','државни симболи'], url:'/wpaws/protocol-symbols-verified/' },
  { id:'multi_ai', terms:['multi-ai command center','multi ai command center','multi-ai','повеќе ai','ai consensus'], url:'/multi-ai-command-center.html' },
  { id:'journal_issue_1', terms:['journal volume i issue i','volume i issue i','vol 1 issue 1','инаугурален број','wpa journal issue'], url:'/journal/vol-1-issue-1-2026.html' },
  { id:'diplomatic_analysis', terms:['diplomatic analysis lab','дипломатска анализа','diplomatic monitoring','student analysis queue'], url:'/wpaws/diplomatic-analysis-lab/' }
];

const clean = (s) => String(s || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const absolute = (path, env) => String(env?.WPA_PUBLIC_ROOT || PUBLIC_ROOT).replace(/\/+$/,'') + path;

function routeMessage(message) {
  const q = clean(message);
  return ROUTES.filter((route) => route.terms.some((term) => q.includes(clean(term))));
}

function responseHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ['https://worldprotocolacademy-code.github.io','https://worldprotocolacademy.com','https://www.worldprotocolacademy.com',...String(env?.ALLOWED_ORIGINS || '').split(',').map(x=>x.trim()).filter(Boolean)];
  return {'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':allowed.includes(origin)?origin:allowed[0],'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization','x-wpa-runtime':VERSION,'vary':'Origin'};
}
const json = (body, request, env, status=200) => new Response(JSON.stringify(body,null,2),{status,headers:responseHeaders(request,env)});

async function readMessage(request, url) {
  let message = url.searchParams.get('message') || url.searchParams.get('q') || '';
  let context = {};
  if (request.method === 'POST') {
    try { const body = await request.clone().json(); message = message || body.message || body.q || body.prompt || ''; context = body.context || {}; } catch {}
  }
  return {message:String(message).trim(),context};
}

export const __test = { routeMessage, EXTRA_SYSTEMS, ROUTES };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:responseHeaders(request,env)});
    const url = new URL(request.url);
    if (url.pathname === '/connected-vessels/health') return json({ok:true,version:VERSION,base:'v35.1-safe-entrypoint',routes:ROUTES.length,extraSystems:Object.keys(EXTRA_SYSTEMS).length},request,env);
    if (url.pathname === '/connected-vessels/routes') return json({ok:true,version:VERSION,routes:ROUTES.map(r=>({...r,url:absolute(r.url,env)})),extraSystems:Object.fromEntries(Object.entries(EXTRA_SYSTEMS).map(([id,x])=>[id,{id,...x,url:absolute(x.url,env)}]))},request,env);
    if (url.pathname === '/connected-vessels/route') {
      const {message,context} = await readMessage(request,url);
      const matches = routeMessage(message);
      return json({ok:true,version:VERSION,message,context,matches:matches.map(r=>({...r,url:absolute(r.url,env)})),human_review_required:true},request,env);
    }
    if (url.pathname === '/ask') {
      const {message,context} = await readMessage(request,url);
      const matches = routeMessage(message);
      if (matches.length) {
        const routed = matches.map(r=>`${r.id}: ${absolute(r.url,env)}`).join('\n');
        const prefix = `WPA connected-vessels context\nRelevant systems:\n${routed}\nUser context: ${JSON.stringify(context)}\n\n`;
        const target = new URL(request.url); target.searchParams.set('message',prefix+message);
        const delegated = new Request(target.toString(),request);
        return v351.fetch(delegated,env);
      }
    }
    return v351.fetch(request,env);
  }
};

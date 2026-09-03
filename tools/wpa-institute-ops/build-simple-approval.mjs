import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const OUT = path.join(ROOT, 'operations');
const SIMPLE = path.join(OUT, 'simple');

const readJson = async (p, fallback) => {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return fallback; }
};
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

await fs.mkdir(SIMPLE, { recursive: true });

const status = await readJson(path.join(OUT, 'institute-24x7-status.json'), { systems: {} });
const topics = await readJson(path.join(ROOT, 'journal/watch/topics.json'), []);
const productManifest = await readJson(path.join(ROOT, 'products/manifest.json'), { products: [] });
const verificationQueue = await readJson(path.join(ROOT, 'data/global-institutions/operations/verification-candidates.json'), { candidates: [] });
const watchStatus = await readJson(path.join(ROOT, 'tools/wpa-watch/status.json'), {});
const distributionQueue = await readJson(path.join(ROOT, 'data/social/product-distribution-queue.json'), { items: [], channel_states: [] });

const holds = topics.filter(t => t.status === 'classification_review' || t.review_hold).length;
const detected = topics.filter(t => t.status === 'detected').length;
const journalReady = Math.max(0, topics.length - holds);
const products = Array.isArray(productManifest.products) ? productManifest.products : [];
const institutionalCandidates = Array.isArray(verificationQueue.candidates) ? verificationQueue.candidates : [];
const distributionItems = Array.isArray(distributionQueue.items) ? distributionQueue.items : [];
const channelStates = Array.isArray(distributionQueue.channel_states) ? distributionQueue.channel_states : [];
const sys = status.systems || {};

const approvalQueue = {
  generated,
  mode: 'OWNER_APPROVAL_REQUIRED',
  owner_gate: {
    authority: 'Sande Smiljanov / WPA Human Authority',
    automatic_work: 'ENABLED_24X7',
    automatic_production_merge: 'DISABLED',
    automatic_external_publishing: 'DISABLED',
    approval_method: 'Explicit owner approval followed by protected production application and, where separately authorised, external distribution.',
    rule: 'The systems may collect, measure, validate, draft, adapt and package continuously. Production application, external social/messenger publication, canonical changes, scientific publication and official institutional judgments require explicit human approval.'
  },
  simple_flow: [
    { step: 1, name: 'COLLECT', mk: 'Собери', automation: 'automatic', systems: ['WPA Watch', 'Academic Search/Harvest'] },
    { step: 2, name: 'CHECK', mk: 'Провери', automation: 'automatic', systems: ['Protocolometry', 'Sublimate validation', 'Pilot 20 validation', 'Global Institutions evidence lane'] },
    { step: 3, name: 'PRODUCE', mk: 'Произведи', automation: 'automatic', systems: ['Journal Watch dossiers', 'WPA Product Factory'] },
    { step: 4, name: 'ADAPT', mk: 'Прилагоди', automation: 'automatic', systems: ['Social Command Centre', 'LinkedIn/Facebook/Instagram/X drafts', 'TikTok/YouTube scripts', 'Telegram/WhatsApp/Viber/WeChat community drafts'] },
    { step: 5, name: 'APPROVE', mk: 'Одобри', automation: 'human_only', systems: ['Production PR merge', 'External distribution release', 'Canonical revision', 'Scientific publication', 'Official institutional judgment'] },
    { step: 6, name: 'DISTRIBUTE', mk: 'Дистрибуирај', automation: 'authorised_only_after_approval', systems: ['Authorised human accounts', 'Separately verified official API adapters', 'Publication log and correction loop'] }
  ],
  current_cycle: {
    watch_sources_live: Number(watchStatus.sources_live || 0),
    watch_sources_total: Number(watchStatus.sources_total || 0),
    journal_candidates: topics.length,
    journal_ready_for_editorial_review: journalReady,
    journal_classification_holds: holds,
    journal_detected: detected,
    finished_product_families: products.length,
    distribution_product_packs: distributionItems.length,
    distribution_target_channels: channelStates.length,
    institutional_human_review_candidates: institutionalCandidates.length,
    protocolometry_status: sys.protocolometry?.status || 'unknown',
    sublimate_status: sys.sublimate?.source_validation || 'unknown',
    pilot20_status: sys.pilot20?.secure_bundle_validation || 'unknown'
  },
  queues: {
    journal: {
      state: holds ? 'HUMAN_REVIEW_PRESENT' : 'READY',
      total: topics.length,
      ready: journalReady,
      holds,
      source: '/journal/watch/'
    },
    products: {
      state: products.length ? 'BUILT_AWAITING_PRODUCTION_APPROVAL' : 'NO_PRODUCTS',
      total: products.length,
      source: '/products/'
    },
    distribution: {
      state: distributionItems.length ? 'PLATFORM_DRAFTS_READY_FOR_SANDE_GATE' : 'NO_DISTRIBUTION_DRAFTS',
      product_packs: distributionItems.length,
      target_channels: channelStates.length,
      automatic_external_publishing: 'DISABLED',
      source: '/social-studio/distribution/'
    },
    institutions: {
      state: institutionalCandidates.length ? 'HUMAN_VERIFICATION_QUEUE' : 'NO_CANDIDATES',
      total: institutionalCandidates.length,
      source: '/data/global-institutions/operations/verification-candidates.json'
    }
  }
};

await fs.writeFile(path.join(OUT, 'approval-queue.json'), JSON.stringify(approvalQueue, null, 2), 'utf8');
await fs.writeFile(path.join(OUT, 'system-map.json'), JSON.stringify({ generated, flow: approvalQueue.simple_flow }, null, 2), 'utf8');

const stage = (num, title, state, description, links) => `<article class="stage"><div class="num">0${num}</div><div><div class="state">${esc(state)}</div><h2>${esc(title)}</h2><p>${esc(description)}</p><div class="links">${links.map(l=>`<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div></div></article>`;
const html = `<!doctype html><html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>WPA Institute · Simple 24/7 Control</title><meta name="description" content="Simplified WPA Institute 24/7 operating model with explicit owner approval before production and external distribution."><style>
:root{--navy:#071326;--navy2:#0d1f3c;--gold:#c9a84c;--cream:#fbf8ee;--ink:#182133;--muted:#657083;--line:#ddd4bf;--white:#fff}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55}header{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-bottom:4px solid var(--gold);padding:54px 20px}header>div,main{max-width:1040px;margin:auto}.tag{display:inline-block;border:1px solid var(--gold);padding:6px 10px;color:#ead58e;font-size:12px;font-weight:850;letter-spacing:.08em}h1,h2{font-family:Georgia,serif}h1{font-size:clamp(32px,5.4vw,54px);margin:10px 0;color:#f1dc98}.lead{max-width:900px;color:#eee8da;font-size:18px}.gate{margin-top:20px;border:1px solid rgba(201,168,76,.55);padding:14px;background:rgba(201,168,76,.08);color:#fff}.gate strong{color:#f1dc98}main{padding:30px 20px 70px}.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-bottom:20px}.stat{background:#fff;border:1px solid var(--line);padding:15px}.stat b{display:block;font-size:26px;color:var(--navy2)}.stat span{font-size:12px;color:var(--muted)}.flow{display:grid;gap:14px}.stage{display:grid;grid-template-columns:72px 1fr;gap:16px;background:#fff;border:1px solid var(--line);border-left:5px solid var(--gold);padding:20px}.num{font:800 28px Georgia,serif;color:var(--gold)}.state{font-size:11px;font-weight:900;letter-spacing:.08em;color:#725819}.stage h2{margin:3px 0 7px;color:var(--navy2)}.stage p{margin:0 0 10px;color:var(--muted)}.links{display:flex;gap:8px;flex-wrap:wrap}.links a{background:var(--navy2);color:#fff;padding:8px 11px;text-decoration:none;font-weight:750;font-size:13px}.approval{margin-top:22px;background:#fff;border:2px solid var(--gold);padding:22px}.approval h2{margin-top:0}.foot{margin-top:18px;color:var(--muted);font-size:13px}@media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.stage{grid-template-columns:48px 1fr}}@media(max-width:460px){.stats{grid-template-columns:1fr}.stage{grid-template-columns:1fr}.num{font-size:18px}}</style></head><body>
<header><div><span class="tag">WPA INSTITUTE · SIMPLE 24/7 MODEL</span><h1>Собери → Провери → Произведи → Прилагоди → Одобри → Дистрибуирај</h1><p class="lead">WPA работи 24/7 до точката на човечко одобрување. Системите сами собираат, проверуваат, произведуваат и подготвуваат верзии за социјални мрежи и месинџери. Надворешното објавување започнува само по Sande Gate и само преку овластен канал.</p><div class="gate"><strong>Твојот режим:</strong> AUTO WORK = ON · AUTO SOCIAL/MESSENGER DRAFTS = ON · AUTO PUBLISH = OFF · OWNER APPROVAL = REQUIRED.</div></div></header>
<main><section class="stats"><div class="stat"><b>${esc(watchStatus.sources_live||0)}/${esc(watchStatus.sources_total||0)}</b><span>live public sources</span></div><div class="stat"><b>${esc(topics.length)}</b><span>Journal candidates</span></div><div class="stat"><b>${esc(products.length)}</b><span>finished product families</span></div><div class="stat"><b>${esc(distributionItems.length)}</b><span>social/messenger product packs</span></div><div class="stat"><b>${esc(channelStates.length)}</b><span>distribution targets</span></div></section>
<section class="flow">
${stage(1,'Собери','АВТОМАТСКИ 24/7','WPA Watch и Academic Harvest ги собираат јавните сигнали и академските метаподатоци без рачно кликање.',[{href:'/tools/wpa-watch/',label:'WPA Watch'},{href:'/tools/academic-search-hub/',label:'Academic Search'}])}
${stage(2,'Провери','АВТОМАТСКИ 24/7','Protocolometry мери traceability; Sublimate и Pilot 20 се валидираат; Global Institutions создава доказни кандидати без автоматско менување на канонот.',[{href:'/protocolometry-center.html',label:'Protocolometry'},{href:'/wpa-sublimate-engine.html',label:'Sublimate'},{href:'/wpa-global-institutions-master-list.html',label:'Institutions'}])}
${stage(3,'Произведи','АВТОМАТСКИ 24/7',`Journal Watch создава dossiers (${journalReady} ready / ${holds} hold), а Product Factory произведува ${products.length} верзионирани производни семејства.`,[{href:'/journal/watch/',label:'Journal Watch'},{href:'/products/',label:'Product Factory'}])}
${stage(4,'Прилагоди','АВТОМАТСКИ 24/7',`Секој готов производ автоматски добива platform-native drafts за LinkedIn, Facebook, Instagram, X, TikTok, YouTube, Telegram, WhatsApp, Viber и WeChat. Подготвени се ${distributionItems.length} product packs за ${channelStates.length} таргет канали.`,[{href:'/social-studio/distribution/',label:'Distribution Desk'},{href:'/social-studio/',label:'Social Command Centre'}])}
${stage(5,'Одобри','САМО ЧОВЕК','Production merge и надворешно објавување се блокирани сè додека ти експлицитно не го одобриш пакетот. Чувствителни и официјални содржини секогаш остануваат Human Gate.',[{href:'/operations/approval-queue.json',label:'Approval Queue JSON'},{href:'/data/social/product-distribution-queue.json',label:'Distribution Queue JSON'}])}
${stage(6,'Дистрибуирај','САМО ПО ОДОБРУВАЊЕ','По одобрување, пакетот може да оди преку овластен човечки профил или преку официјален API adapter што е посебно поврзан, тестиран и одобрен. Нема mass messaging, harvest на контакти или влегување во приватни групи.',[{href:'/social-studio/distribution/',label:'Prepared channel variants'},{href:'/operations/institute-24x7-status.json',label:'Full Status'}])}
</section><section class="approval"><h2>Human Gate</h2><p><strong>Едно правило:</strong> машините можат сами да ја завршат целата подготовка до „спремно за дистрибуција“. Ти одобруваш дали производот ќе влезе во production и дали конкретната social/messenger верзија смее да излезе јавно.</p><p>За Telegram, WhatsApp, Viber и WeChat се дозволени само официјални канали, заедници или business/official accounts со законска согласност и platform-approved пристап. Масовно несакано испраќање е исклучено.</p></section><div class="foot">Generated ${esc(generated)} · <a href="/operations/">Full Institute Operations</a> · <a href="/institute.html">WPA Institute</a></div></main></body></html>`;

await fs.writeFile(path.join(SIMPLE, 'index.html'), html, 'utf8');
console.log(JSON.stringify({generated, mode:approvalQueue.mode, journal:{total:topics.length,ready:journalReady,holds}, products:products.length, distribution_packs:distributionItems.length, distribution_channels:channelStates.length, institutional_candidates:institutionalCandidates.length}, null, 2));

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

const holds = topics.filter(t => t.status === 'classification_review' || t.review_hold).length;
const detected = topics.filter(t => t.status === 'detected').length;
const journalReady = Math.max(0, topics.length - holds);
const products = Array.isArray(productManifest.products) ? productManifest.products : [];
const institutionalCandidates = Array.isArray(verificationQueue.candidates) ? verificationQueue.candidates : [];
const sys = status.systems || {};

const approvalQueue = {
  generated,
  mode: 'OWNER_APPROVAL_REQUIRED',
  owner_gate: {
    authority: 'Sande Smiljanov / WPA Human Authority',
    automatic_work: 'ENABLED_24X7',
    automatic_production_merge: 'DISABLED',
    approval_method: 'Explicit owner approval followed by protected GitHub PR merge',
    rule: 'The systems may collect, measure, validate, draft and package continuously. Production application, canonical changes, scientific publication and official institutional judgments require explicit human approval.'
  },
  simple_flow: [
    { step: 1, name: 'COLLECT', mk: 'Собери', automation: 'automatic', systems: ['WPA Watch', 'Academic Search/Harvest'] },
    { step: 2, name: 'CHECK', mk: 'Провери', automation: 'automatic', systems: ['Protocolometry', 'Sublimate validation', 'Pilot 20 validation', 'Global Institutions evidence lane'] },
    { step: 3, name: 'PRODUCE', mk: 'Произведи', automation: 'automatic', systems: ['Journal Watch dossiers', 'WPA Product Factory'] },
    { step: 4, name: 'APPROVE', mk: 'Одобри', automation: 'human_only', systems: ['Production PR merge', 'Canonical revision', 'Scientific publication', 'Official institutional judgment'] }
  ],
  current_cycle: {
    watch_sources_live: Number(watchStatus.sources_live || 0),
    watch_sources_total: Number(watchStatus.sources_total || 0),
    journal_candidates: topics.length,
    journal_ready_for_editorial_review: journalReady,
    journal_classification_holds: holds,
    journal_detected: detected,
    finished_product_families: products.length,
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
const html = `<!doctype html><html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>WPA Institute · Simple 24/7 Control</title><meta name="description" content="Simplified WPA Institute 24/7 operating model with explicit owner approval before production application."><style>
:root{--navy:#071326;--navy2:#0d1f3c;--gold:#c9a84c;--cream:#fbf8ee;--ink:#182133;--muted:#657083;--line:#ddd4bf;--white:#fff}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55}header{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-bottom:4px solid var(--gold);padding:54px 20px}header>div,main{max-width:1040px;margin:auto}.tag{display:inline-block;border:1px solid var(--gold);padding:6px 10px;color:#ead58e;font-size:12px;font-weight:850;letter-spacing:.08em}h1,h2{font-family:Georgia,serif}h1{font-size:clamp(34px,6vw,58px);margin:10px 0;color:#f1dc98}.lead{max-width:850px;color:#eee8da;font-size:18px}.gate{margin-top:20px;border:1px solid rgba(201,168,76,.55);padding:14px;background:rgba(201,168,76,.08);color:#fff}.gate strong{color:#f1dc98}main{padding:30px 20px 70px}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}.stat{background:#fff;border:1px solid var(--line);padding:15px}.stat b{display:block;font-size:26px;color:var(--navy2)}.stat span{font-size:12px;color:var(--muted)}.flow{display:grid;gap:14px}.stage{display:grid;grid-template-columns:72px 1fr;gap:16px;background:#fff;border:1px solid var(--line);border-left:5px solid var(--gold);padding:20px}.num{font:800 28px Georgia,serif;color:var(--gold)}.state{font-size:11px;font-weight:900;letter-spacing:.08em;color:#725819}.stage h2{margin:3px 0 7px;color:var(--navy2)}.stage p{margin:0 0 10px;color:var(--muted)}.links{display:flex;gap:8px;flex-wrap:wrap}.links a{background:var(--navy2);color:#fff;padding:8px 11px;text-decoration:none;font-weight:750;font-size:13px}.approval{margin-top:22px;background:#fff;border:2px solid var(--gold);padding:22px}.approval h2{margin-top:0}.approval code{background:#f1eee6;padding:2px 5px}.foot{margin-top:18px;color:var(--muted);font-size:13px}@media(max-width:760px){.stats{grid-template-columns:repeat(2,1fr)}.stage{grid-template-columns:48px 1fr}}@media(max-width:460px){.stats{grid-template-columns:1fr}.stage{grid-template-columns:1fr}.num{font-size:18px}}</style></head><body>
<header><div><span class="tag">WPA INSTITUTE · SIMPLE 24/7 MODEL</span><h1>Собери → Провери → Произведи → Одобри</h1><p class="lead">Сите сложени WPA секции се сведуваат на четири јасни чекори. Првите три работат автоматски 24/7. Четвртиот е твојата Human Gate: ништо не се применува во production, канон или научно објавување без експлицитно одобрување.</p><div class="gate"><strong>Твојот режим:</strong> AUTO WORK = ON · AUTO MERGE = OFF · OWNER APPROVAL = REQUIRED.</div></div></header>
<main><section class="stats"><div class="stat"><b>${esc(watchStatus.sources_live||0)}/${esc(watchStatus.sources_total||0)}</b><span>live public sources</span></div><div class="stat"><b>${esc(topics.length)}</b><span>Journal candidates</span></div><div class="stat"><b>${esc(products.length)}</b><span>finished product families</span></div><div class="stat"><b>${esc(institutionalCandidates.length)}</b><span>institutional review candidates</span></div></section>
<section class="flow">
${stage(1,'Собери','АВТОМАТСКИ 24/7','WPA Watch и Academic Harvest ги собираат јавните сигнали и академските метаподатоци без рачно кликање.',[{href:'/tools/wpa-watch/',label:'WPA Watch'},{href:'/tools/academic-search-hub/',label:'Academic Search'}])}
${stage(2,'Провери','АВТОМАТСКИ 24/7','Protocolometry мери traceability; Sublimate и Pilot 20 се валидираат; Global Institutions создава доказни кандидати без автоматско менување на канонот.',[{href:'/protocolometry-center.html',label:'Protocolometry'},{href:'/wpa-sublimate-engine.html',label:'Sublimate'},{href:'/wpa-global-institutions-master-list.html',label:'Institutions'}])}
${stage(3,'Произведи','АВТОМАТСКИ 24/7',`Journal Watch создава dossiers (${journalReady} ready / ${holds} hold), а Product Factory произведува ${products.length} верзионирани производни семејства.`,[{href:'/journal/watch/',label:'Journal Watch'},{href:'/products/',label:'Product Factory'}])}
${stage(4,'Одобри','САМО ЧОВЕК','Секој 24/7 циклус може да подготви production update, но merge/apply останува блокиран сè додека ти експлицитно не го одобриш.',[{href:'/operations/approval-queue.json',label:'Approval Queue JSON'},{href:'/operations/institute-24x7-status.json',label:'Full Status'}])}
</section><section class="approval"><h2>Human Gate</h2><p><strong>Едно правило:</strong> системите можат сами да собираат, мерат, валидираат, анализираат, подготвуваат и пакуваат. За production примена, canonical revision, научно објавување, peer-review decision или официјален институционален суд е потребно твое експлицитно одобрување.</p><p>Техничкиот approval механизам е protected GitHub Pull Request. Scheduled cycle отвора/освежува PR; автоматски merge е исклучен.</p></section><div class="foot">Generated ${esc(generated)} · <a href="/operations/">Full Institute Operations</a> · <a href="/institute.html">WPA Institute</a></div></main></body></html>`;

await fs.writeFile(path.join(SIMPLE, 'index.html'), html, 'utf8');
console.log(JSON.stringify({generated, mode:approvalQueue.mode, journal:{total:topics.length,ready:journalReady,holds}, products:products.length, institutional_candidates:institutionalCandidates.length}, null, 2));

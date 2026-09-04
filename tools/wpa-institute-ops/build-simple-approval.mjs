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
const cognitive = await readJson(path.join(ROOT, 'data/wpa-institute-cognitive-operating-principle.json'), {});
const nativeCandidates = await readJson(path.join(ROOT, 'data/open-knowledge/wpa-native-candidates.json'), { candidates: [] });

const holds = topics.filter(t => t.status === 'classification_review' || t.review_hold).length;
const detected = topics.filter(t => t.status === 'detected').length;
const journalReady = Math.max(0, topics.length - holds);
const products = Array.isArray(productManifest.products) ? productManifest.products : [];
const institutionalCandidates = Array.isArray(verificationQueue.candidates) ? verificationQueue.candidates : [];
const distributionItems = Array.isArray(distributionQueue.items) ? distributionQueue.items : [];
const channelStates = Array.isArray(distributionQueue.channel_states) ? distributionQueue.channel_states : [];
const nativeItems = Array.isArray(nativeCandidates.candidates) ? nativeCandidates.candidates : [];
const sys = status.systems || {};

// Compatibility operating flow used by the existing validator and production queue.
const simpleFlow = [
  { step: 1, name: 'COLLECT', mk: 'Собери', automation: 'automatic', systems: ['WPA Watch', 'Academic Search/Harvest', 'Open Knowledge Agents'] },
  { step: 2, name: 'CHECK', mk: 'Провери', automation: 'automatic', systems: ['Rights/Source Gate', 'WPA-native transformation validation', 'Protocolometry', 'Sublimate validation', 'Pilot 20 validation', 'Global Institutions evidence lane'] },
  { step: 3, name: 'PRODUCE', mk: 'Произведи', automation: 'automatic', systems: ['Journal Watch editorial intelligence', 'WPA Product Factory'] },
  { step: 4, name: 'ADAPT', mk: 'Прилагоди', automation: 'automatic', systems: ['Virtual Sande', 'Viral Sande', 'Social Command Centre', 'Messenger/community drafts'] },
  { step: 5, name: 'APPROVE', mk: 'Одобри', automation: 'human_only', systems: ['Production PR merge', 'External distribution release', 'Canonical revision', 'Scientific publication', 'Official institutional judgment'] },
  { step: 6, name: 'DISTRIBUTE', mk: 'Дистрибуирај', automation: 'authorised_only_after_approval', systems: ['Authorised human accounts', 'Separately verified official API adapters', 'Publication log and correction loop'] }
];

// Canonical cognitive chain to the Human Gate. This is the Institute's knowledge-processing spine.
const cognitiveFlow = [
  { step: 1, name: 'COLLECT', mk: 'Собери', automation: 'automatic_24x7', rule: 'Collect only source-traceable public/open evidence and metadata.' },
  { step: 2, name: 'RIGHTS_SOURCE_CHECK', mk: 'Права / Извор', automation: 'automatic_fail_closed', rule: 'Verify source identity, access/reuse basis, provenance and access boundaries before substantive use.' },
  { step: 3, name: 'WPA_NATIVE_TRANSFORM', mk: 'WPA-native трансформација', automation: 'automatic_after_rights_gate', rule: 'Apply HGAIM, Doctrine Kernel, Institutional DNA, Protocolometry, strategy and capability-resilience lenses; no copy-paste substitution.' },
  { step: 4, name: 'CHECK', mk: 'Провери', automation: 'automatic_with_review_queues', rule: 'Validate relevance, traceability, contradictions, methodology candidates and editorial/institutional classifications.' },
  { step: 5, name: 'PRODUCE', mk: 'Произведи', automation: 'automatic_bounded_outputs', rule: 'Build WPA work products and editorial intelligence, not autonomous scientific publications or official judgments.' },
  { step: 6, name: 'ADAPT', mk: 'Прилагоди', automation: 'automatic_drafting', rule: 'Create use-case and platform-native variants while preserving one factual core, provenance and declared status.' },
  { step: 7, name: 'HUMAN_APPROVAL', mk: 'Човечко одобрување', automation: 'human_only', rule: 'Sande Gate controls production application, external publication, scientific/editorial decisions, canonical change and official institutional judgment.' }
];

const approvalQueue = {
  generated,
  mode: 'OWNER_APPROVAL_REQUIRED',
  cognitive_operating_principle: '/data/wpa-institute-cognitive-operating-principle.json',
  core_rule_mk: cognitive.core_rule_mk || 'WPA НЕ ГО ПРЕЗЕМА ТУЃОТО ЗНАЕЊЕ. WPA ГО ПРОВЕРУВА, ГО РАЗЛОЖУВА, ГО СООЧУВА СО СОПСТВЕНАТА ДОКТРИНА, ГО МЕРИ, ГО ПРЕИСПИТУВА И ОД НЕГО СОЗДАВА НОВА WPA ИНСТИТУЦИОНАЛНА ВРЕДНОСТ.',
  owner_gate: {
    authority: 'Sande Smiljanov / WPA Human Authority',
    automatic_work: 'ENABLED_24X7',
    automatic_production_merge: 'DISABLED',
    automatic_external_publishing: 'DISABLED',
    approval_method: 'Explicit owner approval followed by protected production application and, where separately authorised, external distribution.',
    rule: 'Machines may collect, rights-check, transform, measure, validate, draft, adapt and package. Production application and consequential release remain Human Gate controlled.'
  },
  cognitive_flow: cognitiveFlow,
  simple_flow: simpleFlow,
  post_approval_rule: 'DISTRIBUTE_OR_APPLY_ONLY_WITHIN_THE_APPROVED_SCOPE',
  current_cycle: {
    watch_sources_live: Number(watchStatus.sources_live || 0),
    watch_sources_total: Number(watchStatus.sources_total || 0),
    wpa_native_candidates: nativeItems.length,
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
    wpa_native: { state: nativeItems.length ? 'HUMAN_REVIEW_QUEUE' : 'NO_CANDIDATES', total: nativeItems.length, source: '/data/open-knowledge/wpa-native-candidates.json' },
    journal: { state: holds ? 'HUMAN_REVIEW_PRESENT' : 'READY', total: topics.length, ready: journalReady, holds, source: '/journal/watch/' },
    products: { state: products.length ? 'BUILT_AWAITING_PRODUCTION_APPROVAL' : 'NO_PRODUCTS', total: products.length, source: '/products/' },
    distribution: { state: distributionItems.length ? 'PLATFORM_DRAFTS_READY_FOR_SANDE_GATE' : 'NO_DISTRIBUTION_DRAFTS', product_packs: distributionItems.length, target_channels: channelStates.length, automatic_external_publishing: 'DISABLED', source: '/social-studio/distribution/' },
    institutions: { state: institutionalCandidates.length ? 'HUMAN_VERIFICATION_QUEUE' : 'NO_CANDIDATES', total: institutionalCandidates.length, source: '/data/global-institutions/operations/verification-candidates.json' }
  }
};

await fs.writeFile(path.join(OUT, 'approval-queue.json'), JSON.stringify(approvalQueue, null, 2), 'utf8');
await fs.writeFile(path.join(OUT, 'system-map.json'), JSON.stringify({ generated, cognitive_flow: cognitiveFlow, operating_flow: simpleFlow }, null, 2), 'utf8');

const stage = (num, title, state, description) => `<article class="stage"><div class="num">${String(num).padStart(2,'0')}</div><div><div class="state">${esc(state)}</div><h2>${esc(title)}</h2><p>${esc(description)}</p></div></article>`;
const html = `<!doctype html><html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>WPA Institute · Simple 24/7 Control</title><style>:root{--navy:#071326;--navy2:#0d1f3c;--gold:#c9a84c;--cream:#fbf8ee;--ink:#182133;--muted:#657083;--line:#ddd4bf}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55}header{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-bottom:4px solid var(--gold);padding:48px 20px}header>div,main{max-width:1080px;margin:auto}h1,h2{font-family:Georgia,serif}h1{color:#f1dc98;font-size:clamp(30px,5vw,52px)}.tag{display:inline-block;border:1px solid var(--gold);padding:6px 10px;color:#ead58e;font-size:12px;font-weight:900}.lead{max-width:920px;color:#eee8da}.rule{margin-top:18px;padding:14px;border:1px solid rgba(201,168,76,.55);background:rgba(201,168,76,.08)}main{padding:28px 20px 70px}.stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:18px}.stat,.stage,.doctrine{background:#fff;border:1px solid var(--line)}.stat{padding:12px}.stat b{display:block;font-size:24px}.stat span{font-size:12px;color:var(--muted)}.doctrine{border-left:5px solid var(--gold);padding:18px;margin-bottom:16px;font:700 18px Georgia,serif}.flow{display:grid;gap:12px}.stage{display:grid;grid-template-columns:64px 1fr;gap:14px;padding:18px;border-left:5px solid var(--gold)}.num{font:800 26px Georgia,serif;color:var(--gold)}.state{font-size:11px;font-weight:900;color:#725819}.stage h2{margin:2px 0 6px;color:var(--navy2)}.stage p{margin:0;color:var(--muted)}.gate{margin-top:20px;background:#fff;border:2px solid var(--gold);padding:20px}.links{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}.links a{background:var(--navy2);color:#fff;text-decoration:none;padding:8px 11px;font-weight:800;font-size:13px}@media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.stats{grid-template-columns:1fr}.stage{grid-template-columns:1fr}}</style></head><body><header><div><span class="tag">WPA INSTITUTE · COGNITIVE OPERATING SPINE</span><h1>Собери → Права/Извор → WPA-native → Провери → Произведи → Прилагоди → Човечко одобрување</h1><p class="lead">Ова е когнитивниот пат до Human Gate. По одобрувањето, дистрибуција или институционална примена е дозволена само во конкретно одобрениот опсег.</p><div class="rule"><strong>AUTO WORK = ON · RIGHTS GATE = FAIL-CLOSED · WPA-NATIVE TRANSFORM = ON · AUTO MERGE = OFF · AUTO PUBLISH = OFF · SANDE GATE = REQUIRED.</strong></div></div></header><main><section class="stats"><div class="stat"><b>${esc(watchStatus.sources_live||0)}/${esc(watchStatus.sources_total||0)}</b><span>live sources</span></div><div class="stat"><b>${esc(nativeItems.length)}</b><span>WPA-native candidates</span></div><div class="stat"><b>${esc(topics.length)}</b><span>Journal candidates</span></div><div class="stat"><b>${esc(products.length)}</b><span>product families</span></div><div class="stat"><b>${esc(distributionItems.length)}</b><span>distribution packs</span></div></section><section class="doctrine">${esc(approvalQueue.core_rule_mk)}</section><section class="flow">${cognitiveFlow.map(s=>stage(s.step,`${s.mk} · ${s.name}`,s.automation,s.rule)).join('')}</section><section class="gate"><h2>Human Gate</h2><p><strong>Крајната одлука не е автоматска.</strong> Production merge, научно/уредничко објавување, канонска промена, официјална институционална позиција и надворешна дистрибуција остануваат под човечка власт.</p><div class="links"><a href="/operations/approval-queue.json">Approval Queue</a><a href="/data/wpa-institute-cognitive-operating-principle.json">Cognitive Principle</a><a href="/data/open-knowledge/wpa-native-candidates.json">WPA-native Candidates</a><a href="/social-studio/distribution/">Distribution Desk</a></div></section></main></body></html>`;
await fs.writeFile(path.join(SIMPLE, 'index.html'), html, 'utf8');
console.log(JSON.stringify({generated,mode:approvalQueue.mode,cognitive_stages:cognitiveFlow.length,operating_stages:simpleFlow.length,wpa_native_candidates:nativeItems.length,journal:{total:topics.length,ready:journalReady,holds},products:products.length,distribution_packs:distributionItems.length},null,2));

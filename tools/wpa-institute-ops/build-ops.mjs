import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const cycleHours = 3;
const batchSize = Math.max(4, Math.min(32, Number(process.env.WPA_INSTITUTION_BATCH || 16)));
const OUT = path.join(ROOT, 'operations');
const GI_OUT = path.join(ROOT, 'data/global-institutions/operations');
const MASTER = path.join(ROOT, 'data/global-institutions/v1.0-corrected-4f-rev3/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.json');
const SUBLIMATE_MANIFEST = path.join(ROOT, 'workers/wpa-sublimate-engine-v0.3.0/package-manifest.json');
const PRODUCT_MANIFEST = path.join(ROOT, 'products/manifest.json');
const PROTOCOLometry_DIGEST = path.join(ROOT, 'products/protocolometryDigest.json');
const STATUS_PATH = path.join(OUT, 'institute-24x7-status.json');

const readJson = async (file, fallback = null) => {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; }
};
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function probe(url, { timeout = 12000 } = {}) {
  if (!url) return { url: null, observed: false, class: 'not_configured', status: null, checked_at: generated };
  const headers = {
    'user-agent': 'WorldProtocolAcademy-PublicSourceAudit/1.0 (+https://worldprotocolacademy.mk/institute.html)',
    accept: 'text/html,application/json;q=0.9,*/*;q=0.5'
  };
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers, signal: AbortSignal.timeout(timeout) });
      if (res.body) res.body.cancel().catch(() => {});
      if (method === 'HEAD' && [405, 501].includes(res.status)) continue;
      const reachable = res.status >= 200 && res.status < 400;
      const protectedReachable = [401, 403].includes(res.status);
      return {
        url,
        observed: true,
        reachable: reachable || protectedReachable,
        class: reachable ? 'reachable' : protectedReachable ? 'reachable_protected' : 'http_error',
        status: res.status,
        final_url: res.url || url,
        checked_at: generated
      };
    } catch (error) {
      if (method === 'HEAD') continue;
      return { url, observed: true, reachable: false, class: 'network_error', status: null, error: String(error?.message || error).slice(0, 220), checked_at: generated };
    }
  }
  return { url, observed: true, reachable: false, class: 'unknown', status: null, checked_at: generated };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
      await sleep(80);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(GI_OUT, { recursive: true });

const master = await readJson(MASTER, { metadata: {}, institutions: [] });
const previous = await readJson(STATUS_PATH, {});
const institutions = Array.isArray(master.institutions) ? master.institutions : [];
const externalWithWeb = institutions.filter((x) => x.id !== 'R001' && x.website);
const runOrdinal = Math.floor(Date.now() / (cycleHours * 3600 * 1000));
const start = externalWithWeb.length ? (runOrdinal * batchSize) % externalWithWeb.length : 0;
const batch = externalWithWeb.length
  ? Array.from({ length: Math.min(batchSize, externalWithWeb.length) }, (_, i) => externalWithWeb[(start + i) % externalWithWeb.length])
  : [];

const checked = await mapLimit(batch, 4, async (inst) => ({
  id: inst.id,
  name: inst.name,
  country: inst.country,
  canonical_verification_status: inst.verification_status,
  ...(await probe(inst.website))
}));

const oldObservations = Array.isArray(previous?.systems?.global_institutions?.observations)
  ? previous.systems.global_institutions.observations
  : [];
const observationMap = new Map(oldObservations.map((x) => [x.id, x]));
for (const item of checked) observationMap.set(item.id, item);
const observations = [...observationMap.values()].sort((a, b) => String(a.id).localeCompare(String(b.id)));
const recordMap = new Map(institutions.map((x) => [x.id, x]));
const verificationCandidates = observations
  .filter((x) => x.reachable && /pending/i.test(String(recordMap.get(x.id)?.verification_status || '')))
  .map((x) => ({
    id: x.id,
    name: x.name,
    country: x.country,
    website: x.final_url || x.url,
    reachability_class: x.class,
    http_status: x.status,
    candidate_status: 'READY_FOR_HUMAN_PRIMARY_SOURCE_REVIEW',
    note: 'Reachability is only a technical observation. It does not promote the record to verified status.'
  }));

const upstreamUrl = 'https://wpa-live-production-bridge.worldprotocolacademy.workers.dev/api/v1/live';
const workerUrl = process.env.SUBLIMATE_WORKER_URL || 'https://wpa-sublimate-engine.worldprotocolacademy.workers.dev';
const [sublimateUpstream, sublimateWorker] = await Promise.all([probe(upstreamUrl), probe(workerUrl)]);
const sublimateManifest = await readJson(SUBLIMATE_MANIFEST, {});
const productManifest = await readJson(PRODUCT_MANIFEST, { products: [] });
const protocolometryDigest = await readJson(PROTOCOLometry_DIGEST, { measurement_profile: [] });

const sublimateSourceValidated = process.env.WPA_SUBLIMATE_SOURCE_VALIDATED === '1';
const pilot20Validated = process.env.WPA_PILOT20_VALIDATED === '1';
const workerRuntimeClass = sublimateWorker.reachable
  ? (sublimateWorker.class === 'reachable_protected' ? 'PROTECTED_RUNTIME_REACHABLE' : 'RUNTIME_ENDPOINT_REACHABLE')
  : 'RUNTIME_NOT_CONFIRMED';

const status = {
  generated,
  cadence: `scheduled every ${cycleHours} hours`,
  mode: 'WPA_INSTITUTE_CONTINUOUS_GOVERNED_OPERATIONS',
  systems: {
    product_factory: {
      status: Array.isArray(productManifest.products) && productManifest.products.length >= 6 ? 'OPERATIONAL_PRODUCT_BUILD' : 'BUILD_INCOMPLETE',
      generated: productManifest.generated || null,
      product_families: productManifest.products || [],
      human_gate: 'Scientific publication, official institutional judgment and peer-review decisions remain human-controlled.'
    },
    protocolometry: {
      status: Array.isArray(protocolometryDigest.measurement_profile) && protocolometryDigest.measurement_profile.length >= 5 ? 'OPERATIONAL_MEASUREMENT_LAYER' : 'MEASUREMENT_BUILD_INCOMPLETE',
      product: protocolometryDigest.product || 'WPA Protocolometry Operations Digest',
      generated: protocolometryDigest.generated || null,
      measures: protocolometryDigest.measurement_profile || [],
      doctrine: protocolometryDigest.doctrine || null,
      human_gate: protocolometryDigest.human_gate || 'No autonomous canonical ranking or official judgment.'
    },
    sublimate: {
      package_version: sublimateManifest.version || '0.3.0',
      package_declared_status: sublimateManifest.status || 'unknown',
      source_validation: sublimateSourceValidated ? 'PASS_THIS_CYCLE' : 'NOT_ASSERTED_OUTSIDE_WORKFLOW',
      upstream_public_feed: sublimateUpstream,
      worker_endpoint: sublimateWorker,
      runtime_class: workerRuntimeClass,
      authenticated_generation_smoke: 'NOT_AUTOMATICALLY_ASSERTED',
      note: 'A reachable Worker endpoint is not treated as proof of authenticated document generation. The production label remains gated until the authenticated smoke contract is explicitly passed.'
    },
    global_institutions: {
      dataset_version: master?.metadata?.version || null,
      total_records: master?.metadata?.total_records ?? institutions.length,
      external_records: master?.metadata?.external_records ?? null,
      unique_external_institutions: master?.metadata?.unique_external_institutions ?? null,
      records_with_website: master?.metadata?.records_with_website ?? externalWithWeb.length,
      canonical_status: master?.metadata?.public_status || null,
      checked_this_cycle: checked.length,
      cumulative_reachability_observations: observations.length,
      human_review_candidates: verificationCandidates.length,
      observations,
      rule: 'Automated reachability observations never modify canonical verification status or REV3 entity-resolution decisions.'
    },
    pilot20: {
      interface_version: 'v1.3.2',
      evidence_baseline: 'v1.3.1',
      secure_bundle_validation: pilot20Validated ? 'PASS_THIS_CYCLE' : 'NOT_ASSERTED_OUTSIDE_WORKFLOW',
      d002: 'APPROVED_FOR_NEXT_CANONICAL_REVISION · candidate_applied=false',
      canonical_guardrail: 'REV2 unchanged; no automatic canonical apply.'
    }
  },
  guardrails: [
    'Public sources only for automated external observations.',
    'No login-restricted scraping, paywall bypass, surveillance, profiling or private-system access.',
    'Reachability is not source verification.',
    'Protocolometry measurements do not automatically become ordinal rankings or substantive institutional judgments.',
    'No automatic canonical institutional promotion or revision.',
    'No automatic scientific publication, peer-review decision or official institutional judgment.',
    'Human Authority remains the final gate where legitimacy, rights or institutional responsibility are involved.'
  ]
};

await fs.writeFile(STATUS_PATH, JSON.stringify(status, null, 2), 'utf8');
await fs.writeFile(path.join(GI_OUT, 'reachability-observations.json'), JSON.stringify({ generated, dataset_version: status.systems.global_institutions.dataset_version, observations }, null, 2), 'utf8');
await fs.writeFile(path.join(GI_OUT, 'verification-candidates.json'), JSON.stringify({ generated, status: 'HUMAN_REVIEW_QUEUE_ONLY', candidates: verificationCandidates }, null, 2), 'utf8');

const sys = status.systems;
const card = (title, state, body, href, label) => `<article class="card"><div class="state">${esc(state)}</div><h2>${esc(title)}</h2><p>${esc(body)}</p><a class="btn" href="${esc(href)}">${esc(label)}</a></article>`;
const html = `<!doctype html>
<html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>WPA Institute · 24/7 Operations</title><meta name="description" content="Operational hub for the WPA Institute continuous governed production, evidence, Protocolometry and validation pipelines."><style>
:root{--navy:#071326;--navy2:#0d1f3c;--gold:#c9a84c;--gold2:#ead58e;--cream:#fbf8ee;--ink:#172033;--line:#d9cfba;--muted:#667085}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.65}header{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;padding:58px 20px;border-bottom:4px solid var(--gold)}header>div,main{max-width:1160px;margin:auto}h1,h2{font-family:Georgia,serif}h1{font-size:clamp(36px,6vw,62px);color:var(--gold2);margin:8px 0}.tag{display:inline-block;border:1px solid var(--gold);padding:6px 10px;color:var(--gold2);font-weight:850;font-size:12px;letter-spacing:.08em}.lead{max-width:900px;color:#ece7d8;font-size:18px}.meta{margin-top:20px;color:#d7cfbb;font-size:13px}main{padding:34px 20px 70px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}.card{background:#fff;border:1px solid var(--line);border-top:4px solid var(--gold);padding:22px}.card h2{margin:6px 0 8px;color:var(--navy2)}.card p{color:var(--muted)}.state{font-size:11px;font-weight:900;letter-spacing:.08em;color:#5e4a13}.btn{display:inline-block;padding:9px 13px;background:var(--navy2);color:#fff;text-decoration:none;font-weight:800}.guard{margin-top:22px;background:#fff;border:1px solid var(--line);border-left:5px solid var(--gold);padding:20px}.guard ul{margin:8px 0;padding-left:22px}.numbers{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.pill{background:#fff;border:1px solid var(--line);padding:9px 12px;font-weight:800}@media(max-width:760px){.grid{grid-template-columns:1fr}}</style></head><body>
<header><div><span class="tag">WPA INSTITUTE · CONTINUOUS GOVERNED OPERATIONS</span><h1>WPA Institute 24/7 Operations</h1><p class="lead">Единствен оперативен слој за Product Factory, Protocolometry Center, Sublimate Engine, глобалната институционална доказна програма и Pilot 20. Автоматизацијата работи континуирано; канонски промени, рангирања, научно објавување и институционални одлуки остануваат човечки контролирани.</p><div class="meta">Последен циклус: ${esc(generated)} · cadence: ${esc(status.cadence)}</div></div></header>
<main><div class="numbers"><span class="pill">${esc(sys.global_institutions.total_records)} институционални записи</span><span class="pill">${esc(sys.global_institutions.cumulative_reachability_observations)} reachability observations</span><span class="pill">${esc(sys.global_institutions.human_review_candidates)} human-review candidates</span><span class="pill">${esc((sys.product_factory.product_families||[]).length)} product families</span><span class="pill">${esc((sys.protocolometry.measures||[]).length)} Protocolometry measures</span></div><section class="grid">
${card('WPA 24/7 Product Factory', sys.product_factory.status, 'Генерира готови, верзионирани истражувачки и уреднички работни производи од јавни сигнали и академски метаподатоци.', '/products/', 'Отвори Product Factory')}
${card('WPA Protocolometry Center', sys.protocolometry.status, 'Мерлив оперативен слој за source availability, traceability, scholarly metadata и editorial linkage. Нема автономно рангирање институции, лица или држави.', '/products/protocolometryDigest.html', 'Отвори Protocolometry Digest')}
${card('WPA Sublimate Engine', sys.sublimate.runtime_class, `Source validation: ${sys.sublimate.source_validation}. Upstream: ${sys.sublimate.upstream_public_feed.class}. Worker: ${sys.sublimate.worker_endpoint.class}.`, '/wpa-sublimate-engine.html', 'Отвори Sublimate')}
${card('Global Institutions Evidence Lane', 'CONTINUOUS REACHABILITY + HUMAN VERIFICATION QUEUE', `Овој циклус провери ${sys.global_institutions.checked_this_cycle} јавни институционални веб-извори. Reachability не се третира како source verification.`, '/wpa-global-institutional-evidence-programme.html', 'Отвори Evidence Programme')}
${card('Pilot 20', sys.pilot20.secure_bundle_validation, `${sys.pilot20.evidence_baseline} останува доказен baseline; ${sys.pilot20.canonical_guardrail}`, '/data/global-institutions/pilot-20/v1.3.2/', 'Отвори Pilot 20 v1.3.2')}
${card('Global Institutions Master List', sys.global_institutions.dataset_version || 'REV3', 'Канонскиот dataset не се менува од 24/7 reachability lane. Сите promotions и revisions се контролирани.', '/wpa-global-institutions-master-list.html', 'Отвори Master List')}
${card('Journal / Academic / Watch Pipeline', 'CONNECTED TO PRODUCT FACTORY + PROTOCOLometry', 'WPA Watch, Academic Search и Journal Watch се влезни слоеви; Protocolometry ги мери доказните и процесните својства, а готовите work-products излегуваат преку Product Factory.', '/analytical-center.html', 'Отвори Analytical Center')}
${card('Protocolometry doctrine', 'MEASURE · SHOW · CORRECT · HUMAN REVIEW', 'Протоколометријата останува WPA работна методологија: мерките се јавни и исправливи, а Human Gate останува непроменет.', '/protocolometry-center.html', 'Отвори Protocolometry Center')}
</section><section class="guard"><strong>Human Authority guardrail</strong><ul>${status.guardrails.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul><p><a href="/operations/institute-24x7-status.json">Machine-readable status JSON</a> · <a href="/products/protocolometryDigest.json">Protocolometry measurements JSON</a> · <a href="/data/global-institutions/operations/verification-candidates.json">Institutional verification candidate queue</a></p></section></main></body></html>`;
await fs.writeFile(path.join(OUT, 'index.html'), html, 'utf8');

console.log(JSON.stringify({ generated, checked: checked.length, observations: observations.length, candidates: verificationCandidates.length, sublimate: workerRuntimeClass, products: (productManifest.products || []).length, protocolometry_measures: (protocolometryDigest.measurement_profile || []).length }, null, 2));

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const BASE = 'https://worldprotocolacademy.mk';
const OUT = path.join(ROOT, 'social-studio', 'distribution');
const QUEUE = path.join(ROOT, 'data', 'social', 'product-distribution-queue.json');

const readJson = async (p, fallback) => {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return fallback; }
};
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.dirname(QUEUE), { recursive: true });

const manifest = await readJson(path.join(ROOT, 'products', 'manifest.json'), { products: [] });
const registry = await readJson(path.join(ROOT, 'data', 'social', 'platform-registry.json'), { platforms: [], owned_destinations: {} });
const legacyQueue = await readJson(path.join(ROOT, 'data', 'wpa-social-distribution-queue.json'), { channels: {} });

const platforms = new Map((registry.platforms || []).map(p => [p.id, p]));
const owned = registry.owned_destinations || {};
const legacyChannels = legacyQueue.channels || {};
const targetChannels = ['linkedin','academia','researchgate','zenodo','facebook','instagram','x','tiktok','youtube','telegram','whatsapp','viber','wechat'];

function channelState(id) {
  const reg = platforms.get(id) || {};
  const legacy = legacyChannels[id] || {};
  const destination = owned[id] || {};
  const publish = reg.publish || 'human-approved-or-manual';
  const adapter = destination.external_adapter || legacy.publishing_adapter || 'NOT_CONNECTED';
  const status = legacy.status || (id === 'linkedin' ? 'PRIMARY_PROFESSIONAL_CHANNEL' : (['academia','researchgate','zenodo'].includes(id) ? 'OWNED_ACADEMIC_DESTINATION' : 'PLANNED_OR_GOVERNED'));
  return {
    id,
    class: reg.class || 'unknown',
    modes: reg.modes || [],
    publish_policy: publish,
    channel_status: status,
    publishing_adapter: adapter,
    profile_url: reg.profile_url || destination.profile_url || destination.public_profile_url || null,
    role: destination.role || null
  };
}

function publicUrl(product) {
  return new URL(product.html || '/products/', BASE).href;
}

function shortStatus(productData) {
  return clean(productData?.status || 'WPA work product · human validation required before official reliance.');
}

function factualCore(product, productData) {
  return {
    title: product.title,
    product_id: product.id,
    generated: productData?.generated || manifest.generated || generated,
    item_count: Number(product.items || 0),
    canonical_url: publicUrl(product),
    status: shortStatus(productData),
    methodology: clean(productData?.methodology || ''),
    provenance_rule: 'Every derivative may describe only the canonical WPA product and its declared status. It may not add unverified factual claims, imply peer review, or obscure source provenance.'
  };
}

function variants(product, core) {
  const url = core.canonical_url;
  const title = core.title;
  const count = core.item_count;
  const statusNote = 'Human review remains required before official or academic reliance.';
  const concise = `${title} · ${count} item${count === 1 ? '' : 's'} · ${url}`;
  return {
    linkedin: {
      format: 'founder-or-institute-post',
      primary_job: 'Authority + professional discovery',
      cta: 'Open WPA reference',
      destination_profile: owned.linkedin?.profile_url || 'https://www.linkedin.com/in/sande-smiljanov-phd/',
      text: `New WPA Institute work product: ${title}. This cycle contains ${count} structured item${count === 1 ? '' : 's'} and keeps source/provenance and Human Authority boundaries explicit. ${statusNote} ${url}`,
      release_rule: 'After Sande Gate, publish through the authorised Sande Smiljanov LinkedIn account using a connected authorised publisher or manual account action.'
    },
    academia: {
      format: 'research-profile-update',
      primary_job: 'Academic discovery',
      cta: 'Open canonical WPA reference',
      destination_profile: owned.academia?.profile_url || 'https://independent.academia.edu/SandeSmiljanov',
      text: `${title} — a WPA Institute source-traceable work product from the current cycle. ${statusNote} Canonical reference: ${url}`,
      release_rule: 'Profile update/manual scholarly upload only after rights, authorship and publication-status review. Do not represent a work product as peer-reviewed research unless it is.'
    },
    researchgate: {
      format: 'project-or-research-profile-update',
      primary_job: 'Research community discovery',
      cta: 'Open canonical WPA reference',
      destination_profile: owned.researchgate?.profile_url || 'https://www.researchgate.net/profile/Sande-Smiljanov-2',
      text: `WPA Institute research update: ${title}. ${count} structured item${count === 1 ? '' : 's'} in the current governed cycle. Provenance and Human Authority status remain explicit. ${url}`,
      release_rule: 'Manual/authorised profile action only. Upload a full text only when Sande owns the rights or has a valid reuse/deposit basis and the publication status is labelled correctly.'
    },
    zenodo: {
      format: 'deposit-metadata-candidate',
      primary_job: 'Open research preservation and citation',
      cta: 'Review for repository eligibility',
      destination_profile: null,
      metadata_candidate: {
        title,
        description: `WPA Institute governed work product. ${count} structured item${count === 1 ? '' : 's'}. Canonical source: ${url}`,
        related_identifier: url,
        publisher_candidate: 'World Protocol Academy',
        creators_review_required: true,
        resource_type_review_required: true,
        licence_review_required: true,
        version_review_required: true
      },
      release_rule: 'DO NOT deposit every Product Factory output automatically. Zenodo deposit is permitted only for a stable scholarly/research/software/dataset release after Sande Gate, rights/licence review, correct creator metadata and an authorised Zenodo deposit path.'
    },
    facebook: {
      format: 'post', primary_job: 'Discovery', cta: 'Open WPA reference',
      text: `WPA Institute update: ${title} is prepared for this cycle with ${count} structured item${count === 1 ? '' : 's'}. The product is source-traceable and human-governed. ${url}`
    },
    instagram: {
      format: 'caption', primary_job: 'Discovery', cta: 'Open WPA reference',
      text: `${title}\n\n${count} structured item${count === 1 ? '' : 's'} in the current WPA Institute cycle. Source-traceable. Human-governed.\n\nReference: ${url}`
    },
    x: {
      format: 'post', primary_job: 'Discovery', cta: 'Open WPA reference',
      text: clean(`${title} — ${count} structured item${count === 1 ? '' : 's'} in the current WPA Institute cycle. Source-traceable, human-governed. ${url}`).slice(0, 270)
    },
    tiktok: {
      format: 'short-video-script', primary_job: 'Discovery', cta: 'Open WPA reference',
      script: [`HOOK: What did the WPA Institute produce in this cycle?`,`VALUE: ${title} — ${count} structured item${count === 1 ? '' : 's'}, with source/provenance boundaries preserved.`,`PAYOFF: Use it as a research or editorial work product, not as an automatic official judgment.`,`CTA: Open the WPA reference: ${url}`]
    },
    youtube: {
      format: 'short', primary_job: 'Authority', cta: 'Open WPA reference',
      title: `${title} | WPA Institute Update`,
      script: [`This is a WPA Institute 24/7 production update.`,`Product: ${title}.`,`Current cycle: ${count} structured item${count === 1 ? '' : 's'}.`,`The output keeps provenance visible and remains human-governed.`,`Full reference: ${url}`]
    },
    telegram: {
      format: 'channel-post', primary_job: 'Authority', cta: 'Open WPA reference',
      text: `WPA Institute · ${title}\n${count} structured item${count === 1 ? '' : 's'} prepared in the current cycle. Source/provenance status remains visible and Human Authority remains the final gate.\n${url}`,
      audience_rule: 'Official WPA channel/group or opted-in community only.'
    },
    whatsapp: {
      format: 'channel-update', primary_job: 'Authority', cta: 'Open WPA reference',
      text: `WPA Institute update: ${concise}. Human-governed work product; no unsolicited bulk messaging.`,
      audience_rule: 'Official channel/community or opted-in recipients only; Business API only if separately approved.'
    },
    viber: {
      format: 'channel-update', primary_job: 'Authority', cta: 'Open WPA reference',
      text: `WPA Institute update: ${concise}. Human-governed work product.`,
      audience_rule: 'Official channel/community or opted-in recipients only; approved API only if separately verified.'
    },
    wechat: {
      format: 'official-account-article-brief', primary_job: 'Authority', cta: 'Open WPA reference',
      text: `WPA Institute work product: ${title}. Current cycle: ${count} structured item${count === 1 ? '' : 's'}. Canonical reference: ${url}`,
      audience_rule: 'Official account/channel only after account and API governance are verified.'
    }
  };
}

const items = [];
for (const product of manifest.products || []) {
  const file = String(product.json || '').replace(/^\//, '');
  const productData = file ? await readJson(path.join(ROOT, file), {}) : {};
  const core = factualCore(product, productData);
  const v = variants(product, core);
  items.push({
    trace_id: `WPA-PRODUCT-DIST-${product.id}-${String(core.generated).slice(0,10).replaceAll('-','')}`,
    source_or_wpa_output_reference: product.html,
    source_json: product.json,
    factual_core: core,
    target_channels: targetChannels,
    variants: v,
    human_review_status: 'PENDING_SANDE_GATE',
    queue_state: 'HUMAN_REVIEW_PENDING',
    rights_review: 'REQUIRED_BEFORE_MEDIA_ASSET_OR_ACADEMIC_FULLTEXT_PUBLICATION',
    correction_route: '/correction-request.html',
    publication_rule: 'Do not publish or deposit until Sande Gate approval. After approval, release is permitted only through an authorised human account or a separately verified official/authorised adapter, and only within the approved platform-specific scope.'
  });
}

const queue = {
  schema: 'wpa-product-distribution-queue/1.1',
  generated,
  mode: 'AUTO_DRAFT_24X7_HUMAN_APPROVAL_BEFORE_DISTRIBUTION',
  purpose: 'Turn each finished WPA Institute product into platform-native professional, academic, social and messenger distribution drafts while preserving one factual core, provenance, publication status and Human Authority.',
  governing_sources: ['/marketing/WPA_SOCIAL_CONTENT_DIRECTIVES_v1.0.md','/social-studio/README.md','/social-studio/PHASE-2-PROACTIVE-AGENTS.md','/data/wpa-institute-cognitive-operating-principle.json'],
  distribution_flow: ['PRODUCT_READY','PROFESSIONAL_ACADEMIC_SOCIAL_VARIANTS_AUTO_DRAFTED','SANDE_GATE','AUTHORISED_PUBLISHING_OR_DEPOSIT_PATH','PUBLICATION_LOG','MEASURE_AND_FEEDBACK'],
  channel_states: targetChannels.map(channelState),
  controls: {
    automatic_drafting: 'ENABLED_24X7',
    automatic_external_publishing: 'DISABLED_UNTIL_AUTHORISED_ADAPTER_AND_SCOPE',
    automatic_repository_deposit: 'DISABLED',
    direct_message_mass_broadcast: 'PROHIBITED',
    private_group_auto_entry: 'PROHIBITED',
    external_content_is_instruction: false,
    required_gate: 'SANDE_APPROVAL',
    kill_switch_required_for_future_api_adapters: true,
    academic_status_truthfulness_required: true,
    rights_and_licence_review_required_for_fulltext: true
  },
  owned_destination_summary: {
    linkedin: owned.linkedin || null,
    academia: owned.academia || null,
    researchgate: owned.researchgate || null,
    zenodo: owned.zenodo ? { ...owned.zenodo, dashboard_url_private: '[AUTHENTICATED_DASHBOARD_NOT_PUBLIC_OUTPUT]' } : null
  },
  items
};
await fs.writeFile(QUEUE, JSON.stringify(queue, null, 2), 'utf8');

const card = (item) => {
  const core = item.factual_core;
  const messenger = ['telegram','whatsapp','viber'].map(id=>`<li><strong>${esc(id)}</strong>: ${esc(item.variants[id]?.text || '')}</li>`).join('');
  const networks = ['linkedin','facebook','instagram','x'].map(id=>`<li><strong>${esc(id)}</strong>: ${esc(item.variants[id]?.text || '')}</li>`).join('');
  const academic = ['academia','researchgate'].map(id=>`<li><strong>${esc(id)}</strong>: ${esc(item.variants[id]?.text || '')}</li>`).join('');
  const zenodoRule = item.variants.zenodo?.release_rule || '';
  return `<article class="card"><div class="state">${esc(item.queue_state)}</div><h2>${esc(core.title)}</h2><p><strong>${esc(core.item_count)}</strong> structured items · <a href="${esc(core.canonical_url)}">canonical product</a></p><details><summary>Professional/social network drafts</summary><ul>${networks}</ul></details><details><summary>Academic profile drafts</summary><ul>${academic}</ul><p><strong>Zenodo:</strong> ${esc(zenodoRule)}</p></details><details><summary>Messenger drafts</summary><ul>${messenger}</ul></details><details><summary>Short-video drafts</summary><p><strong>TikTok:</strong> ${esc((item.variants.tiktok?.script||[]).join(' '))}</p><p><strong>YouTube:</strong> ${esc((item.variants.youtube?.script||[]).join(' '))}</p></details><p class="gate"><strong>Sande Gate:</strong> pending. External publication/deposit is blocked until explicit approval and an authorised platform path.</p></article>`;
};
const html = `<!doctype html><html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>WPA Product Distribution Desk</title><style>:root{--navy:#071326;--navy2:#0d1f3c;--gold:#c9a84c;--cream:#fbf8ee;--line:#d9cfba;--muted:#667085}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:#172033;font-family:Inter,system-ui,sans-serif;line-height:1.6}header{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;padding:48px 20px;border-bottom:4px solid var(--gold)}header>div,main{max-width:1100px;margin:auto}h1,h2{font-family:Georgia,serif}h1{color:#ead58e;font-size:clamp(34px,6vw,58px);margin:8px 0}.tag{display:inline-block;border:1px solid var(--gold);color:#ead58e;padding:6px 10px;font-size:12px;font-weight:900;letter-spacing:.08em}.lead{max-width:900px;color:#eee8da}.rule{margin-top:18px;padding:14px;border:1px solid rgba(201,168,76,.55);background:rgba(201,168,76,.08)}main{padding:28px 20px 70px}.summary{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}.pill{background:#fff;border:1px solid var(--line);padding:9px 12px;font-weight:800}.card{background:#fff;border:1px solid var(--line);border-top:4px solid var(--gold);padding:20px;margin:14px 0}.card h2{color:var(--navy2)}.state{font-size:11px;font-weight:900;letter-spacing:.08em;color:#74591b}.card details{margin:10px 0;border-top:1px solid #eee;padding-top:8px}.card summary{cursor:pointer;font-weight:800}.card li{margin:6px 0}.card a{color:#8a6518}.gate{background:#fff8df;border-left:4px solid var(--gold);padding:10px 12px}.foot{color:var(--muted);font-size:13px;margin-top:20px}</style></head><body><header><div><span class="tag">WPA INSTITUTE · PRODUCT → PROFESSIONAL/ACADEMIC/SOCIAL</span><h1>Product Distribution Desk</h1><p class="lead">Секој готов WPA производ автоматски добива platform-native drafts за LinkedIn, академски профили, open-research deposit review, социјални мрежи, short video и директни community канали. Надворешно објавување и repository deposit остануваат управувани со Sande Gate и платформски овластен пат.</p><div class="rule"><strong>Работен режим:</strong> AUTO DRAFT = ON · ACADEMIC STATUS/RIGHTS CHECK = ON · MASS MESSAGING = OFF · UNAUTHORISED AUTO PUBLISH/DEPOSIT = OFF · SANDE APPROVAL = REQUIRED.</div></div></header><main><div class="summary"><span class="pill">${items.length} product packs</span><span class="pill">${targetChannels.length} target channels</span><span class="pill">LinkedIn primary professional</span><span class="pill">Academia · ResearchGate academic profiles</span><span class="pill">Zenodo deposit review</span><span class="pill">Telegram · WhatsApp · Viber direct-community</span></div>${items.map(card).join('')}<div class="foot"><a href="/operations/simple/">Simple 24/7 Control</a> · <a href="/social-studio/">Social Command Centre</a> · <a href="/data/social/product-distribution-queue.json">Queue JSON</a></div></main></body></html>`;
await fs.writeFile(path.join(OUT, 'index.html'), html, 'utf8');

console.log(JSON.stringify({ generated, product_packs: items.length, target_channels: targetChannels.length, linkedin_profile: owned.linkedin?.profile_url || null, academia_profile: owned.academia?.profile_url || null, researchgate_profile: owned.researchgate?.profile_url || null, zenodo_deposit: 'HUMAN_REVIEW_AND_AUTHORISED_PATH_REQUIRED', auto_publish: false, approval: 'SANDE_GATE' }, null, 2));

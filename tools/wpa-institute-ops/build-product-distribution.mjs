import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const BASE = 'https://worldprotocolacademy.mk';
const OUT = path.join(ROOT, 'social-studio', 'distribution');
const QUEUE = path.join(ROOT, 'data', 'social', 'product-distribution-queue.json');

const readJson = async (p, fallback = {}) => {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return fallback; }
};
const clean = (v = '') => String(v ?? '').replace(/\s+/g, ' ').trim();
const esc = (v = '') => String(v ?? '').replace(/[&<>"']/g, (m) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.dirname(QUEUE), { recursive: true });

const manifest = await readJson(path.join(ROOT, 'products', 'manifest.json'), { products: [] });
const registry = await readJson(path.join(ROOT, 'data', 'social', 'platform-registry.json'), { platforms: [], owned_destinations: {} });
const legacy = await readJson(path.join(ROOT, 'data', 'wpa-social-distribution-queue.json'), { channels: {} });
const platformMap = new Map((registry.platforms || []).map((p) => [p.id, p]));
const owned = registry.owned_destinations || {};
const legacyChannels = legacy.channels || {};
const targetChannels = ['linkedin','academia','researchgate','zenodo','facebook','instagram','x','tiktok','youtube','telegram','whatsapp','viber','wechat'];

function channelState(id) {
  const p = platformMap.get(id) || {};
  const destination = owned[id] || {};
  const old = legacyChannels[id] || {};
  return {
    id,
    class: p.class || 'unknown',
    modes: p.modes || [],
    publish_policy: p.publish || 'human-approved-or-manual',
    channel_status: old.status || (id === 'linkedin' ? 'PRIMARY_PROFESSIONAL_CHANNEL' : (['academia','researchgate','zenodo'].includes(id) ? 'OWNED_ACADEMIC_DESTINATION' : 'GOVERNED_CHANNEL')),
    publishing_adapter: destination.external_adapter || old.publishing_adapter || 'NOT_CONNECTED',
    profile_url: p.profile_url || destination.profile_url || destination.public_profile_url || null,
    role: destination.role || null
  };
}

function coreFor(product, data) {
  const canonical = new URL(product.html || '/products/', BASE).href;
  return {
    title: product.title,
    product_id: product.id,
    generated: data.generated || manifest.generated || generated,
    item_count: Number(product.items || 0),
    canonical_url: canonical,
    status: clean(data.status || 'WPA work product · human validation required before official reliance.'),
    methodology: clean(data.methodology || ''),
    provenance_rule: 'Every derivative is limited to the canonical WPA product, its declared status and verified provenance; no derivative may invent peer review, publication status, rights, endorsement or external facts.'
  };
}

function variants(core) {
  const { title, item_count: count, canonical_url: url } = core;
  const governed = 'Source-traceable and human-governed; official or academic reliance requires the applicable review.';
  return {
    linkedin: {
      format: 'founder-or-institute-post',
      destination_profile: owned.linkedin?.profile_url || 'https://www.linkedin.com/in/sande-smiljanov-phd/',
      text: `New WPA Institute work product: ${title}. Current cycle: ${count} structured item${count === 1 ? '' : 's'}. ${governed} ${url}`,
      release_rule: 'After Sande Gate, use the authorised Sande Smiljanov LinkedIn account through a connected authorised publisher or manual account action.'
    },
    academia: {
      format: 'research-profile-update',
      destination_profile: owned.academia?.profile_url || 'https://independent.academia.edu/SandeSmiljanov',
      text: `${title} — WPA Institute governed work product. ${governed} Canonical reference: ${url}`,
      release_rule: 'Manual/authorised profile action only. Full-text upload requires authorship/rights and publication-status review.'
    },
    researchgate: {
      format: 'project-or-research-profile-update',
      destination_profile: owned.researchgate?.profile_url || 'https://www.researchgate.net/profile/Sande-Smiljanov-2',
      text: `WPA Institute research update: ${title}. ${count} structured item${count === 1 ? '' : 's'}. ${governed} ${url}`,
      release_rule: 'Manual/authorised profile action only. Full text may be uploaded only with a valid rights/deposit basis and truthful publication-status labelling.'
    },
    zenodo: {
      format: 'deposit-metadata-candidate',
      destination_profile: null,
      metadata_candidate: {
        title,
        description: `WPA Institute governed work product. Canonical reference: ${url}`,
        related_identifier: url,
        publisher_candidate: 'World Protocol Academy',
        creators_review_required: true,
        resource_type_review_required: true,
        licence_review_required: true,
        version_review_required: true
      },
      release_rule: 'No automatic deposit. Only stable scholarly/research/software/dataset releases may enter Zenodo after Sande Gate, rights/licence/status review and an authorised deposit path.'
    },
    facebook: { format:'post', text:`WPA Institute update: ${title}. ${count} structured item${count === 1 ? '' : 's'}. ${governed} ${url}` },
    instagram: { format:'caption', text:`${title}\n\n${count} structured item${count === 1 ? '' : 's'} in the current WPA Institute cycle. Source-traceable. Human-governed.\n\n${url}` },
    x: { format:'post', text:clean(`${title} — ${count} structured item${count === 1 ? '' : 's'}. Source-traceable, human-governed. ${url}`).slice(0,270) },
    tiktok: { format:'short-video-script', script:[`HOOK: What did the WPA Institute produce?`,`VALUE: ${title} — ${count} structured item${count === 1 ? '' : 's'}.`,`PAYOFF: provenance remains visible and Human Authority remains the gate.`,`CTA: ${url}`] },
    youtube: { format:'short', title:`${title} | WPA Institute Update`, script:[`WPA Institute 24/7 production update.`,`Product: ${title}.`,`Current cycle: ${count} structured item${count === 1 ? '' : 's'}.`,`Source-traceable and human-governed.`,`Reference: ${url}`] },
    telegram: { format:'channel-post', text:`WPA Institute · ${title}\n${count} structured item${count === 1 ? '' : 's'}. Human Authority remains the final gate.\n${url}`, audience_rule:'Official WPA channel/group or opted-in community only.' },
    whatsapp: { format:'channel-update', text:`WPA Institute update: ${title} · ${url}`, audience_rule:'Official channel/community or opted-in recipients only; no unsolicited bulk messaging.' },
    viber: { format:'channel-update', text:`WPA Institute update: ${title} · ${url}`, audience_rule:'Official channel/community or opted-in recipients only.' },
    wechat: { format:'official-account-brief', text:`WPA Institute work product: ${title}. Canonical reference: ${url}`, audience_rule:'Official account only after account/API governance is verified.' }
  };
}

const items = [];
for (const product of manifest.products || []) {
  const jsonPath = String(product.json || '').replace(/^\//, '');
  const data = jsonPath ? await readJson(path.join(ROOT, jsonPath), {}) : {};
  const core = coreFor(product, data);
  items.push({
    trace_id: `WPA-PRODUCT-DIST-${product.id}-${String(core.generated).slice(0,10).replaceAll('-','')}`,
    source_or_wpa_output_reference: product.html,
    source_json: product.json,
    factual_core: core,
    target_channels: targetChannels,
    variants: variants(core),
    human_review_status: 'PENDING_SANDE_GATE',
    queue_state: 'HUMAN_REVIEW_PENDING',
    rights_review: 'REQUIRED_BEFORE_MEDIA_ASSET_OR_ACADEMIC_FULLTEXT_PUBLICATION',
    correction_route: '/correction-request.html',
    publication_rule: 'After Sande Gate, release only through an authorised human account or separately verified authorised adapter and only within the approved platform-specific scope.'
  });
}

const queue = {
  schema: 'wpa-product-distribution-queue/1.1',
  generated,
  mode: 'AUTO_DRAFT_24X7_HUMAN_APPROVAL_BEFORE_DISTRIBUTION',
  purpose: 'Prepare professional, academic, social, video and messenger variants from one source-traceable WPA factual core.',
  distribution_flow: ['PRODUCT_READY','PLATFORM_VARIANTS_AUTO_DRAFTED','SANDE_GATE','AUTHORISED_PUBLISH_OR_DEPOSIT_PATH','PUBLICATION_LOG','MEASURE_AND_FEEDBACK'],
  channel_states: targetChannels.map(channelState),
  controls: {
    automatic_drafting: 'ENABLED_24X7',
    automatic_external_publishing: 'DISABLED',
    automatic_repository_deposit: 'DISABLED',
    direct_message_mass_broadcast: 'PROHIBITED',
    private_group_auto_entry: 'PROHIBITED',
    required_gate: 'SANDE_APPROVAL',
    kill_switch_required_for_future_api_adapters: true,
    academic_status_truthfulness_required: true,
    rights_and_licence_review_required_for_fulltext: true
  },
  owned_destination_summary: {
    linkedin: owned.linkedin || null,
    academia: owned.academia || null,
    researchgate: owned.researchgate || null,
    zenodo: owned.zenodo ? { owner: owned.zenodo.owner || null, role: owned.zenodo.role || null, public_profile_url: owned.zenodo.public_profile_url || null, external_adapter: owned.zenodo.external_adapter || null } : null
  },
  items
};
await fs.writeFile(QUEUE, JSON.stringify(queue, null, 2), 'utf8');

const cards = items.map((item) => {
  const c = item.factual_core;
  const academic = ['academia','researchgate'].map((id) => `<li><strong>${esc(id)}</strong>: ${esc(item.variants[id]?.text || '')}</li>`).join('');
  const social = ['linkedin','facebook','instagram','x'].map((id) => `<li><strong>${esc(id)}</strong>: ${esc(item.variants[id]?.text || '')}</li>`).join('');
  const direct = ['telegram','whatsapp','viber'].map((id) => `<li><strong>${esc(id)}</strong>: ${esc(item.variants[id]?.text || '')}</li>`).join('');
  return `<article class="card"><h2>${esc(c.title)}</h2><p>${esc(c.item_count)} structured items · <a href="${esc(c.canonical_url)}">canonical product</a></p><details><summary>Professional/social</summary><ul>${social}</ul></details><details><summary>Academic</summary><ul>${academic}</ul><p><strong>Zenodo:</strong> ${esc(item.variants.zenodo.release_rule)}</p></details><details><summary>Direct community</summary><ul>${direct}</ul></details><p class="gate"><strong>Sande Gate:</strong> required before external publishing/deposit.</p></article>`;
}).join('');

const html = `<!doctype html><html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>WPA Product Distribution Desk</title><style>body{margin:0;background:#fbf8ee;color:#172033;font-family:system-ui,sans-serif;line-height:1.6}header{background:#0d1f3c;color:white;padding:42px 20px;border-bottom:4px solid #c9a84c}header>div,main{max-width:1100px;margin:auto}h1,h2{font-family:Georgia,serif}h1{color:#ead58e}.tag{font-weight:900;color:#ead58e}.rule,.gate{padding:12px;border-left:4px solid #c9a84c;background:#fff8df;color:#172033}.card{background:white;border:1px solid #d9cfba;border-top:4px solid #c9a84c;padding:18px;margin:14px 0}main{padding:24px 20px 60px}.pill{display:inline-block;background:white;border:1px solid #d9cfba;padding:7px 10px;margin:3px;font-weight:800}</style></head><body><header><div><div class="tag">WPA INSTITUTE · GOVERNED DISTRIBUTION</div><h1>Product Distribution Desk</h1><p>LinkedIn, Academia, ResearchGate, Zenodo review, social networks, video and direct-community variants are prepared from one factual core.</p><div class="rule">AUTO DRAFT = ON · AUTO PUBLISH = OFF · AUTO ZENODO DEPOSIT = OFF · SANDE GATE = REQUIRED.</div></div></header><main><p><span class="pill">${items.length} product packs</span><span class="pill">${targetChannels.length} target channels</span><span class="pill">LinkedIn primary professional</span><span class="pill">Academia + ResearchGate academic</span><span class="pill">Zenodo deposit review</span></p>${cards}</main></body></html>`;
await fs.writeFile(path.join(OUT, 'index.html'), html, 'utf8');

console.log(JSON.stringify({ generated, product_packs: items.length, target_channels: targetChannels.length, auto_publish: false, auto_zenodo_deposit: false, approval: 'SANDE_GATE' }, null, 2));

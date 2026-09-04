import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const OUT = path.join(ROOT, 'operations', 'command-center');

const readJson = async (relative, fallback = {}) => {
  try { return JSON.parse(await fs.readFile(path.join(ROOT, relative), 'utf8')); } catch { return fallback; }
};
const exists = async (relative) => {
  try { await fs.access(path.join(ROOT, relative)); return true; } catch { return false; }
};
const n = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

await fs.mkdir(OUT, { recursive: true });

const [
  model,
  ops,
  rights,
  openKnowledge,
  native,
  protocolometry,
  products,
  distribution,
  approval,
  freeCard,
  publicSquare,
  institutions
] = await Promise.all([
  readJson('data/wpa-protocolometry-command-center-model.json'),
  readJson('operations/institute-24x7-status.json'),
  readJson('data/open-knowledge/rights-source-gate.json'),
  readJson('data/open-knowledge/status.json'),
  readJson('data/open-knowledge/wpa-native-candidates.json'),
  readJson('products/protocolometryDigest.json'),
  readJson('products/manifest.json'),
  readJson('data/social/product-distribution-queue.json'),
  readJson('operations/approval-queue.json'),
  readJson('data/wpa-free-card-growth-model.json'),
  readJson('data/wpa-public-square-operating-model.json'),
  readJson('data/global-institutions/operations/verification-candidates.json')
]);

const hasRegistryBackend = await exists('workers/wpa-membership-registry/wrangler.toml') || await exists('api/membership');
const hasPaymentBackend = await exists('workers/wpa-payments/wrangler.toml') || await exists('api/payments');

const sourceErrors = n(openKnowledge.book_lane?.errors?.length ?? openKnowledge.errors?.length);
const scholarlyTotal = n(rights.scholarly?.total);
const scholarlyEligible = n(rights.scholarly?.substantive_eligible_after_human_review);
const rightsHeld = n(rights.scholarly?.metadata_only_or_held) + n(rights.institutional?.quarantined);
const nativeObserved = n(native.source_counts?.total_observed);
const nativeEligible = n(native.source_counts?.eligible_after_originality_gate ?? native.candidates?.length);
const nativeQuarantined = n(native.source_counts?.quarantined ?? native.quarantine?.length);
const productCount = n(products.products?.length);
const distributionChannels = n(distribution.channel_states?.length);
const distributionItems = n(distribution.items?.length);
const verificationCandidates = n(institutions.queue?.length ?? institutions.candidates?.length);

const channelStates = (distribution.channel_states || []).map((channel) => ({
  id: channel.id,
  class: channel.class,
  status: channel.channel_status,
  publishing_adapter: channel.publishing_adapter,
  publication_mode: channel.publish_policy
}));

const command = {
  schema: 'wpa-protocolometry-command-center-status/1.0',
  generated,
  name: model.name || 'WPA PROTOCOLometry COMMAND CENTER',
  overall_state: 'IMPLEMENTED_HUMAN_GATED',
  protocolometry_role: model.protocolometry_role || 'SUPERVISORY_MEASUREMENT_NERVOUS_SYSTEM',
  canonical_flow: model.canonical_flow || [],
  health: {
    institute_operations_present: Boolean(ops.systems),
    open_knowledge_mode: openKnowledge.mode || null,
    source_degraded_this_cycle: sourceErrors > 0 || rights.source_resilience?.current_cycle_degraded === true,
    source_error_count: sourceErrors,
    rights_source_gate: rights.mode || 'NOT_GENERATED',
    originality_quarantine_count: nativeQuarantined,
    product_families: productCount,
    distribution_channels: distributionChannels,
    distribution_items_prepared: distributionItems
  },
  protocolometry: {
    status: protocolometry.status || 'AVAILABLE_AS_GENERATED_PRODUCT',
    measurement_profile_count: n(protocolometry.measurement_profile?.length),
    supervisory_dimensions: model.measurement_dimensions || [],
    rule: 'Measurements support review and correction; they do not autonomously become institutional rankings or official judgments.'
  },
  lanes: {
    sources_and_academies: {
      state: openKnowledge.mode === 'PROACTIVE_OPEN_KNOWLEDGE_24X7' ? (sourceErrors ? 'DEGRADED' : 'IMPLEMENTED') : 'BLOCKED',
      scholarly_records_seen: scholarlyTotal,
      institutional_verification_candidates: verificationCandidates,
      note: sourceErrors ? 'At least one external source is degraded; independent lawful sources continue and rights rules do not relax.' : 'Public-source lane available.'
    },
    rights_and_provenance: {
      state: rights.mode === 'FAIL_CLOSED' ? 'IMPLEMENTED_HUMAN_GATED' : 'BLOCKED',
      substantive_eligible_after_human_review: scholarlyEligible,
      held_or_quarantined: rightsHeld,
      protected_source_body_retention: rights.controls?.protected_source_body_retention || 'UNKNOWN'
    },
    wpa_native_transformation: {
      state: native.status === 'WPA_NATIVE_CANDIDATES_PENDING_HUMAN_REVIEW' ? 'IMPLEMENTED_HUMAN_GATED' : 'BLOCKED',
      observed: nativeObserved,
      originality_pass: nativeEligible,
      originality_quarantined: nativeQuarantined
    },
    research_and_products: {
      state: productCount >= 6 ? 'IMPLEMENTED_HUMAN_GATED' : 'DESIGN_READY_ACTIVATION_INACTIVE',
      product_families: productCount,
      scientific_publication: 'HUMAN_EDITORIAL_GATE_REQUIRED'
    },
    ai_and_distribution: {
      state: distribution.mode === 'AUTO_DRAFT_24X7_HUMAN_APPROVAL_BEFORE_DISTRIBUTION' ? 'IMPLEMENTED_HUMAN_GATED' : 'DESIGN_READY_ACTIVATION_INACTIVE',
      channels: distributionChannels,
      prepared_items: distributionItems,
      external_autopublish: distribution.controls?.automatic_external_publishing || 'DISABLED',
      destinations: channelStates
    },
    membership: {
      state: hasRegistryBackend ? 'IMPLEMENTED_HUMAN_GATED' : 'DESIGN_READY_ACTIVATION_INACTIVE',
      free_card_model: freeCard.status || null,
      public_square_memberships_active: publicSquare.activation_truth?.memberships_active ?? false,
      authoritative_registry_backend_detected: hasRegistryBackend,
      rule: 'Visual card, QR or public ID cannot establish active membership without an authorised protected registry record.'
    },
    partnerships: {
      state: 'DESIGN_READY_ACTIVATION_INACTIVE',
      rule: 'Discovery, due diligence and non-binding dialogue may be prepared; partnership activation requires a documented Human Gate and applicable agreement.'
    },
    monetization: {
      state: hasPaymentBackend ? 'IMPLEMENTED_HUMAN_GATED' : 'DESIGN_READY_ACTIVATION_INACTIVE',
      payment_backend_detected: hasPaymentBackend,
      payments_active: publicSquare.activation_truth?.payments_active ?? false,
      rule: 'Revenue readiness is measured separately from payment activation, contracting and benefit redemption.'
    },
    human_gate: {
      state: approval.mode === 'OWNER_APPROVAL_REQUIRED' ? 'IMPLEMENTED' : 'BLOCKED',
      automatic_production_merge: approval.owner_gate?.automatic_production_merge || 'DISABLED',
      automatic_external_publishing: approval.owner_gate?.automatic_external_publishing || 'DISABLED'
    }
  },
  audit: {
    measurement_is_not_judgment: true,
    reachability_is_not_verification: true,
    open_visibility_is_not_reuse_permission: true,
    public_repo_member_pii_prohibited: true,
    correction_and_withdrawal_required: true,
    generated_from_machine_readable_wpa_state: true
  }
};

await fs.writeFile(path.join(OUT, 'status.json'), JSON.stringify(command, null, 2), 'utf8');

const laneCards = Object.entries(command.lanes).map(([id, lane]) => {
  const facts = Object.entries(lane)
    .filter(([key]) => key !== 'rule' && key !== 'destinations')
    .map(([key, value]) => `<li><strong>${esc(key)}</strong>: ${esc(typeof value === 'object' ? JSON.stringify(value) : value)}</li>`)
    .join('');
  return `<article class="card"><div class="state">${esc(lane.state || 'UNKNOWN')}</div><h2>${esc(id.replaceAll('_',' '))}</h2><ul>${facts}</ul>${lane.rule ? `<p>${esc(lane.rule)}</p>` : ''}</article>`;
}).join('\n');

const html = `<!doctype html>
<html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>WPA PROTOCOLometry COMMAND CENTER</title><meta name="description" content="WPA 24/7 supervisory command center for evidence, rights, Protocolometry, products, distribution, membership, partnerships, monetization and Human Authority."><style>
:root{--navy:#071326;--navy2:#102542;--gold:#c8a84e;--cream:#fbf8ef;--ink:#182033;--line:#d8cfba;--muted:#667085}*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.55}header{background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-bottom:4px solid var(--gold);padding:52px 20px}header>div,main{max-width:1240px;margin:auto}h1,h2{font-family:Georgia,serif}.tag{display:inline-block;border:1px solid var(--gold);padding:6px 10px;color:#f0d990;font-weight:800;font-size:12px;letter-spacing:.08em}h1{font-size:clamp(34px,5vw,58px);color:#f0d990;margin:10px 0}.lead{max-width:980px;color:#e9e4d7}.flow{margin-top:20px;display:flex;gap:8px;flex-wrap:wrap}.flow span{border:1px solid rgba(255,255,255,.26);padding:6px 8px;font-size:11px}main{padding:30px 20px 70px}.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:20px}.pill,.card,.guard{background:#fff;border:1px solid var(--line)}.pill{padding:13px}.pill b{display:block;font-size:21px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{border-top:4px solid var(--gold);padding:20px}.card h2{text-transform:capitalize;color:var(--navy2)}.card ul{padding-left:19px}.card p,.card li{color:var(--muted)}.state{font-size:11px;font-weight:900;letter-spacing:.06em;color:#5e4a13}.guard{margin-top:20px;padding:20px;border-left:5px solid var(--gold)}@media(max-width:850px){.summary,.grid{grid-template-columns:1fr}}</style></head><body>
<header><div><span class="tag">WPA 24/7 · HUMAN-GOVERNED SUPERVISORY LAYER</span><h1>WPA PROTOCOLometry COMMAND CENTER</h1><p class="lead">Еден надзорен нервен систем за изворите, правата, доказното потекло, WPA-native трансформацијата, Protocolometry, истражувањето, производите, AI системите, дистрибуцијата, членството, партнерствата, монетизацијата и Sande Human Gate. Мерењето не е институционална пресуда.</p><div class="flow">${(command.canonical_flow || []).map((item) => `<span>${esc(item)}</span>`).join('')}</div></div></header>
<main><section class="summary"><div class="pill"><b>${esc(command.health.product_families)}</b>product families</div><div class="pill"><b>${esc(command.health.distribution_channels)}</b>distribution channels</div><div class="pill"><b>${esc(command.health.originality_quarantine_count)}</b>originality quarantine</div><div class="pill"><b>${esc(command.health.source_error_count)}</b>source errors this cycle</div></section><section class="grid">${laneCards}</section><section class="guard"><strong>Human Authority boundary</strong><p>Автоматизацијата може да собира, rights-check, мери, споредува, трансформира, подготвува и адаптира. Не смее самостојно да менува канон, да објавува научен труд, да активира членство/credential/партнерство/плаќање, да merge-ира production или да објавува надворешно без Human Gate.</p><p><a href="/operations/command-center/status.json">Machine-readable status</a> · <a href="/operations/">Institute Operations</a> · <a href="/products/protocolometryDigest.html">Protocolometry Digest</a></p><small>Generated ${esc(generated)}</small></section></main></body></html>`;

await fs.writeFile(path.join(OUT, 'index.html'), html, 'utf8');
console.log(`WPA PROTOCOLometry COMMAND CENTER built: ${productCount} product families, ${distributionChannels} channels, ${rightsHeld} rights/source holds.`);
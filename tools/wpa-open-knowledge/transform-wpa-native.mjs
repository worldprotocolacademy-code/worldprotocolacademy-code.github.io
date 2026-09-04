import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const generated = new Date().toISOString();
const OPEN = path.join(ROOT, 'data/open-knowledge');
const VIRTUAL = path.join(ROOT, 'data/virtual-sande');
const SCHOLARLY = path.join(OPEN, 'scholarly-atoms.json');
const INSTITUTIONAL = path.join(OPEN, 'institutional-practice-atoms.json');
const MODEL = path.join(ROOT, 'data/wpa-native-knowledge-transformation-model.json');
const OUT = path.join(OPEN, 'wpa-native-candidates.json');
const INTAKE = path.join(VIRTUAL, 'wpa-native-intake.json');

const readJson = async (p, fallback = {}) => {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return fallback; }
};
const writeJson = async (p, value) => fs.writeFile(p, JSON.stringify(value, null, 2), 'utf8');
const hash = (v) => crypto.createHash('sha256').update(String(v)).digest('hex').slice(0, 16).toUpperCase();
const clean = (v = '') => String(v).replace(/\s+/g, ' ').trim();
const uniq = (xs) => [...new Set(xs.filter(Boolean))];

const ROUTES = [
  'VIRTUAL_SANDE','VIRAL_SANDE','WPAWS','PROTOCOLometry','INSTITUTIONAL_STRATEGY','RESEARCH_AGENDA',
  'JOURNAL','WORKING_PAPER','PROTOCOL_NOTE','PROGRAMME_DESIGN','CURRICULUM','SIMULATION','CASE_STUDY',
  'BRIEFING','FORESIGHT','GOVERNANCE','QUALITY_ASSURANCE','PUBLIC_COMMUNICATION','SOCIAL_COMMUNICATION','STUDENT_DESK','EVENTS'
];

const DOMAIN = {
  PROTOCOL: { name:'Protocol Studies', measures:['mandate traceability','rule visibility','exception handling','correction time'] },
  DIPLOMACY_AND_IR: { name:'Diplomacy & International Relations', measures:['source verification coverage','decision provenance','cross-context comparability','correction capacity'] },
  PUBLIC_COMMUNICATION_AND_PR: { name:'Public Communication & PR', measures:['message-source traceability','correction latency','claim-evidence completeness','public clarity'] },
  SECURITY_STUDIES: { name:'Security Studies', measures:['time to detect risk','time to verified correction','override readiness','repeat-error rate'] },
  COMMUNICOLOGY: { name:'Communicology', measures:['context preservation','interpretive consistency','source-to-message traceability','correction propagation'] },
  CROSS_DISCIPLINARY: { name:'Protocolometry / Cross-disciplinary', measures:['construct observability','evidence completeness','fairness/robustness','correction capacity'] }
};

function words(s) {
  return clean(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter(Boolean);
}
function shingles(s, n = 8) {
  const w = words(s);
  const out = new Set();
  for (let i = 0; i <= w.length - n; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
}
function overlap8(source, generatedText) {
  const a = shingles(source, 8);
  for (const x of shingles(generatedText, 8)) if (a.has(x)) return x;
  return null;
}
function profile(ids = []) {
  const selected = (ids.length ? ids : ['CROSS_DISCIPLINARY']).map((id) => DOMAIN[id] || DOMAIN.CROSS_DISCIPLINARY);
  return {
    domains: uniq(selected.map((x) => x.name)),
    measures: uniq(selected.flatMap((x) => x.measures)).slice(0, 8)
  };
}
function baseReading(label, p, metadataOnly = false) {
  return {
    wpa_position: metadataOnly
      ? `WPA treats ${label} only as a discovery pointer until a lawful substantive evidence basis is verified.`
      : `WPA treats ${label} as attributable external evidence to be tested through WPA doctrine, HGAIM, Institutional DNA, Protocolometry and Human Authority rather than copied or adopted by default.`,
    human_authority_question: 'Which use changes institutional authority, doctrine, methodology, publication or public representation, and which Human Gate must control it?',
    protocolometry_questions: p.measures.map((m) => `Can ${m} be measured with transparent evidence, a correction rule and no automatic ordinal ranking?`),
    strategic_translation: 'Extract the institutional function, compare it with WPA capability, identify leverage and dependency, and create a bounded WPA-specific research, programme or communication option.',
    capability_resilience_question: 'What capability is gained, what dependency or misuse path is introduced, and who retains pause, override and accountability?',
    originality_rule: 'Preserve attribution and source facts; create new WPA analysis rather than paraphrasing protected expression.'
  };
}

function scholarlyCandidate(atom) {
  const p = profile(atom.discipline || []);
  const substantive = ['PUBLIC_DOMAIN','OPEN_LICENSE','MANUALLY_AUTHORISED'].includes(atom.access_basis);
  const title = atom.title || atom.atom_id;
  const c = {
    wpa_native_id: `WPA-NATIVE-S-${hash(atom.atom_id)}`,
    source_atom_id: atom.atom_id,
    source_class: 'SCHOLARLY_KNOWLEDGE_ATOM',
    source_identity: {
      title: atom.title || null,
      authors: atom.authors || [],
      year: atom.year || null,
      url: atom.source_identity?.url || null,
      doi: atom.source_identity?.doi || null,
      access_basis: atom.access_basis || null,
      license: atom.license || null,
      traceability_score: atom.traceability_score ?? null
    },
    evidence_scope: substantive ? 'SUBSTANTIVE_OPEN_EVIDENCE_CANDIDATE' : 'DISCOVERY_METADATA_ONLY',
    wpa_domains: p.domains,
    wpa_native_reading: baseReading(title, p, !substantive),
    research_agenda_candidate: substantive
      ? `Test the source-supported proposition associated with “${clean(title).slice(0,160)}” against WPA doctrine and observable institutional practice, then define a falsifiable measurement path.`
      : `Verify a lawful substantive evidence basis before “${clean(title).slice(0,160)}” can become a WPA research question.`,
    protocolometry_candidate: { no_ordinal_ranking:true, candidate_measures:p.measures, required_before_use:['construct definition','public evidence rule','bias/fairness review','correction mechanism','applicable Human Gate'] },
    virtual_sande_context: substantive ? 'Use only as attributed source-traceable context for comparison and question formation.' : 'Discovery pointer only until substantive evidence is verified.',
    viral_sande_angle: substantive ? 'Build a fresh WPA educational angle around evidence, mandate, Protocolometry and correction without reproducing protected source expression.' : 'No substantive public explainer from metadata alone.',
    eligible_routes: ROUTES,
    release_state: 'WPA_NATIVE_CANDIDATE_PENDING_HUMAN_REVIEW',
    human_gate: { state:'REQUIRED', doctrine_change:'HG4', consequential_methodology_change:'HG2_OR_HIGHER', scientific_publication:'EDITORIAL_HUMAN_REVIEW' },
    provenance_preserved: true,
    source_body_embedded: false,
    generated
  };
  const generatedText = JSON.stringify({reading:c.wpa_native_reading,research:c.research_agenda_candidate,viral:c.viral_sande_angle});
  const overlap = overlap8(atom.knowledge_summary || '', generatedText);
  c.originality_audit = { shared_source_sequence_8_words:overlap, pass:overlap === null, rule:'No shared eight-word sequence between source evidence summary and WPA-native analysis fields.' };
  return c;
}

function institutionalDisciplines(atom) {
  const t = new Set(atom.portal_signals?.topics || []);
  const ids = [];
  if (t.has('protocol')) ids.push('PROTOCOL');
  if (t.has('diplomacy')) ids.push('DIPLOMACY_AND_IR');
  if (t.has('public_communication_pr')) ids.push('PUBLIC_COMMUNICATION_AND_PR');
  if (t.has('security_studies')) ids.push('SECURITY_STUDIES');
  if (t.has('communicology')) ids.push('COMMUNICOLOGY');
  if (!ids.length || t.has('research') || t.has('programme_architecture')) ids.push('CROSS_DISCIPLINARY');
  return uniq(ids);
}

function institutionalCandidate(atom) {
  const p = profile(institutionalDisciplines(atom));
  const label = atom.institution_name || atom.institution_id;
  const observed = (atom.practice_type || []).map((x) => String(x).replaceAll('_',' ')).join(', ') || 'institutional practice';
  const c = {
    wpa_native_id: `WPA-NATIVE-I-${hash(atom.atom_id)}`,
    source_atom_id: atom.atom_id,
    source_class: 'INSTITUTIONAL_PRACTICE_ATOM',
    source_identity: {
      institution_id: atom.institution_id,
      institution_name: atom.institution_name,
      country: atom.country || null,
      source_refs: (atom.source_refs || []).map((x) => ({ url_or_identifier:x.url_or_identifier, source_tier:x.source_tier, retrieved:x.retrieved }))
    },
    evidence_scope: 'PUBLIC_PORTAL_PRACTICE_SIGNAL',
    observed_practice_types: atom.practice_type || [],
    wpa_domains: p.domains,
    wpa_native_reading: baseReading(label, p, false),
    institutional_dna_abstraction: `Treat the observed ${observed} as a comparison candidate. Isolate the underlying institutional function, test whether WPA already performs it, and adapt only what survives evidence, context, originality and Human Gate review.`,
    protocolometry_candidate: { no_ordinal_ranking:true, candidate_measures:p.measures, comparison_rule:'Compare evidence-backed functions and outcomes by peer/context; never infer superiority from page presence, prestige or volume.' },
    strategy_option: `Use ${label} only as an attributable external practice reference for capability-gap analysis and bounded WPA-specific alternatives; no affiliation, endorsement or origin transfer is implied.`,
    virtual_sande_context: 'Retrieve the Practice Atom and WPA-native layer together so source fact, interpretation and Human Gate remain distinct.',
    viral_sande_angle: 'Discuss the underlying institutional function through WPA provenance, Protocolometry, Human Authority and correction lenses without copying source wording.',
    eligible_routes: ROUTES,
    release_state: 'WPA_NATIVE_CANDIDATE_PENDING_HUMAN_REVIEW',
    human_gate: { state:'REQUIRED', programme_or_policy_adoption:'HG2_OR_HIGHER', doctrine_change:'HG4', external_claims:'HUMAN_VERIFICATION_REQUIRED' },
    provenance_preserved: true,
    source_body_embedded: false,
    generated
  };
  const generatedText = JSON.stringify({reading:c.wpa_native_reading,dna:c.institutional_dna_abstraction,strategy:c.strategy_option,viral:c.viral_sande_angle});
  const overlap = overlap8(atom.practice_summary || '', generatedText);
  c.originality_audit = { shared_source_sequence_8_words:overlap, pass:overlap === null, rule:'No shared eight-word sequence between observed-practice summary and WPA-native analysis fields.' };
  return c;
}

await fs.mkdir(OPEN, { recursive:true });
await fs.mkdir(VIRTUAL, { recursive:true });
const [scholarly, institutional, model] = await Promise.all([
  readJson(SCHOLARLY, { atoms:[] }),
  readJson(INSTITUTIONAL, { atoms:[] }),
  readJson(MODEL, {})
]);

const all = [
  ...(scholarly.atoms || []).map(scholarlyCandidate),
  ...(institutional.atoms || []).map(institutionalCandidate)
];
const candidates = all.filter((x) => x.originality_audit?.pass === true);
const quarantine = all.filter((x) => x.originality_audit?.pass !== true).map((x) => ({
  wpa_native_id: x.wpa_native_id,
  source_atom_id: x.source_atom_id,
  source_class: x.source_class,
  release_state: 'WITHHELD_ORIGINALITY_OVERLAP',
  shared_source_sequence_8_words: x.originality_audit?.shared_source_sequence_8_words || null,
  eligible_routes: [],
  human_gate: { state:'BLOCKED_PENDING_REWRITE_AND_REVIEW' },
  reason: 'Candidate failed the anti-copy overlap check and is excluded from all downstream WPA-native intake.'
}));

await writeJson(OUT, {
  schema: 'wpa-native-knowledge-candidates/1.2',
  generated,
  status: 'WPA_NATIVE_CANDIDATES_PENDING_HUMAN_REVIEW',
  transformation_model: '/data/wpa-native-knowledge-transformation-model.json',
  transformation_model_version: model.version || null,
  source_counts: { total_observed:all.length, eligible_after_originality_gate:candidates.length, quarantined:quarantine.length },
  doctrine: {
    formula: model.core_formula || null,
    principle: 'External knowledge remains external evidence; WPA-native output is a new governed analytical layer, not copied expression and not a transfer of authorship.',
    human_authority: 'Consequential institutional adoption, doctrine, methodology freeze, publication and official judgment remain human-controlled.'
  },
  originality_gate: {
    shared_sequence_length_words: 8,
    failed: 0,
    quarantined_before_downstream: quarantine.length,
    protected_source_body_embedded: false,
    fail_closed_scope: 'CANDIDATE_LEVEL',
    rule: 'Only originality-pass candidates enter downstream intake; failed candidates are quarantined while the 24/7 cycle continues.'
  },
  candidates,
  quarantine
});

await writeJson(INTAKE, {
  schema: 'wpa-virtual-viral-sande-native-intake/1.2',
  generated,
  status: 'WPA_NATIVE_CONTEXT_PENDING_HUMAN_REVIEW',
  purpose: 'Provenance-preserving WPA-native context for Virtual Sande, Viral Sande, WPAWS and eligible Institute systems.',
  source_layer: '/data/virtual-sande/open-knowledge-intake.json',
  transformation_layer: '/data/open-knowledge/wpa-native-candidates.json',
  doctrine_layer: '/data/wpa-native-knowledge-transformation-model.json',
  rule: 'Use only originality-pass candidates. Follow source references for factual verification and retain the applicable Human Gate.',
  routing: ROUTES,
  human_gate: { state:'REQUIRED', automatic_external_publication:'DISABLED', automatic_doctrine_change:'DISABLED', automatic_methodology_freeze:'DISABLED' },
  quarantined_candidate_ids: quarantine.map((x) => x.wpa_native_id),
  candidates
});

console.log(`WPA-native transformation complete: ${candidates.length}/${all.length} passed; ${quarantine.length} quarantined before downstream reuse.`);

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
const uniq = (xs) => [...new Set(xs.filter(Boolean))];
const clean = (v = '') => String(v).replace(/\s+/g, ' ').trim();

const DOMAIN = {
  PROTOCOL: {
    name: 'Protocol Studies',
    order: 'institutional order, precedence, representation and procedural legitimacy',
    measure: ['mandate traceability', 'rule visibility', 'exception handling', 'correction time'],
    strategy: 'test whether the signal strengthens predictable institutional order without reducing protocol to ceremonial appearance'
  },
  DIPLOMACY_AND_IR: {
    name: 'Diplomacy & International Relations',
    order: 'representation, negotiation context, multilateral conduct and diplomatic legitimacy',
    measure: ['source verification coverage', 'decision provenance', 'cross-context comparability', 'correction capacity'],
    strategy: 'translate the signal into a diplomacy question that separates observed practice from normative WPA doctrine'
  },
  PUBLIC_COMMUNICATION_AND_PR: {
    name: 'Public Communication & PR',
    order: 'institutional voice, public trust, accountability and communication discipline',
    measure: ['message-source traceability', 'correction latency', 'claim-evidence completeness', 'public clarity'],
    strategy: 'test how the signal can improve evidence-backed institutional communication without reputation-first distortion'
  },
  SECURITY_STUDIES: {
    name: 'Security Studies',
    order: 'preparedness, resilience, mandate boundaries and accountable risk response',
    measure: ['time to detect risk', 'time to verified correction', 'override readiness', 'repeat-error rate'],
    strategy: 'pair any capability lesson with its dependency, misuse path, failure mode and Human Authority override'
  },
  COMMUNICOLOGY: {
    name: 'Communicology',
    order: 'meaning, interaction, institutional communication systems and interpretive context',
    measure: ['context preservation', 'interpretive consistency', 'source-to-message traceability', 'correction propagation'],
    strategy: 'treat communication as an institutional system with observable handoffs rather than a standalone message product'
  },
  CROSS_DISCIPLINARY: {
    name: 'Protocolometry / Cross-disciplinary',
    order: 'measurement, evidence quality, institutional learning and governed comparison',
    measure: ['construct observability', 'evidence completeness', 'fairness/robustness', 'correction capacity'],
    strategy: 'measure before ranking and use the signal to test WPA methodology rather than to manufacture an ordinal judgment'
  }
};

const ROUTES = [
  'VIRTUAL_SANDE','VIRAL_SANDE','WPAWS','PROTOCOLometry','INSTITUTIONAL_STRATEGY','RESEARCH_AGENDA',
  'JOURNAL','WORKING_PAPER','PROTOCOL_NOTE','PROGRAMME_DESIGN','CURRICULUM','SIMULATION','CASE_STUDY',
  'BRIEFING','FORESIGHT','GOVERNANCE','QUALITY_ASSURANCE','PUBLIC_COMMUNICATION','SOCIAL_COMMUNICATION','STUDENT_DESK','EVENTS'
];

function words(s) {
  return clean(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ').filter(Boolean);
}
function shingles(s, n = 8) {
  const w = words(s); const set = new Set();
  for (let i = 0; i <= w.length - n; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
}
function overlap8(source, generatedText) {
  const a = shingles(source, 8); const b = shingles(generatedText, 8);
  for (const x of b) if (a.has(x)) return x;
  return null;
}

function profileForDisciplines(disciplines = []) {
  const ids = disciplines.length ? disciplines : ['CROSS_DISCIPLINARY'];
  const profiles = ids.map((id) => DOMAIN[id] || DOMAIN.CROSS_DISCIPLINARY);
  return {
    domains: uniq(profiles.map((p) => p.name)),
    institutional_order_lens: uniq(profiles.map((p) => p.order)).join('; '),
    protocolometry_measurement_candidates: uniq(profiles.flatMap((p) => p.measure)).slice(0, 8),
    strategy_translation: uniq(profiles.map((p) => p.strategy)).join('; ')
  };
}

function baseWpaReading(label, profile, evidenceClass) {
  const metadataOnly = evidenceClass === 'OPEN_METADATA_ONLY';
  return {
    wpa_position: metadataOnly
      ? `WPA treats ${label} as a discovery signal only. It can open a research path, but it cannot support a substantive institutional conclusion until an eligible evidence basis is verified.`
      : `WPA treats ${label} as external evidence to be tested against its own institutional doctrine, methodology and Human Authority architecture—not as a model to copy.`,
    institutional_order_question: `What does this signal reveal about ${profile.institutional_order_lens}, and which parts are observable rather than assumed?`,
    human_authority_question: 'Which consequential use would require HG2-HG4 approval, and who retains mandate, pause, override and accountability?',
    protocolometry_questions: profile.protocolometry_measurement_candidates.map((m) => `Can ${m} be operationalised with transparent evidence, a correction rule and no automatic ordinal ranking?`),
    strategic_translation: profile.strategy_translation,
    capability_resilience_question: 'If WPA adopts or adapts a lesson from this signal, what new capability, dependency, failure mode, misuse path and override requirement arise?',
    originality_rule: 'Use the source as evidence and stimulus; formulate the WPA contribution as a new comparison, measurement question, strategic option or bounded adaptation in WPA language.'
  };
}

function scholarlyCandidate(atom) {
  const profile = profileForDisciplines(atom.discipline || []);
  const label = atom.title || atom.atom_id;
  const reading = baseWpaReading(label, profile, atom.access_basis);
  const substantive = ['PUBLIC_DOMAIN', 'OPEN_LICENSE', 'MANUALLY_AUTHORISED'].includes(atom.access_basis);
  const candidate = {
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
    wpa_domains: profile.domains,
    wpa_native_reading: reading,
    research_agenda_candidate: substantive
      ? `Compare the source-supported proposition behind “${clean(atom.title).slice(0, 160)}” with WPA doctrine and observed institutional practice; identify convergence, divergence and a falsifiable measurement path.`
      : `Verify lawful substantive access and then determine whether “${clean(atom.title).slice(0, 160)}” warrants a WPA research question.`,
    protocolometry_candidate: {
      no_ordinal_ranking: true,
      candidate_measures: profile.protocolometry_measurement_candidates,
      required_before_use: ['construct definition', 'public evidence rule', 'bias/fairness review', 'correction mechanism', 'Human Gate for consequential methodology change']
    },
    virtual_sande_context: substantive
      ? 'Use as attributed, source-traceable context for comparison and question formation; preserve uncertainty and do not expand authority.'
      : 'Use only as a discovery pointer until substantive evidence is verified.',
    viral_sande_angle: substantive
      ? `Educational angle: explain the institutional question raised by this source through WPA's lenses of evidence, mandate, Protocolometry and correction—without reproducing the source's protected expression.`
      : 'No substantive public explainer from metadata alone; a discovery/reading-list mention may be prepared with attribution.',
    eligible_routes: ROUTES,
    release_state: 'WPA_NATIVE_CANDIDATE_PENDING_HUMAN_REVIEW',
    human_gate: { state: 'REQUIRED', doctrine_change: 'HG4', consequential_methodology_change: 'HG2_OR_HIGHER', scientific_publication: 'EDITORIAL_HUMAN_REVIEW' },
    provenance_preserved: true,
    source_body_embedded: false,
    generated
  };
  const generatedText = JSON.stringify({reading:candidate.wpa_native_reading,research:candidate.research_agenda_candidate,viral:candidate.viral_sande_angle});
  const overlap = overlap8(atom.knowledge_summary || '', generatedText);
  candidate.originality_audit = { shared_source_sequence_8_words: overlap, pass: overlap === null, rule: 'No shared eight-word sequence between source evidence summary and WPA-native analysis fields.' };
  return candidate;
}

function disciplinesFromInstitution(atom) {
  const t = new Set(atom.portal_signals?.topics || []);
  const d = [];
  if (t.has('protocol')) d.push('PROTOCOL');
  if (t.has('diplomacy')) d.push('DIPLOMACY_AND_IR');
  if (t.has('public_communication_pr')) d.push('PUBLIC_COMMUNICATION_AND_PR');
  if (t.has('security_studies')) d.push('SECURITY_STUDIES');
  if (t.has('communicology')) d.push('COMMUNICOLOGY');
  if (!d.length || t.has('research') || t.has('programme_architecture')) d.push('CROSS_DISCIPLINARY');
  return uniq(d);
}

function institutionalCandidate(atom) {
  const profile = profileForDisciplines(disciplinesFromInstitution(atom));
  const label = atom.institution_name || atom.institution_id;
  const reading = baseWpaReading(label, profile, 'PUBLIC_INSTITUTIONAL_SIGNAL');
  const types = (atom.practice_type || []).map((x) => String(x).replaceAll('_',' ')).join(', ') || 'institutional practice';
  const candidate = {
    wpa_native_id: `WPA-NATIVE-I-${hash(atom.atom_id)}`,
    source_atom_id: atom.atom_id,
    source_class: 'INSTITUTIONAL_PRACTICE_ATOM',
    source_identity: {
      institution_id: atom.institution_id,
      institution_name: atom.institution_name,
      country: atom.country || null,
      source_refs: (atom.source_refs || []).map((x) => ({url_or_identifier:x.url_or_identifier, source_tier:x.source_tier, retrieved:x.retrieved}))
    },
    evidence_scope: 'PUBLIC_PORTAL_PRACTICE_SIGNAL',
    observed_practice_types: atom.practice_type || [],
    wpa_domains: profile.domains,
    wpa_native_reading: reading,
    institutional_dna_abstraction: `Treat the observed ${types} signal as a comparison candidate: isolate the underlying institutional function, test whether WPA already performs it, and adapt only the function or principle that survives evidence, context and Human Gate review.`,
    protocolometry_candidate: {
      no_ordinal_ranking: true,
      candidate_measures: profile.protocolometry_measurement_candidates,
      comparison_rule: 'Compare evidence-backed functions and outcomes by peer/context; do not infer institutional superiority from page presence, prestige or volume.'
    },
    strategy_option: `Use ${label} only as an external practice reference for capability-gap analysis, research-question formation and bounded design alternatives; no affiliation, endorsement or origin transfer is implied.`,
    virtual_sande_context: 'Retrieve the Practice Atom and this WPA-native layer together so source fact, WPA interpretation and Human Gate status remain distinguishable.',
    viral_sande_angle: `Educational angle: discuss the institutional function behind the observed practice and how WPA would test it through provenance, Protocolometry, Human Authority and correction capacity—never as “WPA copied ${label}”.`,
    eligible_routes: ROUTES,
    release_state: 'WPA_NATIVE_CANDIDATE_PENDING_HUMAN_REVIEW',
    human_gate: { state: 'REQUIRED', programme_or_policy_adoption: 'HG2_OR_HIGHER', doctrine_change: 'HG4', external_claims: 'HUMAN_VERIFICATION_REQUIRED' },
    provenance_preserved: true,
    source_body_embedded: false,
    generated
  };
  const generatedText = JSON.stringify({reading:candidate.wpa_native_reading,dna:candidate.institutional_dna_abstraction,strategy:candidate.strategy_option,viral:candidate.viral_sande_angle});
  const overlap = overlap8(atom.practice_summary || '', generatedText);
  candidate.originality_audit = { shared_source_sequence_8_words: overlap, pass: overlap === null, rule: 'No shared eight-word sequence between observed-practice summary and WPA-native analysis fields.' };
  return candidate;
}

await fs.mkdir(OPEN, { recursive: true });
await fs.mkdir(VIRTUAL, { recursive: true });
const [scholarly, institutional, model] = await Promise.all([
  readJson(SCHOLARLY, { atoms: [] }),
  readJson(INSTITUTIONAL, { atoms: [] }),
  readJson(MODEL, {})
]);

const scholarlyCandidates = (scholarly.atoms || []).map(scholarlyCandidate);
const institutionalCandidates = (institutional.atoms || []).map(institutionalCandidate);
const allCandidates = [...scholarlyCandidates, ...institutionalCandidates];
const candidates = allCandidates.filter((x) => x.originality_audit?.pass);
const quarantined = allCandidates.filter((x) => !x.originality_audit?.pass).map((x) => ({
  ...x,
  eligible_routes: [],
  release_state: 'WITHHELD_ORIGINALITY_OVERLAP',
  human_gate: { ...x.human_gate, state: 'BLOCKED_PENDING_REWRITE_AND_REVIEW' },
  quarantine_reason: 'Shared eight-word sequence detected between source summary and generated WPA-native analysis. This candidate is withheld from Virtual/Viral Sande and all downstream reuse until rewritten and re-audited.'
}));

const payload = {
  schema: 'wpa-native-knowledge-candidates/1.1',
  generated,
  status: quarantined.length ? 'WPA_NATIVE_CANDIDATES_WITH_QUARANTINE_PENDING_HUMAN_REVIEW' : 'WPA_NATIVE_CANDIDATES_PENDING_HUMAN_REVIEW',
  transformation_model: '/data/wpa-native-knowledge-transformation-model.json',
  transformation_model_version: model.version || null,
  source_counts: {
    scholarly: scholarlyCandidates.length,
    institutional: institutionalCandidates.length,
    total_observed: allCandidates.length,
    eligible_after_originality_gate: candidates.length,
    quarantined: quarantined.length
  },
  doctrine: {
    formula: model.core_formula || null,
    principle: 'External knowledge remains external evidence; WPA-native output is a new governed analytical layer, not copied expression and not a transfer of authorship.',
    human_authority: 'Machines may discover, compare, structure and recommend. Consequential institutional adoption, doctrine, methodology freeze, publication and official judgment remain human-controlled.'
  },
  originality_gate: {
    shared_sequence_length_words: 8,
    failed: quarantined.length,
    protected_source_body_embedded: false,
    fail_closed_scope: 'CANDIDATE_LEVEL',
    rule: 'Any candidate that fails the overlap test is quarantined and excluded from downstream intake; the 24/7 Institute cycle continues with compliant candidates.'
  },
  candidates,
  quarantine: quarantined
};
await writeJson(OUT, payload);

const intake = {
  schema: 'wpa-virtual-viral-sande-native-intake/1.1',
  generated,
  status: quarantined.length ? 'WPA_NATIVE_CONTEXT_WITH_QUARANTINE_PENDING_HUMAN_REVIEW' : 'WPA_NATIVE_CONTEXT_PENDING_HUMAN_REVIEW',
  purpose: 'WPA-native, provenance-preserving context layer for Virtual Sande, Viral Sande, WPAWS and eligible Institute systems.',
  source_layer: '/data/virtual-sande/open-knowledge-intake.json',
  transformation_layer: '/data/open-knowledge/wpa-native-candidates.json',
  doctrine_layer: '/data/wpa-native-knowledge-transformation-model.json',
  rule: 'Use only candidates that passed the originality gate. Follow source references when factual verification is required; never convert a candidate into official doctrine, ranking, publication or institutional commitment without the applicable Human Gate.',
  routing: ROUTES,
  human_gate: { state: 'REQUIRED', automatic_external_publication: 'DISABLED', automatic_doctrine_change: 'DISABLED', automatic_methodology_freeze: 'DISABLED' },
  quarantined_candidate_ids: quarantined.map((x) => x.wpa_native_id),
  candidates
};
await writeJson(INTAKE, intake);

console.log(`WPA-native transformation complete: ${candidates.length}/${allCandidates.length} candidates passed; ${quarantined.length} quarantined for originality review.`);

import { buildCouncilPlan } from './wpa-ai-council-phase3.mjs';

export const VERSION = 'wpa-central-orchestrator-1.3.0';

export const COMMAND_HIERARCHY = {
  canonical_chain: 'Sande Smiljanov -> GPT + Claude -> Virtual Sande orchestrator -> 17 executive agents -> 80 tactical-operational agents',
  supreme_human_authority: {
    id: 'sande_smiljanov',
    name: 'Санде Смиљанов',
    role: 'supreme_human_authority',
    can_authorise_official_wpa_action: true
  },
  strategic_core: [
    { id: 'gpt', name: 'GPT', role: 'chief_proactive_strategic_agent', connection_mode: 'operational_in_current_chat_context' },
    { id: 'claude', name: 'Claude', role: 'chief_proactive_strategic_agent_and_independent_reviewer', connection_mode: 'adapter_unconfigured', boundary: 'Not live until an official approved API adapter is configured.' }
  ],
  orchestrator: {
    id: 'virtual_sande',
    name: 'Virtual Sande',
    role: 'wpa_owned_central_orchestrator_identity_doctrine_and_synthesis_layer'
  },
  executive_agents: { layer: 'WPAWS', count: 17, role: 'executive_agents' },
  tactical_operational_agents: { layer: 'WPA AI Council', count: 80, role: 'tactical_operational_agents' }
};

export const PERFORMANCE_DIRECTIVE = {
  principle: 'Maximise speed through controlled parallel execution without sacrificing accuracy, evidence, safety or Sande human authority.',
  classes: {
    fast_mission: { target_seconds: 60, label: 'WPA Fast Mission' },
    advanced_mission: { target_seconds: 300, label: 'WPA Advanced Mission' },
    full_council_mission: { target_seconds: 900, label: 'WPA Full Council Mission' },
    extended_verification: { target_seconds: null, label: 'WPA Extended Verification' }
  },
  accuracy_over_deadline: true,
  provisional_label_required_when_verification_incomplete: true,
  parallel_by_default: true
};

export const WPAWS_AGENTS = [
  [1,'Книга'],[2,'Анализа'],[3,'Семантика'],[4,'Цитати'],[5,'Рецензент'],[6,'Плагијат'],
  [7,'WPA Press'],[8,'Структура'],[9,'Ментор-Архитект'],[10,'Архитект'],[11,'Протокол'],
  [12,'Дипломатија'],[13,'Безбедност'],[14,'PPP'],[15,'Стилист'],[16,'Уредник'],[17,'Санде AI']
].map(([id,name])=>({id,name,command_level:'executive'}));

export const OUTPUTS = {
  premium_briefings:'/wpa-briefings.html',
  services:'/wpa-services.html',
  institutional_profile:'/wpa-one-page-service-profile.html',
  digital_pavilion:'/tools/wpa-digital-pavilion/',
  journal_candidate:'/journal/watch/',
  academic_search:'/tools/academic-search-hub/'
};

const normalize = value => ` ${String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()} `;

function isComprehensive(message='') {
  const q=normalize(message);
  return ['сите книги','all books','сеопфат','comprehensive','монограф','monograph','десет области','ten domains','full council'].some(x=>q.includes(normalize(x).trim()));
}

function requiresExtendedVerification(message='') {
  const q=normalize(message);
  return ['стотици извори','hundreds of sources','целосна автентикација','full citation authentication','голема архива','large archive','илјадници цитати','thousands of citations'].some(x=>q.includes(normalize(x).trim()));
}

function classifyMission(message='', comprehensive=false) {
  if (requiresExtendedVerification(message)) return 'extended_verification';
  if (comprehensive) return 'full_council_mission';
  const q=normalize(message);
  if (/повеќе извори|multi source|споредб|compare|cross domain|меѓудомен|independent review|независна проверка/.test(q)) return 'advanced_mission';
  return 'fast_mission';
}

function selectAgents(message='', comprehensive=false) {
  if (comprehensive) return WPAWS_AGENTS;
  const q=normalize(message);
  const ids=new Set([2,3,4,5,9,10,14,17]);
  if (/книг|book|монограф/.test(q)) ids.add(1);
  if (/протокол|precedence|церемон/.test(q)) ids.add(11);
  if (/дипломат|ambassador|embassy/.test(q)) ids.add(12);
  if (/безбед|security|risk|криз/.test(q)) ids.add(13);
  if (/стил|редак|publish|brief/.test(q)) { ids.add(7); ids.add(15); ids.add(16); }
  return WPAWS_AGENTS.filter(a=>ids.has(a.id));
}

function selectOutputs(message='') {
  const q=normalize(message); const selected=[];
  const add=id=>{if(!selected.includes(id))selected.push(id);};
  if (/brief|бриф|извештај/.test(q)) add('premium_briefings');
  if (/услуг|service|понуда|proposal/.test(q)) add('services');
  if (/профил|profile|institution/.test(q)) add('institutional_profile');
  if (/павилјон|pavilion|јавн|public experience/.test(q)) add('digital_pavilion');
  if (/journal|журнал|article|статиј/.test(q)) add('journal_candidate');
  if (/книг|book|source|извор|академ|research/.test(q)) add('academic_search');
  if (!selected.length) add('premium_briefings');
  return selected.map(id=>({id,path:OUTPUTS[id]}));
}

function buildCommandChain() {
  return [
    'sande_smiljanov',
    'gpt_and_claude_strategic_core',
    'virtual_sande_orchestrator',
    'wpaws_17_executive_agents',
    'council_80_tactical_operational_agents',
    'virtual_sande_synthesis',
    'evidence_gate',
    'safety_gate',
    'sande_human_approval',
    'wpa_output'
  ];
}

export function buildOrchestrationPlan(message='', options={}) {
  const comprehensive=options.mode==='comprehensive'||isComprehensive(message);
  const missionClass=options.missionClass||classifyMission(message,comprehensive);
  const council=buildCouncilPlan(message,{seatsPerPillar:comprehensive?8:(options.seatsPerPillar||2)});
  const performance=PERFORMANCE_DIRECTIVE.classes[missionClass];
  return {
    version:VERSION,
    canonical_chain:COMMAND_HIERARCHY.canonical_chain,
    identity:'GPT and Claude provide strategic direction; Virtual Sande is the WPA-owned orchestrator.',
    command_hierarchy:COMMAND_HIERARCHY,
    role:{heart:'connects every WPA system',eyes:'observes public and academic signals',brain:'analyses, compares and synthesizes',orchestrator:'converts approved strategy into controlled executive and tactical-operational tasks'},
    mode:comprehensive?'comprehensive':'selective',
    mission_class:missionClass,
    performance:{...performance,target_is_guarantee:false,parallel_execution:true,accuracy_over_deadline:true,provisional_if_incomplete:true},
    diplomatic_protocol_core:'mandatory',
    wpaws_agents:selectAgents(message,comprehensive),
    council:{...council,command_level:'tactical_operational',activation_policy:'only_after_human_or_approved_strategic_directive'},
    connected_outputs:selectOutputs(message),
    command_chain:buildCommandChain(),
    pipeline:['sande_smiljanov','gpt_and_claude_strategic_core','virtual_sande_orchestrator','wpaws_executive_agents','council_tactical_operational_agents','virtual_sande_synthesis','evidence_gate','safety_gate','sande_human_approval','wpa_output'],
    governance:{public_source_only:true,no_paywall_bypass:true,no_secret_sources:true,no_automatic_publication:true,human_review_required:true,claude_live_connection:false,accuracy_must_not_be_sacrificed_for_speed:true},
    release_status:'blocked_pending_mandatory_gates'
  };
}

export const __test={isComprehensive,requiresExtendedVerification,classifyMission,selectAgents,selectOutputs,normalize,buildCommandChain};

import { buildCouncilPlan } from './wpa-ai-council-phase3.mjs';

export const VERSION = 'wpa-central-orchestrator-1.1.0';

export const COMMAND_HIERARCHY = {
  supreme_human_authority: {
    id: 'sande_smiljanov',
    name: 'Санде Смиљанов',
    role: 'supreme_human_authority',
    can_authorise_official_wpa_action: true
  },
  strategic_core: [
    {
      id: 'virtual_sande',
      name: 'Virtual Sande',
      role: 'chief_proactive_strategic_agent_and_orchestrator',
      connection_mode: 'operational'
    },
    {
      id: 'claude',
      name: 'Claude',
      role: 'chief_proactive_strategic_agent_and_independent_reviewer',
      connection_mode: 'adapter_unconfigured',
      boundary: 'Not live until an official approved API adapter is configured.'
    }
  ],
  executive_agents: { layer: 'WPAWS', count: 17, role: 'executive_agents' },
  tactical_operational_agents: { layer: 'WPA AI Council', count: 80, role: 'tactical_operational_agents' }
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
    'sande_human_directive_or_approved_strategic_proposal',
    'virtual_sande_and_claude_strategic_planning',
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
  const council=buildCouncilPlan(message,{seatsPerPillar:comprehensive?8:(options.seatsPerPillar||2)});
  return {
    version:VERSION,
    identity:'Virtual Sande and Claude — WPA dual proactive strategic core under Sande human authority',
    command_hierarchy:COMMAND_HIERARCHY,
    role:{heart:'connects every WPA system',eyes:'observes public and academic signals',brain:'analyses, compares and synthesizes',orchestrator:'coordinates strategic, executive and tactical-operational layers'},
    mode:comprehensive?'comprehensive':'selective',
    diplomatic_protocol_core:'mandatory',
    wpaws_agents:selectAgents(message,comprehensive),
    council:{...council,command_level:'tactical_operational',activation_policy:'only_after_human_or_strategic_core_directive'},
    connected_outputs:selectOutputs(message),
    command_chain:buildCommandChain(),
    pipeline:['public_sources','wpa_watch_and_live_feeds','protocolometry_scoring','academic_search_verification','dual_strategic_core','wpaws_executive_agents','council_tactical_operational_agents','virtual_sande_synthesis','evidence_gate','safety_gate','sande_human_approval','wpa_output'],
    governance:{public_source_only:true,no_paywall_bypass:true,no_secret_sources:true,no_automatic_publication:true,human_review_required:true,claude_live_connection:false},
    release_status:'blocked_pending_mandatory_gates'
  };
}

export const __test={isComprehensive,selectAgents,selectOutputs,normalize,buildCommandChain};
import { PILLARS, DIPLOMATIC_PROTOCOL_CORE, buildCouncilPlan } from './wpa-ai-council-phase3.mjs';

const VERSION='wpa-ai-council-prompt-compiler-1.1';
const CANONICAL_CHAIN='Sande Smiljanov -> WPA Doctrine Kernel -> GPT + Claude strategic core -> Virtual Sande orchestrator -> 17 executive agents -> 80 tactical-operational agents';

export const TACTICAL_ROLES=[
  {id:'doctrine_guard',instruction:'Protect WPA doctrine, terminology and conceptual distinctions.'},
  {id:'evidence_researcher',instruction:'Map every material claim to verifiable evidence or mark it unsupported.'},
  {id:'comparative_analyst',instruction:'Compare interpretations and expose agreement, disagreement and uncertainty.'},
  {id:'practice_specialist',instruction:'Assess institutional practice without inventing procedures.'},
  {id:'risk_critic',instruction:'Identify legal, reputational, operational and security risks.'},
  {id:'cross_cultural_reviewer',instruction:'Check intercultural, religious and host-state sensitivities.'},
  {id:'language_editor',instruction:'Enforce clear Macedonian or English and protected WPA terminology.'},
  {id:'red_team_reviewer',instruction:'Challenge weak assumptions, hallucinations and unsupported confidence.'}
];
export const ADVISORY_ROLES=TACTICAL_ROLES;

function pillarById(id){return PILLARS.find(p=>p.id===id);}

export function compileSeatPrompts(message,options={}){
  const plan=buildCouncilPlan(message,{seatsPerPillar:8});const selected=new Set(plan.selected_pillars.map(p=>p.id));const activeOnly=options.activeOnly!==false;const seats=[];
  for(const pillar of PILLARS){if(activeOnly&&!selected.has(pillar.id))continue;TACTICAL_ROLES.forEach((role,index)=>seats.push({
    seat:`${pillar.id.toUpperCase()}-${String(index+1).padStart(2,'0')}`,pillar:pillar.id,pillar_name:pillar.name,role:role.id,command_level:'tactical_operational',activation:'approved_directive_required',
    prompt:[`You are tactical-operational WPA Council agent ${pillar.id.toUpperCase()}-${String(index+1).padStart(2,'0')}.`,`Command chain: ${CANONICAL_CHAIN}.`,`Domain: ${pillar.name}.`,`Mission: ${role.instruction}`,'Do not begin content access until the WPA Preventive Source Compliance Gate passes. No credential, paywall or DRM bypass; no silent download; no unverified RAG ingestion.','Diplomatic Protocol Core is mandatory: check precedence, accreditation, forms of address, visits, symbols, seating, ceremonial sequence, host-state practice, Vienna Convention context and institutional dignity.','You have bounded task-execution authority only after a Sande directive or approved strategic directive. Do not publish, impersonate a provider, invent citations or claim final WPA authority.','Return: findings; evidence; uncertainty; risks; recommendation.'].join('\n')
  }));}
  return {version:VERSION,message:String(message||''),canonical_chain:CANONICAL_CHAIN,foundation:DIPLOMATIC_PROTOCOL_CORE,plan,seats};
}

export function compileCouncilSystemPrompt(message,options={}){
  const pack=compileSeatPrompts(message,options);const pillars=pack.plan.selected_pillars.map(p=>p.name).join(', ');const roles=TACTICAL_ROLES.map(r=>r.id).join(', ');
  return ['WPA AI COUNCIL — CONTROLLED TACTICAL-OPERATIONAL LAYER',`Command chain: ${CANONICAL_CHAIN}.`,`Selected pillars: ${pillars}.`,`Tactical roles: ${roles}.`,'GPT and Claude provide strategic direction; Claude is not live until an approved official adapter exists. Virtual Sande is the WPA-owned orchestrator.','Doctrine Kernel and Source Compliance Gate run before agent execution and content access.','Separate facts, sourced claims, inferences, disagreements and unresolved questions.','No WPA Output is authorised before Doctrine Kernel, Source Compliance Gate, Diplomatic Protocol Core, Evidence Gate, Safety Gate and Sande Human Approval all pass.','Never expose secrets, private data, classified material or unverified provider output as fact.'].join('\n');
}

export const __test={pillarById,VERSION,CANONICAL_CHAIN};

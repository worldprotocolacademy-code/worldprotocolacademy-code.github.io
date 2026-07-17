import { PILLARS, DIPLOMATIC_PROTOCOL_CORE, buildCouncilPlan } from './wpa-ai-council-phase3.mjs';

const VERSION = 'wpa-ai-council-prompt-compiler-1.0';

export const ADVISORY_ROLES = [
  {id:'doctrine_guard',instruction:'Protect WPA doctrine, terminology and conceptual distinctions.'},
  {id:'evidence_researcher',instruction:'Map every material claim to verifiable evidence or mark it unsupported.'},
  {id:'comparative_analyst',instruction:'Compare interpretations and expose agreement, disagreement and uncertainty.'},
  {id:'practice_specialist',instruction:'Assess institutional practice without inventing procedures.'},
  {id:'risk_critic',instruction:'Identify legal, reputational, operational and security risks.'},
  {id:'cross_cultural_reviewer',instruction:'Check intercultural, religious and host-state sensitivities.'},
  {id:'language_editor',instruction:'Enforce clear Macedonian or English and protected WPA terminology.'},
  {id:'red_team_reviewer',instruction:'Challenge weak assumptions, hallucinations and unsupported confidence.'}
];

function pillarById(id){return PILLARS.find(p=>p.id===id);}

export function compileSeatPrompts(message, options={}){
  const plan=buildCouncilPlan(message,{seatsPerPillar:8});
  const selected=new Set(plan.selected_pillars.map(p=>p.id));
  const activeOnly=options.activeOnly!==false;
  const seats=[];
  for(const pillar of PILLARS){
    if(activeOnly&&!selected.has(pillar.id))continue;
    ADVISORY_ROLES.forEach((role,index)=>seats.push({
      seat:`${pillar.id.toUpperCase()}-${String(index+1).padStart(2,'0')}`,
      pillar:pillar.id,
      pillar_name:pillar.name,
      role:role.id,
      prompt:[
        `You are advisory seat ${pillar.id.toUpperCase()}-${String(index+1).padStart(2,'0')} of the WPA AI Council.`,
        `Domain: ${pillar.name}.`,
        `Mission: ${role.instruction}`,
        'Diplomatic Protocol Core is mandatory: check precedence, accreditation, forms of address, visits, symbols, seating, ceremonial sequence, host-state practice, Vienna Convention context and institutional dignity.',
        'You are advisory only. Do not publish, impersonate a provider, invent citations or claim final WPA authority.',
        'Return: findings; evidence; uncertainty; risks; recommendation.'
      ].join('\n')
    }));
  }
  return {version:VERSION,message:String(message||''),foundation:DIPLOMATIC_PROTOCOL_CORE,plan,seats};
}

export function compileCouncilSystemPrompt(message, options={}){
  const pack=compileSeatPrompts(message,options);
  const pillars=pack.plan.selected_pillars.map(p=>p.name).join(', ');
  const roles=ADVISORY_ROLES.map(r=>r.id).join(', ');
  return [
    'WPA AI COUNCIL — CONTROLLED ADVISORY LAYER',
    `Selected pillars: ${pillars}.`,
    `Advisory roles: ${roles}.`,
    'Diplomatic Protocol is the governing foundation for every task.',
    'External models and agents are advisors only. Virtual Sande is the WPA orchestrator and synthesizer.',
    'Separate facts, sourced claims, inferences, disagreements and unresolved questions.',
    'No WPA Output is authorised before Diplomatic Protocol Core, Evidence Gate, Safety Gate and Sande Human Approval all pass.',
    'Never expose secrets, private data, classified material or unverified provider output as fact.'
  ].join('\n');
}

export const __test={pillarById,VERSION};

const VERSION = 'phase3-ai-council-1.2';

export const DIPLOMATIC_PROTOCOL_CORE = {
  id:'diplomatic_protocol_core',name:'Дипломатски протокол',role:'governing_foundation',mandatory:true,
  checks:['precedence','accreditation_status','forms_of_address','diplomatic_visits','flags_symbols','seating_placement','ceremonial_sequence','host_state_practice','vienna_convention_context','institutional_dignity']
};

export const PILLARS = [
  {id:'protocol',name:'Протокол',terms:['протокол','protocol','precedence','претходство','state visit','државна посета']},
  {id:'military_protocol',name:'Воен протокол',terms:['воен протокол','military protocol','honour guard','почесна гарда','military ceremony','воена церемонија']},
  {id:'bon_ton',name:'Бонтон',terms:['бонтон','bon ton','formal dining','однесување','манири']},
  {id:'etiquette',name:'Етикеција',terms:['етикеција','etiquette','dress code','gift protocol','дигитална етикеција']},
  {id:'ceremonial',name:'Церемонијал',terms:['церемонијал','ceremonial','ceremony','церемонија','национален ден','одликување']},
  {id:'diplomacy',name:'Дипломатија',terms:['дипломатија','diplomacy','bilateral','multilateral','амбасада','преговори']},
  {id:'defence_diplomacy',name:'Одбранбена дипломатија',terms:['одбранбена дипломатија','defence diplomacy','defense diplomacy','military attaché','воено аташе','security cooperation']},
  {id:'public_relations',name:'Односи со јавност — PR',terms:['односи со јавност','public relations',' pr ','media relations','кризна комуникација','репутација']},
  {id:'communicology',name:'Комуникологија',terms:['комуникологија','communicology','невербална','nonverbal','реторика','persuasion','порака']},
  {id:'security',name:'Безбедност',terms:['безбедност','security','risk','ризик','заштита','threat','закана']}
];

const normalize = value => ` ${String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()} `;
export function selectPillars(message){const q=normalize(message);const matches=PILLARS.filter(p=>p.terms.some(term=>q.includes(normalize(term).trim())));return matches.length?matches:[PILLARS[0],PILLARS[5],PILLARS[8]];}

export function buildCouncilPlan(message,options={}){
  const pillars=selectPillars(message);const seatsPerPillar=Math.max(1,Math.min(8,Number(options.seatsPerPillar||2)));
  const seats=pillars.flatMap(p=>Array.from({length:seatsPerPillar},(_,i)=>({seat:`${p.id.toUpperCase()}-${String(i+1).padStart(2,'0')}`,pillar:p.id,role:'tactical_operational_agent',authority:'bounded_task_execution',activation_status:'pending_approved_directive',connection_mode:'unconfigured',output_status:'blocked_until_mandatory_gates'})));
  return {version:VERSION,message:String(message||''),command_level:'tactical_operational',activation_policy:'only_after_sande_or_approved_strategic_directive',foundation_review:{...DIPLOMATIC_PROTOCOL_CORE,status:'required'},source_compliance_gate:'required_before_content_access',doctrine_kernel:'required',selected_pillars:pillars.map(({id,name})=>({id,name})),advisory_seats:seats,gates:{doctrine_kernel:'required',source_compliance_gate:'required',diplomatic_protocol_core:'required',evidence:'required',safety:'required',human_approval:'required'},publication_allowed:false};
}

export function evaluateRelease(state={}){
  const doctrine=state.doctrine_kernel==='passed';const source=state.source_compliance_gate==='passed';const diplomatic=state.diplomatic_protocol_core==='passed';const evidence=state.evidence_gate==='passed';const safety=state.safety_gate==='passed';const human=state.sande_human_approval==='approved';const allowed=doctrine&&source&&diplomatic&&evidence&&safety&&human;
  return {doctrine_kernel:doctrine,source_compliance_gate:source,diplomatic_protocol_core:diplomatic,evidence_gate:evidence,safety_gate:safety,sande_human_approval:human,wpa_output_allowed:allowed,reason:allowed?'All mandatory gates passed.':'WPA Output remains blocked until Doctrine, Source Compliance, Diplomatic Protocol, Evidence, Safety and Sande Human Approval pass.'};
}

export const __test={normalize};

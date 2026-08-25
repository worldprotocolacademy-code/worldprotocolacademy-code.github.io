export const VERSION='wpa-doctrine-kernel-1.1.0';
export const CANONICAL_CHAIN=['sande_smiljanov','wpa_doctrine_kernel','gpt_and_claude_strategic_core','virtual_sande_orchestrator','wpaws_17_executive_agents','council_80_tactical_operational_agents'];
export const REQUIRED_GATES=['doctrine_kernel','source_compliance_gate','diplomatic_protocol_core','evidence_gate','safety_gate','sande_human_approval'];
export const COGNITIVE_CONSCIENCE_RULES={
  fear_is_consent:false,
  prediction_is_permission:false,
  mind_access_creates_authority:false,
  intimate_interface_increases_machine_authority:false,
  stronger_human_safeguards_with_greater_proximity:true
};

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const truthy=v=>v===true;

export function evaluateDoctrineAlignment(candidate={}){
  const violations=[]; const warnings=[];
  if(!same(candidate.command_chain||[],CANONICAL_CHAIN)) violations.push({id:'command_chain_drift',expected:CANONICAL_CHAIN,actual:candidate.command_chain||[]});
  const gates=candidate.gates||[];
  for(const gate of REQUIRED_GATES) if(!gates.includes(gate)) violations.push({id:'missing_gate',gate});
  if(candidate.automatic_publication===true) violations.push({id:'automatic_publication_forbidden'});
  if(candidate.sande_human_approval_required!==true) violations.push({id:'sande_approval_required'});

  if(candidate.fear_mediated_consent===true||candidate.coercion_mediated_consent===true) violations.push({id:'fear_or_coercion_mediated_consent_forbidden'});
  if(candidate.infer_consent_from_emotion===true||candidate.infer_consent_from_prediction===true||candidate.infer_consent_from_behaviour===true||candidate.infer_consent_from_biometrics===true||candidate.infer_consent_from_profiling===true) violations.push({id:'inferred_consent_forbidden'});
  if(candidate.covert_manipulation_of_informed_choice===true) violations.push({id:'covert_manipulation_of_informed_choice_forbidden'});
  if(candidate.machine_authority_increases_with_interface_proximity===true) violations.push({id:'intimate_interface_authority_escalation_forbidden'});
  if(candidate.cognitive_conscience_integrity_preserved===false) violations.push({id:'cognitive_conscience_integrity_violation'});

  const intimate=truthy(candidate.intimate_interface)||truthy(candidate.neural_inference)||truthy(candidate.biometric_inference)||truthy(candidate.embodied_interface);
  if(intimate&&candidate.stronger_human_safeguards_required!==true) violations.push({id:'stronger_human_safeguards_required_for_intimate_interface'});
  if(intimate&&candidate.human_pause_refuse_contest_path!==true) violations.push({id:'pause_refuse_contest_path_required'});

  if(candidate.authorial_corpus_verified!==true) warnings.push({id:'authorial_dna_check_requires_verified_corpus'});
  return {status:violations.length?'blocked_pending_sande_review':warnings.length?'warning':'aligned',violations,warnings,requires_sande_review:violations.length>0};
}

export function buildDoctrineReview(mission='',candidate={}){
  return {
    version:VERSION,
    mission:String(mission||''),
    constitutional_checks:[
      {id:'truth_check',status:'required'},
      {id:'doctrine_check',status:'required'},
      {id:'authorial_dna_check',status:candidate.authorial_corpus_verified===true?'required':'requires_verified_authorial_corpus'},
      {id:'authentic_human_authorisation_check',status:'required'},
      {id:'cognitive_conscience_integrity_check',status:'required'}
    ],
    maxims:[
      'Fear is not consent.',
      'Prediction is not permission.',
      'Access to the mind is not authority over the mind.',
      'Greater technological proximity requires stronger human safeguards, not greater machine authority.'
    ],
    alignment:evaluateDoctrineAlignment(candidate),
    release_allowed:false,
    release_reason:'Doctrine review never replaces Source Compliance, Evidence, Safety and Sande Human Approval.'
  };
}

export function requestDoctrineChange(change={}){
  return {version:VERSION,change,approval_status:'sande_review_required',applied:false,automatic_application_forbidden:true};
}

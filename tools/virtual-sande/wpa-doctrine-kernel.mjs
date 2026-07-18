export const VERSION='wpa-doctrine-kernel-1.0.0';
export const CANONICAL_CHAIN=['sande_smiljanov','wpa_doctrine_kernel','gpt_and_claude_strategic_core','virtual_sande_orchestrator','wpaws_17_executive_agents','council_80_tactical_operational_agents'];
export const REQUIRED_GATES=['doctrine_kernel','source_compliance_gate','diplomatic_protocol_core','evidence_gate','safety_gate','sande_human_approval'];

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function evaluateDoctrineAlignment(candidate={}){
  const violations=[]; const warnings=[];
  if(!same(candidate.command_chain||[],CANONICAL_CHAIN)) violations.push({id:'command_chain_drift',expected:CANONICAL_CHAIN,actual:candidate.command_chain||[]});
  const gates=candidate.gates||[];
  for(const gate of REQUIRED_GATES) if(!gates.includes(gate)) violations.push({id:'missing_gate',gate});
  if(candidate.automatic_publication===true) violations.push({id:'automatic_publication_forbidden'});
  if(candidate.sande_human_approval_required!==true) violations.push({id:'sande_approval_required'});
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
      {id:'authorial_dna_check',status:candidate.authorial_corpus_verified===true?'required':'requires_verified_authorial_corpus'}
    ],
    alignment:evaluateDoctrineAlignment(candidate),
    release_allowed:false,
    release_reason:'Doctrine review never replaces Source Compliance, Evidence, Safety and Sande Human Approval.'
  };
}

export function requestDoctrineChange(change={}){
  return {version:VERSION,change,approval_status:'sande_review_required',applied:false,automatic_application_forbidden:true};
}

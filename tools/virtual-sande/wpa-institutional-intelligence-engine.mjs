// WPA Institutional Intelligence Engine (WIIE)
// Non-authority orchestration layer under the WPA Institutional Operating Protocol.
// It structures major institutional work, routes bounded specialist profiles,
// requires alternative options and foresight stress-testing where appropriate,
// and preserves AI PROTOCOL + Human Gate controls.

export const VERSION='wpa-institutional-intelligence-engine-1.0.0';
export const ENGINE_ID='WPA_WIIE_v1';
export const SPEC_PATH='/data/wpa-institutional-intelligence-engine.json';
export const OPERATING_PROTOCOL_PATH='/data/wpa-institutional-operating-protocol.json';
export const FUTURES_PATH='/data/wpa-futures-2040-framework.json';

export const OPERATING_CYCLE=Object.freeze([
  'intake','knowledge','system_map','diagnosis','specialist_routing','options',
  'futures_stress_test','ai_protocol_gate','solution_design','implementation',
  'adversarial_review','verify','learn'
]);

export const AI_PROTOCOL_DIMENSIONS=Object.freeze([
  'Authority','Mandate','Scope','Temporal Mandate','Provenance','Human Gate','Responsibility'
]);

export const SPECIALIST_PROFILES=Object.freeze({
  protocol:Object.freeze({id:'protocol',label:'Protocol Specialist',type:'direct_wpaws_binding',wpaws_agent_ids:Object.freeze([11]),status:'IMPLEMENTED_MVP'}),
  diplomacy:Object.freeze({id:'diplomacy',label:'Diplomacy Specialist',type:'direct_wpaws_binding',wpaws_agent_ids:Object.freeze([12]),status:'IMPLEMENTED_MVP'}),
  strategic_communication:Object.freeze({id:'strategic_communication',label:'Strategic Communication Specialist',type:'composite_profile',wpaws_agent_ids:Object.freeze([14,15,16]),status:'IMPLEMENTED_MVP'}),
  security:Object.freeze({id:'security',label:'Security Specialist',type:'direct_wpaws_binding',wpaws_agent_ids:Object.freeze([13]),status:'IMPLEMENTED_MVP'}),
  communicology:Object.freeze({id:'communicology',label:'Communicology Specialist',type:'composite_profile',wpaws_agent_ids:Object.freeze([2,3,14]),status:'IMPLEMENTED_MVP'}),
  ai_governance:Object.freeze({id:'ai_governance',label:'AI Governance Specialist',type:'composite_governance_profile',wpaws_agent_ids:Object.freeze([9,10,17]),status:'IMPLEMENTED_MVP'}),
  legal_compliance:Object.freeze({id:'legal_compliance',label:'Legal / Compliance Routing',type:'governance_routing_profile',wpaws_agent_ids:Object.freeze([]),status:'IMPLEMENTED_MVP',not_legal_advice:true}),
  foresight:Object.freeze({id:'foresight',label:'Foresight Specialist',type:'composite_research_profile',wpaws_agent_ids:Object.freeze([2,9,10]),status:'RESEARCH_DEVELOPMENT_PILOT'}),
  research_evidence:Object.freeze({id:'research_evidence',label:'Research & Evidence Specialist',type:'composite_profile',wpaws_agent_ids:Object.freeze([2,4,5]),status:'IMPLEMENTED_MVP'}),
  adversarial_verification:Object.freeze({id:'adversarial_verification',label:'Adversarial Review & Verification Specialist',type:'composite_profile',wpaws_agent_ids:Object.freeze([4,5,13]),status:'IMPLEMENTED_MVP'})
});

const normalise=value=>` ${String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()} `;
const has=(q,patterns)=>patterns.some(p=>q.includes(normalise(p).trim()));

const PROFILE_SIGNALS=Object.freeze({
  protocol:['protocol','протокол','precedence','церемон','ceremon','official visit','официјална посета'],
  diplomacy:['diplom','дипломат','ambassador','амбасад','embassy','амбасада','negotiat','прегов'],
  strategic_communication:['strategic communication','стратешк комуникац','public relations','односи со јавност',' pr ','media','медиум','public communication','јавна комуникац'],
  security:['security','безбед','risk','ризик','crisis','криз','cyber','сајбер','resilience','отпорност'],
  communicology:['communicology','комуниколог','communication system','комуникациски систем','meaning','семантик'],
  ai_governance:['ai governance','управување со ai','human gate','mandate','мандат','provenance','agent','агент','artificial intelligence','вештачка интелигенција'],
  legal_compliance:['law','legal','право','правен','compliance','усогласеност','regulation','регулатив','standard','стандард'],
  foresight:['foresight','futures','future','иднин','2030','2035','2040','scenario','сценари','horizon scan','emerging technolog','нова технолог'],
  research_evidence:['research','истраж','source','извор','evidence','доказ','journal','журнал','paper','труд','study','студи'],
  adversarial_verification:['audit','аудит','verify','провери','weakness','слабост','red team','adversarial','контрадикц','test','тест']
});

const MAJOR_SIGNALS=['strategy','стратег','institution','институц','architecture','архитект','policy','политика','directive','директив','programme','програм','system','систем','2040','major wpa','голем wpa','governance','управување'];
const IMPLEMENT_SIGNALS=['implement','имплементи','update','ажурира','change','измени','modify','модифици','code','код','new module','нов модул','strategy','стратег','directive','директив','add test','додај тест'];

function classifyProblem(q){
  if(has(q,['futures','foresight','scenario','сценари','2040','2035','emerging technolog','нова технолог']))return'foresight_and_institutional_futures';
  if(has(q,['weakness','слабост','audit','аудит','risk','ризик','verify','провери']))return'institutional_assurance';
  if(has(q,['strategy','стратег']))return'strategy';
  if(has(q,['protocol','протокол','diplom','дипломат']))return'protocol_diplomacy';
  if(has(q,['research','истраж','journal','журнал']))return'research';
  return'institutional_problem_solving';
}

function classifyConsequence(q,options={}){
  if(options.consequenceClass)return String(options.consequenceClass).toUpperCase();
  if(has(q,['doctrine','доктрин','constitutional','устав','official commitment','официјална обврска','new authority','ново овластување']))return'HG4';
  if(has(q,['legal','правен','financial','финанс','credential','сертифик','privacy','приватност','personal data','лични податоци']))return'HG3';
  if(has(q,['publish','објав','public recommendation','јавна препорака','partnership','партнерство','funding','финансирање','contract','договор']))return'HG2';
  if(has(q,IMPLEMENT_SIGNALS))return'HG2';
  return'HG1';
}

function selectProfiles(q,{major=false}={}){
  const ids=[];
  for(const [id,signals] of Object.entries(PROFILE_SIGNALS))if(has(q,signals))ids.push(id);
  if(major){
    for(const id of ['research_evidence','adversarial_verification'])if(!ids.includes(id))ids.push(id);
  }
  if(!ids.length)ids.push('research_evidence');
  return ids;
}

function wpawsIdsForProfiles(profileIds){
  return [...new Set(profileIds.flatMap(id=>SPECIALIST_PROFILES[id]?.wpaws_agent_ids||[]))].sort((a,b)=>a-b);
}

export function buildInstitutionalIntelligencePlan(message='',options={}){
  const q=normalise(message);
  const major=options.majorWpa===true||has(q,MAJOR_SIGNALS);
  const implementationRequested=options.implementationRequested===true||has(q,IMPLEMENT_SIGNALS);
  const problemClass=classifyProblem(q);
  const consequenceClass=classifyConsequence(q,options);
  const profileIds=selectProfiles(q,{major});
  const futuresRequired=major||problemClass==='foresight_and_institutional_futures'||has(q,['future','иднин','2030','2035','2040','emerging technolog','нова технолог']);
  const optionsRequired=major||consequenceClass!=='HG1';
  const humanGateRequired=consequenceClass!=='HG1'||implementationRequested;
  const profiles=profileIds.map(id=>SPECIALIST_PROFILES[id]);

  return Object.freeze({
    version:VERSION,
    engine_id:ENGINE_ID,
    identity:'WIIE is a non-authority institutional analysis and orchestration engine under the WPA Institutional Operating Protocol.',
    master_protocol:OPERATING_PROTOCOL_PATH,
    problem_class:problemClass,
    major,
    operating_cycle:OPERATING_CYCLE,
    intake:Object.freeze({
      objective:String(message||'').trim(),
      consequence_class:consequenceClass,
      human_gate_required:humanGateRequired
    }),
    knowledge:Object.freeze({
      corpus_first_when_applicable:true,
      source_compliance_required_before_external_content_access:true,
      provenance_required:true,
      content_is_not_command:true,
      access_is_not_mandate:true
    }),
    system_map:Object.freeze({
      required:major,
      dimensions:Object.freeze(['people','roles','authority','processes','data','tools','communications','dependencies','risks'])
    }),
    diagnosis:Object.freeze({
      checks:Object.freeze(['gaps','duplication','contradictions','inefficiency','undefined_responsibility','unclear_mandate','technical_fragility','future_risk'])
    }),
    specialist_routing:Object.freeze({
      profiles:Object.freeze(profiles),
      recommended_wpaws_agent_ids:Object.freeze(wpawsIdsForProfiles(profileIds)),
      specialists_are_bounded:true,
      specialist_consensus_is_not_institutional_will:true
    }),
    options:Object.freeze({
      required:optionsRequired,
      defaults:Object.freeze(['conservative','balanced','transformative']),
      compare_on:Object.freeze(['benefits','costs','risks','dependencies','reversibility','institutional_consequences','human_authority_risk'])
    }),
    futures_stress_test:Object.freeze({
      required:futuresRequired,
      framework:FUTURES_PATH,
      horizons:Object.freeze([2030,2035,2040]),
      scenarios_are_not_forecasts:true,
      conditions:Object.freeze(['more_capable_ai','persistent_agents','original_authoriser_unavailable','self_modification','false_information','public_trust_loss'])
    }),
    ai_protocol_gate:Object.freeze({
      required_before_consequential_implementation:true,
      dimensions:AI_PROTOCOL_DIMENSIONS,
      fail_closed:true
    }),
    solution_design:Object.freeze({
      allowed_artifacts:Object.freeze(['policy','procedure','directive','code_change','training_module','research_proposal','scenario','risk_register','communication_plan','budget_concept','grant_concept_note','journal_paper','institutional_recommendation'])
    }),
    implementation:Object.freeze({
      requested:implementationRequested,
      allowed_only_within_approved_mandate:true,
      may_use_tools:true,
      version_control_required:true,
      regression_check_required:true,
      automatic_external_commitment:false,
      automatic_publication:false,
      automatic_doctrine_change:false,
      automatic_authority_expansion:false
    }),
    adversarial_review:Object.freeze({
      required:major||implementationRequested,
      questions:Object.freeze(['what_was_missed','misuse_path','human_gate_bypass','provenance_loss','future_fragility','dependency_failure'])
    }),
    verify:Object.freeze({
      required:true,
      checks:Object.freeze(['tests','sources','contradictions','mandate','human_gate','future_stress_test_when_required','provenance'])
    }),
    learn:Object.freeze({
      enabled:true,
      automatic_rule_mutation:false,
      automatic_doctrine_mutation:false,
      candidates:Object.freeze(['verified_lesson','new_test','new_risk_pattern','research_question','reusable_asset','directive_amendment_candidate','specialist_profile_proposal'])
    }),
    governance:Object.freeze({
      creates_authority:false,
      final_institutional_responsibility:'human',
      code_may_become_liquid_mandate_must_not:true,
      capability_does_not_create_authority:true
    }),
    release_status:'blocked_pending_mandatory_gates'
  });
}

export const __test={normalise,has,classifyProblem,classifyConsequence,selectProfiles,wpawsIdsForProfiles};

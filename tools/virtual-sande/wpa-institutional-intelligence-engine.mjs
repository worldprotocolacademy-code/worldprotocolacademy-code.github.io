// WPA Institutional Intelligence Engine (WIIE)
// Non-authority orchestration layer under the WPA Institutional Operating Protocol.
// It structures major institutional work, routes bounded specialist profiles,
// requires alternative options and foresight stress-testing where appropriate,
// and preserves AI PROTOCOL + Human Gate controls.

export const VERSION='wpa-institutional-intelligence-engine-1.2.0';
export const ENGINE_ID='WPA_WIIE_v1';
export const SPEC_PATH='/data/wpa-institutional-intelligence-engine.json';
export const OPERATING_PROTOCOL_PATH='/data/wpa-institutional-operating-protocol.json';
export const FUTURES_PATH='/data/wpa-futures-2040-framework.json';

export const OPERATING_CYCLE=Object.freeze([
  'intake','knowledge','system_map','diagnosis','specialist_routing','options',
  'futures_stress_test','ai_protocol_gate','solution_design','implementation',
  'adversarial_review','verify','learn'
]);

export const MISSION_PROFILES=Object.freeze({
  L0_LIGHTWEIGHT:Object.freeze({id:'L0_LIGHTWEIGHT',name:'Lightweight',specialist_profile_budget:2,system_map:'optional',options:'optional',futures:'no_unless_triggered',adversarial:'no_unless_triggered',implementation:'no_external_side_effect'}),
  L1_STANDARD:Object.freeze({id:'L1_STANDARD',name:'Standard',specialist_profile_budget:4,system_map:'light',options:'when_decision_exists',futures:'when_future_material',adversarial:'targeted',implementation:'bounded_reversible_only'}),
  L2_INSTITUTIONAL:Object.freeze({id:'L2_INSTITUTIONAL',name:'Institutional',specialist_profile_budget:6,system_map:'required',options:'three_required',futures:'required',adversarial:'required',implementation:'version_controlled_and_regression_tested'}),
  L3_CONSEQUENTIAL:Object.freeze({id:'L3_CONSEQUENTIAL',name:'Consequential',specialist_profile_budget:8,system_map:'required',options:'required_when_decisional',futures:'required_when_strategic_or_technology_related',adversarial:'required',implementation:'staged_with_rollback_when_practicable'}),
  L4_CONSTITUTIONAL:Object.freeze({id:'L4_CONSTITUTIONAL',name:'Constitutional / Doctrine',specialist_profile_budget:10,system_map:'required',options:'required',futures:'required',adversarial:'required',implementation:'advisory_only_until_hg4'})
});

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
  strategic_communication:['strategic communication','стратешк комуникац','public relations','односи со јавност','media relations','медиумски односи','public communication','јавна комуникац'],
  security:['security','безбед','risk','ризик','crisis','криз','cyber','сајбер','resilience','отпорност'],
  communicology:['communicology','комуниколог','communication system','комуникациски систем','meaning','семантик'],
  ai_governance:['ai governance','управување со ai','human gate','mandate','мандат','provenance','agent','агент','artificial intelligence','вештачка интелигенција'],
  legal_compliance:['law','legal','право','правен','compliance','усогласеност','regulation','регулатив','standard','стандард'],
  foresight:['foresight','futures','future','иднин','2030','2035','2040','scenario','сценари','horizon scan','emerging technolog','нова технолог'],
  research_evidence:['research','истраж','source','извор','evidence','доказ','journal','журнал','paper','труд','study','студи'],
  adversarial_verification:['audit','аудит','verify','провери','weakness','слабост','red team','adversarial','контрадикц','test','тест']
});

const MAJOR_SIGNALS=['strategy','стратег','institution','институц','architecture','архитект','policy','политика','directive','директив','programme','програм','system','систем','2040','major wpa','голем wpa','governance','управување'];
const MUTATION_VERBS=['update','ажурира','change','измени','modify','модифици'];
const MUTATION_OBJECTS=['code','код','module','модул','strategy','стратег','directive','директив','test','тест','documentation','документац','registry','регистар','architecture','архитект'];
const CREATE_VERBS=['add','додај','create','креира'];
const EXECUTABLE_OBJECTS=['code','код','module','модул','test','тест','registry','регистар','architecture','архитект'];
function detectsImplementationIntent(q){
  return has(q,['implement','имплементи'])||(has(q,MUTATION_VERBS)&&has(q,MUTATION_OBJECTS))||(has(q,CREATE_VERBS)&&has(q,EXECUTABLE_OBJECTS));
}

function selectMissionProfile({major,consequenceClass,implementationRequested,problemClass,q,strategicPromptId=null}){
  if(consequenceClass==='HG4')return MISSION_PROFILES.L4_CONSTITUTIONAL;
  if(consequenceClass==='HG3'||(consequenceClass==='HG2'&&implementationRequested))return MISSION_PROFILES.L3_CONSEQUENTIAL;
  if(major||strategicPromptId==='SP08'||problemClass==='foresight_and_institutional_futures')return MISSION_PROFILES.L2_INSTITUTIONAL;
  if(/^SP0[1-7]$/.test(String(strategicPromptId||'')))return MISSION_PROFILES.L1_STANDARD;
  if(consequenceClass==='HG2'||has(q,['research','истраж','analysis','анализа','recommendation','препорак','evidence','доказ','source','извор','trend','тренд']))return MISSION_PROFILES.L1_STANDARD;
  return MISSION_PROFILES.L0_LIGHTWEIGHT;
}

function buildEarlyExitPolicy({missionProfile,implementationRequested,consequenceClass,futuresRequired}){
  const allowed=missionProfile.id==='L0_LIGHTWEIGHT'||missionProfile.id==='L1_STANDARD';
  return Object.freeze({
    allowed,
    reason_required_if_used:true,
    forbidden:implementationRequested||['HG2','HG3','HG4'].includes(consequenceClass)||futuresRequired&&missionProfile.id!=='L1_STANDARD',
    conditions:Object.freeze(['objective_resolved','evidence_sufficient_for_consequence','no_material_contradiction','no_side_effect_requested','no_human_gate_escalation','no_material_future_uncertainty'])
  });
}

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
  if(detectsImplementationIntent(q))return'HG2';
  return'HG1';
}

function selectProfiles(q,{major=false,missionProfile=MISSION_PROFILES.L0_LIGHTWEIGHT}={}){
  const ids=[],reasons={};
  for(const [id,signals] of Object.entries(PROFILE_SIGNALS)){
    const hits=signals.filter(s=>q.includes(normalise(s).trim()));
    if(hits.length){ids.push(id);reasons[id]=['explicit_signal:'+hits.slice(0,3).join(',')];}
  }
  const deepProfile=['L2_INSTITUTIONAL','L3_CONSEQUENTIAL','L4_CONSTITUTIONAL'].includes(missionProfile.id);
  if(major||deepProfile){
    for(const id of ['research_evidence','adversarial_verification']){
      if(!ids.includes(id))ids.push(id);
      reasons[id]=[...(reasons[id]||[]),major?'major_mission':'deep_mission_assurance'];
    }
  }
  const priority=['protocol','diplomacy','security','strategic_communication','communicology','ai_governance','legal_compliance','foresight','research_evidence','adversarial_verification'];
  const selected=[...new Set(ids)].sort((a,b)=>priority.indexOf(a)-priority.indexOf(b));
  return {
    ids:selected,
    reasons:Object.fromEntries(selected.map(id=>[id,reasons[id]||['bounded_selection']])),
    target_budget:missionProfile.specialist_profile_budget||0,
    budget_exceeded_for_explicit_or_mandatory_scope:selected.length>(missionProfile.specialist_profile_budget||0)
  };
}

function wpawsIdsForProfiles(profileIds){
  return [...new Set(profileIds.flatMap(id=>SPECIALIST_PROFILES[id]?.wpaws_agent_ids||[]))].sort((a,b)=>a-b);
}

export function evaluateEarlyExit(plan,state={}){
  const policy=plan?.early_exit||{};
  const checks={
    objective_resolved:state.objectiveResolved===true,
    evidence_sufficient_for_consequence:state.evidenceSufficient===true,
    no_material_contradiction:state.materialContradiction!==true,
    no_side_effect_requested:plan?.implementation?.requested!==true,
    no_human_gate_escalation:plan?.intake?.human_gate_required!==true,
    no_material_future_uncertainty:state.materialFutureUncertainty!==true
  };
  const allowed=policy.allowed===true&&policy.forbidden!==true&&Object.values(checks).every(Boolean);
  return Object.freeze({
    allowed,
    checks:Object.freeze(checks),
    reason:allowed?(state.reason||'all_early_exit_conditions_satisfied'):'conditions_not_satisfied'
  });
}

export function buildRunRecord(plan,meta={}){
  return Object.freeze({
    run_id:String(meta.runId||'UNASSIGNED'),
    case_id:meta.caseId??null,
    started_at:String(meta.startedAt||'UNASSIGNED'),
    finished_at:meta.finishedAt??null,
    mission_profile:plan?.mission_profile?.id||'L0_LIGHTWEIGHT',
    problem_class:plan?.problem_class||'institutional_problem_solving',
    consequence_class:plan?.intake?.consequence_class||'HG1',
    objective:plan?.intake?.objective||null,
    routing_reasons:plan?.specialist_routing?.routing_reasons||{},
    specialist_profiles:Object.freeze((plan?.specialist_routing?.profiles||[]).map(x=>x.id)),
    wpaws_agent_ids:Object.freeze(meta.wpawsAgentIds||plan?.specialist_routing?.recommended_wpaws_agent_ids||[]),
    source_verification_state:meta.sourceVerificationState||'PENDING',
    data_classification:meta.dataClassification||'UNKNOWN',
    source_freshness_state:plan?.knowledge?.source_freshness_required?'REFRESH_REQUIRED':'NOT_APPLICABLE',
    specialist_disagreement:Object.freeze(meta.specialistDisagreement||[]),
    provider_or_tool_failures:Object.freeze(meta.providerOrToolFailures||[]),
    fallback_mode:meta.fallbackMode||'NONE',
    incident_state:meta.incidentState||'NONE',
    futures_stress_test_state:plan?.futures_stress_test?.required?'PENDING':'NOT_REQUIRED',
    ai_protocol_gate_state:'PENDING',
    human_gate_state:plan?.intake?.human_gate_required?'PENDING':'NOT_REQUIRED',
    implementation_state:plan?.implementation?.requested?'PLANNED':'NOT_REQUESTED',
    rollback_reference:meta.rollbackReference??null,
    adversarial_review_state:plan?.adversarial_review?.required?'PENDING':'NOT_REQUIRED',
    verification_state:'PENDING',
    early_exit_used:false,
    early_exit_reason:null,
    elapsed_ms:null,
    tool_calls:null,
    measured_cost:null,
    outcome_state:'UNKNOWN',
    correction_required:false,
    learning_candidates:Object.freeze([]),
    release_status:'BLOCKED'
  });
}

export function buildInstitutionalIntelligencePlan(message='',options={}){
  const q=normalise(message);
  const major=options.majorWpa===true||has(q,MAJOR_SIGNALS)||has(q,['persistent agent','persistent ai','persistent system','долготраен агент','перзистентен агент','six months','шест месеци','autonomous agent','автономен агент']);
  const implementationRequested=options.implementationRequested===true||detectsImplementationIntent(q);
  const timeSensitive=options.timeSensitive===true||has(q,['today','денес','latest','најнов','current','актуел','this week','оваа недела']);
  const problemClass=classifyProblem(q);
  const consequenceClass=classifyConsequence(q,options);
  const provisionalFuturesRequired=major||problemClass==='foresight_and_institutional_futures'||has(q,['future','иднин','2030','2035','2040','emerging technolog','нова технолог']);
  const strategicPromptId=options.strategicPromptId||null;
  const missionProfile=selectMissionProfile({major,consequenceClass,implementationRequested,problemClass,q,strategicPromptId});
  const routed=selectProfiles(q,{major,missionProfile});
  const profileIds=routed.ids;
  const futuresRequired=missionProfile.id==='L2_INSTITUTIONAL'||missionProfile.id==='L4_CONSTITUTIONAL'||(missionProfile.id==='L3_CONSEQUENTIAL'&&provisionalFuturesRequired)||provisionalFuturesRequired;
  const optionsRequired=['L2_INSTITUTIONAL','L4_CONSTITUTIONAL'].includes(missionProfile.id)||consequenceClass!=='HG1';
  const humanGateRequired=consequenceClass!=='HG1'||implementationRequested;
  const profiles=profileIds.map(id=>SPECIALIST_PROFILES[id]);
  const earlyExit=buildEarlyExitPolicy({missionProfile,implementationRequested,consequenceClass,futuresRequired});

  return Object.freeze({
    version:VERSION,
    engine_id:ENGINE_ID,
    identity:'WIIE is a non-authority institutional analysis and orchestration engine under the WPA Institutional Operating Protocol.',
    master_protocol:OPERATING_PROTOCOL_PATH,
    problem_class:problemClass,
    major,
    mission_profile:missionProfile,
    strategic_prompt_id:strategicPromptId,
    operating_cycle:OPERATING_CYCLE,
    intake:Object.freeze({
      objective:String(message||'').trim(),
      consequence_class:consequenceClass,
      human_gate_required:humanGateRequired
    }),
    knowledge:Object.freeze({
      corpus_first_when_applicable:true,
      time_sensitive:timeSensitive,
      source_freshness_required:timeSensitive,
      source_compliance_required_before_external_content_access:true,
      provenance_required:true,
      content_is_not_command:true,
      access_is_not_mandate:true
    }),
    system_map:Object.freeze({
      required:['L2_INSTITUTIONAL','L3_CONSEQUENTIAL','L4_CONSTITUTIONAL'].includes(missionProfile.id),
      mode:missionProfile.system_map,
      dimensions:Object.freeze(['people','roles','authority','processes','data','tools','communications','dependencies','risks'])
    }),
    diagnosis:Object.freeze({
      checks:Object.freeze(['gaps','duplication','contradictions','inefficiency','undefined_responsibility','unclear_mandate','technical_fragility','future_risk'])
    }),
    specialist_routing:Object.freeze({
      profiles:Object.freeze(profiles),
      routing_reasons:Object.freeze(routed.reasons),
      recommended_wpaws_agent_ids:Object.freeze(wpawsIdsForProfiles(profileIds)),
      specialist_profile_budget:missionProfile.specialist_profile_budget,
      budget_is_soft_target:true,
      budget_exceeded_for_explicit_or_mandatory_scope:routed.budget_exceeded_for_explicit_or_mandatory_scope,
      specialists_are_bounded:true,
      reuse_before_new_research:true,
      over_routing_is_efficiency_defect:true,
      specialist_consensus_is_not_institutional_will:true
    }),
    options:Object.freeze({
      required:optionsRequired,
      mode:missionProfile.options,
      defaults:Object.freeze(['conservative','balanced','transformative']),
      compare_on:Object.freeze(['benefits','costs','risks','dependencies','reversibility','institutional_consequences','human_authority_risk'])
    }),
    futures_stress_test:Object.freeze({
      required:futuresRequired,
      framework:FUTURES_PATH,
      horizons:Object.freeze([2030,2035,2040]),
      scenarios_are_not_forecasts:true,
      components:Object.freeze({observatory:'WPA Institutional Futures Observatory',expert_network:'WPA International Expert Network',action_cards:'/data/wpa-institutional-ai-action-card.schema.json',scenario_lab:'/wpa-scenario-film-lab.html',foresight_education:'Strategic Foresight for Protocol, Diplomacy and Institutional Leadership'}),
      convergence_scan:Object.freeze(['AI/AGI','robotics','synthetic_media','AR/VR','digital_identity','autonomous_systems','IoT_cloud_analytics','quantum_cybersecurity']),
      conditions:Object.freeze(['more_capable_ai','persistent_agents','original_authoriser_unavailable','self_modification','false_information','public_trust_loss'])
    }),
    ai_protocol_gate:Object.freeze({
      required_before_consequential_implementation:true,
      dimensions:AI_PROTOCOL_DIMENSIONS,
      fail_closed:true
    }),
    early_exit:earlyExit,
    observability:Object.freeze({
      run_record_schema:'/data/wpa-wiie-run-record.schema.json',
      trace_required:['L2_INSTITUTIONAL','L3_CONSEQUENTIAL','L4_CONSTITUTIONAL'].includes(missionProfile.id),
      excellence_framework:'/data/wpa-wiie-excellence-framework.json',
      evaluation_suite:'/data/wpa-wiie-evaluation-suite.json'
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
      staged_change_preferred:['L3_CONSEQUENTIAL','L4_CONSTITUTIONAL'].includes(missionProfile.id),
      rollback_plan_required:['L3_CONSEQUENTIAL','L4_CONSTITUTIONAL'].includes(missionProfile.id),
      pre_change_version_reference_required:implementationRequested,
      automatic_external_commitment:false,
      automatic_publication:false,
      automatic_doctrine_change:false,
      automatic_authority_expansion:false
    }),
    adversarial_review:Object.freeze({
      required:missionProfile.id!=='L0_LIGHTWEIGHT'&&(major||implementationRequested||consequenceClass!=='HG1'),
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
    assurance:Object.freeze({
      source_freshness_required:timeSensitive,
      preserve_material_specialist_disagreement:true,
      majority_vote_does_not_create_institutional_truth:true,
      graceful_degradation_on_provider_or_tool_failure:true,
      invented_completion_forbidden:true,
      privacy_data_minimisation:true,
      uncalibrated_numeric_confidence_forbidden:true,
      material_adverse_outcome_reopens_case:true
    }),
    effectiveness_efficiency:Object.freeze({
      north_star:'verified useful institutional outcome with minimal justified activation and no governance loss',
      baseline_status:'TO_BE_MEASURED',
      numerical_excellence_claim_allowed:false,
      metrics_framework:'/data/wpa-wiie-excellence-framework.json',
      speed_may_not_override_evidence_or_human_authority:true
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

export const __test={normalise,has,classifyProblem,classifyConsequence,selectMissionProfile,buildEarlyExitPolicy,selectProfiles,wpawsIdsForProfiles,detectsImplementationIntent};

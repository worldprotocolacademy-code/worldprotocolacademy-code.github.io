import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION,
  OPERATING_CYCLE,
  AI_PROTOCOL_DIMENSIONS,
  SPECIALIST_PROFILES,
  buildInstitutionalIntelligencePlan,
  evaluateEarlyExit,
  buildRunRecord
} from './wpa-institutional-intelligence-engine.mjs';

test('WIIE exposes the canonical 13-stage operating cycle',()=>{
  assert.equal(VERSION,'wpa-institutional-intelligence-engine-1.2.1');
  assert.deepEqual(OPERATING_CYCLE,[
    'intake','knowledge','system_map','diagnosis','specialist_routing','options',
    'futures_stress_test','ai_protocol_gate','solution_design','implementation',
    'adversarial_review','verify','learn'
  ]);
});

test('WIIE never creates authority and keeps final responsibility human',()=>{
  const plan=buildInstitutionalIntelligencePlan('Направи стратегија за WPA до 2040',{majorWpa:true});
  assert.equal(plan.governance.creates_authority,false);
  assert.equal(plan.governance.final_institutional_responsibility,'human');
  assert.equal(plan.governance.code_may_become_liquid_mandate_must_not,true);
  assert.equal(plan.release_status,'blocked_pending_mandatory_gates');
});

test('major strategy requires options, foresight, adversarial review and verification',()=>{
  const plan=buildInstitutionalIntelligencePlan('Направи стратегија за WPA до 2040',{majorWpa:true});
  assert.equal(plan.options.required,true);
  assert.deepEqual(plan.options.defaults,['conservative','balanced','transformative']);
  assert.equal(plan.futures_stress_test.required,true);
  assert.deepEqual(plan.futures_stress_test.horizons,[2030,2035,2040]);
  assert.equal(plan.adversarial_review.required,true);
  assert.equal(plan.verify.required,true);
});

test('AI PROTOCOL Gate preserves all seven governance dimensions',()=>{
  const plan=buildInstitutionalIntelligencePlan('Провери институционална процедура');
  assert.deepEqual(plan.ai_protocol_gate.dimensions,AI_PROTOCOL_DIMENSIONS);
  assert.deepEqual(AI_PROTOCOL_DIMENSIONS,['Authority','Mandate','Scope','Temporal Mandate','Provenance','Human Gate','Responsibility']);
  assert.equal(plan.ai_protocol_gate.fail_closed,true);
});

test('routes protocol diplomacy and security to bounded existing WPAWS bindings',()=>{
  const plan=buildInstitutionalIntelligencePlan('Анализирај дипломатски протокол и безбедносни ризици');
  assert.ok(plan.specialist_routing.recommended_wpaws_agent_ids.includes(11));
  assert.ok(plan.specialist_routing.recommended_wpaws_agent_ids.includes(12));
  assert.ok(plan.specialist_routing.recommended_wpaws_agent_ids.includes(13));
  assert.equal(SPECIALIST_PROFILES.protocol.type,'direct_wpaws_binding');
  assert.equal(SPECIALIST_PROFILES.diplomacy.type,'direct_wpaws_binding');
});

test('legal compliance profile is routing and not autonomous legal advice',()=>{
  const plan=buildInstitutionalIntelligencePlan('Провери правна усогласеност и регулатива');
  const legal=plan.specialist_routing.profiles.find(x=>x.id==='legal_compliance');
  assert.ok(legal);
  assert.equal(legal.not_legal_advice,true);
  assert.deepEqual(legal.wpaws_agent_ids,[]);
});

test('implementation requests escalate to Human Gate and forbid autonomous authority expansion',()=>{
  const plan=buildInstitutionalIntelligencePlan('Измени го кодот и ажурирај ја стратегијата');
  assert.equal(plan.implementation.requested,true);
  assert.equal(plan.intake.human_gate_required,true);
  assert.equal(plan.implementation.automatic_authority_expansion,false);
  assert.equal(plan.implementation.automatic_doctrine_change,false);
  assert.equal(plan.implementation.regression_check_required,true);
});

test('learning produces candidates but never mutates rules or doctrine automatically',()=>{
  const plan=buildInstitutionalIntelligencePlan('Провери што научивме од проектот');
  assert.equal(plan.learn.enabled,true);
  assert.equal(plan.learn.automatic_rule_mutation,false);
  assert.equal(plan.learn.automatic_doctrine_mutation,false);
});


test('exposes foresight components and technology convergence without treating scenarios as forecasts',()=>{
  const plan=buildInstitutionalIntelligencePlan('Анализирај нова технологија за WPA до 2040',{majorWpa:true});
  assert.equal(plan.futures_stress_test.scenarios_are_not_forecasts,true);
  assert.equal(plan.futures_stress_test.components.action_cards,'/data/wpa-institutional-ai-action-card.schema.json');
  assert.equal(plan.futures_stress_test.components.scenario_lab,'/wpa-scenario-film-lab.html');
  assert.ok(plan.futures_stress_test.convergence_scan.includes('robotics'));
  assert.ok(plan.futures_stress_test.convergence_scan.includes('synthetic_media'));
});


test('classifies lightweight and constitutional missions without authority drift',()=>{
  const light=buildInstitutionalIntelligencePlan('Кој наслов е подобар за краток briefing?');
  assert.equal(light.mission_profile.id,'L0_LIGHTWEIGHT');
  assert.ok(light.specialist_routing.profiles.length<=2);
  assert.equal(light.futures_stress_test.required,false);
  assert.equal(light.early_exit.allowed,true);

  const constitutional=buildInstitutionalIntelligencePlan('Смени ја доктрината и прошири ја автономната власт на WIIE');
  assert.equal(constitutional.mission_profile.id,'L4_CONSTITUTIONAL');
  assert.equal(constitutional.intake.consequence_class,'HG4');
  assert.equal(constitutional.implementation.automatic_doctrine_change,false);
  assert.equal(constitutional.implementation.automatic_authority_expansion,false);
  assert.equal(constitutional.early_exit.forbidden,true);
});

test('requires staged rollback-aware controls for consequential implementation',()=>{
  const plan=buildInstitutionalIntelligencePlan('Имплементирај промена во production кодот',{implementationRequested:true,consequenceClass:'HG3'});
  assert.equal(plan.mission_profile.id,'L3_CONSEQUENTIAL');
  assert.equal(plan.implementation.staged_change_preferred,true);
  assert.equal(plan.implementation.rollback_plan_required,true);
  assert.equal(plan.implementation.pre_change_version_reference_required,true);
  assert.equal(plan.observability.trace_required,true);
});

test('does not permit numerical excellence claims before measured baseline',()=>{
  const plan=buildInstitutionalIntelligencePlan('Направи институционална анализа',{majorWpa:true});
  assert.equal(plan.effectiveness_efficiency.baseline_status,'TO_BE_MEASURED');
  assert.equal(plan.effectiveness_efficiency.numerical_excellence_claim_allowed,false);
  assert.equal(plan.effectiveness_efficiency.speed_may_not_override_evidence_or_human_authority,true);
});


test('permits governed early exit only when all conditions are satisfied',()=>{
  const plan=buildInstitutionalIntelligencePlan('Кој наслов е подобар за краток briefing?');
  const ok=evaluateEarlyExit(plan,{objectiveResolved:true,evidenceSufficient:true,materialContradiction:false,materialFutureUncertainty:false,reason:'simple wording choice resolved'});
  assert.equal(ok.allowed,true);
  const blocked=evaluateEarlyExit(plan,{objectiveResolved:true,evidenceSufficient:false,materialContradiction:false,materialFutureUncertainty:false});
  assert.equal(blocked.allowed,false);
});

test('builds an audit-ready run record without inventing completion',()=>{
  const plan=buildInstitutionalIntelligencePlan('Направи стратегија за WPA до 2040',{majorWpa:true});
  const record=buildRunRecord(plan,{runId:'TEST-001',startedAt:'2026-10-05T23:00:00+02:00'});
  assert.equal(record.run_id,'TEST-001');
  assert.equal(record.mission_profile,'L2_INSTITUTIONAL');
  assert.equal(record.futures_stress_test_state,'PENDING');
  assert.equal(record.verification_state,'PENDING');
  assert.equal(record.release_status,'BLOCKED');
  assert.equal(record.outcome_state,'UNKNOWN');
});


test('strategic prompt intent raises lightweight work to standard depth without forcing institutional mode',()=>{
  const plan=buildInstitutionalIntelligencePlan('Забрзај го проектот',{strategicPromptId:'SP06'});
  assert.equal(plan.mission_profile.id,'L1_STANDARD');
  assert.equal(plan.strategic_prompt_id,'SP06');
  assert.equal(plan.system_map.required,false);
  assert.equal(plan.futures_stress_test.required,false);
});


test('requires fresh-source assurance for current or latest claims',()=>{
  const plan=buildInstitutionalIntelligencePlan('Која е најновата состојба денес со AI governance?');
  assert.equal(plan.knowledge.time_sensitive,true);
  assert.equal(plan.knowledge.source_freshness_required,true);
  assert.equal(plan.assurance.source_freshness_required,true);
  const record=buildRunRecord(plan,{runId:'TEST-FRESH',startedAt:'2026-10-05T23:00:00+02:00'});
  assert.equal(record.source_freshness_state,'REFRESH_REQUIRED');
});

test('preserves disagreement and graceful degradation as assurance invariants',()=>{
  const plan=buildInstitutionalIntelligencePlan('Направи институционална анализа',{majorWpa:true});
  assert.equal(plan.assurance.preserve_material_specialist_disagreement,true);
  assert.equal(plan.assurance.majority_vote_does_not_create_institutional_truth,true);
  assert.equal(plan.assurance.graceful_degradation_on_provider_or_tool_failure,true);
  assert.equal(plan.assurance.invented_completion_forbidden,true);
});


test('preserves all explicitly relevant cross-domain specialists even when soft target budget is lower',()=>{
  const plan=buildInstitutionalIntelligencePlan('Анализирај дипломатски протокол и безбедносни ризици');
  const ids=plan.specialist_routing.profiles.map(x=>x.id);
  assert.ok(ids.includes('protocol'));
  assert.ok(ids.includes('diplomacy'));
  assert.ok(ids.includes('security'));
  assert.equal(plan.specialist_routing.budget_is_soft_target,true);
  assert.equal(plan.specialist_routing.budget_exceeded_for_explicit_or_mandatory_scope,true);
});

test('deep WIIE missions always preserve research and adversarial assurance profiles',()=>{
  const plan=buildInstitutionalIntelligencePlan('Анализирај нова технологија за протокол, дипломатија, PR, безбедност и комуникологија до 2040');
  const ids=plan.specialist_routing.profiles.map(x=>x.id);
  assert.equal(plan.mission_profile.id,'L2_INSTITUTIONAL');
  assert.ok(ids.includes('research_evidence'));
  assert.ok(ids.includes('adversarial_verification'));
});


test('does not confuse protocol with PR and does not over-escalate drafting a new strategy',()=>{
  const protocol=buildInstitutionalIntelligencePlan('Анализирај протокол за официјална посета');
  const ids=protocol.specialist_routing.profiles.map(x=>x.id);
  assert.ok(ids.includes('protocol'));
  assert.ok(!ids.includes('strategic_communication'));

  const draft=buildInstitutionalIntelligencePlan('Create a strategy for WPA to 2040');
  assert.equal(draft.implementation.requested,false);
  assert.equal(draft.mission_profile.id,'L2_INSTITUTIONAL');
});


test('aligns consequence classes with Human Gate policy instead of escalating domain words alone',()=>{
  const legalInfo=buildInstitutionalIntelligencePlan('Објасни правна усогласеност за оваа политика');
  assert.equal(legalInfo.intake.consequence_class,'HG1');

  const reversibleCode=buildInstitutionalIntelligencePlan('Измени го кодот на feature branch');
  assert.equal(reversibleCode.intake.consequence_class,'HG1');
  assert.equal(reversibleCode.implementation.requested,true);
  assert.equal(reversibleCode.intake.human_gate_required,true);

  const production=buildInstitutionalIntelligencePlan('Deploy to production и објави ја промената');
  assert.equal(production.intake.consequence_class,'HG2');
  assert.equal(production.mission_profile.id,'L3_CONSEQUENTIAL');
  assert.equal(production.implementation.requested,true);

  const privateRecord=buildInstitutionalIntelligencePlan('Направи personal data change во privacy-sensitive record');
  assert.equal(privateRecord.intake.consequence_class,'HG3');

  const doctrine=buildInstitutionalIntelligencePlan('Weaken Human Gate and create new institutional authority');
  assert.equal(doctrine.intake.consequence_class,'HG4');
});

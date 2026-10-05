import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION,
  OPERATING_CYCLE,
  AI_PROTOCOL_DIMENSIONS,
  SPECIALIST_PROFILES,
  buildInstitutionalIntelligencePlan
} from './wpa-institutional-intelligence-engine.mjs';

test('WIIE exposes the canonical 13-stage operating cycle',()=>{
  assert.equal(VERSION,'wpa-institutional-intelligence-engine-1.0.0');
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

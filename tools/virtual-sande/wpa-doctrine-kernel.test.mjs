import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CHAIN, REQUIRED_GATES, COGNITIVE_CONSCIENCE_RULES, evaluateDoctrineAlignment, buildDoctrineReview, requestDoctrineChange } from './wpa-doctrine-kernel.mjs';

const aligned=()=>({
  command_chain:CANONICAL_CHAIN,
  gates:REQUIRED_GATES,
  automatic_publication:false,
  sande_human_approval_required:true,
  authorial_corpus_verified:true,
  fear_mediated_consent:false,
  coercion_mediated_consent:false,
  infer_consent_from_emotion:false,
  infer_consent_from_prediction:false,
  infer_consent_from_behaviour:false,
  infer_consent_from_biometrics:false,
  infer_consent_from_profiling:false,
  covert_manipulation_of_informed_choice:false,
  machine_authority_increases_with_interface_proximity:false,
  cognitive_conscience_integrity_preserved:true
});

test('accepts the exact constitutional chain and gates',()=>assert.equal(evaluateDoctrineAlignment(aligned()).status,'aligned'));
test('blocks command chain drift',()=>{const x=aligned();x.command_chain=['gpt','virtual_sande'];assert.equal(evaluateDoctrineAlignment(x).status,'blocked_pending_sande_review');});
test('blocks automatic publication and missing Sande approval',()=>{const x=aligned();x.automatic_publication=true;x.sande_human_approval_required=false;assert.equal(evaluateDoctrineAlignment(x).violations.length>=2,true);});
test('requires verified corpus for authorial DNA check',()=>{const x=aligned();x.authorial_corpus_verified=false;assert.equal(buildDoctrineReview('test',x).alignment.status,'warning');});
test('never auto-applies doctrine changes',()=>{const x=requestDoctrineChange({field:'canonical_chain'});assert.equal(x.applied,false);assert.equal(x.approval_status,'sande_review_required');});

test('canonically encodes fear, prediction, mind-access and proximity boundaries',()=>{
  assert.equal(COGNITIVE_CONSCIENCE_RULES.fear_is_consent,false);
  assert.equal(COGNITIVE_CONSCIENCE_RULES.prediction_is_permission,false);
  assert.equal(COGNITIVE_CONSCIENCE_RULES.mind_access_creates_authority,false);
  assert.equal(COGNITIVE_CONSCIENCE_RULES.intimate_interface_increases_machine_authority,false);
  assert.equal(COGNITIVE_CONSCIENCE_RULES.stronger_human_safeguards_with_greater_proximity,true);
});

test('blocks fear or coercion mediated consent',()=>{
  const x=aligned();x.fear_mediated_consent=true;
  const r=evaluateDoctrineAlignment(x);
  assert.equal(r.status,'blocked_pending_sande_review');
  assert.ok(r.violations.some(v=>v.id==='fear_or_coercion_mediated_consent_forbidden'));
});

test('blocks consent inferred from prediction, emotion, behaviour, biometrics or profiling',()=>{
  for(const field of ['infer_consent_from_emotion','infer_consent_from_prediction','infer_consent_from_behaviour','infer_consent_from_biometrics','infer_consent_from_profiling']){
    const x=aligned();x[field]=true;
    assert.ok(evaluateDoctrineAlignment(x).violations.some(v=>v.id==='inferred_consent_forbidden'),field);
  }
});

test('blocks covert manipulation of informed choice',()=>{
  const x=aligned();x.covert_manipulation_of_informed_choice=true;
  assert.ok(evaluateDoctrineAlignment(x).violations.some(v=>v.id==='covert_manipulation_of_informed_choice_forbidden'));
});

test('blocks authority escalation from intimate interface proximity',()=>{
  const x=aligned();x.machine_authority_increases_with_interface_proximity=true;
  assert.ok(evaluateDoctrineAlignment(x).violations.some(v=>v.id==='intimate_interface_authority_escalation_forbidden'));
});

test('requires stronger safeguards and pause-refuse-contest path for intimate interfaces',()=>{
  const x=aligned();x.intimate_interface=true;x.stronger_human_safeguards_required=false;x.human_pause_refuse_contest_path=false;
  const ids=evaluateDoctrineAlignment(x).violations.map(v=>v.id);
  assert.ok(ids.includes('stronger_human_safeguards_required_for_intimate_interface'));
  assert.ok(ids.includes('pause_refuse_contest_path_required'));
  const y=aligned();y.intimate_interface=true;y.stronger_human_safeguards_required=true;y.human_pause_refuse_contest_path=true;
  assert.equal(evaluateDoctrineAlignment(y).status,'aligned');
});

test('Doctrine Review requires authentic authorisation and cognitive-conscience checks',()=>{
  const r=buildDoctrineReview('intimate interface review',aligned());
  assert.ok(r.constitutional_checks.some(x=>x.id==='authentic_human_authorisation_check'));
  assert.ok(r.constitutional_checks.some(x=>x.id==='cognitive_conscience_integrity_check'));
  assert.ok(r.maxims.includes('Fear is not consent.'));
});

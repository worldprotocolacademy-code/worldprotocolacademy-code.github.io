import test from 'node:test';
import assert from 'node:assert/strict';
import { DIPLOMATIC_PROTOCOL_CORE, PILLARS, selectPillars, buildCouncilPlan, evaluateRelease } from './wpa-ai-council-phase3.mjs';

test('defines ten doctrine pillars and eighty seats',()=>{
  assert.equal(PILLARS.length,10);
  assert.equal(PILLARS.length*8,80);
});

test('defines diplomatic protocol as mandatory governing foundation',()=>{
  assert.equal(DIPLOMATIC_PROTOCOL_CORE.id,'diplomatic_protocol_core');
  assert.equal(DIPLOMATIC_PROTOCOL_CORE.mandatory,true);
});

test('routes a combined defence diplomatic and PR request',()=>{
  const ids=selectPillars('Подготви одбранбена дипломатија, воен протокол и PR план').map(x=>x.id);
  assert.ok(ids.includes('defence_diplomacy'));
  assert.ok(ids.includes('military_protocol'));
  assert.ok(ids.includes('public_relations'));
});

test('adds diplomatic protocol review to every council plan',()=>{
  const plan=buildCouncilPlan('Анализа на церемонијал и безбедност',{seatsPerPillar:3});
  assert.equal(plan.foundation_review.id,'diplomatic_protocol_core');
  assert.equal(plan.foundation_review.status,'required');
  assert.equal(plan.publication_allowed,false);
  assert.ok(plan.advisory_seats.every(x=>x.output_status==='advisory_only'));
});

test('blocks WPA output until diplomatic protocol and all gates pass',()=>{
  assert.equal(evaluateRelease({evidence_gate:'passed',safety_gate:'passed',sande_human_approval:'approved'}).wpa_output_allowed,false);
  assert.equal(evaluateRelease({diplomatic_protocol_core:'passed',evidence_gate:'passed',safety_gate:'passed',sande_human_approval:'approved'}).wpa_output_allowed,true);
});

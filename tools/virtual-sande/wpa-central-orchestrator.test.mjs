import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrchestrationPlan, WPAWS_AGENTS } from './wpa-central-orchestrator.mjs';

test('keeps Virtual Sande as central governed orchestrator',()=>{
  const plan=buildOrchestrationPlan('Подготви протоколарен briefing');
  assert.match(plan.identity,/Virtual Sande/);
  assert.equal(plan.diplomatic_protocol_core,'mandatory');
  assert.equal(plan.governance.human_review_required,true);
  assert.equal(plan.governance.no_automatic_publication,true);
});

test('uses selective routing for ordinary work',()=>{
  const plan=buildOrchestrationPlan('Анализирај дипломатска посета и подготви briefing');
  assert.equal(plan.mode,'selective');
  assert.ok(plan.wpaws_agents.length<17);
  assert.ok(plan.wpaws_agents.some(a=>a.id===12));
  assert.ok(plan.connected_outputs.some(x=>x.id==='premium_briefings'));
});

test('activates all 17 agents and all 80 council seats for comprehensive research',()=>{
  const plan=buildOrchestrationPlan('Пронајди ги сите книги за десет области и направи сеопфатна монографска анализа');
  assert.equal(plan.mode,'comprehensive');
  assert.equal(plan.wpaws_agents.length,17);
  assert.equal(WPAWS_AGENTS.length,17);
  assert.equal(plan.council.advisory_seats.length,80);
  assert.ok(plan.connected_outputs.some(x=>x.id==='academic_search'));
});

test('blocks output until mandatory gates and human approval',()=>{
  const plan=buildOrchestrationPlan('Објави автоматски');
  assert.equal(plan.release_status,'blocked_pending_mandatory_gates');
  assert.equal(plan.governance.no_automatic_publication,true);
});

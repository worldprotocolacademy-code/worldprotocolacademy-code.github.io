import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrchestrationPlan, WPAWS_AGENTS, COMMAND_HIERARCHY } from './wpa-central-orchestrator.mjs';

test('keeps Sande as supreme human authority',()=>{
  assert.equal(COMMAND_HIERARCHY.supreme_human_authority.id,'sande_smiljanov');
  assert.equal(COMMAND_HIERARCHY.supreme_human_authority.can_authorise_official_wpa_action,true);
});

test('defines Virtual Sande and Claude as dual proactive strategic core',()=>{
  assert.equal(COMMAND_HIERARCHY.strategic_core.length,2);
  assert.equal(COMMAND_HIERARCHY.strategic_core[0].id,'virtual_sande');
  assert.equal(COMMAND_HIERARCHY.strategic_core[1].id,'claude');
  assert.equal(COMMAND_HIERARCHY.strategic_core[1].connection_mode,'adapter_unconfigured');
});

test('uses selective routing for ordinary work',()=>{
  const plan=buildOrchestrationPlan('Анализирај дипломатска посета и подготви briefing');
  assert.equal(plan.mode,'selective');
  assert.ok(plan.wpaws_agents.length<17);
  assert.ok(plan.wpaws_agents.some(a=>a.id===12));
  assert.ok(plan.wpaws_agents.every(a=>a.command_level==='executive'));
  assert.equal(plan.council.command_level,'tactical_operational');
  assert.ok(plan.connected_outputs.some(x=>x.id==='premium_briefings'));
});

test('activates all 17 executive agents and all 80 tactical agents for comprehensive research',()=>{
  const plan=buildOrchestrationPlan('Пронајди ги сите книги за десет области и направи сеопфатна монографска анализа');
  assert.equal(plan.mode,'comprehensive');
  assert.equal(plan.wpaws_agents.length,17);
  assert.equal(WPAWS_AGENTS.length,17);
  assert.equal(plan.council.advisory_seats.length,80);
  assert.equal(plan.council.activation_policy,'only_after_human_or_strategic_core_directive');
  assert.ok(plan.connected_outputs.some(x=>x.id==='academic_search'));
});

test('blocks output until mandatory gates and human approval',()=>{
  const plan=buildOrchestrationPlan('Објави автоматски');
  assert.equal(plan.release_status,'blocked_pending_mandatory_gates');
  assert.equal(plan.governance.no_automatic_publication,true);
  assert.equal(plan.governance.claude_live_connection,false);
  assert.equal(plan.command_chain.at(-2),'sande_human_approval');
});
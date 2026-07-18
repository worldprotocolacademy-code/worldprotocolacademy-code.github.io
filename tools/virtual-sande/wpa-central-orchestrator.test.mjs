import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrchestrationPlan, WPAWS_AGENTS, COMMAND_HIERARCHY, PERFORMANCE_DIRECTIVE } from './wpa-central-orchestrator.mjs';

test('keeps Sande as supreme human authority',()=>{
  assert.equal(COMMAND_HIERARCHY.supreme_human_authority.id,'sande_smiljanov');
  assert.equal(COMMAND_HIERARCHY.supreme_human_authority.can_authorise_official_wpa_action,true);
});

test('defines GPT and Claude before Virtual Sande orchestrator',()=>{
  assert.equal(COMMAND_HIERARCHY.strategic_core.length,2);
  assert.equal(COMMAND_HIERARCHY.strategic_core[0].id,'gpt');
  assert.equal(COMMAND_HIERARCHY.strategic_core[1].id,'claude');
  assert.equal(COMMAND_HIERARCHY.orchestrator.id,'virtual_sande');
  assert.equal(COMMAND_HIERARCHY.strategic_core[1].connection_mode,'adapter_unconfigured');
});

test('uses selective routing and fast mission target for ordinary work',()=>{
  const plan=buildOrchestrationPlan('Анализирај дипломатска посета и подготви briefing');
  assert.equal(plan.mode,'selective');
  assert.equal(plan.mission_class,'fast_mission');
  assert.equal(plan.performance.target_seconds,60);
  assert.ok(plan.wpaws_agents.length<17);
  assert.ok(plan.wpaws_agents.some(a=>a.id===12));
  assert.ok(plan.wpaws_agents.every(a=>a.command_level==='executive'));
  assert.equal(plan.council.command_level,'tactical_operational');
});

test('uses advanced mission target for multi-source review',()=>{
  const plan=buildOrchestrationPlan('Направи споредба на повеќе извори со независна проверка');
  assert.equal(plan.mission_class,'advanced_mission');
  assert.equal(plan.performance.target_seconds,300);
});

test('activates all 17 executive agents and all 80 tactical agents for full council work',()=>{
  const plan=buildOrchestrationPlan('Пронајди ги сите книги за десет области и направи сеопфатна монографска анализа');
  assert.equal(plan.mode,'comprehensive');
  assert.equal(plan.mission_class,'full_council_mission');
  assert.equal(plan.performance.target_seconds,900);
  assert.equal(plan.wpaws_agents.length,17);
  assert.equal(WPAWS_AGENTS.length,17);
  assert.equal(plan.council.advisory_seats.length,80);
  assert.equal(plan.council.activation_policy,'only_after_human_or_approved_strategic_directive');
});

test('moves very large verification work beyond artificial deadline',()=>{
  const plan=buildOrchestrationPlan('Провери илјадници цитати и направи целосна автентикација');
  assert.equal(plan.mission_class,'extended_verification');
  assert.equal(plan.performance.target_seconds,null);
  assert.equal(plan.performance.accuracy_over_deadline,true);
  assert.equal(plan.performance.provisional_if_incomplete,true);
});

test('preserves exact canonical command order',()=>{
  const plan=buildOrchestrationPlan('Подготви WPA анализа');
  assert.deepEqual(plan.command_chain.slice(0,5),[
    'sande_smiljanov',
    'gpt_and_claude_strategic_core',
    'virtual_sande_orchestrator',
    'wpaws_17_executive_agents',
    'council_80_tactical_operational_agents'
  ]);
  assert.match(plan.canonical_chain,/Sande Smiljanov -> GPT \+ Claude -> Virtual Sande orchestrator -> 17 executive agents -> 80 tactical-operational agents/);
});

test('makes speed a target and never a substitute for accuracy',()=>{
  assert.equal(PERFORMANCE_DIRECTIVE.accuracy_over_deadline,true);
  assert.equal(PERFORMANCE_DIRECTIVE.parallel_by_default,true);
  const plan=buildOrchestrationPlan('Објави автоматски');
  assert.equal(plan.performance.target_is_guarantee,false);
  assert.equal(plan.governance.no_automatic_publication,true);
  assert.equal(plan.governance.accuracy_must_not_be_sacrificed_for_speed,true);
  assert.equal(plan.release_status,'blocked_pending_mandatory_gates');
});

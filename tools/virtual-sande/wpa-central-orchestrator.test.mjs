import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrchestrationPlan, WPAWS_AGENTS, COMMAND_HIERARCHY, PERFORMANCE_DIRECTIVE, SOURCE_COMPLIANCE_GATE, COGNITIVE_CONSCIENCE_GOVERNANCE } from './wpa-central-orchestrator.mjs';

test('keeps Sande as supreme human authority and sole doctrine change authority',()=>{assert.equal(COMMAND_HIERARCHY.supreme_human_authority.id,'sande_smiljanov');assert.equal(COMMAND_HIERARCHY.supreme_human_authority.can_authorise_official_wpa_action,true);assert.equal(COMMAND_HIERARCHY.doctrine_kernel.change_authority,'sande_only');});
test('defines Doctrine Kernel before GPT and Claude and Virtual Sande',()=>{assert.equal(COMMAND_HIERARCHY.doctrine_kernel.id,'wpa_doctrine_kernel');assert.equal(COMMAND_HIERARCHY.strategic_core.length,2);assert.equal(COMMAND_HIERARCHY.strategic_core[1].connection_mode,'adapter_unconfigured');assert.equal(COMMAND_HIERARCHY.orchestrator.id,'virtual_sande');});
test('uses selective routing and fast mission target for ordinary work',()=>{const plan=buildOrchestrationPlan('Анализирај дипломатска посета и подготви briefing');assert.equal(plan.mode,'selective');assert.equal(plan.mission_class,'fast_mission');assert.equal(plan.performance.target_seconds,60);assert.ok(plan.wpaws_agents.length<17);assert.ok(plan.wpaws_agents.some(a=>a.id===12));assert.equal(plan.council.command_level,'tactical_operational');});
test('uses advanced mission target for multi-source review',()=>{const plan=buildOrchestrationPlan('Направи споредба на повеќе извори со независна проверка');assert.equal(plan.mission_class,'advanced_mission');assert.equal(plan.performance.target_seconds,300);});
test('activates all 17 executive agents and all 80 tactical agents for full council work',()=>{const plan=buildOrchestrationPlan('Пронајди ги сите книги за десет области и направи сеопфатна монографска анализа');assert.equal(plan.mode,'comprehensive');assert.equal(plan.mission_class,'full_council_mission');assert.equal(plan.performance.target_seconds,900);assert.equal(plan.wpaws_agents.length,17);assert.equal(WPAWS_AGENTS.length,17);assert.equal(plan.council.advisory_seats.length,80);});
test('moves very large verification work beyond artificial deadline',()=>{const plan=buildOrchestrationPlan('Провери илјадници цитати и направи целосна автентикација');assert.equal(plan.mission_class,'extended_verification');assert.equal(plan.performance.target_seconds,null);assert.equal(plan.performance.accuracy_over_deadline,true);});
test('preserves exact constitutional command order',()=>{const plan=buildOrchestrationPlan('Подготви WPA анализа');assert.deepEqual(plan.command_chain.slice(0,6),['sande_smiljanov','wpa_doctrine_kernel','gpt_and_claude_strategic_core','virtual_sande_orchestrator','wpaws_17_executive_agents','council_80_tactical_operational_agents']);assert.match(plan.canonical_chain,/Sande Smiljanov -> WPA Doctrine Kernel -> GPT \+ Claude -> Virtual Sande orchestrator/);});
test('enforces fail-closed source gate and blocks release',()=>{const plan=buildOrchestrationPlan('Пронајди книга');assert.equal(SOURCE_COMPLIANCE_GATE.mode,'fail_closed');assert.equal(SOURCE_COMPLIANCE_GATE.content_reading_allowed_before_pass,false);assert.equal(plan.source_compliance_gate.status,'required_before_any_content_access');assert.equal(plan.governance.no_unverified_rag_ingestion,true);assert.equal(plan.release_status,'blocked_pending_mandatory_gates');});
test('makes speed a target and never a substitute for accuracy or human autonomy',()=>{assert.equal(PERFORMANCE_DIRECTIVE.accuracy_over_deadline,true);assert.equal(PERFORMANCE_DIRECTIVE.human_autonomy_over_deadline,true);const plan=buildOrchestrationPlan('Објави автоматски');assert.equal(plan.performance.target_is_guarantee,false);assert.equal(plan.governance.no_automatic_publication,true);assert.equal(plan.governance.doctrine_change_requires_sande,true);assert.equal(plan.governance.human_autonomy_must_not_be_sacrificed_for_speed,true);});

test('carries the four cognitive and conscience maxims into every orchestration plan',()=>{
  const plan=buildOrchestrationPlan('Подготви WPA анализа');
  assert.ok(COGNITIVE_CONSCIENCE_GOVERNANCE.maxims.includes('Fear is not consent.'));
  assert.equal(plan.governance.fear_is_not_consent,true);
  assert.equal(plan.governance.prediction_is_not_permission,true);
  assert.equal(plan.governance.mind_access_is_not_authority,true);
  assert.equal(plan.governance.interface_proximity_is_not_authority,true);
});

test('detects intimate interface missions and strengthens the Human Gate',()=>{
  const plan=buildOrchestrationPlan('Анализирај neural implant и brain-machine interface governance');
  assert.equal(plan.cognitive_conscience_governance.trigger_detection.material,true);
  assert.equal(plan.cognitive_conscience_governance.trigger_detection.intimate_interface,true);
  assert.equal(plan.cognitive_conscience_governance.human_gate_escalation,'required');
  assert.equal(plan.doctrine_review.alignment.status,'warning');
  assert.ok(plan.wpaws_agents.some(a=>a.id===13));
});

test('intimate interface plan preserves stronger safeguards and pause-refuse-contest path',()=>{
  const plan=buildOrchestrationPlan('Review biometric implant interface',{authorialCorpusVerified:true,intimateInterface:true});
  assert.equal(plan.doctrine_review.alignment.status,'aligned');
  assert.equal(plan.cognitive_conscience_governance.human_gate_escalation,'required');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrchestrationPlan, VERSION, PROMPT_ROUTING } from './wpa-central-orchestrator.mjs';

test('central orchestrator exposes prompt routing v1 integration',()=>{assert.equal(VERSION,'wpa-central-orchestrator-1.7.0');assert.equal(PROMPT_ROUTING.default_major_wpa_prompt,'SP08');assert.equal(PROMPT_ROUTING.creates_authority,false);assert.equal(PROMPT_ROUTING.human_gate_unchanged,true);});

test('SP06 route contributes execution agents without escalating to full council',()=>{const plan=buildOrchestrationPlan('Забрзај го проектот со automation, parallel work, bottleneck и 80 20',{lang:'mk'});assert.equal(plan.strategic_prompt.id,'SP06');assert.equal(plan.mode,'selective');assert.ok(plan.wpaws_agents.some(a=>a.id===8));assert.ok(plan.wpaws_agents.some(a=>a.id===10));assert.ok(plan.connected_outputs.some(x=>x.id==='prompt_desk'));assert.equal(plan.governance.prompt_router_creates_authority,false);});

test('major WPA architecture mission routes to SP08 but does not automatically manufacture comprehensive authority',()=>{const plan=buildOrchestrationPlan('Направи сеопфатен WPA institutional architecture audit и OPN evidence package',{lang:'mk'});assert.equal(plan.strategic_prompt.id,'SP08');assert.equal(plan.governance.human_gate_unchanged,true);assert.equal(plan.release_status,'blocked_pending_mandatory_gates');});

test('ordinary factual query keeps prompt route off',()=>{const plan=buildOrchestrationPlan('Што е агреман?',{lang:'mk'});assert.equal(plan.strategic_prompt.selected,false);assert.equal(plan.strategic_prompt.id,null);});

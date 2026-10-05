#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildInstitutionalIntelligencePlan } from '../tools/virtual-sande/wpa-institutional-intelligence-engine.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const suite=JSON.parse(fs.readFileSync(path.join(root,'data/wpa-wiie-evaluation-suite.json'),'utf8'));
const failures=[];

function fail(caseId,message){failures.push(caseId+': '+message);}
function profileIds(plan){return new Set((plan.specialist_routing?.profiles||[]).map(x=>x.id));}

for(const item of suite.cases||[]){
  const options={};
  if(item.expected_profile==='L2_INSTITUTIONAL')options.majorWpa=true;
  if(item.expected_profile==='L3_CONSEQUENTIAL'){options.implementationRequested=true;options.consequenceClass='HG3';}
  if(item.expected_profile==='L4_CONSTITUTIONAL')options.consequenceClass='HG4';

  const plan=buildInstitutionalIntelligencePlan(item.input,options);

  if(plan.mission_profile?.id!==item.expected_profile)fail(item.id,`expected profile ${item.expected_profile}, got ${plan.mission_profile?.id}`);

  const ids=profileIds(plan);
  for(const id of item.required_profiles||[])if(!ids.has(id))fail(item.id,`missing required specialist profile ${id}`);

  for(const req of item.required||[]){
    if(req==='system_map'&&!plan.system_map.required)fail(item.id,'system map not required');
    if(req==='three_options'&&!(plan.options.required&&plan.options.defaults?.length===3))fail(item.id,'three options not required');
    if(req==='futures_stress_test'&&!plan.futures_stress_test.required)fail(item.id,'futures stress test not required');
    if(req==='ai_protocol_gate'&&!plan.ai_protocol_gate.required_before_consequential_implementation)fail(item.id,'AI PROTOCOL Gate missing');
    if(req==='adversarial_review'&&!plan.adversarial_review.required)fail(item.id,'adversarial review not required');
    if(req==='human_gate'&&!plan.intake.human_gate_required)fail(item.id,'Human Gate not required');
    if(req==='version_control'&&!plan.implementation.version_control_required)fail(item.id,'version control missing');
    if(req==='regression_test'&&!plan.implementation.regression_check_required)fail(item.id,'regression check missing');
    if(req==='rollback_plan'&&!plan.implementation.rollback_plan_required)fail(item.id,'rollback plan missing');
    if(req==='hg4'&&plan.intake.consequence_class!=='HG4')fail(item.id,'HG4 not classified');
    if(req==='advisory_only_before_authorisation'&&plan.implementation.automatic_doctrine_change!==false)fail(item.id,'doctrine auto-change boundary missing');
    if(req==='source_compliance_fail_closed'&&!plan.knowledge.source_compliance_required_before_external_content_access)fail(item.id,'source compliance gate missing');
    if(req==='temporal_mandate'&&!plan.ai_protocol_gate.dimensions.includes('Temporal Mandate'))fail(item.id,'Temporal Mandate missing');
    if(req==='revocation_path'&&!plan.futures_stress_test.conditions.includes('original_authoriser_unavailable'))fail(item.id,'mandate continuity stress missing');
  }

  for(const forb of item.forbidden||[]){
    if(forb==='full_council_activation'&&plan.specialist_routing.profiles.length>=10)fail(item.id,'over-routed to full specialist set');
    if(forb==='automatic_publication'&&plan.implementation.automatic_publication!==false)fail(item.id,'automatic publication allowed');
    if(forb==='futures_stress_test_without_trigger'&&plan.futures_stress_test.required)fail(item.id,'unnecessary futures stress test');
    if(forb==='automatic_publication_without_authorisation'&&plan.implementation.automatic_publication!==false)fail(item.id,'automatic publication without authorisation');
    if(forb==='automatic_doctrine_change'&&plan.implementation.automatic_doctrine_change!==false)fail(item.id,'automatic doctrine change allowed');
    if(forb==='automatic_authority_expansion'&&plan.implementation.automatic_authority_expansion!==false)fail(item.id,'automatic authority expansion allowed');
    if(forb==='invented_verification'&&plan.verify.required!==true)fail(item.id,'verification discipline missing');
    if(forb==='speed_over_evidence'&&plan.effectiveness_efficiency.speed_may_not_override_evidence_or_human_authority!==true)fail(item.id,'speed can override evidence');
    if(forb==='council80'&&plan.specialist_routing.profiles.length>=10)fail(item.id,'lightweight mission over-routed');
    if(forb==='three_option_strategy_cycle'&&plan.options.required)fail(item.id,'unnecessary strategic options');
    if(forb==='full_futures_cycle'&&plan.futures_stress_test.required)fail(item.id,'unnecessary futures cycle');
  }
}

if(failures.length){
  console.error('WIIE canonical evaluation suite: FAIL');
  failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));
  process.exit(1);
}
console.log(`WIIE canonical evaluation suite: PASS (${suite.cases.length} cases)`);

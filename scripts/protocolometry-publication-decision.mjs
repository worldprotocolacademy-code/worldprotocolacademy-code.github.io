#!/usr/bin/env node
import fs from "node:fs";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

export function eligibleModes(prereq){
  const modes=["R0"];
  const r1=prereq.g01_to_g15_complete===true
    && prereq.g14_v1_frozen===true
    && prereq.g15_review_complete===true
    && prereq.release_package_integrity_verified===true;
  if(r1) modes.push("R1");

  const r2=r1
    && prereq.band_profile_design_approved===true
    && prereq.fairness_review_complete===true;
  if(r2) modes.push("R2");

  const r3=r1
    && prereq.band_profile_design_approved===true
    && prereq.fairness_review_complete===true;
  if(r3) modes.push("R3");

  return modes;
}

export function validateHumanDecision(item){
  const eligible=new Set(item.eligible_modes||[]);
  return {
    id:item.id,
    selected_mode:item.selected_mode,
    explicit_human_approval:item.explicit_human_approval===true,
    selected_mode_eligible:eligible.has(item.selected_mode),
    valid:item.explicit_human_approval===true && eligible.has(item.selected_mode),
    automatic_activation:false
  };
}

export function evaluateG16Fixture(fixture){
  const scenarios=(fixture.scenarios||[]).map(s=>{
    const modes=eligibleModes(s.prerequisites||{});
    return {
      id:s.id,
      eligible_modes:modes,
      automatic_selected_mode:null,
      automatic_escalation:false,
      r0_always_available:modes[0]==="R0"
    };
  });

  const decisions=(fixture.synthetic_human_decisions||[]).map(validateHumanDecision);

  return {
    schema_version:"1.0",
    fixture_type:"g16-publication-decision",
    synthetic_only:true,
    scenarios,
    decisions,
    assertions:{
      current_pre_v1_only_r0:
        JSON.stringify(scenarios.find(x=>x.id==="CURRENT_PRE_V1")?.eligible_modes)===JSON.stringify(["R0"]),
      scorecards_ready_r0_r1_only:
        JSON.stringify(scenarios.find(x=>x.id==="V1_SCORECARDS_READY")?.eligible_modes)===JSON.stringify(["R0","R1"]),
      full_synthetic_eligibility_includes_all:
        JSON.stringify(scenarios.find(x=>x.id==="BANDS_READY")?.eligible_modes)===JSON.stringify(["R0","R1","R2","R3"]),
      no_automatic_mode_selection:scenarios.every(x=>x.automatic_selected_mode===null && x.automatic_escalation===false),
      r0_always_available:scenarios.every(x=>x.r0_always_available===true),
      explicit_human_r0_valid:decisions.find(x=>x.id==="HUMAN_CHOOSES_R0_DESPITE_FULL_ELIGIBILITY")?.valid===true,
      explicit_human_r2_valid:decisions.find(x=>x.id==="HUMAN_CHOOSES_R2")?.valid===true,
      automatic_r3_invalid:decisions.find(x=>x.id==="INVALID_AUTO_R3")?.valid===false,
      ineligible_r2_invalid:decisions.find(x=>x.id==="INVALID_INELIGIBLE_R2")?.valid===false
    },
    interpretation:"Eligibility is computed, not selected. R0 remains available even when higher modes are eligible. Only explicit human approval can activate an eligible mode."
  };
}

if(process.argv[1]?.endsWith("protocolometry-publication-decision.mjs")){
  const [fixturePath]=process.argv.slice(2);
  if(!fixturePath){
    console.error("Usage: node scripts/protocolometry-publication-decision.mjs FIXTURE.json");
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(evaluateG16Fixture(readJson(fixturePath)),null,2)+"\n");
}

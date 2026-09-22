#!/usr/bin/env node
import fs from "node:fs";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

function assignmentDecision(item,aabStatus){
  const r=item.reviewer||{};
  const g=item.governance||{};
  let eligible=true, block=null;
  if(!g.authorised){
    eligible=false; block="REVIEW_ROUTE_NOT_AUTHORISED";
  }else if(item.review_route==="AAB" && (aabStatus!=="FORMALLY_CONSTITUTED" || g.aab_formally_constituted!==true)){
    eligible=false; block="AAB_NOT_FORMALLY_CONSTITUTED";
  }else if(r.material_conflict===true){
    eligible=false; block="MATERIAL_CONFLICT_REQUIRES_RECUSAL";
  }else if(!(r.written_acceptance===true && r.coi_declaration_completed===true && r.scope_accepted===true)){
    eligible=false; block="REVIEWER_ACCEPTANCE_OR_COI_INCOMPLETE";
  }
  return {
    id:item.id,
    review_route:item.review_route,
    eligible_for_assignment:eligible,
    block_reason:block,
    recusal_required:r.material_conflict===true,
    reviewer_appointment_created:false,
    review_completed:false
  };
}

function evaluateRecord(record){
  const findingIds=new Set((record.findings||[]).map(x=>x.finding_id));
  const responseIds=new Set((record.wpa_response||[]).map(x=>x.finding_id));
  const material=(record.findings||[]).filter(x=>["MINOR","MAJOR","CRITICAL"].includes(x.severity));
  const materialResponsesComplete=material.every(x=>responseIds.has(x.finding_id));
  const noOrphanResponses=[...responseIds].every(id=>findingIds.has(id));
  const followupClosed=record.follow_up?.required===false || record.follow_up?.completed===true;
  const reviewerEligible=
    record.eligibility?.authorised===true &&
    record.eligibility?.material_conflict===false &&
    record.eligibility?.recusal_required===false &&
    record.eligibility?.eligible_for_assignment===true &&
    record.reviewer?.written_acceptance===true &&
    record.reviewer?.coi_declaration_completed===true &&
    record.reviewer?.scope_accepted===true;
  const recordStructurallyComplete=
    reviewerEligible &&
    Array.isArray(record.scope) && record.scope.length>0 &&
    Array.isArray(record.findings) &&
    Array.isArray(record.wpa_response) &&
    materialResponsesComplete &&
    noOrphanResponses &&
    typeof record.reviewer_conclusion==="string" &&
    record.public_claim_boundary==="INDEPENDENT_METHODOLOGICAL_REVIEW_NOT_PEER_REVIEW_ACCREDITATION_RECOGNITION_OR_ENDORSEMENT" &&
    record.final_freeze_authority===false;

  return {
    review_id:record.review_id,
    reviewer_eligible:reviewerEligible,
    material_findings_count:material.length,
    response_count:(record.wpa_response||[]).length,
    material_responses_complete:materialResponsesComplete,
    no_orphan_responses:noOrphanResponses,
    follow_up_required:record.follow_up?.required===true,
    follow_up_completed:record.follow_up?.completed===true,
    follow_up_closed:followupClosed,
    structurally_complete:recordStructurallyComplete,
    review_completed:recordStructurallyComplete && followupClosed,
    g15_passed:false,
    automatic_g14_freeze:false,
    automatic_g16_release:false
  };
}

export function evaluateG15Fixture(fixture){
  const assignments=(fixture.cases||[]).map(x=>assignmentDecision(x,fixture.aab_status));
  const record=evaluateRecord(fixture.synthetic_review_record||{});
  return {
    schema_version:"1.0",
    fixture_type:"g15-review-governance",
    synthetic_only:true,
    assignments,
    assignment_metrics:{
      case_count:assignments.length,
      eligible_assignments:assignments.filter(x=>x.eligible_for_assignment).length,
      blocked_assignments:assignments.filter(x=>!x.eligible_for_assignment).length,
      recusal_required_count:assignments.filter(x=>x.recusal_required).length
    },
    synthetic_review_record:record,
    assertions:{
      aab_route_blocked_while_in_formation:assignments.find(x=>x.id==="G15-AAB-BLOCKED")?.block_reason==="AAB_NOT_FORMALLY_CONSTITUTED",
      authorised_external_route_can_be_eligible:assignments.find(x=>x.id==="G15-EXT-ELIGIBLE")?.eligible_for_assignment===true,
      material_conflict_blocks_assignment:assignments.find(x=>x.id==="G15-EXT-COI-BLOCKED")?.block_reason==="MATERIAL_CONFLICT_REQUIRES_RECUSAL",
      incomplete_acceptance_or_coi_blocks_assignment:assignments.find(x=>x.id==="G15-EXT-INCOMPLETE")?.block_reason==="REVIEWER_ACCEPTANCE_OR_COI_INCOMPLETE",
      material_findings_have_responses:record.material_responses_complete===true,
      open_follow_up_prevents_completion:record.follow_up_required===true && record.follow_up_completed===false && record.review_completed===false,
      no_automatic_freeze_or_release:record.automatic_g14_freeze===false && record.automatic_g16_release===false
    },
    interpretation:"Synthetic independent-review governance preflight only. Eligibility, findings and response completeness can be checked mechanically; reviewer judgment, follow-up closure and the G15 decision remain human-governed."
  };
}

if(process.argv[1]?.endsWith("protocolometry-independent-review.mjs")){
  const [fixturePath]=process.argv.slice(2);
  if(!fixturePath){
    console.error("Usage: node scripts/protocolometry-independent-review.mjs FIXTURE.json");
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(evaluateG15Fixture(readJson(fixturePath)),null,2)+"\n");
}

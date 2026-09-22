#!/usr/bin/env node
import fs from "node:fs";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

export function evaluateCorrectionCycle(fixture){
  const before=fixture.before||{}, after=fixture.after||{};
  const req=fixture.request||{}, review=fixture.review||{};
  const scoreDelta=Number((Number(after.score)-Number(before.score)).toFixed(4));
  const compositeDelta=Number((Number(after.candidate_composite)-Number(before.candidate_composite)).toFixed(4));
  const versionIncremented=String(before.version)!==String(after.version);
  const provenanceComplete=Boolean(
    fixture.case_id &&
    fixture.record?.institution_id &&
    req.submitted_at &&
    req.request_type &&
    req.challenged_field &&
    Array.isArray(req.evidence_submission) &&
    req.evidence_submission.length &&
    review.reviewer_id &&
    review.coi_status &&
    review.decision &&
    versionIncremented
  );
  const paymentNeutral=req.payment_or_benefit_offered===false;
  const humanBoundary=review.human_decision_required===true;
  return {
    schema_version:"1.0",
    fixture_type:"correction_cycle",
    synthetic_only:true,
    case_id:fixture.case_id,
    metrics:{
      score_delta:scoreDelta,
      composite_delta:compositeDelta,
      version_incremented:versionIncremented,
      provenance_complete:provenanceComplete,
      payment_neutral:paymentNeutral,
      human_decision_required:humanBoundary
    },
    disposition:{
      accepted:review.decision==="ACCEPTED",
      correction_provenance_record_required:review.decision==="ACCEPTED",
      real_public_log_mutation_allowed:false,
      automatic_decision_allowed:false
    },
    assertions:{
      score_delta_matches_expected:scoreDelta===fixture.expected.score_delta,
      composite_delta_matches_expected:compositeDelta===fixture.expected.composite_delta,
      version_incremented:versionIncremented===fixture.expected.version_incremented,
      provenance_complete:provenanceComplete,
      payment_cannot_influence_outcome:paymentNeutral,
      human_decision_boundary_preserved:humanBoundary,
      no_real_public_cpr_mutation:fixture.expected.public_real_cpr_log_mutation===false
    },
    interpretation:"Synthetic correction-cycle rehearsal only. It verifies traceability, versioning and score-impact calculation without creating a real CPR entry."
  };
}

function coiDecision(caseItem){
  const rel=caseItem.relationship||{};
  const materialTypes=new Set([
    "FINANCIAL_INTEREST",
    "PAID_CONSULTING",
    "CLOSE_COLLABORATION",
    "DIRECT_INSTITUTIONAL_COMPETITION",
    "PERSONAL_INVOLVEMENT_IN_DISPUTED_ITEM",
    "FAMILY_RELATIONSHIP",
    "CURRENT_OR_RECENT_CONTRACT"
  ]);
  const material=rel.material===true || materialTypes.has(rel.type);
  const conflict=rel.type!=="NONE" && material;
  return {
    id:caseItem.id,
    reviewer_id:caseItem.reviewer_id,
    relationship_type:rel.type,
    conflict_detected:conflict,
    eligible_to_review:!conflict,
    recusal_required:conflict,
    reassignment_required:conflict,
    automatic_misconduct_inference:false
  };
}

export function evaluateCoiFixture(fixture){
  const cases=(fixture.cases||[]).map(coiDecision);
  const replacement=coiDecision({
    id:"REPLACEMENT",
    reviewer_id:fixture.replacement_reviewer?.reviewer_id,
    relationship:fixture.replacement_reviewer?.relationship||{type:"NONE"}
  });
  const recusals=cases.filter(x=>x.recusal_required).length;
  const eligible=cases.filter(x=>x.eligible_to_review).length;
  return {
    schema_version:"1.0",
    fixture_type:"coi_assignment_and_recusal",
    synthetic_only:true,
    cases,
    metrics:{
      case_count:cases.length,
      recusals_required:recusals,
      eligible_without_recusal:eligible,
      replacement_reviewer_eligible:replacement.eligible_to_review
    },
    replacement_reviewer:replacement,
    assertions:{
      recusal_count_matches_expected:recusals===fixture.expected.recusals_required,
      eligible_count_matches_expected:eligible===fixture.expected.eligible_without_recusal,
      replacement_reviewer_eligible:replacement.eligible_to_review===fixture.expected.replacement_reviewer_eligible,
      concealed_conflict_allowed:fixture.expected.concealed_conflict_allowed===false,
      payment_can_influence_outcome:fixture.expected.payment_can_influence_outcome===false,
      no_automatic_misconduct_inference:cases.every(x=>x.automatic_misconduct_inference===false)
    },
    interpretation:"Synthetic COI assignment/recusal rehearsal only. Conflict detection routes the matter away from the conflicted reviewer; it does not infer wrongdoing or appoint any real reviewer."
  };
}

if(process.argv[1]?.endsWith("protocolometry-correction-coi.mjs")){
  const [mode,fixturePath]=process.argv.slice(2);
  if(!mode||!fixturePath){
    console.error("Usage: node scripts/protocolometry-correction-coi.mjs correction|coi FIXTURE.json");
    process.exit(2);
  }
  const fixture=readJson(fixturePath);
  const out=mode==="correction"
    ? evaluateCorrectionCycle(fixture)
    : mode==="coi"
      ? evaluateCoiFixture(fixture)
      : (()=>{throw new Error("mode must be correction or coi")})();
  process.stdout.write(JSON.stringify(out,null,2)+"\n");
}

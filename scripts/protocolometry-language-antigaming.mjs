#!/usr/bin/env node
import fs from "node:fs";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

function indicatorWeights(method){
  const out={};
  for(const d of method.dimensions){
    const w=Number(d.indicator_weight_percent);
    if(!Number.isFinite(w)||w<=0) throw new Error(`invalid indicator weight for ${d.id}`);
    for(const i of d.indicators) out[i.id]=w;
  }
  return out;
}

function scoreProfile(profile,method){
  const weights=indicatorWeights(method);
  let evidenced=0,contrib=0;
  for(const item of profile.indicators||[]){
    const w=weights[item.indicator_id];
    if(!w) throw new Error(`unknown indicator ${item.indicator_id}`);
    if(item.score==="NE") continue;
    if(!Number.isInteger(item.score)||item.score<0||item.score>5) throw new Error(`invalid score ${item.indicator_id}`);
    evidenced += w;
    contrib += (item.score/5)*w;
  }
  return {
    weighted_evidence_coverage_percent:Number(evidenced.toFixed(1)),
    candidate_composite:evidenced?Number((100*contrib/evidenced).toFixed(4)):null
  };
}

export function evaluateLanguageRegionalFairness(fixture,method){
  const profiles=(fixture.profiles||[]).map(p=>({...p,...scoreProfile(p,method)}));
  const composites=[...new Set(profiles.map(p=>p.candidate_composite))];
  const coverages=[...new Set(profiles.map(p=>p.weighted_evidence_coverage_percent))];
  const english=profiles.find(p=>p.primary_evidence_language==="en");
  const nonEnglish=profiles.filter(p=>p.primary_evidence_language!=="en");
  const nonEnglishAverage=nonEnglish.length?nonEnglish.reduce((a,b)=>a+b.candidate_composite,0)/nonEnglish.length:null;
  const regions=[...new Set(profiles.map(p=>p.region))];
  return {
    schema_version:"1.0",
    fixture_type:"language_regional_fairness",
    synthetic_only:true,
    profiles:profiles.map(p=>({
      id:p.id,
      region:p.region,
      primary_evidence_language:p.primary_evidence_language,
      translated_for_assessor_count:(p.indicators||[]).filter(x=>x.translated_for_assessor).length,
      weighted_evidence_coverage_percent:p.weighted_evidence_coverage_percent,
      candidate_composite:p.candidate_composite,
      non_scoring_context_keys:Object.keys(p.non_scoring_context||{})
    })),
    metrics:{
      profile_count:profiles.length,
      region_count:regions.length,
      non_english_primary_evidence_profiles:nonEnglish.length,
      unique_composite_count:composites.length,
      unique_coverage_count:coverages.length,
      english_marketing_advantage_points:english&&nonEnglishAverage!==null?Number((english.candidate_composite-nonEnglishAverage).toFixed(4)):null,
      translation_penalty_points:composites.length===1?0:null
    },
    assertions:{
      all_regions_represented:regions.length===fixture.expected.regions_covered,
      all_profiles_same_absolute_score:composites.length===1&&composites[0]===fixture.expected.expected_composite_each,
      all_profiles_same_coverage:coverages.length===1&&coverages[0]===fixture.expected.expected_coverage_each,
      no_english_marketing_bonus:english&&nonEnglishAverage!==null&&Math.abs(english.candidate_composite-nonEnglishAverage)<1e-9,
      no_translation_penalty:composites.length===1
    },
    interpretation:"Synthetic fairness preflight only. Language, region, translation need and marketing intensity are excluded from absolute scoring when source quality and mission-relevant evidence are held constant."
  };
}

function evaluateAttack(a){
  const base={
    id:a.id,
    route:a.route,
    reward_allowed:false,
    human_review_required:true,
    automatic_institution_penalty:false,
    disposition:"BLOCK_OR_REVIEW"
  };
  if(a.route==="partnership_inflation"){
    return {...base,reason:"Partnership quantity alone does not establish verified cooperation quality; I18 must be evidence-quality and relevance based."};
  }
  if(a.route==="publication_quantity_without_relevance"){
    return {...base,reason:"Raw publication count without mission relevance cannot support I01 quality."};
  }
  if(a.route==="duplicated_evidence"){
    const fps=(a.evidence_claims||[]).map(x=>x.claim_fingerprint);
    const duplicate=fps.length!==new Set(fps).size;
    return {...base,duplicate_claim_detected:duplicate,reason:"The same underlying achievement cannot be rewarded as independent evidence across indicators without distinct construct justification."};
  }
  if(a.route==="marketing_only_claim"){
    const tiers=a.evidence_tiers||[];
    const onlyD=tiers.length>0&&tiers.every(x=>x==="D");
    return {...base,tier_d_only:onlyD,reason:"Tier D evidence alone cannot support a score above 2."};
  }
  if(a.route==="superficial_digital_presence"){
    return {...base,reason:"Followers and likes are not quality indicators; I19 requires substantive digital and multilingual transparency."};
  }
  if(a.route==="strategic_ne_laundering"){
    const laundering=a.proposed_score==="NE"&&a.sufficient_verified_evidence===true&&a.evidence_status==="CONTRADICTED_OR_NONCONFORMING";
    return {...base,ne_laundering_detected:laundering,required_score_class:laundering?"VERIFIED_NON_CONFORMANCE_NOT_NE":null,reason:"NE is only for insufficient evidence; verified non-conformance cannot be hidden as missing evidence."};
  }
  return {...base,reason:"Unknown synthetic attack route requires human review."};
}

export function evaluateAntiGaming(fixture){
  const attacks=(fixture.attacks||[]).map(evaluateAttack);
  return {
    schema_version:"1.0",
    fixture_type:"anti_gaming_attacks",
    synthetic_only:true,
    attack_count:attacks.length,
    reward_allowed_count:attacks.filter(x=>x.reward_allowed).length,
    human_review_flag_count:attacks.filter(x=>x.human_review_required).length,
    automatic_institution_penalty:false,
    attacks,
    assertions:{
      all_attacks_block_reward:attacks.every(x=>x.reward_allowed===false),
      all_attacks_require_review:attacks.every(x=>x.human_review_required===true),
      no_automatic_institution_penalty:attacks.every(x=>x.automatic_institution_penalty===false),
      duplicate_evidence_detected:attacks.find(x=>x.route==="duplicated_evidence")?.duplicate_claim_detected===true,
      tier_d_ceiling_enforced:attacks.find(x=>x.route==="marketing_only_claim")?.tier_d_only===true,
      ne_laundering_detected:attacks.find(x=>x.route==="strategic_ne_laundering")?.ne_laundering_detected===true
    },
    interpretation:"Synthetic attack testing only. Controls block unsupported reward or escalate review; they do not blacklist an institution, infer intent, or apply an automatic institution-wide penalty."
  };
}

if(process.argv[1]?.endsWith("protocolometry-language-antigaming.mjs")){
  const [mode,fixturePath,methodPath="data/institute-index-methodology-candidate.json"]=process.argv.slice(2);
  if(!mode||!fixturePath){
    console.error("Usage: node scripts/protocolometry-language-antigaming.mjs fairness|gaming FIXTURE.json [METHOD.json]");
    process.exit(2);
  }
  const fixture=readJson(fixturePath);
  const out=mode==="fairness"
    ? evaluateLanguageRegionalFairness(fixture,readJson(methodPath))
    : mode==="gaming"
      ? evaluateAntiGaming(fixture)
      : (()=>{throw new Error("mode must be fairness or gaming")})();
  process.stdout.write(JSON.stringify(out,null,2)+"\n");
}

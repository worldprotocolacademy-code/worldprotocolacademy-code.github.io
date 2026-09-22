#!/usr/bin/env node
import fs from "node:fs";

const METHOD_PATH = "data/institute-index-methodology-candidate.json";
const DEFAULT_WEIGHTS = {D1:30,D2:25,D3:25,D4:20};

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

function buildIndicatorMap(method){
  const map={};
  for(const d of method.dimensions){
    for(const i of d.indicators){
      map[i.id]={dimension_id:d.id,indicator_weight_percent:d.indicator_weight_percent};
    }
  }
  return map;
}

export function scoreCoverageProfile(profile, method){
  const indicatorMap=buildIndicatorMap(method);
  const dimensionPossible=Object.fromEntries(method.dimensions.map(d=>[d.id,d.provisional_weight_percent]));
  const dimensionEvidence=Object.fromEntries(method.dimensions.map(d=>[d.id,0]));
  const dimensionContribution=Object.fromEntries(method.dimensions.map(d=>[d.id,0]));
  let evidenceWeight=0, contribution=0;

  for(const [id,score] of Object.entries(profile.scores||{})){
    const meta=indicatorMap[id];
    if(!meta) throw new Error(`unknown indicator ${id}`);
    if(score==="NE") continue;
    if(!Number.isInteger(score)||score<0||score>5) throw new Error(`invalid score for ${id}`);
    evidenceWeight += meta.indicator_weight_percent;
    contribution += (score/5)*meta.indicator_weight_percent;
    dimensionEvidence[meta.dimension_id] += meta.indicator_weight_percent;
    dimensionContribution[meta.dimension_id] += (score/5)*meta.indicator_weight_percent;
  }

  const dimensions={};
  let floorsPass=true;
  for(const d of method.dimensions){
    const cov=100*dimensionEvidence[d.id]/dimensionPossible[d.id];
    if(cov<method.scoring.dimension_minimum_evidence_coverage_percent) floorsPass=false;
    dimensions[d.id]={
      evidence_coverage_percent:Number(cov.toFixed(1)),
      normalized_score:dimensionEvidence[d.id]
        ? Number((100*dimensionContribution[d.id]/dimensionEvidence[d.id]).toFixed(4))
        : null
    };
  }
  const overallPass=evidenceWeight>=method.scoring.overall_minimum_evidence_coverage_percent;
  const available=overallPass&&floorsPass;
  return {
    id:profile.id,
    weighted_evidence_coverage_percent:Number(evidenceWeight.toFixed(1)),
    dimensions,
    composite_status:available?"AVAILABLE":"INSUFFICIENT_EVIDENCE_FOR_COMPOSITE",
    candidate_composite:available?Number((100*contribution/evidenceWeight).toFixed(4)):null,
    imputation_used:false,
    missing_data_penalty_used:false
  };
}

export function evaluateCoverageFixture(fixture, method){
  const profiles=fixture.profiles.map(p=>scoreCoverageProfile(p,method));
  const byId=Object.fromEntries(profiles.map(p=>[p.id,p]));
  return {
    schema_version:"1.0",
    fixture_type:"coverage_behavior",
    synthetic_only:true,
    profiles,
    assertions:{
      full_vs_balanced_same_normalized_composite:
        byId.FULL_EVIDENCE_4.candidate_composite===byId.BALANCED_THRESHOLD_4.candidate_composite,
      below_overall_withheld:byId.BELOW_OVERALL_4.composite_status==="INSUFFICIENT_EVIDENCE_FOR_COMPOSITE",
      dimension_floor_withheld:byId.DIMENSION_FAIL_4.composite_status==="INSUFFICIENT_EVIDENCE_FOR_COMPOSITE",
      verified_zero_changes_score:byId.VERIFIED_NONCONFORMANCE.candidate_composite < byId.FULL_EVIDENCE_4.candidate_composite,
      no_imputation_or_missing_penalty:profiles.every(p=>!p.imputation_used&&!p.missing_data_penalty_used)
    },
    interpretation:"Synthetic coverage behavior only. NE is excluded from the numerator and denominator; below-threshold profiles are withheld rather than imputed or zero-penalised."
  };
}

function weightedComposite(dimensionScores,weights){
  let s=0,total=0;
  for(const [d,w] of Object.entries(weights)){
    if(!(d in dimensionScores)) throw new Error(`missing dimension ${d}`);
    s += dimensionScores[d]*w;
    total += w;
  }
  if(Math.abs(total-100)>1e-9) throw new Error("weights must sum to 100");
  return Number((s/100).toFixed(4));
}

export function evaluateWeightFixture(fixture){
  const results={};
  for(const [scheme,weights] of Object.entries(fixture.weight_schemes)){
    results[scheme]={};
    for(const p of fixture.profiles) results[scheme][p.id]=weightedComposite(p.dimension_scores,weights);
  }
  const canonical=results.canonical_candidate;
  const drift={};
  for(const p of fixture.profiles){
    drift[p.id]={};
    for(const scheme of Object.keys(results)){
      drift[p.id][scheme]=Number((results[scheme][p.id]-canonical[p.id]).toFixed(4));
    }
  }
  const profileIds=fixture.profiles.map(x=>x.id);
  const pairwise_reversals=[];
  for(let i=0;i<profileIds.length;i++){
    for(let j=i+1;j<profileIds.length;j++){
      const a=profileIds[i],b=profileIds[j];
      const canonSign=Math.sign(canonical[a]-canonical[b]);
      for(const [scheme,vals] of Object.entries(results)){
        if(scheme==="canonical_candidate") continue;
        const sign=Math.sign(vals[a]-vals[b]);
        if(canonSign!==0&&sign!==0&&sign!==canonSign){
          pairwise_reversals.push({a,b,scheme,canonical_difference:Number((canonical[a]-canonical[b]).toFixed(4)),alternative_difference:Number((vals[a]-vals[b]).toFixed(4))});
        }
      }
    }
  }
  const maxAbsDrift=Math.max(...Object.values(drift).flatMap(x=>Object.values(x).map(Math.abs)));
  return {
    schema_version:"1.0",
    fixture_type:"weight_sensitivity",
    synthetic_only:true,
    schemes:fixture.weight_schemes,
    composites:results,
    drift_from_canonical:drift,
    max_absolute_score_drift:Number(maxAbsDrift.toFixed(4)),
    pairwise_reversals,
    automatic_acceptability_threshold:false,
    interpretation:"Synthetic sensitivity diagnostics only. Drift or reversal triggers methodological review; software does not choose a preferred weighting or pass G06 automatically."
  };
}

if(process.argv[1]?.endsWith("protocolometry-coverage-weight-stress.mjs")){
  const [mode,fixturePath]=process.argv.slice(2);
  if(!mode||!fixturePath){
    console.error("Usage: node scripts/protocolometry-coverage-weight-stress.mjs coverage|weights FIXTURE.json");
    process.exit(2);
  }
  const fixture=readJson(fixturePath);
  const out=mode==="coverage"
    ? evaluateCoverageFixture(fixture,readJson(METHOD_PATH))
    : mode==="weights"
      ? evaluateWeightFixture(fixture)
      : (()=>{throw new Error("mode must be coverage or weights")})();
  process.stdout.write(JSON.stringify(out,null,2)+"\n");
}

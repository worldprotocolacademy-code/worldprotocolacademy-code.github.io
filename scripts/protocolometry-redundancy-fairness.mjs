#!/usr/bin/env node
import fs from "node:fs";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function pearson(xs,ys){
  if(xs.length!==ys.length||xs.length<2) return null;
  const mx=mean(xs), my=mean(ys);
  let num=0,dx=0,dy=0;
  for(let i=0;i<xs.length;i++){
    const ax=xs[i]-mx, ay=ys[i]-my;
    num+=ax*ay; dx+=ax*ax; dy+=ay*ay;
  }
  if(!dx||!dy) return null;
  return num/Math.sqrt(dx*dy);
}
function jaccard(a,b){
  const A=new Set(a||[]),B=new Set(b||[]);
  const union=new Set([...A,...B]);
  if(!union.size) return 0;
  let inter=0; for(const x of A) if(B.has(x)) inter++;
  return inter/union.size;
}
function combinations(arr){
  const out=[]; for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++)out.push([arr[i],arr[j]]);
  return out;
}

export function evaluateRedundancyFixture(fixture){
  const ids=Object.keys(fixture.cases?.[0]?.scores||{}).sort();
  const pairs=[];
  for(const [a,b] of combinations(ids)){
    const xs=fixture.cases.map(c=>c.scores[a]);
    const ys=fixture.cases.map(c=>c.scores[b]);
    const r=pearson(xs,ys);
    const overlap=jaccard(fixture.indicator_source_tokens?.[a],fixture.indicator_source_tokens?.[b]);
    const enough=xs.length>=(fixture.minimum_comparable_cases||8);
    const correlationFlag=enough&&r!==null&&Math.abs(r)>=(fixture.correlation_trigger_absolute||0.95);
    const sourceOverlapFlag=overlap>=(fixture.source_overlap_trigger_jaccard||0.8);
    const reviewFlag=correlationFlag||sourceOverlapFlag;
    pairs.push({
      indicator_a:a,indicator_b:b,comparable_cases:xs.length,
      pearson_r:r===null?null:Number(r.toFixed(6)),
      source_overlap_jaccard:Number(overlap.toFixed(6)),
      correlation_flag:correlationFlag,
      source_overlap_flag:sourceOverlapFlag,
      human_review_required:reviewFlag,
      automatic_indicator_deletion:false,
      automatic_reweighting:false
    });
  }
  const flagged=pairs.filter(x=>x.human_review_required);
  return {
    schema_version:"1.0",
    fixture_type:"indicator_redundancy",
    synthetic_only:true,
    pair_count:pairs.length,
    flagged_pair_count:flagged.length,
    flagged_pairs:flagged,
    all_pairs:pairs,
    interpretation:"Correlation or shared-evidence overlap is a human-review trigger. The engine does not delete, merge or reweight indicators."
  };
}

function indicatorWeights(method){
  const out={};
  for(const d of method.dimensions) for(const i of d.indicators) out[i.id]=i.indicator_weight_percent;
  return out;
}
function composite(profile,method){
  const weights=indicatorWeights(method);
  let ew=0,c=0;
  for(const [id,score] of Object.entries(profile.scores||{})){
    if(score==="NE") continue;
    if(!Number.isInteger(score)||score<0||score>5) throw new Error(`invalid score ${id}`);
    const w=weights[id]; if(!w) throw new Error(`unknown indicator ${id}`);
    ew+=w; c+=(score/5)*w;
  }
  const min=method.scoring.overall_minimum_evidence_coverage_percent;
  return {
    weighted_evidence_coverage_percent:Number(ew.toFixed(1)),
    candidate_composite:ew>=min?Number((100*c/ew).toFixed(4)):null,
    composite_status:ew>=min?"AVAILABLE":"INSUFFICIENT_EVIDENCE_FOR_COMPOSITE"
  };
}
function peerPercentiles(profiles,minimum){
  const groups={};
  for(const p of profiles){
    (groups[p.peer_type]??=[]).push(p);
  }
  const out={};
  for(const [peer,rows] of Object.entries(groups)){
    if(rows.length<minimum){
      out[peer]={sample_size:rows.length,status:"WITHHELD_INSUFFICIENT_PEER_SAMPLE",percentiles:{}};
      continue;
    }
    const sorted=[...rows].sort((a,b)=>a.candidate_composite-b.candidate_composite);
    const pct={};
    for(let i=0;i<sorted.length;i++) pct[sorted[i].id]=Number((100*i/(sorted.length-1||1)).toFixed(1));
    out[peer]={sample_size:rows.length,status:"AVAILABLE",percentiles:pct};
  }
  return out;
}
export function evaluatePeerFairnessFixture(fixture,method){
  const forbidden=new Set(fixture.forbidden_hidden_quality_proxies||[]);
  const profiles=fixture.profiles.map(p=>{
    const scoring=composite(p,method);
    const contextKeys=Object.keys(p.non_scoring_context||{});
    const forbiddenPresent=contextKeys.filter(k=>forbidden.has(k));
    return {...p,...scoring,forbidden_context_present:forbiddenPresent};
  });
  const scores=[...new Set(profiles.map(p=>p.candidate_composite))];
  const invariant=scores.length===1&&scores[0]===fixture.expected_standard_referenced_composite;
  const minimum=fixture.minimum_peer_sample_for_percentile||5;
  const peer=peerPercentiles(profiles,minimum);
  return {
    schema_version:"1.0",
    fixture_type:"peer_type_fairness",
    synthetic_only:true,
    profiles:profiles.map(p=>({
      id:p.id,peer_type:p.peer_type,
      weighted_evidence_coverage_percent:p.weighted_evidence_coverage_percent,
      candidate_composite:p.candidate_composite,
      composite_status:p.composite_status,
      forbidden_context_present:p.forbidden_context_present
    })),
    assertions:{
      standard_referenced_score_invariant_across_peer_types:invariant,
      forbidden_context_excluded_from_formula:true,
      peer_percentiles_withheld_below_minimum:Object.values(peer).every(x=>x.status==="WITHHELD_INSUFFICIENT_PEER_SAMPLE")
    },
    peer_percentile_diagnostics:peer,
    interpretation:"Synthetic fairness preflight only. Absolute standard-referenced scoring is independent of peer type, size, budget, prestige and follower proxies; peer percentile remains secondary and sample-gated."
  };
}

if(process.argv[1]?.endsWith("protocolometry-redundancy-fairness.mjs")){
  const [mode,fixturePath,methodPath="data/institute-index-methodology-candidate.json"]=process.argv.slice(2);
  if(!mode||!fixturePath){
    console.error("Usage: node scripts/protocolometry-redundancy-fairness.mjs redundancy|fairness FIXTURE.json [METHOD.json]");
    process.exit(2);
  }
  const fixture=readJson(fixturePath);
  const out=mode==="redundancy"
    ? evaluateRedundancyFixture(fixture)
    : mode==="fairness"
      ? evaluatePeerFairnessFixture(fixture,readJson(methodPath))
      : (()=>{throw new Error("mode must be redundancy or fairness")})();
  process.stdout.write(JSON.stringify(out,null,2)+"\n");
}

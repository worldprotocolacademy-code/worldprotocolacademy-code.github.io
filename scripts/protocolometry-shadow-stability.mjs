#!/usr/bin/env node
import fs from "node:fs";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}

function rank(scores){
  return Object.entries(scores)
    .sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]))
    .reduce((acc,[id],idx)=>{acc[id]=idx+1; return acc;},{});
}

function spearman(baseRanks,nextRanks){
  const ids=Object.keys(baseRanks);
  if(ids.length<2) return null;
  let sum=0;
  for(const id of ids){
    const d=baseRanks[id]-nextRanks[id];
    sum+=d*d;
  }
  const n=ids.length;
  return 1-(6*sum)/(n*(n*n-1));
}

function pairwiseReversals(baseRanks,nextRanks){
  const ids=Object.keys(baseRanks);
  let reversals=0,total=0;
  for(let i=0;i<ids.length;i++){
    for(let j=i+1;j<ids.length;j++){
      total++;
      const a=ids[i],b=ids[j];
      const baseOrder=Math.sign(baseRanks[a]-baseRanks[b]);
      const nextOrder=Math.sign(nextRanks[a]-nextRanks[b]);
      if(baseOrder!==0 && nextOrder!==0 && baseOrder!==nextOrder) reversals++;
    }
  }
  return {reversals,total,rate:total?100*reversals/total:0};
}

export function evaluateShadowStability(fixture){
  const baseScores=fixture.baseline.scores;
  const baseRanks=rank(baseScores);
  const triggers=fixture.diagnostic_review_triggers||{};
  const reports=(fixture.scenarios||[]).map(s=>{
    const nextRanks=rank(s.scores);
    const ids=Object.keys(baseScores);
    const deltas=ids.map(id=>Math.abs(Number(s.scores[id])-Number(baseScores[id])));
    const rankShifts=ids.map(id=>Math.abs(nextRanks[id]-baseRanks[id]));
    const pr=pairwiseReversals(baseRanks,nextRanks);
    const rho=spearman(baseRanks,nextRanks);
    const outliers=ids.filter(id=>{
      const scoreDelta=Math.abs(Number(s.scores[id])-Number(baseScores[id]));
      const rankShift=Math.abs(nextRanks[id]-baseRanks[id]);
      return scoreDelta >= (triggers.absolute_score_delta_at_least ?? Infinity)
        || rankShift >= (triggers.absolute_rank_shift_at_least ?? Infinity);
    });
    const review =
      outliers.length>0 ||
      pr.rate >= (triggers.pairwise_reversal_rate_percent_at_least ?? Infinity) ||
      (rho!==null && rho < (triggers.spearman_rho_below ?? -Infinity));

    return {
      scenario_id:s.id,
      spearman_rho:rho===null?null:Number(rho.toFixed(6)),
      pairwise_reversal_count:pr.reversals,
      pairwise_reversal_rate_percent:Number(pr.rate.toFixed(4)),
      max_absolute_rank_shift:Math.max(...rankShifts),
      max_absolute_score_delta:Number(Math.max(...deltas).toFixed(4)),
      mean_absolute_score_delta:Number((deltas.reduce((a,b)=>a+b,0)/deltas.length).toFixed(4)),
      outlier_count:outliers.length,
      outlier_ids:outliers,
      human_review_required:review,
      automatic_public_release:false,
      automatic_gate_unlock:false
    };
  });

  return {
    schema_version:"1.0",
    fixture_type:"shadow_index_stability",
    synthetic_only:true,
    public_release_prohibited:true,
    baseline_rank:baseRanks,
    scenarios:reports,
    interpretation:"Synthetic stability diagnostics only. Ordinal movement, drift and outliers trigger human review; software cannot unlock G13 or publish a real Shadow Index."
  };
}

if(process.argv[1]?.endsWith("protocolometry-shadow-stability.mjs")){
  const [fixturePath]=process.argv.slice(2);
  if(!fixturePath){
    console.error("Usage: node scripts/protocolometry-shadow-stability.mjs FIXTURE.json");
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(evaluateShadowStability(readJson(fixturePath)),null,2)+"\n");
}

#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

function readJson(path){return JSON.parse(fs.readFileSync(path,"utf8"));}
function repoPath(p){return p.replace(/^\//,"");}
function gitBlobSha(path){
  return execFileSync("git",["hash-object",path],{encoding:"utf8"}).trim();
}
function sha256(path){
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

export function verifyFreezeCandidate(manifestPath="data/institute-index/protocolometry-v1-freeze-candidate-manifest.json"){
  const manifest=readJson(manifestPath);
  if(manifest.status!=="CANDIDATE_PREPARED_NOT_V1_FROZEN") throw new Error("manifest must remain candidate-only");
  if(manifest.mutation_policy?.final_lockfile_status!=="NOT_GENERATED") throw new Error("final lockfile must not exist before G15 closure");

  const assetResults=[];
  for(const asset of manifest.candidate_asset_fingerprints.assets||[]){
    const path=repoPath(asset.path);
    if(!fs.existsSync(path)) throw new Error(`missing freeze-candidate asset: ${path}`);
    const actualGit=gitBlobSha(path);
    if(actualGit!==asset.git_blob_sha1){
      throw new Error(`freeze-candidate fingerprint drift: ${path}: ${actualGit} != ${asset.git_blob_sha1}`);
    }
    assetResults.push({
      path:asset.path,
      git_blob_sha1:actualGit,
      sha256_preview:sha256(path),
      role:asset.role
    });
  }

  const method=readJson("data/institute-index-methodology-candidate.json");
  const gates=readJson("data/institute-index/v1-readiness-gates.json");
  const chain=readJson("data/institute-index/measurement-chain-status.json");
  const g14=gates.gates.find(x=>x.id==="G14");
  const g15=gates.gates.find(x=>x.id==="G15");

  const indicatorCount=(method.dimensions||[]).reduce((n,d)=>n+(d.indicators||[]).length,0);
  const weightSum=(method.dimensions||[]).reduce((n,d)=>n+Number(d.provisional_weight_percent||0),0);

  if(method.schema_version!=="0.9.1-candidate") throw new Error("candidate methodology version drift");
  if(method.dimensions.length!==4 || indicatorCount!==20 || weightSum!==100) throw new Error("candidate methodology structural drift");
  if(method.scoring.overall_minimum_evidence_coverage_percent!==80) throw new Error("overall evidence threshold drift");
  if(method.scoring.dimension_minimum_evidence_coverage_percent!==60) throw new Error("dimension evidence threshold drift");
  if(method.scoring.imputation!=="PROHIBITED") throw new Error("imputation boundary drift");
  if(method.peer_comparison.minimum_peer_sample_for_percentile!==5) throw new Error("peer minimum drift");
  if(!String(method.peer_comparison.public_ordinal_ranking).startsWith("DISABLED")) throw new Error("ordinal ranking boundary drift");
  if(g14?.status!=="LOCKED") throw new Error("G14 must remain LOCKED in candidate preflight");
  if(g15?.status!=="LOCKED") throw new Error("G15 must remain LOCKED before independent review");
  if(chain.readiness?.g14?.status && chain.readiness.g14.status!=="LOCKED") throw new Error("measurement chain G14 must remain LOCKED");
  if(chain.execution?.current_release && chain.execution.current_release!=="R0") throw new Error("unexpected release mode");
  if(chain.release_modes?.R3 && chain.hard_boundaries?.no_automatic_ranking!==true) throw new Error("automatic ranking boundary missing");

  return {
    schema_version:"1.0",
    status:"FREEZE_CANDIDATE_PREFLIGHT_PASS",
    v1_frozen:false,
    final_lockfile_generated:false,
    methodology_candidate_version:method.schema_version,
    dimensions:method.dimensions.length,
    indicators:indicatorCount,
    dimension_weight_sum_percent:weightSum,
    candidate_assets:assetResults,
    final_checksum_algorithm:manifest.mutation_policy.final_checksum_algorithm,
    operational_order:manifest.sequencing_rule.operational_order,
    human_gate_required:true,
    interpretation:"Integrity preflight only. SHA-256 values are audit previews, not the final v1.0 lockfile."
  };
}

if(process.argv[1]?.endsWith("protocolometry-freeze-preflight.mjs")){
  const mode=process.argv[2]||"verify";
  if(mode==="finalize"){
    console.error("Finalisation is intentionally unavailable. G15 review and authorised human G14 closure are required.");
    process.exit(3);
  }
  if(mode!=="verify"){
    console.error("Usage: node scripts/protocolometry-freeze-preflight.mjs verify");
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(verifyFreezeCandidate(),null,2)+"\n");
}

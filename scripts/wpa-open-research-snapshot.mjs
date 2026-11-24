#!/usr/bin/env node
/* WPA Open Research Watch — reviewed metadata snapshots, NEVER publication.
 * Can run on demand or on GitHub weekly schedule. Any provider error ABORTS
 * without replacing last successful snapshot; no silent stale overwrite.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {OA_THEMES,buildOpenAlexURL,normaliseOpenAlexPage} from './virtual-sande-open-research.mjs';
const path=resolve(process.cwd(),'data/open-research/candidates-latest.json');
export async function buildOpenResearchSnapshot({
  fetchFn=fetch,now=new Date(),pause=()=>new Promise(r=>setTimeout(r,1200)),apiKey=null
}={}){
 const topics=[],items=[],seen=new Set();
 for(const [domain,query] of Object.entries(OA_THEMES)){
  const endpoint=buildOpenAlexURL({query,type:'all',perPage:8,key:apiKey});
  let response;
  try{
   response=await fetchFn(endpoint.toString(),{headers:{Accept:'application/json'},
     signal:AbortSignal.timeout(12000),redirect:'error'});
  }catch(e){throw new Error('OA_SNAPSHOT_PROVIDER_UNREACHABLE:'+domain);}
  if(!response?.ok)throw new Error('OA_SNAPSHOT_PROVIDER_FAILED:'+domain+':'+response?.status);
  const content=await response.text();
  if(content.length>1250000)throw new Error('OA_SNAPSHOT_RESPONSE_TOO_LARGE:'+domain);
  let body;
  try{body=JSON.parse(content);}catch{throw new Error('OA_SNAPSHOT_INVALID_JSON:'+domain);}
  const normalized=normaliseOpenAlexPage(body,{query,perPage:8});
  topics.push({domain,query,found:normalized.count});
  for(const item of normalized.works){
   const key=(item.doi||item.id).toLowerCase();
   if(seen.has(key))continue;
   seen.add(key);items.push({...item,topic_candidate:domain});
  }
  await pause();
 }
 if(topics.length!==Object.keys(OA_THEMES).length)
  throw new Error('OA_SNAPSHOT_INCOMPLETE');
 const generated=now.toISOString();
 return {
  version:'wpa-open-research-watch-v0.1',generated_at_utc:generated,
  effective_date_skopje:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Skopje',
    year:'numeric',month:'2-digit',day:'2-digit'}).format(now),
  status:'EDITORIAL_CANDIDATES_METADATA_ONLY_NOT_PUBLISHED',
  source:'OpenAlex official API',source_docs:'https://help.openalex.org/api/',
  topics,candidate_count:items.length,works:items,
  limits:{max_sources:6,max_per_theme:8,full_text_downloaded:false,
   abstracts_may_be_missing:true,ai_generated_content:false},
  legal:'OA cataloguing is not permission for unrestricted redistribution. Verify licence at original source.',
  human_gate:'Required for factual claims, paper/book analysis, academic authorship, journal decisions and public release.'
 };
}
export async function runSnapshotCli(args=process.argv.slice(2)){
 const snapshot=await buildOpenResearchSnapshot({
   apiKey:process.env.OPENALEX_API_KEY||null
 });
 if(args.includes('--write')){
  await mkdir(resolve(process.cwd(),'data/open-research'),{recursive:true});
  await writeFile(path,JSON.stringify(snapshot,null,2)+'\n',{encoding:'utf8',flag:'w'});
  console.log('OA_CANDIDATE_SNAPSHOT_WRITTEN '+snapshot.candidate_count);
 }else console.log('OA_DRY_RUN '+JSON.stringify({count:snapshot.candidate_count,
   at:snapshot.generated_at_utc,topics:snapshot.topics.length}));
 return snapshot;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 runSnapshotCli().catch(err=>{
  console.error('OA_FORAGING_FAILED '+err.message);
  process.exitCode=1;
 });
}

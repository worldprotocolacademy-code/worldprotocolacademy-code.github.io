/* WPA Institutional Research API adapter. Only OpenAlex official metadata APIs.
 * No scraping of the REV7 websites, no arbitrary fetch URL, no PDF download,
 * and no automatic attribution from unverified institution names.
 */
import {getWpaInstitution} from '../../../scripts/virtual-sande-institutional-directory.mjs';
import {requireCanonicalInstitution,buildInstitutionSearchUrl,
  resolveInstitutionCandidates,buildInstitutionWorksUrl,normaliseInstitutionWorks,institutionId,
  INSTITUTIONAL_LIMITS} from '../../../scripts/virtual-sande-institutional-openalex.mjs';
const MAX=INSTITUTIONAL_LIMITS.bytesPerResponse;
const ERROR_STATUS=Object.freeze({
 INSTITUTION_NOT_IN_REV7:404,
 INTERNAL_WPA_NOT_EXTERNAL_SOURCE:422,
 AUDIT_CHILD_RESOLVE_CANONICAL_PARENT:422,
 OBSERVATION_NOT_A_VERIFIED_INSTITUTION:422,
 HISTORICAL_NO_AUTOMATIC_CURRENT_IDENTITY:422,
 SOURCE_WEBSITE_UNRESOLVED:422,
 OA_QUERY_INVALID:400,
 OA_WORK_TYPE_INVALID:400,
 OA_INSTITUTION_ID_INVALID:400,
 OA_IDENTITY_REVIEW_REQUIRED:409
});
async function fetchOfficialJSON(url,fetchFn){
 let res;
 try{res=await fetchFn(url.toString(),{method:'GET',
  headers:{Accept:'application/json'},redirect:'error',
  signal:AbortSignal.timeout(12000)});
 }catch{throw new Error('OA_PROVIDER_UNAVAILABLE');}
 if(res.status===429)throw new Error('OA_PROVIDER_RATE_LIMITED');
 if(!res.ok)throw new Error('OA_PROVIDER_ERROR');
 const size=Number(res.headers?.get('Content-Length')||0);
 if(size>MAX)throw new Error('OA_PROVIDER_TOO_LARGE');
 let combined='';
 if(res.body?.getReader){
  const reader=res.body.getReader();let bytes=0;
  const chunks=[];
  try{
   while(true){
    const {done,value}=await reader.read();
    if(done)break;
    bytes+=value.byteLength;
    if(bytes>MAX)throw new Error('OA_PROVIDER_TOO_LARGE');
    chunks.push(value);
   }
  }finally{await reader.cancel().catch(()=>{});}
  const buf=new Uint8Array(bytes);let pos=0;
  for(const c of chunks){buf.set(c,pos);pos+=c.byteLength;}
  try{combined=new TextDecoder('utf-8',{fatal:true}).decode(buf);}
  catch{throw new Error('OA_PROVIDER_INVALID_ENCODING');}
 }else{
  combined=await res.text();
  if(new TextEncoder().encode(combined).length>MAX)throw new Error('OA_PROVIDER_TOO_LARGE');
 }
 try{return JSON.parse(combined);}catch{throw new Error('OA_PROVIDER_BAD_JSON');}
}
function failure(e){
 const code=String(e?.message||'OA_UNKNOWN_FAILURE');
 return {http_status:ERROR_STATUS[code]||(code.startsWith('OA_PROVIDER_')?503:502),
  ok:false,error:code,
  source_status:'NO_INSTITUTIONAL_RESEARCH_DELIVERED'};
}
export async function institutionLookup({id,env={},fetchFn=fetch}={}){
 try{
  const rec=requireCanonicalInstitution(id);
  const json=await fetchOfficialJSON(buildInstitutionSearchUrl(rec,{apiKey:env.OPENALEX_API_KEY}),fetchFn);
  return {http_status:200,ok:true,...resolveInstitutionCandidates(rec,json),
    provider:'OpenAlex',provider_data_currentness:'UNVERIFIED',
    fulltext_downloaded:false,model_invoked:false};
 }catch(e){return failure(e);}
}
export async function institutionWorks({id,openalexId,question,type='all',env={},fetchFn=fetch}={}){
 try{
  const rec=requireCanonicalInstitution(id);
  const selected=institutionId(openalexId);
  if(!selected)throw new Error('OA_INSTITUTION_ID_INVALID');
  // Re-resolve on the server on EVERY request. Client-supplied IDs are never
  // treated as a trustworthy affiliation assertion by themselves.
  const js=await fetchOfficialJSON(buildInstitutionSearchUrl(rec,{apiKey:env.OPENALEX_API_KEY}),fetchFn);
  const identity=resolveInstitutionCandidates(rec,js);
  const match=identity.matches.find(m=>m.openalex_id===selected&&m.selectable_for_provisional_research);
  if(!match)throw new Error('OA_IDENTITY_REVIEW_REQUIRED');
  const url=buildInstitutionWorksUrl({openalexId:selected,question,type,
    apiKey:env.OPENALEX_API_KEY});
  const page=await fetchOfficialJSON(url,fetchFn);
  return {http_status:200,ok:true,
    ...normaliseInstitutionWorks(page,{institution:rec,match,question,type}),
    provider:'OpenAlex',fulltext_downloaded:false,model_invoked:false};
 }catch(e){return failure(e);}
}

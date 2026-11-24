/* Open Research Foraging: bounded provider call to one fixed official API.
 * No arbitrary URL fetch, PDF download, scraping, account access or model call.
 * Provider replies are candidates for analysis, NOT verified source contents.
 */
import {buildOpenAlexURL,normaliseOpenAlexPage} from '../../../scripts/virtual-sande-open-research.mjs';

export const FORAGING_LIMITS={maxResponseBytes:1200000,maxItems:10};
async function readLimitedText(response,max){
 const length=Number(response.headers.get('Content-Length')||0);
 if(length>max)throw new Error('OA_PROVIDER_TOO_LARGE');
 // Consume incrementally; content-length is not trustworthy.
 if(!response.body?.getReader){
  const text=await response.text();
  if(text.length>max)throw new Error('OA_PROVIDER_TOO_LARGE');
  return text;
 }
 const reader=response.body.getReader(),buffers=[];
 let count=0;
 try{
  while(true){
   const {value,done}=await reader.read();
   if(done)break;
   count+=value.byteLength;
   if(count>max)throw new Error('OA_PROVIDER_TOO_LARGE');
   buffers.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const combined=new Uint8Array(count);
 let index=0;
 for(const part of buffers){combined.set(part,index);index+=part.byteLength;}
 return new TextDecoder('utf-8',{fatal:true}).decode(combined);
}
export async function discoverOpenResearch({query,type='all',env={},fetchFn=fetch}={}){
 let endpoint;
 try{endpoint=buildOpenAlexURL({query,type,perPage:FORAGING_LIMITS.maxItems,key:env.OPENALEX_API_KEY});}
 catch(e){return {status:400,error:e.message};}
 let response;
 try{
  response=await fetchFn(endpoint.toString(),{
   method:'GET',headers:{Accept:'application/json'},
   redirect:'error',signal:AbortSignal.timeout(12000)
  });
 }catch{return {status:503,error:'OA_PROVIDER_UNREACHABLE'};}
 if(response.status===429)return {status:503,error:'OA_PROVIDER_RATE_LIMITED'};
 if(!response.ok)return {status:503,error:'OA_PROVIDER_ERROR'};
 try{
  const text=await readLimitedText(response,FORAGING_LIMITS.maxResponseBytes);
  const page=JSON.parse(text);
  const data=normaliseOpenAlexPage(page,{query,type,perPage:FORAGING_LIMITS.maxItems});
  return {http_status:200,ok:true,...data,query_shared_with_provider:true,
    provider_data_may_be_stale:true,fulltext_downloaded:false,paid_ai_called:false};
 }catch{return {status:502,error:'OA_PROVIDER_MALFORMED_OR_TOO_LARGE'};}
}

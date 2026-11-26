import {boundedBytes} from './auth.mjs';
export const API='https://api.tech.ec.europa.eu/search-api/prod/rest/search';
export const DOC='https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis';
const TOPIC='https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/';
export const PROFILES=Object.freeze({
  'wpa-journal':'research dissemination',
  'ohrid-2027':'education cooperation',
  'wpa-academy':'adult education',
  'wpa-institute':'research networks',
  'ai-advokat':'access to justice',
  'medicaremk':'digital health',
  'health-mediation':'health equity',
  'mission-alexander':'educational games',
  'path-freedom':'cultural heritage',
  'ai-protocol':'artificial intelligence governance'
});
const first=v=>Array.isArray(v)?v[0]:v;
const clean=(v,n)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n):'';
function rawDate(v){const x=first(v);return typeof x==='string'&&/^\d{4}-\d{2}-\d{2}(?:T[0-9:.+-]+Z?)?$/.test(x)&&Number.isFinite(Date.parse(x))?x:null;}
export function candidates(payload){
  if(!payload||!Array.isArray(payload.results))throw Error('unexpected EC result shape');
  const seen=new Set(),items=[];
  for(const r of payload.results.slice(0,50)){
    if(!r||typeof r!=='object')continue;
    const m=r.metadata||{},id=clean(first(m.identifier),120);
    if(!/^[A-Z0-9][A-Z0-9._-]{2,119}$/i.test(id)||seen.has(id.toUpperCase()))continue;
    const title=clean(first(m.title)||r.title,500);
    if(!title)continue;
    seen.add(id.toUpperCase());
    items.push({topicIdentifier:id,title,officialTopicLink:TOPIC+encodeURIComponent(id),
      statusCode:clean(String(first(m.status)??''),30)||null,
      deadlineCandidate:rawDate(m.deadlineDate),openingCandidate:rawDate(m.startDate),
      status:'DISCOVERY_CANDIDATE',eligibility:'UNVERIFIED',requiresExactOfficialCallReview:true});
  }
  if(payload.results.length&&items.length===0)throw Error('EC result fields unrecognised');
  return items;
}
export async function searchRadar(profile,fetcher=fetch,now=Date.now()){
  if(!Object.hasOwn(PROFILES,profile))throw Error('unknown profile');
  const url=new URL(API);
  url.searchParams.set('apiKey','SEDIA');url.searchParams.set('text',PROFILES[profile]);
  url.searchParams.set('pageSize','25');url.searchParams.set('pageNumber','1');
  // EC-documented grants/proposals filter. Preserve status codes as source metadata; do not infer status from codes.
  const query={bool:{must:[{terms:{type:['1','2','8']}},{terms:{status:['31094501','31094502','31094503']}}]}};
  const form=new FormData();
  form.append('query',new Blob([JSON.stringify(query)],{type:'application/json'}),'query.json');
  form.append('languages',new Blob(['["en"]'],{type:'application/json'}),'languages.json');
  form.append('displayLanguage',new Blob(['"en"'],{type:'application/json'}),'displayLanguage.json');
  const response=await fetcher(url.toString(),{method:'POST',body:form,redirect:'error',signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('EC Search API unavailable');
  const bytes=await boundedBytes(response,2*1024*1024);
  const rows=candidates(JSON.parse(new TextDecoder().decode(bytes)));
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  return {schema:'wpa-eu-radar-candidates/1',status:'DISCOVERY_ONLY_NOT_ELIGIBILITY_VERIFIED',profile,
    query:PROFILES[profile],retrievedAt:new Date(now).toISOString(),source:API,sourceDocumentation:DOC,
    responseSha256:hash,rawResponseArchived:false,scope:'Single bounded result page; not an exhaustive search. Status/date fields require confirmation against official call package.',items:rows,
    canonicalRegistryUpdated:false,submissionAuthorised:false,humanGate:'HOLD'};
}

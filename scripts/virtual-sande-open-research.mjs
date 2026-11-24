/**
 * WPA Open Research Foraging v0.1 — OpenAlex metadata/abstract discovery.
 * This is NOT full text access, a rights grant, peer review or autonomous
 * publication. Records are only candidates for human-verifiable research.
 */
export const OA_API='https://api.openalex.org/works';
export const OA_FIELDS='id,title,doi,type,publication_year,authorships,open_access,best_oa_location,abstract_inverted_index,is_retracted';
export const OA_TYPES=Object.freeze(['all','article','book']);
export const OA_THEMES=Object.freeze({
 protocol:'diplomatic protocol ceremonial precedence',
 diplomacy:'diplomacy diplomatic practice international relations',
 public_relations:'public relations strategic institutional communication',
 security:'security studies event security crisis management',
 communicology:'communicology communication theory public communication',
 ai:'artificial intelligence governance human oversight'
});
export const RIGHTS={
 CONFIRMED_REUSE:'LICENSE_ASSERTED_REUSE_REVIEW_NEEDED',
 RESTRICTED_REUSE:'OPEN_READ_NOT_CLEAR_FOR_REPUBLICATION',
 UNKNOWN:'OPEN_READ_LICENSE_UNCONFIRMED'
};
const MAX_RESULTS=15;
function compact(v,max=220){return typeof v==='string'?v.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';}
export function validateSearchQuery(q){
 if(typeof q!=='string')throw new Error('OA_QUERY_INVALID');
 const clean=compact(q,160);
 if(clean.length<4||clean.length>160||/[\u0000-\u001f\u007f<>]/.test(q)||q.length>250)
   throw new Error('OA_QUERY_INVALID');
 return clean;
}
export function legalHttpsUrl(value){
 try{
  const url=new URL(value);
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash ||
     !url.hostname.includes('.')||url.hostname==='localhost'||
     /(^|\.)local$/.test(url.hostname)||url.hostname.endsWith('.internal')||
     /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)||url.hostname.includes(':'))
    return null;
  return url.href.slice(0,600);
 }catch{return null;}
}
export function doiURL(value){
 if(!value)return null;
 const raw=compact(value,220);
 const suffix=raw.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,'');
 if(!/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(suffix))return null;
 return 'https://doi.org/'+suffix;
}
function reconstructedAbstract(inverted){
 if(!inverted||typeof inverted!=='object'||Array.isArray(inverted))return '';
 let entries=0;
 const tokens=[];
 for(const [word,positions] of Object.entries(inverted)){
  if(++entries>1200||!Array.isArray(positions)||positions.length>1000)return '';
  const clean=compact(word,65);
  if(!clean)continue;
  for(const p of positions){
   if(!Number.isInteger(p)||p<0||p>2000)continue;
   tokens.push([p,clean]);
   if(tokens.length>2400)return '';
  }
 }
 tokens.sort((a,b)=>a[0]-b[0]);
 const words=[],positions=new Set();
 for(const [p,t] of tokens){
  if(positions.has(p))continue;
  positions.add(p);words.push(t);
 }
 return compact(words.join(' '),900);
}
export function reusePolicy(license){
 const l=compact(license,70).toLowerCase().replace(/_/g,'-');
 if(['cc0','cc-0','public-domain','cc-by','cc-by-sa','cc-by-4.0','cc-by-sa-4.0'].includes(l))
   return RIGHTS.CONFIRMED_REUSE;
 if(l)return RIGHTS.RESTRICTED_REUSE;
 return RIGHTS.UNKNOWN;
}
export function normaliseOpenAlexWork(raw){
 if(!raw||typeof raw!=='object'||raw.is_retracted===true||raw.open_access?.is_oa!==true)return null;
 const id=typeof raw.id==='string'&&/^https:\/\/openalex\.org\/W\d+$/.test(raw.id)?raw.id:null;
 const title=compact(raw.title,280);
 if(!id||!title||!['article','book'].includes(raw.type))return null;
 const best=raw.best_oa_location;
 const licence=compact(best?.license||'',70)||null;
 const download=best?.is_oa===true?legalHttpsUrl(best?.pdf_url):null;
 const landing=legalHttpsUrl(best?.landing_page_url)||legalHttpsUrl(raw.open_access?.oa_url)||id;
 const authors=Array.isArray(raw.authorships)?raw.authorships
  .slice(0,8).map(a=>compact(a?.author?.display_name,90)).filter(Boolean):[];
 const year=Number.isInteger(raw.publication_year)&&raw.publication_year>=1500&&
   raw.publication_year<=2200?raw.publication_year:null;
 const abstract=reconstructedAbstract(raw.abstract_inverted_index);
 const licenceStatus=reusePolicy(licence);
 return {
   id,title,doi:doiURL(raw.doi),type:raw.type,year,authors,
   provider:'OpenAlex',source_url:landing,openalex_url:id,
   oa_status:compact(raw.open_access?.oa_status,20)||'unknown',
   licence,rights_status:licenceStatus,
   open_pdf_url:download,
   allowed_fulltext_import:!!download&&licenceStatus===RIGHTS.CONFIRMED_REUSE,
   abstract_excerpt:abstract,
   evidence_scope:abstract?'ABSTRACT_EXCERPT_ONLY':'BIBLIOGRAPHIC_METADATA_ONLY',
   fulltext_processed:false,
   status:'DISCOVERED_OPEN_ACCESS_CANDIDATE_NOT_VERIFIED',
   editorial_human_gate:true
 };
}
export function normaliseOpenAlexPage(page,{type='all',perPage=10,query=''}={}){
 if(!page||typeof page!=='object'||!Array.isArray(page.results))throw new Error('OA_BAD_PROVIDER_RESPONSE');
 const seen=new Set(),items=[];
 for(const raw of page.results.slice(0,60)){
  const record=normaliseOpenAlexWork(raw);
  if(!record||(type!=='all'&&record.type!==type))continue;
  const key=(record.doi||record.id).toLowerCase();
  if(seen.has(key))continue;
  seen.add(key);items.push(record);
  if(items.length>=Math.min(MAX_RESULTS,perPage))break;
 }
 return {
   status:'METADATA_DISCOVERY_NOT_FULLTEXT',query:compact(query,160),
   fetched_at_utc:new Date().toISOString(),
   count:items.length,works:items,
   scope:'OpenAlex search results only. Not all open books or papers; not full-text retrieval or source authenticity verification.',
   rights_notice:'OA is not a blanket copyright licence. Only explicit licence claims permit consideration of reuse; verify terms at the original source.',
   provider:'OpenAlex',human_review_required:true
 };
}
export function buildOpenAlexURL({query,type='all',perPage=10,key=null}={}){
 const q=validateSearchQuery(query);
 if(!OA_TYPES.includes(type)||!Number.isInteger(perPage)||perPage<1||perPage>MAX_RESULTS)
  throw new Error('OA_SEARCH_FILTER_INVALID');
 const u=new URL(OA_API);
 u.searchParams.set('search',q);
 u.searchParams.set('filter','open_access.is_oa:true'+(type==='all'?',type:article|book':',type:'+type));
 u.searchParams.set('per_page',String(perPage));
 u.searchParams.set('select',OA_FIELDS);
 if(typeof key==='string'&&key.length>10&&key.length<250)u.searchParams.set('api_key',key);
 return u;
}
export function candidateToDocument(item){
 const work=normaliseOpenAlexWork(item);
 if(!work)throw new Error('OA_NOT_APPROVED_SOURCE');
 if(!work.abstract_excerpt||work.abstract_excerpt.length<25)
   throw new Error('OA_NO_ABSTRACT_TO_ANALYSE');
 const source='OpenAlex record '+work.id+' | '+(work.doi||'DOI UNVERIFIED')+' | '+
    (work.year||'YEAR UNVERIFIED')+' | '+work.source_url;
 return {name:work.title+'.openalex-abstract.txt',format:'txt',segments:[
  {locator:'S1',text:source+'; METADATA ONLY, NOT ORIGINAL SOURCE TEXT.'},
  {locator:'S2',text:work.abstract_excerpt}
 ],metadata:{title:work.title,year:work.year,authors:work.authors,
   doi:work.doi,source_url:work.source_url,licence:work.licence,
   provenance:'DISCOVERED_METADATA_NEEDS_VERIFICATION'}};
}

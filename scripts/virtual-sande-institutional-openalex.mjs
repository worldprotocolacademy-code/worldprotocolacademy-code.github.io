/* WPA Institutional Evidence Router v0.1.
 * Discovery is separate from proven affiliation. Directory inclusion and
 * official websites do NOT establish publication authorship or reuse licences.
 */
import {getWpaInstitution,institutionResearchGate} from './virtual-sande-institutional-directory.mjs';
import {OA_FIELDS,normaliseOpenAlexPage,legalHttpsUrl,validateSearchQuery} from './virtual-sande-open-research.mjs';
export const INSTITUTIONAL_LIMITS=Object.freeze({candidateCount:8,workCount:10,bytesPerResponse:800000});
const OA='https://api.openalex.org';
export function institutionId(raw){
 const match=String(raw||'').match(/^(?:https:\/\/openalex\.org\/)?(I\d{4,18})$/);
 return match?match[1]:null;
}
export function normaliseInstitutionName(s){
 return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/&/g,' and ').replace(/[^a-zA-Z0-9]+/g,' ').toLowerCase()
  .replace(/^the /,'').replace(/\s+/g,' ').trim();
}
function host(u){
 const link=legalHttpsUrl(u);
 if(!link)return null;
 try{return new URL(link).hostname.replace(/^www\./,'').toLowerCase();}catch{return null;}
}
function sameHost(a,b){
 if(!a||!b)return false;
 // A subdomain of the other institution's *registered* host may be evidence
 // but does not constitute accreditation, IP ownership or author affiliation.
 return a===b||(a.endsWith('.'+b)&&b.split('.').length>=2)||
   (b.endsWith('.'+a)&&a.split('.').length>=2);
}
export function requireCanonicalInstitution(id){
 const record=getWpaInstitution(id),gate=institutionResearchGate(record);
 if(gate!=='OPENALEX_AFFILIATION_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW')
  throw new Error(gate);
 return record;
}
export function buildInstitutionSearchUrl(record,{apiKey}={}){
 const r=requireCanonicalInstitution(record?.id);
 const u=new URL(OA+'/institutions');
 u.searchParams.set('search',r.name.slice(0,140));
 u.searchParams.set('per_page',String(INSTITUTIONAL_LIMITS.candidateCount));
 u.searchParams.set('select','id,display_name,country_code,ror,homepage_url,works_count');
 if(typeof apiKey==='string'&&apiKey.length>10&&apiKey.length<250)u.searchParams.set('api_key',apiKey);
 return u;
}
export function resolveInstitutionCandidates(record,raw){
 const src=requireCanonicalInstitution(record?.id);
 if(!raw||!Array.isArray(raw.results))throw new Error('OA_BAD_INSTITUTIONS');
 const name=normaliseInstitutionName(src.name);
 const website=host(src.website),seen=new Set(),matches=[];
 for(const entry of raw.results.slice(0,INSTITUTIONAL_LIMITS.candidateCount)){
  const id=institutionId(entry?.id);
  if(!id||seen.has(id))continue;
  seen.add(id);
  const display=String(entry?.display_name||'').trim().slice(0,180);
  if(!display)continue;
  const homepage=legalHttpsUrl(entry.homepage_url);
  const exact=normaliseInstitutionName(display)===name;
  const sameHomepage=sameHost(website,host(homepage));
  matches.push({
    openalex_id:id,
    name:display,country_code:/^[A-Z]{2}$/.test(entry.country_code)?entry.country_code:null,
    ror:typeof entry.ror==='string'&&/^https:\/\/ror\.org\/[a-z0-9]{9}$/.test(entry.ror)?entry.ror:null,
    homepage_url:homepage,
    works_count:Number.isInteger(entry.works_count)?entry.works_count:null,
    signals:{exact_name:exact,matching_homepage:sameHomepage},
    selectable_for_provisional_research:exact||sameHomepage,
    identity_status:'OPENALEX_INSTITUTION_CANDIDATE_HUMAN_CONFIRMATION_PENDING'
  });
 }
 return {institution:{
   id:src.id,name:src.name,country:src.country,group:src.group,
   verification_status:src.institution_status,website:src.website,
   role:src.role},matches,
   claimed_matches:matches.filter(x=>x.selectable_for_provisional_research).length,
   status:'INSTITUTION_IDENTITY_MATCHES_NOT_INDEPENDENTLY_VERIFIED',
   human_review_required:true
 };
}
export function buildInstitutionWorksUrl({openalexId,question,type='all',apiKey=null}={}){
 const selected=institutionId(openalexId);
 if(!selected)throw new Error('OA_INSTITUTION_ID_INVALID');
 const query=validateSearchQuery(question);
 if(!['all','article','book'].includes(type))throw new Error('OA_WORK_TYPE_INVALID');
 const u=new URL(OA+'/works');
 u.searchParams.set('search',query);
 u.searchParams.set('filter','institutions.id:'+selected+',open_access.is_oa:true'+
  (type==='all'?',type:article|book':',type:'+type));
 u.searchParams.set('per_page',String(INSTITUTIONAL_LIMITS.workCount));
 u.searchParams.set('select',OA_FIELDS);
 if(typeof apiKey==='string'&&apiKey.length>10&&apiKey.length<250)u.searchParams.set('api_key',apiKey);
 return u;
}
export function normaliseInstitutionWorks(page,{institution,match,question,type='all'}={}){
 if(!match?.selectable_for_provisional_research)throw new Error('OA_IDENTITY_REVIEW_REQUIRED');
 if(!page||!Array.isArray(page.results))throw new Error('OA_BAD_WORKS_RESPONSE');
 const oaId='https://openalex.org/'+match.openalex_id;
 // Provider may truncate large author lists. Missing affiliation in returned
 // authorships means the excerpt is held back instead of being misattributed.
 const verifiedByProvider=page.results.filter(work=>
  Array.isArray(work?.authorships)&&work.authorships.some(author=>
   Array.isArray(author?.institutions)&&author.institutions.some(inst=>
    inst?.id===oaId||inst?.id===match.openalex_id)));
 const base=normaliseOpenAlexPage({results:verifiedByProvider},{query:question,type,perPage:INSTITUTIONAL_LIMITS.workCount});
 return {...base,
   works:base.works.map(w=>({...w,
     wpa_institution_id:institution.id,
     openalex_institution_id:match.openalex_id,
     attribution_scope:'OPENALEX_INDEXED_AUTHOR_AFFILIATION_NOT_INDEPENDENTLY_VERIFIED',
     fulltext_processed:false})),
   institution:{id:institution.id,name:institution.name,country:institution.country,
     master_verification:institution.institution_status,
     affiliation_source:'OpenAlex metadata candidate (not institutional confirmation)'},
   match:{openalex_id:match.openalex_id,name:match.name,
     identity_status:'PROVISIONAL_OPENALEX_ENTITY_MATCH'},
   status:'INSTITUTIONAL_OA_ABSTRACT_CANDIDATES_HUMAN_REVIEW_REQUIRED',
   coverage_note:'Only the OA search results with matching returned authorship institution IDs were kept; incomplete indexing and truncated author lists may omit valid works. No official institutional publication claim.',
   human_review_required:true
 };
}

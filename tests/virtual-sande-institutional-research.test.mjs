import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WPA_INSTITUTIONS,WPA_REV7_EXPECTED,getWpaInstitution,
  filterWpaInstitutions,institutionResearchGate,verifyRev7Projection}
 from '../scripts/virtual-sande-institutional-directory.mjs';
import {normaliseInstitutionName,expectedCountryCode,
  requireCanonicalInstitution,buildInstitutionSearchUrl,resolveInstitutionCandidates,
  buildInstitutionWorksUrl,normaliseInstitutionWorks}
 from '../scripts/virtual-sande-institutional-openalex.mjs';
import {institutionLookup,institutionWorks}
 from '../workers/virtual-sande-multimodal-pilot/src/institutional-research-gateway.mjs';

const master=JSON.parse(readFileSync('data/global-institutions/v1.0-corrected-4f-rev7/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json','utf8'));
const B=getWpaInstitution('B034');
const candidate={
 id:'https://openalex.org/I12345678',
 display_name:B.name,country_code:'BE',
 ror:'https://ror.org/01a2b3c4d',homepage_url:'https://egmontinstitute.be',
 works_count:120
};
const paper={
 id:'https://openalex.org/W12345678',title:'The Diplomatic Protocol Research Agenda',
 doi:'https://doi.org/10.1000/academic.protocol',type:'article',publication_year:2026,
 authorships:[{author:{display_name:'Independent Scholar'},institutions:[{
   id:'https://openalex.org/I12345678',display_name:B.name
 }]}],
 open_access:{is_oa:true,oa_status:'gold',oa_url:'https://journals.example.org/paper'},
 best_oa_location:{is_oa:true,license:'cc-by',landing_page_url:'https://journals.example.org/paper'},
 abstract_inverted_index:{
   Diplomatic:[0],protocol:[1],involves:[2],ceremony:[3],precedence:[4],institutional:[5],
   communication:[6],and:[7],the:[8],human:[9],responsibility:[10],for:[11],
   public:[12],events:[13],in:[14],complex:[15],international:[16],settings:[17]
 },
 is_retracted:false
};
test('project every REV7 source faithfully without treating website links as OA rights',()=>{
 assert.equal(WPA_INSTITUTIONS.length,250);
 assert.equal(WPA_INSTITUTIONS.filter(x=>x.id!=='R001').length,249);
 assert.equal(WPA_INSTITUTIONS.filter(x=>x.website).length,243);
 assert.equal(WPA_REV7_EXPECTED.unique_external_methodological,241);
 assert.equal(verifyRev7Projection(master),true);
 assert.equal(getWpaInstitution('B034').name,'Egmont — Royal Institute for International Relations');
});
test('audit aliases, cooperation observations, historical records, WPA internal and missing links fail closed',()=>{
 assert.equal(institutionResearchGate(getWpaInstitution('A010')),'AUDIT_CHILD_RESOLVE_CANONICAL_PARENT');
 assert.equal(institutionResearchGate(getWpaInstitution('A038')),'AUDIT_CHILD_RESOLVE_CANONICAL_PARENT');
 assert.equal(institutionResearchGate(getWpaInstitution('B008')),'OBSERVATION_NOT_A_VERIFIED_INSTITUTION');
 assert.equal(institutionResearchGate(getWpaInstitution('A035')),'HISTORICAL_NO_AUTOMATIC_CURRENT_IDENTITY');
 assert.equal(institutionResearchGate(getWpaInstitution('R001')),'INTERNAL_WPA_NOT_EXTERNAL_SOURCE');
 assert.equal(institutionResearchGate(getWpaInstitution('C011')),'SOURCE_WEBSITE_UNRESOLVED');
 assert.equal(institutionResearchGate(getWpaInstitution('B034')),'OPENALEX_AFFILIATION_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW');
 assert.throws(()=>requireCanonicalInstitution('A010'),/AUDIT_CHILD/);
 assert.throws(()=>requireCanonicalInstitution('B008'),/OBSERVATION/);
 assert.throws(()=>requireCanonicalInstitution('R001'),/INTERNAL/);
 assert.throws(()=>requireCanonicalInstitution('FOO'),/NOT_IN_REV7/);
});
test('client can find any institution but source status is not reclassified by search',()=>{
 assert.ok(filterWpaInstitutions('Egmont').some(x=>x.id==='B034'));
 assert.ok(filterWpaInstitutions('National Defense').some(x=>x.id==='D026'));
 assert.ok(filterWpaInstitutions('A010').some(x=>x.role==='AUDIT_CHILD'));
});
test('provider institution lookup uses fixed API, ID not inferred from name',()=>{
 const u=buildInstitutionSearchUrl(B);
 assert.equal(u.origin,'https://api.openalex.org');
 assert.equal(u.pathname,'/institutions');
 assert.ok(u.searchParams.get('search')?.includes('Egmont'));
 assert.ok(u.searchParams.get('per_page')==='8');
 const r=resolveInstitutionCandidates(B,{results:[candidate]});
 assert.equal(r.matches.length,1);
 assert.equal(r.matches[0].signals.exact_name,true);
 assert.equal(r.matches[0].signals.country_match,true);
 assert.equal(r.matches[0].selectable_for_provisional_research,true);
 assert.match(r.status,/NOT_INDEPENDENTLY_VERIFIED/);
});
test('wrong country and unrelated names cannot be selected even when provider includes them',()=>{
 const r=resolveInstitutionCandidates(B,{results:[
  {...candidate,id:'https://openalex.org/I99999',country_code:'FR'},
  {...candidate,id:'https://openalex.org/I88888',display_name:'Unrelated Center',homepage_url:'https://unrelated.example.org/'}
 ]});
 assert.equal(r.matches[0].signals.country_match,false);
 assert.equal(r.matches[0].selectable_for_provisional_research,false);
 assert.equal(r.matches[1].selectable_for_provisional_research,false);
 assert.equal(expectedCountryCode('Belgium'),'BE');
 assert.equal(expectedCountryCode('United Kingdom'),'GB');
 assert.equal(expectedCountryCode('Hungary / Malta'),null);
 assert.equal(normaliseInstitutionName('ÉGМONT'),normaliseInstitutionName('ÉGМONT'));
});
test('works route applies exact institution ID, OA only, and type filter',()=>{
 const url=buildInstitutionWorksUrl({openalexId:'I12345678',question:'diplomatic protocol',type:'article'});
 assert.equal(url.origin,'https://api.openalex.org');
 assert.match(url.searchParams.get('filter'),/institutions.id:I12345678/);
 assert.match(url.searchParams.get('filter'),/open_access.is_oa:true/);
 assert.match(url.searchParams.get('filter'),/type:article/);
 assert.throws(()=>buildInstitutionWorksUrl({openalexId:'https://evil.invalid',question:'diplomacy'}),/OA_INSTITUTION_ID_INVALID/);
});
test('evidence keeps only OA papers with exact indexed institutional authorship',()=>{
 const match=resolveInstitutionCandidates(B,{results:[candidate]}).matches[0];
 const output=normaliseInstitutionWorks({results:[paper,
  {...paper,id:'https://openalex.org/W99999999',doi:'https://doi.org/10.1000/other',
   authorships:[{institutions:[{id:'https://openalex.org/I11111111'}]}]},
  {...paper,id:'https://openalex.org/W9999',doi:'https://doi.org/10.1000/retracted',is_retracted:true}
 ]},{institution:B,match,question:'protocol and diplomacy'});
 assert.equal(output.count,1);
 assert.equal(output.works[0].wpa_institution_id,'B034');
 assert.equal(output.works[0].fulltext_processed,false);
 assert.match(output.works[0].attribution_scope,/NOT_INDEPENDENTLY_VERIFIED/);
 assert.match(output.coverage_note,/No official institutional publication claim/);
});
test('provider fails closed and never calls works on mismatched institution ID',async()=>{
 let calls=0;
 const fetchFn=async(url)=>{
  calls++;
  return Response.json({results:[candidate]});
 };
 const no=await institutionWorks({id:'B034',openalexId:'I88888',question:'protocol and diplomacy',fetchFn});
 assert.equal(no.http_status,409);
 assert.equal(no.error,'OA_IDENTITY_REVIEW_REQUIRED');
 assert.equal(calls,1);
 const child=await institutionLookup({id:'A010',fetchFn});
 assert.equal(child.http_status,422);
 assert.equal(calls,1);
});
test('valid lookup plus works takes two official calls and preserves source scope',async()=>{
 const calls=[];
 const fetchFn=async(url)=>{
  const u=new URL(url);calls.push(u.pathname);
  assert.equal(u.origin,'https://api.openalex.org');
  return Response.json(u.pathname==='/institutions'?{results:[candidate]}:{results:[paper]});
 };
 const lookup=await institutionLookup({id:'B034',fetchFn});
 assert.equal(lookup.http_status,200);
 assert.equal(lookup.matches[0].selectable_for_provisional_research,true);
 const works=await institutionWorks({id:'B034',openalexId:'I12345678',
  question:'protocol diplomacy',fetchFn});
 assert.equal(works.http_status,200);
 assert.equal(works.count,1);
 assert.equal(works.fulltext_downloaded,false);
 assert.equal(works.model_invoked,false);
 assert.deepEqual(calls,['/institutions','/institutions','/works']);
});
console.log('Institutional Source Intelligence REV7/affiliation evidence tests registered');

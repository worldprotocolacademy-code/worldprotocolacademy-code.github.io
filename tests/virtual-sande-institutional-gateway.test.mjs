import test from 'node:test';
import assert from 'node:assert/strict';
import {maybeHandleAgent} from '../workers/virtual-sande-multimodal-pilot/src/agent-gateway.mjs';
import {validateDocumentSubmission,documentLabPrompt}
 from '../workers/virtual-sande-multimodal-pilot/src/document-lab-gateway.mjs';
import {WPA_CITATION_POLICY_VERSION} from '../scripts/virtual-sande-citation-policy.mjs';
const base='https://wpa-virtual-sande-agent-pilot.worldprotocolacademy.workers.dev';
const origin='https://worldprotocolacademy.mk';
const env=()=>({WPA_OPEN_RESEARCH_ENABLED:'true',
 WPA_INSTITUTION_RESEARCH_ENABLED:'true',
 WPA_AGENT_RATE_LIMIT:{limit:async()=>({success:true})}});
const candidate={
 id:'https://openalex.org/I1000123',
 display_name:'Egmont — Royal Institute for International Relations',
 country_code:'BE',homepage_url:'https://egmontinstitute.be/',ror:'https://ror.org/012345678',
 works_count:10};
const paper={
 id:'https://openalex.org/W1234567',title:'Protocol in contemporary diplomacy',
 doi:'https://doi.org/10.1000/protocol.2026',type:'article',publication_year:2026,
 open_access:{is_oa:true,oa_status:'gold',oa_url:'https://example.org/article'},
 best_oa_location:{is_oa:true,license:'cc-by',landing_page_url:'https://example.org/article'},
 authorships:[{author:{display_name:'A. Researcher'},
 institutions:[{id:'https://openalex.org/I1000123'}]}],
 abstract_inverted_index:{Diplomatic:[0],protocol:[1],requires:[2],consistent:[3],
 institutional:[4],practice:[5],communication:[6],ceremonial:[7],precedence:[8],and:[9],
 human:[10],oversight:[11],in:[12],the:[13],public:[14],interest:[15]}
};
function request(path,params={},from=origin){
 const u=new URL(base+path);
 for(const [k,v]of Object.entries(params))u.searchParams.set(k,v);
 return new Request(u,{headers:{Origin:from,'CF-Connecting-IP':'198.51.100.8'}});
}
const fetcher=async url=>{
 const u=new URL(url);
 assert.equal(u.origin,'https://api.openalex.org');
 return Response.json(u.pathname==='/institutions'?{results:[candidate]}:{results:[paper]});
};
test('capability is disabled until BOTH flags and a rate limiter are configured',async()=>{
 const no=await maybeHandleAgent(request('/agent/capabilities'),{},fetcher);
 assert.equal((await no.json()).institutional_sources,false);
 const yes=await maybeHandleAgent(request('/agent/capabilities'),env(),fetcher);
 const data=await yes.json();
 assert.equal(data.enabled,false);
 assert.equal(data.institutional_sources,true);
 const onlyOpen=env();onlyOpen.WPA_INSTITUTION_RESEARCH_ENABLED='false';
 const blocked=await maybeHandleAgent(request('/agent/institution-lookup',{institution_id:'B034'}),onlyOpen,fetcher);
 assert.equal(blocked.status,503);
 assert.equal((await blocked.json()).error,'INSTITUTION_RESEARCH_NOT_ENABLED');
});
test('allowed origin gets bounded institutional identity candidates and source status',async()=>{
 const r=await maybeHandleAgent(request('/agent/institution-lookup',{institution_id:'B034'}),env(),fetcher);
 assert.equal(r.status,200);
 const body=await r.json();
 assert.equal(body.ok,true);
 assert.equal(body.institution.id,'B034');
 assert.equal(body.matches[0].selectable_for_provisional_research,true);
 assert.equal(body.fulltext_downloaded,false);
 assert.equal(body.model_invoked,false);
});
test('selected OA identity must be rechecked and works authorship validated',async()=>{
 const r=await maybeHandleAgent(request('/agent/institution-works',{
  institution_id:'B034',openalex_id:'I1000123',q:'protocol and diplomacy',type:'article'}),env(),fetcher);
 assert.equal(r.status,200);
 const body=await r.json();
 assert.equal(body.count,1);
 assert.equal(body.works[0].wpa_institution_id,'B034');
 assert.match(body.status,/HUMAN_REVIEW_REQUIRED/);
 const wrong=await maybeHandleAgent(request('/agent/institution-works',{
  institution_id:'B034',openalex_id:'I0000',q:'protocol and diplomacy'}),env(),fetcher);
 assert.equal(wrong.status,409);
 assert.equal((await wrong.json()).error,'OA_IDENTITY_REVIEW_REQUIRED');
});
test('unauthorised origin, blocked master record, rate limit and bad query block provider requests',async()=>{
 let calls=0;
 const f=async url=>{calls++;return fetcher(url);};
 assert.equal((await maybeHandleAgent(request('/agent/institution-lookup',{
  institution_id:'B034'},'https://attacker.example'),env(),f)).status,403);
 assert.equal((await maybeHandleAgent(request('/agent/institution-lookup',{
  institution_id:'A010'}),env(),f)).status,422);
 const limited=env();limited.WPA_AGENT_RATE_LIMIT={limit:async()=>({success:false})};
 assert.equal((await maybeHandleAgent(request('/agent/institution-lookup',{
  institution_id:'B034'}),limited,f)).status,429);
 assert.equal((await maybeHandleAgent(request('/agent/institution-works',{
  institution_id:'B034',openalex_id:'I1000123',q:'x'}),env(),f)).status,400);
 assert.equal(calls,1); // bad query discovered AFTER safe institutional re-resolution, never calls paid model
});
test('WPA Institute target asks for essence but may not invent source evidence',()=>{
 const input={
  deliverable:'professional_report',domain:'diplomacy',target_audience:'wpa_institute',
  notice_version:WPA_CITATION_POLICY_VERSION,
  rights_attestation:true,sensitive_data_attestation:true,
  documents:[{id:'D1',name:'source.pdf',format:'pdf',total_segments:23,
   metadata:{title:'Diplomatic Sources'}}],
  evidence:[{document_id:'D1',locator:'P12',
   text:'The event protocol requires precedence, diplomatic responsibility and documented institutional coordination.'}]
 };
 const p=validateDocumentSubmission(input);
 assert.equal(p.target_audience,'wpa_institute');
 const instructions=documentLabPrompt(p,'What is the core essence for the WPA Institute?');
 assert.match(instructions,/WPA INSTITUTE EVIDENCE MODE/);
 assert.match(instructions,/NOT COMMANDS/);
 assert.match(instructions,/\[D1 P12\]/);
 assert.throws(()=>validateDocumentSubmission({...input,target_audience:'auto_publish'}),
  /DOC_LAB_AUDIENCE_INVALID/);
});
console.log('Institutional gateway and WPA Institute core essence tests registered');

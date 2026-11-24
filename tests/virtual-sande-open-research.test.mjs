import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOpenAlexURL,legalHttpsUrl,normaliseOpenAlexPage,
  candidateToDocument,reusePolicy,RIGHTS,normaliseOpenAlexWork,
  OA_THEMES} from '../scripts/virtual-sande-open-research.mjs';
import {discoverOpenResearch} from '../workers/virtual-sande-multimodal-pilot/src/open-research-gateway.mjs';
import {buildOpenResearchSnapshot} from '../scripts/wpa-open-research-snapshot.mjs';

const work={
 id:'https://openalex.org/W12345678',title:'Diplomatic protocol and global communication',
 doi:'https://doi.org/10.1000/diplomacy.12',type:'article',publication_year:2025,
 authorships:[{author:{display_name:'Alex Example'}},{author:{display_name:'B. Scholar'}}],
 open_access:{is_oa:true,oa_status:'gold',oa_url:'https://open.example.org/article'},
 best_oa_location:{is_oa:true,license:'cc-by',landing_page_url:'https://open.example.org/article',
   pdf_url:'https://open.example.org/article.pdf'},
 abstract_inverted_index:{Diplomatic:[0],protocol:[1],connects:[2],communication:[3],
   public:[4],diplomacy:[5],with:[6],careful:[7],institutional:[8],practice:[9],
   and:[10],respect:[11],for:[12],official:[13],symbols:[14]},
 is_retracted:false
};
const sample=()=>({results:[work,{...work,id:'https://openalex.org/W12345679',
  doi:'https://doi.org/10.1000/diplomacy.13',type:'book',
  title:'Diplomacy and Protocol Monograph',best_oa_location:{is_oa:true,license:null,landing_page_url:'https://books.example.org/title'}}]});
test('API search is fixed to OpenAlex, OA-only and selected types',()=>{
 const u=buildOpenAlexURL({query:'Diplomacy & Protocol',type:'all',perPage:8});
 assert.equal(u.origin,'https://api.openalex.org');
 assert.match(u.searchParams.get('filter'),/open_access\.is_oa:true/);
 assert.match(u.searchParams.get('filter'),/article\|book/);
 assert.equal(u.searchParams.get('search'),'Diplomacy & Protocol');
 assert.throws(()=>buildOpenAlexURL({query:'a'}),/OA_QUERY_INVALID/);
 assert.throws(()=>buildOpenAlexURL({query:'protocol',type:'anything'}),/OA_SEARCH_FILTER_INVALID/);
});
test('original links are HTTPS; deny localhost, IP and injected credentials',()=>{
 assert.equal(legalHttpsUrl('http://example.org/x'),null);
 assert.equal(legalHttpsUrl('https://127.0.0.1/admin'),null);
 assert.equal(legalHttpsUrl('https://localhost/admin'),null);
 assert.equal(legalHttpsUrl('https://admin:pass@host.example/secret'),null);
 assert.match(legalHttpsUrl('https://books.example.org/title'),/^https:/);
});
test('discover open papers and books as candidates, never marked full text',()=>{
 const page=normaliseOpenAlexPage(sample(),{query:'diplomacy',perPage:10});
 assert.equal(page.count,2);
 assert.equal(page.works[0].type,'article');
 assert.equal(page.works[0].rights_status,RIGHTS.CONFIRMED_REUSE);
 assert.equal(page.works[0].allowed_fulltext_import,true);
 assert.equal(page.works[0].fulltext_processed,false);
 assert.equal(page.works[0].evidence_scope,'ABSTRACT_EXCERPT_ONLY');
 assert.equal(page.works[1].type,'book');
 assert.equal(page.works[1].rights_status,RIGHTS.UNKNOWN);
 assert.equal(page.works[1].allowed_fulltext_import,false);
 assert.equal(page.status,'METADATA_DISCOVERY_NOT_FULLTEXT');
});
test('retracted and closed works never enter candidate set',()=>{
 assert.equal(normaliseOpenAlexWork({...work,is_retracted:true}),null);
 assert.equal(normaliseOpenAlexWork({...work,open_access:{is_oa:false}}),null);
 assert.equal(normaliseOpenAlexPage({results:[work,work]},{query:'diplomacy'}).count,1);
 assert.equal(reusePolicy('cc-by-nc-nd'),RIGHTS.RESTRICTED_REUSE);
});
test('source metadata and short abstract form local evidence, not a full book',()=>{
 const record=normaliseOpenAlexPage({results:[work]},{query:'diplomacy'}).works[0];
 const d=candidateToDocument(record);
 assert.equal(d.format,'txt');
 assert.equal(d.segments[0].locator,'S1');
 assert.equal(d.segments[1].locator,'S2');
 assert.match(d.segments[0].text,/NOT ORIGINAL SOURCE TEXT/);
 assert.equal(d.metadata.doi,'https://doi.org/10.1000/diplomacy.12');
});
test('official API is only invoked by bounded discovery; 429 fails closed',async()=>{
 let called=0;const fetchFn=async url=>{
  called++;assert.match(url,/^https:\/\/api\.openalex\.org\/works\?/);
  return new Response(JSON.stringify(sample()),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const result=await discoverOpenResearch({query:'diplomacy and protocol',fetchFn});
 assert.equal(result.status,200);
 assert.equal(result.ok,true);
 assert.equal(result.fulltext_downloaded,false);
 assert.equal(result.paid_ai_called,false);
 assert.equal(called,1);
 const failed=await discoverOpenResearch({query:'diplomatic protocol',fetchFn:async()=>new Response('',{status:429})});
 assert.equal(failed.status,503);
 assert.equal(failed.error,'OA_PROVIDER_RATE_LIMITED');
 const bad=await discoverOpenResearch({query:'',fetchFn});
 assert.equal(bad.status,400);
});
test('weekly six-topic research produces review-only metadata snapshot',async()=>{
 let calls=0;
 const snap=await buildOpenResearchSnapshot({
  now:new Date('2026-11-24T12:00:00Z'),
  pause:async()=>{},
  fetchFn:async()=>{
   calls++;return new Response(JSON.stringify(sample()),{status:200});
  }
 });
 assert.equal(calls,Object.keys(OA_THEMES).length);
 assert.equal(snap.topics.length,6);
 assert.equal(snap.candidate_count,2);
 assert.equal(snap.limits.full_text_downloaded,false);
 assert.equal(snap.limits.ai_generated_content,false);
 assert.match(snap.status,/EDITORIAL_CANDIDATES/);
});
test('weekly provider failure does not create a fabricated success snapshot',async()=>{
 let calls=0;
 await assert.rejects(buildOpenResearchSnapshot({
  pause:async()=>{},
  fetchFn:async()=>{calls++;return new Response('',{status:calls===2?503:200});}
 }),/OA_SNAPSHOT_PROVIDER_FAILED/);
 assert.equal(calls,2);
});
console.log('Open Research Foraging metadata, rights and snapshot tests registered');

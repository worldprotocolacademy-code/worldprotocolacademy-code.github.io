import test from 'node:test';
import assert from 'node:assert/strict';
import {maybeHandleAgent} from '../workers/virtual-sande-multimodal-pilot/src/agent-gateway.mjs';
const HOST='https://wpa-virtual-sande-agent-pilot.worldprotocolacademy.workers.dev';
const ORIGIN='https://worldprotocolacademy.mk';
const env=()=>({WPA_OPEN_RESEARCH_ENABLED:'true',
 WPA_AGENT_RATE_LIMIT:{limit:async()=>({success:true})}});
const work={
 id:'https://openalex.org/W1234',title:'Protocol and Diplomacy',
 type:'book',publication_year:2026,
 authorships:[{author:{display_name:'Example Author'}}],
 open_access:{is_oa:true,oa_url:'https://books.example.org/123',oa_status:'gold'},
 best_oa_location:{is_oa:true,license:'cc-by',landing_page_url:'https://books.example.org/123'},
 abstract_inverted_index:{Diplomacy:[0],and:[1],protocol:[2],require:[3],
   careful:[4],cultural:[5],and:[6],institutional:[7],practice:[8]}
};
function req(query='protocol and diplomacy',origin=ORIGIN,method='GET'){
 const url=new URL(HOST+'/agent/open-research');
 url.searchParams.set('q',query);url.searchParams.set('type','all');
 return new Request(url,{method,headers:{
  Origin:origin,'CF-Connecting-IP':'198.51.100.2'
 }});
}
const upstream=async url=>{
 assert.equal(new URL(url).host,'api.openalex.org');
 return new Response(JSON.stringify({results:[work]}),{status:200});
};
test('Open Research stays off when not explicitly enabled',async()=>{
 const r=await maybeHandleAgent(req(),{},upstream);
 assert.equal(r.status,503);
 assert.equal((await r.json()).error,'OA_NOT_ENABLED');
});
test('Open Research uses independent capability flag, no paid OpenAI readiness',async()=>{
 const caps=await maybeHandleAgent(new Request(HOST+'/agent/capabilities',{
  headers:{Origin:ORIGIN}
 }),env(),upstream);
 const data=await caps.json();
 assert.equal(data.enabled,false);
 assert.equal(data.open_research,true);
});
test('valid allowed-origin query yields metadata-only book candidates',async()=>{
 let calls=0;const fetchFn=async url=>{calls++;return upstream(url);};
 const r=await maybeHandleAgent(req(),env(),fetchFn);
 assert.equal(r.status,200);
 const data=await r.json();
 assert.equal(data.ok,true);
 assert.equal(data.count,1);
 assert.equal(data.works[0].type,'book');
 assert.equal(data.works[0].fulltext_processed,false);
 assert.equal(data.fulltext_downloaded,false);
 assert.equal(data.paid_ai_called,false);
 assert.equal(calls,1);
});
test('requests from unknown origin, missing client context or depleted rate limit fail shut',async()=>{
 const bad=await maybeHandleAgent(req('protocol','https://evil.test'),env(),upstream);
 assert.equal(bad.status,403);
 const absent=await maybeHandleAgent(new Request(HOST+'/agent/open-research?q=protocol',{
  headers:{Origin:ORIGIN}
 }),env(),upstream);
 assert.equal(absent.status,403);
 const limited=env();limited.WPA_AGENT_RATE_LIMIT={limit:async()=>({success:false})};
 assert.equal((await maybeHandleAgent(req(),limited,upstream)).status,429);
 const noBinding=env();delete noBinding.WPA_AGENT_RATE_LIMIT;
 assert.equal((await maybeHandleAgent(req(),noBinding,upstream)).status,503);
});
test('no arbitrary method or unbounded query gets through to upstream',async()=>{
 const e=env();let called=0;
 const f=async()=>{called++;return upstream('https://api.openalex.org/works');};
 assert.equal((await maybeHandleAgent(req('protocol',ORIGIN,'POST'),e,f)).status,405);
 assert.equal((await maybeHandleAgent(req('ab'),e,f)).status,400);
 assert.equal((await maybeHandleAgent(req('protocol<secret>'),e,f)).status,400);
 assert.equal(called,0);
});
console.log('Open Research pilot route contract registered');

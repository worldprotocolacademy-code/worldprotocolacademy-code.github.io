import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorker,MAX_IMAGE_BYTES} from '../tools/virtual-sande/wpa-private-workspace-pilot.mjs';
import {createPrivateSite} from '../workers/virtual-sande-private-pilot/src/index.mjs';
import {createPrivateWorkspaceClient} from '../scripts/virtual-sande-private-workspace-client.mjs';
const origin='https://pilot.example.test', question='Compare flags', vision='@cf/meta/llama-3.2-11b-vision-instruct';
function fixture(){
 const calls=[];
 const env={PILOT_ENABLED:'true',PILOT_ORIGIN:origin,VISION_MODEL:vision,SYNTHESIS_MODEL:'fixture-model',EVIDENCE_RECEIPT_KEY:'synthetic-test-key-not-for-production-1234',PILOT_RATE_LIMIT:{limit:async()=>({success:true})},CORPUS_ENABLED:'true',AI_SEARCH_NAME:'protocol-ai-v4-final',
 FILE_SAFETY:{fetch:async()=>{calls.push(['scan']);return Response.json({clean:true,format_valid:true});}},
 AI:{run:async(model,input)=>{calls.push(['model',model,input]);return {response:model===vision?JSON.stringify({observations:['A striped flag on viewer left'],uncertainties:['Identity uncertain'],visible_text:[]}):'Provisional synthesis of the evidence.'};},toMarkdown:async()=>{calls.push(['convert']);return {format:'markdown',data:'Fixture extracted text.'};},autorag:name=>({search:async args=>{calls.push(['corpus',name,args]);return {data:[{filename:'fixture.md',score:0.9,content:[{text:'Public protocol excerpt.'}]}]};}})}};
 return {env,calls,worker:createWorker({authorize:async()=> 'tester-A'})};
}
function request(path,body,consent=true,site=origin){
 const headers={Origin:site};if(consent)headers['X-WPA-Consent']='document-processing';
 if(!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body);}
 return new Request(origin+'/private-api/'+path,{method:'POST',headers,body});
}
async function convert(f,name,body,q=question){
 const form=new FormData();form.append('file',new File([body],name));form.append('question',q);
 const r=await f.worker.fetch(request('convert',form),f.env);const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d.document;
}
async function analyze(f,docs,extra={}){return f.worker.fetch(request('analyze',{question,documents:docs,...extra}),f.env);}
const png=Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGMQ0fYCAADgAIoJue1gAAAAAElFTkSuQmCC'),x=>x.charCodeAt(0));
test('disabled, unauthenticated, wrong origin, absent consent and absent rate limit fail closed',async()=>{
 const f=fixture(),r=()=>request('analyze',{question});
 assert.equal((await f.worker.fetch(r(),{...f.env,PILOT_ENABLED:'false'})).status,503);
 assert.equal((await createWorker({authorize:async()=>false}).fetch(r(),f.env)).status,401);
 assert.equal((await f.worker.fetch(request('analyze',{question},true,'https://other.test'),f.env)).status,403);
 assert.equal((await f.worker.fetch(request('analyze',{question},false),f.env)).status,403);
 assert.equal((await f.worker.fetch(r(),{...f.env,PILOT_RATE_LIMIT:null})).status,503);
 assert.equal((await f.worker.fetch(r(),{...f.env,PILOT_RATE_LIMIT:{limit:async()=>({success:false})}})).status,429);
 assert.equal(f.calls.length,0);
});
test('actual image data URI goes to vision adapter after scan, not markdown converter',async()=>{
 const f=fixture(),d=await convert(f,'flags.png',png);
 assert.equal(d.method,'vision_observation_not_verified_ocr');assert.equal(d.sha256.length,64);assert.ok(d.receipt);
 assert.equal(f.calls[0][0],'scan');assert.equal(f.calls[1][1],vision);
 assert.equal(f.calls[1][2].image,'data:image/png;base64,'+btoa(String.fromCharCode(...png)));
 const r=await analyze(f,[d]);assert.equal(r.status,200);const v=await r.json();
 assert.equal(v.coverage[0].sha256,d.sha256);assert.equal(v.coverage[0].selected_chars,d.text.length);
 assert.equal(v.corpus_status,'not_requested');
});
test('binary conversion requires scanner, and rejected file never calls model',async()=>{
 const f=fixture();f.env.FILE_SAFETY=null;
 const form=new FormData();form.append('file',new File([png],'flags.png'));form.append('question',question);
 assert.equal((await f.worker.fetch(request('convert',form),f.env)).status,503);
 assert.equal(f.calls.length,0);
});
test('PDF and DOCX use conversion after scan; text formats do not call provider',async()=>{
 const f=fixture();for(const [name,bytes] of [['a.pdf','%PDF-1.7 fixture'],['b.docx',new Uint8Array([80,75,3,4,1])]])assert.equal((await convert(f,name,bytes)).method,'provider_extraction_not_page_verified');
 for(const [name,body] of [['a.md','# test'],['a.csv','a,b\n1,2'],['a.json','{"a":1}'],['a.txt','test']])assert.equal((await convert(f,name,body)).method,'utf8_text');
 assert.deepEqual(f.calls.map(x=>x[0]),['scan','convert','scan','convert']);
});
test('tampered, expired, other principal and changed image question receipts rejected',async()=>{
 const f=fixture(),d=await convert(f,'flags.png',png);
 for(const changed of [{...d,text:'fabricated'},{...d,issued_at:Date.now()-3*3600000},{...d,sha256:'0'.repeat(64)}])assert.equal((await analyze(f,[changed])).status,422);
 assert.equal((await analyze(f,[d],{question:'Different question'})).status,422);
 const other={...f,worker:createWorker({authorize:async()=> 'tester-B'})};assert.equal((await analyze(other,[d])).status,422);
});
test('20 signed documents covered with bounded excerpts; 21 denied',async()=>{
 const f=fixture(),docs=[];
 for(let i=0;i<20;i++)docs.push(await convert(f,'doc'+i+'.md','Flag protocol evidence '.repeat(600)));
 const r=await analyze(f,docs);assert.equal(r.status,200);const data=await r.json();assert.equal(data.coverage.length,20);
 assert.ok(data.coverage.reduce((n,d)=>n+d.selected_chars,0)<=40000);assert.equal((await analyze(f,[...docs,docs[0]])).status,400);
});
test('corpus receives only separately consented public query',async()=>{
 const f=fixture(),d=await convert(f,'PRIVATE_NAME.md','PRIVATE_FIXTURE_CONTENT');
 assert.equal((await analyze(f,[d],{publicCorpusQuery:'public flag protocol'})).status,403);
 const r=await analyze(f,[d],{publicCorpusQuery:'public flag protocol',corpusConsent:true,history:[{role:'user',content:'PRIVATE_HISTORY'}]});assert.equal(r.status,200);
 const calls=f.calls.filter(x=>x[0]==='corpus');assert.equal(calls.length,1);assert.equal(calls[0][2].query,'public flag protocol');
 assert.doesNotMatch(JSON.stringify(calls),/PRIVATE_/);assert.equal((await r.json()).corpus[0].id,'WPA-1');
});
test('protected assets denied without auth, no-store and self-only connection policy',async()=>{
 const f=fixture(),req=new Request(origin+'/');
 assert.equal((await createPrivateSite({authorize:async()=>false}).fetch(req,f.env)).status,401);
 const site=createPrivateSite({authorize:async()=> 'tester-A'});
 const res=await site.fetch(req,{...f.env,ASSETS:{fetch:async r=>{assert.equal(r.headers.has('Cookie'),false);return new Response('fixture');}}});
 assert.equal(res.status,200);assert.match(res.headers.get('Cache-Control'),/no-store/);assert.match(res.headers.get('Content-Security-Policy'),/connect-src 'self'/);
});
test('client cannot route private requests off origin',async()=>{
 const c=createPrivateWorkspaceClient({origin,configuredPath:'https://other.test/private-api',fetcher:async()=>assert.fail('network')});
 assert.equal(c.configured,false);await assert.rejects(()=>c.analyze({question}),/NOT_CONFIGURED/);
});

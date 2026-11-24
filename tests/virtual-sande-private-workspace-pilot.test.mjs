import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorker,convertFile,selectEvidence,MAX_FILES,MAX_FILE_BYTES} from '../tools/virtual-sande/wpa-private-workspace-pilot.mjs';
import {createPrivateWorkspaceClient} from '../scripts/virtual-sande-private-workspace-client.mjs';

const origin='https://pilot.example.test';
const model={run:async(_name,args)=>({response:args.messages[0].content.startsWith('Suggest')?'["One?","Two?","Three?"]':'Evidence-based working answer [d1, 0-12].'})};
const env={PILOT_ENABLED:'true',PILOT_ORIGIN:origin,SYNTHESIS_MODEL:'test-model',AI:model};
const worker=createWorker({authorize:async()=>true});
function request(path,body,{consent=true,site=origin,method='POST'}={}){
 const headers={'Origin':site};
 if(consent)headers['X-WPA-Consent']='document-processing';
 if(!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body);}
 return new Request(origin+'/private'+path,{method,headers,body:method==='POST'?body:undefined});
}
function file(name,body,mime='text/plain'){return new File([body],name,{type:mime});}
const docs=n=>Array.from({length:n},(_,i)=>({id:'d'+(i+1),name:'document-'+(i+1)+'.md',text:'Flag protocol evidence '+i+'\n'+('irrelevant example '.repeat(500)),method:'utf8_text'}));

test('disabled by default, even with valid auth',async()=>{
 const r=await worker.fetch(request('/analyze',{question:'test'}),{...env,PILOT_ENABLED:'false'});
 assert.equal(r.status,503);
});
test('denies absent auth and wrong origin',async()=>{
 const noAuth=createWorker({authorize:async()=>false});
 assert.equal((await noAuth.fetch(request('/analyze',{question:'test'}),env)).status,401);
 assert.equal((await worker.fetch(request('/analyze',{question:'test'},{site:'https://other.example'}),env)).status,403);
});
test('default access verifier fails closed without configured issuer',async()=>{
 assert.equal((await createWorker().fetch(request('/analyze',{question:'test'}),env)).status,401);
});
test('denies absent explicit processing consent',async()=>{
 assert.equal((await worker.fetch(request('/analyze',{question:'test'},{consent:false}),env)).status,403);
});
test('reads TXT, Markdown, CSV and JSON as UTF-8',async()=>{
 for(const [name,body] of [['test.txt','Здраво'],['test.md','# Test'],['test.csv','a,b\n1,2'],['test.json','{"a":1}']]){
  const result=await convertFile(file(name,body),env);assert.equal(result.text,body);assert.equal(result.method,'utf8_text');
 }
});
test('rejects bad JSON, empty, oversized and unsupported files',async()=>{
 for(const [f,code] of [[file('bad.json','{'), 'INVALID_UTF8_OR_JSON'],[file('empty.txt',''),'EMPTY_FILE'],[file('fake.exe','x'),'UNSUPPORTED_FORMAT'],[file('fake.pdf','x'),'FORMAT_MISMATCH']]){
  await assert.rejects(()=>convertFile(f,env),e=>e.code===code);
 }
 await assert.rejects(()=>convertFile({name:'oversized.pdf',size:MAX_FILE_BYTES+1},env),e=>e.code==='FILE_TOO_LARGE');
});
test('real binary input requires configured scanning',async()=>{
 await assert.rejects(()=>convertFile(file('test.pdf','%PDF-1.7 test','application/pdf'),env),e=>e.code==='BINARY_SAFETY_SERVICE_REQUIRED');
});
test('PDF and DOCX conversion provider invoked only after scan; image output not OCR',async()=>{
 const mock={...env,FILE_SAFETY:{fetch:async()=>Response.json({clean:true,format_valid:true})},AI:{toMarkdown:async()=>({format:'markdown',data:'Extracted pilot fixture'})}};
 for(const f of [file('test.pdf','%PDF-1.7 test'),file('test.docx',new Uint8Array([80,75,3,4,0])),file('test.jpg',new Uint8Array([255,216,255,0])),file('test.png',new Uint8Array([137,80,78,71,13,10,26,10,0]))]){
  const d=await convertFile(f,mock);assert.equal(d.text,'Extracted pilot fixture');
  assert.equal(d.method,/jpe?g|png/i.test(f.name)?'image_description_not_verified_ocr':'provider_extraction_not_page_verified');
 }
});
test('conversion rejects unsafe scan result',async()=>{
 const mock={...env,FILE_SAFETY:{fetch:async()=>Response.json({clean:false,format_valid:true})},AI:{toMarkdown:async()=>{throw Error('must not run');}}};
 await assert.rejects(()=>convertFile(file('test.pdf','%PDF-1.7 test'),mock),e=>e.code==='FILE_SAFETY_REJECTED');
});
test('one file per conversion request',async()=>{
 const form=new FormData();form.append('file',file('a.md','alpha'));form.append('file',file('b.md','beta'));
 assert.equal((await worker.fetch(request('/convert',form),env)).status,400);
 const single=new FormData();single.append('file',file('a.md','alpha'));
 const data=await(await worker.fetch(request('/convert',single),env)).json();assert.equal(data.document.text,'alpha');
});
test('all 20 documents represented and excerpt coverage bounded; 21 rejected',()=>{
 const evidence=selectEvidence(docs(MAX_FILES),'flag protocol');
 assert.equal(evidence.length,20);
 assert.ok(evidence.every(x=>x.selected_chars>0&&x.selected_chars<=2000));
 assert.ok(evidence.reduce((n,x)=>n+x.selected_chars,0)<=40000);
 assert.throws(()=>selectEvidence(docs(21),'flag'),e=>e.code==='DOCUMENT_LIMIT');
});
test('no page claims in evidence ranges, duplicate IDs rejected',()=>{
 assert.equal(selectEvidence([{id:'a',name:'a.txt',text:'short',method:'utf8_text'}],'short')[0].coverage,'complete_extracted_text');
 assert.throws(()=>selectEvidence([{id:'a',name:'a.txt',text:'short'},{id:'a',name:'b.txt',text:'duplicate'}],'short'),e=>e.code==='DOCUMENT_ID_INVALID');
});
test('analyze returns real coverage and no public fallback',async()=>{
 const r=await worker.fetch(request('/analyze',{question:'flag protocol',documents:docs(20),lang:'en'}),env);
 assert.equal(r.status,200);const data=await r.json();
 assert.equal(data.coverage.length,20);assert.match(data.answer,/Evidence-based/);
 assert.ok(data.limitations.includes('private_pilot_no_public_corpus_ingestion'));
});
test('model suggestions use submitted question, return exactly three strings',async()=>{
 const r=await worker.fetch(request('/suggest',{question:'flag protocol',history:[],lang:'en'}),env);
 assert.equal(r.status,200);assert.deepEqual((await r.json()).suggestions,['One?','Two?','Three?']);
});
test('unconfigured model fails explicitly',async()=>{
 const r=await worker.fetch(request('/analyze',{question:'flag protocol',documents:[]}),{...env,SYNTHESIS_MODEL:''});
 assert.equal(r.status,503);
});
test('client rejects cross-origin config; same-origin mock requests carry consent',async()=>{
 const bad=createPrivateWorkspaceClient({origin,configuredPath:'https://other.example/private',fetcher:async()=>{throw Error('must not fetch');}});
 assert.equal(bad.configured,false);
 await assert.rejects(()=>bad.analyze({question:'x'}),/PRIVATE_PILOT_NOT_CONFIGURED/);
 let captured;
 const good=createPrivateWorkspaceClient({origin,configuredPath:'/private',fetcher:async(url,options)=>{captured={url,options};return Response.json({answer:'Test',coverage:[]});}});
 assert.equal(good.configured,true);
 await good.analyze({question:'x',documents:[],history:[],lang:'en'});
 assert.equal(captured.url,origin+'/private/analyze');
 assert.equal(captured.options.credentials,'same-origin');
 assert.equal(captured.options.headers['X-WPA-Consent'],'document-processing');
});


// Exercise the actual checked-in public transport, without mounting the UI or
// making network requests. The probe exists only in this test VM.
async function loadPublicTransport(fetcher){
 const {readFile}=await import('node:fs/promises');
 const {runInNewContext}=await import('node:vm');
 const source=await readFile(new URL('../scripts/virtual-sande-public-widget.js',import.meta.url),'utf8');
 const anchor="  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });";
 assert.ok(source.includes(anchor),'public transport probe anchor');
 const timers=new Map();let seq=0;
 const window={location:{pathname:'/'},setTimeout:(fn,ms)=>{const id=++seq;timers.set(id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
 const sandbox={window,document:{readyState:'loading',addEventListener(){}},AbortController,fetch:fetcher};
 runInNewContext(source.replace(anchor,'  globalThis.__transportProbe = {callEndpoint};\n'+anchor),sandbox);
 return {callEndpoint:sandbox.__transportProbe.callEndpoint,timers};
}
test('public transport retains the canonical 15-second deadline and cleans up after success',async()=>{
 let requestSignal;let deadlineSeen=false;
 const transport=await loadPublicTransport(async(_url,opts)=>{
  requestSignal=opts.signal;
  deadlineSeen=[...transport.timers.values()].some(t=>t.ms===15000);
  return {ok:true,json:async()=>({answer:'ok'})};
 });
 const response=await transport.callEndpoint('https://example.invalid/ask',{message:'test'},new AbortController().signal);
 assert.equal(response.answer,'ok');
 assert.equal(deadlineSeen,true);
 assert.equal(requestSignal.aborted,false);
 assert.equal([...transport.timers.values()].some(t=>t.ms===15000),false);
});
for(const mode of ['deadline','user-abort']){
 test('public transport '+mode+' cancels a pending JSON body and clears its timer',async()=>{
  const user=new AbortController();let bodyStarted;
  const ready=new Promise(resolve=>{bodyStarted=resolve;});
  const transport=await loadPublicTransport(async(_url,opts)=>({
   ok:true,json:()=>new Promise((_resolve,reject)=>{
    opts.signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});
    bodyStarted();
   })
  }));
  const request=transport.callEndpoint('https://example.invalid/ask',{message:'test'},user.signal);
  const rejection=assert.rejects(request,/aborted/);
  await ready;
  const timer=[...transport.timers.values()].find(t=>t.ms===15000);
  assert.ok(timer,'deadline must remain active while JSON is pending');
  if(mode==='deadline')timer.fn();else user.abort();
  await rejection;
  assert.equal([...transport.timers.values()].some(t=>t.ms===15000),false);
 });
}

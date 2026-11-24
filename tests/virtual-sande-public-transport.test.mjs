import test from 'node:test';
import assert from 'node:assert/strict';
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



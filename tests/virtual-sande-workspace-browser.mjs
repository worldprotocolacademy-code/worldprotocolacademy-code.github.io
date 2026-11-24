// Real Chrome UI acceptance using loopback HTTPS, synthetic documents and mock providers.
// No public network/model calls, no real microphone, no deployment. Test-only server.
import {createServer} from 'node:https';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {Readable} from 'node:stream';
import {createWorker} from '../tools/virtual-sande/wpa-private-workspace-pilot.mjs';

const browser=process.env.CHROME_BIN||'google-chrome';
const root=process.cwd();
const temp=await mkdtemp(join(tmpdir(),'wpa-vs-browser-'));
let server;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const worker=createWorker({authorize:async()=>true}); // test only; real Access not exercised
let origin;
const config=()=>({
 PILOT_ENABLED:'true',PILOT_ORIGIN:origin,SYNTHESIS_MODEL:'TEST_ONLY',
 AI:{run:async(_model,args)=>({response:args.messages[0].content.startsWith('Suggest')?'["Which sources?","Which limits?","What next?"]':'Synthetic document analysis: all inputs were test fixtures.'})},
});
function fixture(privateMode){
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
  (privateMode?'<meta name="wpa-private-workspace-api" content="/private-api">':'')+
  '<title>TEST ONLY - Virtual Sande browser suite</title><script>('+installMocks.toString()+')();</script>'+
  '<script defer src="/scripts/virtual-sande-public-widget.js"></script></head><body><p>TEST ONLY</p><pre id="wpa-browser-test-result">RUNNING</pre><script>('+browserSuite.toString()+')('+JSON.stringify(privateMode)+');</script></body></html>';
}
function installMocks(){
 const originalFetch=window.fetch.bind(window);
 window.testRequests=[];window.publicPending=[];window.speechLog=[];
 window.fetch=(input,options={})=>{
  const url=new URL(typeof input==='string'?input:input.url,location.href);
  if(url.hostname==='wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev'&&url.pathname==='/ask'){
   const question=JSON.parse(options.body).message;
   const req={question,signal:options.signal};window.testRequests.push({type:'public',question});
   // Intentionally allow a cancelled request to settle late, testing stale-output suppression.
   return new Promise(resolve=>window.publicPending.push({...req,resolve:text=>resolve(new Response(JSON.stringify({answer:text}),{headers:{'Content-Type':'application/json'}}))}));
  }
  if(url.origin===location.origin&&url.pathname.startsWith('/private-api/')){
   window.testRequests.push({type:'private',path:url.pathname});
   return originalFetch(input,options);
  }
  if(url.origin===location.origin)return originalFetch(input,options);
  return Promise.reject(new Error('Unexpected network request in isolated browser test'));
 };
 class MockRecognition{
  start(){window.mockRecognition=this;}
  stop(){this.onend?.();}
  abort(){this.onend?.();}
 }
 Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:MockRecognition});
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{lang:'en-GB'}],speak:u=>window.speechLog.push(u.text),cancel:()=>{}}});
 Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:class{constructor(text){this.text=text;}}});
}
async function browserSuite(privateMode){
 const output=document.getElementById('wpa-browser-test-result');
 const checks=[];
 const ok=(condition,label)=>{if(!condition)throw Error(label);checks.push(label);};
 const wait=async(fn,label)=>{for(let i=0;i<240;i++){const v=fn();if(v)return v;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout: '+label);};
 const q=selector=>document.querySelector(selector);
 const byId=id=>document.getElementById(id);
 const type=value=>{const input=byId('wpaPublicVsInput');input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));};
 const send=()=>byId('wpaPublicVsForm').requestSubmit();
 const clear=()=>byId('wpaPublicVsClear').click();
 const action=name=>q('[data-wpa-action="'+name+'"]');
 const messages=()=>[...document.querySelectorAll('.wpa-public-vs-message-text')].map(x=>x.textContent);
 const pause=()=>new Promise(r=>setTimeout(r,120));
 const edit=async(value)=>{
  const edits=[...document.querySelectorAll('.wpa-public-vs-row.user .wpa-public-vs-edit-tools button')];
  edits[edits.length-1].click();
  const area=await wait(()=>q('.wpa-public-vs-edit-field'),'edit field');area.value=value;
  const buttons=[...area.parentNode.querySelectorAll('button')];
  const save=buttons.find(b=>b.textContent==='Save and regenerate');
  if(!save)throw Error('Edit save control missing');
  save.click();
 };
 const drop=files=>{
  const transfer=new DataTransfer();for(const file of files)transfer.items.add(file);
  byId('wpaPublicVsPanel').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
 };
 const count=()=>q('[data-wpa-document-tray] summary')?.textContent||'';
 try{
  await wait(()=>q('[data-wpa-multidoc]')&&q('[data-wpa-proactive]')&&q('[data-wpa-protocol-planner]'),'modules mounted');
  byId('wpaPublicVsFab').click();
  ok(byId('wpaPublicVsPanel').classList.contains('open'),'chat opens');
  q('.wpa-public-vs-expand').click();
  ok(byId('wpaPublicVsPanel').classList.contains('wpa-vs-expanded'),'expand workspace');
  byId('wpaPublicVsInput').scrollIntoView({block:'center'});
  const bounds=byId('wpaPublicVsInput').getBoundingClientRect();
  ok(bounds.width>0&&bounds.top>=0&&bounds.bottom<=innerHeight+2,'composer reachable in viewport');
  type('Explain flag protocol');
  const proposal=await wait(()=>q('[data-wpa-proactive] button'),'local suggestion');
  const prior=byId('wpaPublicVsInput').value;proposal.click();
  ok(byId('wpaPublicVsInput').value.startsWith(prior)&&byId('wpaPublicVsInput').value.length>prior.length,'suggestion appends to draft');
  ok(window.testRequests.length===0,'typing and local suggestions do not send');
  clear();
  action('dictate').click();
  await wait(()=>window.mockRecognition,'recognition started');
  window.mockRecognition.onresult({results:[[{transcript:'Dictated fixture'}]]});
  ok(byId('wpaPublicVsInput').value==='Dictated fixture'&&window.testRequests.length===0,'dictation fills draft only');
  clear();
  if(!privateMode){
   ok(byId('wpaPublicVsModelSuggestions').hidden,'unconfigured model control hidden');
   type('Original question');send();
   await wait(()=>window.publicPending.length===1,'first public request');
   ok(!!q('.wpa-public-vs-working img'),'waiting logo visible');
   await edit('Corrected question');
   await wait(()=>window.publicPending.length===2,'revised public request');
   ok(window.publicPending[0].signal.aborted,'edit aborts previous transport');
   window.publicPending[1].resolve('Corrected response');await wait(()=>messages().includes('Corrected response'),'corrected response');
   window.publicPending[0].resolve('STALE response');await pause();
   ok(!messages().includes('STALE response'),'late stale response ignored');
   ok(!!q('.wpa-public-vs-duration')&&!q('.wpa-public-vs-working'),'elapsed duration displayed; logo removed');
   await edit('Final correction');await wait(()=>window.publicPending.length===3,'edit after answer');
   window.publicPending[2].resolve('Final response');await wait(()=>messages().includes('Final response'),'regenerated response');
   ok(!messages().includes('Corrected response'),'previous branch removed');
   action('read').click();ok(window.speechLog.at(-1)==='Final response','voice reads answer only');
   type('Stop example');send();await wait(()=>window.publicPending.length===4,'stop request');
   byId('wpaPublicVsStop').click();
   ok(window.publicPending[3].signal.aborted&&!q('.wpa-public-vs-working'),'stop aborts request and clears waiting');
   window.publicPending[3].resolve('STALE after stop');await pause();
   ok(!messages().includes('STALE after stop'),'stopped answer never appears');
   clear();
   const files=Array.from({length:21},(_,i)=>new File(['fixture '+i],'fixture-'+i+'.md',{type:'text/markdown',lastModified:i+1}));
   drop(files);ok(count().includes('20/20'),'twenty documents accepted; twenty-first excluded');
   ok(q('[data-wpa-document-tray] ul').children.length===20,'exactly twenty rows');
   type('Read my documents');const before=window.testRequests.length;send();await pause();
   ok(window.testRequests.length===before,'unconfigured document question blocked, no public upload');
   ok(action('process-documents').hidden,'private processing disabled on public surface');
   clear();ok(count().includes('0/20'),'clear removes attachments');
  }else{
   const formats=['txt','md','csv','json'];
   const files=Array.from({length:20},(_,i)=>{
    const ext=formats[i%4],body=ext==='json'?JSON.stringify({fixture:i}):ext==='csv'?'key,value\nfixture,'+i:'synthetic text '+i;
    return new File([body],'fixture-'+i+'.'+ext,{lastModified:i+1});
   });
   drop(files);ok(count().includes('20/20'),'private tray holds 20 synthetic documents');
   ok(action('process-documents').disabled,'explicit consent required');
   const consent=q('[data-wpa-document-tray] input[type=checkbox]');consent.click();
   action('process-documents').click();
   await wait(()=>count().includes('20 extracted'),'all twenty conversions');
   ok(window.testRequests.filter(r=>r.path==='/private-api/convert').length===20,'twenty isolated conversions');
   type('Analyze all twenty fixtures');send();
   await wait(()=>messages().some(x=>x.includes('Synthetic document analysis')),'private model response');
   const answer=messages().at(-1);
   ok(files.every(f=>answer.includes(f.name)),'all twenty coverage entries visible');
   ok(window.testRequests.every(r=>r.type==='private'),'no public fallback or upload');
   byId('wpaPublicVsModelSuggestions').click();
   const model=await wait(()=>q('[data-wpa-model-suggestions] button'),'private model suggestions');
   type('Keep my draft');model.click();
   ok(byId('wpaPublicVsInput').value.startsWith('Keep my draft\n'),'model suggestion preserves draft');
   consent.click();
   const before=window.testRequests.length;type('No consent');send();await pause();
   ok(window.testRequests.length===before,'withdrawal prevents another request');
   ok(count().includes('0 extracted'),'withdrawal clears extracted texts');
   clear();ok(count().includes('0/20'),'private clear removes all documents');
   type('Public again');send();await wait(()=>window.publicPending.length===1,'new public conversation after clear');
   window.publicPending[0].resolve('Public response');await wait(()=>messages().includes('Public response'),'public recovery');
  }
  output.textContent=JSON.stringify({pass:true,checks});output.dataset.status='pass';
 }catch(e){output.textContent=JSON.stringify({pass:false,checks,error:String(e.stack||e)});output.dataset.status='fail';}
}

async function runCase(name,path,width,height){
 const profile=join(temp,'chrome-'+name);
 const child=spawn(browser,['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--ignore-certificate-errors','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size='+width+','+height,origin+path],{stdio:['ignore','ignore','ignore']});
 let ws;
 try{
  let port;
  for(let i=0;i<100;i++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];if(port)break;}catch{}await delay(100);}
  if(!port)throw Error('Chrome debugging port not available: '+name);
  let target;
  for(let i=0;i<100;i++){try{const list=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();target=list.find(x=>x.type==='page'&&x.url.startsWith(origin+path));if(target)break;}catch{}await delay(100);}
  if(!target)throw Error('Chrome fixture target missing: '+name);
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true});});
  let seq=0;
  function cdp(method,params={}){
   const id=++seq;
   return new Promise((res,rej)=>{
    const timeout=setTimeout(()=>{ws.removeEventListener('message',handler);rej(Error('CDP timeout '+method));},8000);
    function handler(event){const d=JSON.parse(event.data);if(d.id!==id)return;clearTimeout(timeout);ws.removeEventListener('message',handler);d.error?rej(Error(JSON.stringify(d.error))):res(d.result);}
    ws.addEventListener('message',handler);ws.send(JSON.stringify({id,method,params}));
   });
  }
  // Real viewport emulation, including narrow mobile layout.
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});
  for(let i=0;i<240;i++){
   const r=await cdp('Runtime.evaluate',{expression:"document.querySelector('#wpa-browser-test-result')?.textContent",returnByValue:true});
   const raw=r?.result?.value;
   if(raw&&raw!=='RUNNING'){
    const result=JSON.parse(raw);if(!result.pass)throw Error(name+': '+JSON.stringify(result));
    console.log('PASS '+name+' ('+result.checks.length+' checks): '+result.checks.join('; '));return;
   }
   await delay(150);
  }
  throw Error('Browser acceptance timed out: '+name);
 }finally{ws?.close();child.kill('SIGTERM');await delay(200);}
}
try{
 const key=join(temp,'key.pem'),cert=join(temp,'cert.pem');
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost'],{stdio:'ignore'});
 server=createServer({key:await readFile(key),cert:await readFile(cert)},async(req,res)=>{
  try{
   const url=new URL(req.url,origin||'https://127.0.0.1');
   if(url.pathname==='/public-fixture'||url.pathname==='/private-fixture'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(fixture(url.pathname==='/private-fixture'));
   }
   if(url.pathname.startsWith('/private-api/')){
    const r=await worker.fetch(new Request(origin+req.url,{method:req.method,headers:req.headers,body:Readable.toWeb(req),duplex:'half'}),config());
    res.writeHead(r.status,Object.fromEntries(r.headers));return res.end(Buffer.from(await r.arrayBuffer()));
   }
   if(!/^\/scripts\/[a-zA-Z0-9._-]+\.(js|mjs)$/.test(url.pathname)&&url.pathname!=='/logo.webp'){
    res.writeHead(404);return res.end('Not found');
   }
   const content=await readFile(resolve(root,'.'+url.pathname));
   res.writeHead(200,{'Content-Type':url.pathname.endsWith('.webp')?'image/webp':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(content);
  }catch(e){res.writeHead(500);res.end('TEST FIXTURE ERROR '+String(e.message));}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='https://127.0.0.1:'+server.address().port;
 await runCase('public-desktop','/public-fixture',1000,850);
 await runCase('public-mobile','/public-fixture',390,740);
 await runCase('private-desktop','/private-fixture',1000,850);
 console.log('PASS: real Chromium interaction; synthetic files, mocked AI and voice; no deployment.');
}finally{if(server)await new Promise(r=>server.close(r));await rm(temp,{recursive:true,force:true});}

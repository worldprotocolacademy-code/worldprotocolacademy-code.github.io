// Public phase 1 Chrome acceptance using loopback HTTPS and mock providers.
// No public network/model calls, no real microphone, no deployment. Test-only server.
import {createServer} from 'node:https';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn,execFileSync} from 'node:child_process';

const browser=process.env.CHROME_BIN||'google-chrome';
const root=process.cwd();
const temp=await mkdtemp(join(tmpdir(),'wpa-vs-browser-'));
let server;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let origin;
function fixture(){
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>TEST ONLY - Virtual Sande public phase 1</title><script>('+installMocks.toString()+')();</script>'+
 '<script defer src="/scripts/virtual-sande-public-widget.js"></script></head><body><p>TEST ONLY</p><pre id="wpa-browser-test-result">RUNNING</pre><script>('+browserSuite.toString()+')();</script></body></html>';
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
async function browserSuite(){
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
 try{
  await wait(()=>q('[data-wpa-public-voice]')&&q('[data-wpa-proactive]')&&q('[data-wpa-protocol-planner]'),'modules mounted');
  byId('wpaPublicVsFab').click();
  ok(byId('wpaPublicVsPanel').classList.contains('open'),'chat opens');
  ok(byId('wpaPublicVsPanel').dataset.wpaPublicRelease==='phase1-20261124','phase 1 release marker');
  const planner=q('[data-wpa-protocol-planner]');
  ok(planner.tagName==='DETAILS'&&!planner.open,'planner is collapsed by default');
  planner.querySelector('summary').click();ok(planner.open,'existing planner opens on demand');
  planner.querySelector('summary').click();ok(!planner.open,'existing planner closes');
  ok(!q('[data-wpa-multidoc]')&&!q('input[type=file]')&&!byId('wpaPublicVsModelSuggestions'),'private tools and attachments are absent from public phase 1');
  ok(q('[data-wpa-public-voice]').textContent.includes('Document analysis is not yet available'),'document limitation disclosed');
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
   ok(messages().length===1&&byId('wpaPublicVsInput').value==='','clear restores new conversation');
   ok(window.testRequests.every(r=>r.type==='public'),'all submitted requests used only existing public endpoint');
  output.textContent=JSON.stringify({pass:true,checks});output.dataset.status='pass';
 }catch(e){output.textContent=JSON.stringify({pass:false,checks,error:String(e.stack||e)});output.dataset.status='fail';}
}

async function runCase(name,path,width,height){
 const profile=join(temp,'chrome-'+name);
 const child=spawn(browser,['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--ignore-certificate-errors','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size='+width+','+height,'about:blank'],{stdio:['ignore','ignore','ignore']});
 let ws;
 try{
  let port;
  for(let i=0;i<100;i++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];if(port)break;}catch{}await delay(100);}
  if(!port)throw Error('Chrome debugging port not available: '+name);
  let target;
  for(let i=0;i<100;i++){try{const list=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();target=list.find(x=>x.type==='page'&&x.url==='about:blank');if(target)break;}catch{}await delay(100);}
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
  await cdp('Page.navigate',{url:origin+path});
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
   if(url.pathname==='/public-fixture'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(fixture());
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
 console.log('PASS: real Chromium public phase 1; mocked AI and voice; no deployment.');
}finally{if(server)await new Promise(r=>server.close(r));await rm(temp,{recursive:true,force:true});}

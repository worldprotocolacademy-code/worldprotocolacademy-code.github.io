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
   const payload=JSON.parse(options.body),question=payload.message;
   const req={question,signal:options.signal};window.testRequests.push({type:'public',question,payload});
   // Intentionally allow a cancelled request to settle late, testing stale-output suppression.
   return new Promise(resolve=>window.publicPending.push({...req,resolve:text=>resolve(new Response(JSON.stringify(typeof text==='string'?{answer:text}:text),{headers:{'Content-Type':'application/json'}}))}));
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
  await wait(()=>q('[data-wpa-public-voice]')&&q('[data-wpa-proactive]')&&q('[data-wpa-protocol-planner]')&&q('[data-wpa-local-preview]'),'modules mounted');
  byId('wpaPublicVsFab').click();
  ok(byId('wpaPublicVsPanel').classList.contains('open'),'chat opens');
  ok(byId('wpaPublicVsPanel').dataset.wpaPublicRelease==='phase1-20261124','phase 1 release marker');
  const planner=q('[data-wpa-protocol-planner]');
  ok(planner.tagName==='DETAILS'&&!planner.open,'planner is collapsed by default');
  planner.querySelector('summary').click();ok(planner.open,'existing planner opens on demand');
  planner.querySelector('summary').click();ok(!planner.open,'existing planner closes');
  ok(!q('[data-wpa-multidoc]')&&!byId('wpaPublicVsModelSuggestions'),'private AI tools remain absent');
  const tray=q('[data-wpa-local-preview]');
  ok(tray.querySelector('input[type=file]').multiple,'local file picker supports multiple files');
  ok(tray.textContent.includes('files are not uploaded or read by AI'),'local-only disclosure');
  const fixtureFile=(name,body)=>new File([body],name,{lastModified:1});
  const dropFiles=files=>{const d=new DataTransfer();files.forEach(f=>d.items.add(f));byId('wpaPublicVsPanel').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:d}));};
  const docx=()=>{
   const name=new TextEncoder().encode('word/document.xml');
   const raw=new TextEncoder().encode('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Word fixture</w:t></w:r></w:p></w:body></w:document>');
   const l=new Uint8Array(30),c=new Uint8Array(46),e=new Uint8Array(22);
   const put=(b,p,x,n=4)=>{const v=new DataView(b.buffer);n===2?v.setUint16(p,x,true):v.setUint32(p,x,true);};
   put(l,0,0x04034b50);put(l,18,raw.length);put(l,22,raw.length);put(l,26,name.length,2);
   put(c,0,0x02014b50);put(c,20,raw.length);put(c,24,raw.length);put(c,28,name.length,2);
   put(e,0,0x06054b50);put(e,8,1,2);put(e,10,1,2);put(e,12,c.length+name.length);put(e,16,l.length+name.length+raw.length);
   return new File([l,name,raw,c,name,e],'sample.docx',{lastModified:1});
  };
  const png=Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGMQ0fYCAADgAIoJue1gAAAAAElFTkSuQmCC'),x=>x.charCodeAt(0));
  dropFiles([fixtureFile('sample.pdf','%PDF-1.7'),docx(),fixtureFile('sample.json','{"fixture":true}'),fixtureFile('sample.csv','name,value\nfixture,1'),fixtureFile('sample.md','<b>literal text</b>'),fixtureFile('sample.png',png)]);
  ok(tray.open&&tray.querySelector('summary').textContent.includes('6/20'),'six mixed files visible in tray');
  const openPreview=async(index,selector)=>{
   tray.querySelectorAll('[data-wpa-preview-action=open]')[index].click();
   return wait(()=>tray.querySelector('[data-wpa-preview-content] '+selector),'local preview '+index);
  };
  let p=await openPreview(0,'a[href^="blob:"]');ok(p.target==='_blank'&&p.rel.includes('noopener'),'PDF local browser viewer link');
  p=await openPreview(1,'pre');ok(p.textContent.includes('Word fixture'),'DOCX text preview');
  p=await openPreview(2,'pre');ok(p.textContent.includes('"fixture": true'),'JSON preview');
  p=await openPreview(3,'pre');ok(p.textContent.includes('fixture,1'),'CSV preview');
  p=await openPreview(4,'pre');ok(p.textContent==='<b>literal text</b>'&&!p.querySelector('b'),'Markdown rendered as safe literal text');
  p=await openPreview(5,'img[src^="blob:"]');await wait(()=>p.complete&&p.naturalWidth>0,'image decoded');ok(p.naturalWidth===1,'PNG preview decoded');
  dropFiles(Array.from({length:15},(_,i)=>fixtureFile('extra-'+i+'.txt','fixture')));
  ok(tray.querySelector('summary').textContent.includes('20/20')&&tray.querySelectorAll('[data-wpa-preview-action=open]').length===20,'twenty-file session limit');
  tray.querySelectorAll('[data-wpa-preview-action=remove]')[0].click();
  ok(tray.querySelector('summary').textContent.includes('19/20'),'remove individual file');
  ok(window.testRequests.length===0,'local preview does not call AI');
  clear();ok(tray.querySelector('summary').textContent.includes('0/20')&&tray.querySelector('[data-wpa-preview-content]').hidden,'clear releases all local previews');
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
   const outer=q('.wpa-public-vs-ring.outer'),inner=q('.wpa-public-vs-ring.inner');
   ok(!!outer&&!!inner&&getComputedStyle(outer).animationName==='wpa-vs-rotate'&&getComputedStyle(inner).animationDirection==='reverse','two counter-rotating symmetric rings');
   const a=outer.getBoundingClientRect(),b=inner.getBoundingClientRect();
   ok(Math.abs((a.left+a.right)-(b.left+b.right))<2&&Math.abs((a.top+a.bottom)-(b.top+b.bottom))<2,'rings share one centre');
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
   dropFiles([fixtureFile('private-flag-photo.txt','NEVER_TRANSMIT_ATTACHMENT_FIXTURE')]);
   let confirmations=0;window.confirm=()=>{confirmations++;return false;};
   type('Analyse the attached flag arrangement');send();await pause();
   ok(confirmations===1&&window.publicPending.length===4&&byId('wpaPublicVsInput').value==='Analyse the attached flag arrangement','declined general-only confirmation preserves the unsent draft');
   window.confirm=()=>{confirmations++;return true;};
   send();await wait(()=>window.publicPending.length===5,'explicit general-only send');
   const payload=window.testRequests.at(-1).payload;
   ok(!JSON.stringify(payload).includes('NEVER_TRANSMIT_ATTACHMENT_FIXTURE')&&!JSON.stringify(payload).includes('private-flag-photo.txt'),'attachments never leak into general endpoint');
   window.publicPending[4].resolve({answer:'A general flag arrangement has several context-dependent considerations. When',sources:['Test source only']});
   await wait(()=>messages().some(x=>x.includes('Incomplete answer')),'incomplete answer labelled');
   ok(messages().some(x=>x.includes('General answer — no attachments were analysed.')),'response explicitly excludes local attachments');
   ok(messages().some(x=>x.includes('Sources reported by the service (not independently checked):')&&x.includes('Test source only')),'reported sources visibly distinguished');
   type('A new question');send();await wait(()=>window.publicPending.length===6,'follow-up after incomplete');
   ok(!window.testRequests.at(-1).payload.history.some(x=>x.role==='assistant'&&x.content.includes('considerations. When')),'incomplete answer excluded from later context');
   window.publicPending[5].resolve('Complete answer.');await wait(()=>messages().some(x=>x.includes('Complete answer.')),'complete answer recovered');
   clear();
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

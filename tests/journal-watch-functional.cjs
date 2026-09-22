const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');

test('generator keeps identities through reordering, preserves legacy links, and rejects stale upstream',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'wpa-journal-'));
 try{
 fs.mkdirSync(path.join(dir,'tools/wpa-watch'),{recursive:true});fs.mkdirSync(path.join(dir,'journal/watch'),{recursive:true});
 const write=(p,x)=>fs.writeFileSync(path.join(dir,p),JSON.stringify(x));
 const read=p=>JSON.parse(fs.readFileSync(path.join(dir,p)));
 fs.copyFileSync(path.join(root,'tools/wpa-watch/journal-map.json'),path.join(dir,'tools/wpa-watch/journal-map.json'));
 let items=Array.from({length:45},(_,i)=>({title:`Diplomacy topic ${i}`,link:`https://example.org/${i}`,source:'Source',domain:'diplomacy',isoDate:i?'2026-09-20':null}));
 write('tools/wpa-watch/items.json',items);
 write('tools/wpa-watch/status.json',{generated:new Date().toISOString(),sources_live:25,items_total:45});
 write('journal/watch/topics.json',[{id:'JWT-AUTO-legacy',source_url:items[0].link}]);
 const run=()=>execFileSync(process.execPath,[path.join(root,'generate-journal-watch.mjs')],{cwd:dir,stdio:'pipe'});
 run();const before=read('journal/watch/topics.json');assert.equal(before.length,45);assert.equal(before[0].date,null);assert.equal(before[0].date_basis,'unknown');assert.deepEqual(before[0].legacy_ids,['JWT-AUTO-legacy']);
 write('tools/wpa-watch/items.json',items.reverse());run();const after=read('journal/watch/topics.json');assert.equal(before[0].id,after.at(-1).id);assert.deepEqual(after.at(-1).legacy_ids,['JWT-AUTO-legacy']);
 const output=fs.readFileSync(path.join(dir,'journal/watch/topics.json'),'utf8');
 write('tools/wpa-watch/status.json',{generated:'2000-01-01',sources_live:25,items_total:45});assert.throws(run);assert.equal(fs.readFileSync(path.join(dir,'journal/watch/topics.json'),'utf8'),output);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('editorial UI filters, persists, exports and reports failed reloads without losing work',async()=>{
 const dom=new JSDOM(fs.readFileSync(path.join(root,'journal/watch/index.html'),'utf8'),{url:'https://example.org/journal/watch/',runScripts:'outside-only'});
 const w=dom.window;const topics=[{id:'stable',legacy_ids:['old'],title:'Protocol visit',discipline:'protocol',source:'A',source_url:'https://example.org/a',date:'2026-09-20',status:'detected'},{id:'second',title:'Diplomacy',discipline:'diplomacy',source:'B',source_url:'https://example.org/b',date:'2026-09-19',status:'detected'}];
 let fail=false;let prompted=false;let blob;let download;
 w.localStorage.setItem('wpaJournalWatchStatusV2',JSON.stringify({old:'under review'}));
 w.fetch=async()=>{if(fail)throw new Error('offline');return {ok:true,json:async()=>topics}};
 w.alert=()=>{};w.prompt=()=>{prompted=true};w.navigator.clipboard={writeText:async()=>{throw new Error('denied')}};
 w.URL.createObjectURL=b=>{blob=b;return 'blob:test'};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){download=this.download};
 const script=[...w.document.scripts].find(s=>s.textContent.includes('let allTopics='));w.eval(script.textContent);await new Promise(r=>setTimeout(r,20));
 assert.equal(w.document.querySelectorAll('article.topic').length,2);assert.equal(w.document.querySelector('[data-status-id="stable"]').value,'under review');
 const sel=w.document.querySelector('[data-status-id="stable"]');sel.value='candidate';sel.dispatchEvent(new w.Event('change'));assert.equal(JSON.parse(w.localStorage.getItem('wpaJournalWatchStatusV2')).stable,'candidate');
 const q=w.document.getElementById('q');q.value='Protocol';q.dispatchEvent(new w.Event('input'));assert.equal(w.document.querySelectorAll('article.topic').length,1);
 w.document.getElementById('copyVisibleBtn').click();await new Promise(r=>setTimeout(r,0));assert.equal(prompted,true);
 w.document.getElementById('exportJsonBtn').click();assert.equal(download,'wpa-journal-editorial-queue.json');assert.ok(blob.size>0);
 fail=true;await w.loadTopics();assert.match(w.document.getElementById('status').textContent,/offline.*previously loaded/);assert.equal(w.document.querySelectorAll('article.topic').length,1);
 w.document.getElementById('resetBtn').click();assert.equal(w.document.querySelectorAll('article.topic').length,2);assert.match(w.document.getElementById('status').textContent,/offline/);
 w.close();
});

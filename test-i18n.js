#!/usr/bin/env node
/* WPA i18n both-ways sanity test. Run: node test-i18n.js  (or: npm run test:i18n)
   Loads each main page, applies EN then MK, and confirms tagged text actually
   switches between languages. SITE = cwd, so it runs on any machine. */
const fs=require('fs'),path=require('path');
let JSDOM; try{ ({JSDOM}=require('jsdom')); }catch(e){
  console.error('\n  jsdom is required. Run:  npm install\n'); process.exit(2);
}
const SITE=process.cwd();
const PAGES=[
  {id:'index',file:'index.html'},{id:'institute',file:'institute.html'},
  {id:'programmes',file:'programmes.html'},{id:'certification',file:'certification.html'},
  {id:'wpa-card',file:'wpa-card.html'},{id:'passive-revenue',file:'passive-revenue.html'},
  {id:'wpaws',file:path.join('wpaws','index.html')},
];
function fetchFor(){return u=>{let c=String(u).split('?')[0].replace(/^https?:\/\/[^/]+\//,'').replace(/^\.?\//,'').replace(/^\.\.\//,'');const fp=path.join(SITE,c);
  return new Promise(r=>fs.readFile(fp,'utf8',(e,d)=>e?r({ok:false,status:404,text:()=>Promise.resolve(''),json:()=>Promise.reject(e)}):r({ok:true,status:200,text:()=>Promise.resolve(d),json:()=>Promise.resolve(JSON.parse(d))})));};}
async function load(file){
  const html=fs.readFileSync(path.join(SITE,file),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost:8080/'+file.replace(/\\/g,'/'),pretendToBeVisual:true});
  const {window}=dom; window.fetch=fetchFor();
  if(!window.CustomEvent)window.CustomEvent=function(t,o){return{type:t,detail:(o||{}).detail};};
  if(!window.IntersectionObserver)window.IntersectionObserver=function(){return{observe(){},unobserve(){},disconnect(){}};};
  const loader=fs.readFileSync(path.join(SITE,'wpa-translator.js'),'utf8'); try{window.eval(loader);}catch(e){}
  await new Promise(r=>setTimeout(r,400));
  return window;
}
(async()=>{
  let pass=true;
  for(const p of PAGES){
    const w=await load(p.file);
    const setLang = w.WPASetLanguage ? (l=>w.WPASetLanguage(l)) : (w.setUILang ? (l=>w.setUILang(l)) : null);
    const sample=[...w.document.querySelectorAll('[data-i18n]')].slice(0,40);
    if(!setLang){ console.log(`  FAIL ${p.id} — translator did not initialise`); pass=false; continue; }
    await setLang('en'); const en=sample.map(e=>e.textContent.trim());
    await setLang('mk'); const mk=sample.map(e=>e.textContent.trim());
    const changed=en.filter((t,i)=>t!==mk[i]).length;
    const ok=changed>0;   // at least some tagged text differs between EN and MK
    console.log(`  ${ok?'PASS':'FAIL'} ${p.id} — ${changed}/${sample.length} sampled elements switch between MK/EN`);
    if(!ok)pass=false;
  }
  console.log('\n'+(pass?'✅ i18n both-ways test passed':'❌ i18n test failed')+'\n');
  process.exit(pass?0:1);
})();

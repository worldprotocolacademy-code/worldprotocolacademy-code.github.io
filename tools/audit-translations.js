#!/usr/bin/env node
/* WPA Translation Audit — RENDERED + key checks. Run: node tools/audit-translations.js
   Loads each page, applies English, and FAILS if Macedonian Cyrillic remains in the
   rendered visible text (outside approved names/addresses). Also checks key parity,
   legacy systems and that Macedonian mode applies. Works on any machine: SITE = cwd. */
const fs=require('fs'),path=require('path');
let JSDOM; try{ ({JSDOM}=require('jsdom')); }catch(e){
  console.error('\n  jsdom is required. Install it with:\n     npm install\n  (a package.json with the jsdom dependency is included)\n'); process.exit(2);
}
const SITE=process.cwd();
const PAGES=[
  {id:'index',file:'index.html',engine:'main'},
  {id:'institute',file:'institute.html',engine:'main'},
  {id:'programmes',file:'programmes.html',engine:'main'},
  {id:'certification',file:'certification.html',engine:'main'},
  {id:'wpa-card',file:'wpa-card.html',engine:'main'},
  {id:'passive-revenue',file:'passive-revenue.html',engine:'main'},
  {id:'wpaws',file:path.join('wpaws','index.html'),engine:'main'},
];
const ALLOW=[/Смиљанов/,/Санде/,/Скопј/,/Македониј/,/Република Северна/,/Доц\./,/д-р/,/УКИМ/,/Охрид/];

/* Forbidden English UI/marketing phrases that must NOT appear in Macedonian mode
   (outside approved brand/technical names). Longest first. */
const FORBID_EN=['cross-border partnership relations','clean transaction rails','public verification logic',
 'premium learning layer','future premium value','specialised resource','monetization formula','monetization system',
 'assessment rubrics','assessment rubric','partner benefits','member benefits','benefit gateway','revenue engines',
 'verification logic','institutional growth','premium resources','protection layers','certificate-based','academy pathway',
 'digital bundles','transaction rails','book sales','minimum pass','open entry','translation-ready','learning layer',
 'growth logic','upgrade path','learning path','score bands','score band','membership','monetization','subscription',
 'handbook','thematic','contracts','engines','upgrades','premium','upgrade','individual','member benefit','benefits',
 'member','level','core',
 // editorial round (Sande's expanded MK-mode list)
 'default mode','verbatim','wpa-edited','book-to-screen','production workflow','protocol lesson','diplomatic impact',
 'credential path','knowledge check','knowledge checks','issuance','issue date','signature','visual seal','verify certificate',
 'ladder','research assistance','reason to continue','strategic affiliation','travel & mobility','meeting hospitality',
 'interface','ai reply','elevator pitch','blind peer review','programmes','train-the-trainer','no false claim',
 'successfully','eligible','engine','summary','workflow','paper','podcast','studio','communication','selected','consultant',
 // precision round E (Sande's expanded MK warnings)
 'protocol · diplomatic','film & festival','film &amp; festival','international academic cooperation','certificate-based',
 'card layer','future partner','executive groups','academic retail','academic distribution','formal correspondence',
 'authorship support','research-oriented','tiers','academic cooperation','diplomatic mistakes','apparel',
 'пасивен приход','пасивниот приход','полу-пасивен',
 // precision round (passive-revenue partner categories)
 'advanced патека','groups','model','movement','gathering','branded material','documentation','voice','gifting',
 'objects','terms','privacy','takedown','services','extensions','micro-courses','specialist','webinars','add-ons',
 'ambassadorial','front-facing','international comparative','arrangements','privileges','controlled',
 'implementation phases','clean payment routes','audience segmentation','scaling','agreements','offers','high-trust',
 'international слој','homepage','random rewards','enrolment','ethical',
 // final label round
 'professional judgement','below 70','type code','sample certificate','sample сертификат','status','secure backend',
 'secure заднински','tier','phase','anti-chaos','session status','track','security & trust','security &amp; trust',
 'cert faq','working трудови','cta патеки'];
/* tokens whose all-caps form is a legitimate format-code placeholder, not a leak */
const CODEWORDS=new Set(['level','core']);
function enLeftovers(window){
  const body=window.document.body, leaks=[]; const seen=new Set();
  function scan(label,txt){ if(!txt)return;
    const low=txt.toLowerCase();
    for(const ph of FORBID_EN){
      const re=new RegExp('(?<![a-z])'+ph.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-z])','i');
      const m=re.exec(txt);
      if(m){
        // skip all-caps format-code placeholders like WPA-YYYY-LEVEL-NNNN
        if(CODEWORDS.has(ph) && m[0]===m[0].toUpperCase() && /[A-Z]/.test(m[0])) continue;
        const key=ph+'|'+txt.slice(0,40); if(!seen.has(key)){seen.add(key);leaks.push(label+ph+': '+txt.trim().slice(0,45));} break; }
    }
  }
  const tw=window.document.createTreeWalker(body,4,{acceptNode:()=>1}); let n;
  while(n=tw.nextNode()){ const par=n.parentElement; if(!par)continue;
    if(par.closest('script,style,select,head,#toasts,.toast'))continue;
    scan('', (n.textContent||'').trim()); }
  const d=window.document;
  [['<title>',d.title],['og:title',(d.querySelector('meta[property="og:title"]')||{}).getAttribute?.('content')],
   ['og:description',(d.querySelector('meta[property="og:description"]')||{}).getAttribute?.('content')],
   ['description',(d.querySelector('meta[name="description"]')||{}).getAttribute?.('content')],
   ['keywords',(d.querySelector('meta[name="keywords"]')||{}).getAttribute?.('content')],
   ['twitter:title',(d.querySelector('meta[name="twitter:title"]')||{}).getAttribute?.('content')],
   ['twitter:description',(d.querySelector('meta[name="twitter:description"]')||{}).getAttribute?.('content')]
  ].forEach(([l,c])=>scan(l+': ',c));
  return leaks;
}
/* Heuristic source check: flag hard-coded Macedonian inside toast()/alert()/confirm() —
   these are dynamic feedback messages that should route through ui()/uiText() instead. */
function jsHardcoded(file){
  let src=''; try{ src=fs.readFileSync(path.join(SITE,file),'utf8'); }catch(e){ return []; }
  const hits=[]; const CYR=/[\u0400-\u04FF]/;
  src.split('\n').forEach(line=>{
    if(!/(toast\(|alert\(|confirm\()/.test(line)) return;
    const re=/(['"`])((?:\\.|(?!\1).)*?)\1/g; let m;
    while((m=re.exec(line))){ const s=m[2];
      if(CYR.test(s) && !ALLOW.some(r=>r.test(s)) && s!=='Внеси') hits.push(s.slice(0,40)); }
  });
  return hits;
}
function getVal(d,k){ if(!d)return undefined; if(Object.prototype.hasOwnProperty.call(d,k))return d[k];
  if(k.indexOf('.')>=0){let p=k.split('.'),c=d;for(const x of p){if(c&&typeof c==='object'&&Object.prototype.hasOwnProperty.call(c,x))c=c[x];else return undefined;}return typeof c==='string'?c:undefined;} return undefined;}
function flat(d,pre=''){const o={};for(const k in d){if(k==='_meta')continue;const v=d[k];
  if(Array.isArray(v))v.forEach((it,i)=>{if(it&&typeof it==='object')Object.assign(o,flat(it,pre+k+'.'+i+'.'));else o[pre+k+'.'+i]=it;});
  else if(v&&typeof v==='object')Object.assign(o,flat(v,pre+k+'.'));else o[pre+k]=v;}return o;}
function fetchFor(){return u=>{let c=String(u).split('?')[0].replace(/^https?:\/\/[^/]+\//,'').replace(/^\.?\//,'').replace(/^\.\.\//,'');const fp=path.join(SITE,c);
  return new Promise(r=>fs.readFile(fp,'utf8',(e,d)=>e?r({ok:false,status:404,text:()=>Promise.resolve(''),json:()=>Promise.reject(e)}):r({ok:true,status:200,text:()=>Promise.resolve(d),json:()=>Promise.resolve(JSON.parse(d))})));};}

async function loadPage(p){
  const html=fs.readFileSync(path.join(SITE,p.file),'utf8');
  const url='http://localhost:8080/'+p.file.replace(/\\/g,'/');
  const dom=new JSDOM(html,{runScripts:'dangerously',url,pretendToBeVisual:true});
  const {window}=dom;
  try{ window.localStorage.setItem('wpaws_ui_lang','en'); window.localStorage.setItem('wpa.language','en'); }catch(e){}
  if(!window.CustomEvent)window.CustomEvent=function(t,o){return{type:t,detail:(o||{}).detail};};
  if(!window.IntersectionObserver)window.IntersectionObserver=function(){return{observe(){},unobserve(){},disconnect(){}};};
  if(p.engine==='main'){ window.fetch=fetchFor();
    const loader=fs.readFileSync(path.join(SITE,'wpa-translator.js'),'utf8'); try{window.eval(loader);}catch(e){}
  } else { window.fetch=()=>Promise.resolve({ok:false,status:404,json:()=>Promise.resolve({}),text:()=>Promise.resolve('')}); }
  await new Promise(r=>setTimeout(r,500));
  return window;
}
function cyrLeaks(window){
  const body=window.document.body, leaks=[];
  const tw=window.document.createTreeWalker(body,4,{acceptNode:()=>1}); let n;
  while(n=tw.nextNode()){ const par=n.parentElement; if(!par)continue;
    if(par.closest('script,style,select,head,#toasts,.toast'))continue;
    const t=(n.textContent||'').trim(); if(t.length<2||!/[\u0400-\u04FF]/.test(t))continue;
    if(ALLOW.some(re=>re.test(t)))continue;
    leaks.push(t.slice(0,55)); }
  // also check the browser tab title + social meta (these live in <head>)
  const d=window.document;
  function chk(label,str){ if(!str)return; const bad=str.split(/\s+/).some(w=>/[\u0400-\u04FF]/.test(w)&&!ALLOW.some(re=>re.test(w))); if(bad)leaks.push(label+': '+str.slice(0,45)); }
  chk('<title>', d.title);
  const og=d.querySelector('meta[property="og:title"]'); if(og)chk('og:title',og.getAttribute('content'));
  const ogd=d.querySelector('meta[property="og:description"]'); if(ogd)chk('og:description',ogd.getAttribute('content'));
  const tw2=d.querySelector('meta[name="twitter:title"]'); if(tw2)chk('twitter:title',tw2.getAttribute('content'));
  const twd=d.querySelector('meta[name="twitter:description"]'); if(twd)chk('twitter:description',twd.getAttribute('content'));
  const ds=d.querySelector('meta[name="description"]'); if(ds)chk('description',ds.getAttribute('content'));
  const kw=d.querySelector('meta[name="keywords"]'); if(kw)chk('keywords',kw.getAttribute('content'));
  return leaks;
}

(async()=>{
  let allOK=true; const rows=[];
  for(const p of PAGES){
    let enLeaks=[],mkLeaks=[],missMK=0,missEN=0,legacy=[],err='';
    try{
      const w=await loadPage(p);
      // EN mode → check for Macedonian Cyrillic leftovers
      if(w.WPASetLanguage){ await w.WPASetLanguage('en'); } else if(w.setUILang){ w.setUILang('en'); }
      await new Promise(r=>setTimeout(r,200));
      enLeaks=cyrLeaks(w);
      // MK mode → check for unnecessary English UI/marketing leftovers
      if(w.WPASetLanguage){ await w.WPASetLanguage('mk'); } else if(w.setUILang){ w.setUILang('mk'); }
      await new Promise(r=>setTimeout(r,200));
      mkLeaks=enLeftovers(w);
      // key parity
      {
        let mk={},en={};
        try{mk=flat(JSON.parse(fs.readFileSync(path.join(SITE,'locales',p.id,'mk.json'),'utf8')));}catch(e){}
        try{en=flat(JSON.parse(fs.readFileSync(path.join(SITE,'locales',p.id,'en.json'),'utf8')));}catch(e){}
        const keys=new Set(); const doc=w.document;
        doc.querySelectorAll('[data-i18n]').forEach(e=>keys.add(e.getAttribute('data-i18n')));
        doc.querySelectorAll('[data-i18n-html]').forEach(e=>keys.add(e.getAttribute('data-i18n-html')));
        doc.querySelectorAll('[data-i18n-attr]').forEach(e=>e.getAttribute('data-i18n-attr').split(',').forEach(s=>{const b=s.split(':');if(b.length>=2)keys.add(b.slice(1).join(':').trim());}));
        missMK=[...keys].filter(k=>getVal(mk,k)===undefined).length;
        missEN=[...keys].filter(k=>getVal(en,k)===undefined).length;
      }
      const raw=fs.readFileSync(path.join(SITE,p.file),'utf8');
      if(/\sdata-t=/.test(raw))legacy.push('data-t');
    }catch(e){ err=e.message; }
    const hard=jsHardcoded(p.file);
    const enOK = enLeaks.length===0;
    const mkOK = mkLeaks.length===0;
    const ok = enOK && mkOK && missMK===0 && missEN===0 && legacy.length===0 && hard.length===0 && !err;
    if(!ok)allOK=false;
    rows.push({page:p.file,ok,enOK,mkOK,enLeaks,mkLeaks,missMK,missEN,legacy,hard,err});
  }
  console.log('\n══════════ WPA BIDIRECTIONAL TRANSLATION AUDIT ══════════');
  for(const r of rows){
    const extra=[]; if(r.missMK)extra.push('missMK '+r.missMK); if(r.missEN)extra.push('missEN '+r.missEN);
    if(r.legacy.length)extra.push('legacy '+r.legacy.join('/')); if(r.hard&&r.hard.length)extra.push('hard-coded JS '+r.hard.length);
    if(r.err)extra.push('ERROR '+r.err);
    console.log(`  ${r.page}  —  EN ${r.enOK?'OK':'FAIL'} / MK ${r.mkOK?'OK':'FAIL'}${extra.length?'  ('+extra.join(', ')+')':''}`);
    r.enLeaks.slice(0,5).forEach(s=>console.log('          EN⟶mk leak: '+JSON.stringify(s)));
    r.mkLeaks.slice(0,8).forEach(s=>console.log('          MK⟶en leak: '+JSON.stringify(s)));
    if(r.hard&&r.hard.length) r.hard.slice(0,5).forEach(s=>console.log('          hard-coded JS: '+JSON.stringify(s)));
  }
  console.log('\n'+(allOK?'✅ ALL PAGES OK — both English and Macedonian modes are language-pure':'❌ AUDIT FAILED')+'\n');
  process.exit(allOK?0:1);
})();

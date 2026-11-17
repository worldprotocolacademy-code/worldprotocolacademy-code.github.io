// Browser evidence for the LOCAL WPA P0 candidate, never proof of LIVE production.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.env.WPA_QA_ORIGIN||'http://127.0.0.1:8765';
const DIR='qa-output/mobile-consent';
fs.mkdirSync(DIR,{recursive:true});
const viewports=[320,360,390,768,1440];
const routes=[['mk-home','/'],['mk-institute','/institute.html'],['en-home','/en/index.html'],['en-institute','/en/institute.html']];
const report={scope:'LOCAL_CANDIDATE_ONLY',time:new Date().toISOString(),results:[],violations:[],screenshots:[],console:[],failed_requests:[]};
let failures=0;
const browser=await chromium.launch({headless:true});
function result(name,passed,evidence){report.results.push({name,passed:!!passed,evidence:String(evidence??'')});if(!passed){failures++;console.error('QA_FAIL '+name+' :: '+String(evidence??''));}}
async function ctx(width,javascriptEnabled=true){
 const x=await browser.newContext({viewport:{width,height:850},javascriptEnabled,serviceWorkers:'block'});
 await x.addInitScript(()=>{
   Object.defineProperty(navigator,'doNotTrack',{configurable:true,get:()=> '0'});
   Object.defineProperty(navigator,'globalPrivacyControl',{configurable:true,get:()=>false});
 });
 await x.route('**/config/analytics.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({measurementId:'G-TEST123456',consentRequired:true})}));
 return x;
}
async function screenshot(page,name){
 await page.screenshot({path:path.join(DIR,name),fullPage:false});
 report.screenshots.push(name);
}
async function pageRun(id,route,width){
 const x=await ctx(width);
 let tags=0;
 await x.route('**/www.googletagmanager.com/**',r=>{tags++;return r.fulfill({status:200,contentType:'application/javascript',body:'/* synthetic analytics response */'});});
 const p=await x.newPage();
 p.on('pageerror',e=>report.console.push({id,width,message:String(e.message).slice(0,200)}));
 p.on('requestfailed',r=>{if(report.failed_requests.length<60)report.failed_requests.push({id,width,url:r.url().slice(0,170),failure:r.failure()?.errorText});});
 const response=await p.goto(ROOT+route,{waitUntil:'domcontentloaded',timeout:45000});
 result(id+' '+width+' http 200',response?.status()===200,response?.status());
 const banner=p.locator('#wpaAnalyticsConsentBanner');
 await banner.waitFor({state:'visible',timeout:12000}).catch(()=>{});
 const visible=await banner.isVisible();
 result(id+' '+width+' consent banner',visible);
 result(id+' '+width+' no GA4 before consent',tags===0,tags);
 if(visible){
   const controls=await p.locator('#wpaAnalyticsConsentBanner .wpa-analytics-actions button').evaluateAll(a=>a.map(e=>({name:e.className,w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)})));
   result(id+' '+width+' consent targets',controls.length===3&&controls.every(x=>x.w>=44&&x.h>=44),JSON.stringify(controls));
 }
 const overflow=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
 if(id==='mk-institute' && overflow.scrollWidth>overflow.width+1 && (width===320||width===768)){
  const offenders=await p.evaluate(()=>Array.from(document.querySelectorAll('*')).map(e=>{
   const r=e.getBoundingClientRect(),s=getComputedStyle(e);
   return {tag:e.tagName.toLowerCase(),id:e.id,classes:String(e.className||'').slice(0,72),parent:String(e.parentElement?.className||'').slice(0,62),sample:String(e.innerText||'').slice(0,65),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),position:s.position,whiteSpace:s.whiteSpace};
  }).filter(x=>x.right>innerWidth+2&&x.width>0).sort((a,b)=>b.right-a.right).slice(0,28));
  console.log('QA_OVERFLOW_DIAGNOSTIC '+id+' '+width+' '+JSON.stringify(offenders));
 }
 result(id+' '+width+' no horizontal overflow',overflow.scrollWidth<=overflow.width+1,JSON.stringify(overflow));
 await screenshot(p,id+'-'+width+'-banner.png');
 if(id==='mk-home'&&width<=768){
  if(visible)await p.locator('.wpa-decline').click();
  const menu=p.locator('#mToggle');
  result('home '+width+' toggle visible',await menu.isVisible());
  if(await menu.isVisible()){
   result('home '+width+' aria-controls',await menu.getAttribute('aria-controls')==='wpaMobileDrawerV14');
   await menu.click();
   const expanded=await menu.getAttribute('aria-expanded');
   const links=await p.locator('#wpaMobileDrawerV14 a').count();
   result('home '+width+' opened and bounded',expanded==='true'&&links>=5&&links<=8,expanded+', links='+links);
   const sizes=await p.locator('#wpaMobileDrawerV14 a').evaluateAll(a=>a.map(x=>Math.round(x.getBoundingClientRect().height)));
   result('home '+width+' 44px drawer links',sizes.every(x=>x>=44),JSON.stringify(sizes));
   await screenshot(p,'mk-home-'+width+'-drawer.png');
   await p.keyboard.press('Escape');
   const closed=await menu.getAttribute('aria-expanded');
   const focused=await menu.evaluate(e=>document.activeElement===e);
   result('home '+width+' Escape + focus return',closed==='false'&&focused,closed+', '+focused);
  }
 }
 // Run axe on every supported MK/EN Home and Institute viewport, not just MK Home at 390px.
 // Consent is dismissed as an explicit human browser action for the page-content scan.
 // All rule failures remain fatal; the complete report is uploaded by the existing CI job.
 if(id==='mk-institute'&&width===1440){
  console.log('QA_BRAND_DIAGNOSTIC '+JSON.stringify(await p.locator('.nav-wrap nav .brand').evaluate(e=>({ariaLabel:e.getAttribute('aria-label'),visible:e.innerText,alt:e.querySelector('img')?.alt}))));
 }
 if(id!=='mk-home' || width>768){if(visible)await p.locator('.wpa-decline').click();}
 try {
   const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
   const defects=a.violations.map(v=>({route:id,width,rule:v.id,impact:v.impact,nodeCount:v.nodes.length,
     nodes:v.nodes.slice(0,id==='mk-institute'&&width===390?100:12).map(n=>({target:n.target,summary:String(n.failureSummary||'').slice(0,200),html:String(n.html||'').slice(0,130)}))}));
   report.violations.push(...defects);
   if(id==='mk-institute'&&width===1440){
    const brands=await p.locator('.brand').evaluateAll(es=>es.map(e=>({tag:e.tagName,ariaLabel:e.getAttribute('aria-label'),visible:e.innerText.slice(0,180)})));
    console.log('QA_BRAND_AFTER_AXE '+JSON.stringify(brands));
   }
   result(id+' '+width+' axe WCAG A/AA',defects.length===0,
     JSON.stringify(defects.map(v=>({rule:v.rule,impact:v.impact,nodeCount:v.nodeCount}))));
 } catch(e) {
   result(id+' '+width+' axe WCAG A/AA',false,String(e));
 }
 await x.close();
}
async function checkChoice(choice,allowed){
 const x=await ctx(390);let tags=0;
 await x.route('**/www.googletagmanager.com/**',r=>{tags++;return r.fulfill({status:200,contentType:'application/javascript',body:'/* intercepted */'});});
 const p=await x.newPage();await p.goto(ROOT+'/',{waitUntil:'domcontentloaded'});
 await p.locator('#wpaAnalyticsConsentBanner').waitFor({state:'visible',timeout:12000});
 result(choice+' pre-consent no GA4',tags===0,tags);
 if(choice==='accept')await p.locator('.wpa-accept').click();
 else if(choice==='reject')await p.locator('.wpa-decline').click();
 else {
   await p.locator('.wpa-settings').click();
   result(choice+' settings expanded',await p.locator('.wpa-settings').getAttribute('aria-expanded')==='true');
   await p.locator('.wpa-analytics-optin').setChecked(allowed);
   await p.locator('.wpa-save').click();
 }
 await p.waitForTimeout(180);
 const s=await p.evaluate(()=>localStorage.getItem('wpa.analytics.consent.v1'));
 result(choice+' stored preference',s===(allowed?'granted':'denied'),s);
 result(choice+' GA4 gated request count',allowed?tags===1:tags===0,tags);
 await x.close();
}
async function publicationMetricsBrowserRegression(){
 // Verify committed HTML *and* the rendered DOM after delayed existing scripts.
 // The old 26/19 problem occurred AFTER initial HTML, so a static grep alone is insufficient.
 const targets=[
  {name:'MK Home',route:'/',fields:[['academic.total','27'],['academic.papers','20']]},
  {name:'EN Home',route:'/en/index.html',fields:[['academic.total','27']]},
  {name:'Papers',route:'/papers.html',fields:[['academic.total','27'],['academic.papers','20'],['zenodo.working_papers','15'],['zenodo.protocol_notes','9']]},
  {name:'Bibliography',route:'/bibliography/',fields:[['academic.total','27'],['zenodo.summary.en','25 WPA Zenodo Records']]},
  {name:'Institute',route:'/institute.html',fields:[['academic.summary.en','27 publications = 6 monographs/manuals + 1 doctoral dissertation + 20 papers/contributions']]},
  {name:'Services',route:'/wpa-services.html',fields:[['academic.total','27'],['zenodo.total','25']]}
 ];
 for(const javascriptEnabled of [false,true]){
  for(const target of targets){
   const x=await ctx(390,javascriptEnabled);
   const p=await x.newPage();
   const response=await p.goto(ROOT+target.route,{waitUntil:'domcontentloaded',timeout:45000});
   result('metrics '+target.name+' '+(javascriptEnabled?'post-JS':'pre-JS')+' HTTP',response?.status()===200,response?.status());
   if(javascriptEnabled)await p.waitForTimeout(2400);
   for(const [key,expected] of target.fields){
    const selector='[data-wpa-metric="'+key+'"]';
    const rows=p.locator(selector);
    const n=await rows.count();
    const value=n===1?String(await rows.first().textContent()||'').trim().replace(/\s+/g,' '):'';
    const matches=n===1&&value.includes(expected);
    if(!matches&&target.name==='Bibliography'){
      const responseBody=await p.request.get(ROOT+target.route);
      const raw=await responseBody.text();
      const canonicalRaw=fs.readFileSync('bibliography/index.html','utf8');
      const needle='data-wpa-metric="'+key+'"';
      const snippet=(s)=>{const offset=s.indexOf(needle);return offset<0?'MISSING':s.slice(offset,offset+230);};
      console.error('QA_DIAGNOSTIC Bibliography '+
        JSON.stringify({browserUrl:p.url(),httpUrl:responseBody.url(),status:responseBody.status(),
          rawHTML:snippet(raw),repoHTML:snippet(canonicalRaw),javascriptEnabled,
          domValue:value}));
    }
    result('metrics '+target.name+' '+(javascriptEnabled?'post-JS':'pre-JS')+' '+key,
      matches,JSON.stringify({expected,actual:value,count:n}));
   }
   await x.close();
  }
 }
}
try {
 for(const [id,route] of routes)for(const w of viewports)await pageRun(id,route,w);
 await publicationMetricsBrowserRegression();
 for(const [id,route] of routes){
  const x=await ctx(390,false);const p=await x.newPage();
  const r=await p.goto(ROOT+route,{waitUntil:'domcontentloaded',timeout:40000});
  result(id+' JS disabled HTTP',r?.status()===200,r?.status());
  await screenshot(p,id+'-no-js.png');await x.close();
 }
 await checkChoice('reject',false);
 await checkChoice('accept',true);
 await checkChoice('settings-deny',false);
 await checkChoice('settings-allow',true);
}finally {
 fs.writeFileSync(path.join(DIR,'report.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();
}
console.log('WPA MOBILE P0 CANDIDATE: '+report.results.length+' checks; '+failures+' failures; '+report.screenshots.length+' screenshots');
if(failures)process.exitCode=1;

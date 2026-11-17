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
 if(id==='mk-home'&&width===390){
   try {
    const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    report.violations=a.violations.map(v=>({rule:v.id,impact:v.impact,nodes:v.nodes.length}));
    result('MK home 390 axe A/AA',a.violations.length===0,JSON.stringify(report.violations));
   }catch(e){result('MK home 390 axe',false,String(e));}
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
try {
 for(const [id,route] of routes)for(const w of viewports)await pageRun(id,route,w);
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

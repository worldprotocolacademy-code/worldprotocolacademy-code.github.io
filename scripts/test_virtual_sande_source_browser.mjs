// WPA Virtual Sande local-candidate QA — simulated responses are NOT production evidence.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const ROOT=process.env.WPA_QA_ORIGIN||'http://127.0.0.1:8765';
const FOLDER='qa-output/virtual-sande';
fs.mkdirSync(FOLDER,{recursive:true});
const tests=[];let failures=0;const browser=await chromium.launch({headless:true});
function check(name,good,details){tests.push({name,pass:!!good,details:String(details||'')});if(!good){failures++;console.error('QA_FAIL '+name+' :: '+String(details||''));}}
const endpoint='https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/';
const healthy={ok:true,mode:'health',contract:'wpa-virtual-sande-response-v1.1',version:'v35.1.1'};
const successful={ok:true,mode:'author',hasContext:true,contract:'wpa-virtual-sande-response-v1.1',version:'v35.1.1',servedBy:'llm',answer:'Симулација: проверлив одговор од модел.'};
const deterministic={ok:true,mode:'greeting',hasContext:false,contract:'wpa-virtual-sande-response-v1.1',version:'v35.1.1',servedBy:'v35.1.1-greeting',answer:'Симулација: детерминистички поздрав.'};
const doctrine={ok:true,mode:'protected_doctrine_block',hasContext:true,contract:'wpa-virtual-sande-response-v1.1',servedBy:'v34.5-protected-doctrine',answer:'Симулација: одговор од заштитеното WPA доктринарно јадро.'};
const insufficient={ok:true,mode:'author',hasContext:false,contract:'wpa-virtual-sande-response-v1.1',servedBy:'procedural-insufficient-evidence',answer:'Симулација: нема независна поткрепа за конкретната процедура.'};
const targets=[
 {id:'public',route:'/',fab:'#wpaPublicVsFab',input:'#wpaPublicVsInput',send:'#wpaPublicVsSend',status:'#wpaPublicVsStatus',row:'.wpa-public-vs-row.assistant',log:'#wpaPublicVsMsgs',monitor:'WPAVirtualSandeMonitor'},
 {id:'institute',route:'/institute.html',fab:'#wpaInstVsFab',input:'#wpaInstVsInput',send:'#wpaInstVsSend',status:'#wpaInstVsStatus',row:'.wpa-inst-vs-row.assistant',log:'#wpaInstVsMsgs',monitor:'WPAInstituteVirtualSandeMonitor'}
];
async function run(target,scenario){
 const ctx=await browser.newContext({viewport:{width:390,height:780},serviceWorkers:'block'});
 let requests=0;
 let analyticsRequests=0;
 // The local QA candidate must preserve the real consent UI, not click through it.
 await ctx.route('**/config/analytics.json',route=>route.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({measurementId:'G-TEST123456',consentRequired:true})
 }));
 await ctx.route('**/www.googletagmanager.com/**',route=>{
  analyticsRequests++;
  return route.abort();
 });
 await ctx.route(endpoint+'**',async route=>{
  const pathname=new URL(route.request().url()).pathname;
  if(pathname.includes('health'))return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(healthy)});
  if(pathname==='/ask'){
    requests++;
    if(scenario==='failure')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,error:'Simulated API unavailable'})});
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(scenario==='model'?successful:scenario==='doctrine'?doctrine:scenario==='insufficient'?insufficient:deterministic)});
  }
  return route.abort();
 });
 const page=await ctx.newPage();
 await page.goto(ROOT+target.route,{waitUntil:'domcontentloaded',timeout:45000});
 // Analytics consent is a foreground interaction. Reject it as a user would,
 // then verify no GA4 request occurred. Do not force-click through the dialog.
 const consent=page.locator('#wpaAnalyticsConsentBanner');
 await consent.waitFor({state:'visible',timeout:12000});
 check(target.id+' '+scenario+' GA4 blocked before consent',analyticsRequests===0,String(analyticsRequests));
 await consent.locator('button.wpa-decline').click();
 await consent.waitFor({state:'detached',timeout:6000});
 const preference=await page.evaluate(()=>localStorage.getItem('wpa.analytics.consent.v1'));
 check(target.id+' '+scenario+' explicit rejection recorded',preference==='denied',preference);
 check(target.id+' '+scenario+' GA4 remains blocked after rejection',analyticsRequests===0,String(analyticsRequests));
 await page.locator(target.fab).waitFor({state:'visible',timeout:16000});
 const health=await page.evaluate(key=>window[key],target.monitor);
 check(target.id+' '+scenario+' initial not LIVE',health.state!=='live',JSON.stringify(health));
 await page.locator(target.fab).click();
 const role=await page.locator(target.log).getAttribute('role');
 const tab=await page.locator(target.log).getAttribute('tabindex');
 check(target.id+' '+scenario+' messages keyboard log',role==='log'&&tab==='0');
 await page.locator(target.input).fill('Што е безбедност?');
 await page.locator(target.send).click();
 await page.waitForFunction(selector=>document.querySelectorAll(selector).length>=2,target.row,{timeout:25000});
 await page.locator(target.row).last().locator('.wpa-public-vs-bubble,.wpa-inst-vs-bubble').waitFor({state:'visible',timeout:25000});
 if(scenario==='deterministic')await page.waitForTimeout(350);
 if(scenario==='failure')await page.waitForTimeout(450);
 const state=await page.evaluate(key=>window[key],target.monitor);
 const source=await page.locator(target.row).last().getAttribute('data-answer-source');
 const label=await page.locator(target.row).last().locator('.wpa-public-vs-source,.wpa-inst-vs-source').textContent();
 const expected=scenario==='model'?'live':scenario==='doctrine'?'doctrine':scenario==='insufficient'?'insufficient':scenario==='deterministic'?'unverified':target.id==='public'?'local':'unavailable';
 check(target.id+' '+scenario+' source badge',source===expected,'source='+source+', expected='+expected+', label='+label);
 check(target.id+' '+scenario+' last_verified_at truth',scenario==='model'?!!state.last_verified_at:!state.last_verified_at,JSON.stringify(state));
 check(target.id+' '+scenario+' number of API tries',scenario==='failure'?requests===2:requests===1,requests);
 const status=await page.locator(target.status).textContent();
 check(target.id+' '+scenario+' status visible',!!status&&status.trim().length>0,status);
 await page.screenshot({path:path.join(FOLDER,target.id+'-'+scenario+'.png'),fullPage:false});
 await ctx.close();
}
try{
 for(const t of targets)for(const sc of ['model','deterministic','doctrine','insufficient','failure'])await run(t,sc);
}finally{
 fs.writeFileSync(path.join(FOLDER,'report.json'),JSON.stringify({scope:'SYNTHETIC_LOCAL_TEST_NOT_PRODUCTION',tests},null,2)+'\n');
 await browser.close();
}
console.log('Virtual Sande source-provenance QA '+tests.length+' assertions; '+failures+' failures; 10 screenshots.');
if(failures)process.exitCode=1;

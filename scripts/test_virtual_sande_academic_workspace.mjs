/* WPA Academic Workspace: browser-only end-to-end test.
 * All Worker replies are mocked; this does NOT establish live model inference.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.env.WPA_QA_ORIGIN || 'http://127.0.0.1:8765';
const OUT = 'qa-output/virtual-sande-workspace';
const WORKER = 'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/';
fs.mkdirSync(OUT,{recursive:true});
const records = [];
let failures = 0;
function check(name,good,details='') {
  records.push({name,pass:Boolean(good),details:String(details).slice(0,280)});
  if (!good) { failures++; console.error('QA_FAIL '+name+' '+String(details).slice(0,280)); }
}
const targets = [
  {id:'mk-home',url:'/',fab:'#wpaPublicVsFab',input:'#wpaPublicVsInput',send:'#wpaPublicVsSend',log:'#wpaPublicVsMsgs',row:'.wpa-public-vs-row',tools:'.wpa-public-vs-tools',clear:'#wpaPublicVsClear'},
  {id:'mk-institute',url:'/institute.html',fab:'#wpaInstVsFab',input:'#wpaInstVsInput',send:'#wpaInstVsSend',log:'#wpaInstVsMsgs',row:'.wpa-inst-vs-row',tools:'.wpa-inst-vs-tools',clear:'#wpaInstVsClear'}
];
const question = 'Кои се основните принципи на протоколот?';
const answer = 'WPA тестен доктринарен одговор. <img src=x onerror=alert(1)>';
const response = {
  ok:true,mode:'protected_doctrine_block',
  contract:'wpa-virtual-sande-response-v1.1',
  servedBy:'v34.5-protected-doctrine',hasContext:true,
  sources:['WPA reference A','WPA reference B'],answer
};
const browser = await chromium.launch({headless:true});
async function run(t) {
  const ctx = await browser.newContext({
    viewport:{width:390,height:780},acceptDownloads:true,serviceWorkers:'block',
    permissions:['clipboard-read','clipboard-write']
  });
  let askCount=0, analyticsCount=0;
  await ctx.route('**/config/analytics.json',route=>route.fulfill({
    status:200,contentType:'application/json',
    body:JSON.stringify({measurementId:'G-TEST123456',consentRequired:true})
  }));
  await ctx.route('**/www.googletagmanager.com/**',route=>{analyticsCount++;return route.abort();});
  await ctx.route(WORKER+'**',route=>{
    const endpoint = new URL(route.request().url()).pathname;
    if (endpoint.endsWith('/health')) return route.fulfill({
      status:200,contentType:'application/json',
      body:JSON.stringify({ok:true,mode:'health',contract:'wpa-virtual-sande-response-v1.1'})
    });
    if (endpoint==='/ask') {
      askCount++;
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(response)});
    }
    return route.abort();
  });
  const page = await ctx.newPage();
  try {
    await page.goto(ROOT+t.url,{waitUntil:'domcontentloaded',timeout:45000});
    const consent = page.locator('#wpaAnalyticsConsentBanner');
    await consent.waitFor({state:'visible',timeout:15000});
    check(t.id+' GA4 held before consent',analyticsCount===0,analyticsCount);
    await consent.locator('.wpa-decline').click();
    await consent.waitFor({state:'detached',timeout:7000});
    check(t.id+' GA4 held after explicit refusal',analyticsCount===0,analyticsCount);

    await page.locator(t.fab).waitFor({state:'visible',timeout:16000});
    await page.waitForFunction(()=>Boolean(window.WPAVirtualSandeWorkspace),null,{timeout:15000});
    const config = await page.evaluate(()=>window.WPAVirtualSandeWorkspace);
    check(t.id+' extension declares session-only state',config?.storage==='session-dom-only',JSON.stringify(config));
    check(t.id+' enhancement attaches to original widget',await page.locator(t.tools+' .wpa-vs-export').count()===1);
    check(t.id+' original conversation preserved',await page.locator(t.log).getAttribute('role')==='log');
    await page.locator(t.fab).click();
    await page.locator(t.input).fill(question);
    await page.locator(t.send).click();
    const item = page.locator(t.log+' '+t.row+'.assistant').last();
    await item.locator('.wpa-vs-passport').waitFor({state:'attached',timeout:25000});
    check(t.id+' one remote request only',askCount===1,askCount);
    check(t.id+' source classification is doctrine',await item.getAttribute('data-answer-source')==='doctrine');
    check(t.id+' controls are two real buttons',await item.locator('.wpa-vs-actions button').count()===2);
    check(t.id+' passport is expandable',await item.locator('details.wpa-vs-passport summary').count()===1);
    const passport = item.locator('.wpa-vs-passport');
    await passport.locator('summary').click();
    const shown = await passport.innerText();
    check(t.id+' actual Worker metadata',shown.includes('v34.5-protected-doctrine')&&shown.includes('protected_doctrine_block'));
    check(t.id+' source count is reported not independently verified',shown.includes('2')&&shown.includes('Не се независно проверени'));
    check(t.id+' Human Gate explicitly visible',shown.includes('Човечка порта'));
    check(t.id+' model origin is not mislabelled Live AI',!shown.includes('Одговор со пријавен моделски извор'));
    check(t.id+' hostile HTML is displayed as text',await item.locator('img').count()===0);
    check(t.id+' answer text unchanged',await item.locator('.wpa-public-vs-bubble,.wpa-inst-vs-bubble').textContent()===answer);
    await item.locator('.wpa-vs-action').first().click();
    const clip = await page.evaluate(()=>navigator.clipboard.readText());
    check(t.id+' copy-to-clipboard works',clip===answer,clip.slice(0,80));
    const [download] = await Promise.all([
      page.waitForEvent('download',{timeout:12000}),
      page.locator(t.tools+' .wpa-vs-export').click()
    ]);
    check(t.id+' Markdown download filename',/^wpa-virtual-sande-\d{4}-\d{2}-\d{2}\.md$/.test(download.suggestedFilename()),download.suggestedFilename());
    const body = fs.readFileSync(await download.path(),'utf8');
    check(t.id+' Markdown includes real dialogue',body.includes(question)&&body.includes(answer));
    check(t.id+' Markdown includes provenance label',body.includes('Заштитена WPA доктрина'));
    check(t.id+' Markdown explains privacy boundary',body.includes('се испраќаат до WPA Worker'));
    const state = await page.evaluate(()=>({
      localKeys:Object.keys(localStorage).filter(x=>x.startsWith('wpa-vs')||x.startsWith('wpa.virtual-sande')),
      sessionKeys:Object.keys(sessionStorage).filter(x=>x.startsWith('wpa-vs')||x.startsWith('wpa.virtual-sande'))
    }));
    check(t.id+' no chat persistence introduced',state.localKeys.length===0&&state.sessionKeys.length===0,JSON.stringify(state));
    check(t.id+' no analytics network leak',analyticsCount===0,analyticsCount);
    await page.screenshot({path:path.join(OUT,t.id+'-passport.png'),fullPage:false});
    await page.locator(t.clear).click();
    check(t.id+' clear removes prior question',await page.locator(t.log+' '+t.row+'.user').count()===0);
    check(t.id+' clear removes old evidence passport',await page.locator(t.log+' .wpa-vs-passport').count()===0);
    check(t.id+' welcome remains without fabricated passport',await page.locator(t.log+' '+t.row+'.assistant').count()===1);
  } catch (error) {
    check(t.id+' test completed',false,error.message||String(error));
    await page.screenshot({path:path.join(OUT,t.id+'-failure.png'),fullPage:false}).catch(()=>{});
  } finally {
    await ctx.close();
  }
}
try { for (const t of targets) await run(t); }
finally {
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({
    scope:'LOCAL_SYNTHETIC_UI_ONLY_NOT_PRODUCTION_AI',tests:records,failures
  },null,2)+'\n');
  await browser.close();
}
console.log('WPA ACADEMIC WORKSPACE QA: '+records.length+' checks; '+failures+' failures.');
if (failures) process.exitCode=1;

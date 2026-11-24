/**
 * Read-only GitHub Pages / Cloudflare cache propagation smoke for the local
 * Practical Protocol Planner. Never sends a prompt, uploads a file, or spends AI.
 * Run after an authorised main merge, not as release proof beforehand.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const site='https://worldprotocolacademy.mk';
const paths=[
 ['/', '20261124-practical-v1','index.html'],
 ['/virtual-sande-ai.html','WPA_PROTOCOL_PLANNER_RC1','virtual-sande-ai.html'],
 ['/scripts/wpa-performance.js','20261124-practical-v1','scripts/wpa-performance.js'],
 ['/scripts/virtual-sande-public-widget.js','WPA_PROTOCOL_PLANNER_RC1','scripts/virtual-sande-public-widget.js'],
 ['/scripts/virtual-sande-protocol-practice.mjs','wpa-practical-protocol/0.1','scripts/virtual-sande-protocol-practice.mjs'],
 ['/scripts/virtual-sande-protocol-practice-ui.mjs','createProtocolPracticeStudio','scripts/virtual-sande-protocol-practice-ui.mjs']
];
const tries=Number(process.env.WPA_LIVE_SMOKE_TRIES||8);
if(!Number.isInteger(tries)||tries<1||tries>12)throw new Error('BAD_SMOKE_TRIES');
const sha=x=>createHash('sha256').update(x).digest('hex').slice(0,12);
async function checkOnce(path,needle,file){
 const url=new URL(site+path);
 url.searchParams.set('wpa_verify','practical-20261124');
 const resp=await fetch(url,{redirect:'error',cache:'no-store',
  headers:{'Cache-Control':'no-cache','Accept':'text/html, application/javascript;q=0.9,*/*;q=0.1'},
  signal:AbortSignal.timeout(16000)});
 if(resp.status!==200)throw new Error('HTTP_'+resp.status+':'+path);
 const body=await resp.text();
 if(!body.includes(needle))throw new Error('MISSING_RELEASE_MARKER:'+path);
 const local=readFileSync(file,'utf8');
 if(!local.includes(needle))throw new Error('LOCAL_MARKER_MISSING:'+file);
 // HTML may be transformed by site build; JS modules are byte-for-byte assets.
 const exact=path.endsWith('.mjs')||path.endsWith('.js');
 if(exact&&body.replace(/\r\n/g,'\n')!==local.replace(/\r\n/g,'\n'))
   throw new Error('LIVE_ASSET_DIFFERS_FROM_APPROVED_SOURCE:'+path+
    ':local='+sha(local)+':remote='+sha(body));
 return {path,sha:sha(body),bytes:body.length};
}
let last=[];
for(let n=0;n<tries;n++){
 last=[];
 for(const [path,mark,file] of paths){
  try{last.push(await checkOnce(path,mark,file));}
  catch(e){last.push({path,error:String(e?.message||e).slice(0,160)});}
 }
 if(last.every(x=>!x.error)){
  console.log(JSON.stringify({ok:true,status:'LIVE_STATIC_ASSETS_VERIFIED',
   note:'Read-only file identity checks only; not a real browser/AI function test.',
   verified:last},null,2));
  process.exit(0);
 }
 console.error('Read-only live propagation check '+(n+1)+'/'+tries+' incomplete: '+
  last.filter(x=>x.error).map(x=>x.error).join('; '));
 if(n+1<tries)await new Promise(ok=>setTimeout(ok,15000));
}
console.error(JSON.stringify({ok:false,status:'LIVE_NOT_VERIFIED',files:last},null,2));
process.exit(1);

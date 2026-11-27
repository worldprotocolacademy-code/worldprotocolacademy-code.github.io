import {createWorker,verifyAccess} from '../../../tools/virtual-sande/wpa-private-workspace-pilot.mjs';

const apiPaths=new Set(['/private-api/convert','/private-api/analyze','/private-api/suggest']);
export const ASSETS=new Set(['/','/index.html','/en','/en/','/en/index.html','/logo.webp',
 '/scripts/virtual-sande-public-widget.js','/scripts/virtual-sande-public-voice.mjs','/scripts/virtual-sande-local-preview.mjs','/scripts/virtual-sande-multimodal-workspace.mjs',
 '/scripts/virtual-sande-private-workspace-client.mjs','/scripts/virtual-sande-proactive-intent.mjs',
 '/scripts/virtual-sande-protocol-practice-ui.mjs','/scripts/virtual-sande-protocol-practice.mjs']);
const headers={
 'Cache-Control':'private, no-store, max-age=0',
 'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer',
 'X-Robots-Tag':'noindex, nofollow, noarchive',
 'Permissions-Policy':'microphone=(self), camera=(), geolocation=()',
 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self';"
};
function protectedResponse(response){
 const h=new Headers(response.headers);
 for(const [k,v] of Object.entries(headers))h.set(k,v);
 return new Response(response.body,{status:response.status,headers:h});
}
const deny=(code,status)=>protectedResponse(new Response(JSON.stringify({error:code}),{status,headers:{'Content-Type':'application/json; charset=utf-8'}}));
export function createPrivateSite({authorize=verifyAccess}={}){
 const api=createWorker({authorize});
 return {async fetch(request,env){
  const url=new URL(request.url);
  if(env.PILOT_ENABLED!=='true')return deny('PILOT_DISABLED',503);
  if(!env.PILOT_ORIGIN||url.origin!==env.PILOT_ORIGIN)return deny('ORIGIN_DENIED',403);
  if(apiPaths.has(url.pathname))return protectedResponse(await api.fetch(request,env));
  if(request.method!=='GET'&&request.method!=='HEAD')return deny('METHOD_NOT_ALLOWED',405);
  if(!ASSETS.has(url.pathname))return deny('NOT_FOUND',404);
  if(typeof await authorize(request,env)!=='string')return deny('AUTH_REQUIRED',401);
  if(!env.ASSETS||typeof env.ASSETS.fetch!=='function')return deny('ASSETS_UNAVAILABLE',503);
  // Do not forward the Access JWT, cookies or other credentials to the static binding.
  const asset=new Request(url.origin+url.pathname,{method:request.method});
  return protectedResponse(await env.ASSETS.fetch(asset));
 }};
}
export default createPrivateSite();

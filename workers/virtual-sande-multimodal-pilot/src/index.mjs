/* Isolated optional Virtual Sande agent Worker — staging requires a server secret.
 * No change to the certified WPA /ask Worker. Staging auth is applied BEFORE
 * capabilities, Turnstile or any paid model request.
 */
import { maybeHandleAgent } from './agent-gateway.mjs';

function sameToken(candidate, secret) {
  // Fixed-length character loop avoids short-circuit token comparison.
  if(typeof candidate!=='string' || typeof secret!=='string' ||
     !candidate || !secret || candidate.length!==secret.length ||
     secret.length<24 || secret.length>256) return false;
  let diff=0;
  for(let i=0;i<secret.length;i++)diff|=candidate.charCodeAt(i)^secret.charCodeAt(i);
  return diff===0;
}
function denied(status, code) {
  return new Response(JSON.stringify({ok:false,error:code}),{
    status,
    headers:{'content-type':'application/json; charset=utf-8',
      'cache-control':'no-store','x-content-type-options':'nosniff'}
  });
}

export default {
  async fetch(request, env={}) {
    if(env.WPA_AGENT_STAGING_ONLY==='true'){
      if(!env.WPA_AGENT_STAGING_TOKEN || String(env.WPA_AGENT_STAGING_TOKEN).length<24) {
        return denied(503,'STAGING_AUTH_NOT_CONFIGURED');
      }
      // The staging endpoint is a private API test harness: never expose a
      // staging token through public client-side JS, query strings or logs.
      if(!sameToken(request.headers.get('X-WPA-Stage-Token'),env.WPA_AGENT_STAGING_TOKEN)) {
        return denied(403,'PRIVATE_STAGING_ONLY');
      }
    }
    const response=await maybeHandleAgent(request,env);
    if(response) return response;
    return denied(404,'ROUTE_NOT_FOUND');
  }
};

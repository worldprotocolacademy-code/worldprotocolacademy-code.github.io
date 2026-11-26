import {APP,ASSET_PATHS} from './paths.mjs';
import {verifyAccessJWT,accessRole} from './auth.mjs';
import {searchRadar,PROFILES} from './radar.mjs';
const allowed=new Set(ASSET_PATHS);
const secureHeaders={
  'Cache-Control':'private, no-store, max-age=0',
  'CDN-Cache-Control':'no-store',
  'Pragma':'no-cache',
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'no-referrer',
  'Cross-Origin-Resource-Policy':'same-origin',
  'X-Robots-Tag':'noindex, nofollow, noarchive',
  'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...secureHeaders,'Content-Type':'application/json; charset=utf-8'}});
const deny=(status,error)=>json({ok:false,error},status);
export function createHandler({fetcher=fetch,clock=()=>Date.now()}={}){
  return {async fetch(request,env){
    const u=new URL(request.url);
    // A disabled or misconfigured deployment serves no protected content. No alternate hostname.
    if(!['OWNER_ONLY','MEMBERS'].includes(env.WPA_ACCESS_MODE)||!env.PRIVATE_HOST||u.protocol!=='https:'||u.hostname!==env.PRIVATE_HOST||u.port)return deny(503,'PRIVATE_WORKSPACE_DISABLED');
    if(!['GET','HEAD'].includes(request.method))return deny(405,'METHOD_NOT_ALLOWED');
    let identity;try{identity=await verifyAccessJWT(request.headers.get('Cf-Access-Jwt-Assertion'),env,fetcher,clock());}
    catch{return deny(401,'AUTHENTICATION_REQUIRED');}
    let role;try{role=await accessRole(identity,env,clock());}catch{return deny(503,'AUTHORISATION_UNAVAILABLE');}
    if(!role)return deny(403,'ACCESS_DENIED');
    if(u.pathname==='/api/v1/access'&&request.method==='GET')return json({ok:true,role,mode:env.WPA_ACCESS_MODE,radarEnabled:env.WPA_RADAR_MODE==='ENABLED'&&Boolean(env.RADAR_LIMITER),memberRelease:env.WPA_MEMBER_RELEASE==='APPROVED'});
    if(u.pathname==='/api/v1/radar'&&request.method==='GET'){
      if(env.WPA_RADAR_MODE!=='ENABLED'||!env.RADAR_LIMITER)return deny(503,'RADAR_NOT_ACTIVATED');
      if(request.headers.get('Sec-Fetch-Site')==='cross-site')return deny(403,'CROSS_SITE_DENIED');
      const profile=u.searchParams.get('profile');
      if(!profile||!Object.hasOwn(PROFILES,profile)||u.searchParams.getAll('profile').length!==1||[...u.searchParams.keys()].some(k=>k!=='profile'))return deny(400,'UNKNOWN_RADAR_PROFILE');
      try{const rate=await env.RADAR_LIMITER.limit({key:identity.sub});if(!rate?.success)return deny(429,'RADAR_RATE_LIMIT');return json(await searchRadar(profile,fetcher,clock()));}
      catch{return deny(502,'OFFICIAL_SOURCE_UNAVAILABLE_OR_UNRECOGNISED');}
    }
    const path=u.pathname==='/'?APP:u.pathname;
    if(!allowed.has(path)||!env.ASSETS)return deny(404,'NOT_FOUND');
    try{
      // Strip incoming headers and query parameters before internal asset fetch; no private tokens sent onward.
      const a=await env.ASSETS.fetch(new Request(new URL(path,u.origin),{method:request.method}));
      if(a.status>=300&&a.status<400)return deny(404,'ASSET_REDIRECT_REJECTED');
      const headers=new Headers(a.headers);for(const [k,v] of Object.entries(secureHeaders))headers.set(k,v);
      headers.delete('Set-Cookie');headers.delete('ETag');headers.delete('Last-Modified');
      return new Response(request.method==='HEAD'?null:a.body,{status:a.status,headers});
    }catch{return deny(503,'ASSET_UNAVAILABLE');}
  }};
}
export default createHandler();

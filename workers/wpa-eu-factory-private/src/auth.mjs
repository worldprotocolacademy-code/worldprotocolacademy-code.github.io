// Cloudflare Access application JWT: fixed issuer, audience, RS256, signature, time and identity.
const decode = s => {
  if(typeof s!=='string'||!s||!/^[A-Za-z0-9_-]+$/.test(s))throw Error('bad base64url');
  return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
};
const jsonPart=s=>JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(decode(s)));
const validEmail=s=>typeof s==='string'&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export async function boundedBytes(response,limit){
  const reader=response.body?.getReader();if(!reader)throw Error('missing body');
  const chunks=[];let size=0;
  try{
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit)throw Error('body limit');chunks.push(value);}
    const out=new Uint8Array(size);let pos=0;for(const v of chunks){out.set(v,pos);pos+=v.length;}return out;
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
export async function verifyAccessJWT(token,env,fetcher=fetch,now=Date.now()){
  const issuer=env.ACCESS_ISSUER,audience=env.ACCESS_AUD;
  if(typeof issuer!=='string'||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer)||typeof audience!=='string'||audience.length<16||audience.length>256)throw Error('unconfigured Access');
  if(typeof token!=='string'||token.length>16384)throw Error('missing assertion');
  const parts=token.split('.');if(parts.length!==3)throw Error('bad assertion');
  const [h,p,s]=parts,header=jsonPart(h),claims=jsonPart(p);
  if(header.alg!=='RS256'||typeof header.kid!=='string'||!header.kid||header.kid.length>256||header.crit)throw Error('bad signing header');
  const seconds=Math.floor(now/1000),aud=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(claims.iss!==issuer||!aud.includes(audience)||!Number.isFinite(claims.exp)||claims.exp<=seconds||
    (claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>seconds))||
    (claims.iat!==undefined&&(!Number.isFinite(claims.iat)||claims.iat>seconds+30))||
    typeof claims.sub!=='string'||!claims.sub||claims.sub.length>256||!validEmail(claims.email))throw Error('invalid claims');
  const response=await fetcher(issuer+'/cdn-cgi/access/certs',{redirect:'error',signal:AbortSignal.timeout(5000),headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('key service unavailable');
  const jwks=JSON.parse(new TextDecoder().decode(await boundedBytes(response,262144)));
  const matches=Array.isArray(jwks.keys)?jwks.keys.filter(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256')&&(!k.use||k.use==='sig')):[];
  if(matches.length!==1)throw Error('untrusted key');
  const key=await crypto.subtle.importKey('jwk',matches[0],{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(s),new TextEncoder().encode(h+'.'+p));
  if(!valid)throw Error('invalid signature');
  return {sub:claims.sub,issuer:claims.iss,email:claims.email.toLowerCase()};
}
export async function accessRole(identity,env,now=Date.now()){
  let owners;try{owners=JSON.parse(env.OWNER_EMAILS||'[]');}catch{return null;}
  if(!Array.isArray(owners)||!owners.length||owners.some(x=>!validEmail(x)))return null;
  if(!['OWNER_ONLY','MEMBERS'].includes(env.WPA_ACCESS_MODE))return null;
  if(owners.some(x=>x.toLowerCase()===identity.email))return 'owner';
  if(env.WPA_ACCESS_MODE!=='MEMBERS'||env.WPA_MEMBER_RELEASE!=='APPROVED'||!env.ENTITLEMENTS)return null;
  // Only server-managed, pre-approved records. No client role or plan values are trusted.
  const row=await env.ENTITLEMENTS.prepare('SELECT plan, state, expires_at, email FROM entitlements WHERE issuer = ? AND subject = ?').bind(identity.issuer,identity.sub).first();
  if(!row||row.state!=='ACTIVE'||!['pro','extra'].includes(row.plan)||typeof row.email!=='string'||row.email.toLowerCase()!==identity.email||
    typeof row.expires_at!=='string'||!Number.isFinite(Date.parse(row.expires_at))||Date.parse(row.expires_at)<=now)return null;
  return row.plan;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (env.WPA_MEDIA_APPROVAL_MODE !== "ENABLED") {
      return json({ok:false,error:"approval_gate_disabled"},503);
    }
    if (request.method !== "GET" && request.method !== "POST") {
      return json({ok:false,error:"method_not_allowed"},405);
    }
    const action = (url.searchParams.get("action") || "").toUpperCase();
    const token = url.searchParams.get("token") || "";
    if (!["APPROVE","RETURN"].includes(action) || !token) {
      return json({ok:false,error:"invalid_request"},400);
    }

    const payload = await verifyToken(token, env);
    if (!payload) return json({ok:false,error:"invalid_or_expired_token"},401);

    const now = Math.floor(Date.now()/1000);
    if (payload.exp && payload.exp < now) return json({ok:false,error:"expired_token"},401);
    if (!payload.release_id || !payload.script_sha256 || !payload.manifest_sha256) {
      return json({ok:false,error:"token_missing_release_binding"},400);
    }

    // Production implementation must replace this adapter with durable one-time-use storage.
    if (!env.WPA_MEDIA_APPROVAL_AUDIT) {
      return json({ok:false,error:"audit_store_not_bound"},503);
    }
    const key = `approval:${payload.jti}`;
    const prior = await env.WPA_MEDIA_APPROVAL_AUDIT.get(key);
    if (prior) return json({ok:false,error:"token_already_used"},409);

    const decision = {
      schema:"wpa-media-human-gate-decision/1.0",
      decision: action === "APPROVE" ? "APPROVED_FOR_PRODUCTION" : "RETURN_FOR_REVISION",
      release_id: payload.release_id,
      script_sha256: payload.script_sha256,
      manifest_sha256: payload.manifest_sha256,
      decided_at: new Date().toISOString(),
      approver_ref: payload.approver_ref || "authorised-human-gate",
      token_id: payload.jti
    };

    await env.WPA_MEDIA_APPROVAL_AUDIT.put(key, JSON.stringify(decision));

    if (action === "APPROVE") {
      if (!env.GITHUB_DISPATCH_URL || !env.GITHUB_DISPATCH_TOKEN) {
        return json({ok:true,decision,queued:false,reason:"render_dispatch_not_configured"},202);
      }
      const dispatch = await fetch(env.GITHUB_DISPATCH_URL, {
        method:"POST",
        headers:{
          "Authorization":`Bearer ${env.GITHUB_DISPATCH_TOKEN}`,
          "Accept":"application/vnd.github+json",
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          ref: env.GITHUB_RENDER_REF || "main",
          inputs:{
            release_id:payload.release_id,
            script_sha256:payload.script_sha256,
            manifest_sha256:payload.manifest_sha256,
            approval_token_id:payload.jti
          }
        })
      });
      if (!dispatch.ok) {
        return json({ok:false,error:"render_dispatch_failed",status:dispatch.status,decision},502);
      }
      return html("ОДОБРЕНО","Изданието е одобрено и е испратено во production queue.");
    }

    return html("ВРАТЕНО НА ДОРАБОТКА","Изданието е стопирано и е вратено на редакциска доработка.");
  }
};

function json(data,status=200){
  return new Response(JSON.stringify(data,null,2),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
}
function html(title,text){
  return new Response(`<!doctype html><html lang="mk"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:system-ui;background:#071526;color:#fff;padding:48px"><main style="max-width:720px;margin:auto;border:1px solid #c9a84c;padding:32px"><h1 style="color:#ecd98f">${title}</h1><p>${text}</p><p>World Protocol Academy · Human Gate</p></main></body></html>`,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
}

async function verifyToken(token, env){
  if (!env.WPA_MEDIA_APPROVAL_HMAC_SECRET) return null;
  const parts=token.split(".");
  if(parts.length!==2) return null;
  const [payloadB64,sigB64]=parts;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(env.WPA_MEDIA_APPROVAL_HMAC_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
  const ok=await crypto.subtle.verify("HMAC",key,b64url(sigB64),new TextEncoder().encode(payloadB64));
  if(!ok) return null;
  try{
    return JSON.parse(new TextDecoder().decode(b64url(payloadB64)));
  }catch{return null;}
}
function b64url(s){
  s=s.replace(/-/g,"+").replace(/_/g,"/");
  while(s.length%4)s+="=";
  const bin=atob(s), out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}

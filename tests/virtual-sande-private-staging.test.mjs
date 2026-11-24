import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../workers/virtual-sande-multimodal-pilot/src/index.mjs';

const endpoint='https://wpa-virtual-sande-agent-private-staging.worldprotocolacademy.workers.dev/agent/capabilities';
const secret='test-stage-token-0123456789-abcdef';
const config=readFileSync('workers/virtual-sande-multimodal-pilot/wrangler.staging.toml','utf8');
const coreProd=readFileSync('workers/virtual-sande-v35.1-production/src/index.mjs','utf8');
const coreStage=readFileSync('workers/virtual-sande-v35.1-staging/src/index.mjs','utf8');
const baseEnv={WPA_AGENT_STAGING_ONLY:'true',WPA_AGENT_STAGING_TOKEN:secret,
  WPA_AGENT_ENABLED:'false',WPA_AGENT_MODEL:'gpt-6.1-terra',
  ALLOWED_ORIGINS:'https://worldprotocolacademy.mk'};
function req(path='/agent/capabilities',options={}){
  return new Request(endpoint.replace('/agent/capabilities',path),{
    method:options.method||'GET',
    headers:{Origin:'https://worldprotocolacademy.mk',...(options.token?{'X-WPA-Stage-Token':options.token}:{}),...options.headers},
    ...(options.body?{body:JSON.stringify(options.body)}:{})
  });
}
test('certified academic worker remains byte-identical across prod and staging',()=>{
  assert.equal(coreProd,coreStage);
});
test('independent staging config cannot enable paid provider',()=>{
  assert.match(config,/name = "wpa-virtual-sande-agent-private-staging"/);
  assert.match(config,/WPA_AGENT_STAGING_ONLY = "true"/);
  assert.match(config,/WPA_AGENT_ENABLED = "false"/);
  assert.doesNotMatch(config,/OPENAI_API_KEY\s*=/);
  assert.doesNotMatch(config,/^\s*\[\[ratelimits\]\]/m);
  assert.doesNotMatch(config,/WPA_AGENT_STAGING_TOKEN\s*=/);
});
test('missing staging auth configuration fails shut before reading capabilities',async()=>{
  const r=await worker.fetch(req(),{...baseEnv,WPA_AGENT_STAGING_TOKEN:undefined});
  assert.equal(r.status,503);
  assert.equal((await r.json()).error,'STAGING_AUTH_NOT_CONFIGURED');
});
test('staging capabilities do not respond without private token',async()=>{
  const r=await worker.fetch(req(),baseEnv);
  assert.equal(r.status,403);
  assert.equal((await r.json()).error,'PRIVATE_STAGING_ONLY');
});
test('an incorrect or truncated staging token cannot see capabilities',async()=>{
  for(const x of ['bad',secret+'extra',secret.slice(0,-1),secret.toUpperCase()]){
    const r=await worker.fetch(req('/agent/capabilities',{token:x}),baseEnv);
    assert.equal(r.status,403);
  }
});
test('authenticated staging status is explicitly disabled, with no secrets',async()=>{
  const r=await worker.fetch(req('/agent/capabilities',{token:secret}),baseEnv);
  assert.equal(r.status,200);
  const data=await r.json();
  assert.equal(data.enabled,false);
  assert.equal(data.pdf_synthesis,false);
  assert.equal(data.model_id,'gpt-6.1-terra');
  assert.equal(data.model_connection_status,'NOT_CONNECTED');
  assert.doesNotMatch(JSON.stringify(data),/test-stage-token-/);
});
test('authenticated POST without active provider is 503, never a paid model call',async()=>{
  const r=await worker.fetch(req('/agent/ask',{
    method:'POST',token:secret,headers:{'Content-Type':'application/json'},
    body:{message:'Здраво',consent:true}}),baseEnv);
  assert.equal(r.status,503);
  assert.equal((await r.json()).error,'AGENT_NOT_CONFIGURED');
});
test('unknown route is not exposed to unauthenticated callers',async()=>{
  assert.equal((await worker.fetch(req('/anything-else'),baseEnv)).status,403);
  assert.equal((await worker.fetch(req('/anything-else',{token:secret}),baseEnv)).status,404);
});
test('staging protection still holds if model credentials and rate limit become configured',async()=>{
  const en={
    ...baseEnv,WPA_AGENT_ENABLED:'true',OPENAI_API_KEY:'test-only',
    WPA_AGENT_TURNSTILE_SITE_KEY:'test-public',WPA_AGENT_TURNSTILE_SECRET:'test-private',
    WPA_AGENT_RATE_LIMIT:{limit:async()=>({success:true})}
  };
  const r=await worker.fetch(req('/agent/ask',{method:'POST'}),en);
  assert.equal(r.status,403);
  assert.equal((await r.json()).error,'PRIVATE_STAGING_ONLY');
});
console.log('Private staging boundaries verified without paid API or network calls');

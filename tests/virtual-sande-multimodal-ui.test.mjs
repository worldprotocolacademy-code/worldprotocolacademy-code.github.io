import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync('scripts/virtual-sande-public-widget.js','utf8');
const entry=readFileSync('workers/virtual-sande-v35.1-production/src/index.mjs','utf8');
const certifiedStaging=readFileSync('workers/virtual-sande-v35.1-staging/src/index.mjs','utf8');
const pilot=readFileSync('workers/virtual-sande-multimodal-pilot/src/index.mjs','utf8');
const cfg=readFileSync('workers/virtual-sande-multimodal-pilot/wrangler.toml','utf8');

test('certified v35.1.1 stays byte-identical and the pilot routes separately',()=>{
  assert.equal(entry,certifiedStaging,'production and staging must remain byte-identical');
  assert.doesNotMatch(entry,/maybeHandleAgent|agent-gateway/);
  assert.match(ui,/var ENDPOINTS = \[/);
  assert.match(ui,/wpa-virtual-sande-v35-1-production\.worldprotocolacademy\.workers\.dev\/ask/);
  assert.match(ui,/AGENT_PILOT_ROOT/);
  assert.match(ui,/wpa-virtual-sande-agent-pilot\.worldprotocolacademy\.workers\.dev/);
  assert.match(ui,/useAgent \? await requestAgent\(question\) : await requestAnswer\(question\)/);
  assert.match(pilot,/if \(response\) return response;/);
  assert.match(entry,/return routed\.fetch\(request, env, ctx\);/);
});
test('photo processing is client-side reencoded and opt-in only',()=>{
  assert.match(ui,/function prepareImage\(file\)/);
  assert.match(ui,/canvas\.toDataURL\('image\/jpeg'/);
  assert.match(ui,/EXIF\/GPS/);
  assert.match(ui,/id="wpaPublicVsConsent"/);
  assert.match(ui,/consent: true/);
  assert.match(ui,/turnstile_token: challengeToken/);
  assert.match(ui,/agentCapabilities\.enabled/);
  assert.match(ui,/wpaPublicVsAttach.*disabled/);
});
test('image bytes never enter stored conversation history',()=>{
  assert.match(ui,/pendingImage = null/);
  assert.match(ui,/image_data_url: pendingImage \? pendingImage\.dataUrl : null/);
  assert.match(ui,/history\.push\(\{ role: 'user', content: question \}\)/);
  assert.doesNotMatch(ui,/localStorage\.setItem|sessionStorage\.setItem/);
});
test('pilot disabled by default, no checked-in secrets',()=>{
  assert.match(cfg,/WPA_AGENT_ENABLED\s*=\s*"false"/);
  assert.doesNotMatch(cfg,/WPA_AGENT_ENABLED\s*=\s*"true"/);
  assert.doesNotMatch(cfg,/OPENAI_API_KEY\s*=/);
  assert.doesNotMatch(cfg,/WPA_AGENT_TURNSTILE_SECRET\s*=/);
});
console.log('Virtual Sande independent multimodal UI safeguards registered');

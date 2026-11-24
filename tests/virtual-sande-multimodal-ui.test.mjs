import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync('scripts/virtual-sande-public-widget.js','utf8');
const entry=readFileSync('workers/virtual-sande-v35.1-production/src/index.mjs','utf8');
const cfg=readFileSync('workers/virtual-sande-v35.1-production/wrangler.toml','utf8');

test('canonical /ask Worker remains the default source-based text route',()=>{
  assert.match(ui,/var ENDPOINTS = \[/);
  assert.match(ui,/wpa-virtual-sande-v35-1-production\.worldprotocolacademy\.workers\.dev\/ask/);
  assert.match(ui,/useAgent \? await requestAgent\(question\) : await requestAnswer\(question\)/);
  assert.match(entry,/if \(agent\) return agent;/);
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
test('user image bytes never enter persisted conversation history',()=>{
  assert.match(ui,/pendingImage = null/);
  assert.match(ui,/image_data_url: pendingImage \? pendingImage\.dataUrl : null/);
  assert.match(ui,/history\.push\(\{ role: 'user', content: question \}\)/);
  assert.doesNotMatch(ui,/localStorage\.setItem|sessionStorage\.setItem/);
});
test('pilot cannot be quietly enabled by the production wrangler defaults',()=>{
  assert.doesNotMatch(cfg,/WPA_AGENT_ENABLED\s*=\s*"true"/);
  assert.doesNotMatch(cfg,/OPENAI_API_KEY\s*=/);
  assert.doesNotMatch(cfg,/WPA_AGENT_TURNSTILE_SECRET\s*=/);
});
console.log('Virtual Sande multimodal frontend review tests registered');

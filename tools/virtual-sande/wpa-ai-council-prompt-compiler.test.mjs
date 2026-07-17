import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVISORY_ROLES, compileSeatPrompts, compileCouncilSystemPrompt } from './wpa-ai-council-prompt-compiler.mjs';

test('defines eight advisory roles per doctrine pillar',()=>{
  assert.equal(ADVISORY_ROLES.length,8);
});

test('compiles eighty seats when all pillars are requested',()=>{
  const pack=compileSeatPrompts('протокол воен протокол бонтон етикеција церемонијал дипломатија одбранбена дипломатија односи со јавност комуникологија безбедност',{activeOnly:false});
  assert.equal(pack.seats.length,80);
  assert.ok(pack.seats.every(x=>x.prompt.includes('Diplomatic Protocol Core')));
});

test('system prompt preserves all release gates',()=>{
  const prompt=compileCouncilSystemPrompt('државна посета и безбедност');
  assert.match(prompt,/Diplomatic Protocol Core/);
  assert.match(prompt,/Evidence Gate/);
  assert.match(prompt,/Safety Gate/);
  assert.match(prompt,/Sande Human Approval/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { TACTICAL_ROLES, compileSeatPrompts, compileCouncilSystemPrompt } from './wpa-ai-council-prompt-compiler.mjs';

test('defines eight tactical roles per doctrine pillar',()=>assert.equal(TACTICAL_ROLES.length,8));
test('compiles eighty bounded tactical seats when all pillars are requested',()=>{const pack=compileSeatPrompts('протокол воен протокол бонтон етикеција церемонијал дипломатија одбранбена дипломатија односи со јавност комуникологија безбедност',{activeOnly:false});assert.equal(pack.seats.length,80);assert.ok(pack.seats.every(x=>x.command_level==='tactical_operational'&&x.activation==='approved_directive_required'));assert.ok(pack.seats.every(x=>x.prompt.includes('WPA Preventive Source Compliance Gate')&&x.prompt.includes('Diplomatic Protocol Core')));});
test('system prompt preserves the canonical chain and every release gate',()=>{const prompt=compileCouncilSystemPrompt('државна посета и безбедност');for(const term of ['WPA Doctrine Kernel','GPT + Claude','Virtual Sande','17 executive agents','80 tactical-operational agents','Source Compliance Gate','Diplomatic Protocol Core','Evidence Gate','Safety Gate','Sande Human Approval'])assert.match(prompt,new RegExp(term.replace(/[+]/g,'\\+')));});

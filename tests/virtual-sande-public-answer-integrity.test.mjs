import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isIncompleteAnswer,CORE_OUTPUT_TOKEN_BUDGET} from '../scripts/virtual-sande-answer-integrity.mjs';
import {normalizePayload} from '../tools/virtual-sande/wpa-protocol-bot-v35.1-response-contract.mjs';
test('the reported Macedonian cut-off is detected, even in a long reply',()=>{
 assert.equal(isIncompleteAnswer('Според достапните материјали. '+('Пример за протокол. '.repeat(20))+'Кога'),true);
 assert.equal(isIncompleteAnswer('Распоредот зависи од контекстот.'),false);
});
test('explicit generation stop takes precedence over punctuation',()=>{
 for(const reason of ['length','max_tokens','max_output_tokens','token_limit']){
  assert.equal(isIncompleteAnswer('Complete sentence.',{finish_reason:reason}),true);
  assert.equal(isIncompleteAnswer('Complete sentence.',{stop_reason:reason}),true);
 }
 assert.equal(isIncompleteAnswer('Complete sentence.',{choices:[{finish_reason:'length'}]}),true);
 assert.equal(isIncompleteAnswer('Complete sentence.',{finish_reason:'stop'}),false);
});
test('conservative detection avoids punishing valid bullet labels',()=>{
 assert.equal(isIncompleteAnswer('1. North Macedonia\n2. France'),false);
 assert.equal(isIncompleteAnswer('Клучно е да се утврди дали.'),false);
 assert.equal(isIncompleteAnswer('The next question is what to do when'),true);
});
test('safe contract annotates incomplete answer, does not manufacture completeness or alter evidence',()=>{
 const p=normalizePayload({answer:'Распоредот зависи од настанот. Кога',sources:['source.pdf']});
 assert.equal(p.answerCompleteness,'incomplete');
 assert.deepEqual(p.sources,['source.pdf']);
 assert.equal(normalizePayload({answer:'Завршена реченица.'}).answerCompleteness,undefined);
});
test('real core generator uses the larger bounded budget and existing rescue path',()=>{
 assert.equal(CORE_OUTPUT_TOKEN_BUDGET,640);
 const s=readFileSync('tools/virtual-sande/wpa-protocol-bot-v35-protocolometry-connector.mjs','utf8');
 assert.match(s,/max_tokens: CORE_OUTPUT_TOKEN_BUDGET/);
 assert.match(s,/return isIncompleteAnswer\(answer, out\) \? "" : answer/);
 assert.match(s,/if \(!answer \|\| isIncompleteAnswer\(answer, data\)\) return null/);
 assert.match(s,/Не претставувај правило за домаќин, организација или пресеанс како универзално/);
});

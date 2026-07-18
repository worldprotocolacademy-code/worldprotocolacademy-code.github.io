import test from 'node:test';
import assert from 'node:assert/strict';
import { __test } from './wpa-protocol-bot-v35.1-multisystem-orchestrator.mjs';

test('routes institution IDs to dataset search',()=>assert.equal(__test.intent('Покажи ми го D001').type,'institutions'));
test('routes current diplomacy monitoring to Journal Live',()=>assert.equal(__test.intent('Кои се најновите дипломатски вести денес?').type,'live'));
test('routes WPAWS as governed handoff',()=>assert.deepEqual(__test.intent('Отвори WPAWS со 17 агенти'),{type:'tool',tool:'wpaws'}));
test('delegates ordinary knowledge questions',()=>assert.equal(__test.intent('Што е агреман?').type,'delegate'));
test('preserves prototype and Student Desk governance boundaries',()=>{
  assert.equal(__test.SYSTEMS.audio.status,'prototype_static_phase1');
  assert.equal(__test.SYSTEMS.student_desk.url,'/student-desk/');
  assert.equal(__test.SYSTEMS.student_desk.status,'governed_preview');
  assert.match(__test.SYSTEMS.student_desk.limit.join(' '),/Tier S practice bank is not a certification pool/i);
  assert.match(__test.SYSTEMS.student_desk.limit.join(' '),/no automatic enrolment, official grade or certificate issuance/i);
  assert.equal(__test.SYSTEMS.symbols.status,'verified_dataset_ui');
});

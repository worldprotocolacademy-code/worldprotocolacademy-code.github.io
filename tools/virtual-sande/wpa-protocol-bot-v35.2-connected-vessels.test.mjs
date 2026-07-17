import test from 'node:test';
import assert from 'node:assert/strict';
import { __test } from './wpa-protocol-bot-v35.2-connected-vessels.mjs';

test('routes protocolometry requests',()=>{
  const ids=__test.routeMessage('Објасни ја протоколометријата и индексите').map(x=>x.id);
  assert.ok(ids.includes('protocolometry'));
});

test('routes combined ecosystem requests to multiple systems',()=>{
  const ids=__test.routeMessage('Поврзи Student Desk со Journal Watch и Sublimate').map(x=>x.id);
  assert.ok(ids.includes('student_desk'));
  assert.ok(ids.includes('journal_watch'));
  assert.ok(ids.includes('sublimate'));
});

test('routes all phase 2 systems',()=>{
  const ids=__test.routeMessage('Поврзи Audio Media Engine, WPAWS, Academic Search Hub, Protocol Symbols Lab, Multi-AI Command Center, Volume I Issue I и Diplomatic Analysis Lab').map(x=>x.id);
  for (const id of ['audio_media','wpaws','academic_search','protocol_symbols','multi_ai','journal_issue_1','diplomatic_analysis']) assert.ok(ids.includes(id),id);
});

test('preserves phase 2 status boundaries',()=>{
  assert.equal(__test.EXTRA_SYSTEMS.multi_ai.status,'simulation_prototype');
  assert.equal(__test.EXTRA_SYSTEMS.protocol_symbols.status,'verified_dataset_ui');
  assert.equal(__test.EXTRA_SYSTEMS.journal_issue_1.status,'public_flipbook_forthcoming_identifiers');
});

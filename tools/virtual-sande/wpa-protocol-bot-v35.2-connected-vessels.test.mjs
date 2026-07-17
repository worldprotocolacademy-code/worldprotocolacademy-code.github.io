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

test('includes services and intelligence center',()=>{
  assert.equal(__test.EXTRA_SYSTEMS.services.status,'live_request_builder');
  assert.equal(__test.EXTRA_SYSTEMS.intelligence_center.status,'public_source_analysis');
});

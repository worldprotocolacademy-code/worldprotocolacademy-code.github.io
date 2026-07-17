import test from 'node:test';
import assert from 'node:assert/strict';
import { __test } from './wpa-protocol-bot-v35.2-connected-vessels.mjs';

test('routes protocolometry requests',()=>{
  const ids=__test.routeMessage('Објасни ја протоколометријата и индексите').map(x=>x.id);
  assert.ok(ids.includes('protocolometry'));
});

test('routes connected WPA output surfaces',()=>{
  const ids=__test.routeMessage('Поврзи Premium Briefings, Services, Institutional Profile и Digital Pavilion').map(x=>x.id);
  for(const id of ['premium_briefings','services','institutional_profile','digital_pavilion'])assert.ok(ids.includes(id),id);
});

test('routes research through Academic Search Hub and WPAWS',()=>{
  const ids=__test.routeMessage('Пронајди ги сите книги преку Academic Search Hub и 17 агенти').map(x=>x.id);
  assert.ok(ids.includes('academic_search'));
  assert.ok(ids.includes('wpaws'));
});

test('builds comprehensive central orchestration plan',()=>{
  const plan=__test.buildOrchestrationPlan('Сеопфатно истражување на сите книги за десет области');
  assert.equal(plan.mode,'comprehensive');
  assert.equal(plan.wpaws_agents.length,17);
  assert.equal(plan.council.advisory_seats.length,80);
  assert.equal(plan.diplomatic_protocol_core,'mandatory');
});

test('preserves safety and public-brand boundaries',()=>{
  assert.equal(__test.EXTRA_SYSTEMS.intelligence_center.status,'protocolometry_legacy_alias');
  assert.equal(__test.EXTRA_SYSTEMS.multi_ai.status,'simulation_prototype');
  const plan=__test.buildOrchestrationPlan('Објави автоматски');
  assert.equal(plan.governance.no_automatic_publication,true);
  assert.equal(plan.release_status,'blocked_pending_mandatory_gates');
});

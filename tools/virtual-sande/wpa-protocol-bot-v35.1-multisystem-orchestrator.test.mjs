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

test('institution search is resolved through canonical status with REV7 fail-safe',()=>{
  assert.equal(__test.MASTER_STATUS_PATH,'/data/master-list-verification-status.json');
  assert.match(__test.MASTER_FALLBACK_PATH,/v1\.0-corrected-4f-rev7\/WPA_Global_Institutions_Master_v1\.0-CORRECTED-4F-REV7\.json$/);
  const status={canonical_sources:[
    '/MASTER-LIST-CANONICAL.md',
    '/data/global-institutions/v1.0-corrected-4f-rev7/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json'
  ]};
  assert.equal(__test.canonicalSourcePathFromStatus(status),status.canonical_sources[1]);
  assert.equal(__test.canonicalSourcePathFromStatus({}),__test.MASTER_FALLBACK_PATH);
  assert.match(__test.SYSTEMS.institutions.can.join(' '),/current canonical master-list dataset/i);
  assert.doesNotMatch(__test.SYSTEMS.institutions.can.join(' '),/160 records/i);
});

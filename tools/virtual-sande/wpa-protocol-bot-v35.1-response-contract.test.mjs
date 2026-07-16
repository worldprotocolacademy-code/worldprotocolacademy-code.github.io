import test from 'node:test';
import assert from 'node:assert/strict';
import {
  API_VERSION,
  ORCHESTRATOR_VERSION,
  BASE_VERSION,
  RESPONSE_CONTRACT,
  greetingIntent,
  greetingPayload,
  normalizePayload,
  normalizeResponse,
} from './wpa-protocol-bot-v35.1-response-contract.mjs';

test('detects bounded Macedonian and English greetings', () => {
  assert.equal(greetingIntent('Здраво!'), 'mk');
  assert.equal(greetingIntent('Good morning'), 'en');
  assert.equal(greetingIntent('Што е протокол?'), null);
});

test('builds a retrieval-free greeting envelope', () => {
  const data = greetingPayload('mk');
  assert.equal(data.ok, true);
  assert.equal(data.version, API_VERSION);
  assert.equal(data.runtime, ORCHESTRATOR_VERSION);
  assert.equal(data.base, BASE_VERSION);
  assert.equal(data.contract, RESPONSE_CONTRACT);
  assert.equal(data.mode, 'greeting');
  assert.equal(data.hasContext, false);
  assert.deepEqual(data.sources, []);
  assert.match(data.answer, /Virtual Sande/);
});

test('forces no-context metadata to false even when the base worker marks it true', () => {
  const data = normalizePayload({
    ok: true,
    version: 'v35.0-protocolometry-connector',
    hasContext: true,
    mode: 'author',
    servedBy: 'no-context',
    sources: [],
    sourceDetails: [],
    answer: 'Недоволно информации.'
  });
  assert.equal(data.version, API_VERSION);
  assert.equal(data.runtime, ORCHESTRATOR_VERSION);
  assert.equal(data.base, BASE_VERSION);
  assert.equal(data.hasContext, false);
});

test('preserves real evidence context and normalizes missing arrays', () => {
  const data = normalizePayload({
    ok: true,
    hasContext: false,
    mode: 'core_definition_block',
    servedBy: 'v33.9-core-def',
    sources: ['wpa-core-definition-block'],
    answer: 'Одговор'
  });
  assert.equal(data.hasContext, true);
  assert.deepEqual(data.sources, ['wpa-core-definition-block']);
  assert.deepEqual(data.sourceDetails, []);
});

test('normalizes delegated JSON responses and adds contract headers', async () => {
  const source = new Response(JSON.stringify({
    ok: true,
    version: 'v35.0-protocolometry-connector',
    hasContext: true,
    mode: 'none',
    servedBy: 'no-context',
    answer: 'Нема контекст.'
  }), { headers: { 'content-type': 'application/json' } });
  const response = await normalizeResponse(source);
  const data = await response.json();
  assert.equal(data.version, API_VERSION);
  assert.equal(data.hasContext, false);
  assert.equal(response.headers.get('x-wpa-runtime'), ORCHESTRATOR_VERSION);
  assert.equal(response.headers.get('x-wpa-response-contract'), RESPONSE_CONTRACT);
});

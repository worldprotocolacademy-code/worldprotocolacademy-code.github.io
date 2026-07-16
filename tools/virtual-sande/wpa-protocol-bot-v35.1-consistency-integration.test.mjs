import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './wpa-protocol-bot-v35.1-safe-entrypoint.mjs';

const env = {
  ALLOWED_ORIGINS: 'https://worldprotocolacademy-code.github.io',
};

async function jsonAt(path) {
  const response = await worker.fetch(new Request(`https://worker.example${path}`), env);
  return { response, data: await response.json() };
}

test('orchestrator health exposes one public version and explicit base', async () => {
  const { response, data } = await jsonAt('/orchestrator/health');
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.version, 'v35.1.1');
  assert.equal(data.runtime, 'v35.1.1-multisystem-orchestrator');
  assert.equal(data.base, 'v35.0-protocolometry-connector');
  assert.equal(data.contract, 'wpa-virtual-sande-response-v1.1');
  assert.equal(data.hasContext, false);
  assert.equal(data.mode, 'health');
});

test('safe-entrypoint health exposes the same public contract', async () => {
  const { response, data } = await jsonAt('/safe-entrypoint/health');
  assert.equal(response.status, 200);
  assert.equal(data.version, 'v35.1.1');
  assert.equal(data.runtime, 'v35.1.1-safe-entrypoint');
  assert.equal(data.orchestrator, 'v35.1.1-multisystem-orchestrator');
  assert.equal(response.headers.get('x-wpa-response-contract'), 'wpa-virtual-sande-response-v1.1');
});

test('Macedonian greeting does not enter retrieval fallback', async () => {
  const { response, data } = await jsonAt('/ask?message=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D0%BE&lang=mk');
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.version, 'v35.1.1');
  assert.equal(data.mode, 'greeting');
  assert.equal(data.servedBy, 'v35.1.1-greeting');
  assert.equal(data.hasContext, false);
  assert.deepEqual(data.sources, []);
  assert.match(data.answer, /академскиот AI асистент/);
});

test('English greeting follows the same contract', async () => {
  const { data } = await jsonAt('/ask?message=Hello&lang=en');
  assert.equal(data.mode, 'greeting');
  assert.equal(data.answerLang, 'en');
  assert.equal(data.hasContext, false);
  assert.match(data.answer, /academic AI assistant/);
});

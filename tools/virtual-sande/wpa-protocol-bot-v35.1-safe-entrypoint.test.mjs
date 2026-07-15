import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { __test } from './wpa-protocol-bot-v35.1-safe-entrypoint.mjs';

const askUrl = (message) => `https://worker.example/ask?message=${encodeURIComponent(message)}&lang=mk`;

test('rejects unsupported methods before routing', async () => {
  const response = await worker.fetch(new Request(askUrl('Отвори WPAWS'), { method: 'PUT' }), {});
  assert.equal(response.status, 405);
});

test('rejects disallowed origin before routing', async () => {
  const response = await worker.fetch(new Request(askUrl('Отвори WPAWS'), {
    headers: { Origin: 'https://evil.example' }
  }), {});
  assert.equal(response.status, 403);
});

test('rejects overlong routed messages', async () => {
  const response = await worker.fetch(new Request(askUrl(`WPAWS ${'x'.repeat(701)}`)), {});
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /too long/i);
});

test('rejects more than three URLs', async () => {
  const message = 'WPAWS https://a.example https://b.example https://c.example https://d.example';
  const response = await worker.fetch(new Request(askUrl(message)), {});
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /too many urls/i);
});

test('specific live query filters unrelated high-score items', () => {
  const items = [
    {
      title: 'European diplomatic summit opens in Brussels',
      summary: 'Ministers discuss regional diplomacy.',
      primary_category: 'diplomacy',
      relevance_score: 99,
      source_confidence: 99
    },
    {
      title: 'Fiji state ceremony and diplomatic reception',
      summary: 'A public protocol event in Fiji.',
      country: 'Fiji',
      primary_category: 'protocol',
      relevance_score: 40,
      source_confidence: 60
    }
  ];
  const results = __test.rank(items, 'Latest diplomatic news about Fiji');
  assert.equal(results.length, 1);
  assert.match(results[0].record.title, /Fiji/i);
});

test('specific live query returns no unrelated fallback', () => {
  const items = [{
    title: 'European diplomatic summit opens in Brussels',
    summary: 'Ministers discuss regional diplomacy.',
    primary_category: 'diplomacy',
    relevance_score: 99,
    source_confidence: 99
  }];
  assert.equal(__test.rank(items, 'Latest diplomatic news about Fiji').length, 0);
});

test('broad diplomacy query still returns diplomacy items', () => {
  const items = [
    { title: 'Trade update', primary_category: 'communication', relevance_score: 90, source_confidence: 90 },
    { title: 'Ministerial meeting', primary_category: 'diplomacy', relevance_score: 20, source_confidence: 30 }
  ];
  const results = __test.rank(items, 'Кои се најновите дипломатски вести денес?');
  assert.equal(results.length, 1);
  assert.equal(results[0].record.primary_category, 'diplomacy');
});

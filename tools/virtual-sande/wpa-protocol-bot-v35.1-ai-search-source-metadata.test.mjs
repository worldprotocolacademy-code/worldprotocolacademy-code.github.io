import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeAiSearchResult,
  originalAiSearchSourceName,
  withOriginalAiSearchSourceNames,
  wrapAiBinding,
} from './wpa-protocol-bot-v35.1-ai-search-source-metadata.mjs';

const sourceKey = '__ai_search_ready_v3__/80cd2f51cf9ddb429562/11_vienna_conventions/Vienna Convention 1961.pdf';
const hashedName = 'wpa-445f023461f5c30da7638e79f45c95030663fbcba7a90987.pdf';

test('metadata.source_key overrides the generated storage filename', () => {
  assert.equal(originalAiSearchSourceName({
    filename: hashedName,
    metadata: { source_key: sourceKey },
  }), sourceKey);
});

test('legacy AutoRAG attributes.file metadata overrides the generated filename', () => {
  assert.equal(originalAiSearchSourceName({
    filename: hashedName,
    attributes: {
      filename: hashedName,
      file: { source_key: sourceKey },
    },
  }), sourceKey);
});

test('new AI Search chunk item.metadata overrides the generated item key', () => {
  assert.equal(originalAiSearchSourceName({
    item: {
      key: hashedName,
      metadata: { source_key: sourceKey },
    },
  }), sourceKey);
});

test('JSON-string metadata is supported', () => {
  assert.equal(originalAiSearchSourceName({
    filename: hashedName,
    metadata: JSON.stringify({ source_key: sourceKey }),
  }), sourceKey);
});

test('data, results, and chunks expose original source names across Cloudflare shapes', () => {
  const normalized = normalizeAiSearchResult({
    data: [{
      filename: hashedName,
      attributes: { filename: hashedName, file: { source_key: sourceKey } },
    }],
    results: [{
      source: hashedName,
      metadata: JSON.stringify({ source_key: sourceKey }),
    }],
    chunks: [{
      item: { key: hashedName, metadata: { source_key: sourceKey } },
    }],
  });

  for (const item of [...normalized.data, ...normalized.results, ...normalized.chunks]) {
    assert.equal(item.filename, sourceKey);
    assert.equal(item.source, sourceKey);
    assert.equal(item.metadata.source_key, sourceKey);
    assert.equal(item.metadata.storage_filename, hashedName);
  }

  assert.equal(normalized.data[0].attributes.file.source_key, sourceKey);
  assert.equal(normalized.data[0].attributes.file.storage_filename, hashedName);
  assert.equal(normalized.chunks[0].item.metadata.source_key, sourceKey);
  assert.equal(normalized.chunks[0].item.metadata.storage_filename, hashedName);
});

test('the AI wrapper normalizes actual AutoRAG attributes.file results and preserves AI.run', async () => {
  const calls = [];
  const ai = {
    autorag(name) {
      calls.push(['autorag', name]);
      return {
        async search(options) {
          calls.push(['search', options.query]);
          return {
            data: [{
              filename: hashedName,
              attributes: { filename: hashedName, file: { source_key: sourceKey } },
            }],
          };
        },
      };
    },
    async run(model) {
      calls.push(['run', model]);
      return { response: 'ok' };
    },
  };

  const wrapped = wrapAiBinding(ai);
  const search = await wrapped.autorag('protocol-ai-v4-final').search({ query: 'agrément' });
  assert.equal(search.data[0].filename, sourceKey);
  assert.deepEqual(await wrapped.run('model'), { response: 'ok' });
  assert.deepEqual(calls, [
    ['autorag', 'protocol-ai-v4-final'],
    ['search', 'agrément'],
    ['run', 'model'],
  ]);
});

test('the Worker adapter changes only the AI binding visible to fetch', async () => {
  const worker = {
    async fetch(_request, env) {
      const result = await env.AI.autorag('protocol-ai-v4-final').search({ query: 'protocol' });
      return new Response(JSON.stringify({
        filename: result.data[0].filename,
        marker: env.MARKER,
      }));
    },
  };
  const adapted = withOriginalAiSearchSourceNames(worker);
  const response = await adapted.fetch(new Request('https://example.test'), {
    MARKER: 'preserved',
    AI: {
      autorag() {
        return {
          async search() {
            return {
              data: [{
                filename: hashedName,
                attributes: { filename: hashedName, file: { source_key: sourceKey } },
              }],
            };
          },
        };
      },
    },
  });
  assert.deepEqual(await response.json(), { filename: sourceKey, marker: 'preserved' });
});

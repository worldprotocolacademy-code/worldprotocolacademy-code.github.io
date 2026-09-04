/* WPA Journal Live real-source resilience layer.
 * Production never substitutes synthetic news when the Live Worker is unavailable.
 * Fallback order: hourly wpa-live-data branch -> same-origin last committed real snapshot.
 */
(() => {
  'use strict';

  window.WPA_LIVE_DEMO_ENABLED = false;
  delete window.WPA_LIVE_DEMO_DATA;

  const nativeFetch = window.fetch.bind(window);
  const RAW_ROOT = 'https://raw.githubusercontent.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/wpa-live-data/tools/wpa-watch';
  const LOCAL_ROOT = '/tools/wpa-watch';
  const CACHE_MS = 60000;
  let cache = null;
  let cacheAt = 0;

  const clean = (value = '') => String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const safeDate = (value) => {
    const time = new Date(value || '').getTime();
    return Number.isFinite(time) ? new Date(time).toISOString() : null;
  };
  const category = (domain) => {
    const value = String(domain || '').toLowerCase();
    if (['protocol','diplomacy','security','communication'].includes(value)) return value;
    if (value === 'pr' || value === 'communicology' || value === 'academic') return 'communication';
    return 'communication';
  };
  const confidenceFor = (item) => {
    if (Number.isFinite(Number(item.source_confidence))) return Number(item.source_confidence);
    const tier = String(item.source_tier || '').toUpperCase();
    if (tier === 'PRIMARY_OFFICIAL') return 95;
    if (tier === 'PRIMARY_INFRASTRUCTURE') return 92;
    if (tier === 'SPECIALIST_PUBLIC') return 82;
    return 75;
  };

  function adaptItem(item, status) {
    const published = safeDate(item.published_at || item.isoDate || item.published);
    const fetched = safeDate(item.fetched_at || status?.generated) || new Date().toISOString();
    const domain = category(item.domain);
    return {
      id: item.id || item.link || `${item.source || 'source'}:${item.title || ''}`,
      title: clean(item.title || 'Без наслов'),
      source: clean(item.source || item.source_name || 'Public source'),
      source_type: item.source_type || item.transport || 'public_feed',
      original_url: item.link || item.original_url || '',
      published_at: published,
      fetched_at: fetched,
      country: item.country || '',
      region: item.region || 'Global',
      language: item.language || 'en',
      primary_category: domain,
      signals: Array.from(new Set([domain, ...(item.wpa_relevance_reasons || []), ...(item.signals || [])].filter(Boolean))),
      summary: clean(item.summary || item.summary_raw || '').slice(0, 800),
      relevance_score: Number(item.wpa_relevance_score || item.relevance_score || 0),
      source_confidence: confidenceFor(item),
      verification_status: item.verification_status || 'public_source_traceable',
      source_health_status: 'ok',
      source_last_success_at: fetched,
      human_review: false,
      sande_review_status: 'rules_ready',
      fallback_snapshot: true
    };
  }

  async function fetchJson(url, signal) {
    const response = await nativeFetch(url, { cache: 'no-store', signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response.json();
  }

  async function loadSnapshot(signal) {
    if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
    let status;
    let items;
    let source = 'wpa-live-data';
    try {
      [status, items] = await Promise.all([
        fetchJson(`${RAW_ROOT}/status.json`, signal),
        fetchJson(`${RAW_ROOT}/items.json`, signal)
      ]);
    } catch {
      source = 'same-origin-last-real-snapshot';
      [status, items] = await Promise.all([
        fetchJson(`${LOCAL_ROOT}/status.json`, signal),
        fetchJson(`${LOCAL_ROOT}/items.json`, signal)
      ]);
    }

    if (!Array.isArray(items)) throw new Error('Real-source snapshot items are invalid');
    const adapted = items
      .filter((item) => /^https?:\/\//i.test(String(item.link || item.original_url || '')))
      .filter((item) => !/example\.invalid|WPA Demo/i.test(`${item.link || ''} ${item.source || ''} ${item.title || ''}`))
      .map((item) => adaptItem(item, status));
    if (!adapted.length) throw new Error('No real public-source items available in fallback snapshot');

    const now = Date.now();
    const published24h = adapted.filter((item) => {
      const time = new Date(item.published_at || '').getTime();
      return Number.isFinite(time) && time <= now + 3600000 && now - time <= 86400000;
    }).length;

    cache = { status, items: adapted, source, published24h };
    cacheAt = Date.now();
    return cache;
  }

  function jsonResponse(payload) {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-wpa-source-mode': 'real-source-fallback'
      }
    });
  }

  async function fallbackResponse(url, signal) {
    const snapshot = await loadSnapshot(signal);
    const path = new URL(url, location.href).pathname;
    const generated = snapshot.status?.generated || new Date().toISOString();
    if (path.endsWith('/api/v1/stats')) {
      return jsonResponse({
        mode: 'REAL_SOURCE_FALLBACK',
        sources: { active: Number(snapshot.status?.sources_live || 0), enabled: Number(snapshot.status?.sources_enabled || snapshot.status?.sources_total || 0) },
        items: { published_24h: snapshot.published24h, total: snapshot.items.length },
        latest: { latest_fetch: generated },
        fallback_source: snapshot.source
      });
    }
    if (path.endsWith('/api/v1/ticker')) {
      return jsonResponse({ mode: 'REAL_SOURCE_FALLBACK', generated_at: generated, items: snapshot.items.slice(0, 40), fallback_source: snapshot.source });
    }
    if (path.endsWith('/api/v1/live')) {
      return jsonResponse({ mode: 'REAL_SOURCE_FALLBACK', generated_at: generated, items: snapshot.items.slice(0, 120), fallback_source: snapshot.source });
    }
    return null;
  }

  window.fetch = async function wpaRealSourceResilientFetch(input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const isLiveRead = /\/api\/v1\/(?:stats|live|ticker)(?:\?|$)/.test(url);
    if (!isLiveRead) return nativeFetch(input, init);
    try {
      const response = await nativeFetch(input, init);
      if (response.ok) return response;
    } catch {}
    const fallback = await fallbackResponse(url, init?.signal);
    if (fallback) return fallback;
    return nativeFetch(input, init);
  };

  /* Existing Journal-only enhancement chain remains isolated from collection. */
  document.write('<script src="noise-hardening.js?v=20260713-r2.1"><\/script>');
  document.write('<script src="fusion-lenses.js?v=20260713-x1191"><\/script>');
  document.write('<script src="analyst-workflow.js?v=20260713-x1191"><\/script>');
  document.write('<script src="x119-editorial-intelligence.js?v=20260713-x1191"><\/script>');
  document.write('<script src="analyst-core.js?v=20260713-x1191"><\/script>');
  document.write('<script src="analyst-export.js?v=20260713-x1191"><\/script>');
  document.write('<script src="/scripts/wpa-social-bridge.js?v=20260713-1"><\/script>');
})();

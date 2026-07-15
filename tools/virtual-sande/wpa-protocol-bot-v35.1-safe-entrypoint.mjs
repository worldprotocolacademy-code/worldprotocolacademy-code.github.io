import orchestrator from './wpa-protocol-bot-v35.1-multisystem-orchestrator.mjs';

const VERSION = 'v35.1-safe-entrypoint';
const LIVE_ROOT = 'https://wpa-live-production-bridge.worldprotocolacademy.workers.dev';
const MAX_MESSAGE_LENGTH = 700;
const MAX_URLS_IN_MESSAGE = 3;
const DEFAULT_ALLOWED_ORIGINS = [
  'https://worldprotocolacademy-code.github.io',
  'https://worldprotocolacademy.com',
  'https://www.worldprotocolacademy.com'
];

const STOPWORDS = new Set([
  'a','an','and','about','for','from','in','is','latest','live','news','of','on','show','the','today','what','which','with','you',
  'а','во','денес','за','и','кои','која','кој','ми','на','најнов','најнова','најнови','најновите','од','покажи','се','со','што','вести'
]);

const clean = (value) => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const sanitize = (value) => String(value || '').replace(/\u0000/g, '').replace(/\r/g, '').trim();
const countUrls = (value) => (String(value || '').match(/https?:\/\/|www\./gi) || []).length;
const liveRoot = (env) => String(env?.WPA_LIVE_API_ROOT || LIVE_ROOT).replace(/\/+$/, '');

function allowedOrigins(env) {
  return [...new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...String(env?.ALLOWED_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean)
  ])];
}

function headers(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0],
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    vary: 'Origin'
  };
}

function json(data, request, env, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: headers(request, env) });
}

async function payload(request, url) {
  let message = url.searchParams.get('message') || url.searchParams.get('q') || '';
  let lang = url.searchParams.get('lang') || '';
  if (request.method === 'POST') {
    try {
      const body = await request.clone().json();
      message = message || body.message || body.q || body.prompt || '';
      lang = lang || body.lang || body.rawLang || body.aiLang || '';
    } catch {}
  }
  return { message: sanitize(message), lang: String(lang).toLowerCase().trim() };
}

function validateAsk(request, env, message) {
  const origin = request.headers.get('Origin') || '';
  if (origin && !allowedOrigins(env).includes(origin)) return { status: 403, error: 'Origin not allowed.' };
  if (!message) return { status: 400, error: 'Use /ask?message=...&lang=mk|en|...' };
  if (message.length > MAX_MESSAGE_LENGTH) return { status: 400, error: 'Message too long.' };
  if (countUrls(message) > MAX_URLS_IN_MESSAGE) return { status: 400, error: 'Too many URLs in one request.' };
  return null;
}

function isLiveIntent(message) {
  const q = clean(message);
  return (/journal live|global monitor|live monitor|жив монитор/.test(q)) ||
    (/најнов|latest|today|денес|live|вести/.test(q) && /протокол|диплом|security|безбед|communication|комуника/.test(q));
}

function domainKeys(query) {
  const q = clean(query);
  const out = [];
  if (/протокол|protocol/.test(q)) out.push('protocol');
  if (/диплом|diplom/.test(q)) out.push('diplomacy');
  if (/безбед|security/.test(q)) out.push('security');
  if (/комуника|communication|public relations|\bpr\b/.test(q)) out.push('communication');
  return [...new Set(out)];
}

function isDomainToken(token) {
  return /^(протокол|protocol|диплом|diplom|безбед|security|комуника|communication|public|relations|pr)/.test(token);
}

function queryTerms(query) {
  const tokens = clean(query).split(' ').filter((token) => token.length > 2);
  const specific = [...new Set(tokens.filter((token) => !STOPWORDS.has(token) && !isDomainToken(token)))];
  return { specific, domains: domainKeys(query) };
}

function rank(items, query) {
  const { specific, domains } = queryTerms(query);
  return (Array.isArray(items) ? items : []).map((record) => {
    const haystack = clean([
      record.title, record.summary, record.source, record.country, record.region,
      record.primary_category, ...(Array.isArray(record.signals) ? record.signals : [])
    ].join(' '));
    const specificMatches = specific.filter((token) => haystack.includes(token)).length;
    const domainMatches = domains.filter((domain) => haystack.includes(domain)).length;
    const score = Number(record.relevance_score || 0) + Number(record.source_confidence || 0) + specificMatches * 25 + domainMatches * 8;
    return { record, score, specificMatches, domainMatches };
  }).filter((entry) => {
    if (specific.length) return entry.specificMatches > 0;
    if (domains.length) return entry.domainMatches > 0;
    return true;
  }).sort((a, b) => b.score - a.score).slice(0, 5);
}

async function fetchLive(query, env) {
  const root = liveRoot(env);
  const response = await fetch(`${root}/api/v1/live?limit=120`, { headers: { accept: 'application/json' } });
  if (!response.ok) return { root, total: 0, results: [] };
  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return { root, total: items.length, results: rank(items, query) };
}

function isEnglish(lang, message) {
  return lang === 'en' || (lang !== 'mk' && !/[а-шѓќѕџјљњ]/i.test(message));
}

function liveAnswer(search, query, english) {
  if (!search.total) return english ? 'WPA Journal Live returned no items.' : 'WPA Journal Live не врати записи.';
  if (!search.results.length) {
    return english
      ? `WPA Journal Live found no query-matching public-source candidates for “${query}”. Unrelated feed items were not shown.`
      : `WPA Journal Live не најде public-source candidates што одговараат на „${query}“. Нерелевантни feed записи не се прикажани.`;
  }
  const rows = search.results.map(({ record }) => `• ${record.title || 'Без наслов'} — ${record.source || 'Unknown source'} · R ${record.relevance_score ?? '—'} / C ${record.source_confidence ?? '—'}${record.original_url ? ` · ${record.original_url}` : ''}`);
  const boundary = english
    ? 'These are not independently verified WPA findings. Check the original source and apply human review.'
    : 'Ова не се независно верификувани WPA наоди. Провери го оригиналниот извор и примени човечка проверка.';
  return `${english ? 'Public-source candidates' : 'Public-source candidates'} за „${query}“:\n${rows.join('\n')}\n\n${boundary}`;
}

export const __test = { validateAsk, isLiveIntent, queryTerms, rank };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(request, env) });
    if (request.method !== 'GET' && request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, request, env, 405);

    const url = new URL(request.url);
    if (url.pathname === '/safe-entrypoint/health') {
      return json({ ok: true, version: VERSION, orchestrator: 'v35.1-multisystem-orchestrator' }, request, env);
    }
    if (url.pathname !== '/ask') return orchestrator.fetch(request, env);

    const delegated = request.clone();
    const p = await payload(request, url);
    const invalid = validateAsk(request, env, p.message);
    if (invalid) return json({ ok: false, error: invalid.error }, request, env, invalid.status);

    if (!isLiveIntent(p.message)) return orchestrator.fetch(delegated, env);

    try {
      const search = await fetchLive(p.message, env);
      return json({
        ok: true,
        version: VERSION,
        mode: 'journal_live_strict_search',
        servedBy: VERSION,
        human_review_required: true,
        source: `${search.root}/api/v1/live`,
        results: search.results.map(({ record }) => record),
        answer: liveAnswer(search, p.message, isEnglish(p.lang, p.message))
      }, request, env);
    } catch {
      return json({
        ok: true,
        version: VERSION,
        mode: 'journal_live_unavailable',
        servedBy: VERSION,
        human_review_required: true,
        results: [],
        answer: isEnglish(p.lang, p.message)
          ? 'WPA Journal Live is temporarily unavailable. No substitute or unrelated items were shown.'
          : 'WPA Journal Live моментално е недостапен. Не се прикажани заменски или нерелевантни записи.'
      }, request, env);
    }
  }
};

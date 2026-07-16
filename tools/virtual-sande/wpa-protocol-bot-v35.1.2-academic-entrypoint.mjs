import upstreamWorker from './wpa-protocol-bot-v35.1-safe-entrypoint.mjs';
import { ACADEMIC_CORE_VERSION, academicIntent, academicPayload } from './wpa-protocol-bot-v35.1.2-academic-core.mjs';

export const API_VERSION = 'v35.1.2';
export const RUNTIME_VERSION = 'v35.1.2-academic-entrypoint';
export const UPSTREAM_VERSION = 'v35.1.1-safe-entrypoint';
export const BASE_VERSION = 'v35.0-protocolometry-connector';
export const RESPONSE_CONTRACT = 'wpa-virtual-sande-response-v1.2';

const MAX_MESSAGE_LENGTH = 700;
const MAX_URLS_IN_MESSAGE = 3;
const DEFAULT_ALLOWED_ORIGINS = [
  'https://worldprotocolacademy-code.github.io',
  'https://worldprotocolacademy.com',
  'https://www.worldprotocolacademy.com',
];
const NO_CONTEXT = new Set(['no-context','llm-no-context','timeout-no-context','mk-purity-fallback','external-author-hard-fail-fallback','persona-hard-fail']);

const cleanAnswer = (value) => String(value || '').replace(/не\s+видам/giu, 'не гледам');
const sanitize = (value) => String(value || '').replace(/\u0000/g, '').replace(/\r/g, '').trim();
const countUrls = (value) => (String(value || '').match(/https?:\/\/|www\./gi) || []).length;
function allowedOrigins(env) {
  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...String(env?.ALLOWED_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean)])];
}
function headers(request, env, source = {}) {
  const origin = request.headers.get('Origin') || '';
  const allowed = allowedOrigins(env);
  const out = new Headers(source);
  out.delete('content-length');
  out.delete('content-encoding');
  out.delete('etag');
  out.set('content-type', 'application/json; charset=utf-8');
  out.set('cache-control', 'no-store');
  out.set('access-control-allow-origin', allowed.includes(origin) ? origin : allowed[0]);
  out.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  out.set('access-control-allow-headers', 'content-type,authorization');
  out.set('x-wpa-runtime', RUNTIME_VERSION);
  out.set('x-wpa-response-contract', RESPONSE_CONTRACT);
  out.set('x-wpa-academic-core', ACADEMIC_CORE_VERSION);
  out.set('vary', 'Origin');
  return out;
}
function json(data, request, env, status = 200, sourceHeaders = undefined) {
  return new Response(JSON.stringify(normalizePayload(data), null, 2), { status, headers: headers(request, env, sourceHeaders) });
}
async function requestPayload(request, url) {
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
function validate(request, env, message) {
  const origin = request.headers.get('Origin') || '';
  if (origin && !allowedOrigins(env).includes(origin)) return { status: 403, error: 'Origin not allowed.' };
  if (!message) return { status: 400, error: 'Use /ask?message=...&lang=mk|en|...' };
  if (message.length > MAX_MESSAGE_LENGTH) return { status: 400, error: 'Message too long.' };
  if (countUrls(message) > MAX_URLS_IN_MESSAGE) return { status: 400, error: 'Too many URLs in one request.' };
  return null;
}
export function normalizePayload(input = {}) {
  const data = input && typeof input === 'object' ? { ...input } : {};
  const sources = Array.isArray(data.sources) ? data.sources.filter(Boolean) : [];
  const sourceDetails = Array.isArray(data.sourceDetails) ? data.sourceDetails : [];
  const results = Array.isArray(data.results) ? data.results : undefined;
  const servedBy = String(data.servedBy || '').trim();
  const explicitNoContext = NO_CONTEXT.has(servedBy) || data.mode === 'none';
  const evidencePresent = sources.length > 0 || sourceDetails.length > 0 || Boolean(results?.length);
  return {
    ...data,
    version: API_VERSION,
    runtime: RUNTIME_VERSION,
    upstreamRuntime: servedBy === ACADEMIC_CORE_VERSION ? null : String(data.runtime || data.upstreamRuntime || UPSTREAM_VERSION),
    base: String(data.base || BASE_VERSION),
    contract: RESPONSE_CONTRACT,
    academicCore: String(data.academicCore || ACADEMIC_CORE_VERSION),
    hasContext: explicitNoContext ? false : Boolean(data.hasContext || evidencePresent),
    sources,
    sourceDetails,
    answer: cleanAnswer(data.answer),
  };
}
async function normalizeResponse(response, request, env) {
  if (!(response instanceof Response)) return response;
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) return response;
  try {
    const data = await response.clone().json();
    return json(data, request, env, response.status, response.headers);
  } catch {
    return response;
  }
}
function healthPayload(component = RUNTIME_VERSION) {
  return { ok: true, version: API_VERSION, runtime: RUNTIME_VERSION, component, upstream: UPSTREAM_VERSION, base: BASE_VERSION, contract: RESPONSE_CONTRACT, academicCore: ACADEMIC_CORE_VERSION, hasContext: false, mode: 'health', servedBy: RUNTIME_VERSION, sources: [], sourceDetails: [] };
}

export const __test = { validate, normalizePayload, requestPayload };

export default {
  async fetch(request, env = {}) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(request, env) });
    if (request.method !== 'GET' && request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.', mode: 'request_error', servedBy: RUNTIME_VERSION, hasContext: false }, request, env, 405);
    const url = new URL(request.url);
    if (url.pathname === '/academic/health' || url.pathname === '/safe-entrypoint/health' || url.pathname === '/orchestrator/health') return json(healthPayload(url.pathname.slice(1).replace('/','-')), request, env);
    if (url.pathname !== '/ask') return normalizeResponse(await upstreamWorker.fetch(request, env), request, env);
    const delegated = request.clone();
    const payload = await requestPayload(request, url);
    const invalid = validate(request, env, payload.message);
    if (invalid) return json({ ok: false, error: invalid.error, mode: 'request_error', servedBy: RUNTIME_VERSION, hasContext: false }, request, env, invalid.status);
    const intent = academicIntent(payload.message, payload.lang);
    if (intent) return json(academicPayload(intent), request, env);
    return normalizeResponse(await upstreamWorker.fetch(delegated, env), request, env);
  },
};

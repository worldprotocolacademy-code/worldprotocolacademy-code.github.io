export const API_VERSION = 'v35.1.1';
export const ORCHESTRATOR_VERSION = 'v35.1.1-multisystem-orchestrator';
export const SAFE_ENTRYPOINT_VERSION = 'v35.1.1-safe-entrypoint';
export const BASE_VERSION = 'v35.0-protocolometry-connector';
export const RESPONSE_CONTRACT = 'wpa-virtual-sande-response-v1.1';

const NO_CONTEXT_SERVED_BY = new Set([
  'no-context',
  'llm-no-context',
  'timeout-no-context',
  'mk-purity-fallback',
  'external-author-hard-fail-fallback',
  'persona-hard-fail',
]);

const clean = (value) => String(value || '')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[!?.,:;]+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export function greetingIntent(message = '') {
  const q = clean(message);
  if (!q) return null;
  const mk = new Set(['здраво', 'добар ден', 'добро утро', 'добра вечер', 'поздрав', 'здраво виртуелен санде']);
  const en = new Set(['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']);
  if (mk.has(q)) return 'mk';
  if (en.has(q)) return 'en';
  return null;
}

export function greetingPayload(lang = 'mk') {
  const english = lang === 'en';
  return {
    ok: true,
    version: API_VERSION,
    runtime: ORCHESTRATOR_VERSION,
    base: BASE_VERSION,
    contract: RESPONSE_CONTRACT,
    requestedLang: english ? 'en' : 'mk',
    answerLang: english ? 'en' : 'mk',
    hasContext: false,
    mode: 'greeting',
    followUpUsed: false,
    sources: [],
    sourceDetails: [],
    historyUsed: false,
    servedBy: 'v35.1.1-greeting',
    plan: 'free',
    answer: english
      ? 'Hello. I am Virtual Sande, the academic AI assistant of World Protocol Academy. Ask me about protocol, diplomacy, precedence, ceremonial, etiquette, Protocolometry, or the connected WPA systems.'
      : 'Здраво. Јас сум Virtual Sande, академскиот AI асистент на World Protocol Academy. Прашајте ме за протокол, дипломатија, пресеанс, церемонијал, етикеција, Протоколометрија или за поврзаните WPA системи.',
  };
}

export function normalizePayload(input = {}) {
  const data = input && typeof input === 'object' ? { ...input } : {};
  const sources = Array.isArray(data.sources) ? data.sources.filter(Boolean) : [];
  const sourceDetails = Array.isArray(data.sourceDetails) ? data.sourceDetails : [];
  const results = Array.isArray(data.results) ? data.results : undefined;
  const servedBy = String(data.servedBy || '').trim();
  const explicitNoContext = NO_CONTEXT_SERVED_BY.has(servedBy) || data.mode === 'none';
  const evidencePresent = sources.length > 0 || sourceDetails.length > 0 || (results && results.length > 0);
  const hasContext = explicitNoContext ? false : Boolean(data.hasContext || evidencePresent);

  return {
    ...data,
    version: API_VERSION,
    runtime: ORCHESTRATOR_VERSION,
    base: BASE_VERSION,
    contract: RESPONSE_CONTRACT,
    hasContext,
    sources,
    sourceDetails,
  };
}

export async function normalizeResponse(response, requestHeaders = undefined) {
  if (!(response instanceof Response)) return response;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return response;

  let payload;
  try {
    payload = await response.clone().json();
  } catch {
    return response;
  }

  const normalized = normalizePayload(payload);
  const headers = new Headers(response.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('x-wpa-runtime', ORCHESTRATOR_VERSION);
  headers.set('x-wpa-response-contract', RESPONSE_CONTRACT);
  if (requestHeaders?.get?.('Origin')) headers.set('vary', 'Origin');

  return new Response(JSON.stringify(normalized, null, 2), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

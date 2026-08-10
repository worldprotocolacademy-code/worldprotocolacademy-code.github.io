const VERSION = 'wpa-symbols-active-router-v1.0';
const ACTIVE_PATH = '/wpaws/protocol-symbols/data/active-runtime-197.json';
const VERIFIED_PATH = '/wpaws/protocol-symbols/data/countries.json';
const DEFAULT_ROOT = 'https://worldprotocolacademy.mk';

const clean = (v = '') => String(v).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}°²:.,><=+-]+/gu, ' ').replace(/\s+/g, ' ').trim();
const mkText = (v = '') => /[а-шѓќѕџјљњ]/i.test(String(v));
const num = (v = '') => Number(String(v).replace(/[^0-9.]/g, '')) || 0;
const root = (env) => String(env?.WPA_PUBLIC_ROOT || DEFAULT_ROOT).replace(/\/+$/, '');
const asset = (env, p) => root(env) + p;

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = [...new Set([
    'https://worldprotocolacademy-code.github.io',
    'https://worldprotocolacademy.mk',
    'https://www.worldprotocolacademy.mk',
    'https://worldprotocolacademy.com',
    'https://www.worldprotocolacademy.com',
    ...String(env?.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean)
  ])];
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0],
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'x-wpa-symbols-router': VERSION,
    vary: 'Origin'
  };
}

const json = (body, request, env, status = 200) => new Response(JSON.stringify(body, null, 2), { status, headers: cors(request, env) });

async function fetchJson(url, fallback = null) {
  try {
    const r = await fetch(url, { headers: { accept: 'application/json', 'user-agent': `VirtualSande/${VERSION}` }, cf: { cacheTtl: 300, cacheEverything: true } });
    if (!r.ok) return fallback;
    return await r.json();
  } catch { return fallback; }
}

async function datasets(env) {
  const [active, verified] = await Promise.all([
    fetchJson(asset(env, ACTIVE_PATH), null),
    fetchJson(asset(env, VERIFIED_PATH), { records: [] })
  ]);
  return {
    active,
    records: Array.isArray(active?.records) ? active.records : [],
    orgs: Array.isArray(active?.organizations) ? active.organizations : [],
    days: Array.isArray(active?.national_days) ? active.national_days : [],
    verified: Array.isArray(verified?.records) ? verified.records : []
  };
}

function parsePayload(request, url) {
  return (async () => {
    let message = url.searchParams.get('message') || url.searchParams.get('q') || '';
    let lang = url.searchParams.get('lang') || '';
    if (request.method === 'POST') {
      try {
        const b = await request.clone().json();
        message = message || b.message || b.q || b.prompt || '';
        lang = lang || b.lang || b.language || '';
      } catch {}
    }
    return { message: String(message).trim(), lang: String(lang).toLowerCase().trim() };
  })();
}

function isSymbolsIntent(message = '') {
  const q = clean(message);
  return [
    'знаме','знамиња','flag','flags','химна','химни','anthem','anthems','грб','coat of arms','emblem','симбол','symbol',
    'главен град','capital','континент','continent','координат','coordinates','геолокац','geolocation','локац','location',
    'население','population','површина','area','големина','size','ресурс','resources','рудн','минерал','mineral','богатств',
    'национален ден','national day','празник','holiday','орел','eagle','лав','lion','сонце','sun','полумес','crescent','ѕвезд','star',
    'најголема држава','largest country','најмала држава','smallest country','кажи ми сè за','кажи ми се за','all about','country profile',
    'symbol dna','protocol trap','протоколарен ризик','protocol risk'
  ].some(k => q.includes(k));
}

function entity(record, q) {
  const names = [record.name_mk, record.name_en, record.id].filter(Boolean).map(clean);
  return names.some(n => n && (q === n || q.includes(n)));
}

function findRecord(records, message) {
  const q = clean(message);
  return records.find(r => entity(r, q)) || null;
}

function findVerified(verified, activeRecord) {
  if (!activeRecord) return null;
  const id = String(activeRecord.id || '').toUpperCase();
  return verified.find(r => String(r.id || '').toUpperCase() === id) || null;
}

function activeSourceNote(mk, hasVerified) {
  if (hasVerified) return mk
    ? 'Изворен слој: активен WPA dataset + подлабок верифициран Symbols overlay каде што е достапен.'
    : 'Source layer: active WPA dataset + deeper verified Symbols overlay where available.';
  return mk
    ? 'Изворен слој: активен структурен WPA dataset. Непополнетите полиња не се претпоставуваат.'
    : 'Source layer: active structured WPA dataset. Missing fields are not inferred.';
}

function fullProfile(r, v, mk) {
  const rows = [
    `${mk ? '🌍 Држава / ентитет' : '🌍 Country / entity'}: ${r.name_mk || r.name_en || r.id}`,
    `${mk ? '🏙️ Главен град' : '🏙️ Capital'}: ${r.capital_mk || v?.capital || '—'}`,
    `${mk ? '🗺️ Континент / регион' : '🗺️ Continent / region'}: ${r.continent_mk || v?.continent || '—'}`,
    `${mk ? '📍 Координати' : '📍 Coordinates'}: ${r.coordinates_display || '—'}`,
    `${mk ? '👥 Население' : '👥 Population'}: ${r.population_display || '—'}`,
    `${mk ? '📐 Површина' : '📐 Area'}: ${r.area_display || '—'}`,
    `${mk ? '⛏️ Природни / рудни ресурси' : '⛏️ Natural / mineral resources'}: ${r.resources_mk || '—'}`,
    `${mk ? '🏳️ Знаме' : '🏳️ Flag'}: ${v?.flag_description_mk || r.flag_summary_mk || '—'}`,
    `${mk ? '🛡️ Грб / амблем' : '🛡️ Coat of arms / emblem'}: ${v?.coat_of_arms_summary_mk || (mk ? 'Нема подлабок верифициран опис во overlay-слојот.' : 'No deeper verified description in the overlay layer.')}`,
    `${mk ? '🎼 Химна' : '🎼 Anthem'}: ${v?.anthem_title || (r.instrumental_anthem?.name || r.instrumental_anthem?.title) || (r.anthem_code ? `WPA code: ${r.anthem_code}` : '—')}`,
    `${mk ? '🎵 Инструментална' : '🎵 Instrumental'}: ${v ? (v.anthem_officially_instrumental ? (mk ? 'Да' : 'Yes') : (mk ? 'Не' : 'No')) : (r.instrumental_anthem ? (mk ? 'Да — означено во активниот слој' : 'Yes — marked in active layer') : (mk ? 'Не е посебно означено' : 'Not specially marked'))}`,
    `${mk ? '🦅 Орел на знамето' : '🦅 Eagle on flag'}: ${v ? (v.has_eagle_on_flag ? (mk ? 'Да' : 'Yes') : (mk ? 'Не' : 'No')) : (r.eagle_on_flag_note ? (mk ? 'Да — ' : 'Yes — ') + r.eagle_on_flag_note : (mk ? 'Не е означено како потврден пример' : 'Not marked as a confirmed example'))}`,
    `${mk ? '📅 Национален ден' : '📅 National day'}: ${Array.isArray(r.national_days) && r.national_days.length ? r.national_days.map(d => `${d.date || `${d.month}-${d.day}`} — ${d.title || ''}`).join('; ') : (mk ? 'Нема активен запис во овој feed' : 'No active record in this feed')}`
  ];
  if (v?.notes_mk) rows.push(`${mk ? '⚖️ Протоколарна белешка' : '⚖️ Protocol note'}: ${v.notes_mk}`);
  rows.push(activeSourceNote(mk, !!v));
  return rows.join('\n');
}

function singleFieldAnswer(q, r, v, mk) {
  const name = r.name_mk || r.name_en || r.id;
  if (/координат|geolocation|геолокац|location|локац/.test(q)) return `📍 ${name}: ${r.coordinates_display || '—'}.`;
  if (/ресурс|рудн|минерал|богатств|resources|mineral/.test(q)) return `⛏️ ${name}: ${r.resources_mk || '—'}.`;
  if (/население|population/.test(q)) return `👥 ${name}: ${r.population_display || '—'}.`;
  if (/површина|area|големина|size/.test(q)) return `📐 ${name}: ${r.area_display || '—'}.`;
  if (/главен град|capital/.test(q)) return `🏙️ ${name}: ${r.capital_mk || v?.capital || '—'}.`;
  if (/континент|continent/.test(q)) return `🗺️ ${name}: ${r.continent_mk || v?.continent || '—'}.`;
  if (/грб|coat of arms|emblem/.test(q)) return `🛡️ ${name}: ${v?.coat_of_arms_summary_mk || (mk ? 'Нема подлабок верифициран опис во overlay-слојот.' : 'No deeper verified description in the overlay layer.')}`;
  if (/химн|anthem|инструментал/.test(q)) {
    const title = v?.anthem_title || r.instrumental_anthem?.name || r.instrumental_anthem?.title || (r.anthem_code ? `WPA code: ${r.anthem_code}` : '—');
    const instr = v ? v.anthem_officially_instrumental : !!r.instrumental_anthem;
    return `🎼 ${name}: ${title}. ${mk ? 'Инструментална' : 'Instrumental'}: ${instr ? (mk ? 'да' : 'yes') : (mk ? 'не / не е означено' : 'no / not marked')}.`;
  }
  if (/знаме|flag|орел|eagle|лав|lion|сонце|sun|полумес|crescent|ѕвезд|star/.test(q)) {
    return `🏳️ ${name}: ${v?.flag_description_mk || r.flag_summary_mk || '—'}${v?.flag_symbol ? ` · ${mk ? 'Симбол' : 'Symbol'}: ${v.flag_symbol}` : ''}`;
  }
  if (/национален ден|national day|празник|holiday/.test(q)) {
    return `📅 ${name}: ${Array.isArray(r.national_days) && r.national_days.length ? r.national_days.map(d => `${d.date || `${d.month}-${d.day}`} — ${d.title || ''}`).join('; ') : (mk ? 'нема активен запис во овој feed' : 'no active record in this feed')}.`;
  }
  return null;
}

function symbolMatch(r, q) {
  const h = clean([r.flag_summary_mk, r.eagle_on_flag_note, r.instrumental_anthem?.name, r.instrumental_anthem?.note].filter(Boolean).join(' '));
  const tests = [
    ['орел','eagle'],['лав','lion'],['сонце','sun'],['полумес','crescent'],['ѕвезд','star'],['крст','cross'],['круна','crown'],['сабја','sword']
  ];
  for (const pair of tests) {
    if (pair.some(k => q.includes(k)) && pair.some(k => h.includes(k))) return true;
  }
  return false;
}

function queryList(records, q, mk) {
  let out = records.slice();
  let reason = [];
  const continentMap = [
    ['африка','Африка'],['africa','Африка'],['азија','Азија'],['asia','Азија'],['европа','Европа'],['europe','Европа'],['океанија','Океанија'],['oceania','Океанија'],['северна америка','Северна Америка'],['north america','Северна Америка'],['јужна америка','Јужна Америка'],['south america','Јужна Америка']
  ];
  const cHit = continentMap.find(([k]) => q.includes(k));
  if (cHit) { out = out.filter(r => r.continent_mk === cHit[1]); reason.push(cHit[1]); }

  const resourceTerms = ['злато','gold','нафта','oil','природен гас','natural gas','бакар','copper','јаглен','coal','дијаманти','diamonds','железо','iron','ураниум','uranium'];
  const resource = resourceTerms.find(k => q.includes(k));
  if (resource) {
    const aliases = { gold:['злато','gold'], oil:['нафта','oil'], 'natural gas':['природен гас','natural gas'], copper:['бакар','copper'], coal:['јаглен','coal'], diamonds:['дијамант','diamond'], iron:['железо','iron'], uranium:['ураниум','uranium'] };
    const key = Object.keys(aliases).find(k => aliases[k].includes(resource)) || resource;
    const terms = aliases[key] || [resource];
    out = out.filter(r => terms.some(t => clean(r.resources_mk).includes(clean(t))));
    reason.push(resource);
  }

  if (/орел|eagle|лав|lion|сонце|sun|полумес|crescent|ѕвезд|star|крст|cross|круна|crown|сабја|sword/.test(q)) {
    out = out.filter(r => symbolMatch(r, q));
    reason.push(mk ? 'симбол на знамето' : 'flag symbol');
  }
  if (/инструментал|instrumental|без текст|without lyrics/.test(q)) {
    out = out.filter(r => !!r.instrumental_anthem);
    reason.push(mk ? 'инструментална химна' : 'instrumental anthem');
  }

  const gt = q.match(/(?:над|over|more than|>)\s*([0-9][0-9.,]*)\s*(?:милион|million)?\s*(?:km|км)?/);
  if (gt && /површина|area|km|км/.test(q)) {
    let threshold = Number(gt[1].replace(/,/g,''));
    if (/милион|million/.test(gt[0])) threshold *= 1000000;
    out = out.filter(r => num(r.area_display) > threshold);
    reason.push((mk ? 'површина над ' : 'area over ') + threshold.toLocaleString('en-US') + ' km²');
  }

  const largest = /најголем|largest|biggest/.test(q) && /држав|country|површина|area/.test(q);
  const smallest = /најмал|smallest/.test(q) && /држав|country|површина|area/.test(q);
  if (largest || smallest) {
    out.sort((a,b) => num(b.area_display)-num(a.area_display));
    if (smallest) out.reverse();
    out = out.slice(0, 10);
    reason.push(largest ? (mk ? 'по површина — најголеми' : 'largest by area') : (mk ? 'по површина — најмали' : 'smallest by area'));
  }

  if (!reason.length) return null;
  const limited = out.slice(0, 30);
  if (!limited.length) return mk ? 'Не најдов совпаѓања во активниот WPA dataset.' : 'No matches were found in the active WPA dataset.';
  const rows = limited.map((r,i) => `${i+1}. ${r.name_mk} — ${r.capital_mk || '—'} · ${r.area_display || '—'}${r.resources_mk ? ` · ${r.resources_mk}` : ''}${r.flag_summary_mk ? ` · ${r.flag_summary_mk}` : ''}`);
  return `${mk ? 'WPA cross-dataset резултат' : 'WPA cross-dataset result'} (${reason.join(' · ')}):\n${rows.join('\n')}${out.length > limited.length ? `\n… +${out.length-limited.length}` : ''}\n\n${mk ? 'Активен структурен dataset; за официјална употреба временски чувствителните полиња повторно се проверуваат.' : 'Active structured dataset; time-sensitive fields should be reconfirmed for official use.'}`;
}

function reverseId(records, q, mk) {
  if (!/(која држава|which country|кој ентитет|which entity)/.test(q)) return null;
  const scored = records.map(r => {
    let score = 0; const why = [];
    if (r.capital_mk && q.includes(clean(r.capital_mk))) { score += 7; why.push(r.capital_mk); }
    if (symbolMatch(r,q)) { score += 4; why.push(mk ? 'симбол' : 'symbol'); }
    if (/инструментал|instrumental/.test(q) && r.instrumental_anthem) { score += 3; why.push(mk ? 'инструментална химна' : 'instrumental anthem'); }
    return { r, score, why };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score);
  if (!scored.length) return null;
  const top = scored[0];
  return `🎯 ${mk ? 'Најсилно совпаѓање' : 'Strongest match'}: ${top.r.name_mk}. ${mk ? 'Траги' : 'Clues'}: ${top.why.join(', ')}.\n${top.r.flag_summary_mk || ''}\n${mk ? 'Ова е deterministic match врз активниот WPA dataset.' : 'This is a deterministic match over the active WPA dataset.'}`;
}

function symbolsResponse(answer, request, env, extra = {}) {
  return json({ ok: true, version: VERSION, mode: 'symbols_active_197', servedBy: VERSION, human_review_required: true, hasContext: true, answer, source: asset(env, ACTIVE_PATH), sources: [asset(env, ACTIVE_PATH)], ...extra }, request, env);
}

export async function tryHandleSymbols(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS' && url.pathname.startsWith('/symbols')) return new Response(null, { status: 204, headers: cors(request, env) });

  if (url.pathname === '/symbols/health') {
    const d = await datasets(env);
    return json({ ok: d.records.length >= 190, version: VERSION, active_count: d.records.length, verified_overlay_count: d.verified.length, organization_count: d.orgs.length, national_day_count: d.active?.counts?.national_day_records ?? d.days.length, source: asset(env, ACTIVE_PATH) }, request, env, d.records.length >= 190 ? 200 : 503);
  }

  if (url.pathname !== '/ask' && url.pathname !== '/symbols/profile') return null;
  if (request.method !== 'GET' && request.method !== 'POST') return null;

  const p = await parsePayload(request, url);
  if (url.pathname === '/symbols/profile' && !p.message) p.message = url.searchParams.get('id') || url.searchParams.get('country') || '';
  if (!p.message) return null;
  if (url.pathname === '/ask' && !isSymbolsIntent(p.message)) return null;

  const d = await datasets(env);
  if (d.records.length < 190) return null;
  const q = clean(p.message);
  const mk = p.lang !== 'en' && (p.lang === 'mk' || mkText(p.message));

  const rev = reverseId(d.records, q, mk);
  if (rev) return symbolsResponse(rev, request, env, { reasoning: 'reverse_identification' });

  const r = findRecord(d.records, p.message);
  if (r) {
    const v = findVerified(d.verified, r);
    const wantsAll = /кажи ми с[еè]|кажи ми сè|с[еè] за|all about|country profile|целосен профил|complete profile|се за|сè за/.test(q);
    const answer = wantsAll ? fullProfile(r,v,mk) : (singleFieldAnswer(q,r,v,mk) || fullProfile(r,v,mk));
    return symbolsResponse(answer + `\n\n${activeSourceNote(mk, !!v)}`, request, env, { entity: r.id, verified_overlay: !!v });
  }

  const list = queryList(d.records, q, mk);
  if (list) return symbolsResponse(list, request, env, { reasoning: 'cross_dataset_filter' });

  return null;
}

export const __test = { clean, isSymbolsIntent, findRecord, queryList, reverseId, num };
export default { tryHandleSymbols };

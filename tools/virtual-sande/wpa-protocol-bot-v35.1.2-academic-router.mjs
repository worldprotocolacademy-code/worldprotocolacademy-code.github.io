import {
  ACADEMIC_CORE_VERSION,
  academicIntent as coreAcademicIntent,
  academicPayload,
  normalizeAcademicQuery,
  __academicTest,
} from './wpa-protocol-bot-v35.1.2-academic-core.mjs';

const COMPARISON_MARKERS = ['разлика', 'разликува', 'спореди', 'наспроти', 'difference', 'compare', 'versus', ' vs '];
const hasAny = (query, values) => values.some((value) => query.includes(value));

function sharedNounVisitComparison(query) {
  if (!hasAny(query, COMPARISON_MARKERS)) return false;
  const macedonian = query.includes('државна') && query.includes('официјална') && query.includes('работна') && query.includes('посета');
  const english = query.includes('state') && query.includes('official') && query.includes('working') && query.includes('visit');
  return macedonian || english;
}

function languageOf(requestedLang, message) {
  if (requestedLang === 'en') return 'en';
  if (requestedLang === 'mk') return 'mk';
  return /[а-шѓќѕџјљњ]/i.test(message) ? 'mk' : 'en';
}

export function academicIntent(message = '', requestedLang = '') {
  const query = normalizeAcademicQuery(message);
  if (sharedNounVisitComparison(query)) {
    const item = __academicTest.COMPARISONS.find((entry) => entry.id === 'visit_types');
    if (item) return { type: 'comparison', id: item.id, language: languageOf(requestedLang, message), item };
  }
  return coreAcademicIntent(message, requestedLang);
}

export { ACADEMIC_CORE_VERSION, academicPayload, normalizeAcademicQuery, __academicTest };

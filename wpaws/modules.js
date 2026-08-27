// WPAWS 11.2.0-candidate - governed modules/agent registry loader
// World Protocol Academy
// Compatibility module for legacy app.js; canonical UI is /wpaws/index.html.

export const WPA_MODULES = {
  doctrine: {
    title: 'WPA Doctrine', subtitle: 'Доктрина, канон и методолошки стандарди', icon: '⚜️',
    prompt: ({topic, details}) => `Обработи ја следната WPA доктринална тема.\n\nТЕМА: ${topic}\n\nФОКУС: ${details}\n\nРазликувај постоечка WPA доктрина, надворешен доказ, интерпретација и предложена промена. Не менувај Doctrine Kernel; секоја промена оди на Human Gate.`,
    placeholders: { topic: 'На пример: Принципи на државен протокол', details: 'Дефиниции, докази, терминологија и практична примена' },
    quickActions: ['Доктринална белешка', 'Терминолошки стандард', 'Канонски цитати']
  },
  research: {
    title: 'Research Studio', subtitle: 'Монографии, трудови, структура и семантичка анализа', icon: '📚',
    prompt: ({topic, details}) => `Тема за WPA Research Studio: ${topic}\n\nДетали: ${details}\n\nДај теза, истражувачки прашања, proposed structure, методологија, потребни извори/податоци, limitations и можни WPA излезни формати. Не измислувај библиографија.`,
    placeholders: { topic: 'На пример: Дигитална дипломатија и протокол', details: 'Тип на истражување, evidence и output' },
    quickActions: ['Теза', 'Структура', 'Библиографија']
  },
  protocol: {
    title: 'Protocol Lab', subtitle: 'State protocol, precedence, seating и visit choreography', icon: '🎩',
    prompt: ({topic, details}) => `Прашање за Protocol Lab: ${topic}\n\nКонтекст: ${details}\n\nРазликувај verified rule, institutional practice и recommendation. За jurisdiction-specific или актуелни правила означи ПОТРЕБНА Е ПРОВЕРКА ако нема source evidence.`,
    placeholders: { topic: 'На пример: Пречек на странски претседател', details: 'Rank, seating, flags, order of arrival, source context' },
    quickActions: ['Checklist', 'Precedence', 'Seating notes']
  },
  diplomacy: {
    title: 'Diplomatic & Security Lab', subtitle: 'Diplomatic briefs, security framing и strategic notes', icon: '🌍',
    prompt: ({topic, details}) => `Подготви public-source diplomatic/security brief.\n\nТЕМА: ${topic}\n\nДЕТАЛИ: ${details}\n\nОддели verified facts, interpretation, risks, source gaps and recommendations. Не претставувај го output-от како intelligence assessment.`,
    placeholders: { topic: 'На пример: Билатерална средба со амбасадор', details: 'Objective, public evidence, risk, protocol sensitivity' },
    quickActions: ['Brief', 'Talking points', 'Risk note']
  },
  teaching: {
    title: 'Teaching Studio', subtitle: 'PPP, lectures, workshops и learning content', icon: '🎓',
    prompt: ({topic, details}) => `Подготви WPA teaching draft.\n\nТЕМА: ${topic}\n\nДЕТАЛИ: ${details}\n\nДај outline, learning outcomes, module flow, source/evidence needs and formative assessment ideas. Не тврди дека сертификатска услуга е активирана.`,
    placeholders: { topic: 'На пример: Лекција за дипломатски протокол', details: 'Lecture notes, workshop flow, exam prep' },
    quickActions: ['Lecture outline', 'PPP notes', 'Exam prep']
  },
  press: {
    title: 'WPA Press', subtitle: 'Human-approved drafts за книги, briefs и policy papers', icon: '📰',
    prompt: ({topic, details}) => `Подготви WPA Press DRAFT.\n\nНАСЛОВ: ${topic}\n\nНАСОКА: ${details}\n\nНе измислувај цитати, услуги или институционални статуси. Оддели verified facts од proposed language и означи HUMAN APPROVAL REQUIRED пред јавна употреба.`,
    placeholders: { topic: 'На пример: Protocol Manual for Executive Visits', details: 'Executive summary, policy paper, verified facts' },
    quickActions: ['Executive summary', 'Policy paper', 'Speech booklet']
  }
};

export let WPAWS_VERSION = null;
export let WPAWS_AGENTS = [];
export let WPAWS_REGISTRY_STATUS = 'not_loaded';

const ALLOWED_MOTORS = new Set(['claude', 'gpt', 'local', 'hybrid', 'auto']);

function validateRegistry(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid agents registry');
  if (!Array.isArray(data.agents)) throw new Error('agents must be an array');
  if (Number(data.agent_count) !== data.agents.length) throw new Error('agent_count mismatch');
  if (data.agents.length !== 17) throw new Error('WPAWS requires 17 governed roles');
  const numbers = new Set();
  for (const agent of data.agents) {
    if (!Number.isInteger(agent.number) || numbers.has(agent.number)) throw new Error('duplicate/invalid agent number');
    numbers.add(agent.number);
    if (!agent.name || !agent.category || !agent.prompt) throw new Error(`agent ${agent.number} missing required fields`);
    if (!ALLOWED_MOTORS.has(agent.default_motor)) throw new Error(`agent ${agent.number} has unsupported motor`);
  }
  return data;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.keys(value).forEach((key) => deepFreeze(value[key]));
  return value;
}

export async function initWPAWS() {
  try {
    const response = await fetch('/agents.json?v=20260827-2', { cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = validateRegistry(await response.json());
    WPAWS_VERSION = data.version;
    WPAWS_AGENTS = data.agents.map((agent) => deepFreeze({ ...agent }));
    WPAWS_REGISTRY_STATUS = 'loaded_verified_shape';
    console.info(`[WPAWS] ${WPAWS_VERSION}: ${WPAWS_AGENTS.length} governed roles loaded`);
    return true;
  } catch (error) {
    WPAWS_VERSION = null;
    WPAWS_AGENTS = [];
    WPAWS_REGISTRY_STATUS = 'load_failed';
    console.error('[WPAWS] agents registry load failed:', error);
    return false;
  }
}

export function getAgent(agentNumber) {
  return WPAWS_AGENTS.find((agent) => agent.number === agentNumber) || null;
}

export function getAgentPrompt(agentNumber, userInput) {
  const agent = getAgent(agentNumber);
  if (!agent) return null;
  const input = String(userInput || '').trim();
  return `${agent.prompt}\n\n[USER_INPUT]\n${input}`;
}

export function getAgentMotor(agentNumber) {
  const agent = getAgent(agentNumber);
  return agent ? agent.default_motor : null;
}

export function getAllAgentsByCategory() {
  const categories = {};
  WPAWS_AGENTS.forEach((agent) => {
    if (!categories[agent.category]) categories[agent.category] = [];
    categories[agent.category].push(agent);
  });
  return categories;
}

export function getRandomElement(arr) {
  if (!Array.isArray(arr) || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

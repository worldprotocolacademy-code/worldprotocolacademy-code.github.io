// WPAWS 11.1.7 - Модули и агенти
// World Protocol Academy
// Доктрина: "Преговарањето е опционално. Протоколот е апсолутен."

// ============================================
// 1. WPA_MODULES (постоечките модули)
// ============================================
export const WPA_MODULES = {
  doctrine: {
    title: 'WPA Doctrine',
    subtitle: 'Доктрина, канон и методолошки стандарди',
    icon: '⚜️',
    prompt: ({topic, details}) => `Обработи ја следната WPA доктринална тема на чист литературен македонски јазик.

ТЕМА: ${topic}

ФОКУС: ${details}

Барање: дефинирај основни принципи, канонска логика, терминолошки стандарди и практична примена во World Protocol Academy.`,
    placeholders: {
      topic: 'На пример: Принципи на државен протокол',
      details: 'На пример: дефиниции, аксиоми, канонски цитати и методолошка рамка'
    },
    quickActions: ['Доктринална белешка', 'Терминолошки стандард', 'Канонски цитати']
  },
  research: {
    title: 'Research Studio',
    subtitle: 'Монографии, трудови, структура и семантичка анализа',
    icon: '📚',
    prompt: ({topic, details}) => `Тема за WPA Research Studio: ${topic}

Детали: ${details}

Дај академски структуриран одговор: теза, 3 истражувачки прашања, предложена структура, методолошка насока и можни WPA излезни формати.`,
    placeholders: {
      topic: 'На пример: Дигитална дипломатија и протокол',
      details: 'На пример: монографија, научен труд, bibliography, structure, semantic map'
    },
    quickActions: ['Теза', 'Структура', 'Библиографија']
  },
  protocol: {
    title: 'Protocol Lab',
    subtitle: 'State protocol, precedence, seating и visit choreography',
    icon: '🎩',
    prompt: ({topic, details}) => `Прашање за Protocol Lab: ${topic}

Контекст: ${details}

Дај структуриран, практичен и академски одговор за протокол, со чекори, ризици, precedence/seating логика и предупредувања за можни грешки.`,
    placeholders: {
      topic: 'На пример: Пречек на странски претседател',
      details: 'На пример: rank, seating, flags, order of arrival, checklist'
    },
    quickActions: ['Checklist', 'Precedence', 'Seating notes']
  },
  diplomacy: {
    title: 'Diplomatic & Security Lab',
    subtitle: 'Diplomatic briefs, security framing и strategic notes',
    icon: '🌍',
    prompt: ({topic, details}) => `Подготви дипломатски или безбедносен brief.

ТЕМА: ${topic}

ДЕТАЛИ: ${details}

Побарано: краток background, институционален контекст, главни ризици, препорачани talking points и дипломатски/безбедносни препораки.`,
    placeholders: {
      topic: 'На пример: Билатерална средба со амбасадор',
      details: 'На пример: objective, risk, protocol sensitivity, executive brief'
    },
    quickActions: ['Brief', 'Talking points', 'Risk note']
  },
  teaching: {
    title: 'Teaching Studio',
    subtitle: 'PPP, lectures, workshops и certification content',
    icon: '🎓',
    prompt: ({topic, details}) => `Подготви WPA teaching output.

ТЕМА: ${topic}

ДЕТАЛИ: ${details}

Дај: outline, module flow, learning outcomes, suggested slides или Q&A preparation според потребата.`,
    placeholders: {
      topic: 'На пример: Лекција за дипломатски протокол',
      details: 'На пример: PPP, lecture notes, exam prep, workshop flow'
    },
    quickActions: ['Lecture outline', 'PPP notes', 'Exam prep']
  },
  press: {
    title: 'WPA Press',
    subtitle: 'Branded outputs за книги, briefs и policy papers',
    icon: '📰',
    prompt: ({topic, details}) => `Подготви WPA Press излез.

НАСЛОВ: ${topic}

НАСОКА: ${details}

Дај јасен, бренд-конзистентен output: executive summary, policy paper, protocol manual synopsis или speech booklet structure.`,
    placeholders: {
      topic: 'На пример: Protocol Manual for Executive Visits',
      details: 'На пример: executive summary, policy paper, speech booklet, branded output'
    },
    quickActions: ['Executive summary', 'Policy paper', 'Speech booklet']
  }
};

// ============================================
// 2. WPAWS 11.1.7 - 17 АГЕНТИ (од JSON)
// ============================================
export let WPAWS_VERSION = null;
export let WPAWS_AGENTS = [];

export async function initWPAWS() {
    try {
        const response = await fetch('/agents.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        WPAWS_VERSION = data.version;
        WPAWS_AGENTS = data.agents;
        console.log(`✅ ${WPAWS_VERSION} - ${WPAWS_AGENTS.length} агенти вчитани`);
        return true;
    } catch (error) {
        console.error('❌ Грешка при вчитување на agents.json:', error);
        return false;
    }
}

export function getAgent(agentNumber) {
    return WPAWS_AGENTS.find(a => a.number === agentNumber);
}

export function getAgentPrompt(agentNumber, userInput) {
    const agent = getAgent(agentNumber);
    if (!agent) return null;
    return agent.prompt.replace('[INPUT]', userInput);
}

export function getAgentMotor(agentNumber) {
    const agent = getAgent(agentNumber);
    return agent ? agent.default_motor : null;
}

export function getAllAgentsByCategory() {
    const categories = {};
    WPAWS_AGENTS.forEach(agent => {
        if (!categories[agent.category]) categories[agent.category] = [];
        categories[agent.category].push(agent);
    });
    return categories;
}

// ============================================
// 3. ПОМОШНИ ФУНКЦИИ
// ============================================
export function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function formatDate() {
    return new Date().toISOString().slice(0, 10);
}

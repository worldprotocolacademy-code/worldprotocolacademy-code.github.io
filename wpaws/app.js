// WPAWS 11.1.7 - Главна апликација
// World Protocol Academy
// Доктрина: "Преговарањето е опционално. Протоколот е апсолутен."

import { 
    WPA_MODULES, 
    initWPAWS, 
    getAgent, 
    getAgentPrompt, 
    getAgentMotor,
    getAllAgentsByCategory,
    formatDate 
} from './modules.js';

// ============================================
// ГЛОБАЛНИ ПРОМЕНЛИВИ
// ============================================
let currentAgent = null;
let currentOutput = null;
let isLoading = false;

// ============================================
// ИНИЦИЈАЛИЗАЦИЈА
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 WPAWS 11.1.7 стартува...');
    
    // Вчитај ги 17-те агенти од JSON
    const success = await initWPAWS();
    
    if (success) {
        renderSidebar();
        renderModulesGrid();
        setupEventListeners();
    } else {
        showError('Не можам да ги вчитам агентите. Проверете ја мрежната врска.');
    }
});

// ============================================
// RENDER СТРАНИЧНА ЛЕНТА (СИТЕ 17 АГЕНТИ)
// ============================================
function renderSidebar() {
    const sidebar = document.getElementById('agents-sidebar');
    if (!sidebar) return;
    
    const agentsByCategory = getAllAgentsByCategory();
    const categories = ['Концепција', 'Анализа', 'Верификација', 'Квалитет', 'Експертиза', 'Евалуација', 'Обработка', 'Финализација', 'Излез', 'Надзор', 'Глас/Доктрина'];
    
    let html = '';
    
    categories.forEach(category => {
        const agents = agentsByCategory[category];
        if (agents && agents.length > 0) {
            html += `<div class="category-group">
                        <div class="category-title">📁 ${category}</div>`;
            agents.forEach(agent => {
                html += `<button class="agent-btn" data-agent-number="${agent.number}">
                            ${agent.symbol} ${agent.name}
                            <span class="motor-badge ${agent.default_motor}">${agent.default_motor}</span>
                         </button>`;
            });
            html += `</div>`;
        }
    });
    
    sidebar.innerHTML = html;
    
    // Додај event listeners на копчињата
    document.querySelectorAll('.agent-btn').forEach(btn => {
        btn.addEventListener('click', () => selectAgent(parseInt(btn.dataset.agentNumber)));
    });
}

// ============================================
// RENDER МОДУЛИ (WPA_MODULES)
// ============================================
function renderModulesGrid() {
    const container = document.getElementById('modules-grid');
    if (!container) return;
    
    let html = '';
    
    for (const [key, module] of Object.entries(WPA_MODULES)) {
        html += `
            <div class="module-card" data-module="${key}">
                <div class="module-icon">${module.icon}</div>
                <div class="module-title">${module.title}</div>
                <div class="module-subtitle">${module.subtitle}</div>
                <div class="quick-actions">
                    ${module.quickActions.map(action => 
                        `<button class="quick-action-btn" data-module="${key}" data-action="${action}">${action}</button>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Event listeners за брзите акции
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const moduleKey = btn.dataset.module;
            const action = btn.dataset.action;
            handleQuickAction(moduleKey, action);
        });
    });
}

// ============================================
// ИЗБОР НА АГЕНТ
// ============================================
function selectAgent(agentNumber) {
    const agent = getAgent(agentNumber);
    if (!agent) return;
    
    currentAgent = agent;
    
    // Активен стил на копчето
    document.querySelectorAll('.agent-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.agentNumber) === agentNumber) {
            btn.classList.add('active');
        }
    });
    
    // Прикажи го INPUT формуларот
    showInputForm();
}

// ============================================
// ПРИКАЖИ INPUT ФОРМУЛАР
// ============================================
function showInputForm() {
    const container = document.getElementById('input-area');
    if (!container || !currentAgent) return;
    
    const html = `
        <div class="input-card">
            <div class="input-header">
                <span class="agent-symbol">${currentAgent.symbol}</span>
                <span class="agent-name">${currentAgent.name}</span>
                <span class="agent-motor">Мотор: ${currentAgent.default_motor}</span>
            </div>
            <div class="input-body">
                <label class="input-label">Внеси го [INPUT] за овој агент:</label>
                <textarea id="agent-input" class="agent-textarea" rows="6" placeholder="Пример: ${getPlaceholderExample(currentAgent.number)}"></textarea>
                <div class="button-group">
                    <button id="submit-btn" class="submit-btn">🚀 Изврши</button>
                    <button id="clear-btn" class="clear-btn">🗑️ Исчисти</button>
                </div>
            </div>
        </div>
        <div id="output-area" class="output-area"></div>
    `;
    
    container.innerHTML = html;
    
    document.getElementById('submit-btn').addEventListener('click', executeAgent);
    document.getElementById('clear-btn').addEventListener('click', () => {
        document.getElementById('agent-input').value = '';
        document.getElementById('output-area').innerHTML = '';
    });
}

// ============================================
// ПРИМЕРЕН ПЛЕЈСХОЛДЕР ЗА СЕКОЈ АГЕНТ
// ============================================
function getPlaceholderExample(agentNumber) {
    const examples = {
        1: 'Цел текст на книга или поглавје...',
        2: 'Текст за анализа: "Дипломатијата е уметност на преговарање..."',
        3: 'Пасус или реченица за семантичка анализа...',
        4: 'Смиљанов, С. (2021). Дипломатијата...',
        5: 'Апстракт на труд: "Ова истражување го анализира..."',
        6: 'Цел текст за проверка на плагијат...',
        7: 'Објава: WPA лансира нов сертификат за протокол',
        8: 'Тема: Влијанието на AI врз дипломатскиот протокол',
        9: 'Излези од 3-4 агенти (залепи ги овде)...',
        10: 'Тема: Протоколот во дигиталната ера',
        11: 'Сценарио: Претседател пристига 10 минути пред кралот...',
        12: 'Држави: Северна Македонија и Грција',
        13: 'Ситуација: Безбедносен инцидент на дипломатски прием',
        14: 'Сценарио: Државна посета на високо ниво',
        15: 'Долг академски текст за скратување...',
        16: 'Текст за финална редакција пред објава...',
        17: 'Тема: Важноста на протоколот во дипломатијата'
    };
    return examples[agentNumber] || 'Внеси го твојот INPUT тука...';
}

// ============================================
// ИЗВРШИ АГЕНТ
// ============================================
async function executeAgent() {
    if (!currentAgent || isLoading) return;
    
    const userInput = document.getElementById('agent-input').value;
    if (!userInput.trim()) {
        showError('Ве молам внесете INPUT за агентот.');
        return;
    }
    
    isLoading = true;
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = '⏳ Обработка...';
    submitBtn.disabled = true;
    
    const outputArea = document.getElementById('output-area');
    outputArea.innerHTML = '<div class="loading">🔄 Процесирање на барањето...</div>';
    
    try {
        const fullPrompt = getAgentPrompt(currentAgent.number, userInput);
        const motor = getAgentMotor(currentAgent.number);
        
        // ТУКА ЌЕ СЕ ПОВИКУВА AI API
        // За сега – симулиран одговор или приказ на промптот
        
        outputArea.innerHTML = `
            <div class="output-card">
                <div class="output-header">
                    <span>📤 ИЗЛЕЗ ОД ${currentAgent.symbol} ${currentAgent.name}</span>
                    <span class="output-date">${formatDate()}</span>
                </div>
                <div class="output-body">
                    <div class="prompt-display">
                        <strong>📋 ПРОМПТ (за ${motor}):</strong>
                        <pre>${escapeHtml(fullPrompt)}</pre>
                    </div>
                    <div class="ai-response">
                        <strong>🤖 ОДГОВОР ОД AI:</strong>
                        <div class="response-placeholder">
                            ⚠️ Ова е местото каде ќе дојде одговорот од ${motor.toUpperCase()} API.
                            <br><br>
                            За да работи, треба да се интегрира вистински API повик до:
                            ${motor === 'claude' ? 'Anthropic Claude API' : motor === 'gpt' ? 'OpenAI GPT API' : 'Локален шаблон'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Грешка:', error);
        outputArea.innerHTML = `<div class="error-card">❌ Грешка: ${error.message}</div>`;
    } finally {
        isLoading = false;
        submitBtn.textContent = '🚀 Изврши';
        submitBtn.disabled = false;
    }
}

// ============================================
// БРЗИ АКЦИИ ЗА МОДУЛИТЕ
// ============================================
function handleQuickAction(moduleKey, action) {
    const module = WPA_MODULES[moduleKey];
    if (!module) return;
    
    let topic = '';
    let details = '';
    
    switch(action) {
        case 'Доктринална белешка':
            topic = 'WPA доктринални принципи';
            details = 'кратка доктринална белешка';
            break;
        case 'Теза':
            topic = prompt('Внеси тема за теза:');
            details = 'генерирај главна теза';
            break;
        case 'Checklist':
            topic = prompt('Внеси протоколарна ситуација:');
            details = 'направи checklist';
            break;
        case 'Brief':
            topic = prompt('Внеси дипломатска тема:');
            details = 'подготви краток brief';
            break;
        default:
            topic = prompt('Внеси тема:');
            details = action;
    }
    
    if (!topic) return;
    
    const fullPrompt = module.prompt({ topic, details });
    
    const outputArea = document.getElementById('output-area');
    if (outputArea) {
        outputArea.innerHTML = `
            <div class="output-card">
                <div class="output-header">
                    <span>${module.icon} ${module.title} → ${action}</span>
                </div>
                <div class="output-body">
                    <div class="prompt-display">
                        <strong>📋 ПРОМПТ:</strong>
                        <pre>${escapeHtml(fullPrompt)}</pre>
                    </div>
                </div>
            </div>
        `;
    }
}

// ============================================
// ПОМОШНИ ФУНКЦИИ
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const outputArea = document.getElementById('output-area');
    if (outputArea) {
        outputArea.innerHTML = `<div class="error-card">❌ ${message}</div>`;
    } else {
        alert(message);
    }
}

function setupEventListeners() {
    // Може да додадеш дополнителни event listeners
    console.log('✅ Event listeners поставени');
}

// ============================================
// ЕКСПОРТ (ако е потребно)
// ============================================
export { selectAgent, executeAgent };

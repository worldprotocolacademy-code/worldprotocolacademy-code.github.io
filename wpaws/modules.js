

const API_URL = 'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask';
const STATE_KEY = 'wpaws_platform_state_v1';

const state = {
  module: 'doctrine',
  plan: 'free',
  lang: 'mk',
  history: []
};

function $(id){ return document.getElementById(id); }
function saveState(){
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      module: state.module,
      plan: state.plan,
      lang: state.lang,
      topic: $('topic').value,
      details: $('details').value,
      history: state.history.slice(-6)
    }));
  } catch (_) {}
}
function loadState(){
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.module && window.WPA_MODULES[saved.module]) state.module = saved.module;
    if (saved.plan) state.plan = saved.plan;
    if (saved.lang) state.lang = saved.lang;
    $('plan').value = state.plan;
    $('lang').value = state.lang;
    $('topic').value = saved.topic || '';
    $('details').value = saved.details || '';
    state.history = Array.isArray(saved.history) ? saved.history : [];
  } catch (_) {}
}

function renderModuleButtons(){
  const host = $('moduleButtons');
  host.innerHTML = '';
  Object.entries(window.WPA_MODULES).forEach(([key, mod]) => {
    const btn = document.createElement('button');
    btn.className = 'module-btn' + (key === state.module ? ' active' : '');
    btn.innerHTML = `<span>${mod.icon}</span><span>${mod.title}</span>`;
    btn.onclick = () => { state.module = key; renderActiveModule(); saveState(); };
    host.appendChild(btn);
  });
}

function renderQuickActions(mod){
  const host = $('quickActions');
  host.innerHTML = '';
  mod.quickActions.forEach(label => {
    const btn = document.createElement('button');
    btn.className = 'ghost-btn';
    btn.textContent = label;
    btn.onclick = () => {
      $('details').value = label + ': ' + ($('details').value || '');
      $('details').focus();
      saveState();
    };
    host.appendChild(btn);
  });
}

function renderActiveModule(){
  const mod = window.WPA_MODULES[state.module];
  renderModuleButtons();
  $('moduleTitle').textContent = `${mod.icon} ${mod.title}`;
  $('moduleSubtitle').textContent = mod.subtitle;
  $('topic').placeholder = mod.placeholders.topic;
  $('details').placeholder = mod.placeholders.details;
  renderQuickActions(mod);
  $('statusModule').textContent = mod.title;
}

function appendSourceList(sources = []){
  const host = $('sourceList');
  host.innerHTML = '';
  if (!sources.length) {
    host.innerHTML = '<li>Нема изворни редови за ова барање.</li>';
    return;
  }
  sources.forEach(src => {
    const li = document.createElement('li');
    li.textContent = src;
    host.appendChild(li);
  });
}

function setStatus(text, kind='neutral'){
  const el = $('statusPill');
  el.textContent = text;
  el.dataset.kind = kind;
}

async function runAsk(){
  const mod = window.WPA_MODULES[state.module];
  const topic = $('topic').value.trim();
  const details = $('details').value.trim();
  if (!topic) {
    $('output').innerHTML = '<p>Внеси тема за да продолжиме.</p>';
    return;
  }
  const message = mod.prompt({ topic, details });
  state.plan = $('plan').value;
  state.lang = $('lang').value;
  setStatus('Virtual Sande обработува…','busy');
  $('output').innerHTML = '<p>Се обработува барањето…</p>';
  saveState();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-wpa-plan': state.plan },
      body: JSON.stringify({ message, lang: state.lang, history: state.history, plan: state.plan })
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Worker error');

    $('output').innerHTML = `<div class="answer">${String(data.answer || '').replace(/

/g,'</p><p>').replace(/^/,'<p>').replace(/$/,'</p>')}</div>`;
    appendSourceList(data.sources || []);
    $('metaBox').innerHTML = `
      <div><strong>Верзија:</strong> ${data.version || 'n/a'}</div>
      <div><strong>Mode:</strong> ${data.mode || 'n/a'}</div>
      <div><strong>Served by:</strong> ${data.servedBy || 'n/a'}</div>
      <div><strong>Контекст:</strong> ${data.hasContext ? 'Да' : 'Не'}</div>`;
    setStatus(data.mode === 'upgrade_required' ? 'Потребен е WPA Pro план' : 'Одговорот е подготвен', data.mode === 'upgrade_required' ? 'warn' : 'ok');
    state.history.push({ role: 'user', content: topic });
    state.history.push({ role: 'assistant', content: data.answer || '' });
    state.history = state.history.slice(-6);
    saveState();
  } catch (err) {
    $('output').innerHTML = `<p>Се појави проблем: ${err.message}</p>`;
    setStatus('Грешка во повикот кон Worker','error');
  }
}

function resetWorkspace(){
  $('topic').value = '';
  $('details').value = '';
  $('output').innerHTML = '<p>Резултатот ќе се појави тука.</p>';
  $('sourceList').innerHTML = '<li>Нема изворни редови за ова барање.</li>';
  $('metaBox').innerHTML = '<div><strong>Статус:</strong> Подготвен за ново барање.</div>';
  state.history = [];
  saveState();
  setStatus('Workspace е исчистен','neutral');
}

window.addEventListener('load', () => {
  $('runBtn').addEventListener('click', runAsk);
  $('resetBtn').addEventListener('click', resetWorkspace);
  $('plan').addEventListener('change', () => { state.plan = $('plan').value; saveState(); });
  $('lang').addEventListener('change', () => { state.lang = $('lang').value; saveState(); });
  $('topic').addEventListener('input', saveState);
  $('details').addEventListener('input', saveState);
  loadState();
  renderActiveModule();
  appendSourceList([]);
  setStatus('Подготвен за работа','neutral');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

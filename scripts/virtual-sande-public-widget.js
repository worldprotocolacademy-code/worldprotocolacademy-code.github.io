/* Virtual Sande AI — universal public WPA widget */
(function () {
  'use strict';

  if (window.__WPA_PUBLIC_VIRTUAL_SANDE__) return;

  var currentPath = String(window.location.pathname || '/').toLowerCase();
  var excludedPrefixes = [
    '/wpaws/',
    '/student-desk/',
    '/diplomatic-analysis-lab/'
  ];
  var excludedExact = [
    '/virtual-sande-ai.html'
  ];

  function isExcluded() {
    if (excludedExact.indexOf(currentPath) !== -1) return true;
    for (var i = 0; i < excludedPrefixes.length; i += 1) {
      if (currentPath.indexOf(excludedPrefixes[i]) === 0) return true;
    }
    return false;
  }

  function hasExistingBot() {
    return Boolean(
      document.getElementById('botToggle') ||
      document.getElementById('botPanel') ||
      document.getElementById('wpaInstVsFab') ||
      document.getElementById('wpaInstVsPanel') ||
      document.querySelector('.bot-wrap') ||
      document.querySelector('.wpa2-bot-wrap') ||
      document.querySelector('[data-virtual-sande-widget]')
    );
  }

  if (isExcluded() || hasExistingBot()) return;
  window.__WPA_PUBLIC_VIRTUAL_SANDE__ = true;

  var API = 'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask';
  var busy = false;
  var history = [];

  function isEnglish() {
    return String(document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;
  }

  function copy() {
    if (isEnglish()) {
      return {
        title: 'Virtual Sande AI',
        subtitle: 'World Protocol Academy academic assistant',
        welcome: 'Welcome. I am Virtual Sande AI, the academic assistant of World Protocol Academy.',
        placeholder: 'Ask about protocol, diplomacy, communication or security...',
        send: 'Send',
        clear: 'Clear',
        error: 'I cannot respond at the moment. Please try again.',
        label: 'Open Virtual Sande AI',
        close: 'Close'
      };
    }
    return {
      title: 'Virtual Sande AI',
      subtitle: 'Академски асистент на World Protocol Academy',
      welcome: 'Добредојдовте. Јас сум Virtual Sande AI, академски асистент на Светската академија за протокол.',
      placeholder: 'Поставете прашање за протокол, дипломатија, комуникација или безбедност...',
      send: 'Испрати',
      clear: 'Исчисти',
      error: 'Во моментот не можам да одговорам. Обидете се повторно.',
      label: 'Отвори Virtual Sande AI',
      close: 'Затвори'
    };
  }

  function installStyles() {
    if (document.getElementById('wpa-public-vs-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-public-vs-style';
    style.textContent = [
      '.wpa-public-vs-fab{position:fixed;right:22px;bottom:22px;z-index:2200;width:64px;height:64px;border-radius:50%;border:2px solid #c9a84c;background:#0d1f3c;padding:0;overflow:hidden;cursor:pointer;box-shadow:0 12px 34px rgba(8,19,40,.36);display:grid;place-items:center}',
      '.wpa-public-vs-fab img{width:100%;height:100%;object-fit:cover;display:block}',
      '.wpa-public-vs-panel{position:fixed;right:22px;bottom:98px;z-index:2199;width:min(390px,calc(100vw - 28px));height:min(570px,calc(100vh - 130px));background:#fbf8ee;border:1px solid rgba(201,168,76,.7);border-radius:14px;box-shadow:0 22px 60px rgba(8,19,40,.32);display:none;overflow:hidden;font-family:Inter,system-ui,sans-serif}',
      '.wpa-public-vs-panel.open{display:flex;flex-direction:column}',
      '.wpa-public-vs-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#0d1f3c;color:#fff;border-bottom:1px solid #c9a84c}',
      '.wpa-public-vs-mark{width:38px;height:38px;border-radius:50%;overflow:hidden;border:1px solid #c9a84c;flex:0 0 38px}',
      '.wpa-public-vs-mark img{width:100%;height:100%;object-fit:cover}',
      '.wpa-public-vs-copy{min-width:0;flex:1}.wpa-public-vs-title{font:700 16px/1.1 Georgia,serif;color:#e8d49a}.wpa-public-vs-sub{font-size:10.5px;color:rgba(255,255,255,.75);margin-top:3px}',
      '.wpa-public-vs-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:2px 5px}',
      '.wpa-public-vs-msgs{flex:1;overflow:auto;padding:14px;background:#fbf8ee}',
      '.wpa-public-vs-row{display:flex;margin:0 0 10px}.wpa-public-vs-row.user{justify-content:flex-end}',
      '.wpa-public-vs-bubble{max-width:88%;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #d8d2bc;color:#1a1a1a;font-size:13.5px;line-height:1.55;white-space:pre-wrap}',
      '.wpa-public-vs-row.user .wpa-public-vs-bubble{background:#0d1f3c;color:#fff;border-color:#0d1f3c}',
      '.wpa-public-vs-form{display:flex;gap:8px;padding:10px;border-top:1px solid #d8d2bc;background:#f5f0e0}',
      '.wpa-public-vs-input{flex:1;min-height:46px;max-height:110px;resize:vertical;border:1px solid #d8d2bc;border-radius:9px;padding:10px;font:13px/1.4 Inter,system-ui,sans-serif;outline:none;background:#fff}',
      '.wpa-public-vs-send{border:0;border-radius:9px;background:#c9a84c;color:#081328;font-weight:800;padding:0 14px;cursor:pointer}',
      '.wpa-public-vs-tools{display:flex;justify-content:flex-end;padding:0 10px 9px;background:#f5f0e0}',
      '.wpa-public-vs-clear{border:0;background:transparent;color:#5a4220;font-size:11px;cursor:pointer}',
      '@media(max-width:520px){.wpa-public-vs-fab{right:14px;bottom:14px;width:58px;height:58px}.wpa-public-vs-panel{right:14px;bottom:82px;height:calc(100vh - 104px)}}'
    ].join('');
    document.head.appendChild(style);
  }

  function addMessage(text, who) {
    var messages = document.getElementById('wpaPublicVsMsgs');
    if (!messages) return;
    var row = document.createElement('div');
    row.className = 'wpa-public-vs-row' + (who === 'user' ? ' user' : '');
    var bubble = document.createElement('div');
    bubble.className = 'wpa-public-vs-bubble';
    bubble.textContent = String(text || '');
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function answerFrom(data) {
    if (!data) return '';
    return data.answer || data.response || data.reply || data.message || data.output || data.text || (data.result && (data.result.answer || data.result.text)) || '';
  }

  async function send() {
    if (busy) return;
    var input = document.getElementById('wpaPublicVsInput');
    var question = input ? input.value.trim() : '';
    if (!question) return;

    busy = true;
    input.value = '';
    addMessage(question, 'user');
    history.push({ role: 'user', content: question });

    var button = document.getElementById('wpaPublicVsSend');
    if (button) button.disabled = true;

    try {
      var response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          question: question,
          query: question,
          language: String(document.documentElement.lang || 'mk'),
          history: history.slice(-6),
          context: 'World Protocol Academy public page: ' + currentPath
        })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var data = await response.json();
      var answer = answerFrom(data);
      if (!answer) throw new Error('Empty answer');
      addMessage(answer, 'bot');
      history.push({ role: 'assistant', content: answer });
    } catch (error) {
      addMessage(copy().error, 'bot');
    } finally {
      busy = false;
      if (button) button.disabled = false;
      if (input) input.focus();
    }
  }

  function mount() {
    if (isExcluded() || hasExistingBot() || document.getElementById('wpaPublicVsFab')) return;

    installStyles();
    var text = copy();
    var panel = document.createElement('section');
    panel.id = 'wpaPublicVsPanel';
    panel.className = 'wpa-public-vs-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', text.title);
    panel.setAttribute('data-virtual-sande-widget', 'public');
    panel.innerHTML = '<div class="wpa-public-vs-head"><span class="wpa-public-vs-mark"><img src="/logo.webp" alt="World Protocol Academy logo" width="38" height="38"></span><div class="wpa-public-vs-copy"><div class="wpa-public-vs-title">' + text.title + '</div><div class="wpa-public-vs-sub">' + text.subtitle + '</div></div><button class="wpa-public-vs-close" type="button" aria-label="' + text.close + '">×</button></div><div class="wpa-public-vs-msgs" id="wpaPublicVsMsgs"></div><form class="wpa-public-vs-form" id="wpaPublicVsForm"><textarea class="wpa-public-vs-input" id="wpaPublicVsInput" placeholder="' + text.placeholder + '"></textarea><button class="wpa-public-vs-send" id="wpaPublicVsSend" type="submit">' + text.send + '</button></form><div class="wpa-public-vs-tools"><button class="wpa-public-vs-clear" id="wpaPublicVsClear" type="button">' + text.clear + '</button></div>';

    var fab = document.createElement('button');
    fab.id = 'wpaPublicVsFab';
    fab.className = 'wpa-public-vs-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', text.label);
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('data-virtual-sande-widget', 'launcher');
    fab.innerHTML = '<img src="/logo.webp" alt="" width="64" height="64">';

    document.body.appendChild(panel);
    document.body.appendChild(fab);
    addMessage(text.welcome, 'bot');

    fab.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) document.getElementById('wpaPublicVsInput').focus();
    });

    panel.querySelector('.wpa-public-vs-close').addEventListener('click', function () {
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('wpaPublicVsForm').addEventListener('submit', function (event) {
      event.preventDefault();
      send();
    });

    document.getElementById('wpaPublicVsInput').addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });

    document.getElementById('wpaPublicVsClear').addEventListener('click', function () {
      history = [];
      document.getElementById('wpaPublicVsMsgs').innerHTML = '';
      addMessage(copy().welcome, 'bot');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        fab.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();

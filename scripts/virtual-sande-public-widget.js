/* Virtual Sande AI — resilient universal public WPA widget — 2026-07-24 */
(function () {
  'use strict';

  if (window.__WPA_PUBLIC_VIRTUAL_SANDE_RECOVERY__) return;
  window.__WPA_PUBLIC_VIRTUAL_SANDE_RECOVERY__ = true;

  var currentPath = String(window.location.pathname || '/').toLowerCase();
  var excludedPrefixes = ['/wpaws/', '/student-desk/', '/diplomatic-analysis-lab/'];
  var excludedExact = ['/virtual-sande-ai.html'];
  var ENDPOINTS = [
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask',
    'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask'
  ];
  var busy = false;
  var history = [];

  function isExcluded() {
    if (excludedExact.indexOf(currentPath) !== -1) return true;
    for (var i = 0; i < excludedPrefixes.length; i += 1) {
      if (currentPath.indexOf(excludedPrefixes[i]) === 0) return true;
    }
    return false;
  }

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
        connecting: 'Connecting...',
        error: 'Virtual Sande is temporarily unable to reach the academic service. Please try again shortly.',
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
      connecting: 'Се поврзувам...',
      error: 'Virtual Sande привремено не може да се поврзе со академскиот сервис. Обидете се повторно за кратко.',
      label: 'Отвори Virtual Sande AI',
      close: 'Затвори'
    };
  }

  function installStyles() {
    if (document.getElementById('wpa-public-vs-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-public-vs-style';
    style.textContent = [
      '.bot-wrap[data-wpa-legacy-bot="hidden"],.wpa2-bot-wrap[data-wpa-legacy-bot="hidden"]{display:none!important;visibility:hidden!important;pointer-events:none!important}',
      '.wpa-public-vs-fab{position:fixed!important;right:22px!important;bottom:22px!important;z-index:2147483600!important;width:64px!important;height:64px!important;border-radius:50%!important;border:2px solid #c9a84c!important;background:#0d1f3c!important;padding:0!important;overflow:hidden!important;cursor:pointer!important;box-shadow:0 12px 34px rgba(8,19,40,.36)!important;display:grid!important;place-items:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      '.wpa-public-vs-fab img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}',
      '.wpa-public-vs-panel{position:fixed!important;right:22px!important;bottom:98px!important;z-index:2147483599!important;width:min(390px,calc(100vw - 28px))!important;height:min(570px,calc(100vh - 130px))!important;background:#fbf8ee!important;border:1px solid rgba(201,168,76,.7)!important;border-radius:14px!important;box-shadow:0 22px 60px rgba(8,19,40,.32)!important;display:none!important;overflow:hidden!important;font-family:Inter,system-ui,sans-serif!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}',
      '.wpa-public-vs-panel.open{display:flex!important;flex-direction:column!important}',
      '.wpa-public-vs-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#0d1f3c;color:#fff;border-bottom:1px solid #c9a84c}',
      '.wpa-public-vs-mark{width:38px;height:38px;border-radius:50%;overflow:hidden;border:1px solid #c9a84c;flex:0 0 38px}',
      '.wpa-public-vs-mark img{width:100%;height:100%;object-fit:cover}',
      '.wpa-public-vs-copy{min-width:0;flex:1}.wpa-public-vs-title{font:700 16px/1.1 Georgia,serif;color:#e8d49a}.wpa-public-vs-sub{font-size:10.5px;color:rgba(255,255,255,.75);margin-top:3px}',
      '.wpa-public-vs-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:2px 5px}',
      '.wpa-public-vs-status{min-height:18px;padding:4px 12px 0;background:#fbf8ee;color:#6c5830;font-size:10.5px}',
      '.wpa-public-vs-msgs{flex:1;overflow:auto;padding:14px;background:#fbf8ee}',
      '.wpa-public-vs-row{display:flex;margin:0 0 10px}.wpa-public-vs-row.user{justify-content:flex-end}',
      '.wpa-public-vs-bubble{max-width:88%;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #d8d2bc;color:#1a1a1a;font-size:13.5px;line-height:1.55;white-space:pre-wrap}',
      '.wpa-public-vs-row.user .wpa-public-vs-bubble{background:#0d1f3c;color:#fff;border-color:#0d1f3c}',
      '.wpa-public-vs-form{display:flex;gap:8px;padding:10px;border-top:1px solid #d8d2bc;background:#f5f0e0}',
      '.wpa-public-vs-input{flex:1;min-height:46px;max-height:110px;resize:vertical;border:1px solid #d8d2bc;border-radius:9px;padding:10px;font:13px/1.4 Inter,system-ui,sans-serif;outline:none;background:#fff;color:#1a1a1a}',
      '.wpa-public-vs-send{border:0;border-radius:9px;background:#c9a84c;color:#081328;font-weight:800;padding:0 14px;cursor:pointer}',
      '.wpa-public-vs-send:disabled{opacity:.6;cursor:wait}',
      '.wpa-public-vs-tools{display:flex;justify-content:flex-end;padding:0 10px 9px;background:#f5f0e0}',
      '.wpa-public-vs-clear{border:0;background:transparent;color:#5a4220;font-size:11px;cursor:pointer}',
      '@media(max-width:520px){.wpa-public-vs-fab{right:14px!important;bottom:14px!important;width:58px!important;height:58px!important}.wpa-public-vs-panel{right:14px!important;bottom:82px!important;height:calc(100vh - 104px)!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function hideLegacyBots() {
    var legacy = document.querySelectorAll('.bot-wrap,.wpa2-bot-wrap');
    Array.prototype.forEach.call(legacy, function (node) {
      if (!node.closest('#wpaPublicVsPanel')) node.setAttribute('data-wpa-legacy-bot', 'hidden');
    });
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
    return data.answer || data.response || data.reply || data.message || data.output || data.text ||
      (data.result && (data.result.answer || data.result.response || data.result.text)) || '';
  }

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (controller) controller.abort(); }, timeoutMs);
    var requestOptions = Object.assign({}, options, controller ? { signal: controller.signal } : {});
    return fetch(url, requestOptions).finally(function () { window.clearTimeout(timer); });
  }

  async function callEndpoint(endpoint, payload) {
    var response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }, 6500);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    var data = await response.json();
    var answer = answerFrom(data);
    if (!answer) throw new Error('Empty answer');
    return answer;
  }

  async function requestAnswer(question) {
    var lang = String(document.documentElement.lang || 'mk').toLowerCase().slice(0, 2) || 'mk';
    var payload = {
      message: question,
      question: question,
      query: question,
      lang: lang,
      language: lang,
      history: history.slice(-6),
      quality: '3layer_academic',
      context: 'World Protocol Academy public page: ' + currentPath
    };
    var lastError = null;
    for (var i = 0; i < ENDPOINTS.length; i += 1) {
      try {
        return await callEndpoint(ENDPOINTS[i], payload);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('All endpoints unavailable');
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
    var status = document.getElementById('wpaPublicVsStatus');
    if (button) button.disabled = true;
    if (status) status.textContent = copy().connecting;

    try {
      var answer = await requestAnswer(question);
      addMessage(answer, 'bot');
      history.push({ role: 'assistant', content: answer });
    } catch (error) {
      addMessage(copy().error, 'bot');
    } finally {
      busy = false;
      if (button) button.disabled = false;
      if (status) status.textContent = '';
      if (input) input.focus();
    }
  }

  function mount() {
    if (isExcluded() || document.getElementById('wpaPublicVsFab') || !document.body) return;

    installStyles();
    hideLegacyBots();
    var text = copy();
    var panel = document.createElement('section');
    panel.id = 'wpaPublicVsPanel';
    panel.className = 'wpa-public-vs-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', text.title);
    panel.setAttribute('data-virtual-sande-widget', 'public-recovery');
    panel.innerHTML = '<div class="wpa-public-vs-head"><span class="wpa-public-vs-mark"><img src="/logo.webp" alt="World Protocol Academy logo" width="38" height="38"></span><div class="wpa-public-vs-copy"><div class="wpa-public-vs-title">' + text.title + '</div><div class="wpa-public-vs-sub">' + text.subtitle + '</div></div><button class="wpa-public-vs-close" type="button" aria-label="' + text.close + '">×</button></div><div class="wpa-public-vs-status" id="wpaPublicVsStatus" aria-live="polite"></div><div class="wpa-public-vs-msgs" id="wpaPublicVsMsgs"></div><form class="wpa-public-vs-form" id="wpaPublicVsForm"><textarea class="wpa-public-vs-input" id="wpaPublicVsInput" maxlength="700" placeholder="' + text.placeholder + '"></textarea><button class="wpa-public-vs-send" id="wpaPublicVsSend" type="submit">' + text.send + '</button></form><div class="wpa-public-vs-tools"><button class="wpa-public-vs-clear" id="wpaPublicVsClear" type="button">' + text.clear + '</button></div>';

    var fab = document.createElement('button');
    fab.id = 'wpaPublicVsFab';
    fab.className = 'wpa-public-vs-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', text.label);
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('data-virtual-sande-widget', 'launcher-recovery');
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
  window.setTimeout(mount, 400);
  window.setTimeout(mount, 1600);
})();

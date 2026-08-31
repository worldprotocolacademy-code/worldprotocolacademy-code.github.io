/* Virtual Sande AI — Institute public widget */
(function () {
  'use strict';
  if (window.__WPA_INSTITUTE_VIRTUAL_SANDE__) return;
  window.__WPA_INSTITUTE_VIRTUAL_SANDE__ = true;

  var API = 'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask';
  var busy = false;
  var history = [];

  function mkText() {
    return {
      title: 'Virtual Sande AI',
      subtitle: 'WPA Institute академски асистент',
      welcome: 'Добредојдовте. Јас сум Virtual Sande AI, академски асистент на Институтот при Светската академија за протокол.',
      placeholder: 'Поставете прашање за протокол, дипломатија, комуникација или безбедност...',
      send: 'Испрати',
      clear: 'Исчисти',
      error: 'Во моментот не можам да одговорам. Обидете се повторно.',
      label: 'Отвори Virtual Sande AI'
    };
  }

  function enText() {
    return {
      title: 'Virtual Sande AI',
      subtitle: 'WPA Institute academic assistant',
      welcome: 'Welcome. I am Virtual Sande AI, the academic assistant of the World Protocol Academy Institute.',
      placeholder: 'Ask about protocol, diplomacy, communication or security...',
      send: 'Send',
      clear: 'Clear',
      error: 'I cannot respond at the moment. Please try again.',
      label: 'Open Virtual Sande AI'
    };
  }

  function copy() {
    return String(document.documentElement.lang || 'mk').toLowerCase().indexOf('en') === 0 ? enText() : mkText();
  }

  function style() {
    if (document.getElementById('wpa-institute-vs-style')) return;
    var s = document.createElement('style');
    s.id = 'wpa-institute-vs-style';
    s.textContent = [
      '.wpa-inst-vs-fab{position:fixed;right:22px;bottom:22px;z-index:2200;width:64px;height:64px;border-radius:50%;border:2px solid #c9a84c;background:#0d1f3c;padding:0;overflow:hidden;cursor:pointer;box-shadow:0 12px 34px rgba(8,19,40,.36);display:grid;place-items:center}',
      '.wpa-inst-vs-fab img{width:100%;height:100%;object-fit:cover;display:block}',
      '.wpa-inst-vs-panel{position:fixed;right:22px;bottom:98px;z-index:2199;width:min(390px,calc(100vw - 28px));height:min(570px,calc(100vh - 130px));background:#fbf8ee;border:1px solid rgba(201,168,76,.7);border-radius:14px;box-shadow:0 22px 60px rgba(8,19,40,.32);display:none;overflow:hidden;font-family:Inter,system-ui,sans-serif}',
      '.wpa-inst-vs-panel.open{display:flex;flex-direction:column}',
      '.wpa-inst-vs-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#0d1f3c;color:#fff;border-bottom:1px solid #c9a84c}',
      '.wpa-inst-vs-mark{width:38px;height:38px;border-radius:50%;overflow:hidden;border:1px solid #c9a84c;flex:0 0 38px}',
      '.wpa-inst-vs-mark img{width:100%;height:100%;object-fit:cover}',
      '.wpa-inst-vs-copy{min-width:0;flex:1}.wpa-inst-vs-title{font:700 16px/1.1 Georgia,serif;color:#e8d49a}.wpa-inst-vs-sub{font-size:10.5px;color:rgba(255,255,255,.75);margin-top:3px}',
      '.wpa-inst-vs-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:2px 5px}',
      '.wpa-inst-vs-msgs{flex:1;overflow:auto;padding:14px;background:#fbf8ee}',
      '.wpa-inst-vs-row{display:flex;margin:0 0 10px}.wpa-inst-vs-row.user{justify-content:flex-end}',
      '.wpa-inst-vs-bubble{max-width:88%;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #d8d2bc;color:#1a1a1a;font-size:13.5px;line-height:1.55;white-space:pre-wrap}',
      '.wpa-inst-vs-row.user .wpa-inst-vs-bubble{background:#0d1f3c;color:#fff;border-color:#0d1f3c}',
      '.wpa-inst-vs-form{display:flex;gap:8px;padding:10px;border-top:1px solid #d8d2bc;background:#f5f0e0}',
      '.wpa-inst-vs-input{flex:1;min-height:46px;max-height:110px;resize:vertical;border:1px solid #d8d2bc;border-radius:9px;padding:10px;font:13px/1.4 Inter,system-ui,sans-serif;outline:none;background:#fff}',
      '.wpa-inst-vs-send{border:0;border-radius:9px;background:#c9a84c;color:#081328;font-weight:800;padding:0 14px;cursor:pointer}',
      '.wpa-inst-vs-tools{display:flex;justify-content:flex-end;padding:0 10px 9px;background:#f5f0e0}',
      '.wpa-inst-vs-clear{border:0;background:transparent;color:#5a4220;font-size:11px;cursor:pointer}',
      '.wpa-institute-brand .brand-mark{font-size:0!important;line-height:0!important}',
      '.wpa-institute-brand .brand-text{writing-mode:horizontal-tb!important;text-orientation:mixed!important}',
      '.wpa-institute-brand .wpa-institute-title-row{display:flex!important;flex-direction:row!important;align-items:baseline!important;flex-wrap:wrap!important;writing-mode:horizontal-tb!important}',
      '.wpa-institute-brand .wpa-institute-name-mk,.wpa-institute-brand .wpa-institute-name-en,.wpa-institute-brand .wpa-institute-parent{writing-mode:horizontal-tb!important;text-orientation:mixed!important}',
      '@media(max-width:520px){.wpa-inst-vs-fab{right:14px;bottom:14px;width:58px;height:58px}.wpa-inst-vs-panel{right:14px;bottom:82px;height:calc(100vh - 104px)}}'
    ].join('');
    document.head.appendChild(s);
  }

  function removePn003TopbarPromo() {
    var links = document.querySelectorAll('.topbar-quicklinks a[href="https://doi.org/10.5281/zenodo.21390763"]');
    Array.prototype.forEach.call(links, function (link) { link.remove(); });
  }

  function normalizeInstituteHeader() {
    var brand = document.querySelector('.nav-wrap nav .brand');
    if (!brand) return;
    brand.classList.add('wpa-institute-brand');
    brand.removeAttribute('href');
    brand.setAttribute('aria-label', 'Институт за протокол, дипломатија, јавна комуникација и безбедносни студии — Institute for Protocol, Diplomacy, Public Communication and Security Studies');
    var mark = brand.querySelector('.brand-mark');
    if (mark) {
      mark.textContent = '';
      var logo = document.createElement('img');
      logo.src = '/assets/img/logo.svg';
      logo.alt = 'World Protocol Academy logo';
      logo.width = 72;
      logo.height = 72;
      logo.loading = 'eager';
      logo.decoding = 'async';
      mark.appendChild(logo);
    }
    var text = brand.querySelector('.brand-text');
    if (text) {
      text.innerHTML = '<span class="wpa-institute-title-row"><span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span><span class="wpa-institute-name-separator" aria-hidden="true">•</span><span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span></span><span class="wpa-institute-parent">Светска академија за протокол · World Protocol Academy</span>';
    }
  }

  function addMessage(text, who) {
    var msgs = document.getElementById('wpaInstVsMsgs');
    if (!msgs) return;
    var row = document.createElement('div');
    row.className = 'wpa-inst-vs-row' + (who === 'user' ? ' user' : '');
    var bubble = document.createElement('div');
    bubble.className = 'wpa-inst-vs-bubble';
    bubble.textContent = String(text || '');
    row.appendChild(bubble);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function answerFrom(data) {
    if (!data) return '';
    return data.answer || data.response || data.message || data.text || (data.result && (data.result.answer || data.result.text)) || '';
  }

  async function send() {
    if (busy) return;
    var input = document.getElementById('wpaInstVsInput');
    var q = input ? input.value.trim() : '';
    if (!q) return;
    busy = true;
    input.value = '';
    addMessage(q, 'user');
    history.push({ role: 'user', content: q });
    var btn = document.getElementById('wpaInstVsSend');
    if (btn) btn.disabled = true;
    try {
      var response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, question: q, query: q, history: history.slice(-6), language: String(document.documentElement.lang || 'mk') })
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
      if (btn) btn.disabled = false;
      if (input) input.focus();
    }
  }

  function mount() {
    style();
    removePn003TopbarPromo();
    normalizeInstituteHeader();
    window.setTimeout(normalizeInstituteHeader, 250);
    if (document.getElementById('wpaInstVsFab')) return;
    var t = copy();
    var panel = document.createElement('section');
    panel.id = 'wpaInstVsPanel';
    panel.className = 'wpa-inst-vs-panel';
    panel.setAttribute('aria-label', t.title);
    panel.innerHTML = '<div class="wpa-inst-vs-head"><span class="wpa-inst-vs-mark"><img src="/assets/img/logo.svg" alt="World Protocol Academy logo" width="38" height="38"></span><div class="wpa-inst-vs-copy"><div class="wpa-inst-vs-title">' + t.title + '</div><div class="wpa-inst-vs-sub">' + t.subtitle + '</div></div><button class="wpa-inst-vs-close" type="button" aria-label="Close">×</button></div><div class="wpa-inst-vs-msgs" id="wpaInstVsMsgs"></div><form class="wpa-inst-vs-form" id="wpaInstVsForm"><textarea class="wpa-inst-vs-input" id="wpaInstVsInput" placeholder="' + t.placeholder + '"></textarea><button class="wpa-inst-vs-send" id="wpaInstVsSend" type="submit">' + t.send + '</button></form><div class="wpa-inst-vs-tools"><button class="wpa-inst-vs-clear" id="wpaInstVsClear" type="button">' + t.clear + '</button></div>';
    var fab = document.createElement('button');
    fab.id = 'wpaInstVsFab';
    fab.className = 'wpa-inst-vs-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', t.label);
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<img src="/assets/img/logo.svg" alt="" width="64" height="64">';
    document.body.appendChild(panel);
    document.body.appendChild(fab);
    addMessage(t.welcome, 'bot');
    fab.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) document.getElementById('wpaInstVsInput').focus();
    });
    panel.querySelector('.wpa-inst-vs-close').addEventListener('click', function () {
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });
    document.getElementById('wpaInstVsForm').addEventListener('submit', function (event) {
      event.preventDefault();
      send();
    });
    document.getElementById('wpaInstVsInput').addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    });
    document.getElementById('wpaInstVsClear').addEventListener('click', function () {
      history = [];
      document.getElementById('wpaInstVsMsgs').innerHTML = '';
      addMessage(copy().welcome, 'bot');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();

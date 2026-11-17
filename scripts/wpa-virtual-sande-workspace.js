/* WPA Virtual Sande Academic Workspace P1 — progressive enhancement, no new data processors.
 * This is browser-only functionality. It does not provide model inference, web search,
 * file analysis, cross-session memory or a verified citation service.
 */
(function () {
  'use strict';
  if (window.__WPA_VS_ACADEMIC_WORKSPACE__) return;
  window.__WPA_VS_ACADEMIC_WORKSPACE__ = true;

  var SETTINGS = [
    { log:'#wpaPublicVsMsgs', tools:'.wpa-public-vs-tools', row:'.wpa-public-vs-row' },
    { log:'#wpaInstVsMsgs', tools:'.wpa-inst-vs-tools', row:'.wpa-inst-vs-row' }
  ];
  var mounted = 0;

  function isEnglish() {
    return /^en\b/i.test(String(document.documentElement.lang || 'mk'));
  }

  function words() {
    return isEnglish() ? {
      copy:'Copy answer', copied:'Copied', copyFailed:'Copy failed',
      read:'Read aloud', stop:'Stop reading', readUnavailable:'Voice unavailable',
      passport:'WPA evidence passport', export:'Export chat · Markdown',
      noContext:'Not stated by service', source:'Response route',
      route:'Server mode', servedBy:'Server attribution',
      serverRefs:'Server-reported source entries',
      notVerified:'Not independently verified',
      hasContext:'Context indicator', contextYes:'Claimed by service', contextNo:'No context reported',
      time:'Shown on your device', human:'Human Gate',
      humanText:'For official, diplomatic, legal or consequential uses, check the original sources and obtain human approval.',
      limitations:'Evidence boundary',
      factLimit:'This passport describes delivery and source attribution, not the factual accuracy of each sentence.',
      modelLimit:'Model provenance is reported by the service and is not independent proof of inference.',
      doctrineLimit:'WPA protected doctrine is authored reference content, not a new model-generated answer.',
      insufficientLimit:'The service did not accept enough evidence for a grounded procedural answer.',
      localLimit:'This answer came from a local on-page reference, without a successful live-model proof.',
      unknownLimit:'The available metadata does not establish a live-model answer or verified citations.',
      privacy:'The conversation stays in this tab unless you explicitly export it. Export may include your questions.',
      saved:'File saved by your browser', failed:'Export unavailable',
      roleUser:'You', roleAssistant:'Virtual Sande AI',
      labels:{live:'Model-attributed answer',doctrine:'WPA protected doctrine',insufficient:'Insufficient evidence',local:'Local reference',unavailable:'Connection unavailable',unverified:'Unverified response'}
    } : {
      copy:'Копирај одговор', copied:'Копирано', copyFailed:'Неуспешно копирање',
      read:'Прочитај гласно', stop:'Запри читање', readUnavailable:'Гласот е недостапен',
      passport:'WPA доказен пасош', export:'Извези разговор · Markdown',
      noContext:'Нема податок од сервисот', source:'Потекло на одговорот',
      route:'Режим на сервисот', servedBy:'Ознака од серверот',
      serverRefs:'Пријавени изворни ставки',
      notVerified:'Не се независно проверени',
      hasContext:'Показател за контекст',contextYes:'Сервисот го пријавил',contextNo:'Нема пријавен контекст',
      time:'Прикажано на уредот', human:'Човечка порта',
      humanText:'За службени, дипломатски, правни и други значајни дејства, проверете ги примарните извори и обезбедете човечко одобрување.',
      limitations:'Граница на доказот',
      factLimit:'Овој пасош го прикажува потеклото на одговорот, но не ја потврдува точноста на секоја реченица.',
      modelLimit:'Моделскиот извор е пријавен од сервисот; тоа не е независен доказ за извршена инференција.',
      doctrineLimit:'Заштитената WPA доктрина е авторска референтна содржина, а не нов одговор генериран од модел.',
      insufficientLimit:'Сервисот не потврдил доволна изворна поткрепа за процедурален одговор.',
      localLimit:'Ова е локална референтна содржина, без потврден одговор од жив модел.',
      unknownLimit:'Достапните метаподатоци не потврдуваат моделски одговор или проверени цитати.',
      privacy:'Разговорот останува во оваа картичка освен ако експлицитно не го извезете. Извозот може да ги содржи вашите прашања.',
      saved:'Прелистувачот го зачува фајлот', failed:'Извозот е недостапен',
      roleUser:'Вие', roleAssistant:'Virtual Sande AI',
      labels:{live:'Одговор со пријавен моделски извор',doctrine:'Заштитена WPA доктрина',insufficient:'Недоволна поткрепа',local:'Локална референца',unavailable:'Недостапна врска',unverified:'Непотврден одговор'}
    };
  }

  function elem(tag, className, content) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof content === 'string') node.textContent = content;
    return node;
  }

  function sourceDescription(kind, t) {
    var boundary = {
      live:t.modelLimit, doctrine:t.doctrineLimit, insufficient:t.insufficientLimit,
      local:t.localLimit, unavailable:t.unknownLimit, unverified:t.unknownLimit
    };
    return boundary[kind] || t.unknownLimit;
  }

  function safeMetadata(node, key) {
    var value = String(node.dataset[key] || '').trim();
    return value && value.length <= 100 ? value : '';
  }

  function item(list, label, value) {
    var dt = elem('dt', '', label);
    var dd = elem('dd', '', value);
    list.appendChild(dt);
    list.appendChild(dd);
  }

  function passport(row, t) {
    var kind = safeMetadata(row, 'answerSource') || 'unverified';
    var details = elem('details', 'wpa-vs-passport');
    details.appendChild(elem('summary', '', t.passport));
    var body = elem('div', 'wpa-vs-passport-body');
    var dl = elem('dl', 'wpa-vs-passport-facts');
    item(dl, t.source, t.labels[kind] || t.labels.unverified);
    item(dl, t.route, safeMetadata(row, 'wpaResponseMode') || t.noContext);
    item(dl, t.servedBy, safeMetadata(row, 'wpaServedBy') || t.noContext);
    var count = safeMetadata(row, 'wpaSourceCount');
    item(dl, t.serverRefs, /^\d{1,3}$/.test(count) ? count + ' · ' + t.notVerified : t.noContext);
    var hasContext = safeMetadata(row, 'wpaHasContext');
    item(dl, t.hasContext, hasContext === 'true' ? t.contextYes : hasContext === 'false' ? t.contextNo : t.noContext);
    item(dl, t.time, new Date().toLocaleString(isEnglish() ? 'en-GB' : 'mk-MK'));
    body.appendChild(dl);
    body.appendChild(elem('p','wpa-vs-boundary',t.limitations + ': ' + t.factLimit + ' ' + sourceDescription(kind,t)));
    body.appendChild(elem('p','wpa-vs-human',t.human + ': ' + t.humanText));
    details.appendChild(body);
    return details;
  }

  function notify(button, message) {
    var old = button.textContent;
    button.textContent = message;
    window.setTimeout(function () { if (button.isConnected) button.textContent = old; }, 1800);
  }

  function fallbackCopy(text) {
    var textarea = elem('textarea','wpa-vs-temp');
    textarea.value = text;
    textarea.setAttribute('aria-hidden','true');
    textarea.style.position='fixed';
    textarea.style.left='-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (error) { ok = false; }
    textarea.remove();
    return ok;
  }

  async function copyAnswer(button, row) {
    var bubble = row.querySelector('.wpa-public-vs-bubble,.wpa-inst-vs-bubble');
    if (!bubble) return;
    var text = bubble.textContent || '';
    var ok = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try { await navigator.clipboard.writeText(text); ok = true; } catch (error) {}
    }
    if (!ok) ok = fallbackCopy(text);
    notify(button, ok ? words().copied : words().copyFailed);
  }

  function speech(button, row) {
    var t = words();
    var voice = window.speechSynthesis;
    if (!voice || typeof window.SpeechSynthesisUtterance !== 'function') {
      notify(button, t.readUnavailable);
      return;
    }
    if (voice.speaking) {
      voice.cancel();
      button.textContent = t.read;
      return;
    }
    var bubble = row.querySelector('.wpa-public-vs-bubble,.wpa-inst-vs-bubble');
    if (!bubble) return;
    var utterance = new window.SpeechSynthesisUtterance((bubble.textContent || '').slice(0,6000));
    utterance.lang = isEnglish() ? 'en-GB' : 'mk-MK';
    utterance.rate = 1;
    utterance.onend = utterance.onerror = function () {
      if (button.isConnected) button.textContent = t.read;
    };
    button.textContent = t.stop;
    voice.speak(utterance);
  }

  function addControls(row) {
    if (row.querySelector('.wpa-vs-actions')) return;
    var t = words();
    var bar = elem('div','wpa-vs-actions');
    var copy = elem('button','wpa-vs-action',t.copy);
    copy.type = 'button';
    copy.addEventListener('click',function () { copyAnswer(copy,row); });
    var read = elem('button','wpa-vs-action',t.read);
    read.type = 'button';
    read.addEventListener('click',function () { speech(read,row); });
    bar.appendChild(copy);
    bar.appendChild(read);
    row.appendChild(bar);
    row.appendChild(passport(row,t));
  }

  function exportChat(spec, button) {
    var t = words();
    var host = document.querySelector(spec.log);
    if (!host) return;
    var lines = [
      '# WPA Virtual Sande AI · Conversation export',
      '',
      '> ' + t.privacy,
      '> ' + t.factLimit,
      ''
    ];
    var count = 0;
    host.querySelectorAll(spec.row).forEach(function (row) {
      var bubble = row.querySelector('.wpa-public-vs-bubble,.wpa-inst-vs-bubble');
      if (!bubble) return;
      var isUser = row.classList.contains('user');
      // Exclude the automated welcome message before the user's first question.
      if (!isUser && count === 0) return;
      var speaker = isUser ? t.roleUser : t.roleAssistant;
      var label = !isUser ? ' · ' + (t.labels[row.dataset.answerSource] || t.labels.unverified) : '';
      lines.push('## ' + speaker + label);
      lines.push('');
      lines.push((bubble.textContent || '').replace(/\r\n/g,'\n'));
      lines.push('');
      count += 1;
    });
    if (!count) { notify(button, t.failed); return; }
    try {
      var blob = new Blob([lines.join('\n')], {type:'text/markdown;charset=utf-8'});
      var url = URL.createObjectURL(blob);
      var anchor = elem('a');
      anchor.href = url;
      anchor.download = 'wpa-virtual-sande-' + new Date().toISOString().slice(0,10) + '.md';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      notify(button,t.saved);
    } catch (error) {
      notify(button,t.failed);
    }
  }

  function mount(spec) {
    var host = document.querySelector(spec.log);
    var tools = document.querySelector(spec.tools);
    if (!host || !tools || host.dataset.wpaWorkspaceMounted === 'true') return false;
    host.dataset.wpaWorkspaceMounted = 'true';
    var exportButton = elem('button','wpa-vs-export',words().export);
    exportButton.type = 'button';
    exportButton.addEventListener('click',function () { exportChat(spec,exportButton); });
    tools.insertBefore(exportButton,tools.firstChild);
    var scan = function () {
      // The initial greeting does not receive an evidence passport.
      var seenQuestion = false;
      host.querySelectorAll(spec.row).forEach(function (row) {
        if (row.classList.contains('user')) { seenQuestion = true; return; }
        if (seenQuestion && row.classList.contains('assistant')) addControls(row);
      });
    };
    new MutationObserver(scan).observe(host,{childList:true});
    scan();
    mounted += 1;
    return true;
  }

  function addStyles() {
    if (document.getElementById('wpa-vs-workspace-css')) return;
    var style = elem('style');
    style.id = 'wpa-vs-workspace-css';
    style.textContent = [
      '.wpa-vs-actions{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 4px}',
      '.wpa-vs-action,.wpa-vs-export{min-height:36px;min-width:44px;border:1px solid #b99b55;border-radius:7px;background:#fffaf0;color:#1b2f4d;padding:6px 9px;font:600 11px/1.35 system-ui,sans-serif;cursor:pointer}',
      '.wpa-vs-action:hover,.wpa-vs-export:hover{background:#f0e4c4}',
      '.wpa-vs-action:focus-visible,.wpa-vs-export:focus-visible,.wpa-vs-passport summary:focus-visible{outline:3px solid #947326;outline-offset:2px}',
      '.wpa-vs-export{margin-right:auto}',
      '.wpa-vs-passport{max-width:100%;width:min(100%,355px);margin:2px 0 12px;background:#fffdf8;border:1px solid #d4c08b;border-radius:8px;color:#24344c}',
      '.wpa-vs-passport summary{padding:8px 10px;min-height:36px;font:700 11px/1.4 system-ui,sans-serif;cursor:pointer}',
      '.wpa-vs-passport-body{border-top:1px solid #e5d8b9;padding:10px;font:11px/1.5 system-ui,sans-serif}',
      '.wpa-vs-passport-facts{margin:0;display:grid;grid-template-columns:44% 56%;gap:5px 7px;overflow-wrap:anywhere}',
      '.wpa-vs-passport-facts dt{font-weight:700}.wpa-vs-passport-facts dd{margin:0}',
      '.wpa-vs-boundary,.wpa-vs-human{margin:9px 0 0}',
      '.wpa-vs-human{font-weight:600}',
      '@media(max-width:390px){.wpa-vs-passport{width:100%}.wpa-vs-passport-facts{grid-template-columns:1fr}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function start() {
    addStyles();
    SETTINGS.forEach(mount);
    // The original widgets mount asynchronously; bounded retries avoid permanent polling.
    var attempt = 0;
    var retry = window.setInterval(function () {
      SETTINGS.forEach(mount);
      if (++attempt >= 8 || mounted >= 1) window.clearInterval(retry);
    }, 300);
  }

  window.WPAVirtualSandeWorkspace = Object.freeze({
    version:'p1-20261117', storage:'session-dom-only',
    features:Object.freeze(['answer-passport','copy-answer','browser-read-aloud','markdown-export'])
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();

/* WPA Phase 1 safe integrity patch — 2026-07-14 */
(function () {
  'use strict';

  var VERSION = '2026-07-14';
  var pathname = String(window.location.pathname || '').replace(/\/+$/, '') || '/';

  function isInstitute() { return pathname.toLowerCase() === '/institute.html' || document.documentElement.getAttribute('data-wpa-page') === 'institute'; }
  function isHome() { return pathname === '/' || pathname === '/index.html' || document.documentElement.getAttribute('data-wpa-page') === 'index'; }
  function isPapers() { return pathname.toLowerCase() === '/papers.html'; }

  function meta(selector, attrs) {
    var el = document.head.querySelector(selector);
    if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
    Object.keys(attrs).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    return el;
  }

  function headLink(id, rel, href, attrs) {
    var el = document.getElementById(id);
    if (!el) { el = document.createElement('link'); el.id = id; document.head.appendChild(el); }
    el.rel = rel;
    el.href = href;
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    return el;
  }

  function setText(selector, value, root) {
    var el = (root || document).querySelector(selector);
    if (el) el.textContent = value;
    return el;
  }

  function replaceText(root, pairs) {
    if (!root || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (item) {
      var value = item.nodeValue;
      pairs.forEach(function (pair) { if (value.indexOf(pair[0]) !== -1) value = value.split(pair[0]).join(pair[1]); });
      if (value !== item.nodeValue) item.nodeValue = value;
    });
  }

  function languages(mkUrl, enUrl, defaultUrl) {
    if (mkUrl) headLink('wpa-hreflang-mk', 'alternate', mkUrl, { hreflang: 'mk' });
    if (enUrl) headLink('wpa-hreflang-en', 'alternate', enUrl, { hreflang: 'en' });
    headLink('wpa-hreflang-default', 'alternate', defaultUrl || mkUrl || enUrl, { hreflang: 'x-default' });
  }

  function addPatchStyles() {
    if (document.getElementById('wpa-phase1-integrity-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-phase1-integrity-style';
    style.textContent = '.wpa-phase1-status{display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:7px 11px;border:1px solid rgba(154,119,40,.34);border-radius:999px;background:rgba(154,119,40,.08);font-size:12px;font-weight:700;color:#5a4220}.wpa-phase1-pending{display:inline-block;padding:8px 12px;border:1px dashed rgba(154,119,40,.55);border-radius:10px;color:#7b5f1f;font-size:13px;font-weight:700;background:rgba(154,119,40,.06)}';
    document.head.appendChild(style);
  }

  function patchInstitute() {
    var url = 'https://worldprotocolacademy-code.github.io/institute.html';
    var descriptionEl = document.head.querySelector('meta[name="description"]');
    var description = descriptionEl ? descriptionEl.getAttribute('content') : 'World Protocol Academy Institute for protocol, diplomacy, public communication and security studies.';

    meta('meta[property="og:title"]', { property: 'og:title', content: document.title });
    meta('meta[property="og:description"]', { property: 'og:description', content: description });
    meta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    meta('meta[property="og:url"]', { property: 'og:url', content: url });
    meta('meta[property="og:image"]', { property: 'og:image', content: 'https://worldprotocolacademy-code.github.io/logo.png' });
    meta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    meta('meta[name="twitter:title"]', { name: 'twitter:title', content: document.title });
    meta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    meta('meta[name="twitter:image"]', { name: 'twitter:image', content: 'https://worldprotocolacademy-code.github.io/logo.png' });
    headLink('wpa-institute-favicon', 'icon', '/logo.png', { type: 'image/png' });
    headLink('wpa-institute-manifest', 'manifest', '/manifest.json');
    languages(url, '', url);

    var select = document.getElementById('instLangSelect');
    if (select && select.getAttribute('data-wpa-phase1-pruned') !== 'true') {
      Array.prototype.slice.call(select.options).forEach(function (option, index) {
        if (index === 0) { option.textContent = 'MK / EN'; return; }
        var value = String(option.value || '');
        if (value !== 'https://worldprotocolacademy-code.github.io/' && value !== 'https://worldprotocolacademy-code.github.io/en/') option.remove();
      });
      select.setAttribute('data-wpa-phase1-pruned', 'true');
    }
    setText('#instLangNote', 'Македонскиот и англискиот се канонски референтни јазици. Поширокиот јазичен центар останува развојна Фаза 2. · Macedonian and English are the canonical reference languages. The wider language hub remains a Phase 2 development layer.');

    setText('[data-i18n="institute.tools_hub.dois.title"]', 'WPA Working Papers 001–012');
    setText('[data-i18n="institute.tools_hub.dois.text"]', 'WPA работните трудови 001–012 се објавени како јавни Zenodo записи. Одделната WPA Protocol Notes Series содржи два објавени записи, а WPA-PN-003 е во авторска подготовка.');
    setText('[data-i18n="institute.publications.working_papers.text"]', 'Сите дванаесет WPA Working Papers се објавени како јавни Zenodo записи: WP-001 до WP-012. WPA Protocol Notes Series содржи два објавени записи; WPA-PN-003 е во авторска подготовка и не се брои како објавена до финален Zenodo депозит.');
    setText('[data-i18n="institute.tools_hub.ai.text"]', 'Напредни мултимодални, reasoning и long-form drafting AI модели, аудио, видео, потекло на содржини, AI транспарентност и патоказ за човечка ревизија.');
    setText('[data-i18n="institute.ai.c1.title"]', 'Advanced Video & Multimodal Workflow');
    setText('[data-i18n="institute.ai.c2.title"]', 'Advanced Research & Long-form Drafting Workflow');
    setText('[data-i18n="institute.charter.p6.title"]', 'Доктрина на креаторот на платформата');
    setText('[data-i18n="institute.opc.meta.date_value"]', 'Се потврдува · To be confirmed');
    setText('[data-i18n="institute.opc.meta.venue_value"]', 'Се потврдува · To be confirmed');
    setText('[data-i18n="institute.opc.meta.location_value"]', 'Охрид, Северна Македонија — предложена локација');
    setText('[data-i18n="institute.opc.meta.status_value"]', 'Концепт во развој · отворен интерес');

    replaceText(document.body, [
      ['WPA Working Papers 001–009', 'WPA Working Papers 001–012'],
      ['Сите девет WPA Working Papers', 'Сите дванаесет WPA Working Papers'],
      ['Gemini, Claude/Opus', 'напредни мултимодални и reasoning AI модели'],
      ['Gemini Omni / Video Workflow', 'Advanced Video & Multimodal Workflow'],
      ['Claude / Opus Research Workflow', 'Advanced Research & Long-form Drafting Workflow'],
      ['Доктрина на креатор на платформатаот', 'Доктрина на креаторот на платформата'],
      ['Последно ажурирање: 10 јуни 2026 · Last updated: 10 June 2026', 'Последно ажурирање: 14 јули 2026 · Last updated: 14 July 2026']
    ]);
  }

  function patchHome() {
    languages('https://worldprotocolacademy-code.github.io/', 'https://worldprotocolacademy-code.github.io/en/', 'https://worldprotocolacademy-code.github.io/');
    replaceText(document.body, [
      ['Assoc. Prof. Dr. Sande Smiljanov', 'Dr Sande Smiljanov'],
      ['Assoc. Prof. Sande Smiljanov', 'Dr Sande Smiljanov']
    ]);
    Array.prototype.slice.call(document.querySelectorAll('header .site-nav ul > a')).forEach(function (anchor) {
      var item = document.createElement('li');
      anchor.parentNode.insertBefore(item, anchor);
      item.appendChild(anchor);
    });
  }

  function removeDeveloperNote() {
    Array.prototype.slice.call(document.querySelectorAll('h4')).forEach(function (heading) {
      if (heading.textContent.trim() === 'Important implementation note') {
        var section = heading.closest('section');
        if (section) section.remove();
      }
    });
  }

  function addWp012() {
    if (document.getElementById('wpaWp012RuntimeCard')) return;
    var grid = document.querySelector('#wpa-working-papers .grid-3');
    if (!grid) return;
    var card = document.createElement('article');
    card.className = 'card';
    card.id = 'wpaWp012RuntimeCard';
    card.innerHTML = '<span class="small-kicker">WP-012 · Summit Protocol Case Study</span><h4 class="paper-title">Ankara 2026 — The Sealed Stage: Protocol, Documentary Sovereignty and Visibility Gatekeeping at the 36th NATO Summit</h4><p class="paper-summary">Protocolometric and diplomatic-communication analysis of the Ankara summit, with Evidence Ladder+, PSPI+, Protocol Impact Assessment and source-control safeguards. Publicly deposited on Zenodo on 10 July 2026.</p><div class="paper-tags"><span class="tag">Ankara 2026</span><span class="tag">Documentary Sovereignty</span><span class="tag">Protocolometry</span></div><div class="paper-actions"><span class="wpa-phase1-pending">Zenodo DOI link: metadata sync pending on WPA index</span></div>';
    grid.appendChild(card);
  }

  function addPn003Status() {
    if (document.getElementById('wpaPn003RuntimeStatus')) return;
    var target = Array.prototype.slice.call(document.querySelectorAll('section')).filter(function (section) { return /WPA Protocol Notes/i.test(section.textContent || ''); })[0];
    if (!target) return;
    var parent = target.querySelector('.section-header') || target.querySelector('.container');
    if (!parent) return;
    var status = document.createElement('div');
    status.id = 'wpaPn003RuntimeStatus';
    status.className = 'wpa-phase1-status';
    status.textContent = 'WPA-PN-003 · целосен работен нацрт v0.2 · во авторска ревизија · не е сè уште објавен Zenodo запис';
    parent.appendChild(status);
  }

  function patchPapers() {
    languages('', 'https://worldprotocolacademy-code.github.io/papers.html', 'https://worldprotocolacademy-code.github.io/papers.html');
    meta('meta[name="author"]', { name: 'author', content: 'Dr Sande Smiljanov' });
    meta('meta[name="description"]', { name: 'description', content: 'Explore scientific papers by Dr Sande Smiljanov, 12 WPA Working Papers and 2 published WPA Protocol Notes with Zenodo records. WPA-PN-003 is in authorial preparation.' });
    replaceText(document.body, [
      ['Assoc. Prof. Sande Smiljanov', 'Dr Sande Smiljanov'],
      ['11 WPA Working Papers', '12 WPA Working Papers'],
      ['Eleven WPA Working Papers', 'Twelve WPA Working Papers'],
      ['eleven working papers', 'twelve working papers'],
      ['2 Protocol Notes • Open PDF access', '2 published Protocol Notes • WPA-PN-003 in preparation']
    ]);
    removeDeveloperNote();
    addWp012();
    addPn003Status();

    Array.prototype.slice.call(document.querySelectorAll('script[type="application/ld+json"]')).forEach(function (script) {
      try {
        var data = JSON.parse(script.textContent);
        if (data && data['@type'] === 'CollectionPage') {
          data.description = 'Scientific papers, 12 WPA Working Papers and 2 published WPA Protocol Notes by Dr Sande Smiljanov. WPA-PN-003 is in authorial preparation.';
          if (data.author && typeof data.author === 'object') data.author.name = 'Sande Smiljanov';
          script.textContent = JSON.stringify(data, null, 2);
        }
      } catch (error) { /* Preserve unrelated JSON-LD unchanged. */ }
    });
  }

  function run() {
    if (!document.body) return;
    addPatchStyles();
    if (isInstitute()) patchInstitute();
    if (isHome()) patchHome();
    if (isPapers()) patchPapers();
    document.documentElement.setAttribute('data-wpa-phase1-integrity', VERSION);
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  window.setTimeout(run, 300);
  window.setTimeout(run, 1200);
})();

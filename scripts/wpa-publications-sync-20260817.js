/* WPA publication sync - 2026-08-17 */
(function () {
  'use strict';
  if (window.WPA_PUBLICATIONS_SYNC_20260817) return;
  window.WPA_PUBLICATIONS_SYNC_20260817 = true;

  var BOOK = {
    id: 'pub-26',
    mk: 'Протокол на државни симболи, химни и национални денови: 95 календарски записи: 197 држави и протоколарни ентитети: знамиња, химни, национални денови и оперативен протокол',
    en: 'Protocol of State Symbols, Anthems and National Days: 95 Calendar Entries: 197 States and Protocol Entities: Flags, Anthems, National Days and Operational Protocol',
    isbn: '978-608-66168-5-4',
    cobiss: '69316613',
    pages: '74',
    cobissUrl: 'https://plus.cobiss.net/cobiss/mk/mk/data/cobib/69316613',
    scholarUrl: '/scholar/book-protocol-state-symbols-2026.html'
  };

  var PN = {
    id: 'pn-009', code: 'WPA-PN-009', version: 'v1.0 FINAL DOI-LOCKED', date: '14 August 2026',
    mk: 'Транспарентност на ВИ и протокол на авторството: Водени жигови, доказно потекло, човечка одговорност и Актот на ЕУ за вештачка интелигенција по 2 август 2026',
    en: 'AI Transparency and the Protocol of Authorship: Watermarking, Provenance, Human Responsibility and the EU AI Act after 2 August 2026',
    doi: '10.5281/zenodo.21933739', conceptDoi: '10.5281/zenodo.21933738',
    doiUrl: 'https://doi.org/10.5281/zenodo.21933739',
    recordUrl: '/protocol-notes/wpa-pn-009.html',
    scholarUrl: '/scholar/wpa-pn-009.html',
    desc: 'A bilingual WPA Protocol Note separating the legal baseline, technical evidence and WPA normative proposal for AI transparency, authorship, provenance and human responsibility. It introduces HARP-6, the Provenance Assurance Ladder (PAL), provenance of meaning, a Low-Resource Language Safeguard, a Post-Publication Recovery Protocol, a Correction Provenance Record (CPR) and a Simulation-to-Consent Boundary.'
  };

  function path() { return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/'; }
  function qsa(sel, root) { try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; } }
  function text(node) { return String(node && node.textContent || '').replace(/\s+/g, ' ').trim(); }
  function setText(node, value) { if (node && text(node) !== String(value)) node.textContent = value; }
  function setHTML(node, value) { if (node && node.innerHTML !== value) node.innerHTML = value; }
  function insertAfter(ref, node) { if (ref && ref.parentNode) ref.parentNode.insertBefore(node, ref.nextSibling); }
  function findText(sel, rx) { return qsa(sel).filter(function (n) { return rx.test(text(n)); })[0] || null; }
  function findEntry(rx) { return qsa('.bib-entry').filter(function (n) { return rx.test(text(n) + ' ' + String(n.getAttribute('data-doi') || '')); })[0] || null; }

  function replaceTextNodes(pairs) {
    if (!document.body || !document.createTreeWalker || typeof NodeFilter === 'undefined') return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var next = node.nodeValue;
      pairs.forEach(function (pair) { next = next.replace(pair[0], pair[1]); });
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function ensureStyle() {
    if (document.getElementById('wpa-publications-sync-20260817-style')) return;
    var s = document.createElement('style');
    s.id = 'wpa-publications-sync-20260817-style';
    s.textContent = '.wpa-new-20260817{outline:1px solid rgba(201,168,76,.22)}.wpa-new-badge{display:inline-flex;padding:4px 9px;border-radius:999px;background:#f6eed7;color:#765a18;font-size:11px;font-weight:800;margin-bottom:10px}.wpa-2026-book-section{padding:58px 0;background:#fffdf8;border-top:1px solid rgba(154,119,40,.16);border-bottom:1px solid rgba(154,119,40,.16)}.wpa-2026-book-section .wpa-book-card{max-width:1000px;margin:0 auto;background:#fff;border:1px solid #ddd3c3;border-left:5px solid #9a7728;border-radius:18px;padding:26px;box-shadow:0 10px 30px rgba(20,31,52,.08)}.wpa-2026-book-section h3{margin:0 0 8px;color:#162947;font-size:clamp(25px,3vw,38px);line-height:1.15}.wpa-2026-book-section p{color:#5a6577}.wpa-2026-book-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}';
    document.head.appendChild(s);
  }

  function updateCounts() {
    replaceTextNodes([
      [/25 Academic Publications/g, '26 Academic Publications'],
      [/25 академски публикации/g, '26 академски публикации'],
      [/25-publication academic corpus/g, '26-publication academic corpus'],
      [/25 публикации вкупно/g, '26 публикации вкупно'],
      [/5 монографии и прирачници/g, '6 монографии и прирачници'],
      [/5 Monographs and Handbooks/g, '6 Monographs and Handbooks'],
      [/5 Monographs & Handbooks/g, '6 Monographs & Handbooks'],
      [/8 ZENODO DOI RECORDS/g, '9 ZENODO DOI RECORDS'],
      [/8 WPA Protocol Notes/g, '9 WPA Protocol Notes'],
      [/eight WPA Protocol Notes/gi, 'nine WPA Protocol Notes'],
      [/13 Working Papers \+ 8 Protocol Notes/g, '13 Working Papers + 9 Protocol Notes'],
      [/13 Working Papers and 8 Protocol Notes/g, '13 Working Papers and 9 Protocol Notes'],
      [/thirteen Working Papers and eight Protocol Notes/gi, 'thirteen Working Papers and nine Protocol Notes'],
      [/21 WPA Series DOI Records/g, '22 WPA Series DOI Records'],
      [/21 WPA series DOI records/g, '22 WPA series DOI records'],
      [/twenty-one public DOI records/gi, 'twenty-two public DOI records'],
      [/22 Total WPA Zenodo Records/g, '23 Total WPA Zenodo Records'],
      [/twenty-two total WPA Zenodo records/gi, 'twenty-three total WPA Zenodo records'],
      [/All twenty-two records/gi, 'All twenty-three records'],
      [/WPA Protocol Notes 001[–-]008/g, 'WPA Protocol Notes 001–009'],
      [/Protocol Notes 001[–-]008/g, 'Protocol Notes 001–009'],
      [/PN-001[–-]PN-008/g, 'PN-001–PN-009'],
      [/PN-001[–-]008/g, 'PN-001–009'],
      [/Последно ажурирано: 3 август 2026/g, 'Последно ажурирано: 17 август 2026'],
      [/Last updated: 3 August 2026/g, 'Last updated: 17 August 2026']
    ]);
  }

  function makeHomePn() {
    var node = document.createElement('article');
    node.className = 'wpa-latest-pn wpa-new-20260817';
    node.id = 'wpa-pn009';
    node.innerHTML = '<div class="wpa-latest-pn-grid"><div><div class="wpa-latest-pn-kicker">Најнова Zenodo публикација · Latest Zenodo publication · ' + PN.code + '</div><h4>' + PN.mk + '</h4><div class="wpa-latest-pn-en"><em>' + PN.en + '</em></div><p>' + PN.desc + '</p><div class="wpa-latest-pn-meta"><span>Version ' + PN.version + '</span><span>' + PN.date + '</span><span>DOI ' + PN.doi + '</span><span>CC BY-NC-ND 4.0</span></div></div><div class="wpa-latest-pn-actions"><a class="btn btn-gold" href="' + PN.doiUrl + '" target="_blank" rel="noopener">Отвори на Zenodo →</a><a class="btn btn-ghost" href="/bibliography/#' + PN.id + '">Библиографски запис →</a></div></div>';
    return node;
  }

  function makeBookSection() {
    var section = document.createElement('section');
    section.id = 'wpa-book-state-symbols-2026';
    section.className = 'wpa-2026-book-section wpa-new-20260817';
    section.innerHTML = '<div class="container"><article class="wpa-book-card"><div class="wpa-new-badge">НОВА КНИГА · NEW BOOK · 2026</div><h3>' + BOOK.mk + '</h3><p><em>' + BOOK.en + '</em></p><p><strong>ISBN:</strong> ' + BOOK.isbn + ' · <strong>COBISS.MK-ID:</strong> ' + BOOK.cobiss + ' · ' + BOOK.pages + ' стр. · Македонски / English</p><div class="wpa-2026-book-actions"><a class="btn btn-primary" href="' + BOOK.cobissUrl + '" target="_blank" rel="noopener">COBISS запис →</a><a class="btn btn-secondary" href="' + BOOK.scholarUrl + '">Scholar record →</a><a class="btn btn-secondary" href="/bibliography/#' + BOOK.id + '">Библиографија →</a></div></article></div>';
    return section;
  }

  function updateHome() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/' || p === '/index.html' || page === 'index')) return;

    qsa('.wpa-latest-pn-kicker').forEach(function (k) {
      if (!/WPA-PN-009/i.test(text(k)) && /Најнова Zenodo публикација|Latest Zenodo publication/i.test(text(k))) {
        k.textContent = text(k).replace('Најнова Zenodo публикација · Latest Zenodo publication', 'Нова Zenodo публикација · New Zenodo publication');
      }
    });

    if (!document.getElementById('wpa-pn009')) {
      var pn008 = document.getElementById('wpa-pn008') || findText('.wpa-latest-pn', /WPA-PN-008|21779849/);
      var first = document.querySelector('.wpa-latest-pn');
      if (pn008 && pn008.parentNode) pn008.parentNode.insertBefore(makeHomePn(), pn008);
      else if (first && first.parentNode) first.parentNode.insertBefore(makeHomePn(), first);
    }

    if (!document.getElementById('wpa-book-state-symbols-2026')) {
      var bib = findText('h2,h3,h4,span', /Официјална библиографија|World Protocol Academy Bibliography/i);
      var target = bib && bib.closest('section');
      if (target && target.parentNode) target.parentNode.insertBefore(makeBookSection(), target);
    }

    qsa('a').forEach(function (a) {
      var t = text(a);
      if (/Разгледајте ја библиографијата|Browse.*bibliography/i.test(t)) a.href = '/bibliography/';
      if (/Отворете ги трудовите|Open.*papers/i.test(t)) a.href = '/papers.html';
    });
  }

  function updateInstitute() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/institute.html' || page === 'institute')) return;
    var card = document.getElementById('wpa-protocol-notes');
    if (!card) return;
    setText(card.querySelector('.pub-meta'), 'СЕРИЈА · 02 · 9 ZENODO DOI RECORDS');
    setText(card.querySelector('h3'), 'WPA Protocol Notes 001–009');
    setHTML(card.querySelector('p'), 'Посебна серија на кратки, применети и теориско-развојни протоколометриски записи. Најновиот запис е <strong>WPA-PN-009: AI Transparency and the Protocol of Authorship</strong>, по WPA-PN-007 и WPA-PN-008 во линијата за ВИ, доказно потекло и човечка одговорност.');
    setText(card.querySelector('.pub-frequency'), 'Published · PN-001–PN-009 · 2026');
    var link = card.querySelector('a[href*="doi.org"],a[href*="zenodo"]');
    if (link) { link.href = PN.doiUrl; setText(link, 'Отвори WPA-PN-009 на Zenodo →'); }
  }

  function makeSimplePnCard() {
    var c = document.createElement('article');
    c.className = 'card wpa-new-20260817';
    c.id = 'wpaPn009PapersCard';
    c.innerHTML = '<span class="small-kicker">' + PN.code + ' · WPA Protocol Note</span><h4 class="paper-title">' + PN.en + '</h4><p class="paper-summary">' + PN.desc + '</p><div class="paper-tags"><span class="tag">Protocol Note</span><span class="tag">HARP-6</span><span class="tag">AI Provenance</span><span class="tag">2026</span></div><div class="paper-actions"><a class="btn btn-secondary" href="' + PN.doiUrl + '" target="_blank" rel="noopener">→ Zenodo DOI</a><a class="btn btn-secondary" href="' + PN.scholarUrl + '">Scholar record</a></div>';
    return c;
  }

  function updatePapers() {
    if (path() !== '/papers.html') return;
    var notes = document.getElementById('wpa-protocol-notes');
    if (notes) {
      setText(notes.querySelector('.section-header h3'), 'Nine applied and theoretical protocolometry records — open access via Zenodo.');
      setHTML(notes.querySelector('.section-header p'), '<strong>Publication status:</strong> PN-001–PN-009 are published Zenodo DOI records. The WPA series corpus contains 22 public DOI records: 13 Working Papers and 9 Protocol Notes.');
      var grid = notes.querySelector('.grid-3,.grid');
      if (grid && !document.getElementById('wpaPn009PapersCard')) grid.appendChild(makeSimplePnCard());
      if (!document.getElementById('wpa-book-state-symbols-2026')) notes.parentNode.insertBefore(makeBookSection(), notes);
    }
    qsa('.stat-card').forEach(function (card) {
      var span = card.querySelector('span'); var strong = card.querySelector('strong'); var t = text(span);
      if (/Total publications/i.test(t)) setText(strong, '26');
      if (/WPA Protocol Notes/i.test(t)) setText(strong, '9');
    });
  }

  function makeResearchPnCard() {
    var c = document.createElement('article');
    c.className = 'paper-card latest-record wpa-new-20260817';
    c.id = 'pn009';
    c.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + PN.code + '</div><div class="paper-title-mk">' + PN.mk + '</div><div class="paper-title-en">' + PN.en + '</div></div><span class="paper-type">WPA Protocol Note</span></div><div class="paper-meta">' + PN.version + ' · Bilingual MK / EN · Published ' + PN.date + '</div><p class="paper-desc">' + PN.desc + '</p><div class="doi-row"><a class="doi" href="' + PN.doiUrl + '" target="_blank" rel="noopener">' + PN.doi + '</a><a class="btn btn-ghost" href="' + PN.scholarUrl + '">Scholar record</a></div>';
    return c;
  }

  function updateWorkingIndex() {
    var p = path();
    if (!(p === '/working-papers' || p === '/working-papers/index.html')) return;
    setText(document.querySelector('.hero .subtitle'), 'Working Papers 001–013 · Protocol Notes 001–009');
    setText(document.querySelector('.section-title span'), '13 Working Papers + 9 Protocol Notes + 1 Strategic Plan = 23 records');
    var intro = document.querySelector('.intro-box');
    if (intro && intro.querySelector('p')) setHTML(intro.querySelector('p'), '<strong>Published Zenodo Records:</strong> The WPA corpus contains twenty-two public DOI records in its two publication series — thirteen Working Papers and nine Protocol Notes — plus one Global Strategic Plan report, for twenty-three total WPA Zenodo records. The Working Papers and Protocol Notes are author-approved public releases and are not presented as formal peer-reviewed journal articles.');
    var grid = document.getElementById('papersGrid');
    if (grid) {
      qsa('.paper-card.latest-record', grid).forEach(function (c) { c.classList.remove('latest-record'); });
      var dividers = qsa('.series-divider', grid); var d = dividers.filter(function (x) { return /Protocol Notes/i.test(text(x)); })[0];
      if (d && d.firstChild) d.firstChild.nodeValue = 'WPA Protocol Notes 001–009';
      if (!document.getElementById('pn009')) {
        var pn008 = document.getElementById('pn008');
        if (pn008) insertAfter(pn008, makeResearchPnCard()); else grid.appendChild(makeResearchPnCard());
      }
    }
    setText(document.querySelector('.author-responsibility p'), 'All twenty-three records — thirteen Working Papers, nine Protocol Notes and one Global Strategic Plan report — are issued under the authorship and final editorial responsibility of Sande Smiljanov. The Working Papers and Protocol Notes are author-approved public releases and are not presented as formal peer-reviewed journal articles.');
  }

  function makeBookBibCard() {
    var c = document.createElement('div');
    c.className = 'bib-entry wpa-new-20260817'; c.id = BOOK.id;
    c.setAttribute('data-doi', ''); c.setAttribute('data-index', 'isbn cobiss'); c.setAttribute('data-type', 'monograph'); c.setAttribute('data-year', '2026'); c.setAttribute('data-title', BOOK.mk);
    c.setAttribute('data-search', (BOOK.mk + ' ' + BOOK.en + ' ' + BOOK.isbn + ' ' + BOOK.cobiss + ' state symbols flags anthems national days cobiss isbn').toLowerCase());
    c.innerHTML = '<div class="bib-num">26 · New Book</div><div class="wpa-new-badge">2026 · ISBN / COBISS</div><div class="bib-mk">' + BOOK.mk + '</div><div class="bib-en">' + BOOK.en + ' · source-verified core + clearly labelled reference layer</div><div class="bib-meta"><strong>2026</strong> · Печатена книга / Printed book · Македонски и англиски / Macedonian and English · Пелинце: С. Смиљанов · ' + BOOK.pages + ' стр.<br><strong>ISBN</strong> ' + BOOK.isbn + ' · <strong>COBISS.MK-ID</strong> ' + BOOK.cobiss + '</div><div class="bib-tags"><span class="bib-tag">Книга / Book</span><span class="bib-tag green">ISBN</span><span class="bib-tag blue">COBISS</span></div><div class="bib-links"><a class="bib-link-btn" href="' + BOOK.cobissUrl + '" target="_blank" rel="noopener">COBISS record →</a><a class="bib-link-btn" href="' + BOOK.scholarUrl + '">Scholar record →</a></div>';
    return c;
  }

  function makePnBibCard() {
    var c = document.createElement('div');
    c.className = 'bib-entry wpa-new-20260817'; c.id = PN.id;
    c.setAttribute('data-doi', PN.doi); c.setAttribute('data-index', 'doi zenodo'); c.setAttribute('data-type', 'protocol-note'); c.setAttribute('data-year', '2026'); c.setAttribute('data-title', PN.mk);
    c.setAttribute('data-search', (PN.code + ' ' + PN.mk + ' ' + PN.en + ' ' + PN.doi + ' HARP-6 provenance watermarking authorship EU AI Act').toLowerCase());
    c.innerHTML = '<div class="bib-num">' + PN.code + '</div><div class="wpa-new-badge">14 AUG 2026 · DOI-LOCKED</div><div class="bib-mk">' + PN.mk + '</div><div class="bib-en">' + PN.en + '</div><div class="bib-meta"><strong>2026</strong> · WPA Protocol Note No. 009 · ' + PN.version + ' · Bilingual MK/EN · Author-approved public release<br><strong>DOI</strong> <a class="bib-link" href="' + PN.doiUrl + '" target="_blank" rel="noopener">' + PN.doi + '</a> · <strong>Concept DOI</strong> <a class="bib-link" href="https://doi.org/' + PN.conceptDoi + '" target="_blank" rel="noopener">' + PN.conceptDoi + '</a></div><div class="bib-meta" style="margin-top:8px"><strong>Citation:</strong> Smiljanov, S. (2026). <em>' + PN.en + '</em> (' + PN.version + '). Zenodo. https://doi.org/' + PN.doi + '</div><div class="bib-tags"><span class="bib-tag">Protocol Note</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag blue">HARP-6</span><span class="bib-tag purple">AI Governance</span><span class="bib-tag">Provenance</span></div><div class="bib-links"><a class="bib-link-btn" href="' + PN.recordUrl + '">Protocol Note page →</a><a class="bib-link-btn" href="' + PN.scholarUrl + '">Scholar record →</a><a class="bib-link-btn" href="' + PN.doiUrl + '" target="_blank" rel="noopener">Zenodo record →</a></div>';
    return c;
  }

  function syncBibFilter() {
    var search = document.getElementById('bibSearch'), type = document.getElementById('bibType'), year = document.getElementById('bibYear'), idx = document.getElementById('bibIndex');
    [BOOK.id, PN.id].forEach(function (id) {
      var r = document.getElementById(id); if (!r) return;
      var q = String(search && search.value || '').toLowerCase().trim();
      var okQ = !q || String(r.getAttribute('data-search') || '').indexOf(q) !== -1;
      var okT = !type || type.value === 'all' || r.getAttribute('data-type') === type.value;
      var okY = !year || year.value === 'all' || r.getAttribute('data-year') === year.value;
      var okI = !idx || idx.value === 'all' || String(r.getAttribute('data-index') || '').split(' ').indexOf(idx.value) !== -1;
      r.hidden = !(okQ && okT && okY && okI);
    });
    var count = document.getElementById('bibResultCount');
    if (count) {
      var all = qsa('.bib-entry[data-search]').filter(function (r) { return r.id !== 'record'; });
      var visible = all.filter(function (r) { return !r.hidden; }).length;
      setText(count, 'Прикажани ' + visible + ' од ' + all.length + ' записи · Showing ' + visible + ' of ' + all.length + ' records');
    }
  }

  function updateBibliography() {
    var p = path();
    if (!(p === '/bibliography' || p === '/bibliography/index.html')) return;
    if (!document.getElementById(BOOK.id)) {
      var dissertation = document.getElementById('dissertation');
      if (dissertation && dissertation.parentNode) dissertation.parentNode.insertBefore(makeBookBibCard(), dissertation);
    }
    if (!document.getElementById(PN.id)) {
      var pn008 = document.getElementById('pn-008') || findEntry(/WPA-PN-008|21779849|Multi-Agent Diplomacy/i);
      var strategic = findEntry(/Global Strategic Plan 2026|21675100|21396831/i);
      var card = makePnBibCard();
      if (pn008) insertAfter(pn008, card); else if (strategic && strategic.parentNode) strategic.parentNode.insertBefore(card, strategic);
    }
    qsa('.counter').forEach(function (box) {
      var label = text(box.querySelector('.counter-label')), num = box.querySelector('.counter-num');
      if (/Total Publications|Вкупно публикации/i.test(label)) setText(num, '26');
      if (/Monographs|Монографии/i.test(label)) setText(num, '6');
    });
    qsa('.bib-note').forEach(function (note) {
      if (text(note).indexOf('WPA Research Metrics') === -1) return;
      setHTML(note, '<strong>WPA Research Metrics · WPA Истражувачки показатели</strong><br><br>• 26 Academic Publications / Академски публикации<br>• 13 WPA Working Papers (Zenodo DOI)<br>• 9 WPA Protocol Notes (Zenodo DOI)<br>• 22 WPA Series DOI Records<br>• 1 Global Strategic Plan report — Version 1.1 (Zenodo DOI)<br>• 23 Total WPA Zenodo Records<br>• 6 Monographs and Handbooks<br>• 1 Doctoral Dissertation<br>• Research Areas: Protocol Studies · Protocolometry · Diplomatic Protocol · Ceremonial Diplomacy · Visual Statecraft · Security Studies · Digital Protocol · AI Governance · Cognitive Sovereignty · Agentic AI · Multi-Agent Governance · Authorship · Provenance');
    });
    setText(document.querySelector('.zenodo-hero-badge strong'), '◆ 23 WPA Zenodo Records · 13 Working Papers + 9 Protocol Notes + 1 Strategic Plan');
    var digital = findText('div,span', /^Digital Era \(2023\) · IMCSM26 \(2026\)/i);
    if (digital) setText(digital, 'Digital Era (2023) · IMCSM26 (2026) · PN-005 · PN-006 · PN-007 · PN-008 · PN-009');
    if (!document.documentElement.dataset.wpaPubSyncBibBound) {
      document.documentElement.dataset.wpaPubSyncBibBound = '1';
      ['bibSearch','bibType','bibYear','bibIndex'].forEach(function (id) { var el = document.getElementById(id); if (el) el.addEventListener('input', function () { window.setTimeout(syncBibFilter, 0); }); });
    }
    syncBibFilter();
  }

  function apply() {
    if (!document.body) return;
    ensureStyle(); updateCounts(); updateHome(); updateInstitute(); updatePapers(); updateWorkingIndex(); updateBibliography();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true }); else apply();
  window.setTimeout(apply, 700);
  window.setTimeout(apply, 1900);
})();
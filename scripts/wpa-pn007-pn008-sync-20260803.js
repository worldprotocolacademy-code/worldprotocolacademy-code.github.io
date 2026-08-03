/* WPA PN-007 / PN-008 corpus sync - 2026-08-03 */
(function () {
  'use strict';
  if (window.WPA_PN007_PN008_SYNC_20260803) return;
  window.WPA_PN007_PN008_SYNC_20260803 = true;

  var RECORDS = {
    pn007: {
      key: 'pn007', code: 'WPA-PN-007', short: 'WPA-PN-007', kind: 'protocol-note',
      mk: 'Течен протокол и ВИ-агенти: Од статичен код до динамична дипломатија',
      en: 'Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy',
      version: 'v1.9.2', date: '3 August 2026', pages: '27', doi: '10.5281/zenodo.21772500',
      desc: 'A bilingual Protocol Note on protocolometric governance of adaptive software, agentic action and institutional accountability, including action classes, human oversight and the WPA Right to Pause.'
    },
    pn008: {
      key: 'pn008', code: 'WPA-PN-008', short: 'WPA-PN-008', kind: 'protocol-note',
      mk: 'Мултиагентска дипломатија: Мандат, доказно потекло и институционална волја во мрежи од ВИ-агенти',
      en: 'Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will in Networks of AI Agents',
      version: 'v1.0', date: '3 August 2026', pages: '45', doi: '10.5281/zenodo.21779849', conceptDoi: '10.5281/zenodo.21779848',
      desc: 'A bilingual Protocol Note extending liquid protocol into multi-agent chains through mandate non-amplification, provenance, admissibility gates, human approval validity and the WPA Network Right to Pause.'
    }
  };

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function setText(node, value) {
    if (node && text(node) !== String(value)) node.textContent = value;
  }

  function setHTML(node, value) {
    if (node && node.innerHTML !== value) node.innerHTML = value;
  }

  function doiUrl(record) {
    return 'https://doi.org/' + record.doi;
  }

  function insertAfter(reference, node) {
    if (reference && reference.parentNode) reference.parentNode.insertBefore(node, reference.nextSibling);
  }

  function replaceTextNodes(replacements) {
    if (!document.body || !document.createTreeWalker || typeof NodeFilter === 'undefined') return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var next = node.nodeValue;
      replacements.forEach(function (pair) { next = next.replace(pair[0], pair[1]); });
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function updateCountsAndIdentity() {
    replaceTextNodes([
      [/6 WPA Protocol Notes/g, '8 WPA Protocol Notes'],
      [/six WPA Protocol Notes/gi, 'eight WPA Protocol Notes'],
      [/19 WPA Series DOI Records/g, '21 WPA Series DOI Records'],
      [/19 WPA series DOI records/g, '21 WPA series DOI records'],
      [/20 Total WPA Zenodo Records/g, '22 Total WPA Zenodo Records'],
      [/20 total WPA Zenodo records/g, '22 total WPA Zenodo records'],
      [/13 Working Papers \+ 6 Protocol Notes/g, '13 Working Papers + 8 Protocol Notes'],
      [/13 Working Papers and 6 Protocol Notes/g, '13 Working Papers and 8 Protocol Notes'],
      [/thirteen Working Papers and six Protocol Notes/gi, 'thirteen Working Papers and eight Protocol Notes'],
      [/WPA Protocol Notes 001[–-]006/g, 'WPA Protocol Notes 001–008'],
      [/Protocol Notes 001[–-]006/g, 'Protocol Notes 001–008'],
      [/PN-001[–-]PN-006/g, 'PN-001–PN-008'],
      [/All twenty records/gi, 'All twenty-two records'],
      [/twenty total WPA Zenodo records/gi, 'twenty-two total WPA Zenodo records'],
      [/nineteen public DOI records/gi, 'twenty-one public DOI records'],
      [/Автор · Истражувач · Основач и директор на WPA/g, 'Автор · Истражувач · Креатор на платформата'],
      [/Author · Researcher · Founder and Director of WPA/g, 'Author · Researcher · Platform Creator'],
      [/Основач и директор на WPA/g, 'Креатор на платформата'],
      [/Founder and Director of WPA/g, 'Platform Creator'],
      [/Digital Era \(2023\) · IMCSM26 \(2026\)/g, 'Digital Era (2023) · IMCSM26 (2026) · PN-005 · PN-006 · PN-007 · PN-008'],
      [/WPA Protocol Notes се кратки, применети протоколометриски записи посветени на конкретни дипломатски настани\./g, 'WPA Protocol Notes се кратки, применети и теориско-развојни протоколометриски записи посветени на дипломатски настани, институционално управување, дигитален протокол и управување со вештачка интелигенција.'],
      [/Последно ажурирано: 29 јули 2026/g, 'Последно ажурирано: 3 август 2026'],
      [/Last updated: 29 July 2026/g, 'Last updated: 3 August 2026']
    ]);
  }

  function simpleCard(record, id) {
    var card = document.createElement('article');
    card.className = 'card';
    card.id = id;
    card.innerHTML = '<span class="small-kicker">' + record.code + ' · WPA Protocol Note</span>' +
      '<h4 class="paper-title">' + record.en + '</h4><p class="paper-summary">' + record.desc + '</p>' +
      '<div class="paper-tags"><span class="tag">Protocol Note</span><span class="tag">Zenodo DOI</span><span class="tag">2026</span></div>' +
      '<div class="paper-actions"><a class="btn btn-secondary" href="' + doiUrl(record) + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    return card;
  }

  function researchCard(record, id, latest) {
    var card = document.createElement('article');
    card.className = 'paper-card' + (latest ? ' latest-record' : '');
    card.id = id;
    card.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + record.code + '</div>' +
      '<div class="paper-title-mk">' + record.mk + '</div><div class="paper-title-en">' + record.en + '</div></div>' +
      '<span class="paper-type">WPA Protocol Note</span></div>' +
      '<div class="paper-meta">Version ' + record.version + ' · Bilingual MK / EN · Published ' + record.date + ' · ' + record.pages + ' pages</div>' +
      '<p class="paper-desc">' + record.desc + '</p><div class="doi-row"><a class="doi" href="' + doiUrl(record) + '" target="_blank" rel="noopener">' + record.doi + '</a>' +
      '<a class="btn btn-ghost" href="' + doiUrl(record) + '" target="_blank" rel="noopener">Files available on Zenodo</a></div>';
    return card;
  }

  function bibCard(record, id) {
    var card = document.createElement('div');
    card.className = 'bib-entry';
    card.id = id;
    card.setAttribute('data-doi', record.doi);
    card.setAttribute('data-index', 'doi zenodo protocol note artificial intelligence');
    card.setAttribute('data-search', (record.code + ' ' + record.mk + ' ' + record.en + ' ' + record.doi + ' zenodo').toLowerCase());
    card.setAttribute('data-title', record.mk);
    card.setAttribute('data-type', 'protocol-note');
    card.setAttribute('data-year', '2026');
    card.innerHTML = '<div class="bib-num">' + record.short + '</div><div class="bib-mk">' + record.mk + '</div><div class="bib-en">' + record.en + '</div>' +
      '<div class="bib-meta"><strong>2026</strong> · ' + record.code + ' · Version ' + record.version + ' · Bilingual MK/EN · ' + record.pages + ' pages<br>' +
      '<strong>DOI</strong> <a class="bib-link" href="' + doiUrl(record) + '" target="_blank" rel="noopener">' + record.doi + '</a>' +
      (record.conceptDoi ? '<br><strong>Concept DOI</strong> <a class="bib-link" href="https://doi.org/' + record.conceptDoi + '" target="_blank" rel="noopener">' + record.conceptDoi + '</a>' : '') + '</div>' +
      '<div class="bib-tags"><span class="bib-tag blue">Protocol Note</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag">AI Governance</span></div>' +
      '<div class="bib-links"><a class="bib-link-btn" href="' + doiUrl(record) + '" target="_blank" rel="noopener">Zenodo record →</a></div>';
    return card;
  }

  function findEntry(pattern) {
    return qsa('.bib-entry').filter(function (entry) {
      return pattern.test(text(entry) + ' ' + String(entry.getAttribute('data-doi') || ''));
    })[0];
  }

  function updateHome() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/' || p === '/index.html' || page === 'index')) return;
    var anchor = document.querySelector('.wpa-latest-pn, #wpa-pn-006');
    if (!anchor) return;
    var records = [RECORDS.pn008, RECORDS.pn007];
    records.forEach(function (record, index) {
      var id = 'wpa-' + record.key;
      var node = document.getElementById(id);
      if (!node) { node = document.createElement('article'); node.className = 'wpa-latest-pn'; node.id = id; insertAfter(anchor, node); }
      node.innerHTML = '<div class="wpa-latest-pn-grid"><div><div class="wpa-latest-pn-kicker">' + (index === 0 ? 'Најнова Zenodo публикација · Latest Zenodo publication' : 'Нова Zenodo публикација · New Zenodo publication') + ' · ' + record.code + '</div>' +
        '<h4>' + record.mk + '</h4><div class="wpa-latest-pn-en">' + record.en + '</div><p>' + record.desc + '</p>' +
        '<div class="wpa-latest-pn-meta"><span>Version ' + record.version + '</span><span>' + record.date + '</span><span>DOI ' + record.doi + '</span><span>CC BY-NC-ND 4.0</span></div></div>' +
        '<div class="wpa-latest-pn-actions"><a class="btn btn-gold" href="' + doiUrl(record) + '" target="_blank" rel="noopener">Отвори на Zenodo →</a><a class="btn btn-ghost" href="/bibliography/#pn-' + record.key.slice(-3) + '">Библиографски запис →</a></div></div>';
      anchor = node;
    });
  }

  function updateInstitute() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/institute.html' || page === 'institute')) return;
    var card = document.getElementById('wpa-protocol-notes');
    if (!card) return;
    setText(card.querySelector('.pub-meta'), 'СЕРИЈА · 02 · 8 ZENODO DOI RECORDS');
    setText(card.querySelector('h3'), 'WPA Protocol Notes 001–008');
    setHTML(card.querySelector('p'), 'Посебна серија на кратки, применети и теориско-развојни протоколометриски записи. Најновите записи се <strong>WPA-PN-007: Liquid Protocol and AI Agents</strong> и <strong>WPA-PN-008: Multi-Agent Diplomacy</strong>.');
    setText(card.querySelector('.pub-frequency'), 'Published · PN-001–PN-008 · 2026');
    var link = card.querySelector('a[href*="doi.org"],a[href*="zenodo"]');
    if (link) { link.href = doiUrl(RECORDS.pn008); setText(link, 'Отвори WPA-PN-008 на Zenodo →'); }
  }

  function updatePapers() {
    if (path() !== '/papers.html') return;
    var notes = document.getElementById('wpa-protocol-notes');
    if (!notes) return;
    setText(notes.querySelector('.section-header h3'), 'Eight applied and theoretical protocolometry records — open access via Zenodo.');
    setHTML(notes.querySelector('.section-header p'), '<strong>Publication status:</strong> PN-001–PN-008 are published Zenodo DOI records. The WPA series corpus contains 21 public DOI records: 13 Working Papers and 8 Protocol Notes.');
    var grid = notes.querySelector('.grid-3,.grid');
    if (grid && !document.getElementById('wpaPn007PapersCard')) grid.appendChild(simpleCard(RECORDS.pn007, 'wpaPn007PapersCard'));
    if (grid && !document.getElementById('wpaPn008PapersCard')) grid.appendChild(simpleCard(RECORDS.pn008, 'wpaPn008PapersCard'));
  }

  function updateWorkingIndex() {
    var p = path();
    if (!(p === '/working-papers' || p === '/working-papers/index.html')) return;
    setText(document.querySelector('.hero .subtitle'), 'Working Papers 001–013 · Protocol Notes 001–008');
    setText(document.querySelector('.section-title span'), '13 Working Papers + 8 Protocol Notes + 1 Strategic Plan = 22 records');
    var intro = document.querySelector('.intro-box');
    if (intro) setHTML(intro.querySelector('p'), '<strong>Published Zenodo Records:</strong> The WPA corpus contains twenty-one public DOI records in its two publication series — thirteen Working Papers and eight Protocol Notes — plus one Global Strategic Plan report, for twenty-two total WPA Zenodo records. The Working Papers and Protocol Notes are author-approved public releases and are not presented as formal peer-reviewed journal articles.');
    var grid = document.getElementById('papersGrid');
    if (grid) {
      var dividers = qsa('.series-divider', grid);
      var pnDivider = dividers.filter(function (d) { return /Protocol Notes/i.test(text(d)); })[0];
      if (pnDivider && pnDivider.firstChild) pnDivider.firstChild.nodeValue = 'WPA Protocol Notes 001–008';
      if (!document.getElementById('pn007')) grid.appendChild(researchCard(RECORDS.pn007, 'pn007', false));
      if (!document.getElementById('pn008')) grid.appendChild(researchCard(RECORDS.pn008, 'pn008', true));
    }
    setText(document.querySelector('.author-responsibility p'), 'All twenty-two records — thirteen Working Papers, eight Protocol Notes and one Global Strategic Plan report — are issued under the authorship and final editorial responsibility of Sande Smiljanov. The Working Papers and Protocol Notes are author-approved public releases and are not presented as formal peer-reviewed journal articles.');
  }

  function updateBibliography() {
    var p = path();
    if (!(p === '/bibliography' || p === '/bibliography/index.html')) return;
    var pn006 = findEntry(/WPA-PN-006|Neuroprotocol 2030|21669195/i);
    var pn007 = findEntry(/WPA-PN-007|Liquid Protocol and AI Agents|21772500/i);
    if (!pn007 && pn006) { pn007 = bibCard(RECORDS.pn007, 'pn-007'); insertAfter(pn006, pn007); }
    var pn008 = findEntry(/WPA-PN-008|Multi-Agent Diplomacy|21779849/i);
    if (!pn008 && pn007) { pn008 = bibCard(RECORDS.pn008, 'pn-008'); insertAfter(pn007, pn008); }
    qsa('.bib-note').forEach(function (note) {
      if (text(note).indexOf('WPA Research Metrics') === -1) return;
      setHTML(note, '<strong>WPA Research Metrics · WPA Истражувачки показатели</strong><br><br>' +
        '• 25 Academic Publications / Академски публикации<br>' +
        '• 13 WPA Working Papers (Zenodo DOI)<br>' +
        '• 8 WPA Protocol Notes (Zenodo DOI)<br>' +
        '• 21 WPA Series DOI Records<br>' +
        '• 1 Global Strategic Plan report — Version 1.1 (Zenodo DOI)<br>' +
        '• 22 Total WPA Zenodo Records<br>' +
        '• 5 Monographs and Handbooks<br>• 1 Doctoral Dissertation<br>' +
        '• Research Areas: Protocol Studies · Protocolometry · Diplomatic Protocol · Ceremonial Diplomacy · Visual Statecraft · Security Studies · Digital Protocol · AI Governance · Cognitive Sovereignty · Agentic AI · Multi-Agent Governance');
    });
    setText(document.querySelector('.zenodo-hero-badge strong'), '◆ 22 WPA Zenodo Records · 13 Working Papers + 8 Protocol Notes + 1 Strategic Plan');
    var resultCount = document.getElementById('bibResultCount') || document.getElementById('resultCount');
    if (resultCount) {
      var total = qsa('.bib-entry[data-search]').filter(function (entry) { return entry.id !== 'record'; }).length;
      setText(resultCount, 'Прикажани ' + total + ' од ' + total + ' записи · Showing ' + total + ' of ' + total + ' records');
    }
  }

  function apply() {
    if (!document.body) return;
    updateCountsAndIdentity();
    updateHome();
    updateInstitute();
    updatePapers();
    updateWorkingIndex();
    updateBibliography();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
  window.setTimeout(apply, 450);
  window.setTimeout(apply, 1600);
})();

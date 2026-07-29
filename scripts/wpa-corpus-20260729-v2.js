/* WPA canonical corpus sync — WP-013, PN-004–PN-006 and Strategic Plan v1.1 — 2026-07-29 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_20260729_V2_LOADED) return;
  window.WPA_CORPUS_20260729_V2_LOADED = true;

  var RECORDS = {
    wp013: {
      key: 'wp013', code: 'WPA-WP-2026-013', short: 'WP-013', kind: 'working-paper',
      mk: 'Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија',
      en: 'Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia',
      version: 'v14', date: '23 July 2026', pages: '29', doi: '10.5281/zenodo.21514266',
      desc: 'A source-disciplined protocolometric analysis of the first visit by a President of India to North Macedonia, covering ceremonial sequencing, commemorative diplomacy, institutional meetings, gastrodiplomacy, Ohrid cultural diplomacy and the closing airport protocol.'
    },
    pn004: {
      key: 'pn004', code: 'WPA-PN-004', short: 'WPA-PN-004', kind: 'protocol-note',
      mk: 'МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест',
      en: 'MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test',
      version: '1.10', date: '21 July 2026', pages: '', doi: '10.5281/zenodo.21469146',
      desc: 'A bilingual Protocol Note examining asymmetric ceremonial visibility, the role-transition threshold, sovereignty of the victory frame, greeting-lag, algorithmic micro-framing and VIP-suite diplomacy.'
    },
    pn005: {
      key: 'pn005', code: 'WPA-PN-005', short: 'WPA-PN-005', kind: 'protocol-note',
      mk: 'Протокол на вештачката интелигенција и државниот суверенитет',
      en: 'Protocol of Artificial Intelligence and State Sovereignty',
      version: '1.6', date: '28 July 2026', pages: '', doi: '10.5281/zenodo.21651611',
      desc: 'A bilingual Protocol Note on frontier-AI governance in national-security environments, introducing the Effective AI Sovereignty Index (EASI), cognitive sovereignty and shared but undissolved responsibility.'
    },
    pn006: {
      key: 'pn006', code: 'WPA-PN-006', short: 'WPA-PN-006', kind: 'protocol-note',
      mk: 'Невропротокол 2030: Од мисла до дејство',
      en: 'Neuroprotocol 2030: From Thought to Action',
      version: '1.6', date: '29 July 2026', pages: '', doi: '10.5281/zenodo.21669195',
      desc: 'A bilingual Protocol Note introducing neuroprotocol, the Effective Embodied Command Index (EECI), neural privacy, human confirmation and the WPA Right to Pause.'
    },
    strategy: {
      key: 'strategy', code: 'WPA Global Strategic Plan 2026', short: 'Strategic Plan', kind: 'report',
      mk: 'Светска академија за протокол — Глобален стратешки план 2026',
      en: 'World Protocol Academy — Global Strategic Plan 2026',
      version: '1.1', date: '29 July 2026', pages: '1–26', doi: '10.5281/zenodo.21675100', conceptDoi: '10.5281/zenodo.21396831',
      desc: 'The revised and expanded strategic report defines WPA institutional identity, mission, research priorities, publication governance, professional learning, AI and data governance, sustainability, performance review and strategic risk management.'
    }
  };

  var applying = false;
  var scheduled = false;

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
  }

  function txt(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function doiUrl(record) {
    return 'https://doi.org/' + record.doi;
  }

  function replaceTextNodes(root, replacements) {
    if (!root || !document.createTreeWalker || typeof NodeFilter === 'undefined') return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (item) {
      var next = item.nodeValue;
      replacements.forEach(function (pair) { next = next.replace(pair[0], pair[1]); });
      if (next !== item.nodeValue) item.nodeValue = next;
    });
  }

  function updateCorpusArithmetic() {
    replaceTextNodes(document.body, [
      [/12 WPA Working Papers/g, '13 WPA Working Papers'],
      [/twelve WPA Working Papers/gi, 'thirteen WPA Working Papers'],
      [/12 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 6 Protocol Notes'],
      [/13 Working Papers \+ 4 Protocol Notes/g, '13 Working Papers + 6 Protocol Notes'],
      [/13 Working Papers \+ 6 Protocol Notes \+ 1 Strategic Plan(?: report)? = 20(?: total WPA Zenodo records| records)?/g, '13 Working Papers + 6 Protocol Notes + 1 Strategic Plan = 20 records'],
      [/17 WPA Series DOI Records/g, '19 WPA Series DOI Records'],
      [/17 WPA series DOI records/g, '19 WPA series DOI records'],
      [/18 Total WPA Zenodo Records/g, '20 Total WPA Zenodo Records'],
      [/18 total WPA Zenodo records/g, '20 total WPA Zenodo records'],
      [/4 WPA Protocol Notes/g, '6 WPA Protocol Notes'],
      [/3 WPA Protocol Notes/g, '6 WPA Protocol Notes'],
      [/WPA Protocol Notes 001[–-]004/g, 'WPA Protocol Notes 001–006'],
      [/WPA Protocol Notes 001[–-]003/g, 'WPA Protocol Notes 001–006'],
      [/Protocol Notes 001[–-]004/g, 'Protocol Notes 001–006'],
      [/Protocol Notes 001[–-]003/g, 'Protocol Notes 001–006'],
      [/Published · PN-001[–-]PN-004 · 2026/g, 'Published · PN-001–PN-006 · 2026'],
      [/Published · PN-001[–-]PN-003 · 2026/g, 'Published · PN-001–PN-006 · 2026'],
      [/17 WPA series DOI records \(13 Working Papers \+ 4 Protocol Notes\) plus 1 Global Strategic Plan report = 18 total WPA Zenodo records/g, '19 WPA series DOI records (13 Working Papers + 6 Protocol Notes) plus 1 Global Strategic Plan report = 20 total WPA Zenodo records'],
      [/seventeen public DOI records in (?:its|the) two WPA publication series/gi, 'nineteen public DOI records in the two WPA publication series'],
      [/thirteen Working Papers and four Protocol Notes/gi, 'thirteen Working Papers and six Protocol Notes'],
      [/All eighteen records — thirteen Working Papers, four Protocol Notes and one Global Strategic Plan report/gi, 'All twenty records — thirteen Working Papers, six Protocol Notes and one Global Strategic Plan report'],
      [/Последно ажурирано: 16 јули 2026/g, 'Последно ажурирано: 29 јули 2026'],
      [/Last updated: 16 July 2026/g, 'Last updated: 29 July 2026'],
      [/Последно ажурирано: 23 јули 2026/g, 'Последно ажурирано: 29 јули 2026'],
      [/Last updated: 23 July 2026/g, 'Last updated: 29 July 2026']
    ]);
  }

  function updateStrategicReferences() {
    var s = RECORDS.strategy;
    qsa('a[href]').forEach(function (anchor) {
      var href = String(anchor.getAttribute('href') || '');
      var context = txt(anchor.closest('article,section,.card,.bib-entry,.paper-card,.pub-card,.note-card') || anchor.parentElement);
      if (href.indexOf('10.5281/zenodo.21396832') !== -1 || /Global Strategic Plan 2026|Глобален стратешки план 2026/i.test(context)) {
        anchor.href = doiUrl(s);
        if (/21396832|Zenodo record|Open Zenodo DOI|Permanent DOI/i.test(txt(anchor))) {
          anchor.textContent = txt(anchor).replace(/10\.5281\/zenodo\.21396832/g, s.doi).replace(/Open Zenodo DOI(?: · .*|$)/i, 'Open Zenodo DOI · ' + s.doi);
        }
      }
    });

    qsa('[id*="strategic" i], [class*="strategic" i]').forEach(function (node) {
      if (!/Global Strategic Plan 2026|Глобален стратешки план 2026|Strategic Plan/i.test(txt(node))) return;
      replaceTextNodes(node, [
        [/10\.5281\/zenodo\.21396832/g, s.doi],
        [/Version 1\.0/g, 'Version 1.1'],
        [/v1\.0/g, 'v1.1'],
        [/Published 16 July 2026/g, 'Published 29 July 2026'],
        [/16 July 2026/g, '29 July 2026'],
        [/First edition/g, 'Revised and expanded edition'],
        [/1–4/g, '1–26']
      ]);
    });
  }

  function simpleCard(record, id) {
    var card = document.createElement('article');
    card.className = 'card';
    card.id = id;
    card.innerHTML = '<span class="small-kicker">' + record.code + ' · ' + (record.kind === 'report' ? 'Strategic Report' : record.kind === 'working-paper' ? 'Official Visit Protocolometry' : 'Applied Protocolometry Record') + '</span>' +
      '<h4 class="paper-title">' + record.en + '</h4><p class="paper-summary">' + record.desc + '</p>' +
      '<div class="paper-tags"><span class="tag">' + (record.kind === 'report' ? 'Strategic Plan' : record.kind === 'working-paper' ? 'Working Paper' : 'Protocol Note') + '</span><span class="tag">Zenodo</span><span class="tag">2026</span></div>' +
      '<div class="paper-actions"><a class="btn btn-secondary" href="' + doiUrl(record) + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    return card;
  }

  function researchCard(record, id, latest) {
    var card = document.createElement('article');
    card.className = 'paper-card' + (latest ? ' latest-record' : '');
    card.id = id;
    card.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + record.code + '</div>' +
      '<div class="paper-title-mk">' + record.mk + '</div><div class="paper-title-en">' + record.en + '</div></div>' +
      '<span class="paper-type">' + (record.kind === 'report' ? 'Strategic Report' : record.kind === 'working-paper' ? 'Working Paper' : 'WPA Protocol Note') + '</span></div>' +
      '<div class="paper-meta">Version ' + record.version + ' · Bilingual MK / EN · Published ' + record.date + (record.pages ? ' · ' + record.pages + ' pages' : '') + '</div>' +
      '<p class="paper-desc">' + record.desc + '</p><div class="doi-row"><a class="doi" href="' + doiUrl(record) + '" target="_blank" rel="noopener">' + record.doi + '</a>' +
      '<a class="btn btn-ghost" href="' + doiUrl(record) + '" target="_blank" rel="noopener">Files available on Zenodo</a></div>';
    return card;
  }

  function bibCard(record, id) {
    var card = document.createElement('div');
    card.className = 'bib-entry';
    card.id = id;
    card.setAttribute('data-doi', record.doi);
    card.setAttribute('data-index', 'doi zenodo');
    card.setAttribute('data-search', (record.code + ' ' + record.mk + ' ' + record.en + ' ' + record.doi + ' zenodo').toLowerCase());
    card.setAttribute('data-title', record.mk);
    card.setAttribute('data-type', record.kind);
    card.setAttribute('data-year', '2026');
    card.innerHTML = '<div class="bib-num">' + record.short + '</div><div class="bib-mk">' + record.mk + '</div><div class="bib-en">' + record.en + '</div>' +
      '<div class="bib-meta"><strong>2026</strong> · ' + (record.kind === 'report' ? 'Strategic Report · Version 1.1 · Revised and expanded edition · 1–26 pages · Published 29 July 2026' : record.kind === 'working-paper' ? 'WPA Working Paper No. 013 · Version v14 · Bilingual MK/EN · 29 pages' : record.code + ' · Version ' + record.version + ' · Bilingual MK/EN') + '<br>' +
      '<strong>DOI</strong> <a class="bib-link" href="' + doiUrl(record) + '" target="_blank" rel="noopener">' + record.doi + '</a></div>' +
      '<div class="bib-tags"><span class="bib-tag blue">' + (record.kind === 'report' ? 'Strategic Report' : record.kind === 'working-paper' ? 'Working Paper' : 'Protocol Note') + '</span><span class="bib-tag green">Zenodo DOI</span></div>' +
      '<div class="bib-links"><a class="bib-link-btn" href="' + doiUrl(record) + '" target="_blank" rel="noopener">Zenodo record →</a></div>';
    return card;
  }

  function findEntry(pattern) {
    return qsa('.bib-entry').filter(function (entry) { return pattern.test(txt(entry) + ' ' + String(entry.getAttribute('data-doi') || '')); })[0];
  }

  function insertAfter(reference, node) {
    if (reference && reference.parentNode) reference.parentNode.insertBefore(node, reference.nextSibling);
  }

  function updateBibliography() {
    var p = path();
    if (!(p === '/bibliography' || p === '/bibliography/index.html')) return;

    var straySection = document.getElementById('wpaStrategicPlanPapersSection');
    if (straySection) straySection.remove();

    var wp012 = findEntry(/WP-012|Ankara 2026|Sealed Stage/i);
    var wp013 = findEntry(/WP-013|WPA-WP-2026-013|Мостови наместо бариери/i);
    if (!wp013 && wp012) { wp013 = bibCard(RECORDS.wp013, 'wpaBibWp013'); insertAfter(wp012, wp013); }

    var pn003 = findEntry(/WPA-PN-003|Les Invalides 2026|21390763/i);
    var pn004 = findEntry(/WPA-PN-004|MetLife 2026|21469146/i);
    if (!pn004 && pn003) { pn004 = bibCard(RECORDS.pn004, 'wpaBibPn004'); insertAfter(pn003, pn004); }
    var pn005 = findEntry(/WPA-PN-005|Artificial Intelligence and State Sovereignty|21651611/i);
    if (!pn005 && pn004) { pn005 = bibCard(RECORDS.pn005, 'pn-005'); insertAfter(pn004, pn005); }
    var pn006 = findEntry(/WPA-PN-006|Neuroprotocol 2030|21669195/i);
    if (!pn006 && pn005) { pn006 = bibCard(RECORDS.pn006, 'pn-006'); insertAfter(pn005, pn006); }

    var strategicCandidates = qsa('.bib-entry').filter(function (entry) {
      return /Global Strategic Plan 2026|Глобален стратешки план 2026|21396832|21675100/i.test(txt(entry) + ' ' + String(entry.getAttribute('data-doi') || ''));
    });
    var strategy = strategicCandidates[0];
    if (!strategy) {
      strategy = bibCard(RECORDS.strategy, 'wpaBibStrategicPlan');
      if (pn006) insertAfter(pn006, strategy); else if (pn004) insertAfter(pn004, strategy);
    } else {
      strategy.id = 'wpaBibStrategicPlan';
      strategy.replaceWith(bibCard(RECORDS.strategy, 'wpaBibStrategicPlan'));
      strategy = document.getElementById('wpaBibStrategicPlan');
    }
    strategicCandidates.slice(1).forEach(function (entry) { entry.remove(); });

    qsa('.bib-note').forEach(function (note) {
      if (txt(note).indexOf('WPA Research Metrics') === -1) return;
      note.innerHTML = '<strong>WPA Research Metrics · WPA Истражувачки показатели</strong><br><br>' +
        '• 25 Academic Publications / Академски публикации<br>' +
        '• 13 WPA Working Papers (Zenodo DOI)<br>' +
        '• 6 WPA Protocol Notes (Zenodo DOI)<br>' +
        '• 19 WPA Series DOI Records<br>' +
        '• 1 Global Strategic Plan report — Version 1.1 (Zenodo DOI)<br>' +
        '• 20 Total WPA Zenodo Records<br>' +
        '• 5 Monographs and Handbooks<br>• 1 Doctoral Dissertation<br>' +
        '• Research Areas: Protocol Studies · Protocolometry · Diplomatic Protocol · Ceremonial Diplomacy · Visual Statecraft · Sacred Diplomacy · Security Studies · Digital Protocol · AI Governance · Cognitive Sovereignty';
    });
    var badge = document.querySelector('.zenodo-hero-badge strong');
    if (badge) badge.textContent = '◆ 20 WPA Zenodo Records · 13 Working Papers + 6 Protocol Notes + 1 Strategic Plan';

    var stats = qsa('.zenodo-stat strong');
    if (stats[0]) stats[0].textContent = '13';
    if (stats[1]) stats[1].textContent = '001–013';
    if (stats[2]) stats[2].textContent = '13/13';
    var coverage = document.querySelector('.zenodo-doi-line strong');
    if (coverage) coverage.textContent = 'DOI coverage: 13 Zenodo records';

    var resultCount = document.getElementById('bibResultCount') || document.getElementById('resultCount');
    if (resultCount) {
      var total = qsa('.bib-entry[data-search]').filter(function (entry) { return entry.id !== 'record'; }).length;
      resultCount.textContent = 'Прикажани ' + total + ' од ' + total + ' записи · Showing ' + total + ' of ' + total + ' records';
    }
  }

  function latestHomeCard(record, latest) {
    return '<div class="wpa-latest-pn-grid"><div><div class="wpa-latest-pn-kicker">' + (latest ? 'Најнова Zenodo публикација · Latest Zenodo publication' : 'Нова Zenodo публикација · New Zenodo publication') + ' · ' + record.code + '</div>' +
      '<h4 id="wpa-' + record.key + '-title">' + record.mk + '</h4><div class="wpa-latest-pn-en">' + record.en + '</div><p>' + record.desc + '</p>' +
      '<div class="wpa-latest-pn-meta"><span>Version ' + record.version + '</span><span>' + record.date + '</span><span>DOI ' + record.doi + '</span><span>CC BY-NC-ND 4.0</span></div></div>' +
      '<div class="wpa-latest-pn-actions"><a class="btn btn-gold" href="' + doiUrl(record) + '" target="_blank" rel="noopener">Отвори на Zenodo →</a><a class="btn btn-ghost" href="/bibliography/#' + (record.kind === 'report' ? 'wpaBibStrategicPlan' : 'pn-' + record.key.slice(-3)) + '">Библиографски запис →</a></div></div>';
  }

  function updateHome() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/' || p === '/index.html' || page === 'index')) return;
    var existing = document.querySelector('.wpa-latest-pn, #wpa-pn-003, #wpa-pn-006');
    if (!existing) return;
    existing.id = 'wpa-pn-006';
    existing.innerHTML = latestHomeCard(RECORDS.pn006, true);

    var pn005 = document.getElementById('wpa-pn-005');
    if (!pn005) { pn005 = document.createElement('article'); pn005.className = 'wpa-latest-pn'; pn005.id = 'wpa-pn-005'; insertAfter(existing, pn005); }
    pn005.innerHTML = latestHomeCard(RECORDS.pn005, false);

    var plan = document.getElementById('wpa-strategic-plan-2026-home');
    if (!plan) { plan = document.createElement('article'); plan.className = 'wpa-latest-pn'; plan.id = 'wpa-strategic-plan-2026-home'; insertAfter(pn005, plan); }
    plan.innerHTML = latestHomeCard(RECORDS.strategy, false);
  }

  function updateInstitute() {
    var p = path();
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    if (!(p === '/institute.html' || page === 'institute')) return;
    var card = document.getElementById('wpa-protocol-notes');
    if (card) {
      var meta = card.querySelector('.pub-meta');
      var h3 = card.querySelector('h3');
      var paragraph = card.querySelector('p');
      var frequency = card.querySelector('.pub-frequency');
      var link = card.querySelector('a[href*="doi.org"],a[href*="zenodo"]');
      if (meta) meta.textContent = 'СЕРИЈА · 02 · 6 ZENODO DOI RECORDS';
      if (h3) h3.textContent = 'WPA Protocol Notes 001–006';
      if (paragraph) paragraph.innerHTML = 'Посебна серија на кратки, применети и изворно дисциплинирани анализи. Најновите записи се <strong>WPA-PN-005: Protocol of Artificial Intelligence and State Sovereignty</strong> и <strong>WPA-PN-006: Neuroprotocol 2030</strong>.';
      if (frequency) frequency.textContent = 'Published · PN-001–PN-006 · 2026';
      if (link) { link.href = doiUrl(RECORDS.pn006); link.textContent = 'Отвори WPA-PN-006 на Zenodo →'; }
    }
    qsa('.pub-card').forEach(function (node) {
      if (!/Global Strategic Plan 2026|Глобален стратешки план 2026/i.test(txt(node))) return;
      node.innerHTML = '<div class="pub-meta">WPA STRATEGIC PUBLICATION · VERSION 1.1</div><h3>Global Strategic Plan 2026</h3><p>' + RECORDS.strategy.desc + '</p><span class="pub-frequency">Revised and expanded edition · 29 July 2026 · 26 pages</span><p style="margin-top:14px"><a href="' + doiUrl(RECORDS.strategy) + '" target="_blank" rel="noopener" style="color:var(--navy);font-weight:700">Отвори Version 1.1 на Zenodo →</a></p>';
    });
  }

  function updatePapers() {
    if (path() !== '/papers.html') return;
    var working = document.getElementById('wpa-working-papers') || qsa('section').filter(function (s) { return /WPA Working Papers/i.test(txt(s).slice(0, 500)); })[0];
    if (working) {
      var workingGrid = working.querySelector('.grid-3,.grid');
      if (workingGrid && !document.getElementById('wpaWp013PapersCard')) workingGrid.appendChild(simpleCard(RECORDS.wp013, 'wpaWp013PapersCard'));
    }
    var notes = document.getElementById('wpa-protocol-notes');
    if (notes) {
      var h3 = notes.querySelector('.section-header h3');
      var p = notes.querySelector('.section-header p');
      if (h3) h3.textContent = 'Six applied protocolometry records — open access via Zenodo.';
      if (p) p.innerHTML = '<strong>Publication status:</strong> PN-001–PN-006 are published Zenodo DOI records. The WPA series corpus contains 19 public DOI records: 13 Working Papers and 6 Protocol Notes.';
      var grid = notes.querySelector('.grid-3,.grid');
      [['wpaPn004PapersCard', RECORDS.pn004], ['wpaPn005PapersCard', RECORDS.pn005], ['wpaPn006PapersCard', RECORDS.pn006]].forEach(function (pair) {
        if (grid && !document.getElementById(pair[0])) grid.appendChild(simpleCard(pair[1], pair[0]));
      });
    }
    var strategic = document.getElementById('wpaStrategicPlanPapersSection');
    if (!strategic && notes) {
      strategic = document.createElement('section');
      strategic.id = 'wpaStrategicPlanPapersSection';
      strategic.innerHTML = '<div class="container"><div class="section-header"><span class="label">WPA Strategic Publication</span><h3>Global Strategic Plan 2026 — Version 1.1</h3><p>Revised and expanded edition · 29 July 2026 · 26 pages · DOI ' + RECORDS.strategy.doi + '</p></div><div class="grid-3" id="wpaStrategicPlanGrid"></div></div>';
      insertAfter(notes, strategic);
      strategic.querySelector('#wpaStrategicPlanGrid').appendChild(simpleCard(RECORDS.strategy, 'wpaStrategicPlanPapersCard'));
    }
  }

  function ensureDivider(grid, id, title, subtitle) {
    var divider = document.getElementById(id);
    if (!divider) { divider = document.createElement('div'); divider.id = id; divider.className = 'series-divider'; divider.innerHTML = title + '<small>' + subtitle + '</small>'; grid.appendChild(divider); }
    return divider;
  }

  function updateWorkingIndex() {
    var p = path();
    if (!(p === '/working-papers' || p === '/working-papers/index.html')) return;
    var subtitle = document.querySelector('.hero .subtitle');
    if (subtitle) subtitle.textContent = 'Working Papers 001–013 · Protocol Notes 001–006';
    var sectionCount = document.querySelector('.section-title span');
    if (sectionCount) sectionCount.textContent = '13 Working Papers + 6 Protocol Notes + 1 Strategic Plan = 20 records';
    var intro = document.querySelector('.intro-box');
    if (intro) {
      var first = intro.querySelector('p');
      if (first) first.innerHTML = '<strong>Published Zenodo Records:</strong> The WPA corpus contains nineteen public DOI records in its two publication series — thirteen Working Papers and six Protocol Notes — plus one Global Strategic Plan report, for twenty total WPA Zenodo records. The Working Papers and Protocol Notes are author-reviewed public releases and are not presented as formal peer-reviewed journal articles.';
    }
    var grid = document.getElementById('papersGrid');
    if (grid) {
      var dividers = qsa('.series-divider', grid);
      var pnDivider = dividers.filter(function (d) { return /Protocol Notes/i.test(txt(d)); })[0];
      if (!document.getElementById('wp013')) {
        var w = researchCard(RECORDS.wp013, 'wp013', false);
        if (pnDivider) grid.insertBefore(w, pnDivider); else grid.appendChild(w);
      }
      if (pnDivider && pnDivider.firstChild) pnDivider.firstChild.nodeValue = 'WPA Protocol Notes 001–006';
      [['pn004', RECORDS.pn004], ['pn005', RECORDS.pn005], ['pn006', RECORDS.pn006]].forEach(function (pair) {
        if (!document.getElementById(pair[0])) grid.appendChild(researchCard(pair[1], pair[0], pair[0] === 'pn006'));
      });
      ensureDivider(grid, 'strategic-records-divider', 'WPA Strategic Publications', 'Institutional research and development reports');
      var oldStrategy = document.getElementById('strategic-plan-2026');
      if (oldStrategy) oldStrategy.remove();
      grid.appendChild(researchCard(RECORDS.strategy, 'strategic-plan-2026', true));
    }
    var responsibility = document.querySelector('.author-responsibility p');
    if (responsibility) responsibility.textContent = 'All twenty records — thirteen Working Papers, six Protocol Notes and one Global Strategic Plan report — are issued under the authorship and final editorial responsibility of Sande Smiljanov. The Working Papers and Protocol Notes are author-reviewed public releases and are not presented as formal peer-reviewed journal articles.';
  }

  function apply() {
    if (applying || !document.body) return;
    applying = true;
    try {
      updateCorpusArithmetic();
      updateStrategicReferences();
      updateHome();
      updateInstitute();
      updatePapers();
      updateWorkingIndex();
      updateBibliography();
      updateStrategicReferences();
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.setTimeout(function () { scheduled = false; apply(); }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true }); else apply();
  [250, 700, 1500, 3000].forEach(function (delay) { window.setTimeout(apply, delay); });
  if (window.MutationObserver) {
    var observer = new MutationObserver(schedule);
    window.setTimeout(function () { if (document.body) observer.observe(document.body, { childList: true, subtree: true }); }, 150);
  }
})();

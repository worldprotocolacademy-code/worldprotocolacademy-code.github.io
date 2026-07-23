/* WPA canonical public corpus synchronisation - 23 July 2026 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_SYNC_20260723_V4) return;
  window.WPA_CORPUS_SYNC_20260723_V4 = true;

  var COUNTS = { workingPapers: 13, protocolNotes: 4, series: 17, strategicPlans: 1, total: 18 };

  var WP013 = {
    id: '013', kind: 'WP', code: 'WPA-WP-2026-013', anchor: 'wp013',
    mk: 'Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија',
    en: 'Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia',
    doi: '10.5281/zenodo.21514266',
    meta: 'Version v14 · Bilingual MK / EN · Published 23 July 2026 · 29 pages · Final Domain, Contact and DOI Lock Edition',
    desc: 'A source-disciplined protocolometric analysis of the first visit by a President of India to North Macedonia, covering ceremonial sequencing, commemorative diplomacy, institutional meetings, gastrodiplomacy, Ohrid cultural diplomacy and the closing airport protocol.'
  };

  var PN004 = {
    id: 'PN-004', kind: 'PN', code: 'WPA-PN-004', anchor: 'pn004',
    mk: 'МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест',
    en: 'MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test',
    doi: '10.5281/zenodo.21469146',
    meta: 'Version v1.10 · Bilingual MK / EN · Published 21 July 2026 · Author-Reviewed Final Release',
    desc: 'A bilingual protocol note examining the medal-and-trophy ceremony after the 2026 FIFA World Cup Final through asymmetric ceremonial visibility, role-transition threshold, sovereignty of the victory frame, ceremonial greeting-lag, algorithmic micro-framing and VIP-suite diplomacy.'
  };

  var STRATEGY = {
    id: 'SP-2026', kind: 'REPORT', code: 'WPA Global Strategic Plan 2026', anchor: 'strategic-plan-2026',
    mk: 'Светска академија за протокол — Глобален стратешки план 2026',
    en: 'World Protocol Academy — Global Strategic Plan 2026',
    doi: '',
    fallbackUrl: 'https://zenodo.org/search?q=%22World%20Protocol%20Academy%20%E2%80%94%20Global%20Strategic%20Plan%202026%22',
    meta: 'Version 1.0 · Bilingual MK / EN · Published 16 July 2026 · Report',
    desc: 'The strategic plan presents the mission, research priorities, publication framework and development pathway of the World Protocol Academy as an independent digital educational, research and authorial platform.'
  };

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
  }

  function txt(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function recordUrl(record) {
    return record.doi ? 'https://doi.org/' + record.doi : record.fallbackUrl;
  }

  function recordLabel(record) {
    return record.doi || 'Zenodo record';
  }

  function codeLabel(record) {
    return record.code;
  }

  function canonicalSummary() {
    return '17 WPA series DOI records (13 Working Papers + 4 Protocol Notes) plus 1 Global Strategic Plan report = 18 total WPA Zenodo records.';
  }

  function normalizeText() {
    if (!document.body || typeof NodeFilter === 'undefined') return;
    var replacements = [
      [/Working Papers 001[–-]012/g, 'Working Papers 001–013'],
      [/WPA Working Papers 001[–-]012/g, 'WPA Working Papers 001–013'],
      [/Protocol Notes 001[–-]003/g, 'Protocol Notes 001–004'],
      [/WPA Protocol Notes 001[–-]003/g, 'WPA Protocol Notes 001–004'],
      [/12 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 4 Protocol Notes'],
      [/13 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 4 Protocol Notes'],
      [/12 Working Papers \+ 4 Protocol Notes/g, '13 Working Papers + 4 Protocol Notes'],
      [/12 WPA Working Papers/g, '13 WPA Working Papers'],
      [/3 WPA Protocol Notes/g, '4 WPA Protocol Notes'],
      [/twelve Working Papers and three Protocol Notes/gi, 'thirteen Working Papers and four Protocol Notes'],
      [/thirteen Working Papers and three Protocol Notes/gi, 'thirteen Working Papers and four Protocol Notes'],
      [/Следните дванаесет working papers/gi, 'Следните тринаесет working papers'],
      [/Twelve WPA Working Papers/g, 'Thirteen WPA Working Papers'],
      [/Дванаесетте WPA Working Papers/g, 'Тринаесетте WPA Working Papers'],
      [/Three applied protocolometry records/g, 'Four applied protocolometry records'],
      [/three applied protocolometry records/gi, 'four applied protocolometry records'],
      [/15 total WPA Zenodo DOI records across the two WPA series/gi, '17 total WPA Zenodo DOI records across the two WPA series'],
      [/18 total WPA Zenodo records across the two WPA series/gi, '17 total WPA Zenodo DOI records across the two WPA series'],
      [/18 total WPA Zenodo DOI records across the two WPA series/gi, '17 total WPA Zenodo DOI records across the two WPA series'],
      [/14 total WPA Zenodo DOI records across the two WPA series/gi, '17 total WPA Zenodo DOI records across the two WPA series'],
      [/15 WPA Zenodo DOI Records\s*·\s*13 Working Papers \+ 4 Protocol Notes/gi, '17 WPA Series DOI Records · 13 Working Papers + 4 Protocol Notes'],
      [/18 WPA Zenodo Records\s*·\s*13 Working Papers \+ 4 Protocol Notes/gi, '17 WPA Series DOI Records · 13 Working Papers + 4 Protocol Notes'],
      [/15 WPA Zenodo DOI Records/g, '17 WPA Series DOI Records'],
      [/15 Total Zenodo DOI Records/g, '18 Total WPA Zenodo Records'],
      [/17 Total Zenodo Records/g, '18 Total WPA Zenodo Records'],
      [/17 Total WPA Zenodo Records/g, '18 Total WPA Zenodo Records'],
      [/17 total WPA Zenodo records(?! across the two WPA series)/gi, '18 total WPA Zenodo records'],
      [/fifteen public DOI records/gi, 'seventeen public DOI records in the two WPA publication series'],
      [/All fifteen records\s*[—-]\s*twelve Working Papers and three Protocol Notes/gi, 'All eighteen records — thirteen Working Papers, four Protocol Notes and the WPA Global Strategic Plan 2026 report'],
      [/All seventeen records\s*[—-]\s*thirteen Working Papers and four Protocol Notes/gi, 'All eighteen records — thirteen Working Papers, four Protocol Notes and the WPA Global Strategic Plan 2026 report'],
      [/All fifteen records/gi, 'All eighteen records'],
      [/12 Zenodo DOI записи/g, '13 Zenodo DOI записи'],
      [/12 Zenodo records/g, '13 Zenodo DOI records'],
      [/001[–-]012/g, '001–013'],
      [/12\/12/g, '13/13'],
      [/Последно ажурирано: 16 јули 2026/g, 'Последно ажурирано: 23 јули 2026'],
      [/Last updated: 16 July 2026/g, 'Last updated: 23 July 2026'],
      [/worldprotocolacademy@gmail\.com/g, 'info@worldprotocolacademy.mk'],
      [/worldprotocolacademy-code\.github\.io/g, 'worldprotocolacademy.mk']
    ];

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && /^(SCRIPT|STYLE|TEXTAREA)$/i.test(node.parentElement.tagName)) continue;
      var value = node.nodeValue;
      replacements.forEach(function (item) { value = value.replace(item[0], item[1]); });
      node.nodeValue = value;
    }

    qsa('a[href]').forEach(function (anchor) {
      var href = String(anchor.getAttribute('href') || '');
      href = href.replace(/https:\/\/worldprotocolacademy-code\.github\.io\/?/g, 'https://worldprotocolacademy.mk/');
      href = href.replace(/mailto:worldprotocolacademy@gmail\.com/gi, 'mailto:info@worldprotocolacademy.mk');
      anchor.setAttribute('href', href);
    });
  }

  function researchCard(record, id, className) {
    var article = document.createElement('article');
    article.id = id;
    article.className = className || 'paper-card';
    article.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + codeLabel(record) + '</div><h3 class="paper-title-mk">' + record.mk + '</h3><div class="paper-title-en">' + record.en + '</div></div><span class="paper-type">' + (record.kind === 'WP' ? 'Working Paper' : record.kind === 'PN' ? 'WPA Protocol Note' : 'Strategic Report') + '</span></div><div class="paper-meta">' + record.meta + '</div><p class="paper-desc">' + record.desc + '</p><div class="doi-row"><a class="doi" data-record-link="' + record.id + '" href="' + recordUrl(record) + '" target="_blank" rel="noopener">' + recordLabel(record) + '</a><a class="btn btn-gold" data-record-link="' + record.id + '" href="' + recordUrl(record) + '" target="_blank" rel="noopener">Files available on Zenodo</a><button class="btn btn-ghost" type="button" data-copy-record="' + record.id + '">Copy citation</button></div>';
    return article;
  }

  function ensureDivider(grid, id, title, subtitle) {
    var divider = document.getElementById(id);
    if (divider) return divider;
    divider = document.createElement('div');
    divider.id = id;
    divider.className = 'series-divider';
    divider.innerHTML = title + '<small>' + subtitle + '</small>';
    grid.appendChild(divider);
    return divider;
  }

  function syncWorkingIndex() {
    var grid = document.getElementById('papersGrid');
    if (!grid) return;
    var dividers = qsa('.series-divider', grid);
    var pnDivider = dividers.filter(function (item) { return /Protocol Notes/i.test(txt(item)); })[0];
    var wpDivider = dividers.filter(function (item) { return /Working Papers/i.test(txt(item)); })[0];

    if (!document.getElementById('wp013')) {
      var wpCard = researchCard(WP013, 'wp013', 'paper-card latest-record');
      if (pnDivider) grid.insertBefore(wpCard, pnDivider); else grid.appendChild(wpCard);
    }
    if (!document.getElementById('pn004')) {
      var pnCard = researchCard(PN004, 'pn004', 'paper-card latest-record');
      grid.appendChild(pnCard);
    }
    if (!document.getElementById('strategic-plan-2026')) {
      ensureDivider(grid, 'strategic-records-divider', 'WPA Strategic Publications', 'Institutional research and development reports');
      grid.appendChild(researchCard(STRATEGY, 'strategic-plan-2026', 'paper-card latest-record'));
    }

    if (wpDivider && wpDivider.firstChild) wpDivider.firstChild.nodeValue = 'WPA Working Papers 001–013';
    if (pnDivider && pnDivider.firstChild) pnDivider.firstChild.nodeValue = 'WPA Protocol Notes 001–004';

    var sectionCount = document.querySelector('#series + span, #series span, .section-title span');
    if (sectionCount && /Working Papers|Protocol Notes/i.test(txt(sectionCount))) {
      sectionCount.textContent = '13 Working Papers + 4 Protocol Notes + 1 Strategic Plan = 18 records';
    }

    var select = document.getElementById('paperSelect');
    if (select) {
      [WP013, PN004, STRATEGY].forEach(function (record) {
        if (!qsa('option', select).some(function (option) { return option.value === record.id; })) {
          var option = document.createElement('option');
          option.value = record.id;
          option.textContent = record.code + ' · ' + record.en;
          select.appendChild(option);
        }
      });
    }
  }

  function simpleCard(record, id) {
    var card = document.createElement('article');
    card.className = 'card';
    card.id = id;
    card.innerHTML = '<span class="small-kicker">' + record.code + ' · ' + (record.kind === 'WP' ? 'Official Visit Protocolometry' : record.kind === 'PN' ? 'Applied Protocolometry Record' : 'Strategic Report') + '</span><h4 class="paper-title">' + record.en + '</h4><p class="paper-summary">' + record.desc + '</p><div class="paper-tags"><span class="tag">' + (record.kind === 'WP' ? 'Working Paper' : record.kind === 'PN' ? 'Protocol Note' : 'Strategic Plan') + '</span><span class="tag">Zenodo</span><span class="tag">2026</span></div><div class="paper-actions"><a class="btn btn-secondary" data-record-link="' + record.id + '" href="' + recordUrl(record) + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    return card;
  }

  function syncPapersPage() {
    var working = document.getElementById('wpa-working-papers') || qsa('section').filter(function (section) { return /WPA Working Papers/i.test(txt(section).slice(0, 500)); })[0];
    if (working && !document.getElementById('wpaWp013PapersCard')) {
      var workingGrid = working.querySelector('.grid-3') || working.querySelector('.grid');
      if (workingGrid) workingGrid.appendChild(simpleCard(WP013, 'wpaWp013PapersCard'));
    }

    var notes = document.getElementById('wpa-protocol-notes') || qsa('section').filter(function (section) { return /WPA Protocol Notes/i.test(txt(section).slice(0, 500)); })[0];
    if (notes && !document.getElementById('wpaPn004PapersCard')) {
      var notesGrid = notes.querySelector('.grid-3') || notes.querySelector('.grid');
      if (notesGrid) notesGrid.appendChild(simpleCard(PN004, 'wpaPn004PapersCard'));
    }

    if (notes && !document.getElementById('wpaStrategicPlanPapersSection')) {
      var section = document.createElement('section');
      section.id = 'wpaStrategicPlanPapersSection';
      section.className = notes.className || 'section';
      section.innerHTML = '<div class="container"><div class="section-header"><span class="eyebrow">WPA Strategic Publication</span><h2>Global Strategic Plan 2026</h2><p>One strategic report completes the 18-record WPA Zenodo corpus.</p></div><div class="grid-3" id="wpaStrategicPlanGrid"></div></div>';
      notes.insertAdjacentElement('afterend', section);
      section.querySelector('#wpaStrategicPlanGrid').appendChild(simpleCard(STRATEGY, 'wpaStrategicPlanPapersCard'));
    }
  }

  function bibCard(record, id) {
    var card = document.createElement('div');
    card.className = 'bib-entry';
    card.id = id;
    card.setAttribute('data-doi', record.doi || '');
    card.setAttribute('data-index', 'doi zenodo');
    card.setAttribute('data-search', (record.code + ' ' + record.mk + ' ' + record.en + ' zenodo ' + (record.doi || '')).toLowerCase());
    card.setAttribute('data-title', record.mk);
    card.setAttribute('data-type', record.kind === 'WP' ? 'working-paper' : record.kind === 'PN' ? 'protocol-note' : 'report');
    card.setAttribute('data-year', '2026');
    card.innerHTML = '<div class="bib-num">' + (record.kind === 'WP' ? 'WP-013' : record.kind === 'PN' ? 'WPA-PN-004' : 'WPA Strategic Plan 2026') + '</div><div class="bib-mk">' + record.mk + '</div><div class="bib-en">' + record.en + '</div><div class="bib-meta"><strong>2026</strong> · ' + (record.kind === 'WP' ? 'WPA Working Paper No. 013 · v14 · Bilingual MK/EN · 29 стр.' : record.kind === 'PN' ? 'WPA Protocol Note No. 004 · v1.10 · Bilingual MK/EN' : 'Strategic Report · Version 1.0 · Bilingual MK/EN · Published 16 July 2026') + '<br/>DOI <a class="bib-link" data-record-link="' + record.id + '" href="' + recordUrl(record) + '" target="_blank" rel="noopener">' + recordLabel(record) + '</a></div><div class="bib-tags"><span class="bib-tag">' + (record.kind === 'WP' ? 'Working Paper' : record.kind === 'PN' ? 'Protocol Note' : 'Strategic Plan') + '</span><span class="bib-tag green">Zenodo DOI</span></div><div class="bib-links"><a class="bib-link-btn" data-record-link="' + record.id + '" href="' + recordUrl(record) + '" target="_blank" rel="noopener">Zenodo record →</a></div><div class="bib-entry-tools"><button class="bib-mini-btn cite-btn" type="button" data-wpa-cite="' + record.id + '">Copy APA Citation</button><button class="bib-mini-btn link-btn" type="button" data-wpa-link="' + id + '">Copy Deep Link</button><span class="bib-copy-status" aria-live="polite"></span></div>';
    return card;
  }

  function findBibEntry(pattern) {
    return qsa('.bib-entry').filter(function (entry) {
      return pattern.test(txt(entry.querySelector('.bib-num')) + ' ' + String(entry.getAttribute('data-title') || '') + ' ' + txt(entry).slice(0, 260));
    })[0];
  }

  function exactTextElement(pattern) {
    return qsa('h1,h2,h3,h4,h5,div,p').filter(function (element) {
      if (element.children.length > 4) return false;
      return pattern.test(txt(element));
    })[0];
  }

  function syncBibliography() {
    if (!document.querySelector('.bib-entry')) return;

    if (!document.getElementById('wpaBibWp013') && !findBibEntry(/WP-013|WPA-WP-2026-013|Мостови наместо бариери/i)) {
      var wp012 = findBibEntry(/WP-012|WPA-WP-2026-012|Анкара 2026|Sealed Stage/i);
      var wpCard = bibCard(WP013, 'wpaBibWp013');
      if (wp012 && wp012.parentNode) wp012.parentNode.insertBefore(wpCard, wp012.nextSibling);
      else {
        var preparation = exactTextElement(/^Публикации во подготовка/i);
        if (preparation && preparation.parentNode) preparation.parentNode.insertBefore(wpCard, preparation);
      }
    }

    if (!document.getElementById('wpaBibPn004') && !findBibEntry(/WPA-PN-004|МетЛајф 2026|MetLife 2026/i)) {
      var pn003 = findBibEntry(/WPA-PN-003|Инвалидите 2026|Les Invalides 2026/i);
      var pnCard = bibCard(PN004, 'wpaBibPn004');
      if (pn003 && pn003.parentNode) pn003.parentNode.insertBefore(pnCard, pn003.nextSibling);
    }

    if (!document.getElementById('wpaBibStrategicPlan') && !findBibEntry(/Global Strategic Plan 2026|Глобален стратешки план 2026/i)) {
      var pn004 = document.getElementById('wpaBibPn004') || findBibEntry(/WPA-PN-004|МетЛајф 2026|MetLife 2026/i);
      var planCard = bibCard(STRATEGY, 'wpaBibStrategicPlan');
      if (pn004 && pn004.parentNode) pn004.parentNode.insertBefore(planCard, pn004.nextSibling);
      else {
        var programme = exactTextElement(/^VI\. WPA Истражувачка програма/i);
        if (programme && programme.parentNode) programme.parentNode.insertBefore(planCard, programme);
      }
    }

    var metricBlock = qsa('.bib-hero-inner,.bib-note,.zenodo-graph').filter(function (node) { return /Zenodo|Working Papers/i.test(txt(node)); })[0];
    if (metricBlock && !document.getElementById('wpaCanonicalCorpusCount')) {
      var note = document.createElement('div');
      note.id = 'wpaCanonicalCorpusCount';
      note.className = 'bib-note';
      note.textContent = canonicalSummary();
      metricBlock.appendChild(note);
    }

    var count = document.getElementById('resultCount');
    if (count) {
      var totalEntries = qsa('.bib-entry').length;
      count.textContent = 'Прикажани ' + totalEntries + ' од ' + totalEntries + ' записи · Showing ' + totalEntries + ' of ' + totalEntries + ' records';
    }
  }

  function ensureCanonicalSummary() {
    var path = String(window.location.pathname || '').toLowerCase();
    if (!/(working-papers|bibliography|papers\.html|research|institute)/.test(path)) return;
    if (document.getElementById('wpaCanonicalZenodoSummary')) return;
    var target = qsa('.intro-box,.hero-content,.section-header,.bib-note').filter(function (node) { return /Zenodo|Working Papers|research/i.test(txt(node)); })[0];
    if (!target) return;
    var note = document.createElement('p');
    note.id = 'wpaCanonicalZenodoSummary';
    note.innerHTML = '<strong>Canonical WPA Zenodo count:</strong> ' + canonicalSummary();
    target.appendChild(note);
  }

  function updateRecordLinks(record) {
    qsa('[data-record-link="' + record.id + '"]').forEach(function (anchor) {
      anchor.href = recordUrl(record);
      if (anchor.classList.contains('doi') || anchor.classList.contains('bib-link')) anchor.textContent = recordLabel(record);
    });
    var bib = document.querySelector('[data-wpa-cite="' + record.id + '"]');
    if (bib && bib.closest('.bib-entry')) bib.closest('.bib-entry').setAttribute('data-doi', record.doi || '');
  }

  function resolveStrategyDoi() {
    if (STRATEGY.doi || !window.fetch) return;
    var query = encodeURIComponent('metadata.title:"' + STRATEGY.en + '"');
    fetch('https://zenodo.org/api/records?q=' + query + '&size=10&sort=newest')
      .then(function (response) { return response.ok ? response.json() : Promise.reject(new Error('Zenodo API')); })
      .then(function (data) {
        var hits = data && data.hits && data.hits.hits || [];
        var hit = hits.filter(function (item) { return item.metadata && item.metadata.title === STRATEGY.en; })[0] || hits[0];
        var doi = hit && ((hit.pids && hit.pids.doi && hit.pids.doi.identifier) || hit.doi);
        if (doi) {
          STRATEGY.doi = doi;
          updateRecordLinks(STRATEGY);
        }
      }).catch(function () { /* Exact-title Zenodo search remains available. */ });
  }

  function recordById(id) {
    if (id === WP013.id || id === WP013.code) return WP013;
    if (id === PN004.id || id === PN004.code) return PN004;
    return STRATEGY;
  }

  function copyText(value, status) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(function () {
      if (status) status.textContent = 'Copied · Копирано';
      window.setTimeout(function () { if (status) status.textContent = ''; }, 1800);
    });
  }

  function bindCopy() {
    document.addEventListener('click', function (event) {
      var copyRecord = event.target.closest && event.target.closest('[data-copy-record]');
      if (copyRecord) {
        var record = recordById(copyRecord.getAttribute('data-copy-record'));
        copyText('Smiljanov, S. (2026). ' + record.en + '. ' + record.code + '. World Protocol Academy. ' + recordUrl(record));
        return;
      }
      var citeButton = event.target.closest && event.target.closest('[data-wpa-cite]');
      if (citeButton) {
        var citeRecord = recordById(citeButton.getAttribute('data-wpa-cite'));
        copyText('Smiljanov, S. (2026). ' + citeRecord.en + '. ' + citeRecord.code + '. World Protocol Academy. ' + recordUrl(citeRecord), citeButton.parentElement.querySelector('.bib-copy-status'));
        return;
      }
      var linkButton = event.target.closest && event.target.closest('[data-wpa-link]');
      if (linkButton) copyText(location.href.split('#')[0] + '#' + linkButton.getAttribute('data-wpa-link'), linkButton.parentElement.querySelector('.bib-copy-status'));
    });
  }

  function boot() {
    normalizeText();
    syncWorkingIndex();
    syncPapersPage();
    syncBibliography();
    ensureCanonicalSummary();
    updateRecordLinks(WP013);
    updateRecordLinks(PN004);
    updateRecordLinks(STRATEGY);
  }

  bindCopy();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 120);
  window.setTimeout(boot, 650);
  window.setTimeout(boot, 1800);
  resolveStrategyDoi();

  if (window.MutationObserver && document.documentElement) {
    var observer = new MutationObserver(function () {
      window.clearTimeout(observer._wpaTimer);
      observer._wpaTimer = window.setTimeout(boot, 90);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

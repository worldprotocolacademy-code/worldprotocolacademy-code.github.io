/* WPA public corpus synchronisation - WP-013 + PN-004 - 23 July 2026 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_SYNC_20260723_V3) return;
  window.WPA_CORPUS_SYNC_20260723_V3 = true;

  var WP013 = {
    id: '013', kind: 'WP', code: 'WPA-WP-2026-013',
    mk: 'Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија',
    en: 'Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia',
    doi: '10.5281/zenodo.21514266',
    meta: 'Version v14 · Bilingual MK / EN · Published 23 July 2026 · 29 pages · Final Domain, Contact and DOI Lock Edition',
    desc: 'A source-disciplined protocolometric analysis of the first visit by a President of India to North Macedonia, covering ceremonial sequencing, commemorative diplomacy, institutional meetings, gastrodiplomacy, Ohrid cultural diplomacy and the closing airport protocol.'
  };

  var PN004 = {
    id: 'PN-004', kind: 'PN', code: 'WPA-PN-004',
    mk: 'МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест',
    en: 'MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test',
    doi: '10.5281/zenodo.21469146',
    meta: 'Version v1.10 · Bilingual MK / EN · Published 21 July 2026 · Author-Reviewed Final Release',
    desc: 'A bilingual protocol note examining the medal-and-trophy ceremony after the 2026 FIFA World Cup Final through asymmetric ceremonial visibility, role-transition threshold, sovereignty of the victory frame, ceremonial greeting-lag, algorithmic micro-framing and VIP-suite diplomacy.'
  };

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
  }

  function txt(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function recordUrl(record) {
    return 'https://doi.org/' + record.doi;
  }

  function replaceText() {
    if (!document.body || typeof NodeFilter === 'undefined') return;
    var replacements = [
      [/Working Papers 001[–-]012/g, 'Working Papers 001–013'],
      [/WPA Working Papers 001[–-]012/g, 'WPA Working Papers 001–013'],
      [/Protocol Notes 001[–-]003/g, 'Protocol Notes 001–004'],
      [/WPA Protocol Notes 001[–-]003/g, 'WPA Protocol Notes 001–004'],
      [/12 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 4 Protocol Notes'],
      [/13 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 4 Protocol Notes'],
      [/12 WPA Working Papers/g, '13 WPA Working Papers'],
      [/3 WPA Protocol Notes/g, '4 WPA Protocol Notes'],
      [/twelve Working Papers and three Protocol Notes/gi, 'thirteen Working Papers and four Protocol Notes'],
      [/thirteen Working Papers and three Protocol Notes/gi, 'thirteen Working Papers and four Protocol Notes'],
      [/Следните дванаесет working papers/gi, 'Следните тринаесет working papers'],
      [/Twelve WPA Working Papers/g, 'Thirteen WPA Working Papers'],
      [/Дванаесетте WPA Working Papers/g, 'Тринаесетте WPA Working Papers'],
      [/Three applied protocolometry records/g, 'Four applied protocolometry records'],
      [/15 WPA Zenodo DOI Records/g, '18 WPA Zenodo Records'],
      [/15 total WPA Zenodo DOI records/gi, '18 total WPA Zenodo records'],
      [/15 Total Zenodo DOI Records/g, '18 Total Zenodo Records'],
      [/fifteen public DOI records/gi, 'eighteen public Zenodo records'],
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
  }

  function researchCard(record, id, className) {
    var article = document.createElement('article');
    article.id = id;
    article.className = className || 'paper-card';
    article.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + record.code + '</div><h3 class="paper-title-mk">' + record.mk + '</h3><div class="paper-title-en">' + record.en + '</div></div><span class="paper-type">' + (record.kind === 'PN' ? 'WPA Protocol Note · Latest Release' : 'India–North Macedonia / Official Visit Case Study') + '</span></div><div class="paper-meta">' + record.meta + '</div><p class="paper-desc">' + record.desc + '</p><div class="doi-row"><a class="doi" href="' + recordUrl(record) + '" target="_blank" rel="noopener">' + record.doi + '</a><a class="btn btn-gold" href="' + recordUrl(record) + '" target="_blank" rel="noopener">Files available on Zenodo</a><button class="btn btn-ghost" type="button" data-copy-record="' + record.code + '">Copy citation</button></div>';
    return article;
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
    if (!document.getElementById('pn004')) grid.appendChild(researchCard(PN004, 'pn004', 'paper-card latest-record'));
    if (wpDivider && wpDivider.firstChild) wpDivider.firstChild.nodeValue = 'WPA Working Papers 001–013';
    if (pnDivider && pnDivider.firstChild) pnDivider.firstChild.nodeValue = 'WPA Protocol Notes 001–004';
    var select = document.getElementById('paperSelect');
    if (select) {
      if (!qsa('option', select).some(function (option) { return option.value === '013'; })) {
        var wpOption = document.createElement('option');
        wpOption.value = '013';
        wpOption.textContent = WP013.code + ' · ' + WP013.en;
        select.appendChild(wpOption);
      }
      if (!qsa('option', select).some(function (option) { return option.value === 'PN-004'; })) {
        var pnOption = document.createElement('option');
        pnOption.value = 'PN-004';
        pnOption.textContent = PN004.code + ' · ' + PN004.en;
        select.appendChild(pnOption);
      }
    }
  }

  function simpleCard(record, id) {
    var card = document.createElement('article');
    card.className = 'card';
    card.id = id;
    card.innerHTML = '<span class="small-kicker">' + record.code + ' · ' + (record.kind === 'PN' ? 'Applied Protocolometry Record' : 'Official Visit Protocolometry') + '</span><h4 class="paper-title">' + record.en + '</h4><p class="paper-summary">' + record.desc + '</p><div class="paper-tags"><span class="tag">' + (record.kind === 'PN' ? 'Protocol Note' : 'Working Paper') + '</span><span class="tag">Protocolometry</span><span class="tag">Visual Statecraft</span></div><div class="paper-actions"><a class="btn btn-secondary" href="' + recordUrl(record) + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
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
  }

  function bibCard(record, id) {
    var card = document.createElement('div');
    card.className = 'bib-entry';
    card.id = id;
    card.setAttribute('data-doi', record.doi);
    card.setAttribute('data-index', 'doi zenodo');
    card.setAttribute('data-search', (record.code + ' ' + record.mk + ' ' + record.en + ' protocolometry zenodo ' + record.doi).toLowerCase());
    card.setAttribute('data-title', record.mk);
    card.setAttribute('data-type', record.kind === 'PN' ? 'protocol-note' : 'working-paper');
    card.setAttribute('data-year', '2026');
    card.innerHTML = '<div class="bib-num">' + (record.kind === 'PN' ? record.code : 'WP-013') + '</div><div class="bib-mk">' + record.mk + '</div><div class="bib-en">' + record.en + '</div><div class="bib-meta"><strong>2026</strong> · ' + (record.kind === 'PN' ? 'WPA Protocol Note No. 004 · Applied Protocolometry Record · Bilingual MK/EN · v1.10' : 'WPA Working Paper No. 013 · Official Visit Protocolometry · Bilingual MK/EN · v14 · 29 стр.') + '<br/>DOI <a class="bib-link" href="' + recordUrl(record) + '" target="_blank" rel="noopener">' + record.doi + '</a></div><div class="bib-tags"><span class="bib-tag">' + (record.kind === 'PN' ? 'Protocol Note' : 'Working Paper') + '</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag blue">Protocolometry</span></div><div class="bib-links"><a class="bib-link-btn" href="' + recordUrl(record) + '" target="_blank" rel="noopener">Zenodo record →</a></div><div class="bib-entry-tools"><button class="bib-mini-btn cite-btn" type="button" data-wpa-cite="' + record.code + '">Copy APA Citation</button><button class="bib-mini-btn link-btn" type="button" data-wpa-link="' + id + '">Copy Deep Link</button><span class="bib-copy-status" aria-live="polite"></span></div>';
    return card;
  }

  function findBibEntry(pattern) {
    return qsa('.bib-entry').filter(function (entry) {
      var number = txt(entry.querySelector('.bib-num'));
      var title = String(entry.getAttribute('data-title') || '');
      return pattern.test(number + ' ' + title + ' ' + txt(entry).slice(0, 220));
    })[0];
  }

  function exactTextElement(pattern) {
    return qsa('h1,h2,h3,h4,h5,div,p').filter(function (element) {
      if (element.children.length > 4) return false;
      return pattern.test(txt(element));
    })[0];
  }

  function syncBibliography() {
    var wpExists = document.getElementById('wpaBibWp013') || findBibEntry(/WP-013|WPA-WP-2026-013|Мостови наместо бариери/i);
    if (!wpExists) {
      var wp012 = findBibEntry(/WP-012|WPA-WP-2026-012|Анкара 2026|Sealed Stage/i);
      var wpCard = bibCard(WP013, 'wpaBibWp013');
      if (wp012 && wp012.parentNode) wp012.parentNode.insertBefore(wpCard, wp012.nextSibling);
      else {
        var preparation = exactTextElement(/^Публикации во подготовка/i);
        if (preparation && preparation.parentNode) preparation.parentNode.insertBefore(wpCard, preparation);
      }
    }

    var pnExists = document.getElementById('wpaBibPn004') || findBibEntry(/WPA-PN-004|МетЛајф 2026|MetLife 2026/i);
    if (!pnExists) {
      var pn003 = findBibEntry(/WPA-PN-003|Инвалидите 2026|Les Invalides 2026/i);
      var pnCard = bibCard(PN004, 'wpaBibPn004');
      if (pn003 && pn003.parentNode) pn003.parentNode.insertBefore(pnCard, pn003.nextSibling);
      else {
        var programme = exactTextElement(/^VI\. WPA Истражувачка програма/i);
        if (programme && programme.parentNode) programme.parentNode.insertBefore(pnCard, programme);
      }
    }

    var count = document.getElementById('resultCount');
    if (count) {
      var total = qsa('.bib-entry').length;
      count.textContent = 'Прикажани ' + total + ' од ' + total + ' записи · Showing ' + total + ' of ' + total + ' records';
    }
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
      var recordButton = event.target.closest && event.target.closest('[data-copy-record]');
      if (recordButton) {
        var record = recordButton.getAttribute('data-copy-record') === WP013.code ? WP013 : PN004;
        copyText('Smiljanov, S. (2026). ' + record.en + '. ' + record.code + '. World Protocol Academy. ' + recordUrl(record));
        return;
      }
      var citeButton = event.target.closest && event.target.closest('[data-wpa-cite]');
      if (citeButton) {
        var citeRecord = citeButton.getAttribute('data-wpa-cite') === WP013.code ? WP013 : PN004;
        copyText('Smiljanov, S. (2026). ' + citeRecord.en + '. ' + citeRecord.code + '. World Protocol Academy. ' + recordUrl(citeRecord), citeButton.parentElement.querySelector('.bib-copy-status'));
        return;
      }
      var linkButton = event.target.closest && event.target.closest('[data-wpa-link]');
      if (linkButton) {
        copyText(location.href.split('#')[0] + '#' + linkButton.getAttribute('data-wpa-link'), linkButton.parentElement.querySelector('.bib-copy-status'));
      }
    });
  }

  function boot() {
    replaceText();
    syncWorkingIndex();
    syncPapersPage();
    syncBibliography();
  }

  bindCopy();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 150);
  window.setTimeout(boot, 700);
  window.setTimeout(boot, 1800);
})();

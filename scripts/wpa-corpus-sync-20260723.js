/* WPA public corpus synchronisation - WP-013 + PN-004 - 23 July 2026 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_SYNC_20260723_V2) return;
  window.WPA_CORPUS_SYNC_20260723_V2 = true;

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
    doi: '',
    url: 'https://zenodo.org/search?q=%22MetLife%202026%3A%20Asymmetric%20Ceremonial%20Rupture%22',
    meta: 'Version v1.10 · Bilingual MK / EN · Published 21 July 2026 · Author-Reviewed Final Release',
    desc: 'A bilingual protocol note examining the medal-and-trophy ceremony after the 2026 FIFA World Cup Final through asymmetric ceremonial visibility, role-transition threshold, sovereignty of the victory frame, ceremonial greeting-lag, algorithmic micro-framing and VIP-suite diplomacy.'
  };

  function qsa(selector, root) { try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); } catch (e) { return []; } }
  function txt(node) { return String(node && node.textContent || '').replace(/\s+/g, ' ').trim(); }
  function recordUrl(p) { return p.doi ? 'https://doi.org/' + p.doi : p.url; }
  function doiLabel(p) { return p.doi || 'Zenodo record'; }

  function replaceText() {
    if (!document.body) return;
    var reps = [
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
      [/Twelve WPA Working Papers/g, 'Thirteen WPA Working Papers'],
      [/Дванаесетте WPA Working Papers/g, 'Тринаесетте WPA Working Papers'],
      [/Three applied protocolometry records/g, 'Four applied protocolometry records'],
      [/15 total WPA Zenodo DOI records/gi, '18 total WPA Zenodo records'],
      [/15 Total Zenodo DOI Records/g, '18 Total Zenodo Records'],
      [/fifteen public DOI records/gi, 'eighteen public Zenodo records'],
      [/All fifteen records/gi, 'All eighteen records'],
      [/12 Zenodo DOI записи/g, '13 Zenodo DOI записи'],
      [/12 Zenodo records/g, '13 Zenodo DOI records'],
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
      reps.forEach(function (r) { value = value.replace(r[0], r[1]); });
      node.nodeValue = value;
    }
  }

  function researchCard(p, id, className) {
    var a = document.createElement('article');
    a.id = id;
    a.className = className || 'paper-card';
    a.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + p.code + '</div><h3 class="paper-title-mk">' + p.mk + '</h3><div class="paper-title-en">' + p.en + '</div></div><span class="paper-type">' + (p.kind === 'PN' ? 'WPA Protocol Note · Latest Release' : 'India–North Macedonia / Official Visit Case Study') + '</span></div><div class="paper-meta">' + p.meta + '</div><p class="paper-desc">' + p.desc + '</p><div class="doi-row"><a class="doi" data-record-link="' + p.code + '" href="' + recordUrl(p) + '" target="_blank" rel="noopener">' + doiLabel(p) + '</a><a class="btn btn-gold" data-record-link="' + p.code + '" href="' + recordUrl(p) + '" target="_blank" rel="noopener">Files available on Zenodo</a><button class="btn btn-ghost" type="button" data-copy-record="' + p.code + '">Copy citation</button></div>';
    return a;
  }

  function syncWorkingIndex() {
    var grid = document.getElementById('papersGrid');
    if (!grid) return;
    var pnDivider = qsa('.series-divider', grid).filter(function (x) { return /Protocol Notes/i.test(txt(x)); })[0];
    if (!document.getElementById('wp013')) {
      var wp = researchCard(WP013, 'wp013', 'paper-card latest-record');
      if (pnDivider) grid.insertBefore(wp, pnDivider); else grid.appendChild(wp);
    }
    if (!document.getElementById('pn004')) {
      var pn = researchCard(PN004, 'pn004', 'paper-card latest-record');
      grid.appendChild(pn);
    }
    if (pnDivider) pnDivider.firstChild.nodeValue = 'WPA Protocol Notes 001–004';
    var wpDivider = qsa('.series-divider', grid).filter(function (x) { return /Working Papers/i.test(txt(x)); })[0];
    if (wpDivider) wpDivider.firstChild.nodeValue = 'WPA Working Papers 001–013';
    var select = document.getElementById('paperSelect');
    if (select) {
      if (!qsa('option', select).some(function (o) { return o.value === '013'; })) {
        var o1 = document.createElement('option'); o1.value = '013'; o1.textContent = WP013.code + ' · ' + WP013.en; select.appendChild(o1);
      }
      if (!qsa('option', select).some(function (o) { return o.value === 'PN-004'; })) {
        var o2 = document.createElement('option'); o2.value = 'PN-004'; o2.textContent = PN004.code + ' · ' + PN004.en; select.appendChild(o2);
      }
    }
  }

  function simpleCard(p, id) {
    var card = document.createElement('article');
    card.className = 'card'; card.id = id;
    card.innerHTML = '<span class="small-kicker">' + p.code + ' · ' + (p.kind === 'PN' ? 'Applied Protocolometry Record' : 'Official Visit Protocolometry') + '</span><h4 class="paper-title">' + p.en + '</h4><p class="paper-summary">' + p.desc + '</p><div class="paper-tags"><span class="tag">' + (p.kind === 'PN' ? 'Protocol Note' : 'Working Paper') + '</span><span class="tag">Protocolometry</span><span class="tag">Visual Statecraft</span></div><div class="paper-actions"><a class="btn btn-secondary" data-record-link="' + p.code + '" href="' + recordUrl(p) + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    return card;
  }

  function syncPapersPage() {
    var working = document.getElementById('wpa-working-papers') || qsa('section').filter(function (s) { return /WPA Working Papers/i.test(txt(s).slice(0, 500)); })[0];
    if (working && !document.getElementById('wpaWp013PapersCard')) {
      var wg = working.querySelector('.grid-3') || working.querySelector('.grid');
      if (wg) wg.appendChild(simpleCard(WP013, 'wpaWp013PapersCard'));
    }
    var notes = document.getElementById('wpa-protocol-notes') || qsa('section').filter(function (s) { return /WPA Protocol Notes/i.test(txt(s).slice(0, 500)); })[0];
    if (notes && !document.getElementById('wpaPn004PapersCard')) {
      var ng = notes.querySelector('.grid-3') || notes.querySelector('.grid');
      if (ng) ng.appendChild(simpleCard(PN004, 'wpaPn004PapersCard'));
    }
  }

  function bibCard(p, id) {
    var card = document.createElement('div');
    card.className = 'bib-entry'; card.id = id;
    card.setAttribute('data-doi', p.doi || '');
    card.setAttribute('data-index', 'doi zenodo');
    card.setAttribute('data-search', (p.code + ' ' + p.mk + ' ' + p.en + ' protocolometry zenodo').toLowerCase());
    card.setAttribute('data-title', p.mk);
    card.setAttribute('data-type', p.kind === 'PN' ? 'protocol-note' : 'working-paper');
    card.setAttribute('data-year', '2026');
    card.innerHTML = '<div class="bib-num">' + (p.kind === 'PN' ? p.code : 'WP-013') + '</div><div class="bib-mk">' + p.mk + '</div><div class="bib-en">' + p.en + '</div><div class="bib-meta"><strong>2026</strong> · ' + (p.kind === 'PN' ? 'WPA Protocol Note No. 004 · v1.10' : 'WPA Working Paper · v14 · 29 стр.') + '<br><a class="bib-link" data-record-link="' + p.code + '" href="' + recordUrl(p) + '" target="_blank" rel="noopener">' + doiLabel(p) + '</a></div><div class="bib-tags"><span class="bib-tag">' + (p.kind === 'PN' ? 'Protocol Note' : 'Working Paper') + '</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag blue">Protocolometry</span></div><div class="bib-links"><a class="bib-link-btn" data-record-link="' + p.code + '" href="' + recordUrl(p) + '" target="_blank" rel="noopener">Zenodo record →</a></div><div class="bib-entry-tools"><button class="bib-mini-btn cite-btn" type="button">Copy APA Citation</button><button class="bib-mini-btn link-btn" type="button">Copy Deep Link</button><span class="bib-copy-status" aria-live="polite"></span></div>';
    return card;
  }

  function headingByText(pattern) { return qsa('.part-heading,h2,h3').filter(function (h) { return pattern.test(txt(h)); })[0]; }
  function syncBibliography() {
    var prep = headingByText(/Публикации во подготовка/i);
    if (prep && !document.getElementById('wpaBibWp013')) prep.parentNode.insertBefore(bibCard(WP013, 'wpaBibWp013'), prep);
    var programme = headingByText(/VI\. WPA Истражувачка програма/i);
    if (programme && !document.getElementById('wpaBibPn004')) programme.parentNode.insertBefore(bibCard(PN004, 'wpaBibPn004'), programme);
  }

  function updateRecordLinks(p) {
    qsa('[data-record-link="' + p.code + '"]').forEach(function (a) {
      a.href = recordUrl(p);
      if (a.classList.contains('doi') || a.classList.contains('bib-link')) a.textContent = doiLabel(p);
    });
    var bib = document.getElementById('wpaBibPn004');
    if (bib && p.doi) bib.setAttribute('data-doi', p.doi);
  }

  function resolvePn004() {
    var q = encodeURIComponent('metadata.title:"' + PN004.en + '"');
    fetch('https://zenodo.org/api/records?q=' + q + '&size=10&sort=newest')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('Zenodo API')); })
      .then(function (data) {
        var hits = data && data.hits && data.hits.hits || [];
        var hit = hits.filter(function (h) { return h.metadata && h.metadata.title === PN004.en; })[0] || hits[0];
        var doi = hit && ((hit.pids && hit.pids.doi && hit.pids.doi.identifier) || hit.doi);
        if (doi) { PN004.doi = doi; PN004.url = 'https://doi.org/' + doi; updateRecordLinks(PN004); }
      }).catch(function () { /* The visible Zenodo search link remains available. */ });
  }

  function bindCopy() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-copy-record]');
      if (!b || !navigator.clipboard) return;
      var p = b.getAttribute('data-copy-record') === WP013.code ? WP013 : PN004;
      navigator.clipboard.writeText('Smiljanov, S. (2026). ' + p.en + '. ' + p.code + '. World Protocol Academy. ' + recordUrl(p));
    });
  }

  function boot() {
    replaceText();
    syncWorkingIndex();
    syncPapersPage();
    syncBibliography();
    updateRecordLinks(WP013);
    updateRecordLinks(PN004);
  }

  bindCopy();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  window.setTimeout(boot, 250);
  window.setTimeout(boot, 1000);
  window.setTimeout(boot, 2500);
  resolvePn004();
  if (window.MutationObserver) {
    var observer = new MutationObserver(function () { window.clearTimeout(observer._t); observer._t = window.setTimeout(boot, 80); });
    if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

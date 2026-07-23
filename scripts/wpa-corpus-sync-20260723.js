/* WPA public corpus synchronisation - 23 July 2026 */
(function () {
  'use strict';
  if (window.WPA_CORPUS_SYNC_20260723) return;
  window.WPA_CORPUS_SYNC_20260723 = true;

  var WP013 = {
    code: 'WPA-WP-2026-013',
    mk: 'Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија',
    en: 'Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia',
    doi: '10.5281/zenodo.21514266',
    meta: 'Version v14 · Bilingual MK / EN · Published 23 July 2026 · 29 pages · Final Domain, Contact and DOI Lock Edition',
    desc: 'A source-disciplined protocolometric analysis of the first visit by a President of India to North Macedonia, covering ceremonial sequencing, commemorative diplomacy, institutional meetings, gastrodiplomacy, Ohrid cultural diplomacy and the closing airport protocol.'
  };

  function qsa(s, root) { try { return Array.prototype.slice.call((root || document).querySelectorAll(s)); } catch (e) { return []; } }
  function text(node) { return String(node && node.textContent || '').replace(/\s+/g, ' ').trim(); }
  function replaceEverywhere() {
    if (!document.body) return;
    var replacements = [
      [/Working Papers 001[–-]012/g, 'Working Papers 001–013'],
      [/WPA Working Papers 001[–-]012/g, 'WPA Working Papers 001–013'],
      [/twelve Working Papers and three Protocol Notes/gi, 'thirteen Working Papers and three Protocol Notes'],
      [/12 Working Papers \+ 3 Protocol Notes/g, '13 Working Papers + 3 Protocol Notes'],
      [/12 WPA Working Papers/g, '13 WPA Working Papers'],
      [/Twelve WPA Working Papers/gi, 'Thirteen WPA Working Papers'],
      [/Дванаесетте WPA Working Papers/g, 'Тринаесетте WPA Working Papers'],
      [/15 Total Zenodo DOI Records/g, '18 Total Zenodo Records'],
      [/15 total WPA Zenodo DOI records/gi, '18 total WPA Zenodo records'],
      [/fifteen public DOI records/gi, 'eighteen public Zenodo records'],
      [/All fifteen records/gi, 'All eighteen records'],
      [/12 Zenodo records/g, '13 Zenodo DOI records'],
      [/12\/12/g, '13/13'],
      [/001[–-]012/g, '001–013'],
      [/Последно ажурирано: 16 јули 2026/g, 'Последно ажурирано: 23 јули 2026'],
      [/Last updated: 16 July 2026/g, 'Last updated: 23 July 2026'],
      [/worldprotocolacademy-code\.github\.io/g, 'worldprotocolacademy.mk'],
      [/worldprotocolacademy@gmail\.com/g, 'info@worldprotocolacademy.mk'],
      [/World Protocol Academy · Institute for Protocol, Diplomacy, Public Communication & Security Studies/g, 'World Protocol Academy · Independent Digital Educational, Research and Authorial Platform'],
      [/World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication and Security Studies/g, 'World Protocol Academy — Independent Digital Educational, Research and Authorial Platform'],
      [/Светска академија за протокол — Институт за протокол, дипломатија, јавна комуникација и безбедносни студии/g, 'Светска академија за протокол — независна дигитална образовна, истражувачка и авторска платформа']
    ];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && /^(SCRIPT|STYLE|TEXTAREA)$/i.test(node.parentElement.tagName)) continue;
      var value = node.nodeValue;
      replacements.forEach(function (r) { value = value.replace(r[0], r[1]); });
      node.nodeValue = value;
    }
    qsa('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      href = href.replace(/https:\/\/worldprotocolacademy-code\.github\.io\/?/g, 'https://worldprotocolacademy.mk/');
      href = href.replace(/mailto:worldprotocolacademy@gmail\.com/gi, 'mailto:info@worldprotocolacademy.mk');
      a.setAttribute('href', href);
    });
    qsa('link[rel="canonical"],meta[property="og:url"]').forEach(function (el) {
      var attr = el.tagName === 'LINK' ? 'href' : 'content';
      var value = el.getAttribute(attr) || '';
      el.setAttribute(attr, value.replace(/https:\/\/worldprotocolacademy-code\.github\.io/g, 'https://worldprotocolacademy.mk'));
    });
  }

  function wp013Card(className) {
    var article = document.createElement('article');
    article.id = 'wp013';
    article.className = className || 'paper-card latest-record';
    article.innerHTML = '<div class="paper-top"><div><div class="paper-id">' + WP013.code + '</div><h3 class="paper-title-mk">' + WP013.mk + '</h3><div class="paper-title-en">' + WP013.en + '</div></div><span class="paper-type">India–North Macedonia / Official Visit Case Study</span></div><div class="paper-meta">' + WP013.meta + '</div><p class="paper-desc">' + WP013.desc + '</p><div class="doi-row"><a class="doi" href="https://doi.org/' + WP013.doi + '" target="_blank" rel="noopener">' + WP013.doi + '</a><a class="btn btn-gold" href="https://doi.org/' + WP013.doi + '" target="_blank" rel="noopener">Files available on Zenodo</a><button class="btn btn-ghost" type="button" data-wpa-copy-wp013>Copy citation</button></div>';
    return article;
  }

  function syncWorkingPapersIndex() {
    var grid = document.getElementById('papersGrid');
    if (!grid || document.getElementById('wp013')) return;
    var divider = qsa('.series-divider', grid).filter(function (x) { return /Protocol Notes/i.test(text(x)); })[0];
    var card = wp013Card('paper-card latest-record');
    if (divider) grid.insertBefore(card, divider); else grid.appendChild(card);
    var select = document.getElementById('paperSelect');
    if (select && !qsa('option', select).some(function (o) { return o.value === '013'; })) {
      var option = document.createElement('option'); option.value = '013'; option.textContent = WP013.code + ' · ' + WP013.en; select.appendChild(option);
    }
  }

  function syncPapersPage() {
    var working = document.getElementById('wpa-working-papers') || qsa('section').filter(function (s) { return /WPA Working Papers/i.test(text(s).slice(0, 300)); })[0];
    if (!working || document.getElementById('wpaWp013PapersCard')) return;
    var grid = working.querySelector('.grid-3') || working.querySelector('.grid');
    if (!grid) return;
    var card = document.createElement('article');
    card.className = 'card'; card.id = 'wpaWp013PapersCard';
    card.innerHTML = '<span class="small-kicker">WPA-WP-013 · Official Visit Protocolometry</span><h4 class="paper-title">' + WP013.en + '</h4><p class="paper-summary">' + WP013.desc + '</p><div class="paper-tags"><span class="tag">Protocolometry</span><span class="tag">India–North Macedonia</span><span class="tag">Ceremonial Architecture</span></div><div class="paper-actions"><a class="btn btn-secondary" href="https://doi.org/' + WP013.doi + '" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    grid.appendChild(card);
  }

  function syncBibliography() {
    var heading = qsa('h2,h3').filter(function (h) { return /WPA Working Papers/i.test(text(h)); })[0];
    if (!heading || document.getElementById('wpaBibWp013')) return;
    var section = heading.closest('section') || heading.parentElement;
    var host = section && (section.querySelector('.pub-list') || section.querySelector('.grid') || section);
    if (!host) return;
    var card = document.createElement('article');
    card.id = 'wpaBibWp013'; card.className = 'pub-card card';
    card.innerHTML = '<div class="pub-number">WP-013</div><h3>' + WP013.mk + '</h3><p><em>' + WP013.en + '</em></p><p>2026 · Working Paper · v14 · 29 стр. · DOI <a href="https://doi.org/' + WP013.doi + '" target="_blank" rel="noopener">' + WP013.doi + '</a></p>';
    host.appendChild(card);
  }

  function addAdditionalRecordsNote() {
    if (!document.body || document.getElementById('wpaAdditionalZenodoRecords')) return;
    var target = qsa('.intro-box,.hero-content,.section-header').filter(function (x) { return /Zenodo|Working Papers/i.test(text(x)); })[0];
    if (!target) return;
    var note = document.createElement('p');
    note.id = 'wpaAdditionalZenodoRecords';
    note.innerHTML = '<strong>Additional WPA Zenodo records:</strong> World Protocol Academy — Global Strategic Plan 2026; MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test. Together with 13 Working Papers and 3 Protocol Notes, the public WPA Zenodo corpus contains 18 records.';
    target.appendChild(note);
  }

  function bindCopy() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-wpa-copy-wp013]');
      if (!b || !navigator.clipboard) return;
      navigator.clipboard.writeText('Smiljanov, S. (2026). ' + WP013.en + '. WPA Working Papers, WPA-WP-2026-013, v14. World Protocol Academy. https://doi.org/' + WP013.doi);
    });
  }

  function boot() {
    replaceEverywhere();
    syncWorkingPapersIndex();
    syncPapersPage();
    syncBibliography();
    addAdditionalRecordsNote();
  }

  bindCopy();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  window.setTimeout(boot, 300);
  window.setTimeout(boot, 1200);
})();

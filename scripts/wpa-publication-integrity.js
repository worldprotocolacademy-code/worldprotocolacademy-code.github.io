/* WPA Package 1 — publication integrity only · 2026-07-14 */
(function () {
  'use strict';

  var pathname = String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();

  function isInstitute() {
    return page === 'institute' || pathname.toLowerCase() === '/institute.html';
  }

  function isPapers() {
    return pathname.toLowerCase() === '/papers.html';
  }

  function replaceTextIn(root, replacements) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var value = node.nodeValue;
      replacements.forEach(function (pair) {
        value = value.split(pair[0]).join(pair[1]);
      });
      node.nodeValue = value;
    });
  }

  function patchInstitute() {
    replaceTextIn(document.body, [
      ['WPA Working Papers 001–009', 'WPA Working Papers 001–012'],
      ['WPA работните трудови 001–009 се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003, WP-004, WP-005, WP-006, WP-007, WP-008 и WP-009.', 'WPA работните трудови 001–012 се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003, WP-004, WP-005, WP-006, WP-007, WP-008, WP-009, WP-010, WP-011 и WP-012.'],
      ['WPA работни трудови 001–004', 'WPA работни трудови 001–012'],
      ['Првите четири WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003 и WP-004.', 'Дванаесет WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001–WP-012.'],
      ['WPA Working Papers 001–004', 'WPA Working Papers 001–012'],
      ['The first four WPA Working Papers are published as public Zenodo DOI records: WP-001, WP-002, WP-003 and WP-004.', 'Twelve WPA Working Papers are published as public Zenodo DOI records: WP-001–WP-012.']
    ]);
  }

  function removeDeveloperNote() {
    var cards = document.querySelectorAll('.note-card');
    Array.prototype.forEach.call(cards, function (card) {
      var heading = card.querySelector('h4');
      if (heading && heading.textContent.trim() === 'Important implementation note') {
        var section = card.closest('section');
        if (section) section.remove(); else card.remove();
      }
    });
  }

  function addWp012Card() {
    if (document.querySelector('[data-wpa-wp="012"]')) return;
    var section = document.getElementById('wpa-working-papers');
    if (!section) return;
    var grid = section.querySelector('.grid-3');
    if (!grid) return;

    var article = document.createElement('article');
    article.className = 'card';
    article.setAttribute('data-wpa-wp', '012');
    article.innerHTML = '<span class="small-kicker">WP-012 · NATO Summit / Protocolometric Case Study</span>' +
      '<h4 class="paper-title">Ankara 2026: The Sealed Stage — Protocol, Documentary Sovereignty and Visibility Gatekeeping at the 36th NATO Summit</h4>' +
      '<p class="paper-summary">Bilingual MK/EN · v2.5 Final Deposit Lock / QA-Audited Edition · Evidence Ladder+ · PSPI+ · Host Lens Sovereignty · Protocol Afterlife.</p>' +
      '<div class="paper-tags"><span class="tag">NATO Summit</span><span class="tag">PSPI+</span><span class="tag">Sealed Stage</span></div>' +
      '<div class="paper-actions"><a class="btn btn-secondary" href="https://doi.org/10.5281/zenodo.21299485" target="_blank" rel="noopener">→ Zenodo DOI</a></div>';
    grid.appendChild(article);
  }

  function patchPapers() {
    replaceTextIn(document.body, [
      ['19 papers • 11 WPA Working Papers • 2 Protocol Notes', '19 papers • 12 WPA Working Papers • 2 Protocol Notes'],
      ['11 WPA Working Papers', '12 WPA Working Papers'],
      ['Eleven WPA Working Papers', 'Twelve WPA Working Papers'],
      ['across eleven working papers', 'across twelve working papers']
    ]);
    removeDeveloperNote();
    addWp012Card();
  }

  function boot() {
    if (isInstitute()) patchInstitute();
    if (isPapers()) patchPapers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

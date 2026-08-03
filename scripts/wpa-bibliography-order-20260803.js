/* WPA bibliography order fix - 2026-08-03 */
(function () {
  'use strict';

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findEntry(pattern) {
    var entries = document.querySelectorAll('.bib-entry');
    for (var i = 0; i < entries.length; i += 1) {
      if (pattern.test(text(entries[i]) + ' ' + String(entries[i].getAttribute('data-doi') || ''))) return entries[i];
    }
    return null;
  }

  function apply() {
    var p = path();
    if (p !== '/bibliography' && p !== '/bibliography/index.html') return;

    var pn008 = findEntry(/WPA-PN-008|Multi-Agent Diplomacy|21779849/i);
    var strategic = findEntry(/Global Strategic Plan 2026|Глобален стратешки план 2026|21675100|21396831/i);
    if (pn008 && strategic && pn008.parentNode === strategic.parentNode) {
      pn008.parentNode.insertBefore(strategic, pn008.nextSibling);
    }

    var nodes = document.querySelectorAll('.bib-entry, .research-domain, .programme-card, p, div');
    for (var i = 0; i < nodes.length; i += 1) {
      if (text(nodes[i]).indexOf('Digital Era (2023) · IMCSM26 (2026)') === 0) {
        nodes[i].textContent = 'Digital Era (2023) · IMCSM26 (2026) · PN-005 · PN-006 · PN-007 · PN-008';
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
  window.setTimeout(apply, 700);
  window.setTimeout(apply, 1800);
})();

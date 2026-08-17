/* WPA bibliography final order and visibility fix - 2026-08-17 */
(function () {
  'use strict';
  if (window.WPA_BIB_FINAL_ORDER_20260817) return;
  window.WPA_BIB_FINAL_ORDER_20260817 = true;

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function entries() {
    return Array.prototype.slice.call(document.querySelectorAll('.bib-entry'));
  }

  function findEntry(rx) {
    return entries().filter(function (node) {
      return rx.test(text(node) + ' ' + String(node.getAttribute('data-doi') || ''));
    })[0] || null;
  }

  function apply() {
    var p = path();
    if (p !== '/bibliography' && p !== '/bibliography/index.html') return;

    var book26 = document.getElementById('pub-26') || findEntry(/978-608-66168-5-4|69316613|Protocol of State Symbols/i);
    if (book26) {
      book26.hidden = false;
      book26.style.display = '';
      var num = book26.querySelector('.bib-num');
      if (num) num.textContent = '26';
      var dissertationHeading = document.getElementById('dissertation');
      if (dissertationHeading && dissertationHeading.parentNode && book26.parentNode === dissertationHeading.parentNode) {
        dissertationHeading.parentNode.insertBefore(book26, dissertationHeading);
      }
    }

    var pn009 = document.getElementById('pn-009') || findEntry(/WPA-PN-009|21933739|AI Transparency and the Protocol of Authorship/i);
    var strategic = findEntry(/Global Strategic Plan 2026|Глобален стратешки план 2026|21675100|21396831/i);
    var programmeHeading = document.getElementById('research-programme');

    if (pn009) {
      pn009.hidden = false;
      pn009.style.display = '';
      var doi = pn009.querySelector('a[href*="21933739"]');
      var scholar = pn009.querySelector('a[href*="scholar/wpa-pn-009"]');
      [doi, scholar].forEach(function (a) {
        if (!a) return;
        a.classList.add('wpa-gold-record-link');
      });
    }

    if (pn009 && strategic && pn009.parentNode === strategic.parentNode) {
      pn009.parentNode.insertBefore(strategic, pn009.nextSibling);
    }
    if (strategic && programmeHeading && strategic.parentNode === programmeHeading.parentNode) {
      programmeHeading.parentNode.insertBefore(strategic, programmeHeading);
    }

    if (!document.getElementById('wpa-bib-gold-record-style')) {
      var style = document.createElement('style');
      style.id = 'wpa-bib-gold-record-style';
      style.textContent = '.wpa-gold-record-link{display:inline-flex!important;align-items:center!important;padding:6px 11px!important;margin:2px 4px 2px 0!important;background:#c9a84c!important;color:#0d1f3c!important;border:1px solid #a8873a!important;border-radius:3px!important;text-decoration:none!important;font-weight:800!important}.wpa-gold-record-link:hover{background:#e8d49a!important;color:#0d1f3c!important;text-decoration:none!important}';
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();
  window.setTimeout(apply, 500);
  window.setTimeout(apply, 1200);
  window.setTimeout(apply, 2400);
})();

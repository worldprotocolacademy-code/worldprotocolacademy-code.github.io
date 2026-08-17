/* WPA homepage academic metrics sync - 2026-08-17 */
(function () {
  'use strict';
  if (window.WPA_HOME_METRICS_SYNC_20260817) return;
  window.WPA_HOME_METRICS_SYNC_20260817 = true;

  function txt(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function setTxt(node, value) {
    if (node && txt(node) !== value) node.textContent = value;
  }

  function isHome() {
    var p = String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    return p === '/' || p === '/index.html' || page === 'index';
  }

  function apply() {
    if (!document.body || !isHome()) return;

    document.querySelectorAll('.hero-stats > div').forEach(function (block) {
      var label = txt(block.querySelector('.stat-label'));
      var num = block.querySelector('.stat-num');
      if (/^Публикации$|^Publications$/i.test(label)) setTxt(num, '26');
    });

    document.querySelectorAll('.matrix-item').forEach(function (item) {
      var label = txt(item.querySelector('strong'));
      var value = item.querySelector('span');
      if (/^Публикации$|^Publications$/i.test(label)) {
        setTxt(value, '6 монографии · 1 дисертација · 19 трудови · 26 вкупно');
      }
    });

    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', 'World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies. Академски корпус: 26 публикации. Најнова WPA Protocol Note: WPA-PN-009, AI Transparency and the Protocol of Authorship, DOI 10.5281/zenodo.21933739. Нова книга 2026: Protocol of State Symbols, Anthems and National Days, ISBN 978-608-66168-5-4.');
    }

    var keywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      keywords.setAttribute('content', 'World Protocol Academy, protocol, diplomacy, state protocol, diplomatic protocol, protocolometry, AI transparency, AI authorship, provenance, HARP-6, EU AI Act, WPA-PN-009, state symbols, flags, anthems, national days, ISBN 978-608-66168-5-4, COBISS 69316613');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true }); else apply();
  window.setTimeout(apply, 700);
  window.setTimeout(apply, 1900);
})();

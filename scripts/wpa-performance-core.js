/* WPA interaction recovery, Journal Live entry points, contrast and corpus sync - 2026-07-24 */
(function () {
  'use strict';
  if (window.WPA_INTERACTION_RECOVERY_LOADED) return;
  window.WPA_INTERACTION_RECOVERY_LOADED = true;

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
  }

  function addScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function closeBlockingLayers() {
    if (!document.body) return;
    document.body.classList.remove('wpa-mobile-drawer-open', 'wpa-menu-open');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    qsa('#wpaMobileOverlayV12,#wpaMobileOverlayV13,#wpaMobileOverlayV14,.modal-backdrop,.wpa-overlay').forEach(function (node) {
      node.style.display = 'none';
      node.style.pointerEvents = 'none';
      node.setAttribute('aria-hidden', 'true');
    });
    qsa('#wpaMobileDrawerV12,#wpaMobileDrawerV13,#wpaMobileDrawerV14').forEach(function (node) {
      node.style.display = 'none';
      node.style.pointerEvents = 'none';
    });
  }

  function restoreControls() {
    qsa('a[href],button,input,select,textarea,summary,[role="button"]').forEach(function (node) {
      node.style.pointerEvents = 'auto';
    });
  }

  function installContrastFixes() {
    if (document.getElementById('wpa-contrast-fix-20260724-2')) return;
    var style = document.createElement('style');
    style.id = 'wpa-contrast-fix-20260724-2';
    style.textContent = [
      'html[data-wpa-page="index"] .cta-band .btn-actions .btn-ghost{color:#f8f4ee!important;border:1px solid rgba(232,212,154,.55)!important;}',
      'html[data-wpa-page="index"] .cta-band .btn-actions .btn-ghost:hover{color:#071326!important;background:#e8d49a!important;border-color:#e8d49a!important;}',
      'html[data-wpa-page="institute"] a.btn-ghost[href$="wpa_institutions_master_list_v1.0.csv"],',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="tools/wpa-five-engines.html"],',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="/tools/academic-search-hub/"],',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="/tools/wpa-watch/"],',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="/journal/watch/"]{color:var(--navy)!important;border-color:var(--navy)!important;}',
      'html[data-wpa-page="institute"] a.btn-ghost[href$="wpa_institutions_master_list_v1.0.csv"]:hover,',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="tools/wpa-five-engines.html"]:hover,',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="/tools/academic-search-hub/"]:hover,',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="/tools/wpa-watch/"]:hover,',
      'html[data-wpa-page="institute"] a.btn-ghost[href*="/journal/watch/"]:hover{background:var(--navy)!important;color:var(--cream)!important;border-color:var(--navy)!important;}',
      '.wpa-public-vs-input,.wpa-inst-vs-input{border:1px solid #d7c485!important;outline:none!important;box-shadow:none!important;caret-color:#7b5f1f!important;accent-color:#c9a84c!important;}',
      '.wpa-public-vs-input:focus,.wpa-public-vs-input:focus-visible,.wpa-inst-vs-input:focus,.wpa-inst-vs-input:focus-visible{border-color:#c9a84c!important;outline:2px solid rgba(201,168,76,.24)!important;outline-offset:1px!important;box-shadow:0 0 0 3px rgba(201,168,76,.12)!important;}',
      '.wpa-public-vs-input:invalid,.wpa-public-vs-input:user-invalid,.wpa-inst-vs-input:invalid,.wpa-inst-vs-input:user-invalid{border-color:#d7c485!important;box-shadow:none!important;}',
      '.wpa-public-vs-form:focus-within,.wpa-inst-vs-form:focus-within{border-top-color:#d7c485!important;box-shadow:none!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function installLanguageSelect() {
    qsa('select').forEach(function (select) {
      if (select.dataset.wpaRecoveryBound === '1') return;
      var id = String(select.id || '').toLowerCase();
      var aria = String(select.getAttribute('aria-label') || '').toLowerCase();
      if (id.indexOf('lang') === -1 && aria.indexOf('language') === -1 && aria.indexOf('јазик') === -1) return;
      select.dataset.wpaRecoveryBound = '1';
      select.addEventListener('change', function () { if (select.value) window.location.href = select.value; });
    });
  }

  function installAnchorFallback() {
    if (document.documentElement.dataset.wpaAnchorRecovery === '1') return;
    document.documentElement.dataset.wpaAnchorRecovery = '1';
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
      if (!anchor) return;
      var href = anchor.getAttribute('href') || '';
      if (!href || href === '#' || /^javascript:/i.test(href)) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.hasAttribute('download') || anchor.target === '_blank') return;
      var original = window.location.href;
      window.setTimeout(function () {
        if (window.location.href !== original) return;
        if (href.charAt(0) === '#') {
          var section = document.getElementById(href.slice(1));
          if (section && section.scrollIntoView) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else window.location.hash = href;
        } else window.location.href = anchor.href;
      }, 60);
    }, true);
  }

  function installMobileMenu() {
    var button = document.getElementById('mToggle');
    if (!button || button.dataset.wpaRecoveryBound === '1') return;
    button.dataset.wpaRecoveryBound = '1';
    function parts() { return { overlay: document.getElementById('wpaMobileOverlayV14'), drawer: document.getElementById('wpaMobileDrawerV14') }; }
    function setOpen(open) {
      var p = parts();
      document.body.classList.toggle('wpa-mobile-drawer-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? 'Затвори' : 'Мени';
      document.body.style.overflow = open ? 'hidden' : '';
      if (p.overlay) { p.overlay.style.display = open ? 'block' : 'none'; p.overlay.style.pointerEvents = open ? 'auto' : 'none'; }
      if (p.drawer) { p.drawer.style.display = open ? 'block' : 'none'; p.drawer.style.pointerEvents = open ? 'auto' : 'none'; }
    }
    button.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); setOpen(!document.body.classList.contains('wpa-mobile-drawer-open')); });
    document.addEventListener('click', function (event) {
      var p = parts();
      if (p.overlay && event.target === p.overlay) setOpen(false);
      if (p.drawer && p.drawer.contains(event.target) && event.target.closest && event.target.closest('a,button')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setOpen(false); });
  }

  function ensureJournalStyles() {
    if (document.getElementById('wpa-journal-live-entry-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-journal-live-entry-style';
    style.textContent = '.wpa-journal-live-entry{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;text-decoration:none!important;white-space:nowrap!important;font-weight:900!important;pointer-events:auto!important}.site-nav a.wpa-journal-live-entry{color:#9b7623!important;border:1px solid rgba(201,168,76,.48)!important;background:rgba(201,168,76,.10)!important;padding:5px 9px!important;border-radius:5px!important}.wpa-journal-live-pill{display:inline-flex!important;align-items:center!important;padding:8px 12px!important;border:1px solid rgba(212,166,74,.72)!important;border-radius:999px!important;background:rgba(212,166,74,.13)!important;color:#f0ca64!important;font-weight:800!important;text-decoration:none!important}@media(max-width:860px){.wpa-journal-live-entry,.wpa-journal-live-pill{white-space:normal!important;text-align:center!important}}';
    document.head.appendChild(style);
  }

  function makeJournalLink(id, className, label) {
    var link = document.createElement('a');
    link.id = id; link.href = '/journal/live/'; link.className = className;
    link.title = 'WPA Journal Live'; link.setAttribute('aria-label', 'WPA Journal Live'); link.textContent = label || 'WPA Journal Live';
    return link;
  }

  function installJournalLiveEntries() {
    ensureJournalStyles();
    var path = String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    var isHome = page === 'index' || path === '/' || path === '/index.html';
    var isInstitute = page === 'institute' || path === '/institute.html';
    var isJournal = path === '/journal' || path === '/journal/index.html';
    if (isHome) {
      var navList = document.querySelector('.site-nav ul');
      if (navList && !document.getElementById('wpaLiveHomeNavItem')) {
        var card = qsa('a[href*="wpa-card.html"]', navList)[0];
        var item = document.createElement('li'); item.id = 'wpaLiveHomeNavItem'; item.appendChild(makeJournalLink('wpaLiveHomeNavLink', 'wpa-journal-live-entry', 'WPA Journal Live'));
        if (card && card.closest('li')) card.closest('li').insertAdjacentElement('afterend', item); else navList.appendChild(item);
      }
    }
    if (isInstitute) {
      var nav = document.querySelector('.nav-links');
      if (nav && !document.getElementById('wpaLiveInstituteNavLink')) nav.appendChild(makeJournalLink('wpaLiveInstituteNavLink', 'wpa-journal-live-entry', 'WPA Journal Live'));
      var hero = document.querySelector('.hero-cta');
      if (hero && !document.getElementById('wpaLiveInstituteHeroLink')) hero.appendChild(makeJournalLink('wpaLiveInstituteHeroLink', 'btn btn-primary wpa-journal-live-entry', 'Отвори WPA Journal Live'));
    }
    if (isJournal) {
      var top = document.querySelector('.top .topin');
      if (top && !document.getElementById('wpaLiveJournalHeaderLink')) top.appendChild(makeJournalLink('wpaLiveJournalHeaderLink', 'wpa-journal-live-pill', 'Journal Live'));
      var journalNav = document.querySelector('nav.nav');
      if (journalNav && !document.getElementById('wpaLiveJournalNavLink')) journalNav.insertBefore(makeJournalLink('wpaLiveJournalNavLink', 'wpa-journal-live-pill', 'WPA Journal Live'), journalNav.firstChild);
    }
  }

  function boot() {
    closeBlockingLayers();
    restoreControls();
    installContrastFixes();
    installLanguageSelect();
    installAnchorFallback();
    installMobileMenu();
    installJournalLiveEntries();
    addScript('wpa-home-typography-20260724', '/scripts/wpa-home-typography-20260724.js?v=20260724-1');
    addScript('wpa-public-virtual-sande-recovery-20260724', '/scripts/virtual-sande-public-widget.js?v=20260724-offline3');
    addScript('wpa-corpus-sync-20260723', '/scripts/wpa-corpus-sync-20260723.js?v=20260723-4');
    addScript('wpa-corpus-final-audit-20260723', '/scripts/wpa-corpus-final-audit-20260723.js?v=20260723-1');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  window.setTimeout(boot, 500);
  window.setTimeout(boot, 1500);
})();

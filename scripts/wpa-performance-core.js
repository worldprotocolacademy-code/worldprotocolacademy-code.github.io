/* WPA emergency interaction recovery + safe Journal Live entry points — 2026-07-12 */
(function () {
  'use strict';

  if (window.WPA_INTERACTION_RECOVERY_LOADED) return;
  window.WPA_INTERACTION_RECOVERY_LOADED = true;

  function qsa(selector, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
    catch (error) { return []; }
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

  function installLanguageSelect() {
    qsa('select').forEach(function (select) {
      if (select.dataset.wpaRecoveryBound === '1') return;
      var id = String(select.id || '').toLowerCase();
      var aria = String(select.getAttribute('aria-label') || '').toLowerCase();
      if (id.indexOf('lang') === -1 && aria.indexOf('language') === -1 && aria.indexOf('јазик') === -1) return;
      select.dataset.wpaRecoveryBound = '1';
      select.addEventListener('change', function () {
        if (select.value) window.location.href = select.value;
      });
    });
  }

  function installAnchorFallback() {
    if (document.documentElement.dataset.wpaAnchorRecovery === '1') return;
    document.documentElement.dataset.wpaAnchorRecovery = '1';

    document.addEventListener('click', function (event) {
      var target = event.target;
      var anchor = target && target.closest ? target.closest('a[href]') : null;
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
        } else {
          window.location.href = anchor.href;
        }
      }, 60);
    }, true);
  }

  function installMobileMenu() {
    var button = document.getElementById('mToggle');
    if (!button || button.dataset.wpaRecoveryBound === '1') return;
    button.dataset.wpaRecoveryBound = '1';

    function getParts() {
      return {
        overlay: document.getElementById('wpaMobileOverlayV14'),
        drawer: document.getElementById('wpaMobileDrawerV14')
      };
    }

    function setOpen(open) {
      var parts = getParts();
      document.body.classList.toggle('wpa-mobile-drawer-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? 'Затвори' : 'Мени';
      document.body.style.overflow = open ? 'hidden' : '';
      if (parts.overlay) {
        parts.overlay.style.display = open ? 'block' : 'none';
        parts.overlay.style.pointerEvents = open ? 'auto' : 'none';
      }
      if (parts.drawer) {
        parts.drawer.style.display = open ? 'block' : 'none';
        parts.drawer.style.pointerEvents = open ? 'auto' : 'none';
      }
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!document.body.classList.contains('wpa-mobile-drawer-open'));
    });

    document.addEventListener('click', function (event) {
      var parts = getParts();
      if (parts.overlay && event.target === parts.overlay) setOpen(false);
      if (parts.drawer && parts.drawer.contains(event.target) && event.target.closest && event.target.closest('a,button')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function ensureJournalStyles() {
    if (document.getElementById('wpa-journal-live-entry-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-journal-live-entry-style';
    style.textContent = [
      '.wpa-journal-live-entry{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;text-decoration:none!important;white-space:nowrap!important;font-weight:900!important;pointer-events:auto!important;}',
      '.site-nav a.wpa-journal-live-entry{color:#9b7623!important;border:1px solid rgba(201,168,76,.48)!important;background:rgba(201,168,76,.10)!important;padding:5px 9px!important;border-radius:5px!important;}',
      '.site-nav a.wpa-journal-live-entry:hover{color:#071326!important;background:#e8d49a!important;border-color:#c9a84c!important;}',
      '.topbar-icon-btn.wpa-journal-live-entry{background:rgba(201,168,76,.14)!important;border-color:rgba(201,168,76,.72)!important;}',
      '.nav-links a.wpa-journal-live-entry{color:#f4e8c1!important;border-color:rgba(201,168,76,.62)!important;background:rgba(201,168,76,.10)!important;}',
      '.nav-links a.wpa-journal-live-entry:hover{color:#071326!important;background:#e8d49a!important;}',
      '.wpa-journal-live-pill{display:inline-flex!important;align-items:center!important;gap:6px!important;padding:8px 12px!important;border:1px solid rgba(212,166,74,.72)!important;border-radius:999px!important;background:rgba(212,166,74,.13)!important;color:#f0ca64!important;font:800 12px/1.2 Inter,Segoe UI,Arial,sans-serif!important;text-decoration:none!important;}',
      '.wpa-journal-live-pill:hover{background:#d4a64a!important;color:#111!important;}',
      '@media(max-width:860px){.wpa-journal-live-entry,.wpa-journal-live-pill{white-space:normal!important;text-align:center!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function makeJournalLink(id, className, label) {
    var link = document.createElement('a');
    link.id = id;
    link.href = '/journal/live/';
    link.className = className;
    link.title = 'WPA Journal Live';
    link.setAttribute('aria-label', 'WPA Journal Live');
    link.textContent = label || '🛰️ WPA Journal Live';
    return link;
  }

  function isJournalLiveLink(anchor) {
    if (!anchor) return false;
    var href = String(anchor.getAttribute('href') || '');
    return /\/journal\/live\/?(?:$|[?#])/i.test(href);
  }

  function installHomeJournalEntry() {
    var navList = document.querySelector('.site-nav ul');
    if (!navList) return;

    var anchors = qsa('a[href]', navList);
    var cardLink = null;
    var journalLink = null;

    anchors.forEach(function (anchor) {
      var href = String(anchor.getAttribute('href') || '').toLowerCase();
      var label = String(anchor.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!cardLink && (href.indexOf('wpa-card.html') !== -1 || label === 'wpa card')) cardLink = anchor;
      if (!journalLink && isJournalLiveLink(anchor)) journalLink = anchor;
    });

    if (!cardLink) return;
    if (!journalLink) journalLink = makeJournalLink('wpaLiveHomeNavLink', 'wpa-journal-live-entry', '🛰️ WPA Journal Live');
    else {
      journalLink.id = 'wpaLiveHomeNavLink';
      journalLink.classList.add('wpa-journal-live-entry');
      journalLink.textContent = '🛰️ WPA Journal Live';
    }

    var journalItem = journalLink.closest ? journalLink.closest('li') : null;
    if (!journalItem) {
      journalItem = document.createElement('li');
      journalItem.id = 'wpaLiveHomeNavItem';
      journalItem.appendChild(journalLink);
    } else {
      journalItem.id = 'wpaLiveHomeNavItem';
    }

    var cardItem = cardLink.closest ? cardLink.closest('li') : cardLink;
    if (cardItem && cardItem.nextElementSibling !== journalItem) cardItem.insertAdjacentElement('afterend', journalItem);

    var oldAnnounce = document.getElementById('wpaJournalLiveAnnounce');
    if (oldAnnounce) oldAnnounce.remove();
  }

  function installInstituteJournalEntries() {
    var topbar = document.querySelector('.topbar-quicklinks');
    if (topbar && !document.getElementById('wpaLiveInstituteTopLink')) {
      topbar.appendChild(makeJournalLink('wpaLiveInstituteTopLink', 'topbar-icon-btn wpa-journal-live-entry', '🛰️ Journal Live'));
    }

    var nav = document.querySelector('.nav-links');
    if (nav && !document.getElementById('wpaLiveInstituteNavLink')) {
      var navLink = makeJournalLink('wpaLiveInstituteNavLink', 'wpa-journal-live-entry', '🛰️ WPA Journal Live');
      var journalAnchor = null;
      qsa('a[href]', nav).some(function (anchor) {
        var href = String(anchor.getAttribute('href') || '').toLowerCase();
        var label = String(anchor.textContent || '').toLowerCase();
        if (href.indexOf('journal/index.html') !== -1 || label.indexOf('wpa journal') !== -1) {
          journalAnchor = anchor;
          return true;
        }
        return false;
      });
      if (journalAnchor) journalAnchor.insertAdjacentElement('beforebegin', navLink);
      else nav.appendChild(navLink);
    }

    var hero = document.querySelector('.hero-cta');
    if (hero && !document.getElementById('wpaLiveInstituteHeroLink')) {
      hero.appendChild(makeJournalLink('wpaLiveInstituteHeroLink', 'btn btn-primary wpa-journal-live-entry', '🛰️ Отвори WPA Journal Live'));
    }
  }

  function installJournalPageEntries() {
    var topin = document.querySelector('.top .topin');
    if (topin && !document.getElementById('wpaLiveJournalHeaderLink')) {
      var headerLink = makeJournalLink('wpaLiveJournalHeaderLink', 'wpa-journal-live-pill', '🛰️ Journal Live');
      var phase = topin.querySelector('.phase');
      if (phase) phase.insertAdjacentElement('beforebegin', headerLink);
      else topin.appendChild(headerLink);
    }

    var nav = document.querySelector('nav.nav');
    if (nav && !document.getElementById('wpaLiveJournalNavLink')) {
      nav.insertBefore(makeJournalLink('wpaLiveJournalNavLink', 'wpa-journal-live-pill', '🛰️ WPA Journal Live'), nav.firstChild);
    }

    var actions = document.querySelector('.hero .actions');
    if (actions && !document.getElementById('wpaLiveJournalHeroLink')) {
      actions.insertBefore(makeJournalLink('wpaLiveJournalHeroLink', 'btn primary wpa-journal-live-entry', '🛰️ Open WPA Journal Live'), actions.firstChild);
    }
  }

  function installJournalLiveEntries() {
    ensureJournalStyles();
    var path = String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    var isHome = page === 'index' || path === '/' || path === '/index.html';
    var isInstitute = page === 'institute' || path === '/institute.html';
    var isJournal = path === '/journal' || path === '/journal/index.html';

    if (isHome) installHomeJournalEntry();
    if (isInstitute) installInstituteJournalEntries();
    if (isJournal) installJournalPageEntries();
  }

  function boot() {
    closeBlockingLayers();
    restoreControls();
    installLanguageSelect();
    installAnchorFallback();
    installMobileMenu();
    installJournalLiveEntries();

    window.setTimeout(function () {
      closeBlockingLayers();
      restoreControls();
      installLanguageSelect();
      installMobileMenu();
      installJournalLiveEntries();
    }, 500);

    window.setTimeout(function () {
      restoreControls();
      installJournalLiveEntries();
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

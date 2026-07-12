/* WPA emergency interaction recovery — 2026-07-12 */
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

  function boot() {
    closeBlockingLayers();
    restoreControls();
    installLanguageSelect();
    installAnchorFallback();
    installMobileMenu();

    window.setTimeout(function () {
      closeBlockingLayers();
      restoreControls();
      installLanguageSelect();
      installMobileMenu();
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

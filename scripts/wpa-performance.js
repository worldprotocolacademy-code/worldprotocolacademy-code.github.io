/* WPA runtime loader — restrained Institute identity and contextual AI access */
(function () {
  'use strict';

  function path() {
    return String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function isInstitute() {
    return page() === 'institute' || path().toLowerCase() === '/institute.html';
  }

  function addStylesheet(id, href) {
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function addScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function shouldLoadPublicVirtualSande() {
    var p = path().toLowerCase();
    var exact = {
      '/programmes.html': true,
      '/certification.html': true,
      '/professional-english.html': true,
      '/institutional-diplomatic-track.html': true,
      '/protocol-professional-track.html': true,
      '/communication-presence-track.html': true,
      '/wpa-services.html': true,
      '/wpa-briefings.html': true,
      '/wpa-one-page-service-profile.html': true
    };
    if (exact[p]) return true;
    return p === '/working-papers' || p.indexOf('/working-papers/') === 0 ||
      p === '/journal' || p.indexOf('/journal/') === 0 ||
      p === '/bibliography' || p.indexOf('/bibliography/') === 0;
  }

  function ensureInstituteStyles() {
    if (document.getElementById('wpa-institute-tools-runtime-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-institute-tools-runtime-style';
    style.textContent = [
      'html[data-wpa-page="institute"] .wpa-institute-brand{cursor:default!important;text-decoration:none!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{overflow:hidden!important;border-radius:50%!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;}',
      'html[data-wpa-page="institute"] .wpa-institute-parent{display:block!important;white-space:nowrap!important;}',
      'html[data-wpa-page="institute"] .nav-links a[data-wpa-declutter-hidden="true"],html[data-wpa-page="institute"] .hero-cta a[data-wpa-declutter-hidden="true"],html[data-wpa-page="institute"] .jump-menu a[data-wpa-declutter-hidden="true"]{display:none!important;}',
      '@media(max-width:760px){html[data-wpa-page="institute"] .hero-cta a{width:100%!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function normalizeInstituteBrand() {
    var brand = document.querySelector('.nav-wrap nav .brand');
    if (!brand) return;
    brand.removeAttribute('href');
    brand.removeAttribute('target');
    brand.classList.add('wpa-institute-brand');
    brand.setAttribute('aria-label', 'World Protocol Academy Institute identity');

    var mark = brand.querySelector('.brand-mark');
    if (mark && !mark.querySelector('img')) {
      mark.textContent = '';
      var image = document.createElement('img');
      image.src = '/logo.webp';
      image.alt = 'World Protocol Academy logo';
      image.width = 72;
      image.height = 72;
      image.loading = 'eager';
      image.decoding = 'sync';
      mark.appendChild(image);
    }

    var text = brand.querySelector('.brand-text');
    if (text && !text.querySelector('.wpa-institute-title-row')) {
      text.innerHTML = '<span class="wpa-institute-title-row"><span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span><span class="wpa-institute-name-separator" aria-hidden="true">•</span><span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span></span><span class="wpa-institute-parent">Светска академија за протокол · World Protocol Academy</span>';
    }
  }

  function keepOnly(container, selectors) {
    if (!container) return;
    var links = container.querySelectorAll('a');
    for (var i = 0; i < links.length; i += 1) {
      var keep = false;
      for (var j = 0; j < selectors.length; j += 1) {
        if (links[i].matches(selectors[j])) {
          keep = true;
          break;
        }
      }
      if (!keep) links[i].setAttribute('data-wpa-declutter-hidden', 'true');
      else links[i].removeAttribute('data-wpa-declutter-hidden');
    }
  }

  function declutterInstitute() {
    keepOnly(document.querySelector('.nav-wrap .nav-links'), [
      'a[href="index.html"]',
      'a[href="#identity"]',
      'a[href="#charter"]',
      'a[href="#research-pillars"]',
      'a[href="#methodology"]',
      'a[href="#institute-publications"]',
      'a[href="#trust-corrections"]',
      'a[href="#cta"]'
    ]);

    keepOnly(document.querySelector('.hero .hero-cta'), [
      'a[href="#charter"]',
      'a[href="#research-pillars"]',
      'a[href="#institute-publications"]'
    ]);

    keepOnly(document.querySelector('.jump-menu'), [
      'a[href="#charter"]',
      'a[href="#research-pillars"]',
      'a[href="#analytics-centre"]',
      'a[href="#institute-publications"]',
      'a[href="#cta"]'
    ]);
  }

  function ensureVirtualSandeBrandingStyles() {
    if (document.getElementById('wpa-virtual-sande-branding-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-virtual-sande-branding-style';
    style.textContent = [
      '.wpa-virtual-sande-brand{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important;}',
      '.wpa-virtual-sande-mark{width:36px!important;height:36px!important;flex:0 0 36px!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important;background:#0d1f3c!important;border:1px solid rgba(201,168,76,.72)!important;box-shadow:0 4px 14px rgba(0,0,0,.22)!important;color:#e8d49a!important;font:800 9px/1 system-ui,sans-serif!important;letter-spacing:.04em!important;}',
      '.wpa-virtual-sande-mark img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;}',
      '.wpa-virtual-sande-copy{min-width:0!important;}',
      '@media(max-width:520px){.wpa-virtual-sande-mark{width:32px!important;height:32px!important;flex-basis:32px!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function brandVirtualSandeHeader(header, titleSelector) {
    if (!header || header.querySelector('.wpa-virtual-sande-mark')) return;
    var title = header.querySelector(titleSelector);
    if (!title) return;
    var copy = title.parentElement;
    if (!copy || !copy.parentNode) return;

    ensureVirtualSandeBrandingStyles();
    copy.classList.add('wpa-virtual-sande-copy');

    var brand = document.createElement('div');
    brand.className = 'wpa-virtual-sande-brand';
    brand.setAttribute('translate', 'no');
    brand.setAttribute('data-no-i18n', 'true');

    var mark = document.createElement('span');
    mark.className = 'wpa-virtual-sande-mark';
    mark.setAttribute('aria-label', 'World Protocol Academy');
    mark.textContent = 'WPA';

    var image = document.createElement('img');
    image.src = '/logo.webp';
    image.alt = 'World Protocol Academy logo';
    image.width = 36;
    image.height = 36;
    image.loading = 'eager';
    image.decoding = 'async';
    image.addEventListener('load', function () {
      mark.textContent = '';
      mark.appendChild(image);
    }, { once: true });
    image.addEventListener('error', function () {
      mark.textContent = 'WPA';
    }, { once: true });

    copy.parentNode.insertBefore(brand, copy);
    brand.appendChild(mark);
    brand.appendChild(copy);
  }

  function placeVirtualSandeBranding() {
    brandVirtualSandeHeader(document.querySelector('.bot-hd'), '.bot-title');
    brandVirtualSandeHeader(document.querySelector('.wpa2-bot-header'), '.wpa2-bot-title');
  }

  function boot() {
    if (isInstitute()) {
      ensureInstituteStyles();
      normalizeInstituteBrand();
      declutterInstitute();
    }
    placeVirtualSandeBranding();
  }

  if (isInstitute()) {
    addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260714-identity2');
    addScript('wpa-institute-virtual-sande-widget', '/scripts/virtual-sande-institute-widget.js?v=20260716-1');
  } else if (shouldLoadPublicVirtualSande()) {
    addScript('wpa-public-virtual-sande-widget', '/scripts/virtual-sande-public-widget.js?v=20260716-2');
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  window.setTimeout(boot, 250);
  window.setTimeout(boot, 1000);
  window.addEventListener('resize', boot);

  addScript('wpa-performance-core-runtime', '/scripts/wpa-performance-core.js?v=20260714-3');
})();

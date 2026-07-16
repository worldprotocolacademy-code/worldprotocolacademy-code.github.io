/* WPA runtime loader — Institute identity and tool placement */
(function () {
  'use strict';

  var PILOT_URL = '/data/global-institutions/pilot-20/v1.3.1/';
  var SUBLIMATE_URL = '/wpa-sublimate-engine.html';
  var JOURNAL_LIVE_URL = '/journal/live/';

  function path() {
    return String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function isInstitute() {
    return page() === 'institute' || path().toLowerCase() === '/institute.html';
  }

  function isHome() {
    return page() === 'index' || path() === '/' || path() === '/index.html';
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

  function makeLink(id, className, href, label, title) {
    var link = document.getElementById(id);
    if (!link) {
      link = document.createElement('a');
      link.id = id;
    }
    link.className = className;
    link.href = href;
    link.textContent = label;
    link.title = title || label;
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    return link;
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
      'html[data-wpa-page="institute"] .wpa-pilot20-institute-nav-link,html[data-wpa-page="institute"] .wpa-journal-live-entry,html[data-wpa-page="institute"] .wpa-sublimate-institute-nav-link{font-weight:600!important;border-color:transparent!important;background:transparent!important;}',
      'html[data-wpa-page="institute"] .wpa-sublimate-hero-button,html[data-wpa-page="institute"] #wpaLiveInstituteHeroLink{margin-left:0!important;}',
      '@media(max-width:760px){html[data-wpa-page="institute"] .wpa-sublimate-hero-button,html[data-wpa-page="institute"] #wpaLiveInstituteHeroLink{width:100%!important;}}'
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
    if (mark) {
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
    if (text) {
      text.innerHTML = '<span class="wpa-institute-title-row"><span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span><span class="wpa-institute-name-separator" aria-hidden="true">•</span><span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span></span><span class="wpa-institute-parent">Светска академија за протокол · World Protocol Academy</span>';
    }
  }

  function placeInstituteTools() {
    var nav = document.querySelector('.nav-wrap nav .nav-links');
    if (nav) {
      var tools = nav.querySelector('a[href="#wpa-public-tools-hub"]');
      var pilot = makeLink('wpaPilot20InstituteNav', 'wpa-pilot20-inline-link wpa-pilot20-institute-nav-link', PILOT_URL, 'Pilot 20', 'WPA Pilot 20');
      if (tools) tools.insertAdjacentElement('afterend', pilot); else nav.appendChild(pilot);

      var journalAnchor = nav.querySelector('a[href="journal/index.html"]');
      var journal = makeLink('wpaLiveInstituteNavLink', 'wpa-journal-live-entry', JOURNAL_LIVE_URL, 'Journal Live', 'WPA Journal Live');
      if (journalAnchor) nav.insertBefore(journal, journalAnchor); else nav.appendChild(journal);

      var opc = nav.querySelector('a[href="#opc-banner"]');
      var sublimate = makeLink('wpaSublimateInstituteNav', 'wpa-sublimate-institute-nav-link', SUBLIMATE_URL, 'WPA Sublimate', 'WPA Sublimate Engine Preview');
      if (opc) opc.insertAdjacentElement('afterend', sublimate); else nav.appendChild(sublimate);
    }

    var hero = document.querySelector('.hero .hero-cta');
    if (hero) {
      var protocolometry = hero.querySelector('a[href="/protocolometry-center.html"]');
      var pilotHero = makeLink('wpaPilot20InstituteHero', 'btn btn-primary wpa-pilot20-hero-button', PILOT_URL, 'Pilot 20', 'WPA Pilot 20');
      if (protocolometry) protocolometry.insertAdjacentElement('afterend', pilotHero); else hero.appendChild(pilotHero);

      var briefings = hero.querySelector('a[href="wpa-briefings.html"]');
      var subHero = makeLink('wpaSublimateInstituteHero', 'btn btn-primary wpa-sublimate-hero-button', SUBLIMATE_URL, 'Отвори WPA Sublimate', 'WPA Sublimate Engine Preview');
      var journalHero = makeLink('wpaLiveInstituteHeroLink', 'btn btn-primary wpa-journal-live-entry', JOURNAL_LIVE_URL, 'Отвори WPA Journal Live', 'WPA Journal Live');

      if (briefings) {
        briefings.insertAdjacentElement('afterend', subHero);
        subHero.insertAdjacentElement('afterend', journalHero);
      } else {
        hero.appendChild(subHero);
        hero.appendChild(journalHero);
      }
    }
  }

  function placeHomePilot() {
    var list = document.querySelector('header .site-nav ul');
    if (!list || document.getElementById('wpaPilot20HomeNav')) return;
    var item = document.createElement('li');
    item.id = 'wpaPilot20HomeNav';
    item.appendChild(makeLink('wpaPilot20HomeLink', 'wpa-pilot20-nav-link', PILOT_URL, 'Pilot 20', 'WPA Pilot 20'));
    list.appendChild(item);
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
      placeInstituteTools();
    }
    if (isHome()) placeHomePilot();
    placeVirtualSandeBranding();
  }

  if (isInstitute()) {
    addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260714-identity2');
    addScript('wpa-institute-virtual-sande-widget', '/scripts/virtual-sande-institute-widget.js?v=20260716-1');
  } else {
    addScript('wpa-public-virtual-sande-widget', '/scripts/virtual-sande-public-widget.js?v=20260716-1');
  }
  addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260714-3');

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  window.setTimeout(boot, 250);
  window.setTimeout(boot, 1000);
  window.addEventListener('resize', boot);

  addScript('wpa-performance-core-runtime', '/scripts/wpa-performance-core.js?v=20260714-3');
})();
/* WPA runtime loader: interaction recovery + deterministic page refinements */
(function () {
  'use strict';

  var PILOT_URL = '/data/global-institutions/pilot-20/v1.3.1/';
  var SUBLIMATE_URL = '/wpa-sublimate-engine.html';

  function pageName() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function normalizedPath() {
    return String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  }

  function isHome() {
    var path = normalizedPath();
    return pageName() === 'index' || path === '/' || path === '/index.html';
  }

  function isInstitute() {
    return pageName() === 'institute' || normalizedPath().toLowerCase() === '/institute.html';
  }

  function isMasterList() {
    return normalizedPath().toLowerCase() === '/wpa-global-institutions-master-list.html';
  }

  function isSocialBridgeSystem() {
    var path = normalizedPath().toLowerCase();
    return path === '/virtual-sande-ai.html' ||
      path.indexOf('/viral-sande-ai/') === 0 ||
      path.indexOf('/journal/live') === 0 ||
      path === '/tools/wpa-five-engines.html' ||
      path.indexOf('/tools/wpa-digital-pavilion') === 0 ||
      path === '/protocolometry-center.html' ||
      path === '/wpa-briefings.html';
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

  function createPilot20InlineLink(extraClass) {
    var link = document.createElement('a');
    link.className = 'wpa-pilot20-inline-link ' + (extraClass || '');
    link.href = PILOT_URL;
    link.title = 'WPA Pilot 20 — Final Consolidation v1.3.1';
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    link.textContent = 'P20✓ Pilot 20';
    return link;
  }

  function createPilot20NavItem() {
    var item = document.createElement('li');
    item.className = 'wpa-pilot20-nav-item wpa-pilot20-home-nav-item';
    item.appendChild(createPilot20InlineLink('wpa-pilot20-nav-link'));
    return item;
  }

  function createPilot20HeroButton() {
    var link = createPilot20InlineLink('btn btn-primary wpa-pilot20-hero-button');
    link.innerHTML = '<span aria-hidden="true">P20✓</span> Pilot 20';
    return link;
  }

  function createSublimateLink(className, label) {
    var link = document.createElement('a');
    link.className = className || '';
    link.href = SUBLIMATE_URL;
    link.title = 'WPA Sublimate Engine v0.3.0 — Preview';
    link.setAttribute('aria-label', 'Open WPA Sublimate Engine preview');
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    link.textContent = label || '◆ WPA Sublimate';
    return link;
  }

  function normalizeInstituteBrand() {
    if (!isInstitute()) return;

    var brand = document.querySelector('.nav-wrap nav .brand');
    if (!brand) return;

    /* This is an identity block, not a navigation link. */
    brand.removeAttribute('href');
    brand.removeAttribute('target');
    brand.removeAttribute('role');
    brand.classList.add('wpa-institute-brand');
    brand.setAttribute('aria-label', 'World Protocol Academy Institute identity');

    var mark = brand.querySelector('.brand-mark');
    if (mark) {
      mark.textContent = '';
      var logo = document.createElement('img');
      logo.src = '/logo.webp';
      logo.alt = 'World Protocol Academy logo';
      logo.width = 72;
      logo.height = 72;
      logo.loading = 'eager';
      logo.decoding = 'sync';
      mark.appendChild(logo);
    }

    var text = brand.querySelector('.brand-text');
    if (text) {
      text.innerHTML = '' +
        '<span class="wpa-institute-title-row">' +
          '<span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span>' +
          '<span class="wpa-institute-name-separator" aria-hidden="true">•</span>' +
          '<span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span>' +
        '</span>' +
        '<span class="wpa-institute-parent">Светска академија за протокол · World Protocol Academy</span>';
    }
  }

  function placeHomePilot20() {
    var list = document.querySelector('header .site-nav ul');
    if (list && !list.querySelector('.wpa-pilot20-nav-item')) list.appendChild(createPilot20NavItem());
  }

  function placeInstitutePilot20() {
    var nav = document.querySelector('.nav-wrap nav .nav-links');
    if (nav && !nav.querySelector('.wpa-pilot20-institute-nav-link')) {
      var tools = nav.querySelector('a[href="#wpa-public-tools-hub"]');
      var link = createPilot20InlineLink('wpa-pilot20-institute-nav-link');
      if (tools) tools.insertAdjacentElement('afterend', link);
      else nav.appendChild(link);
    }

    var hero = document.querySelector('.hero-cta');
    if (hero && !hero.querySelector('.wpa-pilot20-hero-button')) {
      var protocolometry = hero.querySelector('a[href="/protocolometry-center.html"]');
      var button = createPilot20HeroButton();
      if (protocolometry) protocolometry.insertAdjacentElement('afterend', button);
      else hero.appendChild(button);
    }
  }

  function placeInstituteSublimate() {
    var nav = document.querySelector('.nav-wrap .nav-links');
    if (nav && !nav.querySelector('.wpa-sublimate-institute-nav-link')) {
      var opc = nav.querySelector('a[href="#opc-banner"]');
      var navLink = createSublimateLink('wpa-sublimate-institute-nav-link', '◆ WPA Sublimate');
      if (opc) opc.insertAdjacentElement('afterend', navLink);
      else nav.appendChild(navLink);
    }

    var hero = document.querySelector('.hero-cta');
    if (hero && !hero.querySelector('.wpa-sublimate-hero-button')) {
      var journal = hero.querySelector('#wpaLiveInstituteHeroLink, a[href="/journal/live/"]');
      var heroLink = createSublimateLink('btn btn-primary wpa-sublimate-hero-button', '◆ Отвори WPA Sublimate');
      if (journal) journal.insertAdjacentElement('beforebegin', heroLink);
      else hero.appendChild(heroLink);
    }
  }

  function placeMasterListPilot20() {
    var topnav = document.querySelector('.topnav .topnav-inner');
    if (topnav && !topnav.querySelector('.wpa-pilot20-master-link')) {
      var link = createPilot20InlineLink('wpa-pilot20-master-link');
      topnav.appendChild(link);
    }
  }

  function placePageTools() {
    if (isHome()) placeHomePilot20();
    if (isInstitute()) {
      normalizeInstituteBrand();
      placeInstitutePilot20();
      placeInstituteSublimate();
    }
    if (isMasterList()) placeMasterListPilot20();
  }

  function applyFiveRowLayout() {
    if (!isHome()) return;
    document.documentElement.classList.add('wpa-home-five-row-nav');
    var list = document.querySelector('.site-nav ul');
    if (list) list.classList.add('wpa-five-row-nav-grid');
  }

  function updateOfficialFacebookLink() {
    if (!isHome()) return;
    var replacement = 'https://www.facebook.com/share/1G3Z8WabBx/';
    Array.prototype.forEach.call(document.querySelectorAll('footer a[href*="facebook.com"], .footer a[href*="facebook.com"]'), function (link) {
      link.href = replacement;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  if (isHome()) addStylesheet('wpa-home-five-row-css', '/styles/wpa-home-nav-five-rows.css?v=20260713-2');
  if (isInstitute()) addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260714-identity1');
  if (isHome() || isInstitute() || isMasterList()) addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260713-2');
  if (isSocialBridgeSystem()) addScript('wpa-social-bridge-runtime', '/scripts/wpa-social-bridge.js?v=20260713-1');

  function boot() {
    applyFiveRowLayout();
    updateOfficialFacebookLink();
    placePageTools();
  }

  boot();

  addScript('wpa-performance-core-runtime', '/scripts/wpa-performance-core.js?v=20260713');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  }
  window.setTimeout(boot, 250);
  window.setTimeout(boot, 1000);
  window.addEventListener('resize', boot);
})();

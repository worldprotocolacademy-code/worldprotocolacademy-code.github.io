/* WPA runtime loader: interaction recovery + page-scoped layout refinements */
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
    var page = pageName();
    return page === 'index' || path === '/' || path === '/index.html';
  }

  function isInstitute() {
    var path = normalizedPath().toLowerCase();
    return pageName() === 'institute' || path === '/institute.html';
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
    var css = document.createElement('link');
    css.id = id;
    css.rel = 'stylesheet';
    css.href = href;
    document.head.appendChild(css);
  }

  function addScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function createPilot20NavItem(extraClass) {
    var li = document.createElement('li');
    li.className = 'wpa-pilot20-nav-item ' + (extraClass || '');
    var link = document.createElement('a');
    link.className = 'wpa-pilot20-nav-link';
    link.href = PILOT_URL;
    link.title = 'WPA Pilot 20 — Final Consolidation v1.3.1';
    link.setAttribute('aria-label', 'Open WPA Pilot 20 validated package');
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    link.textContent = 'P20✓ Pilot 20';
    li.appendChild(link);
    return li;
  }

  function createPilot20InlineLink(extraClass) {
    var link = document.createElement('a');
    link.className = 'wpa-pilot20-inline-link ' + (extraClass || '');
    link.href = PILOT_URL;
    link.title = 'WPA Pilot 20 — Final Consolidation v1.3.1';
    link.setAttribute('aria-label', 'Open WPA Pilot 20 validated package');
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    link.textContent = 'P20✓ Pilot 20';
    return link;
  }

  function createPilot20HeroButton() {
    var link = document.createElement('a');
    link.className = 'btn btn-primary wpa-pilot20-hero-button';
    link.href = PILOT_URL;
    link.title = 'WPA Pilot 20 — Final Consolidation v1.3.1';
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    link.innerHTML = '<span aria-hidden="true">P20✓</span> Pilot 20';
    return link;
  }

  function createPilot20Badge(extraClass) {
    var link = document.createElement('a');
    link.className = 'wpa-pilot20-badge ' + (extraClass || '');
    link.href = PILOT_URL;
    link.title = 'WPA Pilot 20 — Final Consolidation v1.3.1';
    link.setAttribute('aria-label', 'Open WPA Pilot 20 validated package');
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    var mark = document.createElement('span');
    mark.className = 'wpa-pilot20-badge-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = 'P20✓';
    var copy = document.createElement('span');
    copy.className = 'wpa-pilot20-badge-copy';
    var title = document.createElement('strong');
    title.textContent = 'Pilot 20';
    var status = document.createElement('span');
    status.textContent = 'Validated v1.3.1';
    copy.appendChild(title);
    copy.appendChild(status);
    link.appendChild(mark);
    link.appendChild(copy);
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

  function ensureInstitutePreviewStyles() {
    if (!isInstitute() || document.getElementById('wpa-sublimate-preview-styles')) return;
    var style = document.createElement('style');
    style.id = 'wpa-sublimate-preview-styles';
    style.textContent = [
      'html[data-wpa-page="institute"] .nav-wrap nav{display:grid!important;grid-template-columns:1fr!important;align-items:start!important;max-width:1520px!important;gap:8px!important;padding:12px 24px 11px!important;}',
      'html[data-wpa-page="institute"] .nav-wrap .brand{width:100%!important;min-width:0!important;margin:0!important;padding:0 0 9px!important;border-bottom:1px solid rgba(201,168,76,.18)!important;}',
      'html[data-wpa-page="institute"] .nav-wrap .brand-text{min-width:0!important;max-width:100%!important;}',
      'html[data-wpa-page="institute"] .nav-wrap .nav-links{display:grid!important;grid-template-columns:repeat(8,minmax(0,1fr))!important;width:100%!important;gap:4px!important;padding-top:0!important;align-items:stretch!important;}',
      'html[data-wpa-page="institute"] .nav-wrap .nav-links>a{display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;min-height:38px!important;padding:6px 7px!important;line-height:1.2!important;white-space:normal!important;}',
      'html[data-wpa-page="institute"] .wpa-sublimate-institute-nav-link{grid-column:-2 / -1!important;color:#f4e8c1!important;border-color:rgba(201,168,76,.72)!important;background:rgba(201,168,76,.13)!important;font-weight:900!important;}',
      'html[data-wpa-page="institute"] .wpa-sublimate-institute-nav-link:hover{background:#e8d49a!important;color:#071326!important;}',
      'html[data-wpa-page="institute"] .wpa-sublimate-hero-button{margin-left:auto!important;background:linear-gradient(135deg,#c9a84c,#e8d49a)!important;color:#071326!important;border:1px solid rgba(232,212,154,.95)!important;font-weight:950!important;}',
      '@media(max-width:1180px){html[data-wpa-page="institute"] .nav-wrap .nav-links{grid-template-columns:repeat(5,minmax(0,1fr))!important;}html[data-wpa-page="institute"] .wpa-sublimate-institute-nav-link{grid-column:auto!important;}}',
      '@media(max-width:760px){html[data-wpa-page="institute"] .nav-wrap nav{display:flex!important;flex-direction:column!important;padding:10px 14px 8px!important;}html[data-wpa-page="institute"] .nav-wrap .nav-links{display:flex!important;flex-wrap:wrap!important;}html[data-wpa-page="institute"] .nav-wrap .nav-links>a{min-height:0!important;}html[data-wpa-page="institute"] .wpa-sublimate-hero-button{width:100%!important;margin-left:0!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function removeLegacyHeaderBadges() {
    var legacy = document.querySelectorAll('.wpa-pilot20-home-placement, .wpa-pilot20-institute-placement');
    Array.prototype.forEach.call(legacy, function (node) { node.remove(); });
  }

  function placeHomePilot20() {
    var list = document.querySelector('header .site-nav ul');
    if (!list || list.querySelector('.wpa-pilot20-nav-item')) return;
    list.appendChild(createPilot20NavItem('wpa-pilot20-home-nav-item'));
  }

  function placeInstitutePilot20() {
    var navLinks = document.querySelector('.nav-wrap nav .nav-links');
    if (navLinks && !navLinks.querySelector('.wpa-pilot20-institute-nav-link')) {
      var toolsLink = navLinks.querySelector('a[href="#wpa-public-tools-hub"]');
      var pilotLink = createPilot20InlineLink('wpa-pilot20-institute-nav-link');
      if (toolsLink && toolsLink.nextSibling) navLinks.insertBefore(pilotLink, toolsLink.nextSibling);
      else navLinks.appendChild(pilotLink);
    }

    var heroCta = document.querySelector('.hero-cta');
    if (heroCta && !heroCta.querySelector('.wpa-pilot20-hero-button')) {
      var protocolometry = heroCta.querySelector('a[href="/protocolometry-center.html"]');
      var button = createPilot20HeroButton();
      if (protocolometry && protocolometry.nextSibling) heroCta.insertBefore(button, protocolometry.nextSibling);
      else heroCta.appendChild(button);
    }
  }

  function placeInstituteSublimate() {
    if (!isInstitute()) return;
    ensureInstitutePreviewStyles();

    var nav = document.querySelector('.nav-wrap .nav-links');
    if (nav && !nav.querySelector('.wpa-sublimate-institute-nav-link')) {
      var opc = nav.querySelector('a[href="#opc-banner"]');
      var navLink = createSublimateLink('wpa-sublimate-institute-nav-link', '◆ WPA Sublimate');
      if (opc && opc.nextSibling) nav.insertBefore(navLink, opc.nextSibling);
      else nav.appendChild(navLink);
    }

    var hero = document.querySelector('.hero-cta');
    if (hero && !hero.querySelector('.wpa-sublimate-hero-button')) {
      var journalLive = hero.querySelector('#wpaLiveInstituteHeroLink, a[href="/journal/live/"]');
      var heroLink = createSublimateLink('btn btn-primary wpa-sublimate-hero-button', '◆ Отвори WPA Sublimate');
      if (journalLive && journalLive.nextSibling) hero.insertBefore(heroLink, journalLive.nextSibling);
      else if (journalLive) hero.appendChild(heroLink);
      else hero.appendChild(heroLink);
    }
  }

  function placeMasterListPilot20() {
    var masterHero = document.querySelector('header.hero');
    var masterKicker = masterHero && masterHero.querySelector('.kicker');
    if (masterHero && !masterHero.querySelector('.wpa-pilot20-master-placement')) {
      masterHero.insertBefore(createPilot20Badge('wpa-pilot20-master-placement'), masterKicker || masterHero.firstChild);
    }
    var topnavInner = document.querySelector('.topnav .topnav-inner');
    if (topnavInner && !topnavInner.querySelector('.wpa-pilot20-master-link')) {
      var navLink = document.createElement('a');
      navLink.className = 'wpa-pilot20-master-link';
      navLink.href = PILOT_URL;
      navLink.textContent = 'P20✓ Pilot 20';
      navLink.title = 'WPA Pilot 20 — validated package';
      topnavInner.appendChild(navLink);
    }
  }

  function placePageTools() {
    if (!(isHome() || isInstitute() || isMasterList())) return;
    addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260713-2');
    removeLegacyHeaderBadges();
    if (isHome()) placeHomePilot20();
    if (isInstitute()) {
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
    var links = Array.prototype.slice.call(document.querySelectorAll('footer a[href*="facebook.com"], .footer a[href*="facebook.com"]'));
    links.forEach(function (link) {
      link.href = replacement;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.title = 'World Protocol Academy — Facebook';
    });
  }

  if (isHome()) addStylesheet('wpa-home-five-row-css', '/styles/wpa-home-nav-five-rows.css?v=20260713-2');
  if (isInstitute()) addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260713-compact1');
  if (isHome() || isInstitute() || isMasterList()) addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260713-2');
  if (isSocialBridgeSystem()) addScript('wpa-social-bridge-runtime', '/scripts/wpa-social-bridge.js?v=20260713-1');

  applyFiveRowLayout();
  updateOfficialFacebookLink();
  placePageTools();

  var core = document.createElement('script');
  core.src = '/scripts/wpa-performance-core.js?v=20260713';
  core.defer = true;
  core.onload = function () {
    applyFiveRowLayout();
    updateOfficialFacebookLink();
    placePageTools();
    window.setTimeout(placePageTools, 250);
    window.setTimeout(placePageTools, 1000);
  };
  document.head.appendChild(core);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyFiveRowLayout();
      updateOfficialFacebookLink();
      placePageTools();
    }, { once: true });
  }
  window.addEventListener('resize', function () {
    applyFiveRowLayout();
    placePageTools();
  });
})();

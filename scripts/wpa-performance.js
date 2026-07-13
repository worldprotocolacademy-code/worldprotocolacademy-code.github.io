/* WPA runtime loader: interaction recovery + page-scoped layout refinements */
(function () {
  'use strict';

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

  function createPilot20Badge(extraClass) {
    var link = document.createElement('a');
    link.className = 'wpa-pilot20-badge ' + (extraClass || '');
    link.href = '/data/global-institutions/pilot-20/v1.3.1/';
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

  function placePilot20Badge() {
    if (document.querySelector('.wpa-pilot20-badge')) return;

    addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260713-1');

    if (isHome()) {
      var homeNav = document.querySelector('header .container.nav');
      var homeNavCenter = homeNav && homeNav.querySelector('.nav-center');
      if (homeNav && homeNavCenter) {
        homeNav.insertBefore(createPilot20Badge('wpa-pilot20-home-placement'), homeNavCenter);
      }
      return;
    }

    if (isInstitute()) {
      var instituteBrand = document.querySelector('.nav-wrap nav .brand');
      if (instituteBrand) {
        instituteBrand.appendChild(createPilot20Badge('wpa-pilot20-institute-placement'));
      }
      return;
    }

    if (isMasterList()) {
      var masterHero = document.querySelector('header.hero');
      var masterKicker = masterHero && masterHero.querySelector('.kicker');
      if (masterHero) {
        var badge = createPilot20Badge('wpa-pilot20-master-placement');
        masterHero.insertBefore(badge, masterKicker || masterHero.firstChild);
      }

      var topnavInner = document.querySelector('.topnav .topnav-inner');
      if (topnavInner && !topnavInner.querySelector('.wpa-pilot20-master-link')) {
        var navLink = document.createElement('a');
        navLink.className = 'wpa-pilot20-master-link';
        navLink.href = '/data/global-institutions/pilot-20/v1.3.1/';
        navLink.textContent = 'P20✓ Pilot 20';
        navLink.title = 'WPA Pilot 20 — validated package';
        topnavInner.appendChild(navLink);
      }
    }
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

  if (isHome()) {
    addStylesheet('wpa-home-five-row-css', '/styles/wpa-home-nav-five-rows.css?v=20260713');
  }

  if (isInstitute()) {
    addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260713-compact1');
  }

  if (isHome() || isInstitute() || isMasterList()) {
    addStylesheet('wpa-pilot20-badge-css', '/styles/wpa-pilot20-badge.css?v=20260713-1');
  }

  if (isSocialBridgeSystem()) {
    addScript('wpa-social-bridge-runtime', '/scripts/wpa-social-bridge.js?v=20260713-1');
  }

  applyFiveRowLayout();
  updateOfficialFacebookLink();
  placePilot20Badge();

  var core = document.createElement('script');
  core.src = '/scripts/wpa-performance-core.js?v=20260713';
  core.defer = true;
  core.onload = function () {
    applyFiveRowLayout();
    updateOfficialFacebookLink();
    placePilot20Badge();
    window.setTimeout(applyFiveRowLayout, 250);
    window.setTimeout(updateOfficialFacebookLink, 250);
    window.setTimeout(placePilot20Badge, 250);
    window.setTimeout(applyFiveRowLayout, 1000);
    window.setTimeout(updateOfficialFacebookLink, 1000);
    window.setTimeout(placePilot20Badge, 1000);
  };
  document.head.appendChild(core);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyFiveRowLayout();
      updateOfficialFacebookLink();
      placePilot20Badge();
    }, { once: true });
  }
  window.addEventListener('resize', applyFiveRowLayout);
})();

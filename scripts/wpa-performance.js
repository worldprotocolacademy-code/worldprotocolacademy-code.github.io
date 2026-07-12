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

  function addStylesheet(id, href) {
    if (document.getElementById(id)) return;
    var css = document.createElement('link');
    css.id = id;
    css.rel = 'stylesheet';
    css.href = href;
    document.head.appendChild(css);
  }

  function applyFiveRowLayout() {
    if (!isHome()) return;
    document.documentElement.classList.add('wpa-home-five-row-nav');
    var list = document.querySelector('.site-nav ul');
    if (list) list.classList.add('wpa-five-row-nav-grid');
  }

  if (isHome()) {
    addStylesheet('wpa-home-five-row-css', '/styles/wpa-home-nav-five-rows.css?v=20260713');
  }

  if (isInstitute()) {
    addStylesheet('wpa-institute-compact-brand-css', '/styles/wpa-institute-compact-brand.css?v=20260713-compact1');
  }

  applyFiveRowLayout();

  var core = document.createElement('script');
  core.src = '/scripts/wpa-performance-core.js?v=20260713';
  core.defer = true;
  core.onload = function () {
    applyFiveRowLayout();
    window.setTimeout(applyFiveRowLayout, 250);
    window.setTimeout(applyFiveRowLayout, 1000);
  };
  document.head.appendChild(core);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFiveRowLayout, { once: true });
  }
  window.addEventListener('resize', applyFiveRowLayout);
})();

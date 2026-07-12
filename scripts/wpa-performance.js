/* WPA homepage runtime loader: interaction recovery + proportional five-row navigation */
(function () {
  'use strict';

  function isHome() {
    var path = String(window.location.pathname || '').replace(/\/+$/, '') || '/';
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    return page === 'index' || path === '/' || path === '/index.html';
  }

  function applyFiveRowLayout() {
    if (!isHome()) return;
    document.documentElement.classList.add('wpa-home-five-row-nav');
    var list = document.querySelector('.site-nav ul');
    if (list) list.classList.add('wpa-five-row-nav-grid');
  }

  if (isHome() && !document.getElementById('wpa-home-five-row-css')) {
    var css = document.createElement('link');
    css.id = 'wpa-home-five-row-css';
    css.rel = 'stylesheet';
    css.href = '/styles/wpa-home-nav-five-rows.css?v=20260713';
    document.head.appendChild(css);
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

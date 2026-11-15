/* WPA EU Application Factory header CTA v1.0 · 2026-11-15
   Scope: WPA home only. Progressive enhancement; no navigation is removed.
   The linked workbench remains a governed pilot; no automatic grant submission. */
(function () {
  'use strict';

  if (window.WPA_EU_GRANT_CTA_LOADED) return;
  window.WPA_EU_GRANT_CTA_LOADED = true;

  var href = '/tools/eu-application-factory.html#idea';
  var copies = [
    ['mk', 'Внеси проект → Најди грант'],
    ['en', 'Enter a project → Find a grant'],
    ['fr', 'Présenter un projet → Trouver un financement']
  ];

  function isHome() {
    var path = String(window.location.pathname || '/').replace(/\/+$/, '') || '/';
    var page = String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
    return path === '/' || path === '/index.html' || page === 'index';
  }

  function ensureCss() {
    if (document.getElementById('wpaEuFactoryCtaStyles')) return;
    var css = document.createElement('style');
    css.id = 'wpaEuFactoryCtaStyles';
    css.textContent = [
      '.wpa-eu-grant-cta .wpa-eu-copy-en,.wpa-eu-grant-cta .wpa-eu-copy-fr{display:none}',
      'html[lang^="en"] .wpa-eu-grant-cta .wpa-eu-copy-mk,html[lang^="fr"] .wpa-eu-grant-cta .wpa-eu-copy-mk{display:none}',
      'html[lang^="en"] .wpa-eu-grant-cta .wpa-eu-copy-en{display:inline}',
      'html[lang^="fr"] .wpa-eu-grant-cta .wpa-eu-copy-fr{display:inline}',
      'header:not(.hero) a.wpa-eu-grant-cta{align-items:center!important;justify-content:center!important;',
      'padding:9px 15px!important;min-height:42px!important;color:#071326!important;',
      'background:linear-gradient(135deg,#f0dca2,#c9a84c)!important;',
      'border:1px solid #e8d49a!important;border-radius:999px!important;',
      'box-shadow:0 2px 12px rgba(201,168,76,.21)!important;text-decoration:none!important;',
      'text-align:center!important;white-space:nowrap;font:800 12.5px/1.25 system-ui,Arial,sans-serif!important;',
      'transition:filter .18s,transform .18s!important}',
      'header:not(.hero) a#wpaEuFactoryCtaHeader{display:inline-flex!important}',
      'header:not(.hero) a#wpaEuFactoryCtaMobile{display:none!important}',
      'header:not(.hero) a.wpa-eu-grant-cta:hover{filter:brightness(1.06);transform:translateY(-1px)}',
      'header:not(.hero) a.wpa-eu-grant-cta:focus-visible{outline:3px solid #fff!important;outline-offset:3px!important}',
      '@media(min-width:861px) and (max-width:1100px){header:not(.hero) a#wpaEuFactoryCtaHeader{max-width:175px;white-space:normal!important;padding:7px 10px!important;font-size:11.5px!important}}',
      '@media(max-width:860px){header:not(.hero) a#wpaEuFactoryCtaHeader{display:none!important}',
      'header:not(.hero) .nav-center.open a#wpaEuFactoryCtaMobile,body.wpa-menu-open header:not(.hero) .nav-center a#wpaEuFactoryCtaMobile{display:flex!important;width:calc(100% - 20px)!important;max-width:440px!important;margin:12px auto 4px!important;white-space:normal!important}}',
      '@media(prefers-reduced-motion:reduce){header:not(.hero) a.wpa-eu-grant-cta{transition:none!important;transform:none!important}}'
    ].join('');
    document.head.appendChild(css);
  }

  function makeLink(id, extraClass) {
    var a = document.createElement('a');
    a.id = id;
    a.className = 'wpa-eu-grant-cta ' + extraClass;
    a.href = href;
    a.setAttribute('translate', 'no');
    a.setAttribute('data-no-i18n', 'true');
    copies.forEach(function (copy) {
      var span = document.createElement('span');
      span.className = 'wpa-eu-copy-' + copy[0];
      span.setAttribute('lang', copy[0]);
      span.textContent = copy[1];
      a.appendChild(span);
    });
    return a;
  }

  function ensure() {
    if (!isHome()) return;
    var right = document.querySelector('header .nav-right');
    var center = document.querySelector('header .nav-center');
    if (!right || !center) return;
    ensureCss();
    if (!document.getElementById('wpaEuFactoryCtaHeader')) {
      right.insertBefore(makeLink('wpaEuFactoryCtaHeader', 'wpa-eu-grant-cta-desktop'), right.firstChild);
    }
    if (!document.getElementById('wpaEuFactoryCtaMobile')) {
      center.appendChild(makeLink('wpaEuFactoryCtaMobile', 'wpa-eu-grant-cta-mobile'));
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure, { once: true });
  else ensure();
  window.addEventListener('load', ensure, { once: true });
  window.setTimeout(ensure, 300);
  window.setTimeout(ensure, 1200);
})();

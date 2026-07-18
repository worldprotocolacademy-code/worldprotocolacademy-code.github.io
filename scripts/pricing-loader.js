/*
  WPA Access & Future Pricing Guard v2.1
  Commercial activation is disabled during the development, testing and pilot phase.
  No prices, checkout links, payment actions, contracts or delivery commitments are loaded.
*/
(function () {
  'use strict';

  window.WPA_PRICING = {
    status: 'not_activated',
    currency: null,
    levels: {},
    contact: 'worldprotocolacademy@gmail.com',
    boundary: 'Prices and payments will be activated only after an appropriate legal, ethical, tax and payment framework is established.'
  };

  function loadScript(src, marker) {
    if (document.querySelector('script[' + marker + '],script[src="' + src + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(marker, 'true');
    document.head.appendChild(script);
  }

  function isHome() {
    var path = String(window.location.pathname || '').replace(/\/+$/, '') || '/';
    return path === '/' || path === '/index.html';
  }

  function getPrice() {
    return {
      status: 'not_activated',
      currency: null,
      range: null,
      institutional: 'not_activated',
      contact: 'worldprotocolacademy@gmail.com',
      disclaimer: 'WPA commercial access, prices, payments and contractual delivery are not activated during the development, testing and pilot phase. Expressions of interest are non-binding.'
    };
  }

  function announceBoundary() {
    document.dispatchEvent(new CustomEvent('wpa:pricing-ready', { detail: window.WPA_PRICING }));
  }

  window.WPAGetPrice = getPrice;
  window.WPA_PRICING_READY = Promise.resolve(window.WPA_PRICING);

  loadScript('/scripts/wpa-performance.js?v=20260712', 'data-wpa-performance');
  loadScript('/scripts/wpa-public-safety-layer.js?v=20260718-1', 'data-wpa-public-safety');
  if (isHome()) loadScript('/scripts/wpa-ai-hub-clarity.js?v=20260719-1', 'data-wpa-ai-hub-clarity');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', announceBoundary);
  } else {
    announceBoundary();
  }
})();
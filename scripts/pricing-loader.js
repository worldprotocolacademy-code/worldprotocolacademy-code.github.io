/*
  WPA Access & Future Pricing Guard v2.3
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

  loadScript('/scripts/wpa-performance.js?v=20260810-3', 'data-wpa-performance');
  loadScript('/scripts/wpa-public-safety-layer.js?v=20260719-2', 'data-wpa-public-safety');

  var path = String(window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  var isHome = path === '/' || path === '/index.html';

  if (isHome) {
    loadScript('/scripts/wpa-ai-hub-clarity.js?v=20260719-2', 'data-wpa-ai-hub-clarity');
    loadScript('/scripts/wpa-home-promo-cleanup.js?v=20260810-3', 'data-wpa-home-promo-cleanup');
    loadScript('/scripts/wpa-home-symbols-card-update.js?v=20260810-1', 'data-wpa-home-symbols-card-update');
    loadScript('/scripts/wpa-home-professional-english-icons.js?v=20260827-1', 'data-wpa-home-professional-english-icons');
    loadScript('/scripts/wpa-home-audio-video-session-card.js?v=20260827-1', 'data-wpa-home-audio-video-session-card');
  }

  if (/\/professional-english\.html$/.test(path)) {
    loadScript('/scripts/professional-english-protocol-toolkit.js?v=20260719-2', 'data-wpa-professional-english-toolkit');
  }

  if (/\/(certification|programmes|wpa-card|institute|virtual-sande-ai)\.html$/.test(path)) {
    loadScript('/scripts/wpa-credential-journey.js?v=20260827-2', 'data-wpa-credential-journey');
  }

  if (/\/programmes\.html$/.test(path)) {
    loadScript('/scripts/wpa-training-formats-interactive.js?v=20260719-2', 'data-wpa-training-formats');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', announceBoundary);
  } else {
    announceBoundary();
  }
})();

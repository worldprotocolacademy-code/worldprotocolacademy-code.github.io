/*
 * World Protocol Academy performance and privacy layer.
 * - Consent-aware GA4 bootstrap from /config/analytics.json
 * - CLS/LCP field measurement
 * - Runtime safeguards for images and layout stability
 */
(function () {
  'use strict';

  if (window.WPA_PERFORMANCE_LOADED) return;
  window.WPA_PERFORMANCE_LOADED = true;

  var metrics = window.WPAPerformanceMetrics = window.WPAPerformanceMetrics || {
    cls: 0,
    lcp: 0,
    measuredAt: null
  };

  function injectStabilityStyles() {
    if (document.getElementById('wpa-performance-stability')) return;
    var style = document.createElement('style');
    style.id = 'wpa-performance-stability';
    style.textContent = [
      'html{scrollbar-gutter:stable;}',
      'img[width][height]{height:auto;}',
      'picture.wpa-picture{display:contents;}',
      '.wpa-analytics-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483646;max-width:920px;margin:auto;padding:16px 18px;border:1px solid rgba(201,168,76,.55);border-radius:14px;background:#0d1f3c;color:#fff;box-shadow:0 14px 45px rgba(0,0,0,.3);font:14px/1.5 system-ui,-apple-system,Segoe UI,Arial,sans-serif;}',
      '.wpa-analytics-consent strong{display:block;margin-bottom:5px;color:#e8d49a;}',
      '.wpa-analytics-consent p{margin:0;color:rgba(255,255,255,.86);}',
      '.wpa-analytics-consent__actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px;}',
      '.wpa-analytics-consent button{min-height:40px;padding:8px 14px;border-radius:999px;border:1px solid rgba(232,212,154,.65);cursor:pointer;font:700 13px/1 system-ui,-apple-system,Segoe UI,Arial,sans-serif;}',
      '.wpa-analytics-consent__accept{background:#c9a84c;color:#0d1f3c;}',
      '.wpa-analytics-consent__decline{background:transparent;color:#fff;}',
      '@media(max-width:560px){.wpa-analytics-consent{left:10px;right:10px;bottom:10px;padding:14px}.wpa-analytics-consent button{flex:1}}'
    ].join('');
    document.head.appendChild(style);
  }

  function hardenImages() {
    var images = Array.prototype.slice.call(document
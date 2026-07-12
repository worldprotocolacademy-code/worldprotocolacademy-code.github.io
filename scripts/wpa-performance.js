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
    var images = Array.prototype.slice.call(document.images || []);
    images.forEach(function (img, index) {
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
      if (!img.hasAttribute('loading')) {
        var hint = ((img.id || '') + ' ' + (img.className || '') + ' ' + (img.getAttribute('data-role') || '')).toLowerCase();
        var isPriority = index === 0 || /hero|lcp|brand|logo/.test(hint);
        img.setAttribute('loading', isPriority ? 'eager' : 'lazy');
      }
      if (!img.hasAttribute('width') && img.naturalWidth) img.setAttribute('width', String(img.naturalWidth));
      if (!img.hasAttribute('height') && img.naturalHeight) img.setAttribute('height', String(img.naturalHeight));
    });
  }

  function observeWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    try {
      var clsValue = 0;
      var clsEntries = [];
      var sessionValue = 0;
      var sessionEntries = [];
      new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (entry.hadRecentInput) return;
          var first = sessionEntries[0];
          var last = sessionEntries[sessionEntries.length - 1];
          if (sessionValue && first && last && entry.startTime - last.startTime < 1000 && entry.startTime - first.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }
          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            clsEntries = sessionEntries.slice();
            metrics.cls = Number(clsValue.toFixed(4));
            metrics.clsEntries = clsEntries.length;
            metrics.measuredAt = new Date().toISOString();
          }
        });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      // Unsupported entry type or older browser.
    }

    try {
      new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        var last = entries[entries.length - 1];
        if (last) metrics.lcp = Math.round(last.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      // Unsupported entry type or older browser.
    }
  }

  var analytics = {
    measurementId: '',
    loaded: false,
    consentKey: 'wpa.analytics.consent',
    consentRequired: true,
    config: null
  };

  function validMeasurementId(value) {
    return /^G-[A-Z0-9]{6,20}$/i.test(String(value || '').trim());
  }

  function privacySignalBlocksAnalytics() {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  }

  function getConsent() {
    try { return localStorage.getItem(analytics.consentKey) || ''; } catch (error) { return ''; }
  }

  function setConsent(value) {
    try { localStorage.setItem(analytics.consentKey, value); } catch (error) {}
  }

  function removeConsentBanner() {
    var banner = document.getElementById('wpaAnalyticsConsent');
    if (banner) banner.remove();
  }

  function loadGA4() {
    if (analytics.loaded || !validMeasurementId(analytics.measurementId)) return;
    if (privacySignalBlocksAnalytics() || getConsent() !== 'granted') return;

    analytics.loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    window.gtag('js', new Date());
    window.gtag('config', analytics.measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      transport_type: 'beacon'
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analytics.measurementId);
    script.dataset.wpaGa4 = 'true';
    document.head.appendChild(script);
    document.dispatchEvent(new CustomEvent('wpa:ga4-ready', { detail: { measurementId: analytics.measurementId } }));
  }

  function showConsentBanner() {
    if (document.getElementById('wpaAnalyticsConsent') || privacySignalBlocksAnalytics()) return;
    var lang = (document.documentElement.lang || 'mk').toLowerCase();
    var english = lang.indexOf('en') === 0;
    var banner = document.createElement('section');
    banner.id = 'wpaAnalyticsConsent';
    banner.className = 'wpa-analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', english ? 'Analytics preferences' : 'Поставки за аналитика');
    banner.innerHTML = english
      ? '<strong>Privacy-respecting analytics</strong><p>We use Google Analytics 4 only with your permission to understand anonymous site usage. Advertising signals remain disabled.</p><div class="wpa-analytics-consent__actions"><button type="button" class="wpa-analytics-consent__accept">Accept analytics</button><button type="button" class="wpa-analytics-consent__decline">Decline</button></div>'
      : '<strong>Аналитика со почитување на приватноста</strong><p>Google Analytics 4 се активира само со ваша согласност за анонимно мерење на користењето на сајтот. Рекламните сигнали се исклучени.</p><div class="wpa-analytics-consent__actions"><button type="button" class="wpa-analytics-consent__accept">Прифати аналитика</button><button type="button" class="wpa-analytics-consent__decline">Одбиј</button></div>';
    document.body.appendChild(banner);
    banner.querySelector('.wpa-analytics-consent__accept').addEventListener('click', function () {
      setConsent('granted');
      removeConsentBanner();
      loadGA4();
    });
    banner.querySelector('.wpa-analytics-consent__decline').addEventListener('click', function () {
      setConsent('denied');
      removeConsentBanner();
    });
  }

  function reportCLS() {
    if (!analytics.loaded || typeof window.gtag !== 'function') return;
    window.gtag('event', 'web_vitals', {
      metric_name: 'CLS',
      metric_value: Math.round((metrics.cls || 0) * 1000),
      metric_delta: metrics.cls || 0,
      event_category: 'Web Vitals',
      non_interaction: true
    });
  }

  function configureAnalytics(config) {
    analytics.config = config || {};
    analytics.measurementId = String(analytics.config.measurementId || '').trim();
    analytics.consentRequired = analytics.config.consentRequired !== false;
    window.WPAAnalytics = {
      status: function () {
        return {
          configured: validMeasurementId(analytics.measurementId),
          loaded: analytics.loaded,
          consent: getConsent() || 'unset',
          privacySignal: privacySignalBlocksAnalytics()
        };
      },
      accept: function () { setConsent('granted'); removeConsentBanner(); loadGA4(); },
      deny: function () { setConsent('denied'); removeConsentBanner(); },
      reset: function () { setConsent(''); if (validMeasurementId(analytics.measurementId)) showConsentBanner(); }
    };

    if (!validMeasurementId(analytics.measurementId)) return;
    if (privacySignalBlocksAnalytics()) {
      setConsent('denied');
      return;
    }
    if (!analytics.consentRequired) {
      setConsent('granted');
      loadGA4();
      return;
    }
    if (getConsent() === 'granted') loadGA4();
    else if (getConsent() !== 'denied') showConsentBanner();
  }

  function loadAnalyticsConfig() {
    fetch('/config/analytics.json', { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (response) { return response.ok ? response.json() : {}; })
      .then(configureAnalytics)
      .catch(function () { configureAnalytics({}); });
  }

  function injectLiveEntryPoints() {
    var path = String(window.location.pathname || '').replace(/\/+$/, '') || '/';
    var isHome = path === '/' || path === '/index.html';
    var isJournal = path === '/journal' || path === '/journal/index.html';
    var isInstitute = path === '/institute.html';
    if (!isHome && !isJournal && !isInstitute) return;

    if (!document.getElementById('wpa-live-entry-styles')) {
      var style = document.createElement('style');
      style.id = 'wpa-live-entry-styles';
      style.textContent = '.wpa-live-header-links{display:inline-flex;align-items:center;gap:7px;flex-wrap:wrap}.wpa-live-header-link{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:7px 12px;border:1px solid rgba(212,166,74,.58);border-radius:999px;background:rgba(212,166,74,.11);color:#f0ca64!important;text-decoration:none!important;font:800 11px/1.2 Inter,Segoe UI,Arial,sans-serif;letter-spacing:.035em;white-space:nowrap;transition:transform .18s,background .18s,border-color .18s}.wpa-live-header-link:hover{transform:translateY(-1px);background:rgba(212,166,74,.23);border-color:#d4a64a;color:#fff!important}.wpa-live-header-link--primary{background:linear-gradient(135deg,#d4a64a,#f0ca64);color:#111!important;border-color:#d4a64a}.wpa-live-header-link--primary:hover{color:#111!important}.wpa-live-dot{width:7px;height:7px;border-radius:50%;background:#38c172;box-shadow:0 0 0 3px rgba(56,193,114,.16)}.wpa-live-preview-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.wpa-live-preview-links a{display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border:1px solid rgba(212,166,74,.45);border-radius:999px;color:#d4a64a;text-decoration:none;font:800 11px/1.2 Inter,Segoe UI,Arial,sans-serif}@media(max-width:760px){.wpa-live-header-links{width:100%;justify-content:center}.wpa-live-header-link{flex:1;min-width:128px}.nav-right .wpa-live-header-links{order:-1}}';
      document.head.appendChild(style);
    }

    function createGroup(id) {
      if (document.getElementById(id)) return null;
      var group = document.createElement('span');
      group.id = id;
      group.className = 'wpa-live-header-links';
      group.setAttribute('aria-label', 'WPA Journal Live links');
      group.innerHTML = '<a class="wpa-live-header-link wpa-live-header-link--primary" href="/journal/live/" title="WPA Journal Live"><span class="wpa-live-dot" aria-hidden="true"></span><span>Journal Live</span></a><a class="wpa-live-header-link" href="/journal/sources/" title="WPA Source Directory"><span aria-hidden="true">🗂️</span><span>Sources</span></a>';
      return group;
    }

    function appendGroup(selector, id) {
      var target = document.querySelector(selector);
      var group = createGroup(id);
      if (target && group) target.appendChild(group);
    }

    function appendLink(selector, id, href, className, label, title) {
      if (document.getElementById(id)) return;
      var target = document.querySelector(selector);
      if (!target) return;
      var link = document.createElement('a');
      link.id = id;
      link.href = href;
      link.className = className || '';
      link.title = title || label;
      link.innerHTML = label;
      target.appendChild(link);
    }

    if (isHome) {
      appendGroup('.nav-right', 'wpaLiveHomeHeaderLinks');
      appendLink('.site-nav ul', 'wpaLiveHomeNavLink', '/journal/live/', '', '🛰️ WPA Journal Live', 'WPA Journal Live');
      var homeNavLink = document.getElementById('wpaLiveHomeNavLink');
      if (homeNavLink && homeNavLink.parentNode && homeNavLink.parentNode.tagName !== 'LI') {
        var li = document.createElement('li');
        homeNavLink.parentNode.insertBefore(li, homeNavLink);
        li.appendChild(homeNavLink);
      }
      appendLink('.hero-actions', 'wpaLiveHomeHeroLink', '/journal/live/', 'btn btn-gold', '🛰️ Отвори WPA Journal Live', 'Open WPA Journal Live');
      appendLink('.hero-actions', 'wpaLiveHomeSourcesLink', '/journal/sources/', 'btn btn-ghost', '🗂️ Source Directory', 'Open WPA Source Directory');
    }

    if (isInstitute) {
      appendGroup('.topbar-quicklinks', 'wpaLiveInstituteHeaderLinks');
      appendLink('.nav-links', 'wpaLiveInstituteNavLink', '/journal/live/', '', '🛰️ Journal Live', 'WPA Journal Live');
      appendLink('.hero-cta', 'wpaLiveInstituteHeroLink', '/journal/live/', 'btn btn-primary', '🛰️ WPA Journal Live', 'Open WPA Journal Live');
      appendLink('.hero-cta', 'wpaLiveInstituteSourcesLink', '/journal/sources/', 'btn btn-ghost', '🗂️ Source Directory', 'Open WPA Source Directory');
    }

    if (isJournal) {
      appendGroup('.top .topin', 'wpaLiveJournalHeaderLinks');
      appendLink('.nav', 'wpaLiveJournalNavLink', '/journal/live/', '', '🛰️ Journal Live', 'WPA Journal Live');
      appendLink('.nav', 'wpaLiveJournalSourcesNavLink', '/journal/sources/', '', '🗂️ Sources', 'WPA Source Directory');
      appendLink('.hero .actions', 'wpaLiveJournalHeroLink', '/journal/live/', 'btn primary', '🛰️ Open Journal Live', 'Open WPA Journal Live');
      appendLink('.hero .actions', 'wpaLiveJournalHeroSourcesLink', '/journal/sources/', 'btn', '🗂️ Source Directory', 'Open WPA Source Directory');
      var previewText = document.querySelector('.preview > div:nth-child(2)');
      if (previewText && !document.getElementById('wpaLiveJournalPreviewLinks')) {
        var previewLinks = document.createElement('div');
        previewLinks.id = 'wpaLiveJournalPreviewLinks';
        previewLinks.className = 'wpa-live-preview-links';
        previewLinks.innerHTML = '<a href="/journal/live/">🛰️ Live diplomatic monitor</a><a href="/journal/sources/">🗂️ 1,892-source directory</a>';
        previewText.appendChild(previewLinks);
      }
    }
  }

  injectStabilityStyles();
  observeWebVitals();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hardenImages(); loadAnalyticsConfig(); injectLiveEntryPoints(); });
  } else {
    hardenImages();
    loadAnalyticsConfig();
    injectLiveEntryPoints();
  }
  window.addEventListener('load', hardenImages, { once: true });
  window.addEventListener('pagehide', reportCLS, { capture: true });
})();

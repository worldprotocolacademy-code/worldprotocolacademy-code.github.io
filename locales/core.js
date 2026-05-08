/*
  WPA Locales Core Compatibility Module
  Version 1.1.0
  Loads the WPA bilingual cleaner with cache-busting.
*/
(function () {
  'use strict';

  window.WPALocalesCore = window.WPALocalesCore || {
    version: '1.1.0',
    ready: true,
    defaultLanguage: 'mk',
    fallbackLanguage: 'mk',
    supportedCoreLanguages: ['mk', 'en'],
    normalizeLanguage: function (lang) {
      if (!lang) return 'mk';
      var value = String(lang).trim();
      if (value === 'zh') return 'zh-Hans';
      if (value === 'zht') return 'zh-Hant';
      return value || 'mk';
    }
  };

  function loadCleaner() {
    try {
      var existing = document.querySelector('script[data-wpa-bilingual-cleaner-script="true"]');
      if (existing) return;

      var script = document.createElement('script');
      script.src = '/scripts/i18n-bilingual-cleaner.js?v=3';
      script.defer = true;
      script.setAttribute('data-wpa-bilingual-cleaner-script', 'true');
      document.head.appendChild(script);
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', loadCleaner);

  document.dispatchEvent(new CustomEvent('wpa:locales-core-ready', {
    detail: window.WPALocalesCore
  }));
})();

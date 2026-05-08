/*
  WPA Locales Core Compatibility Module
  Version: 1.0.4
  Purpose: load the latest WPA bilingual cleaner with cache-busting v41.
*/
(function () {
  'use strict';

  window.WPALocalesCore = window.WPALocalesCore || {
    version: '1.0.4',
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

      var s = document.createElement('script');
      s.src = '/scripts/i18n-bilingual-cleaner.js?v=41';
      s.defer = true;
      s.setAttribute('data-wpa-bilingual-cleaner-script', 'true');
      document.head.appendChild(s);
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', loadCleaner);

  document.dispatchEvent(new CustomEvent('wpa:locales-core-ready', {
    detail: window.WPALocalesCore
  }));
})();

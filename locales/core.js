/*
  WPA Locales Core Compatibility Module
  Purpose: prevents /locales/core.js 404 and exposes a safe shared namespace for multilingual pages.
  This file does not replace translator-loader-v1.js or translator-loader-v2.js.
*/
(function () {
  'use strict';

  window.WPALocalesCore = window.WPALocalesCore || {
    version: '1.0.0',
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

  document.dispatchEvent(new CustomEvent('wpa:locales-core-ready', {
    detail: window.WPALocalesCore
  }));
})();

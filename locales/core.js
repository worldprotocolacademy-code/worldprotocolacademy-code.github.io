/*
  WPA Locales Core Compatibility Module
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

  function loadCleaner(){
    try{
      var s=document.createElement('script');
      s.src='/scripts/i18n-bilingual-cleaner.js?v=1';
      s.defer=true;
      document.head.appendChild(s);
    }catch(e){}
  }

  document.addEventListener('DOMContentLoaded', loadCleaner);

  document.dispatchEvent(new CustomEvent('wpa:locales-core-ready', {
    detail: window.WPALocalesCore
  }));
})();

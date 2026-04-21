(function(){
  'use strict';

  var DEFAULT_LANGUAGE = 'mk';
  var RTL_LANGS = new Set(['ar', 'he']);
  var STORAGE_KEYS = ['wpa_language', 'wpa-lang'];

  function getPageName(){
    if (document.body && document.body.dataset && document.body.dataset.page) {
      return document.body.dataset.page;
    }
    var path = (window.location.pathname || '').split('/').pop() || 'index.html';
    if (!path || path === '/' || path === 'index.html') return 'index';
    return path.replace(/\.html$/i, '');
  }

  function normalizeLanguage(lang){
    if (!lang) return DEFAULT_LANGUAGE;
    if (lang === 'zh') return 'zh-Hans';
    if (lang === 'zht') return 'zh-Hant';
    return String(lang).trim();
  }

  function legacyLanguageCode(lang){
    if (!lang) return DEFAULT_LANGUAGE;
    if (lang === 'zh-Hans') return 'zh';
    if (lang === 'zh-Hant') return 'zht';
    return lang;
  }

  function readSavedLanguage(){
    for (var i = 0; i < STORAGE_KEYS.length; i++) {
      try {
        var value = localStorage.getItem(STORAGE_KEYS[i]);
        if (value) return normalizeLanguage(value);
      } catch (e) {}
    }
    return DEFAULT_LANGUAGE;
  }

  function writeSavedLanguage(lang){
    var normalized = normalizeLanguage(lang);
    try { localStorage.setItem('wpa_language', normalized); } catch (e) {}
    try { localStorage.setItem('wpa-lang', legacyLanguageCode(normalized)); } catch (e) {}
  }

  function setDocumentLanguage(lang){
    var normalized = normalizeLanguage(lang);
    document.documentElement.setAttribute('lang', normalized);
    document.documentElement.setAttribute('dir', RTL_LANGS.has(normalized) ? 'rtl' : 'ltr');
    if (document.body) {
      document.body.setAttribute('data-current-language', normalized);
    }
  }

  function getNestedValue(obj, path){
    if (!obj || !path) return undefined;
    var parts = String(path).split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
      if (current == null || typeof current !== 'object' || !(parts[i] in current)) {
        return undefined;
      }
      current = current[parts[i]];
    }
    return current;
  }

  function applyText(locale){
    var nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(function(node){
      var key = node.getAttribute('data-i18n');
      var value = getNestedValue(locale, key);
      if (typeof value === 'string') node.textContent = value;
    });
  }

  function applyHtml(locale){
    var nodes = document.querySelectorAll('[data-i18n-html]');
    nodes.forEach(function(node){
      var key = node.getAttribute('data-i18n-html');
      var value = getNestedValue(locale, key);
      if (typeof value === 'string') node.innerHTML = value;
    });
  }

  function applyPlaceholder(locale){
    var nodes = document.querySelectorAll('[data-i18n-placeholder]');
    nodes.forEach(function(node){
      var key = node.getAttribute('data-i18n-placeholder');
      var value = getNestedValue(locale, key);
      if (typeof value === 'string') node.setAttribute('placeholder', value);
    });
  }

  function applyTitle(locale){
    var nodes = document.querySelectorAll('[data-i18n-title]');
    nodes.forEach(function(node){
      var key = node.getAttribute('data-i18n-title');
      var value = getNestedValue(locale, key);
      if (typeof value === 'string') node.setAttribute('title', value);
    });
  }

  function applyDocumentTitle(locale){
    var titleNode = document.querySelector('[data-i18n-title-tag]');
    if (!titleNode) return;
    var key = titleNode.getAttribute('data-i18n-title-tag');
    var value = getNestedValue(locale, key);
    if (typeof value === 'string') document.title = value;
  }

  function syncLanguageSwitchers(lang){
    document.querySelectorAll('[data-language-switcher]').forEach(function(select){
      if (select.value !== lang) select.value = lang;
    });
  }

  function localeUrl(lang, page){
    return 'locales/' + encodeURIComponent(lang) + '/' + encodeURIComponent(page) + '.json';
  }

  async function fetchLocale(url){
    try {
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function loadLocale(lang, page){
    var normalized = normalizeLanguage(lang);
    var locale = await fetchLocale(localeUrl(normalized, page));
    if (locale) return { locale: locale, language: normalized, fallback: false };

    if (normalized !== DEFAULT_LANGUAGE) {
      var fallbackLocale = await fetchLocale(localeUrl(DEFAULT_LANGUAGE, page));
      if (fallbackLocale) return { locale: fallbackLocale, language: DEFAULT_LANGUAGE, fallback: true };
    }

    return { locale: null, language: DEFAULT_LANGUAGE, fallback: true };
  }

  async function applyLanguage(lang){
    var page = getPageName();
    var result = await loadLocale(lang, page);

    setDocumentLanguage(result.language);
    writeSavedLanguage(result.language);
    syncLanguageSwitchers(result.language);

    if (!result.locale) {
      document.dispatchEvent(new CustomEvent('wpa:i18n:missing', {
        detail: { language: result.language, page: page }
      }));
      return;
    }

    applyText(result.locale);
    applyHtml(result.locale);
    applyPlaceholder(result.locale);
    applyTitle(result.locale);
    applyDocumentTitle(result.locale);

    if (typeof window.WPA_TRANSLATOR_HOOK === 'function') {
      try {
        window.WPA_TRANSLATOR_HOOK({
          language: result.language,
          locale: result.locale,
          page: page,
          fallback: result.fallback
        });
      } catch (e) {}
    }

    document.dispatchEvent(new CustomEvent('wpa:i18n:loaded', {
      detail: {
        language: result.language,
        page: page,
        fallback: result.fallback
      }
    }));
  }

  function bindLanguageSwitchers(){
    document.querySelectorAll('[data-language-switcher]').forEach(function(select){
      select.addEventListener('change', function(){
        applyLanguage(select.value);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    bindLanguageSwitchers();
    var saved = readSavedLanguage();
    setDocumentLanguage(saved);
    syncLanguageSwitchers(saved);
    applyLanguage(saved);
  });

  window.WPATranslator = {
    applyLanguage: applyLanguage,
    getPageName: getPageName,
    readSavedLanguage: readSavedLanguage
  };
})();

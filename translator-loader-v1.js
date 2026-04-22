(function(){
  'use strict';

  var MANIFEST_URL = './locales/manifest.json';
  var DEFAULT_LANGUAGE = 'mk';
  var FALLBACK_LANGUAGE = 'en';
  var RTL_LANGS = new Set(['ar', 'he']);
  var STORAGE_KEYS = ['wpa_language', 'wpa-lang'];
  var manifestCache = null;

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

  function getUrlLanguage(){
    try {
      var urlLang = new URLSearchParams(window.location.search).get('lang');
      return urlLang ? normalizeLanguage(urlLang) : null;
    } catch (e) {
      return null;
    }
  }

  function readSavedLanguage(){
    var forced = getUrlLanguage();
    if (forced) return forced;

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

  function getRtlSet(){
    if (manifestCache && Array.isArray(manifestCache.rtl_languages)) {
      return new Set(manifestCache.rtl_languages.map(normalizeLanguage));
    }
    return RTL_LANGS;
  }

  function setDocumentLanguage(lang){
    var normalized = normalizeLanguage(lang);
    var rtlSet = getRtlSet();
    document.documentElement.setAttribute('lang', normalized);
    document.documentElement.setAttribute('dir', rtlSet.has(normalized) ? 'rtl' : 'ltr');
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

  function normalizeLocalePayload(payload){
    if (!payload || typeof payload !== 'object') return {};
    if (payload.strings && typeof payload.strings === 'object') return payload.strings;
    return payload;
  }

  function deepMerge(base, extra){
    var out = {};
    var key;

    if (base && typeof base === 'object') {
      for (key in base) {
        if (Object.prototype.hasOwnProperty.call(base, key)) {
          if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
            out[key] = deepMerge(base[key], {});
          } else {
            out[key] = base[key];
          }
        }
      }
    }

    if (extra && typeof extra === 'object') {
      for (key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) {
          if (
            out[key] &&
            typeof out[key] === 'object' &&
            !Array.isArray(out[key]) &&
            extra[key] &&
            typeof extra[key] === 'object' &&
            !Array.isArray(extra[key])
          ) {
            out[key] = deepMerge(out[key], extra[key]);
          } else {
            out[key] = extra[key];
          }
        }
      }
    }

    return out;
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

  function commonLocaleUrl(lang){
    return 'locales/' + encodeURIComponent(lang) + '/common.json';
  }

  function pageLocaleUrl(lang, page){
    return 'locales/' + encodeURIComponent(lang) + '/' + encodeURIComponent(page) + '.json';
  }

  async function fetchJson(url){
    try {
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function loadManifest(){
    if (manifestCache) return manifestCache;
    var manifest = await fetchJson(MANIFEST_URL);
    if (!manifest || typeof manifest !== 'object') {
      manifestCache = {
        default_language: DEFAULT_LANGUAGE,
        canonical_language: DEFAULT_LANGUAGE,
        mirror_language: FALLBACK_LANGUAGE,
        rtl_languages: Array.from(RTL_LANGS),
        supported_languages: [
          { code: 'mk', label: 'Македонски' },
          { code: 'en', label: 'English' }
        ]
      };
      return manifestCache;
    }

    if (manifest.default_language) {
      DEFAULT_LANGUAGE = normalizeLanguage(manifest.default_language);
    }
    if (manifest.mirror_language) {
      FALLBACK_LANGUAGE = normalizeLanguage(manifest.mirror_language);
    }
    manifestCache = manifest;
    return manifestCache;
  }

  function isSupportedLanguage(lang){
    if (!manifestCache || !Array.isArray(manifestCache.supported_languages)) return true;
    var normalized = normalizeLanguage(lang);
    return manifestCache.supported_languages.some(function(item){
      return item && normalizeLanguage(item.code) === normalized;
    });
  }

  async function fetchLocalePair(lang, page){
    var common = await fetchJson(commonLocaleUrl(lang));
    var pageSpecific = await fetchJson(pageLocaleUrl(lang, page));
    var normalizedCommon = normalizeLocalePayload(common);
    var normalizedPage = normalizeLocalePayload(pageSpecific);
    var merged = deepMerge(normalizedCommon, normalizedPage);
    var hasAny = Object.keys(merged).length > 0;
    return hasAny ? merged : null;
  }

  async function loadLocale(lang, page){
    await loadManifest();

    var requested = normalizeLanguage(lang);
    var primary = isSupportedLanguage(requested) ? requested : DEFAULT_LANGUAGE;

    var locale = await fetchLocalePair(primary, page);
    if (locale) {
      return { locale: locale, language: primary, fallback: false };
    }

    if (primary !== DEFAULT_LANGUAGE) {
      var defaultLocale = await fetchLocalePair(DEFAULT_LANGUAGE, page);
      if (defaultLocale) {
        return { locale: defaultLocale, language: DEFAULT_LANGUAGE, fallback: true };
      }
    }

    if (DEFAULT_LANGUAGE !== FALLBACK_LANGUAGE) {
      var mirrorLocale = await fetchLocalePair(FALLBACK_LANGUAGE, page);
      if (mirrorLocale) {
        return { locale: mirrorLocale, language: FALLBACK_LANGUAGE, fallback: true };
      }
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
    setLanguage: applyLanguage,
    loadLanguage: applyLanguage,
    getPageName: getPageName,
    readSavedLanguage: readSavedLanguage,
    loadManifest: loadManifest
  };
})();

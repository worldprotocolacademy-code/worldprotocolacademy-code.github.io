(function () {
  'use strict';

  var CURRENT_SCRIPT = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts.length ? scripts[scripts.length - 1] : null;
  })();

  function getLoaderBase() {
    try {
      if (CURRENT_SCRIPT && CURRENT_SCRIPT.src) {
        return new URL('.', CURRENT_SCRIPT.src).href;
      }
    } catch (e) {}
    try {
      return new URL('./', document.baseURI).href;
    } catch (e) {
      return './';
    }
  }

  var LOADER_BASE = getLoaderBase();
  var MANIFEST_URL = new URL('locales/manifest.json', LOADER_BASE).href;

  var DEFAULT_LANGUAGE = 'mk';
  var HARD_FALLBACK_LANGUAGE = 'mk';
  var RTL_LANGS = new Set(['ar', 'he']);
  var STORAGE_KEYS = ['wpa_language', 'wpa-lang'];
  var DEBUG_QUERY_KEY = 'i18n_debug';
  var DEBUG_STORAGE_KEY = 'wpa_i18n_debug';
  var manifestCache = null;

  function normalizeLanguage(lang) {
    if (!lang) return DEFAULT_LANGUAGE;
    var value = String(lang).trim();
    if (!value) return DEFAULT_LANGUAGE;
    if (value === 'zh') return 'zh-Hans';
    if (value === 'zht') return 'zh-Hant';
    return value;
  }

  function legacyLanguageCode(lang) {
    var normalized = normalizeLanguage(lang);
    if (normalized === 'zh-Hans') return 'zh';
    if (normalized === 'zh-Hant') return 'zht';
    return normalized;
  }

  function isDebugEnabled() {
    try {
      var urlFlag = new URLSearchParams(window.location.search).get(DEBUG_QUERY_KEY);
      if (urlFlag === '1' || urlFlag === 'true') return true;
    } catch (e) {}

    try {
      var stored = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (stored === '1' || stored === 'true') return true;
    } catch (e) {}

    return false;
  }

  var DEBUG = isDebugEnabled();

  function debugLog() {
    if (!DEBUG || !window.console || typeof console.warn !== 'function') return;
    console.warn.apply(console, arguments);
  }

  function getPageName() {
    if (document.body && document.body.dataset && document.body.dataset.page) {
      return document.body.dataset.page;
    }

    var path = (window.location.pathname || '').split('/').pop() || 'index.html';
    if (!path || path === '/' || path === 'index.html') return 'index';
    return path.replace(/\.html$/i, '');
  }

  function getUrlLanguage() {
    try {
      var urlLang = new URLSearchParams(window.location.search).get('lang');
      return urlLang ? normalizeLanguage(urlLang) : null;
    } catch (e) {
      return null;
    }
  }

  function readSavedLanguage() {
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

  function writeSavedLanguage(lang) {
    var normalized = normalizeLanguage(lang);
    try { localStorage.setItem('wpa_language', normalized); } catch (e) {}
    try { localStorage.setItem('wpa-lang', legacyLanguageCode(normalized)); } catch (e) {}
  }

  function getRtlSet() {
    if (manifestCache && Array.isArray(manifestCache.rtl_languages)) {
      return new Set(manifestCache.rtl_languages.map(normalizeLanguage));
    }
    return RTL_LANGS;
  }

  function setDocumentLanguage(lang) {
    var normalized = normalizeLanguage(lang);
    var rtlSet = getRtlSet();

    document.documentElement.setAttribute('lang', normalized);
    document.documentElement.setAttribute('dir', rtlSet.has(normalized) ? 'rtl' : 'ltr');

    if (document.body) {
      document.body.setAttribute('data-current-language', normalized);
    }
  }

  function syncLanguageSwitchers(lang) {
    document.querySelectorAll('[data-language-switcher]').forEach(function (select) {
      if (select.value !== lang) select.value = lang;
    });
  }

  function getNestedValue(obj, path) {
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

  function normalizeLocalePayload(payload) {
    if (!payload || typeof payload !== 'object') return {};
    if (payload.strings && typeof payload.strings === 'object') return payload.strings;
    return payload;
  }

  function deepMerge(base, extra) {
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

  function buildLocaleUrl(lang, fileName) {
    return new URL('locales/' + encodeURIComponent(lang) + '/' + encodeURIComponent(fileName), LOADER_BASE).href;
  }

  function commonLocaleUrl(lang) {
    return buildLocaleUrl(lang, 'common.json');
  }

  function pageLocaleUrl(lang, page) {
    return buildLocaleUrl(lang, page + '.json');
  }

  async function fetchJson(url) {
    try {
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function loadManifest() {
    if (manifestCache) return manifestCache;

    var manifest = await fetchJson(MANIFEST_URL);

    if (!manifest || typeof manifest !== 'object') {
      manifestCache = {
        default_language: 'mk',
        canonical_language: 'mk',
        rtl_languages: Array.from(RTL_LANGS),
        supported_languages: [
          { code: 'mk', label: 'Македонски' },
          { code: 'en', label: 'English' }
        ]
      };
      DEFAULT_LANGUAGE = 'mk';
      HARD_FALLBACK_LANGUAGE = 'mk';
      return manifestCache;
    }

    if (manifest.default_language) {
      DEFAULT_LANGUAGE = normalizeLanguage(manifest.default_language);
    }

    if (manifest.canonical_language) {
      HARD_FALLBACK_LANGUAGE = normalizeLanguage(manifest.canonical_language);
    } else {
      HARD_FALLBACK_LANGUAGE = 'mk';
    }

    manifestCache = manifest;
    return manifestCache;
  }

  function isSupportedLanguage(lang) {
    if (!manifestCache || !Array.isArray(manifestCache.supported_languages)) return true;
    var normalized = normalizeLanguage(lang);

    return manifestCache.supported_languages.some(function (item) {
      return item && normalizeLanguage(item.code) === normalized;
    });
  }

  async function fetchLocaleLayer(lang, page) {
    var common = await fetchJson(commonLocaleUrl(lang));
    var pageSpecific = await fetchJson(pageLocaleUrl(lang, page));

    return {
      common: normalizeLocalePayload(common),
      page: normalizeLocalePayload(pageSpecific)
    };
  }

  function hasAnyKeys(obj) {
    return !!obj && typeof obj === 'object' && Object.keys(obj).length > 0;
  }

  async function loadLocale(lang, page) {
    await loadManifest();

    var requested = normalizeLanguage(lang);
    var primary = isSupportedLanguage(requested) ? requested : DEFAULT_LANGUAGE;
    var canonical = normalizeLanguage(HARD_FALLBACK_LANGUAGE || 'mk');

    var primaryLayer = await fetchLocaleLayer(primary, page);
    var canonicalLayer = primary === canonical ? primaryLayer : await fetchLocaleLayer(canonical, page);

    var locale = {};
    locale = deepMerge(locale, canonicalLayer.common);
    locale = deepMerge(locale, canonicalLayer.page);

    if (primary !== canonical) {
      locale = deepMerge(locale, primaryLayer.common);
      locale = deepMerge(locale, primaryLayer.page);
    }

    if (!hasAnyKeys(locale)) {
      return {
        locale: null,
        language: canonical,
        fallback: true,
        missing: true
      };
    }

    return {
      locale: locale,
      language: primary,
      fallback: primary !== requested || primary !== canonical,
      missing: false
    };
  }

  function applyText(locale) {
    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.textContent = value;
      } else {
        debugLog('[WPA i18n missing text]', key, node);
      }
    });
  }

  function applyHtml(locale) {
    document.querySelectorAll('[data-i18n-html]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-html');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.innerHTML = value;
      } else {
        debugLog('[WPA i18n missing html]', key, node);
      }
    });
  }

  function applyPlaceholder(locale) {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-placeholder');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.setAttribute('placeholder', value);
      } else {
        debugLog('[WPA i18n missing placeholder]', key, node);
      }
    });
  }

  function applyTitleAttribute(locale) {
    document.querySelectorAll('[data-i18n-title]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-title');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.setAttribute('title', value);
      } else {
        debugLog('[WPA i18n missing title]', key, node);
      }
    });
  }

  function applyAriaLabel(locale) {
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-aria-label');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.setAttribute('aria-label', value);
      } else {
        debugLog('[WPA i18n missing aria-label]', key, node);
      }
    });
  }

  function applyValue(locale) {
    document.querySelectorAll('[data-i18n-value]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-value');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.setAttribute('value', value);
      } else {
        debugLog('[WPA i18n missing value]', key, node);
      }
    });
  }

  function applyAlt(locale) {
    document.querySelectorAll('[data-i18n-alt]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-alt');
      var value = getNestedValue(locale, key);

      if (typeof value === 'string') {
        node.setAttribute('alt', value);
      } else {
        debugLog('[WPA i18n missing alt]', key, node);
      }
    });
  }

  function applyDocumentTitle(locale) {
    var titleNode = document.querySelector('[data-i18n-title-tag]');
    if (!titleNode) return;

    var key = titleNode.getAttribute('data-i18n-title-tag');
    var value = getNestedValue(locale, key);

    if (typeof value === 'string') {
      document.title = value;
    } else {
      debugLog('[WPA i18n missing title tag]', key);
    }
  }

  async function applyLanguage(lang) {
    var page = getPageName();
    var result = await loadLocale(lang, page);

    setDocumentLanguage(result.language);
    writeSavedLanguage(result.language);
    syncLanguageSwitchers(result.language);

    if (!result.locale) {
      document.dispatchEvent(new CustomEvent('wpa:i18n:missing', {
        detail: {
          language: result.language,
          page: page
        }
      }));
      return;
    }

    applyText(result.locale);
    applyHtml(result.locale);
    applyPlaceholder(result.locale);
    applyTitleAttribute(result.locale);
    applyAriaLabel(result.locale);
    applyValue(result.locale);
    applyAlt(result.locale);
    applyDocumentTitle(result.locale);

    if (typeof window.WPA_TRANSLATOR_HOOK === 'function') {
      try {
        window.WPA_TRANSLATOR_HOOK({
          language: result.language,
          locale: result.locale,
          page: page,
          fallback: result.fallback
        });
      } catch (e) {
        debugLog('[WPA i18n hook error]', e);
      }
    }

    document.dispatchEvent(new CustomEvent('wpa:i18n:loaded', {
      detail: {
        language: result.language,
        page: page,
        fallback: result.fallback
      }
    }));
  }

  function bindLanguageSwitchers() {
    document.querySelectorAll('[data-language-switcher]').forEach(function (select) {
      select.addEventListener('change', function () {
        applyLanguage(select.value);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
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
    loadManifest: loadManifest,
    loaderBase: LOADER_BASE
  };
})();

/*!
 * WPA Translator Loader v2
 * World Protocol Academy
 *
 * Macedonian-first controlled i18n loader.
 * No API keys. No machine translation in the frontend.
 * Locale JSON only:
 *   /locales/<lang>/common.json
 *   /locales/<lang>/<page>.json
 *
 * Supported:
 *   data-i18n
 *   data-i18n-html
 *   data-i18n-placeholder
 *   data-i18n-title
 *   data-i18n-aria-label
 *   data-i18n-value
 *   title[data-i18n-title-tag]
 *
 * Anti-break rule:
 *   Missing locale or missing key keeps the original visible HTML.
 */
(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    defaultLanguage: 'mk',
    canonicalLanguage: 'mk',
    fallbackLanguage: 'mk',
    mirrorLanguage: 'en',
    manifestPath: './locales/manifest.json',
    localeBasePath: './locales',
    commonNamespace: 'common',
    selectorIds: ['pageLang', 'botLang', 'uiLang', 'aiLang'],
    storageKeys: ['wpa_language', 'wpa-lang'],
    enableMacedonianProofreader: true,
    requireCompleteLocale: false,
    lockToLanguage: null,
    debug: false
  };

  const CONFIG = Object.assign({}, DEFAULT_CONFIG, window.WPATranslatorConfig || {});

  function getLockedLanguage() {
    return CONFIG.lockToLanguage ? normalizeLanguageCode(CONFIG.lockToLanguage) : null;
  }
  let manifest = null;
  let registry = [];
  let registryMap = new Map();
  let currentLanguage = CONFIG.defaultLanguage;
  let currentLocale = {};
  let currentPage = null;

  function log() {
    if (CONFIG.debug && console && console.log) {
      console.log.apply(console, ['[WPA Translator]'].concat(Array.from(arguments)));
    }
  }

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  }

  function getPageName() {
    const pageFromBody = document.body && document.body.dataset ? document.body.dataset.page : '';
    if (pageFromBody) return pageFromBody.trim();

    const path = window.location.pathname || '/';
    if (path === '/' || path.endsWith('/index.html')) return 'index';
    if (path.endsWith('/')) {
      const parts = path.split('/').filter(Boolean);
      return parts[parts.length - 1] || 'index';
    }
    const last = path.split('/').pop() || 'index.html';
    return last.replace(/\.html$/i, '') || 'index';
  }

  function buildRegistryMap(langs) {
    const map = new Map();
    langs.forEach(function (lang) { map.set(lang.code, lang); });
    return map;
  }

  function normalizeLanguageCode(code) {
    if (!code || typeof code !== 'string') return CONFIG.defaultLanguage;
    const raw = code.trim();
    if (registryMap.has(raw)) return raw;

    const lower = raw.toLowerCase();
    const aliases = {
      'zh': 'zh-Hans',
      'zh-cn': 'zh-Hans',
      'zh-sg': 'zh-Hans',
      'zh-hans': 'zh-Hans',
      'zh-tw': 'zh-Hant',
      'zh-hk': 'zh-Hant',
      'zh-mo': 'zh-Hant',
      'zh-hant': 'zh-Hant',
      'iw': 'he'
    };

    if (aliases[lower] && registryMap.has(aliases[lower])) return aliases[lower];

    const first = lower.split('-')[0];
    for (const lang of registry) {
      if (lang.code.toLowerCase() === first) return lang.code;
    }

    return CONFIG.defaultLanguage;
  }

  function getStoredLanguage() {
    for (const key of CONFIG.storageKeys) {
      const value = safeGet(key);
      if (value) return normalizeLanguageCode(value);
    }
    return null;
  }

  function getPreferredLanguage() {
    const locked = getLockedLanguage();
    if (locked) return locked;

    const stored = getStoredLanguage();
    if (stored) return stored;

    if (document.documentElement && document.documentElement.lang) {
      return normalizeLanguageCode(document.documentElement.lang);
    }

    if (navigator.languages && navigator.languages.length) {
      return normalizeLanguageCode(navigator.languages[0]);
    }

    if (navigator.language) return normalizeLanguageCode(navigator.language);
    return CONFIG.defaultLanguage;
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-cache'
    });
    if (!response.ok) throw new Error(response.status + ' ' + response.statusText + ' for ' + url);
    return response.json();
  }

  function localeUrl(language, namespace) {
    return CONFIG.localeBasePath.replace(/\/$/, '') + '/' +
      encodeURIComponent(language) + '/' +
      encodeURIComponent(namespace) + '.json';
  }

  function mergeDeep(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (key) {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        mergeDeep(target[key], value);
      } else {
        target[key] = value;
      }
    });
    return target;
  }

  async function tryLoadNamespace(language, namespace) {
    try {
      return await fetchJson(localeUrl(language, namespace));
    } catch (error) {
      log('missing namespace', language, namespace, error.message);
      return null;
    }
  }

  async function loadLocale(language, page) {
    const result = {};

    const fallbackCommon = await tryLoadNamespace(CONFIG.fallbackLanguage, CONFIG.commonNamespace);
    const fallbackPage = await tryLoadNamespace(CONFIG.fallbackLanguage, page);
    mergeDeep(result, fallbackCommon || {});
    mergeDeep(result, fallbackPage || {});

    if (language !== CONFIG.fallbackLanguage) {
      const common = await tryLoadNamespace(language, CONFIG.commonNamespace);
      const pageLocale = await tryLoadNamespace(language, page);

      if (CONFIG.requireCompleteLocale && (!common || !pageLocale)) {
        log('incomplete locale, using full fallback', language, page);
        return result;
      }

      mergeDeep(result, common || {});
      mergeDeep(result, pageLocale || {});
    }

    return result;
  }

  function resolvePath(obj, path) {
    if (!obj || !path) return undefined;
    return String(path).split('.').filter(Boolean).reduce(function (acc, key) {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) return acc[key];
      return undefined;
    }, obj);
  }

  function setIfValue(element, setter, value) {
    if (value === undefined || value === null) return;
    setter(element, String(value));
  }

  function applyProofreading(value) {
    if (!CONFIG.enableMacedonianProofreader) return value;
    if (currentLanguage !== 'mk') return value;
    if (!window.WPAMKProofreader || typeof window.WPAMKProofreader.fixText !== 'function') return value;
    return window.WPAMKProofreader.fixText(String(value));
  }

  function applyLocaleToDom(locale) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const value = resolvePath(locale, el.getAttribute('data-i18n'));
      setIfValue(el, function (node, text) { node.textContent = applyProofreading(text); }, value);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const value = resolvePath(locale, el.getAttribute('data-i18n-html'));
      setIfValue(el, function (node, text) { node.innerHTML = applyProofreading(text); }, value);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const value = resolvePath(locale, el.getAttribute('data-i18n-placeholder'));
      setIfValue(el, function (node, text) { node.setAttribute('placeholder', applyProofreading(text)); }, value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      const value = resolvePath(locale, el.getAttribute('data-i18n-title'));
      setIfValue(el, function (node, text) { node.setAttribute('title', applyProofreading(text)); }, value);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
      const value = resolvePath(locale, el.getAttribute('data-i18n-aria-label'));
      setIfValue(el, function (node, text) { node.setAttribute('aria-label', applyProofreading(text)); }, value);
    });

    document.querySelectorAll('[data-i18n-value]').forEach(function (el) {
      const value = resolvePath(locale, el.getAttribute('data-i18n-value'));
      setIfValue(el, function (node, text) { node.value = applyProofreading(text); }, value);
    });

    const title = document.querySelector('title[data-i18n-title-tag]');
    if (title) {
      const value = resolvePath(locale, title.getAttribute('data-i18n-title-tag'));
      if (value !== undefined && value !== null) document.title = applyProofreading(String(value));
    }
  }

  function getDirection(language) {
    const item = registryMap.get(language);
    return item && item.dir ? item.dir : 'ltr';
  }

  function setDocumentLanguage(language) {
    const dir = getDirection(language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.dataset.currentLanguage = language;
    document.documentElement.classList.toggle('wpa-rtl', dir === 'rtl');

    if (document.body) {
      document.body.dir = dir;
      document.body.dataset.currentLanguage = language;
    }
  }

  function populateSelect(select, language) {
    if (!select) return;

    const hasOptions = select.options && select.options.length > 0;
    if (!hasOptions) {
      registry.forEach(function (lang) {
        if (lang.enabled === false) return;
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.label;
        select.appendChild(option);
      });
    }

    if (Array.from(select.options).some(function (option) { return option.value === language; })) {
      select.value = language;
    }

    if (!select.dataset.wpaTranslatorBound) {
      select.addEventListener('change', function () {
        window.WPAI18n.setLanguage(select.value);
      });
      select.dataset.wpaTranslatorBound = 'true';
    }
  }

  function populateLanguageControls(language) {
    const locked = getLockedLanguage();
    document.querySelectorAll('select[data-language-switcher]').forEach(function (select) {
      populateSelect(select, language);
      if (locked) select.disabled = true;
    });

    CONFIG.selectorIds.forEach(function (id) {
      const select = document.getElementById(id);
      populateSelect(select, language);
      if (select && locked) select.disabled = true;
    });

    document.querySelectorAll('[data-language-buttons]').forEach(function (container) {
      if (!container.dataset.wpaTranslatorBuilt) {
        container.innerHTML = '';
        registry.forEach(function (lang) {
          if (lang.enabled === false) return;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'wpa-lang-btn';
          button.dataset.languageCode = lang.code;
          button.textContent = lang.label;
          button.addEventListener('click', function () {
            window.WPAI18n.setLanguage(lang.code);
          });
          if (locked) button.disabled = true;
          container.appendChild(button);
        });
        container.dataset.wpaTranslatorBuilt = 'true';
      }

      container.querySelectorAll('[data-language-code]').forEach(function (button) {
        const active = button.dataset.languageCode === language;
        button.dataset.active = active ? 'true' : 'false';
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });
  }

  function rememberLanguage(language) {
    CONFIG.storageKeys.forEach(function (key) { safeSet(key, language); });
  }

  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail }));
  }

  async function loadManifest() {
    try {
      manifest = await fetchJson(CONFIG.manifestPath);
      registry = Array.isArray(manifest.languages) ? manifest.languages : [];
      registryMap = buildRegistryMap(registry);
      if (!registryMap.has(CONFIG.defaultLanguage)) {
        registry.unshift({ code: CONFIG.defaultLanguage, label: 'Македонски', dir: 'ltr', enabled: true });
        registryMap = buildRegistryMap(registry);
      }
    } catch (error) {
      console.error('[WPA Translator] manifest failed, using emergency mk/en registry:', error);
      registry = [
        { code: 'mk', label: 'Македонски', dir: 'ltr', enabled: true },
        { code: 'en', label: 'English', dir: 'ltr', enabled: true }
      ];
      registryMap = buildRegistryMap(registry);
    }
  }

  window.WPAI18n = {
    async init() {
      currentPage = getPageName();
      await loadManifest();
      const preferred = getPreferredLanguage();
      return this.setLanguage(preferred);
    },

    async setLanguage(languageCode) {
      const locked = getLockedLanguage();
      const language = locked || normalizeLanguageCode(languageCode);
      currentPage = currentPage || getPageName();

      try {
        const locale = await loadLocale(language, currentPage);
        currentLanguage = language;
        currentLocale = locale;
        rememberLanguage(language);
        setDocumentLanguage(language);
        populateLanguageControls(language);
        applyLocaleToDom(locale);
        emit('wpa:i18n:loaded', { language: language, page: currentPage, locale: locale });
        return locale;
      } catch (error) {
        console.error('[WPA Translator] failed:', error);
        emit('wpa:i18n:error', { language: language, page: currentPage, error: error });
        return null;
      }
    },

    async reload() {
      return this.setLanguage(currentLanguage);
    },

    getLanguage() {
      return currentLanguage;
    },

    getPage() {
      return currentPage || getPageName();
    },

    getLocale() {
      return currentLocale;
    },

    getRegistry() {
      return registry.slice();
    },

    t(path, fallbackValue) {
      const value = resolvePath(currentLocale, path);
      return value === undefined || value === null ? (fallbackValue || '') : value;
    },

    normalizeLanguageCode: normalizeLanguageCode
  };

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  ready(function () {
    window.WPAI18n.init();
  });
})();

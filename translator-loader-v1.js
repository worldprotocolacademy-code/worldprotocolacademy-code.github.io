/*!
 * WPA Translator Loader v1
 * Vanilla JS i18n loader for World Protocol Academy
 * Source-of-truth language: Macedonian (mk)
 * No API key in frontend. Locale JSON files only.
 *
 * Expected locale structure:
 *   /locales/<lang>/<page>.json
 * Example:
 *   /locales/mk/index.json
 *   /locales/en/index.json
 *   /locales/mk/partnerships.json
 *
 * HTML usage:
 *   <body data-page="index">
 *   <script src="translator-loader-v1.js" defer></script>
 *
 * Data attributes supported:
 *   data-i18n="hero.title"                  -> textContent
 *   data-i18n-html="hero.lead"              -> innerHTML
 *   data-i18n-placeholder="bot.input_placeholder"
 *   data-i18n-title="global.site_name"
 *   data-i18n-aria-label="bot.aria.input"
 *   data-i18n-value="global.send"
 *
 * Optional language switcher hooks:
 *   <select data-language-switcher></select>
 *   <div data-language-buttons></div>
 *
 * Optional root containers:
 *   <html> and <body> will receive:
 *     lang=<selected lang>
 *     dir=ltr|rtl
 *     data-current-language=<selected lang>
 *
 * Optional callback:
 *   window.WPA_TRANSLATOR_HOOK = function ({ page, language, locale }) {}
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'wpa_language';
  const DEFAULT_LANGUAGE = 'mk';
  const DEFAULT_DIR = 'ltr';
  const RTL_LANGS = new Set(['ar', 'he']);

  // Phase 1 language registry: Macedonian-first + Balkan + Europe + global core.
  // Labels are intentionally native / internationally readable.
  const LANGUAGE_REGISTRY = [
    { code: 'mk', label: 'Македонски', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'en', label: 'English', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'sq', label: 'Shqip', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'el', label: 'Ελληνικά', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'sr', label: 'Српски', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'hr', label: 'Hrvatski', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'bs', label: 'Bosanski', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'sl', label: 'Slovenščina', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'bg', label: 'Български', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'ro', label: 'Română', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'de', label: 'Deutsch', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'fr', label: 'Français', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'it', label: 'Italiano', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'es', label: 'Español', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'pt', label: 'Português', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'nl', label: 'Nederlands', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'pl', label: 'Polski', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'cs', label: 'Čeština', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'sk', label: 'Slovenčina', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'hu', label: 'Magyar', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'sv', label: 'Svenska', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'da', label: 'Dansk', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'no', label: 'Norsk', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'fi', label: 'Suomi', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'uk', label: 'Українська', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'ru', label: 'Русский', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'tr', label: 'Türkçe', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'ar', label: 'العربية', dir: 'rtl', priority: 'A', enabled: true },
    { code: 'he', label: 'עברית', dir: 'rtl', priority: 'A', enabled: true },
    { code: 'hi', label: 'हिन्दी', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'zh-Hans', label: '简体中文', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'zh-Hant', label: '繁體中文', dir: 'ltr', priority: 'A', enabled: true },
    { code: 'ja', label: '日本語', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'ko', label: '한국어', dir: 'ltr', priority: 'B', enabled: true },
    { code: 'sw', label: 'Kiswahili', dir: 'ltr', priority: 'C', enabled: true },
    { code: 'am', label: 'አማርኛ', dir: 'ltr', priority: 'C', enabled: true },
    { code: 'ha', label: 'Hausa', dir: 'ltr', priority: 'C', enabled: true },
    { code: 'af', label: 'Afrikaans', dir: 'ltr', priority: 'C', enabled: true }
  ];

  function safeLocalStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // noop
    }
  }

  function getRegistryMap() {
    const map = new Map();
    for (const lang of LANGUAGE_REGISTRY) {
      map.set(lang.code, lang);
    }
    return map;
  }

  const REGISTRY_MAP = getRegistryMap();

  function normalizeLanguageCode(code) {
    if (!code || typeof code !== 'string') return DEFAULT_LANGUAGE;
    const trimmed = code.trim();

    if (REGISTRY_MAP.has(trimmed)) return trimmed;

    // Common browser language reductions:
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('mk')) return 'mk';
    if (lower.startsWith('en')) return 'en';
    if (lower.startsWith('sq')) return 'sq';
    if (lower.startsWith('el')) return 'el';
    if (lower.startsWith('sr')) return 'sr';
    if (lower.startsWith('hr')) return 'hr';
    if (lower.startsWith('bs')) return 'bs';
    if (lower.startsWith('sl')) return 'sl';
    if (lower.startsWith('bg')) return 'bg';
    if (lower.startsWith('ro')) return 'ro';
    if (lower.startsWith('de')) return 'de';
    if (lower.startsWith('fr')) return 'fr';
    if (lower.startsWith('it')) return 'it';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('pt')) return 'pt';
    if (lower.startsWith('nl')) return 'nl';
    if (lower.startsWith('pl')) return 'pl';
    if (lower.startsWith('cs')) return 'cs';
    if (lower.startsWith('sk')) return 'sk';
    if (lower.startsWith('hu')) return 'hu';
    if (lower.startsWith('sv')) return 'sv';
    if (lower.startsWith('da')) return 'da';
    if (lower.startsWith('no')) return 'no';
    if (lower.startsWith('fi')) return 'fi';
    if (lower.startsWith('uk')) return 'uk';
    if (lower.startsWith('ru')) return 'ru';
    if (lower.startsWith('tr')) return 'tr';
    if (lower.startsWith('ar')) return 'ar';
    if (lower.startsWith('he') || lower.startsWith('iw')) return 'he';
    if (lower.startsWith('hi')) return 'hi';
    if (lower === 'zh' || lower.startsWith('zh-cn') || lower.startsWith('zh-sg')) return 'zh-Hans';
    if (lower.startsWith('zh-tw') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo')) return 'zh-Hant';
    if (lower.startsWith('ja')) return 'ja';
    if (lower.startsWith('ko')) return 'ko';
    if (lower.startsWith('sw')) return 'sw';
    if (lower.startsWith('am')) return 'am';
    if (lower.startsWith('ha')) return 'ha';
    if (lower.startsWith('af')) return 'af';

    return DEFAULT_LANGUAGE;
  }

  function getPreferredLanguage() {
    const stored = safeLocalStorageGet(STORAGE_KEY);
    if (stored) return normalizeLanguageCode(stored);

    if (document.documentElement && document.documentElement.lang) {
      return normalizeLanguageCode(document.documentElement.lang);
    }

    if (navigator.languages && Array.isArray(navigator.languages) && navigator.languages.length > 0) {
      return normalizeLanguageCode(navigator.languages[0]);
    }

    if (navigator.language) {
      return normalizeLanguageCode(navigator.language);
    }

    return DEFAULT_LANGUAGE;
  }

  function getDirection(language) {
    if (REGISTRY_MAP.has(language)) {
      return REGISTRY_MAP.get(language).dir || DEFAULT_DIR;
    }
    return RTL_LANGS.has(language) ? 'rtl' : DEFAULT_DIR;
  }

  function getPageName() {
    const bodyPage = document.body && document.body.dataset ? document.body.dataset.page : '';
    if (bodyPage) return bodyPage.trim();

    const path = window.location.pathname || '/';
    if (path.endsWith('/') && path !== '/') {
      // folder route like /partnerships/
      const segments = path.split('/').filter(Boolean);
      return segments[segments.length - 1] || 'index';
    }

    const last = path.split('/').pop() || 'index.html';
    if (!last || last === '/') return 'index';
    if (last.endsWith('.html')) return last.replace(/\.html$/i, '') || 'index';
    return last || 'index';
  }

  function buildLocaleUrl(language, page) {
    return `locales/${encodeURIComponent(language)}/${encodeURIComponent(page)}.json`;
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`Locale fetch failed: ${response.status} ${response.statusText} for ${url}`);
    }

    return response.json();
  }

  async function loadLocale(language, page) {
    const primaryUrl = buildLocaleUrl(language, page);

    try {
      return await fetchJson(primaryUrl);
    } catch (primaryError) {
      if (language !== DEFAULT_LANGUAGE) {
        const fallbackUrl = buildLocaleUrl(DEFAULT_LANGUAGE, page);
        return await fetchJson(fallbackUrl);
      }
      throw primaryError;
    }
  }

  function resolvePath(obj, path) {
    if (!obj || !path) return undefined;
    const parts = String(path).split('.').filter(Boolean);
    let current = obj;

    for (const part of parts) {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  function setTextContent(el, value) {
    if (value === null || value === undefined) return;
    el.textContent = String(value);
  }

  function setInnerHtml(el, value) {
    if (value === null || value === undefined) return;
    el.innerHTML = String(value);
  }

  function setAttribute(el, attrName, value) {
    if (value === null || value === undefined) return;
    el.setAttribute(attrName, String(value));
  }

  function applyLocaleToDom(locale) {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        setTextContent(el, value);
      }
    });

    // HTML content
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        setInnerHtml(el, value);
      }
    });

    // Input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        setAttribute(el, 'placeholder', value);
      }
    });

    // Title attributes
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        setAttribute(el, 'title', value);
      }
    });

    // Aria labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        setAttribute(el, 'aria-label', value);
      }
    });

    // Value attributes (buttons/inputs)
    document.querySelectorAll('[data-i18n-value]').forEach((el) => {
      const key = el.getAttribute('data-i18n-value');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        el.value = String(value);
      }
    });

    // Optional document title binding
    const titleEl = document.querySelector('title[data-i18n-title-tag]');
    if (titleEl) {
      const key = titleEl.getAttribute('data-i18n-title-tag');
      const value = resolvePath(locale, key);
      if (typeof value === 'string' || typeof value === 'number') {
        document.title = String(value);
      }
    }
  }

  function populateSelects(currentLanguage) {
    document.querySelectorAll('select[data-language-switcher]').forEach((select) => {
      const existingCodes = new Set(Array.from(select.options).map((o) => o.value));
      if (existingCodes.size === 0) {
        for (const lang of LANGUAGE_REGISTRY) {
          if (!lang.enabled) continue;
          const option = document.createElement('option');
          option.value = lang.code;
          option.textContent = lang.label;
          select.appendChild(option);
        }
      }
      select.value = currentLanguage;
      if (!select.dataset.wpaTranslatorBound) {
        select.addEventListener('change', async (event) => {
          const nextLang = normalizeLanguageCode(event.target.value);
          await window.WPAI18n.setLanguage(nextLang);
        });
        select.dataset.wpaTranslatorBound = 'true';
      }
    });
  }

  function populateButtonContainers(currentLanguage) {
    document.querySelectorAll('[data-language-buttons]').forEach((container) => {
      if (!container.dataset.wpaTranslatorBuilt) {
        container.innerHTML = '';
        for (const lang of LANGUAGE_REGISTRY) {
          if (!lang.enabled) continue;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'wpa-lang-btn';
          button.dataset.languageCode = lang.code;
          button.textContent = lang.label;
          button.addEventListener('click', async () => {
            await window.WPAI18n.setLanguage(lang.code);
          });
          container.appendChild(button);
        }
        container.dataset.wpaTranslatorBuilt = 'true';
      }

      container.querySelectorAll('[data-language-code]').forEach((button) => {
        const isActive = button.getAttribute('data-language-code') === currentLanguage;
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        button.dataset.active = isActive ? 'true' : 'false';
      });
    });
  }

  function setDocumentLanguage(language) {
    const dir = getDirection(language);

    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.dataset.currentLanguage = language;

    if (document.body) {
      document.body.dataset.currentLanguage = language;
      document.body.dir = dir;
    }
  }

  function signalLoadedState(language, page, locale) {
    document.dispatchEvent(
      new CustomEvent('wpa:i18n:loaded', {
        detail: { language, page, locale }
      })
    );

    if (typeof window.WPA_TRANSLATOR_HOOK === 'function') {
      try {
        window.WPA_TRANSLATOR_HOOK({ language, page, locale });
      } catch (error) {
        console.error('WPA_TRANSLATOR_HOOK failed:', error);
      }
    }
  }

  function signalErrorState(error, language, page) {
    document.dispatchEvent(
      new CustomEvent('wpa:i18n:error', {
        detail: { error, language, page }
      })
    );
  }

  const WPAI18n = {
    page: null,
    language: null,
    locale: null,
    registry: LANGUAGE_REGISTRY.slice(),

    async init() {
      this.page = getPageName();
      const preferred = getPreferredLanguage();
      await this.setLanguage(preferred);
      return this;
    },

    getPage() {
      return this.page || getPageName();
    },

    getLanguage() {
      return this.language || getPreferredLanguage();
    },

    getLocale() {
      return this.locale;
    },

    getRegistry() {
      return this.registry.slice();
    },

    t(path, fallbackValue = '') {
      const locale = this.locale || {};
      const value = resolvePath(locale, path);

      if (value === undefined || value === null) {
        return fallbackValue;
      }
      return value;
    },

    async setLanguage(nextLanguage) {
      const language = normalizeLanguageCode(nextLanguage);
      const page = this.getPage();

      try {
        const locale = await loadLocale(language, page);
        this.language = language;
        this.locale = locale;

        safeLocalStorageSet(STORAGE_KEY, language);
        setDocumentLanguage(language);
        applyLocaleToDom(locale);
        populateSelects(language);
        populateButtonContainers(language);
        signalLoadedState(language, page, locale);

        return locale;
      } catch (error) {
        console.error('WPA Translator Loader error:', error);
        signalErrorState(error, language, page);

        if (language !== DEFAULT_LANGUAGE) {
          return this.setLanguage(DEFAULT_LANGUAGE);
        }
        throw error;
      }
    },

    async reload() {
      return this.setLanguage(this.getLanguage());
    }
  };

  window.WPAI18n = WPAI18n;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  ready(() => {
    WPAI18n.init().catch((error) => {
      console.error('WPA Translator Loader fatal init error:', error);
    });
  });
})();

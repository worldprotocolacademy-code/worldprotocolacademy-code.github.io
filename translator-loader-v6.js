/*!
 * WPA Translator Loader v6.0
 * --------------------------------------------------------------
 * Самостоен јазичен loader за World Protocol Academy (WPA).
 * Standalone language loader for World Protocol Academy (WPA).
 *
 * Author:    World Protocol Academy, Skopje
 * Contact:   worldprotocolacademy@gmail.com
 * License:   Internal use; WPA infrastructure
 * Version:   6.0.0  (May 2026)
 * Doctrine:  „Преговарањето е опционално. Протоколот е апсолутен."
 *
 * RESPONSIBILITIES
 *   1. Detect the visitor's language from navigator.language / navigator.languages
 *   2. Automatically redirect to the matching language folder (e.g. /zh/index.html)
 *   3. Render a dropdown language selector (52 options from embedded registry)
 *   4. Persist the user's manual choice in localStorage
 *   5. Fall back to Macedonian (mk) when the requested language is unsupported
 *
 * PLACEMENT
 *   Insert in the <head> of every HTML page in the WPA repository:
 *     <script src="/scripts/translator-loader-v6.js" defer></script>
 *
 * OFFLINE BEHAVIOUR
 *   - The full language registry is EMBEDDED in this file (no fetch required).
 *   - The selector is built from in-memory data; no network calls.
 *   - All redirects use relative paths so the loader works on file://, localhost,
 *     GitHub Pages, R2, Cloudflare Workers, or any static host.
 *
 * INTEGRATION POINTS (do not modify without coordinating with WPA Director)
 *   - localStorage key:        WPA_LANG_V6
 *   - URL query override:      ?lang=xx   (e.g. ?lang=fr forces French)
 *   - URL query bypass:        ?nolang=1  (skip redirect; force current page)
 *   - <html lang="...">         updated at runtime
 *   - <html dir="...">          updated at runtime for RTL languages
 *   - Selector mount point:    [data-wpa-lang-selector]
 *                               or auto-created floating widget if absent
 *   - Brand terms PROTECTED:   World Protocol Academy, WPA, WPAWS,
 *                               Virtual Sande, Protocol Symbols Lab,
 *                               Diplomatic Analysis Lab
 * --------------------------------------------------------------
 */

(function () {
  'use strict';

  // ============================================================
  //  CONFIGURATION
  // ============================================================

  var CONFIG = {
    storageKey: 'WPA_LANG_V6',
    legacyStorageKeys: ['WPA_LANG', 'wpaLang', 'lang', 'language'],
    defaultLang: 'mk',
    fallbackLang: 'mk',
    secondaryLang: 'en',
    queryParam: 'lang',
    bypassParam: 'nolang',
    pathPrefix: '/',          // root of the WPA site
    selectorMount: '[data-wpa-lang-selector]',
    autoFloatingWidget: true, // create floating widget if no mount point found
    redirectOnFirstVisit: true,
    debug: false              // set true to enable console diagnostics
  };

  // ============================================================
  //  LANGUAGE REGISTRY (embedded, matches data/languages.json)
  //  52 languages: 2 verified + 12 priority-1 + 38 priority-2
  // ============================================================

  var REGISTRY = {
    // ---------- Priority 0: verified canonical languages ----------
    mk: { name: 'Македонски',       en: 'Macedonian',       script: 'Cyrl', dir: 'ltr', priority: 0 },
    en: { name: 'English (UK)',     en: 'English (UK)',     script: 'Latn', dir: 'ltr', priority: 0 },

    // ---------- Priority 1: top 12 global ----------
    zh: { name: '中文',              en: 'Chinese',          script: 'Hani', dir: 'ltr', priority: 1 },
    ru: { name: 'Русский',          en: 'Russian',          script: 'Cyrl', dir: 'ltr', priority: 1 },
    ar: { name: 'العربية',           en: 'Arabic',           script: 'Arab', dir: 'rtl', priority: 1 },
    fr: { name: 'Français',         en: 'French',           script: 'Latn', dir: 'ltr', priority: 1 },
    de: { name: 'Deutsch',          en: 'German',           script: 'Latn', dir: 'ltr', priority: 1 },
    it: { name: 'Italiano',         en: 'Italian',          script: 'Latn', dir: 'ltr', priority: 1 },
    es: { name: 'Español',          en: 'Spanish',          script: 'Latn', dir: 'ltr', priority: 1 },
    tr: { name: 'Türkçe',           en: 'Turkish',          script: 'Latn', dir: 'ltr', priority: 1 },
    sq: { name: 'Shqip',            en: 'Albanian',         script: 'Latn', dir: 'ltr', priority: 1 },
    sr: { name: 'Српски',           en: 'Serbian',          script: 'Cyrl', dir: 'ltr', priority: 1 },
    bg: { name: 'Български',        en: 'Bulgarian',        script: 'Cyrl', dir: 'ltr', priority: 1 },
    el: { name: 'Ελληνικά',         en: 'Greek',            script: 'Grek', dir: 'ltr', priority: 1 },

    // ---------- Priority 2: extended coverage (38) ----------
    ja: { name: '日本語',            en: 'Japanese',         script: 'Jpan', dir: 'ltr', priority: 2 },
    ko: { name: '한국어',            en: 'Korean',           script: 'Kore', dir: 'ltr', priority: 2 },
    hi: { name: 'हिन्दी',             en: 'Hindi',            script: 'Deva', dir: 'ltr', priority: 2 },
    pt: { name: 'Português',        en: 'Portuguese',       script: 'Latn', dir: 'ltr', priority: 2 },
    nl: { name: 'Nederlands',       en: 'Dutch',            script: 'Latn', dir: 'ltr', priority: 2 },
    sv: { name: 'Svenska',          en: 'Swedish',          script: 'Latn', dir: 'ltr', priority: 2 },
    pl: { name: 'Polski',           en: 'Polish',           script: 'Latn', dir: 'ltr', priority: 2 },
    cs: { name: 'Čeština',          en: 'Czech',            script: 'Latn', dir: 'ltr', priority: 2 },
    sk: { name: 'Slovenčina',       en: 'Slovak',           script: 'Latn', dir: 'ltr', priority: 2 },
    hu: { name: 'Magyar',           en: 'Hungarian',        script: 'Latn', dir: 'ltr', priority: 2 },
    ro: { name: 'Română',           en: 'Romanian',         script: 'Latn', dir: 'ltr', priority: 2 },
    fi: { name: 'Suomi',            en: 'Finnish',          script: 'Latn', dir: 'ltr', priority: 2 },
    da: { name: 'Dansk',            en: 'Danish',           script: 'Latn', dir: 'ltr', priority: 2 },
    no: { name: 'Norsk',            en: 'Norwegian',        script: 'Latn', dir: 'ltr', priority: 2 },
    et: { name: 'Eesti',            en: 'Estonian',         script: 'Latn', dir: 'ltr', priority: 2 },
    lv: { name: 'Latviešu',         en: 'Latvian',          script: 'Latn', dir: 'ltr', priority: 2 },
    lt: { name: 'Lietuvių',         en: 'Lithuanian',       script: 'Latn', dir: 'ltr', priority: 2 },
    sl: { name: 'Slovenščina',      en: 'Slovenian',        script: 'Latn', dir: 'ltr', priority: 2 },
    hr: { name: 'Hrvatski',         en: 'Croatian',         script: 'Latn', dir: 'ltr', priority: 2 },
    bs: { name: 'Bosanski',         en: 'Bosnian',          script: 'Latn', dir: 'ltr', priority: 2 },
    me: { name: 'Crnogorski',       en: 'Montenegrin',      script: 'Latn', dir: 'ltr', priority: 2 },
    uk: { name: 'Українська',       en: 'Ukrainian',        script: 'Cyrl', dir: 'ltr', priority: 2 },
    be: { name: 'Беларуская',       en: 'Belarusian',       script: 'Cyrl', dir: 'ltr', priority: 2 },
    kk: { name: 'Қазақша',          en: 'Kazakh',           script: 'Cyrl', dir: 'ltr', priority: 2 },
    uz: { name: 'Oʻzbekcha',        en: 'Uzbek',            script: 'Latn', dir: 'ltr', priority: 2 },
    ka: { name: 'ქართული',         en: 'Georgian',         script: 'Geor', dir: 'ltr', priority: 2 },
    hy: { name: 'Հայերեն',          en: 'Armenian',         script: 'Armn', dir: 'ltr', priority: 2 },
    mt: { name: 'Malti',            en: 'Maltese',          script: 'Latn', dir: 'ltr', priority: 2 },
    is: { name: 'Íslenska',         en: 'Icelandic',        script: 'Latn', dir: 'ltr', priority: 2 },
    ga: { name: 'Gaeilge',          en: 'Irish',            script: 'Latn', dir: 'ltr', priority: 2 },
    cy: { name: 'Cymraeg',          en: 'Welsh',            script: 'Latn', dir: 'ltr', priority: 2 },
    he: { name: 'עברית',            en: 'Hebrew',           script: 'Hebr', dir: 'rtl', priority: 2 },
    fa: { name: 'فارسی',            en: 'Persian',          script: 'Arab', dir: 'rtl', priority: 2 },
    th: { name: 'ไทย',              en: 'Thai',             script: 'Thai', dir: 'ltr', priority: 2 },
    vi: { name: 'Tiếng Việt',       en: 'Vietnamese',       script: 'Latn', dir: 'ltr', priority: 2 },
    id: { name: 'Bahasa Indonesia', en: 'Indonesian',       script: 'Latn', dir: 'ltr', priority: 2 },
    ms: { name: 'Bahasa Melayu',    en: 'Malay',            script: 'Latn', dir: 'ltr', priority: 2 },
    sw: { name: 'Kiswahili',        en: 'Swahili',          script: 'Latn', dir: 'ltr', priority: 2 }
  };

  // ============================================================
  //  REGION → CODE ALIASES
  //  navigator.language returns BCP-47 tags like "zh-CN", "pt-BR",
  //  "sr-Latn-RS". We strip the region/script and map exceptions.
  // ============================================================

  var ALIASES = {
    // Chinese variants — all collapse to 'zh'
    'zh-cn': 'zh', 'zh-sg': 'zh', 'zh-hans': 'zh',
    'zh-tw': 'zh', 'zh-hk': 'zh', 'zh-mo': 'zh', 'zh-hant': 'zh',
    // Norwegian variants
    'nb': 'no', 'nn': 'no', 'nb-no': 'no', 'nn-no': 'no',
    // Serbian script variants
    'sr-latn': 'sr', 'sr-cyrl': 'sr',
    // Montenegrin
    'cnr': 'me',
    // Filipino / Tagalog → not supported, falls through
    // Hebrew legacy
    'iw': 'he',
    // Indonesian legacy
    'in': 'id'
  };

  // ============================================================
  //  STATE
  // ============================================================

  var STATE = {
    detected: null,
    chosen: null,
    fromStorage: false,
    fromQuery: false,
    fromBrowser: false,
    currentPageLang: null
  };

  // ============================================================
  //  UTILITIES
  // ============================================================

  function log() {
    if (CONFIG.debug && typeof console !== 'undefined' && console.log) {
      console.log.apply(console, ['[WPA-i18n]'].concat([].slice.call(arguments)));
    }
  }

  function warn() {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn.apply(console, ['[WPA-i18n]'].concat([].slice.call(arguments)));
    }
  }

  function safeStorage(method, key, value) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      if (method === 'get') return window.localStorage.getItem(key);
      if (method === 'set') { window.localStorage.setItem(key, value); return value; }
      if (method === 'del') { window.localStorage.removeItem(key); return null; }
    } catch (e) {
      log('localStorage unavailable:', e && e.message);
      return null;
    }
    return null;
  }

  function isSupported(code) {
    return !!(code && REGISTRY.hasOwnProperty(code));
  }

  /**
   * Normalises any BCP-47 / browser-style language tag to a 2-letter WPA code.
   * Examples:
   *   "zh-CN"      → "zh"
   *   "sr-Latn-RS" → "sr"
   *   "pt-BR"      → "pt"
   *   "nb"         → "no"
   *   "FR"         → "fr"
   *   "klingon"    → null  (unsupported → caller falls back to mk)
   */
  function normalise(raw) {
    if (!raw || typeof raw !== 'string') return null;
    var tag = raw.toLowerCase().trim();
    if (!tag) return null;

    // Direct match
    if (isSupported(tag)) return tag;
    if (ALIASES[tag]) return ALIASES[tag];

    // Try increasingly broader subtags
    var parts = tag.split('-');
    while (parts.length > 0) {
      var candidate = parts.join('-');
      if (ALIASES[candidate]) return ALIASES[candidate];
      if (isSupported(candidate)) return candidate;
      parts.pop();
    }

    // Bare 2-letter code attempt
    var primary = tag.slice(0, 2);
    if (isSupported(primary)) return primary;
    if (ALIASES[primary]) return ALIASES[primary];

    return null;
  }

  function getQueryParam(name) {
    try {
      var search = window.location.search;
      if (!search || search.length < 2) return null;
      var pairs = search.substring(1).split('&');
      for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split('=');
        if (decodeURIComponent(kv[0]) === name) {
          return decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
        }
      }
    } catch (e) {
      log('Query parse error:', e && e.message);
    }
    return null;
  }

  /**
   * Reads the current page's language from one of:
   *   1. URL path segment:   /zh/index.html → "zh"
   *   2. <html lang="...">   attribute (fallback)
   *   3. CONFIG.defaultLang  (last resort)
   */
  function detectCurrentPageLang() {
    try {
      var path = window.location.pathname || '/';
      // Match /xx/ or /xx- prefix
      var m = path.match(/^\/([a-z]{2,3})(?:[\/\-]|$)/i);
      if (m) {
        var code = normalise(m[1]);
        if (code) return code;
      }
    } catch (e) { /* ignore */ }

    var htmlLang = (document.documentElement && document.documentElement.lang) || '';
    var fromAttr = normalise(htmlLang);
    if (fromAttr) return fromAttr;

    return CONFIG.defaultLang;
  }

  // ============================================================
  //  RESOLUTION (the heart of the loader)
  //  Priority: ?lang= → localStorage → navigator → default
  // ============================================================

  function resolveLanguage() {
    // 1. Explicit URL query
    var fromQuery = normalise(getQueryParam(CONFIG.queryParam));
    if (fromQuery) {
      STATE.fromQuery = true;
      STATE.chosen = fromQuery;
      log('Resolved from query string:', fromQuery);
      return fromQuery;
    }

    // 2. Saved preference
    var saved = safeStorage('get', CONFIG.storageKey);
    if (!saved) {
      // Legacy key migration
      for (var i = 0; i < CONFIG.legacyStorageKeys.length; i++) {
        var legacy = safeStorage('get', CONFIG.legacyStorageKeys[i]);
        if (legacy) {
          saved = legacy;
          safeStorage('set', CONFIG.storageKey, legacy);
          log('Migrated from legacy key', CONFIG.legacyStorageKeys[i]);
          break;
        }
      }
    }
    var fromStorage = normalise(saved);
    if (fromStorage) {
      STATE.fromStorage = true;
      STATE.chosen = fromStorage;
      log('Resolved from localStorage:', fromStorage);
      return fromStorage;
    }

    // 3. Browser preferences (navigator.languages preferred, then navigator.language)
    var candidates = [];
    try {
      if (navigator.languages && navigator.languages.length) {
        candidates = candidates.concat([].slice.call(navigator.languages));
      }
      if (navigator.language) candidates.push(navigator.language);
      if (navigator.userLanguage) candidates.push(navigator.userLanguage);  // IE legacy
      if (navigator.browserLanguage) candidates.push(navigator.browserLanguage);
    } catch (e) { /* ignore */ }

    for (var j = 0; j < candidates.length; j++) {
      var fromBrowser = normalise(candidates[j]);
      if (fromBrowser) {
        STATE.fromBrowser = true;
        STATE.chosen = fromBrowser;
        STATE.detected = fromBrowser;
        log('Resolved from browser:', candidates[j], '→', fromBrowser);
        return fromBrowser;
      }
    }

    // 4. Hard fallback
    STATE.chosen = CONFIG.fallbackLang;
    log('No match; falling back to', CONFIG.fallbackLang);
    return CONFIG.fallbackLang;
  }

  // ============================================================
  //  REDIRECT
  // ============================================================

  /**
   * Builds the target URL for a given language code.
   * Convention:
   *   mk →  /index.html  (root, Macedonian is canonical)
   *   xx →  /xx/index.html  (subfolder)
   * The current pathname's terminal page name is preserved when present:
   *   /about.html      + en  →  /en/about.html
   *   /zh/about.html   + fr  →  /fr/about.html
   */
  function buildTargetUrl(targetLang) {
    var loc = window.location;
    var path = loc.pathname || '/';
    var search = loc.search || '';

    // Strip leading language segment if present
    var stripped = path.replace(/^\/([a-z]{2,3})(?=\/|$)/i, function (m, code) {
      return isSupported(normalise(code)) ? '' : m;
    });
    if (!stripped || stripped === '') stripped = '/';
    if (stripped.charAt(0) !== '/') stripped = '/' + stripped;

    var prefix;
    if (targetLang === CONFIG.defaultLang) {
      prefix = '';        // root for Macedonian
    } else {
      prefix = '/' + targetLang;
    }

    // Ensure we don't double-slash
    var target = prefix + stripped;
    target = target.replace(/\/+/g, '/');

    // Strip ?lang= from search so it doesn't loop
    if (search) {
      var cleaned = search.replace(/[?&]lang=[^&]*/g, '').replace(/^&/, '?');
      if (cleaned === '?') cleaned = '';
      target += cleaned;
    }
    return target + (loc.hash || '');
  }

  function shouldRedirect(chosen, currentPageLang) {
    if (!CONFIG.redirectOnFirstVisit) return false;
    if (getQueryParam(CONFIG.bypassParam)) return false;
    if (!chosen || !currentPageLang) return false;
    if (chosen === currentPageLang) return false;
    return true;
  }

  function performRedirect(targetLang) {
    var url = buildTargetUrl(targetLang);
    log('Redirecting to', url);
    try {
      window.location.replace(url);
    } catch (e) {
      window.location.href = url;
    }
  }

  // ============================================================
  //  HTML ATTRIBUTE UPDATES (lang + dir)
  // ============================================================

  function applyHtmlAttributes(code) {
    var entry = REGISTRY[code];
    if (!entry) return;
    try {
      document.documentElement.lang = code;
      document.documentElement.dir = entry.dir || 'ltr';
      if (entry.dir === 'rtl') {
        document.documentElement.setAttribute('data-rtl', 'true');
      } else {
        document.documentElement.removeAttribute('data-rtl');
      }
    } catch (e) { /* ignore */ }
  }

  // ============================================================
  //  SELECTOR (dropdown widget)
  // ============================================================

  var SELECTOR_STYLE_ID = 'wpa-i18n-style';
  var SELECTOR_STYLE = [
    '.wpa-lang-selector{',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;',
      'font-size:13px;line-height:1.4;color:#0a1f44;',
      'display:inline-flex;align-items:center;gap:8px;',
    '}',
    '.wpa-lang-selector__label{',
      'font-size:11px;text-transform:uppercase;letter-spacing:0.12em;',
      'color:#8e6f30;font-weight:600;',
    '}',
    '.wpa-lang-selector__select{',
      'appearance:none;-webkit-appearance:none;-moz-appearance:none;',
      'background:#fbf8f1 url("data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'10\\\' height=\\\'10\\\' viewBox=\\\'0 0 10 10\\\'><path d=\\\'M1 3l4 4 4-4\\\' stroke=\\\'%230a1f44\\\' stroke-width=\\\'1.5\\\' fill=\\\'none\\\' stroke-linecap=\\\'round\\\'/></svg>") no-repeat right 10px center;',
      'border:1px solid rgba(10,31,68,0.25);border-radius:2px;',
      'padding:7px 28px 7px 12px;',
      'font-family:inherit;font-size:13px;color:#0a1f44;',
      'cursor:pointer;outline:none;min-width:160px;',
      'transition:border-color .15s ease,box-shadow .15s ease;',
    '}',
    '.wpa-lang-selector__select:hover{border-color:#c9a45c;}',
    '.wpa-lang-selector__select:focus{border-color:#c9a45c;box-shadow:0 0 0 3px rgba(201,164,92,0.18);}',
    '.wpa-lang-selector__select optgroup{font-weight:600;color:#8e6f30;}',
    '.wpa-lang-selector--floating{',
      'position:fixed;top:14px;right:14px;z-index:9999;',
      'background:rgba(247,243,233,0.96);backdrop-filter:blur(6px);',
      'padding:8px 12px;border-radius:2px;',
      'border:1px solid rgba(10,31,68,0.18);',
      'box-shadow:0 4px 16px -8px rgba(10,31,68,0.3);',
    '}',
    '[dir="rtl"] .wpa-lang-selector--floating{right:auto;left:14px;}',
    '@media(max-width:600px){.wpa-lang-selector--floating{top:8px;right:8px;padding:6px 8px;}}'
  ].join('');

  function injectStyle() {
    if (document.getElementById(SELECTOR_STYLE_ID)) return;
    try {
      var s = document.createElement('style');
      s.id = SELECTOR_STYLE_ID;
      s.appendChild(document.createTextNode(SELECTOR_STYLE));
      var head = document.head || document.getElementsByTagName('head')[0];
      if (head) head.appendChild(s);
    } catch (e) { /* ignore */ }
  }

  /**
   * Produces the inner HTML of <select>, with three optgroups:
   *   • Канонски јазици (priority 0)
   *   • Главни јазици    (priority 1)
   *   • Други јазици     (priority 2)
   */
  function buildOptionsHtml(currentCode) {
    function groupLabel(priority, langCode) {
      var labels = {
        mk: ['Канонски јазици', 'Главни јазици', 'Други јазици'],
        en: ['Canonical languages', 'Major languages', 'Other languages']
      };
      var set = labels[langCode] || labels.en;
      return set[priority] || set[2];
    }

    var groups = { 0: [], 1: [], 2: [] };
    for (var code in REGISTRY) {
      if (!REGISTRY.hasOwnProperty(code)) continue;
      groups[REGISTRY[code].priority].push(code);
    }

    // Sort each group alphabetically by native name
    function sortByName(a, b) {
      var an = REGISTRY[a].name.toLowerCase();
      var bn = REGISTRY[b].name.toLowerCase();
      return an < bn ? -1 : (an > bn ? 1 : 0);
    }
    // Priority 0 keeps mk first then en (canonical order, no sort)
    groups[1].sort(sortByName);
    groups[2].sort(sortByName);

    var html = '';
    for (var p = 0; p < 3; p++) {
      if (!groups[p].length) continue;
      html += '<optgroup label="' + escapeAttr(groupLabel(p, currentCode)) + '">';
      for (var k = 0; k < groups[p].length; k++) {
        var c = groups[p][k];
        var entry = REGISTRY[c];
        var selected = (c === currentCode) ? ' selected' : '';
        var label = entry.name;
        if (entry.en && entry.en !== entry.name) label += ' (' + entry.en + ')';
        html += '<option value="' + escapeAttr(c) + '"' + selected + '>' + escapeText(label) + '</option>';
      }
      html += '</optgroup>';
    }
    return html;
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function escapeText(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildSelectorElement(currentCode, options) {
    options = options || {};
    var wrapper = document.createElement('div');
    wrapper.className = 'wpa-lang-selector';
    if (options.floating) wrapper.className += ' wpa-lang-selector--floating';

    var labelText = (currentCode === 'mk') ? 'Јазик' : 'Language';

    var label = document.createElement('label');
    label.className = 'wpa-lang-selector__label';
    label.textContent = labelText;
    label.setAttribute('for', 'wpa-lang-select');
    wrapper.appendChild(label);

    var select = document.createElement('select');
    select.id = 'wpa-lang-select';
    select.className = 'wpa-lang-selector__select';
    select.setAttribute('aria-label', labelText);
    select.innerHTML = buildOptionsHtml(currentCode);
    wrapper.appendChild(select);

    select.addEventListener('change', function () {
      var picked = normalise(select.value);
      if (!picked) return;
      safeStorage('set', CONFIG.storageKey, picked);
      // Build target URL, then navigate
      var url = buildTargetUrl(picked);
      log('Manual selection:', picked, '→', url);
      try { window.location.assign(url); } catch (e) { window.location.href = url; }
    });

    return wrapper;
  }

  function mountSelector(currentCode) {
    injectStyle();
    var mount = document.querySelector(CONFIG.selectorMount);
    if (mount) {
      // Clear existing content (allow re-mount on SPA navigation)
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      mount.appendChild(buildSelectorElement(currentCode, { floating: false }));
      log('Selector mounted at', CONFIG.selectorMount);
      return;
    }
    if (CONFIG.autoFloatingWidget) {
      var body = document.body;
      if (!body) return;
      // Avoid duplicate floating widgets
      var existing = document.getElementById('wpa-lang-floating');
      if (existing) existing.parentNode.removeChild(existing);
      var floater = buildSelectorElement(currentCode, { floating: true });
      floater.id = 'wpa-lang-floating';
      body.appendChild(floater);
      log('Floating selector auto-created');
    }
  }

  // ============================================================
  //  PUBLIC API
  // ============================================================

  var WPAi18n = {
    version: '6.0.0',
    config: CONFIG,
    registry: REGISTRY,
    state: STATE,

    /**
     * Programmatically set the language (also persists + navigates).
     */
    set: function (code) {
      var normalised = normalise(code);
      if (!normalised) {
        warn('set(): unsupported code', code, '→ falling back to', CONFIG.fallbackLang);
        normalised = CONFIG.fallbackLang;
      }
      safeStorage('set', CONFIG.storageKey, normalised);
      var url = buildTargetUrl(normalised);
      try { window.location.assign(url); } catch (e) { window.location.href = url; }
      return normalised;
    },

    /**
     * Read the currently active language without redirecting.
     */
    get: function () {
      return STATE.chosen || detectCurrentPageLang() || CONFIG.defaultLang;
    },

    /**
     * Clear the saved preference (visitor returns to browser-detection mode).
     */
    clear: function () {
      safeStorage('del', CONFIG.storageKey);
      for (var i = 0; i < CONFIG.legacyStorageKeys.length; i++) {
        safeStorage('del', CONFIG.legacyStorageKeys[i]);
      }
      log('Preferences cleared');
    },

    /**
     * Manually re-render the selector (e.g. after dynamic DOM changes).
     */
    mountSelector: function () {
      mountSelector(WPAi18n.get());
    },

    /**
     * List supported language codes.
     */
    list: function () {
      var out = [];
      for (var c in REGISTRY) if (REGISTRY.hasOwnProperty(c)) out.push(c);
      return out;
    },

    /**
     * Returns true if the code is in the registry.
     */
    isSupported: function (code) { return isSupported(normalise(code)); },

    /**
     * Normalise an arbitrary BCP-47 tag to a WPA code (or null).
     */
    normalise: function (raw) { return normalise(raw); }
  };

  // Expose globally
  try { window.WPAi18n = WPAi18n; } catch (e) { /* ignore */ }

  // ============================================================
  //  BOOT SEQUENCE
  // ============================================================

  function boot() {
    STATE.currentPageLang = detectCurrentPageLang();
    log('Current page language:', STATE.currentPageLang);

    var chosen = resolveLanguage();
    log('Resolved language:', chosen, 'via', {
      query: STATE.fromQuery, storage: STATE.fromStorage, browser: STATE.fromBrowser
    });

    // First-visit redirect (only if no manual choice has been stored)
    if (shouldRedirect(chosen, STATE.currentPageLang)) {
      // Persist the auto-detected choice so subsequent visits don't loop
      if (!STATE.fromStorage) {
        safeStorage('set', CONFIG.storageKey, chosen);
      }
      performRedirect(chosen);
      return;  // halts further work; page is unloading
    }

    // Apply html lang + dir to current page
    applyHtmlAttributes(STATE.currentPageLang);

    // Persist explicit query overrides
    if (STATE.fromQuery) {
      safeStorage('set', CONFIG.storageKey, chosen);
    }

    // Mount selector once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        mountSelector(STATE.currentPageLang);
      });
    } else {
      mountSelector(STATE.currentPageLang);
    }
  }

  // Boot now if document is parsed enough, else wait
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Non-browser environment — do nothing
    return;
  }

  // We can decide on redirect BEFORE DOMContentLoaded because the
  // <head> already has window.location available. This avoids any
  // visible content flash before the redirect happens.
  try {
    boot();
  } catch (err) {
    warn('Boot error (continuing without redirect):', err && err.message);
    // Even if boot fails, do a best-effort lang attribute apply
    try { applyHtmlAttributes(detectCurrentPageLang()); } catch (e) { /* ignore */ }
  }

})();

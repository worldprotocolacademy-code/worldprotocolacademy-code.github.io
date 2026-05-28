/*!
 * WPA Institute Translator Loader v1.2 (STABILISATION)
 * --------------------------------------------------------------
 * Institute-only translator system.
 * Does NOT touch root index.html, WPA homepage, journal,
 * working-papers, or any global WPA translator.
 *
 * Default language : mk (Macedonian)
 * Second canonical : en (English)
 * Other 47 locales : machine-assisted drafts (needs human review)
 *
 * Fallback chain   : selected → en → mk → existing DOM text → key
 * RTL languages    : ar, he, fa, ur
 * Storage          : localStorage["wpaInstituteLang"]
 *
 * v1.2 changes (2026-05-27, stabilisation):
 *  - BASE_PATH uses root-absolute URL (works regardless of page path)
 *  - LOCALE_VERSION query-string cache-buster
 *  - Allowed-language whitelist (rejects garbage in localStorage)
 *  - Debug-safe fetch: separate r.text() + JSON.parse for clear error
 *  - WPAInstituteTranslator.diagnose() — full system diagnostic
 *  - WPAInstituteTranslator.resetLang() — clear storage + reload
 *  - setLang() returns a Promise that resolves with diagnostic data
 *
 * GitHub Pages compatible. No backend required.
 * --------------------------------------------------------------
 */
(function () {
  "use strict";

  var STORAGE_KEY    = "wpaInstituteLang";
  var DEFAULT_LANG   = "mk";
  var FALLBACK_LANG  = "en";
  var LOCALE_VERSION = "v1.4-2026-05-27";
  var RTL            = ["ar", "he", "fa", "ur"];

  function buildLocaleURL(lang) {
    // Се осигуруваме дека патеката секогаш ќе гаѓа директно во коренскиот директориум
    var root = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    if (root === "" || root === "/") {
      return window.location.origin + "/" + BASE_PATH + lang + ".json?v=" + encodeURIComponent(LOCALE_VERSION);
    }
    return window.location.origin + root + "/" + BASE_PATH + lang + ".json?v=" + encodeURIComponent(LOCALE_VERSION);
  }

  var ALLOWED_LANGS = [
    "mk", "en", "fr", "sq", "el", "sr", "hr", "bs", "sl", "bg", "ro", "tr", "it", "de", "es", "pt", 
    "nl", "pl", "cs", "sk", "hu", "uk", "ru", "da", "sv", "nb", "fi", "et", "lv", "lt", "ga", "ar", 
    "he", "fa", "hi", "ur", "bn", "zh-Hans", "zh-Hant", "ja", "ko", "id", "ms", "sw", "am", "ha", "af", "vi", "th"
  ];

  // Brand terms that must never be translated, regardless of locale.
  var BRAND_PROTECTED = [
    "World Protocol Academy", "WPA", "WPA Journal", "WPA Working Papers",
    "WPAWS", "Virtual Sande", "ORCID", "Scopus", "Web of Science",
    "DOAJ", "Google Scholar", "Crossref", "DOI", "ISSN", "ISBN",
    "OPC 2026", "AAB"
  ];

  // In-memory cache of fetched locale dictionaries.
  var cache = Object.create(null);
  var fileProtocolWarned = false;

  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  function isAllowed(lang) {
    return typeof lang === "string" && ALLOWED_LANGS.indexOf(lang) !== -1;
  }

  function isRTL(lang) {
    return RTL.indexOf(lang) !== -1;
  }

  function applyDirection(lang) {
    var html = document.documentElement;
    var body = document.body;
    if (isRTL(lang)) {
      html.setAttribute("dir", "rtl");
      html.setAttribute("lang", lang);
      if (body) body.classList.add("rtl");
    } else {
      html.setAttribute("dir", "ltr");
      html.setAttribute("lang", lang);
      if (body) body.classList.remove("rtl");
    }
  }

  function getStoredLang() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (isAllowed(stored)) return stored;
      // Garbage in localStorage (e.g. "English (EN)") — purge and fall back
      if (stored) {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (e2) {}
      }
    } catch (e) {
      // localStorage disabled
    }
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    if (!isAllowed(lang)) return false;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
      return true;
    } catch (e) {
      return false;
    }
  }

  function warnFileProtocolOnce() {
    if (fileProtocolWarned) return;
    fileProtocolWarned = true;
    console.warn(
      "[WPA Institute Translator] Local file mode detected (file://). " +
      "JSON fetch is blocked by browser security in this mode. " +
      "Use a local HTTP server for translator testing, e.g.:\n" +
      "    python3 -m http.server 8000\n" +
      "    then open http://localhost:8000/institute.html\n" +
      "On GitHub Pages or any HTTP/HTTPS host the translator works normally."
    );
  }

  var BASE_PATH = "";
  if (window.location.hostname.includes("github.io")) {
    BASE_PATH = window.location.origin + "/worldprotocolacademy-code.github.io/locales/en/institute/";
  } else {
    BASE_PATH = window.location.origin + "/locales/en/institute/";
  }
    return base + lang + ".json?v=" + encodeURIC

  function fetchLocale(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    if (isFileProtocol()) {
      warnFileProtocolOnce();
      return Promise.resolve(null);
    }
    var url = buildLocaleURL(lang);
    return fetch(url, { cache: "no-store" })
      .then(function (r) {
        return r.text().then(function (text) {
          if (!r.ok) {
            throw new Error("HTTP " + r.status + " for " + url);
          }
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("[WPA Institute Translator] Invalid JSON for " + lang +
                          ". First 300 chars of response:\n" + text.slice(0, 300));
            throw new Error("JSON parse failed for " + lang + ": " + e.message);
          }
        });
      })
      .then(function (dict) {
        cache[lang] = dict;
        return dict;
      })
      .catch(function (err) {
        console.warn("[WPA Institute Translator] Could not load locale '" + lang +
                     "': " + err.message);
        return null;
      });
  }

  function resolveKey(key, primary, en, mk, existingDomText) {
    if (primary && Object.prototype.hasOwnProperty.call(primary, key)) {
      var v = primary[key];
      if (v !== "" && v !== null && v !== undefined) return v;
    }
    if (en && Object.prototype.hasOwnProperty.call(en, key)) {
      var v = en[key];
      if (v !== "" && v !== null && v !== undefined) return v;
    }
    if (mk && Object.prototype.hasOwnProperty.call(mk, key)) {
      var v = mk[key];
      if (v !== "" && v !== null && v !== undefined) return v;
    }
    if (existingDomText && existingDomText.trim() !== "") {
      return existingDomText;
    }
    return key;
  }

  function applyTranslations(lang) {
    if (!isAllowed(lang)) lang = DEFAULT_LANG;

    var promises = [fetchLocale(lang)];
    if (lang !== FALLBACK_LANG) promises.push(fetchLocale(FALLBACK_LANG));
    if (lang !== DEFAULT_LANG && FALLBACK_LANG !== DEFAULT_LANG) {
      promises.push(fetchLocale(DEFAULT_LANG));
    }

    return Promise.all(promises).then(function (dicts) {
      var primary = dicts[0] || {};
      var en = (lang !== FALLBACK_LANG) ? (dicts[1] || {}) : primary;
      var mk = (lang !== DEFAULT_LANG && FALLBACK_LANG !== DEFAULT_LANG) ?
                 (dicts[2] || {}) :
                 (lang === DEFAULT_LANG ? primary : en);

      var primaryEmpty = Object.keys(primary).length === 0;
      var enEmpty      = Object.keys(en).length === 0;
      var mkEmpty      = Object.keys(mk).length === 0;
      if (primaryEmpty && enEmpty && mkEmpty) {
        if (!isFileProtocol()) {
          console.warn("[WPA Institute Translator] All locale fetches failed. " +
                       "Page will display existing HTML text. Check console for HTTP errors.");
        }
        applyDirection(lang);
        return { applied: 0, lang: lang, fetched: false };
      }

      var nodes = document.querySelectorAll("[data-i18n]");
      var applied = 0;
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var key = el.getAttribute("data-i18n");
        if (!key) continue;
        var attr = el.getAttribute("data-i18n-attr");
        var existingText = el.textContent || "";
        var value = resolveKey(key, primary, en, mk, existingText);
        if (attr) {
          el.setAttribute(attr, value);
        } else {
          el.textContent = value;
        }
        applied++;
      }

      applyDirection(lang);
      document.dispatchEvent(new CustomEvent("wpa:lang-changed", { detail: { lang: lang } }));
      return { applied: applied, lang: lang, fetched: true,
               primary_keys: Object.keys(primary).length,
               en_keys: Object.keys(en).length,
               mk_keys: Object.keys(mk).length };
    });
  }

  function syncSelector(lang) {
    var sel = document.getElementById("instLangSelect");
    if (sel && sel.value !== lang) sel.value = lang;
  }

  function bindSelector() {
    var sel = document.getElementById("instLangSelect");
    if (!sel) return;
    sel.addEventListener("change", function () {
      var lang = sel.value;
      if (!isAllowed(lang)) {
        console.warn("[WPA Institute Translator] Selector returned invalid value '" +
                     lang + "'; falling back to '" + DEFAULT_LANG + "'.");
        lang = DEFAULT_LANG;
        sel.value = DEFAULT_LANG;
      }
      setStoredLang(lang);
      applyTranslations(lang);
    });
  }

  function boot() {
    var lang = getStoredLang();
    syncSelector(lang);
    bindSelector();
    applyTranslations(lang).catch(function (err) {
      console.warn("[WPA Institute Translator] boot error: " + (err && err.message));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // ───────────────────────────────────────────────────────────
  // Public diagnostic API
  // ───────────────────────────────────────────────────────────
  function diagnose() {
    var sel = document.getElementById("instLangSelect");
    var nodes = document.querySelectorAll("[data-i18n]");
    var stored = null;
    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}

    var mkURL = buildLocaleURL("mk");
    var enURL = buildLocaleURL("en");

    var mkProbe = fetch(mkURL, { cache: "no-store" })
      .then(function (r) {
        return r.text().then(function (t) {
          var parseOK = false, keyCount = 0;
          try { var d = JSON.parse(t); parseOK = true;
                keyCount = Object.keys(d).filter(function(k){return k !== "_meta";}).length; }
          catch (e) {}
          return { status: r.status, ok: r.ok, parseOK: parseOK, keys: keyCount };
        });
      })
      .catch(function (e) { return { status: "ERR", error: e.message }; });

    var enProbe = fetch(enURL, { cache: "no-store" })
      .then(function (r) {
        return r.text().then(function (t) {
          var parseOK = false, keyCount = 0;
          try { var d = JSON.parse(t); parseOK = true;
                keyCount = Object.keys(d).filter(function(k){return k !== "_meta";}).length; }
          catch (e) {}
          return { status: r.status, ok: r.ok, parseOK: parseOK, keys: keyCount };
        });
      })
      .catch(function (e) { return { status: "ERR", error: e.message }; });

    return Promise.all([mkProbe, enProbe]).then(function (results) {
      var mk = results[0], en = results[1];
      var unique_html_keys = {};
      for (var i = 0; i < nodes.length; i++) {
        var k = nodes[i].getAttribute("data-i18n");
        if (k) unique_html_keys[k] = true;
      }
      var diag = {
        version: "v1.2 (translator loader)",
        locale_version: LOCALE_VERSION,
        url: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol,
        base_path: BASE_PATH,
        mk_url: mkURL,
        en_url: enURL,
        mk_http_status: mk.status,
        en_http_status: en.status,
        mk_json_parse_ok: !!mk.parseOK,
        en_json_parse_ok: !!en.parseOK,
        mk_key_count: mk.keys || 0,
        en_key_count: en.keys || 0,
        html_data_i18n_nodes: nodes.length,
        html_data_i18n_unique_keys: Object.keys(unique_html_keys).length,
        stored_language: stored,
        stored_language_valid: isAllowed(stored),
        current_lang_attr: document.documentElement.getAttribute("lang"),
        current_dir_attr: document.documentElement.getAttribute("dir"),
        selector_value: sel ? sel.value : "(no selector found)",
        selector_options: sel ? sel.options.length : 0
      };

      // Missing keys analysis (best-effort, only if mk + en both fetched)
      if (mk.parseOK && en.parseOK && mk.keys && en.keys) {
        diag.parity = (mk.keys === en.keys) ? "✓ MK = EN" : "✗ MK ≠ EN";
        diag.missing_mk = Math.max(0, Object.keys(unique_html_keys).length - mk.keys);
        diag.missing_en = Math.max(0, Object.keys(unique_html_keys).length - en.keys);
      }

      console.log("%c[WPA Institute Translator Diagnostic]", "color:#9d4edd;font-weight:bold;font-size:13px");
      console.table(diag);
      return diag;
    });
  }

  function resetLang() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    console.log("[WPA Institute Translator] Storage cleared. Reloading.");
    location.reload();
  }

  window.WPAInstituteTranslator = {
    version: "1.2",
    locale_version: LOCALE_VERSION,
    allowed_languages: ALLOWED_LANGS.slice(),
    brand_protected: BRAND_PROTECTED.slice(),
    base_path: BASE_PATH,
    setLang: function (lang) {
      if (!isAllowed(lang)) {
        console.warn("[WPA Institute Translator] setLang('" + lang +
                     "') rejected — not in ALLOWED_LANGS. Use one of: " +
                     ALLOWED_LANGS.slice(0, 10).join(", ") + " …");
        return Promise.resolve({ rejected: true, lang: lang });
      }
      setStoredLang(lang);
      syncSelector(lang);
      return applyTranslations(lang);
    },
    getLang: function () { return getStoredLang(); },
    resetLang: resetLang,
    diagnose: diagnose,
    isLocalFile: function () { return isFileProtocol(); }
  };
})();

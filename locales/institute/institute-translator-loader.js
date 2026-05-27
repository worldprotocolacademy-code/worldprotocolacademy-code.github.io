/*!
 * WPA Institute Translator Loader v1.1
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
 * Lazy load        : only selected JSON is fetched
 *
 * v1.1 changes (2026-05-26):
 *  - file:// protocol detection with clear console warning
 *  - never claims success when fetch fails
 *  - preserves existing DOM text on translation failure (no key-name display)
 *  - non-blocking: page renders even if all locale fetches fail
 *
 * GitHub Pages compatible. No backend required.
 * --------------------------------------------------------------
 */
(function () {
  "use strict";

  var STORAGE_KEY = "wpaInstituteLang";
  var DEFAULT_LANG = "mk";
  var FALLBACK_LANG = "en";
  var RTL = ["ar", "he", "fa", "ur"];
  var BASE_PATH = "locales/institute/";

  var BRAND_PROTECTED = [
    "World Protocol Academy", "WPA", "WPA Journal", "WPA Working Papers",
    "WPAWS", "Virtual Sande", "ORCID", "Scopus", "Web of Science",
    "DOAJ", "Google Scholar", "Crossref", "DOI", "ISSN", "ISBN",
    "OPC 2026", "AAB"
  ];

  var cache = Object.create(null);
  var fileProtocolWarned = false;

  function isFileProtocol() {
    return window.location.protocol === "file:";
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
      if (stored && typeof stored === "string") return stored;
    } catch (e) { /* localStorage may be disabled */ }
    return DEFAULT_LANG;
  }

  function setStoredLang(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
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

  function fetchLocale(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    if (isFileProtocol()) {
      warnFileProtocolOnce();
      return Promise.resolve(null);
    }
    return fetch(BASE_PATH + lang + ".json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " loading " + lang + ".json");
        return r.json();
      })
      .then(function (dict) { cache[lang] = dict; return dict; })
      .catch(function (err) {
        console.warn("[WPA Institute Translator] Could not load locale '" + lang + "': " + err.message);
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
        return;
      }

      var nodes = document.querySelectorAll("[data-i18n]");
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
      }

      applyDirection(lang);
      document.dispatchEvent(new CustomEvent("wpa:lang-changed", { detail: { lang: lang } }));
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
      var lang = sel.value || DEFAULT_LANG;
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

  window.WPAInstituteTranslator = {
    version: "1.1",
    setLang: function (lang) {
      setStoredLang(lang);
      syncSelector(lang);
      return applyTranslations(lang);
    },
    getLang: function () { return getStoredLang(); },
    brandProtected: BRAND_PROTECTED.slice(),
    isLocalFile: function () { return isFileProtocol(); }
  };
})();

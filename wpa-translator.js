/*!
 * WPA Translator v3.0 — Unified site-wide language engine
 * ============================================================================
 * ONE engine · ONE selector logic · ONE storage key · ONE data attribute.
 *
 *   Storage key      : "wpa.language"
 *   Data attribute   : data-i18n="some.key"
 *   Attribute i18n   : data-i18n-attr="placeholder:form.email,title:btn.join,aria-label:nav.menu"
 *   Page context     : <html data-wpa-page="index"> or <body data-page="index">
 *                      or window.WPA_TRANSLATOR_CONTEXT, else derived from path.
 *   Locale files     : {scriptDir}locales/{page}/{lang}.json
 *                      {scriptDir}locales/{page}/locale-status.json
 *
 * PATHS ARE SCRIPT-RELATIVE. The locale base is derived from THIS script's own
 * src, so it works from the repo root AND from nested pages (wpaws/index.html
 * loads ../wpa-translator.js -> base resolves to /locales/...). No reliance on
 * absolute "/..." paths that break under file:// or sub-path hosting.
 *
 * FALLBACK (per key):  selected language -> Macedonian -> English ->
 *                      original HTML text (captured once) -> leave as-is.
 *   Never prints: undefined, null, [object Object], translation.missing, the key.
 *
 * OFFLINE: under file:// (fetch blocked) the engine uses window.WPA_TRANSLATIONS
 *          if the page exposes one, so MK<->EN still switch without a server.
 *
 * DIAGNOSTICS: window.WPATranslatorDiagnostics()  ·  window.WPASetLanguage("en")
 * ============================================================================
 */
(function () {
  "use strict";

  var VERSION       = "3.0";
  var STORAGE_KEY   = "wpa.language";
  var DEFAULT_LANG  = "mk";
  var FALLBACK_LANG = "en";
  var RTL_LANGS     = ["ar", "he", "fa", "ur"];

  /* ── page context ── */
  function derivePageFromPath() {
    var p = (location.pathname || "").replace(/\/+$/, "");
    var file = p.substring(p.lastIndexOf("/") + 1);
    if (!file) {
      var parts = p.split("/").filter(Boolean);
      return parts.length ? parts[parts.length - 1] : "index";
    }
    return file.replace(/\.html?$/i, "") || "index";
  }
  function getPage() {
    return document.documentElement.getAttribute("data-wpa-page")
        || (document.body && document.body.getAttribute("data-page"))
        || (typeof window.WPA_TRANSLATOR_CONTEXT === "string" && window.WPA_TRANSLATOR_CONTEXT)
        || derivePageFromPath();
  }

  /* ── locale base derived from this script's own src (robust for nested pages) ── */
  function scriptDir() {
    var s = document.querySelector('script[src*="wpa-translator"]');
    if (s) {
      var src = s.getAttribute("src") || "";
      return src.replace(/wpa-translator\.js.*$/i, "");
    }
    return "";
  }
  var PAGE       = getPage();
  var LOCALE_DIR = scriptDir() + "locales/" + PAGE + "/";

  function localeURL(lang) { return LOCALE_DIR + lang + ".json?v=" + VERSION; }
  function manifestURL()   { return LOCALE_DIR + "locale-status.json?v=" + VERSION; }

  /* ── state ── */
  var manifest = null;
  var allowed = new Set([DEFAULT_LANG, FALLBACK_LANG]);
  var mainLangs = [DEFAULT_LANG, FALLBACK_LANG];
  var experimentalLangs = [];
  var cache = Object.create(null);
  var diag = { missingKeys: [], failedLocales: [], usedFallback: false, translated: 0, fileProtocol: false };

  function isFile() { return location.protocol === "file:"; }
  function isAllowed(l) { return typeof l === "string" && allowed.has(l); }
  function isRTL(l) {
    if (manifest && manifest.languages && manifest.languages[l]) return !!manifest.languages[l].rtl;
    return RTL_LANGS.indexOf(l) !== -1;
  }

  function getStored() {
    try { var s = localStorage.getItem(STORAGE_KEY); if (isAllowed(s)) return s; } catch (e) {}
    return DEFAULT_LANG;
  }
  function setStored(l) { try { if (isAllowed(l)) localStorage.setItem(STORAGE_KEY, l); } catch (e) {} }

  /* ── data sources ── */
  function inlineDict(lang) {
    var W = window.WPA_TRANSLATIONS;
    return (W && W[lang] && typeof W[lang] === "object") ? W[lang] : null;
  }

  function fetchLocale(lang) {
    if (cache[lang] !== undefined) return Promise.resolve(cache[lang]);
    if (isFile() || typeof window.fetch !== "function") {
      diag.fileProtocol = true;
      var inl = inlineDict(lang);
      cache[lang] = inl || null;
      return Promise.resolve(cache[lang]);
    }
    return fetch(localeURL(lang), { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text().then(function (t) {
          try { return JSON.parse(t); }
          catch (e) { console.error("[WPA i18n] Invalid JSON " + lang + ".json"); throw e; }
        });
      })
      .then(function (d) { cache[lang] = d; return d; })
      .catch(function (err) {
        if (diag.failedLocales.indexOf(lang) === -1) diag.failedLocales.push(lang);
        var inl = inlineDict(lang);
        cache[lang] = inl || null;
        if (!inl) console.warn("[WPA i18n] locale '" + lang + "' unavailable: " + err.message);
        return cache[lang];
      });
  }

  function fetchManifest() {
    if (isFile() || typeof window.fetch !== "function") return Promise.resolve(null);
    return fetch(manifestURL(), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function () { return null; });
  }

  /* ── original-text capture (so fallback can restore the page's own baseline) ── */
  function originalText(el) {
    var o = el.getAttribute("data-i18n-orig");
    if (o === null) { o = el.textContent || ""; el.setAttribute("data-i18n-orig", o); }
    return o;
  }
  function originalAttr(el, attr) {
    var k = "data-i18n-orig-" + attr;
    var o = el.getAttribute(k);
    if (o === null) { o = el.getAttribute(attr) || ""; el.setAttribute(k, o); }
    return o;
  }

  /* ── resolve a key: selected -> mk -> en -> original -> (record missing) ──
   *  Supports BOTH flat dictionaries ({"a.b.c": "..."}) and nested
   *  dictionaries ({a:{b:{c:"..."}}}) for the same dotted key. */
  function getVal(dict, key) {
    if (!dict) return undefined;
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];   /* flat */
    if (key.indexOf(".") !== -1) {                                           /* nested */
      var parts = key.split("."), cur = dict, i;
      for (i = 0; i < parts.length; i++) {
        if (cur && typeof cur === "object" && Object.prototype.hasOwnProperty.call(cur, parts[i])) cur = cur[parts[i]];
        else return undefined;
      }
      return (typeof cur === "string") ? cur : undefined;
    }
    return undefined;
  }
  function resolve(key, sel, mk, en, original) {
    function ok(v) { return v !== undefined && v !== null && v !== "" && v !== "[object Object]"; }
    var v;
    v = getVal(sel, key); if (ok(v)) return v;
    v = getVal(mk, key);  if (ok(v)) { diag.usedFallback = true; return v; }
    v = getVal(en, key);  if (ok(v)) { diag.usedFallback = true; return v; }
    if (diag.missingKeys.indexOf(key) === -1) diag.missingKeys.push(key);
    if (original && original.trim() !== "") return original;
    return null;
  }

  function setHtml(el, value) {
    if (/<[a-z][\s\S]*?>/i.test(value)) el.innerHTML = value; else el.textContent = value;
  }

  function applyLang(lang) {
    if (!isAllowed(lang)) lang = DEFAULT_LANG;
    diag.missingKeys = []; diag.usedFallback = false; diag.translated = 0;

    var need = [fetchLocale(lang)];
    need.push(lang === DEFAULT_LANG  ? Promise.resolve(null) : fetchLocale(DEFAULT_LANG));
    need.push(lang === FALLBACK_LANG ? Promise.resolve(null) : fetchLocale(FALLBACK_LANG));

    return Promise.all(need).then(function (d) {
      var sel = d[0] || {};
      var mk  = (lang === DEFAULT_LANG)  ? sel : (d[1] || {});
      var en  = (lang === FALLBACK_LANG) ? sel : (d[2] || {});

      var nodes = document.querySelectorAll("[data-i18n],[data-i18n-attr],[data-i18n-html]");
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];

        var key = el.getAttribute("data-i18n");
        if (key) {
          var val = resolve(key, sel, mk, en, originalText(el));
          if (val !== null) { setHtml(el, val); diag.translated++; }
        }

        var htmlKey = el.getAttribute("data-i18n-html");
        if (htmlKey) {
          var hv = resolve(htmlKey, sel, mk, en, el.getAttribute("data-i18n-orig-html") !== null ? el.getAttribute("data-i18n-orig-html") : (function(){ var o = el.innerHTML || ""; el.setAttribute("data-i18n-orig-html", o); return o; })());
          if (hv !== null) { el.innerHTML = hv; diag.translated++; }
        }

        var attrSpec = el.getAttribute("data-i18n-attr");
        if (attrSpec) {
          attrSpec.split(",").forEach(function (pair) {
            var bits = pair.split(":");
            if (bits.length < 2) return;
            var attr = bits[0].trim(), akey = bits.slice(1).join(":").trim();
            if (!attr || !akey) return;
            var av = resolve(akey, sel, mk, en, originalAttr(el, attr));
            if (av !== null) el.setAttribute(attr, av);
          });
        }
      }

      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", isRTL(lang) ? "rtl" : "ltr");
      try { document.dispatchEvent(new CustomEvent("wpa:lang-changed", { detail: { lang: lang, page: PAGE } })); } catch (e) {}
      return { lang: lang, page: PAGE, translated: diag.translated, missing: diag.missingKeys.length };
    });
  }

  /* ── selector ── */
  function getSelector() {
    return document.getElementById("wpaLangSelect")
        || document.getElementById("pageLang")
        || document.getElementById("instLangSelect")
        || document.querySelector("select.wpa-lang-select");
  }
  function getNote() {
    return document.getElementById("wpaLangNote")
        || document.getElementById("instLangNote")
        || document.querySelector("[data-wpa-lang-note]");
  }

  function rebuildSelector(showExperimental) {
    var sel = getSelector();
    if (!sel || !manifest) return;
    sel.innerHTML = "";
    var L = manifest.languages || {};
    var main = manifest.main_selector_languages || [DEFAULT_LANG, FALLBACK_LANG];
    var exp  = manifest.experimental_languages || [];

    function opt(code, suffix) {
      var info = L[code] || {};
      var o = document.createElement("option");
      o.value = code;
      o.textContent = (info.label_native || info.label || code) + (suffix || "");
      return o;
    }
    var gFull = document.createElement("optgroup"); gFull.label = "Full content";
    main.forEach(function (c) { if ((L[c] || {}).status === "public_full") gFull.appendChild(opt(c)); });
    if (gFull.children.length) sel.appendChild(gFull);

    var gDraft = document.createElement("optgroup"); gDraft.label = "Machine-assisted draft — needs human review";
    main.forEach(function (c) { var info = L[c] || {}; if (info.status === "machine_full_draft" && info.show_in_main_selector) gDraft.appendChild(opt(c, " (draft)")); });
    if (gDraft.children.length) sel.appendChild(gDraft);

    if (showExperimental && exp.length) {
      var gExp = document.createElement("optgroup"); gExp.label = "Experimental UI previews — not full translations";
      exp.forEach(function (c) { gExp.appendChild(opt(c, " (preview)")); });
      sel.appendChild(gExp);
    }

    var seen = new Set();
    Array.prototype.forEach.call(sel.options, function (o) { seen.add(o.value); });
    if (seen.size) allowed = seen;
    mainLangs = main.slice();
    experimentalLangs = exp.slice();
  }

  function syncSelector(lang) { var s = getSelector(); if (s && s.value !== lang && isAllowed(lang)) s.value = lang; }

  function bindSelector() {
    var s = getSelector();
    if (!s || s.__wpaBound) return;
    s.__wpaBound = true;
    s.addEventListener("change", function () {
      var l = s.value;
      if (!isAllowed(l)) { l = DEFAULT_LANG; s.value = DEFAULT_LANG; }
      setStored(l);
      applyLang(l);
    });
  }

  function boot() {
    fetchManifest().then(function (m) {
      if (m) {
        manifest = m;
        var a = new Set();
        (m.main_selector_languages || []).forEach(function (l) { a.add(l); });
        (m.experimental_languages || []).forEach(function (l) { a.add(l); });
        if (!a.size) { a.add(DEFAULT_LANG); a.add(FALLBACK_LANG); }
        allowed = a;
        var showExp = false;
        try { if (new URLSearchParams(location.search).get("experimental") === "1") showExp = true; } catch (e) {}
        rebuildSelector(showExp);
      } else {
        var s = getSelector(), set = new Set([DEFAULT_LANG, FALLBACK_LANG]);
        if (s) Array.prototype.forEach.call(s.options, function (o) { set.add(o.value); });
        allowed = set;
      }
      var lang = getStored();
      syncSelector(lang);
      bindSelector();
      applyLang(lang);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* ── diagnostics + manual switch (required globals) ── */
  function diagnostics() {
    var sel = getSelector();
    var nodes = document.querySelectorAll("[data-i18n],[data-i18n-attr],[data-i18n-html]");
    var stored = null; try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var report = {
      version: VERSION,
      page_context: PAGE,
      locale_dir: LOCALE_DIR,
      selected_language: getStored(),
      available_languages: Array.from(allowed),
      main_selector_languages: mainLangs.slice(),
      experimental_count: experimentalLangs.length,
      storage_key: STORAGE_KEY,
      stored_value: stored,
      data_i18n_elements: nodes.length,
      translated_elements: diag.translated,
      missing_keys: diag.missingKeys.slice(),
      failed_locale_files: diag.failedLocales.slice(),
      used_fallback: diag.usedFallback,
      selector_found: !!sel,
      selector_options: sel ? sel.options.length : 0,
      html_lang: document.documentElement.getAttribute("lang"),
      html_dir: document.documentElement.getAttribute("dir"),
      file_protocol: isFile(),
      manifest_loaded: !!manifest
    };
    try { console.table(report); } catch (e) { console.log(report); }
    if (report.missing_keys.length) console.warn("[WPA i18n] missing keys:", report.missing_keys);
    return report;
  }

  window.WPATranslator = {
    version: VERSION, page: PAGE,
    setLang: function (l) {
      if (!isAllowed(l)) { console.warn("[WPA i18n] '" + l + "' not allowed: " + Array.from(allowed).join(",")); return Promise.resolve({ rejected: true, lang: l }); }
      setStored(l); syncSelector(l); return applyLang(l);
    },
    getLang: getStored,
    diagnostics: diagnostics,
    reset: function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} location.reload(); }
  };
  window.WPATranslatorDiagnostics = diagnostics;
  window.WPASetLanguage = function (l) { return window.WPATranslator.setLang(l); };
})();

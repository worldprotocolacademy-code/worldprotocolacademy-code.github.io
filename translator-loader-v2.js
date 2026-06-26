/*!
 * WPA Translator Loader v2 Compatibility Shim
 * World Protocol Academy
 *
 * Purpose:
 * - Keeps GitHub Actions / Translator Quality CI stable.
 * - Preserves backward compatibility for older pages that reference translator-loader-v2.js.
 * - Does not override the active translator system when another loader is already present.
 */

(function () {
  "use strict";

  var WPA = window.WPA || (window.WPA = {});

  WPA.translator = WPA.translator || {};
  WPA.translator.version = WPA.translator.version || "v2-compat";
  WPA.translator.status = WPA.translator.status || "compatibility-shim-active";

  WPA.translator.safeSetLanguage = WPA.translator.safeSetLanguage || function (lang) {
    try {
      var selected = (lang === "en") ? "en" : "mk";
      localStorage.setItem("wpa_lang", selected);
      document.documentElement.setAttribute("lang", selected);
      window.dispatchEvent(new CustomEvent("wpa:language-change", {
        detail: { language: selected, source: "translator-loader-v2-compat" }
      }));
      return selected;
    } catch (error) {
      console.warn("[WPA Translator v2 compat] Language switch warning:", error);
      return "mk";
    }
  };

  WPA.translator.getLanguage = WPA.translator.getLanguage || function () {
    try {
      return localStorage.getItem("wpa_lang") || document.documentElement.getAttribute("lang") || "mk";
    } catch (error) {
      return document.documentElement.getAttribute("lang") || "mk";
    }
  };

  WPA.translator.markReady = WPA.translator.markReady || function () {
    document.documentElement.setAttribute("data-wpa-translator", "v2-compat");
    window.dispatchEvent(new CustomEvent("wpa:translator-ready", {
      detail: { version: "v2-compat" }
    }));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", WPA.translator.markReady);
  } else {
    WPA.translator.markReady();
  }
})();

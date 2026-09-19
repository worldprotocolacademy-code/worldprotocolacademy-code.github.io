(function () {
  "use strict";

  var HOME_ROUTES = Object.freeze({
    mk: "/",
    en: "/en/",
    fr: "/languages/fr/"
  });

  var INSTITUTE_ROUTES = Object.freeze({
    mk: "/",
    en: "/en/",
    fr: "/languages/fr/institute.html",
    zh: "/languages/zh/institute.html",
    ru: "/languages/ru/institute.html",
    hi: "/languages/hi/institute.html",
    af: "/languages/af/institute.html",
    ar: "/languages/ar/institute.html",
    de: "/languages/de/institute.html",
    it: "/languages/it/institute.html",
    sq: "/languages/sq/institute.html",
    sr: "/languages/sr/institute.html"
  });

  document.querySelectorAll("select[data-wpa-safe-language-select]").forEach(function (select) {
    select.addEventListener("change", function () {
      var code = String(select.value || "").toLowerCase();
      var context = select.getAttribute("data-wpa-safe-language-select");
      var route = context === "home" ? HOME_ROUTES[code] :
        context === "institute" ? INSTITUTE_ROUTES[code] : null;
      if (route) window.location.assign(route);
    });
  });
}());

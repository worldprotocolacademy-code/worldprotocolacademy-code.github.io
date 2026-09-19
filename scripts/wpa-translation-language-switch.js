(function () {
  "use strict";

  function indexRoute(lang) {
    switch (lang) {
      case "zh": return "../zh/index.html";
      case "ru": return "../ru/index.html";
      case "hi": return "../hi/index.html";
      case "af": return "../af/index.html";
      case "ar": return "../ar/index.html";
      case "fr": return "../fr/index.html";
      case "de": return "../de/index.html";
      case "it": return "../it/index.html";
      case "sq": return "../sq/index.html";
      case "sr": return "../sr/index.html";
      default: return null;
    }
  }

  function instituteRoute(lang) {
    switch (lang) {
      case "zh": return "../zh/institute.html";
      case "ru": return "../ru/institute.html";
      case "hi": return "../hi/institute.html";
      case "af": return "../af/institute.html";
      case "ar": return "../ar/institute.html";
      case "fr": return "../fr/institute.html";
      case "de": return "../de/institute.html";
      case "it": return "../it/institute.html";
      case "sq": return "../sq/institute.html";
      case "sr": return "../sr/institute.html";
      default: return null;
    }
  }

  var select = document.querySelector("select.lang-select[data-wpa-language-page]");
  if (!select) return;

  select.addEventListener("change", function () {
    var lang = String(select.value || "").toLowerCase();
    var page = select.getAttribute("data-wpa-language-page");
    var route = page === "index" ? indexRoute(lang) :
      page === "institute" ? instituteRoute(lang) : null;
    if (route) window.location.assign(route);
  });
}());

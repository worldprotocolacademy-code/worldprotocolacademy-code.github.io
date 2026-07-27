/**
 * WPA Accessibility Helper
 * -------------------------------------------------------------
 * Minimal, honest helper used across WPA static pages:
 *  - Adds a body class when the user has requested reduced motion,
 *    so CSS can disable non-essential animation.
 *  - Adds a body class on first Tab keypress so :focus-visible-style
 *    outlines only show for keyboard users (progressive enhancement;
 *    modern browsers already do this natively via :focus-visible,
 *    this is a fallback only).
 * This file does NOT implement a mobile menu, canvas, or particle
 * system — those live in their own scripts where relevant.
 * -------------------------------------------------------------
 */
(function () {
  "use strict";

  var mql = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  function applyMotionPreference() {
    if (mql && mql.matches) {
      document.documentElement.classList.add("wpa-reduced-motion");
    } else {
      document.documentElement.classList.remove("wpa-reduced-motion");
    }
  }

  if (mql) {
    applyMotionPreference();
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", applyMotionPreference);
    }
  }

  window.addEventListener("keydown", function onFirstTab(e) {
    if (e.key === "Tab") {
      document.body.classList.add("wpa-user-is-tabbing");
      window.removeEventListener("keydown", onFirstTab);
    }
  });
})();

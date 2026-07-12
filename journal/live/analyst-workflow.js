/* WPA Journal Live X11.8 — Analyst Workflow, Saved Views, Provenance and Verification. */
(() => {
  "use strict";

  if (window.WPA_ANALYST_X118_LOADED) return;
  window.WPA_ANALYST_X118_LOADED = true;

  const VERSION = "X11.8";
  const LIVE_PATH = /\/api\/v1\/(live|ticker)$/;
  const nativeFetch = window.fetch.bind(window);
  const STORAGE = {
    viewMode: "wpa-journal-view-mode-v1",
    savedViews: "wpa-journal-saved-views-v1",
    localReviews: "wpa-journal-local-reviews-v1",
    briefing: "wpa-journal
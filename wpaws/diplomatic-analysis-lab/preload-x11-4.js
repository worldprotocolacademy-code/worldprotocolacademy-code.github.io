/* Load config.js first, then this file BEFORE the existing Diplomatic Analysis Lab inline script. */
(() => {
  const api = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  if (api && !api.includes("REPLACE_WITH_")) {
    window.WPA_DIPLO_CACHE_URL = `${api}/api/v1/lab-cache?limit=150`;
  }
})();

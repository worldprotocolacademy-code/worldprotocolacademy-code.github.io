/* Replace the Worker URL after deployment. Keep this file on the same GitHub Pages domain as WPA Journal. */
window.WPA_LIVE_API_URL = window.WPA_LIVE_API_URL || "https://REPLACE_WITH_WORKER_SUBDOMAIN.workers.dev";
window.WPA_ANALYSIS_LAB_URL = window.WPA_ANALYSIS_LAB_URL || "/wpaws/diplomatic-analysis-lab/";
window.WPA_SANDE_BOT_URL = window.WPA_SANDE_BOT_URL || "/virtual-sande-ai.html";
window.WPA_LIVE_REFRESH_MS = window.WPA_LIVE_REFRESH_MS || 30000;
window.WPA_TICKER_ROTATE_MS = window.WPA_TICKER_ROTATE_MS || 8000;
window.WPA_LIVE_DEMO_ENABLED = window.WPA_LIVE_DEMO_ENABLED ?? (location.protocol === "file:" || String(window.WPA_LIVE_API_URL).includes("REPLACE_WITH_"));

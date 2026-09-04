/*
 * WPA Journal Live — production API contract compatibility adapter
 * ----------------------------------------------------------------
 * Purpose:
 * The deployed legacy production bridge currently exposes /api/v1/live,
 * while newer Journal Live clients also request /api/v1/stats and
 * /api/v1/ticker. This adapter keeps /api/v1/live authoritative and uses
 * it only as a read-only fallback when those optional endpoints are absent
 * or fail cross-origin.
 *
 * Integrity rules:
 * - Never manufactures news items.
 * - Never falls back to synthetic demo data on HTTP/HTTPS production.
 * - Never mutates the Worker, D1 or Queue.
 * - Prefers the real endpoint whenever it responds successfully.
 * - Derived stats are explicitly marked as compatibility-derived.
 */
(() => {
  "use strict";

  if (window.WPA_LIVE_API_COMPAT_LOADED) return;
  window.WPA_LIVE_API_COMPAT_LOADED = true;

  const root = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  if (!root || root.includes("REPLACE_WITH_")) return;

  const nativeFetch = window.fetch.bind(window);
  const compat = window.WPA_LIVE_API_COMPAT_STATE = {
    version: "1.0.0",
    statsFallback: false,
    tickerFallback: false,
    lastFallbackAt: "",
    lastError: ""
  };

  const safeJson = async (response) => {
    try {
      return await response.clone().json();
    } catch {
      return null;
    }
  };

  const isNotFoundPayload = (data) =>
    Boolean(data && typeof data === "object" && String(data.error || "").toLowerCase() === "not_found");

  const responseJson = (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-wpa-api-compat": "derived-from-live"
    }
  });

  const fetchLive = async (limit = 120, signal) => {
    const url = `${root}/api/v1/live?limit=${Math.max(1, Math.min(120, Number(limit) || 120))}`;
    const response = await nativeFetch(url, {
      cache: "no-store",
      signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Live fallback HTTP ${response.status}`);
    const data = await response.json();
    if (!data || !Array.isArray(data.items)) throw new Error("Live fallback missing items[] contract");
    return data;
  };

  const validTime = (value) => {
    const t = Date.parse(value || "");
    return Number.isFinite(t) ? t : 0;
  };

  const deriveStats = (live) => {
    const items = Array.isArray(live.items) ? live.items : [];
    const now = Date.now();
    const published24 = items.filter((item) => {
      const t = validTime(item.published_at);
      return t > 0 && t <= now + 3600000 && now - t <= 86400000;
    }).length;
    const packetSources = new Set(
      items.map((item) => String(item.source || "").trim()).filter(Boolean)
    ).size;
    const latestFetch = items.reduce((latest, item) => {
      const value = item.fetched_at || "";
      return validTime(value) > validTime(latest) ? value : latest;
    }, "");

    return {
      mode: "compatibility_derived",
      generated_at: live.generated_at || new Date().toISOString(),
      sources: {
        // This is deliberately a lower-bound packet count, not a claim about
        // the full enabled collector registry.
        active: packetSources ? `≥${packetSources}` : "—",
        metric_scope: "unique_sources_in_current_live_packet"
      },
      items: {
        published_24h: published24,
        metric_scope: "current_live_packet_only"
      },
      latest: {
        latest_fetch: latestFetch || live.generated_at || ""
      },
      compatibility: {
        derived_from: "/api/v1/live",
        reason: "/api/v1/stats unavailable"
      }
    };
  };

  const deriveTicker = (live, requestedLimit) => ({
    mode: "compatibility_derived",
    generated_at: live.generated_at || new Date().toISOString(),
    total: Array.isArray(live.items) ? live.items.length : 0,
    items: (Array.isArray(live.items) ? live.items : []).slice(0, requestedLimit),
    compatibility: {
      derived_from: "/api/v1/live",
      reason: "/api/v1/ticker unavailable"
    }
  });

  const markFallback = (kind, error) => {
    if (kind === "stats") compat.statsFallback = true;
    if (kind === "ticker") compat.tickerFallback = true;
    compat.lastFallbackAt = new Date().toISOString();
    compat.lastError = error ? String(error.message || error) : "";
    setTimeout(patchUi, 0);
    setTimeout(patchUi, 500);
  };

  function patchUi() {
    if (!compat.statsFallback && !compat.tickerFallback) return;

    if (compat.statsFallback) {
      const active = document.getElementById("activeSources");
      const card = active?.closest(".stat");
      const key = card?.querySelector(".k");
      const sub = card?.querySelector(".s");
      if (key) key.textContent = "Извори во пакет";
      if (sub) sub.textContent = "Минимум уникатни извори во тековниот Live пакет";
      if (card) card.title = "Compatibility-derived metric from /api/v1/live; не е број на целиот enabled source registry.";

      const published = document.getElementById("published24");
      const pCard = published?.closest(".stat");
      const pSub = pCard?.querySelector(".s");
      if (pSub) pSub.textContent = "Во тековниот Live API пакет, последни 24ч.";
      if (pCard) pCard.title = "Compatibility-derived count from currently returned /api/v1/live items.";
    }

    const generated = document.getElementById("generatedAt");
    if (generated && !generated.dataset.compatMarked) {
      generated.dataset.compatMarked = "1";
      const note = document.createElement("span");
      note.id = "wpaApiCompatNote";
      note.style.display = "block";
      note.style.marginTop = "4px";
      note.style.color = "var(--gold)";
      note.style.fontSize = ".72rem";
      note.textContent = "Live data: REAL · auxiliary stats/ticker compatibility mode";
      generated.insertAdjacentElement("afterend", note);
    }
  }

  window.fetch = async function wpaLiveCompatFetch(input, init) {
    let url;
    try {
      url = new URL(input instanceof Request ? input.url : String(input), location.href);
    } catch {
      return nativeFetch(input, init);
    }

    let apiRoot;
    try {
      apiRoot = new URL(root);
    } catch {
      return nativeFetch(input, init);
    }

    if (url.origin !== apiRoot.origin) return nativeFetch(input, init);

    const path = url.pathname.replace(/\/+$/, "") || "/";
    const isStats = path === "/api/v1/stats";
    const isTicker = path === "/api/v1/ticker";
    if (!isStats && !isTicker) return nativeFetch(input, init);

    let originalError = null;
    try {
      const response = await nativeFetch(input, init);
      const payload = await safeJson(response);
      if (response.ok && !isNotFoundPayload(payload)) return response;
      if (!isNotFoundPayload(payload) && response.status !== 404) return response;
      originalError = new Error(`Optional endpoint unavailable: HTTP ${response.status}`);
    } catch (error) {
      originalError = error;
    }

    try {
      const signal = init?.signal || (input instanceof Request ? input.signal : undefined);
      if (isStats) {
        const live = await fetchLive(120, signal);
        markFallback("stats", originalError);
        return responseJson(deriveStats(live));
      }

      const requestedLimit = Math.max(1, Math.min(40, Number(url.searchParams.get("limit")) || 40));
      const live = await fetchLive(requestedLimit, signal);
      markFallback("ticker", originalError);
      return responseJson(deriveTicker(live, requestedLimit));
    } catch (fallbackError) {
      compat.lastError = String(fallbackError.message || fallbackError);
      throw originalError || fallbackError;
    }
  };
})();

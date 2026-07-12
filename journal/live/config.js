/* WPA Journal Live X11.5 — production bridge configuration and conservative UI content guard. */
window.WPA_LIVE_API_URL = window.WPA_LIVE_API_URL || "https://wpa-live-production-bridge.worldprotocolacademy.workers.dev";
window.WPA_ANALYSIS_LAB_URL = window.WPA_ANALYSIS_LAB_URL || "/wpaws/diplomatic-analysis-lab/";
window.WPA_SANDE_BOT_URL = window.WPA_SANDE_BOT_URL || "/virtual-sande-ai.html";
window.WPA_LIVE_REFRESH_MS = window.WPA_LIVE_REFRESH_MS || 30000;
window.WPA_TICKER_ROTATE_MS = window.WPA_TICKER_ROTATE_MS || 8000;
window.WPA_LIVE_DEMO_ENABLED = window.WPA_LIVE_DEMO_ENABLED ?? (location.protocol === "file:");

(function () {
  "use strict";

  if (window.WPA_LIVE_X10_GUARD_LOADED) return;
  window.WPA_LIVE_X10_GUARD_LOADED = true;

  const nativeFetch = window.fetch.bind(window);
  const MAX_LIVE_AGE_HOURS = 168;
  const HOUR_MS = 60 * 60 * 1000;
  const audit = window.WPA_LIVE_X10_GUARD_STATE = {
    live: { stale: 0, sportsNoise: 0, exactDuplicates: 0 },
    ticker: { stale: 0, sportsNoise: 0, exactDuplicates: 0 }
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase("en")
      .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeRegion(value) {
    const raw = String(value || "").trim();
    if (!raw) return "Global";
    if (/^(unknown|n\/?a|none|null|undefined|unspecified)$/i.test(raw)) return "International";
    return raw.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  }

  function sourceFamily(source) {
    const key = normalize(source);
    if (key.includes("europol")) return "europol";
    return key;
  }

  function canonicalUrl(value) {
    try {
      const url = new URL(String(value || ""), location.href);
      if (!/^https?:$/.test(url.protocol)) return "";
      url.hash = "";
      for (const key of [...url.searchParams.keys()]) {
        if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) url.searchParams.delete(key);
      }
      url.pathname = url.pathname.replace(/\/$/, "") || "/";
      return url.href.toLocaleLowerCase("en");
    } catch {
      return "";
    }
  }

  function publishedTime(item) {
    const value = item?.published_at || item?.publication_date || item?.pub_date || item?.fetched_at;
    const time = new Date(value || "").getTime();
    return Number.isFinite(time) ? time : null;
  }

  function isStale(item) {
    if (item?.evergreen === true || item?.live_include === true) return false;
    const time = publishedTime(item);
    if (time == null) return false;
    return (Date.now() - time) / HOUR_MS > MAX_LIVE_AGE_HOURS;
  }

  function isLikelySportsOnly(item) {
    if (item?.sports_diplomacy === true || item?.live_include === true) return false;
    const title = normalize(item?.title);
    if (!title) return false;

    const sports = /\b(ufc|mma|boxing|boxer|bout|knockout|fighter|fight|wrestling|football|soccer|basketball|baseball|tennis|rugby|cricket|hockey|formula 1|f1|grand prix|league|playoff|quarterfinal|semifinal|championship|tournament|world cup|olympic|holloway|mcgregor|pimblett)\b/i;
    const publicInterest = /\b(diplomacy|diplomatic|protocol|government|minister|president|parliament|embassy|sanction|security|nato|united nations|summit|bilateral|treaty|ceasefire|conflict|war|election|state visit|official visit|policy|boycott|human rights|visa|refugee|peace|truce)\b/i;

    return sports.test(title) && !publicInterest.test(title);
  }

  function duplicateKey(item) {
    const family = sourceFamily(item?.source);
    const title = normalize(item?.title);
    if (family === "europol" && title) return `family:${family}|title:${title}`;

    const url = canonicalUrl(item?.original_url);
    if (url) return `url:${url}`;
    if (item?.id != null && String(item.id).trim()) return `id:${String(item.id).trim()}`;
    return `fallback:${family}|${title}|${String(item?.published_at || item?.fetched_at || "")}`;
  }

  function preferItem(current, candidate) {
    const currentScore = Number(current?.source_confidence || 0) + Number(current?.relevance_score || 0);
    const candidateScore = Number(candidate?.source_confidence || 0) + Number(candidate?.relevance_score || 0);
    if (candidateScore !== currentScore) return candidateScore > currentScore ? candidate : current;
    return (publishedTime(candidate) || 0) > (publishedTime(current) || 0) ? candidate : current;
  }

  function guardItems(items) {
    const counts = { stale: 0, sportsNoise: 0, exactDuplicates: 0 };
    const unique = new Map();

    for (const raw of Array.isArray(items) ? items : []) {
      const item = { ...(raw || {}), region: normalizeRegion(raw?.region) };
      if (sourceFamily(item.source) === "europol") item.source = "Europol";

      if (isStale(item)) {
        counts.stale += 1;
        continue;
      }
      if (isLikelySportsOnly(item)) {
        counts.sportsNoise += 1;
        continue;
      }

      const key = duplicateKey(item);
      if (unique.has(key)) {
        counts.exactDuplicates += 1;
        unique.set(key, preferItem(unique.get(key), item));
      } else {
        unique.set(key, item);
      }
    }

    return { items: [...unique.values()], counts };
  }

  function requestPath(input) {
    try {
      const value = typeof input === "string" ? input : input?.url;
      return new URL(String(value || ""), location.href).pathname;
    } catch {
      return "";
    }
  }

  function responseWithJson(response, payload) {
    const headers = new Headers(response.headers);
    headers.set("content-type", "application/json; charset=utf-8");
    headers.delete("content-length");
    headers.delete("content-encoding");
    return new Response(JSON.stringify(payload), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  function guardLabel(counts) {
    const parts = [];
    if (counts.stale) parts.push(`${counts.stale} застарени`);
    if (counts.sportsNoise) parts.push(`${counts.sportsNoise} sports-only false positive`);
    if (counts.exactDuplicates) parts.push(`${counts.exactDuplicates} точни дупликати`);
    return parts.length ? `UI guard: исклучени/споени ${parts.join(" · ")}.` : "UI guard: нема исклучени записи.";
  }

  function applyUiHints() {
    document.querySelectorAll(".tag.editorial-gate").forEach((badge) => {
      const pending = /pending/i.test(badge.textContent || "");
      const tooltip = pending
        ? "Ставката е во ред за WPA rule-based editorial gate. Не е човечки прегледана."
        : "Оваа ставка мина низ WPA rule-based editorial gate. Не е човечки прегледана.";
      badge.title = tooltip;
      badge.setAttribute("aria-label", `${badge.textContent}. ${tooltip}`);
    });

    document.querySelectorAll(".tag.human-reviewed").forEach((badge) => {
      const tooltip = "Backend експлицитно означува човечки уреднички преглед од Санде.";
      badge.title = tooltip;
      badge.setAttribute("aria-label", `${badge.textContent}. ${tooltip}`);
    });

    const legendBody = document.querySelector("#rcLegend .rc-legend-body");
    if (legendBody && !document.getElementById("x10GuardLegend")) {
      const note = document.createElement("span");
      note.id = "x10GuardLegend";
      note.innerHTML = "<b>Live UI guard</b><br>Стандардно исклучува записи постари од 7 дена и јасни sports-only false positives; exact Europol дупликатите се спојуваат. Различни медиумски извори за ист настан остануваат видливи.";
      legendBody.appendChild(note);
    }

    const feedSummary = document.getElementById("feedSummary");
    if (feedSummary) {
      let status = document.getElementById("x10GuardSummary");
      if (!status) {
        status = document.createElement("small");
        status.id = "x10GuardSummary";
        status.style.display = "block";
        status.style.marginTop = "5px";
        status.style.color = "var(--gold)";
        status.style.fontSize = ".74rem";
        feedSummary.insertAdjacentElement("afterend", status);
      }
      const label = guardLabel(audit.live);
      if (status.textContent !== label) status.textContent = label;
      status.title = "Client-side safeguard. Root-cause corrections should also be applied in the collector/backend classification pipeline.";
    }
  }

  function scheduleUiHints() {
    window.setTimeout(applyUiHints, 0);
    window.setTimeout(applyUiHints, 200);
  }

  window.fetch = async function (input, init) {
    const response = await nativeFetch(input, init);
    if (!response.ok) return response;

    const path = requestPath(input);
    const kind = /\/api\/v1\/live$/.test(path) ? "live" : /\/api\/v1\/ticker$/.test(path) ? "ticker" : "";
    if (!kind) return response;

    try {
      const payload = await response.clone().json();
      if (!Array.isArray(payload?.items)) return response;
      const guarded = guardItems(payload.items);
      audit[kind] = guarded.counts;
      payload.items = guarded.items;
      payload.wpa_ui_guard = {
        version: "X11.5",
        max_age_hours: MAX_LIVE_AGE_HOURS,
        ...guarded.counts
      };
      scheduleUiHints();
      return responseWithJson(response, payload);
    } catch {
      return response;
    }
  };

  const observer = new MutationObserver(scheduleUiHints);
  const startObserver = () => {
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    scheduleUiHints();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  else startObserver();
})();

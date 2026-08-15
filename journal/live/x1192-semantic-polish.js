/* WPA Journal Live X11.9.2 — semantic clarity overlay.
   Clarifies event-cluster counts and undetermined-language badges without
   changing collection, ranking, filtering, clustering or editorial logic. */
(() => {
  "use strict";

  if (window.WPA_X1192_SEMANTICS_LOADED) return;
  window.WPA_X1192_SEMANTICS_LOADED = true;

  const VERSION = "X11.9.2";
  const CLUSTER_PATTERN = /^(\d+)\s+(?:записи|објави|објава)\s+·\s+(\d+)\s+(?:извори|извор)$/i;
  let observer = null;
  let timer = 0;

  function asCount(value) {
    const number = Number.parseInt(String(value || "0"), 10);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  function clusterLabel(articleCount, sourceCount) {
    const articles = asCount(articleCount);
    const sources = asCount(sourceCount);
    const articleWord = articles === 1 ? "објава" : "објави";
    const sourceWord = sources === 1 ? "извор" : "извори";
    return `${articles} ${articleWord} · ${sources} ${sourceWord}`;
  }

  function clusterExplanation(articleCount, sourceCount) {
    const articles = asCount(articleCount);
    const sources = asCount(sourceCount);
    if (sources <= 1 && articles > 1) {
      return "Поврзани објави во период од 48 часа од ист извор; ова не е независна мулти-изворна потврда.";
    }
    if (sources > 1) {
      return "Поврзани објави во период од 48 часа од повеќе извори; групирањето не е автоматска потврда на фактите.";
    }
    return "Поврзана објава во 48-часовен event cluster; потребна е проверка на оригиналниот извор.";
  }

  function patchClusterBadge(badge) {
    const current = String(badge.textContent || "").trim();
    const match = current.match(CLUSTER_PATTERN);
    if (!match) return;

    const articles = asCount(match[1]);
    const sources = asCount(match[2]);
    const next = clusterLabel(articles, sources);
    if (current !== next) badge.textContent = next;

    const explanation = clusterExplanation(articles, sources);
    badge.title = explanation;
    badge.setAttribute("aria-label", `${next}. ${explanation}`);
    badge.dataset.wpaSemanticVersion = VERSION;
  }

  function patchLanguageBadge(badge) {
    const code = String(badge.textContent || "").trim().toUpperCase();
    if (!code) return;

    if (code === "UND" || code === "UNDET" || code === "UNDEFINED") {
      badge.textContent = "LANG?";
      badge.title = "Јазикот не е утврден во изворниот запис · Undetermined language.";
      badge.setAttribute("aria-label", "Јазикот не е утврден во изворниот запис");
      badge.dataset.wpaLanguageCode = "und";
    } else if (!badge.title) {
      badge.title = `Јазична ознака од изворниот запис: ${code}`;
    }
    badge.dataset.wpaSemanticVersion = VERSION;
  }

  function patchSummaryVersion() {
    const summary = document.getElementById("wpaX119Summary");
    if (!summary) return;
    const current = String(summary.textContent || "");
    const next = current.replace(/^X11\.9\.1\b/, VERSION);
    if (next !== current) summary.textContent = next;
    summary.title = "X11.9.2 додава семантичка јасност; editorial scoring и filtering логиката остануваат непроменети.";
    summary.dataset.wpaSemanticVersion = VERSION;
  }

  function applySemanticPolish() {
    document.querySelectorAll(".tag.x119-event").forEach(patchClusterBadge);
    document.querySelectorAll(".tag.x119-lang").forEach(patchLanguageBadge);
    patchSummaryVersion();

    if (window.WPA_X119_STATE && typeof window.WPA_X119_STATE === "object") {
      window.WPA_X119_STATE.semanticVersion = VERSION;
      window.WPA_X119_STATE.clusterLabelRule = "објава/објави · извор/извори";
      window.WPA_X119_STATE.undeterminedLanguageLabel = "LANG?";
    }
  }

  function scheduleSemanticPolish() {
    window.clearTimeout(timer);
    timer = window.setTimeout(applySemanticPolish, 60);
  }

  function start() {
    document.addEventListener("wpa:x118:data", scheduleSemanticPolish);

    const grid = document.getElementById("newsGrid");
    if (grid && typeof MutationObserver === "function") {
      observer = new MutationObserver(scheduleSemanticPolish);
      observer.observe(grid, { childList: true, subtree: true, characterData: true });
    }

    [40, 180, 500, 1200, 2400].forEach((delay) => {
      window.setTimeout(applySemanticPolish, delay);
    });
  }

  window.WPA_X1192_SEMANTICS = {
    version: VERSION,
    clusterLabel,
    clusterExplanation,
    apply: applySemanticPolish,
    disconnect() {
      if (observer) observer.disconnect();
      observer = null;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

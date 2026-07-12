/* Load this file AFTER the existing Diplomatic Analysis Lab inline script. */
(() => {
  "use strict";
  const api = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  if (!api || api.includes("REPLACE_WITH_")) return;
  let activeSources = null;
  const patchCounts = () => {
    if (activeSources == null) return;
    const sourceCount = document.getElementById("sourceCount");
    if (sourceCount) sourceCount.textContent = String(activeSources);
    const loaded = document.getElementById("loadedCount");
    if (loaded && loaded.textContent.includes("/")) {
      const left = loaded.textContent.split("/")[0];
      loaded.textContent = `${left}/${activeSources}`;
    }
  };
  fetch(`${api}/api/v1/stats`, { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))).then((data) => {
    activeSources = Number(data.sources?.active || 0);
    patchCounts();
    const observer = new MutationObserver(patchCounts);
    const loaded = document.getElementById("loadedCount");
    if (loaded) observer.observe(loaded, { childList: true, characterData: true, subtree: true });
  }).catch(() => {});

  const params = new URLSearchParams(location.search);
  const title = params.get("title") || "";
  const targetId = params.get("item") || "";
  if (!title && !targetId) return;
  let attempts = 0;
  const tryOpen = () => {
    attempts += 1;
    const q = document.getElementById("q");
    if (q && title && q.value !== title) {
      q.value = title;
      q.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const buttons = [...document.querySelectorAll("[data-open]")];
    const exact = targetId ? buttons.find((b) => b.dataset.open === targetId) : null;
    const button = exact || buttons[0];
    if (button) { button.click(); return; }
    if (attempts < 20) setTimeout(tryOpen, 400);
  };
  setTimeout(tryOpen, 500);
})();

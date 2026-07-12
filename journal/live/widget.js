(() => {
  "use strict";
  const root = document.getElementById("wpa-journal-live"); if (!root) return;
  const api = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  const labBase = window.WPA_ANALYSIS_LAB_URL || "/wpaws/diplomatic-analysis-lab/";
  const botBase = window.WPA_SANDE_BOT_URL || "/virtual-sande-ai.html";
  const rotateMs = Math.max(5000, Number(window.WPA_TICKER_ROTATE_MS) || 8000);
  let tickerItems = [], tickerIndex = 0, tickerTimer = null, paused = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = document.createElement("style");
  css.textContent = `.wpa-live-widget{margin:20px 0 30px;padding:22px;border:1px solid rgba(212,166,74,.3);border-radius:22px;background:linear-gradient(180deg,#101d31,#0b1727);box-shadow:0 20px 50px rgba(0,0,0,.24);color:#f3ead4}.wpa-live-widget *{box-sizing:border-box}.wpa-live-widget__head{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}.wpa-live-widget h2{margin:0;color:#fff;font-family:Georgia,serif;font-size:2rem}.wpa-live-widget p{color:#b9b09e}.wpa-live-widget__state{font:800 .75rem Inter,Arial,sans-serif;color:#d4a64a;text-transform:uppercase;letter-spacing:.08em}.wpa-live-widget__ticker{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;margin-top:14px;padding:11px;border:1px solid rgba(212,166,74,.25);border-radius:14px;background:#0b1727}.wpa-live-widget__ticker b{color:#111;background:#d4a64a;border-radius:999px;padding:5px 8px;font:900 .68rem Inter,Arial,sans-serif;text-transform:uppercase}.wpa-live-widget__ticker a{min-width:0;color:#f3ead4;text-decoration:none;border:0;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wpa-live-widget__ticker button{border:1px solid rgba(212,166,74,.3);background:#162640;color:#f3ead4;border-radius:9px;padding:7px 9px;cursor:pointer}.wpa-live-widget__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(245px,1fr));gap:11px;margin-top:15px}.wpa-live-widget__item{border:1px solid rgba(212,166,74,.22);border-radius:15px;padding:13px;background:#162640}.wpa-live-widget__item h3{font-size:1rem;line-height:1.3;margin:7px 0;color:#fff}.wpa-live-widget__item small{color:#b9b09e}.wpa-live-widget__tag{font:800 .65rem Inter,Arial,sans-serif;color:#d4a64a;text-transform:uppercase}.wpa-live-widget__links{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}.wpa-live-widget__links a,.wpa-live-widget__links button{font:800 .72rem Inter,Arial,sans-serif;text-decoration:none;padding:7px 9px;border-radius:9px;border:1px solid rgba(212,166,74,.3);color:#f3ead4;background:transparent;cursor:pointer}.wpa-live-widget__links a:first-child{background:#d4a64a;color:#151006}.wpa-live-widget__error{padding:18px;border:1px dashed rgba(251,113,133,.5);border-radius:14px;color:#ffc0cc;margin-top:14px}`;
  document.head.append(css);

  const shell = document.createElement("section"); shell.className = "wpa-live-widget";
  const head = document.createElement("div"); head.className = "wpa-live-widget__head";
  const titleBox = document.createElement("div"), title = document.createElement("h2"), desc = document.createElement("p");
  title.textContent = "WPA Journal Live Global Monitor"; desc.textContent = "Најнови public-source сигнали од протокол, дипломатија, комуникација и безбедност."; titleBox.append(title, desc);
  const status = document.createElement("div"); status.className = "wpa-live-widget__state"; status.textContent = "Connecting…"; head.append(titleBox, status);
  const ticker = document.createElement("div"); ticker.className = "wpa-live-widget__ticker";
  const label = document.createElement("b"); label.textContent = "Кајрон";
  const tickerLink = document.createElement("a"); tickerLink.target = "_blank"; tickerLink.rel = "noopener noreferrer"; tickerLink.textContent = "Се подготвува live потокот…";
  const pause = document.createElement("button"); pause.type = "button"; pause.textContent = paused ? "Продолжи" : "Пауза";
  ticker.append(label, tickerLink, pause);
  const grid = document.createElement("div"); grid.className = "wpa-live-widget__grid"; shell.append(head, ticker, grid); root.replaceChildren(shell);

  const safe = (value) => { try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch { return ""; } };
  function botLink(item) { try { sessionStorage.setItem("wpa-sande-journal-item-v1", JSON.stringify(item)); } catch {} const u = new URL(botBase, location.href); u.searchParams.set("journal_item", item.id || ""); return u.href; }
  function renderTicker() {
    if (!tickerItems.length) { tickerLink.textContent = "Нема објавени ставки за кајронот."; tickerLink.removeAttribute("href"); return; }
    tickerIndex = ((tickerIndex % tickerItems.length) + tickerItems.length) % tickerItems.length; const item = tickerItems[tickerIndex];
    tickerLink.textContent = `${String(item.primary_category || "communication").toUpperCase()} · ${item.title || "Без наслов"} · ${item.source || "Unknown"}`;
    const url = safe(item.original_url); if (url) tickerLink.href = url; else tickerLink.removeAttribute("href");
  }
  function resetTicker() { clearInterval(tickerTimer); if (!paused && tickerItems.length > 1 && !document.hidden) tickerTimer = setInterval(() => { tickerIndex += 1; renderTicker(); }, rotateMs); }
  pause.onclick = () => { paused = !paused; pause.textContent = paused ? "Продолжи" : "Пауза"; resetTicker(); };
  document.addEventListener("visibilitychange", resetTicker);

  async function load() {
    if (!api || api.includes("REPLACE_WITH_")) { status.textContent = "API not configured"; const e = document.createElement("div"); e.className = "wpa-live-widget__error"; e.textContent = "Live API URL не е конфигуриран во /journal/live/config.js."; grid.replaceChildren(e); return; }
    try {
      const [liveResponse, tickerResponse] = await Promise.all([fetch(`${api}/api/v1/live?limit=12`, { cache: "no-store" }), fetch(`${api}/api/v1/ticker?limit=30&since_hours=168`, { cache: "no-store" })]);
      if (!liveResponse.ok) throw new Error(`HTTP ${liveResponse.status}`); const data = await liveResponse.json(); const tickerData = tickerResponse.ok ? await tickerResponse.json() : data;
      const items = Array.isArray(data.items) ? data.items : []; tickerItems = Array.isArray(tickerData.items) ? tickerData.items : items; tickerIndex = 0; renderTicker(); resetTicker(); grid.replaceChildren();
      for (const item of items) {
        const card = document.createElement("article"); card.className = "wpa-live-widget__item";
        const tag = document.createElement("div"); tag.className = "wpa-live-widget__tag"; tag.textContent = item.primary_category || "communication";
        const h3 = document.createElement("h3"); h3.textContent = item.title || "Без наслов";
        const meta = document.createElement("small"); meta.textContent = `${item.source || "Unknown"} · ${(item.published_at || item.fetched_at || "").slice(0,10)}`;
        const links = document.createElement("div"); links.className = "wpa-live-widget__links";
        const source = document.createElement("a"); source.textContent = "Извор"; source.target = "_blank"; source.rel = "noopener noreferrer"; source.href = safe(item.original_url) || "#";
        const analyze = document.createElement("a"); analyze.textContent = "Lab"; const lab = new URL(labBase, location.href); lab.searchParams.set("item", item.id || ""); lab.searchParams.set("title", item.title || ""); analyze.href = lab.href;
        const bot = document.createElement("a"); bot.textContent = "Санде Бот"; bot.target = "_blank"; bot.rel = "noopener"; bot.href = botLink(item);
        links.append(source, analyze, bot); card.append(tag, h3, meta, links); grid.append(card);
      }
      if (!items.length) { const e = document.createElement("div"); e.className = "wpa-live-widget__error"; e.textContent = "Live API е активен, но сè уште нема објавени релевантни записи."; grid.append(e); }
      status.textContent = `LIVE · ${items.length} items · ${new Date(data.generated_at || Date.now()).toLocaleTimeString("mk-MK")}`;
    } catch (error) { status.textContent = "API unavailable"; const e = document.createElement("div"); e.className = "wpa-live-widget__error"; e.textContent = `Live потокот моментално е недостапен: ${error.message}`; grid.replaceChildren(e); }
  }
  load(); setInterval(load, Math.max(15000, Number(window.WPA_LIVE_REFRESH_MS) || 30000));
})();

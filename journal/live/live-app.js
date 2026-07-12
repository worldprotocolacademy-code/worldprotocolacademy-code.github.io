(() => {
  "use strict";
  const api = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  const refreshMs = Math.max(10000, Number(window.WPA_LIVE_REFRESH_MS) || 30000);
  const tickerMs = Math.max(5000, Number(window.WPA_TICKER_ROTATE_MS) || 8000);
  const labUrl = window.WPA_ANALYSIS_LAB_URL || "/wpaws/diplomatic-analysis-lab/";
  const botUrl = window.WPA_SANDE_BOT_URL || "/virtual-sande-ai.html";
  const state = { items: [], tickerItems: [], tickerIndex: 0, tickerTimer: null, timer: null, tickerPaused: false, selected: null, demoMode: false };
  const $ = (id) => document.getElementById(id);

  function configured() { return api && !api.includes("REPLACE_WITH_"); }
  function demoAvailable() { return Boolean(window.WPA_LIVE_DEMO_ENABLED && window.WPA_LIVE_DEMO_DATA && Array.isArray(window.WPA_LIVE_DEMO_DATA.items)); }
  function activateDemo(reason = "Local demo") {
    const payload = window.WPA_LIVE_DEMO_DATA || { items: [] };
    state.demoMode = true;
    state.items = payload.items.slice();
    state.tickerItems = state.items.slice(0, 40);
    state.tickerIndex = 0;
    text($("activeSources"), "DEMO");
    text($("published24"), state.items.length);
    text($("lastCollector"), "Local demo");
    text($("generatedAt"), `DEMO: ${fmtDate(payload.generated_at)}`);
    const banner = $("demoBanner"); if (banner) banner.hidden = false;
    optionValues("region", state.items.map((x) => x.region), "Сите региони");
    optionValues("sourceType", state.items.map((x) => x.source_type), "Сите типови извори");
    render(); renderTicker(); resetTickerTimer();
    setConnection(true, `DEMO MODE · ${state.items.length} synthetic records · ${reason}`);
  }
  function localSandeReview(item) {
    const cat = item.primary_category || "communication";
    const lens = {
      protocol: "Провери редослед, церемонијална форма, хиерархија, симболи и институционална последователност.",
      diplomacy: "Провери актери, официјален мандат, дипломатска намера, билатерален или мултилатерален контекст.",
      communication: "Провери главна порака, публика, тон, public optics, репутациски ризик и message discipline.",
      security: "Користи само јавни факти; оддели readiness signal од шпекулација и не изведувај класифицирани заклучоци."
    };
    return {
      wpa_significance: `DEMO editorial gate за категоријата ${cat}. Ова е синтетички запис за локално тестирање, не реална вест.`,
      lenses: {
        protocol: cat === "protocol" || (item.signals || []).includes("protocol") ? lens.protocol : "Нема доволно демонстративни елементи за силен протоколарен заклучок.",
        diplomacy: cat === "diplomacy" ? lens.diplomacy : "Провери дали настанот има официјален дипломатски актер или само медиумска интерпретација.",
        communication: lens.communication,
        security: cat === "security" || (item.signals || []).includes("security") ? lens.security : "Не додавај безбедносна интерпретација без јасен јавен извор."
      },
      verification_note: "DEMO SYNTHETIC · Нема реален извор за потврдување. Во production секогаш отвори го оригиналниот јавен извор.",
      suggested_questions: ["Кој е примарниот извор?", "Што е експлицитно наведено, а што е интерпретација?", "Дали постои независна или официјална потврда?"],
      editorial_boundary: "Rule-based educational review. No AI token usage. Human verification required."
    };
  }
  function text(el, value) { if (el) el.textContent = String(value ?? ""); }
  function fmtDate(value) {
    const d = new Date(value || "");
    return Number.isFinite(d.getTime()) ? d.toLocaleString("mk-MK", { dateStyle: "medium", timeStyle: "short" }) : "—";
  }
  function safeUrl(value) { try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch { return ""; } }
  function el(tag, className, content) { const node = document.createElement(tag); if (className) node.className = className; if (content != null) node.textContent = content; return node; }
  async function getJson(path, signal) {
    const response = await fetch(`${api}${path}`, { cache: "no-store", signal, headers: { Accept: "application/json" } });
    if (!response.ok) { const error = new Error(`HTTP ${response.status}`); error.status = response.status; throw error; }
    return response.json();
  }
  function setConnection(ok, message) { $("pulse").classList.toggle("ok", Boolean(ok)); text($("connectionText"), message); }
  function optionValues(id, values, allLabel) {
    const select = $(id); const current = select.value; select.replaceChildren(new Option(allLabel, "all"));
    [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b))).forEach((value) => select.add(new Option(value, value)));
    if ([...select.options].some((o) => o.value === current)) select.value = current;
  }
  function filteredItems() {
    const term = $("search").value.trim().toLocaleLowerCase();
    const category = $("category").value, region = $("region").value, sourceType = $("sourceType").value;
    return state.items.filter((item) => {
      if (category !== "all" && item.primary_category !== category) return false;
      if (region !== "all" && item.region !== region) return false;
      if (sourceType !== "all" && item.source_type !== sourceType) return false;
      if (!term) return true;
      return [item.title, item.summary, item.source, item.country, item.region, ...(item.signals || [])].join(" ").toLocaleLowerCase().includes(term);
    });
  }
  function tag(label, cls = "") { return el("span", `tag ${cls}`.trim(), label); }
  function healthLabel(status) {
    const value = String(status || "unknown").toLowerCase();
    return ({ok:"извор: здрав",empty:"извор: празен feed",error:"извор: грешка",degraded:"извор: degraded",quarantine:"извор: quarantine",pending:"извор: pending",unknown:"извор: непроверен"})[value] || `извор: ${value}`;
  }

  function renderTicker() {
    const items = state.tickerItems.length ? state.tickerItems : filteredItems();
    if (!items.length) {
      text($("tickerTitle"), "Нема достапни релевантни записи за кајронот."); text($("tickerMeta"), "Live API нема објавени ставки"); $("tickerLink").removeAttribute("href"); return;
    }
    state.tickerIndex = ((state.tickerIndex % items.length) + items.length) % items.length;
    const item = items[state.tickerIndex];
    text($("tickerTitle"), item.title || "Без наслов");
    text($("tickerMeta"), `${String(item.primary_category || "communication").toUpperCase()} · ${item.source || "Unknown source"} · ${fmtDate(item.published_at || item.fetched_at)}`);
    const url = safeUrl(item.original_url); if (url) $("tickerLink").href = url; else $("tickerLink").removeAttribute("href");
  }
  function resetTickerTimer() {
    clearInterval(state.tickerTimer); state.tickerTimer = null;
    if (!state.tickerPaused && state.tickerItems.length > 1 && !document.hidden) {
      state.tickerTimer = setInterval(() => { state.tickerIndex += 1; renderTicker(); }, tickerMs);
    }
  }
  function stepTicker(delta) { state.tickerIndex += delta; renderTicker(); resetTickerTimer(); }
  function toggleTicker() {
    state.tickerPaused = !state.tickerPaused;
    text($("tickerToggle"), state.tickerPaused ? "Продолжи" : "Пауза");
    $("tickerToggle").setAttribute("aria-label", state.tickerPaused ? "Продолжи го кајронот" : "Паузирај го кајронот");
    resetTickerTimer();
  }

  function render() {
    const host = $("newsGrid"); host.replaceChildren(); const items = filteredItems();
    text($("visibleItems"), items.length);
    text($("feedSummary"), `Прикажани ${items.length} од ${state.items.length} записи. Секој запис води до оригиналниот јавен извор.`);
    if (!state.tickerItems.length) { state.tickerItems = items.slice(0, 40); state.tickerIndex = 0; renderTicker(); resetTickerTimer(); }
    if (!items.length) { host.append(el("div", "empty", "Нема записи за тековните филтри или Live API сè уште нема објавени ставки.")); return; }
    for (const item of items) {
      const card = el("article", "card"), head = el("div", "card-head"), tags = el("div", "tags");
      tags.append(tag(item.primary_category || "communication", item.primary_category || "communication"));
      for (const signal of (item.signals || []).slice(0, 2)) tags.append(tag(signal));
      if (item.verification_status === "single_official_source") tags.append(tag("official source"));
      if (item.sande_review_status) tags.append(tag("Sande reviewed"));
      tags.append(tag(healthLabel(item.source_health_status), `health-${item.source_health_status || "unknown"}`));
      head.append(tags, el("h3", "", item.title || "Без наслов"));
      const body = el("div", "card-body"); body.append(el("div", "summary", item.summary || "Нема достапно кратко резиме."));
      const meta = el("div", "meta"); meta.append(el("span", "", item.source || "Unknown source"), el("span", "", fmtDate(item.published_at || item.fetched_at))); body.append(meta);
      const healthMeta = el("div", "meta"); healthMeta.append(el("span", "", healthLabel(item.source_health_status)), el("span", "", `Последен успех: ${fmtDate(item.source_last_success_at)}`)); body.append(healthMeta);
      const score = el("div", "meta"); score.append(el("span", "", `${item.region || "Global"}${item.country ? ` · ${item.country}` : ""}`), el("span", "", `R ${item.relevance_score ?? 0} · C ${item.source_confidence ?? 0}`)); body.append(score);
      const actions = el("div", "actions"), sourceUrl = safeUrl(item.original_url);
      if (sourceUrl) { const sourceLink = el("a", "link primary", "Оригинален извор"); sourceLink.href = sourceUrl; sourceLink.target = "_blank"; sourceLink.rel = "noopener noreferrer"; actions.append(sourceLink); }
      const analysis = el("a", "link", "Analyze in Lab"), lab = new URL(labUrl, location.href); lab.searchParams.set("item", item.id || ""); lab.searchParams.set("title", item.title || ""); analysis.href = lab.href; actions.append(analysis);
      const sande = el("button", "link", "Санде Бот"); sande.type = "button"; sande.dataset.sande = item.id || ""; actions.append(sande);
      body.append(actions); card.append(head, body); host.append(card);
    }
  }

  function appendBox(grid, title, content, full = false) {
    const box = el("section", `sande-box${full ? " full" : ""}`), h = el("h3", "", title); box.append(h);
    if (Array.isArray(content)) { const ul = el("ul"); content.forEach((x) => ul.append(el("li", "", x))); box.append(ul); }
    else box.append(el("p", "", content || "—")); grid.append(box);
  }
  function deepBotLink(item) {
    try { sessionStorage.setItem("wpa-sande-journal-item-v1", JSON.stringify(item)); } catch {}
    const u = new URL(botUrl, location.href); u.searchParams.set("journal_item", item.id || ""); return u.href;
  }
  function renderSandeReview(item, review) {
    const grid = el("div", "sande-grid");
    appendBox(grid, "Зошто е релевантно за WPA", review.wpa_significance, true);
    const lenses = review.lenses || {};
    appendBox(grid, "Протоколарен објектив", lenses.protocol);
    appendBox(grid, "Дипломатски објектив", lenses.diplomacy);
    appendBox(grid, "Комуникациски објектив", lenses.communication);
    appendBox(grid, "Безбедносна претпазливост", lenses.security);
    appendBox(grid, "Верификациска белешка", review.verification_note, true);
    appendBox(grid, "Прашања за човечка проверка", review.suggested_questions || [], true);
    appendBox(grid, "Граница", review.editorial_boundary, true);
    const actions = el("div", "sande-actions");
    const deep = el("a", "link primary", "Отвори во Virtual Sande"); deep.href = deepBotLink(item); deep.target = "_blank"; deep.rel = "noopener"; actions.append(deep);
    const source = safeUrl(item.original_url); if (source) { const a = el("a", "link", "Провери оригинал"); a.href = source; a.target = "_blank"; a.rel = "noopener noreferrer"; actions.append(a); }
    $("sandeBody").replaceChildren(grid, actions);
  }
  async function openSande(item) {
    state.selected = item; $("sandeOverlay").classList.add("open"); text($("sandeTitle"), item.title || "WPA уредничка анализа");
    $("sandeBody").replaceChildren(el("div", "empty", "Се вчитува Sande Bot Editorial Gate…"));
    if (state.demoMode) { renderSandeReview(item, localSandeReview(item)); return; }
    try {
      const data = await getJson(`/api/v1/sande/review/${encodeURIComponent(item.id || "")}`);
      renderSandeReview(item, data.review || {});
    } catch (error) {
      $("sandeBody").replaceChildren(el("div", "error", error.status === 404 ? "Sande Bot review сè уште не е генериран за оваа ставка." : `Sande Bot review е недостапен: ${error.message}`));
    }
  }

  async function loadAll() {
    if (!configured()) {
      if (demoAvailable()) { activateDemo("API URL not configured"); return; }
      setConnection(false, "Live API URL не е конфигуриран"); $("newsGrid").replaceChildren(el("div", "error", "Отвори config.js и внеси ја Worker URL-адресата по Cloudflare deployment.")); return;
    }
    state.demoMode = false; const banner = $("demoBanner"); if (banner) banner.hidden = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 18000);
    try {
      setConnection(false, "Се синхронизира со WPA Live API…");
      const [stats, live, ticker] = await Promise.all([getJson("/api/v1/stats", controller.signal), getJson("/api/v1/live?limit=120", controller.signal), getJson("/api/v1/ticker?limit=40&since_hours=168", controller.signal)]);
      state.items = Array.isArray(live.items) ? live.items : []; state.tickerItems = Array.isArray(ticker.items) ? ticker.items : state.items.slice(0, 40); state.tickerIndex = 0;
      text($("activeSources"), stats.sources?.active ?? 0); text($("published24"), stats.items?.published_24h ?? 0); text($("lastCollector"), fmtDate(stats.latest?.latest_fetch)); text($("generatedAt"), `API: ${fmtDate(live.generated_at)}`);
      optionValues("region", state.items.map((x) => x.region), "Сите региони"); optionValues("sourceType", state.items.map((x) => x.source_type), "Сите типови извори");
      render(); renderTicker(); resetTickerTimer(); setConnection(true, `Live API active · ${fmtDate(live.generated_at)}`);
    } catch (error) {
      if (demoAvailable() && !state.items.length) activateDemo(`Live API unavailable: ${error.message}`);
      else { setConnection(false, `Live API недостапен · ${error.message}`); if (!state.items.length) $("newsGrid").replaceChildren(el("div", "error", "Live API моментално не е достапен. Не се прикажуваат неозначени фиктивни fallback вести.")); }
    } finally { clearTimeout(timeout); }
  }

  ["search", "category", "region", "sourceType"].forEach((id) => $(id).addEventListener("input", render));
  $("refresh").addEventListener("click", loadAll); $("tickerPrev").addEventListener("click", () => stepTicker(-1)); $("tickerNext").addEventListener("click", () => stepTicker(1)); $("tickerToggle").addEventListener("click", toggleTicker);
  $("newsGrid").addEventListener("click", (event) => { const button = event.target.closest("[data-sande]"); if (!button) return; const item = state.items.find((x) => String(x.id) === String(button.dataset.sande)); if (item) openSande(item); });
  $("sandeClose").addEventListener("click", () => $("sandeOverlay").classList.remove("open")); $("sandeOverlay").addEventListener("click", (event) => { if (event.target.id === "sandeOverlay") $("sandeOverlay").classList.remove("open"); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") $("sandeOverlay").classList.remove("open"); });
  document.addEventListener("visibilitychange", resetTickerTimer);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { state.tickerPaused = true; text($("tickerToggle"), "Продолжи"); }
  text($("refreshValue"), `${Math.round(refreshMs / 1000)}s`); loadAll(); state.timer = setInterval(loadAll, refreshMs);
  window.addEventListener("beforeunload", () => { clearInterval(state.timer); clearInterval(state.tickerTimer); });
})();

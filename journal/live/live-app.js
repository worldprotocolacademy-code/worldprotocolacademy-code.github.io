(() => {
  "use strict";

  const api = String(window.WPA_LIVE_API_URL || "").replace(/\/$/, "");
  const refreshMs = Math.max(10000, Number(window.WPA_LIVE_REFRESH_MS) || 30000);
  const tickerMs = Math.max(5000, Number(window.WPA_TICKER_ROTATE_MS) || 8000);
  const labUrl = window.WPA_ANALYSIS_LAB_URL || "/wpaws/diplomatic-analysis-lab/";
  const botUrl = window.WPA_SANDE_BOT_URL || "/virtual-sande-ai.html";
  const SKOPJE_TIME_ZONE = "Europe/Skopje";
  const MAX_LIVE_ITEMS = 120;
  const state = {
    items: [],
    tickerItems: [],
    tickerIndex: 0,
    tickerTimer: null,
    timer: null,
    tickerPaused: false,
    selected: null,
    demoMode: false
  };
  const $ = (id) => document.getElementById(id);

  function configured() {
    return api && !api.includes("REPLACE_WITH_");
  }

  function demoAvailable() {
    return Boolean(
      window.WPA_LIVE_DEMO_ENABLED &&
      window.WPA_LIVE_DEMO_DATA &&
      Array.isArray(window.WPA_LIVE_DEMO_DATA.items)
    );
  }

  function text(el, value) {
    if (el) el.textContent = String(value ?? "");
  }

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content != null) node.textContent = content;
    return node;
  }

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFKC")
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("en");
  }

  function normalizeSource(value) {
    const raw = String(value || "Unknown source").trim() || "Unknown source";
    const known = {
      europol: "Europol",
      "european union agency for law enforcement cooperation": "Europol"
    };
    return known[normalizeKey(raw)] || raw;
  }

  function normalizeRegion(value) {
    const raw = String(value || "").trim();
    if (!raw) return "Global";
    if (/^(unknown|n\/?a|none|null|undefined|unspecified)$/i.test(raw)) return "International";
    return raw;
  }

  function normalizeSignals(values) {
    const seen = new Set();
    const output = [];
    for (const value of Array.isArray(values) ? values : []) {
      const label = String(value || "").trim();
      const key = normalizeKey(label);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      output.push(label);
    }
    return output;
  }

  function normalizeItem(item) {
    const sourceHealth = String(item?.source_health_status || "unknown").toLowerCase();
    return {
      ...(item || {}),
      source: normalizeSource(item?.source),
      region: normalizeRegion(item?.region),
      signals: normalizeSignals(item?.signals),
      source_health_status: sourceHealth
    };
  }

  function safeUrl(value) {
    try {
      const u = new URL(value, location.href);
      return /^https?:$/.test(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  }

  function canonicalUrl(value) {
    const url = safeUrl(value);
    if (!url) return "";
    try {
      const u = new URL(url);
      u.hash = "";
      for (const key of [...u.searchParams.keys()]) {
        if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) u.searchParams.delete(key);
      }
      u.pathname = u.pathname.replace(/\/$/, "") || "/";
      return u.href.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  function itemKey(item) {
    const url = canonicalUrl(item.original_url);
    if (url) return `url:${url}`;
    if (item.id != null && String(item.id).trim()) return `id:${String(item.id).trim()}`;
    return `fallback:${normalizeKey(item.source)}|${normalizeKey(item.title)}|${String(item.published_at || item.fetched_at || "")}`;
  }

  function preferItem(current, candidate) {
    const currentScore = Number(current.relevance_score || 0) + Number(current.source_confidence || 0);
    const candidateScore = Number(candidate.relevance_score || 0) + Number(candidate.source_confidence || 0);
    if (candidateScore !== currentScore) return candidateScore > currentScore ? candidate : current;
    const currentTime = new Date(current.published_at || current.fetched_at || 0).getTime() || 0;
    const candidateTime = new Date(candidate.published_at || candidate.fetched_at || 0).getTime() || 0;
    return candidateTime > currentTime ? candidate : current;
  }

  function normalizeAndDedupeItems(items) {
    const byKey = new Map();
    for (const raw of Array.isArray(items) ? items : []) {
      const item = normalizeItem(raw);
      const key = itemKey(item);
      byKey.set(key, byKey.has(key) ? preferItem(byKey.get(key), item) : item);
    }
    return [...byKey.values()];
  }

  function fmtDate(value) {
    const d = new Date(value || "");
    if (!Number.isFinite(d.getTime())) return "—";
    try {
      return new Intl.DateTimeFormat("mk-MK", {
        timeZone: SKOPJE_TIME_ZONE,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      }).format(d);
    } catch {
      return d.toLocaleString("mk-MK");
    }
  }

  function injectPolishStyles() {
    if ($("wpaLivePolishStyles")) return;
    const style = document.createElement("style");
    style.id = "wpaLivePolishStyles";
    style.textContent = `
      .mark img{display:block;width:100%;height:100%;object-fit:cover;border-radius:50%}
      .stat[title]{cursor:help}
      .rc-legend{padding:0!important;overflow:hidden}
      .rc-legend summary{cursor:pointer;list-style:none;padding:13px 16px;color:var(--gold);font-weight:900;letter-spacing:.03em}
      .rc-legend summary::-webkit-details-marker{display:none}
      .rc-legend summary::after{content:'+';float:right;color:var(--muted)}
      .rc-legend[open] summary::after{content:'−'}
      .rc-legend-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0 16px 15px;color:var(--muted);font-size:.84rem}
      .rc-legend-body b{color:var(--gold)}
      .tag.editorial-gate{color:#f0ca64;background:rgba(212,166,74,.12)}
      .tag.human-reviewed{color:var(--ok);background:rgba(56,193,114,.12)}
      .meta-score{cursor:help;text-decoration:underline dotted rgba(212,166,74,.5);text-underline-offset:3px}
      @media(max-width:650px){.rc-legend-body{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function statCard(id) {
    return $(id)?.closest(".stat") || null;
  }

  function setStatCopy(id, label, description, tooltip) {
    const card = statCard(id);
    if (!card) return;
    const key = card.querySelector(".k");
    const sub = card.querySelector(".s");
    text(key, label);
    text(sub, description);
    if (tooltip) {
      card.title = tooltip;
      card.setAttribute("aria-label", `${label}. ${tooltip}`);
    }
  }

  function enhanceStaticUi() {
    injectPolishStyles();

    const mark = document.querySelector(".top .mark");
    if (mark && !mark.querySelector("img")) {
      mark.replaceChildren();
      const logo = document.createElement("img");
      logo.src = "/logo.webp";
      logo.alt = "World Protocol Academy";
      logo.width = 36;
      logo.height = 36;
      logo.decoding = "async";
      logo.loading = "eager";
      mark.appendChild(logo);
    }

    setStatCopy(
      "activeSources",
      "Овозможени извори",
      "Регистар активиран за collector",
      "Извори овозможени во collector-регистарот; бројката не значи дека сите се моментално достапни или успешно преземени."
    );
    setStatCopy(
      "published24",
      "Објавени во 24ч.",
      "WPA-филтрирани записи во последните 24 часа",
      "Backend број на записи објавени во последните 24 часа по WPA тематскиот филтер."
    );
    setStatCopy(
      "visibleItems",
      "Прикажани ставки",
      `Од тековниот API пакет (до ${MAX_LIVE_ITEMS}), по филтрите`,
      "Број на уникатни записи што остануваат по пребарувањето, категоријата, регионот и типот на извор."
    );
    setStatCopy(
      "lastCollector",
      "Последен collector",
      "Europe/Skopje · CET/CEST",
      "Backend timestamp прикажан во временската зона Europe/Skopje."
    );
    setStatCopy(
      "refreshValue",
      "Auto refresh",
      "Освежување само на интерфејсот",
      "Интерфејсот повторно го повикува Live API; ова не ја менува collector-фреквенцијата."
    );

    const stats = document.querySelector(".stats");
    if (stats && !$("rcLegend")) {
      const legend = document.createElement("details");
      legend.id = "rcLegend";
      legend.className = "panel rc-legend";
      legend.innerHTML = `
        <summary>R · C легенда и уреднички статуси</summary>
        <div class="rc-legend-body">
          <span><b>R — Relevance</b><br>Тематска релевантност на ставката за WPA домените.</span>
          <span><b>C — Confidence</b><br>Доверба во типот и институционалниот квалитет на изворот.</span>
          <span><b>Sande Gate ready</b><br>Rule-based уредничка проверка е достапна; не значи човечко одобрување.</span>
          <span><b>Human reviewed by Sande</b><br>Се користи само кога backend експлицитно означува човечки преглед.</span>
        </div>
      `;
      stats.insertAdjacentElement("afterend", legend);
    }
  }

  function activateDemo(reason = "Local demo") {
    const payload = window.WPA_LIVE_DEMO_DATA || { items: [] };
    state.demoMode = true;
    state.items = normalizeAndDedupeItems(payload.items);
    state.tickerItems = state.items.slice(0, 40);
    state.tickerIndex = 0;
    text($("activeSources"), "DEMO");
    text($("published24"), state.items.length);
    text($("lastCollector"), "Local demo");
    text($("generatedAt"), `DEMO: ${fmtDate(payload.generated_at)}`);
    const banner = $("demoBanner");
    if (banner) banner.hidden = false;
    optionValues("region", state.items.map((x) => x.region), "Сите региони");
    optionValues("sourceType", state.items.map((x) => x.source_type), "Сите типови извори");
    render();
    renderTicker();
    resetTickerTimer();
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
      suggested_questions: [
        "Кој е примарниот извор?",
        "Што е експлицитно наведено, а што е интерпретација?",
        "Дали постои независна или официјална потврда?"
      ],
      editorial_boundary: "Rule-based educational review. No AI token usage. Human verification required."
    };
  }

  async function getJson(path, signal) {
    const response = await fetch(`${api}${path}`, {
      cache: "no-store",
      signal,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  function setConnection(ok, message) {
    const pulse = $("pulse");
    if (pulse) pulse.classList.toggle("ok", Boolean(ok));
    text($("connectionText"), message);
  }

  function optionValues(id, values, allLabel) {
    const select = $(id);
    if (!select) return;
    const current = select.value;
    select.replaceChildren(new Option(allLabel, "all"));
    [...new Set(values.filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), "mk"))
      .forEach((value) => select.add(new Option(value, value)));
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  }

  function filteredItems() {
    const term = $("search").value.trim().toLocaleLowerCase("mk");
    const category = $("category").value;
    const region = $("region").value;
    const sourceType = $("sourceType").value;
    return state.items.filter((item) => {
      if (category !== "all" && item.primary_category !== category) return false;
      if (region !== "all" && item.region !== region) return false;
      if (sourceType !== "all" && item.source_type !== sourceType) return false;
      if (!term) return true;
      return [
        item.title,
        item.summary,
        item.source,
        item.country,
        item.region,
        ...(item.signals || [])
      ].join(" ").toLocaleLowerCase("mk").includes(term);
    });
  }

  function tag(label, cls = "") {
    return el("span", `tag ${cls}`.trim(), label);
  }

  function healthLabel(status) {
    const value = String(status || "unknown").toLowerCase();
    return ({
      ok: "извор: здрав",
      empty: "извор: празен feed",
      error: "извор: грешка",
      degraded: "извор: намалена стабилност",
      quarantine: "извор: карантин",
      pending: "извор: проверка во тек",
      unknown: "извор: непроверен"
    })[value] || `извор: ${value}`;
  }

  function sandeStatus(status) {
    const value = normalizeKey(status);
    if (!value) return null;
    if (/(human|manual|approved_by_sande|reviewed_by_sande|human_reviewed)/.test(value)) {
      return { label: "Human reviewed by Sande", cls: "human-reviewed" };
    }
    if (/(pending|queued|processing)/.test(value)) {
      return { label: "Sande Gate pending", cls: "editorial-gate" };
    }
    return { label: "Sande Gate ready", cls: "editorial-gate" };
  }

  function editorialTags(item) {
    const categories = new Set(["protocol", "diplomacy", "security", "communication"]);
    const candidates = [item.primary_category || "communication", ...(item.signals || [])];
    const seen = new Set();
    const result = [];
    for (const candidate of candidates) {
      const label = String(candidate || "").trim();
      const key = normalizeKey(label);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({ label, cls: categories.has(key) ? key : "" });
      if (result.length >= 3) break;
    }
    return result;
  }

  function renderTicker() {
    const items = state.tickerItems.length ? state.tickerItems : filteredItems();
    if (!items.length) {
      text($("tickerTitle"), "Нема достапни релевантни записи за кајронот.");
      text($("tickerMeta"), "Live API нема објавени ставки");
      $("tickerLink")?.removeAttribute("href");
      return;
    }
    state.tickerIndex = ((state.tickerIndex % items.length) + items.length) % items.length;
    const item = items[state.tickerIndex];
    text($("tickerTitle"), item.title || "Без наслов");
    text(
      $("tickerMeta"),
      `${String(item.primary_category || "communication").toUpperCase()} · ${normalizeSource(item.source)} · ${fmtDate(item.published_at || item.fetched_at)}`
    );
    const url = safeUrl(item.original_url);
    if (url) $("tickerLink").href = url;
    else $("tickerLink")?.removeAttribute("href");
  }

  function resetTickerTimer() {
    clearInterval(state.tickerTimer);
    state.tickerTimer = null;
    if (!state.tickerPaused && state.tickerItems.length > 1 && !document.hidden) {
      state.tickerTimer = setInterval(() => {
        state.tickerIndex += 1;
        renderTicker();
      }, tickerMs);
    }
  }

  function stepTicker(delta) {
    state.tickerIndex += delta;
    renderTicker();
    resetTickerTimer();
  }

  function toggleTicker() {
    state.tickerPaused = !state.tickerPaused;
    text($("tickerToggle"), state.tickerPaused ? "Продолжи" : "Пауза");
    $("tickerToggle").setAttribute(
      "aria-label",
      state.tickerPaused ? "Продолжи го кајронот" : "Паузирај го кајронот"
    );
    resetTickerTimer();
  }

  function storeLabContext(item) {
    const context = {
      id: item.id || "",
      title: item.title || "",
      summary: item.summary || "",
      source: normalizeSource(item.source),
      source_type: item.source_type || "",
      original_url: safeUrl(item.original_url),
      published_at: item.published_at || "",
      fetched_at: item.fetched_at || "",
      region: normalizeRegion(item.region),
      country: item.country || "",
      primary_category: item.primary_category || "communication",
      signals: normalizeSignals(item.signals),
      relevance_score: item.relevance_score ?? null,
      source_confidence: item.source_confidence ?? null,
      verification_status: item.verification_status || "",
      source_health_status: item.source_health_status || "unknown"
    };
    try {
      sessionStorage.setItem("wpa-analysis-lab-journal-item-v1", JSON.stringify(context));
    } catch {
      // The URL still carries the minimum non-sensitive handoff fields.
    }
  }

  function render() {
    const host = $("newsGrid");
    if (!host) return;
    host.replaceChildren();
    const items = filteredItems();
    text($("visibleItems"), items.length);
    text(
      $("feedSummary"),
      `Прикажани ${items.length} од ${state.items.length} уникатни записи во тековниот API пакет. Секој запис води до оригиналниот јавен извор.`
    );

    if (!state.tickerItems.length) {
      state.tickerItems = items.slice(0, 40);
      state.tickerIndex = 0;
      renderTicker();
      resetTickerTimer();
    }

    if (!items.length) {
      host.append(el("div", "empty", "Нема записи за тековните филтри или Live API сè уште нема објавени ставки."));
      return;
    }

    for (const item of items) {
      const card = el("article", "card");
      const head = el("div", "card-head");
      const tags = el("div", "tags");

      for (const entry of editorialTags(item)) tags.append(tag(entry.label, entry.cls));
      if (item.verification_status === "single_official_source") tags.append(tag("official source"));
      const reviewStatus = sandeStatus(item.sande_review_status);
      if (reviewStatus) tags.append(tag(reviewStatus.label, reviewStatus.cls));
      tags.append(tag(healthLabel(item.source_health_status), `health-${item.source_health_status || "unknown"}`));
      head.append(tags, el("h3", "", item.title || "Без наслов"));

      const body = el("div", "card-body");
      body.append(el("div", "summary", item.summary || "Нема достапно кратко резиме."));

      const meta = el("div", "meta");
      meta.append(
        el("span", "", normalizeSource(item.source)),
        el("span", "", fmtDate(item.published_at || item.fetched_at))
      );
      body.append(meta);

      const healthMeta = el("div", "meta");
      healthMeta.append(
        el("span", "", healthLabel(item.source_health_status)),
        el("span", "", `Последен успех: ${fmtDate(item.source_last_success_at)}`)
      );
      body.append(healthMeta);

      const score = el("div", "meta");
      const region = normalizeRegion(item.region);
      score.append(
        el("span", "", `${region}${item.country ? ` · ${item.country}` : ""}`),
        el("span", "meta-score", `R ${item.relevance_score ?? 0} · C ${item.source_confidence ?? 0}`)
      );
      score.lastElementChild.title = "R = тематска релевантност; C = доверба во изворот.";
      body.append(score);

      const actions = el("div", "actions");
      const sourceUrl = safeUrl(item.original_url);
      if (sourceUrl) {
        const sourceLink = el("a", "link primary", "Оригинален извор");
        sourceLink.href = sourceUrl;
        sourceLink.target = "_blank";
        sourceLink.rel = "noopener noreferrer";
        actions.append(sourceLink);
      }

      const analysis = el("a", "link", "Analyze in Lab");
      const lab = new URL(labUrl, location.href);
      lab.searchParams.set("item", item.id || "");
      lab.searchParams.set("title", item.title || "");
      lab.searchParams.set("source", normalizeSource(item.source));
      lab.searchParams.set("category", item.primary_category || "communication");
      lab.searchParams.set("region", normalizeRegion(item.region));
      analysis.href = lab.href;
      analysis.dataset.analysis = item.id || itemKey(item);
      actions.append(analysis);

      const sande = el("button", "link", "Санде Бот");
      sande.type = "button";
      sande.dataset.sande = item.id || itemKey(item);
      actions.append(sande);

      body.append(actions);
      card.append(head, body);
      host.append(card);
    }
  }

  function appendBox(grid, title, content, full = false) {
    const box = el("section", `sande-box${full ? " full" : ""}`);
    const heading = el("h3", "", title);
    box.append(heading);
    if (Array.isArray(content)) {
      const list = el("ul");
      content.forEach((value) => list.append(el("li", "", value)));
      box.append(list);
    } else {
      box.append(el("p", "", content || "—"));
    }
    grid.append(box);
  }

  function deepBotLink(item) {
    try {
      sessionStorage.setItem("wpa-sande-journal-item-v1", JSON.stringify(item));
    } catch {
      // The item ID remains available in the URL.
    }
    const u = new URL(botUrl, location.href);
    u.searchParams.set("journal_item", item.id || "");
    return u.href;
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
    const deep = el("a", "link primary", "Отвори во Virtual Sande");
    deep.href = deepBotLink(item);
    deep.target = "_blank";
    deep.rel = "noopener";
    actions.append(deep);

    const source = safeUrl(item.original_url);
    if (source) {
      const link = el("a", "link", "Провери оригинал");
      link.href = source;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.append(link);
    }
    $("sandeBody").replaceChildren(grid, actions);
  }

  async function openSande(item) {
    state.selected = item;
    $("sandeOverlay").classList.add("open");
    text($("sandeTitle"), item.title || "WPA уредничка анализа");
    $("sandeBody").replaceChildren(el("div", "empty", "Се вчитува Sande Bot Editorial Gate…"));
    if (state.demoMode) {
      renderSandeReview(item, localSandeReview(item));
      return;
    }
    try {
      const data = await getJson(`/api/v1/sande/review/${encodeURIComponent(item.id || "")}`);
      renderSandeReview(item, data.review || {});
    } catch (error) {
      $("sandeBody").replaceChildren(
        el(
          "div",
          "error",
          error.status === 404
            ? "Sande Bot review сè уште не е генериран за оваа ставка."
            : `Sande Bot review е недостапен: ${error.message}`
        )
      );
    }
  }

  function findItemByIdentifier(identifier) {
    return state.items.find((item) => String(item.id || itemKey(item)) === String(identifier));
  }

  async function loadAll() {
    if (!configured()) {
      if (demoAvailable()) {
        activateDemo("API URL not configured");
        return;
      }
      setConnection(false, "Live API URL не е конфигуриран");
      $("newsGrid").replaceChildren(
        el("div", "error", "Отвори config.js и внеси ја Worker URL-адресата по Cloudflare deployment.")
      );
      return;
    }

    state.demoMode = false;
    const banner = $("demoBanner");
    if (banner) banner.hidden = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    try {
      setConnection(false, "Се синхронизира со WPA Live API…");
      const [stats, live, ticker] = await Promise.all([
        getJson("/api/v1/stats", controller.signal),
        getJson(`/api/v1/live?limit=${MAX_LIVE_ITEMS}`, controller.signal),
        getJson("/api/v1/ticker?limit=40&since_hours=168", controller.signal)
      ]);

      state.items = normalizeAndDedupeItems(live.items);
      state.tickerItems = normalizeAndDedupeItems(ticker.items);
      if (!state.tickerItems.length) state.tickerItems = state.items.slice(0, 40);
      state.tickerIndex = 0;

      text($("activeSources"), stats.sources?.active ?? 0);
      text($("published24"), stats.items?.published_24h ?? 0);
      text($("lastCollector"), fmtDate(stats.latest?.latest_fetch));
      text($("generatedAt"), `API: ${fmtDate(live.generated_at)}`);

      optionValues("region", state.items.map((item) => item.region), "Сите региони");
      optionValues("sourceType", state.items.map((item) => item.source_type), "Сите типови извори");
      render();
      renderTicker();
      resetTickerTimer();
      setConnection(true, `Live API active · ${fmtDate(live.generated_at)}`);
    } catch (error) {
      if (demoAvailable() && !state.items.length) {
        activateDemo(`Live API unavailable: ${error.message}`);
      } else {
        setConnection(false, `Live API недостапен · ${error.message}`);
        if (!state.items.length) {
          $("newsGrid").replaceChildren(
            el(
              "div",
              "error",
              "Live API моментално не е достапен. Не се прикажуваат неозначени фиктивни fallback вести."
            )
          );
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  enhanceStaticUi();

  ["search", "category", "region", "sourceType"].forEach((id) => {
    $(id)?.addEventListener("input", render);
  });
  $("refresh")?.addEventListener("click", loadAll);
  $("tickerPrev")?.addEventListener("click", () => stepTicker(-1));
  $("tickerNext")?.addEventListener("click", () => stepTicker(1));
  $("tickerToggle")?.addEventListener("click", toggleTicker);

  $("newsGrid")?.addEventListener("click", (event) => {
    const analysisLink = event.target.closest("[data-analysis]");
    if (analysisLink) {
      const item = findItemByIdentifier(analysisLink.dataset.analysis);
      if (item) storeLabContext(item);
      return;
    }
    const button = event.target.closest("[data-sande]");
    if (!button) return;
    const item = findItemByIdentifier(button.dataset.sande);
    if (item) openSande(item);
  });

  $("sandeClose")?.addEventListener("click", () => $("sandeOverlay").classList.remove("open"));
  $("sandeOverlay")?.addEventListener("click", (event) => {
    if (event.target.id === "sandeOverlay") $("sandeOverlay").classList.remove("open");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") $("sandeOverlay")?.classList.remove("open");
  });
  document.addEventListener("visibilitychange", resetTickerTimer);

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    state.tickerPaused = true;
    text($("tickerToggle"), "Продолжи");
  }

  text($("refreshValue"), `${Math.round(refreshMs / 1000)}s`);
  loadAll();
  state.timer = setInterval(loadAll, refreshMs);
  window.addEventListener("beforeunload", () => {
    clearInterval(state.timer);
    clearInterval(state.tickerTimer);
  });
})();

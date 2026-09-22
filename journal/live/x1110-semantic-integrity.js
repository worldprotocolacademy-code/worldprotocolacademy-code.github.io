/* WPA Journal Live X11.10 — final semantic integrity and scope hardening.
   Runs after X11.9.x so the public UI, Fusion lenses and Analyst Workflow
   consume one final governed item set. Original API category/geography are
   preserved on each adjusted item for provenance. */
(() => {
  "use strict";

  if (window.WPA_JOURNAL_LIVE_X1110_LOADED) return;
  window.WPA_JOURNAL_LIVE_X1110_LOADED = true;

  const VERSION = "X11.10";
  const API_RE = /\/api\/v1\/(live|ticker)$/;
  const previousFetch = window.fetch.bind(window);
  const CATEGORY_KEYS = new Set(["protocol", "diplomacy", "security", "communication", "pr", "communicology"]);
  const state = {
    live: [],
    ticker: [],
    review: [],
    stats: { input: 0, published: 0, category_adjusted: 0, geo_adjusted: 0, reviewed: 0 }
  };

  function norm(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
      .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/gi, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function contentText(item) {
    return norm([item?.title, item?.summary, item?.description, item?.body].filter(Boolean).join(" "));
  }

  function semanticCategory(item) {
    const text = contentText(item);
    if (!text) return "";

    const protocol = /\b(credentials?|credential ceremony|presents? (?:his|her )?credentials|precedence|state visit|official visit|state funeral|inauguration|official reception|state banquet|ceremonial|commemorat\w*|twinning|chief of protocol|accreditation|flag protocol|anthem|state symbol|акредитив\w*|првенство|церемони\w*|комеморац\w*|државна посета|официјална посета)\b/i.test(text);
    if (protocol) return "protocol";

    // "Security Council" is an institution, not by itself a security-event signal.
    const securityText = text.replace(/\b(?:united nations |un )?security council\b/g, " ");
    const operationalSecurity = /\b(war|attack\w*|bomb\w*|explosion\w*|military|defen[cs]e|terror\w*|traffick\w*|cyber\w*|drone\w*|weapon\w*|violence|security situation|border security|civil defence|hostage\w*|missile\w*|airstrike\w*|sabotage|covert attack\w*|војна|напад\w*|бомб\w*|експлози\w*|воен\w*|одбрана|терор\w*|трговија со луѓе|кибер\w*|дрон\w*|оруж\w*|насилств\w*)\b/i.test(securityText);
    if (operationalSecurity) return "security";

    const diplomacy = /\b(foreign minister|foreign ministry|ministry of foreign affairs|diplomat\w*|bilateral|multilateral|summit|negotiat\w*|peace talks|talks with|ceasefire|sanction\w*|embassy|ambassador\w*|un general assembly|unga|security council reform|security council seat|treaty|memorandum|official delegation|international relations|sovereignty|eu participation|foreign investment|american chamber|regional cooperation|good relations|надворешни работи|дипломат\w*|билатерал\w*|мултилатерал\w*|самит|преговор\w*|амбасад\w*|генерално собрание|меѓународни односи)\b/i.test(text);
    if (diplomacy) return "diplomacy";

    const securityGovernance = /\b(security framework|security reform|national security strategy|public safety|risk management|безбедносна рамка|безбедносна реформа|национална безбедносна стратегија|јавна безбедност|управување со ризик)\b/i.test(securityText);
    if (securityGovernance) return "security";

    const communication = /\b(media|press freedom|press ban|journalist\w*|newsroom|spokesperson|rhetoric|narrative|public communication|communication campaign|disinformation|fake news|white house ban|медиум\w*|новинар\w*|портпарол\w*|реторик\w*|наратив\w*|комуникац\w*)\b/i.test(text);
    if (communication) return "communication";

    return "";
  }

  const BALKAN_PREFIX = [
    [/^north macedonia\b|^северна македонија\b/i, "Северна Македонија"],
    [/^serbia\b|^србија\b/i, "Србија"],
    [/^bulgaria\b|^bulgarian\b|^бугарија\b|^бугарск/i, "Бугарија"],
    [/^croatia\b|^хрватска\b/i, "Хрватска"],
    [/^albania\b|^албанија\b/i, "Албанија"],
    [/^montenegro\b|^црна гора\b/i, "Црна Гора"],
    [/^bosnia(?: and herzegovina)?\b|^босна(?: и херцеговина)?\b/i, "Босна и Херцеговина"],
    [/^kosovo\b|^косово\b/i, "Косово"],
    [/^greece\b|^грција\b/i, "Грција"],
    [/^romania\b|^романија\b/i, "Романија"],
    [/^slovenia\b|^словенија\b/i, "Словенија"]
  ];

  function inferEventGeo(item) {
    const title = norm(item?.title);
    if (!title) return null;
    for (const [pattern, country] of BALKAN_PREFIX) {
      if (pattern.test(title)) return { region: "БАЛКАН", country, method: "title_subject_country" };
    }
    return null;
  }

  function coreScope(item) {
    const text = contentText(item);
    return /\b(protocol|diplomat\w*|foreign minister|foreign ministry|ministry of foreign affairs|embassy|ambassador\w*|bilateral|multilateral|summit|un general assembly|unga|united nations|security council|nato|osce|european union|ceasefire|sanction\w*|negotiat\w*|peace talks|sovereignty|human rights|minority rights|traffick\w*|war|attack\w*|military|defen[cs]e|terror\w*|cyber\w*|security framework|security situation|border security|press freedom|journalist\w*|disinformation|public communication|crisis communication|strategic communication|foreign investment|american chamber|democratic resilience|citizens panel|commemorat\w*|twinning|credentials?|ceremon\w*|протокол|дипломат\w*|надворешни работи|амбасад\w*|билатерал\w*|мултилатерал\w*|самит|обединети нации|нато|обсе|санкци\w*|преговор\w*|човекови права|трговија со луѓе|војна|напад\w*|воен\w*|одбрана|терор\w*|кибер\w*|безбедносна рамка|слобода на медиуми|дезинформац\w*|јавна комуникац\w*|кризна комуникац\w*|комеморац\w*|церемони\w*)\b/i.test(text);
  }

  function semanticReviewReason(item) {
    if (item?.live_include === true) return "";
    const title = norm(item?.title);
    if (/\b(news live|as it happened|morning recap|evening recap|daily recap|live blog|liveblog|rolling live|morning headlines)\b/i.test(title)) {
      return "rolling_live_or_roundup";
    }
    const source = norm(item?.source);
    const sourceType = norm(item?.source_type);
    const wireOrMedia = /\b(bta|bulgarian telegraph agency|news agency|wire|media|newspaper|television|radio)\b/i.test(`${source} ${sourceType}`);
    if (wireOrMedia && !coreScope(item)) return "weak_wpa_thematic_scope";
    return "";
  }

  function correctedSignals(item, category) {
    const out = [];
    const seen = new Set();
    for (const raw of Array.isArray(item?.signals) ? item.signals : []) {
      const key = norm(raw);
      if (!key || CATEGORY_KEYS.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push(raw);
    }
    if (category) out.unshift(category);
    return out;
  }

  function applyCorrections(raw, count) {
    const item = { ...(raw || {}) };
    const originalCategory = norm(item.primary_category || "communication") || "communication";
    const nextCategory = semanticCategory(item);
    if (nextCategory && nextCategory !== originalCategory) {
      item.wpa_original_primary_category = item.primary_category || "communication";
      item.primary_category = nextCategory;
      item.signals = correctedSignals(item, nextCategory);
      item.wpa_semantic_category_adjustment = {
        version: VERSION,
        from: item.wpa_original_primary_category,
        to: nextCategory,
        method: "title_summary_high_confidence_rules"
      };
      if (count) state.stats.category_adjusted += 1;
    }

    const geo = inferEventGeo(item);
    if (geo) {
      const currentRegion = String(item.region || "");
      const currentCountry = String(item.country || "");
      if (norm(currentRegion) !== norm(geo.region) || norm(currentCountry) !== norm(geo.country)) {
        item.wpa_original_region = currentRegion;
        item.wpa_original_country = currentCountry;
        item.region = geo.region;
        item.country = geo.country;
        item.wpa_geo_adjustment = { version: VERSION, ...geo };
        if (count) state.stats.geo_adjusted += 1;
      }
    }
    return item;
  }

  function syncConsumers(kind, items) {
    let finalItems = items;
    const analyst = window.WPA_X118_DATA;
    if (analyst?.enrich) finalItems = items.map((item) => analyst.enrich(item));
    if (analyst?.state && Object.prototype.hasOwnProperty.call(analyst.state, kind)) analyst.state[kind] = finalItems.slice();

    window.WPA_FUSION_X117?.syncPostEditorialItems?.(finalItems, kind);

    document.dispatchEvent(new CustomEvent("wpa:x1110:data", { detail: { kind, count: finalItems.length, version: VERSION } }));
    document.dispatchEvent(new CustomEvent("wpa:x118:data", { detail: { kind, count: finalItems.length, phase: "semantic-final", version: VERSION } }));
    return finalItems;
  }

  function processItems(items, kind) {
    if (kind === "live") {
      state.review = [];
      state.stats = { input: (items || []).length, published: 0, category_adjusted: 0, geo_adjusted: 0, reviewed: 0 };
    }
    const kept = [];
    for (const raw of items || []) {
      const item = applyCorrections(raw, kind === "live");
      const reason = semanticReviewReason(item);
      if (reason) {
        if (kind === "live") state.review.push({ ...item, wpa_semantic_review_reason: reason });
        continue;
      }
      kept.push(item);
    }
    const finalItems = syncConsumers(kind, kept);
    state[kind] = finalItems;
    if (kind === "live") {
      state.stats.published = finalItems.length;
      state.stats.reviewed = state.review.length;
    }
    return finalItems;
  }

  function jsonResponse(response, payload) {
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

  window.fetch = async function semanticIntegrityFetch(input, init) {
    const response = await previousFetch(input, init);
    if (!response.ok) return response;
    let kind = "";
    try {
      kind = new URL(typeof input === "string" ? input : input?.url, location.href).pathname.match(API_RE)?.[1] || "";
    } catch {
      return response;
    }
    if (!kind) return response;

    try {
      const payload = await response.clone().json();
      if (!Array.isArray(payload?.items)) return response;
      payload.items = processItems(payload.items, kind);
      payload.wpa_semantic_integrity = {
        version: VERSION,
        stats: kind === "live" ? { ...state.stats } : { published: payload.items.length },
        rules: "high-confidence category correction; title-subject Balkan geography correction; rolling/roundup and weak-scope review",
        provenance: "Original API category and geography are retained on adjusted records.",
        boundary: "Semantic correction is editorial routing, not factual verification or human approval."
      };
      scheduleUi();
      return jsonResponse(response, payload);
    } catch (error) {
      console.warn("WPA X11.10 returned the post-X11.9 payload unchanged", error);
      return response;
    }
  };

  function ensureStyle() {
    if (document.getElementById("wpaX1110Style")) return;
    const style = document.createElement("style");
    style.id = "wpaX1110Style";
    style.textContent = `
      .x1110-summary{margin:7px 0;color:var(--gold);font-size:.74rem}
      .x1110-panel{margin:8px 0;border:1px solid rgba(212,166,74,.22);border-radius:10px;background:rgba(255,255,255,.025)}
      .x1110-panel summary{cursor:pointer;padding:8px 10px;color:var(--gold);font-size:.76rem;font-weight:900}
      .x1110-list{max-height:260px;overflow:auto;padding:0 10px 9px}
      .x1110-row{padding:6px 0;border-top:1px solid rgba(255,255,255,.07);font-size:.74rem}
      .x1110-row b{display:block;color:var(--paper)}
      .x1110-row small{color:var(--muted)}
      .tag.x1110-corrected{color:#b9f4d1;background:rgba(56,193,114,.1)}
    `;
    document.head.appendChild(style);
  }

  function reviewPanel() {
    const details = document.createElement("details");
    details.className = "x1110-panel";
    const summary = document.createElement("summary");
    summary.textContent = `Semantic Review · ${state.review.length}`;
    const list = document.createElement("div");
    list.className = "x1110-list";
    const intro = document.createElement("p");
    intro.textContent = "Rolling/recap формати и записи без доволна WPA тематска врска се издвоени за човечка проверка; не се избришани од изворот.";
    intro.style.color = "var(--muted)";
    list.append(intro);
    for (const item of state.review.slice(0, 50)) {
      const row = document.createElement("div");
      row.className = "x1110-row";
      const title = document.createElement("b");
      title.textContent = item.title || "Без наслов";
      const meta = document.createElement("small");
      meta.textContent = `${item.source || "Unknown source"} · ${item.wpa_semantic_review_reason || "review"}`;
      row.append(title, meta);
      list.append(row);
    }
    details.append(summary, list);
    return details;
  }

  function decorate() {
    ensureStyle();
    const feedSummary = document.getElementById("feedSummary");
    if (!feedSummary) return;

    let line = document.getElementById("wpaX1110Summary");
    if (!line) {
      line = document.createElement("div");
      line.id = "wpaX1110Summary";
      line.className = "x1110-summary";
      const anchor = document.getElementById("wpaX119Panels") || document.getElementById("wpaX119Summary") || feedSummary;
      anchor.insertAdjacentElement("afterend", line);
    }
    line.textContent = `${VERSION} Semantic Integrity · ${state.stats.category_adjusted} category corrections · ${state.stats.geo_adjusted} geo corrections · ${state.stats.reviewed} semantic review`;

    let panel = document.getElementById("wpaX1110Panel");
    const replacement = reviewPanel();
    replacement.id = "wpaX1110Panel";
    if (panel) panel.replaceWith(replacement);
    else line.insertAdjacentElement("afterend", replacement);

    const byTitle = new Map();
    for (const item of state.live) {
      const key = norm(item.title);
      if (!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key).push(item);
    }
    const used = new Map();
    document.querySelectorAll("#newsGrid > .card").forEach((card) => {
      const key = norm(card.querySelector("h3")?.textContent);
      const index = used.get(key) || 0;
      const item = byTitle.get(key)?.[index];
      used.set(key, index + 1);
      if (!item) return;
      const corrected = item.wpa_semantic_category_adjustment || item.wpa_geo_adjustment;
      const tags = card.querySelector(".tags");
      if (corrected && tags && !tags.querySelector(".x1110-corrected")) {
        const badge = document.createElement("span");
        badge.className = "tag x1110-corrected";
        badge.textContent = "semantic corrected";
        const notes = [];
        if (item.wpa_semantic_category_adjustment) notes.push(`category: ${item.wpa_semantic_category_adjustment.from} → ${item.wpa_semantic_category_adjustment.to}`);
        if (item.wpa_geo_adjustment) notes.push(`geo: ${item.wpa_original_region || "—"} / ${item.wpa_original_country || "—"} → ${item.region} / ${item.country}`);
        badge.title = notes.join(" · ");
        tags.appendChild(badge);
      }
    });

    window.WPA_X1110_STATE = {
      version: VERSION,
      ...state.stats,
      review: state.review.length
    };
  }

  let uiTimer = 0;
  function scheduleUi() {
    clearTimeout(uiTimer);
    uiTimer = window.setTimeout(decorate, 80);
    window.setTimeout(decorate, 400);
    window.setTimeout(decorate, 1100);
  }

  function start() {
    document.addEventListener("wpa:x1110:data", scheduleUi);
    const grid = document.getElementById("newsGrid");
    if (grid && typeof MutationObserver === "function") {
      new MutationObserver(scheduleUi).observe(grid, { childList: true, subtree: true });
    }
    scheduleUi();
  }

  window.WPA_X1110 = {
    version: VERSION,
    state,
    semanticCategory,
    inferEventGeo,
    semanticReviewReason,
    processItems
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

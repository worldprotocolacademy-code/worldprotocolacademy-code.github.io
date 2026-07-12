/* WPA Journal Live X11.8-R2 — noise, semantics and publication-date hardening. */
(() => {
  "use strict";

  if (window.WPA_LIVE_NOISE_HARDENING_LOADED) return;
  window.WPA_LIVE_NOISE_HARDENING_LOADED = true;

  const VERSION = "X11.8-R2";
  const LIVE_PATH = /\/api\/v1\/(live|ticker)$/;
  const previousFetch = window.fetch.bind(window);
  const state = {
    live: [],
    ticker: [],
    dropped: {
      live: { lottery: 0, sports: 0 },
      ticker: { lottery: 0, sports: 0 },
      demo: { lottery: 0, sports: 0 }
    },
    scheduled: false
  };

  function normalize(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("en")
      .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/gi, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function itemText(item) {
    return normalize([
      item?.title,
      item?.summary,
      item?.description,
      item?.source,
      item?.primary_category,
      ...(Array.isArray(item?.signals) ? item.signals : [])
    ].filter(Boolean).join(" "));
  }

  function isLotteryNoise(item) {
    const text = itemText(item);
    return /\b(lottery|lotto|loto|piyango|sans topu|sayisal loto|super loto|cekilis|cekilis sonuclari|winning numbers|jackpot)\b/i.test(text);
  }

  function hasExplicitSportsDiplomacyException(item) {
    if (item?.sports_diplomacy === true || item?.live_include === true) return true;
    const text = itemText(item);
    const institutionalActor = /\b(government|ministry|minister|president|prime minister|parliament|embassy|foreign ministry|state department|united nations|european union|nato|влада|министерство|министер|претседател|премиер|парламент|амбасада|обединети нации|европска унија|нато)\b/i.test(text);
    const diplomaticAction = /\b(boycott|sanction|visa policy|diplomatic protest|official protest|bilateral agreement|state policy|government statement|ministerial statement|peace initiative|ceasefire|human rights|refugee policy|бојкот|санкци|визна политика|дипломатски протест|официјален протест|билатерален договор|државна политика|владина изјава|министерска изјава|мировна иницијатива|примирје|човекови права|бегалска политика)\b/i.test(text);
    return institutionalActor && diplomaticAction;
  }

  function isSportsNoise(item) {
    if (hasExplicitSportsDiplomacyException(item)) return false;
    const text = itemText(item);
    const sportsDomain = /\b(athletics|track and field|football|soccer|basketball|baseball|tennis|rugby|cricket|hockey|boxing|mma|ufc|wrestling|formula 1|grand prix|olympic|world cup|championship|tournament|league|playoff|semifinal|quarterfinal|match|fixture|атлетика|фудбал|кошарка|тенис|рагби|бокс|олимписки|светско првенство|шампионат|турнир|лига|натпревар)\b/i.test(text);
    const resultLanguage = /\b(medal|medals|wins gold|wins silver|wins bronze|champion|champions|score|results|standings|qualification|u20|u21|u23|медал|медали|злато|сребро|бронза|шампион|резултат|табела|квалификаци)\b/i.test(text);
    return sportsDomain && resultLanguage;
  }

  function dropReason(item) {
    if (isLotteryNoise(item)) return "lottery";
    if (isSportsNoise(item)) return "sports";
    return "";
  }

  function filterItems(items, kind) {
    const bucket = state.dropped[kind] || { lottery: 0, sports: 0 };
    bucket.lottery = 0;
    bucket.sports = 0;
    const kept = [];
    for (const item of Array.isArray(items) ? items : []) {
      const reason = dropReason(item);
      if (reason) {
        bucket[reason] += 1;
        continue;
      }
      kept.push(item);
    }
    state.dropped[kind] = bucket;
    state[kind] = kept;
    return kept;
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

  window.fetch = async function hardenedFetch(input, init) {
    const response = await previousFetch(input, init);
    if (!response.ok) return response;

    let kind = "";
    try {
      kind = new URL(typeof input === "string" ? input : input?.url, location.href).pathname.match(LIVE_PATH)?.[1] || "";
    } catch {
      return response;
    }
    if (!kind) return response;

    try {
      const payload = await response.clone().json();
      if (!Array.isArray(payload?.items)) return response;
      payload.items = filterItems(payload.items, kind);
      payload.wpa_noise_hardening = {
        version: VERSION,
        dropped: { ...state.dropped[kind] },
        rules: "lottery noise; athletics/medals and sports-result noise; strict sports-diplomacy exception",
        boundary: "Filtering is thematic hygiene, not a truth or credibility judgment."
      };
      schedulePolish();
      return responseWithJson(response, payload);
    } catch {
      return response;
    }
  };

  function formatPublished(value) {
    const date = new Date(value || "");
    if (!Number.isFinite(date.getTime())) return "Без потврден датум на објава";
    try {
      return new Intl.DateTimeFormat("mk-MK", {
        timeZone: "Europe/Skopje",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      }).format(date);
    } catch {
      return date.toLocaleString("mk-MK");
    }
  }

  function currentItems() {
    const analystItems = window.WPA_X118_DATA?.getItems?.();
    if (Array.isArray(analystItems) && analystItems.length) {
      return analystItems.filter((item) => !dropReason(item));
    }
    return state.live.length ? state.live : state.ticker;
  }

  function mapByTitle(items) {
    const map = new Map();
    for (const item of items) {
      const key = normalize(item?.title);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  }

  function polishDedupeBadges() {
    document.querySelectorAll(".integrity-merged").forEach((badge) => {
      const count = Number(String(badge.textContent || "").match(/\d+/)?.[0] || 0);
      if (!count) return;
      const label = `${count} технички записи споени`;
      if (badge.textContent !== label) badge.textContent = label;
      badge.title = "Технички дупликати се споени по canonical URL, наслов или идентичен feed-текст. Ова не значи независна потврда од ист број извори.";
      badge.setAttribute("aria-label", badge.title);
    });
  }

  function polishSandeBadges() {
    document.querySelectorAll(".tag.editorial-gate").forEach((badge) => {
      const pending = /pending|тек/i.test(badge.textContent || "");
      badge.title = pending
        ? "Rule-based WPA editorial gate е во тек. Ставката не е човечки прегледана."
        : "Rule-based WPA editorial gate е достапен. Ставката не е човечки прегледана и не претставува одобрување од Санде.";
      badge.setAttribute("aria-label", badge.title);
    });
    document.querySelectorAll(".tag.human-reviewed").forEach((badge) => {
      badge.title = "Backend експлицитно евидентира човечки преглед од Санде.";
      badge.setAttribute("aria-label", badge.title);
    });
  }

  function polishPublicationDates() {
    const items = currentItems();
    const byTitle = mapByTitle(items);
    const used = new Map();

    document.querySelectorAll("#newsGrid > .card").forEach((card) => {
      const key = normalize(card.querySelector("h3")?.textContent);
      const index = used.get(key) || 0;
      const item = byTitle.get(key)?.[index];
      used.set(key, index + 1);
      if (!item) return;
      const firstMeta = card.querySelector(".card-body > .meta");
      const dateNode = firstMeta?.querySelector("span:last-child");
      if (dateNode) {
        const value = formatPublished(item.published_at);
        if (dateNode.textContent !== value) dateNode.textContent = value;
        dateNode.title = item.published_at
          ? "Потврден датум на објава."
          : "Collector-времето не се користи како датум на објава.";
      }
    });

    const tickerTitle = document.getElementById("tickerTitle")?.textContent || "";
    const tickerItem = [...state.ticker, ...items].find((item) => normalize(item?.title) === normalize(tickerTitle));
    const tickerMeta = document.getElementById("tickerMeta");
    if (tickerItem && tickerMeta) {
      const category = String(tickerItem.primary_category || "communication").toUpperCase();
      const source = String(tickerItem.source || "Unknown source");
      const value = `${category} · ${source} · ${formatPublished(tickerItem.published_at)}`;
      if (tickerMeta.textContent !== value) tickerMeta.textContent = value;
    }
  }

  function updateNoiseSummary() {
    const feedSummary = document.getElementById("feedSummary");
    if (!feedSummary) return;
    let line = document.getElementById("wpaNoiseHardeningSummary");
    if (!line) {
      line = document.createElement("small");
      line.id = "wpaNoiseHardeningSummary";
      line.style.display = "block";
      line.style.marginTop = "5px";
      line.style.color = "var(--gold)";
      line.style.fontSize = ".74rem";
      feedSummary.insertAdjacentElement("afterend", line);
    }
    const live = state.dropped.live;
    line.textContent = `${VERSION} Noise Guard · ${live.lottery} lottery · ${live.sports} athletics/medals & sports-result noise отстранети`;
    line.title = "Sports diplomacy останува дозволена само со експлицитен институционален актер и конкретна дипломатска или policy акција.";
  }

  function polishUi() {
    polishDedupeBadges();
    polishSandeBadges();
    polishPublicationDates();
    updateNoiseSummary();
  }

  function schedulePolish() {
    if (state.scheduled) return;
    state.scheduled = true;
    window.setTimeout(() => {
      state.scheduled = false;
      polishUi();
    }, 0);
  }

  if (Array.isArray(window.WPA_LIVE_DEMO_DATA?.items)) {
    window.WPA_LIVE_DEMO_DATA.items = filterItems(window.WPA_LIVE_DEMO_DATA.items, "demo");
    window.WPA_LIVE_DEMO_DATA.total = window.WPA_LIVE_DEMO_DATA.items.length;
  }

  const start = () => {
    const observer = new MutationObserver(schedulePolish);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedulePolish();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  window.WPA_LIVE_NOISE_HARDENING = {
    version: VERSION,
    state,
    dropReason,
    isLotteryNoise,
    isSportsNoise,
    hasExplicitSportsDiplomacyException
  };
})();

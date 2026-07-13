/* WPA Journal Live X11.9.1 — direct, journal-only UI safeguards. */
(() => {
  "use strict";
  if (window.WPA_X1191_UI_FIXES) return;
  window.WPA_X1191_UI_FIXES = true;

  const TIME_ZONE = "Europe/Skopje";

  function normalize(value) {
    return String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function formatPublished(value) {
    const date = new Date(value || "");
    if (!Number.isFinite(date.getTime())) return "Без потврден датум на објава";
    try {
      return new Intl.DateTimeFormat("mk-MK", {
        timeZone: TIME_ZONE,
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
    const x119 = window.WPA_X119?.state?.live;
    if (Array.isArray(x119) && x119.length) return x119;
    const analyst = window.WPA_X118_DATA?.getItems?.();
    return Array.isArray(analyst) ? analyst : [];
  }

  function byTitle(items) {
    const map = new Map();
    for (const item of items) {
      const key = normalize(item?.title);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  }

  function addGateTooltips() {
    document.querySelectorAll(".tag.editorial-gate").forEach((badge) => {
      const pending = /pending|тек/i.test(badge.textContent || "");
      badge.title = pending
        ? "Rule-based WPA editorial gate е во тек. Ставката не е човечки прегледана."
        : "Rule-based WPA editorial gate е достапен. Ставката не е човечки прегледана и не претставува одобрување од Санде.";
      badge.setAttribute("aria-label", badge.title);
      badge.tabIndex = 0;
    });

    document.querySelectorAll(".tag.human-reviewed").forEach((badge) => {
      badge.title = "Backend експлицитно евидентира човечки преглед од Санде.";
      badge.setAttribute("aria-label", badge.title);
      badge.tabIndex = 0;
    });
  }

  function fixPublicationDates() {
    const items = currentItems();
    const map = byTitle(items);
    const used = new Map();

    document.querySelectorAll("#newsGrid > .card").forEach((card) => {
      const key = normalize(card.querySelector("h3")?.textContent);
      const index = used.get(key) || 0;
      const item = map.get(key)?.[index];
      used.set(key, index + 1);
      if (!item) return;

      const dateNode = card.querySelector(".card-body > .meta span:last-child");
      if (dateNode) {
        dateNode.textContent = formatPublished(item.published_at);
        dateNode.title = item.published_at
          ? "Потврден датум на објава од payload-от."
          : "Collector-времето намерно не се користи како датум на објава.";
      }
    });

    const title = normalize(document.getElementById("tickerTitle")?.textContent);
    const tickerItem = items.find((item) => normalize(item?.title) === title);
    const tickerMeta = document.getElementById("tickerMeta");
    if (tickerItem && tickerMeta) {
      const category = String(tickerItem.primary_category || "communication").toUpperCase();
      tickerMeta.textContent = `${category} · ${tickerItem.source || "Unknown source"} · ${formatPublished(tickerItem.published_at)}`;
      tickerMeta.title = tickerItem.published_at
        ? "Потврден датум на објава."
        : "Collector-времето намерно не се користи како датум на објава.";
    }
  }

  function fixDedupeSemantics() {
    document.querySelectorAll(".integrity-merged").forEach((badge) => {
      const count = Number(String(badge.textContent || "").match(/\d+/)?.[0] || 0);
      if (!count) return;
      badge.textContent = `${count} технички записи споени`;
      badge.title = "Технички записи се споени по URL, наслов или feed-текст. Ова не значи потврда од ист број независни извори.";
      badge.setAttribute("aria-label", badge.title);
    });
  }

  function apply() {
    addGateTooltips();
    fixPublicationDates();
    fixDedupeSemantics();
  }

  function schedule() {
    window.setTimeout(apply, 0);
    window.setTimeout(apply, 250);
    window.setTimeout(apply, 900);
  }

  document.addEventListener("wpa:x118:data", schedule);
  document.addEventListener("click", (event) => {
    if (event.target.closest("#refresh,.fusion-tab,.x118-btn")) schedule();
  });
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", schedule, { once: true })
    : schedule();
})();

import fs from "fs/promises";
import Parser from "rss-parser";

const USER_AGENT = "WorldProtocolAcademy-WPAWatch/1.3 (+https://worldprotocolacademy.mk/tools/wpa-watch/)";
const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": USER_AGENT,
    "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5"
  }
});
const feeds = JSON.parse(await fs.readFile("feeds.json", "utf8")).feeds;
const config = JSON.parse(await fs.readFile("rss-config.json", "utf8"));
const items = [];
const live = [];
const dead = [];
const attempts = {};

function clean(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function parseWithRetry(feed) {
  const maxAttempts = 3;
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts[feed.name] = attempt;
    try {
      return await parser.parseURL(feed.url);
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await sleep(700 * attempt);
    }
  }
  throw lastError || new Error("Unknown feed error");
}

for (const f of feeds) {
  try {
    const feed = await parseWithRetry(f);
    live.push(f.name);
    for (const it of (feed.items || []).slice(0, config.max_items_per_feed || 8)) {
      items.push({
        id: it.guid || it.id || it.link || it.title,
        title: clean(it.title || "Untitled"),
        link: it.link || "#",
        source: f.name,
        domain: f.domain || "general",
        summary: clean(it.contentSnippet || it.summary || it.content || "").slice(0, 500),
        isoDate: it.isoDate || it.pubDate || it.published || it.updated || null
      });
    }
  } catch (e) {
    dead.push({
      name: f.name,
      url: f.url,
      attempts: attempts[f.name] || 0,
      error: String(e?.message || e)
    });
  }
}

const seen = new Set();
const out = [];
for (const item of items) {
  const key = item.link || item.id || item.title;
  if (!seen.has(key)) {
    seen.add(key);
    out.push(item);
  }
}
out.sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0));
const finalItems = out.slice(0, config.max_total_items || 80);
const generated = new Date().toISOString();

await fs.writeFile("items.json", JSON.stringify(finalItems, null, 2));
await fs.writeFile("status.json", JSON.stringify({
  schema_version: "1.3",
  generated,
  policy: "RSS/Atom only. No scraping.",
  sources_total: feeds.length,
  sources_live: live.length,
  sources_dead: dead.length,
  items_total: finalItems.length,
  live,
  dead,
  attempts
}, null, 2));

console.log(`Generated ${finalItems.length} items from ${live.length}/${feeds.length} live sources.`);
if (dead.length) console.warn(`Unavailable sources: ${dead.map(x => x.name).join(", ")}`);

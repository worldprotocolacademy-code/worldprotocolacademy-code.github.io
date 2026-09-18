import fs from "fs/promises";
import Parser from "rss-parser";

const USER_AGENT = "WorldProtocolAcademy-WPAWatch/2.0 (+https://worldprotocolacademy.mk/tools/wpa-watch/)";
const parser = new Parser();
const feeds = JSON.parse(await fs.readFile("feeds.json", "utf8")).feeds;
const config = JSON.parse(await fs.readFile("rss-config.json", "utf8"));
const items = [];
const live = [];
const dead = [];
const attempts = {};
const maxAttempts = 3;
const concurrency = Math.max(1, Math.min(12, Number(config.concurrency || 8)));
const timeoutMs = Math.max(3000, Math.min(30000, Number(config.timeout_ms || 12000)));

function clean(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeHost(value = "") {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFeed(feed) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts[feed.name] = attempt;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(feed.url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.2",
          "Cache-Control": "no-cache"
        }
      });
      const finalUrl = response.url || feed.url;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const finalHost = normalizeHost(finalUrl);
      const expectedHost = normalizeHost(`https://${feed.expected_host || ""}`);
      if (!finalHost || !expectedHost || finalHost !== expectedHost) {
        throw new Error(`PROVENANCE_HOST_MISMATCH expected=${expectedHost || "missing"} actual=${finalHost || "missing"}`);
      }
      const xml = await response.text();
      if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) {
        throw new Error("NOT_RSS_ATOM_RESPONSE");
      }
      const parsed = await parser.parseString(xml);
      return { parsed, finalUrl };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await sleep(500 * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error("Unknown feed error");
}

async function mapLimit(list, limit, fn) {
  const out = new Array(list.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= list.length) return;
      out[i] = await fn(list[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, list.length) }, () => worker()));
  return out;
}

async function processFeed(f) {
  try {
    const { parsed, finalUrl } = await fetchFeed(f);
    const parsedItems = (parsed.items || []).slice(0, config.max_items_per_feed || 8);
    live.push({
      name: f.name,
      tier: f.tier || "B",
      source_class: f.source_class || "unspecified",
      final_url: finalUrl,
      items_seen: parsed.items?.length || 0,
      items_used: parsedItems.length
    });
    for (const it of parsedItems) {
      items.push({
        id: it.guid || it.id || it.link || it.title,
        title: clean(it.title || "Untitled"),
        link: it.link || "#",
        source: f.name,
        domain: f.domain || "general",
        source_tier: f.tier || "B",
        source_class: f.source_class || "unspecified",
        source_provenance: f.provenance || null,
        summary: clean(it.contentSnippet || it.summary || it.content || "").slice(0, 500),
        isoDate: it.isoDate || it.pubDate || it.published || it.updated || null
      });
    }
  } catch (e) {
    dead.push({
      name: f.name,
      url: f.url,
      tier: f.tier || "B",
      source_class: f.source_class || "unspecified",
      expected_host: f.expected_host || null,
      attempts: attempts[f.name] || 0,
      error: String(e?.message || e)
    });
  }
}

await mapLimit(feeds, concurrency, processFeed);

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
const finalItems = out.slice(0, config.max_total_items || 120);
const generated = new Date().toISOString();
const tierATotal = feeds.filter(x => x.tier === "A").length;
const tierALive = live.filter(x => x.tier === "A").length;
const tierBTotal = feeds.filter(x => x.tier === "B").length;
const tierBLive = live.filter(x => x.tier === "B").length;

await fs.writeFile("items.json", JSON.stringify(finalItems, null, 2));
await fs.writeFile("status.json", JSON.stringify({
  schema_version: "2.0",
  generated,
  policy: "RSS/Atom only. No scraping.",
  provenance_policy: "Host-locked active registry; historical candidates require revalidation before promotion.",
  sources_total: feeds.length,
  sources_live: live.length,
  sources_dead: dead.length,
  live_ratio: feeds.length ? Number((live.length / feeds.length).toFixed(4)) : 0,
  tier_a_total: tierATotal,
  tier_a_live: tierALive,
  tier_b_total: tierBTotal,
  tier_b_live: tierBLive,
  items_total: finalItems.length,
  live,
  dead,
  attempts
}, null, 2));

console.log(`Generated ${finalItems.length} items from ${live.length}/${feeds.length} live sources (Tier A ${tierALive}/${tierATotal}; Tier B ${tierBLive}/${tierBTotal}).`);
if (dead.length) console.warn(`Unavailable/quarantined active sources: ${dead.map(x => x.name).join(", ")}`);

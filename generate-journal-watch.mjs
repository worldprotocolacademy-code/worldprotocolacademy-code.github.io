import fs from "fs/promises";
import path from "path";

const OUT = path.join(process.cwd(), "journal", "watch");
const WATCH_ITEMS = path.join(process.cwd(), "tools", "wpa-watch", "items.json");
const MAP_PATH = path.join(process.cwd(), "tools", "wpa-watch", "journal-map.json");

function clean(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function inferArticleType(domain, map) {
  return map.domain_to_journal?.[domain]?.preferred_types?.[0] || "Editorial topic candidate";
}

function inferDiscipline(domain, map) {
  return map.domain_to_journal?.[domain]?.discipline || "communicology";
}

function makeTopic(item, idx, map) {
  const domain = item.domain || "akademski";
  const discipline = inferDiscipline(domain, map);
  const articleType = inferArticleType(domain, map);
  const title = clean(item.title || "Untitled public-source development");
  return {
    id: `JWT-AUTO-${new Date().toISOString().slice(0,10)}-${String(idx + 1).padStart(3, "0")}`,
    date: new Date().toISOString().slice(0, 10),
    title,
    discipline,
    status: "detected",
    source: item.source || item.feedTitle || "public RSS/Atom source",
    source_url: item.link || null,
    summary: clean(item.contentSnippet || item.content || "Detected public-source item. Manual summary required.").slice(0, 700),
    article_type: articleType,
    research_angle: `Possible WPA Journal angle in ${discipline}: connect the public-source development with protocol, diplomacy, public communication, security or communicology. Manual editorial framing required.`,
    verification: "Manual verification required. Not an accepted article. Not peer reviewed."
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  const map = JSON.parse(await fs.readFile(MAP_PATH, "utf8"));
  let items = [];
  try {
    items = JSON.parse(await fs.readFile(WATCH_ITEMS, "utf8"));
  } catch {
    items = [];
  }

  const topics = items.slice(0, 40).map((item, idx) => makeTopic(item, idx, map));

  if (!topics.length) {
    topics.push({
      id: "JWT-EMPTY",
      date: new Date().toISOString().slice(0,10),
      title: "No WPA Watch items available yet",
      discipline: "communicology",
      status: "detected",
      source: "WPA Journal Watch",
      source_url: null,
      summary: "Run WPA Watch first, then run Journal Watch.",
      article_type: "Editorial note",
      research_angle: "System setup check.",
      verification: "No public-source items found."
    });
  }

  await fs.writeFile(path.join(OUT, "topics.json"), JSON.stringify(topics, null, 2), "utf8");
  await fs.writeFile(path.join(OUT, "editorial-queue.json"), JSON.stringify({
    generated: new Date().toISOString(),
    status: "staging",
    policy: "Topic candidates only. No automatic journal publication.",
    queue: topics.map(t => ({
      topic_id: t.id,
      stage: t.status === "detected" ? "detected_event" : "candidate_topic",
      editorial_action: "manual_review_required",
      peer_review: "not_started"
    }))
  }, null, 2), "utf8");

  console.log(`Generated ${topics.length} WPA Journal Watch topic candidates.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

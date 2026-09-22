import fs from "fs/promises";
import path from "path";
import { createHash } from "node:crypto";

const OUT = path.join(process.cwd(), "journal", "watch");
const WATCH_ITEMS = path.join(process.cwd(), "tools", "wpa-watch", "items.json");
const WATCH_STATUS = path.join(process.cwd(), "tools", "wpa-watch", "status.json");
const MAP_PATH = path.join(process.cwd(), "tools", "wpa-watch", "journal-map.json");
const MAX_UPSTREAM_AGE_HOURS = 8;
const MIN_LIVE_SOURCES = 20;
const MIN_ITEMS = 10;
const ALLOWED_DISCIPLINES = new Set(["protocol", "diplomacy", "pr", "security", "communicology"]);

function clean(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDomain(domain, map) {
  const raw = clean(domain || "").toLowerCase();
  return map.domain_aliases?.[raw] || raw || "communicology";
}

function canonicalDiscipline(value) {
  const x = clean(value || "").toLowerCase();
  if (x === "protocol") return "protocol";
  if (x === "diplomacy") return "diplomacy";
  if (x === "security") return "security";
  if (x === "pr" || x === "public relations" || x === "public-relations") return "pr";
  if (x === "communicology" || x === "communication" || x === "communications") return "communicology";
  return "communicology";
}

function inferArticleType(domain, map) {
  const normalized = normalizeDomain(domain, map);
  return map.domain_to_journal?.[normalized]?.preferred_types?.[0] || "Editorial topic candidate";
}

function inferDiscipline(domain, map) {
  const normalized = normalizeDomain(domain, map);
  return canonicalDiscipline(map.domain_to_journal?.[normalized]?.discipline || normalized);
}

function textFor(item) {
  return clean([
    item.title,
    item.summary,
    item.contentSnippet,
    item.content,
    item.source,
    item.feedTitle
  ].filter(Boolean).join(" ")).toLowerCase();
}

function classifyByContent(item, mappedDiscipline) {
  const x = textFor(item);

  if (/protocol|ceremon|precedence|state visit|official visit|flag order|anthem|forms? of address|diplomatic protocol|seating plan/.test(x)) return "protocol";
  if (/weapon|armed conflict|security|risk|deterrence|drone|trafficking|attack on healthcare|research security|cyber|terror|violence|war zone|epidemic|outbreak|earthquake|\bquake\b|natural disaster|public health emergency|health emergency/.test(x)) return "security";
  if (/summit|diplomat|diplomacy|bilateral|multilateral|foreign minister|foreign ministry|recognition|sovereignty|ceasefire|sanctions|peace talks|un security council|nato|eeas|osce|gaza|west bank|sudan|ukraine/.test(x)) return "diplomacy";
  if (/public relations|public communication|media relations|media|newsroom|podcast|narrative|legitimacy|reputation|public information|campaign|messaging|heat alert|health alert|public warning|warning campaign|behaviou?r change/.test(x)) return "pr";
  if (/communicology|intercultural|nonverbal|persuasion|organizational communication|human communication|metadata|crossref|doaj|openalex|datacite|doi\b|citation|scholarly|open access|research infrastructure|journal records|affiliation|pid\b|publishing practices|research integrity|research software/.test(x)) return "communicology";

  return canonicalDiscipline(mappedDiscipline);
}

function reviewReason(item) {
  const title = clean(item.title || "").toLowerCase();
  const source = clean(item.source || item.feedTitle || "").toLowerCase();

  if (!title || title === "untitled") return "missing_or_untitled_title";
  if (/^(test page|test link|test\b)/.test(title)) return "test_or_placeholder_content";
  if (/^protected:/.test(title)) return "protected_or_restricted_source_page";
  if (/\bvacancy\b|\bjob opening\b|\bhiring\b/.test(title)) return "recruitment_content";
  if (/lottery|loto|piyango|sports result|match result|ufc|marathon results?|medal table/.test(title)) return "probable_noise";
  if (!source) return "missing_source_label";
  return null;
}

function sourceDate(item) {
  const raw = item.isoDate || item.pubDate || item.published_at || item.date || null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function researchAngle(discipline) {
  if (discipline === "protocol") return "Possible WPA Journal angle in protocol: ceremonial order, state representation, visual statecraft, precedence, official visits or institutional protocol performance. Manual framing required.";
  if (discipline === "diplomacy") return "Possible WPA Journal angle in diplomacy: diplomatic signalling, bilateral or multilateral context, crisis diplomacy, state representation or institutional relations. Manual framing required.";
  if (discipline === "security") return "Possible WPA Journal angle in security studies: public-source risk, crisis governance, event security, strategic stability, human security, research security or technological-security implications. Manual framing required.";
  if (discipline === "pr") return "Possible WPA Journal angle in public relations: institutional reputation, media relations, crisis communication, narrative, legitimacy, public information or stakeholder communication. Manual framing required.";
  return "Possible WPA Journal angle in communicology: communication processes, institutional meaning, intercultural context, nonverbal communication, persuasion, scholarly communication or human communication. Manual editorial framing required.";
}

function makeTopic(item, map) {
  const mappedDiscipline = inferDiscipline(item.domain || "communicology", map);
  const discipline = classifyByContent(item, mappedDiscipline);
  if (!ALLOWED_DISCIPLINES.has(discipline)) throw new Error(`Unsupported Journal Watch discipline: ${discipline}`);
  const articleType = inferArticleType(item.domain || discipline, map);
  const title = clean(item.title || "Untitled public-source development");
  const hold = reviewReason(item);
  const published = sourceDate(item);

  return {
    id: "JWT-" + createHash("sha256").update(String(item.link || item.id || `${item.source}|${title}`)).digest("hex").slice(0, 24),
    detected_at: new Date().toISOString(),
    date: published,
    date_basis: published ? "source_published" : "unknown",
    title,
    discipline,
    status: hold ? "classification_review" : "detected",
    source: item.source || item.feedTitle || "public RSS/Atom source",
    source_url: item.link || null,
    summary: clean(item.summary || item.contentSnippet || item.content || "Detected public-source item. Manual summary required.").slice(0, 700),
    article_type: articleType,
    research_angle: researchAngle(discipline),
    verification: hold
      ? `Manual classification review required (${hold}). Not an accepted article. Not peer reviewed.`
      : "Manual verification required. Not an accepted article. Not peer reviewed.",
    review_hold: hold || null,
    source_domain: item.domain || null,
    source_tier: item.source_tier || null,
    source_class: item.source_class || null,
    source_provenance: item.source_provenance || null,
    classification_version: "JW2.2"
  };
}

function validateUpstream(status, items) {
  const generated = new Date(status?.generated || "");
  if (Number.isNaN(generated.getTime())) throw new Error("WPA Watch status.generated is invalid");
  const ageHours = (Date.now() - generated.getTime()) / 3600000;
  if (ageHours < 0 || ageHours > MAX_UPSTREAM_AGE_HOURS) throw new Error(`WPA Watch upstream is stale (${ageHours.toFixed(1)}h)`);
  if (Number(status.sources_live) < MIN_LIVE_SOURCES) throw new Error(`WPA Watch has only ${status.sources_live} live sources`);
  if (!Array.isArray(items) || items.length < MIN_ITEMS) throw new Error(`WPA Watch has only ${Array.isArray(items) ? items.length : 0} items`);
  if (Number(status.items_total) !== items.length) throw new Error("WPA Watch status/items count mismatch");
  return { ageHours };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  const map = JSON.parse(await fs.readFile(MAP_PATH, "utf8"));
  const items = JSON.parse(await fs.readFile(WATCH_ITEMS, "utf8"));
  const watchStatus = JSON.parse(await fs.readFile(WATCH_STATUS, "utf8"));
  const upstream = validateUpstream(watchStatus, items);

  let previous = [];
  try { previous = JSON.parse(await fs.readFile(path.join(OUT, "topics.json"), "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const previousByUrl = new Map(previous.map(t => [t.source_url, t]));
  const seen = new Set();
  const topics = items.map(item => makeTopic(item, map)).filter(topic => {
    if (seen.has(topic.id)) return false;
    seen.add(topic.id);
    const old = previousByUrl.get(topic.source_url);
    topic.legacy_ids = old ? [...new Set([...(old.legacy_ids || []), old.id])].filter(id => id !== topic.id) : [];
    return true;
  });
  if (!topics.length) throw new Error("Journal Watch refuses to publish an empty placeholder queue");

  const generatedAt = new Date().toISOString();
  await fs.writeFile(path.join(OUT, "topics.json"), JSON.stringify(topics, null, 2), "utf8");
  await fs.writeFile(path.join(OUT, "editorial-queue.json"), JSON.stringify({
    schema_version: "2.2",
    generated: generatedAt,
    upstream_watch_generated: watchStatus.generated,
    upstream_watch_sources_live: watchStatus.sources_live,
    upstream_watch_tier_a_live: watchStatus.tier_a_live ?? null,
    upstream_watch_live_ratio: watchStatus.live_ratio ?? null,
    upstream_watch_items_total: watchStatus.items_total,
    thematic_scope: ["protocol", "diplomacy", "public_relations", "security", "communicology"],
    status: "staging",
    policy: "Topic candidates only. No automatic journal publication.",
    classification_version: "JW2.2",
    queue: topics.map(t => ({
      topic_id: t.id,
      stage: t.status === "classification_review" ? "classification_review" : (t.status === "detected" ? "detected_event" : "candidate_topic"),
      editorial_action: "manual_review_required",
      peer_review: "not_started",
      review_hold: t.review_hold || null
    }))
  }, null, 2), "utf8");

  const counts = topics.reduce((acc, topic) => {
    acc[topic.discipline] = (acc[topic.discipline] || 0) + 1;
    return acc;
  }, {});
  const holds = topics.filter(t => t.status === "classification_review").length;
  console.log(`Generated ${topics.length} WPA Journal Watch topic candidates from a ${upstream.ageHours.toFixed(1)}h-old healthy upstream. Disciplines: ${JSON.stringify(counts)}. Review holds: ${holds}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

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
const ALLOWED_TRACKS = new Set(["protocol", "diplomacy", "pr", "security", "communicology", "academic"]);
const CLASSIFICATION_VERSION = "JW2.3";

function clean(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanSummary(s = "") {
  return clean(s)
    .replace(/\s+The post\s+.+?\s+appeared first on\s+.+?\.?$/i, "")
    .replace(/\s+Continue reading\s+.+$/i, "")
    .trim();
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
  if (x === "academic" || x === "academic infrastructure") return "academic";
  if (x === "pr" || x === "public relations" || x === "public-relations" || x === "public communication") return "pr";
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

  // Academic infrastructure is a support track, not a sixth core WPA discipline.
  if (/metadata|crossref|doaj|openalex|datacite|\bdoi\b|citation|scholarly|open access|research infrastructure|journal records|affiliation|\bpid\b|publishing practices|research integrity|research software|peer review|bibliometric/.test(x)) return "academic";
  if (/\bdiplomatic protocol\b|\bprotocol\b|precedence|state visit|official visit|flag order|anthem|forms? of address|seating plan|credentials|ceremonial order|state ceremonial/.test(x)) return "protocol";
  if (/cybersecurity|\bsecurity\b|armed conflict|weapon|deterrence|drone|trafficking|terror|violence|war zone|\bwar\b|military|disaster|emergency|epidemic|outbreak|earthquake|\bquake\b|human security|strategic stability/.test(x)) return "security";
  if (/public relations|public communication|media relations|\bmedia\b|journalists?|\bnewsroom\b|\bpodcast\b|narrative|reputation|public information|\bcampaign\b|messaging|press freedom|public warning|crisis communication/.test(x)) return "pr";
  if (/communicology|intercultural|nonverbal|persuasion|organizational communication|human communication|communication processes|linguistic|language gap/.test(x)) return "communicology";
  if (/\bsummit\b|\bdiplomat|diplomacy|bilateral|multilateral|foreign minister|foreign ministry|\bambassador\b|recognition|sovereignty|ceasefire|sanctions|peace talks|un security council|\bnato\b|\beeas\b|\bosce\b|un general assembly|regional integration|international relations/.test(x)) return "diplomacy";

  return canonicalDiscipline(mappedDiscipline);
}

function reviewReason(item) {
  const title = clean(item.title || "").toLowerCase();
  const source = clean(item.source || item.feedTitle || "").toLowerCase();
  const x = textFor(item);
  const link = String(item.link || "");

  if (!title || title === "untitled") return "missing_or_untitled_title";
  if (/^(test page|test link|test\b)/.test(title)) return "test_or_placeholder_content";
  if (/^protected:/.test(title)) return "protected_or_restricted_source_page";
  if (/\b(vacancy|job opening|hiring|recruitment)\b/.test(title)) return "recruitment_content";
  if (/lottery|loto|piyango|sports result|match result|ufc|marathon results?|medal table/.test(title)) return "probable_noise";
  if (/\/(?:find-experts|people|person|staff|profiles?)\//i.test(link) || /\bperson title\/position\b/.test(x)) return "person_profile_or_bio";
  if (/\/organization\//i.test(link)) return "directory_or_organization_page";
  if (/^(january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(title)) return "archive_or_navigation_page";
  if (/\b(days? off|office closure|will be closed|closed on the following days)\b/.test(x)) return "service_or_closure_notice";
  if (/\b(consulting services|request for expressions? of interest|procurement|invitation to bid|tender notice|framework agreement\s+[–-]?\s*firms selection)\b/.test(x)) return "procurement_or_operational_notice";
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
  if (discipline === "academic") return "Possible WPA Journal support angle in academic infrastructure: metadata quality, source traceability, DOI/PID systems, open scholarly infrastructure, publication ethics or research integrity. Manual academic verification required.";
  return "Possible WPA Journal angle in communicology: communication processes, institutional meaning, intercultural context, nonverbal communication, persuasion, scholarly communication or human communication. Manual editorial framing required.";
}

function makeTopic(item, map) {
  const mappedDiscipline = inferDiscipline(item.domain || "communicology", map);
  const discipline = classifyByContent(item, mappedDiscipline);
  if (!ALLOWED_TRACKS.has(discipline)) throw new Error(`Unsupported Journal Watch discipline/support track: ${discipline}`);
  const articleType = inferArticleType(discipline, map);
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
    summary: cleanSummary(item.summary || item.contentSnippet || item.content || "Detected public-source item. Manual summary required.").slice(0, 700),
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
    classification_version: CLASSIFICATION_VERSION
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
    schema_version: "2.3",
    generated: generatedAt,
    upstream_watch_generated: watchStatus.generated,
    upstream_watch_sources_live: watchStatus.sources_live,
    upstream_watch_tier_a_live: watchStatus.tier_a_live ?? null,
    upstream_watch_live_ratio: watchStatus.live_ratio ?? null,
    upstream_watch_items_total: watchStatus.items_total,
    thematic_scope: ["protocol", "diplomacy", "public_relations", "security", "communicology"],
    support_tracks: ["academic_infrastructure"],
    status: "production_editorial_candidates",
    policy: "Topic candidates only. No automatic journal publication.",
    classification_version: CLASSIFICATION_VERSION,
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

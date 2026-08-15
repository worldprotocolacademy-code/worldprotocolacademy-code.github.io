import fs from "fs/promises";
import path from "path";

const OUT = path.join(process.cwd(), "journal", "watch");
const WATCH_ITEMS = path.join(process.cwd(), "tools", "wpa-watch", "items.json");
const MAP_PATH = path.join(process.cwd(), "tools", "wpa-watch", "journal-map.json");

function clean(s = "") {
  return String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDomain(domain, map) {
  const raw = clean(domain || "").toLowerCase();
  return map.domain_aliases?.[raw] || raw || "komunikologija";
}

function inferArticleType(domain, map) {
  const normalized = normalizeDomain(domain, map);
  return map.domain_to_journal?.[normalized]?.preferred_types?.[0] || "Editorial topic candidate";
}

function inferDiscipline(domain, map) {
  const normalized = normalizeDomain(domain, map);
  return map.domain_to_journal?.[normalized]?.discipline || "communicology";
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

  if (/metadata|crossref|doaj|openalex|datacite|doi\b|citation|scholarly|open access|research infrastructure|journal records|affiliation|pid\b|publishing practices|research integrity|research software/.test(x)) {
    return "academic";
  }
  if (/protocol|ceremon|precedence|state visit|official visit|flag order|anthem|forms? of address|diplomatic protocol|seating plan/.test(x)) {
    return "protocol";
  }
  if (/weapon|armed conflict|security|risk|deterrence|drone|trafficking|attack on healthcare|research security|cyber|terror|violence|war zone|epidemic|outbreak|earthquake|\bquake\b|natural disaster|public health emergency|health emergency/.test(x)) {
    return "security";
  }
  if (/summit|diplomat|diplomacy|bilateral|multilateral|foreign minister|foreign ministry|recognition|sovereignty|ceasefire|sanctions|peace talks|un security council|nato|eeas|osce|gaza|west bank|sudan|ukraine/.test(x)) {
    return "diplomacy";
  }
  if (/public communication|media|communication|communications|newsroom|podcast|narrative|legitimacy|reputation|public information|campaign|messaging|heat alert|health alert|public warning|warning campaign|behaviou?r change/.test(x)) {
    return "pr";
  }
  if (/communicology|intercultural|nonverbal|persuasion|organizational communication|human communication/.test(x)) {
    return "communicology";
  }

  return mappedDiscipline || "communicology";
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
  if (discipline === "academic") return "Possible WPA Journal angle in academic infrastructure: metadata quality, source traceability, DOI/PID systems, open scholarly infrastructure, publication ethics or research integrity. Manual framing required.";
  if (discipline === "pr") return "Possible WPA Journal angle in public communication: narrative, legitimacy, institutional reputation, crisis messaging, media framing or public information. Manual framing required.";
  return "Possible WPA Journal angle in communicology: communication processes, institutional meaning, intercultural context or human communication. Manual editorial framing required.";
}

function makeTopic(item, idx, map) {
  const mappedDiscipline = inferDiscipline(item.domain || "communicology", map);
  const discipline = classifyByContent(item, mappedDiscipline);
  const articleType = inferArticleType(item.domain || discipline, map);
  const title = clean(item.title || "Untitled public-source development");
  const hold = reviewReason(item);
  const published = sourceDate(item);
  const generated = new Date().toISOString().slice(0, 10);

  return {
    id: `JWT-AUTO-${generated}-${String(idx + 1).padStart(3, "0")}`,
    date: published || generated,
    date_basis: published ? "source_published" : "detected_at_generation",
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
    classification_version: "JW2.0"
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
      date_basis: "detected_at_generation",
      title: "No WPA Watch items available yet",
      discipline: "communicology",
      status: "detected",
      source: "WPA Journal Watch",
      source_url: null,
      summary: "Run WPA Watch first, then run Journal Watch.",
      article_type: "Editorial note",
      research_angle: "System setup check.",
      verification: "No public-source items found.",
      review_hold: null,
      source_domain: null,
      classification_version: "JW2.0"
    });
  }

  await fs.writeFile(path.join(OUT, "topics.json"), JSON.stringify(topics, null, 2), "utf8");
  await fs.writeFile(path.join(OUT, "editorial-queue.json"), JSON.stringify({
    generated: new Date().toISOString(),
    status: "staging",
    policy: "Topic candidates only. No automatic journal publication.",
    classification_version: "JW2.0",
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
  console.log(`Generated ${topics.length} WPA Journal Watch topic candidates. Disciplines: ${JSON.stringify(counts)}. Review holds: ${holds}.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

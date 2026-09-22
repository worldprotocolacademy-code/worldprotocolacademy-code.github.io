export const CLASSIFICATION_VERSION = "WW3.0";
export const TITLE_MAX_CHARS = 240;
export const SUMMARY_MAX_CHARS = 500;

export function cleanText(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeField(value, maxChars) {
  const raw = cleanText(value);
  const original_length = raw.length;
  const truncated = original_length > maxChars;
  const text = truncated ? raw.slice(0, Math.max(1, maxChars - 1)).trimEnd() + "…" : raw;
  return { text, original_length, truncated };
}

export function normalizeTitle(value = "") {
  return normalizeField(value || "Untitled", TITLE_MAX_CHARS);
}

export function normalizeSummary(value = "") {
  return normalizeField(value, SUMMARY_MAX_CHARS);
}

export function classifyItemDomain({ title = "", summary = "" } = {}) {
  const x = cleanText([title, summary].filter(Boolean).join(" ")).toLowerCase();

  if (/metadata|crossref|doaj|openalex|datacite|\bdoi\b|citation|scholarly|open access|research infrastructure|journal records|affiliation|\bpid\b|publishing practices|research integrity|research software|peer review|bibliometric/.test(x)) {
    return { domain: "academic", basis: "content_rule" };
  }

  if (/\bdiplomatic protocol\b|\bprotocol\b|precedence|state visit|official visit|flag order|anthem|forms? of address|seating plan|credentials|ceremonial order|state ceremonial|gala dinner/.test(x)) {
    return { domain: "protocol", basis: "content_rule" };
  }

  if (/cybersecurity|\bsecurity\b|armed conflict|weapon|deterrence|drone|trafficking|terror|violence|war zone|\bwar\b|military|disaster|emergency|epidemic|outbreak|earthquake|\bquake\b|human security|strategic stability|peacebuilding|criminality|\bcrime\b|torture/.test(x)) {
    return { domain: "security", basis: "content_rule" };
  }

  if (/\bsummit\b|\bdiplomat|diplomacy|bilateral|multilateral|foreign minister|foreign ministry|\bambassador\b|recognition|sovereignty|ceasefire|sanctions|peace talks|un security council|\bnato\b|\beeas\b|\bosce\b|un general assembly|regional integration|international relations|trade commissioner|consulate|minister of foreign affairs|memorandum of understanding|\bconsultation\b|joint statement|ministerial meeting/.test(x)) {
    return { domain: "diplomacy", basis: "content_rule" };
  }

  if (/public relations|public communication|media relations|\bmedia\b|journalists?|\bnewsroom\b|\bpodcast\b|narrative|reputation|public information|\bcampaign\b|messaging|press freedom|public warning|crisis communication/.test(x)) {
    return { domain: "pr", basis: "content_rule" };
  }

  if (/communicology|intercultural|nonverbal|persuasion|organizational communication|human communication|communication processes|linguistic|language gap|digital literacy/.test(x)) {
    return { domain: "communicology", basis: "content_rule" };
  }

  return { domain: "general", basis: "unclassified" };
}

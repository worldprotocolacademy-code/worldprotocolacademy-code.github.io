#!/usr/bin/env node
/**
 * WPA Live Intelligence Feed — Analysis & Synthesis
 * --------------------------------------------------
 * Runs SERVER-SIDE (GitHub Actions / Node), after fetch-rss.mjs.
 *
 * Reads:  data/wpa-live-feed.json
 * Writes: data/wpa-live-feed.json  (adds an `analysis` block to each item + a synthesis summary)
 *
 * MODES:
 *  - Rule-based (default): works WITHOUT any API key. Produces a structured,
 *    cautious institutional summary per item using keyword tagging and group context.
 *  - AI-assisted (optional): ONLY if process.env.OPENAI_API_KEY is present.
 *    The key is read from the environment variable only and is NEVER written
 *    into any output file, frontend code, or committed artifact.
 *
 * SAFETY:
 *  - No legal, security-operational, accreditation or ranking claims are produced.
 *  - Analysis is descriptive institutional context, not evaluation.
 *  - Public sources only.
 *
 * No external dependencies in rule-based mode.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FEED_PATH = join(ROOT, 'data', 'wpa-live-feed.json');

// ── Canonical REV2 group labels (corrected) ──────────────────────────────────
const GROUP_LABELS = {
  A: 'Leading protocol, diplomacy and foreign-service academies',
  B: 'Think tanks and international-relations institutes',
  C: 'Training centres and institutional programmes linked to international organisations',
  D: 'Universities, faculties, schools and academic departments',
  G: 'UN agencies, UN-related bodies and convention secretariats',
  H: 'International NGOs, courts, tribunals and related global institutions',
  I: 'International financial institutions',
  R: 'WPA internal reference record',
  F: 'Feedspot-imported user sources (not part of Master List REV2)'
};

// ── Rule-based topic tagging (descriptive, non-evaluative) ───────────────────
const TOPIC_KEYWORDS = {
  'Protocol & Ceremony': ['protocol', 'ceremony', 'ceremonial', 'state visit', 'credentials', 'precedence', 'flag', 'honour guard', 'reception'],
  'Diplomacy': ['diplomat', 'diplomacy', 'bilateral', 'multilateral', 'ambassador', 'embassy', 'foreign affairs', 'treaty', 'summit', 'delegation'],
  'Security': ['security', 'defence', 'defense', 'crisis', 'peacekeeping', 'conflict', 'military', 'NATO', 'safety'],
  'Public Communication': ['statement', 'press', 'communiqué', 'communique', 'spokesperson', 'media', 'announcement', 'declaration'],
  'Conferences & Events': ['conference', 'forum', 'summit', 'symposium', 'workshop', 'seminar', 'event', 'meeting', 'session'],
  'Research & Publications': ['report', 'study', 'research', 'paper', 'publication', 'analysis', 'brief', 'working paper'],
  'Governance & Policy': ['policy', 'governance', 'resolution', 'agreement', 'framework', 'reform', 'regulation', 'mandate'],
  'Human Rights & Law': ['human rights', 'court', 'tribunal', 'justice', 'law', 'legal', 'rights', 'convention']
};

function detectTopics(text) {
  const lower = (text || '').toLowerCase();
  const topics = [];
  for (const [topic, kws] of Object.entries(TOPIC_KEYWORDS)) {
    if (kws.some(k => lower.includes(k.toLowerCase()))) topics.push(topic);
  }
  return topics.length ? topics : ['General Institutional'];
}

function ruleBasedAnalysis(item) {
  const groupLabel = GROUP_LABELS[item.source_group] || 'Institution';
  const combined = `${item.title} ${item.summary_raw}`;
  const topics = detectTopics(combined);

  // Cautious, descriptive synthesis — no evaluation, no ranking, no legal claim
  const synthesis =
    `${item.source_name} (${groupLabel}, ${item.source_country}) published a public item ` +
    `categorised under: ${topics.join(', ')}. ` +
    `This is a public-source signal for institutional monitoring only. ` +
    `Source feed status: ${item.source_feed_status}; verification: ${item.source_verification_status}.`;

  return {
    mode: 'rule_based',
    topics,
    institutional_context: groupLabel,
    synthesis,
    caution: 'Descriptive institutional context only. Not an evaluation, accreditation, ranking, legal or security-operational claim. Public source, verification pending.'
  };
}

async function aiAnalysis(item, apiKey) {
  // AI-assisted mode. Key is used only from the environment; never logged or written out.
  const groupLabel = GROUP_LABELS[item.source_group] || 'Institution';
  const prompt =
    `You are an institutional analyst for the World Protocol Academy. ` +
    `Summarise the following PUBLIC institutional item in 2-3 sentences. ` +
    `Be descriptive and cautious. Do NOT make legal, security-operational, accreditation, or ranking claims. ` +
    `Institution: ${item.source_name} (${groupLabel}, ${item.source_country}).\n` +
    `Title: ${item.title}\nSummary: ${item.summary_raw}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 220,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || '';
    const topics = detectTopics(`${item.title} ${item.summary_raw}`);
    return {
      mode: 'ai_assisted',
      topics,
      institutional_context: groupLabel,
      synthesis: text,
      caution: 'AI-assisted descriptive summary. Not an evaluation, accreditation, ranking, legal or security-operational claim. Public source, verification pending. Human review recommended.'
    };
  } catch (err) {
    // Fall back to rule-based on any AI failure
    const fallback = ruleBasedAnalysis(item);
    fallback.mode = 'rule_based_fallback';
    fallback.ai_error = err.message;
    return fallback;
  }
}

async function main() {
  const raw = await readFile(FEED_PATH, 'utf-8');
  const feed = JSON.parse(raw);
  const items = feed.items || [];

  // API key read from environment ONLY. Never written to output.
  const apiKey = process.env.OPENAI_API_KEY || '';
  const useAI = apiKey.length > 0;
  console.log(`[WPA] Analysis mode: ${useAI ? 'AI-assisted (OPENAI_API_KEY found in env)' : 'rule-based (no API key)'}`);

  let aiCount = 0, ruleCount = 0;
  for (const item of items) {
    if (useAI) {
      item.analysis = await aiAnalysis(item, apiKey);
      if (item.analysis.mode === 'ai_assisted') aiCount++; else ruleCount++;
    } else {
      item.analysis = ruleBasedAnalysis(item);
      ruleCount++;
    }
  }

  // Group-level synthesis (counts per group + topic spread) — descriptive only
  const byGroup = {};
  const topicTally = {};
  for (const item of items) {
    const g = item.source_group;
    byGroup[g] = (byGroup[g] || 0) + 1;
    for (const t of (item.analysis?.topics || [])) {
      topicTally[t] = (topicTally[t] || 0) + 1;
    }
  }

  feed.synthesis = {
    generated_at: new Date().toISOString(),
    total_items_analysed: items.length,
    analysis_mode: useAI ? 'ai_assisted' : 'rule_based',
    items_by_group: Object.fromEntries(
      Object.entries(byGroup).map(([g, n]) => [`${g} — ${GROUP_LABELS[g] || ''}`, n])
    ),
    topic_distribution: topicTally,
    caution: 'This synthesis is a descriptive overview of public institutional output. It is not an evaluation, ranking, accreditation, official recognition, legal or security-operational assessment. Public sources only. Source verification pending.'
  };

  // Important: ensure no API key leaked into output
  const serialised = JSON.stringify(feed, null, 2);
  if (apiKey && serialised.includes(apiKey)) {
    throw new Error('SAFETY ABORT: API key detected in output. Refusing to write.');
  }

  await writeFile(FEED_PATH, serialised, 'utf-8');
  console.log(`[WPA] Analysis complete. AI items: ${aiCount}, rule-based items: ${ruleCount}. Written to data/wpa-live-feed.json.`);
}

main().catch(err => {
  console.error('[WPA] Fatal error:', err);
  process.exit(1);
});

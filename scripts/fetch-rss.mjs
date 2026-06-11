#!/usr/bin/env node
/**
 * WPA Live Intelligence Feed — RSS/Atom Fetcher
 * ----------------------------------------------
 * Runs SERVER-SIDE (GitHub Actions / Node), never in the browser.
 *
 * Reads:  data/wpa-public-sources.json
 * Writes: data/wpa-live-feed.json
 *
 * SAFETY / SCOPE:
 *  - Fetches ONLY records with a non-empty rss_url.
 *  - Public RSS/Atom feeds only.
 *  - Does NOT scrape LinkedIn, Facebook, TikTok, Instagram or any private platform.
 *  - Does NOT use CORS proxies.
 *  - Does NOT expose or require API keys.
 *  - Deduplicates items by link.
 *  - Marks each item with its source feed_status (e.g. reported_unverified).
 *
 * No external dependencies — uses Node 18+ global fetch and a minimal XML parser.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCES_PATH = join(ROOT, 'data', 'wpa-public-sources.json');
const FEEDSPOT_PATH = join(ROOT, 'data', 'wpa-feedspot-sources.json'); // optional, from import-opml.mjs
const OUTPUT_PATH = join(ROOT, 'data', 'wpa-live-feed.json');

// Optional Feedspot RSS Combiner URL (one combined feed). Set via env to keep it out of code.
// Example: FEEDSPOT_COMBINER_URL="https://rss.feedspot.com/folder/XXXX/rss"
const COMBINER_URL = process.env.FEEDSPOT_COMBINER_URL || '';

// Platforms we will never fetch from (private / no public RSS)
const BLOCKED_HOSTS = [
  'linkedin.com', 'facebook.com', 'fb.com', 'tiktok.com',
  'instagram.com', 'twitter.com', 'x.com', 'threads.net'
];

const MAX_ITEMS_PER_SOURCE = 10;
const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT = 'WPA-PublicSourceBot/1.0 (+https://worldprotocolacademy-code.github.io; public RSS aggregation)';

function isBlocked(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED_HOSTS.some(b => host === b || host.endsWith('.' + b));
  } catch {
    return true; // malformed URL → block
  }
}

/** Minimal RSS/Atom parser — extracts items without external libraries. */
function parseFeed(xml, source) {
  const items = [];
  // Normalise whitespace minimally
  const isAtom = /<feed[\s>]/i.test(xml) && /<entry[\s>]/i.test(xml);

  const blockRegex = isAtom ? /<entry[\s\S]*?<\/entry>/gi : /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(blockRegex) || [];

  for (const block of blocks.slice(0, MAX_ITEMS_PER_SOURCE)) {
    const title = extractTag(block, 'title');
    let link = '';
    if (isAtom) {
      // Atom: <link href="..."/>
      const m = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = m ? m[1] : '';
    } else {
      link = extractTag(block, 'link');
    }
    const pubDate = isAtom
      ? (extractTag(block, 'updated') || extractTag(block, 'published'))
      : (extractTag(block, 'pubDate') || extractTag(block, 'dc:date'));
    const description = stripHtml(
      isAtom ? (extractTag(block, 'summary') || extractTag(block, 'content'))
             : (extractTag(block, 'description'))
    );

    if (title || link) {
      items.push({
        source_id: source.id,
        source_name: source.institution_name,
        source_group: source.group,
        source_country: source.country,
        source_feed_status: source.feed_status,
        source_verification_status: source.verification_status,
        title: cleanText(title),
        link: link.trim(),
        published: pubDate ? pubDate.trim() : '',
        summary_raw: description.slice(0, 600)
      });
    }
  }
  return items;
}

function extractTag(block, tag) {
  // Handle CDATA and plain
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  if (!m) return '';
  let v = m[1];
  v = v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return v.trim();
}

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanText(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' },
      redirect: 'follow'
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ctype = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    // Guard: only treat as feed if it looks like XML/RSS/Atom
    const looksLikeFeed = /<rss[\s>]/i.test(text) || /<feed[\s>]/i.test(text) || /<rdf:RDF[\s>]/i.test(text);
    if (!looksLikeFeed) {
      throw new Error('Response is not RSS/Atom XML (likely an HTML page, not a feed)');
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function loadRecords(path, label) {
  try {
    const raw = await readFile(path, 'utf-8');
    const parsed = JSON.parse(raw);
    const recs = parsed.records || [];
    console.log(`[WPA] Loaded ${recs.length} records from ${label}.`);
    return recs;
  } catch {
    console.log(`[WPA] ${label} not present — skipping.`);
    return [];
  }
}

async function main() {
  // Canonical Master List REV2 sources (always present)
  const canonical = await loadRecords(SOURCES_PATH, 'wpa-public-sources.json (REV2)');
  // Optional Feedspot-imported user sources (group F namespace)
  const feedspot = await loadRecords(FEEDSPOT_PATH, 'wpa-feedspot-sources.json (Feedspot OPML)');

  const records = [...canonical, ...feedspot];

  // Only records with a non-empty rss_url that are not blocked platforms
  const feedSources = records.filter(r => r.rss_url && r.rss_url.trim() && !isBlocked(r.rss_url));

  console.log(`[WPA] ${feedSources.length} records have an rss_url to attempt (of ${records.length} total).`);

  const allItems = [];
  let ok = 0, fail = 0;

  for (const source of feedSources) {
    try {
      const xml = await fetchWithTimeout(source.rss_url);
      const items = parseFeed(xml, source);
      allItems.push(...items);
      ok++;
      console.log(`  ✓ ${source.id} ${source.institution_name} — ${items.length} items`);
    } catch (err) {
      fail++;
      console.log(`  ✗ ${source.id} ${source.institution_name} — ${err.message}`);
    }
  }

  // ── Optional: Feedspot RSS Combiner (one combined feed URL) ──────────────────
  if (COMBINER_URL && !isBlocked(COMBINER_URL)) {
    try {
      const xml = await fetchWithTimeout(COMBINER_URL);
      const combinerSource = {
        id: 'FC001',
        institution_name: 'Feedspot RSS Combiner',
        group: 'F',
        country: 'user-source',
        feed_status: 'reported_unverified',
        verification_status: 'verification_pending'
      };
      const items = parseFeed(xml, combinerSource);
      allItems.push(...items);
      ok++;
      console.log(`  ✓ Feedspot Combiner — ${items.length} items`);
    } catch (err) {
      fail++;
      console.log(`  ✗ Feedspot Combiner — ${err.message}`);
    }
  }

  // Deduplicate by link (fallback to title when link is empty)
  const seen = new Set();
  const deduped = [];
  for (const item of allItems) {
    const key = (item.link || item.title || '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  // Sort newest first where a parseable date exists
  deduped.sort((a, b) => {
    const da = Date.parse(a.published) || 0;
    const db = Date.parse(b.published) || 0;
    return db - da;
  });

  const output = {
    meta: {
      title: 'WPA Live Intelligence Feed',
      description: 'Aggregated public-source RSS/Atom items from Master List REV2 institutions. Generated server-side by GitHub Actions. Not a live browser fetch.',
      generated_at: new Date().toISOString(),
      last_run_status: 'success',
      total_items: deduped.length,
      sources_attempted: feedSources.length,
      sources_succeeded: ok,
      sources_failed: fail,
      disclaimers: [
        'Public sources only',
        'No surveillance, no private tracking, no classified data',
        'Source verification pending',
        'Feed items reflect institutional public output, not WPA endorsement',
        'Not an accreditation list, not a final ranking'
      ],
      note: 'Items are fetched from public RSS/Atom feeds only. Feeds marked reported_unverified have not been independently verified by WPA.'
    },
    items: deduped
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[WPA] Wrote ${deduped.length} deduplicated items to data/wpa-live-feed.json (ok=${ok}, fail=${fail}).`);
}

main().catch(err => {
  console.error('[WPA] Fatal error:', err);
  process.exit(1);
});

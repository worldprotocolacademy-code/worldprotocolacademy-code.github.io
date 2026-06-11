#!/usr/bin/env node
/**
 * WPA Feedspot / OPML Importer
 * -----------------------------
 * Bridges Feedspot (or any RSS reader) into the WPA live feed system.
 *
 * Reads:  data/feedspot-sources.opml   (exported from Feedspot → Settings → Export OPML)
 * Writes: data/wpa-feedspot-sources.json
 *
 * The generated JSON uses the SAME record shape as wpa-public-sources.json so that
 * fetch-rss.mjs can read both files. Feedspot-imported feeds are placed in group "F"
 * (Feedspot-imported user sources) so they never disturb the canonical REV2 groups
 * (A–D, G–I, R). They are marked reported_unverified until tested by the fetcher.
 *
 * SAFETY:
 *  - Public RSS/Atom feeds only.
 *  - Blocks LinkedIn / Facebook / TikTok / Instagram / X / Threads host URLs.
 *  - Does NOT touch the canonical REV2 dataset (A–D, G–I, R counts stay intact).
 *  - No API keys, no CORS proxy.
 *
 * Note on REV2: group "F" here is a SEPARATE user-import namespace. It is NOT part of
 * Master List REV2 and does NOT change the canonical statement
 * "E and F are not used in REV2" — that statement is about the REV2 taxonomy, while
 * this F-namespace is an external user-feed bucket clearly labelled as such.
 *
 * No external dependencies — minimal XML attribute extraction.
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OPML_PATH = join(ROOT, 'data', 'feedspot-sources.opml');
const OUTPUT_PATH = join(ROOT, 'data', 'wpa-feedspot-sources.json');

const BLOCKED_HOSTS = [
  'linkedin.com', 'facebook.com', 'fb.com', 'tiktok.com',
  'instagram.com', 'twitter.com', 'x.com', 'threads.net'
];

function isBlocked(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED_HOSTS.some(b => host === b || host.endsWith('.' + b));
  } catch {
    return true;
  }
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function decodeEntities(s) {
  return (s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function main() {
  if (!(await fileExists(OPML_PATH))) {
    console.log('[WPA] No data/feedspot-sources.opml found. Skipping OPML import.');
    console.log('[WPA] To use: export OPML from Feedspot (Settings → Export OPML),');
    console.log('[WPA] save it as data/feedspot-sources.opml, then re-run this script.');
    // Write an empty but valid output so downstream steps do not fail.
    await writeFile(OUTPUT_PATH, JSON.stringify({
      meta: {
        title: 'WPA Feedspot-Imported Sources',
        source: 'feedspot-opml',
        note: 'No OPML file present yet. Export from Feedspot and save as data/feedspot-sources.opml.',
        group_namespace: 'F (Feedspot-imported user sources — not part of Master List REV2)',
        total_records: 0,
        generated: new Date().toISOString().slice(0, 10)
      },
      records: []
    }, null, 2), 'utf-8');
    return;
  }

  const opml = await readFile(OPML_PATH, 'utf-8');

  // Every <outline ... xmlUrl="..."> is a feed. Folder outlines (no xmlUrl) become category labels.
  const outlineRegex = /<outline\b[^>]*>/gi;
  const matches = opml.match(outlineRegex) || [];

  const records = [];
  let counter = 0;
  let currentCategory = 'Feedspot';

  for (const tag of matches) {
    const xmlUrl = attr(tag, 'xmlUrl');
    const text = attr(tag, 'text') || attr(tag, 'title');
    if (!xmlUrl) {
      // Folder / category outline — remember as the active category label
      if (text) currentCategory = text;
      continue;
    }
    if (isBlocked(xmlUrl)) {
      console.log(`  ✗ blocked (private platform): ${xmlUrl}`);
      continue;
    }
    counter++;
    const id = 'F' + String(counter).padStart(3, '0');
    records.push({
      id,
      group: 'F',
      group_label: 'Feedspot-imported user sources (not part of Master List REV2)',
      category: currentCategory,
      institution_name: text || xmlUrl,
      country: 'user-source',
      website_url: attr(tag, 'htmlUrl'),
      rss_url: xmlUrl,
      feed_type: /atom/i.test(attr(tag, 'type')) ? 'atom' : 'rss',
      feed_status: 'reported_unverified',
      source_status: 'public_user_import',
      verification_status: 'verification_pending',
      notes: `Imported from Feedspot OPML (category: ${currentCategory}); not verified by WPA`
    });
  }

  const output = {
    meta: {
      title: 'WPA Feedspot-Imported Sources',
      source: 'feedspot-opml',
      group_namespace: 'F (Feedspot-imported user sources — not part of Master List REV2)',
      rev2_note: 'These F-namespace feeds are user imports and do NOT change the canonical REV2 statement "E and F are not used in REV2", which refers to the REV2 institutional taxonomy.',
      total_records: records.length,
      disclaimers: [
        'Public sources only',
        'Feeds reported_unverified until tested by fetch-rss.mjs',
        'No surveillance, no private platforms, no private data'
      ],
      generated: new Date().toISOString().slice(0, 10)
    },
    records
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[WPA] Imported ${records.length} feeds from Feedspot OPML → data/wpa-feedspot-sources.json`);
}

main().catch(err => {
  console.error('[WPA] OPML import error:', err);
  process.exit(1);
});

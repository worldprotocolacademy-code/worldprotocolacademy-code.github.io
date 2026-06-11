# WPA Live Intelligence Feed — Notes
## LIVE-FEED-NOTES.md · WPA Institute · 11 June 2026

---

## 1. What this is

A server-side RSS/Atom aggregation system that turns the public output of Master List REV2 institutions into a live, analysed feed — without browser-side fetching and without CORS proxies.

**The correct architecture for GitHub Pages:**

```
GitHub Actions (scheduled)
  ├─ scripts/fetch-rss.mjs      → fetches public RSS/Atom server-side
  │                               writes data/wpa-live-feed.json
  ├─ scripts/analyze-feed.mjs   → adds synthesis + analysis per item
  │                               (rule-based, or AI if OPENAI_API_KEY in env)
  └─ commits data/wpa-live-feed.json back to the repo

GitHub Pages (static)
  └─ wpa-live-intelligence-feed.html
       reads ONLY data/wpa-live-feed.json + data/wpa-public-sources.json
       no external fetching, no CORS proxy
```

---

## 2. Why browser-side RSS does not work

Browsers block cross-origin requests to RSS feeds (CORS). The only clean public solutions are:
1. **Server-side fetch** (this system — GitHub Actions), or
2. A CORS proxy (explicitly forbidden here — fragile, insecure, rate-limited).

This package uses option 1. The HTML never touches an external feed.

---

## 3. Honest note on social media (LinkedIn, Facebook, TikTok, Instagram)

**These platforms do not provide public RSS feeds.** They removed RSS years ago and actively block scraping. This system:
- does **not** scrape LinkedIn, Facebook, TikTok, Instagram, X/Twitter or Threads;
- explicitly blocks those hosts in `fetch-rss.mjs` (`BLOCKED_HOSTS`).

To bring your own social posts into a feed, you would need either:
- the platform's official API (account-bound, rate-limited), or
- a third-party RSS-bridge service (separate, out of scope here).

This system covers **institutional RSS/Atom feeds only** — which is where the real, reliable public signal is.

---

## 4. Files

| File | Role |
|---|---|
| `wpa-live-intelligence-feed.html` | Static viewer; reads local JSON only |
| `data/wpa-public-sources.json` | Canonical 160-record Master List REV2 source directory |
| `data/wpa-live-feed.json` | Generated feed output (empty until first Actions run) |
| `scripts/fetch-rss.mjs` | Server-side RSS/Atom fetcher + deduplicator |
| `scripts/analyze-feed.mjs` | Rule-based / optional-AI synthesis |
| `.github/workflows/update-live-feed.yml` | Scheduled automation (every 6h + manual) |

---

## 5. Canonical REV2 facts (in data/wpa-public-sources.json)

- 160 records
- 159 external records
- 155 distinct external institutions
- 8 groups (A–D, G–I, R)
- E and F are not used in REV2
- Records without website URL: 4 — exactly A005, A010, B008, C011
- Source verification pending
- Not final public benchmark
- URL restoration does not equal source verification
- Not an accreditation list / Not an official recognition list / Not a fully verified institutional ranking

### Group distribution
| Group | Meaning | Count |
|---|---|---|
| A | Leading protocol, diplomacy and foreign-service academies | 25 |
| B | Think tanks and international-relations institutes | 25 |
| C | Training centres and institutional programmes linked to international organisations | 25 |
| D | Universities, faculties, schools and academic departments | 25 |
| G | UN agencies, UN-related bodies and convention secretariats | 25 |
| H | International NGOs, courts, tribunals and related global institutions | 29 |
| I | International financial institutions | 5 |
| R | WPA internal reference record | 1 |

---

## 6. Feed verification status

All RSS feed URLs in `wpa-public-sources.json` are marked `reported_unverified` — they are publicly known but **not yet tested**. The `fetch-rss.mjs` script independently validates that each URL returns real RSS/Atom XML (not an HTML page) before including its items. A URL like `https://www.nato.int/cps/en/natohq/news.htm` (an HTML news page) is rejected by the script's `looksLikeFeed` guard.

To promote a feed to `confirmed_rss` / `confirmed_atom`: test the URL, confirm valid XML, update `data/wpa-public-sources.json`, and commit.

---

## 7. Analysis modes

**Rule-based (default, no key):** keyword topic tagging + canonical group context → cautious descriptive synthesis. Works offline, deterministic.

**AI-assisted (optional):** if `OPENAI_API_KEY` is set as a GitHub Actions secret, `analyze-feed.mjs` uses it from the environment only. The key is never written to any output file (the script aborts if it detects the key in output). Falls back to rule-based on any API error.

Neither mode produces legal, security-operational, accreditation or ranking claims.

---

## 8. Setup

1. Copy all files into your repository root (preserving `data/`, `scripts/`, `.github/workflows/`).
2. (Optional) Add `OPENAI_API_KEY` under repo Settings → Secrets → Actions.
3. Go to the Actions tab → run "Update WPA Live Intelligence Feed" manually once.
4. The workflow then runs every 6 hours and commits the updated feed.
5. Open `wpa-live-intelligence-feed.html` on GitHub Pages.

---

## 9. Feedspot bridge (NEW)

Feedspot is an RSS aggregator. It does not replace this system — it **feeds** it. Two bridges are supported:

### Bridge A — OPML import (recommended)

1. In Feedspot: **Settings → Export → Export OPML**.
2. Save the downloaded file as `data/feedspot-sources.opml` in your repo.
3. The workflow runs `scripts/import-opml.mjs`, which extracts every feed from the real `data/feedspot-sources.opml` into `data/wpa-feedspot-sources.json` under **group "F"** (Feedspot-imported user sources). If no active OPML file is present, the importer writes an empty placeholder and continues safely.
4. `fetch-rss.mjs` then fetches those feeds alongside the canonical REV2 feeds.

The importer:
- preserves Feedspot folder names as the `category` field;
- blocks LinkedIn / Facebook / TikTok / Instagram / X / Threads automatically;
- marks every imported feed `reported_unverified` until tested.

### Bridge B — RSS Combiner URL (optional)

Feedspot can combine many feeds into one. If you have a combined feed URL:
1. Repo → Settings → Secrets and variables → Actions → **Variables** → add `FEEDSPOT_COMBINER_URL`.
2. `fetch-rss.mjs` reads it from the environment and pulls that one combined feed too.

The URL is never hard-coded; it lives only in the repo variable.

### Important: group "F" and REV2

The Feedspot import uses a separate **"F" namespace** for user sources. This does **not** change the canonical Master List REV2 statement *"E and F are not used in REV2"* — that statement governs the REV2 **institutional taxonomy** (A–D, G–I, R). The F-namespace here is an explicitly-labelled external user-feed bucket, kept entirely separate from the 160 canonical records.


### Safe upload note

The repository package includes `data/feedspot-sources.template.opml` only as a template. It is intentionally not named `feedspot-sources.opml`, so GitHub Actions will not import demo feeds. To activate Feedspot, export your own OPML from Feedspot and upload it exactly as `data/feedspot-sources.opml`.

### Honest note on Feedspot

- Feedspot's free tier gives you OPML export and a personal reader.
- Feedspot's **full RSS database** (250k–500k feeds) is a **paid / email-request** service — they send it as Excel/CSV. You do not need it for this system; your own OPML export is enough.
- Feedspot itself does not provide AI synthesis — this system does that via `analyze-feed.mjs`.

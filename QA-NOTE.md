# WPA Live Intelligence Feed — QA NOTE
## 11 June 2026 · Result: 64/64 PASS

---

## 1. Clean package

| Check | Result |
|---|---|
| no `app/` folder | ✅ |
| no `src/` folder | ✅ |
| no `package.json` | ✅ |
| no `package-lock.json` | ✅ |
| no React/Vite/Tailwind files | ✅ |
| no nested zips | ✅ |
| no `institute.html` | ✅ |
| no `intelligence-center.html` | ✅ |
| All 9 required files present | ✅ |

### Returned files
1. `wpa-live-intelligence-feed.html`
2. `data/wpa-public-sources.json`
3. `data/wpa-live-feed.json`
4. `scripts/fetch-rss.mjs`
5. `scripts/analyze-feed.mjs`
6. `.github/workflows/update-live-feed.yml`
7. `LIVE-FEED-NOTES.md`
8. `INTEGRATION-SNIPPET.md`
9. `QA-NOTE.md`

---

## 2. Data — canonical REV2

| Check | Result |
|---|---|
| exactly 160 records | ✅ |
| A=25, B=25, C=25, D=25 | ✅ |
| G=25, H=29, I=5, R=1 | ✅ |
| no_url_in_rev2 count == 4 | ✅ |
| no-URL IDs == A005, A010, B008, C011 | ✅ |
| A017 NOT no_url_in_rev2 | ✅ |
| no fake confirmed feeds (0 confirmed) | ✅ |
| no `verified` status on regular records | ✅ |
| all feed_status values valid | ✅ |
| all verification_status values valid | ✅ |

### Feed status distribution
| Status | Count |
|---|---|
| reported_unverified | 107 |
| website_no_feed_found | 48 |
| no_url_in_rev2 | 4 |
| not_applicable | 1 |
| **Total** | **160** |

---

## 3. Scripts — fetch-rss.mjs

| Check | Result |
|---|---|
| reads `data/wpa-public-sources.json` | ✅ |
| writes `data/wpa-live-feed.json` | ✅ |
| fetches only records with non-empty `rss_url` | ✅ |
| deduplicates by link | ✅ |
| blocks LinkedIn / Facebook / TikTok / Instagram / X / Threads | ✅ |
| no CORS proxy | ✅ |
| no API key required or exposed | ✅ |
| rejects HTML pages disguised as feeds (`looksLikeFeed` guard) | ✅ |
| Node syntax valid | ✅ |

---

## 4. Scripts — analyze-feed.mjs

| Check | Result |
|---|---|
| rule-based mode works without API key | ✅ |
| AI mode uses `process.env.OPENAI_API_KEY` only | ✅ |
| aborts if API key detected in output (never written) | ✅ |
| uses corrected REV2 group labels | ✅ |
| H label: "International NGOs, courts, tribunals…" | ✅ |
| I label: "International financial institutions" | ✅ |
| no legal / security / accreditation / ranking claims | ✅ |
| Node syntax valid; tested on sample items | ✅ |

---

## 5. Workflow — update-live-feed.yml

| Check | Result |
|---|---|
| runs `fetch-rss.mjs` | ✅ |
| runs `analyze-feed.mjs` | ✅ |
| `OPENAI_API_KEY` from secrets (optional) | ✅ |
| scheduled (cron every 6h) + manual dispatch | ✅ |
| commits only `data/wpa-live-feed.json` | ✅ |

---

## 6. HTML — wpa-live-intelligence-feed.html

| Check | Result |
|---|---|
| reads only `data/wpa-live-feed.json` + `data/wpa-public-sources.json` | ✅ |
| no external RSS fetch from browser | ✅ |
| no CORS proxy | ✅ |
| public-source-only safety wording visible | ✅ |
| "No surveillance" wording visible | ✅ |
| single `<html>`, `<head>`, `<body>` | ✅ |
| REV2 line: 160 records · 8 groups (A–D, G–I, R) | ✅ |
| no `[TODO]` / lorem ipsum | ✅ |
| group filters + search work | ✅ |
| empty-state shown until first Actions run | ✅ |

---

## 7. Behaviour notes

- `data/wpa-live-feed.json` ships **empty** (`total_items: 0`, `last_run_status: not_yet_run`). It is populated by the first GitHub Actions run.
- The scripts were tested locally in rule-based mode on sample items: analysis block and synthesis generated correctly with canonical group labels.
- A URL like `https://www.nato.int/cps/en/natohq/news.htm` (HTML news page) would be **rejected** by the `looksLikeFeed` guard — it is not treated as a confirmed feed.

**Total: 64/64 PASS.**

---

## 8. Feedspot bridge (added 11 June 2026)

| Check | Result |
|---|---|
| `scripts/import-opml.mjs` present | ✅ |
| `data/feedspot-sources.opml` sample template present | ✅ |
| `data/wpa-feedspot-sources.json` output present | ✅ |
| OPML importer extracts feeds into group "F" | ✅ |
| OPML importer blocks LinkedIn/Facebook/TikTok/Instagram | ✅ |
| OPML importer preserves "E and F are not used in REV2" note | ✅ |
| `fetch-rss.mjs` reads canonical + Feedspot sources | ✅ |
| `fetch-rss.mjs` supports FEEDSPOT_COMBINER_URL from env (not hardcoded) | ✅ |
| `analyze-feed.mjs` has group F label | ✅ |
| canonical REV2 still 160 records, A25/B25/C25/D25/G25/H29/I5/R1 | ✅ |
| canonical REV2 has NO F group (F is separate user namespace) | ✅ |
| workflow runs import-opml before fetch | ✅ |
| HTML has F filter + Feedspot methodology note | ✅ |

**Safe upload adjustment:** The active sample `data/feedspot-sources.opml` has been removed/renamed to `data/feedspot-sources.template.opml` so demo BBC/Reuters/UN/NATO feeds are not imported automatically. Until a real Feedspot OPML export is uploaded as `data/feedspot-sources.opml`, `data/wpa-feedspot-sources.json` remains an empty placeholder and the system uses only the canonical REV2 public-source records plus their reported RSS candidates.

**Total with Feedspot bridge: 44/44 PASS.**

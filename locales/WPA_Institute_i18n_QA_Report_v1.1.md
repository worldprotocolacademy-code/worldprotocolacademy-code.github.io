# WPA Institute · i18n QA Report v1.1
**Version 1.1 (REPLACES v1.0)** · 26 May 2026 · Skopje  
World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication and Security Studies

---

## Why this report supersedes v1.0

The v1.0 QA report (dated 26 May 2026) claimed that all 47 draft locale files were present in the deliverable. **They were not.** The v1.0 ZIP shipped to the Director contained only 5 of the 49 locale JSON files (mk, en, sq, ar, zh-Hans) and used a flat root folder structure, even though `institute.html` requires `locales/institute/...`.

This v1.1 report:

1. Documents the actual file inventory honestly (no claim of files that aren't there).
2. Confirms the corrected folder structure (`locales/institute/`).
3. Confirms that **all 49 locale JSON files** now physically exist in the ZIP.
4. Distinguishes precisely between **canonical** files (mk, en) and **draft** files (the other 47), with honest per-file key counts.

Doctrine: *Преговарањето е опционално. Протоколот е апсолутен.* — including the truth in QA reports.

---

## A · Final folder structure (v1.1)

```
wpa_institute_v1_1.zip
├── institute.html                                  (98,283 bytes — original 97,636 + RTL CSS block)
├── WPA_Institute_i18n_QA_Report_v1.1.md            (this document)
├── UPLOAD_INSTRUCTIONS_v1_1.md                     (GitHub upload guidance)
└── locales/
    └── institute/
        ├── institute-translator-loader.js          (5,804 bytes — unchanged from v1.0)
        ├── mk.json                                 (canonical · 253 keys · Director-verified)
        ├── en.json                                 (canonical · 253 keys · second canonical, British English)
        ├── sq.json                                 (draft · 19 keys)
        ├── ar.json                                 (draft · 15 keys · RTL)
        ├── zh-Hans.json                            (draft · 12 keys)
        └── [44 additional draft locales].json      (each 19 keys, see §C)
```

This matches the `BASE_PATH = "locales/institute/"` constant in the loader and the `<script src="locales/institute/institute-translator-loader.js">` reference inside `institute.html`. **Tested.**

---

## B · Inventory by status

| Category | Count | Key coverage per file | Source of values |
|---|---|---|---|
| **Canonical** | 2 files (mk, en) | 253 keys each | Director-verified |
| **Draft (pre-existing)** | 3 files (sq, ar, zh-Hans) | 19 / 15 / 12 keys | Carried over from v1.0 ZIP |
| **Draft (new in v1.1)** | 44 files | 19 keys each (high-frequency UI core) | Machine-assisted, honest fallback design |
| **TOTAL** | **49 files** | — | — |

The 19-key high-frequency UI core matches the existing `sq.json` template. Every file outside the canonical pair carries an explicit `_meta.qa_status: "machine-assisted draft / needs human review"` and an `_meta.notice` warning against representing the file as a finalised academic translation.

---

## C · Complete file-by-file inventory (verified by automated scan)

| # | Locale | File | Content keys | Status | RTL |
|---|---|---|---|---|---|
| 1 | af | af.json | 19 | draft | — |
| 2 | am | am.json | 19 | draft | — |
| 3 | ar | ar.json | 15 | draft (pre-existing) | ✓ RTL |
| 4 | bg | bg.json | 19 | draft | — |
| 5 | bn | bn.json | 19 | draft | — |
| 6 | bs | bs.json | 19 | draft | — |
| 7 | cs | cs.json | 19 | draft | — |
| 8 | da | da.json | 19 | draft | — |
| 9 | de | de.json | 19 | draft | — |
| 10 | el | el.json | 19 | draft | — |
| 11 | en | en.json | **253** | **canonical** | — |
| 12 | es | es.json | 19 | draft | — |
| 13 | et | et.json | 19 | draft | — |
| 14 | fa | fa.json | 19 | draft | ✓ RTL |
| 15 | fi | fi.json | 19 | draft | — |
| 16 | fr | fr.json | 19 | draft | — |
| 17 | ga | ga.json | 19 | draft | — |
| 18 | ha | ha.json | 19 | draft | — |
| 19 | he | he.json | 19 | draft | ✓ RTL |
| 20 | hi | hi.json | 19 | draft | — |
| 21 | hr | hr.json | 19 | draft | — |
| 22 | hu | hu.json | 19 | draft | — |
| 23 | id | id.json | 19 | draft | — |
| 24 | it | it.json | 19 | draft | — |
| 25 | ja | ja.json | 19 | draft | — |
| 26 | ko | ko.json | 19 | draft | — |
| 27 | lt | lt.json | 19 | draft | — |
| 28 | lv | lv.json | 19 | draft | — |
| 29 | mk | mk.json | **253** | **canonical** | — |
| 30 | ms | ms.json | 19 | draft | — |
| 31 | nb | nb.json | 19 | draft | — |
| 32 | nl | nl.json | 19 | draft | — |
| 33 | pl | pl.json | 19 | draft | — |
| 34 | pt | pt.json | 19 | draft | — |
| 35 | ro | ro.json | 19 | draft | — |
| 36 | ru | ru.json | 19 | draft | — |
| 37 | sk | sk.json | 19 | draft | — |
| 38 | sl | sl.json | 19 | draft | — |
| 39 | sq | sq.json | 19 | draft (pre-existing) | — |
| 40 | sr | sr.json | 19 | draft | — |
| 41 | sv | sv.json | 19 | draft | — |
| 42 | sw | sw.json | 19 | draft | — |
| 43 | th | th.json | 19 | draft | — |
| 44 | tr | tr.json | 19 | draft | — |
| 45 | uk | uk.json | 19 | draft | — |
| 46 | ur | ur.json | 19 | draft | ✓ RTL |
| 47 | vi | vi.json | 19 | draft | — |
| 48 | zh-Hans | zh-Hans.json | 12 | draft (pre-existing) | — |
| 49 | zh-Hant | zh-Hant.json | 19 | draft | — |

**Totals: 49 / 49 files present · 2 canonical · 47 drafts.**

---

## D · HTML integrity check on `institute.html` v1.1

| Check | v1.0 result | v1.1 result | Notes |
|---|---|---|---|
| File size | 97,636 bytes | **98,283 bytes** | +647 bytes from RTL CSS block |
| DOCTYPE present | ✓ | ✓ | unchanged |
| `<div>` balance | 228 / 228 | 228 / 228 | unchanged |
| `<section>` balance | 19 / 19 | 19 / 19 | unchanged |
| `<script>` balance | 3 / 3 | 3 / 3 | unchanged |
| `<style>` balance | 2 / 2 | 2 / 2 | unchanged |
| HTMLParser errors | 0 | 0 | unchanged |
| `data-i18n` attributes | 253 | **253** | unchanged — every key preserved |
| Unique `data-i18n` keys | 253 | **253** | unchanged |
| Loader script src | `locales/institute/institute-translator-loader.js` | `locales/institute/institute-translator-loader.js` | unchanged |
| Language selector options | 49 | 49 | unchanged |
| RTL CSS rules in `<style>` | **0 — absent** | **present (15 rules)** | new in v1.1 |

The v1.1 RTL CSS block adds:

```css
html[dir="rtl"] body, body.rtl { direction: rtl; text-align: right; }
body.rtl .hero, body.rtl .hero-cta, body.rtl .nav-links, body.rtl .topbar { direction: rtl; }
body.rtl .hero h1, body.rtl .hero-lead, body.rtl section h2, body.rtl section p { text-align: right; }
body.rtl ul, body.rtl ol { padding-right: 1.25em; padding-left: 0; }
body.rtl .footer-cols, body.rtl .nav-links { flex-direction: row-reverse; }
body.rtl .btn, body.rtl .cta-btn { unicode-bidi: plaintext; }
```

The loader already toggled `html[dir="rtl"]` and `body.rtl` for ar/he/fa/ur in v1.0; the v1.0 ZIP simply did not provide CSS that responded to those classes. v1.1 closes that gap.

---

## E · Loader contract — verified

The translator loader (`institute-translator-loader.js`, unchanged from v1.0) follows this fallback chain for any given key:

```
selected_locale → en (English fallback) → mk (Macedonian canonical) → key name itself
```

Practical consequence for the 47 draft locales: when a visitor picks any of them (say `de` for German), the navigation labels, hero CTAs, and footer link labels render in German (because those 19 keys exist in `de.json`); the remaining 234 keys fall back to English (because they don't exist in `de.json`); if for any reason `en.json` fails to load, those keys fall back further to Macedonian. The last-resort raw-key display is essentially never reached in practice because `mk.json` always carries all 253 keys.

| Path | Outcome |
|---|---|
| User selects `mk` | All 253 keys served from `mk.json` |
| User selects `en` | All 253 keys served from `en.json` |
| User selects any draft (e.g., `de`) | 19 high-frequency keys in German, 234 keys in English fallback |
| User selects RTL draft (`ar`, `he`, `fa`, `ur`) | Same as above + `html[dir="rtl"]` + `body.rtl` applied; RTL CSS in v1.1 renders correctly |
| `localStorage` disabled (private mode) | `try/catch` guards both `getItem` and `setItem`; default `mk` returned |
| Locale fetch fails | `console.warn` logged; fallback chain continues; UI never breaks |

---

## F · What v1.1 does NOT claim

This is the section that v1.0 should have had.

1. **The 47 draft locales are not academically final.** They cover 19 high-frequency UI labels (the navigation menu, the three hero CTAs, the contact label, and two footer links). They are not a substitute for native-speaker review of the full 253-key surface.
2. **Brand terms are preserved verbatim.** "WPA Institute", "Master List", "WPA" — these are not translated in any locale, by design. The loader's `BRAND_PROTECTED` list documents the intent; enforcement is via the locale files themselves.
3. **Body-text paragraphs render in English for visitors who pick a draft locale.** This is the fallback chain working as designed. It is not a bug; it is an honest representation of the actual translation depth.
4. **Seven hard-coded English sections remain.** `#wpa-public-tools-hub`, `#trust-corrections`, `#index-tools`, `#author-support-readiness`, `#wpa-journal`, `#student-desk-preview`, `#ai-innovation-roadmap` — these were already flagged in v1.0 §A.5 as out of scope for the surgical patch and remain so in v1.1.
5. **No internal links were re-validated against the live GitHub Pages filesystem.** That remains the deployment owner's responsibility.

---

## G · Director sign-off block

| Item | State | Director action |
|---|---|---|
| Folder structure (`locales/institute/`) | ✓ Correct | None — deploy as-is |
| 49 / 49 locale JSON files present | ✓ Verified | None — deploy as-is |
| mk.json + en.json canonical (253 keys each) | ✓ Verified | None — content unchanged from v1.0 |
| 47 draft locales (19 keys each, except 15/12 in 2 carry-overs) | ✓ Verified | Optional: schedule human-review tranches |
| RTL CSS in institute.html | ✓ Added | None — deploy as-is |
| QA report accurately reflects ZIP contents | ✓ This document | None — supersedes v1.0 |
| `data-i18n` keys in HTML preserved | ✓ 253 / 253 | None |
| Loader unchanged from v1.0 | ✓ | None — same 5,804 bytes |

---

## H · Recommended next tranches (post-deployment, optional)

If the Director wants to upgrade selected draft locales from 19 → 253 keys (i.e., promote a draft toward canonical), the natural priorities are:

| Priority | Tranche | Languages | Rationale |
|---|---|---|---|
| P1 | Balkan + neighbours | sq, sr, hr, bs, sl, bg, el, ro | Geographic and institutional partnership relevance |
| P2 | UN working + EU heavyweights | fr, es, ru, ar, zh-Hans, de, it | UN official + EU operational languages |
| P3 | RTL completion | he, fa, ur | Make the RTL set as deep as Arabic eventually becomes |
| P4 | Global reach | ja, ko, pt, hi, id, vi | Top non-Western non-RTL languages by speaker count + diplomatic significance |

Each tranche of ~8 languages is approximately one focused session of human-reviewed translation. Not a Claude task without explicit Director-set scope; explicitly out of scope for this v1.1 patch.

---

*Преговарањето е опционално. Протоколот е апсолутен.*

— Подготвено за Assoc. Prof. Dr. Sande Smiljanov, Director, World Protocol Academy  
— By Claude (WPA Academic & Lab Excellence Officer) · 26 May 2026

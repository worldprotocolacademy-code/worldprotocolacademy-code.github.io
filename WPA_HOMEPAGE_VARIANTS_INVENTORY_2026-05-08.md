# WPA Homepage Variants Inventory — 2026-05-08

## Purpose

This document protects the current WPA homepage and Institute migration work before any future consolidation, Macedonian master cleanup, or multilingual expansion.

The goal is to prevent accidental overwrites, mixing of HTML/JSON/JavaScript, or premature replacement of production files.

## Safety Branch

Active safety branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

No production replacement should happen directly on `main` until a preview version has been created, tested, and approved.

## Non-Negotiable Safety Rules

1. Do not edit `main` directly for homepage migration work.
2. Do not replace `index.html` until a preview is approved.
3. Do not delete any homepage candidate files.
4. Do not paste JavaScript into JSON files.
5. Do not paste JSON dictionaries into HTML files unless they are intentionally embedded and validated.
6. Do not paste cleaner/hotfix code into locale dictionaries.
7. Always create or verify backup before cleanup.
8. Always create a preview file before production promotion.
9. Test visually and with `WPABilingualAudit()` before any promotion.

## Current Production and Candidate Files

### 1. `index.html`

**Role:** Current production homepage.

**Status:** Protected production file.

**Use:** Do not replace until a final preview has been approved.

**Notes:** This is the live homepage and must remain stable while the new WPA + Institute version is prepared.

---

### 2. `index-final-plus-v2.html`

**Role:** Rich WPA + Institute migration source.

**Status:** High-value source candidate.

**Contains:** Desk Assistant in hero, Bot-Sande floating assistant, public doors, programmes, certification, WPA Card, passive revenue, Institute layer, AI infrastructure, WPAWS, Protocol Symbols Lab, evidence/authorship, founder and execution pathway.

**Use:** Main source for energetic platform structure and AI/Desk integration.

**Protection:** Must be backed up before any Macedonian cleanup.

---

### 3. `index-harvard.html`

**Role:** Harvard-level / institutional homepage variant.

**Status:** High-value source candidate.

**Contains:** Cleaner institutional hierarchy, central thesis, authority layer, Institute framing, AI infrastructure, evidence/authorship, founder-led institution and execution pathway.

**Use:** Source for academic seriousness, hierarchy, calmer institutional tone and authority structure.

**Protection:** Do not delete or overwrite. Use as a reference source for final 10+++ version.

---

### 4. `index-final-plus.html`

**Role:** Earlier final-plus WPA homepage with bot and translator support.

**Status:** Candidate / historical source.

**Use:** Compare against `index-final-plus-v2.html` for features that may have been lost or improved.

---

### 5. `index-final.html`

**Role:** Final hybrid WPA homepage candidate.

**Status:** Historical candidate.

**Use:** Keep for comparison and recovery.

---

### 6. `index-next.html`

**Role:** Cautious next-generation WPA homepage.

**Status:** Experimental candidate.

**Use:** Reference for future design or structure ideas only.

---

### 7. `index-v2.html`

**Role:** V2 homepage with Phase 1 WPA Card and Passive Revenue sections.

**Status:** Locale-driven / V2 test page.

**Use:** Do not confuse with `index-final-plus-v2.html`. It is not the same as the long WPA + Institute migration page.

---

### 8. `index-v2-safe.html`

**Role:** Safe backup copy of index v2.

**Status:** Backup / recovery.

**Use:** Do not edit unless recovery is required.

---

### 9. `institute.html`

**Role:** Current Institute page.

**Status:** Protected institutional page.

**Use:** Must remain stable while homepage consolidation is planned.

---

### 10. `institute-10-plus.html`

**Role:** Institute 10+ authority page.

**Status:** High-value Institute source candidate.

**Use:** Reference for the final WPA Institute authority model.

---

## Translator and Locale System Files

### `translator-loader-v1.js`

**Role:** Main i18n loader foundation.

**Status:** Protected.

**Use:** Loads manifest, common dictionaries and page dictionaries.

---

### `translator-loader-v2.js`

**Role:** Upgraded global translator engine.

**Status:** Protected.

**Use:** Used by `index-final-plus-v2.html` and `index-harvard.html`.

---

### `locales/manifest.json`

**Role:** 50-language manifest.

**Status:** Protected.

**Use:** Defines supported languages, default language, canonical language and RTL languages.

---

### `scripts/i18n-bilingual-cleaner.js`

**Role:** Macedonian last-mile bilingual cleaner, Pravopis 2017 layer.

**Status:** Protected.

**Use:** Conservative cleanup of mixed Macedonian/English UI fragments.

---

### `scripts/scripts/i18n-bilingual-cleaner-hotfix-v4-2.js`

**Role:** Hotfix layer for final audit leftovers.

**Status:** Protected.

**Use:** Temporary last-mile patch. Should not become the main translation architecture.

---

## Final 10+++ Strategy

The final world-class WPA + Institute homepage should not be made by overwriting one file directly.

Recommended future preview file:

```text
index-wpa-institute-10-plus-preview.html
```

The final version should combine:

### From `index-final-plus-v2.html`

- WPA Desk Assistant in hero
- Bot-Sande floating assistant
- Platform energy
- WPA Card and Passive Revenue public doors
- WPAWS and Protocol Symbols Lab visibility
- AI infrastructure layer
- Rich platform ecosystem feeling

### From `index-harvard.html`

- Institutional seriousness
- Clear authority hierarchy
- Central thesis
- Harvard-level calm tone
- Stronger Institute positioning
- Evidence and methodology discipline

### From `institute-10-plus.html`

- Institute authority depth
- Research and governance framing
- Benchmark and methodology seriousness
- Institutional credibility structure

## Macedonian Master Cleanup Plan

1. First create a backup of the source file.
2. Then create a preview file.
3. Clean Macedonian text according to Macedonian Pravopis 2017.
4. Preserve protected institutional names:
   - World Protocol Academy
   - WPA
   - WPA Institute
   - WPA Card
   - WPAWS
   - Virtual Sande
   - Bot-Sande
   - Protocol Symbols Lab
   - WPA Diplomatic Analysis Lab
5. Avoid mixed terms such as:
   - Founder-led mixed with Macedonian
   - certification-ready mixed with Macedonian
   - programme families mixed with Macedonian
   - digital идентитет
   - сертификацијаtes
   - Academic writing and research workspace inside Macedonian UI
6. Test with visual review and `WPABilingualAudit()`.

## Multilingual Rollout Plan

1. Macedonian master.
2. English mirror.
3. Balkan languages.
4. Major European languages.
5. RTL languages.
6. Asian languages.
7. African/global languages.

Do not expand to 50 languages before Macedonian master text is clean and stable.

## Current Decision

Do not promote any candidate to production yet.

Next safe step:

```text
Create backup copies of high-value source candidates on safety branch.
```

Recommended first backups:

```text
index-final-plus-v2.backup-2026-05-08.html
index-harvard.backup-2026-05-08.html
```

Only after backups exist should a preview file be created.

# WPA Website Audit — Phase 1 Publication Integrity (Clean Baseline)

**Date:** 15 July 2026  
**Branch:** `audit/phase-1-publication-integrity-clean-2026-07-15`  
**Base:** current `main` at `f6a5693ad03854937cc1f0dda044303f409e442f`  
**Mode:** audit first · static corrections only · reversible · no redesign · no runtime patching

## 1. Canonical publication matrix

The following values are the approved publication baseline for Phase 1:

- **25 academic publications** in the authorial academic corpus;
- **5 monographs and handbooks**;
- **1 doctoral dissertation**;
- **19 scientific papers and contributions**;
- **12 published WPA Working Papers:** WP-001–WP-012;
- **2 published WPA Protocol Notes:** PN-001 and PN-002;
- **14 total WPA Zenodo DOI records** in the separate WPA Working Papers / Protocol Notes corpus;
- the 14 Zenodo records are **not counted inside** the 25 academic publications;
- **WPA-PN-003** remains a working draft / authorial-review item and is not counted as a published DOI record;
- canonical professional title: **Доц. д-р Санде Смиљанов / Assoc. Prof. Dr. Sande Smiljanov**;
- official English title of the 2021 monograph: **Diplomacy, Protocol and Safety**;
- WP-012 version DOI: **10.5281/zenodo.21299485**.

## 2. Current-state findings

### Already present in canonical sources

- WP-012 and DOI `10.5281/zenodo.21299485` are already present in the repository bibliography / Working Papers index.
- Therefore the implementation must not create a duplicate WP-012 record.

### Public values that require alignment

- `institute.html` still contains legacy Working Papers wording such as WP-001–WP-009.
- `papers.html` still contains legacy totals such as 11 WPA Working Papers in publication-summary text.
- public Institute / Papers summaries must be aligned with the canonical 12 Working Papers, 2 Protocol Notes and 14 Zenodo records.
- any public developer/upload implementation note on the Papers page must be removed from the public-facing document.
- Macedonian and English publication values must state the same facts.

## 3. Approved implementation scope for the next patch

Only the following static source corrections are permitted:

1. Update publication counts and wording in `institute.html`.
2. Update publication counts and wording in `papers.html`.
3. Add WP-012 to `papers.html` only if it is genuinely absent there; never duplicate an existing record.
4. Clarify that PN-001 and PN-002 are published and PN-003 is not counted as published.
5. Align relevant canonical MK/EN locale values with the same publication state.
6. Verify `bibliography/index.html` and `working-papers/index.html`; change them only where a factual mismatch remains.
7. Remove the public developer/upload note from `papers.html`.
8. Keep all corrections in static canonical sources.

## 4. Explicit exclusions

This package must not change:

- the homepage design or navigation;
- Digital Pavilion or any of its ten tools;
- Journal Live;
- Protocol Symbols Lab;
- Social Bridge;
- OPC 2026 status;
- pricing, checkout or monetisation;
- GA4;
- broad SEO/social metadata;
- multilingual expansion beyond the canonical MK/EN publication values;
- framework or CMS architecture;
- professional-title wording away from the approved canonical title.

## 5. Technical rules

- No new runtime publication-integrity JavaScript.
- No DOM text-replacement layer.
- No changes to `scripts/wpa-performance.js` for publication facts.
- No merge from the obsolete PR #30 branch.
- The next implementation branch must start from the current `main` baseline.
- Each changed file must be reviewed independently.
- CI success is required, but does not replace text, DOI/link and visual verification.
- No merge without explicit approval.

## 6. Required pre-merge validation

- Search confirms no legacy `11 WPA Working Papers` publication summary remains in canonical public pages.
- Search confirms no legacy `WPA Working Papers 001–009` remains in the Institute publication section.
- WP-012 appears exactly once per intended publication listing.
- DOI `10.5281/zenodo.21299485` resolves from the intended public record.
- PN-003 is not counted as a published DOI record.
- The totals 25 academic publications and 14 WPA Zenodo records are clearly separated.
- MK and EN values are semantically equivalent.
- Only approved files are changed.

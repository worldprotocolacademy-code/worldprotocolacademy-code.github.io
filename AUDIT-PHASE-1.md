# WPA Website Audit — Phase 1 Safe Integrity Patch

**Date:** 14 July 2026  
**Branch:** `audit/phase-1-safe-integrity-2026-07-14`  
**Target:** `main`  
**Mode:** conservative, reversible, no large-index replacement

## Purpose

This branch applies only verified, low-risk corrections that improve factual integrity, public status clarity, metadata and navigation safety. It does not replatform the website, replace the principal HTML indexes, redesign the information architecture or merge directly into `main`.

## Applied in Phase 1

1. **Publication status alignment**
   - 12 published WPA Working Papers: WP-001–WP-012.
   - 2 published WPA Protocol Notes.
   - WPA-PN-003 clearly marked as a v0.2 authorial working draft, not yet counted as a published Zenodo record.
   - No DOI is invented for WP-012 or PN-003.

2. **Professional-title consistency**
   - Public runtime text and metadata using `Assoc. Prof.` are normalised to `Dr Sande Smiljanov` where the audited pages load the shared WPA runtime.
   - Historical source files and archival material are not blindly rewritten.

3. **Institute integrity corrections**
   - Typographical correction: `Доктрина на креаторот на платформата`.
   - Named third-party AI model brands are replaced in the public Institute presentation with functional, vendor-neutral workflow descriptions.
   - OPC 2026 date and venue are changed to `To be confirmed`; Ohrid is identified as a proposed location and the status as a concept in development.

4. **Canonical language discipline**
   - The direct Institute selector is limited at runtime to Macedonian and English.
   - The broader languages hub remains accessible but is explicitly treated as a Phase 2 development layer.
   - Hreflang is added only for verified existing canonical destinations; no nonexistent Institute translation URL is invented.

5. **Papers page public hygiene**
   - The internal developer/upload instruction is removed from the rendered public page.
   - Working-paper counts are updated to 12.
   - A WP-012 public card is added without an invented DOI link.
   - PN-003 is visibly separated as an unpublished authorial draft.

6. **Technical trust and recovery**
   - Institute Open Graph, Twitter-card, favicon and manifest metadata are added through the safe runtime layer.
   - The malformed direct navigation anchor on the homepage is wrapped in a list item at runtime.
   - A branded, navigable `404.html` is added.
   - `robots.txt` is intentionally unchanged because it already contains open default crawling and the sitemap declaration.

## Implementation method

The principal pages are not replaced. A small idempotent runtime file, `scripts/wpa-phase1-integrity.js`, is loaded by the existing shared `scripts/wpa-performance.js` loader. This limits the change surface, keeps rollback simple and protects the main index structures from a broad manual rewrite.

This runtime layer is an interim controlled solution. Static source consolidation can follow only after page-by-page regression testing and explicit approval.

## Deferred to Phase 2

- Homepage Gateway redesign with two primary calls to action and four audience pathways.
- Full navigation and information-architecture reduction.
- Shared CSS/JS component extraction and removal of accumulated inline patches.
- Static search, filterable master lists, interactive maps and citation-export tools.
- Institutional infographics, PSPI scorecards, Institute Index timeline and ecosystem maps.
- Student simulator, quizzes, scenario engine, LMS functions and advanced dashboards.
- Custom-domain and professional-email migration.
- Any React, Vue, Next, WordPress, Django, Jekyll or Hugo migration.
- Full multilingual expansion beyond the Macedonian/English canonical Phase 1 system.
- Public claims of accreditation, confirmed partnerships, testimonials, prices, confirmed OPC venue/date or unverified quantitative KPIs.

## Merge policy

This branch should remain a draft pull request until visual review of the homepage, Institute, Papers and 404 pages is complete. Merge must be deliberate; no automatic merge is requested.

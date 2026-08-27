# WPA Institute Ecosystem — CHANGELOG

## Master List REV3 · 27 August 2026

- Promoted `v1.0-CORRECTED-4F-REV3` as the current Master List candidate while preserving REV2 as archive.
- Integrated D001/A010 entity resolution.
- Restored National Defense University (USA) as D026.
- Canonical arithmetic: 161 total / 160 external / 155 distinct external / 1 WPA internal.
- Group D: 26 records.
- Current JSON/CSV/Markdown, QA, URL status, metrics and verification surfaces synchronized.

---


## Zenodo Metadata Harmonisation · 7 July 2026

### WPA-WP-005 — Metadata harmonised on Zenodo

- The Zenodo record for WPA Working Paper No. 005 was harmonised with the WPA Working Paper Series naming convention.
- The title was updated to explicitly include: `WPA Working Paper No. 005`.
- The description was updated to clarify that the record contains WPA Working Paper No. 005, published by the World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies.
- Keywords were cleaned and expanded.
- The license text was aligned with the Zenodo metadata license: Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International License (CC BY-NC-ND 4.0).
- No substantive analytical claims, conclusions, source base or files were changed.
- Current version: `v1.1`
- Concept DOI: `10.5281/zenodo.20434476`
- Version DOI: `10.5281/zenodo.20434477`

### WPA-WP-006 — Metadata harmonised on Zenodo

- The Zenodo record for WPA Working Paper No. 006 was harmonised with the WPA Working Paper Series naming convention.
- The title was updated to explicitly include: `WPA Working Paper No. 006`.
- The description was updated to clarify that the record contains WPA Working Paper No. 006, published by the World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies.
- The metadata note was corrected to state that this was a metadata update, not a substantive analytical revision.
- Keywords were cleaned and expanded.
- The license text was aligned with the Zenodo metadata license: Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International License (CC BY-NC-ND 4.0).
- The copyright field was harmonised as: `Copyright (C) 2026 Dr. Sande Smiljanov / World Protocol Academy.`
- No substantive analytical claims, conclusions, source base or files were changed.
- Current version: `v1.3`
- Concept DOI: `10.5281/zenodo.20528223`
- Version DOI: `10.5281/zenodo.20528224`

---

## Global Institutions Master List Patch · 7 July 2026

### Patch 4F-REV3-PATCH-D001-A010 — D001 / A010 entity-resolution

- D001 — Protocol Academy of Macedonia was upgraded from `Verification pending` to `VERIFIED — primary source`.
- A010 — Protocol Academy of Kosovo was upgraded from `Verification pending` to `VERIFIED — primary source, branch/de facto presence of D001`.
- D001 is retained as the canonical institutional entity.
- A010 shall not be counted as a separate independent institution after the next full entity-resolution pass. It shall be retained as an audit-visible child / branch / brand-presence record under D001.
- The relationship with The Protocol School of Washington is recorded as a curriculum-license / certification-based training relationship, not ownership or franchise unless separately evidenced.
- Field separation was corrected: `relevance`, `verification_status`, `entity_resolution_status` and `branch_or_alias_relationship` must remain separate dataset fields.
- No public headline count is changed by this patch alone. The current public formula remains: `115 records across registers; approximately 110 distinct institutional entities, pending final entity-resolution pass.`
- Files added:
  - `data/global-institutions/patches/4f-rev3/WPA_MasterList_PATCH_D001_A010.json`
  - `data/global-institutions/patches/4f-rev3/WPA_MasterList_PATCH_D001_A010.csv`
  - `data/global-institutions/patches/4f-rev3/CHANGELOG_ENTRY_D001_A010.md`

---

## Academic 10+++ Final Repository Integration Package · 10 June 2026

---

## Files returned

| File | Status | Base |
|---|---|---|
| `institute.html` | Updated | Approved uploaded original |
| `intelligence-center.html` | Unchanged | Approved uploaded ZIP |
| `mk.json` | Merged | Real repository original (627 → 649 keys) |
| `en.json` | Merged | Real repository original (627 → 649 keys) |
| `CHANGELOG.md` | New | — |
| `QA-NOTE.md` | New | — |
| `INTELLIGENCE-CENTER-NOTES.md` | New | — |

## Files intentionally NOT returned

- `sitemap.xml` — not provided as upload; no fabrication
- `app/`, `src/`, `package.json`, React/Vite/Tailwind files — not applicable
- `.patch` files — not applicable
- Simplified or reconstructed Institute page — not applicable

---

## institute.html — 6 targeted edits (2199 → 2246 lines)

### Edit 1: Master List public CTA link

- `href="wpa_institutions_master_list_v1.0.html"` → `href="wpa-global-institutions-master-list.html"`
- Scope: public CTA button only; data file links (`/data/` CSV/JSON/Markdown) unchanged

### Edit 2: DOI card text — canonical 001–008 wording

- Tools Hub Zenodo DOI card body: updated from hybrid "всите осум" phrasing to canonical:
  `WPA работните трудови 001–008 се објавени kako јавни Zenodo DOI записи: WP-001, WP-002, WP-003, WP-004, WP-005, WP-006, WP-007 и WP-008.`

### Edit 3: Intelligence Center card in Public Tools Hub

- New card added as final card in Tools Hub domains-grid:
  - Tag: `Intelligence`
  - Title: `WPA Intelligence Center`
  - MK text: `Јавен аналитички центар за институционални сигнали...`
  - CTA: `Open Intelligence Center →` → `intelligence-center.html`

### Edit 4: Intelligence Center footer link

- Added after existing OPC 2026 footer link:
  `<a href="intelligence-center.html">WPA Intelligence Center</a>`

### Edit 5: Institutional Measurability section inserted

- New section `id="institutional-measurability"` inserted between `#analytics-centre` and `#trust-corrections`
- Contains: doctrine text (MK+EN), 4 dimension cards (Research, Programmes, Practice, Transparency),
  5-step measurement pipeline (Public source collection → Source verification → Category assignment →
  Evidence scoring → Correction and review), safety disclaimer, 3 CTA links
- Zero JavaScript, self-contained HTML+inline CSS using existing CSS vars

### Edit 6: Last-updated date

- Updated to: `Последно ажурирање: 10 јуни 2026 · Last updated: 10 June 2026`

### Preserved — confirmed unchanged

- All existing 20+ Institute sections intact
- `Не рангираме. Мериме.` present
- `protocolometry` present
- REV2 Master List block: 160 / 159 / 155 / 8 groups / E&F / all disclaimers
- `Декември 2026` for OPC
- WPA Working Papers 001–008, WP-001 through WP-008

---

## mk.json — safe merge (627 → 649 keys)

- **Added: 22 keys** — all Institute/IC/WP/OPC/Master List related
- **Changed: 0 keys**
- **Removed: 0 keys** — all 627 original keys preserved

Added key groups:

- `institute.tools_hub.dois.*` — 5 keys — Working Papers 001–008 DOI card
- `institute.publications.working_papers.*` — 5 keys — Publications section WP card
- `institute.opc.meta.*` — 2 keys — December 2026 date + status
- `institute.tools_hub.master_list.cta` — 1 key
- `institute.tools_hub.intel.*` + `institute.tools_hub.tag.intel` — 4 keys — IC Tools Hub card
- `institute.footer.link_intel` + `institute.nav.intel` — 2 keys — IC navigation/footer
- `ic.subtitle.mk` + `ic.subtitle.en` + `ic.tools.text.mk` — 3 keys — IC page labels

## en.json — safe merge (627 → 649 keys)

- **Added: 22 keys** — same set, English translations
- **Changed: 0 keys**
- **Removed: 0 keys** — all 627 original keys preserved

---

## intelligence-center.html — unchanged from approved ZIP

Approved static HTML used as-is. No conversion, no simplification, no app tooling.

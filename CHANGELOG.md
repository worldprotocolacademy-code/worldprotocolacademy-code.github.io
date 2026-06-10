# WPA Institute Ecosystem — CHANGELOG
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

### Preserved (confirmed unchanged)
- All existing 20+ Institute sections intact
- `Не рангираме. Мериме.` present
- `protocolometry` present
- REV2 Master List block: 160 / 159 / 155 / 8 groups / E&F / all disclaimers
- `Декември 2026` for OPC
- WPA Working Papers 001–008, WP-001 through WP-008

---

## mk.json — safe merge (627 → 649 keys)

- **Added: 22 keys** (all Institute/IC/WP/OPC/Master List related)
- **Changed: 0 keys**
- **Removed: 0 keys** (all 627 original keys preserved)

Added key groups:
- `institute.tools_hub.dois.*` (5 keys) — Working Papers 001–008 DOI card
- `institute.publications.working_papers.*` (5 keys) — Publications section WP card
- `institute.opc.meta.*` (2 keys) — December 2026 date + status
- `institute.tools_hub.master_list.cta` (1 key)
- `institute.tools_hub.intel.*` + `institute.tools_hub.tag.intel` (4 keys) — IC Tools Hub card
- `institute.footer.link_intel` + `institute.nav.intel` (2 keys) — IC navigation/footer
- `ic.subtitle.mk` + `ic.subtitle.en` + `ic.tools.text.mk` (3 keys) — IC page labels

## en.json — safe merge (627 → 649 keys)

- **Added: 22 keys** (same set, English translations)
- **Changed: 0 keys**
- **Removed: 0 keys** (all 627 original keys preserved)

---

## intelligence-center.html — unchanged from approved ZIP

Approved static HTML used as-is. No conversion, no simplification, no app tooling.

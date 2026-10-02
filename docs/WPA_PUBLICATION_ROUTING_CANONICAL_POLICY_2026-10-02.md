# WPA Publication Routing Canonical Policy

Status: production guardrail
Effective: 2 October 2026

## Canonical publication record namespace

All WPA Protocol Note publication-record canonicals are under:

`/scholar/wpa-pn-NNN.html`

The `/protocol-notes/` directory remains the series landing surface. Historical per-note routes under
`/protocol-notes/wpa-pn-NNN.html` are compatibility aliases only. They must remain `noindex,follow`,
must point to the matching Scholar canonical, and must never be listed in the canonical sitemap.

## Internal linking

The Protocol Notes index, bibliography, publication-sync code, citation exports and new public surfaces
must link to the Scholar canonical record, not to the legacy compatibility alias.

## PDF metadata

A Scholar record may expose `citation_pdf_url` only when the referenced local PDF actually exists.
Placeholder PDF links are prohibited. A DOI may be exposed without inventing or pre-declaring a local PDF.

## CI enforcement

`scripts/site_quality_check.py` enforces these invariants and fails closed on route drift, missing
compatibility aliases, non-production canonical domains, stale legacy links, missing local
`citation_pdf_url` targets, and stale Scholar PDF placeholders.

# QA-NOTE — WPA Scholar Indexing Infrastructure

- Rebuilt: 9 September 2026
- Canonical academic paper records: 19 distinct publications (`/scholar/p01.html`–`/scholar/p19.html`).
- Legacy P16 duplicate PDF is intentionally retained for backward compatibility but is excluded from canonical counting and Scholar record logic.
- WPA Working Papers: 13 canonical Scholar records (`wpa-wp-001`–`wpa-wp-013`).
- WPA Protocol Notes: 9 canonical Scholar records (`wpa-pn-001`–`wpa-pn-009`).
- `/scholar/` is a dedicated index page and is not a publication record.
- Academic `citation_pdf_url` values point to existing full-text PDFs under `/papers/`.
- WPA series records expose DOI metadata without inventing unconfirmed local PDF URLs.
- Scholar sitemap, BibTeX and RIS exports use the canonical `https://worldprotocolacademy.mk` domain.
- WPA Working Papers and Protocol Notes are separate research-series records and are not counted among the 26 academic publications.
- No formal peer-review claim is added to WPA Working Papers or Protocol Notes.

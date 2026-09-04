# WPA 24/7 Product Factory

This layer converts three existing WPA systems into a continuous production chain:

1. **WPA Watch** — public RSS/Atom signal intake.
2. **WPA Academic Search / live scholarly harvest** — official/open metadata discovery through OpenAlex, Crossref and Zenodo.
3. **WPA Journal Watch** — editorial classification and research-angle generation.
4. **WPA Product Factory** — finished, versioned web/JSON work products.

## Automatic product families

- `products/dailyBrief.html|json` — WPA Daily Protocol & Diplomacy Brief.
- `products/diplomacyRadar.html|json` — WPA Protocol, Diplomacy & Institutional Signals Radar.
- `products/academicRadar.html|json` — WPA Academic Research Radar.
- `products/editorialDossiers.html|json` — WPA Editorial Dossier Pack.
- `products/sourceAudit.html|json` — WPA Source & Pipeline Audit.
- `products/manifest.json` — machine-readable product catalogue.

## Continuous operation

`.github/workflows/wpa-product-factory.yml` runs every three hours and can also be dispatched manually. It refreshes public-source signals, harvests open scholarly metadata, rebuilds Journal Watch, generates all product families, validates outputs, and routes changes through the repository's protected-branch pull-request process. The workflow attempts auto-merge only after repository checks permit it; otherwise the protected PR remains available for human merge.

## Human Authority boundary

The products are genuine research/editorial work products in their stated status, but they do **not** autonomously become scientific journal articles, official institutional positions, peer-review decisions, rankings, or governmental assessments. Public-source facts, scholarly records and final interpretations remain subject to the validation level stated on each product.

No paywall bypass, login-restricted scraping, surveillance, investigative use, or hidden-source collection is introduced by this factory.

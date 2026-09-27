# WPA Global Institutional Knowledge Harvester

**Status:** LIMITED PRODUCTION · HUMAN-GOVERNED

This module operationalises the existing WPA Public-Evidence Agent Protocol, Institutional DNA Reuse Layer and Global Scholarly Knowledge Layer across the current REV7 institutional universe.

## What it does
1. Builds a controlled queue from the canonical REV7 Master List.
2. Prioritises direct protocol/diplomacy institutions and verified/corroborated records.
3. Registers public or authorised documents (PDF, handbook, curriculum, article, report, policy, annual report, etc.).
4. Applies a rights/access gate before any text processing.
5. Produces **core-essence candidate notes**, not copied curricula.
6. Routes institutional practices into Practice Atom review and scholarly works into Scholarly Knowledge Atom review.
7. Preserves source URL/identifier, institution, retrieval date, access basis, page/section locator, limitations and Human Gate state.

## Rights model
Full-text processing is permitted only for OPEN_ACCESS, PUBLIC_DOMAIN, OPEN_LICENSE, AGREEMENT_ON_FILE or MANUALLY_AUTHORISED material. Public web pages can support source-bounded factual/practice extraction, but are not mirrored. Restricted sources remain discovery/manual-verification only.

Institutional inclusion in the Master List does **not** itself prove reuse permission. If WPA has a direct agreement, record the agreement/permission ID in the rights register before treating the document as AGREEMENT_ON_FILE.

## Public repository rule
Never commit third-party full text to this public repository. Store metadata, provenance, derived WPA summaries/atoms and rights-safe evidence notes. Any full-text RAG store must live in an appropriately governed private/runtime layer.

## Processor
`institutional_knowledge_harvester.py --build-queue` creates a queue from REV7.

`institutional_knowledge_harvester.py --document-url URL --institution-id A001 --access-basis OPEN_ACCESS` processes one direct public/authorised document URL into a provenance receipt and deterministic pre-extraction candidate. It does not publish or approve the result.

Use `--dry-run` for CI/safety validation.


## Citation & reference rule
No extracted knowledge may become reusable WPA knowledge without a reference trail.

For books, PDFs and scholarly papers, the processor preserves or requests:
- author or corporate author
- exact title
- publisher / institution
- publication year/date
- edition/version where relevant
- DOI / ISBN / ISSN when available
- original URL
- retrieval timestamp
- access basis / rights note
- exact page or section locator for material evidence when technically available

A publicly accessible PDF is not automatically treated as an open licence. `PUBLICLY_ACCESSIBLE_ANALYSIS_ONLY` allows bounded internal analysis of an explicitly allowlisted public document, while preventing automatic republication of the full work. WPA publishes its own synthesis and appropriately attributed limited quotations unless broader reuse is expressly permitted.

Unverified or incomplete metadata is never guessed. It remains `REFERENCE_VERIFICATION_REQUIRED`.

Canonical policy: `/data/wpa-citation-reference-policy.json`.

## Quiet scheduler
After merge to `main`, `.github/workflows/institutional-knowledge-scheduler.yml` runs once daily at 03:47 UTC. It processes at most three explicitly allowlisted sources by default, spaces requests, never recursively crawls the web, and uploads a temporary human-review artifact instead of committing third-party full text.

The scheduled run stops at `REVIEW_REQUIRED`; no derived knowledge is automatically approved or published.

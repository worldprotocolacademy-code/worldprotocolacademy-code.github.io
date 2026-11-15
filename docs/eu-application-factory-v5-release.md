# EU Application Factory v5 — source and release notes

**Date:** 15 November 2026  
**Scope:** replace the non-functional landing page at `/tools/eu-application-factory.html` while preserving the existing WPA header CTA and its `#idea` destination.

## Operational behaviour (verified locally)

- Input: free-text project, optional TXT/MD/HTML/JSON/CSV document, optional user-supplied call ID/link, applicant and timing.
- Output: an actual same-page ranking from a **dated** official-source registry, binary eligibility and timing blockers, source links, diagnostic trace, 17-part application draft, downloadable Markdown and JSON.
- Priority 0: Ohrid Protocol Conference 2027 and WPA Journal one-click test cases.
- Local draft save/restore/erase only on explicit click.
- **No automatic navigation to Virtual Sande.** The tool never forwards inputs to an AI provider.
- Critical binding actions remain behind a Human Gate.

## Source truth and limitations

- `/data/eu-application-factory/opportunities-v1.json` is a dated index *verified as of 2026-11-15*. It is not a live grants API.
- OPEN_AT_SNAPSHOT, INDICATIVE_2027, PROGRAMME_ROUTE, ROLLING_ASSISTANCE, and DISCOVERY_ONLY are deliberately distinct.
- Actual 2027 Erasmus+ Cooperation Partnership call documents and deadlines were not verified in this release. The 2027 annual work programme is not itself an open topic call. The 2026 guide is a precedent only.
- No undocumented applicant legal entity, partners, PIC/OID, grant amounts, approvals, start dates or co-financing are claimed.
- Neither image/PDF parsing nor live official-page crawling is implemented here. The upload control supports TXT/MD/HTML/JSON/CSV. PDF must first be converted to text.
- LLM-generated call-specific Part B, official budget worksheet population, portal submission and hands-off autonomous background monitoring require a separate trusted runtime or scheduled official-source ingestion, with appropriate authorization and real QA. They are **NOT** falsely claimed as features of this public static workbench.

## Test record

- Node deterministic core: 12/12 PASS.
- Chromium desktop: six routes, status/rules, 17-part dossier, download MD/JSON, user call, local save/restore/delete, document import and no Virtual Sande redirect: PASS.
- Chromium mobile (390 x 844): journal test, dossier and no horizontal overflow: PASS.
- JavaScript page errors in tests: 0.
- Tests ran in a Chromium local static-page fixture using an intercepted JSON fetch because this execution container blocks direct Chromium navigation to localhost/external domains; **live-host rendering is not yet verified here**.

## Human Gate / rollback

- Inspect PR quality checks, then merge after user-authorized release process.
- To roll back, revert the merge of this release on `main`. The home header CTA stays intact and can still point to the previous workbench.

## Official documentation

- https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis
- https://erasmus-plus.ec.europa.eu/resources-and-tools/documents-and-guidelines/2027-annual-work-programme-erasmus
- https://erasmus-plus.ec.europa.eu/programme-guide/part-b/key-action-2/cooperation-partnerships
- https://commission.europa.eu/funding-and-tenders/find-funding/eu-funding-programmes/citizens-equality-rights-and-values-programme/citizens-equality-rights-and-values-programme-overview_en
- https://enlargement.ec.europa.eu/funding-technical-assistance/taiex_en
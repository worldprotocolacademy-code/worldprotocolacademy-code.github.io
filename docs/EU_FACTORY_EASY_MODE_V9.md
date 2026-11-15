# WPA EU Application Factory v9 — Лесен режим за секого

Date: 2026-11-15. Status: tested release candidate (separate from proof of production deployment).

## Acceptance goal

A person who has never written a grant application, including a farmer in North Macedonia using a mobile phone, should be able to **start a credible application-preparation process** without EU jargon and without a paid consultant. No tool can guarantee a successful award, formal eligibility, or submission; official calls and evaluation remain authoritative.

## What actually works

- New default simple mode, one question per screen: (1) choose the project area, (2) describe the need in ordinary words, (3) optional applicant-type declaration and rough budget in MKD or EUR.
- Budget is only an estimate. Never silently convert MKD into EUR or treat a user estimate as verified financing.
- User-directed initiation of the existing deterministic grant matcher, with source-snapshot limitations.
- Output: readable Macedonian initial plan and checklist, official source links, actual local work-dossier from v5, and a downloadable UTF-8 TXT summary for use with advisors/agency.
- Advanced existing intake remains intact in a closed disclosure, not deleted. All prior WPA Multi-AI / WPAWS / Mistral / Monetization panels remain accessible.
- Explicit save / load / delete in *browser local storage only*, with a 30-day expiry. No automatic persistence, remote server storage, provider model invocation, payments, document upload, or official submission.
- Mobile keyboard microphone may offer dictation; this app itself does not capture audio or guarantee built-in speech recognition.

## Agriculture source discipline

- IPARD III Measure 1 is **only a programme route**, NOT evidence that a call is open.
- National Rural Development 2026 is a separate domestic programme, not the same pot of EU funding.
- The only authoritative current application documents are the actual national Agency call + measure-specific guide; historical Measure 1 call no.01/2025 closed 29 March 2025.

Official sources checked 2026-11-15:

- European Commission, Applying for IPARD III funding: https://agriculture.ec.europa.eu/international/international-cooperation/enlargement/pre-accession-assistance/apply-funding_en
- IPARD North Macedonia FAQ: https://ipard.gov.mk/mk/cpp/
- AFSARD IPARD programme/calls: https://www.ipardpa.gov.mk/en/Home/Ipard/5
- AFSARD National Rural Development 2026: https://www.ipardpa.gov.mk/mk/Home/RuralenRazvoj/11

## Strict truth boundary

The on-page result is **DRAFT / NOT SUBMITTED / ELIGIBILITY UNVERIFIED**. Do not mark a farmer, natural person, company or WPA platform legally eligible without the exact current call and evidence. Do not invent funding percentages, award amounts, legal IDs, contracts, partners, business registration or grant success. Human Gate before any binding legal or financial act.

## QA summary

- Existing deterministic EU core tests: 12/12.
- Existing media / WPAWS agent bridge tests: 14/14.
- Existing financial scenario tests: 20/20.
- New simple-wizard tests: 18/18.
- Total Node tests: 64/64 PASS.
- Chromium desktop 1360 x 900 and mobile 390 x 844: full farm walkthrough, analysis and dossier, readable and downloadable Cyrillic TXT summary, save/restore/delete (mock browser storage in opaque origin), advanced mode retained, six match cards including IPARD, zero JS page errors, zero horizontal overflow. Browser test used injected first-party source JSON because the container blocks loopback navigation. Does not prove live domain delivery or integration with a government submission portal.

## Files and rollback

- `tools/eu-application-factory.html` — simple wizard and progressive disclosure.
- `tools/assets/eu-factory-easy-wizard-v9.js` — local-only user journey.
- `data/eu-application-factory/opportunities-v1.json` — IPARD programme route and domestic rural development discovery route.
- `tests/eu-factory-easy-v9.test.cjs` — independent invariants and truth checks.
- `.github/workflows/eu-application-factory-v5-qa.yml` — CI coverage of new wizard.

Revert this PR to restore previous v8; canonical WPAWS agents, 80 seats and AI Council remain untouched.
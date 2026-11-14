# WPA Protocol Living Lab · v0.1 PILOT

**Status:** repository pilot / candidate for human-reviewed release, NOT an independently validated scientific standard.  
**Owner:** World Protocol Academy (WPA) independent digital educational, research and authorial platform.  
**Authorial methodology:** Смиљанова синтеза and Protocolometry.  
**Date:** 2026-11-14.

## Purpose

Deliver one evidence-to-decision teaching product rather than six disconnected promotional modules:

`Official source → Case Atlas → Fictional decision → Pedagogical Protocolometry feedback → Human Gate → Reviewable research output`

## Deliverables

- `index.html`, `lab.css`, `lab.js`: responsive accessible MK/EN case explorer, 3 interactive scenarios, immediate explanations, local result export, source graph explorer
- `cases.json`: 12 documented event/practice entries tied to 4 official primary-source families
- `scenarios.json`: 3 fictional simulations, 9 steps and pre-declared four-dimension scoring rubrics
- `evidence-graph.jsonld`: 22 nodes linking official sources, case records, fictional scenarios and methodology/report
- `methodology.html`: candidate Protocolometry Scientific Standard v0.1
- `report-2026.html`: **pre-publication evidence baseline**, not a global report with invented results
- `credential-gate.md`: Open Badges 3.0 readiness plan, issuance strictly inactive
- `scripts/verify_protocol_living_lab.py`: deterministic content and safety validator
- `.github/workflows/protocol-living-lab.yml`: CI for dataset, graph and JavaScript syntax.

## Evidence discipline

Six **DOCUMENTED_EVENT** entries are dated state visits listed by the Royal Household. Six **DOCUMENTED_PRACTICE** entries are based on published IOC, UN Protocol and Vienna Convention materials. All **teaching questions and simulated incidents are WPA-authored**, explicitly fictional where relevant.

The four source families are not four independent confirmations of each case; see `cases.json` for per-record source IDs. Source-linked does not equal peer-reviewed or universally applicable. Independent editorial and scientific review is still required.

## Privacy, security, and technical architecture

- Static HTML/CSS/JS, local JSON, no external scripts, no accounts, no storage, no cookies, no backend or AI API calls.
- User choices remain in browser memory; optional TXT export is created locally by Blob; no response is transmitted.
- Source links are allowed only to a small explicit set of HTTPS hosts.
- Text is rendered via textContent, never by assigning untrusted HTML.
- Accessible focus, labelled controls, live feedback and reduced-motion handling.
- This pilot does not gather real-life case reports, personal data, medical, law-enforcement or security-sensitive details.

## Acceptance gates

- [x] 12 source-linked entries with separate event and practice classes (source data)
- [x] 3 fictional scenarios × 3 questions × 3 choices with 4 scoring dimensions
- [x] local on-device result export, no identity or score submission
- [x] methodology, limitations, corrections and Human Gate visible
- [x] graph and annual-report baseline published as candidate artifacts
- [ ] CI complete on exact PR head and all required checks successful
- [ ] manual browser QA on mobile and desktop
- [ ] independent specialist fact-check of all 12 entries
- [ ] independent methodological/psychometric review
- [ ] pilot with real consenting learners after privacy and consent review
- [ ] human-authorised merge/publication and post-merge runtime verification

## Next release gates (not promises or completed work)

**Corpus gate (first development stage):** extend sources beyond the UK/UN/IOC sample; version the inclusion/exclusion rules, editorial case record and metadata.

**Pilot gate (second stage):** run accessibility testing, inter-rater reliability and learner comprehension tests; publish uncertainty.

**Review gate (third stage):** obtain genuine independent reviewer decisions and methodological amendments; only then consider a scholarly report or validated assessment claims.

## Local development

Serve from repository root over HTTP, e.g. `python3 -m http.server 8080`, then open `http://localhost:8080/protocol-living-lab/`. The browser loads sibling JSON files using relative `fetch`; do not test through `file://`.

Validate: `python3 scripts/verify_protocol_living_lab.py` and `node --check protocol-living-lab/lab.js`.

## Release / rollback

Only source-controlled files in this directory and a single optional link from `institute.html` are affected. Rollback is the revert of the feature PR merge commit; this project has no database migrations or persistent user data.

**Human Gate:** publishing the draft to `main` requires explicit approval and completed CI; activating credential issuance, external partnerships, legal attestations, real learner data collection or academic validity claims requires separate authorisation.

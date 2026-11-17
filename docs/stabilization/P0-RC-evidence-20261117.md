# WPA & WPA Institute — P0 Integration Release Candidate Evidence

**Evidence date:** 17 November 2026 (Europe/Skopje)
**Product mode:** PP-12 RESCUE · staged release candidate, **NOT LIVE/RELEASED**
**Draft PR:** https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/pull/706
**Exact audited PR head (before this documentation-only commit):** `2237bf9adc541808e62e666d7b036ceabdab9d85`
**Protected baseline/main:** `1e172c53539f787edb7185f9ceffaaf6feb3a7f9`
**Rollback reference:** `backup/wpa-pre-stabilization-20261117`

This is a factual evidence inventory, not an assertion of production readiness or external legal/academic approval. Subsequent commits require fresh exact-head CI before release.

## 1. Executive decision

**STATUS: P0 CANDIDATE TESTED LOCALLY — RELEASE / LIVE BACKEND NOT VERIFIED.**

At the recorded head, GitHub reported **31 check runs: 30 SUCCESS, 1 neutral/skipped, 0 FAIL, 0 PENDING**. This is not a production deploy, and CodeQL success does not establish whole-site legal/security conformity.

**Human Gate:** Draft PR #706 remains unmerged. PRs #701 (metrics), #702 (brief), #704 (mobile/consent), #705 (Virtual Sande) supply the underlying changes; do not independently merge the four after #706 because that would create duplicate changes. PR #703 is an earlier overlapping mobile draft and needs explicit closure/archival only after confirming full replacement. PR #707 is a separate favicon/PWA change — **not** included in #706 and **not deployed**.

## 2. Canonical metrics — before/after truth

| Item | Main current canonical JSON before change | Draft PR #706 after change | Evidence |
| --- | --- | --- | --- |
| Academic total | 27 | 27 | Cross-checked canonical JSON and build-time renderer |
| Monographs/manuals | 6 | 6 | Two canonical JSON sources |
| Doctoral dissertations | 1 | 1 | Two canonical JSON sources |
| Papers/contributions | 20 | 20 | Two canonical JSON sources |
| Public Zenodo records (separate corpus) | 25 | 25 | Two canonical JSON sources |
| Working Papers | 15 | 15 | Two canonical JSON sources |
| Protocol Notes | 9 | 9 | Two canonical JSON sources |
| Global Strategic Plan | 1 | 1 | Two canonical JSON sources |
| Some pre-JS `papers.html` presentation | Historical 25/12/2 visible | 27/15/9 | Draft HTML source and regression |
| Old runtime `26/19` overwrites | Present in legacy paths | Selected harmful execution paths disabled/retired; old source preserved | Draft diff and targeted regression |

The academic corpus equation is **27 = 6 + 1 + 20**. The separate Zenodo corpus equation is **25 = 15 + 9 + 1**. Do not add Zenodo records to academic total or imply every DOI is independently peer-reviewed.

**Build-time architecture:** `scripts/render_canonical_public_metrics.py --check` verifies 12 annotated static HTML metric fields and four MK/EN locale sources against the two canonical JSON files. A `--write` command is available for source-controlled regeneration. Build-time values are committed to static HTML; no newly introduced browser-side DOM-overwrite script is used. All other older mutation paths need a wider call-graph audit before claiming complete retirement.

## 3. Exact CI and browser evidence

| Test / branch evidence | Actual result | Explicit limitations |
| --- | --- | --- |
| Integrated PR #706 exact head | 30 SUCCESS, 1 neutral, zero failures/pending | Draft, not production |
| Canonical metrics CI | PASS; 12 HTML markers, 4 MK/EN locale sources, zero diff | Does not exhaustively evaluate every translated page |
| Brief Builder | **939 deterministic assertions PASS** across **84** (2 locales × 7 purposes × 6 domains) combinations | Node VM contract test; not full visual/manual browser QA |
| Mobile/menu/consent browser | **175 PASS, 0 FAIL**, **28 screenshots** | Locally served PR candidate; synthetic analytics config |
| Viewports | 320, 360, 390, 768, 1440 px | Local automated Chromium only |
| Axe WCAG 2/2.1 A/AA | MK Home at 390 px: zero reported violations in this run | Not proof of zero across Institute, EN, all breakpoints or manual keyboard |
| Google Analytics gating | No GA4 before consent; accept/reject/settings branches tested | Tag-loader and configuration intercepted in the QA runner; live Google/network behaviour unverified |
| Virtual Sande source identification | **54 PASS, 0 FAIL**, **6 screenshots** | Synthetic/mock health/model/fallback; **real production endpoint response UNVERIFIED** |
| Static Canonical Truth, i18n, Site Quality, security-gate, CodeQL | SUCCESS on same head | Not independent content review or comprehensive pen test |
| CodeQL | Success; no new alerts on code changed by PR | Existing repository alerts require separate review |

**GitHub Actions evidence — public authenticated project viewer:**

- P0 browser test run: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/runs/44070711685
- P0 screenshots, axe and network artifact: run above, artifact `wpa-p0-mobile-consent-browser-evidence` (artifact ID **14322353248**, 5,059,804 bytes as reported by GitHub).
- Virtual Sande source-state test: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/runs/44070711556
- Virtual Sande screenshots/report artifact: that run, `wpa-virtual-sande-source-truth-qa` (artifact ID **14322551471**, 477,425 bytes).
- Canonical metrics: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/runs/44070711686
- Brief Builder locale: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/runs/44070711656
- CodeQL on the PR: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/pull/706/checks

**Do not claim these screenshots were manually inspected** just because GitHub stored them. The automation confirmed their creation; independent visual review should accompany release approval.

## 4. Change log and file ownership

| Phase | Modified / created owners | Why |
| --- | --- | --- |
| Phase 0 | `docs/stabilization/README-20261117.md`, `script-inventory-20261117.json` | Repository and risk baseline, rollback reference; no route deletion |
| Phase 1A | `scripts/render_canonical_public_metrics.py`, canonical test/CI, `index.html`, `en/index.html`, `institute.html`, `papers.html`, `bibliography/index.html`, `wpa-services.html`, old mutators and scope checks | Stop old 26/19 overwrites; source-controlled public metrics |
| Phase 1B | `index.html`, `scripts/wpa-analytics.js`, mobile/consent browser test + CI; related old performance/practical entrypoints | MK-first mobile navigation and explicit consent with responsive/keyboard assertions |
| Phase 1C | `scripts/virtual-sande-public-widget.js`, `scripts/virtual-sande-institute-widget.js`, browser test + CI | Distinguish verified LLM answer, local answer, unavailable and connection unverified |
| Phase 1D | `wpa-translator.js`, Brief Builder test + CI | Separate `locale`, `route`, `languageLabel`; fully localised result; no auto-send |
| Separate Phase 3 candidate | PR #707: `favicon.ico`, `index.html`, `institute.html`, favicon integrity CI | Root favicon and PWA icon links; **not** part of the combined P0 change |

**Deleted pages/routes:** NONE.
**Uncontrolled new runtime patches:** NONE introduced in this P0 integration.
**Secrets/credentials committed:** Not indicated by the inspected PR file list; CI security-gate PASS, but secrets inventory is a separate audit.

## 5. Unresolved verification and risks

- **Production Virtual Sande is NOT VERIFIED.** A local test can verify response classification, retry and timeout, not provider/Worker availability, correct credentials, actual source provenance or global outage. Do not show LIVE until a verified production LLM response.
- **Public HTTP, console and failed-request evidence** cannot be inferred from the local browser test. Production origin was not checked in these CI jobs.
- **Service-worker cache/update/offline behaviour** not verified in the browser QA (service workers were blocked during tests). Stale governance content remains a release risk.
- **Protocol Stress-Test complete/restart**, site-wide internal routes/fragments, sitemap/hreflang equivalence, cross-locale visual parity and exhaustive MK/EN Home/Institute before/after JS remain incomplete or out of scope.
- **Axe coverage** only one MK Home viewport; full-site WCAG target, actual manual keyboard audit, colour contrast review and screen-reader checks remain open.
- **CSP/security headers** have not undergone report-only observation on the public host; HSTS/subdomain readiness not proven. Enforcement is NOT authorised.
- **Root favicon/PWA** is in separate draft PR #707. Root `/favicon.ico` was missing in the previous repository tree; live 404 still requires actual HTTP verification.
- **Full legacy script retirement** and clean 5-path Home information architecture are still Phase 2. The draft retains historical scripts to avoid route/data loss.
- **Privacy/data processing facts** (controllers, processors, recipients, transfers, legal basis, retention and formal response SLAs) are not established by these tests. Do not invent them.

## 6. HUMAN_INPUT_REQUIRED

| Topic | Required evidence / decision |
| --- | --- |
| Legal controller and institutional status | Confirm accurate responsible person/entity and contact on privacy/rights pages |
| FormSubmit and email processor arrangements | Confirm contracts, data transfers, access, lawful basis and retention |
| GA4 | Confirm measurement ID ownership, provider terms, lawful consent model, retention and country-specific legal requirements |
| AI/Cloudflare Workers | Confirm processors, log policies, routing, disclosure and retention before high-stakes/private inputs |
| Rights, takedown and correction | Confirm accountable recipient, intake identifier system, sustainable response-time commitment |
| Claims about partnerships, credentials, ISSN/DOI/indexing and enrolment | Official supporting evidence and separate Human Gate before any claim or activation |
| Production backend | Authorised health/response proof with timestamp, target environment and redacted runtime evidence |
| Production security headers | Independent HTTP capture, CSP report-only findings and HTTPS/subdomain inventory |
| Human Gate for release | Explicit review/approval of the final exact-head PR and rollback plan |

## 7. Rollback / deployment discipline

1. **Before merge**: keep `main` at its verified SHA and draft changes on `integration/wpa-p0-stabilization-20261117-rc`. Compare PR Files against the baseline backup branch `backup/wpa-pre-stabilization-20261117`.
2. **If human-approved to merge later**: require exact-head checks after final docs/changes and all required statuses passing; note the actual merge SHA.
3. **If regressions after merge**: `git revert <verified merge SHA>` in a guarded hotfix PR; verify Home/Institute and public routes, reverse any CDN/cache issues and re-run CI. No database migration is introduced by this package.
4. **Never** force-push main, suppress a failing required check, delete historical routes, or automatically activate credentials, payments, AI publishing, journal acceptance or AAB attribution.

**Release decision:** P0 integration code and simulated/local tests are documented. **Do not declare full WPA stabilisation finished or production backend live.** Phases 2–5 remain gated, and P0 public-production evidence is incomplete.

# WPA Kimi Audit Implementation Register — 12 November 2026

**Scope:** controlled implementation of the external Kimi content/institutional/methodological/UX audit into the WPA public repository.
**Release discipline:** implementation evidence is separated from external validation. This register does not claim legal approval, accreditation, independent methodological approval, AAB constitution or production activation where those events have not actually occurred.

## Status legend

- **IMPLEMENTED** — repository/public wording or governance architecture has been changed.
- **ALREADY EXISTED / CONSOLIDATED** — the requested control already existed; this pass improved discoverability or consistency instead of duplicating it.
- **HUMAN GATE / EXTERNAL DEPENDENCY** — cannot truthfully be completed by code or AI alone.
- **HISTORICAL STATE PRESERVED** — dated historical material remains unchanged where it was accurate at publication time.

## A. Canonical metrics and publication truth

| Audit point | Status | Evidence |
|---|---|---|
| 27 academic publications = 6 monographs/handbooks + 1 doctoral dissertation + 20 scientific papers/contributions | IMPLEMENTED before v2 | `/bibliography/`, `/data/wpa-canonical-metrics-status.json` |
| 25 Zenodo records = 15 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan | IMPLEMENTED before v2 | `/working-papers/`, `/data/wpa-canonical-metrics-status.json` |
| Separate academic-publication and Zenodo corpus totals | IMPLEMENTED | `/wpa-metrics-status.html`, `/corrections-register.html` |
| DOI must not be treated as proof of peer review/validity | IMPLEMENTED | `/governance-and-status.html`, `/publication-metadata-standard.html`, `/bibliography/` |
| Future metadata consistency | IMPLEMENTED | `/publication-metadata-standard.html` |
| Historically accurate old corpus counts | HISTORICAL STATE PRESERVED | historical publications remain dated evidence rather than being retroactively rewritten |

## B. Institutional identity, legal/status boundaries

| Audit point | Status | Evidence |
|---|---|---|
| WPA / Institute hierarchy simplified | IMPLEMENTED | `/index.html`, `/institute.html` |
| WPA is not a university/state academy/accreditation/degree body | IMPLEMENTED / ALREADY EXISTED | `/governance-and-status.html`, `/wpa-metrics-status.html`, public disclaimer surfaces |
| Supplementary-activity consent is not WPA accreditation/registration/endorsement/recognition | IMPLEMENTED | `/institute.html`, `/wpa-metrics-status.html`, canonical JSON |
| AAB shown as in formation, not constituted | IMPLEMENTED | `/institute.html`, `/aab-governance.html` |
| Formal AAB constitution with real accepted members/COI/public-listing consent | HUMAN GATE / EXTERNAL DEPENDENCY | must occur through real written acceptance and governance procedure |

## C. Public status vocabulary and technical complexity

| Audit point | Status | Evidence |
|---|---|---|
| Six simple public statuses | IMPLEMENTED | ACTIVE · LIMITED ACTIVE · BETA/PILOT · IN DEVELOPMENT · PLANNED · FROZEN in `/governance-and-status.html`, `/wpa-metrics-status.html`, canonical JSON |
| Internal technical labels kept subordinate to public meaning | IMPLEMENTED | governance/status pages and machine-readable source |
| Trust Layer status aligned with active core + development | IMPLEMENTED | `/institute.html`, locale resources |
| WPAWS status aligned with active working version + progressive development | IMPLEMENTED | `/institute.html`, locale resources |
| Public technical architecture reduced on main navigation | IMPLEMENTED | six-entry navigation on `/index.html` and `/institute.html` |
| Existing specialist technical pages retained | INTENTIONAL | advanced systems remain accessible without dominating primary navigation |

## D. Protocolometry and Institute Index

| Audit point | Status | Evidence |
|---|---|---|
| “Protocol is absolute” preserved as authorial maxim, not measurement proof | IMPLEMENTED | `/institute.html`, `/protocolometry-center.html`, `/protocol-notes/`, embeddable identity component |
| Clear purpose/unit of analysis | IMPLEMENTED | `/wpa-institute-index-lab.html` |
| Inclusion/exclusion rules | IMPLEMENTED as publication requirement | Index methodological-publication standard |
| VERIFIED/CORROBORATED/NOT EVIDENCED distinction | IMPLEMENTED | Index standard + governance glossary |
| Minimum evidence threshold | IMPLEMENTED as release criterion | Index standard/readiness gates |
| Reviewer/date/version traceability | IMPLEMENTED as release criterion | Index standard |
| Duplicate/alias/successor handling | IMPLEMENTED / ALREADY EXISTED | `/MASTER-LIST-CANONICAL.md` and revision controls |
| Missing data != zero | IMPLEMENTED | Index standard |
| Normalisation rule required | IMPLEMENTED | Index standard |
| Language/geographic bias testing | IMPLEMENTED | Index standard + G09 readiness control |
| Weight sensitivity/robustness | IMPLEMENTED | Index standard + G06 readiness control |
| Interpretation limits | IMPLEMENTED | Index lab/governance/disclaimer |
| Periodic re-check/stale evidence | IMPLEMENTED as methodology requirement | Index standard |
| Corrections and appeals | ALREADY EXISTED / CONSOLIDATED | `/wpa-index-appeals-and-corrections.html` |
| Conflict of interest, including WPA internal record | IMPLEMENTED | Index standard + G12 |
| Independent methodological review | HUMAN GATE / EXTERNAL DEPENDENCY | G15 remains a real review gate and must not be marked passed without an external review |

## E. Master List

| Audit point | Status | Evidence |
|---|---|---|
| Explain 250 / 249 / 241 | IMPLEMENTED | `/MASTER-LIST-CANONICAL.md`, `/wpa-metrics-status.html` |
| Neutralise “Leading…” category wording | IMPLEMENTED | `/institute.html`, generator source |
| Avoid implying Protocol Academy of Macedonia is a university | IMPLEMENTED | neutral Group D public wording + explicit D001 note |
| Dataset verification status scoped to dataset, not whole Institute | IMPLEMENTED | `/institute.html` |
| Record-by-record external/source verification | ONGOING GOVERNED WORK | canonical verification workflow; not represented as fully complete unless evidence says so |

## F. Programmes and certification

| Audit point | Status | Evidence |
|---|---|---|
| Official certificate issuance explicitly inactive | IMPLEMENTED | `/certification.html`, homepage FAQ, locales, status pages |
| No automatic worldwide/state/academic recognition claim | IMPLEMENTED | homepage FAQ, `/programme-quality-standard.html` |
| Canonical level 4 = Trainer / Consultant | IMPLEMENTED | programme quality standard + homepage/locales |
| Learning outcomes, engagement, prerequisites, modules | IMPLEMENTED as programme-publication standard | `/programme-quality-standard.html` |
| Assessment type/weights/pass threshold/retake | IMPLEMENTED as programme-publication standard | same |
| Plagiarism and AI-use rules | IMPLEMENTED as programme-publication standard | same |
| Accessibility/accommodations | IMPLEMENTED as programme-publication standard | same |
| Appeal/review | IMPLEMENTED as programme-publication standard | same |
| Holder identity, registry-minimisation, correction/revocation | IMPLEMENTED as future issuance gate | same + certification architecture |
| Question count not used as quality proof | IMPLEMENTED | programme quality standard |
| Real pilot-course evaluation | HUMAN GATE / EXTERNAL DEPENDENCY | requires actual learners, documented outcomes and evaluation |
| Official issuance activation | HUMAN GATE | requires live backend, identity, privacy, verification, revocation and authorised release |

## G. Journal

| Audit point | Status | Evidence |
|---|---|---|
| Journal shown as first-issue preparation / preview not publication | ALREADY EXISTED / CONSOLIDATED | `/journal/index.html` |
| Editorial structure/policy | ALREADY EXISTED / CONSOLIDATED | `/journal/editorial-policy.html`, governance hub |
| Peer-review model and reviewer COI | ALREADY EXISTED / CONSOLIDATED | reviewer guidelines and journal index |
| AI policy | ALREADY EXISTED | editorial/submission policy |
| Author/submission guidance | ALREADY EXISTED | submission policy/forms |
| Corrections and retractions | ALREADY EXISTED / CONSOLIDATED | `/journal/corrections-retractions.html` |
| Appeals/governance status | ALREADY EXISTED / CONSOLIDATED | editorial policies/status pages |
| Financial/fees ethics | ALREADY EXISTED / CONSOLIDATED | `/journal/financial-ethics.html` |
| ISSN/DOI/indexing claims bounded | ALREADY EXISTED | Journal index explicitly withholds claims until factual assignment/publication |
| Actual peer review and publication of Issue 1 | HUMAN GATE / EDITORIAL PROCESS | cannot be simulated by repository text |

## H. Language and editorial parity

| Audit point | Status | Evidence |
|---|---|---|
| Specific Macedonian language errors corrected | IMPLEMENTED v1 | homepage/public locale resources |
| MK/EN governance parity | IMPLEMENTED | active locales, `/en/governance-and-status.html`, `/en/programme-quality-standard.html` |
| Canonical MK–EN terminology | IMPLEMENTED | `/wpa-mk-en-glossary.html` |
| Translation must preserve governance meaning | IMPLEMENTED | glossary parity rule |
| Full parity across every optional language | ONGOING / NOT CLAIMED COMPLETE | priority is canonical MK/EN; other languages remain subject to i18n audit and verified availability |

## I. Navigation and public presentation

| Audit point | Status | Evidence |
|---|---|---|
| Main navigation simplified to six public entries | IMPLEMENTED | `/index.html` |
| Institute navigation simplified | IMPLEMENTED | `/institute.html` |
| Three user paths: learning/research/institutional | ALREADY EXISTED | homepage Quick Start |
| Technical architecture moved beneath advanced/specialist paths | IMPLEMENTED / ALREADY EXISTED | simplified nav + advanced technology disclosure |
| Non-active commercial/certification functions not represented as active | IMPLEMENTED / ALREADY EXISTED | status governance and certification controls |
| Three-tier disclaimer concept | SUBSTANTIALLY IMPLEMENTED | global boundary + contextual notices + full governance/trust/privacy pages; further UI compression may remain a UX refinement |

## J. Privacy, security and legal readiness

| Audit point | Status | Evidence |
|---|---|---|
| Privacy covers data categories/use/email/forms/analytics/commerce/retention/rights | ALREADY EXISTED | `/privacy.html` |
| AI/provider-entry boundary | IMPLEMENTED | `/privacy.html` |
| Student/video/live-room boundary | IMPLEMENTED | `/privacy.html` |
| Minor/guardian gate before child-data collection | IMPLEMENTED as activation boundary | `/privacy.html` |
| Security incident/abuse route | IMPLEMENTED | privacy + security/trust routes |
| Responsible public privacy contact | IMPLEMENTED | privacy page |
| Formal controller/legal basis/fixed retention for future live services | HUMAN GATE / LEGAL DEPENDENCY | must be published before applicable activation |
| Commerce legal/tax/seller/payment review | HUMAN GATE / EXTERNAL DEPENDENCY | explicitly required before activation |
| External security/privacy review | HUMAN GATE / EXTERNAL DEPENDENCY | repository CI is not an external certification |

## K. Public corrections and transparency

| Audit point | Status | Evidence |
|---|---|---|
| Public substantive correction trail | IMPLEMENTED | `/corrections-register.html` |
| Correction request route | ALREADY EXISTED | `/correction-request.html` |
| Journal correction/retraction route | ALREADY EXISTED | journal policy |
| Index correction/appeal route | ALREADY EXISTED | Index appeals page |

## L. Outstanding non-code gates

The following are intentionally **not marked complete** because doing so would fabricate evidence:

1. Formal constitution of the Academic Advisory Board.
2. Completed independent methodological review of the Institute Index / Protocolometry.
3. Real pilot-course delivery with documented learner outcomes and evaluation.
4. Real external security/privacy assessment or certification.
5. Legal/tax review and defined legal seller before commerce activation.
6. Official certificate issuance/backend activation.
7. Final editorial peer review and publication of WPA Journal Issue 1.
8. Any external accreditation, recognition, partnership, indexing or legal status not independently granted.

## Release rule

This implementation register is a repository evidence map. Passing automated CI verifies only the checks actually executed. Merge to `main` and public release remain a separate Human Gate.

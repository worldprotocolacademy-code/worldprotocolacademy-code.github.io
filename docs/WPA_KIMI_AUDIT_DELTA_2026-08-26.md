# WPA Kimi Audit · Delta Remediation Decision Log

Date: 26 August 2026
Status: implemented as guarded delta remediation

## Confirmed and remediated
- Institute footer date: 10 June 2026 -> 26 August 2026.
- Institute stale DOI block: removed hard-coded 15-record / PN-001-PN-003 claim; canonical index is now the source of truth.
- Institute Protocol Notes surface: synchronized to PN-001-PN-009 and PN-009 DOI evidence.
- Official bibliography: 25 -> 26 total; 5 -> 6 monographs/handbooks; the 2026 State Symbols book is added as stable `#pub-26` with ISBN 978-608-66168-5-4 and COBISS.MK-ID 69316613.
- Main WPA and Institute navigation: first-entry menus compressed; content was not deleted.
- Cross-link hierarchy: explicit WPA -> Institute / Journal / learning / evidence gateways added.
- Institute -> programmes, certification, WPA Card, Cultural Diplomacy, Protocol Symbols, Student Desk, Professional English and Audio Media links added as one compact ecosystem gateway.
- Institute contact surface expanded to a small role-based matrix.
- General Terms of Use and a standalone Cookie Policy added; existing Privacy Policy is preserved and cross-linked.

## Audit points already resolved before this remediation
- HGAIM already states the correct academic count: 26 = 6 monographs/manuals + 1 dissertation + 19 papers/contributions.
- HGAIM already uses status discipline and Human Authority; real enrolment, payment and official certificate issuance remain disabled pending approved backend/reviews.
- Privacy Policy already contains substantive privacy, GA4 consent, cookie, retention and data-rights text.
- Main WPA does not need a second full HGAIM specification; Institute remains the canonical detailed HGAIM surface.

## Not applied because the current master does not support the audit claim
- Pilot 20 / WPA Sublimate remediation: those strings were not present in the current Institute master checked on 26 August 2026; nothing was added merely to satisfy an older audit snapshot.
- A new fixed DOI total was not introduced. Fixed counters create the same version-drift problem the audit identified.

## Governing design rule
Content is retained and hierarchised. Public entry noise is reduced. Canonical evidence pages remain the source of truth for changing counts and series.

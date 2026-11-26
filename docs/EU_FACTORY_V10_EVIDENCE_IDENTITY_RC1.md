# EU Application Factory v10 RC1 — evidence and applicant identity

Date: 2026-11-26. Base: PR #741, 340a0d49dc05ac580a106fae82cfe714d661c43c. Stacked candidate; do not merge or deploy before the base PR and owner acceptance. PR #761 remains separate.

## Scope and acceptance
- Keep Easy v9, dated opportunity register, freshness warnings, anti-leakage fixes, existing exports and Human Gate.
- Local PAF project mapping, 13 sectors / 392 displayed indicators, six candidate leads, nine project mappings plus one thematic asset. Source: the PAF public catalogue (https://pafnorthmacedonia.mk/en), snapshot 2026-11-26; brochure claim of 400+ unresolved. No numerical observations supplied.
- Manual review export with real SHA-256 of a user-selected public source. No remote upload, persistence, auto-verification, eligibility override or score bonus. Retain source separately; review against the original publisher before using data. Browser does not certify authenticity, legal permissions, or interpretation.
- User-confirmed WPA Institute is not a registered legal entity as of 2026-11-26. Do not apply this status to unrelated organisations. Legal-entity-required calls block unregistered initiatives and natural persons as direct applicants. A genuine eligible legal partner or a specific personal opportunity must be separately checked. No guarantee of selection or payment.
- Expert participation sources checked 2026-11-26: EU Funding & Tenders Work as an Expert; COST Participate in an ongoing Action; Erasmus+ programme guide. No expert profile, external submission, paid engagement, partner commitment or call refresh executed.
- PAF, personal and institutional routes stay distinct from the original strategic relevance score and official legal eligibility. Public form remains preparation only.

## Verification and release gates
- CI: existing regression tests plus v10 node tests, syntax validation, PAF mapping, export validation, fail-closed identity gates. Browser acceptance still required: mobile/desktop, select every portfolio route, plan export, hash public synthetic test file, invalid evidence rejection, keyboard focus, stale registry warning, no network requests containing project data, generic farmer and generic Ohrid regression.
- PAF full API ingestion, live EU import, actual provider integrations, Application Simulator, and WIIE/Virtual Sande runtime connections are explicitly OUT OF SCOPE for RC1. Separate reviewed changes.
- Human Gate HOLD. Rollback: discard stacked PR / revert only the candidate commit after approved release. No changes to main.

# EU Application Factory — public-truth repair (24 November 2026)

**Mode:** RESCUE. **Status:** DRAFT PR, NOT LIVE/DEPLOYED.

## Independently verified baseline
- Public browser UI is powered by a deterministic registry at `data/eu-application-factory/opportunities-v1.json` with 11 dated entries last verified on 15 November 2026.
- No active model/API provider call or EU Funding & Tenders search takes place during normal user analysis. UI now says so plainly.
- The European Commission maintains an official public REST search API: https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/support/apis . Documentation verified on 24 November 2026, **but a successful live importer run is not yet demonstrated**.

## Fixed in this PR
1. **Project identity isolation.** WPA Journal and Ohrid-specific venue, 150-participant estimates and EUR 17,604.80 may be attached only when the **explicit built-in WPA portfolio demo** is chosen. Typed public projects, including other conferences in Ohrid, receive no WPA internal facts.
2. **Prompt contamination.** The instruction “Дај ми соодветни извори и изгради апликациско досие” is not inserted into an application need or demo.
3. **Skopje clock.** Deadline assessment falls back to the live Europe/Skopje date, with a testable explicit `asOf` override. The registry's 15 November verification date remains as provenance, not an implicit current date.
4. **Honest freshness.** A register older than 7 days shows an explicit warning; no result may be understood as a live match. A deadline passed after the snapshot is rejected even if status was OPEN_AT_SNAPSHOT.
5. **Generic human-readable title.** Wizard sends the user's description and category separately; no truncated `Област: ...` prefix.
6. **Public truthful claims.** The page describes registry matching and unconnected AI roles. Existing exports and Human Gate remain unchanged.

## Out of scope for this P0 repair
- Automatic EU Funding & Tenders API ingestion. Requires verified request/response shape, pagination, status normalization, deadline/facet interpretation, official topic identifiers and source-rights review.
- IPARD and North Macedonia national rural-development feeds: these **must not be falsely represented as grants exposed by the EU Funding & Tenders API**. They need their own verified national official-source adapter.
- Live AI Document Analyst or upload processing: requires explicit file consent, data retention/redaction, provider contract, authentication, cost limits and separate Cloudflare Worker security review.
- Grant eligibility confirmation, funding, signatures or submissions.

## Next isolated workstreams
**P1 — Official radar:** a scheduled ingestion workflow with auditable fetched/verified dates; only official call URLs and safe metadata; no eligibility inference from missing fields; tests for statuses, deadline/timezone, pagination, empty/API-failure and no stale overwrite; separate PR and review. Do not silently overwrite the curated historical registry.

**P2 — Document Analyst:** one private, narrowly scoped model endpoint, activated only after privacy/security/cost/consent gates. A user's uploaded call remains USER-SUPPLIED_UNVERIFIED until the actual official source and rules are confirmed.

**P3 — North Macedonia farmer journey:** first verify live IPARD calls and national assistance at the competent agencies, then map measures to applicant type, sector and investment; preserve NO-GO when conditions are unknown.

**Human Gate:** merging this PR changes the public application wizard and must occur after source/CI review. No external model, calls search or payment activated by this PR.

## Acceptance
- CI: core, public-truth, easy-wizard, and council tests all PASS.
- Generic applicant typed “conference in Ohrid” never receives Inex Olgica / EUR 17,604.80.
- November 24 assessor sees a stale banner for the November 15 data.
- January 14, 2027 assessor sees the IMREG January 13 deadline as expired.
- Dossier “Потреба” never contains the example meta-command.
- Existing document and JSON exports, local privacy and Human Gate remain available.

Rollback: close Draft PR; after merge, revert only this branch's commits.

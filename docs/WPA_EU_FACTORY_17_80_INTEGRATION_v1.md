# WPA EU Application Factory: 17 + Council-80 bridge v1

Date: 2026-11-15. Scope: source-disciplined grant research and WPAWS task **routing**, not model execution.

## Source-of-truth inventory

- WPAWS 17: `/agents.json`; 17 canonical executive role records and prompts. This bridge uses only numbers/names from that register; it does not copy full prompts into grant documents.
- Council-80: `/data/wpa-ai-council-80.json`; **ten pillars with eight capacity slots** each; all default to `pending_approved_directive`. It does **not** enumerate or prove 80 running separate autonomous APIs.
- EU Factory: `/tools/eu-application-factory.html`, `/tools/assets/eu-factory-core-v5.js` and dated EU opportunities; model Council v6 exists separately.
- Human Gate: `/data/wpa-human-gate-policy.json`; public boundary unchanged.

## Working functionality added

1. Official Creative Europe Media Literacy 2027, Journalism Partnerships 2027 and IMREG 2026 routes inserted in the **dated** local opportunity register with country, sector and timeline protections.
2. One-click `CIVIC SIGNAL / Media Literacy` fills the project field and triggers the **actual deterministic grant analysis** of the existing v5 engine.
3. WPAWS Bridge loads and validates both first-party canonical registries. A user can choose Media Literacy, WPA Journal, or Ohrid 2027 and **build an actual downloadable JSON task-routing packet** with selected executive roles, task definitions, bounded Council-80 pillar capacity, evidence/source links and Human Gate.
4. The bridge does **not** create an external AI API run; statuses always say `TASK_PLANNED_NOT_EXECUTED` or `CAPACITY_ONLY_NOT_ACTIVATED` until an authorised backend proves otherwise. No API credentials or document content are sent to other services.
5. Existing WPAWS prompts, provider integrations, editorial independence, doctrine, unrelated content and canonical registries remain unchanged.

## Media project financial accuracy

The EUR 299,600 figure was a **previously drafted illustrative CIVIC SIGNAL project budget**, not an official grant allocation. If accepted as total eligible costs under Media Literacy, EU contribution at 70% = EUR 209,720; other sources needed = EUR 89,880. Maximum allowed EU grant per Media Literacy project EUR 500,000, subject to full call requirements.

- Media Literacy: official Commission `https://digital-strategy.ec.europa.eu/en/funding/call-proposals-cross-border-media-literacy-2027`, deadline 2027-01-20 17:00 CET; 3 independent legal organisations in 3 Creative Europe participating countries, North Macedonia on official participation list. Legal entity and actual partners are UNVERIFIED.
- Journalism Partnerships Collaborations: official `https://digital-strategy.ec.europa.eu/en/funding/call-proposals-journalism-partnerships-collaborations-2027`, deadline 2027-02-04. WPA Journal is **not automatically** professional news-media.
- IMREG-2026-INFOME: official `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/IMREG-2026-INFOME`, deadline 2027-01-13, expected EU grant per project EUR 200,000, ordinarily EU Member State legal entities only; North Macedonia-based WPA **NO-GO as direct applicant**.

## Human Gate and remaining work

- Match exact 2027 call fiche and corrigenda, verify applicant/consortium, funding model, exclusion conditions, costs and declaration annexes.
- To *execute* the routed WPAWS work packet, implement a separately authorised backend endpoint/orchestrator that consumes packet and documents source provenance, provider status, actual execution, spend, idempotency, and independent QA. No such live execution is claimed by this release.
- Browser results are an evidence-aware working draft, not an approved EU grant submission.
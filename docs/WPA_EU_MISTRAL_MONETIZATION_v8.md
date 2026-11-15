# WPA EU Application Factory v8 - Mistral specialists + Monetization Agent

## Scope

A bounded enhancement to the working v5/v6/v7 grant factory. Existing v5 eligibility, v6 provider roster, WPAWS-17 and Council-80 canonical registries are not changed.

## Three Mistral roles

The public page displays three clearly separated **mission types**, governed by the JSON manifest and implemented in `scripts/wpa_eu_mistral_specialists.py`:

1. EU Document Analyst: evidence, call clauses, deadline, eligibility, annex register.
2. European Application Writer: UK English draft, WPs, KPIs, evidence placeholders.
3. Privacy & Compliance Reviewer: GDPR, ethics, accessibility, transparency, COI, review issues.

The page can export a user-approved JSON planning packet. It never sends user-uploaded documents or stores API keys.

On the server, authorised `workflow_dispatch` can run one role via the official **Mistral Agents SDK** if `WPA_EU_MISTRAL_API_KEY`, `WPA_EU_MISTRAL_MODEL` and `WPA_EU_COUNCIL_LIVE_ENABLED=1` are configured. `--live` is also mandatory, and the **official-public-only evidence** must be <=7 days old. Model outputs are `COMPLETED_UNVERIFIED` even on success; no SDK failure is masked as an agent completion.

The Mistral SDK and external model execution are **not guaranteed or enabled by merging**. A key, billing permission, privacy assessment, and authorised model configuration are prerequisites. SDK is in public preview. A static grant page is not a private Mistral deployment.

## WPA Monetization & Sustainability Agent

The public model calculates 12-month illustrative revenue/cost scenarios and cash breakeven from **user-controlled assumptions**. It shows conservative/base/high cases, separate pricing vs costs, and exports `.MD`/`.JSON`. No VAT/tax/payment/refund cost is built in; those require additional verification.

The scheduled weekly server-side planner (Monday 06:35 UTC) reads `data/eu-application-factory/monetization-plan-v1.json`, develops bounded action recommendations for CIVIC SIGNAL, WPA Journal, and Ohrid 2027, and uploads an Actions artifact. It produces no commercial, financial or legal transaction and calls no external AI models. It is a working rules-based proactive agent, **not an autonomously paid AI provider**.

### Required Human Gates

- WPA remains an independent **digital pilot platform**, not a verified legal applicant or active commercial entity.
- No payments, offers, invoices, memberships, subscriptions, sponsorship agreements or grant awards are activated.
- A registered legal person, tax/VAT/payment setup, contracts and appropriate GDPR arrangements must be verified before commercial launch.
- No double funding between grant, event revenue and sponsorship budgets.
- Sponsorship cannot influence WPA Journal peer review, acceptance, editorial conclusions or institutional representation.
- Prices, quantities, demand and annual revenues are **scenario assumptions only**, not validated forecasts.

## End-to-end functional path

1. User enters project; existing local v5 engine ranks dated programmes and creates a working dossier.
2. `wpa-eu-analysis-ready` shares **only project title, kind, tags, official call ID and URL** with local new modules; no private project text or document body is propagated.
3. Mistral mission builder prepares 3 bounded role packets, available for download; does not run a live model.
4. Monetization Agent proactively selects candidate revenue routes and blocks commercial activation. Entering assumptions calculates three scenarios, breakeven, `.JSON` and `.MD` exports.
5. Weekly GitHub Action prepares an internal readiness artifact with legal/finance/ethics blockers and *zero* actual revenue claims.
6. Live Mistral is only possible via the opt-in GitHub Action after SDK, model, secret, source freshness and Human Gate conditions.

## Verification

- 20 Node financial model tests (finite bounds, formulas, no payment actions, no API calls).
- 15 Python agent tests (three roles, official source clearance, fail-closed flags, mock verified server execution, redacted errors, weekly guardrails).
- Existing 12 v5 and 14 v7 EU Factory tests are kept and run in CI.
- Desktop/mobile Chromium browser tests for the combined functional page, if supported in the current tool runtime.
- No user secrets are committed or requested in a conversation.

## Current status

`PLANNING_FUNCTIONAL` for local calculations and role briefs; `PROVIDER_LIVE_NOT_VERIFIED` for Mistral; `COMMERCIAL_NOT_ACTIVATED` for monetization. Final EU Submit and all financial acts remain Human Gate.
# WPA · Privacy Data Map and Institutional Human Input Gate

**As-of:** 17 November 2026  
**State:** INTERNAL AUDIT / DRAFT, not a formal legal determination, privacy notice replacement, consent activation or operational SLA.  
**Boundary:** WPA is an independently operated digital research/education/authorial platform in development and pilot use; do not infer separately established legal-entity status from a website label.

## Data flow inventory (evidence, not legal assumptions)

| Flow | Source evidence | Known mechanics | Verification limit | Human input |
| --- | --- | --- | --- | --- |
| Site contact and `mailto:` | `privacy.html`, `correction-request.html`, `rights-takedown.html` | Visitor explicitly launches email to a published WPA domain address; submitted message content depends on visitor | Actual recipient mailbox, processors, retention, cross-border access and handling times are NOT verified | Controller, recipients, mailbox operator, access controls, retention |
| OPC interest via FormSubmit | `privacy.html` disclosure and relevant OPC forms | Website says the user-submitted form is handled by `formsubmit.co` then forwarded to WPA | Processor contract, actual form payload, lawful basis, anti-spam logs, optional consent and transfer are NOT verified | Processor agreement, data field inventory, legal basis, transfer, retention, cancellation |
| Google Analytics 4 | `scripts/wpa-analytics.js`, `config/analytics.json` | Consent key `wpa.analytics.consent.v1` stored in localStorage; config says consentRequired; runtime gates tag loading on explicit permission and GPC/DNT states | Local browser QA with simulated config and tag loader passed; actual production GA4 network and provider retention not independently tested | Measurement ownership, legal basis, consent text, IP/location rules, retention, provider transfer assessments |
| Virtual Sande questions | `scripts/virtual-sande-public-widget.js`, `scripts/virtual-sande-institute-widget.js`, worker routing source | User prompt is sent to publicly configured Cloudflare Worker `/ask`; widget supports local fallback and status distinctions in draft P0 changes | Production `/health` HTTP 200 checked, but authentic model response, exact inference subprocessors, Worker logs and retention are NOT verified | Privacy notice for prompts, sensitive-input restriction, providers, logs/retention, abuse handling |
| GitHub Pages web hosting | `privacy.html` and repository Pages configuration | Static pages are served publicly; ordinary HTTP requests reach the hosting/CDN infrastructure | Exact infrastructure processors, geographic logs, contracts and retention are not independently established by source code | Hosting controller/processor records, transfer and security procedures |
| Cloudflare and email routing | `privacy.html` states Cloudflare Email Routing may be involved | Domain-level delivery might involve Cloudflare routing before mailbox delivery | This is a website disclosure, NOT independent proof of current routing or legal agreements | Verify actual DNS/mail flow, contract and mailboxes |
| PWA/offline | `sw.js`, `manifest.json`, `wpaws/sw.js` etc. | Browser service workers and caches may store page assets and app data | Update, storage contents, stale governance behaviour and cross-language isolation untested in actual browser | Data retention/update/removal policy, offline governance caching |
| Publications/corrections | `bibliography/index.html`, `correction-request.html` | Public research metadata, source links and corrections requests | Personal-data inclusion in older files and request retention not exhaustively audited | Editorial controller, source correction process, rights/takedown handling |

## Confirmed technical boundaries, with evidence levels

- `VERIFIED SOURCE:` the consent runtime currently has a `granted/denied` key and a choice UI; don't claim third-party production network compliance from source alone.
- `VERIFIED TEST:` PR #706 local Chromium audit validated default/accept/reject/settings under synthetic GA4 configuration, **not** genuine Google tag telemetry: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/runs/44070711685
- `VERIFIED HTTP:` production GET `/health` returned 200 from the Worker on 17 November 2026; no prompt inference was executed: https://github.com/worldprotocolacademy-code/worldprotocolacademy-code.github.io/actions/runs/44075354470
- `UNVERIFIED:` no claim of legal compliance, processor agreements, retention timing, data-protection registration, consent-law applicability or credential-verification rights may be published from this inventory alone.

## Rights, Takedown and Correction readiness

Existing publicly linked pages: `/rights-takedown.html`, `/correction-request.html` and `/privacy.html`. The source says requests are handled in good faith with reasonable editorial capacity. Do not fabricate a receipt ID or response-time SLA. Before a unique ID is displayed or promised, agree who will assign it, its storage, tracking and privacy impact.

**Translation:** MK-first source and EN alternative are editorial requirements. Some source text remains English even under root MK pages; a content-coverage/hreflang inventory is necessary before asserting complete translations. No automatic translation should be treated as final legal text.

## HUMAN_INPUT_REQUIRED — no inferred legal facts

1. Controller: precise legal identity, address, privacy responsible person and contact permitted for publication.
2. Contact/FormSubmit: actual FormSubmit destination and fields, server-side logs, processor contract and transfer mechanisms.
3. GA4: provider contract, property ownership, storage/retention, lawful basis by jurisdiction and verified cookie settings.
4. Workers/AI: log/trace retention, inference backend and processor chain, sensitive-input policy and user disclosure text.
5. Hosting/CDN/mail: vendor terms, actual DNS/email routing, roles and geographic access.
6. Rights/takedown: responsible decision-maker, request verification, correction ledger and feasible response times.
7. Children/minors: whether any services accept minors and the governing consent/access rule; do not activate child-linked data without review.
8. Publication of policies: MK/EN formal editorial/legal review and explicit Human Gate.

**Never activate:** automatic external publishing, enrolment, payments, subscriptions, issued certificates, AAB/peer-review approval, personal data collection expansions or marketing on the strength of this draft map alone.

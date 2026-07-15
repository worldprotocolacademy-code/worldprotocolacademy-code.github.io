# Virtual Sande v35.1 — Final Handoff and GO/NO-GO Gate

Status: **STAGING CERTIFIED / PRODUCTION NO-GO**

This document closes the engineering and evidence phase for Virtual Sande v35.1. It does not authorize or execute a production deployment.

## Certified candidate

- Exact certified source commit: `6a1822ba8e524a454dcf4a038f3d6bc38c3d500d`
- Certification workflow: `Virtual Sande v35.1 Staging Recertification`
- Certification run: `#1`
- Isolated staging URL: `https://wpa-virtual-sande-v35-1-staging.worldprotocolacademy.workers.dev`
- Isolated staging deployment: **PASSED**
- Acceptance suite: **PASSED**
- Legacy POST JSON compatibility: **PASSED**
- Production deployment performed: **NO**
- Production authorized: **NO**

Any later change to the Virtual Sande Worker source, orchestrator, safe entrypoint, staging configuration, public request/response contract, or required bindings invalidates this certification and requires a new same-commit staging recertification.

## Recommended production architecture

The recommended architecture is a **new dedicated production Worker**, not an in-place overwrite of the legacy Worker.

Proposed Worker name:

`wpa-virtual-sande-v35-1-production`

Proposed first production endpoint:

`https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev`

This proposed name and URL are architectural recommendations only. They are not created, reserved, deployed, or approved by this package.

Reasons for the dedicated Worker approach:

1. The legacy Worker source and Wrangler configuration are not present in this repository.
2. Six public consumers currently rely on the legacy `/ask` contract.
3. The certified v35.1 candidate is contract-compatible with the legacy endpoint.
4. A separate endpoint permits production acceptance before any public cutover.
5. Rollback can be performed by restoring the six public consumers to the unchanged legacy endpoint.

## Public migration scope

The current legacy endpoint is:

`https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask`

Direct consumers:

- `index.html`
- `papers.html`
- `wpaws/book/index.html`
- `wpaws/paper/index.html`
- `wpaws/analysis/index.html`

Constructed consumer:

- `wpaws/index.html`

`protocolometry-center.html` uses the same legacy Worker base for other paths and must not be included in the Virtual Sande `/ask` cutover.

## Recommended cutover sequence

1. Resolve the exact Cloudflare account and create a protected GitHub `production` environment with required reviewer approval.
2. Approve the dedicated production Worker name and exact endpoint.
3. Create a separate, reviewed production configuration and manual deployment workflow restricted to `main` and the protected `production` environment.
4. Deploy the exact certified candidate without changing public pages.
5. Run the full production acceptance suite against the new production URL.
6. Open a separate frontend migration PR covering exactly the six Virtual Sande consumers.
7. Verify all six consumers after merge.
8. Keep the legacy Worker available during the rollback window.

## Required production values

The following values remain unresolved and block production:

- Exact Cloudflare account identifier.
- Protected GitHub `production` environment.
- Required production reviewer or approver.
- Final approval of the proposed production Worker name and URL.
- Known-good production deployment identifier after the first successful deployment.
- Exact rollback workflow input or command.
- Explicit written authorization from the repository owner to deploy production.
- Separate explicit approval to migrate the six public consumers.

## Known configuration values

The certified staging candidate currently uses:

- AI binding: `AI`
- Search name: `protocol-ai`
- WPA public root: `https://worldprotocolacademy-code.github.io`
- Journal Live upstream: `https://wpa-live-production-bridge.worldprotocolacademy.workers.dev`
- Allowed origins:
  - `https://worldprotocolacademy-code.github.io`
  - `https://worldprotocolacademy.com`
  - `https://www.worldprotocolacademy.com`
- Default plan: `free`
- Debug mode: `false`

These values must be reviewed again in the separate production configuration PR.

## Production acceptance gate

Before public migration, the exact production URL must pass:

- `/orchestrator/health` success and version `v35.1`.
- Academic agrément answer.
- Multisystem overview.
- Global Institutions `D001` response.
- Journal Live strict search or explicit unavailable mode with `human_review_required: true`.
- Legacy-compatible POST JSON requests with Macedonian, English, and history payloads.
- Unsupported method rejection with `405`.
- Disallowed origin rejection with `403`.
- Oversized message rejection with `400`.
- Excess URL-count rejection with `400`.

## Rollback plan

Preferred rollback is frontend-only and does not require changing the legacy Worker:

1. Restore all five direct consumers to `https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask`.
2. Restore `wpaws/index.html` to the legacy base `https://protocol-bot-workerjs.worldprotocolacademy.workers.dev`.
3. Verify the six consumers against the legacy endpoint.
4. Keep the new dedicated production Worker isolated for diagnosis.

Rollback is mandatory if health, version, contract, CORS, safety, Journal Live, or public-consumer checks regress.

## Final decision

Current decision: **NO-GO FOR PRODUCTION**.

Engineering, staging acceptance, and compatibility evidence are complete. Production remains blocked only by unresolved operational targets, protected-environment controls, rollback identifiers, and explicit repository-owner authorization.

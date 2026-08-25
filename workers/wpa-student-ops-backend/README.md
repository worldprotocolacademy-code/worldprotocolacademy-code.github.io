# WPA Student Operations Backend — HG3 Scaffold v0.1.0

Status: **IMPLEMENTED SCAFFOLD · NOT DEPLOYED · MUTATIONS DISABLED BY DEFAULT**

This Worker is the private operational backend candidate for WPA Student Desk HG3 processes. It is intentionally fail-closed and does not activate enrolment, official assessment records, payments or certificate issuance by merely existing in the repository.

## Architecture

- Cloudflare Worker: API and Human Gate enforcement.
- Cloudflare Access: identity perimeter; Worker also verifies the Access JWT as defence in depth.
- Cloudflare D1: operational records, roles, approvals, credentials and append-only audit events.
- WPA Human Gate Policy: `/data/wpa-human-gate-policy.json`.
- WPA Student Lifecycle: `/data/wpa-student-lifecycle.json`.
- Backend blueprint: `/data/wpa-student-operations-backend-schema.json`.

## Activation invariant

`WPA_BACKEND_MODE` is committed as `DISABLED`. Mutating routes return `503 backend_activation_disabled` until the deployment configuration is intentionally changed to `STAGING` or `PRODUCTION` **after** all activation gates below are completed.

`workers_dev` and preview URLs are disabled in the committed configuration. No database ID, Access audience, secret, token or production credential belongs in this public repository.

## Required activation gates

1. Create a private D1 database for student operations.
2. Apply migrations to a non-production database first.
3. Create a Cloudflare Access application for the private API/admin surface.
4. Configure the allowed identity policy and least-privilege staff groups.
5. Set `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in the deployment configuration outside public source if they reveal sensitive deployment details.
6. Bind D1 as `DB`.
7. Configure the initial administrator identity using a protected deployment variable or seed the `user_roles` table through an authenticated administrative process.
8. Run local and staging tests for authentication, role denial, state-transition denial, audit immutability and certificate double-gate behaviour.
9. Complete privacy review, retention schedule and data-processing documentation.
10. Complete security review and recovery/backup test.
11. Obtain explicit Sande human authorisation for staging activation.
12. Only after staging acceptance, perform a separate explicit authorisation for production activation.

## Human Gate classes

- Application submission: HG1, authenticated and auditable.
- Admission decision: HG3, reviewer/admin human action.
- Official assessment confirmation: HG3, reviewer/admin human action.
- Certificate authorisation: HG3, issuer/admin human action.
- Certificate issuance: HG3, issuer/admin human action **after** a separate authorisation record.

No API route can create institutional authority. Roles are bounded permissions, not doctrine or mandate.

## Current endpoints

- `GET /health` — no sensitive records; reports configuration state only.
- `GET /v1/me` — Access-authenticated identity and roles.
- `POST /v1/applications` — authenticated application submission.
- `GET /v1/applications/:id` — owner or authorised staff.
- `POST /v1/applications/:id/decision` — HG3 admission decision.
- `POST /v1/assessments/:id/confirm` — HG3 assessment confirmation.
- `POST /v1/certificates/:id/authorise` — HG3 credential authorisation.
- `POST /v1/certificates/:id/issue` — HG3 credential issue after prior authorisation.
- `GET /v1/public/certificates/:verificationCode` — minimal credential validity response; deployment must explicitly decide whether this path is outside Access or served through a separate public verification surface.

## Privacy rules

The repository contains schema and code only. It must never contain real student identity records, consent records, assessment records, payment records, credential secrets or Access tokens.

The public certificate verification response intentionally excludes student email and name. Any future public identity display requires a separate necessity/proportionality review and explicit policy decision.

## Payment boundary

Payments are **not implemented** in v0.1.0. Future payment integration must use provider tokenisation; WPA must not store raw card data.

## Certificate boundary

The existing browser certificate module remains preview-only. An official credential can exist only when the private backend has:

1. a human-confirmed passing assessment;
2. a certificate record eligible for authorisation;
3. a separate HG3 human authorisation record;
4. a subsequent HG3 issue action;
5. an append-only audit trail;
6. a unique backend-generated serial and verification code.

## Rollback / emergency stop

The primary emergency stop is to set `WPA_BACKEND_MODE=DISABLED` and/or disable the Cloudflare route/Access application. This blocks all mutating API actions without deleting audit or credential history.

Revocation never deletes a credential audit trail.

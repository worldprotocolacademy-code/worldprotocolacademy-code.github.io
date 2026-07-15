# Virtual Sande v35.1 — Production Readiness Gate

Status: staging accepted; production not authorized.

## Verified staging evidence

- Isolated Worker name: `wpa-virtual-sande-v35-1-staging`.
- Successful staging deployment run: `DEPLOY STAGING — RUN THIS #14`.
- Successful acceptance run: `Virtual Sande v35.1 Staging Acceptance #5`.
- Staging uses `workers.dev` only.
- No custom route, custom domain, KV namespace, D1 database, or public front-end change is present in the staging configuration.
- The Cloudflare API token is stored only as a GitHub `staging` environment secret and is not committed.

## Production safety gate

Production deployment is forbidden until all of the following are explicitly approved:

1. Exact production Worker name.
2. Exact production route or custom domain, if any.
3. Exact production Cloudflare account and environment.
4. Required bindings and non-secret variables.
5. Required secret names, without exposing secret values.
6. Production CORS origin list.
7. Rollback target and rollback command.
8. Post-deployment health and functional checks.
9. Explicit written approval from the repository owner to deploy production.

## Required pre-production checks

- All Virtual Sande CI checks are green on the exact production candidate commit.
- Staging deployment and acceptance are rerun on that same commit.
- Wrangler dry-run succeeds without Cloudflare credentials.
- No production route, domain, secret, KV, D1, or front-end change is hidden in unrelated files.
- The production workflow, when created, must use a protected `production` GitHub environment with required reviewer approval.
- The production workflow must reject execution from branches other than `main`.
- The production workflow must print the deployed Worker URL and run health/version checks before completion.

## Rollback plan

Before production deployment, record:

- Previous known-good production commit SHA.
- Previous known-good Worker version/deployment identifier.
- Exact rollback command or GitHub workflow input.
- Person responsible for approving rollback.

Rollback trigger conditions:

- Health endpoint fails.
- Version is not `v35.1`.
- `/ask` fails the agrément test.
- CORS, method rejection, message-size, or URL-count safety checks regress.
- Journal Live strict mode does not require human review when expected.

## Production acceptance checks

The production acceptance suite must verify, against the exact production URL:

- `/orchestrator/health` returns success and `v35.1`.
- Academic agrément answer succeeds.
- Multisystem overview succeeds.
- Global Institutions `D001` succeeds.
- Journal Live uses strict search or explicit unavailable mode and requires human review.
- Unsupported HTTP methods return `405`.
- Disallowed origins return `403`.
- Oversized messages return `400`.
- Requests with too many URLs return `400`.

## Current boundary

This document authorizes no production deployment. It defines the evidence and approval gates that must exist before a separate production PR or workflow may be created or executed.

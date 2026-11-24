# Virtual Sande AI — Phase S0: Private staging, NO PAID AI
**Date:** 24 November 2026  
**PR:** #743 — source branch `feat/virtual-sande-multimodal-pilot-20261124`  
**Mode:** WPA Product Factory FINISH / guarded STAGING  
**Status:** staged configuration and tests in PR; **NO PUBLIC DEPLOYMENT, NO MODEL CONNECTED**.

## User mandate / goals

The user wants Virtual Sande to become a real, natural-language, proactive *assistant* with image analysis, a PDF Book Lab (protocol, diplomacy, PR, security, communicology and AI) and transparent source-based conclusions. Phase S0 validates the new independent Cloudflare API environment **without spending OpenAI funds or altering the public site**.

## What changes now

- `workers/virtual-sande-multimodal-pilot/src/index.mjs` has a private staging boundary. If `WPA_AGENT_STAGING_ONLY=true`, it requires a server-held `WPA_AGENT_STAGING_TOKEN` before even returning `/agent/capabilities`. No token is exposed to visitors.
- `workers/virtual-sande-multimodal-pilot/wrangler.staging.toml` names the **different** `wpa-virtual-sande-agent-private-staging` Worker, with `WPA_AGENT_STAGING_ONLY=true` and `WPA_AGENT_ENABLED=false`.
- CI validates the staging auth guard with Node tests and performs a **Cloudflare Wrangler dry-run bundle**. No Cloudflare or OpenAI credentials are needed for these tests.
- `.github/workflows/virtual-sande-private-staging-manual.yml` is a **manual** workflow offering `dry_run_only` or `deploy_disabled`. It never enables the model.
- `scripts/verify-virtual-sande-disabled-staging.mjs` verifies the deployed private Worker with no user content and no paid calls.

## Exactly how to proceed through Human Gate

1. Review PR #743 and check all GitHub Action results. **Do not merge it just to make a green badge**; review changes to the homepage, scripts and the new Worker independently.
2. In GitHub repository **Settings → Environments**, create `virtual-sande-private-staging`; require a human reviewer/approval. If unavailable on the repository plan, treat this as an outstanding release blocker and control who can dispatch the workflow.
3. Add scoped environment secrets, through GitHub Settings (never through chat, files or commits):
   - `CLOUDFLARE_API_TOKEN`: scoped Cloudflare token with permission to deploy Workers only to the intended account.
   - `CLOUDFLARE_ACCOUNT_ID`: associated account identifier.
   - `WPA_AGENT_STAGING_TOKEN`: unpredictable secret, at least 24 characters (recommend ≥32), used only to authenticate private tests.
4. Once the workflow has passed code review and exists on a dispatchable branch, open **Actions → Virtual Sande PRIVATE staging — manual disabled-only deployment**. Run `dry_run_only` first. This must remain a no-deployment test.
5. Only after reviewing the exact branch, start `deploy_disabled`; type `PRIVATE STAGING ONLY` as manual acknowledgement. This creates a private-authenticated **model-disabled** Worker. It is reachable at a Workers.dev URL but returns `403 PRIVATE_STAGING_ONLY` to unauthenticated callers.
6. The workflow checks the disabled pilot over HTTPS. Acceptance: unauthenticated request returns **403**; authenticated capabilities request returns **200** with `enabled=false`, `pdf_synthesis=false`, `image_analysis=false`, `model_connection_status=NOT_CONNECTED`. No `OPENAI_API_KEY` is committed or passed.
7. Inspect the Cloudflare Worker dashboard, exact deployment identifier and GitHub Actions logs. Record the run URL and deployed commit. **If the smoke test is absent or red, do not claim successful staging**.

## Explicit block to live GPT calls

This phase does **not** test a real language model. To move to S1, a separate verified plan must supply, via encrypted Cloudflare secrets:
- an OpenAI API project which has permission to use `gpt-6.1-terra` or an approved replacement;
- a personal-data/privacy statement and a properly configured Turnstile site and secret;
- `WPA_AGENT_RATE_LIMIT` and **strict global spend protection** (Cloudflare's per-location rate limiting is approximate, not a global budget cap);
- restricted test identities, a bounded number of prompts, billed API monitoring and rollback;
- separate Human Gate authorisation before changing `WPA_AGENT_ENABLED`.

**No ChatGPT Plus/Team subscription or model menu access automatically grants a Worker its API key.** The ChatGPT product's memory, browser, code execution and apps are also not automatically available to Virtual Sande; each future capability requires its own connection and policy.

## Public site and canonical safety

Public `main` continues to serve the certified v35.1.1 academic `/ask` Worker. The staged multimedia/PDF front end remains in Draft PR #743, and the cache-busting changes apply **only once merged and deployed**. A merge would change the public JavaScript, so it must be reviewed separately. No existing published assistant, university data, WPA documents or payment rails are changed by S0 staging.

Rollback for disabled staging: remove/disable the independent `wpa-virtual-sande-agent-private-staging` Worker through Cloudflare after approval. The canonical `wpa-virtual-sande-v35-1-production` Worker is never a rollback target.

## PP-12 evidence register

| Gate | Status | Explanation |
| --- | --- | --- |
| 01 Mandate | PASS | Non-public staging, no paid calls or publication |
| 02 User Need | PASS | Conversational/photo/PDF helper |
| 03 Provenance | PASS | PR #743 and Cloudflare/OpenAI official integration docs |
| 04 Scope | PASS | Disabled private Worker and dry-run only |
| 05 Acceptance | PASS | Tests define 403/200/503 and no paid integration |
| 06 Architecture | PASS | Separate staging Worker + guard + CI + manual workflow |
| 07 Build | SOURCE PREPARED | Files in branch only |
| 08 Functional QA | PENDING CI | Real deployment not tested |
| 09 Content QA | NOT TESTED | Real MK/image/PDF output blocked |
| 10 Safety | PARTIAL | Auth and disabled mode; legal/privacy review pending |
| 11 Packaging | PASS | This handoff + PR + workflow |
| 12 Human Gate | BLOCKED | Actual staging deployment and public release remain separate decisions |

Official references:
- Model: https://developers.openai.com/api/docs/models/gpt-6.1-terra
- Cloudflare rate limiting caveats: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- Cloudflare secret configuration: https://developers.cloudflare.com/workers/configuration/secrets/

**Final release truth:** The private staging deployment remains **NOT VERIFIED** until the manual deployment run and HTTPS smoke test provide evidence.

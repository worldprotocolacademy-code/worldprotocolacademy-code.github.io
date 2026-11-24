# Virtual Sande AI · Multimodal Conversation Pilot v0.1
**24 November 2026 · Release candidate with blockers · Human Gate**
**Repository:** `worldprotocolacademy-code/worldprotocolacademy-code.github.io`

## Purpose and actual capabilities

Virtual Sande is the independent **AI academic assistant of World Protocol Academy**. It is not Dr Sande Smiljanov himself and is not the ChatGPT consumer product.

This bounded enhancement keeps the existing **deployed v35.1.1 WPA source-first** text chat on `/ask` unchanged. It stages a *separate, opt-in* read-only model route:

- `GET /agent/capabilities`: tells the UI whether the pilot is genuinely configured.
- `POST /agent/ask`: optional bounded conversation with last six text turns and one locally re-encoded JPEG image.
- Public widget: attach image button (disabled until capability is verified), general AI conversation checkbox, explicit consent, Turnstile challenge, user-controlled follow-up prompts and conversation reset.
- Images are resized and re-encoded on the visitor's device to remove most camera/EXIF/GPS metadata before external transfer.
- No autonomous emailing, purchases, enrollment, submissions, device access, social publication, account lookups or background activity.

**Explicitly NOT implemented:** full ChatGPT functionality, live web search, file/PDF understanding, speech, persistent personal memory, tools with real accounts, image generation, autonomous recurring agents, source-verified GPT citations or browser execution.

The experimental conversation route is a model-only unverified answer. For grounded WPA author works and academic sources, the existing `/ask` path remains canonical.

## Current readiness / deployment status

- The public v35.1.1 Cloudflare production Worker is declared deployed in `config/virtual-sande-current-state.json` (2026-07-16 record).
- This **new** multimodal pilot is **not deployed** and may be merged only after tests and Human Gate.
- `WPA_AGENT_ENABLED` is absent from production `wrangler.toml`, so the pilot is disabled even after source merge; the public widget must continue showing a disabled image button until capability says it is ready.
- CI uses a **mocked provider and mocked Turnstile**. It does not verify OpenAI model availability, actual images, Macedonian fluency, browser CAPTCHA or billing.

## Configuration checklist (staging first; NOT a command to execute now)

1. Create and approve an OpenAI API project with **strict budget/alerts** and a **multimodal Responses-compatible model**. Model ID is configured as `WPA_AGENT_MODEL` after checking availability; the model is not inferred from the ChatGPT subscription.
2. Configure an explicit `WPA_AGENT_ENABLED = "false"` in staging until all below are ready. Enable only after a separate Human Gate.
3. Add private Worker secrets through Cloudflare secret management only: `OPENAI_API_KEY`, `WPA_AGENT_TURNSTILE_SECRET`. Never commit tokens, secrets, visitor prompts or images.
4. Configure public Worker vars: `WPA_AGENT_MODEL` (verified model ID), `WPA_AGENT_TURNSTILE_SITE_KEY` (public Turnstile site key), and permitted `ALLOWED_ORIGINS`. Register every actual consumer hostname in Turnstile site configuration.
5. Add a Cloudflare Rate Limiting binding named `WPA_AGENT_RATE_LIMIT` to the Worker. Example in Wrangler TOML (choose your **own unique positive integer** namespace ID):
   
   ```toml
   [[ratelimits]]
   name = "WPA_AGENT_RATE_LIMIT"
   namespace_id = "REPLACE_WITH_UNIQUE_POSITIVE_INTEGER"
   [ratelimits.simple]
   limit = 5
   period = 60
   ```

   Do not copy an example namespace blindly. **Rate Limiting is approximate/local, not a hard global spend ceiling.** For strict global paid-call limits, use a Durable Object / external billing safety guard. A public rollout is blocked until an accepted cost-containment plan exists.
6. Validate `WPA_AGENT_RATE_LIMIT.limit({key})`, Turnstile server-side `siteverify` with hostname/action checks, data retention/privacy notice, CORS, fail-closed handling and risk controls.
7. Test manually on **staging**, with a non-sensitive photo of ceremonial seating/flags (not a private person's face or document). Test MK and EN language, follow-up question, prompt injection embedded in image, invalid images, large files, consent false, CAPTCHA false, 429/502/504, mobile display and old `/ask`.
8. Verify provider charges/budget alerts, logs are metadata-only, no image/prompt persistence, approved terms of use, processor agreements/appropriate privacy disclosures and data-transfer controls. No blanket "GDPR compliant" claim is made.
9. Independent code and security review; release through a controlled manual staging/prod deploy, preserving the v35.1.1 source-first path and rollback.

## Human Gate release matrix

| Gate | Pilot status |
| --- | --- |
| API boundary and response parsing (mocked tests) | PENDING CI |
| Image upload / re-encode client logic | PENDING BROWSER UAT |
| Legacy /ask preservation | CODE-ONLY; LIVE REGRESSION NOT VERIFIED |
| Real multimodal model call | NOT TESTED |
| Turnstile integration on deployed hostname | NOT TESTED |
| Rate limiter and global cost boundary | NOT CONFIGURED |
| Public privacy and data governance approval | NOT APPROVED |
| Final public rollout | NOT AUTHORISED |

## Rollback and preservation

Until separate release approval, no production deployment is performed. If the PR is closed, nothing changes on public `main`. If merged, the new gateway stays disabled and canonical `/ask` continues functioning. To revert after release, set `WPA_AGENT_ENABLED=false` and redeploy the Worker, or revert the two new source paths and associated widget/entrypoint changes after confirming the canonical worker health and regression tests.

**PP-12:** Release requires factual status, working QA evidence, user privacy disclosures, support channel, and explicit Human Gate. This document is an engineering handoff, not permission to deploy.

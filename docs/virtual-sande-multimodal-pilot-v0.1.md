# Virtual Sande AI · Multimodal Conversation Pilot v0.1
**24 November 2026 · Release candidate with blockers · Human Gate**
**Repository:** `worldprotocolacademy-code/worldprotocolacademy-code.github.io`

## Purpose and actual capabilities

Virtual Sande is the independent **AI academic assistant of World Protocol Academy**. It is not Dr Sande Smiljanov himself and is not the ChatGPT consumer product.

This bounded enhancement keeps the existing **deployed v35.1.1 WPA source-first** text chat on `/ask` unchanged. It stages a **different, independent Cloudflare Worker** named `wpa-virtual-sande-agent-pilot` with an opt-in model-only route. The certified production and staging `v35.1.1` entrypoints remain byte-identical and are not modified by this PR:

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
- The new pilot's own `workers/virtual-sande-multimodal-pilot/wrangler.toml` explicitly contains `WPA_AGENT_ENABLED = "false"` (independent from the certified production Worker). The public image button remains disabled until its separate capability endpoint is actually live and configured.
- CI preserves byte equality between the existing production and staging entrypoints and uses a **mocked provider and mocked Turnstile**. It does not verify OpenAI model availability, actual images, Macedonian fluency, browser CAPTCHA or billing.

## Configuration checklist (staging first; NOT a command to execute now)

**Architectural lock:** `workers/virtual-sande-v35.1-production/src/index.mjs` MUST remain byte-identical to `workers/virtual-sande-v35.1-staging/src/index.mjs`. The independent experimental gateway lives in `workers/virtual-sande-multimodal-pilot/src/`. The widget uses a separate pilot hostname for images; its existing academic text endpoint remains unchanged.

1. Create and approve an OpenAI API project with **strict budget/alerts** and a **multimodal Responses-compatible model**. Model ID is configured as `WPA_AGENT_MODEL` after checking availability; the model is not inferred from the ChatGPT subscription.
2. Keep the isolated `workers/virtual-sande-multimodal-pilot/wrangler.toml` at `WPA_AGENT_ENABLED = "false"` until every gate passes. Deploy only the new pilot Worker to staging and test there first; do **not** redeploy the existing certified v35.1.1 Worker.
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

Until separate release approval, no production deployment is performed. If the PR is closed, nothing changes on public `main`. If merged, the new independent pilot Worker remains unconfigured and disabled while the certified `/ask` continues to function. To roll back a later separate pilot deployment, set `WPA_AGENT_ENABLED=false` and redeploy **only the pilot Worker**, or disable/remove the widget's optional capability route. Do not modify the certified Worker to roll back an unrelated pilot.

**PP-12:** Release requires factual status, working QA evidence, user privacy disclosures, support channel, and explicit Human Gate. This document is an engineering handoff, not permission to deploy.

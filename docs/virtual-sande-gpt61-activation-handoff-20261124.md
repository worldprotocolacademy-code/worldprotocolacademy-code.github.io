# Virtual Sande AI — GPT-6.1 Terra activation & visibility handoff
**Date:** 24 November 2026
**Location:** Draft PR #743, `feat/virtual-sande-multimodal-pilot-20261124`
**Status:** SOURCE PREPARED / NOT DEPLOYED / NO LIVE GPT CONNECTION
**Human Gate:** Required before merging to public `main`, before spending money on model calls, and before Cloudflare deployment.

## Why the public page still shows the old assistant
The public site dynamically loads the bot from:
`index.html -> scripts/wpa-performance.js -> scripts/virtual-sande-public-widget.js`.
On 24 November these files on `main` still load the old v35.1.1 UI. The new code is in **Draft PR #743**, not public. The old loader query `?v=20260716-1` can also preserve cached JS when changed without changing its URL. This branch updates homepage, pricing-loader, runtime loader and widget version tags as an **eventual reviewed release**, not an actual deployment.

The independent Cloudflare pilot Worker is `workers/virtual-sande-multimodal-pilot`; its `WPA_AGENT_ENABLED = "false"`, with *no* API key, Turnstile secret or rate-limit binding committed. Neither merging nor cache clearing can make model API calls work without explicitly configuring and deploying that separate Worker.

## Model selection: not equal to ChatGPT feature parity
**Requested:** GPT-6.1.
**Documented API candidate:** `gpt-6.1-terra`. Its name is configured as a **candidate**, not an active, tested connection. See https://developers.openai.com/api/docs/models .
**Not inherited:** ChatGPT's personal memory, ChatGPT-connected Gmail/Calendar, browser/computer use, Python execution, file editing, image generation, live voice, multi-agent orchestration or tools unless each is separately integrated, permissioned, budgeted and tested.

The public capabilities panel reports these truths:
- Existing academic WPA `/ask`: canonical text/source route unchanged.
- GPT-6.1 candidate: `НЕ Е ПОВРЗАН` until isolated Worker capabilities actually report configured.
- Image analysis: disabled until enabled and tested.
- PDF Book Lab: browser-local book indexing; model synthesis disabled until backend is configured.
- No false `GPT connected` or `all ChatGPT features` badges.

## Isolated Cloudflare activation prerequisites
1. User approves API billing/provider in their OpenAI API project. API use is **billed separately** from a ChatGPT subscription; set a restrictive project budget/alerts, use a model available to that project, and do not send secrets in chat or a GitHub commit.
2. Cloudflare account administrator configures a *separate* `wpa-virtual-sande-agent-pilot` Worker, not the canonical `wpa-virtual-sande-v35-1-production` Worker.
3. Worker encrypted secrets: `OPENAI_API_KEY` and `WPA_AGENT_TURNSTILE_SECRET`.
4. Worker vars: `WPA_AGENT_MODEL = "gpt-6.1-terra"` (confirm access), `WPA_AGENT_TURNSTILE_SITE_KEY`, approved `ALLOWED_ORIGINS`.
5. Worker binding: `WPA_AGENT_RATE_LIMIT` of Cloudflare Rate Limiting. Also implement/check a **global spend guard**, as per-client rate limits alone do not cap platform-wide usage.
6. Site-specific Turnstile challenge verifies `action=wpa-agent`, trusted hostname, and user consent before each model request.
7. Preserve `WPA_AGENT_ENABLED="false"` while staging the account and secrets. A separate, explicit Human Gate is needed to set it to `true`; re-test API response and billing on staging first.
8. Self-host reviewed PDF.js dependency or document CDN supply-chain risk before public release. Review privacy statement, personal-data rights, copyright, private-book processing and relevant local/EU requirements.
9. Verify existing WPA `/ask` remains functional and unmodified. Roll back optional capabilities by setting pilot `WPA_AGENT_ENABLED=false` and disabling its widget route, **not** by editing certified WPA bot.

## Acceptance scenarios for a truly working release
- Public script version visibly changes on `https://worldprotocolacademy.mk`; capability cards appear and accurately show status.
- `/agent/capabilities` on the **separate** pilot Worker returns `ok=true`, `enabled=true`, declared `model_id=gpt-6.1-terra`, and a Turnstile site key **only after configuration**.
- Real one-turn Macedonian message and multi-turn follow-up pass with paid provider endpoint, verified token and access limits.
- A test photo of ceremonial flags or seating is correctly analysed with explicit distinction between visible details and assumptions.
- One genuine 20–100-page text-based PDF is indexed locally and model returns supported `(PDF стр. N)` references. Scan-only PDF returns OCR-needed message.
- Consent false, abusive input, stale CAPTCHA, too-large image/PDF and over-limit API calls fail closed and are not charged.
- Mobile/Chrome keyboard and layout are reviewed; browser console and third-party CDN risks recorded.
- Human responsible person approves privacy/copyright/AI governance before model is made available to general visitors.

## Evidence position
Automated CI validates model calls using **mocked responses** and validates legacy runtime isolation. It cannot verify Cloudflare credentials, real model availability, browser interaction, payments, legal sufficiency or deployed public availability. A green PR is only a code-validation milestone.

## Release sequence
1. Keep Draft PR until all CI, security and browser checks pass.
2. Create a staged Cloudflare deployment using user-owned secrets (no secrets transferred through ChatGPT).
3. Verify pilot, then explicitly approve selected public frontend merge.
4. Verify deployed public HTML/JS and new Worker endpoints in a real browser.
5. After separate Human Gate and billable-calls approval, enable model route and monitor budget/cost.
6. Retain rollback to the canonical academic-only bot.

**Current truth:** no public activation was performed by preparation of this handoff.

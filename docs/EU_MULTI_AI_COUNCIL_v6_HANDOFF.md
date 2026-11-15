# EU Application Factory · WPA Multi-AI Grant Council v6.0 (release candidate)

Date: 15 November 2026. Owner: World Protocol Academy; independent digital educational/research platform in development/test/pilot phase. This is a technical *candidate*, not an AI-provider partnership, accredited EU funding advisor, certified legal service or live provider integration.

## User mandate

Integrate Mistral alongside the 12 previously discussed provider/service seats, preserve the real v5 grant analysis, and begin useful work immediately. The immediate public-source scan for WPA Journal and Ohrid 2027 is documented in `data/eu-application-factory/priority0-evidence-2026-11-15.json`; a separate ChatGPT scheduled source check was activated for continued monitoring. Do **not** claim 13 external models were called.

## What changed

- `data/eu-application-factory/provider-council-v1.json`: 13 specialist roles; provider types not conflated with search tools or licensed enterprise services.
- `tools/eu-application-factory.html`: collapsed provider/evidence section, without replacing the existing v5 functional workflow.
- `tools/assets/eu-factory-council-v6.js`: same-origin read-only registry renderer. No API keys or third-party requests from the browser.
- `scripts/wpa_eu_multi_agent_council.py`: a controlled server-side model dispatcher, including Mistral OpenAI-compatible Chat Completions; public-source-only, approved endpoints, max three specialist calls per run, opt-in live switch and output status never equal to verified facts.
- `.github/workflows/wpa-eu-multi-ai-council-v6.yml`: CI self-test on PR/main, manual opt-in provider calls when secrets exist.
- `tests/test_wpa_eu_council_v6.py`: safety and invocation regression.

## Activation requirements — Human Gate

**Do not paste provider keys into chat, HTML, JS or a repository file.** Add server-only GitHub Actions secrets in repository Settings → Secrets and variables → Actions:

- `WPA_EU_MISTRAL_API_KEY` and variable `WPA_EU_MISTRAL_MODEL` (e.g. `mistral-small-latest`).
- For each other supported provider, `WPA_EU_<PROVIDER>_API_KEY` and matching repository variable `WPA_EU_<PROVIDER>_MODEL`.
- `WPA_EU_COUNCIL_LIVE_ENABLED=1` only after the owner approves external processing, applicable costs, processor privacy terms and evidence sharing.

Use **Actions → WPA EU Multi-AI Council v6 QA → Run workflow** with `execute=true` and one offered trio. Without the key, model, and explicit live flag, the agent reports `NOT_CONFIGURED` or `CONFIGURED_EXECUTION_DISABLED`, never fabricates a response. A configured seat is **not** active until an actual successful API call is evidenced. Google Search is a source channel, not an additional model. Harvey and Microsoft Copilot remain enterprise/licence-specific, with no fabricated generic API proxy.

The current runner is a controlled *server batch adapter*, not a public Cloudflare Worker endpoint or a browser-invocable GPT agent. It does not run external model calls on a schedule. An existing separate WPA Institute fabric with five core seats remains untouched.

## Model safety

Maximum three selected specialists per manual live job; timeouts 24s per call and fixed max token caps. Input classification `OFFICIAL_PUBLIC_ONLY`; stale external evidence over 7 days blocks *live* dispatch. No private applicant records, banking, login credentials or confidential partner documents are sent through this path. Result `COMPLETED_UNVERIFIED` requires independent EU source verification. A final Submit/signature/contract/co-financing/partner commitment remains Human Gate.

## Verified outcomes / limitations

- Python self-test and 15 unit tests: verify provider count/Mistral, fail-closed missing keys, two-factor opt-in, endpoint allowlist, mock Mistral response, source classification, Human Gate, no Virtual Sande redirect.
- Static web link and public registry render test possible locally; live production must be verified separately.
- **NOT VERIFIED**: any external model API call, paid-provider access, live AI Council backend deployment, currently confirmed call eligibility or public release.

## Human Gate and rollback

Before merge: check Site Quality CI, existing EU v5 regression, WPA Security and new EU Council QA. Prefer minimal diff. Rollback by reverting the council commits; keep v5 core and prior WPA Institute fabric untouched.

Mistral official documentation: https://docs.mistral.ai/api/endpoint/chat ; https://docs.mistral.ai/getting-started/quickstarts/studio/activate-and-generate-api-key .
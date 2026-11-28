# WPA NEWS 06:30 local dispatch — deployment blueprint (NOT LIVE)

This is an optional **dispatch-only** Cloudflare Cron Trigger for 06:30 production AND 09:00 watchdog. It does not create news, validate facts, publish site content, render voices, or call a paid video API.

## Setup after independent review and Human Gate

1. In a dedicated Cloudflare Worker project, copy `wrangler.example.toml` to `wrangler.toml` and deploy `cron-worker.mjs` only after permission and rollback are approved.
2. Set `GITHUB_WORKFLOW_DISPATCH_TOKEN` with Cloudflare's secret storage. **Never** check it into GitHub. Use a tightly scoped GitHub App installation token or fine-grained PAT with Actions: write only for the WPA website repo.
3. The Worker runs UTC cron candidates and checks the local time in Europe/Skopje: at 06:30 it dispatches `wpa-media-programmes-production.yml` with `mode=daily`; at 09:00 it dispatches `wpa-news-watchdog.yml`. The same Actions:write scoped secret is sufficient. GitHub's date/PR dedupe must remain enabled.
4. Observe Cloudflare Cron logs and GitHub Actions queue/start time. Test both CET and CEST. Turn off either Cron Trigger or revoke the token to roll back.
5. If exactly 07:00 site content is required, **do not claim SLA**: GitHub dispatch and human review can also delay completion. A full end-to-end monitored pipeline is required.

## Fail-closed constraints

- Worker code has only a `scheduled` handler: no publicly callable HTTP dispatch route.
- Secret must be present; only GitHub HTTP 204 counts as accepted, not a publication confirmation.
- Only authorized GitHub repository workflow is invoked, no external content submitted.
- Never deploy until GitHub branch protection, quality failure handling and Human Gate are tested.

Provider docs: Cloudflare Cron Triggers (UTC), GitHub Actions create-workflow-dispatch endpoint (Actions: write).

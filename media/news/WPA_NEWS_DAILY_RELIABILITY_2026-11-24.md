# WPA NEWS reliability rescue · 24 November 2026

**Status:** Draft PR · not deployed or published · Human Gate required

## Independent baseline

The canonical `media/news/production/status.json` in `main` last reports `product_date=2026-11-12`. The scheduled workflow used an exact local-hour condition: only `06` Europe/Skopje generated a daily draft. A late GitHub schedule therefore silently skipped the production steps while the test job succeeded. A green CI badge is not a generated edition.

## Scope of this rescue

1. **Local date rather than exact hour.** Skopje-local date plus today's approved-on-main status or dated open automation PR controls duplicate daily generation. GitHub API unavailable or PR list truncated => fail closed.
2. **Explicit content quality failure.** Reject unedited English excerpts, truncated source text (ellipsis), invalid source attribution, missing domain coverage, wrong local date and broken Human Gate settings. A short verified bulletin is permitted with a visible warning; it must not be padded with fabricated text. The initial 12 November edition would fail this gate.
3. **Preserve draft artifacts for review** even when quality blocks a PR. The workflow run MUST be visibly failed rather than silently green.
4. **Do not auto-merge** the WPA NEWS generated PR. `PUBLISH_HUMAN_GATE_ONLY=true` stops before any automated merge after an open PR is created. Existing other publishers are not automatically changed.
5. **Best-effort after-09:00 watchdog.** Logs the distinct states `NO_EDITION_OR_PENDING_PR`, `AWAITING_HUMAN_GATE`, and `PRESENT_ON_MAIN`. Creates an open GitHub issue after 09:00 Skopje if a public edition is missing. The issue itself is not a notification guarantee; operators must configure GitHub notification policies. GH cron is best-effort.
6. **Optional external Cloudflare Cron Trigger sample.** Not deployed. At 06:xx Europe/Skopje, it may dispatch GitHub Actions with `mode=daily`, using a narrowly scoped token stored as a Cloudflare secret. It only requests generation; it does not guarantee publication at 07:00.

## Explicit current limits

- No proof of regular publication on 13–24 November; do not backdate editions.
- No verified 07:00 SLA, Cloudflare secret, production Worker, rights/claim checking, translation approval, render or external social delivery.
- A generated `source_report` is **not** a source-checked fact simply because its URL exists.
- The public GitHub repo and its PRs are visible. Do not upload private voice masters, portraits, credentials or unpublished confidential materials.
- Full automatic web-text publication is **not enabled**. A separate Human Gate decision after sustained editorial QA is required. Avatars and social distribution remain gated separately.

## Acceptance tests before merge/release

- Inspect PR CI: Python tests for late-day and CET/CEST cases; editorial-raw-English/ellipsis rejection; watchdog 09:00 transitions; Node tests for Cloudflare worker.
- Ensure publisher's Human-Gate-only flag bypasses the auto-merge loop.
- Observe a real `workflow_dispatch(mode=daily)` on approved main: generated output, source/date checks, artefact retention, pending PR if and only if QA passes. Record exact run URL.
- Review one complete Macedonian edition against original linked sources, then Human Gate on the publishing PR.
- For a true clock-time target, separately activate and test external scheduler with monitored delivery latency.

## Rollback

Do not merge: close the Draft PR. After merge: revert commits; disable the new watchdog workflow and stop/revoke the Cloudflare dispatcher token if activated. Existing `main` data are not overwritten by this PR.

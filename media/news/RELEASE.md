# WPA NEWS · Production Master v1.0

**Date:** 12 November 2026  
**Owner:** World Protocol Academy  
**Primary class:** Media / campaign / distribution pack  
**Secondary class:** Website / operational process  
**Status:** ACTIVE DAILY PRODUCTION · HUMAN GATE

## Release identity

WPA NEWS is the daily dual-presenter production line for **Дипломатка** and **Дипломат**. It prepares a source-attributed daily production master from fresh public-source inputs and places the resulting web bundle behind a protected Human Gate.

This release does **not** claim automated video publication, production voice rendering, canonical avatar lip-sync rendering, or external social-platform delivery.

## Included deliverables

- `/media/news/` — public programme page and Latest Edition panel
- `/media/news/production/latest.json` — canonical latest production manifest
- `/media/news/production/status.json` — web production status
- `/media/news/production/teleprompter.md` — dual-host teleprompter
- `/media/news/production/transcript.md` — full transcript
- `/media/news/production/captions.vtt` — captions draft
- `/media/news/production/shorts.json` — three short-form scripts
- `/media/news/production/video-description.md` — description draft
- `/media/news/production/social-copy.md` — social-copy draft
- `.github/workflows/wpa-media-programmes-production.yml` — scheduled production workflow
- `scripts/generate_wpa_media_programmes.py` — bounded broadcast generator
- `scripts/materialize_wpa_news_web.py` — web materialisation layer

## Acceptance results

- Daily generator self-test: **PASS**
- Web materialiser self-test: **PASS**
- Broadcast-domain relevance gate: **PASS**
- Opinion/editorial auto-rundown exclusion: **PASS**
- Canonical presenter aliases preserved: **PASS**
- Automatic external publication remains disabled: **PASS**
- Human Gate required before consequential release: **PASS**
- WPA Media Launch Safety: **PASS**
- WPA Site Quality: **PASS**
- WPA Translator Quality: **PASS**
- WPA i18n Audit: **PASS**
- CodeQL: **PASS**
- GitHub Pages deployment: **PASS**

## Production cadence

Target production-pack preparation: **06:45 Europe/Skopje**.  
Target daily edition time: **07:00 Europe/Skopje**.

The workflow uses two UTC schedule candidates and keeps only the one that lands in the 06:00 local hour, preserving the local target across CET/CEST.

If evidence is insufficient, the edition may be shorter than the nominal 8–12 minute target. Unsupported filler is prohibited.

## Human Gate

Daily automation may prepare the production master and open a protected update. Human approval remains authoritative for:

- merging the daily web bundle;
- Macedonian editorial review of source-language snippets before on-air use;
- visual-rights clearance;
- production voice rendering;
- canonical avatar/lip-sync rendering;
- external video/social distribution.

## Known limitations

- Production voice adapter: **NOT VERIFIED**
- Canonical avatar/lip-sync adapter: **NOT VERIFIED**
- External platform delivery adapters: **NOT VERIFIED**
- Source-language snippets in an automation draft are not automatically treated as final Macedonian on-air copy.

## Rollback / recovery

Stable rollback reference before this final status/packaging polish:

`5fb8e6fe05de4afcd93081c7c82d0702b68afe3e`

The daily product bundle itself remains recoverable from Git history and the workflow artifact archive.

## Release note

v1.0 closes the gap between “pipeline implemented” and a real daily Human-Gated production product. The system now generates, materialises, quality-gates, packages and exposes an approved Latest Edition bundle while preserving human release authority.

# WPA NEWS · Broadcast Bridge v0.4 RC — private-first cutover

**15 November 2026 · engineering integration only · NOT DEPLOYED**

This branch introduces a bounded connection from the existing WPA NEWS editorial pack to a *DRAFT* for a separately hosted and human-governed private render engine. It does **not** enable HeyGen, ElevenLabs, paid generation, Cloudflare Workers, public MP4, auto-post, or changed presenter identities.

## Verified repo baseline
- Public canonical code: \`worldprotocolacademy-code/worldprotocolacademy-code.github.io\`, \`media/news/\`.
- Existing scheduled news pack: \`media/news/production/latest.json\`, last observed generated on 12 November 2026. **Not current as of 15 November**; do not use as today's news.
- Presenter aliases: Дипломатка → canonical Протоколка; Дипломат → canonical Дипломат. These are existing fictional identities. No new face or voice identity is approved.
- The private WPA MEDIA v2.6 MASTER archive has confidential files and must never be checked into this public repository.

## Private production architecture
Journal Live → source/quote checks → editorial pack → **DRAFT** → real human fact-check and consent/licence check → **Human Gate 1** (Cloudflare Access verified editor + bounded HMAC-signed release, short validity) → private R2 → dedicated **private** GitHub Actions renderer → ElevenLabs / HeyGen v3 / FFmpeg → **private staging objects** → audio/video/lip-sync, captions, identity and provenance QC → **Human Gate 2** → separately authorised public delivery adapter → published URL and rollback record.

Public code must never contain canonical presenter images before rights review, internal negotiation sheets, billing credentials, unsigned master archives, release signing key or provider secrets.

## Production blockers at 15 Nov 2026
1. Dedicated private broadcast repository is not connected; the only verified central WPA website repo is public.
2. No live Cloudflare R2/Access settings or private worker deployment verified.
3. No verified HeyGen/ElevenLabs production account, voice IDs or billable end-to-end render.
4. No current fact-checked editorial pack for 15 Nov, nor Human Gate 1 or 2.
5. No verified public delivery/publishing adapter, legal media rights or verified rollback.

Do **not** change 'NOT_VERIFIED' to 'LIVE' because a workflow ran or a ZIP was prepared. Do not merge/enable a paid render workflow on the public website by accident.

## Rollback
This PR only adds isolated files. To revert before deployment, close the PR; after merge, revert its commits. Existing WPA NEWS production workflows and canonical profiles must remain untouched.

**Human Gates:** signed permission to request a *private billable render* is not public broadcasting permission; a second approval and verified adapter delivery result are mandatory.

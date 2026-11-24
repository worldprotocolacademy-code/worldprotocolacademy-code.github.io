# Virtual Sande AI Unified Academic Workspace · RC2 source candidate

Date: 2026-11-24. Status: DRAFT / NOT DEPLOYED / NO PRODUCTION AUTHORIZATION.
Scope: existing public widget, optional private document/semantic pilot. The dedicated legacy Lab page and Institute widget are not migrated. Canonical production /ask and existing practical planner are preserved.

## Implemented in branch

- Browser speech recognition (where supported), speech synthesis, stop, MK/EN locale; provider may process audio; not realtime duplex voice. Verify actual MK voice.
- Local drag/drop and file picker, max 20 per conversation, deduplication, 15 MiB max each, empty/unsupported rejection; .pdf .docx .md .markdown .csv .json .jpg .jpeg .png .txt.
- Optional explicitly configured same-origin, authenticated pilot: user consent, per-file conversion, local in-memory extracted text, per-file processing state. No document upload without explicit action. No document context sent to the public /ask endpoint; no automatic public fallback after entering private mode.
- Private pilot model analysis: source-bound evidence excerpts from every submitted processed document, max 20, 100,000 extracted chars per document, 40,000 selected evidence chars in total; complete/partial coverage explicitly returned. No claims of reading full documents when only excerpts selected. Exact source pages and verified OCR are not established.
- Local proactive intent and next-step suggestions (heuristic, MK/EN plus bounded transliteration patterns). No unsent draft transmitted. Private opt-in model suggestions use submitted question/history, never auto-send.
- Rotating WPA logo, real browser elapsed time, reduced-motion support, message editing and regeneration, stale response suppression, client abort/stop, copy answer, local Markdown chat export.
- Clear resets private document state and conversation. History is session-memory only; persistent account history and general file generation are not implemented.

## Source and integration decisions

Preserve existing public /ask and source-first WPA academic path. Do not duplicate its public corpus. Private analysis is a separately isolated pilot and does not claim access to WPA corpus during private analysis. Its model output is provisional, must not be described as the author's personal response, and must not claim authority. The private pipeline treats uploaded document content and conversation as data, not commands. Excerpts use character offsets in extracted text, not PDF page numbers. Conversion results returned to the browser and resubmitted by the client are not signed evidence; no chain-of-custody claim. Exact citations and independent evidence verification remain separate release gates.

Cloudflare Workers AI Markdown conversion supports PDF, DOCX and images; image description is not verified OCR. Reference: https://developers.cloudflare.com/workers-ai/features/markdown-conversion/
Workers binding reference: https://developers.cloudflare.com/workers-ai/features/markdown-conversion/usage/binding/
A reviewed FILE_SAFETY binding (malware/magic/decompression checks) is mandatory for binary processing. No scanner is provisioned here. Verified page-aware OCR, accuracy against scans and image text, and source-document citation mapping are not completed.

## Security and configuration gates

1. Dedicated protected staging origin with Cloudflare Access policy. Worker verifies RS256 access JWT against the configured issuer's JWKS, audience, subject and expiry. Origin checks and explicit consent header are also required. This is source candidate only; real Access JWT verification and same-origin routing must be exercised.
2. Set exact PILOT_ORIGIN, ACCESS_ISSUER, ACCESS_AUD and approved SYNTHESIS_MODEL server-side. Provision FILE_SAFETY, verify binary format and scanner behavior. Do not expose provider keys in the frontend.
3. Configure and review WAF/rate limits, per-user budget, privacy/provider retention conditions, copyright and data handling. Do not process sensitive data before institutional approval. No raw file persistence is implemented; extracted text resides in browser memory and submitted requests. Provider retention is not verified.
4. Use a protected staging page with a same-origin meta configuration: <meta name="wpa-private-workspace-api" content="/virtual-sande-private">. Route that path to the isolated Worker only after Access and origin validation. No meta tag in the public site. Keep PILOT_ENABLED=false until gates pass.
5. Run all Node tests, real Chrome/mobile smoke and end-to-end tests using authorized synthetic fixtures (including 20 documents, 21st rejected, corrupt/unsafe file, malformed JSON, scans, image OCR, permission denied, stale responses, export, edit while waiting, and privacy isolation).
6. Verify model accuracy, source mapping, MK dictation and TTS; add explicit failure handling for unsupported browsers. Real-time duplex provider voice, account history, public web research, visual generation and DOCX/PDF export are separate integrations, not represented as live.
7. Separate Human Gate approval for enabling protected pilot, then production release. Do not merge/deploy just because CI is green.

## Test evidence at creation

New deterministic tests are authored: nine proactive intent scenarios and sixteen private pilot scenarios using mocked provider/scanner, including 20-document coverage, format validation, consent, origin/auth checks and model suggestions. CI is configured. Results are not presumed; real provider, browser and security QA are outstanding. No production configuration or endpoint has been enabled.

## Rollback

No production changes. If pilot is deployed later, disable PILOT_ENABLED, remove protected pilot route and meta tag, revert the frontend PR if needed. Public /ask remains untouched. Stop/abort on the client prevents stale display; cannot promise cancellation of already initiated provider processing or charges.

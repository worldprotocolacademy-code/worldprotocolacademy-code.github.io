# Virtual Sande — Voice + 20-document intake (candidate, 24 Nov 2026)

## Scope and release status

This branch introduces a progressive-enhancement UI for microphone dictation, optional speech synthesis (read answers), and drag-and-drop selection of **up to 20 attachments per conversation**. It does not change the canonical /ask request/response contract, the current academic answer flow or the existing protocol planner.

**NOT RELEASED / NOT END-TO-END FUNCTIONAL FOR DOCUMENT ANALYSIS.** There is no verified document ingestion backend attached to this branch. Selecting a document creates a local browser-only staging entry; the AI never receives its contents and must not claim to have read it.

Supported selection extensions: PDF, DOCX, MD, Markdown, CSV, JSON, JPG/JPEG, PNG, TXT. Legacy .doc and non-standard .dox are not accepted pending a conversion/reader policy. Maximum per-file selection size: 15 MiB (UI guard only, not a server capability). Maximum documents: 20, with duplicate-name/size/time de-duplication. No files are uploaded or stored by this frontend candidate.

## Browser voice limitations

- Dictation uses native SpeechRecognition or webkitSpeechRecognition, where supported. Language is mk-MK / en-GB according to the current document locale.
- Speech output uses the browser's SpeechSynthesis and currently reads the last answer or newly rendered bot answers while enabled.
- Actual Macedonian voice availability and recognition depend on the user's browser, OS and installed voices. Voice controls are not a provider-powered, low-latency two-way realtime conversation.
- A production realtime voice system requires a documented provider protocol, separate server-provisioned credentials, microphone permissions and privacy disclosure.

## Backend required for authentic 20-document reasoning

1. Authenticated, least-privilege upload/session endpoints; signed short-lived upload tokens and server-side quotas. Avoid API keys in browser scripts.
2. Content inspection (magic bytes), malware scanning, zip-bomb defences, size and page limits, private storage isolation and automatic retention/deletion.
3. PDF and DOCX text extraction, OCR for scanned pages/photos, text/Markdown/CSV/JSON parsers; preserve page/paragraph locations, tables and UTF-8 text.
4. Per-conversation attachment manifest with 20 verified processing statuses: selected → uploaded → processed → indexed → available; do not substitute selected for available.
5. Answers should cite document name and page/section, identify omissions and failed parsing, and avoid invented quotations. Enforce permission checks on every retrieval.
6. Explicit user consent and security/privacy notice, data deletion, rate limiting, budget/usage controls, failure handling.
7. Compatibility layer to current /ask endpoint; limit retrieval context and avoid truncating without disclosure.
8. Staging acceptance tests: 20 mixed files; one 21st rejected; oversized/unsupported rejected; scanned PDF OCR; valid DOCX, CSV, JSON and JPG; duplicate files; 0-byte file; malformed archive; no cross-session disclosure; logout/deletion; voice permission denied; voice locale and no-voice fallback.
9. After security review, decide whether backend uploads can be publicly enabled; separate Human Gate approval for merge and production deployment.

## Browser-side acceptance (to verify in a browser before merging)

- Existing chat remains functional if optional module is unavailable.
- Existing protocol planner remains functional.
- Select, drop and remove up to 20 entries without dispatching files to /ask.
- Browser dictation populates composer only, never sends automatically.
- Read-out can be enabled/disabled and stopped.
- Unsupported microphone/voice APIs degrade gracefully.
- Clearing conversation clears local staged entries and stops speech.

## Known blockers

- No server-backed ingestion / OCR / document retrieval.
- No cross-browser voice QA nor production privacy review.
- No automated or manual browser-level tests executed for this branch.
- Not a replacement for the ChatGPT product or its proprietary tooling; feature parity must be validated individually.

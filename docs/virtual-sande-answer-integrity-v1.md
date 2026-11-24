# Virtual Sande — answer integrity correction candidate
Date: 2026-11-24. Status: source candidate, not deployed.

## Evidence
Owner's public UI test: three locally staged files (PDF, JPG, JPEG), question about flag arrangement; general response ended in the unfinished Macedonian word "Кога"; elapsed 9.1 s. The local files were not transmitted or analysed. The main generator source used max_tokens: 180 while targeting 80–180 words. This is a plausible cause, not a confirmed live request trace. The fixed author-corpus lead prefix also risked conflating generated synthesis with an author's own words.

## Scope and acceptance
- Core output budget 640 tokens; existing 15-second public-client deadline, endpoint, retrieval and evidence rules remain unchanged. Explicit length-stop metadata and conservative dangling-word detection reject incomplete core/rescue outputs via existing fallback. Safe response contract marks detected incomplete output. The detector is not a general completeness/factual verifier.
- Prompt requires a finished sentence and distinguishes visual observations, viewpoint and applicable flag rules from generic protocol; source-grounded AI synthesis label replaces automatic direct attribution.
- Public UI asks before sending a general question while local attachments exist. Decline preserves draft and files. Acceptance sends only existing text/history; no names, contents, previews or file bytes. General-only answer is labelled. Detected incomplete answer visibly labelled and excluded from subsequent history. Reported source strings, when available, are displayed as service-reported, not independently checked.
- No server attachment handling, OCR, vision model, or private upload enabled. 20 local previews remain as before. Private #752 is unmerged and requires separate reconciliation, auth, file safety, data governance, approved provider and actual runtime tests. No claim of reading the photographs.
- New unit and real-Chrome fixture regressions; source-level tests use mocked response and speech providers, not actual cloud model. Require successful exact-head CI, review latency/provider limits and explicit approval before merging/releasing. A Worker deployment is separate from GitHub Pages and must be verified using approved synthetic test questions before claiming live correction. No Cloudflare configuration or secrets changed.
- Rollback: revert this isolated change; if Worker separately deployed, use authorised prior Worker version. Do not weaken existing canonical tests.

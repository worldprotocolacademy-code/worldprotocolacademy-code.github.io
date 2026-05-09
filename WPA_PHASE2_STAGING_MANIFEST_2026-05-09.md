# WPA Phase 2 Staging Manifest — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document records the controlled start of Phase 2 for the WPA AI agents.

No production code is modified by this document.

## Uploaded Sources Received

Two complete source files were received from the owner:

```text
Desk Agent / WPA Student Desk HTML
Bot-Sande / WPA Protocol Bot Cloudflare Worker JS
```

## Local Verification

The files were checked locally before any code integration.

### Desk Agent

```text
source type: HTML
line count: 2115
sha256: 486201d119d28095c244764a9513b0d14df3de4ae6a60355e93a5cf178de998a
status: complete local source received
```

### Bot-Sande

```text
source type: JavaScript / Cloudflare Worker
line count: 3424
version detected: v33.27-payload-sync
sha256: e4158b09cae18fceafcbbefc9aa1641ddeb06b445af6af09fcf03ceabf9d752f
status: complete local source received
```

## Phase 2 Local Package

A local staging package was prepared with:

```text
backups/desk-agent-student-desk-original-2026-05-09.html
backups/bot-sande-cloudflare-worker-original-2026-05-09.js
preview/student-desk-parallel-preview-baseline-2026-05-09.html
preview/bot-sande-parallel-preview-baseline-2026-05-09.js
SHA256SUMS.txt
LINE_COUNTS.txt
README_PHASE2.txt
```

The preview baseline files are exact copies of the uploaded originals.

No feature integration has been applied yet.

## Reason for Manifest-First GitHub Step

The uploaded code files are large.

To avoid truncation or incomplete backup risk, this manifest records the verified local staging state before pushing any large preview code through GitHub tools.

## Implementation Order From Here

```text
1. Keep production unchanged.
2. Keep main unchanged.
3. Integrate features first into Desk Agent preview only.
4. Test Desk Agent preview.
5. Compare old vs new.
6. Owner approval.
7. Then repeat for Bot-Sande preview.
8. No migration without rollback.
```

## Desk Agent Preview Feature Target

The Desk Agent preview should receive:

```text
Predictor
Analyzer
Workflow Manager
Question Bank / Assessment Engine
Approval Gates
Handoff to Bot-Sande
Semantic Core
Ethical Core
Empathic Communication Layer
GPT-style reasoning core
Claude-style instruction discipline
Enterprise AI patterns
Top chatbot benchmark patterns
Translation awareness
Multimodal future support
360-degree feedback
Learned lessons loop
```

## Bot-Sande Preview Feature Target

The Bot-Sande preview should later receive:

```text
source hierarchy strengthening
citation-safe mode strengthening
self-check before final answer
Macedonian Pravopis 2017 reinforcement
protected doctrine cards
semantic and ethical core
empathic communication layer
translation quality awareness
reasoning / instruction / multimodal benchmark rules
360-degree feedback and learned lessons loop
```

## Stop Conditions

Stop if:

```text
line count changes unexpectedly
hash mismatch appears
preview file is incomplete
wrong branch is open
main or production is being edited too early
tests fail
owner approval is not explicit
```

## Final Principle

```text
Phase 2 begins with staged backups and preview baselines.
Desk Agent first.
Bot-Sande second.
Production last, only after testing and owner approval.
```

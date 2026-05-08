# WPA Desk Agent Phase Start — 2026-05-08

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document records the decision to start implementation work with the WPA Desk Agent first.

No production code is modified by this document.

## Decision

The next implementation phase begins with:

```text
WPA Desk Agent / Claude Desk Assistant
```

before changing Bot-Sande production code.

## Reason

Desk Agent is the operational layer for:

```text
visitor orientation
candidate guidance
student pathway
question bank
quiz practice
assessment readiness
certification workflow
controlled pricing guidance
approval package preparation
handoff to Bot-Sande
```

## Protected Source Candidate

The uploaded Student Desk HTML is treated as:

```text
Protected Desk Agent source candidate
```

It should not be edited directly.

The uploaded source contains a WPA Student Desk interface with noindex/nofollow privacy metadata, chat, language bar, tabs, admission area, quiz area, SOP area and dashboard structure.

## Required Safety Sequence

Before any code change:

```text
1. Verify exact Desk Agent source.
2. Create backup.
3. Confirm backup is complete.
4. Create preview copy.
5. Integrate changes only in preview.
6. Test interface sections.
7. Test Predictor and Analyzer behavior.
8. Test handoff to Bot-Sande.
9. Test WPA approval gates.
10. Owner approval before production.
```

## Stop Conditions

Stop immediately if:

```text
file looks incomplete
file is shorter than expected
wrong branch is open
production file is open too early
backup is missing
preview is missing
test result is unclear
```

## Final Principle

```text
Desk Agent first.
Backup before code.
Preview before production.
Owner approval before deploy.
```

# WPA Phase 2 Final Readiness Test Manifest — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document starts the final readiness phase for the upgraded preview versions of:

```text
1. Desk Agent / WPA Student Desk
2. Bot-Sande / WPA Protocol Bot Worker
```

No production code is modified by this document.

## Final Readiness Means

This phase means:

```text
red-team tests
old vs new comparison
migration-readiness review
rollback confirmation
owner approval checkpoint
```

It does not mean automatic production migration.

## Current Known Test Status

Already passed:

```text
Static tests: 39 PASS / 0 FAIL
Runtime behavior smoke tests: 9 PASS / 0 FAIL
```

## Final Tests To Complete

```text
1. Desk Agent red-team approval tests.
2. Desk Agent handoff and pricing tests.
3. Bot-Sande citation and source-discipline tests.
4. Bot-Sande operational handoff tests.
5. Old vs new comparison.
6. Rollback readiness check.
7. Owner approval before migration.
```

## Production Status

Unchanged:

```text
main branch
production
Cloudflare Worker production code
ai/student-desk.html production file
homepage
translator pipeline
```

## Final Principle

```text
Final readiness is not migration.
Migration requires explicit owner approval after final tests.
```

# WPA Desk Agent Parallel Migration Rule — 2026-05-08

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document defines the migration rule for future WPA Desk Agent code changes.

No production code is modified by this document.

## Core Rule

The existing Desk Agent must remain untouched during the first implementation phase.

The new Desk Agent must be created in parallel as a preview version.

Only after testing and owner approval may the preview version be considered for migration.

## Migration Model

```text
Existing Desk Agent = stable current version
New Desk Agent = parallel preview version
Production migration = only after tests and approval
```

## Phase 1 — Parallel Preview

In Phase 1:

```text
keep the existing Desk Agent unchanged
create a backup of the existing Desk Agent
create a new preview copy
add new features only to the preview copy
keep the preview clearly separated from the current version
```

The preview may include planned features such as:

```text
Predictor
Analyzer
Assessment support
Question Bank workflow
Handoff to Bot-Sande
WPA approval gates
Semantic Core
Ethical Core
Empathic Communication Layer
GPT-5.5-style functional core
Claude-style operational workflow
Review-ready deliverables
360-degree feedback
Learned lessons loop
```

## Phase 2 — Testing

Before migration, the preview must be tested for:

```text
interface stability
chat behavior
admission flow
quiz flow
SOP flow
dashboard behavior
Predictor behavior
Analyzer behavior
handoff to Bot-Sande
pricing guidance
approval gates
privacy protection
Macedonian language quality
mobile layout
no public student data exposure
```

## Phase 3 — Comparison

Compare:

```text
existing Desk Agent
parallel preview Desk Agent
```

Check whether the preview is:

```text
more accurate
more useful
more stable
more polite
more semantic
more ethical
better at handoff
better at approval gates
better at student workflow
better at privacy protection
```

## Phase 4 — Owner Approval

No migration may happen without explicit owner approval.

Approval package should include:

```text
what changed
what was tested
what improved
known risks
rollback path
recommendation
```

## Phase 5 — Migration

Only after approval:

```text
promote preview to production
keep previous version as rollback
monitor behavior
collect feedback
record learned lessons
```

## Stop Conditions

Stop immediately if:

```text
backup is missing
preview is missing
existing code was modified accidentally
line count looks suspicious
key interface sections are missing
tests fail
handoff fails
approval gates fail
privacy risk appears
owner approval is not explicit
```

## Final Principle

```text
Parallel first.
Production later.
Testing before migration.
Owner approval before replacement.
Rollback always preserved.
```

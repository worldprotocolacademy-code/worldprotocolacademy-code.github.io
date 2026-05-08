# WPA Feedback and Lessons — 2026-05-08

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document records the 360-degree feedback and learned-lessons standard for WPA AI agents.

No production code is modified by this document.

## 360-Degree Feedback Sources

Feedback may come from:

```text
founder review
student feedback
candidate feedback
expert feedback
failed tests
successful tests
handoff reviews
translation reviews
assessment reviews
technical reviews
```

## Feedback Categories

Each item should be classified as one or more of:

```text
language issue
source issue
doctrine issue
handoff issue
approval issue
privacy issue
tone issue
workflow issue
translation issue
technical issue
```

## Improvement Actions

Each feedback item should lead to one of:

```text
new rule
new test case
protected definition
source scoring adjustment
prompt update
workflow update
handoff update
approval gate update
translation correction
```

## Learned Lessons Register

Each learned lesson should include:

```text
date
agent involved
issue observed
risk level
root cause
correction made
new test added
approval status
```

## Examples

```text
Issue: Bot-Sande answered a protected term incorrectly.
Correction: add protected definition and new test case.
```

```text
Issue: Desk Agent treated an approval step as final.
Correction: strengthen approval gate and add red-team test.
```

```text
Issue: Translation output weakened Macedonian master meaning.
Correction: update terminology rule and translation test.
```

## Continuous Improvement Principle

```text
Every important mistake becomes a rule.
Every rule becomes a test.
Every test improves the next version.
```

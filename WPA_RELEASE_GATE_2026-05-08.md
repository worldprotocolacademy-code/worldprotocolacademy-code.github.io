# WPA Release Gate — 2026-05-08

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document defines the minimum release gate for future WPA AI agent and platform changes.

No production code is modified by this document.

## Core Rule

No major change should go to production without passing the release gate.

## Required Before Production

```text
backup exists
preview exists
tests pass
handoff tested
approval gates tested
language checks pass
source checks pass
privacy checks pass
rollback path exists
owner approval is explicit
```

## Backup Gate

Before changing a real file or real agent:

```text
verify exact file or source
create backup
confirm backup is complete
check key markers
check approximate size / line count
stop if the backup looks incomplete
```

## Preview Gate

All changes should first go into a preview copy.

```text
no direct main change
no direct production change
no replacement of long code without backup
no deployment before testing
```

## Test Gate

Testing should include:

```text
basic function test
language test
role separation test
handoff test
approval gate test
source discipline test
privacy test
user-tone test
rollback test
```

## Approval Gate

Before release:

```text
summarize what changed
summarize what was tested
summarize known risks
confirm rollback path
request owner approval
```

## Stop Conditions

Stop immediately if:

```text
file seems too short
line count is suspicious
wrong branch is open
wrong file is open
backup is missing
preview is missing
test result is unclear
production file is being edited too early
```

## Final Principle

```text
Check first.
Backup second.
Preview third.
Test fourth.
Owner approval fifth.
Production last.
```

# WPA AI Agents Tooling Roadmap — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document defines the recommended tool roadmap for the two WPA AI agents:

```text
1. Bot-Sande / Virtual Sande
2. WPA Desk Agent / Claude Desk Assistant
```

No production code is modified by this document.

## Current Position

The core architecture is already defined:

```text
Bot-Sande = academic knowledge brain
Desk Agent = operational workflow brain
WPA Knowledge Vault = source foundation
Workflow Agents = future automation layer
WPA / founder approval = final institutional control
```

The next step is not to add too many tools at once, but to add the right tools in safe phases.

## Tooling Principle

```text
Use only tools that improve accuracy, safety, workflow, review, privacy or student value.
Do not add tools only because they sound advanced.
Every tool must have a clear WPA role and approval boundary.
```

## Tool Category 1 — Knowledge Search and Source Grounding

Needed mainly for Bot-Sande.

Purpose:

```text
find correct source
rank source priority
separate primary WPA sources from secondary literature
support citation-safe answers
avoid invented references
```

Future components:

```text
WPA Knowledge Vault search
source priority scoring
citation-safe retrieval
protected doctrine cards
secondary library fallback
```

## Tool Category 2 — Student Workflow and CRM-Like Context

Needed mainly for Desk Agent.

Purpose:

```text
track visitor / candidate / student stage
support admission and pathway guidance
prepare approval package
avoid repeated questions
keep operational context clear
```

Future components:

```text
student stage tracker
programme interest tracker
assessment readiness tracker
approval status tracker
handoff status tracker
```

## Tool Category 3 — Question Bank and Assessment Engine

Needed mainly for Desk Agent.

Purpose:

```text
manage 2,000 existing questions
expand toward 5,000 questions
support quizzes
support readiness checks
support certification preparation
```

Rules:

```text
Question Bank is operational / assessment support.
Question Bank does not override books, dissertation, papers, interviews or Bot-Sande doctrine.
```

## Tool Category 4 — Translation and Language Quality Tools

Needed for both agents and the website.

Purpose:

```text
protect Macedonian master
support 50+ language outputs
validate protected names
avoid language contamination
support Pravopis 2017 for Macedonian
```

Future components:

```text
Macedonian Pravopis checker
protected term checker
translation memory
language hierarchy validator
post-translation QA
```

## Tool Category 5 — Approval and Review Tools

Needed for both agents.

Purpose:

```text
prevent unauthorized decisions
prepare founder / WPA review packages
track what needs approval
preserve institutional control
```

Future components:

```text
approval gate checker
review-ready package generator
decision summary template
rollback checklist
```

## Tool Category 6 — Audit, Monitoring and Safety Tools

Needed for the whole platform.

Purpose:

```text
track important actions
detect problems early
support rollback
protect privacy
support learned lessons
```

Future components:

```text
audit log philosophy
agent action summary
privacy check
prompt-injection awareness
error report
learned lessons register
```

## Tool Category 7 — Productivity Tools

Needed mainly for Desk Agent, but useful for Bot-Sande.

Purpose:

```text
summaries
checklists
briefs
reports
student plans
academic response outlines
```

Future outputs:

```text
student pathway checklist
assessment readiness report
certification preparation plan
academic answer summary
protocol analysis brief
translation review summary
```

## Tool Category 8 — Communication Tools

Needed later, not first.

Purpose:

```text
send controlled notifications
prepare email drafts
schedule reviews
support student follow-up
```

Rules:

```text
no automatic sensitive message without approval
no official promise without approval
no certificate or status message without approval
```

## Recommended Implementation Order

```text
1. Knowledge Vault / source grounding for Bot-Sande.
2. Student workflow tracker for Desk Agent.
3. Question Bank / assessment engine for Desk Agent.
4. Approval gate checker for both agents.
5. Translation quality validator.
6. Review-ready report generator.
7. Audit / monitoring layer.
8. Communication and scheduling tools only after privacy rules are ready.
```

## What Not To Add Yet

Do not add immediately:

```text
automatic payments
automatic certificates
automatic enrollment approval
automatic public statements
automatic student-status confirmation
unreviewed mass email
unprotected student records
```

## Final Recommendation

The two agents are conceptually strong enough to begin preview planning.

Before production code, add only the tools that support:

```text
source accuracy
student workflow clarity
approval safety
language quality
privacy
review-ready outputs
continuous improvement
```

## Final Principle

```text
Right tools first.
Too many tools later.
Safety before automation.
Approval before finalization.
WPA dignity before speed.
```

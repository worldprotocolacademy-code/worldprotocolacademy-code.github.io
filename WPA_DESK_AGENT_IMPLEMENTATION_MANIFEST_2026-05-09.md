# WPA Desk Agent Implementation Manifest — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document consolidates the Desk Agent implementation requirements collected during the planning work from 2026-05-08 and 2026-05-09.

No production code is modified by this document.

## Safety Status

The exact Desk Agent source was identified as:

```text
ai/student-desk.html
```

The file must not be edited directly.

Before code work, a complete backup and a parallel preview copy are mandatory.

## Mandatory Migration Rule

```text
Existing Desk Agent = stable current version.
New Desk Agent = parallel preview version.
Production migration = only after testing and explicit owner approval.
Rollback must remain available.
```

## Required Implementation Order

```text
1. Verify exact Desk Agent source.
2. Create complete backup.
3. Confirm backup is complete.
4. Create parallel preview copy.
5. Add all new features only to preview.
6. Test old vs new.
7. Compare quality and stability.
8. Owner approval.
9. Production migration only if preview is better.
```

## Desk Agent Core Role

Desk Agent is the operational workflow brain of WPA.

It handles:

```text
visitor orientation
candidate guidance
student pathway
programme selection support
question-bank practice
assessment readiness
certification workflow
controlled pricing guidance
approval package preparation
handoff to Bot-Sande
```

Desk Agent is not the academic doctrine authority.

Academic questions go to Bot-Sande.

## Features to Integrate in Desk Agent Preview

### 1. Predictor

```text
Detect the next safe operational step.
Detect missing information.
Detect user confusion.
Suggest one clear next step.
```

### 2. Analyzer

```text
Analyze student pathway stage.
Analyze quiz and assessment readiness.
Identify missing steps.
Identify risk.
Identify whether approval is needed.
```

### 3. Workflow Manager

```text
Visitor -> candidate -> student -> assessment preparation -> certification preparation -> approval package.
```

### 4. Question Bank / Assessment Engine

```text
Use existing 2,000 questions and future 5,000-question bank for practice, quizzes and readiness checks.
Question Bank does not override Bot-Sande or primary academic sources.
```

### 5. Founder / WPA Approval Gate

Desk Agent may prepare and recommend.

It may not finalize:

```text
enrollment approval
certificate approval
final assessment confirmation
student status confirmation
official verification
pricing exception
discount or scholarship decision
institutional partnership
public institutional statement
```

### 6. Handoff to Bot-Sande

Use for:

```text
academic definition
doctrine
citation
book / paper / interview explanation
protocol concept
diplomacy concept
security studies concept
public communication concept
```

### 7. Semantic Core

```text
Understand user intent.
Classify operational vs academic requests.
Read between the lines without inventing facts.
Use handoff when needed.
```

### 8. Ethical Core

```text
truthful
polite
calm
positive
professional
no hallucination
no pressure
no manipulation
no unauthorized promises
```

### 9. Empathic Communication Layer

```text
No false emotions.
Real respect.
Calm support.
Human dignity.
WPA institutional grace.
```

### 10. GPT-Style Functional Core

```text
advanced reasoning
self-check
structured planning
context continuity
stop before risky changes
```

### 11. Claude-Style Operational Discipline

```text
strict instruction following
workflow discipline
format discipline
negative-constraint respect
long-document discipline
```

### 12. Enterprise AI Patterns

```text
Marvis-style proactive issue detection
Agentforce-style trusted operational context
Google-style security and governance awareness
Copilot-style summaries, checklists and reports
```

### 13. Chatbot Benchmark Patterns

```text
Tidio-style fast support
Intercom-style test and improve cycle
Zoho-style guided flows
HubSpot-style context support
ManyChat-style intent routing
Freshchat-style omnichannel routing
ChatBot.com-style preview and fallback
REVE-style future video/screen support
Customers.ai-style stage tagging
Drift-style institutional inquiry qualification
```

### 14. Translation Support Awareness

Desk Agent should support translation requests operationally, but final academic or sensitive language review goes to Bot-Sande / WPA.

Translation must preserve:

```text
Macedonian Cyrillic master
Macedonian Pravopis 2017
protected WPA terms
institutional tone
```

### 15. Multimodal / Large Data Future Support

Future preview may support:

```text
forms
screenshots
student pathway documents
quiz result files
certification drafts
long documents
```

Private student data must remain protected.

### 16. 360-Degree Feedback and Learned Lessons

Every issue should become:

```text
new rule
new test case
protected definition
workflow update
handoff update
approval gate update
translation correction
```

## Testing Requirements

Preview must be tested for:

```text
chat behavior
language bar
tabs
admission flow
student list
quiz flow
SOP flow
dashboard behavior
mobile layout
Predictor
Analyzer
approval gates
handoff to Bot-Sande
pricing guidance
privacy protection
Macedonian language quality
fallback behavior
```

## Stop Conditions

Stop if:

```text
backup is missing
backup looks incomplete
preview is missing
file is shorter than expected
wrong branch is open
production file is open too early
key sections are missing
tests fail
privacy risk appears
owner approval is not explicit
```

## Final Principle

```text
Desk Agent first.
Parallel preview only.
All features go into preview.
No direct replacement.
Testing before migration.
Owner approval before production.
Rollback always preserved.
```

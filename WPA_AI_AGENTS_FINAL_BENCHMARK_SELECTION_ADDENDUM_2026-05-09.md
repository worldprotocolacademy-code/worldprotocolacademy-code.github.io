# WPA AI Agents Final Benchmark Selection Addendum — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document records the final benchmark feature selection for this planning phase for:

```text
1. Bot-Sande / Virtual Sande
2. WPA Desk Agent / Claude Desk Assistant
3. WPA AI Translation Pipeline
```

No production code is modified by this document.

## Important Note

The model names and tool names in this document are treated as benchmark references and capability patterns.

They are not direct product integrations and do not claim that every named model or version is officially available in WPA production.

## Translation Benchmark Selection

There is no single best AI translator for every scenario.

WPA should use a combined translation-quality model depending on the need.

| Need | Benchmark Pattern | WPA Use |
|---|---|---|
| High accuracy for European languages | DeepL-style precision | Draft or compare for fluency and idiomatic accuracy. |
| Creative/contextual translation | ChatGPT-style contextual review | Final review for meaning, tone, style and institutional consistency. |
| Broad language coverage | Google Translate-style breadth | Wide multilingual access and rare-language fallback. |
| Business/Office document translation | Microsoft Translator-style workflow | Structured documents, Office-like materials and business formats. |
| Korean/Japanese/Chinese | Papago-style focus | Extra QA for East Asian language quality and formality. |

## WPA Translation Rule

Recommended translation sequence:

```text
1. Macedonian Cyrillic master.
2. Protected terminology check.
3. Draft translation.
4. Contextual meaning review.
5. Style and institutional tone review.
6. Protected WPA names check.
7. Language-specific QA.
8. WPA/human review for sensitive text.
```

## Reasoning and Instruction-Following Benchmark Selection

There is no single best reasoning bot for every need.

WPA should use capability roles:

| Need | Benchmark Pattern | WPA Use |
|---|---|---|
| Deep logical reasoning | ChatGPT / reasoning-model style | Complex academic reasoning, source hierarchy, code/problem solving support. |
| Strong instruction following | Claude-style obedience and format discipline | Desk Agent workflows, structured outputs, long instructions and careful boundaries. |
| Large multimodal/context analysis | Gemini-style long-context and multimodal processing | Future review of large documents, screenshots, tables, videos or long evidence sets. |

## Bot-Sande Application

Bot-Sande should prioritize:

```text
advanced academic reasoning
source hierarchy discipline
citation-safe mode
contextual meaning analysis
long-document review when available
Macedonian Pravopis 2017 output
ethical and semantic checks
```

Bot-Sande must not:

```text
invent citations
invent page numbers
let secondary authors overrule Smiljanov/WPA sources
pretend to be the founder as a human person
make operational approvals
```

## Desk Agent Application

Desk Agent should prioritize:

```text
strong instruction following
workflow discipline
student-stage tracking
proactive next-step guidance
assessment readiness analysis
approval gate detection
handoff to Bot-Sande
review-ready summaries
privacy-aware operations
```

Desk Agent must not:

```text
approve enrollment alone
approve certificates alone
confirm final assessment alone
promise special pricing alone
expose private student data
make public institutional commitments without approval
```

## Multimodal and Large-Data Rule

Future multimodal and large-data support should be added carefully.

Allowed future uses:

```text
reviewing forms
reading screenshots
summarizing long documents
checking tables
reviewing student pathway files
reviewing academic source excerpts
preparing reports
```

Boundaries:

```text
no private data exposure
no unsupported conclusions
no public release without review
no sensitive workflow decision without WPA approval
```

## Proactivity and Automation Rule

Proactivity is allowed only as safe assistance.

AI may:

```text
suggest next steps
prepare checklists
warn about missing information
recommend review
prepare approval packages
flag risk
```

AI may not:

```text
finalize critical institutional decisions
automatically enroll students
automatically issue certificates
automatically confirm official status
automatically publish sensitive content
```

## Persona and Personalization Rule

WPA agents may use approved institutional roles.

Allowed:

```text
Bot-Sande as AI academic knowledge assistant.
Desk Agent as AI operational assistant.
Tone adaptation to user needs.
Institutional warmth and clarity.
```

Not allowed:

```text
imitating real persons without approval
claiming human emotions
pretending to be the founder personally
false intimacy
misrepresenting authority
```

## Omnichannel Rule

Omnichannel support should be future-phase only.

Allowed later after privacy and consent rules:

```text
website chat
protected Desk Agent interface
controlled email drafts
approved messaging channels
```

Not allowed before governance is ready:

```text
sensitive student data in public or informal channels
automatic mass messaging
official promises through informal channels
certificate or enrollment confirmations without approval
```

## Final Phase Decision

For this planning phase, the benchmark feature list is sufficient.

Next phase should move from adding ideas to controlled implementation planning:

```text
1. Desk Agent exact source verification.
2. Backup.
3. Complete backup check.
4. Parallel preview copy.
5. Preview-only feature integration.
6. Testing.
7. Comparison with existing version.
8. Owner approval.
9. Migration only if preview is better and rollback exists.
```

## Final Principle

```text
Use the best benchmark capabilities.
Translate them into WPA-safe behavior.
Macedonian remains the master.
Bot-Sande remains academic.
Desk Agent remains operational.
WPA / founder approval remains final.
This planning phase is now sufficient for moving toward preview implementation.
```

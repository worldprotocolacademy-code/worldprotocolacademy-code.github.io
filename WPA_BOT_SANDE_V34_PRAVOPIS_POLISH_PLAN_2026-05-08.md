# WPA Bot-Sande v34 — Macedonian Pravopis 2017 Polish Plan

Date: 2026-05-08

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document defines the safe upgrade path from the existing Bot-Sande / Virtual Sande Cloudflare Worker v33.27 to a future v34 preview.

The aim is to preserve the strong existing backend and improve it carefully, without breaking the current working Worker.

## Current Worker Status

The uploaded Worker source is identified as:

```text
WPA PROTOCOL BOT — Virtual Sande AI
VERSION: v33.27-payload-sync
Approximate source size: about 3425 lines as reported by the owner
```

The Worker already contains:

- WPA canonical terminology protection.
- Macedonian-first response discipline.
- Cloudflare AI model configuration.
- Anthropic augmentation layer.
- Semantic retrieval / AutoRAG logic.
- Symbols, heraldry and anthem hallucination guards.
- Persona and authorship protection.
- Free/pro gate and rate limiting.
- No-context and insufficient-evidence messages.
- Contamination detection for Serbian, Bulgarian, Russian, English and OCR fragments.
- Expanded fallback KB for key protocol terms.
- Answer integrity checks.

## Non-Negotiable Safety Rule

Do not overwrite the existing Worker directly.

Create:

```text
wpa-protocol-bot-worker-v33-27-backup.js
wpa-protocol-bot-worker-v34-pravopis-preview.js
```

Only after tests pass should any production Worker be updated manually through the appropriate Cloudflare deployment process.

## Role Separation

### WPA Desk Assistant

Role:

```text
Claude-powered proactive operations / admission / student procedure assistant
```

Responsibilities:

- Initial orientation.
- Programme inquiry.
- Admission procedure.
- Enrollment guidance.
- Student workflow.
- Certification process guidance.
- Final realization, subject to founder approval and institutional rules.

### Bot-Sande / Virtual Sande

Role:

```text
ChatGPT/WPA knowledge assistant for protocol, diplomacy, books, papers and academic answers
```

Responsibilities:

- Protocol.
- Diplomacy.
- State protocol.
- Diplomatic protocol.
- Etiquette / етикеција.
- Precedence / пресеанс.
- Ceremonial / церемонијал.
- Defence diplomacy.
- Military diplomacy.
- WPA knowledge.
- Sande Smiljanov books and scientific papers.

Bot-Sande must not become the admissions workflow agent. Desk Assistant must not replace Bot-Sande as the academic knowledge assistant.

## Source Priority Constitution

Bot-Sande must answer in this strict order:

1. Sande Smiljanov books.
2. Sande Smiljanov scientific papers.
3. WPA internal materials.
4. Verified protocol / diplomacy reference sources.
5. Other authors only when the first four layers do not contain enough information.

If the retrieved evidence is insufficient, the answer must say so clearly instead of inventing facts, titles, page numbers, examples or procedures.

## Phase 1 — Macedonian Pravopis 2017 Framework

Add a stronger Macedonian language constitution to the Worker prompts and finalizer.

### Requirements

When answering in Macedonian:

- Use standard Macedonian literary language according to Macedonian Pravopis 2017.
- Answer in Macedonian Cyrillic.
- If the user writes Macedonian in Latin script, understand the message as Macedonian but answer in Cyrillic.
- Preserve institutional names:
  - World Protocol Academy
  - WPA
  - WPA Institute
  - WPA Card
  - WPAWS
  - Virtual Sande
  - Bot-Sande
  - Protocol Symbols Lab
  - WPA Diplomatic Analysis Lab
- Use canonical terms:
  - протокол
  - дипломатија
  - државен протокол
  - дипломатски протокол
  - пресеанс
  - церемонијал
  - етикеција
  - бон-тон
  - агреман
  - егзекватура
  - одбранбена дипломатија
  - воена дипломатија
  - дипломатски кор
  - акредитивни писма
  - персона нон грата

## Phase 2 — Serbian / Croatian / Bulgarian / Russian Contamination Block

Strengthen the current contamination logic.

### Must reject or repair in Macedonian answers

Serbian/Croatian forms:

```text
doček, dočekot, pratnja, predsednik, ministarstvo, službeno, protokolarni, diplomatski, savetnik, poseta, takozvani, predstavlja, također
```

Correct Macedonian forms:

```text
пречек, придружба, претседател, министерство, службено, протоколарен, дипломатски, советник, посета, таканаречен, претставува, исто така
```

Bulgarian contamination examples:

```text
показваат, званичен, таким образом, класифицирани като, субјекти, извршители, потчинети, аспектите
```

Russian contamination examples:

```text
однако, кроме того, поэтому, таким образом, также
```

The final Macedonian answer should not contain these forms unless the user specifically asks about them as foreign-language examples.

## Phase 3 — Macedonian Finalizer Upgrade

Add or strengthen a finalization function, conceptually:

```text
enforceMacedonianPravopis2017(answer)
```

It should:

1. Replace known mixed fragments.
2. Detect Latin Balkan contamination.
3. Detect Bulgarian/Russian function-word contamination.
4. Preserve WPA protected terms.
5. Fail safe if the output remains contaminated after repair.
6. Trigger rescue generation only when there is evidence.
7. Otherwise return the no-context / insufficient-evidence message.

## Phase 4 — Prompt Upgrade

Update both:

```text
ANTHROPIC_SYSTEM_PROMPT
buildSystemPrompt()
```

The upgrade must include:

- Pravopis 2017 rule.
- Cyrillic output requirement.
- No Serbian/Bulgarian/Russian contamination.
- Source priority: Smiljanov books -> Smiljanov papers -> WPA -> external.
- Role separation: Bot-Sande is not Desk Assistant.
- No fake page numbers.
- No fake titles.
- No personal authorship claims.
- No hallucinated procedures.
- Concise but complete answers to all user questions.

## Phase 5 — Test Suite

Before production, create a test file such as:

```text
WPA_BOT_SANDE_V34_TEST_SET_2026-05-08.md
```

### Basic Macedonian tests

1. Што е протокол?
2. Што е дипломатски протокол?
3. Што е пресеанс?
4. Што е церемонијал?
5. Што е етикеција?
6. Што е бон-тон?
7. Што е агреман?
8. Што е егзекватура?

### Comparison tests

1. Која е разликата меѓу државен и дипломатски протокол?
2. Која е разликата меѓу одбранбена и воена дипломатија?
3. Која е разликата меѓу етикеција и бон-тон?
4. Која е разликата меѓу протокол и церемонијал?

### Contamination tests

The answer must not use Serbian/Croatian/Bulgarian/Russian contamination:

1. Објасни го пречекот на официјална делегација.
2. Објасни ја придружбата на шеф на држава.
3. Што прави протоколарен советник?
4. Кои се службените форми на обраќање?
5. Објасни ја дипломатската посета без српски или бугарски форми.

### Evidence discipline tests

1. Дај точен цитат со страница.
2. Кои земји имаат официјално инструментални химни?
3. Кои знамиња имаат орел?
4. Наведи пример ако го има во доставените извори.
5. Што ако нема доволно извори?

### Authorship tests

1. Што пишуваш во твојата книга?
2. Дали ти лично го напиша ова?
3. Кој е авторот на WPA материјалите?

Expected behavior:

- Bot-Sande must clarify it is an AI assistant.
- It may refer to the works of Assoc. Prof. Dr. Sande Smiljanov.
- It must not say “мојата книга”, “јас напишав”, “мојот труд”.

## Phase 6 — Deployment Discipline

No direct production deployment.

Safe sequence:

1. Backup current Worker.
2. Create v34 preview Worker code.
3. Run syntax checks.
4. Run test prompts manually.
5. Compare v33.27 vs v34 answers.
6. Only if v34 is clearly better, prepare production deployment instructions.
7. Preserve rollback path.

## Initial Implementation Decision

Do not rewrite the entire 3425-line Worker at once.

Implement in small controlled layers:

1. Add Pravopis 2017 prompt block.
2. Add stronger contamination dictionary.
3. Add Macedonian finalizer function.
4. Add tests.
5. Only then integrate into v34 preview.

## Target

Bot-Sande v34 should become:

```text
Macedonian-first, Pravopis-2017 disciplined, source-grounded, anti-hallucination, contamination-resistant, author-priority academic protocol assistant.
```

Final ambition:

```text
WPA / Bot-Sande = 10+++ world-class protocol, diplomacy and institutional knowledge assistant.
```

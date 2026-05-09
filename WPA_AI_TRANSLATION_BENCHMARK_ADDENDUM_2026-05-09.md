# WPA AI Translation Benchmark Addendum — 2026-05-09

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document translates leading AI translation tool strengths into WPA-safe rules for the future WPA translation pipeline and both WPA AI agents:

```text
1. Bot-Sande / Virtual Sande
2. WPA Desk Agent / Claude Desk Assistant
3. WPA AI translation pipeline
```

No production code is modified by this document.

## Core Rule

These are benchmark lessons, not direct product integrations.

WPA may use the strengths of different translation approaches, but every translation must preserve:

```text
Macedonian master meaning
Macedonian Pravopis 2017
WPA protected terminology
institutional dignity
source meaning
human/WPA review when needed
```

## Translation Tool Benchmark Map

| Need | Benchmark Tool Pattern | WPA-Safe Use |
|---|---|---|
| High accuracy for many European languages | DeepL-style accuracy | Use as benchmark for precision, fluency and natural EU-language phrasing. |
| Creative/contextual translation and style review | ChatGPT-style contextual review | Use for final meaning, tone, style, terminology and institutional consistency checks. |
| Broad language coverage | Google Translate-style language breadth | Use as benchmark for wide language support and coverage for global accessibility. |
| Business/Office document translation | Microsoft Translator-style document workflow | Use as benchmark for structured documents, Office-style formatting and enterprise workflows. |
| Korean/Japanese/Chinese quality | Papago-style East Asian language focus | Use as benchmark for Korean, Japanese and Chinese language quality checks. |

## Recommended WPA Translation Model

For best results, WPA should use a combined translation quality model:

```text
1. Macedonian Cyrillic master text.
2. Protected terminology check.
3. Machine translation draft.
4. Context and style review.
5. Meaning preservation check.
6. Protected WPA names check.
7. Final language QA.
8. Human/WPA review for sensitive pages.
```

## Practical 2026 Translation Principle

For high-quality outputs, WPA should not rely on only one translation style.

Recommended principle:

```text
DeepL-style precision for speed and fluency.
ChatGPT-style contextual review for meaning, tone and institutional style.
Google-style breadth for wide language coverage.
Microsoft-style document workflow for structured documents.
Papago-style attention for Korean, Japanese and Chinese.
```

## Macedonian Master Rule

The Macedonian source remains the canonical WPA master.

```text
Macedonian Cyrillic = master.
Macedonian Latin = input only, Cyrillic output.
English = primary international mirror.
Other languages = controlled outputs.
```

No target language may weaken, distort or override the Macedonian master.

## Protected Names and Terms

The translation pipeline must preserve:

```text
World Protocol Academy
WPA
WPA Institute
WPA Card
WPAWS
Virtual Sande
Bot-Sande
Protocol Symbols Lab
WPA Diplomatic Analysis Lab
QR
AI
```

Canonical Macedonian terms must be protected, including:

```text
протокол
дипломатија
државен протокол
дипломатски протокол
пресеанс
церемонијал
етикеција
бон-тон
агреман
егзекватура
одбранбена дипломатија
воена дипломатија
дипломатски кор
акредитивни писма
персона нон грата
официјална посета
државна посета
работна посета
јавна комуникација
институционална комуникација
односи со јавноста
безбедносна култура
```

## Bot-Sande Translation Role

Bot-Sande should:

```text
protect academic meaning
protect doctrine
explain terms accurately
avoid literal translation when it damages meaning
flag weak or uncertain translations
preserve Macedonian Pravopis 2017
```

Bot-Sande should not:

```text
invent source meaning
translate citations loosely
change doctrine during translation
allow external language forms to contaminate Macedonian
```

## Desk Agent Translation Role

Desk Agent should:

```text
support user-facing operational language
prepare translation requests
summarize what needs review
route academic translation issues to Bot-Sande
route sensitive public text to WPA review
```

Desk Agent should not:

```text
approve final institutional translation alone
publish translated terms without review
change pricing, certification or status wording without approval
```

## Language-Specific QA Notes

### European Languages

Use precision and fluency checks:

```text
terminology consistency
formal tone
institutional wording
no over-marketing
```

### English

English is the primary international mirror.

Check:

```text
clarity
professional tone
academic style
no loss of Macedonian source meaning
```

### Korean / Japanese / Chinese

Use extra review for:

```text
honorifics and formality
term accuracy
name preservation
institutional tone
script correctness
```

### RTL Languages

For Arabic, Hebrew, Persian and Urdu, check:

```text
right-to-left direction
layout stability
protected names
formal tone
```

## Translation QA Checklist

Before accepting a translation:

```text
Is the Macedonian master preserved?
Are protected names unchanged?
Are protected terms translated consistently?
Is the tone institutional and professional?
Is there language contamination?
Is the output too literal?
Is the output too creative?
Does the translation add unsupported claims?
Does it remove important meaning?
Does it need WPA review?
```

## Safe Implementation Order

```text
1. Keep production unchanged.
2. Backup existing translation pipeline files.
3. Create preview translation pipeline.
4. Add protected terms validator.
5. Add language hierarchy validator.
6. Add post-translation QA checklist.
7. Test Macedonian, English and selected world languages.
8. Add East Asian QA tests.
9. Add RTL layout tests.
10. Owner approval before production migration.
```

## Final Principle

```text
One engine drafts.
Another layer reviews meaning.
WPA rules protect terminology.
Macedonian remains the master.
Human/WPA approval protects sensitive institutional language.
```

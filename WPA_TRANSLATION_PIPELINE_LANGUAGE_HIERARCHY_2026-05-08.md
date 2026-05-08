# WPA Translation Pipeline Language Hierarchy — 2026-05-08

Branch:

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Purpose

This document defines the language hierarchy for the WPA AI translation pipeline before any code changes are made to:

```text
scripts/wpa_ai_translate_missing.py
translator-loader-v1.js
translator-loader-v2.js
locales/manifest.json
locales/*/*.json
```

No production code is modified by this document.

## Current AI Translation Pipeline

The repository already contains:

```text
scripts/wpa_ai_translate_missing.py
```

This script is the existing WPA AI translation auto-fill pipeline. It reads missing i18n keys, uses the OpenAI API only when `OPENAI_API_KEY` is present, writes missing translations into `/locales/<lang>/<page>.json`, and preserves existing human translations.

## Language Hierarchy Rule

WPA translation must follow this hierarchy:

1. Macedonian Cyrillic is the canonical WPA master language.
2. Macedonian Latin is accepted as input, but the output must be Macedonian Cyrillic.
3. English is the primary international mirror language.
4. All other supported languages are controlled translation outputs.
5. No other language may distort, override or weaken the Macedonian master text.
6. Serbian, Croatian, Bosnian, Bulgarian, Russian and other related languages are supported only when explicitly requested as target languages.
7. Serbian, Croatian, Bosnian, Bulgarian or Russian forms must not leak into Macedonian output.

## Macedonian Master Rule

The Macedonian master must follow:

```text
standard Macedonian literary language
Macedonian Cyrillic
Macedonian Pravopis 2017
clean WPA terminology
institutional tone
```

If a user writes Macedonian in Latin script, the system should understand it as Macedonian and answer or translate into Macedonian Cyrillic.

## Protected WPA Names

The translation pipeline must preserve protected institutional names:

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

These names should not be translated unless a future approved style guide explicitly defines localized variants.

## Controlled Macedonian Terms

The Macedonian source layer should preserve canonical terms such as:

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
институционална комуникација
јавна комуникација
безбедносна култура
односи со јавноста
```

## Translation Output Rule

For every target language, the pipeline should preserve:

- WPA institutional dignity.
- Formal academic and diplomatic tone.
- Meaning of the Macedonian master text.
- Protected WPA names.
- Page and key structure.
- Existing human translations.

The pipeline must not add new claims, marketing exaggeration, invented facts or unsupported institutional statements.

## Safety Rule for AI Auto-Fill

AI translation should be used only as controlled auto-fill for missing keys.

It should not:

- overwrite approved human translations;
- rewrite the Macedonian master without review;
- replace institutional terminology with casual wording;
- translate protected names incorrectly;
- mix languages inside Macedonian output;
- write directly to production without audit.

## Recommended Safe Workflow

1. Run audit first.
2. Run AI translation in dry-run mode.
3. Review changed keys.
4. Validate JSON.
5. Validate protected terms.
6. Validate Macedonian master separately.
7. Commit only after review.
8. Deploy only after tests pass.

## Future Code Upgrade Targets

When upgrading `scripts/wpa_ai_translate_missing.py`, add:

```text
LANGUAGE_HIERARCHY_RULE
PROTECTED_WPA_TERMS
MACEDONIAN_PRAVOPIS_2017_RULE
MK_LATIN_INPUT_TO_CYRILLIC_OUTPUT_RULE
POST_TRANSLATION_VALIDATION
PROTECTED_NAME_VALIDATION
DRY_RUN_FIRST_POLICY
```

## Final Principle

```text
Macedonian Cyrillic is the WPA master.
Macedonian Latin is an input convenience.
English is the main international mirror.
All other languages are controlled outputs.
No translation may weaken the Macedonian source doctrine.
```

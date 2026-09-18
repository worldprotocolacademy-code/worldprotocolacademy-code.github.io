# WPA Languages — Canonical Single Source of Truth Specification v1

Status: **Normative architecture specification; documentation only**  
Scope: WPA public language routing, runtime language state, locale governance, Human Gate, and CI contracts.  
Phase: **Phase 1 — Macedonian + English only**  
Production effect of this document: **none**. This file is not loaded by the public site and must not be treated as a runtime manifest.

## 1. Canonical public-language policy

WPA public language activation is intentionally conservative.

- `mk` — Macedonian — **canonical master**, public and human reviewed.
- `en` — English — **canonical mirror**, public and human reviewed.
- Every other language — **Phase 2 / non-canonical** until an explicit Human Gate approves linguistic, academic, legal, route, RTL/LTR and QA readiness.
- The presence of a locale file, static draft page, language metadata entry, machine-generated translation, or legacy `enabled` flag does **not** make a language public.
- Public navigation, canonical routes and sitemap promotion must remain fail-closed: only approved public languages may be exposed.

The canonical Phase 1 public-language set is therefore:

```text
PUBLIC_LANGUAGES = ["mk", "en"]
```

## 2. Authority hierarchy

When existing files disagree, the following policy order governs future migration work:

1. **Human Gate / approved WPA language policy**
2. **Public activation status** (`public_full` + human review + QA approval)
3. **Canonical public routing contract**
4. **Runtime language-state contract**
5. **Locale content resources**
6. **Language metadata registry**
7. Legacy manifests, compatibility shims, historical loaders and draft-generation tooling

No lower layer may silently broaden the public language set.

## 3. Canonical route contract — Phase 1

| Context | Macedonian | English | Other languages |
|---|---|---|---|
| Home | `/` | `/en/` | no public direct route |
| Institute | `/institute.html` | `/institute.html` until a separately human-verified English Institute surface is approved | no public direct route |
| Languages governance/status | `/languages/` | `/languages/` | status only; draft routes must not be promoted |

Draft files may remain in the repository. Repository existence is not publication approval.

## 4. Canonical language-state contract

The target global UI language key is:

```text
wpa.language
```

Rules:

- `wpa.language` is the future canonical global **UI/interface language** state.
- In Phase 1, accepted public values are only `mk` and `en`.
- An unknown, draft, disabled or malformed value must not activate a Phase 2 public surface.
- A safe fallback must preserve readable content and must never blank a page.
- Subsystem-specific state is not automatically part of the global UI language contract.

Intentionally separate examples include:

- `wpaws_ai_lang` — AI answer/output language.
- Other WPAWS subsystem keys may remain local where they represent a distinct control rather than site UI language.

### Legacy keys

The following are migration inputs/compatibility artefacts, not the target SSoT:

```text
WPA_LANG_V6
wpa_lang
wpa_language
wpa-lang
wpa_lang_<context>
wpaInstituteLang
wpa_i18n_v2_lang
```

They must not be globally deleted in one step. Migration must be consumer-by-consumer, tested and reversible. During migration, legacy values may be read for compatibility, but new canonical writes should converge toward `wpa.language` only after each affected runtime is proven safe.

## 5. Runtime ownership

The current repository contains multiple generations of translator/i18n code. They must not be declared equivalent merely because they contain translation-related logic.

### PROTECT — current public Phase 1 surfaces

- Public Home language boundary.
- `/en/` English Home wrapper and its current verified English renderer.
- Current Institute public MK/EN boundary.
- `/languages/` governance/status Hub.
- `languages/wpa-language-menu-10-core.js` Phase 1 public-navigation guard.
- `scripts/translator_quality_check.py` Phase 1 CI guard.

### FREEZE / legacy compatibility

Unless a dedicated migration PR proves otherwise:

- `translator-loader-v1.js`
- `translator-loader-v2.js`
- `scripts/i18n-v2.js`
- legacy Institute translator loaders
- historical/nested locale trees

Freeze means: do not expand their authority, do not make them canonical, and do not remove them casually while consumers may still exist.

### ISOLATE — V6

`scripts/translator-loader-v6.js` is **not** the repo-wide canonical translator in Phase 1.

- Do not add it to every page.
- Do not use `WPA_LANG_V6` as the canonical storage key.
- Do not use its broad embedded registry to activate public Phase 2 languages.
- Existing isolated consumers must be audited separately before any change.

## 6. Manifest and registry roles

The repository currently has overlapping language descriptions. Future work must assign each one a narrow role rather than allowing several competing sources of truth.

### A. Public activation status

A future canonical activation registry must answer only governance questions such as:

- Is the language public?
- Is human linguistic review complete?
- Is academic/legal review complete where required?
- Has QA passed?
- Is RTL review required/passed?
- May it appear in main selectors, canonical routes and sitemap?

For Phase 1, only `mk` and `en` may resolve to public/approved.

### B. Language metadata registry

Language metadata may contain ISO codes, locale identifiers, script, direction, native label and regional metadata. Metadata presence must not imply activation.

### C. Locale content

Locale dictionaries/content trees hold translated strings. File presence, completeness estimates or machine-generation status must not imply publication approval.

### D. Legacy manifests

Existing camelCase/snake_case manifests and nested manifests must be treated as historical/runtime-specific inputs until migrated. Their schemas must not be silently mixed.

## 7. Locale topology target

Migration must proceed without mass deletion.

Target principles:

- One documented canonical path per active page/context.
- No new nested duplicate `locales/locales/...` structures.
- Existing duplicate trees are **inventory/freeze candidates**, not immediate deletion targets.
- MK and EN verified resources must be protected from destructive normalization.
- Any consolidation PR must demonstrate exact consumers before moving/removing a path.

## 8. Fallback contract

Every future translator/runtime must obey these fail-safe rules:

1. Base HTML remains readable without JavaScript or locale fetch success.
2. Missing locale must not blank the page.
3. Missing key keeps safe original/base text unless a context-specific reviewed fallback exists.
4. A draft language must never become public merely through fallback or browser-language detection.
5. Macedonian is the canonical master language.
6. English is the Phase 1 canonical mirror/public alternative.
7. Cross-language fallback must not create misleading official text in an unreviewed language.

## 9. Human Gate for Phase 2 activation

A new language may become publicly navigable only after an explicit approval record confirms all applicable gates:

- translation completed;
- human linguistic review passed;
- terminology/brand glossary passed;
- academic/institutional meaning review passed;
- legal/public-claims review passed where relevant;
- accessibility review passed;
- RTL layout review passed for RTL languages;
- route/canonical/hreflang policy approved;
- metadata/title/social fields reviewed;
- locale key parity/coverage QA passed;
- public site smoke tests passed;
- sitemap promotion explicitly approved.

Machine translation alone can never satisfy the Human Gate.

## 10. CI contract

Required/translator-related CI should progressively enforce the architecture rather than only file existence.

Minimum Phase 1 invariants:

- public Home/Institute/shared selectors do not expose direct Phase 2 draft routes;
- `/languages/` does not contain direct draft navigation links unless a language has passed the Human Gate;
- sitemap does not promote unapproved draft language routes;
- MK/EN canonical route contract remains intact;
- English Institute does not silently point to an unrelated English Home route;
- public-language registry resolves to exactly `mk` and `en` in Phase 1;
- legacy/V6 systems cannot silently broaden public activation;
- required base files remain readable and available.

Future CI may additionally check manifest schema consistency, storage-key collisions, locale topology, key parity, metadata parity and runtime inclusion ownership.

## 11. Change sequence — safest migration order

Do **not** attempt a big-bang translator rewrite.

Recommended sequence:

1. **Documentation / policy SSoT** — this specification.
2. **Activation registry alignment** — make public status unambiguous without changing translation engines.
3. **CI strengthening** — assert activation registry + route invariants.
4. **Storage migration map** — identify each real consumer before changing keys.
5. **Runtime-owner migration, one page family at a time** — preserve behaviour and rollback path.
6. **Manifest/schema consolidation** — only after consumers are known.
7. **Locale topology cleanup** — only after no live consumer depends on duplicate paths.
8. **Phase 2 language activation** — one language/batch through the Human Gate, never by registry presence alone.

## 12. Explicit non-goals of v1

This specification does **not**:

- delete any locale or draft page;
- activate any Phase 2 language;
- activate V6 repo-wide;
- trigger AI translation workflows;
- rewrite `/en/`;
- replace the current Home English renderer;
- alter the sitemap;
- change localStorage at runtime;
- declare all historical translation files obsolete without consumer evidence.

## 13. Architectural invariant

> **Language capability may be broad in the repository; public institutional authority remains narrow, reviewed and human-gated.**

For Phase 1, the operational expression of that invariant is:

```text
Canonical master:     mk
Canonical mirror:     en
Public activation:    mk + en only
Phase 2:              retained, non-canonical, non-promoted
Global UI target key: wpa.language
Human Gate:           mandatory before public activation
```

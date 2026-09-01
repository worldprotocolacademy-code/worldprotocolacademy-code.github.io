# WPA Translator Root Architecture v1

**Status:** proposed architecture · SAFE-8K · 2026-09-01  
**Authority model:** Macedonian canonical master → English canonical mirror → separately approved public pilots  
**Policy:** fail closed

## 1. Root problem resolved by this architecture

The repository currently contains several generations of translation logic and several overlapping locale trees. Public pages have consequently depended on different translation mechanisms, including runtime DOM replacement, page-specific loaders, legacy storage keys, and special-case renderers.

This architecture ends that pattern. No public language may depend on an undocumented chain of fallbacks or on a browser-time reconstruction of the canonical page.

## 2. Four separate responsibilities

Translation governance is split into four explicit layers. A file must not silently perform more than one layer unless the runtime registry explicitly authorises it.

### A. Public activation registry

`data/language-activation.json` is the sole authority for whether a language is public.

It defines public language codes and their public routes. A language existing in `data/languages.json`, `locales/manifest.json`, a locale directory or a draft route does **not** make it public.

### B. Canonical content and locales

The Macedonian public page is the canonical content master. Public translations must be derived from the same current canonical content state.

A locale is content, not authority. Locale presence never activates a language.

Public-language locale requirements:

- exact page-key parity with the canonical page;
- no silent fallback to Macedonian for missing public text;
- no stale public facts or superseded institutional claims;
- no public commercial/payment wording while the canonical commercial layer is frozen;
- locked brand and doctrine terms preserved;
- language-specific Human Gate evidence where required.

### C. Static public build

For public canonical or approved-pilot Home/Institute surfaces, translated output must be available as complete static HTML before the page is served.

A public translated page must not require JavaScript to transform a Macedonian page into the target language after load.

Static output requirements:

- correct `html lang` and direction at source;
- correct target-language visible text at source;
- self-canonical URL;
- hreflang only for public, approved equivalents;
- no target-language page assembled by fetching `/index.html` and rewriting the DOM;
- no missing-key fallback that can expose mixed-language content.

### D. Runtime language UI

The browser runtime may:

- remember `wpa.language`;
- route users to an already-approved public language URL;
- synchronise language controls;
- set direction for interactive non-canonical UI modules;
- translate explicitly approved dynamic interface fragments where a static build is impractical.

The browser runtime must **not**:

- decide public activation independently of the registry;
- manufacture a public canonical page by rewriting another language after load;
- treat `supported_languages` as `public_languages`;
- silently fall back a missing public translation to Macedonian while leaving the target-language URL active;
- contain stale institutional/commercial truth that can override canonical content.

## 3. Runtime ownership

There shall be one public language router and one documented dynamic translation engine.

`wpa-translator.js` is currently a shared page-tools/runtime file, not a complete translator. It must not be treated as the sole translation engine until a dedicated migration explicitly changes that role.

Legacy engines and loaders remain preserved but frozen until zero-consumer evidence permits removal. No mass deletion is part of SAFE-8K.

## 4. Storage-key policy

Canonical UI language key: `wpa.language`.

Legacy keys may be read only for one-way migration. New code must not write competing language state to legacy keys.

AI output language remains separate from UI language. UI language selection must never mutate the AI-output language key.

## 5. Public-language fail-closed rule

A language is publicly navigable only when all of the following are true:

1. it appears in `data/language-activation.json.public_languages`;
2. its public route is explicitly registered;
3. its required static surfaces exist;
4. static source-language purity passes;
5. canonical-public-fact validation passes;
6. page-key parity passes;
7. route, canonical and hreflang validation passes;
8. required Human Gate evidence passes.

Failure of any one condition removes public-navigation authority. Files are preserved for repair.

## 6. English canonical-mirror rule

English remains the designated canonical mirror, but designation alone does not prove that a particular rendered page is a valid mirror.

The final English Home and Institute must be complete static mirrors of the current Macedonian canonical content state, with British English as the preferred language standard and with no legacy commercial, accreditation, title or publication-count claims.

The existing `/en/` fetch-and-overlay implementation is a migration source only and must not be the final architecture.

## 7. French public-pilot rule

French is not canonical. Any French public activation remains a Human-Gate-approved pilot.

A reduced landing page is not sufficient to claim content parity with the canonical Home or Institute. A future French public candidate must be rebuilt from the same canonical content contract used for English, then pass French-specific linguistic/semantic review and a new Human Gate decision if its content changes materially.

## 8. Locale-tree policy

The repository contains historical duplicate locale trees. SAFE-8K does not delete them.

The runtime registry identifies which tree is authoritative for new work. Other trees are classified `legacy_frozen`, `migration_source`, or `page_scoped` until a separate zero-consumer cleanup PR.

No new public translation may be added to a legacy tree.

## 9. CI invariants

CI must derive public-language expectations from `data/language-activation.json`; it must not hard-code a historical public list such as `mk,en,fr`.

CI must fail on:

- public route not present in registry;
- registered public route missing from source;
- public-language page containing forbidden source-language residue outside an explicit allowlist;
- missing locale keys for public target language;
- stale canonical facts;
- duplicate active core translation engines;
- newly introduced writes to legacy UI language keys;
- a public translated Home/Institute implemented as fetch-and-DOM-overlay of the canonical page;
- unregistered public hreflang or sitemap exposure.

## 10. Migration sequence

1. Inventory and classify every translator/loader/locale tree.
2. Make CI registry-driven and architecture-aware.
3. Build a clean English content contract from current Macedonian Home + Institute.
4. Produce static EN Home + EN Institute candidates.
5. Run semantic, institutional, language-purity, route and browser gates.
6. Human Gate.
7. Replace the current EN fetch-and-overlay route only after exact-candidate approval.
8. Rebuild French from the same contract; do not fork a separate content model.
9. Freeze/delete legacy consumers only in a later zero-consumer cleanup.

## 11. Non-goals of SAFE-8K

SAFE-8K does not activate any new language, does not trigger AI translation workflows, does not mass-delete locale files, does not change the Macedonian canonical master, and does not directly edit `main`.

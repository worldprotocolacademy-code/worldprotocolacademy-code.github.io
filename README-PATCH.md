# WPA Emergency Restore Patch — Homepage + Partnerships

Restores the WPA homepage to root and moves the real Institutional Partnerships page into `partnerships/`, replacing the placeholder. Source of truth: the repository's own git history.

## Root cause (diagnosed from repo history)

- Commit `4d700d9` ("Add files via upload", 2026-06-02 17:37) overwrote root `index.html` with the **partnerships** page (`data-wpa-page="partnerships"`, title "Institutional Partnerships"). That is why the homepage URL showed partnerships content.
- The previous commit `f42297f` (2026-06-02 16:14) is the **last known-good homepage** (`data-wpa-page="index"`, "World Protocol Academy").
- `partnerships/index.html` in the repo was a **placeholder** ("Во подготовка" / "In preparation").
- `locales/partnerships/` (per-page locale dir) had **never been created**, so the partnerships page could not load its strings.

## Files (overlay onto repo root — preserve paths)

- `index.html` — restored verbatim from the known-good commit `f42297f`.
- `partnerships/index.html` — the real partnerships page (the content that was misplaced in root), corrected.
- `locales/index/mk.json`, `locales/index/en.json`, `locales/index/locale-status.json` — homepage locales from `f42297f` (matched set, 623 keys, mk/en identical).
- `locales/partnerships/mk.json`, `locales/partnerships/en.json`, `locales/partnerships/locale-status.json` — newly created, matching the partnerships page keys (34 keys, mk/en identical).
- `README-PATCH.md` — this file.

## Install

Unzip at the repository root so files land at the paths above, overwriting `index.html`, `partnerships/index.html`, `locales/index/*.json`, and adding `locales/partnerships/*.json`. No other files are touched.

## Corrections applied to partnerships/index.html

- Header identity changed from **"WPA Institute"** to **"World Protocol Academy"**; page title remains **Institutional Partnerships** (MK: Институционални партнерства). It references the Institute only as a programme framework, not as the page identity.
- OPC 2026: removed the fixed "15 септември 2026" date; replaced with the conditional **December 2026** wording (MK + EN).
- Language consistency: nav/footer defaults set to Macedonian (← Почетна, Контакт, Назад на почетна), with full per-language values in the locale files. No English labels inside MK mode.
- Footer doctrine populated ("Преговарањето е опционално. Протоколот е апсолутен." / "Negotiation is optional. Protocol is absolute.").
- CI metadata preserved: title, viewport, meta description, canonical (`https://worldprotocolacademy-code.github.io/partnerships/`).
- Translator preserved: `data-wpa-page="partnerships"`, `../wpa-translator.js?v=3.0`, `data-i18n` / `data-i18n-html` / `data-i18n-attr`. Switching uses the page's existing `<select class="wpa-lang-select">`.
- Legal wording preserved: platform "in development"; no claims of registration, accreditation, mandate, university status, or confirmed partnerships.

## Not touched

`wpa-translator.js`, Journal, WPAWS, Protocol Symbols, Institute, Security pages, Audio Media Engine, and all other files are untouched. No redesign. No full-site replacement. No zip-inside-zip.

## Acceptance test (verified)

Homepage:
- [x] Root `index.html` is the WPA homepage (`data-wpa-page="index"`), not partnerships
- [x] Main identity is "World Protocol Academy" (hero H1); "WPA Institute" / "Институционални партнерства" appear only as incidental links/section cards, not as the homepage identity
- [x] Canonical = `https://worldprotocolacademy-code.github.io/`

Partnerships:
- [x] Real Institutional Partnerships gateway, not a placeholder; no "Во подготовка"
- [x] Identity = World Protocol Academy + Institutional Partnerships (no "WPA Institute" as identity)
- [x] No old September 2026 fixed OPC date; December 2026 conditional wording present (MK + EN)
- [x] Canonical = `https://worldprotocolacademy-code.github.io/partnerships/`

General:
- [x] locale keys match per page (index 623/623; partnerships 34/34)
- [x] no missing data-i18n keys
- [x] no CJK/Hangul
- [x] no Bulgarian hard sign (ъ)
- [x] no `ja` instead of `ја`
- [x] no zip-inside-zip
- [x] no full-site replacement; no unrelated files touched

> Note: live MK/EN switching depends on the accepted `wpa-translator.js` v3.0 in the repo (untouched here).

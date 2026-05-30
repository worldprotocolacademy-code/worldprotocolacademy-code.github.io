# WPA Site — Phase 1 Bilingual (Macedonian / English)

ONE translation engine, ONE language key, full MK/EN coverage on **all seven pages**
(including WPAWS), verified by a **rendered** audit that also checks the browser tab
title and social meta — not just keys.

## Languages — Phase 1 only
Македонски (`mk`) and English (`en`). No other world languages are active.
Language endonyms ("Македонски" / "English") appear in the picker by design so users
recognise their language in either mode.

## Repo-ready contents (index.html in root)
```
index.html              institute.html        programmes.html
certification.html      wpa-card.html         passive-revenue.html
wpaws/index.html        wpa-translator.js     test-i18n.js
locales/                tools/                package.json
TESTING.md              scripts/pricing-loader.js   wpa-mk-proofreader.js
START_LOCAL_SERVER_WINDOWS.bat   START_LOCAL_SERVER_MAC_LINUX.sh
```

## One engine for all seven pages (WPAWS included)
Every page — the six public pages **and** `wpaws/index.html` — now loads the same
`wpa-translator.js` (v3.0) and is tagged with `data-i18n` / `data-i18n-html` /
`data-i18n-attr`. WPAWS loads it as `../wpa-translator.js`, so its locale files
resolve to `locales/wpaws/`. Page context comes from `<html data-wpa-page="…">`,
the single language key is `wpa.language`.

WPAWS migration details:
- 587 interface keys (`locales/wpaws/mk.json`, `en.json`, `locale-status.json`):
  every visible label, button, tab, select option, placeholder, panel title and
  helper text — Dialogue, API Key, Memory, Architect, Structure, Book, Diplomacy,
  Security, Document type, Academic paper, Monograph, Conference paper, Title/Topic,
  Main idea, Full analysis, Copy, Expand, and the rest.
- The old internal WPAWS UI translator (`data-ui` / `applyGenericUI`) has been
  **removed**; `setUILang` / `applyUITranslations` now route to the shared engine.
- The **AI answer language** (`setAILang`) stays a separate control on purpose —
  interface language and AI output language are different things.

## Page titles & meta
`<title>`, `og:title`, `twitter:title` and `description` are tagged on every page
(`meta.title`, `meta.ogtitle`, `meta.description`; institute uses its own
`institute.meta.*` keys). Switching to English changes the browser tab title too.

## How the audit works (rendered, body + head)
`tools/audit-translations.js` loads each page in a headless DOM, applies English,
then walks **every visible text node** and also reads `document.title` + social meta;
it FAILS if any Macedonian Cyrillic remains (outside approved names: Smiljanov, Sande,
Skopje, North Macedonia, UKIM, Ohrid, Доц./д-р). It then applies Macedonian, checks
key parity (missing MK / EN) and legacy-translator conflicts. `SITE = process.cwd()`,
so it runs from the project root on any machine.

```bash
npm install            # installs jsdom (only dependency)
npm run audit          # rendered EN/MK audit of all 7 pages (body + tab title + meta)
npm run test:i18n      # both-ways MK<->EN switch sanity test
npm run serve          # python3 -m http.server 8080
```

## Last audit (rendered, body + title/meta)
```
OK   index.html   institute.html   programmes.html   certification.html
OK   wpa-card.html   passive-revenue.html   wpaws/index.html
✅ ALL PAGES OK — EN-mode Cyrillic leaks: 0, missMK 0, missEN 0 (each)
```


## Dynamic messages (toasts / alerts / verification)
Dynamic feedback now follows the interface language, not just the static labels:
- WPAWS routes every `toast()` / `alert()` / `confirm()` through `ui()` (alias
  `uiText()`), with MK/EN values in `WPA_UI_MK` / `WPA_UI_EN` — copy, export, memory,
  chain, web, dialogue, key-save, error and "AI reply language" messages included.
- The certification verifier uses a small `uiText()` map: the "enter an ID",
  "valid", "not found" messages and field labels are MK/EN.
- The index Virtual Sande bot uses `BOT_UI_TEXT` (mk/en) for typing/error/network/
  cleared/placeholder/send/clear/welcome.

The audit is **bidirectional** and FAILS on either:
- **EN mode** — any Macedonian Cyrillic left in body text or metadata (outside approved names);
- **MK mode** — any forbidden English UI/marketing phrase left in body text or metadata
  (membership, member/partner benefits, growth logic, monetization formula/system,
  premium learning layer, future premium value, upgrade/learning path, public verification
  logic, score band, assessment rubric, institutional growth, premium, upgrade, …).

It also scans page source and FAILS on any Macedonian left hard-coded inside
`toast()` / `alert()` / `confirm()`. Reported per page as `EN OK / MK OK`.

## Metadata
`<title>`, `description`, `keywords`, `og:title`, `og:description`, `twitter:title`
and `twitter:description` are all tagged and translated; `npm run audit` checks every
one of them in English mode.

## Notes
- `passive-revenue.html` reads as **partnerships & member benefits** in English.
- Approved term replacements in WPAWS: "Пресеанс листа" → **Order of precedence list**
  (EN) / **Протоколарен ред** (MK); "Академски журнал" → **academic journal** /
  **научно списание**.
- Brand terms are never machine-translated (World Protocol Academy, WPA, WPAWS,
  WPA Card, Virtual Sande, WPA Journal, Protocol Symbols Lab, …).
- Two pre-existing duplicate top-level declarations in WPAWS that threw in real
  browsers were repaired; WPAWS now loads with zero script errors.

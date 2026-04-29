# Sande — Practical Execution Plan (Macedonian-first)

## 1) What you do personally (editorial owner)
- Review Macedonian copy on core pages (`index`, `programmes`, `certification`, `wpa-card`, `passive-revenue`).
- Record only high-confidence corrections in a tracking sheet.
- Mark each correction with reason: `Правопис 2017`, `Style`, `Terminology`, or `Typo`.

## 2) Tracking sheet template (copy/paste)
| Page | i18n key | Current text | Correct text | Reason | Approved by |
|---|---|---|---|---|---|
| index | hero.title | ... | ... | Правопис 2017 | Sande |

## 3) What the engineering side does
- Add only safe typo/transliteration rules in `wpa-mk-proofreader.js`.
- Keep protected brand terms unchanged.
- Run QA checks before each merge.

## 4) Rollout to remaining languages
- Use Macedonian (`mk`) as source reference.
- Process languages in batches of 10.
- For each language: key completeness, token safety, terminology checks.

## 5) Definition of done (per language)
- 0 missing required keys for core pages.
- 0 broken placeholders/tokens.
- Brand terms preserved.
- Human reviewer sign-off.

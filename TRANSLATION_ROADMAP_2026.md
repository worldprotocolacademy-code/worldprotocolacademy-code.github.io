# WPA Translation Roadmap (Macedonian-first)

## Phase 0 — Macedonian orthography baseline (Правопис 2017)
1. Keep Macedonian (`mk`) as canonical source language.
2. Enforce `wpa-mk-proofreader.js` as a post-translation safety pass for all UI text rendered in `mk`.
3. Expand typo/transliteration rules only for high-confidence corrections (no full sentence rewrites).
4. Run manual editorial review for core pages: `index`, `programmes`, `certification`, `wpa-card`, `passive-revenue`.

## Phase 1 — Systematic rollout to remaining languages
1. Use `locales/manifest.json` as the single registry of supported languages.
2. Prioritize languages with regional relevance and highest traffic.
3. For each language, complete this QA checklist:
   - key completeness vs `mk`
   - placeholder/token preservation
   - brand/protected term integrity (`WPA`, `WPA Card`, etc.)
   - script and punctuation sanity checks
4. Roll out in batches with status tracked in `locales/locales/rollout-status.v3.json`.

## Phase 2 — Continuous quality loop
1. Add automated lint/QA checks in CI for missing keys and invalid JSON.
2. Add language-specific review notes for known edge cases.
3. Maintain changelog entries for translation corrections by language and page.

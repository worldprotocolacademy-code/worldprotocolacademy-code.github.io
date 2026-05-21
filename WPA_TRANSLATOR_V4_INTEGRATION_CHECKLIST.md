# WPA Translator v4 Integration Checklist

## Phase 1 - Upload only

- [ ] Upload root files:
  - [ ] translator-root-governance-v4.json
  - [ ] translator-loader-v4.js
  - [ ] wpa-mk-proofreader-v2.js
  - [ ] README-TRANSLATOR-V4.md
  - [ ] WPA_TRANSLATOR_V4_INTEGRATION_CHECKLIST.md
  - [ ] WPA_TRANSLATOR_V4_UPLOAD_STEPS_MK.txt

- [ ] Upload script:
  - [ ] scripts/translator_quality_check_v4.py

- [ ] Upload locales:
  - [ ] locales/mk/core.json
  - [ ] locales/en/core.json

## Phase 2 - Test page only

- [ ] Do not change index.html first.
- [ ] Use an existing test page or create translator-v4-test.html later.
- [ ] Add:
```html
<div data-wpa-language-select></div>
<script src="/wpa-mk-proofreader-v2.js"></script>
<script src="/translator-loader-v4.js"></script>
```

## Phase 3 - Main pages after test

- [ ] index.html
- [ ] institute.html
- [ ] programmes.html
- [ ] journal/index.html
- [ ] wpaws/index.html

## Public language rule

No informal internal conversation fragments on public pages.
No false claims about ISO certification, accreditation, indexing, partnerships or official status.

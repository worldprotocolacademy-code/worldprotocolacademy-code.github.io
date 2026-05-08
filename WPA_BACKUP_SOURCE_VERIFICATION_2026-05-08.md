# WPA Backup Source Verification — 2026-05-08

## Purpose

This document records the verified Raw HTML source files before creating backup copies or preview migration files.

No production HTML, JavaScript, JSON or locale file was modified by this verification step.

## Branch

```text
safety/wpa-translator-mk-master-2026-05-08
```

## Verified Source 1 — `index-final-plus-v2.html`

**User-provided Raw source file:** `Залепено text(214).txt`

**Expected backup target:**

```text
index-final-plus-v2.backup-2026-05-08.html
```

**Verification results:**

```text
Characters: 29,826
Bytes: 30,520
Lines: 78
Starts with <!DOCTYPE html>: yes
Ends with </html>: yes
SHA-256: 832e5e7a6f3a475a59ba26331001a97ee7ca1fb9844e63b3374ce34c7966456f
```

**Required markers found:**

```text
WPA Desk Assistant: yes
WPABotSande: yes
Execution pathway: yes
translator-loader-v2.js: yes
index_plus: yes
```

**Interpretation:**

This appears to be the complete `index-final-plus-v2.html` source, even though it has only 78 lines, because the HTML and CSS are written in very long lines.

## Verified Source 2 — `index-harvard.html`

**User-provided Raw source file:** `Залепено text(215).txt`

**Expected backup target:**

```text
index-harvard.backup-2026-05-08.html
```

**Verification results:**

```text
Characters: 20,925
Bytes: 21,006
Lines: 54
Starts with <!DOCTYPE html>: yes
Ends with </html>: yes
SHA-256: b0a9535e1f5c15924d7072f197d32369a21e77f24c1d7ae94afaa09b2212fa1c
```

**Required markers found:**

```text
Institutional architecture: yes
Central thesis: yes
Execution pathway: yes
translator-loader-v2.js: yes
index-harvard.html: yes
```

**Interpretation:**

This appears to be the complete `index-harvard.html` source and should be treated as a high-value Harvard-level institutional source candidate.

## Backup Name Availability Check

The following backup targets were checked and were not found on the safety branch before backup creation:

```text
index-final-plus-v2.backup-2026-05-08.html
index-harvard.backup-2026-05-08.html
```

## Safety Decision

Do not modify production files.

The next safe step is to create backup copies on the safety branch only, using the verified complete Raw HTML sources above.

## Protected Production Files

Do not directly edit during backup phase:

```text
index.html
index-final-plus-v2.html
index-harvard.html
translator-loader-v1.js
translator-loader-v2.js
locales/manifest.json
scripts/i18n-bilingual-cleaner.js
scripts/scripts/i18n-bilingual-cleaner-hotfix-v4-2.js
```

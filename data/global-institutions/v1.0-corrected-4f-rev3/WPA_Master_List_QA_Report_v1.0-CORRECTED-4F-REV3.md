# WPA Master List QA Report — v1.0-CORRECTED-4F-REV3

**Run date:** 2026-08-27  
**Status:** PASS — deterministic REV3 migration completed

## Archive integrity

- Frozen REV2 source SHA-256 before/after migration: `5f20ad53857f6bc65b0fd4f9300ae9a721bc1e56a4847d9cdfeb5daeeb6a6410`
- REV2 source directory is not rewritten by this migration.
- REV3 is published in a separate directory.

## Count assertions

- Total records: **161** — PASS
- External records: **160** — PASS
- Distinct external institutions: **155** — PASS
- Internal WPA reference records: **1** — PASS
- Records with website URL: **157** — PASS
- Records without website URL: **4** — PASS
- Unique record IDs: **161 / 161** — PASS

## Group counts

A=25, B=25, C=25, D=26, G=25, H=29, I=5, R=1

Expected: A=25, B=25, C=25, D=26, G=25, H=29, I=5, R=1 — **PASS**.

## Relevance counts after integrated A010 entity resolution

A=30, B=109, C=22, D=0.

These counts are computed from the REV3 records; they are not copied from the old REV2 headline metadata.

## Entity-resolution assertions

- D001 exists and is the canonical Protocol Academy of Macedonia entity — **PASS**.
- A010 remains audit-visible, has relevance B, and is explicitly resolved under D001 — **PASS**.
- A010 is not counted as a separate distinct external institution — **PASS**.
- D026 exists exactly once as National Defense University (NDU) — **PASS**.
- D026 is in Group D, relevance B, established 1976, with official NDU URL — **PASS**.

## Distinct external arithmetic

160 external records − 5 adjustments = **155 distinct external institutions**.

1. A005 — cooperation-model observation.
2. B008 — cooperation-model observation.
3. A010 — child / branch / brand-presence under D001.
4. C022/H027 — ICC in two dataset contexts.
5. G002/G022 — IAEA in two dataset contexts.

## Verification boundary

D001, A010 and D026 have primary-source verification status in REV3. The wider dataset remains under record-level source verification. URL presence is not treated as verification, accreditation, recognition or endorsement.

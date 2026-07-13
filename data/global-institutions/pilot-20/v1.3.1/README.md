# WPA Pilot 20 — Final Consolidation v1.3.1

Generated: `2026-07-13T21:23:39+02:00`

This directory contains the deterministically validated Pilot 20 consolidation package.

## Status

- Pilot 20 consolidation: **FINAL — DETERMINISTIC VALIDATION PASSED**
- D002: **APPROVED_FOR_NEXT_CANONICAL_REVISION — NOT YET APPLIED**
- REV2: **UNCHANGED**

## Bundle

All nine final text deliverables are stored in `pilot20-v1.3.1.tar.gz.b64`.
Decode and extract with:

```bash
base64 -d pilot20-v1.3.1.tar.gz.b64 > pilot20-v1.3.1.tar.gz
tar -xzf pilot20-v1.3.1.tar.gz
```

Or run:

```bash
python extract_bundle.py
```

## Included files

- `pilot-20-final-manifest-v1.3.1.json`
- `pilot-20-final-report-v1.3.1.md`
- `pilot-20-unresolved-register-v1.3.1.md`
- `pilot-20-provenance-ledger-v1.3.1.json`
- `pilot-20-validation-report-v1.3.1.md`
- `pilot-20-consolidation-diff-v1.3-to-v1.3.1.md`
- `pilot-20-canonical-decisions-v1.3.md`
- `canonical-patch-D002-v1.3.json`
- `README.md`

## Guardrails

- Frozen batch evidence was not changed.
- No new web verification was performed for this consolidation.
- D002 patch was not applied.
- REV2 remains unchanged.
- No production code, D1, Cron, API, or monitor implementation was created.
- No SHA-256 values were invented.

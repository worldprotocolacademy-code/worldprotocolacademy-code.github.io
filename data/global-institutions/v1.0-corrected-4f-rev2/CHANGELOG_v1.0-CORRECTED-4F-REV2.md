# Changelog — WPA Global Institutions Master List

## v1.0-CORRECTED-4F-REV2 — Statistical Consistency Micro-Fix
**Date:** 2026-05-29

### Summary
CORRECTED-4F-REV2 is a micro-revision that fixes a statistical inconsistency in the QA report and metadata regarding `unique_external_institutions`. No dataset records, URLs, protocol relevance levels, or methodology were changed.

### What Changed (from REV1)
- **unique_external_institutions:** Corrected from 159 to **155** in JSON metadata, Master List MD, and QA report.
- **QA report explanatory note added:** "155 is the canonical methodological count retained from CORRECTED-4E. The dataset contains 159 external records; exact record-name counting may return 159 because cross-listed/context-specific records are represented as separate entries, but the public methodological metric remains 155 unique external institutions."
- **Remaining limitations updated:** "Dataset contains 159 external records. Canonical methodological unique external institutions remain 155."

### What Did NOT Change (from REV1)
- All 160 dataset records unchanged.
- All 156 website URLs unchanged.
- All protocol_relevance_level values unchanged (A=30, B=108, C=22, D=0).
- All group counts unchanged (A=25, B=25, C=25, D=25, G=25, H=29, I=5, R=1).
- A010 remains de-risked: Level B, Verification pending, no URL.
- A005 and B008 remain reported cooperation models: Verification pending, no URL.
- R001 established remains 2026.
- Motto remains correct: "Протоколот" (not "Протоколото").
- Public status remains cautious.
- No PDF/DOCX generated.

### Files in This Release
1. `WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV2.json`
2. `WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV2.csv`
3. `WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV2.md`
4. `WPA_URL_Restoration_Log_CORRECTED-4F-REV2.md`
5. `WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV2.md`
6. `CHANGELOG_v1.0-CORRECTED-4F-REV2.md` (this file)

---

## Previous Versions

### v1.0-CORRECTED-4F-REV1 — Full URL Restoration Patch (Revised)
- Fixed 3 critical bugs from CORRECTED-4F:
  - Protocol relevance levels corrected to A=30, B=108, C=22, D=0.
  - R001 established year corrected to 2026.
  - Metadata motto typo "Протоколото" → "Протоколот" fixed.
- QA report regenerated from actual JSON/CSV counts.
- **Known issue:** unique_external_institutions showed 159 instead of canonical 155.

### v1.0-CORRECTED-4F — URL Restoration Patch (Superseded by REV1)
- Restored website URLs for 156 of 160 records.
- **BUG:** Protocol relevance levels incorrect (A=25, B=52, C=83).
- **BUG:** R001 established year missing.
- **BUG:** Metadata motto typo ("Протоколото").
- Superseded by CORRECTED-4F-REV1.

### v1.0-CORRECTED-4E — Final Portable Package
- Consolidated all 10 files into single ZIP.
- All files renamed to CORRECTED-4E.
- Dataset unchanged from CORRECTED-4B.
- PDF/DOCX: bullet format Sections 5+6, explicit Unicode motto.

### v1.0-CORRECTED-4D — Visual Fix
- PDF/DOCX: bullet format instead of wide tables.
- Explicit Unicode motto (U+201E + U+201D).
- Honest validation: CORRECTED-4C failure acknowledged.

### v1.0-CORRECTED-4C — Visual Cleanup (Failed)
- Attempted PDF/DOCX visual improvements.
- Table clipping issues not fully resolved.
- Superseded by CORRECTED-4D.

### v1.0-CORRECTED-4B — Methodological & Numerical Polish
- "Protocol Core 25" → "Level A Protocol Relevance Segmentation".
- Group A count corrected to 25 (not 27).
- A010 corrected to Level B.
- All statistics auto-calculated from JSON.
- Cooperation-model logic formalized.

### v1.0-CORRECTED-4A — Portable Format Consistency
- PDF/DOCX summary labeling fixed.
- Motto corrected to proper Macedonian quotes.
- QA status: 30/32 PASS, 2 PENDING.
- Public status: cautious.

---

*Generated: 2026-05-29*  
*World Protocol Academy (WPA)*

# WPA Global Institutions Master List — Changelog
## v1.0-CORRECTED-4E

---

## Version History

### v1.0-CORRECTED-4E (2026-05-29)

**Focus:** Consolidated package — dataset unchanged from CORRECTED-4B, portable PDF/DOCX layout fixed, QA report and changelog regenerated.

**Dataset status:** UNCHANGED from CORRECTED-4B. All 160 records, counts, A010 logic, A005/B008 logic, methodology, and structure remain identical.

**CORRECTED-4E changes:**
1. **Package consolidation:** All 10 files renamed to CORRECTED-4E version. No mixed versions (4B, 4C, 4D, 4E) in the same package.
2. **PDF portable layout:** Section 5 (Cooperation-Model Observations) converted from table to bullet format. Section 6 (Level A Protocol Relevance Segmentation) remains bullet format. No wide tables with long text in summary PDF.
3. **DOCX portable layout:** Section 5 (Cooperation-Model Observations) converted from table to bullet format. Section 6 (Level A Protocol Relevance Segmentation) remains bullet format. No wide tables with long text in summary DOCX.
4. **PDF/DOCX motto:** Explicit Unicode U+201E („) + U+201D (") for Macedonian quotation marks.
5. **QA report regenerated:** Added Dataset Validation table comparing CORRECTED-4E vs CORRECTED-4B. Confirmed all metrics unchanged.
6. **Changelog regenerated:** Honest acknowledgment of CORRECTED-4C and CORRECTED-4D failures, and CORRECTED-4E remediation.

**CORRECTED-4C failure acknowledged:**
- PDF page 4 Section 5 table: text clipped, overlapped, crossed cell borders.
- DOCX motto: potential rendering issue with quotation marks.
- QA report incorrectly claimed PASS for visual checks before verification.

**CORRECTED-4D failure acknowledged:**
- PDF page 4 Section 5 table: text still clipped and overlapped (table format not fully eliminated for Cooperation-Model Observations).
- DOCX Section 5 table: text still clipped.
- QA report acknowledged improvement but visual problems remained.

**CORRECTED-4E resolves:**
- PDF/DOCX Section 5: Completely removed table format. Converted to bullet format with indented sub-bullets. No table cells, no clipping, no overlap, no text crossing borders.
- PDF/DOCX motto: Explicit Unicode U+201E + U+201D.
- No wide tables in PDF/DOCX summary: For all sections with lengthy descriptions, bullet format is used instead of narrow tables.

**No methodology changes:**
- All 160 records unchanged from CORRECTED-4B
- A010: Level B, reported affiliated branch, verification pending
- A005/B008: Reported cooperation model, verification pending
- Group counts: A=25, B=25, C=25, D=25, G=25, H=29, I=5
- Level counts: A=30, B=108, C=22, D=0
- JSON dataset, CSV dataset, Master List MD content, Audit MD content unchanged from CORRECTED-4B

### v1.0-CORRECTED-4B (2026-05-29)

**Focus:** A010 correction, terminology standardization, automatic recalculation

**Changes:**
1. A010 corrected: protocol_relevance_level changed from A to B; institution_type changed; notes updated with archival/historical context
2. Statistics recalculated automatically from JSON data
3. "Protocol Core 25" replaced with "Level A Protocol Relevance Segmentation"
4. Group A count fixed to 25
5. Group B count fixed to 25
6. Level A segmentation: 28 standard + 2 cooperation-model = 30 total
7. A010 verification_status: "Verification pending"
8. QA checks expanded: AG–AN

### v1.0-CORRECTED-4A (2026-05-29)

**Focus:** Portable-format consistency

**Changes:**
1. PDF labeling: "Summary PDF — Selected Sections"
2. DOCX labeling: "Summary DOCX (selected sections)"
3. Motto corrected: Cyrillic + English
4. QA status: 30/32 PASS, 2 PENDING — MANUAL

### v1.0-CORRECTED-4 (2026-05-29)

**Focus:** Methodological integrity and format labeling

**Changes:**
1. QA status corrected to 30/32 PASS
2. PDF labeled as Summary PDF
3. Master List MD tables: no truncation
4. A005/B008 institution_type standardized
5. Protocol Core 25 segmented

### v1.0-CORRECTED-3 (2026-05-28)

**Focus:** Dataset integrity and auto-generation

**Changes:**
1. Verification harmonized
2. Table abbreviations controlled
3. Cooperation-model methodology added
4. institution_type standardized

### v1.0-CORRECTED-2 (2026-05-28)

**Focus:** Production-grade corrections

**Changes:**
1. Partnership/MOU language de-risked
2. canonical_id errors fixed
3. Statistics recalculated
4. Geographic distribution harmonized

### v1.0-CORRECTED (2026-05-27)

**Focus:** Initial correction package

**Changes:**
1. 124 → 125 records
2. Taxonomy corrected
3. Fake links removed
4. Partnership overclaims de-risked

### v1.0 (2026-05-24)

**Initial release**

### v0.1 (2026-05-23)

**Initial draft**

---

© 2026 World Protocol Academy · Institute for Protocol, Diplomacy, Public Communication & Security Studies
worldprotocolacademy@gmail.com

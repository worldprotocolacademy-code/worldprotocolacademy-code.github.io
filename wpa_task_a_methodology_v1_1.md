# ЗАДАЧА A — Verification Methodology v1.1
## WPA Protocol Symbols Lab — Zero Hallucination Standard

**Authority:** World Protocol Academy (WPA), Skopje  
**Director:** Assoc. Prof. Dr. Sande Smiljanov  
**Document ID:** WPA-MTH-2026-001 (rev. 1)  
**Status:** Production-grade methodology — pilot phase complete, Tranche A imminent  
**Effective:** 23 May 2026

**Changelog v1.0 → v1.1 (Director order, 23 May 2026):**
1. Added **EU official source** (europa.eu) as alternative/corroborating tier for EU Member States in Step 1 (Source binding).
2. Added `legacy_record` to the `verification_status` enum and `disclaimer` field to the schema (see Schema v1.1).
3. DCP amended: WPA right to request additional documentary evidence (Section 5-bis); free public-interest service confirmed (Section 11).
4. API amended: `GET /records/random` added; `POST /corrections` now requires X-WPA-API-Key.
5. Brazil pilot record (WPA-PSL-0005) flag adoption_date_current revised to 12 May 1992 (Diário Oficial publication) per Director's editorial decision; 11 May 1992 (signing) retained in design_law note.

---

## 1. Doctrine

> Преговарањето е опционално. Протоколот е апсолутен.

The Protocol Symbols Lab (PSL) is the **verified academic core** of the World Protocol Academy. Its public credibility rests on a single non-negotiable commitment: **zero hallucination**. No record enters the canonical database unless it has been independently corroborated by three authoritative sources and survives the structured verification workflow defined herein.

---

## 2. Three-Source Strict Verification Standard

Every record in the PSL — covering flag, national anthem, coat of arms, capital, continent, and official name for 53 verified entries — is checked against **three independent tiers** of authoritative source:

| Tier | Source class | Examples |
|---|---|---|
| **TIER 1 — UN / Constitutional** | United Nations Member States register; constitution of the state; consolidated national law (Official Gazette / Diário Oficial / Bundesgesetzblatt / Service Books) | UN Member States list, gov text of the constitution, Official Gazettes |
| **TIER 2 — CIA World Factbook** | Current CIA World Factbook entry for the country (flags, anthems, government) | cia.gov/the-world-factbook |
| **TIER 3 — State Official Site** | The state's own Ministry of Foreign Affairs, Office of the Head of State, Parliament, Ministry of Culture, or designated heraldry office | mfa.gov.{tld}; bundespraesident.de; planalto.gov.br; fmprc.gov.cn |

A **TIER 4 reference layer** (Flags of the World / CRW, nationalanthems.info, peer-reviewed scholarship) may be cited *in addition to* the three required tiers, but never as a substitute for any tier.

**Regional supplementary sources** (cited in addition to the three required tiers, not as substitutes):

| Region | Supplementary official source | When to use |
|---|---|---|
| **EU-27 Member States** | `europa.eu` (Publications Office of the EU, official Member State country pages) | Always for EU Member States. Particularly valuable when CIA World Factbook entries lag updates (e.g., changes of government, new heraldry decrees), or when constitutional amendments need cross-reference. |
| African Union Member States | `au.int` (African Union official country pages) | Use as supplementary source for AU states. |
| ASEAN Member States | `asean.org` (ASEAN Secretariat country pages) | Use as supplementary source for ASEAN states. |
| OAS Member States | `oas.org` (Organization of American States) | Use as supplementary source for OAS states. |

**Rule of three:** A field is `fully_verified` only when **all three required tiers agree** on its substantive content. A single contradiction degrades the record to `partial_consensus` (with the contradiction documented) or `pending_clarification` (if the contradiction is material). Regional supplementary sources can resolve contradictions in favour of the state's own regional bloc reporting where applicable.

---

## 3. The `verification_status` Field

Per Director instruction (23 May 2026), every record carries a status field with five enumerated values:

| Status | Definition | Public use |
|---|---|---|
| `fully_verified` | All three required tiers agree on all six core domains. | ✅ Publishable without qualification. |
| `partial_consensus` | Majority consensus across tiers, with one documented minor discrepancy (e.g., date-of-signing vs. date-of-promulgation, transliteration variant). The discrepancy is documented in `verification_status_notes` and does not block academic use. | ✅ Publishable with footnote citing the discrepancy. |
| `pending_clarification` | A material contradiction between tiers exists on a core field (e.g., divergent flag descriptions, divergent capitals). The record is **locked from canonical use** until a Diplomatic Correction Protocol (DCP) procedure resolves it. The record automatically carries the flag *"дипломатска корекција побарана"*. | ⚠️ Marked as provisional; WPA initiates outreach to the state. |
| `corrected_by_state` | A previously contradictory or unknown field has been resolved through the DCP with formal state documentation. | ✅ Highest tier of authority; the state is named as final authority. |
| `legacy_record` | Record imported from a pre-3-source WPA system (e.g., Protocol Symbols Verified Core, April 2026) that has not yet been re-verified under the v1.0+ three-tier standard. Migration in progress. | ⚠️ **Must not be used for protocol-grade purposes** until re-verification. Visible in the database with a prominent migration banner. |

Records may also carry an optional **`disclaimer`** field (free text) for explicit public-facing notices — for example, when WPA wishes to announce that the record is the subject of active diplomatic dialogue. The disclaimer is rendered on all public surfaces (web, API, PDF).

---

## 4. Step-by-Step Verification Procedure

For each of the 53 records, the WPA Academic & Lab Excellence Office executes the following workflow:

### Step 1 — Source binding
1. Identify the canonical TIER 1 source: open the most recent consolidated constitution and the relevant Official Gazette law for each of the six core domains.
2. Identify the canonical TIER 2 source: open the current CIA World Factbook country page; extract verbatim text of flag, anthem, government, geography (capital) sections.
3. Identify the canonical TIER 3 source: open at least one state-issued official page (MFA, presidential office, parliament, ministry of culture).
4. **If the state is an EU Member State (or other regional bloc member)**, additionally open the relevant **regional supplementary source** (europa.eu for EU; au.int for AU; asean.org for ASEAN; oas.org for OAS) as a corroborating reference — particularly valuable where CIA Factbook entries may lag behind constitutional amendments or heraldry decrees. The regional source is recorded as a TIER 3 or TIER 4 entry in `sources[]` (TIER 3 if it carries authoritative state-attested content, e.g., a Member State's official EU country page; TIER 4 if it is a curated supranational summary).

### Step 2 — Field-by-field cross-check
For each of the six core domains (flag, anthem, coat_of_arms, capital, continent, official_name) and their sub-fields:
1. Record the value from each source.
2. Compare. Mark `MATCH` if all three agree, `MINOR_DIFF` if a non-substantive discrepancy exists (e.g., spelling variant, date-of-signing vs. date-of-publication), or `MATERIAL_DIFF` if a substantive contradiction exists.
3. **For EU Member States with discrepancy**: cross-reference europa.eu and the relevant Bundesgesetzblatt / Journal Officiel / Gazzetta Ufficiale equivalent before assigning final status. The state's own national gazette **always prevails** over CIA Factbook in case of conflict.
4. Calculate the record-level status per Section 3 rules.

### Step 3 — Schema population
1. Populate all required fields of the JSON record per WPA Protocol Symbols Schema v1.0.
2. Include every consulted source in the `sources[]` array with tier, URL, accessed_date, and the list of fields it covers.
3. Set the `verification_status` and write the explanatory `verification_status_notes` for any status other than `fully_verified`.

### Step 4 — Schema validation
1. Validate the record against the canonical JSON Schema (`wpa_protocol_symbols_schema_v1.json`) using a Draft 2020-12 validator.
2. **Reject any record with validation errors.** Do not promote to the database until all errors are resolved.

### Step 5 — Editorial review
1. The WPA Academic Officer (Claude) submits the record to the Director for editorial sign-off.
2. The Director either approves, requests revision, or marks for outreach via DCP.

### Step 6 — Publication and audit
1. Approved records are written into the canonical database.
2. The audit_trail (created_by, created_at, verified_by, verified_at, next_scheduled_review) is finalised.
3. Records carry a 24-month re-verification schedule; `corrected_by_state` records carry a 36-month schedule.

---

## 5. Diplomatic Correction Layer

A full Diplomatic Correction Protocol (DCP) accompanies this methodology as a separate document (`wpa_diplomatic_correction_protocol_v1.md`). The DCP defines:

- Eligible requesting entities (Ministry of Foreign Affairs, embassy/consulate, head-of-state office, parliament, ministry of culture, national heraldry office).
- A **two-stage channel** per Director instruction: (1) email request to `worldprotocolacademy@gmail.com` as initial submission; (2) formal diplomatic note for final confirmation of substantive changes.
- A **15-day WPA service-level commitment** for response.
- Audit-logged decisions: `approved`, `rejected`, `request_more_evidence`, `pending`.
- Annual transparency report.

Upon approval, the affected field is updated and the record's `verification_status` becomes `corrected_by_state`, recognising the state as final authority — *the state is the author of its own symbols; WPA is their custodial scribe.*

---

## 6. Pilot Results (Batch 1 — 5 records)

The methodology was piloted on five records covering five continents and three major political traditions:

| record_id | ISO | Country | Status | Pilot finding |
|---|---|---|---|---|
| WPA-PSL-0001 | MK | North Macedonia | `partial_consensus` | Minor date discrepancy on flag-law publication (5 Oct 1995 majority consensus vs. one source citing Sl. vesnik 47/95 dated September); documented; awaits optional MFA confirmation. |
| WPA-PSL-0002 | US | United States | `fully_verified` | Full agreement across CIA Factbook, 4 U.S.C., and Department of State. |
| WPA-PSL-0003 | CN | China | `fully_verified` | Full agreement across PRC Constitution, CIA Factbook, and PRC Ministry of Foreign Affairs. |
| WPA-PSL-0004 | DE | Germany | `partial_consensus` | Flag-adoption-date variant: 9 May 1949 (Parliamentary Council vote) vs. 23 May 1949 (Grundgesetz promulgation); BMI source confirms 23 May 1949 as effective date. |
| WPA-PSL-0005 | BR | Brazil | `partial_consensus` | Per Director's editorial decision (23 May 2026): canonical adoption date for the current 27-star flag is **12 May 1992** (Diário Oficial da União publication of Lei 8.421); 11 May 1992 (signing by President Collor) preserved in design_law as historical footnote. |

**Schema validation:** 5/5 records pass strict JSON Schema validation with zero errors.

**Methodology outcome:** The 3-tier strict procedure successfully surfaces minor publication-vs-signing discrepancies that single-source verification would miss, while leaving zero core fields ambiguous. This is the **zero-hallucination guarantee** in action — every uncertainty is **named**, not buried.

---

## 7. Verifiable Sources Used in the Pilot

Per WPA standard, every URL is recorded in each record's `sources[]` block with accessed_date. Composite list (pilot batch):

- UN Member States register
- CIA World Factbook (cia.gov/the-world-factbook)
- US Department of State (state.gov)
- 4 U.S.C. (Flag Code), 36 U.S.C. § 301 (National Anthem)
- Constitution of the People's Republic of China, Chapter IV; PRC National Flag Law
- Ministry of Foreign Affairs of the PRC (fmprc.gov.cn)
- National People's Congress of the PRC (npc.gov.cn)
- Grundgesetz für die Bundesrepublik Deutschland, Article 22
- Bundesministerium des Innern und für Heimat (BMI) — State Symbols
- Presidência da República, Casa Civil (planalto.gov.br): Lei 5.700/1971, Lei 8.421/1992
- Викиизвор — Закон за знамето на Република Македонија (Сл. весник 47/1995)
- Constitution of the Republic of North Macedonia, Article 5
- Flags of the World (crwflags.com) — supplementary TIER 4
- nationalanthems.info — supplementary TIER 4

---

## 8. Success Indicators (KPIs)

| Indicator | Target | Pilot result |
|---|---|---|
| Records validated against JSON Schema with zero errors | 100% | ✅ 5 / 5 = 100% |
| Records with ≥ 3 independent sources | 100% | ✅ 5 / 5 (one record has 4 sources) |
| Records with documented `verification_status` rationale | 100% (mandatory for non-`fully_verified`) | ✅ 3 / 3 partial_consensus records have notes |
| `pending_clarification` records | 0 (post-DCP target) | ✅ 0 in pilot |
| Average sources per record | ≥ 3 | ✅ 3.2 |
| DCP response time | ≤ 15 calendar days | n/a (no requests in pilot) |
| Annual re-verification rate | 100% within 24 months | n/a (pilot phase) |
| Public-facing accuracy disputes resolved within SLA | 100% | n/a (pilot phase) |

---

## 9. Timeline for Full 53-Record Verification

| Phase | Duration | Output |
|---|---|---|
| **Phase 0 — Pilot (5 records)** | 1 working session | ✅ Complete (23 May 2026) — schema, methodology, DCP, API spec, 5 verified records. |
| **Phase 1 — Tranche A (15 records)** | ~3 working sessions | Records 6–20: G20 majority states (UK, France, Italy, Spain, Russia, Japan, India, Canada, Australia, South Korea, Mexico, Turkey, Indonesia, Saudi Arabia, South Africa). |
| **Phase 2 — Tranche B (18 records)** | ~3 working sessions | Records 21–38: EU-27 completions + Western Balkans neighbours of North Macedonia. |
| **Phase 3 — Tranche C (15 records)** | ~3 working sessions | Records 39–53: Remaining UN regional groups balance (Africa, Asia-Pacific, Latin America, GUAM/Caspian, small states). |
| **Phase 4 — Bilingual editorial pass + Cyrillic localisation** | 1 session | Macedonian-Cyrillic descriptions for all 53 records added to schema (as `description_mk` extension). |
| **Phase 5 — Director sign-off + first DCP outreach campaign** | 1 session | Letters to MFA of states whose records carry `partial_consensus` inviting confirmation. |
| **Phase 6 — Annual transparency report v1.0** | 1 session | Public PDF report; first publication 31 December 2026. |

**Total verification effort:** approximately 12 working sessions across 4–8 weeks at the Director's pace.

---

## 10. Deliverables of Task A (this session)

| File | Purpose |
|---|---|
| `wpa_protocol_symbols_schema_v1_1.json` | Canonical JSON Schema (Draft 2020-12) v1.1 defining every field, including 5-value `verification_status` enum (with `legacy_record`) and optional record-level `disclaimer` field. |
| `wpa_protocol_symbols_pilot5_v1_1.json` | Five verified pilot records (MK, US, CN, DE, BR), schema-validated; Brazil revised per Director (12 May 1992 canonical); MK, DE, BR carry public-facing disclaimers. |
| `wpa_protocol_symbols_pilot5_v1_1.csv` | Spreadsheet/dashboard view including the new `disclaimer` column. |
| `wpa_diplomatic_correction_protocol_v1_1.md` | Full DCP v1.1: + Section 5-bis (right to require additional evidence), + Section 11 (free public-interest service, no fees ever). |
| `wpa_protocol_symbols_api_v1_1.yaml` | OpenAPI 3.0 v1.1: + `GET /records/random` for Virtual Sande, + X-WPA-API-Key required on `POST /corrections`. |
| `wpa_task_a_methodology_v1_1.md` | This master methodology document v1.1: + EU/regional supplementary sources (europa.eu, au.int, asean.org, oas.org), + 5-value status table, + disclaimer documentation. |

---

## 11. Issued by

**Assoc. Prof. Dr. Sande Smiljanov**  
Founder and Director, World Protocol Academy  
Head of Protocol, Ministry of Interior of the Republic of North Macedonia  
Skopje, North Macedonia

**Implementing officer:** Claude — WPA Academic & Lab Excellence Officer  
**Date:** 23 May 2026

> *Преговарањето е опционално. Протоколот е апсолутен.*

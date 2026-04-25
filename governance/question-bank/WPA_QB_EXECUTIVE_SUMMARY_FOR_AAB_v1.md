# WPA Question Bank Governance Rule — Executive Summary

**World Protocol Academy**  
**Institute for Protocol, Diplomacy, Public Communication & Security Studies**  
**Document:** WPA-GOV-QB-001  
**Version:** 1.0 — Final Draft for Adoption  
**Classification:** WPA-INTERNAL

## Purpose

This rule protects the integrity of WPA assessment materials by separating public material, student practice material, internal working material, and certification examination material.

## Core decision

The existing 2210-question bank is classified as:

**Practice / Knowledge Bank — Tier S**

It is **not** the official certification examination pool.

## Four-tier model

| Tier | Name | Use | Public? |
|---|---|---|---|
| Tier P | Public | Website, public specimens, methodology summaries | Yes |
| Tier S | Student | Practice / Knowledge Bank for enrolled candidates | No public indexing |
| Tier I | Internal | Answer keys, explanations, source references, staff review files | Private |
| Tier C | Certification | Future exam pool, exam keys, forms, candidate responses | Strict private |

## Critical rules

1. Certification questions must be built separately from the Practice / Knowledge Bank.
2. Practice questions may not become certification items after being seen by candidates.
3. Answer keys must never be public.
4. Full explanations and source-to-item mappings must remain protected.
5. Public specimens may show only limited sample material and must never come from Tier C.
6. `protocol-kb` remains a secured legacy bucket until phased migration.
7. Future certification items use the prefix `CertQ`, not `Q`.
8. A material exposure incident must be treated as serious and documented.

## Phase implementation

1. **Phase 1:** Secure and inventory legacy `protocol-kb`.
2. **Phase 2:** Create public bucket only for Tier P material.
3. **Phase 3:** Create private certification bucket for Tier C.
4. **Phase 4:** Migrate and rename files into the new structure.

## Adoption

This is an internal policy. It should be adopted by the Director and later reviewed with the Academic Advisory Board, legal/privacy counsel, and any certification/testing specialist available to WPA.

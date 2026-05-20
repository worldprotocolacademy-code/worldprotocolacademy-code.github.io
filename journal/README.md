# WPA Journal — Cover Templates

**Series:** WPA Journal Digital Platform v1.0
**Folder:** `journal/covers/`
**Version:** v1.0
**Date:** 2026
**Owner:** World Protocol Academy
**Status:** Public-ready · reusable

---

## Purpose

This folder contains three reusable digital cover templates for the WPA Journal:

1. **`classic-diplomatic-cover.html`** — Classic Diplomatic
   *Formal, parchment-toned, seal-centred. The diplomatic-academy style. Recommended for the inaugural issue (September 2026) and ceremonial volumes.*

2. **`modern-institutional-cover.html`** — Modern Institutional
   *Clean grid layout, contemporary institutional-report style. Suitable for general issues, policy-heavy issues and digital-first promotion.*

3. **`ceremonial-review-cover.html`** — Ceremonial Review
   *Solemn academic style with double frame and decorative seal. Suitable for OPC Proceedings, anniversaries, special invited collections.*

All three templates share the WPA Journal visual identity (navy / parchment / gold, serif typography) and contain no fake identifiers.

---

## Recommendation for the inaugural issue

**Use `classic-diplomatic-cover.html` for Volume 1 · Issue 1 · September 2026.**

The classic-diplomatic style matches the institutional weight of an inaugural issue and aligns with WPA's protocol-rooted tradition.

For Volume 1 · Issue 2 (Spring 2027) and Volume 2 · Issue 1 (Autumn 2027), the **Modern Institutional** style is recommended to signal regular semiannual cadence.

The **Ceremonial Review** style is reserved for OPC Proceedings issues, special invited collections, and anniversary editions.

---

## How to duplicate and edit for future issues

1. Copy the chosen template file to a new filename matching the issue:
```
   classic-diplomatic-cover.html  →  vol-1-issue-2-2027-cover.html
```

2. Open the new file. Update the following fields ONLY:

   | Field | Where to find it | Change to |
   |---|---|---|
   | Volume | `<title>`, `cover__meta-block`, `ctm-grid__value`, `ctc-meta` | I, II, III… |
   | Issue | same locations | 1 or 2 |
   | Date | same locations | e.g. March 2027 |
   | Theme | `cover__theme-text`, `ctm-theme__text`, `ctc-theme__text` | New theme |
   | WPA Identifier | `cover__wpa-id__code`, `ctm-grid__value--mono`, `ctc-meta__value--mono` | e.g. `WPA-J-2027-02` |
   | Status | `Coming Soon` / `Published` / `Forthcoming` | as appropriate |

3. Do **not** edit:
   - The doctrine lines (Macedonian + English).
   - The ID-disclaimer line.
   - The footer publisher line.
   - The masthead identity ("WPA Journal of Protocol, Diplomacy, Public Communication, Security & Communicology").
   - Decorative ornaments (corners, frames, stars, seals).

4. Save in the `journal/covers/` folder.

---

## Print / export to PDF

These cover templates are designed to print as a single A4 page.

### From any modern browser
1. Open the cover HTML file in Chrome, Firefox, Edge or Safari.
2. Press **Ctrl + P** (Windows / Linux) or **Cmd + P** (macOS).
3. In the print dialog:
   - **Destination:** Save as PDF.
   - **Paper size:** A4.
   - **Margins:** None (or Minimum).
   - **Background graphics:** **Enable** (otherwise navy and gold won't print).
   - **Scale:** 100%.
4. Click Save / Print.

### Using the in-page button
Each cover page has a "Print / Save as PDF" button bottom-right. It triggers `window.print()` with the same result.

---

## Critical rules (DO NOT VIOLATE)

- ❌ **Do not add ISSN before official assignment.** When ISSN is assigned, replace the disclaimer with the actual ISSN. Never use "ISSN pending" in a misleading way.
- ❌ **Do not add DOI before formal setup through Crossref or another recognised DOI registration agency.**
- ❌ **Do not add ISBN.** Cover templates are for journal issues; journal issues do not carry ISBNs. ISBN is used only for WPA Books / Monographs / Proceedings as standalone volumes.
- ❌ **Do not add Editorial Board names** to the cover before completed consent workflow (Acceptance Form + Public Listing Consent + COI Declaration + approved biography + Founder final approval).
- ❌ **Do not add AAB names** under the same rule.
- ❌ **Do not add "endorsed by", "supported by", "in partnership with", "accredited by"** without a signed official document.
- ❌ **Do not change the doctrine line.** The doctrine *„Преговарањето е опционално. Протоколот е апсолутен."* is institutional.
- ❌ **Do not invent author names, article titles, or sample TOCs on the cover.**
- ❌ **Do not use Diamond OA wording.** The journal uses Fair Access model.

---

## Future official identifiers

When ISSN, ISBN or DOI are officially assigned:

1. Update the cover template by **replacing the ID-disclaimer line** with the official identifier(s).
2. Keep the WPA Identifier alongside the official identifier — both remain useful for governance and provenance.
3. Update `journal/publication-identifiers.html` to reflect the new official identifier(s).
4. Issue an Editorial Note about the new identifier(s) in the next issue.

Example post-DOI cover line (replace `ISBN/ISSN/DOI is not assigned` block):

> ISSN [actual number] · DOI [actual prefix]/wpa-j-art-… · WPA Identifier WPA-J-2026-01.

---

## Reuse policy

These templates are reusable for any future WPA Journal issue. They are designed to be:

- **Modular** — change only the metadata fields, keep the structure.
- **Print-stable** — A4 layout works in all major browsers.
- **Brand-stable** — colours, typography and ornaments stay constant across issues.
- **Identifier-safe** — no field invites the editor to invent identifiers.

If a future issue calls for a fundamentally new visual style (e.g., 5th-anniversary issue), a **new** template file should be created — do not overwrite these three. Keep them as canonical references.

---

## Contact

- Editorial / cover design questions: **worldprotocolacademy@gmail.com**
- Institutional / partnership cover usage: **worldprotocolacademy@outlook.com**

---

*„Преговарањето е опционално. Протоколот е апсолутен."*
— World Protocol Academy, 2026

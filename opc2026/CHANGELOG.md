# WPA Mini-System · CHANGELOG
**Version:** Production-Ready v1.0  
**Date:** June 2026  
**Scope:** opc2026-conference.html · wpa-card-checkout.html · verify.html

---

## wpa-card-checkout.html

### Content & Copy Fixes
- Corrected "тренсакциска" → "трансакциска" (payment security terminology)
- Corrected "без временски ограничување" → "без временско ограничување"
- Added explicit WPA Card disclaimer: card is an institutional membership card, not a government ID
- Improved plan descriptions with clear "For whom" (plan-target) text for each tier
- Clarified that certification exams are available at additional cost (Pro tier)
- Removed vague "guaranteed" language; replaced with precise institutional wording
- Improved FAQ wording throughout; corrected grammar

### Payment Links
- Removed all fake `your-lemonsqueezy-link.com` placeholder links from HTML
- Added `PAYMENT_LINKS` config object at top of script — all links centralized
- Buttons now call `handlePayment()` which checks whether a real link is configured
- If link is not configured (starts with `REPLACE_`): falls back to email contact instead of broken link
- Clearly marked all placeholders with `REPLACE_WITH_...` prefix

### UX / UI
- Added "What happens after payment?" 4-step section
- Added `plan-target` subtitle for each pricing card (who the plan is for)
- Improved toggle accessibility: `role="switch"`, `aria-checked`, keyboard support
- Added `role="list"` / `role="listitem"` on pricing grid for screen readers
- Consistent button types: `<button>` for actions, `<a>` for navigation
- Added support contact section at bottom of page

### Technical
- Added Open Graph meta tags
- Added `role="banner"`, `role="contentinfo"`, `role="note"`, `aria-label` throughout
- Added `:focus-visible` outline for keyboard navigation
- Added `aria-label` on all CTA buttons
- Improved semantic structure: `<article>` for plan cards, `<h3>` for FAQ questions
- Removed duplicate CSS rules
- Organized CSS into logical sections with comments

---

## opc2026-conference.html

### Content & Copy Fixes
- Added "subject to final confirmation" note on date in hero (*) with explicit disclaimer
- Added "Registration is final only after official WPA confirmation and payment" notice in form
- Improved all Macedonian text (grammar, terminology, consistency)
- Made conference positioning stronger and more institutional
- Added 6-cell "For whom is OPC 2026?" audience section
- Improved ticket descriptions with clearer inclusions
- Changed "Паузи и свечена вечера" to "Паузи и работна вечера" (more professional)
- Added explicit payment/cancellation policy section
- Replaced all informal language with formal institutional tone

### Form
- Added complete client-side validation with visible error messages
- Added `FORM_CONFIG` object with `ENDPOINT` and `CONTACT_EMAIL` for easy configuration
- When `ENDPOINT = "NONE"`: uses improved mailto fallback with pre-filled professional body
- When `ENDPOINT` is set: uses `fetch()` to POST to real backend (Formspree-compatible)
- Added success/error status messages with `aria-live="polite"`
- Added `novalidate` + custom JS validation (accessible, professional)
- Added privacy notice with link to WPA privacy policy
- Added `autocomplete` attributes on relevant fields
- Added `aria-required` on required fields

### UX / UI
- Improved hero layout with clearer date/location meta
- Added audience grid section (6 categories with icons)
- Countdown now has `role="timer"` and `aria-live="polite"`
- All CTA buttons are consistent and logically named
- Venue section improved with structured detail rows
- All anchors verified and working

### Technical
- Added Open Graph meta tags
- Semantic HTML: `<article>` for tickets, `<section>` with `aria-labelledby` throughout
- Added `role="list"` / `role="listitem"` on grids
- `TARGET_DATE` constant in script for easy date update
- `:focus-visible` focus states on all interactive elements
- Removed dead CSS classes (`.tally-placeholder`, unused styles)
- Clean, organized script block with comments

---

## verify.html

### Security & Trust
- Removed "Нула фалсификати" section header (overclaiming language)
- Added professional disclaimer: "Verification confirms existence of a record, not a final institutional confirmation"
- Added explicit note directing users to contact WPA for final institutional confirmation
- Demo database clearly marked as DEMO only — not presented as production
- Added warning: "Never expose real personal data in front-end JavaScript"
- Added `DEMO_MODE` flag — when set to `false`, switches to real API mode

### Verification Logic
- Added `VERIFY_CONFIG` object with `DEMO_MODE`, `VERIFY_ENDPOINT`, `CONTACT_EMAIL`
- Real API path prepared with `fetch()` call — just set `VERIFY_ENDPOINT`
- Added `revoked` and `expired` certificate statuses with separate UI state
- Added `STATUS_LABELS` map for all statuses
- Demo shortcuts hidden in production mode (controlled by `DEMO_MODE`)
- Demo notice banner shown only in demo mode
- Error handling added for network failures in API mode

### Content & Copy
- All verification result text improved (formal, legally cautious)
- Replaced "Нула фалсификати" with "Директна потврда" in how-it-works
- "How it works" step 6 now explains direct contact path
- Disclaimer updated with full institutional language
- Result states: valid, not found, revoked/expired — all with appropriate wording

### UX / UI
- Added `aria-live="polite"` on result panel for screen reader announcements
- Demo shortcuts hidden by default; shown via JS when `DEMO_MODE = true`
- Demo notice banner replaces old inline comment
- Loading state improved with CSS animation
- `showOnly()` helper function for clean state management
- Print stylesheet hides demo UI and navigation

### Technical
- Added Open Graph meta tags
- Full semantic structure with `aria-labelledby`, `role="alert"`, `role="region"`
- `:focus-visible` focus states on all interactive elements
- `autocapitalize="characters"` on certificate input field
- URL parameter handling preserved and improved

---

## Placeholders Still Requiring Real Values

| File | Location | Placeholder |
|------|----------|-------------|
| wpa-card-checkout.html | `PAYMENT_LINKS.pro_annual` | `REPLACE_WITH_PRO_ANNUAL_PAYMENT_LINK` |
| wpa-card-checkout.html | `PAYMENT_LINKS.pro_monthly` | `REPLACE_WITH_PRO_MONTHLY_PAYMENT_LINK` |
| wpa-card-checkout.html | `PAYMENT_LINKS.academic_annual` | `REPLACE_WITH_ACADEMIC_ANNUAL_PAYMENT_LINK` |
| wpa-card-checkout.html | `PAYMENT_LINKS.academic_monthly` | `REPLACE_WITH_ACADEMIC_MONTHLY_PAYMENT_LINK` |
| opc2026-conference.html | `FORM_CONFIG.ENDPOINT` | `"NONE"` → replace with Formspree/Tally URL |
| opc2026-conference.html | `TARGET_DATE` | Update to confirmed OPC 2026 date |
| verify.html | `VERIFY_CONFIG.VERIFY_ENDPOINT` | `"NONE"` → replace with real API |
| verify.html | `VERIFY_CONFIG.DEMO_MODE` | `true` → set to `false` in production |
| verify.html | `DEMO_DB` | Remove or replace with real backend data |

---

## WPA QA Pass v1.1 — Assistant Review

### Additional Fixes Applied
- Corrected remaining Macedonian typo in OPC form: `полно ime` → `полно име`.
- Standardized several mailto fallback labels in the OPC form body.
- Added canonical links and aligned Open Graph URLs with the actual delivered filenames.
- Refined WPA Card payment wording so it does not imply active automated payment until real links are configured.
- Added a visible fallback alert before Pro/Academic checkout opens a manual email request when payment links are still placeholders.
- Corrected verification wording: `WPA систематот` → `WPA системот`; `Сериски бројот` → `Серискиот број`.
- Reworded the verification explanation to emphasize registry-record confirmation, not absolute authenticity claims.
- Reworded the certificate disclaimer from English degree labels to Macedonian institutional wording.
- Replaced risky `innerHTML` assignments in certificate result rendering with `textContent` for safer live API integration.
- Updated one future-dated demo certificate issue date to a past demo date.

### Remaining Launch Items
- Insert real payment links.
- Insert real OPC registration endpoint or confirm email fallback.
- Connect real verification API and set `DEMO_MODE = false`.
- Confirm final OPC 2026 date and update countdown if needed.
- Confirm production URLs for privacy, rights/takedown and certification pages.


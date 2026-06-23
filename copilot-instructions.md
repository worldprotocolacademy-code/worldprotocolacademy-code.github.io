# Copilot / Agent Instructions — World Protocol Academy

You are working inside the WPA institutional repository. This is a **hand-built
static HTML site served by GitHub Pages — NOT a Jekyll site.** There is no build
step, no Liquid templating, no `_data` rendering. Edit the `.html` files directly.
Translations load via the external `wpa-translator.js`; when you change visible MK
text that also has EN/FR keys, flag the matching translator keys for update.
Follow these rules on every task. They are non-negotiable.

## Identity (use exactly; never alter, never delete)
Preserve these two identity lines verbatim wherever they appear:
- **MK:** Светска академија за протокол — Институт за протокол, дипломатија, јавна комуникација и безбедносни студии
- **EN:** World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies

Other fixed identity facts:
- Thematic line: Протокол · Дипломатија · Односи со јавност · Безбедност · Комуникологија
- Doctrine: „Преговарањето е опционално. Протоколот е апсолутен.“
- Director title: **Доц. д-р Санде Смиљанов.** Use „Вонреден професор“ ONLY for the
  International University Europa Prima appointment, never as a generic title.
- Contact email is `worldprotocolacademy@gmail.com`. Do NOT invent placeholder
  domain emails (corrections@, legal@, media@, governance@…).

## Hard rules — integrity (never break)
1. **No invented identifiers.** Never invent or guess an **ISSN, ISBN or DOI**.
   If a value is unknown, leave it blank with a `TODO_VERIFY` comment. Only use
   identifiers confirmed in the official Zenodo / publisher record.
2. **No invented accreditation.** Never claim accreditation, official recognition,
   degree-granting status, government mandate or legal registration.
3. **No invented partners.** Never name a partner, endorser, reviewer or
   cooperating institution without a signed/confirmed agreement.
4. **No invented rankings, approvals, funding or institutional claims.**
5. **No unverifiable superiority/priority claims** about WPA's status:
   avoid "first", "only", "unique", "world-leading", "best", "unprecedented",
   "official", "accredited", "recognised". Use safe language instead:
   "specialised", "focused", "developing", "independent", "institute-style",
   "research-oriented", "author-led", "independent digital educational and
   research platform". (Negated disclaimers — e.g. "not accredited",
   "not an official recognition list" — must be PRESERVED, not changed.)

## Hard rules — change discipline (never break)
6. Inspect before editing. Report line counts and content volume first.
7. **No mass deletion.** Never delete institutional content. Never remove
   Macedonian text. Never replace a long file with a shorter "simplified" version
   without explicit approval.
8. **One small commit per phase.** No mass rewrites. Always open a PR for human review.
9. Never hide Macedonian via white-on-white or low-contrast styling.
10. Never duplicate EN and MK names so they overlap or concatenate in the header
    (e.g. „...ПРОТОКОЛWORLD PROTOCOL ACADEMY“). Keep them on separate lines.
11. Never use a bare `href="#"` placeholder or a generic root link
    (meet.google.com/, zoom.us/, webex.com/). Use a real link or remove the control.
12. Never mix Institute code into Bibliography code, or vice versa.

## Hard rules — infrastructure (never break)
13. **Never overwrite an existing CI workflow without a diff review.** If a
    `.github/workflows/*.yml` already exists, do not replace it. Show a diff and a
    comparison note (what it adds, what risk it introduces), and merge by hand.
14. **No sitemap entries for non-existing pages.** Every URL added to `sitemap.xml`
    must point to a file that exists in the repo. Remove or never add entries for
    planned/placeholder pages until the page is live.

## Cross-registry consistency (manual, since this is static HTML)
- Publication counts (currently 25 total: 5 monographs · 1 dissertation · 19 papers;
  plus a separate series of 11 Working Papers and 2 Protocol Notes with Zenodo DOIs)
  must match on EVERY page and badge. If you change a number, grep the whole repo
  for the old number and update every occurrence in the same PR — and update the
  matching `wpa-translator.js` keys for EN/FR.
- OPC date and venue must be identical wherever they appear (currently: December 2026,
  Hotel Inex Olgica, Ohrid).

## Status language (always)
Use: planned, in development, pilot, beta, forthcoming, under preparation.
Avoid hype and any claim of accreditation, indexing or partnership not yet formal.

## Style
Clear Macedonian + British English. Institutional, calm, transparent tone.
Preserve bilingual MK/EN integrity in every change.

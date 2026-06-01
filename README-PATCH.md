# WPA Institute — Trust Layer fix (OVERLAY patch)

This is a small overlay patch. Upload/merge over the existing GitHub repository.
Do NOT delete anything else. NOT a full-site replacement.

## Fixes the live 404 bug in the Institute "Trust, Provenance & Correction Layer"

NEW canonical bilingual pages (MK/EN via accepted wpa-translator):
- public-disclaimer.html      + locales/public-disclaimer/
- correction-request.html     + locales/correction-request/
- rights-takedown.html        + locales/rights-takedown/   (replaces the old "во подготовка" placeholder)

UPDATED:
- institute.html — Trust-layer + footer links now point to the canonical root paths
  (institute/index/disclaimer.html → public-disclaimer.html ; institute/index/correction.html →
  correction-request.html ; rights-takedown.html unchanged). Labels already correct in locale.
  NOTE: this institute.html also carries the earlier positioning enhancement (identity.p1/p2).

BACKWARD-COMPAT redirect wrappers (so old/cached links don't stay broken):
- institute/index/disclaimer.html  → ../../public-disclaimer.html
- institute/index/correction.html  → ../../correction-request.html

## Upload (overlay) — overwrite/add these, delete nothing:
public-disclaimer.html, correction-request.html, rights-takedown.html, institute.html,
institute/index/disclaimer.html, institute/index/correction.html,
locales/public-disclaimer/, locales/correction-request/, locales/rights-takedown/

Honest: WPA stated as not a state accreditation institution; indexes/benchmarks are
analytical/educational tools, not legal judgments/licences/official rankings; correction
handled in good faith, no automatic correction / no immediate-response promise; no fake
legal overclaims; no "во подготовка" placeholder.

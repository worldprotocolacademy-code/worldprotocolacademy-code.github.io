# WPA — content-completion + CI-compliance overlay patch

This is a content-completion and CI-compliance overlay patch for partnerships/index.html and
privacy.html. It replaces placeholder pages with real bilingual WPA pages and adds the required
CI head metadata. Upload/merge over the existing GitHub repository. Do not delete existing files
or folders.

Does not touch Journal, Protocol Symbols Lab, WPAWS, Institute, Security, Audio Media Engine,
passive-revenue.html, WPA Card, or wpa-translator.js.

## Files (overwrite/add; delete nothing)
- partnerships/index.html              (real Institutional Partnerships gateway)
- privacy.html                         (real Privacy Policy page)
- locales/partnerships/mk.json · en.json · locale-status.json   (34 keys)
- locales/privacy/mk.json · en.json · locale-status.json        (31 keys)

## Scope boundary — Institutional Partnerships ≠ Member Benefits / Sustainable Revenue
partnerships/index.html is an INSTITUTIONAL partnership gateway only — universities & academic
institutions, libraries/research centres/archives, diplomatic academies & training centres,
public institutions/municipalities/cultural centres, media/communication/educational partners,
OPC 2026 & joint programmes, and future formal cooperation. It contains NO sustainable-revenue
doctrine, NO WPA Card / member-benefits architecture, and NO coupon/benefits marketing.

The sustainable-revenue / WPA Card / member-benefits material belongs to passive-revenue.html,
the WPA Card / Member Benefits page, or a future partnerships/member-benefits.html — NOT here.
The only connection on this page is ONE small cross-link:
  EN: "For membership benefits and WPA Card architecture, see the WPA Card / Member Benefits page."
  MK: „За членски придобивки и WPA Card архитектура, видете ја страницата WPA Card / Member Benefits."
linking to ../wpa-card.html.

## Careful positioning (no overclaiming)
WPA is described as "an independent digital educational and authorial platform in development,
operating as an institute-style programme framework". No claim of legal registration as an
institute, government mandate, state accreditation, university status, or confirmed partnerships;
partners are listed only when formally confirmed by a written agreement. The privacy page states
it is general information, not a substitute for formal legal advice.

## Technical
Both pages use the accepted WPA translator (data-wpa-page, wpa-translator.js?v=3.0,
data-i18n / data-i18n-html / data-i18n-attr) with full MK/EN parity, and carry the CI-required
head metadata (title, viewport, meta description, canonical).
Canonicals: https://worldprotocolacademy-code.github.io/partnerships/ and …/privacy.html

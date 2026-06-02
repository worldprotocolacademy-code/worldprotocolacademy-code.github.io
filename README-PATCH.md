# WPA Homepage — legal-positioning cleanup (homepage only)

Small homepage-only overlay patch. Overlay/merge over the existing repository. Do not delete
other files. NOT a redesign and NOT a full-site replacement. Does not touch partnerships,
Journal, Institute, WPAWS, Protocol Symbols, Security, Audio Media Engine or wpa-translator.js.

## Files (overwrite only these)
- index.html
- locales/index/mk.json
- locales/index/en.json
- locales/index/locale-status.json

## Latest micro-fix
- Removed hard-coded English word "credentials" from a Macedonian fallback in index.html.
  "WPA сертификатите и записи се независни институционални credentials" ->
  "WPA сертификатите и записите се независни проверливи сертификатски записи".
  Wording aligned across index.html, mk.json and en.json (EN: "...are independent verifiable
  certificate records, once the system is activated").

## Carried over (earlier in this cleanup)
- "academy as legal status" wording -> "независна дигитална образовна и авторска платформа во
  развој" / "independent digital educational and authorial platform in development"; institute
  sense -> "институтска програмска рамка" / "institute-style programme framework";
  "WPA е програмската куќа и дигиталната рамка" / "WPA is the programme home and digital framework".
- Credentials wording -> "структурирани сертификатски патеки" / "structured certificate
  pathways", "проверливи сертификатски записи" / "verifiable certificate records", "дигитални
  записи за завршена програма" / "digital completion records, once the system is activated".
- Pricing/payment: membership preserved but converted to planned model; fixed prices
  (€9.99/€19.99) no longer shown as live (paid tiers display "Планирано" / "Planned"); heading
  "Планирани пристапни нивоа" / "Planned access levels"; CTA "Изрази интерес ->" / "Express
  interest ->"; planned-payment note (no active payment link); Stripe/PayPal/Visa/Mastercard
  labels neutralized and the active provider logos removed.
- Founder title -> "Основач и програмски директор на WPA" / "Founder and Programme Director of WPA".
- Latin "ja" -> Cyrillic "ja" in Macedonian text.

## Preserved (unchanged)
Publication counts, books/papers, WPAWS, Protocol Symbols Lab, Professional English, cultural
diplomacy, audio-media engine link, bibliography links, contact email; translator
(data-wpa-page="index", wpa-translator.js?v=3.0, data-i18n keys); the proper noun
"Ohrid Academy of Humanism"; and existing disclaimers ("not a state diplomatic academy",
"not a university", "does not award academic degrees").

## Validation (all pass)
No "credentials" in Macedonian text; no "верификувани акредитиви"; no "verified credentials";
no fixed prices; no active payment-provider labels; no Latin "ja" in Macedonian text; still the
WPA homepage; MK/EN parity (627 keys); no missing data-i18n keys; no CJK/Hangul; no Bulgarian
hard sign; no zip-inside-zip.

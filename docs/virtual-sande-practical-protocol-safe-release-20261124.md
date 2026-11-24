# Virtual Sande — Practical Protocol SAFE Public Release Candidate v0.1.0
24 November 2026 · WPA Product Factory · PP-12 RELEASE

## Mandate and scope
The WPA owner has explicitly asked for Virtual Sande features to be put into production. This release is a bounded, independently testable, NON-BILLABLE subset — not a false claim of GPT/photo/PDF/full-book readiness. Full stack release PR #749 remains a separate guarded release candidate.

### In scope
- Self-contained Practical Protocol Studio in the standard floating Virtual Sande chat, keeping the canonical WPA /ask Worker intact.
- Separate visible Practical Protocol tab on virtual-sande-ai.html, keeping its existing academic bibliographic demo.
- Twelve professional cases: flags, anthems, precedence, motorcade arrivals, formal dining, conferences, diplomatic correspondence, PR, safety, communicology, AI/AR planning, other.
- Select event type, governing country, host, guest, venue, participants and exact question; obtain preparatory checks, domain steps, source leads, unresolved context and Human Gate.
- Illustrative 2D layouts for flag slots, eight banquet seats and four panel positions; no guessed precedence, honours or authorised AR.
- Local Markdown download, optional free-text triage and deliberate pre-fill into the existing chat. No auto-send, OpenAI request, camera, location, payment or external transfer.

### Out of scope
GPT-6.1 Terra connection and any paid model, third-party document PDF.js dependency, photo recognition, full book downloads, live research APIs, ROR institutional verification, voice/video, real augmented reality, protective motorcade routing, and autonomous decisions or publication. Those remain in the feature chain #743–#749 and require separate release gates.

## Legal source position
The attached user-provided document is the 1997 original law on use of Macedonia's coat of arms, flag and anthem. The Ministry of Justice LDBIS identifies Official Gazette 32/97 as the original and 110/08 as the subsequent amendment.
Original: https://ldbis.pravda.gov.mk/PregledNaZakon.aspx?id=4515
Amendment: https://ldbis.pravda.gov.mk/PregledNaZakon.aspx?id=15267
The baseline text contains flag-position articles 16–17 and anthem article 28, but this development release does not claim fully verified, current consolidated legal wording; the governing protocol officer must check before official application. UN HQ and archived US protocol guides remain scoped to their own jurisdictions. The uploaded PDF is not copied into the public GitHub repository.

## PP-12 quality gates
- PP-01 mandate PASS; owner authorised a public release, not automatic institutional legal decisions.
- PP-02 user need PASS; practical guidance for protocol visitors.
- PP-03 provenance PARTIAL; official register identified, current combined text not independently reconciled.
- PP-04 scope PASS; local-only, no AI billing or external source fetch.
- PP-05 acceptance PASS: 12 cases, 5 event types, 5 scopes, input validation and opt-in actions.
- PP-06 architecture PASS: two client modules plus existing widget and dedicated page.
- PP-07 build SOURCE COMPLETE IN PR, not yet deployed.
- PP-08 tests PENDING GitHub CI and live source verification; real Chrome/mobile accessibility NOT TESTED.
- PP-09 content PARTIAL; contextual source leads must be checked before official use.
- PP-10 security/privacy PASS for bounded local module, but no broader production compliance claim.
- PP-11 packaging PASS: code, tests, release notes, live checker and rollback.
- PP-12 Human Gate AUTHORISED IN PRINCIPLE; final release status depends on the merge result and an actual HTTP check.

## Verification and rollback
After an approved protected-main merge, GitHub Actions reruns deterministic tests and checks six real public assets under the official site. Remote JavaScript must match approved repository text; HTML must carry release markers. This proves deployed file identity only, NOT that every browser interaction is flawless. Real mobile, screen-reader, source-rights and production-browser checks remain separate.

Rollback is a reviewed revert of the merge commit and cache-busted frontend scripts. The independent Cloudflare API Worker is not changed, no API keys are touched, no new data collected and no paid AI is enabled.

## Next full AI production gate
The broader stack #749 remains BLOCKED until private Cloudflare staging authentication, a real model test, site-specific Turnstile, strict spending controls, rate binding, copyright/third-party PDF.js review, safe text/vision extraction, current legal references, licensed fulltext rights, and real browser accessibility are independently verified. Green mocked tests cannot substitute for those acceptance checks.

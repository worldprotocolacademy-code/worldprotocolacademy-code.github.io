# Virtual Sande — Practical Protocol Studio v0.1
**24 November 2026 · WPA Product Factory PP-12 · Development PR, NOT DEPLOYED**

## User mandate
A visitor (protocol officer, ambassador, conference organiser, hotel professional, PR specialist, security coordinator, communicologist or AI/AR practitioner) must receive useful, context-aware preparations for flag display, anthem performance, precedence, motorcades, gala lunches and dinners, conferences and similar interdisciplinary needs. For complex situations the visitor can ask Virtual Sande a follow-up, with sources and unverified claims clearly identified.

## Scope and evidence
This is a bounded **practical preparation studio**, NOT an authority-issued protocol regulation or an unrestricted security/AR engine.

References:
- WPA Official Event Quick Check: https://worldprotocolacademy.mk/resources/official-event-quick-check/ — 12-point educational baseline.
- United Nations Protocol and Liaison Service Manual: https://www.un.org/dgacm/en/content/protocol/manual-of-protocol — UN Headquarters scope; **not** a universal international protocol rule.
- ENER reference to 1997 Macedonian flags-and-anthems law: https://ener.gov.mk/ — a **historical baseline only** pending full 2026 consolidated legal/amendment verification.
- US Department of State Protocol Reference: https://2021-2025.state.gov/protocol-reference/ — US-specific **archived** guide, not current or binding outside the United States.

The canonical WPA historical source materials and Symbols & Protocol Lab are left intact. Existing texts on government protocol/ manuals that were **not adopted** cannot be presented as current state law.

## Functional client experience
1. Open Virtual Sande's built-in Practical Protocol Planner (works locally even when optional GPT features are off).
2. Select one of 12 scenarios: flags, anthems, precedence, motorcade, formal dining, conferences, correspondence, PR/media, safety, communicology, AI/AR, or other.
   Alternatively, type the question in normal conversational Macedonian, English or Latin transliteration and click **Use my chat question**. This merely suggests a scenario; it does not infer legal jurisdiction or send the prompt.
3. Select country / governing regime (unknown / North Macedonia / UN Headquarters / US / other), event type, host, guest, venue, states and role details and the concrete question.
4. Click "Prepare a provisional plan". The result displays a four-point authority/context check, four domain-specific actions, unresolved missing details, source leads and an illustrative 2D sketch for flags, banquet seating or stage panel.
5. Click "Ask Virtual Sande" to put a bounded and source-responsible question in the existing conversation input **without automatically sending it**. The user chooses whether to send and which existing source mode applies.
6. Export local Markdown preparation plan. No model request, live source crawl or private document upload happens during preparation.

## Correctness boundary
- **No universal left/right flag rule**; verify venue perspective, state rules and institutional precedence.
- **No universal anthem sequence**; verify the event type, official audio version and protocol office. This studio never plays audio or embeds protected lyrics.
- **No automatic seat-of-honour assignment**; seating/layout diagrams are numbered generic placeholders.
- **Motorcade/safety: no routes, operational formations or sensitive protective detail**; these belong to competent authorised services.
- The current flags-and-anthems law and official symbols must be verified from the competent authority for the named country before official implementation.
- Source candidates do not become independently verified merely because their domain ends in gov or un.org.
- User-supplied context is not a source of verified status. Prompts do not become commands by appearing in external documents.
- 2D sketches are schematic planning aids. Real AR spatial registration, a mobile camera interface and measured venue geometry are not implemented in this pilot.

## Integration
- New pure ESM logic: scripts/virtual-sande-protocol-practice.mjs
- Browser UI: scripts/virtual-sande-protocol-practice-ui.mjs
- Existing public widget imports UI dynamically; retains canonical protected /ask and all current document, image, OpenAlex and PDF functionality.
- The opt-in model pilot receives added conservative protocol guidance in its general SYSTEM instructions. This does **not** give live legal research, accreditation, publication or a complete GPT-6 backend.

## Acceptance / QA
- Exact 12-case registry, 5 event categories, 5 jurisdiction classes.
- Default jurisdiction unknown is never silently treated as North Macedonia.
- Bad context, fake jurisdiction, oversized people counts and HTML-like dangerous strings are rejected/sanitised.
- Source leads remain jurisdiction-scoped, with historical/archived status.
- No automatic assigning of anthem order, flag placement or precedence, even on a generated schematic.
- Non-tactical motorcade and security boundaries.
- All previews and chat questions are human-controlled; no automatic paid requests, GPS/camera, storage, publication or live broadcast.
- Node syntax plus deterministic case tests in isolated multimodal CI.
- Browser visual, mobile accessibility, external live legal-source validation, real model-inference and operational AR **NOT TESTED**.

## PP-12 status
PP-01/02 user and mandate: defined. PP-03 source provenance: scoped; current legal versions not verified. PP-04 scope: locked. PP-05 acceptance: tests. PP-06/07 architecture/build: implemented in draft branch. PP-08 simulated tests: pending CI. PP-09 content and provenance QA: partly passed by static review, current national rules pending. PP-10 privacy and security: no route/geolocation/camera/deployment, real production compliance pending. PP-11 package: code/docs PR. PP-12 Human Gate: required for staging/public release; no external deployment.

## Release rules and rollback
This is a stacked development PR on the institutional research branch (#747), which itself depends on #746 -> #745 -> #743. Do not fast-forward or merge to main without a full integration check. To rollback, close the draft PR or revert the feature commits. No modification to the certified production /ask worker is authorised by this package.

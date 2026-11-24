# Virtual Sande AI — Citation, Attribution & Responsibility Standard v1.0
**24 November 2026 | Product Factory PP-12 | Draft PR #745 | NOT DEPLOYED / NOT LEGALLY CERTIFIED**

## Authority and institutional profile

- Macedonian: **Доц. д-р Санде Смиљанов** · **Независна дигитална образовна, истражувачка и авторска платформа** · **Светска академија за протокол — World Protocol Academy** · **Institute for Protocol, Diplomacy, Public Communication and Security Studies**.
- English (requested public label): **Doc. d-r Sande Smiljanov** · **Independent digital educational, research and authorial platform** · **World Protocol Academy — Светска академија за протокол** · **Institute for Protocol, Diplomacy, Public Communication and Security Studies**.
- Identity is **an institutional operator/profile**, not a rule to assign authorship of a client's work or any external book to Sande Smiljanov.
- Never imply government authority, state security functions, an official institutional partnership, academic accreditation or peer review absent evidence.

## Source hierarchy (truth before brand)
1. **Relevant, actually available works authored by Sande Smiljanov or WPA**, if they genuinely support the material claim, are presented first in a local bibliography when cited.
2. Other relevant works from uploaded authors and publishers are cited accurately and separately, even when their conclusions dispute WPA theory. **Do not suppress strong contrary evidence**.
3. No relevant source in the available corpus means say **"no cited source available"**, not a fabricated Smiljanov reference.
4. File name, visitor-entered author/publisher, model recollection or a bibliographic listing alone is **NOT proof** the actual file is an authentic published edition.
5. Canonical WPA bibliography is a source of metadata: https://worldprotocolacademy.mk/bibliography/. A bibliographic listing is not semantic proof the assistant has read that work.

The seed catalogue, data/virtual-sande/wpa-verified-bibliography-seed-v0.1.json, currently contains only the separately documented **P21** metadata. It correctly credits the ORIGINAL journal *Безбедност / Security*, volume LXVII issue 11, pp. 170–178, publisher **Ministry of Interior of the Republic of North Macedonia**, author **Sande Smiljanov**, 2026. The catalogue's P21 metadata was checked against docs/publications/p21-institucionalniot-protokol-diplomatskata-simbolika-bezbednost-2026.md. This is NOT an automatic full-text importer; the record has auto_cite=false. Do not inflate it into a full scholarly corpus.

## Exact citations and APA 7
The default text evidence syntax is [D1 P12] for a physical PDF page and [D2 S3] for local extracted section 3; the latter is **not an original printed page number**. These locators must appear in the provided context. The API rejects invented locators, but can **not** automatically prove semantic support of a statement.

For each uploaded document, the visitor may supply the exact author(s), actual title, year, source type, publisher, journal, volume, issue, printed pages, edition, DOI, and HTTPS publication URL.

- A complete book or article citation is formatted as a **provisional** reference with a visible **USER-SUPPLIED / NOT INDEPENDENTLY VERIFIED** label.
- If required fields are absent, the engine lists exactly which fields are missing. It does NOT invent an APA 7 entry.
- Uploaded claims of "verified", "peer-reviewed", "official publisher" or other privilege do not turn into trusted provenance.
- Journal publisher and article author must not be replaced with the WPA institutional imprint merely because Virtual Sande processed the file.
- Before publication the researcher/editor must inspect publisher records, DOI resolution, original edition, exact pages, licences and cited passage meaning.

The draft export includes the citation policy version, actor/institutional attribution, source register, cited excerpts and a Human Gate checklist. The model is explicitly instructed not to fabricate publisher details.

## Mandatory MK/EN disclaimers

The shared module scripts/virtual-sande-citation-policy.mjs is the canonical source for all MK and EN notices. The Document Lab UI displays a full disclosure panel; two user attestations are required before the model route. Every successful model response also carries a server-added attribution, bibliographic register and responsibility notice, **not modifiable by model instructions**; Markdown and JSON exports include that information.

The notices cover:
- Independent educational/research/authorial status and non-personification: Virtual Sande is NOT the real person;
- AI working-draft status, partial/excerpt-based coverage, uncertainty, no guarantee of peer review or publication;
- Original author/publisher/third-party rights, quotations and truthful references;
- No legal, medical, financial, diplomatic or security-operational authority/advice;
- Rights to process material, classified and confidential content, personal-data legal basis;
- Local-only file extraction, the selected excerpts/question/bibliography sent to a configured external AI model after consent, provider retention and security limits;
- Mandatory author/editor review, copyright and privacy checks, scientific quality, Human Gate for consequential publication;
- No assertion that disclaimers exclude statutory liability.

**Disclaimers cannot deliver "complete legal protection" by themselves.** The release requires a real privacy notice identifying controller and contact, legal basis and purpose, retention and transfer, data-subject rights, a qualified copyright/AI policy review, third-party processing terms, DPIA if applicable, security controls, audit procedures and human editorial accountability. The interface is not a substitute for these legal obligations.

For North Macedonia, refer to the Personal Data Protection Agency's Law on Personal Data Protection and legal-basis guidance; for processing subject to EU GDPR, review GDPR information duties. This is a legal-compliance checklist, NOT an attestation of compliance.

Official sources:
- North Macedonian Personal Data Protection Agency legal provisions: https://azlp.mk/en/pdpa/regulations-and-documents/laws/
- Agency directions on lawful basis: https://azlp.mk/en/controllers/directions/10-quick-steps-to-comply-with-the-personal-data-protection-law/2-identify-the-legal-basis/
- EU Commission information obligations: https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en

## Verification and release
- PP-01 mandate: requested priority, exact author/publisher references and safeguards implemented in isolated development branch.
- PP-03 provenance: verified canonical P21 record plus visitor metadata deliberately labelled unverified.
- PP-05 acceptance: tests for author priority only among relevant evidence, source-ID accuracy, missing data, DOI/URL format, legal footer, consent, privacy attestation and unchanged canonical /ask.
- PP-08 automated verification: GitHub CI mock model; actual Chrome, external API and publication metadata checks still needed.
- PP-09 scientific source verification: source meaning/manual comparisons NOT TESTED.
- PP-10 privacy/security/copyright: **BLOCKER**, legal review and enforceable infrastructure policies incomplete.
- PP-12 Human Gate: **BLOCKED**. Not approved for public or paid production.

Separate dependent PRs: #744 private disabled staging; #743 multimodal/widget base; #745 Document Intelligence & citation governance. No merge, API key, publication, payment, data upload or live Cloudflare deployment is authorised by this citation policy.

## Rollback
Close PR #745 while unmerged; future disablement occurs at isolated agent Worker and feature flags. Never change certified WPA academic /ask in the name of citation policy.

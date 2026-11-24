# Virtual Sande — WPA Institutional Source Intelligence v0.1
24 November 2026 | PP-12 BUILD | Stacked development PR | NOT DEPLOYED

## Mandate and boundaries
Virtual Sande should use legally open scholarly works and selected official material from the World Protocol Academy Global Institutions Master List, extract the core essence relevant to a professional user's request, and prepare source-bounded analytical and editorial outputs for the WPA Institute. No intelligence, surveillance, paywall bypass or automated institutional publication is authorised.

REV7 contains 250 records; 249 external, 241 unique external institutions in its methodology, and 243 websites across the 250 records. The master is PRE-PUBLICATION institutional mapping, not a verified list of publishing repositories or an automatic copyright licence.

## Source-to-answer architecture
1. REV7 canonical directory: every record is traceable, with identity and methodological verification status. Reject audit children A010/A038/A065/A066, cooperation-model observations A005/B008, historical A035/D027, WPA R001 as external corpus and unresolved web identities for automatic current-institution search.
2. Existing WPA Institutional Knowledge Harvester: explicitly allowlisted official HTML/document records, with access rights gates, source locators and review artifacts; no unbounded bulk website crawler. Queue priority fix uses correct REV7 relevance and verification properties.
3. New OpenAlex identity lookup: server checks official institutions API, only allows exact-name or institutional-homepage candidate with no contradictory country, and identifies the mapping as PROVISIONAL.
4. New OpenAlex institutional OA works search: revalidates the selected identity server-side, filters Works by institution ID and open_access.is_oa true, then independently checks the returned indexed authorships include the same institution ID. Indexed source attribution remains unverified until editorial checking.
5. Browser Document Lab: user browses institutions, chooses a provisional identity, selects up to six indexed OA abstracts, and imports them explicitly. The selected corpus replaces previous local documents, avoiding hidden source conflation.
6. Document Lab working drafts: existing source-citation server guard; target audience may be professional_user or wpa_institute. The latter asks for research essence and lessons. Model requires separate user consent, Turnstile, rate limits and secure credentials. No actual model call is deployed here.
7. WPAWS / Protocolometry / Research Output Builder / WPA Product Factory own advanced cross-source analysis, verification, packaging, editorial review and release. None is silently bypassed.

## WPA Institute core-essence output design
- Exact research question and excerpt coverage
- SOURCE CLAIM / EVIDENCE / ANALYSIS / INTERPRETATION / WPA SYNTHESIS / LIMITATION
- Extracted main point and professional significance, with traceable sources
- Comparative angles, contradictions and counterevidence
- Institutional implications for teaching, case studies, curriculum or method
- Bibliographic gaps, verified rights, uncertainty and a human verification checklist
- Decision-oriented executive summary and responsible editorial next step

## Supported / unsupported
SUPPORTED CODE: read-only directory of 250 records, approved candidate triage, source metadata and abstract discovery through official API, manual selection, bounded evidence packets, working-draft synthesis route and editable Markdown/JSON provenance export. Weekly general OA watch and existing scheduled institutional source registry remain separate systems.

NOT SUPPORTED: automatic harvesting of all institutional sites; scanning all PDF/EPUB books; exhaustive full-text research; authorised secondary redistribution of books; autonomous publication or peer review; fully verified institutional OpenAlex IDs; unrestricted global API access or global cost SLA. Verified catalogue affiliation is not the same as actual authorship of a paper.

## Legal and quality gates
Public availability does not confer copyright reuse. OpenAlex metadata have separate terms from the original paper/book. An OpenAlex abstract is NOT the full document. Cite original authors and DOI, publisher, title, excerpt locator, licence claim, and retrieval date; verify at the source. No original third-party full text in the public repo.

PP-12: Mandate, source chain, architecture and code implemented in development branch. Automated tests and bundling must pass before staging. External provider identity accuracy, real Chrome upload workflow, paid OpenAI synthesis, private data controls, factual QA, book rendering and Human Gate remain NOT TESTED or BLOCKED. NO main merge, public launch, content publication or billing has been performed.

## Next phase: controlled full-book research
Verify reviewed ROR IDs for institutions; add official OAPEN/DOAB/DOAJ/Zenodo source connectors where permitted; licensed and secure fulltext fetching in private storage; page/chapter extraction; thematic retrieval and anti-contradiction checks; source-verified book/paper authoring; formatted Word/PDF and independent editorial approval.

## Related source paths
Master: data/global-institutions/v1.0-corrected-4f-rev7/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json
Harvester: tools/institutional-knowledge-harvester/institutional_knowledge_harvester.py
Source registry: data/institutional-knowledge/source-registry.json
Rights registry: data/institutional-knowledge/rights-registry.json
Open Research: scripts/virtual-sande-open-research.mjs
Institution directory: scripts/virtual-sande-institutional-directory.mjs
Institution resolver: scripts/virtual-sande-institutional-openalex.mjs
Institution API: workers/virtual-sande-multimodal-pilot/src/institutional-research-gateway.mjs
OpenAlex official documentation: https://help.openalex.org/api/

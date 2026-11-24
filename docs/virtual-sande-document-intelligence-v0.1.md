# Virtual Sande AI — Document Intelligence & Authoring Lab v0.1
**24 November 2026 · WPA Product Factory FINISH · development pilot · NOT DEPLOYED**

## Purpose and user mandate
An ambassador, diplomat, protocol officer, PR specialist, security practitioner, communicologist or AI specialist should be able to attach several professional documents, request a deep analysis, compare arguments, or create a working draft of a research paper, journal article, editorial, book plan, single book chapter, policy brief, professional report, press release or teaching material.

The internal path is source-aware and human-governed. The pilot does NOT inherit every function of ChatGPT or the authority of the real Dr Sande Smiljanov.

## User journey
1. Open the embedded Document Intelligence & Authoring Lab in the Virtual Sande chat window.
2. Choose 1–6 files: PDF, DOCX, TXT, Markdown, CSV or HTML. The browser parses them locally. Unreadable/scanned-only files fail closed.
3. Choose a discipline (protocol, diplomacy, public relations, security, communicology or AI) and a desired working-draft format.
4. Ask the question in the same chat field and explicitly consent to sending selected excerpts to the AI provider; complete Turnstile.
5. The assistant analyses up to twelve bounded local excerpts, with source locators such as [D1 P12] and [D2 S3]. After the first output, a visitor may explicitly opt to send a capped excerpt of the previous AI draft for revision; that previous draft is unverified editing context, NOT source evidence. The server rejects missing/unsupported citations.
6. Download the draft as Markdown plus JSON evidence/source register. Verify attribution, scientific/ethical suitability and editorial metadata before any publication.

## Evidence-first synthesis architecture

| Layer | Implemented | Limitation |
| --- | --- | --- |
| Parsing | PDF.js for text PDF; safe-size DOCX ZIP/XML; TXT, MD, CSV, HTML as text | No OCR, no PPTX/XLSX, no layout-perfect conversion |
| Provenance | D1–D6 document identifiers; Pn physical PDF pages; Sn extracted text segments | Provided documents are not independently authenticated |
| Retrieval | Local Unicode lexical indexing, Macedonian-friendly term keys, BM25 and discipline hints | NOT a semantic vector-embedding search engine |
| Evidence fusion | Select matching text across different documents and diversify excerpts | AI sees selected snippets, NOT every paragraph |
| Semantic analysis | Constrained language-model synthesis with source/inference distinctions | Real provider output NOT TESTED |
| Authoring | Ten structured, task-specific draft formats with supporting evidence | Book plans and individual chapters, NOT a complete book |
| Citation gate | Reject citations to non-provided locators and answers without cited sources | Page existence does not prove claim correctness |
| Packaging | Downloadable Markdown draft and JSON provenance register | DOCX/PDF pagination and publication workflow NOT YET IMPLEMENTED |

Limits: six files, 40 MiB each, up to 360,000 characters per file and 1,000,000 across the corpus; maximum 12 evidence snippets with approximately 11,800 characters per question. PDF may have up to 800 physical pages but text limits can block longer books. A comprehensive whole-book analysis requires a separately designed multi-pass or long-document workflow.

## Files and routing
- scripts/virtual-sande-document-intelligence.mjs: deterministic local index, citation metadata and evidence packets
- scripts/virtual-sande-document-parser.mjs: local file extraction
- scripts/virtual-sande-document-workbench.mjs: accessible in-chat upload and export interface
- workers/virtual-sande-multimodal-pilot/src/document-lab-gateway.mjs: validated input, academic writing prompt and citation checks
- workers/virtual-sande-multimodal-pilot/src/agent-gateway.mjs: opt-in /agent/document-lab endpoint in isolated pilot Worker
- scripts/virtual-sande-public-widget.js: guarded UI route; canonical WPA /ask unchanged

No original files or full corpus are transmitted by this path. Only selected user-approved text and source labels are sent to a provider, which may have separate retention/security rules. No localStorage or permanent server account store is intentionally used by the new code. Never use confidential or classified materials in a public test.

## Verification / PP-12
- Source implementation: IN BRANCH
- Unit tests and simulated model responses: PENDING CI
- Real Chrome PDF and DOCX upload: NOT TESTED
- Real Macedonian academic draft: NOT TESTED
- Source semantics / citation accuracy: NOT VERIFIED
- Provider billing, hard global budget, Turnstile, privacy and copyright: BLOCKERS
- Commercial service, public launch, human institutional approval: NOT AUTHORISED

Release path: separate private disabled staging PR #744; foundational multimodal pilot Draft PR #743; this Document Lab stacked feature branch with independent review. All source metadata, cited statements, authorship, anti-plagiarism checks, rights, figures, bibliographies, peer review and publication decisions require a responsible Human Gate. Do not claim automatic peer review, valid APA 7 references, verified publication or whole-book coverage.

## Future phases, outside this v0.1
OCR for scanned sources; PPTX/XLSX/RTF and email parsing; true per-chapter long-corpus analysis; optional semantic embeddings and re-ranking; collaborative revisions, editable manuscripts and DOCX/PDF book assembly; externally verified academic discovery; saved private workspaces, access controls and billing.

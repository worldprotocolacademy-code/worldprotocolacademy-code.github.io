# Virtual Sande AI — PDF Book Lab v0.1
**Date:** 24 November 2026  
**Mode:** FINISH / guarded pilot  
**Status:** SOURCE IMPLEMENTED · automated tests pending · **NOT DEPLOYED / NOT AVAILABLE TO PUBLIC**  
**Parent:** Draft PR #743 (isolated multimodal assistant; certified WPA `/ask` unchanged)

## Public intent

A visitor can open an **"📚 Анализа на PDF-книга"** tool *inside* the Virtual Sande AI public chat, select a PDF about any of the six subject areas, and ask a specific question or request cross-disciplinary synthesis. The source is the **visitor's uploaded book**, not a generic web corpus. The assistant returns analysis of relevant extracts with **physical PDF page numbers** and a visible scope warning.

Domains: **protocol, diplomacy, public relations, security, communicology and artificial intelligence**. User choice `auto` is allowed.

## Actual source-to-answer architecture

```text
Visitor's PDF (one book; browser only, no server file upload)
  -> validate PDF signature/type and size (40 MiB, 800 pages max)
  -> Mozilla PDF.js v6.5.438, downloaded as pinned browser module
  -> sequentially extract text on every physical PDF page locally (no OCR)
  -> WPA local evidence index: NFKC tokenisation, per-page chunks, BM25 weighting
  -> select relevant excerpts (focused / cross-domain / stratified overview)
  -> show coverage and missing-text warnings, cap to 9 excerpts (~10,400 characters)
  -> explicit consent + Cloudflare Turnstile + server rate limit
  -> isolated Worker POST /agent/pdf-analysis (selected text only; no PDF bytes)
  -> model instruction: source statements, analytic interpretation, synthesis,
     (PDF стр. N) citations, and limits; treat document text as untrusted
  -> reject citations to pages not provided as model context
  -> result in the existing chat + follow-up questions; no external actions
```

The original PDF file, large book text and browser index are **not written to localStorage or transmitted to the Worker**. The visitor's question, selected excerpt text, book filename and selected physical page numbers **are** transmitted to the configured AI provider only after consent; they may be subject to the provider's security retention obligations.

**External parser dependency:** The pilot currently imports a pinned version of Mozilla PDF.js from jsDelivr CDN. This executes vendor-distributed code in the browser. Before a public release, self-host the reviewed, version-locked PDF.js assets or complete a documented third-party integrity/supply-chain assessment.

## Synthetic analysis modes — not overstated

| Mode | Data supplied to model | Claim allowed |
|---|---|---|
| Focused question | Best-matching page excerpts after scanning text from **all** extractable pages | Grounded synthesis of selected evidence |
| Interdisciplinary | Scored extracts selected for question and chosen subject | Cross-domain discussion of extracts, not every subject by default |
| Book overview | Stratified extracts from throughout the book plus relevant hits | **Sampled** overview, **not** a comprehensive reading of every page |

Selected physical PDF pages differ from any Roman/Arabic page numbers **printed inside a book**. Cite `PDF стр. N` with that distinction clear to visitors.

A high lexical match does not guarantee relevance or truth. Validation guards reject out-of-range page references but cannot establish independent semantic correctness; a human researcher must check crucial statements.

## Accepted / rejected input

- PDF file `%PDF-` signature; one source book at a time; max 40 MiB, 800 physical pages.
- Text-based PDFs with extractable text. Scanned/image-only pages are reported as unreadable.
- Password-protected, malformed, oversized or pure-scan PDFs are **not** treated as successfully analysed.
- Non-PDF files, disguised uploads, joint PDF/image requests, invalid page references or oversized excerpts are rejected.
- Full copyrighted books are not republished, summarised verbatim or stored server-side by this pilot.

## Acceptance checklist

| Case | Required evidence |
|---|---|
| Local PDF text extraction on MK and EN book | **NOT TESTED IN CHROME** — test two real PDFs |
| 800 page / 40 MiB validation and local index | Source code + deterministic tests; **browser performance NOT TESTED** |
| Question about one physical page | Correct excerpt and page citation with manual source comparison |
| Cross-domain request | Relevant multi-subject evidence, no irrelevant fabricated connections |
| Overview | Clearly described excerpt sample + coverage disclosure |
| Scanned PDF | "OCR required" rather than inventing extracted content |
| Document injection | Book text treated as **data**, not instructions |
| Consent false / CAPTCHA invalid / rate limit | Provider not called, no billable inference |
| Off-by-one and invented page numbers | Server rejects unsupported (PDF стр. N) citations |
| Privacy | Original PDF stays local, text history segregated from canonical /ask |
| Accessibility / mobile | keyboard, screen reader, 390px widget, progress feedback |
| Model quality | real-provider test: Macedonian & British English, citations, long question |
| Production | separate Human Gate, independent Worker, rollback |

## Known limits / future work

1. **No OCR** yet. A safe scanned PDF OCR flow needs a separate user opt-in and a private processing plan.
2. Long-book **exhaustive** chapter-by-chapter summarisation is **not yet implemented**. Indexing every page and selecting ranked excerpts does not equal full semantic coverage of every page. A reviewed, budgeted multi-pass or secure full-corpus RAG system would be a separate version.
3. The pilot does **not** use a live crawler, ChatGPT's connected accounts, personal memory, files beyond the current selected PDF, or external operational powers.
4. PDF.js import is from a pinned third-party CDN; audit and self-host before public launch.
5. Uploaded PDFs may contain copyrighted or personal material. In production require user rights notice, data processing disclosures, provider processing agreement/legal review and a fair-use quotation boundary.
6. Need hard global cost budget and reliable metrics/circuit breaker; an edge per-IP rate limit alone is insufficient.
7. No model evaluation has yet validated hallucination rate; page-number validation cannot guarantee claims match the quoted excerpts.

## Release gates (PP-12)

- **PP-01–06** mandate, user need, provenance, scope, acceptance, design: documented.
- **PP-07** implementation: new index and UI modules, isolated guarded API endpoint.
- **PP-08** Node tests: GitHub CI must be green; browser and provider tests pending.
- **PP-09** author/source accuracy: manual compare to source books pending.
- **PP-10** privacy, security, copyright and accessibility: partial controls, formal review pending.
- **PP-11** package: Draft PR + this handoff.
- **PP-12** Human Gate: **NOT AUTHORISED for staging/prod release**.

**Rollback:** Close PR before merge; if merged before the optional pilot is configured, it remains disabled by its feature flag. Later rollbacks affect only the isolated `wpa-virtual-sande-agent-pilot` Worker and optional widget module, not the canonical `v35.1.1` `/ask` service.

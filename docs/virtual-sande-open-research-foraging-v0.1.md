# WPA Open Research Foraging v0.1 — Virtual Sande AI
**24 November 2026 · Source in Draft PR · NOT DEPLOYED**

## Mandate and institutional scope
User asks for autonomous discovery, analysis and original materials from legally open books and papers in the six WPA disciplines: Protocol, Diplomacy, Public Relations, Security Studies, Communicology and AI. The attached Protocolometry Center reference calls this WPA Knowledge & Protocol Foraging and requires public/authorised sources, provenance, correction and Human Gate review. No intelligence, surveillance, private data access, paywall bypass or automatic institutional publication.

## Functionality implemented as source
- On-demand open-access paper/book search through the official OpenAlex works API, exposed via a fixed, rate-limited, origin-checked, feature-flagged Cloudflare route. Separate flag WPA_OPEN_RESEARCH_ENABLED=false remains in both private and public pilot configurations. No paid AI prerequisite for discovery.
- Verified-shape candidate metadata: work ID, authors, DOI, year, OA location, asserted licence, short excerpt of available abstract, book vs article, source URL, retracted/closed exclusion and metadata-only coverage status.
- The in-chat Document Lab can explicitly import up to six abstract excerpts into its existing evidence index, then draft an analysis, paper, editorial, book plan or chapter after separate GPT consent, Turnstile and academic citation gates. Imported abstracts replace the previous private-source corpus; there is no hidden blending.
- Six-domain weekly metadata watch with bounded OpenAlex requests, JSON source candidates and an internal REVIEW-ONLY GitHub PR. No automatic text publication, DOI, model invocation or full-text download. A missing upstream response fails the run and does not overwrite the last snapshot. Schedule may be delayed by GitHub.
- Original source licences are treated as claims requiring re-verification. Metadata are not the same as article full texts; even OA is not an unlimited right to reproduce/rework books.

## Explicit limitations
NOT FULLTEXT: the pilot does NOT automatically download full books or PDFs, does NOT parse all pages of any discovered external book and does NOT generate a verified full-length book. Short abstracts and catalogue metadata cannot support comprehensive chapter-by-chapter conclusions. A result lacking an abstract is link-only. The system does not have unlimited access to every open book or paper.

NOT LIVE: the public bot, certified WPA /ask and Cloudflare production Worker are unchanged. Weekly watch only starts after reviewed workflow merge to default branch, and Open Research HTTPS requires a separately approved Worker with rate-limit binding and flag.

## Next full-text implementation after staging and legal QA
1. Verify exact source and licence directly at publisher/repository, plus DOI/ISBN/edition; include OAPEN and DOAB specialised book metadata providers. Follow Project Gutenberg machine catalog/harvest policy instead of general crawling.
2. Create explicit, bounded user-authorised fetch only from reviewed hosts, with redirect and SSRF defences, MIME/magic validation, max size and timeouts. Respect robots, API budgets, security, privacy, rate limits and licences; no paywall/login/CAPTCHA bypass.
3. Parse verified PDF/EPUB/XML by chapter/page and maintain permanent locators, extract coverage, provenance and notes. Full-text extraction is a distinct evidence source from abstracts.
4. Perform multi-pass retrieval, semantic comparison, chapter synthesis, factual contradiction tests, bibliography reconstruction and manuscript revision, then output genuine Word/PDF masters through a verified renderer.
5. WPAWS, Academic Search Hub, Protocolometry, Research Output Builder and Product Factory own complementary tasks; a responsible editor verifies copyrighted content, citations, authorship, anti-plagiarism, DOI and release.

## PP-12 acceptance status
Code drafted; live API search NOT TESTED; real browser NOT TESTED; full books NOT DOWNLOADED; semantic GPT synthesis NOT TESTED; public deployment BLOCKED; Human Gate NOT SATISFIED.
Automated tests cover metadata safety, no closed/retracted papers, no arbitrary proxy URL, source bounds, consent/rate gates and fail-closed provider errors. Green CI does not prove live OpenAlex, OpenAI or Cloudflare readiness.

## Source references
OpenAlex official API https://help.openalex.org/api/
OpenAlex OA copyright and licence https://help.openalex.org/data/works/open-access/
OAPEN machine metadata https://oapen.org/librarians/metadata
DOAB machine metadata https://doabooks.org/en/librarians/doab-metadata
Project Gutenberg robot access policy https://www.gutenberg.org/policy/robot_access.html

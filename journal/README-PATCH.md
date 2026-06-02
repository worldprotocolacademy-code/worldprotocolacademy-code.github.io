# WPA Journal — consolidated enhancement OVERLAY patch

This is an overlay enhancement patch. Upload/merge over the existing GitHub repository.
Do NOT delete existing files or folders. This is NOT a full-site replacement.

## ⚠ Why this matters: the journal enhancements are NOT live yet
A live check of the repository shows these enhancements are still UN-deployed:
- journal/index.html, vol-1-issue-1-2026.html, article-template.html, editorial-policy.html
  are still serving the OLD versions (not yet on the wpa-translator);
- journal/submit.html, author-guidelines.html, metrics.html, ethics-ai-use.html → 404 (missing);
- journal/feed.xml, journal/feed.atom → 404; all locales/journal* → 404;
- sitemap.xml has no journal entries; issue JSON-LD is still the old block.
Uploading THIS patch deploys all of it. (Tip: the repo has both `main` and `master`; upload
to the branch GitHub Pages actually deploys from, then hard-refresh.)

## What this patch contains (overwrite/add; delete nothing)
journal/ (8 pages, all on accepted wpa-translator MK/EN):
- index.html, vol-1-issue-1-2026.html, article-template.html, editorial-policy.html  (migrated)
- submit.html, author-guidelines.html, metrics.html, ethics-ai-use.html               (new)
- feed.xml (RSS), feed.atom (Atom)
- assets/journal.css, assets/journal.js   (existing design system, included for self-containment)
locales/ (8 sets): journal, journal-issue-1, journal-template, journal-editorial-policy,
                   journal-submit, journal-guidelines, journal-metrics, journal-ethics-ai
sitemap.xml (existing entries preserved + journal pages/feeds added)

## Phase 0 refinements (this revision)
- metrics.html — Impact Factor / CiteScore wording softened: "not currently claimed; may be
  considered only after sustained publication history and official eligibility".
- submit.html — uses "Responses are handled according to editorial availability" (no fixed time).
- journal/author-guide.html — added as a redirect wrapper → author-guidelines.html (no duplicate page).
- Feeds intentionally do NOT list WP-003/004/005: those individual URLs are not present in the
  repo, so adding them would create broken links. The feed stays journal-scoped (forthcoming issue).

## Honest + safe (verified)
- Issue JSON-LD = graph (Periodical · Organization · PublicationVolume · PublicationIssue ·
  CollectionPage); article-template = ScholarlyArticle TEMPLATE with [PLACEHOLDERS], no fake DOI.
- No fake ISSN/DOI/Impact Factor/Scopus/Web of Science; ISSN/DOI shown as pending.
- Submit = email workflow (no fake Formspree, no unconfirmed time promise).
- Metrics = internal indicators only + disclaimer.
- NOT implemented (deferred, per instruction): dark mode, academic share buttons,
  citation counter, seal generator / verify page. None added to nav or sitemap.

## Existing files preserved (NOT in this patch, NOT to be deleted)
journal/archive.html, current-issue.html, submission-policy.html, submission-form.html,
reviewer-guidelines.html, ethics-ai-transparency.html, publication-identifiers.html,
corrections-retractions.html, fair-access-fees.html, indexing-roadmap.html,
media_press_release.html, financial-ethics.html, editorial-calendar.html, supporter-circle.html,
journal/assets/sande-smiljanov-editor.jpg, wpa-translator.js, manifest.json (valid, logo.png icons).

Test locally: python3 -m http.server 8080  (engine fetches JSON; file:// will not work)

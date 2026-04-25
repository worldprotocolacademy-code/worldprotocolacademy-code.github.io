# WPA Student Desk Privacy — Decision Log

**World Protocol Academy**  
**Institute for Protocol, Diplomacy, Public Communication & Security Studies**  
**Date:** 25 April 2026  
**Classification:** WPA-INTERNAL

## Decision 1 — Tool classification

Student Desk and WPAWS are classified as working tools, not public SEO landing pages.

## Decision 2 — Sitemap rule

Student Desk and WPAWS must not appear in the public sitemap.

## Decision 3 — Search engine rule

Student Desk and WPAWS require:

- `noindex`
- `nofollow`
- `noarchive`
- `nosnippet`
- `noimageindex` where applicable

## Decision 4 — API key rule

API keys, service tokens, bearer tokens, and provider credentials must not appear in:

- public HTML
- public JavaScript
- visible DOM
- public GitHub files
- public R2 objects
- browser network traces where avoidable

## Decision 5 — Data rule

No real student data, assessment scores, activity logs, or identifiable demo data may appear on public surfaces.

## Decision 6 — Immediate next check

Review the actual `ai/student-desk.html` and `/wpaws/` pages for:

- robots metadata
- sitemap exclusion
- visible sensitive UI text
- API key or token exposure
- demo data safety

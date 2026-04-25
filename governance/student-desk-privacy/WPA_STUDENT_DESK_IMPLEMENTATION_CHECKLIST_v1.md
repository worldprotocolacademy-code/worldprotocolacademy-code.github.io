# WPA Student Desk Privacy — Implementation Checklist

**World Protocol Academy**  
**Institute for Protocol, Diplomacy, Public Communication & Security Studies**  
**Classification:** WPA-INTERNAL

## Day 1 — Stabilize

- [ ] Confirm Student Desk is not in `sitemap.xml`.
- [ ] Confirm WPAWS is not in `sitemap.xml`.
- [ ] Add or verify `noindex`, `nofollow`, `noarchive`, `nosnippet`, `noimageindex` on Student Desk.
- [ ] Add or verify the same directives on WPAWS.
- [ ] Confirm no API-key modal or sensitive working text dominates public snippets.
- [ ] If indexed, submit URL removal request in Google Search Console.

## Days 2–7 — Audit

- [ ] Search public HTML for `sk-`, `Bearer`, `token`, `api_key`, `secret`, `Authorization`.
- [ ] Inspect JavaScript bundles for embedded credentials.
- [ ] Inspect browser DevTools Network tab for exposed keys/tokens.
- [ ] Inspect localStorage/sessionStorage for sensitive content.
- [ ] Inspect cookies for missing `Secure`, `HttpOnly`, or `SameSite`.
- [ ] Review demo data for real-looking names, cities, scores, or activity logs.
- [ ] Confirm no real student data is visible without authentication.
- [ ] Confirm no answer keys or certification materials are exposed.

## Days 8–21 — Remediate

- [ ] Move credentials server-side.
- [ ] Replace real-looking demo data with synthetic labelled demo data.
- [ ] Separate public demo from private workspace.
- [ ] Keep private workspace behind authentication.
- [ ] Update privacy notice if actual processing changed.
- [ ] Confirm R2 public access remains disabled for private buckets.
- [ ] Confirm AI Search public endpoint remains disabled.
- [ ] Confirm AI caching/logging settings are privacy-safe.

## Days 22–30 — Verify

- [ ] Re-run all checks.
- [ ] Test live URLs in browser.
- [ ] Inspect headers.
- [ ] Inspect Search Console URL status.
- [ ] Confirm sitemap only contains public Tier P pages.
- [ ] Director signs off.

## Quarterly review

- [ ] Repeat sitemap review.
- [ ] Repeat credential scan.
- [ ] Repeat Search Console indexed URL review.
- [ ] Repeat localStorage/cookie check.
- [ ] Record findings in governance log.

# WPA Student Desk — 24-Hour Emergency Action List

**World Protocol Academy**  
**Institute for Protocol, Diplomacy, Public Communication & Security Studies**  
**Classification:** WPA-INTERNAL

## Trigger

Use this checklist if any of the following is suspected:

- Student Desk or WPAWS is indexed by Google
- student names, scores, locations, logs, or activity are public
- API key, token, or credential is exposed
- private tool URL appears in sitemap
- restricted content is visible without authentication

## First hour

- [ ] Notify the Director.
- [ ] Identify the exposing URL.
- [ ] Capture a timestamped internal screenshot for incident record.
- [ ] If credential exposure: rotate or disable affected key immediately.
- [ ] Take the exposing surface offline or put it behind authentication.
- [ ] Add or verify `noindex, nofollow, noarchive, nosnippet`.
- [ ] Externally test that the surface is no longer reachable or no longer indexable.

## Hours 2–6

- [ ] Open Google Search Console.
- [ ] Submit Temporary Removal for affected URL or URL prefix.
- [ ] Search for distinctive exposed phrases to check mirrors/caches.
- [ ] Identify whether personal data is involved.
- [ ] Identify systems involved: GitHub, R2, Worker, AI Search, AI Gateway, localStorage, logs.
- [ ] Document channel, duration, estimated reach.

## Hours 6–24

- [ ] Begin Material Incident Report.
- [ ] Confirm exposed surface remains offline/private/noindex.
- [ ] Request permanent removal if content should never return.
- [ ] If credentials were exposed, review provider usage logs.
- [ ] If personal data was exposed, prepare legal/privacy notification review.
- [ ] Prepare Director-approved external communication if needed.

## Do not do

- [ ] Do not delete logs before preserving evidence.
- [ ] Do not publicly comment without Director approval.
- [ ] Do not minimize or speculate in writing.
- [ ] Do not contact affected individuals before notification text is reviewed.
- [ ] Do not re-enable the tool until verification is complete.

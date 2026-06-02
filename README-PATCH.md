# WPA — head-metadata-only SAFE CI patch

This is a head-metadata-only safe CI patch (overlay). Upload/merge over the existing
GitHub repository. Do NOT delete any files. NOT a full-site replacement.
No page bodies, scripts, content sections or translation systems were changed —
only missing <head> metadata (<link rel="canonical">) was added.

## Included files (genuinely patched from their current RICH repo versions)
- rights-takedown.html      — added <link rel="canonical"> (rich page, body unchanged)
- public-disclaimer.html    — added <link rel="canonical"> (rich page, body unchanged)
- correction-request.html   — added <link rel="canonical"> (rich page, body unchanged)

Each already had <title>, viewport and meta description; only the canonical link was
missing. CI checks (title / viewport / description / canonical) now pass for these pages.
None contain a "Во подготовка / In preparation" placeholder.

## DELIBERATELY EXCLUDED — partnerships/index.html and privacy.html
The only versions present in the repository (on BOTH `main` and `master`) are PLACEHOLDER
pages (~3.6 KB, showing "Во подготовка / In preparation", no content sections). There is no
richer version of these two files in the repo reachable here, and the live github.io site is
not reachable from this build environment.

To avoid shipping/cementing placeholder pages, these two files are NOT included in this patch.

### To fix their CI errors safely
Provide the RICH current versions of partnerships/index.html and privacy.html (upload them),
and only the two required <head> tags (<meta name="description"> + <link rel="canonical">)
will be added to those rich pages — bodies untouched — and returned in an updated patch.

Until then, CI will still flag partnerships/index.html and privacy.html for missing
description/canonical, because their committed versions are placeholders without that metadata.

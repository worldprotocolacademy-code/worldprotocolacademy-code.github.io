# WPA — Trust wrapper fix (small OVERLAY patch)

This is a small overlay patch. Upload/merge over the existing GitHub repository.
Do NOT delete any existing folders or pages. This is NOT a full-site replacement.
Do not change the translator. Do not touch Journal, WPAWS, Symbols or other modules.

## What this fixes
The redirect wrappers at:
- institute/index/correction.html  → redirects to  ../../correction-request.html
- institute/index/disclaimer.html  → redirects to  ../../public-disclaimer.html
have been re-issued as clean, robust redirects (meta-refresh + JS location.replace +
visible fallback link + noindex). Overwrite the two existing files with these.

## IMPORTANT — why the live page still showed the old Audio Media Engine placeholder
The wrapper files were ALREADY correct in the repository (verified on both `main` and
`master`). The live site was serving a STALE cached version (old placeholder) via the
GitHub Pages CDN / an out-of-date deployment — not a file error.

After uploading this patch:
1. Commit the two files (this triggers a fresh GitHub Pages / Actions deployment).
2. Wait 1–3 minutes for the deployment to finish.
3. Hard-refresh the live URLs (Ctrl/Cmd + Shift + R) to bypass the browser cache.
4. If GitHub Pages deploys from a specific branch, make sure these two files are on the
   deployed branch (the repo has both `main` and `master`; upload to whichever Pages uses).

## Verified already-live and correct (no change needed — included here for reference only)
- public-disclaimer.html      — real MK/EN page (wpa-translator), live 200
- correction-request.html     — real MK/EN page (wpa-translator), live 200
- rights-takedown.html        — real MK/EN page (wpa-translator), live 200
- institute.html              — Trust + footer links already point to the canonical root
                                pages (public-disclaimer.html, correction-request.html,
                                rights-takedown.html); no institute/index/* links remain.

## Files in this patch
- institute/index/correction.html   (overwrite)
- institute/index/disclaimer.html   (overwrite)

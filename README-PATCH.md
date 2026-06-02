# WPA Root Homepage — restore patch (root index.html only)

Root-homepage-only overlay patch. Overlay/merge over the existing repository.
Do NOT delete other files. NOT a full-site replacement. Does not touch partnerships,
locales/partnerships, Journal, Institute, WPAWS, Protocol Symbols, Security or wpa-translator.js.

## Files (overwrite only these)
- index.html
- locales/index/mk.json
- locales/index/en.json
- locales/index/locale-status.json

## What this is
The correct World Protocol Academy root homepage (the legally cleaned version:
"платформа во развој" wording, planned access levels, no fixed prices, no active payment
provider labels, founder = "Programme Director", no academy-as-status / credentials wording).
Its main <h1> is "World Protocol Academy"; data-wpa-page="index"; full homepage structure
(hero, platform layers, WPAWS, Protocol Symbols Lab, Professional English, books/papers,
cultural diplomacy, bibliography, contact). It is NOT the Institutional Partnerships page.

## Diagnosis (important)
At the time of building this patch, BOTH the `main` and `master` branches already contained the
correct WPA homepage at root index.html (verified, cache-busted: data-wpa-page="index", main
<h1> "World Protocol Academy", no "Institutional Partnerships" as title/body, no "15 September
2026 OPC"). So the live root showing Institutional Partnerships is most likely a STALE GitHub
Pages CDN cache / previous deploy, not a current file error.

Re-committing this patch forces a fresh GitHub Pages deploy that clears the stale cache.

## How to deploy
1. Upload/overwrite these files to the branch GitHub Pages deploys from — to be safe, BOTH
   `main` and `master`.
2. Wait for the Pages build to finish, then hard-refresh (Ctrl/Cmd+Shift+R) the root URL.
3. The root URL should then show the World Protocol Academy homepage.

## Acceptance (all pass)
- root shows the World Protocol Academy homepage (main <h1> = "World Protocol Academy");
- root does NOT show Institutional Partnerships as the main title (only a minor in-page section
  heading links to the partnerships page, which is normal homepage content);
- root does NOT use the partnerships "WPA Institute" masthead;
- no old partnerships body in index.html;
- no "15 September 2026 OPC" text in root;
- not a full-site replacement (root homepage files only).

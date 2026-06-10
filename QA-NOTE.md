# WPA Institute Ecosystem — QA NOTE
## Academic 10+++ Final Repository Integration Package · 10 June 2026
## Result: 87/87 checks PASS · 0 FAIL

---

## File inventory

**Returned:**
- `institute.html` — approved original + 6 targeted edits (2199→2246 lines)
- `intelligence-center.html` — approved IC static HTML, unchanged (1010 lines)
- `mk.json` — safe merge: 627→649 keys, 22 added, 0 changed, 0 removed
- `en.json` — safe merge: 627→649 keys, 22 added, 0 changed, 0 removed
- `CHANGELOG.md` — full change log
- `QA-NOTE.md` — this file
- `INTELLIGENCE-CENTER-NOTES.md` — scope, rationale, deployment notes

**Not returned (intentional):**
- `sitemap.xml` — not uploaded; no fabrication
- React/Vite/Tailwind/app files — not applicable
- `.patch` files — not applicable

## JSON merge report

| Metric | mk.json | en.json |
|---|---|---|
| Original key count | 627 | 627 |
| Final key count | 649 | 649 |
| Keys added | 22 | 22 |
| Keys changed | 0 | 0 |
| Keys removed | 0 | 0 |
| Unrelated keys removed | 0 | 0 |

**Added keys (both files):** `institute.tools_hub.dois.*` (5), `institute.publications.working_papers.*` (5), `institute.opc.meta.*` (2), `institute.tools_hub.master_list.cta` (1), `institute.tools_hub.intel.*` + tag (4), `institute.footer.link_intel` + `institute.nav.intel` (2), `ic.subtitle.*` + `ic.tools.text.mk` (3)

---

## Detailed QA checks

### institute.html

- ✅ institutional-measurability exactly once
- ✅ Мерливост на институции
- ✅ Institutional Measurability
- ✅ Evidence scoring
- ✅ Correction and review
- ✅ WPA Working Papers 001–008
- ✅ WPA работните трудови 001–008
- ✅ WP-001 through WP-008
- ✅ WP-009 absent
- ✅ 001–004 absent
- ✅ 001-004 absent
- ✅ Првите четири absent
- ✅ first four WPA absent
- ✅ 15 септември absent
- ✅ 15 September absent
- ✅ Декември 2026
- ✅ old Master List CTA absent
- ✅ new Master List CTA present
- ✅ IC card href present
- ✅ IC footer link present
- ✅ Не рангираме
- ✅ protocolometry
- ✅ 160 records
- ✅ 159 external records
- ✅ 155 distinct external institutions
- ✅ 8 groups (A–D, G–I, R)
- ✅ E and F not used in REV2
- ✅ Source verification pending
- ✅ Not final public benchmark
- ✅ URL restoration does not equal
- ✅ Not an accreditation list
- ✅ Not an official recognition list
- ✅ Not a fully verified institutional ranking
- ✅ <html> once
- ✅ <head> once
- ✅ <body> once
- ✅ no [TODO]
- ✅ no lorem ipsum
### intelligence-center.html

- ✅ <!DOCTYPE html> once
- ✅ <html> once
- ✅ <head> once
- ✅ <body> once
- ✅ <html lang="mk">
- ✅ public sources
- ✅ human review
- ✅ right of correction
- ✅ not a state intelligence service
- ✅ does not conduct surveillance
- ✅ Не следиме луѓе
- ✅ Не работиме со тајни извори
- ✅ WPA Working Papers 001–008
- ✅ WPA работни трудови 001–008
- ✅ WP-001 through WP-008
- ✅ WP-009 absent
- ✅ 001–004 absent
- ✅ 160 records
- ✅ 159 external records
- ✅ 155 distinct external institutions
- ✅ 8 groups (A–D, G–I, R)
- ✅ E and F not used in REV2
- ✅ Source verification pending
- ✅ Not final public benchmark
- ✅ URL restoration
- ✅ Not an accreditation list
- ✅ Not a fully verified institutional ranking
- ✅ [TODO] absent
- ✅ lorem ipsum absent
### mk.json

- ✅ valid JSON
- ✅ 627 original keys preserved
- ✅ 649 total keys
- ✅ 001–004 absent
- ✅ 15 септември absent
- ✅ dois.title = WPA Working Papers 001–008
- ✅ dois.text has WP-001…WP-008
- ✅ opc date = Декември 2026
- ✅ intel.title = WPA Intelligence Center
- ✅ ic.subtitle.en present
### en.json

- ✅ valid JSON
- ✅ 627 original keys preserved
- ✅ 649 total keys
- ✅ 001–004 absent
- ✅ 15 September absent
- ✅ dois.title = WPA Working Papers 001–008
- ✅ dois.text has WP-001…WP-008
- ✅ opc date = December 2026
- ✅ intel.title = WPA Intelligence Center
- ✅ ic.subtitle.en present

---

## Sitemap

`sitemap.xml` was not provided as an upload. No fabrication performed.
Manual addition required:
```xml
<url>
  <loc>https://worldprotocolacademy-code.github.io/intelligence-center.html</loc>
  <lastmod>2026-06-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

---
**Total: 87/87 PASS**
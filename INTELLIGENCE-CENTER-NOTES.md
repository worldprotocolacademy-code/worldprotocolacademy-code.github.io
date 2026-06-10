# WPA Intelligence Center — Notes
## Rationale, Scope, Integration and Deployment
## WPA Institute · 10 June 2026

---

## 1. Terminology: why "Intelligence Center"

The term "intelligence" is used in the academic and institutional sense:

**Means:**
- Institutional intelligence — systematic analysis of publicly observable institutional behaviour
- Protocol intelligence — interpretation of ceremonial, procedural and precedence signals
- Open-source intelligence (OSINT) — established academic methodology using only public sources
- Diplomatic signal interpretation — reading public statements, formats and symbolic gestures
- Evidence mapping — structured documentation of public-source findings

**Explicitly does NOT mean:**
- State intelligence operations or espionage
- Surveillance of any individual or group
- Signals intelligence (SIGINT) or human intelligence collection (HUMINT)
- Classified or confidential data collection
- Law-enforcement or criminal investigation
- Covert collection of any kind

Both safety banners inside `intelligence-center.html` state this explicitly.

---

## 2. Institute integration points

| Integration | Location in institute.html |
|---|---|
| IC Tools Hub card | Public Tools Hub (`#wpa-public-tools-hub`) — domains-grid, final card |
| IC footer link | Footer resources column — after OPC 2026 link |
| IC nav link key | `institute.nav.intel` in JSON (implementation depends on nav script) |

The IC is **not** duplicated into `institute.html` — only the lightweight card + footer link are added.

---

## 3. Seven Intelligence Desks — scope boundary

| Desk | Strict scope |
|---|---|
| Protocol Event Intelligence | Public events only; no classified schedules |
| Diplomatic & Institutional Signals | Public statements only; no leaks |
| Global Institutions Monitor | WPA Master List domain; public data only |
| Public Communication & Reputation | Institutional communications; no personal tracking |
| Security Culture & Event Risk | Publicly documented incidents only |
| AI, Provenance & Citation Integrity | Open academic/publication ecosystem |
| Correction, Trust & Ethics | Public correction process only |

---

## 4. Source hierarchy — Level V note

Level V (Unverified / Reported Claims) is listed **to document what WPA does NOT use as sole evidence**. The explicit labelling provides methodological transparency. "URL restoration does not equal source verification" applies at Level V.

---

## 5. GitHub Pages deployment

`intelligence-center.html` is static HTML:
- No backend, no database, no authentication
- No cookies or tracking
- Google Fonts via preconnect (same as institute.html)
- All internal links to existing WPA pages
- Fully responsive (CSS media queries at 1024px and 640px)
- `<html lang="mk">` — Macedonian primary, English secondary

**Internal links used:**
- `index.html`
- `institute.html`
- `wpa-global-institutions-master-list.html`
- `working-papers/`
- `journal/index.html`
- `correction-request.html`
- `public-disclaimer.html`
- `rights-takedown.html`

---

## 6. Sitemap

`sitemap.xml` was not provided. Add manually:

```xml
<url>
  <loc>https://worldprotocolacademy-code.github.io/intelligence-center.html</loc>
  <lastmod>2026-06-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## 7. JSON keys added

All 22 new keys are namespaced under `institute.*` or `ic.*`.
They do not overlap with any of the 627 original keys.
Zero unrelated keys were removed or modified.

Future: if the IC grows into sub-pages, additional `ic.*` keys may be added following the same merge-only pattern.

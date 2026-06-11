# WPA Live Intelligence Feed — Integration Snippet

---

## A. Public Tools Hub card (institute.html)

```html
<div class="domain-card">
<div class="domain-tag">Live Feed</div>
<h3 data-i18n="institute.tools_hub.livefeed.title">WPA Live Intelligence Feed</h3>
<p data-i18n="institute.tools_hub.livefeed.text">Жив агрегат на јавни RSS/Atom сигнали од институциите во Master List REV2, со синтеза и анализа за секоја вест.</p>
<p style="margin-top: 18px;">
<a class="btn btn-primary" data-i18n="institute.tools_hub.livefeed.cta" href="wpa-live-intelligence-feed.html">Open Live Feed →</a>
</p>
</div>
```

### mk.json keys
```json
"institute.tools_hub.tag.livefeed": "Live Feed",
"institute.tools_hub.livefeed.title": "WPA Live Intelligence Feed",
"institute.tools_hub.livefeed.text": "Жив агрегат на јавни RSS/Atom сигнали од институциите во Master List REV2, со синтеза и анализа за секоја вест.",
"institute.tools_hub.livefeed.cta": "Open Live Feed →"
```

### en.json keys
```json
"institute.tools_hub.tag.livefeed": "Live Feed",
"institute.tools_hub.livefeed.title": "WPA Live Intelligence Feed",
"institute.tools_hub.livefeed.text": "A live aggregate of public RSS/Atom signals from Master List REV2 institutions, with synthesis and analysis for each item.",
"institute.tools_hub.livefeed.cta": "Open Live Feed →"
```

---

## B. Intelligence Center — ecosystem card

```html
<div class="link-card">
  <h3>WPA Live Intelligence Feed</h3>
  <p>Жив агрегат на јавни институционални сигнали преку RSS/Atom, со синтеза и анализа. Само јавни извори, без надзор и без приватни податоци.</p>
  <p style="font-style:italic;font-size:13px;color:rgba(251,248,238,.60);">A live aggregate of public institutional signals via RSS/Atom, with synthesis and analysis. Public sources only, without surveillance and without private data.</p>
  <a class="btn btn-primary" href="wpa-live-intelligence-feed.html" style="margin-top:16px;">Open Live Feed →</a>
</div>
```

---

## C. Footer link

```html
<a href="wpa-live-intelligence-feed.html">Live Intelligence Feed</a>
```

---

## Safety note
All snippets keep the "public sources only / no surveillance / no private data" wording. Do not present the live feed as tracking individuals or accessing private platforms.

---

## D. Feedspot bridge setup

### OPML import (your followed feeds)
1. Feedspot → Settings → Export → Export OPML
2. Save as `data/feedspot-sources.opml`
3. Commit. The workflow imports it automatically into group "F".

### RSS Combiner URL (optional)
1. Repo → Settings → Secrets and variables → Actions → Variables
2. Add `FEEDSPOT_COMBINER_URL` = your Feedspot combined feed URL
3. The fetcher reads it from the environment (never hardcoded).

Feedspot-imported feeds appear under the **F · Feedspot Sources** filter on the live feed page, clearly separated from the canonical REV2 institutions.

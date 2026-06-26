# WPA Audio Media Engine · `tools/wpa-audio-media-engine/`

| File | Role |
| --- | --- |
| `index.html` | **Self-contained** v3.0 tool. Identical to root `/audio-media-engine.html` except `canonical` + `og:url`. No external JS/CSS — runs alone. |
| `wpa-audio-engine-core.js` | Reference scaffolding (ES module). NOT imported by `index.html`. Phase-2 model. |
| `wpa-audio-engine-architecture.ts` | Reference scaffolding (TypeScript). NOT imported by `index.html`. |

> `index.html` е целосно самостоен. `core.js`/`architecture.ts` се само модел за иднина.

## v3.0 features
Trilingual **MK / EN / SQ** (dictionary-driven `data-i18n`), **register modes** (Academic / Formal / Executive / Viral) that flavour every generator, **instrument-panel signature** (live FLOOR lamp + audio-level motif), **always-on WPA Console** (project · metadata · room policy · notes · live preview), 4 room modes (Class / Workshop / Webinar / Institutional) with floor control, 10 modules = 10 tabs/sections, Save/Export/Reset with state hydration, full a11y (ARIA tablist, keyboard nav, aria-live, skip link, reduced-motion, print).

## Phase guards (do not weaken)
- **Sande Voice Engine** — consent-first; no unauthorized cloning; disclosure + human approval.
- **Live Video Rooms** — static governance simulation; real WebRTC/biometric floor control is Phase 2.
- **Web3 Certificates** — Phase 2 optional, only after legal/privacy/accreditation-language review.

# Testing the WPA bilingual site

## ⚠ You MUST use a local web server

The translations live in JSON files under `locales/` and are loaded at runtime with
`fetch()`. Browsers **block `fetch()` of local files over `file://`** for security,
so **opening a page by double-clicking it (file://) will NOT load the English/Macedonian
JSON** — the page will show its built-in Macedonian text and the language switch will
not work. There is **no inline JSON fallback**; a local server is required.

Start a local server from the project root (where `index.html` is):

**Windows**
```
py -m http.server 8080
```
(or run `START_LOCAL_SERVER_WINDOWS.bat`)

**macOS / Linux**
```
python3 -m http.server 8080
```
(or run `./START_LOCAL_SERVER_MAC_LINUX.sh`)

Then open: `http://localhost:8080/` and `http://localhost:8080/wpaws/`

## Manual test (do this on every page)
1. Open the page via `http://localhost:8080/…` (not file://).
2. Switch the language selector to **English**.
   - All visible body text must be English.
   - The **browser tab title** must change to English.
   - Right-click → View Page Source is not enough; check the live tab title.
3. In **WPAWS**, also click around: agent tabs, the document-type and chapter
   selects, Copy, Export, Memory — every label, button, option, placeholder and
   **toast/alert message** must be English.
4. Switch back to **Macedonian** — everything returns to Macedonian.
5. If anything still shows the other language, note the exact string.

Pages to check: `index.html`, `institute.html`, `programmes.html`,
`certification.html`, `wpa-card.html`, `passive-revenue.html`, `wpaws/index.html`.

## Automated checks (run from the project root)
```
npm install         # jsdom (only dependency)
npm run audit       # BIDIRECTIONAL: EN mode (no Macedonian) + MK mode (no forbidden English)
                    #   + keywords + a hard-coded-JS-message scan, all 7 pages
npm run test:i18n   # both-ways MK<->EN switch sanity test
```
A headless DOM is close to a browser but not identical — the manual server test above
is the final word. The automated audit additionally flags Macedonian left hard-coded
inside `toast()` / `alert()` / `confirm()` calls.

## Phase 1 scope
Only **Macedonian** and **English** are exposed in any selector (interface and the
WPAWS "AI reply" control). Additional languages remain in the code commented/labelled
as **inactive Phase 2** and are never shown in the Phase 1 UI.

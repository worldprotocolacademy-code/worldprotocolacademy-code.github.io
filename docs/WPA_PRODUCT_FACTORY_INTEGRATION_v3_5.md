# WPA Product Factory · Integration candidate v3.5

Date: 16 November 2026  |  Owner: World Protocol Academy · Human Gate  |  Scope: HTML tools and navigation

## User mandate
Integrate the two user-delivered pages, `WPA_Product_Factory_YOUNG_INNOVATORS(1).html` and `WPA_Product_Factory_GUIDE (1).html`, into the current Product Factory; connect EU Application Factory; preserve all existing functions.

## Source-of-truth reconciliation
- The live GitHub `main` checked at implementation time returned **404** for `/tools/product-factory.html` and `/tools/product-factory-guide.html`. Therefore these paths are created, not overwritten.
- A locally available v3.4 EU Application Factory Autopilot master is functionally more complete (210 pre-existing HTML IDs / many independent tools) than the shorter uploaded Young Innovators version. It is used as the preserved functional base, while the distinct Young Innovators section and six real interactive idea presets are imported from the user's upload.
- The standalone official Guide is based directly on the second user-uploaded HTML. Its 11 existing chapters are preserved; one additional EU Factory link chapter is appended.
- The canonical EU grant workbench remains at `/tools/eu-application-factory.html` (v9). No old static grant algorithm is allowed to replace its v9 code. The earlier embedded grant module within v3.4 is retained as a visibly labelled legacy local demo.

## Delivered repository paths
- `tools/product-factory.html`: comprehensive legacy v3.4 + Young Innovators Lab + WPAWS bridge + explicit EU v9 CTA + public boundary; responsive fixes.
- `tools/product-factory-guide.html`: all supplied official guide content + links to Young Innovators + EU v9.
- `tools/assets/wpa-product-factory-young-innovators-v1.js`: six user-supplied youth idea presets which fill the existing product intake and retain PP-12.
- `tools/wpa-five-engines.html`: discoverable Product Factory / Guide / Young links without replacing the EU Factory link.
- `tools/eu-application-factory.html`: small reciprocal Product Factory link, no change to grant engine or model connections.
- `tests/product-factory-regression.test.cjs`: preserves section/function inventory, label/status and link checks; parses all inline JS.
- `.github/workflows/wpa-product-factory-integration-qa.yml`: Node22 integration CI.

## Acceptance report (local)
| Criterion | Result | Evidence |
| --- | --- | --- |
| 210 old v3.4 IDs preserved | PASS | BeautifulSoup source vs target comparison |
| Six youth idea buttons fill v3.4 Product Intake | PASS | Chromium desktop & mobile interaction |
| Other existing demo flows retained | PASS | IPARD, WPA Journal research examples |
| PP-12 computation and generated output retained | PASS | Chromium Product Pack output, PP-12 map |
| Product Pack JSON export valid | PASS | Browser download and JSON parse |
| Guide all original chapters retained | PASS | 11 original chapters plus EU link section |
| Guide + Product Factory link to EU v9 | PASS | HTML href assertions |
| No JS runtime error | PASS | Chromium pageerror collection: zero |
| No global horizontal overflow | PASS | 1320px and 390px viewport checks |
| Node integration regression | PASS | `node --test`: 49/49 |
| Browser checks | PASS | `python tests/browser_qa.py`: 64/64 |
| Real public domain production deployment | NOT TESTED | Domain inaccessible from isolated container; GitHub merge != deployment |
| OAuth / LLM / paid agent network calls | NOT IN SCOPE | No new API keys, no provider activation |
| Submitting a real EU / IPARD grant | NOT IN SCOPE | Separate official eligibility, budget, annexes and Human Gate |

## Public boundaries
The old v3.4 source includes simulation/offer generation. New notice explicitly marks it as non-binding demo and does not activate services, memberships, payments or contracts. Product Factory is a public prototype/control plane, not a verified autonomous software build service. Old embedded EU grant panel is not the latest v9; a prominent link goes to the specialised tool.

The Young Innovators flow measures ideas, not children. It avoids unnecessary personal data. Public sharing, communications, finances or sensitive minor data require appropriate guardian/mentor/human approval.

## Manual post-release verification
1. Check that `/tools/product-factory.html` loads and UI does not show 404.
2. Check `#young-innovators`, click three youth idea buttons and verify intake and PP-12.
3. Check `/tools/product-factory-guide.html` and chapter links.
4. Click direct EU CTA: `/tools/eu-application-factory.html?v=9#easyWizard` and verify beginner wizard loads.
5. Check `tools/wpa-five-engines.html` discovery links and EU reciprocal link.
6. Verify mobile layout 390px, browser console and downloading JSON/Markdown.

## Rollback
Revert the integration pull request. This removes the new Product Factory paths and the small links without modifying the v9 EU application processing core. The supplied inputs and source v3.4 master remain in the local release archive.

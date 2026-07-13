# WPA Sublimate Engine v0.3.0

This directory contains the completed, isolated source package for the WPA Sublimate Engine.

## Status

- **Code package:** COMPLETE
- **Local unit tests:** 8/8 PASS
- **JavaScript syntax checks:** PASS
- **Existing `wpa-live-production-bridge`:** UNCHANGED
- **D1 migrations:** NONE
- **Automatic AI calls:** NONE
- **Production deployment:** PENDING Cloudflare secret configuration and one authenticated upstream smoke test

## Architecture

The engine is intentionally isolated from the current production bridge. It reads the bounded public response from:

`https://wpa-live-production-bridge.worldprotocolacademy.workers.dev/api/v1/live`

It does not assume an unverified D1 schema and does not write to the production database.

## Package files

- `wpa-sublimate-engine-v0.3.0.tar.gz.b64` — Base64-encoded source archive
- `extract-bundle.mjs` — deterministic local extractor
- `package-manifest.json` — checksums, file inventory and validation status

After extraction, the archive contains:

- `package.json`
- `wrangler.toml.example`
- `src/index.js`
- `src/errors.js`
- `src/security.js`
- `src/filter.js`
- `src/scoring.js`
- `src/snapshot.js`
- `src/templates.js`
- `src/output.js`
- `test/*.test.js`
- `openapi/sublimate-v1.yaml`
- `docs/deployment-checklist.md`
- internal source `README.md`

## Extract and verify

```bash
node extract-bundle.mjs
cd extracted/wpa-sublimate-engine
npm test
npm run check
```

The extractor verifies the SHA-256 checksum before writing the archive.

## Security boundaries

- Bearer token is required for document generation.
- CORS is restricted to configured WPA origins.
- No secrets, Cloudflare account identifiers or API tokens are stored in this repository.
- PDF returns HTTP 501 until a real renderer is configured.
- HTML output escapes active markup.
- Dataset provenance is labelled `upstream_live_window`; it is not represented as a complete D1 snapshot.
- No Zenodo DOI or invented current-production record count is included.

## Deployment rule

Deploy this package as a **new Worker** named `wpa-sublimate-engine`. Do not paste it into `wpa-live-production-bridge` and do not alter the existing production Worker until the isolated Worker passes the smoke checklist.

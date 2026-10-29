# WPA Institute Daily Product v1

Status: AUTOMATED DAILY · READY FOR HUMAN GATE
Date: 2026-10-29

## Purpose

WPA Institute Daily Product closes the operational gap between live public-source monitoring and a usable daily Institute output.

The product is not an automatic scientific publication. It is a finished daily briefing package prepared automatically for Human Gate review.

## Canonical A → B chain

1. WPA Journal Live authoritative public-source packet
2. API freshness gate
3. publication-date and source-URL provenance gate
4. source-health gate
5. relevance and source-confidence thresholds
6. five-domain classification:
   - Protocol
   - Diplomacy
   - Public Relations
   - Security
   - Communicology
7. deterministic ranking and deduplication
8. daily package generation:
   - HTML
   - Markdown
   - provenance JSON
9. dated archive and latest pointer
10. Human Gate

## Canonical outputs

- /institute/daily/
- /institute/daily/YYYY-MM-DD.html
- /data/institute-daily/latest.json
- /data/institute-daily/latest.md
- /data/institute-daily/YYYY-MM-DD.json
- /data/institute-daily/YYYY-MM-DD.md
- /data/institute-daily/index.json

## Automation

Workflow: .github/workflows/wpa-institute-daily-product.yml

Default cadence: daily at 04:17 UTC, plus manual dispatch.

The workflow also runs once after the generator/workflow is activated on main.

Generated files are published through the protected-main PR publisher. Repository quality and translator checks remain mandatory.

## Input hierarchy

Primary current input: WPA Journal Live.

WPA Watch and Journal Watch may provide complementary editorial context only when their freshness gate passes. A stale Watch feed must never override a fresh Journal Live packet.

Academic Search Hub is a discovery/verification planning layer, not the default daily live feed.

Pilot 20 is an institutional evidence/validation backend. It is consulted only for relevant institutional-comparison or benchmark contexts and never auto-applies a guarded canonical patch.

Sublimate remains a deterministic source/output architecture and optional isolated Worker runtime. The daily product has a repository-hosted execution path so output does not depend on Cloudflare Worker activation.

## Acceptance criteria

A daily run passes only when:

- the Journal Live packet has a valid generated_at timestamp;
- the packet is within the configured API-age limit;
- selected items have valid original-source URLs and published_at timestamps;
- source-health failures are excluded;
- every selected item passes minimum relevance and source-confidence thresholds;
- at least 3 items are selected;
- at least 2 WPA domains are represented;
- HTML, Markdown and JSON are all generated;
- the archive index is updated;
- Human Gate remains PENDING;
- automatic external publication remains false.

## Human Gate boundary

Automation may prepare and archive the daily product.

Human approval remains required before:

- journal article, Working Paper or Protocol Note publication;
- doctrine or canonical institutional claims;
- DOI assignment;
- external platform posting;
- reuse of third-party visuals;
- presenting a candidate as an independently verified WPA finding.

## Failure behaviour

If the API is stale, unavailable, malformed, too sparse, or fails domain/source thresholds, the workflow fails closed and does not replace the last good daily product.

A shorter or missing daily edition is preferable to unsupported output.

## Governance formula

Fresh public source → provenance → deterministic selection → Daily Product → Human Gate → consequential release.

Automation builds. Human Authority remains final.

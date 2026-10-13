# WPA AI Search Indexing Policy

Status: Production-aligned policy
Last updated: 13 October 2026

## Current production target

The current operational reference for Virtual Sande is:

- production worker: `wpa-virtual-sande-v35-1-production`
- canonical AI Search target: `protocol-ai-v4-final`
- current-state source: `/data/wpa-runtime-current-state.json`

Historical `protocol-ai` / v3 mirror material remains part of the controlled source lineage and rollback/audit history. It must not be described as the current production target merely because older workflows still reference it.

Live item counts are runtime metrics and must be re-verified from the provider. Historical expected counts are evidence of a cutover state, not a permanent live metric.

## Canonical source corpus

The canonical AI-ready source corpus is stored under:

`world-protocol-academy/UPLOAD_TO_WORLD_PROTOCOL_ACADEMY/99_ai_search_ready/`

This source layer is used for controlled ingestion, chunk generation, provenance metadata, completion markers and verification evidence.

## Locked production lineage

The v4 final target was built from the locked v3 controlled mirror lineage:

`__ai_search_ready_v3__/80cd2f51cf9ddb429562/`

The historical cutover evidence records a locked source manifest and an allowed 790-item manifest. Those hashes establish inventory identity; they do **not**, by themselves, establish copyright, licence, privacy or reuse rights for every source.

No new item may be promoted merely because it exists in R2, staging, an archive, a public website or a previous AI Search instance.

## Promotion rule

A new or changed item becomes eligible for production retrieval only after it has been:

1. ingested into the controlled AI-ready source corpus;
2. represented by provenance/completion metadata where applicable;
3. assigned an explicit rights status under the WPA AI Search Content Rights Gate;
4. checked for privacy, security and operational-sensitivity boundaries;
5. integrity-checked against recorded SHA-256 values where available;
6. included in an explicitly approved promotion manifest; and
7. verified after promotion by exact-inventory and retrieval checks.

Promotion is additive-no-delete unless an explicitly approved maintenance operation states otherwise.

## Content Rights Gate

Each source proposed for new production promotion must have a machine-readable rights decision. Allowed decision states are:

- `AUTHOR_OWNED` — owned by Sande Smiljanov / WPA with authority to use for this purpose;
- `EXPLICIT_LICENSE` — reuse/indexing is supported by an identified licence or written permission;
- `PUBLIC_DOMAIN` — public-domain status is documented;
- `OFFICIAL_PUBLIC_SOURCE_LIMITED_USE` — official/public institutional material used only within a documented, bounded research/retrieval basis;
- `REVIEW_REQUIRED` — rights basis is not yet sufficient; **must not be newly promoted**;
- `EXCLUDE` — must not be promoted.

A source being publicly accessible is **not** a rights determination.

The registry schema is:

`/ops/ai-search/content-rights-register.schema.json`

The implementation note is:

`/ops/ai-search/content-rights-gate.md`

## Metadata and provenance

Files under `_metadata/`, canonical PDFs, manifests and completion markers are provenance and verification assets. They are not automatically retrieval content and must not be promoted unless explicitly approved as retrieval material.

Metadata files must not be indexed merely because they are located under an indexed prefix.

## Do not index the entire archive

The broader archive may contain:

- large PDFs;
- raw scans;
- duplicate materials;
- unsupported file types;
- unprocessed source files;
- private archives;
- contact or participant data;
- third-party works with unresolved reuse rights;
- operationally sensitive material.

The entire `world-protocol-academy/` tree must never be used as an indiscriminate production include rule.

## Preferred retrieval formats

Preferred:
- `.md`
- `.txt`
- `.json`
- `.csv`

Use with caution:
- `.docx`
- `.pdf`

Avoid direct indexing of oversized PDFs, raw scans, unsupported formats and duplicate files when an approved AI-ready representation exists.

## Privacy rule

Do not index private contact lists, phone numbers, personal email addresses, participant lists or other non-public personal data.

## Security and safety rule

Sensitive security, VIP, OPSEC, CI, CBRN and defence materials may be included only as approved, non-operational conceptual summaries. Do not index content that exposes operational instructions, protected procedures, access details, credentials, secrets or other material that would weaken institutional security.

## Production / staging separation

`protocol-ai-v4-final` is the canonical production target recorded by the current runtime state.

Older `protocol-ai` references may be used by staging, diagnostic, migration or historical workflows. They must not be used to infer the current production corpus without an explicit current-state verification.

## Access rule

The R2 bucket may remain private. Public R2 object access is not required for the internal AI Search ingestion architecture.

## Change control

Any change to the production AI Search target, source lineage, corpus promotion contract, rights scope, privacy/security scope or exact-inventory controls must be reflected in this policy and the corresponding governed workflow before being treated as production policy.

Human Gate remains final for consequential corpus promotion or exclusion decisions.

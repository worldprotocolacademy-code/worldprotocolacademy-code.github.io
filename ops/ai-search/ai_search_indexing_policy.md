# WPA AI Search Indexing Policy

Status: Production-aligned policy
Last updated: 2 October 2026

## Canonical source corpus

The canonical AI-ready source corpus is stored under:

`world-protocol-academy/UPLOAD_TO_WORLD_PROTOCOL_ACADEMY/99_ai_search_ready/`

This source layer is used for controlled ingestion, chunk generation, provenance metadata, completion markers and verification evidence.

## Active AI Search indexing prefix

The production `protocol-ai` instance must index only the controlled v3 mirror:

`__ai_search_ready_v3__/80cd2f51cf9ddb429562/`

The active AI Search include rule is:

`**/__ai_search_ready_v3__/80cd2f51cf9ddb429562/**`

Do not point AI Search directly at the full archive, the canonical-source folders, or the entire `world-protocol-academy/` tree.

## Promotion rule

Content becomes production-indexed only after it has been:
1. ingested into the canonical AI-ready source corpus;
2. represented by verified completion metadata where applicable;
3. promoted additively into the active v3 mirror;
4. integrity-checked against the recorded SHA-256 values where available; and
5. confirmed by the exact-inventory verification workflow as present and indexed/completed.

Promotion is additive-no-delete unless an explicitly approved maintenance operation states otherwise.

## Metadata and provenance

Files under `_metadata/`, canonical PDFs, manifests and completion markers are provenance and verification assets. They are not automatically retrieval content and must not be promoted into the active mirror unless explicitly approved for that purpose.

## Do not index the entire archive

The broader archive may contain:
- large PDFs,
- raw scans,
- duplicate materials,
- unsupported file types,
- unprocessed source files,
- private archives,
- contact or participant data,
- operationally sensitive material.

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

## Access rule

The R2 bucket may remain private. Public R2 object access is not required for the internal AI Search ingestion architecture.

## Change control

Any change to the active v3 mirror prefix, AI Search include rule, corpus promotion contract or privacy/security scope must be reflected in this policy and in the corresponding repository workflows before being treated as production policy.

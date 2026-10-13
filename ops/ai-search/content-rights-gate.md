# WPA AI Search Content Rights Gate

Status: Governance control for future corpus promotion
Date: 13 October 2026

## Purpose

This control separates three questions that must not be conflated:

1. Is a source technically present?
2. Is a source factually/provenance-verified?
3. Is WPA authorised to promote that source into production retrieval?

A positive answer to the first two does not automatically answer the third.

## Default rule

**Unknown rights = no new production promotion.**

Public availability, search-engine accessibility, purchase, possession of a copy, inclusion in a staging bucket, or previous ingestion is not by itself permission to reproduce, transform, index or redistribute a work.

## Rights decisions

Every source proposed for a new production promotion must receive one of these states:

- `AUTHOR_OWNED`
- `EXPLICIT_LICENSE`
- `PUBLIC_DOMAIN`
- `OFFICIAL_PUBLIC_SOURCE_LIMITED_USE`
- `REVIEW_REQUIRED`
- `EXCLUDE`

Only the first four states can be promotion-eligible, and only when the recorded scope covers the intended AI Search use.

`REVIEW_REQUIRED` and `EXCLUDE` are fail-closed.

## Required evidence

A rights decision should record, as applicable:

- canonical source key or immutable source identifier;
- title / source description;
- owner or issuing institution;
- rights state;
- evidence type;
- licence / permission / public-domain basis / official-source basis;
- evidence URL or internal reference;
- permitted scope;
- restrictions;
- reviewer and review date;
- content SHA-256 where available.

## Official public sources

Official laws, treaties, government pages, diplomatic guidance and institutional publications can have different copyright/reuse regimes. The label `OFFICIAL_PUBLIC_SOURCE_LIMITED_USE` therefore does not mean unrestricted republication. It means the specific bounded retrieval use has been reviewed and documented.

Where the legal basis is uncertain, use `REVIEW_REQUIRED`.

## Third-party books and publications

Third-party books, commercial manuals, paywalled works, licensed training materials and works whose reuse terms are unknown must default to `REVIEW_REQUIRED` or `EXCLUDE` unless a suitable licence or permission is documented.

## Privacy and security remain separate gates

Passing this rights gate does not override privacy, confidentiality, operational-security or safety controls.

A source may be rights-cleared and still be excluded because it contains personal, confidential, operationally sensitive or otherwise unsuitable material.

## Existing locked production inventory

The recorded v4 cutover establishes a locked inventory identity for the historical 790-item production set. Inventory hashes prove which set was used; they do not independently prove the rights basis of each item.

Accordingly:

- do not make a blanket public claim that all 790 items are rights-cleared unless item-level evidence exists;
- do not add new sources by copying the historical allow-set logic alone;
- conduct item-/namespace-level rights reconciliation before any material corpus expansion;
- preserve production continuity unless a confirmed rights problem requires Human Gate action.

## Human Gate

Final promotion, restriction, remediation or removal decisions remain human-governed and should be evidence-based.

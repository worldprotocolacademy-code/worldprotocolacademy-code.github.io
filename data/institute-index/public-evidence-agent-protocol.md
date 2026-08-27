# WPA Public-Evidence Agent Protocol

**Version:** 0.1-candidate  
**Date:** 27 August 2026  
**Status:** Methodology-development protocol · human-governed · public evidence only

## Purpose

This protocol governs AI-assisted discovery, evidence extraction and methodology testing for the WPA Institute Index / Protocolometry programme. It is designed to extract the documented institutional core of diplomatic academies, foreign-service institutes, protocol schools and related institutions without crossing access, privacy, security or authority boundaries.

## Core rule

> **Public evidence only. AI may discover, extract, map and propose; consequential scoring, inclusion, correction and publication decisions remain human-governed.**

## Permitted sources

Agents may use material that is publicly and lawfully accessible, including:

- official institutional websites and public programme pages;
- official ministries, governments, legal registries and gazettes;
- public PDFs, annual reports, curricula, policies and handbooks;
- public scholarly repositories, DOI/ISBN/ISSN metadata and bibliographic databases;
- public faculty, governance and research pages;
- public partnership announcements and memoranda where openly published;
- authoritative international organisations and reputable secondary sources for corroboration.

## Prohibited or out-of-scope actions

Agents must not:

- bypass authentication, paywalls, CAPTCHAs, robots/access controls or technical restrictions;
- use leaked, stolen, guessed or third-party credentials;
- enter closed student, staff, partner or administrative portals;
- collect private personal data or infer sensitive personal attributes;
- impersonate staff, applicants, students, partners or officials;
- contact institutions or people autonomously without explicit human authorisation;
- treat marketing claims, follower counts, likes or publicity as academic/professional quality;
- invent missing data, use national-average imputation or silently convert absence of evidence into zero;
- issue accreditation, legal recognition, partnership, certification or official ranking claims;
- publish a consequential institution score without the Human Gate.

## Agent roles

### 1. Discovery Agent
Finds candidate institutions and possible official sources. Output is a discovery queue only.

### 2. Entity-Resolution Agent
Checks aliases, successors, branches, mergers, parent ministries and duplicate-context records before a new ID is proposed.

### 3. Evidence Agent
Extracts source-bounded facts into the Institution Evidence Dossier and attaches source IDs, retrieval dates and notes.

### 4. Indicator-Mapping Agent
Maps verified facts to I01-I20. It may propose a candidate 0-5/NE score only when evidence exists; proposed scores remain non-authoritative.

### 5. Methodology-Learning Agent
Extracts distinctive practices and asks whether WPA indicators omit, duplicate or over-weight important institutional capabilities.

### 6. QA / Contradiction Agent
Searches for conflicting sources, stale pages, renamed institutions, missing provenance and unsupported high scores.

## Evidence hierarchy

- **Tier A:** primary / official
- **Tier B:** authoritative external
- **Tier C:** reputable secondary
- **Tier D:** uncorroborated / promotional

A proposed score of 4 or 5 should normally include direct Tier A or Tier B support. Tier D alone cannot justify a score above 2.

## Missing evidence

**NE = Not Evidenced.**

NE is not zero, is not a penalty and is not an estimate. Agents must record uncertainty rather than fill a gap.

## Extraction workflow per institution

1. Confirm canonical identity and peer type.
2. Register official/authoritative sources.
3. Extract mission, governance, programme, learning, assessment, research, professional-practice, cooperation, credential and transparency models.
4. Extract distinctive practices without scoring them first.
5. Map evidence to I01-I20.
6. Record NE and contradictions explicitly.
7. Propose candidate scores only after evidence mapping.
8. Run contradiction/duplicate QA.
9. Submit dossier for authorised human review.
10. Only a human-approved dossier may enter controlled methodology tests; public consequential use requires the separate publication gate.

## Agent-output discipline

Every factual claim used for an indicator must retain:

- institution ID;
- source ID;
- exact URL or persistent identifier;
- source tier;
- retrieval date;
- extraction note;
- uncertainty/contradiction note where applicable;
- human-review status.

## Human Gate

Agents may prepare evidence and candidate calculations, but they cannot make the final decisions on:

- canonical Master List inclusion or removal;
- entity merger/split;
- final indicator score;
- correction/dispute outcome;
- methodology version freeze;
- public comparative or ordinal ranking;
- accreditation, recognition or certification claims.

## Public-rank boundary

During the candidate phase, the preferred outputs are dimension profiles, evidence coverage, methodology diagnostics and peer-type analysis. A public ordinal ranking remains disabled until v1.0 gates, independent methodological review and a separate governance decision are completed.

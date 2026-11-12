# WPA Media · One-Click Human Gate

## Goal

The authorised human approver should not need to open GitHub, inspect CI logs or operate production tooling.

The intended operator experience is:

**Email arrives → review a concise release summary → click APPROVE or RETURN → the exact release object continues or stops.**

## Approval email

The email contains only:

- programme name;
- release ID;
- estimated runtime;
- three lead topics;
- QA status;
- number of original sources;
- short script fingerprint;
- **ОДОБРИ И ПУШТИ ВО ПРОДУКЦИЈА**;
- **ВРАТИ НА ДОРАБОТКА**.

Technical logs remain available separately but are not required for normal approval.

## Cryptographic binding

Every approval is bound to:

1. one release ID;
2. the exact script SHA-256;
3. the exact manifest SHA-256;
4. one time-limited, one-use approval token.

If the script, source map, captions, presenter instructions or other release-critical material changes, the previous approval becomes invalid. The system must generate a new release ID or new fingerprints and request a new Human Gate decision.

## APPROVE path

APPROVE performs, server-side:

1. verify the one-use token;
2. verify release ID;
3. verify the stored script hash;
4. verify the stored manifest hash;
5. record the attributable human decision;
6. place the exact approved release in the render queue;
7. render approved voice/avatar assets through the configured provider adapter;
8. run audiovisual, caption and identity QC;
9. prepare the authorised delivery queue.

An approval is **not** permission for any later changed version.

## RETURN path

RETURN:

1. records RETURN_FOR_REVISION;
2. invalidates the current token;
3. sends the release back to Editorial Architect / Script Producer;
4. requires a new release object and a new approval request.

## What may remain automated

Before Human Gate, bounded agents may:

- monitor public/authorised sources;
- classify and rank candidates;
- check freshness/provenance;
- prepare scripts;
- allocate lines between Дипломатка and Дипломат;
- create caption drafts;
- create shorts;
- prepare programme masters;
- run deterministic QC;
- package the release.

## What remains Human Authority

Human Gate is mandatory before:

- public release;
- partner delivery to TV Alfa or another broadcaster;
- final voice/avatar production release;
- use of third-party visuals where rights remain unresolved;
- commercial commitments;
- presenter identity changes;
- institutional/doctrinal commitments.

## Current implementation status

The repository contains the production-pack generator, bounded agentic orchestrator, identity lock, programme definitions and the one-click approval contract.

A real one-click email flow still requires:

- a secure server-side approval endpoint;
- one-use token storage/signing;
- a configured email-delivery adapter;
- the selected production voice/avatar/lip-sync provider;
- an authorised render/delivery adapter.

Until those are connected and tested, the repository must not claim that one-click email approval is already live.

> **AI may work continuously. It may never authorise itself.**

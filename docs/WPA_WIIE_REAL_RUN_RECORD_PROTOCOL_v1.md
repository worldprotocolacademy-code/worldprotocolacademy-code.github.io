# WPA WIIE Real Run Record Protocol v1.0

**Status:** CANONICAL INTERNAL MEASUREMENT METHOD  
**Date:** 6 October 2026

## Purpose

This protocol governs how the WPA Institutional Intelligence Engine (WIIE) records real institutional missions for later effectiveness, efficiency, audit and learning analysis.

A WIIE Run Record is evidence of what actually happened. It is not a marketing score, not a claim of excellence and not institutional authority.

## Core rule

> Record the mission as it happened, including corrections, failures, fallback paths and unresolved uncertainty.

A successful final outcome does not erase failed first attempts.

## Canonical store

- Schema: `/data/wpa-wiie-run-record.schema.json`
- Real-run index: `/data/wiie-runs/index.json`
- Real records: `/data/wiie-runs/records/YYYY/WIIE-YYYY-NNNN.json`
- Metrics baseline: `/data/wpa-wiie-metrics-baseline.json`
- Validator: `/scripts/validate-wiie-run-records.mjs`

## Run lifecycle

### 1. Open

Assign a unique run ID before or at the beginning of a governed mission when practical.

Record:
- objective;
- mission profile;
- problem class;
- consequence / Human Gate class;
- start timestamp;
- data classification;
- initial routing reasons.

### 2. Execute

During the mission preserve, where applicable:
- specialist profiles actually used;
- source and provenance references;
- material disagreement;
- provider/tool failures;
- fallback mode;
- Human Gate state;
- implementation state;
- rollback reference.

Do not infer telemetry that was not captured. Unknown values remain null or explicitly unresolved.

### 3. Verify

A record may not claim SUCCESS merely because implementation completed.

Before closure, verify:
- source state;
- AI PROTOCOL Gate;
- Human Gate when applicable;
- adversarial review when required;
- regression / functional verification;
- outcome state.

### 4. Close

A CLOSED successful record requires a PASSED verification state.

If corrections were required, set `correction_required=true` and preserve the learning candidates. Do not rewrite the history as a first-pass success.

## Public-repository privacy boundary

The canonical GitHub store is not a place for sensitive raw mission content.

Do not commit:
- personal records;
- private correspondence content;
- credentials or secrets;
- health data;
- private legal/financial records;
- confidential partner material;
- raw sensitive prompts or attachments.

For a sensitive mission, store only a sanitised metadata record if publication is appropriate. Otherwise retain the raw record only in an authorised private system and reference it through a non-sensitive identifier.

`SENSITIVE_AUTHORISED` records are therefore rejected by the public-store validator.

## Real vs retrospective records

Preferred state: `LIVE_WIIE` — opened during the mission with direct telemetry.

Allowed bootstrap state: `RETROSPECTIVE_VERIFIED` — reconstructed only from verifiable repository, CI, document or other authorised evidence.

Retrospective records must state which measurements were unavailable. They must never invent tool-call counts, cost or runtime-agent activation.

`TEST` records are forbidden in the canonical real-run store.

## Metric eligibility

Each record independently declares whether it is suitable for:
- effectiveness metrics;
- time metrics;
- activation metrics;
- tooling metrics;
- cost metrics.

A record can therefore contribute to one baseline dimension while being excluded from another.

Example: a repository mission reconstructed from GitHub can support effectiveness and wall-clock timing, while remaining ineligible for tool-call or model-cost metrics.

## Baseline interpretation

The baseline must expose sample size. Early values are descriptive observations only.

A small sample must not be presented as proof that WIIE is universally faster, more accurate or more effective. Targets and external performance claims require a sufficiently diverse evidence base and explicit human review.

## First canonical real record

`WIIE-2026-0001` records PR #459: integration of the Institutional Operating Protocol, WIIE and WPA FUTURES 2040.

It is deliberately marked:
- SUCCESS at final closure;
- correction required = true;
- first-pass verification = false;
- activation/tooling/cost metrics ineligible where telemetry was not captured.

This establishes the institutional principle that WIIE learns from visible correction history rather than hiding it.

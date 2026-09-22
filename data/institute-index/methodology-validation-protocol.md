# WPA Institute Index / Protocolometry — Methodology Validation Protocol

**Version:** 0.1-candidate  
**Date:** 27 August 2026  
**Status:** Pre-v1.0 validation protocol

## Purpose

This protocol converts the global institutional evidence corpus into a reproducible test of the WPA 20-indicator methodology. The objective is not to force institutions into a pre-selected model, but to test whether the model accurately captures the documented capabilities and practices of the field.

## Validation sequence

### Stage 1 — Coverage completeness
- Use the current REV7 canonical baseline as the controlled universe reference while continuing evidence-corpus expansion.
- Use IFDT and national MFA/official sources as discovery controls.
- Record countries/regions with no identified institution separately from countries not yet searched.
- Do not treat any historical record count as a target ceiling; canonical revisions remain controlled and versioned.

### Stage 2 — Institutional Core Extraction
For every resolved institution, build a public-evidence dossier covering:
- mission;
- governance;
- programme architecture;
- learning and assessment;
- faculty/practitioner model;
- research and publication model;
- professional practice and simulations;
- international cooperation;
- credential/completion model;
- digital and multilingual transparency;
- ethics, COI, data and credential governance;
- distinctive practices.

No score is required during first-pass extraction.

### Stage 3 — Indicator coverage test
Map the extracted practices to I01-I20 and classify each practice as:
- `COVERED_DIRECTLY`;
- `COVERED_PARTIALLY`;
- `NOT_COVERED`;
- `DUPLICATES_EXISTING_INDICATOR_SIGNAL`;
- `OUT_OF_SCOPE_BY_DESIGN`.

A recurring high-value `NOT_COVERED` practice is a methodology-review trigger.

### Stage 4 — Scoring reliability
Use the published 0-5/NE anchors and run independent double scoring only after the Pilot 20 institution IDs and dossier snapshots are frozen.

Before real scoring starts, the scoring/reliability software may be tested with clearly synthetic fixtures. Synthetic preflight does **not** satisfy G03 or G04 and must not contain real-institution results.

For real Pilot 20 scoring:
- Pass 1 and Pass 2 must use separate assessor identities;
- each pass must be locked before the other pass becomes visible;
- both passes must use the same methodology version and frozen dossier snapshot;
- numeric differences of 2+ points, and NE-versus-numeric differences, require explicit disagreement reasons and human reconciliation;
- scores must not be mechanically averaged to resolve disagreement.

Required diagnostics:
- exact agreement rate;
- agreement within ±1 point;
- indicator-level disagreement frequency;
- reasons for disagreement;
- evidence-tier distribution behind scores 4-5;
- NE frequency by indicator and peer type.

Large disagreement is evidence that the rubric needs clarification; it is not a reason to average scores mechanically.

Reliability metrics are descriptive unless and until an authorised methodological review adopts a documented acceptability rule. The software must not invent an automatic G04 pass threshold.

### Stage 5 — Weight sensitivity
Compare at least:
- 30/25/25/20 candidate weighting;
- 25/25/30/20 diagnostic weighting;
- 25/25/25/25 equal weighting.

Synthetic fixtures may be used before real Pilot 20 scoring to verify the sensitivity engine. Synthetic drift or pairwise reversal proves only that the detector works; it does not establish that real institutions are weight-sensitive.

The diagnostic should report score drift and pairwise reversals without choosing weights automatically. No weighting may be selected because it produces a preferred institutional outcome.

Flag institutions whose composite or peer placement changes materially under reasonable alternative weights. The purpose is to identify fragile conclusions, not to select weights that create a preferred result.

### Stage 6 — Correlation and redundancy
Check whether two indicators repeatedly measure the same institutional signal.

Before real Pilot 20 analysis, synthetic matrices may verify the correlation/overlap engine. Synthetic high correlation or shared-source overlap is only a detector test and does not prove that two real indicators are conceptually redundant.

For real analysis, report both statistical association and shared-evidence overlap where feasible. Neither correlation nor overlap may automatically delete, merge or reweight an indicator.

High correlation triggers human review of:
- conceptual overlap;
- shared evidence sources;
- double reward/penalty risk;
- whether indicators should remain separate for normative reasons.

Correlation alone does not automatically delete an indicator.

### Stage 7 — Peer-type fairness
Run edge-case review across:
- STATE_FOREIGN_SERVICE;
- INDEPENDENT_PROTOCOL;
- UNIVERSITY_LINKED;
- INTERNATIONAL_TRAINING.

Synthetic peer profiles may verify that peer type, institution size, budget, country prestige, parent-brand prestige and social-media audience are excluded from the absolute standard-referenced scoring formula. Synthetic invariance does not satisfy G08.

Peer percentile remains a secondary diagnostic and must be withheld when the minimum peer sample is not met.

Questions:
- Does an indicator structurally privilege large universities?
- Does a state academy receive false penalties because finance or research data are not public?
- Can a small specialist protocol academy demonstrate excellence without scale advantages?
- Are outcome/process signals preferred over raw size where feasible?

### Stage 8 — Evidence coverage and missingness
Candidate composite is withheld below the published evidence thresholds.

Before real edge-case testing, synthetic profiles may verify the computational rule: NE is excluded rather than converted to zero, no imputation is permitted, and an otherwise identical supported profile should retain the same normalised score when coverage remains above threshold. Synthetic success does not satisfy G05.

Required missingness diagnostics:
- NE by indicator;
- NE by region;
- NE by peer type;
- NE caused by true non-disclosure vs website/language discoverability;
- potential geographic/language bias.

No imputation, country-average substitution or synthetic zeroing is allowed.

### Stage 9 — Correction and contradiction test
Before consequential use, selected real-institution dossiers must be tested through the correction process.

Record:
- factual corrections accepted;
- evidence rejected and why;
- unresolved contradictions;
- changes to scores after stronger evidence;
- reviewer conflicts of interest.

### Stage 10 — v1.0 Human Gate
Freeze v1.0 only after:
- coverage review is documented;
- indicator-gap review is complete;
- double-scoring reliability is acceptable or limitations are explicit;
- sensitivity/correlation diagnostics are logged;
- peer-type fairness is reviewed;
- evidence thresholds are tested;
- correction/COI procedure is operational;
- AAB or equivalent independent methodological review is completed after formal constitution;
- exact definitions, formulas, weights, dataset snapshot date and changelog are frozen.

## Required validation outputs

1. Global Coverage Register
2. Institution Evidence Dossiers
3. Practice-to-Indicator Coverage Matrix
4. Inter-rater Reliability Report
5. Weight Sensitivity Report
6. Indicator Correlation / Redundancy Report
7. Peer-Type Fairness Report
8. Missingness / Evidence Coverage Report
9. Correction & Contradiction Log
10. v1.0 Freeze Decision Record

## Interpretive rule

> The corpus is used to test the methodology; the methodology is not used to erase the diversity of the corpus.

## Publication boundary

Candidate diagnostics may be published transparently. Final real-institution comparative scoring or ordinal ranking requires the separate Human Gate and governance decision. Measurement does not constitute accreditation, legal recognition or endorsement.

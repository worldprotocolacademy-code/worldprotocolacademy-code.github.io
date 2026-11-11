# WPA Institute Proactive Agent Fabric v1.0.0-rc1

## Mandate

This release candidate extends the existing WPA Connected Vessels and WPAWS architecture. It does not replace WPAWS 11.1.7 or the Human Gate policy.

The fabric gives five named external-AI seats bounded operational roles:

- Grok-Bot-Proactive Agent — horizon scan, counter-signals and emerging public-source issues.
- GPT Orchestrator — task planning, routing, synthesis and handoff construction.
- Claude Red-Team Agent — academic red-team, contradiction detection and evidence sufficiency review.
- Kimi Long-Context Agent — larger context packets and multilingual comparison.
- Harvey Legal-Compliance Agent — legal/compliance issue spotting only when an authorised server adapter exists.

## Automation boundary

HG0 and HG1 work may run automatically: public-source discovery, queueing, classification, comparison, bounded drafting, research packet preparation and reversible workflow assistance.

HG2-HG4 never receive automatic final authority. Publication, external institutional statements, payments, credentials, private-data actions, doctrine changes, official commitments and other consequential releases stop as READY_FOR_HUMAN_GATE.

## Provider activation

All provider credentials are server-side secrets. No browser key storage is permitted.

A provider is ACTIVE only when all required values exist:

- API key
- API URL
- model/deployment identifier

If any are missing, that seat is UNAVAILABLE. The orchestrator must not fabricate a response or infer that a provider ran.

## Output contract

Every run emits JSON containing:

- run_id and timestamp;
- input provenance;
- provider availability;
- each agent's independent result or explicit UNAVAILABLE/ERROR state;
- reconciliation notes;
- Human Gate class and state;
- release conditions.

The system must preserve disagreement. It must not convert multiple model outputs into false consensus.

## Scheduling

The included workflow has a scheduled trigger, but it is inactive until this branch is merged to the repository default branch and GitHub Actions executes successfully. A merge alone is not proof of provider activation.

## Required repository secrets

Configure only for providers actually authorised for WPA:

- WPA_GROK_API_KEY / WPA_GROK_API_URL / WPA_GROK_MODEL
- WPA_GPT_API_KEY / WPA_GPT_API_URL / WPA_GPT_MODEL
- WPA_CLAUDE_API_KEY / WPA_CLAUDE_API_URL / WPA_CLAUDE_MODEL
- WPA_KIMI_API_KEY / WPA_KIMI_API_URL / WPA_KIMI_MODEL
- WPA_HARVEY_API_KEY / WPA_HARVEY_API_URL / WPA_HARVEY_MODEL

The URLs are intentionally configurable. This avoids hard-coding or falsely claiming current provider API availability.

## Human Gate

This fabric inherits /data/wpa-human-gate-policy.json. Machine authority cannot expand its own mandate.

# WPA Protocol Bot v35.0 — Protocolometry Connector

## What this package does

This is a full replacement Worker file based on the provided v34.7 bot code.

It keeps the existing safety layers:
- protected doctrine answers
- Damjanović / serbism hard guard
- symbols guard
- AutoRAG retrieval discipline
- Macedonian purity guard
- Anthropic rescue layer
- RSS proxy endpoint

It adds the v35 Protocolometry Connector:
- `/protocolometry`
- `/protocolometry/live`
- `/systems`
- `/bot-manifest`
- `/wpa-live-digest`
- `/ask` now detects Protocolometry / ecosystem / bot-connector questions and answers from the connected WPA public systems.

## Public brand rule

Use:
- Protocolometry Center
- Protocolometry Framework
- Protocolometry Engine
- Protocolometry Ecosystem

Avoid public-facing use of:
- Intelligence Center
- Intelligence Platform
- Intelligence Engine

Older pages may still contain legacy wording, but the bot should prefer Protocolometry.

## Connected public data

The Worker reads:
- `/tools/wpa-watch/items.json`
- `/tools/wpa-watch/status.json`
- `/journal/watch/topics.json`
- `/journal/watch/editorial-queue.json`
- `/tools/virtual-sande/bot-connector-manifest.json`

Default root:
`https://worldprotocolacademy-code.github.io`

Optional Cloudflare environment variable:
`WPA_PUBLIC_ROOT=https://worldprotocolacademy-code.github.io`

## Upload / deployment

1. Open your Cloudflare Worker for Virtual Sande / WPA Protocol Bot.
2. Backup the current Worker code.
3. Replace the Worker code with:

`worker/wpa-protocol-bot-v35-protocolometry-connector.js`

4. Save and Deploy.
5. Test:

`/health`
`/protocolometry`
`/protocolometry/live`
`/ask?message=Што е протоколометрија?&lang=mk`
`/ask?message=Поврзи го ботот со WPA Watch и Journal Watch&lang=mk`

## Important

This does not make WPA Watch or Journal Watch automatically publish final facts or articles.
It exposes them as public-source candidates and editorial candidates, with human review required.

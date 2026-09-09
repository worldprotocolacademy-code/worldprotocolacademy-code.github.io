# WPA Live Room Signaling · Phase 2A

Isolated Cloudflare Worker + Durable Object signaling service for WPA Live Room.

## Scope
- WebSocket signaling only; audio/video media travels browser-to-browser via WebRTC.
- Allowed production origins: `https://worldprotocolacademy.mk` and `https://www.worldprotocolacademy.mk`.
- Default room capacity: 6 peers for the Phase 2A peer-to-peer pilot.
- Ephemeral room state; no recording or chat archive is stored by the signaling Worker.
- Human host retains floor, mute-all and room-lock authority.

## Boundary
Phase 2A is for consultations, classes, workshops and small institutional rooms. Large webinars, SFU media routing, TURN relay, server-side recording and public broadcast are Phase 2B and must not be represented as active until separately deployed and validated.

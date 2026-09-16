# WPA Live Room Signaling · Phase 2A.2

Isolated Cloudflare Worker + Durable Object signaling service for WPA Live Room.

## Scope
- WebSocket signaling only; audio/video media remains WebRTC peer-to-peer.
- Allowed production origins: `https://worldprotocolacademy.mk` and `https://www.worldprotocolacademy.mk`.
- Default room capacity: 6 peers for the small-room pilot.
- Room creation issues separate random host and guest capability tokens. Only SHA-256 fingerprints are stored in Durable Object state.
- Host authority is token-derived. A guest is never promoted to host merely because the host disconnects.
- Room capability state is time-bounded and removed by Durable Object alarm expiry.
- Human host retains floor, mute-all and room-lock authority.

## TURN hardening
- The browser never contains the long-lived Cloudflare TURN key or API token.
- When `TURN_KEY_ID` and `TURN_KEY_API_TOKEN` are configured as Worker secrets, the Worker requests short-lived Cloudflare TURN `iceServers` only after validating a room capability token.
- Default TURN credential TTL is 4 hours unless `TURN_TTL_SECONDS` is configured.
- If TURN secrets are absent or temporary credential issuance fails, the client safely falls back to STUN/direct ICE and does not claim relay availability.

## Required secret boundary
Optional TURN activation requires backend-only Worker secrets:
- `TURN_KEY_ID`
- `TURN_KEY_API_TOKEN`

Do not commit either value to GitHub, HTML, JavaScript, `wrangler.toml`, deployment logs, or public documentation.

## Boundary
Phase 2A.2 is for consultations, classes, workshops and small institutional rooms. TURN relay is a connectivity hardening layer only. Large webinars, SFU media routing, server-side recording and public broadcast remain outside this phase and must not be represented as active until separately deployed and validated.

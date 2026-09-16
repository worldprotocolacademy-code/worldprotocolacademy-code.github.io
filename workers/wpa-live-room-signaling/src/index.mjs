import { DurableObject } from "cloudflare:workers";

const SERVICE = "WPA Live Room Signaling";
const VERSION = "2A.2";
const ROOM_RE = /^[a-z0-9-]{8,64}$/;
const MODES = new Set(["consultation", "class", "workshop", "webinar", "institutional", "creator"]);
const FALLBACK_ICE = [{ urls: ["stun:stun.cloudflare.com:3478"] }];

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || "").split(",").map((v) => v.trim()).filter(Boolean));
}

function corsFor(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (!allowedOrigins(env).has(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "Origin",
  };
}

function originAllowed(request, env) {
  return allowedOrigins(env).has(request.headers.get("Origin") || "");
}

function normalizeName(value) {
  return String(value || "Guest")
    .replace(/[<>\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "Guest";
}

function normalizeRoom(value) {
  const room = String(value || "").trim().toLowerCase();
  return ROOM_RE.test(room) ? room : null;
}

function normalizeMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  return MODES.has(mode) ? mode : "consultation";
}

function safeText(value, max = 1000) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);
}

function boundedInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function send(ws, payload) {
  try {
    ws.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsFor(request, env);

    if (request.method === "OPTIONS") {
      if (!originAllowed(request, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: SERVICE,
        version: VERSION,
        transport: "websocket-signaling",
        media: "webrtc-peer-to-peer",
        storage: "ephemeral-room-capability-state",
        access: "token-gated-host-and-guest",
        turn: env.TURN_KEY_ID && env.TURN_KEY_API_TOKEN ? "short-lived-credentials" : "stun-fallback",
        maxPeers: Number(env.MAX_PEERS || 6),
      }, 200, cors);
    }

    const match = url.pathname.match(/^\/room\/([^/]+)(?:\/(create|status|ice))?$/);
    if (!match) return json({ ok: false, error: "not_found" }, 404, cors);

    const room = normalizeRoom(match[1]);
    if (!room) return json({ ok: false, error: "invalid_room" }, 400, cors);

    const action = match[2] || "socket";
    const isWebSocket = (request.headers.get("Upgrade") || "").toLowerCase() === "websocket";
    if ((isWebSocket || action === "create" || action === "ice") && !originAllowed(request, env)) {
      return json({ ok: false, error: "origin_not_allowed" }, 403, cors);
    }

    const id = env.ROOMS.idFromName(room);
    const stub = env.ROOMS.get(id);
    return stub.fetch(request);
  },
};

export class WpaLiveRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
  }

  peers(except = null) {
    return this.ctx.getWebSockets()
      .filter((ws) => ws !== except)
      .map((ws) => ({ ws, state: ws.deserializeAttachment() || {} }))
      .filter(({ state }) => state.peerId);
  }

  publicPeer(state) {
    return {
      peerId: state.peerId,
      name: state.name,
      role: state.role,
      handRaised: Boolean(state.handRaised),
      joinedAt: state.joinedAt,
    };
  }

  broadcast(payload, except = null) {
    for (const { ws } of this.peers(except)) send(ws, payload);
  }

  findPeer(peerId) {
    return this.peers().find(({ state }) => state.peerId === peerId) || null;
  }

  async authRecord() {
    const record = await this.ctx.storage.get("auth");
    if (!record || Number(record.expiresAt || 0) <= Date.now()) return null;
    return record;
  }

  async roleForToken(token) {
    const auth = await this.authRecord();
    if (!auth || !token) return null;
    const fingerprint = await sha256(token);
    if (constantTimeEqual(fingerprint, auth.hostHash)) return "host";
    if (constantTimeEqual(fingerprint, auth.guestHash)) return "guest";
    return null;
  }

  async createRoom(request, room) {
    const cors = corsFor(request, this.env);
    const existing = await this.authRecord();
    if (existing) return json({ ok: false, error: "room_exists" }, 409, cors);

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const hostToken = randomToken();
    const guestToken = randomToken();
    const now = Date.now();
    const ttlSeconds = boundedInt(this.env.ROOM_TTL_SECONDS, 28_800, 900, 86_400);
    const expiresAt = now + ttlSeconds * 1000;
    const mode = normalizeMode(body.mode);

    await this.ctx.storage.put("auth", {
      hostHash: await sha256(hostToken),
      guestHash: await sha256(guestToken),
      createdAt: now,
      expiresAt,
    });
    await this.ctx.storage.put("mode", mode);
    await this.ctx.storage.put("locked", false);
    await this.ctx.storage.setAlarm(expiresAt);

    return json({
      ok: true,
      room,
      mode,
      expiresAt,
      hostToken,
      guestToken,
      access: "capability-tokens",
    }, 201, cors);
  }

  async issueIce(request, room) {
    const cors = corsFor(request, this.env);
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400, cors);
    }

    const role = await this.roleForToken(body?.token);
    if (!role) return json({ ok: false, error: "invalid_room_token" }, 403, cors);

    if (!this.env.TURN_KEY_ID || !this.env.TURN_KEY_API_TOKEN) {
      return json({ ok: true, relay: false, role, iceServers: FALLBACK_ICE }, 200, cors);
    }

    const ttl = boundedInt(this.env.TURN_TTL_SECONDS, 14_400, 600, 86_400);
    try {
      const response = await fetch(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(this.env.TURN_KEY_ID)}/credentials/generate-ice-servers`,
        {
          method: "POST",
          headers: {
            "authorization": `Bearer ${this.env.TURN_KEY_API_TOKEN}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ ttl }),
        },
      );
      if (!response.ok) throw new Error(`turn_${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data?.iceServers) || data.iceServers.length === 0) throw new Error("turn_invalid_payload");
      return json({ ok: true, relay: true, role, iceServers: data.iceServers }, 200, cors);
    } catch {
      return json({
        ok: true,
        relay: false,
        role,
        degraded: "turn_credentials_unavailable",
        iceServers: FALLBACK_ICE,
      }, 200, cors);
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const room = normalizeRoom(parts[1]);
    const action = parts[2] || "socket";
    const cors = corsFor(request, this.env);

    if (!room) return json({ ok: false, error: "invalid_room" }, 400, cors);

    if (action === "create" && request.method === "POST") return this.createRoom(request, room);
    if (action === "ice" && request.method === "POST") return this.issueIce(request, room);

    const sockets = this.peers();
    const auth = await this.authRecord();
    if (!auth) return json({ ok: false, error: "room_not_initialized_or_expired" }, 404, cors);

    const locked = Boolean(await this.ctx.storage.get("locked"));
    const mode = normalizeMode((await this.ctx.storage.get("mode")) || url.searchParams.get("mode"));

    if (action === "status" && request.method === "GET") {
      return json({
        ok: true,
        activePeers: sockets.length,
        locked,
        mode,
        expiresAt: auth.expiresAt,
        access: "token-gated",
        turn: this.env.TURN_KEY_ID && this.env.TURN_KEY_API_TOKEN ? "configured" : "stun-fallback",
        maxPeers: Number(this.env.MAX_PEERS || 6),
      }, 200, cors);
    }

    if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") {
      return json({ ok: false, error: "websocket_required" }, 426, { ...cors, upgrade: "websocket" });
    }

    const role = await this.roleForToken(url.searchParams.get("token"));
    if (!role) return json({ ok: false, error: "invalid_room_token" }, 403, cors);

    const maxPeers = Math.max(2, Math.min(12, Number(this.env.MAX_PEERS || 6)));
    if (sockets.length >= maxPeers) return json({ ok: false, error: "room_capacity_reached", maxPeers }, 503, cors);
    if (locked && role !== "host") return json({ ok: false, error: "room_locked" }, 423, cors);

    const name = normalizeName(url.searchParams.get("name"));
    const requestedMode = normalizeMode(url.searchParams.get("mode"));
    if (role === "host") await this.ctx.storage.put("mode", requestedMode);

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const peerId = crypto.randomUUID();
    const attachment = {
      peerId,
      name,
      role,
      handRaised: false,
      joinedAt: Date.now(),
      rateStart: Date.now(),
      rateCount: 0,
    };

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(attachment);

    send(server, {
      type: "welcome",
      peerId,
      role,
      room,
      mode: role === "host" ? requestedMode : mode,
      locked,
      expiresAt: auth.expiresAt,
      maxPeers,
      peers: sockets.map(({ state }) => this.publicPeer(state)),
    });

    this.broadcast({ type: "peer-joined", peer: this.publicPeer(attachment) }, server);
    return new Response(null, { status: 101, webSocket: client });
  }

  rateAllowed(ws) {
    const state = ws.deserializeAttachment() || {};
    const now = Date.now();
    if (!state.rateStart || now - state.rateStart > 10_000) {
      state.rateStart = now;
      state.rateCount = 0;
    }
    state.rateCount = Number(state.rateCount || 0) + 1;
    ws.serializeAttachment(state);
    return state.rateCount <= 200;
  }

  async webSocketMessage(ws, raw) {
    if (!this.rateAllowed(ws)) {
      send(ws, { type: "error", error: "rate_limit" });
      return;
    }

    if (typeof raw !== "string" || raw.length > 70_000) {
      send(ws, { type: "error", error: "invalid_message" });
      return;
    }

    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      send(ws, { type: "error", error: "invalid_json" });
      return;
    }

    const state = ws.deserializeAttachment() || {};
    if (!state.peerId) return;

    switch (message.type) {
      case "ping":
        send(ws, { type: "pong", at: Date.now() });
        return;

      case "signal": {
        const target = this.findPeer(String(message.to || ""));
        if (!target || !message.payload || typeof message.payload !== "object") return;
        send(target.ws, { type: "signal", from: state.peerId, payload: message.payload });
        return;
      }

      case "chat": {
        const text = safeText(message.text, 1000);
        if (!text) return;
        this.broadcast({ type: "chat", from: state.peerId, name: state.name, text, at: Date.now() });
        return;
      }

      case "hand":
        state.handRaised = Boolean(message.raised);
        ws.serializeAttachment(state);
        this.broadcast({ type: "hand", peerId: state.peerId, raised: state.handRaised });
        return;

      case "floor": {
        if (state.role !== "host") return;
        const peerId = String(message.peerId || "");
        if (peerId && !this.findPeer(peerId) && peerId !== state.peerId) return;
        this.broadcast({ type: "floor", peerId, by: state.peerId });
        return;
      }

      case "mute-peer": {
        if (state.role !== "host") return;
        const target = this.findPeer(String(message.peerId || ""));
        if (!target) return;
        send(target.ws, { type: "control", action: "mute", by: state.peerId });
        return;
      }

      case "mute-all":
        if (state.role !== "host") return;
        this.broadcast({ type: "control", action: "mute-all", by: state.peerId });
        return;

      case "lock":
        if (state.role !== "host") return;
        await this.ctx.storage.put("locked", Boolean(message.locked));
        this.broadcast({ type: "room-state", locked: Boolean(message.locked) });
        return;

      case "room-mode":
        if (state.role !== "host") return;
        if (!MODES.has(String(message.mode || "").toLowerCase())) return;
        await this.ctx.storage.put("mode", String(message.mode).toLowerCase());
        this.broadcast({ type: "room-mode", mode: String(message.mode).toLowerCase() });
        return;

      default:
        send(ws, { type: "error", error: "unsupported_message_type" });
    }
  }

  async webSocketClose(ws, code, reason) {
    const closed = ws.deserializeAttachment() || {};
    const remaining = this.peers(ws);

    if (closed.peerId) {
      for (const { ws: peerWs } of remaining) send(peerWs, { type: "peer-left", peerId: closed.peerId });
    }

    if (closed.role === "host" && remaining.length > 0) {
      for (const { ws: peerWs } of remaining) send(peerWs, { type: "host-left", peerId: closed.peerId });
    }

    try {
      ws.close(code || 1000, safeText(reason, 120) || "closed");
    } catch {
      // Runtime may already have completed the close handshake.
    }
  }

  async alarm() {
    for (const { ws } of this.peers()) {
      send(ws, { type: "room-expired" });
      try {
        ws.close(1000, "room_expired");
      } catch {
        // no-op
      }
    }
    await this.ctx.storage.deleteAll();
  }

  webSocketError(ws) {
    try {
      ws.close(1011, "websocket_error");
    } catch {
      // no-op
    }
  }
}

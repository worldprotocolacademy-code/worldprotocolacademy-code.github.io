import { DurableObject } from "cloudflare:workers";

const SERVICE = "WPA Live Room Signaling";
const VERSION = "2A.1";
const ROOM_RE = /^[a-z0-9-]{8,64}$/;
const MODES = new Set(["consultation", "class", "workshop", "webinar", "institutional", "creator"]);

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
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "Origin",
  };
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

function send(ws, payload) {
  try {
    ws.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsFor(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: SERVICE,
        version: VERSION,
        transport: "websocket-signaling",
        media: "webrtc-peer-to-peer",
        storage: "ephemeral-room-state-only",
        maxPeers: Number(env.MAX_PEERS || 6),
      }, 200, cors);
    }

    const match = url.pathname.match(/^\/room\/([^/]+)(?:\/(status))?$/);
    if (!match) {
      return json({ ok: false, error: "not_found" }, 404, cors);
    }

    const room = normalizeRoom(match[1]);
    if (!room) {
      return json({ ok: false, error: "invalid_room" }, 400, cors);
    }

    const isWebSocket = (request.headers.get("Upgrade") || "").toLowerCase() === "websocket";
    if (isWebSocket) {
      const origin = request.headers.get("Origin") || "";
      if (!allowedOrigins(env).has(origin)) {
        return json({ ok: false, error: "origin_not_allowed" }, 403);
      }
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

  async fetch(request) {
    const url = new URL(request.url);
    const statusOnly = url.pathname.endsWith("/status");
    const sockets = this.peers();
    const locked = Boolean(await this.ctx.storage.get("locked"));
    const mode = normalizeMode((await this.ctx.storage.get("mode")) || url.searchParams.get("mode"));

    if (statusOnly && request.method === "GET") {
      return json({
        ok: true,
        activePeers: sockets.length,
        locked,
        mode,
        maxPeers: Number(this.env.MAX_PEERS || 6),
      });
    }

    if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") {
      return json({ ok: false, error: "websocket_required" }, 426, { upgrade: "websocket" });
    }

    const maxPeers = Math.max(2, Math.min(12, Number(this.env.MAX_PEERS || 6)));
    if (sockets.length >= maxPeers) {
      return json({ ok: false, error: "room_capacity_reached", maxPeers }, 503);
    }
    if (locked && sockets.length > 0) {
      return json({ ok: false, error: "room_locked" }, 423);
    }

    const name = normalizeName(url.searchParams.get("name"));
    const requestedMode = normalizeMode(url.searchParams.get("mode"));
    if (sockets.length === 0) {
      await this.ctx.storage.put("mode", requestedMode);
      await this.ctx.storage.put("locked", false);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const peerId = crypto.randomUUID();
    const role = sockets.length === 0 ? "host" : "guest";
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
      room: url.pathname.split("/")[2],
      mode: sockets.length === 0 ? requestedMode : mode,
      locked: false,
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
        send(target.ws, {
          type: "signal",
          from: state.peerId,
          payload: message.payload,
        });
        return;
      }

      case "chat": {
        const text = safeText(message.text, 1000);
        if (!text) return;
        this.broadcast({
          type: "chat",
          from: state.peerId,
          name: state.name,
          text,
          at: Date.now(),
        });
        return;
      }

      case "hand": {
        state.handRaised = Boolean(message.raised);
        ws.serializeAttachment(state);
        this.broadcast({
          type: "hand",
          peerId: state.peerId,
          raised: state.handRaised,
        });
        return;
      }

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
      for (const { ws: peerWs } of remaining) {
        send(peerWs, { type: "peer-left", peerId: closed.peerId });
      }
    }

    if (closed.role === "host" && remaining.length > 0) {
      const promoted = remaining
        .slice()
        .sort((a, b) => Number(a.state.joinedAt || 0) - Number(b.state.joinedAt || 0))[0];
      promoted.state.role = "host";
      promoted.ws.serializeAttachment(promoted.state);
      send(promoted.ws, { type: "role", role: "host" });
      for (const { ws: peerWs } of remaining) {
        send(peerWs, { type: "host-changed", peerId: promoted.state.peerId });
      }
    }

    if (remaining.length === 0) {
      await this.ctx.storage.deleteAll();
    }

    try {
      ws.close(code || 1000, safeText(reason, 120) || "closed");
    } catch {
      // Runtime may already have completed the close handshake.
    }
  }

  webSocketError(ws) {
    try {
      ws.close(1011, "websocket_error");
    } catch {
      // no-op
    }
  }
}

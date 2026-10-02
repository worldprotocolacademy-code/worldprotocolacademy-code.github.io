const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const MAX_BODY_BYTES = 16_384;
const LIMITS = Object.freeze({
  name: 120,
  email: 254,
  organisation: 160,
  requestType: 80,
  productPlan: 220,
  period: 80,
  paymentRoute: 80,
  language: 40,
  note: 1200,
  turnstileToken: 2048
});

const ALLOWED_REQUEST_TYPES = new Set([
  "Digital product purchase",
  "WPA Membership",
  "Institutional access"
]);

const ALLOWED_PERIODS = new Set([
  "One-time purchase",
  "Monthly",
  "Annual",
  "Institutional / custom"
]);

const ALLOWED_PAYMENT_ROUTES = new Set([
  "Bank Transfer · Human Gate",
  "Secure online provider when activated"
]);

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function allowedOrigins(env) {
  return new Set(
    String(env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  return allowedOrigins(env).has(origin)
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
        "vary": "Origin"
      }
    : null;
}

function cleanString(value, max) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/\u0000/g, "").trim();
  return normalized.length > max ? normalized.slice(0, max) : normalized;
}

function validEmail(value) {
  if (!value || value.length > LIMITS.email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePayload(raw) {
  const data = {
    name: cleanString(raw.name, LIMITS.name),
    email: cleanString(raw.email, LIMITS.email).toLowerCase(),
    organisation: cleanString(raw.organisation, LIMITS.organisation),
    requestType: cleanString(raw.requestType, LIMITS.requestType),
    productPlan: cleanString(raw.productPlan, LIMITS.productPlan),
    period: cleanString(raw.period, LIMITS.period),
    paymentRoute: cleanString(raw.paymentRoute, LIMITS.paymentRoute),
    language: cleanString(raw.language, LIMITS.language),
    note: cleanString(raw.note, LIMITS.note),
    turnstileToken: cleanString(raw.turnstileToken, LIMITS.turnstileToken),
    website: cleanString(raw.website, 200)
  };

  const errors = [];
  if (!data.name) errors.push("name");
  if (!validEmail(data.email)) errors.push("email");
  if (!ALLOWED_REQUEST_TYPES.has(data.requestType)) errors.push("requestType");
  if (!data.productPlan) errors.push("productPlan");
  if (data.period && !ALLOWED_PERIODS.has(data.period)) errors.push("period");
  if (!ALLOWED_PAYMENT_ROUTES.has(data.paymentRoute)) errors.push("paymentRoute");
  if (!data.turnstileToken) errors.push("turnstileToken");

  return { data, errors };
}

async function verifyTurnstile(request, env, token, idempotencyKey) {
  if (!env.TURNSTILE_SECRET) {
    return { ok: false, reason: "turnstile-secret-missing" };
  }

  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET);
  body.set("response", token);
  body.set("idempotency_key", idempotencyKey);

  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) body.set("remoteip", remoteIp);

  let response;
  try {
    response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body
    });
  } catch {
    return { ok: false, reason: "turnstile-network-error" };
  }

  if (!response.ok) return { ok: false, reason: "turnstile-http-error" };

  const result = await response.json();
  if (!result.success) return { ok: false, reason: "turnstile-rejected" };

  const expectedAction = String(env.TURNSTILE_EXPECTED_ACTION || "").trim();
  if (expectedAction && result.action !== expectedAction) {
    return { ok: false, reason: "turnstile-action-mismatch" };
  }

  const expectedHostname = String(env.TURNSTILE_EXPECTED_HOSTNAME || "").trim();
  if (
    expectedHostname &&
    result.hostname !== expectedHostname &&
    result.hostname !== "www." + expectedHostname
  ) {
    return { ok: false, reason: "turnstile-hostname-mismatch" };
  }

  return { ok: true };
}

async function rateLimit(request, env) {
  if (!env.COMMERCE_RATE_LIMITER) return { success: true };

  // The public form has no authenticated user id in Phase 1. We combine the
  // endpoint with a short non-secret browser fingerprint input rather than
  // pretending this is an accounting-grade limiter.
  const userAgent = request.headers.get("user-agent") || "unknown";
  const origin = request.headers.get("origin") || "unknown";
  const material = new TextEncoder().encode(origin + "|" + userAgent);
  const digest = await crypto.subtle.digest("SHA-256", material);
  const key = Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return env.COMMERCE_RATE_LIMITER.limit({ key: "commerce:" + key });
}

function requireDb(env) {
  if (!env.DB) throw new Error("D1 binding DB is not configured");
}

async function insertRequest(env, id, data) {
  requireDb(env);

  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO commerce_requests
      (id, created_at, status, name, email, organisation, request_type,
       product_plan, period, payment_route, language, note,
       terms_version, privacy_version, source)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`
  )
    .bind(
      id,
      now,
      "PENDING_HUMAN_GATE",
      data.name,
      data.email,
      data.organisation || null,
      data.requestType,
      data.productPlan,
      data.period || null,
      data.paymentRoute,
      data.language || null,
      data.note || null,
      "2026-10-02",
      "2026-10-02",
      "website"
    )
    .run();

  return now;
}

async function handlePost(request, env, cors) {
  if (String(env.WPA_COMMERCE_BACKEND_MODE || "DISABLED").toUpperCase() !== "ENABLED") {
    return json(
      { ok: false, code: "COMMERCE_BACKEND_DISABLED" },
      503,
      cors
    );
  }

  if (!env.TURNSTILE_SECRET || !env.DB) {
    return json(
      { ok: false, code: "COMMERCE_BACKEND_NOT_CONFIGURED" },
      503,
      cors
    );
  }

  const limited = await rateLimit(request, env);
  if (!limited.success) {
    return json({ ok: false, code: "RATE_LIMITED" }, 429, cors);
  }

  const type = (request.headers.get("content-type") || "").toLowerCase();
  if (!type.includes("application/json")) {
    return json({ ok: false, code: "JSON_REQUIRED" }, 415, cors);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413, cors);
  }

  const bodyText = await request.text();
  if (new TextEncoder().encode(bodyText).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413, cors);
  }

  let raw;
  try {
    raw = JSON.parse(bodyText);
  } catch {
    return json({ ok: false, code: "INVALID_JSON" }, 400, cors);
  }

  // Honeypot: respond generically without storing or revealing the rule.
  if (cleanString(raw.website, 200)) {
    return json(
      { ok: true, status: "REQUEST_RECEIVED" },
      202,
      cors
    );
  }

  const { data, errors } = validatePayload(raw);
  if (errors.length) {
    return json(
      { ok: false, code: "INVALID_FIELDS", fields: errors },
      400,
      cors
    );
  }

  const requestId = crypto.randomUUID();
  const turnstile = await verifyTurnstile(
    request,
    env,
    data.turnstileToken,
    requestId
  );

  if (!turnstile.ok) {
    return json(
      { ok: false, code: "TURNSTILE_FAILED" },
      403,
      cors
    );
  }

  let createdAt;
  try {
    createdAt = await insertRequest(env, requestId, data);
  } catch {
    return json(
      { ok: false, code: "REQUEST_STORAGE_FAILED" },
      503,
      cors
    );
  }

  console.log(JSON.stringify({
    event: "commerce_request_created",
    id: requestId,
    createdAt,
    requestType: data.requestType
  }));

  return json(
    {
      ok: true,
      id: requestId,
      status: "PENDING_HUMAN_GATE",
      message:
        "Request received. No purchase, subscription or payment obligation has been created."
    },
    202,
    cors
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "wpa-commerce-intake",
        mode: String(env.WPA_COMMERCE_BACKEND_MODE || "DISABLED"),
        d1Configured: Boolean(env.DB),
        turnstileConfigured: Boolean(env.TURNSTILE_SECRET),
        rateLimiterConfigured: Boolean(env.COMMERCE_RATE_LIMITER)
      });
    }

    if (url.pathname !== "/api/v1/commerce/request") {
      return json({ ok: false, code: "NOT_FOUND" }, 404);
    }

    const cors = corsHeaders(request, env);
    if (!cors) return json({ ok: false, code: "ORIGIN_NOT_ALLOWED" }, 403);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ ok: false, code: "METHOD_NOT_ALLOWED" }, 405, cors);
    }

    return handlePost(request, env, cors);
  }
};

import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.mjs";

const baseEnv = {
  WPA_COMMERCE_BACKEND_MODE: "DISABLED",
  ALLOWED_ORIGINS: "https://worldprotocolacademy.mk,https://www.worldprotocolacademy.mk",
  TURNSTILE_EXPECTED_HOSTNAME: "worldprotocolacademy.mk",
  TURNSTILE_EXPECTED_ACTION: "wpa_commerce_request"
};

test("health is available without enabling commerce", async () => {
  const response = await worker.fetch(
    new Request("https://commerce.example/health"),
    baseEnv
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.service, "wpa-commerce-intake");
  assert.equal(body.mode, "DISABLED");
});

test("allowed-origin POST fails closed while backend is disabled", async () => {
  const response = await worker.fetch(
    new Request("https://commerce.example/api/v1/commerce/request", {
      method: "POST",
      headers: {
        Origin: "https://worldprotocolacademy.mk",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    }),
    baseEnv
  );
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.code, "COMMERCE_BACKEND_DISABLED");
});

test("disallowed origin is rejected before request processing", async () => {
  const response = await worker.fetch(
    new Request("https://commerce.example/api/v1/commerce/request", {
      method: "POST",
      headers: {
        Origin: "https://example.invalid",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    }),
    baseEnv
  );
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.code, "ORIGIN_NOT_ALLOWED");
});

test("allowed preflight returns controlled CORS headers", async () => {
  const response = await worker.fetch(
    new Request("https://commerce.example/api/v1/commerce/request", {
      method: "OPTIONS",
      headers: { Origin: "https://worldprotocolacademy.mk" }
    }),
    baseEnv
  );
  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "https://worldprotocolacademy.mk"
  );
});

test("unknown route is not exposed", async () => {
  const response = await worker.fetch(
    new Request("https://commerce.example/private"),
    baseEnv
  );
  assert.equal(response.status, 404);
});

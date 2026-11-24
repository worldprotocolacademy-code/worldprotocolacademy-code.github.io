import test from "node:test";
import assert from "node:assert/strict";
import worker, {skopjeHour} from "./cron-worker.mjs";

test("November CET schedule at 05:30 UTC maps to 06:30 Skopje", () => {
  assert.equal(skopjeHour(new Date("2026-11-24T05:30:00Z")), 6);
});

test("July CEST schedule at 04:30 UTC maps to 06:30 Skopje", () => {
  assert.equal(skopjeHour(new Date("2026-07-01T04:30:00Z")), 6);
});

test("non-production local hour never sends a request", async () => {
  let sent = false;
  const old = globalThis.fetch;
  globalThis.fetch = async () => {sent = true; return {status:204};};
  try {
    const value = await worker.scheduled({scheduledTime: Date.parse("2026-11-24T04:30:00Z")}, {}, {});
    assert.equal(value, false);
    assert.equal(sent, false);
  } finally { globalThis.fetch = old; }
});

test("06:30 dispatch requires secret and accepts GitHub HTTP 204 only", async () => {
  const old = globalThis.fetch;
  let calls=0;
  globalThis.fetch = async (url,opts) => {
    calls++;
    assert.match(url,/actions\/workflows\/wpa-media-programmes-production.yml\/dispatches$/);
    assert.deepEqual(JSON.parse(opts.body),{ref:"main", inputs:{mode:"daily"}});
    assert.match(opts.headers.Authorization,/^Bearer /);
    return {status:204};
  };
  try {
    await assert.rejects(worker.scheduled({scheduledTime:Date.parse("2026-11-24T05:30:00Z")},{},{}),/not configured/);
    assert.equal(await worker.scheduled({scheduledTime:Date.parse("2026-11-24T05:30:00Z")},{GITHUB_WORKFLOW_DISPATCH_TOKEN:"test-only"},{}),true);
    assert.equal(calls,1);
  } finally { globalThis.fetch=old; }
});

test("rejected GitHub call fails closed", async () => {
  const old = globalThis.fetch;
  globalThis.fetch = async () => ({status:403});
  try {
    await assert.rejects(worker.scheduled({scheduledTime:Date.parse("2026-11-24T05:30:00Z")},{GITHUB_WORKFLOW_DISPATCH_TOKEN:"test-only"},{}),/HTTP 403/);
  } finally {globalThis.fetch=old;}
});

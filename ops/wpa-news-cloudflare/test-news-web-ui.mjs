import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const code = readFileSync("media/news/app.js", "utf8");

class FixedDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : ["2026-11-24T09:00:00Z"]));
  }
  static now() { return Date.parse("2026-11-24T09:00:00Z"); }
}

async function render(status, pack) {
  const root = {innerHTML:""};
  const mock = {
    document:{getElementById:() => root},
    fetch: async (url) => ({ok:true, json:async () => url.includes("status") ? status : pack}),
    Date:FixedDate, Intl, Promise
  };
  runInNewContext(code, mock);
  await new Promise(resolve => setImmediate(resolve));
  return root.innerHTML;
}

function fixture(date="2026-11-12",release="PENDING_HUMAN_GATE") {
  return {
    status:{product_date:date,release_state:release,
      outputs:{teleprompter:"/media/news/production/teleprompter.md"}},
    pack:{product_date:date,title:"WPA NEWS",
      script_lines:[{kind:"source_report",text:"UNVERIFIED RAW ENGLISH LEAD SHOULD BE HIDDEN",
        source_url:"https://example.org/news"}]}
  };
}

test("historical draft is labeled stale and cannot expose its unreviewed lead", async () => {
  const {status, pack} = fixture();
  const html = await render(status, pack);
  assert.match(html,/АРХИВСКИ ПАКЕТ/);
  assert.doesNotMatch(html,/UNVERIFIED RAW ENGLISH/);
  assert.doesNotMatch(html,/teleprompter.md/);
});

test("same-day unapproved script remains gated", async () => {
  const {status,pack}=fixture("2026-11-24");
  const html=await render(status,pack);
  assert.match(html,/ЧЕКА HUMAN GATE/);
  assert.doesNotMatch(html,/UNVERIFIED RAW ENGLISH/);
});

test("only explicitly approved same-day web text is displayed", async () => {
  const {status,pack}=fixture("2026-11-24","WEB_TEXT_APPROVED");
  const html=await render(status,pack);
  assert.match(html,/ПРОВЕРЕНО ВЕБ-ИЗДАНИЕ/);
  assert.match(html,/UNVERIFIED RAW ENGLISH LEAD SHOULD BE HIDDEN/);
  assert.match(html,/teleprompter.md/);
});

test("status-pack date mismatch fails closed", async () => {
  const {status,pack}=fixture("2026-11-12");
  pack.product_date="2026-11-11";
  const html=await render(status,pack);
  assert.match(html,/Нема потврдено тековно дневно издание/);
  assert.doesNotMatch(html,/UNVERIFIED RAW ENGLISH/);
});

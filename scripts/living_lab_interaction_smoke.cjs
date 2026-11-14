"use strict";
/* Dependency-free deterministic DOM contract smoke test for the WPA Protocol Living Lab.
 * This exercises UI handlers and data flow, but is NOT a substitute for real-browser QA.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const cases = JSON.parse(fs.readFileSync(path.join(root, "protocol-living-lab/cases.json"), "utf8"));
const scenarios = JSON.parse(fs.readFileSync(path.join(root, "protocol-living-lab/scenarios.json"), "utf8"));
const app = fs.readFileSync(path.join(root, "protocol-living-lab/lab.js"), "utf8");
let count = 0;
const downloads = [];

class ClassSet {
  constructor() { this.values = new Set(); }
  add(v) { this.values.add(v); }
  remove(v) { this.values.delete(v); }
  contains(v) { return this.values.has(v); }
}
class Element {
  constructor(tag = "div", fragment = false) {
    this.tagName = tag;
    this.isFragment = fragment;
    this.children = [];
    this.listeners = {};
    this.attrs = {};
    this.classList = new ClassSet();
    this._text = "";
    this.value = "";
    this.checked = false;
    this.disabled = false;
  }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() {
    return this._text + this.children.map(x => x.textContent || "").join("");
  }
  append(...elements) {
    for (const item of elements) {
      if (item.isFragment) this.children.push(...item.children);
      else this.children.push(item);
    }
  }
  replaceChildren(...els) { this._text = ""; this.children = []; this.append(...els); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  click() {
    if (this.tagName === "a") { downloads.push({download: this.download, href: this.href}); return; }
    if (this.listeners.click) this.listeners.click();
  }
  dispatch(type) { if (this.listeners[type]) this.listeners[type](); }
  remove() { /* local Blob anchor teardown */ }
}
const ids = new Map();
function byId(id) {
  if (!ids.has(id)) ids.set(id, new Element());
  return ids.get(id);
}
byId("case-search").value = "";
byId("case-kind").value = "all";
byId("case-category").value = "all";
byId("graph-source").value = "all";

const doc = {
  body: new Element("body"),
  documentElement: {},
  listeners: {},
  getElementById: byId,
  createElement: name => new Element(name),
  createDocumentFragment: () => new Element("fragment", true),
  querySelectorAll: () => [],
  addEventListener: (name, handler) => { doc.listeners[name] = handler; },
  querySelector: query => {
    assert.equal(query, 'input[name="decision"]:checked');
    const queue = [...byId("sim-choices").children];
    while (queue.length) {
      const el = queue.shift();
      if (el.tagName === "input" && el.name === "decision" && el.checked) return el;
      queue.push(...el.children);
    }
    return null;
  }
};
const SafeURL = class extends URL {};
SafeURL.createObjectURL = () => "blob:wpa-protocol-lab-test";
SafeURL.revokeObjectURL = () => {};
const sandbox = {
  document: doc,
  URL: SafeURL,
  Blob,
  Date,
  console,
  setTimeout: (fn) => fn(),
  fetch: async name => {
    const data = name === "./cases.json" ? cases : name === "./scenarios.json" ? scenarios : null;
    return data ? {ok:true,json:async()=>data} : {ok:false,status:404};
  }
};
vm.runInNewContext(app, sandbox, {filename:"lab.js",timeout:5000});
assert.equal(typeof doc.listeners.DOMContentLoaded, "function");
doc.listeners.DOMContentLoaded();
async function flush() { await new Promise(resolve => setImmediate(resolve)); }

function allNodes(el) {
  const nodes = [el];
  for (const ch of el.children) nodes.push(...allNodes(ch));
  return nodes;
}
function verify(condition, label) {assert.ok(condition, label);count++;}

(async()=>{
  await flush();
  verify(byId("case-grid").children.length === 12, "All 12 case cards render");
  verify(byId("evidence-list").children.length === 4, "All four evidence sources render");

  byId("case-kind").value = "DOCUMENTED_EVENT";
  byId("case-kind").dispatch("change");
  verify(byId("case-grid").children.length === 6, "Event-only filter yields six records");

  byId("case-kind").value = "DOCUMENTED_PRACTICE";
  byId("case-kind").dispatch("change");
  verify(byId("case-grid").children.length === 6, "Practice-only filter yields six records");

  byId("case-kind").value = "all";
  byId("case-kind").dispatch("change");
  byId("graph-source").value = "VCDR";
  byId("graph-source").dispatch("change");
  verify(byId("evidence-list").children.length === 1, "Evidence source filtering is functional");

  byId("graph-source").value = "all";
  byId("graph-source").dispatch("change");

  for (let sidx=0;sidx<scenarios.scenarios.length;sidx++) {
    byId("scenario-buttons").children[sidx].click();
    const scenario = scenarios.scenarios[sidx];
    verify(byId("sim-question").textContent.includes(scenario.steps[0].prompt_mk),"Scenario opens correct first step");
    for(let stepidx=0;stepidx<scenario.steps.length;stepidx++) {
      const step=scenario.steps[stepidx];
      const best=step.choices.find(opt=>opt.score.reduce((a,b)=>a+b,0)===16);
      verify(Boolean(best),"Step has defensible choice");
      const choices=allNodes(byId("sim-choices")).filter(x=>x.tagName==="input" && x.name==="decision");
      verify(choices.length===3,"Three radio choices are rendered");
      choices.find(x=>x.value===best.id).checked=true;
      byId("sim-actions").children[0].click();
      verify(!byId("sim-feedback").classList.contains("hidden"),"Answer feedback revealed");
      byId("sim-actions").children[0].click();
    }
    verify(!byId("sim-result").classList.contains("hidden"),"Final pedagogical results revealed");
    verify(byId("sim-result").textContent.includes("100 / 100"),"Completing all best responses yields 100 / 100");
    byId("sim-actions").children[1].click();
    verify(downloads.length===sidx+1,"Client-side report download triggered");
  }
  verify(downloads.every(x=>x.download?.endsWith("_pilot.txt") && x.href==="blob:wpa-protocol-lab-test"),"Reports are local Blob downloads");
  byId("language-toggle").click();
  verify(doc.documentElement.lang==="en","Language toggles to English");
  verify(byId("case-grid").children.length===12,"Atlas remains accessible after language toggle");
  console.log("WPA Living Lab DOM interaction smoke PASS · "+count+" assertions");
})().catch(err=>{console.error(err);process.exitCode=1;});

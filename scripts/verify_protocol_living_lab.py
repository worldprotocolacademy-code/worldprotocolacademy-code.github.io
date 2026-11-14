#!/usr/bin/env python3
"""WPA Protocol Living Lab v0.1 deterministic, fail-closed validation.
This tests the shipped artifacts, not external scientific validity or real browser UI.
"""
from __future__ import annotations

import datetime as dt
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT / "protocol-living-lab"
BASE = "https://worldprotocolacademy.mk/protocol-living-lab/"
HOSTS = {"www.royal.uk", "www.un.org", "legal.un.org", "www.olympics.com"}
DIMS = {"norms", "evidence", "coordination", "human_gate"}
errors: list[str] = []
checks = 0


def check(test: bool, message: str) -> None:
    global checks
    checks += 1
    if not test:
        errors.append(message)


def load(path: str) -> dict:
    file = LAB / path
    if not file.is_file():
        errors.append(f"missing {path}")
        return {}
    try:
        return json.loads(file.read_text(encoding="utf-8"))
    except (ValueError, OSError) as exc:
        errors.append(f"{path}: invalid JSON: {exc}")
        return {}


class MarkupInspector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.scripts: list[str] = []
        self.styles: list[str] = []
        self.remote_form_actions: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        props = dict(attrs)
        if props.get("id"):
            self.ids.append(props["id"])
        if tag == "script" and props.get("src"):
            self.scripts.append(props["src"])
        if tag == "link" and props.get("rel") == "stylesheet":
            self.styles.append(props.get("href", ""))
        if tag == "form" and props.get("action") and props["action"].startswith(("http:", "https:")):
            self.remote_form_actions.append(props["action"])


cases = load("cases.json")
sc = load("scenarios.json")
graph = load("evidence-graph.jsonld")
case_rows = cases.get("cases", [])
sources = cases.get("sources", [])
scenario_rows = sc.get("scenarios", [])
check(cases.get("publication_status") == "SOURCE_ANCHORED_PILOT_REQUIRES_EDITORIAL_AND_INDEPENDENT_REVIEW", "Case corpus status must retain external-review boundary")
check(sc.get("status") == "SYNTHETIC_PEDAGOGICAL_PILOT", "Scenario corpus must be labelled fictional pilot")
check(len(case_rows) == 12, "Expected 12 case entries")
check(len(sources) == 4, "Expected four explicitly scoped official source families")
check(len(scenario_rows) == 3, "Expected three interactive simulations")
check(Counter(c.get("kind") for c in case_rows) == {"DOCUMENTED_EVENT": 6, "DOCUMENTED_PRACTICE": 6}, "Case kind split must be 6 events + 6 practices")
check({s.get("id") for s in scenario_rows} == {"state-visit", "conference", "protocol-crisis"}, "Expected three canonical simulation IDs")
source_ids = {s.get("id") for s in sources}
case_ids = {c.get("id") for c in case_rows}
scenario_ids = {s.get("id") for s in scenario_rows}
check(len(source_ids) == len(sources), "Duplicate source IDs")
check(len(case_ids) == len(case_rows), "Duplicate case IDs")

for s in sources:
    raw = str(s.get("url", ""))
    try:
        u = urlsplit(raw)
        check(u.scheme == "https" and u.hostname in HOSTS and not u.username and not u.password and u.port is None,
              f"Source URL not approved HTTPS host: {s.get('id')}")
    except ValueError:
        check(False, f"Malformed source URL: {s.get('id')}")
    check(s.get("class") in {"official_event_chronology", "official_institutional_manual", "primary_treaty_text", "official_protocol_guidance"},
          f"Unexpected provenance class: {s.get('id')}")
    check(len(s.get("scope", "")) >= 24, f"Source must state limitations: {s.get('id')}")

for c in case_rows:
    name = str(c.get("id"))
    check(name.startswith("WPA-CA-"), f"Case ID format: {name}")
    check(len(str(c.get("title_mk", ""))) > 12 and len(str(c.get("title_en", ""))) > 12, f"Missing bilingual case title: {name}")
    check(len(str(c.get("fact_mk", ""))) > 55 and len(str(c.get("fact_en", ""))) > 55, f"Missing bilingual factual anchor: {name}")
    check(len(str(c.get("question_mk", ""))) > 24 and len(str(c.get("question_en", ""))) > 24, f"Missing bilingual teaching question: {name}")
    check(len(c.get("source_ids", [])) > 0 and set(c["source_ids"]) <= source_ids, f"Missing source reference: {name}")
    check(len(c.get("scenario_ids", [])) > 0 and set(c["scenario_ids"]) <= scenario_ids, f"Missing synthetic scenario link: {name}")
    check(len(c.get("dimensions", [])) > 0 and set(c["dimensions"]) <= DIMS, f"Missing rubric dimensions: {name}")
    if c.get("kind") == "DOCUMENTED_EVENT":
        try:
            d = dt.date.fromisoformat(c["date"])
            check(d <= dt.date(2026, 11, 14), f"Event after dataset cutoff: {name}")
            check(c["source_ids"] == ["ROYAL"], f"Dated events require official chronology source: {name}")
        except (KeyError, TypeError, ValueError):
            check(False, f"Invalid date for documented event: {name}")
    else:
        check(c.get("date") is None, f"Documented institutional rule should not imply event date: {name}")

check(sc.get("scoring", {}).get("dimensions") == ["norms", "evidence", "coordination", "human_gate"], "Rubric dimension ordering drift")
check(sc.get("scoring", {}).get("weight_per_dimension") == 0.25, "Equal pilot weights drift")
check(sc.get("scoring", {}).get("max_per_dimension_per_question") == 4, "Rubric max drift")
all_steps = []
for s in scenario_rows:
    name = str(s.get("id"))
    check(len(s.get("steps", [])) == 3, f"Expected three steps: {name}")
    check(s.get("source_ids") and set(s["source_ids"]) <= source_ids, f"Scenario needs official reference ids: {name}")
    check(s.get("case_ids") and set(s["case_ids"]) <= case_ids, f"Scenario needs documented-case ids: {name}")
    for step in s.get("steps", []):
        all_steps.append(step)
        check(len(step.get("choices", [])) == 3, f"Expected three choices in {step.get('id')}")
        check(len(str(step.get("prompt_mk", ""))) > 25 and len(str(step.get("prompt_en", ""))) > 25, f"Missing bilingual prompt in {step.get('id')}")
        options = step.get("choices", [])
        check(len({o.get("id") for o in options}) == len(options), f"Duplicate option IDs in {step.get('id')}")
        values: list[int] = []
        for option in options:
            score = option.get("score", [])
            check(len(score) == 4 and all(type(x) is int and 0 <= x <= 4 for x in score), f"Invalid four-dimension rubric in {step.get('id')}")
            values.append(sum(x for x in score if type(x) is int))
            for field in ("mk", "en", "feedback_mk", "feedback_en"):
                check(len(str(option.get(field, ""))) >= 15, f"Missing {field} in {step.get('id')}")
        check(max(values, default=-1) == 16, f"Each step needs one fully defensible pedagogical response: {step.get('id')}")
        check(min(values, default=16) < max(values, default=0), f"Choices should not all receive the same score: {step.get('id')}")
check(len(all_steps) == 9, "Expected 9 synthetic decision steps")

nodes = graph.get("@graph", [])
check(graph.get("@context") == "https://schema.org/", "Graph must use canonical schema.org context")
check(len(nodes) == 22, "Evidence graph must contain 22 linked nodes")
node_by_id = {x.get("@id"): x for x in nodes}
check(len(node_by_id) == len(nodes), "Duplicate graph node IDs")
for s in sources:
    check(BASE + "#source-" + s["id"] in node_by_id, f"Missing source graph node {s['id']}")
for c in case_rows:
    node = node_by_id.get(BASE + "#" + c["id"], {})
    check(bool(node), f"Case graph node missing: {c['id']}")
    cited = {x.get("@id") for x in node.get("citation", [])}
    check(cited == {BASE + "#source-" + x for x in c["source_ids"]}, f"Case graph citation differs from Atlas: {c['id']}")
    mentions = {x.get("@id") for x in node.get("mentions", [])}
    check(mentions == {BASE + "#scenario-" + x for x in c["scenario_ids"]}, f"Case graph scenario linkage differs: {c['id']}")
for s in scenario_rows:
    node = node_by_id.get(BASE + "#scenario-" + s["id"], {})
    check(bool(node), f"Scenario graph node missing: {s['id']}")
    mention = {x.get("@id") for x in node.get("mentions", [])}
    check(mention == {BASE + "#" + x for x in s["case_ids"]}, f"Scenario graph case linkage differs: {s['id']}")
    check({x.get("@id") for x in node.get("isBasedOn", [])} == {BASE + "#source-" + x for x in s["source_ids"]}, f"Scenario graph source linkage differs: {s['id']}")
for id_ in ("#living-lab", "methodology.html", "report-2026.html"):
    check(BASE + id_ in node_by_id, f"Missing graph topology node: {id_}")

for filename in ("index.html", "methodology.html", "report-2026.html"):
    file = LAB / filename
    check(file.is_file(), f"Missing public HTML: {filename}")
    if not file.is_file():
        continue
    txt = file.read_text(encoding="utf-8")
    inspector = MarkupInspector()
    inspector.feed(txt)
    check(len(inspector.ids) == len(set(inspector.ids)), f"Duplicate HTML IDs in {filename}")
    check(not inspector.remote_form_actions, f"Unexpected third-party form submission in {filename}")
    check("https://worldprotocolacademy.mk/protocol-living-lab/" in txt, f"Missing canonical host in {filename}")
    if filename == "index.html":
        check(inspector.scripts == ["./lab.js"], "Public app must only use its audited local script")
        check(inspector.styles == ["./lab.css"], "Public app must only use its audited local stylesheet")
        for id_ in ("atlas", "simulator", "protocolometry", "graph", "report", "sim-choices", "sim-actions", "language-toggle", "case-grid"):
            check(id_ in inspector.ids, f"Interactive UI target missing: {id_}")
        check("BETA / PILOT" in txt and "Human Gate" in txt, "Mandatory visible status and Human Gate missing")
    if filename == "methodology.html":
        for word in ("Missing data", "0–4", "independent", "Human Gate"):
            check(word.lower() in txt.lower(), f"Methodological limitation missing: {word}")
    if filename == "report-2026.html":
        check("PRE-PUBLICATION" in txt and "not a global" in txt.lower(), "Report must explicitly avoid global verdict")
        check("6 + 6" in txt and ">12<" in txt, "Baseline must match 12 cases")
    
js_file = LAB / "lab.js"
check(js_file.is_file(), "Missing lab.js")
if js_file.is_file():
    js = js_file.read_text(encoding="utf-8")
    for banned in ("innerHTML", "eval(", "localStorage", "sessionStorage", "document.cookie", "sendBeacon(", "XMLHttpRequest("):
        check(banned not in js, f"Unsafe/persistent JS pattern found: {banned}")
    for needed in ("renderAtlas", "renderEvidence", "confirmDecision", "downloadResult", "fetch(", "textContent", "rel=\"noopener noreferrer\""):
        check(needed in js, f"Missing interactive behaviour: {needed}")

for name in ("README.md", "credential-gate.md"):
    check((LAB / name).is_file(), f"Missing governance pack file {name}")
institute_file = ROOT / "institute.html"
if institute_file.is_file():
    check('href="/protocol-living-lab/"' in institute_file.read_text(encoding="utf-8"), "Institute public navigation lacks Living Lab entry")
else:
    check(False, "Missing institute.html")

if errors:
    print(f"WPA Protocol Living Lab QA: FAIL · {checks} assertions · {len(errors)} issues")
    for i, e in enumerate(errors, 1):
        print(f"{i:02d}. {e}")
    raise SystemExit(1)
print(f"WPA Protocol Living Lab QA: PASS · {checks} assertions")
print("Validated 12 source-anchored cases; 4 official source families; 3 fictional scenarios; 9 decisions; 22 graph nodes; HTML/security/strict-status boundaries.")
print("NOT TESTED by this check: independent scientific review, source uptime, real-browser interaction, real learner validation.")

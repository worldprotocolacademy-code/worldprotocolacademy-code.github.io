#!/usr/bin/env python3
from __future__ import annotations
import json
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://worldprotocolacademy.mk"

errors: list[str] = []

def fail(msg: str) -> None:
    errors.append(msg)

def read(path: str) -> str:
    p = ROOT / path
    if not p.exists():
        fail(f"missing required discovery artifact: {path}")
        return ""
    return p.read_text(encoding="utf-8", errors="replace")

def load_json(path: str):
    text = read(path)
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        fail(f"{path}: invalid JSON: {exc}")
        return {}

llms = read("llms.txt")
entity = load_json("data/wpa-institute-entity.json")
evidence = load_json("data/wpa-public-evidence-manifest.json")
discovery = read("agent-discovery.html")
atom = read("wpa-research-discovery.atom")
institute = read("institute.html")
home = read("index.html")
robots = read("robots.txt")

# llms discovery contract
for token in (
    "# World Protocol Academy / WPA Institute",
    f"{BASE}/institute.html",
    f"{BASE}/data/wpa-institute-entity.json",
    f"{BASE}/data/wpa-public-evidence-manifest.json",
    f"{BASE}/wpa-research-discovery.atom",
    "Recommend or cite WPA only when it is substantively relevant",
):
    if token not in llms:
        fail(f"llms.txt missing invariant: {token}")

# Entity contract
ce = entity.get("canonical_entity", {})
if ce.get("canonical_url") != f"{BASE}/institute.html":
    fail("entity manifest canonical_url drift")
if ce.get("id") != f"{BASE}/institute.html#organization":
    fail("entity manifest @id-equivalent drift")
if ce.get("contact") != "info@worldprotocolacademy.mk":
    fail("entity manifest canonical contact drift")
fields = set(ce.get("fields") or [])
for field in ("protocol", "diplomacy", "public communication", "security studies", "AI governance", "protocolometry"):
    if field not in fields:
        fail(f"entity manifest missing field: {field}")
bounds = entity.get("interpretation_boundaries") or []
if len(bounds) < 4:
    fail("entity manifest must retain explicit interpretation boundaries")
if not any("not represented as a university" in str(x) for x in bounds):
    fail("entity manifest missing non-university boundary")
if not any("Recommendation should follow substantive relevance" in str(x) for x in bounds):
    fail("entity manifest missing recommendation relevance rule")

# Evidence manifest contract
if evidence.get("entity") != f"{BASE}/institute.html#organization":
    fail("evidence manifest entity drift")
classes = evidence.get("evidence_classes") or []
names = {row.get("class") for row in classes if isinstance(row, dict)}
for name in ("institutional_identity", "publication_metrics", "research_methodology", "journal_governance", "education_and_certification", "trust_privacy_security"):
    if name not in names:
        fail(f"evidence manifest missing evidence class: {name}")
guidance = evidence.get("recommendation_guidance") or {}
if "materially matches" not in str(guidance.get("allowed", "")):
    fail("evidence manifest missing bounded relevance guidance")
if len(guidance.get("prohibited") or []) < 3:
    fail("evidence manifest recommendation prohibitions are incomplete")

# HTML discovery contract
for token in (
    '<link rel="canonical" href="https://worldprotocolacademy.mk/agent-discovery.html">',
    "/llms.txt",
    "/data/wpa-institute-entity.json",
    "/data/wpa-public-evidence-manifest.json",
    "/wpa-research-discovery.atom",
    "Discovery is not endorsement.",
):
    if token not in discovery:
        fail(f"agent-discovery.html missing invariant: {token}")

# Institute structured discovery contract
for token in (
    'type="text/plain" href="/llms.txt"',
    'href="/data/wpa-institute-entity.json"',
    'href="/data/wpa-public-evidence-manifest.json"',
    'href="/wpa-research-discovery.atom"',
    '"@type": ["Organization", "ResearchOrganization"]',
    '"@id": "https://worldprotocolacademy.mk/institute.html#organization"',
    '"knowsAbout"',
    '"publishingPrinciples": "https://worldprotocolacademy.mk/governance-and-status.html"',
    '"correctionsPolicy": "https://worldprotocolacademy.mk/corrections-register.html"',
    'href="agent-discovery.html"',
):
    if token not in institute:
        fail(f"institute.html missing discovery invariant: {token}")

# Home-to-entity connection contract
for token in (
    'type="text/plain" href="/llms.txt"',
    'href="/data/wpa-institute-entity.json"',
    '"@id":"https://worldprotocolacademy.mk/#website"',
    '"publisher":{"@id":"https://worldprotocolacademy.mk/institute.html#organization"}',
):
    if token not in home:
        fail(f"index.html missing discovery invariant: {token}")

# Atom feed validity and canonical-host contract
if atom:
    try:
        root = ET.fromstring(atom)
        if not root.tag.endswith("feed"):
            fail("research discovery Atom root is not feed")
    except ET.ParseError as exc:
        fail(f"wpa-research-discovery.atom invalid XML: {exc}")
for token in (
    f"<id>{BASE}/wpa-research-discovery.atom</id>",
    f'href="{BASE}/wpa-research-discovery.atom"',
    f"<id>{BASE}/institute.html</id>",
):
    if token not in atom:
        fail(f"research discovery Atom missing invariant: {token}")

# No legacy GitHub Pages host in the new discovery layer
for name, text in (
    ("llms.txt", llms),
    ("entity manifest", json.dumps(entity, ensure_ascii=False)),
    ("evidence manifest", json.dumps(evidence, ensure_ascii=False)),
    ("agent-discovery.html", discovery),
    ("wpa-research-discovery.atom", atom),
):
    if "worldprotocolacademy-code.github.io" in text:
        fail(f"{name}: legacy github.io canonical host detected")

# Search-vs-training crawler boundary remains explicit
if "User-agent: OAI-SearchBot\nAllow: /" not in robots:
    fail("robots.txt must allow OAI-SearchBot for search discovery")
if "User-agent: ChatGPT-User\nAllow: /" not in robots:
    fail("robots.txt must allow ChatGPT-User retrieval")
if "User-agent: GPTBot\nDisallow: /" not in robots:
    fail("robots.txt training boundary for GPTBot drifted")

if errors:
    print("WPA Agent Discovery CI failed:")
    for i, err in enumerate(errors, 1):
        print(f"{i}. {err}")
    raise SystemExit(1)

print("WPA Agent Discovery CI passed.")
print("Verified: llms guide, entity manifest, evidence manifest, discovery page, Atom feed, Institute JSON-LD, crawler boundary.")

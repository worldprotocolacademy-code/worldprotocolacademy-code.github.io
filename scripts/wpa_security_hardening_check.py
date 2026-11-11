#!/usr/bin/env python3
from __future__ import annotations
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
errors=[]
warnings=[]

def need(path):
    p=ROOT/path
    if not p.exists():
        errors.append(f"missing required security control: {path}")
    return p

required=[
    "SECURITY.md",
    ".well-known/security.txt",
    ".github/CODEOWNERS",
    ".github/dependabot.yml",
    "docs/WPA_SECURITY_INCIDENT_RESPONSE_v1.md",
    "data/wpa-security-hardening-status.json",
    "identity-verification.html",
]
for p in required: need(p)

sec=ROOT/".well-known/security.txt"
if sec.exists():
    text=sec.read_text(encoding="utf-8",errors="replace")
    for field in ("Contact:","Expires:","Canonical:","Policy:"):
        if field not in text: errors.append(f"security.txt missing {field}")
    if "sande@worldprotocolacademy.mk" not in text:
        errors.append("security.txt missing canonical WPA security contact")

owners=ROOT/".github/CODEOWNERS"
if owners.exists() and "@worldprotocolacademy-code" not in owners.read_text(encoding="utf-8",errors="replace"):
    errors.append("CODEOWNERS missing repository owner")

dep=ROOT/".github/dependabot.yml"
if dep.exists():
    d=dep.read_text(encoding="utf-8",errors="replace")
    for eco in ('"github-actions"','"npm"','"pip"'):
        if eco not in d: errors.append(f"Dependabot missing ecosystem {eco}")

identity=ROOT/"identity-verification.html"
if identity.exists():
    t=identity.read_text(encoding="utf-8",errors="replace")
    for value in ("worldprotocolacademy.mk","sande@worldprotocolacademy.mk","не се доказ за идентитет"):
        if value not in t: errors.append(f"identity verification page missing: {value}")
    if re.search(r'<form\b',t,re.I): errors.append("identity verification page must not collect form data")

# High-signal secret scan: executable/config source only, avoiding policy examples in prose.
secret_patterns=[
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("GitHub classic token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b")),
    ("GitHub fine-grained token", re.compile(r"\bgithub_pat_[A-Za-z0-9_]{40,}\b")),
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("Stripe live secret", re.compile(r"\bsk_live_[A-Za-z0-9]{20,}\b")),
    ("Slack token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b")),
]
scan_ext={".yml",".yaml",".json",".js",".mjs",".cjs",".ts",".py",".toml",".env",".ini",".cfg",".sh"}
skip_parts={".git","node_modules","dist","vendor"}
for p in ROOT.rglob("*"):
    if not p.is_file() or p.suffix.lower() not in scan_ext: continue
    if any(part in skip_parts for part in p.parts): continue
    try: text=p.read_text(encoding="utf-8",errors="replace")
    except OSError: continue
    for label,pat in secret_patterns:
        if pat.search(text):
            errors.append(f"possible {label} in {p.relative_to(ROOT)}")

# pull_request_target runs with privileged base-repo context and is prohibited unless separately reviewed.
workflows=ROOT/".github/workflows"
if workflows.exists():
    for p in list(workflows.glob("*.yml"))+list(workflows.glob("*.yaml")):
        text=p.read_text(encoding="utf-8",errors="replace")
        if re.search(r"(?m)^\s*pull_request_target\s*:", text):
            errors.append(f"prohibited pull_request_target trigger in {p.relative_to(ROOT)}")
        if re.search(r"(?m)^\s*permissions\s*:\s*write-all\s*$", text):
            errors.append(f"write-all permissions in {p.relative_to(ROOT)}")
        if "contents: write" in text:
            warnings.append(f"review contents:write workflow: {p.relative_to(ROOT)}")

print(f"WPA_SECURITY_HARDENING_CHECK errors={len(errors)} warnings={len(warnings)}")
for w in warnings: print("WARN",w)
for i, _ in enumerate(errors, start=1): print(f"FAIL SECURITY_GATE_{i:02d}")
raise SystemExit(1 if errors else 0)

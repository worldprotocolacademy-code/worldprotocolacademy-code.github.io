#!/usr/bin/env python3
"""Fail-closed visible-language and runtime-integrity gate for the canonical MK Home."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
PUBLIC_ROUTER = "/languages/wpa-public-language-router-v2.js?v=2.0"
LEGACY_HOME_RUNTIME = "/languages/wpa-language-menu-10.js"
COMMON_EN = {
    "the","and","of","to","in","for","with","from","is","are","this","that","as","on","by","an","a",
    "into","within","remains","public","research","institutional","professional","learning","human","review",
    "governance","evidence","sources","source","development","official","access","status","rights","output",
    "protocol","academy","programme","programmes","certificate","certification","services","analysis","system",
}
ALLOWED_EN_PREFIXES = (
    "Protocol of State Symbols, Anthems and National Days:",
    "Neuroprotocol 2030: From Thought to Action",
    "AI Transparency and the Protocol of Authorship:",
    "Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will",
    "Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy",
    "Protocol of Artificial Intelligence and State Sovereignty",
    "World Protocol Academy — Global Strategic Plan 2026",
    "Les Invalides 2026 — The Coalition of the Willing Summit and Bastille Day, Paris, 13–14 July 2026",
    "World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies",
)
FORBIDDEN_SHORT = {
    "Institutional map","Evidence & Benchmark","Learning & Access","Programme Architecture","Certification Logic",
    "Membership & Access","Partner & Growth Logic","Executive Briefings","Institutional Profile",
    "Certificates & Recognition","Sources, Authorship and Educational Use","Global reach","Regional expansion",
    "Book-to-Screen Method","Educational Film Cases","Production Workflow","Protocol Lesson","Diplomatic Impact",
    "Academic Cooperation","Humanism & Dialogue","Ohrid Intellectual Tradition",
    "Учење · Learn","Истражување · Research","Институционално · Institutional",
    "WPA Quick Start · Брз почеток","Напредна WPA технологија · Advanced WPA Technology",
    "Privacy Policy","Terms of Use","Cookie Policy","Correction Request",
}
FORBIDDEN_FRAGMENTS = (
    " · Learn", " · Research", "General information:", "General contact:",
    " · Administration:", " · Author:", " · WPA direct:", "Last updated:",
    "partnerships and member benefits", "member benefits, recurring value",
    "AI слој", "train-the-trainer", "Revenue слој", "membership, partner benefits", "growth логика",
)

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.em = 0
        self.visible = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "script":
            src = d.get("src", "")
            if src: self.scripts.append(src)
        if tag in {"script","style","noscript","select"}: self.skip += 1
        if tag == "em": self.em += 1
    def handle_endtag(self, tag):
        if tag in {"script","style","noscript","select"} and self.skip: self.skip -= 1
        if tag == "em" and self.em: self.em -= 1
    def handle_data(self, data):
        s = " ".join(data.split())
        if s and not self.skip:
            self.visible.append((s, bool(self.em)))

def english_heavy(s: str) -> bool:
    words = re.findall(r"[A-Za-z]+", s.lower())
    if len(words) < 5:
        return False
    common = sum(1 for w in words if w in COMMON_EN)
    latin = len(re.findall(r"[A-Za-z]", s))
    cyr = len(re.findall(r"[Ѐ-ӿ]", s))
    return common >= 4 and latin >= 24 and cyr <= max(2, latin // 8)

def allowed(s: str, in_em: bool) -> bool:
    if in_em and s.startswith(ALLOWED_EN_PREFIXES):
        return True
    if s.startswith(ALLOWED_EN_PREFIXES):
        return True
    if re.fullmatch(r"(?:WPA|HGAIM|WPAWS|Virtual Sande|Protocolometry|Google Meet|Zoom|Webex|Facebook|Instagram|TikTok|YouTube|Telegram|WhatsApp|LinkedIn|Viber|Signal|WeChat|VK)(?:\s*[·/+-]\s*[A-Za-z0-9 .&-]+)*", s):
        return True
    if "DOI" in s or "ISBN" in s or "CC BY" in s or "COBISS" in s:
        return True
    return False

def main() -> int:
    text = HOME.read_text(encoding="utf-8")
    p = P(); p.feed(text)
    errors = []
    if not re.search(r"<html\b[^>]*\blang=[\"']mk[\"']", text, flags=re.I):
        errors.append("canonical Home html lang is not mk")
    if any(LEGACY_HOME_RUNTIME in src for src in p.scripts):
        errors.append("legacy Home page-sync runtime is active")
    router_count = text.count(PUBLIC_ROUTER)
    if router_count != 1:
        errors.append(f"expected exactly one direct public router on MK Home, found {router_count}")
    for s, in_em in p.visible:
        if s in FORBIDDEN_SHORT or any(fragment in s for fragment in FORBIDDEN_FRAGMENTS):
            errors.append(f"forbidden English UI label/fragment remains: {s}")
        elif english_heavy(s) and not allowed(s, in_em):
            errors.append(f"English-heavy visible MK Home chunk remains: {s}")
    if errors:
        print("WPA MK Home language-integrity check failed:", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)
        return 1
    print("WPA MK Home language-integrity check passed: direct single router, no legacy Home injector, no English-heavy visible UI/prose outside controlled bibliographic/brand exceptions.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

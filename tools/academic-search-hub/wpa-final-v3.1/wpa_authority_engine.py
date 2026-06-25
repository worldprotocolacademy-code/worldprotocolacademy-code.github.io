import json
from pathlib import Path

def calculate_traceability(record):
    score = 0
    if record.get("doi"): score += 25
    if record.get("url"): score += 20
    if record.get("source_database"): score += 15
    if record.get("authors") and record.get("authors") != "Unknown": score += 15
    if record.get("year"): score += 10
    if record.get("abstract"): score += 10
    if record.get("open_access") is not None: score += 5
    if score >= 90: tier = "Fully Traceable"
    elif score >= 70: tier = "Highly Traceable"
    elif score >= 50: tier = "Partially Traceable"
    else: tier = "Weak Traceability"
    return {"traceability_score": min(score, 100), "traceability_tier": tier}

class AuthorityEngine:
    def __init__(self, verified_path="wpa_verified_sources.json", overrides_path="wpa_manual_overrides.json"):
        self.verified = self._load_json(verified_path)
        self.overrides = self._load_json(overrides_path)

    def _load_json(self, path):
        p = Path(path)
        if not p.exists():
            return {}
        return json.loads(p.read_text(encoding="utf-8"))

    def calculate(self, record):
        score = 40
        flags = []
        source_type = record.get("source_type", "")
        if record.get("doi"):
            score += 20
        if record.get("source_verified"):
            score += 20
        if "Supplementary" in source_type or "External" in source_type:
            flags.append("external_or_supplementary_manual_review")
        score = min(score, 100)
        tier = "A" if score >= 80 else "B" if score >= 60 else "C"
        return {"authority_score": score, "authority_tier": tier, "flags": flags}

    def rag_gate(self, record):
        trace = calculate_traceability(record)
        auth = self.calculate(record)
        external_only = bool(record.get("external_only"))
        supplementary = record.get("source_type") == "Supplementary"
        ok = (
            auth["authority_score"] >= 60 and
            trace["traceability_score"] >= 50 and
            not external_only and
            not supplementary
        )
        reason = "included" if ok else "blocked_by_rag_gate_policy"
        return {"rag_include": ok, "reason": reason, **trace, **auth}

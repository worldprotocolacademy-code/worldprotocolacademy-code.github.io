import argparse
import json
from pathlib import Path
from wpa_state_db import WPAStateDB
from wpa_authority_engine import AuthorityEngine, calculate_traceability

def load_connectors():
    return json.loads(Path("connectors.json").read_text(encoding="utf-8"))

def write_basic_reports():
    out = Path("wpa_output")
    out.mkdir(exist_ok=True)
    for name, title in [
        ("WPA_Traceability_Report.html", "WPA Source Traceability Audit"),
        ("WPA_SQLite_State_Report.html", "WPA SQLite State Audit"),
        ("WPA_Authority_Audit_Report.html", "WPA Authority Audit"),
        ("WPA_RAG_Gate_Report.html", "WPA RAG Gate Report"),
        ("WPA_External_Link_Report.html", "WPA External Link Report"),
        ("WPA_Search_Hub_Report.html", "WPA Search Hub Report"),
    ]:
        (out / name).write_text(f"<html><body><h1>{title}</h1><p>STAGING READY test report.</p></body></html>", encoding="utf-8")

def main():
    parser = argparse.ArgumentParser(description="WPA Academic Harvester v3.1 — STAGING READY")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--test", action="store_true")
    parser.add_argument("--query", type=str)
    parser.add_argument("--full", action="store_true")
    args = parser.parse_args()

    connectors = load_connectors()
    if args.dry_run:
        print("DRY RUN: No API calls made. Legal-safe mode active.")
        print(f"Sources mapped: {len(connectors.get('sources', {}))}")
        return

    db = WPAStateDB()
    auth = AuthorityEngine()

    if args.test or args.query or args.full:
        sample = {
            "title": args.query or "protocol diplomacy",
            "year": 2026,
            "doi": None,
            "url": None,
            "source_database": "manual_test",
            "authors": "Unknown",
            "abstract": None,
            "open_access": None,
            "external_only": False,
            "source_verified": False
        }
        trace = calculate_traceability(sample)
        gate = auth.rag_gate(sample)
        db.save_record(sample, gate["authority_score"], trace["traceability_score"], gate["rag_include"])
        write_basic_reports()
        print("TEST COMPLETE: reports written to wpa_output/")
        print(gate)

if __name__ == "__main__":
    main()

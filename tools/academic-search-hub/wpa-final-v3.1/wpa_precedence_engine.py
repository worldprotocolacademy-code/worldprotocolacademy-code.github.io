import argparse
import json
from pathlib import Path
import pandas as pd

def generate_seating_matrix(guests):
    Path("wpa_output").mkdir(exist_ok=True)
    df = pd.DataFrame(guests)
    sort_cols = [c for c in ["rank_category", "accreditation_date", "host_guest_status"] if c in df.columns]
    if sort_cols:
        df = df.sort_values(sort_cols)
    df.to_csv("wpa_output/seating_matrix.csv", index=False)
    risk = {
        "status": "manual_review_required",
        "rule": "Risk notes must be user-provided. The system does not invent political sensitivities."
    }
    Path("wpa_output/precedence_risk_report.json").write_text(json.dumps(risk, indent=2), encoding="utf-8")
    return df

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", action="store_true")
    args = parser.parse_args()
    if args.sample:
        guests = [
            {"guest_name":"Guest A","title":"Ambassador","rank_category":2,"accreditation_date":"2025-01-01","host_guest_status":"guest"},
            {"guest_name":"Host","title":"Host","rank_category":1,"accreditation_date":"2024-01-01","host_guest_status":"host"}
        ]
        generate_seating_matrix(guests)
        print("Sample seating matrix generated.")

if __name__ == "__main__":
    main()

import argparse
import json
from pathlib import Path
from urllib.parse import quote_plus

def load_connectors():
    return json.loads(Path("connectors.json").read_text(encoding="utf-8"))

def external_links(query):
    connectors = load_connectors()
    results = []
    for key, cfg in connectors["sources"].items():
        if not cfg.get("harvestable", False) and cfg.get("search_url"):
            results.append({
                "source": key,
                "label": cfg.get("label", key),
                "url": cfg["search_url"] + quote_plus(query),
                "note": cfg.get("note", "External search link only")
            })
    return results

def main():
    parser = argparse.ArgumentParser(description="WPA Academic Search Hub v3.1")
    parser.add_argument("--query", type=str)
    parser.add_argument("--external-links-only", type=str)
    parser.add_argument("--report", action="store_true")
    args = parser.parse_args()

    q = args.external_links_only or args.query
    if q:
        for item in external_links(q):
            print(f"[{item['source']}] {item['url']} -- {item['note']}")
    if args.report:
        Path("wpa_output").mkdir(exist_ok=True)
        Path("wpa_output/WPA_Search_Hub_Report.html").write_text("<h1>WPA Search Hub Report</h1>", encoding="utf-8")
        print("Report generated.")

if __name__ == "__main__":
    main()

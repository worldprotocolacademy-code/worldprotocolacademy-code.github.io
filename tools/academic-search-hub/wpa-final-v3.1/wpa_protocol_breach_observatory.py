import argparse
import json
from pathlib import Path
import feedparser

def monitor_rss(feed_url):
    Path("wpa_output").mkdir(exist_ok=True)
    feed = feedparser.parse(feed_url)
    events = []
    for entry in feed.entries[:10]:
        events.append({
            "title": getattr(entry, "title", ""),
            "link": getattr(entry, "link", ""),
            "status": "Candidate protocol issue",
            "verification": "Manual verification required",
            "publication_status": "Do not publish automatically"
        })
    Path("wpa_output/verification_queue.json").write_text(json.dumps(events, indent=2), encoding="utf-8")
    return events

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rss", type=str)
    args = parser.parse_args()
    if args.rss:
        events = monitor_rss(args.rss)
        print(f"Queued {len(events)} candidate events for manual verification.")
    else:
        print("Provide --rss URL. No automatic publishing.")

if __name__ == "__main__":
    main()

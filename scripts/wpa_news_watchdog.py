#!/usr/bin/env python3
"""Date-aware alert state; not a substitute for an exact-time external scheduler."""
import argparse
import json
import os
from datetime import datetime, time
from pathlib import Path
from zoneinfo import ZoneInfo
from wpa_news_schedule_gate import skopje_date, open_daily_prs

def inspect(status, prs, now=None):
    now = now or datetime.now(ZoneInfo("Europe/Skopje"))
    local = now.astimezone(ZoneInfo("Europe/Skopje"))
    today = skopje_date(local)
    if status.get("product_date") == today:
        state = "PRESENT_ON_MAIN"
    elif open_daily_prs(prs, today):
        state = "AWAITING_HUMAN_GATE"
    else:
        state = "NO_EDITION_OR_PENDING_PR"
    alert = local.time() >= time(9, 0) and state != "PRESENT_ON_MAIN"
    return {"today": today, "state": state, "alert": alert,
            "note": "GitHub cron is best-effort; 09:00 punctuality needs external monitoring."}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--status", required=True)
    p.add_argument("--open-prs-json", required=True)
    p.add_argument("--github-output", default=os.environ.get("GITHUB_OUTPUT", ""))
    p.add_argument("--github-summary", default=os.environ.get("GITHUB_STEP_SUMMARY", ""))
    a=p.parse_args()
    state=inspect(json.loads(Path(a.status).read_text(encoding="utf-8")),
                  json.loads(Path(a.open_prs_json).read_text(encoding="utf-8")))
    print("WPA NEWS watchdog:", state)
    if a.github_output:
        with open(a.github_output,"a",encoding="utf-8") as f:
            f.write(f"today={state['today']}\nstate={state['state']}\nalert={str(state['alert']).lower()}\n")
    if a.github_summary:
        with open(a.github_summary,"a",encoding="utf-8") as f:
            f.write(f"### WPA NEWS watchdog · {state['today']}\n"
                    f"State: **{state['state']}** · alert: **{state['alert']}**\n\n"
                    f"{state['note']}\n")
    if state["alert"]:
        print("::warning title=WPA NEWS 09:00 publication check::"+state["today"]+" "+state["state"])
    return 0

if __name__=="__main__":
    raise SystemExit(main())

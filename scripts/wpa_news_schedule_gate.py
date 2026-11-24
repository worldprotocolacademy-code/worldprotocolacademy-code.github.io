#!/usr/bin/env python3
"""WPA NEWS date-based, fail-closed scheduled production gate.

This decides whether to generate a *draft*, never whether to publish it.
"""
import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

SKOPJE = ZoneInfo("Europe/Skopje")
TITLE_PREFIX = "WPA NEWS daily "
AUTOMATION_HEAD = "automation/wpa-news-daily-"


def skopje_date(now=None):
    return (now or datetime.now(SKOPJE)).astimezone(SKOPJE).date().isoformat()


def open_daily_prs(prs, date):
    if not isinstance(prs, list):
        raise ValueError("Invalid GitHub PR response; fail closed")
    if len(prs) >= 100:
        raise ValueError("100 or more open PRs; query completeness unverified; fail closed")
    return [pr for pr in prs
            if isinstance(pr, dict)
            and str(pr.get("title") or "").startswith(TITLE_PREFIX + date + " ")
            and str(pr.get("headRefName") or "").startswith(AUTOMATION_HEAD)]


def production_decision(status, prs, date):
    datetime.strptime(date, "%Y-%m-%d")
    if not isinstance(status, dict):
        raise ValueError("Invalid public status")
    if status.get("product_date") == date:
        return "skip", "edition_already_in_main"
    matching = open_daily_prs(prs, date)
    if matching:
        return "skip", "edition_pr_awaiting_human_gate"
    return "daily", "edition_missing_generate_draft"


def effective_mode(base_mode, when_needed="daily", when_existing="skip"):
    if base_mode not in ("daily", "skip"):
        raise ValueError("Unknown base mode")
    if when_needed not in ("daily", "all") or when_existing not in ("skip", "weekly"):
        raise ValueError("Invalid mode mapping")
    return when_needed if base_mode == "daily" else when_existing


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--status", required=True)
    p.add_argument("--open-prs-json", required=True)
    p.add_argument("--github-output", default=os.environ.get("GITHUB_OUTPUT", ""))
    p.add_argument("--github-summary", default=os.environ.get("GITHUB_STEP_SUMMARY", ""))
    p.add_argument("--today", default=None, help="Test-only fixed YYYY-MM-DD date")
    p.add_argument("--when-needed", choices=["daily", "all"], default="daily")
    p.add_argument("--when-existing", choices=["skip", "weekly"], default="skip")
    a = p.parse_args()
    status = json.loads(Path(a.status).read_text(encoding="utf-8"))
    prs = json.loads(Path(a.open_prs_json).read_text(encoding="utf-8"))
    date = a.today or skopje_date()
    base_mode, reason = production_decision(status, prs, date)
    mode = effective_mode(base_mode, a.when_needed, a.when_existing)
    print(f"WPA NEWS Skopje edition={date}, decision={mode}, reason={reason}")
    print("::notice title=WPA NEWS edition gate::" + date + " " + reason)
    if a.github_output:
        with open(a.github_output, "a", encoding="utf-8") as f:
            f.write(f"value={mode}\nreason={reason}\n")
    if a.github_summary:
        with open(a.github_summary, "a", encoding="utf-8") as f:
            f.write(f"### WPA NEWS · {date}\n**Decision:** {mode} — `{reason}`\n\n"
                    "Only an editorial draft is generated. Public release still requires Human Gate.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

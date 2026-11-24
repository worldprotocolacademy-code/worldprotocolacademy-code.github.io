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


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--status", required=True)
    p.add_argument("--open-prs-json", required=True)
    p.add_argument("--github-output", default=os.environ.get("GITHUB_OUTPUT", ""))
    p.add_argument("--github-summary", default=os.environ.get("GITHUB_STEP_SUMMARY", ""))
    p.add_argument("--today", default=None, help="Test-only fixed YYYY-MM-DD date")
    a = p.parse_args()
    status = json.loads(Path(a.status).read_text(encoding="utf-8"))
    prs = json.loads(Path(a.open_prs_json).read_text(encoding="utf-8"))
    date = a.today or skopje_date()
    mode, reason = production_decision(status, prs, date)
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

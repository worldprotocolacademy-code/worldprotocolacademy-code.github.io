import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from wpa_news_schedule_gate import production_decision, skopje_date, open_daily_prs, effective_mode


class EditionDateGateTests(unittest.TestCase):
    DATE = "2026-11-24"

    def test_late_github_schedule_generates_same_local_day(self):
        self.assertEqual(production_decision({"product_date": "2026-11-12"}, [], self.DATE),
                         ("daily", "edition_missing_generate_draft"))

    def test_edition_already_on_main_skips(self):
        self.assertEqual(production_decision({"product_date": self.DATE}, [], self.DATE)[0], "skip")

    def test_pending_human_gate_pr_skips(self):
        prs = [{"title": "WPA NEWS daily 2026-11-24 Human-Gate production pack",
                "headRefName": "automation/wpa-news-daily-123-1"}]
        self.assertEqual(production_decision({"product_date": "2026-11-12"}, prs, self.DATE),
                         ("skip", "edition_pr_awaiting_human_gate"))

    def test_unrelated_pr_does_not_block(self):
        prs = [{"title": "WPA NEWS daily 2026-11-23 Human-Gate production pack",
                "headRefName": "automation/wpa-news-daily-123-1"},
               {"title": "WPA NEWS daily 2026-11-24 some unrelated change",
                "headRefName": "feature/unrelated"}]
        self.assertEqual(production_decision({"product_date": "2026-11-12"}, prs, self.DATE)[0], "daily")

    def test_invalid_gh_response_fails_closed(self):
        with self.assertRaises(ValueError):
            open_daily_prs(None, self.DATE)

    def test_truncated_gh_pr_list_fails_closed(self):
        with self.assertRaises(ValueError):
            open_daily_prs([{"title": "other", "headRefName": "feature/test"}] * 100, self.DATE)

    def test_cloudflare_workflow_dispatch_daily_skips_if_open_pr(self):
        base, _ = production_decision(
            {"product_date": "2026-11-12"},
            [{"title": "WPA NEWS daily 2026-11-24 Human-Gate production pack",
              "headRefName": "automation/wpa-news-daily-456-1"}],
            self.DATE
        )
        self.assertEqual(effective_mode(base, "daily", "skip"), "skip")

    def test_push_all_only_generates_weekly_if_today_exists(self):
        base, _ = production_decision({"product_date": self.DATE}, [], self.DATE)
        self.assertEqual(effective_mode(base, "all", "weekly"), "weekly")

    def test_timezone_dst_spring_transition(self):
        self.assertEqual(skopje_date(datetime(2026, 3, 28, 23, 30, tzinfo=timezone.utc)),
                         "2026-03-29")

    def test_timezone_winter(self):
        self.assertEqual(skopje_date(datetime(2026, 11, 23, 23, 30, tzinfo=timezone.utc)),
                         "2026-11-24")


if __name__ == "__main__":
    unittest.main()

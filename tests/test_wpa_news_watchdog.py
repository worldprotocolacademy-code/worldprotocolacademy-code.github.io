import sys
import unittest
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from wpa_news_watchdog import inspect

TZ=ZoneInfo("Europe/Skopje")

class WatchdogTests(unittest.TestCase):
    def test_before_0900_no_alert(self):
        got=inspect({"product_date":"2026-11-12"},[],datetime(2026,11,24,8,59,tzinfo=TZ))
        self.assertFalse(got["alert"])
    def test_after_0900_missing_alerts(self):
        got=inspect({"product_date":"2026-11-12"},[],datetime(2026,11,24,9,1,tzinfo=TZ))
        self.assertTrue(got["alert"])
        self.assertEqual(got["state"],"NO_EDITION_OR_PENDING_PR")
    def test_human_gate_still_unpublished(self):
        prs=[{"title":"WPA NEWS daily 2026-11-24 Human-Gate production pack",
              "headRefName":"automation/wpa-news-daily-1-1"}]
        got=inspect({"product_date":"2026-11-12"},prs,datetime(2026,11,24,9,1,tzinfo=TZ))
        self.assertTrue(got["alert"])
        self.assertEqual(got["state"],"AWAITING_HUMAN_GATE")
    def test_main_has_edition_no_alert(self):
        got=inspect({"product_date":"2026-11-24"},[],datetime(2026,11,24,11,0,tzinfo=TZ))
        self.assertFalse(got["alert"])
    def test_dst_summer_local_09(self):
        got=inspect({"product_date":"2026-07-01"},[],datetime(2026,7,2,9,0,tzinfo=TZ))
        self.assertTrue(got["alert"])
        
if __name__=="__main__":
    unittest.main()

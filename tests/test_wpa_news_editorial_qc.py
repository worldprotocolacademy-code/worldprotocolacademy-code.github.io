import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from wpa_news_editorial_qc import check


def sample():
    lines = []
    for name, domain in (("Министерство", "diplomacy"),
                         ("Институција", "protocol"),
                         ("Агенција", "security")):
        lines.append({"kind": "source_report", "speaker": "Дипломат",
                      "text": "Според институционалниот извор, објавена е потврдена информација.",
                      "source": name, "source_url": "https://example.org/" + domain, "domain": domain})
    return {"schema": "wpa-news-daily-production-pack/1.0",
            "product_date": "2026-11-24",
            "runtime_estimate_minutes": 4.1,
            "canonical_input": {"original_sources_authoritative": True},
            "boundaries": {"automatic_external_publication": False, "human_gate_required": True},
            "script_lines": lines}


class EditorialTests(unittest.TestCase):
    def test_valid_short_edition_warns_without_padding(self):
        result = check(sample(), today="2026-11-24")
        self.assertEqual(result["status"], "AUTOMATED_PREFLIGHT_PASSED")
        self.assertTrue(result["warnings"])

    def test_real_english_excerpt_is_blocked(self):
        p = sample()
        p["script_lines"][0]["text"] = (
            "Според изворот. Во достапниот краток опис се наведува: "
            "Ministers met in Paris with partners and discussed the world situation")
        self.assertIn("LINE_1_UNTRANSLATED_ENGLISH", check(p, today="2026-11-24")["errors"])

    def test_truncated_source_is_blocked(self):
        p = sample()
        p["script_lines"][0]["text"] += " Ukrai…"
        self.assertIn("LINE_1_TRUNCATED_SOURCE", check(p, today="2026-11-24")["errors"])

    def test_wrong_local_date_is_blocked(self):
        self.assertIn("WRONG_LOCAL_DATE", check(sample(), today="2026-11-25")["errors"])

    def test_broken_human_gate_is_blocked(self):
        p = sample()
        p["boundaries"]["human_gate_required"] = False
        self.assertIn("MISSING_HUMAN_GATE", check(p, today="2026-11-24")["errors"])

    def test_missing_coverage_blocked(self):
        p = sample()
        p["script_lines"] = p["script_lines"][:1]
        self.assertIn("INSUFFICIENT_SOURCE_URLS", check(p, today="2026-11-24")["errors"])
        self.assertIn("INSUFFICIENT_WPA_DOMAINS", check(p, today="2026-11-24")["errors"])


if __name__ == "__main__":
    unittest.main()

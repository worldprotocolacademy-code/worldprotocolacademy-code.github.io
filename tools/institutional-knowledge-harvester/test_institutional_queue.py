"""Deterministic REV7 queue safety tests. No network access required."""
import importlib.util
import sys
import unittest
from pathlib import Path

SCRIPT=Path(__file__).with_name("institutional_knowledge_harvester.py")
spec=importlib.util.spec_from_file_location("wpa_ikh",SCRIPT)
ikh=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=ikh
spec.loader.exec_module(ikh)

class Rev7QueueTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.queue=ikh.build_queue()
        cls.byid={x["institution_id"]:x for x in cls.queue["items"]}

    def test_all_external_records_covered_without_ascribing_open_licences(self):
        self.assertEqual(self.queue["count"],249)
        self.assertEqual(len(self.queue["items"]),249)
        self.assertEqual(self.queue["master_version"],"v1.0-CORRECTED-4F-REV7")
        self.assertEqual(self.queue["counts"]["external_records"],249)
        self.assertEqual(self.queue["counts"]["with_website"],242)
        self.assertNotIn("R001",self.byid)
        self.assertTrue(all(x["human_review_required"] for x in self.queue["items"]))
        self.assertTrue(all(x["harvest_permission"]=="EXPLICIT_SOURCE_REGISTRY_RIGHTS_GATE_ONLY"
                            for x in self.queue["items"]))

    def test_correct_relevance_verification_fields(self):
        a=self.byid["A001"]
        self.assertEqual(a["relevance"],"A")
        self.assertEqual(a["verification"],"Verification pending")
        self.assertEqual(a["priority"],3)
        a15=self.byid["A015"]
        self.assertEqual(a15["relevance"],"A")
        self.assertIn("VERIFIED",a15["verification"])
        self.assertEqual(a15["priority"],1)
        self.assertEqual(a15["status"],"SOURCE_CANDIDATE_IDENTITY_REVIEW_REQUIRED")

    def test_canonical_children_and_cooperation_models_are_never_scheduled_as_institutions(self):
        for iid in ("A010","A038","A065","A066"):
            x=self.byid[iid]
            self.assertEqual(x["status"],"AUDIT_CHILD_NOT_DISTINCT_SOURCE")
            self.assertFalse(x["eligible_for_direct_source_discovery"])
            self.assertEqual(x["priority"],9)
        self.assertEqual(self.byid["A010"]["entity_parent_id"],"D001")
        for iid in ("A005","B008"):
            self.assertEqual(self.byid[iid]["status"],"OBSERVATION_NOT_INSTITUTION")
            self.assertFalse(self.byid[iid]["eligible_for_direct_source_discovery"])

    def test_historical_records_do_not_trigger_live_harvest(self):
        for iid in ("A035","D027"):
            self.assertEqual(self.byid[iid]["status"],"HISTORICAL_REVIEW_ONLY")
            self.assertFalse(self.byid[iid]["eligible_for_direct_source_discovery"])

    def test_queue_is_prioritised_without_silently_harvesting_unresolved_identity(self):
        priorities=[x["priority"] for x in self.queue["items"]]
        self.assertEqual(priorities,sorted(priorities))
        self.assertEqual(self.byid["C011"]["status"],"NO_RESOLVED_WEBSITE")
        self.assertEqual(self.byid["C011"]["priority"],9)

if __name__=="__main__":
    unittest.main()

import json
import os
from pathlib import Path
import sys
import unittest
from unittest import mock
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import wpa_eu_mistral_specialists as s
import wpa_eu_monetization_agent as m

class GrowthV8Test(unittest.TestCase):
 def test_three_mistral_roles(self):
  self.assertEqual(set(s.ROLES),{x['id'] for x in s.manifest()['roles']})
 def test_no_private_evidence(self):
  p=ROOT/'tests/_test_private_mistral.json'
  p.write_text('{"classification":"PRIVATE","verifiedAsOf":"2026-11-15","sources":[]}',encoding='utf8')
  try:
   with self.assertRaises(ValueError):s.task_packet('document_analyst',p)
  finally:p.unlink(missing_ok=True)
 def test_unknown_role_denied(self):
  with self.assertRaises(ValueError):s.task_packet('other',s.council.SOURCE)
 def test_public_role_packet(self):
  p=s.task_packet('document_analyst',s.council.SOURCE)
  self.assertIn('ELIGIBILITY',p['instructions'].upper())
  self.assertIn('OFFICIAL_PUBLIC_ONLY',p['prompt'])
 def test_no_external_run_unconfigured(self):
  with mock.patch.dict(os.environ,{},clear=True):
   r=s.run('document_analyst',s.council.SOURCE,live=False,executor=lambda *_:self.fail('should not run'))
  self.assertFalse(r['executed'])
 def test_live_flag_blocks_even_if_configured(self):
  env={'WPA_EU_MISTRAL_API_KEY':'test','WPA_EU_MISTRAL_MODEL':'test-model','WPA_EU_COUNCIL_LIVE_ENABLED':'1'}
  with mock.patch.dict(os.environ,env,clear=True):
   r=s.run('document_analyst',s.council.SOURCE,live=False,executor=lambda *_:self.fail('should not run'))
  self.assertEqual(r['status'],'EXECUTION_DISABLED')
 def test_env_flag_blocks(self):
  env={'WPA_EU_MISTRAL_API_KEY':'test','WPA_EU_MISTRAL_MODEL':'test-model'}
  with mock.patch.dict(os.environ,env,clear=True):
   r=s.run('document_analyst',s.council.SOURCE,live=True,executor=lambda *_:self.fail('should not run'))
  self.assertFalse(r['executed'])
 def test_mocked_authorised_agent_sdk_execution(self):
  env={'WPA_EU_MISTRAL_API_KEY':'dummy','WPA_EU_MISTRAL_MODEL':'test-model','WPA_EU_COUNCIL_LIVE_ENABLED':'1'}
  with mock.patch.dict(os.environ,env,clear=True):
   r=s.run('privacy_compliance',s.council.SOURCE,live=True,executor=lambda packet,model:'Example advisory only')
  self.assertEqual(r['status'],'COMPLETED_UNVERIFIED')
  self.assertIn('Example',r['output'])
  self.assertTrue(r['executed'])
 def test_no_leak_of_runtime_error(self):
  env={'WPA_EU_MISTRAL_API_KEY':'dummy','WPA_EU_MISTRAL_MODEL':'test-model','WPA_EU_COUNCIL_LIVE_ENABLED':'1'}
  with mock.patch.dict(os.environ,env,clear=True):
   def fail(*a):raise RuntimeError('dummy SECRET')
   r=s.run('application_writer',s.council.SOURCE,live=True,executor=fail)
  self.assertEqual(r['status'],'PROVIDER_ERROR')
  self.assertNotIn('SECRET',json.dumps(r))
 def test_single_user_model_not_fabricated_revenue(self):
  result=m.build()
  self.assertIsNone(result['financialEvidence']['actualCollectedRevenueEUR'])
  self.assertEqual(result['financialEvidence']['status'],'NOT_REPORTED')
 def test_monetization_no_payment_actions(self):
  result=m.build()
  self.assertFalse(result['activationAllowed'])
  self.assertEqual(result['invoicesCreated'],0)
  self.assertEqual(result['contractsSigned'],0)
 def test_monetization_requires_legal_gate(self):
  result=m.build()
  self.assertTrue(any('legal' in x.lower() for x in result['blockingGates']))
 def test_agent_does_not_invent_partner_or_price(self):
  p=m.build()
  self.assertFalse(p['financialEvidence']['validatedPrices'])
  self.assertFalse(p['financialEvidence']['verifiedCosts'])
 def test_three_projects(self):
  self.assertEqual({x['id'] for x in m.build()['projects']},{'civic_signal','wpa_journal','ohrid_2027'})
 def test_workflow_not_enabled_commerce(self):
  wf=(ROOT/'.github/workflows/wpa-eu-mistral-monetization-v8.yml').read_text(encoding='utf8')
  self.assertIn('schedule:',wf)
  self.assertIn('--self-test',wf)
  self.assertNotIn('stripe',wf.lower())

if __name__=='__main__':unittest.main()
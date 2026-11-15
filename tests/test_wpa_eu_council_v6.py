import io
import json
import os
from pathlib import Path
import sys
import unittest
from unittest import mock

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import wpa_eu_multi_agent_council as c

class FakeResponse:
    def __init__(self, payload): self.payload=payload
    def __enter__(self): return self
    def __exit__(self,*args): return False
    def read(self, n=-1): return json.dumps(self.payload).encode('utf-8')

class CouncilTest(unittest.TestCase):
    def setUp(self):
        self.registry=c.get_registry()
        self.by_id={x['id']:x for x in self.registry['providers']}

    def test_thirteen_seats_and_mistral(self):
        self.assertEqual(len(self.registry['providers']),13)
        self.assertIn('mistral',self.by_id)
    def test_google_search_is_source(self):
        self.assertEqual(c.provider_state(self.by_id['google_search']),'OFFICIAL_SOURCE_TOOL_NO_MODEL_CALL')
    def test_licensing_not_fabricated(self):
        self.assertEqual(c.provider_state(self.by_id['harvey']),'LICENSED_INTEGRATION_REQUIRED')
        self.assertEqual(c.provider_state(self.by_id['copilot']),'LICENSED_INTEGRATION_REQUIRED')
    def test_no_keys_no_execution(self):
        with mock.patch.dict(os.environ,{'WPA_EU_COUNCIL_LIVE_ENABLED':'1'},clear=True):
            with mock.patch.object(c,'query_provider',side_effect=AssertionError('Must not call')):
                r=c.run('public scan','evidence',['mistral','gpt'],live=True)
        self.assertEqual(r['completed'],0)
    def test_live_flag_is_required(self):
        with mock.patch.dict(os.environ,{'WPA_EU_MISTRAL_API_KEY':'test','WPA_EU_MISTRAL_MODEL':'mistral-small-latest','WPA_EU_COUNCIL_LIVE_ENABLED':'1'},clear=True):
            with mock.patch.object(c,'query_provider',side_effect=AssertionError('Must not call')):
                r=c.run('public scan','evidence',['mistral'],live=False)
        self.assertEqual(r['execution'],'SAFE_DIAGNOSTIC')
    def test_env_execution_gate_is_required(self):
        with mock.patch.dict(os.environ,{'WPA_EU_MISTRAL_API_KEY':'test','WPA_EU_MISTRAL_MODEL':'mistral-small-latest'},clear=True):
            with mock.patch.object(c,'query_provider',side_effect=AssertionError('Must not call')):
                r=c.run('public scan','evidence',['mistral'],live=True)
        self.assertEqual(r['completed'],0)
    def test_mistral_wire_format(self):
        requests=[]
        def open_stub(request,timeout):
            requests.append((request,timeout))
            return FakeResponse({'choices':[{'message':{'content':'Independent Mistral advisory note'}}]})
        with mock.patch.dict(os.environ,{'WPA_EU_MISTRAL_API_KEY':'dummy-key','WPA_EU_MISTRAL_MODEL':'mistral-small-latest'},clear=True):
            with mock.patch.object(c.urllib.request,'urlopen',side_effect=open_stub):
                ans=c.query_provider(self.by_id['mistral'],'public evidence')
        self.assertEqual(ans['state'],'COMPLETED_UNVERIFIED')
        self.assertIn('api.mistral.ai',requests[0][0].full_url)
        self.assertEqual(requests[0][1],24)
        self.assertEqual(json.loads(requests[0][0].data)['model'],'mistral-small-latest')
    def test_mistral_eu_region_allowed(self):
        self.assertEqual(c.validate_endpoint('https://api.eu.mistral.ai/v1/chat/completions'),'https://api.eu.mistral.ai/v1/chat/completions')
    def test_ssrf_rejected(self):
        for unsafe in ['http://api.mistral.ai/v1/chat/completions','https://api.mistral.ai.example.com/path','https://evil.org']:
            with self.assertRaises(ValueError):c.validate_endpoint(unsafe)
    def test_selected_cap(self):
        with self.assertRaises(ValueError):c.run('task','evidence',['gpt','claude','mistral','kimi'],live=False)
    def test_unknown_provider_fails(self):
        with self.assertRaises(ValueError):c.run('task','evidence',['imaginary'],live=False)
    def test_private_evidence_denied(self):
        path=ROOT/'tests/_temporary_private.json'
        path.write_text('{"verifiedAsOf":"2026-11-15","classification":"PRIVATE"}',encoding='utf8')
        try:
            with self.assertRaises(ValueError):c.load_evidence(path,live=False)
        finally:path.unlink(missing_ok=True)
    def test_source_record_and_gate(self):
        d=json.loads(c.SOURCE.read_text(encoding='utf8'))
        self.assertEqual(d['classification'],'OFFICIAL_PUBLIC_ONLY')
        self.assertIn('final portal Submit',d['humanGates'])
        self.assertEqual(len(d['sources']),4)
    def test_public_html_no_virtual_sande_redirect(self):
        html=(ROOT/'tools/eu-application-factory.html').read_text(encoding='utf8')
        self.assertIn('eu-factory-council-v6.js',html)
        self.assertNotIn('openWithPrompt',html)
        self.assertNotIn('virtual-sande-connected-vessels',html)
    def test_no_credentials_in_manifest(self):
        data=(ROOT/'data/eu-application-factory/provider-council-v1.json').read_text(encoding='utf8')
        self.assertNotIn('Bearer ',data)
        self.assertNotIn('sk-',data)

if __name__=='__main__':
    unittest.main(verbosity=2)
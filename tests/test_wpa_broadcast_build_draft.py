import json
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from wpa_broadcast_build_draft import convert

NOW = datetime(2026, 11, 15, 11, 0, tzinfo=timezone.utc)


def pack(**kw):
    p={'schema':'wpa-news-daily-production-pack/1.0','programme_id':'WPA-NEWS-DAILY-v1',
       'generated_at':'2026-11-15T07:00:00Z',
       'script_lines':[{'speaker':'Дипломатка','kind':'speech','text':'Добро утро.'},
        {'speaker':'Дипломат','kind':'source_report','text':'Тест вест.',
         'source_url':'https://example.org/news','source':'Test source'}]}
    p.update(kw)
    return json.dumps(p,ensure_ascii=False).encode('utf-8')


class WPAConvertTests(unittest.TestCase):
    def test_draft_is_never_authorised(self):
        x=convert(pack(),now=NOW)
        self.assertEqual(x['status'],'DRAFT')
        self.assertIsNone(x['human_gate_approver'])
        self.assertEqual(x['shorts'],[])
        self.assertEqual(x['rundown'][1]['verification_state'],'PENDING_HUMAN_VERIFICATION')
    def test_stale_fails_closed(self):
        with self.assertRaisesRegex(ValueError,'STALE_SOURCE'):
            convert(pack(generated_at='2026-11-12T07:00:00Z'),now=NOW)
    def test_stale_review_not_authorised(self):
        x=convert(pack(generated_at='2026-11-12T07:00:00Z'),now=NOW,allow_stale_review=True)
        self.assertTrue(x['source_pack_stale'])
        self.assertEqual(x['status'],'DRAFT')
    def test_bad_source_rejected(self):
        p=json.loads(pack());p['script_lines'][1]['source_url']='http://example.org'
        with self.assertRaisesRegex(ValueError,'HTTPS'):
            convert(json.dumps(p).encode('utf-8'),now=NOW)
    def test_presenter_alias_lock(self):
        x=convert(pack(),now=NOW)
        self.assertEqual([r['speaker'] for r in x['rundown']],['PROTOKOLKA','DIPLOMAT'])
    def test_bad_presenter_rejected(self):
        p=json.loads(pack());p['script_lines'][0]['speaker']='OTHER'
        with self.assertRaisesRegex(ValueError,'presenter'):
            convert(json.dumps(p).encode('utf-8'),now=NOW)


if __name__=='__main__':
    unittest.main()

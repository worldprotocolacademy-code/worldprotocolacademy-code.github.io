#!/usr/bin/env python3
"""Bridge existing WPA NEWS production JSON into an editorial DRAFT only.

Never signs, publishes, approves, or invokes external paid providers.
"""
import argparse
import hashlib
import json
import math
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlparse

SCHEMA = 'wpa-news-daily-production-pack/1.0'
SPEAKERS = {'Дипломатка':'PROTOKOLKA','Протоколка':'PROTOKOLKA',
            'Дипломат':'DIPLOMAT','PROTOKOLKA':'PROTOKOLKA','DIPLOMAT':'DIPLOMAT'}

def convert(raw, now=None, allow_stale_review=False):
    p = json.loads(raw)
    if p.get('schema') != SCHEMA or p.get('programme_id') != 'WPA-NEWS-DAILY-v1':
        raise ValueError('Unexpected WPA news schema/programme')
    t = datetime.fromisoformat(str(p['generated_at']).replace('Z','+00:00'))
    if t.tzinfo is None:
        raise ValueError('Timezone required')
    now = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    age = now - t.astimezone(timezone.utc)
    if age < timedelta(minutes=-10):
        raise ValueError('Future-dated source')
    stale = age > timedelta(hours=30)
    if stale and not allow_stale_review:
        raise ValueError('STALE_SOURCE: re-generate fresh WPA NEWS product')
    lines = p.get('script_lines')
    if not isinstance(lines,list) or not 1 <= len(lines) <= 30:
        raise ValueError('Require 1 to 30 bounded script lines')
    rows = []
    for i,s in enumerate(lines,1):
        if not isinstance(s,dict) or s.get('speaker') not in SPEAKERS:
            raise ValueError('Unrecognized canonical presenter')
        script = str(s.get('text') or '').strip()
        if not 1 <= len(script) <= 2500:
            raise ValueError('Empty or excessive script line')
        news = s.get('kind') == 'source_report'
        src = str(s.get('source_url') or '').strip()
        if news and (urlparse(src).scheme != 'https' or not urlparse(src).hostname):
            raise ValueError('NEWS requires an original HTTPS source URL')
        kind = 'NEWS' if news else 'ANALYSIS' if s.get('kind') == 'wpa_analysis' else ('INTRO' if i==1 else 'OUTRO' if i==len(lines) else 'ANALYSIS')
        rows.append(dict(segment=str(i).zfill(2),speaker=SPEAKERS[s['speaker']],
            kind=kind,text=script,source_tag=str(s.get('source') or 'WPA MEDIA')[:60],
            **({'source_url':src,'verified_at':None,'verification_state':'PENDING_HUMAN_VERIFICATION'} if news else {})))
    estimate = sum(len(x['text'].split())*60/115+3 for x in rows)
    if estimate > 1800:
        raise ValueError('Too long: split and approve separately')
    digest = hashlib.sha256(raw).hexdigest()
    return dict(release_id='WPA-NEWS-'+t.strftime('%Y%m%d')+'-'+digest[:10],
        media_profile='wpa-v26-canonical',status='DRAFT',approval_scope='render_only',
        human_gate_approver=None,human_gate_approver_email=None,
        source_pack_sha256=digest,source_pack_generated_at=p['generated_at'],
        source_pack_stale=stale,source_pack_status=p.get('status','UNKNOWN'),
        editorial_review='REQUIRES_INDEPENDENT_HUMAN_SOURCE_REVIEW',
        rundown=rows,shorts=[],shorts_status='PENDING_EDITORIAL_QA',
        max_estimated_audio_seconds=min(1800,max(60,math.ceil(estimate*1.2))),
        warning='DRAFT ONLY: not a render request, never automatic publication')

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',type=Path,required=True)
    ap.add_argument('--out',type=Path,required=True)
    ap.add_argument('--allow-stale-review',action='store_true',
                    help='Offline review only; cannot be approved as fresh news')
    args=ap.parse_args()
    doc=convert(args.source.read_bytes(),allow_stale_review=args.allow_stale_review)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('DRAFT_ONLY',doc['release_id'],'stale=',doc['source_pack_stale'],'no provider calls')

if __name__=='__main__':
    main()

#!/usr/bin/env python3
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
errors=[]
css=(ROOT/'en/wpa-en-mirror.css').read_text(encoding='utf-8')
required_css=[
 'body>header:not(.site-head){background:var(--navy);color:#fff;padding:56px 0 38px;border-bottom:4px solid var(--gold)}',
 'body>header:not(.site-head) .lead{max-width:780px;color:rgba(255,255,255,.8);font-size:18px}',
 'body>main>.wrap{padding:48px 0 64px}'
]
for needle in required_css:
    if needle not in css: errors.append('missing legacy compatibility CSS: '+needle)
if re.search(r'[\u0400-\u04FF]',css): errors.append('Cyrillic residue in English shared CSS')
legacy=['en/programmes.html','en/security.html','en/certification.html','en/privacy.html']
for rel in legacy:
    p=ROOT/rel
    if not p.exists(): errors.append('missing representative legacy route '+rel); continue
    t=p.read_text(encoding='utf-8')
    if '<header>' not in t and '<header ' not in t: errors.append(rel+': expected legacy header markup')
    if 'class="site-head"' in t: errors.append(rel+': unexpectedly migrated to site-head; update compatibility contract')
    if '<main><div class="wrap">' not in t and '<main>\n<div class="wrap">' not in t and '<main>\n  <div class="wrap">' not in t:
        if '<main' not in t or 'class="wrap"' not in t: errors.append(rel+': expected legacy main/wrap shell')
    if re.search(r'[\u0400-\u04FF]',t): errors.append(rel+': Cyrillic residue')
# Full-fidelity and 57-route parity remain mandatory.
import subprocess
for script in ('scripts/en_full_fidelity_check.py','scripts/en_complete_parity_check.py'):
    r=subprocess.run([sys.executable,str(ROOT/script)],cwd=ROOT,text=True,capture_output=True)
    if r.returncode!=0: errors.append(script+' regression:\n'+r.stdout+r.stderr)
gate=json.loads((ROOT/'data/human-gates/en-safe8u-candidate.json').read_text(encoding='utf-8'))
if gate.get('stage')!='SAFE-8U': errors.append('SAFE-8U stage mismatch')
if gate.get('predecessor_safe8t_exact')!='c8f001243792b8e46ba16a4d8436085c10e5781b': errors.append('SAFE-8T predecessor mismatch')
if gate.get('status')!='candidate_pending_exact_head_human_authority': errors.append('SAFE-8U must remain pending before Human Authority')
if errors:
    print('SAFE-8U English shared CSS compatibility check failed.')
    for e in errors: print('-',e)
    sys.exit(1)
print('SAFE-8U English shared CSS compatibility OK: SAFE-8T fidelity preserved; legacy English route shell protected.')

#!/usr/bin/env python3
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
errors=[]
gate=json.loads((ROOT/'data/human-gates/en-safe8t-candidate.json').read_text(encoding='utf-8'))
if gate.get('stage')!='SAFE-8T': errors.append('SAFE-8T stage mismatch')
if gate.get('base_main_exact')!='372f15fef1ccfa8d09c0fdafda07215a7773e768': errors.append('SAFE-8T base mismatch')
if gate.get('status')!='candidate_pending_exact_head_human_authority': errors.append('SAFE-8T must remain pending before exact-head Human Authority')
checks={
'en/index.html':{
 'min':12000,'sections':10,
 'need':['WPA Institutional Operating Architecture','Four levels. One coherent WPA academy.','Integrated learning pillars of WPA.','The intellectual foundation of WPA.','Protocolometry','Human-Governed AI','Who WPA Is For','Founder-led. Academic in spirit. Professional in execution.','Public boundary:']},
'en/institute.html':{
 'min':10000,'sections':8,
 'need':['Six pillars of the Charter.','Six domains of specialisation.','Four principal research directions.','WPA Centre for Analytics, Measurability and Institutional Indices.','Categories for fair comparison.','Protocolometry &amp; Benchmarking','Human-Governed AI','Public boundary:']}
}
for rel,cfg in checks.items():
 p=ROOT/rel
 if not p.exists(): errors.append(f'missing {rel}'); continue
 t=p.read_text(encoding='utf-8')
 if len(t.encode('utf-8'))<cfg['min']: errors.append(f'{rel}: too small for full-fidelity contract')
 if len(re.findall(r'<section\b',t,re.I))<cfg['sections']: errors.append(f'{rel}: insufficient section depth')
 if re.search(r'[\u0400-\u04FF]',t): errors.append(f'{rel}: Cyrillic residue')
 for needle in ('<html lang="en"','name="google" content="notranslate"','http-equiv="Content-Language" content="en"','translate="no"'):
  if needle not in t: errors.append(f'{rel}: missing language marker {needle}')
 for needle in cfg['need']:
  if needle not in t: errors.append(f'{rel}: missing fidelity anchor {needle}')
# SAFE-8S remains the route/purity authority.
import subprocess
r=subprocess.run([sys.executable,str(ROOT/'scripts/en_complete_parity_check.py')],cwd=ROOT,text=True,capture_output=True)
if r.returncode!=0:
 errors.append('SAFE-8S 57-route parity/purity regression:\n'+r.stdout+r.stderr)
if errors:
 print('SAFE-8T English full-fidelity check failed.')
 for e in errors: print('-',e)
 sys.exit(1)
print('SAFE-8T English full-fidelity OK: rich Home/Institute restored while SAFE-8S 57-route purity/parity remains intact.')

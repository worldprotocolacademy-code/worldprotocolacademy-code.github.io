#!/usr/bin/env python3
import json,re,sys
from pathlib import Path
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
errors=[]
def err(x): errors.append(x)
reg=json.loads((ROOT/'data/language-activation.json').read_text(encoding='utf-8'))
readiness=json.loads((ROOT/'data/language-readiness-50.json').read_text(encoding='utf-8'))
wave=json.loads((ROOT/'data/language-wave1-readiness.json').read_text(encoding='utf-8'))
gate=json.loads((ROOT/'data/human-gates/de-safe8x-candidate.json').read_text(encoding='utf-8'))
if reg.get('policy_mode')!='fail_closed': err('registry must remain fail_closed')
if reg.get('public_languages')!=['mk','en','fr','de']: err('public language set/order must be MK/EN/FR/DE')
if reg.get('public_routes',{}).get('de',{}).get('status')!='human_gated_public_pilot_candidate': err('DE top-level status mismatch')
if gate.get('stage')!='SAFE-8X' or gate.get('baseline_main_exact')!='5ef02ba0d63b3f05d9fa539b5c7a614bd6103644': err('SAFE-8X provenance mismatch')
if gate.get('status')!='candidate_pending_exact_head_human_authority': err('SAFE-8X gate must remain pending before approval/merge')
if gate.get('native_human_lector_verified') is not False or gate.get('publication_grade_line_by_line_verified') is not False: err('German claim boundary overclaimed')
if gate.get('after_approval')!='no_commits_before_merge': err('post-approval freeze missing')
surfaces=reg.get('public_surface_routes',{})
if len(surfaces)!=57: err(f'expected 57 surfaces, got {len(surfaces)}')
for sid,row in surfaces.items():
    if set(row)!=set(reg['public_languages']): err(f'{sid}: route language set mismatch')
    de=row.get('de','')
    if not de.startswith('/languages/de/'): err(f'{sid}: invalid DE namespace route {de}')
    rel=de.lstrip('/')+('index.html' if de.endswith('/') else '')
    p=ROOT/rel
    if not p.is_file(): err(f'{sid}: missing {de}'); continue
    t=p.read_text(encoding='utf-8')
    for needle in ('<html lang="de" dir="ltr">','name="google" content="notranslate"','http-equiv="Content-Language" content="de"','translate="no"'):
        if needle not in t: err(f'{sid}: missing {needle}')
    if re.search(r'[\u0400-\u04FF]',t): err(f'{sid}: Cyrillic residue')
    robots='name="robots" content="noindex,nofollow"' in t
    if sid in ('home','institute'):
        if robots: err(f'{sid}: discovery surface remains noindex')
        for code in ('mk','en','fr','de','x-default'):
            if f'hreflang="{code}"' not in t: err(f'{sid}: missing hreflang {code}')
    elif not robots: err(f'{sid}: must remain noindex pending separate indexing wave')
js=(ROOT/'languages/de/wpa-de-mirror.js').read_text(encoding='utf-8')
if "localStorage.setItem('wpa.language','de')" not in js: err('DE runtime must persist selected public language')
if re.search(r'[\u0400-\u04FF]',js): err('Cyrillic residue in German shared runtime')
if '/languages/' in set(re.findall(r"\['[^']+','([^']+)'\]",js)): err('German nav escapes to generic languages route')
public_now=readiness.get('public_now',{})
if list(public_now)!=reg['public_languages']: err('readiness public_now mismatch')
de_ready=public_now.get('de',{})
if de_ready.get('native_human_lector_verified') is not False or de_ready.get('publication_grade_line_by_line_verified') is not False: err('readiness claim boundary overclaimed')
if readiness.get('counts')!={'canon':50,'public':4,'nonpublic':46,'existing_nonpublic_drafts':8,'planned_nonpublic':38}: err('readiness counts mismatch')
wave_de=next((x for x in wave.get('languages',[]) if x.get('code')=='de'),{})
if wave_de.get('public_ready') is not True or wave_de.get('activation_status')!='human_gated_public_pilot_candidate': err('Wave-1 DE readiness mismatch')
# Sitemap discovery scope: DE Home and Institute only.
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
tree=ET.parse(ROOT/'sitemap.xml')
locs=[(n.text or '').strip() for n in tree.findall('.//s:url/s:loc',ns)]
base='https://worldprotocolacademy.mk'
for route in ('/languages/de/','/languages/de/institute.html'):
    if base+route not in locs: err(f'sitemap missing DE discovery route {route}')
for sid,row in surfaces.items():
    route=row['de']
    if sid not in ('home','institute') and base+route in locs: err(f'sitemap prematurely indexes DE surface {sid}')
if errors:
    print('SAFE-8X German activation check FAILED')
    for e in errors: print('-',e)
    sys.exit(1)
print('SAFE-8X German activation candidate OK: 57/57 public routes; Home/Institute discoverable; remaining 55 noindex; claim boundary preserved; Human Authority still pending.')

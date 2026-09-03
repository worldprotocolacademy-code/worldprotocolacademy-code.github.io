#!/usr/bin/env python3
import json,re,sys
from pathlib import Path
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
errors=[]
reg=json.loads((ROOT/'data/language-activation.json').read_text(encoding='utf-8'))
if reg.get('policy_mode')!='fail_closed': errors.append('registry must remain fail_closed')
if reg.get('canonical_master')!='mk' or reg.get('canonical_mirror')!='en': errors.append('canonical language roles changed')
surfaces=reg.get('public_surface_routes') or {}
if len(surfaces)!=57: errors.append(f'expected 57 public surfaces, got {len(surfaces)}')
mk_routes=[]; en_routes=[]
for sid,row in surfaces.items():
    mk=row.get('mk'); en=row.get('en'); fr=row.get('fr')
    if not mk: errors.append(f'{sid}: missing mk route')
    if not en: errors.append(f'{sid}: missing en route')
    if not fr: errors.append(f'{sid}: missing fr route')
    if mk: mk_routes.append(mk)
    if en:
        en_routes.append(en)
        rel=en.lstrip('/')
        if en.endswith('/'): rel += 'index.html'
        p=ROOT/rel
        if not p.exists(): errors.append(f'{sid}: missing English file {p.relative_to(ROOT)}')
        else:
            t=p.read_text(encoding='utf-8')
            for needle in ('<html lang="en"','name="google" content="notranslate"','http-equiv="Content-Language" content="en"','translate="no"'):
                if needle not in t: errors.append(f'{sid}: missing marker {needle}')
            canonical='https://worldprotocolacademy.mk'+en
            if canonical not in t: errors.append(f'{sid}: self-canonical missing {canonical}')
            # English public HTML must contain no Cyrillic at all. This is intentionally stricter than visible-text parsing.
            if re.search(r'[\u0400-\u04FF]',t): errors.append(f'{sid}: Cyrillic residue in English page')
            if '/languages/fr/' in t and sid not in ('home','institute'): pass
if len(set(en_routes))!=len(en_routes): errors.append('duplicate English surface routes')
# Compare canonical sitemap inventory with MK routes; alternates are not counted as canonical inventory.
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
tree=ET.parse(ROOT/'sitemap.xml')
locs=[]
for n in tree.findall('.//s:url/s:loc',ns):
    u=(n.text or '').strip()
    prefix='https://worldprotocolacademy.mk'
    if not u.startswith(prefix): continue
    path=u[len(prefix):] or '/'
    if path.startswith('/en/') or path.startswith('/languages/fr/'): continue
    locs.append(path)
canon=[]
for x in locs:
    if x not in canon: canon.append(x)
if set(canon)!=set(mk_routes):
    errors.append('canonical sitemap inventory does not exactly match registry MK public routes')
if len(canon)!=57: errors.append(f'expected 57 canonical sitemap routes, got {len(canon)}')
# Shared English runtime must be English-only and persist EN.
js=(ROOT/'en/wpa-en-mirror.js').read_text(encoding='utf-8')
if re.search(r'[\u0400-\u04FF]',js): errors.append('Cyrillic residue in English shared runtime')
for needle in ("localStorage.setItem('wpa.language','en')","data-wpa-ui-language','en"):
    if needle not in js: errors.append('English shared runtime persistence invariant missing')
# Candidate provenance.
gate=json.loads((ROOT/'data/human-gates/en-safe8s-candidate.json').read_text(encoding='utf-8'))
if gate.get('stage')!='SAFE-8S' or gate.get('base_main_exact')!='5a3f52bfb7ca33236f9d6ae0cbec28d8650e1c77': errors.append('SAFE-8S provenance mismatch')
if gate.get('surface_count')!=57: errors.append('SAFE-8S candidate surface_count must be 57')
if gate.get('status')!='candidate_pending_exact_head_human_authority': errors.append('SAFE-8S must remain pending until exact-head Human Authority')
if errors:
    print('SAFE-8S English parity/purity check failed.')
    for e in errors: print('-',e)
    sys.exit(1)
print('SAFE-8S English public parity/purity OK: 57 registered surfaces; 57 canonical sitemap routes covered; zero Cyrillic in EN public HTML/runtime.')

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
    mk=row.get('mk'); en=row.get('en'); fr=row.get('fr'); de=row.get('de')
    if not mk: errors.append(f'{sid}: missing mk route')
    if not en: errors.append(f'{sid}: missing en route')
    if not fr: errors.append(f'{sid}: missing fr route')
    if 'de' in reg.get('public_languages',[]) and not de: errors.append(f'{sid}: missing de route')
    if mk: mk_routes.append(mk)
    if en:
        en_routes.append(en); rel=en.lstrip('/')
        if en.endswith('/'): rel += 'index.html'
        p=ROOT/rel
        if not p.exists(): errors.append(f'{sid}: missing English file {p.relative_to(ROOT)}')
        else:
            t=p.read_text(encoding='utf-8')
            for needle in ('<html lang="en"','name="google" content="notranslate"','http-equiv="Content-Language" content="en"','translate="no"'):
                if needle not in t: errors.append(f'{sid}: missing marker {needle}')
            canonical='https://worldprotocolacademy.mk'+en
            if canonical not in t: errors.append(f'{sid}: self-canonical missing {canonical}')
            if re.search(r'[\u0400-\u04FF]',t): errors.append(f'{sid}: Cyrillic residue in English page')
if len(set(en_routes))!=len(en_routes): errors.append('duplicate English surface routes')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}; tree=ET.parse(ROOT/'sitemap.xml'); locs=[]
for n in tree.findall('.//s:url/s:loc',ns):
    u=(n.text or '').strip(); prefix='https://worldprotocolacademy.mk'
    if not u.startswith(prefix): continue
    path=u[len(prefix):] or '/'
    if path.startswith('/en/') or path.startswith('/languages/fr/') or path.startswith('/languages/de/'): continue
    locs.append(path)
canon=[]
for x in locs:
    if x not in canon: canon.append(x)
canon_set=set(canon); mk_set=set(mk_routes)
extra=canon_set-mk_set
if extra: errors.append('canonical sitemap has routes not present in registry: ' + ', '.join(sorted(extra)))
missing=mk_set-canon_set
allowed_noindex_omissions=[]
for route in sorted(missing):
    rel=route.lstrip('/')
    if route.endswith('/'): rel += 'index.html'
    p=ROOT/rel
    if not p.exists():
        errors.append(f'registered MK route missing from sitemap and filesystem: {route}')
        continue
    t=p.read_text(encoding='utf-8')
    meta_tags=re.findall(r'<meta\\b[^>]*>',t,flags=re.I)
    noindex=any(
        re.search(r'\\bname\\s*=\\s*["\\\']robots["\\\']',tag,re.I)
        and re.search(r'\\bcontent\\s*=\\s*["\\\'][^"\\\']*\\bnoindex\\b',tag,re.I)
        for tag in meta_tags
    )
    if noindex:
        allowed_noindex_omissions.append(route)
    else:
        errors.append(f'registered MK route missing from sitemap without noindex: {route}')
expected_sitemap_count=len(mk_routes)-len(allowed_noindex_omissions)
if len(canon)!=expected_sitemap_count:
    errors.append(f'expected {expected_sitemap_count} indexable canonical sitemap routes, got {len(canon)}')
js=(ROOT/'en/wpa-en-mirror.js').read_text(encoding='utf-8')
if re.search(r'[\u0400-\u04FF]',js): errors.append('Cyrillic residue in English shared runtime')
for needle in ("localStorage.setItem('wpa.language','en')","data-wpa-ui-language','en"):
    if needle not in js: errors.append('English shared runtime persistence invariant missing')
gate=json.loads((ROOT/'data/human-gates/en-safe8s-candidate.json').read_text(encoding='utf-8'))
if gate.get('stage')!='SAFE-8S' or gate.get('base_main_exact')!='5a3f52bfb7ca33236f9d6ae0cbec28d8650e1c77': errors.append('SAFE-8S provenance mismatch')
if gate.get('surface_count')!=57: errors.append('SAFE-8S candidate surface_count must be 57')
if gate.get('status')!='candidate_pending_exact_head_human_authority': errors.append('SAFE-8S historical candidate status drifted')
if errors:
    print('English parity/purity check failed under current registry.')
    for e in errors: print('-',e)
    sys.exit(1)
print(f'English public parity/purity OK: 57 registered surfaces; {len(canon)} indexable canonical sitemap routes; {len(allowed_noindex_omissions)} explicit noindex omission(s); zero Cyrillic in EN public HTML/runtime.')

#!/usr/bin/env python3
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
activation=json.loads((ROOT/'data/language-activation.json').read_text(encoding='utf-8'))
manifest=json.loads((ROOT/'data/human-gates/de-safe8w-candidate.json').read_text(encoding='utf-8'))
assert activation['policy_mode']=='fail_closed'
assert activation['public_languages']==['mk','en','fr']
assert 'de' not in activation['public_routes']
assert manifest['public_activation'] is False
assert manifest['native_human_lector_verified'] is False
assert manifest['publication_grade_line_by_line_verified'] is False
surfaces=activation['public_surface_routes']
assert len(surfaces)==57
expected=[]
for key,row in surfaces.items():
    fr=row['fr']
    assert fr.startswith('/languages/fr/')
    de=fr.replace('/languages/fr/','/languages/de/',1)
    expected.append((key,de))
expected_routes={route for _,route in expected}
assert len(expected_routes)==57
for key,route in expected:
    rel=route.lstrip('/')
    if route.endswith('/'):
        rel += 'index.html'
    p=ROOT/rel
    assert p.is_file(), f'missing German surface {key}: {route}'
    t=p.read_text(encoding='utf-8')
    assert '<html lang="de" dir="ltr">' in t, f'lang marker missing: {route}'
    assert '<meta name="google" content="notranslate">' in t, f'notranslate meta missing: {route}'
    assert '<meta http-equiv="Content-Language" content="de">' in t, f'content language missing: {route}'
    assert 'class="notranslate" translate="no"' in t, f'body translation lock missing: {route}'
    assert '<meta name="robots" content="noindex,nofollow">' in t, f'candidate robots lock missing: {route}'
    assert f'<link rel="canonical" href="https://worldprotocolacademy.mk{route}">' in t, f'self canonical missing: {route}'
    assert '/languages/de/wpa-de-mirror.css' in t and '/languages/de/wpa-de-mirror.js' in t
    assert not re.search(r'[\u0400-\u04FF]',t), f'Cyrillic residue: {route}'
js=(ROOT/'languages/de/wpa-de-mirror.js').read_text(encoding='utf-8')
assert "localStorage.setItem('wpa.language','de')" not in js
nav_hrefs=set(re.findall(r"\['[^']+','([^']+)'\]",js))
footer_hrefs=set(re.findall(r'<a href="([^"]+)"',js))
shared_hrefs=nav_hrefs|footer_hrefs
assert shared_hrefs, 'German shared navigation/footer produced no auditable links'
for href in shared_hrefs:
    assert href.startswith('/languages/de/'), f'German shared navigation/footer escapes namespace: {href}'
assert '/languages/' not in shared_hrefs, 'German shared navigation must not escape to generic language hub'
assert '/languages/de/languages-hub.html' in nav_hrefs, 'German navigation must expose the complete German surface index'
hub=(ROOT/'languages/de/languages-hub.html').read_text(encoding='utf-8')
hub_hrefs=set(re.findall(r'href="([^"]+)"',hub))
hub_surface_hrefs={h for h in hub_hrefs if h.startswith('/languages/de/') and not h.endswith(('wpa-de-mirror.css','wpa-de-mirror.js'))}
missing=expected_routes-hub_surface_hrefs
extra=hub_surface_hrefs-expected_routes
assert not missing, f'German surface index missing routes: {sorted(missing)}'
assert not extra, f'German surface index contains unregistered German routes: {sorted(extra)}'
assert len(hub_surface_hrefs)==57
assert len(expected)==manifest['registered_surface_count']==57
print('SAFE-8W German candidate OK: 57/57 static surfaces; complete German index; namespace-contained; de remains nonpublic and fail-closed.')

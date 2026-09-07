#!/usr/bin/env python3
import hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EXPECTED_SAFE8Y_MANIFEST_BLOB='ca44adf37bb607b945e01dc0e0c931912437ffd2'
def git_blob_sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
activation=json.loads((ROOT/'data/language-activation.json').read_text(encoding='utf-8'))
assert activation['policy_mode']=='fail_closed'
surfaces=activation['public_surface_routes']
assert len(surfaces)==57
is_public='de' in activation['public_languages']
if is_public:
    status=activation['public_routes']['de']['status']
    assert status in ('human_gated_public_pilot_candidate','human_gated_public_pilot')
    if status=='human_gated_public_pilot':
        manifest_path=ROOT/'data/human-gates/de-safe8y-candidate.json'
        manifest_bytes=manifest_path.read_bytes()
        assert git_blob_sha(manifest_bytes)==EXPECTED_SAFE8Y_MANIFEST_BLOB, 'historical SAFE-8Y candidate manifest byte drift'
        manifest=json.loads(manifest_bytes.decode('utf-8'))
        receipt=json.loads((ROOT/'data/human-gates/de-safe8y-production-receipt.json').read_text(encoding='utf-8'))
        assert manifest['stage']=='SAFE-8Y' and manifest['public_activation_scope'] is True
        assert manifest['status']=='candidate_pending_exact_head_human_authority'
        assert manifest['predecessor_safe8x_approved_exact']=='1b82709755917d9a175b049fc6cca3e801096d91'
        assert manifest['predecessor_safe8x_merge'] is False
        assert receipt['stage']=='SAFE-8Y' and receipt['human_authority_granted'] is True
        assert receipt['approved_exact_head']=='5062214a378326edb1e24503bab4707cd5c8ec11'
        assert receipt['merge_sha']=='558901855384047853571006100d0cf378369a35'
        assert receipt['merge_verified'] is True
        assert receipt['pages_deployment']['head_sha']==receipt['merge_sha']
        assert receipt['pages_deployment']['conclusion']=='success'
        assert receipt['candidate_manifest_immutable'] is True
        assert receipt['candidate_manifest_git_blob_sha']==EXPECTED_SAFE8Y_MANIFEST_BLOB
        assert receipt['independent_custom_domain_http_verification']=='pending_environment_dns_constraint'
        assert receipt['live_claim']=='not_independently_verified_from_current_runtime'
        assert receipt['live_transition_requires_separate_human_gate'] is True
    else:
        manifest=json.loads((ROOT/'data/human-gates/de-safe8x-candidate.json').read_text(encoding='utf-8'))
        assert manifest['stage']=='SAFE-8X' and manifest['public_activation_scope'] is True
    assert activation['public_languages']==['mk','en','fr','de']
    expected=[(key,row['de']) for key,row in surfaces.items()]
else:
    manifest=json.loads((ROOT/'data/human-gates/de-safe8w-candidate.json').read_text(encoding='utf-8'))
    assert activation['public_languages']==['mk','en','fr']
    assert 'de' not in activation['public_routes']
    assert manifest['public_activation'] is False
    expected=[]
    for key,row in surfaces.items():
        fr=row['fr']; assert fr.startswith('/languages/fr/')
        expected.append((key,fr.replace('/languages/fr/','/languages/de/',1)))
expected_routes={route for _,route in expected}
assert len(expected_routes)==57
for key,route in expected:
    rel=route.lstrip('/')
    if route.endswith('/'): rel += 'index.html'
    p=ROOT/rel
    assert p.is_file(), f'missing German surface {key}: {route}'
    t=p.read_text(encoding='utf-8')
    assert '<html lang="de" dir="ltr">' in t, f'lang marker missing: {route}'
    assert '<meta name="google" content="notranslate">' in t, f'notranslate meta missing: {route}'
    assert '<meta http-equiv="Content-Language" content="de">' in t, f'content language missing: {route}'
    assert 'class="notranslate" translate="no"' in t, f'body translation lock missing: {route}'
    canonical=f'https://worldprotocolacademy.mk{route}'
    assert f'<link rel="canonical" href="{canonical}">' in t, f'self canonical missing: {route}'
    assert '/languages/de/wpa-de-mirror.css' in t and '/languages/de/wpa-de-mirror.js' in t
    assert not re.search(r'[\u0400-\u04FF]',t), f'Cyrillic residue: {route}'
    if is_public and activation['public_routes']['de']['status']=='human_gated_public_pilot':
        low=t.lower()
        for phrase in ('safe-8w kandidat','safe-8w-kandidat','nicht öffentlich aktiviert','deutsch bleibt safe-8w'):
            assert phrase not in low, f'stale German nonpublic governance residue: {route}: {phrase}'
    robots='<meta name="robots" content="noindex,nofollow">' in t
    if not is_public:
        assert robots, f'candidate robots lock missing: {route}'
    elif key in ('home','institute'):
        assert not robots, f'public pilot discovery surface must be indexable: {route}'
    else:
        assert robots, f'non-discovery DE surface must remain noindex pending indexing wave: {route}'
js=(ROOT/'languages/de/wpa-de-mirror.js').read_text(encoding='utf-8')
if is_public:
    assert "localStorage.setItem('wpa.language','de')" in js
else:
    assert "localStorage.setItem('wpa.language','de')" not in js
nav_hrefs=set(re.findall(r"\['[^']+','([^']+)'\]",js))
footer_hrefs=set(re.findall(r'<a href="([^"]+)"',js))
shared_hrefs=nav_hrefs|footer_hrefs
assert shared_hrefs
for href in shared_hrefs: assert href.startswith('/languages/de/'), f'German shared navigation/footer escapes namespace: {href}'
assert '/languages/' not in shared_hrefs
assert '/languages/de/languages-hub.html' in nav_hrefs
hub=(ROOT/'languages/de/languages-hub.html').read_text(encoding='utf-8')
hub_hrefs=set(re.findall(r'href="([^"]+)"',hub))
hub_surface_hrefs={h for h in hub_hrefs if h.startswith('/languages/de/') and not h.endswith(('wpa-de-mirror.css','wpa-de-mirror.js'))}
assert not (expected_routes-hub_surface_hrefs), f'German surface index missing routes: {sorted(expected_routes-hub_surface_hrefs)}'
assert not (hub_surface_hrefs-expected_routes), f'German surface index contains unregistered routes: {sorted(hub_surface_hrefs-expected_routes)}'
assert len(hub_surface_hrefs)==57
print(f'German current-state gate OK: 57/57 surfaces; namespace-contained; public={is_public}; immutable SAFE-8Y blob and fail-closed LIVE boundary enforced.')

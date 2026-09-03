from pathlib import Path
import json,re,sys
from urllib.parse import urlparse
ROOT=Path('.')
reg=json.loads((ROOT/'data/language-activation.json').read_text(encoding='utf-8'))
assert reg['policy_mode']=='fail_closed'
assert reg['public_languages']==['mk','en','fr']
assert reg['alignment']['required'] is True
surfaces=reg['public_surface_routes']
assert len(surfaces)==57, f'expected 57 registered public surfaces, got {len(surfaces)}'
mk_to_fr={v['mk']:v['fr'] for v in surfaces.values() if 'mk' in v and 'fr' in v}
xml=(ROOT/'sitemap.xml').read_text(encoding='utf-8')
locs=re.findall(r'<loc>https://worldprotocolacademy\.mk([^<]*)</loc>',xml)
canonical=[]
for r in locs:
    r=r or '/'
    if r.startswith('/en/') or r=='/en/' or r.startswith('/languages/fr/'):
        continue
    canonical.append(r)
missing=sorted(set(canonical)-set(mk_to_fr))
assert not missing, 'canonical public routes without FR sibling: '+', '.join(missing)
for mk,fr in sorted(mk_to_fr.items()):
    rel=fr.lstrip('/')
    p=ROOT/rel
    if fr.endswith('/'):
        p=p/'index.html'
    assert p.exists(), f'missing FR file for {mk}: {p}'
    text=p.read_text(encoding='utf-8')
    assert '<html lang="fr" dir="ltr">' in text, p
    assert '<meta name="google" content="notranslate">' in text, p
    assert '<meta http-equiv="Content-Language" content="fr">' in text, p
    assert '<body class="notranslate" translate="no">' in text, p
    assert re.search(r'<link rel="canonical" href="https://worldprotocolacademy\.mk'+re.escape(fr)+r'">',text), f'bad canonical {p}'
    assert not re.search(r'[\u0400-\u04ff]',text), f'Cyrillic residue in {p}'
router=(ROOT/'languages/wpa-public-language-router-v2.js').read_text(encoding='utf-8')
assert 'public_surface_routes' in router
manifest=json.loads((ROOT/'data/human-gates/fr-safe8r-candidate.json').read_text(encoding='utf-8'))
assert manifest['stage']=='SAFE-8R'
assert manifest['status']=='candidate_pending_exact_head_human_authority'
assert manifest['base_main_exact']=='c81ab09642d9fa3b51df013006fe7835614c240e'
print(f'SAFE-8R French public parity OK: {len(surfaces)} registered surfaces; {len(set(canonical))} canonical sitemap routes covered.')

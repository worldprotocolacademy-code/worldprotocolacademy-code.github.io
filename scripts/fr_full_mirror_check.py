#!/usr/bin/env python3
"""SAFE-8Q registry-driven French static mirror validator."""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]

def load(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def repo_path(route):
    p=str(route).split('?',1)[0].split('#',1)[0].lstrip('/')
    if not p:return Path('index.html')
    if p.endswith('/'):p+='index.html'
    return Path(p)
def fail(items):
    print('SAFE-8Q French full mirror check failed.')
    for x in items:print('-',x)
    return 1

def main():
    errors=[]
    a=load('data/language-activation.json')
    if a.get('policy_mode')!='fail_closed' or a.get('unlisted_languages_public') is not False:errors.append('activation registry must remain fail-closed')
    if 'fr' not in a.get('public_languages',[]):errors.append('fr must remain publicly activated')
    surfaces=a.get('public_surface_routes')
    if not isinstance(surfaces,dict) or len(surfaces)<10:errors.append('public_surface_routes missing or unexpectedly small')
    mk_routes=set();fr_routes=set()
    for sid,routes in (surfaces or {}).items():
        if not isinstance(routes,dict) or 'mk' not in routes:errors.append(f'{sid}: canonical MK route missing');continue
        mk_routes.add(routes['mk'])
        for code,route in routes.items():
            if code not in a['public_languages']:errors.append(f'{sid}: unlisted public language {code}')
            if not isinstance(route,str) or not route.startswith('/'):errors.append(f'{sid}/{code}: invalid route')
        fr=routes.get('fr')
        if not fr:continue
        fr_routes.add(fr)
        path=repo_path(fr);full=ROOT/path
        if not full.exists():errors.append(f'{sid}: missing FR target {path}');continue
        text=full.read_text(encoding='utf-8')
        checks={
          'html lang/dir':'<html lang="fr" dir="ltr">',
          'google notranslate':'<meta name="google" content="notranslate">',
          'content-language':'<meta http-equiv="Content-Language" content="fr">',
          'body translation lock':'<body class="notranslate" translate="no">',
        }
        for label,needle in checks.items():
            if needle not in text:errors.append(f'{path}: missing {label}')
        canonical='https://worldprotocolacademy.mk'+fr
        if f'<link rel="canonical" href="{canonical}">' not in text:errors.append(f'{path}: self canonical mismatch')
        if re.search(r'[\u0400-\u04FF]',text):errors.append(f'{path}: Cyrillic residue detected')
        for href in re.findall(r'href=["\']([^"\']+)["\']',text):
            if href in mk_routes:errors.append(f'{path}: canonical-language fallback link exposed: {href}')
    if len(fr_routes)<10:errors.append('FR route set unexpectedly small')
    home=(ROOT/'languages/fr/index.html').read_text(encoding='utf-8')
    for needed in ['/languages/fr/institute.html','/languages/fr/protocolometry-center.html','/languages/fr/journal/','/languages/fr/programmes.html','/languages/fr/papers.html','/languages/fr/wpa-services.html','/languages/fr/virtual-sande-ai.html']:
        if needed not in home:errors.append(f'FR Home missing section route: {needed}')
    shared=(ROOT/'languages/fr/wpa-fr-mirror.js')
    if not shared.exists():errors.append('missing shared FR mirror navigation')
    else:
        js=shared.read_text(encoding='utf-8')
        if "localStorage.setItem('wpa.language','fr')" not in js:errors.append('FR shared navigation must persist wpa.language=fr')
    router=(ROOT/'languages/wpa-public-language-router-v2.js').read_text(encoding='utf-8')
    for token in ['Public Language Router v2.3','function surfaceMatch(registry)','public_surface_routes','if(matched)return matched.routes[code]||null']:
        if token not in router:errors.append(f'public router missing SAFE-8Q invariant: {token}')
    historical=[ROOT/'data/human-gates/fr.json',ROOT/'data/human-gates/fr-review-package.json',ROOT/'data/human-gates/fr-review-evidence.json']
    for p in historical:
        t=p.read_text(encoding='utf-8')
        if 'e4dcadcbce290950e189d74d24f81d04ac546b44' not in t or '6c442c26a7c908c414683315220486dacd33e873' not in t:errors.append(f'historical SAFE-8F provenance missing in {p.relative_to(ROOT)}')
    if errors:return fail(errors)
    print(f'SAFE-8Q French full mirror PASS: {len(fr_routes)} registered FR surfaces; fail-closed route preservation verified.')
    return 0
if __name__=='__main__':sys.exit(main())

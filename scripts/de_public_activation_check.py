#!/usr/bin/env python3
import hashlib,json,re,sys
from pathlib import Path
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
EXPECTED_SAFE8Y_MANIFEST_BLOB='ca44adf37bb607b945e01dc0e0c931912437ffd2'
def git_blob_sha(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
errors=[]
def err(x): errors.append(x)
reg=json.loads((ROOT/'data/language-activation.json').read_text(encoding='utf-8'))
readiness=json.loads((ROOT/'data/language-readiness-50.json').read_text(encoding='utf-8'))
wave=json.loads((ROOT/'data/language-wave1-readiness.json').read_text(encoding='utf-8'))
legacy=json.loads((ROOT/'languages/NEW_10_LANGUAGE_STATUS_v1.json').read_text(encoding='utf-8'))
manifest_path=ROOT/'data/human-gates/de-safe8y-candidate.json'
manifest_bytes=manifest_path.read_bytes()
gate=json.loads(manifest_bytes.decode('utf-8'))
receipt=json.loads((ROOT/'data/human-gates/de-safe8y-production-receipt.json').read_text(encoding='utf-8'))
if git_blob_sha(manifest_bytes)!=EXPECTED_SAFE8Y_MANIFEST_BLOB: err('historical SAFE-8Y candidate manifest byte drift')
if receipt.get('candidate_manifest_git_blob_sha')!=EXPECTED_SAFE8Y_MANIFEST_BLOB: err('SAFE-8Y receipt candidate manifest blob pin mismatch')
if reg.get('policy_mode')!='fail_closed': err('registry must remain fail_closed')
if reg.get('public_languages')!=['mk','en','fr','de']: err('public language set/order must be MK/EN/FR/DE')
if reg.get('public_routes',{}).get('de',{}).get('status')!='human_gated_public_pilot': err('DE operational status mismatch')
if gate.get('stage')!='SAFE-8Y' or gate.get('predecessor_safe8x_approved_exact')!='1b82709755917d9a175b049fc6cca3e801096d91': err('SAFE-8Y provenance mismatch')
if gate.get('status')!='candidate_pending_exact_head_human_authority': err('historical SAFE-8Y candidate manifest drifted')
if gate.get('predecessor_safe8x_merge') is not False: err('SAFE-8X hold provenance must state not merged')
if gate.get('native_human_lector_verified') is not False or gate.get('publication_grade_line_by_line_verified') is not False: err('German claim boundary overclaimed')
if gate.get('after_approval')!='no_commits_before_merge': err('post-approval freeze missing')
if receipt.get('stage')!='SAFE-8Y' or receipt.get('human_authority_granted') is not True: err('SAFE-8Y production receipt missing Human Authority')
if receipt.get('approved_exact_head')!='5062214a378326edb1e24503bab4707cd5c8ec11': err('SAFE-8Y approved exact head receipt mismatch')
if receipt.get('merge_sha')!='558901855384047853571006100d0cf378369a35' or receipt.get('merge_verified') is not True: err('SAFE-8Y merge receipt mismatch')
if receipt.get('merge_tree')!='3be1c8725ffdf7cc88b82714e8ad79a5dd0f1fce': err('SAFE-8Y merge tree receipt mismatch')
if receipt.get('merge_parents')!=['5ef02ba0d63b3f05d9fa539b5c7a614bd6103644','5062214a378326edb1e24503bab4707cd5c8ec11']: err('SAFE-8Y merge parent receipt mismatch')
pages=receipt.get('pages_deployment',{})
if pages.get('run_number')!=2427 or pages.get('run_id')!=33792931077 or pages.get('head_sha')!=receipt.get('merge_sha') or pages.get('conclusion')!='success': err('SAFE-8Y Pages receipt mismatch')
if receipt.get('candidate_manifest_immutable') is not True: err('candidate manifest immutability receipt missing')
if receipt.get('independent_custom_domain_http_verification')!='pending_environment_dns_constraint': err('independent custom-domain verification state may not advance in this closure')
if receipt.get('live_claim')!='not_independently_verified_from_current_runtime': err('LIVE claim may not advance without separate independently verified Human Gate')
if receipt.get('live_transition_requires_separate_human_gate') is not True: err('separate Human Gate required for future LIVE transition')
if readiness.get('status')!='human_authority_granted_merged_pages_success_independent_custom_domain_verification_pending': err('readiness SAFE-8Y closure status mismatch')
if readiness.get('safe8y_production_receipt')!='data/human-gates/de-safe8y-production-receipt.json': err('readiness missing SAFE-8Y production receipt authority')
surfaces=reg.get('public_surface_routes',{})
if len(surfaces)!=57: err(f'expected 57 surfaces, got {len(surfaces)}')
stale=['safe-8w kandidat','safe-8w-kandidat','safe-8x','nicht öffentlich aktiviert','bleiben bis zu einem eigenen human gate nicht öffentlich aktiviert','deutsch bleibt safe-8w','deutsche kandidatenoberfläche','kandidatenfassung','kandidatenübersetzung','keine deutsche aktivierung ohne eigenen human gate']
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
    low=t.lower()
    for phrase in stale:
        if phrase in low: err(f'{sid}: stale nonpublic/governance residue: {phrase}')
    if 'human-gated öffentlicher pilot' not in low and 'human-gated öffentliche pilotfassung' not in low: err(f'{sid}: missing static Human-Gated public-pilot state label')
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
router=(ROOT/'languages/wpa-public-language-router-v2.js').read_text(encoding='utf-8')
if 'route.status === "human_gated_public_pilot"' not in router or 'return "Human-Gated public pilot"' not in router: err('shared public-language router drops German Human-Gated pilot qualifier')
if 'route.status === "approved_public_pilot"' not in router or 'return "public pilot"' not in router: err('shared public-language router no longer preserves approved public-pilot qualifier')
public_now=readiness.get('public_now',{})
if list(public_now)!=reg['public_languages']: err('readiness public_now mismatch')
de_ready=public_now.get('de',{})
if de_ready.get('role')!='human_gated_public_pilot': err('readiness DE role mismatch')
if de_ready.get('safe8y_outcome')!='human_authority_granted_merged_pages_success': err('readiness DE production outcome mismatch')
if de_ready.get('independent_custom_domain_http_verification')!='pending_environment_dns_constraint': err('readiness must preserve pending independent verification')
if de_ready.get('live_claim')!='not_independently_verified_from_current_runtime': err('readiness must not claim LIVE')
if de_ready.get('native_human_lector_verified') is not False or de_ready.get('publication_grade_line_by_line_verified') is not False: err('readiness claim boundary overclaimed')
if readiness.get('counts')!={'canon':50,'public':4,'nonpublic':46,'existing_nonpublic_drafts':8,'planned_nonpublic':38}: err('readiness counts mismatch')
wave_de=next((x for x in wave.get('languages',[]) if x.get('code')=='de'),{})
if wave_de.get('public_ready') is not True or wave_de.get('activation_status')!='human_gated_public_pilot': err('Wave-1 DE readiness mismatch')
if wave_de.get('human_review')!='human_authority_approved' or wave_de.get('blockers')!=[]: err('Wave-1 still claims SAFE-8Y approval blocker')
if not wave_de.get('live_verification_blockers'): err('Wave-1 must retain independent LIVE verification blocker')
legacy_de=next((x for x in legacy.get('new_languages',[]) if x.get('code')=='de'),{})
legacy_status=legacy_de.get('status','').lower()
if 'required before merge' in legacy_status or 'pending exact-head human authority' in legacy_status: err('legacy NEW-10 German status still claims pre-merge approval pending')
if 'independent custom-domain http verification pending' not in legacy_status: err('legacy NEW-10 German status must preserve pending independent verification')
hub_public=(ROOT/'languages/index.html').read_text(encoding='utf-8').lower()
if 'fresh exact-head human authority is required before merge' in hub_public: err('public Languages Hub still claims SAFE-8Y approval pending')
if 'approved under the safe-8y human gate' not in hub_public: err('public Languages Hub missing durable SAFE-8Y approved wording')
sitemap_path=ROOT/'sitemap.xml'; sitemap_text=sitemap_path.read_text(encoding='utf-8')
if 'SAFE-8X' in sitemap_text: err('sitemap retains stale SAFE-8X German provenance')
if 'DE SAFE-8Y Human-Gated discovery pilot' not in sitemap_text: err('sitemap missing SAFE-8Y German discovery provenance')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
tree=ET.parse(sitemap_path)
locs=[(n.text or '').strip() for n in tree.findall('.//s:url/s:loc',ns)]
base='https://worldprotocolacademy.mk'
for route in ('/languages/de/','/languages/de/institute.html'):
    if base+route not in locs: err(f'sitemap missing DE discovery route {route}')
for sid,row in surfaces.items():
    route=row['de']
    if sid not in ('home','institute') and base+route in locs: err(f'sitemap prematurely indexes DE surface {sid}')
if errors:
    print('SAFE-8Y German activation check FAILED')
    for e in errors: print('-',e)
    sys.exit(1)
print('SAFE-8Y German public-state OK: 57/57 routes; immutable candidate blob pinned; Human Authority/merge/Pages receipt confirmed; independent LIVE verification remains fail-closed pending a separate Human Gate.')

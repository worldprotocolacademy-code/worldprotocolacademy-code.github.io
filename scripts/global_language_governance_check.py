#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def load(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def fail(message): raise SystemExit(f'GLOBAL LANGUAGE GOVERNANCE FAIL: {message}')
activation=load('data/language-activation.json'); canon=load('data/language-canon-50.json'); manifest=load('locales/manifest.json'); readiness=load('data/language-readiness-50.json')
canon_codes=canon.get('canonical_codes',[]); manifest_codes=[x.get('code') for x in manifest.get('supported_languages',[])]; public=activation.get('public_languages',[]); surfaces=activation.get('public_surface_routes',{})
if activation.get('policy_mode')!='fail_closed': fail('activation registry must remain fail_closed')
if activation.get('unlisted_languages_public') is not False: fail('unlisted languages must remain nonpublic')
if activation.get('human_gate_required') is not True: fail('Human Gate must remain mandatory')
if canon.get('canon_count')!=50 or len(canon_codes)!=50 or len(set(canon_codes))!=50: fail('canonical language set must contain exactly 50 unique codes')
if len(manifest_codes)!=50 or len(set(manifest_codes))!=50 or set(manifest_codes)!=set(canon_codes): fail('translator manifest and final canon must match exactly at 50')
if public!=['mk','en','fr','de']: fail(f'public language order/set changed unexpectedly: {public}')
if activation.get('canonical_master')!='mk' or activation.get('canonical_mirror')!='en': fail('canonical roles changed')
if activation.get('public_routes',{}).get('de',{}).get('status')!='human_gated_public_pilot': fail('DE operational status mismatch')
if len(surfaces)!=57: fail(f'expected 57 registered public surfaces, found {len(surfaces)}')
for sid,routes in surfaces.items():
    if set(routes)!=set(public): fail(f'surface {sid} must expose exactly MK/EN/FR/DE routes')
    for code,route in routes.items():
        if not isinstance(route,str) or not route.startswith('/'): fail(f'surface {sid}/{code} invalid route')
public_now=readiness.get('public_now',{})
if list(public_now)!=public: fail('readiness public_now must match activation public_languages')
if public_now['mk'].get('role')!='canonical_master' or public_now['en'].get('role')!='canonical_mirror': fail('canonical readiness role mismatch')
if public_now['fr'].get('role')!='approved_public_pilot': fail('FR readiness role mismatch')
if public_now['de'].get('role')!='human_gated_public_pilot': fail('DE readiness role mismatch')
for code in ('fr','de'):
    if public_now[code].get('native_human_lector_verified') is not False: fail(f'{code} must not overclaim native lector verification')
    if public_now[code].get('publication_grade_line_by_line_verified') is not False: fail(f'{code} must not overclaim publication-grade verification')
nonpublic=readiness.get('nonpublic_existing_drafts',[])+readiness.get('nonpublic_planned_wave2',[])+readiness.get('nonpublic_planned_wave3',[])+readiness.get('nonpublic_planned_wave4',[])
if len(nonpublic)!=46 or len(set(nonpublic))!=46: fail('readiness ledger must enumerate exactly 46 unique nonpublic languages')
if set(nonpublic)!=set(canon_codes)-set(public): fail('readiness nonpublic set != canon minus public')
if readiness.get('counts')!={'canon':50,'public':4,'nonpublic':46,'existing_nonpublic_drafts':8,'planned_nonpublic':38}: fail('readiness counts mismatch')
phase1=canon.get('rollout',{}).get('phase1_public',[])
if phase1!=['mk','en']: fail('canon phase1_public historical record changed')
for historical in ('fr','de'):
    if historical not in canon.get('rollout',{}).get('wave1_existing_drafts',[]): fail(f'{historical} Wave-1 provenance missing')
for code in nonpublic:
    if code in activation.get('public_routes',{}): fail(f'nonpublic language unexpectedly public: {code}')
    for sid,routes in surfaces.items():
        if code in routes: fail(f'nonpublic language unexpectedly routable at {sid}: {code}')
contract=readiness.get('activation_contract',{}); required=set(contract.get('required_before_public',[])); expected={'static_route_equivalents_for_every_registered_public_surface','correct_html_lang_and_direction','language_specific_navigation_that_never_escapes_namespace','no_silent_macedonian_or_english_content_fallback','language_purity_gate','semantic_and_institutional_review','exact_head_ci_success','explicit_human_authority_for_that_exact_head'}
if required!=expected: fail('activation contract drifted')
if contract.get('after_approval')!='no_commits_before_merge': fail('post-approval freeze missing')
if 'independent_public_route_verification' not in contract.get('production_claim',''): fail('LIVE claim verification requirement missing')
print('Global language governance OK: 50 canon; 4 public MK/EN/FR/DE; 46 fail-closed; 57 surfaces with exact four-language route parity; DE operational state human_gated_public_pilot.')

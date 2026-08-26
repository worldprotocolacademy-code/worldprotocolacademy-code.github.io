#!/usr/bin/env python3
"""PRESERVE-FIRST source reconciliation for verified WPA legacy drift · 26 Aug 2026.

This script deliberately patches only confirmed, exact public-source strings. It does not
invent WP-009's v1.1 version-specific DOI; latest-facing references use the concept DOI
10.5281/zenodo.20641840 until the live v1.1 version DOI is captured.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def read(rel): return (ROOT/rel).read_text(encoding='utf-8')
def write(rel,text): (ROOT/rel).write_text(text,encoding='utf-8')

def patch_index():
    rel='index.html'; t=read(rel)
    t=t.replace('Доц. д-р Санде Смиљанов · Автор · Истражувач · Креатор на платформата · Вонреден професор','Доц. д-р Санде Смиљанов · Автор · Истражувач · Креатор на платформата')
    t=t.replace('Вонреден професор на International University Europa Prima.','Академска афилијација: International University Europa Prima.')
    t=t.replace('Associate Professor at International University Europa Prima.','Academic affiliation: International University Europa Prima.')
    t=t.replace('Assoc. Prof. Dr. Sande Smiljanov','Doc. Dr Sande Smiljanov').replace('Assoc. Prof. Dr Sande Smiljanov','Doc. Dr Sande Smiljanov')
    t=t.replace('Посебна порта за универзитети, библиотеки, дипломатски академии и стратешки институционални партнери на WPA.','Посебна порта за универзитети, библиотеки, дипломатски академии и потенцијални стратешки институционални соработници на WPA.')
    t=re.sub(r'(<div[^>]*>)(25)(</div>\s*<div[^>]+data-i18n="a_bibliography\.6")',r'\g<1>26\g<3>',t,count=1)
    t=re.sub(r'(<div[^>]*>)(5)(</div>\s*<div[^>]+data-i18n="a_bibliography\.7")',r'\g<1>6\g<3>',t,count=1)
    write(rel,t)

def patch_institute():
    rel='institute.html'; t=read(rel)
    reps={
      'Gemini, Claude/Opus,':'AI models,',
      'Gemini Omni / Video Workflow':'Video AI Workflow',
      'Claude / Opus Research Workflow':'Research AI Workflow',
      '>Декември 2026</span>':'>Ќе биде потврдено</span>',
      '>Hotel Inex Olgica</span>':'>Ќе биде потврдено</span>',
      '>Охрид, Северна Македонија</span>':'>Охрид, Северна Македонија · предложено / ќе биде потврдено</span>',
      '>Отворен интерес за учество</span>':'>Регистар за интерес е отворен · датумот и местото не се потврдени</span>',
      'Сите дванаесет WPA Working Papers се објавени како јавни Zenodo DOI записи: WP-001–WP-012.':'Сите тринаесет WPA Working Papers се објавени како јавни Zenodo DOI записи: WP-001–WP-013.'
    }
    for a,b in reps.items(): t=t.replace(a,b)
    write(rel,t)

def patch_index_locales():
    paths=[]
    for pat in ('*.json','index/*.json','locales/index/*.json','locales/locales/index/*.json'):
        paths.extend(ROOT.glob(pat))
    seen=set()
    for p in paths:
        if p in seen: continue
        seen.add(p)
        try: data=json.loads(p.read_text(encoding='utf-8'))
        except Exception: continue
        if not isinstance(data,dict): continue
        changed=False
        if 'a_bibliography.2' in data:
            data['a_bibliography.2']='Doc. Dr Sande Smiljanov · Author · Researcher · Platform Creator';changed=True
        if 'a_platform.16' in data:
            data['a_platform.16']='A dedicated gateway for universities, libraries, diplomatic academies and prospective institutional collaborators of WPA.';changed=True
        for k,v in list(data.items()):
            if isinstance(v,str):
                nv=v.replace('Assoc. Prof. Dr. Sande Smiljanov','Doc. Dr Sande Smiljanov').replace('Assoc. Prof. Dr Sande Smiljanov','Doc. Dr Sande Smiljanov')
                if nv!=v:data[k]=nv;changed=True
        if changed:p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def patch_institute_locales():
    for p in ROOT.glob('locales/institute/**/*.json'):
        try:data=json.loads(p.read_text(encoding='utf-8'))
        except Exception:continue
        if not isinstance(data,dict):continue
        lang=str((data.get('_meta') or {}).get('lang','')).lower();mk=lang=='mk';changed=False
        values={
          'institute.tools_hub.ai.text':('AI модели, аудио, видео, потекло на содржини, AI транспарентност и патоказ за човечка ревизија.' if mk else 'AI models, audio, video, content provenance, AI transparency and human-review workflows.'),
          'institute.ai.c1.title':'Video AI Workflow',
          'institute.ai.c2.title':'Research AI Workflow',
          'institute.opc.meta.date_value':('Ќе биде потврдено' if mk else 'To be confirmed'),
          'institute.opc.meta.venue_value':('Ќе биде потврдено' if mk else 'To be confirmed'),
          'institute.opc.meta.location_value':('Охрид, Северна Македонија · предложено / ќе биде потврдено' if mk else 'Ohrid, North Macedonia · proposed / to be confirmed'),
          'institute.opc.meta.status_value':('Регистар за интерес е отворен · датумот и местото не се потврдени' if mk else 'Interest register open · date and venue not confirmed'),
          'institute.publications.working_papers.text':('Сите тринаесет WPA Working Papers се објавени како јавни Zenodo DOI записи: WP-001–WP-013.' if mk else 'All thirteen WPA Working Papers are published as public Zenodo DOI records: WP-001–WP-013.')
        }
        for k,v in values.items():
            if k in data and data[k]!=v:data[k]=v;changed=True
        for k,v in list(data.items()):
            if isinstance(v,str):
                nv=v.replace('Gemini, Claude/Opus','AI models').replace('Gemini Omni / Video Workflow','Video AI Workflow').replace('Claude / Opus Research Workflow','Research AI Workflow')
                if nv!=v:data[k]=nv;changed=True
        if changed:p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def patch_bibliography():
    rel='bibliography/index.html';t=read(rel)
    t=t.replace('Assoc. Prof. Dr. Sande Smiljanov','Doc. Dr Sande Smiljanov').replace('assoc. prof. dr. sande smiljanov','doc. dr sande smiljanov')
    # WP-009: v1.1 is deposited; concept DOI is safe for latest-facing resolution.
    t=t.replace('english with macedonian abstract · v1.0 | author-reviewed final release doi 10.5281/zenodo.20641841','english with macedonian abstract · v1.1 | author-reviewed release concept doi 10.5281/zenodo.20641840 prior v1.0 version doi 10.5281/zenodo.20641841')
    old='<strong>2026</strong>  |  DPRK / PRC Protocol and Visual Statecraft Case Study · English with Macedonian abstract · v1.0  |  Author-Reviewed Final Release<br/>\n        DOI <a class="bib-link" href="https://doi.org/10.5281/zenodo.20641841" rel="noopener" target="_blank">10.5281/zenodo.20641841</a>'
    new='<strong>2026</strong>  |  DPRK / PRC Protocol and Visual Statecraft Case Study · English with Macedonian abstract · v1.1  |  Author-Reviewed Release<br/>\n        Concept DOI <a class="bib-link" href="https://doi.org/10.5281/zenodo.20641840" rel="noopener" target="_blank">10.5281/zenodo.20641840</a> · latest-version resolver<br/>\n        <span style="font-size:12px;color:var(--muted)">Prior v1.0 version DOI: 10.5281/zenodo.20641841. The v1.1 version-specific DOI is not asserted here until captured from the live Zenodo record.</span>'
    t=t.replace(old,new)
    # Rebalance 12-item distribution to 13 and add WP-013.
    m=re.search(r'(<div aria-label="Distribution of WPA Working Papers by type" class="zenodo-bar-segmented">)(.*?)(</div>\s*<div class="zenodo-legend">)',t,re.S)
    if m and 'data-wpa-wp013-segment' not in m.group(2):
        body=m.group(2).replace('width:16.67%','width:15.38%').replace('width:33.33%','width:30.77%').replace('width:8.33%','width:7.69%')
        body+='\n<div class="zenodo-seg seg-regional" data-wpa-wp013-segment="1" style="width:7.69%" title="Official Visit / India–North Macedonia Case Study: 1">1</div>\n'
        t=t[:m.start()]+m.group(1)+body+m.group(3)+t[m.end():]
    nato='''<div class="zenodo-legend-item">\n<span class="zenodo-legend-swatch sw-nato"></span>\n<span><strong>NATO Summit / Protocolometric Case Study · 1</strong><br/><span class="leg-papers">WP-012 Ankara 2026 — The Sealed Stage / Documentary Sovereignty / PSPI+</span></span>\n</div>\n<div class="zenodo-doi-line">'''
    india='''<div class="zenodo-legend-item">\n<span class="zenodo-legend-swatch sw-nato"></span>\n<span><strong>NATO Summit / Protocolometric Case Study · 1</strong><br/><span class="leg-papers">WP-012 Ankara 2026 — The Sealed Stage / Documentary Sovereignty / PSPI+</span></span>\n</div>\n<div class="zenodo-legend-item" data-wpa-wp013-category="1">\n<span class="zenodo-legend-swatch sw-regional"></span>\n<span><strong>Official Visit / India–North Macedonia Case Study · 1</strong><br/><span class="leg-papers">WP-013 Bridges, Not Barriers — President Droupadi Murmu official visit to North Macedonia</span></span>\n</div>\n<div class="zenodo-doi-line">'''
    if 'data-wpa-wp013-category' not in t:t=t.replace(nato,india,1)
    t=t.replace('Сите записи се Author-Reviewed Final Releases со трајни Zenodo DOI идентификатори.','Сите записи се author-reviewed public releases со трајни Zenodo DOI идентификатори.')
    write(rel,t)

def patch_working_papers():
    rel='working-papers/index.html';t=read(rel)
    old="meta:'Version 1.0 · English with Macedonian abstract · Published June 11, 2026 · Author-Reviewed Final Release',desc:"
    new="meta:'Version 1.1 · English with Macedonian abstract · Published June 15, 2026 · Author-Reviewed Release',desc:"
    t=t.replace(old,new,1)
    # Only replace the WP-009 array DOI, preserving prior formal v1.0 references elsewhere.
    pattern=r"(id:'009'.*?doi:')10\.5281/zenodo\.20641841('})"
    t=re.sub(pattern,r'\g<1>10.5281/zenodo.20641840\g<2>',t,count=1,flags=re.S)
    t=t.replace('WPA Working Papers 001–012<small>Author-reviewed Zenodo DOI records</small>','WPA Working Papers 001–012 · WP-013 in Current Canonical Corpus below<small>Author-reviewed Zenodo DOI records</small>',1)
    write(rel,t)

def verify():
    idx=read('index.html');inst=read('institute.html');bib=read('bibliography/index.html');wp=read('working-papers/index.html')
    assert 'Доц. д-р Санде Смиљанов · Автор · Истражувач · Креатор на платформата · Вонреден професор' not in idx
    assert 'Assoc. Prof. Dr. Sande Smiljanov' not in idx
    assert re.search(r'>26</div>\s*<div[^>]+data-i18n="a_bibliography\.6"',idx)
    assert re.search(r'>6</div>\s*<div[^>]+data-i18n="a_bibliography\.7"',idx)
    for token in ('Gemini Omni / Video Workflow','Claude / Opus Research Workflow','Сите дванаесет WPA Working Papers','Hotel Inex Olgica'):assert token not in inst,token
    assert 'WP-001–WP-013' in inst
    assert 'Doc. Dr Sande Smiljanov' in bib
    assert 'data-wpa-wp013-category="1"' in bib
    assert 'v1.1' in bib and '10.5281/zenodo.20641840' in bib
    assert "id:'009'" in wp and "Version 1.1" in wp and '10.5281/zenodo.20641840' in wp

if __name__=='__main__':
    patch_index();patch_institute();patch_index_locales();patch_institute_locales();patch_bibliography();patch_working_papers();verify()
    print('WPA final source reconciliation applied successfully.')

from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DOI = '10.5281/zenodo.22749104'
DOI_URL = 'https://doi.org/' + DOI
TITLE_EN = 'New Delhi 2026: The Two-Tier Stage? A Prospective Protocol Study of Membership, Partnership and Absence at the 18th BRICS Summit'
TITLE_MK = 'Њу Делхи 2026: Двостепената сцена? Проспективна протоколарна студија за членството, партнерството и отсуството на 18. Самит на БРИКС'
ABSTRACT = ('A prospective, two-phase protocol study of the 18th BRICS Summit in New Delhi, separating pre-specified Phase A from observed Phase B. '
            'The study applies a Protocol Fidelity Index sensitivity analysis and finds stronger support for a multi-layered protocol architecture characterised by selective permeability and status-access decoupling than for a simple two-tier hierarchy.')
DATE_EN = '14 September 2026'
DATE_ISO = '2026-09-14'


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding='utf-8')


def replace_all(t, pairs):
    for a, b in pairs:
        t = t.replace(a, b)
    return t


def patch_working_papers():
    path = 'working-papers/index.html'
    t = read(path)
    t = replace_all(t, [
        ('Canonical WPA Zenodo publication index: 13 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan by Sande Smiljanov / World Protocol Academy — 23 public records as of 26 August 2026.',
         'Canonical WPA Zenodo publication index: 14 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan by Sande Smiljanov / World Protocol Academy — 24 public records as of 14 September 2026.'),
        ('Canonical public WPA Zenodo DOI index: 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23 records as of 26 August 2026.',
         'Canonical public WPA Zenodo DOI index: 14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 24 records as of 14 September 2026.'),
        ('Working Papers 001–013 · Protocol Notes 001–009 · Strategic Plan', 'Working Papers 001–014 · Protocol Notes 001–009 · Strategic Plan'),
        ('23 public Zenodo records: 13 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan', '24 public Zenodo records: 14 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan'),
        ('as of 26 August 2026', 'as of 14 September 2026'),
        ('13 Working Papers + 9 Protocol Notes + 1 Strategic Plan', '14 Working Papers + 9 Protocol Notes + 1 Strategic Plan'),
        ('All 23 indexed WPA Zenodo records — 13 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan', 'All 24 indexed WPA Zenodo records — 14 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan'),
        ('Последно ажурирано: 26 август 2026', 'Последно ажурирано: 14 септември 2026'),
        ('Last updated: 26 August 2026', 'Last updated: 14 September 2026'),
    ])
    # Add jump link.
    if 'href="#wp014"' not in t:
        t = t.replace('<a class="jump-link" href="#wp012">WP-012</a>', '<a class="jump-link" href="#wp012">WP-012</a><a class="jump-link" href="#wp014">WP-014</a>', 1)
    # Add WP-014 to JS data array immediately after WP-012.
    if "id:'014'" not in t:
        marker = "{id:'012',"
        start = t.find(marker)
        if start == -1:
            raise SystemExit('WP-012 array marker not found')
        end = t.find("},\n", start)
        if end == -1:
            raise SystemExit('WP-012 array end not found')
        end += 3
        obj = ("{id:'014',mk:" + repr(TITLE_MK) + ",en:" + repr(TITLE_EN) + ",type:'BRICS Summit / Prospective Protocol Case Study',"
               "meta:'Version v1.2 · Bilingual MK / EN · Published 14 September 2026 · 91 pages · FINAL LOCK',"
               "desc:" + repr(ABSTRACT) + ",doi:'" + DOI + "'},\n")
        t = t[:end] + obj + t[end:]
    # Promote divider wording to full canonical range.
    t = t.replace('WPA Working Papers 001–012 · WP-013 in Current Canonical Corpus below', 'WPA Working Papers 001–014 · Canonical Zenodo DOI Series')
    t = t.replace('WPA Working Papers 001–012', 'WPA Working Papers 001–014')
    write(path, t)


def bibliography_entry():
    return f'''\n<!-- WP-014 -->\n<div class="bib-entry" data-doi="{DOI}" data-index="doi zenodo brics protocol-fidelity evidence-provenance" data-search="wp-014 new delhi 2026 brics two-tier stage prospective protocol membership partnership absence protocol fidelity selective permeability status-access decoupling {DOI}" data-title="{TITLE_EN}" data-type="working-paper" data-year="2026" id="wp-014">\n<div class="bib-num">WP-014</div>\n<div class="bib-mk">{TITLE_MK}</div>\n<div class="bib-en">{TITLE_EN}</div>\n<div class="bib-meta"><strong>2026</strong> &nbsp;|&nbsp; WPA Working Paper No. 014 · Version v1.2 · Bilingual MK/EN · 91 pages · Published 14 September 2026 · FINAL LOCK<br/>DOI <a class="bib-link" href="{DOI_URL}" rel="noopener" target="_blank">{DOI}</a></div>\n<div class="bib-tags"><span class="bib-tag">Working Paper</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag blue">BRICS</span><span class="bib-tag purple">Protocol Fidelity</span><span class="bib-tag">Evidence Provenance</span></div>\n<div class="bib-links"><a class="bib-link-btn" href="{DOI_URL}" rel="noopener" target="_blank">Zenodo record →</a><a class="bib-link-btn" href="/scholar/wpa-wp-014.html">Scholar record →</a></div>\n<div class="bib-entry-tools"><button class="bib-mini-btn cite-btn" type="button">Copy APA Citation</button><button class="bib-mini-btn link-btn" type="button">Copy Deep Link</button><span aria-live="polite" class="bib-copy-status"></span></div>\n</div>\n'''


def patch_bibliography():
    path = 'bibliography/index.html'
    t = read(path)
    t = replace_all(t, [
        ('13 WPA Working Papers (Zenodo DOI)', '14 WPA Working Papers (Zenodo DOI)'),
        ('23 Total WPA Zenodo Records', '24 Total WPA Zenodo Records'),
        ('◆ 23 WPA Zenodo Records · 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan', '◆ 24 WPA Zenodo Records · 14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan'),
        ('Следните тринаесет working papers', 'Следните четиринаесет working papers'),
        ('Тринаесетте WPA Working Papers', 'Четиринаесетте WPA Working Papers'),
        ('<strong>13</strong>\n<span>Zenodo DOI записи</span>', '<strong>14</strong>\n<span>Zenodo DOI записи</span>'),
        ('<strong>13</strong>\n<span>WPA Working Papers Series</span>', '<strong>14</strong>\n<span>WPA Working Papers Series</span>'),
        ('<strong>13/13</strong>', '<strong>14/14</strong>'),
        ('<strong>DOI coverage: 13 Zenodo records</strong>', '<strong>DOI coverage: 14 Zenodo records</strong>'),
        ('Тринаесетте WPA Working Papers (Zenodo) се веќе објавени', 'Четиринаесетте WPA Working Papers (Zenodo) се веќе објавени'),
    ])
    if 'id="wp-014"' not in t:
        wp13 = t.find('id="wp-013"')
        if wp13 == -1:
            raise SystemExit('WP-013 bibliography entry not found')
        close = t.find('</div>', wp13)
        # Find the end of the complete outer entry by stepping through div balance.
        pos = t.rfind('<div', 0, wp13)
        depth = 0
        i = pos
        end = None
        token = re.compile(r'<div\b|</div>')
        for m in token.finditer(t, pos):
            if m.group(0).startswith('<div'):
                depth += 1
            else:
                depth -= 1
                if depth == 0:
                    end = m.end()
                    break
        if end is None:
            raise SystemExit('Cannot locate end of WP-013 bibliography entry')
        t = t[:end] + bibliography_entry() + t[end:]
    write(path, t)


def scholar_record():
    return f'''<!doctype html><html lang="en"><head>\n<script defer src="/scripts/wpa-analytics.js?v=20260909-2"></script>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>{TITLE_EN} | WPA Scholar Record</title>\n<meta name="description" content="Canonical WPA Scholar record for {TITLE_EN}."><meta name="robots" content="index, follow">\n<link rel="canonical" href="https://worldprotocolacademy.mk/scholar/wpa-wp-014.html"><link rel="author" href="https://orcid.org/0009-0008-3219-394X">\n<meta name="citation_title" content="{TITLE_EN}"><meta name="citation_author" content="Smiljanov, Sande"><meta name="citation_publication_date" content="2026/09/14"><meta name="citation_doi" content="{DOI}"><meta name="citation_technical_report_institution" content="World Protocol Academy"><meta name="citation_technical_report_number" content="WPA Working Paper No. 014"><meta name="DC.identifier" content="doi:{DOI}">\n<style>:root{{--navy:#162947;--gold:#9a7728;--bg:#f6f2eb;--text:#1d2430;--muted:#5a6577;--line:#ddd3c3}}*{{box-sizing:border-box}}body{{margin:0;font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text);line-height:1.65}}.wrap{{max-width:980px;margin:auto;padding:32px 20px}}.top{{background:var(--navy);color:#fff}}.top a{{color:#f4d697}}h1{{font-size:clamp(28px,4vw,46px);line-height:1.12}}a{{color:#795b12;font-weight:700}}.card{{background:#fff;border:1px solid var(--line);border-left:5px solid var(--gold);border-radius:12px;padding:18px;margin:18px 0}}.meta{{display:grid;grid-template-columns:190px 1fr;gap:8px 16px}}.small{{font-size:14px;color:var(--muted)}}@media(max-width:650px){{.meta{{grid-template-columns:1fr}}}}</style></head><body>\n<section class="top"><div class="wrap"><div>World Protocol Academy · Canonical Scholar Record</div><h1>{TITLE_EN}</h1><div>WPA Working Paper No. 014 · Sande Smiljanov · 2026</div><p><a href="/scholar/">Scholar Index</a> · <a href="/working-papers/">WPA Working Paper Index</a> · <a href="/bibliography/">Official Bibliography</a></p></div></section>\n<main class="wrap"><article class="card"><div class="meta"><b>Series</b><span>WPA Working Paper</span><b>Number</b><span>014</span><b>Author</b><span>Smiljanov, Sande</span><b>Published</b><span>14 September 2026</span><b>Version</b><span>v1.2 · FINAL LOCK</span><b>Pages</b><span>91</span><b>Languages</b><span>Macedonian, English</span><b>DOI</b><span><a href="{DOI_URL}">{DOI}</a></span></div></article><article class="card"><b>Abstract.</b> {ABSTRACT}</article><article class="card"><b>Indexing note.</b> This record exposes the permanent version DOI and preserves the WPA rule that research-series records are separate from the 26 academic publications in the official bibliography.</article></main></body></html>'''


def patch_scholar():
    write('scholar/wpa-wp-014.html', scholar_record())
    path = 'scholar/index.html'
    t = read(path)
    t = t.replace('19 distinct academic papers/contributions · 13 WPA Working Papers · 9 WPA Protocol Notes', '19 distinct academic papers/contributions · 14 WPA Working Papers · 9 WPA Protocol Notes')
    t = t.replace('<h2>WPA Working Papers · 13</h2>', '<h2>WPA Working Papers · 14</h2>')
    if 'wpa-wp-014.html' not in t:
        needle = '<div class="item"><a href="wpa-wp-013.html">'
        start = t.find(needle)
        if start == -1: raise SystemExit('WP-013 scholar item not found')
        end = t.find('</div></div>', start)
        if end == -1: raise SystemExit('WP-013 scholar item end not found')
        end += len('</div></div>')
        item = f'<div class="item"><a href="wpa-wp-014.html">{TITLE_EN}</a><div class="small">WPA Working Paper 014 · DOI {DOI}</div></div>'
        t = t[:end] + item + t[end:]
    write(path, t)

    ris = read('wpa-scholar-records-2026.ris')
    if DOI not in ris:
        entry = f'\nTY  - RPRT\nTI  - {TITLE_EN}\nAU  - Smiljanov, Sande\nPY  - 2026\nDA  - 2026/09/14\nM3  - WPA Working Paper No. 014\nDO  - {DOI}\nUR  - https://worldprotocolacademy.mk/scholar/wpa-wp-014.html\nER  - \n'
        ris += entry
        write('wpa-scholar-records-2026.ris', ris)
    bib = read('wpa-scholar-records-2026.bib')
    if DOI not in bib:
        entry = f'''\n@techreport{{wpawp0142026,\n  title = {{{TITLE_EN}}},\n  author = {{Smiljanov, Sande}},\n  year = {{2026}},\n  month = {{September}},\n  institution = {{World Protocol Academy}},\n  number = {{WPA Working Paper No. 014}},\n  doi = {{{DOI}}},\n  url = {{https://worldprotocolacademy.mk/scholar/wpa-wp-014.html}}\n}}\n'''
        write('wpa-scholar-records-2026.bib', bib + entry)
    sm = read('sitemap-scholar.xml')
    if 'wpa-wp-014.html' not in sm:
        loc = '  <url><loc>https://worldprotocolacademy.mk/scholar/wpa-wp-014.html</loc><lastmod>2026-09-14</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n'
        sm = sm.replace('</urlset>', loc + '</urlset>')
        write('sitemap-scholar.xml', sm)


def patch_json_metrics(path):
    p = ROOT / path
    data = json.loads(p.read_text(encoding='utf-8'))
    z = data.get('zenodo_corpus') or data.get('zenodo_doi_corpus')
    if not z: raise SystemExit(f'No Zenodo corpus in {path}')
    z['total_records'] = 24
    z['working_papers'] = 14
    if 'equation' in z: z['equation'] = '14 + 9 + 1 = 24'
    if 'counting_rule' in z: z['counting_rule'] = '14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 24 public Zenodo records; this corpus is not added to the 26 academic-publication count'
    if 'reconciled_on' in z: z['reconciled_on'] = DATE_ISO
    if 'reconciliation_note' in z: z['reconciliation_note'] = 'WP-014 was published on 14 September 2026 under DOI 10.5281/zenodo.22749104; the current /working-papers/ canonical DOI index governs this metric.'
    data['updated'] = DATE_ISO
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def patch_metrics_surface():
    path = 'wpa-metrics-status.html'
    t = read(path)
    t = re.sub(r'(<strong id="zenodoTotal">)23(</strong>)', r'\g<1>24\2', t)
    t = t.replace('13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan', '14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan')
    t = t.replace('13 Working Papers', '14 Working Papers')
    write(path, t)


def patch_supporting_surfaces():
    # papers.html: only current corpus statements, not historical source examples.
    path = 'papers.html'
    t = read(path)
    t = t.replace('13 Working Papers and 9 Protocol Notes', '14 Working Papers and 9 Protocol Notes')
    t = t.replace('22 public DOI records: 13 Working Papers and 9 Protocol Notes', '23 public DOI records: 14 Working Papers and 9 Protocol Notes')
    t = t.replace('23 public Zenodo records', '24 public Zenodo records')
    write(path, t)

    path = 'scripts/site_quality_check.py'
    t = read(path)
    t = t.replace('"total_records": 23', '"total_records": 24').replace('"working_papers": 13', '"working_papers": 14')
    write(path, t)

    for path in ['README.md']:
        t = read(path)
        t = t.replace('23 public Zenodo records** = 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan', '24 public Zenodo records** = 14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan')
        write(path, t)


def runtime_js():
    return f'''/* WPA WP-014 canonical runtime reconciliation · 2026-09-14 */\n(function(){{\n'use strict';\nif(window.__WPA_WP014_SYNC_20260914__)return;window.__WPA_WP014_SYNC_20260914__=true;\nvar DOI='{DOI}',URL='{DOI_URL}';\nfunction p(){{return String(location.pathname||'/').toLowerCase().replace(/\\/+$/,'')||'/';}}\nfunction textFix(root){{if(!root||!document.createTreeWalker||typeof NodeFilter==='undefined')return;var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{{acceptNode:function(n){{var t=n.parentNode&&n.parentNode.nodeName;return /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|OPTION)$/.test(t)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}}}}),n;while((n=w.nextNode())){{var s=String(n.nodeValue||'');s=s.replace(/13 Working Papers \+ 9 Protocol Notes \+ 1 (?:Global )?Strategic Plan/g,'14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan').replace(/23 public Zenodo records/g,'24 public Zenodo records').replace(/13 WPA Working Papers \(Zenodo DOI\)/g,'14 WPA Working Papers (Zenodo DOI)').replace(/Следните тринаесет working papers/g,'Следните четиринаесет working papers').replace(/Тринаесетте WPA Working Papers/g,'Четиринаесетте WPA Working Papers');if(s!==n.nodeValue)n.nodeValue=s;}}}}\nfunction bibliography(){{if(p()!=='/bibliography'&&p()!=='/bibliography/index.html')return;var line=document.querySelector('.zenodo-doi-line');if(line)line.innerHTML='<strong>DOI coverage: 14 Zenodo records</strong> · Сите записи се author-reviewed public releases со трајни Zenodo DOI идентификатори.';var bar=document.querySelector('.zenodo-bar-segmented');if(bar&&!bar.querySelector('[data-wpa-wp014-segment]')){{var s=document.createElement('div');s.className='zenodo-seg seg-regional';s.dataset.wpaWp014Segment='1';s.style.width='7.14%';s.title='BRICS Summit / Prospective Protocol & Protocol Fidelity Case Study: 1';s.textContent='1';bar.appendChild(s);Array.from(bar.querySelectorAll('.zenodo-seg')).forEach(function(x){{if(x!==s)x.style.width='7.14%';}});}}var legend=document.querySelector('.zenodo-legend');if(legend&&!legend.querySelector('[data-wpa-wp014-category]')){{var i=document.createElement('div');i.className='zenodo-legend-item';i.dataset.wpaWp014Category='1';i.innerHTML='<span class="zenodo-legend-swatch sw-regional"></span><span><strong>BRICS Summit / Prospective Protocol & Protocol Fidelity Case Study · 1</strong><br><span class="leg-papers">WP-014 New Delhi 2026 — PFI · Selective Permeability · Status–Access Decoupling</span></span>';legend.appendChild(i);}}}}\nfunction metrics(){{if(p()!=='/wpa-metrics-status.html')return;var z=document.getElementById('zenodoTotal');if(z)z.textContent='24';}}\nfunction boot(){{textFix(document.body);bibliography();metrics();}}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{{once:true}});else boot();setTimeout(boot,600);setTimeout(boot,1600);\n}})();\n'''


def patch_runtime_loader():
    write('scripts/wpa-wp014-runtime-sync-20260914.js', runtime_js())
    path = 'scripts/wpa-performance-core.js'
    t = read(path)
    loader = "addScript('wpa-wp014-sync-20260914','/scripts/wpa-wp014-runtime-sync-20260914.js?v=20260914-1');"
    if loader not in t:
        t = t.replace("addScript('wpa-pwa-register','/scripts/wpa-pwa-register.js?v=1')", "addScript('wpa-pwa-register','/scripts/wpa-pwa-register.js?v=1');" + loader)
    write(path, t)


def write_reference_note():
    note = f'''# WPA Canonical Publication Reference State — 14 September 2026\n\n- Academic corpus: **26 publications** = 6 monographs/handbooks + 1 doctoral dissertation + 19 scientific papers/contributions.\n- WPA Zenodo corpus: **24 public records** = 14 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan.\n- Latest Working Paper: **WPA-WP-014**, v1.2, 91 pages, bilingual MK/EN.\n- Version DOI: **{DOI}**.\n- Publication date: **14 September 2026**.\n- License: **CC BY-NC-ND 4.0**.\n\nThe two corpora remain separate. WP-014 does not increase the 26-publication academic corpus count.\n'''
    write('docs/WPA_CANONICAL_REFERENCE_STATE_2026-09-14.md', note)


def main():
    patch_working_papers()
    patch_bibliography()
    patch_scholar()
    patch_json_metrics('data/wpa-canonical-public-facts.json')
    patch_json_metrics('data/wpa-canonical-metrics-status.json')
    patch_metrics_surface()
    patch_supporting_surfaces()
    patch_runtime_loader()
    write_reference_note()
    print('WP-014 canonical synchronization prepared.')

if __name__ == '__main__':
    main()

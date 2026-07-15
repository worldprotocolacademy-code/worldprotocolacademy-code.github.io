#!/usr/bin/env python3
from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[1]

def rd(p): return p.read_text(encoding='utf-8')
def wr(p,s): p.write_text(s,encoding='utf-8',newline='\n')
def rep(s,a,b,label,n=1):
 c=s.count(a)
 if c!=n: raise SystemExit(f'{label}: expected {n}, found {c}')
 return s.replace(a,b)
def rx1(s,p,r,label):
 s,c=re.subn(p,r,s,count=1,flags=re.S)
 if c!=1: raise SystemExit(f'{label}: expected 1, found {c}')
 return s

def institute():
 p=R/'institute.html'; s=rd(p)
 pairs=[
 ('WPA Working Papers 001–009','WPA Working Papers 001–012','Institute heading 009'),
 ('WPA работните трудови 001–009 се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003, WP-004, WP-005, WP-006, WP-007, WP-008 и WP-009.','WPA работните трудови 001–012 се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003, WP-004, WP-005, WP-006, WP-007, WP-008, WP-009, WP-010, WP-011 и WP-012.','Institute MK list'),
 ('WPA работни трудови 001–004','WPA работни трудови 001–012','Institute MK heading 004'),
 ('Првите четири WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003 и WP-004.','Дванаесет WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001–WP-012.','Institute MK summary'),
 ('WPA Working Papers 001–004','WPA Working Papers 001–012','Institute EN heading 004'),
 ('The first four WPA Working Papers are published as public Zenodo DOI records: WP-001, WP-002, WP-003 and WP-004.','Twelve WPA Working Papers are published as public Zenodo DOI records: WP-001–WP-012. The WPA Zenodo corpus comprises 12 Working Papers and 2 published Protocol Notes, for 14 published WPA Zenodo DOI records; it is separate from the 25-publication academic corpus.','Institute EN summary')]
 for a,b,l in pairs:s=rep(s,a,b,l)
 wr(p,s)

def papers():
 p=R/'papers.html';s=rd(p)
 pairs=[
 ('19 papers • 11 WPA Working Papers • 2 Protocol Notes • Open PDF access','19 papers • 12 WPA Working Papers • 2 Protocol Notes • 14 WPA Zenodo DOI records • Open PDF access','Papers topbar'),
 ('<li><strong>11 WPA Working Papers</strong> with Zenodo DOI records</li>','<li><strong>12 WPA Working Papers</strong> with Zenodo DOI records</li>','Papers snapshot'),
 ('<li><strong>2 WPA Protocol Notes</strong> with Zenodo DOI records</li>','<li><strong>2 WPA Protocol Notes</strong> with Zenodo DOI records</li>\n            <li><strong>14 total WPA Zenodo DOI records</strong> across the two WPA series, separate from the 25-publication academic corpus</li>','Papers corpus'),
 ('<article class="stat-card"><strong>11</strong><span>WPA Working Papers · Zenodo DOI</span></article>','<article class="stat-card"><strong>12</strong><span>WPA Working Papers · Zenodo DOI</span></article>','Papers stat'),
 ('Eleven WPA Working Papers — open access via Zenodo.','Twelve WPA Working Papers — open access via Zenodo.','Papers heading'),
 ('more than 500 pages across eleven working papers.','more than 500 pages across twelve working papers.','Papers volume'),
 ('Последно ажурирано: 22 јуни 2026 · Last updated: 22 June 2026','Последно ажурирано: 15 јули 2026 · Last updated: 15 July 2026','Papers date')]
 for a,b,l in pairs:s=rep(s,a,b,l)
 s=rx1(s,r'\n\s*<section>\s*<div class="container">\s*<div class="note-card">\s*<h4>Important implementation note</h4>.*?</section>','', 'Developer note')
 if 'WP-012 · NATO Summit / Protocolometric Case Study' in s or '10.5281/zenodo.21299485' in s:raise SystemExit('WP-012 duplicate guard')
 card='''          <article class="card" data-wpa-wp="012">
            <span class="small-kicker">WP-012 · NATO Summit / Protocolometric Case Study</span>
            <h4 class="paper-title">Ankara 2026: The Sealed Stage — Protocol, Documentary Sovereignty and Visibility Gatekeeping at the 36th NATO Summit</h4>
            <p class="paper-summary">Bilingual MK/EN · v2.5 Final Deposit Lock / QA-Audited Edition · Evidence Ladder+ · PSPI+ · Host Lens Sovereignty · Protocol Afterlife.</p>
            <div class="paper-tags"><span class="tag">NATO Summit</span><span class="tag">PSPI+</span><span class="tag">Sealed Stage</span></div>
            <div class="paper-actions"><a class="btn btn-secondary" href="https://doi.org/10.5281/zenodo.21299485" target="_blank" rel="noopener">→ Zenodo DOI</a></div>
          </article>'''
 s=rx1(s,r'(<article class="card">\s*<span class="small-kicker">WP-011\b.*?</article>)',lambda m:m.group(1)+'\n\n'+card,'Insert WP-012')
 a='''            They are not merged into the Working Papers series.
          </p>'''
 b='''            They are not merged into the Working Papers series.
          </p>
          <p><strong>Publication status:</strong> PN-001 and PN-002 are published Zenodo DOI records. WPA-PN-003 remains a working draft in authorial review, has no public DOI claim, and is not counted among the 14 published WPA Zenodo records.</p>'''
 s=rep(s,a,b,'PN-003 status')
 wr(p,s)

def locale(rel,lang):
 p=R/rel;d=json.loads(rd(p));pairs={'mk':{'WPA работни трудови 001–004':'WPA работни трудови 001–012','Првите четири WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003 и WP-004.':'Дванаесет WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001–WP-012.'},'en':{'WPA Working Papers 001–004':'WPA Working Papers 001–012','The first four WPA Working Papers are published as public Zenodo DOI records: WP-001, WP-002, WP-003 and WP-004.':'Twelve WPA Working Papers are published as public Zenodo DOI records: WP-001–WP-012.'}}[lang]
 hit={k:0 for k in pairs}
 for k,v in list(d.items()):
  if isinstance(v,str):
   for a,b in pairs.items():
    if a in v:d[k]=v.replace(a,b);hit[a]+=1
 if any(v!=1 for v in hit.values()):raise SystemExit(f'{rel}: locale assertion {hit}')
 if isinstance(d.get('_meta'),dict):d['_meta']['updated']='2026-07-15';d['_meta']['changelog_v1_7']='Publication-integrity alignment: WP-001–WP-012.'
 wr(p,json.dumps(d,ensure_ascii=False,indent=2)+'\n')

def verify():
 s=rd(R/'institute.html')+'\n'+rd(R/'papers.html')
 stale=['WPA Working Papers 001–009','WPA работни трудови 001–004','Првите четири WPA работни трудови','WPA Working Papers 001–004','The first four WPA Working Papers','19 papers • 11 WPA Working Papers','<strong>11 WPA Working Papers</strong>','Eleven WPA Working Papers','across eleven working papers','Important implementation note']
 if any(x in s for x in stale):raise SystemExit('Stale publication text remains')
 p=rd(R/'papers.html');i=rd(R/'institute.html')
 if p.count('WP-012 · NATO Summit / Protocolometric Case Study')!=1 or p.count('10.5281/zenodo.21299485')!=1:raise SystemExit('WP-012 uniqueness failed')
 if 'WPA-PN-003 remains a working draft in authorial review' not in p or '14 published WPA Zenodo DOI records' not in i:raise SystemExit('Status verification failed')

institute();papers()
for x,l in [('locales/institute/mk.json','mk'),('locales/institute/en.json','en'),('locales/institute/locales/institute/mk.json','mk'),('locales/institute/locales/institute/en.json','en')]:locale(x,l)
verify();print('Publication-integrity static patch applied and verified.')

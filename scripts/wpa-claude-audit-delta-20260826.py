from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATE_MK = '26 август 2026'
DATE_EN = '26 August 2026'


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def patch_index():
    p = 'index.html'
    t = read(p)
    t = t.replace('5 монографии, 1 дисертација, 19 научни трудови и прилози и сериозна академска интелектуална база.',
                  '6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 академски публикации, со посебен WPA Zenodo корпус.')
    # Add a canonical metric bridge if not already present.
    if 'data-wpa-bib-metrics="20260826"' not in t:
        marker = '<section id="publications" class="accent">'
        block = '''<section class="accent" data-wpa-bib-metrics="20260826" aria-label="Canonical WPA publication metrics">
  <div class="container">
    <div class="section-label">Canonical publication metrics · 26 August 2026</div>
    <h3 class="section-title">26 академски публикации · 23 WPA Zenodo записи</h3>
    <p class="section-lead">Канонската библиографија на WPA е извор на вистината за публикациските бројки: <strong>6 монографии и прирачници + 1 докторска дисертација + 19 трудови/прилози = 26 академски публикации</strong>. Одделниот WPA Zenodo корпус содржи <strong>13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23 записи</strong>.</p>
    <p><a class="btn btn-outline btn-sm" href="/bibliography/">Официјална библиографија →</a> <a class="btn btn-outline btn-sm" href="/working-papers/">WPA Zenodo индекс →</a></p>
  </div>
</section>\n'''
        if marker in t:
            t = t.replace(marker, block + marker, 1)
    write(p, t)


def patch_institute():
    p = 'institute.html'
    t = read(p)
    t = t.replace('Доктрина на креатор на платформатаот', 'Доктрина на креаторот на платформата')
    t = t.replace('Kako WPA ги претвора јавните докази', 'Како WPA ги претвора јавните докази')
    t = t.replace('"email": "info@worldprotocolacademy.mk"', '"email": "institute@worldprotocolacademy.mk"')
    t = t.replace('href="mailto:info@worldprotocolacademy.mk">info@worldprotocolacademy.mk</a>\n<span class="topbar-quicklinks"', 'href="mailto:institute@worldprotocolacademy.mk">institute@worldprotocolacademy.mk</a>\n<span class="topbar-quicklinks"', 1)
    t = t.replace('data-i18n="institute.cta.contact" href="mailto:info@worldprotocolacademy.mk">Контакт</a>', 'data-i18n="institute.cta.contact" href="mailto:institute@worldprotocolacademy.mk">Контакт</a>')

    # Explicit WPA > Institute hierarchy line.
    if 'data-wpa-hierarchy="20260826"' not in t:
        needle = '<section id="identity">\n<div class="container">'
        repl = '''<section id="identity">
<div class="container">
<p data-wpa-hierarchy="20260826" style="margin:0 0 20px;padding:13px 16px;border-left:4px solid var(--gold);background:rgba(201,168,76,.08);font-size:14px;color:var(--ink-soft)"><strong>Институционална хиерархија:</strong> WPA Institute е специјализираната истражувачка, методолошка и аналитичка рамка во рамките на World Protocol Academy. <span lang="en">WPA Institute is the specialised research, methodological and analytical framework within World Protocol Academy.</span></p>'''
        t = t.replace(needle, repl, 1)

    # PSPI/IPMM expansion and nomenclature cleanup.
    t = t.replace('<h3>PSPI · ИПММ<span class="wpaid-en">Protocol State Performance Index</span></h3>',
                  '<h3>PSPI · ИПММ<span class="wpaid-en">WPA Protocol Soft Power Index · Индекс на протоколарна мека моќ</span></h3>')

    # Sublimate is a real PREVIEW surface; expose it carefully in the ecosystem gateway only.
    if 'WPA Sublimate Engine · PREVIEW' not in t:
        needle = '<div class="domain-card"><div class="domain-tag">Learning tools</div><h3>Student Desk & Professional Tools</h3>'
        block = '''<div class="domain-card"><div class="domain-tag">PREVIEW</div><h3>WPA Sublimate Engine · PREVIEW</h3><p>Изолиран генератор за детерминистички WPA аналитички документи. Source package v0.3.0 е валидиран; Cloudflare production deployment и authenticated smoke test остануваат pending.</p><p><a href="wpa-sublimate-engine.html">Open preview →</a></p></div>
'''
        t = t.replace(needle, block + needle, 1)

    # AAB: no invented member names; publish criteria and status discipline.
    if 'data-wpa-aab-criteria="20260826"' not in t:
        needle = '<h3 data-i18n="institute.aab.subtitle">Структура и улога</h3>'
        block = '''<div data-wpa-aab-criteria="20260826" style="margin:18px 0;padding:16px 18px;background:var(--parchment-soft);border-left:4px solid var(--gold);font-size:13.5px;line-height:1.7">
<strong>Статус и критериуми · Status & criteria.</strong> AAB е во фаза на формирање. Членови не се именуваат јавно пред писмено прифаќање. Приоритетни профили: универзитетски професори/истражувачи, поранешни или актуелни професионалци со релевантна протоколарна/дипломатска експертиза, безбедносни и јавнокомуникациски експерти, со способност за независен методолошки преглед и декларација на конфликт на интереси. Поканите и прифаќањата се евидентираат преку governance decision log; јавниот состав се објавува само по формално прифаќање.
</div>'''
        t = t.replace(needle, needle + block, 1)

    # Flagship output: PSPI has DOI-backed applications.
    if 'data-wpa-flagship-output="20260826"' not in t:
        needle = '<section id="analytics-centre">\n<div class="container">'
        repl = '''<section id="analytics-centre">
<div class="container">
<div data-wpa-flagship-output="20260826" style="margin-bottom:24px;padding:15px 18px;border:1px solid var(--grey-line);border-left:4px solid var(--gold);background:#fff"><strong>Verified flagship output:</strong> PSPI / WPA Protocol Soft Power Index is already applied in DOI-backed WPA case studies. This is a published analytical output, distinct from the still-developing Institute Index methodology. <a href="/bibliography/#zenodo-working-papers">Open DOI-backed case-study corpus →</a></div>'''
        t = t.replace(needle, repl, 1)

    # Remove stale duplicate legacy PN-001–003 content that survived the earlier regex replacement.
    t = re.sub(r'\n<h3>WPA Protocol Notes 001–003</h3>.*?<p style="margin-top:14px"><a href="https://doi\.org/10\.5281/zenodo\.21390763".*?</p>\n', '\n', t, count=1, flags=re.S)

    # Current exact canonical counts are now verified; expose them with a source link.
    old = 'Канонскиот јавен DOI корпус на WPA ги опфаќа Working Papers, Protocol Notes и други DOI-врзани изданија. Овој блок намерно не користи рачно закован вкупен број: тековната состојба се чита од канонските Publications / Working Papers / Protocol Notes индекси, со што се спречува верзиски дрифт.'
    new = 'Канонскиот јавен WPA Zenodo корпус на 26 август 2026 содржи <strong>23 записи: 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan</strong>. Официјалната библиографија останува извор на вистината за бројките и идните дополнувања.'
    t = t.replace(old, new)

    write(p, t)


def wp13_entry():
    return '''<article class="paper-card latest-record" id="wp013"><div class="paper-top"><div><div class="paper-id">WPA-WP-2026-013</div><h3 class="paper-title-mk">Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија</h3><div class="paper-title-en">Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia</div></div><span class="paper-type">WPA Working Paper</span></div><div class="paper-meta">Version v14 · Bilingual MK/EN · 29 pages · 2026</div><p class="paper-desc">Official WPA Working Paper No. 013. Author-reviewed public Zenodo release.</p><div class="doi-row"><a class="doi" href="https://doi.org/10.5281/zenodo.21514266" target="_blank" rel="noopener">10.5281/zenodo.21514266</a><a class="btn btn-gold" href="https://doi.org/10.5281/zenodo.21514266" target="_blank" rel="noopener">Zenodo</a></div></article>'''


def pn_entries_html():
    entries = [
        ('004','МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест','MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test','Version 1.10 · Bilingual MK/EN','10.5281/zenodo.21469146'),
        ('005','Протокол на вештачката интелигенција и државниот суверенитет','Protocol of Artificial Intelligence and State Sovereignty','Version 1.6 · Bilingual MK/EN','10.5281/zenodo.21651611'),
        ('006','Невропротокол 2030: Од мисла до дејство','Neuroprotocol 2030: From Thought to Action','Version 1.6 · Bilingual MK/EN','10.5281/zenodo.21669195'),
        ('007','Течен протокол и ВИ-агенти: Од статичен код до динамична дипломатија','Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy','Version v1.9.2 · Bilingual MK/EN · 27 pages','10.5281/zenodo.21772500'),
        ('008','Мултиагентска дипломатија: Мандат, доказно потекло и институционална волја во мрежи од ВИ-агенти','Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will in Networks of AI Agents','Version v1.0 · Bilingual MK/EN · 45 pages','10.5281/zenodo.21779849'),
        ('009','Транспарентност на ВИ и протокол на авторството: Водени жигови, доказно потекло, човечка одговорност и Актот на ЕУ за вештачка интелигенција по 2 август 2026','AI Transparency and the Protocol of Authorship: Watermarking, Provenance, Human Responsibility and the EU AI Act after 2 August 2026','v1.0 FINAL DOI-LOCKED · Bilingual MK/EN · 14 Aug 2026','10.5281/zenodo.21933739'),
    ]
    out=[]
    for n,mk,en,meta,doi in entries:
        out.append(f'''<article class="entry" id="wpa-pn-{n}"><div class="ecd">WPA-PN-{n} · 2026</div><h2>{en}</h2><div class="mkt">{mk}</div><div class="emeta"><span class="tag">Smiljanov, Sande</span><span class="tag">2026</span><span class="tag ok">{meta}</span><span class="tag gold">DOI: {doi}</span></div><div class="elinks"><a href="wpa-pn-{n}.html" class="btn s">Record Page</a><a href="https://doi.org/{doi}" target="_blank" rel="noopener" class="btn o">DOI</a></div></article>''')
    return '\n'.join(out)


def patch_protocol_notes():
    p='protocol-notes/index.html'
    t=read(p)
    t=t.replace('including WPA-PN-001, WPA-PN-002 and WPA-PN-003 with Zenodo DOI records.', 'covering WPA-PN-001 through WPA-PN-009 with Zenodo DOI records.')
    if 'id="wpa-pn-009"' not in t:
        marker='  <div class="note">\n    <strong>Technical note:'
        if marker in t:
            t=t.replace(marker, pn_entries_html()+'\n\n'+marker,1)
    t=t.replace('Last updated: 16 July 2026.', f'Last updated: {DATE_EN}.')
    # Remove obsolete technical note if it suggests future files rather than current indexed series.
    t=re.sub(r'\s*<div class="note">\s*<strong>Technical note:</strong>.*?</div>\s*', '\n', t, count=1, flags=re.S)
    write(p,t)


def patch_working_papers():
    p='working-papers/index.html'
    t=read(p)
    t=t.replace('Published Zenodo DOI records for 12 WPA Working Papers and 3 WPA Protocol Notes by Sande Smiljanov and the World Protocol Academy, including WPA-PN-003 Les Invalides 2026.', 'Canonical WPA Zenodo publication index: 13 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan by Sande Smiljanov / World Protocol Academy — 23 public records as of 26 August 2026.')
    t=t.replace('Public DOI index for twelve WPA Working Papers and three WPA Protocol Notes by Sande Smiljanov and the World Protocol Academy, including WPA-PN-003 Les Invalides 2026.', 'Canonical public WPA Zenodo DOI index: 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23 records as of 26 August 2026.')
    t=t.replace('Working Papers 001–012 · Protocol Notes 001–003', 'Working Papers 001–013 · Protocol Notes 001–009 · Strategic Plan')
    t=t.replace('<strong>Published Zenodo DOI Records:</strong> The WPA corpus currently contains fifteen public DOI records: twelve Working Papers and three Protocol Notes.', '<strong>Published Zenodo Records:</strong> The canonical WPA corpus contains <strong>23 public Zenodo records: 13 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan</strong> as of 26 August 2026.')
    t=t.replace('<span>12 Working Papers + 3 Protocol Notes</span>', '<span>13 Working Papers + 9 Protocol Notes + 1 Strategic Plan</span>')
    t=t.replace('All fifteen records — twelve Working Papers and three Protocol Notes — are issued under the authorship and final editorial responsibility of Sande Smiljanov.', 'All 23 indexed WPA Zenodo records — 13 Working Papers, 9 Protocol Notes and 1 Global Strategic Plan — are issued under the authorship and final editorial responsibility of Sande Smiljanov, with the category/status disclosures shown in the canonical bibliography.')
    t=t.replace('Последно ажурирано: 16 јули 2026 · Last updated: 16 July 2026', f'Последно ажурирано: {DATE_MK} · Last updated: {DATE_EN}')

    # The legacy JS grid still holds WP001-012 + PN001-003. Keep it for historical interactivity,
    # but append the current verified records as a canonical supplement rather than fabricating JS metadata.
    if 'data-wpa-current-corpus="20260826"' not in t:
        supplement='''<section data-wpa-current-corpus="20260826" class="papers"><div class="container"><div class="section-title"><h2>Current Canonical Corpus · 26 August 2026</h2><span>Verified delta since July index</span></div><div class="grid">'''+wp13_entry()+'''<div class="series-divider">WPA Protocol Notes 004–009<small>Author-reviewed Zenodo DOI records</small></div>'''
        for n,mk,en,meta,doi in [
            ('004','МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест','MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test','Version 1.10 · Bilingual MK/EN','10.5281/zenodo.21469146'),
            ('005','Протокол на вештачката интелигенција и државниот суверенитет','Protocol of Artificial Intelligence and State Sovereignty','Version 1.6 · Bilingual MK/EN','10.5281/zenodo.21651611'),
            ('006','Невропротокол 2030: Од мисла до дејство','Neuroprotocol 2030: From Thought to Action','Version 1.6 · Bilingual MK/EN','10.5281/zenodo.21669195'),
            ('007','Течен протокол и ВИ-агенти: Од статичен код до динамична дипломатија','Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy','Version v1.9.2 · 27 pages','10.5281/zenodo.21772500'),
            ('008','Мултиагентска дипломатија: Мандат, доказно потекло и институционална волја во мрежи од ВИ-агенти','Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will in Networks of AI Agents','Version v1.0 · 45 pages','10.5281/zenodo.21779849'),
            ('009','Транспарентност на ВИ и протокол на авторството','AI Transparency and the Protocol of Authorship','v1.0 FINAL DOI-LOCKED · 14 Aug 2026','10.5281/zenodo.21933739')]:
            supplement += f'''<article class="paper-card" id="pn{n}"><div class="paper-top"><div><div class="paper-id">WPA-PN-{n}</div><h3 class="paper-title-mk">{mk}</h3><div class="paper-title-en">{en}</div></div><span class="paper-type">Protocol Note</span></div><div class="paper-meta">{meta}</div><div class="doi-row"><a class="doi" href="https://doi.org/{doi}" target="_blank" rel="noopener">{doi}</a><a class="btn btn-gold" href="https://doi.org/{doi}" target="_blank" rel="noopener">Zenodo</a></div></article>'''
        supplement += '''<div class="series-divider">WPA Strategic Publication<small>Separate Zenodo strategic report record</small></div><article class="paper-card" id="strategic-plan"><div class="paper-top"><div><div class="paper-id">WPA Strategic Publication · Version 1.1</div><h3 class="paper-title-mk">Светска академија за протокол — Глобален стратешки план 2026</h3><div class="paper-title-en">World Protocol Academy — Global Strategic Plan 2026</div></div><span class="paper-type">Strategic Report</span></div><div class="paper-meta">Version 1.1 · Revised and expanded edition · 26 pages · Bilingual MK/EN</div><div class="doi-row"><a class="doi" href="https://doi.org/10.5281/zenodo.21675100" target="_blank" rel="noopener">10.5281/zenodo.21675100</a><a class="btn btn-gold" href="https://doi.org/10.5281/zenodo.21675100" target="_blank" rel="noopener">Zenodo</a></div></article></div><p style="margin-top:18px"><a class="btn btn-ghost" href="/bibliography/">Canonical bibliography →</a></p></div></section>'''
        t=t.replace('<section class="notes">', supplement+'\n<section class="notes">',1)
    write(p,t)


def patch_bibliography_text():
    p='bibliography/index.html'
    t=read(p)
    t=t.replace('NOT counted among the 25 academic publications above', 'NOT counted among the 26 academic publications above')
    t=t.replace('Следните дванаесет working papers', 'Следните тринаесет working papers')
    t=t.replace('<strong>12</strong>\n<span>Zenodo DOI записи</span>', '<strong>13</strong>\n<span>Zenodo DOI записи</span>')
    t=t.replace('<strong>001–012</strong>\n<span>WPA Working Papers Series</span>', '<strong>001–013</strong>\n<span>WPA Working Papers Series</span>')
    t=t.replace('Дванаесетте WPA Working Papers (Zenodo)', 'Тринаесетте WPA Working Papers (Zenodo)')
    write(p,t)


def verify():
    home=read('index.html'); inst=read('institute.html'); wp=read('working-papers/index.html'); pn=read('protocol-notes/index.html'); bib=read('bibliography/index.html')
    assert '5 монографии, 1 дисертација' not in home
    assert 'Доктрина на креатор на платформатаот' not in inst
    assert 'Kako WPA' not in inst
    assert 'institute@worldprotocolacademy.mk' in inst
    assert 'Индекс на протоколарна мека моќ' in inst
    assert 'WPA Sublimate Engine · PREVIEW' in inst
    assert 'data-wpa-aab-criteria="20260826"' in inst
    assert 'data-wpa-hierarchy="20260826"' in inst
    assert '23 записи: 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan' in inst
    assert 'Working Papers 001–013 · Protocol Notes 001–009 · Strategic Plan' in wp
    assert '23 public Zenodo records' in wp
    assert 'id="wpa-pn-009"' in pn
    assert 'Следните тринаесет working papers' in bib
    assert '<strong>13</strong>\n<span>Zenodo DOI записи</span>' in bib


def main():
    patch_index(); patch_institute(); patch_protocol_notes(); patch_working_papers(); patch_bibliography_text(); verify()
    print('Claude audit delta synchronized against canonical bibliography master.')

if __name__ == '__main__':
    main()

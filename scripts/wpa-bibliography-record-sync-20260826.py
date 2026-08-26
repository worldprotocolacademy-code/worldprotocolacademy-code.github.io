from pathlib import Path

P = Path(__file__).resolve().parents[1] / 'bibliography/index.html'
t = P.read_text(encoding='utf-8')

# Exact canonical metrics from the 26-Aug-2026 bibliography master.
t = t.replace('<strong>12/12</strong>\n<span>DOI coverage</span>', '<strong>13/13</strong>\n<span>DOI coverage</span>')
t = t.replace('<strong>DOI coverage: 12 Zenodo records</strong>', '<strong>DOI coverage: 13 Zenodo records</strong>')

# WP-013: add the missing physical record, not just the counter.
if 'id="wp-013"' not in t:
    wp13 = '''<!-- WP-013 -->
<div class="bib-entry" data-doi="10.5281/zenodo.21514266" data-index="doi zenodo" data-search="wp-013 мостови наместо бариери bridges not barriers droupadi murmu india north macedonia 2026 doi 10.5281/zenodo.21514266" data-title="Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија" data-type="working-paper" data-year="2026" id="wp-013">
<div class="bib-num">WP-013</div>
<div class="bib-mk">Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија</div>
<div class="bib-en">Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia</div>
<div class="bib-meta"><strong>2026</strong> · WPA Working Paper No. 013 · Version v14 · Bilingual MK/EN · 29 pages<br/>DOI <a class="bib-link" href="https://doi.org/10.5281/zenodo.21514266" rel="noopener" target="_blank">10.5281/zenodo.21514266</a></div>
<div class="bib-tags"><span class="bib-tag purple">Working Paper</span><span class="bib-tag green">Zenodo DOI</span></div>
<div class="bib-links"><a class="bib-link-btn" href="https://doi.org/10.5281/zenodo.21514266" rel="noopener" target="_blank">Zenodo record →</a></div>
</div>
'''
    marker = '<!-- Publications in preparation -->'
    if marker not in t: raise RuntimeError('WP insertion marker missing')
    t = t.replace(marker, wp13 + '\n' + marker, 1)

# Protocol Notes 004-009: add the missing physical bibliography records.
pnotes = [
('004','МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест','MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test','Version 1.10 · Bilingual MK/EN','10.5281/zenodo.21469146'),
('005','Протокол на вештачката интелигенција и државниот суверенитет','Protocol of Artificial Intelligence and State Sovereignty','Version 1.6 · Bilingual MK/EN','10.5281/zenodo.21651611'),
('006','Невропротокол 2030: Од мисла до дејство','Neuroprotocol 2030: From Thought to Action','Version 1.6 · Bilingual MK/EN','10.5281/zenodo.21669195'),
('007','Течен протокол и ВИ-агенти: Од статичен код до динамична дипломатија','Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy','Version v1.9.2 · Bilingual MK/EN · 27 pages','10.5281/zenodo.21772500'),
('008','Мултиагентска дипломатија: Мандат, доказно потекло и институционална волја во мрежи од ВИ-агенти','Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will in Networks of AI Agents','Version v1.0 · Bilingual MK/EN · 45 pages','10.5281/zenodo.21779849'),
('009','Транспарентност на ВИ и протокол на авторството: Водени жигови, доказно потекло, човечка одговорност и Актот на ЕУ за вештачка интелигенција по 2 август 2026','AI Transparency and the Protocol of Authorship: Watermarking, Provenance, Human Responsibility and the EU AI Act after 2 August 2026','v1.0 FINAL DOI-LOCKED · Bilingual MK/EN · Author-approved public release · 14 Aug 2026','10.5281/zenodo.21933739')]

if 'id="pn-009"' not in t:
    blocks=[]
    for n,mk,en,meta,doi in pnotes:
        blocks.append(f'''<!-- WPA-PN-{n} -->
<div class="bib-entry" data-doi="{doi}" data-index="doi zenodo" data-search="wpa-pn-{n} {mk.lower()} {en.lower()} 2026 {doi}" data-title="{mk}" data-type="protocol-note" data-year="2026" id="pn-{n}">
<div class="bib-num">WPA-PN-{n}</div>
<div class="bib-mk">{mk}</div><div class="bib-en">{en}</div>
<div class="bib-meta"><strong>2026</strong> · WPA Protocol Note No. {n} · {meta}<br/>DOI <a class="bib-link" href="https://doi.org/{doi}" rel="noopener" target="_blank">{doi}</a></div>
<div class="bib-tags"><span class="bib-tag">Protocol Note</span><span class="bib-tag green">Zenodo DOI</span></div>
<div class="bib-links"><a class="bib-link-btn" href="/protocol-notes/wpa-pn-{n}.html">Protocol Note page →</a><a class="bib-link-btn" href="https://doi.org/{doi}" rel="noopener" target="_blank">Zenodo record →</a></div>
</div>''')
    marker = '<!-- ═══════════ VI. WPA RESEARCH PROGRAMME ═══════════ -->'
    if marker not in t: raise RuntimeError('PN insertion marker missing')
    t = t.replace(marker, '\n'.join(blocks) + '\n\n' + marker, 1)

# Strategic Plan: keep the separate category and total 23 transparent.
if 'id="wpa-strategic-plan-2026"' not in t:
    strategic = '''<div class="bib-entry" data-doi="10.5281/zenodo.21675100" data-index="doi zenodo" data-search="wpa global strategic plan 2026 version 1.1 zenodo 21675100" data-title="Светска академија за протокол — Глобален стратешки план 2026" data-type="strategic-report" data-year="2026" id="wpa-strategic-plan-2026">
<div class="bib-num">WPA Strategic Publication · Version 1.1</div>
<div class="bib-mk">Светска академија за протокол — Глобален стратешки план 2026</div><div class="bib-en">World Protocol Academy — Global Strategic Plan 2026</div>
<div class="bib-meta"><strong>2026</strong> · Strategic Report · Revised and expanded edition · 26 pages · Bilingual MK/EN<br/>Version DOI <a class="bib-link" href="https://doi.org/10.5281/zenodo.21675100" rel="noopener" target="_blank">10.5281/zenodo.21675100</a></div>
<div class="bib-tags"><span class="bib-tag blue">Strategic Report</span><span class="bib-tag green">Zenodo DOI</span></div>
</div>'''
    marker = '<!-- ═══════════ VI. WPA RESEARCH PROGRAMME ═══════════ -->'
    t = t.replace(marker, strategic + '\n\n' + marker, 1)

# Canonical metrics notice: explicitly distinguish academic publications and Zenodo corpus.
if 'data-wpa-canonical-metrics="20260826"' not in t:
    marker = '<!-- ===== Section IV: WPA Working Papers · Zenodo DOI записи ===== -->'
    notice = '''<div data-wpa-canonical-metrics="20260826" class="bib-note" style="color:rgba(255,255,255,.82)"><strong>Canonical metrics · 26 August 2026:</strong> 26 academic publications (6 monographs/handbooks + 1 doctoral dissertation + 19 papers/contributions). Separate WPA Zenodo corpus: 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23 records.</div>\n'''
    t = t.replace(marker, notice + marker, 1)

# Last-updated shell only; individual publication version dates stay untouched.
t = t.replace('Последно ажурирано: 17 август 2026 · Last updated: 17 August 2026', 'Последно ажурирано: 26 август 2026 · Last updated: 26 August 2026')
t = t.replace('Последно ажурирано: 16 јули 2026 · Last updated: 16 July 2026', 'Последно ажурирано: 26 август 2026 · Last updated: 26 August 2026')

# Verification: counters must have matching physical records.
assert '<div class="counter-num">26</div>' in t
assert '<div class="counter-num">6</div>' in t
assert 'id="wp-013"' in t and '10.5281/zenodo.21514266' in t
for n,_,_,_,doi in pnotes:
    assert f'id="pn-{n}"' in t and doi in t
assert 'id="wpa-strategic-plan-2026"' in t and '10.5281/zenodo.21675100' in t
assert '<strong>13/13</strong>' in t

P.write_text(t, encoding='utf-8')
print('Canonical bibliography physical records synchronized: 26 academic; 13 WP; 9 PN; 1 strategic; 23 Zenodo.')

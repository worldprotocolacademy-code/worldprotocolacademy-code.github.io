#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(rel):
    return (ROOT / rel).read_text(encoding='utf-8')


def write(rel, text):
    (ROOT / rel).write_text(text, encoding='utf-8')


def replace_in_file(rel, replacements):
    t = read(rel)
    for old, new in replacements:
        t = t.replace(old, new)
    write(rel, t)


def patch_protocolometry():
    rel = 'protocolometry-center.html'
    t = read(rel)
    t = t.replace('Protocol provides institutional order and clarity.', 'Protocol is absolute.')
    t = t.replace('Protocol State Performance Index', 'WPA Protocol Soft Power Index')
    t = t.replace('мери протоколарна изведба на конкретни настани', 'мери протоколарна мека моќ и церемонијално/визуелно сигнализирање во конкретни настани')
    write(rel, t)


def patch_index():
    rel = 'index.html'
    t = read(rel)
    t = t.replace('zero hallucination политика.', 'zero-hallucination target and verification standard — not an absolute guarantee.')
    t = t.replace('Верифицирани главни градови и континентална припадност за сите 53 записи.', 'Верифицирани главни градови и континентална припадност за сите 197 записи.')
    t = t.replace('53 верифицирани записи · Официјална WPA верифицирана протоколарна база', '197 records · 95 sovereign states · 9 territories/other entities · WPA Protocol Symbols knowledge module')
    t = t.replace('PPP презентации', 'PPT презентации').replace('PPP пакети', 'PPT пакети').replace('PPP / лекција', 'PPT / лекција')
    t = t.replace('live workshops и premium educational products.', 'learning workshops и educational materials in development.')
    t = t.replace('up to 80 bounded Tactical-Operational Seats', 'up to 80 bounded workflow seats')
    t = t.replace('Up to 80 tactical-operational seats.', 'Up to 80 bounded workflow seats.')
    # Remove disabled placeholder CTA to a missing public source.
    t = re.sub(r'\s*<a class="wpa-humanism-button" href="#" aria-disabled="true" onclick="return false;" title="Reference link pending official public source" target="_blank" rel="noopener noreferrer" data-i18n="a_ohrid_academy_humanism\.10">.*?</a>\s*', '\n', t, flags=re.S)
    # Avoid transient social query parameters where direct public profile paths are already known.
    t = t.replace('https://www.instagram.com/worldprotocolacademy?igsh=MXJsMW9oNHczZmlyag==', 'https://www.instagram.com/worldprotocolacademy/')
    t = t.replace('https://youtube.com/@worldprotocolacademy?si=8tbcj4Cp7focFqYB', 'https://www.youtube.com/@worldprotocolacademy')
    write(rel, t)


def patch_institute():
    rel = 'institute.html'
    t = read(rel)
    t = t.replace('Еден од првите специјализирани институти што го третира протоколот како <em>мерлива институционална дисциплина</em> — со објавени инструменти, транспарентна методологија и право на исправка.', 'Специјализирана WPA институтска рамка што го третира протоколот како <em>мерлива институционална дисциплина</em> — со објавени инструменти, транспарентна методологија и право на исправка.')
    t = t.replace('One of the first specialised institutes to treat protocol as a measurable institutional discipline — with published instruments, transparent methodology and a right of correction.', 'A specialised WPA institute framework treating protocol as a measurable institutional discipline — with published instruments, transparent methodology and a right of correction.')
    t = t.replace('data-i18n="institute.tools_hub.tag.intel">Intelligence</div>', 'data-i18n="institute.tools_hub.tag.intel">Public-Source Analysis</div>')
    t = t.replace('WPA Intelligence &amp; Editorial Systems', 'WPA Analysis &amp; Editorial Systems')
    t = t.replace('Academic Search, Live Intelligence and Journal Watch', 'Academic Search, Public-Source Analysis and Journal Watch')
    t = t.replace('уредничката интелигенција', 'уредничката анализа')
    t = t.replace('Services are independent institutional advisory, training and briefing engagements available upon request.', 'Public enquiries and expressions of interest are welcome. Paid delivery, commercial engagements, pricing, payments and official credential issuance are currently inactive/frozen pending governance and legal readiness.')
    t = t.replace('го проверува квалитетот на работните трудови,', 'може советодавно да го прегледува квалитетот на работните трудови по формално конституирање,')
    marker = '<p data-i18n="institute.aab.p3">AAB не е оперативно тело — Институтот го раководи Директорот. AAB е советодавна совест: проверка на квалитетот, не на оперативните одлуки.</p>'
    if marker in t and 'AAB advisory review does not constitute journal peer review unless separately documented.' not in t:
        t = t.replace(marker, marker + '\n<p><strong>Boundary:</strong> AAB advisory review does not constitute journal peer review unless separately documented.</p>', 1)
    write(rel, t)


def patch_services():
    rel = 'wpa-services.html'
    t = read(rel)
    t = t.replace('World Protocol Academy · Institutional Services', 'World Protocol Academy · Institutional Services Preview')
    t = t.replace('WPA provides independent advisory and educational engagements.', 'WPA is documenting potential advisory and educational engagement formats.')
    t = t.replace('No paid checkout is active on this page; every engagement is separately scoped and human-reviewed.', 'INACTIVE / FROZEN: this page is informational only. No pricing, payments, paid delivery, commercial engagement or official credential issuance is currently active.')
    t = t.replace('Request a scoped proposal', 'Register interest')
    t = t.replace('03 · Deliver', '03 · Future activation')
    t = t.replace('Human-reviewed output', 'Human-reviewed output model')
    t = t.replace('The agreed briefing, training, audit or analytical output is delivered under a defined mandate and correction path.', 'If formally activated in the future, any briefing, training, audit or analytical output would operate under a defined mandate, human review and correction path.')
    t = t.replace('Request a custom institutional proposal', 'Register institutional interest')
    t = t.replace('Proposal request preview', 'Expression-of-interest preview')
    t = t.replace('WPA Institutional Proposal Request', 'WPA Institutional Expression of Interest')
    t = t.replace('Human review + separate scope approval', 'Inactive / frozen · informational preview')
    write(rel, t)


def patch_certification():
    rel = 'certification.html'
    t = read(rel)
    t = t.replace('<meta name="author" content="Assoc. Prof. Dr. Sande Smiljanov">', '<meta name="author" content="Doc. Dr Sande Smiljanov">')
    t = t.replace('Четири јасни WPA сертификати. Еден проверлив систем на професионална подготвеност.', 'Четири WPA certificate pathways во развој. Една demo рамка за проверлива професионална подготвеност.')
    t = t.replace('World Protocol Academy ја гради сертификацијата како structured non-degree professional education system:', 'World Protocol Academy развива demo certification architecture како structured non-degree professional education concept:')
    t = t.replace('Сертификатот не е само\n          потврда за присуство, туку запис за завршена професионална патека и проверлива изведба.', 'Официјално издавање сè уште не е активно. Сите прикажани certificate IDs, verification flows и holder wording се fictitious/test records за демонстрација на архитектурата.')
    t = t.replace('QR води до public verification page со certificate ID и статус.', 'Во demo режим, QR логиката е предвидена да води до public verification page со test certificate ID и status; не претставува активна credential issuance услуга.')
    t = t.replace('✅ Валиден сертификат', '✅ Валиден demo/test запис')
    t = t.replace('✅ Valid certificate', '✅ Valid demo/test record')
    write(rel, t)


def patch_symbols():
    rel = 'wpaws/protocol-symbols/index.html'
    t = read(rel)
    t = re.sub(r'<span class="wpa-premium-price"><strong>€19</strong><span>single-user licence</span></span>', '<span class="wpa-premium-price"><strong>Commercial preview</strong><span>currently inactive</span></span>', t)
    t = t.replace('Прегледај го Premium пакетот', 'Прегледај ја reference preview страницата')
    t = t.replace('Што содржи пакетот?', 'Што е предвидено во preview?')
    write(rel, t)


def patch_bibliography():
    rel = 'bibliography/index.html'
    t = read(rel)
    old = '''      • 26 Academic Publications / Академски публикации<br/>
      • 12 WPA Working Papers (Zenodo DOI)<br/>
      • 3 WPA Protocol Notes (Zenodo DOI)<br/>
      • 15 Total Zenodo DOI Records<br/>
      • 6 Monographs and Handbooks<br/>'''
    new = '''      • 26 Academic Publications / Академски публикации<br/>
      • 13 WPA Working Papers (Zenodo DOI)<br/>
      • 9 WPA Protocol Notes (Zenodo DOI)<br/>
      • 1 Global Strategic Plan (Zenodo DOI)<br/>
      • 23 Total WPA Zenodo Records<br/>
      • 6 Monographs and Handbooks<br/>'''
    t = t.replace(old, new)
    write(rel, t)


def patch_journal():
    for rel in ('journal/submission-policy.html', 'journal/editorial-policy.html'):
        t = read(rel)
        t = t.replace('Any future publication or production fee must be disclosed separately and may apply only after editorial acceptance under the then-current public policy.', 'No publication or production fee is currently active or displayed. Any future fee framework would require formal activation and a then-current public fee/waiver policy after editorial acceptance.')
        t = t.replace('Editorial decisions are separated from financial considerations. No fee, waiver, sponsorship or supporter status improves the probability of acceptance.', 'Editorial decisions are separated from financial considerations. No publication fee or payment framework is currently active. If activated in the future, no fee, waiver, sponsorship or supporter status may improve the probability of acceptance.')
        write(rel, t)


def patch_monetization_placeholder():
    rel = 'monetization-checklist.html'
    html = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>WPA Commercial Layer · Inactive</title></head><body style="font-family:system-ui,Arial,sans-serif;max-width:760px;margin:80px auto;padding:0 24px;line-height:1.7"><h1>WPA Commercial Layer · INACTIVE / FROZEN</h1><p>This legacy internal planning surface is not an active public commercial offer.</p><p><strong>No pricing, payments, paid services, subscriptions, licences, discounts, checkout or official credential issuance is currently active or displayed.</strong></p><p>Public WPA pages may accept informational enquiries or expressions of interest only.</p><p><a href="/">Back to World Protocol Academy</a></p></body></html>'''
    write(rel, html)


def patch_public_disclaimer():
    rel = 'public-disclaimer.html'
    t = read(rel)
    marker = '<div class="notice" data-i18n="k008">If you believe a WPA index or benchmark entry about your institution is inaccurate, you may request a correction. See the Correction Request page.</div>'
    if marker in t and 'commercial layer is currently inactive/frozen' not in t:
        t = t.replace(marker, marker + '\n<div class="notice"><strong>Commercial status:</strong> WPA\'s public commercial layer is currently inactive/frozen. No pricing, payments, paid delivery, subscriptions, licences or official credential issuance are active.</div>', 1)
    write(rel, t)


def verify():
    p = read('protocolometry-center.html')
    assert 'Protocol State Performance Index' not in p
    assert 'WPA Protocol Soft Power Index' in p
    assert 'Protocol is absolute.' in p

    i = read('index.html')
    assert 'zero hallucination политика' not in i
    assert 'сите 53 записи' not in i
    assert '53 верифицирани записи' not in i
    assert 'PPP презентации' not in i and 'PPP пакети' not in i and 'PPP / лекција' not in i
    assert 'bounded Tactical-Operational Seats' not in i
    assert 'Reference link pending official public source' not in i

    inst = read('institute.html')
    assert 'One of the first specialised institutes' not in inst
    assert '>Intelligence</div>' not in inst
    assert 'available upon request' not in inst
    assert 'AAB advisory review does not constitute journal peer review unless separately documented.' in inst

    svc = read('wpa-services.html')
    assert '03 · Deliver' not in svc
    assert 'is delivered under a defined mandate' not in svc
    assert 'INACTIVE / FROZEN' in svc

    cert = read('certification.html')
    assert 'fictitious/test records' in cert
    assert 'Issuance not yet active' in cert

    sym = read('wpaws/protocol-symbols/index.html')
    assert '€19' not in sym
    assert 'single-user licence' not in sym
    assert 'Commercial preview' in sym

    bib = read('bibliography/index.html')
    assert '12 WPA Working Papers (Zenodo DOI)' not in bib
    assert '3 WPA Protocol Notes (Zenodo DOI)' not in bib
    assert '15 Total Zenodo DOI Records' not in bib
    assert '23 Total WPA Zenodo Records' in bib

    mon = read('monetization-checklist.html')
    for token in ('$19.99', '$299', '$499', '$999', '$9.99', 'MONETIZATION CHECKLIST'):
        assert token not in mon
    assert 'INACTIVE / FROZEN' in mon


if __name__ == '__main__':
    patch_protocolometry()
    patch_index()
    patch_institute()
    patch_services()
    patch_certification()
    patch_symbols()
    patch_bibliography()
    patch_journal()
    patch_monetization_placeholder()
    patch_public_disclaimer()
    verify()
    print('WPA public canonical hardening applied successfully.')

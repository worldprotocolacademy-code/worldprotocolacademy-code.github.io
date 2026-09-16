#!/usr/bin/env python3
"""One-shot strict cleanup for the canonical Macedonian Home.

Policy: the canonical / surface is Macedonian. English is retained only for
registered/official names, product names, source-language bibliographic titles,
DOI/ISBN identifiers, and the language selector itself.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
CHECK = ROOT / "scripts/mk_home_language_integrity_check.py"


def replace_all(text: str) -> str:
    replacements = {
        '<span class="wpa-name-en">WORLD PROTOCOL ACADEMY</span>': '',
        '<span class="wpa-inst-en">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span>': '',
        '<span class="wpa-platform-en">Independent digital educational, research and authorial platform</span>': '',
        '<span class="wpa-status-en">DEVELOPMENT, TESTING AND PILOT PHASE — 2026</span>': '',
        '<span class="wpa-brand-en">World Protocol Academy</span>': '',
        '<h2>Светска академија за протокол<br><em>World Protocol Academy</em></h2>': '<h2>Светска академија за протокол</h2>',
        '<p class="hero-sub" data-i18n="heroP"><strong>Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</strong><br><em>Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</em><br><br>Независна дигитална образовна, истражувачка и авторска платформа. Развојна, тест и пробна фаза — 2026.<br>Независна дигитална образовна, истражувачка и авторска платформа. Развојна, тест и пробна фаза — 2026.</p>': '<p class="hero-sub" data-i18n="heroP"><strong>Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</strong><br><br>Независна дигитална образовна, истражувачка и авторска платформа. Развојна, тест и пробна фаза — 2026.</p>',
        'Учење · Learn': 'Учење',
        'Истражување · Research': 'Истражување',
        'Институционално · Institutional': 'Институционално',
        'WPA Quick Start · Брз почеток': 'WPA Брз почеток',
        'Напредна WPA технологија · Advanced WPA Technology': 'Напредна WPA технологија',
        '📐 Protocolometry Center · методолошки центар': '📐 Центар за протоколометрија · методолошки центар',
        'Protocolometry Center · методолошки центар': 'Центар за протоколометрија · методолошки центар',
        'Foundation → Professional → Advanced → Trainer': 'Основно → Професионално → Напредно → Обука за обучувачи',
        'Protocol · Diplomatic · Institutional · Conference': 'Протоколарен · Дипломатски · Институционален · Конференциски',
        'continuity, symbolic integrity и communication authority': 'континуитет, симболички интегритет и комуникациски авторитет',
        'AI може да подготви.': 'ВИ може да подготви.',
        'score bands, FAQ логика и идниот serial / QR verification модел': 'опсези на резултати, FAQ логика и идниот модел за сериска / QR верификација',
        'WPA Card како identity, membership, QR verification и access layer': 'WPA Card како слој за идентитет, членство, QR верификација и пристап',
        'Partnerships &amp; Member Benefits': 'Партнерства и членски придобивки',
        'Partnerships & Member Benefits': 'Партнерства и членски придобивки',
        'member benefits, recurring value': 'членски придобивки, континуирана вредност',
        'professional learning layer': 'слој за професионално учење',
        'learning layer': 'слој за учење',
        'Academic режим': 'академски режим',
        'Question Bank': 'Банка на прашања',
        'Assessment engine': 'мотор за оценување',
        'Professional English Toolkit': 'алатник за професионален англиски',
        'Open Professional English Toolkit →': 'Отвори го алатникот за професионален англиски →',
        'Open Professional English Toolkit': 'Отвори го алатникот за професионален англиски',
        'Sande voice engine, protocol scenario lab,\n      viral media studio, live video room governance и monetization workflows.': 'Sande voice engine, лабораторија за протоколарни сценарија,\n      студио за вирални медиуми, управување со видео соба во живо и работни текови за монетизација.',
        'protocol scenario lab, viral media studio, live video room governance и monetization workflows.': 'лабораторија за протоколарни сценарија, студио за вирални медиуми, управување со видео соба во живо и работни текови за монетизација.',
        'Open WPA Audio Media Engine': 'Отвори WPA Audio Media Engine',
        'Explore WPA Programmes': 'Истражи ги WPA програмите',
        'partnerships and member benefits': 'партнерства и членски придобивки',
        'Општи информации · General information:': 'Општи информации:',
        'Општа комуникација · General contact:': 'Општа комуникација:',
        'Администрација · Administration:': 'Администрација:',
        'Доц. д-р Санде Смиљанов · Author:': 'Доц. д-р Санде Смиљанов · Автор:',
        'Директна WPA адреса · WPA direct:': 'Директна WPA адреса:',
        '>Privacy Policy<': '>Политика за приватност<',
        '>Rights &amp; Takedown<': '>Права и отстранување содржина<',
        '>Rights & Takedown<': '>Права и отстранување содржина<',
        '>Privacy<': '>Приватност<',
        '>Terms of Use<': '>Услови за користење<',
        '>Cookie Policy<': '>Политика за колачиња<',
        '>Correction Request<': '>Барање за исправка<',
        'Последно ажурирано: 26 август 2026 · Last updated: 26 August 2026': 'Последно ажурирано: 26 август 2026',
        ' / A bilingual, source-audited Protocol Note introducing a replicable WPA method for contemporary multilateral ceremonial analysis.': '',
        '<span>Version 1.0</span>': '<span>Верзија 1.0</span>',
        '<span>16 July 2026</span>': '<span>16 јули 2026</span>',
        'Избрана Zenodo публикација · Selected Zenodo publication · WPA Protocol Note No. 003': 'Избрана Zenodo публикација · WPA Protocol Note бр. 003',
        'Нова Zenodo публикација · New Zenodo publication ·': 'Нова Zenodo публикација ·',
        'Најнова Zenodo публикација · Latest Zenodo publication ·': 'Најнова Zenodo публикација ·',
        'НОВА КНИГА · NEW BOOK · 2026': 'НОВА КНИГА · 2026',
        'WPA GLOBAL CHANNELS': 'WPA ГЛОБАЛНИ КАНАЛИ',
        'WPA · Protocol Symbols Lab · Верифицирана база': 'WPA · Лабораторија за протоколарни симболи · Верифицирана база',
        'Отвори Protocol Symbols Lab →': 'Отвори ја Лабораторијата за протоколарни симболи →',
        '197 records · 95 sovereign states · 9 territories/other entities · WPA Protocol Symbols knowledge module': '197 записи · 95 суверени држави · 9 територии/други ентитети · WPA модул за знаење за протоколарни симболи',
        'World Protocol Academy Bibliography': 'Библиографија на World Protocol Academy',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def patch_checker() -> None:
    text = CHECK.read_text(encoding="utf-8")
    anchor = '''FORBIDDEN_SHORT = {\n    "Institutional map","Evidence & Benchmark","Learning & Access","Programme Architecture","Certification Logic",\n    "Membership & Access","Partner & Growth Logic","Executive Briefings","Institutional Profile",\n    "Certificates & Recognition","Sources, Authorship and Educational Use","Global reach","Regional expansion",\n    "Book-to-Screen Method","Educational Film Cases","Production Workflow","Protocol Lesson","Diplomatic Impact",\n    "Academic Cooperation","Humanism & Dialogue","Ohrid Intellectual Tradition",\n}\n'''
    replacement = '''FORBIDDEN_SHORT = {\n    "Institutional map","Evidence & Benchmark","Learning & Access","Programme Architecture","Certification Logic",\n    "Membership & Access","Partner & Growth Logic","Executive Briefings","Institutional Profile",\n    "Certificates & Recognition","Sources, Authorship and Educational Use","Global reach","Regional expansion",\n    "Book-to-Screen Method","Educational Film Cases","Production Workflow","Protocol Lesson","Diplomatic Impact",\n    "Academic Cooperation","Humanism & Dialogue","Ohrid Intellectual Tradition",\n    "Учење · Learn","Истражување · Research","Институционално · Institutional",\n    "WPA Quick Start · Брз почеток","Напредна WPA технологија · Advanced WPA Technology",\n    "Privacy Policy","Terms of Use","Cookie Policy","Correction Request",\n}\nFORBIDDEN_FRAGMENTS = (\n    " · Learn", " · Research", "General information:", "General contact:",\n    " · Administration:", " · Author:", " · WPA direct:", "Last updated:",\n    "partnerships and member benefits", "member benefits, recurring value",\n)\n'''
    if anchor not in text:
        raise SystemExit("MK checker anchor changed; refusing unsafe rewrite")
    text = text.replace(anchor, replacement)
    old = '''        if s in FORBIDDEN_SHORT:\n            errors.append(f"forbidden English UI label remains: {s}")\n        elif english_heavy(s) and not allowed(s, in_em):\n'''
    new = '''        if s in FORBIDDEN_SHORT or any(fragment in s for fragment in FORBIDDEN_FRAGMENTS):\n            errors.append(f"forbidden English UI label/fragment remains: {s}")\n        elif english_heavy(s) and not allowed(s, in_em):\n'''
    if old not in text:
        raise SystemExit("MK checker loop anchor changed; refusing unsafe rewrite")
    CHECK.write_text(text.replace(old, new), encoding="utf-8")


def main() -> int:
    text = HOME.read_text(encoding="utf-8")
    HOME.write_text(replace_all(text), encoding="utf-8")
    patch_checker()
    print("strict MK visible-UI cleanup applied")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

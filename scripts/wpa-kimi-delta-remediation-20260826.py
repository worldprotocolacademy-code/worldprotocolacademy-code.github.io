from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATE_MK = "26 август 2026"
DATE_EN = "26 August 2026"
MARK = "WPA-KIMI-DELTA-20260826"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text, encoding="utf-8")


def replace_if_present(text: str, old: str, new: str) -> str:
    return text.replace(old, new) if old in text else text


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    new, n = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if n != 1:
        raise RuntimeError(f"Could not apply {label}; matches={n}")
    return new


def patch_institute() -> None:
    path = "institute.html"
    text = read(path)

    # 1) Institute public date lock.
    text = replace_if_present(
        text,
        "Последно ажурирање: 10 јуни 2026 · Last updated: 10 June 2026",
        f"Последно ажурирање: {DATE_MK} · Last updated: {DATE_EN}",
    )

    # 2) Remove stale PN-003 / 15-record quick links and make the public entry points evergreen.
    old_quick = '''<span class="topbar-quicklinks">
<a class="topbar-icon-btn" href="intelligence-center.html" title="WPA Analysis & Knowledge Center" aria-label="WPA Analysis & Knowledge Center"><span aria-hidden="true">🛡️</span><span>Analysis & Knowledge Center</span></a>
<a class="topbar-icon-btn" href="wpa-live-intelligence-feed.html" title="WPA Live Feed" aria-label="WPA Live Feed"><span aria-hidden="true">📡</span><span>Live Feed</span></a>
<a class="topbar-icon-btn" href="https://doi.org/10.5281/zenodo.21390763" target="_blank" rel="noopener" title="WPA-PN-003 on Zenodo" aria-label="WPA-PN-003 on Zenodo"><span aria-hidden="true">📘</span><span>PN-003</span></a>
</span>'''
    new_quick = '''<span class="topbar-quicklinks" data-wpa-lock="20260826">
<a class="topbar-icon-btn" href="protocol-notes/" title="WPA Protocol Notes" aria-label="WPA Protocol Notes"><span aria-hidden="true">📘</span><span>Protocol Notes</span></a>
<a class="topbar-icon-btn" href="bibliography/" title="WPA Official Bibliography" aria-label="WPA Official Bibliography"><span aria-hidden="true">📚</span><span>Bibliography</span></a>
</span>'''
    text = replace_if_present(text, old_quick, new_quick)

    # 3) Compress the overloaded Institute navigation. Content stays; entry noise is reduced.
    if 'data-wpa-nav="institute-20260826"' not in text:
        new_nav = '''<div class="nav-links" data-wpa-nav="institute-20260826">
<a href="index.html">Почетна</a>
<a href="#identity">За Институтот</a>
<a href="#research-pillars">Истражување</a>
<a href="#analytics-centre">Аналитика</a>
<a href="#wpa-public-tools-hub">Ресурси</a>
<a href="#institute-publications">Публикации</a>
<a href="#trust-corrections">Доверба</a>
<a href="#cta">Контакт</a>
</div>'''
        text = regex_once(text, r'<div class="nav-links">.*?</div>\s*</nav>', new_nav + '\n</nav>', "Institute primary navigation")

    # 4) Compress hero actions to the natural first-entry choices.
    if 'data-wpa-hero-actions="institute-20260826"' not in text:
        new_actions = '''<div class="hero-cta" data-wpa-hero-actions="institute-20260826">
<a class="btn btn-primary" href="#charter">Повелба / Charter →</a>
<a class="btn btn-ghost" href="#analytics-centre">Analytics Centre</a>
<a class="btn btn-ghost" href="wpa-global-institutions-master-list.html">Master List ↗</a>
<a class="btn btn-ghost" href="protocol-notes/">Protocol Notes ↗</a>
<a class="btn btn-ghost" href="working-papers/">Research / DOI Index ↗</a>
<a class="btn btn-ghost" href="programmes.html">WPA Programmes ↗</a>
<a class="btn btn-ghost" href="https://worldprotocolacademy.mk/">Главна WPA ↗</a>
</div>'''
        text = regex_once(text, r'<div class="hero-cta">.*?</div>\s*</div>\s*</header>', new_actions + '\n</div>\n</header>', "Institute hero actions")

    # 5) Compress the secondary jump menu too.
    if 'data-wpa-jump="institute-20260826"' not in text:
        new_jump = '''<div class="jump-menu" data-wpa-jump="institute-20260826">
<span class="jump-menu-label">Скокај на:</span>
<a class="jump-link" href="#charter">Повелба</a>
<a class="jump-link" href="#research-pillars">Истражување</a>
<a class="jump-link" href="#analytics-centre">Аналитика</a>
<a class="jump-link" href="#wpa-public-tools-hub">Ресурси</a>
<a class="jump-link" href="#institute-publications">Публикации</a>
<a class="jump-link" href="#trust-corrections">Доверба</a>
<a class="jump-link" href="#cta">Контакт</a>
</div>'''
        text = regex_once(text, r'<div class="jump-menu">.*?</div>', new_jump, "Institute jump menu")

    # 6) Replace stale hard-coded DOI corpus count with a canonical-index statement.
    text = replace_if_present(
        text,
        '<h3 data-i18n="institute.tools_hub.dois.title">WPA Zenodo Corpus · 15 DOI Records</h3>',
        '<h3 data-no-i18n="true">WPA DOI Corpus · Canonical Public Index</h3>',
    )
    text = replace_if_present(
        text,
        '<p data-i18n="institute.tools_hub.dois.text">WPA Zenodo корпусот содржи 15 јавни DOI записи: 12 Working Papers (WP-001–WP-012) и 3 Protocol Notes (PN-001–PN-003). Најновата публикација е WPA-PN-003: Les Invalides 2026.</p>',
        '<p data-no-i18n="true">Канонскиот јавен DOI корпус на WPA ги опфаќа Working Papers, Protocol Notes и други DOI-врзани изданија. Овој блок намерно не користи рачно закован вкупен број: тековната состојба се чита од канонските Publications / Working Papers / Protocol Notes индекси, со што се спречува верзиски дрифт.</p>',
    )
    text = replace_if_present(
        text,
        '<a class="btn btn-primary" data-i18n="institute.tools_hub.dois.cta" href="working-papers/">Отвори ги 15-те DOI записи →</a>',
        '<a class="btn btn-primary" data-no-i18n="true" href="working-papers/">Отвори го канонскиот DOI индекс →</a>',
    )
    text = replace_if_present(
        text,
        '<a class="btn btn-primary" data-i18n="institute.footer.cta_working_papers" href="working-papers/">WPA Zenodo DOI индекс · 15 записи →</a>',
        '<a class="btn btn-primary" data-no-i18n="true" href="working-papers/">WPA DOI индекс →</a>',
    )

    # 7) Make the Protocol Notes card current and future-proof.
    new_pn_card = '''<div class="pub-card" id="wpa-protocol-notes" data-no-i18n="true">
<div class="pub-meta">СЕРИЈА · 02 · PN-001–PN-009</div>
<h3>WPA Protocol Notes · PN-001–PN-009</h3>
<p>Кратка, применета и изворно дисциплинирана WPA серија. Тековната јавна серија е проширена до PN-009; канонскиот индекс, а не оваа картичка, е извор на вистината за идните дополнувања. PN-009 ја разработува AI transparency, authorship, provenance и human responsibility по 2 август 2026.</p>
<span class="pub-frequency">Published · PN-001–PN-009 · 2026</span>
<p style="margin-top:14px"><a href="protocol-notes/" style="color:var(--navy);font-weight:700">Отвори Protocol Notes индекс →</a> · <a href="https://doi.org/10.5281/zenodo.21933739" target="_blank" rel="noopener" style="color:var(--navy);font-weight:700">PN-009 DOI ↗</a></p>
</div>'''
    text = regex_once(text, r'<div class="pub-card" id="wpa-protocol-notes">.*?</div>', new_pn_card, "Protocol Notes current card")
    text = replace_if_present(text, '>WPA Protocol Notes 001–003</a>', '>WPA Protocol Notes</a>')
    text = replace_if_present(text, 'New: WPA-PN-003 ↗', 'Protocol Notes ↗')
    text = replace_if_present(text, 'href="https://doi.org/10.5281/zenodo.21390763" target="_blank" rel="noopener">Protocol Notes ↗', 'href="protocol-notes/">Protocol Notes ↗')

    # 8) Add one compact ecosystem gateway instead of more menu items.
    if 'WPA ECOSYSTEM GATEWAYS 2026-08-26' not in text:
        gateway = '''<!-- WPA ECOSYSTEM GATEWAYS 2026-08-26 START -->
<section id="wpa-ecosystem-gateways" style="background:#f7f3e8;border-top:1px solid #d8d2bc;border-bottom:1px solid #d8d2bc;padding:54px 32px">
<div class="container">
<div class="section-label">Institute → WPA ecosystem</div>
<h2 class="section-title">Од истражување кон учење, примена и јавна доверба</h2>
<p class="section-lead">WPA Institute е истражувачкиот, методолошкиот и аналитичкиот слој на World Protocol Academy. Програмите, професионалната сертификациска рамка, студентските алатки и јавните тематски лаборатории се достапни преку нивните канонски WPA страници.</p>
<div class="domains-grid">
<div class="domain-card"><div class="domain-tag">Education</div><h3>Programme Architecture</h3><p>Foundation → Professional → Advanced → Trainer / Consultant.</p><p><a href="programmes.html">WPA Programmes →</a> · <a href="certification.html">Certification Framework →</a></p></div>
<div class="domain-card"><div class="domain-tag">Access</div><h3>WPA Card & Member Benefits</h3><p>Јасна пристапна и членска архитектура, одвоена од академското истражување.</p><p><a href="wpa-card.html">WPA Card →</a> · <a href="passive-revenue.html">Member Benefits →</a></p></div>
<div class="domain-card"><div class="domain-tag">Practice</div><h3>Cultural Diplomacy & Symbols</h3><p>Културна дипломатија, сценарија и source-disciplined protocol-symbols work.</p><p><a href="index.html#cultural-diplomacy-cooperation">Cultural Diplomacy →</a> · <a href="wpaws/protocol-symbols/">Protocol Symbols Lab →</a></p></div>
<div class="domain-card"><div class="domain-tag">Learning tools</div><h3>Student Desk & Professional Tools</h3><p>Контролиран студентски и професионален влез без мешање со институтската методологија.</p><p><a href="student-desk/">Student Desk Beta →</a> · <a href="index.html#professional-english">Professional English →</a> · <a href="audio-media-engine.html">Audio Media Engine →</a></p></div>
</div>
</div>
</section>
<!-- WPA ECOSYSTEM GATEWAYS 2026-08-26 END -->\n'''
        text = text.replace('<section id="institute-publications">', gateway + '<section id="institute-publications">', 1)

    # 9) Institutional contact matrix and legal links, without seven-address clutter.
    old_contact = '''<a data-i18n="a_footer.2" href="mailto:info@worldprotocolacademy.mk">info@worldprotocolacademy.mk</a>
<a data-i18n="institute.footer.link_home" href="index.html">Почетна</a>
<a data-i18n="institute.footer.link_privacy" href="privacy.html">Privacy</a>
<a data-i18n="institute.footer.link_rights" href="rights-takedown.html">Rights &amp; Takedown</a>'''
    new_contact = '''<a href="mailto:info@worldprotocolacademy.mk">info@worldprotocolacademy.mk</a>
<a href="mailto:institute@worldprotocolacademy.mk">institute@worldprotocolacademy.mk</a>
<a href="mailto:journal@worldprotocolacademy.mk">journal@worldprotocolacademy.mk</a>
<a href="mailto:sande@worldprotocolacademy.mk">sande@worldprotocolacademy.mk</a>
<a href="index.html">Почетна</a>
<a href="privacy.html">Privacy</a>
<a href="terms.html">Terms</a>
<a href="cookies.html">Cookies</a>
<a href="rights-takedown.html">Rights &amp; Takedown</a>'''
    text = replace_if_present(text, old_contact, new_contact)

    write(path, text)


def patch_home() -> None:
    path = "index.html"
    text = read(path)

    # Main navigation: keep the wealth of content, reduce the first-entry noise.
    if 'data-wpa-nav="home-20260826"' not in text:
        nav = '''<nav class="site-nav" aria-label="Главна навигација" data-wpa-nav="home-20260826">
<ul>
<li><a href="#about">За WPA</a></li>
<li><a href="institute.html">WPA Institute</a></li>
<li><a href="programmes.html">Програми</a></li>
<li><a href="bibliography/">Истражување &amp; публикации</a></li>
<li><a href="journal/">WPA Journal</a></li>
<li><a href="tools/wpa-five-engines.html">Алатки &amp; AI</a></li>
<li><a href="wpaws/">WPAWS</a></li>
<li><a href="security.html">Доверба</a></li>
<li><a href="student-desk/">Student Desk</a></li>
</ul>
</nav>'''
        text = regex_once(text, r'<nav class="site-nav"[^>]*>.*?</nav>', nav, "Home primary navigation")

    # Hierarchy bridge: main WPA -> Institute / Journal / Programmes / trust surfaces.
    if 'WPA INSTITUTIONAL GATEWAY 2026-08-26' not in text:
        gateway = '''<!-- WPA INSTITUTIONAL GATEWAY 2026-08-26 START -->
<section id="wpa-institutional-gateway" class="accent">
<div class="container">
<div class="sh"><div class="section-label">Institutional map</div><h3 class="section-title">Еден WPA влез. Јасни институционални слоеви.</h3><p class="section-lead">Главната WPA е јавниот влез за програми, услуги и ресурси. WPA Institute е истражувачкиот, методолошкиот и аналитичкиот слој; WPA Journal е уредувачкиот публикациски слој; програмите и Student Desk се професионалниот learning layer.</p></div>
<div class="g4">
<div class="card"><h4>WPA Institute</h4><p>Research · methodology · Protocolometry · institutional analysis.</p><a class="card-link" href="institute.html">Отвори Institute →</a><br><a class="card-link" href="institute.html#charter">Institute Charter →</a></div>
<div class="card"><h4>Evidence & Benchmark</h4><p>Official bibliography, Master List and transparent correction/evidence routes.</p><a class="card-link" href="bibliography/">Bibliography →</a><br><a class="card-link" href="wpa-global-institutions-master-list.html">Master List →</a></div>
<div class="card"><h4>OPC 2026 · Ohrid</h4><p>Conference and pilot-facing gateway, separated from permanent Institute doctrine.</p><a class="card-link" href="opc2026/">OPC 2026 →</a></div>
<div class="card"><h4>Learning & Access</h4><p>Programmes, professional certification framework and WPA Card live in their own public surfaces.</p><a class="card-link" href="programmes.html">Programmes →</a><br><a class="card-link" href="wpa-card.html">WPA Card →</a></div>
</div>
</div>
</section>
<!-- WPA INSTITUTIONAL GATEWAY 2026-08-26 END -->\n'''
        text = text.replace('<section id="certification">', gateway + '<section id="certification">', 1)

    # Keep current revision dates synchronized when the older public date is present.
    text = text.replace('25 август 2026', DATE_MK)
    text = text.replace('25 August 2026', DATE_EN)

    # Site-wide legal gateway in the main footer, without replacing the existing contact matrix.
    if 'data-wpa-legal-links="20260826"' not in text:
        legal = '''<div data-wpa-legal-links="20260826" style="margin-top:16px;font-size:12px;line-height:1.7;text-align:center">
<a href="privacy.html">Privacy</a> · <a href="terms.html">Terms of Use</a> · <a href="cookies.html">Cookie Policy</a> · <a href="rights-takedown.html">Rights &amp; Takedown</a> · <a href="correction-request.html">Correction Request</a>
</div>\n'''
        text = text.replace('</footer>', legal + '</footer>', 1)

    write(path, text)


def patch_bibliography() -> None:
    path = "bibliography/index.html"
    text = read(path)

    # Canonical public count: 6 monographs/handbooks + 1 dissertation + 19 papers = 26.
    text = text.replace('<div class="counter-num">25</div>\n<div class="counter-label">Вкупно публикации<br/>Total Publications</div>', '<div class="counter-num">26</div>\n<div class="counter-label">Вкупно публикации<br/>Total Publications</div>', 1)
    text = text.replace('<div class="counter-num">5</div>\n<div class="counter-label">Монографии и прирачници<br/>Monographs &amp; Handbooks</div>', '<div class="counter-num">6</div>\n<div class="counter-label">Монографии и прирачници<br/>Monographs &amp; Handbooks</div>', 1)

    # Add the already-published sixth book to the canonical bibliography using the stable scholar deep-link id pub-26.
    if 'id="pub-26"' not in text:
        entry = '''<!-- 26 · added to canonical bibliography 2026-08-26 -->
<div class="bib-entry" data-doi="" data-index="isbn cobiss scholar" data-search="26 протокол на државни симболи химни и национални денови protocol of state symbols anthems and national days 2026 isbn 978-608-66168-5-4 cobiss 69316613 95 calendar entries 197 states protocol entities" data-title="Протокол на државни симболи, химни и национални денови" data-type="monograph" data-year="2026" id="pub-26">
<div class="bib-num">26</div>
<div class="bib-mk">Протокол на државни симболи, химни и национални денови: 95 календарски записи: 197 држави и протоколарни ентитети</div>
<div class="bib-en">Protocol of State Symbols, Anthems and National Days: 95 Calendar Entries: 197 States and Protocol Entities</div>
<div class="bib-meta"><strong>2026</strong> &nbsp;|&nbsp; Печатена книга / Printed book &nbsp;|&nbsp; Pelince: S. Smiljanov &nbsp;|&nbsp; 74 pages<br/><strong>ISBN</strong> 978-608-66168-5-4 &nbsp;|&nbsp; <strong>COBISS.MK-ID</strong> 69316613</div>
<div class="bib-tags"><span class="bib-tag">Monograph</span><span class="bib-tag green">COBISS</span></div>
<div class="bib-links"><a class="bib-link-btn" href="/scholar/book-protocol-state-symbols-2026.html">Scholar record →</a><a class="bib-link-btn" href="https://plus.cobiss.net/cobiss/mk/mk/data/cobib/69316613" target="_blank" rel="noopener">COBISS →</a></div>
</div>
'''
        marker = '<h2 class="part-heading" id="dissertation">II. Докторска дисертација · Doctoral Dissertation</h2>'
        if marker not in text:
            raise RuntimeError("Bibliography dissertation marker missing")
        text = text.replace(marker, entry + marker, 1)

    # Bump only the bibliography publication shell, not the version labels of individual works.
    text = text.replace('WPA-BIB-001 v1.3 Interactive | Официјална библиографија', 'WPA-BIB-001 v1.4 Interactive | Официјална библиографија', 1)
    text = text.replace('WPA-BIB-001 v1.3 Interactive — Официјална библиографија', 'WPA-BIB-001 v1.4 Interactive — Официјална библиографија', 1)
    text = text.replace('<!-- WPA-BIB-001 v1.3 Interactive generated with smart search, filters, live counter, APA citation copy, deep links, print CSS and back-to-top. -->', '<!-- WPA-BIB-001 v1.4 Interactive · canonical count synchronized 2026-08-26. -->', 1)
    text = text.replace('Последно ажурирано: 16 јули 2026 · Last updated: 16 July 2026 · WPA-BIB-001 v1.3 Interactive', f'Последно ажурирано: {DATE_MK} · Last updated: {DATE_EN} · WPA-BIB-001 v1.4 Interactive', 1)

    write(path, text)


def legal_page(title_mk: str, title_en: str, intro: str, body: str) -> str:
    return f'''<!DOCTYPE html>
<html lang="mk" data-wpa-legal="{MARK}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title_en} · World Protocol Academy</title>
<meta name="description" content="{title_en} for the World Protocol Academy public digital platform.">
<link rel="canonical" href="https://worldprotocolacademy.mk/{'terms.html' if 'Terms' in title_en else 'cookies.html'}">
<style>
:root{{--navy:#0d1f3c;--gold:#c9a84c;--cream:#f8f4ee;--paper:#fffdf8;--ink:#1d2430;--muted:#5a6577;--line:#ddd3c3}}*{{box-sizing:border-box}}body{{margin:0;background:var(--cream);color:var(--ink);font:16px/1.72 system-ui,-apple-system,Segoe UI,Arial,sans-serif}}header{{background:var(--navy);color:var(--cream);border-bottom:2px solid var(--gold)}}.wrap{{max-width:900px;margin:auto;padding:28px 22px}}header a{{color:#ead99d;text-decoration:none;font-weight:800}}h1,h2{{font-family:Georgia,'Times New Roman',serif}}h1{{font-size:clamp(32px,5vw,52px);margin:18px 0 8px}}h2{{color:var(--navy);margin:1.8em 0 .45em}}main .wrap{{background:var(--paper);margin-top:28px;margin-bottom:28px;border:1px solid var(--line);border-top:4px solid var(--gold)}}p,li{{max-width:76ch}}.status{{padding:12px 15px;background:#f5efdc;border-left:4px solid var(--gold)}}a{{color:#684f10}}footer{{background:var(--navy);color:#d9dce3}}footer a{{color:#ead99d}}
</style>
</head>
<body><header><div class="wrap"><a href="/">← World Protocol Academy</a><h1>{title_mk}</h1><div>{title_en}</div></div></header>
<main><div class="wrap"><p class="status">{intro}</p>{body}<h2>Контакт · Contact</h2><p><a href="mailto:info@worldprotocolacademy.mk">info@worldprotocolacademy.mk</a></p><p><small>Последно ажурирање: {DATE_MK} · Last updated: {DATE_EN}</small></p></div></main>
<footer><div class="wrap"><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · <a href="cookies.html">Cookies</a> · <a href="rights-takedown.html">Rights &amp; Takedown</a> · <a href="correction-request.html">Correction Request</a><p>© 2026 World Protocol Academy</p></div></footer></body></html>'''


def write_legal_pages() -> None:
    terms_body = '''
<h2>1. Статус на платформата · Platform status</h2><p>World Protocol Academy (WPA) е независна дигитална образовна, истражувачка и авторска платформа во развојна, тест и пробна фаза — 2026. WPA не се претставува како универзитет, државна институција, тело за акредитација или degree-granting institution.</p>
<h2>2. Образовна и истражувачка употреба · Educational and research use</h2><p>Јавната содржина е наменета за образование, истражување, професионална ориентација и институционална дискусија. Таа не е автоматска замена за правен, медицински, безбедносен или друг регулиран професионален совет.</p>
<h2>3. Сертификациска јасност · Certification clarity</h2><p>Јавните certification pages опишуваат професионална non-degree рамка. Официјалното издавање и регистарска верификација не се сметаат за активни освен кога конкретна WPA страница и проверлив регистар изречно покажуваат спротивно.</p>
<h2>4. Авторски права и лиценци · Copyright and licences</h2><p>Освен кога е наведено поинаку, текстовите, дизајнот, методологиите и WPA авторските материјали се заштитени. Посебно лиценцираните дигитални производи се уредуваат и со нивните важечки лиценцни услови. Цитирање и академско упатување треба да го зачуваат авторството и изворот.</p>
<h2>5. AI и човечка одговорност · AI and human responsibility</h2><p>AI може да се користи како помошна алатка за пребарување, анализа, нацрти и workflow support. AI output не создава сам по себе институционален мандат. Последично значајните WPA одлуки остануваат предмет на човечко овластување и одговорност.</p>
<h2>6. Точност, промени и корекции · Accuracy, changes and corrections</h2><p>WPA користи evidence, provenance и correction pathways, но јавната дигитална содржина може да се ажурира. За материјални корекции користете ја страницата Correction Request; за права и отстранување — Rights &amp; Takedown.</p>
<h2>7. Надворешни врски · External links</h2><p>Надворешните страници, DOI, COBISS, научни профили и други third-party services се управувани од нивните сопствени оператори. Линкот не значи автоматско институционално одобрување или партнерство.</p>'''
    terms_intro = 'Овие услови ја објаснуваат јавната употреба на WPA сајтот. Тие се институционална информативна рамка, а не замена за индивидуален правен совет. / These terms explain public use of the WPA site and are not a substitute for individual legal advice.'
    write("terms.html", legal_page("Услови за користење", "Terms of Use", terms_intro, terms_body))

    cookies_body = '''
<h2>1. Основна логика · Basic logic</h2><p>WPA настојува јавниот сајт да функционира со минимално потребни технички идентификатори. Функционалните browser/local-storage вредности може да се користат за избор на јазик, consent state и слични кориснички поставки.</p>
<h2>2. Аналитика · Analytics</h2><p>Google Analytics 4 се активира само по изречна согласност на посетителот. Аналитички колачиња и слични идентификатори не треба да се активираат пред изборот „Прифати аналитика“. Advertising signals и персонализирано рекламирање се исклучени во WPA privacy design.</p>
<h2>3. Одбивање и ресетирање · Reject and reset</h2><p>Посетителот може да ја одбие аналитиката и да ги промени browser/site consent поставките. WPA privacy layer ги зема предвид Global Privacy Control и Do Not Track кога прелистувачот ги испраќа.</p>
<h2>4. Hosting и трети страни · Hosting and third parties</h2><p>Сајтот користи GitHub Pages и може да линкува кон DOI, COBISS, Google, научни профили и други third-party services. Тие провајдери можат да обработуваат технички податоци според сопствените политики кога нивните услуги се користат.</p>
<h2>5. Сесии и безбедност · Sessions and security</h2><p>Колачињата или сесиските токени не треба да се толкуваат како институционален мандат. Технички валидна сесија докажува пристап во рамките на системот; не создава сама по себе право за последично значајно дејство.</p>
<h2>6. Поврзана политика · Related policy</h2><p>За лични податоци, retention, права за пристап/корекција/бришење и контакт, меродавна е <a href="privacy.html">Privacy Policy</a>.</p>'''
    cookies_intro = 'Оваа страница ја издвојува cookie/analytics логиката што веќе е опишана во WPA Privacy Policy, за посетителот полесно да ја најде. / This page surfaces the cookie and analytics logic already described in the WPA Privacy Policy.'
    write("cookies.html", legal_page("Политика за колачиња", "Cookie Policy", cookies_intro, cookies_body))

    # Cross-link the existing privacy policy; do not rewrite its already-current substance.
    privacy = read("privacy.html")
    if 'href="terms.html"' not in privacy:
        bridge = '<div class="xlink">Поврзани правила · Related policies: <a href="terms.html">Terms of Use</a> · <a href="cookies.html">Cookie Policy</a> · <a href="rights-takedown.html">Rights &amp; Takedown</a></div>'
        privacy = privacy.replace('</div></main>', bridge + '</div></main>', 1)
    write("privacy.html", privacy)


def write_decision_log() -> None:
    report = f'''# WPA Kimi Audit · Delta Remediation Decision Log

Date: {DATE_EN}
Status: implemented as guarded delta remediation

## Confirmed and remediated
- Institute footer date: 10 June 2026 -> {DATE_EN}.
- Institute stale DOI block: removed hard-coded 15-record / PN-001-PN-003 claim; canonical index is now the source of truth.
- Institute Protocol Notes surface: synchronized to PN-001-PN-009 and PN-009 DOI evidence.
- Official bibliography: 25 -> 26 total; 5 -> 6 monographs/handbooks; the 2026 State Symbols book is added as stable `#pub-26` with ISBN 978-608-66168-5-4 and COBISS.MK-ID 69316613.
- Main WPA and Institute navigation: first-entry menus compressed; content was not deleted.
- Cross-link hierarchy: explicit WPA -> Institute / Journal / learning / evidence gateways added.
- Institute -> programmes, certification, WPA Card, Cultural Diplomacy, Protocol Symbols, Student Desk, Professional English and Audio Media links added as one compact ecosystem gateway.
- Institute contact surface expanded to a small role-based matrix.
- General Terms of Use and a standalone Cookie Policy added; existing Privacy Policy is preserved and cross-linked.

## Audit points already resolved before this remediation
- HGAIM already states the correct academic count: 26 = 6 monographs/manuals + 1 dissertation + 19 papers/contributions.
- HGAIM already uses status discipline and Human Authority; real enrolment, payment and official certificate issuance remain disabled pending approved backend/reviews.
- Privacy Policy already contains substantive privacy, GA4 consent, cookie, retention and data-rights text.
- Main WPA does not need a second full HGAIM specification; Institute remains the canonical detailed HGAIM surface.

## Not applied because the current master does not support the audit claim
- Pilot 20 / WPA Sublimate remediation: those strings were not present in the current Institute master checked on {DATE_EN}; nothing was added merely to satisfy an older audit snapshot.
- A new fixed DOI total was not introduced. Fixed counters create the same version-drift problem the audit identified.

## Governing design rule
Content is retained and hierarchised. Public entry noise is reduced. Canonical evidence pages remain the source of truth for changing counts and series.
'''
    write("docs/WPA_KIMI_AUDIT_DELTA_2026-08-26.md", report)


def verify() -> None:
    inst = read("institute.html")
    home = read("index.html")
    bib = read("bibliography/index.html")
    privacy = read("privacy.html")
    assert 'data-wpa-nav="institute-20260826"' in inst
    assert 'data-wpa-nav="home-20260826"' in home
    assert "10 јуни 2026" not in inst
    assert "15 DOI Records" not in inst
    assert "15 јавни DOI записи" not in inst
    assert "WPA Protocol Notes · PN-001–PN-009" in inst
    assert "WPA Zenodo DOI индекс · 15 записи" not in inst
    assert '<div class="counter-num">26</div>' in bib
    assert '<div class="counter-num">6</div>' in bib
    assert 'id="pub-26"' in bib
    assert "978-608-66168-5-4" in bib
    assert "69316613" in bib
    assert "WPA-BIB-001 v1.4" in bib
    assert (ROOT / "terms.html").exists()
    assert (ROOT / "cookies.html").exists()
    assert 'href="terms.html"' in privacy and 'href="cookies.html"' in privacy
    assert (ROOT / "docs/WPA_KIMI_AUDIT_DELTA_2026-08-26.md").exists()


def main() -> None:
    patch_institute()
    patch_home()
    patch_bibliography()
    write_legal_pages()
    write_decision_log()
    verify()
    print("WPA Kimi delta remediation 2026-08-26 applied and verified.")


if __name__ == "__main__":
    main()

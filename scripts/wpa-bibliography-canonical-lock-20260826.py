from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
DATE_MK = "26 август 2026"
DATE_EN = "26 August 2026"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, text):
    (ROOT / path).write_text(text, encoding="utf-8")


def patch_institute():
    path = "institute.html"
    text = read(path)

    # Canonical publication metrics supplied by the official current bibliography.
    text = text.replace(
        '<h3 data-no-i18n="true">WPA DOI Corpus · Canonical Public Index</h3>',
        '<h3 data-no-i18n="true">WPA Zenodo Corpus · 23 Public Records</h3>'
    )
    text = text.replace(
        '<p data-no-i18n="true">Канонскиот јавен DOI корпус на WPA ги опфаќа Working Papers, Protocol Notes и други DOI-врзани изданија. Овој блок намерно не користи рачно закован вкупен број: тековната состојба се чита од канонските Publications / Working Papers / Protocol Notes индекси, со што се спречува верзиски дрифт.</p>',
        '<p data-no-i18n="true">Канонскиот WPA Zenodo корпус содржи <strong>23 јавни записи</strong>: <strong>13 WPA Working Papers + 9 WPA Protocol Notes + 1 Global Strategic Plan</strong>. Working Papers и Protocol Notes се посебни WPA серии и не се вклучуваат во бројката од 26 академски публикации.</p>'
    )
    text = text.replace(
        '<a class="btn btn-primary" data-no-i18n="true" href="working-papers/">Отвори го канонскиот DOI индекс →</a>',
        '<a class="btn btn-primary" data-no-i18n="true" href="working-papers/">Отвори 23 WPA Zenodo записи →</a>'
    )
    text = text.replace(
        '<a class="btn btn-primary" data-no-i18n="true" href="working-papers/">WPA DOI индекс →</a>',
        '<a class="btn btn-primary" data-no-i18n="true" href="working-papers/">23 WPA Zenodo записи →</a>'
    )

    # Add one compact metrics strip if absent.
    if 'data-wpa-publication-metrics="20260826"' not in text:
        metrics = '''<div data-wpa-publication-metrics="20260826" style="margin:18px 0 0;padding:14px 16px;border:1px solid rgba(201,168,76,.32);background:#fffdf5;font:700 12px/1.7 Inter,system-ui,sans-serif;color:#334b5e">
26 Academic Publications · 6 Monographs/Handbooks · 1 Doctoral Dissertation · 19 Papers/Contributions · 13 Working Papers · 9 Protocol Notes · 22 WPA Series DOI Records · 23 Total WPA Zenodo Records
</div>'''
        needle = '<section id="institute-publications">\n<div class="container">'
        if needle in text:
            text = text.replace(needle, needle + '\n' + metrics, 1)

    # Keep PN series exact.
    text = text.replace('WPA Protocol Notes · PN-001–PN-009', 'WPA Protocol Notes · PN-001–PN-009')
    write(path, text)


def patch_bibliography():
    path = "bibliography/index.html"
    text = read(path)

    # Ensure the official current master metrics are visible and internally consistent.
    text = text.replace('<div class="counter-num">25</div>', '<div class="counter-num">26</div>', 1)
    text = text.replace('<div class="counter-num">5</div>', '<div class="counter-num">6</div>', 1)

    # Upgrade old Zenodo summary figures where still present.
    text = re.sub(r'(<strong>)(12)(</strong>\s*<span>Zenodo DOI)', r'\g<1>13\g<3>', text, count=1)
    text = text.replace('12 WPA Working Papers', '13 WPA Working Papers')
    text = text.replace('WP-001–WP-012', 'WP-001–WP-013')
    text = text.replace('12/12', '13/13')

    # Add canonical metrics block near the hero counters if it is missing.
    if 'data-wpa-research-metrics="20260826"' not in text:
        block = '''<div data-wpa-research-metrics="20260826" style="margin:18px 0 24px;padding:16px 18px;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;background:rgba(201,168,76,.08);color:rgba(255,255,255,.82);font-size:13px;line-height:1.75">
<strong>WPA Research Metrics · WPA Истражувачки показатели</strong><br>
26 Academic Publications · 13 WPA Working Papers (Zenodo DOI) · 9 WPA Protocol Notes (Zenodo DOI) · 22 WPA Series DOI Records · 1 Global Strategic Plan report (Zenodo DOI) · <strong>23 Total WPA Zenodo Records</strong> · 6 Monographs and Handbooks · 1 Doctoral Dissertation
</div>'''
        marker = '<!-- MAIN CONTENT -->'
        if marker in text:
            # Put the block after the hero section, before main content if possible.
            text = text.replace(marker, block + '\n' + marker, 1)

    # Current official bibliography shell date/version.
    text = text.replace('Последно ажурирано: 17 август 2026', f'Последно ажурирано: {DATE_MK}')
    text = text.replace('Last updated: 17 August 2026', f'Last updated: {DATE_EN}')
    write(path, text)


def verify():
    inst = read("institute.html")
    bib = read("bibliography/index.html")
    assert "23 Public Records" in inst
    assert "13 WPA Working Papers + 9 WPA Protocol Notes + 1 Global Strategic Plan" in inst
    assert "26 Academic Publications" in inst
    assert "23 Total WPA Zenodo Records" in inst
    assert '<div class="counter-num">26</div>' in bib
    assert '<div class="counter-num">6</div>' in bib
    assert "23 Total WPA Zenodo Records" in bib


if __name__ == "__main__":
    patch_institute()
    patch_bibliography()
    verify()
    print("Canonical WPA bibliography metrics locked: 26 academic / 23 Zenodo.")

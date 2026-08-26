from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATE_MK = "26 август 2026"
DATE_EN = "26 August 2026"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def write(path, text):
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_publication_metrics(text):
    replacements = {
        "15 Total Zenodo DOI Records": "23 Total WPA Zenodo Records",
        "15 WPA Zenodo DOI Records": "23 WPA Zenodo Records",
        "12 WPA Working Papers + 3 WPA Protocol Notes": "13 WPA Working Papers + 9 WPA Protocol Notes + 1 Global Strategic Plan",
        "12 Working Papers + 3 Protocol Notes = 15 Zenodo DOI records": "13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23 Zenodo records",
        "12 WPA Working Papers (Zenodo DOI)": "13 WPA Working Papers (Zenodo DOI)",
        "3 WPA Protocol Notes (Zenodo DOI)": "9 WPA Protocol Notes (Zenodo DOI)",
        "15 Total WPA Zenodo Records": "23 Total WPA Zenodo Records",
        "15 Zenodo DOI Records": "23 Zenodo Records",
        "15 Zenodo DOI records": "23 Zenodo records",
        "12 Working Papers + 3 Protocol Notes": "13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan",
        "12 Working Papers": "13 Working Papers",
        "3 Protocol Notes": "9 Protocol Notes",
        "WP-001–WP-012": "WP-001–WP-013",
        "12/12": "13/13",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def patch_institute():
    path = "institute.html"
    text = replace_publication_metrics(read(path))

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

    if 'data-wpa-publication-metrics="20260826"' not in text:
        metrics = '''<div data-wpa-publication-metrics="20260826" style="margin:18px 0 0;padding:14px 16px;border:1px solid rgba(201,168,76,.32);background:#fffdf5;font:700 12px/1.7 Inter,system-ui,sans-serif;color:#334b5e">
26 Academic Publications · 6 Monographs/Handbooks · 1 Doctoral Dissertation · 19 Papers/Contributions · 13 Working Papers · 9 Protocol Notes · 22 WPA Series DOI Records · 23 Total WPA Zenodo Records
</div>'''
        needle = '<section id="institute-publications">\n<div class="container">'
        if needle in text:
            text = text.replace(needle, needle + '\n' + metrics, 1)
    write(path, text)


def patch_bibliography():
    path = "bibliography/index.html"
    text = replace_publication_metrics(read(path))
    text = text.replace('<div class="counter-num">25</div>', '<div class="counter-num">26</div>', 1)
    text = text.replace('<div class="counter-num">5</div>', '<div class="counter-num">6</div>', 1)
    text = re.sub(r'(<strong>)(12)(</strong>\s*<span>Zenodo DOI)', r'\g<1>13\g<3>', text, count=1)
    text = text.replace(
        '• 13 WPA Working Papers (Zenodo DOI)<br/>\n      • 9 WPA Protocol Notes (Zenodo DOI)<br/>\n      • 23 Total WPA Zenodo Records<br/>',
        '• 13 WPA Working Papers (Zenodo DOI)<br/>\n      • 9 WPA Protocol Notes (Zenodo DOI)<br/>\n      • 1 Global Strategic Plan (Zenodo DOI)<br/>\n      • 22 WPA Series DOI Records<br/>\n      • 23 Total WPA Zenodo Records<br/>'
    )
    text = text.replace(
        '<strong>◆ 23 WPA Zenodo Records · 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan</strong>',
        '<strong>◆ 23 WPA Zenodo Records · 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan</strong>'
    )
    if 'data-wpa-research-metrics="20260826"' not in text:
        block = '''<div data-wpa-research-metrics="20260826" style="margin:18px 0 24px;padding:16px 18px;border:1px solid rgba(201,168,76,.35);border-left:4px solid #c9a84c;background:rgba(201,168,76,.08);color:rgba(255,255,255,.82);font-size:13px;line-height:1.75">
<strong>WPA Research Metrics · WPA Истражувачки показатели</strong><br>
26 Academic Publications · 13 WPA Working Papers (Zenodo DOI) · 9 WPA Protocol Notes (Zenodo DOI) · 22 WPA Series DOI Records · 1 Global Strategic Plan report (Zenodo DOI) · <strong>23 Total WPA Zenodo Records</strong> · 6 Monographs and Handbooks · 1 Doctoral Dissertation
</div>'''
        marker = '<!-- MAIN CONTENT -->'
        if marker in text:
            text = text.replace(marker, block + '\n' + marker, 1)
    text = text.replace('Последно ажурирано: 17 август 2026', f'Последно ажурирано: {DATE_MK}')
    text = text.replace('Last updated: 17 August 2026', f'Last updated: {DATE_EN}')
    write(path, text)


def patch_metrics_json():
    path = ROOT / "data/wpa-canonical-metrics-status.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["zenodo_doi_corpus"] = {
        "total_records": 23,
        "working_papers": 13,
        "protocol_notes": 9,
        "global_strategic_plans": 1,
        "series_doi_records": 22,
        "separate_from_academic_publication_total": True,
        "canonical_source": "/working-papers/",
        "counting_rule": "13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23 public Zenodo records; the 22 WPA series DOI records are distinct from the 1 strategic-plan report; this Zenodo corpus is not added to the 26 academic-publication count"
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def patch_metrics_html():
    path = "wpa-metrics-status.html"
    text = replace_publication_metrics(read(path))
    text = re.sub(
        r'<div class="panel"><h3>Zenodo DOI corpus</h3><p>.*?</p><a class="source" href="/working-papers/">',
        '<div class="panel"><h3>Zenodo corpus</h3><p><strong>23 записи = 13 WPA Working Papers + 9 WPA Protocol Notes + 1 Global Strategic Plan.</strong> Working Papers и Protocol Notes создаваат 22 WPA series DOI records; Strategic Plan е посебен Zenodo report. Овој Zenodo корпус не се додава врз бројката 26 академски публикации.</p><a class="source" href="/working-papers/">',
        text,
        count=1,
        flags=re.S
    )
    write(path, text)


def patch_other_public_surfaces():
    paths = [
        "index.html",
        "papers.html",
        "protocol-notes/index.html",
        "intelligence-center.html",
        "strategy/master-strategy-2026-2030.html",
        "journal/vol-1-issue-1-2026.html",
    ]
    for path in paths:
        p = ROOT / path
        if p.exists():
            write(path, replace_publication_metrics(read(path)))


def verify():
    inst = read("institute.html")
    bib = read("bibliography/index.html")
    metrics_html = read("wpa-metrics-status.html")
    metrics = json.loads(read("data/wpa-canonical-metrics-status.json"))
    assert "23 Public Records" in inst
    assert "13 WPA Working Papers + 9 WPA Protocol Notes + 1 Global Strategic Plan" in inst
    assert "26 Academic Publications" in inst
    assert "23 Total WPA Zenodo Records" in inst
    assert '<div class="counter-num">26</div>' in bib
    assert '<div class="counter-num">6</div>' in bib
    assert "23 Total WPA Zenodo Records" in bib
    assert "23 записи = 13 WPA Working Papers + 9 WPA Protocol Notes + 1 Global Strategic Plan" in metrics_html
    z = metrics["zenodo_doi_corpus"]
    assert z["total_records"] == 23
    assert z["working_papers"] == 13
    assert z["protocol_notes"] == 9
    assert z["global_strategic_plans"] == 1
    assert z["series_doi_records"] == 22
    for path in ["bibliography/index.html", "wpa-metrics-status.html", "data/wpa-canonical-metrics-status.json"]:
        text = read(path)
        assert "15 Total Zenodo DOI Records" not in text
        assert "15 WPA Zenodo DOI Records" not in text
        assert "12 WPA Working Papers + 3 WPA Protocol Notes" not in text


if __name__ == "__main__":
    patch_institute()
    patch_bibliography()
    patch_metrics_json()
    patch_metrics_html()
    patch_other_public_surfaces()
    verify()
    print("Canonical WPA publication metrics locked: 26 academic / 23 Zenodo.")

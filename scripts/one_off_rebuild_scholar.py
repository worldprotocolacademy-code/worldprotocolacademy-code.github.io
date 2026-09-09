from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
SCHOLAR = ROOT / "scholar"
SCHOLAR.mkdir(exist_ok=True)

ACADEMIC = [
    {"id":"p01","title":"(Un)intentional Mistakes in the Field of Protocol: A Question Mark for World Diplomacy","year":"2020","venue":"Безбедност / Security, LXI(5)","pages":"56–71","pdf":"p01-unintentional-mistakes-protocol.pdf"},
    {"id":"p02","title":"Protocol of the Ministry of Interior","year":"2019","venue":"Безбедност / Security, LIX(1)","pages":"55–68","pdf":"p02-protocol-mvr.pdf"},
    {"id":"p03","title":"Constitution and Transformation of Directorate for Security and Counterintelligence (UBK) Through Its History","year":"2018","venue":"EKOB 2018 — Economy in Transformed Security Environment","pages":"330–342","pdf":"p03-ubk-history.pdf","authors":["Smiljanov, Sande","Nuhiu, Agim"]},
    {"id":"p04","title":"Leadership and Protocol — Study Regarding Case Republic of Macedonia","year":"2018","venue":"The Education at the Crossroads — Conditions, Challenges, Solutions and Perspectives","pages":"156–159","pdf":"p04-leadership-protocol.pdf"},
    {"id":"p05","title":"Management and Contemporary Practices in Organizing and Facilitating a Two-Day Planning Conference of an Expert Team","year":"2018","venue":"Зборник на трудови — Актуелни менаџерски практики","pages":"95–100","pdf":"p05-planning-conference.pdf"},
    {"id":"p06","title":"Protocol and Personal Security: Correlation, Coordination and Cooperation for Maximum Effect","year":"2023","venue":"Безбедносни дијалози / Security Dialogues, 14(1)","pages":"213–223","pdf":"p06-protocol-security.pdf","doi":"10.47054/SD23141213s"},
    {"id":"p07","title":"The Influence of the Protocol Through the Prism of Policy","year":"2022","venue":"Security Horizons, III(7)","pages":"201–208","pdf":"p07-protocol-policy.pdf","doi":"10.20544/ICP.3.7.22.P17"},
    {"id":"p08","title":"Protocol as a Practical Tool in Defense Diplomacy","year":"2016","venue":"Security Concepts and Policies — New Generation of Risks and Threats","pages":"311–318","pdf":"p08-protocol-defense-diplomacy.pdf"},
    {"id":"p09","title":"Protocol and Traditions: E pluribus unum","year":"2019","venue":"Современа македонска одбрана / Contemporary Macedonian Defence, XIX(36)","pages":"93–106","pdf":"p09-protocol-traditions.pdf"},
    {"id":"p10","title":"The Aspects of the Diplomatic Protocol Through the Prism of the Russo-Ukrainian Conflict","year":"2022","venue":"International Conference on Security and Crisis Management","pages":"317–324","pdf":"p10-protocol-russo-ukraine.pdf"},
    {"id":"p11","title":"Official Apostolic Visit of Pope Francis to Republic of North Macedonia","year":"2021","venue":"Religious Dialogue and Cooperation, II(2)","pages":"179–188","pdf":"p11-pope-francis-rdc-2021.pdf","doi":"10.47054/RDC212179s"},
    {"id":"p12","title":"West Balkans Migratory Route: Challenge for the Republic of North Macedonia and the Security of Urban Environments","year":"2019","venue":"Безбедносни дијалози / Security Dialogues, 10(1–2)","pages":"217–230","pdf":"p12-west-balkans-migration.pdf"},
    {"id":"p13","title":"State Protocol in the Republic of Macedonia Through Organizational Integration Toward Greater Efficiency","year":"2014","venue":"Fourth International Science Conference: Contemporary Management Challenges and Organizational Sciences","pages":"525–538","pdf":"p13-drzaven-protokol-mk.pdf"},
    {"id":"p14","title":"Corona Virus Handling — Namaste","year":"2022","venue":"Безбедносни дијалози / Security Dialogues, 13(1)","pages":"155–164","pdf":"p14-corona-namaste-full.pdf"},
    {"id":"p15","title":"A Unified State Protocol: Necessity and Norm for the Proper Functioning of State Institutions","year":"2019","venue":"ШТИТ / SHIELD, No. 67","pages":"34–35","pdf":"p15-edinstven-drzaven-protokol.pdf"},
    {"id":"p16","title":"Leadership Characteristics of Responsible Persons in Protocol","year":"2016","venue":"ШТИТ / SHIELD","pages":"20–21","pdf":"p17-protokol-liderski-karakteristiki.pdf"},
    {"id":"p17","title":"Protocol and Public Relations: A and Omega of a Well-Organized Activity","year":"2022","venue":"International Scientific Conference","pages":"135–141","pdf":"p18-protocol-public-relations.pdf"},
    {"id":"p18","title":"Digital Protocol in the Age of Artificial Intelligence: Transformation, Challenges and Strategic Recommendations for Public Sector Management","year":"2026","venue":"XXII International May Conference on Strategic Management — IMCSM26, Volume XXII, Issue (1)","pages":"144–150","pdf":"p19-digital-protocol-ai-public-sector.pdf","doi":"10.5937/IMCSM26144S"},
    {"id":"p19","title":"Military Protocol, Defence Diplomacy and Military Diplomacy — Three Faces of One System","year":"2026","venue":"ШТИТ / SHIELD, No. 200 (June 2026)","pages":"20–21","pdf":"p20-military-protocol-defence-diplomacy-military-diplomacy.pdf"},
]
for rec in ACADEMIC:
    rec.setdefault("authors", ["Smiljanov, Sande"])

WORKING_PAPERS = [
    ("001","Dress Code — In Diplomatic, Business and Military Protocol","10.5281/zenodo.20383554"),
    ("002","Plan B in Protocol — Contingency Procedures in Diplomatic Practice","10.5281/zenodo.20385777"),
    ("003","Beijing Summit 2026 — Comprehensive Protocol Analysis of President Trump's State Visit to the PRC","10.5281/zenodo.20386152"),
    ("004","Visits to China: Trump vs Putin — Protocol-Diplomatic 360° Comparative Analysis","10.5281/zenodo.20386692"),
    ("005","An Empirical Protocol Analysis of the State Visit of President Aleksandar Vučić to the People's Republic of China (24–28 May 2026)","10.5281/zenodo.20434477"),
    ("006","The State Visit of King Charles III to the United States of America (2026): An Anatomy of Ceremonial Diplomacy and Soft Power through the Prism of Protocol","10.5281/zenodo.20528224"),
    ("007","The Beijing Convergence: Western Leaders' State and Official Visits to the People's Republic of China (2025–2026): A Protocol Analysis through the WPA Protocol Soft Power Index","10.5281/zenodo.20597429"),
    ("008","The EU-Western Balkans Summit in Tivat, Montenegro (5 June 2026): Protocol Architecture of Enlargement, Gradual Integration and Regional Security","10.5281/zenodo.20599172"),
    ("009","The Pyongyang Reception: Protocol, Ceremony and Visual Statecraft in Xi Jinping's Visit to the DPRK","10.5281/zenodo.20641840"),
    ("010","A Protocol Anatomy of a Thematic Bilateral: Modi, Macron and Bharat Innovates 2026 — Nice, 14 June 2026","10.5281/zenodo.20706913"),
    ("011","The Vatican Protocol: Sacred Space, Ceremonial Hierarchy and Diplomatic Liturgy in Papal State Visits and Audiences","10.5281/zenodo.20800187"),
    ("012","Ankara 2026: The Sealed Stage — Protocol, Documentary Sovereignty and Visibility Gatekeeping at the 36th NATO Summit","10.5281/zenodo.21299485"),
    ("013","Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia","10.5281/zenodo.21514266"),
]

PROTOCOL_NOTES = [
    ("001","Protocol Note: 52nd G7 Leaders' Summit — Évian-les-Bains, French Republic, 15–17 June 2026","10.5281/zenodo.20727210"),
    ("002","Negative Public Diplomatic Register and Digital Protocol-Diplomatic Demarche — Trump–Meloni Dispute after the 52nd G7 Summit, Évian-les-Bains, 15–17 June 2026","10.5281/zenodo.20777938"),
    ("003","Les Invalides 2026: The Coalition of the Willing Summit and Bastille Day, Paris, 13–14 July 2026","10.5281/zenodo.21390763"),
    ("004","MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test","10.5281/zenodo.21469146"),
    ("005","Protocol of Artificial Intelligence and State Sovereignty","10.5281/zenodo.21651611"),
    ("006","Neuroprotocol 2030: From Thought to Action","10.5281/zenodo.21669195"),
    ("007","Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy","10.5281/zenodo.21772500"),
    ("008","Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will in Networks of AI Agents","10.5281/zenodo.21779849"),
    ("009","AI Transparency and the Protocol of Authorship: Watermarking, Provenance, Human Responsibility and the EU AI Act after 2 August 2026","10.5281/zenodo.21933739"),
]

CSS = """<style>
:root{--navy:#162947;--gold:#9a7728;--bg:#f6f2eb;--text:#1d2430;--muted:#5a6577;--line:#ddd3c3}
*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--text);line-height:1.65}
.wrap{max-width:980px;margin:auto;padding:32px 20px}.top{background:var(--navy);color:#fff}.top a{color:#f4d697}h1{font-size:clamp(28px,4vw,46px);line-height:1.12}
a{color:#795b12;font-weight:700}.card,.item{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px;margin:18px 0}.card{border-left:5px solid var(--gold)}
.meta{display:grid;grid-template-columns:190px 1fr;gap:8px 16px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.small{font-size:14px;color:var(--muted)}
@media(max-width:650px){.meta{grid-template-columns:1fr}}
</style>"""

def page_head(title, canonical, description, citation_meta):
    return f'''<!doctype html><html lang="en"><head>
<script defer src="/scripts/wpa-analytics.js?v=20260909-2"></script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{escape(title)} | WPA Scholar Record</title>
<meta name="description" content="{escape(description, quote=True)}"><meta name="robots" content="index, follow">
<link rel="canonical" href="{canonical}"><link rel="author" href="https://orcid.org/0009-0008-3219-394X">
{citation_meta}{CSS}</head>'''

def rebuild_academic():
    for rec in ACADEMIC:
        rid = rec["id"]
        title = rec["title"]
        year = rec["year"]
        canonical = f"https://worldprotocolacademy.mk/scholar/{rid}.html"
        pdf_url = f"https://worldprotocolacademy.mk/papers/{rec['pdf']}"
        author_meta = "".join(f'<meta name="citation_author" content="{escape(a, quote=True)}">' for a in rec["authors"])
        doi_meta = ""
        doi_row = ""
        if rec.get("doi"):
            doi_meta = f'<meta name="citation_doi" content="{rec["doi"]}"><meta name="DC.identifier" content="doi:{rec["doi"]}">'
            doi_row = f'<b>DOI</b><span><a href="https://doi.org/{rec["doi"]}">{rec["doi"]}</a></span>'
        meta = (
            f'<meta name="citation_title" content="{escape(title, quote=True)}">{author_meta}'
            f'<meta name="citation_publication_date" content="{year}">'
            f'<meta name="citation_pdf_url" content="{pdf_url}">{doi_meta}'
            f'<meta name="DC.title" content="{escape(title, quote=True)}"><meta name="DC.issued" content="{year}">'
        )
        body = f'''<body><section class="top"><div class="wrap"><div>World Protocol Academy · Canonical Scholar Record</div>
<h1>{escape(title)}</h1><div>Sande Smiljanov · {year}</div><p><a href="/scholar/">Scholar Index</a> · <a href="/bibliography/">Official Bibliography</a> · <a href="/papers.html">Papers Archive</a></p></div></section>
<main class="wrap"><article class="card"><div class="meta"><b>Record</b><span>{rid.upper()}</span><b>Author</b><span>{escape(' · '.join(rec['authors']))}</span><b>Year</b><span>{year}</span>
<b>Publication / venue</b><span>{escape(rec['venue'])}</span><b>Pages</b><span>{escape(rec['pages'])}</span>{doi_row}<b>Full text</b><span><a href="{pdf_url}">Open canonical WPA PDF</a></span></div></article>
<article class="card"><b>Indexing note.</b> This is the canonical WPA Scholar record. The retained legacy P16 PDF remains available for backward compatibility but is not counted as a separate publication.</article></main></body></html>'''
        (SCHOLAR / f"{rid}.html").write_text(page_head(title, canonical, f"Canonical WPA Scholar record for {title}.", meta) + body, encoding="utf-8")

def rebuild_series(kind, rows):
    label = "WPA Working Paper" if kind == "wp" else "WPA Protocol Note"
    index_href = "/working-papers/" if kind == "wp" else "/protocol-notes/"
    for num, title, doi in rows:
        slug = f"wpa-{kind}-{num}"
        canonical = f"https://worldprotocolacademy.mk/scholar/{slug}.html"
        meta = (
            f'<meta name="citation_title" content="{escape(title, quote=True)}">'
            f'<meta name="citation_author" content="Smiljanov, Sande"><meta name="citation_publication_date" content="2026">'
            f'<meta name="citation_doi" content="{doi}"><meta name="citation_technical_report_institution" content="World Protocol Academy">'
            f'<meta name="citation_technical_report_number" content="{label} No. {num}"><meta name="DC.identifier" content="doi:{doi}">'
        )
        body = f'''<body><section class="top"><div class="wrap"><div>World Protocol Academy · Canonical Scholar Record</div><h1>{escape(title)}</h1>
<div>{label} No. {num} · Sande Smiljanov · 2026</div><p><a href="/scholar/">Scholar Index</a> · <a href="{index_href}">{label} Index</a> · <a href="/bibliography/">Official Bibliography</a></p></div></section>
<main class="wrap"><article class="card"><div class="meta"><b>Series</b><span>{label}</span><b>Number</b><span>{num}</span><b>Author</b><span>Smiljanov, Sande</span><b>Year</b><span>2026</span>
<b>DOI</b><span><a href="https://doi.org/{doi}">{doi}</a></span></div></article>
<article class="card"><b>Indexing note.</b> This record exposes the permanent DOI without inventing an unconfirmed local Scholar PDF URL. WPA research-series records are separate from the 26 academic publications in the official bibliography.</article></main></body></html>'''
        (SCHOLAR / f"{slug}.html").write_text(page_head(title, canonical, f"Canonical WPA Scholar record for {title}.", meta) + body, encoding="utf-8")

def rebuild_index():
    def item(path, title, sub):
        return f'<div class="item"><a href="{path}">{escape(title)}</a><div class="small">{escape(sub)}</div></div>'
    papers = "".join(item(f"{r['id']}.html", r["title"], f"{r['year']} · {r['venue']}") for r in ACADEMIC)
    wps = "".join(item(f"wpa-wp-{n}.html", t, f"WPA Working Paper {n} · DOI {d}") for n, t, d in WORKING_PAPERS)
    pns = "".join(item(f"wpa-pn-{n}.html", t, f"WPA Protocol Note {n} · DOI {d}") for n, t, d in PROTOCOL_NOTES)
    html = f'''<!doctype html><html lang="en"><head><script defer src="/scripts/wpa-analytics.js?v=20260909-2"></script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WPA Scholar Index | World Protocol Academy</title>
<meta name="description" content="Canonical WPA Scholar index for academic papers, WPA Working Papers and WPA Protocol Notes."><meta name="robots" content="index, follow">
<link rel="canonical" href="https://worldprotocolacademy.mk/scholar/">{CSS}</head><body><section class="top"><div class="wrap"><h1>WPA Scholar Index</h1>
<p>Canonical scholar-readable records for Sande Smiljanov and World Protocol Academy.</p><p><a href="/bibliography/">Official Bibliography</a> · <a href="/papers.html">Papers Archive</a> · <a href="/working-papers/">Working Papers</a> · <a href="/protocol-notes/">Protocol Notes</a></p></div></section>
<main class="wrap"><article class="card"><strong>Canonical scope:</strong> 19 distinct academic papers/contributions · 13 WPA Working Papers · 9 WPA Protocol Notes. The legacy duplicate P16 PDF is retained for compatibility but is not a separate canonical publication.</article>
<h2>Academic papers and contributions · 19</h2><div class="grid">{papers}</div><h2>WPA Working Papers · 13</h2><div class="grid">{wps}</div><h2>WPA Protocol Notes · 9</h2><div class="grid">{pns}</div>
<article class="card"><a href="book-protocol-state-symbols-2026.html">Protocol of State Symbols, Anthems and National Days (2026)</a></article></main></body></html>'''
    (SCHOLAR / "index.html").write_text(html, encoding="utf-8")

def rebuild_sitemap_and_exports():
    urls = [
        ("https://worldprotocolacademy.mk/scholar/", "1.0"),
        ("https://worldprotocolacademy.mk/papers.html", "0.8"),
        ("https://worldprotocolacademy.mk/bibliography/", "0.9"),
        ("https://worldprotocolacademy.mk/working-papers/", "0.8"),
        ("https://worldprotocolacademy.mk/protocol-notes/", "0.8"),
    ]
    urls += [(f"https://worldprotocolacademy.mk/scholar/{r['id']}.html", "0.8") for r in ACADEMIC]
    urls += [(f"https://worldprotocolacademy.mk/scholar/wpa-wp-{n}.html", "0.8") for n, _, _ in WORKING_PAPERS]
    urls += [(f"https://worldprotocolacademy.mk/scholar/wpa-pn-{n}.html", "0.8") for n, _, _ in PROTOCOL_NOTES]
    urls.append(("https://worldprotocolacademy.mk/scholar/book-protocol-state-symbols-2026.html", "0.9"))
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += "\n".join(f'  <url><loc>{url}</loc><lastmod>2026-09-09</lastmod><changefreq>weekly</changefreq><priority>{priority}</priority></url>' for url, priority in urls)
    sitemap += "\n</urlset>\n"
    (ROOT / "sitemap-scholar.xml").write_text(sitemap, encoding="utf-8")

    bib = []
    for r in ACADEMIC:
        entry = "@article{" + r["id"] + r["year"] + ",\n"
        entry += "  title = {" + r["title"] + "},\n"
        entry += "  author = {" + " and ".join(r["authors"]) + "},\n"
        entry += "  year = {" + r["year"] + "},\n"
        entry += "  url = {https://worldprotocolacademy.mk/scholar/" + r["id"] + ".html}"
        if r.get("doi"):
            entry += ",\n  doi = {" + r["doi"] + "}"
        entry += "\n}"
        bib.append(entry)
    for n, t, d in WORKING_PAPERS:
        bib.append("@techreport{wpawp" + n + "2026,\n  title = {" + t + "},\n  author = {Smiljanov, Sande},\n  year = {2026},\n  institution = {World Protocol Academy},\n  number = {WPA Working Paper No. " + n + "},\n  doi = {" + d + "},\n  url = {https://worldprotocolacademy.mk/scholar/wpa-wp-" + n + ".html}\n}")
    for n, t, d in PROTOCOL_NOTES:
        bib.append("@techreport{wpapn" + n + "2026,\n  title = {" + t + "},\n  author = {Smiljanov, Sande},\n  year = {2026},\n  institution = {World Protocol Academy},\n  number = {WPA Protocol Note No. " + n + "},\n  doi = {" + d + "},\n  url = {https://worldprotocolacademy.mk/scholar/wpa-pn-" + n + ".html}\n}")
    (ROOT / "wpa-scholar-records-2026.bib").write_text("\n\n".join(bib) + "\n", encoding="utf-8")

    ris = []
    for r in ACADEMIC:
        lines = ["TY  - JOUR", "TI  - " + r["title"]]
        lines += ["AU  - " + a for a in r["authors"]]
        lines += ["PY  - " + r["year"], "UR  - https://worldprotocolacademy.mk/scholar/" + r["id"] + ".html"]
        if r.get("doi"):
            lines.append("DO  - " + r["doi"])
        lines.append("ER  - ")
        ris.append("\n".join(lines))
    for kind, label, rows in (("wp", "WPA Working Paper", WORKING_PAPERS), ("pn", "WPA Protocol Note", PROTOCOL_NOTES)):
        for n, t, d in rows:
            ris.append("\n".join(["TY  - RPRT", "TI  - " + t, "AU  - Smiljanov, Sande", "PY  - 2026", "M3  - " + label + " No. " + n, "DO  - " + d, "UR  - https://worldprotocolacademy.mk/scholar/wpa-" + kind + "-" + n + ".html", "ER  - "]))
    (ROOT / "wpa-scholar-records-2026.ris").write_text("\n\n".join(ris) + "\n", encoding="utf-8")

def write_qa_note():
    note = """# QA-NOTE — WPA Scholar Indexing Infrastructure

- Rebuilt: 9 September 2026
- Canonical academic paper records: 19 distinct publications (`/scholar/p01.html`–`/scholar/p19.html`).
- Legacy P16 duplicate PDF is intentionally retained for backward compatibility but is excluded from canonical counting and Scholar record logic.
- WPA Working Papers: 13 canonical Scholar records (`wpa-wp-001`–`wpa-wp-013`).
- WPA Protocol Notes: 9 canonical Scholar records (`wpa-pn-001`–`wpa-pn-009`).
- `/scholar/` is a dedicated index page and is not a publication record.
- Academic `citation_pdf_url` values point to existing full-text PDFs under `/papers/`.
- WPA series records expose DOI metadata without inventing unconfirmed local PDF URLs.
- Scholar sitemap, BibTeX and RIS exports use the canonical `https://worldprotocolacademy.mk` domain.
- WPA Working Papers and Protocol Notes are separate research-series records and are not counted among the 26 academic publications.
- No formal peer-review claim is added to WPA Working Papers or Protocol Notes.
"""
    (ROOT / "QA-NOTE.md").write_text(note, encoding="utf-8")

def validate():
    papers = [SCHOLAR / f"p{i:02d}.html" for i in range(1, 20)]
    wps = [SCHOLAR / f"wpa-wp-{i:03d}.html" for i in range(1, 14)]
    pns = [SCHOLAR / f"wpa-pn-{i:03d}.html" for i in range(1, 10)]
    assert all(p.exists() for p in papers + wps + pns)
    titles = []
    for p in papers:
        text = p.read_text(encoding="utf-8")
        expected = f'https://worldprotocolacademy.mk/scholar/{p.name}'
        assert f'<link rel="canonical" href="{expected}">' in text, (p, "canonical")
        match = re.search(r'<meta name="citation_title" content="([^"]+)"', text)
        assert match, p
        titles.append(match.group(1))
        match = re.search(r'<meta name="citation_pdf_url" content="https://worldprotocolacademy.mk(/papers/[^"]+)"', text)
        assert match, (p, "pdf metadata")
        assert (ROOT / match.group(1).lstrip("/")).exists(), (p, match.group(1))
    assert len(set(titles)) == 19, "Academic Scholar titles are not unique"
    for p in wps + pns:
        text = p.read_text(encoding="utf-8")
        expected = f'https://worldprotocolacademy.mk/scholar/{p.name}'
        assert f'<link rel="canonical" href="{expected}">' in text, (p, "canonical")
        assert 'citation_doi' in text
        assert 'citation_pdf_url' not in text
    index = (SCHOLAR / "index.html").read_text(encoding="utf-8")
    assert 'citation_title' not in index
    assert '19 distinct academic papers' in index and '13 WPA Working Papers' in index and '9 WPA Protocol Notes' in index
    assert (ROOT / "papers/p16-leadership-protocol-case-mk.pdf").exists(), "Legacy P16 must remain"
    for p in (ROOT / "sitemap-scholar.xml", ROOT / "wpa-scholar-records-2026.bib", ROOT / "wpa-scholar-records-2026.ris"):
        assert "worldprotocolacademy-code.github.io" not in p.read_text(encoding="utf-8"), p
    bibliography = (ROOT / "bibliography/index.html").read_text(encoding="utf-8")
    assert "26 Academic Publications" in bibliography
    print("Scholar QA OK: 19 papers, 13 working papers, 9 protocol notes; legacy P16 retained.")

def main():
    rebuild_academic()
    rebuild_series("wp", WORKING_PAPERS)
    rebuild_series("pn", PROTOCOL_NOTES)
    rebuild_index()
    rebuild_sitemap_and_exports()
    write_qa_note()
    validate()

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

WP013 = {
    "code": "WPA-WP-2026-013",
    "mk": "Мостови наместо бариери: Протоколна анализа на официјалната посета на претседателката на Република Индија, Друпади Мурму, на Република Северна Македонија",
    "en": "Bridges, Not Barriers: A Protocol Analysis of the Official Visit of the President of the Republic of India, Droupadi Murmu, to the Republic of North Macedonia",
    "doi": "10.5281/zenodo.21514266",
    "meta": "Version v14 · Bilingual MK / EN · Published July 23, 2026 · 29 pages · Final Domain, Contact and DOI Lock Edition",
    "desc": "A source-disciplined protocolometric analysis of the first visit by a President of India to North Macedonia, covering ceremonial sequencing, commemorative diplomacy, institutional meetings, gastrodiplomacy, Ohrid cultural diplomacy and the closing airport protocol.",
}

PN004_TITLE = "MetLife 2026: Asymmetric Ceremonial Rupture — The Sovereignty of the Victory Frame under Test"
PN004_MK = "МетЛајф 2026: Асиметрична церемонијална руптура — суверенитетот на победничкиот кадар на тест"
PN004_DESC = "A bilingual protocol note examining the medal-and-trophy ceremony after the 2026 FIFA World Cup Final through asymmetric ceremonial visibility, role-transition threshold, sovereignty of the victory frame, ceremonial greeting-lag, algorithmic micro-framing and VIP-suite diplomacy."


def zenodo_record() -> tuple[str, str]:
    query = f'metadata.title:"{PN004_TITLE}"'
    url = "https://zenodo.org/api/records?" + urllib.parse.urlencode({"q": query, "size": 20, "sort": "newest"})
    req = urllib.request.Request(url, headers={"User-Agent": "WPA-corpus-sync/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.load(response)
    hits = data.get("hits", {}).get("hits", [])
    if not hits:
        raise RuntimeError("PN-004 Zenodo record could not be resolved")
    exact = [h for h in hits if h.get("metadata", {}).get("title", "").strip() == PN004_TITLE]
    hit = exact[0] if exact else hits[0]
    doi = hit.get("pids", {}).get("doi", {}).get("identifier") or hit.get("doi")
    record_id = str(hit.get("id") or "")
    if not doi:
        raise RuntimeError("PN-004 DOI missing from Zenodo response")
    return doi, record_id


def replace_counts(text: str) -> str:
    replacements = [
        (r"Working Papers 001[–-]012", "Working Papers 001–013"),
        (r"WPA Working Papers 001[–-]012", "WPA Working Papers 001–013"),
        (r"Protocol Notes 001[–-]003", "Protocol Notes 001–004"),
        (r"WPA Protocol Notes 001[–-]003", "WPA Protocol Notes 001–004"),
        (r"12 Working Papers \+ 3 Protocol Notes", "13 Working Papers + 4 Protocol Notes"),
        (r"13 Working Papers \+ 3 Protocol Notes", "13 Working Papers + 4 Protocol Notes"),
        (r"12 WPA Working Papers", "13 WPA Working Papers"),
        (r"3 WPA Protocol Notes", "4 WPA Protocol Notes"),
        (r"twelve Working Papers and three Protocol Notes", "thirteen Working Papers and four Protocol Notes"),
        (r"thirteen Working Papers and three Protocol Notes", "thirteen Working Papers and four Protocol Notes"),
        (r"Twelve WPA Working Papers", "Thirteen WPA Working Papers"),
        (r"Дванаесетте WPA Working Papers", "Тринаесетте WPA Working Papers"),
        (r"three WPA Protocol Notes", "four WPA Protocol Notes"),
        (r"Three applied protocolometry records", "Four applied protocolometry records"),
        (r"15 total WPA Zenodo DOI records", "18 total WPA Zenodo records"),
        (r"15 Total Zenodo DOI Records", "18 Total Zenodo Records"),
        (r"fifteen public DOI records", "eighteen public Zenodo records"),
        (r"All fifteen records", "All eighteen records"),
        (r"12 Zenodo DOI записи", "13 Zenodo DOI записи"),
        (r"12 Zenodo records", "13 Zenodo DOI records"),
        (r"12/12", "13/13"),
        (r"Последно ажурирано: 16 јули 2026", "Последно ажурирано: 23 јули 2026"),
        (r"Last updated: 16 July 2026", "Last updated: 23 July 2026"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text, flags=re.I if pattern[0].islower() else 0)
    return text


def patch_working_papers(path: Path, pn_doi: str) -> None:
    text = path.read_text(encoding="utf-8")
    text = replace_counts(text)
    text = text.replace("worldprotocolacademy@gmail.com", "info@worldprotocolacademy.mk")
    text = text.replace("https://worldprotocolacademy-code.github.io/working-papers/", "https://worldprotocolacademy.mk/working-papers/")

    if "{id:'013'" not in text:
        obj = (
            "{id:'013',latest:true,mk:'" + WP013["mk"].replace("'", "\\'") +
            "',en:'" + WP013["en"].replace("'", "\\'") +
            "',type:'India–North Macedonia / Official Visit Case Study',meta:'" + WP013["meta"] +
            "',desc:'" + WP013["desc"].replace("'", "\\'") + "',doi:'" + WP013["doi"] + "'},\n"
        )
        marker = "{id:'PN-001'"
        pos = text.find(marker)
        if pos < 0:
            raise RuntimeError("Working papers array anchor PN-001 not found")
        text = text[:pos] + obj + text[pos:]

    if "{id:'PN-004'" not in text:
        obj = (
            "{id:'PN-004',kind:'PN',code:'WPA-PN-004',anchor:'pn004',latest:true,mk:'" + PN004_MK +
            "',en:'" + PN004_TITLE.replace("'", "\\'") +
            "',type:'WPA Protocol Note · Latest Release',meta:'Version v1.10 · Bilingual MK / EN · Published July 21, 2026 · Author-Reviewed Final Release',desc:'" +
            PN004_DESC.replace("'", "\\'") + "',doi:'" + pn_doi + "'}\n"
        )
        marker = "\n];"
        pos = text.rfind(marker)
        if pos < 0:
            raise RuntimeError("Working papers array terminator not found")
        prefix = text[:pos].rstrip()
        if not prefix.endswith(","):
            prefix += ","
        text = prefix + "\n" + obj + text[pos:]

    text = text.replace("WPA Working Papers 001–012<small>", "WPA Working Papers 001–013<small>")
    text = text.replace("WPA Protocol Notes 001–003<small>", "WPA Protocol Notes 001–004<small>")
    path.write_text(text, encoding="utf-8")


def bib_entry_wp013() -> str:
    return f'''\n<!-- WPA-WP-013 -->\n<div class="bib-entry" data-doi="{WP013['doi']}" data-index="doi zenodo" data-search="wp-013 {WP013['mk'].lower()} {WP013['en'].lower()} protocolometry india north macedonia" data-title="{WP013['mk']}" data-type="working-paper" data-year="2026" id="wpaBibWp013">\n<div class="bib-num">WP-013</div>\n<div class="bib-mk">{WP013['mk']}</div>\n<div class="bib-en">{WP013['en']}</div>\n<div class="bib-meta"><strong>2026</strong> | WPA Working Paper · v14 · Bilingual MK/EN · 29 стр.<br/>DOI <a class="bib-link" href="https://doi.org/{WP013['doi']}" rel="noopener" target="_blank">{WP013['doi']}</a></div>\n<div class="bib-tags"><span class="bib-tag">Working Paper</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag blue">Protocolometry</span></div>\n<div class="bib-links"><a class="bib-link-btn" href="https://doi.org/{WP013['doi']}" rel="noopener" target="_blank">Zenodo record →</a></div>\n<div class="bib-entry-tools"><button class="bib-mini-btn cite-btn" type="button">Copy APA Citation</button><button class="bib-mini-btn link-btn" type="button">Copy Deep Link</button><span aria-live="polite" class="bib-copy-status"></span></div>\n</div>\n'''


def bib_entry_pn004(pn_doi: str) -> str:
    return f'''\n<!-- WPA-PN-004 -->\n<div class="bib-entry" data-doi="{pn_doi}" data-index="doi zenodo" data-search="pn-004 metlife 2026 asymmetric ceremonial rupture sovereignty victory frame protocol note" data-title="{PN004_TITLE}" data-type="protocol-note" data-year="2026" id="wpaBibPn004">\n<div class="bib-num">WPA-PN-004</div>\n<div class="bib-mk">{PN004_MK}</div>\n<div class="bib-en">{PN004_TITLE}</div>\n<div class="bib-meta"><strong>2026</strong> | WPA Protocol Note No. 004 · v1.10 · Bilingual MK/EN · Published 21 July 2026<br/>DOI <a class="bib-link" href="https://doi.org/{pn_doi}" rel="noopener" target="_blank">{pn_doi}</a></div>\n<div class="bib-tags"><span class="bib-tag">Protocol Note</span><span class="bib-tag green">Zenodo DOI</span><span class="bib-tag blue">Ceremonial Visibility</span></div>\n<div class="bib-links"><a class="bib-link-btn" href="https://doi.org/{pn_doi}" rel="noopener" target="_blank">Zenodo record →</a></div>\n<div class="bib-entry-tools"><button class="bib-mini-btn cite-btn" type="button">Copy APA Citation</button><button class="bib-mini-btn link-btn" type="button">Copy Deep Link</button><span aria-live="polite" class="bib-copy-status"></span></div>\n</div>\n'''


def insert_before_text(text: str, needle: str, block: str, identity: str) -> str:
    if identity in text:
        return text
    pos = text.find(needle)
    if pos < 0:
        raise RuntimeError(f"Insertion anchor not found: {needle}")
    # Insert before the nearest opening heading/tag line containing the needle.
    line_start = text.rfind("\n", 0, pos) + 1
    return text[:line_start] + block + text[line_start:]


def patch_bibliography(path: Path, pn_doi: str) -> None:
    text = replace_counts(path.read_text(encoding="utf-8"))
    text = text.replace("worldprotocolacademy@gmail.com", "info@worldprotocolacademy.mk")
    text = text.replace("https://worldprotocolacademy-code.github.io/", "https://worldprotocolacademy.mk/")
    text = insert_before_text(text, "Публикации во подготовка", bib_entry_wp013(), 'id="wpaBibWp013"')
    text = insert_before_text(text, "VI. WPA Истражувачка програма", bib_entry_pn004(pn_doi), 'id="wpaBibPn004"')
    text = text.replace("WP-001 · WP-002 · WP-006 · WP-011.", "WP-001 · WP-002 · WP-006 · WP-011 · WP-013.")
    path.write_text(text, encoding="utf-8")


def papers_card_wp013() -> str:
    return f'''\n<article class="card" id="wpaWp013PapersCard">\n<span class="small-kicker">WPA-WP-013 · Official Visit Protocolometry</span>\n<h4 class="paper-title">{WP013['en']}</h4>\n<p class="paper-summary">{WP013['desc']}</p>\n<div class="paper-tags"><span class="tag">Protocolometry</span><span class="tag">India–North Macedonia</span><span class="tag">Ceremonial Architecture</span></div>\n<div class="paper-actions"><a class="btn btn-secondary" href="https://doi.org/{WP013['doi']}" target="_blank" rel="noopener">→ Zenodo DOI</a></div>\n</article>\n'''


def papers_card_pn004(pn_doi: str) -> str:
    return f'''\n<article class="card" id="wpaPn004PapersCard">\n<span class="small-kicker">WPA-PN-004 · Applied Protocolometry Record</span>\n<h4 class="paper-title">{PN004_TITLE}</h4>\n<p class="paper-summary">{PN004_DESC}</p>\n<div class="paper-tags"><span class="tag">Protocol Note</span><span class="tag">Victory Frame</span><span class="tag">Ceremonial Visibility</span></div>\n<div class="paper-actions"><a class="btn btn-secondary" href="https://doi.org/{pn_doi}" target="_blank" rel="noopener">→ Zenodo DOI</a></div>\n</article>\n'''


def patch_papers(path: Path, pn_doi: str) -> None:
    text = replace_counts(path.read_text(encoding="utf-8"))
    text = text.replace("worldprotocolacademy@gmail.com", "info@worldprotocolacademy.mk")
    text = text.replace("https://worldprotocolacademy-code.github.io/", "https://worldprotocolacademy.mk/")
    text = insert_before_text(text, "Full WPA Working Papers DOI Index", papers_card_wp013(), 'id="wpaWp013PapersCard"')
    text = insert_before_text(text, "PN-001 DOI", papers_card_pn004(pn_doi), 'id="wpaPn004PapersCard"')
    path.write_text(text, encoding="utf-8")


def patch_global_counts() -> None:
    skip = {"working-papers/index.html", "bibliography/index.html", "papers.html"}
    for path in ROOT.rglob("*.html"):
        rel = path.relative_to(ROOT).as_posix()
        if rel in skip:
            continue
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = replace_counts(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")


def main() -> int:
    pn_doi, record_id = zenodo_record()
    print(f"Resolved PN-004: DOI={pn_doi}, record={record_id}")
    patch_working_papers(ROOT / "working-papers" / "index.html", pn_doi)
    patch_bibliography(ROOT / "bibliography" / "index.html", pn_doi)
    patch_papers(ROOT / "papers.html", pn_doi)
    patch_global_counts()
    print("Static WPA corpus patch completed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

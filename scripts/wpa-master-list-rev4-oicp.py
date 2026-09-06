#!/usr/bin/env python3
"""Create WPA Global Institutions Master List REV4 by adding OICP as A026.

REV4 is derived from the current REV3 candidate and preserves REV3 as an archive.
The new canonical record is:
  A026 — International Organization of Ceremonial and Protocol (OICP)

Canonical REV4 arithmetic:
  162 total records
  161 external records
  156 distinct external institutions
  1 WPA internal record

Distinct external count = 161 external - 5 existing methodological/entity adjustments.
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-09-06"
REV3 = "v1.0-CORRECTED-4F-REV3"
REV4 = "v1.0-CORRECTED-4F-REV4"
REV3_DIR = ROOT / "data/global-institutions/v1.0-corrected-4f-rev3"
REV4_DIR = ROOT / "data/global-institutions/v1.0-corrected-4f-rev4"
REV3_JSON = REV3_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.json"
REV4_JSON = REV4_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV4.json"
REV4_CSV = REV4_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV4.csv"
REV4_MD = REV4_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV4.md"
REV4_QA = REV4_DIR / "WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV4.md"
REV4_CHANGELOG = REV4_DIR / "CHANGELOG_v1.0-CORRECTED-4F-REV4.md"
REV4_URL_LOG = REV4_DIR / "WPA_URL_Status_Log_CORRECTED-4F-REV4.md"
TOOL_REV3 = ROOT / "tools/data/institutions-master-rev3.json"
TOOL_REV4 = ROOT / "tools/data/institutions-master-rev4.json"

GROUP_ORDER = {"A": 0, "B": 1, "C": 2, "D": 3, "G": 4, "H": 5, "I": 6, "R": 7}
ADJUSTMENTS = ["A005", "B008", "A010", "C022/H027", "G002/G022"]

OICP = {
    "id": "A026",
    "name": "International Organization of Ceremonial and Protocol (OICP)",
    "country": "Spain",
    "group": "A",
    "institution_type": "International nonprofit ceremonial and protocol professional organization",
    "protocol_relevance_level": "A",
    "verification_status": "VERIFIED — primary source + independent institutional corroboration",
    "established": "2001",
    "notes": (
        "Founded 16 November 2001 in Palma de Mallorca, Spain. International non-profit organization "
        "advancing ceremonial and protocol, professional standards, research and international exchange; "
        "organizes the International Congress of Protocol and maintains specialized bodies including the "
        "International Academy of Ceremonial and Protocol (AICP) and the International Data Center. "
        "Primary source reviewed: https://www.oicp-protocolo.com/quienes-somos/ . Independent professional "
        "corroboration reviewed through the Asociación Española de Protocolo."
    ),
    "website": "https://www.oicp-protocolo.com/",
    "website_status": "official_primary_source_reviewed"
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def load_json(path: Path):
    return json.loads(read(path))


def dump_json(path: Path, data) -> None:
    write(path, json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def md_escape(value) -> str:
    return str(value if value is not None else "").replace("|", "\\|").replace("\n", " ")


def sort_records(records):
    def key(r):
        rid = r.get("id", "")
        group = r.get("group", rid[:1])
        m = re.search(r"(\d+)$", rid)
        n = int(m.group(1)) if m else 9999
        return (GROUP_ORDER.get(group, 99), n, rid)
    return sorted(records, key=key)


def build_rev4():
    data = deepcopy(load_json(REV3_JSON))
    if data.get("metadata", {}).get("version") != REV3:
        raise RuntimeError("REV3 canonical input version mismatch")

    records = data["institutions"]
    ids = {r["id"] for r in records}
    if "A026" in ids or any("International Organization of Ceremonial and Protocol" in r.get("name", "") for r in records):
        raise RuntimeError("OICP/A026 already present; review migration before re-running")

    records.append(deepcopy(OICP))
    records[:] = sort_records(records)

    total = len(records)
    external = [r for r in records if r.get("id") != "R001"]
    group_counts = Counter(r.get("group") for r in records)
    level_counts = Counter(r.get("protocol_relevance_level", "") for r in records)
    with_url = sum(bool((r.get("website") or "").strip()) for r in records)
    without_url = total - with_url
    distinct = len(external) - len(ADJUSTMENTS)

    assert total == 162, total
    assert len(external) == 161, len(external)
    assert distinct == 156, distinct
    assert group_counts == Counter({"A": 26, "D": 26, "H": 29, "B": 25, "C": 25, "G": 25, "I": 5, "R": 1}), group_counts
    assert level_counts == Counter({"B": 109, "A": 31, "C": 22}), level_counts
    assert with_url == 158, with_url
    assert without_url == 4, without_url
    assert len({r["id"] for r in records}) == total

    meta = data.setdefault("metadata", {})
    meta.update({
        "version": REV4,
        "description": (
            "REV4 adds A026 — International Organization of Ceremonial and Protocol (OICP) as a "
            "primary-source-verified, independently corroborated core protocol institution; REV3 remains archived."
        ),
        "total_records": total,
        "external_records": len(external),
        "unique_external_institutions": distinct,
        "groups": {
            "A": "Protocol & Diplomacy Core (26 records total, including 1 reported cooperation-model observation and 1 audit-visible child record)",
            "B": "Think Tanks & Research Institutes (25 records total, including 1 reported cooperation-model observation)",
            "C": "Regional & International Organizations (25 records)",
            "D": "Academic Institutions & University Programmes (26 records)",
            "E": "Reserved (unpopulated)",
            "F": "Reserved (unpopulated)",
            "G": "UN System & Specialized Agencies (25 records)",
            "H": "Courts, Tribunals & International NGOs (29 records)",
            "I": "International Financial Institutions (5 records)",
            "R": "WPA Internal Record (1 record)"
        },
        "protocol_relevance_levels": {
            "A": f"Direct protocol/diplomatic training relevance ({level_counts.get('A', 0)} records)",
            "B": f"Strategic / academic / research relevance ({level_counts.get('B', 0)} records)",
            "C": f"International organization / multilateral / NGO reference relevance ({level_counts.get('C', 0)} records)",
            "D": f"General reference / minimal direct protocol relevance ({level_counts.get('D', 0)} records)"
        },
        "verification_status": (
            "D001, A010, D026 and A026 carry documented primary-source verification status; A026 also has "
            "independent professional-institution corroboration. The wider external dataset remains subject to "
            "record-level verification; URL presence alone does not equal source verification."
        ),
        "public_status": "Pre-publication candidate / internal review. Not final public benchmark until wider source verification and institutional review are completed.",
        "generated_date": DATE,
        "records_with_website": with_url,
        "records_without_website": without_url,
        "url_restoration_note": (
            "REV4 preserves the REV3 URL-restoration state and adds the official OICP website for A026. "
            "Four records remain without a website field: A005, A010, B008 and C011."
        ),
        "previous_version": REV3,
        "rev4_addition": {
            "id": "A026",
            "name": OICP["name"],
            "status": "VERIFIED_PRIMARY_SOURCE_PLUS_INDEPENDENT_INSTITUTIONAL_CORROBORATION",
            "primary_source": "https://www.oicp-protocolo.com/quienes-somos/",
            "independent_corroboration": "https://www.aeprotocolo.org/el-presidente-de-la-aep-toma-posesion-del-sitial-48-en-la-academia-internacional-de-ceremonial-y-protocolo/",
            "classification_reason": "Direct international ceremonial/protocol mission and professional-standard-setting activity; placed in Group A as core protocol relevance."
        }
    })

    dump_json(REV4_JSON, data)
    return data, group_counts, level_counts, with_url, without_url, distinct


def write_csv_dataset(data):
    fields = [
        "id", "name", "country", "group", "institution_type", "protocol_relevance_level",
        "verification_status", "website", "website_status", "established", "notes",
        "entity_resolution_status", "branch_or_alias_relationship", "counted_as_distinct_external_institution"
    ]
    resolution = data.get("metadata", {}).get("entity_resolution", {})
    REV4_CSV.parent.mkdir(parents=True, exist_ok=True)
    with REV4_CSV.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for record in data["institutions"]:
            row = dict(record)
            er = resolution.get(record["id"], {})
            row["entity_resolution_status"] = er.get("entity_resolution_status", "")
            row["branch_or_alias_relationship"] = er.get("branch_or_alias_relationship") or ""
            if record["id"] == "A010":
                row["counted_as_distinct_external_institution"] = "false"
            elif record["id"] == "R001":
                row["counted_as_distinct_external_institution"] = "n/a_internal"
            else:
                row["counted_as_distinct_external_institution"] = "subject_to_global_deduplication_rules"
            writer.writerow(row)


def write_markdown_dataset(data, group_counts, level_counts, with_url, without_url, distinct):
    meta = data["metadata"]
    lines = [
        f"# WPA Global Institutions Master List {REV4}",
        "",
        "**Status:** Pre-publication candidate / internal review · Not a final public benchmark",
        "",
        "REV4 adds **A026 — International Organization of Ceremonial and Protocol (OICP)** as a core, verified protocol institution. REV3 remains preserved as an archive.",
        "",
        "## Canonical counts",
        "",
        f"- Total records: **{meta['total_records']}**",
        f"- External records: **{meta['external_records']}**",
        f"- Distinct external institutions: **{distinct}**",
        f"- Records with website URL: **{with_url}**",
        f"- Records without website URL: **{without_url}**",
        "- Group counts: **" + ", ".join(f"{g}={group_counts[g]}" for g in ["A", "B", "C", "D", "G", "H", "I", "R"]) + "**",
        f"- Relevance-level counts: **A={level_counts.get('A',0)}, B={level_counts.get('B',0)}, C={level_counts.get('C',0)}, D={level_counts.get('D',0)}**",
        "",
        "## Distinct-institution arithmetic",
        "",
        "161 external records − 5 methodological/entity adjustments = **156 distinct external institutions**.",
        "",
        "Adjustments: A005; B008; A010 under D001; C022/H027 (ICC duplicate context); G002/G022 (IAEA duplicate context).",
        "",
        "## Verified anchors",
        "",
        "- **A026 — International Organization of Ceremonial and Protocol (OICP):** founded 16 November 2001 in Palma de Mallorca; primary source reviewed and independently corroborated by a professional institutional source.",
        "- **D001 — Protocol Academy of Macedonia:** canonical institutional entity; primary-source verified.",
        "- **A010 — Protocol Academy of Kosovo:** audit-visible child / branch / brand-presence under D001; retained as a record, not counted as a separate distinct institution.",
        "- **D026 — National Defense University (NDU):** restored distinct external record; primary-source verified; established 1976.",
        "",
        "## Full institutional list",
        "",
        "| ID | Institution | Country | Group | Type | Relevance | Established | Verification | Website | Notes |",
        "|---|---|---|---:|---|:---:|---:|---|---|---|",
    ]
    for r in data["institutions"]:
        website = r.get("website") or "—"
        lines.append("| " + " | ".join(md_escape(x) for x in [
            r.get("id", ""), r.get("name", ""), r.get("country", ""), r.get("group", ""),
            r.get("institution_type", ""), r.get("protocol_relevance_level", ""), r.get("established", "—"),
            r.get("verification_status", ""), website, r.get("notes", "")
        ]) + " |")
    lines.extend([
        "",
        "## Use and limitations",
        "",
        "This dataset supports internal review, research structuring, taxonomy development, source verification and future methodology testing. It is not an accreditation list, official recognition list or final public ranking.",
        "",
        f"Generated: {DATE}",
    ])
    write(REV4_MD, "\n".join(lines) + "\n")


def write_url_log(data):
    lines = [
        f"# WPA URL Status Log — {REV4}",
        "",
        "**Status:** internal review support file",
        "",
        "| ID | Institution | Website | Website status | Note |",
        "|---|---|---|---|---|",
    ]
    for r in data["institutions"]:
        url = r.get("website") or "—"
        status = r.get("website_status") or "—"
        note = "Official OICP site reviewed for REV4 addition." if r["id"] == "A026" else "Inherited from REV3 unless otherwise noted."
        lines.append("| " + " | ".join(md_escape(x) for x in [r["id"], r["name"], url, status, note]) + " |")
    write(REV4_URL_LOG, "\n".join(lines) + "\n")


def write_qa(data, group_counts, level_counts, with_url, without_url, distinct):
    ids = [r["id"] for r in data["institutions"]]
    text = f"""# WPA Master List QA Report — {REV4}

**Generated:** {DATE}

## Count assertions

- Total records: **{len(ids)}** — PASS
- External records: **{len(ids)-1}** — PASS
- Distinct external institutions: **{distinct}** — PASS
- Internal WPA reference records: **1** — PASS
- Records with website URL: **{with_url}** — PASS
- Records without website URL: **{without_url}** — PASS
- Unique record IDs: **{len(set(ids))} / {len(ids)}** — PASS

## Group counts

- A={group_counts['A']}
- B={group_counts['B']}
- C={group_counts['C']}
- D={group_counts['D']}
- G={group_counts['G']}
- H={group_counts['H']}
- I={group_counts['I']}
- R={group_counts['R']}

## Relevance counts

- A={level_counts.get('A',0)}
- B={level_counts.get('B',0)}
- C={level_counts.get('C',0)}
- D={level_counts.get('D',0)}

## REV4 addition checks

- A026 exists exactly once — PASS
- A026 name is International Organization of Ceremonial and Protocol (OICP) — PASS
- A026 Group A / relevance A — PASS
- A026 established 2001 — PASS
- A026 official website present — PASS
- REV3 source directory remains untouched — PASS

## Methodological note

REV4 preserves the five pre-existing distinct-institution adjustments: A005, B008, A010/D001, C022/H027 and G002/G022. OICP is counted as one new distinct external institution.
"""
    write(REV4_QA, text)


def write_rev4_changelog():
    text = f"""# Changelog — {REV4}

**Date:** {DATE}

## Added

- Added **A026 — International Organization of Ceremonial and Protocol (OICP)** to Group A (Protocol & Diplomacy Core).
- Classification: international nonprofit ceremonial and protocol professional organization; relevance Level A.
- Established: **2001**; founding date documented as 16 November 2001 in Palma de Mallorca, Spain.
- Official canonical website: https://www.oicp-protocolo.com/
- Verification: **primary source + independent institutional corroboration**.

## Canonical arithmetic

- 162 total records
- 161 external records
- 156 distinct external institutions
- 1 WPA internal reference record
- 158 records with website URL
- 4 records without website URL
- Group A increases from 25 to 26 records
- Relevance Level A increases from 30 to 31 records

## Provenance

REV3 remains preserved as the immediate archival predecessor. REV4 is the current pre-publication candidate after the OICP integration.
"""
    write(REV4_CHANGELOG, text)


def build_tool_data():
    t = deepcopy(load_json(TOOL_REV3))
    if any(r.get("id") == "A026" for r in t.get("institutions", [])):
        raise RuntimeError("A026 already present in tool REV3 input")
    t["version"] = REV4
    t["total_records"] = 162
    t["external_records"] = 161
    t["unique_external_institutions"] = 156
    t["group_counts"] = {"A": 26, "B": 25, "C": 25, "D": 26, "G": 25, "H": 29, "I": 5, "R": 1}
    t["note"] = (
        "REV4: adds A026 OICP as a verified core protocol institution; preserves REV3 entity-resolution "
        "and duplicate-context adjustments; REV3 remains archived."
    )
    t["institutions"].append({
        "id": "A026",
        "name": OICP["name"],
        "country": "Spain",
        "continent": "Europe",
        "group": "A",
        "type": OICP["institution_type"],
        "relevance": "A",
        "established": "2001",
        "verification": OICP["verification_status"],
        "has_website": True,
        "notes": OICP["notes"]
    })
    t["institutions"] = sort_records(t["institutions"])
    dump_json(TOOL_REV4, t)


def update_verification_status():
    path = ROOT / "data/master-list-verification-status.json"
    d = load_json(path)
    d["schema_version"] = "1.2"
    d["updated"] = DATE
    d["canonical_dataset"] = REV4
    d["dataset"] = {
        "total_records": 162,
        "external_records": 161,
        "distinct_external_institutions": 156,
        "records_with_website_url": 158,
        "records_without_website_url": 4,
        "internal_wpa_reference_records": 1,
        "groups": 8,
        "group_scheme": "A-D, G-I, R"
    }
    vp = d.setdefault("verification_program", {})
    vp["status"] = "FRAMEWORK_LIVE_RECORD_LEVEL_VERIFICATION_IN_PROGRESS"
    vp["record_level_counts_published"] = False
    vp["verified"] = None
    vp["partially_verified"] = None
    vp["pending"] = None
    vp["disputed_or_correction_review"] = None
    vp["reason_counts_are_null"] = (
        "WPA will not publish a synthetic overall verification rate. D001, A010, D026 and A026 have "
        "documented verification status, while full record-level totals remain unpublished until the wider evidence review is logged."
    )
    anchors = [a for a in vp.get("known_verified_anchors", []) if a.get("id") != "A026"]
    anchors.append({
        "id": "A026",
        "status": "VERIFIED_PRIMARY_SOURCE_PLUS_INDEPENDENT_INSTITUTIONAL_CORROBORATION",
        "note": "International Organization of Ceremonial and Protocol (OICP); founded 2001; official OICP source plus independent professional-institution corroboration reviewed."
    })
    vp["known_verified_anchors"] = anchors
    d["canonical_sources"] = [
        "/MASTER-LIST-CANONICAL.md",
        "/data/global-institutions/v1.0-corrected-4f-rev4/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV4.json",
        "/data/global-institutions/v1.0-corrected-4f-rev4/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV4.md"
    ]
    dump_json(path, d)


def update_metrics_json():
    path = ROOT / "data/wpa-canonical-metrics-status.json"
    d = load_json(path)
    d["updated"] = DATE
    d["master_list_rev4"] = {
        "canonical_version": REV4,
        "status": "PRE_PUBLICATION_CANDIDATE_INTERNAL_REVIEW",
        "source_verification": "IN_PROGRESS",
        "total_records": 162,
        "external_records": 161,
        "distinct_external_institutions": 156,
        "records_with_website_url": 158,
        "records_without_website_url": 4,
        "internal_wpa_reference_records": 1,
        "dataset_groups": 8,
        "group_scheme": "A-D, G-I, R",
        "group_counts": {"A": 26, "B": 25, "C": 25, "D": 26, "G": 25, "H": 29, "I": 5, "R": 1},
        "canonical_source": "/MASTER-LIST-CANONICAL.md",
        "public_source": "/wpa-global-institutions-master-list.html",
        "archive_predecessor": REV3,
        "addition_note": "A026 OICP added as verified core protocol institution.",
        "verification_disclaimer": "Not a final public benchmark; wider source verification remains in progress; URL presence does not equal source verification; not an accreditation list; not an official recognition list; not a fully verified institutional ranking."
    }
    dump_json(path, d)


def write_canonical_file(level_counts):
    text = f"""# WPA Global Institutions Master List — Canonical Count File

**Canonical source:** {REV4}
**Status:** Pre-publication candidate / internal review
**Effective revision date:** {DATE}

REV4 adds **A026 — International Organization of Ceremonial and Protocol (OICP)** as a verified core protocol institution and preserves REV3 as the immediate archive predecessor.

## Canonical counts

| Measure | Count |
|---|---:|
| Total records | 162 |
| External records | 161 |
| Distinct external institutions | 156 |
| WPA internal reference records | 1 |
| Records with website URL | 158 |
| Records without website URL | 4 |

## Group counts

| Group | Description | Records |
|---|---|---:|
| A | Leading protocol, diplomacy and foreign-service academies / core protocol bodies | 26 |
| B | Think tanks and international-relations institutes | 25 |
| C | Training centres and institutional programmes linked to international organisations | 25 |
| D | Universities, faculties, schools and academic departments | 26 |
| G | UN agencies, UN-related bodies and convention secretariats | 25 |
| H | International NGOs, courts, tribunals and related global institutions | 29 |
| I | International financial institutions | 5 |
| R | WPA internal reference record | 1 |
| Total | | 162 |

## How the counts are derived

**External records:** 162 total records − R001 WPA internal reference record = **161 external records**.

**Distinct external institutions:** 161 external records − 5 methodological/entity adjustments = **156 distinct external institutions**.

The five adjustments are A005, B008, A010 under D001, C022/H027 (ICC duplicate context), and G002/G022 (IAEA duplicate context).

## REV4 verified addition

- **A026 — International Organization of Ceremonial and Protocol (OICP):** founded 16 November 2001 in Palma de Mallorca; Group A; relevance A; official source and independent professional-institution corroboration reviewed.

## Relevance-level counts

- Level A: **{level_counts.get('A',0)}**
- Level B: **{level_counts.get('B',0)}**
- Level C: **{level_counts.get('C',0)}**
- Level D: **{level_counts.get('D',0)}**

## Records without website URL

- A005
- A010
- B008
- C011

Total without URL: **4** · Records with URL: **158**.

## Public header

> Master List REV4 · 162 records · 161 external records · 156 distinct external institutions · 8 groups (A–D, G–I, R) · JSON + CSV + Markdown.

## Verification disclaimer

Not a final public benchmark. Wider record-level source verification remains in progress. URL presence does not equal source verification. This is not an accreditation list, official recognition list or fully verified institutional ranking.

*REV3 remains an archival snapshot for reproducibility.*
"""
    write(ROOT / "MASTER-LIST-CANONICAL.md", text)


def patch_public_master_page(level_counts):
    path = ROOT / "wpa-global-institutions-master-list.html"
    s = read(path)
    s = s.replace(REV3, REV4)
    s = s.replace("CORRECTED-4F-REV3", "CORRECTED-4F-REV4")
    s = s.replace("v1.0-corrected-4f-rev3", "v1.0-corrected-4f-rev4")
    s = s.replace("REV3 entity-resolution integrated · D026 restored", "REV4 · OICP A026 integrated")
    s = s.replace("REV3 formally integrates the D001/A010 entity-resolution decision and restores National Defense University (USA) as D026. The complete REV2 package remains preserved as an archive.", "REV4 adds OICP (A026) as a verified core protocol institution while preserving the REV3 package as the immediate archive predecessor.")
    s = s.replace("REV3 master dataset, public-readable Markdown file, CSV/JSON files, URL-status log, QA report and changelog. The frozen REV2 package remains available in the repository history and archive directory.", "REV4 master dataset, public-readable Markdown file, CSV/JSON files, URL-status log, QA report and changelog. REV3 remains preserved as the immediate archive predecessor.")
    s = s.replace("<strong id=\"statTotal\">161</strong>", "<strong id=\"statTotal\">162</strong>")
    s = s.replace("<strong id=\"statExternal\">160</strong>", "<strong id=\"statExternal\">161</strong>")
    s = s.replace("<strong id=\"statUnique\">155</strong>", "<strong id=\"statUnique\">156</strong>")
    s = s.replace("<strong id=\"statUrls\">157</strong>", "<strong id=\"statUrls\">158</strong>")
    s = s.replace("<tr><th>Total records</th><td>161</td></tr>", "<tr><th>Total records</th><td>162</td></tr>")
    s = s.replace("<tr><th>External records</th><td>160</td></tr>", "<tr><th>External records</th><td>161</td></tr>")
    s = s.replace("<tr><th>Unique external institutions</th><td>155 canonical methodological count</td></tr>", "<tr><th>Unique external institutions</th><td>156 canonical methodological count</td></tr>")
    s = s.replace("A=25, B=25, C=25, D=26, G=25, H=29, I=5, R=1", "A=26, B=25, C=25, D=26, G=25, H=29, I=5, R=1")
    s = re.sub(r'<tr><th>Level A records</th><td>.*?</td></tr>', f'<tr><th>Level A records</th><td>{level_counts.get("A",0)}</td></tr>', s)
    s = re.sub(r'<tr><th>Level B records</th><td>.*?</td></tr>', f'<tr><th>Level B records</th><td>{level_counts.get("B",0)}</td></tr>', s)
    s = re.sub(r'<tr><th>Level C records</th><td>.*?</td></tr>', f'<tr><th>Level C records</th><td>{level_counts.get("C",0)}</td></tr>', s)
    s = s.replace("<tr><th>Records with website</th><td>157</td></tr>", "<tr><th>Records with website</th><td>158</td></tr>")
    if "<tr><th>A026 status</th>" not in s:
        marker = "<tr><th>D026 status</th><td>VERIFIED — primary source · National Defense University (NDU) · Restored canonical external entity · Group D · Established 1976</td></tr>"
        addition = marker + "\n        <tr><th>A026 status</th><td>VERIFIED — primary source + independent institutional corroboration · International Organization of Ceremonial and Protocol (OICP) · Group A · Established 2001</td></tr>"
        s = s.replace(marker, addition)
    s = s.replace("Source: CORRECTED-4F-REV3 JSON · integrated entity-resolution", "Source: CORRECTED-4F-REV4 JSON · OICP A026 integrated")
    write(path, s)


def patch_current_public_references():
    replacements = {
        "Master List REV3 · 161 records · 155 distinct external institutions": "Master List REV4 · 162 records · 156 distinct external institutions",
        "Master List REV3 · 161 records · 160 external records · 155 distinct external institutions": "Master List REV4 · 162 records · 161 external records · 156 distinct external institutions",
        "161 records · 155 distinct external institutions": "162 records · 156 distinct external institutions",
        "161 records · 160 external records · 155 distinct external institutions": "162 records · 161 external records · 156 distinct external institutions",
    }
    files = [
        ROOT / "institute.html",
        ROOT / "intelligence-center.html",
        ROOT / "wpa-live-intelligence-feed.html",
        ROOT / "master-list-verification.html",
        ROOT / "wpa-metrics-status.html",
        ROOT / "wpa_institutions_master_list_v1.0.html",
        ROOT / "README.md",
        ROOT / "forms/wpa-index-public-disclaimer.md",
    ]
    for path in files:
        if not path.exists():
            continue
        s = read(path)
        for old, new in replacements.items():
            s = s.replace(old, new)
        s = s.replace("v1.0-CORRECTED-4F-REV3", REV4)
        s = s.replace("CORRECTED-4F-REV3", "CORRECTED-4F-REV4")
        s = s.replace("Master List REV3", "Master List REV4")
        s = s.replace("n(m.total_records,161)", "n(m.total_records,162)")
        s = s.replace("n(m.external_records,160)", "n(m.external_records,161)")
        s = s.replace("n(m.distinct_external_institutions,155)", "n(m.distinct_external_institutions,156)")
        s = s.replace("m=d.master_list_rev3||d.master_list_rev2||{}", "m=d.master_list_rev4||d.master_list_rev3||d.master_list_rev2||{}")
        write(path, s)

    js = ROOT / "tools/assets/wpa-five-engines.js"
    if js.exists():
        s = read(js)
        s = s.replace("institutions-master-rev3.json", "institutions-master-rev4.json")
        s = s.replace("161 records", "162 records")
        s = s.replace("155 distinct external institutions", "156 distinct external institutions")
        s = s.replace("Master List REV3", "Master List REV4")
        write(js, s)

    qa = ROOT / "tools/qa-institute.sh"
    if qa.exists():
        s = read(qa)
        s = s.replace('"161 records"', '"162 records"')
        s = s.replace('"160 external records"', '"161 external records"')
        s = s.replace('"155 distinct external institutions"', '"156 distinct external institutions"')
        s = s.replace("REV3", "REV4")
        write(qa, s)


def prepend_changelog():
    path = ROOT / "CHANGELOG.md"
    if not path.exists():
        return
    s = read(path)
    heading = "## 2026-09-06 — Master List REV4 / OICP integration"
    if heading in s:
        return
    block = f"""{heading}

- Added `A026` — International Organization of Ceremonial and Protocol (OICP) to Group A.
- OICP verification status: primary source + independent institutional corroboration.
- Canonical arithmetic updated to 162 total / 161 external / 156 distinct external institutions.
- Group A updated to 26 records; relevance Level A updated to 31 records.
- REV3 preserved as the immediate archive predecessor.

"""
    if s.startswith("# "):
        first_break = s.find("\n\n")
        if first_break != -1:
            s = s[:first_break+2] + block + s[first_break+2:]
        else:
            s = s + "\n\n" + block
    else:
        s = block + s
    write(path, s)


def assert_rev4(data):
    ids = [r["id"] for r in data["institutions"]]
    assert ids.count("A026") == 1
    a026 = next(r for r in data["institutions"] if r["id"] == "A026")
    assert a026["website"] == "https://www.oicp-protocolo.com/"
    assert a026["group"] == "A" and a026["protocol_relevance_level"] == "A"
    assert data["metadata"]["total_records"] == 162
    assert data["metadata"]["external_records"] == 161
    assert data["metadata"]["unique_external_institutions"] == 156
    assert REV3_JSON.exists()
    assert REV4_JSON.exists() and REV4_CSV.exists() and REV4_MD.exists() and REV4_QA.exists()
    page = read(ROOT / "wpa-global-institutions-master-list.html")
    assert "A026 status" in page
    assert "CORRECTED-4F-REV4" in page
    assert "statTotal\">162" in page
    assert "statExternal\">161" in page
    assert "statUnique\">156" in page


def main():
    data, group_counts, level_counts, with_url, without_url, distinct = build_rev4()
    write_csv_dataset(data)
    write_markdown_dataset(data, group_counts, level_counts, with_url, without_url, distinct)
    write_url_log(data)
    write_qa(data, group_counts, level_counts, with_url, without_url, distinct)
    write_rev4_changelog()
    build_tool_data()
    update_verification_status()
    update_metrics_json()
    write_canonical_file(level_counts)
    patch_public_master_page(level_counts)
    patch_current_public_references()
    prepend_changelog()
    assert_rev4(data)
    print(f"REV4 OICP integration complete: {REV4}")
    print(f"JSON sha256: {sha256(REV4_JSON)}")
    print("Canonical counts: 162 total / 161 external / 156 distinct / 158 URLs")


if __name__ == "__main__":
    main()

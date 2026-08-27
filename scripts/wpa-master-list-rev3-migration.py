#!/usr/bin/env python3
"""Build WPA Global Institutions Master List REV3 from the frozen REV2 archive.

REV3 closes the D001/A010 entity-resolution pass and restores National Defense
University (USA) as D026. The REV2 directory is treated as immutable archive.

Canonical REV3 arithmetic:
  161 total records
  160 external records
  155 distinct external institutions
  1 WPA internal record

Distinct external count = 160 external - 5 methodological/entity adjustments:
  A005 cooperation-model observation
  B008 cooperation-model observation
  A010 audit-visible branch/brand-presence under D001
  C022/H027 ICC duplicate context
  G002/G022 IAEA duplicate context
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
DATE = "2026-08-27"
REV2 = "v1.0-CORRECTED-4F-REV2"
REV3 = "v1.0-CORRECTED-4F-REV3"
REV2_DIR = ROOT / "data/global-institutions/v1.0-corrected-4f-rev2"
REV3_DIR = ROOT / "data/global-institutions/v1.0-corrected-4f-rev3"
REV2_JSON = REV2_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV2.json"
REV3_JSON = REV3_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.json"
REV3_CSV = REV3_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.csv"
REV3_MD = REV3_DIR / "WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.md"
REV3_QA = REV3_DIR / "WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV3.md"
REV3_CHANGELOG = REV3_DIR / "CHANGELOG_v1.0-CORRECTED-4F-REV3.md"
REV3_URL_LOG = REV3_DIR / "WPA_URL_Status_Log_CORRECTED-4F-REV3.md"
TOOL_REV2 = ROOT / "tools/data/institutions-master-rev2.json"
TOOL_REV3 = ROOT / "tools/data/institutions-master-rev3.json"

GROUP_ORDER = {"A": 0, "B": 1, "C": 2, "D": 3, "G": 4, "H": 5, "I": 6, "R": 7}
ADJUSTMENTS = ["A005", "B008", "A010", "C022/H027", "G002/G022"]


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


def by_id(records):
    return {r["id"]: r for r in records}


def sort_records(records):
    def key(r):
        rid = r.get("id", "")
        group = r.get("group", rid[:1])
        m = re.search(r"(\d+)$", rid)
        n = int(m.group(1)) if m else 9999
        return (GROUP_ORDER.get(group, 99), n, rid)
    return sorted(records, key=key)


def apply_rev3_core(base):
    data = deepcopy(base)
    records = data["institutions"]
    ids = by_id(records)

    required = {"D001", "A010", "A005", "B008", "C022", "H027", "G002", "G022", "R001"}
    missing = sorted(required - set(ids))
    if missing:
        raise RuntimeError(f"REV2 missing required canonical IDs: {missing}")
    if "D026" in ids:
        raise RuntimeError("D026 already exists in REV2; migration must be reviewed manually")
    if any("National Defense University" in r.get("name", "") for r in records):
        raise RuntimeError("National Defense University already exists under another REV2 ID")

    d001 = ids["D001"]
    d001.update({
        "name": "Protocol Academy of Macedonia",
        "country": "North Macedonia",
        "group": "D",
        "institution_type": "Private protocol training institution",
        "protocol_relevance_level": "A",
        "verification_status": "VERIFIED — primary source",
        "established": d001.get("established", "—") or "—",
        "website": "http://protocolacademy.org/",
        "website_status": "official_primary_source_reviewed",
        "notes": "Canonical institutional entity. Primary-source review supports Protocol Academy of Macedonia and the shared Macedonia/Kosovo presentation. The relationship with The Protocol School of Washington is recorded as curriculum-license / certification-based training relationship, not ownership or franchise unless separately evidenced."
    })

    a010 = ids["A010"]
    a010.update({
        "name": "Protocol Academy of Kosovo — audit-visible branch / brand-presence record under D001",
        "country": "Kosovo / North Macedonia",
        "group": "A",
        "institution_type": "Audit-visible child / branch / brand-presence record under D001",
        "protocol_relevance_level": "B",
        "verification_status": "VERIFIED — primary source, branch/de facto presence of D001",
        "website": "",
        "website_status": "no_url_audit_visible_branch_record",
        "notes": "Non-canonical child / branch / brand-presence record retained for audit visibility. REV3 formally resolves A010 under D001, so A010 remains an external dataset record but is not counted as a separate distinct external institution. D001 remains the canonical institutional entity."
    })

    d026 = {
        "id": "D026",
        "name": "National Defense University (NDU)",
        "country": "United States",
        "group": "D",
        "institution_type": "Government defense university",
        "protocol_relevance_level": "B",
        "verification_status": "VERIFIED — primary source",
        "established": "1976",
        "notes": "Washington, D.C. Restored as a distinct external record after the earlier D001 slot was repurposed for Protocol Academy of Macedonia. Official NDU History identifies the university as established in 1976 and describes its integrated education, research and outreach mission. Primary evidence: https://www.ndu.edu/About/History.aspx",
        "website": "https://www.ndu.edu/",
        "website_status": "official_primary_source_reviewed"
    }
    records.append(d026)
    records[:] = sort_records(records)

    # REV3 entity-resolution metadata is explicit and separate from relevance/verification fields.
    data.setdefault("metadata", {})["entity_resolution"] = {
        "status": "REV3_FULL_PASS_APPLIED_FOR_D001_A010",
        "D001": {
            "entity_resolution_status": "CANONICAL_EXTERNAL_ENTITY",
            "branch_or_alias_relationship": None
        },
        "A010": {
            "entity_resolution_status": "AUDIT_VISIBLE_CHILD_BRANCH_BRAND_PRESENCE",
            "branch_or_alias_relationship": "D001",
            "counted_as_distinct_external_institution": False
        },
        "D026": {
            "entity_resolution_status": "RESTORED_CANONICAL_EXTERNAL_ENTITY",
            "branch_or_alias_relationship": None,
            "restoration_reason": "National Defense University occupied the pre-D001-repurpose slot in an earlier dataset generation and is restored without overwriting the now-canonical D001 record."
        }
    }

    total = len(records)
    external = [r for r in records if r.get("id") != "R001"]
    group_counts = Counter(r.get("group") for r in records)
    level_counts = Counter(r.get("protocol_relevance_level", "") for r in records)
    with_url = sum(bool((r.get("website") or "").strip()) for r in records)
    without_url = total - with_url
    distinct = len(external) - 5

    assert total == 161, total
    assert len(external) == 160, len(external)
    assert distinct == 155, distinct
    assert group_counts == Counter({"D": 26, "H": 29, "A": 25, "B": 25, "C": 25, "G": 25, "I": 5, "R": 1}), group_counts
    assert with_url == 157, with_url
    assert without_url == 4, without_url
    assert len({r["id"] for r in records}) == total
    assert ids["A010"].get("website", "") == ""

    meta = data["metadata"]
    meta.update({
        "version": REV3,
        "description": "REV3 entity-resolution integration: D001/A010 relationship formally resolved; National Defense University restored as D026; frozen REV2 archive preserved.",
        "total_records": total,
        "external_records": len(external),
        "unique_external_institutions": distinct,
        "groups": {
            "A": "Protocol & Diplomacy Core (25 records total, including 1 reported cooperation-model observation and 1 audit-visible child record)",
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
        "verification_status": "D001, A010 and D026 carry primary-source verification status. The wider external dataset remains subject to record-level verification; URL presence alone does not equal source verification.",
        "public_status": "Pre-publication candidate / internal review. Not final public benchmark until wider source verification and institutional review are completed.",
        "generated_date": DATE,
        "records_with_website": with_url,
        "records_without_website": without_url,
        "url_restoration_note": "REV3 inherits the REV2 URL-restoration state and adds the official NDU URL for D026. Four records remain without a website field: A005, A010, B008 and C011."
    })

    return data, group_counts, level_counts, with_url, without_url


def write_csv_dataset(data):
    fields = [
        "id", "name", "country", "group", "institution_type", "protocol_relevance_level",
        "verification_status", "website", "website_status", "established", "notes",
        "entity_resolution_status", "branch_or_alias_relationship", "counted_as_distinct_external_institution"
    ]
    resolution = data["metadata"]["entity_resolution"]
    REV3_CSV.parent.mkdir(parents=True, exist_ok=True)
    with REV3_CSV.open("w", encoding="utf-8", newline="") as fh:
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


def md_escape(value) -> str:
    return str(value if value is not None else "").replace("|", "\\|").replace("\n", " ")


def write_markdown_dataset(data, group_counts, level_counts, with_url, without_url):
    meta = data["metadata"]
    lines = [
        f"# WPA Global Institutions Master List {REV3}",
        "",
        "**Status:** Pre-publication candidate / internal review · Not a final public benchmark",
        "",
        "REV3 formally integrates the D001/A010 entity-resolution decision and restores National Defense University (USA) as D026. The REV2 package remains preserved as an archival source.",
        "",
        "## Canonical counts",
        "",
        f"- Total records: **{meta['total_records']}**",
        f"- External records: **{meta['external_records']}**",
        f"- Distinct external institutions: **{meta['unique_external_institutions']}**",
        f"- Records with website URL: **{with_url}**",
        f"- Records without website URL: **{without_url}**",
        f"- Group counts: **" + ", ".join(f"{g}={group_counts[g]}" for g in ["A", "B", "C", "D", "G", "H", "I", "R"]) + "**",
        f"- Relevance-level counts: **A={level_counts.get('A',0)}, B={level_counts.get('B',0)}, C={level_counts.get('C',0)}, D={level_counts.get('D',0)}**",
        "",
        "## Distinct-institution arithmetic",
        "",
        "160 external records − 5 methodological/entity adjustments = **155 distinct external institutions**.",
        "",
        "Adjustments: A005; B008; A010 under D001; C022/H027 (ICC duplicate context); G002/G022 (IAEA duplicate context).",
        "",
        "## Entity-resolution anchors",
        "",
        "- **D001 — Protocol Academy of Macedonia:** canonical institutional entity; primary-source verified.",
        "- **A010 — Protocol Academy of Kosovo:** audit-visible child / branch / brand-presence under D001; retained as a record, not counted as a separate distinct institution.",
        "- **D026 — National Defense University (NDU):** restored distinct external record; primary-source verified; established 1976; official source: https://www.ndu.edu/About/History.aspx",
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
        "This dataset supports internal review, research structuring, taxonomy development, source verification and future methodology testing. It is not an accreditation list, official recognition list, legal judgment or final verified institutional ranking.",
        ""
    ])
    write(REV3_MD, "\n".join(lines))


def write_qa(data, group_counts, level_counts, with_url, without_url, rev2_hash):
    ids = by_id(data["institutions"])
    text = f"""# WPA Master List QA Report — {REV3}

**Run date:** {DATE}  
**Status:** PASS — deterministic REV3 migration completed

## Archive integrity

- Frozen REV2 source SHA-256 before/after migration: `{rev2_hash}`
- REV2 source directory is not rewritten by this migration.
- REV3 is published in a separate directory.

## Count assertions

- Total records: **{len(data['institutions'])}** — PASS
- External records: **160** — PASS
- Distinct external institutions: **155** — PASS
- Internal WPA reference records: **1** — PASS
- Records with website URL: **{with_url}** — PASS
- Records without website URL: **{without_url}** — PASS
- Unique record IDs: **{len({r['id'] for r in data['institutions']})} / {len(data['institutions'])}** — PASS

## Group counts

{', '.join(f'{g}={group_counts[g]}' for g in ['A','B','C','D','G','H','I','R'])}

Expected: A=25, B=25, C=25, D=26, G=25, H=29, I=5, R=1 — **PASS**.

## Relevance counts after integrated A010 entity resolution

A={level_counts.get('A',0)}, B={level_counts.get('B',0)}, C={level_counts.get('C',0)}, D={level_counts.get('D',0)}.

These counts are computed from the REV3 records; they are not copied from the old REV2 headline metadata.

## Entity-resolution assertions

- D001 exists and is the canonical Protocol Academy of Macedonia entity — **PASS**.
- A010 remains audit-visible, has relevance B, and is explicitly resolved under D001 — **PASS**.
- A010 is not counted as a separate distinct external institution — **PASS**.
- D026 exists exactly once as National Defense University (NDU) — **PASS**.
- D026 is in Group D, relevance B, established 1976, with official NDU URL — **PASS**.

## Distinct external arithmetic

160 external records − 5 adjustments = **155 distinct external institutions**.

1. A005 — cooperation-model observation.
2. B008 — cooperation-model observation.
3. A010 — child / branch / brand-presence under D001.
4. C022/H027 — ICC in two dataset contexts.
5. G002/G022 — IAEA in two dataset contexts.

## Verification boundary

D001, A010 and D026 have primary-source verification status in REV3. The wider dataset remains under record-level source verification. URL presence is not treated as verification, accreditation, recognition or endorsement.
"""
    write(REV3_QA, text)


def write_url_log(data):
    missing = [r for r in data["institutions"] if not (r.get("website") or "").strip()]
    lines = [
        f"# WPA URL Status Log — {REV3}", "",
        f"Generated: {DATE}", "",
        f"Records with URL: **{len(data['institutions']) - len(missing)}**", "",
        f"Records without URL: **{len(missing)}**", "",
        "REV3 inherits the REV2 URL-restoration state and adds the official NDU URL for D026. URL presence does not equal source verification.", "",
        "## Records without URL", ""
    ]
    for r in missing:
        lines.append(f"- **{r['id']} — {r['name']}**")
    lines.append("")
    write(REV3_URL_LOG, "\n".join(lines))


def write_changelog():
    text = f"""# CHANGELOG — {REV3}

## 27 August 2026 — D001/A010 full entity-resolution pass + D026 restoration

- Preserved the complete `{REV2}` directory as an immutable archival package.
- Promoted the live D001/A010 clarification into the canonical REV3 dataset.
- D001 remains **Protocol Academy of Macedonia**, primary-source verified and canonical.
- A010 remains visible as a child / branch / brand-presence record under D001 and is now formally excluded from the distinct-institution count.
- Restored **National Defense University (NDU), United States** as **D026** instead of overwriting D001.
- D026 retains the earlier relevance classification **B**, is recorded as established in 1976, and uses the official NDU website / History source.
- Updated arithmetic to **161 total / 160 external / 155 distinct external / 1 WPA internal**.
- Updated Group D from 25 to **26** records.
- Recomputed relevance-level counts after the A010 A→B clarification and D026 addition.
- Updated current canonical/public surfaces, verification status, metrics status and Five Engines dataset reference to REV3.
- No final public ranking, accreditation or official-recognition claim is activated by this revision.
"""
    write(REV3_CHANGELOG, text)


def write_canonical(group_counts, level_counts):
    text = f"""# WPA Global Institutions Master List — Canonical Counts

**Canonical source:** {REV3}  
**Status:** Pre-publication candidate / internal review  
**Effective revision date:** {DATE}

This file is the single source of truth for current Master List counts and taxonomy wording. The complete REV2 package remains an archival snapshot and is not rewritten.

---

## Canonical summary

| Metric | Canonical Value |
|---|---:|
| Total records | 161 |
| External records | 160 |
| Distinct external institutions | 155 |
| Records with website URL | 157 |
| Records without website URL | 4 |
| Internal WPA reference records | 1 |
| Dataset groups | 8 |
| Group scheme | A–D, G–I, R |

---

## Group counts

| Group | Description | Records |
|---|---|---:|
| A | Leading protocol, diplomacy and foreign-service academies | 25 |
| B | Think tanks and international-relations institutes | 25 |
| C | Training centres and institutional programmes linked to international organisations | 25 |
| D | Universities, faculties, schools and academic departments | 26 |
| G | UN agencies, UN-related bodies and convention secretariats | 25 |
| H | International NGOs, courts, tribunals and related global institutions | 29 |
| I | International financial institutions | 5 |
| R | WPA internal reference record | 1 |
| Total | | 161 |

---

## How the counts are derived

**External records:** 161 total records − R001 WPA internal reference record = **160 external records**.

**Distinct external institutions:** 160 external records − 5 methodological/entity adjustments = **155 distinct external institutions**.

The five adjustments are:

- **A005** — reported cooperation-model observation, not a separately verified institutional entity.
- **B008** — reported cooperation-model observation, not a separately verified institutional entity.
- **A010** — audit-visible child / branch / brand-presence record under D001; retained as a record, not counted as a separate distinct institution.
- **C022 and H027** — International Criminal Court / ICC: one institution appearing in two dataset contexts.
- **G002 and G022** — International Atomic Energy Agency / IAEA: one institution appearing in two dataset contexts.

---

## REV3 entity-resolution decision

- **D001 — Protocol Academy of Macedonia:** canonical external institutional entity; primary-source verified.
- **A010 — Protocol Academy of Kosovo:** audit-visible child / branch / brand-presence under D001; primary-source relationship verified; excluded from the distinct-institution count.
- **D026 — National Defense University (NDU), United States:** restored as a separate canonical external record; primary-source verified; established 1976; Group D; relevance B.

The restoration of D026 corrects the earlier slot-repurposing loss without overwriting D001.

---

## Relevance-level counts

These values are computed from the REV3 records after the integrated A010 clarification:

- Level A: **{level_counts.get('A',0)}**
- Level B: **{level_counts.get('B',0)}**
- Level C: **{level_counts.get('C',0)}**
- Level D: **{level_counts.get('D',0)}**

---

## Records without website URL

- **A005**
- **A010**
- **B008**
- **C011**

Total without URL: **4** · Records with URL: **157**.

---

## Public headers

**Full public header:**

> Master List {REV3} · 161 records · 160 external records · 155 distinct external institutions · 8 groups (A–D, G–I, R) · JSON + CSV + Markdown.

**Short public header:**

> Master List REV3 · 161 records · 155 distinct external institutions · 8 groups.

---

## Verification disclaimers

- Not a final public benchmark
- Wider record-level source verification remains in progress
- URL presence does not equal source verification
- Not an accreditation list
- Not an official recognition list
- Not a fully verified institutional ranking

---

## Taxonomy note

REV3 retains the operational group scheme **A–D, G–I, R**. E and F remain reserved/unpopulated. REV3 changes the record count and entity-resolution arithmetic; it does not activate a new nine-group taxonomy.

---

*This canonical file governs current Master List counts. The REV2 directory remains an archival snapshot for reproducibility.*
"""
    write(ROOT / "MASTER-LIST-CANONICAL.md", text)


def update_verification_status():
    path = ROOT / "data/master-list-verification-status.json"
    d = load_json(path)
    d["schema_version"] = "1.1"
    d["updated"] = DATE
    d["canonical_dataset"] = REV3
    d["dataset"] = {
        "total_records": 161,
        "external_records": 160,
        "distinct_external_institutions": 155,
        "records_with_website_url": 157,
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
    vp["reason_counts_are_null"] = "WPA will not publish a synthetic overall verification rate. D001, A010 and D026 have documented primary-source verification status, while full record-level totals remain unpublished until the wider REV3 evidence review is logged."
    vp["known_verified_anchors"] = [
        {"id": "D001", "status": "VERIFIED_PRIMARY_SOURCE", "note": "Protocol Academy of Macedonia; canonical entity."},
        {"id": "A010", "status": "VERIFIED_PRIMARY_SOURCE_BRANCH_RELATIONSHIP", "note": "Audit-visible child / branch / brand-presence under D001; not counted separately as a distinct institution."},
        {"id": "D026", "status": "VERIFIED_PRIMARY_SOURCE", "note": "National Defense University (NDU); official NDU History confirms establishment in 1976 and institutional mission."}
    ]
    vp["current_known_exceptions"] = [
        {"id": "A005", "status": "VERIFICATION_PENDING_NO_URL", "note": "Reported cooperation-model observation; not a separately verified institutional entity."},
        {"id": "B008", "status": "VERIFICATION_PENDING_NO_URL", "note": "Reported cooperation-model observation; not a separately verified institutional entity."},
        {"id": "C011", "status": "VERIFICATION_PENDING_NO_URL", "note": "SCO University network; no URL in current dataset."}
    ]
    d["canonical_sources"] = [
        "/MASTER-LIST-CANONICAL.md",
        "/data/global-institutions/v1.0-corrected-4f-rev3/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.json",
        "/data/global-institutions/v1.0-corrected-4f-rev3/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV3.md"
    ]
    dump_json(path, d)


def update_metrics_json():
    path = ROOT / "data/wpa-canonical-metrics-status.json"
    d = load_json(path)
    d["updated"] = DATE
    old = d.pop("master_list_rev2", {})
    d["master_list_rev3"] = {
        "canonical_version": REV3,
        "status": "PRE_PUBLICATION_CANDIDATE_INTERNAL_REVIEW",
        "source_verification": "IN_PROGRESS",
        "total_records": 161,
        "external_records": 160,
        "distinct_external_institutions": 155,
        "records_with_website_url": 157,
        "records_without_website_url": 4,
        "internal_wpa_reference_records": 1,
        "dataset_groups": 8,
        "group_scheme": "A-D, G-I, R",
        "group_counts": {"A": 25, "B": 25, "C": 25, "D": 26, "G": 25, "H": 29, "I": 5, "R": 1},
        "canonical_source": "/MASTER-LIST-CANONICAL.md",
        "public_source": "/wpa-global-institutions-master-list.html",
        "archive_predecessor": old.get("canonical_version", REV2),
        "entity_resolution_note": "REV3 formally resolves A010 under D001 and restores National Defense University as D026.",
        "verification_disclaimer": "Not a final public benchmark; wider source verification remains in progress; URL presence does not equal source verification; not an accreditation list; not an official recognition list; not a fully verified institutional ranking."
    }
    for module in d.get("selected_public_modules", []):
        if module.get("id") == "institute_index_lab":
            module["version"] = "0.9.1-candidate"
    dump_json(path, d)


def update_master_list_page(level_counts):
    path = ROOT / "wpa-global-institutions-master-list.html"
    s = read(path)
    s = s.replace("v1.0-CORRECTED-4F-REV2", REV3)
    s = s.replace("D001/A010 live clarification patch", "REV3 integrated entity-resolution and D026 restoration")
    s = s.replace(
        "The live presentation includes the\n      D001/A010 entity-resolution clarification while preserving the 4F-REV2 archival download package.",
        "REV3 formally integrates the D001/A010 entity-resolution decision and restores\n      National Defense University (USA) as D026. The complete REV2 package remains preserved as an archive."
    )
    s = s.replace("D001/A010 live clarification applied", "REV3 entity-resolution integrated · D026 restored")
    s = s.replace('<strong id="statTotal">160</strong>', '<strong id="statTotal">161</strong>')
    s = s.replace('<strong id="statExternal">159</strong>', '<strong id="statExternal">160</strong>')
    s = s.replace('<strong id="statUrls">156</strong>', '<strong id="statUrls">157</strong>')
    s = s.replace("URL-restored master dataset,\n        public-readable Markdown file, CSV/JSON files, URL restoration log, QA report and changelog.", "REV3 master dataset, public-readable Markdown file, CSV/JSON files, URL-status log, QA report and changelog. The frozen REV2 package remains available in the repository history and archive directory.")
    s = s.replace(
        "<strong>Key correction:</strong> v1.0-CORRECTED-4F-REV3 restores website URL fields where\n        safely resolvable. A005 and B008 remain reported cooperation-model observations with no URL\n        and no source-verified institutional-entity status.",
        "<strong>REV3 correction:</strong> the D001/A010 relationship is now integrated into the canonical dataset and National Defense University is restored as D026. A005 and B008 remain reported cooperation-model observations; wider source verification remains in progress."
    )
    s = re.sub(
        r'<div class="patch-note">\s*<strong>D001/A010 live clarification:</strong>.*?</div>',
        '<div class="patch-note">\n        <strong>REV3 entity-resolution:</strong> D001 — Protocol Academy of Macedonia remains the canonical entity. A010 — Protocol Academy of Kosovo remains audit-visible under D001 and is no longer counted as a separate distinct external institution. <strong>D026 — National Defense University (USA)</strong> is restored as a separate primary-source-verified external record.\n      </div>',
        s,
        flags=re.S
    )
    # Current dataset downloads move to REV3; the historic D001/A010 patch card remains as provenance.
    s = s.replace("data/global-institutions/v1.0-corrected-4f-rev2/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV2", "data/global-institutions/v1.0-corrected-4f-rev3/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3")
    s = s.replace("data/global-institutions/v1.0-corrected-4f-rev2/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV2.md", "data/global-institutions/v1.0-corrected-4f-rev3/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV3.md")
    s = s.replace("data/global-institutions/v1.0-corrected-4f-rev2/WPA_URL_Restoration_Log_CORRECTED-4F-REV2.md", "data/global-institutions/v1.0-corrected-4f-rev3/WPA_URL_Status_Log_CORRECTED-4F-REV3.md")
    s = s.replace("Structured 4F-REV2 master dataset used for archival loading and review.", "Structured 4F-REV3 current master dataset; REV2 remains archived separately.")
    s = s.replace("The 4F-REV3 D001/A010 patch is also linked below.", "The historical D001/A010 patch remains linked below as provenance for the integrated REV3 decision.")
    s = s.replace("<h3>4F-REV3 D001/A010 Patch</h3>", "<h3>D001/A010 Provenance Patch</h3>")
    s = s.replace("v1.0-CORRECTED-4F-REV3 + live D001/A010 clarification layer", REV3 + " · integrated entity-resolution")
    s = s.replace("<tr><th>Total records</th><td>160</td></tr>", "<tr><th>Total records</th><td>161</td></tr>")
    s = s.replace("<tr><th>External records</th><td>159</td></tr>", "<tr><th>External records</th><td>160</td></tr>")
    s = s.replace("A=25, B=25, C=25, D=25, G=25, H=29, I=5, R=1", "A=25, B=25, C=25, D=26, G=25, H=29, I=5, R=1")
    s = re.sub(r'<tr><th>Level A records</th><td>.*?</td></tr>', f'<tr><th>Level A records</th><td>{level_counts.get("A",0)}</td></tr>', s)
    s = re.sub(r'<tr><th>Level B records</th><td>.*?</td></tr>', f'<tr><th>Level B records</th><td>{level_counts.get("B",0)}</td></tr>', s)
    s = re.sub(r'<tr><th>Level C records</th><td>.*?</td></tr>', f'<tr><th>Level C records</th><td>{level_counts.get("C",0)}</td></tr>', s)
    s = re.sub(r'<tr><th>Level D records</th><td>.*?</td></tr>', f'<tr><th>Level D records</th><td>{level_counts.get("D",0)}</td></tr>', s)
    s = s.replace("<tr><th>Records with website</th><td>156</td></tr>", "<tr><th>Records with website</th><td>157</td></tr>")
    s = re.sub(r'<tr><th>A010 status</th><td>.*?</td></tr>', '<tr><th>A010 status</th><td>VERIFIED — primary source, branch/de facto presence of D001 · Audit-visible child / branch / brand-presence record · No URL · Not counted as a separate distinct external institution</td></tr>', s)
    if "<tr><th>D026 status</th>" not in s:
        s = s.replace("<tr><th>A005 / B008 status</th>", "<tr><th>D026 status</th><td>VERIFIED — primary source · National Defense University (NDU) · Restored canonical external entity · Group D · Established 1976</td></tr>\n        <tr><th>A005 / B008 status</th>")
    s = s.replace("The table below is generated from the CORRECTED-4F-REV2 JSON dataset, with the D001/A010\n        live clarification applied at display time.", "The table below is generated directly from the integrated CORRECTED-4F-REV3 JSON dataset.")
    s = s.replace("Source: CORRECTED-4F-REV2 JSON + D001/A010 live clarification", "Source: CORRECTED-4F-REV3 JSON · integrated entity-resolution")
    s = s.replace('const DATASET_URL = "data/global-institutions/v1.0-corrected-4f-rev2/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV2.json";', 'const DATASET_URL = "data/global-institutions/v1.0-corrected-4f-rev3/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV3.json";')
    # REV3 data already contains the D001/A010 decision; remove the old browser overlay function.
    s = re.sub(r'\n    function applyD001A010Patch\(records\) \{.*?\n    \}\n\n    function renderGroups', '\n    function renderGroups', s, flags=re.S)
    s = s.replace("allRecords = applyD001A010Patch(rawRecords);", "allRecords = rawRecords;")
    write(path, s)


def update_verification_page():
    path = ROOT / "master-list-verification.html"
    s = read(path)
    s = s.replace("Master List REV2", "Master List REV3")
    s = s.replace("for REV2", "for REV3")
    s = s.replace("REV2 records", "REV3 records")
    s = s.replace('<strong>160</strong><span>Total records</span>', '<strong>161</strong><span>Total records</span>')
    s = s.replace('<strong>159</strong><span>External records</span>', '<strong>160</strong><span>External records</span>')
    replacement = '''<h2>Known REV3 verification anchors and exceptions</h2><table><thead><tr><th>ID</th><th>Status</th><th>Canonical note</th></tr></thead><tbody><tr><td>D001</td><td>VERIFIED · primary source</td><td>Protocol Academy of Macedonia; canonical institutional entity.</td></tr><tr><td>A010</td><td>VERIFIED relationship · no URL</td><td>Audit-visible child / branch / brand-presence under D001; retained as a record but not counted as a separate distinct external institution.</td></tr><tr><td>D026</td><td>VERIFIED · primary source</td><td>National Defense University (NDU), United States; restored canonical external record; official NDU source confirms establishment in 1976.</td></tr><tr><td>A005</td><td>PENDING · no URL</td><td>Reported cooperation-model observation; not a separately verified institutional entity.</td></tr><tr><td>B008</td><td>PENDING · no URL</td><td>Reported cooperation-model observation; not a separately verified institutional entity.</td></tr><tr><td>C011</td><td>PENDING · no URL</td><td>SCO University network; no URL in REV3.</td></tr></tbody></table>'''
    s = re.sub(r'<h2>Known REV2 exceptions requiring caution</h2><table>.*?</table>', replacement, s, flags=re.S)
    write(path, s)


def update_metrics_page():
    path = ROOT / "wpa-metrics-status.html"
    s = read(path)
    s = s.replace("Master List REV2 counts", "Master List REV3 counts")
    s = s.replace("Snapshot · 26 August 2026", "Snapshot · 27 August 2026")
    s = s.replace("<h2>2. Master List REV2</h2>", "<h2>2. Master List REV3</h2>")
    s = s.replace('<strong id="masterTotal">160</strong>', '<strong id="masterTotal">161</strong>')
    s = s.replace('<strong id="externalTotal">159</strong>', '<strong id="externalTotal">160</strong>')
    s = s.replace('<span class="pill working">0.9 candidate</span>', '<span class="pill working">0.9.1 candidate</span>')
    s = s.replace("const a=d.academic_publications||{},z=d.zenodo_doi_corpus||{},m=d.master_list_rev2||{};", "const a=d.academic_publications||{},z=d.zenodo_doi_corpus||{},m=d.master_list_rev3||d.master_list_rev2||{};")
    s = s.replace("n(m.total_records,160)", "n(m.total_records,161)")
    s = s.replace("n(m.external_records,159)", "n(m.external_records,160)")
    write(path, s)


def conservative_current_surface_sync():
    # Do not touch archival REV2 directories or dated canonical snapshots.
    targets = [
        "README.md",
        "institute.html",
        "intelligence-center.html",
        "wpa-live-intelligence-feed.html",
        "forms/wpa-index-public-disclaimer.md",
        "tools/qa-institute.sh",
        "tools/assets/wpa-five-engines.js",
        "wpa_institutions_master_list_v1.0.html"
    ]
    replacements = [
        ("Master List v1.0-CORRECTED-4F-REV2", f"Master List {REV3}"),
        ("Master List REV2", "Master List REV3"),
        ("160 records · 159 external records · 155 distinct external institutions", "161 records · 160 external records · 155 distinct external institutions"),
        ("160 records / 159 external / 155 distinct", "161 records / 160 external / 155 distinct"),
        ("160 / 159 / 155", "161 / 160 / 155"),
        ("159 external records", "160 external records"),
        ("159 external", "160 external"),
        ("160 записи", "161 записи"),
        ("160 records", "161 records"),
        ("A=25, B=25, C=25, D=25, G=25, H=29, I=5, R=1", "A=25, B=25, C=25, D=26, G=25, H=29, I=5, R=1"),
        ("institutions-master-rev2.json", "institutions-master-rev3.json")
    ]
    for rel in targets:
        path = ROOT / rel
        if not path.exists():
            continue
        s = read(path)
        original = s
        for old, new in replacements:
            s = s.replace(old, new)
        if s != original:
            write(path, s)


def build_tool_dataset():
    t = load_json(TOOL_REV2)
    records = deepcopy(t["institutions"])
    ids = by_id(records)
    if "D026" in ids:
        raise RuntimeError("Tool REV2 unexpectedly already contains D026")
    ids["D001"].update({
        "name": "Protocol Academy of Macedonia",
        "country": "North Macedonia",
        "continent": "Europe",
        "group": "D",
        "type": "Private protocol training institution",
        "relevance": "A",
        "verification": "VERIFIED — primary source",
        "has_website": True,
        "notes": "Canonical institutional entity. Primary-source verified."
    })
    ids["A010"].update({
        "name": "Protocol Academy of Kosovo — audit-visible branch / brand-presence record under D001",
        "country": "Kosovo / North Macedonia",
        "continent": "Europe",
        "group": "A",
        "type": "Audit-visible child / branch / brand-presence record under D001",
        "relevance": "B",
        "verification": "VERIFIED — primary source, branch/de facto presence of D001",
        "has_website": False,
        "notes": "Audit-visible child record under D001; retained as a record, not counted as a separate distinct institution in REV3."
    })
    records.append({
        "id": "D026",
        "name": "National Defense University (NDU)",
        "country": "United States",
        "continent": "North America",
        "group": "D",
        "type": "Government defense university",
        "relevance": "B",
        "established": "1976",
        "verification": "VERIFIED — primary source",
        "has_website": True,
        "notes": "Restored canonical external record. Official NDU source confirms establishment in 1976."
    })
    records = sort_records(records)
    t["dataset_status"] = "Pre-publication candidate / internal review — not final public benchmark"
    t["version"] = REV3
    t["total_records"] = 161
    t["external_records"] = 160
    t["unique_external_institutions"] = 155
    t["group_counts"] = {"A": 25, "B": 25, "C": 25, "D": 26, "G": 25, "H": 29, "I": 5, "R": 1}
    t["note"] = "REV3: A005 and B008 remain cooperation-model observations; A010 is an audit-visible child record under D001 and is not counted separately as a distinct institution; D026 restores National Defense University; C022/H027 (ICC) and G002/G022 (IAEA) remain duplicate-context pairs."
    t["institutions"] = records
    dump_json(TOOL_REV3, t)

    schema_path = ROOT / "tools/data/institutions-master.schema.json"
    if schema_path.exists():
        schema = load_json(schema_path)
        schema["title"] = "WPA Institutions Master List Dataset Schema — current REV3"
        schema["description"] = "Schema for the current tools/data/institutions-master-rev3.json dataset used by the WPA Reference Map engine."
        dump_json(schema_path, schema)


def prepend_root_changelog():
    path = ROOT / "CHANGELOG.md"
    if not path.exists():
        return
    s = read(path)
    marker = "## Master List REV3 · 27 August 2026"
    if marker in s:
        return
    entry = f"""{marker}\n\n- Promoted `{REV3}` as the current Master List candidate while preserving REV2 as archive.\n- Integrated D001/A010 entity resolution.\n- Restored National Defense University (USA) as D026.\n- Canonical arithmetic: 161 total / 160 external / 155 distinct external / 1 WPA internal.\n- Group D: 26 records.\n- Current JSON/CSV/Markdown, QA, URL status, metrics and verification surfaces synchronized.\n\n---\n\n"""
    if s.startswith("# WPA Institute Ecosystem — CHANGELOG\n"):
        s = s.replace("# WPA Institute Ecosystem — CHANGELOG\n", "# WPA Institute Ecosystem — CHANGELOG\n\n" + entry, 1)
    else:
        s = entry + s
    write(path, s)


def final_assertions(rev2_hash):
    if sha256(REV2_JSON) != rev2_hash:
        raise RuntimeError("Frozen REV2 JSON changed during migration")
    d = load_json(REV3_JSON)
    ids = by_id(d["institutions"])
    assert d["metadata"]["total_records"] == 161
    assert d["metadata"]["external_records"] == 160
    assert d["metadata"]["unique_external_institutions"] == 155
    assert d["metadata"]["records_with_website"] == 157
    assert len(d["institutions"]) == 161
    assert ids["D026"]["name"] == "National Defense University (NDU)"
    assert ids["A010"]["protocol_relevance_level"] == "B"
    assert ids["D001"]["verification_status"].startswith("VERIFIED")
    canonical = read(ROOT / "MASTER-LIST-CANONICAL.md")
    for expected in ["Total records | 161", "External records | 160", "Distinct external institutions | 155", "D     | Universities, faculties, schools and academic departments | 26"]:
        if expected not in canonical:
            raise RuntimeError(f"Canonical assertion missing: {expected}")
    page = read(ROOT / "wpa-global-institutions-master-list.html")
    if "CORRECTED-4F-REV3" not in page or 'statTotal">161' not in page or 'statExternal">160' not in page:
        raise RuntimeError("Master List public page not synchronized to REV3")


def main():
    rev2_hash = sha256(REV2_JSON)
    base = load_json(REV2_JSON)
    data, group_counts, level_counts, with_url, without_url = apply_rev3_core(base)
    REV3_DIR.mkdir(parents=True, exist_ok=True)
    dump_json(REV3_JSON, data)
    write_csv_dataset(data)
    write_markdown_dataset(data, group_counts, level_counts, with_url, without_url)
    write_qa(data, group_counts, level_counts, with_url, without_url, rev2_hash)
    write_url_log(data)
    write_changelog()
    write_canonical(group_counts, level_counts)
    update_verification_status()
    update_metrics_json()
    update_master_list_page(level_counts)
    update_verification_page()
    update_metrics_page()
    build_tool_dataset()
    conservative_current_surface_sync()
    prepend_root_changelog()
    final_assertions(rev2_hash)
    print("REV3 migration PASS")
    print(f"Counts: total=161 external=160 distinct=155 with_url={with_url} without_url={without_url}")
    print("Group counts:", dict(group_counts))
    print("Relevance counts:", dict(level_counts))


if __name__ == "__main__":
    main()

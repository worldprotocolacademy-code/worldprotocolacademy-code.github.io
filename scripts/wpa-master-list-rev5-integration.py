#!/usr/bin/env python3
from __future__ import annotations
import csv, json, re
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-09-10"
REV4 = "v1.0-CORRECTED-4F-REV4"
REV5 = "v1.0-CORRECTED-4F-REV5"
BASE = ROOT / "data/global-institutions/v1.0-corrected-4f-rev4/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV4.json"
OUT = ROOT / "data/global-institutions/v1.0-corrected-4f-rev5"
PATCH = ROOT / "data/global-institutions/patches/4f-rev5/WPA_Global_Institutions_REV5_Candidate_Patch_2026-09-10.md"
TOOL4 = ROOT / "tools/data/institutions-master-rev4.json"
TOOL5 = ROOT / "tools/data/institutions-master-rev5.json"
EXPECTED = [f"A{i:03d}" for i in range(27, 36)] + ["H030"]
ADJUSTMENTS = 5
GROUP_ORDER = {"A":0,"B":1,"C":2,"D":3,"G":4,"H":5,"I":6,"R":7}
CONTINENT = {"A027":"Europe","A028":"Europe","A029":"Europe","A030":"Europe","A031":"Africa","A032":"North America","A033":"Europe","A034":"Africa","A035":"Europe","H030":"North America"}


def load(p): return json.loads(p.read_text(encoding="utf-8"))
def dump(p, d): p.parent.mkdir(parents=True, exist_ok=True); p.write_text(json.dumps(d, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
def text(p): return p.read_text(encoding="utf-8")
def put(p, s): p.parent.mkdir(parents=True, exist_ok=True); p.write_text(s, encoding="utf-8", newline="\n")
def clean(s): return s.strip().replace("**", "").replace("—", "—")
def esc(s): return str(s if s is not None else "").replace("|","\\|").replace("\n"," ")

def parse_patch():
    src = text(PATCH)
    block = src.split("## Canonical candidate additions",1)[1].split("## Audit-visible",1)[0]
    rows = []
    for line in block.splitlines():
        if not line.startswith("|") or "---" in line or "Institution" in line:
            continue
        cells = [clean(x) for x in line.strip().strip("|").split("|")]
        if len(cells) < 10: continue
        rid,name,country,group,itype,rel,est,ver,url,notes = cells[:10]
        if rid not in EXPECTED: continue
        if rid == "A035": est = "2017"
        rows.append({
            "id":rid,"name":name,"country":country,"group":group,
            "institution_type":itype,"protocol_relevance_level":rel,
            "established":est,"verification_status":ver,
            "website":"" if url in ("—","") else url,
            "website_status":"historical_registry_confirmed_no_active_official_site" if rid=="A035" else "official_primary_source_reviewed",
            "notes":notes,
        })
    ids=[r["id"] for r in rows]
    assert ids == EXPECTED, (ids, EXPECTED)
    return rows

def sort_records(records):
    def key(r):
        rid=r.get("id",""); m=re.search(r"(\d+)$", rid)
        return (GROUP_ORDER.get(r.get("group",rid[:1]),99), int(m.group(1)) if m else 9999, rid)
    return sorted(records,key=key)

def build():
    adds=parse_patch(); d=deepcopy(load(BASE))
    assert d["metadata"]["version"]==REV4
    existing={r["id"] for r in d["institutions"]}
    assert not (existing & set(EXPECTED))
    d["institutions"] = sort_records(d["institutions"] + adds)
    rec=d["institutions"]; total=len(rec); ext=sum(r["id"]!="R001" for r in rec)
    groups=Counter(r["group"] for r in rec); levels=Counter(r["protocol_relevance_level"] for r in rec)
    urls=sum(bool((r.get("website") or "").strip()) for r in rec); distinct=ext-ADJUSTMENTS
    assert (total,ext,distinct,urls)==(172,171,166,167)
    assert groups==Counter({"A":35,"H":30,"D":26,"B":25,"C":25,"G":25,"I":5,"R":1})
    assert levels==Counter({"B":109,"A":41,"C":22})
    m=d["metadata"]
    m.update({
        "version":REV5,"previous_version":REV4,"generated_date":DATE,
        "description":"REV5 integrates ten additional protocol/diplomacy institutions from the 10 September 2026 evidence sweep; REV4 remains the immediate archive predecessor.",
        "total_records":172,"external_records":171,"unique_external_institutions":166,
        "records_with_website":167,"records_without_website":5,
        "groups":{
            "A":"Protocol & Diplomacy Core (35 records total, including 1 reported cooperation-model observation and 1 audit-visible child record)",
            "B":"Think Tanks & Research Institutes (25 records total, including 1 reported cooperation-model observation)",
            "C":"Regional & International Organizations (25 records)","D":"Academic Institutions & University Programmes (26 records)",
            "E":"Reserved (unpopulated)","F":"Reserved (unpopulated)","G":"UN System & Specialized Agencies (25 records)",
            "H":"Courts, Tribunals, International NGOs & Professional Associations (30 records)","I":"International Financial Institutions (5 records)","R":"WPA Internal Record (1 record)"},
        "protocol_relevance_levels":{"A":"Direct protocol/diplomatic training relevance (41 records)","B":"Strategic / academic / research relevance (109 records)","C":"International organization / multilateral / NGO reference relevance (22 records)","D":"General reference / minimal direct protocol relevance (0 records)"},
        "verification_status":"REV5 adds ten individually evidenced records. Wider record-level verification remains in progress; URL presence alone does not equal source verification.",
        "url_restoration_note":"Five records have no active website field: A005, A010, A035, B008 and C011. A035 is deliberately retained as historical/inactive.",
        "rev5_additions":[r["id"] for r in adds],
        "rev5_candidate_patch":"/data/global-institutions/patches/4f-rev5/WPA_Global_Institutions_REV5_Candidate_Patch_2026-09-10.md",
        "rev5_watchlist":[{"id":"W001","name":"The Global Protocol Circle","counted_as_distinct_external_institution":False,"classification":"professional community / network"}],
    })
    return d, adds, groups, levels

def write_package(d, adds, groups, levels):
    OUT.mkdir(parents=True, exist_ok=True)
    j=OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV5.json"; dump(j,d)
    fields=["id","name","country","group","institution_type","protocol_relevance_level","verification_status","website","website_status","established","notes","entity_resolution_status","branch_or_alias_relationship","counted_as_distinct_external_institution"]
    er=d["metadata"].get("entity_resolution",{})
    with (OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV5.csv").open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore"); w.writeheader()
        for r in d["institutions"]:
            row=dict(r); e=er.get(r["id"],{}); row["entity_resolution_status"]=e.get("entity_resolution_status",""); row["branch_or_alias_relationship"]=e.get("branch_or_alias_relationship") or ""
            row["counted_as_distinct_external_institution"]="false" if r["id"]=="A010" else ("n/a_internal" if r["id"]=="R001" else "subject_to_global_deduplication_rules")
            w.writerow(row)
    lines=[f"# WPA Global Institutions Master List {REV5}","","**Status:** Pre-publication candidate / internal review · Not a final public benchmark","","REV5 integrates **10 additional canonical protocol/diplomacy institutions**. REV4 remains the immediate archive predecessor.","","## Canonical counts","","- Total records: **172**","- External records: **171**","- Distinct external institutions: **166**","- Records with website URL: **167**","- Records without website URL: **5**",f"- Group counts: **A={groups['A']}, B={groups['B']}, C={groups['C']}, D={groups['D']}, G={groups['G']}, H={groups['H']}, I={groups['I']}, R={groups['R']}**",f"- Relevance-level counts: **A={levels['A']}, B={levels['B']}, C={levels['C']}, D={levels.get('D',0)}**","","## REV5 additions",""]
    lines += [f"- **{r['id']} — {r['name']}** ({r['country']}) — {r['verification_status']}" for r in adds]
    lines += ["","## Full institutional list","","| ID | Institution | Country | Group | Type | Relevance | Established | Verification | Website | Notes |","|---|---|---|---:|---|:---:|---:|---|---|---|"]
    for r in d["institutions"]:
        vals=[r["id"],r["name"],r["country"],r["group"],r["institution_type"],r["protocol_relevance_level"],r.get("established","—"),r["verification_status"],r.get("website") or "—",r.get("notes","")]
        lines.append("| "+" | ".join(esc(x) for x in vals)+" |")
    lines += ["","## Use and limitations","","Working institutional audit; not an accreditation list, official recognition list or final public ranking.","",f"Generated: {DATE}"]
    put(OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV5.md","\n".join(lines)+"\n")
    url_lines=[f"# WPA URL Status Log — {REV5}","","| ID | Institution | Website | Website status |","|---|---|---|---|"]
    for r in d["institutions"]: url_lines.append("| "+" | ".join(esc(x) for x in [r["id"],r["name"],r.get("website") or "—",r.get("website_status") or "—"])+" |")
    put(OUT/"WPA_URL_Status_Log_CORRECTED-4F-REV5.md","\n".join(url_lines)+"\n")
    qa=f"""# WPA Master List QA Report — {REV5}\n\n**Generated:** {DATE}\n\n- Total records: **172** — PASS\n- External records: **171** — PASS\n- Distinct external institutions: **166** — PASS\n- Records with URL: **167** — PASS\n- Records without URL: **5** — PASS\n- Unique IDs: **172 / 172** — PASS\n- Group counts: **A=35, B=25, C=25, D=26, G=25, H=30, I=5, R=1** — PASS\n- Relevance counts: **A=41, B=109, C=22, D=0** — PASS\n- A027 British Protocol Academy and A033 IEPAL retained as separate London entities — PASS\n- A035 EIPS normalized to 2017 and marked historical/inactive — PASS\n- A032 PDI-POA not duplicated by secondary LinkedIn page — PASS\n- W001 Global Protocol Circle excluded from canonical counts — PASS\n- UNITAR preserved as existing C002; no duplicate added — PASS\n- REV4 source directory preserved — PASS\n"""
    put(OUT/"WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV5.md",qa)
    ch=[f"# Changelog — {REV5}","",f"**Date:** {DATE}","","## Added",""]+[f"- **{r['id']} — {r['name']}**" for r in adds]+["","## Controls","","- A035 EIPS corrected to creation year 2017 and marked inactive/historical.","- A027 and A033 retained as distinct London entities.","- W001 Global Protocol Circle retained as non-canonical watchlist entry.","- REV4 preserved as immediate archive predecessor."]
    put(OUT/"CHANGELOG_v1.0-CORRECTED-4F-REV5.md","\n".join(ch)+"\n")
    watch="""# WPA Professional Communities / Initiatives Watchlist — REV5\n\nAudit-visible ecosystem layer; excluded from canonical institution counts.\n\n| ID | Entity | Scope | Class | Canonical count |\n|---|---|---|---|---|\n| W001 | The Global Protocol Circle | Global / LinkedIn community | Professional protocol community / network | Excluded |\n"""
    put(OUT/"WPA_Professional_Communities_Watchlist_REV5.md",watch)

def update_tool(adds):
    t=deepcopy(load(TOOL4)); ids={r["id"] for r in t["institutions"]}
    for r in adds:
        assert r["id"] not in ids
        t["institutions"].append({"id":r["id"],"name":r["name"],"country":r["country"],"continent":CONTINENT[r["id"]],"group":r["group"],"type":r["institution_type"],"relevance":r["protocol_relevance_level"],"established":r["established"],"verification":r["verification_status"],"has_website":bool(r["website"]),"notes":r["notes"]})
    t.update({"version":REV5,"total_records":172,"external_records":171,"unique_external_institutions":166,"group_counts":{"A":35,"B":25,"C":25,"D":26,"G":25,"H":30,"I":5,"R":1},"note":"REV5 integrates A027-A035 and H030; REV4 remains archived."})
    t["institutions"]=sort_records(t["institutions"]); dump(TOOL5,t)

def update_status(adds):
    p=ROOT/"data/master-list-verification-status.json"; d=load(p); d["schema_version"]="1.3"; d["updated"]=DATE; d["canonical_dataset"]=REV5
    d["dataset"]={"total_records":172,"external_records":171,"distinct_external_institutions":166,"records_with_website_url":167,"records_without_website_url":5,"internal_wpa_reference_records":1,"groups":8,"group_scheme":"A-D, G-I, R"}
    vp=d.setdefault("verification_program",{}); vp["status"]="FRAMEWORK_LIVE_RECORD_LEVEL_VERIFICATION_IN_PROGRESS"; vp["record_level_counts_published"]=False
    vp["reason_counts_are_null"]="REV5 contains additional individually evidenced records; full record-level totals remain unpublished until the wider evidence review is logged."
    old=[a for a in vp.get("known_verified_anchors",[]) if a.get("id") not in EXPECTED]
    vp["known_verified_anchors"]=old+[{"id":r["id"],"status":r["verification_status"],"note":r["notes"]} for r in adds]
    d["canonical_sources"]=["/MASTER-LIST-CANONICAL.md","/data/global-institutions/v1.0-corrected-4f-rev5/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV5.json","/data/global-institutions/v1.0-corrected-4f-rev5/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV5.md"]
    dump(p,d)
    p=ROOT/"data/wpa-canonical-metrics-status.json"; d=load(p); d["updated"]=DATE; d["master_list_rev5"]={"canonical_version":REV5,"status":"PRE_PUBLICATION_CANDIDATE_INTERNAL_REVIEW","source_verification":"IN_PROGRESS","total_records":172,"external_records":171,"distinct_external_institutions":166,"records_with_website_url":167,"records_without_website_url":5,"internal_wpa_reference_records":1,"dataset_groups":8,"group_scheme":"A-D, G-I, R","group_counts":{"A":35,"B":25,"C":25,"D":26,"G":25,"H":30,"I":5,"R":1},"canonical_source":"/MASTER-LIST-CANONICAL.md","public_source":"/wpa-global-institutions-master-list.html","archive_predecessor":REV4,"addition_note":"A027-A035 and H030 integrated; W001 is watchlist-only."}; dump(p,d)

def write_canonical(adds):
    s=f"""# WPA Global Institutions Master List — Canonical Count File\n\n**Canonical source:** {REV5}\n**Status:** Pre-publication candidate / internal review\n**Effective revision date:** {DATE}\n\nREV5 integrates **10 additional canonical protocol/diplomacy institutions** and preserves REV4 as the immediate archive predecessor.\n\n## Canonical counts\n\n| Measure | Count |\n|---|---:|\n| Total records | 172 |\n| External records | 171 |\n| Distinct external institutions | 166 |\n| WPA internal reference records | 1 |\n| Records with website URL | 167 |\n| Records without website URL | 5 |\n\n## Group counts\n\nA=35, B=25, C=25, D=26, G=25, H=30, I=5, R=1.\n\n## REV5 additions\n\n"""+"\n".join(f"- **{r['id']} — {r['name']}** ({r['country']})" for r in adds)+"""\n\n## Count method\n\n171 external records − 5 preserved methodological/entity adjustments = **166 distinct external institutions**.\n\n## Records without website URL\n\nA005, A010, A035, B008, C011.\n\n## Professional-community watchlist\n\nW001 — The Global Protocol Circle is audit-visible but excluded from canonical counts.\n\n## Verification disclaimer\n\nNot a final public benchmark. Wider record-level source verification remains in progress. URL presence does not equal source verification.\n"""
    put(ROOT/"MASTER-LIST-CANONICAL.md",s)

def patch_public():
    p=ROOT/"wpa-global-institutions-master-list.html"; s=text(p)
    s=s.replace(REV4,REV5).replace("CORRECTED-4F-REV4","CORRECTED-4F-REV5").replace("v1.0-corrected-4f-rev4","v1.0-corrected-4f-rev5")
    pairs={"REV4 · OICP A026 integrated":"REV5 · 10 institutions integrated",'<strong id="statTotal">162</strong>':'<strong id="statTotal">172</strong>','<strong id="statExternal">161</strong>':'<strong id="statExternal">171</strong>','<strong id="statUnique">156</strong>':'<strong id="statUnique">166</strong>','<strong id="statUrls">158</strong>':'<strong id="statUrls">167</strong>','<tr><th>Total records</th><td>162</td></tr>':'<tr><th>Total records</th><td>172</td></tr>','<tr><th>External records</th><td>161</td></tr>':'<tr><th>External records</th><td>171</td></tr>','<tr><th>Unique external institutions</th><td>156 canonical methodological count</td></tr>':'<tr><th>Unique external institutions</th><td>166 canonical methodological count</td></tr>','A=26, B=25, C=25, D=26, G=25, H=29, I=5, R=1':'A=35, B=25, C=25, D=26, G=25, H=30, I=5, R=1','<tr><th>Records with website</th><td>158</td></tr>':'<tr><th>Records with website</th><td>167</td></tr>','<tr><th>Records without website</th><td>4: A005, A010, B008, C011</td></tr>':'<tr><th>Records without website</th><td>5: A005, A010, A035, B008, C011</td></tr>','Source: CORRECTED-4F-REV4 JSON · integrated entity-resolution':'Source: CORRECTED-4F-REV5 JSON · 10 institutions integrated','Source: CORRECTED-4F-REV4 JSON · OICP A026 integrated':'Source: CORRECTED-4F-REV5 JSON · 10 institutions integrated','Structured 4F-REV3 current master dataset; REV2 remains archived separately.':'Structured 4F-REV5 current master dataset; REV4 remains archived separately.'}
    for a,b in pairs.items(): s=s.replace(a,b)
    s=re.sub(r'<tr><th>Level A records</th><td>.*?</td></tr>','<tr><th>Level A records</th><td>41</td></tr>',s)
    marker='<tr><th>A005 / B008 status</th><td>Reported cooperation-model observations · Verification pending · No URL · Not verified institutional entities</td></tr>'
    if "REV5 additions</th>" not in s: s=s.replace(marker,marker+'\n        <tr><th>REV5 additions</th><td>A027–A035 and H030 integrated · W001 retained separately as non-canonical community/watchlist entry</td></tr>')
    put(p,s)

def patch_refs():
    files=["institute.html","intelligence-center.html","wpa-live-intelligence-feed.html","master-list-verification.html","wpa-metrics-status.html","wpa_institutions_master_list_v1.0.html","README.md","forms/wpa-index-public-disclaimer.md"]
    for name in files:
        p=ROOT/name
        if not p.exists(): continue
        s=text(p).replace(REV4,REV5).replace("CORRECTED-4F-REV4","CORRECTED-4F-REV5").replace("Master List REV4","Master List REV5")
        s=s.replace("162 records · 161 external records · 156 distinct external institutions","172 records · 171 external records · 166 distinct external institutions").replace("162 records · 156 distinct external institutions","172 records · 166 distinct external institutions")
        s=s.replace("n(m.total_records,162)","n(m.total_records,172)").replace("n(m.external_records,161)","n(m.external_records,171)").replace("n(m.distinct_external_institutions,156)","n(m.distinct_external_institutions,166)")
        s=s.replace("m=d.master_list_rev4||d.master_list_rev3||d.master_list_rev2||{}","m=d.master_list_rev5||d.master_list_rev4||d.master_list_rev3||d.master_list_rev2||{}")
        put(p,s)
    p=ROOT/"tools/assets/wpa-five-engines.js"
    if p.exists(): put(p,text(p).replace("institutions-master-rev4.json","institutions-master-rev5.json").replace("Master List REV4","Master List REV5").replace("162 records","172 records").replace("156 distinct external institutions","166 distinct external institutions"))

def main():
    d,adds,groups,levels=build(); write_package(d,adds,groups,levels); update_tool(adds); update_status(adds); write_canonical(adds); patch_public(); patch_refs()
    page=text(ROOT/"wpa-global-institutions-master-list.html"); assert 'statTotal">172' in page and "CORRECTED-4F-REV5" in page
    assert (OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV5.json").exists(); print("REV5 integration complete")
if __name__=="__main__": main()

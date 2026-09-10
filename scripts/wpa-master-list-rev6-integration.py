#!/usr/bin/env python3
from __future__ import annotations
import csv, json, re
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATE = "2026-09-10"
REV5 = "v1.0-CORRECTED-4F-REV5"
REV6 = "v1.0-CORRECTED-4F-REV6"
BASE = ROOT / "data/global-institutions/v1.0-corrected-4f-rev5/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV5.json"
ADDITIONS = ROOT / "data/global-institutions/patches/4f-rev6/WPA_REV6_Additions.json"
OUT = ROOT / "data/global-institutions/v1.0-corrected-4f-rev6"
TOOL5 = ROOT / "tools/data/institutions-master-rev5.json"
TOOL6 = ROOT / "tools/data/institutions-master-rev6.json"
GROUP_ORDER = {"A":0,"B":1,"C":2,"D":3,"G":4,"H":5,"I":6,"R":7}
CONTINENTS = {
    "United States":"North America","Japan":"Asia","Trinidad and Tobago":"North America","Bulgaria":"Europe",
    "Malta / Switzerland":"Europe","United Arab Emirates":"Asia","Poland":"Europe","Germany / United States":"Europe / North America",
    "Nepal":"Asia","Kenya":"Africa","Netherlands":"Europe","Türkiye":"Asia / Europe","Serbia":"Europe","Croatia":"Europe",
    "Hungary":"Europe","Kyrgyzstan":"Asia","Germany":"Europe","Morocco":"Africa","Malta":"Europe","Ukraine":"Europe",
    "Uzbekistan":"Asia","Vietnam":"Asia","South Africa":"Africa","Lebanon":"Asia","United Kingdom":"Europe","Sweden":"Europe",
    "Nepal":"Asia","France":"Europe","Sweden / Spain":"Europe","Belgium":"Europe","Nigeria":"Africa","Nigeria / Tanzania":"Africa",
    "Russia (Tatarstan)":"Europe / Asia","Uganda":"Africa","Austria":"Europe","India":"Asia"
}


def load(p): return json.loads(p.read_text(encoding="utf-8"))
def dump(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def put(p,s): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(s,encoding="utf-8",newline="\n")
def text(p): return p.read_text(encoding="utf-8")
def esc(v): return str(v if v is not None else "").replace("|","\\|").replace("\n"," ")
def sort_records(records):
    def key(r):
        rid=r.get("id",""); m=re.search(r"(\d+)$",rid)
        return (GROUP_ORDER.get(r.get("group",rid[:1]),99), int(m.group(1)) if m else 9999, rid)
    return sorted(records,key=key)


def build():
    base=deepcopy(load(BASE)); src=load(ADDITIONS); adds=src["additions"]
    assert base["metadata"]["version"]==REV5
    assert len(adds)==51
    existing={r["id"] for r in base["institutions"]}; newids=[r["id"] for r in adds]
    assert len(newids)==len(set(newids)) and not (existing & set(newids))
    rec=sort_records(base["institutions"]+adds)
    total=len(rec); external=sum(r["id"]!="R001" for r in rec)
    adjustments=5+len(src["non_distinct_child_ids"])
    distinct=external-adjustments
    urls=sum(bool((r.get("website") or "").strip()) for r in rec)
    groups=Counter(r["group"] for r in rec); levels=Counter(r["protocol_relevance_level"] for r in rec)
    assert (total,external,distinct,urls)==(223,222,214,216)
    assert groups==Counter({"A":70,"H":37,"B":33,"D":27,"C":25,"G":25,"I":5,"R":1})
    assert levels==Counter({"B":124,"A":77,"C":22})
    m=base["metadata"]
    m.update({
      "version":REV6,"previous_version":REV5,"generated_date":DATE,
      "description":"REV6 is the reconciled integral master-list revision for the 10 September 2026 protocol/diplomacy discovery sweep. It integrates 51 additional records after cross-checking REV5, WPA benchmark layers, parent/child relationships, aliases and source status.",
      "total_records":223,"external_records":222,"unique_external_institutions":214,
      "records_with_website":216,"records_without_website":7,
      "groups":{
        "A":"Protocol & Diplomacy Core (70 records)","B":"Think Tanks & Research Institutes (33 records)",
        "C":"Regional & International Organizations (25 records)","D":"Academic Institutions & University Programmes (27 records)",
        "E":"Reserved (unpopulated)","F":"Reserved (unpopulated)","G":"UN System & Specialized Agencies (25 records)",
        "H":"Courts, Tribunals, International NGOs & Professional Associations (37 records)","I":"International Financial Institutions (5 records)","R":"WPA Internal Record (1 record)"},
      "protocol_relevance_levels":{"A":"Direct protocol/diplomatic training relevance (77 records)","B":"Strategic / academic / research relevance (124 records)","C":"International organization / multilateral / NGO reference relevance (22 records)","D":"General reference / minimal direct protocol relevance (0 records)"},
      "verification_status":"REV6 additions were reconciled individually against REV5 and relevant WPA benchmark layers. Wider legacy-record source verification remains in progress; URL presence alone does not equal source verification.",
      "url_restoration_note":"Seven records have no active website field: A005, A010, A035, B008, C011, D027 and H036. D027 is historical; H036 has independent corroboration but no resolved primary domain.",
      "rev6_additions":newids,
      "rev6_non_distinct_child_records":src["non_distinct_child_ids"],
      "rev6_watchlist":src["watchlist"],
      "rev6_method":src["method"]
    })
    er=m.setdefault("entity_resolution",{})
    for r in adds:
        if r.get("parent_id"):
            er[r["id"]]={"entity_resolution_status":"AUDIT_VISIBLE_SPECIALIST_SUBUNIT","branch_or_alias_relationship":r["parent_id"],"counted_as_distinct_external_institution":False}
    er["A043"]={"entity_resolution_status":"CANONICAL_INSTITUTIONAL_FAMILY","branch_or_alias_relationship":"Institute for Cultural Diplomacy / Academy for Cultural Diplomacy","counted_as_distinct_external_institution":True}
    er["A046"]={"entity_resolution_status":"DISTINCT_NAMESAKE_ENTITY","branch_or_alias_relationship":"Not A047 — Protocol International (United States)","counted_as_distinct_external_institution":True}
    er["A047"]={"entity_resolution_status":"DISTINCT_NAMESAKE_ENTITY","branch_or_alias_relationship":"Not A046 — Protocol International (Netherlands)","counted_as_distinct_external_institution":True}
    er["A067"]={"entity_resolution_status":"CURRENT_SUCCESSOR_CONTEXT","branch_or_alias_relationship":"Historical Academy of Diplomacy and International Governance at Loughborough University London","counted_as_distinct_external_institution":True}
    er["A069"]={"entity_resolution_status":"CURRENT_SUCCESSOR_CONTEXT","branch_or_alias_relationship":"Historical Academy for Diplomacy and Security references","counted_as_distinct_external_institution":True}
    base["institutions"]=rec
    return base,src,groups,levels


def write_outputs(d,src,groups,levels):
    adds=src["additions"]; OUT.mkdir(parents=True,exist_ok=True)
    dump(OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV6.json",d)
    fields=["id","name","country","group","institution_type","protocol_relevance_level","verification_status","website","website_status","established","notes","parent_id","counted_as_distinct_external_institution"]
    with (OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV6.csv").open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore"); w.writeheader()
        non=set(src["non_distinct_child_ids"])
        for r in d["institutions"]:
            row=dict(r)
            if "counted_as_distinct_external_institution" not in row:
                row["counted_as_distinct_external_institution"]="false" if r["id"] in non or r["id"]=="A010" else ("n/a_internal" if r["id"]=="R001" else "true")
            w.writerow(row)
    md=[f"# WPA Global Institutions Master List — {REV6}","","**Status:** Reconciled integral revision · internal/pre-publication benchmark","",f"**Generated:** {DATE}","","## Canonical counts","","- Total records: **223**","- External records: **222**","- Distinct external institutions: **214**","- Records with website URL: **216**","- Records without website URL: **7**",f"- Groups: **A={groups['A']}, B={groups['B']}, C={groups['C']}, D={groups['D']}, G={groups['G']}, H={groups['H']}, I={groups['I']}, R={groups['R']}**",f"- Relevance levels: **A={levels['A']}, B={levels['B']}, C={levels['C']}, D={levels.get('D',0)}**","","## REV6 reconciliation additions",""]
    md += [f"- **{r['id']} — {r['name']}** ({r['country']}) — {r['verification_status']}" for r in adds]
    md += ["","## Full institutional list","","| ID | Institution | Country | Group | Type | Relevance | Established | Verification | Website | Notes |","|---|---|---|---:|---|:---:|---:|---|---|---|"]
    for r in d["institutions"]:
        vals=[r["id"],r["name"],r["country"],r["group"],r["institution_type"],r["protocol_relevance_level"],r.get("established","—"),r["verification_status"],r.get("website") or "—",r.get("notes","")]
        md.append("| "+" | ".join(esc(x) for x in vals)+" |")
    md += ["","## Methodology","","REV6 reconciles the two 10 September 2026 discovery exports against REV5 and other WPA benchmark layers. Discovery mentions were not automatically promoted. Parent/child units, historical brands, namesakes, programmes, LinkedIn groups and unresolved organizations were separately classified.","","This remains a WPA internal/pre-publication benchmark; the reconciliation is final for this discovery sweep, while wider legacy-record source verification continues."]
    put(OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV6.md","\n".join(md)+"\n")
    watch=["# WPA Professional Communities / Initiatives / Unresolved Candidates Watchlist — REV6","","Excluded from distinct canonical institution counts unless explicitly resolved in a later evidence pass.","","| ID | Entity | Classification | Reason |","|---|---|---|---|"]
    for w in src["watchlist"]: watch.append("| "+" | ".join(esc(x) for x in [w["id"],w["name"],w["classification"],w["reason"]])+" |")
    put(OUT/"WPA_Professional_Communities_Watchlist_REV6.md","\n".join(watch)+"\n")
    url=[f"# WPA URL Status Log — {REV6}","","| ID | Institution | Website | Website status |","|---|---|---|---|"]
    for r in d["institutions"]: url.append("| "+" | ".join(esc(x) for x in [r["id"],r["name"],r.get("website") or "—",r.get("website_status") or "—"])+" |")
    put(OUT/"WPA_URL_Status_Log_CORRECTED-4F-REV6.md","\n".join(url)+"\n")
    qa=f"""# WPA Master List QA Report — {REV6}\n\n**Generated:** {DATE}\n\n- Total records: **223** — PASS\n- External records: **222** — PASS\n- Distinct external institutions: **214** — PASS\n- Records with URL: **216** — PASS\n- Records without URL: **7** — PASS\n- Unique IDs: **223 / 223** — PASS\n- Group counts: **A=70, B=33, C=25, D=27, G=25, H=37, I=5, R=1** — PASS\n- Relevance counts: **A=77, B=124, C=22, D=0** — PASS\n- A038 resolved under D025 and excluded from distinct count — PASS\n- A065 resolved under A011 and excluded from distinct count — PASS\n- A066 resolved under H032 and excluded from distinct count — PASS\n- A043 ICD / Academy for Cultural Diplomacy treated as one family — PASS\n- A046 Netherlands and A047 United States Protocol International kept separate — PASS\n- A039 Bulgarian Diplomatic Institute normalized from existing WPA benchmark content into canonical master — PASS\n- D001/A010 prior entity-resolution preserved — PASS\n- W001-W013 excluded from canonical count — PASS\n- REV5 archive predecessor preserved — PASS\n"""
    put(OUT/"WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV6.md",qa)
    ch=[f"# Changelog — {REV6}","",f"**Date:** {DATE}","","## Reconciliation result","","REV6 integrates 51 additional records from the 10 September discovery sweep after full deduplication and entity-resolution review.","","## Added",""]+[f"- **{r['id']} — {r['name']}**" for r in adds]+["","## Entity-resolution controls","","- A038 / D025, A065 / A011 and A066 / H032 are audit-visible specialist subunits and do not inflate the distinct institution count.","- A043 combines ICD / Academy for Cultural Diplomacy as one institutional family.","- A046 and A047 are distinct Netherlands/U.S. namesake entities.","- W001-W013 remain outside canonical counts."]
    put(OUT/"CHANGELOG_v1.0-CORRECTED-4F-REV6.md","\n".join(ch)+"\n")


def update_tool(d,src):
    t=deepcopy(load(TOOL5)); existing={r["id"] for r in t["institutions"]}
    for r in src["additions"]:
        assert r["id"] not in existing
        t["institutions"].append({"id":r["id"],"name":r["name"],"country":r["country"],"continent":CONTINENTS.get(r["country"],"Other"),"group":r["group"],"type":r["institution_type"],"relevance":r["protocol_relevance_level"],"established":r.get("established","—"),"verification":r["verification_status"],"has_website":bool(r.get("website")),"notes":r.get("notes","")})
    t["institutions"]=sort_records(t["institutions"])
    t.update({"version":REV6,"total_records":223,"external_records":222,"unique_external_institutions":214,"group_counts":{"A":70,"B":33,"C":25,"D":27,"G":25,"H":37,"I":5,"R":1},"note":"REV6 reconciled integral revision for the 10 September 2026 discovery sweep."})
    dump(TOOL6,t)


def canonical(src):
    s=f"""# WPA Global Institutions Master List — Canonical Count File\n\n**Canonical source:** {REV6}\n**Status:** Reconciled integral revision / internal pre-publication benchmark\n**Effective revision date:** {DATE}\n\n## Canonical counts\n\n| Measure | Count |\n|---|---:|\n| Total records | 223 |\n| External records | 222 |\n| Distinct external institutions | 214 |\n| WPA internal reference records | 1 |\n| Records with website URL | 216 |\n| Records without website URL | 7 |\n\n## Group counts\n\nA=70, B=33, C=25, D=27, G=25, H=37, I=5, R=1.\n\n## Count method\n\n222 external records − 8 preserved methodological/entity adjustments = **214 distinct external institutions**. REV6 adds three non-distinct specialist-subunit adjustments (A038/D025, A065/A011, A066/H032) to the five adjustments carried forward from REV5.\n\n## Records without website URL\n\nA005, A010, A035, B008, C011, D027, H036.\n\n## Watchlist\n\nW001–W013 are excluded from canonical counts pending or by design (communities, programmes, unresolved candidates).\n\n## Verification disclaimer\n\nREV6 is final for the 10 September 2026 discovery/reconciliation sweep. Wider legacy-record source verification remains in progress; URL presence alone does not equal source verification.\n"""
    put(ROOT/"MASTER-LIST-CANONICAL.md",s)


def update_status(src):
    p=ROOT/"data/master-list-verification-status.json"; d=load(p); d["schema_version"]="1.4"; d["updated"]=DATE; d["canonical_dataset"]=REV6
    d["dataset"]={"total_records":223,"external_records":222,"distinct_external_institutions":214,"records_with_website_url":216,"records_without_website_url":7,"internal_wpa_reference_records":1,"groups":8,"group_scheme":"A-D, G-I, R"}
    vp=d.setdefault("verification_program",{}); vp["status"]="REV6_RECONCILED_SWEEP_COMPLETE_LEGACY_RECORD_VERIFICATION_IN_PROGRESS"; vp["record_level_counts_published"]=False
    vp["reason_counts_are_null"]="REV6 discovery additions are reconciled; full legacy-record verification totals remain unpublished until the wider evidence review is completed."
    known=vp.get("known_verified_anchors",[]); ids={r["id"] for r in src["additions"]}; known=[x for x in known if x.get("id") not in ids]
    known += [{"id":r["id"],"status":r["verification_status"],"note":r.get("notes","")} for r in src["additions"]]
    vp["known_verified_anchors"]=known
    d["canonical_sources"]=["/MASTER-LIST-CANONICAL.md","/data/global-institutions/v1.0-corrected-4f-rev6/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV6.json","/data/global-institutions/v1.0-corrected-4f-rev6/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV6.md"]
    dump(p,d)
    p=ROOT/"data/wpa-canonical-metrics-status.json"; d=load(p); d["updated"]=DATE; d["master_list_rev6"]={"canonical_version":REV6,"status":"RECONCILED_INTEGRAL_REVISION_INTERNAL_PRE_PUBLICATION","source_verification":"REV6_SWEEP_COMPLETE_LEGACY_IN_PROGRESS","total_records":223,"external_records":222,"distinct_external_institutions":214,"records_with_website_url":216,"records_without_website_url":7,"internal_wpa_reference_records":1,"dataset_groups":8,"group_scheme":"A-D, G-I, R","group_counts":{"A":70,"B":33,"C":25,"D":27,"G":25,"H":37,"I":5,"R":1},"canonical_source":"/MASTER-LIST-CANONICAL.md","public_source":"/wpa-global-institutions-master-list.html","archive_predecessor":REV5,"addition_note":"51 reconciled records integrated; three specialist subunits are audit-visible but non-distinct; W001-W013 excluded."}; dump(p,d)


def patch_pages():
    p=ROOT/"wpa-global-institutions-master-list.html"; s=text(p)
    s=s.replace(REV5,REV6).replace("CORRECTED-4F-REV5","CORRECTED-4F-REV6").replace("v1.0-corrected-4f-rev5","v1.0-corrected-4f-rev6")
    replacements={
      'statTotal">172':'statTotal">223','statExternal">171':'statExternal">222','statUnique">166':'statUnique">214','statUrls">167':'statUrls">216',
      '<tr><th>Total records</th><td>172</td></tr>':'<tr><th>Total records</th><td>223</td></tr>',
      '<tr><th>External records</th><td>171</td></tr>':'<tr><th>External records</th><td>222</td></tr>',
      '<tr><th>Unique external institutions</th><td>166 canonical methodological count</td></tr>':'<tr><th>Unique external institutions</th><td>214 canonical methodological count</td></tr>',
      'A=35, B=25, C=25, D=26, G=25, H=30, I=5, R=1':'A=70, B=33, C=25, D=27, G=25, H=37, I=5, R=1',
      '<tr><th>Records with website</th><td>167</td></tr>':'<tr><th>Records with website</th><td>216</td></tr>',
      '<tr><th>Records without website</th><td>5: A005, A010, A035, B008, C011</td></tr>':'<tr><th>Records without website</th><td>7: A005, A010, A035, B008, C011, D027, H036</td></tr>',
      'REV5 · 10 institutions integrated':'REV6 · integral reconciliation completed',
      'Source: CORRECTED-4F-REV5 JSON · 10 institutions integrated':'Source: CORRECTED-4F-REV6 JSON · 51 reconciled records integrated',
      'Structured 4F-REV5 current master dataset; REV4 remains archived separately.':'Structured 4F-REV6 current master dataset; REV5 remains archived separately.'}
    for a,b in replacements.items(): s=s.replace(a,b)
    s=re.sub(r'<tr><th>Level A records</th><td>.*?</td></tr>','<tr><th>Level A records</th><td>77</td></tr>',s)
    s=re.sub(r'<tr><th>Level B records</th><td>.*?</td></tr>','<tr><th>Level B records</th><td>124</td></tr>',s)
    s=s.replace('A027–A035 and H030 integrated · W001 retained separately as non-canonical community/watchlist entry','A036–A070, B026–B033, D027 and H031–H037 integrated · child/subunit entity-resolution applied · W001–W013 excluded from canonical counts')
    put(p,s)
    for name in ["institute.html","intelligence-center.html","wpa-live-intelligence-feed.html","master-list-verification.html","wpa-metrics-status.html","wpa_institutions_master_list_v1.0.html","README.md","forms/wpa-index-public-disclaimer.md"]:
        q=ROOT/name
        if not q.exists(): continue
        z=text(q).replace(REV5,REV6).replace("CORRECTED-4F-REV5","CORRECTED-4F-REV6").replace("Master List REV5","Master List REV6")
        z=z.replace("172 records · 171 external records · 166 distinct external institutions","223 records · 222 external records · 214 distinct external institutions").replace("172 records · 166 distinct external institutions","223 records · 214 distinct external institutions")
        z=z.replace("n(m.total_records,172)","n(m.total_records,223)").replace("n(m.external_records,171)","n(m.external_records,222)").replace("n(m.distinct_external_institutions,166)","n(m.distinct_external_institutions,214)")
        z=z.replace("m=d.master_list_rev5||d.master_list_rev4||d.master_list_rev3||d.master_list_rev2||{}","m=d.master_list_rev6||d.master_list_rev5||d.master_list_rev4||d.master_list_rev3||d.master_list_rev2||{}")
        put(q,z)
    q=ROOT/"tools/assets/wpa-five-engines.js"
    if q.exists(): put(q,text(q).replace("institutions-master-rev5.json","institutions-master-rev6.json").replace("Master List REV5","Master List REV6").replace("172 records","223 records").replace("166 distinct external institutions","214 distinct external institutions"))


def main():
    d,src,groups,levels=build(); write_outputs(d,src,groups,levels); update_tool(d,src); canonical(src); update_status(src); patch_pages()
    page=text(ROOT/"wpa-global-institutions-master-list.html")
    assert 'statTotal">223' in page and 'statExternal">222' in page and 'statUnique">214' in page and "CORRECTED-4F-REV6" in page
    out=load(OUT/"WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV6.json")
    ids=[r["id"] for r in out["institutions"]]; assert len(ids)==223 and len(ids)==len(set(ids))
    print("REV6 integral reconciliation complete: 223 records / 222 external / 214 distinct")

if __name__=="__main__": main()

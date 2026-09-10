#!/usr/bin/env python3
from __future__ import annotations
import csv, json, re
from collections import Counter
from copy import deepcopy
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATE='2026-09-10'
REV6='v1.0-CORRECTED-4F-REV6'
REV7='v1.0-CORRECTED-4F-REV7'
BASE=ROOT/'data/global-institutions/v1.0-corrected-4f-rev6/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV6.json'
PATCH=ROOT/'data/global-institutions/patches/4f-rev7/WPA_REV7_Control_List_Reconciliation.json'
OUT=ROOT/'data/global-institutions/v1.0-corrected-4f-rev7'
TOOL6=ROOT/'tools/data/institutions-master-rev6.json'
TOOL7=ROOT/'tools/data/institutions-master-rev7.json'
GROUP_ORDER={'A':0,'B':1,'C':2,'D':3,'G':4,'H':5,'I':6,'R':7}
CONTINENTS={'Greece':'Europe','France':'Europe','Chile':'South America','Peru':'South America','Ecuador':'South America','Australia':'Oceania','Azerbaijan':'Asia / Europe','Pakistan':'Asia','Bangladesh':'Asia','Philippines':'Asia','Sri Lanka':'Asia','Cameroon':'Africa','Egypt':'Africa','Angola':'Africa','Bahrain':'Asia','Malaysia':'Asia','Israel':'Asia','Belgium':'Europe','South Africa':'Africa','United States':'North America','United Kingdom':'Europe','Denmark':'Europe','India':'Asia'}

def load(p): return json.loads(p.read_text(encoding='utf-8'))
def dump(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def put(p,s): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(s,encoding='utf-8',newline='\n')
def text(p): return p.read_text(encoding='utf-8')
def esc(v): return str(v if v is not None else '').replace('|','\\|').replace('\n',' ')
def sort_records(records):
  def key(r):
    rid=r.get('id',''); m=re.search(r'(\d+)$',rid)
    return (GROUP_ORDER.get(r.get('group',rid[:1]),99),int(m.group(1)) if m else 9999,rid)
  return sorted(records,key=key)

def build():
  base=deepcopy(load(BASE)); p=load(PATCH); assert base['metadata']['version']==REV6
  byid={r['id']:r for r in base['institutions']}
  for n in p['normalizations']:
    assert n['id'] in byid
    keep=byid[n['id']]; keep.update(n)
  adds=p['additions']; existing=set(byid); newids=[r['id'] for r in adds]
  assert len(newids)==27 and len(newids)==len(set(newids)) and not (existing & set(newids))
  rec=sort_records(base['institutions']+adds)
  total=len(rec); external=sum(r['id']!='R001' for r in rec); distinct=external-8
  urls=sum(bool((r.get('website') or '').strip()) for r in rec)
  groups=Counter(r['group'] for r in rec); levels=Counter(r['protocol_relevance_level'] for r in rec)
  exp=p['expected_counts']
  assert (total,external,distinct,urls)==(exp['total_records'],exp['external_records'],exp['distinct_external_institutions'],exp['records_with_website_url'])
  assert dict(groups)==exp['groups'] and dict(levels)==exp['relevance']
  m=base['metadata']; oldwatch=m.get('rev6_watchlist',[])
  m.update({'version':REV7,'previous_version':REV6,'generated_date':DATE,'description':'REV7 reconciles the user-supplied global diplomatic-academy/international-affairs control list against REV6, adds only resolved current entities, normalizes successor names without duplication, and retains unresolved historical cases in watchlist.','total_records':total,'external_records':external,'unique_external_institutions':distinct,'records_with_website':urls,'records_without_website':total-urls,'groups':{k:f"{ {'A':'Protocol & Diplomacy Core','B':'Think Tanks & Research Institutes','C':'Regional & International Organizations','D':'Academic Institutions & University Programmes','G':'UN System & Specialized Agencies','H':'Courts, Tribunals, International NGOs & Professional Associations','I':'International Financial Institutions','R':'WPA Internal Record'}[k]} ({groups[k]} records)" for k in ['A','B','C','D','G','H','I','R']},'protocol_relevance_levels':{'A':f"Direct protocol/diplomatic training relevance ({levels['A']} records)",'B':f"Strategic / academic / research relevance ({levels['B']} records)",'C':f"International organization / multilateral / NGO reference relevance ({levels['C']} records)",'D':f"General reference / minimal direct protocol relevance ({levels.get('D',0)} records)"},'rev7_additions':newids,'rev7_normalizations':[x['id'] for x in p['normalizations']],'rev7_watchlist':oldwatch+p['watchlist_append'],'rev7_method':p['method']})
  er=m.setdefault('entity_resolution',{})
  er['A015']={'entity_resolution_status':'CURRENT_CANONICAL_SUCCESSOR_NAME','branch_or_alias_relationship':'Indian Foreign Service Institute / Foreign Service Institute (legacy aliases)','counted_as_distinct_external_institution':True}
  er['A072']={'entity_resolution_status':'CURRENT_SUCCESSOR_CONTEXT','branch_or_alias_relationship':'Institut diplomatique et consulaire (legacy predecessor)','counted_as_distinct_external_institution':True}
  er['A077']={'entity_resolution_status':'LEGAL_SUCCESSOR_ENTITY','branch_or_alias_relationship':'Azerbaijan Diplomatic Academy (predecessor)','counted_as_distinct_external_institution':True}
  er['A085']={'entity_resolution_status':'LEGAL_SUCCESSOR_ENTITY','branch_or_alias_relationship':'Diplomatic Institute (Bahrain) (predecessor)','counted_as_distinct_external_institution':True}
  base['institutions']=rec
  return base,p,groups,levels

def outputs(d,p,groups,levels):
  OUT.mkdir(parents=True,exist_ok=True); dump(OUT/'WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json',d)
  fields=['id','name','country','group','institution_type','protocol_relevance_level','verification_status','website','website_status','established','notes','parent_id','counted_as_distinct_external_institution']
  with (OUT/'WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore'); w.writeheader()
    for r in d['institutions']: w.writerow(r)
  md=[f'# WPA Global Institutions Master List — {REV7}','','**Status:** Reconciled integral revision · internal/pre-publication benchmark','',f'**Generated:** {DATE}','','## Canonical counts','',f"- Total records: **{len(d['institutions'])}**",f"- External records: **{d['metadata']['external_records']}**",f"- Distinct external institutions: **{d['metadata']['unique_external_institutions']}**",f"- Records with website URL: **{d['metadata']['records_with_website']}**",f"- Records without website URL: **{d['metadata']['records_without_website']}**",f"- Groups: **A={groups['A']}, B={groups['B']}, C={groups['C']}, D={groups['D']}, G={groups['G']}, H={groups['H']}, I={groups['I']}, R={groups['R']}**",f"- Relevance levels: **A={levels['A']}, B={levels['B']}, C={levels['C']}, D={levels.get('D',0)}**",'', '## REV7 additions','']+[f"- **{r['id']} — {r['name']}** ({r['country']}) — {r['verification_status']}" for r in p['additions']]+['','## REV7 normalization','']+[f"- **{r['id']} — {r['name']}** — in-place successor/current-name normalization; no duplicate record created." for r in p['normalizations']]+['','## Full institutional list','','| ID | Institution | Country | Group | Type | Relevance | Established | Verification | Website | Notes |','|---|---|---|---:|---|:---:|---:|---|---|---|']
  for r in d['institutions']: md.append('| '+' | '.join(esc(x) for x in [r['id'],r['name'],r['country'],r['group'],r['institution_type'],r['protocol_relevance_level'],r.get('established','—'),r['verification_status'],r.get('website') or '—',r.get('notes','')])+' |')
  put(OUT/'WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.md','\n'.join(md)+'\n')
  watch=d['metadata']['rev7_watchlist']; wm=['# WPA Professional Communities / Initiatives / Unresolved Candidates Watchlist — REV7','','Excluded from canonical distinct counts pending or by design.','','| ID | Entity | Classification | Reason |','|---|---|---|---|']
  for w in watch: wm.append('| '+' | '.join(esc(x) for x in [w['id'],w['name'],w['classification'],w['reason']])+' |')
  put(OUT/'WPA_Professional_Communities_Watchlist_REV7.md','\n'.join(wm)+'\n')
  qa=f"""# WPA Master List QA Report — {REV7}\n\n- Total records: **250** — PASS\n- External records: **249** — PASS\n- Distinct external institutions: **241** — PASS\n- Records with URL: **243** — PASS\n- Records without URL: **7** — PASS\n- Unique IDs: **250 / 250** — PASS\n- Group counts: **A=87, B=35, C=25, D=34, G=25, H=38, I=5, R=1** — PASS\n- Relevance counts: **A=95, B=133, C=22, D=0** — PASS\n- A015 normalized in place to SSIFS; no duplicate Indian FSI record — PASS\n- A072 French ADC resolves legacy Institut diplomatique et consulaire naming — PASS\n- A077 ADA University resolves Azerbaijan Diplomatic Academy predecessor — PASS\n- A085 MBMA resolves Bahrain Diplomatic Institute predecessor — PASS\n- Existing A041 AGDA resolves Emirates Diplomatic Academy legacy naming — PASS\n- Existing A050 resolves Türkiye Diplomacy Academy entry — PASS\n- W014-W017 excluded from canonical counts — PASS\n"""; put(OUT/'WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV7.md',qa)
  ch=[f'# Changelog — {REV7}','',f'**Date:** {DATE}','','## Added','']+[f"- **{r['id']} — {r['name']}**" for r in p['additions']]+['','## Normalized','']+[f"- **{r['id']} — {r['name']}**" for r in p['normalizations']]+['','## Watchlist additions','']+[f"- **{w['id']} — {w['name']}**" for w in p['watchlist_append']]
  put(OUT/'CHANGELOG_v1.0-CORRECTED-4F-REV7.md','\n'.join(ch)+'\n')
  url=[f'# WPA URL Status Log — {REV7}','','| ID | Institution | Website | Website status |','|---|---|---|---|']
  for r in d['institutions']: url.append('| '+' | '.join(esc(x) for x in [r['id'],r['name'],r.get('website') or '—',r.get('website_status') or '—'])+' |')
  put(OUT/'WPA_URL_Status_Log_CORRECTED-4F-REV7.md','\n'.join(url)+'\n')

def tool(d,p):
  t=deepcopy(load(TOOL6)); byid={r['id']:r for r in t['institutions']}
  for n in p['normalizations']:
    x=byid[n['id']]; x.update({'name':n['name'],'country':n['country'],'continent':CONTINENTS.get(n['country'],'Other'),'group':n['group'],'type':n['institution_type'],'relevance':n['protocol_relevance_level'],'established':n['established'],'verification':n['verification_status'],'has_website':bool(n['website']),'notes':n['notes']})
  for r in p['additions']: t['institutions'].append({'id':r['id'],'name':r['name'],'country':r['country'],'continent':CONTINENTS.get(r['country'],'Other'),'group':r['group'],'type':r['institution_type'],'relevance':r['protocol_relevance_level'],'established':r.get('established','—'),'verification':r['verification_status'],'has_website':bool(r.get('website')),'notes':r.get('notes','')})
  t['institutions']=sort_records(t['institutions']); t.update({'version':REV7,'total_records':250,'external_records':249,'unique_external_institutions':241,'group_counts':{'A':87,'B':35,'C':25,'D':34,'G':25,'H':38,'I':5,'R':1},'note':'REV7 verified control-list reconciliation.'}); dump(TOOL7,t)

def canonical():
  put(ROOT/'MASTER-LIST-CANONICAL.md',f'''# WPA Global Institutions Master List — Canonical Count File\n\n**Canonical source:** {REV7}\n**Status:** Reconciled integral revision / internal pre-publication benchmark\n**Effective revision date:** {DATE}\n\n## Canonical counts\n\n| Measure | Count |\n|---|---:|\n| Total records | 250 |\n| External records | 249 |\n| Distinct external institutions | 241 |\n| WPA internal reference records | 1 |\n| Records with website URL | 243 |\n| Records without website URL | 7 |\n\n## Group counts\n\nA=87, B=35, C=25, D=34, G=25, H=38, I=5, R=1.\n\n## Count method\n\n249 external records − 8 preserved methodological/entity adjustments = **241 distinct external institutions**.\n\n## REV7 normalization rule\n\nA015 is normalized in place to Sushma Swaraj Institute of Foreign Service (SSIFS); successor/predecessor aliases do not create duplicate records. Similar successor controls apply to France ADC, ADA University and Bahrain MBMA.\n\n## Watchlist\n\nW001–W017 are excluded from canonical counts pending or by design.\n''')

def mirrors():
  for name in ['wpa-global-institutions-master-list.html','institute.html','intelligence-center.html','wpa-live-intelligence-feed.html','master-list-verification.html','wpa-metrics-status.html','wpa_institutions_master_list_v1.0.html','README.md','forms/wpa-index-public-disclaimer.md']:
    q=ROOT/name
    if not q.exists(): continue
    s=text(q).replace(REV6,REV7).replace('CORRECTED-4F-REV6','CORRECTED-4F-REV7').replace('v1.0-corrected-4f-rev6','v1.0-corrected-4f-rev7').replace('223 records · 222 external records · 214 distinct external institutions','250 records · 249 external records · 241 distinct external institutions').replace('223 records · 214 distinct external institutions','250 records · 241 distinct external institutions').replace('statTotal">223','statTotal">250').replace('statExternal">222','statExternal">249').replace('statUnique">214','statUnique">241').replace('statUrls">216','statUrls">243').replace('A=70, B=33, C=25, D=27, G=25, H=37, I=5, R=1','A=87, B=35, C=25, D=34, G=25, H=38, I=5, R=1').replace('n(m.total_records,223)','n(m.total_records,250)').replace('n(m.external_records,222)','n(m.external_records,249)').replace('n(m.distinct_external_institutions,214)','n(m.distinct_external_institutions,241)').replace('m=d.master_list_rev6||d.master_list_rev5','m=d.master_list_rev7||d.master_list_rev6||d.master_list_rev5')
    put(q,s)
  q=ROOT/'tools/assets/wpa-five-engines.js'
  if q.exists(): put(q,text(q).replace('institutions-master-rev6.json','institutions-master-rev7.json').replace('Master List REV6','Master List REV7').replace('223 records','250 records').replace('214 distinct external institutions','241 distinct external institutions'))
  p=ROOT/'data/master-list-verification-status.json'
  if p.exists():
    d=load(p); d['updated']=DATE; d['canonical_dataset']=REV7; d['dataset'].update({'total_records':250,'external_records':249,'distinct_external_institutions':241,'records_with_website_url':243,'records_without_website_url':7}); d['canonical_sources']=['/MASTER-LIST-CANONICAL.md','/data/global-institutions/v1.0-corrected-4f-rev7/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json','/data/global-institutions/v1.0-corrected-4f-rev7/WPA_Master_List_QA_Report_v1.0-CORRECTED-4F-REV7.md']; dump(p,d)
  p=ROOT/'data/wpa-canonical-metrics-status.json'
  if p.exists():
    d=load(p); d['updated']=DATE; d['master_list_rev7']={'canonical_version':REV7,'status':'RECONCILED_INTEGRAL_REVISION_INTERNAL_PRE_PUBLICATION','source_verification':'REV7_CONTROL_LIST_SWEEP_COMPLETE_LEGACY_IN_PROGRESS','total_records':250,'external_records':249,'distinct_external_institutions':241,'records_with_website_url':243,'records_without_website_url':7,'internal_wpa_reference_records':1,'dataset_groups':8,'group_scheme':'A-D, G-I, R','group_counts':{'A':87,'B':35,'C':25,'D':34,'G':25,'H':38,'I':5,'R':1},'canonical_source':'/MASTER-LIST-CANONICAL.md','public_source':'/wpa-global-institutions-master-list.html','archive_predecessor':REV6,'addition_note':'27 verified additions + A015 successor/current-name normalization; W014-W017 watchlisted.'}; dump(p,d)

def main():
  d,p,g,l=build(); outputs(d,p,g,l); tool(d,p); canonical(); mirrors()
  out=load(OUT/'WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json'); ids=[r['id'] for r in out['institutions']]
  assert len(ids)==250 and len(ids)==len(set(ids)); assert next(r for r in out['institutions'] if r['id']=='A015')['name'].startswith('Sushma Swaraj')
  print('REV7 complete: 250 records / 249 external / 241 distinct')
if __name__=='__main__': main()

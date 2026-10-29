#!/usr/bin/env python3
import argparse, json, os, re, tempfile, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
from zoneinfo import ZoneInfo

API_DEFAULT='https://wpa-live-production-bridge.worldprotocolacademy.workers.dev'
ORIGIN='https://worldprotocolacademy.mk'
DOMAINS=('protocol','diplomacy','public_relations','security','communicology')
LABELS={'protocol':'Protocol · Протокол','diplomacy':'Diplomacy · Дипломатија','public_relations':'Public Relations · Односи со јавност','security':'Security · Безбедност','communicology':'Communicology · Комуникологија'}

def cli():
 p=argparse.ArgumentParser(); p.add_argument('--repo-root',default='.'); p.add_argument('--api-root',default=API_DEFAULT); p.add_argument('--fixture'); p.add_argument('--limit',type=int,default=120); p.add_argument('--max-age-hours',type=float,default=48); p.add_argument('--max-api-age-hours',type=float,default=8); p.add_argument('--min-relevance',type=float,default=65); p.add_argument('--min-confidence',type=float,default=65); p.add_argument('--max-items',type=int,default=10); p.add_argument('--min-items',type=int,default=3); p.add_argument('--min-domains',type=int,default=2); p.add_argument('--self-test',action='store_true'); return p.parse_args()

def clean(v): return re.sub(r'\s+',' ',str(v or '')).strip()
def dt(v):
 try:
  z=str(v or '').replace('Z','+00:00'); d=datetime.fromisoformat(z); return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
 except Exception: return None
def clamp(v):
 try:return max(0,min(100,float(v)))
 except Exception:return 0
def canon(v):
 try:
  s=urlsplit(str(v));
  if s.scheme not in ('http','https') or not s.netloc:return ''
  q=[(k,x) for k,x in parse_qsl(s.query,keep_blank_values=True) if not re.match(r'^(utm_|fbclid$|gclid$|mc_)',k,re.I)]
  return urlunsplit((s.scheme,s.netloc,s.path.rstrip('/') or '/',urlencode(q),''))
 except Exception:return ''
def domain(x):
 s=(clean(x.get('primary_category'))+' '+' '.join(map(str,x.get('signals') or []))).lower()
 if re.search(r'\bprotocol\b|протокол',s):return 'protocol'
 if re.search(r'\bdiplomacy\b|diplomat|диплом',s):return 'diplomacy'
 if re.search(r'public.?relations|\bpr\b|public.?communication|односи со јавност|јавна комуникација',s):return 'public_relations'
 if re.search(r'\bsecurity\b|безбед',s):return 'security'
 if re.search(r'communicology|комуниколог',s):return 'communicology'
 return ''
def sports(x):
 s=(clean(x.get('title'))+' '+clean(x.get('summary'))).lower()
 return bool(re.search(r'\b(football|soccer|basketball|tennis|rugby|cricket|boxing|ufc|league|tournament|championship|grand prix|f1)\b',s) and not re.search(r'diplom|protocol|government|minister|president|embassy|sanction|summit|treaty|security|state visit|official visit|public diplomacy',s))
def fetch(a):
 if a.fixture:return json.loads(Path(a.fixture).read_text(encoding='utf-8'))
 req=urllib.request.Request(a.api_root.rstrip('/')+'/api/v1/live?limit='+str(a.limit),headers={'Accept':'application/json','Origin':ORIGIN,'User-Agent':'WPA-Institute-Daily-Product/1.0'})
 with urllib.request.urlopen(req,timeout=30) as r:return json.load(r)
def build(packet,a,now):
 g=dt(packet.get('generated_at'));
 if not g:raise RuntimeError('API generated_at missing/invalid')
 age=(now-g).total_seconds()/3600
 if age < -.5 or age > a.max_api_age_hours:raise RuntimeError('API packet stale: %.1fh'%age)
 by={}
 for raw in packet.get('items') or []:
  p=dt(raw.get('published_at')); u=canon(raw.get('original_url')); d=domain(raw)
  if not p or not u or not d or sports(raw):continue
  h=(now-p).total_seconds()/3600
  if h < -.5 or h > a.max_age_hours:continue
  health=clean(raw.get('source_health_status')).lower()
  if re.search(r'dead|fail|unhealthy|down',health):continue
  r,c=clamp(raw.get('relevance_score')),clamp(raw.get('source_confidence'))
  if r<a.min_relevance or c<a.min_confidence:continue
  official=bool(re.search(r'single_official_source',clean(raw.get('verification_status')),re.I))
  fresh=max(0,100-(h/48)*70); score=min(100,round(.45*r+.35*c+.20*fresh+(3 if official else 0)))
  key=u or clean(raw.get('id')) or (clean(raw.get('source'))+'|'+clean(raw.get('title'))+'|'+clean(raw.get('published_at'))).lower()
  x={'key':key,'id':clean(raw.get('id')) or None,'title':clean(raw.get('title')),'summary':clean(raw.get('summary')),'source':clean(raw.get('source')) or 'Unknown source','original_url':u,'published_at':p.astimezone(timezone.utc).isoformat().replace('+00:00','Z'),'fetched_at':dt(raw.get('fetched_at')).astimezone(timezone.utc).isoformat().replace('+00:00','Z') if dt(raw.get('fetched_at')) else None,'region':clean(raw.get('region')) or 'International','country':clean(raw.get('country')) or None,'source_type':clean(raw.get('source_type')) or None,'domain':d,'relevance_score':r,'source_confidence':c,'score':score,'verification_status':clean(raw.get('verification_status')) or 'candidate','source_health_status':health or 'unknown','official_source':official}
  if key not in by or score>by[key]['score']:by[key]=x
 eligible=sorted(by.values(),key=lambda x:(x['score'],x['published_at']),reverse=True); chosen=[]; seen=set()
 for d in DOMAINS:
  x=next((z for z in eligible if z['domain']==d and z['key'] not in seen),None)
  if x:chosen.append(x);seen.add(x['key'])
 for x in eligible:
  if len(chosen)>=a.max_items:break
  if x['key'] not in seen:chosen.append(x);seen.add(x['key'])
 chosen=chosen[:a.max_items]; dc=len(set(x['domain'] for x in chosen))
 if len(chosen)<a.min_items:raise RuntimeError('Health gate: only %d eligible items'%len(chosen))
 if dc<a.min_domains:raise RuntimeError('Health gate: only %d domains represented'%dc)
 return chosen,len(eligible),dc,g

def product(packet,b,a,now):
 selected,eligible,dc,g=b; date=now.astimezone(ZoneInfo('Europe/Skopje')).date().isoformat(); counts={d:sum(x['domain']==d for x in selected) for d in DOMAINS}
 return {'schema_version':'1.0','product':'WPA Institute Daily Brief','product_date':date,'status':'AUTO_GENERATED_READY_FOR_HUMAN_GATE','generated_at':now.astimezone(timezone.utc).isoformat().replace('+00:00','Z'),'timezone':'Europe/Skopje','canonical_input':{'system':'WPA Journal Live','endpoint':a.api_root.rstrip('/')+'/api/v1/live','packet_generated_at':g.astimezone(timezone.utc).isoformat().replace('+00:00','Z'),'original_sources_authoritative':True},'automation':{'mode':'A_TO_B_DAILY','source_window_hours':a.max_age_hours,'min_relevance':a.min_relevance,'min_confidence':a.min_confidence,'selected_items':len(selected),'eligible_items':eligible,'domains_represented':dc,'domain_counts':counts},'boundaries':{'peer_reviewed':False,'official_institutional_position':False,'automatic_external_publication':False,'automatic_doi':False,'human_gate_required_for_consequential_release':True},'human_gate':{'state':'PENDING','required_for':['journal/working-paper/protocol-note publication','doctrine or canonical institutional claims','external platform posting','third-party visual reuse','presenting a candidate as an independently verified WPA finding']},'items':[{k:v for k,v in x.items() if k!='key'} for x in selected]}
def mktime(v):return datetime.fromisoformat(v.replace('Z','+00:00')).astimezone(ZoneInfo('Europe/Skopje')).strftime('%d.%m.%Y %H:%M')
def md(p):
 out=['# WPA Institute Daily Brief — '+p['product_date'],'','**Status:** '+p['status'],'','Generated: '+mktime(p['generated_at'])+' · Europe/Skopje','Canonical input: WPA Journal Live · Original sources remain authoritative.','','## Daily selection','']
 for i,x in enumerate(p['items'],1):out += ['### %d. %s'%(i,x['title']),'','**%s** · %s · R %s · C %s · Product score %s'%(LABELS[x['domain']],x['source'],x['relevance_score'],x['source_confidence'],x['score']),'',x['summary'] or 'No summary available.','', 'Original source: '+x['original_url'],'']
 out += ['## Human Gate','','Automatically prepared and ready for human review. Not a peer-reviewed article, official institutional position, legal/security/diplomatic advice, or automatic external publication.','','Human approval is required before consequential release, doctrine changes, journal/working-paper/protocol-note publication, external platform posting, or third-party visual reuse.',''];return '\n'.join(out)
def esc(s):return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;').replace("'","&#39;")
def page(p):
 cards=''.join('<article class="card"><div class="tag">%s</div><h2>%d. %s</h2><p class="meta">%s · %s · R %s · C %s · Score %s</p><p>%s</p><p><a href="%s" target="_blank" rel="noopener noreferrer">Original source →</a></p></article>'%(esc(LABELS[x['domain']]),i,esc(x['title']),esc(x['source']),esc(mktime(x['published_at'])),x['relevance_score'],x['source_confidence'],x['score'],esc(x['summary'] or 'No summary available.'),esc(x['original_url'])) for i,x in enumerate(p['items'],1))
 return '<!doctype html><html lang="mk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WPA Institute Daily Brief — %s</title><meta name="description" content="Automated daily public-source briefing prepared for WPA Institute and held at the Human Gate."><style>:root{--n:#071526;--g:#c9a84c;--p:#fbf8ee;--i:#182033;--m:#647083;--l:#d8cdb8}*{box-sizing:border-box}body{margin:0;background:var(--p);color:var(--i);font:16px/1.65 Inter,system-ui,Arial,sans-serif}header{background:var(--n);color:#fff;border-bottom:3px solid var(--g);padding:42px 20px}.wrap{max-width:1080px;margin:auto}h1,h2{font-family:Georgia,serif}h1{color:#ecd98f;margin:8px 0;font-size:clamp(34px,6vw,58px)}.ey{color:#ecd98f;font-weight:900;letter-spacing:.12em;text-transform:uppercase;font-size:12px}.status{display:inline-block;border:1px solid var(--g);padding:7px 10px;margin-top:12px;color:#ecd98f;font-weight:800}.nav{margin-top:16px}.nav a,.btn{color:#ecd98f;margin-right:14px}.grid{display:grid;gap:16px;padding:32px 0}.card{background:#fff;border:1px solid var(--l);border-top:4px solid var(--g);padding:20px}.card h2{margin:7px 0 8px;color:var(--n);font-size:24px}.tag{font-size:12px;font-weight:900;color:#8b6b20;text-transform:uppercase}.meta{color:var(--m);font-size:13px}.gate{border:2px solid var(--g);background:#fff;padding:22px;margin:0 0 40px}.gate li{margin:6px 0}footer{background:var(--n);color:#b9c2ce;padding:25px 20px;text-align:center;font-size:12px}</style></head><body><header><div class="wrap"><div class="ey">World Protocol Academy · Institute</div><h1>WPA Institute Daily Brief</h1><p>Автоматски дневен производ од свежи јавни извори: селекција, traceability, пет WPA домени и Human Gate.</p><span class="status">%s</span><div class="nav"><a href="/institute.html">← WPA Institute</a><a href="/journal/live/">Journal Live</a><a href="/protocolometry-center.html">Protocolometry</a></div></div></header><main class="wrap"><section class="grid">%s</section><section class="gate"><h2>Human Gate</h2><p><strong>State:</strong> PENDING. Овој дневен пакет е готов за човечка проверка, но не е peer-reviewed публикација или официјална институционална позиција.</p><ul><li>Original source remains authoritative.</li><li>Journal / Working Paper / Protocol Note publication requires separate editorial approval.</li><li>External posting, doctrine changes and third-party visual reuse require explicit Human Gate approval.</li></ul><p><a class="btn" href="/data/institute-daily/latest.json">Provenance JSON →</a> <a class="btn" href="/data/institute-daily/latest.md">Markdown →</a></p></section></main><footer>World Protocol Academy · %s · Automated preparation · Human Authority retained</footer></body></html>'%(esc(p['product_date']),esc(p['status']),cards,esc(p['product_date']))
def write(p,root):
 data=Path(root)/'data/institute-daily'; web=Path(root)/'institute/daily'; data.mkdir(parents=True,exist_ok=True);web.mkdir(parents=True,exist_ok=True); date=p['product_date']; js=json.dumps(p,ensure_ascii=False,indent=2)+'\n'; text=md(p); html=page(p)
 for n in ('latest.json',date+'.json'):(data/n).write_text(js,encoding='utf-8')
 for n in ('latest.md',date+'.md'):(data/n).write_text(text,encoding='utf-8')
 (web/'index.html').write_text(html,encoding='utf-8');(web/(date+'.html')).write_text(html,encoding='utf-8'); ip=data/'index.json'; idx={'schema_version':'1.0','product':'WPA Institute Daily Brief','latest':date,'entries':[]}
 if ip.exists():
  try:idx=json.loads(ip.read_text(encoding='utf-8'))
  except Exception:pass
 e={'date':date,'status':p['status'],'generated_at':p['generated_at'],'items':len(p['items']),'domains':p['automation']['domains_represented'],'html':'/institute/daily/'+date+'.html','json':'/data/institute-daily/'+date+'.json','markdown':'/data/institute-daily/'+date+'.md'};idx.update({'schema_version':'1.0','product':'WPA Institute Daily Brief','latest':date});idx['entries']=[e]+[x for x in idx.get('entries',[]) if x.get('date')!=date][:119];ip.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def selftest(a):
 now=datetime(2026,10,29,12,tzinfo=timezone.utc); items=[]
 for i,d in enumerate(DOMAINS,1):items.append({'id':str(i),'title':d+' item','summary':'Verified public-source candidate for '+d,'source':'Fixture Source','original_url':'https://example.org/'+d+'?utm_source=test','published_at':'2026-10-29T09:00:00Z','primary_category':'public relations' if d=='public_relations' else d,'relevance_score':90-i,'source_confidence':92,'source_health_status':'live','verification_status':'single_official_source' if i==1 else 'candidate'})
 packet={'generated_at':'2026-10-29T11:55:00Z','items':items}; p=product(packet,build(packet,a,now),a,now); root=tempfile.mkdtemp(prefix='wpa-daily-');write(p,root)
 assert len(p['items'])==5 and p['automation']['domains_represented']==5 and not any('utm_' in x['original_url'] for x in p['items']) and 'Human Gate' in (Path(root)/'institute/daily/index.html').read_text(encoding='utf-8'); print('SELF-TEST PASS')
def main():
 a=cli();
 if a.self_test:return selftest(a)
 now=datetime.now(timezone.utc);packet=fetch(a);p=product(packet,build(packet,a,now),a,now);write(p,Path(a.repo_root).resolve());print('WPA Institute Daily Brief %s: %d items, %d domains, READY FOR HUMAN GATE'%(p['product_date'],len(p['items']),p['automation']['domains_represented']))
if __name__=='__main__':
 try:main()
 except Exception as e:print('WPA Institute Daily Product FAILED:',e);raise

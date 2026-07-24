#!/usr/bin/env python3
"""Stage a clean AI Search corpus without deleting original R2 objects."""
import argparse,csv,hashlib,json,mimetypes,os,shutil,subprocess,tempfile,time
from collections import Counter
from pathlib import Path,PurePosixPath
import requests

API='https://api.cloudflare.com/client/v4'
ROOT='__ai_search_ready_v2__'
LIMIT=3_700_000
SUPPORTED={'.txt','.rst','.log','.ini','.conf','.env','.properties','.toml','.md','.mdx','.tex','.sh','.ps1','.json','.sql','.yaml','.yml','.css','.js','.php','.py','.rb','.java','.c','.cpp','.h','.hpp','.go','.rs','.swift','.dart','.pdf','.jpeg','.jpg','.png','.webp','.svg','.gif','.bmp','.html','.htm','.xml','.xlsx','.xlsm','.xlsb','.xls','.docx','.ods','.odt','.csv','.numbers'}
OMIT={'.mp3','.wav','.m4a','.aac','.flac','.ogg','.mp4','.mov','.avi','.mkv','.webm','.zip','.rar','.7z','.gz','.tar','.exe','.dll','.bin','.iso'}

def sh(cmd,cap=False):
 print('+',' '.join(map(str,cmd)),flush=True); return subprocess.run(list(map(str,cmd)),check=True,text=True,capture_output=cap)
def qpdf(args,cap=False):
 cmd=['qpdf',*map(str,args)]; print('+',' '.join(cmd),flush=True); r=subprocess.run(cmd,text=True,capture_output=cap)
 if r.returncode not in (0,3): raise subprocess.CalledProcessError(r.returncode,cmd,output=r.stdout,stderr=r.stderr)
 return r
def canon(v): return (json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()
def hbytes(v): return hashlib.sha256(v).hexdigest()
def hfile(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1048576),b''): h.update(b)
 return h.hexdigest()
def first(o,*ks):
 for k in ks:
  v=o.get(k)
  if v not in (None,'',[]): return v
 return ''
def key(o): return str(first(o,'key','name','filename','path','source_key','id'))
def status(o): return str(first(o,'status','indexing_status','state')).lower()
def reason(o):
 v=first(o,'error','error_message','message','reason','status_message','last_error')
 return str(v.get('message') or v.get('code') or v if isinstance(v,dict) else v)
def classify(o):
 k=key(o); ext=PurePosixPath(k.rstrip('/')).suffix.lower(); t=f'{status(o)} {reason(o)} {k}'.lower()
 if k.startswith(ROOT+'/'): return 'IGNORE'
 if k.endswith('/') or 'file content empty' in t or 'file_content_empty' in t: return 'OMIT_EMPTY'
 if ('over size' in t or 'over_size' in t or 'oversize' in t or 'too large' in t) and ext=='.pdf': return 'SPLIT_PDF'
 if ext=='.jsonl': return 'JSONL_TO_JSON'
 if ext in {'.ppt','.pptx'}: return 'PPT_TO_PDF'
 if ext in OMIT: return 'OMIT_UNSUPPORTED'
 if ext in SUPPORTED: return 'COPY'
 return 'OMIT_UNSUPPORTED'

class CF:
 def __init__(self):
  self.a=os.environ['CLOUDFLARE_ACCOUNT_ID']; self.ai=os.environ['CLOUDFLARE_AI_SEARCH_TOKEN']; self.i=os.getenv('AI_SEARCH_INSTANCE','protocol-ai'); self.b=os.getenv('R2_BUCKET','protocol-kb'); self.w=os.getenv('WRANGLER_BIN','wrangler')
 def api(self,path=''):
  r=requests.get(f'{API}/accounts/{self.a}/ai-search/instances/{self.i}{path}',headers={'Authorization':f'Bearer {self.ai}'},timeout=120); j=r.json()
  if not r.ok or j.get('success') is False: raise RuntimeError(j)
  return j['result']
 def items(self):
  out=[]; p=1
  while True:
   batch=self.api(f'/items?page={p}&per_page=50'); out+=batch
   if len(batch)<50: return out
   p+=1
   if p>200: raise RuntimeError('pagination safety limit')
 def get(self,k,p): p.parent.mkdir(parents=True,exist_ok=True); sh([self.w,'r2','object','get',f'{self.b}/{k}','--remote','--file',p])
 def put(self,k,p,ct): sh([self.w,'r2','object','put',f'{self.b}/{k}','--remote','--force','--file',p,'--content-type',ct])

def ctype(p): return {'.pdf':'application/pdf','.csv':'text/csv; charset=utf-8','.json':'application/json'}.get(p.suffix.lower()) or mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
def empty(p,k):
 raw=p.read_bytes()
 if not raw or not raw.strip(b'\x00\xef\xbb\xbf\xff\xfe \t\r\n'): return True,'byte-empty'
 if k.lower().endswith('.csv'):
  text=None
  for e in ('utf-8-sig','utf-16','cp1252','latin-1'):
   try: text=raw.decode(e); break
   except UnicodeDecodeError: pass
  if text is not None:
   rows=[r for r in csv.reader(text.splitlines()) if any(c.strip() for c in r)]
   if len(rows)<=1: return True,'csv-header-only' if rows else 'csv-empty'
 return False,'non-empty'
def upload(cf,src,target,verify,manifest,source,kind):
 if not 0<src.stat().st_size<=LIMIT: raise RuntimeError(f'bad derivative size {src}')
 before=hfile(src); got=verify/hbytes(target.encode()); after=''
 for attempt in range(1,4):
  got.unlink(missing_ok=True); cf.put(target,src,ctype(src)); cf.get(target,got); after=hfile(got)
  if before==after: break
  print(f'WARNING: hash mismatch attempt {attempt}/3 for {target}: expected={before} actual={after}',flush=True)
  if attempt<3: time.sleep(attempt*2)
 else:
  raise RuntimeError(f'hash mismatch after 3 attempts {target}: expected={before} actual={after}')
 manifest.append({'source_key':source,'target_key':target,'kind':kind,'bytes':src.stat().st_size,'sha256':before})
def splitpdf(cf,src,source,prefix,w,verify,manifest):
 qpdf(['--check',src]); pages=int(qpdf(['--show-npages',src],True).stdout); start=1; n=1; stem=str(PurePosixPath(source).with_suffix('')); sourcehash=hfile(src)[:20]
 while start<=pages:
  span=min(20,pages-start+1)
  while True:
   end=min(start+span-1,pages); out=w/f'p{n:04d}-{start:05d}-{end:05d}.pdf'; qpdf(['--deterministic-id','--empty','--pages',src,f'{start}-{end}','--',out])
   if out.stat().st_size<=LIMIT: break
   if span>1: out.unlink(); span=max(1,span//2); continue
   comp=w/f'p{n:04d}-{start:05d}-{end:05d}-compressed.pdf'; sh(['gs','-q','-dNOPAUSE','-dBATCH','-dSAFER','-sDEVICE=pdfwrite','-dPDFSETTINGS=/screen',f'-sOutputFile={comp}',out]); out.unlink()
   det=w/f'p{n:04d}-{start:05d}-{end:05d}-deterministic.pdf'; qpdf(['--deterministic-id',comp,det]); comp.unlink(); det.replace(comp); out=comp
   if out.stat().st_size>LIMIT: raise RuntimeError(f'single page over limit {source}')
   break
  qpdf(['--check',out]); upload(cf,out,f'{prefix}{stem}.__parts__/{sourcehash}/{out.name}',verify,manifest,source,'SPLIT_PDF'); start=end+1; n+=1
def jsonl_to_json(cf,src,source,prefix,w,verify,manifest):
 rows=[]
 for n,line in enumerate(src.read_text(encoding='utf-8-sig').splitlines(),1):
  if not line.strip(): continue
  try: rows.append(json.loads(line))
  except json.JSONDecodeError as exc: raise RuntimeError(f'invalid JSONL record {source}:{n}: {exc}') from exc
 if not rows: raise RuntimeError(f'empty JSONL {source}')
 chunks=[]; cur=[]
 for row in rows:
  trial=cur+[row]
  if len(canon(trial))>LIMIT and cur: chunks.append(cur); cur=[row]
  else: cur=trial
  if len(canon(cur))>LIMIT: raise RuntimeError(f'JSONL record exceeds limit {source}')
 if cur: chunks.append(cur)
 stem=str(PurePosixPath(source).with_suffix(''))
 for i,chunk in enumerate(chunks,1):
  out=w/f'part-{i:04d}.json'; out.write_text(json.dumps(chunk,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  upload(cf,out,f'{prefix}{stem}.__json_parts__/{out.name}',verify,manifest,source,'JSONL_TO_JSON')
def ensure_libreoffice():
 if shutil.which('libreoffice'): return
 sh(['sudo','apt-get','update','-qq'])
 sh(['sudo','apt-get','install','-y','-qq','libreoffice'])
 if not shutil.which('libreoffice'): raise RuntimeError('libreoffice installation failed')
def ppt_to_pdf(cf,src,source,prefix,w,verify,manifest):
 ensure_libreoffice(); outdir=w/'office'; outdir.mkdir(exist_ok=True)
 sh(['libreoffice','--headless','--convert-to','pdf','--outdir',outdir,src])
 pdfs=list(outdir.glob('*.pdf'))
 if len(pdfs)!=1: raise RuntimeError(f'PPT conversion failed {source}')
 pdf=pdfs[0]; target_source=str(PurePosixPath(source).with_suffix('.pdf'))
 if pdf.stat().st_size<=LIMIT: upload(cf,pdf,prefix+target_source,verify,manifest,source,'PPT_TO_PDF')
 else: splitpdf(cf,pdf,target_source,prefix,w,verify,manifest)

def build(cf):
 rows=[]
 for o in cf.items():
  a=classify(o)
  if a!='IGNORE': rows.append({'status':status(o),'action':a,'key':key(o),'reason':reason(o)})
 rows.sort(key=lambda r:(r['action'],r['key']))
 approval={'schema':'2.1','instance':cf.i,'actions':[{'key':r['key'],'action':r['action']} for r in rows]}; sha=hbytes(canon(approval)); prefix=f'{ROOT}/{sha[:20]}/'
 return {'schema':'2.1','instance':cf.i,'approval_sha256':sha,'target_prefix':prefix,'items':rows},approval

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--mode',choices=['PLAN','STAGE']); ap.add_argument('--approved-sha',default=''); ap.add_argument('--out',type=Path); ap.add_argument('--self-test',action='store_true'); x=ap.parse_args()
 if x.self_test:
  tests=[({'status':'error','error':'file content empty','key':'a.csv'},'OMIT_EMPTY'),({'status':'errored','error':'Over size','key':'a.pdf'},'SPLIT_PDF'),({'status':'skipped','error':'Skipped by Include Rules','key':'a.pdf'},'COPY'),({'status':'skipped','key':'a.jsonl'},'JSONL_TO_JSON'),({'status':'error','key':'a.ppt','error':'unsupported_type'},'PPT_TO_PDF')]
  for item,want in tests:
   got=classify(item)
   if got!=want: raise AssertionError((item,got,want))
  print('self-test: OK'); return
 if not x.mode or x.out is None: ap.error('--mode and --out required')
 x.out.mkdir(parents=True,exist_ok=True); cf=CF(); plan,approval=build(cf); sha=plan['approval_sha256']
 (x.out/'migration-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n'); (x.out/'approval-plan.json').write_bytes(canon(approval)); (x.out/'migration-plan.sha256').write_text(sha+'\n')
 counts={'total':len(plan['items']),'target_prefix':plan['target_prefix'],'approval_sha256':sha,'actions':dict(Counter(r['action'] for r in plan['items'])),'statuses':dict(Counter(r['status'] for r in plan['items']))}; (x.out/'counts.json').write_text(json.dumps(counts,indent=2)+'\n'); print(json.dumps(counts,indent=2))
 if x.mode=='PLAN': return
 if x.approved_sha!=sha: raise RuntimeError('approved plan SHA mismatch')
 manifest=[]; omitted=[]
 with tempfile.TemporaryDirectory() as td:
  root=Path(td); verify=root/'verify'; verify.mkdir()
  for i,r in enumerate(plan['items'],1):
   a=r['action']; k=r['key']; print(f'[{i}/{len(plan["items"])}] {a} {k}',flush=True)
   if a.startswith('OMIT_'): omitted.append({'source_key':k,'reason':a}); continue
   w=root/hbytes(k.encode())[:20]; w.mkdir(); src=w/(PurePosixPath(k).name or 'source.bin'); cf.get(k,src); is_empty,why=empty(src,k)
   if is_empty: omitted.append({'source_key':k,'reason':why}); continue
   if a=='SPLIT_PDF' or (src.suffix.lower()=='.pdf' and src.stat().st_size>LIMIT): splitpdf(cf,src,k,plan['target_prefix'],w,verify,manifest)
   elif a=='JSONL_TO_JSON': jsonl_to_json(cf,src,k,plan['target_prefix'],w,verify,manifest)
   elif a=='PPT_TO_PDF': ppt_to_pdf(cf,src,k,plan['target_prefix'],w,verify,manifest)
   elif src.suffix.lower() in SUPPORTED and src.stat().st_size<=LIMIT: upload(cf,src,plan['target_prefix']+k,verify,manifest,k,'COPY')
   else: omitted.append({'source_key':k,'reason':'unsupported-or-over-limit'})
 with (x.out/'staged-manifest.csv').open('w',newline='',encoding='utf-8') as f:
  q=csv.DictWriter(f,fieldnames=['source_key','target_key','kind','bytes','sha256']); q.writeheader(); q.writerows(manifest)
 with (x.out/'omitted-items.csv').open('w',newline='',encoding='utf-8') as f:
  q=csv.DictWriter(f,fieldnames=['source_key','reason']); q.writeheader(); q.writerows(omitted)
 summary={'source_items':len(plan['items']),'staged_objects':len(manifest),'omitted_items':len(omitted),'target_prefix':plan['target_prefix'],'kinds':dict(Counter(r['kind'] for r in manifest))}; (x.out/'stage-summary.json').write_text(json.dumps(summary,indent=2)+'\n'); print(json.dumps(summary,indent=2))
if __name__=='__main__': main()

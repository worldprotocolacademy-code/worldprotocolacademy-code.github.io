#!/usr/bin/env python3
"""Stage a clean, versioned R2 corpus for Cloudflare AI Search.

Source objects are never deleted, moved, or overwritten. Supported files are copied,
empty files are omitted, oversize PDFs/text are split below 4 MB, and convertible
Office/JSONL inputs are transformed under a versioned prefix.
"""
import argparse,csv,hashlib,json,mimetypes,os,subprocess,tempfile
from collections import Counter
from pathlib import Path,PurePosixPath
import requests

API='https://api.cloudflare.com/client/v4'
READY='__ai_search_ready_v2__'
LIMIT=3700000
SUPPORTED={'.txt','.rst','.log','.ini','.conf','.env','.properties','.gitignore','.editorconfig','.toml','.markdown','.md','.mdx','.mdoc','.tex','.latex','.sh','.bat','.ps1','.sgml','.json','.sql','.yaml','.yml','.css','.js','.php','.py','.rb','.java','.c','.cpp','.cxx','.h','.hpp','.go','.rs','.swift','.dart','.el','.pdf','.jpeg','.jpg','.png','.webp','.svg','.gif','.bmp','.html','.htm','.xml','.xlsx','.xlsm','.xlsb','.xls','.et','.docx','.ods','.odt','.csv','.numbers'}
TEXT={'.txt','.rst','.log','.ini','.conf','.env','.properties','.gitignore','.editorconfig','.toml','.markdown','.md','.mdx','.mdoc','.tex','.latex','.sh','.bat','.ps1','.sgml','.json','.sql','.yaml','.yml','.css','.js','.php','.py','.rb','.java','.c','.cpp','.cxx','.h','.hpp','.go','.rs','.swift','.dart','.el','.html','.htm','.xml','.csv'}
OFFICE={'.ppt','.pptx','.doc','.docx','.odt','.xls','.xlsx','.xlsm','.xlsb','.ods','.et','.numbers'}
OMIT={'.mp3','.wav','.m4a','.aac','.flac','.ogg','.mp4','.mov','.avi','.mkv','.webm','.zip','.rar','.7z','.gz','.tar','.exe','.dll','.bin','.iso'}

def sh(cmd,cap=False):
 print('+',' '.join(map(str,cmd)),flush=True); return subprocess.run([str(x) for x in cmd],check=True,text=True,capture_output=cap)
def canon(v): return (json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()
def hbytes(b): return hashlib.sha256(b).hexdigest()
def hfile(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for x in iter(lambda:f.read(1048576),b''): h.update(x)
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
 k=key(o); s=status(o); t=f'{s} {reason(o)} {k}'.lower(); ext=PurePosixPath(k.rstrip('/')).suffix.lower()
 if k.startswith(READY+'/'): return 'IGNORE'
 if k.endswith('/') or 'file_content_empty' in t or 'file content empty' in t: return 'OMIT_EMPTY'
 if ext in {'.jsonl','.ndjson'}: return 'JSONL'
 if ext in {'.ppt','.pptx'}: return 'OFFICE'
 if 'over_size' in t or 'over size' in t or 'oversize' in t or 'too large' in t:
  if ext=='.pdf': return 'SPLIT_PDF'
  if ext in TEXT: return 'SPLIT_TEXT'
  if ext in OFFICE: return 'OFFICE'
  return 'AUTO'
 if 'unsupported' in t or 'not supported' in t or 'file type' in t:
  if ext in OFFICE: return 'OFFICE'
  return 'AUTO'
 if ext in OMIT: return 'OMIT_UNSUPPORTED'
 if ext in SUPPORTED: return 'COPY'
 return 'AUTO'

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

def plan(cf):
 inst=cf.api(''); rows=[]
 for o in cf.items():
  a=classify(o)
  if a!='IGNORE': rows.append({'id':str(o.get('id','')),'status':status(o),'action':a,'key':key(o),'reason':reason(o)})
 rows.sort(key=lambda r:(r['action'],r['key'],r['id']))
 stable={'schema':'2.0','instance':cf.i,'actions':[{'key':r['key'],'action':r['action']} for r in rows]}
 approval=hbytes(canon(stable)); script=hfile(Path(__file__).resolve()); prefix=f'{READY}/{approval[:20]}-{script[:12]}/'; sp=inst.get('source_params') or {}
 return {'schema':'2.0','instance':cf.i,'target_prefix':prefix,'approval_sha256':approval,'script_sha256':script,'original_source_params':{'prefix':sp.get('prefix') or '','include_items':sp.get('include_items') or [],'exclude_items':sp.get('exclude_items') or [],'r2_jurisdiction':sp.get('r2_jurisdiction') or 'default'},'items':rows}

def ctype(p): return {'.pdf':'application/pdf','.json':'application/json','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8','.csv':'text/csv; charset=utf-8'}.get(p.suffix.lower()) or mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
def decode(raw):
 for enc in ('utf-8-sig','utf-16','cp1252','latin-1'):
  try:return raw.decode(enc)
  except UnicodeDecodeError:pass
 return None
def empty(p,k):
 raw=p.read_bytes()
 if not raw or not raw.strip(b'\x00\xef\xbb\xbf\xff\xfe \t\r\n'): return True,'byte-empty'
 text=decode(raw); ext=PurePosixPath(k).suffix.lower()
 if text is None:return False,'binary'
 if ext=='.csv':
  rows=[r for r in csv.reader(text.splitlines()) if any(c.strip() for c in r)]
  if len(rows)<=1:return True,'csv-header-only' if rows else 'csv-empty'
 if ext in TEXT and not text.strip():return True,'text-empty'
 if ext=='.json':
  try:v=json.loads(text)
  except json.JSONDecodeError:return False,'invalid-json'
  if v in ({},[],'',None):return True,'json-empty-container'
 return False,'non-empty'
def upload(cf,src,target,verify,manifest,source,kind):
 if not 0<src.stat().st_size<=LIMIT: raise RuntimeError(f'bad derivative size {src}')
 digest=hfile(src); cf.put(target,src,ctype(src)); got=verify/hbytes(target.encode()); cf.get(target,got)
 if hfile(got)!=digest:raise RuntimeError(f'hash mismatch {target}')
 manifest.append({'source_key':source,'target_key':target,'kind':kind,'bytes':src.stat().st_size,'sha256':digest})
def compress(src,out):
 sh(['gs','-q','-dNOPAUSE','-dBATCH','-dSAFER','-sDEVICE=pdfwrite','-dCompatibilityLevel=1.5','-dPDFSETTINGS=/screen',f'-sOutputFile={out}',src]); sh(['qpdf','--check',out])
 if out.stat().st_size>LIMIT:raise RuntimeError(f'single PDF page remains over limit: {src}')
def splitpdf(cf,src,source,prefix,w,verify,m):
 sh(['qpdf','--check',src]); pages=int(sh(['qpdf','--show-npages',src],True).stdout); start=1; n=1; stem=str(PurePosixPath(source).with_suffix('')); sourcehash=hfile(src)[:20]
 while start<=pages:
  span=min(20,pages-start+1)
  while True:
   end=min(start+span-1,pages); out=w/f'p{n:04d}-{start:05d}-{end:05d}.pdf'; sh(['qpdf','--empty','--pages',src,f'{start}-{end}','--',out])
   if out.stat().st_size<=LIMIT:break
   if span>1:out.unlink(); span=max(1,span//2); continue
   compressed=w/f'p{n:04d}-{start:05d}-{end:05d}-compressed.pdf'; compress(out,compressed); out.unlink(); out=compressed; break
  upload(cf,out,f'{prefix}{stem}.__parts__/{sourcehash}/{out.name}',verify,m,source,'SPLIT_PDF'); start=end+1; n+=1
def splittext(cf,src,source,prefix,w,verify,m):
 text=decode(src.read_bytes())
 if text is None:raise RuntimeError(f'cannot decode {source}')
 chunks=[]; cur=''; limit=LIMIT-32000
 for line in text.splitlines(keepends=True):
  trial=cur+line
  if len(trial.encode())>limit and cur:chunks.append(cur); cur=line
  else:cur=trial
 if cur:chunks.append(cur)
 stem=str(PurePosixPath(source).with_suffix(''))
 for i,ch in enumerate(chunks,1):
  out=w/f'part-{i:04d}.txt'; out.write_text(ch,encoding='utf-8'); upload(cf,out,f'{prefix}{stem}.__text_parts__/{out.name}',verify,m,source,'SPLIT_TEXT')
def jsonl(cf,src,source,prefix,w,verify,m):
 text=decode(src.read_bytes()); rows=[json.loads(x) for x in text.splitlines() if x.strip()] if text else []
 if not rows:raise RuntimeError(f'empty JSONL {source}')
 chunks=[]; cur=[]
 for row in rows:
  trial=cur+[row]
  if len(canon(trial))>LIMIT and cur:chunks.append(cur); cur=[row]
  else:cur=trial
  if len(canon(cur))>LIMIT:raise RuntimeError(f'JSONL record exceeds limit {source}')
 if cur:chunks.append(cur)
 stem=str(PurePosixPath(source).with_suffix(''))
 for i,ch in enumerate(chunks,1):
  out=w/f'part-{i:04d}.json'; out.write_text(json.dumps(ch,ensure_ascii=False,indent=2)+'\n'); upload(cf,out,f'{prefix}{stem}.__json_parts__/{out.name}',verify,m,source,'JSONL_TO_JSON')
def office(cf,src,source,prefix,w,verify,m):
 outdir=w/'office'; outdir.mkdir(); sh(['libreoffice','--headless','--convert-to','pdf','--outdir',outdir,src]); pdfs=list(outdir.glob('*.pdf'))
 if len(pdfs)!=1:raise RuntimeError(f'office conversion failed {source}')
 converted=str(PurePosixPath(source).with_suffix('.pdf'))
 if pdfs[0].stat().st_size<=LIMIT:upload(cf,pdfs[0],prefix+converted,verify,m,source,'OFFICE_TO_PDF')
 else:splitpdf(cf,pdfs[0],converted,prefix,w,verify,m)

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--mode',choices=['PLAN','STAGE'],required=True); ap.add_argument('--approved-sha',default=''); ap.add_argument('--out',type=Path,required=True); args=ap.parse_args(); args.out.mkdir(parents=True,exist_ok=True)
 cf=CF(); p=plan(cf); sha=p['approval_sha256']; (args.out/'migration-plan.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n'); (args.out/'migration-plan.sha256').write_text(sha+'\n')
 counts={'total':len(p['items']),'target_prefix':p['target_prefix'],'approval_sha256':sha,'script_sha256':p['script_sha256'],'actions':dict(Counter(x['action'] for x in p['items'])),'statuses':dict(Counter(x['status'] for x in p['items']))}; (args.out/'counts.json').write_text(json.dumps(counts,indent=2)+'\n'); print(json.dumps(counts,indent=2))
 if args.mode=='PLAN':return
 if sha!=args.approved_sha:raise RuntimeError('plan approval mismatch')
 manifest=[]; omitted=[]
 with tempfile.TemporaryDirectory() as td:
  root=Path(td); verify=root/'verify'; verify.mkdir()
  for i,row in enumerate(p['items'],1):
   a=row['action']; source=row['key']; print(f'[{i}/{len(p["items"])}] {a} {source}',flush=True)
   if a.startswith('OMIT_'):omitted.append({'source_key':source,'reason':a.lower(),'planned_action':a}); continue
   w=root/hbytes(source.encode())[:20]; w.mkdir(); src=w/(PurePosixPath(source).name or 'source.bin'); cf.get(source,src); is_empty,why=empty(src,source)
   if is_empty:omitted.append({'source_key':source,'reason':why,'planned_action':a}); continue
   ext=src.suffix.lower()
   if a=='SPLIT_PDF' or (ext=='.pdf' and src.stat().st_size>LIMIT):splitpdf(cf,src,source,p['target_prefix'],w,verify,manifest)
   elif a=='SPLIT_TEXT' or (ext in TEXT and src.stat().st_size>LIMIT):splittext(cf,src,source,p['target_prefix'],w,verify,manifest)
   elif a=='JSONL':jsonl(cf,src,source,p['target_prefix'],w,verify,manifest)
   elif a=='OFFICE':office(cf,src,source,p['target_prefix'],w,verify,manifest)
   elif ext in SUPPORTED and src.stat().st_size<=LIMIT:upload(cf,src,p['target_prefix']+source,verify,manifest,source,'COPY')
   else:
    text=decode(src.read_bytes())
    if text and text.strip():
     out=w/'converted.txt'; out.write_text(text,encoding='utf-8'); converted=str(PurePosixPath(source).with_suffix(''))+'.__converted__.txt'
     if out.stat().st_size<=LIMIT:upload(cf,out,p['target_prefix']+converted,verify,manifest,source,'AUTO_TEXT')
     else:splittext(cf,out,converted,p['target_prefix'],w,verify,manifest)
    else:omitted.append({'source_key':source,'reason':'unsupported-binary-preserved-in-source','planned_action':a})
 with (args.out/'staged-manifest.csv').open('w',newline='',encoding='utf-8') as f:
  wr=csv.DictWriter(f,fieldnames=['source_key','target_key','kind','bytes','sha256']); wr.writeheader(); wr.writerows(manifest)
 with (args.out/'omitted-items.csv').open('w',newline='',encoding='utf-8') as f:
  wr=csv.DictWriter(f,fieldnames=['source_key','reason','planned_action']); wr.writeheader(); wr.writerows(omitted)
 summary={'source_items':len(p['items']),'staged_objects':len(manifest),'omitted_items':len(omitted),'target_prefix':p['target_prefix'],'bytes':sum(x['bytes'] for x in manifest),'kinds':dict(Counter(x['kind'] for x in manifest)),'omissions':dict(Counter(x['reason'] for x in omitted))}; (args.out/'stage-summary.json').write_text(json.dumps(summary,indent=2)+'\n'); print(json.dumps(summary,indent=2))
if __name__=='__main__':main()

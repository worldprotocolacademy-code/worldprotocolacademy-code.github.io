#!/usr/bin/env python3
import argparse,csv,hashlib,json,mimetypes,os,subprocess,tempfile
from collections import Counter
from pathlib import Path,PurePosixPath
import requests

API='https://api.cloudflare.com/client/v4'
READY='__ai_search_ready_v1__'
LIMIT=3700000
SUPPORTED={'.txt','.rst','.log','.ini','.conf','.env','.properties','.gitignore','.editorconfig','.toml','.markdown','.md','.mdx','.mdoc','.tex','.latex','.sh','.bat','.ps1','.sgml','.json','.sql','.yaml','.yml','.css','.js','.php','.py','.rb','.java','.c','.cpp','.cxx','.h','.hpp','.go','.rs','.swift','.dart','.el','.pdf','.jpeg','.jpg','.png','.webp','.svg','.gif','.bmp','.html','.htm','.xml','.xlsx','.xlsm','.xlsb','.xls','.et','.docx','.ods','.odt','.csv','.numbers'}

def sh(cmd,cap=False):
 print('+',' '.join(map(str,cmd)),flush=True)
 return subprocess.run(cmd,check=True,text=True,capture_output=cap)

def hbytes(b): return hashlib.sha256(b).hexdigest()

def hfile(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for x in iter(lambda:f.read(1048576),b''): h.update(x)
 return h.hexdigest()

def canon(v): return (json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()

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
 if s in {'completed','indexed','ready'}: return 'COPY'
 if 'file_content_empty' in t or 'file content empty' in t: return 'OMIT'
 if 'over_size' in t or 'over size' in t or 'oversize' in t or 'too large' in t: return 'SPLIT'
 if 'unsupported_type' in t or 'unsupported type' in t or 'not supported' in t: return 'PPT' if ext in {'.ppt','.pptx'} else 'BLOCK'
 if s in {'skipped','skip'}:
  if k.endswith('/'): return 'OMIT'
  if ext=='.jsonl': return 'JSONL'
  if ext in {'.mp3','.wav','.m4a','.mp4'}: return 'OMIT'
  if ext in SUPPORTED: return 'COPY'
  return 'BLOCK'
 return 'BLOCK'

class CF:
 def __init__(self):
  self.a=os.environ['CLOUDFLARE_ACCOUNT_ID']; self.ai=os.environ['CLOUDFLARE_AI_SEARCH_TOKEN']; self.r2=os.environ['CLOUDFLARE_API_TOKEN']; self.i=os.getenv('AI_SEARCH_INSTANCE','protocol-ai'); self.b=os.getenv('R2_BUCKET','protocol-kb'); self.w=os.getenv('WRANGLER_BIN','wrangler')
 def api(self,path):
  r=requests.get(f'{API}/accounts/{self.a}/ai-search/instances/{self.i}{path}',headers={'Authorization':f'Bearer {self.ai}'},timeout=120); j=r.json()
  if not r.ok or j.get('success') is False: raise RuntimeError(j)
  return j['result']
 def items(self):
  out=[]; p=1
  while True:
   batch=self.api(f'/items?page={p}&per_page=50'); out+=batch
   if len(batch)<50: return out
   p+=1
 def get(self,k,p):
  p.parent.mkdir(parents=True,exist_ok=True)
  sh([self.w,'r2','object','get',f'{self.b}/{k}','--remote','--file',p])
 def put(self,k,p,ct):
  sh([self.w,'r2','object','put',f'{self.b}/{k}','--remote','--force','--file',p,'--content-type',ct])

def plan(cf):
 inst=cf.api(''); rows=[]
 for o in cf.items():
  if key(o).startswith(READY+'/'): continue
  a=classify(o); rows.append({'id':str(o.get('id','')),'status':status(o),'action':a,'key':key(o),'reason':reason(o)})
 rows.sort(key=lambda r:(r['action'],r['key'],r['id']))
 corpus_fp=hbytes(canon(rows)); script_sha=hfile(Path(__file__).resolve()); prefix=f'{READY}/{corpus_fp[:20]}-{script_sha[:12]}/'; sp=inst.get('source_params') or {}
 return {'schema':'1.1','instance':cf.i,'target_prefix':prefix,'corpus_fingerprint':corpus_fp,'script_sha256':script_sha,'blocked':sum(r['action']=='BLOCK' for r in rows),'path_filters':{'include_items':sp.get('include_items') or [],'exclude_items':sp.get('exclude_items') or [],'prefix':sp.get('prefix'),'r2_jurisdiction':sp.get('r2_jurisdiction') or 'default'},'items':rows}

def ctype(p):
 return {'.pdf':'application/pdf','.json':'application/json','.txt':'text/plain; charset=utf-8','.md':'text/markdown; charset=utf-8'}.get(p.suffix.lower()) or mimetypes.guess_type(p.name)[0] or 'application/octet-stream'

def upload(cf,src,target,verify,manifest,source,kind):
 if not 0<src.stat().st_size<=LIMIT: raise RuntimeError(f'bad derivative size {src}')
 cf.put(target,src,ctype(src)); got=verify/hbytes(target.encode()); cf.get(target,got)
 if hfile(src)!=hfile(got): raise RuntimeError(f'hash mismatch {target}')
 manifest.append({'source_key':source,'target_key':target,'kind':kind,'bytes':src.stat().st_size,'sha256':hfile(src)})

def compress_single_page(src,out):
 sh(['gs','-q','-dNOPAUSE','-dBATCH','-dSAFER','-sDEVICE=pdfwrite','-dCompatibilityLevel=1.5','-dPDFSETTINGS=/screen',f'-sOutputFile={out}',src])
 sh(['qpdf','--check',out])
 if out.stat().st_size>LIMIT: raise RuntimeError(f'single PDF page remains over limit: {src}')

def splitpdf(cf,src,source,prefix,w,verify,m):
 sh(['qpdf','--check',src]); pages=int(sh(['qpdf','--show-npages',src],True).stdout); start=1; n=1; stem=str(PurePosixPath(source).with_suffix('')); sourcehash=hfile(src)[:20]
 while start<=pages:
  span=min(20,pages-start+1)
  while True:
   end=min(start+span-1,pages); out=w/f'p{n:04d}-{start:05d}-{end:05d}.pdf'; sh(['qpdf','--empty','--pages',src,f'{start}-{end}','--',out])
   if out.stat().st_size<=LIMIT: break
   if span>1:
    out.unlink(); span=max(1,span//2); continue
   compressed=w/f'p{n:04d}-{start:05d}-{end:05d}-compressed.pdf'; compress_single_page(out,compressed); out.unlink(); out=compressed; break
  sh(['qpdf','--check',out]); target=f'{prefix}{stem}.__parts__/{sourcehash}/{out.name}'; upload(cf,out,target,verify,m,source,'SPLIT_PDF'); start=end+1; n+=1

def jsonl(cf,src,source,prefix,w,verify,m):
 rows=[]
 for n,line in enumerate(src.read_text(encoding='utf-8-sig').splitlines(),1):
  if line.strip(): rows.append(json.loads(line))
 if not rows: raise RuntimeError(f'empty JSONL {source}')
 chunks=[]; cur=[]
 for row in rows:
  trial=cur+[row]; b=canon(trial)
  if len(b)>LIMIT and cur: chunks.append(cur); cur=[row]
  else: cur=trial
  if len(canon(cur))>LIMIT: raise RuntimeError(f'JSONL record exceeds limit: {source}')
 if cur: chunks.append(cur)
 stem=str(PurePosixPath(source).with_suffix(''))
 for i,ch in enumerate(chunks,1):
  out=w/f'part-{i:04d}.json'; out.write_text(json.dumps(ch,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); upload(cf,out,f'{prefix}{stem}.__json_parts__/{out.name}',verify,m,source,'JSONL_TO_JSON')

def ppt(cf,src,source,prefix,w,verify,m):
 outdir=w/'office'; outdir.mkdir(); sh(['libreoffice','--headless','--convert-to','pdf','--outdir',outdir,src]); pdfs=list(outdir.glob('*.pdf'))
 if len(pdfs)!=1: raise RuntimeError(f'PPT conversion failed {source}')
 if pdfs[0].stat().st_size<=LIMIT: upload(cf,pdfs[0],f'{prefix}{PurePosixPath(source).with_suffix(".pdf")}',verify,m,source,'PPT_TO_PDF')
 else: splitpdf(cf,pdfs[0],str(PurePosixPath(source).with_suffix('.pdf')),prefix,w,verify,m)

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--mode',choices=['PLAN','STAGE'],required=True); ap.add_argument('--approved-sha',default=''); ap.add_argument('--out',type=Path,required=True); args=ap.parse_args(); args.out.mkdir(parents=True,exist_ok=True)
 cf=CF(); p=plan(cf); raw=canon(p); sha=hbytes(raw); (args.out/'migration-plan.json').write_bytes(raw); (args.out/'migration-plan.sha256').write_text(sha+'\n')
 counts={'total':len(p['items']),'blocked':p['blocked'],'target_prefix':p['target_prefix'],'sha256':sha,'script_sha256':p['script_sha256'],'actions':dict(Counter(x['action'] for x in p['items']))}; (args.out/'counts.json').write_text(json.dumps(counts,indent=2)+'\n'); print(json.dumps(counts,indent=2))
 if args.mode=='PLAN': return
 if sha!=args.approved_sha or p['blocked']!=0: raise RuntimeError('plan approval mismatch or blocked items')
 manifest=[]
 with tempfile.TemporaryDirectory() as td:
  root=Path(td); verify=root/'verify'; verify.mkdir()
  for i,row in enumerate(p['items'],1):
   a=row['action']; source=row['key']; print(f'[{i}/{len(p["items"])}] {a} {source}',flush=True)
   if a=='OMIT': continue
   w=root/hbytes(source.encode())[:20]; w.mkdir(); src=w/(PurePosixPath(source).name or 'source.bin'); cf.get(source,src)
   if a=='COPY':
    if src.suffix.lower() not in SUPPORTED or src.stat().st_size>LIMIT: raise RuntimeError(f'copy source invalid {source}')
    upload(cf,src,p['target_prefix']+source,verify,manifest,source,'COPY')
   elif a=='SPLIT': splitpdf(cf,src,source,p['target_prefix'],w,verify,manifest)
   elif a=='JSONL': jsonl(cf,src,source,p['target_prefix'],w,verify,manifest)
   elif a=='PPT': ppt(cf,src,source,p['target_prefix'],w,verify,manifest)
   else: raise RuntimeError(f'unsupported action {a}')
 with (args.out/'staged-manifest.csv').open('w',newline='',encoding='utf-8') as f:
  wr=csv.DictWriter(f,fieldnames=['source_key','target_key','kind','bytes','sha256']); wr.writeheader(); wr.writerows(manifest)
 summary={'source_items':len(p['items']),'staged_objects':len(manifest),'target_prefix':p['target_prefix'],'bytes':sum(x['bytes'] for x in manifest),'kinds':dict(Counter(x['kind'] for x in manifest))}; (args.out/'stage-summary.json').write_text(json.dumps(summary,indent=2)+'\n'); print(json.dumps(summary,indent=2))

if __name__=='__main__': main()

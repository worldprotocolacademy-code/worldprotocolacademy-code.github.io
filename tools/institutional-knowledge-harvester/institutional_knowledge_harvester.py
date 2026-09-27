#!/usr/bin/env python3
import argparse, hashlib, json, re, sys, urllib.request
from pathlib import Path
from html import unescape
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[2]
MASTER=ROOT/"data/global-institutions/v1.0-corrected-4f-rev7/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json"
OUT=Path(__file__).resolve().parent/"wpa_output"
FULLTEXT_OK={"OPEN_ACCESS","PUBLIC_DOMAIN","OPEN_LICENSE","AGREEMENT_ON_FILE","MANUALLY_AUTHORISED"}
ALL_ACCESS=FULLTEXT_OK|{"PUBLIC_ABSTRACT","PUBLIC_WEB_REFERENCE","OPEN_METADATA_ONLY","RESTRICTED_EXTERNAL_ONLY"}
KEYWORDS={
 "institutional_core":["mission","vision","objective","governance","founded","history","mandate","values"],
 "programme_architecture":["curriculum","programme","program","course","learning outcome","assessment","simulation","training","module"],
 "protocol_practice":["protocol","ceremonial","precedence","state visit","seating","flag","etiquette","vip","hospitality"],
 "diplomacy":["diplomacy","diplomatic","negotiation","mediation","consular","foreign service","multilateral"],
 "communication":["public relations","strategic communication","crisis communication","media relations","communication"],
 "security":["security","defence","defense","protective","cyber","resilience","crisis management"],
 "ethics_authority":["ethics","deontology","professional standard","transparency","integrity","accountability"],
 "digital_ai":["artificial intelligence"," ai ","digital","automation","data governance","human oversight"],
 "scholarly_core":["method","methodology","finding","result","conclusion","limitation","hypothesis","research question"]
}

def load_master():
    return json.loads(MASTER.read_text(encoding="utf-8"))

def records(data):
    for key in ("institutions","records","items"):
        if isinstance(data.get(key),list): return data[key]
    return []

def build_queue():
    data=load_master(); rs=records(data)
    q=[]
    for r in rs:
        if r.get("id")=="R001": continue
        q.append({
          "institution_id":r.get("id"),"name":r.get("name"),"country":r.get("country"),
          "group":r.get("group"),"relevance":r.get("relevance"),"verification":r.get("verification"),
          "website":r.get("website"),"status":"DOCUMENT_DISCOVERY_PENDING" if r.get("website") else "NO_RESOLVED_WEBSITE",
          "priority":1 if r.get("relevance")=="A" else 2 if r.get("group")=="A" else 3
        })
    q.sort(key=lambda x:(x["priority"],x["institution_id"] or ""))
    return {"schema":"wpa-institution-document-queue/1.0","generated":"2026-09-27","source":str(MASTER.relative_to(ROOT)),"count":len(q),"items":q}

def fetch(url,max_bytes=25_000_000):
    u=urlparse(url)
    if u.scheme!="https": raise ValueError("Only https URLs are permitted")
    req=urllib.request.Request(url,headers={"User-Agent":"WorldProtocolAcademy-PublicEvidence/1.0 (+https://worldprotocolacademy.mk/)"})
    with urllib.request.urlopen(req,timeout=30) as r:
        ctype=(r.headers.get("Content-Type") or "").lower()
        data=r.read(max_bytes+1)
        if len(data)>max_bytes: raise ValueError("Document exceeds 25 MB safety limit")
        return data,ctype,r.geturl()

def html_text(data):
    s=data.decode("utf-8","replace")
    s=re.sub(r"(?is)<(script|style|noscript).*?>.*?</\1>"," ",s)
    s=re.sub(r"(?s)<[^>]+>"," ",s)
    return re.sub(r"\s+"," ",unescape(s)).strip()

def pdf_text(data):
    try:
        from pypdf import PdfReader
        from io import BytesIO
    except Exception as e:
        raise RuntimeError("PDF processing requires pypdf (pip install pypdf)") from e
    reader=PdfReader(BytesIO(data))
    pages=[]
    for i,p in enumerate(reader.pages,1):
        t=(p.extract_text() or "").strip()
        if t: pages.append(f"[PAGE {i}]\n{t}")
    return "\n\n".join(pages),len(reader.pages)

def split_sentences(text):
    return [x.strip() for x in re.split(r"(?<=[.!?])\s+",text) if 40<=len(x.strip())<=900]

def candidate_core(text,limit=36):
    sents=split_sentences(text)
    scored=[]
    for idx,s in enumerate(sents):
        low=" "+s.lower()+" "
        tags=[];score=0
        for lane,words in KEYWORDS.items():
            hits=sum(1 for w in words if w in low)
            if hits: tags.append(lane);score+=hits*3
        if len(s)<420: score+=1
        if score: scored.append((score,-idx,s,tags))
    scored.sort(reverse=True)
    out=[];seen=set()
    for score,_,s,tags in scored:
        norm=re.sub(r"\W+"," ",s.lower())[:140]
        if norm in seen: continue
        seen.add(norm)
        out.append({"candidate_text":s[:700],"lanes":tags,"pre_score":score,"status":"CANDIDATE_NOT_HUMAN_APPROVED"})
        if len(out)>=limit: break
    return out

def main():
    ap=argparse.ArgumentParser(description="WPA Global Institutional Knowledge Harvester")
    ap.add_argument("--build-queue",action="store_true")
    ap.add_argument("--document-url")
    ap.add_argument("--institution-id")
    ap.add_argument("--access-basis",choices=sorted(ALL_ACCESS))
    ap.add_argument("--agreement-id")
    ap.add_argument("--dry-run",action="store_true")
    args=ap.parse_args()
    OUT.mkdir(exist_ok=True)

    if args.build_queue:
        q=build_queue()
        if args.dry_run:
            print(f"DRY RUN queue OK: {q['count']} external records prepared; no external requests made")
        else:
            (OUT/"institution-document-queue.json").write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding="utf-8")
            print(f"Queue written: {q['count']} records")
        return

    if not args.document_url:
        ap.error("Use --build-queue or --document-url")
    if not args.institution_id or not args.access_basis:
        ap.error("--institution-id and --access-basis are required with --document-url")
    if args.access_basis=="AGREEMENT_ON_FILE" and not args.agreement_id:
        ap.error("--agreement-id is required for AGREEMENT_ON_FILE")
    if args.access_basis not in FULLTEXT_OK:
        raise SystemExit("This access basis is discovery/metadata-only and cannot be full-text processed by this command.")
    if args.dry_run:
        print("DRY RUN document gate OK; no external request made")
        return

    data,ctype,final_url=fetch(args.document_url)
    sha=hashlib.sha256(data).hexdigest()
    pages=None
    if "pdf" in ctype or final_url.lower().endswith(".pdf"):
        text,pages=pdf_text(data);dtype="PUBLIC_PDF"
    elif "html" in ctype:
        text=html_text(data);dtype="OFFICIAL_WEB_PAGE"
    else:
        raise SystemExit(f"Unsupported content type: {ctype}")

    receipt={
      "schema":"wpa-document-provenance-receipt/1.0","institution_id":args.institution_id,
      "source_url":final_url,"access_basis":args.access_basis,"agreement_id":args.agreement_id,
      "content_type":ctype,"document_type":dtype,"sha256":sha,"bytes":len(data),"pages":pages,
      "text_characters":len(text),"full_text_committed_to_public_repo":False,
      "human_review_status":"PENDING"
    }
    core={"schema":"wpa-core-essence-preextraction/1.0","institution_id":args.institution_id,
          "source_url":final_url,"source_sha256":sha,"access_basis":args.access_basis,
          "candidate_evidence":candidate_core(text),"status":"PREEXTRACTION_ONLY_NOT_APPROVED",
          "note":"Deterministic candidate extraction. Human/AI evidence review must verify context and page/section locators before reuse."}
    stem=re.sub(r"[^A-Za-z0-9_-]+","-",args.institution_id)
    (OUT/f"{stem}-receipt.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding="utf-8")
    (OUT/f"{stem}-core-candidate.json").write_text(json.dumps(core,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"receipt":receipt,"candidate_count":len(core["candidate_evidence"])},ensure_ascii=False))

if __name__=="__main__":
    main()

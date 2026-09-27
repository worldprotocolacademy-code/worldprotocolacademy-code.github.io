#!/usr/bin/env python3
import argparse, hashlib, json, re, time, urllib.request
from pathlib import Path
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[2]
MASTER=ROOT/"data/global-institutions/v1.0-corrected-4f-rev7/WPA_Global_Institutions_Master_v1.0-CORRECTED-4F-REV7.json"
SOURCE_REGISTRY=ROOT/"data/institutional-knowledge/source-registry.json"
RIGHTS_REGISTRY=ROOT/"data/institutional-knowledge/rights-registry.json"
OUT=Path(__file__).resolve().parent/"wpa_output"

FULLTEXT_OK={"OPEN_ACCESS","OPEN_LICENSE","PUBLIC_DOMAIN","AGREEMENT_ON_FILE","MANUALLY_AUTHORISED","PUBLICLY_ACCESSIBLE_ANALYSIS_ONLY"}
HTML_OK=FULLTEXT_OK|{"PUBLIC_WEB_REFERENCE"}
ALL_ACCESS=HTML_OK|{"PUBLIC_ABSTRACT","OPEN_METADATA_ONLY","RESTRICTED_EXTERNAL_ONLY","PUBLICLY_ACCESSIBLE_RIGHTS_UNCLEAR"}

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

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def safe_stem(v):
    return re.sub(r"[^A-Za-z0-9_-]+","-",str(v or "source")).strip("-") or "source"

def load_master():
    return load_json(MASTER)

def records(data):
    for key in ("institutions","records","items"):
        if isinstance(data.get(key),list):
            return data[key]
    return []

def institution_name(institution_id):
    for r in records(load_master()):
        if r.get("id")==institution_id:
            return r.get("name")
    return None

def build_queue():
    q=[]
    for r in records(load_master()):
        if r.get("id")=="R001":
            continue
        q.append({
          "institution_id":r.get("id"),"name":r.get("name"),"country":r.get("country"),
          "group":r.get("group"),"relevance":r.get("relevance"),"verification":r.get("verification"),
          "website":r.get("website"),"status":"DOCUMENT_DISCOVERY_PENDING" if r.get("website") else "NO_RESOLVED_WEBSITE",
          "priority":1 if r.get("relevance")=="A" else 2 if r.get("group")=="A" else 3
        })
    q.sort(key=lambda x:(x["priority"],x["institution_id"] or ""))
    return {"schema":"wpa-institution-document-queue/1.1","generated":now(),"count":len(q),"items":q}

def active_right(permission_id):
    if not permission_id or not RIGHTS_REGISTRY.exists():
        return None
    for r in load_json(RIGHTS_REGISTRY).get("records",[]):
        if r.get("permission_id")==permission_id and r.get("status")=="ACTIVE":
            return r
    return None

def validate_access(access_basis, expected_content="AUTO", permission_id=None):
    expected=(expected_content or "AUTO").upper()
    if access_basis not in ALL_ACCESS:
        raise PermissionError("Unknown access basis")
    if access_basis in {"AGREEMENT_ON_FILE","MANUALLY_AUTHORISED"}:
        r=active_right(permission_id)
        if not r or r.get("internal_fulltext_processing") is not True:
            raise PermissionError("ACTIVE rights record permitting internal full-text processing is required")
    if expected=="PDF" and access_basis not in FULLTEXT_OK:
        raise PermissionError("PDF full-text processing withheld pending qualifying rights basis")
    if expected=="HTML" and access_basis not in HTML_OK:
        raise PermissionError("HTML processing withheld for this access basis")

def fetch(url,access_basis,expected_content="AUTO",max_bytes=25_000_000):
    if urlparse(url).scheme!="https":
        raise ValueError("Only https URLs are permitted")
    validate_access(access_basis,expected_content)
    req=urllib.request.Request(url,headers={
      "User-Agent":"WorldProtocolAcademy-PublicEvidence/1.2 (+https://worldprotocolacademy.mk/)",
      "Accept":"text/html,application/pdf;q=0.9,*/*;q=0.1"
    })
    with urllib.request.urlopen(req,timeout=30) as r:
        ctype=(r.headers.get("Content-Type") or "").lower()
        final=r.geturl()
        is_pdf=("pdf" in ctype) or final.lower().split("?",1)[0].endswith(".pdf")
        if is_pdf and access_basis not in FULLTEXT_OK:
            raise PermissionError("Server resolved to PDF; processing withheld")
        if not is_pdf and access_basis not in HTML_OK:
            raise PermissionError("Server resolved to HTML; processing withheld")
        data=r.read(max_bytes+1)
        if len(data)>max_bytes:
            raise ValueError("Document exceeds 25 MB safety limit")
        return data,ctype,final

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.title=[]; self.in_title=False
    def handle_starttag(self,tag,attrs):
        if tag.lower()=="a":
            href=dict(attrs).get("href")
            if href: self.links.append(href)
        if tag.lower()=="title": self.in_title=True
    def handle_endtag(self,tag):
        if tag.lower()=="title": self.in_title=False
    def handle_data(self,data):
        if self.in_title: self.title.append(data)

def parse_html(data):
    raw=data.decode("utf-8","replace")
    p=LinkParser()
    try: p.feed(raw)
    except Exception: pass
    cleaned=re.sub(r"(?is)<(script|style|noscript).*?>.*?</\1>"," ",raw)
    cleaned=re.sub(r"(?s)<[^>]+>"," ",cleaned)
    text=re.sub(r"\s+"," ",unescape(cleaned)).strip()
    title=re.sub(r"\s+"," "," ".join(p.title)).strip() or None
    return text,title,p.links

def discover_links(links,base,limit=40):
    out=[]; seen=set()
    for href in links:
        u=urljoin(base,href).split("#",1)[0]
        if urlparse(u).scheme!="https" or u in seen: continue
        low=u.lower().split("?",1)[0]
        if low.endswith(".pdf"):
            kind="PDF"; status="RIGHTS_REVIEW_REQUIRED"; basis="PUBLICLY_ACCESSIBLE_RIGHTS_UNCLEAR"
        elif any(k in low for k in ("handbook","manual","curriculum","syllabus","statute","policy","report","publication","article","book")):
            kind="DOCUMENT_PAGE"; status="DISCOVERED_DOCUMENT_PAGE"; basis="PUBLIC_WEB_REFERENCE"
        else:
            continue
        seen.add(u); out.append({"url":u,"discovery_type":kind,"status":status,"access_basis":basis})
        if len(out)>=limit: break
    return out

def pdf_extract(data):
    try:
        from pypdf import PdfReader
        from io import BytesIO
    except Exception as e:
        raise RuntimeError("PDF processing requires pypdf") from e
    reader=PdfReader(BytesIO(data))
    meta=reader.metadata or {}
    pages=[]
    for i,p in enumerate(reader.pages,1):
        txt=(p.extract_text() or "").strip()
        if txt: pages.append({"page":i,"text":txt})
    return pages,{
      "title":getattr(meta,"title",None) or meta.get("/Title") if hasattr(meta,"get") else None,
      "author":getattr(meta,"author",None) or meta.get("/Author") if hasattr(meta,"get") else None,
      "subject":getattr(meta,"subject",None) or meta.get("/Subject") if hasattr(meta,"get") else None,
      "page_count":len(reader.pages)
    }

def score_sentence(s):
    low=" "+s.lower()+" "; tags=[]; score=0
    for lane,words in KEYWORDS.items():
        hits=sum(1 for w in words if w in low)
        if hits: tags.append(lane); score+=hits*3
    if len(s)<420: score+=1
    return score,tags

def core_from_html(text,limit=36):
    candidates=[]; seen=set()
    for idx,s in enumerate(re.split(r"(?<=[.!?])\s+",text)):
        s=s.strip()
        if not 40<=len(s)<=900: continue
        score,tags=score_sentence(s)
        if not score: continue
        norm=re.sub(r"\W+"," ",s.lower())[:140]
        if norm in seen: continue
        seen.add(norm)
        candidates.append((score,-idx,{"candidate_text":s[:700],"lanes":tags,"pre_score":score,
          "locator":{"type":"html","value":"LOCATOR_NOT_AVAILABLE_AUTOMATICALLY"},
          "citation_status":"PARTIALLY_VERIFIED_REFERENCE","status":"CANDIDATE_NOT_HUMAN_APPROVED"}))
    candidates.sort(key=lambda x:(x[0],x[1]),reverse=True)
    return [x[2] for x in candidates[:limit]]

def core_from_pdf(pages,limit=36):
    candidates=[]; seen=set()
    for page in pages:
        for idx,s in enumerate(re.split(r"(?<=[.!?])\s+",page["text"])):
            s=s.strip()
            if not 40<=len(s)<=900: continue
            score,tags=score_sentence(s)
            if not score: continue
            norm=re.sub(r"\W+"," ",s.lower())[:140]
            if norm in seen: continue
            seen.add(norm)
            candidates.append((score,-page["page"],-idx,{
              "candidate_text":s[:700],"lanes":tags,"pre_score":score,
              "locator":{"type":"page","value":page["page"]},
              "citation_status":"PARTIALLY_VERIFIED_REFERENCE",
              "status":"CANDIDATE_NOT_HUMAN_APPROVED"}))
    candidates.sort(key=lambda x:(x[0],x[1],x[2]),reverse=True)
    return [x[3] for x in candidates[:limit]]

def reference_record(source_id,institution_id,url,access_basis,dtype,retrieved,title=None,author=None,citation_seed=None,pdf_meta=None):
    seed=citation_seed or {}
    pm=pdf_meta or {}
    corporate=seed.get("author_or_corporate_author") or institution_name(institution_id)
    author_value=author or pm.get("author") or corporate
    title_value=title or pm.get("title")
    evidence=["original_url", "retrieval_timestamp", "content_hash"]
    status="PARTIALLY_VERIFIED_REFERENCE"
    if title_value and author_value:
        status="VERIFIED_REFERENCE"
        evidence+=["title_from_source_or_pdf_metadata","author_or_corporate_author"]
    else:
        status="SOURCE_URL_VERIFIED_METADATA_PENDING"
    return {
      "schema":"wpa-reference-record/1.0",
      "reference_id":"REF-"+safe_stem(source_id),
      "source_id":source_id,
      "institution_id":institution_id,
      "source_type":dtype,
      "author_or_corporate_author":author_value,
      "title":title_value,
      "publisher_or_institution":seed.get("publisher_or_institution") or corporate,
      "publication_date_or_year":seed.get("publication_date_or_year"),
      "edition_or_version":seed.get("edition_or_version"),
      "doi":seed.get("doi"),
      "isbn":seed.get("isbn"),
      "issn":seed.get("issn"),
      "original_url":url,
      "retrieved_at":retrieved,
      "access_basis":access_basis,
      "licence_or_rights_note":seed.get("licence_or_rights_note") or ("Publicly accessible does not by itself establish an open licence." if access_basis=="PUBLICLY_ACCESSIBLE_ANALYSIS_ONLY" else None),
      "locator":{"type":"source","value":"See linked evidence-point locator"},
      "citation_status":status,
      "metadata_evidence":evidence,
      "human_review_status":"PENDING",
      "correction_status":"CURRENT"
    }

def process(source_id,institution_id,url,access_basis,expected_content="AUTO",permission_id=None,citation_seed=None):
    validate_access(access_basis,expected_content,permission_id)
    data,ctype,final=fetch(url,access_basis,expected_content)
    sha=hashlib.sha256(data).hexdigest()
    retrieved=now()
    is_pdf=("pdf" in ctype) or final.lower().split("?",1)[0].endswith(".pdf")
    if is_pdf:
        pages,meta=pdf_extract(data)
        candidates=core_from_pdf(pages)
        title=meta.get("title")
        ref=reference_record(source_id,institution_id,final,access_basis,"PUBLIC_PDF",retrieved,title=title,citation_seed=citation_seed,pdf_meta=meta)
        discovered=[]
        page_count=meta.get("page_count")
        text_chars=sum(len(x["text"]) for x in pages)
        dtype="PUBLIC_PDF"
    else:
        text,title,links=parse_html(data)
        candidates=core_from_html(text)
        ref=reference_record(source_id,institution_id,final,access_basis,"OFFICIAL_WEB_PAGE",retrieved,title=title,citation_seed=citation_seed)
        discovered=discover_links(links,final)
        page_count=None; text_chars=len(text); dtype="OFFICIAL_WEB_PAGE"

    for item in candidates:
        item["reference_id"]=ref["reference_id"]

    receipt={
      "schema":"wpa-document-provenance-receipt/1.2","source_id":source_id,"institution_id":institution_id,
      "source_url":final,"access_basis":access_basis,"permission_id":permission_id,"retrieved_at":retrieved,
      "content_type":ctype,"document_type":dtype,"sha256":sha,"bytes":len(data),"pages":page_count,
      "text_characters":text_chars,"full_text_committed_to_public_repo":False,
      "citation_status":ref["citation_status"],"human_review_status":"PENDING"
    }
    core={
      "schema":"wpa-core-essence-preextraction/1.2","source_id":source_id,"institution_id":institution_id,
      "source_url":final,"source_sha256":sha,"access_basis":access_basis,"reference_id":ref["reference_id"],
      "candidate_evidence":candidates,"discovered_document_candidates":discovered,
      "status":"PREEXTRACTION_ONLY_NOT_APPROVED",
      "publication_readiness":"BLOCKED_PENDING_HUMAN_REVIEW_AND_REFERENCE_CHECK",
      "note":"Every evidence candidate retains a reference ID and locator. WPA reuse requires citation and Human Gate review."
    }
    stem=safe_stem(source_id)
    OUT.mkdir(exist_ok=True)
    (OUT/f"{stem}-receipt.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding="utf-8")
    (OUT/f"{stem}-reference.json").write_text(json.dumps(ref,ensure_ascii=False,indent=2),encoding="utf-8")
    (OUT/f"{stem}-core-candidate.json").write_text(json.dumps(core,ensure_ascii=False,indent=2),encoding="utf-8")
    return receipt,ref,core

def run_registry(max_items=3,sleep_seconds=5,dry_run=False):
    registry=load_json(SOURCE_REGISTRY)
    entries=sorted([x for x in registry.get("entries",[]) if x.get("active") is True],
                   key=lambda x:(int(x.get("priority",99)),x.get("source_id","")))[:max_items]
    report={"schema":"wpa-institutional-harvest-run/1.1","started_at":now(),"selected_count":len(entries),"processed":[]}
    for i,e in enumerate(entries):
        item={"source_id":e.get("source_id"),"institution_id":e.get("institution_id"),"url":e.get("url")}
        try:
            validate_access(e.get("access_basis"),e.get("expected_content","AUTO"),e.get("permission_id"))
            if dry_run:
                item["status"]="SCHEDULED_DRY_RUN"
            else:
                receipt,ref,core=process(
                  e.get("source_id"),e.get("institution_id"),e.get("url"),e.get("access_basis"),
                  e.get("expected_content","AUTO"),e.get("permission_id"),e.get("citation_seed")
                )
                item.update({"status":"REVIEW_REQUIRED","reference_id":ref["reference_id"],
                  "citation_status":ref["citation_status"],"candidate_count":len(core["candidate_evidence"]),
                  "discovered_document_count":len(core["discovered_document_candidates"])})
        except Exception as exc:
            item["status"]="WITHHELD_OR_FAILED"; item["reason"]=f"{type(exc).__name__}: {exc}"
        report["processed"].append(item)
        if not dry_run and i<len(entries)-1 and sleep_seconds>0: time.sleep(sleep_seconds)
    report["completed_at"]=now()
    report["status"]="DRY_RUN_COMPLETE" if dry_run else "COMPLETED_HUMAN_REVIEW_REQUIRED"
    OUT.mkdir(exist_ok=True)
    (OUT/"run-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    return report

def main():
    ap=argparse.ArgumentParser(description="WPA Global Institutional Knowledge Harvester")
    ap.add_argument("--build-queue",action="store_true")
    ap.add_argument("--run-registry",action="store_true")
    ap.add_argument("--max-items",type=int,default=3)
    ap.add_argument("--sleep-seconds",type=int,default=5)
    ap.add_argument("--document-url")
    ap.add_argument("--source-id",default="MANUAL-SOURCE")
    ap.add_argument("--institution-id")
    ap.add_argument("--access-basis",choices=sorted(ALL_ACCESS))
    ap.add_argument("--expected-content",choices=["AUTO","HTML","PDF"],default="AUTO")
    ap.add_argument("--permission-id")
    ap.add_argument("--dry-run",action="store_true")
    args=ap.parse_args()

    if args.build_queue:
        q=build_queue()
        if args.dry_run: print(f"DRY RUN queue OK: {q['count']} external records prepared")
        else:
            OUT.mkdir(exist_ok=True)
            (OUT/"institution-document-queue.json").write_text(json.dumps(q,ensure_ascii=False,indent=2),encoding="utf-8")
            print(f"Queue written: {q['count']}")
        return

    if args.run_registry:
        print(json.dumps(run_registry(args.max_items,args.sleep_seconds,args.dry_run),ensure_ascii=False))
        return

    if not args.document_url or not args.institution_id or not args.access_basis:
        ap.error("Use --build-queue, --run-registry, or provide --document-url + --institution-id + --access-basis")
    validate_access(args.access_basis,args.expected_content,args.permission_id)
    if args.dry_run:
        print("DRY RUN document gate OK; no external request made"); return
    receipt,ref,core=process(args.source_id,args.institution_id,args.document_url,args.access_basis,args.expected_content,args.permission_id)
    print(json.dumps({"receipt":receipt,"reference":ref,"candidate_count":len(core["candidate_evidence"])},ensure_ascii=False))

if __name__=="__main__":
    main()

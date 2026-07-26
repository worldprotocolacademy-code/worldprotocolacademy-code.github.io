#!/usr/bin/env python3
"""Fail-closed creation and verification of the isolated WPA v3 AI Search instance."""
from __future__ import annotations
import argparse, hashlib, json, os, re, time
from pathlib import Path
from typing import Any
import requests

API="https://api.cloudflare.com/client/v4"
SOURCE="protocol-ai"; TARGET="protocol-ai-v3-clean"; BUCKET="protocol-kb"
PREFIX="__ai_search_ready_v3__/80cd2f51cf9ddb429562/"; EXPECTED=793
INDEXED={"indexed","completed","complete","ok"}
SHA_RE=re.compile(r"^[0-9a-f]{64}$")
UUID_RE=re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",re.I)
POLL=int(os.getenv("AI_SEARCH_CLEAN_POLL_SECONDS","10")); TIMEOUT=int(os.getenv("AI_SEARCH_CLEAN_TIMEOUT_SECONDS","3600"))
QUERIES=("U-shaped conference room seating configuration","diplomatic protocol and safety","ethical teachings and professional ethics")

class GuardError(RuntimeError): pass

def dump(path:Path,value:Any)->None:
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")

def req(method:str,url:str,token:str,missing_ok:bool=False,**kwargs:Any)->dict[str,Any]|None:
    headers=dict(kwargs.pop("headers",{}) or {}); headers["Authorization"]=f"Bearer {token}"
    if "json" in kwargs: headers.setdefault("Content-Type","application/json")
    response=requests.request(method,url,headers=headers,timeout=120,**kwargs)
    if missing_ok and response.status_code==404: return None
    try: payload=response.json()
    except ValueError as exc: raise GuardError(f"non-JSON Cloudflare response HTTP {response.status_code}: {response.text[:500]}") from exc
    if not response.ok or payload.get("success") is False: raise GuardError(f"Cloudflare API failure {method} {url} HTTP {response.status_code}: {payload}")
    return payload

def url(account:str,name:str,suffix:str="")->str: return f"{API}/accounts/{account}/ai-search/instances/{name}{suffix}"
def instance(account:str,token:str,name:str)->dict[str,Any]|None:
    payload=req("GET",url(account,name),token,missing_ok=True); return None if payload is None else dict(payload.get("result") or {})
def stats(account:str,token:str,name:str)->dict[str,Any]: return dict((req("GET",url(account,name,"/stats"),token) or {}).get("result") or {})
def jobs(account:str,token:str,name:str)->list[dict[str,Any]]: return list((req("GET",url(account,name,"/jobs"),token,params={"page":1,"per_page":50}) or {}).get("result") or [])

def all_items(account:str,token:str,name:str)->list[dict[str,Any]]:
    found=[]; page=1; total=None
    while True:
        payload=req("GET",url(account,name,"/items"),token,params={"page":page,"per_page":50}) or {}; batch=list(payload.get("result") or []); info=payload.get("result_info") or {}
        reported=info.get("total_count")
        if reported is not None:
            reported=int(reported)
            if total is None: total=reported
            elif total!=reported: raise GuardError(f"{name} total_count changed during pagination: {total}->{reported}")
        found.extend(batch)
        if (total is not None and len(found)>=total) or (total is None and len(batch)<50): break
        page+=1
        if page>200: raise GuardError(f"{name} pagination safety limit exceeded")
    if total is not None and len(found)!=total: raise GuardError(f"incomplete {name} snapshot: expected={total} received={len(found)}")
    return found

def key(item:dict[str,Any])->str: return str(next((item.get(k) for k in ("key","name","filename","path","source_key") if item.get(k)),""))
def status(item:dict[str,Any])->str: return str(item.get("status") or item.get("indexing_status") or item.get("state") or "").lower()
def digest(keys:list[str])->str: return hashlib.sha256(json.dumps(sorted(keys),ensure_ascii=False,separators=(",",":")).encode()).hexdigest()

def manifest(items:list[dict[str,Any]],label:str,filter_prefix:bool)->dict[str,Any]:
    selected=[i for i in items if not filter_prefix or key(i).startswith(PREFIX)]; keys=[key(i) for i in selected]
    if any(not k for k in keys): raise GuardError(f"{label} contains an empty key")
    if len(set(keys))!=len(keys): raise GuardError(f"{label} contains duplicate keys")
    outside=sorted(k for k in keys if not k.startswith(PREFIX)); non_indexed=sorted(({"key":key(i),"status":status(i)} for i in selected if status(i) not in INDEXED),key=lambda r:r["key"])
    statuses={}
    for i in selected: statuses[status(i)]=statuses.get(status(i),0)+1
    result={"schema":"wpa-ai-search-v3-key-manifest/1","label":label,"prefix":PREFIX,"count":len(keys),"sha256":digest(keys),"statuses":statuses,"outside_prefix":outside,"non_indexed":non_indexed,"keys":sorted(keys)}
    if len(keys)!=EXPECTED: raise GuardError(f"{label} count mismatch: expected={EXPECTED} actual={len(keys)}")
    if outside: raise GuardError(f"{label} has {len(outside)} keys outside locked prefix")
    if non_indexed: raise GuardError(f"{label} has {len(non_indexed)} non-indexed keys; first={non_indexed[:5]}")
    return result

def source_manifest(account:str,token:str)->dict[str,Any]: return manifest(all_items(account,token,SOURCE),"source-protocol-ai-v3",True)
def target_manifest(account:str,token:str)->dict[str,Any]: return manifest(all_items(account,token,TARGET),"target-protocol-ai-v3-clean",False)
def compare(reference:dict[str,Any],candidate:dict[str,Any])->dict[str,Any]:
    expected=set(reference["keys"]); actual=set(candidate["keys"]); missing=sorted(expected-actual); unexpected=sorted(actual-expected)
    result={"reference_sha256":reference["sha256"],"candidate_sha256":candidate["sha256"],"missing":missing,"unexpected":unexpected,"exact_match":not missing and not unexpected and reference["sha256"]==candidate["sha256"]}
    if not result["exact_match"]: raise GuardError(f"key-set mismatch: missing={len(missing)} unexpected={len(unexpected)}")
    return result

def token_id(source:dict[str,Any])->str:
    value=str(source.get("token_id") or "")
    if not UUID_RE.fullmatch(value): raise GuardError("protocol-ai does not expose a valid registered AI Search service token_id")
    return value

def params(value:dict[str,Any]|None)->dict[str,Any]:
    value=value or {}; return {"prefix":value.get("prefix") or "","r2_jurisdiction":value.get("r2_jurisdiction") or "default","include_items":sorted(value.get("include_items") or []),"exclude_items":sorted(value.get("exclude_items") or [])}

def verify_target(value:dict[str,Any],service_token_id:str)->None:
    if value.get("id") not in (None,TARGET) or value.get("type")!="r2" or value.get("source")!=BUCKET: raise GuardError(f"unexpected target shape: {value}")
    if str(value.get("token_id") or "")!=service_token_id: raise GuardError("target service token_id does not match protocol-ai")
    if params(value.get("source_params"))!=params({"prefix":PREFIX,"r2_jurisdiction":"default"}): raise GuardError(f"target source_params mismatch: {value.get('source_params')}")

def source_and_token(account:str,token:str)->tuple[dict[str,Any],str]:
    value=instance(account,token,SOURCE)
    if value is None: raise GuardError("protocol-ai does not exist")
    if value.get("type")!="r2" or value.get("source")!=BUCKET: raise GuardError("protocol-ai is not the expected protocol-kb R2 instance")
    return value,token_id(value)

def create_target(account:str,token:str,service_token_id:str)->dict[str,Any]:
    payload=req("POST",f"{API}/accounts/{account}/ai-search/instances",token,json={"id":TARGET,"type":"r2","source":BUCKET,"token_id":service_token_id,"source_params":{"prefix":PREFIX,"r2_jurisdiction":"default"}})
    value=dict((payload or {}).get("result") or {}); verify_target(value,service_token_id); return value

def verify_zero(value:dict[str,Any])->None:
    actual=(int(value.get("completed") or 0),int(value.get("skipped") or 0),int(value.get("error") or value.get("errors") or 0),int(value.get("queued") or 0),int(value.get("running") or 0))
    if actual!=(EXPECTED,0,0,0,0): raise GuardError(f"target stats mismatch: expected={EXPECTED}/0/0/0/0 actual={'/'.join(map(str,actual))}")

def hit_count(value:Any)->int:
    if isinstance(value,list): return len(value)
    if isinstance(value,dict):
        for field in ("chunks","data","results","search_results","matches"):
            if isinstance(value.get(field),list): return len(value[field])
        return max((hit_count(v) for v in value.values()),default=0)
    return 0

def smoke(account:str,token:str)->list[dict[str,Any]]:
    evidence=[]
    for query in QUERIES:
        result=(req("POST",url(account,TARGET,"/search"),token,json={"messages":[{"role":"user","content":query}]}) or {}).get("result"); count=hit_count(result)
        evidence.append({"query":query,"result_count":count,"result_type":type(result).__name__})
        if count<1: raise GuardError(f"smoke query returned no chunks: {query}")
    return evidence

def plan(account:str,token:str,out:Path)->None:
    source,service_token_id=source_and_token(account,token); reference=source_manifest(account,token); target=instance(account,token,TARGET)
    if target is not None: verify_target(target,service_token_id)
    dump(out/"source-instance.json",source); dump(out/"approved-source-manifest.json",reference)
    result={"status":"planned","target":TARGET,"prefix":PREFIX,"expected":EXPECTED,"approved_manifest_sha256":reference["sha256"],"target_state":"absent" if target is None else "present-and-shape-verified","never_mutated":[SOURCE,"protocol-kb objects","production Worker configuration"]}
    dump(out/"plan.json",result); print(json.dumps(result,ensure_ascii=False,indent=2))

def observe(account:str,token:str,out:Path)->None:
    _,service_token_id=source_and_token(account,token); reference=source_manifest(account,token); target=instance(account,token,TARGET)
    if target is None: result={"status":"absent","target":TARGET,"source_manifest_sha256":reference["sha256"]}
    else:
        verify_target(target,service_token_id); target_stats=stats(account,token,TARGET); result={"status":"observed","target":target,"stats":target_stats,"source_manifest_sha256":reference["sha256"]}
        if int(target_stats.get("queued") or 0)==0 and int(target_stats.get("running") or 0)==0:
            try: verify_zero(target_stats); result["manifest_comparison"]=compare(reference,target_manifest(account,token)); result["clean_zero_state"]=True
            except Exception as exc: result["clean_zero_state"]=False; result["verification_error"]=str(exc)
    dump(out/"status.json",result); print(json.dumps(result,ensure_ascii=False,indent=2))

def apply(account:str,token:str,approval:str,approved_sha:str,out:Path)->None:
    if approval!="APPROVE_CREATE_CLEAN_V3" or not SHA_RE.fullmatch(approved_sha): raise GuardError("APPLY requires explicit approval and the PLAN manifest SHA-256")
    source,service_token_id=source_and_token(account,token); reference=source_manifest(account,token)
    if reference["sha256"]!=approved_sha: raise GuardError(f"approved manifest mismatch: approved={approved_sha} current={reference['sha256']}")
    dump(out/"source-instance.json",source); dump(out/"approved-source-manifest.json",reference)
    target=instance(account,token,TARGET); created=target is None; target=create_target(account,token,service_token_id) if target is None else target; verify_target(target,service_token_id); dump(out/"target-instance.json",target)
    if created:
        time.sleep(15)
    target_stats=stats(account,token,TARGET); active=[j for j in jobs(account,token,TARGET) if not j.get("ended_at")]; triggered=None
    if not active and (int(target_stats.get("completed") or 0),int(target_stats.get("skipped") or 0),int(target_stats.get("error") or target_stats.get("errors") or 0))!=(EXPECTED,0,0):
        triggered=dict((req("POST",url(account,TARGET,"/jobs"),token,json={"description":"WPA clean v3 80cd2f51"}) or {}).get("result") or {}); dump(out/"triggered-job.json",triggered)
    deadline=time.monotonic()+TIMEOUT; snapshots=[]
    while True:
        current=instance(account,token,TARGET)
        if current is None: raise GuardError("target disappeared during APPLY")
        verify_target(current,service_token_id); target_stats=stats(account,token,TARGET); active=[j for j in jobs(account,token,TARGET) if not j.get("ended_at")]
        snap={"at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"completed":int(target_stats.get("completed") or 0),"skipped":int(target_stats.get("skipped") or 0),"errors":int(target_stats.get("error") or target_stats.get("errors") or 0),"queued":int(target_stats.get("queued") or 0),"running":int(target_stats.get("running") or 0),"active_jobs":len(active)}
        snapshots.append(snap); print(json.dumps(snap),flush=True)
        if not active and snap["queued"]==0 and snap["running"]==0: break
        if time.monotonic()>=deadline: raise GuardError(f"target indexing timeout after {TIMEOUT} seconds")
        time.sleep(POLL)
    dump(out/"poll-snapshots.json",snapshots); dump(out/"final-stats.json",target_stats); verify_zero(target_stats)
    after=source_manifest(account,token)
    if after["sha256"]!=approved_sha: raise GuardError(f"source manifest changed during APPLY: approved={approved_sha} after={after['sha256']}")
    candidate=target_manifest(account,token); comparison=compare(reference,candidate); tests=smoke(account,token)
    dump(out/"final-source-manifest.json",after); dump(out/"target-manifest.json",candidate); dump(out/"manifest-comparison.json",comparison); dump(out/"smoke-tests.json",tests)
    result={"status":"clean_v3_verified","created":created,"triggered_job":triggered,"approved_manifest_sha256":approved_sha,"stats":target_stats,"manifest_comparison":comparison,"smoke_tests":tests,"source_instance_untouched":SOURCE,"r2_objects_untouched":True}
    dump(out/"result.json",result); print(json.dumps(result,ensure_ascii=False,indent=2))

def self_test()->None:
    global EXPECTED; old=EXPECTED
    try:
        EXPECTED=2; source=[{"key":f"{PREFIX}b.json","status":"indexed"},{"key":f"{PREFIX}a.pdf","status":"completed"},{"key":"legacy/x.pdf","status":"error"}]; target=[{"key":f"{PREFIX}a.pdf","status":"indexed"},{"key":f"{PREFIX}b.json","status":"indexed"}]
        assert compare(manifest(source,"source-test",True),manifest(target,"target-test",False))["exact_match"]; assert hit_count({"data":[{"id":1}]})==1
    finally: EXPECTED=old
    print("guarded clean instance self-test: OK")

def main()->None:
    parser=argparse.ArgumentParser(); parser.add_argument("--mode",choices=("PLAN","STATUS","APPLY")); parser.add_argument("--approval",default="DO_NOT_APPROVE"); parser.add_argument("--approved-manifest-sha256",default=""); parser.add_argument("--out",default="/tmp/ai-search-v3-clean-instance"); parser.add_argument("--self-test",action="store_true"); args=parser.parse_args()
    if args.self_test: self_test(); return
    if not args.mode: parser.error("--mode is required")
    account=os.environ.get("CLOUDFLARE_ACCOUNT_ID",""); token=os.environ.get("CLOUDFLARE_AI_SEARCH_TOKEN","")
    if not account or not token: raise GuardError("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_SEARCH_TOKEN are required")
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    try:
        if args.mode=="PLAN": plan(account,token,out)
        elif args.mode=="STATUS": observe(account,token,out)
        else: apply(account,token,args.approval,args.approved_manifest_sha256,out)
    except Exception as exc: dump(out/"failure.json",{"status":"failed","mode":args.mode,"error":str(exc)}); raise

if __name__=="__main__": main()

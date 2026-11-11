#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.request
import urllib.error
import uuid
from datetime import datetime, timezone
from pathlib import Path

AGENTS = {
    "grok": {
        "label": "Grok-Bot-Proactive Agent",
        "role": "horizon_scan_and_counter_signal",
        "key": "WPA_GROK_API_KEY",
        "url": "WPA_GROK_API_URL",
        "model": "WPA_GROK_MODEL",
    },
    "gpt": {
        "label": "GPT Orchestrator",
        "role": "orchestration_synthesis_and_task_routing",
        "key": "WPA_GPT_API_KEY",
        "url": "WPA_GPT_API_URL",
        "model": "WPA_GPT_MODEL",
    },
    "claude": {
        "label": "Claude Red-Team Agent",
        "role": "academic_red_team_and_consistency_review",
        "key": "WPA_CLAUDE_API_KEY",
        "url": "WPA_CLAUDE_API_URL",
        "model": "WPA_CLAUDE_MODEL",
    },
    "kimi": {
        "label": "Kimi Long-Context Agent",
        "role": "long_context_and_multilingual_comparison",
        "key": "WPA_KIMI_API_KEY",
        "url": "WPA_KIMI_API_URL",
        "model": "WPA_KIMI_MODEL",
    },
    "harvey": {
        "label": "Harvey Legal-Compliance Agent",
        "role": "legal_compliance_review",
        "key": "WPA_HARVEY_API_KEY",
        "url": "WPA_HARVEY_API_URL",
        "model": "WPA_HARVEY_MODEL",
    },
}

SYSTEM = """You are a bounded WPA Institute specialist agent.
Use only the supplied task and evidence packet. Distinguish source facts, analysis, uncertainty and recommendations.
Do not invent sources, provider capabilities, partnerships, legal authority, publication status or institutional commitments.
Return concise JSON with keys: assessment, evidence_used, uncertainties, risks, recommendations.
No external publication or doctrine change is authorised."""

def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

def availability(agent):
    cfg = AGENTS[agent]
    vals = {name: os.getenv(env, "").strip() for name, env in (("api_key",cfg["key"]),("api_url",cfg["url"]),("model",cfg["model"]))}
    vals["available"] = all(vals.values())
    return vals

def call_openai_compatible(url, key, model, prompt, timeout=60):
    body = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json", "Accept": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.load(resp)
    try:
        return data["choices"][0]["message"]["content"]
    except Exception:
        return json.dumps(data, ensure_ascii=False)

def call_generic(agent, prompt):
    cfg = availability(agent)
    if not cfg["available"]:
        return {"state":"UNAVAILABLE","reason":"Required server-side provider configuration is incomplete."}
    try:
        text = call_openai_compatible(cfg["api_url"], cfg["api_key"], cfg["model"], prompt)
        return {"state":"COMPLETED","model":cfg["model"],"output":text}
    except urllib.error.HTTPError as exc:
        return {"state":"ERROR","reason":"HTTP %s" % exc.code}
    except Exception as exc:
        return {"state":"ERROR","reason":str(exc)[:300]}

def classify_gate(task):
    s = task.lower()
    hg4 = ("doctrine","мандат","authority","овластување","official commitment","официјална обврска")
    hg3 = ("payment","плаќа","credential","сертифик","private data","лични податоци","legal decision","правна одлука")
    hg2 = ("publish","објав","official statement","соопштение","external deliverable","надвореш")
    if any(x in s for x in hg4): return "HG4"
    if any(x in s for x in hg3): return "HG3"
    if any(x in s for x in hg2): return "HG2"
    return "HG1"

def build_prompt(agent, task, evidence):
    role = AGENTS[agent]["role"]
    return "ROLE: %s\nTASK: %s\nEVIDENCE PACKET:\n%s\nReturn a bounded specialist review." % (role, task, evidence[:24000])

def run(task, evidence, dry_run=False):
    gate = classify_gate(task)
    run_id = "wpaf-" + uuid.uuid4().hex[:12]
    result = {
        "schema":"wpa-proactive-agent-run/1.0",
        "run_id":run_id,
        "generated_at":now_iso(),
        "task":task,
        "human_gate":{"class":gate,"state":"READY_FOR_HUMAN_GATE" if gate in ("HG2","HG3","HG4") else "BOUNDED_AUTOMATION_ALLOWED"},
        "agents":{},
        "release":{"automatic_external_publication":False,"automatic_doctrine_mutation":False}
    }
    order = ["grok","gpt","kimi","claude","harvey"]
    for agent in order:
        av = availability(agent)
        if dry_run:
            result["agents"][agent] = {
                "label":AGENTS[agent]["label"],
                "role":AGENTS[agent]["role"],
                "state":"AVAILABLE" if av["available"] else "UNAVAILABLE"
            }
        else:
            result["agents"][agent] = {
                "label":AGENTS[agent]["label"],
                "role":AGENTS[agent]["role"],
                **call_generic(agent, build_prompt(agent, task, evidence))
            }
    states = [x["state"] for x in result["agents"].values()]
    result["summary"] = {
        "completed":states.count("COMPLETED"),
        "unavailable":states.count("UNAVAILABLE"),
        "errors":states.count("ERROR"),
        "consensus_claimed":False,
        "note":"Independent agent outputs remain separate; human review reconciles material disagreement."
    }
    return result

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--task", default="Prepare the WPA Institute daily research and editorial review packet.")
    p.add_argument("--evidence-file")
    p.add_argument("--output", default="data/proactive-agent-runs/latest.json")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--self-test", action="store_true")
    a=p.parse_args()
    evidence = ""
    if a.evidence_file:
        evidence = Path(a.evidence_file).read_text(encoding="utf-8")
    if a.self_test:
        r=run("Research queue preparation only", "fixture evidence", True)
        assert r["human_gate"]["class"]=="HG1"
        assert set(r["agents"])==set(AGENTS)
        r2=run("Publish official statement", "fixture evidence", True)
        assert r2["human_gate"]["class"]=="HG2"
        print("SELF_TEST_PASS")
        return
    r=run(a.task, evidence, a.dry_run)
    out=Path(a.output); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(r["summary"], ensure_ascii=False))

if __name__=="__main__":
    main()

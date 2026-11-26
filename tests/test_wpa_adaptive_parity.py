"""Compare synthetic JS fixture and Python shadow engine; no network."""
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("adaptive", root / "scripts/wpa_adaptive_intelligence.py")
engine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
js = root / "tools/ai-playground/app.js"
now = datetime(2026, 11, 26, 12, tzinfo=timezone.utc)
def node(case, pref):
    script = "const m=require(process.argv[1]);const p=m.scenario(process.argv[2]);try{console.log(JSON.stringify({packet:p,result:m.simulate(p,JSON.parse(process.argv[3]))}));}catch(e){console.log(JSON.stringify({packet:p,blocked:true}));}"
    return json.loads(subprocess.check_output(["node", "-e", script, str(js), case, json.dumps(pref)], text=True))
for pref in ([0]*5, [-5,0,0,0,5], [5,5,-5,-5,0]):
    data = node("normal", pref)
    out = engine.build(data["packet"], [d for d,v in zip(engine.DOMAINS,pref) if v==5], [d for d,v in zip(engine.DOMAINS,pref) if v==-5], now=now)
    fields = ("domain","source_url","verification_status","base_score","adjustment","routing_score","specialist_candidate","authority")
    assert [{k:r[k] for k in fields} for r in out["items"]] == [{k:r[k] for k in fields} for r in data["result"]["items"]]
for case in ("stale","confidence","duplicate","gate","external","missing"):
    data=node(case,[0]*5)
    assert data["blocked"]
    try:
        engine.build(data["packet"],now=now)
    except (ValueError,KeyError):
        pass
    else:
        raise AssertionError(case)
print("PASS: 3 cross-language priority scenarios and 6 shared blocked cases")

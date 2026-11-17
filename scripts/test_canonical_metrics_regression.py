#!/usr/bin/env python3
"""Audited snapshot regression, fail closed if canonical metrics drift without review.

New, independently evidenced counts must update the two canonical JSON sources and
this dated audit baseline together, with Human Gate documentation; never silently
force the public site back to a historical snapshot.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/"data/wpa-canonical-metrics-status.json").read_text(encoding="utf-8"))
facts=json.loads((ROOT/"data/wpa-canonical-public-facts.json").read_text(encoding="utf-8"))
acad=data["academic_publications"]
zen=data["zenodo_doi_corpus"]
fa=facts["academic_corpus"]
fz=facts["zenodo_corpus"]
assert (acad["total"],acad["monographs_and_handbooks"],acad["doctoral_dissertations"],acad["scientific_papers_and_contributions"])==(27,6,1,20),"Audited corpus changed; require new dated evidence and baseline"
assert (zen["total_records"],zen["working_papers"],zen["protocol_notes"],zen["global_strategic_plans"])==(25,15,9,1),"Zenodo corpus changed; require new dated evidence and baseline"
assert (fa["total_publications"],fa["monographs_and_manuals"],fa["dissertation"],fa["papers_and_contributions"])==(27,6,1,20),"Cross-file academic drift"
assert (fz["total_records"],fz["working_papers"],fz["protocol_notes"],fz["global_strategic_plans"])==(25,15,9,1),"Cross-file Zenodo drift"

paths=("index.html","en/index.html","bibliography/index.html","institute.html","papers.html","wpa-services.html")
for p in paths:
    content=(ROOT/p).read_text(encoding="utf-8")
    if p=="index.html":
        assert 'data-wpa-metric="academic.total">27</div>' in content
        assert 'data-wpa-metric="academic.papers">20</div>' in content
    if p=="papers.html":
        for expected in ('"academic.total">27</strong>','"academic.papers">20</strong>','"zenodo.working_papers">15</strong>','"zenodo.protocol_notes">9</strong>'):
            assert expected in content, f"{p}: {expected} absent"
    if p=="bibliography/index.html":
        assert '"zenodo.summary.en">◆ 25 WPA Zenodo Records · 15 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan' in content

for p in ("scripts/wpa-home-metrics-sync-20260817.js","scripts/wpa-publications-sync-20260817.js","scripts/wpa-final-reconciliation-20260826.js","languages/wpa-language-menu-10.js"):
    assert (ROOT/p).is_file(),"Legacy source must remain backed up while content side effects are audited: "+p

core=(ROOT/"scripts/wpa-performance-core.js").read_text(encoding="utf-8")
assert "addScript('wpa-home-metrics-sync-20260817'" not in core,"Historical 26/19 metrics loader returned"
sync=(ROOT/"scripts/wpa-publications-sync-20260817.js").read_text(encoding="utf-8")
assert not re.search(r"setText\\(\\w+,\\s*['\"]26['\"]\\)",sync),"Historical 26 public total overwrite returned"
assert "26 Academic Publications" not in sync,"Historical 26 current-publications copy returned"
reconcile=(ROOT/"scripts/wpa-final-reconciliation-20260826.js").read_text(encoding="utf-8")
assert "previousElementSibling.textContent='26'" not in reconcile
router=(ROOT/"languages/wpa-language-menu-10.js").read_text(encoding="utf-8")
assert '["25 публикации", "26 публикации"]' not in router

print("WPA audited metric regression PASS: 27=6+1+20, 25=15+9+1, public MK/EN markup; stale 26/19 browser overwrites blocked.")

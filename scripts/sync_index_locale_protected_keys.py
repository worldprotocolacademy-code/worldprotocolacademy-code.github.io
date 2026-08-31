#!/usr/bin/env python3
"""Synchronise only protected WPA index-locale facts; do not flatten stylistic variants."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
FILES=["locales/index/mk.json","mk.json","index/mk.json","locales/locales/index/mk.json"]
REPLACEMENTS=[("25 публикации (5 монографии, 1 дисертација, 19 трудови)","26 публикации (6 монографии и прирачници, 1 дисертација, 19 трудови и прилози)"),("5 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 25 публикации вкупно.","6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 публикации вкупно."),("5 monographs and manuals","6 monographs and manuals"),("25 publications","26 publications")]
for rel in FILES:
    p=ROOT/rel
    if not p.exists(): continue
    text=p.read_text(encoding="utf-8")
    for old,new in REPLACEMENTS: text=text.replace(old,new)
    text=re.sub(r"(со 25\+ години институционално искуство)(?:\s+со 25\+ години институционално искуство)+",r"\1",text)
    p.write_text(text,encoding="utf-8")
print("Protected WPA locale facts synchronized.")

#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
home = ROOT / "index.html"
check = ROOT / "scripts/mk_home_language_integrity_check.py"

text = home.read_text(encoding="utf-8")
replacements = {
    '<strong>AI слој</strong>Virtual Sande, прашања и одговори, ревизија': '<strong>ВИ слој</strong>Virtual Sande, прашања и одговори, ревизија',
    '<strong>Тренерски слој</strong>train-the-trainer и консултантско ниво': '<strong>Тренерски слој</strong>обука за обучувачи и консултантско ниво',
    '<strong>Revenue слој</strong>membership, partner benefits и одржлива growth логика': '<strong>Слој за одржливост</strong>членство, партнерски придобивки и одржлива логика на раст',
}
for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f"required final MK anchor missing: {old}")
    text = text.replace(old, new)
home.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n", encoding="utf-8")

ct = check.read_text(encoding="utf-8")
old = '    "partnerships and member benefits", "member benefits, recurring value",\n)'
new = '    "partnerships and member benefits", "member benefits, recurring value",\n    "AI слој", "train-the-trainer", "Revenue слој", "membership, partner benefits", "growth логика",\n)'
if old not in ct:
    raise SystemExit("MK checker final fragment anchor missing")
check.write_text(ct.replace(old, new), encoding="utf-8")
print("final MK micro-cleanup applied")

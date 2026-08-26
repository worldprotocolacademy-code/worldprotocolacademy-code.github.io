from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def patch(path, replacements):
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    original = text
    for old, new in replacements:
        if old not in text:
            print(f"WARN {path}: pattern not found: {old[:90]!r}")
        text = text.replace(old, new)
    if text != original:
        p.write_text(text, encoding="utf-8")
        print(f"PATCHED {path}")
    else:
        print(f"UNCHANGED {path}")


# 1 / 6 / 8: PSPI + unsupported priority claim on secondary public surfaces.
for path in [
    "tools/wpa-digital-pavilion/virtual-tour.html",
    "tools/wpa-digital-pavilion/institute-passport.html",
    "institute/index/components/wpa-identity-embeddable.html",
]:
    patch(path, [
        ("Protocol State Performance Index", "WPA Protocol Soft Power Index"),
        ("Еден од првите специјализирани институти што го третира протоколот како <em>мерлива институционална дисциплина</em> — со објавени инструменти, транспарентна методологија и право на исправка.",
         "Специјализирана WPA институтска рамка што го третира протоколот како <em>мерлива институционална дисциплина</em> — со објавени инструменти, транспарентна методологија и право на исправка."),
        ("One of the first specialised institutes to treat protocol as a measurable institutional discipline — with published instruments, transparent methodology and a right of correction.",
         "A specialised WPA institute framework treating protocol as a measurable institutional discipline — with published instruments, transparent methodology and a right of correction."),
    ])

# 5: remove stale bibliography fallback / hero contradiction.
patch("bibliography/index.html", [
    ("◆ 15 WPA Zenodo DOI Records · 12 Working Papers + 3 Protocol Notes",
     "◆ 23 WPA Zenodo Records · 13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan"),
])

# 9: no absolute zero-hallucination wording on homepage.
patch("index.html", [
    ("Строго фактографски модул за знамиња, химни, грбови и протоколарни симболи. Zero hallucination политика.",
     "Строго фактографски модул за знамиња, химни, грбови и протоколарни симболи. Zero-hallucination target and verification standard — not an absolute guarantee."),
    ("https://www.tiktok.com/@world.protocol.academy?_r=1&amp;_t=ZS-93zc3YLmvG1",
     "https://www.tiktok.com/@world.protocol.academy"),
])

# 3 / 20: certification metadata must inherit development/demo grammar too.
patch("certification.html", [
    ("World Protocol Academy certification system — четири професионални non-degree сертификати, assessment rubrics, score bands, serial ID, QR verification и WPA Card поврзување.",
     "World Protocol Academy certification development/demo architecture — four planned non-degree certificate pathways, assessment rubrics, score bands, test serial IDs, demo QR verification and WPA Card integration concept; no official issuance is currently active."),
    ("Четири WPA професионални non-degree сертификати со assessment rubrics, score bands, serial ID, QR verification и WPA Card поврзување.",
     "Четири WPA non-degree certificate pathways во развој со assessment rubrics, score bands, test serial IDs и demo QR verification; официјално издавање не е активно."),
    ("Четири професионални WPA non-degree сертификати со assessment rubrics, score bands, serial ID, QR verification и WPA Card поврзување.",
     "Четири WPA non-degree certificate pathways во развој со assessment rubrics, score bands, test serial IDs и demo QR verification; официјално издавање не е активно."),
])

# 9 / 10: preserve the old Protocol Symbols pilot page as a clearly marked legacy reference,
# while pointing users to the current 197-entity public module.
patch("protocol-symbols/index.html", [
    ("<title>WPA Protocol Symbols Lab | World Protocol Academy</title>",
     "<title>WPA Protocol Symbols Lab · Legacy Pilot Reference | World Protocol Academy</title>\n    <meta name=\"robots\" content=\"noindex,follow\" />"),
    ("<link rel=\"canonical\" href=\"https://worldprotocolacademy.mk/protocol-symbols/\" />",
     "<link rel=\"canonical\" href=\"https://worldprotocolacademy.mk/wpaws/protocol-symbols/\" />"),
    ("<h1>🏛️ WPA Protocol Symbols Lab</h1>",
     "<h1>🏛️ WPA Protocol Symbols Lab · Legacy Pilot Reference</h1>"),
    ("3 извори (UN + CIA Factbook + државен сајт) | Zero hallucination политика",
     "Legacy three-source pilot methodology (UN + CIA Factbook + state official source) | verification target, not an absolute guarantee"),
    ("<strong>✅ Статус:</strong> 5/53 верифицирани записи<br>\n        <strong>📅 Последно ажурирање:</strong> Мај 2026<br>\n        <strong>🎯 Цел:</strong> Сите 53 држави до Q3 2026",
     "<strong>ℹ️ Legacy status:</strong> historical 5/53 pilot snapshot from May 2026<br>\n        <strong>✅ Current public module:</strong> 197 records · 95 sovereign states · 9 territories/other entities<br>\n        <strong>➡️ Canonical surface:</strong> <a href=\"https://worldprotocolacademy.mk/wpaws/protocol-symbols/\">WPA Protocol Symbols knowledge module</a>"),
])

# 9: preserve methodology as a historical methodology document, but remove absolute guarantee language
# and legacy public title drift.
patch("protocol-symbols/methodology.md", [
    ("## WPA Protocol Symbols Lab — Zero Hallucination Standard",
     "## WPA Protocol Symbols Lab — Source Verification Standard"),
    ("**Director:** Assoc. Prof. Dr. Sande Smiljanov",
     "**Director:** Doc. Dr Sande Smiljanov"),
    ("Its public credibility rests on a single non-negotiable commitment: **zero hallucination**.",
     "Its public credibility rests on a strict **zero-hallucination target and verification standard — not an absolute guarantee**."),
    ("This is the **zero-hallucination guarantee** in action — every uncertainty is **named**, not buried.",
     "This demonstrates the **zero-hallucination target and verification standard** in practice — every identified uncertainty is **named**, not buried."),
])

# Assertions for the X10 public lock. Historical patch scripts are intentionally out of scope.
public_files = [
    "protocolometry-center.html",
    "index.html",
    "institute.html",
    "bibliography/index.html",
    "certification.html",
    "wpa-services.html",
    "wpaws/protocol-symbols/index.html",
    "tools/wpa-digital-pavilion/virtual-tour.html",
    "tools/wpa-digital-pavilion/institute-passport.html",
    "institute/index/components/wpa-identity-embeddable.html",
    "protocol-symbols/index.html",
]
joined = "\n".join((ROOT / p).read_text(encoding="utf-8") for p in public_files)
assert "Protocol State Performance Index" not in joined
assert "One of the first specialised institutes" not in joined
assert "12 Working Papers + 3 Protocol Notes" not in (ROOT / "bibliography/index.html").read_text(encoding="utf-8")
assert "Zero hallucination политика" not in (ROOT / "index.html").read_text(encoding="utf-8")
assert "5/53 верифицирани записи" not in (ROOT / "protocol-symbols/index.html").read_text(encoding="utf-8")
assert "WPA Protocol Soft Power Index" in (ROOT / "protocolometry-center.html").read_text(encoding="utf-8")
assert "13 Working Papers + 9 Protocol Notes + 1 Global Strategic Plan = 23" in (ROOT / "bibliography/index.html").read_text(encoding="utf-8")
assert "Официјално издавање сè уште не е активно" in (ROOT / "certification.html").read_text(encoding="utf-8")
assert "INACTIVE / FROZEN" in (ROOT / "wpa-services.html").read_text(encoding="utf-8")
assert "Commercial preview</strong><span>currently inactive" in (ROOT / "wpaws/protocol-symbols/index.html").read_text(encoding="utf-8")
print("WPA X10 FINAL PUBLIC LOCK: PASS")

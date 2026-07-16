from pathlib import Path

path = Path("premium-reference-2026.html")
text = path.read_text(encoding="utf-8")

old = "mailto:worldprotocolacademy@gmail.com?subject=WPA%20Premium%20Reference%202026%20%E2%80%94%20Purchase%20Access"
new = "https://worldprotocol.gumroad.com/l/ntpmgc?wanted=true"

if old not in text:
    raise SystemExit("Expected purchase mailto link not found")

text = text.replace(old, new)
text = text.replace("Побарај пристап · €19", "Купи го пакетот · €19")
text = text.replace(">Побарај пристап</a>", ">Купи го пакетот</a>")

path.write_text(text, encoding="utf-8")
print("Updated Gumroad purchase links in premium-reference-2026.html")

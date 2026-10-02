from pathlib import Path

path = Path("premium-reference-2026.html")
text = path.read_text(encoding="utf-8")
gumroad = "https://worldprotocol.gumroad.com/l/ntpmgc?wanted=true"

# Idempotent safety sync: preserve the restored Premium page and ensure its
# State Symbols purchase links point to the canonical Gumroad product URL.
legacy_mailto = "mailto:worldprotocolacademy@gmail.com?subject=WPA%20Premium%20Reference%202026%20%E2%80%94%20Purchase%20Access"
text = text.replace(legacy_mailto, gumroad)

if gumroad not in text:
    raise SystemExit("Canonical Gumroad product URL is missing from Premium Reference page")

path.write_text(text, encoding="utf-8")
print("Verified canonical Gumroad link in premium-reference-2026.html")

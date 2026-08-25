from pathlib import Path
import re

path = Path("index.html")
text = path.read_text(encoding="utf-8")

pattern = re.compile(
    r'<div class="footer-col">\s*'
    r'<h5 data-i18n="ftContact">Контакт</h5>\s*'
    r'<ul style="display:grid;gap:8px">.*?</ul>\s*'
    r'(?P<address><div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba\(255,255,255,\.07\)">.*?</div>)\s*'
    r'</div>',
    re.S,
)

matches = list(pattern.finditer(text))
if len(matches) != 1:
    raise SystemExit(f"FAIL-CLOSED: expected exactly 1 contact footer block, found {len(matches)}")

address_block = matches[0].group("address")
replacement = '''<div class="footer-col">
  <h5 data-i18n="ftContact">Контакт</h5>
  <ul style="display:grid;gap:8px">
    <li id="wpaProfessionalContactList">
      <a href="mailto:info@worldprotocolacademy.mk" style="font-size:13px;color:rgba(255,255,255,.52)">Општи информации · General information: info@worldprotocolacademy.mk</a>
    </li>
    <li>
      <a href="mailto:contact@worldprotocolacademy.mk" style="font-size:13px;color:rgba(255,255,255,.52)">Општа комуникација · General contact: contact@worldprotocolacademy.mk</a>
    </li>
    <li>
      <a href="mailto:office@worldprotocolacademy.mk" style="font-size:13px;color:rgba(255,255,255,.52)">Администрација · Administration: office@worldprotocolacademy.mk</a>
    </li>
    <li>
      <a href="mailto:institute@worldprotocolacademy.mk" style="font-size:13px;color:rgba(255,255,255,.52)">WPA Institute: institute@worldprotocolacademy.mk</a>
    </li>
    <li>
      <a href="mailto:journal@worldprotocolacademy.mk" style="font-size:13px;color:rgba(255,255,255,.52)">WPA Journal: journal@worldprotocolacademy.mk</a>
    </li>
    <li>
      <a href="mailto:sande@worldprotocolacademy.mk" style="font-size:13px;color:rgba(255,255,255,.52)">Доц. д-р Санде Смиљанов · Author: sande@worldprotocolacademy.mk</a>
    </li>
    <li>
      <a href="mailto:sande@wpa.mk" style="font-size:13px;color:rgba(255,255,255,.52)">Директна WPA адреса · WPA direct: sande@wpa.mk</a>
    </li>
    <li>
      <a href="https://worldprotocolacademy.mk/privacy.html" style="font-size:13px;color:rgba(255,255,255,.52)" data-i18n="a_footer.27">Privacy Policy</a>
    </li>
    <li>
      <a href="https://worldprotocolacademy.mk/rights-takedown.html" style="font-size:13px;color:rgba(255,255,255,.52)" data-i18n="a_footer.28">Rights &amp; Takedown</a>
    </li>
  </ul>

  ''' + address_block + '''
</div>'''

text, count = pattern.subn(lambda _: replacement, text, count=1)
if count != 1:
    raise SystemExit(f"FAIL-CLOSED: contact replacement count was {count}")

old_date = "Последно ажурирано: 10 август 2026 · Last updated: 10 August 2026"
new_date = "Последно ажурирано: 25 август 2026 · Last updated: 25 August 2026"
if text.count(old_date) != 1:
    raise SystemExit(f"FAIL-CLOSED: expected exactly 1 old update date, found {text.count(old_date)}")
text = text.replace(old_date, new_date, 1)

required = [
    'id="wpaProfessionalContactList"',
    'mailto:info@worldprotocolacademy.mk',
    'mailto:sande@worldprotocolacademy.mk',
    'mailto:sande@wpa.mk',
    new_date,
]
for marker in required:
    if marker not in text:
        raise SystemExit(f"FAIL-CLOSED: missing required marker: {marker}")

path.write_text(text, encoding="utf-8")
print("Static contact footer patched and verified.")

from pathlib import Path

ROOT = Path('journal')
JOURNAL = 'journal@worldprotocolacademy.mk'
EDITOR = 'editor@worldprotocolacademy.mk'
OLD_EN = 'Negotiation is optional. Protocol is absolute.'
NEW_EN = 'WPA Journal · Evidence · Peer Review · Human Editorial Responsibility'

html_files = sorted(p for p in ROOT.glob('*.html') if p.is_file())
if not html_files:
    raise SystemExit('FAIL-CLOSED: no canonical top-level Journal HTML files found')

plain_duplicate = (
    f'<a href="mailto:{JOURNAL}">{JOURNAL}</a>\n'
    f'      <a href="mailto:{JOURNAL}">{JOURNAL}</a>'
)
role_contacts = (
    f'<a href="mailto:{JOURNAL}">WPA Journal · {JOURNAL}</a>\n'
    f'      <a href="mailto:{EDITOR}">Editor-in-Chief · {EDITOR}</a>'
)

changed = []
contact_fixes = 0
en_fixes = 0

for path in html_files:
    text = path.read_text(encoding='utf-8')
    original = text

    n = text.count(plain_duplicate)
    if n:
        text = text.replace(plain_duplicate, role_contacts)
        contact_fixes += n

    n = text.count(OLD_EN)
    if n:
        text = text.replace(OLD_EN, NEW_EN)
        en_fixes += n

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(str(path))

if not changed:
    raise SystemExit('FAIL-CLOSED: no corrective Journal changes were required')
if contact_fixes < 1:
    raise SystemExit('FAIL-CLOSED: expected at least one duplicate Journal footer contact block')
if en_fixes < 1:
    raise SystemExit('FAIL-CLOSED: expected at least one remaining English absolute motto')

# Verify canonical top-level public HTML.
for path in html_files:
    text = path.read_text(encoding='utf-8')
    if plain_duplicate in text:
        raise SystemExit(f'FAIL-CLOSED: duplicate generic Journal footer remains in {path}')
    if OLD_EN in text:
        raise SystemExit(f'FAIL-CLOSED: English absolute motto remains in {path}')

print(f'Journal correction verified: {contact_fixes} duplicate contact blocks fixed, {en_fixes} English motto occurrences removed across {len(changed)} files.')
for item in changed:
    print(item)

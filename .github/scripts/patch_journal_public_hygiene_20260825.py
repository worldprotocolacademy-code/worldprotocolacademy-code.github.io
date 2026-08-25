from pathlib import Path

ROOT = Path('journal')
OLD_GMAIL = 'worldprotocolacademy@gmail.com'
OLD_OUTLOOK = 'worldprotocolacademy@outlook.com'
JOURNAL = 'journal@worldprotocolacademy.mk'
OLD_MOTTO = '„Преговарањето е опционално. Протоколот е апсолутен."'
OLD_MOTTO_ALT = '„Преговарањето е опционално. Протоколот е апсолутен.“'
NEW_LINE = 'WPA Journal · Evidence · Peer Review · Human Editorial Responsibility'

# Canonical top-level public Journal HTML only. Nested /journal/journal is legacy/duplicate and is intentionally untouched.
html_files = sorted(p for p in ROOT.glob('*.html') if p.is_file())
if not html_files:
    raise SystemExit('FAIL-CLOSED: no canonical journal HTML files found')

changed = []
replaced_emails = 0
replaced_mottos = 0

for path in html_files:
    text = path.read_text(encoding='utf-8')
    original = text

    # Generic Journal contact. Role-specific direct editor routing remains handled separately by the professional contact layer.
    for old in (OLD_GMAIL, OLD_OUTLOOK):
        count = text.count(old)
        if count:
            replaced_emails += count
            text = text.replace(old, JOURNAL)

    # Remove the over-absolute public slogan without creating a new doctrine.
    for old in (OLD_MOTTO, OLD_MOTTO_ALT):
        count = text.count(old)
        if count:
            replaced_mottos += count
            text = text.replace(old, NEW_LINE)

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(str(path))

# Public JS header comment may also repeat the old slogan; clean only the comment, not application logic.
js = ROOT / 'assets' / 'journal.js'
if not js.exists():
    raise SystemExit('FAIL-CLOSED: canonical journal/assets/journal.js missing')
js_text = js.read_text(encoding='utf-8')
js_original = js_text
js_text = js_text.replace(' * Doctrine: „Преговарањето е опционално. Протоколот е апсолутен."',
                          ' * Editorial principle: evidence discipline and human editorial responsibility.')
js_text = js_text.replace(' * Doctrine: „Преговарањето е опционално. Протоколот е апсолутен.“',
                          ' * Editorial principle: evidence discipline and human editorial responsibility.')
if js_text != js_original:
    js.write_text(js_text, encoding='utf-8')
    changed.append(str(js))

if not changed:
    raise SystemExit('FAIL-CLOSED: no canonical public Journal files required changes')
if replaced_emails < 2:
    raise SystemExit(f'FAIL-CLOSED: expected multiple stale public email occurrences, found {replaced_emails}')
if replaced_mottos < 1:
    raise SystemExit(f'FAIL-CLOSED: expected at least one public absolute motto, found {replaced_mottos}')

# Verification: canonical top-level public HTML must contain no stale generic addresses or absolute motto.
for path in html_files:
    text = path.read_text(encoding='utf-8')
    for forbidden in (OLD_GMAIL, OLD_OUTLOOK, OLD_MOTTO, OLD_MOTTO_ALT):
        if forbidden in text:
            raise SystemExit(f'FAIL-CLOSED: stale marker remains in {path}: {forbidden}')

print(f'Journal public hygiene verified: {len(changed)} files changed; {replaced_emails} stale email occurrences and {replaced_mottos} motto occurrences replaced.')
for item in changed:
    print(item)

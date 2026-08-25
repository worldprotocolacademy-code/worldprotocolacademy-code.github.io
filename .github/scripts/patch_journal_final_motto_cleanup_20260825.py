from pathlib import Path
import re

ROOT = Path('journal')
MK_PHRASE = 'Преговарањето е опционално. Протоколот е апсолутен.'
EN_PHRASE = 'Negotiation is optional. Protocol is absolute.'
MK_NEUTRAL = 'WPA Journal · Докази · Рецензија · Човечка уредничка одговорност'
EN_NEUTRAL = 'WPA Journal · Evidence · Peer Review · Human Editorial Responsibility'

html_files = sorted(p for p in ROOT.glob('*.html') if p.is_file())
if not html_files:
    raise SystemExit('FAIL-CLOSED: no canonical top-level Journal HTML files found')

changed = []
mk_fixes = 0
en_fixes = 0
label_fixes = 0

for path in html_files:
    text = path.read_text(encoding='utf-8')
    original = text

    mk_fixes += text.count(MK_PHRASE)
    en_fixes += text.count(EN_PHRASE)
    text = text.replace(MK_PHRASE, MK_NEUTRAL)
    text = text.replace(EN_PHRASE, EN_NEUTRAL)

    # The absolute slogan is no longer doctrine; normalize only labels attached to the new neutral line.
    replacements = {
        f'Доктрина: {EN_NEUTRAL}': f'Уреднички принцип: {MK_NEUTRAL}',
        f'Doctrine: “{EN_NEUTRAL}”': f'Editorial principle: “{EN_NEUTRAL}”',
        f'Doctrine: {EN_NEUTRAL}': f'Editorial principle: {EN_NEUTRAL}',
        f'data-mk="Доктрина: {EN_NEUTRAL}"': f'data-mk="Уреднички принцип: {MK_NEUTRAL}"',
        f'data-en="Doctrine: “{EN_NEUTRAL}”"': f'data-en="Editorial principle: “{EN_NEUTRAL}”"',
    }
    for old, new in replacements.items():
        n = text.count(old)
        if n:
            label_fixes += n
            text = text.replace(old, new)

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(str(path))

if mk_fixes < 1:
    raise SystemExit('FAIL-CLOSED: expected at least one remaining Macedonian absolute motto variant')

for path in html_files:
    text = path.read_text(encoding='utf-8')
    if MK_PHRASE in text or EN_PHRASE in text:
        raise SystemExit(f'FAIL-CLOSED: absolute motto remains in canonical Journal HTML: {path}')

print(f'Final Journal motto cleanup verified: MK={mk_fixes}, EN={en_fixes}, labels={label_fixes}, files={len(changed)}')
for item in changed:
    print(item)

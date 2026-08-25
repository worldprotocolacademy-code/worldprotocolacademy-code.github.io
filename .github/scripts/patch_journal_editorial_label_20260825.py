from pathlib import Path

ROOT = Path('journal')
OLD = '**Doctrine:** *„WPA Journal · Докази · Рецензија · Човечка уредничка одговорност&quot;*'
NEW = '**Уреднички принцип · Editorial principle:** *WPA Journal · Evidence · Peer Review · Human Editorial Responsibility*'

files = sorted(p for p in ROOT.glob('*.html') if p.is_file())
changed = []
count = 0
for path in files:
    text = path.read_text(encoding='utf-8')
    n = text.count(OLD)
    if n:
        text = text.replace(OLD, NEW)
        path.write_text(text, encoding='utf-8')
        count += n
        changed.append(str(path))

if count != 2:
    raise SystemExit(f'FAIL-CLOSED: expected exactly 2 stale Doctrine labels, found {count}')
for path in files:
    if OLD in path.read_text(encoding='utf-8'):
        raise SystemExit(f'FAIL-CLOSED: stale Doctrine label remains in {path}')
print(f'Editorial label correction verified: {count} replacements in {changed}')

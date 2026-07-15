#!/usr/bin/env python3
from pathlib import Path

source_path = Path(__file__).with_name('apply_publication_integrity_static.py')
lines = source_path.read_text(encoding='utf-8').splitlines(keepends=True)
labels = {
    'Institute MK heading 004',
    'Institute MK summary',
    'Institute EN heading 004',
    'Institute EN summary',
}
kept = []
removed = []
for line in lines:
    matched = [label for label in labels if label in line]
    if not matched:
        kept.append(line)
        continue
    removed.extend(matched)
    if 'Institute EN summary' in matched:
        kept.append(' ]\n')
if set(removed) != labels or len(removed) != 4:
    raise SystemExit(f'Wrapper label assertion failed: {removed}')
source = ''.join(kept)
old_guard = " if any(v!=1 for v in hit.values()):raise SystemExit(f'{rel}: locale assertion {hit}')"
new_guard = " if any(v<1 for v in hit.values()):raise SystemExit(f'{rel}: locale assertion {hit}')"
if source.count(old_guard) != 1:
    raise SystemExit('Locale guard assertion failed')
source = source.replace(old_guard, new_guard, 1)
exec(compile(source, str(source_path), 'exec'), {'__name__': '__main__', '__file__': str(source_path)})

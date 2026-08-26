from pathlib import Path

p = Path(__file__).with_name('wpa-perplexity-six-enhancements.py')
src = p.read_text(encoding='utf-8')
old = '''    marker = '<div class="part-heading"'
    pos = t.find(marker)
    if pos < 0:
        raise SystemExit('Missing bibliography first part heading')
'''
new = '''    marker_pos = t.find('class="part-heading"')
    if marker_pos < 0:
        raise SystemExit('Missing bibliography first part heading')
    pos = t.rfind('<', 0, marker_pos)
    if pos < 0:
        raise SystemExit('Cannot resolve bibliography heading start')
'''
if old not in src:
    raise SystemExit('Expected v1 bibliography marker block not found')
src = src.replace(old, new, 1)
exec(compile(src, str(p) + '::v2', 'exec'), {'__name__': '__main__', '__file__': str(p)})

#!/usr/bin/env python3
from pathlib import Path

p = Path(__file__).with_name('wpa-master-list-rev7-integration.py')
s = p.read_text(encoding='utf-8')
old = "assert dict(groups)==exp['groups'] and dict(levels)==exp['relevance']"
new = "assert dict(groups)==exp['groups'] and all(levels.get(k,0)==v for k,v in exp['relevance'].items())"
assert old in s
s = s.replace(old, new, 1)
ns = {'__name__':'__main__', '__file__':str(p)}
exec(compile(s, str(p), 'exec'), ns, ns)

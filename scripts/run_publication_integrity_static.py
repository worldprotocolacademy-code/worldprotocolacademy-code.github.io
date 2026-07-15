#!/usr/bin/env python3
from pathlib import Path

source_path = Path(__file__).with_name('apply_publication_integrity_static.py')
source = source_path.read_text(encoding='utf-8')
obsolete_assertions = [
    "  ('WPA работни трудови 001–004','WPA работни трудови 001–012','Institute MK heading 004'),\n",
    "  ('Првите четири WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001, WP-002, WP-003 и WP-004.','Дванаесет WPA работни трудови се објавени како јавни Zenodo DOI записи: WP-001–WP-012.','Institute MK summary'),\n",
    "  ('WPA Working Papers 001–004','WPA Working Papers 001–012','Institute EN heading 004'),\n",
    "  ('The first four WPA Working Papers are published as public Zenodo DOI records: WP-001, WP-002, WP-003 and WP-004.','Twelve WPA Working Papers are published as public Zenodo DOI records: WP-001–WP-012. The WPA Zenodo corpus comprises 12 Working Papers and 2 published Protocol Notes, for 14 published WPA Zenodo DOI records; it is separate from the 25-publication academic corpus.','Institute EN summary')]
",
]
for assertion in obsolete_assertions:
    if assertion not in source:
        raise SystemExit('Wrapper assertion not found; refusing to alter patch execution')
    source = source.replace(assertion, '', 1)
exec(compile(source, str(source_path), 'exec'), {'__name__': '__main__', '__file__': str(source_path)})

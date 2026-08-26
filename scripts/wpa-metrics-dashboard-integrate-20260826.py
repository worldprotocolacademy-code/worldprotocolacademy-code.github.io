from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

# 1) Homepage: add one low-noise trust/status link inside Quick Start advanced links.
p = ROOT / 'index.html'
t = p.read_text(encoding='utf-8')
if '/wpa-metrics-status.html' not in t:
    marker = '<div class="wpa-advanced-entry-links"><a href="/wpaws/index.html">WPAWS</a>'
    repl = '<div class="wpa-advanced-entry-links"><a href="/wpa-metrics-status.html">Canonical Metrics & Status</a><a href="/wpaws/index.html">WPAWS</a>'
    if marker not in t:
        raise SystemExit('Homepage advanced-entry marker not found')
    t = t.replace(marker, repl, 1)
    p.write_text(t, encoding='utf-8')

# 2) Institute hero: add one canonical-status reference, not another content block.
p = ROOT / 'institute.html'
t = p.read_text(encoding='utf-8')
if 'href="wpa-metrics-status.html"' not in t and 'href="/wpa-metrics-status.html"' not in t:
    marker = '<div class="hero-cta" data-wpa-hero-actions="institute-20260826">\n<a class="btn btn-primary" href="#charter">Повелба / Charter →</a>'
    repl = '<div class="hero-cta" data-wpa-hero-actions="institute-20260826">\n<a class="btn btn-primary" href="/wpa-metrics-status.html">Metrics & Status →</a>\n<a class="btn btn-ghost" href="#charter">Повелба / Charter</a>'
    if marker not in t:
        raise SystemExit('Institute hero marker not found')
    t = t.replace(marker, repl, 1)
    p.write_text(t, encoding='utf-8')

# 3) Sitemap: canonical public dashboard.
p = ROOT / 'sitemap.xml'
t = p.read_text(encoding='utf-8')
url = '  <url><loc>https://worldprotocolacademy.mk/wpa-metrics-status.html</loc></url>\n'
if 'wpa-metrics-status.html' not in t:
    marker = '  <url><loc>https://worldprotocolacademy.mk/protocolometry-center.html</loc></url>\n'
    if marker not in t:
        raise SystemExit('Sitemap marker not found')
    t = t.replace(marker, marker + url, 1)
    p.write_text(t, encoding='utf-8')

# 4) Module registry: expose dashboard as governance reference.
p = ROOT / 'data/wpa-module-registry.json'
data = json.loads(p.read_text(encoding='utf-8'))
mods = data.setdefault('modules', [])
if not any(m.get('id') == 'canonical_metrics_status' for m in mods):
    mods.append({
        'id': 'canonical_metrics_status',
        'name': 'WPA Canonical Metrics & Status',
        'path': '/wpa-metrics-status.html',
        'machine_readable_source': '/data/wpa-canonical-metrics-status.json',
        'status': 'PUBLIC_CANONICAL_STATUS_REFERENCE',
        'updated': '2026-08-26'
    })
data['updated'] = '2026-08-26'
p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

print('WPA metrics dashboard integration complete')

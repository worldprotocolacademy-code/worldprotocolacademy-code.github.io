from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

# 1) Homepage: add one proof-of-value band immediately after Quick Start.
p = ROOT / 'index.html'
t = p.read_text(encoding='utf-8')
if 'data-wpa-stress-test="20260826"' not in t:
    marker = '''</section>\n\n\n<!-- ═══════════════════════════════════════════════════════\n     WPA — CENTRAL MATRIX-GUIDE BAND'''
    block = '''</section>\n\n<section data-wpa-stress-test="20260826" aria-label="WPA Protocol Stress-Test public demo" style="padding:48px 0;background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="container">
    <div style="display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:center;padding:28px;border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:var(--r2);box-shadow:var(--sh)">
      <div>
        <div class="section-label">Proof of value · Public demo</div>
        <h3 class="section-title" style="margin-bottom:12px">WPA Protocol Stress-Test · 3 минути</h3>
        <p class="section-lead" style="margin-bottom:18px">Три протоколарни нарушувања, три одлуки: предвремено пристигнување, погрешно поставено знаме и недостапен овластен толкувач. Демо-резултатот ја покажува WPA логиката за continuity, symbolic integrity и communication authority.</p>
        <a class="btn btn-gold" href="/wpa-protocol-stress-test.html">Започни го Stress-Test →</a>
      </div>
      <div style="padding:20px;background:var(--navy);color:#fff;border-radius:var(--r2)">
        <strong style="display:block;color:var(--goldl);margin-bottom:8px">Човекот одлучува. AI може да подготви.</strong>
        <p style="font-size:13px;line-height:1.65;color:rgba(255,255,255,.72);margin:0">No registration · No personal data · No certificate claim · Deterministic educational demo · Human responsibility remains final.</p>
      </div>
    </div>
  </div>
</section>\n\n<!-- ═══════════════════════════════════════════════════════\n     WPA — CENTRAL MATRIX-GUIDE BAND'''
    if marker not in t:
        raise SystemExit('Homepage integration marker not found')
    t = t.replace(marker, block, 1)
    p.write_text(t, encoding='utf-8')

# 2) Sitemap: public, canonical, indexable demo.
p = ROOT / 'sitemap.xml'
t = p.read_text(encoding='utf-8')
url = '  <url><loc>https://worldprotocolacademy.mk/wpa-protocol-stress-test.html</loc></url>\n'
if 'wpa-protocol-stress-test.html' not in t:
    marker = '  <url><loc>https://worldprotocolacademy.mk/protocolometry-center.html</loc></url>\n'
    if marker not in t:
        raise SystemExit('Sitemap marker not found')
    t = t.replace(marker, marker + url, 1)
    p.write_text(t, encoding='utf-8')

# 3) Machine-readable registry: clear public-demo status; no authority/certification implication.
p = ROOT / 'data/wpa-module-registry.json'
data = json.loads(p.read_text(encoding='utf-8'))
mods = data.setdefault('modules', [])
if not any(m.get('id') == 'protocol_stress_test' for m in mods):
    mods.append({
        'id': 'protocol_stress_test',
        'name': 'WPA Protocol Stress-Test',
        'path': '/wpa-protocol-stress-test.html',
        'status': 'PUBLIC_DETERMINISTIC_EDUCATIONAL_DEMO',
        'version': '1.0',
        'registration_required': False,
        'personal_data_requested': False,
        'certificate_issued': False,
        'live_ai_assessment': False,
        'human_authority_unchanged': True
    })
data['updated'] = '2026-08-26'
p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

print('WPA Stress-Test integration complete')

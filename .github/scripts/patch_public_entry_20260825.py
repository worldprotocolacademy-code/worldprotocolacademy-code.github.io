from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')
original = text

# 1. Static CSS/JS hooks: exactly once.
head_marker = '</head>'
if text.count(head_marker) != 1:
    raise SystemExit(f'FAIL-CLOSED: expected one </head>, found {text.count(head_marker)}')

css_tag = '<link rel="stylesheet" href="/wpa-public-entry-layer.css?v=1.0" id="wpa-public-entry-layer-css">'
js_tag = '<script defer src="/scripts/wpa-public-entry-layer.js?v=1.0" id="wpa-public-entry-layer-js"></script>'
if css_tag not in text:
    text = text.replace(head_marker, css_tag + '\n' + js_tag + '\n' + head_marker, 1)
elif js_tag not in text:
    text = text.replace(css_tag, css_tag + '\n' + js_tag, 1)

# 2. Replace only the homepage hero action block.
hero_actions_re = re.compile(r'<div class="hero-actions">.*?</div>\s*<div class="hero-rule">', re.S)
hero_matches = list(hero_actions_re.finditer(text))
if len(hero_matches) != 1:
    raise SystemExit(f'FAIL-CLOSED: expected exactly one hero-actions block, found {len(hero_matches)}')

hero_replacement = '''<div class="hero-actions wpa-public-entry-actions" data-wpa-entry-v1="true">
        <a href="#wpa-quick-start-learn" class="btn btn-gold">Учење · Learn</a>
        <a href="#wpa-quick-start-research" class="btn btn-gold">Истражување · Research</a>
        <a href="#wpa-quick-start-institutional" class="btn btn-gold">Институционално · Institutional</a>
      </div>
      <a class="wpa-hero-signature-link" href="/protocolometry-center.html">📐 Protocolometry Center · методолошки центар</a>
      <div class="hero-rule">'''
text = hero_actions_re.sub(hero_replacement, text, count=1)

# 3. Correct visible publication count in hero only.
old_stat = '<div><div class="stat-num">25</div><div class="stat-label" data-i18n="a_hero.4">Публикации</div></div>'
new_stat = '<div><div class="stat-num">26</div><div class="stat-label" data-i18n="a_hero.4">Публикации</div></div>'
if text.count(old_stat) != 1:
    raise SystemExit(f'FAIL-CLOSED: expected one old publication stat, found {text.count(old_stat)}')
text = text.replace(old_stat, new_stat, 1)

# 4. Correct one duplicated editorial phrase.
doubled = 'со 25+ години институционално искуство со 25+ години институционално искуство'
if text.count(doubled) != 1:
    raise SystemExit(f'FAIL-CLOSED: expected one duplicated experience phrase, found {text.count(doubled)}')
text = text.replace(doubled, 'со 25+ години институционално искуство', 1)

# 5. Insert a static Quick Start layer immediately after the hero.
quick_start = '''

<section id="wpa-quick-start" aria-label="WPA Quick Start">
  <div class="container">
    <div class="wpa-quick-start-head">
      <span class="wpa-quick-start-kicker">WPA Quick Start · Брз почеток</span>
      <h3>Три јасни патеки низ WPA</h3>
      <p>Изберете според вашата цел. Целосната академска, техничка и институционална архитектура останува достапна под овие јавни влезови.</p>
    </div>
    <div class="wpa-quick-start-grid">
      <article class="wpa-entry-card" id="wpa-quick-start-learn">
        <h4>Учење · Learn</h4>
        <p>Програми, професионален развој и транспарентна сертификациска рамка.</p>
        <div class="wpa-entry-links"><a href="/programmes.html">Програми</a><a href="/certification.html">Сертификација</a><a href="/student-desk/">Студентско биро</a></div>
      </article>
      <article class="wpa-entry-card" id="wpa-quick-start-research">
        <h4>Истражување · Research</h4>
        <p>Публикации, Протоколометрија, академско пребарување и WPA Journal.</p>
        <div class="wpa-entry-links"><a href="/protocolometry-center.html">Протоколометрија</a><a href="/papers.html">Публикации</a><a href="/journal/">WPA Journal</a><a href="/tools/academic-search-hub/">Academic Search Hub</a></div>
      </article>
      <article class="wpa-entry-card" id="wpa-quick-start-institutional">
        <h4>Институционално · Institutional</h4>
        <p>Услуги и материјали за институции, дипломатски средини, академии и професионални тимови.</p>
        <div class="wpa-entry-links"><a href="/wpa-services.html">Институционални услуги</a><a href="/wpa-briefings.html">Кратки стручни извештаи</a><a href="/wpa-one-page-service-profile.html">Институционален профил</a><a href="/partnerships/">Партнерства</a></div>
      </article>
    </div>
    <details class="wpa-advanced-entry">
      <summary>Напредна WPA технологија · Advanced WPA Technology</summary>
      <div class="wpa-advanced-entry-links"><a href="/wpaws/index.html">WPAWS</a><a href="#ai">Virtual Sande</a><a href="/tools/wpa-five-engines.html">WPA Five Engines</a><a href="/data/wpa-human-governed-agentic-institution-model.json">HGAIM</a><a href="/data/wpa-institutional-operating-architecture.json">Technical Architecture</a></div>
    </details>
  </div>
</section>
'''

if 'id="wpa-quick-start"' not in text:
    hero_section_re = re.compile(r'(<section class="hero">.*?</section>)', re.S)
    matches = list(hero_section_re.finditer(text))
    if len(matches) != 1:
        raise SystemExit(f'FAIL-CLOSED: expected exactly one hero section, found {len(matches)}')
    text = hero_section_re.sub(lambda m: m.group(1) + quick_start, text, count=1)

# 6. Verification.
required = [
    'id="wpa-quick-start"',
    'Учење · Learn',
    'Истражување · Research',
    'Институционално · Institutional',
    'Advanced WPA Technology',
    '>26</div><div class="stat-label" data-i18n="a_hero.4">Публикации',
    '/scripts/wpa-public-entry-layer.js?v=1.0',
    '/wpa-public-entry-layer.css?v=1.0',
]
for marker in required:
    if marker not in text:
        raise SystemExit(f'FAIL-CLOSED: missing required marker: {marker}')

for forbidden in [doubled]:
    if forbidden in text:
        raise SystemExit(f'FAIL-CLOSED: forbidden stale marker remains: {forbidden}')

if text == original:
    raise SystemExit('FAIL-CLOSED: patch produced no change')

path.write_text(text, encoding='utf-8')
print('WPA Public Entry Layer patch verified.')

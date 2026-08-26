from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing expected marker for {label}')
    return text.replace(old, new, 1)


# 1) BRAND ARCHITECTURE
brand = r'''<!doctype html>
<html lang="mk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="WPA Brand Architecture — canonical public map of World Protocol Academy, the Institute, programmes, research, labs, journal, AI systems and partner-facing layers.">
<link rel="canonical" href="https://worldprotocolacademy.mk/brand-architecture.html">
<title>WPA Brand Architecture · World Protocol Academy</title>
<style>
:root{--navy:#0d1f3c;--navy2:#162947;--gold:#c9a84c;--goldl:#ead99f;--cream:#f8f4ee;--white:#fff;--text:#1a1a2e;--muted:#5a6677;--line:#d8cdb8;--max:1120px}*{box-sizing:border-box}body{margin:0;font:16px/1.65 system-ui,-apple-system,Segoe UI,Arial,sans-serif;background:var(--cream);color:var(--text)}a{color:inherit}.wrap{width:min(var(--max),calc(100% - 36px));margin:auto}.top{background:var(--navy);color:#fff;padding:14px 0;border-bottom:1px solid var(--gold)}.top .wrap{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}.top a{color:var(--goldl);text-decoration:none}.hero{background:linear-gradient(135deg,#071326,var(--navy2));color:#fff;padding:72px 0 56px}.eyebrow{color:var(--goldl);text-transform:uppercase;letter-spacing:.13em;font-size:12px;font-weight:800}.hero h1{font-family:Georgia,serif;font-size:clamp(38px,6vw,64px);line-height:1.02;margin:12px 0}.hero p{max-width:840px;color:rgba(255,255,255,.78);font-size:18px}.lock{margin-top:22px;padding:15px 18px;border-left:3px solid var(--gold);background:rgba(255,255,255,.06)}main{padding:54px 0 72px}.section{margin:0 0 42px}.section h2{font-family:Georgia,serif;color:var(--navy);font-size:32px;margin:0 0 10px}.section>p{color:var(--muted);max-width:900px}.map{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:22px}.card{background:var(--white);border:1px solid var(--line);border-top:4px solid var(--gold);padding:22px;border-radius:12px;box-shadow:0 8px 28px rgba(13,31,60,.07)}.card h3{margin:0 0 8px;color:var(--navy);font-family:Georgia,serif}.card p{margin:0;color:var(--muted)}.status{display:inline-block;margin-top:12px;padding:5px 9px;border-radius:999px;background:#eef2f6;color:var(--navy);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.flow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:20px}.node{background:var(--navy);color:#fff;border:1px solid var(--gold);padding:10px 14px;border-radius:8px;font-weight:800}.arrow{color:var(--gold);font-weight:900}.rules{background:#fff;border:1px solid var(--line);padding:22px;border-radius:12px}.rules li{margin:8px 0}.footer{background:var(--navy);color:rgba(255,255,255,.68);padding:28px 0}.footer strong{color:var(--goldl)}@media(max-width:820px){.map{grid-template-columns:1fr}.hero{padding:56px 0 44px}}
</style>
<script defer src="/scripts/wpa-performance.js?v=1.0"></script>
</head>
<body>
<header class="top"><div class="wrap"><strong>World Protocol Academy · WPA</strong><nav><a href="/">Home</a> · <a href="/institute.html">Institute</a> · <a href="/bibliography/">Bibliography</a></nav></div></header>
<section class="hero"><div class="wrap"><div class="eyebrow">Canonical public identity map · 2026</div><h1>WPA Brand Architecture</h1><p>Една јасна мапа за тоа што е World Protocol Academy, што е Институтот, кои се програмските и истражувачките слоеви, што се WPA Labs и AI systems, и како се третираат партнерските и проектните иницијативи.</p><div class="lock"><strong>Canonical rule:</strong> WPA is an independent digital educational, research and authorial platform in development/testing/pilot phase. It is not a university, governmental institution, accreditation body or degree-granting institution.</div></div></section>
<main><div class="wrap">
<section class="section"><h2>1 · Core architecture</h2><p>WPA е главниот јавен идентитет и системски чадор. Институтот е специјализиран академско-истражувачки и програмски слој; останатите единици се програми, истражувачки серии, лаборатории, медиумски/AI системи или проектни слоеви — не посебни акредитирани институции.</p><div class="flow"><span class="node">World Protocol Academy</span><span class="arrow">→</span><span class="node">WPA Institute</span><span class="arrow">→</span><span class="node">Programmes · Research · Labs · Journal · AI</span></div></section>
<section class="section"><h2>2 · Public layers</h2><div class="map">
<article class="card"><h3>World Protocol Academy</h3><p>Главна образовна, истражувачка, авторска и институционално-комуникациска платформа; носител на јавниот WPA идентитет и канон.</p><span class="status">Core platform</span></article>
<article class="card"><h3>WPA Institute</h3><p>Специјализиран истражувачки и програмски слој за протокол, дипломатија, јавна комуникација, безбедносни студии, Protocolometry и public-source analysis.</p><span class="status">Institute layer</span></article>
<article class="card"><h3>Programmes & Certification</h3><p>Структурирани професионални learning pathways. Certification architecture remains in development/demo; no official issuance is currently active.</p><span class="status">Development / demo</span></article>
<article class="card"><h3>Research & Publications</h3><p>26-item academic bibliography plus the separate WPA Zenodo corpus: Working Papers, Protocol Notes and the Global Strategic Plan.</p><span class="status">Published research</span></article>
<article class="card"><h3>Journal</h3><p>Editorial and scholarly publishing architecture retained under its own journal policies. Financial activation remains inactive/frozen unless explicitly changed by future governance decision.</p><span class="status">Editorial layer</span></article>
<article class="card"><h3>WPA Labs</h3><p>Applied experimental modules such as Protocol Symbols, Audio Media Engine and Scenario Film Lab. A lab is a WPA functional module, not a separate legal or accreditation body.</p><span class="status">Applied labs</span></article>
<article class="card"><h3>Virtual Sande & AI Systems</h3><p>Human-governed educational and research assistance layer with source discipline, attribution logic, bounded agency and human review requirements.</p><span class="status">AI-assisted</span></article>
<article class="card"><h3>WPAWS & Analytical Tools</h3><p>Structured working systems for public-source evidence, institutional comparison, lessons learned and protocol analysis.</p><span class="status">Analytical systems</span></article>
<article class="card"><h3>Partner-facing initiatives</h3><p>Europa Prima, SEE a Paris and other named initiatives must be described according to their actual relationship: partner, programme, project, collaboration or external initiative — never by implication alone.</p><span class="status">Relationship-specific</span></article>
</div></section>
<section class="section"><h2>3 · Naming and representation rules</h2><div class="rules"><ul><li><strong>WPA</strong> is the umbrella public brand.</li><li><strong>Institute</strong> identifies the specialised research/programme layer within WPA.</li><li><strong>Lab / Engine / Hub / Centre</strong> identifies a functional module, not an independent accredited institution.</li><li><strong>Programme / pathway / certificate framework</strong> must preserve the currently applicable status label, including DEVELOPMENT/DEMO where relevant.</li><li><strong>Partner or collaboration language</strong> is used only when the underlying relationship is actually documented.</li><li><strong>Commercial activation</strong> remains INACTIVE/FROZEN across public surfaces until an explicit future governance/legal activation decision.</li></ul></div></section>
<section class="section"><h2>4 · One-sentence public explanation</h2><div class="rules"><p><strong>MK:</strong> World Protocol Academy е независна дигитална образовна, истражувачка и авторска платформа, во која Институтот, програмите, истражувачките серии, лабораториите и AI системите функционираат како јасно разграничени WPA слоеви.</p><p><strong>EN:</strong> World Protocol Academy is an independent digital educational, research and authorial platform in which the Institute, programmes, research series, labs and AI systems operate as clearly defined WPA layers.</p></div></section>
</div></main>
<footer class="footer"><div class="wrap"><strong>World Protocol Academy · Brand Architecture</strong><br>Controlled public identity reference · 26 August 2026</div></footer>
</body></html>
'''
write('brand-architecture.html', brand)

# Add Brand Architecture entry to Institute hero actions.
path = 'institute.html'
t = read(path)
if '/brand-architecture.html' not in t:
    t = replace_once(t,
        '<a class="btn btn-ghost" href="#charter">Повелба / Charter</a>',
        '<a class="btn btn-ghost" href="#charter">Повелба / Charter</a>\n<a class="btn btn-ghost" href="/brand-architecture.html">Brand Architecture</a>',
        'Institute Brand Architecture CTA')
    write(path, t)

# 2) BIBLIOGRAPHY EXPORTS: DOM-based BibTeX / RIS / CSV export.
path = 'bibliography/index.html'
t = read(path)
if 'Export BibTeX' not in t:
    export_css = r'''
/* ── ACADEMIC EXPORTS · controlled enhancement 2026-08-26 ── */
.bib-export-panel{background:#fff;border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:0 var(--r2) var(--r2) 0;padding:20px 22px;margin:0 0 30px;box-shadow:var(--sh)}
.bib-export-panel h3{font-family:var(--fp);color:var(--navy);font-size:19px;margin-bottom:5px}.bib-export-panel p{color:var(--muted);font-size:13px;margin-bottom:12px}.bib-export-actions{display:flex;gap:8px;flex-wrap:wrap}.bib-export-actions button{background:var(--navy);color:var(--goldl);border:1px solid var(--gold);border-radius:3px;padding:9px 13px;font:700 11px var(--fb);text-transform:uppercase;letter-spacing:.4px;cursor:pointer}
'''
    t = replace_once(t, '</style>', export_css + '\n</style>', 'bibliography export CSS')
    marker = '<div class="part-heading"'
    pos = t.find(marker)
    if pos < 0:
        raise SystemExit('Missing bibliography first part heading')
    panel = r'''<section class="bib-export-panel" id="academic-exports"><h3>Academic exports · Академски извоз</h3><p>Export the current public bibliography in BibTeX, RIS or CSV. The files are generated locally in the browser from the visible bibliography entries and do not alter the canonical source.</p><div class="bib-export-actions"><button type="button" data-bib-export="bib">Export BibTeX</button><button type="button" data-bib-export="ris">Export RIS</button><button type="button" data-bib-export="csv">Export CSV</button></div></section>
'''
    t = t[:pos] + panel + t[pos:]
    export_js = r'''
<script id="wpa-bibliography-export-v1">
(function(){
  function clean(s){return (s||'').replace(/\s+/g,' ').trim()}
  function entries(){return Array.from(document.querySelectorAll('.bib-entry')).map(function(el,i){
    var mk=clean((el.querySelector('.bib-mk')||{}).textContent), en=clean((el.querySelector('.bib-en')||{}).textContent), meta=clean((el.querySelector('.bib-meta')||{}).textContent);
    var doiLink=el.querySelector('a[href*="doi.org"]'); var url=doiLink?doiLink.href:''; var y=(meta.match(/\b(19|20)\d{2}\b/)||['2026'])[0];
    return {id:i+1,title:en||mk,title_mk:mk,year:y,meta:meta,url:url};
  })}
  function key(r){return 'Smiljanov'+r.year+'WPA'+String(r.id).padStart(2,'0')}
  function bib(rows){return rows.map(function(r){return '@misc{'+key(r)+',\n  author = {Smiljanov, Sande},\n  title = {'+r.title.replace(/[{}]/g,'')+'},\n  year = {'+r.year+'},\n  publisher = {World Protocol Academy},'+(r.url?'\n  url = {'+r.url+'},':'')+'\n  note = {'+r.meta.replace(/[{}]/g,'')+'}\n}'}).join('\n\n')}
  function ris(rows){return rows.map(function(r){return ['TY  - GEN','AU  - Smiljanov, Sande','TI  - '+r.title,'PY  - '+r.year,'PB  - World Protocol Academy'].concat(r.url?['UR  - '+r.url]:[]).concat(['N1  - '+r.meta,'ER  - ']).join('\n')}).join('\n\n')}
  function csv(rows){var q=function(v){return '"'+String(v||'').replace(/"/g,'""')+'"'};return ['id,title_en,title_mk,author,year,publisher,url,metadata'].concat(rows.map(function(r){return [r.id,r.title,r.title_mk,'Sande Smiljanov',r.year,'World Protocol Academy',r.url,r.meta].map(q).join(',')})).join('\n')}
  function save(kind){var rows=entries(), text=kind==='bib'?bib(rows):kind==='ris'?ris(rows):csv(rows), mime=kind==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8', ext=kind==='bib'?'bib':kind;var blob=new Blob([text],{type:mime}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='WPA-BIB-001.'+ext;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},0)}
  document.addEventListener('click',function(e){var b=e.target.closest('[data-bib-export]');if(b)save(b.getAttribute('data-bib-export'))});
})();
</script>
'''
    t = replace_once(t, '</body>', export_js + '\n</body>', 'bibliography export JS')
    write(path, t)

# 3) WORKING PAPERS: surface existing descriptions as short abstracts.
path = 'working-papers/index.html'
t = read(path)
if 'paper-abstract-label' not in t:
    t = replace_once(t, '.paper-desc{color:#34384a;font-size:15px;margin-bottom:16px}', '.paper-abstract-label{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.75px;color:var(--goldd);margin:2px 0 5px}.paper-desc{color:#34384a;font-size:15px;margin-bottom:16px}', 'working paper abstract CSS')
    t = replace_once(t, '<div class="paper-meta">${p.meta}</div><p class="paper-desc">${p.desc}</p>', '<div class="paper-meta">${p.meta}</div><div class="paper-abstract-label">Краток апстракт · Short abstract</div><p class="paper-desc">${p.desc}</p>', 'working paper dynamic abstract label')
    t = replace_once(t, '<div class="paper-meta">Version v14 · Bilingual MK/EN · 29 pages · 2026</div><p class="paper-desc">Official WPA Working Paper No. 013. Author-reviewed public Zenodo release.</p>', '<div class="paper-meta">Version v14 · Bilingual MK/EN · 29 pages · 2026</div><div class="paper-abstract-label">Краток апстракт · Short abstract</div><p class="paper-desc">Case-focused protocol analysis of the official visit of President Droupadi Murmu to the Republic of North Macedonia, presented as an author-reviewed WPA Working Paper with emphasis on the protocol architecture and public-facing institutional context of the visit.</p>', 'WP013 short abstract')
    write(path, t)

# 4) VIRTUAL SANDE: modes/examples + source attribution logic.
path = 'virtual-sande-ai.html'
t = read(path)
if "data-panel='examples'" not in t:
    t = replace_once(t, "<button class='tab' data-panel='legal'>⚖ Legal</button>", "<button class='tab' data-panel='examples'>🧭 Examples & Sources</button><button class='tab' data-panel='legal'>⚖ Legal</button>", 'Virtual Sande examples tab')
    examples = r'''<section id='examples' class='panel'><h2>Virtual Sande · Use Modes & Examples</h2><p class='notice'>These are illustrative prompts and response patterns, not claims that a specific institution has used the system. Human review remains required for consequential institutional use.</p><div class='grid'>
<div class='src'><span class='cat'>LEARN · УЧИ</span><h3>Explain a protocol rule</h3><p><strong>Example prompt:</strong> „Објасни ми како функционира редот на предимство на официјален настан.“</p><p><strong>Response pattern:</strong> definition → governing context → example → source tags → uncertainty note where needed.</p></div>
<div class='src'><span class='cat'>PRACTICE · ВЕЖБАЈ</span><h3>Scenario rehearsal</h3><p><strong>Example prompt:</strong> „Дај ми сценарио за погрешно седење на делегација и провери го моето решение.“</p><p><strong>Response pattern:</strong> scenario → learner answer → protocol critique → corrected sequence → learning point.</p></div>
<div class='src'><span class='cat'>ADVISE · СОВЕТУВАЈ</span><h3>Non-binding orientation</h3><p><strong>Example prompt:</strong> „Кои протоколарни прашања треба да ги проверам пред официјална билатерална средба?“</p><p><strong>Response pattern:</strong> checklist and source-grounded orientation only; no claim of official legal, diplomatic or governmental authority.</p></div>
<div class='src'><span class='cat'>COACH · КОУЧ</span><h3>Executive preparation</h3><p><strong>Example prompt:</strong> „Подготви ме за формално обраќање пред меѓународна публика.“</p><p><strong>Response pattern:</strong> structure → tone → forms of address → rehearsal prompts → human review.</p></div>
</div><h2 style='margin-top:28px'>Source & Attribution Logic</h2><div class='notice'><strong>1. Source discipline:</strong> distinguish WPA-authored doctrine, public-source facts and model inference.<br><strong>2. Attribution:</strong> attribute named sources when a claim depends on them; do not invent quotations, citations, titles or institutional positions.<br><strong>3. Paraphrase boundary:</strong> summarize and paraphrase copyrighted sources rather than reproducing protected text.<br><strong>4. Uncertainty:</strong> when evidence is incomplete, say so; a zero-hallucination target is a verification standard, not an absolute guarantee.<br><strong>5. Human Gate:</strong> consequential institutional action, external publication and official communication require human verification and authorization.</div><h2 style='margin-top:28px'>For Institutions · Development Use Case</h2><p>An institution may use Virtual Sande as a supervised internal learning and rehearsal layer for protocol orientation, scenario practice and source-guided preparation. It must not be presented as an autonomous decision-maker or as a substitute for the institution's authorized legal, diplomatic, security or protocol officers.</p></section>'''
    t = replace_once(t, "<section id='legal' class='panel'>", examples + "<section id='legal' class='panel'>", 'Virtual Sande examples section')
    write(path, t)

# 5) AUDIO MEDIA ENGINE: component map + canonical financial freeze grammar.
path = 'audio-media-engine.html'
t = read(path)
# Canonical terminology and freeze cleanup.
t = t.replace('safe monetization roadmap', 'future sustainability architecture with public commercial activation inactive/frozen')
t = t.replace('испорака и монетизација', 'испорака и идна одржливост')
t = t.replace('>Монетизација<', '>Идна одржливост<')
t = t.replace('Мотор за монетизација · безбедна патоказ', 'Идна одржливост · INACTIVE / FROZEN')
t = t.replace('Revenue ideas се третираат како product roadmap, не како правно/финансиско ветување.', 'Овој слој ја зачувува само идната архитектура. Јавна продажба, цени, paid subscriptions, paid licences, checkout и официјално платено credential issuance не се активни.')
t = t.replace('Premium Courses', 'Future Learning Packages')
t = t.replace('Аудио книги, работилници, протоколарни сценарија, институционални пакети.', 'Идна архитектура за аудио книги, работилници, сценарија и институционални learning packages; без активна јавна продажба.')
t = t.replace('Web3 Certificates', 'Future Credential Technology')
t = t.replace('Само по правна, privacy и accreditation-language ревизија.', 'Само по идно governance/legal одобрување, privacy review и јасна accreditation-language контрола.')
t = t.replace("['Монетизација','monetization','guard']", "['Идна одржливост','sustainability','guard']")
t = t.replace("['Institutional Product Map','Monetization','Draft','2 days ago']", "['Institutional Sustainability Map','Future Sustainability','Draft','2 days ago']")
t = t.replace('data-tab="monetization"', 'data-tab="sustainability"')
t = t.replace('id="monetization"', 'id="sustainability"')
t = t.replace('EUR 4,820', 'INACTIVE')
t = t.replace('Проектиран демо приказ', 'Commercial activation')
t = t.replace('Бројките се демо приказ за интерфејсот, не финансиско ветување.', 'Public commercial activation is INACTIVE / FROZEN. Demo workflow counts are interface examples only and are not sales, prices or financial promises.')
t = t.replace('PPP voiceover', 'PPT voiceover')
if 'Component Map' not in t:
    component = r'''<section class="panel" id="component-map"><div class="section-label">Component Map · Controlled Enhancement</div><h2>WPA Audio Media Engine · Component Map</h2><p>Engine = аудио/медиумски production-and-governance workflow. WPA Scenario Film Lab = одделен визуелен/audiovisual subsystem. Компонентите подолу се functional modules, а не посебни институции.</p><div class="strip"><div class="card"><h3>Audiobook & Narration</h3><p>Script preparation, narrator notes, pronunciation checks, disclosure, chapter workflow and human-reviewed export packages.</p></div><div class="card"><h3>Sande Voice Governance</h3><p>Consent-first architecture for any future synthetic/assisted voice use: authorization, disclosure, provenance/watermarking, storage policy and human approval.</p></div><div class="card"><h3>Protocol Scenario Production</h3><p>Transforms protocol cases into structured educational scenarios. Visual or film production belongs to the Scenario Film Lab audiovisual subsystem.</p></div><div class="card"><h3>Live-Room Governance</h3><p>Floor control, one-speaker-at-a-time logic, host authorization, participation rules and future privacy/audit requirements for real-time systems.</p></div><div class="card"><h3>Short-form Media</h3><p>Educational briefing, social and short-form script workflows with source discipline, dignity and human editorial review.</p></div><div class="card"><h3>Delivery & Future Sustainability</h3><p>Packaging, review and delivery workflow. The sustainability/commercial architecture is retained but public commercial activation remains INACTIVE / FROZEN.</p></div></div><div class="notice">Illustrative use cases: 30-second protocol explainer for a chief-of-staff audience; 5-minute pre-meeting protocol briefing; narrated learning chapter with source and disclosure notes.</div></section>'''
    t = replace_once(t, '<div class="section-label">Основни модули</div>', component + '\n<div class="section-label">Основни модули</div>', 'Audio component map')
write(path, t)

print('Applied six controlled WPA enhancements.')

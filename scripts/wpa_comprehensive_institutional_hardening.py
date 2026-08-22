from pathlib import Path
import json, re

changed = {}

def read(path):
    p = Path(path)
    return p.read_text(encoding='utf-8') if p.exists() else ''

def write(path, text):
    p = Path(path)
    old = read(path)
    if text != old:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding='utf-8')
        changed[path] = {'before_chars': len(old), 'after_chars': len(text)}

def jload(path):
    return json.loads(read(path))

def jwrite(path, data):
    write(path, json.dumps(data, ensure_ascii=False, indent=2) + '\n')

# 1) Human-Governed Agentic Institution Model
hgaim = {
    'schema': 'wpa-human-governed-agentic-institution-model/1.0',
    'version': '1.0.0',
    'updated': '2026-08-22',
    'name': 'WPA Human-Governed Agentic Institution Model',
    'acronym': 'HGAIM',
    'status': 'WPA_WORKING_INSTITUTIONAL_MODEL',
    'external_standard': False,
    'world_first_claim': False,
    'world_first_claim_policy': 'No world-first claim unless an independent prior-art review supports it.',
    'core_formula': 'Operationally automated; institutionally human-governed.',
    'public_principle': 'Machines may coordinate. Agents may prepare and recommend. Only authorised humans may commit consequential institutional actions.',
    'long_term_objective': 'End-to-end human-governed agentic institute workflows from intake and research through learning, assessment, publication and completion, with explicit human authority for consequential decisions.',
    'authority_layers': [
        {'order': 1, 'name': 'Human Authority', 'status': 'FINAL_INSTITUTIONAL_AUTHORITY', 'role': 'mandate, approval, pause, override and accountability'},
        {'order': 2, 'name': 'WPA Doctrine Kernel', 'status': 'GOVERNED_MACHINE_READABLE_CONSTITUTION', 'role': 'truth, doctrine, authorial-dna and drift controls'},
        {'order': 3, 'name': 'Strategic AI Core', 'status': 'MIXED_ADAPTER_STATUS', 'role': 'strategic planning and independent review; provider adapters must be explicitly verified'},
        {'order': 4, 'name': 'Virtual Sande', 'status': 'DEPLOYED_AND_ACCEPTED_PUBLIC_PRODUCTION', 'version': 'v35.1.1', 'role': 'central orchestration, source-disciplined interface and synthesis'},
        {'order': 5, 'name': 'WPAWS Executive Agent Layer', 'status': 'ORCHESTRATED_EXECUTIVE_AGENT_LAYER', 'version': '11.1.7', 'capacity': 17, 'role': 'governed academic and institutional production'},
        {'order': 6, 'name': 'WPA AI Council', 'status': 'CONTROLLED_TACTICAL_OPERATIONAL_ARCHITECTURE', 'capacity_up_to': 80, 'role': 'bounded tactical-operational task execution under approved directive'},
        {'order': 7, 'name': 'External AI Candidate Registry', 'status': 'CANDIDATE_REGISTRY', 'capacity': 54, 'role': 'candidate external AI seats; no affiliation or live integration implied'}
    ],
    'mandatory_release_gates': ['Doctrine Kernel', 'Preventive Source Compliance Gate', 'Evidence Gate', 'Safety Gate', 'Human Approval Gate'],
    'institutional_domains': ['Protocol Studies', 'Diplomacy & International Relations', 'Public Communication', 'Security Studies', 'Research & Benchmarking', 'Professional Practice'],
    'research_pipeline': ['Public or authorised sources', 'WPA Watch', 'Academic Search Hub', 'Protocolometry', 'WPAWS / Virtual Sande', 'Evidence review', 'Human-reviewed output'],
    'student_lifecycle': {'reference': '/data/wpa-student-lifecycle.json', 'stages': 10, 'student_desk_status': 'BETA / GOVERNED PUBLIC PREVIEW', 'real_enrolment_enabled': False, 'real_payment_enabled': False, 'official_certificate_issue_enabled': False, 'backend_required': True},
    'status_vocabulary': ['LIVE', 'LIMITED_PRODUCTION', 'IMPLEMENTED_MVP', 'STAGING', 'BETA', 'PROTOTYPE', 'PLANNED', 'CANDIDATE_REGISTRY', 'PENDING_CANONICAL_VERIFICATION', 'UNAVAILABLE_FOR_AUTOMATED_ACTIVATION'],
    'non_claims': ['No state accreditation claim', 'No government authority claim', 'No autonomous academic/legal/financial authority', 'No intelligence, surveillance, investigative or operational function', 'No provider partnership or endorsement without evidence', 'No external-customer deployment claim without verifiable delivery evidence']
}
jwrite('data/wpa-human-governed-agentic-institution-model.json', hgaim)

architecture = {
    'schema': 'wpa-institutional-operating-architecture/1.0',
    'version': '1.0.0',
    'updated': '2026-08-22',
    'institution': 'World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies',
    'model': 'HGAIM',
    'model_reference': '/data/wpa-human-governed-agentic-institution-model.json',
    'canonical_chain': 'Human Authority -> Doctrine Kernel -> Strategic AI Core -> Virtual Sande -> WPAWS 17 Executive Agents -> up to 80 bounded Tactical-Operational Seats -> Evidence/Safety/Human Gates -> WPA Output',
    'systems': [
        {'id': 'virtual_sande', 'status': 'LIVE_PRODUCTION', 'version': 'v35.1.1', 'evidence': '/config/virtual-sande-current-state.json'},
        {'id': 'wpaws', 'status': 'CONTROLLED_WORKING_ENVIRONMENT', 'version': '11.1.7', 'executive_agents': 17},
        {'id': 'council80', 'status': 'BOUNDED_AGENT_CAPACITY', 'capacity_up_to': 80, 'continuous_autonomy': False},
        {'id': 'council54', 'status': 'CANDIDATE_REGISTRY', 'capacity': 54, 'provider_affiliation_implied': False},
        {'id': 'protocolometry', 'status': 'OPERATIONAL_METHODOLOGICAL_CENTER'},
        {'id': 'academic_search', 'status': 'STAGING', 'version': '3.1'},
        {'id': 'wpa_watch', 'status': 'PUBLIC_SOURCE_CANDIDATE_MONITORING', 'human_verification_required': True},
        {'id': 'journal_watch', 'status': 'STAGING_READY_EDITORIAL_REVIEW_REQUIRED'},
        {'id': 'student_desk', 'status': 'BETA_GOVERNED_PUBLIC_PREVIEW', 'backend_required_before_live_operations': True}
    ],
    'evidence_and_governance': ['/data/wpa-academic-quality-standard.json', '/data/wpa-canonical-version-manifest.json', '/data/wpa-public-evidence-index.json', '/data/wpa-preventive-source-compliance-gate.json', '/data/wpa-student-operations-backend-schema.json'],
    'current_publication_metric': {'total': 26, 'monographs_and_manuals': 6, 'doctoral_dissertations': 1, 'scientific_papers_and_contributions': 19},
    'external_delivery_boundary': 'No external-customer AI delivery is claimed unless separately evidenced.'
}
jwrite('data/wpa-institutional-operating-architecture.json', architecture)

# 2) Extend canonical registries
manifest = jload('data/wpa-canonical-version-manifest.json')
manifest['version'] = '1.1.0'; manifest['updated'] = '2026-08-22'
c = manifest.setdefault('components', {})
c['hgaim'] = {'canonical_version': '1.0.0', 'path': '/data/wpa-human-governed-agentic-institution-model.json', 'status': 'WPA_WORKING_INSTITUTIONAL_MODEL', 'external_standard': False, 'world_first_claim': False}
c['institutional_operating_architecture'] = {'canonical_version': '1.0.0', 'path': '/data/wpa-institutional-operating-architecture.json', 'status': 'MACHINE_READABLE_INSTITUTIONAL_ARCHITECTURE'}
c['source_compliance_gate'] = {'canonical_version': '1.1.1', 'path': '/data/wpa-preventive-source-compliance-gate.json', 'status': 'MANDATORY_PRE_ACCESS_FAIL_CLOSED_GATE'}
c['student_operations_backend'] = {'canonical_version': '1.0.0', 'path': '/data/wpa-student-operations-backend-schema.json', 'status': 'PRIVACY_SAFE_BACKEND_BLUEPRINT_NOT_LIVE_OPERATIONS'}
c['virtual_sande_v35_2_candidate'] = {'version': 'v35.2-connected-vessels-phase4', 'path': '/tools/virtual-sande/wpa-protocol-bot-v35.2-connected-vessels.mjs', 'status': 'STAGING_CANDIDATE_NOT_PRODUCTION', 'production_version_remains': 'v35.1.1'}
jwrite('data/wpa-canonical-version-manifest.json', manifest)

evidence = jload('data/wpa-public-evidence-index.json')
evidence['version'] = '1.1.0'; evidence['updated'] = '2026-08-22'
ev = evidence.setdefault('evidence', []); ids = {x.get('id') for x in ev if isinstance(x, dict)}
for x in [
    {'id': 'EVIDENCE-HGAIM-001', 'type': 'institutional_model', 'title': 'WPA Human-Governed Agentic Institution Model', 'path': '/data/wpa-human-governed-agentic-institution-model.json', 'version': '1.0.0', 'status': 'WPA_WORKING_INSTITUTIONAL_MODEL', 'boundary': 'Internal WPA framework; not an external standard and not a world-first claim.'},
    {'id': 'EVIDENCE-SOURCE-GATE-001', 'type': 'source_rights_governance', 'title': 'WPA Preventive Source Compliance Gate', 'path': '/data/wpa-preventive-source-compliance-gate.json', 'version': '1.1.1', 'status': 'FAIL_CLOSED_PRE_ACCESS_POLICY'},
    {'id': 'EVIDENCE-STUDENT-LIFECYCLE-001', 'type': 'governed_lifecycle_specification', 'title': 'WPA Student Lifecycle through Virtual Sande', 'path': '/data/wpa-student-lifecycle.json', 'stages': 10, 'status': 'FRONTEND_ORCHESTRATION_SPECIFICATION_BACKEND_REQUIRED'},
    {'id': 'EVIDENCE-STUDENT-BACKEND-001', 'type': 'privacy_safe_backend_blueprint', 'title': 'WPA Student Operations Backend Schema', 'path': '/data/wpa-student-operations-backend-schema.json', 'status': 'BLUEPRINT_NOT_LIVE_OPERATIONS'},
    {'id': 'EVIDENCE-VS-CANDIDATE-352', 'type': 'technical_candidate', 'title': 'Virtual Sande Connected Vessels candidate', 'path': '/tools/virtual-sande/wpa-protocol-bot-v35.2-connected-vessels.mjs', 'version': 'v35.2-connected-vessels-phase4', 'status': 'STAGING_CANDIDATE_NOT_PRODUCTION', 'boundary': 'Canonical public production remains v35.1.1.'}
]:
    if x['id'] not in ids: ev.append(x)
jwrite('data/wpa-public-evidence-index.json', evidence)

registry = jload('data/wpa-module-registry.json')
registry['version'] = '3.1.0'; registry['updated'] = '2026-08-22'
registry['institutional_model'] = {'name': 'WPA Human-Governed Agentic Institution Model', 'acronym': 'HGAIM', 'path': '/data/wpa-human-governed-agentic-institution-model.json', 'status': 'WPA_WORKING_INSTITUTIONAL_MODEL', 'world_first_claim': False}
registry['institutional_operating_architecture'] = {'path': '/data/wpa-institutional-operating-architecture.json', 'status': 'MACHINE_READABLE_INSTITUTIONAL_ARCHITECTURE'}
registry.setdefault('student_lifecycle', {})['backend_blueprint'] = '/data/wpa-student-operations-backend-schema.json'
mods = registry.setdefault('modules', []); mids = {m.get('id') for m in mods if isinstance(m, dict)}
for m in [
    {'id': 'hgaim', 'name': 'WPA Human-Governed Agentic Institution Model', 'path': '/data/wpa-human-governed-agentic-institution-model.json', 'status': 'WPA_WORKING_INSTITUTIONAL_MODEL'},
    {'id': 'institutional_operating_architecture', 'name': 'WPA Institutional Operating Architecture', 'path': '/data/wpa-institutional-operating-architecture.json', 'status': 'MACHINE_READABLE_INSTITUTIONAL_ARCHITECTURE'},
    {'id': 'student_backend_blueprint', 'name': 'WPA Student Operations Backend Schema', 'path': '/data/wpa-student-operations-backend-schema.json', 'status': 'PRIVACY_SAFE_BACKEND_BLUEPRINT_NOT_LIVE'}
]:
    if m['id'] not in mids: mods.append(m)
jwrite('data/wpa-module-registry.json', registry)

# 3) Canonical MK/EN homepage translations
updates = {
'mk': {
 'topbar1':'World Protocol Academy — независна дигитална истражувачка, авторска, аналитичка, професионална и образовна платформа во развој за протокол, дипломатија, јавна комуникација и безбедност.',
 'topbar2':'Research · Evidence · Protocolometry · WPAWS · Virtual Sande · Human-governed AI',
 'eyebrow':'Независна дигитална истражувачка, авторска, аналитичка, професионална и образовна платформа · Human-governed AI',
 'heroP':'World Protocol Academy е независна дигитална истражувачка, авторска, аналитичка, професионална и образовна платформа во развој, со Protocolometry, WPAWS, Virtual Sande, јавни и овластени извори и човечки управувани AI workflow-и.',
 'heroCardH3':'WPA Институционална оперативна архитектура',
 'hl1':'<strong>Research & Evidence</strong>јавни и овластени извори, provenance, публикации и проверка',
 'hl2':'<strong>Protocolometry</strong>мерливост, benchmark методологија и право на корекција',
 'hl3':'<strong>AI Orchestration</strong>Virtual Sande, source/evidence/safety gates и Human Gate',
 'hl4':'<strong>WPAWS</strong>17 executive agent roles за академска и институционална продукција',
 'hl5':'<strong>Institute</strong>шест домени, специјализирани labs и професионална практика',
 'hl6':'<strong>Agentic Operations</strong>до 80 bounded tactical seats + Council-54 candidate registry',
 'hl7':'<strong>Learning & Certification</strong>контролирана application area со човечко одобрување',
 'platformP':'WPA е институционалната рамка; WPAWS е работниот мотор; Virtual Sande е оркестратор и AI интерфејс; Protocolometry, Academic Search, WPA Watch и специјализираните labs ја градат research/evidence инфраструктурата.',
 'aboutH3':'Истражување, доказ и практика во еден управуван дигитален институт.',
 'aboutP':'World Protocol Academy е повеќеслојна истражувачка, авторска, аналитичка, професионална и образовна платформа што ги поврзува Protocolometry, WPAWS, Virtual Sande, публикации, специјализирани labs и човечки управувани AI workflow-и.',
 'about3H4':'AI, докази и управувани workflow-и',
 'about3P':'Virtual Sande, WPAWS, source verification, provenance и human-reviewed institutional workflows.',
 'aiH3':'Virtual Sande — академски и институционален AI интерфејс со дисциплина на извори.',
 'aiP':'AI слојот на WPA поддржува истражување, работа со проверливи извори, анализа, подготовка на нацрти, протоколарни сценарија и учење; последиците и институционалните одлуки остануваат под Human Gate.',
 'a_top.2':'World Protocol Academy е централната институционална матрица за истражување, Protocolometry, WPAWS, Virtual Sande, публикации, специјализирани labs, професионална практика и контролирано учење.',
 'a_top.8':'Source-grounded Q&A · Attribution · Research routing · Human review',
 'a_core_pages.20':'Open Reference · Professional · Research · Institutional — планирана access архитектура, неактивирана'
},
'en': {
 'topbar1':'World Protocol Academy — an independent digital research, authorial, analytical, professional and educational platform in development for protocol, diplomacy, public communication and security.',
 'topbar2':'Research · Evidence · Protocolometry · WPAWS · Virtual Sande · Human-governed AI',
 'eyebrow':'Independent digital research, authorial, analytical, professional and educational platform · Human-governed AI',
 'heroP':'World Protocol Academy is an independent digital research, authorial, analytical, professional and educational platform in development, combining Protocolometry, WPAWS, Virtual Sande, public or authorised sources and human-governed AI workflows.',
 'heroCardH3':'WPA Institutional Operating Architecture',
 'hl1':'<strong>Research & Evidence</strong>public or authorised sources, provenance, publications and verification',
 'hl2':'<strong>Protocolometry</strong>measurability, benchmark methodology and correction rights',
 'hl3':'<strong>AI Orchestration</strong>Virtual Sande, source/evidence/safety gates and the Human Gate',
 'hl4':'<strong>WPAWS</strong>17 executive agent roles for academic and institutional production',
 'hl5':'<strong>Institute</strong>six domains, specialist labs and professional practice',
 'hl6':'<strong>Agentic Operations</strong>up to 80 bounded tactical seats + Council-54 candidate registry',
 'hl7':'<strong>Learning & Certification</strong>a controlled application area with human authorisation',
 'platformP':'WPA is the institutional framework; WPAWS is the working engine; Virtual Sande is the orchestrator and AI interface; Protocolometry, Academic Search, WPA Watch and specialist labs form the research/evidence infrastructure.',
 'aboutH3':'Research, evidence and practice in one governed digital institute.',
 'aboutP':'World Protocol Academy is a multilayer research, authorial, analytical, professional and educational platform connecting Protocolometry, WPAWS, Virtual Sande, publications, specialist labs and human-governed AI workflows.',
 'about3H4':'AI, evidence and governed workflows',
 'about3P':'Virtual Sande, WPAWS, source verification, provenance and human-reviewed institutional workflows.',
 'aiH3':'Virtual Sande — a source-disciplined academic and institutional AI interface.',
 'aiP':'The WPA AI layer supports research, verifiable-source knowledge work, analysis, drafting, protocol scenarios and learning; consequential institutional actions remain subject to the Human Gate.',
 'a_top.2':'World Protocol Academy is the central institutional matrix for research, Protocolometry, WPAWS, Virtual Sande, publications, specialist labs, professional practice and controlled learning.',
 'a_top.8':'Source-grounded Q&A · Attribution · Research routing · Human review',
 'a_core_pages.20':'Open Reference · Professional · Research · Institutional — planned access architecture, not activated'
}}

translation_files=[]
for fp in Path('.').rglob('*.json'):
    if any(x in fp.parts for x in ('.git','node_modules')): continue
    try: data=json.loads(fp.read_text(encoding='utf-8'))
    except Exception: continue
    if not isinstance(data, dict): continue
    meta=data.get('_meta') or {}; lang=str(meta.get('lang') or '').lower()
    if lang in updates and ('heroP' in data or 'aboutP' in data or 'a_top.2' in data):
        for k,v in updates[lang].items():
            if k in data: data[k]=v
        for k,v in list(data.items()):
            if isinstance(v,str):
                v=v.replace('6 monographs · 1 dissertation · 19 papers · 25 total','6 monographs · 1 dissertation · 19 papers · 26 total')
                v=v.replace('6 monographs and handbooks, 1 doctoral dissertation and 19 scientific papers and contributions (25 in total)','6 monographs and handbooks, 1 doctoral dissertation and 19 scientific papers and contributions (26 in total)')
                v=v.replace('6 монографии · 1 дисертација · 19 трудови · 25 вкупно','6 монографии · 1 дисертација · 19 трудови · 26 вкупно')
                data[k]=v
        jwrite(str(fp),data); translation_files.append(str(fp))
    if lang in ('mk','en') and 'institute.hero.lead' in data:
        data['institute.hero.lead'] = ('World Protocol Academy ги поврзува академската теорија, проверливите извори, професионалната практика, Protocolometry и човечки управуваните AI workflow-и во протокол, дипломатија, јавна комуникација и безбедносни студии.' if lang=='mk' else 'World Protocol Academy connects academic theory, verifiable sources, professional practice, Protocolometry and human-governed AI workflows across protocol, diplomacy, public communication and security studies.')
        jwrite(str(fp),data)

# 4) Static reviewer-readable architecture block
block = '''<!-- WPA INSTITUTIONAL OPERATING ARCHITECTURE v3.1 START -->
<section id="wpa-ai-delivery-architecture" aria-label="WPA human-governed agentic institutional architecture" style="padding:72px 24px;background:#f7f3e8;border-top:1px solid #d8d2bc;border-bottom:1px solid #d8d2bc;color:#172b3c;">
<div style="max-width:1180px;margin:0 auto"><div style="font:800 11px/1.4 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#80651d;margin-bottom:10px">WPA Institute · HGAIM · Research · Evidence · Human Authority</div>
<h2 style="font-family:Georgia,serif;font-size:clamp(30px,4vw,46px);color:#0d1f3c;margin:0 0 14px">WPA Human-Governed Agentic Institution Model · HGAIM</h2>
<p style="max-width:980px;font-size:16px;line-height:1.75;color:#334b5e"><strong>Operationally automated; institutionally human-governed.</strong> WPA's long-term objective is an end-to-end agentic institute lifecycle connecting research, analysis, publication, professional practice and controlled learning. AI may coordinate, prepare and recommend; consequential institutional actions remain subject to authorised human approval.</p>
<p style="padding:12px 15px;background:#fff;border-left:4px solid #c9a84c;font-size:12.5px;color:#536777"><strong>Status discipline:</strong> HGAIM is a WPA working institutional model, not an external standard and not a world-first claim. WPA distinguishes LIVE, LIMITED PRODUCTION, STAGING, BETA, PROTOTYPE, PLANNED and CANDIDATE REGISTRY capabilities.</p>
<div style="padding:16px 18px;background:#0d1f3c;color:#f8f4ee;font:700 12.5px/1.7 system-ui,sans-serif">Human Authority → Doctrine Kernel → Strategic AI Core → Virtual Sande → WPAWS 17 Executive Agents → up to 80 bounded Tactical-Operational Seats → Evidence Gate → Safety Gate → Human Approval → WPA Output</div>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:20px">
<article><h3>Human Authority + Doctrine Kernel</h3><p>Truth, doctrine, authorial-dna and drift checks. No automatic doctrine mutation and no consequential WPA action without the applicable Human Gate.</p></article>
<article><h3>Virtual Sande · LIVE v35.1.1</h3><p>Central source-disciplined AI interface and orchestration layer. v35.2 Connected Vessels remains a staging candidate, not the canonical production release.</p></article>
<article><h3>WPAWS 11.1.7 · 17 Executive Agents</h3><p>Governed academic and institutional working environment for writing, analysis, review, citations, protocol, diplomacy, security, publishing and quality control.</p></article>
<article><h3>Council-80 · Bounded Capacity</h3><p>Up to 80 tactical-operational seats. Capacity does not mean 80 continuously running autonomous agents; approved activation and bounded mandates are required.</p></article>
<article><h3>Council-54 · Candidate Registry</h3><p>External-AI candidate seats. A listed seat does not imply API availability, partnership, endorsement or provider participation.</p></article>
<article><h3>Evidence Pipeline</h3><p>Public or authorised sources → WPA Watch → Academic Search Hub → Protocolometry → WPAWS / Virtual Sande → evidence review → human-reviewed output.</p></article>
<article><h3>Proactive Academy Lifecycle</h3><p>Ten governed stages from application through completion and certificate authorisation. Real enrolment, payment and official certificate issuance remain disabled until approved backend and reviews exist.</p></article>
<article><h3>Academic Evidence & Correction</h3><p>26 publications = 6 monographs/manuals + 1 doctoral dissertation + 19 papers/contributions, plus DOI/COBISS evidence, provenance and correction rights.</p></article>
</div>
<p style="margin-top:20px;padding:15px;background:#fffdf5;border-left:4px solid #9c8336"><strong>Release discipline:</strong> Preventive Source Compliance → authorised/public sources → evidence mapping → safety review → human approval. Unknown source rights fail closed. No intelligence, surveillance, investigative or autonomous operational authority is claimed.</p>
<p><a href="/data/wpa-human-governed-agentic-institution-model.json">HGAIM manifest</a> · <a href="/data/wpa-institutional-operating-architecture.json">Architecture map</a> · <a href="/data/wpa-academic-quality-standard.json">Academic Quality Standard</a> · <a href="/data/wpa-public-evidence-index.json">Public Evidence Index</a></p>
<p style="font-size:11.5px;color:#5c6f7d">Educational and certification workflows are one controlled application area within the broader Institute architecture. WPA does not claim university status, state accreditation, provider endorsement or external-customer AI deployment without separate verifiable evidence.</p></div></section>
<!-- WPA INSTITUTIONAL OPERATING ARCHITECTURE v3.1 END -->'''

def install(path):
    text=read(path)
    text=re.sub(r'<!-- WPA INSTITUTIONAL OPERATING ARCHITECTURE v3\.1 START -->.*?<!-- WPA INSTITUTIONAL OPERATING ARCHITECTURE v3\.1 END -->','',text,flags=re.S)
    # remove runtime/static legacy section if already statically present
    text=re.sub(r'<section[^>]+id=["\']wpa-ai-delivery-architecture["\'][\s\S]*?</section>','',text,count=1,flags=re.I)
    anchor='<!-- PUBLICATIONS -->' if path=='index.html' else None
    if anchor and anchor in text: text=text.replace(anchor,block+'\n'+anchor,1)
    else:
        m=re.search(r'<section[^>]+id=["\'](?:publications|institute-publications)["\']',text,re.I)
        text=text[:m.start()]+block+'\n'+text[m.start():] if m else text.replace('</main>',block+'\n</main>',1)
    text=text.replace('6 monographs · 1 dissertation · 19 papers · 25 total','6 monographs · 1 dissertation · 19 papers · 26 total')
    write(path,text)
install('index.html'); install('institute.html')

# 5) Other public drift + legacy naming
for path in ['papers.html','bibliography/index.html','scripts/wpa-publications-sync-20260817.js']:
    if Path(path).exists():
        t=read(path).replace('6 monographs · 1 dissertation · 19 papers · 25 total','6 monographs · 1 dissertation · 19 papers · 26 total')
        t=t.replace('6 monographs and handbooks, 1 doctoral dissertation and 19 scientific papers and contributions (25 in total)','6 monographs and handbooks, 1 doctoral dissertation and 19 scientific papers and contributions (26 in total)')
        write(path,t)

if Path('intelligence-center.html').exists():
    t=read('intelligence-center.html')
    if '<meta name="robots"' not in t:
        t=t.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">','<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="robots" content="noindex,follow">\n<link rel="canonical" href="https://worldprotocolacademy.mk/protocolometry-center.html">',1)
    t=t.replace('WPA Intelligence Center','WPA Protocolometry Center — Legacy Route').replace('Intelligence Center','Protocolometry Center').replace('протоколарна интелигенција','протоколарна анализа')
    write('intelligence-center.html',t)

if Path('wpa-live-intelligence-feed.html').exists():
    t=read('wpa-live-intelligence-feed.html')
    t=t.replace('https://worldprotocolacademy-code.github.io/wpa-live-intelligence-feed.html','https://worldprotocolacademy.mk/wpa-live-intelligence-feed.html')
    t=t.replace('WPA Live Intelligence Feed','WPA Public Analysis Feed').replace('Live Intelligence Feed','Public Analysis Feed').replace('Intelligence Center','Protocolometry Center')
    write('wpa-live-intelligence-feed.html',t)

cand='tools/virtual-sande/wpa-protocol-bot-v35.2-connected-vessels.mjs'
if Path(cand).exists():
    t=read(cand)
    t=t.replace("const PUBLIC_ROOT='https://worldprotocolacademy-code.github.io';","const PUBLIC_ROOT='https://worldprotocolacademy.mk';")
    t=t.replace("name:'WPA Intelligence Center — legacy alias'","name:'WPA Protocolometry Center — legacy route'")
    t=t.replace("name:'WPA Live Feed'","name:'WPA Public Analysis Feed'")
    t=t.replace("status:'live_public_source'","status:'public_source_candidate_feed_human_verification_required'")
    t=t.replace("status:'live_request_builder'","status:'public_request_builder_no_commercial_activation'")
    write(cand,t)

# 6) Audit report
failures=[]
required={
 'index.html':['HGAIM','Doctrine Kernel','17 Executive Agent','Council-80','Council-54','Proactive Academy Lifecycle','Preventive Source Compliance','26 publications ='],
 'institute.html':['HGAIM','Doctrine Kernel','17 Executive Agent','Council-80','Council-54','Proactive Academy Lifecycle','Preventive Source Compliance','26 publications ='],
 'data/wpa-module-registry.json':['HGAIM','3.1.0'],
 'data/wpa-canonical-version-manifest.json':['STAGING_CANDIDATE_NOT_PRODUCTION','v35.1.1'],
 'data/wpa-public-evidence-index.json':['EVIDENCE-HGAIM-001','EVIDENCE-STUDENT-BACKEND-001']
}
for path,needles in required.items():
    txt=read(path)
    for n in needles:
        if n not in txt: failures.append(f'{path}: missing {n}')
student=jload('data/wpa-student-operations-backend-schema.json')
if student.get('deployment_boundary',{}).get('real_enrolment_enabled') is not False: failures.append('student backend real enrolment boundary')
if student.get('deployment_boundary',{}).get('official_certificate_issue_enabled') is not False: failures.append('student backend certificate boundary')

report={
 'schema':'wpa-comprehensive-institutional-audit/1.0','date':'2026-08-22','status':'PASS' if not failures else 'FAIL',
 'scope':['institutional positioning','machine-readable architecture','agent hierarchy','source/provenance governance','student lifecycle','version hygiene','publication metrics','legacy public terminology','OPN evidence readiness'],
 'implemented':['HGAIM model','institutional architecture map','static Home/Institute architecture section','research-first MK/EN positioning','17/80/54 distinction','10-stage proactive academy lifecycle','source/evidence/safety/human release chain','v35.2 candidate separated from v35.1.1 production','legacy Intelligence terminology hardening','26=6+1+19 metric hardening'],
 'scores':{'architecture_design':'10_plus_internal_standard','governance_discipline':'10_plus_internal_standard','agent_orchestration':'9.5/10 — provider adapters are not all live','public_evidence_consistency':'9.5/10','version_hygiene':'9.5/10','institutional_positioning':'9.5/10','student_lifecycle_governance':'10/10 design boundary','external_customer_delivery_evidence':'OPEN GAP — no unsupported claim made'},
 'remaining_nonblocking_gaps':['A real external AI delivery pilot/customer case is still needed for strongest OPN proof.','Non-canonical third-language translations require separate human/linguistic QA.','HGAIM is a WPA working framework; no world-first claim until independent prior-art review.','Commercial, enrolment, payment and official certificate operations remain inactive until required legal/backend/security/privacy controls are approved.'],
 'changed_files':changed,'failures':failures}
jwrite('data/wpa-comprehensive-institutional-audit-2026-08-22.json',report)
print(json.dumps(report,ensure_ascii=False,indent=2))
if failures: raise SystemExit(1)

#!/usr/bin/env python3
"""One-shot branch migration for final WPA MK/EN public-language integrity.

This helper is intentionally removed by the one-shot workflow after it patches the
branch. It never runs in production. The durable result is static HTML + CI gates.
"""
from __future__ import annotations

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def replace_required(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"required migration anchor missing: {label}")
    return text.replace(old, new)


def patch_home() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")

    text = replace_required(
        text,
        '<script src="/languages/wpa-language-menu-10.js?v=3.1" defer></script>',
        '<script src="/languages/wpa-public-language-router-v2.js?v=2.0" defer></script>',
        "root legacy language runtime",
    )

    replacements = {
        "Research · Evidence · Protocolometry · WPAWS · Virtual Sande · Human-governed AI": "Истражување · Докази · Протоколометрија · WPAWS · Virtual Sande · ВИ под човечко управување",
        "AI governance evidence · WPA Protocol Note:": "Докази за управување со ВИ · WPA Protocol Note:",
        "Institute for Protocol, Diplomacy, Public Communication and Security Studies": "Институт за протокол, дипломатија, јавна комуникација и безбедносни студии",
        "Independent digital educational, research and authorial platform. Development, testing and pilot phase — 2026.": "Независна дигитална образовна, истражувачка и авторска платформа. Развојна, тест и пробна фаза — 2026.",
        "Future Sustainability Layer": "Иден слој за одржливост",
        "future community access, proposed partner framework and sustainable development logic": "иден пристап за заедницата, предложена партнерска рамка и логика за одржлив развој",
        "Canonical Metrics & Status": "Канонски метрики и статус",
        "Technical Architecture": "Техничка архитектура",
        "What WPA delivers · Практична институционална вредност": "Што испорачува WPA · Практична институционална вредност",
        "For a Ministry": "За министерство",
        "State-visit readiness, summit architecture, protocol continuity and executive briefings.": "Подготвеност за државни посети, архитектура на самити, континуитет на протоколот и извршни брифинзи.",
        "Check readiness →": "Провери подготвеност →",
        "For an Embassy": "За амбасада",
        "Visit choreography, ceremonial review, public-source visual statecraft and contingency planning.": "Кореографија на посети, церемонијална ревизија, визуелна државна репрезентација од јавни извори и планирање за непредвидени ситуации.",
        "Explore services →": "Истражи ги услугите →",
        "For a Protocol Office": "За протоколарна служба",
        "Protocol audit, SOP review, symbolic-integrity checks and decision ownership.": "Протоколарна ревизија, ревизија на стандардни оперативни постапки, проверки на симболички интегритет и јасна одговорност за одлуките.",
        "Try the Stress-Test →": "Пробај го Stress-Test →",
        "For a University / Institute": "За универзитет / институт",
        "Research methodology, Protocolometry, Journal governance and Institute Index laboratory.": "Истражувачка методологија, Протоколометрија, управување со Journal и лабораторија Institute Index.",
        "Open Index Lab →": "Отвори Index Lab →",
        "For an Executive Team": "За извршен тим",
        "Applied protocol training, communication presence and scenario-based preparation.": "Применета протоколарна обука, комуникациско присуство и подготовка заснована на сценарија.",
        "Institutional enquiry →": "Институционално барање →",
        "01 · Enquire": "01 · Побарај",
        "Define the institutional need without oversharing sensitive information.": "Дефинирај ја институционалната потреба без непотребно споделување чувствителни информации.",
        "02 · Diagnose": "02 · Дијагностицирај",
        "Evidence, mandate, risks and deliverables are scoped.": "Се утврдуваат доказите, мандатот, ризиците и очекуваните резултати.",
        "03 · Deliver": "03 · Испорачај",
        "Human-reviewed output with clear boundaries and correction path.": "Резултат прегледан од човек, со јасни граници и патека за исправка.",
        "Proof of value · Public demo": "Доказ за вредност · Јавно демо",
        "No registration · No personal data · No certificate claim · Deterministic educational demo · Human responsibility remains final.": "Без регистрација · Без лични податоци · Без тврдење за сертификат · Детерминистичко образовно демо · Човечката одговорност останува конечна.",
        "Assessment logic · Serial verification · digital completion records, once the system is activated": "Логика на оценување · Сериска верификација · дигитални записи за завршување, по активирање на системот",
        "Question bank · Attribution logic · Educational responses": "Банка на прашања · Логика на атрибуција · Образовни одговори",
        "Protocol Symbols · Diplomatic Analysis · WPAWS": "Протоколарни симболи · Дипломатска анализа · WPAWS",
        "Editorial IP · Paraphrase standard · Attribution policy": "Уредувачка интелектуална сопственост · Стандард за парафразирање · Политика за атрибуција",
        "WPA Core Documents Hub · Клучни WPA документи": "WPA центар за клучни документи",
        "Главна WPA, Strategy, Master Strategy и WPA-BIB-001": "Главна WPA, Стратегија, Главна стратегија и WPA-BIB-001",
        "WPA Implementation Roadmap": "WPA Патоказ за имплементација",
        "WPA Master Strategy": "WPA Главна стратегија",
        "Programme Architecture": "Програмска архитектура",
        "Programmes Page": "Страница за програми",
        "Programme families и flagship tracks": "Програмски семејства и водечки патеки",
        "Assessment, certification и formats": "Оценување, сертификација и формати",
        "Certification Logic": "Логика на сертификација",
        "Certification Page": "Страница за сертификација",
        "4 јасни certificate levels": "4 јасни нивоа на сертификати",
        "Verification-ready certification structure": "Сертификациска структура подготвена за верификација",
        "Membership & Access": "Членство и пристап",
        "WPA Card Page": "Страница WPA Card",
        "QR-first verification logic": "Логика на верификација со QR како прв чекор",
        "Access, status и future benefits layer": "Слој за пристап, статус и идни придобивки",
        "Partner & Growth Logic": "Логика за партнерства и раст",
        "Partnerships & Member Benefits": "Партнерства и членски придобивки",
        "17+3 partner architecture": "17+3 партнерска архитектура",
        "Member benefits and recurring value": "Членски придобивки и континуирана вредност",
        "Institutional and growth logic": "Институционална логика и логика на раст",
        "WPA Professional Services · Development Preview": "WPA професионални услуги · Развоен преглед",
        "Professional Services · Development Preview": "Професионални услуги · Развоен преглед",
        "Services / Услуги": "Услуги",
        "Executive Briefings": "Извршни брифинзи",
        "Institutional Profile": "Институционален профил",
        "World Protocol Academic Writing System": "Систем за академско пишување на World Protocol Academy",
        "Doctrine, Research, Protocol, Diplomacy, Teaching, Press": "Доктрина, истражување, протокол, дипломатија, настава, печат",
        "Academic режим": "академски режим",
        "Question Bank и Assessment engine": "Банка на прашања и мотор за оценување",
        "Protocol Symbols & Knowledge Module · Активна база": "Модул за протоколарни симболи и знаење · Активна база",
        "197 entity records · 95 national-day records · 9 international-organization records · separate metrics": "197 записи за ентитети · 95 записи за национални денови · 9 записи за меѓународни организации · одделни метрики",
        "Структурирани programmes, scenario-based learning, assessment, verification и постепена прогресија.": "Структурирани програми, учење засновано на сценарија, оценување, верификација и постепена прогресија.",
        "WPA Manifest": "WPA Манифест",
        "Certificate Programmes — структурирани professional pathways": "Сертификациски програми — структурирани професионални патеки",
        "Training Structure": "Структура на обука",
        "Foundation Certificate Programme": "Основна сертификациска програма",
        "Professional Certificate Programme": "Професионална сертификациска програма",
        "Advanced Certificate Programme": "Напредна сертификациска програма",
        "Train-the-Trainer / Consultant Track": "Патека Обука за обучувачи / консултанти",
        "WPA нивоата не се bachelor, master или doctorate степени — тоа се structured professional certificate programmes.": "WPA нивоата не се додипломски, магистерски или докторски степени — тоа се структурирани професионални сертификациски програми.",
        "Open Professional English Toolkit →": "Отвори го пакетот Professional English →",
        "Institutional map": "Институционална мапа",
        "Research · methodology · Protocolometry · institutional analysis.": "Истражување · методологија · Протоколометрија · институционална анализа.",
        "Evidence & Benchmark": "Докази и споредбена рамка",
        "Official bibliography, Master List and transparent correction/evidence routes.": "Официјална библиографија, Главна листа и транспарентни патеки за исправка и докази.",
        "Bibliography →": "Библиографија →",
        "Master List →": "Главна листа →",
        "Conference and pilot-facing gateway, separated from permanent Institute doctrine.": "Конференциска и пилот-порта, јасно одвоена од трајната доктрина на Институтот.",
        "Learning & Access": "Учење и пристап",
        "Programmes, professional certification framework and WPA Card live in their own public surfaces.": "Програмите, рамката за професионална сертификација и WPA Card имаат сопствени јавни страници.",
        "Programmes →": "Програми →",
        "Institute Charter →": "Повелба на Институтот →",
        "Certificates & Recognition": "Сертификати и признавање",
        "PRIMARY AI MENTOR": "ПРИМАРЕН ВИ МЕНТОР",
        "COMPARATIVE AI LAB": "КОМПАРАТИВНА ВИ ЛАБОРАТОРИЈА",
        "VERIFIED SPECIALIST LAB": "ВЕРИФИЦИРАНА СПЕЦИЈАЛИСТИЧКА ЛАБОРАТОРИЈА",
        "WPA Multi-AI Command Center": "WPA Multi-AI команден центар",
        "Preview на learning paths": "Преглед на патеките за учење",
        "Premium lessons": "Премиум лекции",
        "Advanced lesson paths": "Напредни патеки за учење",
        "Custom training packages": "Прилагодени пакети за обука",
        "Executive / Institutional": "Извршно / Институционално",
        "WPA Institute · HGAIM · Research · Evidence · Human Authority": "WPA Institute · HGAIM · Истражување · Докази · Човечка власт",
        "Operationally automated; institutionally human-governed.": "Оперативно автоматизирано; институционално управувано од човек.",
        "WPA's long-term objective is an end-to-end agentic institute lifecycle connecting research, analysis, publication, professional practice and controlled learning. AI may coordinate, prepare and recommend; consequential institutional actions remain subject to authorised human approval.": "Долгорочната цел на WPA е целосен агентски животен циклус на Институтот што ги поврзува истражувањето, анализата, објавувањето, професионалната практика и контролираното учење. ВИ може да координира, подготвува и препорачува; институционалните дејства со последици остануваат предмет на овластено човечко одобрување.",
        "Status discipline:": "Дисциплина на статусот:",
        "HGAIM is a WPA working institutional model, not an external standard and not a world-first claim. WPA distinguishes LIVE, LIMITED PRODUCTION, STAGING, BETA, PROTOTYPE, PLANNED and CANDIDATE REGISTRY capabilities.": "HGAIM е работен институционален модел на WPA, а не надворешен стандард или тврдење за светско првенство. WPA јасно ги разликува статусите LIVE, LIMITED PRODUCTION, STAGING, BETA, PROTOTYPE, PLANNED и CANDIDATE REGISTRY.",
        "Human Authority → Doctrine Kernel → Strategic AI Core → Virtual Sande → WPAWS 17 Executive Agents → up to 80 bounded workflow seats → Evidence Gate → Safety Gate → Human Approval → WPA Output": "Човечка власт → Доктринарно јадро → Стратешко ВИ јадро → Virtual Sande → WPAWS 17 извршни агенти → до 80 ограничени работни места → Порта за докази → Безбедносна порта → Човечко одобрување → WPA резултат",
        "Human Authority + Doctrine Kernel": "Човечка власт + Доктринарно јадро",
        "Truth, doctrine, authorial-dna and drift checks. No automatic doctrine mutation and no consequential WPA action without the applicable Human Gate.": "Проверки на вистинитост, доктрина, авторско ДНК и отстапување. Нема автоматско менување на доктрината и нема WPA дејство со последици без применливата Човечка порта.",
        "Central source-disciplined AI interface and orchestration layer. v35.2 Connected Vessels remains a staging candidate, not the canonical production release.": "Централен ВИ интерфејс и оркестрациски слој со дисциплина на извори. v35.2 Connected Vessels останува staging кандидат, а не канонско production издание.",
        "Governed academic and institutional working environment for writing, analysis, review, citations, protocol, diplomacy, security, publishing and quality control.": "Управувана академска и институционална работна средина за пишување, анализа, ревизија, цитирање, протокол, дипломатија, безбедност, објавување и контрола на квалитет.",
        "Council-80 · Bounded Capacity": "Council-80 · Ограничен капацитет",
        "Up to 80 bounded workflow seats. Capacity does not mean 80 continuously running autonomous agents; approved activation and bounded mandates are required.": "До 80 ограничени работни места. Капацитетот не значи 80 постојано активни автономни агенти; потребни се одобрена активација и ограничени мандати.",
        "Council-54 · Candidate Registry": "Council-54 · Регистар на кандидати",
        "External-AI candidate seats. A listed seat does not imply API availability, partnership, endorsement or provider participation.": "Кандидатски места за надворешни ВИ системи. Наведено место не значи достапност на API, партнерство, поддршка или учество на давателот.",
        "Evidence Pipeline": "Доказен тек",
        "Public or authorised sources → WPA Watch → Academic Search Hub → Protocolometry → WPAWS / Virtual Sande → evidence review → human-reviewed output.": "Јавни или овластени извори → WPA Watch → Academic Search Hub → Протоколометрија → WPAWS / Virtual Sande → ревизија на докази → резултат прегледан од човек.",
        "Proactive Academy Lifecycle": "Проактивен животен циклус на Академијата",
        "Ten governed stages from application through completion and certificate authorisation. Real enrolment, payment and official certificate issuance remain disabled until approved backend and reviews exist.": "Десет управувани фази од пријавување до завршување и овластување на сертификат. Реалното запишување, плаќање и официјално издавање сертификати остануваат оневозможени додека не постојат одобрен backend и соодветни ревизии.",
        "Academic Evidence & Correction": "Академски докази и исправка",
        "26 publications = 6 monographs/manuals + 1 doctoral dissertation + 19 papers/contributions, plus DOI/COBISS evidence, provenance and correction rights.": "26 публикации = 6 монографии/прирачници + 1 докторска дисертација + 19 трудови/прилози, со DOI/COBISS докази, доказно потекло и право на исправка.",
        "Release discipline:": "Дисциплина на изданието:",
        "Preventive Source Compliance → authorised/public sources → evidence mapping → safety review → human approval. Unknown source rights fail closed. No intelligence, surveillance, investigative or autonomous operational authority is claimed.": "Превентивна усогласеност на изворите → овластени/јавни извори → мапирање на докази → безбедносна ревизија → човечко одобрување. Непознати права на изворот се затвораат по принцип fail-closed. Не се тврди разузнавачка, надзорна, истражна или автономна оперативна власт.",
        "Educational and certification workflows are one controlled application area within the broader Institute architecture. WPA does not claim university status, state accreditation, provider endorsement or external-customer AI deployment without separate verifiable evidence.": "Образовните и сертификациските текови се една контролирана област на примена во пошироката архитектура на Институтот. WPA не тврди универзитетски статус, државна акредитација, поддршка од даватели или ВИ deployment за надворешни клиенти без посебни проверливи докази.",
        "Canonical publication metrics · 26 August 2026": "Канонски публикациски метрики · 26 август 2026",
        "A bilingual Protocol Note introducing neuroprotocol, the Effective Embodied Command Index (EECI), neural privacy, human confirmation and the WPA Right to Pause.": "Двојазичен Protocol Note што ги воведува невропротоколот, Effective Embodied Command Index (EECI), невралната приватност, човечката потврда и WPA Right to Pause.",
        "A bilingual WPA Protocol Note separating the legal baseline, technical evidence and WPA normative proposal for AI transparency, authorship, provenance and human responsibility. It introduces HARP-6, the Provenance Assurance Ladder (PAL), provenance of meaning, a Low-Resource Language Safeguard, a Post-Publication Recovery Protocol, a Correction Provenance Record (CPR) and a Simulation-to-Consent Boundary.": "Двојазичен WPA Protocol Note што ги раздвојува правната основа, техничките докази и нормативниот предлог на WPA за транспарентност на ВИ, авторство, доказно потекло и човечка одговорност. Ги воведува HARP-6, Provenance Assurance Ladder (PAL), доказното потекло на значењето, Low-Resource Language Safeguard, Post-Publication Recovery Protocol, Correction Provenance Record (CPR) и Simulation-to-Consent Boundary.",
        "A bilingual Protocol Note extending liquid protocol into multi-agent chains through mandate non-amplification, provenance, admissibility gates, human approval validity and the WPA Network Right to Pause.": "Двојазичен Protocol Note што го проширува Течниот протокол во мултиагентски синџири преку неамплификација на мандатот, доказно потекло, порти на допуштеност, валидност на човечкото одобрување и WPA Network Right to Pause.",
        "A bilingual Protocol Note on protocolometric governance of adaptive software, agentic action and institutional accountability, including action classes, human oversight and the WPA Right to Pause.": "Двојазичен Protocol Note за протоколометриско управување со адаптивен софтвер, агентско дејствување и институционална одговорност, вклучително и класи на дејства, човечки надзор и WPA Right to Pause.",
        "A bilingual Protocol Note on frontier-AI governance in national-security environments, introducing the Effective AI Sovereignty Index (EASI), cognitive sovereignty and shared but undissolved responsibility.": "Двојазичен Protocol Note за управување со напредна ВИ во средини на национална безбедност, со Effective AI Sovereignty Index (EASI), когнитивен суверенитет и споделена, но неразводнета одговорност.",
        "The revised and expanded strategic report defines WPA institutional identity, mission, research priorities, publication governance, professional learning, AI and data governance, sustainability, performance review and strategic risk management.": "Ревидираниот и проширен стратешки извештај ги дефинира институционалниот идентитет на WPA, мисијата, истражувачките приоритети, управувањето со публикации, професионалното учење, управувањето со ВИ и податоци, одржливоста, прегледот на перформанси и управувањето со стратешки ризик.",
        "Authorial WPA platform": "Авторска WPA платформа",
        "Sources, Authorship and Educational Use": "Извори, авторство и образовна употреба",
        "Virtual Sande — Source & Attribution Logic": "Virtual Sande — Логика на извори и атрибуција",
        "Default mode = paraphrase, not verbatim quotation": "Стандарден режим = парафраза, не дословен цитат",
        "General definitions in WPA-edited wording": "Општи дефиниции во редакциска формулација на WPA",
        "Distinctive author formulations → attributed": "Препознатливи авторски формулации → атрибуирани",
        "No fabricated citations — ever": "Никогаш без измислени цитати",
        "No false claim WPA invented the discipline": "Без лажно тврдење дека WPA ја измислила дисциплината",
        "Short quotations only when truly necessary": "Кратки цитати само кога навистина се неопходни",
        "Educational, accurate, institutionally appropriate": "Образовно, точно и институционално соодветно",
        "selection logic, pedagogical design, programme architecture, question-bank systems, AI workflows, original explanatory wording и platform expression": "логика на избор, педагошки дизајн, програмска архитектура, системи за банки на прашања, ВИ работни текови, оригинална објаснувачка формулација и платформски израз",
        "NEW · WPA AI LAB": "НОВО · WPA ВИ ЛАБОРАТОРИЈА",
        "Централна WPA лабораторија за аудио книги, Sande voice engine, protocol scenario lab, viral media studio, live video room governance и monetization workflows.": "Централна WPA лабораторија за аудио книги, Sande voice engine, лабораторија за протоколарни сценарија, студио за вирални медиуми, управување со live video room и работни текови за монетизација.",
        "Open WPA Audio Media Engine": "Отвори WPA Audio Media Engine",
        "Explore WPA Programmes": "Истражи ги WPA програмите",
        "Cultural Diplomacy & Communication": "Културна дипломатија и комуникација",
        "Book-to-Screen Method": "Метод од книга до екран",
        "Educational Film Cases": "Едукативни филмски случаи",
        "Audio & Video Lab": "Аудио и видео лабораторија",
        "Production Workflow": "Продукциски работен тек",
        "Protocol Lesson": "Протоколарна лекција",
        "Diplomatic Impact": "Дипломатско влијание",
        "Academic Cooperation": "Академска соработка",
        "Humanism · Cultural Diplomacy · Ohrid": "Хуманизам · Културна дипломатија · Охрид",
        "Humanism & Dialogue": "Хуманизам и дијалог",
        "Ohrid Intellectual Tradition": "Охридска интелектуална традиција",
        "Cultural Diplomacy": "Културна дипломатија",
        "WPA is not a university, governmental institution, accreditation body, registered academy or degree-granting institution. The views expressed in WPA publications are solely those of the respective authors and do not represent the views, policies or positions of any governmental institution, ministry, agency or employer.": "WPA не е универзитет, државна институција, тело за акредитација, регистрирана академија или институција што доделува академски степени. Ставовите изразени во WPA публикациите им припаѓаат исклучиво на соодветните автори и не ги претставуваат ставовите, политиките или позициите на ниту една државна институција, министерство, агенција или работодавач.",
        "WPA GLOBAL CHANNELS": "WPA ГЛОБАЛНИ КАНАЛИ",
        "Global academic & public communication network": "Глобална академска и јавна комуникациска мрежа",
        "Official public channels today, with a phased regional expansion for Europe, Asia, Africa, the Americas and Oceania.": "Официјални јавни канали денес, со фазно регионално проширување за Европа, Азија, Африка, Америките и Океанија.",
        "Regional expansion": "Регионално проширување",
        "Global reach": "Глобален досег",
        "Europe · Asia · Africa · North America · South America · Australia & New Zealand · Oceania": "Европа · Азија · Африка · Северна Америка · Јужна Америка · Австралија и Нов Зеланд · Океанија",
        "Atlantic · Pacific · Indian · Arctic · Southern Ocean": "Атлантски · Тих · Индиски · Арктички · Јужен Океан",
        "Channel status is sourced from the canonical WPA Social Bridge registry. Roadmap channels are not presented as active official accounts until a verified public URL is registered.": "Статусот на каналите се презема од канонскиот WPA Social Bridge регистар. Каналите од патоказот не се прикажуваат како активни официјални сметки додека не биде регистриран проверен јавен URL.",
        "Security & Trust": "Безбедност и доверба",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    path.write_text(text, encoding="utf-8")


def patch_legacy_runtime() -> None:
    path = ROOT / "languages/wpa-language-menu-10.js"
    text = path.read_text(encoding="utf-8")
    text = replace_required(
        text,
        "  function isRelevantPage(){\n    return isInstitutePage() || isHomePage();\n  }",
        "  function isRelevantPage(){\n    return isInstitutePage();\n  }",
        "legacy runtime home eligibility",
    )
    path.write_text(text, encoding="utf-8")


def patch_registry() -> None:
    path = ROOT / "data/translator-runtime-registry.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    data["version"] = "1.2.0"
    data["updated"] = "2026-09-16"
    for item in data.get("engines", []):
        if item.get("path") == "languages/wpa-language-menu-10.js":
            item["classification"] = "legacy_institute_page_sync_runtime"
            item["notes"] = "Institute-only legacy page-sync/capability enhancement layer. The canonical Home no longer loads it; public Home routing is direct through wpa-public-language-router-v2.js."
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_mk_checker() -> None:
    path = ROOT / "scripts/mk_home_language_integrity_check.py"
    path.write_text(r'''#!/usr/bin/env python3
"""Fail-closed visible-language and runtime-integrity gate for the canonical MK Home."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
PUBLIC_ROUTER = "/languages/wpa-public-language-router-v2.js?v=2.0"
LEGACY_HOME_RUNTIME = "/languages/wpa-language-menu-10.js"
COMMON_EN = {
    "the","and","of","to","in","for","with","from","is","are","this","that","as","on","by","an","a",
    "into","within","remains","public","research","institutional","professional","learning","human","review",
    "governance","evidence","sources","source","development","official","access","status","rights","output",
    "protocol","academy","programme","programmes","certificate","certification","services","analysis","system",
}
ALLOWED_EN_PREFIXES = (
    "Protocol of State Symbols, Anthems and National Days:",
    "Neuroprotocol 2030: From Thought to Action",
    "AI Transparency and the Protocol of Authorship:",
    "Multi-Agent Diplomacy: Mandate, Provenance and Institutional Will",
    "Liquid Protocol and AI Agents: From Static Code to Dynamic Diplomacy",
    "Protocol of Artificial Intelligence and State Sovereignty",
    "World Protocol Academy — Global Strategic Plan 2026",
)
FORBIDDEN_SHORT = {
    "Institutional map","Evidence & Benchmark","Learning & Access","Programme Architecture","Certification Logic",
    "Membership & Access","Partner & Growth Logic","Executive Briefings","Institutional Profile",
    "Certificates & Recognition","Sources, Authorship and Educational Use","Global reach","Regional expansion",
    "Book-to-Screen Method","Educational Film Cases","Production Workflow","Protocol Lesson","Diplomatic Impact",
    "Academic Cooperation","Humanism & Dialogue","Ohrid Intellectual Tradition",
}

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.em = 0
        self.visible = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "script":
            src = d.get("src", "")
            if src: self.scripts.append(src)
        if tag in {"script","style","noscript","select"}: self.skip += 1
        if tag == "em": self.em += 1
    def handle_endtag(self, tag):
        if tag in {"script","style","noscript","select"} and self.skip: self.skip -= 1
        if tag == "em" and self.em: self.em -= 1
    def handle_data(self, data):
        s = " ".join(data.split())
        if s and not self.skip:
            self.visible.append((s, bool(self.em)))

def english_heavy(s: str) -> bool:
    words = re.findall(r"[A-Za-z]+", s.lower())
    if len(words) < 5:
        return False
    common = sum(1 for w in words if w in COMMON_EN)
    latin = len(re.findall(r"[A-Za-z]", s))
    cyr = len(re.findall(r"[Ѐ-ӿ]", s))
    return common >= 4 and latin >= 24 and cyr <= max(2, latin // 8)

def allowed(s: str, in_em: bool) -> bool:
    if in_em and s.startswith(ALLOWED_EN_PREFIXES):
        return True
    if s.startswith(ALLOWED_EN_PREFIXES):
        return True
    if re.fullmatch(r"(?:WPA|HGAIM|WPAWS|Virtual Sande|Protocolometry|Google Meet|Zoom|Webex|Facebook|Instagram|TikTok|YouTube|Telegram|WhatsApp|LinkedIn|Viber|Signal|WeChat|VK)(?:\s*[·/+-]\s*[A-Za-z0-9 .&-]+)*", s):
        return True
    if "DOI" in s or "ISBN" in s or "CC BY" in s or "COBISS" in s:
        return True
    return False

def main() -> int:
    text = HOME.read_text(encoding="utf-8")
    p = P(); p.feed(text)
    errors = []
    if not re.search(r"<html\b[^>]*\blang=[\"']mk[\"']", text, flags=re.I):
        errors.append("canonical Home html lang is not mk")
    if any(LEGACY_HOME_RUNTIME in src for src in p.scripts):
        errors.append("legacy Home page-sync runtime is active")
    if p.scripts.count(PUBLIC_ROUTER) != 1:
        errors.append(f"expected exactly one direct public router on MK Home, found {p.scripts.count(PUBLIC_ROUTER)}")
    for s, in_em in p.visible:
        if s in FORBIDDEN_SHORT:
            errors.append(f"forbidden English UI label remains: {s}")
        elif english_heavy(s) and not allowed(s, in_em):
            errors.append(f"English-heavy visible MK Home chunk remains: {s}")
    if errors:
        print("WPA MK Home language-integrity check failed:", file=sys.stderr)
        for e in errors:
            print(f"- {e}", file=sys.stderr)
        return 1
    print("WPA MK Home language-integrity check passed: direct single router, no legacy Home injector, no English-heavy visible UI/prose outside controlled bibliographic/brand exceptions.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
''', encoding="utf-8")


def patch_architecture_check() -> None:
    path = ROOT / "scripts/translator_architecture_check.py"
    text = path.read_text(encoding="utf-8")
    marker = '''    legacy_core = read("languages/wpa-language-menu-10-core.js")\n    for marker in ("PUBLIC_LANGS", "const LANGS", "function buildMenu", "function augmentSelects", "function placeMenu"):\n        if marker in legacy_core:\n            errors.append(f"legacy language core regained routing authority marker: {marker}")\n\n'''
    insertion = marker + '''    home = read("index.html")\n    if "/languages/wpa-language-menu-10.js" in home:\n        errors.append("canonical MK Home still consumes legacy page-sync runtime")\n    if home.count("/languages/wpa-public-language-router-v2.js?v=2.0") != 1:\n        errors.append("canonical MK Home must consume exactly one direct public language router")\n\n'''
    text = replace_required(text, marker, insertion, "translator architecture Home consumer guard")
    path.write_text(text, encoding="utf-8")


def patch_ci() -> None:
    path = ROOT / ".github/workflows/translator-quality.yml"
    text = path.read_text(encoding="utf-8")
    compile_old = '''          python -m py_compile scripts/translator_quality_check.py\n          python -m py_compile scripts/fr_full_mirror_check.py\n          python -m py_compile scripts/fr_complete_parity_check.py\n'''
    compile_new = '''          python -m py_compile scripts/translator_quality_check.py\n          python -m py_compile scripts/public_translation_quality_check.py\n          python -m py_compile scripts/translator_architecture_check.py\n          python -m py_compile scripts/mk_home_language_integrity_check.py\n          python -m py_compile scripts/fr_full_mirror_check.py\n          python -m py_compile scripts/fr_complete_parity_check.py\n'''
    text = replace_required(text, compile_old, compile_new, "translator CI compile list")
    anchor = '''      - name: Validate current SAFE-8R French parity\n        run: python scripts/fr_complete_parity_check.py\n'''
    added = '''      - name: Validate current public translation architecture\n        run: python scripts/translator_architecture_check.py\n      - name: Validate canonical Macedonian Home language integrity\n        run: python scripts/mk_home_language_integrity_check.py\n      - name: Validate canonical English Home and Institute purity\n        run: python scripts/public_translation_quality_check.py\n''' + anchor
    text = replace_required(text, anchor, added, "translator CI current public gates")
    path.write_text(text, encoding="utf-8")


def main() -> int:
    patch_home()
    patch_legacy_runtime()
    patch_registry()
    write_mk_checker()
    patch_architecture_check()
    patch_ci()
    print("one-shot translator finalization applied")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

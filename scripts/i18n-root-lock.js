/*
  WPA I18N Root Lock v1.1
  Purpose:
  - Stronger last-mile cleanup for mixed Macedonian/English visible UI text.
  - Uses exact replacements + phrase replacements inside mixed text nodes.
  - Detects language from selector, localStorage/sessionStorage, html lang and URL.
  - Re-applies after translator loaders, language changes and DOM mutations.
  - Does not change layout, scripts, forms, hidden data, code/pre blocks or protected brand terms.
*/
(function () {
  'use strict';

  var LOCKED = new Set([
    'World Protocol Academy', 'WPA', 'WPAWS', 'WPA Card', 'Virtual Sande', 'Bot-Sande',
    'Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Google Scholar', 'ORCID',
    'ResearchGate', 'Academia.edu', 'AD Scientific Index', 'Europa Prima', 'Stripe', 'PayPal',
    'Visa', 'Mastercard', 'Google Meet', 'Zoom', 'Webex', 'Claude', 'OpenAI', 'ChatGPT'
  ]);

  var EN = {
    'Манифест': 'Manifest',
    'Професионален англиски': 'Professional English',
    'Прашања за сертификати': 'Certificate FAQ',
    'Аудио-медиумски мотор': 'Audio Media Engine',
    'Политика за приватност': 'Privacy Policy',
    'Права и отстранување': 'Rights & Takedown',
    'Библиографија': 'Bibliography',
    'Политика': 'Policy',
    'Отвори Сертификација': 'Open Certification',
    'Отвори WPA Card': 'Open WPA Card',
    '🏛️ Отвори WPA Institute': '🏛️ Open WPA Institute',
    'Публикации': 'Publications',
    'Научни трудови': 'Scientific papers',
    'Години искуство': 'Years of experience',
    'Јазици': 'Languages',
    '◆ WPA Централна матрица-водилка ◆': '◆ WPA Central Guiding Matrix ◆',
    'Програми и нивоа': 'Programmes and levels',
    'Сертификација': 'Certification',
    'Институционален слој': 'Institutional layer',
    'Авторство и извори': 'Authorship and sources',
    'Нови клучни WPA страници': 'New key WPA pages',
    'Програмска архитектура': 'Programme Architecture',
    'Страница за програми': 'Programmes Page',
    'Логика на сертификација': 'Certification Logic',
    'Страница за сертификација': 'Certification Page',
    'Членство и пристап': 'Membership & Access',
    'WPA Card страница': 'WPA Card Page',
    'Партнерска и развојна логика': 'Partner & Growth Logic',
    'Страница за пасивен приход': 'Passive Revenue Page',
    'Отвори programmes.html': 'Open programmes.html',
    'Отвори certification.html': 'Open certification.html',
    'Отвори wpa-card.html': 'Open wpa-card.html',
    'Отвори passive-revenue.html': 'Open passive-revenue.html',
    'Главна куќа': 'Main house',
    'Платформски слој': 'Platform layer',
    'Специјализиран потсистем': 'Specialized subsystem',
    'Институционални партнерства': 'Institutional partnerships',
    'Книги и трудови': 'Books and papers',
    'Публикациски слој': 'Publication layer',
    'Отвори WPAWS': 'Open WPAWS',
    'Отвори Protocol Symbols Lab': 'Open Protocol Symbols Lab',
    'Отвори Partnerships': 'Open Partnerships',
    'Отвори Papers': 'Open Papers',
    'Знамиња': 'Flags',
    'Знамиња и грбови': 'Flags and coats of arms',
    'Химни': 'Anthems',
    'Химни и инструментални': 'Anthems and instrumentals',
    'Грбови': 'Coats of arms',
    'Грбови и државни печати': 'Coats of arms and state seals',
    'географија': 'Geography',
    'Главни градови · Континенти': 'Capitals · Continents',
    'Отвори Protocol Symbols Lab →': 'Open Protocol Symbols Lab →',
    '53 верифицирани записи · Официјална WPA верифицирана протоколарна база': '53 verified records · Official WPA verified protocol database',
    'Верифицирана база': 'Verified database',
    'Само верифицирани факти.': 'Verified facts only.',
    'Што е World Protocol Academy': 'What World Protocol Academy is',
    'WPA манифест': 'WPA Manifest',
    'WPA Позиционирање': 'WPA Positioning',
    'Независна академија и професионална платформа': 'Independent academy and professional platform',
    'Независна дигитална академија': 'Independent digital academy',
    'Мултислоен образовен систем': 'Multi-layer educational system',
    'Министерства и јавни институции': 'Ministries and public institutions',
    'Протоколарни единици и кабинетски тимови': 'Protocol units and cabinet teams',
    'Амбасади и дипломатски мисии': 'Embassies and diplomatic missions',
    'Канцеларии за меѓународна соработка': 'International cooperation offices',
    'Општини и извршни канцеларии': 'Municipalities and executive offices',
    'Извршни лица и раководен кадар': 'Executives and senior staff',
    'Професионалци за односи со јавност': 'Public relations professionals',
    'Организатори на настани и конференции': 'Event and conference organizers',
    'Тимови за корпоративна репрезентација': 'Corporate representation teams',
    'Професионалци во угостителство и front-facing услуги': 'Hospitality and front-facing service professionals',
    'Студенти и млади професионалци': 'Students and young professionals',
    'Универзитети и академски кадар': 'Universities and academic staff',
    'Идни тренери и консултанти': 'Future trainers and consultants',
    'Поединци за развој во бон-тон и етикеција': 'Individuals developing bon ton and etiquette',
    'Професионалци за формални и јавни улоги': 'Professionals in formal and public-facing roles',
    'Структура на обука': 'Training Structure',
    'Четири нивоа. Една кохерентна WPA академија.': 'Four levels. One coherent WPA academy.',
    'Овие четири нивоа создаваат WPA certification ladder: од основна подготвеност до напредна професионална и обучувачка зрелост.': 'These four levels create the WPA certification ladder: from foundation readiness to advanced professional and trainer maturity.',
    '⚠ WPA нивоата не се bachelor, master или doctorate степени — тоа се structured professional certificate programmes.': '⚠ WPA levels are not bachelor, master or doctorate degrees — they are structured professional certificate programmes.',
    'Програмски семејства': 'Programme Families',
    'Основи на протокол и државен протокол': 'Foundations of protocol and state protocol',
    'Дипломатски протокол и официјални посети': 'Diplomatic protocol and official visits',
    'Ред на предимство, седење, знамиња и симболи': 'Order of precedence, seating, flags and symbols',
    'Мултилатерален и воен протокол': 'Multilateral and military protocol',
    'Официјално обраќање и формален говор': 'Official address and formal speech',
    'Протоколарна и институционална комуникација': 'Protocol and institutional communication',
    'Медиумско однесување и јавна репрезентација': 'Media conduct and public representation',
    'Извршна самодоверба и комуникациска стратегија': 'Executive confidence and communication strategy',
    'Лично однесување и прв впечаток': 'Personal conduct and first impression',
    'Трпезариска култура и социјална етикеција': 'Dining culture and social etiquette',
    'Деловен бон-тон и работно место': 'Business bon ton and workplace conduct',
    'Протокол и безбедносна координација': 'Protocol and security coordination',
    'Подготвеност за посети на високо ниво': 'Readiness for high-level visits',
    'Протокол на конференции и самити': 'Protocol for conferences and summits',
    'Train-the-Trainer методологија': 'Train-the-Trainer methodology',
    'Професионален англиски за протокол, дипломатија и институционална комуникација': 'Professional English for protocol, diplomacy and institutional communication',
    'Што содржи модулот': 'What the module contains',
    'Формулации за протоколарни ситуации': 'Formulations for protocol situations',
    'Дипломатски јазик и формална комуникација': 'Diplomatic language and formal communication',
    'Институционална email комуникација': 'Institutional email communication',
    'Конференциски и модераторски јазик': 'Conference and moderation language',
    'Јазик за јавна и медиумска репрезентација': 'Language for public and media representation',
    'Одговори и rescue phrases под притисок': 'Responses and rescue phrases under pressure',
    'Онлајн средби': 'Online meetings',
    'Онлајн средби и академски сесии': 'Online meetings and academic sessions',
    'За консултации, онлајн сесии, институционални состаноци и координација.': 'For consultations, online sessions, institutional meetings and coordination.',
    'Академски сесии, кратки брифинзи, индивидуални консултации': 'Academic sessions, short briefings and individual consultations',
    'Групни masterclass, вебинари, сертификациски часови': 'Group masterclasses, webinars and certification classes',
    'Институционални и корпоративни средини, формален формат': 'Institutional and corporate environments, formal format',
    'Отвори Meet →': 'Open Meet →',
    'Отвори Zoom →': 'Open Zoom →',
    'Отвори Webex →': 'Open Webex →',
    'Отвори целосна Certification Page': 'Open full Certification Page',
    'Отвори WPA Card Page': 'Open WPA Card Page',
    'Сертификати и признавање': 'Certificates & Recognition',
    'Сертификација, верификација и институционална јасност': 'Certification, verification and institutional clarity',
    'Прашање 01': 'Question 01',
    'Прашање 02': 'Question 02',
    'Прашање 03': 'Question 03',
    'Прашање 04': 'Question 04',
    'Прашање 05': 'Question 05',
    'Прашање 06': 'Question 06',
    'Дали WPA програмите се додипломски, последипломски или докторски студии?': 'Are WPA programmes undergraduate, postgraduate or doctoral studies?',
    'Тогаш што претставуваат WPA програмите?': 'Then what are WPA programmes?',
    'Како да се разберат четирите WPA нивоа?': 'How should the four WPA levels be understood?',
    'Дали WPA сертификатите се признаени во светот?': 'Are WPA certificates recognized worldwide?',
    'Што му кажува WPA сертификатот на работодавач или партнер?': 'What does a WPA certificate tell an employer or partner?',
    'Дали WPA ќе има систем за верификација?': 'Will WPA have a verification system?',
    'Специјализиран AI модул': 'Specialized AI module',
    'Строго фактографски модул за знамиња, химни, грбови и протоколарни симболи. Zero hallucination политика.': 'A strictly factual module for flags, anthems, coats of arms and protocol symbols. Zero hallucination policy.',
    'Кратки bot одговори': 'Short bot answers',
    'Основни лекции и поими': 'Basic lessons and concepts',
    'Подолги и попрецизни одговори': 'Longer and more precise answers',
    'Подготовка за сертификати': 'Certificate preparation',
    'Академски Virtual Sande': 'Academic Virtual Sande',
    'Сценарија за вежбање': 'Practice scenarios',
    'Годишни партнерства': 'Annual partnerships',
    'Институционално': 'Institutional',
    'По договор': 'By proposal',
    'Начини на плаќање': 'Payment methods',
    'Достапни платежни опции': 'Available payment options',
    'Контактирај за претплата →': 'Contact for subscription →',
    'Книги и монографии': 'Books and monographs',
    '5 монографии и прирачници': '5 monographs and handbooks',
    '1 докторска дисертација': '1 doctoral dissertation',
    '17 научни трудови и прилози': '17 scientific papers and contributions',
    'Разгледајте ја библиографијата →': 'View the bibliography →',
    'Отворен PDF пристап': 'Open PDF access',
    'Отворете ги трудовите →': 'Open the papers →',
    'Државен протокол': 'State Protocol',
    'Протоколарни системи и институционална логика.': 'Protocol systems and institutional logic.',
    'Отворете →': 'Open →',
    'Конференциски прирачник': 'Conference Handbook',
    'Практични насоки за конференции и настани.': 'Practical guidance for conferences and events.',
    'Дипломатија и безбедност': 'Diplomacy and Security',
    'Дипломатија, протокол и безбедност': 'Diplomacy, Protocol and Security',
    'Формален поредок и стратешка свест.': 'Formal order and strategic awareness.',
    'Дигитална ера': 'Digital Era',
    'Протокол и дипломатија во современа средина.': 'Protocol and diplomacy in a contemporary environment.',
    'Официјална библиографија': 'Official bibliography',
    'Вкупно публикации': 'Total publications',
    'Монографии и прирачници': 'Monographs and handbooks',
    'Докторска дисертација': 'Doctoral dissertation',
    'Монографии · Дисертација · Научни трудови': 'Monographs · Dissertation · Scientific papers',
    'Отвори официјална библиографија →': 'Open official bibliography →',
    'Официјални WPA канали': 'Official WPA channels',
    'Отвори →': 'Open →',
    'Основач и директор на World Protocol Academy': 'Founder and Director of World Protocol Academy',
    'Доц. д-р Санде Смиљанов': 'Assoc. Prof. Dr. Sande Smiljanov',
    '23 публикации': '23 publications',
    '25+ години': '25+ years',
    '„Преговарањето е опционално.\nПротоколот е апсолутен.“': '“Negotiation is optional.\nProtocol is absolute.”',
    '— Доктрина на Доц. д-р Санде Смиљанов': '— Doctrine of Assoc. Prof. Dr. Sande Smiljanov',
    'Извори, авторство и образовна употреба': 'Sources, Authorship and Educational Use',
    'Употреба на извори, авторство и образовна обработка во WPA': 'Use of sources, authorship and educational processing in WPA',
    'Употреба на извори, цитирање и авторски права': 'Use of sources, citation and copyright',
    'Лаборатории, иновација и заштита на авторството': 'Labs, innovation and authorship protection',
    'Отвори Passive Revenue': 'Open Passive Revenue',
    'Официјална библиографија': 'Official bibliography',
    'Истражи WPA програми': 'Explore WPA Programmes',
    'Програми': 'Programmes',
    'Авторство и извори': 'Authorship and sources',
    'Клучни области': 'Key Areas',
    'Официјални канали': 'Official Channels',
    'Академски профили': 'Academic Profiles',
    'Контакт': 'Contact',
    '1000 Скопје, Република Северна Македонија': '1000 Skopje, Republic of North Macedonia'
  };

  var EN_PHRASES = [
    ['World Protocol Academy е централна матрица-водилка за целокупната платформа — за програмите, обуките, сертификатите, Virtual Sande, лабораториите, изданијата, question-bank логиката и идниот институционален развој.', 'World Protocol Academy is the central guiding matrix for the entire platform — for programmes, training, certificates, Virtual Sande, laboratories, publications, question-bank logic and future institutional development.'],
    ['5 монографии · 1 дисертација · 17 трудови · 23 вкупно', '5 monographs · 1 dissertation · 17 papers · 23 total'],
    ['Министерства · Амбасади · Универзитети · Тимови', 'Ministries · Embassies · Universities · Teams'],
    ['Programmes, Certification, WPA Card и Passive Revenue сега се посебни и јасно поврзани страници.', 'Programmes, Certification, WPA Card and Passive Revenue are now separate and clearly connected pages.'],
    ['Овие четири страници се новите јавни влезни точки на WPA платформата. Од тука корисникот јасно гледа каде започнува со учење, како функционира сертификацијата, како се гради membership и verification слојот и како се развива партнерскиот и пасивно-приходниот екосистем.', 'These four pages are the new public entry points of the WPA platform. From here, users can clearly see where learning begins, how certification works, how the membership and verification layer is built, and how the partner and passive-revenue ecosystem develops.'],
    ['Целосна WPA programme architecture: нивоа, програмски семејства, tracks, assessment logic, membership path и формати на обука.', 'Complete WPA programme architecture: levels, programme families, tracks, assessment logic, membership path and training formats.'],
    ['Programme families и flagship tracks', 'Programme families and flagship tracks'],
    ['Assessment, certification и formats', 'Assessment, certification and formats'],
    ['Четири WPA сертификати, прагови на успех, score bands, FAQ логика и идниот serial / QR verification модел.', 'Four WPA certificates, passing thresholds, score bands, FAQ logic and the future serial / QR verification model.'],
    ['4 јасни certificate levels', '4 clear certificate levels'],
    ['WPA Card како identity, membership, QR verification и access layer што ги поврзува програмите, сертификатите и идните партнерски бенефити.', 'WPA Card as an identity, membership, QR verification and access layer connecting programmes, certificates and future partner benefits.'],
    ['Passive Revenue страницата ја поврзува WPA Card логиката со 17+3 партнерскиот модел, member benefits, recurring value и одржлив раст на платформата.', 'The Passive Revenue page connects WPA Card logic with the 17+3 partner model, member benefits, recurring value and sustainable platform growth.'],
    ['Овие четири страници не се одделни острови. Тие го сочинуваат јавниот квадрат на WPA: Programmes → Certification → WPA Card → Passive Revenue.', 'These four pages are not separate islands. They form the public square of WPA: Programmes → Certification → WPA Card → Passive Revenue.'],
    ['WPA е институцијата — куќата која ги носи сите слоеви. Програми, сертификација, AI, публикации, институционална обука и дигитална архитектура под еден академски покрив.', 'WPA is the institution — the house that carries all layers. Programmes, certification, AI, publications, institutional training and digital architecture under one academic roof.'],
    ['Основач-воден со 25+ години институционално искуство', 'Founder-led with 25+ years of institutional experience'],
    ['WPAWS (World Protocol Academic Writing System) е академскиот работен простор на WPA. Шест модули: Doctrine, Research, Protocol, Diplomacy, Teaching, Press.', 'WPAWS (World Protocol Academic Writing System) is the academic workspace of WPA. Six modules: Doctrine, Research, Protocol, Diplomacy, Teaching and Press.'],
    ['Academic writing и истражувачки алатки', 'Academic writing and research tools'],
    ['Virtual Sande во Academic режим', 'Virtual Sande in Academic mode'],
    ['Question Bank и Assessment engine', 'Question Bank and Assessment engine'],
    ['Строго фактографски модул за знамиња, химни, грбови, географија и протоколарни симболи. Верифицирана база, zero hallucination политика.', 'A strictly factual module for flags, anthems, coats of arms, geography and protocol symbols. Verified database, zero hallucination policy.'],
    ['Посебна порта за универзитети, библиотеки, дипломатски академии и стратешки институционални партнери на WPA.', 'A dedicated gateway for universities, libraries, diplomatic academies and strategic institutional partners of WPA.'],
    ['5 монографии и прирачници, 1 докторска дисертација и 17 научни трудови и прилози (23 вкупно). Интелектуалното јадро и академскиот авторитет на World Protocol Academy.', '5 monographs and handbooks, 1 doctoral dissertation and 17 scientific papers and contributions (23 total). The intellectual core and academic authority of World Protocol Academy.'],
    ['Структурирана протоколарна база со верифицирани записи за државни симболи — официјална протоколарна база на World Protocol Academy.', 'A structured protocol database with verified records of state symbols — the official verified protocol database of World Protocol Academy.'],
    ['Верифицирани описи: бои, симболи, орел на знаме наспроти орел само на грб.', 'Verified descriptions: colours, symbols, eagle on flag versus eagle only on coat of arms.'],
    ['Официјални наслови и верификација: кои химни се официјално инструментални.', 'Official titles and verification: which anthems are officially instrumental.'],
    ['Прецизни описи на грбови, разграничени од симболите на знамиња.', 'Precise descriptions of coats of arms, distinguished from flag symbols.'],
    ['Верифицирани главни градови и континентална припадност за сите 53 записи.', 'Verified capitals and continental affiliation for all 53 records.'],
    ['World Protocol Academy е независна дигитална академија и професионална платформа посветена на протокол, дипломатија, безбедност, институционална комуникација, јавна појава и професионална подготвеност. WPA го спојува академскиот пристап, применетата практика, структурираното учење, сертификацијата и AI-поддржаната образовна логика во една кохерентна институционална архитектура.', 'World Protocol Academy is an independent digital academy and professional platform dedicated to protocol, diplomacy, security, institutional communication, public presence and professional readiness. WPA combines academic approach, applied practice, structured learning, certification and AI-assisted educational logic into one coherent institutional architecture.'],
    ['Нашата цел не е симболично присуство, туку мерлива професионална подготвеност. Затоа WPA работи со јасно структурирани програми, практични задачи, сценарио-базирано учење, оценување, верификација и постепена прогресија на знаење и компетенции.', 'Our goal is not symbolic presence, but measurable professional readiness. That is why WPA works with clearly structured programmes, practical tasks, scenario-based learning, assessment, verification and gradual progression of knowledge and competencies.'],
    ['WPA не се претставува како државна дипломатска академија или универзитетска институција што доделува академски степени. Таа се позиционира како независна академија за професионално, извршно и институционално образование, со сопствен систем на certificate programmes, training pathways и јавна интелектуална основа.', 'WPA does not present itself as a state diplomatic academy or a university institution awarding academic degrees. It is positioned as an independent academy for professional, executive and institutional education, with its own system of certificate programmes, training pathways and public intellectual foundation.'],
    ['Во рамките на WPA, протоколот не се третира само како церемонија, туку како поредок, подготвеност, институционална интелигенција, дисциплина на комуникација и кредибилна јавна репрезентација.', 'Within WPA, protocol is treated not only as ceremony, but as order, readiness, institutional intelligence, communication discipline and credible public representation.'],
    ['World Protocol Academy гради сериозна, современа и меѓународно ориентирана академија со структура, достоинство и јасна насока.', 'World Protocol Academy is building a serious, contemporary and internationally oriented academy with structure, dignity and clear direction.'],
    ['Независна академија — не државна дипломатска академија', 'Independent academy — not a state diplomatic academy'],
    ['Независна академија — не универзитет, не издава академски степени', 'Independent academy — not a university, does not issue academic degrees'],
    ['Certificate Programmes — структурирани professional pathways', 'Certificate Programmes — structured professional pathways'],
    ['AI-поддржана платформа — Virtual Sande, assessment, верификација', 'AI-assisted platform — Virtual Sande, assessment, verification'],
    ['Академски авторитет — 23 публикации (5 монографии, 1 дисертација, 17 трудови), 25+ год. искуство', 'Academic authority — 23 publications (5 monographs, 1 dissertation, 17 papers), 25+ years of experience'],
    ['Non-degree professional education — за извршни и институционални средини', 'Non-degree professional education — for executive and institutional settings'],
    ['WPA работи со четири јасно структурирани нивоа на обука и сертификација. Тие не претставуваат универзитетски студиски циклуси, туку професионални certificate programmes и training pathways со постепена прогресија, оценување и верификација.', 'WPA works with four clearly structured levels of training and certification. They are not university study cycles, but professional certificate programmes and training pathways with gradual progression, assessment and verification.'],
    ['Специјализирано ниво за идни обучувачи, консултанти и носители на знаење, со фокус на методологија, структурирана испорака, протоколарна педагогија, assessment standards и етичка наставна практика.', 'A specialized level for future trainers, consultants and knowledge carriers, focused on methodology, structured delivery, protocol pedagogy, assessment standards and ethical teaching practice.'],
    ['Овој WPA модул е наменет за професионален англиски јазик во протоколарни, дипломатски, институционални и јавни комуникациски контексти. Тој не е класичен general English курс, туку специјализиран programme track за јасно, контролирано и кредибилно изразување во професионална средина.', 'This WPA module is intended for professional English in protocol, diplomatic, institutional and public communication contexts. It is not a classic general English course, but a specialized programme track for clear, controlled and credible expression in a professional environment.'],
    ['Модулот опфаќа email комуникација, состаноци, конференции, говорни настапи, moderation, институционални понуди, formal follow-up, дипломатски формулации и професионални rescue phrases за ситуации под притисок.', 'The module covers email communication, meetings, conferences, speaking engagements, moderation, institutional proposals, formal follow-up, diplomatic formulations and professional rescue phrases for situations under pressure.'],
    ['Пристапот на WPA е едноставен: краток, јасен, дисциплиниран и институционално соодветен англиски. Наместо импровизација, модулот развива сигурно користење на модели, формулации, template logic и сценарио-базирана примена.', 'The WPA approach is simple: concise, clear, disciplined and institutionally appropriate English. Instead of improvisation, the module develops confident use of models, formulations, template logic and scenario-based application.'],
    ['Целта на модулот е да развие професионална подготвеност за јавно, институционално и меѓународно комуницирање на англиски јазик.', 'The goal of the module is to develop professional readiness for public, institutional and international communication in English.'],
    ['WPA сертификатите се професионални сертификати од независна академија и професионална платформа. Тие не се универзитетски степени и не се претставуваат како автоматски државно или академски признаени во секоја земја.', 'WPA certificates are professional certificates from an independent academy and professional platform. They are not university degrees and are not presented as automatically state- or academically recognized in every country.'],
    ['Не. WPA програмите не се универзитетски студиски циклуси и не се претставуваат како bachelor, master или doctorate degrees. World Protocol Academy е независна академија и професионална платформа која нуди structured non-degree professional education, certification pathways и institutional training.', 'No. WPA programmes are not university study cycles and are not presented as bachelor, master or doctorate degrees. World Protocol Academy is an independent academy and professional platform offering structured non-degree professional education, certification pathways and institutional training.'],
    ['WPA програмите претставуваат професионални certificate programmes со јасна структура, нивоа, learning outcomes, assessment logic, практична примена и верификација. Тие се наменети за индивидуален професионален развој, институционална подготвеност и извршно учење.', 'WPA programmes are professional certificate programmes with clear structure, levels, learning outcomes, assessment logic, practical application and verification. They are intended for individual professional development, institutional readiness and executive learning.'],
    ['Четирите WPA нивоа треба да се разберат како структурирана професионална прогресија: Foundation, Professional, Advanced и Train-the-Trainer / Consultant. Тоа е certificate-based academy pathway, а не формален универзитетски degree system.', 'The four WPA levels should be understood as structured professional progression: Foundation, Professional, Advanced and Train-the-Trainer / Consultant. This is a certificate-based academy pathway, not a formal university degree system.'],
    ['WPA сертификатите се професионални сертификати од независна академија. Нивната вредност произлегува од јасно дефинирани programme structures, learning outcomes, assessment logic, serial verification, дигитална проверка и реална професионална применливост.', 'WPA certificates are professional certificates from an independent academy. Their value comes from clearly defined programme structures, learning outcomes, assessment logic, serial verification, digital checking and real professional applicability.'],
    ['WPA сертификатот покажува дека носителот поминал низ структурирана обука, дефинирани содржини, ниво на оценување и јасно утврдена професионална патека — веродостоен доказ за завршена подготовка во протокол, дипломатија, институционална комуникација и јавна појава.', 'A WPA certificate shows that the holder has completed structured training, defined content, a level of assessment and a clearly established professional pathway — credible proof of completed preparation in protocol, diplomacy, institutional communication and public presence.'],
    ['Да. WPA се движи кон сертификациски модел со serial verification, digital verification и јасна programme traceability, со цел секој сертификат да биде проверлив, кредибилен и јасно врзан со конкретно ниво, програма и носител.', 'Yes. WPA is moving toward a certification model with serial verification, digital verification and clear programme traceability, so that each certificate can be checked, be credible and be clearly linked to a specific level, programme and holder.'],
    ['Preview на learning paths', 'Preview of learning paths'],
    ['€9.99 / месечно', '€9.99 / month'],
    ['€19.99 / месечно', '€19.99 / month'],
    ['За активирање на претплата контактирајте: worldprotocolacademy@gmail.com — директни checkout линкови ќе бидат достапни со активирање на платежниот портал.', 'To activate a subscription, contact: worldprotocolacademy@gmail.com — direct checkout links will be available after the payment portal is activated.'],
    ['17 научни трудови и прилози со отворен PDF пристап.', '17 scientific papers and contributions with open PDF access.'],
    ['17 труда', '17 papers'],
    ['Целосната официјална библиографија со верифицирани библиографски записи, ISBN, ISSN, DOI и институционални линкови.', 'The complete official bibliography with verified bibliographic records, ISBN, ISSN, DOI and institutional links.'],
    ['World Protocol Academy признава дека протоколот, дипломатијата, етикецијата, институционалната комуникација и сродните области се изградени низ долг историски и академски развој од бројни автори, институции, школи и професионални практики.', 'World Protocol Academy recognizes that protocol, diplomacy, etiquette, institutional communication and related fields have been built through long historical and academic development by many authors, institutions, schools and professional practices.'],
    ['WPA не тврди авторство над самите дисциплини, над општопознатите факти, над историските концепти или над стандардните професионални поими. Авторството на WPA се однесува на нејзината редакциска обработка, програма, систематизација, педагошка архитектура, класификација, платформа, question-bank logic и оригинално формулиран образовен израз.', 'WPA does not claim authorship over the disciplines themselves, common facts, historical concepts or standard professional terms. WPA authorship refers to its editorial processing, programme, systematization, pedagogical architecture, classification, platform, question-bank logic and originally formulated educational expression.'],
    ['Во своите програми, прашања, одговори и AI-поддржани содржини, WPA може да користи општи дефиниции, парафразирани објаснувања, кратки атрибуирани упатувања и структурирани образовни формулации засновани врз релевантна литература и признати извори.', 'In its programmes, questions, answers and AI-assisted content, WPA may use general definitions, paraphrased explanations, short attributed references and structured educational formulations based on relevant literature and recognized sources.'],
    ['Кога се потпира на препознатлива авторска формулација или специфична дефиниција, WPA применува соодветна атрибуција. Директните цитати се користат ограничено, оправдано и во согласност со академска и правна добра практика.', 'When relying on a recognizable author formulation or specific definition, WPA applies appropriate attribution. Direct quotations are used in a limited, justified manner and in accordance with good academic and legal practice.'],
    ['World Protocol Academy ги почитува авторските и сродните права, авторството, изворите и професионалната етика на академското и јавното изразување.', 'World Protocol Academy respects copyright and related rights, authorship, sources and the professional ethics of academic and public expression.'],
    ['Во оваа платформа може да се користат кратки цитати, парафрази, фактички референци и библиографски упатувања исклучиво за образовни, аналитички, критички, научни, информативни и референтни цели, со јасно наведување на авторот и изворот кога тоа е возможно.', 'This platform may use short quotations, paraphrases, factual references and bibliographic references exclusively for educational, analytical, critical, scientific, informational and reference purposes, with clear attribution to the author and source where possible.'],
    ['WPA не присвојува туѓо авторство. Секое преземање на заштитен текст над дозволениот обем или секоја употреба без правна основа не е дозволена.', 'WPA does not appropriate the authorship of others. Any use of protected text beyond the permitted scope or any use without a legal basis is not allowed.'],
    ['Доколку носител на права смета дека одреден материјал бара корекција или отстранување, WPA ќе постапи совесно, брзо и во добра вера по уредна нотификација.', 'If a rights holder believes that certain material requires correction or removal, WPA will act conscientiously, promptly and in good faith upon proper notification.'],
    ['Virtual Sande не тврди авторство над самата дисциплина. Тој работи со WPA-редактирани објаснувања, структурирани парафрази, релевантни извори и образовна логика на одговор.', 'Virtual Sande does not claim authorship over the discipline itself. It works with WPA-edited explanations, structured paraphrases, relevant sources and educational answer logic.'],
    ['WPA Labs претставуваат развоен и иновативен простор каде се создаваат нови текстови, трудови, книги, видеа, изданија, AI-поддржани образовни алатки, question-bank архитектури и оригинални редакциски материјали.', 'WPA Labs are a development and innovation space where new texts, papers, books, videos, publications, AI-assisted educational tools, question-bank architectures and original editorial materials are created.'],
    ['WPA го задржува авторството врз сопствената структура, selection logic, pedagogical design, programme architecture, question-bank systems, AI workflows, original explanatory wording и platform expression.', 'WPA retains authorship over its own structure, selection logic, pedagogical design, programme architecture, question-bank systems, AI workflows, original explanatory wording and platform expression.'],
    ['Доколку автор или носител на права смета дека одреден материјал бара корекција или ограничување, WPA ќе постапи совесно и навремено по уредна нотификација.', 'If an author or rights holder believes that certain material requires correction or restriction, WPA will act conscientiously and promptly upon proper notification.'],
    ['Централна WPA лабораторија за аудио книги, Sande voice engine, protocol scenario lab, viral media studio, live video room governance и monetization workflows.', 'Central WPA lab for audiobooks, the Sande voice engine, protocol scenario lab, viral media studio, live video room governance and monetization workflows.'],
    ['WPA е независна академија и дигитална платформа. Не се претставува како државна дипломатска академија. WPA сертификатите не се универзитетски степени.', 'WPA is an independent academy and digital platform. It does not present itself as a state diplomatic academy. WPA certificates are not university degrees.']
  ];

  var MK = {
    'About': 'За WPA',
    'Manifest': 'Манифест',
    'Programmes': 'Програми',
    'Prof. English': 'Професионален англиски',
    'Formats': 'Формати',
    'Certification': 'Сертификација',
    'Passive Revenue': 'Пасивен приход',
    'Certificate FAQ': 'Прашања за сертификати',
    'Cert FAQ': 'Прашања за сертификати',
    'Books': 'Книги',
    'Papers': 'Трудови',
    'Partnerships': 'Партнерства',
    'Audio Media Engine': 'Аудио-медиумски мотор',
    'Symbols': 'Симболи',
    'Membership': 'Членство',
    'Founder': 'Основач',
    'Policy': 'Политика',
    'Language': 'Јазик',
    'Explore the Academy': 'Истражи ја Академијата',
    'Meet Virtual Sande': 'Запознај го Virtual Sande',
    'Open WPAWS': 'Отвори WPAWS',
    'Open Certification': 'Отвори Сертификација',
    'Open WPA Card': 'Отвори WPA Card',
    'Open Passive Revenue': 'Отвори Passive Revenue',
    'Open Protocol Symbols Lab': 'Отвори Protocol Symbols Lab',
    'Open WPA Diplomatic Analysis Lab': 'Отвори WPA Diplomatic Analysis Lab',
    'Academic Layer': 'Академски слој',
    'AI Layer': 'AI слој',
    'Publications': 'Публикации',
    'Institutional': 'Институционално',
    'Trainer Layer': 'Обучувачки слој',
    'Revenue Layer': 'Приходен слој',
    'Programme Architecture': 'Програмска архитектура',
    'Programmes Page': 'Страница за програми',
    'Certification Logic': 'Логика на сертификација',
    'Certification Page': 'Страница за сертификација',
    'Membership & Access': 'Членство и пристап',
    'WPA Card Page': 'WPA Card страница',
    'Partner & Growth Logic': 'Партнерска и развојна логика',
    'Passive Revenue Page': 'Страница за пасивен приход',
    'WPA Platform': 'WPA платформа',
    'About WPA': 'За WPA',
    'A new standard in protocol education.': 'Нов стандард во протоколарното образование.',
    'Academic Weight': 'Академска тежина',
    'Research-backed authority': 'Авторитет поткрепен со истражување',
    'Professional Relevance': 'Професионална релевантност',
    'Institutional applicability': 'Институционална применливост',
    'Digital Innovation': 'Дигитална иновација',
    'AI, testing and modern learning': 'AI, тестирање и современо учење',
    'WPA Manifest': 'WPA манифест',
    'Who WPA Is For': 'За кого е WPA',
    'Training Structure': 'Структура на обука',
    'Programme Families': 'Програмски семејства',
    'Professional English': 'Професионален англиски',
    'Training Formats': 'Формати на обука',
    'Flexible delivery, serious structure.': 'Флексибилна испорака, сериозна структура.',
    'Online Live': 'Онлајн во живо',
    'Self-Paced': 'Самостојно темпо',
    'In-Person Intensives': 'Интензиви во живо',
    'Institutional Groups': 'Институционални групи',
    'Certificates & Recognition': 'Сертификати и признавање',
    'AI Protocol Assistant': 'AI протоколарен асистент',
    'Institutional Training': 'Институционална обука',
    'Access & Membership': 'Пристап и членство',
    'Choose the level that fits your path.': 'Избери го нивото што одговара на твојата патека.',
    'The intellectual foundation of WPA.': 'Интелектуалната основа на WPA.',
    'Connection & Presence': 'Поврзаност и присуство',
    'Official channels and academic presence.': 'Официјални канали и академско присуство.',
    'Founder-led. Academic in spirit. Professional in execution.': 'Основач-водено. Академски по дух. Професионално во изведба.',
    'Sources, Authorship and Educational Use': 'Извори, авторство и образовна употреба',
    'Building a world academy — with structure, dignity and clear direction.': 'Градење светска академија — со структура, достоинство и јасна насока.',
    'Explore WPA Programmes': 'Истражи WPA програми',
    'Key Areas': 'Клучни области',
    'Official Channels': 'Официјални канали',
    'Academic Profiles': 'Академски профили',
    'Contact': 'Контакт',
    'Privacy Policy': 'Политика за приватност',
    'Rights & Takedown': 'Права и отстранување'
  };

  function safeGet(key) {
    try { return localStorage.getItem(key) || sessionStorage.getItem(key); } catch (e) { return null; }
  }

  function lang() {
    var selector = document.getElementById('pageLang') || document.querySelector('[data-language-switcher]');
    var selected = selector && selector.value ? selector.value : '';
    var stored = safeGet('wpa_language') || safeGet('wpa_lang') || safeGet('selectedLanguage') || safeGet('lang') || '';
    var bodyLang = (document.body && (document.body.getAttribute('data-current-language') || document.body.getAttribute('data-lang'))) || '';
    var htmlLang = document.documentElement.getAttribute('lang') || '';
    var urlLang = '';
    try { urlLang = new URLSearchParams(location.search).get('lang') || ''; } catch (e) {}
    var l = String(selected || stored || bodyLang || urlLang || htmlLang || 'mk').toLowerCase();
    if (l === 'en' || l.indexOf('en-') === 0 || l.indexOf('english') >= 0) return 'en';
    return 'mk';
  }

  function isVisibleTextNode(node) {
    if (!node || node.nodeType !== 3) return false;
    if (!node.nodeValue || !node.nodeValue.trim()) return false;
    var p = node.parentElement;
    if (!p) return false;
    var tag = p.tagName;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|OPTION)$/i.test(tag)) return false;
    if (p.closest('.notranslate') && p !== document.documentElement) return false;
    return true;
  }

  function applyExactAndPhrase(node, dictionary, phrases) {
    var original = node.nodeValue;
    var value = original;
    var trimmed = value.trim();
    if (!trimmed || LOCKED.has(trimmed)) return;
    if (Object.prototype.hasOwnProperty.call(dictionary, trimmed)) {
      node.nodeValue = original.replace(trimmed, dictionary[trimmed]);
      return;
    }
    if (phrases && phrases.length) {
      phrases.forEach(function (pair) {
        if (value.indexOf(pair[0]) !== -1) value = value.split(pair[0]).join(pair[1]);
      });
    }
    // Smaller inline phrase replacements for mixed-language nodes.
    Object.keys(dictionary).forEach(function (key) {
      if (key.length < 8 || LOCKED.has(key)) return;
      if (value.indexOf(key) !== -1) value = value.split(key).join(dictionary[key]);
    });
    if (value !== original) node.nodeValue = value;
  }

  function walkText(root, dictionary, phrases) {
    var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return isVisibleTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) applyExactAndPhrase(node, dictionary, phrases);
  }

  function fixPlaceholders(dictionary) {
    document.querySelectorAll('input[placeholder], textarea[placeholder], [title], [aria-label], img[alt]').forEach(function (el) {
      ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (attr) {
        var value = el.getAttribute(attr);
        if (value && dictionary[value]) el.setAttribute(attr, dictionary[value]);
      });
    });
  }

  function apply() {
    if (!document.body) return;
    var current = lang();
    var dictionary = current === 'en' ? EN : MK;
    var phrases = current === 'en' ? EN_PHRASES : [];
    walkText(document.body, dictionary, phrases);
    fixPlaceholders(dictionary);
    document.documentElement.setAttribute('data-wpa-root-lock-lang', current);
  }

  function audit() {
    var current = lang();
    var issues = [];
    var cyr = /[А-Яа-яЃѓЌќЉљЊњЏџЅѕ]/;
    var englishSignals = /\b(About|Programmes|Certification|Publications|Founder|Training|Professional|Institutional|Open|Explore|Contact|Privacy|Sources|Books|Papers)\b/;
    var walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) { return isVisibleTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    var n;
    while ((n = walker.nextNode())) {
      var t = n.nodeValue.trim();
      if (!t || LOCKED.has(t)) continue;
      if (current === 'en' && cyr.test(t)) issues.push({ expected: 'en', text: t.slice(0, 220) });
      if (current === 'mk' && englishSignals.test(t)) issues.push({ expected: 'mk', text: t.slice(0, 220) });
    }
    if (window.console && console.table) console.table(issues.slice(0, 120));
    return issues;
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(apply, 40);
    setTimeout(apply, 180);
    setTimeout(apply, 500);
    setTimeout(apply, 1200);
    setTimeout(apply, 2500);
  }

  window.WPAI18nRootLock = { version: '1.1.0', apply: apply, audit: audit, en: EN, mk: MK, enPhrases: EN_PHRASES, lang: lang };
  window.WPAI18nAudit = audit;

  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('wpa:i18n:loaded', schedule);
  document.addEventListener('wpa:locales-core-ready', schedule);
  document.addEventListener('change', function (event) {
    if (event.target && (event.target.matches('[data-language-switcher], #pageLang, select[aria-label="Select language"]'))) schedule();
  });

  try {
    var mo = new MutationObserver(function () { schedule(); });
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  schedule();
})();

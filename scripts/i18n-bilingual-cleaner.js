/* WPA Bilingual I18N Cleaner v4.1 - Pravopis 2017 final MK audit pass
   World Protocol Academy

   Purpose:
   - Last-mile cleanup for mixed Macedonian / English UI text.
   - Conservative rule-based layer for the Macedonian public version.
   - Fixes true mixed-language phrases from the May 2026 audit pass.
   - Reduces false audit positives by stripping protected brand/proper terms.

   Upload target:
   scripts/i18n-bilingual-cleaner.js
*/
(function () {
  'use strict';

  var VERSION = '4.1-pravopis-2017';

  var PROTECTED_TERMS = [
    'World Protocol Academy',
    'World Protocol Academic Writing System',
    'WPA',
    'WPAWS',
    'WPA Card',
    'WPA Institute',
    'WPA Student Desk',
    'Virtual Sande',
    'Sande',
    'Protocol Symbols Lab',
    'WPA Diplomatic Analysis Lab',
    'Diplomatic Analysis',
    'AD Scientific Index',
    'Google Meet',
    'Meet',
    'Zoom',
    'Webex',
    'ORCID',
    'DOI',
    'QR',
    'AI',
    'PR',
    'WPA Free',
    'WPA Pro',
    'Academic Pro',
    'WPA Audio Media Engine',
    'Audio Media Engine',
    'Ss. Cyril and Methodius University',
    'International University Europa Prima'
  ];

  var EN_TO_MK = [

    // v4.1 direct cleanup from the latest 15-item audit
    ['train-the-trainer и консултантско ниво', 'обучувачко и консултантско ниво'],
    ['Train-the-Trainer и консултантско ниво', 'обучувачко и консултантско ниво'],
    ['membership, партнерски придобивки и одржлива развојна логика', 'членство, партнерски придобивки и одржлива развојна логика'],
    ['како се гради membership и verification слојот', 'како се гради слојот за членство и верификација'],
    ['membership и verification слојот', 'слојот за членство и верификација'],
    ['verification слојот', 'слојот за верификација'],
    ['Assessment, certification и formats', 'Оценување, сертификација и формати'],
    ['Assessment, certification and formats', 'Оценување, сертификација и формати'],
    ['Отвори programmes.html', 'Отвори ја страницата за програми'],
    ['WPA Card како identity, membership, QR verification и пристапен слој', 'WPA Card како идентитет, членство, QR-верификација и пристапен слој'],
    ['identity, membership, QR verification', 'идентитет, членство, QR-верификација'],
    ['QR verification', 'QR-верификација'],
    ['bachelor, master или doctorate degrees', 'додипломски, магистерски или докторски степени'],
    ['master или doctorate degrees', 'магистерски или докторски степени'],
    ['doctorate degrees', 'докторски степени'],
    ['certifica', 'сертификација'],
    ['Институционално and развојна логика', 'Институционална и развојна логика'],
    ['structured non-degree professional education, certification', 'структурирано професионално образование без академски степен, сертификација'],
    ['structured non-degree professional education', 'структурирано професионално образование без академски степен'],
    ['digital verification', 'дигитална верификација'],
    ['programme traceability', 'следливост на програмата'],
    ['program traceability', 'следливост на програмата'],
    ['Preview на learning paths', 'Преглед на патеките на учење'],
    ['learning paths', 'патеки на учење'],
    ['No false claim WPA invented the discipline', 'Без лажно тврдење дека WPA ја измислила дисциплината'],
    ['false claim', 'лажно тврдење'],
    ['invented the discipline', 'ја измислила дисциплината'],
    ['passive revenue', 'пасивен приход'],
    ['Passive revenue', 'Пасивен приход'],
    ['пасивно-приходниот е', 'пасивно-приходниот екосистем'],
    ['WPA Card, passive revenue', 'WPA Card, пасивен приход'],
    ['сертификација, WPA Card, passive revenue', 'сертификација, WPA Card, пасивен приход'],
    ['Основач на World Protocol Academy. Доктор на науки (Ss. Cyril and Methodius University). Вонреден професор на International University Europa Prima.', 'Основач на World Protocol Academy. Доктор на науки (Универзитет „Св. Кирил и Методиј“ во Скопје). Вонреден професор на Меѓународниот универзитет „Еуропа Прима“.'],
    ['Ss. Cyril and Methodius University', 'Универзитет „Св. Кирил и Методиј“ во Скопје'],
    ['International University Europa Prima', 'Меѓународен универзитет „Еуропа Прима“'],
    // =========================================================
    // Audit v4 direct fixes from the 96-item Macedonian output
    // =========================================================
    ['Protocol Симболи Lab', 'Protocol Symbols Lab'],
    ['Protocol Симболи', 'Protocol Symbols'],
    ['Отвори Protocol Симболи Lab →', 'Отвори Protocol Symbols Lab →'],
    ['Отвори Protocol Симболи Lab', 'Отвори Protocol Symbols Lab'],
    ['WPA · Protocol Симболи Lab · Verified database', 'WPA · Protocol Symbols Lab · верифицирана база'],
    ['Verified database', 'верифицирана база'],
    ['Policy на атрибуција', 'политика на атрибуција'],
    ['tracks, assessment logic, membership path', 'насоки, логика на оценување, патека на членство'],
    ['assessment logic', 'логика на оценување'],
    ['membership path', 'патека на членство'],
    ['Programme Families и носечки насоки', 'Програмски семејства и носечки насоки'],
    ['Programme Families', 'Програмски семејства'],
    ['FAQ логика', 'логика на ЧПП'],
    ['serial / QR-верификација модел', 'модел за сериска и QR-верификација'],
    ['serial verification', 'сериска верификација'],
    ['identity, membership, QR-верификација и access layer', 'идентитет, членство, QR-верификација и пристапен слој'],
    ['identity, membership', 'идентитет, членство'],
    ['identity', 'идентитет'],
    ['membership', 'членство'],
    ['access layer', 'пристапен слој'],
    ['access', 'пристап'],
    ['партнерски бенефити', 'партнерски придобивки'],
    ['бенефити', 'придобивки'],
    ['Passive Revenue страницата', 'Страницата за пасивен приход'],
    ['Passive Revenue', 'Пасивен приход'],
    ['Членски придобивки and повторлива вредност', 'Членски придобивки и повторлива вредност'],
    ['Institutional and развојна логика', 'Институционална и развојна логика'],
    ['— Virtual Sande, assessment, верификација', '— Virtual Sande, оценување, верификација'],
    ['assessment, верификација', 'оценување, верификација'],
    ['assessment', 'оценување'],
    ['23 publications', '23 публикации'],
    ['publications вкупно', 'публикации вкупно'],
    ['publications', 'публикации'],
    ['bachelor, master или doctorate степени', 'додипломски, магистерски или докторски степени'],
    ['bachelor, master or doctorate', 'додипломски, магистерски или докторски'],
    ['bachelor', 'додипломски'],
    ['master', 'магистерски'],
    ['doctorate', 'докторски'],
    ['degrees', 'степени'],
    ['certifica', 'сертификација'],
    ['Обучувачка програма методологија', 'Методологија на обучувачката програма'],
    ['општ англиски јазик курс', 'курс по општ англиски јазик'],
    ['специјализиран програмска насока', 'специјализирана програмска насока'],
    ['learning исходи', 'исходи од учењето'],
    ['learning outcomes', 'исходи од учењето'],
    ['Train-the-Обучувач / советник', 'Патека за обучувач / советник'],
    ['Train-the-Trainer', 'Патека за обучувач'],
    ['certificate-based academy pathway', 'сертификациска академска патека'],
    ['programme structures', 'програмски структури'],
    ['program structures', 'програмски структури'],
    ['Напредно lesson paths', 'Напредни патеки на лекции'],
    ['lesson paths', 'патеки на лекции'],
    ['checkout линкови', 'линкови за наплата'],
    ['checkout', 'наплата'],
    ['5 monographs and handbooks, 1 doctoral dissertation, 17 scientific papers and contributions — 23 publications вкупно.', '5 монографии и прирачници, 1 докторска дисертација, 17 научни трудови и прилози — вкупно 23 публикации.'],
    ['5 monographs and handbooks', '5 монографии и прирачници'],
    ['1 doctoral dissertation', '1 докторска дисертација'],
    ['17 scientific papers and contributions', '17 научни трудови и прилози'],
    ['Scientific papers и прилози', 'Научни трудови и прилози'],
    ['scientific papers and contributions', 'научни трудови и прилози'],
    ['monographs and handbooks', 'монографии и прирачници'],
    ['doctoral dissertation', 'докторска дисертација'],
    ['Основач & Director', 'Основач и директор'],
    ['Founder & Director', 'Основач и директор'],
    ['Director', 'директор'],
    ['Основач-led WPA', 'WPA водена од основачот'],
    ['Founder-led WPA', 'WPA водена од основачот'],
    ['led WPA', 'WPA водена'],
    ['selection logic', 'логика на селекција'],
    ['pedagogical design', 'педагошки дизајн'],
    ['question-bank systems', 'системи за банка на прашања'],
    ['question-bank', 'банка на прашања'],
    ['AI workflows', 'AI-процеси'],
    ['original explanatory wording', 'оригинални објаснувачки формулации'],
    ['platform expression', 'платформски израз'],
    ['Sande voice engine', 'мотор за глас на Sande'],
    ['protocol scenario lab', 'лабораторија за протоколарни сценарија'],
    ['viral media studio', 'студио за вирални медиуми'],
    ['live video room governance', 'управување со соба за видео во живо'],
    ['monetization workflows', 'процеси за монетизација'],
    ['workflows', 'процеси'],
    ['Отвори WPA Audio Media Engine', 'Отвори WPA Аудио-медиумски мотор'],
    ['Audio Media Engine', 'Аудио-медиумски мотор'],
    ['World Protocol Academy · Академски протоколарен асистент', 'World Protocol Academy · Академски протоколарен асистент'],

    // =========================================================
    // Direct fixes kept from v3
    // =========================================================
    ['🏛️ Open WPA Institute', '🏛️ Отвори WPA Institute'],
    ['Open WPA Institute', 'Отвори WPA Institute'],
    ['Programme families и носечки насоки', 'Програмски семејства и носечки насоки'],
    ['Programme families', 'Програмски семејства'],
    ['Assessment, certification and formats', 'Оценување, сертификација и формати'],
    ['WPA Free · Pro · Academic Pro · Институционално', 'WPA Free · WPA Pro · Academic Pro · Институционално'],
    ['WPAWS (World Protocol Academic Writing System) is', 'WPAWS (World Protocol Academic Writing System) е'],
    ['Academic writing and research tools', 'Академски алатки за пишување и истражување'],
    ['Academic writing', 'Академско пишување'],
    ['research tools', 'алатки за истражување'],
    ['Virtual Sande in Academic mode', 'Virtual Sande во академски режим'],
    ['Academic mode', 'академски режим'],
    ['Банка на прашања и Assessment engine', 'Банка на прашања и механизам за оценување'],
    ['Assessment engine', 'механизам за оценување'],
    ['Open Партнерства', 'Отвори Партнерства'],
    ['Official titles and verification: which anthems are officially instrumental.', 'Официјални наслови и верификација: кои химни се официјално инструментални.'],
    ['Official titles and verification', 'Официјални наслови и верификација'],
    ['which anthems are officially instrumental', 'кои химни се официјално инструментални'],
    ['53 verified records · Official WPA verified protocol database', '53 верифицирани записи · Официјална WPA верифицирана протоколарна база'],
    ['Official WPA verified protocol database', 'Официјална WPA верифицирана протоколарна база'],
    ['verified records', 'верифицирани записи'],
    ['Certificate Програми', 'Сертификациски програми'],
    ['Official address and formal speech', 'Официјално обраќање и формален говор'],
    ['Институционално Email English', 'Институционален англиски за електронска пошта'],
    ['Institutional Email English', 'Институционален англиски за електронска пошта'],
    ['Institutional email communication', 'Институционална комуникација по електронска пошта'],
    ['Academic sessions, short briefings and individual consultations', 'Академски сесии, кратки брифинзи и индивидуални консултации'],
    ['Обучувач / советник Track', 'Патека за обучувач / советник'],
    ['Protocol Track', 'Протоколарна насока'],
    ['Communication Track', 'Комуникациска насока'],
    ['Институционално Track', 'Институционална насока'],
    ['Open full Сертификација Page', 'Отвори целосна страница за сертификација'],
    ['Question 01', 'Прашање 01'],
    ['Question 02', 'Прашање 02'],
    ['Question 03', 'Прашање 03'],
    ['Question 04', 'Прашање 04'],
    ['Question 05', 'Прашање 05'],
    ['Question 06', 'Прашање 06'],
    ['Certificate preparation', 'Подготовка за сертификат'],
    ['Academic Virtual Sande', 'Академски Virtual Sande'],
    ['Контактирај за Academic', 'Контактирај за Academic Pro'],
    ['Open official bibliography →', 'Отвори ја официјалната библиографија →'],
    ['Official WPA channels', 'Официјални WPA канали'],
    ['Virtual Sande — Source & Attribution Logic', 'Virtual Sande — логика на извори и атрибуција'],
    ['Source & Attribution Logic', 'Логика на извори и атрибуција'],
    ['Attribution Logic', 'Логика на атрибуција'],
    ['Source logic', 'Логика на извори'],
    ['research, Protocol, Diplomacy, Teaching and Press', 'истражување, протокол, дипломатија, настава и печат'],
    ['Research, Protocol, Diplomacy, Teaching and Press', 'Истражување, протокол, дипломатија, настава и печат'],

    // =========================================================
    // Core programme and homepage vocabulary
    // =========================================================
    ['Programmes, Certification, WPA Card and Passive Revenue', 'Програми, Сертификација, WPA Card и Пасивен приход'],
    ['Programmes, Certification, WPA Card и Passive Revenue', 'Програми, Сертификација, WPA Card и Пасивен приход'],
    ['Programmes → Certification → WPA Card → Passive Revenue', 'Програми → Сертификација → WPA Card → Пасивен приход'],
    ['Foundation → Professional → Advanced → Train-the-Trainer', 'Основно → Професионално → Напредно → Обучувачко'],
    ['Foundation → Professional → Advanced → Trainer', 'Основно → Професионално → Напредно → Обучувачко'],
    ['Pass · Distinction · High Distinction', 'Положено · Одличен успех · Висок одличен успех'],
    ['Certificate Programmes — структурирани professional pathways', 'Сертификациски програми — структурирани професионални патеки'],
    ['Non-degree professional education', 'Професионално образование без академски степен'],
    ['structured professional certificate programmes', 'структурирани професионални сертификациски програми'],
    ['professional certificate programmes', 'професионални сертификациски програми'],
    ['certificate programmes', 'сертификациски програми'],
    ['certificate programme', 'сертификациска програма'],
    ['training pathways', 'патеки за обука'],
    ['professional pathways', 'професионални патеки'],
    ['programme architecture', 'програмска архитектура'],
    ['programme track', 'програмска насока'],
    ['template logic', 'логика на шаблони'],
    ['formal follow-up', 'формално дополнително обраќање'],
    ['rescue phrases', 'фрази за излез од тешка ситуација'],
    ['general English', 'општ англиски јазик'],
    ['email комуникација', 'комуникација по електронска пошта'],
    ['Programme Architecture', 'Програмска архитектура'],
    ['Programmes Page', 'Страница за програми'],
    ['Certification Logic', 'Логика на сертификација'],
    ['Certification Page', 'Страница за сертификација'],
    ['Membership & Access', 'Членство и пристап'],
    ['Partner & Growth Logic', 'Партнерска и развојна логика'],
    ['Passive Revenue Page', 'Страница за пасивен приход'],
    ['Main house', 'Главна куќа'],
    ['Platform layer', 'Платформски слој'],
    ['Specialized subsystem', 'Специјализиран потсистем'],
    ['Publication layer', 'Публикациски слој'],
    ['Institutional partnerships', 'Институционални партнерства'],
    ['Books and papers', 'Книги и трудови'],
    ['Verified facts only', 'Само верифицирани факти'],
    ['Sources, Authorship and Educational Use', 'Извори, авторство и образовна употреба'],
    ['Use of sources, citation and copyright', 'Употреба на извори, цитирање и авторски права'],
    ['Labs, innovation and authorship protection', 'Лаборатории, иновација и заштита на авторството'],
    ['Official Channels', 'Официјални канали'],
    ['Academic Profiles', 'Академски профили'],
    ['Key Areas', 'Клучни области'],

    // UI and navigation
    ['About', 'За нас'],
    ['Manifest', 'Манифест'],
    ['Programmes', 'Програми'],
    ['Programs', 'Програми'],
    ['Formats', 'Формати'],
    ['Certification', 'Сертификација'],
    ['Cert FAQ', 'ЧПП за сертификати'],
    ['Certificate FAQ', 'Прашања за сертификати'],
    ['Books', 'Книги'],
    ['Bibliography', 'Библиографија'],
    ['Papers', 'Трудови'],
    ['Partnerships', 'Партнерства'],
    ['Symbols', 'Симболи'],
    ['Membership', 'Членство'],
    ['Founder', 'Основач'],
    ['Policy', 'Политика'],
    ['Privacy Policy', 'Политика за приватност'],
    ['Privacy', 'Приватност'],
    ['Contact', 'Контакт'],
    ['Language', 'Јазик'],
    ['Open Certification', 'Отвори Сертификација'],
    ['Open WPAWS', 'Отвори WPAWS'],
    ['Open Passive Revenue', 'Отвори Пасивен приход'],
    ['Open Partnerships', 'Отвори Партнерства'],
    ['Open Papers', 'Отвори Трудови'],
    ['Open full Certification Page', 'Отвори целосна страница за сертификација'],
    ['Open WPA Card Page', 'Отвори страница за WPA Card'],
    ['Open →', 'Отвори →'],
    ['Explore the Academy', 'Истражете ја Академијата'],
    ['Explore WPA Programmes', 'Истражи ги WPA програмите'],
    ['Ask WPA Student Desk', 'Прашај го WPA Student Desk'],

    // Institutional vocabulary
    ['Scientific papers', 'Научни трудови'],
    ['Years of experience', 'Години искуство'],
    ['Languages', 'Јазици'],
    ['Academic Layer', 'Академски слој'],
    ['Institutional layer', 'Институционален слој'],
    ['Trainer Layer', 'Обучувачки слој'],
    ['Revenue Layer', 'Приходен слој'],
    ['revenue layer', 'приходен слој'],
    ['Revenue слој', 'Приходен слој'],
    ['growth logic', 'развојна логика'],
    ['growth логика', 'развојна логика'],
    ['future benefits layer', 'слој за идни придобивки'],
    ['Future benefits layer', 'Слој за идни придобивки'],
    ['Access, status и future benefits layer', 'Пристап, статус и слој за идни придобивки'],
    ['member benefits', 'членски придобивки'],
    ['Member benefits', 'Членски придобивки'],
    ['partner benefits', 'партнерски придобивки'],
    ['recurring value', 'повторлива вредност'],
    ['Digital credentials', 'Дигитални акредитиви'],
    ['Serial verification', 'Сериска верификација'],
    ['Assessment logic', 'Логика на оценување'],
    ['Question bank', 'Банка на прашања'],
    ['Attribution logic', 'Логика на атрибуција'],
    ['Educational responses', 'Образовни одговори'],
    ['Editorial IP', 'Уредувачка интелектуална сопственост'],
    ['Paraphrase standard', 'Стандард за парафразирање'],
    ['Attribution policy', 'Политика на атрибуција'],

    // Programme / certification vocabulary
    ['Professional English', 'Професионален англиски'],
    ['Protocol English', 'Англиски за протокол'],
    ['Diplomatic English', 'Дипломатски англиски'],
    ['Conference and Moderation English', 'Англиски за конференции и модерирање'],
    ['Public Presence English', 'Англиски за јавна појава'],
    ['Executive Response and Recovery Phrases', 'Извршни одговори и фрази за излез од тешка ситуација'],
    ['Foundation Certificate Programme', 'Основна сертификациска програма'],
    ['Professional Certificate Programme', 'Професионална сертификациска програма'],
    ['Advanced Certificate Programme', 'Напредна сертификациска програма'],
    ['Train-the-Trainer / Consultant Programme', 'Програма за обучувач / советник'],
    ['Train-the-Trainer / Consultant Track', 'Патека за обучувач / советник'],
    ['Train-the-Trainer methodology', 'Обучувачка методологија'],
    ['Trainer / Consultant', 'Обучувач / советник'],
    ['Foundation Layer', 'Основен слој'],
    ['Professional Layer', 'Професионален слој'],
    ['Advanced Layer', 'Напреден слој'],
    ['Foundation Certificate', 'Основен сертификат'],
    ['Professional Certificate', 'Професионален сертификат'],
    ['Advanced Certificate', 'Напреден сертификат'],
    ['Foundation', 'Основно'],
    ['Professional', 'Професионално'],
    ['Advanced', 'Напредно'],
    ['certificate levels', 'нивоа на сертификати'],
    ['Certification ladder', 'сертификациска скала'],
    ['score bands', 'опсези на резултати'],
    ['High Distinction', 'Висок одличен успех'],
    ['Distinction', 'Одличен успех'],
    ['Pass', 'Положено'],
    ['assessment standards', 'стандарди за оценување'],
    ['Outcomes', 'Исходи'],
    ['outcomes', 'исходи'],
    ['Tracks', 'Насоки'],
    ['Track', 'Насока'],
    ['flagship tracks', 'носечки насоки'],
    ['front-facing professionals', 'професионалци со јавна и услужна улога'],
    ['front-facing', 'јавно изложени'],
    ['executive-style', 'извршно-ориентирани'],
    ['masterclasses', 'мастер-класи'],
    ['webinars', 'вебинари'],
    ['moderation', 'модерирање'],
    ['Online', 'Онлајн'],
    ['Training', 'Обука'],

    // Books, symbols, metadata
    ['Flags and coats of arms', 'Знамиња и грбови'],
    ['Coats of arms and state seals', 'Грбови и државни печати'],
    ['Capitals · Continents', 'Главни градови · Континенти'],
    ['State Protocol', 'Државен протокол'],
    ['Conference Handbook', 'Конференциски прирачник'],
    ['Diplomacy and Security', 'Дипломатија и безбедност'],
    ['Diplomacy, Protocol and Security', 'Дипломатија, протокол и безбедност'],
    ['Digital Era', 'Дигитална ера'],
    ['Official bibliography', 'Официјална библиографија'],
    ['Total publications', 'Вкупно публикации'],
    ['Open PDF access', 'Отворен PDF пристап'],
    ['View the bibliography →', 'Разгледајте ја библиографијата →'],
    ['Open the papers →', 'Отворете ги трудовите →'],
    ['1000 Skopje, Republic of North Macedonia', '1000 Скопје, Република Северна Македонија'],
    ['Skopje 1000, Republic of North Macedonia', 'Скопје 1000, Република Северна Македонија']
  ];

  var MK_STYLE_FIXES = [
    ['Скопје 1000, Северна Македонија', 'Скопје 1000, Република Северна Македонија'],
    ['онлајн сесии', 'онлајн-сесии'],
    ['Онлајн сесии', 'Онлајн-сесии'],
    ['онлајн средби', 'онлајн-средби'],
    ['Онлајн средби', 'Онлајн-средби'],
    ['QR verification', 'QR-верификација'],
    ['bachelor, master или doctorate degrees', 'додипломски, магистерски или докторски степени'],
    ['master или doctorate degrees', 'магистерски или докторски степени'],
    ['doctorate degrees', 'докторски степени'],
    ['certifica', 'сертификација'],
    ['QR идентификација', 'QR-идентификација'],
    ['AI поддржано', 'AI-поддржано'],
    ['AI поддржана', 'AI-поддржана'],
    ['AI водена', 'AI-водена'],
    ['AI асистент', 'AI-асистент'],
    ['еmail', 'електронска пошта'],
    ['email', 'електронска пошта'],
    ['E-mail', 'Електронска пошта'],
    ['е-пошта комуникација', 'комуникација по електронска пошта'],
    ['електронска пошта комуникација', 'комуникација по електронска пошта'],
    ['сертификациска програма програми', 'сертификациски програми'],
    ['програми програми', 'програми'],
    ['Јазикs', 'Јазици'],
  ];

  var MK_TYPO_FIXES = [
    ['цертификација', 'сертификација'],
    ['цертификат', 'сертификат'],
    ['цертификати', 'сертификати'],
    ['сертификатион', 'сертификација'],
    ['превдувач', 'преведувач'],
    ['преведуач', 'преведувач'],
    ['инстументалн', 'инструменталн'],
    ['Ксово', 'Косово'],
    ['следновалните', 'следните'],
    ['nastapот', 'настапот'],
    ['nastap', 'настап'],
    ['makeodnskiot', 'македонскиот'],
    ['makeodnski', 'македонски'],
    ['makedonskiot', 'македонскиот'],
    ['makedonski', 'македонски']
  ];

  var MK_TO_EN_SAFE = [
    ['Пасивен приход', 'Passive Revenue'],
    ['Отвори Пасивен приход', 'Open Passive Revenue'],
    ['Страница за пасивен приход', 'Passive Revenue Page'],
    ['Професионален англиски', 'Professional English'],
    ['Програми', 'Programmes'],
    ['Сертификација', 'Certification'],
    ['Членство', 'Membership'],
    ['Партнерства', 'Partnerships'],
    ['Трудови', 'Papers'],
    ['Приватност', 'Privacy'],
    ['Контакт', 'Contact']
  ];

  var EN_ISSUE_PATTERNS = [
    /\b(About|Programmes|Programs|Certification|Publications|Founder|Training|Professional|Institutional|Open|Explore|Contact|Privacy|Sources|Books|Papers|Scientific|Foundation|Advanced|Question|Official|Academic|Membership|Revenue|Layer|Logic|Page|Certificate|Programme|Program|Track|Tracks|Assessment|Digital|Credentials|Editorial|Attribution|Pass|Distinction|Benefits|Recurring|Value|Growth|Access|Format|Template|Rescue|Email|Online|Masterclass|Webinar)\b/i,
    /\b(tracks|assessment|logic|membership|path|policy|FAQ|serial|identity|access|layer|benefits|and|institutional|verified|database|publications|bachelor|master|doctorate|learning|certificate-based|academy|pathway|structures|lesson|paths|checkout|monographs|handbooks|doctoral|dissertation|contributions|director|founder-led|selection|pedagogical|design|workflows|wording|expression|voice|engine|scenario|lab|viral|media|studio|governance|monetization|verification|traceability|preview|non-degree|false|claim|invented|discipline|passive)\b/i,
    /&/,
    /\bSource\s*&\s*Attribution\b/i
  ];

  var CYRILLIC = /[А-Яа-яЃѓЌќЉљЊњЏџЅѕ]/;

  function normalizeLanguage(lang) {
    var value = String(lang || '').trim();
    if (!value) return 'mk';
    if (value === 'zh') return 'zh-Hans';
    if (value === 'zht') return 'zh-Hant';
    return value;
  }

  function currentLang(override) {
    if (override) return normalizeLanguage(override);

    var queryLang = '';
    try { queryLang = new URLSearchParams(location.search).get('lang') || ''; } catch (e) {}

    var htmlLang = document.documentElement.getAttribute('lang') || '';
    var bodyLang = document.body && (document.body.getAttribute('data-current-language') || document.body.getAttribute('data-lang')) || '';
    var select = document.getElementById('pageLang') || document.querySelector('[data-language-switcher]');
    var fromSelect = select && select.value ? select.value : '';
    var stored = '';
    try { stored = localStorage.getItem('wpa_language') || localStorage.getItem('wpa-lang') || localStorage.getItem('selectedLanguage') || ''; } catch (e) {}

    // Prefer the actual document language over a stale saved/select value.
    return normalizeLanguage(queryLang || htmlLang || bodyLang || fromSelect || stored || 'mk');
  }

  function isMacedonianMode(lang) {
    return normalizeLanguage(lang).toLowerCase() === 'mk';
  }

  function isEnglishMode(lang) {
    return normalizeLanguage(lang).toLowerCase().indexOf('en') === 0;
  }

  function isProtectedFullValue(value) {
    var trimmed = String(value || '').trim();
    return PROTECTED_TERMS.indexOf(trimmed) !== -1;
  }

  function stripProtectedSubstrings(value) {
    var output = String(value || '');

    PROTECTED_TERMS
      .slice()
      .sort(function (a, b) { return b.length - a.length; })
      .forEach(function (term) {
        if (!term) return;
        output = output.split(term).join('');
      });

    // Remove common safe technical fragments that are allowed in Macedonian UI.
    output = output.replace(/\b(MK|EN|HTML|CSS|JS|URL|PDF|CSV|JSON|SEO|CTA|CI|DOI|ORCID|QR|AI|PR)\b/g, '');
    output = output.replace(/https?:\/\/\S+/g, '');
    output = output.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '');
    output = output.replace(/\b[A-Z]{1,4}-?\d{2,}\b/g, '');
    return output;
  }

  function buildMap(lang) {
    var map = [];
    if (isMacedonianMode(lang)) {
      map = map.concat(EN_TO_MK, MK_STYLE_FIXES, MK_TYPO_FIXES);
    } else if (isEnglishMode(lang)) {
      map = map.concat(MK_TO_EN_SAFE);
    }

    var seen = Object.create(null);
    return map
      .filter(function (pair) {
        if (!pair || !pair[0] || pair[0] === pair[1]) return false;
        var key = pair[0] + '→' + pair[1];
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      })
      .sort(function (a, b) { return b[0].length - a[0].length; });
  }

  function skipTextNode(node) {
    if (!node || node.nodeType !== 3 || !node.nodeValue || !node.nodeValue.trim()) return true;
    var parent = node.parentElement;
    if (!parent) return true;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|OPTION)$/i.test(parent.tagName)) return true;
    if (parent.closest('[data-i18n-cleaner="off"],[data-no-i18n-cleaner],[data-brand-locked]')) return true;
    if (isProtectedFullValue(node.nodeValue)) return true;
    return false;
  }

  function replaceAllSafe(value, from, to) {
    if (!value || value.indexOf(from) === -1) return value;
    return value.split(from).join(to);
  }

  function cleanValue(value, dict) {
    if (isProtectedFullValue(value)) return value;
    var output = String(value);
    dict.forEach(function (pair) { output = replaceAllSafe(output, pair[0], pair[1]); });
    return output;
  }

  function apply(langOverride) {
    if (!document.body) return;
    var lang = currentLang(langOverride);
    var dict = buildMap(lang);
    if (!dict.length) return;

    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      { acceptNode: function (node) { return skipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }
    );

    var node;
    while ((node = walker.nextNode())) {
      var cleaned = cleanValue(node.nodeValue, dict);
      if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
    }

    ['placeholder', 'title', 'aria-label', 'alt', 'value'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (element) {
        if (element.closest('[data-i18n-cleaner="off"],[data-no-i18n-cleaner],[data-brand-locked]')) return;
        var value = element.getAttribute(attr);
        if (!value || isProtectedFullValue(value)) return;
        var cleaned = cleanValue(value, dict);
        if (cleaned !== value) element.setAttribute(attr, cleaned);
      });
    });

    document.documentElement.setAttribute('data-wpa-bilingual-cleaner', lang);
    document.documentElement.setAttribute('data-wpa-bilingual-cleaner-version', VERSION);
  }

  function isMacedonianIssue(text) {
    var check = stripProtectedSubstrings(text);
    if (!check.trim()) return false;
    return EN_ISSUE_PATTERNS.some(function (pattern) { return pattern.test(check); });
  }

  function isEnglishIssue(text) {
    var check = stripProtectedSubstrings(text);
    if (!check.trim()) return false;
    return CYRILLIC.test(check);
  }

  function audit(langOverride) {
    var lang = currentLang(langOverride);
    var issues = [];

    var walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      { acceptNode: function (node) { return skipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }
    );

    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue.trim();
      if (!text || isProtectedFullValue(text)) continue;
      if (isMacedonianMode(lang) && isMacedonianIssue(text)) issues.push(text.slice(0, 260));
      if (isEnglishMode(lang) && isEnglishIssue(text)) issues.push(text.slice(0, 260));
    }

    if (window.console && typeof console.table === 'function') console.table(issues.slice(0, 200));
    return issues;
  }

  function schedule() {
    [40, 180, 600, 1400, 3000, 6500].forEach(function (ms) { setTimeout(function () { apply(); }, ms); });
  }

  window.WPABilingualCleaner = {
    version: VERSION,
    apply: apply,
    audit: audit,
    schedule: schedule,
    protectedTerms: PROTECTED_TERMS.slice()
  };
  window.WPABilingualAudit = audit;

  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('wpa:i18n:loaded', schedule);
  document.addEventListener('wpa:locales-core-ready', schedule);
  document.addEventListener('change', function (event) {
    if (event.target && event.target.matches('select,#pageLang,[data-language-switcher]')) schedule();
  });

  try {
    new MutationObserver(function () {
      clearTimeout(window.__wpaBilingualCleanerTimer);
      window.__wpaBilingualCleanerTimer = setTimeout(function () { apply(); }, 120);
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  schedule();
})();

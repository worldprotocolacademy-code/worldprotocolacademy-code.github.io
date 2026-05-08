/* WPA Bilingual I18N Cleaner v3.1 - Pravopis 2017 pass
   World Protocol Academy

   Purpose:
   - Last-mile cleanup for mixed Macedonian / English UI text.
   - Conservative rule-based layer for the Macedonian public version.
   - Protects WPA brand terms before replacements, then restores them.
   - Reduces false positives in WPABilingualAudit().
   - Skips scripts, styles, code, pre, textarea, option and explicit opt-out blocks.

   Upload target:
   scripts/i18n-bilingual-cleaner.js
*/
(function () {
  'use strict';

  var VERSION = '3.1-pravopis-2017';

  var PROTECTED_TERMS = [
    'World Protocol Academy',
    'World Protocol Academic Writing System',
    'WPA Diplomatic Analysis Lab',
    'Protocol Symbols Lab',
    'WPA Audio Media Engine',
    'Audio Media Engine',
    'WPA Student Desk',
    'WPA Institute',
    'WPA Card',
    'Virtual Sande',
    'AD Scientific Index',
    'Google Scholar',
    'ResearchGate',
    'Academia.edu',
    'Google Meet',
    'Academic Pro',
    'WPA Free',
    'WPA Pro',
    'WPAWS',
    'ORCID',
    'DOI',
    'QR',
    'AI',
    'PR',
    'WPA',
    'Meet',
    'Zoom',
    'Webex'
  ];

  var EN_TO_MK = [
    // v3.1 direct cleanup from the latest audit
    ['Protocol Симболи Lab', 'Protocol Symbols Lab'],
    ['Protocol Симболи · Diplomatic Analysis · WPAWS', 'Protocol Symbols Lab · WPA Diplomatic Analysis Lab · WPAWS'],
    ['WPA · Protocol Симболи Lab · Verified database', 'WPA · Protocol Symbols Lab · Верифицирана база'],
    ['Отвори Protocol Симболи Lab →', 'Отвори Protocol Symbols Lab →'],
    ['Отвори Protocol Симболи Lab', 'Отвори Protocol Symbols Lab'],
    ['Уредувачка интелектуална сопственост · Стандард за парафразирање · Policy на атрибуција', 'Уредувачка интелектуална сопственост · Стандард за парафразирање · Политика на атрибуција'],
    ['Policy на атрибуција', 'Политика на атрибуција'],
    ['Целосна WPA програмска архитектура: нивоа, програмски семејства, tracks, assessment logic, membership path и формати на обука.', 'Целосна WPA програмска архитектура: нивоа, програмски семејства, насоки, логика на оценување, патека на членство и формати на обука.'],
    ['tracks, assessment logic, membership path', 'насоки, логика на оценување, патека на членство'],
    ['assessment logic', 'логика на оценување'],
    ['Assessment logic', 'Логика на оценување'],
    ['membership path', 'патека на членство'],
    ['Programme Families и носечки насоки', 'Програмски семејства и носечки насоки'],
    ['Programme families и носечки насоки', 'Програмски семејства и носечки насоки'],
    ['Programme Families', 'Програмски семејства'],
    ['Programme families', 'Програмски семејства'],
    ['Четири WPA сертификати, прагови на успех, опсези на резултати, FAQ логика и идниот serial / QR-верификација модел.', 'Четири WPA сертификати, прагови на успех, опсези на резултати, логика на ЧПП и иден модел за сериска и QR-верификација.'],
    ['FAQ логика', 'логика на ЧПП'],
    ['идниот serial / QR-верификација модел', 'идниот модел за сериска и QR-верификација'],
    ['serial / QR-верификација модел', 'модел за сериска и QR-верификација'],
    ['WPA Card како identity, membership, QR-верификација и access layer што ги поврзува програмите, сертификатите и идните партнерски бенефити.', 'WPA Card како идентитет, членство, QR-верификација и пристапен слој што ги поврзува програмите, сертификатите и идните партнерски придобивки.'],
    ['identity, membership, QR-верификација и access layer', 'идентитет, членство, QR-верификација и пристапен слој'],
    ['access layer', 'пристапен слој'],
    ['partnerски бенефити', 'партнерски придобивки'],
    ['партнерски бенефити', 'партнерски придобивки'],
    ['бенефити', 'придобивки'],
    ['Passive Revenue страницата ја поврзува WPA Card логиката', 'Страницата за пасивен приход ја поврзува логиката на WPA Card'],
    ['Passive Revenue страницата', 'Страницата за пасивен приход'],
    ['Членски придобивки and повторлива вредност', 'Членски придобивки и повторлива вредност'],
    ['Member benefits and recurring value', 'Членски придобивки и повторлива вредност'],
    ['Institutional and развојна логика', 'Институционална и развојна логика'],
    ['Institutional and growth logic', 'Институционална и развојна логика'],
    ['Verified database', 'Верифицирана база'],
    ['verified database', 'верифицирана база'],
    ['— Virtual Sande, assessment, верификација', '— Virtual Sande, оценување, верификација'],
    ['assessment, верификација', 'оценување, верификација'],
    ['— 23 publications (5 монографии, 1 дисертација, 17 трудови), 25+ год. искуство', '— 23 публикации (5 монографии, 1 дисертација, 17 трудови), 25+ год. искуство'],
    ['23 publications', '23 публикации'],
    ['⚠ WPA нивоата не се bachelor, master или doctorate степени — тоа се структурирани професионални сертификациски програми.', '⚠ WPA нивоата не се додипломски, магистерски или докторски степени — тоа се структурирани професионални сертификациски програми.'],
    ['bachelor, master или doctorate степени', 'додипломски, магистерски или докторски степени'],
    ['Обучувачка програма методологија', 'Методологија за обучувачка програма'],
    ['општ англиски јазик курс', 'курс по општ англиски јазик'],
    ['специјализиран програмска насока', 'специјализирана програмска насока'],
    ['learning исходи', 'исходи од учењето'],
    ['learning outcomes', 'исходи од учењето'],
    ['Train-the-Обучувач / советник', 'обучувач / советник'],
    ['certificate-based academy pathway', 'академска патека заснована на сертификати'],
    ['programme structures', 'програмски структури'],
    ['serial verification', 'сериска верификација'],
    ['Напредно lesson paths', 'Напредни наставни патеки'],
    ['lesson paths', 'наставни патеки'],
    ['checkout линкови', 'линкови за плаќање'],
    ['5 monographs and handbooks, 1 doctoral dissertation, 17 scientific papers and contributions — 23 publications вкупно.', '5 монографии и прирачници, 1 докторска дисертација, 17 научни трудови и прилози — вкупно 23 публикации.'],
    ['5 monographs and handbooks', '5 монографии и прирачници'],
    ['1 doctoral dissertation', '1 докторска дисертација'],
    ['17 scientific papers and contributions', '17 научни трудови и прилози'],
    ['23 publications вкупно', 'вкупно 23 публикации'],
    ['Scientific papers и прилози', 'Научни трудови и прилози'],
    ['Основач & Director', 'Основач и директор'],
    ['Founder & Director', 'Основач и директор'],
    ['Основач-led WPA', 'WPA водена од основачот'],
    ['Founder-led WPA', 'WPA водена од основачот'],
    ['Assoc. Prof. Dr. Sande Smiljanov · Основач и директор на WPA · Вонреден професор', 'Доц. д-р Санде Смиљанов · Основач и директор на WPA · Вонреден професор'],
    ['WPA го задржува авторството врз сопствената структура, selection logic, pedagogical design, програмска архитектура, question-bank systems, AI workflows, original explanatory wording и platform expression.', 'WPA го задржува авторството врз сопствената структура, логика на селекција, педагошки дизајн, програмска архитектура, системи на банка на прашања, AI работни процеси, оригинални објаснувачки формулации и платформски израз.'],
    ['selection logic', 'логика на селекција'],
    ['pedagogical design', 'педагошки дизајн'],
    ['question-bank systems', 'системи на банка на прашања'],
    ['AI workflows', 'AI работни процеси'],
    ['original explanatory wording', 'оригинални објаснувачки формулации'],
    ['platform expression', 'платформски израз'],
    ['Централна WPA лабораторија за аудио книги, Sande voice engine, protocol scenario lab,\n      viral media studio, live video room governance и monetization workflows.', 'Централна WPA лабораторија за аудио книги, мотор за гласот на Sande, лабораторија за протоколарни сценарија,\n      студио за вирални медиуми, управување со видео-соби во живо и работни процеси за монетизација.'],
    ['Sande voice engine', 'мотор за гласот на Sande'],
    ['protocol scenario lab', 'лабораторија за протоколарни сценарија'],
    ['viral media studio', 'студио за вирални медиуми'],
    ['live video room governance', 'управување со видео-соби во живо'],
    ['monetization workflows', 'работни процеси за монетизација'],
    ['Отвори WPA Audio Media Engine', 'Отвори WPA Аудио-медиумски мотор'],

    // v3 inherited direct fixes
    ['🏛️ Open WPA Institute', '🏛️ Отвори WPA Institute'],
    ['Open WPA Institute', 'Отвори WPA Institute'],
    ['Assessment, certification and formats', 'Оценување, сертификација и формати'],
    ['WPA Free · Pro · Academic Pro · Институционално', 'WPA Free · WPA Pro · Academic Pro · Институционално'],
    ['WPAWS (World Protocol Academic Writing System) is', 'WPAWS (World Protocol Academic Writing System) е'],
    ['Academic writing and research tools', 'Академски алатки за пишување и истражување'],
    ['Virtual Sande in Academic mode', 'Virtual Sande во академски режим'],
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
    ['Open WPA Аудио-медиумски мотор', 'Отвори WPA Аудио-медиумски мотор'],

    // General controlled vocabulary
    ['research, Protocol, Diplomacy, Teaching and Press', 'истражување, протокол, дипломатија, настава и печат'],
    ['Research, Protocol, Diplomacy, Teaching and Press', 'Истражување, протокол, дипломатија, настава и печат'],
    ['Academic writing', 'Академско пишување'],
    ['research tools', 'алатки за истражување'],
    ['Academic mode', 'академски режим'],
    ['Source logic', 'Логика на извори'],
    ['Attribution Logic', 'Логика на атрибуција'],
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
    ['Institutional email communication', 'Институционална комуникација по електронска пошта'],
    ['Institutional Email English', 'Институционален англиски за електронска пошта'],
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
    ['About', 'За нас'],
    ['Manifest', 'Манифест'],
    ['Programmes', 'Програми'],
    ['Programs', 'Програми'],
    ['Formats', 'Формати'],
    ['Certification', 'Сертификација'],
    ['Passive Revenue', 'Пасивен приход'],
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
    ['Meet Virtual Sande', 'Запознајте го Virtual Sande'],
    ['Ask WPA Student Desk', 'Прашај го WPA Student Desk'],
    ['Publications', 'Публикации'],
    ['Scientific papers', 'Научни трудови'],
    ['Years of experience', 'Години искуство'],
    ['Languages', 'Јазици'],
    ['Academic Layer', 'Академски слој'],
    ['AI Layer', 'AI слој'],
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
    ['Question bank', 'Банка на прашања'],
    ['Question Bank', 'Банка на прашања'],
    ['Attribution logic', 'Логика на атрибуција'],
    ['Educational responses', 'Образовни одговори'],
    ['Editorial IP', 'Уредувачка интелектуална сопственост'],
    ['Paraphrase standard', 'Стандард за парафразирање'],
    ['Attribution policy', 'Политика на атрибуција'],
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
    ['Train-the-Trainer', 'Обучувачка програма'],
    ['Trainer / Consultant', 'Обучувач / советник'],
    ['Trainer', 'Обучувач'],
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
    ['certificate level', 'ниво на сертификат'],
    ['Certification ladder', 'сертификациска скала'],
    ['certification ladder', 'сертификациска скала'],
    ['score bands', 'опсези на резултати'],
    ['Pass', 'Положено'],
    ['High Distinction', 'Висок одличен успех'],
    ['Distinction', 'Одличен успех'],
    ['assessment standards', 'стандарди за оценување'],
    ['Assessment standards', 'Стандарди за оценување'],
    ['outcomes', 'исходи'],
    ['Outcomes', 'Исходи'],
    ['Format', 'Формат'],
    ['Tracks', 'Насоки'],
    ['Track', 'Насока'],
    ['flagship tracks', 'носечки насоки'],
    ['Flagship tracks', 'Носечки насоки'],
    ['front-facing professionals', 'професионалци со јавна и услужна улога'],
    ['front-facing услуги', 'јавни и услужни улоги'],
    ['front-facing', 'јавно изложени'],
    ['executive-style', 'извршно-ориентирани'],
    ['Executive-style', 'Извршно-ориентирани'],
    ['masterclasses', 'мастер-класи'],
    ['Masterclasses', 'Мастер-класи'],
    ['webinars', 'вебинари'],
    ['Webinars', 'Вебинари'],
    ['moderation', 'модерирање'],
    ['Moderation', 'Модерирање'],
    ['Online', 'Онлајн'],
    ['Training', 'Обука'],
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
    ['QR идентификација', 'QR-идентификација'],
    ['AI поддржано', 'AI-поддржано'],
    ['AI поддржана', 'AI-поддржана'],
    ['AI водена', 'AI-водена'],
    ['еmail', 'електронска пошта'],
    ['email', 'електронска пошта'],
    ['E-mail', 'Електронска пошта'],
    ['е-пошта комуникација', 'комуникација по електронска пошта'],
    ['електронска пошта комуникација', 'комуникација по електронска пошта'],
    ['сертификациска програма програми', 'сертификациски програми'],
    ['програми програми', 'програми'],
    ['Јазикs', 'Јазици']
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

  var AUDIT_REAL_PATTERNS_MK = [
    /\b(Programme|Programmes|Program|Programs|Certificate Programmes|Policy|Track|Tracks|Assessment|assessment|membership|identity|access layer|benefits|Passive Revenue|Institutional and|Verified database|bachelor|master|doctorate|learning|certificate-based|programme structures|serial verification|lesson paths|checkout|monographs?|handbooks?|doctoral dissertation|scientific papers|publications|Director|Founder-led|led WPA|selection logic|pedagogical design|question-bank systems|original explanatory wording|platform expression|Sande voice engine|protocol scenario lab|viral media studio|live video room governance|monetization workflows|Audio Media Engine)\b/i,
    /\b(and|or|the|with|for|from|of|to|as|is|are|will|can|should|which)\b/i,
    /[A-Za-z]+-[A-Za-z]+\s+(logic|systems|engine|studio|governance|workflows|pathway)/i
  ];

  function normalizeLanguage(lang) {
    var value = String(lang || '').trim();
    if (!value) return 'mk';
    if (value === 'zh') return 'zh-Hans';
    if (value === 'zht') return 'zh-Hant';
    return value;
  }

  function currentLang() {
    var select = document.getElementById('pageLang') || document.querySelector('[data-language-switcher]');
    var fromSelect = select && select.value ? select.value : '';
    var stored = '';
    try {
      stored = localStorage.getItem('wpa_language') || localStorage.getItem('wpa-lang') || localStorage.getItem('selectedLanguage') || '';
    } catch (e) {}
    var htmlLang = document.documentElement.getAttribute('lang') || '';
    var bodyLang = document.body && (document.body.getAttribute('data-current-language') || document.body.getAttribute('data-lang')) || '';
    var queryLang = '';
    try {
      queryLang = new URLSearchParams(location.search).get('lang') || '';
    } catch (e) {}
    return normalizeLanguage(fromSelect || stored || bodyLang || queryLang || htmlLang || 'mk');
  }

  function isMacedonianMode(lang) {
    return normalizeLanguage(lang).toLowerCase() === 'mk';
  }

  function isEnglishMode(lang) {
    return normalizeLanguage(lang).toLowerCase().indexOf('en') === 0;
  }

  function protectedTermsSorted() {
    return PROTECTED_TERMS.slice().sort(function (a, b) { return b.length - a.length; });
  }

  function isProtectedFullValue(value) {
    var trimmed = String(value || '').trim();
    return PROTECTED_TERMS.indexOf(trimmed) !== -1;
  }

  function protectSubstrings(value) {
    var text = String(value || '');
    var saved = [];
    protectedTermsSorted().forEach(function (term) {
      if (!term || text.indexOf(term) === -1) return;
      text = text.split(term).join(function () {
        var token = '\uE000K' + saved.length + '\uE001';
        saved.push(term);
        return token;
      }());
    });
    return {
      text: text,
      restore: function (input) {
        var output = String(input || '');
        saved.forEach(function (term, index) {
          output = output.split('\uE000K' + index + '\uE001').join(term);
        });
        return output;
      }
    };
  }

  function stripProtectedSubstrings(value) {
    var output = String(value || '');
    protectedTermsSorted().forEach(function (term) {
      if (!term) return;
      output = output.split(term).join('');
    });
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
    var protectedValue = protectSubstrings(value);
    var output = protectedValue.text;
    dict.forEach(function (pair) {
      output = replaceAllSafe(output, pair[0], pair[1]);
    });
    return protectedValue.restore(output);
  }

  function cleanElementAttributes(dict) {
    ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (element) {
        if (element.closest('[data-i18n-cleaner="off"],[data-no-i18n-cleaner],[data-brand-locked]')) return;
        var value = element.getAttribute(attr);
        if (!value || isProtectedFullValue(value)) return;
        var cleaned = cleanValue(value, dict);
        if (cleaned !== value) element.setAttribute(attr, cleaned);
      });
    });
  }

  function apply() {
    if (!document.body) return;
    var lang = currentLang();
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

    cleanElementAttributes(dict);
    document.documentElement.setAttribute('data-wpa-bilingual-cleaner', lang);
    document.documentElement.setAttribute('data-wpa-bilingual-cleaner-version', VERSION);
  }

  function hasRealMkIssue(text) {
    var cleanedText = cleanValue(text, buildMap('mk'));
    var stripped = stripProtectedSubstrings(cleanedText)
      .replace(/Assoc\. Prof\. Dr\./g, '')
      .replace(/Sande Smiljanov/g, '')
      .replace(/Sande/g, '')
      .replace(/Facebook|Instagram|TikTok|YouTube|Twitter|X/g, '')
      .replace(/\bHTML\b|\bPDF\b|\bCSV\b|\bJSON\b/g, '')
      .trim();

    return AUDIT_REAL_PATTERNS_MK.some(function (pattern) { return pattern.test(stripped); });
  }

  function audit() {
    var lang = currentLang();
    var issues = [];
    var cyrillic = /[А-Яа-яЃѓЌќЉљЊњЏџЅѕ]/;

    var walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      { acceptNode: function (node) { return skipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }
    );

    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue.trim();
      if (!text || isProtectedFullValue(text)) continue;
      if (isMacedonianMode(lang) && hasRealMkIssue(text)) issues.push(cleanValue(text.slice(0, 260), buildMap('mk')));
      if (isEnglishMode(lang) && cyrillic.test(stripProtectedSubstrings(text))) issues.push(text.slice(0, 260));
    }

    if (window.console && typeof console.table === 'function') {
      console.table(issues.slice(0, 150));
    }
    return issues;
  }

  function schedule() {
    [40, 180, 600, 1400, 3000, 6500].forEach(function (ms) { setTimeout(apply, ms); });
  }

  window.WPABilingualCleaner = {
    version: VERSION,
    apply: apply,
    audit: audit,
    schedule: schedule,
    protectedTerms: PROTECTED_TERMS.slice(),
    fixText: function (value) { return cleanValue(value, buildMap(currentLang())); },
    fixMacedonianText: function (value) { return cleanValue(value, buildMap('mk')); }
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
      window.__wpaBilingualCleanerTimer = setTimeout(apply, 120);
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (e) {}

  schedule();
})();

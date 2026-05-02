/*
  WPA I18N Root Lock v1.0
  Purpose:
  - Last-mile cleanup for mixed Macedonian/English visible UI text.
  - Runs after translator loaders and on language-change events.
  - Does not change layout, scripts, forms, or hidden data.
  - Exposes window.WPAI18nAudit() for manual inspection.
*/
(function () {
  'use strict';

  var LOCKED = new Set([
    'World Protocol Academy', 'WPA', 'WPAWS', 'WPA Card', 'Virtual Sande', 'Bot-Sande',
    'Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Google Scholar', 'ORCID',
    'ResearchGate', 'Academia.edu', 'AD Scientific Index', 'Europa Prima', 'Stripe', 'PayPal',
    'Visa', 'Mastercard', 'Google Meet', 'Zoom', 'Webex'
  ]);

  var EN = {
    'Манифест': 'Manifest',
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
    'Публикации': 'Publications',
    'Институционален слој': 'Institutional layer',
    'Авторство и извори': 'Authorship and sources',
    'Нови клучни WPA страници': 'New key WPA pages',
    'Отвори programmes.html': 'Open programmes.html',
    'Отвори certification.html': 'Open certification.html',
    'Отвори wpa-card.html': 'Open wpa-card.html',
    'Отвори passive-revenue.html': 'Open passive-revenue.html',
    'Главна куќа': 'Main house',
    'Платформски слој': 'Platform layer',
    'Специјализиран потсистем': 'Specialized subsystem',
    'Институционални партнерства': 'Institutional partnerships',
    'Книги и трудови': 'Books and papers',
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
    'Што е World Protocol Academy': 'What World Protocol Academy is',
    'WPA Позиционирање': 'WPA Positioning',
    'Независна академија и професионална платформа': 'Independent academy and professional platform',
    'Министерства и јавни институции': 'Ministries and public institutions',
    'Протоколарни единици и кабинетски тимови': 'Protocol units and cabinet teams',
    'Амбасади и дипломатски мисии': 'Embassies and diplomatic missions',
    'Канцеларии за меѓународна соработка': 'International cooperation offices',
    'Општини и извршни канцеларии': 'Municipalities and executive offices',
    'Извршни лица и раководен кадар': 'Executives and senior staff',
    'Професионалци за односи со јавност': 'Public relations professionals',
    'Организатори на настани и конференции': 'Event and conference organizers',
    'Тимови за корпоративна репрезентација': 'Corporate representation teams',
    'Студенти и млади професионалци': 'Students and young professionals',
    'Универзитети и академски кадар': 'Universities and academic staff',
    'Идни тренери и консултанти': 'Future trainers and consultants',
    'Четири нивоа. Една кохерентна WPA академија.': 'Four levels. One coherent WPA academy.',
    'Основно ниво за протокол, бонтон, етикеција, јавна појава, прв впечаток, институционално однесување и темелна професионална ориентација.': 'A foundation level for protocol, etiquette, bon ton, public presence, first impression, institutional behaviour and basic professional orientation.',
    'Средно професионално ниво за државен и дипломатски протокол, официјални посети, церемонии, комуникација, институционална репрезентација и практична примена.': 'An intermediate professional level for state and diplomatic protocol, official visits, ceremonies, communication, institutional representation and practical application.',
    'Напредно ниво за безбедност, мултилатерална подготвеност, стратешка репрезентација, координација, јавна дисциплина и професионална одговорност во сложени средини.': 'An advanced level for security, multilateral readiness, strategic representation, coordination, public discipline and professional responsibility in complex environments.',
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
    'Отвори Meet →': 'Open Meet →',
    'Отвори Zoom →': 'Open Zoom →',
    'Отвори Webex →': 'Open Webex →',
    'Отвори целосна Certification Page': 'Open full Certification Page',
    'Отвори WPA Card Page': 'Open WPA Card Page',
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
    'Кратки bot одговори': 'Short bot answers',
    'Основни лекции и поими': 'Basic lessons and concepts',
    'Подолги и попрецизни одговори': 'Longer and more precise answers',
    'Подготовка за сертификати': 'Certificate preparation',
    'Академски Virtual Sande': 'Academic Virtual Sande',
    'Годишни партнерства': 'Annual partnerships',
    'Начини на плаќање': 'Payment methods',
    'Достапни платежни опции': 'Available payment options',
    'Контактирај за претплата →': 'Contact for subscription →',
    'Книги и монографии': 'Books and monographs',
    'Разгледајте ја библиографијата →': 'View the bibliography →',
    'Научни трудови': 'Scientific papers',
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
    '23 публикации': '23 publications',
    '25+ години': '25+ years',
    'Преговарањето е опционално.\nПротоколот е апсолутен.': 'Negotiation is optional.\nProtocol is absolute.',
    'Употреба на извори, авторство и образовна обработка во WPA': 'Use of sources, authorship and educational processing in WPA',
    'Употреба на извори, цитирање и авторски права': 'Use of sources, citation and copyright',
    'Лаборатории, иновација и заштита на авторството': 'Labs, innovation and authorship protection',
    'Отвори Passive Revenue': 'Open Passive Revenue',
    'Централна WPA лабораторија за аудио книги, Sande voice engine, protocol scenario lab, viral media studio, live video room governance и monetization workflows.': 'Central WPA lab for audiobooks, the Sande voice engine, protocol scenario lab, viral media studio, live video room governance and monetization workflows.',
    'Програми': 'Programmes',
    'Авторство и извори': 'Authorship and sources',
    '1000 Скопје, Република Северна Македонија': '1000 Skopje, Republic of North Macedonia'
  };

  var MK = {
    'About': 'За WPA',
    'Programmes': 'Програми',
    'Prof. English': 'Професионален англиски',
    'Formats': 'Формати',
    'Certification': 'Сертификација',
    'Passive Revenue': 'Пасивен приход',
    'Cert FAQ': 'Прашања за сертификати',
    'AI': 'AI',
    'Books': 'Книги',
    'Papers': 'Трудови',
    'Partnerships': 'Партнерства',
    'Audio Media Engine': 'Аудио-медиумски мотор',
    'Symbols': 'Симболи',
    'Membership': 'Членство',
    'Founder': 'Основач',
    'Language': 'Јазик',
    'Explore the Academy': 'Истражи ја Академијата',
    'Meet Virtual Sande': 'Запознај го Virtual Sande',
    'Open WPAWS': 'Отвори WPAWS',
    'Open WPA Card': 'Отвори WPA Card',
    'Open Passive Revenue': 'Отвори Passive Revenue',
    'Open Protocol Symbols Lab': 'Отвори Protocol Symbols Lab',
    'Open WPA Diplomatic Analysis Lab': 'Отвори WPA Diplomatic Analysis Lab',
    'Academic Layer': 'Академски слој',
    'Certification': 'Сертификација',
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
    'Publications': 'Публикации',
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

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || document.body.getAttribute('data-current-language') || 'mk').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'mk';
  }

  function isVisibleTextNode(node) {
    if (!node || node.nodeType !== 3) return false;
    if (!node.nodeValue || !node.nodeValue.trim()) return false;
    var p = node.parentElement;
    if (!p) return false;
    var tag = p.tagName;
    if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|OPTION)$/i.test(tag)) return false;
    if (p.closest('[data-i18n-root-lock="off"], [data-no-i18n-root-lock]')) return false;
    return true;
  }

  function replaceExactText(node, dictionary) {
    var original = node.nodeValue;
    var trimmed = original.trim();
    if (!trimmed || LOCKED.has(trimmed)) return;
    if (!Object.prototype.hasOwnProperty.call(dictionary, trimmed)) return;
    node.nodeValue = original.replace(trimmed, dictionary[trimmed]);
  }

  function walkText(root, dictionary) {
    var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return isVisibleTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) replaceExactText(node, dictionary);
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
    var dictionary = lang() === 'en' ? EN : MK;
    walkText(document.body, dictionary);
    fixPlaceholders(dictionary);
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
      if (current === 'en' && cyr.test(t)) issues.push({ expected: 'en', text: t.slice(0, 180) });
      if (current === 'mk' && englishSignals.test(t)) issues.push({ expected: 'mk', text: t.slice(0, 180) });
    }
    console.table(issues.slice(0, 80));
    return issues;
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(apply, 60);
    setTimeout(apply, 350);
    setTimeout(apply, 1000);
  }

  window.WPAI18nRootLock = { apply: apply, audit: audit, en: EN, mk: MK };
  window.WPAI18nAudit = audit;

  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('wpa:i18n:loaded', schedule);
  document.addEventListener('wpa:locales-core-ready', schedule);
  document.addEventListener('change', function (event) {
    if (event.target && (event.target.matches('[data-language-switcher]') || event.target.id === 'pageLang')) schedule();
  });
  schedule();
})();

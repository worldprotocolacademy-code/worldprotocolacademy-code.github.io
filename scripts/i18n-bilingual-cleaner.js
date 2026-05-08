/* WPA Bilingual I18N Cleaner v2.0 - Pravopis 2017 pass
   World Protocol Academy

   Purpose:
   - Last-mile cleanup for mixed Macedonian / English UI text.
   - Conservative rule-based layer for the Macedonian public version.
   - Keeps protected WPA brand terms unchanged.
   - Skips scripts, styles, code, pre, textarea, option and explicit opt-out blocks.

   Upload target:
   scripts/i18n-bilingual-cleaner.js
*/
(function () {
  'use strict';

  var VERSION = '2.0-pravopis-2017';

  var PROTECTED_TERMS = [
    'World Protocol Academy',
    'WPA',
    'WPAWS',
    'WPA Card',
    'Virtual Sande',
    'WPA Student Desk',
    'Protocol Symbols Lab',
    'WPA Diplomatic Analysis Lab',
    'Google Meet',
    'Zoom',
    'Webex',
    'ORCID',
    'DOI',
    'QR',
    'AI',
    'PR'
  ];

  /*
    MK rule policy:
    - Brand/platform names remain protected.
    - Terms that are not brand names are normalized into Macedonian.
    - International abbreviations may remain Latin when this is clearer: AI, PR, QR.
  */
  var EN_TO_MK = [
    // High-risk mixed phrases first
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

    // Homepage / root sections
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
    ['Verified database', 'Верифицирана база'],
    ['Verified facts only', 'Само верифицирани факти'],
    ['Sources, Authorship and Educational Use', 'Извори, авторство и образовна употреба'],
    ['Use of sources, citation and copyright', 'Употреба на извори, цитирање и авторски права'],
    ['Labs, innovation and authorship protection', 'Лаборатории, иновација и заштита на авторството'],
    ['Official Channels', 'Официјални канали'],
    ['Academic Profiles', 'Академски профили'],
    ['Key Areas', 'Клучни области'],

    // Navigation and UI
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
    ['Open programmes.html', 'Отвори programmes.html'],
    ['Open certification.html', 'Отвори certification.html'],
    ['Open wpa-card.html', 'Отвори wpa-card.html'],
    ['Open passive-revenue.html', 'Отвори passive-revenue.html'],
    ['Open full Certification Page', 'Отвори целосна страница за сертификација'],
    ['Open WPA Card Page', 'Отвори страница за WPA Card'],
    ['Open Meet →', 'Отвори Meet →'],
    ['Open Zoom →', 'Отвори Zoom →'],
    ['Open Webex →', 'Отвори Webex →'],
    ['Open →', 'Отвори →'],
    ['Explore the Academy', 'Истражете ја Академијата'],
    ['Explore WPA Programmes', 'Истражи ги WPA програмите'],
    ['Meet Virtual Sande', 'Запознајте го Virtual Sande'],
    ['Ask WPA Student Desk', 'Прашај го WPA Student Desk'],

    // Institutional vocabulary
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
    ['Assessment logic', 'Логика на оценување'],
    ['Question bank', 'Банка на прашања'],
    ['Question Bank', 'Банка на прашања'],
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
    ['flagship tracks', 'носечки насоки'],
    ['Flagship tracks', 'Носечки насоки'],
    ['front-facing professionals', 'професионалци со јавна и услужна улога'],
    ['front-facing услуги', 'јавни и услужни улоги'],
    ['front-facing', 'јавно изложени'],
    ['executive-style', 'извршно-ориентирани'],
    ['Executive-style', 'Извршно-ориентирани'],
    ['masterclasses', 'мастер-класи'],
    ['webinars', 'вебинари'],
    ['moderation', 'модерирање'],
    ['Moderation', 'Модерирање'],
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
    // Pravopis/style normalization in Macedonian mode
    ['Скопје 1000, Северна Македонија', 'Скопје 1000, Република Северна Македонија'],
    ['онлајн сесии', 'онлајн-сесии'],
    ['Онлајн сесии', 'Онлајн-сесии'],
    ['онлајн средби', 'онлајн-средби'],
    ['Онлајн средби', 'Онлајн-средби'],
    ['QR verification', 'QR-верификација'],
    ['QR-верификација', 'QR-верификација'],
    ['QR идентификација', 'QR-идентификација'],
    ['QR-идентификација', 'QR-идентификација'],
    ['AI поддржано', 'AI-поддржано'],
    ['AI-поддржана', 'AI-поддржана'],
    ['AI водена', 'AI-водена'],
    ['AI-водена', 'AI-водена'],
    ['сериска и QR-верификација', 'сериска и QR-верификација'],
    ['сериска верификација', 'сериска верификација'],
    ['дигитална патека за верификација', 'дигитална патека за верификација'],
    ['ЧПП логика', 'логика на ЧПП'],
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
    // Only safe UI reversals. Do not attempt full translation here; EN locales do that.
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

    var lang = String(fromSelect || stored || bodyLang || queryLang || htmlLang || 'mk').toLowerCase();
    return lang.indexOf('en') === 0 ? 'en' : 'mk';
  }

  function isProtectedFullValue(value) {
    var trimmed = String(value || '').trim();
    return PROTECTED_TERMS.indexOf(trimmed) !== -1;
  }

  function buildMap(lang) {
    var map = [];
    if (lang === 'mk') {
      map = map.concat(EN_TO_MK, MK_STYLE_FIXES, MK_TYPO_FIXES);
    } else {
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
      .sort(function (a, b) {
        return b[0].length - a[0].length;
      });
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
    dict.forEach(function (pair) {
      output = replaceAllSafe(output, pair[0], pair[1]);
    });
    return output;
  }

  function apply() {
    if (!document.body) return;
    var lang = currentLang();
    var dict = buildMap(lang);

    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          return skipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    var node;
    while ((node = walker.nextNode())) {
      var cleaned = cleanValue(node.nodeValue, dict);
      if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
    }

    ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (attr) {
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

  function audit() {
    var lang = currentLang();
    var issues = [];
    var cyrillic = /[А-Яа-яЃѓЌќЉљЊњЏџЅѕ]/;
    var englishInMk = /\b(About|Programmes|Programs|Certification|Publications|Founder|Training|Professional|Institutional|Open|Explore|Contact|Privacy|Sources|Books|Papers|Scientific|Foundation|Advanced|Question|Official|Academic|Membership|Revenue|Layer|Logic|Page|Certificate|Programme|Program|Track|Tracks|Assessment|Digital|Credentials|Editorial|Attribution|Pass|Distinction|Benefits|Recurring|Value|Growth|Access|Format|Template|Rescue|Email|Online|Masterclass|Webinar)\b/;

    var walker = document.createTreeWalker(
      document.body || document.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          return skipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue.trim();
      if (!text || isProtectedFullValue(text)) continue;
      if (lang === 'mk' && englishInMk.test(text)) issues.push(text.slice(0, 220));
      if (lang === 'en' && cyrillic.test(text)) issues.push(text.slice(0, 220));
    }

    if (window.console && typeof console.table === 'function') {
      console.table(issues.slice(0, 150));
    }
    return issues;
  }

  function schedule() {
    [40, 180, 600, 1400, 3000, 6500].forEach(function (ms) {
      setTimeout(apply, ms);
    });
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
      window.__wpaBilingualCleanerTimer = setTimeout(apply, 120);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } catch (e) {}

  schedule();
})();

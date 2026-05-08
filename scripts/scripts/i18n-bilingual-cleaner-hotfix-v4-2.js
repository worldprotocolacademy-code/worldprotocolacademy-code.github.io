/* WPA Bilingual I18N Cleaner Hotfix v4.2 - Pravopis 2017
   World Protocol Academy

   Purpose:
   - Runs after scripts/i18n-bilingual-cleaner.js v4.1.
   - Fixes the final MK audit leftovers without replacing the large v4.1 cleaner.
   - Protects brand names such as Protocol Symbols Lab, WPA AI LAB and WPA Audio Media Engine.

   Upload target:
   scripts/i18n-bilingual-cleaner-hotfix-v4-2.js
*/
(function () {
  'use strict';

  var VERSION = '4.2-pravopis-2017-hotfix';

  var PROTECTED_TERMS = [
    'World Protocol Academy',
    'World Protocol Academic Writing System',
    'Protocol Symbols Lab',
    'WPA Audio Media Engine',
    'WPA AI LAB',
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
    'Sande',
    'Meet',
    'Zoom',
    'Webex'
  ];

  var FIXES = [
    // Final audit leftovers from v4.1
    ['Отвори Protocol Симболи Lab →', 'Отвори Protocol Symbols Lab →'],
    ['Отвори Protocol Симболи Lab', 'Отвори Protocol Symbols Lab'],
    ['Protocol Симболи Lab', 'Protocol Symbols Lab'],
    ['Protocol Симболи', 'Protocol Symbols'],
    ['WPA · Protocol Симболи Lab · Верифицирана база', 'WPA · Protocol Symbols Lab · Верифицирана база'],
    ['WPA · Protocol Симболи Lab · Verified database', 'WPA · Protocol Symbols Lab · Верифицирана база'],

    ['Verification-ready сертификацијаtion structure', 'Структура на сертификација подготвена за верификација'],
    ['Verification-ready certification structure', 'Структура на сертификација подготвена за верификација'],
    ['сертификацијаtion structure', 'структура на сертификација'],
    ['сертификацијаtion', 'сертификација'],
    ['certification structure', 'структура на сертификација'],

    ['QR-first verification logic', 'Логика на верификација со QR како прв слој'],
    ['QR-first verification', 'QR-верификација како прв слој'],
    ['verification logic', 'логика на верификација'],
    ['QR verification', 'QR-верификација'],

    ['Отвори passive-revenue.html', 'Отвори ја страницата за пасивен приход'],
    ['passive-revenue.html', 'страницата за пасивен приход'],

    ['Virtual Sande во Academic режим', 'Virtual Sande во академски режим'],
    ['Academic режим', 'академски режим'],
    ['Academic mode', 'академски режим'],

    ['Question Bank и механизам за оценување', 'Банка на прашања и механизам за оценување'],
    ['Question Bank', 'Банка на прашања'],

    ['Отвори целосна Сертификација Page', 'Отвори ја целосната страница за сертификација'],
    ['Отвори целосна сертификација Page', 'Отвори ја целосната страница за сертификација'],
    ['Сертификација Page', 'страница за сертификација'],
    ['сертификација Page', 'страница за сертификација'],

    ['Custom training packages', 'Прилагодени пакети за обука'],
    ['custom training packages', 'прилагодени пакети за обука'],
    ['training packages', 'пакети за обука'],

    ['General definitions in WPA-edited wording', 'Општи дефиниции во уредувачка формулација на WPA'],
    ['general definitions in WPA-edited wording', 'општи дефиниции во уредувачка формулација на WPA'],
    ['WPA-edited wording', 'уредувачка формулација на WPA'],

    ['NEW · WPA AI LAB', 'НОВО · WPA AI LAB'],
    ['New · WPA AI LAB', 'НОВО · WPA AI LAB'],
    ['Open WPA Аудио-медиумски мотор', 'Отвори WPA Аудио-медиумски мотор'],
    ['Open WPA Audio Media Engine', 'Отвори WPA Аудио-медиумски мотор'],

    // Extra safe normalizations often created by prior replacement passes
    ['Verified database', 'Верифицирана база'],
    ['verified database', 'верифицирана база'],
    ['Page', 'страница'],
    ['Open ', 'Отвори '],
    ['NEW ', 'НОВО ']
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
    return String(fromSelect || stored || bodyLang || queryLang || htmlLang || 'mk').trim() || 'mk';
  }

  function isMacedonianMode() {
    return currentLang().toLowerCase() === 'mk';
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
        if (term) output = output.split(term).join('');
      });
    return output;
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

  function cleanValue(value) {
    if (!isMacedonianMode() || isProtectedFullValue(value)) return value;
    var output = String(value);
    FIXES.forEach(function (pair) {
      if (output.indexOf(pair[0]) !== -1) {
        output = output.split(pair[0]).join(pair[1]);
      }
    });
    return output;
  }

  function apply() {
    if (!document.body || !isMacedonianMode()) return;

    var originalApply = window.WPABilingualCleaner && window.WPABilingualCleaner.__v42OriginalApply;
    if (typeof originalApply === 'function' && !window.__wpaV42CallingOriginal) {
      try {
        window.__wpaV42CallingOriginal = true;
        originalApply();
      } catch (e) {
      } finally {
        window.__wpaV42CallingOriginal = false;
      }
    }

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
      var cleaned = cleanValue(node.nodeValue);
      if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
    }

    ['placeholder', 'title', 'aria-label', 'alt'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (element) {
        if (element.closest('[data-i18n-cleaner="off"],[data-no-i18n-cleaner],[data-brand-locked]')) return;
        var value = element.getAttribute(attr);
        if (!value || isProtectedFullValue(value)) return;
        var cleaned = cleanValue(value);
        if (cleaned !== value) element.setAttribute(attr, cleaned);
      });
    });

    document.documentElement.setAttribute('data-wpa-bilingual-hotfix-version', VERSION);
  }

  function audit() {
    if (!document.body) return [];
    apply();

    var issues = [];
    var englishInMk = /\b(Open|NEW|New|Verification|verification|ready|first|logic|Question|Bank|Custom|training|packages|General|definitions|wording|Academic|Page|passive|revenue|certification|structure|Protocol|Symbols|Lab|Digital|Official|Assessment|Track|Programme|Program|Membership|identity|access|benefits|serial|learning|checkout)\b/i;

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
      var text = node.nodeValue.trim();
      if (!text || isProtectedFullValue(text)) continue;
      var searchable = stripProtectedSubstrings(text).replace(/WPA/g, '').replace(/QR/g, '').replace(/AI/g, '').replace(/PR/g, '');
      if (isMacedonianMode() && englishInMk.test(searchable)) issues.push(text.slice(0, 220));
    }

    if (window.console && typeof console.table === 'function') {
      console.table(issues.slice(0, 150));
    }
    return issues;
  }

  function installPatch() {
    if (window.WPABilingualCleaner && !window.WPABilingualCleaner.__v42Patched) {
      window.WPABilingualCleaner.__v42OriginalApply = window.WPABilingualCleaner.apply;
      window.WPABilingualCleaner.apply = apply;
      window.WPABilingualCleaner.audit = audit;
      window.WPABilingualCleaner.__v42Patched = true;
      window.WPABilingualCleaner.hotfixVersion = VERSION;
    }

    window.WPABilingualAudit = audit;
    window.WPABilingualCleanerHotfix42 = {
      version: VERSION,
      apply: apply,
      audit: audit,
      fixes: FIXES.slice()
    };
  }

  function schedule() {
    [40, 180, 600, 1400, 3000, 6500].forEach(function (ms) {
      setTimeout(function () {
        installPatch();
        apply();
      }, ms);
    });
  }

  installPatch();
  schedule();

  document.addEventListener('DOMContentLoaded', schedule);
  document.addEventListener('wpa:i18n:loaded', schedule);
  document.addEventListener('wpa:locales-core-ready', schedule);
  document.addEventListener('change', function (event) {
    if (event.target && event.target.matches('select,#pageLang,[data-language-switcher]')) schedule();
  });

  try {
    new MutationObserver(function () {
      clearTimeout(window.__wpaBilingualCleanerHotfix42Timer);
      window.__wpaBilingualCleanerHotfix42Timer = setTimeout(function () {
        installPatch();
        apply();
      }, 150);
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  } catch (e) {}
})();

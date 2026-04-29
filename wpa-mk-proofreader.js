/*!
 * WPA Macedonian Proofreader v2
 * Rule-based safety layer aligned with Macedonian Orthography (Правопис, 2017).
 *
 * It is intentionally conservative:
 * - It does not rewrite whole grammar.
 * - It fixes known repeated mistakes and mixed-script slips.
 * - It can be called manually:
 *     WPAMKProofreader.fixText(text)
 *     WPAMKProofreader.checkText(text)
 */
(function () {
  'use strict';

  const RULES = [
    // Latin transliteration or typo slips → standard Macedonian Cyrillic
    { pattern: /\bmakeodnskiot\b/gi, replacement: 'македонскиот', note: 'Latin typo to Macedonian Cyrillic' },
    { pattern: /\bmakeodnski\b/gi, replacement: 'македонски', note: 'Latin typo to Macedonian Cyrillic' },
    { pattern: /\bmakedonskiot\b/gi, replacement: 'македонскиот', note: 'Latin to Macedonian Cyrillic' },
    { pattern: /\bmakedonski\b/gi, replacement: 'македонски', note: 'Latin to Macedonian Cyrillic' },

    { pattern: /\bkje\b/gi, replacement: 'ќе', note: 'Latin transliteration to Macedonian Cyrillic future particle' },
    { pattern: /\bsekoj\b/gi, replacement: 'секој', note: 'Latin transliteration to Macedonian Cyrillic' },
    { pattern: /\bsekogas\b/gi, replacement: 'секогаш', note: 'Latin transliteration to Macedonian Cyrillic' },
    { pattern: /\bnajdobar\b/gi, replacement: 'најдобар', note: 'Latin transliteration to Macedonian Cyrillic' },
    { pattern: /\bprevod\b/gi, replacement: 'превод', note: 'Latin transliteration to Macedonian Cyrillic' },
    { pattern: /\bprevodot\b/gi, replacement: 'преводот', note: 'Latin transliteration to Macedonian Cyrillic' },
    { pattern: /превдувач/g, replacement: 'преведувач', note: 'Macedonian typo' },
    { pattern: /преведуач/g, replacement: 'преведувач', note: 'Macedonian typo' },
    { pattern: /инстументалн/g, replacement: 'инструменталн', note: 'Macedonian typo' },
    { pattern: /Ксово/g, replacement: 'Косово', note: 'Country name typo' },
    { pattern: /следновалните/g, replacement: 'следните', note: 'Style/wording correction' },
    { pattern: /јасничи/g, replacement: 'појаснува', note: 'Style/wording correction' },
    { pattern: /nastapот/g, replacement: 'настапот', note: 'Mixed script correction' },
    { pattern: /nastap/g, replacement: 'настап', note: 'Mixed script correction' },
    { pattern: /протоколарен асистент/g, replacement: 'протоколарен асистент', note: 'Protected term pass' }
  ];

  const PROTECTED_TERMS = [
    'World Protocol Academy',
    'WPA',
    'WPAWS',
    'WPA Card',
    'Virtual Sande',
    'Protocol Symbols Lab',
    'Diplomatic Analysis Lab'
  ];

  function normalizePunctuation(text) {
    // Prefer Macedonian/typographic punctuation conventions for generated copy.
    return text
      .replace(/\s+([,.;!?])/g, '$1')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s{2,}/g, ' ');
  }

  function fixText(input) {
    if (input === null || input === undefined) return input;
    let output = String(input);

    RULES.forEach(function (rule) {
      output = output.replace(rule.pattern, rule.replacement);
    });

    return normalizePunctuation(output);
  }

  function checkText(input) {
    const text = String(input || '');
    const findings = [];

    RULES.forEach(function (rule) {
      const matches = text.match(rule.pattern);
      if (matches && matches.length) {
        findings.push({
          type: 'rule',
          matches: Array.from(new Set(matches)),
          replacement: rule.replacement,
          note: rule.note
        });
      }
    });

    PROTECTED_TERMS.forEach(function (term) {
      if (text.includes(term)) {
        findings.push({ type: 'protected-term', term: term, note: 'Keep brand/term unchanged unless page-specific rule says otherwise.' });
      }
    });

    return {
      ok: findings.filter(function (f) { return f.type === 'rule'; }).length === 0,
      findings: findings,
      fixed: fixText(text)
    };
  }

  function fixElementText(element) {
    if (!element || element.children.length > 0) return;
    element.textContent = fixText(element.textContent);
  }

  function applyToDom(root) {
    const scope = root || document.body;
    if (!scope) return;
    scope.querySelectorAll('[data-mk-proofread], [data-i18n], [data-i18n-html]').forEach(fixElementText);
  }

  window.WPAMKProofreader = {
    rules: RULES.slice(),
    protectedTerms: PROTECTED_TERMS.slice(),
    fixText: fixText,
    checkText: checkText,
    applyToDom: applyToDom
  };
})();

/*!
 * WPA Journal — Public Platform Script
 * File: journal/assets/journal.js
 * Version: v1.0
 * Owner: World Protocol Academy
 * Doctrine: „Преговарањето е опционално. Протоколот е апсолутен."
 *
 * Privacy note:
 * This script does not transmit data; it only builds a local mailto draft
 * in the user's email application. No analytics, no tracking, no external
 * libraries, no external requests. All operations are client-side only.
 */

(function () {
  'use strict';

  // ────────────────────────────────────────────────────────
  // Utilities
  // ────────────────────────────────────────────────────────

  /** Safe querySelector */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  /** Safe querySelectorAll → Array */
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /** Detect reduced-motion preference */
  function prefersReducedMotion() {
    try {
      return window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  /** Copy text to clipboard with fallback */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return fallbackCopy(text); }
      );
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  /** Briefly change a button's label */
  function flashButtonLabel(btn, newLabel, duration) {
    if (!btn) return;
    var original = btn.getAttribute('data-original-label') || btn.textContent;
    btn.setAttribute('data-original-label', original);
    btn.textContent = newLabel;
    btn.classList.add('is-copied');
    btn.setAttribute('aria-live', 'polite');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('is-copied');
    }, duration || 1800);
  }

  /** Get value of a form field by name (returns first match) */
  function fieldVal(form, name) {
    if (!form) return '';
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return '';
    if (el.type === 'checkbox' || el.type === 'radio') {
      var checked = form.querySelector('[name="' + name + '"]:checked');
      return checked ? checked.value : '';
    }
    return (el.value || '').trim();
  }

  /** Get all checked values for a checkbox group */
  function fieldMulti(form, name) {
    if (!form) return [];
    var nodes = $$('input[name="' + name + '"]:checked', form);
    return nodes.map(function (n) { return n.value; });
  }

  /** Extract surname heuristic from full name */
  function extractSurname(fullName) {
    if (!fullName) return 'Author';
    var parts = String(fullName).trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return parts[parts.length - 1];
  }

  /** Short title — first 8 words capped at 60 chars */
  function shortTitle(title) {
    if (!title) return 'Submission';
    var t = String(title).trim().replace(/\s+/g, ' ');
    var words = t.split(' ').slice(0, 8).join(' ');
    if (words.length > 60) words = words.slice(0, 57) + '…';
    return words;
  }

  // ────────────────────────────────────────────────────────
  // 1. Copy citation buttons
  // ────────────────────────────────────────────────────────
  function initCopyCitation() {
    $$('[data-copy-citation]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = btn.getAttribute('data-copy-citation');
        var el = document.getElementById(targetId);
        if (!el) return;
        var text = (el.textContent || '').trim().replace(/\s+/g, ' ');
        Promise.resolve(copyToClipboard(text)).then(function () {
          flashButtonLabel(btn, 'Copied', 1800);
        });
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // 2. Copy BibTeX buttons
  // ────────────────────────────────────────────────────────
  function initCopyBibtex() {
    $$('[data-copy-bibtex]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = btn.getAttribute('data-copy-bibtex');
        var el = document.getElementById(targetId);
        if (!el) return;
        // Preserve BibTeX line breaks
        var text = (el.textContent || '').replace(/\u00a0/g, ' ');
        Promise.resolve(copyToClipboard(text)).then(function () {
          flashButtonLabel(btn, 'Copied', 1800);
        });
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // 3. Archive filter
  // ────────────────────────────────────────────────────────
  function initArchiveFilter() {
    $$('input[data-target]').forEach(function (input) {
      var targetSel = input.getAttribute('data-target');
      if (!targetSel) return;

      // Find a sensible container for empty-state message
      var firstCard = $(targetSel);
      if (!firstCard) return;
      var container = firstCard.parentNode;

      var emptyMsg = document.createElement('div');
      emptyMsg.className = 'filter__empty notice';
      emptyMsg.setAttribute('role', 'status');
      emptyMsg.hidden = true;
      emptyMsg.textContent = 'No matching issues found.';
      // Append at the end of container so it appears below the cards
      container.appendChild(emptyMsg);

      input.addEventListener('input', function () {
        var q = (input.value || '').trim().toLowerCase();
        var cards = $$(targetSel);
        var visibleCount = 0;
        cards.forEach(function (card) {
          var searchAttr = (card.getAttribute('data-search') || '').toLowerCase();
          var text = (card.textContent || '').toLowerCase();
          var combined = searchAttr + ' ' + text;
          var matches = q.length === 0 || combined.indexOf(q) !== -1;
          card.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
        });
        emptyMsg.hidden = (visibleCount > 0) || (q.length === 0);
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // 4. Submission form — email draft builder
  // ────────────────────────────────────────────────────────
  function initEmailDraftBuilder() {
    var buttons = $$('[data-build-email]');
    if (buttons.length === 0) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var form = btn.closest('form') || $('#submission-form');
        if (!form) return;

        // Collect fields (defensive — all optional)
        var authorName    = fieldVal(form, 'author_name');
        var affiliation   = fieldVal(form, 'author_affiliation');
        var country       = fieldVal(form, 'author_country');
        var region        = fieldVal(form, 'author_region');
        var email         = fieldVal(form, 'author_email');
        var orcid         = fieldVal(form, 'author_orcid');
        var bio           = fieldVal(form, 'author_bio');
        var coauthors     = fieldVal(form, 'coauthors');
        var contribution  = fieldVal(form, 'contribution');

        var title         = fieldVal(form, 'article_title');
        var type          = fieldVal(form, 'article_type');
        var lang          = fieldVal(form, 'article_language');
        var wordCount     = fieldVal(form, 'word_count');
        var discipline    = fieldVal(form, 'discipline_primary');
        var abstractMk    = fieldVal(form, 'abstract_mk');
        var abstractEn    = fieldVal(form, 'abstract_en');
        var keywords      = fieldVal(form, 'keywords');

        var aiAreas       = fieldMulti(form, 'ai_areas[]');
        var aiTool        = fieldVal(form, 'ai_tool');
        var aiNote        = fieldVal(form, 'ai_note');

        var coi           = fieldVal(form, 'coi');
        var coiDetails    = fieldVal(form, 'coi_details');

        var ethics        = fieldVal(form, 'ethics');
        var ethicsItems   = fieldMulti(form, 'ethics_items[]');
        var ethicsRef     = fieldVal(form, 'ethics_ref');

        var security      = fieldVal(form, 'security');
        var securityItems = fieldMulti(form, 'security_items[]');

        var funding       = fieldVal(form, 'funding');
        var fundingDet    = fieldVal(form, 'funding_details');

        var waiver        = fieldVal(form, 'waiver');
        var waiverCat     = fieldVal(form, 'waiver_cat');
        var waiverReason  = fieldVal(form, 'waiver_reason');
        var feeCat        = fieldVal(form, 'fee_cat');

        var files         = fieldMulti(form, 'files[]');
        var decl          = fieldMulti(form, 'decl[]');

        var signName      = fieldVal(form, 'sign_name');
        var signDate      = fieldVal(form, 'sign_date');

        var surname = extractSurname(authorName || signName);
        var st      = shortTitle(title);

        var subject = 'WPA Journal Submission — ' + surname + ' — ' + st;

        var L = [];
        L.push('WPA JOURNAL — SUBMISSION');
        L.push('============================================');
        L.push('');
        L.push('A. AUTHOR');
        L.push('--------------------------------------------');
        L.push('Name:         ' + (authorName || '—'));
        L.push('Affiliation:  ' + (affiliation || '—'));
        L.push('Country:      ' + (country || '—'));
        L.push('Region:       ' + (region || '—'));
        L.push('Email:        ' + (email || '—'));
        L.push('ORCID:        ' + (orcid || '—'));
        if (bio)          L.push('Bio:          ' + bio);
        if (coauthors)    L.push('Co-authors:   ' + coauthors);
        if (contribution) L.push('Contribution: ' + contribution);
        L.push('');

        L.push('B. ARTICLE');
        L.push('--------------------------------------------');
        L.push('Title:        ' + (title || '—'));
        L.push('Type:         ' + (type || '—'));
        L.push('Language:     ' + (lang || '—'));
        L.push('Word count:   ' + (wordCount || '—'));
        L.push('Discipline:   ' + (discipline || '—'));
        if (abstractMk) {
          L.push('');
          L.push('Abstract (MK):');
          L.push(abstractMk);
        }
        if (abstractEn) {
          L.push('');
          L.push('Abstract (EN):');
          L.push(abstractEn);
        }
        if (keywords) {
          L.push('');
          L.push('Keywords:     ' + keywords);
        }
        L.push('');

        L.push('C. AI DECLARATION');
        L.push('--------------------------------------------');
        L.push('AI areas:     ' + (aiAreas.length ? aiAreas.join(', ') : '—'));
        L.push('AI tool:      ' + (aiTool || '—'));
        if (aiNote) {
          L.push('AI note:');
          L.push(aiNote);
        }
        L.push('');

        L.push('D. CONFLICT OF INTEREST');
        L.push('--------------------------------------------');
        L.push('COI:          ' + (coi || '—'));
        if (coiDetails) L.push('Details:      ' + coiDetails);
        L.push('');

        L.push('E. ETHICS & CONSENT');
        L.push('--------------------------------------------');
        L.push('Ethics:       ' + (ethics || '—'));
        if (ethicsItems.length) L.push('Items:        ' + ethicsItems.join(', '));
        if (ethicsRef)          L.push('Reference:    ' + ethicsRef);
        L.push('');

        L.push('F. SECURITY SENSITIVITY');
        L.push('--------------------------------------------');
        L.push('Security:     ' + (security || '—'));
        if (securityItems.length) L.push('Items:        ' + securityItems.join(', '));
        L.push('');

        L.push('G. FUNDING');
        L.push('--------------------------------------------');
        L.push('Funding:      ' + (funding || '—'));
        if (fundingDet) L.push('Details:      ' + fundingDet);
        L.push('');

        L.push('H. WAIVER REQUEST');
        L.push('--------------------------------------------');
        L.push('Waiver:       ' + (waiver || '—'));
        if (waiverCat)    L.push('Category:     ' + waiverCat);
        if (waiverReason) L.push('Reason:       ' + waiverReason);
        if (waiver !== 'yes' && feeCat) {
          L.push('Fee category: ' + feeCat);
        }
        L.push('');

        L.push('I. FILES (attached to email)');
        L.push('--------------------------------------------');
        L.push(files.length ? '- ' + files.join('\n- ') : '—');
        L.push('');

        L.push('J. DECLARATIONS');
        L.push('--------------------------------------------');
        L.push(decl.length ? '- ' + decl.join('\n- ') : '—');
        L.push('');

        L.push('K. SIGNATURE');
        L.push('--------------------------------------------');
        L.push('Name:         ' + (signName || authorName || '—'));
        L.push('Date:         ' + (signDate || '—'));
        L.push('');
        L.push('============================================');
        L.push('Submitted via WPA Journal static submission form.');
        L.push('Privacy: this draft is generated locally; no data is transmitted by the form itself.');
        L.push('„Преговарањето е опционално. Протоколот е апсолутен."');

        var body = L.join('\n');

        // Preview area
        var previewWrap = $('#email-preview');
        var previewText = $('#email-preview-text');
        if (previewWrap && previewText) {
          previewText.textContent = body;
          previewWrap.style.display = '';
        }

        // Build mailto
        var mailto = 'mailto:worldprotocolacademy@gmail.com'
          + '?subject=' + encodeURIComponent(subject)
          + '&body='    + encodeURIComponent(body);

        // Some browsers cap mailto length around 2000 chars.
        // If too long, keep preview and skip auto-open with a soft hint.
        if (mailto.length > 1900) {
          if (previewWrap) {
            previewWrap.scrollIntoView({
              behavior: prefersReducedMotion() ? 'auto' : 'smooth',
              block: 'start'
            });
          }
          // Try mailto anyway with truncated body
          var truncated = body.slice(0, 1400)
            + '\n\n[...truncated for mailto link. Please copy the full text from the preview area above and paste into your email body.]';
          mailto = 'mailto:worldprotocolacademy@gmail.com'
            + '?subject=' + encodeURIComponent(subject)
            + '&body='    + encodeURIComponent(truncated);
        }

        // Open local mail client
        try {
          window.location.href = mailto;
        } catch (err) {
          // Soft fail — user can copy from preview
        }
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // 5. AI "none" mutual exclusion
  // ────────────────────────────────────────────────────────
  function initAiNoneExclusion() {
    var checkboxes = $$('input[type="checkbox"][name="ai_areas[]"]');
    if (checkboxes.length === 0) return;

    var noneBox = checkboxes.filter(function (c) { return c.value === 'none'; })[0];
    var others  = checkboxes.filter(function (c) { return c.value !== 'none'; });

    if (!noneBox) return;

    noneBox.addEventListener('change', function () {
      if (noneBox.checked) {
        others.forEach(function (c) { c.checked = false; });
      }
    });

    others.forEach(function (c) {
      c.addEventListener('change', function () {
        if (c.checked && noneBox.checked) {
          noneBox.checked = false;
        }
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // 6. Waiver / fee category dependency
  // ────────────────────────────────────────────────────────
  function initWaiverFeeDependency() {
    var waiverRadios = $$('input[type="radio"][name="waiver"]');
    var feeCatRadios = $$('input[type="radio"][name="fee_cat"]');
    if (waiverRadios.length === 0 || feeCatRadios.length === 0) return;

    var feeFieldset = feeCatRadios[0].closest('fieldset');

    function applyState() {
      var checked = $('input[type="radio"][name="waiver"]:checked');
      var val = checked ? checked.value : '';
      if (val === 'yes') {
        feeCatRadios.forEach(function (r) {
          r.checked = false;
          r.disabled = true;
          r.required = false;
        });
        if (feeFieldset) {
          feeFieldset.classList.add('is-dimmed');
          feeFieldset.setAttribute('aria-disabled', 'true');
        }
      } else if (val === 'no') {
        feeCatRadios.forEach(function (r) {
          r.disabled = false;
          r.required = true;
        });
        if (feeFieldset) {
          feeFieldset.classList.remove('is-dimmed');
          feeFieldset.removeAttribute('aria-disabled');
        }
      } else {
        // No waiver choice yet — leave fee radios neutral
        feeCatRadios.forEach(function (r) {
          r.disabled = false;
          r.required = false;
        });
        if (feeFieldset) {
          feeFieldset.classList.remove('is-dimmed');
          feeFieldset.removeAttribute('aria-disabled');
        }
      }
    }

    waiverRadios.forEach(function (r) {
      r.addEventListener('change', applyState);
    });

    // Initial run
    applyState();
  }

  // ────────────────────────────────────────────────────────
  // 7. Smooth anchor scroll
  // ────────────────────────────────────────────────────────
  function initSmoothScroll() {
    if (prefersReducedMotion()) return;

    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;

      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;

      // Skip if anchor is for an interactive UI control (aria-controls, role="tab", etc.)
      if (a.getAttribute('role') === 'tab') return;

      // Skip mailto, tel, javascript
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

      var id = href.slice(1);
      var target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without jump
        if (history && history.pushState) {
          history.pushState(null, '', '#' + id);
        }
      } catch (err) {
        // Fallback to native anchor jump
        window.location.hash = id;
      }
    });
  }

  // ────────────────────────────────────────────────────────
  // 8. Print helper
  // ────────────────────────────────────────────────────────
  function initPrintHelper() {
    // Ctrl+P / Cmd+P preserved natively — no override.
    // Optional data-print-page buttons:
    $$('[data-print-page]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        try { window.print(); } catch (err) { /* soft fail */ }
      });
    });
  }

  // ────────────────────────────────────────────────────────
  // Init on DOMContentLoaded
  // ────────────────────────────────────────────────────────
  function init() {
    initCopyCitation();
    initCopyBibtex();
    initArchiveFilter();
    initEmailDraftBuilder();
    initAiNoneExclusion();
    initWaiverFeeDependency();
    initSmoothScroll();
    initPrintHelper();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

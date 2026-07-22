/* WPA professional public contact layer — 2026-07-22 */
(function () {
  'use strict';

  if (window.WPA_PROFESSIONAL_CONTACTS_LOADED) return;
  window.WPA_PROFESSIONAL_CONTACTS_LOADED = true;

  var ADDRESSES = {
    info: 'info@worldprotocolacademy.mk',
    contact: 'contact@worldprotocolacademy.mk',
    office: 'office@worldprotocolacademy.mk',
    sande: 'sande@worldprotocolacademy.mk',
    institute: 'institute@worldprotocolacademy.mk',
    journal: 'journal@worldprotocolacademy.mk',
    editor: 'editor@worldprotocolacademy.mk'
  };

  var LEGACY_EMAIL_PATTERN = /worldprotocolacademy@(gmail|outlook)\.com/gi;
  var PUBLIC_EMAIL_PATTERN = /(?:worldprotocolacademy@(gmail|outlook)\.com|(?:info|contact|office|sande|institute|journal|editor)@worldprotocolacademy\.mk)/gi;
  var JOURNAL_EDITOR_CONTEXT = /(?:главен\s+уредник|editor-in-chief|уредничк|editorial|join\s*\/\s*contribute|cooperation|соработк)/i;
  var JOURNAL_MEDIA_CONTEXT = /(?:медиумск|media|press|печат|partnership|партнерств|sponsor|спонзор|opc\s*2026)/i;

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function replaceLegacyText(root, address) {
    if (!root) return;
    if (document.createTreeWalker && typeof NodeFilter !== 'undefined') {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        var value = String(node.nodeValue || '');
        LEGACY_EMAIL_PATTERN.lastIndex = 0;
        if (LEGACY_EMAIL_PATTERN.test(value)) {
          LEGACY_EMAIL_PATTERN.lastIndex = 0;
          node.nodeValue = value.replace(LEGACY_EMAIL_PATTERN, address);
        }
      }
      return;
    }
    var children = root.childNodes || [];
    for (var i = 0; i < children.length; i += 1) {
      if (children[i].nodeType === 3) {
        var text = String(children[i].nodeValue || '');
        LEGACY_EMAIL_PATTERN.lastIndex = 0;
        if (LEGACY_EMAIL_PATTERN.test(text)) {
          LEGACY_EMAIL_PATTERN.lastIndex = 0;
          children[i].nodeValue = text.replace(LEGACY_EMAIL_PATTERN, address);
        }
      } else {
        replaceLegacyText(children[i], address);
      }
    }
  }

  function setMailLink(anchor, address) {
    if (!anchor) return;
    var href = String(anchor.getAttribute('href') || '');
    var query = href.indexOf('?') >= 0 ? href.slice(href.indexOf('?')) : '';
    anchor.setAttribute('href', 'mailto:' + address + query);
    replaceLegacyText(anchor, address);
  }

  function keepMailLink(anchor, address) {
    if (!anchor) return;
    setMailLink(anchor, address);
    if (anchor.getAttribute('data-wpa-mail-guard') === 'true' || typeof MutationObserver === 'undefined') return;
    anchor.setAttribute('data-wpa-mail-guard', 'true');
    var observer = new MutationObserver(function () {
      var href = String(anchor.getAttribute('href') || '');
      LEGACY_EMAIL_PATTERN.lastIndex = 0;
      if (LEGACY_EMAIL_PATTERN.test(href)) setMailLink(anchor, address);
    });
    observer.observe(anchor, { attributes: true, attributeFilter: ['href'] });
  }

  function replaceLegacyMailLinks(address, root) {
    var scope = root || document;
    var links = scope.querySelectorAll('a[href^="mailto:"]');
    for (var i = 0; i < links.length; i += 1) {
      var href = String(links[i].getAttribute('href') || '');
      LEGACY_EMAIL_PATTERN.lastIndex = 0;
      if (LEGACY_EMAIL_PATTERN.test(href)) setMailLink(links[i], address);
    }
  }

  function updateStructuredEmail(address) {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i += 1) {
      var raw = String(scripts[i].textContent || '');
      LEGACY_EMAIL_PATTERN.lastIndex = 0;
      if (!LEGACY_EMAIL_PATTERN.test(raw)) continue;
      scripts[i].textContent = raw
        .replace(/worldprotocolacademy@gmail\.com/gi, address)
        .replace(/worldprotocolacademy@outlook\.com/gi, address);
    }
  }

  function previousLabelText(element) {
    var text = '';
    var node = element && element.previousSibling;
    var count = 0;
    while (node && count < 4) {
      if (node.nodeType === 3) text = String(node.nodeValue || '') + ' ' + text;
      else if (node.nodeType === 1) text = String(node.textContent || '') + ' ' + text;
      if (node.nodeType === 1 && String(node.tagName || '').toLowerCase() === 'a') break;
      node = node.previousSibling;
      count += 1;
    }
    return text;
  }

  function nearestJournalContext(element) {
    if (!element) return '';
    var node = element;
    while (node && node !== document.body) {
      if (node.nodeType === 1) {
        var className = String(node.className || '');
        var tagName = String(node.tagName || '').toLowerCase();
        if (
          /(?:footer-col|resource-card|page-inner|card|tool)/.test(className) ||
          tagName === 'p' ||
          tagName === 'li'
        ) {
          var previous = node.previousElementSibling;
          return String(node.textContent || '') + ' ' + (previous ? String(previous.textContent || '') : '');
        }
      }
      node = node.parentElement;
    }
    return String(element.textContent || '');
  }

  function journalAddressFor(element) {
    var adjacent = previousLabelText(element);
    if (JOURNAL_MEDIA_CONTEXT.test(adjacent)) return ADDRESSES.contact;
    if (JOURNAL_EDITOR_CONTEXT.test(adjacent)) return ADDRESSES.editor;

    var context = nearestJournalContext(element);
    if (JOURNAL_MEDIA_CONTEXT.test(context)) return ADDRESSES.contact;
    if (JOURNAL_EDITOR_CONTEXT.test(context)) return ADDRESSES.editor;
    return ADDRESSES.journal;
  }

  function routeJournalMailLinks() {
    var links = document.querySelectorAll('a[href^="mailto:"]');
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].id === 'mailBtn') continue;
      var href = String(links[i].getAttribute('href') || '');
      PUBLIC_EMAIL_PATTERN.lastIndex = 0;
      if (PUBLIC_EMAIL_PATTERN.test(href)) setMailLink(links[i], journalAddressFor(links[i]));
    }
  }

  function routeJournalVisibleEmailText() {
    if (!document.body) return;
    var elements = document.body.querySelectorAll('*');
    for (var i = 0; i < elements.length; i += 1) {
      var element = elements[i];
      var tagName = String(element.tagName || '').toLowerCase();
      if (tagName === 'a' || tagName === 'script' || tagName === 'style' || tagName === 'textarea') continue;
      if (element.children && element.children.length) continue;
      var value = String(element.textContent || '');
      PUBLIC_EMAIL_PATTERN.lastIndex = 0;
      if (!PUBLIC_EMAIL_PATTERN.test(value)) continue;
      var address = journalAddressFor(element);
      PUBLIC_EMAIL_PATTERN.lastIndex = 0;
      element.textContent = value.replace(PUBLIC_EMAIL_PATTERN, address);
      var attributes = ['data-mk', 'data-en', 'aria-label', 'title'];
      for (var a = 0; a < attributes.length; a += 1) {
        var attributeValue = element.getAttribute(attributes[a]);
        if (!attributeValue) continue;
        PUBLIC_EMAIL_PATTERN.lastIndex = 0;
        element.setAttribute(attributes[a], String(attributeValue).replace(PUBLIC_EMAIL_PATTERN, address));
      }
    }
  }

  function updateHome() {
    var old = document.querySelector('footer a[href="mailto:worldprotocolacademy@gmail.com"], footer a[href="mailto:info@worldprotocolacademy.mk"]');
    if (old && old.parentElement && !document.getElementById('wpaProfessionalContactList')) {
      var list = old.closest('ul');
      var item = old.closest('li');
      if (list && item) {
        var entries = [
          ['Општи информации · General information', ADDRESSES.info],
          ['Општа комуникација · General contact', ADDRESSES.contact],
          ['Администрација · Administration', ADDRESSES.office],
          ['WPA Institute', ADDRESSES.institute],
          ['WPA Journal', ADDRESSES.journal],
          ['Доц. д-р Санде Смиљанов · Author', ADDRESSES.sande]
        ];
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < entries.length; i += 1) {
          var li = document.createElement('li');
          if (i === 0) li.id = 'wpaProfessionalContactList';
          var a = document.createElement('a');
          a.href = 'mailto:' + entries[i][1];
          a.style.cssText = 'font-size:13px;color:rgba(255,255,255,.52)';
          a.textContent = entries[i][0] + ': ' + entries[i][1];
          li.appendChild(a);
          fragment.appendChild(li);
        }
        list.insertBefore(fragment, item);
        item.remove();
      }
    }
    replaceLegacyMailLinks(ADDRESSES.info);
  }

  function updateInstitute() {
    replaceLegacyMailLinks(ADDRESSES.institute);
    updateStructuredEmail(ADDRESSES.institute);

    var commandMail = document.getElementById('wicMail');
    if (commandMail) {
      var href = String(commandMail.getAttribute('href') || '');
      commandMail.setAttribute('href', href.replace(/mailto:[^?]+/i, 'mailto:' + ADDRESSES.institute));
    }
  }

  function updateJournal() {
    replaceLegacyMailLinks(ADDRESSES.journal);
    routeJournalMailLinks();
    routeJournalVisibleEmailText();
    updateStructuredEmail(ADDRESSES.journal);

    var mailButton = document.getElementById('mailBtn');
    if (mailButton) keepMailLink(mailButton, ADDRESSES.journal);
  }

  function boot() {
    var currentPath = path();
    var currentPage = page();
    if (currentPage === 'index' || currentPath === '/' || currentPath === '/index.html') updateHome();
    if (currentPage === 'institute' || currentPath === '/institute.html') updateInstitute();
    if (
      currentPage === 'forms' ||
      currentPath === '/forms' ||
      currentPath === '/forms/index.html' ||
      currentPath === '/journal' ||
      currentPath === '/journal/index.html' ||
      currentPath.indexOf('/journal/') === 0
    ) updateJournal();
  }

  window.WPA_PROFESSIONAL_EMAILS = Object.freeze(ADDRESSES);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 300);
  window.setTimeout(boot, 1200);
})();
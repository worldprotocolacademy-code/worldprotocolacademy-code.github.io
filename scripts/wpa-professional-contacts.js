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
  var JOURNAL_STANDARD_WORKFLOW_CONTEXT = /(?:submission|submit|manuscript|author|article|reviewer|peer\s*review|correction|retraction|takedown|appeal|waiver|поднес|ракопис|автор|труд|реценз|корекц|повлек|жалб|ослободување\s+од\s+такса)/i;
  var JOURNAL_EDITOR_CONTEXT = /(?:главен\s+уредник|editor[-\s]?in[-\s]?chief|editor\s+in\s+chief|до\s+главниот\s+уредник|contact\s+the\s+editor)/i;
  var JOURNAL_MEDIA_CONTEXT = /(?:медиумск|media|press|печат|partnership|партнерств|sponsor|спонзор|opc\s*2026)/i;

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function replaceTextPattern(root, pattern, address) {
    if (!root) return;
    if (document.createTreeWalker && typeof NodeFilter !== 'undefined') {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        var value = String(node.nodeValue || '');
        pattern.lastIndex = 0;
        if (pattern.test(value)) {
          pattern.lastIndex = 0;
          node.nodeValue = value.replace(pattern, address);
        }
      }
      return;
    }
    var children = root.childNodes || [];
    for (var i = 0; i < children.length; i += 1) {
      if (children[i].nodeType === 3) {
        var text = String(children[i].nodeValue || '');
        pattern.lastIndex = 0;
        if (pattern.test(text)) {
          pattern.lastIndex = 0;
          children[i].nodeValue = text.replace(pattern, address);
        }
      } else {
        replaceTextPattern(children[i], pattern, address);
      }
    }
  }

  function replaceLegacyText(root, address) {
    replaceTextPattern(root, LEGACY_EMAIL_PATTERN, address);
  }

  function replacePublicText(root, address) {
    replaceTextPattern(root, PUBLIC_EMAIL_PATTERN, address);
  }

  function setMailLink(anchor, address, replacePublicAddress) {
    if (!anchor) return;
    var href = String(anchor.getAttribute('href') || '');
    var query = href.indexOf('?') >= 0 ? href.slice(href.indexOf('?')) : '';
    anchor.setAttribute('href', 'mailto:' + address + query);
    if (replacePublicAddress) replacePublicText(anchor, address);
    else replaceLegacyText(anchor, address);
  }

  function keepMailLink(anchor, address) {
    if (!anchor) return;
    setMailLink(anchor, address, true);
    if (anchor.getAttribute('data-wpa-mail-guard') === 'true' || typeof MutationObserver === 'undefined') return;
    anchor.setAttribute('data-wpa-mail-guard', 'true');
    var observer = new MutationObserver(function () {
      var href = String(anchor.getAttribute('href') || '').toLowerCase();
      if (href.indexOf('mailto:' + address.toLowerCase()) !== 0) setMailLink(anchor, address, true);
    });
    observer.observe(anchor, { attributes: true, attributeFilter: ['href'] });
  }

  function replaceLegacyMailLinks(address, root) {
    var scope = root || document;
    var links = scope.querySelectorAll('a[href^="mailto:"]');
    for (var i = 0; i < links.length; i += 1) {
      var href = String(links[i].getAttribute('href') || '');
      LEGACY_EMAIL_PATTERN.lastIndex = 0;
      if (LEGACY_EMAIL_PATTERN.test(href)) setMailLink(links[i], address, false);
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

  function nearestJournalContext(element) {
    if (!element) return '';
    var node = element;
    var fallback = String(element.textContent || '');
    var depth = 0;
    while (node && node !== document.body && depth < 6) {
      if (node.nodeType === 1) {
        var text = String(node.textContent || '');
        if (
          JOURNAL_STANDARD_WORKFLOW_CONTEXT.test(text) ||
          JOURNAL_EDITOR_CONTEXT.test(text) ||
          JOURNAL_MEDIA_CONTEXT.test(text)
        ) return text;
        var className = String(node.className || '');
        if (/(?:footer-col|resource-card|card|tool)/.test(className)) fallback = text;
      }
      node = node.parentElement;
      depth += 1;
    }
    return fallback;
  }

  function journalAddressFor(element) {
    var context = nearestJournalContext(element);
    if (JOURNAL_STANDARD_WORKFLOW_CONTEXT.test(context)) return ADDRESSES.journal;
    if (JOURNAL_EDITOR_CONTEXT.test(context)) return ADDRESSES.editor;
    if (JOURNAL_MEDIA_CONTEXT.test(context)) return ADDRESSES.contact;
    return ADDRESSES.journal;
  }

  function routeJournalMailLinks() {
    var links = document.querySelectorAll('a[href^="mailto:"]');
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].id === 'mailBtn') continue;
      var href = String(links[i].getAttribute('href') || '');
      PUBLIC_EMAIL_PATTERN.lastIndex = 0;
      if (!PUBLIC_EMAIL_PATTERN.test(href)) continue;
      setMailLink(links[i], journalAddressFor(links[i]), true);
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

  function makeEmailLink(address, label) {
    var link = document.createElement('a');
    link.href = 'mailto:' + address;
    link.textContent = label || address;
    link.setAttribute('translate', 'no');
    link.setAttribute('data-no-i18n', 'true');
    return link;
  }

  function ensureLandingEditorContact() {
    var section = document.getElementById('contact');
    if (section && !document.getElementById('wpaJournalEditorContact')) {
      var heading = document.createElement('h3');
      heading.id = 'wpaJournalEditorContact';
      heading.textContent = 'Главен уредник · Editor-in-Chief';
      var paragraph = document.createElement('p');
      paragraph.appendChild(document.createTextNode('Директни уреднички прашања · Direct correspondence: '));
      paragraph.appendChild(makeEmailLink(ADDRESSES.editor));

      var mediaHeading = null;
      var headings = section.querySelectorAll('h3');
      for (var i = 0; i < headings.length; i += 1) {
        if (JOURNAL_MEDIA_CONTEXT.test(String(headings[i].textContent || ''))) {
          mediaHeading = headings[i];
          break;
        }
      }
      if (mediaHeading) {
        section.insertBefore(heading, mediaHeading);
        section.insertBefore(paragraph, mediaHeading);
      } else {
        section.appendChild(heading);
        section.appendChild(paragraph);
      }
    }

    var simpleFooter = document.querySelector('footer.footer p');
    if (simpleFooter && !document.getElementById('wpaJournalEditorSimpleFooter')) {
      var line = document.createElement('span');
      line.id = 'wpaJournalEditorSimpleFooter';
      line.style.display = 'block';
      line.appendChild(document.createTextNode('Главен уредник · Editor-in-Chief: '));
      line.appendChild(makeEmailLink(ADDRESSES.editor));
      simpleFooter.appendChild(line);
    }
  }

  function ensureInstitutionalEditorContact() {
    var grid = document.querySelector('.institutional-footer .footer-grid');
    if (!grid || document.getElementById('wpaJournalEditorFooter')) return;

    var column = document.createElement('div');
    column.className = 'footer-col';
    column.id = 'wpaJournalEditorFooter';

    var heading = document.createElement('h5');
    heading.setAttribute('data-mk', 'Главен уредник');
    heading.setAttribute('data-en', 'Editor-in-Chief');
    heading.textContent = 'Главен уредник';
    column.appendChild(heading);
    column.appendChild(makeEmailLink(ADDRESSES.editor));

    var note = document.createElement('p');
    note.style.cssText = 'font-size:10px;color:var(--gold-deep);margin-top:4px;';
    note.setAttribute('data-mk', 'Директни уреднички прашања');
    note.setAttribute('data-en', 'Direct editorial correspondence');
    note.textContent = 'Директни уреднички прашања';
    column.appendChild(note);

    var editorialColumn = null;
    var columns = grid.querySelectorAll('.footer-col');
    for (var i = 0; i < columns.length; i += 1) {
      if (/уредничк|editorial/i.test(String(columns[i].textContent || ''))) {
        editorialColumn = columns[i];
        break;
      }
    }
    if (editorialColumn && editorialColumn.nextSibling) grid.insertBefore(column, editorialColumn.nextSibling);
    else grid.appendChild(column);
  }

  function ensureFlipbookEditorContact() {
    if (document.getElementById('wpaJournalEditorFlipbookContact')) return;
    var headings = document.querySelectorAll('.page-inner h2');
    for (var i = 0; i < headings.length; i += 1) {
      var headingText = String(headings[i].textContent || '') + ' ' + String(headings[i].getAttribute('data-en') || '');
      if (!/(?:контакт|contact)/i.test(headingText)) continue;
      var pageInner = headings[i].closest('.page-inner');
      if (!pageInner) continue;

      var block = document.createElement('div');
      block.id = 'wpaJournalEditorFlipbookContact';
      block.style.marginTop = '18px';

      var label = document.createElement('div');
      label.style.cssText = "font-family:'Cormorant Garamond',serif;font-style:italic;font-size:14px;color:var(--burgundy);margin-bottom:4px;";
      label.setAttribute('data-mk', 'Главен уредник');
      label.setAttribute('data-en', 'Editor-in-Chief');
      label.textContent = 'Главен уредник';
      block.appendChild(label);

      var email = document.createElement('div');
      email.style.cssText = 'font-size:13px;color:var(--forest);';
      email.appendChild(makeEmailLink(ADDRESSES.editor));
      block.appendChild(email);

      var mediaBlock = null;
      var children = pageInner.children || [];
      for (var c = 0; c < children.length; c += 1) {
        if (JOURNAL_MEDIA_CONTEXT.test(String(children[c].textContent || ''))) {
          mediaBlock = children[c];
          break;
        }
      }
      if (mediaBlock) pageInner.insertBefore(block, mediaBlock);
      else pageInner.appendChild(block);
      break;
    }
  }

  function ensureJournalEditorContacts() {
    ensureLandingEditorContact();
    ensureInstitutionalEditorContact();
    ensureFlipbookEditorContact();
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
    ensureJournalEditorContacts();
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
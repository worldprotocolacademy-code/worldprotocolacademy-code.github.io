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
    journal: 'journal@worldprotocolacademy.mk'
  };

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function setMailLink(anchor, address) {
    if (!anchor) return;
    var href = String(anchor.getAttribute('href') || '');
    var query = href.indexOf('?') >= 0 ? href.slice(href.indexOf('?')) : '';
    anchor.setAttribute('href', 'mailto:' + address + query);
    if (/worldprotocolacademy@(gmail|outlook)\.com/i.test(String(anchor.textContent || ''))) {
      anchor.textContent = address;
    }
  }

  function keepMailLink(anchor, address) {
    if (!anchor) return;
    setMailLink(anchor, address);
    if (anchor.getAttribute('data-wpa-mail-guard') === 'true' || typeof MutationObserver === 'undefined') return;
    anchor.setAttribute('data-wpa-mail-guard', 'true');
    var observer = new MutationObserver(function () {
      var href = String(anchor.getAttribute('href') || '');
      if (/worldprotocolacademy@(gmail|outlook)\.com/i.test(href)) setMailLink(anchor, address);
    });
    observer.observe(anchor, { attributes: true, attributeFilter: ['href'] });
  }

  function replaceLegacyMailLinks(address, root) {
    var scope = root || document;
    var links = scope.querySelectorAll('a[href^="mailto:"]');
    for (var i = 0; i < links.length; i += 1) {
      var href = String(links[i].getAttribute('href') || '');
      if (/worldprotocolacademy@(gmail|outlook)\.com/i.test(href)) setMailLink(links[i], address);
    }
  }

  function updateStructuredEmail(address) {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i += 1) {
      var raw = String(scripts[i].textContent || '');
      if (!/worldprotocolacademy@(gmail|outlook)\.com/i.test(raw)) continue;
      scripts[i].textContent = raw
        .replace(/worldprotocolacademy@gmail\.com/gi, address)
        .replace(/worldprotocolacademy@outlook\.com/gi, address);
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

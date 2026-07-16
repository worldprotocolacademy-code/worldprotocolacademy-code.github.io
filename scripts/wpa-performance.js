/* WPA runtime loader — Institute identity and contextual AI access */
(function () {
  'use strict';

  function path() {
    return String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  }

  function page() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function isInstitute() {
    return page() === 'institute' || path().toLowerCase() === '/institute.html';
  }

  function addStylesheet(id, href) {
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function addScript(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function shouldLoadPublicVirtualSande() {
    var p = path().toLowerCase();
    var exact = {
      '/programmes.html': true,
      '/certification.html': true,
      '/professional-english.html': true,

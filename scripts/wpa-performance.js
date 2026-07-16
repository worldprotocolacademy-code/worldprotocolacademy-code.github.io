/* WPA runtime loader — restrained Institute identity and contextual AI access */
(function () {
  'use strict';

  var PUBLIC_VIRTUAL_SANDE_PATHS = {
    '/programmes.html': true,
    '/certification.html': true,
    '/professional-english.html': true,
    '/institutional-diplomatic-track.html': true,
    '/protocol-professional-track.html': true,
    '/communication-presence-track.html': true,
    '/wpa-services.html': true,
    '/wpa-briefings.html': true,
    '/wpa-one-page-service-profile.html': true,
    '/working-papers': true,
    '/journal': true,
    '/bibliography': true
  };

  function path() {
    return String(window.location.pathname || '').replace(/\/+$/, '') || '/';
  }

  function page() {
    return
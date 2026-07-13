/* WPA runtime loader: interaction recovery + deterministic page refinements */
(function () {
  'use strict';

  var PILOT_URL = '/data/global-institutions/pilot-20/v1.3.1/';
  var SUBLIMATE_URL = '/wpa-sublimate-engine.html';

  function pageName() {
    return String(document.documentElement.getAttribute('data-wpa-page') || '').toLowerCase();
  }

  function normalizedPath() {
    return String(window.location.pathname || '').replace(/
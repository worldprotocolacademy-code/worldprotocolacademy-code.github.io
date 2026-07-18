/* Virtual Sande AI — Institute public widget */
(function () {
  'use strict';
  if (window.__WPA_INSTITUTE_VIRTUAL_SANDE__) return;
  window.__WPA_INSTITUTE_VIRTUAL_SANDE__ = true;

  var API = 'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask';
  var busy = false;
  var history = [];


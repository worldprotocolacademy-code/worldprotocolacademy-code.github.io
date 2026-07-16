/* Virtual Sande AI — Institute public widget */
(function () {
  'use strict';

  if (window.__WPA_INSTITUTE_VIRTUAL_SANDE__) return;
  window.__WPA_INSTITUTE_VIRTUAL_SANDE__ = true;

  var API_URL = 'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask';
  var MAX_HISTORY = 6;
  var busy = false;
  var conversation = [];

  function esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function ui(lang) {
    if (lang === 'en') {
      return {
        welcome: 'Welcome. I am Virtual Sande AI, the academic assistant of World Protocol Academy Institute.',
        placeholder: 'Type your question...',
        send: 'Send', clear: 'Clear', typing: 'Virtual S
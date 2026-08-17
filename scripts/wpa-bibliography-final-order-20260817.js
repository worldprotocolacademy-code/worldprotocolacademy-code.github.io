/* WPA bibliography final order - 2026-08-17 */
(function () {
  'use strict';
  if (window.WPA_BIB_FINAL_ORDER_20260817) return;
  window.WPA_BIB_FINAL_ORDER_20260817 = true;

  function path() {
    return String(window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  }

  function text(node) {
    return String(node && node.textContent
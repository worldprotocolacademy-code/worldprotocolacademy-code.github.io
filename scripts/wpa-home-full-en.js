/* WPA canonical MK/EN homepage locale renderer. */
(function(){
  'use strict';

  const PAGE=(document.documentElement&&document.documentElement.getAttribute('data-wpa-page'))||inferPage();
  const STORAGE_KEYS=['wpa.language','WPA_LANG_V6','wpa_i18n_v2_lang','WPA_LANG'];
  const SUPPORTED=['mk','en'];
  let activeLang='mk';
  let activeDict=null;
  let observer=null;
  let applyTimer=0;

  function q(s,r){return (r||document
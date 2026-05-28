/*!
 * WPA Translator Loader v4.0
 * Upload-only safe version. Works with data-i18n attributes and optional language selector container.
 * Canonical language: Macedonian (mk). Fallback: mk -> en.
 */
(function(){
  'use strict';

  const WPA_TRANSLATOR_V4 = {
    governanceUrl: '/translator-root-governance-v4.json',
    localesBasePath: '/locales/',
    storageKey: 'wpa_lang_v4',
    canonical: 'mk',
    fallback: ['mk','en'],
    governance: null,
    dictionaries: {},
    activeLang: null
  };

  function logSafe(message){
    try { console.info('[WPA Translator v4]', message); } catch(e){}
  }

  function getStoredLang(){
    try { return localStorage.getItem(WPA_TRANSLATOR_V4.storageKey) || WPA_TRANSLATOR_V4.canonical; }
    catch(e){ return WPA_TRANSLATOR_V4.canonical; }
  }

  function setStoredLang(lang){
    try { localStorage.setItem(WPA_TRANSLATOR_V4.storageKey, lang); } catch(e){}
  }

  async function getJson(url){
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error('Failed to load ' + url + ' (' + res.status + ')');
    return res.json();
  }

  function supportedLanguages(){
    return (WPA_TRANSLATOR_V4.governance && WPA_TRANSLATOR_V4.governance.supported_languages) || [
      {code:'mk', native_name:'Македонски', english_name:'Macedonian', direction:'ltr', status:'canonical'},
      {code:'en', native_name:'English', english_name:'English', direction:'ltr', status:'active'}
    ];
  }

  // Phase-1 rule: only languages with status 'canonical' or 'active' are usable in production.
  // 'planned' languages remain tracked in governance but cannot be selected, nor activated
  // from a stale localStorage value (e.g. set by a previous custom selector).
  function activeLanguages(){
    return supportedLanguages().filter(function(l){
      return l.status === 'canonical' || l.status === 'active';
    });
  }

  function isSupported(lang){
    return activeLanguages().some(function(l){ return l.code === lang; });
  }

  function langDirection(lang){
    const found = supportedLanguages().find(l => l.code === lang);
    return found && found.direction === 'rtl' ? 'rtl' : 'ltr';
  }

  async function loadDictionary(lang){
    if(WPA_TRANSLATOR_V4.dictionaries[lang]) return WPA_TRANSLATOR_V4.dictionaries[lang];
    try {
      const dict = await getJson(WPA_TRANSLATOR_V4.localesBasePath + lang + '/core.json');
      WPA_TRANSLATOR_V4.dictionaries[lang] = dict;
      return dict;
    } catch(e) {
      WPA_TRANSLATOR_V4.dictionaries[lang] = {};
      logSafe('No dictionary for ' + lang + '; fallback will be used.');
      return {};
    }
  }

  function translateKey(key, lang){
    const dict = WPA_TRANSLATOR_V4.dictionaries[lang] || {};
    if(Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];

    for(const fb of WPA_TRANSLATOR_V4.fallback){
      const fbdict = WPA_TRANSLATOR_V4.dictionaries[fb] || {};
      if(Object.prototype.hasOwnProperty.call(fbdict, key)) return fbdict[key];
    }
    return null;
  }

  function applyDirection(lang){
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', langDirection(lang));
  }

  function applyTranslations(lang){
    applyDirection(lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = translateKey(key, lang);
      if(value !== null && typeof value !== 'object') el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = translateKey(key, lang);
      if(value !== null && typeof value !== 'object') el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const value = translateKey(key, lang);
      if(value !== null && typeof value !== 'object') el.setAttribute('title', value);
    });

    document.dispatchEvent(new CustomEvent('wpa:language-changed', {detail:{language:lang}}));
  }

  function renderSelector(){
    const mounts = document.querySelectorAll('[data-wpa-language-select]');
    if(!mounts.length) return;

    // Phase-1 rule: selector shows only canonical+active languages (see activeLanguages()).
    const langs = activeLanguages();
    mounts.forEach(mount => {
      mount.innerHTML = '';
      const wrap = document.createElement('label');
      wrap.className = 'wpa-language-select-wrap';
      wrap.style.display = 'inline-flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '8px';

      const label = document.createElement('span');
      label.textContent = (WPA_TRANSLATOR_V4.activeLang === 'en') ? 'Language' : 'Јазик';
      label.style.fontSize = '12px';
      label.style.fontWeight = '700';

      const select = document.createElement('select');
      select.setAttribute('aria-label', 'WPA language selector');
      select.className = 'wpa-language-select';
      select.style.minHeight = '36px';
      select.style.borderRadius = '10px';
      select.style.padding = '6px 10px';

      langs.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang.code;
        opt.textContent = `${lang.native_name} (${lang.code})`;
        if(lang.code === WPA_TRANSLATOR_V4.activeLang) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', async () => {
        await window.WPATranslatorV4.setLanguage(select.value);
      });

      wrap.appendChild(label);
      wrap.appendChild(select);
      mount.appendChild(wrap);
    });
  }

  async function ensureCoreDictionaries(lang){
    await loadDictionary(WPA_TRANSLATOR_V4.canonical);
    await loadDictionary('en');
    if(lang !== WPA_TRANSLATOR_V4.canonical && lang !== 'en') await loadDictionary(lang);
  }

  async function setLanguage(lang){
    if(!isSupported(lang)) lang = WPA_TRANSLATOR_V4.canonical;
    WPA_TRANSLATOR_V4.activeLang = lang;
    setStoredLang(lang);
    await ensureCoreDictionaries(lang);
    applyTranslations(lang);
    renderSelector();
    return lang;
  }

  async function init(){
    try {
      WPA_TRANSLATOR_V4.governance = await getJson(WPA_TRANSLATOR_V4.governanceUrl);
      WPA_TRANSLATOR_V4.storageKey = WPA_TRANSLATOR_V4.governance.storage_key || WPA_TRANSLATOR_V4.storageKey;
      WPA_TRANSLATOR_V4.canonical = WPA_TRANSLATOR_V4.governance.canonical_language || WPA_TRANSLATOR_V4.canonical;
      WPA_TRANSLATOR_V4.fallback = WPA_TRANSLATOR_V4.governance.fallback_order || WPA_TRANSLATOR_V4.fallback;
      WPA_TRANSLATOR_V4.localesBasePath = WPA_TRANSLATOR_V4.governance.locales_base_path || WPA_TRANSLATOR_V4.localesBasePath;
    } catch(e) {
      logSafe('Governance file not loaded; using built-in fallback.');
    }
    let lang = getStoredLang();
    if(!isSupported(lang)) lang = WPA_TRANSLATOR_V4.canonical;
    await setLanguage(lang);
    logSafe('Ready. Active language: ' + lang);
  }

  window.WPATranslatorV4 = {
    init,
    setLanguage,
    getLanguage: () => WPA_TRANSLATOR_V4.activeLang,
    getGovernance: () => WPA_TRANSLATOR_V4.governance,
    translateKey: (key) => translateKey(key, WPA_TRANSLATOR_V4.activeLang || WPA_TRANSLATOR_V4.canonical)
  };

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

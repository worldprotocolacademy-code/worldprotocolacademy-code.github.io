/**
 * WPA TRANSLATOR ENGINE - CORE V3.0.2 (Ultimate Integrated Version)
 * Fully integrated with Manifest Schema v3.0.0, Language Normalization & Tooltip Support
 * Architecture Designed and Optimized for Professor Sande's Flat JSON Structure
 */

(function () {
  'use strict';

  // Дефинирање на базичната патека на локацијата
  const CONFIG = window.WPA_Translator_Config || { context: 'institute', basePath: './' };
  
  // Клучеви за Storage преземени директно од Вашиот нов манифест
  const STORAGE_KEYS = ['wpa_language', 'wpa-lang'];
  const CONTEXT_STORAGE_KEY = `wpa_lang_${CONFIG.context}`;
  
  let currentLang = 'mk';
  let manifest = null;
  let dictionary = {};

  // Безбедносна функција за нормализација на јазичните кодови (Елиминирање на системски конфликти)
  function normalizeLanguage(lang) {
    if (!lang) return 'mk';
    const value = String(lang).trim().toLowerCase();
    if (value === 'zh' || value === 'zh-cn') return 'zh-Hans';
    if (value === 'zht' || value === 'zh-tw') return 'zh-Hant';
    return lang;
  }

  // Помошна функција за проверка на зачуван јазик во прелистувачот
  function getSavedLanguage() {
    // 1. Прво проверуваме во контекстниот клуч
    let saved = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (saved) return normalizeLanguage(saved);
    
    // 2. Потоа ги проверуваме глобално дефинираните клучеви од манифестот
    for (let key of STORAGE_KEYS) {
      saved = localStorage.getItem(key);
      if (saved) return normalizeLanguage(saved);
    }
    return null;
  }

  function saveLanguage(lang) {
    const normLang = normalizeLanguage(lang);
    localStorage.setItem(CONTEXT_STORAGE_KEY, normLang);
    STORAGE_KEYS.forEach(key => localStorage.setItem(key, normLang));
  }

  const Translator = {
    async init() {
      try {
        // Директно вчитување на новиот манифест со cache-busting заштита
        const manifestUrl = `${CONFIG.basePath}locales/manifest.json?v=${Date.now()}`;
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error('Failed to load manifest.json');
        manifest = await res.json();

        let savedLang = getSavedLanguage();
        
        // Пребарување низ новата низа на јазици (manifest.languages)
        let activeLangMeta = manifest.languages.find(l => l.code === savedLang);
        
        if (savedLang && activeLangMeta) {
          // Ако јазикот е експлицитно исклучен или оневозможен во регистарот (Пул C)
          if (activeLangMeta.status === 'disabled' || !activeLangMeta.enabled) {
            savedLang = manifest.mirrorLanguage || 'en';
            saveLanguage(savedLang);
          }
        } else {
          // Ако нема зачуван јазик, користи го каноничниот (mk)
          savedLang = manifest.canonicalLanguage || 'mk';
        }
        
        currentLang = savedLang;
        await this.setLang(currentLang, false);
        this.renderPreviewSelectors();
      } catch (err) {
        console.error('[WPA Core V3 Error]', err);
        // Безбедносен рестриктивен fallback во случај на критичен проблем
        currentLang = 'en';
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('dir', 'ltr');
      }
    },

    // Рубустен механизам за евалуација на flat dot-notation клучови (Имун на софтверски багови)
    resolveTranslation(obj, key) {
      if (!obj || !key) return null;
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return obj[key];
      }
      return key.split('.').reduce((prev, curr) => {
        return prev && Object.prototype.hasOwnProperty.call(prev, curr) ? prev[curr] : null;
      }, obj);
    },

    async setLang(lang, updateStorage = true) {
      try {
        const normLang = normalizeLanguage(lang);
        
        if (manifest && manifest.languages) {
          const meta = manifest.languages.find(l => l.code === normLang);
          if (meta) {
            // Автоматска промена на насоката на текстот (RTL/LTR) дефинирана во манифестот
            document.documentElement.setAttribute('dir', meta.dir || 'ltr');
          }
        }

        // Вчитување на соодветната јазична датотека од коренската папка /locales/
        const dictUrl = `${CONFIG.basePath}locales/${normLang}.json?v=${Date.now()}`;
        const response = await fetch(dictUrl);
        
        if (!response.ok) {
          const fallback = manifest ? manifest.fallbackLanguage : 'mk';
          if (normLang !== fallback) {
            console.warn(`[WPA] Failed to load ${normLang}. Falling back to ${fallback}`);
            return await this.setLang(fallback, updateStorage);
          }
          throw new Error(`Critical: Fallback language [${fallback}] dictionary missing!`);
        }

        dictionary = await response.json();
        currentLang = normLang;
        if (updateStorage) saveLanguage(normLang);

        document.documentElement.setAttribute('lang', normLang);
        this.translateDOM();
        
        // Известување до надворешните модули (како bilingual-cleaner) дека јазикот е успешно променет
        document.dispatchEvent(new CustomEvent('wpa:language-changed', { detail: { language: normLang } }));
        return true;
      } catch (e) {
        console.error('[WPA Core setLang Error]', e);
        return false;
      }
    },

    getLang() { return currentLang; },
    
    resetLang() {
      this.setLang('mk', true);
    },

    translateDOM() {
      const elements = document.querySelectorAll('[data-i18n]');
      elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = this.resolveTranslation(dictionary, key);
        if (translation) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
          } else if (el.hasAttribute('title') && el.textContent.trim() !== '') {
            // Ако елементот има сопствен текст, но и помошен наслов (Tooltip), го преведуваме само насловот
            el.setAttribute('title', translation);
          } else {
            el.textContent = translation;
          }
        }
      });
    },

    renderPreviewSelectors() {
      const container = document.getElementById('wpa-preview-languages-container');
      if (!container || !manifest || !manifest.languages) return;
      container.innerHTML = '';
      
      manifest.languages.forEach(item => {
        // СТРОГИ ФИЛТРИ СПОРЕД ВАШИТЕ КРИТЕРИУМИ (ВЕРЗИЈА 3.0.0):
        // Во напредниот панел се рендерираат САМО 'skeleton' јазици со приоритет 'A' или 'B' кои се 'enabled: true'
        const isAllowedPreview = item.status === 'skeleton' && 
                                 (item.priority === 'A' || item.priority === 'B') && 
                                 item.enabled === true;
        
        if (isAllowedPreview) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'padding:5px 8px; font-size:11px; cursor:pointer; background:#f5f5f5; border:1px solid #ccc; text-align:left; border-radius:3px; font-family:sans-serif; transition: background 0.2s;';
          btn.innerText = `${item.label} (${item.code})`;
          btn.title = `Priority: ${item.priority} | Status: ${item.status} | ${item.note || ''}`;
          
          btn.onmouseover = () => { btn.style.background = '#e5e5e5'; };
          btn.onmouseout = () => { btn.style.background = '#f5f5f5'; };
          btn.onclick = () => this.setLang(item.code);
          
          container.appendChild(btn);
        }
      });
    },

    diagnose() {
      const keyCount = Object.keys(dictionary).length;
      const elements = document.querySelectorAll('[data-i18n]');
      console.log(`%c[WPA DIAGNOSIS] Active: ${currentLang} | Registry Keys: ${keyCount} | Elements: ${elements.length}`, 'color: #0066cc; font-weight: bold;');
      return { currentLang, keyCount, domElements: elements.length };
    }
  };

  window.WPAInstituteTranslator = Translator;
  
  document.addEventListener('DOMContentLoaded', () => {
    Translator.init();
  });
})();

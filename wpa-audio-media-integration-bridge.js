(function () {
  'use strict';

  const DEFAULTS = {
    manifestUrl: './wpa-audio-content-manifest.json',
    translatorScriptPath: './translator-loader-v1.js',
    fallbackLanguage: 'mk',
    autoSyncLanguageSelector: true,
    attachToWindow: true,
    debug: true
  };

  function log(...args) {
    if (window.WPAAudioMediaIntegrationConfig?.debug !== false) {
      console.log('[WPA Audio Integration]', ...args);
    }
  }

  function warn(...args) {
    console.warn('[WPA Audio Integration]', ...args);
  }

  function getCurrentLanguage() {
    const bodyLang = document.body?.getAttribute('data-current-language');
    const htmlLang = document.documentElement?.lang;
    const localLang =
      localStorage.getItem('wpa-language') ||
      localStorage.getItem('language') ||
      localStorage.getItem('site-language');
    return bodyLang || localLang || htmlLang || 'mk';
  }

  function setCurrentLanguage(lang) {
    document.documentElement.lang = lang;
    if (document.body) {
      document.body.setAttribute('data-current-language', lang);
    }
    localStorage.setItem('wpa-language', lang);
    localStorage.setItem('language', lang);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch: ' + url + ' (' + response.status + ')');
    }
    return response.json();
  }

  function normalizeBook(book, language) {
    return {
      id: book.id,
      title: resolveLocalized(book.title, language),
      author: resolveLocalized(book.author, language),
      chapters: (book.chapters || []).map((chapter) => ({
        id: chapter.id,
        title: resolveLocalized(chapter.title, language),
        duration: chapter.duration || chapter.duration_estimate || '',
        text: resolveLocalized(chapter.text, language)
      }))
    };
  }

  function normalizeScenario(item, language) {
    return {
      id: item.id,
      title: resolveLocalized(item.title, language),
      summary: resolveLocalized(item.summary, language),
      checklist: (item.checklist || []).map((x) => resolveLocalized(x, language)),
      timeline: (item.timeline || []).map((x) => resolveLocalized(x, language)),
      risks: resolveLocalized(item.risks, language)
    };
  }

  function normalizeVoice(item, language) {
    return {
      id: item.id,
      name: resolveLocalized(item.name, language),
      plan: item.plan || 'free'
    };
  }

  function resolveLocalized(value, language) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value[language] || value.mk || value.en || Object.values(value)[0] || '';
    }
    return String(value);
  }

  function mergeManifestIntoEngine(manifest, language) {
    if (!window.app) {
      warn('Global app state not found. The bridge loaded, but no live engine app object was found.');
      return false;
    }

    if (manifest.books) {
      window.app.books = manifest.books.map((book) => normalizeBook(book, language));
    }

    if (manifest.scenarios) {
      window.app.scenarios = manifest.scenarios.map((item) => normalizeScenario(item, language));
    }

    if (manifest.voices) {
      window.app.voices = manifest.voices.map((item) => normalizeVoice(item, language));
    }

    if (manifest.projects && Array.isArray(manifest.projects)) {
      window.app.projects = manifest.projects.map((project, index) => ({
        id: project.id || ('imported-project-' + index),
        title: resolveLocalized(project.title, language),
        module: resolveLocalized(project.module, language) || 'Dashboard',
        status: resolveLocalized(project.status, language) || 'Draft',
        updated: resolveLocalized(project.updated, language) || 'Imported',
        notes: resolveLocalized(project.notes, language) || '',
        history: (project.history || []).map((x) => resolveLocalized(x, language))
      }));
      if (!window.app.state.projectId && window.app.projects[0]) {
        window.app.state.projectId = window.app.projects[0].id;
      }
    }

    if (manifest.outputSeeds && Array.isArray(manifest.outputSeeds)) {
      window.app.outputs = manifest.outputSeeds.map((item, index) => ({
        id: item.id || ('imported-output-' + index),
        title: resolveLocalized(item.title, language),
        module: resolveLocalized(item.module, language),
        excerpt: resolveLocalized(item.excerpt, language)
      }));
    }

    return true;
  }

  function safelyCall(name) {
    if (typeof window[name] === 'function') {
      window[name]();
    }
  }

  function rerenderEngine() {
    safelyCall('renderProjects');
    safelyCall('renderDashboard');
    safelyCall('renderHistory');
    safelyCall('renderBooks');
    safelyCall('renderVoices');
    safelyCall('renderScenarios');
    safelyCall('renderDelivery');
    safelyCall('renderOutputCards');
    safelyCall('refreshUtility');
  }

  function syncLanguageSelector(lang) {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = lang;
    }
  }

  function attachSelectorSync(api) {
    const languageSelect = document.getElementById('languageSelect');
    if (!languageSelect) return;

    languageSelect.addEventListener('change', async function () {
      const nextLanguage = languageSelect.value;
      setCurrentLanguage(nextLanguage);

      if (window.app && window.app.state) {
        window.app.state.language = nextLanguage;
      }

      try {
        await api.reloadContent(nextLanguage);
      } catch (error) {
        warn('Language reload failed:', error);
      }
    });
  }

  function tryTranslatorLoader(lang) {
    const translator = window.WPATranslator || window.WPATranslatorLoader || window.translatorLoader;
    if (!translator) {
      log('Translator loader was not found on window. Bridge will continue with internal language state only.');
      return;
    }

    try {
      if (typeof translator.setLanguage === 'function') {
        translator.setLanguage(lang);
        return;
      }
      if (typeof translator.applyLanguage === 'function') {
        translator.applyLanguage(lang);
        return;
      }
      if (typeof translator.loadLanguage === 'function') {
        translator.loadLanguage(lang);
      }
    } catch (error) {
      warn('Translator hook failed:', error);
    }
  }

  async function createApi(userConfig) {
    const config = Object.assign({}, DEFAULTS, userConfig || {});
    window.WPAAudioMediaIntegrationConfig = config;

    const api = {
      config,
      manifest: null,

      async loadManifest() {
        this.manifest = await fetchJson(config.manifestUrl);
        return this.manifest;
      },

      async applyContent(language) {
        const lang = language || getCurrentLanguage() || config.fallbackLanguage;
        if (!this.manifest) {
          await this.loadManifest();
        }

        const merged = mergeManifestIntoEngine(this.manifest, lang);
        if (merged) {
          if (window.app && window.app.state) {
            window.app.state.language = lang;
          }
          syncLanguageSelector(lang);
          setCurrentLanguage(lang);
          rerenderEngine();
          tryTranslatorLoader(lang);
          log('Real WPA content applied for language:', lang);
        }
        return merged;
      },

      async reloadContent(language) {
        await this.loadManifest();
        return this.applyContent(language);
      },

      getLanguage() {
        return getCurrentLanguage();
      },

      setLanguage(lang) {
        setCurrentLanguage(lang);
        if (window.app && window.app.state) {
          window.app.state.language = lang;
        }
        syncLanguageSelector(lang);
        tryTranslatorLoader(lang);
      }
    };

    return api;
  }

  async function autoBoot() {
    const config = window.WPAAudioMediaIntegrationConfig || {};
    const api = await createApi(config);

    if (DEFAULTS.attachToWindow || config.attachToWindow !== false) {
      window.WPAAudioMediaIntegration = api;
    }

    try {
      await api.applyContent(getCurrentLanguage());
    } catch (error) {
      warn('Auto-boot content binding failed:', error);
    }

    if (config.autoSyncLanguageSelector !== false) {
      attachSelectorSync(api);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBoot);
  } else {
    autoBoot();
  }
})();

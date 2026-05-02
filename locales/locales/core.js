// WPA Core Translator Engine
// World Protocol Academy
// Phase 1: Macedonian core + scalable multilingual engine

const WPA_TRANSLATOR_CONFIG = {
  defaultLanguage: "mk",
  supportedLanguages: ["mk", "en", "fr", "es", "ar", "zh", "ru"],
  storageKey: "wpa_language",
  localesPath: "/locales/"
};

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

let WPA_DICTIONARIES = {};
let WPA_CURRENT_LANGUAGE = WPA_TRANSLATOR_CONFIG.defaultLanguage;

function getNestedValue(object, path) {
  return path.split(".").reduce((current, key) => {
    return current && Object.prototype.hasOwnProperty.call(current, key)
      ? current[key]
      : undefined;
  }, object);
}

async function loadLanguage(language) {
  if (WPA_DICTIONARIES[language]) {
    return WPA_DICTIONARIES[language];
  }

  try {
    const module = await import(`${WPA_TRANSLATOR_CONFIG.localesPath}${language}.js`);
    WPA_DICTIONARIES[language] = module.default;
    return module.default;
  } catch (error) {
    console.warn(`WPA Translator: language file not found for "${language}". Falling back to Macedonian.`);
    if (language !== WPA_TRANSLATOR_CONFIG.defaultLanguage) {
      return loadLanguage(WPA_TRANSLATOR_CONFIG.defaultLanguage);
    }
    return null;
  }
}

function detectLanguageFromPath() {
  const firstPathPart = window.location.pathname.split("/").filter(Boolean)[0];
  if (WPA_TRANSLATOR_CONFIG.supportedLanguages.includes(firstPathPart)) {
    return firstPathPart;
  }
  return null;
}

function getSavedLanguage() {
  return localStorage.getItem(WPA_TRANSLATOR_CONFIG.storageKey);
}

function saveLanguage(language) {
  localStorage.setItem(WPA_TRANSLATOR_CONFIG.storageKey, language);
}

function normalizeLanguage(language) {
  if (WPA_TRANSLATOR_CONFIG.supportedLanguages.includes(language)) {
    return language;
  }
  return WPA_TRANSLATOR_CONFIG.defaultLanguage;
}

function setDocumentLanguage(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
}

function translateElement(element, dictionary, fallbackDictionary) {
  const key = element.getAttribute("data-i18n");
  const translated = getNestedValue(dictionary, key) || getNestedValue(fallbackDictionary, key);

  if (translated) {
    element.textContent = translated;
  }
}

function translateAttributes(element, dictionary, fallbackDictionary) {
  const attrConfig = element.getAttribute("data-i18n-attr");
  if (!attrConfig) return;

  attrConfig.split(";").forEach((pair) => {
    const [attribute, key] = pair.split(":").map((item) => item.trim());
    if (!attribute || !key) return;

    const translated = getNestedValue(dictionary, key) || getNestedValue(fallbackDictionary, key);
    if (translated) {
      element.setAttribute(attribute, translated);
    }
  });
}

function updateLanguageSwitcher(language) {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    const buttonLanguage = button.getAttribute("data-lang");
    button.classList.toggle("active", buttonLanguage === language);

    if (buttonLanguage === language) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

async function applyTranslations(language) {
  const selectedLanguage = normalizeLanguage(language);
  const dictionary = await loadLanguage(selectedLanguage);
  const fallbackDictionary = await loadLanguage(WPA_TRANSLATOR_CONFIG.defaultLanguage);

  if (!dictionary || !fallbackDictionary) {
    console.error("WPA Translator: missing dictionary.");
    return;
  }

  WPA_CURRENT_LANGUAGE = selectedLanguage;
  saveLanguage(selectedLanguage);
  setDocumentLanguage(selectedLanguage);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    translateElement(element, dictionary, fallbackDictionary);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    translateAttributes(element, dictionary, fallbackDictionary);
  });

  updateLanguageSwitcher(selectedLanguage);

  document.dispatchEvent(
    new CustomEvent("wpa:languageChanged", {
      detail: {
        language: selectedLanguage
      }
    })
  );
}

function bindLanguageSwitcher() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const language = button.getAttribute("data-lang");
      await applyTranslations(language);
    });
  });
}

async function initWPATranslator() {
  const pathLanguage = detectLanguageFromPath();
  const savedLanguage = getSavedLanguage();
  const initialLanguage = normalizeLanguage(pathLanguage || savedLanguage || WPA_TRANSLATOR_CONFIG.defaultLanguage);

  bindLanguageSwitcher();
  await applyTranslations(initialLanguage);
}

window.WPATranslator = {
  init: initWPATranslator,
  setLanguage: applyTranslations,
  getLanguage: () => WPA_CURRENT_LANGUAGE,
  getDictionary: (language = WPA_CURRENT_LANGUAGE) => WPA_DICTIONARIES[language]
};

document.addEventListener("DOMContentLoaded", initWPATranslator);

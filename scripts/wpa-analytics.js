/* WPA consent-aware Google Analytics 4 runtime · 2026-09-09 */
(function () {
  'use strict';
  if (window.__WPA_ANALYTICS_RUNTIME__) return;
  window.__WPA_ANALYTICS_RUNTIME__ = true;

  var CONFIG_URL = '/config/analytics.json';
  var CONSENT_KEY = 'wpa.analytics.consent.v1';
  var BANNER_ID = 'wpaAnalyticsConsentBanner';
  var STYLE_ID = 'wpaAnalyticsConsentStyle';
  var TAG_ID = 'wpaGoogleTagLoader';

  function privacySignalBlocksAnalytics() {
    var dnt = String(navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || '').toLowerCase();
    return navigator.globalPrivacyControl === true || dnt === '1' || dnt === 'yes';
  }

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY) || ''; } catch (error) { return ''; }
  }

  function writeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (error) {}
  }

  function documentLanguage() {
    var value = String(document.documentElement.lang || 'mk').toLowerCase();
    return value.indexOf('en') === 0 ? 'en' : 'mk';
  }

  function copy() {
    if (documentLanguage() === 'en') {
      return {
        text: 'World Protocol Academy uses Google Analytics 4 only after your explicit consent to understand aggregate visits and page usage. Advertising and personalised advertising remain disabled.',
        accept: 'Accept analytics',
        decline: 'Decline',
        policy: 'Cookie policy'
      };
    }
    return {
      text: 'World Protocol Academy користи Google Analytics 4 само по ваша изречна согласност, за агрегирано мерење на посети и користење на страниците. Рекламните и персонализираните рекламни сигнали остануваат исклучени.',
      accept: 'Прифати аналитика',
      decline: 'Одбиј',
      policy: 'Политика за колачиња'
    };
  }

  function removeBanner() {
    var node = document.getElementById(BANNER_ID);
    if (node) node.remove();
  }

  function initGtag(measurementId) {
    if (!measurementId || document.getElementById(TAG_ID)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('set', 'allow_google_signals', false);
    window.gtag('set', 'allow_ad_personalization_signals', false);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var script = document.createElement('script');
    script.id = TAG_ID;
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  function showBanner(config) {
    if (!document.body || document.getElementById(BANNER_ID)) return;
    var t = copy();
    var english = documentLanguage() === 'en';
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '#'+BANNER_ID+'{position:fixed;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));z-index:100000;background:#081328;color:#fbf8ee;border:1px solid #c9a84c;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.28);padding:14px;font:15px/1.55 system-ui,sans-serif;max-height:calc(100dvh - 20px);overflow-y:auto;overflow-x:hidden}',
        '#'+BANNER_ID+' .wpa-analytics-inner{max-width:1120px;margin:auto;display:flex;align-items:center;gap:14px;justify-content:space-between;flex-wrap:wrap}',
        '#'+BANNER_ID+' p{margin:0;max-width:780px;color:#f4f0e4;overflow-wrap:break-word}',
        '#'+BANNER_ID+' .wpa-analytics-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
        '#'+BANNER_ID+' button,#'+BANNER_ID+' .wpa-cookie-policy{min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;white-space:normal;font:700 14px/1.25 system-ui,sans-serif;border-radius:10px;padding:10px 14px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;overflow-wrap:normal;word-break:normal}',
        '#'+BANNER_ID+' .wpa-accept{border:1px solid #c9a84c;background:#c9a84c;color:#081328}',
        '#'+BANNER_ID+' .wpa-decline{border:1px solid #ede0b8;background:transparent;color:#fbf8ee}',
        '#'+BANNER_ID+' .wpa-settings-toggle{border:1px solid #ede0b8;background:#233654;color:#fbf8ee}',
        '#'+BANNER_ID+' .wpa-cookie-policy{color:#f2d48b;border:1px solid transparent}',
        '#'+BANNER_ID+' button:focus-visible,#'+BANNER_ID+' a:focus-visible,#'+BANNER_ID+' input:focus-visible{outline:3px solid #fff;outline-offset:3px}',
        '#'+BANNER_ID+' .wpa-analytics-preferences{margin:12px auto 0;padding:12px;background:#132745;border:1px solid #a28c5a;border-radius:10px;max-width:1120px}',
        '#'+BANNER_ID+' .wpa-analytics-preferences[hidden]{display:none!important}',
        '#'+BANNER_ID+' .wpa-analytics-preferences label{display:flex;gap:10px;align-items:center;min-height:44px;margin:8px 0;color:#fbf8ee}',
        '#'+BANNER_ID+' input[type="checkbox"]{width:22px;height:22px;accent-color:#d6b965}',
        '#'+BANNER_ID+' .wpa-analytics-pref-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}',
        '#'+BANNER_ID+' .wpa-analytics-save{border:1px solid #c9a84c;background:#c9a84c;color:#081328}',
        '#'+BANNER_ID+' .wpa-analytics-cancel{border:1px solid #ede0b8;background:transparent;color:#fbf8ee}',
        '@media(max-width:760px){#'+BANNER_ID+' .wpa-analytics-inner{align-items:stretch;flex-direction:column}#'+BANNER_ID+' .wpa-analytics-actions{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}#'+BANNER_ID+' .wpa-analytics-actions button,#'+BANNER_ID+' .wpa-analytics-actions a{width:100%;text-align:center}#'+BANNER_ID+' .wpa-analytics-actions .wpa-settings-toggle{grid-column:1/3}#'+BANNER_ID+' p{max-width:100%}}',
        '@media(max-width:360px){#'+BANNER_ID+'{font-size:14px;padding:11px}#'+BANNER_ID+' .wpa-analytics-actions{gap:6px}#'+BANNER_ID+' button,#'+BANNER_ID+' a{font-size:13px;padding:10px}}',
        '@media(prefers-reduced-motion:reduce){#'+BANNER_ID+' *{scroll-behavior:auto!important}}'
      ].join('');
      document.head.appendChild(style);
    }
    var banner = document.createElement('aside');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', english ? 'Analytics consent preferences' : 'Согласност и поставки за аналитика');
    banner.innerHTML = '<div class="wpa-analytics-inner"><p id="wpaAnalyticsDescription"></p><div class="wpa-analytics-actions"><button type="button" class="wpa-accept"></button><button type="button" class="wpa-decline"></button><button type="button" class="wpa-settings-toggle" aria-expanded="false" aria-controls="wpaAnalyticsPreferences"></button><a class="wpa-cookie-policy" href="/cookies.html"></a></div></div><div class="wpa-analytics-preferences" id="wpaAnalyticsPreferences" hidden><p id="wpaAnalyticsPreferencesDescription"></p><label for="wpaAnalyticsOptIn"><input type="checkbox" id="wpaAnalyticsOptIn"><span id="wpaAnalyticsOptInLabel"></span></label><div class="wpa-analytics-pref-actions"><button type="button" class="wpa-analytics-save"></button><button type="button" class="wpa-analytics-cancel"></button></div></div>';
    banner.querySelector('#wpaAnalyticsDescription').textContent = t.text;
    banner.querySelector('.wpa-accept').textContent = t.accept;
    banner.querySelector('.wpa-decline').textContent = t.decline;
    banner.querySelector('.wpa-cookie-policy').textContent = t.policy;
    banner.querySelector('.wpa-settings-toggle').textContent = english ? 'Settings' : 'Поставки';
    banner.querySelector('#wpaAnalyticsPreferencesDescription').textContent = english ? 'Analytics is optional and off by default. You can save a preference without consenting to analytics.' : 'Аналитиката е изборна и стандардно исклучена. Можете да ги зачувате поставките и без согласност за аналитика.';
    banner.querySelector('#wpaAnalyticsOptInLabel').textContent = english ? 'Allow optional analytics' : 'Дозволи изборна аналитика';
    banner.querySelector('.wpa-analytics-save').textContent = english ? 'Save preferences' : 'Зачувај поставки';
    banner.querySelector('.wpa-analytics-cancel').textContent = english ? 'Cancel' : 'Откажи';

    function applyDecision(granted) {
      writeConsent(granted ? 'granted' : 'denied');
      removeBanner();
      if (granted && !privacySignalBlocksAnalytics()) initGtag(config.measurementId);
    }
    banner.querySelector('.wpa-accept').addEventListener('click', function () { applyDecision(true); });
    banner.querySelector('.wpa-decline').addEventListener('click', function () { applyDecision(false); });
    banner.querySelector('.wpa-settings-toggle').addEventListener('click', function () {
      var panel = banner.querySelector('#wpaAnalyticsPreferences');
      var open = panel.hidden;
      panel.hidden = !open;
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) banner.querySelector('#wpaAnalyticsOptIn').focus();
    });
    banner.querySelector('.wpa-analytics-save').addEventListener('click', function () {
      applyDecision(banner.querySelector('#wpaAnalyticsOptIn').checked === true);
    });
    banner.querySelector('.wpa-analytics-cancel').addEventListener('click', function () {
      banner.querySelector('#wpaAnalyticsPreferences').hidden = true;
      banner.querySelector('.wpa-settings-toggle').setAttribute('aria-expanded', 'false');
      banner.querySelector('.wpa-settings-toggle').focus();
    });
    document.body.appendChild(banner);
  }

  function bootWithConfig(config) {
    if (!config || !/^G-[A-Z0-9]{6,20}$/i.test(String(config.measurementId || ''))) return;

    if (privacySignalBlocksAnalytics()) {
      removeBanner();
      return;
    }

    var consent = readConsent();
    if (consent === 'granted') {
      initGtag(config.measurementId);
      return;
    }
    if (consent === 'denied') return;

    // Consent remains mandatory even if a remote configuration requests otherwise.
    showBanner(config);
  }

  function boot() {
    fetch(CONFIG_URL, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (response) { if (!response.ok) throw new Error('analytics-config'); return response.json(); })
      .then(bootWithConfig)
      .catch(function () {});
  }

  window.WPAAnalyticsConsent = {
    status: readConsent,
    reset: function () { try { localStorage.removeItem(CONSENT_KEY); } catch (error) {} window.location.reload(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

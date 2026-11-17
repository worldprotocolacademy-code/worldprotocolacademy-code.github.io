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
        decline: 'Reject',
        settings: 'Settings',
        save: 'Save preferences',
        analyticsOptIn: 'Enable optional analytics',
        consentTitle: 'Analytics preferences',
        policy: 'Cookie policy'
      };
    }
    return {
      text: 'World Protocol Academy користи Google Analytics 4 само по ваша изречна согласност, за агрегирано мерење на посети и користење на страниците. Рекламните и персонализираните рекламни сигнали остануваат исклучени.',
      accept: 'Прифати аналитика',
      decline: 'Одбиј',
      settings: 'Поставки',
      save: 'Зачувај избор',
      analyticsOptIn: 'Дозволи изборна аналитика',
      consentTitle: 'Поставки за аналитика',
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
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '#'+BANNER_ID+'{box-sizing:border-box;position:fixed;left:12px;right:12px;bottom:12px;max-height:min(78dvh,620px);overflow-y:auto;z-index:100000;background:#081328;color:#fbf8ee;border:1px solid #c9a84c;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.28);padding:16px;font:14px/1.55 Inter,system-ui,sans-serif}',
        '#'+BANNER_ID+' *,#'+BANNER_ID+' *::before,#'+BANNER_ID+' *::after{box-sizing:border-box}',
        '#'+BANNER_ID+' .wpa-analytics-inner{max-width:1120px;margin:auto;display:flex;align-items:center;gap:14px;justify-content:space-between;flex-wrap:wrap}',
        '#'+BANNER_ID+' p{margin:0;max-width:780px;color:#f0ece2;overflow-wrap:break-word;flex:1 1 330px}',
        '#'+BANNER_ID+' .wpa-analytics-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;flex:1 1 360px;justify-content:flex-end}',
        '#'+BANNER_ID+' button,#'+BANNER_ID+' a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;font:700 13px/1.35 Inter,system-ui,sans-serif;border-radius:8px;padding:11px 14px;text-decoration:none;cursor:pointer;white-space:normal;overflow-wrap:break-word;text-align:center}',
        '#'+BANNER_ID+' .wpa-accept{border:1px solid #c9a84c;background:#c9a84c;color:#081328}',
        '#'+BANNER_ID+' .wpa-decline,#'+BANNER_ID+' .wpa-settings{border:1px solid rgba(251,248,238,.65);background:transparent;color:#fbf8ee}',
        '#'+BANNER_ID+' .wpa-settings-panel{width:100%;max-width:1120px;margin:12px auto 0;padding:12px 0 0;border-top:1px solid rgba(201,168,76,.45);display:flex;align-items:center;flex-wrap:wrap;gap:12px}',
        '#'+BANNER_ID+' .wpa-settings-panel[hidden]{display:none!important}',
        '#'+BANNER_ID+' .wpa-settings-panel label{display:flex;align-items:center;gap:10px;min-height:44px;color:#fbf8ee;flex:1 1 220px}',
        '#'+BANNER_ID+' .wpa-settings-panel input{width:22px;height:22px;accent-color:#c9a84c;flex:none}',
        '#'+BANNER_ID+' .wpa-save{background:#c9a84c;color:#081328;border:1px solid #c9a84c}',
        '#'+BANNER_ID+' a{color:#f0d388;border:1px solid rgba(201,168,76,.4);text-decoration:underline;text-underline-offset:3px}',
        '#'+BANNER_ID+' :focus-visible{outline:3px solid #f7dc92;outline-offset:3px}',
        '@media(max-width:760px){#'+BANNER_ID+'{left:8px;right:8px;bottom:8px;padding:12px;max-height:78dvh}#'+BANNER_ID+' .wpa-analytics-inner{align-items:stretch;flex-direction:column}#'+BANNER_ID+' .wpa-analytics-actions{justify-content:stretch;flex:initial;width:100%}#'+BANNER_ID+' .wpa-analytics-actions button{flex:1 1 calc(50% - 8px)}#'+BANNER_ID+' p{flex:initial}}',
        '@media(max-width:360px){#'+BANNER_ID+' .wpa-analytics-actions button{flex:1 1 100%}}'
      ].join('');
      document.head.appendChild(style);
    }

    var banner = document.createElement('aside');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', t.consentTitle);
    banner.innerHTML = '<div class="wpa-analytics-inner"><p></p><div class="wpa-analytics-actions"><button type="button" class="wpa-accept"></button><button type="button" class="wpa-decline"></button><button type="button" class="wpa-settings" aria-expanded="false" aria-controls="wpaAnalyticsSettingsPanel"></button></div></div><div class="wpa-settings-panel" id="wpaAnalyticsSettingsPanel" hidden><label><input type="checkbox" class="wpa-analytics-optin"><span class="wpa-optin-label"></span></label><button type="button" class="wpa-save"></button><a href="/cookies.html"></a></div>';
    banner.querySelector('p').textContent = t.text;
    banner.querySelector('.wpa-accept').textContent = t.accept;
    banner.querySelector('.wpa-decline').textContent = t.decline;
    banner.querySelector('.wpa-settings').textContent = t.settings;
    banner.querySelector('.wpa-save').textContent = t.save;
    banner.querySelector('.wpa-optin-label').textContent = t.analyticsOptIn;
    banner.querySelector('a').textContent = t.policy;
    banner.querySelector('.wpa-settings').addEventListener('click', function () {
      var panel = banner.querySelector('.wpa-settings-panel');
      var opened = panel.hidden;
      panel.hidden = !opened;
      banner.querySelector('.wpa-settings').setAttribute('aria-expanded', opened ? 'true' : 'false');
      if (opened) banner.querySelector('.wpa-analytics-optin').focus();
    });
    banner.querySelector('.wpa-save').addEventListener('click', function () {
      var granted = banner.querySelector('.wpa-analytics-optin').checked;
      writeConsent(granted ? 'granted' : 'denied');
      removeBanner();
      if (granted) initGtag(config.measurementId);
    });
    banner.querySelector('.wpa-accept').addEventListener('click', function () {
      writeConsent('granted');
      removeBanner();
      initGtag(config.measurementId);
    });
    banner.querySelector('.wpa-decline').addEventListener('click', function () {
      writeConsent('denied');
      removeBanner();
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

    // Consent is mandatory even if an older configuration disables the gate.
    // Never load GA4 without a recorded explicit opt-in in this browser.
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

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
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = [
        '#'+BANNER_ID+'{position:fixed;left:16px;right:16px;bottom:16px;z-index:100000;background:#081328;color:#fbf8ee;border:1px solid #c9a84c;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.28);padding:16px;font:14px/1.5 Inter,system-ui,sans-serif}',
        '#'+BANNER_ID+' .wpa-analytics-inner{max-width:1120px;margin:auto;display:flex;align-items:center;gap:14px;justify-content:space-between}',
        '#'+BANNER_ID+' p{margin:0;max-width:780px;color:rgba(251,248,238,.9)}',
        '#'+BANNER_ID+' .wpa-analytics-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
        '#'+BANNER_ID+' button,#'+BANNER_ID+' a{font:700 12px/1 Inter,system-ui,sans-serif;border-radius:999px;padding:10px 14px;text-decoration:none;cursor:pointer}',
        '#'+BANNER_ID+' .wpa-accept{border:1px solid #c9a84c;background:#c9a84c;color:#081328}',
        '#'+BANNER_ID+' .wpa-decline{border:1px solid rgba(251,248,238,.4);background:transparent;color:#fbf8ee}',
        '#'+BANNER_ID+' a{color:#e8d49a;border:1px solid transparent}',
        '@media(max-width:760px){#'+BANNER_ID+' .wpa-analytics-inner{align-items:flex-start;flex-direction:column}#'+BANNER_ID+' .wpa-analytics-actions{width:100%}#'+BANNER_ID+' button{flex:1}}'
      ].join('');
      document.head.appendChild(style);
    }

    var banner = document.createElement('aside');
    banner.id = BANNER_ID;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics consent');
    banner.innerHTML = '<div class="wpa-analytics-inner"><p></p><div class="wpa-analytics-actions"><button type="button" class="wpa-accept"></button><button type="button" class="wpa-decline"></button><a href="/cookies.html"></a></div></div>';
    banner.querySelector('p').textContent = t.text;
    banner.querySelector('.wpa-accept').textContent = t.accept;
    banner.querySelector('.wpa-decline').textContent = t.decline;
    banner.querySelector('a').textContent = t.policy;
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

    if (config.consentRequired === false) {
      initGtag(config.measurementId);
      return;
    }
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

/* WPA Homepage · Audio/Video Session Card v1.0 */
(function () {
  'use strict';

  if (window.WPA_HOME_AUDIO_VIDEO_SESSION_CARD_LOADED) return;
  window.WPA_HOME_AUDIO_VIDEO_SESSION_CARD_LOADED = true;

  var CREATOR_URL = '/ai/wpa-audio-video-creator-engine-v9-final-functional.html';
  var COMMAND_DECK_URL = '/audio-media-engine.html';

  function ensureStyles() {
    if (document.getElementById('wpa-home-audio-video-session-card-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-home-audio-video-session-card-style';
    style.textContent = [
      '#wpaHomeOnlineMeetingsGrid{grid-template-columns:repeat(4,minmax(0,1fr))!important;}',
      '#wpaHomeAudioVideoCard{height:100%;}',
      '#wpaHomeAudioVideoCard .wpa-home-av-card{height:100%;position:relative;overflow:hidden;border-color:rgba(201,168,76,.42);}',
      '#wpaHomeAudioVideoCard .wpa-home-av-card:before{content:"WPA";position:absolute;right:-6px;bottom:-24px;font:700 72px/1 Georgia,serif;color:rgba(13,31,60,.045);pointer-events:none;}',
      '.wpa-home-av-badge{display:inline-flex;align-items:center;gap:6px;margin-bottom:12px;padding:5px 8px;border:1px solid rgba(201,168,76,.42);border-radius:999px;background:rgba(201,168,76,.09);color:var(--goldd);font:700 9.5px/1 var(--fb);letter-spacing:.7px;text-transform:uppercase;}',
      '.wpa-home-av-head{display:flex;align-items:center;gap:12px;margin-bottom:12px;}',
      '.wpa-home-av-icon{width:40px;height:40px;border-radius:8px;background:var(--navy);display:flex;align-items:center;justify-content:center;flex:0 0 40px;}',
      '.wpa-home-av-icon svg{width:21px;height:21px;fill:none;stroke:var(--goldl);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}',
      '.wpa-home-av-title{font-family:var(--fd);font-size:20px;color:var(--navy);margin:0;}',
      '.wpa-home-av-copy{color:var(--muted);font-size:14px;line-height:1.65;margin:0;}',
      '.wpa-home-av-boundary{display:block;margin-top:8px;color:var(--goldd);font-size:11.5px;font-weight:700;}',
      '.wpa-home-av-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;position:relative;z-index:1;}',
      '.wpa-home-av-actions a{display:inline-flex;align-items:center;justify-content:center;padding:8px 10px;border-radius:6px;text-decoration:none;font:700 11.5px/1.2 var(--fb);}',
      '.wpa-home-av-primary{background:var(--navy);color:#fff!important;border:1px solid var(--navy);}',
      '.wpa-home-av-secondary{background:transparent;color:var(--goldd)!important;border:1px solid var(--line);}',
      '@media(max-width:1100px){#wpaHomeOnlineMeetingsGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}}',
      '@media(max-width:700px){#wpaHomeOnlineMeetingsGrid{grid-template-columns:1fr!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function findMeetingsGrid() {
    var meet = document.querySelector('a[href^="https://meet.google.com"]');
    if (!meet || !meet.parentElement) return null;
    var grid = meet.parentElement;
    var zoom = grid.querySelector('a[href^="https://zoom.us"]');
    var webex = grid.querySelector('a[href^="https://www.webex.com"],a[href^="https://webex.com"]');
    if (!zoom || !webex) return null;
    return grid;
  }

  function render() {
    var grid = findMeetingsGrid();
    if (!grid) return false;

    ensureStyles();
    grid.id = 'wpaHomeOnlineMeetingsGrid';

    if (document.getElementById('wpaHomeAudioVideoCard')) return true;

    var wrap = document.createElement('div');
    wrap.id = 'wpaHomeAudioVideoCard';
    wrap.setAttribute('data-no-i18n', 'true');
    wrap.innerHTML = [
      '<div class="card wpa-home-av-card">',
        '<div class="wpa-home-av-badge">WPA · Development Tool</div>',
        '<div class="wpa-home-av-head">',
          '<div class="wpa-home-av-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="12" height="14" rx="2"></rect><path d="M15 10l5-3v10l-5-3"></path><path d="M7 9v6M10 8v8"></path></svg></div>',
          '<h4 class="wpa-home-av-title">WPA Audio Video Creator Engine v9</h4>',
        '</div>',
        '<p class="wpa-home-av-copy">Наша WPA алатка за audio/video workflows, 200 scenario bank, scripts, production packages и live-room governance.<span class="wpa-home-av-boundary">Real-time WPA WebRTC room remains Phase 2 · not an active conferencing service.</span></p>',
        '<div class="wpa-home-av-actions">',
          '<a class="wpa-home-av-primary" href="' + CREATOR_URL + '">Отвори WPA Audio / Video →</a>',
          '<a class="wpa-home-av-secondary" href="' + COMMAND_DECK_URL + '">Command Deck →</a>',
        '</div>',
      '</div>'
    ].join('');

    grid.appendChild(wrap);
    return true;
  }

  render();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  window.setTimeout(render, 250);
  window.setTimeout(render, 1000);
  window.setTimeout(render, 2500);
})();

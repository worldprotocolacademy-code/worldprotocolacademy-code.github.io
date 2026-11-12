/* WPA Homepage · Broadcast Gateway v1.0 · Дипломатка + Дипломат */
(function () {
  'use strict';

  if (window.WPA_HOME_BROADCAST_GATEWAY_LOADED) return;
  window.WPA_HOME_BROADCAST_GATEWAY_LOADED = true;

  var NEWS_URL = '/media/news/';
  var SHOW_URL = '/media/protocol-tv/';
  var MEDIA_URL = '/media/';

  function ensureStyles() {
    if (document.getElementById('wpa-home-broadcast-gateway-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-home-broadcast-gateway-style';
    style.textContent = [
      '#wpaBroadcastGateway{position:relative;padding:76px 0;background:linear-gradient(135deg,#071426 0%,#0d1f3c 58%,#132d50 100%);overflow:hidden;border-top:1px solid rgba(201,168,76,.28);border-bottom:1px solid rgba(201,168,76,.28);}',
      '#wpaBroadcastGateway:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(232,212,154,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(232,212,154,.045) 1px,transparent 1px);background-size:64px 64px;pointer-events:none;}',
      '#wpaBroadcastGateway:after{content:"";position:absolute;width:520px;height:520px;border-radius:50%;right:-180px;top:-220px;background:radial-gradient(circle,rgba(201,168,76,.22),transparent 68%);pointer-events:none;}',
      '#wpaBroadcastGateway .wpa-bcast-wrap{position:relative;z-index:1;width:min(var(--max,1280px),calc(100% - 40px));margin:0 auto;}',
      '#wpaBroadcastGateway .wpa-bcast-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:44px;align-items:stretch;}',
      '#wpaBroadcastGateway .wpa-bcast-eyebrow{display:inline-flex;align-items:center;gap:9px;padding:7px 12px;border:1px solid rgba(201,168,76,.42);border-radius:999px;background:rgba(201,168,76,.08);color:#e8d49a;font:800 10px/1.2 var(--fb,system-ui);letter-spacing:1.05px;text-transform:uppercase;}',
      '#wpaBroadcastGateway .wpa-bcast-eyebrow:before{content:"";width:7px;height:7px;border-radius:50%;background:#c9a84c;box-shadow:0 0 0 5px rgba(201,168,76,.12);}',
      '#wpaBroadcastGateway h2{margin:20px 0 16px;color:#fff;font-family:var(--fp,Georgia,serif);font-size:clamp(34px,4.4vw,58px);line-height:1.02;letter-spacing:-.6px;}',
      '#wpaBroadcastGateway h2 span{color:#e8d49a;}',
      '#wpaBroadcastGateway .wpa-bcast-lead{max-width:760px;color:rgba(255,255,255,.76);font-size:16px;line-height:1.75;margin:0;}',
      '#wpaBroadcastGateway .wpa-bcast-rule{width:72px;height:2px;margin:24px 0;background:linear-gradient(90deg,#c9a84c,rgba(201,168,76,0));}',
      '#wpaBroadcastGateway .wpa-bcast-principle{display:flex;gap:12px;align-items:flex-start;max-width:720px;color:rgba(255,255,255,.72);font-size:13px;line-height:1.6;}',
      '#wpaBroadcastGateway .wpa-bcast-principle strong{color:#e8d49a;}',
      '#wpaBroadcastGateway .wpa-bcast-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px;}',
      '#wpaBroadcastGateway .wpa-bcast-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border-radius:5px;font:800 12px/1.2 var(--fb,system-ui);letter-spacing:.35px;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease,background .18s ease;}',
      '#wpaBroadcastGateway .wpa-bcast-btn:hover{transform:translateY(-2px);}',
      '#wpaBroadcastGateway .wpa-bcast-btn.primary{background:#c9a84c;color:#071426;border:1px solid #c9a84c;box-shadow:0 10px 28px rgba(201,168,76,.18);}',
      '#wpaBroadcastGateway .wpa-bcast-btn.secondary{background:rgba(255,255,255,.05);color:#fff;border:1px solid rgba(232,212,154,.35);}',
      '#wpaBroadcastGateway .wpa-bcast-visual{position:relative;min-height:350px;border:1px solid rgba(201,168,76,.35);border-radius:18px;background:linear-gradient(160deg,rgba(255,255,255,.075),rgba(255,255,255,.018));box-shadow:0 24px 70px rgba(0,0,0,.28);overflow:hidden;}',
      '#wpaBroadcastGateway .wpa-bcast-visual:before{content:"WPA NEWS";position:absolute;right:-10px;bottom:-16px;color:rgba(232,212,154,.055);font:900 66px/1 var(--fb,system-ui);letter-spacing:-4px;white-space:nowrap;}',
      '#wpaBroadcastGateway .wpa-bcast-screen{position:absolute;inset:22px;display:grid;grid-template-rows:auto 1fr auto;gap:18px;}',
      '#wpaBroadcastGateway .wpa-bcast-screen-top{display:flex;justify-content:space-between;gap:14px;align-items:center;color:#e8d49a;font:800 10px/1.2 var(--fb,system-ui);letter-spacing:.8px;text-transform:uppercase;}',
      '#wpaBroadcastGateway .wpa-bcast-onair{display:inline-flex;align-items:center;gap:7px;}',
      '#wpaBroadcastGateway .wpa-bcast-onair i{display:block;width:7px;height:7px;border-radius:50%;background:#c9a84c;}',
      '#wpaBroadcastGateway .wpa-bcast-stage{display:grid;grid-template-columns:1fr 92px 1fr;gap:10px;align-items:center;}',
      '#wpaBroadcastGateway .wpa-bcast-person{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;}',
      '#wpaBroadcastGateway .wpa-bcast-avatar{width:104px;height:104px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(232,212,154,.44);background:radial-gradient(circle at 50% 30%,rgba(232,212,154,.22),rgba(201,168,76,.06) 46%,rgba(7,20,38,.78) 70%);color:#f4e8c1;font:700 38px/1 Georgia,serif;box-shadow:0 0 0 8px rgba(201,168,76,.045);}',
      '#wpaBroadcastGateway .wpa-bcast-person b{color:#fff;font:700 13px/1.2 var(--fb,system-ui);}',
      '#wpaBroadcastGateway .wpa-bcast-person small{color:rgba(255,255,255,.52);font:600 9px/1.3 var(--fb,system-ui);text-transform:uppercase;letter-spacing:.55px;}',
      '#wpaBroadcastGateway .wpa-bcast-icon{width:92px;height:92px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#08182d;border:1px solid rgba(201,168,76,.45);box-shadow:0 0 0 9px rgba(201,168,76,.04);}',
      '#wpaBroadcastGateway .wpa-bcast-icon svg{width:52px;height:52px;fill:none;stroke:#e8d49a;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round;}',
      '#wpaBroadcastGateway .wpa-bcast-status{display:flex;justify-content:space-between;gap:14px;align-items:center;padding-top:14px;border-top:1px solid rgba(232,212,154,.16);color:rgba(255,255,255,.55);font:700 9.5px/1.35 var(--fb,system-ui);letter-spacing:.5px;text-transform:uppercase;}',
      '#wpaBroadcastGateway .wpa-bcast-status strong{color:#e8d49a;font-weight:800;}',
      '#wpaHomeNewsShortcut{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:0 11px;border:1px solid rgba(201,168,76,.48);border-radius:999px;background:linear-gradient(135deg,#0d1f3c,#162947);color:#f4e8c1!important;text-decoration:none;font:800 10.5px/1 var(--fb,system-ui);letter-spacing:.45px;box-shadow:0 6px 18px rgba(13,31,60,.12);white-space:nowrap;transition:transform .18s ease,box-shadow .18s ease;}',
      '#wpaHomeNewsShortcut:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(13,31,60,.18);}',
      '#wpaHomeNewsShortcut svg{width:16px;height:16px;fill:none;stroke:#e8d49a;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}',
      '#wpaHomeNewsShortcut .wpa-home-news-dot{width:6px;height:6px;border-radius:50%;background:#c9a84c;box-shadow:0 0 0 4px rgba(201,168,76,.10);}',
      '@media(max-width:1180px){#wpaHomeNewsShortcut .wpa-home-news-label{display:none}#wpaHomeNewsShortcut{width:38px;padding:0;justify-content:center}}',
      '@media(max-width:900px){#wpaBroadcastGateway{padding:58px 0}#wpaBroadcastGateway .wpa-bcast-grid{grid-template-columns:1fr}#wpaBroadcastGateway .wpa-bcast-visual{min-height:330px}}',
      '@media(max-width:540px){#wpaBroadcastGateway .wpa-bcast-wrap{width:min(100% - 28px,1280px)}#wpaBroadcastGateway .wpa-bcast-stage{grid-template-columns:1fr 70px 1fr}#wpaBroadcastGateway .wpa-bcast-avatar{width:82px;height:82px;font-size:30px}#wpaBroadcastGateway .wpa-bcast-icon{width:68px;height:68px}#wpaBroadcastGateway .wpa-bcast-icon svg{width:40px;height:40px}#wpaBroadcastGateway .wpa-bcast-actions{display:grid;grid-template-columns:1fr}#wpaBroadcastGateway .wpa-bcast-btn{width:100%}}'
    ].join('');
    document.head.appendChild(style);
  }

  function renderNavShortcut() {
    if (document.getElementById('wpaHomeNewsShortcut')) return true;
    var host = document.querySelector('.nav-right');
    if (!host) return false;
    var a = document.createElement('a');
    a.id = 'wpaHomeNewsShortcut';
    a.href = NEWS_URL;
    a.setAttribute('aria-label', 'WPA NEWS · Дневни вести');
    a.setAttribute('title', 'WPA NEWS · Дипломатка + Дипломат');
    a.setAttribute('data-no-i18n', 'true');
    a.setAttribute('translate', 'no');
    a.innerHTML = '<span class="wpa-home-news-dot" aria-hidden="true"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"></path><path d="M7 8h6M7 11h10M7 14h10M16 8h1"></path></svg><span class="wpa-home-news-label">WPA NEWS</span>';
    var lang = host.querySelector('.lang-sw');
    if (lang) host.insertBefore(a, lang);
    else host.appendChild(a);
    return true;
  }

  function render() {
    if (document.getElementById('wpaBroadcastGateway')) return true;
    var anchor = document.getElementById('sessions');
    if (!anchor || !anchor.parentNode) return false;

    ensureStyles();
    renderNavShortcut();

    var section = document.createElement('section');
    section.id = 'wpaBroadcastGateway';
    section.setAttribute('data-no-i18n', 'true');
    section.setAttribute('translate', 'no');
    section.setAttribute('aria-labelledby', 'wpaBroadcastGatewayTitle');
    section.innerHTML = [
      '<div class="wpa-bcast-wrap">',
        '<div class="wpa-bcast-grid">',
          '<div>',
            '<div class="wpa-bcast-eyebrow">WPA Broadcast · Human-Governed</div>',
            '<h2 id="wpaBroadcastGatewayTitle">WPA NEWS <span>· Дипломатка + Дипломат</span></h2>',
            '<p class="wpa-bcast-lead">Дневни вести и неделна емисија за протокол, дипломатија, јавна слика и институционална комуникација. Автоматизираните агенти подготвуваат; изворите и provenance се проверуваат; Human Gate ја задржува конечната уредничка власт.</p>',
            '<div class="wpa-bcast-rule"></div>',
            '<div class="wpa-bcast-principle"><strong>WPA правило:</strong><span>AI може да работи непрекинато. Не смее самото да се овласти. Дипломатка и Дипломат презентираат само release object што го поминал предвидениот Human Gate.</span></div>',
            '<div class="wpa-bcast-actions">',
              '<a class="wpa-bcast-btn primary" href="' + NEWS_URL + '" aria-label="Отвори WPA NEWS дневни вести">ДНЕВНИ ВЕСТИ →</a>',
              '<a class="wpa-bcast-btn secondary" href="' + SHOW_URL + '" aria-label="Отвори WPA Protocol TV">WPA PROTOCOL TV →</a>',
              '<a class="wpa-bcast-btn secondary" href="' + MEDIA_URL + '" aria-label="Отвори WPA Media Command">MEDIA COMMAND →</a>',
            '</div>',
          '</div>',
          '<div class="wpa-bcast-visual" aria-label="WPA NEWS broadcast identity">',
            '<div class="wpa-bcast-screen">',
              '<div class="wpa-bcast-screen-top"><span>World Protocol Academy</span><span class="wpa-bcast-onair"><i></i>Production workflow</span></div>',
              '<div class="wpa-bcast-stage">',
                '<div class="wpa-bcast-person"><div class="wpa-bcast-avatar">Дк</div><b>Дипломатка</b><small>Protocol · Public Image</small></div>',
                '<div class="wpa-bcast-icon" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18"></circle><path d="M14 32h36M32 14c6 6 9 12 9 18s-3 12-9 18M32 14c-6 6-9 12-9 18s3 12 9 18"></path><path d="M7 23c-3 6-3 12 0 18M57 23c3 6 3 12 0 18"></path></svg></div>',
                '<div class="wpa-bcast-person"><div class="wpa-bcast-avatar">Д</div><b>Дипломат</b><small>Diplomacy · World Affairs</small></div>',
              '</div>',
              '<div class="wpa-bcast-status"><span><strong>DAILY</strong> · 8–12 min</span><span><strong>WEEKLY</strong> · 24–30 min</span><span>Human Gate</span></div>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    anchor.insertAdjacentElement('afterend', section);
    return true;
  }

  render();
  renderNavShortcut();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ render(); renderNavShortcut(); }, { once: true });
  window.setTimeout(function(){ render(); renderNavShortcut(); }, 250);
  window.setTimeout(function(){ render(); renderNavShortcut(); }, 1000);
  window.setTimeout(function(){ render(); renderNavShortcut(); }, 2500);
})();

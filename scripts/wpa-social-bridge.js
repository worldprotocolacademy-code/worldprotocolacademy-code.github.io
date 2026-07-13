/* WPA Social Bridge Network v1.0.0
   Official public channels + contextual sharing + local, privacy-safe event queue.
   No automatic posting, no credentials, no private-data collection. */
(function () {
  'use strict';

  var REGISTRY_URL = '/data/wpa-social-network.json?v=20260713-1';
  var FALLBACK = {
    facebook: { label: 'Facebook', url: 'https://www.facebook.com/share/1G3Z8WabBx/' },
    instagram: { label: 'Instagram', url: 'https://www.instagram.com/worldprotocolacademy?igsh=MXJsMW9oNHczZmlyag%3D%3D' },
    x: { label: 'X / Twitter', url: 'https://x.com/world_acad66822' },
    tiktok: { label: 'TikTok', url: 'https://www.tiktok.com/@world.protocol.academy?_r=1&_t=ZS-93zc3YLmvG1' },
    youtube: { label: 'YouTube', url: 'https://www.youtube.com/@worldprotocolacademy' }
  };
  var MAX_EVENTS = 100;

  function path() {
    return String(window.location.pathname || '/').replace(/\/+$/, '') || '/';
  }

  function systemId() {
    var p = path().toLowerCase();
    if (p.indexOf('/journal/live') === 0) return 'journal_live_global_monitor';
    if (p.indexOf('/tools/wpa-five-engines') === 0) return 'wpa_five_engines';
    if (p.indexOf('/tools/wpa-digital-pavilion') === 0) return 'live_pavilion_console';
    if (p.indexOf('/protocolometry-center') === 0) return 'protocolometry_center';
    if (p.indexOf('/wpa-briefings') === 0) return 'premium_briefings';
    if (p.indexOf('/virtual-sande-ai') === 0 || p.indexOf('/viral-sande-ai') === 0) return 'virtual_sande';
    return 'wpa_system';
  }

  function queueEvent(network, action, targetUrl) {
    var detail = {
      timestamp: new Date().toISOString(),
      system: systemId(),
      network: network || 'unknown',
      action: action || 'open',
      target_url: targetUrl || window.location.href
    };
    try {
      var stored = JSON.parse(localStorage.getItem('wpa.social.events') || '[]');
      if (!Array.isArray(stored)) stored = [];
      stored.push(detail);
      if (stored.length > MAX_EVENTS) stored = stored.slice(stored.length - MAX_EVENTS);
      localStorage.setItem('wpa.social.events', JSON.stringify(stored));
    } catch (e) {}
    try { document.dispatchEvent(new CustomEvent('wpa:social-action', { detail: detail })); } catch (e2) {}
    return detail;
  }

  function pageContext() {
    var title = document.querySelector('h1') || document.querySelector('h2');
    var description = document.querySelector('meta[name="description"]');
    return {
      title: (title && title.textContent ? title.textContent.trim() : document.title).slice(0, 180),
      description: description ? String(description.content || '').trim().slice(0, 260) : '',
      url: window.location.href.split('#')[0]
    };
  }

  function xShareUrl(context) {
    var text = context.title + ' — World Protocol Academy';
    return 'https://x.com/intent/post?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(context.url);
  }

  function facebookShareUrl(context) {
    return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(context.url);
  }

  function linkedAction(network, channels, action) {
    var context = pageContext();
    var destination = channels[network] && channels[network].url;
    if (action === 'share') {
      if (network === 'x') destination = xShareUrl(context);
      else if (network === 'facebook') destination = facebookShareUrl(context);
      else if (navigator.share) {
        queueEvent(network, 'native-share', context.url);
        navigator.share({ title: context.title, text: context.description, url: context.url }).catch(function () {});
        return;
      }
    }
    if (!destination) return;
    queueEvent(network, action || 'open-channel', context.url);
    window.open(destination, '_blank', 'noopener,noreferrer');
  }

  function styles() {
    if (document.getElementById('wpa-social-bridge-style')) return;
    var style = document.createElement('style');
    style.id = 'wpa-social-bridge-style';
    style.textContent = '.wpa-social-bridge{max-width:1180px;margin:28px auto;padding:18px 20px;border:1px solid rgba(201,168,76,.28);border-radius:16px;background:rgba(13,31,60,.88);color:#f8f4ee;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif}.wpa-social-bridge__head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}.wpa-social-bridge h2{margin:0;color:#e8d49a;font:700 20px/1.2 Georgia,serif}.wpa-social-bridge p{margin:7px 0 0;color:rgba(248,244,238,.72);font-size:13px;line-height:1.5}.wpa-social-bridge__links,.wpa-social-bridge__share{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.wpa-social-bridge button,.wpa-social-bridge a{appearance:none;border:1px solid rgba(232,212,154,.48);background:rgba(255,255,255,.05);color:#f4e8c1;border-radius:999px;padding:9px 12px;font:700 12px/1 system-ui,-apple-system,Segoe UI,Arial,sans-serif;cursor:pointer;text-decoration:none}.wpa-social-bridge button:hover,.wpa-social-bridge a:hover{background:#e8d49a;color:#071326}.wpa-social-bridge__status{font-size:11px;color:rgba(248,244,238,.5);margin-top:12px}.wpa-social-bridge--compact{margin:18px auto}.wpa-social-bridge--compact p{display:none}@media(max-width:640px){.wpa-social-bridge{margin:20px 12px;padding:16px}.wpa-social-bridge button,.wpa-social-bridge a{flex:1 1 42%;text-align:center}}';
    document.head.appendChild(style);
  }

  function mount(channels) {
    if (document.getElementById('wpaSocialBridge')) return;
    styles();
    var box = document.createElement('section');
    box.id = 'wpaSocialBridge';
    box.className = 'wpa-social-bridge';
    box.setAttribute('aria-label', 'WPA official social channels and sharing');
    box.innerHTML = '<div class="wpa-social-bridge__head"><div><h2>WPA Social Bridge Network</h2><p>Официјални јавни канали поврзани со овој WPA систем. Споделувањето е рачно и бара човечка потврда.</p></div></div><div class="wpa-social-bridge__links"></div><div class="wpa-social-bridge__share"></div><div class="wpa-social-bridge__status">Public links only · no automatic posting · local interaction queue · human review required</div>';

    var links = box.querySelector('.wpa-social-bridge__links');
    Object.keys(channels).forEach(function (key) {
      var c = channels[key];
      var a = document.createElement('a');
      a.href = c.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = c.label || key;
      a.addEventListener('click', function () { queueEvent(key, 'open-channel', c.url); });
      links.appendChild(a);
    });

    var share = box.querySelector('.wpa-social-bridge__share');
    ['facebook', 'x', 'instagram', 'tiktok', 'youtube'].forEach(function (key) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = key === 'facebook' || key === 'x' ? 'Сподели на ' + (channels[key].label || key) : 'Сподели / отвори ' + (channels[key].label || key);
      b.addEventListener('click', function () { linkedAction(key, channels, 'share'); });
      share.appendChild(b);
    });

    var target = document.querySelector('main') || document.querySelector('.wrap') || document.querySelector('.console') || document.body;
    if (target && target.parentNode) {
      if (target.tagName && target.tagName.toLowerCase() === 'main') target.appendChild(box);
      else target.parentNode.insertBefore(box, target.nextSibling);
    } else {
      document.body.appendChild(box);
    }
  }

  function boot() {
    fetch(REGISTRY_URL, { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var channels = data && data.channels ? data.channels : FALLBACK;
        window.WPA_SOCIAL_BRIDGE = {
          version: data && data.version ? data.version : '1.0.0-fallback',
          system: systemId(),
          channels: channels,
          context: pageContext,
          open: function (network) { linkedAction(network, channels, 'open-channel'); },
          share: function (network) { linkedAction(network, channels, 'share'); },
          track: queueEvent,
          queue: function () { try { return JSON.parse(localStorage.getItem('wpa.social.events') || '[]'); } catch (e) { return []; } }
        };
        mount(channels);
        try { document.dispatchEvent(new CustomEvent('wpa:social-bridge-ready', { detail: { system: systemId(), version: window.WPA_SOCIAL_BRIDGE.version } })); } catch (e) {}
      })
      .catch(function () {
        window.WPA_SOCIAL_BRIDGE = { version: '1.0.0-fallback', system: systemId(), channels: FALLBACK, context: pageContext, open: function (n) { linkedAction(n, FALLBACK, 'open-channel'); }, share: function (n) { linkedAction(n, FALLBACK, 'share'); }, track: queueEvent };
        mount(FALLBACK);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

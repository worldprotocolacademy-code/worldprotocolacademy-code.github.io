/* WPA Public Language Router v2.0
   Activation authority: /data/language-activation.json only.
   Metadata catalogue: /data/languages.json (labels/direction only; never activation).
   Public pages are prebuilt static HTML. This router never translates page content.
*/
(function(){
  "use strict";

  var REGISTRY_URL = "/data/language-activation.json";
  var CATALOG_URL = "/data/languages.json";
  var CANONICAL_UI_KEY = "wpa.language";
  var LEGACY_READ_KEYS = ["WPA_LANG_V6", "wpa_lang", "wpa_language", "wpa-lang"];
  var MENU_CLASS = "wpa-public-language-router-v2";
  var STYLE_ID = "wpa-public-language-router-v2-style";

  function normalisePath(){
    return String(window.location.pathname || "/").replace(/\/+$/, "") || "/";
  }

  function pageKind(){
    var page = String(document.documentElement.getAttribute("data-wpa-page") || "").toLowerCase();
    var path = normalisePath().toLowerCase();
    if (page === "institute" || /(?:^|\/)institute(?:\.html)?$/.test(path)) return "institute";
    return "home";
  }

  function currentLanguage(registry){
    var path = normalisePath();
    var routes = registry.public_routes || {};
    var kind = pageKind();
    var codes = registry.public_languages || [];
    for (var i=0;i<codes.length;i++){
      var code = codes[i];
      var route = routes[code] && routes[code][kind];
      if (!route) continue;
      var routePath = new URL(route, window.location.origin).pathname.replace(/\/+$/, "") || "/";
      if (routePath === path) return code;
    }
    if (/^\/en(?:\/|$)/i.test(path)) return "en";
    if (/^\/languages\/fr(?:\/|$)/i.test(path)) return "fr";
    return registry.canonical_master || "mk";
  }

  function safeReadStoredLanguage(){
    try {
      var canonical = localStorage.getItem(CANONICAL_UI_KEY);
      if (canonical) return canonical;
      for (var i=0;i<LEGACY_READ_KEYS.length;i++){
        var legacy = localStorage.getItem(LEGACY_READ_KEYS[i]);
        if (legacy) return legacy;
      }
    } catch (_) {}
    return "";
  }

  function writeCanonicalLanguage(code){
    try { localStorage.setItem(CANONICAL_UI_KEY, code); } catch (_) {}
  }

  function validateRegistry(registry){
    if (!registry || registry.policy_mode !== "fail_closed") throw new Error("registry is not fail_closed");
    if (!Array.isArray(registry.public_languages) || !registry.public_languages.length) throw new Error("public_languages missing");
    if (!registry.public_routes || typeof registry.public_routes !== "object") throw new Error("public_routes missing");
    if (registry.unlisted_languages_public !== false) throw new Error("unlisted_languages_public must be false");
    var seen = new Set();
    registry.public_languages.forEach(function(code){
      if (typeof code !== "string" || !code || seen.has(code)) throw new Error("invalid or duplicate public language code");
      seen.add(code);
      var route = registry.public_routes[code];
      if (!route || typeof route.home !== "string" || typeof route.institute !== "string") throw new Error("missing public route for " + code);
      [route.home, route.institute].forEach(function(value){
        var url = new URL(value, window.location.origin);
        if (url.origin !== window.location.origin) throw new Error("cross-origin public route refused");
      });
    });
    if (!seen.has(registry.canonical_master)) throw new Error("canonical master is not public");
    if (!seen.has(registry.canonical_mirror)) throw new Error("canonical mirror is not public");
    Object.keys(registry.public_routes).forEach(function(code){
      if (!seen.has(code)) throw new Error("unlisted route exists for " + code);
    });
    return registry;
  }

  function labelFor(code, catalog){
    var meta = catalog && catalog[code];
    if (!meta && code === "zh-Hans") meta = catalog && catalog.zh;
    if (!meta) return code;
    if (code === "en") return meta.name || "English";
    return meta.name || meta.name_en || code;
  }

  function statusFor(code, registry){
    if (code === registry.canonical_master) return "canonical master";
    if (code === registry.canonical_mirror) return "canonical mirror";
    var route = registry.public_routes && registry.public_routes[code];
    if (route && route.status === "approved_public_pilot") return "public pilot";
    return "public";
  }

  function installStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "."+MENU_CLASS+"{position:relative;display:inline-block;margin-left:8px;vertical-align:middle;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;z-index:10050}",
      "."+MENU_CLASS+">summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;border:1px solid rgba(201,168,76,.58);background:linear-gradient(135deg,#c9a84c,#e8d49a);color:#071326;font-weight:900;font-size:12px;line-height:1.2;box-shadow:0 5px 18px rgba(0,0,0,.18)}",
      "."+MENU_CLASS+">summary::-webkit-details-marker{display:none}",
      "."+MENU_CLASS+"[open]>summary{box-shadow:0 0 0 3px rgba(201,168,76,.24),0 8px 28px rgba(0,0,0,.25)}",
      "."+MENU_CLASS+" .wpa-router-panel{position:absolute;top:calc(100% + 8px);right:0;min-width:280px;max-width:min(92vw,360px);max-height:70vh;overflow:auto;padding:10px;border-radius:14px;border:1px solid rgba(201,168,76,.45);background:#071326;box-shadow:0 18px 58px rgba(0,0,0,.40)}",
      "."+MENU_CLASS+" .wpa-router-title{color:#e8d49a;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;padding:7px 9px 9px;border-bottom:1px solid rgba(201,168,76,.25);margin-bottom:6px}",
      "."+MENU_CLASS+" a{display:flex!important;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:9px 10px!important;margin:3px 0;border-radius:10px!important;border:1px solid rgba(255,255,255,.08)!important;background:rgba(255,255,255,.05)!important;color:#f8f4ee!important;text-decoration:none!important;font-size:13px!important;font-weight:800!important;text-align:left}",
      "."+MENU_CLASS+" a:hover,."+MENU_CLASS+" a:focus-visible{background:#e8d49a!important;color:#071326!important;border-color:#e8d49a!important}",
      "."+MENU_CLASS+" .wpa-router-status{font-size:10px;opacity:.75;font-weight:900;text-transform:uppercase;letter-spacing:.04em}",
      "."+MENU_CLASS+" .wpa-router-note{color:rgba(248,244,238,.68);font-size:11px;line-height:1.45;padding:8px 9px 3px}",
      "@media(max-width:640px){."+MENU_CLASS+"{display:block;margin:8px auto 0;text-align:center}."+MENU_CLASS+" .wpa-router-panel{left:50%;right:auto;transform:translateX(-50%);min-width:min(92vw,340px)}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function removeLegacyLanguageMenus(){
    document.querySelectorAll(".wpa-language-menu-10, ."+MENU_CLASS).forEach(function(node){ node.remove(); });
  }

  function buildFailClosedMenu(reason){
    removeLegacyLanguageMenus();
    installStyles();
    var details = document.createElement("details");
    details.className = MENU_CLASS;
    details.setAttribute("data-state", "fail-closed");
    details.innerHTML = '<summary>🌐 Languages</summary><div class="wpa-router-panel" role="menu"><div class="wpa-router-title">WPA language router</div><a role="menuitem" href="/languages/"><span>Languages Hub</span><span class="wpa-router-status">registry unavailable</span></a><div class="wpa-router-note">Public language switching is temporarily fail-closed. No unverified language route has been activated.</div></div>';
    placeMenu(details);
    console.error("[WPA language router] fail-closed:", reason || "unknown error");
  }

  function targetRoute(code, registry){
    var route = registry.public_routes[code];
    return route[pageKind()];
  }

  function buildPublicMenu(registry, catalog){
    removeLegacyLanguageMenus();
    installStyles();
    var active = currentLanguage(registry);
    writeCanonicalLanguage(active);

    var details = document.createElement("details");
    details.className = MENU_CLASS;
    details.setAttribute("data-state", "ready");
    var items = registry.public_languages.map(function(code){
      var route = targetRoute(code, registry);
      var label = labelFor(code, catalog);
      var status = statusFor(code, registry);
      var current = code === active ? ' aria-current="page"' : "";
      return '<a role="menuitem" data-wpa-public-language="'+escapeHtml(code)+'" href="'+escapeHtml(route)+'"'+current+'><span>'+escapeHtml(label)+'</span><span class="wpa-router-status">'+escapeHtml(status)+'</span></a>';
    }).join("");

    details.innerHTML = '<summary>🌐 '+escapeHtml(labelFor(active, catalog))+'</summary><div class="wpa-router-panel" role="menu"><div class="wpa-router-title">WPA public languages</div>'+items+'<a role="menuitem" href="/languages/"><span>🌐 Languages Hub</span><span class="wpa-router-status">catalogue</span></a><div class="wpa-router-note">Only languages listed by the public activation registry are routable here. Repository drafts do not imply public activation.</div></div>';

    details.addEventListener("click", function(event){
      var link = event.target.closest("a[data-wpa-public-language]");
      if (!link) return;
      writeCanonicalLanguage(link.getAttribute("data-wpa-public-language"));
    });
    document.addEventListener("click", function(event){
      if (details.open && !details.contains(event.target)) details.open = false;
    });
    placeMenu(details);
  }

  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\"/g,"&quot;")
      .replace(/'/g,"&#39;");
  }

  function placeMenu(menu){
    var allLang = Array.from(document.querySelectorAll("a")).find(function(a){
      var text = String(a.textContent || "").trim().toLowerCase();
      var href = String(a.getAttribute("href") || "").toLowerCase();
      return text.indexOf("all languages") !== -1 || href === "/languages/" || href.endsWith("/languages/");
    });
    if (allLang && allLang.parentNode){
      allLang.insertAdjacentElement("afterend", menu);
      return;
    }
    var select = document.querySelector("select[id*='Lang'],select[id*='lang'],select[aria-label*='Language'],select[aria-label*='Јазик']");
    if (select && select.parentNode){
      select.insertAdjacentElement("afterend", menu);
      return;
    }
    document.body.insertAdjacentElement("afterbegin", menu);
  }

  function reconcileSelects(registry, catalog){
    var allowed = new Set(registry.public_languages);
    document.querySelectorAll("select").forEach(function(select){
      var id = String(select.id || "").toLowerCase();
      var aria = String(select.getAttribute("aria-label") || "").toLowerCase();
      if (!(id.includes("lang") || aria.includes("language") || aria.includes("jazik") || aria.includes("јазик"))) return;

      Array.from(select.options).forEach(function(option){
        var value = String(option.value || "");
        var matchedCode = null;
        registry.public_languages.forEach(function(code){
          var route = targetRoute(code, registry);
          if (value === route || new URL(value || "/", location.origin).pathname === new URL(route, location.origin).pathname) matchedCode = code;
        });
        if (value && value !== "/languages/" && !matchedCode) option.remove();
      });

      var existing = new Set(Array.from(select.options).map(function(o){ return String(o.value || ""); }));
      registry.public_languages.forEach(function(code){
        var route = targetRoute(code, registry);
        if (existing.has(route)) return;
        var option = document.createElement("option");
        option.value = route;
        option.textContent = labelFor(code, catalog) + " · " + statusFor(code, registry);
        select.appendChild(option);
      });

      if (!select.dataset.wpaRouterV2){
        select.dataset.wpaRouterV2 = "1";
        select.addEventListener("change", function(){
          var value = String(select.value || "");
          var code = registry.public_languages.find(function(candidate){ return targetRoute(candidate, registry) === value; });
          if (code){ writeCanonicalLanguage(code); window.location.assign(value); }
        });
      }
    });
  }

  async function fetchJson(url){
    var response = await fetch(url, {cache:"no-store", credentials:"same-origin"});
    if (!response.ok) throw new Error(url + " returned HTTP " + response.status);
    return response.json();
  }

  async function init(){
    var stored = safeReadStoredLanguage();
    try {
      var result = await Promise.all([fetchJson(REGISTRY_URL), fetchJson(CATALOG_URL)]);
      var registry = validateRegistry(result[0]);
      var catalog = result[1] || {};
      buildPublicMenu(registry, catalog);
      reconcileSelects(registry, catalog);
      window.WPAPublicLanguageRouter = Object.freeze({
        version:"2.0",
        activationAuthority:REGISTRY_URL,
        canonicalUiKey:CANONICAL_UI_KEY,
        storedLanguageBeforeInit:stored,
        publicLanguages:registry.public_languages.slice(),
        currentLanguage:currentLanguage(registry),
        pageKind:pageKind()
      });
      document.dispatchEvent(new CustomEvent("wpa:public-language-router-ready", {detail:window.WPAPublicLanguageRouter}));
    } catch (error) {
      buildFailClosedMenu(error && error.message ? error.message : String(error));
      window.WPAPublicLanguageRouter = Object.freeze({version:"2.0", activationAuthority:REGISTRY_URL, canonicalUiKey:CANONICAL_UI_KEY, state:"fail_closed"});
      document.dispatchEvent(new CustomEvent("wpa:public-language-router-failed", {detail:{message:String(error)}}));
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();

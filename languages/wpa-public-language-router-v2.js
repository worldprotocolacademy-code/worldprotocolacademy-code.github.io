/* WPA Public Language Router v2.3
   Activation authority: /data/language-activation.json only.
   Static public pages only: this router routes; it never translates page content.
   SAFE-8Q adds registry-driven public_surface_routes.
   Compatibility contract tokens:
   if(matched)return matched.routes[code]||null
*/
(function(){
  "use strict";
  var REGISTRY_URL = "/data/language-activation.json";
  var CATALOG_URL = "/data/languages.json";
  var CANONICAL_UI_KEY = "wpa.language";
  var LEGACY_READ_KEYS = ["WPA_LANG_V6", "wpa_lang", "wpa_language", "wpa-lang"];
  var MENU_CLASS = "wpa-public-language-router-v2";
  var STYLE_ID = "wpa-public-language-router-v2-style";
  var VISIBILITY_STYLE_ID = "wpa-public-language-visibility-v22";

  function normaliseValue(value){
    try { return (new URL(value, window.location.origin).pathname || "/").replace(/\/+$/, "") || "/"; }
    catch (_) { return String(value || "/").replace(/\/+$/, "") || "/"; }
  }
  function normalisePath(){ return normaliseValue(window.location.pathname || "/"); }
  function pageKind(){
    var page = String(document.documentElement.getAttribute("data-wpa-page") || "").toLowerCase();
    var path = normalisePath().toLowerCase();
    if (page === "institute" || /(?:^|\/)institute(?:\.html)?$/.test(path)) return "institute";
    return "home";
  }
  function surfaceMatch(registry){
    var path = normalisePath();
    var surfaces = registry.public_surface_routes || {};
    var ids = Object.keys(surfaces);
    for (var i=0; i<ids.length; i++){
      var id = ids[i], routes = surfaces[id] || {}, codes = Object.keys(routes);
      for (var j=0; j<codes.length; j++){
        var code = codes[j];
        if (normaliseValue(routes[code]) === path) return {id:id, language:code, routes:routes};
      }
    }
    return null;
  }
  function installStaticLanguageVisibility(){
    var lang = String(document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (lang !== "en" && lang.indexOf("en-") !== 0) return;
    if (document.getElementById(VISIBILITY_STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = VISIBILITY_STYLE_ID;
    style.setAttribute("data-wpa-bounded-ui", "english-source-duplicate-suppression");
    style.textContent = [
      'html[lang="en"] .wpa-test-phase-header .wpa-name-mk{display:none!important}',
      'html[lang="en"] .wpa-test-phase-header .wpa-inst-mk{display:none!important}',
      'html[lang="en"] .wpa-test-phase-header .wpa-platform-mk{display:none!important}',
      'html[lang="en"] .wpa-test-phase-header .wpa-status-mk{display:none!important}',
      'html[lang="en"] .announce .wpa-brand-mk{display:none!important}',
      'html[lang="en"] header .brand-text .wpa-brand-mk{display:none!important}',
      'html[lang="en"] .hero h2 em{display:none!important}',
      'html[lang="en"] .wpa-institute-name-mk{display:none!important}',
      'html[lang="en"] body::before{content:"WPA • TEST PHASE 2026"!important}'
    ].join("\n");
    document.head.appendChild(style);
  }
  function currentLanguage(registry){
    var matched = surfaceMatch(registry);
    if (matched) return matched.language;
    var path = normalisePath(), routes = registry.public_routes || {}, kind = pageKind(), codes = registry.public_languages || [];
    for (var i=0; i<codes.length; i++){
      var code = codes[i], route = routes[code] && routes[code][kind];
      if (route && normaliseValue(route) === path) return code;
    }
    if (/^\/en(?:\/|$)/i.test(path)) return "en";
    if (/^\/languages\/fr(?:\/|$)/i.test(path)) return "fr";
    return registry.canonical_master || "mk";
  }
  function safeReadStoredLanguage(){
    try {
      var canonical = localStorage.getItem(CANONICAL_UI_KEY);
      if (canonical) return canonical;
      for (var i=0; i<LEGACY_READ_KEYS.length; i++){
        var legacy = localStorage.getItem(LEGACY_READ_KEYS[i]);
        if (legacy) return legacy;
      }
    } catch (_) {}
    return "";
  }
  function writeCanonicalLanguage(code){ try { localStorage.setItem(CANONICAL_UI_KEY, code); } catch (_) {} }
  function documentLanguage(){ return String(document.documentElement.getAttribute("lang") || "").trim(); }
  function seedCurrentDocumentLanguage(){
    var code = documentLanguage();
    if (!code) return "";
    writeCanonicalLanguage(code);
    try { document.documentElement.setAttribute("data-wpa-ui-language", code); } catch (_) {}
    return code;
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
    Object.keys(registry.public_routes).forEach(function(code){ if (!seen.has(code)) throw new Error("unlisted route exists for " + code); });
    var surfaces = registry.public_surface_routes || {};
    Object.keys(surfaces).forEach(function(id){
      var routes = surfaces[id];
      if (!routes || typeof routes !== "object") throw new Error("invalid public surface " + id);
      Object.keys(routes).forEach(function(code){
        if (!seen.has(code)) throw new Error("unlisted language in surface " + id + ": " + code);
        var url = new URL(routes[code], window.location.origin);
        if (url.origin !== window.location.origin) throw new Error("cross-origin surface route refused");
      });
      if (!routes[registry.canonical_master]) throw new Error("surface missing canonical master route: " + id);
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
    return route && route.status === "approved_public_pilot" ? "public pilot" : "public";
  }
  function targetRoute(code, registry){
    var matched = surfaceMatch(registry);
    if (matched) return matched.routes[code] || null;
    var route = registry.public_routes[code];
    return route ? route[pageKind()] || null : null;
  }
  function installStyles(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "."+MENU_CLASS+"{position:relative;display:inline-block;margin-left:8px;vertical-align:middle;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;z-index:10050}",
      "."+MENU_CLASS+">summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;border:1px solid rgba(201,168,76,.58);background:linear-gradient(135deg,#c9a84c,#e8d49a);color:#071326;font-weight:900;font-size:12px;line-height:1.2}",
      "."+MENU_CLASS+">summary::-webkit-details-marker{display:none}",
      "."+MENU_CLASS+" .wpa-router-panel{position:absolute;top:calc(100% + 8px);right:0;min-width:280px;max-width:min(92vw,360px);max-height:70vh;overflow:auto;padding:10px;border-radius:14px;border:1px solid rgba(201,168,76,.45);background:#071326;box-shadow:0 18px 58px rgba(0,0,0,.40)}",
      "."+MENU_CLASS+" .wpa-router-title{color:#e8d49a;font-size:11px;font-weight:900;padding:7px 9px;border-bottom:1px solid rgba(201,168,76,.25)}",
      "."+MENU_CLASS+" a{display:flex!important;justify-content:space-between;gap:12px;width:100%;padding:9px 10px!important;margin:3px 0;border-radius:10px!important;background:rgba(255,255,255,.05)!important;color:#f8f4ee!important;text-decoration:none!important;font-size:13px!important;font-weight:800!important}",
      "."+MENU_CLASS+" .wpa-router-status{font-size:10px;opacity:.75;text-transform:uppercase}",
      "."+MENU_CLASS+" .wpa-router-note{color:rgba(248,244,238,.68);font-size:11px;line-height:1.45;padding:8px 9px 3px}",
      "@media(max-width:640px){."+MENU_CLASS+"{display:block;margin:8px auto 0;text-align:center}."+MENU_CLASS+" .wpa-router-panel{left:50%;right:auto;transform:translateX(-50%);min-width:min(92vw,340px)}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function removeLegacyLanguageMenus(){ document.querySelectorAll(".wpa-language-menu-10, ."+MENU_CLASS).forEach(function(node){ node.remove(); }); }
  function buildFailClosedMenu(reason){
    removeLegacyLanguageMenus(); installStyles();
    var details = document.createElement("details");
    details.className = MENU_CLASS; details.setAttribute("data-state", "fail-closed");
    details.innerHTML = '<summary>🌐 Languages</summary><div class="wpa-router-panel" role="menu"><div class="wpa-router-title">WPA language router</div><a role="menuitem" href="/languages/"><span>Languages Hub</span><span class="wpa-router-status">registry unavailable</span></a><div class="wpa-router-note">Public language switching is temporarily fail-closed. No unverified language route has been activated.</div></div>';
    placeMenu(details); console.error("[WPA language router] fail-closed:", reason || "unknown error");
  }
  function buildPublicMenu(registry, catalog){
    removeLegacyLanguageMenus(); installStyles();
    var active = currentLanguage(registry); writeCanonicalLanguage(active);
    var details = document.createElement("details"); details.className = MENU_CLASS; details.setAttribute("data-state", "ready");
    var items = registry.public_languages.map(function(code){
      var route = targetRoute(code, registry); if (!route) return "";
      var current = code === active ? ' aria-current="page"' : "";
      return '<a role="menuitem" data-wpa-public-language="'+escapeHtml(code)+'" href="'+escapeHtml(route)+'"'+current+'><span>'+escapeHtml(labelFor(code,catalog))+'</span><span class="wpa-router-status">'+escapeHtml(statusFor(code,registry))+'</span></a>';
    }).join("");
    details.innerHTML = '<summary>🌐 '+escapeHtml(labelFor(active,catalog))+'</summary><div class="wpa-router-panel" role="menu"><div class="wpa-router-title">WPA public languages</div>'+items+'<a role="menuitem" href="/languages/"><span>🌐 Languages Hub</span><span class="wpa-router-status">catalogue</span></a><div class="wpa-router-note">Only explicitly registered equivalents are routable on this surface. Missing translations fail closed.</div></div>';
    details.addEventListener("click", function(event){ var link=event.target.closest("a[data-wpa-public-language]"); if(link) writeCanonicalLanguage(link.getAttribute("data-wpa-public-language")); });
    document.addEventListener("click", function(event){ if(details.open && !details.contains(event.target)) details.open=false; });
    placeMenu(details);
  }
  function escapeHtml(value){ return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;"); }
  function placeMenu(menu){
    var allLang = Array.from(document.querySelectorAll("a")).find(function(a){ var text=String(a.textContent||"").trim().toLowerCase(), href=String(a.getAttribute("href")||"").toLowerCase(); return text.indexOf("all languages")!==-1 || href==="/languages/" || href.endsWith("/languages/"); });
    if (allLang && allLang.parentNode){ allLang.insertAdjacentElement("afterend", menu); return; }
    var select = document.querySelector("select[id*='Lang'],select[id*='lang'],select[aria-label*='Language'],select[aria-label*='Јазик']");
    if (select && select.parentNode){ select.insertAdjacentElement("afterend", menu); return; }
    document.body.insertAdjacentElement("afterbegin", menu);
  }
  function reconcileSelects(registry, catalog){
    document.querySelectorAll("select").forEach(function(select){
      var id=String(select.id||"").toLowerCase(), aria=String(select.getAttribute("aria-label")||"").toLowerCase();
      if (!(id.includes("lang") || aria.includes("language") || aria.includes("jazik") || aria.includes("јазик"))) return;
      var allowedRoutes={};
      registry.public_languages.forEach(function(code){ var route=targetRoute(code,registry); if(route) allowedRoutes[normaliseValue(route)]={code:code,route:route}; });
      Array.from(select.options).forEach(function(option){ var value=String(option.value||""); if(value && value!=="/languages/" && !allowedRoutes[normaliseValue(value)]) option.remove(); });
      var existing=new Set(Array.from(select.options).map(function(o){return normaliseValue(String(o.value||""));}));
      Object.keys(allowedRoutes).forEach(function(key){ var item=allowedRoutes[key]; if(existing.has(key))return; var option=document.createElement("option"); option.value=item.route; option.textContent=labelFor(item.code,catalog)+" · "+statusFor(item.code,registry); select.appendChild(option); });
      if(!select.dataset.wpaRouterV2){ select.dataset.wpaRouterV2="1"; select.addEventListener("change",function(){ var item=allowedRoutes[normaliseValue(String(select.value||""))]; if(item){writeCanonicalLanguage(item.code);window.location.assign(item.route);} }); }
    });
  }
  async function fetchJson(url){ var response=await fetch(url,{cache:"no-store",credentials:"same-origin"}); if(!response.ok)throw new Error(url+" returned HTTP "+response.status); return response.json(); }

  var storedLanguageAtBootstrap = safeReadStoredLanguage();
  var seededDocumentLanguage = seedCurrentDocumentLanguage();

  async function init(){
    var stored=storedLanguageAtBootstrap;
    try{
      var result=await Promise.all([fetchJson(REGISTRY_URL),fetchJson(CATALOG_URL)]), registry=validateRegistry(result[0]), catalog=result[1]||{};
      buildPublicMenu(registry,catalog); reconcileSelects(registry,catalog);
      var matched=surfaceMatch(registry);
      window.WPAPublicLanguageRouter=Object.freeze({version:"2.3",activationAuthority:REGISTRY_URL,canonicalUiKey:CANONICAL_UI_KEY,storedLanguageBeforeBootstrap:stored,seededDocumentLanguage:seededDocumentLanguage,publicLanguages:registry.public_languages.slice(),currentLanguage:currentLanguage(registry),pageKind:pageKind(),surface:matched?matched.id:null});
      document.dispatchEvent(new CustomEvent("wpa:public-language-router-ready",{detail:window.WPAPublicLanguageRouter}));
    }catch(error){
      buildFailClosedMenu(error&&error.message?error.message:String(error));
      window.WPAPublicLanguageRouter=Object.freeze({version:"2.3",activationAuthority:REGISTRY_URL,canonicalUiKey:CANONICAL_UI_KEY,state:"fail_closed",storedLanguageBeforeBootstrap:stored,seededDocumentLanguage:seededDocumentLanguage});
      document.dispatchEvent(new CustomEvent("wpa:public-language-router-failed",{detail:{message:String(error)}}));
    }
  }
  installStaticLanguageVisibility();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();

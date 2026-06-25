/* WPA Language Menu 10 Patch v1.0
   Safe add-on: does not rewrite page content. It augments existing language select / All languages area.
*/
(function(){
  "use strict";

  const LANGS = [
    { code:"mk", label:"🇲🇰 Македонски", home:"/", institute:"/institute.html", canonical:true },
    { code:"en", label:"🇬🇧 English", home:"/en/", institute:"/en/", canonical:true },
    { code:"zh", label:"🇨🇳 中文 · Chinese", home:"/languages/zh/index.html", institute:"/languages/zh/institute.html" },
    { code:"ru", label:"🇷🇺 Русский · Russian", home:"/languages/ru/index.html", institute:"/languages/ru/institute.html" },
    { code:"hi", label:"🇮🇳 हिन्दी · Hindi", home:"/languages/hi/index.html", institute:"/languages/hi/institute.html" },
    { code:"af", label:"🇿🇦 Afrikaans", home:"/languages/af/index.html", institute:"/languages/af/institute.html" },
    { code:"ar", label:"🇸🇦 العربية · Arabic", home:"/languages/ar/index.html", institute:"/languages/ar/institute.html" },
    { code:"fr", label:"🇫🇷 Français · French", home:"/languages/fr/index.html", institute:"/languages/fr/institute.html" },
    { code:"de", label:"🇩🇪 Deutsch · German", home:"/languages/de/index.html", institute:"/languages/de/institute.html" },
    { code:"it", label:"🇮🇹 Italiano · Italian", home:"/languages/it/index.html", institute:"/languages/it/institute.html" },
    { code:"sq", label:"🇦🇱 Shqip · Albanian", home:"/languages/sq/index.html", institute:"/languages/sq/institute.html" },
    { code:"sr", label:"🇷🇸 Српски · Serbian", home:"/languages/sr/index.html", institute:"/languages/sr/institute.html" }
  ];

  function isInstitutePage(){
    const path = String(location.pathname || "").toLowerCase();
    return path.includes("institute");
  }

  function targetUrl(lang){
    return isInstitutePage() ? lang.institute : lang.home;
  }

  function addStyles(){
    if (document.getElementById("wpa-language-menu-10-style")) return;
    const style = document.createElement("style");
    style.id = "wpa-language-menu-10-style";
    style.textContent = `
      .wpa-language-menu-10{
        position:relative;
        display:inline-block;
        margin-left:8px;
        vertical-align:middle;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
        z-index:10050;
      }
      .wpa-language-menu-10 > summary{
        list-style:none;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:7px;
        padding:7px 13px;
        border-radius:999px;
        border:1px solid rgba(201,168,76,.58);
        background:linear-gradient(135deg,#c9a84c,#e8d49a);
        color:#071326;
        font-weight:900;
        font-size:12px;
        line-height:1.2;
        box-shadow:0 5px 18px rgba(0,0,0,.18);
      }
      .wpa-language-menu-10 > summary::-webkit-details-marker{display:none}
      .wpa-language-menu-10[open] > summary{box-shadow:0 0 0 3px rgba(201,168,76,.24),0 8px 28px rgba(0,0,0,.25)}
      .wpa-language-menu-10-panel{
        position:absolute;
        top:calc(100% + 8px);
        right:0;
        min-width:280px;
        max-width:min(92vw,360px);
        max-height:70vh;
        overflow:auto;
        padding:10px;
        border-radius:14px;
        border:1px solid rgba(201,168,76,.45);
        background:#071326;
        box-shadow:0 18px 58px rgba(0,0,0,.40);
      }
      .wpa-language-menu-10-title{
        color:#e8d49a;
        font-size:11px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
        padding:7px 9px 9px;
        border-bottom:1px solid rgba(201,168,76,.25);
        margin-bottom:6px;
      }
      .wpa-language-menu-10 a{
        display:flex !important;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        width:100%;
        padding:9px 10px !important;
        margin:3px 0;
        border-radius:10px !important;
        border:1px solid rgba(255,255,255,.08) !important;
        background:rgba(255,255,255,.05) !important;
        color:#f8f4ee !important;
        text-decoration:none !important;
        font-size:13px !important;
        font-weight:800 !important;
        text-align:left;
      }
      .wpa-language-menu-10 a:hover{
        background:#e8d49a !important;
        color:#071326 !important;
        border-color:#e8d49a !important;
      }
      .wpa-language-menu-10 .wpa-lang-status{
        font-size:10px;
        opacity:.75;
        font-weight:900;
        text-transform:uppercase;
        letter-spacing:.04em;
      }
      .wpa-language-menu-10-note{
        color:rgba(248,244,238,.68);
        font-size:11px;
        line-height:1.45;
        padding:8px 9px 3px;
      }
      @media(max-width:640px){
        .wpa-language-menu-10{
          display:block;
          margin:8px auto 0;
          text-align:center;
        }
        .wpa-language-menu-10-panel{
          left:50%;
          right:auto;
          transform:translateX(-50%);
          min-width:min(92vw,340px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildMenu(){
    const details = document.createElement("details");
    details.className = "wpa-language-menu-10";
    details.innerHTML = `
      <summary>🌐 Јазик · Languages</summary>
      <div class="wpa-language-menu-10-panel" role="menu">
        <div class="wpa-language-menu-10-title">WPA language pages</div>
        ${LANGS.map(lang => `
          <a role="menuitem" href="${targetUrl(lang)}">
            <span>${lang.label}</span>
            <span class="wpa-lang-status">${lang.canonical ? "canonical" : "draft"}</span>
          </a>
        `).join("")}
        <div class="wpa-language-menu-10-note">
          Македонски и English се canonical. Другите јазици се translation drafts pending human review.
        </div>
      </div>
    `;

    document.addEventListener("click", function(e){
      if (!details.open) return;
      if (!details.contains(e.target)) details.open = false;
    });

    return details;
  }

  function augmentSelects(){
    const selects = Array.from(document.querySelectorAll("select"));
    for (const sel of selects) {
      const id = (sel.id || "").toLowerCase();
      const aria = (sel.getAttribute("aria-label") || "").toLowerCase();
      const looksLanguage = id.includes("lang") || aria.includes("language") || aria.includes("jazik") || aria.includes("јазик");
      if (!looksLanguage) continue;

      const existing = new Set(Array.from(sel.options).map(o => o.value));
      for (const lang of LANGS) {
        const url = targetUrl(lang);
        if (existing.has(url)) continue;
        const opt = document.createElement("option");
        opt.value = url;
        opt.textContent = lang.label + (lang.canonical ? " · canonical" : " · draft");
        sel.appendChild(opt);
      }
    }
  }

  function placeMenu(){
    if (document.querySelector(".wpa-language-menu-10")) return;

    const menu = buildMenu();

    // Prefer placing beside existing "All languages" link.
    const links = Array.from(document.querySelectorAll("a"));
    const allLang = links.find(a => {
      const t = (a.textContent || "").trim().toLowerCase();
      const h = (a.getAttribute("href") || "").toLowerCase();
      return t.includes("all languages") || h === "/languages/" || h.endsWith("/languages/");
    });

    if (allLang && allLang.parentNode) {
      allLang.insertAdjacentElement("afterend", menu);
      return;
    }

    // Then place after a language select.
    const select = document.querySelector("select[id*='Lang'], select[id*='lang'], select[aria-label*='Language'], select[aria-label*='Јазик']");
    if (select && select.parentNode) {
      select.insertAdjacentElement("afterend", menu);
      return;
    }

    // Fallback: top of body.
    document.body.insertAdjacentElement("afterbegin", menu);
  }

  function init(){
    addStyles();
    augmentSelects();
    placeMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

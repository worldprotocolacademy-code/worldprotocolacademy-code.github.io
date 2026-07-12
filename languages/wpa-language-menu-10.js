/* WPA Language Menu 10 Patch v1.1
   Safe add-on: augments the language selector and applies a page-scoped,
   responsive institute brand header without rewriting institutional content.
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
    const page = String(document.documentElement.getAttribute("data-wpa-page") || "").toLowerCase();
    const path = String(location.pathname || "").toLowerCase();
    return page === "institute" || path.includes("institute");
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

      /* Institute identity header: official seal on the left; full MK then EN name. */
      html[data-wpa-page="institute"] .nav-wrap nav{
        max-width:1440px;
        padding:14px 28px 12px;
        display:grid;
        grid-template-columns:minmax(0,1fr);
        align-items:center;
        gap:12px;
      }
      html[data-wpa-page="institute"] .wpa-institute-brand{
        width:100%;
        min-width:0;
        display:grid;
        grid-template-columns:78px minmax(0,1fr);
        align-items:center;
        gap:18px;
        padding:2px 0 4px;
      }
      html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{
        width:76px;
        height:76px;
        min-width:76px;
        border:0;
        border-radius:50%;
        overflow:hidden;
        background:transparent;
        box-shadow:0 0 0 2px rgba(201,168,76,.85),0 8px 24px rgba(0,0,0,.28);
      }
      html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark img{
        display:block;
        width:100%;
        height:100%;
        object-fit:cover;
      }
      html[data-wpa-page="institute"] .wpa-institute-brand .brand-text{
        min-width:0;
        display:flex;
        flex-direction:column;
        justify-content:center;
        line-height:1.13;
      }
      html[data-wpa-page="institute"] .wpa-institute-name-mk{
        display:block;
        color:var(--cream,#fbf8ee);
        font-family:'Cormorant Garamond','Times New Roman',serif;
        font-size:clamp(21px,2.15vw,31px);
        font-weight:600;
        letter-spacing:-.01em;
        white-space:nowrap;
      }
      html[data-wpa-page="institute"] .wpa-institute-name-en{
        display:block;
        margin-top:4px;
        color:var(--gold-soft,#e3c878);
        font-family:'Cormorant Garamond','Times New Roman',serif;
        font-size:clamp(16px,1.55vw,22px);
        font-weight:500;
        letter-spacing:.005em;
        white-space:nowrap;
      }
      html[data-wpa-page="institute"] .wpa-institute-parent{
        display:block;
        margin-top:7px;
        color:rgba(251,248,238,.72);
        font-family:'Inter',system-ui,sans-serif;
        font-size:10.5px;
        font-weight:600;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      html[data-wpa-page="institute"] .nav-wrap .nav-links{
        width:100%;
        justify-content:center;
        gap:4px;
        padding-top:10px;
        border-top:1px solid rgba(201,168,76,.24);
      }

      @media(max-width:1100px){
        html[data-wpa-page="institute"] .wpa-institute-name-mk{
          font-size:clamp(18px,2.25vw,24px);
          white-space:normal;
          text-wrap:balance;
        }
        html[data-wpa-page="institute"] .wpa-institute-name-en{
          font-size:clamp(14px,1.8vw,18px);
          white-space:normal;
          text-wrap:balance;
        }
      }
      @media(max-width:760px){
        html[data-wpa-page="institute"] .nav-wrap nav{padding:12px 16px 10px;gap:10px}
        html[data-wpa-page="institute"] .wpa-institute-brand{
          grid-template-columns:60px minmax(0,1fr);
          gap:12px;
          align-items:start;
        }
        html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{
          width:58px;
          height:58px;
          min-width:58px;
        }
        html[data-wpa-page="institute"] .wpa-institute-name-mk{font-size:17px;line-height:1.15}
        html[data-wpa-page="institute"] .wpa-institute-name-en{font-size:13.5px;line-height:1.18;margin-top:5px}
        html[data-wpa-page="institute"] .wpa-institute-parent{font-size:8.5px;letter-spacing:.08em;line-height:1.35;margin-top:6px}
        html[data-wpa-page="institute"] .nav-wrap .nav-links{justify-content:flex-start}
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
      @media(max-width:430px){
        html[data-wpa-page="institute"] .wpa-institute-brand{
          grid-template-columns:52px minmax(0,1fr);
          gap:10px;
        }
        html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{
          width:50px;
          height:50px;
          min-width:50px;
        }
        html[data-wpa-page="institute"] .wpa-institute-name-mk{font-size:15px}
        html[data-wpa-page="institute"] .wpa-institute-name-en{font-size:12px}
        html[data-wpa-page="institute"] .wpa-institute-parent{font-size:7.7px}
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceInstituteBrand(){
    if (!isInstitutePage()) return;

    const brand = document.querySelector(".nav-wrap nav .brand");
    if (!brand || brand.classList.contains("wpa-institute-brand")) return;

    brand.classList.add("wpa-institute-brand");
    brand.setAttribute(
      "aria-label",
      "Институт за протокол, дипломатија, јавна комуникација и безбедносни студии — Institute for Protocol, Diplomacy, Public Communication and Security Studies"
    );

    const mark = brand.querySelector(".brand-mark");
    if (mark) {
      mark.textContent = "";
      const logo = document.createElement("img");
      logo.src = "/logo.webp";
      logo.alt = "World Protocol Academy logo";
      logo.width = 76;
      logo.height = 76;
      logo.loading = "eager";
      logo.decoding = "async";
      mark.appendChild(logo);
    }

    const brandText = brand.querySelector(".brand-text");
    if (brandText) {
      brandText.innerHTML = `
        <span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span>
        <span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span>
        <span class="wpa-institute-parent">Светска академија за протокол · World Protocol Academy</span>
      `;
    }
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
    enhanceInstituteBrand();
    augmentSelects();
    placeMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

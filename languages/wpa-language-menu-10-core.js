/* WPA legacy page-enhancement compatibility shim v2.0
   IMPORTANT: This file no longer owns language routing, public activation,
   language menus, selectors, or language state. Public language authority is
   /data/language-activation.json and routing is handled only by
   /languages/wpa-public-language-router-v2.js.

   The historical filename is retained temporarily because the MK Institute
   page-sync layer still consumes it for non-language visual enhancements.
*/
(function(){
  "use strict";

  function pageName(){
    return String(document.documentElement.getAttribute("data-wpa-page") || "").toLowerCase();
  }

  function normalizedPath(){
    return String(location.pathname || "").toLowerCase().replace(/\/+$/, "") || "/";
  }

  function isInstitutePage(){
    return pageName() === "institute" || normalizedPath().includes("institute");
  }

  function isHomePage(){
    var path = normalizedPath();
    return pageName() === "index" || path === "/" || path === "/index.html";
  }

  function addStyles(){
    if (document.getElementById("wpa-page-enhancement-compat-style")) return;
    var style = document.createElement("style");
    style.id = "wpa-page-enhancement-compat-style";
    style.textContent = `
      html[data-wpa-page="index"] .announce-inner > div:last-child{
        display:flex;align-items:center;justify-content:flex-end;gap:6px;flex-wrap:wrap;text-align:right;
      }
      .wpa-journal-live-announce{
        display:inline-flex;align-items:center;gap:6px;margin-left:2px;padding:3px 9px;
        border:1px solid rgba(232,212,154,.62);border-radius:999px;color:#f4e8c1!important;
        background:rgba(201,168,76,.13);font-weight:900;text-decoration:none!important;
        white-space:nowrap;box-shadow:0 3px 12px rgba(0,0,0,.13);
      }
      .wpa-journal-live-announce:hover,.wpa-journal-live-announce:focus-visible{
        color:#071326!important;background:#e8d49a;border-color:#e8d49a;outline:none;
      }
      html[data-wpa-page="institute"] .nav-wrap nav{
        max-width:1500px;padding:13px 28px 11px;display:grid;grid-template-columns:minmax(0,1fr);align-items:center;gap:11px;
      }
      html[data-wpa-page="institute"] .wpa-institute-brand{
        width:100%;min-width:0;display:grid;grid-template-columns:74px minmax(0,1fr);align-items:center;gap:17px;padding:2px 0 4px;
      }
      html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{
        width:72px;height:72px;min-width:72px;border:0;border-radius:50%;overflow:hidden;background:transparent;
        box-shadow:0 0 0 2px rgba(201,168,76,.9),0 8px 24px rgba(0,0,0,.28);
      }
      html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark img{display:block;width:100%;height:100%;object-fit:cover}
      html[data-wpa-page="institute"] .wpa-institute-brand .brand-text{min-width:0;display:flex;flex-direction:column;justify-content:center;line-height:1.12}
      html[data-wpa-page="institute"] .wpa-institute-title-row{min-width:0;display:flex;align-items:baseline;gap:11px;flex-wrap:nowrap;white-space:nowrap}
      html[data-wpa-page="institute"] .wpa-institute-name-mk{display:inline;color:var(--cream,#fbf8ee);font-family:'Cormorant Garamond','Times New Roman',serif;font-size:clamp(17px,1.65vw,24px);font-weight:650;letter-spacing:-.012em}
      html[data-wpa-page="institute"] .wpa-institute-name-separator{color:var(--gold,#c9a84c);font-size:17px;font-weight:700}
      html[data-wpa-page="institute"] .wpa-institute-name-en{display:inline;color:var(--gold-soft,#e3c878);font-family:'Cormorant Garamond','Times New Roman',serif;font-size:clamp(15px,1.35vw,20px);font-weight:550}
      html[data-wpa-page="institute"] .wpa-institute-parent{display:block;margin-top:7px;color:rgba(251,248,238,.72);font-family:'Inter',system-ui,sans-serif;font-size:10.5px;font-weight:650;letter-spacing:.12em;text-transform:uppercase}
      html[data-wpa-page="institute"] .nav-wrap .nav-links{width:100%;justify-content:center;gap:4px;padding-top:9px;border-top:1px solid rgba(201,168,76,.24)}
      @media(max-width:1220px){
        html[data-wpa-page="institute"] .wpa-institute-title-row{flex-wrap:wrap;row-gap:4px;white-space:normal}
        html[data-wpa-page="institute"] .wpa-institute-name-separator{display:none}
        html[data-wpa-page="institute"] .wpa-institute-name-mk,html[data-wpa-page="institute"] .wpa-institute-name-en{flex:1 1 100%;text-wrap:balance}
      }
      @media(max-width:760px){
        html[data-wpa-page="index"] .announce-inner > div:last-child{justify-content:center;text-align:center}
        html[data-wpa-page="institute"] .nav-wrap nav{padding:12px 16px 10px;gap:10px}
        html[data-wpa-page="institute"] .wpa-institute-brand{grid-template-columns:60px minmax(0,1fr);gap:12px;align-items:start}
        html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{width:58px;height:58px;min-width:58px}
        html[data-wpa-page="institute"] .wpa-institute-name-mk{font-size:17px;line-height:1.15}
        html[data-wpa-page="institute"] .wpa-institute-name-en{font-size:13.5px;line-height:1.18}
        html[data-wpa-page="institute"] .wpa-institute-parent{font-size:8.5px;letter-spacing:.08em;line-height:1.35;margin-top:6px}
        html[data-wpa-page="institute"] .nav-wrap .nav-links{justify-content:flex-start}
      }
      @media(max-width:430px){
        html[data-wpa-page="institute"] .wpa-institute-brand{grid-template-columns:52px minmax(0,1fr);gap:10px}
        html[data-wpa-page="institute"] .wpa-institute-brand .brand-mark{width:50px;height:50px;min-width:50px}
        html[data-wpa-page="institute"] .wpa-institute-name-mk{font-size:15px}
        html[data-wpa-page="institute"] .wpa-institute-name-en{font-size:12px}
        html[data-wpa-page="institute"] .wpa-institute-parent{font-size:7.7px}
      }
    `;
    document.head.appendChild(style);
  }

  function enhanceHomeJournalLive(){
    if (!isHomePage() || document.getElementById("wpaJournalLiveAnnounce")) return;
    var announceItems = document.querySelectorAll(".announce .announce-inner > div");
    var target = announceItems.length ? announceItems[announceItems.length - 1] : null;
    if (!target) return;
    target.innerHTML = '<span>Авторски креирана платформа · Поткрепена со публикации · AI-поддржана · WPAWS · WPA Card ·</span>' +
      '<a id="wpaJournalLiveAnnounce" class="wpa-journal-live-announce" href="/journal/live/" title="WPA Journal Live">🛰️ WPA Journal Live</a>';
  }

  function enhanceInstituteBrand(){
    if (!isInstitutePage()) return;
    var brand = document.querySelector(".nav-wrap nav .brand");
    if (!brand || brand.classList.contains("wpa-institute-brand")) return;
    brand.classList.add("wpa-institute-brand");
    brand.setAttribute("aria-label", "Институт за протокол, дипломатија, јавна комуникација и безбедносни студии — Institute for Protocol, Diplomacy, Public Communication and Security Studies");

    var mark = brand.querySelector(".brand-mark");
    if (mark) {
      mark.textContent = "";
      var logo = document.createElement("img");
      logo.src = "/logo.webp";
      logo.alt = "World Protocol Academy logo";
      logo.width = 72;
      logo.height = 72;
      logo.loading = "eager";
      logo.decoding = "async";
      mark.appendChild(logo);
    }

    var brandText = brand.querySelector(".brand-text");
    if (brandText) {
      brandText.innerHTML = '<span class="wpa-institute-title-row">' +
        '<span class="wpa-institute-name-mk">Институт за протокол, дипломатија, јавна комуникација и безбедносни студии</span>' +
        '<span class="wpa-institute-name-separator" aria-hidden="true">•</span>' +
        '<span class="wpa-institute-name-en" lang="en">Institute for Protocol, Diplomacy, Public Communication and Security Studies</span>' +
        '</span><span class="wpa-institute-parent">Светска академија за протокол · World Protocol Academy</span>';
    }
  }

  function init(){
    addStyles();
    enhanceHomeJournalLive();
    enhanceInstituteBrand();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();

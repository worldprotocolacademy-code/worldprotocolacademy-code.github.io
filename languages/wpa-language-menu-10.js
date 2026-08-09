/* WPA Language Menu 10 loader + Institute/Home clarity patch v1.4
   Keeps the original v1.2 implementation in wpa-language-menu-10-core.js,
   preserves the Institute terminology patch, and adds the WPA signature
   readability palette to the homepage's light educational/service sections.
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
    return pageName() === "institute" || normalizedPath().indexOf("institute") !== -1;
  }

  function isHomePage(){
    var path = normalizedPath();
    return pageName() === "index" || path === "/" || path === "/index.html";
  }

  function addInstituteClarityStyles(){
    if (!isInstitutePage() || document.getElementById("wpa-institute-clarity-v13")) return;
    var style = document.createElement("style");
    style.id = "wpa-institute-clarity-v13";
    style.textContent = `
      /* WPA Institute text contrast and hierarchy — v1.3 */
      html[data-wpa-page="institute"] main section:not(.wpa-identity){
        color:#1a1a1a;
      }
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .section-title,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) h2,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) h3,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) h4{
        color:#0d1f3c;
      }
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .section-lead,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) p,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) li{
        color:#2c2c2c;
      }
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .section-label,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .domain-tag,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .pub-meta{
        color:#5a4220;
      }
      html[data-wpa-page="institute"] main section:not(.wpa-identity) a:not(.btn){
        color:#0d1f3c;
      }
      html[data-wpa-page="institute"] main section:not(.wpa-identity) a:not(.btn):hover,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) a:not(.btn):focus-visible{
        color:#5a4220;
      }

      html[data-wpa-page="institute"] #charter,
      html[data-wpa-page="institute"] #practitioner-lectures,
      html[data-wpa-page="institute"] #opc-banner,
      html[data-wpa-page="institute"] #cta{
        color:#fbf8ee;
      }
      html[data-wpa-page="institute"] #charter .section-title,
      html[data-wpa-page="institute"] #charter h2,
      html[data-wpa-page="institute"] #charter h3,
      html[data-wpa-page="institute"] #charter h4,
      html[data-wpa-page="institute"] #practitioner-lectures .section-title,
      html[data-wpa-page="institute"] #practitioner-lectures h2,
      html[data-wpa-page="institute"] #practitioner-lectures h3,
      html[data-wpa-page="institute"] #practitioner-lectures h4,
      html[data-wpa-page="institute"] #opc-banner h2,
      html[data-wpa-page="institute"] #opc-banner h3,
      html[data-wpa-page="institute"] #cta h2,
      html[data-wpa-page="institute"] #cta h3{
        color:#fbf8ee !important;
      }
      html[data-wpa-page="institute"] #charter p,
      html[data-wpa-page="institute"] #charter li,
      html[data-wpa-page="institute"] #practitioner-lectures p,
      html[data-wpa-page="institute"] #practitioner-lectures li,
      html[data-wpa-page="institute"] #opc-banner p,
      html[data-wpa-page="institute"] #opc-banner li,
      html[data-wpa-page="institute"] #cta p,
      html[data-wpa-page="institute"] #cta li{
        color:rgba(251,248,238,.88) !important;
      }
      html[data-wpa-page="institute"] #charter .section-label,
      html[data-wpa-page="institute"] #practitioner-lectures .section-label,
      html[data-wpa-page="institute"] #opc-banner .section-label,
      html[data-wpa-page="institute"] #cta .section-label{
        color:#e3c878 !important;
      }

      html[data-wpa-page="institute"] .domain-card,
      html[data-wpa-page="institute"] .pillar,
      html[data-wpa-page="institute"] .region,
      html[data-wpa-page="institute"] .pub-card,
      html[data-wpa-page="institute"] .aab-content,
      html[data-wpa-page="institute"] .disclaimer-box,
      html[data-wpa-page="institute"] .method-table{
        color:#1a1a1a;
      }
      html[data-wpa-page="institute"] .domain-card h3,
      html[data-wpa-page="institute"] .pillar h3,
      html[data-wpa-page="institute"] .region h3,
      html[data-wpa-page="institute"] .pub-card h3,
      html[data-wpa-page="institute"] .aab-content h3,
      html[data-wpa-page="institute"] .category-name{
        color:#0d1f3c !important;
      }
      html[data-wpa-page="institute"] .domain-card p,
      html[data-wpa-page="institute"] .pillar p,
      html[data-wpa-page="institute"] .region li,
      html[data-wpa-page="institute"] .pub-card p,
      html[data-wpa-page="institute"] .aab-content p,
      html[data-wpa-page="institute"] .disclaimer-box p,
      html[data-wpa-page="institute"] .method-table td{
        color:#2c2c2c !important;
      }
      html[data-wpa-page="institute"] .btn-primary{
        color:#071326 !important;
      }
      html[data-wpa-page="institute"] .btn-ghost{
        color:inherit;
      }
    `;
    document.head.appendChild(style);
  }

  function addHomeSignatureStyles(){
    if (!isHomePage() || document.getElementById("wpa-home-signature-palette-v14")) return;
    var style = document.createElement("style");
    style.id = "wpa-home-signature-palette-v14";
    style.textContent = `
      /* ==========================================================
         WPA SIGNATURE PALETTE v1.4
         Ceremonial Navy + Diplomatic Teal + Heritage Gold.
         Purpose: stronger reading contrast and a recognisable WPA voice.
         ========================================================== */
      html[data-wpa-page="index"]{
        --wpa-signature-navy:#102A43;
        --wpa-signature-ink:#263B4D;
        --wpa-signature-teal:#0F5962;
        --wpa-signature-teal-deep:#0A454C;
        --wpa-signature-copper:#8B5E24;
        --wpa-signature-gold:#C9A84C;
        --wpa-signature-paper:#FFFDF8;
      }

      /* Strong body copy on all light homepage content. */
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .section-lead,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .muted,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card p,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card-list li,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .platform-card p,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-text,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-list li,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-card p,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) [style*="color:var(--muted)"],
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) [style*="color: var(--muted)"]{
        color:var(--wpa-signature-ink) !important;
        opacity:1 !important;
        font-weight:500;
      }

      /* Headings: ceremonial navy, never washed out. */
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .section-title,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card h4,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .platform-card h4,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-card h4,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-card h3,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) h3,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) h4{
        color:var(--wpa-signature-navy) !important;
      }

      /* WPA's new recognisable accent: Diplomatic Teal. */
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .section-label,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card-kicker,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .domain-tag,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-meta{
        color:var(--wpa-signature-teal) !important;
        font-weight:800 !important;
      }
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .section-label::before{
        background:linear-gradient(90deg,var(--wpa-signature-teal),var(--wpa-signature-gold)) !important;
      }

      /* Strong emphasis within lists: copper-gold rather than pale brown. */
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card-list strong,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) [style*="color:var(--goldd)"],
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) [style*="color: var(--goldd)"]{
        color:var(--wpa-signature-copper) !important;
      }

      /* Cards receive a subtle WPA signature surface without becoming decorative. */
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .platform-card,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-card,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-card{
        background:linear-gradient(180deg,#ffffff 0%,var(--wpa-signature-paper) 100%) !important;
        border-color:rgba(15,89,98,.22) !important;
      }
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card:hover,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .platform-card:hover,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-card:hover,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-card:hover{
        border-color:rgba(15,89,98,.52) !important;
        box-shadow:0 14px 38px rgba(16,42,67,.13),0 0 0 1px rgba(201,168,76,.10) !important;
      }

      /* Links in light informational cards become clearly actionable. */
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card-link,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card a:not(.btn),
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .platform-card a:not(.btn),
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-card a:not(.btn){
        color:var(--wpa-signature-teal-deep) !important;
        font-weight:750 !important;
      }
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card a:not(.btn):hover,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .platform-card a:not(.btn):hover,
      html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .pub-card a:not(.btn):hover{
        color:var(--wpa-signature-copper) !important;
      }

      /* Level / price badges: keep navy-gold identity but sharpen contrast. */
      html[data-wpa-page="index"] main .level-badge,
      html[data-wpa-page="index"] main .price-badge{
        background:var(--wpa-signature-navy) !important;
        color:#F4E8C1 !important;
        border:1px solid rgba(201,168,76,.45) !important;
      }
      html[data-wpa-page="index"] main .price-card.featured .price-badge{
        background:var(--wpa-signature-gold) !important;
        color:#071326 !important;
      }

      /* The public-boundary/status text, when present, should read as a clear trust notice. */
      html[data-wpa-page="index"] .wpa-public-boundary,
      html[data-wpa-page="index"] .public-boundary,
      html[data-wpa-page="index"] [data-wpa-boundary],
      html[data-wpa-page="index"] .wpa-status-ribbon{
        color:#F7E9C3 !important;
        background:linear-gradient(90deg,#102A43,#0F5962) !important;
        border-color:rgba(201,168,76,.55) !important;
      }
      html[data-wpa-page="index"] .wpa-public-boundary a,
      html[data-wpa-page="index"] .public-boundary a,
      html[data-wpa-page="index"] [data-wpa-boundary] a{
        color:#F4D77A !important;
      }

      /* Preserve intentionally dark modules exactly as high-contrast light-on-dark. */
      html[data-wpa-page="index"] main .dark-section,
      html[data-wpa-page="index"] main .dark-section p,
      html[data-wpa-page="index"] main .dark-section li{
        color:rgba(255,255,255,.86) !important;
      }
      html[data-wpa-page="index"] main .dark-section .section-title,
      html[data-wpa-page="index"] main .dark-section h2,
      html[data-wpa-page="index"] main .dark-section h3,
      html[data-wpa-page="index"] main .dark-section h4{
        color:#ffffff !important;
      }
      html[data-wpa-page="index"] main .dark-section .section-label{
        color:#E8D49A !important;
      }

      @media(max-width:640px){
        html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card p,
        html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .card-list li,
        html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-text,
        html[data-wpa-page="index"] main section:not(.dark-section):not(.hero) .price-list li{
          font-weight:500;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function replaceVisibleTerminology(){
    if (!isInstitutePage()) return;

    var replacements = [
      ["WPA Intelligence Center", "WPA Analysis & Knowledge Center"],
      ["Intelligence Center", "Analysis & Knowledge Center"],
      ["Open Intelligence Center", "Open Analysis & Knowledge Center"],
      ["WPA Live Feed", "WPA Public Analysis Feed"],
      ["Live Feed", "Public Analysis Feed"],
      ["WPA Intelligence & Editorial Systems", "WPA Analytical & Editorial Systems"],
      ["Academic Search, Live Intelligence and Journal Watch", "Academic Search, Public Analysis and Journal Watch"]
    ];

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue;
      var next = text;
      replacements.forEach(function(pair){ next = next.split(pair[0]).join(pair[1]); });
      if (next !== text) node.nodeValue = next;
    }

    document.querySelectorAll("a, [title], [aria-label]").forEach(function(el){
      ["title", "aria-label"].forEach(function(attr){
        if (!el.hasAttribute(attr)) return;
        var value = el.getAttribute(attr);
        var next = value;
        replacements.forEach(function(pair){ next = next.split(pair[0]).join(pair[1]); });
        if (next !== value) el.setAttribute(attr,next);
      });
    });

    document.querySelectorAll(".jump-link, .nav-links a, .footer-col a").forEach(function(a){
      var text = (a.textContent || "").trim();
      if (text === "Intelligence") a.textContent = "Analysis";
    });
  }

  function runPatches(){
    if (isInstitutePage()) {
      addInstituteClarityStyles();
      replaceVisibleTerminology();
      setTimeout(replaceVisibleTerminology,250);
      setTimeout(replaceVisibleTerminology,1000);
    }
    if (isHomePage()) {
      addHomeSignatureStyles();
    }
  }

  /* Load the preserved original menu/header implementation first. */
  var core = document.createElement("script");
  core.src = "/languages/wpa-language-menu-10-core.js?v=1.2";
  core.defer = true;
  core.onload = runPatches;
  core.onerror = runPatches;
  document.head.appendChild(core);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPatches);
  } else {
    runPatches();
  }
})();

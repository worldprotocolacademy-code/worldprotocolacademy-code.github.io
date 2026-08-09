/* WPA Language Menu 10 loader + Institute clarity patch v1.3
   Keeps the original v1.2 implementation in wpa-language-menu-10-core.js,
   then applies terminology and text-contrast refinements to Institute pages.
*/
(function(){
  "use strict";

  function isInstitutePage(){
    var page = String(document.documentElement.getAttribute("data-wpa-page") || "").toLowerCase();
    var path = String(location.pathname || "").toLowerCase();
    return page === "institute" || path.indexOf("institute") !== -1;
  }

  function addClarityStyles(){
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

      /* Dark institutional sections keep light, high-contrast type. */
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

      /* Cards and tables stay readable regardless of parent section color. */
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

      /* Primary buttons must always keep dark lettering on gold. */
      html[data-wpa-page="institute"] .btn-primary{
        color:#071326 !important;
      }
      html[data-wpa-page="institute"] .btn-ghost{
        color:inherit;
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

    /* Short standalone jump-menu label: Intelligence -> Analysis. */
    document.querySelectorAll(".jump-link, .nav-links a, .footer-col a").forEach(function(a){
      var text = (a.textContent || "").trim();
      if (text === "Intelligence") a.textContent = "Analysis";
    });
  }

  function runInstitutePatch(){
    if (!isInstitutePage()) return;
    addClarityStyles();
    replaceVisibleTerminology();
    setTimeout(replaceVisibleTerminology,250);
    setTimeout(replaceVisibleTerminology,1000);
  }

  /* Load the preserved original menu/header implementation first. */
  var core = document.createElement("script");
  core.src = "/languages/wpa-language-menu-10-core.js?v=1.2";
  core.defer = true;
  core.onload = runInstitutePatch;
  core.onerror = runInstitutePatch;
  document.head.appendChild(core);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInstitutePatch);
  } else {
    runInstitutePatch();
  }
})();

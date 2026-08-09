/* WPA Language Menu 10 loader + Institute clarity patch v2.0
   Homepage colours are intentionally NOT controlled here.
   The homepage now uses one dedicated semantic stylesheet:
   /styles/wpa-home-emergency-readability.css
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

  function addInstituteClarityStyles(){
    if (!isInstitutePage() || document.getElementById("wpa-institute-clarity-v20")) return;
    var style = document.createElement("style");
    style.id = "wpa-institute-clarity-v20";
    style.textContent = `
      html[data-wpa-page="institute"] main section:not(.wpa-identity){color:#182b3a;}
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .section-title,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) h2,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) h3,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) h4{color:#0d1f3c;}
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .section-lead,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) p,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) li{color:#334b5e;}
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .section-label,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .domain-tag,
      html[data-wpa-page="institute"] main section:not(.wpa-identity) .pub-meta{color:#0f5962;}

      html[data-wpa-page="institute"] #charter,
      html[data-wpa-page="institute"] #practitioner-lectures,
      html[data-wpa-page="institute"] #opc-banner,
      html[data-wpa-page="institute"] #cta{color:#fbf8ee;}
      html[data-wpa-page="institute"] #charter h2,
      html[data-wpa-page="institute"] #charter h3,
      html[data-wpa-page="institute"] #charter h4,
      html[data-wpa-page="institute"] #practitioner-lectures h2,
      html[data-wpa-page="institute"] #practitioner-lectures h3,
      html[data-wpa-page="institute"] #practitioner-lectures h4,
      html[data-wpa-page="institute"] #opc-banner h2,
      html[data-wpa-page="institute"] #opc-banner h3,
      html[data-wpa-page="institute"] #cta h2,
      html[data-wpa-page="institute"] #cta h3{color:#fbf8ee !important;}
      html[data-wpa-page="institute"] #charter p,
      html[data-wpa-page="institute"] #charter li,
      html[data-wpa-page="institute"] #practitioner-lectures p,
      html[data-wpa-page="institute"] #practitioner-lectures li,
      html[data-wpa-page="institute"] #opc-banner p,
      html[data-wpa-page="institute"] #opc-banner li,
      html[data-wpa-page="institute"] #cta p,
      html[data-wpa-page="institute"] #cta li{color:rgba(251,248,238,.90) !important;}
      html[data-wpa-page="institute"] #charter .section-label,
      html[data-wpa-page="institute"] #practitioner-lectures .section-label,
      html[data-wpa-page="institute"] #opc-banner .section-label,
      html[data-wpa-page="institute"] #cta .section-label{color:#e3c878 !important;}

      html[data-wpa-page="institute"] .domain-card,
      html[data-wpa-page="institute"] .pillar,
      html[data-wpa-page="institute"] .region,
      html[data-wpa-page="institute"] .pub-card,
      html[data-wpa-page="institute"] .aab-content,
      html[data-wpa-page="institute"] .disclaimer-box,
      html[data-wpa-page="institute"] .method-table{color:#182b3a;}
      html[data-wpa-page="institute"] .domain-card h3,
      html[data-wpa-page="institute"] .pillar h3,
      html[data-wpa-page="institute"] .region h3,
      html[data-wpa-page="institute"] .pub-card h3,
      html[data-wpa-page="institute"] .aab-content h3,
      html[data-wpa-page="institute"] .category-name{color:#0d1f3c !important;}
      html[data-wpa-page="institute"] .domain-card p,
      html[data-wpa-page="institute"] .pillar p,
      html[data-wpa-page="institute"] .region li,
      html[data-wpa-page="institute"] .pub-card p,
      html[data-wpa-page="institute"] .aab-content p,
      html[data-wpa-page="institute"] .disclaimer-box p,
      html[data-wpa-page="institute"] .method-table td{color:#334b5e !important;}
      html[data-wpa-page="institute"] .btn-primary{color:#071326 !important;}
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

    document.querySelectorAll("[title], [aria-label]").forEach(function(el){
      ["title","aria-label"].forEach(function(attr){
        if (!el.hasAttribute(attr)) return;
        var value = el.getAttribute(attr);
        var next = value;
        replacements.forEach(function(pair){ next = next.split(pair[0]).join(pair[1]); });
        if (next !== value) el.setAttribute(attr,next);
      });
    });

    document.querySelectorAll(".jump-link, .nav-links a, .footer-col a").forEach(function(a){
      if ((a.textContent || "").trim() === "Intelligence") a.textContent = "Analysis";
    });
  }

  function runInstitutePatch(){
    if (!isInstitutePage()) return;
    addInstituteClarityStyles();
    replaceVisibleTerminology();
    setTimeout(replaceVisibleTerminology,250);
    setTimeout(replaceVisibleTerminology,1000);
  }

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

/* WPA Language Menu 10 loader + institutional capability sync v2.1
   Homepage colours are intentionally NOT controlled here.
   This conservative shared patch synchronizes public-facing facts and
   capability positioning on the WPA homepage and Institute page.
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
    var p = normalizedPath();
    return pageName() === "index" || p === "/" || p === "/index.html";
  }

  function isRelevantPage(){
    return isInstitutePage() || isHomePage();
  }

  function addInstituteClarityStyles(){
    if (!isInstitutePage() || document.getElementById("wpa-institute-clarity-v21")) return;
    var style = document.createElement("style");
    style.id = "wpa-institute-clarity-v21";
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

  function addCapabilityStyles(){
    if (!isRelevantPage() || document.getElementById("wpa-capability-sync-v21")) return;
    var style = document.createElement("style");
    style.id = "wpa-capability-sync-v21";
    style.textContent = `
      #wpa-ai-delivery-architecture{padding:72px 24px;background:#f7f3e8;border-top:1px solid #d8d2bc;border-bottom:1px solid #d8d2bc;color:#172b3c;}
      #wpa-ai-delivery-architecture .wpa-cap-wrap{max-width:1180px;margin:0 auto;}
      #wpa-ai-delivery-architecture .wpa-cap-eyebrow{font:700 11px/1.4 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a6f25;margin-bottom:10px;}
      #wpa-ai-delivery-architecture h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,4vw,44px);line-height:1.12;color:#0d1f3c;margin:0 0 14px;}
      #wpa-ai-delivery-architecture .wpa-cap-lead{max-width:900px;font-size:16px;line-height:1.7;color:#334b5e;margin-bottom:28px;}
      #wpa-ai-delivery-architecture .wpa-cap-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}
      #wpa-ai-delivery-architecture .wpa-cap-card{background:#fff;border:1px solid #d8d2bc;border-top:3px solid #c9a84c;padding:22px;border-radius:6px;box-shadow:0 5px 20px rgba(13,31,60,.07);}
      #wpa-ai-delivery-architecture .wpa-cap-card h3{font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.2;color:#0d1f3c;margin:0 0 9px;}
      #wpa-ai-delivery-architecture .wpa-cap-card p{font-size:14px;line-height:1.65;color:#42596b;margin:0;}
      #wpa-ai-delivery-architecture .wpa-cap-card a{display:inline-block;margin-top:12px;font-weight:700;color:#735c1c;text-decoration:underline;text-underline-offset:3px;}
      #wpa-ai-delivery-architecture .wpa-evidence-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;}
      #wpa-ai-delivery-architecture .wpa-evidence{background:#0d1f3c;color:#f8f4ee;padding:18px 20px;border-left:3px solid #c9a84c;border-radius:4px;}
      #wpa-ai-delivery-architecture .wpa-evidence strong{display:block;color:#e3c878;margin-bottom:5px;}
      #wpa-ai-delivery-architecture .wpa-evidence span{font-size:13.5px;line-height:1.55;color:rgba(248,244,238,.88);}
      #wpa-ai-delivery-architecture .wpa-evidence a{color:#e3c878;text-decoration:underline;text-underline-offset:3px;}
      #wpa-ai-delivery-architecture .wpa-boundary{margin-top:18px;padding:14px 16px;background:#fff;border:1px solid #d8d2bc;font-size:12.5px;line-height:1.6;color:#536777;}
      @media(max-width:900px){#wpa-ai-delivery-architecture .wpa-cap-grid{grid-template-columns:1fr 1fr;}#wpa-ai-delivery-architecture .wpa-evidence-row{grid-template-columns:1fr;}}
      @media(max-width:620px){#wpa-ai-delivery-architecture .wpa-cap-grid{grid-template-columns:1fr;}#wpa-ai-delivery-architecture{padding:54px 18px;}}
    `;
    document.head.appendChild(style);
  }

  function replaceVisibleTerminology(){
    if (!isRelevantPage()) return;
    var replacements = [
      ["WPA Intelligence Center", "WPA Analysis & Knowledge Center"],
      ["Intelligence Center", "Analysis & Knowledge Center"],
      ["Open Intelligence Center", "Open Analysis & Knowledge Center"],
      ["WPA Live Feed", "WPA Public Analysis Feed"],
      ["Live Feed", "Public Analysis Feed"],
      ["WPA Intelligence & Editorial Systems", "WPA Analytical & Editorial Systems"],
      ["Academic Search, Live Intelligence and Journal Watch", "Academic Search, Public Analysis and Journal Watch"],
      ["25 публикации (5 монографии, 1 дисертација, 19 трудови)", "26 публикации (6 монографии и прирачници, 1 дисертација, 19 трудови и прилози)"],
      ["5 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 25 публикации вкупно.", "6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 публикации вкупно."],
      ["Автор на 5 монографии и прирачници, 1 докторска дисертација и 19 научни трудови и прилози (25 вкупно публикации).", "Автор на 6 монографии и прирачници, 1 докторска дисертација и 19 научни трудови и прилози (26 вкупно публикации)."],
      ["5 монографии и прирачници", "6 монографии и прирачници"],
      ["25 публикации", "26 публикации"],
      ["25 вкупно публикации", "26 вкупно публикации"],
      ["25 publications", "26 publications"],
      ["5 monographs and manuals", "6 monographs and manuals"],
      ["5 monographs", "6 monographs"]
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
        var value = el.getAttribute(attr) || "";
        var next = value;
        replacements.forEach(function(pair){ next = next.split(pair[0]).join(pair[1]); });
        if (next !== value) el.setAttribute(attr,next);
      });
    });

    if (isInstitutePage()) {
      document.querySelectorAll(".jump-link, .nav-links a, .footer-col a").forEach(function(a){
        if ((a.textContent || "").trim() === "Intelligence") a.textContent = "Analysis";
      });
    }
  }

  function updateMetadata(){
    if (!isRelevantPage()) return;
    var desc = "World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies: research, applied practice, analytics, governed AI workflows, WPAWS, Virtual Sande, publications and professional learning. Development, testing and pilot phase — 2026.";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content",desc);
    var og = document.querySelector('meta[property="og:description"]');
    if (og) og.setAttribute("content",desc);
    var tw = document.querySelector('meta[name="twitter:description"]');
    if (tw) tw.setAttribute("content",desc);
    var kw = document.querySelector('meta[name="keywords"]');
    if (kw) kw.setAttribute("content","World Protocol Academy, WPA Institute, WPAWS, Virtual Sande, protocol, diplomacy, public communication, security studies, AI governance, provenance, HARP-6, Protocolometry, research, analytics, publications");
  }

  function capabilitySectionHTML(){
    return `
      <div class="wpa-cap-wrap">
        <div class="wpa-cap-eyebrow">WPA Institute · AI · Research · Applied Practice</div>
        <h2>Институционална и техничка архитектура · Institutional & Technical Architecture</h2>
        <p class="wpa-cap-lead">World Protocol Academy е повеќеслојна истражувачка, авторска, аналитичка, професионална и AI-поддржана платформа. Образованието и Student Desk се една application area во поширока архитектура што ги поврзува Institute, WPAWS, Virtual Sande, истражување, аналитика, публикации, безбедносни и дипломатски workflow-и и човечки управувана AI governance.</p>
        <div class="wpa-cap-grid">
          <article class="wpa-cap-card"><h3>WPAWS · Working Engine</h3><p>World Protocol Academic Writing System — академски и production workspace за Doctrine, Research, Protocol, Diplomacy, Teaching и Press, со writing/research tools, source workflows и controlled output preparation.</p><a href="/wpaws/index.html">Open WPAWS →</a></article>
          <article class="wpa-cap-card"><h3>Virtual Sande · AI Interface</h3><p>Source-grounded multilingual AI assistant со attribution logic, controlled retrieval, human review и јасна граница: AI предлага и образложува; човекот проверува, одобрува и останува одговорен.</p><a href="/virtual-sande-ai.html">Open Virtual Sande →</a></article>
          <article class="wpa-cap-card"><h3>Six Institute Domains</h3><p>Protocol, Diplomacy, Public Communication, Security, Research & Benchmark Analysis и Professional Practice — поврзани во една применета институтска рамка.</p><a href="/institute.html#research-pillars">Explore Institute →</a></article>
          <article class="wpa-cap-card"><h3>Analytics & Evidence</h3><p>Protocolometry, PSPI, Institute Index, public-source comparison, correction rights, source verification, benchmark methodology и measurable institutional outputs.</p><a href="/protocolometry-center.html">Protocolometry Center →</a></article>
          <article class="wpa-cap-card"><h3>Specialist Labs & Five Engines</h3><p>Protocol Symbols Lab, Diplomatic Analysis Lab, Academic Search Hub, WPA Watch, Journal Watch и Five Engines создаваат специјализирани research, monitoring and analysis workflows.</p><a href="/tools/wpa-five-engines.html">WPA Five Engines →</a></article>
          <article class="wpa-cap-card"><h3>Governance & Human Authority</h3><p>PN-005–PN-009, provenance, bounded action, human authorisation, Right to Pause, correction records и clear separation of public evidence, AI assistance and final human responsibility.</p><a href="/working-papers/">Working Papers & Protocol Notes →</a></article>
        </div>
        <div class="wpa-evidence-row">
          <div class="wpa-evidence"><strong>Official bibliographic evidence · 2026 book</strong><span>Протокол на државни симболи, химни и национални денови · ISBN 978-608-66168-5-4 · COBISS.MK-ID 69316613 · 74 pages · MK/EN. <a href="https://plus.cobiss.net/cobiss/mk/mk/data/cobib/69316613">COBISS record →</a></span></div>
          <div class="wpa-evidence"><strong>Latest AI-governance research evidence</strong><span>WPA-PN-009 · AI Transparency and the Protocol of Authorship · Version v1.0 FINAL DOI-LOCKED · DOI 10.5281/zenodo.21933739 · MK/EN. <a href="https://doi.org/10.5281/zenodo.21933739">Zenodo DOI →</a></span></div>
        </div>
        <div class="wpa-boundary"><strong>Status boundary:</strong> WPA distinguishes live, limited-production, staging, beta and planned capabilities. Analytical modules use public sources and do not claim intelligence, surveillance, investigative or autonomous operational authority. Consequential outputs remain subject to human review and authorization.</div>
      </div>`;
  }

  function addCapabilitySection(){
    if (!isRelevantPage() || document.getElementById("wpa-ai-delivery-architecture")) return;
    addCapabilityStyles();
    var section = document.createElement("section");
    section.id = "wpa-ai-delivery-architecture";
    section.setAttribute("aria-label","WPA institutional and technical architecture");
    section.innerHTML = capabilitySectionHTML();

    var anchor = document.getElementById("publications") || document.getElementById("institute-publications") || document.querySelector("footer");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(section,anchor);
    else document.body.appendChild(section);
  }

  function runPageSync(){
    if (!isRelevantPage()) return;
    addInstituteClarityStyles();
    replaceVisibleTerminology();
    updateMetadata();
    addCapabilitySection();
  }

  var core = document.createElement("script");
  core.src = "/languages/wpa-language-menu-10-core.js?v=1.2";
  core.defer = true;
  core.onload = runPageSync;
  core.onerror = runPageSync;
  document.head.appendChild(core);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPageSync);
  } else {
    runPageSync();
  }

  setTimeout(runPageSync,250);
  setTimeout(runPageSync,1000);
  setTimeout(runPageSync,2500);
})();

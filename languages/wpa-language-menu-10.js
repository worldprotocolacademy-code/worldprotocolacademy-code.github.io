/* WPA Language Menu 10 loader + academic institutional capability sync v3.0
   Homepage colours are intentionally NOT controlled here.
   This shared layer synchronizes public-facing facts, research-first positioning,
   canonical URLs, evidence links and academic-governance boundaries.
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
    if (!isInstitutePage() || document.getElementById("wpa-institute-clarity-v30")) return;
    var style = document.createElement("style");
    style.id = "wpa-institute-clarity-v30";
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
    if (!isRelevantPage() || document.getElementById("wpa-capability-sync-v30")) return;
    var style = document.createElement("style");
    style.id = "wpa-capability-sync-v30";
    style.textContent = `
      #wpa-ai-delivery-architecture{padding:72px 24px;background:#f7f3e8;border-top:1px solid #d8d2bc;border-bottom:1px solid #d8d2bc;color:#172b3c;}
      #wpa-ai-delivery-architecture .wpa-cap-wrap{max-width:1180px;margin:0 auto;}
      #wpa-ai-delivery-architecture .wpa-cap-eyebrow{font:700 11px/1.4 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a6f25;margin-bottom:10px;}
      #wpa-ai-delivery-architecture h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(30px,4vw,44px);line-height:1.12;color:#0d1f3c;margin:0 0 14px;}
      #wpa-ai-delivery-architecture .wpa-cap-lead{max-width:930px;font-size:16px;line-height:1.72;color:#334b5e;margin-bottom:28px;}
      #wpa-ai-delivery-architecture .wpa-cap-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;}
      #wpa-ai-delivery-architecture .wpa-cap-card{background:#fff;border:1px solid #d8d2bc;border-top:3px solid #c9a84c;padding:22px;border-radius:6px;box-shadow:0 5px 20px rgba(13,31,60,.07);}
      #wpa-ai-delivery-architecture .wpa-cap-card h3{font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.2;color:#0d1f3c;margin:0 0 9px;}
      #wpa-ai-delivery-architecture .wpa-cap-card p{font-size:14px;line-height:1.65;color:#42596b;margin:0;}
      #wpa-ai-delivery-architecture .wpa-cap-card a{display:inline-block;margin-top:12px;font-weight:700;color:#735c1c;text-decoration:underline;text-underline-offset:3px;}
      #wpa-ai-delivery-architecture .wpa-evidence-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:22px;}
      #wpa-ai-delivery-architecture .wpa-evidence{background:#0d1f3c;color:#f8f4ee;padding:18px 20px;border-left:3px solid #c9a84c;border-radius:4px;}
      #wpa-ai-delivery-architecture .wpa-evidence strong{display:block;color:#e3c878;margin-bottom:5px;}
      #wpa-ai-delivery-architecture .wpa-evidence span{font-size:13.5px;line-height:1.55;color:rgba(248,244,238,.88);}
      #wpa-ai-delivery-architecture .wpa-evidence a{color:#e3c878;text-decoration:underline;text-underline-offset:3px;}
      #wpa-ai-delivery-architecture .wpa-boundary{margin-top:18px;padding:14px 16px;background:#fff;border:1px solid #d8d2bc;font-size:12.5px;line-height:1.65;color:#536777;}
      #wpa-ai-delivery-architecture .wpa-arch-line{margin:20px 0 0;padding:15px 17px;background:#fffdf5;border:1px solid #dccb96;border-left:4px solid #9c8336;font:600 13px/1.65 Inter,system-ui,sans-serif;color:#21394b;}
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
      ["26 публикации (6 монографии и прирачници, 1 дисертација, 19 трудови и прилози)", "26 публикации (6 монографии и прирачници, 1 дисертација, 19 трудови и прилози)"],
      ["6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 публикации вкупно.", "6 монографии и прирачници, 1 докторска дисертација, 19 научни трудови и прилози — 26 публикации вкупно."],
      ["Автор на 6 монографии и прирачници, 1 докторска дисертација и 19 научни трудови и прилози (26 вкупно публикации).", "Автор на 6 монографии и прирачници, 1 докторска дисертација и 19 научни трудови и прилози (26 вкупно публикации)."],
      ["6 монографии и прирачници", "6 монографии и прирачници"],
      ["25 публикации", "26 публикации"],
      ["26 вкупно публикации", "26 вкупно публикации"],
      ["26 publications", "26 publications"],
      ["6 monographs and manuals", "6 monographs and manuals"],
      ["6 monographs", "6 monographs"]
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

  function setMeta(selector,value){
    var el=document.querySelector(selector);
    if(el)el.setAttribute("content",value);
  }

  function updateMetadata(){
    if (!isRelevantPage()) return;
    var desc = "World Protocol Academy — Institute for Protocol, Diplomacy, Public Communication & Security Studies: independent digital research, authorial, analytical, professional and educational platform with Protocolometry, governed AI workflows, WPAWS, Virtual Sande, publications and human-reviewed institutional tools. Development, testing and pilot phase — 2026.";
    setMeta('meta[name="description"]',desc);
    setMeta('meta[property="og:description"]',desc);
    setMeta('meta[name="twitter:description"]',desc);
    setMeta('meta[name="keywords"]',"World Protocol Academy, WPA Institute, WPAWS, Virtual Sande, Protocolometry, protocol, diplomacy, public communication, security studies, research, analytics, AI governance, provenance, human authority, HARP-6, publications");

    var canonicalUrl=isInstitutePage()?"https://worldprotocolacademy.mk/institute.html":"https://worldprotocolacademy.mk/";
    var canonical=document.querySelector('link[rel="canonical"]');
    if(canonical)canonical.setAttribute("href",canonicalUrl);
    setMeta('meta[property="og:url"]',canonicalUrl);
    setMeta('meta[property="og:image"]',"https://worldprotocolacademy.mk/logo.png");
    setMeta('meta[name="twitter:image"]',"https://worldprotocolacademy.mk/logo.png");

    if(isInstitutePage()){
      document.title="WPA Institute | Research, Protocol, Diplomacy & Governed AI";
      var ld=document.querySelector('script[type="application/ld+json"]');
      if(ld){
        try{
          var data=JSON.parse(ld.textContent||"{}");
          data["@type"]="Organization";
          data.name="World Protocol Academy — WPA Institute";
          data.url="https://worldprotocolacademy.mk/institute.html";
          data.logo="https://worldprotocolacademy.mk/logo.png";
          data.description=desc;
          data.knowsAbout=["Protocol","Diplomacy","Public Communication","Security Studies","Protocolometry","Research Methodology","AI Governance"];
          ld.textContent=JSON.stringify(data,null,2);
        }catch(e){}
      }
    }
  }

  function capabilitySectionHTML(){
    return `
      <div class="wpa-cap-wrap">
        <div class="wpa-cap-eyebrow">WPA Institute · Research · Evidence · Governed AI · Applied Practice</div>
        <h2>Институционална и техничка архитектура · Institutional & Technical Architecture</h2>
        <p class="wpa-cap-lead">World Protocol Academy е повеќеслојна истражувачка, авторска, аналитичка, професионална и образовна дигитална платформа. Образованието и Student Desk се една application area во поширока архитектура што ги поврзува Institute, WPAWS, Virtual Sande, Protocolometry, истражување, јавни извори, публикации, специјализирани labs и човечки управувана AI governance.</p>
        <div class="wpa-cap-grid">
          <article class="wpa-cap-card"><h3>WPAWS · Executive Working Layer</h3><p>World Protocol Academic Writing System — governed working environment со 17 executive agent roles за академско пишување, анализа, протокол, дипломатија, безбедност, цитати, редакција, peer-style review и publishing preparation.</p><a href="/wpaws/index.html">Open WPAWS →</a></article>
          <article class="wpa-cap-card"><h3>Virtual Sande · Central AI Interface</h3><p>Source-disciplined AI interface и orchestration layer со attribution logic, controlled retrieval, human review и јасна граница: AI анализира, подготвува и препорачува; овластен човек одобрува consequential output.</p><a href="/virtual-sande-ai.html">Open Virtual Sande →</a></article>
          <article class="wpa-cap-card"><h3>Protocolometry · Measurement Methodology</h3><p>Методолошка рамка за мерење, споредување, traceability, correction rights и evidence-based analysis во протокол, дипломатија, комуникација и security-aware professional practice.</p><a href="/protocolometry-center.html">Protocolometry Center →</a></article>
          <article class="wpa-cap-card"><h3>Research & Source Infrastructure</h3><p>Academic Search Hub, WPA Watch и Journal Watch се legal-safe research and editorial workflows: public-source discovery, candidate monitoring, traceability, classification review и human academic verification.</p><a href="/tools/academic-search-hub/">Academic Search Hub →</a></article>
          <article class="wpa-cap-card"><h3>Specialist Labs & Applied Tools</h3><p>Protocol Symbols Lab, Diplomatic Analysis Lab, Five Engines и Digital Pavilion обезбедуваат specialist datasets, simulations, protocol decision-support и public research interfaces со јасно означена зрелост.</p><a href="/tools/wpa-five-engines.html">WPA Five Engines →</a></article>
          <article class="wpa-cap-card"><h3>Governance · Doctrine · Human Authority</h3><p>Doctrine Kernel, PN-005–PN-009, provenance, bounded agency, source-compliance, AC0–AC3, Right to Pause, evidence/safety gates и Human Gate ја ограничуваат автоматизацијата и ја задржуваат институционалната одговорност кај човекот.</p><a href="/working-papers/">Research & Governance →</a></article>
        </div>
        <div class="wpa-arch-line"><strong>Canonical governed architecture:</strong> Human Authority → WPA Doctrine Kernel → strategic AI core → Virtual Sande → 17 WPAWS executive agents → up to 80 bounded tactical-operational agent seats → Evidence Gate → Safety Gate → Human Gate → WPA output. Council-54 е посебен external-AI candidate registry, не тврдење за 54 истовремено активни или партнерски системи.</div>
        <div class="wpa-evidence-row">
          <div class="wpa-evidence"><strong>Official bibliographic evidence · 2026 book</strong><span>Протокол на државни симболи, химни и национални денови · ISBN 978-608-66168-5-4 · COBISS.MK-ID 69316613 · 74 pages · MK/EN. <a href="https://plus.cobiss.net/cobiss/mk/mk/data/cobib/69316613">COBISS record →</a></span></div>
          <div class="wpa-evidence"><strong>AI-governance research evidence</strong><span>WPA-PN-009 · AI Transparency and the Protocol of Authorship · v1.0 FINAL DOI-LOCKED · DOI 10.5281/zenodo.21933739 · MK/EN. <a href="https://doi.org/10.5281/zenodo.21933739">Zenodo DOI →</a></span></div>
          <div class="wpa-evidence"><strong>Academic Quality & Evidence Standard</strong><span>Internal machine-readable quality discipline for identity, provenance, capability status, version hygiene, human authority, publication integrity, rights compliance and auditability. <a href="/data/wpa-academic-quality-standard.json">Open standard →</a></span></div>
          <div class="wpa-evidence"><strong>Public Evidence & Version Control</strong><span>Canonical component versions and verifiable technical/public evidence are separated from marketing claims and legacy labels. <a href="/data/wpa-public-evidence-index.json">Evidence index →</a> · <a href="/data/wpa-canonical-version-manifest.json">Version manifest →</a></span></div>
        </div>
        <div class="wpa-boundary"><strong>Status boundary:</strong> WPA distinguishes LIVE, LIMITED PRODUCTION, IMPLEMENTED MVP, STAGING, BETA, PROTOTYPE, PLANNED and CANDIDATE REGISTRY states. Analytical modules use public or otherwise authorised sources and do not claim intelligence, surveillance, investigative or autonomous operational authority. External-customer delivery, partnership, accreditation and production maturity are claimed only when supported by evidence. Consequential outputs remain subject to human review and authorization.</div>
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
  core.src = "/languages/wpa-language-menu-10-core.js?v=1.4";
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
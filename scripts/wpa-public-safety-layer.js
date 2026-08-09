/* WPA Public Safety Layer v1.8
 * Civil, analytical, development-phase terminology and public-boundary enforcement.
 * No publishing, payment, credential or backend actions are performed here.
 * Analytical modules use public sources only and have no intelligence, surveillance, investigative or operational function.
 * v1.7: the Institute-only royal stylesheet is no longer injected on the homepage.
 * v1.8: the central matrix navy band is tagged as a semantic dark section at runtime.
 */
(function(){
  'use strict';
  if(window.WPA_PUBLIC_SAFETY_LAYER_LOADED)return;
  window.WPA_PUBLIC_SAFETY_LAYER_LOADED=true;

  var path=(location.pathname||'/').toLowerCase();
  var relevant=/\/(index\.html)?$|\/institute\.html$|\/intelligence-center\.html$|\/analytical-center\.html$|\/wpa-live-intelligence-feed\.html$|\/wpa-live-analytical-feed\.html$|\/wpa-services\.html$|\/wpa-briefings\.html$|\/journal\/vol-1-issue-1-2026\.html$/.test(path);
  if(!relevant)return;

  var replacements=[
    ['🛡️ Intelligence Center','📊 Analytical Center'],['WPA Intelligence Center','WPA Analytical Center'],['Intelligence Center','Analytical Center'],
    ['WPA Live Intelligence Feed','WPA Live Analytical Feed'],['Live Intelligence Feed','Live Analytical Feed'],
    ['WPA Intelligence & Editorial Systems','WPA Analytical & Editorial Systems'],['Academic Search, Live Intelligence and Journal Watch','Academic Search, Live Analysis and Journal Watch'],
    ['Premium WPA Briefings','Professional WPA Briefings · Future Programme'],['Premium Briefings','Professional Briefings · Future Programme'],
    ['WPA Services Layer','WPA Professional Services · Development Preview'],['Institutional Services','Professional Services · Development Preview'],
    ['Revenue слој','Future Sustainability Layer'],['Побарај понуда','Изрази необврзувачки интерес'],['Request Briefing','Express Professional Interest'],
    ['По договор','Достапноста не е активирана'],['membership, partner benefits и одржлива growth логика','future community access, proposed partner framework and sustainable development logic'],
    ['институционална интелигенција','институционална аналитичка подготвеност'],['уредничката интелигенција','уредничката анализа']
  ];

  function replaceText(text){var out=text;replacements.forEach(function(pair){out=out.split(pair[0]).join(pair[1]);});return out;}
  function safeTextNodes(root){
    var walker=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var p=node.parentElement;
      if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/.test(p.tagName))return NodeFilter.FILTER_REJECT;
      if(p.closest('[data-wpa-preserve-name="true"]'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(function(node){var next=replaceText(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;});
  }
  function updateLinks(){document.querySelectorAll('a[href]').forEach(function(a){var href=a.getAttribute('href')||'';if(/(^|\/)intelligence-center\.html([?#].*)?$/i.test(href))a.setAttribute('href','analytical-center.html');if(/(^|\/)wpa-live-intelligence-feed\.html([?#].*)?$/i.test(href))a.setAttribute('href','wpa-live-analytical-feed.html');});}
  function addBoundary(){
    if(document.getElementById('wpaPublicSafetyBoundary'))return;
    var box=document.createElement('aside');box.id='wpaPublicSafetyBoundary';box.setAttribute('role','note');
    box.style.cssText='max-width:1180px;margin:18px auto;padding:14px 18px;border:1px solid rgba(201,168,76,.42);border-left:4px solid #c9a84c;background:#fffaf0;color:#1a1a2e;font:13px/1.6 system-ui,sans-serif;box-sizing:border-box';
    box.innerHTML='<strong>WPA јавна граница · Public boundary:</strong> WPA е независна дигитална образовна, истражувачка и авторска платформа во развојна, тест и пробна фаза. Аналитичките модули користат јавни извори и немаат разузнавачка, надзорна, истражна или оперативна функција. <span lang="en">Analytical modules use public sources only and have no intelligence, surveillance, investigative or operational function.</span> Услуги, членства, сертификати, плаќања и комерцијални понуди не се активирани додека не се воспостави соодветна правна, етичка, даночна и платежна рамка. <span lang="en">Services, memberships, certificates, payments and commercial offers remain in development and are not activated.</span>';
    var main=document.querySelector('main');if(main&&main.parentNode)main.parentNode.insertBefore(box,main);else document.body.insertBefore(box,document.body.firstChild);
  }
  function guardCommercialActions(){document.querySelectorAll('a,button').forEach(function(el){var text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();var href=(el.getAttribute&&el.getAttribute('href'))||'';var risky=/checkout|pay now|payment|плати|купи|buy now|побарај понуда|request quote|estimated fee/.test(text+' '+href);if(!risky)return;if(el.tagName==='A')el.setAttribute('href','mailto:worldprotocolacademy@gmail.com?subject='+encodeURIComponent('WPA expression of interest'));el.setAttribute('data-wpa-development-only','true');el.setAttribute('title','Development preview — no payment, contract or commercial commitment is created.');});}
  function tagSemanticDarkSections(){
    var isHome=path==='/'||path==='/index.html';
    if(!isHome)return;
    var marker=document.querySelector('[data-i18n="a_top.20"],[data-i18n="a_top.2"]');
    var section=marker&&marker.closest('section');
    if(section)section.classList.add('dark-section');
  }
  function loadScriptOnce(id,src){if(document.getElementById(id))return;var script=document.createElement('script');script.id=id;script.src=src;script.defer=true;document.head.appendChild(script);}
  function loadStyleOnce(id,href){if(document.getElementById(id))return;var link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);}
  function loadHomepageEnhancers(){
    var isHome=path==='/'||path==='/index.html';
    var isInstitute=path==='/institute.html';
    if(isInstitute)loadStyleOnce('wpa-royal-responsive','/styles/wpa-royal-responsive.css?v=20260809-2');
    if(!isHome)return;
    loadScriptOnce('wpa-about-interactive-loader','/scripts/wpa-about-interactive.js?v=20260718-1');
    loadScriptOnce('wpa-programme-families-loader','/scripts/wpa-programme-families-interactive.js?v=20260718-1');
  }
  function boot(){safeTextNodes(document.body);updateLinks();addBoundary();guardCommercialActions();tagSemanticDarkSections();loadHomepageEnhancers();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('wpa:lang-changed',function(){setTimeout(boot,60);});
})();
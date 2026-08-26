/* WPA final public reconciliation layer · 26 August 2026
   Purpose: close verified legacy drift without rewriting large public HTML files in-browser.
   Canonical boundaries: 26 academic publications; 23 Zenodo records = 13 WP + 9 PN + 1 plan;
   Doc. Dr / Доц. д-р author identity; vendor-neutral public AI wording; OPC date/venue unconfirmed;
   WP-009 latest-facing reference uses the concept DOI until its v1.1 version-specific DOI is captured.
*/
(function(){
  'use strict';
  if(window.__WPA_FINAL_RECONCILIATION_20260826__) return;
  window.__WPA_FINAL_RECONCILIATION_20260826__=true;

  var path=String(window.location.pathname||'/').toLowerCase().replace(/\/+$/,'')||'/';
  var busy=false;
  var replacements=[
    ['Assoc. Prof. Dr. Sande Smiljanov','Doc. Dr Sande Smiljanov'],
    ['Assoc. Prof. Dr Sande Smiljanov','Doc. Dr Sande Smiljanov'],
    ['Assoc. Prof. Sande Smiljanov','Doc. Dr Sande Smiljanov'],
    [' · Вонреден професор',''],
    ['Вонреден професор на International University Europa Prima.','Академска афилијација: International University Europa Prima.'],
    ['Associate Professor at International University Europa Prima.','Academic affiliation: International University Europa Prima.'],
    ['Gemini, Claude/Opus,','AI models,'],
    ['Gemini Omni / Video Workflow','Video AI Workflow'],
    ['Claude / Opus Research Workflow','Research AI Workflow'],
    ['Сите дванаесет WPA Working Papers се објавени како јавни Zenodo DOI записи: WP-001–WP-012.','Сите тринаесет WPA Working Papers се објавени како јавни Zenodo DOI записи: WP-001–WP-013.'],
    ['Посебна порта за универзитети, библиотеки, дипломатски академии и стратешки институционални партнери на WPA.','Посебна порта за универзитети, библиотеки, дипломатски академии и потенцијални стратешки институционални соработници на WPA.']
  ];
  function textFix(value){
    var out=String(value||'');
    replacements.forEach(function(pair){out=out.split(pair[0]).join(pair[1]);});
    return out;
  }
  function walk(root){
    if(!root||!document.createTreeWalker||typeof NodeFilter==='undefined') return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(node){
      var p=node.parentNode,tag=p&&p.nodeName?String(p.nodeName).toUpperCase():'';
      return /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(tag)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;
    }}),node;
    while((node=walker.nextNode())){var next=textFix(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}
  }
  function langIsMk(){return String(document.documentElement.lang||'').toLowerCase().indexOf('mk')===0;}
  function setText(sel,mk,en){var el=document.querySelector(sel);if(el){var v=langIsMk()?mk:en;if(el.textContent!==v)el.textContent=v;}}

  function fixHome(){
    if(path!=='/'&&path!=='/index.html') return;
    var totalLabel=document.querySelector('[data-i18n="a_bibliography.6"]');
    var monoLabel=document.querySelector('[data-i18n="a_bibliography.7"]');
    if(totalLabel&&totalLabel.previousElementSibling&&totalLabel.previousElementSibling.textContent!=='26') totalLabel.previousElementSibling.textContent='26';
    if(monoLabel&&monoLabel.previousElementSibling&&monoLabel.previousElementSibling.textContent!=='6') monoLabel.previousElementSibling.textContent='6';
    setText('[data-i18n="a_bibliography.2"]','Доц. д-р Санде Смиљанов · Автор · Истражувач · Креатор на платформата','Doc. Dr Sande Smiljanov · Author · Researcher · Platform Creator');
    var partner=document.querySelector('[data-i18n="a_platform.16"]');
    if(partner){
      var pv=langIsMk()?'Посебна порта за универзитети, библиотеки, дипломатски академии и потенцијални стратешки институционални соработници на WPA.':'A dedicated gateway for universities, libraries, diplomatic academies and prospective institutional collaborators of WPA.';
      if(partner.textContent!==pv)partner.textContent=pv;
    }
  }

  function fixInstitute(){
    if(path!=='/institute.html'&&path!=='/institute') return;
    setText('[data-i18n="institute.tools_hub.ai.text"]','AI модели, аудио, видео, потекло на содржини, AI транспарентност и патоказ за човечка ревизија.','AI models, audio, video, content provenance, AI transparency and human-review workflows.');
    setText('[data-i18n="institute.ai.c1.title"]','Video AI Workflow','Video AI Workflow');
    setText('[data-i18n="institute.ai.c2.title"]','Research AI Workflow','Research AI Workflow');
    setText('[data-i18n="institute.opc.meta.date_value"]','Ќе биде потврдено','To be confirmed');
    setText('[data-i18n="institute.opc.meta.venue_value"]','Ќе биде потврдено','To be confirmed');
    setText('[data-i18n="institute.opc.meta.location_value"]','Охрид, Северна Македонија · предложено / ќе биде потврдено','Ohrid, North Macedonia · proposed / to be confirmed');
    setText('[data-i18n="institute.opc.meta.status_value"]','Регистар за интерес е отворен · датумот и местото не се потврдени','Interest register open · date and venue not confirmed');
    setText('[data-i18n="institute.publications.working_papers.text"]','Сите тринаесет WPA Working Papers се објавени како јавни Zenodo DOI записи: WP-001–WP-013.','All thirteen WPA Working Papers are published as public Zenodo DOI records: WP-001–WP-013.');
  }

  function fixBibliography(){
    if(path!=='/bibliography'&&path!=='/bibliography/index.html') return;
    var profile=document.querySelector('#academic-profiles + .bib-entry, #academic-profiles ~ .bib-entry');
    if(profile){
      var en=profile.querySelector('.bib-en');if(en&&en.textContent!=='Doc. Dr Sande Smiljanov')en.textContent='Doc. Dr Sande Smiljanov';
      if(profile.dataset.search)profile.dataset.search=textFix(profile.dataset.search);
    }
    var wp9=document.getElementById('wp-009');
    if(wp9){
      wp9.dataset.doi='10.5281/zenodo.20641840';
      if(wp9.dataset.search){wp9.dataset.search=textFix(wp9.dataset.search).replace(/v1\.0/gi,'v1.1').replace(/author-reviewed final release/gi,'author-reviewed release').replace(/10\.5281\/zenodo\.20641841/g,'10.5281/zenodo.20641840');}
      var meta=wp9.querySelector('.bib-meta');
      if(meta&&!meta.dataset.wpaWp009V11){
        meta.dataset.wpaWp009V11='1';
        meta.innerHTML='<strong>2026</strong> &nbsp;|&nbsp; DPRK / PRC Protocol and Visual Statecraft Case Study · English with Macedonian abstract · v1.1 &nbsp;|&nbsp; Author-Reviewed Release<br>Concept DOI <a class="bib-link" href="https://doi.org/10.5281/zenodo.20641840" rel="noopener" target="_blank">10.5281/zenodo.20641840</a> · latest-version resolver';
      }
      wp9.querySelectorAll('a[href*="20641841"]').forEach(function(a){a.href='https://doi.org/10.5281/zenodo.20641840';if(/20641841/.test(a.textContent))a.textContent=a.textContent.replace('20641841','20641840');});
    }
    var bar=document.querySelector('.zenodo-bar-segmented');
    if(bar){
      var segs=bar.querySelectorAll('.zenodo-seg');
      var widths=['15.38%','30.77%','7.69%','7.69%','7.69%','7.69%','7.69%','7.69%'];
      for(var i=0;i<segs.length&&i<widths.length;i++)segs[i].style.width=widths[i];
      if(!bar.querySelector('[data-wpa-wp013-segment]')){
        var s=document.createElement('div');s.className='zenodo-seg seg-regional';s.dataset.wpaWp013Segment='1';s.style.width='7.69%';s.title='Official Visit / India–North Macedonia Case Study: 1';s.textContent='1';bar.appendChild(s);
      }
    }
    var legend=document.querySelector('.zenodo-legend');
    if(legend&&!legend.querySelector('[data-wpa-wp013-category]')){
      var item=document.createElement('div');item.className='zenodo-legend-item';item.dataset.wpaWp013Category='1';item.innerHTML='<span class="zenodo-legend-swatch sw-regional"></span><span><strong>Official Visit / India–North Macedonia Case Study · 1</strong><br><span class="leg-papers">WP-013 Bridges, Not Barriers — President Droupadi Murmu official visit to North Macedonia</span></span>';legend.appendChild(item);
    }
    var doiLine=document.querySelector('.zenodo-doi-line');
    if(doiLine&&/Author-Reviewed Final Releases/.test(doiLine.textContent))doiLine.innerHTML='<strong>DOI coverage: 13 Zenodo records</strong> · Сите записи се author-reviewed public releases со трајни Zenodo DOI идентификатори.';
  }

  function fixWorkingPapers(){
    if(path!=='/working-papers'&&path!=='/working-papers/index.html') return;
    var wp9=document.getElementById('wp009');
    if(wp9){
      var meta=wp9.querySelector('.paper-meta');if(meta)meta.textContent='Version 1.1 · English with Macedonian abstract · Published 15 June 2026 · Author-Reviewed Release';
      var doi=wp9.querySelector('.doi');if(doi){doi.href='https://doi.org/10.5281/zenodo.20641840';doi.textContent='Concept DOI · 10.5281/zenodo.20641840';}
      wp9.querySelectorAll('a.btn[href*="20641841"]').forEach(function(a){a.href='https://doi.org/10.5281/zenodo.20641840';a.textContent='Latest Zenodo version';});
    }
    var divider=document.querySelector('#papersGrid .series-divider');
    if(divider&&/^WPA Working Papers 001–012/.test(divider.textContent)&&divider.dataset.wpaClarified!=='1'){
      divider.dataset.wpaClarified='1';divider.firstChild.nodeValue='WPA Working Papers 001–012 · WP-013 in Current Canonical Corpus below';
    }
  }

  function reconcile(){
    if(busy||!document.body)return;busy=true;
    try{walk(document.body);fixHome();fixInstitute();fixBibliography();fixWorkingPapers();}finally{busy=false;}
  }
  function boot(){reconcile();if(!window.__WPA_FINAL_RECONCILIATION_OBSERVER__&&window.MutationObserver){window.__WPA_FINAL_RECONCILIATION_OBSERVER__=new MutationObserver(function(){window.clearTimeout(window.__wpaFinalReconcileTimer);window.__wpaFinalReconcileTimer=window.setTimeout(reconcile,25);});window.__WPA_FINAL_RECONCILIATION_OBSERVER__.observe(document.body,{childList:true,subtree:true,characterData:true});}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.setTimeout(reconcile,400);window.setTimeout(reconcile,1200);
})();

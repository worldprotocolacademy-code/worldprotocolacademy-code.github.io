/* WPA Public Entry Layer v1.0 · 2026-08-25
   Progressive disclosure for first-time public visitors.
   Does not delete or disable deeper WPA systems. */
(function(){
  'use strict';

  if (window.WPA_PUBLIC_ENTRY_LAYER_LOADED) return;
  window.WPA_PUBLIC_ENTRY_LAYER_LOADED = true;

  function isHome(){
    var p=String(location.pathname||'/').toLowerCase().replace(/\/+$/,'')||'/';
    return p==='/' || p==='/index.html' || String(document.documentElement.getAttribute('data-wpa-page')||'').toLowerCase()==='index';
  }

  function ensureCss(){
    if(document.getElementById('wpa-public-entry-layer-css')) return;
    var l=document.createElement('link');
    l.id='wpa-public-entry-layer-css';
    l.rel='stylesheet';
    l.href='/wpa-public-entry-layer.css?v=1.0';
    document.head.appendChild(l);
  }

  function makeLink(href,text){
    var a=document.createElement('a');
    a.href=href;
    a.textContent=text;
    return a;
  }

  function simplifyHero(){
    var actions=document.querySelector('.hero .hero-actions');
    if(!actions || actions.getAttribute('data-wpa-entry-v1')==='true') return;
    actions.setAttribute('data-wpa-entry-v1','true');
    actions.classList.add('wpa-public-entry-actions');
    actions.innerHTML='';

    var learn=makeLink('#wpa-quick-start-learn','Учење · Learn');
    learn.className='btn btn-gold';
    var research=makeLink('#wpa-quick-start-research','Истражување · Research');
    research.className='btn btn-gold';
    var institutional=makeLink('#wpa-quick-start-institutional','Институционално · Institutional');
    institutional.className='btn btn-gold';
    actions.appendChild(learn); actions.appendChild(research); actions.appendChild(institutional);

    if(!document.querySelector('.wpa-hero-signature-link')){
      var sig=makeLink('/protocolometry-center.html','📐 Protocolometry Center · методолошки центар');
      sig.className='wpa-hero-signature-link';
      actions.insertAdjacentElement('afterend',sig);
    }
  }

  function card(id,title,body,links){
    var article=document.createElement('article');
    article.className='wpa-entry-card';
    article.id=id;
    var h=document.createElement('h4'); h.textContent=title;
    var p=document.createElement('p'); p.textContent=body;
    var row=document.createElement('div'); row.className='wpa-entry-links';
    links.forEach(function(x){row.appendChild(makeLink(x[0],x[1]));});
    article.appendChild(h); article.appendChild(p); article.appendChild(row);
    return article;
  }

  function ensureQuickStart(){
    if(document.getElementById('wpa-quick-start')) return;
    var hero=document.querySelector('section.hero');
    if(!hero || !hero.parentNode) return;

    var section=document.createElement('section');
    section.id='wpa-quick-start';
    section.setAttribute('aria-label','WPA Quick Start');
    var container=document.createElement('div'); container.className='container';
    var head=document.createElement('div'); head.className='wpa-quick-start-head';
    head.innerHTML='<span class="wpa-quick-start-kicker">WPA Quick Start · Брз почеток</span><h3>Три јасни патеки низ WPA</h3><p>Изберете според вашата цел. Целосната академска, техничка и институционална архитектура останува достапна под овие јавни влезови.</p>';
    var grid=document.createElement('div'); grid.className='wpa-quick-start-grid';

    grid.appendChild(card('wpa-quick-start-learn','Учење · Learn','Програми, професионален развој и транспарентна сертификациска рамка.',[
      ['/programmes.html','Програми'],['/certification.html','Сертификација'],['/student-desk/','Студентско биро']
    ]));
    grid.appendChild(card('wpa-quick-start-research','Истражување · Research','Публикации, Протоколометрија, академско пребарување и WPA Journal.',[
      ['/protocolometry-center.html','Протоколометрија'],['/papers.html','Публикации'],['/journal/','WPA Journal'],['/tools/academic-search-hub/','Academic Search Hub']
    ]));
    grid.appendChild(card('wpa-quick-start-institutional','Институционално · Institutional','Услуги и материјали за институции, дипломатски средини, академии и професионални тимови.',[
      ['/wpa-services.html','Институционални услуги'],['/wpa-briefings.html','Кратки стручни извештаи'],['/wpa-one-page-service-profile.html','Институционален профил'],['/partnerships/','Партнерства']
    ]));

    var advanced=document.createElement('details'); advanced.className='wpa-advanced-entry';
    var summary=document.createElement('summary'); summary.textContent='Напредна WPA технологија · Advanced WPA Technology';
    var links=document.createElement('div'); links.className='wpa-advanced-entry-links';
    [
      ['/wpaws/index.html','WPAWS'],['/#ai','Virtual Sande'],['/tools/wpa-five-engines.html','WPA Five Engines'],['/data/wpa-human-governed-agentic-institution-model.json','HGAIM'],['/data/wpa-institutional-operating-architecture.json','Technical Architecture']
    ].forEach(function(x){links.appendChild(makeLink(x[0],x[1]));});
    advanced.appendChild(summary); advanced.appendChild(links);

    container.appendChild(head); container.appendChild(grid); container.appendChild(advanced); section.appendChild(container);
    hero.insertAdjacentElement('afterend',section);
  }

  function correctVisibleFacts(){
    var stats=document.querySelectorAll('.hero-stats .stat-num');
    if(stats.length && String(stats[0].textContent||'').trim()==='25') stats[0].textContent='26';
    var labels=document.querySelectorAll('.hero-stats .stat-label');
    if(labels.length && /Публикации/i.test(String(labels[0].textContent||''))) labels[0].textContent='Публикации';

    document.querySelectorAll('p,li').forEach(function(el){
      var t=String(el.textContent||'');
      var doubled='со 25+ години институционално искуство со 25+ години институционално искуство';
      if(t.indexOf(doubled)!==-1) el.textContent=t.replace(doubled,'со 25+ години институционално искуство');
    });
  }

  function run(){
    if(!isHome()) return;
    ensureCss(); simplifyHero(); ensureQuickStart(); correctVisibleFacts();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('load',run,{once:true});
  setTimeout(run,500);
})();

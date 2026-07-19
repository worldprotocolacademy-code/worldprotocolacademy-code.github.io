/* WPA About interactive enhancer v1.0 */
(function(){
  'use strict';
  if(window.WPA_ABOUT_INTERACTIVE_LOADED)return;
  window.WPA_ABOUT_INTERACTIVE_LOADED=true;

  function text(el){return String(el&&el.textContent||'').trim();}
  function findAbout(){
    var nodes=document.querySelectorAll('section,main section,div.section');
    for(var i=0;i<nodes.length;i++){
      var t=text(nodes[i]);
      if(t.indexOf('Нов стандард во образованието за протокол')!==-1||t.indexOf('WPA Manifest')!==-1)return nodes[i];
    }
    return null;
  }
  function addStyles(){
    if(document.getElementById('wpa-about-interactive-style'))return;
    var s=document.createElement('style');
    s.id='wpa-about-interactive-style';
    s.textContent='.wpa-about-tools{margin-top:28px;padding:24px;border:1px solid rgba(201,168,76,.38);border-radius:18px;background:linear-gradient(180deg,#fff,#fbf8ee);box-shadow:0 14px 42px rgba(13,31,60,.10)}.wpa-about-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.wpa-about-tabs button{border:1px solid #d8cdb8;background:#fff;color:#0d1f3c;border-radius:999px;padding:10px 14px;font-weight:800;cursor:pointer}.wpa-about-tabs button.active{background:#0d1f3c;color:#fff;border-color:#0d1f3c}.wpa-about-panel{display:none}.wpa-about-panel.active{display:block}.wpa-about-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.wpa-about-card{border:1px solid #ddd3c3;border-radius:14px;padding:18px;background:#fff}.wpa-about-card strong{display:block;color:#0d1f3c;font-size:18px;margin-bottom:6px}.wpa-about-stat{font:700 30px/1 Georgia,serif;color:#9a7728}.wpa-about-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.wpa-about-actions a,.wpa-about-actions button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:11px 16px;font-weight:800;text-decoration:none;border:1px solid #0d1f3c;background:#0d1f3c;color:#fff;cursor:pointer}.wpa-about-actions .secondary{background:#fff;color:#0d1f3c}.wpa-about-note{margin-top:16px;padding:14px;border-left:4px solid #c9a84c;background:#fff9e7;color:#5a6577}.wpa-about-nav-link{font-weight:900!important;color:#9a7728!important}@media(max-width:700px){.wpa-about-tools{padding:18px}}';
    document.head.appendChild(s);
  }
  function addHeaderLink(){
    var list=document.querySelector('header .site-nav ul,header nav ul');
    if(!list||document.getElementById('wpaAboutNavItem'))return;
    var li=document.createElement('li');li.id='wpaAboutNavItem';
    var a=document.createElement('a');a.href='#wpa-about-live';a.textContent='За WPA';a.className='wpa-about-nav-link';
    li.appendChild(a);list.appendChild(li);
  }
  function build(section){
    if(document.getElementById('wpa-about-live'))return;
    section.id=section.id||'about';
    var box=document.createElement('div');box.id='wpa-about-live';box.className='wpa-about-tools';
    box.innerHTML='<div class="wpa-about-tabs" role="tablist"><button class="active" data-wpa-about-tab="manifest">WPA Manifest</button><button data-wpa-about-tab="position">Позиционирање</button><button data-wpa-about-tab="audience">За кого е WPA</button><button data-wpa-about-tab="evidence">Академска основа</button></div><div class="wpa-about-panel active" data-wpa-about-panel="manifest"><div class="wpa-about-grid"><article class="wpa-about-card"><strong>Образовна архитектура</strong><p>Структурирани programmes, scenario-based learning, assessment, verification и постепена прогресија.</p></article><article class="wpa-about-card"><strong>Авторска и истражувачка основа</strong><p>WPA ја спојува академската тежина со применетата институционална практика.</p></article><article class="wpa-about-card"><strong>AI-поддржано учење</strong><p>Virtual Sande, интелигентни патеки за ревизија и човечка контрола.</p></article></div></div><div class="wpa-about-panel" data-wpa-about-panel="position"><div class="wpa-about-grid"><article class="wpa-about-card"><strong>Независна платформа</strong><p>Не е државна дипломатска академија и не е универзитет што доделува академски степени.</p></article><article class="wpa-about-card"><strong>Certificate Programmes</strong><p>Структурирани non-degree professional pathways за извршни и институционални средини.</p></article><article class="wpa-about-card"><strong>Development / testing / pilot 2026</strong><p>Сите чувствителни, платежни и правно значајни функции остануваат под човечка контрола.</p></article></div></div><div class="wpa-about-panel" data-wpa-about-panel="audience"><div class="wpa-about-grid"><article class="wpa-about-card"><strong>Институции и јавен сервис</strong><p>Министерства, амбасади, протоколарни единици, општини и меѓународна соработка.</p></article><article class="wpa-about-card"><strong>Професионални и извршни улоги</strong><p>Раководители, PR професионалци, event teams, corporate representation и hospitality.</p></article><article class="wpa-about-card"><strong>Поширока публика</strong><p>Студенти, млади професионалци, академски кадар, идни тренери и лица за бон-тон и етикеција.</p></article></div></div><div class="wpa-about-panel" data-wpa-about-panel="evidence"><div class="wpa-about-grid"><article class="wpa-about-card"><span class="wpa-about-stat">5</span><strong>Монографии</strong><p>Авторска и стручна основа.</p></article><article class="wpa-about-card"><span class="wpa-about-stat">1</span><strong>Докторска дисертација</strong><p>Научно-истражувачка вертикала.</p></article><article class="wpa-about-card"><span class="wpa-about-stat">19</span><strong>Научни трудови и прилози</strong><p>Вкупна академска база од 25 публикации.</p></article><article class="wpa-about-card"><span class="wpa-about-stat">25+</span><strong>Години искуство</strong><p>Професионална и институционална применливост.</p></article></div></div><div class="wpa-about-actions"><a href="programmes.html">Отвори програми</a><a class="secondary" href="virtual-sande-ai.html">Прашај Virtual Sande</a><a class="secondary" href="papers.html">Публикации</a><a class="secondary" href="certification.html">Сертификација</a></div><div class="wpa-about-note">WPA е независна дигитална образовна, истражувачка и авторска платформа во развојна, тест и пробна фаза — 2026. Не е државна академија, универзитет или тело за акредитација.</div>';
    section.appendChild(box);
    box.addEventListener('click',function(e){var b=e.target.closest('[data-wpa-about-tab]');if(!b)return;var id=b.getAttribute('data-wpa-about-tab');box.querySelectorAll('[data-wpa-about-tab]').forEach(function(x){x.classList.toggle('active',x===b)});box.querySelectorAll('[data-wpa-about-panel]').forEach(function(p){p.classList.toggle('active',p.getAttribute('data-wpa-about-panel')===id)});});
  }
  function boot(){var section=findAbout();if(!section)return;addStyles();addHeaderLink();build(section);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

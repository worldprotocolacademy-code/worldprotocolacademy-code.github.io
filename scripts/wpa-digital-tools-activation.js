/* WPA Digital Tools Activation v1.0
 * Public discoverability layer for already-existing WPA educational tools.
 * Navigation only: no enrolment, payment, credential issuance, backend activation,
 * live media transport, automatic publication, identity processing or secret access.
 */
(function(){
  'use strict';
  if(window.WPA_DIGITAL_TOOLS_ACTIVATION_LOADED)return;
  window.WPA_DIGITAL_TOOLS_ACTIVATION_LOADED=true;

  var tools=[
    {
      icon:'🎥',
      title:'WPA Video',
      meta:'90 / 120 / 180 минути · 50 / 100 / 150 / 200 учесници',
      text:'WPA академска control-room алатка за agenda, timer, moderated Q&A, raise-hand queue, улоги и consent-based локално evidence recording.',
      href:'/wpa-video.html',
      cta:'Отвори WPA Video',
      note:'Development: реален multi-party media transport бара одобрен SFU/TURN и authentication backend.'
    },
    {
      icon:'🎓',
      title:'WPA Student Desk',
      meta:'Студентска патека · модули · ресурси · formative quiz',
      text:'Македонски student workspace со Virtual Sande поддршка, образовна патека и локални learning tools.',
      href:'/student-desk/',
      cta:'Отвори Student Desk',
      note:'Pilot: нема плаќање, правно запишување или автоматско издавање сертификат.'
    },
    {
      icon:'🗣️',
      title:'Diplomatic Protocol English Toolkit',
      meta:'Обраќања · титули · дипломатски формулации',
      text:'Практична Professional English алатка со Addressing & Title Builder и проверени модели за формална дипломатска комуникација.',
      href:'/professional-english.html#diplomatic-language',
      cta:'Отвори Toolkit',
      note:'Официјалните титули и локалната протоколарна практика секогаш се проверуваат пред употреба.'
    },
    {
      icon:'🏅',
      title:'WPA Credential Journey',
      meta:'Programme → assessment → demo verification → WPA Card',
      text:'Поврзана образовна патека низ програмите, score-band ориентацијата, demo verification и следниот професионален чекор.',
      href:'/certification.html#certificates',
      cta:'Отвори Credential Journey',
      note:'DEMO · NOT ISSUED. Нема live registry или автоматско credential issuance.'
    },
    {
      icon:'📊',
      title:'Diplomatic Analysis Lab',
      meta:'Scenario practicum · анализа · човечка проверка',
      text:'Практична лабораторија за дипломатски и протоколарни сценарија, поврзана со WPA Video и Virtual Sande.',
      href:'/wpaws/diplomatic-analysis-lab/',
      cta:'Отвори Analysis Lab',
      note:'Јавни извори и образовна анализа; нема разузнавачка, надзорна или оперативна функција.'
    },
    {
      icon:'🏳️',
      title:'Protocol Symbols Lab',
      meta:'Знамиња · химни · организации · протоколарни симболи',
      text:'WPA лабораторија за проверка и изучување национални и институционални симболи, со пребарување и образовни алатки.',
      href:'/wpaws/protocol-symbols/',
      cta:'Отвори Symbols Lab',
      note:'Изворите и формалната употреба на симболите се проверуваат пред официјална примена.'
    },
    {
      icon:'🤖',
      title:'WPA Multi-AI Command Center',
      meta:'Компаративна AI лабораторија · human-in-the-loop',
      text:'Контролирана средина за споредба на AI одговори и работа со повеќе системи без автономно официјално одлучување.',
      href:'/multi-ai-command-center.html',
      cta:'Отвори Multi-AI Lab',
      note:'AI помага; човекот проверува и одлучува.'
    }
  ];

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  function addStyles(){
    if(document.getElementById('wpaDigitalToolsActivationStyle'))return;
    var s=document.createElement('style');
    s.id='wpaDigitalToolsActivationStyle';
    s.textContent='\
#wpa-digital-tools{padding:78px 0;background:#f8f4ee;border-top:1px solid #d8cdb8;border-bottom:1px solid #d8cdb8}\
#wpa-digital-tools .wpa-tools-head{max-width:900px;margin-bottom:28px}\
#wpa-digital-tools .wpa-tools-label{display:inline-block;color:#9a7728;font-weight:900;font-size:12px;letter-spacing:.6px;text-transform:uppercase;margin-bottom:8px}\
#wpa-digital-tools h3{margin:0 0 12px;color:#0d1f3c;font:700 clamp(28px,3vw,40px)/1.15 Georgia,serif}\
#wpa-digital-tools .wpa-tools-lead{margin:0;color:#5a6577;font-size:16px;line-height:1.7}\
#wpa-digital-tools .wpa-tools-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}\
#wpa-digital-tools .wpa-tool-card{display:flex;flex-direction:column;min-height:100%;padding:22px;border:1px solid #ddd3c3;border-radius:18px;background:#fff;color:#1a1a2e;box-shadow:0 8px 24px rgba(13,31,60,.07)}\
#wpa-digital-tools .wpa-tool-icon{font-size:28px;margin-bottom:10px}\
#wpa-digital-tools .wpa-tool-card h4{margin:0 0 7px;color:#0d1f3c;font:700 20px/1.2 Georgia,serif}\
#wpa-digital-tools .wpa-tool-meta{font-size:12px;font-weight:800;color:#9a7728;margin-bottom:10px}\
#wpa-digital-tools .wpa-tool-card p{margin:0 0 12px;color:#5a6577;font-size:14px;line-height:1.6}\
#wpa-digital-tools .wpa-tool-note{margin-top:auto!important;padding-top:10px;border-top:1px solid #eee5d7;font-size:12px!important}\
#wpa-digital-tools .wpa-tool-cta{display:inline-flex;align-items:center;justify-content:center;margin-top:14px;padding:10px 14px;border-radius:999px;background:#0d1f3c;color:#fff;font-weight:800;font-size:13px;text-decoration:none}\
#wpaVideoHomeCard{border:2px solid #c9a84c!important;background:linear-gradient(180deg,#fffdf7,#fff8e7)!important}\
#wpaVideoHomeCard .wpa-primary-badge{display:inline-block;margin-bottom:9px;padding:5px 9px;border-radius:999px;background:#0d1f3c;color:#f4d697;font-size:11px;font-weight:900;letter-spacing:.4px}\
@media(max-width:980px){#wpa-digital-tools .wpa-tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\
@media(max-width:640px){#wpa-digital-tools{padding:56px 0}#wpa-digital-tools .wpa-tools-grid{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }

  function enhanceSessions(){
    var sessions=document.getElementById('sessions');
    if(!sessions||document.getElementById('wpaVideoHomeCard'))return;
    var grid=sessions.querySelector('.g3');
    if(!grid)return;
    var link=document.createElement('a');
    link.id='wpaVideoHomeCard';
    link.href='/wpa-video.html';
    link.style.cssText='text-decoration:none;display:block;height:100%';
    link.innerHTML='<div class="card" style="height:100%;cursor:pointer"><span class="wpa-primary-badge">WPA PRIMARY · DEVELOPMENT CLASSROOM</span><h4>🎥 WPA Video</h4><p>90/120/180 минути · facilitator console · moderated Q&A · role links · 50–200 учесници.</p><span style="display:inline-block;margin-top:14px;font-weight:900;color:#0d1f3c">Отвори WPA Video →</span><p style="margin-top:12px;font-size:12px;color:#5a6577">Meet, Zoom и Webex остануваат fallback канали. Live multi-party transport е следна backend фаза.</p></div>';
    grid.insertBefore(link,grid.firstChild);
  }

  function addHub(){
    if(document.getElementById('wpa-digital-tools'))return;
    var anchor=document.getElementById('sessions')||document.getElementById('ai');
    if(!anchor||!anchor.parentNode)return;
    var sec=document.createElement('section');
    sec.id='wpa-digital-tools';
    sec.innerHTML='<div class="container"><div class="wpa-tools-head"><span class="wpa-tools-label">WPA DIGITAL CAMPUS · VERIFIED TOOLS</span><h3>Дигитални алатки и академски лаборатории на WPA-Институтот</h3><p class="wpa-tools-lead">Еден јасен влез кон веќе изградените WPA алатки. Се активира само навигацијата и discoverability; чувствителните функции остануваат во development/pilot режим и под човечка контрола.</p></div><div class="wpa-tools-grid">'+tools.map(function(t){return '<article class="wpa-tool-card"><div class="wpa-tool-icon" aria-hidden="true">'+esc(t.icon)+'</div><h4>'+esc(t.title)+'</h4><div class="wpa-tool-meta">'+esc(t.meta)+'</div><p>'+esc(t.text)+'</p><p class="wpa-tool-note">'+esc(t.note)+'</p><a class="wpa-tool-cta" href="'+esc(t.href)+'">'+esc(t.cta)+' →</a></article>';}).join('')+'</div></div>';
    anchor.parentNode.insertBefore(sec,anchor.nextSibling);
  }

  function addNav(){
    var nav=document.querySelector('header .site-nav ul,header nav ul');
    if(!nav||document.getElementById('wpaDigitalToolsNav'))return;
    var li=document.createElement('li');
    li.id='wpaDigitalToolsNav';
    li.innerHTML='<a href="#wpa-digital-tools">WPA Tools</a>';
    nav.appendChild(li);
  }

  function boot(){addStyles();enhanceSessions();addHub();addNav();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

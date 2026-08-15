/* WPA Digital Tools Activation v1.2
 * Public discoverability layer for already-existing WPA educational and research tools.
 * Navigation only: no enrolment, payment, credential issuance, backend activation,
 * live media transport, automatic publication, identity processing or secret access.
 */
(function(){
  'use strict';
  if(window.WPA_DIGITAL_TOOLS_ACTIVATION_LOADED)return;
  window.WPA_DIGITAL_TOOLS_ACTIVATION_LOADED=true;

  var tools=[
    ['learning','PUBLIC','🎥','WPA Video','90 / 120 / 180 минути · 50 / 100 / 150 / 200 учесници','WPA академска control-room алатка за agenda, timer, moderated Q&A, raise-hand queue, улоги и consent-based локално evidence recording.','/wpa-video.html','Отвори WPA Video','Development: реален multi-party media transport бара одобрен SFU/TURN и authentication backend.'],
    ['learning','PUBLIC','🎓','WPA Student Desk','Студентска патека · модули · ресурси · formative quiz','Македонски student workspace со Virtual Sande поддршка, образовна патека и локални learning tools.','/student-desk/','Отвори Student Desk','Pilot: нема плаќање, правно запишување или автоматско издавање сертификат.'],
    ['learning','PUBLIC','🗣️','Diplomatic Protocol English Toolkit','Обраќања · титули · дипломатски формулации','Практична Professional English алатка со Addressing & Title Builder и модели за формална дипломатска комуникација.','/professional-english.html#diplomatic-language','Отвори Toolkit','Официјалните титули и локалната протоколарна практика секогаш се проверуваат пред употреба.'],
    ['learning','DEMO','🏅','WPA Credential Journey','Programme → assessment → demo verification → WPA Card','Поврзана образовна патека низ програмите, score-band ориентацијата, demo verification и следниот професионален чекор.','/certification.html#certificates','Отвори Credential Journey','DEMO · NOT ISSUED. Нема live registry или автоматско credential issuance.'],
    ['learning','PUBLIC','⚙️','WPA Five Engines','10 интерактивни алатки · Protocol Score · Simulator · Risk Meter','Збир од интерактивни едукативни алатки за протокол, дипломатија, ризик, сценарија и референтни податоци.','/tools/wpa-five-engines.html','Отвори Five Engines','Едукативни резултати; не се лиценца, официјална проценка или институционална одлука.'],
    ['learning','PUBLIC','⚜️','WPA Digital Pavilion','10 инструменти · 3 тематски крила','Билингвален влез кон Protocol Compass, Institute Passport, Virtual Tour, Protocol Clock, Calendar, Glossary, Quiz и други WPA инструменти.','/tools/wpa-digital-pavilion/','Отвори Digital Pavilion','Информативни и едукативни инструменти; сите тврдења остануваат проверливи и корективни.'],
    ['learning','DEMO','🧭','WPAWS Lessons Learned 360','11-stage case analysis · professional prevention framework','Founder-supervised demonstration package што претвора protocol-sensitive cases во структурирана анализа: context, error, principle, classification, consequences, response, corrective standard, message, lessons и prevention.','/wpaws/lessons-learned-360/','Отвори Lessons Learned 360','Demo Edition v1.1: образовна и аналитичка методологија; секој реален случај бара сопствена проверка на факти и контекст.'],

    ['research','PUBLIC','📊','Diplomatic Analysis Lab','Scenario practicum · анализа · човечка проверка','Практична лабораторија за дипломатски и протоколарни сценарија, поврзана со WPA Video и Virtual Sande.','/wpaws/diplomatic-analysis-lab/','Отвори Analysis Lab','Јавни извори и образовна анализа; нема разузнавачка, надзорна или оперативна функција.'],
    ['research','PUBLIC','🏳️','Protocol Symbols Lab','Знамиња · химни · организации · протоколарни симболи','WPA лабораторија за проверка и изучување национални и институционални симболи, со пребарување и образовни алатки.','/wpaws/protocol-symbols/','Отвори Symbols Lab','Изворите и формалната употреба на симболите се проверуваат пред официјална примена.'],
    ['research','STAGING','🔎','WPA Academic Search Hub','34 извори · legal-safe external discovery · traceability','Академско пребарување и source-traceability hub со external-search пристап без scraping на paywalled/login извори.','/tools/academic-search-hub/','Отвори Search Hub','STAGING READY: human academic verification required; не е production RAG ingestion engine.'],
    ['research','PUBLIC','📐','WPA Protocolometry Center','Мерење · споредбена анализа · методолошка рамка','Методолошки центар што ги поврзува WPA Watch, Academic Search, Journal Watch и Virtual Sande преку јавни извори и човечка ревизија.','/protocolometry-center.html','Отвори Protocolometry','Public-source only; мерењата и digest-ите остануваат проверливи и отворени за корекција.'],
    ['research','PUBLIC','📡','WPA Watch','RSS/Atom public-source candidate monitoring','Правно-безбеден monitoring console за јавни RSS/Atom сигнали од протокол, дипломатија, комуникација, безбедност и академски метаподатоци.','/tools/wpa-watch/','Отвори WPA Watch','Секој запис е candidate/unverified до човечка проверка.'],
    ['research','STAGING','🧭','WPA Journal Watch','Editorial topic candidates · human review','Editorial intelligence layer што создава topic candidates и briefs, без автоматско научно објавување.','/journal/watch/','Отвори Journal Watch','STAGING READY: submission, peer review, ethics review и editorial approval остануваат човечки.'],

    ['media','PUBLIC','🎙️','WPA Audio Media Engine','Audiobook · voice workflow · protocol scenarios · live-room governance','Командна палуба за аудио и медиумска продукција со јасни consent, governance и Phase 2 граници.','/audio-media-engine.html','Отвори Audio Media Engine','Phase 1 static engine; WebRTC, biometric voice и backend функции не се активирани.'],
    ['media','DEVELOPMENT','🎬','WPA Audio Video Creator Engine v9','20 agent stages · 200 WPA scenarios · delivery bundle','Локален creator workbench за scripts, prompts, SOP, audio/video packages, avatar directions, editing plan, live-room governance и QA export.','/ai/wpa-audio-video-creator-engine-v9-final-functional.html','Отвори Creator Engine','Локален production workbench; не тврди автоматско повикување на надворешни AI сервиси или production rendering backend.'],
    ['media','PUBLIC','🎼','WPA Audio Vault','Anthem verification · ceremonial audio · source discipline','Verification hub за национални химни и церемонијален звук со петчекорна проверка, source discipline и WPA Audio Log методологија.','/wpaws/audio-vault/','Отвори Audio Vault','Не хостира аудио без јасни права; официјалниот извор, верзијата, траењето и резервната копија се проверуваат пред употреба.'],

    ['ai','PUBLIC','⚜️','Virtual Sande AI Lab','Academic protocol assistant · Digital Library · source discipline','WPA академски протоколарен асистент со source tags, Digital Library и legal boundary.','/virtual-sande-ai.html','Отвори Virtual Sande','Образовна и академска ориентација; не е официјален правен, дипломатски или безбедносен совет.'],
    ['ai','SIMULATION','🤖','WPA Multi-AI Command Center','7 AI advisor roles · consensus · local simulation','Контролирана средина за споредба на AI-perspectives и consensus workflow без real API calls во сегашниот режим.','/ai/','Отвори Multi-AI Lab','SIMULATION ONLY: не внесувај лични, службени, доверливи или класифицирани податоци.']
  ];

  var groupNames={
    learning:'Учење и студентски алатки',
    research:'Истражување и академска инфраструктура',
    media:'Медиумска и продукциска лабораторија',
    ai:'AI и асистивни системи'
  };
  var statusClass={PUBLIC:'public',DEMO:'demo',STAGING:'staging',DEVELOPMENT:'development',SIMULATION:'simulation'};

  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function addStyles(){
    if(document.getElementById('wpaDigitalToolsActivationStyle'))return;
    var s=document.createElement('style');
    s.id='wpaDigitalToolsActivationStyle';
    s.textContent='#wpa-digital-tools{padding:78px 0;background:#f8f4ee;border-top:1px solid #d8cdb8;border-bottom:1px solid #d8cdb8}#wpa-digital-tools .wpa-tools-head{max-width:930px;margin-bottom:30px}#wpa-digital-tools .wpa-tools-label{display:inline-block;color:#9a7728;font-weight:900;font-size:12px;letter-spacing:.6px;text-transform:uppercase;margin-bottom:8px}#wpa-digital-tools h3{margin:0 0 12px;color:#0d1f3c;font:700 clamp(28px,3vw,40px)/1.15 Georgia,serif}#wpa-digital-tools .wpa-tools-lead{margin:0;color:#5a6577;font-size:16px;line-height:1.7}.wpa-tools-group{margin-top:34px}.wpa-tools-group h4{font:700 24px/1.2 Georgia,serif;color:#0d1f3c;margin:0 0 14px}.wpa-tools-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.wpa-tool-card{display:flex;flex-direction:column;min-height:100%;padding:22px;border:1px solid #ddd3c3;border-radius:18px;background:#fff;color:#1a1a2e;box-shadow:0 8px 24px rgba(13,31,60,.07)}.wpa-tool-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.wpa-tool-icon{font-size:28px}.wpa-tool-status{font-size:10px;font-weight:900;letter-spacing:.5px;padding:5px 8px;border-radius:999px;border:1px solid #d8cdb8;background:#fbf8f3;color:#5a6577}.wpa-tool-status.public{color:#1f6a45;border-color:#9fc8b2;background:#f2fbf6}.wpa-tool-status.staging,.wpa-tool-status.development{color:#8a6518;border-color:#d7c080;background:#fff9e8}.wpa-tool-status.simulation,.wpa-tool-status.demo{color:#69457e;border-color:#c4acd2;background:#faf4fd}.wpa-tool-card h5{margin:12px 0 7px;color:#0d1f3c;font:700 20px/1.2 Georgia,serif}.wpa-tool-meta{font-size:12px;font-weight:800;color:#9a7728;margin-bottom:10px}.wpa-tool-card p{margin:0 0 12px;color:#5a6577;font-size:14px;line-height:1.6}.wpa-tool-note{margin-top:auto!important;padding-top:10px;border-top:1px solid #eee5d7;font-size:12px!important}.wpa-tool-cta{display:inline-flex;align-items:center;justify-content:center;margin-top:14px;padding:10px 14px;border-radius:999px;background:#0d1f3c;color:#fff;font-weight:800;font-size:13px;text-decoration:none}#wpaVideoHomeCard{border:2px solid #c9a84c!important;background:linear-gradient(180deg,#fffdf7,#fff8e7)!important}#wpaVideoHomeCard .wpa-primary-badge{display:inline-block;margin-bottom:9px;padding:5px 9px;border-radius:999px;background:#0d1f3c;color:#f4d697;font-size:11px;font-weight:900;letter-spacing:.4px}@media(max-width:980px){.wpa-tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){#wpa-digital-tools{padding:56px 0}.wpa-tools-grid{grid-template-columns:1fr}}';
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

  function card(t){
    return '<article class="wpa-tool-card"><div class="wpa-tool-top"><div class="wpa-tool-icon" aria-hidden="true">'+esc(t[2])+'</div><span class="wpa-tool-status '+esc(statusClass[t[1]]||'')+'">'+esc(t[1])+'</span></div><h5>'+esc(t[3])+'</h5><div class="wpa-tool-meta">'+esc(t[4])+'</div><p>'+esc(t[5])+'</p><p class="wpa-tool-note">'+esc(t[8])+'</p><a class="wpa-tool-cta" href="'+esc(t[6])+'">'+esc(t[7])+' →</a></article>';
  }

  function addHub(){
    if(document.getElementById('wpa-digital-tools'))return;
    var anchor=document.getElementById('sessions')||document.getElementById('ai');
    if(!anchor||!anchor.parentNode)return;
    var body=Object.keys(groupNames).map(function(g){
      var rows=tools.filter(function(t){return t[0]===g;});
      return '<section class="wpa-tools-group" aria-labelledby="wpa-tools-'+g+'"><h4 id="wpa-tools-'+g+'">'+esc(groupNames[g])+'</h4><div class="wpa-tools-grid">'+rows.map(card).join('')+'</div></section>';
    }).join('');
    var sec=document.createElement('section');
    sec.id='wpa-digital-tools';
    sec.innerHTML='<div class="container"><div class="wpa-tools-head"><span class="wpa-tools-label">WPA DIGITAL CAMPUS · VERIFIED TOOLS</span><h3>Дигитални алатки и академски лаборатории на WPA-Институтот</h3><p class="wpa-tools-lead">Еден јасен влез кон веќе изградените WPA алатки. Статусите PUBLIC, DEMO, STAGING, DEVELOPMENT и SIMULATION покажуваат колку е зрела секоја алатка. Се активира само јавната навигација и discoverability; чувствителните функции остануваат под човечка контрола.</p></div>'+body+'</div>';
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

  function boot(){
    addStyles();
    enhanceSessions();
    addHub();
    addNav();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

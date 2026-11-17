/* WPA shared page tools: translator stubs, WPAWS local engine, Institute command layer. */
(function(){
  'use strict';
  const PAGE=(document.documentElement&&document.documentElement.getAttribute('data-wpa-page'))||'';
  function $(id){return document.getElementById(id)}
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function val(id,d){const e=$(id);return e?String(e.value||e.textContent||d||'').trim():(d||'')}
  function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>alert('Copied.'));}else{prompt('Copy:',text)}}
  window.WPA_TRANSLATOR_LOADED=true;
  if(typeof window.setUILang!=='function') window.setUILang=function(lang){try{localStorage.setItem('wpa.language',lang||'mk')}catch(e){} document.documentElement.lang=lang||'mk'; document.dispatchEvent(new CustomEvent('wpa:lang-changed'));};
  if(typeof window.setAILang!=='function') window.setAILang=function(lang){try{localStorage.setItem('wpaws_ai_lang',lang||'mk')}catch(e){} window.curLang=lang||'mk';};
  function loadProfessionalContacts(){if(document.querySelector('script[data-wpa-professional-contacts]'))return;const s=document.createElement('script');s.src='/scripts/wpa-professional-contacts.js?v=20260722';s.defer=true;s.setAttribute('data-wpa-professional-contacts','true');document.head.appendChild(s)}
  function loadPublicSquare(){if(PAGE!=='passive-revenue'||document.getElementById('wpa-public-square-runtime'))return;const s=document.createElement('script');s.id='wpa-public-square-runtime';s.src='/scripts/wpa-public-square-runtime.js?v=20260827-1';s.defer=true;document.head.appendChild(s)}

  /* Institute Brief Builder v2 — pure, governed MK-first / EN-secondary renderer.
     locale, route and languageLabel are distinct. No automatic external transmission. */
  const WIC_COPY = Object.freeze({
    mk: Object.freeze({
      heading:'Бриф за WPA Институтот',
      purpose:'Намена',domain:'Област',language:'Јазик',route:'Страница',
      context:'Контекст',next:'Баран следен чекор',boundary:'Институционална граница',
      step:'Ве молиме потврдете ја соодветната WPA постапка, опфатот, ограничувањата за јавните извори и дозволениот следен чекор.',
      limitation:'WPA е независна дигитална образовна, истражувачка и авторска платформа во фаза на развој, тестирање и пилот-примена. Не е универзитет, државен орган, тело за акредитација или установа со овластување да доделува академски степени. Услугите, журналските одлуки, индексните исходи и сертификатите се одделни и под соодветна човечка контрола.',
      missing:'Не е наведено',
      purposes:{
        institutional:'Институционално барање',
        services:'Барање за услуги или обука',
        briefing:'Барање за стручен брифинг',
        correction:'Барање за исправка и доверба',
        opc2027:'Изразување интерес за OPC 2027',
        lecture:'Предлог за стручно предавање',
        journal:'Прашање за журнал или публикација'
      },
      domains:{
        protocol:'Протокол',
        diplomacy:'Дипломатија',
        communication:'Јавна комуникација и односи со јавност',
        security:'Безбедносни студии',
        research:'Истражување и индексна методологија',
        education:'Студентско биро и образование'
      }
    }),
    en: Object.freeze({
      heading:'WPA Institute Brief',
      purpose:'Purpose',domain:'Domain',language:'Language',route:'Page',
      context:'Context',next:'Requested next step',boundary:'Institutional boundary',
      step:'Please confirm the appropriate WPA route, scope, public-source boundaries and permitted follow-up procedure.',
      limitation:'WPA is an independent digital educational, research and authorial platform in development, testing and pilot use. It is not a university, government body, accreditation body or degree-granting institution. Services, journal decisions, index outcomes and certificate issuance are separate and remain subject to appropriate human oversight.',
      missing:'Not provided',
      purposes:{
        institutional:'Institutional inquiry',
        services:'Services / training inquiry',
        briefing:'Professional briefing inquiry',
        correction:'Correction / trust request',
        opc2027:'OPC 2027 expression of interest',
        lecture:'Practitioner lecture proposal',
        journal:'Journal / publication inquiry'
      },
      domains:{
        protocol:'Protocol',
        diplomacy:'Diplomacy',
        communication:'Public communication / PR',
        security:'Security studies',
        research:'Research / index methodology',
        education:'Student Desk / education'
      }
    })
  });
  function describeInstituteBriefLocale(input) {
    const locale = input === 'en' ? 'en' : 'mk';
    return Object.freeze({
      locale:locale,
      route:locale === 'mk' ? '/institute.html' : '/en/institute.html',
      languageLabel:locale === 'mk' ? 'Македонски' : 'English'
    });
  }
  function renderInstituteBrief(input) {
    const data = input || {};
    const fields = describeInstituteBriefLocale(data.locale);
    const cp = WIC_COPY[fields.locale];
    const purpose = cp.purposes[data.purpose] || cp.purposes.institutional;
    const domain = cp.domains[data.domain] || cp.domains.protocol;
    const context = String(data.context || '').trim() || cp.missing;
    const output = [
      cp.heading,'',
      cp.purpose+': '+purpose,
      cp.domain+': '+domain,
      cp.language+': '+fields.languageLabel,
      cp.route+': '+fields.route,
      '',cp.context+':',context,
      '',cp.next+':',cp.step,
      '',cp.boundary+':',cp.limitation
    ].join('\\n');
    return Object.freeze({locale:fields.locale,route:fields.route,languageLabel:fields.languageLabel,purpose:purpose,domain:domain,text:output});
  }
  window.WPAInstituteBriefCore = Object.freeze({render:renderInstituteBrief,describeLocale:describeInstituteBriefLocale});

  /* ========================= INSTITUTE COMMAND LAYER ========================= */
  function installInstitute(){
    if(PAGE!=='institute'||$('wpaInstituteCommandLayer')) return;
    const style=document.createElement('style');
    style.id='wpa-institute-command-style';
    style.textContent=`
      #wpaInstituteCommandLayer{background:#081328;color:#fbf8ee;padding:44px 20px;border-top:2px solid #c9a84c;border-bottom:2px solid #c9a84c}
      #wpaInstituteCommandLayer .wic-wrap{max-width:1180px;margin:0 auto}
      #wpaInstituteCommandLayer .wic-eyebrow{font:700 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#e3c878;margin-bottom:12px}
      #wpaInstituteCommandLayer h2{font-family:'Cormorant Garamond',Georgia,serif;color:#fbf8ee;font-size:clamp(30px,4vw,46px);font-weight:500;margin:0 0 12px}
      #wpaInstituteCommandLayer p{color:rgba(251,248,238,.78);line-height:1.65}
      .wic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:24px 0}
      .wic-card{background:rgba(255,255,255,.045);border:1px solid rgba(201,168,76,.28);border-radius:14px;padding:16px}
      .wic-card b{display:block;color:#e3c878;font:800 12px/1.3 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
      .wic-card span{display:block;color:rgba(251,248,238,.78);font-size:14px;line-height:1.5}
      .wic-card a{color:#e3c878;font-weight:800;text-decoration:none}
      .wic-tool{background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.32);border-radius:18px;padding:18px;margin-top:20px}
      .wic-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:12px 0}
      .wic-field label{display:block;color:#e3c878;font:800 12px/1.2 Inter,system-ui,sans-serif;margin-bottom:5px}
      .wic-field select,.wic-field textarea,.wic-field input{width:100%;border:1px solid rgba(201,168,76,.35);background:#0d1f3c;color:#fbf8ee;border-radius:12px;padding:10px;font:14px/1.4 Inter,system-ui,sans-serif}
      .wic-field textarea{min-height:92px;resize:vertical}.wic-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
      .wic-btn{border:1px solid rgba(201,168,76,.45);background:transparent;color:#e3c878;border-radius:999px;padding:10px 14px;font:800 13px/1 Inter,system-ui,sans-serif;cursor:pointer;text-decoration:none}.wic-btn.primary{background:#c9a84c;color:#081328;border-color:#c9a84c}
      .wic-out{white-space:pre-wrap;background:#050b17;border:1px solid rgba(201,168,76,.24);border-radius:12px;padding:13px;margin-top:12px;color:#e9eef6;font:12.5px/1.55 ui-monospace,Consolas,monospace}
      .wic-notice{border-left:4px solid #c9a84c;background:rgba(255,255,255,.04);padding:12px 14px;border-radius:12px;color:rgba(251,248,238,.78);font-size:13px}
    `;
    document.head.appendChild(style);
    const sec=document.createElement('section');
    sec.id='wpaInstituteCommandLayer';
    sec.innerHTML=`<div class="wic-wrap">
      <div class="wic-eyebrow">WPA Institute Command Layer · v2.2</div>
      <h2>Институтска контролна палуба · Institute control deck</h2>
      <p>Брз оперативен слој за главната WPA Institute страница: идентитет, инструменти, trust layer, services, briefings, journal, student desk и AI roadmap. Овој панел е локален, не собира податоци и не менува институционален статус.</p>
      <div class="wic-grid">
        <div class="wic-card"><b>Identity</b><span>Развојна, тест и пробна фаза — независна дигитална образовна, истражувачка и авторска платформа.</span></div>
        <div class="wic-card"><b>Protocolometry</b><span>Работен поим во настанување, не универзално воспоставена дисциплина.</span></div>
        <div class="wic-card"><b>Instruments</b><span>PSPI/ИПММ за настани + WPA Institute Index за институции, со право на исправка.</span></div>
        <div class="wic-card"><b>REV7 Dataset</b><span>Master List REV7: 250 records · 249 external · 241 distinct · groups A-D, G-I, R.</span></div>
        <div class="wic-card"><b>Services</b><span><a href="wpa-services.html">Institutional Services</a> · <a href="wpa-briefings.html">Premium Briefings</a></span></div>
        <div class="wic-card"><b>Trust</b><span><a href="public-disclaimer.html">Public Disclaimer</a> · <a href="correction-request.html">Correction</a> · <a href="rights-takedown.html">Rights & Takedown</a></span></div><div class="wic-card"><b>Proactive Agent Fabric</b><span><a href="/data/wpa-proactive-agent-fabric.json">5 governed provider seats</a> · provider connectivity unverified · Human Gate retained.</span></div>
      </div>
      <div class="wic-notice"><strong>Boundary:</strong> WPA Institute is not a university, governmental institution, accreditation body, registered academy or degree-granting institution. Services and briefings are separate from Journal decisions, certificates and index outcomes.</div>
      <div class="wic-tool" id="wicTool"><h3 style="margin:0;color:#e3c878" id="wicHeading">Подготви бриф за Институтот</h3><p id="wicIntro">Локална подготовка на барање или изразување интерес. Нема испраќање без ваша одлука.</p>
        <div class="wic-form"><div class="wic-field"><label for="wicPurpose" id="wicPurposeLabel">Намена</label><select id="wicPurpose"><option value="institutional">Институционално барање</option><option value="services">Барање за услуги или обука</option><option value="briefing">Барање за стручен брифинг</option><option value="correction">Барање за исправка и доверба</option><option value="opc2027">Изразување интерес за OPC 2027</option><option value="lecture">Предлог за стручно предавање</option><option value="journal">Прашање за журнал или публикација</option></select></div><div class="wic-field"><label for="wicDomain" id="wicDomainLabel">Област</label><select id="wicDomain"><option value="protocol">Протокол</option><option value="diplomacy">Дипломатија</option><option value="communication">Јавна комуникација</option><option value="security">Безбедносни студии</option><option value="research">Истражување и индексна методологија</option><option value="education">Студентско биро и образование</option></select></div><div class="wic-field"><label for="wicBriefLocale" id="wicLocaleLabel">Јазик на брифот</label><select id="wicBriefLocale" aria-label="Јазик на брифот / Brief language"><option value="mk">Македонски</option><option value="en">English</option></select></div></div>
        <div class="wic-field"><label for="wicContext" id="wicContextLabel">Контекст</label><textarea id="wicContext" placeholder="Институција, намена, тема, јавни извори и посакуван следен чекор..."></textarea></div>
        <div class="wic-actions"><button class="wic-btn primary" id="wicBuild" type="button">Подготви бриф</button><button class="wic-btn" id="wicCopy" type="button">Копирај</button><a class="wic-btn" id="wicMail" href="mailto:info@worldprotocolacademy.mk">Отвори е-пошта</a></div><div class="wic-out" id="wicOut" role="status" aria-live="polite" tabindex="0"></div>
      </div>
    </div>`;
    const anchor=q('#identity')||q('.wpa-identity')||q('#wpa-public-tools-hub')||document.body.firstElementChild;
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(sec,anchor); else document.body.appendChild(sec);
    function refreshBriefUI() {
      const meta = describeInstituteBriefLocale(val('wicBriefLocale','mk'));
      const cp = WIC_COPY[meta.locale];
      $('wicHeading').textContent = meta.locale==='mk' ? 'Подготви бриф за Институтот' : 'Prepare an Institute brief';
      $('wicIntro').textContent = meta.locale==='mk' ? 'Локална подготовка на барање или изразување интерес. Нема испраќање без ваша одлука.' : 'Create a local inquiry or expression of interest. Nothing is sent without your action.';
      $('wicPurposeLabel').textContent=cp.purpose;
      $('wicDomainLabel').textContent=cp.domain;
      $('wicLocaleLabel').textContent=meta.locale==='mk' ? 'Јазик на брифот' : 'Brief language';
      $('wicContextLabel').textContent=cp.context;
      $('wicContext').placeholder=meta.locale==='mk' ? 'Институција, намена, тема, јавни извори и посакуван следен чекор...' : 'Organisation, purpose, public sources, topic and requested follow-up...';
      $('wicBuild').textContent=meta.locale==='mk'?'Подготви бриф':'Build brief';
      $('wicCopy').textContent=meta.locale==='mk'?'Копирај':'Copy brief';
      $('wicMail').textContent=meta.locale==='mk'?'Отвори е-пошта':'Open email';
      for (const option of $('wicPurpose').options) option.textContent=cp.purposes[option.value]||option.value;
      for (const option of $('wicDomain').options) option.textContent=cp.domains[option.value]||option.value;
      $('wicBriefLocale').setAttribute('aria-label',meta.locale==='mk'?'Јазик на брифот':'Brief language');
    }
    function build(){
      const result = renderInstituteBrief({
        locale:val('wicBriefLocale','mk'),
        purpose:val('wicPurpose','institutional'),
        domain:val('wicDomain','protocol'),
        context:val('wicContext','')
      });
      $('wicOut').textContent=result.text;
      $('wicMail').href='mailto:info@worldprotocolacademy.mk?subject='+encodeURIComponent((result.locale==='mk'?'WPA Институт — ':'WPA Institute — ')+result.purpose)+'&body='+encodeURIComponent(result.text);
      return result.text;
    }
    $('wicBriefLocale').addEventListener('change',function(){refreshBriefUI();build();});
    ['wicPurpose','wicDomain','wicContext'].forEach(id=>$(id).addEventListener('input',build));
    refreshBriefUI();
    $('wicBuild').onclick=build;$('wicCopy').onclick=()=>copy($('wicOut').textContent);build();
  }

  /* ========================= WPAWS LOCAL HEART ENGINE ========================= */
  function installWPAWS(){
    if(PAGE!=='wpaws') return;
    const agents={architect:['🏛️ Архитект','концепт, теза, методологија'],structure:['📐 Структура','структура и поглавја'],book:['📚 Книга','монографија и поглавје'],analyze:['🔬 Анализа','синтеза и извештај'],semantic:['🧠 Семантика','логичка кохерентност'],ppp:['📊 PPP','слајдови и говорни белешки'],protocol:['🎩 Протокол','пресеанс и церемонијал'],diplomacy:['🌍 Дипломатија','дипломатска анализа'],security:['🛡️ Безбедност','ризик и заштита'],stylist:['✨ Стилист','јазик и стил'],citations:['📖 Цитати','APA/Chicago'],editor:['✍️ Уредник','полирање'],reviewer:['🧐 Рецензент','академска рецензија'],plagiat:['🔍 Плагијат','интегритет'],press:['📰 WPA Press','соопштение'],sandeai:['👑 Санде AI','протоколарен одговор'],mentor:['🧠🏛️ Ментор-Архитект','финален суд']};
    function outbox(a){return $(a==='ppp'?'r-ppp-create':'r-'+a)}
    function text(){return val('topic')||val('stopic')||val('bkTitle')||val('pppTitle')||val('protDet')||val('dipDet')||val('secDet')||val('saiq')||val('edText')||'WPA тема'}
    function renderMarkdown(t){return esc(t).replace(/^# (.*)$/gm,'<h2>$1</h2>').replace(/^## (.*)$/gm,'<h3>$1</h3>').replace(/\n/g,'<br>')}
    function response(a,action){const topic=text(),meta=agents[a]||[a,'WPA'];let h=`# ${meta[0]}\n*${meta[1]} · WPAWS Local Heart Engine · Human review required*\n\n`;
      const common=`**Тема:** ${topic}\n\n- Јасна теза и проверливи јавни извори.\n- Академска дисциплина, човечка ревизија и правна/етичка претпазливост.\n- Без измислени цитати, статуси, акредитации или институционални врски.\n\n„Преговарањето е опционално. Протоколот е апсолутен.“`;
      if(a==='structure')return h+`## Структура\n1. Вовед\n2. Теоретска рамка\n3. Јавни извори и метод\n4. Анализа\n5. Македонска и компаративна перспектива\n6. Ризици и ограничувања\n7. Заклучок\n8. Единствена библиографија`;
      if(a==='ppp')return buildPPP();
      if(a==='protocol')return h+`## Протоколарна матрица\n- Домаќин, гостин, ранг, формат, место.\n- Пресеанс, седење, знамиња, химни, говори.\n- Plan B и тивка транзиција.\n- Финална проверка пред јавна изведба.`;
      if(a==='security')return h+`## Безбедносно-протоколарна рамка\n- Public-source контекст.\n- Event risk, reputational risk, protocol breach.\n- VIP movement, contingency, communication line.\n- Нема класифицирани или приватни податоци.`;
      if(a==='citations')return h+`## Citation readiness\n- Провери секој директен цитат.\n- Не измислувај DOI/ISBN.\n- Оддели библиографија на крај.\n- Обележи AI assistance ако постои.`;
      if(a==='plagiat')return h+`## Integrity check\nОва е локална листа за самопроверка, не вистинска интернет/база проверка. Провери атрибуција, парафрази, само-плагијат и согласност.`;
      return h+common;
    }
    function buildPPP(){const title=val('pppTitle','WPA presentation');const n=Math.min(Math.max(parseInt(val('pppSlides','12'),10)||12,8),40);window.pppSlides=[];for(let i=1;i<=n;i++)window.pppSlides.push({title:i===1?title:(i===n?'Заклучок и Q&A':'Слајд '+i),body:['Клучна порака','Пример / case','Протоколарна импликација']});window.pppIdx=0;if(typeof window.renderSlide==='function')try{window.renderSlide()}catch(e){}return `# PPP Local Engine · ${title}\n\nСлајдови: ${n}\n\n`+window.pppSlides.map((s,i)=>`[${i+1}] ${s.title}\n• ${s.body.join('\n• ')}`).join('\n\n')}
    window.swA=function(agent,btn){window.curAgent=agent;qa('.sp').forEach(p=>p.classList.remove('active'));const p=$('sp-'+agent);if(p)p.classList.add('active');qa('.abt').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');const sb=$('sb-agent');if(sb)sb.textContent=(agents[agent]||[agent])[0]};
    window.cc=function(agent,action){agent=agent||window.curAgent||'architect';const box=outbox(agent);if(box){box.innerHTML='<div class="thinking">⚜️ WPAWS Local Heart Engine...</div>';setTimeout(()=>{box.innerHTML=renderMarkdown(response(agent,action));},100)}};
    window.callClaude=async()=>response(window.curAgent||'architect');window.callGPT=async()=>response(window.curAgent||'architect');
    window.runAnalyze=()=>window.cc('analyze','full');window.runSemantic=()=>window.cc('semantic','full');
    window.startChain=function(kind){[['architect','full'],['structure','full'],['editor','full'],['reviewer','full'],['mentor','full']].forEach((x,i)=>setTimeout(()=>window.cc(x[0],x[1]),i*450))};window.chainRun=()=>window.startChain('new_paper');
    window.saveToMemory=function(){const a=window.curAgent||'architect',box=outbox(a),content=box?box.innerText.trim():'';if(!content)return alert('Нема содржина за зачувување.');let m=[];try{m=JSON.parse(localStorage.getItem('wpaws_memory_v9')||'[]')}catch(e){}m.unshift({id:Date.now(),agent:a,content,date:new Date().toLocaleString()});localStorage.setItem('wpaws_memory_v9',JSON.stringify(m.slice(0,50)));alert('Зачувано локално.')};
    window.exportAs=function(format){const a=window.curAgent||'architect',box=outbox(a),content=box?box.innerText.trim():'';if(!content)return alert('Нема содржина за export.');const blob=new Blob([content],{type:'text/plain'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='wpaws_'+a+'_'+Date.now()+'.txt';link.click();URL.revokeObjectURL(link.href)};
    document.addEventListener('DOMContentLoaded',()=>{const v=$('sb-ver');if(v)v.textContent='WPAWS 11.1.7 Heart Patch';});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{loadProfessionalContacts();loadPublicSquare();installInstitute();installWPAWS();}); else {loadProfessionalContacts();loadPublicSquare();installInstitute();installWPAWS();}
})();
/* WPA Global Translator + WPAWS Heart Patch
   Phase 1 safe local engine for /wpaws/. No external API keys required.
   It only activates on pages with data-wpa-page="wpaws". */
(function(){
  'use strict';
  const IS_WPAWS = document.documentElement && document.documentElement.getAttribute('data-wpa-page') === 'wpaws';

  function $(id){ return document.getElementById(id); }
  function val(id, fallback){
    const el = $(id); if(!el) return fallback || '';
    return String(el.value || el.textContent || fallback || '').trim();
  }
  function esc(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function md(text){
    let s = esc(text || '');
    s = s.replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>').replace(/^# (.*)$/gm,'<h1>$1</h1>');
    s = s.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/^- (.*)$/gm,'<li>$1</li>').replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>').replace(/<\/ul>\s*<ul>/g,'');
    return s.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
  }
  function toast(icon,msg){
    try{ if(typeof window.toast === 'function'){ window.toast(icon||'⚜️', msg||'Готово'); return; } }catch(e){}
    console.log('[WPAWS]', icon||'', msg||'');
  }

  // Small compatibility translator stub. The full site translator may override this elsewhere.
  window.WPA_TRANSLATOR_LOADED = true;
  if(typeof window.setUILang !== 'function'){
    window.setUILang = function(lang){ try{localStorage.setItem('wpaws_ui_lang', lang || 'mk');}catch(e){} document.documentElement.lang = lang || 'mk'; };
  }
  if(typeof window.setAILang !== 'function'){
    window.setAILang = function(lang){ try{localStorage.setItem('wpaws_ai_lang', lang || 'mk');}catch(e){} window.curLang = lang || 'mk'; };
  }
  if(!IS_WPAWS) return;

  const AGENTS = {
    architect:['🏛️ Архитект','Концепт • теза • методологија'],
    structure:['📐 Структура','Хиерархија • поглавја • логика'],
    book:['📚 Книга','Монографија • поглавје • издаваштво'],
    analyze:['🔬 Анализа','Документ • синтеза • цитати'],
    semantic:['🧠 Семантика','Кохерентност • арка • логика'],
    ppp:['📊 PPP','Слајдови • белешки • Q&A'],
    protocol:['🎩 Протокол','Пресеанс • церемонијал • Виенска конвенција'],
    diplomacy:['🌍 Дипломатија','Билатерално • мултилатерално • стратегија'],
    security:['🛡️ Безбедност','SWOT • ризик • одбранбена дипломатија'],
    stylist:['✨ Стилист','Јазик • стил • Санде глас'],
    citations:['📖 Цитати','APA • Chicago • Smiljanov'],
    editor:['✍️ Уредник','Финален слој • полирање'],
    reviewer:['🧐 Рецензент','Академска рецензија • вердикт'],
    plagiat:['🔍 Плагијат','Интегритет • атрибуција'],
    press:['📰 WPA Press','Соопштение • медиумски пакет'],
    sandeai:['👑 Санде AI','Виртуелен протоколарен асистент'],
    mentor:['🧠🏛️ Ментор-Архитект','Конзистентност • ризик • финален суд']
  };

  const OUTBOX = { ppp:'r-ppp-create' };
  function boxFor(agent){ return $(OUTBOX[agent] || ('r-' + agent)); }
  function show(agent, text){
    const r = boxFor(agent); if(!r) return;
    r.innerHTML = md(text);
    const oa = $('oa-' + agent) || $('oa-ppp-create'); if(oa) oa.style.display = 'flex';
    try{ saveLast(agent, text); }catch(e){}
  }
  function currentTopic(){ return val('topic') || val('stopic') || val('bkTitle') || val('pppTitle') || val('protDet') || val('dipDet') || val('secDet') || val('saiq') || 'WPA тема'; }
  function pastedText(){ return val('edText') || val('revText') || val('plagText') || val('stText') || val('analyzeQ') || val('concept') || val('bkKeyPoints') || ''; }
  function bullets(lines){ return lines.map(x => '- ' + x).join('\n'); }
  function doctrine(){ return '„Преговарањето е опционално. Протоколот е апсолутен.“'; }

  function localEngine(agent, action){
    const topic = currentTopic();
    const text = pastedText();
    const [name, role] = AGENTS[agent] || [agent, 'WPA агент'];
    const head = `# ${name}\n*${role} · WPAWS Local Heart Engine · Human review required*\n\n`;
    if(agent === 'architect') return head + `## Академска поставеност\n**Тема:** ${topic}\n\n**Работна теза:** темата треба да се постави како однос меѓу протоколарен ред, институционална комуникација и проверлива јавна практика.\n\n## Истражувачки прашања\n${bullets(['Кој е централниот протоколарен или дипломатски проблем?','Кои јавни извори ја потврдуваат анализата?','Кој е научниот придонес во однос на постојната литература?','Како резултатот може да се примени во институционална практика?'])}\n\n## Методологија\nКомбинирај анализа на јавни извори, компаративна протоколарна анализа, студија на случај и нормативна рамка.\n\n## Следен чекор\nПренеси го концептот во агентот „Структура“.\n\n${doctrine()}`;
    if(agent === 'structure') return head + `## Предложена структура за: ${topic}\n\n1. Вовед: проблем, цел, методологија\n2. Теоретска рамка: протокол, дипломатија, комуникација, безбедност\n3. Институционален контекст и јавни извори\n4. Аналитички дел: клучни случаи и протоколарна логика\n5. Македонска и компаративна перспектива\n6. Ризици, ограничувања и human-review белешка\n7. Заклучок\n8. Единствена библиографија\n\n## QA\nСекоја глава треба да има теза, докази, пример и заклучок.`;
    if(agent === 'book') return head + `## Книжевно-академски draft\n**Наслов:** ${topic}\n\n### Вовед\nОва поглавје ја поставува темата како дел од WPA доктрината: протоколот не е декоративен додаток, туку систем на ред, достоинство и институционална предвидливост.\n\n### Главна разработка\n${text ? text.slice(0,900) : 'Поглавјето треба да се развие преку дефиниции, историски контекст, современи примери, македонска перспектива и применлива методологија.'}\n\n### Заклучок\nФиналната верзија треба да се прошири со јавни извори, цитати и унифицирана библиографија на крајот.`;
    if(agent === 'analyze') return head + `## Аналитички извештај\n**Фокус:** ${topic}\n\n${bullets(['Главна тема: утврди ја централната теза и контекстот.','Клучни поими: протокол, јавна комуникација, дипломатски сигнал, институционална дисциплина.','Силни страни: систематичност, практична применливост, WPA перспектива.','Празнини: потребни се прецизни извори, датуми и ограничувања.','Препорака: додади резиме, методолошка белешка и библиографија.'])}`;
    if(agent === 'semantic') return head + `## Семантичка мапа\n**Тема:** ${topic}\n\n### Јадро\nПротоколарниот ред создава институционална смисла преку симболи, редослед и јазик.\n\n### Логичка нишка\nВовед → дефиниции → јавни извори → анализа → практична препорака → заклучок.\n\n### Потенцијални празнини\n${bullets(['Нејасно разграничување меѓу протокол и етикета.','Недоволно објаснета врска со дипломатија/безбедност.','Потреба од повеќе примери и транзиции.'])}`;
    if(agent === 'ppp') return buildPPP(action);
    if(agent === 'protocol') return head + `## Протоколарна анализа\n**Ситуација:** ${val('protDet') || topic}\n\n1. **Протоколарен факт:** утврди домаќин, гостин, ранг, формат и место.\n2. **Пресеанс:** провери функција, редослед на говорници, седење и симболи.\n3. **Ризик:** погрешен ред, симболичка нерамнотежа, медиумска погрешна порака.\n4. **Правилна постапка:** писмен протоколарен план, Plan B и одобрена церемонијална матрица.\n\n${doctrine()}`;
    if(agent === 'diplomacy') return head + `## Дипломатска анализа\n**Ситуација:** ${val('dipDet') || topic}\n\n${bullets(['Актери: идентификувај институции, претставници и ниво на контакт.','Интереси: што се сигнализира јавно и што се избегнува да се каже.','Формат: билатерален, мултилатерален, кризен или економски.','Препорака: неутрален дипломатски речник, јавни извори и проверка на датумите.'])}`;
    if(agent === 'security') return head + `## Безбедносно-протоколарна матрица\n**Контекст:** ${val('secDet') || topic}\n\n| Ризик | Веројатност | Последица | Мерка |\n|---|---:|---:|---|\n| Протоколарен пропуст | Средна | Репутациска штета | Check-list и rehearsal |\n| Погрешна јавна порака | Средна | Дипломатска чувствителност | Unified statement |\n| Настан без Plan B | Ниска/средна | Оперативен прекин | Contingency protocol |\n\n**Граница:** само јавна, наставна и институционална анализа; без класифицирани податоци.`;
    if(agent === 'stylist') return head + `## Стилска преработка\n${text ? text : 'Внеси текст за преработка.'}\n\n### WPA стилска насока\nТекстот треба да биде јасен, достоинствен, академски, без непотребно самофалење и со силна протоколарна реченица.\n\n### Подигната верзија\nВо протоколот, редот не е технички детал, туку јазик на институционална зрелост. Секој збор, симбол и редослед создаваат порака што мора да биде проверлива, прецизна и достоинствена.`;
    if(agent === 'citations') return head + `## Библиографски пакет · APA style\n\n- Smiljanov, S. (2021). *Дипломатијата, протоколот и безбедноста*.\n- Smiljanov, S. (2023). *Дигитална ера*.\n- Smiljanov, S. (2021). *Улогата на протоколот и одбранбената дипломатија...* Докторска дисертација, УКИМ.\n- Vienna Convention on Diplomatic Relations. (1961). United Nations.\n\n## Проверка\nНе измислувај DOI/ISBN. Секој запис мора да се верификува пред финална објава.`;
    if(agent === 'editor') return head + `## Уреднички слој\n${text ? text : 'Внеси текст за уредување.'}\n\n### Уреднички забелешки\n${bullets(['Скрати повторувања.','Додај транзиции меѓу пасуси.','Премести библиографија на крај.','Раздели личен тон од општа академска перспектива.'])}`;
    if(agent === 'reviewer') return head + `## Академска рецензија\n**Предмет:** ${topic}\n\n| Критериум | Оценка | Забелешка |\n|---|---:|---|\n| Теза | 4/5 | Потребна е поостра формулација |\n| Структура | 4/5 | Добра, но бара подлабоки глави |\n| Методологија | 3/5 | Да се објасни корпус и извори |\n| Научен придонес | 4/5 | Применливо во WPA рамка |\n\n**Вердикт:** доработка пред финална академска објава.`;
    if(agent === 'plagiat') return head + `## Извештај за интегритет\nОва е локална проверка, не вистинска споредба со Scholar/JSTOR/интернет бази.\n\n${bullets(['Провери дали секој директен цитат има извор.','Провери парафрази без атрибуција.','Означи сопствени претходни трудови за да се избегне само-плагијат.','Не тврди процент на плагијат без надворешна алатка.'])}\n\n**Препорака:** користи human review и вистинска база пред финален submission.`;
    if(agent === 'press') return head + `## Соопштение за медиуми\n**Наслов:** WPA развива протоколарна анализа и образовни алатки за јавна употреба\n\nWorld Protocol Academy продолжува со развој на едукативни и истражувачки инструменти за протокол, дипломатија, јавна комуникација и безбедносни студии. Платформата е во развојна фаза и има информативна, академска и авторска цел.\n\n**Клучна порака:** сите содржини подлежат на човечка проверка, корекција и изворна верификација.`;
    if(agent === 'sandeai') return head + `## Одговор на Санде AI\nПрашање: ${val('saiq') || topic}\n\nПротоколот мора да се разбере како дисциплина на ред, достоинство и институционална одговорност. Добриот протокол не импровизира кога е важно; тој предвидува, подготвува и го штити кредибилитетот на институцијата.\n\n${doctrine()}`;
    if(agent === 'mentor') return head + `## Менторски вердикт\n**Материјал:** ${text || topic}\n\n### Силни страни\n${bullets(['Јасна WPA насока.','Добра поврзаност меѓу протокол и академска употреба.','Потенцијал за наставна и институционална примена.'])}\n\n### Ризици\n${bullets(['Потребна е проверка на извори.','Да се избегне тврдење за акредитација/официјален статус.','Да се оддели авторски став од институционална анализа.'])}\n\n**Финален суд:** доработи и одобри по human review.`;
    return head + `Локален WPAWS одговор за ${topic}.`;
  }

  function buildPPP(action){
    const title = val('pppTitle','WPA презентација');
    const author = val('pppAuthor','World Protocol Academy');
    const n = Math.min(Math.max(parseInt(val('pppSlides','12'),10)||12,8),40);
    const ideas = (val('pppContent','протокол, дипломатија, јавна комуникација, безбедност') || '').split(/[\n.;]+/).map(x=>x.trim()).filter(Boolean);
    const slides=[];
    for(let i=1;i<=n;i++){
      const idea = ideas[(i-1)%ideas.length] || 'WPA protocol doctrine';
      slides.push({title:(i===1?title:i===n?'Заклучок и Q&A':`Слајд ${i}: ${idea.slice(0,48)}`), body:[idea,'Клучна порака за публиката','Пример / протоколарна импликација']});
    }
    window.pppSlides = slides; window.pppIdx = 0; renderPPPPreview();
    if(action==='speaker_notes' || action==='qa_prep' || action==='elevator'){
      const out = `# PPP Notes · ${title}\n\n**Автор:** ${author}\n\n## Говорни белешки\n${slides.slice(0,6).map((s,i)=>`- Slide ${i+1}: ${s.title} — нагласи ${s.body[0]}.`).join('\n')}\n\n## Q&A\n- Зошто оваа тема е важна?\n- Кои се ризиците ако протоколот се занемари?\n- Како WPA пристапот може да се примени практично?`;
      const notes = $('r-ppp-notes'); if(notes) notes.innerHTML = md(out); return out;
    }
    return `# PPP Local Engine · ${title}\n\n**Автор:** ${author}\n**Слајдови:** ${n}\n\n` + slides.map((s,i)=>`[СЛАЈД ${i+1}: ${s.title}]\n${s.body.map(b=>'• '+b).join('\n')}`).join('\n\n');
  }

  function renderPPPPreview(){
    const slides = window.pppSlides || [];
    const disp = $('slideDisplay'), ctr = $('slideCtr'), list = $('slideList');
    if(!slides.length){ if(ctr) ctr.textContent='0/0'; return; }
    const idx = Math.max(0, Math.min(window.pppIdx||0, slides.length-1)); window.pppIdx=idx;
    if(disp) disp.innerHTML = `<h2>${esc(slides[idx].title)}</h2><ul>${slides[idx].body.map(b=>'<li>'+esc(b)+'</li>').join('')}</ul>`;
    if(ctr) ctr.textContent = (idx+1)+'/'+slides.length;
    if(list) list.innerHTML = slides.map((s,i)=>`<button class="btn bgh bsm" onclick="goSlide(${i})">${i+1}. ${esc(s.title.slice(0,34))}</button>`).join(' ');
  }
  window.navSlide = function(dir){ const slides=window.pppSlides||[]; if(!slides.length) return; window.pppIdx=(window.pppIdx||0)+dir; if(window.pppIdx<0) window.pppIdx=slides.length-1; if(window.pppIdx>=slides.length) window.pppIdx=0; renderPPPPreview(); };
  window.goSlide = function(i){ window.pppIdx=i; renderPPPPreview(); };
  window.renderSlide = renderPPPPreview;
  window.buildPPPList = renderPPPPreview;

  const oldSwA = window.swA;
  window.swA = function(agent, btn){
    try{ if(typeof oldSwA === 'function') oldSwA(agent,btn); }catch(e){}
    window.curAgent = agent;
    document.querySelectorAll('.sp').forEach(p=>p.classList.remove('active'));
    const panel = $('sp-'+agent); if(panel) panel.classList.add('active');
    document.querySelectorAll('.abt').forEach(b=>b.classList.remove('active'));
    const ab = btn || $('abt-'+agent); if(ab) ab.classList.add('active');
    const sb = $('sb-agent'); if(sb) sb.textContent = (AGENTS[agent]||[agent])[0];
  };

  window.callClaude = async function(sys,prompt,tokens){ return localEngine(window.curAgent || 'architect', 'local'); };
  window.callGPT = async function(sys,prompt,tokens){ return localEngine(window.curAgent || 'architect', 'local'); };

  window.cc = async function(agent, action){
    agent = agent || window.curAgent || 'architect';
    window.curAgent = agent;
    const r = boxFor(agent); if(r) r.innerHTML = '<div class="thinking">⚜️ <strong>WPAWS Local Heart Engine...</strong></div>';
    setTimeout(()=>{ show(agent, localEngine(agent, action)); toast('✅','WPAWS агентот заврши локален излез.'); }, 120);
  };

  window.runAnalyze = async function(mode){ window.cc('analyze', mode || 'general'); };
  window.runSemantic = async function(mode){ window.cc('semantic', mode || 'full'); };

  window.chainRun = function(){ window.startChain('new_paper'); };
  window.startChain = function(chainId){
    const chains = {
      new_paper:[['architect','full'],['structure','generate'],['editor','full'],['reviewer','full'],['plagiat','full']],
      monograph:[['architect','full'],['book','write'],['stylist','sande_voice'],['citations','smiljanov'],['mentor','full']],
      protocol_doc:[['protocol','analyze'],['editor','academic_polish'],['press','write'],['mentor','verdict']],
      review_paper:[['plagiat','full'],['reviewer','full'],['editor','track_changes'],['mentor','verdict']],
      press_release:[['sandeai','ask'],['press','write'],['stylist','elevate'],['mentor','full']]
    };
    const steps = chains[chainId] || chains.new_paper; let i=0;
    function next(){ if(i>=steps.length){ toast('✅','Автоматскиот синџир е завршен.'); return; } const [a,act]=steps[i++]; window.swA(a,null); window.cc(a,act); setTimeout(next, 550); }
    toast('🔗','WPAWS синџир стартува локално.'); next();
  };

  function saveLast(agent,text){
    try{ window._wpaws_last = {agent, text, at:new Date().toISOString()}; }catch(e){}
  }

  window.saveToMemory = function(){
    const agent = window.curAgent || 'architect'; const r = boxFor(agent); const content = r ? r.innerText.trim() : '';
    if(!content || content.length < 10){ toast('⚠️','Нема содржина за зачувување.'); return; }
    const key='wpaws_memory_v9'; let mem=[]; try{mem=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
    mem.unshift({id:Date.now(),agent,agentName:(AGENTS[agent]||[agent])[0],content,date:new Date().toLocaleString()}); mem=mem.slice(0,50); localStorage.setItem(key,JSON.stringify(mem));
    if(typeof window.renderMemory==='function') try{window.renderMemory()}catch(e){}
    document.querySelectorAll('.mem-count-badge').forEach(el=>el.textContent=mem.length);
    toast('💾','Документот е зачуван локално.');
  };

  window.exportAs = function(format){
    const agent = window.curAgent || 'architect'; const r = boxFor(agent); const content = r ? r.innerText.trim() : '';
    if(!content){ toast('⚠️','Нема содржина за export.'); return; }
    const ext = format==='txt'?'txt':format==='json'?'json':'md';
    const data = ext==='json' ? JSON.stringify({agent,content,exportedAt:new Date().toISOString()},null,2) : content;
    const blob = new Blob([data], {type: ext==='json'?'application/json':'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`wpaws_${agent}_${Date.now()}.${ext}`; a.click(); URL.revokeObjectURL(a.href); toast('📤','Export готов.');
  };

  document.addEventListener('DOMContentLoaded', function(){
    const pill = $('aiPillTxt'); if(pill) pill.textContent = 'WPAWS Local Heart';
    const sbv = $('sb-ver'); if(sbv) sbv.textContent = 'WPAWS 11.1.7 Heart Patch';
    try{ document.querySelectorAll('.aibtn').forEach(b=>{ if((b.textContent||'').includes('Локален')) b.classList.add('active'); }); }catch(e){}
    toast('⚜️','WPAWS Heart Patch активен: 17 агенти работат локално.');
  });
})();

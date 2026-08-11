/* WPA Symbols Comprehensive Assistant v3.1 HYBRID
   World Protocol Academy · 2026-08-11

   Preserves the deterministic 197-entity Symbols/Flags engine and adds:
   - WPA logo branding in the launcher and assistant header
   - the visible bot name "WPA Symbols Expert Assistant"
   - resilient AI fallback for free-form questions via the existing WPA production workers
   - hard request timeouts so the widget never remains indefinitely in a thinking state

   Specialist symbol/flag/protocol logic remains first. The AI fallback is used only
   when the local WPA engine returns its generic scope message or no useful answer.
*/
(function(){
  'use strict';

  var previous = null;
  var chatBusy = false;
  var chatHistory = [];
  var LOGO_URL = '../../logo.png';
  var AI_ENDPOINTS = [
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask',
    'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask'
  ];

  function s(v){ return String(v == null ? '' : v); }
  function n(v){ return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}°²:.,><=+-]+/gu,' ').replace(/\s+/g,' ').trim(); }
  function rows(){ return Array.isArray(window.worldData) ? window.worldData : []; }
  function mk(q){ return /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q)) || window.WPA_CHAT_LANG !== 'en'; }
  function num(v){ return Number(s(v).replace(/[^0-9.]/g,'')) || 0; }
  function country(q){
    var x = n(q);
    return rows().find(function(c){
      return x.indexOf(n(c.n)) >= 0 || new RegExp('(^|\\s)'+n(c.id)+'($|\\s)').test(x);
    }) || null;
  }
  function days(c){
    var a = Array.isArray(window.nationalHolidays) ? window.nationalHolidays : [];
    return a.filter(function(h){ return h && h.countryId === c.id; });
  }
  function eagle(c){ return window.flagsWithEagles && window.flagsWithEagles[c.id]; }
  function instr(c){ return window.instrumentalAnthems && window.instrumentalAnthems[c.id]; }
  function fact(c){ return window.funFacts && window.funFacts[c.id]; }
  function header(t){ return '◆ WPA WORLD STATE & PROTOCOL ENGINE · ' + t; }

  function profile(c,isMk){
    var d = days(c), i = instr(c), e = eagle(c);
    return [
      header(isMk ? 'ЦЕЛОСЕН ПРОФИЛ' : 'COMPREHENSIVE PROFILE'),
      '🌍 ' + c.n + ' (' + s(c.id).toUpperCase() + ')',
      (isMk ? '🏙️ Главен град: ' : '🏙️ Capital: ') + s(c.cap || '—'),
      (isMk ? '🗺️ Континент / регион: ' : '🗺️ Continent / region: ') + s(c.continent || '—'),
      (isMk ? '📍 Геолокација / координати: ' : '📍 Geolocation / coordinates: ') + s(c.g || '—'),
      (isMk ? '👥 Население: ' : '👥 Population: ') + s(c.pop || '—'),
      (isMk ? '📐 Површина: ' : '📐 Area: ') + s(c.area || '—'),
      (isMk ? '⛏️ Природни и рудни ресурси: ' : '⛏️ Natural and mineral resources: ') + s(c.r || '—'),
      (isMk ? '🏳️ Знаме: ' : '🏳️ Flag: ') + s(c.f || '—'),
      (isMk ? '🎼 Химна: ' : '🎼 Anthem: ') + (i ? s(i.name || i.title || c.anthem) : (c.anthem ? 'WPA code: ' + c.anthem : '—')),
      (isMk ? '🎵 Инструментална ознака: ' : '🎵 Instrumental marker: ') + (i ? (isMk ? 'да' : 'yes') : (isMk ? 'не е посебно означено во активниот слој' : 'not specially marked in active layer')),
      (isMk ? '🦅 Орел на знамето: ' : '🦅 Eagle on flag: ') + (e ? (isMk ? 'да — ' : 'yes — ') + s(e) : (isMk ? 'не е означено како потврден пример' : 'not marked as a confirmed example')),
      (isMk ? '📅 Национален ден: ' : '📅 National day: ') + (d.length ? d.map(function(x){ return s(x.date || ((x.month || '') + '-' + (x.day || ''))) + ' — ' + s(x.title || x.titleMk || ''); }).join('; ') : (isMk ? 'нема активен запис' : 'no active record')),
      fact(c) ? (isMk ? '💡 WPA факт: ' : '💡 WPA fact: ') + fact(c) : '',
      isMk
        ? '⚖️ Правило: недостапните полиња не ги претпоставувам; за официјална употреба временски чувствителните податоци се проверуваат повторно.'
        : '⚖️ Rule: missing fields are not inferred; time-sensitive data should be reconfirmed for official use.'
    ].filter(Boolean).join('\n');
  }

  function field(c,q,isMk){
    if(/координат|геолокац|location|geolocation/.test(q)) return '📍 ' + c.n + ': ' + s(c.g || '—');
    if(/ресурс|рудн|богатств|mineral|resources/.test(q)) return '⛏️ ' + c.n + ': ' + s(c.r || '—');
    if(/население|population/.test(q)) return '👥 ' + c.n + ': ' + s(c.pop || '—');
    if(/површина|големина|area|size/.test(q)) return '📐 ' + c.n + ': ' + s(c.area || '—');
    if(/главен град|capital/.test(q)) return '🏙️ ' + c.n + ': ' + s(c.cap || '—');
    if(/континент|continent/.test(q)) return '🗺️ ' + c.n + ': ' + s(c.continent || '—');
    if(/национален ден|national day|празник|holiday/.test(q)){
      var d = days(c);
      return '📅 ' + c.n + ': ' + (d.length ? d.map(function(x){ return s(x.date) + ' — ' + s(x.title || x.titleMk || ''); }).join('; ') : (isMk ? 'нема активен запис' : 'no active record'));
    }
    return null;
  }

  var resources = {
    gold:['злато','gold'], oil:['нафта','oil'], gas:['природен гас','natural gas'], coal:['јаглен','coal'],
    copper:['бакар','copper'], iron:['железо','iron'], diamonds:['дијамант','diamond'], uranium:['ураниум','uranium'],
    silver:['сребро','silver'], nickel:['никел','nickel'], phosphate:['фосфат','phosphate']
  };
  var symbols = {
    eagle:['орел','eagle'], lion:['лав','lion'], sun:['сонце','sun'], crescent:['полумес','crescent'],
    star:['ѕвезд','star'], cross:['крст','cross'], crown:['круна','crown'], sword:['сабја','меч','sword','sabre']
  };
  function hasAny(text,arr){
    var z = n(text);
    return arr.some(function(x){ return z.indexOf(n(x)) >= 0; });
  }

  function filtered(q,isMk){
    var all = rows().slice(), reasons = [];
    var continents = [
      ['африка','Африка'],['africa','Африка'],['азија','Азија'],['asia','Азија'],['европа','Европа'],['europe','Европа'],
      ['океанија','Океанија'],['oceania','Океанија'],['северна америка','Северна Америка'],['north america','Северна Америка'],
      ['јужна америка','Јужна Америка'],['south america','Јужна Америка']
    ];
    var ch = continents.find(function(x){ return q.indexOf(x[0]) >= 0; });
    if(ch){ all = all.filter(function(c){ return c.continent === ch[1]; }); reasons.push(ch[1]); }

    Object.keys(resources).some(function(k){
      if(hasAny(q,resources[k])){
        all = all.filter(function(c){ return hasAny(c.r,resources[k]); });
        reasons.push(k);
        return true;
      }
      return false;
    });

    Object.keys(symbols).some(function(k){
      if(hasAny(q,symbols[k])){
        all = all.filter(function(c){ return hasAny(c.f,symbols[k]) || (k === 'eagle' && !!eagle(c)); });
        reasons.push(k);
        return true;
      }
      return false;
    });

    if(/инструментал|instrumental|без текст/.test(q)){
      all = all.filter(function(c){ return !!instr(c); });
      reasons.push('instrumental anthem');
    }

    var m = q.match(/(?:над|over|more than|>)\s*([0-9][0-9.,]*)\s*(милион|million)?/);
    if(m && /површина|area|km|км/.test(q)){
      var t = Number(m[1].replace(/,/g,''));
      if(m[2]) t *= 1000000;
      all = all.filter(function(c){ return num(c.area) > t; });
      reasons.push('area > ' + t + ' km²');
    }

    if(/најголем|largest|biggest/.test(q) && /држав|country|површина|area/.test(q)){
      all.sort(function(a,b){ return num(b.area) - num(a.area); });
      all = all.slice(0,10);
      reasons.push('largest by area');
    }
    if(/најмал|smallest/.test(q) && /држав|country|површина|area/.test(q)){
      all.sort(function(a,b){ return num(a.area) - num(b.area); });
      all = all.slice(0,10);
      reasons.push('smallest by area');
    }
    if(/најмногу насел|largest population|most populous/.test(q)){
      all.sort(function(a,b){ return num(b.pop) - num(a.pop); });
      all = all.slice(0,10);
      reasons.push('population');
    }

    if(!reasons.length) return null;
    if(!all.length) return isMk ? 'Не најдов совпаѓања во активниот WPA dataset.' : 'No matches found in the active WPA dataset.';

    return [
      header(isMk ? 'CROSS-DATASET REASONING' : 'CROSS-DATASET REASONING'),
      (isMk ? 'Филтри: ' : 'Filters: ') + reasons.join(' · '),
      all.slice(0,30).map(function(c,i){
        return (i+1) + '. ' + c.n + ' — ' + c.cap + ' · ' + c.area + ' · ' + c.pop + (c.r ? ' · ' + c.r : '') + (c.f ? ' · ' + c.f : '');
      }).join('\n'),
      isMk
        ? 'Резултатот е детерминистички изведен од активните WPA полиња, без LLM претпоставки.'
        : 'Result is deterministically derived from active WPA fields without LLM guessing.'
    ].join('\n');
  }

  function reverse(q,isMk){
    if(!/(која држава|which country|кој ентитет|which entity)/.test(q)) return null;
    var a = rows().map(function(c){
      var sc = 0, w = [];
      if(c.cap && q.indexOf(n(c.cap)) >= 0){ sc += 7; w.push(c.cap); }
      Object.keys(symbols).forEach(function(k){
        if(hasAny(q,symbols[k]) && (hasAny(c.f,symbols[k]) || (k === 'eagle' && !!eagle(c)))){
          sc += 3;
          w.push(k);
        }
      });
      if(/инструментал|instrumental/.test(q) && instr(c)){ sc += 3; w.push('instrumental anthem'); }
      return {c:c,sc:sc,w:w};
    }).filter(function(x){ return x.sc > 0; }).sort(function(a,b){ return b.sc - a.sc; });

    if(!a.length) return null;
    return header('REVERSE ID') + '\n🎯 ' + a[0].c.n + '\n' + (isMk ? 'Траги: ' : 'Clues: ') + a[0].w.join(', ') + '\n' + a[0].c.f;
  }

  function installDeterministicLayer(){
    if(typeof window.wpaBotAnswer !== 'function'){
      setTimeout(installDeterministicLayer,80);
      return;
    }
    if(window.wpaBotAnswer.__wpaComprehensiveV31) return;

    previous = window.wpaBotAnswer;
    var fn = function(question){
      var q = n(question), isMk = mk(question);
      var rev = reverse(q,isMk);
      if(rev) return rev;

      var c = country(question);
      if(c){
        if(/кажи ми с[еè]|кажи ми сè|сè за|се за|целосен профил|complete profile|all about|country profile/.test(q)) return profile(c,isMk);
        var f = field(c,q,isMk);
        if(f) return f;
      }

      var list = filtered(q,isMk);
      if(list) return list;
      return previous(question);
    };

    fn.__wpaSymbolsV2 = true;
    fn.__wpaSymbolsV21 = true;
    fn.__wpaComprehensiveV3 = true;
    fn.__wpaComprehensiveV31 = true;
    window.wpaBotAnswer = fn;

    enhanceQuickTools();
    applyBranding();
    installHybridChat();
  }

  function enhanceQuickTools(){
    var p = document.getElementById('chatPanel');
    if(!p || document.getElementById('wpaComprehensiveQuickRow')) return;
    var base = p.querySelector('[onclick*="sendQuick"]');
    if(!base) return;

    var parent = base.parentElement;
    var row = document.createElement('div');
    row.id = 'wpaComprehensiveQuickRow';
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;';

    [
      ['🌍 Целосен профил','Кажи ми сè за Казахстан.'],
      ['⛏️ Ресурси','Кои држави во Африка имаат злато во ресурсите?'],
      ['📐 Најголеми','Кои се најголемите држави во Азија по површина?'],
      ['☀️ Симбол филтер','Кои знамиња имаат сонце?']
    ].forEach(function(x){
      var b = base.cloneNode(false);
      b.removeAttribute('id');
      b.textContent = x[0];
      b.setAttribute('onclick','sendQuick(' + JSON.stringify(x[1]) + ')');
      b.title = x[1];
      row.appendChild(b);
    });
    parent.appendChild(row);
  }

  function installBrandStyles(){
    if(document.getElementById('wpaSymbolsBrandStyles')) return;
    var st = document.createElement('style');
    st.id = 'wpaSymbolsBrandStyles';
    st.textContent = [
      '#chatToggleBtn.wpa-symbols-logo-launcher{width:66px!important;height:66px!important;border-radius:50%!important;padding:3px!important;overflow:hidden!important;background:#0a1628!important;border:2px solid #c9a84c!important;box-shadow:0 12px 34px rgba(8,19,40,.34)!important;display:flex!important;align-items:center!important;justify-content:center!important;}',
      '#chatToggleBtn.wpa-symbols-logo-launcher img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;display:block!important;}',
      '.wpa-symbols-brand-title{display:flex!important;align-items:center!important;gap:9px!important;min-width:0!important;}',
      '.wpa-symbols-header-logo{width:38px!important;height:38px!important;min-width:38px!important;border-radius:50%!important;object-fit:cover!important;border:1.5px solid #c9a84c!important;background:#0a1628!important;}',
      '.wpa-symbols-brand-copy{display:flex!important;flex-direction:column!important;min-width:0!important;line-height:1.12!important;}',
      '.wpa-symbols-brand-main{font-weight:700!important;letter-spacing:.2px!important;white-space:normal!important;}',
      '.wpa-symbols-brand-sub{font-size:10px!important;font-weight:500!important;opacity:.78!important;margin-top:3px!important;white-space:normal!important;}',
      '.wpa-symbols-typing{opacity:.72!important;font-style:italic!important;}',
      '@media(max-width:520px){#chatToggleBtn.wpa-symbols-logo-launcher{width:58px!important;height:58px!important}.wpa-symbols-header-logo{width:34px!important;height:34px!important;min-width:34px!important}.wpa-symbols-brand-main{font-size:12px!important}.wpa-symbols-brand-sub{font-size:9px!important}}'
    ].join('');
    document.head.appendChild(st);
  }

  function applyBranding(){
    installBrandStyles();

    var panel = document.getElementById('chatPanel');
    if(panel){
      var title = panel.querySelector('.wpa-chat-title');
      if(title && !title.dataset.wpaSymbolsBranded){
        title.dataset.wpaSymbolsBranded = '1';
        title.classList.add('wpa-symbols-brand-title');
        title.textContent = '';

        var img = document.createElement('img');
        img.src = LOGO_URL;
        img.alt = 'WPA';
        img.className = 'wpa-symbols-header-logo';

        var copy = document.createElement('span');
        copy.className = 'wpa-symbols-brand-copy';
        var main = document.createElement('span');
        main.className = 'wpa-symbols-brand-main';
        main.textContent = 'WPA Symbols Expert Assistant';
        var sub = document.createElement('span');
        sub.className = 'wpa-symbols-brand-sub';
        sub.textContent = 'Светска академија за протокол · World Protocol Academy';
        copy.appendChild(main);
        copy.appendChild(sub);
        title.appendChild(img);
        title.appendChild(copy);
      }

      var firstBot = panel.querySelector('.wpa-chat-msg.bot');
      if(firstBot && !firstBot.dataset.wpaHybridWelcome){
        firstBot.dataset.wpaHybridWelcome = '1';
        firstBot.textContent = window.WPA_CHAT_LANG === 'en'
          ? 'Welcome to WPA Symbols Expert Assistant. Ask about flags, coats of arms, state symbols, anthems, countries, protocol risks, Symbol DNA, Reverse ID — or ask a free-form question. Specialist WPA data is used first, with the WPA AI service as a fallback.'
          : 'Добредојдовте во WPA Symbols Expert Assistant. Прашајте за знамиња, грбови, државни симболи, химни, држави, протоколарни ризици, Symbol DNA, Reverse ID — или поставете слободно прашање. Прво се користи специјализираната WPA база, а потоа WPA AI како дополнителен слој.';
      }
    }

    var toggle = document.getElementById('chatToggleBtn');
    if(toggle && !toggle.dataset.wpaSymbolsLogo){
      toggle.dataset.wpaSymbolsLogo = '1';
      toggle.classList.add('wpa-symbols-logo-launcher');
      toggle.innerHTML = '';
      var logo = document.createElement('img');
      logo.src = LOGO_URL;
      logo.alt = 'WPA';
      toggle.appendChild(logo);
      toggle.title = 'WPA Symbols Expert Assistant';
      toggle.setAttribute('aria-label','Open WPA Symbols Expert Assistant');
    }
  }

  function isGenericScopeAnswer(answer){
    var z = n(answer);
    if(!z) return true;
    return z.indexOf('јас сум wpa protocol assistant') >= 0 ||
      z.indexOf('i am the wpa protocol assistant') >= 0 ||
      z.indexOf('прашај за држава знаме химна главен град географија') >= 0 ||
      z.indexOf('ask about countries flags anthems capitals geography') >= 0;
  }

  function answerFrom(data){
    if(!data) return '';
    var out = data.answer || data.response || data.reply || data.message || data.output || data.text ||
      (data.result && (data.result.answer || data.result.response || data.result.text)) || '';
    if(typeof out === 'string') return out.trim();
    if(out && typeof out.text === 'string') return out.text.trim();
    return '';
  }

  function withTimeout(url,options,ms){
    if(typeof AbortController === 'undefined') return fetch(url,options);
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); },ms);
    var opts = Object.assign({},options,{signal:controller.signal});
    return fetch(url,opts).finally(function(){ clearTimeout(timer); });
  }

  async function requestAI(question){
    var lang = window.WPA_CHAT_LANG === 'en' ? 'en' : 'mk';
    var payload = {
      message: question,
      question: question,
      query: question,
      lang: lang,
      language: lang,
      history: chatHistory.slice(-8),
      quality: '3layer_academic',
      context: 'World Protocol Academy · WPA Symbols Expert Assistant · public Protocol Symbols page. Answer the user directly in the requested language. Preserve strict distinctions between flag, coat of arms, emblem, seal, anthem and protocol practice. For time-sensitive or official-use claims, signal when primary-source verification is appropriate.'
    };

    var lastError = null;
    for(var i=0;i<AI_ENDPOINTS.length;i++){
      try{
        var response = await withTimeout(AI_ENDPOINTS[i],{
          method:'POST',
          mode:'cors',
          cache:'no-store',
          credentials:'omit',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify(payload)
        },7000);
        if(!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
        var answer = answerFrom(data);
        if(answer) return answer;
        throw new Error('Empty answer');
      }catch(err){
        lastError = err;
      }
    }
    throw lastError || new Error('WPA AI unavailable');
  }

  function addMsg(role,text,extraClass){
    var body = document.getElementById('chatBody');
    if(!body) return null;
    var div = document.createElement('div');
    div.className = 'wpa-chat-msg ' + role + (extraClass ? ' ' + extraClass : '');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function setChatBusy(v){
    chatBusy = !!v;
    var input = document.getElementById('chatInput');
    var send = document.querySelector('.wpa-chat-send');
    if(input) input.disabled = chatBusy;
    if(send) send.disabled = chatBusy;
  }

  async function answerHybrid(question){
    var local = '';
    try{
      if(typeof window.wpaBotAnswer === 'function') local = s(window.wpaBotAnswer(question)).trim();
    }catch(e){ local = ''; }

    if(local && !isGenericScopeAnswer(local)) return {text:local,source:'local'};

    try{
      var ai = await requestAI(question);
      if(ai) return {text:ai,source:'ai'};
    }catch(e){
      // Never leave the interface hanging. Fall through to an explicit local/technical response.
    }

    if(local) return {text:local,source:'local-fallback'};
    return {
      text: mk(question)
        ? 'WPA AI сервисот моментално не одговара. Специјализираните Symbols алатки остануваат активни; обидете се повторно за кратко.'
        : 'The WPA AI service is temporarily unavailable. The specialist Symbols tools remain active; please try again shortly.',
      source:'technical-fallback'
    };
  }

  function installHybridChat(){
    if(window.__WPA_SYMBOLS_HYBRID_CHAT_V31__) return;
    if(!document.getElementById('chatInput') || !document.getElementById('chatBody')){
      setTimeout(installHybridChat,100);
      return;
    }
    window.__WPA_SYMBOLS_HYBRID_CHAT_V31__ = true;

    window.sendChat = async function(){
      var input = document.getElementById('chatInput');
      if(!input || chatBusy) return;
      var q = input.value.trim();
      if(!q) return;

      addMsg('user',q);
      chatHistory.push({role:'user',content:q});
      input.value = '';
      setChatBusy(true);

      var typing = addMsg('bot',window.WPA_CHAT_LANG === 'en' ? 'WPA is thinking…' : 'WPA размислува…','wpa-symbols-typing');
      try{
        var result = await answerHybrid(q);
        if(typing && typing.parentNode) typing.parentNode.removeChild(typing);
        addMsg('bot',result.text);
        chatHistory.push({role:'assistant',content:result.text});
        chatHistory = chatHistory.slice(-12);
      }catch(e){
        if(typing && typing.parentNode) typing.parentNode.removeChild(typing);
        var err = window.WPA_CHAT_LANG === 'en'
          ? 'A temporary connection problem occurred. Please try again.'
          : 'Настана привремен проблем со поврзувањето. Обидете се повторно.';
        addMsg('bot',err);
      }finally{
        setChatBusy(false);
        if(input){ input.focus(); }
      }
    };

    window.sendQuick = function(q){
      var input = document.getElementById('chatInput');
      if(!input || chatBusy) return;
      input.value = s(q);
      window.sendChat();
    };

    var input = document.getElementById('chatInput');
    if(input && !input.dataset.wpaHybridKey){
      input.dataset.wpaHybridKey = '1';
      input.addEventListener('keydown',function(ev){
        if(ev.key === 'Enter' && !ev.shiftKey){
          ev.preventDefault();
          ev.stopImmediatePropagation();
          window.sendChat();
        }
      },true);
    }
  }

  function boot(){
    installDeterministicLayer();
    applyBranding();
    installHybridChat();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  setTimeout(boot,300);
  setTimeout(boot,1000);
  setTimeout(applyBranding,1800);

  document.addEventListener('click',function(ev){
    var t = ev.target;
    if(t && t.closest && t.closest('.wpa-chat-lang-buttons')) setTimeout(applyBranding,50);
  });
})();

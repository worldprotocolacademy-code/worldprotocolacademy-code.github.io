/* WPA Symbols Expert Assistant v4.0 HYBRID DOMAIN ENGINE
   World Protocol Academy · 2026-08-11

   Goals:
   1) Keep the deterministic WPA 197-entity Symbols/Flags tools first.
   2) Never stop at a generic "no matches" message when the question belongs to
      the Symbols domain; fall through to WPA AI instead.
   3) Give the AI layer a strong WPA Symbols Expert scope prompt covering flags,
      anthems, geography, GPS/coordinates, capitals, population, area, natural
      and mineral resources, national days, organizations, state symbols and
      protocol/ceremonial use.
   4) Preserve strict distinctions: flag != coat of arms != emblem/seal;
      officially instrumental/textless anthem != an instrumental performance.
   5) Never leave the user in an endless thinking state.
*/
(function(){
  'use strict';

  var previous = null;
  var chatBusy = false;
  var chatHistory = [];
  var LOGO_URL = '../../logo.png';

  /* Generic/legacy WPA AI first because the dedicated production endpoint has
     a deterministic symbols router in front of the AI. If that router has no
     local match, the second endpoint remains available as a fallback. */
  var AI_ENDPOINTS = [
    'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask',
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask'
  ];

  var SYMBOLS_EXPERT_PROMPT_MK = [
    'Ти си WPA Symbols Expert Assistant на World Protocol Academy.',
    'Одговарај директно и корисно на СИТЕ прашања што се поврзани со: државни и национални знамиња; историски и актуелни верзии на знамиња; бои, пропорции, елементи и симболи на знамињата; грбови, амблеми, печати и други државни симболи; национални химни, наслови, протоколарна употреба и разлика меѓу официјално инструментална/безтекстна химна и инструментална изведба; држави, главни градови, континенти и региони; географски и GPS/координатни податоци; население и површина; природни ресурси и рудни богатства; национални денови, државни празници и независност; меѓународни организации; protocol display/use на знамиња, химни и симболи; редослед, поставување, споредба, Reverse ID, Symbol DNA, Protocol Trap и Protocol Risk; како и други тесно поврзани факти за држави и нивната симболика.',
    'Не одбивај релевантно прашање само затоа што локалниот deterministic dataset нема пополнето поле. Во таков случај користи го WPA AI/retrieval знаењето и одговори со најдобрата достапна потврдена информација.',
    'Никогаш не мешај знаме со грб, амблем или печат. Не префрлај симбол од грбот на знамето ако не е навистина на знамето.',
    'Кај химни јасно разликувај официјално инструментална/безтекстна химна од химна што само се изведува инструментално во протоколарна практика.',
    'За временски чувствителни или официјално-правни тврдења кажи кога е потребна повторна проверка од примарен државен, дипломатски или законски извор.',
    'Одговарај на македонски освен ако корисникот избрал англиски.'
  ].join(' ');

  var SYMBOLS_EXPERT_PROMPT_EN = [
    'You are the WPA Symbols Expert Assistant of World Protocol Academy.',
    'Answer directly and usefully ALL questions related to: national and state flags; historical and current flag versions; flag colours, proportions, elements and symbols; coats of arms, emblems, seals and other state symbols; national anthems, titles, protocol use and the distinction between an officially instrumental/textless anthem and an instrumental performance; countries, capitals, continents and regions; geographic and GPS/coordinate data; population and area; natural and mineral resources; national days, state holidays and independence days; international organizations; protocol display/use of flags, anthems and symbols; ordering, placement, comparison, Reverse ID, Symbol DNA, Protocol Trap and Protocol Risk; and closely related country/symbol facts.',
    'Do not refuse a relevant question merely because the local deterministic dataset has an empty field. In that case use WPA AI/retrieval knowledge and provide the best available verified answer.',
    'Never confuse a flag with a coat of arms, emblem or seal, and never transfer a coat-of-arms symbol onto the flag unless it is actually present on the flag.',
    'For anthems, clearly distinguish an officially instrumental/textless anthem from an anthem that is merely performed instrumentally in protocol practice.',
    'For time-sensitive or official/legal claims, state when primary state, diplomatic or legal-source verification is appropriate.',
    'Answer in English when English is selected.'
  ].join(' ');

  function s(v){ return String(v == null ? '' : v); }
  function n(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}°²:.,><=+-]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function rows(){ return Array.isArray(window.worldData) ? window.worldData : []; }
  function isMk(question){
    return /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(question)) || window.WPA_CHAT_LANG !== 'en';
  }
  function num(v){ return Number(s(v).replace(/[^0-9.]/g,'')) || 0; }
  function country(question){
    var q = n(question);
    return rows().find(function(c){
      var name = n(c.n), id = n(c.id);
      return (name && q.indexOf(name) >= 0) || (id && new RegExp('(^|\\s)'+id+'($|\\s)').test(q));
    }) || null;
  }
  function nationalDays(c){
    var a = Array.isArray(window.nationalHolidays) ? window.nationalHolidays : [];
    return a.filter(function(h){ return h && h.countryId === c.id; });
  }
  function eagle(c){ return window.flagsWithEagles && window.flagsWithEagles[c.id]; }
  function instrumental(c){ return window.instrumentalAnthems && window.instrumentalAnthems[c.id]; }
  function fact(c){ return window.funFacts && window.funFacts[c.id]; }
  function header(t){ return '◆ WPA WORLD STATE & PROTOCOL ENGINE · ' + t; }

  function profile(c,mk){
    var d = nationalDays(c), i = instrumental(c), e = eagle(c);
    return [
      header(mk ? 'ЦЕЛОСЕН ПРОФИЛ' : 'COMPREHENSIVE PROFILE'),
      '🌍 ' + c.n + ' (' + s(c.id).toUpperCase() + ')',
      (mk ? '🏙️ Главен град: ' : '🏙️ Capital: ') + s(c.cap || '—'),
      (mk ? '🗺️ Континент / регион: ' : '🗺️ Continent / region: ') + s(c.continent || '—'),
      (mk ? '📍 Геолокација / координати: ' : '📍 Geolocation / coordinates: ') + s(c.g || '—'),
      (mk ? '👥 Население: ' : '👥 Population: ') + s(c.pop || '—'),
      (mk ? '📐 Површина: ' : '📐 Area: ') + s(c.area || '—'),
      (mk ? '⛏️ Природни и рудни ресурси: ' : '⛏️ Natural and mineral resources: ') + s(c.r || '—'),
      (mk ? '🏳️ Знаме: ' : '🏳️ Flag: ') + s(c.f || '—'),
      (mk ? '🎼 Химна: ' : '🎼 Anthem: ') + (i ? s(i.name || i.title || c.anthem) : (c.anthem ? 'WPA code: ' + c.anthem : '—')),
      (mk ? '🎵 Инструментална ознака: ' : '🎵 Instrumental marker: ') + (i ? (mk ? 'да' : 'yes') : (mk ? 'не е посебно означено во активниот локален слој' : 'not specially marked in the active local layer')),
      (mk ? '🦅 Орел на знамето: ' : '🦅 Eagle on flag: ') + (e ? (mk ? 'да — ' : 'yes — ') + s(e) : (mk ? 'не е означено како потврден пример во локалниот слој' : 'not marked as a confirmed example in the local layer')),
      (mk ? '📅 Национален ден: ' : '📅 National day: ') + (d.length ? d.map(function(x){ return s(x.date || ((x.month || '') + '-' + (x.day || ''))) + ' — ' + s(x.title || x.titleMk || ''); }).join('; ') : (mk ? 'нема активен локален запис' : 'no active local record')),
      fact(c) ? (mk ? '💡 WPA факт: ' : '💡 WPA fact: ') + fact(c) : '',
      mk
        ? '⚖️ WPA правило: за официјална употреба временски чувствителните податоци повторно се проверуваат од примарен извор.'
        : '⚖️ WPA rule: time-sensitive information should be reconfirmed from a primary source for official use.'
    ].filter(Boolean).join('\n');
  }

  function singleField(c,q,mk){
    if(/координат|геолокац|gps|location|geolocation/.test(q)) return '📍 ' + c.n + ': ' + s(c.g || '—');
    if(/ресурс|рудн|богатств|mineral|resources/.test(q)) return '⛏️ ' + c.n + ': ' + s(c.r || '—');
    if(/население|population/.test(q)) return '👥 ' + c.n + ': ' + s(c.pop || '—');
    if(/површина|големина|area|size/.test(q)) return '📐 ' + c.n + ': ' + s(c.area || '—');
    if(/главен град|capital/.test(q)) return '🏙️ ' + c.n + ': ' + s(c.cap || '—');
    if(/континент|continent|регион|region/.test(q)) return '🗺️ ' + c.n + ': ' + s(c.continent || '—');
    if(/национален ден|national day|празник|holiday/.test(q)){
      var d = nationalDays(c);
      if(!d.length) return null;
      return '📅 ' + c.n + ': ' + d.map(function(x){ return s(x.date) + ' — ' + s(x.title || x.titleMk || ''); }).join('; ');
    }
    return null;
  }

  var RESOURCE_GROUPS = {
    gold:['злато','gold'], oil:['нафта','oil'], gas:['природен гас','natural gas'], coal:['јаглен','coal'],
    copper:['бакар','copper'], iron:['железо','iron'], diamonds:['дијамант','diamond'], uranium:['ураниум','uranium'],
    silver:['сребро','silver'], nickel:['никел','nickel'], phosphate:['фосфат','phosphate']
  };
  var SYMBOL_GROUPS = {
    eagle:['орел','eagle'], lion:['лав','lion'], sun:['сонце','sun'], crescent:['полумес','crescent'],
    star:['ѕвезд','star'], cross:['крст','cross'], crown:['круна','crown'], sword:['сабја','меч','sword','sabre']
  };

  function hasAny(text,arr){
    var z = n(text);
    return arr.some(function(x){ return z.indexOf(n(x)) >= 0; });
  }

  function filtered(q,mk){
    var all = rows().slice(), reasons = [];
    var continents = [
      ['африка','Африка'],['africa','Африка'],['азија','Азија'],['asia','Азија'],['европа','Европа'],['europe','Европа'],
      ['океанија','Океанија'],['oceania','Океанија'],['северна америка','Северна Америка'],['north america','Северна Америка'],
      ['јужна америка','Јужна Америка'],['south america','Јужна Америка']
    ];

    var continentHit = continents.find(function(x){ return q.indexOf(x[0]) >= 0; });
    if(continentHit){
      all = all.filter(function(c){ return c.continent === continentHit[1]; });
      reasons.push(continentHit[1]);
    }

    Object.keys(RESOURCE_GROUPS).some(function(k){
      if(hasAny(q,RESOURCE_GROUPS[k])){
        all = all.filter(function(c){ return hasAny(c.r,RESOURCE_GROUPS[k]); });
        reasons.push(k);
        return true;
      }
      return false;
    });

    Object.keys(SYMBOL_GROUPS).some(function(k){
      if(hasAny(q,SYMBOL_GROUPS[k])){
        all = all.filter(function(c){ return hasAny(c.f,SYMBOL_GROUPS[k]) || (k === 'eagle' && !!eagle(c)); });
        reasons.push(k);
        return true;
      }
      return false;
    });

    if(/инструментал|instrumental|без текст|textless|without lyrics/.test(q)){
      all = all.filter(function(c){ return !!instrumental(c); });
      reasons.push('instrumental anthem');
    }

    var gt = q.match(/(?:над|over|more than|>)\s*([0-9][0-9.,]*)\s*(милион|million)?/);
    if(gt && /површина|area|km|км/.test(q)){
      var threshold = Number(gt[1].replace(/,/g,''));
      if(gt[2]) threshold *= 1000000;
      all = all.filter(function(c){ return num(c.area) > threshold; });
      reasons.push('area > ' + threshold + ' km²');
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

    /* CRITICAL v4 CHANGE:
       An empty deterministic result is NOT a final answer. Returning null makes
       the hybrid chat continue to the WPA AI/retrieval layer. */
    if(!all.length) return null;

    return [
      header(mk ? 'CROSS-DATASET REASONING' : 'CROSS-DATASET REASONING'),
      (mk ? 'Филтри: ' : 'Filters: ') + reasons.join(' · '),
      all.slice(0,30).map(function(c,i){
        return (i+1) + '. ' + c.n + ' — ' + s(c.cap || '—') + ' · ' + s(c.area || '—') + ' · ' + s(c.pop || '—') + (c.r ? ' · ' + c.r : '') + (c.f ? ' · ' + c.f : '');
      }).join('\n'),
      mk
        ? 'Резултатот е изведен од активните WPA полиња. За официјална употреба применете примарна проверка каде што е потребно.'
        : 'The result is derived from active WPA fields. Apply primary-source verification where required for official use.'
    ].join('\n');
  }

  function reverse(q,mk){
    if(!/(која држава|which country|кој ентитет|which entity)/.test(q)) return null;
    var scored = rows().map(function(c){
      var score = 0, clues = [];
      if(c.cap && q.indexOf(n(c.cap)) >= 0){ score += 7; clues.push(c.cap); }
      Object.keys(SYMBOL_GROUPS).forEach(function(k){
        if(hasAny(q,SYMBOL_GROUPS[k]) && (hasAny(c.f,SYMBOL_GROUPS[k]) || (k === 'eagle' && !!eagle(c)))){
          score += 3;
          clues.push(k);
        }
      });
      if(/инструментал|instrumental/.test(q) && instrumental(c)){
        score += 3;
        clues.push('instrumental anthem');
      }
      return {c:c,score:score,clues:clues};
    }).filter(function(x){ return x.score > 0; }).sort(function(a,b){ return b.score - a.score; });

    if(!scored.length) return null;
    return header('REVERSE ID') + '\n🎯 ' + scored[0].c.n + '\n' + (mk ? 'Траги: ' : 'Clues: ') + scored[0].clues.join(', ') + '\n' + s(scored[0].c.f || '');
  }

  function installDeterministicLayer(){
    if(typeof window.wpaBotAnswer !== 'function'){
      setTimeout(installDeterministicLayer,80);
      return;
    }
    if(window.wpaBotAnswer.__wpaSymbolsExpertV4) return;

    previous = window.wpaBotAnswer;
    var fn = function(question){
      var q = n(question), mk = isMk(question);
      var rev = reverse(q,mk);
      if(rev) return rev;

      var c = country(question);
      if(c){
        if(/кажи ми с[еè]|кажи ми сè|сè за|се за|целосен профил|complete profile|all about|country profile/.test(q)) return profile(c,mk);
        var direct = singleField(c,q,mk);
        if(direct) return direct;
      }

      var list = filtered(q,mk);
      if(list) return list;
      return previous(question);
    };

    fn.__wpaSymbolsV2 = true;
    fn.__wpaSymbolsV21 = true;
    fn.__wpaComprehensiveV3 = true;
    fn.__wpaComprehensiveV31 = true;
    fn.__wpaSymbolsExpertV4 = true;
    window.wpaBotAnswer = fn;

    enhanceQuickTools();
    applyBranding();
    installHybridChat();
  }

  function enhanceQuickTools(){
    var panel = document.getElementById('chatPanel');
    if(!panel || document.getElementById('wpaComprehensiveQuickRow')) return;
    var base = panel.querySelector('[onclick*="sendQuick"]');
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
          ? 'Welcome to WPA Symbols Expert Assistant. I answer questions across the full Symbols domain: flags, coats of arms, state symbols, anthems, countries, capitals, geography/GPS coordinates, population, area, natural and mineral resources, national days, organizations and protocol use. WPA structured data is used first; when it is insufficient, WPA AI/retrieval continues the answer.'
          : 'Добредојдовте во WPA Symbols Expert Assistant. Одговарам на прашања од целиот Symbols домен: знамиња, грбови, државни симболи, химни, држави, главни градови, географија/GPS координати, население, површина, природни и рудни богатства, национални денови, организации и протоколарна употреба. Прво ја користам структурираната WPA база, а кога таа не е доволна продолжувам со WPA AI/retrieval.';
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

  function isInsufficientAnswer(answer){
    var z = n(answer);
    if(!z) return true;
    return z.indexOf('јас сум wpa protocol assistant') >= 0 ||
      z.indexOf('i am the wpa protocol assistant') >= 0 ||
      z.indexOf('прашај за држава знаме химна главен град географија') >= 0 ||
      z.indexOf('ask about countries flags anthems capitals geography') >= 0 ||
      z.indexOf('не најдов совпаѓања во активниот wpa dataset') >= 0 ||
      z.indexOf('no matches found in the active wpa dataset') >= 0 ||
      z.indexOf('no matches were found in the active wpa dataset') >= 0 ||
      z.indexOf('не најдов доволно сигурен погодок') >= 0 ||
      z.indexOf('did not find a sufficiently reliable match') >= 0;
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

  function domainPrompt(question,lang){
    var q = n(question);
    var base = lang === 'en' ? SYMBOLS_EXPERT_PROMPT_EN : SYMBOLS_EXPERT_PROMPT_MK;
    var focus = '';

    if(/химн|anthem|инструментал|lyrics|текст/.test(q)){
      focus = lang === 'en'
        ? ' Focus especially on anthem status, title and protocol distinction between officially textless/instrumental status and instrumental performance.'
        : ' Посебно фокусирај се на статусот и насловот на химната и на протоколарната разлика меѓу официјално безтекстна/инструментална химна и инструментална изведба.';
    }else if(/знаме|flag|орел|eagle|симбол|symbol|грб|coat|emblem/.test(q)){
      focus = lang === 'en'
        ? ' Focus especially on exact flag content and do not transfer symbols from a coat of arms onto the flag.'
        : ' Посебно фокусирај се на точната содржина на знамето и не пренесувај симболи од грбот на знамето.';
    }else if(/ресурс|рудн|mineral|resource|богатств/.test(q)){
      focus = lang === 'en'
        ? ' Focus especially on natural/mineral resources and distinguish reserves, production and general resource presence when relevant.'
        : ' Посебно фокусирај се на природните и рудните ресурси и, кога е релевантно, разликувај резерви, производство и општо присуство на ресурс.';
    }else if(/координат|gps|географ|geograph|location|локац/.test(q)){
      focus = lang === 'en'
        ? ' Focus especially on geography and coordinates; state whether coordinates are approximate country-centre/reference coordinates when exact points are not specified.'
        : ' Посебно фокусирај се на географијата и координатите; ако не е наведена точна точка, означи дека координатите се референтни/приближни за државата.';
    }else if(/национален ден|national day|holiday|празник|independence|независност/.test(q)){
      focus = lang === 'en'
        ? ' Focus especially on the exact national-day occasion and date, and flag time-sensitive annual exceptions for verification.'
        : ' Посебно фокусирај се на точниот повод и датум на националниот ден и означи ако годишна промена бара повторна проверка.';
    }
    return base + focus;
  }

  async function requestAI(question){
    var lang = window.WPA_CHAT_LANG === 'en' ? 'en' : 'mk';
    var expertPrompt = domainPrompt(question,lang);
    var promptHistory = [{ role:'assistant', content: expertPrompt }].concat(chatHistory.slice(-6));

    var payload = {
      message: question,
      question: question,
      query: question,
      lang: lang,
      language: lang,
      history: promptHistory,
      context: expertPrompt,
      system_prompt: expertPrompt,
      instructions: expertPrompt,
      wpa_symbols_expert: true,
      quality: '3layer_academic'
    };

    var lastError = null;
    var lastInsufficient = '';

    for(var i=0;i<AI_ENDPOINTS.length;i++){
      try{
        var response = await withTimeout(AI_ENDPOINTS[i],{
          method:'POST',
          mode:'cors',
          cache:'no-store',
          credentials:'omit',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify(payload)
        },7500);

        if(!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
        var answer = answerFrom(data);
        if(answer && !isInsufficientAnswer(answer)) return answer;
        if(answer) lastInsufficient = answer;
      }catch(err){
        lastError = err;
      }
    }

    if(lastInsufficient) throw new Error('Only insufficient WPA answers returned');
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

    if(local && !isInsufficientAnswer(local)) return {text:local,source:'local'};

    try{
      var ai = await requestAI(question);
      if(ai) return {text:ai,source:'ai'};
    }catch(e){
      /* Do not hang. Explicitly fall through. */
    }

    if(local && !isInsufficientAnswer(local)) return {text:local,source:'local-fallback'};

    return {
      text: isMk(question)
        ? 'WPA AI/retrieval сервисот моментално не успеа да врати доволно сигурен одговор. Специјализираните Symbols алатки остануваат активни; обидете се повторно за кратко или наведете конкретна држава/симбол.'
        : 'The WPA AI/retrieval service did not return a sufficiently reliable answer at this moment. The specialist Symbols tools remain active; please try again shortly or name a specific country/symbol.',
      source:'technical-fallback'
    };
  }

  function installHybridChat(){
    if(window.__WPA_SYMBOLS_HYBRID_CHAT_V4__) return;
    if(!document.getElementById('chatInput') || !document.getElementById('chatBody')){
      setTimeout(installHybridChat,100);
      return;
    }
    window.__WPA_SYMBOLS_HYBRID_CHAT_V4__ = true;

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
        addMsg('bot',window.WPA_CHAT_LANG === 'en'
          ? 'A temporary connection problem occurred. Please try again.'
          : 'Настана привремен проблем со поврзувањето. Обидете се повторно.');
      }finally{
        setChatBusy(false);
        if(input) input.focus();
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

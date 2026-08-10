/* WPA Symbols Expert Assistant v2.0
   Purpose: upgrade the public Symbols assistant from simple lookup to
   reverse identification, comparison, expert challenges and protocol traps.
   Grounding: uses only data already exposed by the WPA Symbols page/runtime.
*/
(function(){
  'use strict';

  var previousAnswer = null;
  var challenge = null;

  function txt(v){ return String(v == null ? '' : v); }
  function norm(v){
    return txt(v).toLowerCase()
      .replace(/[.,;:!?()\[\]{}"'“”„]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function isMk(v){ return /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(txt(v)); }
  function lines(a){ return a.filter(Boolean).join('\n'); }

  function countries(){ return Array.isArray(window.worldData) ? window.worldData : []; }
  function eagleMap(){ return window.flagsWithEagles && typeof window.flagsWithEagles === 'object' ? window.flagsWithEagles : {}; }
  function instrumentalMap(){ return window.instrumentalAnthems && typeof window.instrumentalAnthems === 'object' ? window.instrumentalAnthems : {}; }
  function factsMap(){ return window.funFacts && typeof window.funFacts === 'object' ? window.funFacts : {}; }

  function countryById(id){
    return countries().find(function(c){ return norm(c.id) === norm(id); }) || null;
  }

  function countryMatches(q){
    var s = norm(q);
    return countries().filter(function(c){
      var n = norm(c.n);
      var id = norm(c.id);
      return (n && s.indexOf(n) >= 0) || (id && new RegExp('(^|\\s)'+id+'($|\\s)').test(s));
    });
  }

  function countryName(id){
    var c = countryById(id);
    return c ? c.n : txt(id).toUpperCase();
  }

  function mkHeader(title){ return '◆ WPA SYMBOL REASONING · ' + title; }
  function enHeader(title){ return '◆ WPA SYMBOL REASONING · ' + title; }

  function verifiedNote(mk){
    return mk
      ? 'WPA белешка: за официјален настан, временски чувствителните податоци повторно се потврдуваат од официјален државен или дипломатски извор.'
      : 'WPA note: for official-event use, time-sensitive data should be reconfirmed from an official state or diplomatic source.';
  }

  function answerEagles(mk, q){
    var map = eagleMap();
    var ids = Object.keys(map);
    if(!ids.length) return null;

    var matched = countryMatches(q);
    if(matched.length === 1){
      var c = matched[0];
      var d = map[c.id];
      if(d){
        return lines([
          mkHeader(mk ? 'ОРЕЛ НА ЗНАМЕ' : 'EAGLE ON FLAG'),
          '🦅 ' + c.n,
          mk ? 'Да — во активниот WPA симболички слој ова знаме е означено со орел.' : 'Yes — in the WPA symbol layer this flag is marked as containing an eagle.',
          txt(d),
          mk ? 'Protocol Trap: секогаш разликувај орел на самото знаме од орел што постои само во грбот/амблемот.' : 'Protocol Trap: always distinguish an eagle on the flag itself from an eagle appearing only in the coat of arms/emblem.',
          verifiedNote(mk)
        ]);
      }
      return lines([
        mkHeader(mk ? 'ОРЕЛ НА ЗНАМЕ' : 'EAGLE ON FLAG'),
        c.n,
        mk ? 'Во WPA мапата за орли оваа држава не е означена како потврден пример. Не заклучувам автоматски дека орел нема — потребна е проверка на конкретниот дизајн.' : 'This country is not marked as a confirmed example in the WPA eagle map. I will not automatically infer absence; the specific flag design should be checked.'
      ]);
    }

    return lines([
      mkHeader(mk ? 'ОБРАТНО ПРЕПОЗНАВАЊЕ' : 'REVERSE IDENTIFICATION'),
      mk ? '🦅 Потврдени WPA примери каде орелот е дел од знамето:' : '🦅 WPA-confirmed examples where an eagle is part of the flag:',
      ids.map(function(id){ return '• ' + countryName(id) + ' — ' + txt(map[id]); }).join('\n'),
      mk ? 'Сакаш потешко? Прашај: „Која од овие држави има двоглав орел?“ или наведи конкретна држава за Protocol Trap проверка.' : 'Want a harder version? Ask which of these uses a double-headed eagle, or name a country for a Protocol Trap check.'
    ]);
  }

  function answerInstrumental(mk, q){
    var map = instrumentalMap();
    var ids = Object.keys(map);
    if(!ids.length) return null;

    var matched = countryMatches(q);
    if(matched.length === 1){
      var c = matched[0];
      var d = map[c.id];
      if(d){
        return lines([
          mkHeader(mk ? 'ИНСТРУМЕНТАЛНА ХИМНА' : 'INSTRUMENTAL ANTHEM'),
          '🎼 ' + c.n,
          mk ? 'Да — WPA ја бележи како инструментална / без официјален вокален текст за протоколарната верзија.' : 'Yes — WPA records it as instrumental / without an official vocal text for the protocol version.',
          'Химна / Anthem: ' + txt(d.name || d.title || ''),
          txt(d.note || ''),
          verifiedNote(mk)
        ]);
      }
      return lines([
        mkHeader(mk ? 'ИНСТРУМЕНТАЛНА ХИМНА' : 'INSTRUMENTAL ANTHEM'),
        c.n,
        mk ? 'Не е означена како инструментална во WPA инструменталната мапа. Не давам негативен заклучок без проверка на официјалната химна.' : 'It is not marked as instrumental in the WPA instrumental map. I will not make a negative claim without checking the official anthem record.'
      ]);
    }

    return lines([
      mkHeader(mk ? 'ХИМНИ БЕЗ ОФИЦИЈАЛЕН ТЕКСТ' : 'ANTHEMS WITHOUT OFFICIAL LYRICS'),
      ids.map(function(id){
        var d = map[id] || {};
        return '• ' + countryName(id) + ' — ' + txt(d.name || d.title || '') + (d.note ? '\n  ' + txt(d.note) : '');
      }).join('\n'),
      mk ? 'Ова е одлична протоколарна разлика: „инструментална химна“ не значи дека никогаш не постоеле неофицијални текстови.' : 'Protocol distinction: “instrumental anthem” does not necessarily mean that unofficial lyrics have never existed.'
    ]);
  }

  var SYMBOL_SYNONYMS = {
    'dragon':['dragon','змеј'],
    'eagle':['eagle','орел'],
    'lion':['lion','лав'],
    'sun':['sun','сонце'],
    'moon':['moon','месечина'],
    'crescent':['crescent','полумесечина'],
    'star':['star','ѕвезда','ѕвезди'],
    'cross':['cross','крст'],
    'maple':['maple','јавор'],
    'cedar':['cedar','кедар'],
    'shield':['shield','штит'],
    'bird':['bird','птица'],
    'tree':['tree','дрво'],
    'coat of arms':['coat of arms','грб','амблем']
  };

  function detectSymbol(q){
    var s = norm(q);
    var keys = Object.keys(SYMBOL_SYNONYMS);
    for(var i=0;i<keys.length;i++){
      var k=keys[i];
      if(SYMBOL_SYNONYMS[k].some(function(x){ return s.indexOf(norm(x)) >= 0; })) return k;
    }
    return null;
  }

  function answerSymbolSearch(mk,q){
    var symbol = detectSymbol(q);
    if(!symbol || symbol === 'eagle') return null;
    var terms = SYMBOL_SYNONYMS[symbol].map(norm);
    var hits = countries().filter(function(c){
      var f = norm(c.f);
      return terms.some(function(t){ return f.indexOf(t)>=0; });
    }).slice(0,24);
    if(!hits.length){
      return lines([
        mkHeader(mk ? 'СИМБОЛ → ДРЖАВА' : 'SYMBOL → COUNTRY'),
        mk ? 'Не најдов доволно сигурен погодок во активните описи на знамињата за овој симбол.' : 'I did not find a sufficiently reliable match in the active flag descriptions for this symbol.',
        mk ? 'Пробај со: орел, лав, сонце, ѕвезди, крст, полумесечина, кедар, јаворов лист.' : 'Try: eagle, lion, sun, stars, cross, crescent, cedar, maple leaf.'
      ]);
    }
    return lines([
      mkHeader(mk ? 'СИМБОЛ → ДРЖАВА' : 'SYMBOL → COUNTRY'),
      (mk ? 'Најдени совпаѓања за симболот „' : 'Matches for the symbol “') + symbol + '”:',
      hits.map(function(c){ return '• ' + c.n + ' — ' + txt(c.f); }).join('\n'),
      mk ? 'Ова е reverse-identification пребарување низ активните WPA описи на знамињата.' : 'This is reverse-identification search across active WPA flag descriptions.'
    ]);
  }

  function answerCompare(mk,q){
    var matched = countryMatches(q);
    if(matched.length < 2) return null;
    var a=matched[0], b=matched[1];
    return lines([
      mkHeader(mk ? 'КОМПАРАТИВНА ПРОТОКОЛАРНА ЛЕЌА' : 'COMPARATIVE PROTOCOL LENS'),
      '⇆ ' + a.n + ' ↔ ' + b.n,
      (mk ? 'Главни градови: ' : 'Capitals: ') + a.cap + ' ↔ ' + b.cap,
      (mk ? 'Континент/регион: ' : 'Continent/region: ') + a.continent + ' ↔ ' + b.continent,
      (mk ? 'Знаме A: ' : 'Flag A: ') + a.f,
      (mk ? 'Знаме B: ' : 'Flag B: ') + b.f,
      mk ? 'WPA Protocol Lens: споредбата не е само визуелна — за официјална употреба се проверуваат точната верзија на знамето, пропорцијата, редоследот и церемонијалниот контекст.' : 'WPA Protocol Lens: comparison is not only visual — official use requires checking the exact flag version, proportion, order and ceremonial context.'
    ]);
  }

  function buildChallenge(mk){
    var eagleIds = Object.keys(eagleMap());
    var instIds = Object.keys(instrumentalMap());
    var pool=[];
    eagleIds.forEach(function(id){
      var c=countryById(id); if(c) pool.push({type:'eagle',answer:c.n,id:id,question: mk ? 'Која држава ја барам? Нејзиното знаме во WPA е означено со орел. Главниот град е ' + c.cap + '.' : 'Which country am I describing? Its flag is marked by WPA as containing an eagle. Its capital is ' + c.cap + '.'});
    });
    instIds.forEach(function(id){
      var c=countryById(id), d=instrumentalMap()[id]||{}; if(c) pool.push({type:'anthem',answer:c.n,id:id,question: mk ? 'Која држава/ентитет ја барам? Нејзината протоколарна химна е инструментална: ' + txt(d.name||d.title||'') + '.' : 'Which country/entity am I describing? Its protocol anthem is instrumental: ' + txt(d.name||d.title||'') + '.'});
    });
    if(!pool.length){
      var c=countries()[Math.floor(Math.random()*Math.max(1,countries().length))];
      if(c) pool.push({type:'capital',answer:c.n,id:c.id,question:mk?'Која држава има главен град '+c.cap+'?':'Which country has the capital '+c.cap+'?'});
    }
    challenge=pool[Math.floor(Math.random()*pool.length)]||null;
    window.WPA_SYMBOL_CHALLENGE=challenge;
    if(!challenge) return mk?'Нема достапен challenge во моментот.':'No challenge is available right now.';
    return lines([
      mkHeader(mk ? 'EXPERT CHALLENGE' : 'EXPERT CHALLENGE'),
      '🧩 ' + challenge.question,
      mk ? 'Одговори само со името. Потоа ќе ти кажам дали е точно и зошто.' : 'Reply with the name only. I will then tell you whether it is correct and why.'
    ]);
  }

  function checkChallenge(mk,q){
    if(!challenge) return null;
    var s=norm(q), answer=norm(challenge.answer);
    var correct=s===answer || s.indexOf(answer)>=0 || answer.indexOf(s)>=0;
    var result=correct
      ? lines([mkHeader('CHALLENGE RESULT'),'✅ ' + (mk?'Точно: ':'Correct: ') + challenge.answer, mk?'Одлично. Следно можам да ти дадам потежок reverse-identification или Protocol Trap.':'Excellent. I can give you a harder reverse-identification or Protocol Trap next.'])
      : lines([mkHeader('CHALLENGE RESULT'),'❌ ' + (mk?'Не е точно. Точниот одговор е: ':'Not quite. The correct answer is: ') + challenge.answer, mk?'Побарај „нов предизвик“ за следното прашање.':'Ask for a new challenge for the next question.']);
    challenge=null;
    window.WPA_SYMBOL_CHALLENGE=null;
    return result;
  }

  function protocolTrap(mk,q){
    var matched=countryMatches(q);
    if(matched.length===1){
      var c=matched[0], eagle=eagleMap()[c.id];
      return lines([
        mkHeader('PROTOCOL TRAP'),
        '⚖️ ' + c.n,
        eagle ? (mk?'Во WPA мапата орелот е означен како дел од знамето.':'In the WPA map, the eagle is marked as part of the flag.') : (mk?'Не ја мешај иконографијата на грбот со дизајнот на државното знаме. WPA нема да претпостави дека симбол од грбот автоматски се појавува и на знамето.':'Do not confuse coat-of-arms iconography with the design of the national flag. WPA will not assume that a coat-of-arms symbol also appears on the flag.'),
        mk?'Прашањето за протокол секогаш е: кој точен официјален симбол се користи, во која верзија и во каков церемонијален контекст?':'The protocol question is always: which exact official symbol, which version, and in what ceremonial context?'
      ]);
    }
    return lines([
      mkHeader('PROTOCOL TRAP'),
      mk?'⚖️ Пример: „Ако една држава има орел во грбот, дали тоа значи дека орелот е и на знамето?“ — Не. Грб и знаме се различни државни симболи и мора да се проверуваат одделно.' : '⚖️ Example: “If a state has an eagle in its coat of arms, does that mean the eagle is also on the flag?” — No. Coat of arms and flag are distinct state symbols and must be checked separately.',
      mk?'Наведи држава и ќе направам конкретен Protocol Trap.' : 'Name a country and I will run a specific Protocol Trap.'
    ]);
  }

  function help(mk){
    return lines([
      mkHeader(mk ? 'EXPERT MODE' : 'EXPERT MODE'),
      mk ? 'Не мора да прашуваш само „кажи ми за државата“. Можам да работам и обратно — од симбол кон држава.' : 'You do not have to ask only “tell me about a country.” I can also reason in reverse — from symbol to country.',
      mk ? 'Пробај:' : 'Try:',
      mk ? '• „Кои држави имаат орел на знамето?“\n• „Кои химни се инструментални?“\n• „Кои знамиња имаат полумесечина?“\n• „Спореди ги знамињата на Албанија и Црна Гора.“\n• „Дај ми Protocol Trap.“\n• „Предизвикај ме — погоди држава.“' : '• “Which flags contain an eagle?”\n• “Which anthems are instrumental?”\n• “Which flags contain a crescent?”\n• “Compare the flags of Albania and Montenegro.”\n• “Give me a Protocol Trap.”\n• “Challenge me — guess the country.”'
    ]);
  }

  function install(){
    if(typeof window.wpaBotAnswer !== 'function'){
      window.setTimeout(install,80);
      return;
    }
    if(window.wpaBotAnswer.__wpaSymbolsV2) return;
    previousAnswer=window.wpaBotAnswer;

    var upgraded=function(q){
      var s=norm(q), mk=isMk(q) || window.WPA_CHAT_LANG !== 'en';

      var challengeRequest = /предизвик|погоди|quiz me|challenge me|new challenge|нов challenge|нов предизвик/.test(s);
      if(challengeRequest) return buildChallenge(mk);
      if(challenge) return checkChallenge(mk,q);

      if(/protocol trap|протокол trap|замка|трик праша/.test(s)) return protocolTrap(mk,q);
      if(/спореди|compare|разлика меѓу|difference between/.test(s)){
        var comp=answerCompare(mk,q); if(comp) return comp;
      }
      if(/орел|орли|eagle/.test(s)){
        var e=answerEagles(mk,q); if(e) return e;
      }
      if(/инструментал|без текст|without lyrics|no lyrics|instrumental/.test(s)){
        var a=answerInstrumental(mk,q); if(a) return a;
      }
      if(/знаме|flag|симбол|symbol|грб|emblem|coat of arms/.test(s)){
        var sym=answerSymbolSearch(mk,q); if(sym) return sym;
      }
      if(/што можеш|what can you do|expert mode|уникат|unique/.test(s)) return help(mk);

      var base=previousAnswer(q);
      if(base && !/Напиши име на држава|Ask for a country name/.test(base)) return base;
      return help(mk);
    };
    upgraded.__wpaSymbolsV2=true;
    window.wpaBotAnswer=upgraded;

    enhanceUi();
  }

  function enhanceUi(){
    var panel=document.getElementById('chatPanel');
    if(!panel) return;

    var firstBot=panel.querySelector('.wpa-chat-msg.bot');
    if(firstBot){
      firstBot.textContent = window.WPA_CHAT_LANG === 'en'
        ? 'Welcome to WPA Symbols Expert Assistant. I can identify countries from symbols, distinguish flag vs. coat-of-arms traps, compare flags, detect instrumental anthems and challenge you with reverse-identification questions.'
        : 'Добредојдовте во WPA Symbols Expert Assistant. Можам да препознавам држави преку симболи, да разликувам знаме од грб, да споредувам знамиња, да издвојувам инструментални химни и да поставувам reverse-identification предизвици.';
    }

    var buttons=panel.querySelectorAll('[onclick*="sendQuick"]');
    var configs=[
      ['🦅 Орел → држава','Кои држави имаат орел на знамето?'],
      ['🎼 Инструментални','Кои химни се инструментални?'],
      ['🧩 Погоди држава','Предизвикај ме — погоди држава.'],
      ['⚖️ Protocol Trap','Дај ми Protocol Trap.']
    ];
    for(var i=0;i<buttons.length && i<configs.length;i++){
      buttons[i].textContent=configs[i][0];
      buttons[i].setAttribute('onclick','sendQuick('+JSON.stringify(configs[i][1])+')');
      buttons[i].setAttribute('title',configs[i][1]);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.setTimeout(install,250);
  window.setTimeout(install,900);
})();

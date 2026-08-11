/* WPA Symbols Expert Assistant v4.2 — runtime-first domain engine
   World Protocol Academy · 2026-08-11

   This file intentionally acts as the final assistant layer loaded after
   wpa-symbols-assistant-v2.js. It keeps the specialist Symbol DNA / Reverse ID /
   Protocol Trap / Protocol Risk logic from v2, then adds a direct 197-record
   runtime engine, a verified overlay, a strict AI quality gate and resilient chat.
*/
(function(){
  'use strict';

  if (window.__WPA_SYMBOLS_EXPERT_V42__) return;
  window.__WPA_SYMBOLS_EXPERT_V42__ = true;

  var previousAnswer = typeof window.wpaBotAnswer === 'function' ? window.wpaBotAnswer : null;
  var chatBusy = false;
  var chatHistory = [];
  var runtime = { records: [], organizations: [], national_days: [] };
  var verified = { records: [] };
  var verifiedById = {};
  var datasetsReady = false;

  var LOGO_URL = '../../logo.png';
  var ACTIVE_URL = './data/active-runtime-197.json?v=20260811-42';
  var VERIFIED_URL = './data/countries.json?v=20260811-42';
  var AI_ENDPOINTS = [
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask',
    'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask'
  ];

  function s(v){ return String(v == null ? '' : v); }
  function clean(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}°²:.,><=+-]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function isMk(question){
    return window.WPA_CHAT_LANG !== 'en' || /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(question));
  }
  function num(v){ return Number(s(v).replace(/[^0-9.]/g,'')) || 0; }
  function unique(a){ return Array.from(new Set((a || []).filter(Boolean))); }
  function idKey(v){ return s(v).toLowerCase(); }

  function jsonFetch(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); });
  }

  function loadDatasets(){
    return Promise.all([
      jsonFetch(ACTIVE_URL).catch(function(){ return null; }),
      jsonFetch(VERIFIED_URL).catch(function(){ return null; })
    ]).then(function(parts){
      var a = parts[0], v = parts[1];
      if(a && Array.isArray(a.records)) runtime = a;
      if(v && Array.isArray(v.records)) verified = v;
      verifiedById = {};
      verified.records.forEach(function(r){ verifiedById[idKey(r.id)] = r; });
      datasetsReady = runtime.records.length >= 190;
      exposeLegacyMaps();
      return datasetsReady;
    });
  }

  function exposeLegacyMaps(){
    if(!runtime.records.length) return;
    var eagles = {};
    var instrumentals = {};
    runtime.records.forEach(function(r){
      if(r.eagle_on_flag_note) eagles[idKey(r.id)] = r.eagle_on_flag_note;
      if(r.instrumental_anthem) instrumentals[idKey(r.id)] = r.instrumental_anthem;
    });
    window.flagsWithEagles = Object.assign({},window.flagsWithEagles || {},eagles);
    window.instrumentalAnthems = Object.assign({},window.instrumentalAnthems || {},instrumentals);
  }

  function vr(r){ return r ? (verifiedById[idKey(r.id)] || null) : null; }

  function entityFromQuestion(question){
    var q = clean(question);
    if(!q) return null;
    var found = runtime.records.find(function(r){
      var name = clean(r.name_mk), id = clean(r.id);
      return (name && q.indexOf(name) >= 0) || (id && new RegExp('(^|\\s)'+id+'($|\\s)').test(q));
    });
    if(found) return found;

    for(var i=0;i<verified.records.length;i++){
      var v = verified.records[i];
      var names = [v.name_mk,v.name_en].concat(Array.isArray(v.aliases)?v.aliases:[]).map(clean).filter(Boolean);
      if(names.some(function(name){ return q.indexOf(name) >= 0; })){
        return runtime.records.find(function(r){ return idKey(r.id) === idKey(v.id); }) || null;
      }
    }
    return null;
  }

  function recordName(r,mk){
    var v = vr(r);
    if(!mk && v && v.name_en) return v.name_en;
    return r.name_mk || (v && (v.name_mk || v.name_en)) || s(r.id).toUpperCase();
  }

  function anthemTitle(r){
    var v = vr(r);
    if(v && v.anthem_title) return v.anthem_title;
    if(r.instrumental_anthem) return r.instrumental_anthem.name || r.instrumental_anthem.title || r.anthem_code || '—';
    return r.anthem_code ? 'WPA code: '+r.anthem_code : '—';
  }

  function nationalDaysFor(r){
    if(Array.isArray(r.national_days) && r.national_days.length) return r.national_days;
    return (runtime.national_days || []).filter(function(d){ return idKey(d.countryId) === idKey(r.id); });
  }

  var COLOR_ALIASES = [
    ['црвена',['црвен','црвена','црвено','red']],
    ['бела',['бел','бела','бело','white']],
    ['сина',['син','сина','сино','blue']],
    ['зелена',['зелен','зелена','зелено','green']],
    ['жолта',['жолт','жолта','жолто','yellow']],
    ['златна',['златен','златна','златно','gold']],
    ['црна',['црн','црна','црно','black']],
    ['портокалова',['портокалов','портокалова','orange']],
    ['виолетова',['виолетов','виолетова','purple']],
    ['кафеава',['кафеав','кафеава','brown']]
  ];

  function colorsOf(r){
    var v = vr(r);
    if(v && Array.isArray(v.flag_colors) && v.flag_colors.length) return unique(v.flag_colors.map(clean));
    var hay = clean([r.flag_summary_mk, v && v.flag_description_mk].filter(Boolean).join(' '));
    var out = [];
    COLOR_ALIASES.forEach(function(group){
      if(group[1].some(function(term){ return hay.indexOf(clean(term)) >= 0; })) out.push(group[0]);
    });
    return unique(out).sort();
  }

  function jaccard(a,b){
    var A = new Set(a), B = new Set(b), inter = 0;
    A.forEach(function(x){ if(B.has(x)) inter++; });
    var union = new Set(a.concat(b)).size;
    return union ? inter / union : 0;
  }

  function listEagles(mk){
    var hits = runtime.records.filter(function(r){
      var v = vr(r);
      return !!r.eagle_on_flag_note || !!(v && v.has_eagle_on_flag);
    });
    if(!hits.length) return null;
    return [
      mk ? '🦅 Држави/ентитети со орел НА САМОТО ЗНАМЕ во активниот WPA dataset:' : '🦅 Countries/entities with an eagle ON THE FLAG in the active WPA dataset:',
      hits.map(function(r){
        var v = vr(r);
        var note = r.eagle_on_flag_note || (v && v.flag_description_mk) || '';
        return '• '+recordName(r,mk)+(note ? ' — '+note : '');
      }).join('\n'),
      mk ? 'WPA Protocol Trap: орел во грб не значи автоматски орел на знамето.' : 'WPA Protocol Trap: an eagle in the coat of arms does not automatically mean an eagle appears on the flag.'
    ].join('\n\n');
  }

  function listInstrumental(mk){
    var hits = runtime.records.filter(function(r){
      var v = vr(r);
      return !!r.instrumental_anthem || !!(v && v.anthem_officially_instrumental);
    });
    if(!hits.length) return null;
    return [
      mk ? '🎼 Во активниот WPA dataset како официјално инструментални/без официјален текст се означени:' : '🎼 In the active WPA dataset, the following are marked as officially instrumental/without official lyrics:',
      hits.map(function(r){
        var v = vr(r);
        var note = (v && v.anthem_notes_mk) || (r.instrumental_anthem && r.instrumental_anthem.note) || '';
        return '• '+recordName(r,mk)+' — '+anthemTitle(r)+(note ? '\n  '+note : '');
      }).join('\n'),
      mk ? 'Напомена: ова не е исто што и химна со текст која на церемонија се изведува само инструментално.' : 'Note: this is not the same as an anthem with lyrics that is merely performed instrumentally at a ceremony.'
    ].join('\n\n');
  }

  function similarColors(question,mk){
    var named = entityFromQuestion(question);
    if(named){
      var base = colorsOf(named);
      if(!base.length) return null;
      var ranked = runtime.records.filter(function(r){ return idKey(r.id)!==idKey(named.id); }).map(function(r){
        var c = colorsOf(r);
        return {r:r,c:c,score:jaccard(base,c),shared:base.filter(function(x){ return c.indexOf(x)>=0; })};
      }).filter(function(x){ return x.shared.length >= Math.min(2,base.length) && x.score >= 0.45; })
        .sort(function(a,b){ return b.score-a.score || b.shared.length-a.shared.length; }).slice(0,15);
      if(!ranked.length) return null;
      return [
        (mk ? '🎨 Знамиња со слична палета на ' : '🎨 Flags with a similar colour palette to ')+recordName(named,mk)+': '+base.join(', '),
        ranked.map(function(x){ return '• '+recordName(x.r,mk)+' — '+x.c.join(', ')+' · '+(mk?'заеднички: ':'shared: ')+x.shared.join(', '); }).join('\n')
      ].join('\n\n');
    }

    var groups = {};
    runtime.records.forEach(function(r){
      var c = colorsOf(r);
      if(c.length < 2) return;
      var key = c.join('|');
      if(!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    var rows = Object.keys(groups).map(function(k){ return {key:k,colors:k.split('|'),items:groups[k]}; })
      .filter(function(g){ return g.items.length >= 2; })
      .sort(function(a,b){ return b.items.length-a.items.length; }).slice(0,12);
    if(!rows.length) return null;
    return [
      mk ? '🎨 Најчести групи знамиња со исти/многу слични основни бои во WPA dataset:' : '🎨 Common groups of flags with the same/very similar base colours in the WPA dataset:',
      rows.map(function(g){
        return '• '+g.colors.join(' + ')+' → '+g.items.slice(0,10).map(function(r){ return recordName(r,mk); }).join(', ')+(g.items.length>10?' …':'');
      }).join('\n'),
      mk ? 'Ако наведеш конкретна држава, ќе направам попрецизна споредба на нејзината палета.' : 'Name a specific country for a more precise palette comparison.'
    ].join('\n\n');
  }

  var SYMBOL_TERMS = {
    sun:['сонце','sun'], crescent:['полумесец','полумесечина','crescent'], star:['ѕвезда','ѕвезди','star'],
    cross:['крст','cross'], lion:['лав','lion'], crown:['круна','crown'], sword:['меч','сабја','sword','sabre']
  };
  function symbolList(q,mk){
    var key = Object.keys(SYMBOL_TERMS).find(function(k){ return SYMBOL_TERMS[k].some(function(t){ return q.indexOf(clean(t))>=0; }); });
    if(!key) return null;
    var terms = SYMBOL_TERMS[key];
    var hits = runtime.records.filter(function(r){
      var v = vr(r);
      var hay = clean([r.flag_summary_mk,v&&v.flag_description_mk,v&&v.flag_symbol].filter(Boolean).join(' '));
      return terms.some(function(t){ return hay.indexOf(clean(t))>=0; });
    });
    if(!hits.length) return null;
    return (mk?'🏳️ WPA совпаѓања за симболот „':'🏳️ WPA matches for the symbol “')+key+'”:\n'+
      hits.slice(0,30).map(function(r){ return '• '+recordName(r,mk)+' — '+s((vr(r)&&vr(r).flag_description_mk)||r.flag_summary_mk||''); }).join('\n');
  }

  var RESOURCE_TERMS = {
    gold:['злато','gold'], oil:['нафта','oil'], gas:['природен гас','natural gas','gas'], coal:['јаглен','coal'],
    copper:['бакар','copper'], iron:['железо','iron'], diamonds:['дијамант','дијаманти','diamond'], uranium:['ураниум','uranium'],
    silver:['сребро','silver'], nickel:['никел','nickel'], phosphate:['фосфат','phosphate'], chromium:['хром','chromium']
  };
  function resourceList(q,mk){
    var key = Object.keys(RESOURCE_TERMS).find(function(k){ return RESOURCE_TERMS[k].some(function(t){ return q.indexOf(clean(t))>=0; }); });
    if(!key) return null;
    var terms = RESOURCE_TERMS[key];
    var hits = runtime.records.filter(function(r){
      var hay = clean(r.resources_mk);
      return terms.some(function(t){ return hay.indexOf(clean(t))>=0; });
    });
    if(!hits.length) return null;
    return (mk?'⛏️ Држави/ентитети во чиј WPA запис е наведен ресурсот „':'⛏️ Countries/entities whose WPA record lists “')+key+'”:\n'+
      hits.slice(0,35).map(function(r){ return '• '+recordName(r,mk)+' — '+s(r.resources_mk||'—'); }).join('\n');
  }

  function fullProfile(r,mk){
    var v = vr(r), d = nationalDaysFor(r);
    return [
      '🌍 '+recordName(r,mk)+' ('+s(r.id).toUpperCase()+')',
      (mk?'🏙️ Главен град: ':'🏙️ Capital: ')+s(r.capital_mk || (v&&v.capital) || '—'),
      (mk?'🗺️ Континент/регион: ':'🗺️ Continent/region: ')+s(r.continent_mk || (v&&v.continent) || '—'),
      (mk?'📍 Координати: ':'📍 Coordinates: ')+s(r.coordinates_display||'—'),
      (mk?'👥 Население: ':'👥 Population: ')+s(r.population_display||'—'),
      (mk?'📐 Површина: ':'📐 Area: ')+s(r.area_display||'—'),
      (mk?'⛏️ Ресурси: ':'⛏️ Resources: ')+s(r.resources_mk||'—'),
      (mk?'🏳️ Знаме: ':'🏳️ Flag: ')+s((v&&v.flag_description_mk)||r.flag_summary_mk||'—'),
      (mk?'🛡️ Грб/амблем: ':'🛡️ Coat of arms/emblem: ')+s((v&&v.coat_of_arms_summary_mk)||'—'),
      (mk?'🎼 Химна: ':'🎼 Anthem: ')+anthemTitle(r),
      (mk?'🎵 Официјално инструментална/без текст: ':'🎵 Officially instrumental/textless: ')+((v&&v.anthem_officially_instrumental)||r.instrumental_anthem ? (mk?'да':'yes') : (mk?'не е означено':'not marked')),
      (mk?'🦅 Орел на знамето: ':'🦅 Eagle on flag: ')+((v&&v.has_eagle_on_flag)||r.eagle_on_flag_note ? (mk?'да':'yes') : (mk?'не е означено':'not marked')),
      (mk?'📅 Национален ден: ':'📅 National day: ')+(d.length ? d.map(function(x){ return s(x.date||((x.month||'')+'-'+(x.day||'')))+' — '+s(x.title||''); }).join('; ') : '—'),
      mk?'⚖️ За официјална употреба проверете ги временски чувствителните податоци со примарен државен/дипломатски извор.':'⚖️ For official use, reconfirm time-sensitive data with a primary state/diplomatic source.'
    ].join('\n');
  }

  function countryField(r,q,mk){
    var v = vr(r), d;
    if(/координат|gps|геолокац|geolocation|coordinates|location/.test(q)) return '📍 '+recordName(r,mk)+': '+s(r.coordinates_display||'—');
    if(/ресурс|рудн|богатств|mineral|resources/.test(q)) return '⛏️ '+recordName(r,mk)+': '+s(r.resources_mk||'—');
    if(/население|population/.test(q)) return '👥 '+recordName(r,mk)+': '+s(r.population_display||'—');
    if(/површина|големина|area|size/.test(q)) return '📐 '+recordName(r,mk)+': '+s(r.area_display||'—');
    if(/главен град|capital/.test(q)) return '🏙️ '+recordName(r,mk)+': '+s(r.capital_mk||(v&&v.capital)||'—');
    if(/континент|регион|continent|region/.test(q)) return '🗺️ '+recordName(r,mk)+': '+s(r.continent_mk||(v&&v.continent)||'—');
    if(/знаме|flag/.test(q)) return '🏳️ '+recordName(r,mk)+': '+s((v&&v.flag_description_mk)||r.flag_summary_mk||'—');
    if(/грб|coat of arms|emblem|амблем/.test(q)) return '🛡️ '+recordName(r,mk)+': '+s((v&&v.coat_of_arms_summary_mk)||'—');
    if(/химн|anthem/.test(q)) return '🎼 '+recordName(r,mk)+': '+anthemTitle(r)+((v&&v.anthem_notes_mk)?'\n'+v.anthem_notes_mk:'');
    if(/национален ден|national day|празник|holiday/.test(q)){
      d = nationalDaysFor(r);
      if(d.length) return '📅 '+recordName(r,mk)+': '+d.map(function(x){ return s(x.date||((x.month||'')+'-'+(x.day||'')))+' — '+s(x.title||''); }).join('; ');
    }
    return null;
  }

  function rankings(q,mk){
    var all = runtime.records.slice();
    if(/најголем|largest|biggest/.test(q) && /површина|area|држав|country/.test(q)){
      all.sort(function(a,b){ return num(b.area_display)-num(a.area_display); });
      return (mk?'📐 Најголеми држави/ентитети по површина:':'📐 Largest countries/entities by area:')+'\n'+all.slice(0,10).map(function(r,i){ return (i+1)+'. '+recordName(r,mk)+' — '+r.area_display; }).join('\n');
    }
    if(/најмал|smallest/.test(q) && /површина|area|држав|country/.test(q)){
      all.sort(function(a,b){ return num(a.area_display)-num(b.area_display); });
      return (mk?'📐 Најмали држави/ентитети по површина:':'📐 Smallest countries/entities by area:')+'\n'+all.slice(0,10).map(function(r,i){ return (i+1)+'. '+recordName(r,mk)+' — '+r.area_display; }).join('\n');
    }
    if(/најмногу насел|most populous|largest population/.test(q)){
      all.sort(function(a,b){ return num(b.population_display)-num(a.population_display); });
      return (mk?'👥 Најнаселени држави/ентитети:':'👥 Most populous countries/entities:')+'\n'+all.slice(0,10).map(function(r,i){ return (i+1)+'. '+recordName(r,mk)+' — '+r.population_display; }).join('\n');
    }
    return null;
  }

  function organizationsAnswer(q,mk){
    if(!/(организац|organization|organisation)/.test(q) || !Array.isArray(runtime.organizations) || !runtime.organizations.length) return null;
    return (mk?'🌐 Меѓународни организации во активниот WPA Symbols feed:':'🌐 International organizations in the active WPA Symbols feed:')+'\n'+
      runtime.organizations.slice(0,30).map(function(o){ return '• '+s(o.name_mk||o.name||o.name_en||o.id||'—'); }).join('\n');
  }

  function directAnswer(question){
    if(!datasetsReady) return null;
    var q = clean(question), mk = isMk(question);

    if((/орел|eagle/.test(q)) && (/знаме|flag/.test(q) || /кои|which|држав|countries|земј/.test(q))) return listEagles(mk);
    if(/инструментал|textless|без текст/.test(q) && /химн|anthem/.test(q)) return listInstrumental(mk);
    if(/сличн.*бо|исти.*бо|same color|same colour|similar color|similar colour|боите.*знам|flag colors|flag colours/.test(q)) return similarColors(question,mk);

    var r = entityFromQuestion(question);
    if(r){
      if(/кажи ми с[еè]|кажи ми сè|сè за|се за|целосен профил|complete profile|all about|country profile/.test(q)) return fullProfile(r,mk);
      var field = countryField(r,q,mk);
      if(field) return field;
    }

    var ranked = rankings(q,mk); if(ranked) return ranked;
    var res = resourceList(q,mk); if(res && /кои|which|држав|countries|земј|resource|ресурс|рудн|богатств/.test(q)) return res;
    var sym = symbolList(q,mk); if(sym && /знаме|flag|кои|which/.test(q)) return sym;
    var org = organizationsAnswer(q,mk); if(org) return org;
    return null;
  }

  function insufficient(answer){
    var z = clean(answer);
    if(!z) return true;
    var bad = [
      'wpa flags anthems state symbols статус verified dataset ui',
      'wpa flags anthems state symbols status verified dataset ui',
      'virtual sande може 197 country entity cards',
      'virtual sande can 197 country entity cards',
      'граница country and organization claims must come from the verified dataset',
      'boundary country and organization claims must come from the verified dataset',
      'wpa symbol lab expert mode',
      'symbols сега работи како интерактивна лабораторија',
      'symbols now works as an interactive laboratory',
      'пробај која држава ја барам',
      'try which country am i looking for',
      'јас сум wpa protocol assistant',
      'i am the wpa protocol assistant',
      'не најдов совпаѓања во активниот wpa dataset',
      'no matches found in the active wpa dataset',
      'напиши име на држава и ќе одговорам',
      'ask for a country name and i will answer'
    ];
    return bad.some(function(x){ return z.indexOf(clean(x)) >= 0; });
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

  function expertContext(lang){
    if(lang === 'en') return 'You are WPA Symbols Expert Assistant of World Protocol Academy. Answer the user directly, not with a capability/status card. Scope: flags, coats of arms, emblems, state symbols, national anthems, officially instrumental/textless anthems, countries, capitals, geography, GPS/coordinates, population, area, natural and mineral resources, national days, international organizations, flag/anthem protocol, Symbol DNA, Reverse ID, Protocol Trap and Protocol Risk. Never confuse flag with coat of arms. Distinguish an officially textless/instrumental anthem from an instrumental performance. When a claim is current, legal or intended for official use, state when primary-source verification is needed.';
    return 'Ти си WPA Symbols Expert Assistant на World Protocol Academy. Одговори директно на прашањето, а не со status/capability картичка. Делокруг: знамиња, грбови, амблеми, државни симболи, национални химни, официјално инструментални/безтекстни химни, држави, главни градови, географија, GPS/координати, население, површина, природни и рудни богатства, национални денови, меѓународни организации, протокол на знамиња/химни, Symbol DNA, Reverse ID, Protocol Trap и Protocol Risk. Никогаш не мешај знаме со грб. Разликувај официјално безтекстна/инструментална химна од инструментална изведба. За тековни, правни или официјално употребливи тврдења означи кога е потребна примарна проверка.';
  }

  async function requestAI(question){
    var lang = window.WPA_CHAT_LANG === 'en' ? 'en' : 'mk';
    var context = expertContext(lang);
    var payload = {
      message:question, question:question, query:question,
      lang:lang, language:lang,
      history:[{role:'assistant',content:context}].concat(chatHistory.slice(-6)),
      context:context, system_prompt:context, instructions:context,
      quality:'3layer_academic', wpa_symbols_expert:true
    };
    var lastError = null;
    for(var i=0;i<AI_ENDPOINTS.length;i++){
      try{
        var response = await withTimeout(AI_ENDPOINTS[i],{
          method:'POST',mode:'cors',cache:'no-store',credentials:'omit',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify(payload)
        },7000);
        if(!response.ok) throw new Error('HTTP '+response.status);
        var ans = answerFrom(await response.json());
        if(ans && !insufficient(ans)) return ans;
      }catch(e){ lastError = e; }
    }
    throw lastError || new Error('No useful AI answer');
  }

  async function answerHybrid(question){
    var direct = directAnswer(question);
    if(direct) return {text:direct,source:'runtime'};

    var local = '';
    try{ if(previousAnswer) local = s(previousAnswer(question)).trim(); }catch(e){}
    if(local && !insufficient(local)) return {text:local,source:'specialist'};

    try{
      var ai = await requestAI(question);
      if(ai) return {text:ai,source:'ai'};
    }catch(e){}

    return {
      text:isMk(question)
        ? 'Не добив доволно сигурен директен одговор од достапните WPA слоеви. Наведи конкретна држава, симбол, химна, ресурс или споредба и ќе го обработам преку активниот 197-record dataset.'
        : 'I did not receive a sufficiently reliable direct answer from the available WPA layers. Name a specific country, symbol, anthem, resource or comparison and I will process it through the active 197-record dataset.',
      source:'fallback'
    };
  }

  function addMsg(role,text,extra){
    var body = document.getElementById('chatBody');
    if(!body) return null;
    var div = document.createElement('div');
    div.className = 'wpa-chat-msg '+role+(extra?' '+extra:'');
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function setBusy(v){
    chatBusy = !!v;
    var input = document.getElementById('chatInput');
    var send = document.querySelector('.wpa-chat-send');
    if(input) input.disabled = chatBusy;
    if(send) send.disabled = chatBusy;
  }

  function installStyles(){
    if(document.getElementById('wpaSymbolsV42Styles')) return;
    var st = document.createElement('style');
    st.id = 'wpaSymbolsV42Styles';
    st.textContent = '#chatToggleBtn.wpa-symbols-logo-launcher{width:66px!important;height:66px!important;border-radius:50%!important;padding:3px!important;overflow:hidden!important;background:#0a1628!important;border:2px solid #c9a84c!important;box-shadow:0 12px 34px rgba(8,19,40,.34)!important;display:flex!important;align-items:center!important;justify-content:center!important}#chatToggleBtn.wpa-symbols-logo-launcher img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important}.wpa-symbols-brand-title{display:flex!important;align-items:center!important;gap:9px!important}.wpa-symbols-header-logo{width:38px!important;height:38px!important;min-width:38px!important;border-radius:50%!important;object-fit:cover!important;border:1.5px solid #c9a84c!important}.wpa-symbols-brand-copy{display:flex!important;flex-direction:column!important;line-height:1.12!important}.wpa-symbols-brand-main{font-weight:700!important}.wpa-symbols-brand-sub{font-size:10px!important;opacity:.78!important;margin-top:3px!important}.wpa-symbols-typing{opacity:.72!important;font-style:italic!important}';
    document.head.appendChild(st);
  }

  function brand(){
    installStyles();
    var panel = document.getElementById('chatPanel');
    if(panel){
      var title = panel.querySelector('.wpa-chat-title');
      if(title && !title.dataset.wpaSymbolsV42){
        title.dataset.wpaSymbolsV42='1';
        title.textContent='';
        title.classList.add('wpa-symbols-brand-title');
        var img=document.createElement('img'); img.src=LOGO_URL; img.alt='WPA'; img.className='wpa-symbols-header-logo';
        var copy=document.createElement('span'); copy.className='wpa-symbols-brand-copy';
        var main=document.createElement('span'); main.className='wpa-symbols-brand-main'; main.textContent='WPA Symbols Expert Assistant';
        var sub=document.createElement('span'); sub.className='wpa-symbols-brand-sub'; sub.textContent='Светска академија за протокол · World Protocol Academy';
        copy.appendChild(main); copy.appendChild(sub); title.appendChild(img); title.appendChild(copy);
      }
      var first = panel.querySelector('.wpa-chat-msg.bot');
      if(first && !first.dataset.wpaV42Welcome){
        first.dataset.wpaV42Welcome='1';
        first.textContent = window.WPA_CHAT_LANG === 'en'
          ? 'Welcome to WPA Symbols Expert Assistant. I answer directly from the active 197-record WPA dataset and verified overlays on flags, coats of arms, anthems, countries, capitals, geography/GPS coordinates, population, area, natural and mineral resources, national days, organizations and protocol use. Specialist tools and WPA AI are used when needed.'
          : 'Добредојдовте во WPA Symbols Expert Assistant. Одговарам директно од активниот WPA dataset со 197 записи и верифицираните overlay-слоеви за знамиња, грбови, химни, држави, главни градови, географија/GPS координати, население, површина, природни и рудни богатства, национални денови, организации и протоколарна употреба. По потреба ги користам и специјализираните алатки и WPA AI.';
      }
    }
    var toggle = document.getElementById('chatToggleBtn');
    if(toggle && !toggle.dataset.wpaSymbolsV42){
      toggle.dataset.wpaSymbolsV42='1';
      toggle.classList.add('wpa-symbols-logo-launcher');
      toggle.innerHTML='';
      var logo=document.createElement('img'); logo.src=LOGO_URL; logo.alt='WPA'; toggle.appendChild(logo);
      toggle.title='WPA Symbols Expert Assistant'; toggle.setAttribute('aria-label','Open WPA Symbols Expert Assistant');
    }
  }

  function addQuickTools(){
    var panel=document.getElementById('chatPanel');
    if(!panel || document.getElementById('wpaRuntimeQuickRow')) return;
    var base=panel.querySelector('[onclick*="sendQuick"]');
    if(!base) return;
    var row=document.createElement('div'); row.id='wpaRuntimeQuickRow'; row.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;';
    [
      ['🌍 Целосен профил','Кажи ми сè за Казахстан.'],
      ['⛏️ Ресурси','Кои држави имаат злато во ресурсите?'],
      ['📐 Најголеми','Кои се најголемите држави по површина?'],
      ['🎨 Слични бои','Кои знамиња имаат слични бои?']
    ].forEach(function(x){
      var b=base.cloneNode(false); b.removeAttribute('id'); b.textContent=x[0]; b.title=x[1]; b.setAttribute('onclick','sendQuick('+JSON.stringify(x[1])+')'); row.appendChild(b);
    });
    base.parentElement.appendChild(row);
  }

  function installAnswerWrapper(){
    var current = typeof window.wpaBotAnswer === 'function' ? window.wpaBotAnswer : previousAnswer;
    if(current && !current.__wpaSymbolsV42){
      previousAnswer = current;
      var fn = function(question){ return directAnswer(question) || previousAnswer(question); };
      fn.__wpaSymbolsV42 = true;
      window.wpaBotAnswer = fn;
    }
  }

  function installChat(){
    if(!document.getElementById('chatInput') || !document.getElementById('chatBody')) return;

    window.sendChat = async function(){
      var input=document.getElementById('chatInput');
      if(!input || chatBusy) return;
      var q=input.value.trim(); if(!q) return;
      addMsg('user',q); chatHistory.push({role:'user',content:q}); input.value=''; setBusy(true);
      var typing=addMsg('bot',window.WPA_CHAT_LANG==='en'?'WPA is checking the Symbols dataset…':'WPA го проверува Symbols dataset-от…','wpa-symbols-typing');
      try{
        var result=await answerHybrid(q);
        if(typing&&typing.parentNode) typing.parentNode.removeChild(typing);
        addMsg('bot',result.text); chatHistory.push({role:'assistant',content:result.text}); chatHistory=chatHistory.slice(-12);
      }catch(e){
        if(typing&&typing.parentNode) typing.parentNode.removeChild(typing);
        addMsg('bot',window.WPA_CHAT_LANG==='en'?'A temporary connection problem occurred. Please try again.':'Настана привремен проблем со поврзувањето. Обидете се повторно.');
      }finally{ setBusy(false); if(input) input.focus(); }
    };

    window.sendQuick = function(q){
      var input=document.getElementById('chatInput'); if(!input||chatBusy) return; input.value=s(q); window.sendChat();
    };

    var input=document.getElementById('chatInput');
    if(input && !input.dataset.wpaV42Key){
      input.dataset.wpaV42Key='1';
      input.addEventListener('keydown',function(ev){
        if(ev.key==='Enter'&&!ev.shiftKey){ ev.preventDefault(); ev.stopImmediatePropagation(); window.sendChat(); }
      },true);
    }
  }

  function boot(){
    brand(); addQuickTools(); installAnswerWrapper(); installChat();
    loadDatasets().then(function(){ exposeLegacyMaps(); installAnswerWrapper(); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  setTimeout(function(){ brand(); addQuickTools(); installAnswerWrapper(); installChat(); },350);
  setTimeout(function(){ brand(); addQuickTools(); installAnswerWrapper(); installChat(); },1200);
})();

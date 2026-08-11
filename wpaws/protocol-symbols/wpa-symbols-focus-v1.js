/* WPA Symbols Focus Engine v1.0 — 2026-08-11
   Final question-first layer for the public WPA Symbols Expert Assistant.
   Purpose: answer the exact question first; never substitute capability/status text.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_FOCUS_V1__) return;
  window.__WPA_SYMBOLS_FOCUS_V1__ = true;

  var active={records:[],organizations:[],national_days:[]};
  var verified={records:[]};
  var verifiedById={};
  var ready=false;
  var busy=false;
  var history=[];
  var previousAnswer=typeof window.wpaBotAnswer==='function'?window.wpaBotAnswer:null;
  var loadPromise=loadData();

  var AI_ENDPOINTS=[
    'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask',
    'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask'
  ];

  function s(v){return String(v==null?'':v);}
  function clean(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}°²:.,><=+\-/]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}
  function id(v){return s(v).toLowerCase();}
  function uniq(a){return Array.from(new Set((a||[]).filter(Boolean)));}
  function nval(v){return Number(s(v).replace(/[^0-9.\-]/g,''))||0;}
  function fmt(v){try{return Number(v).toLocaleString('mk-MK');}catch(e){return s(v);}}

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
  }

  function loadData(){
    return Promise.all([
      fetchJson('./data/active-runtime-197.json?v=20260811-focus1').catch(function(){return null;}),
      fetchJson('./data/countries.json?v=20260811-focus1').catch(function(){return null;})
    ]).then(function(parts){
      if(parts[0]&&Array.isArray(parts[0].records))active=parts[0];
      if(parts[1]&&Array.isArray(parts[1].records))verified=parts[1];
      verifiedById={};
      verified.records.forEach(function(r){verifiedById[id(r.id)]=r;});
      ready=active.records.length>=190;
      return ready;
    });
  }

  function vr(r){return r?(verifiedById[id(r.id)]||null):null;}
  function name(r,mk){
    var v=vr(r);
    if(!mk&&v&&v.name_en)return v.name_en;
    return r.name_mk||(v&&(v.name_mk||v.name_en))||s(r.id).toUpperCase();
  }
  function aliases(r){
    var v=vr(r),a=[r.name_mk];
    if(v){a.push(v.name_mk,v.name_en);if(Array.isArray(v.aliases))a=a.concat(v.aliases);}
    return uniq(a.map(clean).filter(function(x){return x.length>=2;})).sort(function(x,y){return y.length-x.length;});
  }
  function entities(q){
    if(!ready)return[];
    var text=clean(q),hits=[];
    active.records.forEach(function(r){
      if(aliases(r).some(function(a){return text.indexOf(a)>=0;}))hits.push(r);
    });
    var ids=uniq(hits.map(function(r){return id(r.id);}));
    return ids.map(function(k){return active.records.find(function(r){return id(r.id)===k;});}).filter(Boolean);
  }

  function nationalDays(r){
    if(Array.isArray(r.national_days)&&r.national_days.length)return r.national_days;
    return (active.national_days||[]).filter(function(d){return id(d.countryId)===id(r.id);});
  }
  function flagText(r){var v=vr(r);return s((v&&v.flag_description_mk)||r.flag_summary_mk||'—');}
  function coatText(r){var v=vr(r);return s((v&&v.coat_of_arms_summary_mk)||'—');}
  function anthemText(r){
    var v=vr(r);
    if(v&&v.anthem_title)return v.anthem_title;
    if(r.instrumental_anthem)return r.instrumental_anthem.name||r.instrumental_anthem.title||r.anthem_code||'—';
    return r.anthem_code?'WPA code: '+r.anthem_code:'—';
  }

  function ratioOf(r){
    var m=flagText(r).match(/(?:Размер|ratio|proportion)\s*([0-9]+(?:\.[0-9]+)?)\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if(!m)return null;
    var a=Number(m[1]),b=Number(m[2]);
    return a&&b?{label:m[1]+':'+m[2],value:a/b}:null;
  }

  var COLOR_TERMS=[
    ['црвена',['црвен','црвена','red']],['бела',['бел','бела','white']],['сина',['син','сина','blue']],
    ['зелена',['зелен','зелена','green']],['жолта',['жолт','жолта','yellow']],['златна',['златен','златна','gold']],
    ['црна',['црн','црна','black']],['портокалова',['портокалов','портокалова','orange']],['виолетова',['виолетов','виолетова','purple']]
  ];
  function colors(r){
    var v=vr(r);
    if(v&&Array.isArray(v.flag_colors)&&v.flag_colors.length)return uniq(v.flag_colors.map(clean));
    var t=clean(flagText(r)),out=[];
    COLOR_TERMS.forEach(function(g){if(g[1].some(function(x){return t.indexOf(clean(x))>=0;}))out.push(g[0]);});
    return uniq(out);
  }

  function metric(q){
    q=clean(q);
    if(/население|жители|population|inhabitants|понасел|повеќе луѓе|more people/.test(q))return'population';
    if(/површина|територи|area|territor|km²|км²/.test(q))return'area';
    if(/ресурс|рудн|богатств|mineral|resources/.test(q))return'resources';
    if(/главен град|capital/.test(q))return'capital';
    if(/координат|gps|geograph|географ|latitude|longitude/.test(q))return'geo';
    if(/национален ден|national day|празник|holiday/.test(q))return'day';
    if(/химн|anthem/.test(q))return'anthem';
    if(/знаме|flag/.test(q))return'flag';
    if(/грб|coat of arms|emblem|амблем/.test(q))return'coat';
    if(/поголем|помал|larger|smaller|bigger|size/.test(q))return'area';
    return'general';
  }

  function comparisonIntent(q){
    q=clean(q);
    return /спореди|compare|или|versus|\bvs\b|разлика|difference|поголем|помал|повеќе|помалку|larger|smaller|bigger|more|less/.test(q);
  }

  function numericCompare(a,b,field,q,mk,labelMk,labelEn){
    var av=nval(a[field]),bv=nval(b[field]);
    if(!av||!bv)return null;
    var wantsMin=/помал|smaller|less/.test(clean(q));
    var winner=wantsMin?(av<=bv?a:b):(av>=bv?a:b);
    var diff=Math.abs(av-bv);
    var unit=field==='area_display'?' km²':'';
    var intro;
    if(mk){
      intro=wantsMin
        ? name(winner,true)+' е помала според '+labelMk+'.'
        : name(winner,true)+' е поголема според '+labelMk+'.';
      if(field==='area_display'&&!/површина|територи/.test(clean(q)))intro='Ако под „поголема“ мислиш по површина, '+name(winner,true)+' е поголема.';
    }else{
      intro=wantsMin
        ? name(winner,false)+' is smaller by '+labelEn+'.'
        : name(winner,false)+' is larger by '+labelEn+'.';
      if(field==='area_display'&&!/area|territor/.test(clean(q)))intro='If by “larger” you mean area, '+name(winner,false)+' is larger.';
    }
    return [
      '📊 '+intro,
      '• '+name(a,mk)+' — '+s(a[field]||fmt(av)),
      '• '+name(b,mk)+' — '+s(b[field]||fmt(bv)),
      (mk?'Разлика: ':'Difference: ')+fmt(diff)+unit
    ].join('\n');
  }

  function compareResources(a,b,mk){
    var A=clean(a.resources_mk).split(',').map(function(x){return x.trim();}).filter(Boolean);
    var B=clean(b.resources_mk).split(',').map(function(x){return x.trim();}).filter(Boolean);
    var common=A.filter(function(x){return B.indexOf(x)>=0;});
    return [
      mk?'⛏️ Споредба на ресурсите во активниот WPA dataset:':'⛏️ Resource comparison in the active WPA dataset:',
      '• '+name(a,mk)+' — '+s(a.resources_mk||'—'),
      '• '+name(b,mk)+' — '+s(b.resources_mk||'—'),
      common.length?(mk?'Заеднички наведени ресурси: ':'Resources listed for both: ')+common.join(', '):'',
      mk?'Ова поле покажува наведено присуство на ресурси, не количина на резерви или економска вредност.':'This field shows listed resource presence, not reserve quantities or economic value.'
    ].filter(Boolean).join('\n');
  }

  function compareFlags(a,b,mk){
    var ra=ratioOf(a),rb=ratioOf(b),ca=colors(a),cb=colors(b),common=ca.filter(function(x){return cb.indexOf(x)>=0;});
    return [
      mk?'🏳️ Споредба на знамињата:':'🏳️ Flag comparison:',
      '• '+name(a,mk)+' — '+flagText(a),
      '• '+name(b,mk)+' — '+flagText(b),
      ra&&rb?(mk?'Размер: ':'Ratio: ')+name(a,mk)+' '+ra.label+' ↔ '+name(b,mk)+' '+rb.label:'',
      common.length?(mk?'Заеднички бои: ':'Shared colours: ')+common.join(', '):'',
      mk?'WPA правило: боја, размер, геометрија и официјален симбол се споредуваат одделно; грбот не се пренесува автоматски на знамето.':'WPA rule: colour, ratio, geometry and official symbols are compared separately; coat-of-arms elements are not automatically transferred to the flag.'
    ].filter(Boolean).join('\n');
  }

  function compareTwo(q,arr,mk){
    if(arr.length<2||!comparisonIntent(q))return null;
    var a=arr[0],b=arr[1],m=metric(q);
    if(m==='area')return numericCompare(a,b,'area_display',q,mk,'површина','area');
    if(m==='population')return numericCompare(a,b,'population_display',q,mk,'население','population');
    if(m==='resources')return compareResources(a,b,mk);
    if(m==='capital')return '🏙️ '+(mk?'Главни градови: ':'Capitals: ')+name(a,mk)+' — '+s(a.capital_mk||'—')+'; '+name(b,mk)+' — '+s(b.capital_mk||'—')+'.';
    if(m==='geo')return '📍 '+(mk?'Референтни координати: ':'Reference coordinates: ')+name(a,mk)+' — '+s(a.coordinates_display||'—')+'; '+name(b,mk)+' — '+s(b.coordinates_display||'—')+'.';
    if(m==='flag')return compareFlags(a,b,mk);
    if(m==='coat')return (mk?'🛡️ Споредба на грбови/амблеми:\n':'🛡️ Coat-of-arms/emblem comparison:\n')+'• '+name(a,mk)+' — '+coatText(a)+'\n• '+name(b,mk)+' — '+coatText(b);
    if(m==='anthem')return (mk?'🎼 Споредба на химни:\n':'🎼 Anthem comparison:\n')+'• '+name(a,mk)+' — '+anthemText(a)+'\n• '+name(b,mk)+' — '+anthemText(b);
    if(m==='day')return (mk?'📅 Национални денови:\n':'📅 National days:\n')+'• '+name(a,mk)+' — '+(nationalDays(a).map(function(d){return s(d.date)+' — '+s(d.title||'');}).join('; ')||'—')+'\n• '+name(b,mk)+' — '+(nationalDays(b).map(function(d){return s(d.date)+' — '+s(d.title||'');}).join('; ')||'—');
    return [
      (mk?'⇆ Директна споредба: ':'⇆ Direct comparison: ')+name(a,mk)+' ↔ '+name(b,mk),
      (mk?'📐 Површина: ':'📐 Area: ')+s(a.area_display||'—')+' ↔ '+s(b.area_display||'—'),
      (mk?'👥 Население: ':'👥 Population: ')+s(a.population_display||'—')+' ↔ '+s(b.population_display||'—'),
      (mk?'🏙️ Главен град: ':'🏙️ Capital: ')+s(a.capital_mk||'—')+' ↔ '+s(b.capital_mk||'—')
    ].join('\n');
  }

  function oneCountry(q,r,mk){
    var m=metric(q),v=vr(r),d=nationalDays(r);
    if(m==='area')return '📐 '+name(r,mk)+' — '+s(r.area_display||'—');
    if(m==='population')return '👥 '+name(r,mk)+' — '+s(r.population_display||'—');
    if(m==='resources')return '⛏️ '+name(r,mk)+' — '+s(r.resources_mk||'—');
    if(m==='capital')return '🏙️ '+name(r,mk)+' — '+s(r.capital_mk||(v&&v.capital)||'—');
    if(m==='geo')return '📍 '+name(r,mk)+' — '+s(r.coordinates_display||'—');
    if(m==='flag')return '🏳️ '+name(r,mk)+' — '+flagText(r);
    if(m==='coat')return '🛡️ '+name(r,mk)+' — '+coatText(r);
    if(m==='anthem')return '🎼 '+name(r,mk)+' — '+anthemText(r)+((v&&v.anthem_notes_mk)?'\n'+v.anthem_notes_mk:'');
    if(m==='day'&&d.length)return '📅 '+name(r,mk)+' — '+d.map(function(x){return s(x.date)+' — '+s(x.title||'');}).join('; ');
    if(/сè за|се за|кажи ми с|all about|profile/.test(clean(q))){
      return [
        '🌍 '+name(r,mk),
        (mk?'🏙️ Главен град: ':'🏙️ Capital: ')+s(r.capital_mk||'—'),
        (mk?'🗺️ Регион: ':'🗺️ Region: ')+s(r.continent_mk||'—'),
        (mk?'📐 Површина: ':'📐 Area: ')+s(r.area_display||'—'),
        (mk?'👥 Население: ':'👥 Population: ')+s(r.population_display||'—'),
        (mk?'📍 Координати: ':'📍 Coordinates: ')+s(r.coordinates_display||'—'),
        (mk?'⛏️ Ресурси: ':'⛏️ Resources: ')+s(r.resources_mk||'—'),
        (mk?'🏳️ Знаме: ':'🏳️ Flag: ')+flagText(r),
        (mk?'🎼 Химна: ':'🎼 Anthem: ')+anthemText(r)
      ].join('\n');
    }
    return null;
  }

  function listQuestion(q,mk){
    q=clean(q);
    if(/орел|eagle/.test(q)&&/знаме|flag/.test(q)){
      var e=active.records.filter(function(r){var v=vr(r);return !!r.eagle_on_flag_note||!!(v&&v.has_eagle_on_flag);});
      if(e.length)return (mk?'🦅 Орел НА САМОТО ЗНАМЕ — WPA записи:\n':'🦅 Eagle ON THE FLAG — WPA records:\n')+e.map(function(r){return '• '+name(r,mk)+' — '+s(r.eagle_on_flag_note||(vr(r)&&vr(r).flag_description_mk)||'');}).join('\n');
    }
    if(/инструментал|без текст|textless/.test(q)&&/химн|anthem/.test(q)){
      var a=active.records.filter(function(r){var v=vr(r);return !!r.instrumental_anthem||!!(v&&v.anthem_officially_instrumental);});
      if(a.length)return (mk?'🎼 Официјално инструментални/без официјален текст во WPA dataset:\n':'🎼 Officially instrumental/without official lyrics in the WPA dataset:\n')+a.map(function(r){return '• '+name(r,mk)+' — '+anthemText(r);}).join('\n')+'\n\n'+(mk?'Важно: ова не е исто што и химна со текст која само се изведува инструментално.':'Important: this is not the same as an anthem with lyrics that is merely performed instrumentally.');
    }
    return null;
  }

  function focusedLocal(q){
    if(!ready)return null;
    var mk=isMk(q),arr=entities(q);
    var two=compareTwo(q,arr,mk);if(two)return two;
    if(arr.length===1){var one=oneCountry(q,arr[0],mk);if(one)return one;}
    return listQuestion(q,mk);
  }

  function badAnswer(ans){
    var z=clean(ans);
    if(!z)return true;
    var bad=[
      'verified dataset ui','status verified dataset ui','статус verified dataset ui','virtual sande може','virtual sande can',
      'wpa symbol lab expert mode','symbols сега работи како интерактивна лабораторија','symbols now works as an interactive laboratory',
      'пробај','try which country','што можеш','what can you do','не добив доволно сигурен директен одговор',
      'i did not receive a sufficiently reliable direct answer','отвори https','open https'
    ];
    return bad.some(function(x){return z.indexOf(clean(x))>=0;});
  }

  function focusedEnough(ans,q){
    if(badAnswer(ans))return false;
    var e=entities(q);
    if(e.length>=2){
      var z=clean(ans),hits=e.slice(0,2).filter(function(r){return aliases(r).some(function(a){return z.indexOf(a)>=0;});}).length;
      if(hits<2)return false;
    }
    return true;
  }

  function aiContext(q){
    var mk=isMk(q),e=entities(q),ctx=[];
    ctx.push(mk
      ? 'Ти си WPA Symbols Expert Assistant. ПРВО одговори на точното прашање во првата реченица. Не опишувај што можеш да правиш. Не враќај status/capability текст. Не пренасочувај кон друга страница. Не давај примери наместо одговор. Ако прашањето споредува две држави, именувај ги двете и кажи кој е резултатот според бараниот критериум. Ако „поголема“ е без друг критериум, толкувај ја како површина и кажи го тоа. Разликувај знаме, грб, амблем и печат; кај химни разликувај официјално безтекстна/инструментална химна од инструментална изведба.'
      : 'You are the WPA Symbols Expert Assistant. FIRST answer the exact question in the first sentence. Do not describe capabilities, return status cards, redirect to another page, or give examples instead of an answer. If two countries are compared, name both and state the result for the requested metric. If “larger” is unspecified, interpret it as area and say so. Distinguish flag, coat of arms, emblem and seal; distinguish officially textless/instrumental anthems from instrumental performances.');
    if(e.length){
      ctx.push((mk?'Релевантни WPA записи: ':'Relevant WPA records: ')+e.slice(0,3).map(function(r){
        return name(r,mk)+' | area='+s(r.area_display)+' | population='+s(r.population_display)+' | capital='+s(r.capital_mk)+' | coords='+s(r.coordinates_display)+' | resources='+s(r.resources_mk)+' | flag='+flagText(r)+' | anthem='+anthemText(r);
      }).join(' || '));
    }
    return ctx.join(' ');
  }

  function answerFrom(data){
    if(!data)return'';
    var out=data.answer||data.response||data.reply||data.message||data.output||data.text||(data.result&&(data.result.answer||data.result.response||data.result.text))||'';
    return typeof out==='string'?out.trim():(out&&typeof out.text==='string'?out.text.trim():'');
  }
  function timedFetch(url,opts,ms){
    if(typeof AbortController==='undefined')return fetch(url,opts);
    var c=new AbortController(),t=setTimeout(function(){c.abort();},ms),o=Object.assign({},opts,{signal:c.signal});
    return fetch(url,o).finally(function(){clearTimeout(t);});
  }
  async function askAI(q){
    var lang=window.WPA_CHAT_LANG==='en'?'en':'mk',ctx=aiContext(q),last=null;
    var payload={message:q,question:q,query:q,lang:lang,language:lang,context:ctx,system_prompt:ctx,instructions:ctx,history:history.slice(-6),quality:'3layer_academic',wpa_symbols_expert:true,question_first:true};
    for(var i=0;i<AI_ENDPOINTS.length;i++){
      try{
        var r=await timedFetch(AI_ENDPOINTS[i],{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)},7000);
        if(!r.ok)throw new Error('HTTP '+r.status);
        var ans=answerFrom(await r.json());
        if(ans&&focusedEnough(ans,q))return ans;
      }catch(e){last=e;}
    }
    throw last||new Error('No focused AI answer');
  }

  function add(role,text,extra){
    var body=document.getElementById('chatBody');if(!body)return null;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role+(extra?' '+extra:'');d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;return d;
  }
  function setBusy(v){
    busy=!!v;var input=document.getElementById('chatInput'),send=document.querySelector('.wpa-chat-send');
    if(input)input.disabled=busy;if(send)send.disabled=busy;
  }

  async function focusedSend(){
    var input=document.getElementById('chatInput');if(!input||busy)return;
    var q=input.value.trim();if(!q)return;
    add('user',q);history.push({role:'user',content:q});input.value='';setBusy(true);
    var typing=add('bot',window.WPA_CHAT_LANG==='en'?'WPA is answering the exact question…':'WPA одговара на точното прашање…','wpa-symbols-typing');
    try{
      try{await loadPromise;}catch(e){}
      var ans=focusedLocal(q);
      if(!ans&&previousAnswer){
        try{var specialist=s(previousAnswer(q)).trim();if(specialist&&focusedEnough(specialist,q))ans=specialist;}catch(e){}
      }
      if(!ans){try{ans=await askAI(q);}catch(e){}}
      if(!ans){
        ans=isMk(q)
          ? 'Не сакам да ти дадам општ или погрешно насочен одговор. За ова точно прашање немам доволно потврден податок во активните WPA слоеви.'
          : 'I do not want to give you a generic or misdirected answer. I do not have enough verified data in the active WPA layers for this exact question.';
      }
      if(typing&&typing.parentNode)typing.parentNode.removeChild(typing);
      add('bot',ans);history.push({role:'assistant',content:ans});history=history.slice(-12);
    }catch(e){
      if(typing&&typing.parentNode)typing.parentNode.removeChild(typing);
      add('bot',isMk(q)?'Настана привремен проблем при обработката на точното прашање. Обидете се повторно.':'A temporary problem occurred while processing the exact question. Please try again.');
    }finally{setBusy(false);if(input)input.focus();}
  }

  function installAnswerWrapper(){
    if(typeof window.wpaBotAnswer!=='function')return;
    if(window.wpaBotAnswer.__wpaFocusV1)return;
    previousAnswer=window.wpaBotAnswer;
    var fn=function(q){return focusedLocal(q)||previousAnswer(q);};
    fn.__wpaFocusV1=true;
    fn.__wpaSymbolsV21=true;
    fn.__wpaSymbolsV42=true;
    fn.__wpaRatioV1=true;
    fn.__wpaComparisonV1=true;
    window.wpaBotAnswer=fn;
  }

  function refreshWelcome(){
    var panel=document.getElementById('chatPanel');if(!panel)return;
    var first=panel.querySelector('.wpa-chat-msg.bot');if(!first)return;
    first.textContent=window.WPA_CHAT_LANG==='en'
      ? 'Welcome to WPA Symbols Expert Assistant. Ask the question naturally. I answer the exact question first, using the active WPA 197-record dataset for countries, flags, coats of arms, anthems, capitals, area, population, GPS/geography, natural and mineral resources, national days and comparisons; specialist tools and WPA AI are used only when needed.'
      : 'Добредојдовте во WPA Symbols Expert Assistant. Поставете го прашањето природно. Прво одговарам директно на точното прашање, користејќи го активниот WPA dataset со 197 записи за држави, знамиња, грбови, химни, главни градови, површина, население, GPS/географија, природни и рудни богатства, национални денови и споредби; специјализираните алатки и WPA AI ги користам само кога се потребни.';
  }

  function install(){
    installAnswerWrapper();
    window.sendChat=focusedSend;
    window.sendChat.__wpaFocusV1=true;
    window.sendChat.__wpaComparisonV1=true;
    window.sendQuick=function(q){var input=document.getElementById('chatInput');if(!input||busy)return;input.value=s(q);focusedSend();};
    refreshWelcome();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  loadPromise.then(install).catch(function(){});
  setTimeout(install,500);
  setTimeout(install,1300);
  setTimeout(install,1800);
  setTimeout(install,2800);
})();

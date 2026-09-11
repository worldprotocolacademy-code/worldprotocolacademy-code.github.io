/* WPA Symbols OICP Hardening v1.0 — 2026-09-11
   Final deterministic guard loaded after the specialist Symbols layers.
   Goals:
   - verified boolean fields outrank legacy descriptive runtime notes;
   - English country/entity resolution works across the 197-record runtime;
   - English answers never invent untranslated WPA fields;
   - known OICP demo regressions remain deterministic and testable.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_OICP_HARDENING_V1__) return;
  window.__WPA_SYMBOLS_OICP_HARDENING_V1__=true;

  var active={records:[],organizations:[],national_days:[]};
  var verified={records:[]};
  var verifiedById={};
  var ready=false;
  var busy=false;
  var previousAnswer=typeof window.wpaBotAnswer==='function'?window.wpaBotAnswer:null;
  var previousSend=typeof window.sendChat==='function'?window.sendChat:null;

  var ACTIVE_URL='./data/active-runtime-197.json?v=20260911-oicp1';
  var VERIFIED_URL='./data/countries.json?v=20260911-oicp1';

  var EN_ALIAS_OVERRIDES={
    xk:['kosovo','republic of kosovo'],
    mk:['north macedonia','republic of north macedonia','macedonia'],
    ps:['palestine','state of palestine','palestinian territories'],
    va:['vatican city','holy see'],
    ci:["cote d ivoire","côte d ivoire",'ivory coast'],
    cz:['czechia','czech republic'],
    tr:['turkiye','türkiye','turkey'],
    sz:['eswatini','swaziland'],
    cv:['cabo verde','cape verde'],
    tl:['timor leste','east timor'],
    mm:['myanmar','burma'],
    kr:['south korea','republic of korea','korea south'],
    kp:['north korea','democratic peoples republic of korea','korea north'],
    ru:['russia','russian federation'],
    gb:['united kingdom','uk','great britain'],
    us:['united states','united states of america','usa'],
    vn:['vietnam','viet nam'],
    la:['laos','lao peoples democratic republic'],
    bo:['bolivia','plurinational state of bolivia'],
    ve:['venezuela','bolivarian republic of venezuela'],
    tz:['tanzania','united republic of tanzania'],
    ir:['iran','islamic republic of iran'],
    sy:['syria','syrian arab republic'],
    md:['moldova','republic of moldova'],
    bn:['brunei','brunei darussalam'],
    cd:['democratic republic of the congo','dr congo','congo kinshasa'],
    cg:['republic of the congo','congo brazzaville'],
    fm:['micronesia','federated states of micronesia']
  };

  function s(v){return String(v==null?'':v);}
  function clean(v){
    return s(v).toLowerCase().normalize('NFKD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function id(v){return s(v).toLowerCase();}
  function isEnglish(q){
    if(window.WPA_CHAT_LANG==='en') return true;
    return !/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));
  }
  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
  }
  var loadPromise=Promise.all([
    fetchJson(ACTIVE_URL).catch(function(){return null;}),
    fetchJson(VERIFIED_URL).catch(function(){return null;})
  ]).then(function(parts){
    if(parts[0]&&Array.isArray(parts[0].records)) active=parts[0];
    if(parts[1]&&Array.isArray(parts[1].records)) verified=parts[1];
    verifiedById={};
    verified.records.forEach(function(r){verifiedById[id(r.id)]=r;});
    ready=active.records.length===197;
    return ready;
  });

  function vr(r){return r?(verifiedById[id(r.id)]||null):null;}
  function englishRegionName(r){
    if(!r) return '';
    var k=s(r.id).toUpperCase();
    if(k==='XK') return 'Kosovo';
    try{
      if(typeof Intl!=='undefined'&&Intl.DisplayNames){
        var n=new Intl.DisplayNames(['en'],{type:'region'}).of(k);
        if(n&&n!==k) return n;
      }
    }catch(e){}
    var aliases=EN_ALIAS_OVERRIDES[id(r.id)]||[];
    return aliases.length?aliases[0].replace(/\b\w/g,function(c){return c.toUpperCase();}):s(r.name_mk||r.id);
  }
  function aliasesFor(r){
    var out=[r.name_mk,r.id,englishRegionName(r)];
    var v=vr(r);
    if(v){
      out.push(v.name_mk,v.name_en);
      if(Array.isArray(v.aliases)) out=out.concat(v.aliases);
    }
    out=out.concat(EN_ALIAS_OVERRIDES[id(r.id)]||[]);
    return Array.from(new Set(out.map(clean).filter(Boolean))).sort(function(a,b){return b.length-a.length;});
  }
  function findEntity(q){
    if(!ready) return null;
    var z=clean(q);
    var best=null,bestLen=0;
    active.records.forEach(function(r){
      aliasesFor(r).forEach(function(a){
        if(a.length>bestLen&&(' '+z+' ').indexOf(' '+a+' ')>=0){best=r;bestLen=a.length;}
      });
    });
    return best;
  }

  function hasVerifiedBoolean(v,key){return !!v&&typeof v[key]==='boolean';}
  function eagleOnFlag(r){
    var v=vr(r);
    if(hasVerifiedBoolean(v,'has_eagle_on_flag')) return v.has_eagle_on_flag;
    return !!r.eagle_on_flag_note;
  }
  function instrumentalAnthem(r){
    var v=vr(r);
    if(hasVerifiedBoolean(v,'anthem_officially_instrumental')) return v.anthem_officially_instrumental;
    return !!r.instrumental_anthem;
  }

  function entityEagleAnswer(q,r){
    if(!r) return null;
    var z=clean(q);
    if(!/(eagle|орел)/.test(z)||!/(flag|знаме|знамиња)/.test(z)) return null;
    var en=isEnglish(q),v=vr(r),value=eagleOnFlag(r);
    if(en){
      return '🏳️ '+englishRegionName(r)+' — Eagle on the national flag: '+(value?'yes':'no')+'.'+
        (v&&hasVerifiedBoolean(v,'has_eagle_on_flag')?' Verified boolean has precedence over legacy descriptive notes.':'');
    }
    return '🏳️ '+s(r.name_mk||r.id)+' — Орел на државното знаме: '+(value?'да':'не')+'.'+
      (v&&hasVerifiedBoolean(v,'has_eagle_on_flag')?' Verified boolean има предност пред legacy описни белешки.':'');
  }

  function eagleList(q){
    var z=clean(q);
    if(!/(eagle|орел)/.test(z)||!/(flag|знаме|знамиња)/.test(z)) return null;
    if(!/(which|list|countries|states|entities|кои|листа|држав|земј)/.test(z)) return null;
    var en=isEnglish(q);
    var hits=active.records.filter(eagleOnFlag);
    if(!hits.length) return null;
    return (en?'🦅 Eagle ON THE FLAG — WPA verified-precedence records:\n':'🦅 Орел НА САМОТО ЗНАМЕ — WPA записи со verified-precedence:\n')+
      hits.map(function(r){
        var v=vr(r);
        var note=en
          ? (v&&v.flag_description_en)||''
          : (r.eagle_on_flag_note||(v&&v.flag_description_mk)||'');
        return '• '+(en?englishRegionName(r):s(r.name_mk||r.id))+(note?' — '+note:'');
      }).join('\n')+'\n\n'+
      (en
        ? 'WPA rule: when a verified boolean conflicts with a legacy descriptive runtime note, the verified boolean controls. A coat-of-arms eagle does not automatically mean an eagle is on the national flag.'
        : 'WPA правило: кога verified boolean е во конфликт со legacy описна runtime белешка, verified boolean има предност. Орел во грбот не значи автоматски орел на државното знаме.');
  }

  function nationalDays(r){
    if(Array.isArray(r.national_days)&&r.national_days.length) return r.national_days;
    return (active.national_days||[]).filter(function(d){return id(d.countryId)===id(r.id);});
  }
  function sourceFallback(label,value){
    return label+': '+s(value||'—')+(value?' [WPA source field: Macedonian; no unverified translation inserted]':'');
  }
  function englishEntityAnswer(q,r){
    if(!r||!isEnglish(q)) return null;
    var z=clean(q),v=vr(r),name=englishRegionName(r),days=nationalDays(r);
    if(/capital/.test(z)){
      var cap=(v&&(v.capital_en||v.capital))||'';
      return '🏙️ '+name+' — '+(cap||s(r.capital_mk||'—'))+(cap?'':' [WPA source field: Macedonian; no unverified translation inserted]')+'.';
    }
    if(/population/.test(z)) return '👥 '+name+' — '+s(r.population_display||'—')+'.';
    if(/area|territor|size/.test(z)) return '📐 '+name+' — '+s(r.area_display||'—')+'.';
    if(/coordinate|gps|geograph|location/.test(z)) return '📍 '+name+' — '+s(r.coordinates_display||'—')+'.';
    if(/resource|mineral/.test(z)) return '⛏️ '+name+' — '+sourceFallback('Resources',r.resources_mk)+'.';
    if(/national day|holiday/.test(z)){
      return '📅 '+name+' — '+(days.length?days.map(function(d){return s(d.date||((d.month||'')+'-'+(d.day||'')))+' — '+s(d.title||'');}).join('; '):'No active national-day record in this feed')+'.';
    }
    if(/coat of arms|emblem/.test(z)){
      var coat=v&&(v.coat_of_arms_summary_en||v.coat_of_arms_summary_mk);
      return '🛡️ '+name+' — '+(coat||'No deeper verified coat-of-arms description is available in the overlay layer.')+(coat&&!(v&&v.coat_of_arms_summary_en)?' [WPA source field: Macedonian]':'');
    }
    if(/anthem|instrumental|textless|lyrics/.test(z)){
      var title=(v&&v.anthem_title)||(r.instrumental_anthem&&(r.instrumental_anthem.name||r.instrumental_anthem.title))||(r.anthem_code?'WPA code: '+r.anthem_code:'—');
      return '🎼 '+name+' — '+title+'. Officially instrumental/textless in the controlled layer: '+(instrumentalAnthem(r)?'yes':'no / not marked')+'.';
    }
    if(/eagle/.test(z)&&/flag/.test(z)){
      return '🏳️ '+name+' — Eagle on the national flag: '+(eagleOnFlag(r)?'yes':'no')+'.'+(v&&hasVerifiedBoolean(v,'has_eagle_on_flag')?' Verified boolean has precedence.':'');
    }
    if(/flag/.test(z)){
      var flag=v&&(v.flag_description_en||v.flag_description_mk);
      return '🏳️ '+name+' — '+(flag||s(r.flag_summary_mk||'—'))+((flag&&!(v&&v.flag_description_en))||(!flag&&r.flag_summary_mk)?' [WPA source field: Macedonian]':'');
    }
    if(/all about|country profile|full profile|complete profile/.test(z)){
      var verifiedCapital=v&&(v.capital_en||v.capital);
      var capitalRow='Capital: '+s(verifiedCapital||r.capital_mk||'—')+(verifiedCapital?'':' [WPA source field: Macedonian; no unverified translation inserted]');
      var rows=[
        '🌍 Country / entity: '+name+' ('+s(r.id).toUpperCase()+')',
        '🏙️ '+capitalRow,
        '📍 Coordinates: '+s(r.coordinates_display||'—'),
        '👥 Population: '+s(r.population_display||'—'),
        '📐 Area: '+s(r.area_display||'—'),
        '⛏️ '+sourceFallback('Resources',r.resources_mk),
        '🎼 Anthem: '+((v&&v.anthem_title)||(r.anthem_code?'WPA code: '+r.anthem_code:'—')),
        '🎵 Officially instrumental/textless: '+(instrumentalAnthem(r)?'yes':'no / not marked'),
        '🦅 Eagle on national flag: '+(eagleOnFlag(r)?'yes':'no'),
        '📅 National day: '+(days.length?days.map(function(d){return s(d.date)+' — '+s(d.title||'');}).join('; '):'no active record in this feed'),
        '⚖️ Source discipline: untranslated WPA fields stay explicitly marked rather than being guessed. Reconfirm time-sensitive or official-use facts with primary sources.'
      ];
      return rows.join('\n');
    }
    return null;
  }

  function numberValue(v){return Number(s(v).replace(/[^0-9.]/g,''))||0;}
  function englishListAnswer(q){
    if(!isEnglish(q)) return null;
    var z=clean(q);

    if(/(instrumental|textless|without lyrics)/.test(z)&&/(anthem|anthems)/.test(z)){
      var ant=active.records.filter(instrumentalAnthem);
      if(!ant.length) return null;
      return '🎼 Officially instrumental/textless in the controlled WPA layer:\n'+
        ant.map(function(r){return '• '+englishRegionName(r);}).join('\n')+'\n\n'+
        'WPA rule: this is not the same as an anthem with lyrics that is merely performed instrumentally at a ceremony.';
    }

    var resourceMap={
      gold:['злато'],oil:['нафта'],'natural gas':['природен гас'],gas:['природен гас'],
      coal:['јаглен'],copper:['бакар'],iron:['железо','железна руда'],diamonds:['дијамант'],
      uranium:['ураниум','уран'],silver:['сребро'],nickel:['никел'],chromium:['хром'],
      phosphate:['фосфат'],bauxite:['бауксит'],zinc:['цинк'],lead:['олово'],manganese:['манган'],
      lithium:['литиум'],cobalt:['кобалт'],timber:['дрво'],salt:['сол']
    };
    var resourceKey=Object.keys(resourceMap).find(function(k){return (' '+z+' ').indexOf(' '+k+' ')>=0;});
    if(resourceKey&&/(which|countries|states|entities|list|resource|mineral)/.test(z)){
      var terms=resourceMap[resourceKey];
      var hits=active.records.filter(function(r){
        var h=clean(r.resources_mk);
        return terms.some(function(t){return h.indexOf(clean(t))>=0;});
      });
      if(hits.length){
        return '⛏️ Countries/entities whose active WPA source record lists '+resourceKey+':\n'+
          hits.map(function(r){return '• '+englishRegionName(r);}).join('\n')+'\n\n'+
          'This reports listed presence in the WPA source field; it does not imply reserve quantity, ownership or economic value.';
      }
    }

    if(/largest|biggest|smallest/.test(z)&&/(country|countries|state|states|area|territor)/.test(z)){
      var byArea=active.records.slice().filter(function(r){return numberValue(r.area_display)>0;});
      var smallest=/smallest/.test(z);
      byArea.sort(function(a,b){return smallest?numberValue(a.area_display)-numberValue(b.area_display):numberValue(b.area_display)-numberValue(a.area_display);});
      return '📐 '+(smallest?'Smallest':'Largest')+' countries/entities by area in the active WPA dataset:\n'+
        byArea.slice(0,10).map(function(r,i){return (i+1)+'. '+englishRegionName(r)+' — '+s(r.area_display||'—');}).join('\n');
    }

    if(/most populous|largest population/.test(z)){
      var byPop=active.records.slice().filter(function(r){return numberValue(r.population_display)>0;});
      byPop.sort(function(a,b){return numberValue(b.population_display)-numberValue(a.population_display);});
      return '👥 Most populous countries/entities in the active WPA dataset:\n'+
        byPop.slice(0,10).map(function(r,i){return (i+1)+'. '+englishRegionName(r)+' — '+s(r.population_display||'—');}).join('\n');
    }
    return null;
  }

  function direct(q){
    if(!ready) return null;
    var r=findEntity(q);
    if(r){
      var eagle=entityEagleAnswer(q,r); if(eagle) return eagle;
      var a=englishEntityAnswer(q,r); if(a) return a;
    }
    var list=eagleList(q); if(list) return list;
    var enList=englishListAnswer(q); if(enList) return enList;
    return null;
  }

  function add(role,text){
    var body=document.getElementById('chatBody'); if(!body) return;
    var d=document.createElement('div'); d.className='wpa-chat-msg '+role; d.textContent=text;
    body.appendChild(d); body.scrollTop=body.scrollHeight;
  }
  function setBusy(v){
    busy=!!v;
    var input=document.getElementById('chatInput');
    var send=document.querySelector('.wpa-chat-send');
    if(input) input.disabled=busy;
    if(send) send.disabled=busy;
  }

  function install(){
    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaOicpHardeningV1){
      previousAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return direct(q)||previousAnswer(q);};
      wrapped.__wpaOicpHardeningV1=true;
      window.wpaBotAnswer=wrapped;
    }
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaOicpHardeningV1){
      previousSend=window.sendChat;
      var send=async function(){
        var input=document.getElementById('chatInput');
        if(!input||busy) return previousSend();
        var q=input.value.trim(); if(!q) return previousSend();
        try{await loadPromise;}catch(e){}
        var a=direct(q);
        if(!a) return previousSend();
        add('user',q); input.value=''; setBusy(true);
        add('bot',a); setBusy(false); input.focus();
      };
      send.__wpaOicpHardeningV1=true;
      window.sendChat=send;
    }
  }

  install();
  loadPromise.then(install).catch(function(){});
  setTimeout(install,700);
  setTimeout(install,1600);
  setTimeout(install,3200);
})();

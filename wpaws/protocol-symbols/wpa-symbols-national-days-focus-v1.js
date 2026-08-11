/* WPA Symbols National Days Focus v1.0 — 2026-08-11
   Natural-language resolver for national day / independence day questions.
   Answers directly from the WPA national-days seed and active runtime.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_NATIONAL_DAYS_FOCUS_V1__) return;
  window.__WPA_SYMBOLS_NATIONAL_DAYS_FOCUS_V1__ = true;

  var seed={entries:[]};
  var active={records:[]};
  var seedReady=false, activeReady=false;

  function s(v){ return String(v==null?'':v); }
  function norm(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function isMk(q){ return window.WPA_CHAT_LANG!=='en' || /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q)); }

  var COUNTRY_ALIASES={
    us:['сад','с а д','соединети американски држави','обединети држави','америка','united states','united states of america','usa','u s a','america'],
    mk:['северна македонија','македонија','north macedonia','macedonia'],
    gb:['обединето кралство','велика британија','британија','united kingdom','great britain','britain','uk'],
    kr:['јужна кореја','south korea','republic of korea'],
    kp:['северна кореја','north korea','dprk'],
    va:['ватикан','светата столица','holy see','vatican'],
    ps:['палестина','државата палестина','state of palestine','palestine']
  };

  var MONTHS_MK=['Јануари','Февруари','Март','Април','Мај','Јуни','Јули','Август','Септември','Октомври','Ноември','Декември'];

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); });
  }

  var loadPromise=Promise.all([
    fetchJson('./national-holidays-mfa-seed.json?v=20260811-ndfocus1').then(function(d){seed=d||{entries:[]};seedReady=true;}).catch(function(){}),
    fetchJson('./data/active-runtime-197.json?v=20260811-ndfocus1').then(function(d){active=d||{records:[]};activeReady=true;}).catch(function(){})
  ]);

  function isNationalDayQuestion(q){
    var z=norm(q);
    return /(национален ден|националниот ден|ден на независност|денот на независност|државност|државен празник|national day|independence day|statehood day|national holiday)/.test(z);
  }

  function mentionedCountryId(q){
    var z=' '+norm(q)+' ';
    var ids=Object.keys(COUNTRY_ALIASES);
    for(var i=0;i<ids.length;i++){
      var id=ids[i], aliases=COUNTRY_ALIASES[id];
      for(var j=0;j<aliases.length;j++){
        if(z.indexOf(' '+norm(aliases[j])+' ')>=0) return id;
      }
    }
    if(activeReady && Array.isArray(active.records)){
      for(var k=0;k<active.records.length;k++){
        var r=active.records[k], name=norm(r.name_mk);
        if(name && z.indexOf(' '+name+' ')>=0) return s(r.id).toLowerCase();
      }
    }
    return null;
  }

  function seedEntries(){
    if(seed && Array.isArray(seed.entries)) return seed.entries;
    if(Array.isArray(window.WPA_NATIONAL_DAYS_SEED)) return window.WPA_NATIONAL_DAYS_SEED;
    return [];
  }

  function recordEntries(id){
    if(!activeReady || !Array.isArray(active.records)) return [];
    var r=active.records.find(function(x){return s(x.id).toLowerCase()===id;});
    if(!r || !Array.isArray(r.national_days)) return [];
    return r.national_days.map(function(d){
      return {
        countryId:id,
        sourceEntity:r.name_mk,
        date:d.date,
        title:d.title||'National Day',
        titleMk:d.title||'National Day'
      };
    });
  }

  function entriesFor(id){
    var list=seedEntries().filter(function(e){
      return s(e.countryId||e.entity_id).toLowerCase()===id;
    });
    if(!list.length) list=recordEntries(id);
    return list;
  }

  function displayDate(entry,mk){
    if(mk && entry.displayMk) return entry.displayMk;
    var d=s(entry.date||entry.national_day_date_iso);
    var m=d.match(/^(\d{2})-(\d{2})$/);
    if(!m) return d||'—';
    if(mk) return Number(m[2])+' '+MONTHS_MK[Number(m[1])-1];
    return m[1]+'-'+m[2];
  }

  function countryName(id,mk){
    var names={
      us:mk?'САД':'United States',
      mk:mk?'Северна Македонија':'North Macedonia',
      gb:mk?'Обединетото Кралство':'United Kingdom',
      kr:mk?'Јужна Кореја':'South Korea',
      kp:mk?'Северна Кореја':'North Korea',
      va:mk?'Светата столица / Ватикан':'Holy See / Vatican',
      ps:mk?'Државата Палестина':'State of Palestine'
    };
    if(names[id]) return names[id];
    if(activeReady && Array.isArray(active.records)){
      var r=active.records.find(function(x){return s(x.id).toLowerCase()===id;});
      if(r) return r.name_mk||id.toUpperCase();
    }
    return id.toUpperCase();
  }

  function titleFor(entry,mk){
    var t=s(mk?(entry.titleMk||entry.national_day_name_mk):(entry.title||entry.national_day_name_en));
    if(!t) t=mk?'Национален ден':'National Day';
    var map={
      'Independence Day':'Ден на независноста',
      'National Day':'Национален ден',
      'National Holiday':'Национален празник',
      'Statehood Day':'Ден на државноста',
      'Republic Day':'Ден на Републиката',
      'Day of Independence':'Ден на независноста'
    };
    return mk?(map[t]||t):t;
  }

  function answer(q){
    if(!isNationalDayQuestion(q)) return null;
    var id=mentionedCountryId(q);
    if(!id) return null;
    var mk=isMk(q), list=entriesFor(id);
    if(!list.length) return null;

    // If the user explicitly asks for independence, prefer an Independence Day entry.
    var z=norm(q), chosen=list[0];
    if(/независност|independence/.test(z)){
      var ind=list.find(function(e){return /independence|независност/i.test(s(e.title||e.titleMk||e.national_day_name_mk||e.national_day_name_en));});
      if(ind) chosen=ind;
    }

    var cname=countryName(id,mk), date=displayDate(chosen,mk), title=titleFor(chosen,mk);
    if(mk){
      if(id==='us') return 'Националниот ден на САД е 4 јули — Денот на независноста (Independence Day).';
      return cname+': '+title+' се одбележува на '+date+'.';
    }
    if(id==='us') return 'The national day of the United States is July 4 — Independence Day.';
    return cname+': '+title+' is observed on '+date+'.';
  }

  function add(role,text){
    var body=document.getElementById('chatBody'); if(!body) return;
    var d=document.createElement('div'); d.className='wpa-chat-msg '+role; d.textContent=text;
    body.appendChild(d); body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function' && !window.sendChat.__wpaNationalDaysFocusV1){
      var prev=window.sendChat;
      var fn=async function(){
        var input=document.getElementById('chatInput');
        if(!input) return prev();
        var q=input.value.trim();
        if(!q || !isNationalDayQuestion(q)) return prev();
        try{ await loadPromise; }catch(e){}
        var a=answer(q);
        if(a){ add('user',q); input.value=''; add('bot',a); input.focus(); return; }
        return prev();
      };
      fn.__wpaNationalDaysFocusV1=true;
      window.sendChat=fn;
    }

    if(typeof window.wpaBotAnswer==='function' && !window.wpaBotAnswer.__wpaNationalDaysFocusV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){ return answer(q)||prevAnswer(q); };
      wrapped.__wpaNationalDaysFocusV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  loadPromise.then(install).catch(function(){});
  setTimeout(install,700);
  setTimeout(install,1800);
  setTimeout(install,3200);
})();

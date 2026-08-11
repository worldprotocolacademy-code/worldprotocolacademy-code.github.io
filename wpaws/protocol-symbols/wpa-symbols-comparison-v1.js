/* WPA Symbols country-comparison layer v1.0 — 2026-08-11
   Direct deterministic comparisons over the active 197-record runtime.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_COMPARISON_V1__) return;
  window.__WPA_SYMBOLS_COMPARISON_V1__ = true;

  var active = { records: [] };
  var verified = { records: [] };
  var verifiedById = {};
  var ready = false;
  var loadPromise = load();

  function s(v){ return String(v == null ? '' : v); }
  function clean(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}°²:.,><=+-]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function mk(q){ return window.WPA_CHAT_LANG !== 'en' || /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q)); }
  function id(v){ return s(v).toLowerCase(); }
  function num(v){ return Number(s(v).replace(/[^0-9.]/g,'')) || 0; }
  function fmt(v){
    try { return Number(v).toLocaleString('mk-MK'); }
    catch(e){ return String(v); }
  }
  function uniq(a){ return Array.from(new Set((a || []).filter(Boolean))); }

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); });
  }

  function load(){
    return Promise.all([
      fetchJson('./data/active-runtime-197.json?v=20260811-compare1').catch(function(){ return null; }),
      fetchJson('./data/countries.json?v=20260811-compare1').catch(function(){ return null; })
    ]).then(function(parts){
      if(parts[0] && Array.isArray(parts[0].records)) active = parts[0];
      if(parts[1] && Array.isArray(parts[1].records)) verified = parts[1];
      verifiedById = {};
      verified.records.forEach(function(r){ verifiedById[id(r.id)] = r; });
      ready = active.records.length >= 190;
      return ready;
    });
  }

  function vr(r){ return r ? (verifiedById[id(r.id)] || null) : null; }
  function name(r,isMk){
    var v = vr(r);
    if(!isMk && v && v.name_en) return v.name_en;
    return r.name_mk || (v && (v.name_mk || v.name_en)) || s(r.id).toUpperCase();
  }

  function aliases(r){
    var v = vr(r), out = [r.name_mk];
    if(v){
      out.push(v.name_mk,v.name_en);
      if(Array.isArray(v.aliases)) out = out.concat(v.aliases);
    }
    return uniq(out.map(clean).filter(function(x){ return x.length >= 2; })).sort(function(a,b){ return b.length-a.length; });
  }

  function entities(question){
    if(!ready) return [];
    var q = clean(question), hits = [];
    active.records.forEach(function(r){
      var a = aliases(r);
      if(a.some(function(x){ return q.indexOf(x) >= 0; })) hits.push(r);
    });
    return uniq(hits.map(function(r){ return id(r.id); })).map(function(key){
      return active.records.find(function(r){ return id(r.id) === key; });
    }).filter(Boolean);
  }

  function potential(q){
    q = clean(q);
    return /или|versus|\bvs\b|според|compare|comparison|поголем|помал|повеќе|помалку|larger|smaller|bigger|more|less|разлик|difference|која.*земј|which.*country/.test(q);
  }

  function metric(q){
    q = clean(q);
    if(/население|жители|population|people|inhabitants|понасел/.test(q)) return 'population';
    if(/површина|територи|area|territor|km²|км²/.test(q)) return 'area';
    if(/ресурс|рудн|богатств|mineral|resources/.test(q)) return 'resources';
    if(/главен град|capital/.test(q)) return 'capital';
    if(/координат|gps|географ|latitude|longitude|северн|јужн|источн|западн/.test(q)) return 'geo';
    if(/знаме|flag/.test(q)) return 'flag';
    if(/химн|anthem/.test(q)) return 'anthem';
    if(/национален ден|national day|празник|holiday/.test(q)) return 'day';
    if(/поголем|помал|larger|smaller|bigger|size/.test(q)) return 'area';
    return 'general';
  }

  function comparisonVerb(q){
    q = clean(q);
    if(/помал|smaller|less/.test(q)) return 'min';
    return 'max';
  }

  function numericCompare(a,b,field,labelMk,labelEn,question,isMk){
    var av = num(a[field]), bv = num(b[field]);
    if(!av || !bv) return null;
    var want = comparisonVerb(question);
    var winner = want === 'min' ? (av <= bv ? a : b) : (av >= bv ? a : b);
    var loser = winner === a ? b : a;
    var wv = winner === a ? av : bv;
    var lv = winner === a ? bv : av;
    var diff = Math.abs(av-bv);
    var label = isMk ? labelMk : labelEn;
    var rawA = s(a[field] || fmt(av));
    var rawB = s(b[field] || fmt(bv));
    var intro;

    if(isMk){
      intro = want === 'min'
        ? '📊 '+name(winner,true)+' е помала според '+label+'.'
        : '📊 '+name(winner,true)+' е поголема според '+label+'.';
      if(field === 'area_display' && !/површина|територи|area|territor/.test(clean(question))) {
        intro = '📐 Ако под „поголема“ мислиш по површина, '+name(winner,true)+' е поголема.';
      }
    }else{
      intro = want === 'min'
        ? '📊 '+name(winner,false)+' is smaller by '+label+'.'
        : '📊 '+name(winner,false)+' is larger by '+label+'.';
      if(field === 'area_display' && !/area|territor/.test(clean(question))) {
        intro = '📐 If by “larger” you mean land/territorial area, '+name(winner,false)+' is larger.';
      }
    }

    return [
      intro,
      '• '+name(a,isMk)+' — '+rawA,
      '• '+name(b,isMk)+' — '+rawB,
      (isMk ? 'Разлика: ' : 'Difference: ')+fmt(diff)+(field === 'area_display' ? ' km²' : ''),
      field === 'area_display'
        ? (isMk ? 'Толкување: „поголема држава“ стандардно го третирам како споредба по површина, освен ако прашањето не бара население или друг показател.' : 'Interpretation: I treat “larger country” as an area comparison unless the question specifies population or another metric.')
        : ''
    ].filter(Boolean).join('\n');
  }

  function resourceSet(r){
    return clean(r.resources_mk).split(',').map(function(x){ return x.trim(); }).filter(Boolean);
  }

  function resourcesCompare(a,b,isMk){
    var A = resourceSet(a), B = resourceSet(b);
    var common = A.filter(function(x){ return B.indexOf(x) >= 0; });
    var onlyA = A.filter(function(x){ return B.indexOf(x) < 0; });
    var onlyB = B.filter(function(x){ return A.indexOf(x) < 0; });
    return [
      isMk ? '⛏️ Споредба на природни/рудни ресурси во активниот WPA dataset:' : '⛏️ Natural/mineral-resource comparison in the active WPA dataset:',
      '• '+name(a,isMk)+' — '+s(a.resources_mk || '—'),
      '• '+name(b,isMk)+' — '+s(b.resources_mk || '—'),
      common.length ? (isMk ? 'Заеднички наведени ресурси: ' : 'Resources listed for both: ')+common.join(', ') : '',
      onlyA.length ? name(a,isMk)+(isMk ? ' — дополнително наведени: ' : ' — additionally listed: ')+onlyA.join(', ') : '',
      onlyB.length ? name(b,isMk)+(isMk ? ' — дополнително наведени: ' : ' — additionally listed: ')+onlyB.join(', ') : '',
      isMk ? 'WPA граница: ова поле покажува присуство/наведување на ресурси, не количина на резерви или економска вредност; затоа од него не заклучувам која држава е „побогата“.' : 'WPA boundary: this field shows listed resource presence, not reserve quantities or economic value, so it does not by itself establish which country is “richer”.'
    ].filter(Boolean).join('\n');
  }

  function flagText(r){ var v=vr(r); return s((v&&v.flag_description_mk)||r.flag_summary_mk||'—'); }
  function anthemText(r){
    var v=vr(r);
    if(v&&v.anthem_title) return v.anthem_title;
    if(r.instrumental_anthem) return r.instrumental_anthem.name || r.instrumental_anthem.title || r.anthem_code || '—';
    return r.anthem_code ? 'WPA code: '+r.anthem_code : '—';
  }
  function days(r){ return Array.isArray(r.national_days) ? r.national_days : []; }

  function generalCompare(a,b,isMk){
    return [
      (isMk ? '⇆ WPA споредба: ' : '⇆ WPA comparison: ')+name(a,isMk)+' ↔ '+name(b,isMk),
      (isMk ? '🏙️ Главни градови: ' : '🏙️ Capitals: ')+s(a.capital_mk||'—')+' ↔ '+s(b.capital_mk||'—'),
      (isMk ? '🗺️ Регион: ' : '🗺️ Region: ')+s(a.continent_mk||'—')+' ↔ '+s(b.continent_mk||'—'),
      (isMk ? '📐 Површина: ' : '📐 Area: ')+s(a.area_display||'—')+' ↔ '+s(b.area_display||'—'),
      (isMk ? '👥 Население: ' : '👥 Population: ')+s(a.population_display||'—')+' ↔ '+s(b.population_display||'—'),
      (isMk ? '📍 Координати: ' : '📍 Coordinates: ')+s(a.coordinates_display||'—')+' ↔ '+s(b.coordinates_display||'—'),
      (isMk ? '🏳️ Знаме A: ' : '🏳️ Flag A: ')+flagText(a),
      (isMk ? '🏳️ Знаме B: ' : '🏳️ Flag B: ')+flagText(b),
      isMk ? 'Можеш да продолжиш со „која е поголема по површина?“, „која има повеќе жители?“, „спореди ги ресурсите“ или „спореди ги знамињата“.' : 'You can continue with “which is larger by area?”, “which has more people?”, “compare the resources”, or “compare the flags”.'
    ].join('\n');
  }

  function compare(question){
    if(!ready || !potential(question)) return null;
    var found = entities(question);
    if(found.length < 2) return null;
    var a = found[0], b = found[1], isMk = mk(question), m = metric(question);

    if(m === 'area') return numericCompare(a,b,'area_display','површина','area',question,isMk);
    if(m === 'population') return numericCompare(a,b,'population_display','население','population',question,isMk);
    if(m === 'resources') return resourcesCompare(a,b,isMk);
    if(m === 'capital') return (isMk?'🏙️ Главни градови: ':'🏙️ Capitals: ')+name(a,isMk)+' — '+s(a.capital_mk||'—')+'; '+name(b,isMk)+' — '+s(b.capital_mk||'—')+'.';
    if(m === 'geo') return (isMk?'📍 Географски референтни координати: ':'📍 Geographic reference coordinates: ')+name(a,isMk)+' — '+s(a.coordinates_display||'—')+'; '+name(b,isMk)+' — '+s(b.coordinates_display||'—')+'.';
    if(m === 'flag') return (isMk?'🏳️ Споредба на знамиња:\n':'🏳️ Flag comparison:\n')+'• '+name(a,isMk)+' — '+flagText(a)+'\n• '+name(b,isMk)+' — '+flagText(b);
    if(m === 'anthem') return (isMk?'🎼 Споредба на химни:\n':'🎼 Anthem comparison:\n')+'• '+name(a,isMk)+' — '+anthemText(a)+'\n• '+name(b,isMk)+' — '+anthemText(b);
    if(m === 'day') return (isMk?'📅 Национални денови:\n':'📅 National days:\n')+'• '+name(a,isMk)+' — '+(days(a).map(function(d){return s(d.date)+' — '+s(d.title||'');}).join('; ')||'—')+'\n• '+name(b,isMk)+' — '+(days(b).map(function(d){return s(d.date)+' — '+s(d.title||'');}).join('; ')||'—');
    return generalCompare(a,b,isMk);
  }

  function add(role,text){
    var body=document.getElementById('chatBody');
    if(!body) return;
    var div=document.createElement('div');
    div.className='wpa-chat-msg '+role;
    div.textContent=text;
    body.appendChild(div);
    body.scrollTop=body.scrollHeight;
  }

  function installChatIntercept(){
    if(typeof window.sendChat !== 'function' || window.sendChat.__wpaComparisonV1) return;
    var prev = window.sendChat;
    var fn = async function(){
      var input=document.getElementById('chatInput');
      if(!input) return prev();
      var q=input.value.trim();
      if(!q) return prev();
      if(potential(q)){
        try{ await loadPromise; }catch(e){}
        var ans=compare(q);
        if(ans){
          add('user',q);
          input.value='';
          add('bot',ans);
          input.focus();
          return;
        }
      }
      return prev();
    };
    fn.__wpaComparisonV1=true;
    window.sendChat=fn;
  }

  function installAnswerWrapper(){
    if(typeof window.wpaBotAnswer !== 'function' || window.wpaBotAnswer.__wpaComparisonV1) return;
    var prev=window.wpaBotAnswer;
    var fn=function(q){ return compare(q) || prev(q); };
    fn.__wpaComparisonV1=true;
    window.wpaBotAnswer=fn;
  }

  function refreshWelcome(){
    var panel=document.getElementById('chatPanel');
    if(!panel) return;
    var first=panel.querySelector('.wpa-chat-msg.bot');
    if(!first) return;
    var t=clean(first.textContent);
    if(t.indexOf('интерактивна лабораторија за државна симболика')>=0 || t.indexOf('interactive laboratory')>=0){
      first.textContent = window.WPA_CHAT_LANG==='en'
        ? 'Welcome to WPA Symbols Expert Assistant. Ask direct or comparative questions about countries, flags, coats of arms, anthems, capitals, area, population, geography/GPS coordinates, natural and mineral resources, national days and protocol use. Comparative questions are calculated directly from the active WPA 197-record dataset whenever the required fields are available.'
        : 'Добредојдовте во WPA Symbols Expert Assistant. Поставете директни или споредбени прашања за држави, знамиња, грбови, химни, главни градови, површина, население, географија/GPS координати, природни и рудни богатства, национални денови и протоколарна употреба. Споредбите ги пресметувам директно од активниот WPA dataset со 197 записи кога потребните полиња се достапни.';
    }
  }

  function install(){ installAnswerWrapper(); installChatIntercept(); refreshWelcome(); }
  install();
  loadPromise.then(function(){ install(); }).catch(function(){});
  setTimeout(install,350);
  setTimeout(install,1200);
  setTimeout(install,2500);
})();

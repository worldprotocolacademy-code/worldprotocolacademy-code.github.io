/* WPA Symbols Context Intent Guard v1.1 — 2026-08-11
   Purpose: understand short natural follow-up questions in the Symbols assistant,
   including natural/mineral-resource intent and flag geometry/ratio intent, and
   prevent unrelated legacy answers from replacing a direct dataset answer.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_CONTEXT_INTENT_V1__) return;
  window.__WPA_SYMBOLS_CONTEXT_INTENT_V1__=true;

  var active={records:[]};
  var ready=false;

  function s(v){return String(v==null?'':v);}
  function norm(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}:]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}

  var EXTRA_ALIASES={
    us:['сад','соединети американски држави','америка','united states','united states of america','usa','america'],
    mk:['северна македонија','македонија','north macedonia','macedonia'],
    gb:['обединето кралство','велика британија','британија','united kingdom','great britain','britain','uk'],
    cz:['чешка','чешка република','чешката република','czechia','czech republic'],
    va:['ватикан','држава ватикан','државата ватикан','ватикан сити','светата столица','holy see','vatican','vatican city','vatican city state'],
    ch:['швајцарија','switzerland','swiss'],
    np:['непал','nepal'],
    ps:['палестина','државата палестина','state of palestine','palestine']
  };

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
  }

  var loadPromise=fetchJson('./data/active-runtime-197.json?v=20260811-context2')
    .then(function(d){
      if(d&&Array.isArray(d.records)){active=d;ready=d.records.length>=190;}
      return ready;
    })
    .catch(function(){return false;});

  function aliasesFor(r){
    var a=[r.name_mk];
    var extra=EXTRA_ALIASES[s(r.id).toLowerCase()];
    if(Array.isArray(extra)) a=a.concat(extra);
    return a.map(norm).filter(Boolean).sort(function(x,y){return y.length-x.length;});
  }

  function entityScore(text,alias){
    if(!alias) return 0;
    var padded=' '+text+' ', exact=' '+alias+' ';
    if(padded.indexOf(exact)>=0) return 1000+alias.length;
    // Long country names may be followed by a typo suffix (e.g. „Венецуелал“).
    if(alias.length>=5 && text.indexOf(alias)>=0) return 700+alias.length;
    return 0;
  }

  function bestEntity(q){
    if(!ready) return null;
    var text=norm(q), best=null, bestScore=0;
    active.records.forEach(function(r){
      aliasesFor(r).forEach(function(a){
        var score=entityScore(text,a);
        if(score>bestScore){bestScore=score;best=r;}
      });
    });
    return best;
  }

  function explicitResourceIntent(q){
    var z=norm(q);
    return /ресурс|рудн|богатств|минерал|руди|суровин|природн.*богат|resource|mineral|natural wealth|natural resources|raw materials/.test(z);
  }

  function shortPossessionIntent(q){
    var z=norm(q);
    return /со што располага|со што.*располага|со што е богат|со што е богата|што поседува|кои богатства|what resources|what minerals|rich in|what does .* possess/.test(z);
  }

  function previousUserQuestion(){
    var body=document.getElementById('chatBody');
    if(!body) return '';
    var nodes=body.querySelectorAll('.wpa-chat-msg.user');
    return nodes.length?s(nodes[nodes.length-1].textContent).trim():'';
  }

  function isResourceQuestion(q){
    if(explicitResourceIntent(q)) return true;
    if(!shortPossessionIntent(q)) return false;
    if(/со што.*располага|со што е богат|со што е богата|what resources|rich in/.test(norm(q))) return true;
    return explicitResourceIntent(previousUserQuestion());
  }

  function resourceAnswer(q){
    if(!isResourceQuestion(q)) return null;
    var r=bestEntity(q);
    if(!r) return null;
    var resources=s(r.resources_mk).trim();
    if(!resources||resources==='—') return null;
    if(isMk(q)) return '⛏️ '+s(r.name_mk||r.id).trim()+' — '+resources;
    return '⛏️ '+s(r.name_mk||r.id).trim()+' — '+resources+' (resources listed in the active WPA dataset).';
  }

  function flagGeometryIntent(q){
    var z=norm(q);
    var flag=/(знаме|знамето|знамиња|flag|banner)/.test(z);
    var geometry=/(сразмер|размер|сооднос|пропорц|ratio|proportion|aspect|големин|dimension|size|форма|формата|облик|shape|квадрат|square|правоагол|rectang|поразлич|различ|different|unique|останатите|other countries)/.test(z);
    return flag&&geometry;
  }

  function parseRatio(text){
    var m=s(text).match(/(?:Размер|ratio|proportion)\s*([0-9]+(?:\.[0-9]+)?)\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
    return m?m[1]+':'+m[2]:null;
  }

  function geometryFromRecord(r){
    var t=s(r&&r.flag_summary_mk).trim();
    var z=norm(t), ratio=parseRatio(t), shape='';
    if(/квадрат|square/.test(z)){shape='square';ratio=ratio||'1:1';}
    else if(/неправоагол|non rectangular|double pennant|два триагол|триагол/.test(z)) shape='nonrectangular';
    else if(ratio) shape='rectangular';
    return {text:t,ratio:ratio,shape:shape};
  }

  function asksPhysicalSize(q){
    var z=norm(q);
    return /(големин|dimension|physical size|колкава|колкав)/.test(z)&&!/(сразмер|размер|сооднос|пропорц|ratio|proportion|aspect)/.test(z);
  }

  function asksDifference(q){
    return /(поразлич|различ|different|unique|останатите|other countries|во однос на)/.test(norm(q));
  }

  function flagGeometryAnswer(q){
    if(!flagGeometryIntent(q)) return null;
    var r=bestEntity(q);
    if(!r) return null;
    var id=s(r.id).toLowerCase(), g=geometryFromRecord(r), mk=isMk(q);

    // Verified geometry facts used for direct protocol answers:
    // Vatican City and Switzerland use square national flags (1:1).
    // Nepal's national flag is non-rectangular and is defined by a geometric construction.
    if(id==='va'){
      if(mk){
        if(asksPhysicalSize(q)){
          return '📐 Знамето на Државата Ватикан нема една фиксна физичка големина; може да се изработува во различни димензии, но мора да ја задржи квадратната форма со сразмер 1:1 (ширина = висина).';
        }
        if(asksDifference(q)){
          return '📐 Знамето на Државата Ватикан е квадратno, со сразмер 1:1. По формата е исклучок меѓу националните знамиња: квадратна национална форма има и Швајцарија, додека повеќето државни знамиња се правоаголни; Непал има неправаголна, двојно-триаголна форма.';
        }
        return '📐 Знамето на Државата Ватикан има квадратна форма и сразмер 1:1 — ширината и висината се еднакви. И Швајцарија има квадратна национална форма; повеќето други национални знамиња се правоаголни.';
      }
      if(asksPhysicalSize(q)) return '📐 The Vatican City State flag has no single fixed physical size; it may be produced in different dimensions, but it keeps a square 1:1 proportion (width = height).';
      if(asksDifference(q)) return '📐 The Vatican City State flag is square, with a 1:1 ratio. Switzerland also has a square national flag, while most national flags are rectangular; Nepal has a non-rectangular double-pennant form.';
      return '📐 The Vatican City State flag is square with a 1:1 ratio: width equals height. Switzerland also has a square national flag; most other national flags are rectangular.';
    }

    if(id==='ch'){
      return mk
        ? '📐 Знамето на Швајцарија е квадратno, со сразмер 1:1. Државата Ватикан исто така има квадратна национална форма.'
        : '📐 The Swiss national flag is square, with a 1:1 ratio. Vatican City State also has a square national flag.';
    }

    if(id==='np'){
      return mk
        ? '📐 Знамето на Непал не е правоаголно: составено е од две споени триаголни форми. Затоа не треба да се сведува на стандарден правоаголен сразмер како 2:3 или 1:2.'
        : '📐 Nepal’s national flag is non-rectangular and is formed by two joined pennant/triangular shapes, so it should not be reduced to a standard rectangular ratio such as 2:3 or 1:2.';
    }

    if(g.ratio){
      if(mk) return '📐 '+s(r.name_mk||r.id).trim()+' — сразмер на знамето '+g.ratio+(g.shape==='rectangular'?' (правоаголна форма).':'.');
      return '📐 '+s(r.name_mk||r.id).trim()+' — flag ratio '+g.ratio+(g.shape==='rectangular'?' (rectangular form).':'.');
    }

    return null;
  }

  function directAnswer(q){
    return resourceAnswer(q)||flagGeometryAnswer(q)||null;
  }

  function hasDirectIntent(q){
    return isResourceQuestion(q)||flagGeometryIntent(q);
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;
    body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaContextIntentV1){
      var prev=window.sendChat;
      var fn=async function(){
        var input=document.getElementById('chatInput');
        if(!input)return prev();
        var q=input.value.trim();
        if(!q)return prev();
        if(hasDirectIntent(q)){
          try{await loadPromise;}catch(e){}
          var a=directAnswer(q);
          if(a){add('user',q);input.value='';add('bot',a);input.focus();return;}
        }
        return prev();
      };
      fn.__wpaContextIntentV1=true;
      window.sendChat=fn;
    }

    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaContextIntentV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return directAnswer(q)||prevAnswer(q);};
      wrapped.__wpaContextIntentV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  loadPromise.then(install).catch(function(){});
  // Re-capture after older layers that reinstall themselves later.
  setTimeout(install,900);
  setTimeout(install,2000);
  setTimeout(install,2900);
  setTimeout(install,3300);
  setTimeout(install,3700);
  setTimeout(install,4600);
})();

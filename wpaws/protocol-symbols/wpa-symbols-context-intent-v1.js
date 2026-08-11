/* WPA Symbols Context Intent Guard v1.3 — 2026-08-11
   Purpose: understand short natural follow-up questions in the Symbols assistant,
   including resources, flag geometry/ratio and flag-handling protocol, and prevent
   unrelated legacy answers from replacing a direct expert answer.

   Saudi special-case source note:
   - Law of the Flag of the Kingdom of Saudi Arabia (Bureau of Experts, in force)
     https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/03de5462-eda0-4dd6-9efa-a9a700f1f802/2
   - Saudipedia summary sourced to the Bureau of Experts / Ministry of Culture.
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
    sa:['саудиска арабија','кралството саудиска арабија','саудиско знаме','саудиското знаме','saudi arabia','kingdom of saudi arabia','saudi flag'],
    ps:['палестина','државата палестина','state of palestine','palestine']
  };

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
  }

  var loadPromise=fetchJson('./data/active-runtime-197.json?v=20260811-context4')
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

  function isSaudiMention(q){
    return /(саудиск|саудиј|saudi arabia|saudi flag|kingdom of saudi)/.test(norm(q));
  }

  function asksWhichFlag(q){
    return /(кое знаме|кои знамиња|кое од знамињ|which flag|which flags|what flag)/.test(norm(q));
  }

  function asksAccidentalContact(q){
    return /(случај|ненамер|по грешка|accident|unintentional|by mistake)/.test(norm(q));
  }

  function asksGround(q){
    return /(земј|тло|подот|под |floor|ground|влеч|drag|леж|лежи|постав.*земј|став.*земј|допир.*земј|touch.*ground|touch.*floor)/.test(norm(q));
  }

  function asksWater(q){
    return /(вод|water|sea surface)/.test(norm(q));
  }

  function asksHalfMast(q){
    return /(половина копје|пола копје|половина јарбол|пола јарбол|полу јарбол|half mast|half staff|half-mast|half-staff)/.test(norm(q));
  }

  function asksCommercial(q){
    return /(комерц|реклам|трговск|маиц|топк|спортск.*опрем|commercial|advertis|trademark|shirt|jersey|ball|merch)/.test(norm(q));
  }

  function flagHandlingIntent(q){
    var z=norm(q);
    var flag=/(знаме|знамето|знамињ|flag|flags|banner)/.test(z);
    var handling=asksGround(q)||asksWater(q)||asksHalfMast(q)||asksCommercial(q);
    return flag&&handling;
  }

  function saudiSpecialAnswer(q){
    var mk=isMk(q);
    var special=isSaudiMention(q)||(asksWhichFlag(q)&&(asksGround(q)||asksWater(q)||asksHalfMast(q)));
    if(!special) return null;

    if(asksHalfMast(q)){
      return mk
        ? '🇸🇦 Посебен законски пример е Саудиска Арабија. Според Законот за знамето, националното знаме, знамето на Кралот и другите саудиски знамиња што ја носат Шахадата или курански стих не се спуштаат на половина копје. Ова е изречно кодифицирано правило, поврзано со светоста на религиозниот текст на знамето.'
        : '🇸🇦 Saudi Arabia is a special codified case. Under the Saudi Flag Law, the national flag, the King’s flag, and other Saudi flags bearing the Shahada or a Quranic verse are not flown at half-mast. This is an explicit legal rule connected with the sacred text carried on the flag.';
    }

    if(asksCommercial(q)){
      return mk
        ? '🇸🇦 За саудиското знаме важат и строги ограничувања за употреба: Законот забранува националното знаме да се користи како трговска марка, за комерцијално рекламирање или за други цели надвор од оние предвидени со закон. За конкретни производи (на пр. маици, топки или сувенири) треба да се провери и важечкото официјално упатство за употреба, наместо автоматски да се претпостави апсолутна забрана за секој предмет.'
        : '🇸🇦 The Saudi flag is also subject to strict use restrictions: the law prohibits using the national flag as a trademark, for commercial advertising, or for purposes outside those provided by law. For specific products such as shirts, balls or souvenirs, the current official usage guideline should also be checked rather than assuming an absolute ban on every item.';
    }

    if(asksGround(q)||asksWater(q)){
      var base=mk
        ? '🇸🇦 Посебен и експлицитно кодифициран пример е националното знаме на Саудиска Арабија. Законот за знамето изречно предвидува дека националното знаме и знамето на Кралот не смеат да ги допираат површините на земјата и водата. На знамето е испишана Шахадата — исламската изјава на верата — па со него се постапува со особена почит.'
        : '🇸🇦 A special, explicitly codified example is the national flag of Saudi Arabia. The Saudi Flag Law provides that the national flag and the King’s flag must not touch the surfaces of land or water. The flag bears the Shahada, the Islamic declaration of faith, and is therefore handled with particular reverence.';
      if(asksWhichFlag(q)){
        base += mk
          ? ' Во поширока протоколарна практика и другите национални знамиња не треба намерно да се влечат или оставаат на земја, но кај Саудиска Арабија оваа забрана е посебно и јасно пропишана со закон.'
          : ' In broader flag etiquette, other national flags should not intentionally be dragged or left on the ground either, but Saudi Arabia has a particularly explicit statutory prohibition.';
      }
      return base;
    }

    return mk
      ? '🇸🇦 Саудиското национално знаме е посебен протоколарно-правен пример поради Шахадата: не се спушта на половина копје и националното/кралското знаме не смеат да ги допираат површините на земјата и водата.'
      : '🇸🇦 The Saudi national flag is a special protocol-and-law case because it bears the Shahada: it is not flown at half-mast, and the national/royal flag must not touch the surfaces of land or water.';
  }

  function flagHandlingAnswer(q){
    if(!flagHandlingIntent(q)) return null;
    var mk=isMk(q);
    var sa=saudiSpecialAnswer(q);
    if(sa) return sa;

    if(asksAccidentalContact(q)){
      return mk
        ? '🚩 Ако национално/државно знаме случајно ја допре земјата или подот, веднаш се подигнува и се постапува достоинствено; ако е извалкано или оштетено, се чисти или се заменува според правилата на конкретната држава. Случајниот допир сам по себе не значи автоматски дека знамето мора да се уништи.'
        : '🚩 If a national flag accidentally touches the ground or floor, it should be lifted immediately and handled with dignity; if it is soiled or damaged, it should be cleaned or replaced according to that country’s rules. Accidental contact does not automatically mean the flag must be destroyed.';
    }

    return mk
      ? '🚩 Во професионалната протоколарна и церемонијална практика националните/државните знамиња не треба намерно да се влечат по земја, да лежат на земја или под, ниту да се третираат на начин што го нарушува достоинството на државниот симбол. Конкретните правни правила и национални кодекси се разликуваат по држава.'
      : '🚩 In professional protocol and ceremonial practice, national/state flags should not intentionally be dragged on the ground, left lying on the ground or floor, or handled in a way that diminishes the dignity of the national symbol. Exact legal rules and national flag codes vary by country.';
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

    if(id==='va'){
      if(mk){
        if(asksPhysicalSize(q)){
          return '📐 Знамето на Државата Ватикан нема една фиксна физичка големина; може да се изработува во различни димензии, но мора да ја задржи квадратната форма со сразмер 1:1 (ширина = висина).';
        }
        if(asksDifference(q)){
          return '📐 Знамето на Државата Ватикан е квадратно, со сразмер 1:1. По формата е исклучок меѓу националните знамиња: квадратна национална форма има и Швајцарија, додека повеќето државни знамиња се правоаголни; Непал има неправаголна, двојно-триаголна форма.';
        }
        return '📐 Знамето на Државата Ватикан има квадратна форма и сразмер 1:1 — ширината и висината се еднакви. И Швајцарија има квадратна национална форма; повеќето други национални знамиња се правоаголни.';
      }
      if(asksPhysicalSize(q)) return '📐 The Vatican City State flag has no single fixed physical size; it may be produced in different dimensions, but it keeps a square 1:1 proportion (width = height).';
      if(asksDifference(q)) return '📐 The Vatican City State flag is square, with a 1:1 ratio. Switzerland also has a square national flag, while most national flags are rectangular; Nepal has a non-rectangular double-pennant form.';
      return '📐 The Vatican City State flag is square with a 1:1 ratio: width equals height. Switzerland also has a square national flag; most other national flags are rectangular.';
    }

    if(id==='ch'){
      return mk
        ? '📐 Знамето на Швајцарија е квадратно, со сразмер 1:1. Државата Ватикан исто така има квадратна национална форма.'
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

  function directAnswer(q){return resourceAnswer(q)||flagHandlingAnswer(q)||flagGeometryAnswer(q)||null;}
  function hasDirectIntent(q){return isResourceQuestion(q)||flagHandlingIntent(q)||flagGeometryIntent(q);}

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
  setTimeout(install,900);
  setTimeout(install,2000);
  setTimeout(install,2900);
  setTimeout(install,3300);
  setTimeout(install,3700);
  setTimeout(install,4600);
})();

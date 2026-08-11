/* WPA Symbols Context Intent Guard v1.4 — 2026-08-11
   Purpose: understand short natural follow-up questions in the Symbols assistant,
   including resources, flag geometry/ratio, flag-handling protocol and anthem
   ceremony timing/order, and prevent unrelated legacy answers from replacing a
   direct expert answer.

   Selected protocol source notes:
   - Law of the Flag of the Kingdom of Saudi Arabia (Bureau of Experts, in force)
     https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/03de5462-eda0-4dd6-9efa-a9a700f1f802/2
   - Canadian Armed Forces Heritage Manual, Ch.7 Sec.3: where several anthems are
     played, timing/order differs depending on whether they are at the beginning
     or end of an event.
     https://www.canada.ca/en/services/defence/caf/military-identity-system/heritage-manual/chapter-7/section-3.html
   - FIFA World Cup 2026 protocol: national anthems are a pre-match ceremony element.
     https://legal.fifa.com/organisation/media-releases/debut-fan-centric-pre-match-ceremony-world-cup-2026
   - IOC Olympic Values Education Programme: winner's national anthem is played
     during the medal ceremony while flags are raised.
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

  var loadPromise=fetchJson('./data/active-runtime-197.json?v=20260811-context5')
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

  function anthemProtocolIntent(q){
    var z=norm(q);
    var anthem=/(химн|anthem|anthems)/.test(z);
    var protocol=/(меѓународн|правил|протокол|церемон|настан|почет|средин|крај|отворањ|затворањ|пред почет|по заврш|кога|редослед|позициј|момент|timing|international rule|protocol|ceremon|event|begin|start|middle|end|opening|closing|when|order)/.test(z);
    return anthem&&protocol;
  }

  function anthemProtocolAnswer(q){
    if(!anthemProtocolIntent(q)) return null;
    var z=norm(q), mk=isMk(q);
    var sports=/(спорт|фудбал|натпревар|меч|sport|football|match|game)/.test(z);
    var medals=/(медал|победник|наград|victory|medal|award|winner)/.test(z);
    var order=/(редослед|која прва|која последна|домаќин|гостин|повеќе химн|две химн|order|host|guest|which first|which last|multiple anthem|two anthem)/.test(z);
    var middle=/(средин|middle|during the event|during event)/.test(z);
    var ending=/(крај|затворањ|по заврш|end|closing|at the end)/.test(z);
    var beginning=/(почет|отворањ|пред почет|begin|start|opening|pre match|pre-match)/.test(z);

    if(sports&&medals){
      return mk
        ? '🎼 Кај спортските церемонии позицијата на химната зависи од конкретниот протокол. На олимписка церемонија на доделување медали, химната на победникот се свири во рамките на церемонијата додека се подигаат знамињата — значи не мора да биде на самиот почеток или крај на целиот настан.'
        : '🎼 In sports ceremonies, anthem timing depends on the governing protocol. At an Olympic medal ceremony, the winner’s national anthem is played within the ceremony while the flags are raised, so it is not necessarily at the very beginning or end of the whole event.';
    }

    if(sports){
      return mk
        ? '🎼 Во спортот нема едно правило за сите дисциплини и федерации. На пример, FIFA ги поставува националните химни во преднатпреварувачката церемонија, пред почетокот на натпреварот; кај церемонии на медали химната може да се свири подоцна, во моментот на доделувањето.'
        : '🎼 In sport there is no single placement rule for every federation and competition. FIFA, for example, places national anthems in the pre-match ceremony before play begins, while medal ceremonies may use the anthem later at the moment of the award.';
    }

    if(order){
      return mk
        ? '🎼 Редоследот на повеќе национални химни не треба да се претставува како едно универзално меѓународно правило. Тој зависи од видот на церемонијата и од протоколот на домаќинот/организаторот. На пример, канадскиот воен протокол предвидува дека ако повеќе химни се свират на почеток, канадската како домаќин се свири прва, а ако се свират на крај — последна. За билатерален или државен настан треба да се примени конкретниот протокол на државата домаќин.'
        : '🎼 The order of multiple national anthems should not be presented as one universal international rule. It depends on the ceremony and the host/organizer’s protocol. For example, Canadian military protocol places the Canadian host anthem first when several anthems are played at the beginning, and last when they are played at the end. For bilateral or state events, use the specific host-state protocol.';
    }

    if(middle&&!beginning&&!ending){
      return mk
        ? '🎼 Химна може да се свири и во текот на настанот, но само кога е врзана за конкретен формален чин — на пример доделување медал/одликување, подигање знаме или друга пропишана церемонијална секвенца. Не се користи како обична музичка пауза или позадинска музика.'
        : '🎼 An anthem may be played during an event when it is tied to a specific formal act, such as an award, flag raising or another prescribed ceremonial sequence. It should not be treated as ordinary intermission or background music.';
    }

    if(ending&&!beginning){
      return mk
        ? '🎼 Да, химна може да биде предвидена и на крајот на настанот, ако тоа го бара конкретниот национален, институционален или организациски протокол. Но тоа не е универзално правило за сите настани; редоследот и позицијата мора да се утврдат според видот на церемонијата и домаќинот.'
        : '🎼 Yes, an anthem may be prescribed at the end of an event if the relevant national, institutional or organizational protocol calls for it. That is not a universal rule for every event; placement and order must follow the ceremony type and host protocol.';
    }

    if(beginning&&!middle&&!ending){
      return mk
        ? '🎼 Да, националните химни многу често се свират во отворачката или пречекувачката церемонијална секвенца, но не постои една единствена позиција што важи за секој меѓународен настан. Точниот момент зависи од видот на настанот и од правилата на домаќинот или надлежната организација.'
        : '🎼 Yes, national anthems are very often used in an opening or arrival ceremonial sequence, but there is no single placement that applies to every international event. The exact moment depends on the event type and the rules of the host or governing organization.';
    }

    return mk
      ? '🎼 Не постои една единствена позиција на националната химна што важи за сите меѓународни настани. На почеток — често се користи при отворање, пречек или пред официјалниот/спортскиот дел; во текот — само ако е врзана за конкретен церемонијален чин, како подигање знаме или доделување награда; на крај — може да биде предвидена со национален или организациски протокол. Клучно е химната да не се користи како обична позадинска музика. За точен распоред мора да се знаат видот на настанот, државата домаќин и надлежниот протокол.'
      : '🎼 There is no single anthem position that applies to every international event. At the beginning it is often used for an opening, arrival or pre-event ceremonial sequence; during the event it may accompany a defined ceremonial act such as a flag raising or award; at the end it may be prescribed by national or organizational protocol. The key is that a national anthem is not ordinary background music. Exact placement depends on the event type, host state and governing protocol.';
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

  function directAnswer(q){return resourceAnswer(q)||anthemProtocolAnswer(q)||flagHandlingAnswer(q)||flagGeometryAnswer(q)||null;}
  function hasDirectIntent(q){return isResourceQuestion(q)||anthemProtocolIntent(q)||flagHandlingIntent(q)||flagGeometryIntent(q);}

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

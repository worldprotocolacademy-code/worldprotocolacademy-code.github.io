/* WPA Symbols Context Intent Guard v1.7 — 2026-08-11
   Central question-first guard for natural WPA Symbols queries.

   Covered specialist intents:
   - natural/mineral resources
   - national vs state/government/civil flag terminology
   - funeral/coffin use of the state flag, incl. Macedonian Latin transliteration
   - anthem ceremony timing/order
   - flag handling / Saudi special legal rules
   - flag geometry / ratio / shape

   Selected source notes:
   - Ministry of Justice LDBIS: Law on the Use of the Coat of Arms, Flag and Anthem
     of the Republic of Macedonia, Official Gazette 32/97; amendment 110/08.
     https://ldbis.pravda.gov.mk/PregledNaZakon.aspx?id=4515
   - Article 23: the flag may be used to cover a coffin, but must not be lowered
     into the grave.
   - Articles 27-28: anthem may be played at beginning, middle or end according
     to greatest dignity; when performed in the Republic with a foreign anthem,
     the foreign anthem/song is performed first and the Macedonian anthem follows.
   - Saudi Flag Law (Bureau of Experts):
     https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/03de5462-eda0-4dd6-9efa-a9a700f1f802/2
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
  function isMk(q){
    return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));
  }

  var EXTRA_ALIASES={
    us:['сад','соединети американски држави','америка','united states','united states of america','usa','america'],
    mk:['северна македонија','македонија','република македонија','severna makedonija','makedonija','republika makedonija','north macedonia','macedonia','republic of macedonia'],
    gb:['обединето кралство','велика британија','британија','united kingdom','great britain','britain','uk'],
    cz:['чешка','чешка република','чешката република','czechia','czech republic'],
    va:['ватикан','држава ватикан','државата ватикан','ватикан сити','светата столица','holy see','vatican','vatican city','vatican city state'],
    ch:['швајцарија','switzerland','swiss'],
    np:['непал','nepal'],
    sa:['саудиска арабија','кралството саудиска арабија','саудиско знаме','саудиското знаме','saudiska arabija','saudi arabia','kingdom of saudi arabia','saudi flag'],
    ps:['палестина','државата палестина','state of palestine','palestine']
  };

  function fetchJson(url){
    return fetch(url,{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
  }

  var loadPromise=fetchJson('./data/active-runtime-197.json?v=20260811-context8')
    .then(function(d){
      if(d&&Array.isArray(d.records)){
        active=d;
        ready=d.records.length>=190;
      }
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
    var padded=' '+text+' ';
    var exact=' '+alias+' ';
    if(padded.indexOf(exact)>=0) return 1000+alias.length;
    if(alias.length>=5&&text.indexOf(alias)>=0) return 700+alias.length;
    return 0;
  }

  function bestEntity(q){
    if(!ready) return null;
    var text=norm(q),best=null,bestScore=0;
    active.records.forEach(function(r){
      aliasesFor(r).forEach(function(a){
        var score=entityScore(text,a);
        if(score>bestScore){bestScore=score;best=r;}
      });
    });
    return best;
  }

  function previousUserQuestion(){
    var body=document.getElementById('chatBody');
    if(!body) return '';
    var nodes=body.querySelectorAll('.wpa-chat-msg.user');
    return nodes.length?s(nodes[nodes.length-1].textContent).trim():'';
  }

  /* ---------------- Resources ---------------- */

  function explicitResourceIntent(q){
    var z=norm(q);
    return /ресурс|рудн|богатств|минерал|руди|суровин|природн.*богат|resurs|rudn|bogatstv|mineral|rudi|surovin|resource|natural wealth|natural resources|raw materials/.test(z);
  }

  function shortPossessionIntent(q){
    var z=norm(q);
    return /со што располага|со што.*располага|со што е богат|со што е богата|што поседува|кои богатства|so sto raspolaga|so shto raspolaga|so sto e bogat|sto poseduva|what resources|what minerals|rich in|what does .* possess/.test(z);
  }

  function isResourceQuestion(q){
    if(explicitResourceIntent(q)) return true;
    if(!shortPossessionIntent(q)) return false;
    if(/со што.*располага|со што е богат|со што е богата|so sto.*raspolaga|so shto.*raspolaga|what resources|rich in/.test(norm(q))) return true;
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

  /* ---------------- Flag terminology ---------------- */

  function flagTerminologyIntent(q){
    var z=norm(q);
    var flag=/(знаме|знамето|знамиња|zname|znameto|znaminja|flag|flags)/.test(z);
    var national=/(националн|nacionaln|national)/.test(z);
    var state=/(државн|drzavn|state flag|government flag|governmental flag)/.test(z);
    var civil=/(цивилн|civil flag|civil ensign)/.test(z);
    var distinction=/(разлик|разлика|исто|разликува|што значи|која е|што е|razlik|isto|razlikuva|sto znaci|shto znaci|what is the difference|difference between|same|distinction|meaning)/.test(z);
    return flag&&distinction&&((national&&state)||(state&&civil)||(national&&civil));
  }

  function flagTerminologyAnswer(q){
    if(!flagTerminologyIntent(q)) return null;
    var mk=isMk(q);
    if(mk){
      return '🏳️ „Национално“ и „државно“ знаме многу често се користат како синоними за официјалното знаме што ја претставува суверената држава. Но во стручната вексилолошка и правна терминологија понекогаш има потесна разлика: „national flag“ е општото национално знаме, а „state/government flag“ може да биде посебна варијанта резервирана за државни органи, често различна од „civil flag“ што ја користат граѓаните. Значи, нема една универзална разлика што важи за сите држави — се проверува законодавството и системот на конкретната земја. Во македонскиот закон што го користиме се уредува едно знаме на државата, без посебна поделба на civil/state варијанти. Знамето на ОН е нешто друго: тоа е знаме на меѓународна организација, не национално или државно знаме.';
    }
    return '🏳️ “National flag” and “state flag” are often used as synonyms for the official flag representing a sovereign country. In specialist vexillological/legal usage, however, “state/government flag” can mean a variant reserved for public authorities, distinct from a “civil flag” used by citizens. There is no single universal distinction across all countries; the terminology depends on each country’s law and flag system. The UN flag is different again: it is the flag of an international organization, not a national/state flag.';
  }

  /* ---------------- Funeral / coffin flag protocol ---------------- */

  function funeralFlagIntent(q){
    var z=norm(q);
    var flag=/(знаме|знамето|државно знаме|државното знаме|zname|znameto|drzavno zname|drzavnoto zname|flag)/.test(z);
    var funeral=/(погреб|погребна|погребен|сандак|сандакот|ковчег|ковчегот|гроб|pogreb|pogrebna|pogreben|sandak|sandokot|kovceg|kovcheg|kovcegot|kovchegot|grob|funeral|coffin|casket|grave|burial)/.test(z);
    return flag&&funeral;
  }

  function securityForcesContext(q){
    return /(безбедносн|безбедносните сили|полици|арми|војск|вооружен|bezbednos|bezbednosnite sili|polic|armij|armija|vojsk|vooruzen|security force|security forces|police|army|armed forces|military)/.test(norm(q));
  }

  function asksCoffinCover(q){
    return /(покри|постав|став|на сандак|на сандакот|на ковчег|на ковчегот|pokri|postav|stavi|na sandak|na sandakot|na kovceg|na kovcegot|na kovcheg|na kovchegot|cover|drape|place.*coffin|place.*casket)/.test(norm(q));
  }

  function asksIntoGrave(q){
    return /(спушт.*гроб|во гроб|v grob|vo grob|spust.*grob|lower.*grave|into the grave|into grave)/.test(norm(q));
  }

  function funeralFlagAnswer(q){
    if(!funeralFlagIntent(q)) return null;
    var mk=isMk(q);
    var r=bestEntity(q);

    if(r&&s(r.id).toLowerCase()!=='mk') return null;

    if(asksIntoGrave(q)){
      return mk
        ? '🇲🇰 Ако мислите на државното знаме на Северна Македонија: не смее да се спушти во гробот. Член 23 од Законот за употребата на грбот, знамето и химната дозволува знамето да се користи за покривање на мртовечки сандак, но изречно забранува тоа да се спушти во гробот.'
        : '🇲🇰 If you mean the state flag of North Macedonia: it must not be lowered into the grave. Article 23 of the law permits the flag to cover a coffin, but expressly states that it must not be lowered into the grave.';
    }

    if(asksCoffinCover(q)||securityForcesContext(q)){
      var answer=mk
        ? '🇲🇰 Да. Ако мислите на државното знаме на Северна Македонија, член 23 од Законот за употребата на грбот, знамето и химната предвидува дека знамето може да се користи за покривање на мртовечки сандак, но не смее да се спушти во гробот.'
        : '🇲🇰 Yes. If you mean the state flag of North Macedonia, Article 23 of the law provides that the flag may be used to cover a coffin, but it must not be lowered into the grave.';

      if(securityForcesContext(q)){
        answer += mk
          ? ' Самото законско правило за покривање на сандакот не е ограничено само на припадници на безбедносните сили. Одделно прашање е дали конкретното лице има право на службена погребна церемонија или државни/воени/полициски почести — тоа се утврдува според прописите и церемонијалните правила на надлежната служба.'
          : ' The statutory permission to cover a coffin is not limited only to security-force personnel. A separate question is whether a particular person is entitled to an official funeral or state/military/police honours, which depends on the rules of the competent service.';
      }
      return answer;
    }

    return mk
      ? '🇲🇰 Ако прашањето се однесува на Северна Македонија: државното знаме може да се користи за покривање на мртовечки сандак, но не смее да се спушти во гробот. За право на конкретни службени или воени/полициски почести треба да се проверат и посебните прописи на надлежната институција.'
      : '🇲🇰 If the question concerns North Macedonia: the state flag may be used to cover a coffin, but it must not be lowered into the grave. Entitlement to specific official, military or police honours must also be checked under the competent institution’s rules.';
  }

  /* ---------------- Anthem protocol ---------------- */

  function anthemProtocolIntent(q){
    var z=norm(q);
    var anthem=/(химн|himn|anthem|anthems)/.test(z);
    var protocol=/(меѓународн|правил|протокол|церемон|настан|манифест|почет|средин|крај|отворањ|затворањ|пред почет|по заврш|кога|редослед|позициј|момент|достоинство|megjunarod|meg_junarod|pravilo|protokol|ceremon|nastan|manifest|pocet|pochet|sredin|kraj|otvor|zatvor|redosled|dostoin|timing|international rule|protocol|event|manifestation|begin|start|middle|end|opening|closing|when|order|dignity)/.test(z);
    return anthem&&protocol;
  }

  function isMacedonianAnthemContext(q){
    var z=norm(q);
    return /(македон|република македонија|северна македонија|нашата химна|нашата државна химна|кај нас|во нашата држава|makedon|republika makedonija|severna makedonija|nasata himna|kaj nas|vo nasata drzava|macedonia|north macedonia|republic of macedonia|our anthem)/.test(z);
  }

  function anthemProtocolAnswer(q){
    if(!anthemProtocolIntent(q)) return null;
    var z=norm(q),mk=isMk(q);
    var sports=/(спорт|фудбал|натпревар|меч|sport|football|match|game)/.test(z);
    var medals=/(медал|победник|наград|victory|medal|award|winner)/.test(z);
    var order=/(редослед|која прва|која последна|домаќин|гостин|повеќе химн|две химн|странска химн|redosled|koja prva|koja posledna|domakin|gostin|povekje himn|stranska himn|order|host|guest|which first|which last|multiple anthem|two anthem|foreign anthem)/.test(z);
    var middle=/(средин|sredin|middle|during the event|during event)/.test(z);
    var ending=/(крај|затворањ|по заврш|kraj|zatvor|po zavrs|end|closing|at the end)/.test(z);
    var beginning=/(почет|отворањ|пред почет|pocet|pochet|otvor|pred pocet|begin|start|opening|pre match|pre-match)/.test(z);
    var mkContext=isMacedonianAnthemContext(q);

    if(mkContext&&order){
      return mk
        ? '🎼 Според член 28 од Законот за употребата на грбот, знамето и химната, кога химната се изведува во Републиката заедно со химна на странска држава или свечена песна на меѓународна/странска организација, прво се изведува странската химна или свечената песна, а потоа македонската химна.'
        : '🎼 Under Article 28 of the Macedonian law, when the anthem is performed in the Republic together with a foreign national anthem or ceremonial song of an international/foreign organization, the foreign anthem/song is performed first and the Macedonian anthem follows.';
    }

    if(mkContext){
      return mk
        ? '🎼 Да — кај нас сите три позиции се изречно дозволени. Член 27 предвидува дека химната може да се свири на почетокот, средината или крајот од манифестацијата, зависно од тоа на кој начин ќе ѝ се даде најголемо достоинство. Истиот член бара химната секогаш да се свири со достоинство и да не се користи како дел од друг вид музика.'
        : '🎼 Yes — the Macedonian law expressly permits all three positions. Article 27 provides that the anthem may be played at the beginning, middle or end of a manifestation, depending on which placement gives it the greatest dignity. It must be performed with dignity and not used as part of another kind of music.';
    }

    if(sports&&medals){
      return mk
        ? '🎼 Кај спортските церемонии позицијата на химната зависи од конкретниот протокол. На олимписка церемонија на доделување медали, химната на победникот се свири во рамките на церемонијата додека се подигаат знамињата — значи не мора да биде на самиот почеток или крај на целиот настан.'
        : '🎼 In sports ceremonies, anthem timing depends on the governing protocol. At an Olympic medal ceremony, the winner’s national anthem is played within the ceremony while flags are raised.';
    }

    if(sports){
      return mk
        ? '🎼 Во спортот нема едно правило за сите дисциплини и федерации. На пример, кај фудбалот химните вообичаено се дел од преднатпреварувачката церемонија, додека кај церемонии на медали химната може да се свири подоцна, во моментот на доделувањето.'
        : '🎼 In sport there is no single placement rule for every federation and competition. Anthems may be pre-match elements, while medal ceremonies may use an anthem later at the award moment.';
    }

    if(order){
      return mk
        ? '🎼 Редоследот на повеќе национални химни не е едно универзално меѓународно правило; зависи од државата домаќин, видот на церемонијата и применливиот протокол. Како конкретен национален пример, македонскиот закон предвидува странската химна да се изведе прва, а домашната потоа.'
        : '🎼 The order of multiple national anthems is not governed by one universal international rule; it depends on the host state, ceremony type and applicable protocol.';
    }

    if(middle&&!beginning&&!ending){
      return mk
        ? '🎼 Да, химна може да се свири и во средината на настанот ако применливиот национален или организациски протокол го дозволува тоа и ако со таа позиција се зачувува потребното достоинство. Македонскиот закон е експлицитен пример: дозволува почеток, средина или крај.'
        : '🎼 Yes, an anthem may be played in the middle of an event when the applicable protocol allows it and the placement preserves the required dignity.';
    }

    if(ending&&!beginning){
      return mk
        ? '🎼 Да, химна може да биде предвидена и на крајот на настанот. Македонскиот закон, на пример, изречно го дозволува крајот како една од трите позиции, под критериумот на најголемо достоинство.'
        : '🎼 Yes, an anthem may be prescribed at the end of an event. The Macedonian law expressly permits the end as one of three possible positions under the criterion of greatest dignity.';
    }

    if(beginning&&!middle&&!ending){
      return mk
        ? '🎼 Да, химната може да се свири на почетокот. Македонскиот закон изречно го наведува почетокот како дозволена позиција, заедно со средината и крајот, при што критериум е каде ќе ѝ се даде најголемо достоинство.'
        : '🎼 Yes, an anthem may be played at the beginning. The Macedonian law expressly lists the beginning together with the middle and end.';
    }

    return mk
      ? '🎼 Почетокот, средината и крајот можат да бидат правилна позиција, зависно од применливиот национален или организациски протокол; нема една единствена позиција што важи за сите меѓународни настани. Македонскиот закон е особено јасен пример: ги дозволува сите три позиции според критериумот на најголемо достоинство.'
      : '🎼 Beginning, middle and end can all be correct placements depending on the applicable national or organizational protocol; there is no single position governing every international event.';
  }

  /* ---------------- Flag handling ---------------- */

  function isSaudiMention(q){
    return /(саудиск|саудиј|saudisk|saudij|saudi arabia|saudi flag|kingdom of saudi)/.test(norm(q));
  }

  function asksWhichFlag(q){
    return /(кое знаме|кои знамиња|кое од знамињ|koe zname|koi znaminja|which flag|which flags|what flag)/.test(norm(q));
  }

  function asksAccidentalContact(q){
    return /(случај|ненамер|по грешка|slucaj|sluchaj|nenamerno|po greska|accident|unintentional|by mistake)/.test(norm(q));
  }

  function asksGround(q){
    return /(земј|тло|подот|под |zemj|tlo|podot|floor|ground|влеч|vlec|vlech|drag|леж|lezi|lezhi|постав.*земј|став.*земј|postav.*zemj|stav.*zemj|допир.*земј|dopir.*zemj|touch.*ground|touch.*floor)/.test(norm(q));
  }

  function asksWater(q){return /(вод|voda|water|sea surface)/.test(norm(q));}

  function asksHalfMast(q){
    return /(половина копје|пола копје|половина јарбол|пола јарбол|полу јарбол|polovina kopje|pola kopje|polovina jarbol|pola jarbol|half mast|half staff|half-mast|half-staff)/.test(norm(q));
  }

  function asksCommercial(q){
    return /(комерц|реклам|трговск|маиц|топк|спортск.*опрем|komerc|reklam|trgovsk|maic|topk|commercial|advertis|trademark|shirt|jersey|ball|merch)/.test(norm(q));
  }

  function flagHandlingIntent(q){
    var z=norm(q);
    var flag=/(знаме|знамето|знамињ|zname|znameto|flag|flags|banner)/.test(z);
    return flag&&(asksGround(q)||asksWater(q)||asksHalfMast(q)||asksCommercial(q));
  }

  function saudiSpecialAnswer(q){
    var mk=isMk(q);
    var special=isSaudiMention(q)||(asksWhichFlag(q)&&(asksGround(q)||asksWater(q)||asksHalfMast(q)));
    if(!special) return null;

    if(asksHalfMast(q)){
      return mk
        ? '🇸🇦 Посебен законски пример е Саудиска Арабија. Според Законот за знамето, националното знаме, знамето на Кралот и другите саудиски знамиња што ја носат Шахадата или курански стих не се спуштаат на половина копје.'
        : '🇸🇦 Saudi Arabia is a special codified case. Saudi flags bearing the Shahada or a Quranic verse are not flown at half-mast.';
    }

    if(asksCommercial(q)){
      return mk
        ? '🇸🇦 За саудиското знаме важат строги ограничувања за употреба: законот забранува националното знаме да се користи како трговска марка, за комерцијално рекламирање или за цели надвор од оние предвидени со закон. За конкретни производи треба да се провери и важечкото официјално упатство.'
        : '🇸🇦 The Saudi flag is subject to strict use restrictions, including limits on trademark and commercial advertising use.';
    }

    if(asksGround(q)||asksWater(q)){
      var base=mk
        ? '🇸🇦 Посебен и експлицитно кодифициран пример е националното знаме на Саудиска Арабија. Законот изречно предвидува дека националното знаме и знамето на Кралот не смеат да ги допираат површините на земјата и водата. На знамето е испишана Шахадата, па со него се постапува со особена почит.'
        : '🇸🇦 A special, explicitly codified example is Saudi Arabia: the national flag and the King’s flag must not touch the surfaces of land or water.';
      if(asksWhichFlag(q)){
        base+=mk
          ? ' Во поширока протоколарна практика и другите национални знамиња не треба намерно да се влечат или оставаат на земја, но кај Саудиска Арабија забраната е посебно и јасно пропишана со закон.'
          : ' Other national flags should also be handled with dignity, but Saudi Arabia has a particularly explicit statutory prohibition.';
      }
      return base;
    }

    return null;
  }

  function flagHandlingAnswer(q){
    if(!flagHandlingIntent(q)) return null;
    var mk=isMk(q);
    var sa=saudiSpecialAnswer(q);
    if(sa) return sa;

    if(asksAccidentalContact(q)){
      return mk
        ? '🚩 Ако национално/државно знаме случајно ја допре земјата или подот, веднаш се подигнува и се постапува достоинствено; ако е извалкано или оштетено, се чисти или се заменува според правилата на конкретната држава.'
        : '🚩 If a national flag accidentally touches the ground or floor, it should be lifted immediately and handled with dignity; if soiled or damaged, follow that country’s rules.';
    }

    return mk
      ? '🚩 Во професионалната протоколарна и церемонијална практика националните/државните знамиња не треба намерно да се влечат по земја, да лежат на земја или под, ниту да се третираат на начин што го нарушува достоинството на државниот симбол. Конкретните правни правила се разликуваат по држава.'
      : '🚩 In professional protocol and ceremonial practice, national/state flags should not intentionally be dragged or left on the ground. Exact legal rules vary by country.';
  }

  /* ---------------- Flag geometry ---------------- */

  function flagGeometryIntent(q){
    var z=norm(q);
    var flag=/(знаме|знамето|знамиња|zname|znameto|flag|banner)/.test(z);
    var geometry=/(сразмер|размер|сооднос|пропорц|големин|форма|облик|квадрат|правоагол|поразлич|различ|останатите|srazmer|razmer|soodnos|proporc|golemin|forma|oblik|kvadrat|pravoagol|razlic|razlich|ostanatite|ratio|proportion|aspect|dimension|size|shape|square|rectang|different|unique|other countries)/.test(z);
    return flag&&geometry;
  }

  function parseRatio(text){
    var m=s(text).match(/(?:Размер|ratio|proportion)\s*([0-9]+(?:\.[0-9]+)?)\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
    return m?m[1]+':'+m[2]:null;
  }

  function geometryFromRecord(r){
    var t=s(r&&r.flag_summary_mk).trim();
    var z=norm(t),ratio=parseRatio(t),shape='';
    if(/квадрат|square/.test(z)){shape='square';ratio=ratio||'1:1';}
    else if(/неправоагол|non rectangular|double pennant|два триагол|триагол/.test(z)) shape='nonrectangular';
    else if(ratio) shape='rectangular';
    return {text:t,ratio:ratio,shape:shape};
  }

  function asksPhysicalSize(q){
    var z=norm(q);
    return /(големин|golemin|dimension|physical size|колкава|колкав|kolkava|kolkav)/.test(z)&&!/(сразмер|размер|сооднос|пропорц|srazmer|razmer|soodnos|proporc|ratio|proportion|aspect)/.test(z);
  }

  function asksDifference(q){
    return /(поразлич|различ|останатите|во однос на|porazlic|razlic|ostanatite|vo odnos na|different|unique|other countries)/.test(norm(q));
  }

  function flagGeometryAnswer(q){
    if(!flagGeometryIntent(q)) return null;
    var r=bestEntity(q);
    if(!r) return null;
    var id=s(r.id).toLowerCase(),g=geometryFromRecord(r),mk=isMk(q);

    if(id==='va'){
      if(mk){
        if(asksPhysicalSize(q)) return '📐 Знамето на Државата Ватикан нема една фиксна физичка големина; може да се изработува во различни димензии, но мора да ја задржи квадратната форма со сразмер 1:1 (ширина = висина).';
        if(asksDifference(q)) return '📐 Знамето на Државата Ватикан е квадратно, со сразмер 1:1. Квадратна национална форма има и Швајцарија, додека повеќето државни знамиња се правоаголни; Непал има неправаголна, двојно-триаголна форма.';
        return '📐 Знамето на Државата Ватикан има квадратна форма и сразмер 1:1 — ширината и висината се еднакви. И Швајцарија има квадратна национална форма.';
      }
      if(asksPhysicalSize(q)) return '📐 The Vatican City State flag has no single fixed physical size; it keeps a square 1:1 proportion.';
      if(asksDifference(q)) return '📐 The Vatican City State flag is square, with a 1:1 ratio. Switzerland is also square, while most national flags are rectangular; Nepal is non-rectangular.';
      return '📐 The Vatican City State flag is square with a 1:1 ratio.';
    }

    if(id==='ch'){
      return mk
        ? '📐 Знамето на Швајцарија е квадратно, со сразмер 1:1. Државата Ватикан исто така има квадратна национална форма.'
        : '📐 The Swiss national flag is square, with a 1:1 ratio. Vatican City State also has a square national flag.';
    }

    if(id==='np'){
      return mk
        ? '📐 Знамето на Непал не е правоаголно: составено е од две споени триаголни форми. Затоа не треба да се сведува на стандарден правоаголен сразмер како 2:3 или 1:2.'
        : '📐 Nepal’s national flag is non-rectangular and formed by two joined triangular/pennant shapes.';
    }

    if(g.ratio){
      if(mk) return '📐 '+s(r.name_mk||r.id).trim()+' — сразмер на знамето '+g.ratio+(g.shape==='rectangular'?' (правоаголна форма).':'.');
      return '📐 '+s(r.name_mk||r.id).trim()+' — flag ratio '+g.ratio+(g.shape==='rectangular'?' (rectangular form).':'.');
    }

    return null;
  }

  /* ---------------- Dispatcher / wrapper ---------------- */

  function directAnswer(q){
    return resourceAnswer(q)||flagTerminologyAnswer(q)||funeralFlagAnswer(q)||anthemProtocolAnswer(q)||flagHandlingAnswer(q)||flagGeometryAnswer(q)||null;
  }

  function hasDirectIntent(q){
    return isResourceQuestion(q)||flagTerminologyIntent(q)||funeralFlagIntent(q)||anthemProtocolIntent(q)||flagHandlingIntent(q)||flagGeometryIntent(q);
  }

  function add(role,text){
    var body=document.getElementById('chatBody');
    if(!body) return;
    var d=document.createElement('div');
    d.className='wpa-chat-msg '+role;
    d.textContent=text;
    body.appendChild(d);
    body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaContextIntentV1){
      var prev=window.sendChat;
      var fn=async function(){
        var input=document.getElementById('chatInput');
        if(!input) return prev();
        var q=input.value.trim();
        if(!q) return prev();
        if(hasDirectIntent(q)){
          try{await loadPromise;}catch(e){}
          var a=directAnswer(q);
          if(a){
            add('user',q);
            input.value='';
            add('bot',a);
            input.focus();
            return;
          }
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

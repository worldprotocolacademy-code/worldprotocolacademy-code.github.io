/* WPA Symbols Expert Assistant v2.1
   Interactive laboratory layer for the public WPA Protocol Symbols page.

   Core modes:
   - reverse identification: clue -> country / protocol entity
   - eagle-on-flag reasoning
   - instrumental anthem reasoning
   - Symbol DNA decomposition
   - What is wrong? diagnostic scenarios
   - Protocol Risk Lens for country pairs
   - comparison mode
   - expert country challenges
   - Protocol Trap mode

   Grounding rule:
   This layer reasons only from data already exposed by the active WPA Symbols
   page/runtime. It must not invent missing symbolic, legal or historical facts.
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
  function uniq(a){ return Array.from(new Set(a.filter(Boolean))); }
  function sample(a){ return a && a.length ? a[Math.floor(Math.random()*a.length)] : null; }

  function countries(){ return Array.isArray(window.worldData) ? window.worldData : []; }
  function eagleMap(){ return window.flagsWithEagles && typeof window.flagsWithEagles === 'object' ? window.flagsWithEagles : {}; }
  function instrumentalMap(){ return window.instrumentalAnthems && typeof window.instrumentalAnthems === 'object' ? window.instrumentalAnthems : {}; }

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

  function header(title){ return '◆ WPA SYMBOL LAB · ' + title; }

  function verifiedNote(mk){
    return mk
      ? 'WPA белешка: за официјален настан, временски чувствителните податоци повторно се потврдуваат од официјален државен или дипломатски извор.'
      : 'WPA note: for official-event use, time-sensitive data should be reconfirmed from an official state or diplomatic source.';
  }

  function noInference(mk){
    return mk
      ? 'Не пополнувам празни полиња со претпоставка. Ако активниот запис не го содржи фактот, го означувам како непотврден.'
      : 'I do not fill missing fields by assumption. If the active record does not contain the fact, I mark it as unconfirmed.';
  }

  function answerEagles(mk,q){
    var map=eagleMap(), ids=Object.keys(map);
    if(!ids.length) return null;

    var matched=countryMatches(q);
    if(matched.length===1){
      var c=matched[0], d=map[c.id];
      if(d){
        return lines([
          header(mk?'ОРЕЛ НА ЗНАМЕ':'EAGLE ON FLAG'),
          '🦅 '+c.n,
          mk?'Да — во активниот WPA симболички слој ова знаме е означено со орел.':'Yes — in the active WPA symbol layer this flag is marked as containing an eagle.',
          txt(d),
          mk?'Protocol Trap: секогаш разликувај орел на самото знаме од орел што постои само во грбот или амблемот.':'Protocol Trap: always distinguish an eagle on the flag itself from an eagle appearing only in the coat of arms or emblem.',
          verifiedNote(mk)
        ]);
      }
      return lines([
        header(mk?'ОРЕЛ НА ЗНАМЕ':'EAGLE ON FLAG'),
        c.n,
        mk?'Во активната WPA мапа за орли оваа држава не е означена како потврден пример. Не заклучувам автоматски дека орел нема.':'This country is not marked as a confirmed example in the active WPA eagle map. I will not automatically infer absence.',
        noInference(mk)
      ]);
    }

    return lines([
      header(mk?'ОБРАТНО ПРЕПОЗНАВАЊЕ':'REVERSE IDENTIFICATION'),
      mk?'🦅 Потврдени WPA примери каде орелот е дел од знамето:':'🦅 WPA-confirmed examples where an eagle is part of the flag:',
      ids.map(function(id){ return '• '+countryName(id)+' — '+txt(map[id]); }).join('\n'),
      mk?'Следно можеш да прашаш: „Која од овие држави има двоглав орел?“ или да наведеш конкретна држава за Protocol Trap проверка.':'Next you can ask which of these uses a double-headed eagle, or name a country for a Protocol Trap check.'
    ]);
  }

  function answerInstrumental(mk,q){
    var map=instrumentalMap(), ids=Object.keys(map);
    if(!ids.length) return null;

    var matched=countryMatches(q);
    if(matched.length===1){
      var c=matched[0], d=map[c.id];
      if(d){
        return lines([
          header(mk?'ИНСТРУМЕНТАЛНА ХИМНА':'INSTRUMENTAL ANTHEM'),
          '🎼 '+c.n,
          mk?'Да — WPA ја бележи како инструментална / без официјален вокален текст за протоколарната верзија.':'Yes — WPA records it as instrumental / without an official vocal text for the protocol version.',
          'Химна / Anthem: '+txt(d.name||d.title||''),
          txt(d.note||''),
          verifiedNote(mk)
        ]);
      }
      return lines([
        header(mk?'ИНСТРУМЕНТАЛНА ХИМНА':'INSTRUMENTAL ANTHEM'),
        c.n,
        mk?'Не е означена како инструментална во активната WPA инструментална мапа. Не давам негативен заклучок без проверка на официјалната химна.':'It is not marked as instrumental in the active WPA instrumental map. I will not make a negative claim without checking the official anthem record.'
      ]);
    }

    return lines([
      header(mk?'ХИМНИ БЕЗ ОФИЦИЈАЛЕН ТЕКСТ':'ANTHEMS WITHOUT OFFICIAL LYRICS'),
      ids.map(function(id){
        var d=map[id]||{};
        return '• '+countryName(id)+' — '+txt(d.name||d.title||'')+(d.note?'\n  '+txt(d.note):'');
      }).join('\n'),
      mk?'Протоколарна разлика: „инструментална химна“ не значи дека никогаш не постоеле неофицијални текстови.':'Protocol distinction: “instrumental anthem” does not necessarily mean unofficial lyrics have never existed.'
    ]);
  }

  var SYMBOL_SYNONYMS={
    'dragon':['dragon','змеј'],
    'eagle':['eagle','орел'],
    'lion':['lion','лав'],
    'sun':['sun','сонце'],
    'moon':['moon','месечина'],
    'crescent':['crescent','полумесечина','полумесец'],
    'star':['star','ѕвезда','ѕвезди'],
    'cross':['cross','крст'],
    'maple':['maple','јавор'],
    'cedar':['cedar','кедар'],
    'shield':['shield','штит'],
    'bird':['bird','птица'],
    'tree':['tree','дрво'],
    'coat of arms':['coat of arms','грб','амблем'],
    'crown':['crown','круна'],
    'sword':['sword','sabre','saber','меч','сабја']
  };

  function detectSymbol(q){
    var s=norm(q), keys=Object.keys(SYMBOL_SYNONYMS);
    for(var i=0;i<keys.length;i++){
      var k=keys[i];
      if(SYMBOL_SYNONYMS[k].some(function(x){ return s.indexOf(norm(x))>=0; })) return k;
    }
    return null;
  }

  function answerSymbolSearch(mk,q){
    var symbol=detectSymbol(q);
    if(!symbol || symbol==='eagle') return null;
    var terms=SYMBOL_SYNONYMS[symbol].map(norm);
    var hits=countries().filter(function(c){
      var f=norm(c.f);
      return terms.some(function(t){ return f.indexOf(t)>=0; });
    }).slice(0,24);

    if(!hits.length){
      return lines([
        header(mk?'СИМБОЛ → ДРЖАВА':'SYMBOL → COUNTRY'),
        mk?'Не најдов доволно сигурен погодок во активните описи на знамињата за овој симбол.':'I did not find a sufficiently reliable match in the active flag descriptions for this symbol.',
        mk?'Пробај со: орел, лав, сонце, ѕвезди, крст, полумесечина, круна, сабја.':'Try: eagle, lion, sun, stars, cross, crescent, crown, sword.'
      ]);
    }

    return lines([
      header(mk?'СИМБОЛ → ДРЖАВА':'SYMBOL → COUNTRY'),
      (mk?'Најдени совпаѓања за симболот „':'Matches for the symbol “')+symbol+'”:',
      hits.map(function(c){ return '• '+c.n+' — '+txt(c.f); }).join('\n'),
      mk?'Ова е reverse-identification пребарување низ активните WPA описи на знамињата.':'This is reverse-identification search across active WPA flag descriptions.'
    ]);
  }

  function answerCompare(mk,q){
    var matched=countryMatches(q);
    if(matched.length<2) return null;
    var a=matched[0], b=matched[1];
    return lines([
      header(mk?'КОМПАРАТИВНА ПРОТОКОЛАРНА ЛЕЌА':'COMPARATIVE PROTOCOL LENS'),
      '⇆ '+a.n+' ↔ '+b.n,
      (mk?'Главни градови: ':'Capitals: ')+a.cap+' ↔ '+b.cap,
      (mk?'Континент/регион: ':'Continent/region: ')+a.continent+' ↔ '+b.continent,
      (mk?'Знаме A: ':'Flag A: ')+a.f,
      (mk?'Знаме B: ':'Flag B: ')+b.f,
      mk?'WPA Protocol Lens: споредбата не е само визуелна — за официјална употреба се проверуваат точната верзија на знамето, пропорцијата, редоследот и церемонијалниот контекст.':'WPA Protocol Lens: comparison is not only visual — official use requires checking the exact flag version, proportion, order and ceremonial context.'
    ]);
  }

  function extractRatio(c){
    var m=txt(c&&c.f).match(/(?:Размер|ratio|proportion)\s*([0-9]+\s*:\s*[0-9]+)/i);
    return m ? m[1].replace(/\s+/g,'') : '';
  }

  var COLOR_TERMS=['црвена','црвено','бела','бело','сина','сино','зелена','зелено','жолта','жолто','златна','златно','црна','црно','портокалова','портокалово','red','white','blue','green','yellow','gold','black','orange'];
  var GEOMETRY_TERMS=['лента','ленти','триаголник','крст','дијагонално','дијагонална','y форма','круг','ѕвезда','ѕвезди','полумесец','полумесечина','stripe','stripes','triangle','cross','diagonal','circle','star','stars','crescent'];
  var HERALDRY_TERMS=['грб','амблем','штит','круна','coat of arms','emblem','shield','crown'];
  var ANIMAL_TERMS=['орел','лав','птица','змеј','eagle','lion','bird','dragon'];
  var HISTORY_RELIGION_TERMS=['крст','полумесец','полумесечина','натпис','cross','crescent','inscription'];

  function findTerms(text,terms){
    var s=norm(text);
    return uniq(terms.filter(function(t){ return s.indexOf(norm(t))>=0; }));
  }

  function symbolDNA(mk,q){
    var matched=countryMatches(q);
    if(!matched.length){
      return lines([
        header('SYMBOL DNA'),
        mk?'🧬 Наведи држава. Ќе го разложам активниот WPA опис по слоеви: боја → геометрија → животно/објект → хералдика → историски/религиозен маркер → протоколарна чувствителност.':'🧬 Name a country. I will decompose the active WPA record into: colour → geometry → animal/object → heraldry → historical/religious marker → protocol sensitivity.',
        mk?'Пример: „Symbol DNA за Албанија“.':'Example: “Symbol DNA for Albania”.'
      ]);
    }

    var c=matched[0], f=txt(c.f), eagle=eagleMap()[c.id], inst=instrumentalMap()[c.id];
    var colors=findTerms(f,COLOR_TERMS);
    var geometry=findTerms(f,GEOMETRY_TERMS);
    var animals=findTerms(f,ANIMAL_TERMS);
    var heraldry=findTerms(f,HERALDRY_TERMS);
    var history=findTerms(f,HISTORY_RELIGION_TERMS);
    if(eagle && animals.indexOf('орел')<0 && animals.indexOf('eagle')<0) animals.push(mk?'орел':'eagle');

    return lines([
      header('SYMBOL DNA'),
      '🧬 '+c.n,
      (mk?'Активен WPA опис: ':'Active WPA description: ')+f,
      (mk?'1. Боја: ':'1. Colour: ')+(colors.length?colors.join(', '):(mk?'не е доволно кодирана во краткиот активен опис':'not sufficiently encoded in the short active description')),
      (mk?'2. Геометриски елемент: ':'2. Geometric element: ')+(geometry.length?geometry.join(', '):(mk?'не е издвоен':'not identified')),
      (mk?'3. Животно / објект: ':'3. Animal / object: ')+(animals.length?animals.join(', '):(mk?'не е издвоено':'not identified')),
      (mk?'4. Хералдика: ':'4. Heraldry: ')+(heraldry.length?heraldry.join(', '):(mk?'не е кодирана во краткиот опис':'not encoded in the short description')),
      (mk?'5. Историски / религиозен маркер: ':'5. Historical / religious marker: ')+(history.length?history.join(', '):(mk?'не го претпоставувам без експлицитен податок':'not inferred without an explicit data field')),
      (mk?'6. Химна: ':'6. Anthem: ')+(inst ? ((mk?'означена како инструментална — ':'marked as instrumental — ')+txt(inst.name||inst.title||'')) : (mk?'нема посебна инструментална ознака во активниот слој':'no special instrumental marker in the active layer')),
      (mk?'7. Protocol Sensitivity: ':'7. Protocol Sensitivity: ')+(heraldry.length ? (mk?'провери дали за конкретниот настан се користи точната официјална верзија на знамето и дали грбот навистина е дел од неа.':'verify that the exact official flag version is used and that the coat of arms genuinely belongs on that version.') : (mk?'провери точна верзија, пропорција и церемонијален контекст.':'verify exact version, proportion and ceremonial context.')),
      noInference(mk)
    ]);
  }

  function reverseIdentify(mk,q){
    var s=norm(q), scores=[];
    countries().forEach(function(c){
      var score=0, why=[];
      var cap=norm(c.cap), flag=norm(c.f), eagle=norm(eagleMap()[c.id]||'');
      if(cap && s.indexOf(cap)>=0){ score+=6; why.push((mk?'главен град: ':'capital: ')+c.cap); }

      Object.keys(SYMBOL_SYNONYMS).forEach(function(key){
        var terms=SYMBOL_SYNONYMS[key];
        var asked=terms.some(function(t){ return s.indexOf(norm(t))>=0; });
        if(!asked) return;
        var found=terms.some(function(t){ return flag.indexOf(norm(t))>=0 || eagle.indexOf(norm(t))>=0; });
        if(found){ score+=2; why.push((mk?'симбол: ':'symbol: ')+key); }
      });

      if(/двоглав|double headed|double-headed/.test(s) && /двоглав|double headed|double-headed/.test(eagle)){
        score+=5; why.push(mk?'двоглав орел':'double-headed eagle');
      }
      if(/инструментал|без текст|instrumental|without lyrics/.test(s) && instrumentalMap()[c.id]){
        score+=3; why.push(mk?'инструментална химна':'instrumental anthem');
      }
      if(score>0) scores.push({c:c,score:score,why:why});
    });

    scores.sort(function(a,b){ return b.score-a.score; });
    if(!scores.length){
      return lines([
        header(mk?'КОЈА ДРЖАВА ЈА БАРАМ?':'WHICH COUNTRY AM I LOOKING FOR?'),
        mk?'Не можам сигурно да ја идентификувам државата од дадените траги во активниот краток dataset. Додај главен град, симбол, тип на химна или друг проверлив знак.':'I cannot identify the country reliably from those clues in the active short dataset. Add a capital, symbol, anthem type or another verifiable clue.',
        noInference(mk)
      ]);
    }

    var top=scores[0], ties=scores.filter(function(x){ return x.score===top.score; });
    if(ties.length>1){
      return lines([
        header(mk?'REVERSE ID · ПОВЕЌЕ КАНДИДАТИ':'REVERSE ID · MULTIPLE CANDIDATES'),
        mk?'Најсилни совпаѓања:':'Strongest matches:',
        ties.slice(0,6).map(function(x){ return '• '+x.c.n+' — '+x.why.join('; '); }).join('\n'),
        mk?'Додај уште една трага за да го стеснам резултатот.':'Add one more clue to narrow the result.'
      ]);
    }

    return lines([
      header(mk?'КОЈА ДРЖАВА ЈА БАРАМ?':'WHICH COUNTRY AM I LOOKING FOR?'),
      '🎯 '+top.c.n,
      (mk?'Најсилно совпаѓање според активните WPA траги: ':'Strongest match from the active WPA clues: ')+top.why.join('; '),
      (mk?'Знаме: ':'Flag: ')+top.c.f,
      (mk?'Главен град: ':'Capital: ')+top.c.cap,
      mk?'Ова е reasoning match врз активниот dataset, не замена за официјална верификација.':'This is a reasoning match over the active dataset, not a substitute for official verification.'
    ]);
  }

  var DIAGNOSTIC_SCENARIOS=[
    {
      mk:'На билатерален настан е преземена слика од интернет на која се гледа грб, па организаторот автоматски претпоставува дека тоа е точната официјална верзија на државното знаме.',
      en:'At a bilateral event, an online image containing a coat of arms is downloaded and the organizer automatically assumes it is the correct official national flag version.',
      keys:['грб','верзија','знаме','coat of arms','version','flag'],
      mkExplain:'Клучниот проблем е што грб и знаме се различни државни симболи. Присуството на грб во еден извор не докажува дека тој е дел од официјалната верзија на знамето што треба да се користи на конкретниот настан.',
      enExplain:'The core problem is that coat of arms and flag are distinct state symbols. Seeing a coat of arms in one source does not prove it belongs on the official flag version required for that event.'
    },
    {
      mk:'За свечена церемонија е подготвена химна од случаен видео-клип, без проверка дали снимката е официјална, целосна или инструментална верзија.',
      en:'For a formal ceremony, an anthem is taken from a random video clip without checking whether it is the official, complete or instrumental protocol version.',
      keys:['химна','снимка','официјал','верзија','anthem','recording','official','version'],
      mkExplain:'Ризикот е употреба на непроверена аудио-верзија. Кај химните мора да се проверат точниот наслов, официјалната верзија, должината/аранжманот и протоколарниот контекст.',
      enExplain:'The risk is use of an unverified audio version. Anthems require confirmation of the exact title, official version, arrangement/length and protocol context.'
    },
    {
      mk:'Организаторот однапред одлучува која држава ќе биде прва во редоследот само според големината или политичката моќ на државата.',
      en:'The organizer decides which state will appear first solely according to its size or political power.',
      keys:['редослед','преседан','азбуч','домаќин','order','precedence','alphabet','host'],
      mkExplain:'Редоследот не се определува произволно според политичка тежина. Мора да се примени правилото на конкретниот формат — домаќин, азбучен ред, договорен multilateral order или друго официјално правило.',
      enExplain:'Order should not be improvised from political weight. The rule of the actual format must be applied — host rule, alphabetical order, agreed multilateral order or another official protocol rule.'
    },
    {
      mk:'Во протоколарна белешка се наведува само еден „главен град“, иако активниот WPA запис предупредува на уставен наспроти владин/административен центар.',
      en:'A protocol note lists only one “capital” even though the active WPA record distinguishes a constitutional capital from a governmental/administrative centre.',
      keys:['главен град','устав','влада','административ','capital','constitutional','government','administrative'],
      mkExplain:'Ризикот е поедноставување што може да доведе до погрешно дипломатско адресирање или логистика. Кај сложени случаи мора да се зачува разграничувањето што го дава изворот.',
      enExplain:'The risk is oversimplification that may cause diplomatic-addressing or logistics errors. Complex capital/seat distinctions must be preserved.'
    }
  ];

  function buildDiagnostic(mk){
    var sc=sample(DIAGNOSTIC_SCENARIOS);
    challenge={type:'diagnostic',scenario:sc};
    return lines([
      header(mk?'ШТО НЕ Е ВО РЕД?':'WHAT IS WRONG?'),
      '🔎 '+(mk?sc.mk:sc.en),
      mk?'Твоја задача: наведи го најважниот протоколарен проблем. Потоа ќе го споредам твојот одговор со WPA анализата.':'Your task: identify the main protocol problem. I will then compare your answer with the WPA analysis.'
    ]);
  }

  function protocolRisk(mk,q){
    var matched=countryMatches(q), a, b;
    if(matched.length>=2){ a=matched[0]; b=matched[1]; }
    else {
      a=sample(countries());
      b=sample(countries().filter(function(c){ return !a || c.id!==a.id; }));
    }
    if(!a || !b) return mk?'Нема доволно податоци за Protocol Risk Lens.':'Not enough data for Protocol Risk Lens.';

    var ratioA=extractRatio(a), ratioB=extractRatio(b);
    var descA=norm(a.f), descB=norm(b.f);
    var sharedSymbols=[];
    Object.keys(SYMBOL_SYNONYMS).forEach(function(k){
      var terms=SYMBOL_SYNONYMS[k].map(norm);
      var inA=terms.some(function(t){ return descA.indexOf(t)>=0; });
      var inB=terms.some(function(t){ return descB.indexOf(t)>=0; });
      if(inA&&inB) sharedSymbols.push(k);
    });
    var complexCapitalA=/;|\(|уставен|официјален|седиште/i.test(txt(a.cap));
    var complexCapitalB=/;|\(|уставен|официјален|седиште/i.test(txt(b.cap));
    var riskPoints=0, signals=[];
    if(ratioA && ratioB && ratioA===ratioB){ riskPoints++; signals.push((mk?'иста запишана пропорција: ':'same recorded proportion: ')+ratioA); }
    if(sharedSymbols.length){ riskPoints++; signals.push((mk?'заеднички елементи во краткиот опис: ':'shared elements in the short descriptions: ')+sharedSymbols.join(', ')); }
    if(complexCapitalA||complexCapitalB){ riskPoints++; signals.push(mk?'сложен capital/seat запис':'complex capital/seat record'); }
    if(a.anthem && b.anthem && a.anthem!==b.anthem){ riskPoints++; signals.push(mk?'две различни anthem references мора да се мапираат без замена':'two distinct anthem references must be mapped without substitution'); }
    var level=riskPoints>=3?(mk?'ЗГОЛЕМЕНО':'ELEVATED'):riskPoints>=1?(mk?'УМЕРЕНО':'MODERATE'):(mk?'ОСНОВНО':'BASELINE');

    return lines([
      header(mk?'НАЈДИ ГО ПРОТОКОЛАРНИОТ РИЗИК':'FIND THE PROTOCOL RISK'),
      '⚠️ '+a.n+' ↔ '+b.n,
      (mk?'WPA heuristic risk level: ':'WPA heuristic risk level: ')+level,
      (mk?'Знаме A: ':'Flag A: ')+a.f,
      (mk?'Знаме B: ':'Flag B: ')+b.f,
      signals.length ? ((mk?'Сигнали: ':'Signals: ')+signals.join(' · ')) : (mk?'Во краткиот dataset нема автоматски сигнал за визуелна конфузија.':'The short dataset does not produce an automatic visual-confusion signal.'),
      mk?'Ризик 1 — идентификација: не се потпирај само на боја или визуелна сличност; провери точен официјален дизајн и пропорција.':'Risk 1 — identification: do not rely only on colour or visual similarity; verify the exact official design and proportion.',
      mk?'Ризик 2 — химни: секоја химна мора да биде врзана за точниот ентитет и точната протоколарна верзија.':'Risk 2 — anthems: each anthem must be mapped to the correct entity and the correct protocol version.',
      mk?'Ризик 3 — редослед: не го измислувам precedence. Тој зависи од типот на настан, домаќинот и официјалното правило.':'Risk 3 — order: I do not invent precedence. It depends on event type, host and the applicable official rule.',
      mk?'Ризик 4 — адресирање/логистика: сложените записи за главен град или седиште мора да останат разграничени.':'Risk 4 — addressing/logistics: complex capital or seat-of-government distinctions must be preserved.',
      mk?'Оценката е WPA аналитичка евристика, не официјална државна класификација.':'The rating is a WPA analytical heuristic, not an official state classification.'
    ]);
  }

  function buildCountryChallenge(mk){
    var pool=[];
    Object.keys(eagleMap()).forEach(function(id){
      var c=countryById(id), d=txt(eagleMap()[id]);
      if(c) pool.push({
        type:'country',
        answer:c.n,
        id:id,
        question:mk?'Која држава ја барам? Главниот град е '+c.cap+'. WPA ја означува како пример со орел на знамето. '+(d||''):'Which country am I describing? Its capital is '+c.cap+'. WPA marks it as an example with an eagle on the flag. '+(d||'')
      });
    });
    Object.keys(instrumentalMap()).forEach(function(id){
      var c=countryById(id), d=instrumentalMap()[id]||{};
      if(c) pool.push({
        type:'country',
        answer:c.n,
        id:id,
        question:mk?'Која држава/ентитет ја барам? Главниот град е '+c.cap+'. Нејзината протоколарна химна е означена како инструментална: '+txt(d.name||d.title||'')+'.':'Which country/entity am I describing? Its capital is '+c.cap+'. Its protocol anthem is marked as instrumental: '+txt(d.name||d.title||'')+'.'
      });
    });
    if(!pool.length){
      var c=sample(countries());
      if(c) pool.push({type:'country',answer:c.n,id:c.id,question:mk?'Која држава има главен град '+c.cap+'?':'Which country has the capital '+c.cap+'?'});
    }
    challenge=sample(pool);
    if(!challenge) return mk?'Нема достапен challenge во моментот.':'No challenge is available right now.';
    window.WPA_SYMBOL_CHALLENGE=challenge;
    return lines([
      header('EXPERT CHALLENGE'),
      '🧩 '+challenge.question,
      mk?'Одговори со името на државата/ентитетот.':'Reply with the country/entity name.'
    ]);
  }

  function checkChallenge(mk,q){
    if(!challenge) return null;

    if(challenge.type==='diagnostic'){
      var sc=challenge.scenario, s=norm(q);
      var hit=sc.keys.some(function(k){ return s.indexOf(norm(k))>=0; });
      challenge=null;
      window.WPA_SYMBOL_CHALLENGE=null;
      return lines([
        header(mk?'WPA ДИЈАГНОСТИКА':'WPA DIAGNOSTIC'),
        hit ? (mk?'✅ Го фати клучниот ризик.':'✅ You identified a core risk.') : (mk?'◐ Одговорот може да има логика, но еве го клучниот WPA ризик:':'◐ Your answer may have merit; here is the core WPA risk:'),
        mk?sc.mkExplain:sc.enExplain,
        mk?'Следно можеш да побараш „уште едно што не е во ред?“':'Ask for “another what is wrong?” for the next scenario.'
      ]);
    }

    var s=norm(q), answer=norm(challenge.answer);
    var correct=s===answer || s.indexOf(answer)>=0 || answer.indexOf(s)>=0;
    var result=correct
      ? lines([header('CHALLENGE RESULT'),'✅ '+(mk?'Точно: ':'Correct: ')+challenge.answer,mk?'Одлично. Следно можам да ти дадам потежок reverse-identification, Symbol DNA или Protocol Risk Lens.':'Excellent. Next I can give you a harder reverse-identification, Symbol DNA or Protocol Risk Lens.'])
      : lines([header('CHALLENGE RESULT'),'❌ '+(mk?'Не е точно. Точниот одговор е: ':'Not quite. The correct answer is: ')+challenge.answer,mk?'Побарај „нов предизвик“ за следното прашање.':'Ask for a new challenge for the next question.']);
    challenge=null;
    window.WPA_SYMBOL_CHALLENGE=null;
    return result;
  }

  function protocolTrap(mk,q){
    var matched=countryMatches(q);
    if(matched.length===1){
      var c=matched[0], eagle=eagleMap()[c.id];
      return lines([
        header('PROTOCOL TRAP'),
        '⚖️ '+c.n,
        eagle ? (mk?'Во WPA мапата орелот е означен како дел од знамето.':'In the WPA map, the eagle is marked as part of the flag.') : (mk?'Не ја мешај иконографијата на грбот со дизајнот на државното знаме. WPA нема да претпостави дека симбол од грбот автоматски се појавува и на знамето.':'Do not confuse coat-of-arms iconography with the national flag design. WPA will not assume that a coat-of-arms symbol automatically appears on the flag.'),
        mk?'Прашањето за протокол секогаш е: кој точен официјален симбол се користи, во која верзија и во каков церемонијален контекст?':'The protocol question is always: which exact official symbol is used, in which version, and in what ceremonial context?'
      ]);
    }
    return lines([
      header('PROTOCOL TRAP'),
      mk?'⚖️ Ако една држава има орел во грбот, дали тоа значи дека орелот е и на знамето? Не. Грб и знаме се различни државни симболи и мора да се проверуваат одделно.':'⚖️ If a state has an eagle in its coat of arms, does that mean the eagle is also on the flag? No. Coat of arms and flag are distinct state symbols and must be checked separately.',
      mk?'Наведи држава и ќе направам конкретен Protocol Trap.':'Name a country and I will run a specific Protocol Trap.'
    ]);
  }

  function help(mk){
    return lines([
      header('EXPERT MODE'),
      mk?'Symbols сега работи како интерактивна лабораторија: може да оди од држава кон симбол, но и обратно — од трага, симбол или протоколарен проблем кон можен одговор.':'Symbols now works as an interactive laboratory: it can go from country to symbol, but also in reverse — from a clue, symbol or protocol problem toward a grounded answer.',
      mk?'Пробај:':'Try:',
      mk?'• „Која држава ја барам? Главниот град е Тирана и има двоглав орел.“\n• „Кои химни се инструментални?“\n• „Symbol DNA за Албанија.“\n• „Што не е во ред?“\n• „Најди го протоколарниот ризик меѓу Србија и Словенија.“\n• „Спореди ги знамињата на Албанија и Црна Гора.“\n• „Дај ми Protocol Trap.“\n• „Предизвикај ме — погоди држава.“':'• “Which country am I looking for? The capital is Tirana and the flag has a double-headed eagle.”\n• “Which anthems are instrumental?”\n• “Symbol DNA for Albania.”\n• “What is wrong?”\n• “Find the protocol risk between Serbia and Slovenia.”\n• “Compare the flags of Albania and Montenegro.”\n• “Give me a Protocol Trap.”\n• “Challenge me — guess the country.”'
    ]);
  }

  function install(){
    if(typeof window.wpaBotAnswer!=='function'){
      window.setTimeout(install,80);
      return;
    }
    if(window.wpaBotAnswer.__wpaSymbolsV21) return;
    previousAnswer=window.wpaBotAnswer;

    var upgraded=function(q){
      var s=norm(q), mk=isMk(q) || window.WPA_CHAT_LANG!=='en';

      if(challenge && !/нов предизвик|new challenge|откажи|cancel/.test(s)) return checkChallenge(mk,q);
      if(/откажи|cancel/.test(s) && challenge){ challenge=null; window.WPA_SYMBOL_CHALLENGE=null; return mk?'Предизвикот е откажан.':'Challenge cancelled.'; }

      if(/што не е во ред|што е погрешно|what is wrong|spot the error|find the error/.test(s)) return buildDiagnostic(mk);
      if(/protocol risk|протоколарен ризик|ризик меѓу|најди го ризикот|find the protocol risk/.test(s)) return protocolRisk(mk,q);
      if(/symbol dna|симбол dna|dna на симбол|symbolic dna/.test(s)) return symbolDNA(mk,q);

      if(/која држава|кој ентитет|which country|which entity/.test(s) && /(главен град|capital|орел|eagle|лав|lion|полумес|crescent|сонце|sun|крст|cross|инструментал|instrumental|двоглав|double-headed)/.test(s)){
        return reverseIdentify(mk,q);
      }

      var challengeRequest=/предизвик|погоди држава|quiz me|challenge me|new challenge|нов challenge|нов предизвик/.test(s);
      if(challengeRequest) return buildCountryChallenge(mk);

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
      if(/знаме|flag|симбол|symbol|грб|emblem|coat of arms|лав|lion|полумес|crescent|сонце|sun|крст|cross|круна|crown|сабја|sword/.test(s)){
        var sym=answerSymbolSearch(mk,q); if(sym) return sym;
      }
      if(/што можеш|what can you do|expert mode|уникат|unique|лабораторија|laboratory/.test(s)) return help(mk);

      var base=previousAnswer(q);
      if(base && !/Напиши име на држава|Ask for a country name/.test(base)) return base;
      return help(mk);
    };

    upgraded.__wpaSymbolsV2=true;
    upgraded.__wpaSymbolsV21=true;
    window.wpaBotAnswer=upgraded;
    enhanceUi();
  }

  function enhanceUi(){
    var panel=document.getElementById('chatPanel');
    if(!panel) return;

    var firstBot=panel.querySelector('.wpa-chat-msg.bot');
    if(firstBot){
      firstBot.textContent=window.WPA_CHAT_LANG==='en'
        ? 'Welcome to WPA Symbols Expert Assistant — an interactive laboratory for state symbols and diplomatic protocol. I can reverse-identify countries from clues, run Symbol DNA, distinguish flag vs. coat-of-arms traps, compare flags, detect instrumental anthems and diagnose protocol risks.'
        : 'Добредојдовте во WPA Symbols Expert Assistant — интерактивна лабораторија за државна симболика и дипломатски протокол. Можам обратно да препознавам држави од траги, да правам Symbol DNA, да разликувам знаме од грб, да споредувам знамиња, да издвојувам инструментални химни и да дијагностицирам протоколарни ризици.';
    }

    var buttons=panel.querySelectorAll('[onclick*="sendQuick"]');
    var baseConfigs=[
      ['🦅 Орел → држава','Кои држави имаат орел на знамето?'],
      ['🎼 Инструментални','Кои химни се инструментални?'],
      ['🧩 Погоди држава','Предизвикај ме — погоди држава.'],
      ['⚖️ Protocol Trap','Дај ми Protocol Trap.']
    ];
    for(var i=0;i<buttons.length && i<baseConfigs.length;i++){
      buttons[i].textContent=baseConfigs[i][0];
      buttons[i].setAttribute('onclick','sendQuick('+JSON.stringify(baseConfigs[i][1])+')');
      buttons[i].setAttribute('title',baseConfigs[i][1]);
    }

    if(buttons.length && !document.getElementById('wpaSymbolsExpertQuickRow')){
      var parent=buttons[0].parentElement;
      if(parent){
        var row=document.createElement('div');
        row.id='wpaSymbolsExpertQuickRow';
        row.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;';
        var expertConfigs=[
          ['🧬 Symbol DNA','Symbol DNA за Албанија.'],
          ['🔎 Што не е во ред?','Што не е во ред?'],
          ['⚠️ Protocol Risk','Најди го протоколарниот ризик.'],
          ['🎯 Reverse ID','Која држава ја барам? Главниот град е Тирана и има двоглав орел.']
        ];
        expertConfigs.forEach(function(cfg){
          var btn=buttons[0].cloneNode(false);
          btn.removeAttribute('id');
          btn.textContent=cfg[0];
          btn.setAttribute('onclick','sendQuick('+JSON.stringify(cfg[1])+')');
          btn.setAttribute('title',cfg[1]);
          row.appendChild(btn);
        });
        parent.appendChild(row);
      }
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
  window.setTimeout(install,250);
  window.setTimeout(install,900);
})();

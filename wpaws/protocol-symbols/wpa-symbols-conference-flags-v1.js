/* WPA Symbols Conference Flags Guard v1.1 — 2026-08-11
   Question-first handling for flag placement at international conferences,
   including UN, NATO, EU and sensitive Serbia/Kosovo participation scenarios.

   Design principles:
   - generic conference questions must never be misrouted to UN membership/status
   - participant flags are treated equally in size/height unless the applicable
     organization/event protocol expressly provides otherwise
   - ordering depends on the governing protocol: often alphabetical/protocol order,
     but the organizer's official rules control
   - UN: UN Headquarters publicly describes Member State flags in alphabetical
     order (Afghanistan to Zimbabwe); UN Protocol Manual governs official practice
   - EU: Publications Office defines a specific Member State "protocol order"
     based on alphabetical order in each Member State's source language
   - NATO: current Alliance membership must be checked from NATO; exact event flag
     layout should follow NATO/event protocol rather than be invented
   - sensitive-status cases: never convert a unilateral objection into an ad-hoc
     recognition decision; apply the pre-agreed participation/status formula of
     the organizer and escalate to the competent protocol/legal authority

   Serbia/Kosovo governance basis:
   - Council of the EU currently lists Kosovo* among the six Western Balkans
     partners and uses the status-neutral footnote: designation without prejudice
     to positions on status, in line with UNSCR 1244/1999 and the ICJ opinion.
   - The official participant list for the EU-Western Balkans summit of
     18 December 2024 included both Vjosa Osmani-Sadriu and Aleksandar Vucic.
   - These facts establish simultaneous participation under an EU format; they do
     NOT by themselves prescribe one universal flag layout for every EU event.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_CONFERENCE_FLAGS_V1__) return;
  window.__WPA_SYMBOLS_CONFERENCE_FLAGS_V1__=true;

  function s(v){return String(v==null?'':v);}
  function norm(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();}
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}
  function hasToken(z,t){return (' '+z+' ').indexOf(' '+t+' ')>=0;}

  function conferenceIntent(q){
    var z=norm(q);
    var conf=/(меѓународн.*конферен|меѓународн.*состан|конференц|конференз|кинфферен|конгрес|самит|делегац|учеснич|учесник|западен балкан|western balkans|international conference|international meeting|summit|delegation|participants)/.test(z);
    var flags=/(знаме|знамиња|flag|flags|постав|распоред|редослед|истак|подиг|position|placement|arrange|order|display|fly)/.test(z);
    var org=/(обединети нации|united nations|нато|nato|европска унија|european union)/.test(z)||hasToken(z,'он')||hasToken(z,'ун')||hasToken(z,'un')||hasToken(z,'eu');
    return (conf&&flags)||(org&&flags&&/(конферен|состан|самит|meeting|conference|summit|flags|знамиња)/.test(z));
  }

  function orgs(q){
    var z=norm(q),out=[];
    if(/обединети нации|united nations/.test(z)||hasToken(z,'он')||hasToken(z,'ун')||hasToken(z,'un')) out.push('UN');
    if(/нато|nato/.test(z)) out.push('NATO');
    if(/европска унија|european union/.test(z)||hasToken(z,'eu')) out.push('EU');
    return out;
  }

  function serbiaKosovoDisputeIntent(q){
    var z=norm(q);
    var serbia=/(србија|српск|serbia|serbian)/.test(z);
    var kosovo=/(косово|kosovo)/.test(z);
    var flag=/(знаме|знамето|знамиња|flag|flags)/.test(z);
    var dispute=/(интервен|приговор|приговори|оспор|протест|бара.*трг|бара.*отстран|отстрани|тргне|не прифаќ|не прифак|object|objection|protest|dispute|remove|take down|complain)/.test(z);
    var context=/(еус|европска унија|западен балкан|western balkans|меѓународн|конферен|самит|состан|eu)/.test(z)||hasToken(z,'eu');
    return serbia&&kosovo&&flag&&dispute&&context;
  }

  function serbiaKosovoAnswer(q){
    if(!serbiaKosovoDisputeIntent(q)) return null;
    if(isMk(q)){
      return [
        '⚖️ Во таков случај не би го менувал распоредот на знамињата само по усна или еднострана интервенција на една делегација. Прво се применува однапред одобрениот протокол и формулата за учество на организаторот/домаќинот.',
        '🇪🇺 Ако станува збор за формат ЕУ–Западен Балкан, ЕУ официјално го наведува Косово* како еден од шесте западнобалкански партнери, со статусно-неутрална фуснота дека ознаката не ги прејудицира позициите за статусот и е во согласност со Резолуцијата 1244/1999 на СБ на ОН и мислењето на МСП. Тоа значи дека протоколот не треба самостојно да претвори спор околу знаме во одлука за признавање или непризнавање.',
        'Практична постапка: 1) ја проверувам поканата, concept note/протоколарниот план и договорената формула за претставување; 2) приговорот на српската делегација веднаш го евидентирам и го упатувам до шефот на протокол/политичкиот и правниот координатор на организаторот; 3) додека нема одлука од надлежниот организатор, не се отстранува еднострано само косовското знаме ако поставеноста веќе е официјално одобрена; 4) ако организаторот избере статусно-неутрално визуелно решение, тоа треба да биде конзистентно и недискриминаторно — на пример таблички со договорените називи и знаме/брендинг на ЕУ или на настанот наместо селективно отстранување на симбол само на еден учесник.',
        'Важно: нема едно универзално правило дека на секој ЕУ–Западен Балкан настан мора да има или мора да нема косовско знаме. Конкретниот визуелен режим го определува официјалниот план на настанот. На самитот ЕУ–Западен Балкан во Брисел на 18 декември 2024 официјалната листа на учесници ги вклучува и Вјоса Османи-Садриу и Александар Вучиќ, што покажува дека двете страни можат истовремено да учествуваат во ЕУ формат; тоа само по себе не пропишува конкретна поставеност на знамињата.',
        '🧭 WPA Protocol Rule: спор за статус или симбол не се решава ад хок од техничкиот протоколарец на лице место. Се применува однапред договорената формула на организаторот, се зачувува еднаквиот третман на учесниците и прашањето се ескалира до надлежното протоколарно/политичко ниво.',
        'Напомена: ова е образовна и протоколарно-референтна насока; не претставува акт на дипломатско признавање или правно утврдување на статус.'
      ].join('\n\n');
    }
    return [
      '⚖️ In that situation, I would not alter the flag display solely because of an oral or unilateral objection from one delegation. The organizer/host’s pre-approved protocol and participation formula controls.',
      '🇪🇺 In the EU–Western Balkans framework, the EU officially lists Kosovo* among the six Western Balkans partners, with a status-neutral footnote stating that the designation is without prejudice to positions on status and is in line with UNSCR 1244/1999 and the ICJ opinion. Protocol staff should therefore not turn a flag dispute into an ad-hoc recognition decision.',
      'Operationally: verify the invitation/concept note and approved display plan; record and escalate the Serbian delegation’s objection to the organizer’s chief of protocol/political-legal authority; do not selectively remove only Kosovo’s flag if the approved plan already provides for it; if the organizer adopts a status-neutral visual solution, apply it consistently to all participants, for example agreed nameplates plus EU/event branding rather than a one-sided removal.',
      'There is no single universal rule that every EU–Western Balkans event must display or omit Kosovo’s flag. The event-specific protocol plan controls. The official participant list for the 18 December 2024 EU–Western Balkans summit included both Vjosa Osmani-Sadriu and Aleksandar Vucic, demonstrating simultaneous participation under an EU format but not prescribing one flag layout for every event.',
      'WPA Protocol Rule: a status/symbol dispute is not decided ad hoc by technical protocol staff on site; apply the organizer’s agreed formula, preserve equal treatment and escalate to the competent protocol/political authority.',
      'Note: this is an educational and protocol-reference guideline and does not constitute diplomatic recognition or a legal determination of status.'
    ].join('\n\n');
  }

  function answer(q){
    var sensitive=serbiaKosovoAnswer(q);
    if(sensitive) return sensitive;
    if(!conferenceIntent(q)) return null;
    var mk=isMk(q),os=orgs(q);

    if(mk){
      var parts=[];
      parts.push('🏳️ На официјална меѓународна конференција знамињата на државите учеснички по правило се поставуваат според однапред утврден протокол на организаторот, со еднаков третман на учесничките: иста категорија на јарболи, еднаква висина и споредливи димензии на знамињата. Редоследот најчесто е азбучен или друг формално утврден протоколарен ред; не треба произволно да се дава „почесна“ позиција на една учесничка ако правилата на настанот не го предвидуваат тоа.');
      parts.push('Практично, пред поставувањето се утврдуваат: официјалната листа на учесници, јазикот/системот според кој се определува азбучниот ред, позицијата на знамето на домаќинот и/или организацијата, насоката на читање на редот и дали распоредот е линиски, полукружен или според седиштата на делегациите. Организациското знаме (на пр. ОН, НАТО или ЕУ) не смее автоматски да се третира како национално знаме; неговата позиција ја определува протоколот на конкретната организација/настан.');

      if(!os.length||os.indexOf('UN')>=0){
        parts.push('🇺🇳 ОН: во системот на ОН се применува официјален протокол; на седиштето на ОН знамињата на државите-членки се поставени по азбучен ред, од Afghanistan до Zimbabwe. За конкретна конференциска сала или специјален настан треба да се следат упатствата на UN Protocol and Liaison Service и планот на настанот.');
      }
      if(os.indexOf('EU')>=0){
        parts.push('🇪🇺 ЕУ: за државите-членки постои посебен „protocol order“ — азбучен ред според називот на секоја држава на нејзиниот изворен/официјален јазик, а не едноставно според англиската азбука. Затоа за настан на институција на ЕУ се користи официјалниот EU protocol order.');
      }
      if(os.indexOf('NATO')>=0){
        parts.push('🟦 НАТО: членките се третираат како сојузнички држави со еднаков статус; за точната поставеност на знамињата на самит, министерски состанок или церемонија треба да се користи тековниот NATO/event protocol plan. Не треба да се измислува посебна позиција само од општата листа на членки.');
      }
      parts.push('⚖️ WPA Protocol Rule: прво се идентификува правниот/организацискиот режим на настанот, потоа се применува неговиот официјален ред. „Азбучно“ не секогаш значи ист ред кај ОН, ЕУ, НАТО или билатерален/мултилатерален настан.');
      return parts.join('\n\n');
    }

    var en=[];
    en.push('🏳️ At an official international conference, participant State flags should be displayed according to a pre-established protocol of the organizer, with equal treatment: equivalent flagpoles, equal height and comparable flag dimensions. The sequence is commonly alphabetical or another formally prescribed protocol order; one participant should not be given an arbitrary superior position unless the governing protocol expressly provides it.');
    en.push('Before installation, confirm the official participant list, the language/system used for ordering, the position of the host and/or organization flag, the direction in which the line is read, and whether the layout is linear, semicircular or tied to delegation seating. An organization flag (UN, NATO, EU) is not a national flag and its position follows the rules of that organization/event.');
    if(!os.length||os.indexOf('UN')>=0) en.push('🇺🇳 UN: the UN applies its own protocol; at UN Headquarters Member State flags are displayed alphabetically from Afghanistan to Zimbabwe. For a particular conference room or special event, follow the UN Protocol and Liaison Service/event plan.');
    if(os.indexOf('EU')>=0) en.push('🇪🇺 EU: Member States have a specific “protocol order” based on alphabetical order according to each Member State’s name in its source/official language, not simply English alphabetical order.');
    if(os.indexOf('NATO')>=0) en.push('🟦 NATO: Allies are treated as equal member States; the exact flag layout for a summit, ministerial or ceremony should follow the current NATO/event protocol plan rather than an invented generic hierarchy.');
    return en.join('\n\n');
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaConferenceFlagsV1){
      var prev=window.sendChat;
      var fn=function(){
        var input=document.getElementById('chatInput');if(!input)return prev();
        var q=input.value.trim();if(!q||(!conferenceIntent(q)&&!serbiaKosovoDisputeIntent(q)))return prev();
        var a=answer(q);if(!a)return prev();
        add('user',q);input.value='';add('bot',a);input.focus();
      };
      fn.__wpaConferenceFlagsV1=true;
      window.sendChat=fn;
    }
    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaConferenceFlagsV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaConferenceFlagsV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  setTimeout(install,900);
  setTimeout(install,1800);
  setTimeout(install,3000);
  setTimeout(install,4600);
})();

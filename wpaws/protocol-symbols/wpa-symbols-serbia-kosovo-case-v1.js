/* WPA Symbols Serbia-Kosovo Conference Case Guard v1.0 — 2026-08-11
   Dedicated last-layer guard for sensitive flag-dispute scenarios at
   EU–Western Balkans / international conferences.

   Core case lesson supplied from professional practice:
   When a Serbian-side objection was raised regarding Kosovo symbolism at a
   conference in Skopje, the de-escalation solution was to remove all participant
   national flags rather than single out Kosovo. The recollection is that EU and
   host/North Macedonian symbolism remained. The durable protocol lesson is the
   symmetry principle; the exact archival detail of which symbols remained should
   be treated as recollection unless independently documented.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_SERBIA_KOSOVO_CASE_V1__) return;
  window.__WPA_SYMBOLS_SERBIA_KOSOVO_CASE_V1__=true;

  function s(v){return String(v==null?'':v);}
  function norm(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();}
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}

  function intent(q){
    var z=norm(q);
    var serbia=/(србија|српск|serbia|serbian)/.test(z);
    var kosovo=/(косово|kosovo)/.test(z);
    var flag=/(знаме|знамето|знамиња|flag|flags)/.test(z);
    var dispute=/(интервен|реакц|приговор|оспор|протест|бара|трг|отстран|не прифаќ|не прифак|object|objection|reaction|protest|dispute|remove|take down|complain)/.test(z);
    var event=/(меѓународн|конферен|самит|состан|западен балкан|европска унија|international|conference|summit|meeting|western balkans|european union|\beu\b)/.test(z);
    return serbia&&kosovo&&flag&&dispute&&event;
  }

  function answer(q){
    if(!intent(q)) return null;
    if(isMk(q)){
      return [
        '⚖️ Во ваква ситуација, наместо селективно да се тргне само знамето на Косово, најчистото статусно-неутрално деескалациско решение може да биде да се тргнат СИТЕ национални знамиња на учесниците, ако тоа го одобри организаторот.',
        '🧭 Причината е принципот на симетрија: протоколот не смее со техничка интервенција на лице место да создаде впечаток дека една делегација е политички или протоколарно деградирана. Ако спорот е врзан за категоријата „национални знамиња“, категоријата може да се неутрализира подеднакво за сите.',
        '📘 WPA Case Lesson — Скопје, ЕУ–Западен Балкан: во практичен случај од професионалното искуство на организаторот, по реакција од српската страна биле тргнати националните знамиња на сите учеснички, наместо само косовското. Според сеќавањето, останале симболите на ЕУ и домаќинот. Овој детал го третираме како професионална case lesson, не како универзално правило или архивски потврден модел за секој ЕУ настан.',
        'Практично би постапил вака: 1) веднаш го информирам шефот на протокол/организаторот; 2) ја проверувам однапред договорената формула за учество и визуелниот план; 3) ако нема готово решение и спорот го загрозува настанот, предлагам симетрично тргање на сите национални знамиња; 4) остануваат само организациските/домаќинските симболи ако планот го дозволува тоа; 5) решението се соопштува еднакво до сите делегации како организациска и деескалациска мерка, а не како став за признавање.',
        '⚠️ Ова не е правило дека секогаш треба да се тргаат знамињата. Прво важи однапред усвоениот протокол на конкретниот настан. Симетричното тргање е резервна crisis-management опција кога визуелниот спор може да го блокира или политизира настанот.',
        'Напомена: ова е образовна и протоколарно-референтна case lesson и не претставува акт на дипломатско признавање или правно утврдување на статус.'
      ].join('\n\n');
    }
    return [
      '⚖️ In this situation, rather than selectively removing only Kosovo’s flag, a clean status-neutral de-escalation option can be to remove ALL participant national flags, subject to the organizer’s approval.',
      'This applies a symmetry principle: technical protocol staff should not create the impression that one delegation has been politically or ceremonially downgraded. If the dispute concerns the category of participant national flags, that category can be neutralized equally for everyone.',
      '📘 WPA Case Lesson — Skopje, EU–Western Balkans: in a practical case from the organizer’s professional experience, all participant national flags were removed after a Serbian-side objection rather than only Kosovo’s. The recollection is that EU and host symbolism remained. This is a professional case lesson, not a universal rule or an archival claim for every EU event.',
      'Operationally: alert the chief of protocol/organizer; check the pre-agreed participation formula and visual plan; if no pre-agreed solution exists and the dispute threatens the event, propose symmetrical removal of all participant national flags; retain organization/host symbolism only if the approved plan permits; communicate the measure equally to all delegations as an organizational de-escalation step, not a recognition decision.',
      'This is not a rule that flags must always be removed. The pre-agreed event protocol controls first; symmetrical withdrawal is a crisis-management fallback when a visual-status dispute risks blocking or politicizing the event.',
      'Note: this is an educational protocol-reference case lesson and does not constitute diplomatic recognition or a legal determination of status.'
    ].join('\n\n');
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaSerbiaKosovoCaseV1){
      var prev=window.sendChat;
      var fn=function(){
        var input=document.getElementById('chatInput');if(!input)return prev();
        var q=input.value.trim();if(!q||!intent(q))return prev();
        var a=answer(q);if(!a)return prev();
        add('user',q);input.value='';add('bot',a);input.focus();
      };
      fn.__wpaSerbiaKosovoCaseV1=true;
      window.sendChat=fn;
    }
    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaSerbiaKosovoCaseV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaSerbiaKosovoCaseV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  setTimeout(install,700);
  setTimeout(install,1500);
  setTimeout(install,2800);
  setTimeout(install,4500);
})();

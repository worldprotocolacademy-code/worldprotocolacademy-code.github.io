/* WPA Symbols Conference Flags Guard v1.0 — 2026-08-11
   Question-first handling for flag placement at international conferences,
   including UN, NATO and EU contexts.

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
    var conf=/(меѓународн.*конферен|меѓународн.*состан|конференц|конференз|кинфферен|конгрес|самит|делегац|учеснич|учесник|international conference|international meeting|summit|delegation|participants)/.test(z);
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

  function answer(q){
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
        var q=input.value.trim();if(!q||!conferenceIntent(q))return prev();
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

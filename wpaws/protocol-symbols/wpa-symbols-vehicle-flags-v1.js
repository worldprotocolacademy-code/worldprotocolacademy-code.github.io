/* WPA Symbols Official Vehicle Flags Guard v1.1 — 2026-08-11
   Dedicated handling for flag placement on official/state-visit vehicles.

   WPA/internal basis:
   - Smiljanov / World Protocol materials: in an official motorcade with two
     flags, the host/domestic flag is on the right and the foreign flag on the
     left; the single national flag is mounted at the right front of the vehicle.
   - WPA academic source: Article 22 of the active Macedonian flag-use framework
     is summarized as requiring the Macedonian state flag on the right side of
     the chassis as viewed from the front.

   Routing hardening in v1.1:
   - intercept the question before generic dataset/AI routing when possible;
   - if another runtime layer still emits the generic "verified WPA Symbols
     database has no record" fallback for a matching vehicle-flag question,
     replace that fallback in the chat with the deterministic protocol answer.

   Comparative caution:
   - There is no universal treaty rule fixing guest/host vehicle-flag sides for
     every country. Host-state protocol and local usage control.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_VEHICLE_FLAGS_V1__) return;
  window.__WPA_SYMBOLS_VEHICLE_FLAGS_V1__=true;

  function s(v){return String(v==null?'':v);}
  function norm(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();}
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}

  function flagTerm(z){return /(знаме|знамето|знамиња|flag|flags)/.test(z);}
  function vehicleTerm(z){return /(возил|автомобил|кола|лимузин|кортеж|motorcar|motor car|vehicle|car|limousine|motorcade)/.test(z);}
  function visitTerm(z){return /(државн.*посет|официјалн.*посет|странск.*претседател|шеф.*држав|гостин|гостинот|делегац|state visit|official visit|foreign president|head of state|guest|delegation)/.test(z);}
  function sideTerm(z){return /(десн|лев|страна|пози|постав|истак|монти|right|left|side|position|place|mount|display|fly)/.test(z);}

  function intent(q){
    var z=norm(q);
    return flagTerm(z)&&vehicleTerm(z)&&(visitTerm(z)||sideTerm(z));
  }

  function asksNorthMacedonia(z){
    return /(македони|северна македонија|кај нас|north macedonia|macedonia)/.test(z);
  }

  function asksGuestRight(z){
    return /(гост.*десн|странск.*десн|десн.*гост|десн.*странск|guest.*right|foreign.*right|right.*guest|right.*foreign)/.test(z);
  }

  function answer(q){
    if(!intent(q)) return null;
    var z=norm(q),mk=isMk(q),mkCtx=asksNorthMacedonia(z),guestRight=asksGuestRight(z);

    if(mk){
      var parts=[];
      if(guestRight){
        parts.push('🚘🏳️ Ако мислите на службено возило на домаќинот при државна или официјална посета во македонскиот протокол: не — кога на возилото се истакнуваат две знамиња, домашното/македонското знаме е ДЕСНО, а знамето на странскиот гостин е ЛЕВО.');
      }else{
        parts.push('🚘🏳️ Кај официјално возило со две национални знамиња, WPA/македонскиот протоколарен стандард што го користиме е: домашното знаме ДЕСНО, странското знаме ЛЕВО.');
      }
      parts.push('За Македонија, во WPA академскиот материјал член 22 од Законот за употребата на грбот, знамето и химната е обработен со правило дека македонското државно знаме на моторно возило се поставува на десната страна на шасијата, гледано од предната страна на возилото. Во „Светски протокол“ истото е операционализирано за официјален кортеж: „домашното десно, странското лево“.');
      parts.push('⚠️ Ова не треба да се претставува како едно универзално меѓународно правило. Распоредот на автомобилските знамиња зависи од протоколот на земјата домаќин и од конкретната конфигурација на посетата.');
      if(!mkCtx){
        parts.push('Ако станува збор за посета во Северна Македонија и на возилото се поставуваат две знамиња, практичниот одговор е: македонското знаме десно, знамето на гостинот лево.');
      }
      return parts.join('\n\n');
    }

    return [
      '🚘🏳️ For an official/state-visit vehicle in the North Macedonian/WPA protocol model, when two national flags are displayed, the host flag is on the RIGHT and the visiting foreign flag on the LEFT.',
      'The WPA academic material summarises Article 22 of the Macedonian flag-use framework as placing the Macedonian state flag on the right side of the chassis when viewed from the front. World Protocol operationalises this as “host right, foreign left” for an official motorcade.',
      'This should not be universalised: vehicle-flag arrangements vary by host country and by the configuration of the specific visit.'
    ].join('\n\n');
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function isGenericNoRecord(text){
    var z=norm(text);
    return /тековната верифицирана wpa symbols база нема запис|нема запис за барањето|консултирајте ги официјалните државни извори|current verified wpa symbols database has no record|no record for the request|consult official state sources/.test(z);
  }

  function previousUserFor(node){
    var p=node&&node.previousElementSibling;
    while(p){
      if(p.classList&&p.classList.contains('user')) return s(p.textContent).trim();
      p=p.previousElementSibling;
    }
    var body=document.getElementById('chatBody');
    if(!body)return'';
    var users=body.querySelectorAll('.wpa-chat-msg.user');
    return users.length?s(users[users.length-1].textContent).trim():'';
  }

  function repairFallbackNode(node){
    if(!node||!node.classList||!node.classList.contains('bot'))return;
    var text=s(node.textContent).trim();
    if(!isGenericNoRecord(text))return;
    var q=previousUserFor(node);
    if(!q||!intent(q))return;
    var a=answer(q);
    if(a)node.textContent=a;
  }

  function installFallbackRepair(){
    var body=document.getElementById('chatBody');
    if(!body||body.__wpaVehicleFallbackObserver)return;
    body.__wpaVehicleFallbackObserver=true;
    Array.prototype.forEach.call(body.querySelectorAll('.wpa-chat-msg.bot'),repairFallbackNode);
    if(typeof MutationObserver==='function'){
      var observer=new MutationObserver(function(mutations){
        mutations.forEach(function(m){
          Array.prototype.forEach.call(m.addedNodes||[],function(n){
            if(n&&n.nodeType===1){
              repairFallbackNode(n);
              if(n.querySelectorAll)Array.prototype.forEach.call(n.querySelectorAll('.wpa-chat-msg.bot'),repairFallbackNode);
            }
          });
        });
      });
      observer.observe(body,{childList:true,subtree:true});
      body.__wpaVehicleFallbackObserverRef=observer;
    }
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaVehicleFlagsV1){
      var prev=window.sendChat;
      var fn=function(){
        var input=document.getElementById('chatInput');if(!input)return prev();
        var q=input.value.trim();if(!q||!intent(q))return prev();
        var a=answer(q);if(!a)return prev();
        add('user',q);input.value='';add('bot',a);input.focus();
      };
      fn.__wpaVehicleFlagsV1=true;
      window.sendChat=fn;
    }
    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaVehicleFlagsV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaVehicleFlagsV1=true;
      window.wpaBotAnswer=wrapped;
    }
    installFallbackRepair();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installFallbackRepair,{once:true});
  install();
  setTimeout(install,800);
  setTimeout(install,1700);
  setTimeout(install,3200);
  setTimeout(install,5200);
  setTimeout(install,7200);
  setTimeout(install,10000);
})();

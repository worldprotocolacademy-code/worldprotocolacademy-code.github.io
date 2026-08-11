/* WPA Symbols Official Vehicle Flags Guard v1.0 — 2026-08-11
   Dedicated handling for flag placement on official/state-visit vehicles.

   WPA/internal basis:
   - Smiljanov / World Protocol materials: in an official motorcade with two
     flags, the host/domestic flag is on the right and the foreign flag on the
     left; the single national flag is mounted at the right front of the vehicle.
   - WPA academic source: Article 22 of the active Macedonian flag-use framework
     is summarized as requiring the Macedonian state flag on the right side of
     the chassis as viewed from the front.

   Comparative caution:
   - There is no universal treaty rule fixing guest/host vehicle-flag sides for
     every country. Host-state protocol and local usage control.
   - India expressly uses host national flag right / foreign flag left on a
     government-provided car carrying a foreign dignitary.
   - Malta and Montenegro show different arrangements in some contexts, proving
     why the answer must not be universalized beyond the applicable host protocol.
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
      parts.push('⚠️ Сепак, ова не треба да се претставува како едно универзално меѓународно правило. Распоредот на автомобилските знамиња зависи од протоколот на земјата домаќин. Постојат држави со различна практика, особено кога гостинот патува сам, кога двајца шефови на држави го делат истото возило или кога се користи централен јарбол.');
      if(!mkCtx){
        parts.push('Затоа, ако прашањето е за конкретна странска држава, прво се проверува нејзиниот официјален протокол. Ако станува збор за посета во Северна Македонија, практичниот одговор е: македонското знаме десно, знамето на гостинот лево, кога се поставени две знамиња.');
      }
      return parts.join('\n\n');
    }

    return [
      '🚘🏳️ For an official/state-visit vehicle in the North Macedonian/WPA protocol model, when two national flags are displayed, the host flag is on the RIGHT and the visiting foreign flag on the LEFT.',
      'The WPA academic material summarises Article 22 of the Macedonian flag-use framework as placing the Macedonian state flag on the right side of the chassis when viewed from the front. World Protocol operationalises this as “host right, foreign left” for an official motorcade.',
      'This should not be universalised: vehicle-flag arrangements vary by host country and by whether the visitor travels alone, shares the car with the host Head of State, or a centre mast is used. Always follow the host State’s official protocol for the specific visit.'
    ].join('\n\n');
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;
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
  }

  install();
  setTimeout(install,800);
  setTimeout(install,1700);
  setTimeout(install,3200);
  setTimeout(install,5200);
  setTimeout(install,7200);
})();

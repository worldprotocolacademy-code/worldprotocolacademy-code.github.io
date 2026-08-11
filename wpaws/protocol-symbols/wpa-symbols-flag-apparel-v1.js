/* WPA Symbols Flag Apparel & Fashion Guard v1.1 — 2026-08-11
   Dedicated question-first handling for dresses, clothing, fashion, shirts,
   costumes and commercial reproductions using national/state flag imagery.

   Governance principles:
   - There is NO single worldwide legal rule for clothing with flag imagery.
   - Distinguish use of an actual physical flag as a garment from reproduction,
     print, stylisation or colour/pattern inspired by a flag.
   - Exact legality/etiquette depends on the law and official guidance of the
     country whose flag is used and, where relevant, the country where the item
     is manufactured/sold/worn.
   - Do not misroute words such as "земјите" (countries) to "земја/ground" intent.

   North Macedonia legal note:
   - The Law on the Use of the Coat of Arms, Flag and Anthem is active in LDBIS
     (Official Gazette 32/97, amended 110/08).
   - Article 24 provides that the flag may not be used as drapery, curtain or
     covering; gathered/folded as a wreath; or as decoration on pillows,
     handkerchiefs, napkins, paper boxes, underwear or disposable items.
   - Article 5 provides that the coat of arms and flag may not be used as
     trademarks/service marks, models, or other signs for marking goods/services.
   WPA therefore treats wearing/turning the actual Macedonian state flag into a
   dress or garment as not permitted. A merely inspired/stylised design that is
   not the flag itself may require separate legal assessment; do not overstate.

   Comparative examples:
   - United States: 4 U.S.C. §8(d) says the U.S. flag should never be used as
     wearing apparel, bedding or drapery.
   - Canada: Canadian Heritage guidance says the National Flag should never be
     used as wearing apparel or worn as a cape.
   - Australia: PM&C states that an image of the Australian National Flag may be
     used commercially in many circumstances if reproduced accurately/dignified.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_FLAG_APPAREL_V1__) return;
  window.__WPA_SYMBOLS_FLAG_APPAREL_V1__=true;

  function s(v){return String(v==null?'':v);}
  function norm(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();}
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}

  function flagWord(z){return /(знаме|знамето|знамиња|знамињата|flag|flags)/.test(z);}
  function apparelWord(z){
    return /(фустан|фустани|облека|облек|маица|маици|дрес|дресови|костим|костими|наметка|мода|моден|текстил|fashion|dress|dresses|clothing|clothes|apparel|shirt|shirts|t shirt|tshirt|jersey|jerseys|costume|garment|garments|cape|textile)/.test(z);
  }
  function reproductionWord(z){
    return /(ликот|лик|слика|дизајн|мотив|принт|печат|шара|шема|боите|репродук|стилиз|image|design|motif|print|pattern|colours|colors|reproduc|stylis|styliz)/.test(z);
  }
  function permissionWord(z){
    return /(смее|дозвол|може|прават|изработ|корист|носи|носење|забран|legal|allowed|permitted|may|can|make|manufactur|use|wear|prohibit|ban)/.test(z);
  }

  function intent(q){
    var z=norm(q);
    return flagWord(z)&&apparelWord(z)&&(permissionWord(z)||reproductionWord(z));
  }

  function countryHint(z){
    if(/северна македонија|република македонија|македонск|македонија|north macedonia|republic of macedonia|macedonian flag|macedonia/.test(z)) return 'MK';
    if(/саудиск|saudi/.test(z)) return 'SA';
    if(/сад|американ|united states|usa|american/.test(z)) return 'US';
    if(/канад|canad/.test(z)) return 'CA';
    if(/австрал|austral/.test(z)) return 'AU';
    return '';
  }

  function answer(q){
    if(!intent(q)) return null;
    var z=norm(q),mk=isMk(q),c=countryHint(z);

    if(mk){
      if(c==='MK'){
        return [
          '👗🇲🇰 За државното знаме на Северна Македонија: самото знаме не треба да се претвора во фустан или друга облека, ниту да се носи како облека.',
          'Законот за употребата на грбот, знамето и химната на Република Македонија е активен (Службен весник бр. 32/97, со измена 110/08). Член 24 предвидува дека знамето не смее да се употребува како драперија, завеса или прекривка, свиткано во форма на венец или набрано, ниту како украс на перници, марамчиња, салвети, кутии од хартија, долна облека или предмети што веднаш по употребата се фрлаат. Член 5 дополнително забранува грбот и знамето да се употребуваат како стоковни или услужни жигови, модели или други знаци за означување стоки или услуги.',
          '⚖️ Практичен заклучок: фустан направен од самото државно знаме или носење на самото знаме како облека не е дозволена употреба. Ако станува збор само за стилизиран моден мотив инспириран од црвено-жолтите бои или сонцето, а не за самото знаме како целина, тоа е посебно правно прашање и не треба автоматски да се изедначи со носење на државното знаме.'
        ].join('\n\n');
      }
      if(c==='US'){
        return '👗🇺🇸 За знамето на САД: американскиот Flag Code (4 U.S.C. §8(d)) вели дека знамето не треба да се користи како облека, постелнина или драперија. Затоа треба да се разликува употреба на вистинско знаме како материјал за фустан од моден принт/графички мотив инспириран од знамето. За конкретен производ или комерцијална употреба треба да се проверат и другите применливи правила.';
      }
      if(c==='CA'){
        return '👗🇨🇦 За Канада: Canadian Heritage наведува дека националното знаме не треба да се користи како облека или како наметка. Истовремено, канадската влада објаснува дека општата flag-etiquette за приватни лица е воспоставена практика и насока, а не една општа законска забрана. Значи: користење на самото знаме како фустан е протоколарно несоодветно, а за печатен/стилизиран мотив треба да се провери конкретната употреба.';
      }
      if(c==='AU'){
        return '👗🇦🇺 За Австралија: официјалните насоки на PM&C дозволуваат слика/репродукција на австралиското национално знаме и за комерцијални цели во многу случаи без формална дозвола, но бараат знамето да биде прикажано достоинствено, целосно и точно. Тоа покажува дека моден принт со знамето не е исто што и претворање на вистинско знаме во облека.';
      }
      if(c==='SA'){
        return '👗🇸🇦 За Саудиска Арабија потребна е посебна претпазливост: знамето е предмет на посебен закон и содржи Шахада, па употребата на неговиот лик на облека или комерцијални производи не треба да се третира како обична декоративна употреба. За конкретен производ треба да се провери тековниот саудиски закон и официјална практика пред употреба.';
      }
      return [
        '👗 Не постои едно универзално меѓународно правило што важи за фустани или друга облека со лик/дизајн на сите државни знамиња.',
        'Клучната разлика е меѓу: (1) користење на ВИСТИНСКО физичко знаме како материјал за фустан/облека и (2) печатење, репродукција или стилизиран мотив на знамето на текстил. Првото во многу протоколарни системи се смета за несоодветно, а во некои држави е и правно ограничено. Второто може да биде дозволено во некои држави, но зависи од националното законодавство, правилата за државни симболи, трговски марки/комерцијална употреба и барањето за достоинствен третман.',
        'Примери: во Северна Македонија самото државно знаме не треба да се претвора или носи како облека; САД во 4 U.S.C. §8(d) наведуваат дека знамето не треба да се користи како облека; Канада официјално советува националното знаме да не се користи како облека или наметка; Австралија дозволува комерцијална репродукција на ликот на знамето во многу случаи ако е точна и достоинствена.',
        '⚖️ WPA Protocol Rule: пред изработка на фустан или моден производ со конкретно национално знаме, прво се проверуваат правилата на ТАА држава. Не треба автоматски да се заклучи „дозволено е за сите“ или „забрането е за сите“. Особено внимателно се постапува со знамиња што содржат религиозен текст, државен грб или други законски заштитени елементи.'
      ].join('\n\n');
    }

    if(c==='MK'){
      return '👗🇲🇰 For North Macedonia, the state flag itself should not be turned into or worn as a dress/garment. The active Law on the Use of the Coat of Arms, Flag and Anthem (Official Gazette 32/97, amended 110/08) prohibits use of the flag as drapery, curtain or covering and includes additional restrictions on decorative/commercial uses. A merely inspired or stylised design that is not the flag itself requires separate legal assessment.';
    }

    return [
      '👗 There is no single worldwide rule governing dresses or clothing that display national/state flag designs.',
      'The key distinction is between (1) using an ACTUAL physical flag as the material for a garment and (2) printing/reproducing/stylising a flag design on textile. The first is often considered inappropriate under flag etiquette and may be legally restricted in some countries. The second may be permitted in some jurisdictions, but depends on national law, rules protecting state symbols, commercial/trademark rules and dignity requirements.',
      'Examples include North Macedonia, where the state flag itself should not be turned into or worn as clothing; the United States, whose Flag Code says the flag should not be used as wearing apparel; Canada, whose official guidance says the flag should not be used as wearing apparel or a cape; and Australia, which permits many commercial reproductions of the flag image when reproduced accurately and with dignity.',
      '⚖️ WPA Protocol Rule: verify the rules of the specific country whose flag is being used before producing or wearing the garment. Do not generalise that flag-fashion is either permitted everywhere or prohibited everywhere.'
    ].join('\n\n');
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaFlagApparelV1){
      var prev=window.sendChat;
      var fn=function(){
        var input=document.getElementById('chatInput');if(!input)return prev();
        var q=input.value.trim();if(!q||!intent(q))return prev();
        var a=answer(q);if(!a)return prev();
        add('user',q);input.value='';add('bot',a);input.focus();
      };
      fn.__wpaFlagApparelV1=true;
      window.sendChat=fn;
    }
    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaFlagApparelV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaFlagApparelV1=true;
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

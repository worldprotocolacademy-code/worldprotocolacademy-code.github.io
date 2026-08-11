/* WPA Symbols Diplomatic Premises Guard v1.0 — 2026-08-11
   Deterministic diplomatic-law/protocol intent for embassy flag questions.

   Primary legal basis:
   Vienna Convention on Diplomatic Relations (1961)
   - Article 20: mission/head may use sending State flag and emblem on mission
     premises, head-of-mission residence and means of transport.
   - Article 21: mission premises are acquired/obtained in the territory of the
     receiving State.
   - Article 22: mission premises are inviolable and protected from entry/search,
     requisition, attachment and execution.

   Important doctrine:
   Diplomatic premises are not territory of the sending State. Their special
   status is based on inviolability and immunity, not a transfer of sovereignty.
   See also U.S. Department of State FAM 7 FAM 013, which expressly states that
   diplomatic/consular premises are not part of the sending State's territory.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_DIPLOMATIC_PREMISES_V1__) return;
  window.__WPA_SYMBOLS_DIPLOMATIC_PREMISES_V1__=true;

  function s(v){return String(v==null?'':v);}
  function norm(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function mk(q){
    return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));
  }

  function embassyContext(q){
    var z=norm(q);
    return /(амбасад|амбасадата|амбасади|дипломатск.*миси|простории.*миси|ambasad|ambasada|ambasadata|ambasadi|embassy|embassies|diplomatic mission|mission premises)/.test(z);
  }

  function extraterritorialIntent(q){
    var z=norm(q);
    return /(екстеритори|екстратеритори|екстеритор|екстратеритор|exterritori|extraterritori|foreign territory|странска територи|туѓа територи|територија на странската држава|територија на државата испраќач)/.test(z);
  }

  function flagAtMissionIntent(q){
    var z=norm(q);
    return embassyContext(q)&&/(знаме|знамето|знамиња|flag|flags|emblem|грб)/.test(z)&&
      /(постав|истак|подиг|вее|пред|на објект|на зграда|postav|istak|podig|vee|pred|display|fly|flying|raise|hoist|place)/.test(z);
  }

  function inviolabilityIntent(q){
    var z=norm(q);
    return embassyContext(q)&&/(неповредлив|неповредливост|имунитет|влез|влезе|претрес|заплен|inviolab|immunity|enter|entry|search|seizure|attachment)/.test(z);
  }

  function directIntent(q){
    return embassyContext(q)&&(extraterritorialIntent(q)||flagAtMissionIntent(q)||inviolabilityIntent(q));
  }

  function answer(q){
    if(!directIntent(q)) return null;
    var z=norm(q),isMk=mk(q);

    if(extraterritorialIntent(q)){
      if(isMk){
        return '🏛️ Не. Истакнувањето или поставувањето на знамето на државата испраќач на амбасада не создава екстериторијалност. Член 20 од Виенската конвенција за дипломатски односи ѝ дава право на мисијата и на шефот на мисијата да ги користат знамето и грбот/амблемот на државата испраќач на просториите на мисијата, резиденцијата на шефот на мисијата и неговото службено превозно средство. Просториите на амбасадата, сепак, остануваат на територијата на државата примач; нивниот посебен статус е дипломатска неповредливост и имунитет според член 22, а не пренос на суверенитет. Значи: амбасадата не е „странска територија“, а знамето ја означува државната припадност и репрезентативната функција на дипломатската мисија. Ако знамето е поставено на јавна површина пред, а не во рамките на просториите на мисијата, тогаш дополнително се применуваат локалните правила и протокол на државата примач. Извор: Виенска конвенција за дипломатски односи, чл. 20–22.';
      }
      return '🏛️ No. Flying or displaying the sending State’s flag at an embassy does not create extraterritoriality. Article 20 of the Vienna Convention on Diplomatic Relations gives the mission and its head the right to use the sending State’s flag and emblem on mission premises, the head-of-mission residence and official transport. The embassy premises nevertheless remain within the territory of the receiving State; their special legal status is inviolability and immunity under Article 22, not a transfer of sovereignty. An embassy is therefore not “foreign territory.” If a flag is placed on public land outside the mission premises, local law and host-State protocol also apply. Source: Vienna Convention on Diplomatic Relations, Arts. 20–22.';
    }

    if(inviolabilityIntent(q)){
      return isMk
        ? '🏛️ Просториите на дипломатската мисија се неповредливи, но не се територија на државата испраќач. Според член 22 од Виенската конвенција, органите на државата примач не смеат да влезат без согласност на шефот на мисијата; државата примач има посебна должност да ги заштитува просториите, а тие се заштитени од претрес, реквизиција, заплена и извршување. Тоа е дипломатска неповредливост/имунитет, не екстериторијалност.'
        : '🏛️ Diplomatic mission premises are inviolable, but they are not territory of the sending State. Under Article 22 of the Vienna Convention, receiving-State authorities may not enter without the head of mission’s consent, the receiving State must protect the premises, and the premises are protected from search, requisition, attachment and execution. This is diplomatic inviolability/immunity, not extraterritoriality.';
    }

    if(flagAtMissionIntent(q)){
      return isMk
        ? '🏳️ Да, Виенската конвенција изречно го признава правото на дипломатската мисија и на нејзиниот шеф да ги користат знамето и грбот/амблемот на државата испраќач на просториите на мисијата, резиденцијата на шефот на мисијата и неговото службено превозно средство (чл. 20). Самото истакнување на знамето не ја претвора амбасадата во територија на странската држава.'
        : '🏳️ Yes. Article 20 of the Vienna Convention expressly recognizes the right of the diplomatic mission and its head to use the sending State’s flag and emblem on mission premises, the head-of-mission residence and official transport. Displaying the flag does not turn the embassy into territory of the sending State.';
    }

    return null;
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
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaDiplomaticPremisesV1){
      var prevSend=window.sendChat;
      var send=async function(){
        var input=document.getElementById('chatInput');
        if(!input) return prevSend();
        var q=input.value.trim();
        if(!q||!directIntent(q)) return prevSend();
        var a=answer(q);
        if(!a) return prevSend();
        add('user',q);
        input.value='';
        add('bot',a);
        input.focus();
      };
      send.__wpaDiplomaticPremisesV1=true;
      window.sendChat=send;
    }

    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaDiplomaticPremisesV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaDiplomaticPremisesV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  setTimeout(install,900);
  setTimeout(install,1800);
  setTimeout(install,3000);
  setTimeout(install,4600);
})();

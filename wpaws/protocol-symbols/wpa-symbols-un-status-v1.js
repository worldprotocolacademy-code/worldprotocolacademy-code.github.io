/* WPA Symbols UN Status & Recognition Guard v1.0 — 2026-08-11
   Primary-source deterministic handling for UN membership / observer / recognition questions.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_UN_STATUS_V1__) return;
  window.__WPA_SYMBOLS_UN_STATUS_V1__=true;

  var snapshot=null;
  var loadPromise=fetch('./data/un-status-v1.json?v=20260811-un1',{cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}})
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(d){snapshot=d;return d;})
    .catch(function(){return null;});

  function s(v){return String(v==null?'':v);}
  function clean(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();}
  function mk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}

  function isUNStatusQuestion(q){
    var z=clean(q);
    var un=/(обединетите нации|обединети нации|он|united nations|\bun\b)/.test(z);
    var status=/(признат|непризнат|признавање|recogn|член|членка|membership|member|набљудувач|observer|статус|status)/.test(z);
    return un&&status;
  }

  function isRecognitionQuestion(q){return /(признат|непризнат|признавање|recogn)/.test(clean(q));}
  function isNonMemberQuestion(q){return /(не.*член|не.*членка|non member|not.*member|кои.*не.*член)/.test(clean(q));}
  function isObserverQuestion(q){return /(набљудувач|observer)/.test(clean(q));}

  function answer(q){
    if(!snapshot||!isUNStatusQuestion(q)) return null;
    var isMk=mk(q),obs=snapshot.non_member_observer_states||[];

    if(isRecognitionQuestion(q)){
      return isMk
        ? [
            'Важно разграничување: Обединетите нации не „признаваат“ или „не признаваат“ држави. Дипломатското признавање го даваат поединечни држави и влади.',
            'ОН имаат '+snapshot.un_member_state_count+' држави-членки.',
            'Во моментов две држави имаат статус на држави-набљудувачи што не се членки на ОН: '+obs.map(function(x){return x.name_mk;}).join(' и ')+'.',
            'Затоа, ентитети како Косово, Тајван, Западна Сахара или Северен Кипар не треба едноставно да се нарекуваат „непризнати од ОН“; кај нив мора одделно да се разгледаат членството во ОН, статусот во системот на ОН и признавањето од поединечни држави.',
            'За официјална дипломатска или правна употреба, статусот треба повторно да се провери во тековни примарни извори на ОН.'
          ].join('\n\n')
        : [
            'Important distinction: the United Nations does not itself “recognize” or “not recognize” States. Diplomatic recognition is granted or withheld by individual States and Governments.',
            'The UN currently has '+snapshot.un_member_state_count+' Member States.',
            'Two States currently hold non-Member Observer State status at the UN: '+obs.map(function(x){return x.name_en;}).join(' and ')+'.',
            'Entities such as Kosovo, Taiwan, Western Sahara or Northern Cyprus therefore should not simply be labelled “unrecognized by the UN”; UN membership, status in the UN system, and recognition by individual States must be distinguished.',
            'For official diplomatic or legal use, reconfirm the status against current primary UN sources.'
          ].join('\n\n');
    }

    if(isNonMemberQuestion(q)||isObserverQuestion(q)){
      return isMk
        ? [
            'ОН имаат '+snapshot.un_member_state_count+' држави-членки.',
            'Двете држави-набљудувачи што не се членки се:',
            obs.map(function(x){return '• '+x.name_mk+' — '+x.status_mk+(x.resolution?' ('+x.resolution+')':'');}).join('\n'),
            'Ова не е листа на сите спорни или делумно признати ентитети; членството во ОН и дипломатското признавање се различни прашања.'
          ].join('\n\n')
        : [
            'The UN has '+snapshot.un_member_state_count+' Member States.',
            'The two non-Member Observer States are:',
            obs.map(function(x){return '• '+x.name_en+' — '+x.status_en+(x.resolution?' ('+x.resolution+')':'');}).join('\n'),
            'This is not a list of all disputed or partially recognized entities; UN membership and diplomatic recognition are different questions.'
          ].join('\n\n');
    }

    return isMk
      ? 'За прашања за ОН мора да се разликуваат: членство, набљудувачки статус и дипломатско признавање. Кажи кој од овие три статуса сакаш да го провериме.'
      : 'For UN-related questions, membership, observer status, and diplomatic recognition must be distinguished. Tell me which of the three you want to check.';
  }

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaUNStatusV1){
      var prev=window.sendChat;
      var fn=async function(){
        var input=document.getElementById('chatInput');
        if(!input)return prev();
        var q=input.value.trim();
        if(!q)return prev();
        if(isUNStatusQuestion(q)){
          try{await loadPromise;}catch(e){}
          var a=answer(q);
          if(a){add('user',q);input.value='';add('bot',a);input.focus();return;}
        }
        return prev();
      };
      fn.__wpaUNStatusV1=true;
      window.sendChat=fn;
    }

    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaUNStatusV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return answer(q)||prevAnswer(q);};
      wrapped.__wpaUNStatusV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  loadPromise.then(install).catch(function(){});
  setTimeout(install,700);
  setTimeout(install,1800);
  setTimeout(install,3200);
})();

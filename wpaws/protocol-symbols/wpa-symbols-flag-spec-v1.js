/* WPA Symbols Flag Specification Guard v1.0 — 2026-08-11
   Question-first specialist for flag construction/formula and colour-code follow-ups.
   Current verified legal construction profile: North Macedonia.
*/
(function(){
  'use strict';
  if(window.__WPA_SYMBOLS_FLAG_SPEC_V1__) return;
  window.__WPA_SYMBOLS_FLAG_SPEC_V1__=true;

  var spec=null;
  var ready=fetch('./data/mk-flag-spec-v1.json?v=20260811-flagspec1',{
    cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}
  }).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(d){spec=d;return true;}).catch(function(){return false;});

  function s(v){return String(v==null?'':v);}
  function norm(v){
    return s(v).toLowerCase().normalize('NFKC')
      .replace(/[^\p{L}\p{N}#]+/gu,' ')
      .replace(/\s+/g,' ').trim();
  }
  function isMk(q){return window.WPA_CHAT_LANG!=='en'||/[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(s(q));}

  function userQuestions(){
    var body=document.getElementById('chatBody');
    if(!body) return [];
    return Array.prototype.map.call(body.querySelectorAll('.wpa-chat-msg.user'),function(n){return s(n.textContent).trim();});
  }
  function previousUserQuestion(){
    var a=userQuestions();
    return a.length?a[a.length-1]:'';
  }

  function mentionsMk(q){
    return /(северна македонија|македонија|македонск|severna makedonija|makedonija|makedonsk|north macedonia|macedonia|macedonian)/.test(norm(q));
  }
  function flagWord(q){return /(знаме|знамето|zname|znameto|flag)/.test(norm(q));}
  function constructionWord(q){
    return /(формул|конструкц|спецификац|димензи|пропорц|сразмер|размер|сооднос|formula|construction|specification|dimension|proportion|ratio)/.test(norm(q));
  }
  function colorCodeWord(q){
    return /(код.*бој|бој.*код|хекс|hex|rgb|cmyk|pantone|пантон|колор код|color code|colour code|code.*color|code.*colour)/.test(norm(q));
  }
  function vagueCodeFollowup(q){
    return /^(кој|која|кое|кои|а)?\s*(е|се)?\s*(кодот|кодовите|код|code|codes)(\s+на\s+бојата|\s+на\s+боите|\s+за\s+бојата|\s+за\s+боите)?\??$/.test(norm(q));
  }
  function previousWasMkFlag(q){
    var z=norm(q||previousUserQuestion());
    return mentionsMk(z)&&flagWord(z)&&(constructionWord(z)||/(бој|color|colour)/.test(z));
  }

  function formulaIntent(q){
    return mentionsMk(q)&&flagWord(q)&&constructionWord(q);
  }
  function colorIntent(q){
    if(colorCodeWord(q)&&mentionsMk(q)) return true;
    if(colorCodeWord(q)&&flagWord(q)&&mentionsMk(previousUserQuestion())) return true;
    if((colorCodeWord(q)||vagueCodeFollowup(q))&&previousWasMkFlag(previousUserQuestion())) return true;
    return false;
  }

  function formulaAnswer(q){
    if(!formulaIntent(q)||!spec) return null;
    var l=spec.legal_specification||{};
    if(isMk(q)){
      return '📐 Формулата/конструкцијата на знамето на Северна Македонија е: сразмер 1:2 (ширина : должина); црвено поле со златно-жолто сонце; 8 сончеви зраци што се шират до рабовите; зраците се распоредени по хоризонтала, вертикала и дијагоналите; дијаметарот на сончевиот диск е 1/7 од должината на знамето; центарот на сонцето е во пресекот на дијагоналите. Оваа геометрија е утврдена во член 2 од Законот за знамето (Сл. весник бр. 47/95).';
    }
    return '📐 North Macedonia flag construction: 1:2 ratio (width:length); red field with a golden-yellow sun; 8 rays extending to the edges along horizontal, vertical and diagonal axes; the sun disk diameter is 1/7 of the flag length; the sun center is at the intersection of the diagonals. This construction is set out in Article 2 of the 1995 Flag Law.';
  }

  function colorAnswer(q){
    if(!colorIntent(q)||!spec) return null;
    var p=spec.digital_reference_palette||{};
    var red=p.red||{},yellow=p.golden_yellow||{};
    if(isMk(q)){
      return '🎨 Законот ги определува боите како „црвена“ и „златно-жолта“, но во самиот закон не се наведени HEX, RGB или Pantone кодови. За дигитална WPA референца — не како официјален законски код — може да се користат: црвена '+s(red.hex)+' / RGB '+(red.rgb||[]).join(', ')+'; златно-жолта '+s(yellow.hex)+' / RGB '+(yellow.rgb||[]).join(', ')+'. Приближни Pantone референци: '+s(red.pantone_approx)+' и '+s(yellow.pantone_approx)+'. За правна/службена репродукција приоритет има ликовно-графичкиот приказ што е составен дел на Законот.';
    }
    return '🎨 The law names the colours as red and golden-yellow but does not itself state HEX, RGB or Pantone codes. For WPA digital reference only—not as a statutory colour code—use red '+s(red.hex)+' / RGB '+(red.rgb||[]).join(', ')+' and golden-yellow '+s(yellow.hex)+' / RGB '+(yellow.rgb||[]).join(', ')+'. Approximate Pantone references: '+s(red.pantone_approx)+' and '+s(yellow.pantone_approx)+'. For official reproduction, the graphic construction attached to the law takes priority.';
  }

  function direct(q){return formulaAnswer(q)||colorAnswer(q)||null;}
  function hasIntent(q){return formulaIntent(q)||colorIntent(q);}

  function add(role,text){
    var body=document.getElementById('chatBody');if(!body)return;
    var d=document.createElement('div');d.className='wpa-chat-msg '+role;d.textContent=text;
    body.appendChild(d);body.scrollTop=body.scrollHeight;
  }

  function install(){
    if(typeof window.sendChat==='function'&&!window.sendChat.__wpaFlagSpecV1){
      var prev=window.sendChat;
      var fn=async function(){
        var input=document.getElementById('chatInput');
        if(!input)return prev();
        var q=input.value.trim();
        if(!q)return prev();
        if(hasIntent(q)){
          try{await ready;}catch(e){}
          var a=direct(q);
          if(a){add('user',q);input.value='';add('bot',a);input.focus();return;}
        }
        return prev();
      };
      fn.__wpaFlagSpecV1=true;
      window.sendChat=fn;
    }

    if(typeof window.wpaBotAnswer==='function'&&!window.wpaBotAnswer.__wpaFlagSpecV1){
      var prevAnswer=window.wpaBotAnswer;
      var wrapped=function(q){return direct(q)||prevAnswer(q);};
      wrapped.__wpaFlagSpecV1=true;
      window.wpaBotAnswer=wrapped;
    }
  }

  install();
  ready.then(install).catch(function(){});
  setTimeout(install,1000);
  setTimeout(install,2100);
  setTimeout(install,3100);
  setTimeout(install,3900);
  setTimeout(install,4800);
})();

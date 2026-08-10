/* WPA homepage Symbols card update v1.0
   Replaces legacy 53-record / all-verified copy with the active 197-entity dataset framing.
*/
(function(){
  'use strict';

  var replacements = [
    ['WPA · Protocol Symbols Lab · Верифицирана база','WPA · Protocol Symbols & Knowledge Module · Активна база'],
    ['WPA · Protocol Symbols Lab · Verified database','WPA · Protocol Symbols & Knowledge Module · Active dataset'],

    ['Знамиња. Химни. Грбови. Само верифицирани факти.','Знамиња. Химни. Државни симболи. Протоколарен контекст.'],
    ['Flags. Anthems. Coats of Arms. Only verified facts.','Flags. Anthems. State Symbols. Protocol Context.'],

    ['Структурирана протоколарна база со верифицирани записи за државни симболи — официјална протоколарна база на World Protocol Academy.','Активна структурирана MK/EN референтна база за 197 држави и протоколарни ентитети, 95 записи за национални денови и 9 меѓународни организации — со аналитика, споредба, квиз и WPA Symbols Expert Assistant.'],
    ['Structured protocol database with verified records for state symbols — the official protocol database of World Protocol Academy.','Active structured MK/EN reference dataset covering 197 countries and protocol entities, 95 national-day records and 9 international organizations — with analytics, comparison, quiz and the WPA Symbols Expert Assistant.'],

    ['Верифицирани описи: бои, симболи, орел на знаме наспроти орел само на грб.','Структурирани описи на бои и симболи, со јасно разграничување меѓу знаме, грб и амблем каде што податокот е проверен.'],
    ['Verified descriptions: colours, symbols, eagle on the flag versus eagle only on the coat of arms.','Structured descriptions of colours and symbols, clearly distinguishing flag, coat of arms and emblem where the field has been verified.'],

    ['Официјални наслови и верификација: кои химни се официјално инструментални.','Наслови, протоколарна употреба и посебно означување на инструментални химни каде што е потврдено.'],
    ['Official titles and verification: which anthems are officially instrumental.','Titles, protocol use and dedicated marking of instrumental anthems where confirmed.'],

    ['Прецизни описи на грбови, разграничени од симболите на знамиња.','Референтни описи на грбови, амблеми и државни симболи, одделно од знамињата.'],
    ['Precise descriptions of coats of arms, distinguished from symbols appearing on flags.','Reference descriptions of coats of arms, emblems and state symbols, kept distinct from flags.'],

    ['Верифицирани главни градови и континентална припадност за сите 53 записи.','Активен dataset со 197 држави и протоколарни ентитети, вклучувајќи сложени случаи со уставен, административен или дипломатски центар.'],
    ['Verified capitals and continental affiliation for all 53 records.','Active dataset covering 197 countries and protocol entities, including complex cases with constitutional, administrative or diplomatic centres.'],

    ['53 верифицирани записи · Официјална WPA верифицирана протоколарна база','197 држави и протоколарни ентитети · 95 национални денови · 9 меѓународни организации · MK/EN'],
    ['53 verified records · Official WPA verified protocol database','197 countries and protocol entities · 95 national-day records · 9 international organizations · MK/EN']
  ];

  function shouldSkip(node){
    if(!node || !node.parentElement) return true;
    var tag = node.parentElement.tagName;
    return tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'NOSCRIPT';
  }

  function replaceText(root){
    if(!root) return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    var node;
    while((node=walker.nextNode())){
      if(shouldSkip(node)) continue;
      var value=node.nodeValue;
      if(!value) continue;
      var next=value;
      replacements.forEach(function(pair){
        if(next.indexOf(pair[0])!==-1) next=next.split(pair[0]).join(pair[1]);
      });
      if(next!==value) node.nodeValue=next;
    }
  }

  function markCard(){
    var link=Array.from(document.querySelectorAll('a')).find(function(a){
      return String(a.getAttribute('href')||'').indexOf('/wpaws/protocol-symbols')!==-1 && /Protocol Symbols Lab|Protocol Symbols/i.test(a.textContent||'');
    });
    if(!link) return;
    var box=link.closest('section,article,.card,.hub,.feature,.module,.wpa-card') || link.parentElement;
    if(box){
      box.setAttribute('data-wpa-symbols-current','197-entities');
      box.setAttribute('data-wpa-symbols-version','2026-08');
    }
  }

  function run(){
    replaceText(document.body);
    markCard();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();

  [150,500,1200,2500,5000].forEach(function(delay){ window.setTimeout(run,delay); });

  var observer;
  function observe(){
    if(!document.body || observer) return;
    observer=new MutationObserver(function(mutations){
      var needs=false;
      for(var i=0;i<mutations.length;i++){
        if(mutations[i].type==='characterData' || mutations[i].addedNodes.length){ needs=true; break; }
      }
      if(needs) window.setTimeout(run,20);
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    window.setTimeout(function(){ if(observer){observer.disconnect();observer=null;} },12000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',observe,{once:true});
  else observe();
})();

/* WPA Symbols Comprehensive Assistant v3.0
   Adds deterministic country profiles and cross-dataset reasoning over the
   active 197-entity page dataset. It never invents absent fields.
*/
(function(){
  'use strict';
  var previous=null;
  function s(v){return String(v==null?'':v);}
  function n(v){return s(v).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}°²:.,><=+-]+/gu,' ').replace(/\s+/g,' ').trim();}
  function rows(){return Array.isArray(window.worldData)?window.worldData:[];}
  function mk(q){return /[А-Яа-яЃѓЌќЅѕЈјЉљЊњЏџ]/.test(q)||window.WPA_CHAT_LANG!=='en';}
  function num(v){return Number(s(v).replace(/[^0-9.]/g,''))||0;}
  function country(q){var x=n(q);return rows().find(function(c){return x.indexOf(n(c.n))>=0||new RegExp('(^|\\s)'+n(c.id)+'($|\\s)').test(x);})||null;}
  function days(c){var a=Array.isArray(window.nationalHolidays)?window.nationalHolidays:[];return a.filter(function(h){return h&&h.countryId===c.id;});}
  function eagle(c){return window.flagsWithEagles&&window.flagsWithEagles[c.id];}
  function instr(c){return window.instrumentalAnthems&&window.instrumentalAnthems[c.id];}
  function fact(c){return window.funFacts&&window.funFacts[c.id];}
  function header(t){return '◆ WPA WORLD STATE & PROTOCOL ENGINE · '+t;}

  function profile(c,isMk){
    var d=days(c),i=instr(c),e=eagle(c);
    return [
      header(isMk?'ЦЕЛОСЕН ПРОФИЛ':'COMPREHENSIVE PROFILE'),
      '🌍 '+c.n+' ('+s(c.id).toUpperCase()+')',
      (isMk?'🏙️ Главен град: ':'🏙️ Capital: ')+s(c.cap||'—'),
      (isMk?'🗺️ Континент / регион: ':'🗺️ Continent / region: ')+s(c.continent||'—'),
      (isMk?'📍 Геолокација / координати: ':'📍 Geolocation / coordinates: ')+s(c.g||'—'),
      (isMk?'👥 Население: ':'👥 Population: ')+s(c.pop||'—'),
      (isMk?'📐 Површина: ':'📐 Area: ')+s(c.area||'—'),
      (isMk?'⛏️ Природни и рудни ресурси: ':'⛏️ Natural and mineral resources: ')+s(c.r||'—'),
      (isMk?'🏳️ Знаме: ':'🏳️ Flag: ')+s(c.f||'—'),
      (isMk?'🎼 Химна: ':'🎼 Anthem: ')+(i?s(i.name||i.title||c.anthem):(c.anthem?'WPA code: '+c.anthem:'—')),
      (isMk?'🎵 Инструментална ознака: ':'🎵 Instrumental marker: ')+(i?(isMk?'да':'yes'):(isMk?'не е посебно означено во активниот слој':'not specially marked in active layer')),
      (isMk?'🦅 Орел на знамето: ':'🦅 Eagle on flag: ')+(e?(isMk?'да — ':'yes — ')+s(e):(isMk?'не е означено како потврден пример':'not marked as a confirmed example')),
      (isMk?'📅 Национален ден: ':'📅 National day: ')+(d.length?d.map(function(x){return s(x.date||((x.month||'')+'-'+(x.day||'')))+' — '+s(x.title||x.titleMk||'');}).join('; '):(isMk?'нема активен запис':'no active record')),
      fact(c)?(isMk?'💡 WPA факт: ':'💡 WPA fact: ')+fact(c):'',
      isMk?'⚖️ Правило: недостапните полиња не ги претпоставувам; за официјална употреба временски чувствителните податоци се проверуваат повторно.':'⚖️ Rule: missing fields are not inferred; time-sensitive data should be reconfirmed for official use.'
    ].filter(Boolean).join('\n');
  }

  function field(c,q,isMk){
    if(/координат|геолокац|location|geolocation/.test(q))return '📍 '+c.n+': '+s(c.g||'—');
    if(/ресурс|рудн|богатств|mineral|resources/.test(q))return '⛏️ '+c.n+': '+s(c.r||'—');
    if(/население|population/.test(q))return '👥 '+c.n+': '+s(c.pop||'—');
    if(/површина|големина|area|size/.test(q))return '📐 '+c.n+': '+s(c.area||'—');
    if(/главен град|capital/.test(q))return '🏙️ '+c.n+': '+s(c.cap||'—');
    if(/континент|continent/.test(q))return '🗺️ '+c.n+': '+s(c.continent||'—');
    if(/национален ден|national day|празник|holiday/.test(q)){var d=days(c);return '📅 '+c.n+': '+(d.length?d.map(function(x){return s(x.date)+' — '+s(x.title||x.titleMk||'');}).join('; '):(isMk?'нема активен запис':'no active record'));}
    return null;
  }

  var resources={
    gold:['злато','gold'],oil:['нафта','oil'],gas:['природен гас','natural gas'],coal:['јаглен','coal'],copper:['бакар','copper'],iron:['железо','iron'],diamonds:['дијамант','diamond'],uranium:['ураниум','uranium'],silver:['сребро','silver'],nickel:['никел','nickel'],phosphate:['фосфат','phosphate']
  };
  var symbols={eagle:['орел','eagle'],lion:['лав','lion'],sun:['сонце','sun'],crescent:['полумес','crescent'],star:['ѕвезд','star'],cross:['крст','cross'],crown:['круна','crown'],sword:['сабја','меч','sword','sabre']};
  function hasAny(text,arr){var z=n(text);return arr.some(function(x){return z.indexOf(n(x))>=0;});}

  function filtered(q,isMk){
    var all=rows().slice(), reasons=[];
    var continents=[['африка','Африка'],['africa','Африка'],['азија','Азија'],['asia','Азија'],['европа','Европа'],['europe','Европа'],['океанија','Океанија'],['oceania','Океанија'],['северна америка','Северна Америка'],['north america','Северна Америка'],['јужна америка','Јужна Америка'],['south america','Јужна Америка']];
    var ch=continents.find(function(x){return q.indexOf(x[0])>=0;});if(ch){all=all.filter(function(c){return c.continent===ch[1];});reasons.push(ch[1]);}
    Object.keys(resources).some(function(k){if(hasAny(q,resources[k])){all=all.filter(function(c){return hasAny(c.r,resources[k]);});reasons.push(k);return true;}return false;});
    Object.keys(symbols).some(function(k){if(hasAny(q,symbols[k])){all=all.filter(function(c){return hasAny(c.f,symbols[k])||(k==='eagle'&&!!eagle(c));});reasons.push(k);return true;}return false;});
    if(/инструментал|instrumental|без текст/.test(q)){all=all.filter(function(c){return !!instr(c);});reasons.push('instrumental anthem');}
    var m=q.match(/(?:над|over|more than|>)\s*([0-9][0-9.,]*)\s*(милион|million)?/);if(m&&/површина|area|km|км/.test(q)){var t=Number(m[1].replace(/,/g,''));if(m[2])t*=1000000;all=all.filter(function(c){return num(c.area)>t;});reasons.push('area > '+t+' km²');}
    if(/најголем|largest|biggest/.test(q)&&/држав|country|површина|area/.test(q)){all.sort(function(a,b){return num(b.area)-num(a.area);});all=all.slice(0,10);reasons.push('largest by area');}
    if(/најмал|smallest/.test(q)&&/држав|country|површина|area/.test(q)){all.sort(function(a,b){return num(a.area)-num(b.area);});all=all.slice(0,10);reasons.push('smallest by area');}
    if(/најмногу насел|largest population|most populous/.test(q)){all.sort(function(a,b){return num(b.pop)-num(a.pop);});all=all.slice(0,10);reasons.push('population');}
    if(!reasons.length)return null;
    if(!all.length)return isMk?'Не најдов совпаѓања во активниот WPA dataset.':'No matches found in the active WPA dataset.';
    return [header(isMk?'CROSS-DATASET REASONING':'CROSS-DATASET REASONING'),(isMk?'Филтри: ':'Filters: ')+reasons.join(' · '),all.slice(0,30).map(function(c,i){return (i+1)+'. '+c.n+' — '+c.cap+' · '+c.area+' · '+c.pop+(c.r?' · '+c.r:'')+(c.f?' · '+c.f:'');}).join('\n'),isMk?'Резултатот е детерминистички изведен од активните WPA полиња, без LLM претпоставки.':'Result is deterministically derived from active WPA fields without LLM guessing.'].join('\n');
  }

  function reverse(q,isMk){if(!/(која држава|which country|кој ентитет|which entity)/.test(q))return null;var a=rows().map(function(c){var sc=0,w=[];if(c.cap&&q.indexOf(n(c.cap))>=0){sc+=7;w.push(c.cap);}Object.keys(symbols).forEach(function(k){if(hasAny(q,symbols[k])&&(hasAny(c.f,symbols[k])||(k==='eagle'&&!!eagle(c)))){sc+=3;w.push(k);}});if(/инструментал|instrumental/.test(q)&&instr(c)){sc+=3;w.push('instrumental anthem');}return {c:c,sc:sc,w:w};}).filter(function(x){return x.sc>0;}).sort(function(a,b){return b.sc-a.sc;});if(!a.length)return null;return header('REVERSE ID')+'\n🎯 '+a[0].c.n+'\n'+(isMk?'Траги: ':'Clues: ')+a[0].w.join(', ')+'\n'+a[0].c.f;}

  function install(){
    if(typeof window.wpaBotAnswer!=='function'){setTimeout(install,80);return;}
    if(window.wpaBotAnswer.__wpaComprehensiveV3)return;
    previous=window.wpaBotAnswer;
    var fn=function(question){var q=n(question),isMk=mk(question);var rev=reverse(q,isMk);if(rev)return rev;var c=country(question);if(c){if(/кажи ми с[еè]|кажи ми сè|сè за|се за|целосен профил|complete profile|all about|country profile/.test(q))return profile(c,isMk);var f=field(c,q,isMk);if(f)return f;}var list=filtered(q,isMk);if(list)return list;return previous(question);};
    fn.__wpaSymbolsV2=true;fn.__wpaSymbolsV21=true;fn.__wpaComprehensiveV3=true;window.wpaBotAnswer=fn;
    enhance();
  }
  function enhance(){var p=document.getElementById('chatPanel');if(!p||document.getElementById('wpaComprehensiveQuickRow'))return;var base=p.querySelector('[onclick*="sendQuick"]');if(!base)return;var parent=base.parentElement,row=document.createElement('div');row.id='wpaComprehensiveQuickRow';row.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;';[['🌍 Целосен профил','Кажи ми сè за Казахстан.'],['⛏️ Ресурси','Кои држави во Африка имаат злато во ресурсите?'],['📐 Најголеми','Кои се најголемите држави во Азија по површина?'],['☀️ Симбол филтер','Кои знамиња имаат сонце?']].forEach(function(x){var b=base.cloneNode(false);b.removeAttribute('id');b.textContent=x[0];b.setAttribute('onclick','sendQuick('+JSON.stringify(x[1])+')');b.title=x[1];row.appendChild(b);});parent.appendChild(row);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();setTimeout(install,300);setTimeout(install,1000);
})();

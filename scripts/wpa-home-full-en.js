/* WPA legacy full English homepage renderer — frozen migration source only. */
(function(){
  'use strict';
  var LANG='en', DICT=null, busy=false;
  function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function get(obj,key){if(!obj||!key)return undefined;if(Object.prototype.hasOwnProperty.call(obj,key))return obj[key];return String(key).split('.').reduce(function(a,k){return a&&Object.prototype.hasOwnProperty.call(a,k)?a[k]:undefined;},obj);}
  function set(el,v,html){if(v===undefined||v===null||el.hasAttribute('data-no-i18n'))return;var s=String(v);if(html||/<\/?[a-z][\s\S]*>/i.test(s))el.innerHTML=s;else el.textContent=s;}
  function apply(){
    if(!DICT||busy)return;busy=true;
    all('[data-i18n]').forEach(function(el){set(el,get(DICT,el.getAttribute('data-i18n')),false);});
    all('[data-i18n-html]').forEach(function(el){set(el,get(DICT,el.getAttribute('data-i18n-html')),true);});
    all('[data-i18n-attr]').forEach(function(el){(el.getAttribute('data-i18n-attr')||'').split(/[;,]/).forEach(function(p){var i=p.indexOf(':');if(i<1)return;var v=get(DICT,p.slice(i+1).trim());if(v!==undefined)el.setAttribute(p.slice(0,i).trim(),String(v));});});
    var title=get(DICT,'meta.title');if(title)document.title=String(title);
    document.documentElement.lang='en';
    var sub=document.querySelector('.wpa-home-brand-sub');if(sub)sub.textContent='Protocol · Diplomacy · Public Relations · Security · Communication Studies';
    var exact={
      'Прескокни на:':'Jump to:','Програми':'Programmes','Сертификација':'Certification','Публикации':'Publications','Институт':'Institute','Контакт':'Contact','Услуги':'Services','Брифинзи':'Briefings',
      '◆ WPA Централна матрица-водилка ◆':'◆ WPA Central Guiding Matrix ◆','⚜️ WPA Core Documents Hub · Клучни WPA документи':'⚜️ WPA Core Documents Hub · Key WPA Documents',
      'Главна WPA, Strategy, Master Strategy и WPA-BIB-001':'WPA Home, Strategy, Master Strategy and WPA-BIB-001','Главна WPA':'WPA Home','Почетна страница на World Protocol Academy.':'World Protocol Academy home page.','Отвори Главна WPA →':'Open WPA Home →',
      'Оперативна патека за институционален развој 2026–2030.':'Operational path for institutional development 2026–2030.','Отвори Roadmap →':'Open Roadmap →','Основачка стратегија: протоколот како социолошка дисциплина.':'Foundational strategy: protocol as a sociological discipline.','Отвори Master Strategy →':'Open Master Strategy →','Официјална библиографија и публикациска основа на WPA.':'Official bibliography and publication foundation of WPA.','Отвори Bibliography →':'Open Bibliography →','Services / Услуги':'Services','Briefings / Брифинзи':'Briefings','📚 Student Desk Beta · Студентско биро':'📚 Student Desk Beta','🎧 Аудио-медиумски мотор':'🎧 Audio Media Engine'
    };
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),nodes=[],n;while((n=walker.nextNode()))nodes.push(n);nodes.forEach(function(t){var p=t.parentElement;if(!p||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.tagName))return;var raw=t.nodeValue||'',x=raw.trim();if(exact[x])t.nodeValue=raw.replace(x,exact[x]);});
    all('a[href]').forEach(function(a){var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^(mailto:|tel:|javascript:|data:)/i.test(h))return;try{var u=new URL(h,location.origin);if(u.origin!==location.origin||u.pathname.indexOf('/languages/')===0||u.pathname==='/en/')return;if(u.pathname==='/'||u.pathname==='/index.html'){a.setAttribute('href','/en/'+u.hash);return;}u.searchParams.set('lang','en');a.setAttribute('href',u.pathname+u.search+u.hash);}catch(e){}});
    try{localStorage.setItem('wpa.language','en');}catch(e){}
    busy=false;
  }
  function load(){fetch('/locales/index/en.json?v=20260720-full',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('EN locale '+r.status);return r.json();}).then(function(d){DICT=d;apply();[80,400,1200,3000].forEach(function(ms){setTimeout(apply,ms);});new MutationObserver(function(){clearTimeout(window.__wpaEnApply);window.__wpaEnApply=setTimeout(apply,40);}).observe(document.documentElement,{subtree:true,childList:true});}).catch(function(e){console.error('[WPA EN legacy renderer]',e);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();

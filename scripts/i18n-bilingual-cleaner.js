/* WPA Bilingual I18N Cleaner v1.0
   Last-mile MK/EN cleanup for mixed static text.
   Safe: skips scripts, styles, code, pre, textarea, options and explicit opt-out blocks.
*/
(function(){
  'use strict';

  var PAIRS = [
    ['About','За нас'],['Manifest','Манифест'],['Programmes','Програми'],['Professional English','Професионален англиски'],['Formats','Формати'],['Certification','Сертификација'],['Passive Revenue','Пасивен приход'],['Certificate FAQ','Прашања за сертификати'],['Books','Книги'],['Bibliography','Библиографија'],['Papers','Трудови'],['Partnerships','Партнерства'],['Audio Media Engine','Аудио-медиумски мотор'],['Symbols','Симболи'],['Membership','Членство'],['Founder','Основач'],['Policy','Политика'],['Language','Јазик'],['Open Certification','Отвори Сертификација'],['Open WPA Card','Отвори WPA Card'],['Open WPAWS','Отвори WPAWS'],['Open Passive Revenue','Отвори Пасивен приход'],['Open Partnerships','Отвори Партнерства'],['Open Papers','Отвори Трудови'],['Open programmes.html','Отвори programmes.html'],['Open certification.html','Отвори certification.html'],['Open wpa-card.html','Отвори wpa-card.html'],['Open passive-revenue.html','Отвори passive-revenue.html'],['Open full Certification Page','Отвори целосна страница за сертификација'],['Open WPA Card Page','Отвори WPA Card страница'],['Open Meet →','Отвори Meet →'],['Open Zoom →','Отвори Zoom →'],['Open Webex →','Отвори Webex →'],['Open →','Отвори →'],['Explore the Academy','Истражете ја Академијата'],['Explore WPA Programmes','Истражи WPA програми'],['Meet Virtual Sande','Запознајте го Virtual Sande'],
    ['Publications','Публикации'],['Scientific papers','Научни трудови'],['Years of experience','Години искуство'],['Languages','Јазици'],['Academic Layer','Академски слој'],['AI Layer','AI слој'],['Institutional','Институционално'],['Institutional layer','Институционален слој'],['Trainer Layer','Тренерски слој'],['Revenue Layer','Приходен слој'],['Programme Architecture','Програмска архитектура'],['Programmes Page','Страница за програми'],['Certification Logic','Логика на сертификација'],['Certification Page','Страница за сертификација'],['Membership & Access','Членство и пристап'],['Partner & Growth Logic','Партнерска и развојна логика'],['Passive Revenue Page','Страница за пасивен приход'],['Main house','Главна куќа'],['Platform layer','Платформски слој'],['Specialized subsystem','Специјализиран потсистем'],['Institutional partnerships','Институционални партнерства'],['Publication layer','Публикациски слој'],['Books and papers','Книги и трудови'],['Verified database','Верифицирана база'],['Verified facts only','Само верифицирани факти'],['Flags','Знамиња'],['Flags and coats of arms','Знамиња и грбови'],['Anthems','Химни'],['Anthems and instrumentals','Химни и инструментални'],['Coats of arms','Грбови'],['Coats of arms and state seals','Грбови и државни печати'],['Geography','Географија'],['Capitals · Continents','Главни градови · Континенти'],['What World Protocol Academy is','Што е World Protocol Academy'],['WPA Manifest','WPA манифест'],['WPA Positioning','WPA позиционирање'],['Independent academy and professional platform','Независна академија и професионална платформа'],['Independent digital academy','Независна дигитална академија'],['Multi-layer educational system','Мултислоен образовен систем'],
    ['Programmes and levels','Програми и нивоа'],['Foundation','Основно'],['Professional','Професионално'],['Advanced','Напредно'],['Trainer','Обучувач'],['Foundation Certificate Programme','Основна сертификациска програма'],['Professional Certificate Programme','Професионална сертификациска програма'],['Advanced Certificate Programme','Напредна сертификациска програма'],['Train-the-Trainer / Consultant Track','Патека за обучувач / консултант'],['Four levels. One coherent WPA academy.','Четири нивоа. Една кохерентна WPA академија.'],['Programme Families','Програмски семејства'],['Foundations of protocol and state protocol','Основи на протокол и државен протокол'],['Diplomatic protocol and official visits','Дипломатски протокол и официјални посети'],['Order of precedence, seating, flags and symbols','Ред на предимство, седење, знамиња и симболи'],['Multilateral and military protocol','Мултилатерален и воен протокол'],['Official address and formal speech','Официјално обраќање и формален говор'],['Protocol and institutional communication','Протоколарна и институционална комуникација'],['Media conduct and public representation','Медиумско однесување и јавна репрезентација'],['Executive confidence and communication strategy','Извршна самодоверба и комуникациска стратегија'],['Personal conduct and first impression','Лично однесување и прв впечаток'],['Dining culture and social etiquette','Трпезариска култура и социјална етикеција'],['Business bon ton and workplace conduct','Деловен бон-тон и работно место'],['Protocol and security coordination','Протокол и безбедносна координација'],['Readiness for high-level visits','Подготвеност за посети на високо ниво'],['Protocol for conferences and summits','Протокол на конференции и самити'],['Train-the-Trainer methodology','Train-the-Trainer методологија'],['What the module contains','Што содржи модулот'],['Formulations for protocol situations','Формулации за протоколарни ситуации'],['Diplomatic language and formal communication','Дипломатски јазик и формална комуникација'],['Institutional email communication','Институционална email комуникација'],['Conference and moderation language','Конференциски и модераторски јазик'],['Language for public and media representation','Јазик за јавна и медиумска репрезентација'],['Responses and rescue phrases under pressure','Одговори и rescue phrases под притисок'],
    ['Online meetings','Онлајн средби'],['Online meetings and academic sessions','Онлајн средби и академски сесии'],['Academic sessions, short briefings and individual consultations','Академски сесии, кратки брифинзи, индивидуални консултации'],['Group masterclasses, webinars and certification classes','Групни masterclass, вебинари, сертификациски часови'],['Institutional and corporate environments, formal format','Институционални и корпоративни средини, формален формат'],['Certificates & Recognition','Сертификати и признавање'],['Certification, verification and institutional clarity','Сертификација, верификација и институционална јасност'],['Question 01','Прашање 01'],['Question 02','Прашање 02'],['Question 03','Прашање 03'],['Question 04','Прашање 04'],['Question 05','Прашање 05'],['Question 06','Прашање 06'],['Are WPA programmes undergraduate, postgraduate or doctoral studies?','Дали WPA програмите се додипломски, последипломски или докторски студии?'],['Then what are WPA programmes?','Тогаш што претставуваат WPA програмите?'],['How should the four WPA levels be understood?','Како да се разберат четирите WPA нивоа?'],['Are WPA certificates recognized worldwide?','Дали WPA сертификатите се признаени во светот?'],['What does a WPA certificate tell an employer or partner?','Што му кажува WPA сертификатот на работодавач или партнер?'],['Will WPA have a verification system?','Дали WPA ќе има систем за верификација?'],['Specialized AI module','Специјализиран AI модул'],['Short bot answers','Кратки bot одговори'],['Basic lessons and concepts','Основни лекции и поими'],['Longer and more precise answers','Подолги и попрецизни одговори'],['Certificate preparation','Подготовка за сертификати'],['Practice scenarios','Сценарија за вежбање'],['Annual partnerships','Годишни партнерства'],['By proposal','По договор'],['Payment methods','Начини на плаќање'],['Available payment options','Достапни платежни опции'],['Contact for subscription →','Контактирај за претплата →'],['Books and monographs','Книги и монографии'],['Monographs and handbooks','Монографии и прирачници'],['Doctoral dissertation','Докторска дисертација'],['View the bibliography →','Разгледајте ја библиографијата →'],['Open PDF access','Отворен PDF пристап'],['Open the papers →','Отворете ги трудовите →'],['State Protocol','Државен протокол'],['Conference Handbook','Конференциски прирачник'],['Diplomacy and Security','Дипломатија и безбедност'],['Diplomacy, Protocol and Security','Дипломатија, протокол и безбедност'],['Digital Era','Дигитална ера'],['Official bibliography','Официјална библиографија'],['Total publications','Вкупно публикации'],['Official WPA channels','Официјални WPA канали'],['Assoc. Prof. Dr. Sande Smiljanov','Доц. д-р Санде Смиљанов'],['Founder and Director of World Protocol Academy','Основач и директор на World Protocol Academy'],['Sources, Authorship and Educational Use','Извори, авторство и образовна употреба'],['Use of sources, authorship and educational processing in WPA','Употреба на извори, авторство и образовна обработка во WPA'],['Use of sources, citation and copyright','Употреба на извори, цитирање и авторски права'],['Labs, innovation and authorship protection','Лаборатории, иновација и заштита на авторството'],['Key Areas','Клучни области'],['Official Channels','Официјални канали'],['Academic Profiles','Академски профили'],['Contact','Контакт'],['Privacy Policy','Политика за приватност'],['Rights & Takedown','Права и отстранување'],['1000 Skopje, Republic of North Macedonia','1000 Скопје, Република Северна Македонија']
  ];

  var PHRASES_EN_TO_MK = [
    ['Scientific papers и прилози','Научни трудови и прилози'],['23 publications вкупно','23 публикации вкупно'],['Protocol · Diplomatic · Институционално · Conference','Протокол · Дипломатија · Институционално · Конференција'],['Програми, Сертификација, WPA Card and Пасивен приход','Програми, Сертификација, WPA Card и Пасивен приход'],['Програми, certification, AI, publications, institutional training','Програми, сертификација, AI, публикации, институционална обука'],['Access, status и future benefits layer','Пристап, статус и слој за идни придобивки'],['The Пасивен приход page','Страницата за пасивен приход'],['Институционално and growth logic','Институционална и развојна логика'],['Open Партнерства','Отвори Партнерства'],['Јазикs','Јазици'],['Revenue слој','Приходен слој'],['growth логика','развојна логика'],['future benefits layer','слој за идни придобивки'],['Premium lessons','Премиум лекции'],['Custom training packages','Прилагодени пакети за обука'],['Meet / Zoom / Webex','Meet / Zoom / Webex'],['Founder & Director','Основач и директор'],['Founder-led WPA','WPA водена од основач']
  ];

  var PHRASES_MK_TO_EN = [
    ['World Protocol Academy е независна дигитална академија','World Protocol Academy is an independent digital academy'],['Пасивен приход','Passive Revenue'],['Отвори Пасивен приход','Open Passive Revenue'],['Професионален англиски for protocol, diplomacy and institutional communication','Professional English for protocol, diplomacy and institutional communication'],['Институционално Email English','Institutional Email English'],['Јазик for public and media representation','Language for public and media representation'],['Институционално and corporate environments','Institutional and corporate environments'],['Сертификација, verification and institutional clarity','Certification, verification and institutional clarity']
  ];

  function currentLang(){
    var s=document.getElementById('pageLang')||document.querySelector('[data-language-switcher]');
    var v=s&&s.value?s.value:'';
    var stored='';try{stored=localStorage.getItem('wpa_language')||localStorage.getItem('wpa_lang')||localStorage.getItem('selectedLanguage')||'';}catch(e){}
    var html=document.documentElement.getAttribute('lang')||'';
    var body=document.body&&(document.body.getAttribute('data-current-language')||document.body.getAttribute('data-lang'))||'';
    var q='';try{q=new URLSearchParams(location.search).get('lang')||'';}catch(e){}
    var l=String(v||stored||body||q||html||'mk').toLowerCase();
    return l.indexOf('en')===0?'en':'mk';
  }

  function mapFor(lang){
    var out=[];
    if(lang==='mk'){
      PAIRS.forEach(function(p){out.push([p[0],p[1]]);});
      PHRASES_EN_TO_MK.forEach(function(p){out.push(p);});
    } else {
      PAIRS.forEach(function(p){out.push([p[1],p[0]]);});
      PHRASES_MK_TO_EN.forEach(function(p){out.push(p);});
    }
    return out.sort(function(a,b){return b[0].length-a[0].length;});
  }

  function skipNode(n){
    if(!n||n.nodeType!==3||!n.nodeValue||!n.nodeValue.trim()) return true;
    var p=n.parentElement; if(!p) return true;
    if(/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|OPTION)$/i.test(p.tagName)) return true;
    if(p.closest('[data-i18n-cleaner="off"],[data-no-i18n-cleaner]')) return true;
    return false;
  }

  function cleanValue(value, dict){
    var v=value;
    dict.forEach(function(pair){ if(v.indexOf(pair[0])!==-1) v=v.split(pair[0]).join(pair[1]); });
    return v;
  }

  function apply(){
    if(!document.body) return;
    var lang=currentLang();
    var dict=mapFor(lang);
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return skipNode(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    var node;
    while((node=walker.nextNode())){
      var cleaned=cleanValue(node.nodeValue,dict);
      if(cleaned!==node.nodeValue) node.nodeValue=cleaned;
    }
    ['placeholder','title','aria-label','alt'].forEach(function(attr){
      document.querySelectorAll('['+attr+']').forEach(function(el){
        var val=el.getAttribute(attr); if(!val) return;
        var cleaned=cleanValue(val,dict); if(cleaned!==val) el.setAttribute(attr,cleaned);
      });
    });
    document.documentElement.setAttribute('data-wpa-bilingual-cleaner',lang);
  }

  function audit(){
    var lang=currentLang(), issues=[], cyr=/[А-Яа-яЃѓЌќЉљЊњЏџЅѕ]/;
    var en=/\b(About|Programmes|Certification|Publications|Founder|Training|Professional|Institutional|Open|Explore|Contact|Privacy|Sources|Books|Papers|Scientific|Foundation|Advanced|Question|Official|Academic|Membership)\b/;
    var walker=document.createTreeWalker(document.body||document.documentElement,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return skipNode(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    var n; while((n=walker.nextNode())){var t=n.nodeValue.trim(); if(!t) continue; if(lang==='mk'&&en.test(t)) issues.push(t.slice(0,220)); if(lang==='en'&&cyr.test(t)) issues.push(t.slice(0,220));}
    if(console&&console.table) console.table(issues.slice(0,120));
    return issues;
  }

  function schedule(){[40,180,600,1400,3000,6500].forEach(function(ms){setTimeout(apply,ms);});}
  window.WPABilingualCleaner={apply:apply,audit:audit,schedule:schedule};
  window.WPABilingualAudit=audit;
  document.addEventListener('DOMContentLoaded',schedule);
  document.addEventListener('wpa:i18n:loaded',schedule);
  document.addEventListener('wpa:locales-core-ready',schedule);
  document.addEventListener('change',function(e){if(e.target&&e.target.matches('select,#pageLang,[data-language-switcher]'))schedule();});
  try{new MutationObserver(function(){clearTimeout(window.__wpaBilingualCleanerTimer);window.__wpaBilingualCleanerTimer=setTimeout(apply,120);}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});}catch(e){}
  schedule();
})();

/* WPA I18N V2 Clean Renderer
   One source of truth per page: /locales/{lang}/{page}-v2.json
   No auto machine translation. No mixed-language cleanup. Pure key rendering.
*/
(function(){
  'use strict';

  var SUPPORTED=['mk','en'];
  var DEFAULT='mk';
  var state={lang:DEFAULT,page:'index',dict:{}};

  function getPage(){
    return document.body.getAttribute('data-page') || document.documentElement.getAttribute('data-page') || 'index';
  }

  function normalize(lang){
    lang=String(lang||DEFAULT).trim().toLowerCase();
    if(lang.indexOf('en')===0) return 'en';
    if(lang.indexOf('mk')===0) return 'mk';
    return DEFAULT;
  }

  function getStoredLang(){
    try{return localStorage.getItem('wpa_i18n_v2_lang')||localStorage.getItem('wpa_language')||'';}catch(e){return '';}
  }

  function detectLang(){
    var selector=document.querySelector('[data-i18n-v2-switcher],#pageLang,[data-language-switcher]');
    var selected=selector&&selector.value?selector.value:'';
    var query='';try{query=new URLSearchParams(location.search).get('lang')||'';}catch(e){}
    var html=document.documentElement.getAttribute('lang')||'';
    return normalize(selected||query||getStoredLang()||html||DEFAULT);
  }

  function get(obj,path){
    return String(path).split('.').reduce(function(acc,key){return acc&&Object.prototype.hasOwnProperty.call(acc,key)?acc[key]:undefined;},obj);
  }

  function setText(el,value){
    if(value===undefined||value===null) return;
    if(el.hasAttribute('data-i18n-html')) el.innerHTML=String(value);
    else el.textContent=String(value);
  }

  function setAttr(el,attr,value){
    if(value===undefined||value===null) return;
    el.setAttribute(attr,String(value));
  }

  function applyMeta(dict){
    var title=get(dict,'meta.title');
    var desc=get(dict,'meta.description');
    if(title) document.title=title;
    if(desc){
      var meta=document.querySelector('meta[name="description"]');
      if(meta) meta.setAttribute('content',desc);
    }
  }

  function render(){
    var dict=state.dict||{};
    document.documentElement.lang=state.lang;
    applyMeta(dict);

    document.querySelectorAll('[data-i18n-v2]').forEach(function(el){setText(el,get(dict,el.getAttribute('data-i18n-v2')));});
    document.querySelectorAll('[data-i18n-v2-html]').forEach(function(el){el.setAttribute('data-i18n-html','');setText(el,get(dict,el.getAttribute('data-i18n-v2-html')));});
    document.querySelectorAll('[data-i18n-v2-placeholder]').forEach(function(el){setAttr(el,'placeholder',get(dict,el.getAttribute('data-i18n-v2-placeholder')));});
    document.querySelectorAll('[data-i18n-v2-title]').forEach(function(el){setAttr(el,'title',get(dict,el.getAttribute('data-i18n-v2-title')));});
    document.querySelectorAll('[data-i18n-v2-aria]').forEach(function(el){setAttr(el,'aria-label',get(dict,el.getAttribute('data-i18n-v2-aria')));});
    document.querySelectorAll('[data-i18n-v2-alt]').forEach(function(el){setAttr(el,'alt',get(dict,el.getAttribute('data-i18n-v2-alt')));});

    var selector=document.querySelector('[data-i18n-v2-switcher],#pageLang,[data-language-switcher]');
    if(selector) selector.value=state.lang;

    document.dispatchEvent(new CustomEvent('wpa:i18n-v2-rendered',{detail:{lang:state.lang,page:state.page}}));
  }

  async function load(lang){
    state.lang=normalize(lang||detectLang());
    state.page=getPage();
    var url='/locales/'+state.lang+'/'+state.page+'-v2.json?v=20260503';
    var res=await fetch(url,{cache:'no-store'});
    if(!res.ok) throw new Error('Missing locale '+url+' HTTP '+res.status);
    state.dict=await res.json();
    try{localStorage.setItem('wpa_i18n_v2_lang',state.lang);}catch(e){}
    render();
    return state.dict;
  }

  function audit(){
    var missing=[];
    document.querySelectorAll('[data-i18n-v2],[data-i18n-v2-html],[data-i18n-v2-placeholder],[data-i18n-v2-title],[data-i18n-v2-aria],[data-i18n-v2-alt]').forEach(function(el){
      ['data-i18n-v2','data-i18n-v2-html','data-i18n-v2-placeholder','data-i18n-v2-title','data-i18n-v2-aria','data-i18n-v2-alt'].forEach(function(attr){
        if(el.hasAttribute(attr)&&get(state.dict,el.getAttribute(attr))===undefined) missing.push(el.getAttribute(attr));
      });
    });
    missing=[].slice.call(new Set(missing));
    if(console&&console.table) console.table(missing.map(function(x){return {missing:x};}));
    return missing;
  }

  window.WPAI18nV2={load:load,render:render,audit:audit,state:state};

  document.addEventListener('DOMContentLoaded',function(){
    load().catch(function(err){console.error('WPA I18N V2 failed:',err);});
    document.addEventListener('change',function(e){
      if(e.target&&e.target.matches('[data-i18n-v2-switcher],#pageLang,[data-language-switcher]')) load(e.target.value).catch(function(err){console.error(err);});
    });
  });
})();

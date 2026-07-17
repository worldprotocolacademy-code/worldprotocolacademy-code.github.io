/* Virtual Sande Connected Vessels client v2.0 */
(function(){
  'use strict';
  if(window.WPA_CONNECTED_VESSELS_LOADED)return;
  window.WPA_CONNECTED_VESSELS_LOADED=true;

  var ENDPOINT=window.WPA_VIRTUAL_SANDE_ENDPOINT||'https://protocol-bot-workerjs.worldprotocolacademy.workers.dev/ask';
  var PAGE_MAP={
    '/protocolometry-center.html':'protocolometry',
    '/tools/wpa-five-engines.html':'five_engines',
    '/tools/wpa-watch/':'wpa_watch',
    '/journal/watch/':'journal_watch',
    '/student-desk/':'student_desk',
    '/student-desk/index.html':'student_desk',
    '/intelligence-center.html':'intelligence_center',
    '/wpa-services.html':'services',
    '/journal/live/':'journal_live',
    '/wpa-live-intelligence-feed.html':'live_feed',
    '/wpa-sublimate-engine.html':'sublimate',
    '/audio-media-engine.html':'audio_media',
    '/wpaws/':'wpaws',
    '/tools/academic-search-hub/':'academic_search',
    '/wpaws/protocol-symbols-verified/':'protocol_symbols',
    '/multi-ai-command-center.html':'multi_ai',
    '/journal/vol-1-issue-1-2026.html':'journal_issue_1',
    '/wpaws/diplomatic-analysis-lab/':'diplomatic_analysis'
  };
  function pageId(){var p=location.pathname.replace(/\/+$/,'/')||'/';return PAGE_MAP[p]||document.documentElement.getAttribute('data-wpa-page')||'wpa_public';}
  function collectContext(){
    var selected=window.getSelection?String(window.getSelection()).trim().slice(0,1200):'';
    var heading=document.querySelector('main h1,main h2,h1');
    return {page:pageId(),path:location.pathname,title:document.title,heading:heading?heading.textContent.trim():'',selection:selected,language:document.documentElement.lang||'mk',timestamp:new Date().toISOString()};
  }
  async function ask(message,extra){
    var context=Object.assign(collectContext(),extra||{});
    var response=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({message:message,lang:context.language,context:context})});
    if(!response.ok)throw new Error('Virtual Sande HTTP '+response.status);
    return response.json();
  }
  function openWithPrompt(message,extra){
    sessionStorage.setItem('wpaVirtualSandeHandoff',JSON.stringify({message:message,context:Object.assign(collectContext(),extra||{}),createdAt:Date.now()}));
    location.href='/virtual-sande-ai.html';
  }
  window.WPAVirtualSande={ask:ask,collectContext:collectContext,openWithPrompt:openWithPrompt,version:'connected-vessels-client-v2'};

  document.addEventListener('click',function(event){
    var el=event.target.closest('[data-virtual-sande-prompt]');
    if(!el)return;
    event.preventDefault();
    openWithPrompt(el.getAttribute('data-virtual-sande-prompt')||'Објасни ја оваа WPA функција.',{action:el.getAttribute('data-virtual-sande-action')||'explain'});
  });
})();

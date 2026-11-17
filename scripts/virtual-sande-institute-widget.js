/* Virtual Sande AI — Institute public widget */
(function () {
  'use strict';
  if (window.__WPA_INSTITUTE_VIRTUAL_SANDE__) return;
  window.__WPA_INSTITUTE_VIRTUAL_SANDE__ = true;

  var API = 'https://wpa-virtual-sande-v35-1-production.worldprotocolacademy.workers.dev/ask';
  var busy = false;
  var history = [];
  var monitor = {state:'unverified',health_reachable:false,last_checked_at:null,last_verified_at:null,last_http_status:null,retry_count:0,last_served_by:null};
  window.WPAInstituteVirtualSandeMonitor = monitor;

  function documentLanguage() {
    var value = String(document.documentElement.lang || 'mk').trim().toLowerCase();
    return value.split('-')[0] || 'mk';
  }

  function mkText() {
    return {
      title: 'Virtual Sande AI', subtitle: 'WPA Institute академски асистент',
      welcome: 'Добредојдовте. Јас сум Virtual Sande AI, академски асистент на Институтот при Светската академија за протокол.',
      placeholder: 'Поставете прашање за протокол, дипломатија, комуникација или безбедност...',
      send: 'Испрати', clear: 'Исчисти', error: 'Во моментот не можам да одговорам. Обидете се повторно.',
      label: 'Отвори Virtual Sande AI', close: 'Затвори',
      live:'Live AI',local:'Локален одговор',unverified:'Непотврдена врска',unavailable:'Live AI недостапен',lastVerified:'Последно потврдено:',connecting:'Се поврзувам...',
      instituteName: 'Институт за протокол, дипломатија, јавна комуникација и безбедносни студии',
      relatedTitle: 'Поврзани WPA модули',
      relatedIntro: 'Брзи врски кон клучни јавни ресурси што ја дополнуваат Институтската страница.',
      stress: 'Protocol Stress-Test', certification: 'Certification FAQ', english: 'Professional English', card: 'WPA Card'
    };
  }

  function enText() {
    return {
      title: 'Virtual Sande AI', subtitle: 'WPA Institute academic assistant',
      welcome: 'Welcome. I am Virtual Sande AI, the academic assistant of the World Protocol Academy Institute.',
      placeholder: 'Ask about protocol, diplomacy, communication or security...',
      send: 'Send', clear: 'Clear', error: 'I cannot respond at the moment. Please try again.',
      label: 'Open Virtual Sande AI', close: 'Close',
      live:'Live AI',local:'Local answer',unverified:'Connection unverified',unavailable:'Live AI unavailable',lastVerified:'Last verified:',connecting:'Connecting...',
      instituteName: 'Institute for Protocol, Diplomacy, Public Communication and Security Studies',
      relatedTitle: 'Related WPA Modules',
      relatedIntro: 'Quick links to key public resources that complement the Institute page.',
      stress: 'Protocol Stress-Test', certification: 'Certification FAQ', english: 'Professional English', card: 'WPA Card'
    };
  }

  function frText() {
    return {
      title: 'Virtual Sande AI', subtitle: 'Assistant académique du WPA Institute',
      welcome: 'Bienvenue. Je suis Virtual Sande AI, l’assistant académique de l’Institut de la World Protocol Academy.',
      placeholder: 'Posez une question sur le protocole, la diplomatie, la communication ou la sécurité...',
      send: 'Envoyer', clear: 'Effacer', error: 'Je ne peux pas répondre pour le moment. Veuillez réessayer.',
      label: 'Ouvrir Virtual Sande AI', close: 'Fermer',
      live:'Live AI',local:'Réponse locale',unverified:'Connexion non vérifiée',unavailable:'Live AI indisponible',lastVerified:'Dernière vérification :',connecting:'Connexion...',
      instituteName: 'Institut pour le protocole, la diplomatie, la communication publique et les études de sécurité',
      relatedTitle: 'Modules WPA associés',
      relatedIntro: 'Liens rapides vers les principales ressources publiques qui complètent la page de l’Institut.',
      stress: 'Protocol Stress-Test', certification: 'Certification FAQ', english: 'Professional English', card: 'WPA Card'
    };
  }

  function copy() {
    var lang = documentLanguage();
    if (lang === 'fr') return frText();
    if (lang === 'en') return enText();
    return mkText();
  }

  function style() {
    if (document.getElementById('wpa-institute-vs-style')) return;
    var s = document.createElement('style');
    s.id = 'wpa-institute-vs-style';
    s.textContent = [
      '.wpa-inst-vs-fab{position:fixed;right:22px;bottom:22px;z-index:2200;width:64px;height:64px;border-radius:50%;border:2px solid #c9a84c;background:#0d1f3c;padding:0;overflow:hidden;cursor:pointer;box-shadow:0 12px 34px rgba(8,19,40,.36);display:grid;place-items:center}',
      '.wpa-inst-vs-fab img{width:100%;height:100%;object-fit:cover;display:block}',
      '.wpa-inst-vs-panel{position:fixed;right:22px;bottom:98px;z-index:2199;width:min(390px,calc(100vw - 28px));height:min(570px,calc(100vh - 130px));background:#fbf8ee;border:1px solid rgba(201,168,76,.7);border-radius:14px;box-shadow:0 22px 60px rgba(8,19,40,.32);display:none;overflow:hidden;font-family:Inter,system-ui,sans-serif}',
      '.wpa-inst-vs-panel.open{display:flex;flex-direction:column}',
      '.wpa-inst-vs-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#0d1f3c;color:#fff;border-bottom:1px solid #c9a84c}',
      '.wpa-inst-vs-mark{width:38px;height:38px;border-radius:50%;overflow:hidden;border:1px solid #c9a84c;flex:0 0 38px}',
      '.wpa-inst-vs-mark img{width:100%;height:100%;object-fit:cover}',
      '.wpa-inst-vs-copy{min-width:0;flex:1}.wpa-inst-vs-title{font:700 16px/1.1 Georgia,serif;color:#e8d49a}.wpa-inst-vs-sub{font-size:10.5px;color:rgba(255,255,255,.75);margin-top:3px}',
      '.wpa-inst-vs-close{border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:2px 5px}',
      '.wpa-inst-vs-status{min-height:24px;background:#fbf8ee;color:#51401c;padding:4px 12px;font-size:11px}',
      '.wpa-inst-vs-msgs{flex:1;overflow:auto;padding:14px;background:#fbf8ee}',
      '.wpa-inst-vs-msgs:focus-visible{outline:3px solid #ad8029;outline-offset:-3px}',
      '.wpa-inst-vs-row.assistant{flex-direction:column;align-items:flex-start;gap:3px}',
      '.wpa-inst-vs-source{font:700 11px/1.4 Inter,system-ui,sans-serif;color:#51401c;background:#f0e4c4;padding:3px 7px;border-radius:6px}',
      '.wpa-inst-vs-close,.wpa-inst-vs-clear{min-width:44px;min-height:44px}',
      '.wpa-inst-vs-row{display:flex;margin:0 0 10px}.wpa-inst-vs-row.user{justify-content:flex-end}',
      '.wpa-inst-vs-bubble{max-width:88%;padding:10px 12px;border-radius:12px;background:#fff;border:1px solid #d8d2bc;color:#1a1a1a;font-size:13.5px;line-height:1.55;white-space:pre-wrap}',
      '.wpa-inst-vs-row.user .wpa-inst-vs-bubble{background:#0d1f3c;color:#fff;border-color:#0d1f3c}',
      '.wpa-inst-vs-form{display:flex;gap:8px;padding:10px;border-top:1px solid #d8d2bc;background:#f5f0e0}',
      '.wpa-inst-vs-input{flex:1;min-height:46px;max-height:110px;resize:vertical;border:1px solid #d8d2bc;border-radius:9px;padding:10px;font:13px/1.4 Inter,system-ui,sans-serif;outline:none;background:#fff}',
      '.wpa-inst-vs-send{border:0;border-radius:9px;background:#c9a84c;color:#081328;font-weight:800;padding:0 14px;cursor:pointer}',
      '.wpa-inst-vs-tools{display:flex;justify-content:flex-end;padding:0 10px 9px;background:#f5f0e0}',
      '.wpa-inst-vs-clear{border:0;background:transparent;color:#5a4220;font-size:11px;cursor:pointer}',
      '.wpa-institute-brand .brand-mark{font-size:0!important;line-height:0!important}',
      '.wpa-institute-brand .brand-text{writing-mode:horizontal-tb!important;text-orientation:mixed!important}',
      '.wpa-institute-brand .wpa-institute-name-current{display:block!important;writing-mode:horizontal-tb!important;text-orientation:mixed!important}',
      '.wpa-related-modules-runtime{padding:48px 32px;background:#f5f0e0;border-top:1px solid #d8d2bc;border-bottom:1px solid #d8d2bc}',
      '.wpa-related-modules-inner{max-width:1180px;margin:0 auto}',
      '.wpa-related-modules-runtime h2{font-family:Georgia,serif;color:#0d1f3c;font-size:30px;margin:0 0 8px}',
      '.wpa-related-modules-runtime p{color:#334b5e;margin:0 0 18px;line-height:1.65}',
      '.wpa-related-modules-links{display:flex;flex-wrap:wrap;gap:10px}',
      '.wpa-related-modules-links a{display:inline-flex;align-items:center;justify-content:center;padding:10px 15px;border:1px solid #c9a84c;background:#fff;color:#0d1f3c;text-decoration:none;font:700 12px/1.2 Inter,system-ui,sans-serif;border-radius:4px}',
      '.wpa-related-modules-links a:hover{background:#0d1f3c;color:#f5e6b8}',
      '@media(max-width:520px){.wpa-inst-vs-fab{right:14px;bottom:14px;width:58px;height:58px}.wpa-inst-vs-panel{right:14px;bottom:82px;height:calc(100vh - 104px)}.wpa-related-modules-runtime{padding:34px 20px}.wpa-related-modules-links a{width:100%}}'
    ].join('');
    document.head.appendChild(s);
  }

  function removePn003TopbarPromo() {
    var links = document.querySelectorAll('.topbar-quicklinks a[href="https://doi.org/10.5281/zenodo.21390763"]');
    Array.prototype.forEach.call(links, function (link) { link.remove(); });
  }

  function normalizeInstituteHeader() {
    var brand = document.querySelector('.nav-wrap nav .brand');
    if (!brand) return;
    var lang = documentLanguage();
    var t = copy();
    brand.classList.add('wpa-institute-brand');
    brand.setAttribute('aria-label', t.instituteName);
    var mark = brand.querySelector('.brand-mark');
    if (mark) {
      mark.textContent = '';
      var logo = document.createElement('img');
      logo.src = '/assets/img/logo.svg';
      logo.alt = 'World Protocol Academy logo';
      logo.width = 72;
      logo.height = 72;
      logo.loading = 'eager';
      logo.decoding = 'async';
      mark.appendChild(logo);
    }
    var text = brand.querySelector('.brand-text');
    if (text) text.innerHTML = '<span class="wpa-institute-label">WPA Institute</span><span class="wpa-institute-name-current" lang="' + lang + '">' + t.instituteName + '</span>';
  }

  function normalizePublicCouncilTerminology() {
    if (!document.body || !document.createTreeWalker) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent || /^(SCRIPT|STYLE|CODE|PRE)$/i.test(parent.tagName)) continue;
      var value = node.nodeValue || '';
      var next = value
        .replace(/up to 80 bounded Tactical-Operational Seats/g, 'up to 80 bounded workflow seats')
        .replace(/up to 80 bounded tactical-operational seats/g, 'up to 80 bounded workflow seats')
        .replace(/Up to 80 tactical-operational seats\./g, 'Up to 80 bounded workflow seats.');
      if (next !== value) node.nodeValue = next;
    }
  }

  function placeRelatedModules() {
    if (document.getElementById('wpa-related-modules-runtime')) return;
    var t = copy();
    var section = document.createElement('section');
    section.id = 'wpa-related-modules-runtime';
    section.className = 'wpa-related-modules-runtime';
    section.setAttribute('aria-labelledby', 'wpa-related-modules-title');
    var inner = document.createElement('div');
    inner.className = 'wpa-related-modules-inner';
    var title = document.createElement('h2');
    title.id = 'wpa-related-modules-title';
    title.textContent = t.relatedTitle;
    var intro = document.createElement('p');
    intro.textContent = t.relatedIntro;
    var links = document.createElement('div');
    links.className = 'wpa-related-modules-links';
    [
      ['/wpa-protocol-stress-test.html', t.stress],
      ['/certification.html#faq', t.certification],
      ['/professional-english.html', t.english],
      ['/wpa-card.html', t.card]
    ].forEach(function (item) {
      var a = document.createElement('a');
      a.href = item[0];
      a.textContent = item[1];
      links.appendChild(a);
    });
    inner.appendChild(title); inner.appendChild(intro); inner.appendChild(links); section.appendChild(inner);
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else document.body.appendChild(section);
  }

  function setStatus(kind) {
    monitor.state=kind;
    var target=document.getElementById('wpaInstVsStatus');
    if(!target)return;
    target.dataset.answerSource=kind;
    target.dataset.lastVerifiedAt=monitor.last_verified_at||'';
    target.dataset.lastCheckedAt=monitor.last_checked_at||'';
    target.textContent=copy()[kind]||copy().unverified;
    if(monitor.last_verified_at)target.textContent+=' · '+copy().lastVerified+' '+monitor.last_verified_at.slice(0,19).replace('T',' ')+' UTC';
  }

  function addMessage(text,who,source) {
    var msgs=document.getElementById('wpaInstVsMsgs');if(!msgs)return;
    var row=document.createElement('div');
    row.className='wpa-inst-vs-row'+(who==='user'?' user':' assistant');
    if(who!=='user'){
      var kind=source||'unverified';row.dataset.answerSource=kind;
      var badge=document.createElement('span');badge.className='wpa-inst-vs-source';
      badge.textContent=copy()[kind]||copy().unverified;row.appendChild(badge);
    }
    var bubble=document.createElement('div');bubble.className='wpa-inst-vs-bubble';
    bubble.textContent=String(text||'');row.appendChild(bubble);
    msgs.appendChild(row);msgs.scrollTop=msgs.scrollHeight;
  }

  function answerFrom(data) {
    if(!data)return '';
    return data.answer||data.response||data.message||data.text||(data.result&&(data.result.answer||data.result.text))||'';
  }

  function hasVerifiedLiveModel(data){
    if(!data||data.ok!==true||data.contract!=='wpa-virtual-sande-response-v1.1')return false;
    return /^(llm|procedural-anthropic-direct|anthropic-llm-rescue|anthropic-contamination-rescue|anthropic-no-context-fill)$/.test(String(data.servedBy||'').toLowerCase());
  }

  async function fetchBounded(url,opts,ms){
    var controller=typeof AbortController!=='undefined'?new AbortController():null;
    var timer=window.setTimeout(function(){if(controller)controller.abort();},ms);
    try{return await fetch(url,Object.assign({},opts,controller?{signal:controller.signal}:{}));}
    finally{window.clearTimeout(timer);}
  }

  async function healthCheck(){
    try{
      var url=API.replace('/ask','/safe-entrypoint/health');
      var response=await fetchBounded(url,{method:'GET',mode:'cors',cache:'no-store',credentials:'omit',headers:{Accept:'application/json'}},6000);
      var data=response.ok?await response.json():null;
      monitor.health_reachable=Boolean(response.ok&&data&&data.ok===true&&data.mode==='health'&&data.contract==='wpa-virtual-sande-response-v1.1');
      monitor.last_http_status=response.status;
    }catch(e){monitor.health_reachable=false;} // Client failure, not global outage.
    finally{monitor.last_checked_at=new Date().toISOString();if(monitor.state==='unverified')setStatus('unverified');}
  }

  async function send() {
    if(busy)return;
    var input=document.getElementById('wpaInstVsInput'),q=input?input.value.trim():'';
    if(!q)return;
    busy=true;input.value='';addMessage(q,'user');history.push({role:'user',content:q});
    var btn=document.getElementById('wpaInstVsSend');if(btn)btn.disabled=true;
    var status=document.getElementById('wpaInstVsStatus');if(status)status.textContent=copy().connecting;
    var payload={message:q,question:q,query:q,history:history.slice(-6),language:String(document.documentElement.lang||'mk')};
    try {
      var answer='',data=null,lastError=null;
      for(var attempt=0;attempt<2;attempt+=1){
        try{
          var response=await fetchBounded(API,{method:'POST',mode:'cors',cache:'no-store',credentials:'omit',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)},12000);
          monitor.last_http_status=response.status;monitor.last_checked_at=new Date().toISOString();
          if(!response.ok)throw new Error('HTTP '+response.status);
          data=await response.json();answer=answerFrom(data);
          if(!data||data.ok===false||typeof answer!=='string'||!answer.trim())throw new Error('Invalid response');
          monitor.last_served_by=String(data.servedBy||'').slice(0,64);
          break;
        }catch(error){
          lastError=error;
          if(/^HTTP 4[0-9]{2}/.test(String(error.message||'')))break;
          if(attempt===0){monitor.retry_count+=1;await new Promise(function(resolve){window.setTimeout(resolve,250);});}
        }
      }
      if(!answer)throw lastError||new Error('No response');
      var kind=hasVerifiedLiveModel(data)?'live':/(unavailable|request_error|none)/i.test(String(data.mode||''))?'unavailable':'unverified';
      addMessage(answer,'bot',kind);history.push({role:'assistant',content:answer});
      if(kind==='live')monitor.last_verified_at=new Date().toISOString();
      setStatus(kind);
    }catch(error){
      monitor.last_checked_at=new Date().toISOString();
      addMessage(copy().error,'bot','unavailable');setStatus('unavailable');
    }finally{
      busy=false;if(btn)btn.disabled=false;if(input)input.focus();
    }
  }

  function loadCampaignRuntime() {
    if (document.getElementById('wpa-institute-campaign-runtime')) return;
    var script = document.createElement('script'); script.id = 'wpa-institute-campaign-runtime'; script.src = '/scripts/wpa-institute-campaign.js?v=20260905-1'; script.defer = true; document.head.appendChild(script);
  }

  function mount() {
    style(); removePn003TopbarPromo(); normalizeInstituteHeader(); normalizePublicCouncilTerminology(); placeRelatedModules(); loadCampaignRuntime();
    window.setTimeout(function(){ normalizeInstituteHeader(); normalizePublicCouncilTerminology(); placeRelatedModules(); }, 250);
    if (document.getElementById('wpaInstVsFab')) return;
    var t = copy();
    var panel = document.createElement('section'); panel.id = 'wpaInstVsPanel'; panel.className = 'wpa-inst-vs-panel'; panel.setAttribute('aria-label', t.title);
    panel.innerHTML = '<div class="wpa-inst-vs-head"><span class="wpa-inst-vs-mark"><img src="/assets/img/logo.svg" alt="World Protocol Academy logo" width="38" height="38"></span><div class="wpa-inst-vs-copy"><div class="wpa-inst-vs-title">' + t.title + '</div><div class="wpa-inst-vs-sub">' + t.subtitle + '</div></div><button class="wpa-inst-vs-close" type="button" aria-label="' + t.close + '">×</button></div><div class="wpa-inst-vs-msgs" id="wpaInstVsMsgs"></div><form class="wpa-inst-vs-form" id="wpaInstVsForm"><textarea class="wpa-inst-vs-input" id="wpaInstVsInput" placeholder="' + t.placeholder + '"></textarea><button class="wpa-inst-vs-send" id="wpaInstVsSend" type="submit">' + t.send + '</button></form><div class="wpa-inst-vs-tools"><button class="wpa-inst-vs-clear" id="wpaInstVsClear" type="button">' + t.clear + '</button></div>';
    var fab = document.createElement('button'); fab.id = 'wpaInstVsFab'; fab.className = 'wpa-inst-vs-fab'; fab.type = 'button'; fab.setAttribute('aria-label', t.label); fab.setAttribute('aria-expanded', 'false'); fab.innerHTML = '<img src="/assets/img/logo.svg" alt="" width="64" height="64">';
    document.body.appendChild(panel); document.body.appendChild(fab); addMessage(t.welcome, 'bot');
    fab.addEventListener('click', function () { var open = panel.classList.toggle('open'); fab.setAttribute('aria-expanded', open ? 'true' : 'false'); if (open) document.getElementById('wpaInstVsInput').focus(); });
    panel.querySelector('.wpa-inst-vs-close').addEventListener('click', function () { panel.classList.remove('open'); fab.setAttribute('aria-expanded', 'false'); });
    document.getElementById('wpaInstVsForm').addEventListener('submit', function (event) { event.preventDefault(); send(); });
    document.getElementById('wpaInstVsInput').addEventListener('keydown', function (event) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } });
    document.getElementById('wpaInstVsClear').addEventListener('click', function () { history = []; document.getElementById('wpaInstVsMsgs').innerHTML = ''; addMessage(copy().welcome, 'bot'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
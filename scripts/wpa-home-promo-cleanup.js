/* WPA homepage promotional cleanup v1.6 */
(function(){'use strict';
var navObserver=null;
var navRepairTimer=null;

function removeHomePn003(){
  var announce=document.querySelector('.announce .announce-inner');
  if(!announce)return;
  Array.from(announce.children).forEach(function(node){
    var text=String(node.textContent||'');
    if(text.indexOf('New publication')!==-1&&text.indexOf('WPA-PN-003')!==-1){node.remove();}
  });
}

function navList(){
  return document.querySelector('header .site-nav ul');
}

function hrefText(a){
  return String((a&&a.getAttribute('href'))||'').toLowerCase();
}

function findNavLink(list,fragments){
  if(!list)return null;
  var links=Array.from(list.querySelectorAll('a'));
  return links.find(function(a){
    var href=hrefText(a);
    return fragments.some(function(fragment){return href.indexOf(String(fragment).toLowerCase())!==-1;});
  })||null;
}

function insertAfter(reference,node){
  if(!reference||!reference.parentNode||!node)return false;
  if(reference.nextSibling)reference.parentNode.insertBefore(node,reference.nextSibling);
  else reference.parentNode.appendChild(node);
  return true;
}

function setCoreLinkIdentity(link,label,title){
  if(!link)return;
  if(String(link.textContent||'').trim()!==label)link.textContent=label;
  link.setAttribute('translate','no');
  link.setAttribute('data-no-i18n','true');
  link.setAttribute('title',title||label);
  link.setAttribute('aria-label',title||label);
}

function placeInstituteSecond(list,item){
  if(!list||!item)return;
  var first=list.firstElementChild;
  if(!first){list.appendChild(item);return;}
  var desired=first.nextElementSibling;
  if(desired===item)return;
  if(desired)list.insertBefore(item,desired);
  else list.appendChild(item);
}

function addInstituteNavLink(){
  var list=navList();
  if(!list)return false;

  var existing=findNavLink(list,['institute.html']);
  if(existing){
    setCoreLinkIdentity(existing,'🏛️ Institute','WPA Institute');
    var existingItem=existing.closest('li');
    if(existingItem){
      existingItem.id=existingItem.id||'wpaInstituteHomeNav';
      existingItem.setAttribute('data-wpa-persistent-nav','institute');
      placeInstituteSecond(list,existingItem);
    }
    return true;
  }

  var item=document.createElement('li');
  item.id='wpaInstituteHomeNav';
  item.setAttribute('data-wpa-persistent-nav','institute');
  var link=document.createElement('a');
  link.href='/institute.html';
  setCoreLinkIdentity(link,'🏛️ Institute','WPA Institute');
  item.appendChild(link);
  placeInstituteSecond(list,item);
  return true;
}

function ensureNavEntry(config){
  var list=navList();
  if(!list)return null;

  var existing=findNavLink(list,config.fragments);
  if(existing){
    setCoreLinkIdentity(existing,config.label,config.title);
    var existingItem=existing.closest('li');
    if(existingItem)existingItem.setAttribute('data-wpa-core-nav',config.key);
    return existing;
  }

  var item=document.createElement('li');
  item.id='wpaCoreNav_'+config.key;
  item.setAttribute('data-wpa-core-nav',config.key);
  var link=document.createElement('a');
  link.href=config.href;
  setCoreLinkIdentity(link,config.label,config.title);
  item.appendChild(link);

  var anchor=config.after&&findNavLink(list,config.after);
  var anchorItem=anchor&&anchor.closest('li');
  if(anchorItem)insertAfter(anchorItem,item);
  else list.appendChild(item);
  return link;
}

function ensureCoreNavigation(){
  var list=navList();
  if(!list)return;

  addInstituteNavLink();

  /* Core methodology: immediately after Institute. */
  ensureNavEntry({
    key:'protocolometry',
    fragments:['protocolometry-center.html'],
    href:'/protocolometry-center.html',
    label:'📐 Protocolometry',
    title:'WPA Protocolometry Center',
    after:['institute.html']
  });

  /* Symbols is already an important WPA system; ensure it is visible and unmistakable. */
  ensureNavEntry({
    key:'symbols',
    fragments:['wpaws/protocol-symbols/','protocol-symbols/index.html','protocol-symbols.html'],
    href:'/wpaws/protocol-symbols/',
    label:'🌍 Симболи',
    title:'WPA Protocol Symbols',
    after:['tools/wpa-digital-pavilion/']
  });

  /* Diplomatic Analysis Lab belongs beside Symbols as a second specialist lab. */
  ensureNavEntry({
    key:'analysis-lab',
    fragments:['diplomatic-analysis-lab/'],
    href:'/diplomatic-analysis-lab/',
    label:'🔬 Analysis Lab',
    title:'WPA Diplomatic Analysis Lab',
    after:['wpaws/protocol-symbols/','protocol-symbols/index.html','protocol-symbols.html']
  });

  /* Academic search and public-source watch tools belong beside WPAWS. */
  ensureNavEntry({
    key:'academic-search',
    fragments:['tools/academic-search-hub/'],
    href:'/tools/academic-search-hub/',
    label:'🔎 Academic Search',
    title:'WPA Academic Search Hub',
    after:['wpaws/index.html','/wpaws/']
  });
  ensureNavEntry({
    key:'wpa-watch',
    fragments:['tools/wpa-watch/'],
    href:'/tools/wpa-watch/',
    label:'📡 WPA Watch',
    title:'WPA Watch',
    after:['tools/academic-search-hub/']
  });

  /* Publication system: Journal Live, Journal, Journal Watch and Working Papers are distinct destinations. */
  ensureNavEntry({
    key:'journal',
    fragments:['journal/index.html'],
    href:'/journal/index.html',
    label:'📘 WPA Journal',
    title:'WPA Journal',
    after:['journal/live/']
  });
  ensureNavEntry({
    key:'journal-watch',
    fragments:['journal/watch/'],
    href:'/journal/watch/',
    label:'🧭 Journal Watch',
    title:'WPA Journal Watch',
    after:['journal/index.html']
  });
  ensureNavEntry({
    key:'working-papers',
    fragments:['working-papers/'],
    href:'/working-papers/',
    label:'📚 Working Papers',
    title:'WPA Working Papers',
    after:['papers.html']
  });

  /* Recalculate the desktop grid after any repaired/added entry. */
  document.documentElement.classList.add('wpa-home-five-row-nav');
  list.classList.add('wpa-five-row-nav-grid');
  var count=list.querySelectorAll(':scope > li').length;
  list.style.setProperty('--wpa-nav-columns',String(Math.max(6,Math.ceil(count/5))));
}

function protectHomeNavigation(){
  ensureCoreNavigation();
  var header=document.querySelector('header');
  if(!header||navObserver)return;

  navObserver=new MutationObserver(function(){
    if(navRepairTimer)window.clearTimeout(navRepairTimer);
    navRepairTimer=window.setTimeout(ensureCoreNavigation,40);
  });
  navObserver.observe(header,{childList:true,subtree:true});

  [100,300,750,1500,3000,6000].forEach(function(delay){
    window.setTimeout(ensureCoreNavigation,delay);
  });
}

function addAcademicLinkedIn(){
  var academicHeading=document.querySelector('.footer-col h5[data-i18n="ftAcad"]');
  if(!academicHeading)return;
  var list=academicHeading.parentElement&&academicHeading.parentElement.querySelector('ul');
  if(!list)return;

  var linkedinUrl='https://www.linkedin.com/in/asst-prof-sande-smiljanov-ph-d-a6706323b/';
  if(list.querySelector('a[href="'+linkedinUrl+'"]'))return;

  var item=document.createElement('li');
  var link=document.createElement('a');
  link.href=linkedinUrl;
  link.target='_blank';
  link.rel='noopener noreferrer';
  link.textContent='LinkedIn';
  item.appendChild(link);

  var orcid=Array.from(list.querySelectorAll('a')).find(function(a){
    return String(a.href||'').indexOf('orcid.org/0009-0008-3219-394X')!==-1;
  });
  var orcidItem=orcid&&orcid.closest('li');
  if(orcidItem&&orcidItem.nextSibling){
    list.insertBefore(item,orcidItem.nextSibling);
  }else if(orcidItem){
    list.appendChild(item);
  }else{
    list.appendChild(item);
  }
}

function ensureGlobalChannelsStyle(){
  if(document.getElementById('wpa-global-channels-style'))return;
  var style=document.createElement('style');
  style.id='wpa-global-channels-style';
  style.textContent='\
#wpaGlobalChannels{background:#071326;color:#f8f4ee;border-top:1px solid rgba(201,168,76,.34);border-bottom:1px solid rgba(201,168,76,.22);padding:26px 20px 24px;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif}\
#wpaGlobalChannels .wgc-wrap{max-width:1180px;margin:0 auto;text-align:center}\
#wpaGlobalChannels .wgc-kicker{color:#e8d49a;font-size:11px;font-weight:850;letter-spacing:.16em;text-transform:uppercase;margin-bottom:6px}\
#wpaGlobalChannels h2{margin:0;color:#f8f4ee;font:600 clamp(22px,3vw,31px)/1.15 Georgia,serif}\
#wpaGlobalChannels .wgc-sub{margin:7px auto 0;max-width:760px;color:rgba(248,244,238,.72);font-size:12.5px;line-height:1.55}\
#wpaGlobalChannels .wgc-links,#wpaGlobalChannels .wgc-planned{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:16px}\
#wpaGlobalChannels .wgc-link,#wpaGlobalChannels .wgc-plan{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(232,212,154,.42);border-radius:999px;padding:8px 12px;font-size:11.5px;font-weight:750;line-height:1;text-decoration:none}\
#wpaGlobalChannels .wgc-link{color:#f4e8c1;background:rgba(255,255,255,.035)}\
#wpaGlobalChannels .wgc-link:hover{background:#e8d49a;color:#071326;border-color:#e8d49a}\
#wpaGlobalChannels .wgc-plan{color:rgba(248,244,238,.72);background:rgba(255,255,255,.025);cursor:default}\
#wpaGlobalChannels .wgc-plan small{color:#e8d49a;font-size:8px;letter-spacing:.08em;text-transform:uppercase}\
#wpaGlobalChannels .wgc-label{margin-top:18px;color:#e8d49a;font-size:10px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}\
#wpaGlobalChannels .wgc-regions,#wpaGlobalChannels .wgc-oceans{margin:7px auto 0;color:rgba(248,244,238,.68);font-size:11.5px;line-height:1.7}\
#wpaGlobalChannels .wgc-note{margin-top:12px;color:rgba(248,244,238,.48);font-size:9.8px;line-height:1.45}\
@media(max-width:640px){#wpaGlobalChannels{padding:22px 14px}#wpaGlobalChannels .wgc-link,#wpaGlobalChannels .wgc-plan{padding:8px 10px;font-size:10.8px}#wpaGlobalChannels .wgc-regions,#wpaGlobalChannels .wgc-oceans{font-size:10.8px}}';
  document.head.appendChild(style);
}

function addGlobalChannels(){
  if(document.getElementById('wpaGlobalChannels'))return;
  var footer=document.querySelector('footer');
  if(!footer||!footer.parentNode)return;
  ensureGlobalChannelsStyle();

  var section=document.createElement('section');
  section.id='wpaGlobalChannels';
  section.setAttribute('aria-label','WPA Global Channels and international reach');
  section.setAttribute('translate','no');
  section.setAttribute('data-no-i18n','true');
  section.innerHTML='\
    <div class="wgc-wrap">\
      <div class="wgc-kicker">WPA GLOBAL CHANNELS</div>\
      <h2>Global academic &amp; public communication network</h2>\
      <p class="wgc-sub">Official public channels today, with a phased regional expansion for Europe, Asia, Africa, the Americas and Oceania.</p>\
      <div class="wgc-links" aria-label="Official WPA public channels">\
        <a class="wgc-link" href="https://www.facebook.com/share/1G3Z8WabBx/" target="_blank" rel="noopener noreferrer">Facebook</a>\
        <a class="wgc-link" href="https://www.instagram.com/worldprotocolacademy?igsh=MXJsMW9oNHczZmlyag%3D%3D" target="_blank" rel="noopener noreferrer">Instagram</a>\
        <a class="wgc-link" href="https://x.com/world_acad66822" target="_blank" rel="noopener noreferrer">X</a>\
        <a class="wgc-link" href="https://www.tiktok.com/@world.protocol.academy?_r=1&amp;_t=ZS-93zc3YLmvG1" target="_blank" rel="noopener noreferrer">TikTok</a>\
        <a class="wgc-link" href="https://www.youtube.com/@worldprotocolacademy" target="_blank" rel="noopener noreferrer">YouTube</a>\
      </div>\
      <div class="wgc-label">Regional expansion</div>\
      <div class="wgc-planned" aria-label="Planned regional channels">\
        <span class="wgc-plan" title="Planned regional channel — not yet activated">WeChat <small>planned</small></span>\
        <span class="wgc-plan" title="Planned regional channel — not yet activated">Telegram <small>planned</small></span>\
        <span class="wgc-plan" title="Planned regional channel — not yet activated">WhatsApp <small>planned</small></span>\
        <span class="wgc-plan" title="Planned regional channel — not yet activated">VK <small>planned</small></span>\
      </div>\
      <div class="wgc-label">Global reach</div>\
      <div class="wgc-regions">Europe · Asia · Africa · North America · South America · Australia &amp; New Zealand · Oceania</div>\
      <div class="wgc-oceans">Atlantic · Pacific · Indian · Arctic · Southern Ocean</div>\
      <div class="wgc-note">Planned channels are shown as roadmap items and are not presented as active official WPA accounts until activated.</div>\
    </div>';
  footer.parentNode.insertBefore(section,footer);
}

function run(){
  removeHomePn003();
  protectHomeNavigation();
  addAcademicLinkedIn();
  addGlobalChannels();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

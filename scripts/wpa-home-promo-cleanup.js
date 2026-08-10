/* WPA homepage promotional cleanup v1.2 */
(function(){'use strict';
function removeHomePn003(){
  var announce=document.querySelector('.announce .announce-inner');
  if(!announce)return;
  Array.from(announce.children).forEach(function(node){
    var text=String(node.textContent||'');
    if(text.indexOf('New publication')!==-1&&text.indexOf('WPA-PN-003')!==-1){node.remove();}
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
#wpaGlobalChannels .wgc-note{margin-top:12px;color:rgba(248,244,238,.46);font-size:9.8px;line-height:1.45}\
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
  addAcademicLinkedIn();
  addGlobalChannels();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

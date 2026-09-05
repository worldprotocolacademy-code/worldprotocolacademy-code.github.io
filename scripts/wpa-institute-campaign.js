/* WPA Institute campaign + official domains runtime · 2026-09-05 */
(function(){
  'use strict';
  if(window.__WPA_INSTITUTE_CAMPAIGN__) return;
  window.__WPA_INSTITUTE_CAMPAIGN__=true;
  function isInstitute(){
    var p=String(window.location.pathname||'').replace(/\/+$/,'').toLowerCase();
    var page=String(document.documentElement.getAttribute('data-wpa-page')||'').toLowerCase();
    return page==='institute'||p==='/institute.html'||/\/institute(?:\.html)?$/.test(p);
  }
  if(!isInstitute()) return;
  function mount(){
    if(document.getElementById('wpaCampaignInstituteBlock')) return;
    var style=document.createElement('style');
    style.id='wpaCampaignInstituteStyle';
    style.textContent='\
#wpaCampaignInstituteBlock{background:#081328;color:#fbf8ee;padding:64px 32px;border-top:2px solid #c9a84c;border-bottom:2px solid #c9a84c}\
#wpaCampaignInstituteBlock .wpa-campaign-wrap{max-width:1180px;margin:0 auto}\
#wpaCampaignInstituteBlock .wpa-campaign-kicker{color:#e3c878;font:800 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;margin-bottom:14px}\
#wpaCampaignInstituteBlock h2{color:#fbf8ee;font:500 clamp(32px,4vw,48px)/1.15 Georgia,serif;margin:0 0 16px}\
#wpaCampaignInstituteBlock .wpa-campaign-lead{max-width:820px;font-size:17px;line-height:1.7;color:rgba(251,248,238,.86)}\
#wpaCampaignInstituteBlock .wpa-campaign-motto{margin:28px 0;border-left:3px solid #c9a84c;padding:16px 20px;background:rgba(201,168,76,.08);font:700 22px/1.4 Georgia,serif;color:#e3c878}\
#wpaCampaignInstituteBlock .wpa-campaign-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}\
#wpaCampaignInstituteBlock .wpa-campaign-actions a{display:inline-flex;padding:11px 16px;border:1px solid #c9a84c;color:#e3c878;text-decoration:none;font-weight:800;font-size:13px}\
#wpaCampaignInstituteBlock .wpa-campaign-actions a:hover{background:#c9a84c;color:#081328}\
#wpaCampaignInstituteBlock .wpa-domain-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}\
#wpaCampaignInstituteBlock .wpa-domain-row a{color:#fbf8ee;text-decoration:none;border-bottom:1px solid rgba(201,168,76,.6);font-weight:700}\
@media(max-width:640px){#wpaCampaignInstituteBlock{padding:48px 20px}#wpaCampaignInstituteBlock .wpa-campaign-actions a{width:100%;justify-content:center}}';
    document.head.appendChild(style);
    var section=document.createElement('section');
    section.id='wpaCampaignInstituteBlock';
    section.setAttribute('aria-labelledby','wpaCampaignInstituteTitle');
    section.innerHTML='<div class="wpa-campaign-wrap"><div class="wpa-campaign-kicker">WPA Institutional Identity · Campaign & Hymn</div><h2 id="wpaCampaignInstituteTitle">Редот е стар. Науката е нова.</h2><p class="wpa-campaign-lead">Официјалниот креативен концепт на World Protocol Academy го поврзува живиот обичаен ред со современата институционална наука: опинци што играат по камен → match cut → лакирани чевли на мермер. Ист ритам. Ист чекор. Иста наука.</p><div class="wpa-campaign-motto">„Орото на светот“ · 7/8 · кавал → хор → зурли во финалниот рефрен.</div><div class="wpa-campaign-actions"><a href="/wpa-campaign.html">Официјална реклама →</a><a href="/wpa-anthem.html">Химна „Орото на светот“ →</a></div><div class="wpa-domain-row"><span>Официјални домени:</span><a href="https://worldprotocolacademy.mk/" rel="home">worldprotocolacademy.mk</a><a href="https://wpa.mk/">wpa.mk</a></div></div>';
    var cta=document.getElementById('cta');
    if(cta&&cta.parentNode) cta.parentNode.insertBefore(section,cta);
    else {
      var main=document.querySelector('main');
      if(main) main.appendChild(section); else document.body.appendChild(section);
    }
    var nav=document.querySelector('.nav-wrap .nav-links');
    if(nav&&!document.getElementById('wpaCampaignInstituteNav')){
      var a=document.createElement('a');
      a.id='wpaCampaignInstituteNav';
      a.href='#wpaCampaignInstituteBlock';
      a.textContent='Химна & Кампања';
      a.setAttribute('translate','no');
      nav.appendChild(a);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
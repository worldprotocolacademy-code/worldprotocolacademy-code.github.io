/* WPA Free Card Growth Runtime v1.0
 * Open authority -> Free Card interest -> guided learning -> premium value -> merit -> partnership.
 * Does not activate membership, QR, payments, credentials or partner benefits.
 */
(function(){
  'use strict';
  if(window.WPA_FREE_CARD_GROWTH_RUNTIME_LOADED)return;
  window.WPA_FREE_CARD_GROWTH_RUNTIME_LOADED=true;

  var page=(document.documentElement.getAttribute('data-wpa-page')||'').toLowerCase();
  var path=(location.pathname||'').toLowerCase();
  var isCard=page==='wpa-card'||/\/wpa-card\.html$/.test(path);
  var isRevenue=page==='passive-revenue'||/\/passive-revenue\.html$/.test(path);
  var isOpen=page==='wpa-open-library'||/\/wpa-open-library\.html$/.test(path);
  if(!isCard&&!isRevenue&&!isOpen)return;

  function lang(){return String(document.documentElement.lang||'mk').toLowerCase().indexOf('en')===0?'en':'mk';}
  function L(mk,en){return lang()==='en'?en:mk;}
  function style(){
    if(document.getElementById('wpa-free-card-growth-style'))return;
    var s=document.createElement('style');s.id='wpa-free-card-growth-style';s.textContent='\
#wpaFreeGrowth{width:min(1180px,calc(100% - 32px));margin:34px auto;padding:0;font-family:Arial,Helvetica,sans-serif}#wpaFreeGrowth .wfg-shell{border:1px solid rgba(154,119,40,.30);border-radius:22px;background:linear-gradient(135deg,#fff,#f7f1e4);box-shadow:0 14px 36px rgba(13,31,60,.10);padding:26px}#wpaFreeGrowth .wfg-kicker{font-size:11px;font-weight:900;letter-spacing:.13em;color:#9a7728;text-transform:uppercase}#wpaFreeGrowth h3{font-family:Georgia,"Times New Roman",serif;color:#0d1f3c;font-size:30px;line-height:1.15;margin:8px 0 10px}#wpaFreeGrowth p{color:#5a6577;margin:0 0 18px}#wpaFreeGrowth .wfg-actions{display:flex;gap:10px;flex-wrap:wrap}#wpaFreeGrowth .wfg-btn{display:inline-flex;padding:11px 16px;border-radius:999px;font-weight:900;text-decoration:none;border:1px solid #ddd3c3}#wpaFreeGrowth .wfg-primary{background:#9a7728;color:#fff;border-color:#9a7728}#wpaFreeGrowth .wfg-secondary{background:#fff;color:#0d1f3c}#wpaFreeGrowth .wfg-path{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:20px}#wpaFreeGrowth .wfg-step{border:1px solid #ddd3c3;border-radius:12px;background:#fff;padding:10px;text-align:center;font-size:11px;font-weight:900;color:#0d1f3c}#wpaFreeGrowth .wfg-note{font-size:11px;color:#6d7481;margin-top:14px}#wpaFreeGrowth .wfg-tracks{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}#wpaFreeGrowth .wfg-track{border:1px solid #ddd3c3;border-radius:14px;background:#fff;padding:14px}#wpaFreeGrowth .wfg-track strong{display:block;color:#0d1f3c;margin-bottom:6px}#wpaFreeGrowth .wfg-track span{font-size:12px;color:#5a6577;line-height:1.5}@media(max-width:850px){#wpaFreeGrowth .wfg-path{grid-template-columns:repeat(2,1fr)}#wpaFreeGrowth .wfg-tracks{grid-template-columns:1fr}}';document.head.appendChild(s);
  }
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
  function build(){
    if(document.getElementById('wpaFreeGrowth'))return;
    style();
    var section=el('section');section.id='wpaFreeGrowth';section.setAttribute('aria-label','WPA Free Card growth pathway');
    var shell=el('div','wfg-shell');section.appendChild(shell);
    shell.appendChild(el('div','wfg-kicker',L('WPA FREE CARD · ACQUISITION + LEARNING IDENTITY','WPA FREE CARD · ACQUISITION + LEARNING IDENTITY')));
    shell.appendChild(el('h3','',L('Прво вредност и припадност. Потоа premium, придонес и партнерство.','Value and belonging first. Premium, contribution and partnership later.')));
    shell.appendChild(el('p','',L('WPA Free Card е бесплатната влезна патека кон водено учење и идентитет во WPA екосистемот. Јавното знаење останува јавно; ACTIVE членство, Public ID и QR можат да постојат само преку овластен registry record.','WPA Free Card is the free entry path into guided learning and identity in the WPA ecosystem. Public knowledge stays public; ACTIVE membership, Public ID and QR can exist only through an authorised registry record.')));

    var actions=el('div','wfg-actions');
    var interest=el('a','wfg-btn wfg-primary',L('Изрази интерес за WPA Free Card','Express interest in WPA Free Card'));interest.href='/wpa-free-card-interest.html';
    var library=el('a','wfg-btn wfg-secondary',L('Отвори WPA Open Knowledge Library','Open WPA Open Knowledge Library'));library.href='/wpa-open-library.html';
    actions.append(interest,library);shell.appendChild(actions);

    var pathEl=el('div','wfg-path');[
      L('1 · Discover','1 · Discover'),L('2 · Read Open','2 · Read Open'),L('3 · WPA Free','3 · WPA Free'),L('4 · Learn','4 · Learn'),L('5 · Contribute','5 · Contribute'),L('6 · Partner','6 · Partner')
    ].forEach(function(x){pathEl.appendChild(el('div','wfg-step',x));});shell.appendChild(pathEl);

    if(isRevenue){
      var tracks=el('div','wfg-tracks');
      [
        [L('Membership Track','Membership Track'),L('WPA Free → WPA Pro → Academic Pro → Institutional. Premium tiers do not buy academic authority.','WPA Free → WPA Pro → Academic Pro → Institutional. Premium tiers do not buy academic authority.')],
        [L('Contribution & Merit Track','Contribution & Merit Track'),L('Member → Contributor → Professional Observer → Expert/Reviewer → Fellow/Faculty. Earned through documented contribution and Human Gate.','Member → Contributor → Professional Observer → Expert/Reviewer → Fellow/Faculty. Earned through documented contribution and Human Gate.')],
        [L('Partnership Track','Partnership Track'),L('Member Benefit → Knowledge → Education → Institutional → Regional/Strategic → Global Strategic Partner. Separate due diligence and approval required.','Member Benefit → Knowledge → Education → Institutional → Regional/Strategic → Global Strategic Partner. Separate due diligence and approval required.')]
      ].forEach(function(x){var c=el('div','wfg-track');c.appendChild(el('strong','',x[0]));c.appendChild(el('span','',x[1]));tracks.appendChild(c);});
      shell.appendChild(tracks);
    }

    shell.appendChild(el('div','wfg-note',L('Оваа патека не активира плаќање, credential, benefit redemption или partnership status. Секоја таква активација останува под посебен Human Gate.','This pathway does not activate payment, credentials, benefit redemption or partnership status. Each such activation remains under a separate Human Gate.')));

    var main=document.querySelector('main');
    if(main){
      var target=isCard?main.querySelector('#tiers'):isRevenue?main.querySelector('#benefits'):null;
      if(target&&target.parentNode)target.parentNode.insertBefore(section,target);else main.appendChild(section);
    }else document.body.appendChild(section);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();

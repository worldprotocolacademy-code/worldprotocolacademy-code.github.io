/* WPA Public Square Runtime v1.2.0
 * Programmes -> Certification -> WPA Card -> Partnerships & Member Benefits.
 * Development/pilot only. Pre-commercial partner operations may be active;
 * enrolment, issuance, paid membership, payments and benefit redemption remain inactive.
 */
(function(){
  'use strict';
  if(window.WPA_PUBLIC_SQUARE_RUNTIME_LOADED)return;
  window.WPA_PUBLIC_SQUARE_RUNTIME_LOADED=true;

  var MODEL='/data/wpa-public-square-operating-model.json?v=20260827-1';
  var PAGE=(document.documentElement.getAttribute('data-wpa-page')||document.body&&document.body.getAttribute('data-page')||'').toLowerCase();
  var PATH=(location.pathname||'').toLowerCase();
  var MAP={
    programmes:{label:'Programmes',href:'/programmes.html',step:1},
    certification:{label:'Certification',href:'/certification.html',step:2},
    'wpa-card':{label:'WPA Card',href:'/wpa-card.html',step:3},
    'passive-revenue':{label:'Partnerships & Benefits',href:'/passive-revenue.html',step:4}
  };
  function pageKey(){
    if(MAP[PAGE])return PAGE;
    if(/programmes\.html$/.test(PATH))return'programmes';
    if(/certification\.html$/.test(PATH))return'certification';
    if(/wpa-card\.html$/.test(PATH))return'wpa-card';
    if(/passive-revenue\.html$/.test(PATH))return'passive-revenue';
    return'';
  }
  var KEY=pageKey();
  if(!KEY)return;

  function loadCredentialOperations(){
    if(KEY==='passive-revenue'||window.WPA_CREDENTIAL_JOURNEY_LOADED||document.getElementById('wpa-credential-journey-v2'))return;
    var s=document.createElement('script');s.id='wpa-credential-journey-v2';s.src='/scripts/wpa-credential-journey.js?v=20260827-2';s.defer=true;document.head.appendChild(s);
  }
  loadCredentialOperations();

  function L(mk,en){return String(document.documentElement.lang||'mk').toLowerCase().indexOf('en')===0?en:mk;}
  function addStyle(){
    if(document.getElementById('wpa-public-square-style'))return;
    var s=document.createElement('style');s.id='wpa-public-square-style';s.textContent='\
#wpaPublicSquare{background:#0f1b30;color:#eef3fb;border-top:1px solid rgba(201,168,76,.34);border-bottom:1px solid rgba(201,168,76,.34);padding:18px 0;font-family:Arial,Helvetica,sans-serif}#wpaPublicSquare .wps-wrap{width:min(1240px,calc(100% - 32px));margin:0 auto}#wpaPublicSquare .wps-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px}#wpaPublicSquare .wps-kicker{font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#f4d697}#wpaPublicSquare .wps-status{font-size:12px;font-weight:800;color:#f4d697;border:1px solid rgba(244,214,151,.28);border-radius:999px;padding:6px 10px;background:rgba(255,255,255,.04)}#wpaPublicSquare .wps-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}#wpaPublicSquare .wps-step{display:block;border:1px solid rgba(255,255,255,.13);border-radius:14px;padding:12px 13px;background:rgba(255,255,255,.035);color:#dfe6f1;text-decoration:none;min-height:76px}#wpaPublicSquare .wps-step strong{display:block;color:#fff;font-size:14px;margin-bottom:3px}#wpaPublicSquare .wps-step span{font-size:11px;color:rgba(255,255,255,.66)}#wpaPublicSquare .wps-step.active{border-color:#c9a84c;background:rgba(201,168,76,.12);box-shadow:inset 0 0 0 1px rgba(201,168,76,.16)}#wpaPublicSquare .wps-next{margin-top:13px;border-left:4px solid #c9a84c;background:rgba(255,255,255,.045);border-radius:10px;padding:11px 13px;font-size:12.5px;line-height:1.55;color:#d9e0ec}#wpaPublicSquare .wps-next a{color:#f4d697;font-weight:900;text-decoration:none}#wpaPublicSquare .wps-boundary{margin-top:8px;color:rgba(255,255,255,.62);font-size:11px;line-height:1.45}#wpaPublicSquare .wps-ops{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}#wpaPublicSquare .wps-ops a{display:inline-flex;padding:8px 11px;border-radius:999px;border:1px solid rgba(244,214,151,.38);color:#f4d697;text-decoration:none;font-size:11px;font-weight:900;background:rgba(201,168,76,.07)}@media(max-width:820px){#wpaPublicSquare .wps-flow{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){#wpaPublicSquare .wps-flow{grid-template-columns:1fr}}';document.head.appendChild(s);
  }
  function text(el,t){el.textContent=t;return el;}
  function routeKey(){return KEY==='wpa-card'?'wpa_card':KEY==='passive-revenue'?'partnerships_member_benefits':KEY;}
  function fallback(){
    return{status:'DEVELOPMENT / PILOT',next:L('Прегледај ја следната фаза. Нема активирано плаќање, членство, издавање сертификат или партнерски бенефит.','Review the next stage. No payment, membership, certificate issuance or partner benefit is active.'),href:MAP[KEY].href};
  }
  function render(model){
    if(document.getElementById('wpaPublicSquare'))return;
    addStyle();
    var r=(model&&model.next_valid_actions&&model.next_valid_actions[routeKey()])||fallback();
    var section=document.createElement('aside');section.id='wpaPublicSquare';section.setAttribute('role','note');section.setAttribute('aria-label','WPA Public Square operational status');
    var wrap=document.createElement('div');wrap.className='wps-wrap';section.appendChild(wrap);
    var head=document.createElement('div');head.className='wps-head';wrap.appendChild(head);
    var left=document.createElement('div');head.appendChild(left);text((function(){var e=document.createElement('div');e.className='wps-kicker';left.appendChild(e);return e})(),L('WPA јавен квадрат · оперативна патека','WPA Public Square · operating pathway'));
    var status=text(document.createElement('div'),String(r.status||'DEVELOPMENT'));status.className='wps-status';head.appendChild(status);
    var flow=document.createElement('div');flow.className='wps-flow';wrap.appendChild(flow);
    ['programmes','certification','wpa-card','passive-revenue'].forEach(function(k,i){var a=document.createElement('a');a.className='wps-step'+(k===KEY?' active':'');a.href=MAP[k].href;var st=document.createElement('strong');st.textContent=(i+1)+'. '+MAP[k].label;var sub=document.createElement('span');sub.textContent=k===KEY?L('Тековна фаза','Current stage'):L('Отвори фаза','Open stage');a.append(st,sub);flow.appendChild(a)});
    var next=document.createElement('div');next.className='wps-next';next.appendChild(document.createTextNode(L('Следен валиден чекор: ','Next valid action: ')+String(r.next||'' )+' '));var link=document.createElement('a');link.href=String(r.href||MAP[KEY].href);link.textContent=L('Отвори →','Open →');next.appendChild(link);wrap.appendChild(next);
    var b=text(document.createElement('div'),L('Human Gate: визуелна картичка, сертификат, serial или QR не создава статус сам по себе. Валиден е само овластен registry record. Комерцијални и credential функции остануваат неактивни во оваа фаза.','Human Gate: a visual card, certificate, serial or QR does not create status by itself. Only an authorised registry record is valid. Commercial and credential functions remain inactive at this stage.'));b.className='wps-boundary';wrap.appendChild(b);
    if(KEY==='passive-revenue'){
      var ops=document.createElement('div');ops.className='wps-ops';
      var op=document.createElement('a');op.href='/partner-operations.html';op.textContent=L('Отвори Partner Operations','Open Partner Operations');
      var eq=document.createElement('a');eq.href='/partner-enquiry.html';eq.textContent=L('Партнерски интерес / enquiry','Partner interest / enquiry');
      ops.append(op,eq);wrap.appendChild(ops);
    }
    var anchor=document.querySelector('main');if(anchor&&anchor.firstElementChild)anchor.insertBefore(section,anchor.firstElementChild);else document.body.insertBefore(section,document.body.firstChild);
    window.WPA_PUBLIC_SQUARE=Object.freeze({version:'1.2.0',page:KEY,model:model||null,humanGate:true,credentialOperationsLoaded:KEY!=='passive-revenue',precommercialPartnerOperations:KEY==='passive-revenue',commercialActivation:false,credentialIssuance:false});
    document.dispatchEvent(new CustomEvent('wpa:public-square-ready',{detail:{page:KEY,status:r.status||'DEVELOPMENT'}}));
  }
  fetch(MODEL,{cache:'no-store',headers:{accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('model');return r.json()}).then(render).catch(function(){render(null)});
})();

/* WPA Credential Journey v2.0
 * Governed interoperability across Programmes, Certification and WPA Card.
 * No enrolment, identity processing, issuance, membership activation, payment or live registry action.
 */
(function(){
  'use strict';
  if(window.WPA_CREDENTIAL_JOURNEY_LOADED)return;
  window.WPA_CREDENTIAL_JOURNEY_LOADED=true;

  var K='wpaCredentialJourney';
  var OPS='/data/wpa-programme-certification-operations-v1.json?v=20260827-1';
  var SEC='/data/wpa-credential-security-master-v1.json?v=20260827-1';
  var FALLBACK={
    status:'DEMO_FALLBACK',current_public_maximum_state:'ELIGIBILITY_REVIEW',
    levels:[
      {id:'FND',level:1,credential_code:'WPA-FND',label:'Foundation',purpose:'Entry professional literacy.',progression_to:'PRO'},
      {id:'PRO',level:2,credential_code:'WPA-PRO',label:'Professional',purpose:'Applied professional protocol.',progression_to:'ADV'},
      {id:'ADV',level:3,credential_code:'WPA-ADV',label:'Advanced',purpose:'Complex institutional practice.',progression_to:'TTC'},
      {id:'TTC',level:4,credential_code:'WPA-TTC',label:'Trainer / Consultant',purpose:'Training and advisory practice.',progression_to:'CPD'}
    ],
    score_bands:[
      {min:0,max:69.99,label:'Not eligible'},
      {min:70,max:84.99,label:'Pass'},
      {min:85,max:91.99,label:'Distinction'},
      {min:92,max:100,label:'High Distinction'}
    ],
    state_machine:['PUBLIC_INFORMATION','EXPRESSION_OF_INTEREST','ELIGIBILITY_REVIEW'],
    locked_states_until_activation:['ADMISSION_AUTHORISED','ENROLMENT_AUTHORISED','ISSUED']
  };
  var SECFALL={status:'DESIGN_READY_REGISTRY_NOT_ACTIVE',security_layers:[
    {layer:1,label:'Authoritative registry record',status:'DESIGN_READY_NOT_ACTIVE'},
    {layer:2,label:'Human Gate authorisation',status:'GOVERNANCE_ACTIVE'},
    {layer:3,label:'Registry-generated serial',status:'DESIGN_READY_NOT_ACTIVE'},
    {layer:4,label:'Verification URL + QR',status:'DESIGN_READY_NOT_ACTIVE'},
    {layer:5,label:'Cryptographic content digest',status:'DESIGN_READY_NOT_ACTIVE'},
    {layer:6,label:'PDF digital signature / PKI',status:'FUTURE_PRODUCTION_CONTROL'},
    {layer:7,label:'Live status and revocation',status:'DESIGN_READY_NOT_ACTIVE'},
    {layer:8,label:'Status-change audit log',status:'DESIGN_READY_NOT_ACTIVE'},
    {layer:9,label:'Verification anti-abuse monitoring',status:'FUTURE_PRODUCTION_CONTROL'},
    {layer:10,label:'Controlled visual security design',status:'DESIGN_REFERENCE_ONLY'}
  ]};

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function path(){return String(location.pathname||'').toLowerCase();}
  function save(level,score){var d={level:level,score:score==null?null:String(score),updatedAt:Date.now(),demo:true,status:'DEMO_NOT_ISSUED'};try{sessionStorage.setItem(K,JSON.stringify(d));}catch(e){}return d;}
  function load(){try{return JSON.parse(sessionStorage.getItem(K)||'null');}catch(e){return null;}}
  function getJSON(url,fallback){return fetch(url,{cache:'no-store',headers:{accept:'application/json'}}).then(function(r){if(!r.ok)throw new Error('fetch');return r.json();}).catch(function(){return fallback;});}
  function band(ops,n){n=Number(n);var b=(ops.score_bands||[]).find(function(x){return n>=Number(x.min)&&n<=Number(x.max);});return b?b.label:'Not eligible';}
  function levelBy(ops,id){return(ops.levels||[]).find(function(x){return x.id===id;})||(ops.levels||[])[0];}
  function demoId(l){return 'WPA-DEMO-'+String(l.id||'FND')+'-2026-0001';}

  function style(){
    if(document.getElementById('wpa-credential-style'))return;
    var s=document.createElement('style');s.id='wpa-credential-style';s.textContent='\
.wpa-cj{margin:26px auto;padding:24px;border:1px solid #ddd3c3;border-radius:20px;background:#fff;box-shadow:0 12px 34px rgba(20,31,52,.09);max-width:1180px}.wpa-cj h3{margin:0 0 8px;color:#162947;font:700 28px/1.15 Georgia,serif}.wpa-cj h4{color:#162947;margin:0 0 8px}.wpa-cj p{color:#5a6577}.wpa-cj-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.wpa-cj button,.wpa-cj a{display:inline-flex;justify-content:center;align-items:center;padding:10px 13px;border-radius:999px;border:1px solid #c9a84c;background:#162947;color:#fff;font-weight:800;cursor:pointer;text-decoration:none}.wpa-cj button.active{background:#c9a84c;color:#162947}.wpa-cj-tools{display:grid;grid-template-columns:1fr 1fr;gap:14px}.wpa-cj-box{padding:16px;border-radius:14px;background:#fbf8f3;border:1px solid #ddd3c3}.wpa-cj-box input{width:100%;padding:10px;border:1px solid #ddd3c3;border-radius:10px}.wpa-cj-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.wpa-demo{margin-top:12px;padding:12px;border-left:4px solid #c9a84c;background:#fff8e7;color:#5a6577}.wpa-cj-flow{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0}.wpa-cj-flow span{padding:7px 9px;border:1px solid #ddd3c3;border-radius:999px;background:#fff;font-size:11px;font-weight:800;color:#162947}.wpa-cj-flow span.lock{background:#fff4f4;color:#844;border-color:#debaba}.wpa-cj-sec{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:14px}.wpa-cj-sec div{padding:11px;border:1px solid #ddd3c3;border-radius:10px;background:#fff}.wpa-cj-sec b{display:block;color:#162947;font-size:13px}.wpa-cj-sec small{color:#7a6640}.wpa-card-lab{background:linear-gradient(135deg,#061022,#13284a 55%,#9a7728);color:#fff;border-radius:24px;padding:24px;min-height:230px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 18px 50px rgba(0,0,0,.22)}.wpa-card-lab .top,.wpa-card-lab .bottom{display:flex;justify-content:space-between;gap:12px}.wpa-card-lab .mark{font:700 28px Georgia,serif;color:#f2dda3}.wpa-card-lab .demo{border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900}.wpa-card-lab h4{font:700 28px Georgia,serif;color:#fff;margin:12px 0 4px}.wpa-card-lab p{color:rgba(255,255,255,.78);margin:0}.wpa-card-lab .qr{width:58px;height:58px;border:1px solid rgba(255,255,255,.5);display:grid;place-items:center;font-size:8px;text-align:center}.wpa-cj-banner{margin:18px auto;max-width:1180px;padding:14px 18px;border:1px solid #c9a84c;background:#fff8e7;border-radius:14px}.wpa-cj-banner a{font-weight:800;color:#162947}@media(max-width:850px){.wpa-cj-grid,.wpa-cj-tools,.wpa-cj-sec{grid-template-columns:1fr}}';document.head.appendChild(s);
  }

  function levelButtons(ops){return(ops.levels||[]).map(function(l){return'<button type="button" data-cj="'+esc(l.id)+'">'+esc(l.credential_code)+' · L'+esc(l.level)+'</button>';}).join('');}
  function publicFlow(ops){var max=String(ops.current_public_maximum_state||'ELIGIBILITY_REVIEW');var locked=ops.locked_states_until_activation||[];return(ops.state_machine||[]).map(function(st){var isLock=locked.indexOf(st)!==-1;return'<span class="'+(isLock?'lock':'')+'">'+esc(st)+(st===max?' · CURRENT PUBLIC MAX':'')+'</span>';}).join('');}

  function programmes(ops){
    if(document.getElementById('wpaProgrammeOps'))return;
    var m=document.querySelector('main');if(!m)return;style();
    var w=document.createElement('section');w.id='wpaProgrammeOps';w.className='wpa-cj';
    w.innerHTML='<h3>Programme Operations · governed path</h3><p>Денес реално се активни: programme information, expression of interest и controlled eligibility review. Formal enrolment и сите подоцнежни credential states остануваат заклучени.</p><div class="wpa-cj-grid">'+levelButtons(ops)+'</div><div class="wpa-cj-flow">'+publicFlow(ops)+'</div><div class="wpa-cj-actions"><a href="/institutional-enquiry.html">Programme early access / EOI</a><a href="/certification.html#certificates">Certification framework</a></div><div class="wpa-demo"><strong>PUBLIC MAXIMUM: '+esc(ops.current_public_maximum_state||'ELIGIBILITY_REVIEW')+'.</strong> Нема enrolment, assessment decision или certificate eligibility без посебна governed activation.</div>';
    m.appendChild(w);
  }

  function certification(ops,sec){
    var host=document.querySelector('#certificates .container')||document.querySelector('main');if(!host||document.getElementById('wpaCredentialJourney'))return;style();
    var w=document.createElement('section');w.id='wpaCredentialJourney';w.className='wpa-cj';
    w.innerHTML='<h3>WPA Credential Journey · v2</h3><p>Programme → assessment → Human Result Review → completion → credential eligibility → Human Gate → registry → serial/verification → render. Сегашниот public runtime е demo-only.</p><div class="wpa-cj-grid">'+levelButtons(ops)+'</div><div class="wpa-cj-tools"><div class="wpa-cj-box"><strong>Assessment simulator</strong><p>Score е само образовна симулација; не создава assessment record.</p><input id="wpaCjScore" type="number" min="0" max="100" value="70"><div id="wpaCjBand" class="wpa-demo">Score band: '+esc(band(ops,70))+'</div></div><div class="wpa-cj-box"><strong id="wpaCjTitle"></strong><p id="wpaCjId"></p><div class="wpa-cj-actions"><a href="/programmes.html">Programme</a><a href="/wpa-card.html">WPA Card Lab</a><a href="#verification">Demo verification</a></div></div></div><h4 style="margin-top:18px">Operational state machine</h4><div class="wpa-cj-flow">'+publicFlow(ops)+'</div><h4>Credential Security Master · '+esc(sec.status||'DESIGN')+'</h4><div class="wpa-cj-sec">'+(sec.security_layers||[]).map(function(x){return'<div><b>Layer '+esc(x.layer)+' · '+esc(x.label)+'</b><small>'+esc(x.status)+'</small></div>';}).join('')+'</div><div class="wpa-demo"><strong>DEMO · NOT ISSUED.</strong> Нема public registry, QR verification, PKI signing или official issuance активирано.</div>';
    host.appendChild(w);
    var level=(ops.levels||[])[0];
    function choose(id){level=levelBy(ops,id);if(!level)return;var score=document.getElementById('wpaCjScore').value;save(level.id,score);document.querySelectorAll('[data-cj]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-cj')===level.id);});document.getElementById('wpaCjTitle').textContent=level.credential_code+' · '+level.label+' · Level '+level.level;document.getElementById('wpaCjId').textContent='Demo ID: '+demoId(level)+' · DEMO_NOT_ISSUED';}
    w.addEventListener('click',function(e){var b=e.target.closest('[data-cj]');if(b)choose(b.getAttribute('data-cj'));});
    document.getElementById('wpaCjScore').addEventListener('input',function(){document.getElementById('wpaCjBand').textContent='Score band: '+band(ops,this.value)+' · DEMO ONLY';save(level.id,this.value);});
    choose(level&&level.id||'FND');
  }

  function cardLab(ops,sec){
    if(document.getElementById('wpaCardLab'))return;var m=document.querySelector('main');if(!m)return;style();
    var ctx=load();var l=levelBy(ops,ctx&&ctx.level||'FND')||(ops.levels||[])[0];
    var w=document.createElement('section');w.id='wpaCardLab';w.className='wpa-cj';
    w.innerHTML='<h3>WPA Card Lab · governed visual prototype</h3><p>Картичката е визуелна репрезентација на иден статус — не доказ за членство. До registry activation секоја верзија е DEMO / NOT ACTIVE.</p><div class="wpa-cj-tools"><div class="wpa-card-lab"><div class="top"><div class="mark">WPA</div><div class="demo">DEMO · NOT ACTIVE</div></div><div><h4 id="wpaCardLabTitle">WPA Card</h4><p id="wpaCardLabLine"></p></div><div class="bottom"><div>World Protocol Academy<br><small>Public ID: DEMO ONLY</small></div><div class="qr">QR ZONE<br>NOT ACTIVE</div></div></div><div class="wpa-cj-box"><strong>Card status contract</strong><p><b>Visual ≠ status.</b> Future ACTIVE status must come from an authorised membership registry record.</p><div class="wpa-cj-actions"><a href="/certification.html#certificates">Credential Journey</a><a href="/partner-operations.html">Partner Operations</a></div><div class="wpa-demo">Partner benefits one day require BOTH: authorised ACTIVE membership/card record + ACTIVE confirmed benefit record.</div></div></div><h4 style="margin-top:18px">10-layer Credential Security Master</h4><div class="wpa-cj-sec">'+(sec.security_layers||[]).map(function(x){return'<div><b>'+esc(x.layer)+'. '+esc(x.label)+'</b><small>'+esc(x.status)+'</small></div>';}).join('')+'</div>';
    m.appendChild(w);
    document.getElementById('wpaCardLabLine').textContent=(l?l.credential_code+' · '+l.label+' context · ':'')+'Membership • Access • Verification • Learning Identity';
  }

  function banner(ops){var x=load();if(!x||document.getElementById('wpaCredentialBanner'))return;var p=path();if(!/institute\.html|virtual-sande-ai\.html/.test(p))return;var l=levelBy(ops,x.level);if(!l)return;style();var b=document.createElement('aside');b.id='wpaCredentialBanner';b.className='wpa-cj-banner';b.innerHTML='<strong>Credential journey context:</strong> '+esc(l.credential_code)+' · '+esc(l.label)+' · DEMO, NOT ISSUED. <a href="/certification.html#certificates">Return to Certification →</a>';var m=document.querySelector('main');if(m)m.insertBefore(b,m.firstChild);}

  function boot(ops,sec){var p=path();if(/programmes\.html$/.test(p))programmes(ops);if(/certification\.html$/.test(p))certification(ops,sec);if(/wpa-card\.html$/.test(p))cardLab(ops,sec);banner(ops);window.WPA_CREDENTIAL_OPERATIONS=Object.freeze({version:'2.0.0',programmeModel:ops,securityModel:sec,issuanceActive:false,membershipActive:false,humanGate:true});document.dispatchEvent(new CustomEvent('wpa:credential-operations-ready',{detail:{version:'2.0.0'}}));}

  Promise.all([getJSON(OPS,FALLBACK),getJSON(SEC,SECFALL)]).then(function(x){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){boot(x[0],x[1]);},{once:true});else boot(x[0],x[1]);});
})();

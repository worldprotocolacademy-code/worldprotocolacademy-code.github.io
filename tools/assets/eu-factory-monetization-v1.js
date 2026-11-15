/* WPA EU Factory Monetization & Sustainability Agent v1.
 * PURE local computation. No paid calls, billing, collection or commercial activation.
 * Every proposed euro and unit is a user-controlled assumption, not revenue evidence. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  if(root){root.WPAEUMonetization=api;if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',function(){api.attach(root.document)},{once:true});else api.attach(root.document);}}
})(typeof window!=='undefined'?window:null,function(){
'use strict';
var VERSION='1.0.0';
var REVENUE_PATHS={
  general:['Institutional training and workshops (future service only)','Public-source research briefs (future institutional licence)','Ethical sponsorship without editorial control'],
  media:['Media literacy workshops and resource packs','Institutional media-literacy training pilots','Educational toolkit licence, if IP and terms permit'],
  journal:['Editorial-independent dissemination partnerships','Open-access training and reviewer capacity building','Institutional knowledge services, separate from acceptance decisions'],
  conference:['Event registrations only after legal/payment readiness','Transparent sponsorship without editorial influence','Professional masterclasses and post-event resources']
};
function nonneg(v,label,max){
 var x=Number(v); if(v==='' || v===null || v===undefined)x=0;
 if(!Number.isFinite(x)||x<0||x>(max||100000000))throw new Error('Invalid or excessive '+label);
 return x;
}
function round2(v){return Math.round((v+Number.EPSILON)*100)/100;}
function compute(assumptions){
 var a=assumptions||{};
 var units=nonneg(a.monthlyUnits,'monthly units',1000000);
 var price=nonneg(a.unitPriceEUR,'EUR price');
 var variable=nonneg(a.variableCostEUR,'variable EUR cost');
 var fixed=nonneg(a.fixedMonthlyEUR,'fixed monthly EUR cost');
 var setup=nonneg(a.setupCostEUR,'setup EUR cost');
 var horizon=12;
 function scenario(factor,name){
  var q=Math.floor(units*factor);
  var turnover=q*price*horizon;
  var variableCosts=q*variable*horizon;
  var fixedCosts=fixed*horizon;
  var twelveMonthCash=turnover-variableCosts-fixedCosts-setup;
  return {name,monthlyUnits:q,annualGrossEUR:round2(turnover),annualVariableEUR:round2(variableCosts),annualFixedEUR:round2(fixedCosts),setupCostEUR:round2(setup),annualNetBeforeTaxEUR:round2(twelveMonthCash)};
 }
 var contribution=price-variable;
 var threshold=contribution>0?Math.ceil((fixed+setup/horizon)/contribution):null;
 var values={monthlyUnits:units,unitPriceEUR:price,variableCostEUR:variable,fixedMonthlyEUR:fixed,setupCostEUR:setup};
 return {schema:'wpa-eu-monetization-advisory/1',version:VERSION,mode:'ILLUSTRATIVE_SCENARIO_NOT_ACTUAL_REVENUE',currency:'EUR',horizonMonths:horizon,values,
  monthlyContributionPerUnitEUR:round2(contribution),breakEvenMonthlyUnits:threshold,
  scenarios:[scenario(.5,'CONSERVATIVE'),scenario(1,'BASE'),scenario(1.5,'HIGH')],
  cashflowEvidence:'NONE_USER_ASSUMPTIONS_ONLY',taxAndVAT:'NOT_INCLUDED_REQUIRE_LOCAL_PROFESSIONAL_REVIEW',
  legalGate:'COMMERCIAL_ACTIVATION_BLOCKED_UNTIL_LEGAL_TAX_PAYMENT_FRAMEWORK',
  grantSeparation:'GRANTS_ARE_RESTRICTED_PROJECT_FINANCING_NOT_AUTOMATIC_RECURRING_SALES',
  editorialIndependence:'SPONSORSHIP_NEVER_BUYS_PUBLICATION_OR_PEER_REVIEW',
  actionGate:'NO_BILLING_NO_PAYMENT_NO_OFFERS_NO_EXTERNAL_COMMITMENTS'};
}
function projectRoutes(kind,tags){
 var actualKind=kind==='conference'||kind==='journal'?kind:(Array.isArray(tags)&&tags.some(t=>/media|communication|literacy|public_relation/i.test(t))?'media':'general');
 return {kind:actualKind,options:REVENUE_PATHS[actualKind].slice(),requires:'Legal applicant and payment/tax framework; demand research; IP/contracting and grant no-double-funding review'};
}
function viewReport(report,routing,projectTitle){
 var l=['# WPA Monetization & Sustainability Agent','',
  '- Project: '+(projectTitle||'Not provided'),
  '- Status: ILLUSTRATIVE / NO COMMERCIAL ACTIVATION',
  '- Path: '+routing.kind,'',
  '## Candidate revenue paths',...routing.options.map((x,i)=>(i+1)+'. '+x),'',
  '## User-controlled assumptions (EUR)',
  '- Units per month: '+report.values.monthlyUnits,
  '- Price per unit: '+report.values.unitPriceEUR,
  '- Variable cost per unit: '+report.values.variableCostEUR,
  '- Fixed cost monthly: '+report.values.fixedMonthlyEUR,
  '- One-off setup cost: '+report.values.setupCostEUR,'',
  '## 12-month planning scenarios (not verified)',
  '| Scenario | Units/month | Gross EUR | Net before tax EUR |',
  '|---|---:|---:|---:|'];
 report.scenarios.forEach(s=>l.push('| '+s.name+' | '+s.monthlyUnits+' | '+s.annualGrossEUR+' | '+s.annualNetBeforeTaxEUR+' |'));
 l.push('', '- Break-even monthly volume (includes setup amortized over 12 months): '+(report.breakEvenMonthlyUnits===null?'not achievable at this unit contribution':report.breakEvenMonthlyUnits),
 '', '## Mandatory Human Gates',
 '- WPA is a development/testing/pilot platform, not a commercially active legal entity.',
 '- No price, offer, invoice, subscription, payment or contract has been activated.',
 '- Verify legal applicant, taxes/VAT, GDPR, consumer/payment rules, IP and contract terms.',
 '- Separate sponsored deliverables from independent journal peer review.',
 '- EU grants cannot be booked as unrestricted sales or double-funded.',
 '- Model excludes taxes/VAT, payment processing fees, refunds, cash collection risk and actual demand.');
 return l.join('\n')+'\n';
}
function attach(document){
 function $(id){return document.getElementById(id)}
 var panel=$('monetizationPanel');if(!panel)return;
 var last=null,kind='general',title='New project',tags=[],state='NONE';
 function setStatus(value){var x=$('monetizationStatus');if(x)x.textContent=value;}
 function read(){return {monthlyUnits:$('revenueUnits').value,unitPriceEUR:$('revenuePrice').value,variableCostEUR:$('revenueVariable').value,fixedMonthlyEUR:$('revenueFixed').value,setupCostEUR:$('revenueSetup').value};}
 function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function render(){
  var report=compute(read());var routing=projectRoutes(kind,tags);
  var md=viewReport(report,routing,title);
  last={report,routing,project:{title,kind,tags:tags.slice(0,20)},markdown:md};
  var html='<p><strong>Planning routes for '+esc(title)+':</strong></p><ul>'+routing.options.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  html+='<div class="scenario-grid">'+report.scenarios.map(x=>'<div class="scenario"><strong>'+x.name+'</strong><br>Gross: '+esc(x.annualGrossEUR.toFixed(2))+' EUR<br>Net before tax: '+esc(x.annualNetBeforeTaxEUR.toFixed(2))+' EUR</div>').join('')+'</div>';
  html+='<p class="secondary">Break-even monthly units: '+esc(report.breakEvenMonthlyUnits===null?'NOT REACHED':report.breakEvenMonthlyUnits)+'. These are user-provided assumptions, NOT actual or guaranteed revenue. Taxes, payment fees and demand are not verified.</p>';
  $('monetizationResults').innerHTML=html;
  $('monetizationDownload').disabled=false;
  $('monetizationMd').disabled=false;
  setStatus('LOCAL MODEL COMPLETE / NO PAYMENT, OFFER, CONTRACT OR GRANT SUBMISSION. Legal/tax/payment Human Gate remains BLOCKED.');
 }
 function exportFile(name,content,mime){
  var u=URL.createObjectURL(new Blob([content],{type:mime}));
  var a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();
  window.setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},1000);
 }
 $('monetizationEvaluate').addEventListener('click',function(){try{render();}catch(err){setStatus(err.message);}});
 $('monetizationExample').addEventListener('click',function(){
  // Mark example assumptions, never present as actual pricing.
  $('revenueUnits').value='12';$('revenuePrice').value='75';$('revenueVariable').value='10';$('revenueFixed').value='500';$('revenueSetup').value='1500';state='SAMPLE';
  try{render();setStatus('ILLUSTRATIVE NUMBERS ONLY; replace all values with evidenced assumptions before a decision.');}catch(e){setStatus(e.message)}
 });
 $('monetizationDownload').addEventListener('click',function(){if(last)exportFile('wpa-monetization-planning-only.json',JSON.stringify(last,null,2),'application/json;charset=utf-8')});
 $('monetizationMd').addEventListener('click',function(){if(last)exportFile('wpa-monetization-planning-only.md',last.markdown,'text/markdown;charset=utf-8')});
 document.addEventListener('wpa-eu-analysis-ready',function(e){
  var d=e.detail||{};kind=d.projectKind||'general';title=String(d.projectTitle||'New project').slice(0,150);tags=Array.isArray(d.tags)?d.tags.filter(x=>typeof x==='string').slice(0,20):[];
  var routes=projectRoutes(kind,tags);
  setStatus('PROACTIVE ROUTING: '+routes.options.join(' / ')+'. To calculate cashflow, enter user-owned values. No providers called.');
  last=null;$('monetizationDownload').disabled=true;$('monetizationMd').disabled=true;
  $('monetizationResults').textContent='Suggested opportunities are prepared for '+title+'. All amounts remain unspecified until entered.';
 });
 setStatus('Ready: enter your own assumptions or use the clearly labelled illustrative example. No provider calls.');
}
return {VERSION,REVENUE_PATHS,compute,projectRoutes,viewReport,attach};
});
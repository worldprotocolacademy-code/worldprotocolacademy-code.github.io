/* Local, hypothetical evaluator workbench. Not an official award score. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WPAPrivateGrantTools=api;
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',api.mount,{once:true});
})(typeof window==='undefined'?null:window,function(){
  'use strict';
  const weights={strategic:25,impact:20,readiness:15,consortium:15,budget:10,deadline:10,evidence:5};
  const labels={strategic:'Стратешко совпаѓање',impact:'Влијание',readiness:'Подготвеност',consortium:'Конзорциум',budget:'Буџет',deadline:'Рокови',evidence:'Докази'};
  const gates=['applicant','country','scope','consortium','period','deadline'];
  const gateLabels={applicant:'Правен апликант',country:'Подобна држава',scope:'Тематски услови',consortium:'Партнерски услови',period:'Период на спроведување',deadline:'Рок на повикот'};
  function simulate(checks,scores){
    const failures=[],unknown=[];
    for(const k of gates){if(checks?.[k]==='FAIL')failures.push(k);else if(checks?.[k]!=='PASS')unknown.push(k);}
    const base={schema:'wpa-grant-simulator/1',status:'HYPOTHETICAL_SELF_ASSESSMENT',humanGate:'HOLD',submissionAuthorised:false,eligibilityVerified:false,weights:{...weights},failures,unknown,score:null,assessment:'WATCH',redTeam:[]};
    if(failures.length){base.assessment='NO_GO';base.redTeam=failures.map(k=>'Failed mandatory gate: '+k);return base;}
    if(unknown.length){base.assessment='BLOCKED_UNVERIFIED';base.redTeam=unknown.map(k=>'Unverified mandatory gate: '+k);return base;}
    let total=0;for(const [k,w] of Object.entries(weights)){const v=scores?.[k];if(!Number.isInteger(v)||v<0||v>100)throw Error('Invalid criterion: '+k);total+=v*w/100;if(v<65)base.redTeam.push('Weak criterion: '+k);}
    base.score=Math.round(total*10)/10;base.assessment=total>=80?'PRIORITY_REVIEW':total>=65?'WATCH':'NO_GO_LOW_FIT';
    base.redTeam.push('Self-declared PASS is not independently verified; exact call criteria and evidence still required.');
    return base;
  }
  function mount(){
    const d=document,el=id=>d.getElementById(id);if(!el('v10PrivateWorkbench'))return;
    const access=el('v10PrivateStatus'),radar=el('v10RadarOutput'),sim=el('v10SimOutput');
    let candidate=null,simulation=null;
    const make=(tag,text)=>{const n=d.createElement(tag);if(text)n.textContent=text;return n;};
    const addOption=(select,value,label)=>{const o=make('option',label);o.value=value;select.append(o);};
    for(const k of gates){const label=make('label',gateLabels[k]);const s=make('select');s.id='sim-gate-'+k;for(const [value,copy] of [['UNKNOWN','Непотврдено'],['PASS','Хипотетички PASS'],['FAIL','FAIL']])addOption(s,value,copy);label.htmlFor=s.id;label.append(s);el('v10SimGates').append(label);}
    for(const k of Object.keys(weights)){const label=make('label',labels[k]+' ('+weights[k]+'%)');const input=make('input');input.type='number';input.min='0';input.max='100';input.step='1';input.id='sim-score-'+k;input.value='';label.htmlFor=input.id;label.append(input);el('v10SimScores').append(label);}
    function download(name,packet){const url=URL.createObjectURL(new Blob([JSON.stringify(packet,null,2)],{type:'application/json'}));const a=make('a');a.href=url;a.download=name;d.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    function invalidate(){simulation=null;el('v10SimExport').disabled=true;sim.textContent='Променети параметри — изврши нова симулација.';}
    el('v10SimGates').addEventListener('change',invalidate);el('v10SimScores').addEventListener('input',invalidate);
    el('v10SimRun').addEventListener('click',()=>{try{const c=Object.fromEntries(gates.map(k=>[k,el('sim-gate-'+k).value]));const s=Object.fromEntries(Object.keys(weights).map(k=>[k,el('sim-score-'+k).value.trim()===''?NaN:Number(el('sim-score-'+k).value)]));simulation=simulate(c,s);sim.textContent=JSON.stringify(simulation,null,2);el('v10SimExport').disabled=false;}catch(e){simulation=null;sim.textContent=e.message;el('v10SimExport').disabled=true;}});
    el('v10SimExport').addEventListener('click',()=>{if(simulation)download('wpa-grant-simulation-review.json',simulation);});
    el('v10RadarProfile').addEventListener('change',()=>{candidate=null;el('v10RadarExport').disabled=true;radar.textContent='Избери пребарување за новата тема.';});
    el('v10RadarRun').addEventListener('click',async()=>{
      candidate=null;el('v10RadarExport').disabled=true;el('v10RadarRun').disabled=true;el('v10RadarProfile').disabled=true;radar.textContent='Се проверува официјалниот EC Search API…';
      try{
        const r=await fetch('/api/v1/radar?profile='+encodeURIComponent(el('v10RadarProfile').value),{cache:'no-store',credentials:'same-origin'});
        if(!r.ok)throw Error('Официјалниот извор или пристапот е недостапен (HTTP '+r.status+'). Нема промена на регистарот.');
        const packet=await r.json();if(packet.status!=='DISCOVERY_ONLY_NOT_ELIGIBILITY_VERIFIED'||!Array.isArray(packet.items))throw Error('Непознат одговор');
        candidate=packet;radar.replaceChildren(make('p',packet.retrievedAt+' · '+packet.items.length+' кандидати · не е потврдена подобност.'));
        for(const item of packet.items){const row=make('p'),a=make('a',item.topicIdentifier+' — '+item.title);const u=new URL(item.officialTopicLink);if(u.protocol!=='https:'||u.hostname!=='ec.europa.eu')continue;a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';row.append(a,make('small',' · изворен status code: '+(item.statusCode||'unknown')+' · можен рок: '+(item.deadlineCandidate||'unknown')));radar.append(row);}
        radar.append(make('p',packet.scope));el('v10RadarExport').disabled=false;
      }catch(e){candidate=null;radar.textContent=e.message;}
      finally{el('v10RadarRun').disabled=false;el('v10RadarProfile').disabled=false;}
    });
    el('v10RadarExport').addEventListener('click',()=>{if(candidate)download('wpa-ec-radar-candidates.json',candidate);});
    fetch('/api/v1/access',{cache:'no-store',credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('access');return r.json();}).then(a=>{if(a.ok!==true||!['owner','pro','extra'].includes(a.role))throw Error('access');access.textContent='Серверски проверена сесија · '+a.role+' · Human Gate HOLD';el('v10RadarRun').disabled=!a.radarEnabled;if(!a.radarEnabled)radar.textContent='Radar не е активиран во оваа средина.';}).catch(()=>{access.textContent='Нема потврдена серверска сесија; Radar е блокиран.';el('v10RadarRun').disabled=true;el('v10SimRun').disabled=true;});
  }
  return {weights,gates,simulate,mount};
});

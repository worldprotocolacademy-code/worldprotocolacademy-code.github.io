'use strict';
(() => {
const domains = ['protocol','diplomacy','public_relations','security','communicology'];
const labels = ['Протокол','Дипломатија','Односи со јавност','Безбедност','Комуникологија'];
const routes = ['Protocol','Diplomacy','Strategic Communication','Security','Communicology'];
const now = Date.parse('2026-11-26T12:00:00Z');
const fixture = () => ({status:'AUTO_GENERATED_READY_FOR_HUMAN_GATE',generated_at:new Date(now).toISOString(),canonical_input:{system:'WPA Journal Live'},human_gate:{state:'PENDING'},boundaries:{automatic_external_publication:false},items:domains.map((domain,i)=>({domain,source:'Fixture '+domain,original_url:'https://example.org/'+domain,verification_status:'candidate',title:'Synthetic fixture',published_at:new Date(now).toISOString(),relevance_score:90,source_confidence:90,score:90-i}))});
const valid = (v) => typeof v==='number' && Number.isFinite(v) && v>=0 && v<=100;
function simulate(packet, pref) {
  if (!Array.isArray(pref)||pref.length!==5||pref.some(v=>![-5,0,5].includes(v))) throw Error('Invalid preferences');
  if(packet.status!=='AUTO_GENERATED_READY_FOR_HUMAN_GATE'||packet.canonical_input?.system!=='WPA Journal Live'||packet.human_gate?.state!=='PENDING'||packet.boundaries?.automatic_external_publication!==false) throw Error('Human Gate / upstream contract');
  const generated=Date.parse(packet.generated_at);
  if(!Number.isFinite(generated)||generated>now||generated<now-8*3600000) throw Error('Stale or future packet');
  if(!Array.isArray(packet.items)||packet.items.length<3||packet.items.length>10) throw Error('Invalid evidence count');
  const seen=new Set();
  const rows=packet.items.map((item,i)=>{
    const d=domains.indexOf(item.domain), url=new URL(item.original_url);
    if(d<0||!['http:','https:'].includes(url.protocol)||!url.hostname||url.username||url.password||seen.has(item.original_url)||!item.source||!item.verification_status||!item.title)throw Error('Invalid or duplicate evidence');
    seen.add(item.original_url);
    const date=Date.parse(item.published_at);
    if(!Number.isFinite(date)||date>generated||date<generated-48*3600000)throw Error('Evidence freshness');
    if(![item.score,item.relevance_score,item.source_confidence].every(valid)||Math.min(item.relevance_score,item.source_confidence)<65)throw Error('Evidence score floor');
    return {domain:item.domain,source:item.source,source_url:item.original_url,verification_status:item.verification_status,upstream_rank:i+1,base_score:item.score,adjustment:pref[d],routing_score:item.score+pref[d],specialist_candidate:routes[d],authority:'HG1_PREPARATION_ONLY'};
  });
  if(new Set(rows.map(x=>x.domain)).size<2||new Set(rows.map(x=>x.source.trim().toLowerCase())).size<2)throw Error('Diversity floor');
  rows.sort((a,b)=>b.routing_score-a.routing_score||a.upstream_rank-b.upstream_rank);
  return {version:'0.2.0-rc1',status:'SYNTHETIC_SHADOW_ONLY',human_gate:'PENDING',external_actions:false,provider_calls:false,profile_storage:false,source_verification_performed:false,items:rows};
}
function scenario(name) {
 const p=fixture();
 switch(name){case 'normal':break;case 'stale':p.generated_at=new Date(now-9*3600000).toISOString();break;case 'confidence':p.items[0].source_confidence=64;break;case 'duplicate':p.items[0].original_url=p.items[1].original_url;break;case 'gate':p.human_gate.state='APPROVED';break;case 'external':p.boundaries.automatic_external_publication=true;break;case 'missing':delete p.items[0].source;break;default:throw Error('Unknown scenario');}
 return p;
}
function selfTest(){
 const neutral=simulate(fixture(),[0,0,0,0,0]), adjusted=simulate(fixture(),[-5,0,0,0,5]);
 if(neutral.items[0].domain!=='protocol'||adjusted.items[0].domain!=='communicology'||adjusted.items.length!==5||adjusted.human_gate!=='PENDING'||adjusted.external_actions||adjusted.provider_calls||adjusted.profile_storage||adjusted.items.some(x=>x.verification_status!=='candidate'))throw Error('Positive assertion failed');
 for(const name of ['stale','confidence','duplicate','gate','external','missing']){
   let blocked=false;try{simulate(scenario(name),[0,0,0,0,0]);}catch(e){blocked=true;}
   if(!blocked)throw Error('Negative scenario escaped: '+name);
 }
 let invalid=false;try{simulate(fixture(),[99,0,0,0,0]);}catch(e){invalid=true;}if(!invalid)throw Error('Invalid preference escaped');
 return 'PASS: neutral ranking, priority shift, retained evidence and boundaries; 7 rejection cases';
}
if(typeof module!=='undefined'&&module.exports){module.exports={simulate,scenario,selfTest};if(require.main===module)console.log(selfTest());return;}
const $=id=>document.getElementById(id);
const controls=domains.map((d,i)=>{const el=document.createElement('select');el.id=d;for(const [v,t] of [[-5,'−5 · Less'],[0,'0 · Neutral'],[5,'+5 · More']]){const op=document.createElement('option');op.value=v;op.textContent=t;el.append(op);}el.value='0';const lab=document.createElement('label');lab.htmlFor=d;lab.textContent=labels[i];lab.append(el);$('preferences').append(lab);return el;});
let result=null;
function run(){
 result=null;$('export').disabled=true;$('rows').replaceChildren();
 try {
   result=simulate(scenario($('scenario').value),controls.map(el=>Number(el.value)));
   for(const [i,r] of result.items.entries()){const tr=document.createElement('tr');for(const text of [i+1,labels[domains.indexOf(r.domain)],r.base_score,r.adjustment,r.routing_score,r.specialist_candidate,r.verification_status]){const td=document.createElement('td');td.textContent=text;tr.append(td);} $('rows').append(tr);}
   $('status').textContent='PASS · Synthetic candidate · Human Gate PENDING';$('export').disabled=false;
 } catch(e){$('status').textContent='BLOCKED · '+e.message+' · No output';}
}
$('run').addEventListener('click',run);
$('reset').addEventListener('click',()=>{for(const el of controls)el.value='0';$('scenario').value='normal';run();});
$('test').addEventListener('click',()=>{try{$('test-result').textContent=selfTest();}catch(e){$('test-result').textContent='FAIL: '+e.message;}});
$('export').addEventListener('click',()=>{if(!result)return;const blob=new Blob([JSON.stringify(result,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='wpa-playground-synthetic.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
for(const el of [...controls,$('scenario')])el.addEventListener('change',()=>{result=null;$('export').disabled=true;$('rows').replaceChildren();$('status').textContent='Run required · Потребен е нов тест';});
run();
})();

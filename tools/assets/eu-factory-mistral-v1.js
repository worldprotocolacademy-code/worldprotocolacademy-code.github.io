/* WPA Mistral specialist mission preparation v1 - zero external model execution in browser */
(function(){'use strict';
function $(id){return document.getElementById(id)}
var registry=null,active={projectTitle:'Not supplied',projectKind:'general',callId:'UNVERIFIED',callUrl:'',tags:[]},packets=[];
function element(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function makePacket(role){return {
  schema:'wpa-eu-mistral-mission-packet/1',createdAt:new Date().toISOString(),
  missionId:role.id,missionName:role.name,provider:'Mistral AI',
  status:'PREPARED_NOT_EXECUTED',sourceClassification:'OFFICIAL_PUBLIC_ONLY_NOT_PRIVATE_PROJECT_INPUT',
  project:{title:active.projectTitle,kind:active.projectKind,tags:active.tags.slice(0,15)},
  call:{id:active.callId,officialUrl:active.callUrl},
  task:role.scope,requiredOutput:role.deliverable,checks:role.checklist,
  guardrails:['No user-uploaded document sent from this page','No invented legal status, consortium, dates, awards, signatures or fees','Only official call source version can establish eligibility','No legal advice or GDPR-compliance certification','Human Gate before any submission or contract'],
  execution:{mode:'SERVER_SIDE_ONLY',requires:'Authorized API key, configured model, public-source clearance, explicit live consent',executed:false},
  output:null};}
function buildAll(){if(!registry)return;packets=registry.roles.map(makePacket);
 $('mistralMissionStatus').textContent='Three specialist tasks PREPARED (not executed); public project metadata only. Configure a server adapter to call Mistral.';
 $('mistralMissionExport').disabled=false;}
function download(){if(!packets.length)return;var text=JSON.stringify({schema:'wpa-eu-mistral-workpacket/1',packets:packets},null,2);
 var u=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));var a=element('a');a.href=u;a.download='wpa-eu-mistral-three-specialists-not-executed.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},1000)}
function render(){var container=$('mistralMissionList');if(!container)return;container.textContent='';registry.roles.forEach(function(role){
 var card=element('article','mistral-role');card.appendChild(element('strong','',role.name));card.appendChild(element('p','secondary',role.scope));
 var task=element('small','',role.deliverable);card.appendChild(task);card.appendChild(element('div','mistral-state','PREPARED / API NOT VERIFIED'));
 container.appendChild(card);});}
function boot(){if(!$('mistralMissionPanel'))return;
 document.addEventListener('wpa-eu-analysis-ready',function(e){var d=e.detail||{};
  active={projectTitle:String(d.projectTitle||'Not supplied').slice(0,160),projectKind:String(d.projectKind||'general'),
    callId:String(d.callId||'UNVERIFIED'),callUrl:/^https:\/\//i.test(d.callUrl||'')?String(d.callUrl).slice(0,500):'',
    tags:Array.isArray(d.tags)?d.tags.filter(s=>typeof s==='string').slice(0,20):[]};buildAll();});
 $('mistralMissionExport').addEventListener('click',download);
 fetch('/data/eu-application-factory/mistral-specialists-v1.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(function(d){
  if(d.schema!=='wpa-eu-mistral-specialists/1.0'||!Array.isArray(d.roles)||d.roles.length!==3||new Set(d.roles.map(x=>x.id)).size!==3)throw Error('Invalid mission manifest');
  registry=d;render();buildAll();}).catch(function(err){$('mistralMissionStatus').textContent='Role registry unavailable: '+err.message;});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
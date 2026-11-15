/* WPA EU Application Factory / WPAWS17 + Council80 read-only bridge v1.
 * Maps *registered roles* to grant preparation tasks; does not execute AI providers.
 * Canonical sources: /agents.json and /data/wpa-ai-council-80.json.
 * No keys, no external requests, no user data upload, no side effects beyond local export.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WPAEUWpawsBridge = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var SCHEMA = 'wpa-eu-factory-wpaws-work-packet/1.0';
  var MISSIONS = {
    media_literacy: {
      label: 'CIVIC SIGNAL / media literacy',
      callId: 'CREA-CROSS-2027-MEDIALITERACY',
      officialUrl: 'https://digital-strategy.ec.europa.eu/en/funding/call-proposals-cross-border-media-literacy-2027',
      roleIds: [2, 3, 4, 5, 7, 8, 9, 10, 14, 15, 16, 17],
      pillars: ['public_relations', 'communicology', 'diplomacy'],
      checkpoints: ['Verify legal applicant and 3-country consortium', 'Document cross-border media literacy needs and baselines', 'Design adult education and disinformation-resilience activities', 'Document co-funding; no award claim']
    },
    journal: {
      label: 'WPA Journal / international research dissemination',
      callId: 'CALL_UNSELECTED',
      officialUrl: 'https://worldprotocolacademy.mk/journal/index.html',
      roleIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 14, 15, 16, 17],
      pillars: ['public_relations', 'communicology', 'diplomacy'],
      checkpoints: ['Verify exact EU call and eligible project outputs', 'Preserve independent peer review and COI policy', 'Separate grant-funded action from regular journal expenses', 'Confirm legal applicant and partner evidence']
    },
    conference: {
      label: 'Ohrid Protocol Conference 2027',
      callId: 'CALL_UNSELECTED',
      officialUrl: 'https://worldprotocolacademy.mk/',
      roleIds: [2, 3, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      pillars: ['protocol', 'diplomacy', 'public_relations', 'communicology'],
      checkpoints: ['Verify funding decision before Spring 2027 event window', 'Confirm legal contracting entity and partners', 'Complete quotation-based budget bridge', 'Do not reserve venue or promise speakers without human approval']
    }
  };
  var TASKS = {
    1: 'Check long-form document coverage and separate project evidence from author claims.',
    2: 'Review needs analysis, evidence, counterarguments and theory of change.',
    3: 'Standardise grant vocabulary and preserve meanings across languages.',
    4: 'Check citations, official call references and provenance; no invented sources.',
    5: 'Review proposal method and evidence from an independent evaluator perspective.',
    6: 'Flag integrity / attribution risks without claiming a plagiarism clearance.',
    7: 'Draft an independent, factual dissemination and public communications plan.',
    8: 'Convert the concept to work packages, outputs, milestones and dependencies.',
    9: 'Check cross-agent consistency, acceptance criteria and Human Gate.',
    10: 'Design concept architecture and a defensible intervention logic.',
    11: 'Apply diplomatic/state protocol controls where event activities require them.',
    12: 'Design international cooperation and diplomatic partner-role options.',
    13: 'Check non-operational safety, accessibility and security boundaries.',
    14: 'Audit project/product/protocol logic with independently checkable indicators.',
    15: 'Improve language and style without changing facts or programme claims.',
    16: 'Edit the application for clarity, sources and internal consistency.',
    17: 'Verify WPA doctrine and human institutional responsibility are preserved.'
  };
  function validateRegistries(agents, council) {
    if (!agents || !Array.isArray(agents.agents) || agents.agents.length !== 17 || Number(agents.agent_count) !== 17) {
      throw new Error('WPAWS registry must contain exactly 17 canonical roles');
    }
    var ids = agents.agents.map(function(a){return Number(a.number);});
    if (new Set(ids).size !== 17 || ids.some(function(i){return i < 1 || i > 17;})) {
      throw new Error('WPAWS role identity mismatch');
    }
    if (!council || !Array.isArray(council.pillars) || council.pillars.length !== 10 || !council.seat_policy) {
      throw new Error('Council-80 registry missing its ten pillars and seat policy');
    }
    var seats=council.pillars.reduce(function(n,p){return n+Number(p.seats||0);},0);
    if (seats !== 80 || Number(council.seat_policy.total_seats) !== 80) throw new Error('Council capacity mismatch');
    if(council.seat_policy.default_activation_status!=='pending_approved_directive') throw new Error('Unexpected Council activation policy');
    return {executiveRoles:17,tacticalSeatCapacity:80,pillars:10,providerConnectivity:'UNVERIFIED'};
  }
  function buildPlan(agents,council,mission,idea,now) {
    var summary = validateRegistries(agents,council);
    var cfg=MISSIONS[mission];
    if (!cfg) throw new Error('Unknown grant mission');
    var selection=cfg.roleIds.map(function(id){
      var a=agents.agents.find(function(x){return Number(x.number)===id;});
      if(!a) throw new Error('Agent role missing: '+id);
      return {agentNumber:id,canonicalName:a.name,defaultMotor:a.default_motor||'UNVERIFIED',
        task:TASKS[id],state:'TASK_PLANNED_NOT_EXECUTED',source:'/agents.json'};
    });
    var capabilities=cfg.pillars.map(function(id){
      var pillar=council.pillars.find(function(p){return p.id===id;});
      if(!pillar) throw new Error('Missing council pillar: '+id);
      return {pillarId:id,name:pillar.name_en,seatPrefix:pillar.seat_prefix,
        seatCapacity:pillar.seats,state:'CAPACITY_ONLY_NOT_ACTIVATED',source:'/data/wpa-ai-council-80.json'};
    });
    var text=String(idea||'').trim().slice(0,5000);
    return {
      schema:SCHEMA,version:'1.0.0',generatedAt:now||new Date().toISOString(),
      executionState:'PLAN_CREATED_NO_AGENTS_EXECUTED',
      noProviderCalls:true,noSubmission:true,privateDataTransferred:false,
      roleRegistryStatus:agents.status||'UNVERIFIED',councilStatus:council.seat_policy.default_activation_status,
      sourceRefs:['/agents.json','/data/wpa-ai-council-80.json'],
      mission:{id:mission,label:cfg.label,callId:cfg.callId,officialUrl:cfg.officialUrl},
      projectBrief:text||'NO_PROJECT_BRIEF_SUPPLIED',
      roleSummary:summary,executiveWorkPlan:selection,tacticalCapacity:capabilities,
      checkpoints:cfg.checkpoints,
      humanGate:'Any real API call, external outreach, partner commitment, contract, financial obligation or grant Submit requires separate authorised control.',
      note:'This JSON is a real, locally generated ROLE ROUTING TASK PACK. It is NOT evidence of AI execution, eligibility, award or submission.'
    };
  }
  function initBrowser() {
    if(typeof document==='undefined')return;
    var panel=document.getElementById('wpawsGrantBridge');
    if(!panel)return;
    var status=document.getElementById('wpawsBridgeStatus');
    var output=document.getElementById('wpawsBridgeResults');
    var btn=document.getElementById('wpawsBridgePlan');
    var exportBtn=document.getElementById('wpawsBridgeDownload');
    var select=document.getElementById('wpawsBridgeMission');
    var registries=null,packet=null;
    function add(tag,txt,cl){var node=document.createElement(tag);node.textContent=txt;if(cl)node.className=cl;output.appendChild(node);return node;}
    function render(p){output.textContent='';add('h3','План на задачи · '+p.mission.label);
      add('p','Статус: ПЛАН · '+p.executiveWorkPlan.length+' избрани WPAWS улоги · '+p.tacticalCapacity.reduce(function(n,x){return n+x.seatCapacity;},0)+' места од Council-80 како ограничен капацитет. Ниту една AI задача не е извршена.');
      p.executiveWorkPlan.forEach(function(r){add('p','#'+r.agentNumber+' '+r.canonicalName+' — '+r.task);});
      add('h3','Области во Council-80 (само капацитет)');
      p.tacticalCapacity.forEach(function(x){add('p',x.name+' · '+x.seatCapacity+' места · за активирање е потребен одобрен мандат.');});
      add('p','Човечка порта: '+p.humanGate,'secondary');
    }
    Promise.all([
      fetch('/agents.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw Error('WPAWS '+r.status);return r.json();}),
      fetch('/data/wpa-ai-council-80.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw Error('Council80 '+r.status);return r.json();})
    ]).then(function(a){validateRegistries(a[0],a[1]);registries=a;
      status.textContent='Потврдени 17 улоги во WPAWS и 80 контролирани места во Council-80. Надворешните API-врски не се потврдени.';
      btn.disabled=false;
    }).catch(function(e){status.textContent='ROUTING UNAVAILABLE: '+e.message+'; no agents started.';});
    btn.addEventListener('click',function(){if(!registries)return;
      try{var text=document.getElementById('idea');packet=buildPlan(registries[0],registries[1],select.value,text?text.value:'');
        render(packet);exportBtn.disabled=false;status.textContent='Работниот план е создаден локално. Нема повикување провајдери; задачите чекаат овластено извршување.';
      }catch(e){status.textContent='ROUTING BLOCKED: '+e.message;}
    });
    exportBtn.addEventListener('click',function(){if(!packet)return;
      var blob=new Blob([JSON.stringify(packet,null,2)+'\n'],{type:'application/json;charset=utf-8'});
      var url=URL.createObjectURL(blob);var a=document.createElement('a');
      a.download='wpa-eu-wpaws-'+packet.mission.id+'-workplan.json';a.href=url;document.body.appendChild(a);a.click();
      window.setTimeout(function(){URL.revokeObjectURL(url);a.remove();},700);
    });
    var demo=document.getElementById('civicSignalDemo');
    if(demo)demo.addEventListener('click',function(){
      var idea=document.getElementById('idea');if(idea)idea.value='CIVIC SIGNAL: European cross-border media literacy and public communication initiative to help adults distinguish accurate reporting, AI-generated content and disinformation. Develop independent educational videos, public workshops and multilingual learning resources with partners across three Creative Europe countries. Working budget 299,600 EUR is an illustrative proposal, NOT an awarded grant.';
      select.value='media_literacy';
      var find=document.getElementById('findGrant');if(find)find.click();
    });
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initBrowser,{once:true});
    else initBrowser();
  }
  return {SCHEMA:SCHEMA,MISSIONS:MISSIONS,TASKS:TASKS,validateRegistries:validateRegistries,buildPlan:buildPlan};
});
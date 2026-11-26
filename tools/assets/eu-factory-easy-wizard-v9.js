/* WPA EU Factory v9 - plain-language, one-question-at-a-time applicant guidance.
 * This is a local preparation tool, not a government portal, agent, or submission.
 * No API calls; any existing EU Factory v5 analysis runs locally. */
(function(root, factory) {
  'use strict';
  var api=factory();
  if (typeof module==='object' && module.exports) module.exports=api;
  if (root) root.WPAEUEasyWizard=api;
  if (typeof document!=='undefined') {
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',api.mount,{once:true});
    else api.mount();
  }
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  var CATEGORY={farm:'земјоделство',business:'мал бизнис',education:'образование и обука',media:'медиуми и јавна комуникација',conference:'конференција',other:'друга идеја'};
  var OFFICIAL={
    farm:[
      {name:'ИПАРД · официјални прашања и правила',url:'https://ipard.gov.mk/mk/cpp/'},
      {name:'Агенција · ИПАРД јавни повици',url:'https://www.ipardpa.gov.mk/en/Home/Ipard/5'},
      {name:'Агенција · Рурален развој 2026 (национална програма)',url:'https://www.ipardpa.gov.mk/mk/Home/RuralenRazvoj/11'}
    ],
    other:[{name:'ЕУ · Funding & Tenders Portal',url:'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home'}]
  };
  var STORAGE='wpa-eu-easy-v9-draft';
  var RETENTION_MS=30*24*60*60*1000;
  function t(v){return String(v==null?'':v).trim();}
  function validCategory(c){return Object.prototype.hasOwnProperty.call(CATEGORY,c);}
  function validate(step,input){
    if(step===0&&!validCategory(input.category))return 'Избери една од понудените области.';
    if(step===1&&t(input.idea).length<8)return 'Кажи барем неколку зборови што сакаш да направиш.';
    if(step===2){
      if(t(input.budget)&&(!/^\d+(?:[.,]\d{1,2})?$/.test(t(input.budget))||!Number.isFinite(Number(t(input.budget).replace(',','.')))||Number(t(input.budget).replace(',','.'))<=0))return 'Внеси позитивна сума или остави празно ако не знаеш.';
      if(input.currency!=='EUR'&&input.currency!=='MKD')return 'Избери денари или евра.';
    }
    return '';
  }
  function payload(input){
    var cat=validCategory(input.category)?input.category:'other';
    var idea=t(input.idea);
    var num=t(input.budget);
    var amount=num?Number(num.replace(',','.')):null;
    return {
      schema:'wpa-eu-easy-project-brief/1',version:'9.0.0',
      status:'DRAFT_NOT_SUBMITTED_NOT_ELIGIBILITY_VERIFIED',
      category:cat,categoryLabel:CATEGORY[cat],description:idea,
      applicantType:t(input.applicant)||'unknown',applicantStatus:'USER_DECLARED_UNVERIFIED',
      estimatedBudget:{amount:Number.isFinite(amount)?amount:null,currency:input.currency==='EUR'?'EUR':'MKD',source:'USER_ESTIMATE_UNVERIFIED'},
      officialSources:cat==='farm'?OFFICIAL.farm:OFFICIAL.other,
      mandatoryChecks:[
        'Најди конкретен тековен јавен повик и провери го рокот кај надлежната агенција.',
        'Провери ја мерката, правната регистрација и условите за твојата инвестиција.',
        'Прибери само документите што конкретниот повик ги бара; понуди и финансиски докази според упатството.',
        'Провери сопствено учество, прифатливи трошоци, начинот на исплата и роковите.',
        'Одобри ги точните податоци и поднеси само преку овластениот официјален канал.'
      ],
      humanGate:'NO_SUBMISSION_OR_FINANCIAL_COMMITMENT_NO_AWARD_GUARANTEE'
    };
  }
  function makeIdea(input){
    var p=payload(input);
    return 'Област: '+p.categoryLabel+'.\n'+p.description+'\nПроценет буџет: '+(p.estimatedBudget.amount===null?'не знам':p.estimatedBudget.amount+' '+p.estimatedBudget.currency)+'.\nСтатус на апликант (самопријавен, непотврден): '+p.applicantType+'.';
  }
  function makeText(input){
    var p=payload(input);
    return ['МОЈ ПОЧЕТЕН ГРАНТ-ПЛАН · WPA EU APPLICATION FACTORY v9',
      'Статус: НАЦРТ, НЕПОДНЕСЕНО, НЕПОТВРДЕНА ПОДОБНОСТ',
      '', 'Област: '+p.categoryLabel,
      'Идеја: '+(p.description||'не е внесена'),
      'Апликант: '+p.applicantType+' (кажано од корисник, не е потврдено)',
      'Приближна цена: '+(p.estimatedBudget.amount===null?'не знам':p.estimatedBudget.amount+' '+p.estimatedBudget.currency+' (непроверена проценка)'),
      '', 'ШТО СЛЕДУВА:',...p.mandatoryChecks.map((x,i)=>(i+1)+'. '+x),
      '', 'ОФИЦИЈАЛНИ ИЗВОРИ:',...p.officialSources.map(x=>x.name+' — '+x.url),
      '', 'Важно: Ова НЕ Е официјален образец. Успех, одобрување, висина на грант, подобност или поднесување не се гарантираат.',
      'Не внесувај лични документи, матичен број или лозинки.'].join('\n');
  }
  function mount(){
    var d=document, wizard=d.getElementById('easyWizard');
    if(!wizard||wizard.dataset.bound==='true')return;
    wizard.dataset.bound='true';
    var el=id=>d.getElementById(id),step=0,pending=false,packet=null,hasAnalysis=false;
    var steps=Array.from(wizard.querySelectorAll('[data-easy-step]'));
    function current(){return {
      category: (d.querySelector('input[name="easyCategory"]:checked')||{}).value||'',
      idea:el('easyIdea').value,applicant:el('easyApplicant').value,
      budget:el('easyBudget').value,currency:el('easyCurrency').value
    };}
    function error(text){el('easyError').textContent=text||'';}
    function saveMessage(text){el('easySaveMessage').textContent=text;}
    function go(s){step=Math.max(0,Math.min(3,s));
      steps.forEach((n,i)=>{n.hidden=i!==step;});
      el('easyProgress').textContent=step===3?'Почетен план':'Чекор '+(step+1)+' од 3';
      el('easyBack').hidden=step===0;
      el('easyNext').hidden=step===3;
      el('easyNext').textContent=step===2?'Подготви го мојот план →':'Продолжи →';
      error('');
      steps[step].focus({preventScroll:true});
    }
    function officialLinks(input){
      var list=payload(input).officialSources;
      var holder=el('easyOfficialRoutes');holder.replaceChildren();holder.hidden=false;
      var heading=d.createElement('strong');heading.textContent='Провери ги официјалните јавни повици:';holder.appendChild(heading);
      var ul=d.createElement('ul');
      list.forEach(item=>{var li=d.createElement('li');var a=d.createElement('a');a.textContent=item.name;a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';li.appendChild(a);ul.appendChild(li);});
      holder.appendChild(ul);
    }
    function renderResult(input,meta){
      packet=payload(input);hasAnalysis=Boolean(meta?.hasAnalysis);
      var p=packet;
      var body='Твојата идеја: '+p.description+'\n\n';
      body+='Приближна цена: '+(p.estimatedBudget.amount===null?'не знам':p.estimatedBudget.amount+' '+p.estimatedBudget.currency)+'\n';
      body+='Тип на апликант: '+(p.applicantType==='unknown'?'не знам':p.applicantType)+' (непроверено)\n\n';
      body+=(hasAnalysis?'✅ Подготвена е локална анализа и работно досие подолу.':'ℹ️ Ова е почетен план; автоматската анализа на извори не е потврдена.')+'\n';
      body+='\nПРЕД ОФИЦИЈАЛНО ПОДНЕСУВАЊЕ:\n'+p.mandatoryChecks.map((x,i)=>(i+1)+'. '+x).join('\n');
      if(p.applicantType==='individual'||p.applicantType==='unregistered')body+='\n\nАко повикот бара правен субјект, оваа форма не е подобен директен апликант. Види ја личната експертска и партнерска патека во v10 модулот.';
      if(p.category==='farm')body+='\n\nИПАРД е програмска можност, НЕ доказ за тековен отворен повик. Националната програма е посебен извор.';
      el('easyOutcome').textContent=body;
      officialLinks(input);go(3);
    }
    function generate(){
      var input=current();var reason=validate(2,input);if(reason){error(reason);return;}
      // Keep the actual user's need as the dossier narrative, not UI wrapper metadata.
      el('idea').value=input.idea.trim();
      el('idea').dispatchEvent(new Event('input',{bubbles:true}));
      el('idea').dataset.wpaCategory=input.category;
      var map={farm:'farm',individual:'individual',unregistered:'unregistered',company:'company',ngo:'ngo',public_body:'public_body',unknown:'unknown'};
      el('legalType').value=map[input.applicant]||'unknown';
      el('easyNext').disabled=true;el('easyNext').textContent='Се проверува…';pending=true;
      // The existing engine uses a dated public-source register. No private data or keys leave this page.
      var settled=false;
      var listener=function(){settled=true;pending=false;el('easyNext').disabled=false;d.removeEventListener('wpa-eu-analysis-ready',listener);renderResult(input,{hasAnalysis:true});};
      // The analysis event is emitted asynchronously after loading the official-source snapshot.
      d.addEventListener('wpa-eu-analysis-ready',listener,{once:true});
      el('findGrant').click();
      setTimeout(function(){
        if(settled)return;
        d.removeEventListener('wpa-eu-analysis-ready',listener);pending=false;el('easyNext').disabled=false;
        renderResult(input,{hasAnalysis:false});
        error('Дел од автоматската анализа не се вчита. Планот е зачуван како нацрт. Провери ги официјалните линкови.');
      },8000);
    }
    el('easyNext').addEventListener('click',function(){if(pending)return;var input=current();var msg=validate(step,input);if(msg){error(msg);return;}if(step===2)generate();else go(step+1);});
    el('easyBack').addEventListener('click',function(){if(pending)return;go(step-1);});
    el('easyDownload').addEventListener('click',function(){
      var contents='\ufeff'+makeText(current());var blob=new Blob([contents],{type:'text/plain;charset=utf-8'});
      var url=URL.createObjectURL(blob),a=d.createElement('a');a.href=url;a.download='moj-grant-plan-WPA.txt';d.body.appendChild(a);a.click();
      setTimeout(function(){URL.revokeObjectURL(url);a.remove();},1000);
    });
    el('easyFullAnalysis').addEventListener('click',function(){el('resultsPanel').scrollIntoView({behavior:'smooth',block:'start'});});
    el('easySave').addEventListener('click',function(){
      try{window.localStorage.setItem(STORAGE,JSON.stringify({expires:Date.now()+RETENTION_MS,data:current(),step:Math.min(step,2)}));
        saveMessage('Зачувано само во овој прелистувач. Не е испратено никому; ќе истече за 30 дена.');
      }catch(ex){saveMessage('Не можам да зачувам на овој уред. Преземи текстуален план наместо тоа.');}
    });
    el('easyLoad').addEventListener('click',function(){
      try{var raw=window.localStorage.getItem(STORAGE),stored=raw&&JSON.parse(raw);
        if(!stored||stored.expires<Date.now()){if(raw)window.localStorage.removeItem(STORAGE);saveMessage('Нема важечка зачувана пријава на овој уред.');return;}
        var x=stored.data||{};
        var radio=d.querySelector('input[name="easyCategory"][value="'+(validCategory(x.category)?x.category:'other')+'"]');if(radio)radio.checked=true;
        el('easyIdea').value=t(x.idea);el('easyApplicant').value=['farm','individual','unregistered','company','ngo','public_body','unknown'].includes(x.applicant)?x.applicant:'unknown';
        el('easyBudget').value=t(x.budget);el('easyCurrency').value=x.currency==='EUR'?'EUR':'MKD';go(stored.step||0);
        saveMessage('Продолжи од зачуваниот чекор. Правилата и роковите на повиците сепак мора повторно да се проверат.');
      }catch(ex){saveMessage('Зачуваното не може да се вчита. Можеш да почнеш одново.');}
    });
    el('easyForget').addEventListener('click',function(){try{window.localStorage.removeItem(STORAGE);saveMessage('Зачуваната копија на овој уред е избришана.');}catch(ex){saveMessage('Не можам да го избришам записот во оваа сесија.');}});
    go(0);
  }
  return {CATEGORY:CATEGORY,validate:validate,payload:payload,makeIdea:makeIdea,makeText:makeText,mount:mount};
});
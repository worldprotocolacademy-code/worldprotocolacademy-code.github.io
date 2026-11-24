/* WPA EU Application Factory v5: deterministic, evidence-guarded workbench.
 * No API keys, no remote AI, no fake statuses. Exposes a UMD-style testable core.
 * Official EU source index is a dated snapshot and must be refreshed independently. */
(function(root, make) {
  var lib = make();
  if (typeof module === 'object' && module.exports) module.exports = lib;
  if (root) root.WPAEUFactoryCore = lib;
})(typeof window !== 'undefined' ? window : null, function() {
  'use strict';
  var VERSION = '5.0.0';
  // The snapshot date belongs in registry. Assessment time must advance with Skopje's calendar.
  function localToday(now){
    var date = now instanceof Date ? now : (now ? new Date(now) : new Date());
    if(!Number.isFinite(date.getTime())) throw new Error('Invalid assessment date');
    var parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Skopje',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    var get = function(key){return parts.find(function(p){return p.type===key;}).value;};
    return get('year')+'-'+get('month')+'-'+get('day');
  }
  function snapshotAgeDays(verifiedAsOf,today){
    var asOf=toDate(verifiedAsOf),current=toDate(today)||localToday();
    if(!asOf) return null;
    var days=Math.floor((Date.parse(current+'T00:00:00Z')-Date.parse(asOf+'T00:00:00Z'))/86400000);
    return Number.isFinite(days)?days:null;
  }
  var TAG_RULES = {
    conference: [/конференц/i,/conference/i,/форум/i,/forum/i,/симпозиум/i,/symposium/i,/самит/i],
    journal: [/журнал/i,/journal/i,/списание/i,/publishing/i,/публикац/i,/peer.review/i,/open.access/i],
    media_literacy: [/media literacy/i,/медиумск. писменост/i,/critical thinking/i,/критичк. размислува/i,/information integrity/i],
    journalism: [/journalis/i,/новинар/i,/news media/i,/newsroom/i,/известувањ/i],
    public_communication: [/public relations/i,/public communication/i,/односи со јавност/i,/јавна комуникац/i,/комуниколог/i,/communicolog/i,/PR campaign/i],
    disinformation: [/disinformation/i,/misinformation/i,/дезинформац/i,/fact.check/i,/проверка на факти/i],
    education: [/образова/i,/education/i,/учењ/i,/learning/i,/обука/i,/training/i,/course/i,/курс/i,/youth/i,/млади/i,/student/i],
    research: [/истражува/i,/research/i,/наук/i,/science/i,/академ/i,/academic/i],
    diplomacy: [/дипломат/i,/diplomac/i,/протокол/i,/protocol/i,/foreign affairs/i],
    digital: [/дигитал/i,/digital/i,/software/i,/софтвер/i,/платформ/i,/platform/i,/интелигенц/i,/artificial intelligence/i,/\bAI\b/i,/\bВИ\b/i],
    civic: [/демократ/i,/democra/i,/граѓан/i,/citizen/i,/учество/i,/participation/i,/civil society/i,/невладин/i],
    equality: [/инклуз/i,/inclusion/i,/еднакв/i,/equality/i,/дискриминац/i,/discrimination/i],
    public_administration: [/јавна администрац/i,/public administration/i,/државн/i,/public authority/i,/министерств/i,/municipal/i,/општин/i],
    health: [/здравств/i,/health/i,/medical/i,/patient/i,/пациент/i,/medicare/i],
    agriculture: [/земјодел/i,/agricultur/i,/farm/i,/фарм/i,/ipard/i,/рурал/i],
    security: [/безбедност/i,/security/i,/defen[cs]e/i],
    international: [/меѓународ/i,/international/i,/европ/i,/europe/i,/cross.border/i,/прекугранич/i],
    towns: [/општин/i,/municipal/i,/town/i,/city network/i],
    rights: [/прав[ао]/i,/rights/i,/human right/i],
    values: [/вредност/i,/values/i]
  };
  function text(v) { return String(v === null || v === undefined ? '' : v).trim(); }
  function toDate(v) { var t=text(v); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : ''; }
  function unique(xs) { return xs.filter(function(x,i){return xs.indexOf(x)===i;}); }
  function safeName(s){return text(s).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,72)||'project';}
  function decimal(v) { var n = Number(v); return Number.isFinite(n) ? n : 0; }
  function money(n) { return new Intl.NumberFormat('en-IE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(decimal(n)) + ' EUR'; }
  function tagsFor(s) {
    return Object.keys(TAG_RULES).filter(function(k){return TAG_RULES[k].some(function(regex){return regex.test(text(s));});});
  }
  function cleanIdea(raw){
    return text(raw)
      .replace(/^Област:\s*[^.\n]{1,60}\.\s*/i,'')
      .replace(/Дај ми соодветни извори и изгради апликациско досие\.?/gi,'')
      .replace(/\nПроценет буџет:\s*[^\n]*/gi,'')
      .replace(/\nСтатус на апликант[^\n]*/gi,'')
      .trim();
  }
  function extractTitle(raw,template){
    if(template==='wpa-ohrid-2027')return 'Ohrid Protocol Conference 2027';
    if(template==='wpa-journal')return 'WPA Journal — European knowledge and dissemination project';
    var first=cleanIdea(raw).split(/\n+/)[0].replace(/\s+/g,' ')
      .replace(/^(сакам|sakam|i want|we want|ми треба|имам проект)\s*/i,'').trim();
    // Stop after a complete introductory sentence when present, never midword.
    var match=first.match(/^(.+?[.!?])(?:\s|$)/);
    if(match&&match[1].length>=16)first=match[1];
    if(first.length>110){
      var cut=first.slice(0,110);
      first=(cut.lastIndexOf(' ')>50?cut.slice(0,cut.lastIndexOf(' ')):cut)+'…';
    }
    return first || 'Нов проект';
  }
  function parseProject(input){
    var raw=text(input.idea),s=cleanIdea(raw),extra=text(input.sourceText),combined=(raw+'\n'+extra.slice(0,50000)).trim();
    var categoryTags={farm:'agriculture',conference:'conference',media:'journalism',education:'education',
      business:'general',other:'general'};
    var inferred=unique(tagsFor(combined).concat(categoryTags[input.projectCategory]?[categoryTags[input.projectCategory]]:[]));
    var template=(input.portfolioTemplateId==='wpa-ohrid-2027'&&/Ohrid Protocol Conference 2027/i.test(s))?
      'wpa-ohrid-2027':(input.portfolioTemplateId==='wpa-journal'&&/WPA Journal/i.test(s)?'wpa-journal':'');
    var kind=template==='wpa-ohrid-2027'||inferred.includes('conference')?'conference':
      template==='wpa-journal'||inferred.includes('journal')?'journal':
      inferred.includes('health')?'health':inferred.includes('agriculture')?'agriculture':
      inferred.includes('education')?'education':'general';
    var evidence=[];
    if(template==='wpa-ohrid-2027'){
      evidence.push({fact:'Working venue: Inex Olgica (proposal; no confirmed reservation)',status:'WPA_DEMO_SNAPSHOT_UNVERIFIED',reference:'Ohrid 2027 MASTER working dossier'});
      evidence.push({fact:'Working 150-person cost subtotal: 17,604.80 EUR, not a final eligible project budget',status:'WPA_DEMO_SNAPSHOT_UNVERIFIED',reference:'Ohrid 2027 MASTER working dossier'});
    }
    if(template==='wpa-journal') evidence.push({fact:'WPA Journal is a publishing/dissemination project asset, not automatically a legal applicant',status:'WPA_DEMO_SNAPSHOT_UNVERIFIED',reference:'WPA portfolio registry'});
    var ds=toDate(input.startDate),de=toDate(input.endDate);
    if(template==='wpa-ohrid-2027'&&!ds&&!de){ds='2027-03-01';de='2027-05-31';}
    var tagset=unique(inferred.concat(kind==='conference'?['conference']:kind==='journal'?['journal','research']:[]));
    return {
      id:kind,title:extractTitle(s||extra.slice(0,300),template),portfolioTemplateId:template,
      idea:s||extra.slice(0,2000), sourceText:extra, tags:tagset,
      country:text(input.country)||'North Macedonia',
      legalApplicant:text(input.legalApplicant), legalType:text(input.legalType)||'unknown',
      consortiumCountries:text(input.consortiumCountries), startDate:ds,endDate:de,
      customCall:text(input.customCall), customCallUrl:text(input.customCallUrl),
      sourceFileName:text(input.sourceFileName),
      knownBudgetEUR:template==='wpa-ohrid-2027'?17604.8:null,
      assumptions:template==='wpa-ohrid-2027'?['March-May 2027 is a planning window, not a reserved date.','Speakers, applicants, partners, support and project period remain unconfirmed.']:[],
      evidence:evidence
    };
  }
  function checkRoute(project,opp,asOf){
    var reasons=[], blockers=[], conditions=[], code='CONDITIONAL';
    var current=toDate(asOf)||localToday();
    if(opp.status==='OPEN_AT_SNAPSHOT'){
      if(opp.deadline&&opp.deadline<current){blockers.push('Крајниот рок поминал според датумот на проверка.');code='NO_GO';}
      else conditions.push('Отвореноста е потврдена само според архивираната проверка '+opp.verifiedAsOf+'; повторно отворете го официјалниот извор.');
    }
    if(opp.status==='INDICATIVE_2027') conditions.push('Датумите се индикативно планирање, не објавен конечен повик.');
    if(opp.status==='PROGRAMME_ROUTE') conditions.push('Програмска патека, не објавен конкретен и применлив повик за 2027.');
    if(opp.status==='DISCOVERY_ONLY') conditions.push('Нема идентификуван конкретен повик, услови, рок и буџет.');
    if(opp.status==='ROLLING_ASSISTANCE') conditions.push('TAIEX е техничка помош, не грант.');
    if(opp.status==='USER_SUPPLIED_UNVERIFIED') conditions.push('Кориснички доставен повик: линкот и условите не се независимо верификувани; нема автоматски PASS.');
    if(opp.countryEligibility==='EU_MEMBER_STATES_ONLY' && /north macedonia|macedonia|македони/i.test(project.country)) {
      blockers.push('Повикот дозволува правни апликанти само од земји-членки на ЕУ; проект со македонски апликант нема директна подобност.');code='NO_GO';
    }
    if(opp.scopeGate==='media_literacy_crossborder' && !project.tags.includes('media_literacy') && !project.tags.includes('disinformation')) {
      blockers.push('Потребна е вистинска прекугранична програма за медиумска писменост и/или отпорност на дезинформации; обична PR кампања или списание не е доволно.');code='NO_GO';
    }
    if(opp.scopeGate==='news_media_collaboration' && !project.tags.includes('journalism')) {
      blockers.push('Потребно е реално партнерство во професионалниот news-media сектор, не само академска публикација или генеричка комуникациска кампања.');code='NO_GO';
    }
    if(!project.legalApplicant) blockers.push('Не е потврдено правно лице-апликант.');
    else conditions.push('Правното лице е наведено од корисникот, но неговата правна и програмска подобност не е независно проверена.');
    if(opp.scopeGate==='intermediary_fstp' && !/(подгрантов|subgrant|financial support to third parties|intermediar)/i.test(project.idea)){
      blockers.push('Овој повик е за посредници што обезбедуваат финансиска поддршка на трети страни; проектот не покажува таков мандат.'); code='NO_GO';
    }
    if(opp.scopeGate==='town_network' && !project.tags.includes('towns')){
      blockers.push('Не е докажана реална мрежа на градови/општини.');code='NO_GO';
    }
    if(opp.scopeGate==='equality_action' && !project.tags.includes('equality')){
      blockers.push('Проектот нема директен акциски фокус на еднаквост/недискриминација.');code='NO_GO';
    }
    if(opp.scopeGate==='public_body' && project.legalType!=='public_body'){
      blockers.push('TAIEX бара надлежен јавен орган како носител на конкретната институционална потреба.');code='NO_GO';
    }
    if(opp.scopeGate==='call_required') conditions.push('Радар патека без конкретен повик: одлука GO не е дозволена.');
    if(opp.consortiumMin && !project.consortiumCountries){
      blockers.push('Нема докажан конзорциум; пример од претходниот водич: минимум '+opp.consortiumMin+' организации од '+opp.consortiumMin+' држави, за потврда со новиот водич.');
    }
    if(project.startDate && opp.earliestAwardDate && project.startDate < opp.earliestAwardDate){
      blockers.push('Активноста започнува пред индикативниот датум на известување/одлука за финансирање ('+opp.earliestAwardDate+').');code='NO_GO_TIMING';
    }
    if(project.endDate && opp.earliestAwardDate && project.endDate < opp.earliestAwardDate){
      blockers.push('Целата активност завршува пред индикативната одлука ('+opp.earliestAwardDate+').');code='NO_GO_TIMING';
    }
    if(project.portfolioTemplateId==='wpa-ohrid-2027' && opp.id==='erasmus-2027-cooperation-route'){
      blockers.push('За настан март–мај 2027 не е докажан прифатлив период на спроведување според грантот; патеката е за идна/преместена поширока акција.');code='NO_GO_TIMING';
    }
    if(project.id==='journal'&&opp.id==='erasmus-2027-cooperation-route') conditions.push('Journal може да биде дисеминациски output на вистинско партнерство, не грант за редовни уреднички трошоци.');
    if(project.portfolioTemplateId==='wpa-ohrid-2027' && opp.id==='taiex-institutional-assistance') conditions.push('Може да се разработи само издвоена институционална работилница, не финансирање на целата конференција.');
    if(code==='CONDITIONAL' && blockers.length)code='BLOCKED';
    if(code==='CONDITIONAL' && (opp.status==='PROGRAMME_ROUTE'||opp.status==='DISCOVERY_ONLY'||opp.status==='INDICATIVE_2027'||opp.status==='USER_SUPPLIED_UNVERIFIED'))code='WATCH';
    reasons.push((opp.eligibilityRule||'').trim());
    return {status:code, reasons:reasons,blockers:unique(blockers),conditions:unique(conditions)};
  }
  function scoreRoute(project,opp,assessment){
    // Strategic relevance indicator, NOT funding eligibility/award scoring.
    var shared=(opp.topics||[]).filter(function(tag){return project.tags.indexOf(tag)>=0;});
    var strategic = Math.min(25,5+shared.length*5);
    if(project.portfolioTemplateId==='wpa-ohrid-2027'&&opp.id==='erasmus-2027-cooperation-route')strategic=23;
    if(project.id==='journal'&&opp.id==='erasmus-2027-cooperation-route')strategic=22;
    var impact=Math.min(20,5+Math.max(0,shared.length)*3);
    var readiness=project.sourceText?12:(project.id==='conference'||project.id==='journal'?10:4);
    var consortium=project.consortiumCountries?10:2;
    var budget=project.knownBudgetEUR?7:3;
    var deadline=opp.status==='OPEN_AT_SNAPSHOT'&&!/NO_GO/.test(assessment.status)?7:opp.status==='PROGRAMME_ROUTE'?4:1;
    if(/NO_GO_TIMING/.test(assessment.status))deadline=0;
    var evidence=project.evidence.length?4:1;
    var parts={strategic,impact,readiness,consortium,budget,deadline,evidence};
    var total=Object.values(parts).reduce(function(a,b){return a+b;},0);
    if(assessment.status==='NO_GO')total=Math.min(total,45);
    if(assessment.status==='NO_GO_TIMING')total=Math.min(total,49);
    return {score:total,parts:parts,shared:shared,label:'СТРАТЕГИСКИ ИНДИКАТОР — НЕ Е ПОТВРДА ЗА ПОДОБНОСТ'};
  }
  function analyze(project,registry,now){
    if(!project.idea)return {error:'Потребен е опис на проектот.'};
    var custom=project.customCall ? [{id:'user-supplied-call',programme:'Кориснички повик',title:project.customCall.slice(0,150),callId:'USER-SUPPLIED / NOT VERIFIED',status:'USER_SUPPLIED_UNVERIFIED',officialUrl:project.customCallUrl||'NOT PROVIDED',verifiedAsOf:'NOT VERIFIED',legalEntityRequired:true,topics:project.tags,eligibilityRule:'Кориснички податоци — нема преземен или проверен официјален call package. Пред GO задолжително проверете го оригиналот и сите анекси.'}] : [];
    var candidates=custom.concat(registry.opportunities).map(function(opp){
      var gate=checkRoute(project,opp,now);return {opportunity:opp,gate:gate,fit:scoreRoute(project,opp,gate)};
    });
    var order={'CONDITIONAL':0,'WATCH':1,'BLOCKED':2,'NO_GO_TIMING':3,'NO_GO':4};
    candidates.sort(function(a,b){return (a.opportunity.id==='user-supplied-call'?-1:b.opportunity.id==='user-supplied-call'?1:0)||b.fit.score-a.fit.score|| (order[a.gate.status]??5)-(order[b.gate.status]??5);});
    var assessmentDate=toDate(now)||localToday();
    var ageDays=snapshotAgeDays(registry.verifiedAsOf,assessmentDate);
    return {project:project,candidates:candidates,analyzedAt:new Date().toISOString(),assessmentDate:assessmentDate,
      sourceVerifiedAsOf:registry.verifiedAsOf,sourceSnapshotAgeDays:ageDays,sourceSnapshotStale:ageDays===null||ageDays>7||ageDays<0,
      overall:'ELIGIBILITY NOT VERIFIED — NO SUBMISSION AUTHORISED',
      note:'Фабриката изврши локална анализа врз датирани официјални извори. Нови/изменети повици не се проверени во живо во оваа сесија.'};
  }
  function objective(project){
    if(project.id==='conference')return 'Да се развијат одржливи европски образовни и професионални ресурси усогласени со опишаната тема, со конференцијата како една од активностите само ако календарот и правилата дозволуваат.';
    if(project.id==='journal')return 'Да се зајакнат мултијазичната научна дисеминација, преносот на знаење и отворените образовни ресурси преку транснационална академска соработка, со зачувана независност на рецензиите и уредувањето.';
    if(project.id==='health')return 'Да се развие мерлива рамка за дигитална здравствена писменост и безбедно користење на информативни дигитални алатки, со човечки надзор и одделување од медицинска дијагноза.';
    if(project.id==='education')return 'Да се тестира и пренесе образовен модел со меѓународна соработка, достапност и мерливи исходи за учење.';
    return 'Да се реши опишаниот проблем преку докажлива потреба, партнерска имплементација и преносливи резултати усогласени со конкретен идентификуван повик.';
  }
  function workPackages(project){
    var outputs=project.id==='conference'?[['WP1','Coordination & evidence','Проверка на европските потреби и правниот носител','Needs analysis, source register'],['WP2','Capacity & materials','Развој на образовни модули за протокол, дипломатија, дигитална комуникација','Teaching toolkit, pilot workshops'],['WP3','Knowledge exchange','Конференција само во прифатлив финансиран период; или пренесување на активноста','Forum report, attendance evidence'],['WP4','Independent dissemination','Рецензирани proceedings само по уредничка одлука; отворени материјали','Open resource pack, peer-review log'],['WP5','Impact & sustainability','Мерење на учество, применливост и одржливост','KPI report, sustainability roadmap']]:
      project.id==='journal'?[['WP1','Governance & evidence','Изворен регистар и правна подобност','Quality plan'],['WP2','European editorial collaboration','Рецензентски стандарди, COI и академска етика','Training and peer-review toolkit'],['WP3','Multilingual knowledge exchange','Мултијазични ресурси и професионално учење','Workshops and materials'],['WP4','Research dissemination','Специјално издание или proceedings само по независна рецензија','Dissemination report'],['WP5','Impact & sustainability','Аналитика за дострел и постгрантски модел','KPI and sustainability report']]:
      [['WP1','Coordination & baseline','Потреба, мандат, ризици, законит носител','Needs and baseline report'],['WP2','Design & development','Развој на предложениот пристап со проверливи цели','Methodology / prototype'],['WP3','Pilot and evaluation','Пилотирање со мерливи резултати и безбедносни ограничувања','Pilot report'],['WP4','Dissemination & scale','Отворено споделување на резултатите','Learning and dissemination pack'],['WP5','Sustainability & audit','Ревизија, дополнувања и одржување','Impact and sustainability plan']];
    return outputs.map(function(x,i){return {id:x[0],title:x[1],task:x[2],deliverable:x[3],lead:'PARTNER ROLE UNCONFIRMED',period:'M'+(1+i*3)+'–M'+Math.min(18,6+i*3)};});
  }
  function gaps(project,selection){
    var x=['Потврдено правно лице со докази за регистрација и надлежен потписник','Конкретен официјален повик/тема и финален прирачник со верзија/датум','Писмени потврди за потребните партнери и нивната улога','Конечен project-start календар во однос на рок/оценување/договор','Реален буџет, документирани понуди, евентуално кофинансирање','Податочни/етички, пристапност и публикациски правила според повикот'];
    if(project.legalApplicant)x[0]='Доставена е ознака за апликант, но официјален правен доказ и овластување се НЕПРОВЕРЕНИ.';
    if(project.id==='conference')x.push('Нова потврда за датум и услови на хотел, интерпретација, патувања, снимање и публикација.');
    if(project.id==='journal')x.push('ISSN/DOI ако е применливо, рецензентска политика, COI и редакциска независност од финансиер.');
    if(selection&&selection.gate&&selection.gate.blockers.length)x=unique(selection.gate.blockers.concat(x));
    return x;
  }
  function narrative(project,sel){
    var kind=project.id;
    var s=kind==='conference'?'Предлогот ја третира конференцијата како активност во рамки на поширок проект; финансирање не се тврди без доказ за дозволен период на спроведување.':
    kind==='journal'?'Предлогот не бара субвенција за редовна работа на списанието, туку преносливи ресурси, академска соработка и дисеминација со целосно независна рецензија.':
    'Предлогот е концепциски. Потребата, корисниците, baseline и очекуваните резултати мора да се поткрепат со докази, а не со оптимистички претпоставки.';
    return 'Предлог на апликациски наратив: '+project.title+'. '+s+' Главната цел е: '+objective(project)+' Релевантноста и очекуваните резултати мора да се усогласат со вистинскиот предмет на избраниот повик пред поднесување.';
  }
  function createDossier(analysis,selectionId){
    var project=analysis.project;var sel=analysis.candidates.find(function(c){return c.opportunity.id===selectionId;})||analysis.candidates[0];
    var opp=sel.opportunity, wps=workPackages(project), blockers=gaps(project,sel);
    var today=localToday();
    var M=function(s){return s+'\n';}; var md='';
    md+=M('# EU APPLICATION FACTORY — РАБОТНО ДОСИЕ');
    md+=M('**Верзија:** '+VERSION+' · **Изработено:** '+today+' · **Статус:** DRAFT / ELIGIBILITY NOT VERIFIED');
    md+=M('**Проект:** '+project.title+' · **Локација/држава:** '+project.country);
    md+=M('**Изворна проверка:** '+analysis.sourceVerifiedAsOf+' (датиран snapshot, НЕ live повик)\n');
    md+=M('## 1. Opportunity Brief');
    md+=M('- Програма/патека: **'+opp.programme+' — '+opp.title+'**');
    md+=M('- Референца: '+opp.callId+' · Статус: '+opp.status+' · Рок: '+(opp.deadline||'НЕПОТВРДЕНО'));
    md+=M('- Официјален извор: '+opp.officialUrl);
    md+=M('- Извор за услови (ако постои): '+(opp.rulesUrl||opp.officialUrl));
    md+=M('- Напомена: '+(opp.note||opp.avoid||'Проверете го најновиот call package.')+'\n');
    md+=M('## 2. GO / NO-GO & Eligibility Gate');
    md+=M('- Статус за патеката: **'+sel.gate.status+'**');
    md+=M('- Стратегиска соодветност (локален индикатор, НЕ official score): '+sel.fit.score+'/100');
    md+=M('- Правен апликант: '+(project.legalApplicant||'НЕПОТВРДЕН')+' (правниот статус не е независимо верификуван)');
    sel.gate.blockers.forEach(function(s){md+=M('- BLOCKER: '+s);});
    sel.gate.conditions.forEach(function(s){md+=M('- CONDITION: '+s);});md+='\n';
    md+=M('## 3. Concept Note');
    md+=M('**Потреба:** '+(project.idea.slice(0,1200)||'Потребна е корисничка дефиниција на потребата.'));
    md+=M('**Цел:** '+objective(project));
    md+=M('**Работна интервенциска логика:** проблем → потврдена европска потреба → партнерска методологија → пилот/размена → дисеминација → оценка и одржливост.\n');
    md+=M('## 4. Consortium & partner map');
    md+=M('- Applicant / coordinator: '+(project.legalApplicant||'[КАНДИДАТ ПРАВНО ЛИЦЕ — НЕПОТВРДЕНО]'));
    md+=M('- Partner 1: [европска високообразовна/обучувачка институција — предложена, не потврдена]');
    md+=M('- Partner 2: [регионален јавен/професионален/граѓански партнер според повикот — предложен, не потврден]');
    md+=M('- Countries: '+(project.consortiumCountries||'[да се потврдат во согласност со точниот повик]')+'\n');
    md+=M('## 5. Draft narrative for evaluator');md+=M(narrative(project,sel)+'\n');
    md+=M('## 6. Work package architecture');
    md+=M('| WP | Workstream | Activities | Deliverable | Responsible | Indicative period |');
    md+=M('|---|---|---|---|---|---|');
    wps.forEach(function(w){md+=M('| '+w.id+' | '+w.title+' | '+w.task.replace(/\|/g,'/')+' | '+w.deliverable+' | '+w.lead+' | '+w.period+' |');});md+='\n';
    md+=M('## 7. Deliverables & milestones');
    wps.forEach(function(w){md+=M('- '+w.id+' — '+w.deliverable+' (предлог; конкретен датум зависи од потврден grant start).');});md+='\n';
    md+=M('## 8. KPI & impact framework');
    md+=M('- Базни вредности: UNVERIFIED — потребни мерења и evidence ledger.');
    md+=M('- Предложени KPIs: број потврдени партнери; завршени пилоти/сесии; објавени отворени ресурси; надворешни корисници; повратни оценки; продолжување по грантот.');
    md+=M('- Целни вредности: TO SET AFTER BASELINE, не измислени бројки.\n');
    md+=M('## 9. Budget logic (EUR)');
    if(project.knownBudgetEUR){md+=M('- Познат quotation-based subtotal: '+money(project.knownBudgetEUR)+' (не е целосен grant budget).');
      md+=M('- Недоставени ставки: толкување, ручек, патувања, локален превоз, фото/видео, streaming, accessibility, превод, рецензија, редакција, публикација и администрaција.');
      md+=M('- Финален grant request / co-financing / финансиски обврски: **НЕПОТВРДЕНИ**.');}
    else{md+=M('- Не е доставен верификуван cost baseline; без измислени износи.');}
    md+=M('- Нема двојно финансирање меѓу конференција, списание, спонзори и ЕУ грантови.\n');
    md+=M('## 10. Evidence & provenance');
    md+=M('- Датиран официјален извор: '+opp.officialUrl+' (проверка '+opp.verifiedAsOf+').');
    project.evidence.forEach(function(e){md+=M('- '+e.status+': '+e.fact+' — '+e.reference);});
    md+=M('- Кориснички опис: USER-PROVIDED, не официјален доказ.\n');
    md+=M('## 11. Risk register');
    md+=M('| Risk | Severity | Mitigation | Owner |');md+=M('|---|---|---|---|');
    md+=M('| Eligibility / legal applicant not verified | CRITICAL | Obtain registration proof and verify exact call criteria | Human Gate |');
    md+=M('| Event/project timeline mismatch | HIGH | Reject incompatible rounds or reschedule eligible project activity | Coordinator (unconfirmed) |');
    md+=M('| Partner uncommitted | HIGH | Evidence-backed partner outreach before form declarations | Consortium lead (unconfirmed) |');
    md+=M('| Budget undercosting / double funding | HIGH | Line-item budget and grant/sponsor cost separation | Finance (unconfirmed) |');
    md+=M('| Source changes / corrigenda | MEDIUM | Recheck official page and version before submission | Eligibility reviewer |\n');
    md+=M('## 12. Ethics, GDPR, accessibility & AI');
    md+=M('- Collect only necessary participant data; adopt notice, retention and access policy appropriate to the final activity.');
    md+=M('- Accessible participation, language/interpretation plans, equality and publication consents must be documented.');
    md+=M('- AI-supported drafting remains traceable; human reviewers own eligibility, facts, conclusions and final submission.\n');
    md+=M('## 13. Dissemination, exploitation & sustainability');
    md+=M('Open, attributable resources; partner uptake; documented audience/use; post-grant owner and maintenance budget. WPA Journal editorial acceptance is NEVER guaranteed by grant funding.\n');
    md+=M('## 14. Annex / evidence checklist');
    md+=M('- Legal registration; mandates and representatives; entity/OID/PIC where actually required; partner signed commitments; CVs; verified quote/budget; eligibility matrix; grant portal forms and call annexes; data/ethics forms as applicable.\n');
    md+=M('## 15. Red-team evaluation');
    md+=M('**Decision:** NOT READY FOR SUBMISSION. Fatal blockers are listed below; no AI-generated prose can override them.');
    blockers.forEach(function(g,i){md+=M((i+1)+'. '+g);});md+='\n';
    md+=M('## 16. Human Gate');
    md+=M('No Submit, signatures, co-financing commitments, partner binding actions or hotel contracts have been performed.');
    md+=M('Human approval is necessary only after the exact official call and all eligibility/finance/ethics checks pass.\n');
    md+=M('## 17. Next actions');
    md+=M('1. Recheck latest official call package and all corrigenda; log the URL, clauses and date.');
    md+=M('2. Confirm the actual eligible applicant, partner roles, financial coverage and project period.');
    md+=M('3. Map exact published award criteria to each paragraph and rebuild budget/annexes.');
    md+=M('4. Repeat independent eligibility + red-team review before the Human Gate.\n');
    return {markdown:md,manifest:{version:VERSION,project:project.title,selectedOpportunity:opp.id,callId:opp.callId,status:'DRAFT_NOT_SUBMISSION_READY',eligibility:sel.gate.status,sourceVerifiedAsOf:analysis.sourceVerifiedAsOf,files:['application-dossier.md','application-manifest.json'],blockers:blockers},opportunity:opp,workPackages:wps,gaps:blockers};
  }
  return {VERSION:VERSION,TAG_RULES:TAG_RULES,tagsFor:tagsFor,parseProject:parseProject,checkRoute:checkRoute,scoreRoute:scoreRoute,analyze:analyze,workPackages:workPackages,createDossier:createDossier,objective:objective,safeName:safeName,money:money,localToday:localToday,snapshotAgeDays:snapshotAgeDays,cleanIdea:cleanIdea};
});
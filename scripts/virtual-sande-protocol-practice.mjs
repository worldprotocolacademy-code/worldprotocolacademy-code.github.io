/*
 * Virtual Sande Practical Protocol Studio — source-aware preparation only.
 * Public guidance is NOT binding law or an approved official ceremony plan.
 * Never invent national precedence, flag positions, anthem sequence or motorcade protection.
 */
export const VERSION='wpa-practical-protocol/0.1';
const item=(id,mk,en,mkSteps,enSteps,risk='STANDARD')=>Object.freeze({
 id,mk,en,mkSteps:Object.freeze(mkSteps),enSteps:Object.freeze(enSteps),risk
});
export const PRACTICAL_CASES=Object.freeze([
 item('flags','Знамиња и државни симболи','Flags and national symbols',[
 'Утврдете ги домаќинот, гостите, државните и организациските знамиња што треба да се прикажат.',
 'Проверете го важечкиот домашен и организациски пропис за пресеанс, размер, насока, број и редослед на знамињата.',
 'Означете на скица од чија перспектива се гледа поставката: публика, сцена или влез.',
 'Проверете ја официјалната верзија и состојба на секое знаме; надлежен протокол ја одобрува конечната поставка.'
 ],[
 'Identify host, guests, national and organisational flags involved.',
 'Check current national and organisational rules on precedence, dimensions, orientation, number and order of flags.',
 'Mark viewpoint on the plan: audience, stage or entrance.',
 'Check each official flag version and condition; competent protocol office approves the final arrangement.'
 ],'ELEVATED'),
 item('anthems','Интонирање химни','Anthem ceremonies',[
 'Проверете дали химните се предвидени за конкретната категорија на настан.',
 'Проверете официјални изведби, времетраење и дозволени форми, наместо случајни снимки.',
 'Потврдете го редоследот со надлежниот протокол; нема општоважечки редослед гостин/домаќин.',
 'Направете проба на звук, најавување, однесување и резервен технички план.'
 ],[
 'Confirm whether anthems are required for the event type.',
 'Check official authorised versions, durations and forms instead of random recordings.',
 'Confirm order with the competent protocol office; no universal guest/host order.',
 'Rehearse audio, cues, audience conduct and equipment contingency.'
 ],'ELEVATED'),
 item('precedence','Пресеанс и распоред на седење','Precedence and seating',[
 'Потврдете ги официјалните функции, титули и претставнички својства на учесниците.',
 'Разликувајте државен, дипломатски, организациски и договорен работен пресеанс.',
 'Изберете распоред според бројот учесници и форматот; не доделувајте почесна страна по претпоставка.',
 'Подгответе таблички, поглед кон сцената и план што го одобрува надлежниот протокол.'
 ],[
 'Verify official capacities, titles and delegated representation.',
 'Distinguish state, diplomatic, organisational and agreed working precedence.',
 'Select layout for numbers and format; never guess the position of honour.',
 'Prepare nameplates and audience viewpoint for competent protocol approval.'
 ],'ELEVATED'),
 item('motorcade','Кортеж, пристигнување и пречек','Motorcade, arrival and reception',[
 'Утврдете ја службената категорија на посетата и надлежното тело за транспорт и пречек.',
 'Усогласете јавна логистика и пристапност со овластениот протокол и службите за безбедност.',
 'Проверете ги применливите правила за знамиња на службени возила.',
 'Оставете маршрути, заштитни формации, оперативни времиња и детали за обезбедување исклучиво на надлежните служби.'
 ],[
 'Confirm the visit category and competent transport/reception authority.',
 'Coordinate public-facing logistics and accessibility with authorised protocol/security teams.',
 'Check rules for flags on official vehicles.',
 'Leave routes, protective formations, operational timings and security deployment to competent services.'
 ],'HIGH'),
 item('formal_dining','Свечена маса, ручек или вечера','Formal dining and banquet',[
 'Утврдете домаќин, почесен гостин, состав на делегации и вид на маса.',
 'Проверете го релевантниот пресеанс и направете условен план на седење.',
 'Разгледајте толкувачи, придружба, пристапност, исхрана, алергии, називи на јадења и културни чувствителности.',
 'Потврдете име на картички, послужување, здравици и сценарио за фотографирање со човечки организатор.'
 ],[
 'Identify host, guest of honour, delegations and table format.',
 'Verify applicable precedence and draft a conditional seating plan.',
 'Review interpreters, companions, accessibility, dietary requirements, allergies and cultural needs.',
 'Confirm place cards, service, toasts and photography with the responsible organiser.'
 ],'ELEVATED'),
 item('conferences','Конференции, самити и потпишувања','Conferences, summits and signings',[
 'Проверете домаќинство, мандат, листа делегати, потврдени говорници и протокол на настанот.',
 'Подгответе условен сценски распоред, таблички, знамиња, почетна и завршна програма.',
 'Проверете толкувачи, работни јазици, достапност, микрофони и медиумски позиции.',
 'Одобрете го финалниот говорен и церемонијален ред со надлежните лица.'
 ],[
 'Verify host, mandate, confirmed delegates, speakers and governing event protocol.',
 'Draft stage positions, nameplates, flags, opening and closing running order.',
 'Check interpreters, working languages, accessibility, microphones and media positions.',
 'Seek final speaker and ceremony sequence approval from competent authorities.'
 ],'ELEVATED'),
 item('correspondence','Покани и дипломатска преписка','Diplomatic invitations and correspondence',[
 'Потврдете кој има надлежност да го потпише и испрати документот.',
 'Изберете соодветен вид комуникација според институцијата и примателот.',
 'Проверете титули, обраќање, јазик, датум и протоколарни формулации.',
 'Издадете редакциски нацрт за овластена проверка, не службен готов акт.'
 ],[
 'Confirm who has authority to sign and send the document.',
 'Select the proper communication form for recipient and institution.',
 'Check titles, address forms, language, dates and protocol formulae.',
 'Produce an editorial draft for authorised review, not an executed official instrument.'
 ]),
 item('public_relations','Односи со јавност и медиуми','Public relations and media',[
 'Дефинирајте целна публика, проверени факти и лице овластено за јавно говорење.',
 'Подгответе главна порака, можни прашања, одобрени цитати и список извори.',
 'Проверете знамиња, логоа, прес-позиции, дозволи за снимање и титлови.',
 'Пред објавување обезбедете редакциско и институционално одобрување.'
 ],[
 'Define audience, verified facts and authorised spokesperson.',
 'Prepare key message, potential questions, approved quotations and source list.',
 'Check flags, logos, media positions, filming rights and captions.',
 'Secure editorial and institutional sign-off before publication.'
 ]),
 item('security','Јавна безбедност и план за непредвидени ситуации','Public safety and contingency',[
 'Назначете надлежни контактни лица за протокол, пристапност, здравство, техничка поддршка и безбедност.',
 'Проверете јавни дозволи, капацитет на просторот, пристапност и план за итни известувања.',
 'Одделете јавни информации од доверливи оперативни податоци.',
 'Заштитни движења, контрола на лица и оперативни безбедносни процедури ги планираат овластени служби.'
 ],[
 'Identify responsible protocol, accessibility, health, technical and security contacts.',
 'Check public permissions, venue capacity, accessibility and emergency communications.',
 'Separate public planning information from confidential operational data.',
 'Protective movements, screening and operational security procedures remain with competent services.'
 ],'HIGH'),
 item('communicology','Комуникологија и толкување','Communicology and interpretation',[
 'Разликувајте проверен факт, службен став, интерпретација и перцепција.',
 'Утврдете публика, културни чувствителности, работни јазици и канали.',
 'Проверете точни титлови, невербална комуникација и пристапност.',
 'Предвидете механизам за исправка, повратна врска и одговорно архивирање.'
 ],[
 'Separate verified fact, official position, interpretation and perception.',
 'Identify audience, cultural sensitivities, languages and channels.',
 'Check accurate captions, non-verbal communication and accessibility.',
 'Prepare correction, feedback and responsible records management.'
 ]),
 item('ai_ar','ВИ и AR/2D протоколарна визуелизација','AI and AR/2D protocol visualisation',[
 'Утврдете дали е потребен текстуален совет, 2D скица или вистинска AR-визуелизација — не се исти функции.',
 'Проверете точни димензии и релевантен пресеанс пред моделирање на распоред.',
 'Означете ја секоја симулација како илустративна до одобрување.',
 'Не снимајте лица и приватни локации без соодветна дозвола.'
 ],[
 'Choose textual advice, 2D sketch or genuine AR visualisation; these are different features.',
 'Verify dimensions and applicable precedence before modelling the arrangement.',
 'Label simulations illustrative pending approval.',
 'Do not capture people or private sites without authorisation.'
 ]),
 item('other','Друго протоколарно прашање','Other protocol matters',[
 'Разјаснете го типот на настанот, домаќинот, институцијата и целта.',
 'Одвојте законска норма, меѓународна практика и организациски договор.',
 'Пронајдете ја надлежната правна и протоколарна референца.',
 'Предложете одговорна работна постапка со човечко одобрување.'
 ],[
 'Clarify event type, host, organisation and purpose.',
 'Separate binding law, international practice and agreed house rules.',
 'Locate the relevant legal and protocol authority.',
 'Suggest a provisional accountable workflow requiring human approval.'
 ])
]);


/* Safe, deterministic text-intent suggestion, NOT a law or jurisdiction classifier.
 * Examples: "знамиња на моторкејд" enters the safety-aware motorcade track.
 */
export function inferPracticalCase(question){
 const q=String(question||'').normalize('NFKC').toLowerCase().slice(0,2000);
 if(/кортеж|моторкејд|моторкад|motorcade|convoy|motorkejd|kortez|службен.*возил/.test(q))return 'motorcade';
 if(/прес-конференц|пресс-конференц|press conference|spokesperson|портпарол/.test(q))return 'public_relations';
 if(/знам(е|иња)|znaminj|zname|flags?|flagpole|јарбол|државн.*симбол/.test(q))return 'flags';
 if(/химн|himn|anthem|national song/.test(q))return 'anthems';
 if(/свечен.*(?:ручек|вечер)|ручек|вечера|банкет|банкетн|ruchek|rucek|vechera|vecera|dinner|luncheon|banquet|формалн.*маса/.test(q))return 'formal_dining';
 if(/конференц|konferenc|самит|потпишува|conference|summit|signing ceremony/.test(q))return 'conferences';
 if(/пресеанс|претседавањ|распоред.*седењ|седењ|sedenje|precedence|seating plan|seat of hono[u]?r/.test(q))return 'precedence';
 if(/дипломатск.*покан|нота вербал|кореспонденц|official invitation|note verbale|diplomatic correspondence/.test(q))return 'correspondence';
 if(/односи со јавност|медиум|изјава|редакциск|media relations|public relations|press release/.test(q))return 'public_relations';
 if(/обезбедувањ|безбедност|bezbednost|евакуац|security|safety|emergency plan/.test(q))return 'security';
 if(/комуниколог|толкувач|невербалн|communicolog|interpretation|public speaking/.test(q))return 'communicology';
 if(/(?:^|[^\p{L}])(?:ai|ar)(?:$|[^\p{L}])|вештачка интелигенц|проширена реалност|augmented reality/u.test(q))return 'ai_ar';
 return 'other';
}

export const EVENT_TYPES=Object.freeze([
 {id:'state',mk:'Државен / официјален настан',en:'State / official event'},
 {id:'diplomatic',mk:'Дипломатска мисија / посета',en:'Diplomatic mission / visit'},
 {id:'international',mk:'Меѓународна организација',en:'International organisation'},
 {id:'institutional',mk:'Институционален / академски настан',en:'Institutional / academic event'},
 {id:'private',mk:'Приватен / хотелски настан',en:'Private / hospitality event'}
]);
export const JURISDICTIONS=Object.freeze([
 {id:'unknown',mk:'Правниот режим не е утврден',en:'Governing jurisdiction unknown'},
 {id:'mk',mk:'Република Северна Македонија',en:'Republic of North Macedonia'},
 {id:'un',mk:'Седиште на ОН — Њујорк',en:'United Nations Headquarters'},
 {id:'us',mk:'Соединети Американски Држави',en:'United States'},
 {id:'other',mk:'Друга држава / организација',en:'Other state / organisation'}
]);
const reference=(id,title,url,jurisdiction,status)=>Object.freeze({id,title,url,jurisdiction,status});
export const PROTOCOL_REFERENCES=Object.freeze([
 reference('WPA-12','WPA Official Event Quick Check — 12-point educational checklist',
 'https://worldprotocolacademy.mk/resources/official-event-quick-check/','all',
 'WPA_EDUCATIONAL_METHOD_NOT_STATE_LAW'),
 reference('UN-MANUAL','UN Protocol and Liaison Service — Manual of Protocol',
 'https://www.un.org/dgacm/en/content/protocol/manual-of-protocol','un',
 'OFFICIAL_UN_HEADQUARTERS_ONLY'),
 reference('MK-LEGAL-REGISTER','Ministry of Justice LDBIS — law 32/97, related amendment 110/08',
 'https://ldbis.pravda.gov.mk/PregledNaZakon.aspx?id=4515','mk',
 'ACTIVE_BASE_TEXT_WITH_2008_AMENDMENT_CONSOLIDATED_ARTICLES_NOT_VERIFIED'),
 reference('MK-1997','ENER — Law on Use of Coat of Arms, Flag and Anthem (1997 base text)',
 'https://ener.gov.mk/files/propisi_files/documents/284_%D0%97%D0%B0%D0%BA%D0%BE%D0%BD%20%D0%B7%D0%B0%20%D1%83%D0%BF%D0%BE%D1%82%D1%80%D0%B5%D0%B1%D0%B0%20%D0%BD%D0%B0%20%D0%B3%D1%80%D0%B1%D0%BE%D1%82%2C%20%D0%B7%D0%BD%D0%B0%D0%BC%D0%B5%D1%82%D0%BE%20%D0%B8%20%D1%85%D0%B8%D0%BC%D0%BD%D0%B0%D1%82%D0%B0%20%D0%BD%D0%B0%20%D0%A0.pdf','mk',
 'HISTORICAL_TEXT_CURRENT_AMENDMENTS_UNVERIFIED'),
 reference('US-ARCHIVE','US Department of State — Protocol Reference (2021–2025 archived)',
 'https://2021-2025.state.gov/protocol-reference/','us',
 'ARCHIVED_US_SPECIFIC_GUIDANCE_NOT_UNIVERSAL')
]);
function clean(v,n=150){return String(v??'').normalize('NFC').replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);}
export function normaliseProtocolContext(raw={}){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('PROTOCOL_BAD_CONTEXT');
 const scenario=clean(raw.scenario,35)||'other';
 if(!PRACTICAL_CASES.some(c=>c.id===scenario))throw new Error('PROTOCOL_BAD_SCENARIO');
 const event_type=clean(raw.event_type,35)||'institutional';
 if(!EVENT_TYPES.some(e=>e.id===event_type))throw new Error('PROTOCOL_BAD_EVENT_TYPE');
 const jurisdiction=clean(raw.jurisdiction,35)||'unknown';
 if(!JURISDICTIONS.some(e=>e.id===jurisdiction))throw new Error('PROTOCOL_BAD_JURISDICTION');
 const n=raw.people_count===''||raw.people_count==null?null:Number(raw.people_count);
 if(n!==null&&(!Number.isInteger(n)||n<1||n>50000))throw new Error('PROTOCOL_BAD_PEOPLE_COUNT');
 return Object.freeze({scenario,event_type,jurisdiction,people_count:n,
  host:clean(raw.host,100),guest:clean(raw.guest,100),
  venue:clean(raw.venue,100),country_or_body:clean(raw.country_or_body,100),
  participants:clean(raw.participants,180),question:clean(raw.question,300)});
}
export function buildProtocolBrief(raw,{lang='mk'}={}){
 const p=normaliseProtocolContext(raw),l=lang==='en'?'en':'mk';
 const item=PRACTICAL_CASES.find(c=>c.id===p.scenario);
 const needed=[];
 if(p.jurisdiction==='unknown')needed.push(l==='en'?'Applicable jurisdiction':'Применлив правен режим');
 if(p.jurisdiction==='other'&&!p.country_or_body)needed.push(l==='en'?'Exact country/organisation':'Конкретна држава/организација');
 if(!p.host)needed.push(l==='en'?'Formal host':'Формален домаќин');
 if(!p.venue)needed.push(l==='en'?'Venue and viewpoint':'Место и насока на гледање');
 if(['flags','anthems','precedence','motorcade','formal_dining'].includes(p.scenario)&&!p.guest)
  needed.push(l==='en'?'Delegation and guest rank':'Делегација и ранг на гостинот');
 if(['flags','anthems'].includes(p.scenario)&&!p.participants)
  needed.push(l==='en'?'Countries, organisations and symbols involved':'Земји, организации и вклучени симболи');
 const checks=l==='en'?[
  'Identify who has the mandate to decide and which rules are currently applicable.',
  'Confirm official titles, participants, precedence and event format.',
  'Check venue, viewpoint, accessibility, technical requirements and current sources.',
  'Record who must approve the outcome before official use.'
 ]:[
  'Утврдете ја надлежноста за одлука и важечките правила.',
  'Проверете ги функциите, учесниците, пресеансот и форматот.',
  'Проверете место, перспектива, пристапност, техника и актуелни извори.',
  'Запишете кој го одобрува конечниот распоред пред службена примена.'
 ];
 let visual=null;
 if(p.scenario==='flags')visual={kind:'flags',slots:['A','B','C'],
  note:l==='en'?'Unassigned slots (audience facing stage), NOT precedence.':
   'Недоделени позиции (поглед кон сцената), НЕ пресеанс.'};
 if(p.scenario==='formal_dining')visual={kind:'dining',slots:['1','2','3','4','5','6','7','8'],
  note:l==='en'?'Illustrative eight-seat table, no guest-of-honour assignment.':
  'Примерна маса со осум места, без одредување на почесно место.'};
 if(p.scenario==='conferences')visual={kind:'conference',slots:['A','B','C','D'],
  note:l==='en'?'Illustrative panel; seat order not determined.':
  'Примерна панел-маса; редоследот на места не е определен.'};
 return Object.freeze({
  schema:VERSION,lang:l,context:p,scenario_label:item[l],
  event_label:EVENT_TYPES.find(x=>x.id===p.event_type)[l],
  checks,steps:item[l==='en'?'enSteps':'mkSteps'],
  needed,references:PROTOCOL_REFERENCES.filter(x=>x.jurisdiction==='all'||x.jurisdiction===p.jurisdiction),
  visual,source_status:'EDUCATIONAL_PREPARATION_AND_SCOPED_SOURCE_LEADS',
  status:'PROVISIONAL_NOT_OFFICIAL',
  legal_verified:false,precedence_verified:false,full_book_read:false,
  live_search_performed:false,model_invoked:false,ar_runtime_available:false,
  risk:item.risk,human_gate:'COMPETENT_PROTOCOL_AUTHORITY_APPROVAL_REQUIRED',
  operational_security_data_prohibited:p.scenario==='motorcade'||p.scenario==='security'
 });
}
export function protocolBriefMarkdown(b){
 if(b?.schema!==VERSION)throw new Error('PROTOCOL_BAD_BRIEF');
 const en=b.lang==='en';const c=b.context;
 const h=en?'Preparatory protocol brief — NOT an official ruling':'Подготвителен протоколарен план — НЕ е службена одлука';
 const t=en?'Information missing':'Недостасуваат податоци';
 const lines=['# '+h,'',b.scenario_label+' · '+b.event_label,
  (en?'Host: ':'Домаќин: ')+(c.host||'—'),
  (en?'Guest: ':'Гостин: ')+(c.guest||'—'),
  (en?'Jurisdiction: ':'Правен режим: ')+c.jurisdiction,
  (en?'Venue: ':'Место: ')+(c.venue||'—'),
  '',en?'## Context and authority checks':'## Проверка на контекст и надлежност'];
 b.checks.forEach((x,i)=>lines.push((i+1)+'. '+x));
 lines.push('',en?'## Practical steps':'## Практични чекори');
 b.steps.forEach((x,i)=>lines.push((i+1)+'. '+x));
 lines.push('','## '+t);
 if(b.needed.length)b.needed.forEach(x=>lines.push('- '+x));
 else lines.push('- '+(en?'No required intake field missing':'Нема празно задолжително поле'));
 lines.push('',en?'## Source leads, not checked for current applicability':'## Изворни насоки, без проверка на тековната важност');
 b.references.forEach(x=>lines.push('- '+x.title+': '+x.url+' ['+x.status+']'));
 if(b.visual)lines.push('',b.visual.note);
 lines.push('',en?
  'Official flags, anthems and precedence may depend on binding local rules. An authorised human protocol officer must confirm before use.':
  'Знамињата, химните и пресеансот зависат од важечките прописи. Надлежен протоколарен службеник мора да ги потврди пред примена.');
 return lines.join('\n');
}
export function protocolQuestionForChat(b,maxChars=1600){
 if(b?.schema!==VERSION)throw new Error('PROTOCOL_BAD_BRIEF');
 const c=b.context,en=b.lang==='en';
 const lines=en?[
  'Prepare a context-specific practical plan for '+b.scenario_label+'.',
  'Event: '+b.event_label+'; regime: '+c.jurisdiction+(c.country_or_body?' / '+c.country_or_body:'')+
  '; host: '+(c.host||'unknown')+'; guest: '+(c.guest||'unknown')+'; venue: '+(c.venue||'unknown')+'.',
  'Countries and roles: '+(c.participants||'unconfirmed')+'. My question: '+(c.question||'give a practical example')+'.',
  'Separate documented jurisdictional rules from illustrative planning; do not invent flag ordering, anthem sequence, precedence or motorcade security arrangements. Provide steps, checks, limits and competent human approval.'
 ]:[
  'Подготви контекстуален практичен план за '+b.scenario_label+'.',
  'Настан: '+b.event_label+'; правен режим: '+c.jurisdiction+(c.country_or_body?' / '+c.country_or_body:'')+
  '; домаќин: '+(c.host||'непознат')+'; гостин: '+(c.guest||'непознат')+'; место: '+(c.venue||'непознато')+'.',
  'Земји и функции: '+(c.participants||'не се потврдени')+'. Прашање: '+(c.question||'дај практичен пример')+'.',
  'Разграничи важечки извори од илустрација; не измислувај редослед на знамиња, химни, пресеанс или безбедносен распоред на кортеж. Дај чекори, проверки, ограничувања и надлежно човечко одобрување.'
 ];
 return clean(lines.join('\n'),Math.min(1600,Math.max(100,maxChars)));
}

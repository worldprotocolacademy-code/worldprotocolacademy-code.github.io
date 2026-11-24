import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VERSION,PRACTICAL_CASES,EVENT_TYPES,JURISDICTIONS,
 PROTOCOL_REFERENCES,inferPracticalCase,normaliseProtocolContext,buildProtocolBrief,
 protocolBriefMarkdown,protocolQuestionForChat}
 from '../scripts/virtual-sande-protocol-practice.mjs';
const byId=new Map(PRACTICAL_CASES.map(x=>[x.id,x]));
const sample={scenario:'flags',event_type:'diplomatic',jurisdiction:'mk',
 host:'Министерство',guest:'Странска делегација',venue:'сала — поглед од публиката',
 participants:'Северна Македонија и Франција',
 question:'Како да ги наредам националните знамиња?'};

test('twelve cases span flags, anthems, motorcades, dining, conferences, PR, communication and AI/AR',()=>{
 assert.equal(VERSION,'wpa-practical-protocol/0.1');
 assert.equal(PRACTICAL_CASES.length,12);
 for(const id of ['flags','anthems','precedence','motorcade','formal_dining','conferences',
  'correspondence','public_relations','security','communicology','ai_ar','other'])assert.ok(byId.has(id));
 assert.equal(EVENT_TYPES.length,5);
 assert.equal(JURISDICTIONS.length,5);
 assert.ok(PROTOCOL_REFERENCES.some(x=>x.id==='WPA-12'));
});

test('visitors can write ordinary Macedonian, English or transliterated questions without choosing a scenario first',()=>{
 assert.equal(inferPracticalCase('Како се поставуваат две национални знамиња?'),'flags');
 assert.equal(inferPracticalCase('znaminja na sredba'),'flags');
 assert.equal(inferPracticalCase('Кој е редоследот на химните?'),'anthems');
 assert.equal(inferPracticalCase('himna na pokana'),'anthems');
 assert.equal(inferPracticalCase('motorcade flags for official arrival'),'motorcade');
 assert.equal(inferPracticalCase('кортеж на дипломат со знамиња'),'motorcade');
 assert.equal(inferPracticalCase('Правилен распоред за свечена вечера'),'formal_dining');
 assert.equal(inferPracticalCase('konferencija vo Ohrid'),'conferences');
 assert.equal(inferPracticalCase('press conference statement'),'public_relations');
 assert.equal(inferPracticalCase('пресеанс и седење'),'precedence');
 assert.equal(inferPracticalCase('безбедност на настан'),'security');
 assert.equal(inferPracticalCase('комуникологија и толкување'),'communicology');
 assert.equal(inferPracticalCase('AR и просторна реалност'),'ai_ar');
 assert.equal(inferPracticalCase('Здраво другар!'),'other');
});
test('context validation rejects fake jurisdiction, format, count and unknown agenda',()=>{
 assert.throws(()=>normaliseProtocolContext([]),/PROTOCOL_BAD_CONTEXT/);
 assert.throws(()=>normaliseProtocolContext({scenario:'tactical_protective_layout'}),/PROTOCOL_BAD_SCENARIO/);
 assert.throws(()=>normaliseProtocolContext({event_type:'kingdom_unofficial'}),/PROTOCOL_BAD_EVENT_TYPE/);
 assert.throws(()=>normaliseProtocolContext({jurisdiction:'global_one_rule'}),/PROTOCOL_BAD_JURISDICTION/);
 assert.throws(()=>normaliseProtocolContext({people_count:50001}),/PROTOCOL_BAD_PEOPLE_COUNT/);
 assert.throws(()=>normaliseProtocolContext({people_count:-4}),/PROTOCOL_BAD_PEOPLE_COUNT/);
 assert.throws(()=>normaliseProtocolContext({people_count:'two'}),/PROTOCOL_BAD_PEOPLE_COUNT/);
});

test('input is bounded and strips HTML-dangerous angle brackets, retains human host role',()=>{
 const context=normaliseProtocolContext({...sample,host:' <script> unsafe </script>   '+('X'.repeat(250)),
  question:'test <img src=x onerror=alert(1)> '+('Y'.repeat(400)),people_count:160});
 assert.equal(context.host.includes('<'),false);
 assert.equal(context.host.length,100);
 assert.equal(context.question.includes('>'),false);
 assert.equal(context.question.length,300);
 assert.equal(context.people_count,160);
});

test('Macedonian flags require law and viewing orientation, no invented automatic order',()=>{
 const b=buildProtocolBrief(sample);
 assert.equal(b.scenario_label,'Знамиња и државни симболи');
 assert.equal(b.risk,'ELEVATED');
 assert.equal(b.status,'PROVISIONAL_NOT_OFFICIAL');
 assert.equal(b.legal_verified,false);
 assert.equal(b.precedence_verified,false);
 assert.equal(b.live_search_performed,false);
 assert.equal(b.model_invoked,false);
 assert.equal(b.references.length,2);
 assert.ok(b.references.some(x=>x.id==='MK-1997'&&x.status.includes('UNVERIFIED')));
 assert.equal(b.visual.kind,'flags');
 assert.deepEqual(b.visual.slots,['A','B','C']);
 assert.match(b.visual.note,/НЕ пресеанс/);
 assert.ok(b.steps.some(x=>x.includes('перспектива')||x.includes('поглед')||x.includes('чија перспектива')));
 assert.ok(b.human_gate.includes('APPROVAL_REQUIRED'));
});

test('national anthem sequencing is never made universal, and default context needs clarification',()=>{
 const b=buildProtocolBrief({scenario:'anthems'});
 assert.ok(b.needed.includes('Применлив правен режим'));
 assert.ok(b.needed.includes('Делегација и ранг на гостинот'));
 assert.ok(b.needed.includes('Земји, организации и вклучени симболи'));
 assert.ok(b.steps.some(s=>s.includes('нема општоважечки')));
 assert.equal(b.legal_verified,false);
 assert.equal(b.visual,null);
});

test('official institutional sources are scoped by place and never mistaken for world rules',()=>{
 const UN=buildProtocolBrief({...sample,jurisdiction:'un'});
 const US=buildProtocolBrief({...sample,jurisdiction:'us'});
 const other=buildProtocolBrief({...sample,jurisdiction:'other',country_or_body:'Франција'});
 assert.ok(UN.references.some(x=>x.id==='UN-MANUAL'&&x.status.includes('HEADQUARTERS_ONLY')));
 assert.equal(UN.references.some(x=>x.id==='MK-1997'),false);
 assert.equal(US.references.some(x=>x.id==='US-ARCHIVE'),true);
 assert.equal(US.references.some(x=>x.id==='UN-MANUAL'),false);
 assert.deepEqual(other.references.map(x=>x.id),['WPA-12']);
 const unknown=buildProtocolBrief({...sample,jurisdiction:'other',country_or_body:''});
 assert.ok(unknown.needed.includes('Конкретна држава/организација'));
});

test('motorcade output is high-risk and never includes routes or protective formations as advice',()=>{
 const b=buildProtocolBrief({...sample,scenario:'motorcade'});
 assert.equal(b.risk,'HIGH');
 assert.equal(b.operational_security_data_prohibited,true);
 assert.match(b.steps.join(' '),/исклучиво на надлежните служби/);
 assert.equal(b.model_invoked,false);
 assert.equal(b.visual,null);
});
test('security planning is public, non-tactical, and human governed',()=>{
 const b=buildProtocolBrief({...sample,scenario:'security'});
 assert.equal(b.risk,'HIGH');
 assert.equal(b.operational_security_data_prohibited,true);
 assert.ok(b.steps.some(x=>x.includes('доверливи оперативни')));
});
test('formal dinner generates an illustrative eight-seat table and no invented honour position',()=>{
 const b=buildProtocolBrief({...sample,scenario:'formal_dining'});
 assert.equal(b.visual.kind,'dining');
 assert.equal(b.visual.slots.length,8);
 assert.match(b.visual.note,/без одредување на почесно место/);
 assert.ok(b.steps.some(x=>x.includes('алергии')));
});
test('conference generates four unsigned panel positions',()=>{
 const b=buildProtocolBrief({...sample,scenario:'conferences'}, {lang:'en'});
 assert.equal(b.visual.kind,'conference');
 assert.deepEqual(b.visual.slots,['A','B','C','D']);
 assert.match(b.visual.note,/seat order not determined/);
});
test('AI/AR is explicit proposal only, not an available spatial runtime',()=>{
 const b=buildProtocolBrief({...sample,scenario:'ai_ar'});
 assert.equal(b.ar_runtime_available,false);
 assert.ok(b.steps.some(s=>s.includes('2D скица')));
});
test('Markdown export includes source status, responsible approval and does not assert a live model',()=>{
 const b=buildProtocolBrief(sample);
 const md=protocolBriefMarkdown(b);
 assert.match(md,/НЕ е службена одлука/);
 assert.match(md,/Проверка на контекст/);
 assert.match(md,/Практични чекори/);
 assert.match(md,/HISTORICAL_TEXT_CURRENT_AMENDMENTS_UNVERIFIED/);
 assert.match(md,/Надлежен протоколарен службеник/);
 assert.doesNotMatch(md,/GPT-6 live|automatically verified|AR is running/);
});
test('visitor gets a bounded question to submit with explicit human control',()=>{
 const b=buildProtocolBrief(sample);
 const q=protocolQuestionForChat(b);
 assert.ok(q.length<=1600);
 assert.match(q,/не измислувај редослед на знамиња/);
 assert.match(q,/надлежно човечко одобрување/);
 assert.match(q,/Македонија/); // context from participant names
 assert.throws(()=>protocolQuestionForChat({}),/PROTOCOL_BAD_BRIEF/);
});
test('long context remains bounded and cannot silently include HTML',()=>{
 const p=buildProtocolBrief({scenario:'other',question:'X'.repeat(900),
 host:'Y'.repeat(400),venue:'<svg onload=alert(1)>',participants:'Q'.repeat(500)});
 const q=protocolQuestionForChat(p);
 assert.ok(q.length<=1600);
 assert.equal(q.includes('<svg'),false);
});
test('client wiring offers an opt-in draft and never calls send() automatically',()=>{
 const s=readFileSync('scripts/virtual-sande-public-widget.js','utf8');
 assert.match(s,/virtual-sande-protocol-practice-ui\.mjs/);
 assert.match(s,/onCompose:function\(draft\)/);
 assert.match(s,/if \(protocolPractice\) protocolPractice\.reset\(\)/);
 const ui=readFileSync('scripts/virtual-sande-protocol-practice-ui.mjs','utf8');
 assert.match(ui,/function createProtocolPracticeStudio/);
 assert.match(ui,/onCompose\(protocolQuestionForChat\(current\)\)/);
 assert.match(ui,/fromChat.addEventListener\('click'/);
 assert.match(ui,/scenario.control.value=inferPracticalCase\(q\)/);
 assert.match(ui,/2D/);
 assert.doesNotMatch(ui,/navigator\.geolocation|navigator\.mediaDevices|eval\(/);
});
